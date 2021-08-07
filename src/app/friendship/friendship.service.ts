import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";

import { USER_API_URL } from "../shared/constants";

@Injectable({
    providedIn: 'root'
})
export class FriendshipService {
    httpOptions: any;

    constructor(
        private http: HttpClient,
    ) {
        console.log('friendship service constructor');
        this.httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };
    }

    public getFriendshipRequests(): Promise<any> {
        return this.http.get(`${USER_API_URL}/friendship/request`, this.httpOptions).toPromise();
    }

    public createFriendshipRequest(userId: string): Promise<any> {
        return this.http.post(
            `${USER_API_URL}/friendship/request`,
            { user_id2: userId },
            this.httpOptions
        ).toPromise();
    }

    public acceptFriendshipRequest(userId: string): Promise<any> {
        return this.http.post(
            `${USER_API_URL}/friendship/accept`,
            { user_id1: userId },
            this.httpOptions
        ).toPromise();
    }

    /**
     * Delete friendship endpoint
     * @param userId the user cognito id
     * @param isAccepting is accepting friendship (if true, you are user_id2)
     * @returns promise
     */
    public deleteFriendshipRequest(userId: string, isAccepting: boolean): Promise<any> {
        const requestBody = isAccepting ? { user_id1: userId } : { user_id2: userId };
        return this.http.post(
            `${USER_API_URL}/friendship/delete`,
            requestBody,
            this.httpOptions
        ).toPromise();
    }
}
