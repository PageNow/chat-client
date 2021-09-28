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
    recipientImgUrl: string;
    newMessageContent = '';

    // TODO: errorMap
    isSendingMap: {[key: string]: boolean} = {};

    spinnerMsg = '';

    // fontawesome icons
    faPaperPlane = faPaperPlane;
    
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
            this.recipientImgUrl = params.profileImgUrl;
        });
        this.spinnerMsg = SPINNER_LOAD_MESSAGES_MSG;
        this.spinner.show();
        Auth.currentAuthenticatedUser()
            .then(res => {
                this.currUserId = res.username;
                return this.chatService.getConversationMessages(this.conversationId, INITIAL_MESSAGE_OFFSET, INITIAL_MESSAGE_LIMIT);
            })
            .then(res => {
                this.messageArr = res;
                this.scrollToBottom();
                this.spinnerMsg = '';
                this.spinner.hide();
                // TODO: set message as read
            })
            .catch(err => {
                console.log(err);
                this.spinner.hide();
            });
    }

    ngOnDestroy(): void {
        this.currUserInfoSubscription?.unsubscribe();
    }

    sendMessage(): void {
        if (!this.conversationId || !this.recipientId || !this.newMessageContent || this.newMessageContent === '') {
            return;
        }
        // const sentAt = new Date(Date.now()).toISOString().slice(0, -1); // for date pipe to work
        // const messageContent = this.newMessageContent;
        // const newMessage: Message = {
        //     messageId: '',
        //     conversationId: this.conversationId,
        //     sentAt: sentAt,
        //     senderId: this.currUserId,
        //     recipientId: this.recipientId,
        //     content: messageContent,
        //     isRead: false
        // }
        // this.isSendingMap = {
        //     ...this.isSendingMap,
        //     [sentAt]: true // use sentAt as key since it is unique
        // };        
        // this.messageArr = [newMessage, ...this.messageArr];
        // this.newMessageContent = '';
        // this.chatService.createDirectMessage(this.conversationId, messageContent, this.recipientId)
        //     .then(res => {
        //         console.log(res);
        //         this.isSendingMap = {
        //             ...this.isSendingMap,
        //             [sentAt]: false
        //         }
        //     })
        //     .catch(err => {
        //         console.log(err);
        //         this.isSendingMap = {
        //             ...this.isSendingMap,
        //             [sentAt]: false
        //         }
        //     });
    }

    scrollToBottom(): void {
        try {
            this.conversationContainer.nativeElement.scrollIntoView({
                behavior: "auto", block: "end", inline: "nearest"
            });
        } catch (err) { /* */ }
    }
}
