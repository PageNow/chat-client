import { Injectable } from '@angular/core';
import { Apollo, ApolloBase } from 'apollo-angular';

import operations from './graphql/operations';

@Injectable({
    providedIn: 'root'
})
export class ChatService {
    private apollo: ApolloBase;

    constructor(private apolloProvider: Apollo) {
        this.apollo = this.apolloProvider.use('chat');
    }

    public async getDirectMessageConversation(userPairId: string): Promise<any> {
        return await this.apollo.query({
            query: operations.getDirectMessageConversation,
            variables: { userPairId }
        }).toPromise();
    }

    public async createConversation(userId: string, conversationName: string): Promise<any> {
        return await this.apollo.mutate({
            mutation: operations.createConversation,
            variables: { recipientId: userId, name: conversationName }
        }).toPromise();
    }

    // conversation - one to one, group - many people

    public getAllConversations() {
        // getAllConvos() {
        //     this.appsync.hc().then(client => {
        //       const observable: ObservableQuery<UserConvosQuery> = client.watchQuery({
        //         query: getUserConversationsConnection,
        //         variables: { first: constants.conversationFirst},
        //         fetchPolicy: 'cache-and-network'
        //       });
        
        //       observable.subscribe(({data}) => {
        //         console.log('Fetched convos data', data);
        //         if (!data || !data.me) { return console.log('getUserConversationsConnection: no data'); }
        //         this.conversations = data.me.conversations.userConversations.map(u => u.conversation).filter(c => c);
        //         this.conversations = _.sortBy(this.conversations, 'name');
        //         this.nextToken = data.me.conversations.nextToken;
        //         console.log('Fetched convos', this.conversations);
        //       });
        
        //       this.subscription = observable.subscribeToMore({
        //         document: subscribeToNewUserConversations,
        //         variables: { 'userId': this._user.id },
        //         updateQuery: (prev: UserConvosQuery, {subscriptionData: {data: {subscribeToNewUCs: userConvo }}}) => {
        //           console.log('updateQuery on convo subscription', userConvo);
        //           // console.log(JSON.stringify(userConvo, null, 2));
        //           // console.log(JSON.stringify(prev, null, 2));
        //           return addConversation(prev, userConvo);
        //         }
        //       });
        //       this.observedQuery = observable;
        //       return observable;
        //     });
        //   }
    }

    public createNewConversation() {
        // createNewConversation(user, event) {
        //     event.stopPropagation();

        // this.appsync.hc().then(client => {

        //   const options = {
        //     query: getUserConversationsConnection,
        //     variables: { first: constants.conversationFirst }
        //   };

        //   const userConvos = client.readQuery(options);
        //   const path = 'me.conversations.userConversations';
        //   const userConvo = (_.chain(userConvos).get(path) as any).find(c => _.some(c.associated, ['userId', user.id])).value();

        //   if (userConvo) {
        //     return this.onNewConvo.emit(userConvo.conversation);
        //   }

        //   const newConvo: Conversation = {
        //     id: uuid(),
        //     name: _.map([this._user, user], 'username').sort().join(' and '),
        //     createdAt: `${Date.now()}`
        //   };

        //   client.mutate({
        //     mutation: createConversation,
        //     variables: newConvo
        //   })
        //   .then(() => createUserConvo(client, user.id, newConvo.id))
        //   .then(() => createUserConvo(client, this._user.id, newConvo.id, true))
        //   .then(() => this.onNewConvo.emit(newConvo))
        //   .catch(err => console.log('create convo error', err));
        //   Analytics.record('New Conversation');
        // });
    }

    public loadMessages() {
        // loadMessages(event = null, fetchPolicy = 'cache-and-network') {
        //     if (event) { event.stopPropagation(); }
        //     const innerObserable = this.appsync.hc().then(client => {
        //       console.log('chat-message-view: loadMessages', this._conversation.id, fetchPolicy);
        //       const options = {
        //         query: getConversationMessages,
        //         fetchPolicy: fetchPolicy,
        //         variables: {
        //           conversationId: this._conversation.id,
        //           first: constants.messageFirst
        //         }
        //       };
        
        //       const observable: ObservableQuery<MessagesQuery> = client.watchQuery(options);
        
        //       observable.subscribe(({data}) => {
        //         console.log('chat-message-view: subscribe', data);
        //         if (!data) { return console.log('getConversationMessages - no data'); }
        //         const newMessages = data.allMessageConnection.messages;
        //         this.messages = [...newMessages].reverse();
        //         this.nextToken = data.allMessageConnection.nextToken;
        //         console.log('chat-message-view: nextToken is now', this.nextToken ? 'set' : 'null');
        //       });
        
        //       this.subscription = observable.subscribeToMore({
        //         document: subscribeToNewMessages,
        //         variables: { 'conversationId': this._conversation.id },
        //         updateQuery: (prev: MessagesQuery, {subscriptionData: {data: {subscribeToNewMessage: message }}}) => {
        //           console.log('subscribeToMore - updateQuery:', message);
        //           return unshiftMessage(prev, message);
        //         }
        //       });
        //       this.observedQuery = observable;
        //       return observable;
        //     });
        //     return from(innerObserable);
        //   }
    }

    public loadMoreMessages() {
        // loadMoreMessages(event = null) {
        //     if (event) { event.stopPropagation(); event.preventDefault(); }
        //     if (!this.nextToken) { return EMPTY; }
        //     const result = this.observedQuery.fetchMore({
        //       variables : { after: this.nextToken },
        //       updateQuery: (prev, {fetchMoreResult} ) => {
        //         if (!fetchMoreResult) { return prev; }
        //         const _res = pushMessages(prev as MessagesQuery,
        //           fetchMoreResult.allMessageConnection.messages,
        //           fetchMoreResult.allMessageConnection.nextToken);
        //         this.completedFetching = false;
        //         this.fetchingMore = true;
        //         return _res;
        //       }
        //     });
        //     return from(result);
        //   }
    }

}