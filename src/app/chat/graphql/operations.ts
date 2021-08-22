import gql from 'graphql-tag';

export default {
    getDirectMessageConversation: gql`
        query getDirectMessageConversation($userPairId: ID!) {
            directMessageConversation(userPairId: $userPairId) {
                userPairId
                conversationId
            }
        }
    `,
    createConversation: gql`
        mutation createConversation($recipientId: ID!, $name: String!) {
            createConversation(recipientId: $recipientId, name: $name) {
                conversationId
            }
        }
    `
};
