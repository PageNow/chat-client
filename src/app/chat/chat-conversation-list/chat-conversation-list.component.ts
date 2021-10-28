import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { Auth } from 'aws-amplify';
import { faCircle } from '@fortawesome/free-solid-svg-icons';
import { Subscription } from 'rxjs';

import { ChatService } from '../chat.service';
import { Conversation } from '../models/conversation.model';
import { UserService } from 'src/app/user/user.service';
import { getFullName } from '../../shared/user_utils';
import { UserInfoPublic } from 'src/app/user/user.model';
import { USER_DEFAULT_IMG_ASSET } from 'src/app/shared/constants';
import { Message } from '../models/message.model';

const SPINNER_CONVERSATION_LIST_FETCH_MSG = 'Fetching conversations...';

@Component({
    selector: 'app-chat-conversation-list',
    templateUrl: './chat-conversation-list.component.html',
    styleUrls: ['./chat-conversation-list.component.scss']
})
export class ChatConversationListComponent implements OnInit, OnDestroy {
    currUserId: string;
    conversationArr: Conversation[] = [];
    userInfoMap: {[key: string]: UserInfoPublic} = {};

    spinnerMsg = '';

    // fontawesome icons
    faCircle = faCircle;

    newMessageSubscription: Subscription;

    constructor(
        private spinner: NgxSpinnerService,
        private userService: UserService,
        private chatService: ChatService
    ) { }

    ngOnInit(): void {
        this.spinnerMsg = SPINNER_CONVERSATION_LIST_FETCH_MSG;
        this.spinner.show();

        Auth.currentAuthenticatedUser()
            .then(res => {
                this.currUserId = res.username;
                this.subscribeToNewMessages();
                return this.chatService.getUserConversations(null);
            })
            .then(res => {
                this.conversationArr = res;
                const participantIdArr = this.conversationArr.map(x => x.participantId);
                if (res.length > 0) {
                    return this.userService.getUsersPublicInfo(Array.from(new Set(participantIdArr)));
                } else {
                    return Promise.resolve([]);
                }
            })
            .then(res => {
                this.spinnerMsg = '';
                this.spinner.hide();
                const userIdArr: string[] = [];
                const imgExtArr: string[] = [];
                res.forEach((x: UserInfoPublic) => {
                    this.userInfoMap[x.user_id] = x;
                    this.userInfoMap[x.user_id].full_name = getFullName(x.first_name, x.last_name);
                    if (x.profile_image_extension) {
                        userIdArr.push(x.user_id);
                        imgExtArr.push(x.profile_image_extension);
                    } else {
                        this.userInfoMap[x.user_id].profile_image_url = USER_DEFAULT_IMG_ASSET;
                    }
                });
                if (userIdArr.length > 0) {
                    return this.userService.getProfileImageGetUrlMap(userIdArr, imgExtArr);
                } else {
                    return Promise.resolve({});
                }
            })
            .then((res: {[key: string]: string}) => {
                for (const [key, value] of Object.entries(res)) {
                    this.userInfoMap[key].profile_image_url = value;
                }
            })
            .catch(err => {
                console.log(err);
                this.spinnerMsg = '';
                this.spinner.hide();
            });
    }

    ngOnDestroy(): void {
        this.newMessageSubscription?.unsubscribe();
    }

    subscribeToNewMessages(): void {
        this.newMessageSubscription = this.chatService.newMessageSubject.subscribe(
            (res: Message) => {
                const conversationIdx = this.conversationArr.map(
                    (x: Conversation) => x.conversationId).indexOf(res.conversationId);
                let participantId: string;
                let newConversation: Conversation;
                if (conversationIdx === -1) { // if the new message is a new conversation
                    this.chatService.getConversation(res.conversationId)
                        .then(resp => {
                            participantId = resp.participantId;
                            newConversation = {
                                conversationId: res.conversationId,
                                title: resp.title,
                                isGroup: resp.isGroup,
                                sentAt: res.sentAt,
                                latestContent: res.content,
                                senderId: res.senderId,
                                participantId: resp.participantId,
                                isRead: res.senderId === this.currUserId
                            };
                            if (!Object.prototype.hasOwnProperty.call(this.userInfoMap, participantId)) {
                                return this.userService.getUserPublicInfo(participantId);
                            } else {
                                return Promise.resolve(this.userInfoMap[participantId]);
                            }
                        })
                        .then((resp: UserInfoPublic) => {
                            this.userInfoMap[participantId] = resp;
                            this.userInfoMap[participantId].full_name = getFullName(resp.first_name, resp.last_name);
                            this.conversationArr = [ newConversation, ...this.conversationArr ];
                            if (resp.profile_image_extension) {
                                return this.userService.getProfileImageGetUrl(participantId, resp.profile_image_extension);
                            } else {
                                return Promise.resolve(USER_DEFAULT_IMG_ASSET);
                            }
                        })
                        .then((resp: string) => {
                            this.userInfoMap[participantId].profile_image_url = resp;
                        })
                        .catch(err => {
                            console.log(err);
                        });
                } else { // if the new message is part of an existing conversation
                    this.conversationArr[conversationIdx].latestContent = res.content;
                    this.conversationArr[conversationIdx].senderId = res.senderId;
                    this.conversationArr[conversationIdx].sentAt = res.sentAt;
                    this.conversationArr[conversationIdx].isRead = res.senderId === this.currUserId;
                }
            },
            err => {
                console.log(err);
            }
        );
    }
}
