import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { NgxSpinnerService } from 'ngx-spinner';
import {
    faPlus, faMinus, faUserAlt
} from '@fortawesome/free-solid-svg-icons';

import { UserInfoPrivate, UserInfoUpdate } from '../../user/user.model';
import { UserService } from '../../user/user.service';

const SPINNER_FETCH_MSG = 'Fetching user data...';
const SPINNER_UPLOAD_MSG = 'Uploading user data...';

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
    faMinus = faMinus;
    faUserAlt = faUserAlt;

    // Profile Image
    imageToUpload: any;
    imageSelectUrl = ''; // for uploading
    imageUploadErrorMsg = '';
    profileImageUrl = '/assets/user.png'; // for profile image display
    profileImageUploadUrl = '';
    profileImageUploaderOn = false;

    // Name
    firstNameInput = '';
    middleNameInput = '';
    lastNameInput = '';
    nameErrorMsg = '';

    // Description
    descriptionInput = '';
    descriptionErrorMsg = '';

    // Acitivity privacy settings
    activitySettings = '';
    domainAllowArr: string[] = [];
    domainDenyArr: string[] = [];
    domainInput = '';
    activitySettingsErrorMsg = '';

    // Additional information
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
    additionalInfoErrorMsg = '';

    spinnerMsg = '';

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private http: HttpClient,
        private spinner: NgxSpinnerService,
        private userService: UserService
    ) {
        console.log('profile private constructor');
    }

    ngOnInit(): void {
        console.log('profile private oninit');
        this.userUuid = this.route.snapshot.paramMap.get('uuid');
        this.spinnerMsg = SPINNER_FETCH_MSG;
        this.spinner.show();
        this.userInfoSubscription = this.userService.getCurrentUserInfo().subscribe(
            res => {
                this.spinner.hide();
                this.userInfo = res;

                this.firstNameInput = res.first_name;
                this.middleNameInput = res.middle_name;
                this.lastNameInput = res.last_name;

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

                this.userService.getProfileImageGetUrl(res.user_uuid).toPromise()
                    .then(resp => {
                        this.profileImageUrl = resp.data;
                    })
                    .catch(err => {
                        console.log(err);
                        this.profileImageUrl = '/assets/user.png';
                    });

                this.userService.getProfileImageUploadUrl().toPromise()
                    .then(resp => {
                        this.profileImageUploadUrl = resp.data;
                    })
                    .catch(err => {
                        console.log(err);
                    });
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

    saveName(): void {
        if (!this.userInfo) { return; }
        if (this.firstNameInput === '') {
            this.nameErrorMsg = 'First name must not be empty';
            return;
        }
        if (this.lastNameInput === '') {
            this.nameErrorMsg = 'Last name must not be empty';
            return;
        }

        this.spinnerMsg = SPINNER_UPLOAD_MSG;
        this.spinner.show();
        const updatedUserInfo: UserInfoUpdate = {
            ...this.userInfo,

            first_name: this.firstNameInput,
            middle_name: this.middleNameInput,
            last_name: this.lastNameInput
        } as UserInfoUpdate;

        this.userService.updateCurrentUserInfo(updatedUserInfo).subscribe(
            (res: UserInfoPrivate) => {
                this.userInfo = res;
                this.firstNameInput = res.first_name;
                this.middleNameInput = res.middle_name;
                this.lastNameInput = res.last_name;
                this.nameErrorMsg = '';
                this.spinner.hide();
            },
            err => {
                console.log(err);
                this.nameErrorMsg = err.error.detail;
                this.spinner.hide();
            }
        );
    }

    saveDescription(): void {
        if (!this.userInfo) { return; }

        this.spinnerMsg = SPINNER_UPLOAD_MSG;
        this.spinner.show();
        const updatedUserInfo: UserInfoUpdate = {
            ...this.userInfo,

            description: this.descriptionInput
        } as UserInfoUpdate;

        this.userService.updateCurrentUserInfo(updatedUserInfo).subscribe(
            (res: UserInfoPrivate) => {
                this.userInfo = res;
                this.descriptionInput = res.description;
                this.descriptionErrorMsg = '';
                this.spinner.hide();
            },
            err => {
                console.log(err);
                this.descriptionErrorMsg = err.error.detail;
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
        if (!this.userInfo) { return; }

        this.spinnerMsg = SPINNER_UPLOAD_MSG;
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
                this.activitySettingsErrorMsg = '';
                this.spinner.hide();
            },
            err => {
                console.log(err);
                this.activitySettingsErrorMsg = err.error.detail;
                this.spinner.hide();
            }
        );
    }

    saveAdditionalInfo(): void {
        if (!this.userInfo) { return; }

        this.spinnerMsg = SPINNER_UPLOAD_MSG;
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

                this.additionalInfoErrorMsg = '';
                this.spinner.hide();
            },
            err => {
                console.log(err);
                this.additionalInfoErrorMsg = err.error.detail;
                this.spinner.hide();
            }
        );
    }

    onSelectFile(event: any): void {
        if (event.target.files && event.target.files[0]) {
            if (event.target.files[0].size > 2000000) {
                this.imageUploadErrorMsg = 'The file size cannot exceed 2Mb';
                return;
            }
            this.imageToUpload = event.target.files[0];

            // Show image preview
            const reader = new FileReader();
            reader.readAsDataURL(this.imageToUpload);
            reader.onload = (eventLoad: any) => {
                this.imageSelectUrl = eventLoad.target.result;
            };
        }
    }

    uploadProfileImage(): void {
        const httpOptions = {
            headers: {
                'x-amz-acl': 'private',
                'Content-Type': this.imageToUpload.type
            }
        };
        console.log(httpOptions);
        this.http.put(this.profileImageUploadUrl, this.imageToUpload, httpOptions).toPromise()
            .then(res => {
                console.log(res);
                this.profileImageUrl = this.imageSelectUrl;
                this.imageSelectUrl = '';
                this.imageToUpload = null;
                this.toggleProfileImageUploader();
            })
            .catch(err => {
                console.log(err);
            });
    }

    deleteProfileImage(): void {
        this.userService.deleteProfileIamge().toPromise()
            .then(res => {
                console.log(res);
                this.profileImageUrl = '/assets/user.png';
            })
            .catch(err => {
                console.log(err);
            });
    }

    toggleProfileImageUploader(): void {
        this.profileImageUploaderOn = !this.profileImageUploaderOn;
    }
}
