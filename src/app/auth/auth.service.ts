import { Injectable, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { Auth } from 'aws-amplify';

import { AuthState, User } from './auth.model';
import { AUTH_STATE_KEY, DEFAULT_AUTH_STATE } from '../shared/constants';

@Injectable({
    providedIn: 'root'
})
export class AuthService implements OnDestroy  {
    private _authState = new Subject<AuthState>();
    
    /* AuthState as an Observable */
    readonly auth$ = this._authState.asObservable();
    auth: AuthState;

    constructor() {
        window.addEventListener('storage',
            this.storageEventListener.bind(this));

        /* Get the user on creation of this service */
        Auth.currentAuthenticatedUser()
            .then(data => {
                const authState: AuthState = {
                    isAuthenticated: true,
                    username: data.username,
                    email: data.attributes.email
                };
                localStorage.setItem(AUTH_STATE_KEY,
                    JSON.stringify(authState));
                // local application doesn't seem to catch changes to localStorage
                this.setAuthState(authState);
                this.auth = authState;
            })
            .catch(() => {
                localStorage.setItem(AUTH_STATE_KEY,
                    JSON.stringify(DEFAULT_AUTH_STATE));
                this.setAuthState(DEFAULT_AUTH_STATE);
                this.auth = DEFAULT_AUTH_STATE;
            });
    }

    private storageEventListener(event: StorageEvent) {
        if (event.storageArea == localStorage) {
            if (event.key === AUTH_STATE_KEY && event.newValue) {
                const newAuthState = JSON.parse(event.newValue);
                this._authState.next(newAuthState);
                this.auth = newAuthState;
            }
        }
    }

    ngOnDestroy(): void {
        window.removeEventListener("storage",
            this.storageEventListener.bind(this));
    }

    publishSignIn(user: User): void {
        const authState: AuthState = {
            ...user,
            isAuthenticated: true
        };
        localStorage.setItem(AUTH_STATE_KEY, JSON.stringify(authState));
        this.setAuthState(authState);
        this.auth = authState;
    }

    publishSignOut(): void {
        localStorage.setItem(AUTH_STATE_KEY, JSON.stringify(DEFAULT_AUTH_STATE));
        this.setAuthState(DEFAULT_AUTH_STATE);
        this.auth = DEFAULT_AUTH_STATE;
    }

    private setAuthState(authState: AuthState) {
        this._authState.next(authState);
    }
}

/* References
 * https://dev.to/beavearony/aws-amplify-auth-angular-rxjs-simple-state-management-3jhd
 * https://stackoverflow.com/questions/35397198/how-can-i-watch-for-changes-to-localstorage-in-angular2/57039364
 */