import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Subject } from 'rxjs';

import { Message } from './models/message.model';
import { CHAT_API_URL } from '../shared/config';

@Injectable({
    providedIn: 'root'
})
export class ChatService implements OnDestroy {

    private unreadConversationObj: {[key: string]: Message} = {};
    public unreadConversationSubject = new BehaviorSubject<{[key: string]: Message}>({});
    public newMessageSubject = new Subject<Message>();

    constructor(private http: HttpClient) {
        console.log('chat.service constructor');
        window.addEventListener('message',
            this.messageEventListener.bind(this));

        this.getUserConversations(false)
            .then(res => {
                // for (const conversation of res.data.getUserConversations) {
                //     this.unreadConversationObj[conversation.conversationId] = {
                //         messageId: '',
                //         conversationId: conversation.conversationId,
                //         sentAt: conversation.sentAt,
                //         senderId: conversation.senderId,
                //         content: conversation.content,
                //         isRead: conversation.isRead    
                //     };
                // }
                console.log(res);
                this.unreadConversationSubject.next(this.unreadConversationObj);
            })
            .catch(err => {
                console.log(err);
            });
    }

    private messageEventListener(event: MessageEvent): void {
        if (event.data.type === 'new-message') {
            console.log(event.data.data);
            this.newMessageSubject.next(event.data.data);
        }
    }

    ngOnDestroy(): void {
        window.removeEventListener('message',
            this.messageEventListener.bind(this));
    }

    public async getDirectConversation(targetUserId: string): Promise<any> {
        const url = `${CHAT_API_URL}/conversation/direct/${targetUserId}`
        return await this.http.get(url).toPromise();
    }

    public async getUserConversations(isRead: boolean | null): Promise<any> {
        let url;
        if (isRead === null) {
            url = `${CHAT_API_URL}/conversations`;
        } else {
            url = `${CHAT_API_URL}/conversations?isRead=${isRead}`;
        }
        return await this.http.get(url).toPromise();
    }

    public async getConversationMessages(
        conversationId: string, offset: number, limit: number, order = 'desc'
    ): Promise<any> {
        const url = `${CHAT_API_URL}/conversations/${conversationId}/messages?limit=${limit}&offset=${offset}&order=${order}`;
        return await this.http.get(url).toPromise();
    }

    public async createConversation(
        recipientIdArr: string[], isGroup: boolean, title: string
    ): Promise<any> {
        const url = `${CHAT_API_URL}/conversation`;
        return await this.http.post(url, {
            recipientIdArr: recipientIdArr, isGroup: isGroup, title: title
        }).toPromise();
    }
    
    // public async setMessageIsRead(
    //     conversationId: string, senderId: string, recipientId: string
    // ): Promise<any> {
    //     return await this.apollo.mutate({
    //         mutation: operations.setMessageIsRead,
    //         variables: { conversationId, senderId, recipientId }
    //     }).toPromise();
    // }

    // public subscribeToNewMessagesAll(userId: string): any {
    //     return this.apollo.subscribe({
    //         query: operations.onCreateDirectMessage,
    //         variables: {
    //             recipientId: userId
    //         }
    //     });
    // }

    public publishNewMessage(message: Message): void {
        this.unreadConversationObj[message.conversationId] = message;
        this.unreadConversationSubject.next(this.unreadConversationObj);
    }

    public removeReadConversation(conversationId: string): void {
        delete this.unreadConversationObj[conversationId];
        this.unreadConversationSubject.next(this.unreadConversationObj);
    }

}