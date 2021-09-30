import { Component, OnInit } from "@angular/core";
import { NgxSpinnerService } from "ngx-spinner";
import { Auth } from 'aws-amplify';
import { faCircle } from '@fortawesome/free-solid-svg-icons'

import { ChatService } from "../chat.service";
import { Conversation } from "../models/conversation.model";
import { UserService } from "src/app/user/user.service";
import { getFullName } from '../../shared/user_utils';
import { UserInfoPublic } from "src/app/user/user.model";

const SPINNER_CONVERSATION_LIST_FETCH_MSG = 'Fetching conversations...';

@Component({
    selector: 'app-chat-conversation-list',
    templateUrl: './chat-conversation-list.component.html',
    styleUrls: ['./chat-conversation-list.component.scss']
})
export class ChatConversationListComponent implements OnInit {
    currUserId: string;
    conversationArr: Conversation[] = [];
    userInfoMap: {[key: string]: UserInfoPublic} = {};

    spinnerMsg = '';

    // fontawesome icons
    faCircle = faCircle;
    
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
                return this.chatService.getUserConversations(null)
            })
            .then(res => {
                this.conversationArr = res;
                const participantIdArr = this.conversationArr.map(x => x.participantId);
                return this.userService.getUsersPublicInfo(Array.from(new Set(participantIdArr)));
            })
            .then(res => {
                console.log(res);
                this.spinnerMsg = '';
                this.spinner.hide();
                const userIdArr: string[] = [], imgExtArr: string[] = [];
                res.forEach((x: UserInfoPublic) => {
                    this.userInfoMap[x.user_id] = x;
                    this.userInfoMap[x.user_id]['full_name'] = getFullName(x.first_name, x.middle_name, x.last_name);
                    userIdArr.push(x.user_id);
                    imgExtArr.push(x.profile_image_extension);
                });
                return this.userService.getProfileImageGetUrlArr(userIdArr, imgExtArr).toPromise();
            })
            .then((res: {[key: string]: string}) => {
                for (const [key, value] of Object.entries(res)) {
                    this.userInfoMap[key]['profile_image_url'] = value;
                }
            })
            .catch(err => {
                console.log(err);
                this.spinnerMsg = '';
                this.spinner.hide();
            });

    }
}
