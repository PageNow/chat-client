import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';
import { EXTENSION_ID } from '../shared/config';
import { UserInfoPrivate } from '../user/user.model';
import { UserService } from '../user/user.service';

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
    presenceArr: any = [];
    userPresence: any;

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
                console.log(res);
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
                this.presenceArr = res.presenceArr;
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
                    userIdArr.push(userId);
                    imgExtArr.push(res.userInfoMap[userId].profile_image_extension);
                });
                this.userService.getProfileImageGetUrlMap(userIdArr, imgExtArr)
                    .then((profileImageUrlMap: {[key: string]: string}) => {
                        for (const userId of userIdArr) {
                            this.userInfoMap[userId].profileImgUrl = profileImageUrlMap[userId];
                        }
                        console.log(this.userInfoMap);
                    });
            })
            .catch(err => {
                console.log(err);
                this.spinnerMsg = '';
                this.spinner.hide();
            });
        const message = {
            type: 'get-curr-url'
        };
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
            if (event.data.data.userId === this.userId) {
                this.userPresence = {
                    userId: event.data.data.userId,
                    page: {
                        url: event.data.data.url,
                        title: event.data.data.title,
                        domain: event.data.data.domain
                    }
                };
            } else {
                let idxToRemove;
                for (let idx = 0; idx < this.presenceArr.length; idx++) {
                    if (this.presenceArr[idx].userId === event.data.data.userId) {
                        idxToRemove = idx;
                        break;
                    }
                }
                if (idxToRemove !== undefined && idxToRemove !== null) {
                    this.presenceArr = [ ...this.presenceArr.slice(0, idxToRemove), ...this.presenceArr.slice(idxToRemove + 1) ];
                    const updatedUserPresence = {
                        userId: event.data.data.userId,
                        page: {
                            url: event.data.data.url,
                            title: event.data.data.title,
                            domain: event.data.data.domain
                        }
                    };
                    this.presenceArr = [ updatedUserPresence, ...this.presenceArr ];
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
    }
}
