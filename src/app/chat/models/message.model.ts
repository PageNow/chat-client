export interface Message {
    id: string; // Generated id for a message
    conversationId: string; // Id of conversation the message belongs to (primary key)
    content: string; // Message content
    createdAt: string | null; // Message timestamp (sort key)
    sender: string | null;
    isSent: boolean | null; // Flag denoting if this message has been accepted by the server or not
}
