import { Component } from '@angular/core';
import { Auth } from 'aws-amplify';
import { CognitoHostedUIIdentityProvider } from '@aws-amplify/auth/lib/types';
import { AuthService } from '../auth.service';
import { AuthState } from '../auth.model';
import { Router } from '@angular/router';

@Component({
    selector: 'app-auth-google',
    templateUrl: './auth-google.component.html',
    styleUrls: []
})
export class AuthGoogleComponent {
    constructor(
        private router: Router,
        private authService: AuthService
    ) {
        if (window.self === window.top) {
            this.authService.authFirst.subscribe((authState: AuthState) => {
                if (authState.isAuthenticated) {
                    window.close();
                } else {
                    Auth.federatedSignIn({
                        provider: CognitoHostedUIIdentityProvider.Google
                    });
                }
            });
        } else {
            router.navigate(['/home'], { replaceUrl: true });
        }
    }
}
