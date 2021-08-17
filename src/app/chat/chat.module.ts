import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxSpinnerModule } from 'ngx-spinner';

import { ChatComponent } from './chat.component';
import { ChatRoutingModule } from './chat-routing.module';

@NgModule({
    declarations: [
        ChatComponent
    ],
    imports: [
        CommonModule,
        NgxSpinnerModule,
        ChatRoutingModule
    ]
})
export class ChatModule { }
