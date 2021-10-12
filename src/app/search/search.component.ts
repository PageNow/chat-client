import { Component } from '@angular/core';
import { faSearch, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { forkJoin, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

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
    searchInputChanged: Subject<string> = new Subject<string>();

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
    profileId: string;

    // boolean for showing spinner
    isSearching = false;
    isSearchingMore = false;

    constructor(
        private searchService: SearchService,
        private userService: UserService
    ) {
        this.searchInputChanged.pipe(
            debounceTime(300),
            distinctUntilChanged()
        ).subscribe(searchInput => {
            this.searchInput = searchInput;
            if (this.searchInput.length > 0) {
                this.onSearch();
            } else {
                this.searchedFriendArr = [];
                this.searchedUserArr = [];
                this.searchedFriendIdSet = new Set([]);
            }
        });
    }

    onSearch(): void {
        this.searched = true;
        this.searchedFriendIdSet = new Set();
        this.friendProfileImgUrlArr = [];
        this.userProfileImgUrlArr = [];
        this.endOfFriendsSearch = false;
        this.endOfUsersSearch = false;
        this.isSearching = true;
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
                    this.isSearching = false;
                })
                .catch(err => {
                    this.isSearching = false;
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
                    this.isSearching = false;
                })
                .catch(err => {
                    console.log(err);
                    this.isSearching = false;
                });
        }
    }

    onSearchMore(): void {
        console.log(this.endOfFriendsSearch);
        console.log(this.endOfUsersSearch);
        if (this.endOfFriendsSearch && this.endOfUsersSearch) { return; }
        this.isSearchingMore = true;
        if (this.searchOption === 'email') {
            // there are still friends that must be included in the search result
            if (this.searchedUserArr.length === 0 && !this.endOfFriendsSearch) {
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
                        this.isSearchingMore = false;
                    })
                    .catch(err => {
                        console.log(err);
                        this.isSearchingMore = false;
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
                        this.isSearchingMore = false;
                    })
                    .catch(err => {
                        console.log(err);
                        this.isSearchingMore = false;
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
                        this.isSearchingMore = false;
                    })
                    .catch(err => {
                        console.log(err);
                        this.isSearchingMore = false;
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
                        this.isSearchingMore = false;
                    })
                    .catch(err => {
                        console.log(err);
                        this.isSearchingMore = false;
                    });
            }
        }
    }

    removeSearchInput(): void {
        this.searchInputChanged.next('');
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

    onInputChange(event: any): void {
        this.searchInputChanged.next(event);
    }

    updateProfileImgArr(userInfoArr: UserInfoSummary[], isFriend: boolean): void {
        const profileImgUrlRequestArr = [];
        for (const userInfo of userInfoArr) {
            profileImgUrlRequestArr.push(
                this.userService.getProfileImageGetUrl(
                    userInfo.user_id, userInfo.profile_image_extension
                )
            );
        }
        forkJoin(profileImgUrlRequestArr).subscribe(urlArr => {
            urlArr = urlArr.map(x => x !== null ? x : '/assets/user.png');
            if (isFriend) {
                this.friendProfileImgUrlArr = [...this.friendProfileImgUrlArr, ...urlArr];
            } else {
                this.userProfileImgUrlArr = [...this.userProfileImgUrlArr, ...urlArr];
            }
        });
    }

    onClickProfile(userInfo: UserInfoSummary): void {
        this.profileId = userInfo.user_id;
        this.showProfile = true;
    }

    onClickBack(): void {
        this.showProfile = false;
    }
}
