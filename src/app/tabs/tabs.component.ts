import { Component, Input, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';

import { AuthService } from '../auth/auth.service';
import { AuthState } from '../auth/auth.model';
import { DEFAULT_AUTH_STATE } from '../shared/constants';
import { UserService } from '../user/user.service';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss']
})
export class TabsComponent implements OnDestroy {
    url: string;
    authState: AuthState = DEFAULT_AUTH_STATE;
    userUuid: string | null;
    userInfoSubscription: Subscription;
    @Input() currTab: string;

    constructor(
        private router: Router,
        private spinner: NgxSpinnerService,
        private authService: AuthService,
        private userService: UserService
    ) {
        console.log('tabs.component constructor');

        window.addEventListener("message",
            this.messageEventListener.bind(this));

        this.authState = this.authService.auth;

        this.authService.auth$.subscribe((authState: AuthState) => {
            this.spinner.show();            
            if (!authState.isAuthenticated) {
                this.spinner.hide();
                this.router.navigate(['/auth/gate'], { replaceUrl: true });
            } else {
                this.userInfoSubscription = this.userService.getCurrentUserInfo().subscribe(
                    res => {
                        this.userUuid = res['user_uuid']
                        this.spinner.hide();
                    },
                    err => {
                        this.spinner.hide();
                        if (err.status === 404) {
                            this.router.navigate(['/user-registration'], { replaceUrl: true});
                        }
                    });
            }
        });
    }

    ngOnDestroy(): void {
        this.userInfoSubscription.unsubscribe();
        
        window.removeEventListener("message",
            this.messageEventListener.bind(this));
    }

    private messageEventListener(event: MessageEvent): void {
        if (event.data.type === 'update-url') {
            this.url = event.data.data?.url;
        }
    }

    // onSignOut(): void {
    //     this.authService.publishSignOut();
    //     Auth.signOut();
    //     // TODO: signal chrome extension to close chatbox
    // } 
}

/* Notes
 * - GraphQL query to obtain UUID cannot happne in auth.service because
 *   we need the user id before making a query and subscribing to the
 *   value changes.
 */