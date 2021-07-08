export interface UserCreate {
    first_name: string;
    middle_name: string;
    last_name: string;
    dob: string;
    gender: string;
}

export interface UserInfoBase {
    first_name: string;
    middle_name: string;
    last_name: string;
    dob: string;

    description: string;

    gender: string;
    school: string;
    work: string;
    location: string;
}

export interface UserInfoPublic extends UserInfoBase {
    user_uuid: string;
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
    middle_name: string;
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
