import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';

import { Friendship } from 'src/app/friendship/friendship.model';
import { FriendshipService } from 'src/app/friendship/friendship.service';
import { UserInfoPublic } from 'src/app/user/user.model';
import { UserService } from 'src/app/user/user.service';

const SPINNER_PROFILE_FETCH_MSG = 'Fetching profile...';
const SPINNER_FRIENDSHIP_DELETE_MSG = 'Cancelling friendship...';

@Component({
    selector: 'app-profile-public',
    templateUrl: './profile-public.component.html',
    styleUrls: ['./profile-public.component.scss']
})
export class ProfilePublicComponent implements OnInit, OnDestroy {
    currUserUuid: string;
    userUuid: string;
    userInfo: UserInfoPublic
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
        private friendshipService: FriendshipService
    ) { }

    ngOnInit(): void {
        this.userUuid = window.location.href.split('/').slice(-1)[0];
        this.spinnerMsg = SPINNER_PROFILE_FETCH_MSG;
        this.spinner.show();
        this.currUserInfoSubscription = this.userService.currUserInfo.subscribe(
            res => {
                if (res) {
                    this.currUserUuid = res.user_uuid;
                }
            },
            err => {
                console.log(err);
            }
        )
        this.userService.getUserPublicInfo(this.userUuid).toPromise()
            .then((res: UserInfoPublic) => {
                console.log(res);
                this.userInfo = res;
                return this.userService.getProfileImageGetUrl(
                    res.user_uuid, res.profile_image_extension
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

    addFriend(): void {
        if (!this.userInfo) { return; }
        this.friendshipService.addFriend(this.userInfo.user_id).toPromise()
            .then(res => {
                console.log(res);
                if (res.success) {
                    this.isFriend = false;
                    this.isFriendRequestPending = true;
                }
            })
            .catch(err => {
                console.log(err);
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
            })
    }

    navigateToMyProfile(): void {
        this.router.navigate(['/profile/me']);
    }
}
