import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Auth } from 'aws-amplify';

import { USER_API_URL } from '../shared/constants';
import { UserInfoPrivate } from './user.model';
import { AuthService } from '../auth/auth.service';
import { AuthState } from '../auth/auth.model';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    authState: AuthState;

    constructor(
        private http: HttpClient,
        private authService: AuthService
    ) {
        console.log('user service constructor')
        this.authService.auth$.subscribe((authState: AuthState) => {
            this.authState = authState;
        });
    }

    public getCurrentUserInfo(): Observable<UserInfoPrivate> {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.authState.jwt}`
            })
        };
        return this.http.get<UserInfoPrivate>(`${USER_API_URL}/users/me`, httpOptions);
    }
}