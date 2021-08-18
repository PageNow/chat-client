import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxSpinnerModule } from 'ngx-spinner';

import { ChatComponent } from './chat.component';
import { ChatRoutingModule } from './chat-routing.module';
import { ChatConversation } from './chat-conversation/chat-conversation.component';
import { ChatConversationList } from './chat-conversation-list/chat-conversation-list.component';
import { ChatMessage } from './chat-message/chat-message.component';

@NgModule({
    declarations: [
        ChatComponent,
        ChatConversationList,
        ChatConversation,
        ChatMessage
    ],
    imports: [
        CommonModule,
        NgxSpinnerModule,
        ChatRoutingModule
    ]
})
export class ChatModule { }
