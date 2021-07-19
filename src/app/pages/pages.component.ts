import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';

import { UserInfoPrivate } from '../user/user.model';
import { UserService } from '../user/user.service';
import { PagesService } from './pages.service';

@Component({
    selector: 'app-pages',
    templateUrl: './pages.component.html',
    styleUrls: ['./pages.component.scss']
})
export class PagesComponent implements OnInit, OnDestroy {
    userInfo: UserInfoPrivate | null = null;
    status = ''; // Result of subscription to AppSync
    statusSubscription: Subscription;

    constructor(
        private router: Router,
        private spinner: NgxSpinnerService,
        private userService: UserService,
        private pagesService: PagesService
    ) {
        // do nothing
    }

    ngOnInit(): void {
        this.spinner.show();
        this.userService.getCurrentUserInfo().toPromise()
            .then(res => {
                this.userInfo = res;
                this.statusSubscribe();
                this.getInitialStatus();
                this.spinner.hide();
            })
            .catch(() => {
                this.spinner.hide();
                this.router.navigate(['/auth/gate'], { replaceUrl:  true });
            });
    }
    
    ngOnDestroy(): void {
        this.statusSubscription.unsubscribe();
    }

    async getInitialStatus(): Promise<void> {
        if (!this.userInfo) { return; }
        const result = await this.pagesService.getStatus(this.userInfo.user_uuid);
        console.log(result);
        this.status = result.data.status.status;
    }

    async statusSubscribe(): Promise<void> {
        if (!this.userInfo) { return; }
        this.statusSubscription = this.pagesService.subscribeToStatus(this.userInfo.user_uuid).subscribe({
            next: (event: any) => {
                console.log(event);
                this.status = event.value.data.onStatus.status;
            }
        })
    }

    onConnect(): void {
        if (!this.userInfo) { return; }
        this.pagesService.connect(this.userInfo.user_uuid);
    }

    onSendHeartbeat(): void {
        if (!this.userInfo) { return; }
        this.pagesService.sendHearteat(this.userInfo.user_uuid);
    }

    onDisconnect(): void {
        if (!this.userInfo) { return; }
        this.pagesService.disconnect(this.userInfo.user_uuid);
    }
}
