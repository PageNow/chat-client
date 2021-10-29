import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import Auth from '@aws-amplify/auth';
import { setAuthSession } from 'src/app/shared/auth-utils';
import { UserInfoPrivate } from 'src/app/user/user.model';
import { UserService } from '../../user/user.service';

@Component({
    selector: 'app-auth-gate',
    templateUrl: './auth-gate.component.html',
    styleUrls: ['./auth-gate.component.scss']
})
export class AuthGateComponent implements OnInit, OnDestroy {
    constructor(
        private router: Router,
        private userService: UserService
    ) { }

    ngOnInit(): void {
        Auth.currentAuthenticatedUser()
            .then(() => {
                console.log('signed in');
                this.router.navigate(['/pages'], { replaceUrl: true });
            })
            .catch(() => {
                // do nothing
            });

        window.addEventListener('message', this.messageEventListener.bind(this));
    }

    ngOnDestroy(): void {
        window.removeEventListener('message',
            this.messageEventListener.bind(this));
    }

    private messageEventListener(event: MessageEvent): void {
        switch (event.data.type) {
            case 'auth-session':
                setAuthSession(event.data.data);
                Auth.currentAuthenticatedUser()
                    .then(() => {
                        this.router.navigate(['/pages'], { replaceUrl: true });
                    })
                    .catch(() => {
                        // do nothing
                    });
                break;
            case 'auth-google-session':
                this.userService.getCurrentUserInfo()
                    .then((res: UserInfoPrivate) => {
                        this.userService.publishCurrentUserInfo(res);
                        this.router.navigate(['/pages'], { replaceUrl: true });
                    });
                break;
            default:
                break;
        }
    }
}
