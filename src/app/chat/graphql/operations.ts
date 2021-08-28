import gql from 'graphql-tag';

const directMessageType = `{
    messageId
    conversationId
    sentAt
    senderId
    recipientId
    content
    isRead
}`;

export default {
    // Queries
    getDirectConversation: gql`
        query getDirectConversation($userPairId: ID!) {
            getDirectConversation(userPairId: $userPairId) {
                userPairId
                conversationId
            }
        }
    `,
    getUserConversations: gql`
        query getUserConversations {
            getUserConversations {
                conversationId
                title
                sentAt
                content
                senderId
                recipientId
                isRead
            }
        }
    `,
    getConversationMessages: gql`
        query getConversationMessages($conversationId: ID!, $offset: Int!, $limit: Int!) {
            getConversationMessages(
                conversationId: $conversationId, offset: $offset, limit: $limit
            ) ${directMessageType}
        }
    `,

    // Mutations
    createConversation: gql`
        mutation createConversation($recipientId: ID!, $senderName: String!, $recipientName: String!) {
            createConversation(
                recipientId: $recipientId, senderName: $senderName, recipientName: $recipientName
            ) {
                conversationId
                title
            }
        }
    `,
    createDirectMessage: gql`
        mutation createDirectMessage($conversationId: ID!, $content: String!, $recipientId: ID!) {
            createDirectMessage(
                conversationId: $conversationId, content: $content, recipientId: $recipientId
            ) ${directMessageType}
        }
    `,
    setMessageIsRead: gql`
        mutation setMessageIsRead($conversationId: ID!, $senderId: ID!, $recipientId: ID!) {
            setMessageIsRead(
                conversationId: $conversationId, senderId: $senderId, recipientId: $recipientId
            ) Int
        }
    `,

    // Subscriptions
    onCreateDirectMessage: gql`
        subscription onCreateDirectMessage($recipientId: ID!) {
            onCreateDirectMessage(recipientId: $recipientId) ${directMessageType}
        }
    `,
    onSetMessageIsRead: gql`
        subscription onSetMessageIsRead($conversationId: ID!, $senderId: ID!) {
            onSetMessageIsRead(conversationId: $conversationId, senderId: $senderId) Int
        }
    `
};
