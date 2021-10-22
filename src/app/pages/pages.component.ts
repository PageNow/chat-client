import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';
import { EXTENSION_ID } from '../shared/config';
import { USER_DEFAULT_IMG_ASSET } from '../shared/constants';
import { UserInfoPrivate } from '../user/user.model';
import { UserService } from '../user/user.service';
import { Presence } from './pages.model';

import { PagesService } from './pages.service';

const SPINNER_PAGES_INIT_MSG = 'Fetching data...';

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

    // variables related to presence
    offlinePresenceArr: Presence[] = [];
    offlineUserIdSet: Set<string> = new Set();
    onlinePresenceArr: Presence[] = [];
    onlineUserIdSet: Set<string> = new Set();
    userPresence: Presence;
    isPresenceLoaded = false;

    // userNameInput = '';

    // variables for public profile component
    showProfile = false;
    profileId: string;

    // variables for current url and domain
    currUrl: string;
    currDomain: string;

    spinnerMsg = '';

    constructor(
        private spinner: NgxSpinnerService,
        private userService: UserService,
        private pagesService: PagesService
    ) { }

    ngOnInit(): void {
        this.spinnerMsg = SPINNER_PAGES_INIT_MSG;
        this.spinner.show();

        this.userInfoSubscription = this.userService.currUserInfo.subscribe(
            (res: UserInfoPrivate | null) => {
                if (res) {
                    this.shareMode = res.share_mode;
                    this.domainAllowSet = new Set(res.domain_allow_array);
                    this.domainDenySet = new Set(res.domain_deny_array);
                }
            },
            (err: any) => {
                console.log(err);
            }
        );

        this.pagesService.getPresence()
            .then(res => {
                console.log(res);
                this.offlinePresenceArr = res.presenceArr.filter((x: Presence) => !x.page);
                this.offlineUserIdSet = new Set(this.offlinePresenceArr.map((x: Presence) => x.userId));
                this.onlinePresenceArr = res.presenceArr.filter((x: Presence) => x.page);
                this.onlineUserIdSet = new Set(this.onlinePresenceArr.map((x: Presence) => x.userId));
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
                            console.log(this.userInfoMap);
                        });
                }
                this.isPresenceLoaded = true;
            })
            .catch(err => {
                console.log(err);
                this.spinnerMsg = '';
                this.spinner.hide();
            });

        const message = {
            type: 'get-curr-url'
        };
        console.log('sending get-curr-url message');
        chrome.runtime.sendMessage(EXTENSION_ID, message, (response) => {
            console.log(response);
            if (response.code === 'success') {
                this.currUrl = response.data.url;
                this.currDomain = response.data.domain;
            }
        });
    }

    ngOnDestroy(): void {
        window.removeEventListener('message',
            this.messageEventListener.bind(this));
        this.userInfoSubscription?.unsubscribe();
    }

    private messageEventListener(event: MessageEvent): void {
        if (event.data.type === 'update-presence') {
            console.log(event.data);
            const presenceUserId = event.data.data.userId;
            const updatedPresence = {
                userId: event.data.data.userId,
                page: {
                    url: event.data.data.url,
                    title: event.data.data.title,
                    domain: event.data.data.domain
                }
            };
            if (presenceUserId === this.userId) {
                this.userPresence = updatedPresence;
            } else {
                let idxToRemove;
                if (this.offlineUserIdSet.has(presenceUserId)) {
                    // move from offlinePresenceArr to onlinePresenceArr
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
                        this.onlinePresenceArr = [ updatedPresence, ...this.onlinePresenceArr ];
                        console.log(this.offlineUserIdSet, this.onlineUserIdSet);
                        this.offlineUserIdSet.delete(presenceUserId);
                        this.onlineUserIdSet.add(presenceUserId);
                        console.log(this.offlineUserIdSet, this.onlineUserIdSet);
                    }
                } else if (this.onlineUserIdSet.has(event.data.data.userId)) {
                    // move to the front of onlinePresenceArr
                    for (let idx = 0; idx < this.onlinePresenceArr.length; idx++) {
                        if (this.onlinePresenceArr[idx].userId === presenceUserId) {
                            idxToRemove = idx;
                            break;
                        }
                    }
                    if (idxToRemove !== undefined && idxToRemove !== null) {
                        this.onlinePresenceArr = [ 
                            ...this.onlinePresenceArr.slice(0, idxToRemove),
                            ...this.onlinePresenceArr.slice(idxToRemove + 1)
                        ];
                        this.onlinePresenceArr = [ updatedPresence, ...this.onlinePresenceArr ];
                        this.onlineUserIdSet.add(presenceUserId);
                    }
                }
            }
        } else if (event.data.type === 'presence-timeout') {
            console.log(event.data);
            const presenceUserId = event.data.data.userId;
            if (this.onlineUserIdSet.has(presenceUserId)) {
                let idxToRemove;
                for (let idx = 0; idx < this.onlinePresenceArr.length; idx++) {
                    if (this.onlinePresenceArr[idx].userId === presenceUserId) {
                        idxToRemove = idx;
                        break;
                    }
                }
                if (idxToRemove !== undefined && idxToRemove !== null) {
                    this.onlinePresenceArr = [
                        ...this.onlinePresenceArr.slice(0, idxToRemove),
                        ...this.onlinePresenceArr.slice(idxToRemove + 1)
                    ];
                    const updatedPresence = {
                        userId: event.data.data.userId,
                        page: null
                    };
                    this.offlinePresenceArr = [ ...this.offlinePresenceArr, updatedPresence ];
                    this.onlineUserIdSet.delete(presenceUserId);
                    this.offlineUserIdSet.add(presenceUserId);
                }
            }
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
            })
    }


}
