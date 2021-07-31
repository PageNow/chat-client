import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';

import { TabsComponent } from '../tabs/tabs.component';
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
    url = '';
    title = '';
    statusSubscription: Subscription;

    @ViewChild(TabsComponent)
    private tabsComponent: TabsComponent;

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
        this.userService.currUserInfo.subscribe(
            res => {
                console.log(res);
                this.spinner.hide();
            },
            err => {
                console.log(err);
                this.spinner.hide();
            }
        )
        // this.userService.getCurrentUserInfo().toPromise()
        //     .then(res => {
        //         this.userInfo = res;
        //         this.statusSubscribe();
        //         this.getInitialStatus();
        //         this.spinner.hide();
        //     })
        //     .catch(() => {
        //         this.spinner.hide();
        //         this.router.navigate(['/auth/gate'], { replaceUrl:  true });
        //     });
    }
    
    ngOnDestroy(): void {
        this.statusSubscription?.unsubscribe();
    }

    async getInitialStatus(): Promise<void> {
        if (!this.userInfo) { return; }
        const result = await this.pagesService.getStatus(this.userInfo.user_id);
        console.log(result);
        this.status = result.data.status.status;
        this.url = result.data.status.url;
        this.title = result.data.status.title;
    }

    async statusSubscribe(): Promise<void> {
        if (!this.userInfo) { return; }
        this.statusSubscription = this.pagesService.subscribeToStatus(this.userInfo.user_id).subscribe({
            next: (event: any) => {
                this.status = event.value.data.onStatus.status;
                this.url = event.value.data.onStatus.url;
                this.title = event.value.data.onStatus.title;
            }
        })
    }

    onConnect(): void {
        if (!this.userInfo) { return; }
        this.pagesService.connect(this.tabsComponent.currUrl, this.tabsComponent.currTitle);
    }

    onSendHeartbeat(): void {
        if (!this.userInfo) { return; }
        this.pagesService.sendHeartbeat('test_url', 'test_title');
    }

    onDisconnect(): void {
        if (!this.userInfo) { return; }
        this.pagesService.disconnect();
    }
}
