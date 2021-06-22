import { Component, Input, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Apollo, gql } from 'apollo-angular';
import { NgxSpinnerService } from 'ngx-spinner';

import { AuthService } from '../auth/auth.service';
import { AuthState } from '../auth/auth.model';
import { DEFAULT_AUTH_STATE } from '../shared/constants';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss']
})
export class TabsComponent implements OnDestroy {
    url: string;
    authState: AuthState = DEFAULT_AUTH_STATE;
    userUuid: string;
    private uuidSubscription: Subscription;
    @Input() currTab: string;

    constructor(
        private router: Router,
        private authService: AuthService,
        private apollo: Apollo,
        private spinner: NgxSpinnerService
    ) {
        console.log('tabs.component constructor');

        window.addEventListener("message",
            this.messageEventListener.bind(this));

        this.authState = this.authService.auth;

        this.authService.auth$.subscribe((authState: AuthState) => {
            console.log(authState);
            this.spinner.show();            
            if (!authState.isAuthenticated) {
                this.spinner.hide();
                this.router.navigate(['/auth/gate'], { replaceUrl: true });
            } else {
                // TODO: use local cache to reduce this additional query to server 
                this.uuidSubscription = this.apollo.watchQuery({
                    query: gql`{
                        user(userId: "${authState.userId}") {
                            userUuid
                        }
                    }`,
                })
                .valueChanges.subscribe((res: any) => {
                    if (res.data?.user) {
                        this.userUuid = res.data.user.userUuid;
                        this.spinner.hide();
                    } else {
                        this.spinner.hide();
                        this.router.navigate(['/user-registration'], { replaceUrl: true});
                    }
                });

            }
        });
    }

    ngOnDestroy(): void {
        window.removeEventListener("message",
            this.messageEventListener.bind(this));
        this.uuidSubscription.unsubscribe();
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