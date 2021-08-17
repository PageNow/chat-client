import { Injectable } from '@angular/core';
import { Apollo, ApolloBase } from 'apollo-angular';

import operations from './graphql/operations';

@Injectable({
    providedIn: 'root'
})
export class PagesService {
    private apollo: ApolloBase;

    constructor(private apolloProvider: Apollo) {
        this.apollo = this.apolloProvider.use('presence');
    }

    public async getStatus(userId: string): Promise<any> {
        return await this.apollo.query({
            query: operations.getStatus,
            variables: { userId }
        }).toPromise();
    }

    public async connect(url: string, title: string): Promise<any> {
        return await this.apollo.mutate({
            mutation: operations.connect,
            variables: { url, title }
        }).toPromise();
    }

    public async sendHeartbeat(url: string, title: string): Promise<any> {
        return await this.apollo.query({
            query: operations.sendHeartbeat,
            variables: { url, title }
        }).toPromise();
    }

    public async disconnect(): Promise<any> {
        return await this.apollo.mutate({
            mutation: operations.disconnect,
            variables: { }
        }).toPromise();
    }

    public subscribeToStatus(userId: string): any {
        return this.apollo.subscribe({
            query: operations.onStatus,
            variables: { userId }
        });
    }
}
