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
    dob: string | null;
    gender: string | null;
    school: string | null;
    work: string | null;
    location: string | null;
}

export interface UserInfoPublic extends UserInfoBase {
    user_uuid: string;
}

export interface UserInfoPrivate extends UserInfoPublic {
    user_id: string;
    email: string;
    dob_public: boolean;
    gender_public: boolean;
    school_pubblic: boolean;
    work_public: boolean;
    location_public: boolean;

    domain_allow_array: Array<string>;
    domain_deny_array: Array<string>;
}