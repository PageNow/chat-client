import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Subject } from 'rxjs';
import { Auth } from 'aws-amplify';

import { Message } from './models/message.model';
import { CHAT_API_URL, EXTENSION_ID } from '../shared/config';
import { Conversation } from './models/conversation.model';

@Injectable({
    providedIn: 'root'
})
export class ChatService implements OnDestroy {

    private userId: string;

    public unreadConversationIdSet: Set<string> = new Set();
    public unreadConversationCntSubject = new BehaviorSubject<number>(0);
    public newMessageSubject = new Subject<Message>();

    constructor(private http: HttpClient) {
        Auth.currentAuthenticatedUser()
            .then(res => {
                this.userId = res.username;
                window.addEventListener('message',
                    this.messageEventListener.bind(this));
            })
            .catch(() => {
                // do nothing
            });

        this.getUserConversations(null)
            .then((res: Conversation[]) => {
                res.filter((conversation: Conversation) => !conversation.isRead)
                    .map((conversation: Conversation) => conversation.conversationId)
                    .forEach((x: string) => this.unreadConversationIdSet.add(x));
                this.unreadConversationCntSubject.next(this.unreadConversationIdSet.size);
            })
            .catch(() => {
                // do nothing
            });
    }

    private messageEventListener(event: MessageEvent): void {
        if (event.data.type === 'new-message') {
            this.newMessageSubject.next(event.data.data);
            if (event.data.data.senderId !== this.userId &&
                !this.unreadConversationIdSet.has(event.data.data.conversationId)
            ) {
                this.unreadConversationIdSet.add(event.data.data.conversationId);
                this.unreadConversationCntSubject.next(this.unreadConversationIdSet.size);
                this.sendUpdateCntMessage(this.unreadConversationIdSet.size);
            }
        }
    }

    ngOnDestroy(): void {
        window.removeEventListener('message',
            this.messageEventListener.bind(this));
    }

    public async getDirectConversation(targetUserId: string): Promise<any> {
        const url = `${CHAT_API_URL}/conversation/direct/${targetUserId}`;
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

    public async getConversationParticipants(conversationId: string): Promise<any> {
        const url = `${CHAT_API_URL}/conversations/${conversationId}/participants`;
        return await this.http.get(url).toPromise();
    }

    public async getConversation(conversationId: string): Promise<any> {
        const url = `${CHAT_API_URL}/conversations/${conversationId}`;
        return await this.http.get(url).toPromise();
    }

    public async createConversation(
        recipientIdArr: string[], isGroup: boolean, title: string
    ): Promise<any> {
        const url = `${CHAT_API_URL}/conversation`;
        return await this.http.post(url, {
            recipientIdArr, isGroup, title
        }).toPromise();
    }

    public publishUnreadConversationCnt(): void {
        this.unreadConversationCntSubject.next(this.unreadConversationIdSet.size);
        this.sendUpdateCntMessage(this.unreadConversationIdSet.size);
    }

    private sendUpdateCntMessage(cnt: number): void {
        chrome.runtime.sendMessage(EXTENSION_ID, {
            type: 'update-unread-conversation-cnt',
            data: {
                unreadConversationCnt: cnt
            }
        });
    }
}
