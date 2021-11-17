/// <reference types="chrome" />
import { Component, OnInit } from '@angular/core';
import { Auth } from 'aws-amplify';
import { NgxSpinnerService } from 'ngx-spinner';

import { EXTENSION_ID } from '../../shared/config';

@Component({
    selector: 'app-auth-sync',
    templateUrl: './auth-sync.component.html',
    styleUrls: ['./auth-sync.component.scss']
})
export class AuthSyncComponent implements OnInit {
    constructor(
        private spinner: NgxSpinnerService,
    ) { }

    ngOnInit(): void {
        this.spinner.show();
        /* Sync browser auth session with extension auth session */
        Auth.currentSession()
            .then((session: any) => {
                // send the google authentication session info to background.js
                const message = {
                    type: 'google-auth-session',
                    data: session
                };
                chrome.runtime.sendMessage(EXTENSION_ID, message, res => {
                    console.log(res);
                    this.spinner.hide();
                    // window may not close due to Chrome's security
                    window.close();
                    window.location.href = 'https://pagenow.io';
                });
            })
            .catch(err => {
                console.log(err);
            });
    }
}
