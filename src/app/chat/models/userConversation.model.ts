import { Conversation } from './conversation.model';

export interface UserConversation {
    userId: string;
    conversationId: string;
    conversation?: Conversation | null;
}
