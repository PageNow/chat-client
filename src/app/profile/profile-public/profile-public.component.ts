import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from 'rxjs';

import { UserInfoPublic } from 'src/app/user/user.model';
import { UserService } from 'src/app/user/user.service';

@Component({
    selector: 'app-profile-public',
    templateUrl: './profile-public.component.html',
    styleUrls: ['./profile-public.component.scss']
})
export class ProfilePublicComponent implements OnInit, OnDestroy {
    currUserUuid: string;
    userUuid: string;
    userInfo: UserInfoPublic
    userProfileImgUrl = '/assets/user.png';
    currUserInfoSubscription: Subscription;

    constructor(
        private router: Router,
        private spinner: NgxSpinnerService,
        private userService: UserService
    ) { }

    ngOnInit(): void {
        this.userUuid = window.location.href.split('/').slice(-1)[0];
        this.spinner.show();
        this.currUserInfoSubscription = this.userService.currUserInfo.subscribe(
            res => {
                if (res) {
                    this.currUserUuid = res.user_uuid;
                }
            },
            err => {
                console.log(err);
            }
        )
        this.userService.getUserPublicInfo(this.userUuid).toPromise()
            .then((res: UserInfoPublic) => {
                console.log(res);
                this.userInfo = res;
                return this.userService.getProfileImageGetUrl(
                    res.user_uuid, res.profile_image_extension
                ).toPromise();
            })
            .then(res => {
                this.userProfileImgUrl = res;
                this.spinner.hide();
            })
            .catch(err => {
                console.log(err);
                this.spinner.hide();
            });
    }

    ngOnDestroy(): void {
        this.currUserInfoSubscription?.unsubscribe();
    }

    navigateToMyProfile(): void {
        this.router.navigate(['/profile/me']);
    }
}
