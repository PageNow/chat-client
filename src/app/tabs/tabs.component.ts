/// <reference types="chrome" />
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { interval, Subscription } from 'rxjs';
import {
    faSearch, faComment, faBell, faUserCircle, faFileAlt, faTimes
} from '@fortawesome/free-solid-svg-icons';

import { AuthService } from '../auth/auth.service';
import { AuthState } from '../auth/auth.model';
import { DEFAULT_AUTH_STATE, EXTENSION_ID } from '../shared/constants';
import { UserService } from '../user/user.service';
import { PagesService } from '../pages/pages.service';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss']
})
export class TabsComponent implements OnInit, OnDestroy {
    currUrl = '';
    currTitle = '';
    redisUrl = ''; // my url stored in redis

    authState: AuthState = DEFAULT_AUTH_STATE;
    userUuid: string | null;
    userId: string | null;
    userInfoSubscription: Subscription;
    @Input() currTab: string;

    // fontawesome icons
    faSearch = faSearch;
    faComment = faComment;
    faBell = faBell;
    faUserCircle = faUserCircle;
    faFileAlt = faFileAlt;
    faTimes = faTimes;

    redisUrlSubscription: Subscription;
    timerSubscription: Subscription;

    constructor(
        private router: Router,
        private spinner: NgxSpinnerService,
        private authService: AuthService,
        private userService: UserService,
        private pagesService: PagesService
    ) {
        console.log('tabs.component constructor');

        window.addEventListener('message',
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
                        this.userUuid = res.user_uuid;
                        this.userId = res.user_id;
                        this.statusSubscribe();
                        this.getInitialStatus();        
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

    ngOnInit(): void {
        const source = interval(5000);
        this.timerSubscription = source.subscribe(() => {
            if (this.currUrl === this.redisUrl) {
                console.log('heartbeat');
            }
        });
    }

    ngOnDestroy(): void {
        this.userInfoSubscription?.unsubscribe();

        window.removeEventListener('message',
            this.messageEventListener.bind(this));

        this.redisUrlSubscription?.unsubscribe();
        this.timerSubscription?.unsubscribe();
    }

    async getInitialStatus(): Promise<void> {
        if (!this.userId) { return; }
        const result = await this.pagesService.getStatus(this.userId);
        console.log(result);
        this.redisUrl = result.data.status.url;
    }

    async statusSubscribe(): Promise<void> {
        if (!this.userId) { return; }
        this.redisUrlSubscription = this.pagesService.subscribeToStatus(this.userId).subscribe({
            next: (event: any) => {
                console.log(event);
                this.redisUrl = event.value.data.onStatus.url;
            }
        })
    }

    private messageEventListener(event: MessageEvent): void {
        if (event.data.type === 'update-url') {
            this.currUrl = event.data.data?.url;
            this.currTitle = event.data.data?.title;
        }
    }

    onCloseChatbox(): void {
        const message = {
            type: 'window-chatbox-close'
        };
        chrome.runtime.sendMessage(EXTENSION_ID, message);
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
