import { Component, OnDestroy } from '@angular/core';
import { Location } from '@angular/common';
import { INITIAL_TAB } from './shared/constants';
import { Auth } from 'aws-amplify';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnDestroy {
    currTab = INITIAL_TAB;

    constructor(location: Location) {
        location.onUrlChange((res) => {
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
                default:
                    break;
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
            console.log('Auth signout');
            Auth.signOut();
        }
    }
}
