import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Auth } from 'aws-amplify';
import { NgxSpinnerService } from 'ngx-spinner';
import { CognitoHostedUIIdentityProvider } from '@aws-amplify/auth/lib/types';

import { AuthService } from '../auth.service';
import { AuthState } from '../auth.model';
import { passwordValidator } from '../../shared/custom-validators';

@Component({
    selector: 'app-auth-page',
    templateUrl: './auth-page.component.html',
    styleUrls: ['./auth-page.component.scss']
})
export class AuthPageComponent {
    authForm: FormGroup;
    forgotPasswordForm: FormGroup;
    resetPasswordForm: FormGroup;

    authState: AuthState;

    authMode = 'sign-up';
    errorMsg = '';
    notificationMsg = '';
    confirmEmail = '';

    constructor(
        private spinner: NgxSpinnerService,
        private router: Router,
        private fb: FormBuilder,
        private authService: AuthService
    ) {
        // add password validator
        this.authForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, passwordValidator()]],
            passwordConfirm: ['', [Validators.required]]
        });

        this.forgotPasswordForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]]
        });

        this.resetPasswordForm = this.fb.group({
            code: ['', [Validators.required]],
            password: ['', [Validators.required, passwordValidator()]],
            passwordConfirm: ['', Validators.required]
        });

        this.authService.auth$.subscribe((authState: AuthState) => {
            if (authState.isAuthenticated) {
                if (authState.userId?.startsWith('google_')) {
                    window.close();
                } else {
                    this.router.navigate(['/home'], { replaceUrl: true });
                }
            }
        });
    }

    onSetAuthMode(authMode: string): void {
        this.authMode = authMode;
        this.errorMsg = '';
        this.notificationMsg = '';
    }

    onEmailSignUp(): void {
        const email = this.authForm.get('email')?.value;
        const password = this.authForm.get('password')?.value;
        const passwordConfirm = this.authForm.get('passwordConfirm')?.value;
        if (password !== passwordConfirm) {
            this.errorMsg = 'Please re-confirm the password';
            return;
        }
        this.spinner.show();
        Auth.signUp(email, password)
            .then(() => {
                this.spinner.hide();
                this.errorMsg = '';
                this.confirmEmail = email;
                this.onSetAuthMode('confirm-user');
            })
            .catch(err => {
                this.spinner.hide();
                this.errorMsg = err.message;
            });
    }

    onEmailSignIn(): void {
        this.spinner.show();
        const email = this.authForm.get('email')?.value;
        const password = this.authForm.get('password')?.value;
        Auth.signIn(email, password)
            .then(data => {
                this.spinner.hide();
                this.authService.publishSignIn({
                    userId: data.username,
                    email: data.attributes.email
                });
                this.errorMsg = '';
                this.router.navigate(['/home'], { replaceUrl: true });
            })
            .catch(err => {
                this.spinner.hide();
                if (err.code === 'UserNotConfirmedException') {
                    this.confirmEmail = email;
                    this.onSetAuthMode('confirm-user');
                } else {
                    this.errorMsg = err.message;
                }
            });
    }

    onFacebookSignIn(): void {
        this.spinner.show();
        Auth.federatedSignIn({
            provider: CognitoHostedUIIdentityProvider.Facebook
        }).then(() => {
            this.spinner.hide();
            window.close();
        });
    }

    onGoogleSignIn(): void {
        this.spinner.show();
        Auth.federatedSignIn({
            provider: CognitoHostedUIIdentityProvider.Google
        }).then(() => {
            this.spinner.hide();
        }).catch(err => {
            console.log(err);
        });
    }

    onSendVerificationCode(): void {
        this.spinner.show();
        Auth.forgotPassword(this.forgotPasswordForm.value.email)
            .then(() => {
                this.spinner.hide();
                this.authMode = 'reset-password';
                this.errorMsg = '';
            })
            .catch(err => {
                this.spinner.hide();
                if (err.code === 'InvalidParameterException') {
                    this.errorMsg = 'Please verify your email before resetting the password';
                } else if (err.code === 'UserNotFoundException') {
                    this.errorMsg = 'Your email is not registered.';
                } else {
                    this.errorMsg = err.message;
                }
            });
    }

    onResetPassword(): void {
        const forgotFormValue = this.forgotPasswordForm.value;
        const resetFormValue = this.resetPasswordForm.value;
        if (resetFormValue.password !== resetFormValue.passwordConfirm) {
            this.errorMsg = 'Please re-confirm your password.';
            return;
        }
        this.spinner.show();
        Auth.forgotPasswordSubmit(forgotFormValue.email, resetFormValue.code, resetFormValue.password)
            .then(() => {
                this.spinner.hide();
                this.errorMsg = '';
                this.onSetAuthMode('sign-in');
            })
            .catch(err => {
                this.spinner.hide();
                if (err.message === 'Username cannot be empty') {
                    this.errorMsg = 'You must enter the correct email in the previous page.';
                } else {
                    this.errorMsg = err.message;
                }
            });
    }

    onSendVerificationLink(): void {
        this.spinner.show();
        Auth.resendSignUp(this.confirmEmail)
            .then(() => {
                this.spinner.hide();
                this.notificationMsg = 'The verification link has been sent to ' + this.confirmEmail;
                this.errorMsg = '';
            })
            .catch(err => {
                this.spinner.hide();
                this.errorMsg = err.message;
                this.notificationMsg = '';
            });
    }

    onSignOut(): void {
        this.authService.publishSignOut();
    }
}

/* Referecnes
 * https://arjunsk.medium.com/cognito-hosted-ui-with-amplify-in-angular-7-26c9285675c4
 * https://blog.thoughtram.io/angular/2017/02/21/using-zones-in-angular-for-better-performance.html
 * https://github.com/daikiojm/angular-aws-amplify
 * https://docs.amplify.aws/lib/auth/emailpassword/q/platform/js
 * https://docs.amplify.aws/lib/auth/manageusers/q/platform/js#password-operations
 * https://jasonwatmore.com/post/2020/07/06/angular-10-communicating-between-components-with-observable-subject
 */
