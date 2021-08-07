import { Component } from '@angular/core';
import { faSearch, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { forkJoin } from 'rxjs';

import { SearchService } from './search.service';
import { UserInfoSummary } from '../user/user.model';
import { SEARCH_RESULT_LIMIT } from '../shared/constants';
import { UserService } from '../user/user.service';
import { NgxSpinnerService } from 'ngx-spinner';

const SPINNER_SEARCH_MSG = 'Searching users...';

@Component({
    selector: 'app-search',
    templateUrl: './search.component.html',
    styleUrls: ['./search.component.scss']
})
export class SearchComponent {
    faSearch = faSearch;
    faTimesCircle = faTimesCircle;

    searchOption = 'email';
    searchInput = '';
    searchPlaceholder = 'Enter email...';

    searched = false;
    searchedFriendArr: UserInfoSummary[] = [];
    searchedUserArr: UserInfoSummary[] = [];
    searchedFriendIdSet: Set<string> = new Set();
    friendProfileImgUrlArr: string[] = [];
    userProfileImgUrlArr: string[] = [];

    endOfFriendsSearch = false;
    endOfUsersSearch = false;

    // variables for public profile component
    showProfile = false;
    profileUuid: string;

    spinnerMsg = '';

    constructor(
        private spinner: NgxSpinnerService,
        private searchService: SearchService,
        private userService: UserService
    ) { }

    onSearch(): void {
        this.searched = true;
        this.searchedFriendIdSet = new Set();
        this.friendProfileImgUrlArr = [];
        this.userProfileImgUrlArr = [];
        this.endOfFriendsSearch = false;
        this.endOfUsersSearch = false;
        this.spinnerMsg = SPINNER_SEARCH_MSG;
        this.spinner.show();
        if (this.searchOption === 'email') {
            this.searchService.searchFriendsByEmail(this.searchInput, false, SEARCH_RESULT_LIMIT, this.searchedFriendArr.length)
                .then((res: UserInfoSummary[]): Promise<UserInfoSummary[]> => {
                    if (res.length >= 0 && res.length < SEARCH_RESULT_LIMIT) {
                        this.endOfFriendsSearch = true;
                    }
                    res.map(x => this.searchedFriendIdSet.add(x.user_id));
                    this.searchedFriendArr = res;
                    if (res.length > 0) {
                        this.updateProfileImgArr(res, true);
                    }
                    return this.searchService.searchUsersByEmail(this.searchInput, false, SEARCH_RESULT_LIMIT - res.length, 0);
                })
                .then(res => {
                    if (this.endOfFriendsSearch && res.length === 0) {
                        this.endOfUsersSearch = true;
                    }
                    const resUserArr = res.filter(x => !this.searchedFriendIdSet.has(x.user_id));
                    this.searchedUserArr = resUserArr;
                    if (resUserArr.length > 0) {
                        this.updateProfileImgArr(resUserArr, false);
                    }
                    this.spinner.hide();
                })
                .catch(err => {
                    this.spinner.hide();
                    console.log(err);
                });
        } else if (this.searchOption === 'name') {
            this.searchService.searchFriendsByName(this.searchInput, false, SEARCH_RESULT_LIMIT, this.searchedFriendArr.length)
                .then((res: UserInfoSummary[]): Promise<UserInfoSummary[]> => {
                    if (res.length < SEARCH_RESULT_LIMIT) {
                        this.endOfFriendsSearch = true;
                    }
                    res.map(x => this.searchedFriendIdSet.add(x.user_id));
                    this.searchedFriendArr = res;
                    if (res.length > 0) {
                        this.updateProfileImgArr(res, true);
                    }
                    return this.searchService.searchUsersByName(this.searchInput, false, SEARCH_RESULT_LIMIT - res.length, 0);
                })
                .then(res => {
                    if (this.endOfFriendsSearch && res.length === 0) {
                        this.endOfUsersSearch = true;
                    }
                    const resUserArr = res.filter(x => !this.searchedFriendIdSet.has(x.user_id));
                    this.searchedUserArr = resUserArr;
                    if (resUserArr.length > 0) {
                        this.updateProfileImgArr(resUserArr, false);
                    }
                    this.spinner.hide();
                })
                .catch(err => {
                    console.log(err);
                    this.spinner.hide();
                });
        }
    }

    onSearchMore(): void {
        console.log(this.endOfFriendsSearch);
        console.log(this.endOfUsersSearch);
        if (this.endOfFriendsSearch && this.endOfUsersSearch) { return; }
        this.spinnerMsg = SPINNER_SEARCH_MSG;
        this.spinner.show();
        if (this.searchOption === 'email') {
            if (this.searchedUserArr.length === 0 && !this.endOfFriendsSearch) { // there are still friends that must be included in the search result
                this.searchService.searchFriendsByEmail(this.searchInput, false, SEARCH_RESULT_LIMIT, this.searchedFriendArr.length)
                    .then((res: UserInfoSummary[]): Promise<UserInfoSummary[]> => {
                        if (res.length < SEARCH_RESULT_LIMIT) {
                            this.endOfFriendsSearch = true;
                        }
                        res.map(x => this.searchedFriendIdSet.add(x.user_id));
                        this.searchedFriendArr = [...this.searchedFriendArr, ...res];
                        if (res.length > 0) {
                            this.updateProfileImgArr(res, true);
                        }
                        return this.searchService.searchUsersByEmail(this.searchInput, false, SEARCH_RESULT_LIMIT - res.length, 0);
                    })
                    .then(res => {
                        // endOfFriendsSearch means that there is at least one search for users
                        if (this.endOfFriendsSearch && res.length === 0) {
                            this.endOfUsersSearch = true;
                        }
                        const resUserArr = res.filter(x => !this.searchedFriendIdSet.has(x.user_id));
                        this.searchedUserArr = [...this.searchedUserArr, ...resUserArr];
                        if (resUserArr.length > 0) {
                            this.updateProfileImgArr(resUserArr, false);
                        }
                        this.spinner.hide();
                    })
                    .catch(err => {
                        console.log(err);
                        this.spinner.hide();
                    });
            } else { // only need to call searchUsers API Endpoint because there are no more friends
                this.searchService.searchUsersByEmail(this.searchInput, false, SEARCH_RESULT_LIMIT, this.searchedUserArr.length)
                    .then((res: UserInfoSummary[]): void => {
                        if (res.length < SEARCH_RESULT_LIMIT) {
                            this.endOfUsersSearch = true;
                        }
                        const resUserArr = res.filter(x => !this.searchedFriendIdSet.has(x.user_id));
                        this.searchedUserArr = [...this.searchedUserArr, ...resUserArr];
                        if (resUserArr.length > 0) {
                            this.updateProfileImgArr(resUserArr, false);
                        }
                        this.spinner.hide();
                    })
                    .catch(err => {
                        console.log(err);
                        this.spinner.hide();
                    });
            }
        } else if (this.searchOption === 'name') {
            if (this.searchedUserArr.length === 0 && !this.endOfFriendsSearch) {
                this.searchService.searchFriendsByName(this.searchInput, false, SEARCH_RESULT_LIMIT, this.searchedFriendArr.length)
                    .then((res: UserInfoSummary[]): Promise<UserInfoSummary[]> => {
                        if (res.length < SEARCH_RESULT_LIMIT) {
                            this.endOfFriendsSearch = true;
                        }
                        res.map(x => this.searchedFriendIdSet.add(x.user_id));
                        this.searchedFriendArr = [...this.searchedFriendArr, ...res];
                        if (res.length > 0) {
                            this.updateProfileImgArr(res, true);
                        }
                        return this.searchService.searchUsersByName(this.searchInput, false, SEARCH_RESULT_LIMIT - res.length, 0);
                    })
                    .then(res => {
                        if (this.endOfFriendsSearch && res.length === 0) {
                            this.endOfUsersSearch = true;
                        }
                        const resUserArr = res.filter(x => !this.searchedFriendIdSet.has(x.user_id));
                        this.searchedUserArr = [...this.searchedUserArr, ...resUserArr];
                        if (resUserArr.length > 0) {
                            this.updateProfileImgArr(resUserArr, false);
                        }
                        this.spinner.hide();
                    })
                    .catch(err => {
                        console.log(err);
                        this.spinner.hide();
                    });
            } else {
                this.searchService.searchUsersByName(this.searchInput, false, SEARCH_RESULT_LIMIT, this.searchedUserArr.length)
                    .then((res: UserInfoSummary[]): void => {
                        if (res.length < SEARCH_RESULT_LIMIT) {
                            this.endOfUsersSearch = true;
                        }
                        const resUserArr = res.filter(x => !this.searchedFriendIdSet.has(x.user_id));
                        this.searchedUserArr = [...this.searchedUserArr, ...resUserArr];
                        if (resUserArr.length > 0) {
                            this.updateProfileImgArr(resUserArr, false);
                        }
                        this.spinner.hide();
                    })
                    .catch(err => {
                        console.log(err);
                        this.spinner.hide();
                    });
            }
        }
    }

    removeSearchInput(): void {
        this.searchInput = '';
    }

    onSearchOptionChange(event: any): void {
        this.searched = false;
        this.endOfFriendsSearch = false;
        this.endOfUsersSearch = false;
        if (event.target.value === 'email') {
            this.searchPlaceholder = 'Enter email...';
        } else if (event.target.value === 'name') {
            this.searchPlaceholder = 'Enter name...';
        }
    }

    updateProfileImgArr(userInfoArr: UserInfoSummary[], isFriend: boolean): void {
        const profileImgUrlRequestArr = [];
        for (const userInfo of userInfoArr) {
            profileImgUrlRequestArr.push(
                this.userService.getProfileImageGetUrl(
                    userInfo.user_uuid, userInfo.profile_image_extension
                )
            );
        }
        forkJoin(profileImgUrlRequestArr).subscribe(urlArr => {
            urlArr = urlArr.map(x => x !== null ? x : '/assets/usre.png');
            if (isFriend) {
                this.friendProfileImgUrlArr = [...this.friendProfileImgUrlArr, ...urlArr];
            } else {
                this.userProfileImgUrlArr = [...this.userProfileImgUrlArr, ...urlArr];
            }
        });
    }

    onClickProfile(userInfo: UserInfoSummary): void {
        this.profileUuid = userInfo.user_uuid;
        this.showProfile = true;
    }

    onClickBack(): void {
        this.showProfile = false;
    }
}
