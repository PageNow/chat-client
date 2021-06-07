export interface User {
    userId: string | null;
    email: string | null;
}

export interface AuthState {
    isAuthenticated: boolean;
    userId: string | null;
    email: string | null;
}
