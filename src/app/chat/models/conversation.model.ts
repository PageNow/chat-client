export interface Conversation {
    conversationId: string;
    title: string;
    isGroup: boolean;
    sentAt: string;
    latestContent: string;
    senderId: string;
    participantId: string; // any participant of the conversation except me
    isRead: boolean;
}
