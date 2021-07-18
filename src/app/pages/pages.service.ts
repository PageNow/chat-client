import { Injectable } from '@angular/core';
import API from '@aws-amplify/api';
import { Observable } from 'rxjs';

import operations from './graphql/operations';

@Injectable({
    providedIn: 'root'
})
export class PagesService {
    public getStatus(id: string): any {
        return API.graphql({
            query: operations.getStatus,
            variables: {id: id}
        });
    }

    public async connect(id: string): Promise<void> {
        const response = await API.graphql({
            query: operations.connect,
            variables: {id: id}
        });
        console.log(response);
    }
    
    public async sendHearteat(id: string): Promise<void> {
        const response = await API.graphql({
            query: operations.sendHeartbeat,
            variables: {id: id}
        });
        console.log(response);
    }

    public async disconnect(id: string): Promise<void> {
        const response = await API.graphql({
            query: operations.disconnect,
            variables: {id: id}
        });
        console.log(response);
    }

    public subscribeToStatus(id: string): any {
        return API.graphql({
            query: operations.onStatus,
            variables: {id: id}
        });
    }
}
