import { Component } from "@angular/core";
import { faSearch, faTimesCircle } from '@fortawesome/free-solid-svg-icons';

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

    constructor() {
        console.log('search component');
    }

    onSearchInputChange(event: any): void {
        console.log(event.target.value);
        this.searchInput = event.target.value;
        return;
    }
}
