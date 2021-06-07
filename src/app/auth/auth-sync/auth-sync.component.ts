/// <reference types="chrome" />
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from 'aws-amplify';
import { NgxSpinnerService } from "ngx-spinner";

import { EXTENSION_ID } from '../../shared/constants';
import { AuthService } from '../auth.service';

@Component({
    selector: 'app-auth-sync',
    templateUrl: './auth-sync.component.html',
    styleUrls: ['./auth-sync.component.scss']
})
export class AuthSyncComponent {
    constructor (
        private router: Router,
        private spinner: NgxSpinnerService,
        private authService: AuthService
    ) {
        this.spinner.show();
        /* Sync browser auth session with extension auth session */
        Auth.currentSession()
            .then((session: any) => {
                const message = {
                    type: 'google-auth-session',
                    data: session
                };
                chrome.runtime.sendMessage(EXTENSION_ID, message, res => {
                    this.spinner.hide();
                    if (res.code === 'success') {
                        this.authService.publishSignIn({
                            userId: session.idToken.payload['cognito:username'],
                            email: session.idToken.payload.email
                        });
                    }
                    window.close();
                });
            });
    }
}