import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { PRESENCE_API_URL } from '../shared/config';

@Injectable({
    providedIn: 'root'
})
export class PagesService {

    constructor(private http: HttpClient) { }

    public async getPresence(): Promise<any> {
        return await this.http.get(`${PRESENCE_API_URL}/presence`).toPromise();
    }

    public async getUserPresence(userId: string): Promise<any> {
        return await this.http.get(`${PRESENCE_API_URL}/presence/${userId}`).toPromise();
    }
}
