import { Injectable } from '@angular/core';
import { Apollo, ApolloBase } from 'apollo-angular';
import { BehaviorSubject } from 'rxjs';

import operations from './graphql/operations';
import { Message } from './models/message.model';

@Injectable({
    providedIn: 'root'
})
export class ChatService {
    private apollo: ApolloBase;

    private unreadConversationObj: {[key: string]: Message} = {};
    public unreadConversationSubject = new BehaviorSubject<{[key: string]: Message}>({});

    constructor(private apolloProvider: Apollo) {
        this.apollo = this.apolloProvider.use('chat');
        this.getUserConversations(false)
            .then(res => {
                for (const conversation of res.data.getUserConversations) {
                    this.unreadConversationObj[conversation.conversationId] = {
                        messageId: '',
                        conversationId: conversation.conversationId,
                        sentAt: conversation.sentAt,
                        senderId: conversation.senderId,
                        recipientId: conversation.recipientId,
                        content: conversation.content,
                        isRead: conversation.isRead    
                    };
                }
                this.unreadConversationSubject.next(this.unreadConversationObj);
            })
            .catch(err => {
                console.log(err);
            });
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

    public async getUserConversations(isRead: boolean | null): Promise<any> {
        return await this.apollo.query({
            query: operations.getUserConversations,
            variables: { isRead }
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

    public subscribeToNewMessagesAll(userId: string): any {
        return this.apollo.subscribe({
            query: operations.onCreateDirectMessage,
            variables: {
                recipientId: userId
            }
        });
    }

    // ChatService functions for GraphQL subscriptions
    public subscribeToNewMessagesInConversation(userId: string, conversationId: string): any {
        return this.apollo.subscribe({
            query: operations.onCreateDirectMessage,
            variables: {
                recipientId: userId,
                conversationId: conversationId
            }
        });
    }

    public publishNewMessage(message: Message): void {
        this.unreadConversationObj[message.conversationId] = message;
        this.unreadConversationSubject.next(this.unreadConversationObj);
    }

    public removeReadConversation(conversationId: string): void {
        delete this.unreadConversationObj[conversationId];
        this.unreadConversationSubject.next(this.unreadConversationObj);
    }

}