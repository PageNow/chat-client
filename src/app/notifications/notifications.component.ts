import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';
import { faRedo, faEnvelopeOpen } from '@fortawesome/free-solid-svg-icons';

import { FriendshipService } from '../friendship/friendship.service';
import { USER_DEFAULT_IMG_ASSET } from '../shared/constants';
import { UserInfoSummary } from '../user/user.model';
import { UserService } from '../user/user.service';
import { ShareNotification, ShareNotificationSent } from './notifications.model';
import { NotificationsService } from './notifications.service';
import { extractDomainFromUrl } from '../shared/url-utils';

const SPINNER_FRIEND_ACCEPT_MSG = 'Accepting friend request...';
const SPINNER_FRIEND_DELETE_MSG = 'Deleting friend request...';

const SHARE_NOTIFICATIONS_SENT_LIMIT = 15;
const SHARE_NOTIFICATIONS_SENT_INIT_OFFSET = 0;

@Component({
    selector: 'app-notifications',
    templateUrl: './notifications.component.html',
    styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit, OnDestroy {
    // notification subscription and data
    friendRequestUserArrSubscription: Subscription;
    friendRequestUserArr: UserInfoSummary[] = [];
    shareNotificationArrSubscription: Subscription;
    shareNotificationArr: ShareNotification[] = [];
    shareNotificationSentArr: ShareNotificationSent[] = [];

    userProfileImgUrlMap: {[key: string]: string} = {};
    userProfileImgExtMap: {[key: string]: string} = {};

    areFriendRequestsLoaded = false;
    areShareNotificationsLoaded = false;
    areShareNotificationsSentLoaded = false;

    spinnerMsg = '';

    // variables for public profile component
    showProfile = false;
    profileId: string;

    // variable for refreshing friendshipRequests
    isRefreshingFriendRequests = false;
    isRefreshingShareNotifications = false;
    isRefreshingShareNotificationsSent = false;

    // fontawesome icons
    faRedo = faRedo;
    faEnvelopeOpen = faEnvelopeOpen;

    constructor(
        private spinner: NgxSpinnerService,
        private userService: UserService,
        private friendshipService: FriendshipService,
        private notificationsService: NotificationsService
    ) { }

    ngOnInit(): void {
        this.friendRequestUserArrSubscription = this.notificationsService.friendRequestUserArrSubject.subscribe(
            (res: UserInfoSummary[]) => {
                this.friendRequestUserArr = res;
                this.updateUserProfileImgUrlMap(res);
                this.areFriendRequestsLoaded = true;
            },
            err => {
                console.log(err);
                this.areFriendRequestsLoaded = true;
            }
        );
        this.shareNotificationArrSubscription = this.notificationsService.shareNotificationArrSubject.subscribe(
            (res: ShareNotification[]) => {
                this.shareNotificationArr = res;
                this.updateUserProfileImgUrlMapShareNotification(res);
                this.areShareNotificationsLoaded = true;
            },
            err => {
                console.log(err);
                this.areShareNotificationsLoaded = true;
            }
        )
        this.notificationsService.getShareNotificationsSent(SHARE_NOTIFICATIONS_SENT_LIMIT, SHARE_NOTIFICATIONS_SENT_INIT_OFFSET)
            .then((res: ShareNotificationSent[]) => {
                this.shareNotificationSentArr = res;
                this.areShareNotificationsSentLoaded = true;
            })
            .catch(err => {
                console.log(err);
            });
    }

    ngOnDestroy(): void {
        this.friendRequestUserArrSubscription?.unsubscribe();
    }

    // Update the map of user id to profile image url by calling the backend
    // only for user ids that are not already in the map
    updateUserProfileImgUrlMap(userInfoArr: UserInfoSummary[]): void {
        let requestUserInfoArr = userInfoArr.filter((x: UserInfoSummary) =>
            !Object.prototype.hasOwnProperty.call(this.userProfileImgUrlMap, x.user_id));
        requestUserInfoArr.filter(x => x.profile_image_extension === null).forEach(x => {
            this.userProfileImgUrlMap[x.user_id] = USER_DEFAULT_IMG_ASSET;
        });
        requestUserInfoArr = requestUserInfoArr.filter(x => x.profile_image_extension);
        if (requestUserInfoArr.length > 0) {
            this.userService.getProfileImageGetUrlMap(
                requestUserInfoArr.map(x => x.user_id),
                requestUserInfoArr.map(x => x.profile_image_extension)
            ).then(res => {
                this.userProfileImgUrlMap = {
                    ...this.userProfileImgUrlMap,
                    ...res
                };
            })
            .catch(err => {
                console.log(err);
            });
        }
    }

    updateUserProfileImgUrlMapShareNotification(shareNotificationArr: ShareNotification[]): void {
        let requestShareNotificationArr = shareNotificationArr.filter((x: ShareNotification) =>
            !Object.prototype.hasOwnProperty.call(this.userProfileImgUrlMap, x.user_id));
        requestShareNotificationArr.filter(x => x.profile_image_extension === null).forEach(x => {
            this.userProfileImgUrlMap[x.user_id] = USER_DEFAULT_IMG_ASSET;
        });
        requestShareNotificationArr = requestShareNotificationArr.filter(x => x.profile_image_extension);
        if (requestShareNotificationArr.length > 0) {
            this.userService.getProfileImageGetUrlMap(
                requestShareNotificationArr.map(x => x.user_id),
                requestShareNotificationArr.map(x => x.profile_image_extension)
            ).then(res => {
                this.userProfileImgUrlMap = {
                    ...this.userProfileImgUrlMap,
                    ...res
                };
            })
            .catch(err => {
                console.log(err);
            });
        }
    }

    acceptFriendRequest(userId: string): void {
        this.spinnerMsg = SPINNER_FRIEND_ACCEPT_MSG;
        this.spinner.show();
        this.friendshipService.acceptFriendRequest(userId)
            .then(res => {
                if (res.success) {
                    this.notificationsService.removeFriendRequest(userId);
                }
                this.spinnerMsg = '';
                this.spinner.hide();
            })
            .catch(err => {
                console.log(err);
                this.spinnerMsg = '';
                this.spinner.hide();
            });
    }

    deleteFriendRequest(userId: string): void {
        this.spinnerMsg = SPINNER_FRIEND_DELETE_MSG;
        this.spinner.show();
        this.friendshipService.deleteFriendRequest(userId)
            .then(res => {
                if (res.success) {
                    this.notificationsService.removeFriendRequest(userId);
                }
                this.spinnerMsg = '';
                this.spinner.hide();
            })
            .catch(err => {
                console.log(err);
                this.spinnerMsg = '';
                this.spinner.hide();
            });
    }

    refreshFriendRequests(): void {
        this.isRefreshingFriendRequests = true;
        this.friendshipService.getFriendshipRequests()
            .then((res: UserInfoSummary[]) => {
                this.notificationsService.updateFriendshipRequests(res);
                this.isRefreshingFriendRequests = false;
            })
            .catch(err => {
                this.isRefreshingFriendRequests = false;
                console.log(err);
            });
    }

    readShareNotification(eventId: string): void {
        this.notificationsService.readShareNotification(eventId)
            .then(() => {
                // pass
                return this.notificationsService.sendReadShareNotification(eventId)
            })
            .catch(err => {
                console.log(err);
            });
    }

    refreshShareNotifications(): void {
        this.isRefreshingShareNotifications = true;
        this.notificationsService.getUnreadShareNotifications()
            .then((res: ShareNotification[]) => {
                this.notificationsService.updateShareNotifications(res);
                this.isRefreshingShareNotifications = false;
            })
            .catch(err => {
                console.log(err);
                this.isRefreshingShareNotifications = false;
            });
    }

    refreshShareNotificationsSent(): void {
        this.isRefreshingShareNotificationsSent = true;
        this.notificationsService.getShareNotificationsSent(SHARE_NOTIFICATIONS_SENT_LIMIT, SHARE_NOTIFICATIONS_SENT_INIT_OFFSET)
            .then((res: ShareNotificationSent[]) => {
                this.shareNotificationSentArr = res;
                this.isRefreshingShareNotificationsSent = false;
            })
            .catch(err => {
                console.log(err);
                this.isRefreshingShareNotificationsSent = false;
            })
    }

    onClickProfile(userInfo: UserInfoSummary): void {
        this.profileId = userInfo.user_id;
        this.showProfile = true;
    }

    onClickBack(): void {
        this.showProfile = false;
    }

    extractDomain(url: string): string {
        return extractDomainFromUrl(url);
    }
}
