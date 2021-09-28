import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { UserService } from '../user/user.service';

import { PagesService } from './pages.service';

const SPINNER_PAGES_INIT_MSG = 'Fetching data...';

@Component({
    selector: 'app-pages',
    templateUrl: './pages.component.html',
    styleUrls: ['./pages.component.scss']
})
export class PagesComponent implements OnInit, OnDestroy {
    userId: string;
    userInfoMap: {[key: string]: any} = {}; // map of friendId to username
    presenceArr: any = [];
    userPresence: any;

    // userNameInput = '';

    // variables for public profile component
    showProfile = false;
    profileId: string;

    spinnerMsg = '';

    constructor(
        private spinner: NgxSpinnerService,
        private userService: UserService,
        private pagesService: PagesService
    ) { }

    ngOnInit(): void {
        this.spinnerMsg = SPINNER_PAGES_INIT_MSG;
        this.spinner.show();
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
                const userIdArr: string[] = [], imgExtArr: string[] = [];
                Object.keys(res.userInfoMap).forEach(userId => {
                    userIdArr.push(userId);
                    imgExtArr.push(res.userInfoMap[userId].profile_image_extension);
                });
                this.userService.getProfileImageGetUrlArr(userIdArr, imgExtArr).toPromise()
                    .then(res => {
                        for (let i = 0; i < userIdArr.length; i++) {
                            this.userInfoMap[userIdArr[i]]['profileImgUrl'] = res[userIdArr[i]];
                        }
                        console.log(this.userInfoMap);
                    })
            })
            .catch(err => {
                console.log(err);
                this.spinnerMsg = '';
                this.spinner.hide();
            });
    }

    ngOnDestroy(): void {
        window.removeEventListener('message',
            this.messageEventListener.bind(this));
    }

    private messageEventListener(event: MessageEvent): void {
        if (event.data.type === 'update-presence') {
            console.log(event.data.data);
            if (event.data.data.userId === this.userId) {
                this.userPresence = {
                    userId: event.data.data.userId,
                    page: {
                        url: event.data.data.url,
                        title: event.data.data.title,
                        domain: event.data.data.domain
                    }
                }
            } else {
                let idxToRemove;
                for (let idx = 0; idx < this.presenceArr.length; idx++) {
                    if (this.presenceArr[idx].userId === event.data.data.userId) {
                        idxToRemove = idx;
                        break;
                    }
                }
                if (idxToRemove !== undefined && idxToRemove !== null) {
                    this.presenceArr = [ ...this.presenceArr.slice(0, idxToRemove), ...this.presenceArr.slice(idxToRemove + 1) ]
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
}
