import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { NgxSpinnerService } from "ngx-spinner";
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { Subscription } from "rxjs";
import { Auth } from 'aws-amplify';

import { INITIAL_MESSAGE_LIMIT, INITIAL_MESSAGE_OFFSET } from "src/app/shared/constants";
import { ChatService } from "../chat.service";
import { Message } from "../models/message.model";
import { UserService } from "src/app/user/user.service";

const SPINNER_LOAD_MESSAGES_MSG = 'Loading messages...';

@Component({
    selector: 'app-chat-conversation',
    templateUrl: './chat-conversation.component.html',
    styleUrls: ['./chat-conversation.component.scss']
})
export class ChatConversationComponent implements OnInit, OnDestroy {
    @ViewChild('conversationContainer') conversationContainer: ElementRef;
    scrollTop = 0;

    currUserId: string;
    currUserInfoSubscription: Subscription

    messageArr: Message[] = [];
    isFullyLoaded = false;

    conversationId: string;
    conversationTitle: string;
    recipientId: string;
    recipientImgExt: string;
    recipientImgUrl: string;
    newMessageContent = '';

    // TODO: errorMap
    isSendingMap: {[key: string]: boolean} = {};

    spinnerMsg = '';

    // fontawesome icons
    faPaperPlane = faPaperPlane;

    // chat message subscription
    messageSubscription: Subscription;
    
    constructor(
        private route: ActivatedRoute,
        private spinner: NgxSpinnerService,
        private userService: UserService,
        private chatService: ChatService
    ) { }

    ngOnInit(): void {
        this.conversationId = this.route.snapshot.paramMap.get('conversationId') || '';
        this.route.queryParams.subscribe(params => {
            this.conversationTitle = params.title;
            this.recipientImgExt = params.profileImgExt;
        });
        this.spinnerMsg = SPINNER_LOAD_MESSAGES_MSG;
        this.spinner.show();
        Auth.currentAuthenticatedUser()
            .then(res => {
                this.currUserId = res.username;
                return this.chatService.getDirectConversation(null, this.conversationId);
            })
            .then(res => {
                console.log(res);
                const userPairIdArr = res.data.getDirectConversation.userPairId.split(' ');
                if (this.currUserId === userPairIdArr[0]) {
                    this.recipientId = userPairIdArr[1];
                } else {
                    this.recipientId = userPairIdArr[0];
                }
                return this.chatService.getConversationMessages(this.conversationId, INITIAL_MESSAGE_OFFSET, INITIAL_MESSAGE_LIMIT);
            })
            .then(res => {
                console.log(res);
                this.messageArr = res.data.getConversationMessages;
                this.messageSubscribe();
                this.spinner.hide();
                return this.userService.getProfileImageGetUrl(this.recipientId, this.recipientImgExt).toPromise();
            })
            .then(res => {
                console.log(res);
                this.recipientImgUrl = res;
                return this.chatService.setMessageIsRead(
                    this.conversationId, this.recipientId, this.currUserId
                );
            })
            .then(res => {
                this.scrollToBottom();
                console.log(res);
            })
            .catch(err => {
                console.log(err);
                this.spinner.hide();
            });
    }

    ngOnDestroy(): void {
        this.currUserInfoSubscription?.unsubscribe();
        this.messageSubscription?.unsubscribe();
    }

    sendMessage(): void {
        if (!this.conversationId || !this.recipientId || !this.newMessageContent || this.newMessageContent === '') {
            return;
        }
        const sentAt = new Date(Date.now()).toISOString().slice(0, -1); // for date pipe to work
        const messageContent = this.newMessageContent;
        const newMessage: Message = {
            messageId: '',
            conversationId: this.conversationId,
            sentAt: sentAt,
            senderId: this.currUserId,
            recipientId: this.recipientId,
            content: messageContent,
            isRead: false
        }
        this.isSendingMap = {
            ...this.isSendingMap,
            [sentAt]: true // use sentAt as key since it is unique
        };        
        this.messageArr = [newMessage, ...this.messageArr];
        this.newMessageContent = '';
        this.chatService.createDirectMessage(this.conversationId, messageContent, this.recipientId)
            .then(res => {
                console.log(res);
                this.isSendingMap = {
                    ...this.isSendingMap,
                    [sentAt]: false
                }
            })
            .catch(err => {
                console.log(err);
                this.isSendingMap = {
                    ...this.isSendingMap,
                    [sentAt]: false
                }
            });
    }

    async messageSubscribe(): Promise<void> {
        if (!this.currUserId) { return; }
        console.log(this.currUserId);
        this.messageSubscription = this.chatService.subscribeToNewMessagesInConversation(this.currUserId, this.conversationId)
            .subscribe(
                ({ data }: any) => {
                    console.log(data);
                    this.messageArr = [data.onCreateDirectMessage, ...this.messageArr];
                },
                (err: any) => {
                    console.log(err);
                }
            );
    }

    scrollToBottom(): void {
        try {
            this.conversationContainer.nativeElement.scrollIntoView({
                behavior: "auto", block: "end", inline: "nearest"
            });
        } catch (err) { /* */ }
    }
}
