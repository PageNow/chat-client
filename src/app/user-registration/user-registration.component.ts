import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { Apollo, gql } from 'apollo-angular';
import { Subscription } from "rxjs";
import { Auth } from 'aws-amplify';
import { NgxSpinnerService } from 'ngx-spinner';
import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';

import { AuthState } from "../auth/auth.model";
import { AuthService } from "../auth/auth.service";
import { DEFAULT_AUTH_STATE } from "../shared/constants";
import {
    YEARS, MONTHS, DATES, CURR_YEAR, CURR_MONTH, CURR_DATE,
    isDateValid, MONTHS_STR_TO_NUM
} from "../shared/time_utils";

@Component({
    selector: 'app-user-registration',
    templateUrl: './user-registration.component.html',
    styleUrls: ['./user-registration.component.scss']
})
export class UserRegistrationComponent {
    private uuidSubscription: Subscription;
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

    // fontawesome icons
    faQuestionCircle = faQuestionCircle;

    constructor(
        private router: Router,
        private apollo: Apollo,
        private authService: AuthService,
        private spinner: NgxSpinnerService
    ) {
        console.log('user-registration.component constructor');
        Auth.currentAuthenticatedUser()
            .then(data => {
                this.authState = {
                    isAuthenticated: true,
                    userId: data.username,
                    email: data.attributes.email
                };
                this.uuidSubscription = this.apollo.watchQuery({
                    query: gql`{
                        user(userId: "${data.username}") {
                            userUuid
                        }
                    }`,
                })
                .valueChanges.subscribe((res: any) => {
                    if (res.data?.user) {
                        this.router.navigate([`/profile/${res.data.user.userUuid}`]);
                    }
                });
            })
            .catch(() => {
                this.router.navigate(['/auth/gate'], { replaceUrl: true });
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
        this.apollo.mutate({
            mutation: gql`mutation createMutation {
                createUser(userData: {
                    userId: "${this.authState.userId}",
                    email: "${this.authState.email}",
                    firstName: "${this.firstName}",
                    middleName: "",
                    lastName: "${this.lastName}",
                    dob: "${dob}", gender: "${gender}"
                }) {
                    user {
                        userId, email, firstName, lastName,
                        dob, gender
                    }
                }
            }`
        }).subscribe(res => {
            this.spinner.hide();
            this.router.navigate(['/pages'], { replaceUrl: true});
        }, err => {
            this.spinner.hide();
            this.errorMsg = 'An error occurred! Please try again after refreshing!';
        });
    }
}


/* Notes
 * - We can assume that the user is already authenticated when they reach
 * this page. Thus, only need to check for UUID.
 */