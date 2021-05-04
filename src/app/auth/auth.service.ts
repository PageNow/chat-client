import { Injectable } from '@angular/core';
import Auth from '@aws-amplify/auth';
import { Hub } from '@aws-amplify/core';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

import { User } from './user.model';

export interface AuthState {
    isSignedIn: boolean;
    username: string | null;
    id: string | null;
    email: string | null;
}

const initialAuthState = {
    isSignedIn: false,
    username: null,
    id: null,
    email: null
};

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private readonly _authState = new BehaviorSubject<AuthState>(
        initialAuthState
    );

    /** AuthState as an Observable */
    readonly auth$ = this._authState.asObservable();

    /** Observe the isSignedIn slice of the auth state */
    readonly isSignedIn$ = this.auth$.pipe(map(state => state.isSignedIn));

    constructor() {
        // Get the user on creation of this service
        Auth.currentAuthenticatedUser().then(
            (user: any) => this.setUser(user),
            _err => this._authState.next(initialAuthState)
        );

        // Use Hub channel 'auth' to get notified on changes
        Hub.listen('auth', ({ payload: { event, data, message } }) => {
            if (event === 'signIn') {
                // On 'signIn' event, the data is a CognitoUser object
                this.setUser(data);
            } else {
                this._authState.next(initialAuthState);
            }
        });
    }

    private setUser(user: any): void {
        if (!user) {
          return;
        }

        const {
            attributes: { sub: id, email },
            username
        } = user;

        this._authState.next({ isSignedIn: true, id, username, email });
    }
}

/* References
 * https://dev.to/beavearony/aws-amplify-auth-angular-rxjs-simple-state-management-3jhd
 */
