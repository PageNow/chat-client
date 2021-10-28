import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { UserInfoSummary } from '../user/user.model';
import { FriendshipService } from '../friendship/friendship.service';

@Injectable({
    providedIn: 'root'
})
export class NotificationsService {

    private friendRequestUserArr: UserInfoSummary[] = [];
    public notificationCntSubject = new BehaviorSubject<number>(0);
    public friendRequestUserArrSubject = new BehaviorSubject<UserInfoSummary[]>(this.friendRequestUserArr);

    constructor(
        private friendshipService: FriendshipService
    ) {
        friendshipService.getFriendshipRequests()
            .then((res: UserInfoSummary[]) => {
                this.friendRequestUserArr = res;
                this.notificationCntSubject.next(res.length);
                this.friendRequestUserArrSubject.next(res);
            })
            .catch(err => {
                console.log(err);
            });
    }

    public removeFriendRequest(userId: string): void {
        this.friendRequestUserArr = this.friendRequestUserArr
            .filter((x: UserInfoSummary) => x.user_id !== userId);
        this.notificationCntSubject.next(this.friendRequestUserArr.length);
        this.friendRequestUserArrSubject.next(this.friendRequestUserArr);
    }

    public publishFriendRequestUserArr(friendRequestUserArr: UserInfoSummary[]): void {
        this.friendRequestUserArr = friendRequestUserArr;
        this.friendRequestUserArrSubject.next(friendRequestUserArr);
    }

    public refreshFriendRequests(): void {
        this.friendshipService.getFriendshipRequests()
            .then((res: UserInfoSummary[]) => {
                this.friendRequestUserArr = res;
                this.notificationCntSubject.next(res.length);
                this.friendRequestUserArrSubject.next(res);
            })
            .catch(err => {
                console.log(err);
            });
    }
}
