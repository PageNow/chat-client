import { Component, Input } from "@angular/core";

import { Message } from "../models/message.model";

@Component({
    selector: 'app-chat-message',
    templateUrl: './chat-message.component.html',
    styleUrls: ['./chat-message.component.scss']
})
export class ChatMessageComponent {
    @Input() currUserId: string;
    @Input() conversationTitle: string;
    @Input() message: Message;
    @Input() profileImgSrc: string;
}
