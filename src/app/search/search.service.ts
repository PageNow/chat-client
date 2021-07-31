import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";

import { USER_API_URL } from "../shared/constants";

@Injectable({
    providedIn: 'root'
})
export class SearchService {
    httpOptions: any;

    constructor(
        private http: HttpClient
    ) {
        console.log('search service constructor');
        this.httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
    }

    public searchFriendsByEmail(
        email: string, exact: boolean, limit: number, offset: number
    ): Promise<any> {
        const exactStr = exact ? 'true' : 'false';
        return this.http.get(
            `${USER_API_URL}/friendship/search/email/${email}?exact=${exactStr}&limit=${limit}&offset=${offset}`,
            this.httpOptions
        ).toPromise();
    }

    public searchUsersByEmail(
        email: string, exact: boolean, limit: number, offset: number
    ): Promise<any> {
        const exactStr = exact ? 'true' : 'false';
        return this.http.get(
            `${USER_API_URL}/users/search/email/${email}?exact=${exactStr}&limit=${limit}&offset=${offset}`,
            this.httpOptions
        ).toPromise();
    }

    public searchFriendsByName(
        name: string, exact: boolean, limit: number, offset: number
    ): Promise<any> {
        const exactStr = exact ? 'true': 'false';
        return this.http.get(
            `${USER_API_URL}/friendship/search/name/${name}?exact=${exactStr}&limit=${limit}&offset=${offset}`,
            this.httpOptions
        ).toPromise();
    }

    public searchUsersByName(
        name: string, exact: boolean, limit: number, offset: number
    ): Promise<any> {
        const exactStr = exact ? 'true' : 'false';
        return this.http.get(
            `${USER_API_URL}/users/search/name/${name}?exact=${exactStr}&limit=${limit}&offset=${offset}`,
            this.httpOptions
        ).toPromise();
    }
}
