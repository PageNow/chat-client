/// <reference types="chrome" />
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';
import {
    faSearch, faComment, faBell, faUserCircle, faFileAlt, faTimes
} from '@fortawesome/free-solid-svg-icons';
import { Auth } from 'aws-amplify';

import { EXTENSION_ID } from '../shared/config';
import { UserService } from '../user/user.service';
import { UserInfoPrivate } from '../user/user.model';
import { ChatService } from '../chat/chat.service';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss']
})
export class TabsComponent implements OnInit, OnDestroy {
    @Input() currTab: string;

    // variables relevant to userInfoPrivate
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

    // if user is not registered, set to false
    tabsHidden = false;

    constructor(
        private router: Router,
        private spinner: NgxSpinnerService,
        private userService: UserService,
        private chatService: ChatService
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
                this.userId = res.user_id;
                this.shareMode = res.share_mode;
                this.domainAllowSet = new Set(res.domain_allow_array);
                this.domainDenySet = new Set(res.domain_deny_array);
                const message = {
                    type: 'update-user-info',
                    data: {
                        shareMode: res.share_mode,
                        domainAllowSet: res.domain_allow_array,
                        domainDenySet: res.domain_deny_array
                    }
                }
                chrome.runtime.sendMessage(EXTENSION_ID, message);
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
        // do nothing
    }

    ngOnDestroy(): void {
        this.userInfoSubscription?.unsubscribe();

        window.removeEventListener('message',
            this.messageEventListener.bind(this));
    }

    private messageEventListener(event: MessageEvent): void {
        if (event.data.type === 'send-message') {
            console.log(event.data.data);
        }
    }

    onCloseChatbox(): void {
        const message = {
            type: 'window-chatbox-close'
        };
        chrome.runtime.sendMessage(EXTENSION_ID, message);
    }
}
