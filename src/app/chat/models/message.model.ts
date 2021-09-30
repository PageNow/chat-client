export interface Message {
    messageId: string;
    conversationId: string;
    sentAt: string;
    senderId: string;
    content: string;
    tempMessageId?: string;
}
