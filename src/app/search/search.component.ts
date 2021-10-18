import { Component } from '@angular/core';
import { faSearch, faTimesCircle, faUserPlus, faUserClock } from '@fortawesome/free-solid-svg-icons';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { SearchService } from './search.service';
import { UserInfoSummary } from '../user/user.model';
import { SEARCH_RESULT_LIMIT } from '../shared/constants';
import { UserService } from '../user/user.service';
import { FriendshipState } from '../friendship/friendship.model';
import { FriendshipService } from '../friendship/friendship.service';

@Component({
    selector: 'app-search',
    templateUrl: './search.component.html',
    styleUrls: ['./search.component.scss']
})
export class SearchComponent {
    faSearch = faSearch;
    faTimesCircle = faTimesCircle;
    faUserPlus = faUserPlus;
    faUserClock = faUserClock;

    // variables for search input
    searchOption = 'name';
    searchInput = '';
    searchPlaceholder = 'Enter name...';
    searchInputChanged: Subject<string> = new Subject<string>();

    searched = false;
    endOfSearch = false; // boolean for indicating whether there is no more  
    searchedUserArr: UserInfoSummary[] = [];
    userProfileImgUrlMap: {[key: string]: string} = {};

    // variables for public profile component
    showProfile = false;
    profileId: string;

    // boolean for showing spinner
    isSearching = false;
    isSearchingMore = false;

    // variables for friendship state enum to be used in template
    FRIENDSHIP_ACCEPTED = FriendshipState.ACCEPTED;
    FRIENDSHIP_PENDING = FriendshipState.PENDING;
    FRIENDSHIP_NONE = FriendshipState.NONE;

    constructor(
        private searchService: SearchService,
        private userService: UserService,
        private friendshipService: FriendshipService,
    ) {
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
                    console.log(res);
                    this.searchedUserArr = res;
                    this.isSearching = false;
                    this.updateUserProfileImgUrlMap(res);
                    if (res.length < SEARCH_RESULT_LIMIT) {
                        this.endOfSearch = true;
                    }
                })
        } else if (this.searchOption === 'name') {
            this.searchService.searchUsersByName(this.searchInput, SEARCH_RESULT_LIMIT, 0)
                .then((res: UserInfoSummary[]) => {
                    console.log(res);
                    this.searchedUserArr = res;
                    this.isSearching = false;
                    this.updateUserProfileImgUrlMap(res);
                    if (res.length < SEARCH_RESULT_LIMIT) {
                        this.endOfSearch = true;
                    }
                })
        }
    }

    onSearchMore(): void {
        if (this.endOfSearch) { return; }
        this.isSearchingMore = true;
        if (this.searchOption === 'email') {
            this.searchService.searchUsersByEmail(this.searchInput, SEARCH_RESULT_LIMIT, this.searchedUserArr.length)
                .then((res: UserInfoSummary[]) => {
                    console.log(res);
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
                    console.log(res);
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
            this.searchPlaceholder = 'Enter email...';
        } else if (event.target.value === 'name') {
            this.searchPlaceholder = 'Enter name...';
        }
    }

    onInputChange(event: any): void {
        this.searchInputChanged.next(event);
    }

    updateUserProfileImgUrlMap(userInfoArr: UserInfoSummary[]): void {
        const requestUserInfoArr = userInfoArr.filter(x =>
            !Object.prototype.hasOwnProperty.call(this.userProfileImgUrlMap, x.user_id));
        if (requestUserInfoArr.length > 0) {
            this.userService.getProfileImageGetUrlMap(
                requestUserInfoArr.map(x => x.user_id), requestUserInfoArr.map(x => x.profile_image_extension)
            ).then(res => {
                console.log(res);
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
            })
    }

    onDeleteFriendRequest(event: string): void {
        for (let idx = 0; idx < this.searchedUserArr.length; idx++) {
            if (this.searchedUserArr[idx].user_id === event) {
                this.searchedUserArr[idx].friendship_state = this.FRIENDSHIP_NONE;
                return;
            }
        }
    }

    onAcceptFriendRequest(event: string): void {
        console.log(event);
        for (let idx = 0; idx < this.searchedUserArr.length; idx++) {
            if (this.searchedUserArr[idx].user_id === event) {
                this.searchedUserArr[idx].friendship_state = this.FRIENDSHIP_ACCEPTED;
                return;
            }
        }
    }
}
