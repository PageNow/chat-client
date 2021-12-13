import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';
import { faChevronCircleRight, faChevronDown, faBullhorn } from '@fortawesome/free-solid-svg-icons';

import { EXTENSION_ID } from '../shared/config';
import { USER_DEFAULT_IMG_ASSET } from '../shared/constants';
import { UserInfoPrivate } from '../user/user.model';
import { UserService } from '../user/user.service';
import { Presence } from './pages.model';
import { PagesService } from './pages.service';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../shared/language.service';

@Component({
    selector: 'app-pages',
    templateUrl: './pages.component.html',
    styleUrls: ['./pages.component.scss']
})
export class PagesComponent implements OnInit, OnDestroy {
    // variables related to user info
    userInfoSubscription: Subscription;
    userId: string;
    userInfoMap: {[key: string]: any} = {}; // map of friendId to username
    shareMode: string;
    domainAllowSet: Set<string>;
    domainDenySet: Set<string>;
    currUserInfo: UserInfoPrivate;

    // variables related to presence
    offlinePresenceArr: Presence[] = [];
    offlineUserIdSet: Set<string> = new Set();
    onlineSharingPresenceArr: Presence[] = [];
    onlineSharingUserIdSet: Set<string> = new Set();
    onlineHiddenPresenceArr: Presence[] = [];
    onlineHiddenUserIdSet: Set<string> = new Set();
    userPresence: Presence;
    isPresenceLoaded = false;

    // fontawesome icon
    faChevronCircleRight = faChevronCircleRight;
    faChevronDown = faChevronDown;
    faBullhorn = faBullhorn;

    // variables for public profile component
    showProfile = false;
    profileId: string;

    // variables for current url and domain
    currUrl: string;
    currDomain: string;
    nonSharingDomainArr = ['google.com', 'messenger.com', 'facebook.com', 'notion.so'];

    // variables for managing toolbar
    isToolbarOpen = true;

    spinnerMsg = '';
    userLanguage: string | null | undefined;
    userLanguageSubscription: Subscription;

    constructor(
        // private http: HttpClient,
        private spinner: NgxSpinnerService,
        private translateService: TranslateService,
        private userService: UserService,
        private pagesService: PagesService,
        private languageService: LanguageService
    ) { }

    ngOnInit(): void {
        this.userLanguage = this.translateService.currentLang;
        this.userLanguageSubscription = this.languageService.userLanguageSubject.subscribe(
            (userLanguage: string) => {
                this.userLanguage = userLanguage;
            }
        );
        this.translateService.get("Fetching presence data...").subscribe(
            (res: string) => {
                this.spinnerMsg = res;
            }
        )
        this.spinner.show();

        this.userInfoSubscription = this.userService.currUserInfo.subscribe(
            (res: UserInfoPrivate | null) => {
                if (res) {
                    this.shareMode = res.share_mode;
                    this.domainAllowSet = new Set(res.domain_allow_array);
                    this.domainDenySet = new Set(res.domain_deny_array);
                    this.currUserInfo = res;
                }
            }
        );

        this.pagesService.getPresence()
            .then(res => {
                // separate online and offline presence of friends
                this.offlinePresenceArr = res.presenceArr.filter((x: Presence) => !x.page);
                this.offlineUserIdSet = new Set(this.offlinePresenceArr.map((x: Presence) => x.userId));
                this.onlineSharingPresenceArr = res.presenceArr.filter(
                    (x: Presence) => x.page && x.page.url && x.page.url !== '');
                this.onlineSharingUserIdSet = new Set(this.onlineSharingPresenceArr.map((x: Presence) => x.userId));
                this.onlineHiddenPresenceArr = res.presenceArr.filter(
                    (x: Presence) => x.page && (!x.page.url || x.page.url === ''));
                this.onlineHiddenUserIdSet = new Set(this.onlineHiddenPresenceArr.map((x: Presence) => x.userId));
                this.userPresence = res.userPresence;
                this.userInfoMap = res.userInfoMap;
                this.userId = res.userPresence.userId;
                window.addEventListener('message',
                    this.messageEventListener.bind(this));
                this.spinnerMsg = '';
                this.spinner.hide();
                // get profile image url
                const userIdArr: string[] = [];
                const imgExtArr: string[] = [];
                Object.keys(res.userInfoMap).forEach(userId => {
                    if (res.userInfoMap[userId].profile_image_extension) {
                        userIdArr.push(userId);
                        imgExtArr.push(res.userInfoMap[userId].profile_image_extension);
                    } else {
                        this.userInfoMap[userId].profileImgUrl = USER_DEFAULT_IMG_ASSET;
                    }
                });
                if (userIdArr.length > 0) {
                    this.userService.getProfileImageGetUrlMap(userIdArr, imgExtArr)
                        .then((profileImageUrlMap: {[key: string]: string}) => {
                            for (const userId of userIdArr) {
                                this.userInfoMap[userId].profileImgUrl = profileImageUrlMap[userId];
                            }
                        });
                }
                this.isPresenceLoaded = true;
            })
            .catch(err => {
                console.log(err);
                this.spinnerMsg = '';
                this.spinner.hide();
            });

        // since the client is injected in an iframe, get the current url from background.js
        const message = {
            type: 'get-curr-url'
        };
        chrome.runtime.sendMessage(EXTENSION_ID, message, (response) => {
            if (response && response.code === 'success') {
                this.currUrl = response.data.url;
                this.currDomain = response.data.domain;
            }
        });
    }

    ngOnDestroy(): void {
        window.removeEventListener('message',
            this.messageEventListener.bind(this));
        this.userInfoSubscription?.unsubscribe();
        this.userLanguageSubscription?.unsubscribe();
    }

    private messageEventListener(event: MessageEvent): void {
        if (event.data.type === 'update-presence') { // when a friend's presence information is updated
            const presenceUserId = event.data.data.userId;
            const updatedPresence = {
                userId: event.data.data.userId,
                page: {
                    url: event.data.data.url,
                    title: event.data.data.title,
                    domain: event.data.data.domain
                },
                latestPage: {
                    url: event.data.data.latestUrl,
                    title: event.data.data.latestTitle,
                    domain: event.data.data.latestDomain
                }
            };
            if (presenceUserId === this.userId) {
                this.userPresence = updatedPresence;
            } else {
                console.log(event.data);
                let idxToRemove;
                if (this.offlineUserIdSet.has(presenceUserId)) {
                    // find the presence data to remove from offlinePresenceArr
                    for (let idx = 0; idx < this.offlinePresenceArr.length; idx++) {
                        if (this.offlinePresenceArr[idx].userId === presenceUserId) {
                            idxToRemove = idx;
                            break;
                        }
                    }
                    if (idxToRemove !== undefined && idxToRemove !== null) {
                        this.offlinePresenceArr = [
                            ...this.offlinePresenceArr.slice(0, idxToRemove),
                            ...this.offlinePresenceArr.slice(idxToRemove + 1)
                        ];
                        this.offlineUserIdSet.delete(presenceUserId);
                        if (updatedPresence.page.url && updatedPresence.page.url !== '') {
                            // if the user is sharing acitivity
                            this.onlineSharingPresenceArr = [ updatedPresence, ...this.onlineSharingPresenceArr ];
                            this.onlineSharingUserIdSet.add(presenceUserId);
                        } else {
                            // if the user is not sharing activity
                            this.onlineHiddenPresenceArr = [ updatedPresence, ...this.onlineHiddenPresenceArr ];
                            this.onlineHiddenUserIdSet.add(presenceUserId);
                        }
                    }
                } else if (this.onlineSharingUserIdSet.has(event.data.data.userId)) {
                    // first get the idx in onlineSharingPresenceArr
                    for (let idx = 0; idx < this.onlineSharingPresenceArr.length; idx++) {
                        if (this.onlineSharingPresenceArr[idx].userId === presenceUserId) {
                            idxToRemove = idx;
                            break;
                        }
                    }
                    if (updatedPresence.page.url && updatedPresence.page.url !== '') {
                        // if the user is sharing activity, move to the front
                        if (idxToRemove !== undefined && idxToRemove !== null) {
                            this.onlineSharingPresenceArr = [
                                ...this.onlineSharingPresenceArr.slice(0, idxToRemove),
                                ...this.onlineSharingPresenceArr.slice(idxToRemove + 1)
                            ];
                            this.onlineSharingPresenceArr = [ updatedPresence, ...this.onlineSharingPresenceArr ];
                            this.onlineSharingUserIdSet.add(presenceUserId);
                        }
                    } else {
                        // if the user is not sharing activity, move to the hiddenActivityArray
                        if (idxToRemove !== undefined && idxToRemove !== null) {
                            this.onlineSharingPresenceArr = [
                                ...this.onlineSharingPresenceArr.slice(0, idxToRemove),
                                ...this.onlineSharingPresenceArr.slice(idxToRemove + 1)
                            ];
                            this.onlineSharingUserIdSet.delete(presenceUserId);
                            this.onlineHiddenPresenceArr = [ updatedPresence, ...this.onlineHiddenPresenceArr ];
                            this.onlineHiddenUserIdSet.add(presenceUserId);
                        }
                    }
                } else if (this.onlineHiddenUserIdSet.has(event.data.data.userId)) {
                    // change the order only if the user updates presence to sharing
                    if (updatedPresence.page.url && updatedPresence.page.url !== '') {
                        for (let idx = 0; idx < this.onlineHiddenPresenceArr.length; idx++) {
                            if (this.onlineHiddenPresenceArr[idx].userId === presenceUserId) {
                                idxToRemove = idx;
                                break;
                            }
                        }
                        if (idxToRemove !== undefined && idxToRemove !== null) {
                            this.onlineHiddenPresenceArr = [
                                ...this.onlineHiddenPresenceArr.slice(0, idxToRemove),
                                ...this.onlineHiddenPresenceArr.slice(idxToRemove + 1)
                            ];
                            this.onlineHiddenUserIdSet.delete(presenceUserId);
                            this.onlineSharingPresenceArr = [ updatedPresence, ...this.onlineSharingPresenceArr ];
                            this.onlineSharingUserIdSet.add(presenceUserId);
                        }
                    }
                }
            }
        } else if (event.data.type === 'presence-timeout') { // when a friend goes offline
            const presenceUserId = event.data.data.userId;
            if (!this.offlineUserIdSet.has(presenceUserId)) {
                if (this.onlineSharingUserIdSet.has(presenceUserId)) {
                    let idxToRemove;
                    for (let idx = 0; idx < this.onlineSharingPresenceArr.length; idx++) {
                        if (this.onlineSharingPresenceArr[idx].userId === presenceUserId) {
                            idxToRemove = idx;
                            break;
                        }
                    }
                    if (idxToRemove !== undefined && idxToRemove !== null) {
                        this.onlineSharingPresenceArr = [
                            ...this.onlineSharingPresenceArr.slice(0, idxToRemove),
                            ...this.onlineSharingPresenceArr.slice(idxToRemove + 1)
                        ];
                        this.onlineSharingUserIdSet.delete(presenceUserId);                        
                    }
                } else if (this.onlineHiddenUserIdSet.has(presenceUserId)) {
                    let idxToRemove;
                    for (let idx = 0; idx < this.onlineHiddenPresenceArr.length; idx++) {
                        if (this.onlineHiddenPresenceArr[idx].userId === presenceUserId) {
                            idxToRemove = idx;
                            break;
                        }
                    }
                    if (idxToRemove !== undefined && idxToRemove !== null) {
                        this.onlineHiddenPresenceArr = [
                            ...this.onlineHiddenPresenceArr.slice(0, idxToRemove),
                            ...this.onlineHiddenPresenceArr.slice(idxToRemove + 1)
                        ];
                        this.onlineHiddenUserIdSet.delete(presenceUserId);                        
                    }
                }
                const updatedPresence = {
                    userId: event.data.data.userId,
                    page: null,
                    latestPage: null
                };
                this.offlinePresenceArr = [ updatedPresence, ...this.offlinePresenceArr ];
                this.offlineUserIdSet.add(presenceUserId);
            }
        } else if (event.data.type === 'update-domain-array') { // when user sharing setting is updated
            // if a user changes the sharing setting for a domain through popup, apply the change directly to client
            this.domainAllowSet = new Set(event.data.data.domainAllowArray);
            this.domainDenySet = new Set(event.data.data.domainDenyArray);
        }
    }

    onClickProfile(userId: string): void {
        this.profileId = userId;
        this.showProfile = true;
    }

    onClickBack(): void {
        this.showProfile = false;
    }

    allowCurrDomain(): void {
        // allow curr domain based on share mode
        this.domainAllowSet.add(this.currDomain);
        this.userService.updateUserDomainAllowArray(Array.from(this.domainAllowSet))
            .then(res => {
                this.domainAllowSet = new Set(res.domain_allow_array);
                const message = {
                    type: 'update-user-info',
                    data: {
                        shareMode: res.share_mode,
                        domainAllowSet: res.domain_allow_array,
                        domainDenySet: res.domain_deny_array,
                        updatePresence: true
                    }
                };
                chrome.runtime.sendMessage(EXTENSION_ID, message);
            })
            .catch(err => {
                console.log(err);
            });
    }

    onClickToolbar(): void {
        this.isToolbarOpen = !this.isToolbarOpen;
    }
}
