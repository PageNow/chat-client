import { Component, Input, OnInit } from '@angular/core';

import { Message } from '../models/message.model';
import { getDateDiffInMin } from '../../shared/time-utils';

@Component({
    selector: 'app-chat-message',
    templateUrl: './chat-message.component.html',
    styleUrls: ['./chat-message.component.scss']
})
export class ChatMessageComponent implements OnInit{
    @Input() currUserId: string;
    @Input() message: Message;
    @Input() senderName: string;
    @Input() senderProfileImgSrc: string;
    @Input() prevSenderId: string | null | undefined;
    @Input() isSending: boolean;
    @Input() nextMessage: Message | null;

    sentAt: string;

    ngOnInit(): void {
        // Only display the message sentAt time if it is not the message sent by a user
        // and the time difference between the previous message is greater than 2 minutes
        if (this.nextMessage === null) {
            this.sentAt = this.message.sentAt;
        } else if (this.nextMessage.senderId !== this.message.senderId) {
            this.sentAt = this.message.sentAt;
        } else if (getDateDiffInMin(this.message.sentAt, this.nextMessage.sentAt) < 2) {
            this.sentAt = '';
        } else {
            this.sentAt = this.message.sentAt;
        }
    }
}
