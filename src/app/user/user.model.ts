export interface UserInfoBase {
    firstName: string;
    middleName: string;
    lastName: string;
    dob: string;
    gender: string;
}

export interface UserCreate {
    first_name: string;
    middle_name: string;
    last_name: string;
    dob: string;
    gender: string;
}

export interface UserInfoPublic extends UserInfoBase {
    userUuid: string;
}

export interface UserInfoPrivate extends UserInfoPublic {
    userId: string;
    email: string;
}