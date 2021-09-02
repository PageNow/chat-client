export interface Conversation {
    conversationId: string;
    title: string;
    sentAt: string;
    content: string;
    senderId: string;
    recipientId: string;
    isRead: boolean;
}
