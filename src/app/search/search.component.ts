import { Component } from '@angular/core';
import { faSearch, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { forkJoin } from 'rxjs';

import { SearchService } from './search.service';
import { UserInfoSummary } from '../user/user.model';
import { SEARCH_RESULT_LIMIT } from '../shared/constants';
import { UserService } from '../user/user.service';

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

    searchedFriendArr: UserInfoSummary[] = [];
    searchedUserArr: UserInfoSummary[] = [];
    searchedFriendIdSet: Set<string> = new Set();
    searchedUserIdSet: Set<string> = new Set();
    friendProfileImgUrlArr: string[] = [];
    userProfileImgUrlArr: string[] = [];

    endOfFriendsSearch = false;
    endOfUsersSearch = false;

    constructor(
        private searchService: SearchService,
        private userService: UserService
    ) { }

    // TODO: separate search and search more (search - always fresh search, search more - additional search)
    onSearch(): void {
        if (this.endOfFriendsSearch || this.endOfUsersSearch) { return; }
        if (this.searchOption === 'email') {
            if (this.searchedUserArr.length === 0) { // there are still friends that must be included in the search result
                this.searchService.searchFriendsByEmail(this.searchInput, false, SEARCH_RESULT_LIMIT, this.searchedFriendArr.length)
                    .then((res: UserInfoSummary[]): Promise<UserInfoSummary[]> => {
                        console.log(res);
                        if (res.length >= 0 && res.length < SEARCH_RESULT_LIMIT) {
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
                        console.log(res);
                        if (this.endOfFriendsSearch && res.length === 0) {
                            this.endOfUsersSearch = true;
                        }
                        const resUserArr = res.filter(x => !this.searchedFriendIdSet.has(x.user_id));
                        this.searchedUserArr = [...this.searchedUserArr, ...resUserArr];
                        if (res.length > 0) {
                            this.updateProfileImgArr(res, false);
                        }
                    })
                    .catch(err => {
                        console.log(err);
                    });
            } else { // only need to call searchUsers API Endpoint because there are no more friends
                this.searchService.searchUsersByEmail(this.searchInput, false, SEARCH_RESULT_LIMIT, this.searchedUserArr.length)
                    .then(res => {
                        console.log(res);
                        if (res.length < SEARCH_RESULT_LIMIT) {
                            this.endOfUsersSearch = true;
                        }
                        this.searchedUserArr = [...this.searchedUserArr, ...res];
                        if (res.length > 0) {
                            this.updateProfileImgArr(res, false);
                        }
                    })
                    .catch(err => {
                        console.log(err);
                    });
            }
        } else if (this.searchOption === 'name') {
            if (this.searchedFriendArr.length === 0) {
                this.searchService.searchFriendsByName(this.searchInput, false, SEARCH_RESULT_LIMIT, this.searchedFriendArr.length)
                    .then((res: UserInfoSummary[]): Promise<UserInfoSummary[]> => {
                        console.log(res);
                        if (res.length >= 0 && res.length < SEARCH_RESULT_LIMIT) {
                            this.endOfFriendsSearch = true;
                        }
                        this.searchedFriendArr = [...this.searchedFriendArr, ...res];
                        if (res.length > 0) {
                            this.updateProfileImgArr(res, true);
                        }
                        return this.searchService.searchUsersByName(this.searchInput, false, SEARCH_RESULT_LIMIT - res.length, 0);
                    })
                    .then(res => {
                        console.log(res);
                        if (this.endOfFriendsSearch && res.length < SEARCH_RESULT_LIMIT) {
                            this.endOfUsersSearch = true;
                        }
                        this.searchedUserArr = [...this.searchedUserArr, ...res];
                        if (res.length > 0) {
                            this.updateProfileImgArr(res, false);
                        }
                    })
                    .catch(err => {
                        console.log(err);
                    });
            } else {
                this.searchService.searchUsersByName(this.searchInput, false, SEARCH_RESULT_LIMIT, this.searchedUserArr.length)
                    .then(res => {
                        if (res.length < SEARCH_RESULT_LIMIT) {
                            this.endOfUsersSearch = true;
                        }
                        console.log(res);
                        this.searchedUserArr = [...this.searchedUserArr, ...res];
                        if (res.length > 0) {
                            this.updateProfileImgArr(res, false);
                        }
                    })
                    .catch(err => {
                        console.log(err);
                    });
            }
        }
    }

    removeSearchInput(): void {
        this.searchInput = '';
    }

    onSearchOptionChange(event: any): void {
        console.log(event.target.value);
        this.searchedFriendArr = [];
        this.searchedUserArr = [];
        this.friendProfileImgUrlArr = [];
        this.userProfileImgUrlArr = [];
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
}
