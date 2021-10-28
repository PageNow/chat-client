import { Component } from '@angular/core';
import { Router } from '@angular/router';

import Auth from '@aws-amplify/auth';

@Component({
    selector: 'app-auth-gate',
    templateUrl: './auth-gate.component.html',
    styleUrls: ['./auth-gate.component.scss']
})
export class AuthGateComponent {
    constructor(
        private router: Router,
    ) {
        Auth.currentAuthenticatedUser()
            .then(() => {
                this.router.navigate(['/home'], { replaceUrl: true });
            })
            .catch(() => {
                // do nothing
            });
    }
}
