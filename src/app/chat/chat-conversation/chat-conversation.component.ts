import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { NgxSpinnerService } from "ngx-spinner";
import { INITIAL_MESSAGE_LIMIT, INITIAL_MESSAGE_OFFSET } from "src/app/shared/constants";
import { ChatService } from "../chat.service";
import { Message } from "../models/message.model";

const SPINNER_LOAD_MESSAGES_MSG = 'Loading messages...';

@Component({
    selector: 'app-chat-conversation',
    templateUrl: './chat-conversation.component.html',
    styleUrls: ['./chat-conversation.component.scss']
})
export class ChatConversationComponent implements OnInit {  
    isFullyLoaded = false;
    messages: Message[] = [];
    conversationId: string;

    spinnerMsg = '';
    
    constructor(
        private route: ActivatedRoute,
        private spinner: NgxSpinnerService,
        private chatService: ChatService
    ) { }

    ngOnInit(): void {
        this.spinnerMsg = SPINNER_LOAD_MESSAGES_MSG;
        this.spinner.show();

        this.conversationId = this.route.snapshot.paramMap.get('conversationId') || '';
        this.chatService.getConversationMessages(this.conversationId, INITIAL_MESSAGE_OFFSET, INITIAL_MESSAGE_LIMIT)
            .then(res => {
                console.log(res);
                this.messages = res.data.getConversationMessages.reverse();
                this.spinner.hide();
            })
            .catch(err => {
                console.log(err);
                this.spinner.hide();
            })
    }
}
