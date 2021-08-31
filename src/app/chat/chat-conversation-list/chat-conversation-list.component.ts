import { Component, OnInit } from "@angular/core";
import { NgxSpinnerService } from "ngx-spinner";
import { Auth } from 'aws-amplify';

import { ChatService } from "../chat.service";
import { Conversation } from "../models/conversation.model";
import { UserService } from "src/app/user/user.service";
import { getFullName } from '../../shared/user_utils';
import { UserInfoPublic } from "src/app/user/user.model";

const SPINNER_CONVERSATION_LIST_FETCH_MSG = 'Fetching conversation list...';

@Component({
    selector: 'app-chat-conversation-list',
    templateUrl: './chat-conversation-list.component.html',
    styleUrls: ['./chat-conversation-list.component.scss']
})
export class ChatConversationListComponent implements OnInit {
    currUserId: string;
    conversationArr: Conversation[] = [];
    userNameArr: string[] = [];
    imgExtArr: string[] = [];

    spinnerMsg = '';
    
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
                return this.chatService.getUserConversations()
            })        
            .then(res => {
                console.log(res);
                this.conversationArr = res.data.getUserConversations;
                const userIdArr = this.conversationArr.map(
                    x => x.senderId === this.currUserId ? x.recipientId : x.senderId);
                return this.userService.getUsersPublicInfo(userIdArr);
            })
            .then(res => {
                console.log(res);
                const userIdArr = res.map((x: UserInfoPublic) => x.user_id);
                this.userNameArr = res.map((x: UserInfoPublic) => getFullName(x.first_name, x.middle_name, x.last_name));
                this.imgExtArr = res.map((x: UserInfoPublic) => x.profile_image_extension);
                console.log(this.userNameArr);
                return this.userService.getProfileImageGetUrlArr(userIdArr, this.imgExtArr).toPromise();
            })
            .then(res => {
                console.log(res);
                this.spinner.hide();
            })
            .catch(err => {
                console.log(err);
                this.spinner.hide();
            });

    }
}
