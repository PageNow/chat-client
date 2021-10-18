import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { USER_API_URL } from '../shared/config';

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

    public searchUsersByEmail(
        email: string, limit: number, offset: number
    ): Promise<any> {
        return this.http.get(
            `${USER_API_URL}/users/search/email/${email}?limit=${limit}&offset=${offset}`,
            this.httpOptions
        ).toPromise();
    }

    public searchUsersByName(
        name: string, limit: number, offset: number
    ): Promise<any> {
        return this.http.get(
            `${USER_API_URL}/users/search/name/${name}?limit=${limit}&offset=${offset}`,
            this.httpOptions
        ).toPromise();
    }
}
