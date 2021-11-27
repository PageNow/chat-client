import { Component, OnDestroy, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Auth } from 'aws-amplify';
import { NavigationEnd, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

import { INITIAL_TAB, LANG_EN } from './shared/constants';
import { LANGUAGES } from './shared/config';

declare let gtag: any;

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
    currTab = INITIAL_TAB;

    constructor(
        private location: Location,
        private router: Router,
        private translateService: TranslateService
    ) { }

    ngOnInit(): void {
        this.location.onUrlChange((res) => {
            switch (res.split('/')[1]) {
                case 'pages':
                    this.currTab = 'pages';
                    break;
                case 'profile':
                    this.currTab = 'profile-me';
                    break;
                case 'search':
                    this.currTab = 'search';
                    break;
                case 'notifications':
                    this.currTab = 'notifications';
                    break;
                case 'chat':
                    this.currTab = 'chat';
                    break;
                case 'auth':
                    this.currTab = 'auth';
                    break;
                default:
                    break;
            }
        });

        // set language
        let userLanguage = localStorage.getItem('language');
        if (userLanguage === undefined || userLanguage === null) {
            userLanguage = this.translateService.getBrowserCultureLang();
        }
        if (LANGUAGES.indexOf(userLanguage) == -1) {
            userLanguage = LANG_EN;
        }
        this.translateService.addLangs(LANGUAGES);
        this.translateService.setDefaultLang(LANG_EN);
        this.translateService.use(userLanguage);

        this.router.events.subscribe(event => {
            if (event instanceof NavigationEnd) {
                gtag('config', 'G-ZRRM5WQPV6', {
                    page_path: event.urlAfterRedirects
                });
            }
        });

        window.addEventListener('message',
            this.messageEventListener.bind(this));
    }

    ngOnDestroy(): void {
        window.removeEventListener('message',
            this.messageEventListener.bind(this));
    }

    private messageEventListener(event: MessageEvent): void {
        if (event.data.type === 'auth-null') {
            Auth.signOut();
        }
    }
}
