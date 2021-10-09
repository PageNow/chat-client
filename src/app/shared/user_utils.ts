export const getFullName = (
    firstName: string, middleName: string, lastName: string
): string => {
    let fullName = '';
    if (middleName) {
        fullName = `${firstName} ${middleName} ${lastName}`;
    } else {
        fullName = `${firstName} ${lastName}`;
    }
    return fullName;
};
