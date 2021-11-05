import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject } from 'rxjs';

import { ChatService } from '../chat/chat.service';
import { NotificationsService } from '../notifications/notifications.service';
import { UserInfoPrivate } from '../user/user.model';
import { UserService } from '../user/user.service';
import { TabsComponent } from './tabs.component';

describe('HomeComponent', () => {
    let component: TabsComponent;
    let fixture: ComponentFixture<TabsComponent>;
    let userService: any;
    let chatService: any;
    let notificationsService: any;

    beforeEach(waitForAsync(() => {
        userService = {
            currUserInfo: new BehaviorSubject<UserInfoPrivate | null>(null)
        };
        chatService = {
            unreadConversationIdSet: new Set([]),
            unreadConversationCntSubject: new BehaviorSubject<number>(0),
            publishUnreadConversationCnt: () => {
                // do nothing
            }
        };
        notificationsService = {
            notificationCntSubject: new BehaviorSubject<number>(0)
        };

        TestBed.configureTestingModule({
            imports: [ RouterTestingModule ],
            declarations: [ TabsComponent ],
            providers: [
                {
                    provide: UserService,
                    useValue: userService
                },
                {
                    provide: ChatService,
                    useValue: chatService
                },
                {
                    provide: NotificationsService,
                    useValue: notificationsService
                }
            ],
            schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
        }).compileComponents().then(() => {
            fixture = TestBed.createComponent(TabsComponent);
            component = fixture.componentInstance;
            fixture.detectChanges();
        });
    }));

    it('should create', () => {
        expect(component).toBeDefined();
        expect(component).toBeTruthy();
        expect(component.nUnreadConversations).toEqual(0);
        expect(component.nNotifications).toEqual(0);
    });

    it('should update unread conversation count', () => {
        const nUnreadConversations = 3;
        chatService.unreadConversationCntSubject.next(nUnreadConversations);
        expect(component.nUnreadConversations).toEqual(nUnreadConversations);
    });

    it('should update notification count', () => {
        const nNotifications = 5;
        notificationsService.notificationCntSubject.next(nNotifications);
        expect(component.nNotifications).toEqual(nNotifications);
    });

    // TODO: wait for chrome.runtime to be defined before running the tests
    // it('should update user info', () => {
    //     expect(component.shareMode).toBeUndefined();
    //     userService.currUserInfo.next({
    //         share_mode: 'default_none',
    //         domain_allow_array: ['allow1', 'allow2'],
    //         domain_deny_array: ['deny1', 'deny2', 'deny3']
    //     });
    //     expect(component.shareMode).toEqual('default_none');
    //     expect(component.domainAllowSet.size).toEqual(2);
    //     expect(component.domainDenySet.size).toEqual(3);
    // });
});
