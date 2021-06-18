import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from 'aws-amplify';

import { AuthService } from '../auth/auth.service';
import { AuthState } from '../auth/auth.model';
import { DEFAULT_AUTH_STATE } from '../shared/constants';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnDestroy {
    url: string;
    authState: AuthState = DEFAULT_AUTH_STATE;
    iframeUrl: string;

    constructor(
        private router: Router,
        private authService: AuthService
    ) {
        this.iframeUrl = window.location.href;

        window.addEventListener("message",
            this.messageEventListener.bind(this));

        this.authState = this.authService.auth;

        this.authService.auth$.subscribe((authState: AuthState) => {
            console.log(authState);
            if (!authState.isAuthenticated) {
                this.router.navigate(['/auth/gate'], { replaceUrl: true });
            } else {
                const urlParams = new URLSearchParams(window.location.search);
                if (urlParams.has('code') && urlParams.has('state')) {
                    this.authState = authState;
                    window.close();   
                } else {
                    this.authState = authState;
                }
            }
        });
        
    }

    private messageEventListener(event: MessageEvent): void {
        if (event.data.type === 'update-url') {
            this.url = event.data.data?.url;
        }
    }

    ngOnDestroy(): void {
        window.removeEventListener("message",
            this.messageEventListener.bind(this));
    }

    onSignOut(): void {
        this.authService.publishSignOut();
        Auth.signOut();
        // TODO: signal chrome extension to close chatbox
    } 
}
