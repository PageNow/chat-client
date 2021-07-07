import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription } from "rxjs";
import { UserInfoPrivate, UserInfoUpdate } from "src/app/user/user.model";
import {
    faPlus, faMinus
} from '@fortawesome/free-solid-svg-icons';

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
    faPlus = faPlus;
    faMinus= faMinus;

    descriptionInput = '';
    activitySettings = '';
    domainAllowArr: string[] = [];
    domainDenyArr: string[] = [];
    domainInput = '';

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
                console.log(res);
                this.spinner.hide();
                this.userInfo = res;

                this.descriptionInput = res.description;
                this.activitySettings = res.share_mode === 'default_all' ? 'share' : 'hide';
                this.domainAllowArr = res.domain_allow_array.sort();
                this.domainDenyArr = res.domain_deny_array.sort();

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

    saveDescription(): void {
        if (!this.userInfo) return;

        this.spinner.show();
        const updatedUserInfo: UserInfoUpdate = {
            ...this.userInfo,

            description: this.descriptionInput
        } as UserInfoUpdate;

        this.userService.updateCurrentUserInfo(updatedUserInfo).subscribe(
            (res: UserInfoPrivate) => {
                this.userInfo = res;
                this.descriptionInput = res.description;
                this.spinner.hide();
            },
            err => {
                console.log(err);
                this.errorMsg = err.error.detail;
                this.spinner.hide();
            }
        );
    }

    removeDomain(domainIdx: number): void {
        if (this.activitySettings === 'share') {
            this.domainDenyArr.splice(domainIdx, 1);
        } else if (this.activitySettings === 'hide') {
            this.domainAllowArr.splice(domainIdx, 1);
        } else {
            return;
        }
    }
    
    addDomain(): void {
        if (this.activitySettings === 'share') {
            this.domainDenyArr.push(this.domainInput);
            this.domainDenyArr.sort();
        } else if (this.activitySettings === 'hide') {
            this.domainAllowArr.push(this.domainInput);
            this.domainAllowArr.sort();
        } else {
            return;
        }
        this.domainInput = '';
    }

    saveActivitySettings(): void {
        if (!this.userInfo) return;

        this.spinner.show();
        const updatedUserInfo: UserInfoUpdate = {
            ...this.userInfo,

            share_mode: this.activitySettings === 'share' ? 'default_all' : 'default_none',
            domain_allow_arr: this.domainAllowArr,
            domain_deny_arr: this.domainDenyArr
        } as UserInfoUpdate;

        this.userService.updateCurrentUserInfo(updatedUserInfo).subscribe(
            (res: UserInfoPrivate) => {
                this.userInfo = res;
                this.activitySettings = res.share_mode === 'default_all' ? 'share' : 'hide';
                this.domainAllowArr = res.domain_allow_array;
                this.domainDenyArr = res.domain_deny_array;
                this.domainAllowArr.sort();
                this.domainDenyArr.sort();
                this.spinner.hide();
            },
            err => {
                console.log(err);
                this.errorMsg = err.error.detail;
                this.spinner.hide();
            }
        )
    }

    saveAdditionalInfo(): void {
        if (!this.userInfo) return;

        this.spinner.show();
        const updatedUserInfo: UserInfoUpdate = {
            ...this.userInfo,

            gender: this.genderInput,
            school: this.schoolInput,
            work: this.workInput,
            location: this.locationInput,

            email_public: this.emailOption === 'public' ? true : false,
            gender_public: this.genderOption === 'public' ? true : false,
            school_public: this.schoolOption === 'public' ? true : false,
            work_public: this.workOption === 'public' ? true : false,
            location_public: this.locationOption === 'public' ? true : false
        } as UserInfoUpdate;

        this.userService.updateCurrentUserInfo(updatedUserInfo).subscribe(
            (res: UserInfoPrivate) => {
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

                this.spinner.hide();
            },
            err => {
                console.log(err);
                this.errorMsg = err.error.detail;
                this.spinner.hide();
            }
        );
    }
}