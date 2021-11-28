import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { Auth } from 'aws-amplify';
import { faCircle } from '@fortawesome/free-solid-svg-icons';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

import { ChatService } from '../chat.service';
import { Conversation } from '../models/conversation.model';
import { UserService } from 'src/app/user/user.service';
import { getFullName } from '../../shared/user-utils';
import { UserInfoPublic } from 'src/app/user/user.model';
import { LANG_KO, USER_DEFAULT_IMG_ASSET } from 'src/app/shared/constants';
import { Message } from '../models/message.model';
import { LanguageService } from 'src/app/shared/language.service';

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
    LANG_KO = LANG_KO;
    userLanguage: string | null | undefined;
    userLanguageSubscription: Subscription;

    // fontawesome icons
    faCircle = faCircle;
    enRegex = /^[A-Za-z0-9.?!, ]*$/;

    newMessageSubscription: Subscription;

    constructor(
        private spinner: NgxSpinnerService,
        private translateService: TranslateService,
        private userService: UserService,
        private chatService: ChatService,
        private languageService: LanguageService
    ) { }

    ngOnInit(): void {
        this.userLanguage = this.translateService.currentLang;
        this.userLanguageSubscription = this.languageService.userLanguageSubject.subscribe(
            (userLanguage: string) => {
                this.userLanguage = userLanguage;
            }
        );
        this.translateService.get("fetchingConversations").subscribe(
            (res: string) => {
                this.spinnerMsg = res;
            }
        )
        this.spinner.show();

        Auth.currentAuthenticatedUser()
            .then(res => {
                this.currUserId = res.username;
                this.subscribeToNewMessages();
                return this.chatService.getUserConversations(null);
            })
            .then(res => {
                this.conversationArr = res;
                // need participant names to display the title of each conversation
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
        this.userLanguageSubscription?.unsubscribe();
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
                            // need the user profile image to display (since the conversation is new, assume we don't have the url)
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
