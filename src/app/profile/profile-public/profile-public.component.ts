import { Component, Input, OnDestroy, OnInit, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';
import { faUserPlus, faUserClock } from '@fortawesome/free-solid-svg-icons';

import { Friendship, FriendshipState } from '../../friendship/friendship.model';
import { FriendshipService } from '../..//friendship/friendship.service';
import { UserInfoPublic, UserInfoSummary } from '../../user/user.model';
import { UserService } from '../../user/user.service';
import { ChatService } from 'src/app/chat/chat.service';
import { getFullName } from '../../shared/user-utils';
import { LOAD_FRIENDS_LIMIT, LOAD_MUTUAL_FRIENDS_LIMIT, USER_DEFAULT_IMG_ASSET } from '../../shared/constants';
import { NotificationsService } from 'src/app/notifications/notifications.service';

const SPINNER_PROFILE_FETCH_MSG = 'Fetching profile...';
const SPINNER_FRIENDSHIP_ACCEPT_MSG = 'Accepting friend request...';
const SPINNER_FRIENDSHIP_REJECT_MSG = 'Rejecting friend request...';
const SPINNER_FRIENDSHIP_ADD_MSG = 'Making friend request...';
const SPINNER_FRIENDSHIP_DELETE_MSG = 'Cancelling friend request...';
const SPINNER_SEND_MESSAGE_MSG = 'Loading conversation...';

@Component({
    selector: 'app-profile-public',
    templateUrl: './profile-public.component.html',
    styleUrls: ['./profile-public.component.scss']
})
export class ProfilePublicComponent implements OnInit, OnDestroy {
    @Input() userId: string;
    @Output() backEvent = new EventEmitter<boolean>();
    @Output() deleteFriendRequestEvent = new EventEmitter<string>();
    @Output() acceptFriendRequestEvent = new EventEmitter<string>();
    @Output() createFriendRequestEvent = new EventEmitter<string>();

    // font-awesome icons
    faUserPlus = faUserPlus;
    faUserClock = faUserClock;

    currUserId: string;
    currUserName: string;

    userInfo: UserInfoPublic;
    userProfileImgUrl = USER_DEFAULT_IMG_ASSET;
    currUserInfoSubscription: Subscription;
    userProfileImgUrlMap: {[key: string]: string} = {};

    // variables related to friendship status
    friendshipInfo: Friendship;
    isFriend: boolean;
    friendRequestSent: boolean; // true if there is a friend request sent
    friendRequestReceived: boolean;

    // variable for mutual friends array
    mutualFriendArr: UserInfoSummary[] = [];
    endOfMutualFriendLoad = false;
    mutualFriendCount: number;

    // variable for friends array
    friendArr: UserInfoSummary[] = [];
    endOfFriendLoad = false;
    friendCount: number;

    // friendship_state constants
    FRIENDSHIP_ACCEPTED = FriendshipState.ACCEPTED;
    FRIENDSHIP_PENDING = FriendshipState.PENDING;
    FRIENDSHIP_NONE = FriendshipState.NONE;

    spinnerMsg = '';

    constructor(
        private router: Router,
        private spinner: NgxSpinnerService,
        private userService: UserService,
        private friendshipService: FriendshipService,
        private chatService: ChatService,
        private notificationsService: NotificationsService
    ) { }

    ngOnInit(): void {
        this.spinnerMsg = SPINNER_PROFILE_FETCH_MSG;
        this.spinner.show();
        this.currUserInfoSubscription = this.userService.currUserInfo.subscribe(
            res => {
                if (res) {
                    this.currUserId = res.user_id;
                    this.currUserName = getFullName(res.first_name, res.last_name);
                }
            },
            err => {
                console.log(err);
            }
        );

        // get profile image url
        this.userService.getUserPublicInfo(this.userId)
            .then((res: UserInfoPublic) => {
                this.userInfo = res;
                if (res.profile_image_extension) {
                    return this.userService.getProfileImageGetUrl(
                        res.user_id, res.profile_image_extension
                    );
                } else {
                    return Promise.resolve(USER_DEFAULT_IMG_ASSET);
                }
            })
            .then(res => {
                this.userProfileImgUrl = res;
            })
            .catch(() => {
                this.userProfileImgUrl = USER_DEFAULT_IMG_ASSET;
            });

        this.getFriendshipStatus(this.userId);
        this.getMutualFriends(this.userId, 0);
        this.getMutualFriendCount(this.userId);
        this.getFriends(this.userId, 0);
        this.getFriendCount(this.userId);
    }

    ngOnDestroy(): void {
        this.currUserInfoSubscription?.unsubscribe();
    }

    getFriendshipStatus(userId: string): void {
        this.friendshipService.checkFriendship(userId)
            .then((res: Friendship) => {
                if (res) {
                    this.friendshipInfo = res;
                    if (res.accepted_at) { // is friend
                        this.isFriend = true;
                        this.friendRequestSent = false;
                        this.friendRequestReceived = false;
                    } else if (this.currUserId === res.user_id1) { // not friend, friend request sent
                        this.isFriend = false;
                        this.friendRequestSent = true;
                        this.friendRequestReceived = false;
                    } else { // not friend, friend request received
                        this.isFriend = false;
                        this.friendRequestSent = false;
                        this.friendRequestReceived = true;
                    }
                } else { // not friend and no friend request sent/received
                    this.isFriend = false;
                    this.friendRequestSent = false;
                    this.friendRequestReceived = false;
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

    getMutualFriends(userId: string, offset: number): void {
        this.userService.getUserMutualFriends(userId, LOAD_MUTUAL_FRIENDS_LIMIT, offset)
            .then((res: UserInfoSummary[]) => {
                if (res.length < LOAD_MUTUAL_FRIENDS_LIMIT) {
                    this.endOfMutualFriendLoad = true;
                }
                this.mutualFriendArr = [ ...this.mutualFriendArr, ...res ];
                this.updateUserProfileImgUrlMap(res);
            })
            .catch(err => {
                console.log(err);
            });
    }

    getMutualFriendCount(userId: string): void {
        this.userService.getUserMutualFriendCount(userId)
            .then(res => {
                this.mutualFriendCount = res['count_1'];

            })
            .catch(err => {
                console.log(err);
            });
    }

    getFriends(userId: string, offset: number): void {
        this.userService.getUserFriends(userId, LOAD_FRIENDS_LIMIT, offset)
            .then((res: UserInfoSummary[]) => {
                if (res.length < LOAD_FRIENDS_LIMIT) {
                    this.endOfFriendLoad = true;
                }
                this.friendArr = [ ...this.friendArr, ...res ];
                this.updateUserProfileImgUrlMap(res);
            })
            .catch(err => {
                console.log(err);
            });
    }

    getFriendCount(userId: string): void {
        this.userService.getUserFriendCnt(userId)
            .then(res => {
                this.friendCount = res['count_1'];
            })
            .catch(err => {
                console.log(err);
            });
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

    onClickBack(): void {
        this.backEvent.emit(true);
    }

    addFriend(): void {
        if (!this.userInfo) { return; }
        this.spinnerMsg = SPINNER_FRIENDSHIP_ADD_MSG;
        this.spinner.show();
        this.friendshipService.addFriend(this.userInfo.user_id)
            .then(res => {
                if (res.success) {
                    this.isFriend = false;
                    this.friendRequestSent = true;
                    this.friendRequestReceived = false;
                    this.createFriendRequestEvent.emit(this.userInfo.user_id);
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

    acceptFriendRequest(): void {
        if (!this.userInfo) { return; }
        this.spinnerMsg = SPINNER_FRIENDSHIP_ACCEPT_MSG;
        this.spinner.show();
        this.friendshipService.acceptFriendRequest(this.userInfo.user_id)
            .then(res => {
                if (res.success) {
                    this.isFriend = true;
                    this.friendRequestSent = false;
                    this.friendRequestReceived = false;
                    const acceptUserId = this.friendshipInfo.user_id1 === this.currUserId ?
                        this.friendshipInfo.user_id2 : this.friendshipInfo.user_id1;
                    this.acceptFriendRequestEvent.emit(acceptUserId);
                    this.notificationsService.removeFriendRequest(acceptUserId);
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

    deleteFriend(): void {
        if (!this.userInfo) { return; }
        this.spinnerMsg = SPINNER_FRIENDSHIP_DELETE_MSG;
        this.spinner.show();
        this.friendshipService.deleteFriend(this.friendshipInfo.user_id1, this.friendshipInfo.user_id2)
            .then(res => {
                if (res.success) {
                    this.isFriend = false;
                    this.friendRequestSent = false;
                    this.friendRequestReceived = false;
                    this.deleteFriendRequestEvent.emit(this.friendshipInfo.user_id1 === this.currUserId ?
                        this.friendshipInfo.user_id2 : this.friendshipInfo.user_id1);
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

    deleteFriendRequest(): void {
        if (!this.userInfo) { return; }
        this.spinnerMsg = SPINNER_FRIENDSHIP_REJECT_MSG;
        this.spinner.show();
        this.friendshipService.deleteFriendRequest(this.userId)
            .then(res => {
                if (res.success) {
                    this.isFriend = false;
                    this.friendRequestSent = false;
                    this.friendRequestReceived = false;
                    const deleteUserId = this.friendshipInfo.user_id1 === this.currUserId ?
                        this.friendshipInfo.user_id2 : this.friendshipInfo.user_id1;
                    this.deleteFriendRequestEvent.emit(deleteUserId);
                    this.notificationsService.removeFriendRequest(deleteUserId);
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

    sendMessage(): void {
        if (!this.userInfo || !this.isFriend) { return; }
        this.spinnerMsg = SPINNER_SEND_MESSAGE_MSG;
        this.spinner.show();
        this.chatService.getDirectConversation(this.userInfo.user_id)
            .then((res: any) => {
                if (res && res.conversationId) {
                    return Promise.resolve({ conversationId: res.conversationId });
                } else {
                    return this.chatService.createConversation(
                        [this.userInfo.user_id], false, '');
                }
            })
            .then(res => {
                this.spinnerMsg = '';
                this.spinner.hide();
                this.router.navigate([`/chat/conversation/${res.conversationId}`], { queryParams: {
                    isGroup: 'false', title: '', recipientId: this.userInfo.user_id,
                    recipientName: getFullName(this.userInfo.first_name, this.userInfo.last_name),
                    recipientImgUrl: this.userProfileImgUrl
                }});
            })
            .catch(err => {
                console.log(err);
                this.spinnerMsg = '';
                this.spinner.hide();
            });
    }

    navigateToMyProfile(): void {
        this.router.navigate(['/profile/me']);
    }

    addFriendFromList(idx: number): void {
        // do nothing
        this.friendshipService.addFriend(this.friendArr[idx].user_id)
            .then(res => {
                if (res.success) {
                    this.friendArr[idx].friendship_state = this.FRIENDSHIP_PENDING;
                }
            })
            .catch(err => {
                console.log(err);
            });
    }
}
