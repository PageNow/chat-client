export interface UserInfoPublic {
    userId: string;
    firstName: string;
    middleName: string;
    lastName: string;
    userUuid: string;
    dob: string;
}

export interface UserInfoPrivate extends UserInfoPublic {
    email: string;
}