export interface Message {
    messageId: string;
    conversationId: string;
    sentAt: string;
    senderId: string;
    recipientId: string;
    content: string;
    isRead: boolean;
}
