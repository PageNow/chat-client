import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../auth.service';
import { AuthState } from '../auth.model';

@Component({
    selector: 'app-auth-gate',
    templateUrl: './auth-gate.component.html',
    styleUrls: ['./auth-gate.component.scss']
})
export class AuthGateComponent {
    authState: AuthState;

    constructor(
        private router: Router,
        private authService: AuthService
    ) {
        this.authService.auth$.subscribe((authState: AuthState) => {
            if (authState.isAuthenticated) {
                this.router.navigate(['/home'], { replaceUrl: true });
            }
        });
    }
}