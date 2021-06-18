import { Injectable, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { take } from 'rxjs/operators';
import { Auth } from 'aws-amplify';
import {
    CognitoIdToken,
    CognitoAccessToken,
    CognitoRefreshToken,
    CognitoUserSession,
    CognitoUser,
    CognitoUserPool
} from 'amazon-cognito-identity-js';
import awsmobile from '../../aws-exports';

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
    authFirst = this._authState.pipe(take(1));

    constructor() {
        window.addEventListener('storage',
            this.storageEventListener.bind(this));

        /* Get the user on creation of this service */
        Auth.currentAuthenticatedUser()
            .then(data => {
                const authState: AuthState = {
                    isAuthenticated: true,
                    userId: data.username,
                    email: data.attributes.email
                };
                this.setAuthState(authState);
                this.auth = authState;
            })
            .catch(() => {
                this.setAuthState(DEFAULT_AUTH_STATE);
                this.auth = DEFAULT_AUTH_STATE;
            });

        window.addEventListener('message',
            this.messageEventListener.bind(this));
    }

    private storageEventListener(event: StorageEvent): void {
        if (event.storageArea == localStorage) {
            if (event.key === AUTH_STATE_KEY && event.newValue) {
                const newAuthState = JSON.parse(event.newValue);
                this._authState.next(newAuthState);
                this.auth = newAuthState;
            }
        }
    }

    private messageEventListener(event: MessageEvent): void {
        if (event.data.type === 'auth-session') {
            const session = event.data.data;
            const idToken = new CognitoIdToken({
                IdToken: session.idToken.jwtToken
            });
            const accessToken = new CognitoAccessToken({
                  AccessToken: session.accessToken.jwtToken
            });
            const refreshToken = new CognitoRefreshToken({
                  RefreshToken: session.refreshToken.token
            });
            const clockDrift = session.clockDrift;
            const sessionData = {
                IdToken: idToken,
                AccessToken: accessToken,
                RefreshToken: refreshToken,
                ClockDrift: clockDrift
            };

            // Create the session
            const userSession  = new CognitoUserSession(sessionData);
            const userData = {
                Username: userSession.getIdToken().payload['cognito:username'],
                Pool: new CognitoUserPool({
                    UserPoolId: awsmobile.aws_user_pools_id,
                    ClientId: awsmobile.aws_user_pools_web_client_id
                })
            };

            // Make a new cognito user
            const cognitoUser = new CognitoUser(userData);
            // Attach the session to the user
            cognitoUser.setSignInUserSession(userSession);
            // Check to make sure it works
            cognitoUser.getSession((err: any , session: any) => {
                if(session) {
                    this.setAuthState({
                        isAuthenticated: true,
                        userId: session.idToken.payload['cognito:username'],
                        email: session.idToken.payload.email
                    });
                } else {
                    console.error(err);
                }
            });
        } else if (event.data.type === 'auth-null') {
            console.log('Auth signout');
            Auth.signOut()
                .then(() => {
                    console.log('Set DEFAULT_AUTH_STATE');
                    this.setAuthState(DEFAULT_AUTH_STATE);
                })
                .catch(err => {
                    console.log(err);
                });
        }
    }

    ngOnDestroy(): void {
        window.removeEventListener('storage',
            this.storageEventListener.bind(this));
    }

    publishSignIn(user: User): void {
        const authState: AuthState = {
            ...user,
            isAuthenticated: true
        };
        this.setAuthState(authState);
        this.auth = authState;
    }

    publishSignOut(): void {
        this.setAuthState(DEFAULT_AUTH_STATE);
        this.auth = DEFAULT_AUTH_STATE;
    }

    private setAuthState(authState: AuthState): void {
        localStorage.setItem(AUTH_STATE_KEY, JSON.stringify(authState));
        this._authState.next(authState);
    }
}

/* References
 * https://dev.to/beavearony/aws-amplify-auth-angular-rxjs-simple-state-management-3jhd
 * https://stackoverflow.com/questions/35397198/how-can-i-watch-for-changes-to-localstorage-in-angular2/57039364
 */
