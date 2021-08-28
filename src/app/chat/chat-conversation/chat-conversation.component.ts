import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { NgxSpinnerService } from "ngx-spinner";
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { Subscription } from "rxjs";

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
    currUserId: string;
    currUserInfoSubscription: Subscription

    messageArr: Message[] = [];
    isFullyLoaded = false;

    conversationId: string;
    conversationTitle: string;
    recipientId: string;
    messageContent = '';

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
        this.currUserInfoSubscription = this.userService.currUserInfo.subscribe(
            resp => {
                if (resp) {
                    this.currUserId = resp.user_id;
                    this.chatService.getDirectConversation(null, this.conversationId)
                    .then(res => {
                        console.log(res);
                        const userPairIdArr = res.data.getDirectConversation.userPairId.split(' ');
                        const titleArr = res.data.getDirectConversation.title.split(';');
                        if (this.currUserId === userPairIdArr[0]) {
                            this.recipientId = userPairIdArr[1];
                        } else {
                            this.recipientId = userPairIdArr[0];
                        }
                        this.conversationTitle = this.currUserId < this.recipientId ?
                            titleArr[1] : titleArr[0];
                    })
                    .catch(err => {
                        console.log(err);
                    });
                        }
                    },
            err => {
                console.log(err);
            }
        );
        
        this.spinnerMsg = SPINNER_LOAD_MESSAGES_MSG;
        this.spinner.show();
        this.chatService.getConversationMessages(this.conversationId, INITIAL_MESSAGE_OFFSET, INITIAL_MESSAGE_LIMIT)
            .then(res => {
                console.log(res);
                this.messageArr = res.data.getConversationMessages.reverse();
                this.spinner.hide();
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
        if (!this.conversationId || !this.recipientId || !this.messageContent || this.messageContent === '') {
            return;
        }
        this.chatService.createDirectMessage(this.conversationId, this.messageContent, this.recipientId)
            .then(res => {
                console.log(res);
                this.messageArr.unshift(res.data.createDirectMessage);
                this.messageContent = '';
            })
            .catch(err => {
                console.log(err);
            });
    }
}
