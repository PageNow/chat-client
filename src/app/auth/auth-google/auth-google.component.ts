import { Component } from '@angular/core';
import { Auth } from 'aws-amplify';
import { CognitoHostedUIIdentityProvider } from '@aws-amplify/auth/lib/types';

@Component({
    selector: 'app-auth-google',
    templateUrl: './auth-google.component.html',
    styleUrls: []
})
export class AuthGoogleComponent {
    constructor( ) {
        Auth.federatedSignIn({
            provider: CognitoHostedUIIdentityProvider.Google
        });
    }
}
