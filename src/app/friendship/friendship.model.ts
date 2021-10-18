export interface Friendship {
    user_id1: string;
    user_id2: string;
    requested_at: string;
    accepted_at: string | null;
}

export enum FriendshipState {
    ACCEPTED = 2,
    PENDING = 1,
    NONE = 0
}
