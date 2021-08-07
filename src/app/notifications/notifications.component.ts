import { Component, OnInit } from "@angular/core";
import { NgxSpinnerService } from "ngx-spinner";
import { forkJoin } from "rxjs";

import { FriendshipService } from "../friendship/friendship.service";
import { UserInfoSummary } from "../user/user.model";
import { UserService } from "../user/user.service";

const SPINNER_NOTIFICATION_FETCH_MSG = 'Fetching notifications...';
const SPINNER_FRIEND_ACCEPT_MSG = 'Accepting friend request...';
const SPINNER_FRIEND_DELETE_MSG = 'Deleting friend request...';

@Component({
    selector: 'app-notifications',
    templateUrl: './notifications.component.html',
    styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit {
    friendshipRequestUserArr: UserInfoSummary[] = [];
    profileImgUrlArr: string[] = [];

    spinnerMsg = '';

    constructor(
        private spinner: NgxSpinnerService,
        private userService: UserService,
        private friendshipService: FriendshipService
    ) { }

    ngOnInit(): void {
        this.spinnerMsg = SPINNER_NOTIFICATION_FETCH_MSG;
        this.spinner.show();
        this.friendshipService.getFriendshipRequests().toPromise()
            .then((res: UserInfoSummary[]) => {
                console.log(res);
                this.friendshipRequestUserArr = res;
                if (res.length > 0) {
                    this.getProfileImgArr(res);
                }
                this.spinner.hide();
            })
            .catch(err => {
                console.log(err);
                this.spinner.hide();
            });
    }

    getProfileImgArr(userInfoArr: UserInfoSummary[]): void {
        const profileImgUrlRequestArr = [];
        for (let i = 0; i < userInfoArr.length; i++) {
            profileImgUrlRequestArr.push(
                this.userService.getProfileImageGetUrl(
                    userInfoArr[i].user_uuid, userInfoArr[i].profile_image_extension
                )
            );
        }
        forkJoin(profileImgUrlRequestArr).subscribe(urlArr => {
            this.profileImgUrlArr = urlArr.map(x => x !== null ? x : '/assets/usre.png');
        });
    }

    acceptFriendRequest(userId: string): void {
        this.spinnerMsg = SPINNER_FRIEND_ACCEPT_MSG;
        this.spinner.show();
        this.friendshipService.acceptFriendRequest(userId).toPromise()
            .then(res => {
                console.log(res);
                this.friendshipRequestUserArr = this.friendshipRequestUserArr.filter(x => x.user_id !== userId);
                this.spinner.hide();
            })
            .catch(err => {
                console.log(err);
                this.spinner.hide();
            });
    }

    deleteFriendRequest(userId: string): void {
        this.spinnerMsg = SPINNER_FRIEND_DELETE_MSG;
        this.spinner.show();
        this.friendshipService.deleteFriendRequest(userId).toPromise()
            .then(res => {
                console.log(res);
                this.friendshipRequestUserArr = this.friendshipRequestUserArr.filter(x => x.user_id !== userId);
                this.spinner.hide();
            })
            .catch(err => {
                console.log(err);
                this.spinner.hide();
            });
    }
}