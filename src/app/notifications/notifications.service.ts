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
                this.notificationCntSubject.next(
                    this.friendRequestUserArr.length + this.shareNotificationArr.length
                );
                this.friendRequestUserArrSubject.next(res);
            })
            .catch(() => {
                // do nothing
            });
        
        this.getUnreadShareNotifications()
            .then((res: ShareNotification[]) => {
                this.shareNotificationArr = res;
                this.notificationCntSubject.next(
                    this.friendRequestUserArr.length + this.shareNotificationArr.length
                );
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
        this.notificationCntSubject.next(
            this.friendRequestUserArr.length + this.shareNotificationArr.length
        );
        this.friendRequestUserArrSubject.next(this.friendRequestUserArr);
        /*****/
        this.sendRemoveFriendRequestMessage(userId);
    }

    public updateFriendshipRequests(requests: UserInfoSummary[]): void {
        this.friendRequestUserArr = requests;
        this.notificationCntSubject.next(
            requests.length + this.shareNotificationArr.length);
        this.friendRequestUserArrSubject.next(requests);
    }

    public sendShareNotification(url: string, title: string): Promise<any> {
        return this.http.post(
            `${USER_API_URL}/notifications/share`, { url, title }
        ).toPromise();
    }

    public getUnreadShareNotifications(): Promise<any> {
        return this.http.get(
            `${USER_API_URL}/notifications/share?is_read=false`
        ).toPromise();
    }

    public getShareNotificationsSent(limit: number, offset: number): Promise<any> {
        return this.http.get(
            `${USER_API_URL}/notifications/share/sent?limit=${limit}&offset=${offset}`
        ).toPromise();
    }

    public readShareNotification(eventId: string): Promise<any> {
        return this.http.post(
            `${USER_API_URL}/notifications/share/read`, [{ event_id: eventId }]
        ).toPromise();
    }

    public updateShareNotifications(res: ShareNotification[]): void {
        this.shareNotificationArr = res;
        this.notificationCntSubject.next(
            res.length + this.friendRequestUserArr.length);
        this.shareNotificationArrSubject.next(res);
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

    // Send the share notification that has been read
    public sendReadShareNotification(eventId: string): void {
        chrome.runtime.sendMessage(EXTENSION_ID, {
            type: 'read-share-notification',
            data: {
                eventId: eventId
            }
        });
    }

    private messageEventListener(event: MessageEvent): void {
        if (event.data.type === 'remove-friend-request') {
            this.friendRequestUserArr = this.friendRequestUserArr
                .filter((x: UserInfoSummary) => x.user_id !== event.data.data.userId);
            this.notificationCntSubject.next(
                this.friendRequestUserArr.length + this.shareNotificationArr.length);
            this.friendRequestUserArrSubject.next(this.friendRequestUserArr);
        } else if (event.data.type === 'update-friend-requests') {
            this.friendshipService.getFriendshipRequests()
                .then((res: UserInfoSummary[]) => {
                    this.updateFriendshipRequests(res);
                })
                .catch(err => {
                    console.log(err);
                });
        } else if (event.data.type === 'read-share-notification') {
            this.shareNotificationArr = this.shareNotificationArr
                .filter((x: ShareNotification) => x.event_id !== event.data.data.eventId);
            this.notificationCntSubject.next(
                this.friendRequestUserArr.length + this.shareNotificationArr.length);
            this.shareNotificationArrSubject.next(this.shareNotificationArr);
        } else if (event.data.type === 'update-share-notifications') {
            this.getUnreadShareNotifications()
                .then((res: ShareNotification[]) => {
                    this.updateShareNotifications(res);
                })
                .catch(err => {
                    console.log(err);
                });
        }
    }
}
