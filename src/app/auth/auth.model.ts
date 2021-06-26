export interface AuthState {
    isAuthenticated: boolean;
    jwt: string | null;
    userId: string | null;
    email: string | null;
}
