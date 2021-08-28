import { Component, OnInit } from "@angular/core";
import { NgxSpinnerService } from "ngx-spinner";

import { ChatService } from "../chat.service";
import { Conversation } from "../models/conversation.model";

const SPINNER_CONVERSATION_LIST_FETCH_MSG = 'Fetching conversation list...';

@Component({
    selector: 'app-chat-conversation-list',
    templateUrl: './chat-conversation-list.component.html',
    styleUrls: ['./chat-conversation-list.component.scss']
})
export class ChatConversationListComponent implements OnInit {
    conversationArr: Conversation[] = [];

    spinnerMsg = '';
    
    constructor(
        private spinner: NgxSpinnerService,
        private chatService: ChatService
    ) { }

    ngOnInit(): void {
        this.spinnerMsg = SPINNER_CONVERSATION_LIST_FETCH_MSG;
        this.spinner.show();
        this.chatService.getUserConversations()
            .then(res => {
                console.log(res);
                this.conversationArr = res.data.getUserConversations;
                this.spinner.hide();
            })
            .catch(err => {
                console.log(err);
                this.spinner.hide();
            });

    }
}
