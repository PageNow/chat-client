import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from "rxjs";
import { UserInfoPrivate, UserInfoUpdate } from "src/app/user/user.model";

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

    emailInput = '';
    genderInput = '';
    schoolInput = '';
    workInput = '';
    locationInput = '';

    emailOption = '';
    genderOption = '';
    schoolOption = '';
    workOption = '';
    locationOption = '';

    errorMsg = '';

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

                this.emailInput = res.email;
                this.genderInput = res.gender;
                this.schoolInput = res.school;
                this.workInput = res.work;
                this.locationInput = res.location;

                this.emailOption = res.email_public ? 'public' : 'private';
                this.genderOption = res.gender_public ? 'public' : 'private';
                this.schoolOption = res.school_public ? 'public' : 'private';
                this.workOption = res.work_public ? 'public' : 'private';
                this.locationOption = res.location_public ? 'public' : 'private';
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

    saveAdditionalInfo(): void {
        if (!this.userInfo) return;

        const updatedUserInfo: UserInfoUpdate = {
            gender: this.genderInput,
            school: this.schoolInput,
            work: this.workInput,
            location: this.locationInput,

            email_public: this.emailOption === 'public' ? true : false,
            gender_public: this.genderOption === 'public' ? true : false,
            school_public: this.schoolOption === 'public' ? true : false,
            work_public: this.workOption === 'public' ? true : false,
            location_public: this.locationOption === 'public' ? true : false
        };

        this.userService.updateCurrentUserInfo(updatedUserInfo).subscribe(
            res => {
                this.userInfo = res;
            },
            err => {
                console.log(err);
                this.errorMsg = err.error.detail;
            }
        )
    }
}