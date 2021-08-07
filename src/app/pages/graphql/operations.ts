import gql from 'graphql-tag';

const presenceResult = `{
    userId
    status
    url
    title
}`;

export default {
    getStatus: gql`
        query getStatus($userId: ID!) {
            status(userId: $userId) ${presenceResult}
        }
    `,
    sendHeartbeat: gql`
        query heartbeat($url: String!, $title: String!) {
            heartbeat(url: $url, title: $title) ${presenceResult}
        }
    `,
    connect: gql`
        mutation connect($url: String!, $title: String!) {
            connect(url: $url, title: $title) ${presenceResult}
        }
    `,
    disconnect: gql`
        mutation disconnect {
            disconnect ${presenceResult}
        }
    `,
    onStatus: gql`
        subscription statusChanged($userId: ID!) {
            onStatus(userId: $userId) ${presenceResult}
        }
    `
};
