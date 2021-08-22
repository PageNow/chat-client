import { Component } from "@angular/core";
import { ChatService } from "../chat.service";
import { Message } from "../models/message.model";


@Component({
    selector: 'app-chat-conversation',
    templateUrl: './chat-conversation.component.html',
    styleUrls: ['./chat-conversation.component.scss']
})
export class ChatConversationComponent {
    messages: Message[] = [];

    constructor(
        private chatService: ChatService
    ) { }


}
