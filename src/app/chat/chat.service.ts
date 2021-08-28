import { Injectable } from '@angular/core';
import { Apollo, ApolloBase } from 'apollo-angular';

import operations from './graphql/operations';

@Injectable({
    providedIn: 'root'
})
export class ChatService {
    private apollo: ApolloBase;

    constructor(private apolloProvider: Apollo) {
        this.apollo = this.apolloProvider.use('chat');
    }

    // ChatService functions for GraphQL queries
    public async getDirectConversation(
        userPairId: string | null, conversationId: string | null
    ): Promise<any> {
        return await this.apollo.query({
            query: operations.getDirectConversation,
            variables: { userPairId, conversationId }
        }).toPromise();
    }

    public async getUserConversations(): Promise<any> {
        return await this.apollo.query({
            query: operations.getUserConversations
        }).toPromise();
    }

    public async getConversationMessages(
        conversationId: string, offset: number, limit: number
    ): Promise<any> {
        return await this.apollo.query({
            query: operations.getConversationMessages,
            variables: { conversationId, offset, limit }
        }).toPromise();
    }

    // ChatService functions for GraphQL mutations
    public async createConversation(
        recipientId: string, senderName: string, recipientName: string
    ): Promise<any> {
        return await this.apollo.mutate({
            mutation: operations.createConversation,
            variables: { recipientId, senderName, recipientName }
        }).toPromise();
    }

    public async createDirectMessage(
        conversationId: string, content: string, recipientId: string
    ): Promise<any> {
        return await this.apollo.mutate({
            mutation: operations.createDirectMessage,
            variables: { conversationId, content, recipientId }
        }).toPromise();
    }
    
    public async setMessageIsRead(
        conversationId: string, senderId: string, recipientId: string
    ): Promise<any> {
        return await this.apollo.mutate({
            mutation: operations.setMessageIsRead,
            variables: { conversationId, senderId, recipientId }
        }).toPromise();
    }

    // ChatService functions for GraphQL subscriptions
    public subscribeToNewMessages(userId: string): any {
        return this.apollo.subscribe({
            query: operations.onCreateDirectMessage,
            variables: { recipientId: userId }
        });
    }

}