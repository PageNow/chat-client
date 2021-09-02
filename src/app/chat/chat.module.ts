import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxSpinnerModule } from 'ngx-spinner';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { ChatRoutingModule } from './chat-routing.module';
import { ChatConversationComponent } from './chat-conversation/chat-conversation.component';
import { ChatConversationListComponent } from './chat-conversation-list/chat-conversation-list.component';
import { ChatMessageComponent } from './chat-message/chat-message.component';
import { PipeModule } from '../pipe/pipe.module';

@NgModule({
    declarations: [
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
        ChatRoutingModule,
        PipeModule
    ]
})
export class ChatModule { }
