import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { Auth } from 'aws-amplify';

import {
    YEARS, MONTHS, DATES, CURR_YEAR, CURR_MONTH, CURR_DATE,
    isDateValid, MONTHS_STR_TO_NUM
} from '../shared/time_utils';
import { UserService } from '../user/user.service';
import { UserCreate } from '../user/user.model';

@Component({
    selector: 'app-user-registration',
    templateUrl: './user-registration.component.html',
    styleUrls: ['./user-registration.component.scss']
})
export class UserRegistrationComponent implements OnInit {
    // used in template dob
    years = YEARS;
    months = MONTHS;
    dates = DATES;

    // values used in template input/select
    firstName = '';
    lastName = '';
    dobYear = CURR_YEAR;
    dobMonth = MONTHS[CURR_MONTH];
    dobDate = CURR_DATE;
    gender = '';
    otherGender = '';

    errorMsg = '';

    constructor(
        private router: Router,
        private spinner: NgxSpinnerService,
        private userService: UserService
    ) { }

    ngOnInit(): void {
        console.log('user-registration onInit');
        Auth.currentAuthenticatedUser()
            .then(() => {
                return this.userService.getCurrentUserInfo();
            })
            .then(res => {
                this.router.navigate([`/profile/${res.user_id}`]);
                window.location.reload();
            })
            .catch(err => {
                console.log(err);
                if (err.status !== 404) {
                    this.router.navigate(['/auth/gate'], { replaceUrl: true });
                }
            });
    }

    onSubmitUserInfo(): void {
        // TODO: disable account if the user is under 13
        this.spinner.show();
        const dobMonthNum = (MONTHS_STR_TO_NUM[this.dobMonth] + 1) + '';
        const dob = this.dobYear + '-' + dobMonthNum.padStart(2, '0')
                    + '-' + this.dobDate;
        if (!isDateValid(dob)) {
            this.errorMsg = 'Date of birth is an invalid date.';
            this.spinner.hide();
            return;
        }

        const userInfo: UserCreate = {
            first_name: this.firstName,
            last_name: this.lastName,
            gender: this.gender === 'other' && this.otherGender !== '' ?
                    this.otherGender : this.gender,
            dob
        };
        this.userService.createCurrentUserInfo(userInfo).toPromise()
            .then(res => {
                this.userService.publishCurrentUserInfo(res);
                this.spinner.hide();
                this.router.navigate(['/pages'], { replaceUrl: true });
            })
            .catch(err => {
                console.log(err);
                this.spinner.hide();
                this.errorMsg = 'Sorry, there is an error. Please try again after refreshing.';
            });
    }
}
