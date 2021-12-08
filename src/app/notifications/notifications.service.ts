import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import { UserInfoSummary } from '../user/user.model';
import { FriendshipService } from '../friendship/friendship.service';
import { EXTENSION_ID, USER_API_URL } from '../shared/config';
import { ShareNotification } from './notifications.model';

@Injectable({
    providedIn: 'root'
})
export class NotificationsService implements OnDestroy {

    private notificationCnt = 0;
    public notificationCntSubject = new BehaviorSubject<number>(0);

    private friendRequestUserArr: UserInfoSummary[] = [];
    public friendRequestUserArrSubject = new BehaviorSubject<UserInfoSummary[]>(this.friendRequestUserArr);

    private shareNotificationArr: ShareNotification[] = [];
    public shareNotificationArrSubject = new BehaviorSubject<ShareNotification[]>(this.shareNotificationArr);

    constructor(
        private http: HttpClient,
        private friendshipService: FriendshipService
    ) {
        friendshipService.getFriendshipRequests()
            .then((res: UserInfoSummary[]) => {
                this.friendRequestUserArr = res;
                this.notificationCnt += res.length;
                this.notificationCntSubject.next(this.notificationCnt);
                this.friendRequestUserArrSubject.next(res);
            })
            .catch(() => {
                // do nothing
            });
        
        this.getUnreadShareNotifications()
            .then((res: ShareNotification[]) => {
                this.shareNotificationArr = res;
                this.notificationCnt += res.length;
                this.notificationCntSubject.next(this.notificationCnt);
                this.shareNotificationArrSubject.next(res);
            })
            .catch(() => {
                // do nothing
            });

        window.addEventListener('message',
            this.messageEventListener.bind(this));
    }

    ngOnDestroy(): void {
        window.removeEventListener('message',
            this.messageEventListener.bind(this));
    }

    public removeFriendRequest(userId: string): void {
        /*** Remove the following lines after migration ***/
        this.friendRequestUserArr = this.friendRequestUserArr
            .filter((x: UserInfoSummary) => x.user_id !== userId);
        this.notificationCntSubject.next(this.friendRequestUserArr.length);
        this.friendRequestUserArrSubject.next(this.friendRequestUserArr);
        /*****/
        this.sendUpdateCntMessage(this.friendRequestUserArr.length); // TODO - remove once migrated
        this.sendRemoveFriendRequestMessage(userId);
    }

    public updateFriendshipRequests(requests: UserInfoSummary[]): void {
        this.friendRequestUserArr = requests;
        this.notificationCntSubject.next(requests.length);
        this.friendRequestUserArrSubject.next(requests);
        this.sendUpdateCntMessage(requests.length);
    }

    // Send the updated count to background.js to udpate the extension badge text
    private sendUpdateCntMessage(cnt: number): void {
        chrome.runtime.sendMessage(EXTENSION_ID, {
            type: 'update-notification-cnt',
            data: {
                notificationCnt: cnt
            }
        });
    }

    // Send the friend request that has been either accepted or declined
    private sendRemoveFriendRequestMessage(userId: string): void {
        chrome.runtime.sendMessage(EXTENSION_ID, {
            type: 'remove-friend-request',
            data: {
                userId: userId
            }
        });
    }

    private getUnreadShareNotifications(): Promise<any> {
        return this.http.get(
            `${USER_API_URL}/notifications/share?is_read=false`
        ).toPromise();
    }

    private messageEventListener(event: MessageEvent): void {
        if (event.data.type === 'remove-friend-request') {
            this.friendRequestUserArr = this.friendRequestUserArr
                .filter((x: UserInfoSummary) => x.user_id !== event.data.data.userId);
            this.notificationCntSubject.next(this.friendRequestUserArr.length);
            this.friendRequestUserArrSubject.next(this.friendRequestUserArr);
        } else if (event.data.type === 'update-friend-request') {
            this.friendshipService.getFriendshipRequests()
                .then((res: UserInfoSummary[]) => {
                    this.updateFriendshipRequests(res);
                })
                .catch(err => {
                    console.log(err);
                });
        }
    }
}
