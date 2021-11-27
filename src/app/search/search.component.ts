/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { Component, OnInit } from '@angular/core';
import { faSearch, faTimesCircle, faUserPlus, faUserClock } from '@fortawesome/free-solid-svg-icons';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

import { SearchService } from './search.service';
import { UserInfoSummary } from '../user/user.model';
import { LANG_KO, SEARCH_RESULT_LIMIT, USER_DEFAULT_IMG_ASSET } from '../shared/constants';
import { UserService } from '../user/user.service';
import { FriendshipState } from '../friendship/friendship.model';
import { FriendshipService } from '../friendship/friendship.service';

@Component({
    selector: 'app-search',
    templateUrl: './search.component.html',
    styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {
    faSearch = faSearch;
    faTimesCircle = faTimesCircle;
    faUserPlus = faUserPlus;
    faUserClock = faUserClock;

    // variables for search input
    searchOption = 'name';
    searchInput = '';
    emailInputPlaceholder = '';
    nameInputPlaceholder = '';
    searchPlaceholder = '';
    searchInputChanged: Subject<string> = new Subject<string>();

    searched = false;
    endOfSearch = false; // boolean for indicating whether there is no more
    searchedUserArr: UserInfoSummary[] = [];
    userProfileImgUrlMap: {[key: string]: string} = {};

    // variables for public profile component
    showProfile = false;
    profileId: string;
    profileMutualFriendCount: number;

    // boolean for showing spinner
    isSearching = false;
    isSearchingMore = false;

    // variables for friendship state enum to be used in template
    FRIENDSHIP_ACCEPTED = FriendshipState.ACCEPTED;
    FRIENDSHIP_PENDING = FriendshipState.PENDING;
    FRIENDSHIP_NONE = FriendshipState.NONE;

    userLanguage: string | null | undefined;
    LANG_KO = LANG_KO;

    constructor(
        private translateService: TranslateService,
        private searchService: SearchService,
        private userService: UserService,
        private friendshipService: FriendshipService,
    ) { }

    ngOnInit(): void {
        this.userLanguage = this.translateService.currentLang;
        this.translateService.get(["emailInputPlaceholder", "nameInputPlaceholder"]).subscribe(
            (res: {[key: string]: string}) => {
                this.emailInputPlaceholder = res.emailInputPlaceholder;
                this.nameInputPlaceholder = res.nameInputPlaceholder;
                this.searchPlaceholder = this.nameInputPlaceholder;
            }
        )

        // debounce search input
        this.searchInputChanged.pipe(
            debounceTime(300),
            distinctUntilChanged()
        ).subscribe(searchInput => {
            this.searchInput = searchInput;
            if (this.searchInput.length > 0) {
                this.onSearch();
            } else {
                this.searchedUserArr = [];
                this.searched = false;
                this.endOfSearch = false;
            }
        });
    }

    onSearch(): void {
        this.searched = true;
        this.isSearching = true;
        if (this.searchOption === 'email') {
            this.searchService.searchUsersByEmail(this.searchInput, SEARCH_RESULT_LIMIT, 0)
                .then((res: UserInfoSummary[]) => {
                    this.searchedUserArr = res;
                    this.isSearching = false;
                    this.updateUserProfileImgUrlMap(res);
                    if (res.length < SEARCH_RESULT_LIMIT) {
                        this.endOfSearch = true;
                    }
                });
        } else if (this.searchOption === 'name') {
            this.searchService.searchUsersByName(this.searchInput, SEARCH_RESULT_LIMIT, 0)
                .then((res: UserInfoSummary[]) => {
                    this.searchedUserArr = res;
                    this.isSearching = false;
                    this.updateUserProfileImgUrlMap(res);
                    if (res.length < SEARCH_RESULT_LIMIT) {
                        this.endOfSearch = true;
                    }
                });
        }
    }

    onSearchMore(): void {
        if (this.endOfSearch) { return; }
        this.isSearchingMore = true;
        if (this.searchOption === 'email') {
            this.searchService.searchUsersByEmail(this.searchInput, SEARCH_RESULT_LIMIT, this.searchedUserArr.length)
                .then((res: UserInfoSummary[]) => {
                    this.searchedUserArr = [ ...this.searchedUserArr, ...res ];
                    this.isSearchingMore = false;
                    this.updateUserProfileImgUrlMap(res);
                    if (res.length < SEARCH_RESULT_LIMIT) {
                        this.endOfSearch = true;
                    }
                })
                .catch(err => {
                    console.log(err);
                });
        } else if (this.searchOption === 'name') {
            this.searchService.searchUsersByName(this.searchInput, SEARCH_RESULT_LIMIT, this.searchedUserArr.length)
                .then((res: UserInfoSummary[]) => {
                    this.searchedUserArr = [ ...this.searchedUserArr, ...res ];
                    this.isSearchingMore = false;
                    this.updateUserProfileImgUrlMap(res);
                    if (res.length < SEARCH_RESULT_LIMIT) {
                        this.endOfSearch = true;
                    }
                })
                .catch(err => {
                    console.log(err);
                });
        }
    }

    removeSearchInput(): void {
        this.searchInputChanged.next('');
    }

    onSearchOptionChange(event: any): void {
        this.removeSearchInput();
        this.searchOption = event.target.value;
        if (event.target.value === 'email') {
            this.searchPlaceholder = this.emailInputPlaceholder;
        } else if (event.target.value === 'name') {
            this.searchPlaceholder = this.nameInputPlaceholder;
        }
    }

    onInputChange(event: any): void {
        this.searchInputChanged.next(event);
    }

    updateUserProfileImgUrlMap(userInfoArr: UserInfoSummary[]): void {
        // fetch image urls for users whose profile images we have not fetched yet
        let requestUserInfoArr = userInfoArr.filter(x =>
            !Object.prototype.hasOwnProperty.call(this.userProfileImgUrlMap, x.user_id));
        requestUserInfoArr.filter(x => x.profile_image_extension === null).forEach(x => {
            this.userProfileImgUrlMap[x.user_id] = USER_DEFAULT_IMG_ASSET;
        });
        requestUserInfoArr = requestUserInfoArr.filter(x => x.profile_image_extension);
        if (requestUserInfoArr.length > 0) {
            this.userService.getProfileImageGetUrlMap(
                requestUserInfoArr.map(x => x.user_id),
                requestUserInfoArr.map(x => x.profile_image_extension)
            ).then(res => {
                this.userProfileImgUrlMap = {
                    ...this.userProfileImgUrlMap,
                    ...res
                };
            })
            .catch(err => {
                console.log(err);
            });
        }
    }

    onClickProfile(userInfo: UserInfoSummary): void {
        this.profileId = userInfo.user_id;
        this.profileMutualFriendCount = userInfo.mutual_friend_count ? userInfo.mutual_friend_count : 0;
        this.showProfile = true;
    }

    onClickBack(): void {
        this.showProfile = false;
    }

    addFriend(idx: number): void {
        this.friendshipService.addFriend(this.searchedUserArr[idx].user_id)
            .then(res => {
                if (res.success) {
                    this.searchedUserArr[idx].friendship_state = this.FRIENDSHIP_PENDING;
                }
            })
            .catch(err => {
                console.log(err);
            });
    }

    onDeleteFriendRequest(event: string): void {
        for (const searchedUser of this.searchedUserArr) {
            if (searchedUser.user_id === event) {
                searchedUser.friendship_state = this.FRIENDSHIP_NONE;
                return;
            }
        }
    }

    onAcceptFriendRequest(event: string): void {
        for (const searchedUser of this.searchedUserArr) {
            if (searchedUser.user_id === event) {
                searchedUser.friendship_state = this.FRIENDSHIP_ACCEPTED;
                return;
            }
        }
    }

    onCreateFriendRequest(event: string): void {
        for (const searchedUser of this.searchedUserArr) {
            if (searchedUser.user_id === event) {
                searchedUser.friendship_state = this.FRIENDSHIP_PENDING;
                return;
            }
        }
    }
}
