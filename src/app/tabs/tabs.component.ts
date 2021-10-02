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

    // variable for badges
    nUnreadConversations = 0;
    unreadConversationCntSubscription: Subscription;

    constructor(
        private router: Router,
        private spinner: NgxSpinnerService,
        private userService: UserService,
        private chatService: ChatService
    ) {
        window.addEventListener('message',
            this.messageEventListener.bind(this));

        Auth.currentSession()
            .then(res => {
                const message = {
                    type: 'update-jwt',
                    data: {
                        jwt: res.getIdToken().getJwtToken()
                    }
                };
                chrome.runtime.sendMessage(EXTENSION_ID, message);
            })
            .catch(err => {
                console.log(err);
            });

        this.userService.getCurrentUserInfo().toPromise()
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

        this.nUnreadConversations = chatService.unreadConversationIdSet.size;
        this.unreadConversationCntSubscription = this.chatService.unreadConversationCntSubject.subscribe(
            (res: number) => {
                console.log(res);
                this.nUnreadConversations = res;
            },
            err => {
                console.log(err);
            }
        )
    }

    ngOnInit(): void {
        // do nothing
    }

    ngOnDestroy(): void {
        this.userInfoSubscription?.unsubscribe();
        this.unreadConversationCntSubscription?.unsubscribe();

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
