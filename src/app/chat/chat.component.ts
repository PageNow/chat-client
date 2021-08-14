import { Component, OnDestroy, OnInit } from "@angular/core";
import { NgxSpinnerService } from "ngx-spinner";
import { Subscription } from "rxjs";
import { UserInfoPrivate } from "../user/user.model";

import { UserService } from "../user/user.service";
import { ChatService } from "./chat.service";


@Component({
    selector: 'app-chat',
    templateUrl: './chat.component.html',
    styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit, OnDestroy {
    userInfo: UserInfoPrivate | null = null;
    currUserInfoSubscription: Subscription;

    constructor(
        private spinner: NgxSpinnerService,
        private userService: UserService,
        private chatService: ChatService
    ) { }

    ngOnInit(): void {
        this.spinner.show();
        this.currUserInfoSubscription = this.userService.currUserInfo.subscribe(
            res => {
                console.log(res);
                if (res) {
                    this.userInfo = res;
                }
                this.spinner.hide();
            },
            err => {
                console.log(err);
                this.spinner.hide();
            }
        );
    }

    ngOnDestroy(): void {
        this.currUserInfoSubscription?.unsubscribe();
    }
}