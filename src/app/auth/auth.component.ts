import { Component, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Auth, Hub } from 'aws-amplify';
import { NgxSpinnerService } from 'ngx-spinner';
import { CognitoHostedUIIdentityProvider } from "@aws-amplify/auth/lib/types";

@Component({
    selector: 'app-auth',
    templateUrl: './auth.component.html',
    styleUrls: ['./auth.component.scss']
})
export class AuthComponent {
    authForm: FormGroup;
    forgotPasswordForm: FormGroup;
    recoverPasswordForm: FormGroup;

    authMode = 'sign-in';

    constructor(
        private spinner: NgxSpinnerService,
        private router: Router,
        private zone: NgZone,
        private fb: FormBuilder,
    ) {
        // add password validator
        this.authForm = this.fb.group({
            'email': ['', [Validators.required, Validators.email]],
            'password': ['', Validators.required]
        });

        this.forgotPasswordForm = this.fb.group({
            'email': ['', [Validators.required, Validators.email]]
        });

        this.recoverPasswordForm = this.fb.group({
            'code': ['', [Validators.required]],
            'newPassword': ['', Validators.required],
            'passwordConfirm': ['', Validators.required]
        });

        // Used for listening to login events
        Hub.listen("auth", ({ payload: { event, data } }) => {
            if (event === "cognitoHostedUI" || event === "signedIn") {
                this.zone.run(() => this.router.navigate(['/']));
            } else {
                this.spinner.hide();
            }
        });

        //currentAuthenticatedUser: when user comes to login page again
        Auth.currentAuthenticatedUser()
            .then(() => {
                this.router.navigate(['/home'], { replaceUrl: true });
            }).catch((err) => {
                this.spinner.hide();
                console.log(err);
            });
    }

    onSetAuthMode(authMode: string): void {
        this.authMode = authMode;
    }

    onEmailSignUp(): void {
        this.spinner.show();
        const email = this.authForm.get('email')?.value;
        const password = this.authForm.get('password')?.value;
        Auth.signUp(email, password)
            .then(() => {
                this.spinner.hide();
                this.router.navigate(['/home'], { replaceUrl: true });
            })
            .catch(err => {
                this.spinner.hide();
                console.log(err);
            })
    }

    onEmailSignIn(): void {
        this.spinner.show();
        const email = this.authForm.get('email')?.value;
        const password = this.authForm.get('password')?.value;
        Auth.signIn(email, password)
            .then(() => {
                this.spinner.hide();
                this.router.navigate(['/home'], { replaceUrl: true });
            })
            .catch(err => {
                this.spinner.hide();
                console.log(err);
            });        
    }

    onFacebookSignIn(): void {
        this.spinner.show();
        Auth.federatedSignIn({
            provider: CognitoHostedUIIdentityProvider.Facebook
        }).then(() => { this.spinner.hide() });
    }

    onGoogleSignIn(): void {
        this.spinner.show();
        Auth.federatedSignIn({
            provider: CognitoHostedUIIdentityProvider.Google
        }).then(() => { this.spinner.hide() });
    }

    onResetPassword(): void {
        this.spinner.show();
        Auth.forgotPassword(this.forgotPasswordForm.value.email)
            .then(() => {
                this.spinner.hide();
                this.authMode = 'recover-password';
            })
            .catch(err => {
                // TODO - error handling (warning message)
                this.spinner.hide();
                console.log(err);
            });
    }

    onChangePassword(): void {
        this.spinner.show();
        const formValue = this.recoverPasswordForm.value;
        Auth.forgotPasswordSubmit(formValue.email, formValue.code, formValue.password)
            .then(() => {
                this.spinner.hide();
                this.router.navigate(['/home'], { replaceUrl: true });
            })
            .catch(err => {
                // need error handling
                this.spinner.hide();
                console.log(err);
            })
    }
}

/* Referecnes
 * https://arjunsk.medium.com/cognito-hosted-ui-with-amplify-in-angular-7-26c9285675c4
 * https://blog.thoughtram.io/angular/2017/02/21/using-zones-in-angular-for-better-performance.html
 * https://github.com/daikiojm/angular-aws-amplify
 * https://docs.amplify.aws/lib/auth/emailpassword/q/platform/js
 * https://docs.amplify.aws/lib/auth/manageusers/q/platform/js#password-operations
 */