import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ChatConversationListComponent } from './chat-conversation-list/chat-conversation-list.component';
import { ChatConversationComponent } from './chat-conversation/chat-conversation.component';

const chatRoutes: Routes = [
    { path: 'conversation/:conversationId', component: ChatConversationComponent },
    { path: 'conversations', component: ChatConversationListComponent },
    { path: '', redirectTo: 'conversations' }
];

@NgModule({
    imports: [RouterModule.forChild(chatRoutes)],
    exports: [RouterModule]
})
export class ChatRoutingModule { }
