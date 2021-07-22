import { Injectable } from '@angular/core';
import API from '@aws-amplify/api';
import { Observable } from 'rxjs';

import operations from './graphql/operations';

@Injectable({
    providedIn: 'root'
})
export class PagesService {
    public getStatus(userId: string): any {
        console.log(userId);
        return API.graphql({
            query: operations.getStatus,
            variables: { userId }
        });
    }

    public async connect(url: string, title: string): Promise<void> {
        const response = await API.graphql({
            query: operations.connect,
            variables: { url, title }
        });
        console.log(response);
    }
    
    public async sendHearteat(url: string, title: string): Promise<void> {
        const response = await API.graphql({
            query: operations.sendHeartbeat,
            variables: { url, title }
        });
        console.log(response);
    }

    public async disconnect(): Promise<void> {
        const response = await API.graphql({
            query: operations.disconnect,
            variables: { }
        });
        console.log(response);
    }

    public subscribeToStatus(userId: string): any {
        return API.graphql({
            query: operations.onStatus,
            variables: { userId }
        });
    }
}
