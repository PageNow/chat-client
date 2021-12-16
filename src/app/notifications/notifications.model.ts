export interface ShareNotification {
    event_id: string;
    user_id: string;
    sent_at: string;
    url: string;
    title: string;
    seen_at: null | string;
    first_name: string;
    last_name: string;
    profile_image_extension: null | string;
}

export interface ShareNotificationSent {
    event_id: string;
    sent_at: string;
    not_seen_count: number;
    url: string;
    title: string;
}