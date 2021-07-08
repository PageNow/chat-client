import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { USER_API_URL } from '../shared/constants';
import { UserCreate, UserInfoPrivate, UserInfoUpdate } from './user.model';
import { AuthService } from '../auth/auth.service';
import { AuthState } from '../auth/auth.model';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    authState: AuthState;
    httpOptions: any;

    constructor(
        private http: HttpClient,
        private authService: AuthService
    ) {
        console.log('user service constructor');
        this.authService.auth$.subscribe((authState: AuthState) => {
            this.authState = authState;
            this.httpOptions = {
                headers: new HttpHeaders({
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${authState.jwt}`
                })
            }
        });
    }

    public getCurrentUserInfo(): Observable<any> {
        return this.http.get(`${USER_API_URL}/users/me`, this.httpOptions);
    }

    public submitCurrentUserInfo(userInfo: UserCreate): Observable<any> {
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

    public getProfileImageUploadUrl(): Observable<any> {
        return this.http.get(
            `${USER_API_URL}/users/me/profile-image-upload-url`,
            this.httpOptions
        );
    }

    public getProfileImageGetUrl(userUuid: string): Observable<any> {
        return this.http.get(
            `${USER_API_URL}/users/${userUuid}/profile-image-url`,
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
