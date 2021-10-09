import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';

import { USER_API_URL } from '../shared/config';
import { UserCreate, UserInfoPrivate, UserInfoUpdate } from './user.model';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    currUserInfo = new BehaviorSubject<UserInfoPrivate | null>(null);

    constructor(
        private http: HttpClient
    ) {
        this.getCurrentUserInfo()
            .then((res: UserInfoPrivate) => {
                this.publishCurrentUserInfo(res);
            })
            .catch(err => {
                this.currUserInfo.error(err);
            });
    }

    public getCurrentUserInfo(): Promise<any> {
        console.log('authService: calling /users/me');
        return this.http.get(`${USER_API_URL}/users/me`).toPromise();
    }

    public publishCurrentUserInfo(userInfo: UserInfoPrivate): void {
        this.currUserInfo.next(userInfo);
    }

    public createCurrentUserInfo(userInfo: UserCreate): Observable<any> {
        return this.http.post(
            `${USER_API_URL}/users/me`,
            JSON.stringify(userInfo)
        );
    }

    public updateCurrentUserInfo(userInfo: UserInfoUpdate): Promise<any> {
        return this.http.put(
            `${USER_API_URL}/users/me`,
            userInfo
        ).toPromise();
    }

    public getUserPublicInfo(userId: string): Promise<any> {
        return this.http.get(
            `${USER_API_URL}/users/id/${userId}`
        ).toPromise();
    }

    public getUsersPublicInfo(userIdArr: string[]): Promise<any> {
        return this.http.get(
            `${USER_API_URL}/users/ids/${userIdArr}`
        ).toPromise();
    }

    public getProfileImageUploadUrl(imgExt: string): Observable<any> {
        return this.http.get(
            `${USER_API_URL}/users/me/profile-image-upload-url?image_ext=${imgExt}`
        );
    }

    public getProfileImageGetUrl(userId: string, imgExt: string): Observable<any> {
        return this.http.get(
            `${USER_API_URL}/users/id/${userId}/profile-image-url?image_ext=${imgExt}`
        );
    }

    public getProfileImageGetUrlMap(userIdArr: string[], imgExtArr: string[]): Promise<any> {
        return this.http.get(
            `${USER_API_URL}/users/ids/${userIdArr.join(',')}/profile-image-url?image_ext_arr=${imgExtArr.join(',')}`
        ).toPromise();
    }

    public deleteProfileIamge(): Observable<any> {
        return this.http.delete(
            `${USER_API_URL}/users/me/profile-image`
        );
    }
}
