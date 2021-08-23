import { Component } from "@angular/core";

import { ChatService } from "../chat.service";
import { Conversation } from "../models/conversation.model";

@Component({
    selector: 'app-chat-conversation-list',
    templateUrl: './chat-conversation-list.component.html',
    styleUrls: ['./chat-conversation-list.component.scss']
})
export class ChatConversationListComponent {
    conversations: Conversation[] = [];
    
    constructor(
        private chatService: ChatService
    ) { }


}
