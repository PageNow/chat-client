import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { INITIAL_TAB } from './shared/constants';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
    currTab = INITIAL_TAB;
    
    constructor(location: Location) {
        location.onUrlChange((res) => {
            switch(res) {
                case '/pages':
                    this.currTab = 'pages';
                    break;
                case '/profile/me':
                    this.currTab = 'profile-me';
                    break;
                default:
                    break;
            }
        });
    }
}
