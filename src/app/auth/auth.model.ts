export interface User {
    username: string | null;
    email: string | null;
}

export interface AuthState {
    isAuthenticated: boolean;
    username: string | null;
    email: string | null;
}
