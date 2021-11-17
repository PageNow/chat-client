import { Component, OnDestroy, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { INITIAL_TAB } from './shared/constants';
import { Auth } from 'aws-amplify';
import { NavigationEnd, Router } from '@angular/router';

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
        private router: Router
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
