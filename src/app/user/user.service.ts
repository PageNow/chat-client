import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';

import { USER_API_URL } from '../shared/config';
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
                'Content-Type': 'application/json'
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

    public getUserPublicInfo(userId: string): Observable<any> {
        return this.http.get(
            `${USER_API_URL}/users/id/${userId}`,
            this.httpOptions
        );
    }

    public getUsersPublicInfo(userIdArr: string[]): Promise<any> {
        return this.http.get(
            `${USER_API_URL}/users/ids/${userIdArr}`,
            this.httpOptions
        ).toPromise();
    }

    public getProfileImageUploadUrl(imgExt: string): Observable<any> {
        return this.http.get(
            `${USER_API_URL}/users/me/profile-image-upload-url?image_ext=${imgExt}`,
            this.httpOptions
        );
    }

    public getProfileImageGetUrl(userId: string, imgExt: string): Observable<any> {
        return this.http.get(
            `${USER_API_URL}/users/id/${userId}/profile-image-url?image_ext=${imgExt}`,
            this.httpOptions
        );
    }

    public getProfileImageGetUrlArr(userIdArr: string[], imgExtArr: string[]): Observable<any> {
        return this.http.get(
            `${USER_API_URL}/users/ids/${userIdArr.join(',')}/profile-image-url?image_ext_arr=${imgExtArr.join(',')}`,
            this.httpOptions
        );
    }

    public deleteProfileIamge(): Observable<any> {
        return this.http.delete(
            `${USER_API_URL}/users/me/profile-image`,
            this.httpOptions
        );
    }
}
