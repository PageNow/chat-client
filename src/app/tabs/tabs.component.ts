/// <reference types="chrome" />
import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import {
    faSearch, faComment, faBell, faUserCircle, faFileAlt, faTimes
} from '@fortawesome/free-solid-svg-icons';
import { Auth } from 'aws-amplify';

import { EXTENSION_ID } from '../shared/config';
import { UserService } from '../user/user.service';
import { UserInfoPrivate } from '../user/user.model';
import { ChatService } from '../chat/chat.service';
import { NotificationsService } from '../notifications/notifications.service';
import { setAuthSession } from '../shared/auth-utils';

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

    // variables for notifications
    nNotifications = 0;
    notificationCntSubscription: Subscription;

    constructor(
        private router: Router,
        private userService: UserService,
        private chatService: ChatService,
        private notificationsService: NotificationsService
    ) { }

    ngOnInit(): void {
        Auth.currentSession()
            .then(res => {
                this.userId = res.getIdToken().payload['cognito:username'];
                const message = {
                    type: 'update-jwt',
                    data: {
                        jwt: res.getIdToken().getJwtToken()
                    }
                };
                chrome.runtime.sendMessage(EXTENSION_ID, message);
            })
            .catch(() => {
                // "No current user" error - do nothing
            });

        this.userInfoSubscription = this.userService.currUserInfo.subscribe(
            (res: UserInfoPrivate | null) => {
                if (res) {
                    this.shareMode = res.share_mode;
                    this.domainAllowSet = new Set(res.domain_allow_array);
                    this.domainDenySet = new Set(res.domain_deny_array);
                    const message = {
                        type: 'update-user-info',
                        data: {
                            shareMode: res.share_mode,
                            domainAllowSet: res.domain_allow_array,
                            domainDenySet: res.domain_deny_array,
                            updatePresence: false
                        }
                    };
                    chrome.runtime.sendMessage(EXTENSION_ID, message);
                }
            },
            (err: any) => {
                if (err.status === 404) {
                    this.tabsHidden = true;
                    this.router.navigate(['/user-registration'], { replaceUrl: true});
                }
            }
        );

        this.nUnreadConversations = this.chatService.unreadConversationIdSet.size;
        this.unreadConversationCntSubscription = this.chatService.unreadConversationCntSubject.subscribe(
            (res: number) => {
                this.nUnreadConversations = res;
            },
            err => {
                console.log(err);
            }
        );

        this.notificationCntSubscription = this.notificationsService.notificationCntSubject.subscribe(
            (res: number) => {
                this.nNotifications = res;
            },
            err => {
                console.log(err);
            }
        );

        window.addEventListener('message', this.messageEventListener.bind(this));
    }

    ngOnDestroy(): void {
        this.userInfoSubscription?.unsubscribe();
        this.unreadConversationCntSubscription?.unsubscribe();
        this.notificationCntSubscription?.unsubscribe();

        window.removeEventListener('message',
            this.messageEventListener.bind(this));
    }

    private messageEventListener(event: MessageEvent): void {
        console.log('tabs.component.ts', event.data);
        switch (event.data.type) {
            case 'read-messages':
                if (event.data.data.userId === this.userId) {
                    this.chatService.unreadConversationIdSet.delete(event.data.data.conversationId);
                    this.chatService.publishUnreadConversationCnt();
                }
                break;
            case 'auth-session':
                setAuthSession(event.data.data);
                break;
            case 'auth-null':
                Auth.signOut();
                break;
            default:
                break;
        }
    }

    onCloseChatbox(): void {
        const message = {
            type: 'window-chatbox-close'
        };
        chrome.runtime.sendMessage(EXTENSION_ID, message);
    }
}
