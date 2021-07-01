import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from "rxjs";
import { UserInfoPrivate } from "src/app/user/user.model";

import { UserService } from "../../user/user.service";

@Component({
    selector: 'app-profile-private',
    templateUrl: './profile-private.component.html',
    styleUrls: ['./profile-private.component.scss']
})
export class ProfilePrivateComponent implements OnInit, OnDestroy {

    userUuid: string | null;
    userInfo: UserInfoPrivate | null = null;
    userInfoSubscription: Subscription;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private spinner: NgxSpinnerService,
        private userService: UserService
    ) {
        console.log('profile private constructor');
    }

    ngOnInit(): void {
        console.log('profile private oninit')
        this.userUuid = this.route.snapshot.paramMap.get('uuid');
        this.spinner.show();
        this.userInfoSubscription = this.userService.getCurrentUserInfo().subscribe(
            res => {
                this.spinner.hide();
                this.userInfo = res;
                console.log(res);
            },
            err => {
                this.spinner.hide();
                this.router.navigate(['/auth/gate'], { replaceUrl:  true });
            }
        );
    }
    
    ngOnDestroy(): void {
        this.userInfoSubscription?.unsubscribe();
    }
}