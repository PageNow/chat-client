import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

import { UserInfoSummary } from '../user/user.model';
import { FriendshipService } from "../friendship/friendship.service";

@Injectable({
    providedIn: 'root'
})
export class NotificationsService {
    
    public notificationCnt = 0;
    public notificationCntSubject = new BehaviorSubject<number>(this.notificationCnt);
    public friendRequestUserArrSubject = new BehaviorSubject<UserInfoSummary[]>([]); 

    constructor(
        friendshipService: FriendshipService
    ) {
        friendshipService.getFriendshipRequests()
            .then((res: UserInfoSummary[]) => {
                this.notificationCnt = res.length;
                this.notificationCntSubject.next(res.length);
                this.friendRequestUserArrSubject.next(res);
            })
            .catch(err => {
                console.log(err);
            })
    }

    public decrementNotificationCnt(): void {
        this.notificationCnt = this.notificationCnt - 1;
        this.notificationCntSubject.next(this.notificationCnt);
    }
}