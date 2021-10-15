import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpBackend, HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { NgxSpinnerService } from 'ngx-spinner';
import {
    faPlus, faMinus, faUserAlt
} from '@fortawesome/free-solid-svg-icons';

import { UserInfoPrivate, UserInfoUpdate } from '../../user/user.model';
import { UserService } from '../../user/user.service';
import { VALID_PROFILE_IMG_TYPES } from '../../shared/constants';

const SPINNER_FETCH_MSG = 'Fetching user data...';
const SPINNER_UPLOAD_MSG = 'Uploading user data...';
const SPINNER_IMAGE_UPLOAD_MSG = 'Uploading profile image...';

@Component({
    selector: 'app-profile-private',
    templateUrl: './profile-private.component.html',
    styleUrls: ['./profile-private.component.scss']
})
export class ProfilePrivateComponent implements OnInit, OnDestroy {
    userInfo: UserInfoPrivate | null = null;
    currUserInfoSubscription: Subscription;
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

    private s3Http: HttpClient;

    constructor(
        private router: Router,
        private handler: HttpBackend,
        private spinner: NgxSpinnerService,
        private userService: UserService
    ) {
        this.s3Http = new HttpClient(handler);
    }

    ngOnInit(): void {
        this.spinnerMsg = SPINNER_FETCH_MSG;
        this.spinner.show();
        this.currUserInfoSubscription = this.userService.currUserInfo.subscribe(
            res => {
                if (res) {
                    this.userInfo = res;

                    this.firstNameInput = res.first_name;
                    this.lastNameInput = res.last_name;

                    this.descriptionInput = res.description;
                    this.activitySettings = res.share_mode === 'default_all' ? 'hide' : 'share';
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

                    this.userService.getProfileImageGetUrl(
                        res.user_id, res.profile_image_extension
                    ).toPromise()
                        .then(resp => {
                            this.profileImageUrl = resp;
                        })
                        .catch(err => {
                            console.log(err);
                            this.profileImageUrl = '/assets/user.png';
                        });
                    this.spinnerMsg = '';
                    this.spinner.hide();
                }
            },
            err => {
                console.log(err);
                this.spinnerMsg = '';
                this.spinner.hide();
                this.router.navigate(['/auth/gate'], { replaceUrl:  true });
            }
        );
    }

    ngOnDestroy(): void {
        this.currUserInfoSubscription?.unsubscribe();
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
            last_name: this.lastNameInput
        } as UserInfoUpdate;

        this.userService.updateCurrentUserInfo(updatedUserInfo)
            .then((res: UserInfoPrivate) => {
                this.userService.publishCurrentUserInfo(res);
                this.userInfo = res;
                this.firstNameInput = res.first_name;
                this.lastNameInput = res.last_name;
                this.nameErrorMsg = '';
                this.spinnerMsg = '';
                this.spinner.hide();
            })
            .catch(err => {
                console.log(err);
                this.nameErrorMsg = 'Saving name failed';
                this.spinnerMsg = '';
                this.spinner.hide();
            });
    }

    saveDescription(): void {
        if (!this.userInfo) { return; }

        this.spinnerMsg = SPINNER_UPLOAD_MSG;
        this.spinner.show();
        const updatedUserInfo: UserInfoUpdate = {
            ...this.userInfo,

            description: this.descriptionInput
        } as UserInfoUpdate;

        this.userService.updateCurrentUserInfo(updatedUserInfo)
            .then((res: UserInfoPrivate) => {
                this.userService.publishCurrentUserInfo(res);
                this.userInfo = res;
                this.descriptionInput = res.description;
                this.descriptionErrorMsg = '';
                this.spinnerMsg = '';
                this.spinner.hide();
            })
            .catch(err => {
                console.log(err);
                this.descriptionErrorMsg = 'Saving description failed';
                this.spinnerMsg = '';
                this.spinner.hide();
            });
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
        if (this.activitySettings === 'hide') {
            this.domainDenyArr.push(this.domainInput);
            this.domainDenyArr.sort();
        } else if (this.activitySettings === 'share') {
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

            share_mode: this.activitySettings === 'share' ? 'default_none' : 'default_all',
            domain_allow_arr: this.domainAllowArr,
            domain_deny_arr: this.domainDenyArr
        } as UserInfoUpdate;

        this.userService.updateCurrentUserInfo(updatedUserInfo)
            .then((res: UserInfoPrivate) => {
                this.userService.publishCurrentUserInfo(res);
                this.userInfo = res;
                this.activitySettings = res.share_mode === 'default_all' ? 'hide' : 'share';
                this.domainAllowArr = res.domain_allow_array;
                this.domainDenyArr = res.domain_deny_array;
                this.domainAllowArr.sort();
                this.domainDenyArr.sort();
                this.activitySettingsErrorMsg = '';
                this.spinnerMsg = '';
                this.spinner.hide();
            })
            .catch(err => {
                console.log(err);
                this.activitySettingsErrorMsg = 'Saving activity settings failed';
                this.spinnerMsg = '';
                this.spinner.hide();
            });
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

        this.userService.updateCurrentUserInfo(updatedUserInfo)
            .then((res: UserInfoPrivate) => {
                this.userService.publishCurrentUserInfo(res);
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
                this.spinnerMsg = '';
                this.spinner.hide();
            })
            .catch(err => {
                console.log(err);
                this.additionalInfoErrorMsg = 'Saving additional info failed';
                this.spinnerMsg = '';
                this.spinner.hide();
            });
    }

    onSelectFile(event: any): void {
        this.imageUploadErrorMsg = '';
        if (event.target.files && event.target.files[0]) {
            if (event.target.files[0].size > 2000000) {
                this.imageUploadErrorMsg = 'The file size cannot exceed 2Mb';
                return;
            }
            if (!VALID_PROFILE_IMG_TYPES.includes(event.target.files[0].type)) {
                this.imageUploadErrorMsg = 'File type must be one of .png, .jpeg, and .jpg';
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
        this.spinnerMsg = SPINNER_IMAGE_UPLOAD_MSG;
        const imageExt = this.imageToUpload.type.split('/')[1];
        this.userService.getProfileImageUploadUrl(imageExt).toPromise()
            .then(res => {
                console.log(res);
                console.log(this.imageToUpload);
                const uploadUrl = res;
                console.log(uploadUrl);
                const httpOptions = {
                    headers: {
                        'x-amz-acl': 'private',
                        'Content-Type': this.imageToUpload.type
                    }
                };
                return this.s3Http.put(uploadUrl, this.imageToUpload, httpOptions).toPromise();
            })
            .then(() => {
                this.profileImageUrl = this.imageSelectUrl;
                this.imageSelectUrl = '';
                this.imageToUpload = null;
                this.imageUploadErrorMsg = '';
                this.toggleProfileImageUploader();
            })
            .catch(err => {
                console.log(err);
                this.imageUploadErrorMsg = 'Sorry, something went wrong';
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
