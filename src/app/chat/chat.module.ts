import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxSpinnerModule } from 'ngx-spinner';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { ChatComponent } from './chat.component';
import { ChatRoutingModule } from './chat-routing.module';
import { ChatConversationComponent } from './chat-conversation/chat-conversation.component';
import { ChatConversationListComponent } from './chat-conversation-list/chat-conversation-list.component';
import { ChatMessageComponent } from './chat-message/chat-message.component';

@NgModule({
    declarations: [
        ChatComponent,
        ChatConversationListComponent,
        ChatConversationComponent,
        ChatMessageComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        NgxSpinnerModule,
        FontAwesomeModule,
        ChatRoutingModule
    ]
})
export class ChatModule { }
