import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { USER_API_URL } from '../shared/config';

@Injectable({
    providedIn: 'root'
})
export class FriendshipService {
    httpOptions: any;

    constructor(
        private http: HttpClient,
    ) {
        console.log('friendship service constructor');
        this.httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
    }

    public getFriendshipRequests(): Promise<any> {
        return this.http.get(
            `${USER_API_URL}/friendship/requests`,
            this.httpOptions
        ).toPromise();
    }

    public checkFriendship(userId: string): Observable<any> {
        return this.http.get(
            `${USER_API_URL}/friendship/check/${userId}`,
            this.httpOptions
        );
    }

    public addFriend(userId: string): Promise<any> {
        const friendshipRequest = { user_id2: userId };
        return this.http.post(
            `${USER_API_URL}/friendship/requests`,
            friendshipRequest,
            this.httpOptions
        ).toPromise();
    }

    public deleteFriend(userId1: string, userId2: string): Promise<any> {
        const friendshipDeleteRequest = {
            user_id1: userId1,
            user_id2: userId2,
        };
        return this.http.post(
            `${USER_API_URL}/friendship/delete`,
            friendshipDeleteRequest,
            this.httpOptions
        ).toPromise();
    }

    public deleteFriendRequest(userId: string): Promise<any> {
        return this.http.delete(
            `${USER_API_URL}/friendship/requests/${userId}`,
            this.httpOptions
        ).toPromise();
    }

    public acceptFriendRequest(userId: string): Promise<any> {
        return this.http.post(
            `${USER_API_URL}/friendship/accept`,
            { user_id1: userId },
            this.httpOptions
        ).toPromise();
    }
}
