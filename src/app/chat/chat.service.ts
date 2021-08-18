import { Injectable } from '@angular/core';
import { Apollo, ApolloBase } from 'apollo-angular';

@Injectable({
    providedIn: 'root'
})
export class ChatService {
    private apollo: ApolloBase;

    constructor(private apolloProvider: Apollo) {
        this.apollo = this.apolloProvider.use('chat');
    }

    
}