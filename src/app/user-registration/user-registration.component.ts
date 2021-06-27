import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { NgxSpinnerService } from 'ngx-spinner';

import { AuthState } from "../auth/auth.model";
import { AuthService } from "../auth/auth.service";
import { DEFAULT_AUTH_STATE } from "../shared/constants";
import {
    YEARS, MONTHS, DATES, CURR_YEAR, CURR_MONTH, CURR_DATE,
    isDateValid, MONTHS_STR_TO_NUM
} from "../shared/time_utils";
import { UserService } from "../user/user.service";
import { UserCreate } from "../user/user.model";

@Component({
    selector: 'app-user-registration',
    templateUrl: './user-registration.component.html',
    styleUrls: ['./user-registration.component.scss']
})
export class UserRegistrationComponent {
    private authState: AuthState = DEFAULT_AUTH_STATE;

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
        private authService: AuthService,
        private userService: UserService
    ) {
        console.log('user-registration.component constructor');

        this.authService.auth$.subscribe((authState: AuthState) => {
            this.spinner.show();            
            if (!authState.isAuthenticated) {
                this.spinner.hide();
                this.router.navigate(['/auth/gate'], { replaceUrl: true });
            } else {
                this.userService.getCurrentUserInfo().subscribe(
                    res => {
                        this.spinner.hide();
                        this.router.navigate([`/profile/${res.userUuid}`]);
                    },
                    () => {
                        this.spinner.hide();
                    });
            }
        });
    }

    onSubmitUserInfo():void {
        // TODO: disable account if the user is under 13
        this.spinner.show();
        const dobMonthNum = (MONTHS_STR_TO_NUM[this.dobMonth] + 1) + ''
        const dob = this.dobYear + '-' + dobMonthNum.padStart(2, '0')
                    + '-' + this.dobDate;
        if (!isDateValid(dob)) {
            this.errorMsg = 'Date of birth is an invalid date.';
            this.spinner.hide();
            return;
        }
        let gender = this.gender;
        if (this.gender === 'other' && this.otherGender !== '') {
            gender = this.otherGender;
        }
        
        const userInfo: UserCreate = {
            first_name: this.firstName,
            middle_name: "",
            last_name: this.lastName,
            dob: dob,
            gender: gender
        }
        this.userService.submitCurrentUserInfo(userInfo).subscribe(
            res => {
                this.spinner.hide();
                this.router.navigate(['/pages'], { replaceUrl: true});
            },
            err => {
                this.spinner.hide();
                this.errorMsg = 'Sorry, there is an error. Please try again after refreshing.';
            }
        );
    }
}


/* Notes
 * - We can assume that the user is already authenticated when they reach
 * this page. Thus, only need to check for UUID.
 */