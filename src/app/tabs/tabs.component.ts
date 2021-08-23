/// <reference types="chrome" />
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { interval, Subscription } from 'rxjs';
import {
    faSearch, faComment, faBell, faUserCircle, faFileAlt, faTimes
} from '@fortawesome/free-solid-svg-icons';
import { Auth } from 'aws-amplify';

import { EXTENSION_ID, HEARTBEAT_PERIOD } from '../shared/constants';
import { UserService } from '../user/user.service';
import { PagesService } from '../pages/pages.service';
import { UserInfoPrivate } from '../user/user.model';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss']
})
export class TabsComponent implements OnInit, OnDestroy {
    @Input() currTab: string;

    currUrl = '';
    currTitle = '';
    redisUrl = ''; // my url stored in redis

    // variables relevant to userInfoPrivate
    userUuid: string | null;
    userId: string | null;
    userInfoSubscription: Subscription;
    shareMode: string;
    domainAllowSet: Set<string>;
    domainDenySet: Set<string>;    

    // fontawesome icons
    faSearch = faSearch;
    faComment = faComment;
    faBell = faBell;
    faUserCircle = faUserCircle;
    faFileAlt = faFileAlt;
    faTimes = faTimes;

    redisUrlSubscription: Subscription;
    timerSubscription: Subscription;

    // if user is not registered, set to false
    tabsHidden = false;

    constructor(
        private router: Router,
        private spinner: NgxSpinnerService,
        private userService: UserService,
        private pagesService: PagesService
    ) {
        console.log('tabs.component constructor');

        window.addEventListener('message',
            this.messageEventListener.bind(this));

        Auth.currentAuthenticatedUser()
            .then(() => {
                console.log('calling /users/me');
                return this.userService.getCurrentUserInfo().toPromise();
            })
            .then((res: UserInfoPrivate): void => {
                console.log(res);
                this.userService.publishCurrentUserInfo(res);
                this.userUuid = res.user_uuid;
                this.userId = res.user_id;
                this.shareMode = res.share_mode;
                this.domainAllowSet = new Set(res.domain_allow_array);
                this.domainDenySet = new Set(res.domain_deny_array);
                this.statusSubscribe();
                this.getInitialStatus();
                this.spinner.hide();
            })
            .catch(err => {
                this.spinner.hide();
                console.log(err);
                console.log(err.status);
                if (err.status === 404) {
                    this.tabsHidden = true;
                    this.router.navigate(['/user-registration'], { replaceUrl: true});
                } else {
                    // this.router.navigate(['/auth/gate'], { replaceUrl: true });
                }
            });
    }

    ngOnInit(): void {
        console.log('tabs ngOnInit');
        const source = interval(HEARTBEAT_PERIOD);
        this.timerSubscription = source.subscribe(() => {
            console.log('heartbeat');
            if (this.currUrl === this.redisUrl) {
                console.log(`Sending heartbeat with ${this.currTitle}`);
                const url = new URL(this.currUrl);
                if (this.shareMode === 'default_none' && this.domainAllowSet.has(url.hostname)) {
                    this.pagesService.sendHeartbeat(this.currUrl, this.currTitle);
                } else if (this.shareMode === 'default_all' && !this.domainDenySet.has(url.hostname)) {
                    this.pagesService.sendHeartbeat(this.currUrl, this.currTitle);
                } else { // default_none
                    this.pagesService.sendHeartbeat('', '');
                }
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
        this.redisUrl = result.data.status.url;
    }

    async statusSubscribe(): Promise<void> {
        if (!this.userId) { return; }
        this.redisUrlSubscription = this.pagesService.subscribeToStatus(this.userId)
            .subscribe(
                ({ data }: any) => {
                    this.redisUrl = data.onStatus.url;
                },
                (err: any) => {
                    console.log(err);
                }
            );
    }

    private messageEventListener(event: MessageEvent): void {
        if (event.data.type === 'update-url') {
            this.currUrl = event.data.data?.url;
            this.currTitle = event.data.data?.title;
            const url = new URL(this.currUrl);
            if (this.shareMode === 'default_none' && this.domainAllowSet.has(url.hostname)) {
                this.pagesService.connect(this.currUrl, this.currTitle);
            } else if (this.shareMode === 'default_all' && !this.domainDenySet.has(url.hostname)) {
                this.pagesService.connect(this.currUrl, this.currTitle);
            } else { // default_none
                this.pagesService.connect('', '');
            }
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
