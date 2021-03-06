export interface UserCreate {
    first_name: string;
    last_name: string;
    dob: string;
    gender: string;
}

export interface UserInfoSummary {
    user_id: string;

    first_name: string;
    last_name: string;
    full_name?: string;

    description: string;

    profile_image_extension: string | null;
    profile_image_uploaded_at: string | null;

    friendship_state?: number;
    mutual_friend_count?: number;
    requested_at?: string;
}

export interface UserInfoPublic extends UserInfoSummary {
    dob: string;

    gender: string;
    school: string;
    work: string;
    location: string;

    profile_image_url?: string;
}

export interface UserInfoPrivate extends UserInfoPublic {
    user_id: string;
    email: string;
    email_public: boolean;
    dob_public: boolean;
    gender_public: boolean;
    school_public: boolean;
    work_public: boolean;
    location_public: boolean;

    share_mode: string;
    domain_allow_array: Array<string>;
    domain_deny_array: Array<string>;
}

export interface UserInfoUpdate {
    first_name: string;
    last_name: string;

    description: string;
    share_mode: string;
    domain_allow_array: Array<string>;
    domain_deny_array: Array<string>;

    gender: string;
    school: string;
    work: string;
    location: string;

    email_public: boolean;
    gender_public: boolean;
    school_public: boolean;
    work_public: boolean;
    location_public: boolean;
}
