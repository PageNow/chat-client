import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';

import { USER_API_URL } from '../shared/constants';
import { UserCreate, UserInfoPrivate, UserInfoUpdate } from './user.model';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    httpOptions: any;
    currUserInfo = new BehaviorSubject<UserInfoPrivate | null>(null);

    constructor(
        private http: HttpClient
    ) {
        console.log('user service constructor');
        this.httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
            })
        };
    }

    public getCurrentUserInfo(): Observable<any> {
        console.log('authService: calling /users/me');
        return this.http.get(`${USER_API_URL}/users/me`, this.httpOptions);
    }

    public publishCurrentUserInfo(userInfo: UserInfoPrivate): void {
        console.log(userInfo);
        this.currUserInfo.next(userInfo);
    }

    public createCurrentUserInfo(userInfo: UserCreate): Observable<any> {
        return this.http.post(
            `${USER_API_URL}/users/me`,
            JSON.stringify(userInfo),
            this.httpOptions
        );
    }

    public updateCurrentUserInfo(userInfo: UserInfoUpdate): Observable<any> {
        return this.http.put(
            `${USER_API_URL}/users/me`,
            JSON.stringify(userInfo),
            this.httpOptions
        );
    }

    public getUserPublicInfo(userUuid: string): Observable<any> {
        return this.http.get(
            `${USER_API_URL}/users/${userUuid}`,
            this.httpOptions
        );
    }

    public getProfileImageUploadUrl(imgExt: string): Observable<any> {
        return this.http.get(
            `${USER_API_URL}/users/me/profile-image-upload-url?image_ext=${imgExt}`,
            this.httpOptions
        );
    }

    public getProfileImageGetUrl(userUuid: string, imgExt: string): Observable<any> {
        return this.http.get(
            `${USER_API_URL}/users/${userUuid}/profile-image-url?image_ext=${imgExt}`,
            this.httpOptions
        );
    }

    public deleteProfileIamge(): Observable<any> {
        return this.http.delete(
            `${USER_API_URL}/users/me/profile-image`,
            this.httpOptions
        );
    }

    public checkFriendship(userId: string): Observable<any> {
        return this.http.get(
            `${USER_API_URL}/friendship/request/${userId}`,
            this.httpOptions
        );
    }

    public addFriend(userId: string): Observable<any> {
        const friendshipRequest = { user_id2: userId }
        return this.http.post(
            `${USER_API_URL}/friendship/request`,
            friendshipRequest,
            this.httpOptions
        );
    }
}
