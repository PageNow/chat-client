import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { Subscription } from 'rxjs';
import { Auth } from 'aws-amplify';
import { v4 as uuidv4 } from 'uuid';

import { INITIAL_MESSAGE_LIMIT, INITIAL_MESSAGE_OFFSET, LOAD_MESSAGE_LIMIT } from 'src/app/shared/constants';
import { ChatService } from '../chat.service';
import { Message } from '../models/message.model';
import { EXTENSION_ID } from '../../shared/config';
import { UserService } from 'src/app/user/user.service';
import { UserInfoPublic } from 'src/app/user/user.model';
import { getFullName } from 'src/app/shared/user-utils';

const SPINNER_LOAD_MESSAGES_MSG = 'Loading messages...';

@Component({
    selector: 'app-chat-conversation',
    templateUrl: './chat-conversation.component.html',
    styleUrls: ['./chat-conversation.component.scss']
})
export class ChatConversationComponent implements OnInit, OnDestroy {
    @ViewChild('conversationContainer') conversationContainer: ElementRef;
    scrollTop = 0;

    currUserId: string;
    currUserInfoSubscription: Subscription;

    newMessageContent = '';
    messageArr: Message[] = []; // from old to new
    sendingMessageArr: Message[] = [];
    newMessageSubscription: Subscription;
    messagesAllLoaded = true;
    isLoadingMoreMessages = false;

    // variables related to conversation
    conversationId: string;
    conversationIsGroup: boolean;
    conversationTitle: string;
    recipientId: string;
    recipientName: string; // for direct conversation
    recipientImgUrl: string; // for direct conversation

    // variables related to user information
    userNameMap: {[key: string]: string} = {};
    userProfileImgUrlMap: {[key: string]: string} = {};

    // TODO: errorMap

    spinnerMsg = '';

    // fontawesome icons
    faPaperPlane = faPaperPlane;

    constructor(
        private route: ActivatedRoute,
        private spinner: NgxSpinnerService,
        private userService: UserService,
        private chatService: ChatService
    ) { }

    ngOnInit(): void {
        this.conversationId = this.route.snapshot.paramMap.get('conversationId') || '';
        this.route.queryParams.subscribe(params => {
            this.conversationTitle = params.title;
            this.conversationIsGroup = params.isGroup === 'true' ? true : false;
            this.recipientId = params.recipientId;
            this.recipientImgUrl = params.recipientImgUrl;
            this.recipientName = params.recipientName;

            this.userNameMap = {
                ...this.userNameMap,
                [this.recipientId]: this.recipientName
            };
            this.userProfileImgUrlMap = {
                ...this.userProfileImgUrlMap,
                [this.recipientId]: this.recipientImgUrl
            };

            // if group conversation, get participant information
            this.chatService.getConversationParticipants(this.conversationId)
                .then(res => {
                    const delIdx = res.indexOf(this.recipientId);
                    if (delIdx > -1) {
                        res.splice(delIdx, 1);
                    }
                    return this.userService.getUsersPublicInfo(res);
                })
                .then(res => {
                    const nameMap: {[key: string]: string} = {};
                    const userIdArr: string[] = [];
                    const profileImgExtArr: string[] = [];
                    res.forEach((x: UserInfoPublic) => {
                        nameMap[x.user_id] = getFullName(x.first_name, x.last_name);
                        if (x.profile_image_extension && x.profile_image_uploaded_at) {
                            userIdArr.push(x.user_id);
                            profileImgExtArr.push(x.profile_image_extension);
                        }
                    });
                    this.userNameMap = {
                        ...this.userNameMap,
                        ...nameMap
                    };
                    if (userIdArr.length === 0) {
                        return Promise.resolve([]);
                    }
                    return this.userService.getProfileImageGetUrlMap(userIdArr, profileImgExtArr);
                })
                .then((res: {[key: string]: string}) => {
                    this.userProfileImgUrlMap = {
                        ...this.userProfileImgUrlMap,
                        ...res
                    };
                })
                .catch(err => {
                    console.log(err);
                });
        });

        this.spinnerMsg = SPINNER_LOAD_MESSAGES_MSG;
        this.spinner.show();
        this.newMessageSubscription = this.chatService.newMessageSubject.subscribe(
            (res: Message) => {
                if (res.conversationId === this.conversationId) {
                    this.messageArr = [ ...this.messageArr, res ];
                    let delIdx;
                    for (let idx = this.sendingMessageArr.length - 1; idx >= 0; idx--) {
                        if (this.sendingMessageArr[idx].tempMessageId === res.tempMessageId) {
                            delIdx = idx;
                            break;
                        }
                    }
                    if (delIdx !== null && delIdx !== undefined) {
                        this.sendingMessageArr = [
                            ...this.sendingMessageArr.slice(0, delIdx),
                            ...this.sendingMessageArr.slice(delIdx + 1, )
                        ];
                    }
                    // set message as read
                    const message = {
                        type: 'read-messages',
                        data: {
                            conversationId: this.conversationId
                        }
                    };
                    chrome.runtime.sendMessage(EXTENSION_ID, message);
                }
            },
            err => {
                console.log(err);
            }
        );
        Auth.currentAuthenticatedUser()
            .then(res => {
                this.currUserId = res.username;
                return this.chatService.getConversationMessages(
                    this.conversationId, INITIAL_MESSAGE_OFFSET, INITIAL_MESSAGE_LIMIT, 'asc');
            })
            .then(res => {
                this.messageArr = res;
                setTimeout(() => this.scrollToBottom(), 200);
                this.spinnerMsg = '';
                this.spinner.hide();
                if (res.length < INITIAL_MESSAGE_LIMIT) {
                    this.messagesAllLoaded = true;
                } else {
                    this.messagesAllLoaded = false;
                }
                // set conversation messages as read
                const message = {
                    type: 'read-messages',
                    data: {
                        conversationId: this.conversationId
                    }
                };
                chrome.runtime.sendMessage(EXTENSION_ID, message);
            })
            .catch(err => {
                console.log(err);
                this.spinnerMsg = '';
                this.spinner.hide();
            });
    }

    ngOnDestroy(): void {
        this.currUserInfoSubscription?.unsubscribe();
        this.newMessageSubscription?.unsubscribe();
    }

    sendMessage(): void {
        if (!this.conversationId || !this.newMessageContent || this.newMessageContent === '') {
            return;
        }
        const tempMessageId = uuidv4();
        const newMessage: Message = {
            messageId: '',
            conversationId: this.conversationId,
            sentAt: '',
            senderId: this.currUserId,
            content: this.newMessageContent,
            tempMessageId
        };

        this.sendingMessageArr = [ ...this.sendingMessageArr, newMessage ];
        setTimeout(() => this.scrollToBottom(), 200);

        const message = {
            type: 'send-message',
            data: {
                tempMessageId,
                content: this.newMessageContent,
                conversationId: this.conversationId
            }
        };
        chrome.runtime.sendMessage(EXTENSION_ID, message);
        this.newMessageContent = '';
    }

    scrollToBottom(): void {
        try {
            this.scrollTop = this.conversationContainer.nativeElement.scrollHeight;
        } catch (err) { /* */ }
    }

    loadPreviousMessages(): void {
        this.isLoadingMoreMessages = true;
        this.chatService.getConversationMessages(this.conversationId, this.messageArr.length, LOAD_MESSAGE_LIMIT, 'asc')
            .then(res => {
                this.messageArr = [ ...res, ...this.messageArr ];
                if (res.length < LOAD_MESSAGE_LIMIT) {
                    this.messagesAllLoaded = true;
                }
                this.isLoadingMoreMessages = false;
            })
            .catch(err => {
                console.log(err);
                this.isLoadingMoreMessages = false;
            });
    }
}
