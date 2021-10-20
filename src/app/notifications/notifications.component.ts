import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';

import { FriendshipService } from '../friendship/friendship.service';
import { USER_DEFAULT_IMG_ASSET } from '../shared/constants';
import { UserInfoSummary } from '../user/user.model';
import { UserService } from '../user/user.service';
import { NotificationsService } from './notifications.service';

const SPINNER_FRIEND_ACCEPT_MSG = 'Accepting friend request...';
const SPINNER_FRIEND_DELETE_MSG = 'Deleting friend request...';

@Component({
    selector: 'app-notifications',
    templateUrl: './notifications.component.html',
    styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit, OnDestroy {
    friendRequestUserArrSubscription: Subscription;
    friendRequestUserArr: UserInfoSummary[] = [];
    userProfileImgUrlMap: {[key: string]: string} = {};
    userProfileImgExtMap: {[key: string]: string} = {};

    isNotificationLoaded = false;

    spinnerMsg = '';

    // variables for public profile component
    showProfile = false;
    profileId: string;

    constructor(
        private spinner: NgxSpinnerService,
        private userService: UserService,
        private friendshipService: FriendshipService,
        private notificationsService: NotificationsService
    ) { }

    ngOnInit(): void {
        this.friendRequestUserArrSubscription = this.notificationsService.friendRequestUserArrSubject.subscribe(
            (res: UserInfoSummary[]) => {
                console.log(res);
                this.friendRequestUserArr = res;
                this.updateUserProfileImgUrlMap(res);
                this.isNotificationLoaded = true;
            },
            err => {
                console.log(err);
                this.isNotificationLoaded = true;
            }
        );
    }

    ngOnDestroy(): void {
        this.friendRequestUserArrSubscription?.unsubscribe();
    }

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
                console.log(res);
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
                    // this.friendRequestUserArr = this.friendRequestUserArr.filter(
                    //     (x: UserInfoSummary) => x.user_id !== userId);
                    // this.notificationsService.decrementNotificationCnt();
                    // this.notificationsService.publishFriendRequestUserArr(this.friendRequestUserArr);
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
                    // this.friendRequestUserArr = this.friendRequestUserArr.filter(
                    //     (x: UserInfoSummary) => x.user_id !== userId);
                    // this.notificationsService.decrementNotificationCnt();
                    // this.notificationsService.publishFriendRequestUserArr(this.friendRequestUserArr);
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
        this.notificationsService.refreshFriendRequests();
    }

    onClickProfile(userInfo: UserInfoSummary): void {
        this.profileId = userInfo.user_id;
        this.showProfile = true;
    }

    onClickBack(): void {
        this.showProfile = false;
    }
}
