import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormFieldTypes } from '@aws-amplify/ui-components';
import { onAuthUIStateChange, CognitoUserInterface, AuthState } from '@aws-amplify/ui-components';

import { AuthService } from './auth/auth.service';
import { User } from './auth/user.model';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
    formFields: FormFieldTypes;
    isSignedIn = false;
    // user: User = { id: null, username: null, email: null };
    authState: AuthState;
    user: CognitoUserInterface | undefined;
    federatedConfig: any;

    constructor(
        private authService: AuthService,
        private ref: ChangeDetectorRef
    ) {
        this.formFields = [
            {
              type: "email",
              label: "Email Address",
              placeholder: "custom email placeholder",
              required: true,
            },
            {
              type: "password",
              label: "Password",
              placeholder: "custom password placeholder",
              required: true,
            }
        ];
        this.federatedConfig = {
            googleClientId: '519452847020-mtkle4qgrigona7tibd921cqmf8lbhej.apps.googleusercontent.com',
            facebookAppId: '977734673050703',
            amazonClientId: ''
        };
    }

    ngOnInit(): void {
        this.authService.isSignedIn$.subscribe(
            isSignedIn => (this.isSignedIn = isSignedIn)
        );

        // this.authService.auth$.subscribe(({ id, username, email }) => {
        //     console.log(email);
        //     this.user = { id, username, email };
        // });

        onAuthUIStateChange((authState, authData) => {
            this.authState = authState;
            this.user = authData as CognitoUserInterface;
            this.ref.detectChanges();
        });
    }

    ngAfterViewChecked() {
        document.querySelector("amplify-authenticator")!.querySelector("amplify-sign-in")!.shadowRoot!.querySelector("amplify-federated-buttons")!.shadowRoot!.querySelector("amplify-oauth-button")!.style.display = "none";
    }

    ngOnDestroy(): any {
        return onAuthUIStateChange;
    }
}
