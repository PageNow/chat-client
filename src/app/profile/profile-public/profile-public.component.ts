import { Component, Input, OnDestroy, OnInit, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';

import { Friendship } from '../../friendship/friendship.model';
import { FriendshipService } from '../..//friendship/friendship.service';
import { UserInfoPublic } from '../../user/user.model';
import { UserService } from '../../user/user.service';
import { ChatService } from 'src/app/chat/chat.service';
import { getFullName } from '../../shared/user_utils';

const SPINNER_PROFILE_FETCH_MSG = 'Fetching profile...';
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

    currUserId: string;
    currUserName: string;

    userInfo: UserInfoPublic;
    userProfileImgUrl = '/assets/user.png';
    currUserInfoSubscription: Subscription;

    isFriend: boolean;
    isFriendRequestPending: boolean;
    friendshipInfo: Friendship;

    spinnerMsg = '';

    constructor(
        private router: Router,
        private spinner: NgxSpinnerService,
        private userService: UserService,
        private friendshipService: FriendshipService,
        private chatService: ChatService
    ) { }

    ngOnInit(): void {
        console.log(this.userId);
        this.spinnerMsg = SPINNER_PROFILE_FETCH_MSG;
        this.spinner.show();
        this.currUserInfoSubscription = this.userService.currUserInfo.subscribe(
            res => {
                if (res) {
                    this.currUserId = res.user_id;
                    this.currUserName = getFullName(res.first_name, res.middle_name, res.last_name);
                }
            },
            err => {
                console.log(err);
            }
        );
        this.userService.getUserPublicInfo(this.userId)
            .then((res: UserInfoPublic) => {
                console.log(res);
                this.userInfo = res;
                return this.userService.getProfileImageGetUrl(
                    res.user_id, res.profile_image_extension
                ).toPromise();
            })
            .then(res => {
                this.userProfileImgUrl = res;
                return this.friendshipService.checkFriendship(this.userInfo.user_id).toPromise();
            })
            .then((res: Friendship) => {
                console.log(res);
                if (res) {
                    this.friendshipInfo = res;
                    if (res.accepted_at) {
                        this.isFriend = true;
                        this.isFriendRequestPending = false;
                    } else {
                        this.isFriend = false;
                        this.isFriendRequestPending = true;
                    }
                } else {
                    this.isFriend = false;
                    this.isFriendRequestPending = false;
                }
                this.spinner.hide();
            })
            .catch(err => {
                console.log(err);
                this.spinner.hide();
            });
    }

    ngOnDestroy(): void {
        this.currUserInfoSubscription?.unsubscribe();
    }

    onClickBack(): void {
        this.backEvent.emit(true);
    }

    addFriend(): void {
        if (!this.userInfo) { return; }
        this.spinnerMsg = SPINNER_FRIENDSHIP_ADD_MSG;
        this.spinner.show();
        this.friendshipService.addFriend(this.userInfo.user_id).toPromise()
            .then(res => {
                console.log(res);
                if (res.success) {
                    this.isFriend = false;
                    this.isFriendRequestPending = true;
                }
                this.spinner.hide();
            })
            .catch(err => {
                console.log(err);
                this.spinner.hide();
            });
    }

    deleteFriend(): void {
        if (!this.userInfo) { return; }
        this.spinnerMsg = SPINNER_FRIENDSHIP_DELETE_MSG;
        this.spinner.show();
        this.friendshipService.deleteFriend(this.friendshipInfo.user_id1, this.friendshipInfo.user_id2).toPromise()
            .then(res => {
                console.log(res);
                if (res.success) {
                    this.isFriend = false;
                    this.isFriendRequestPending = false;
                }
                this.spinner.hide();
            })
            .catch(err => {
                console.log(err);
                this.spinner.hide();
            });
    }

    sendMessage(): void {
        if (!this.userInfo || !this.isFriend) { return; }
        this.spinnerMsg = SPINNER_SEND_MESSAGE_MSG;
        this.spinner.show();
        this.chatService.getDirectConversation(this.userInfo.user_id)
            .then((res: any): Promise<any> => {
                console.log(res);
                if (res.data.conversationId === null) {
                    return this.chatService.createConversation(
                        [this.userInfo.user_id], false, '');
                } else {
                    return Promise.resolve({ data: { createConversation: { conversationId: res.data.getDirectConversation.conversationId }}});
                }
            })
            .then(res => {
                this.spinnerMsg = '';
                this.spinner.hide();
                this.router.navigate([`/chat/conversation/${res.data.createConversation.conversationId}`]);
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
}
