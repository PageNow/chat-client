import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';

import { UserInfoPrivate } from '../user/user.model';
import { PagesService } from './pages.service';

@Component({
    selector: 'app-pages',
    templateUrl: './pages.component.html',
    styleUrls: ['./pages.component.scss']
})
export class PagesComponent implements OnInit, OnDestroy {
    userInfo: UserInfoPrivate | null = null;

    constructor(
        private spinner: NgxSpinnerService,
        private pagesService: PagesService
    ) { }

    ngOnInit(): void {
        this.spinner.show();
        this.pagesService.getPresence()
            .then(res => {
                console.log(res);
                window.addEventListener('message',
                    this.messageEventListener.bind(this));
                this.spinner.hide();
            })
            .catch(err => {
                console.log(err);
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
        }
    }
}
