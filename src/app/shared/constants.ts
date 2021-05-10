import { AuthState } from '../auth/auth.model';

export const AUTH_STATE_KEY = '@LOCALSTORAGE: AUTH-STATE';
export const DEFAULT_AUTH_STATE: AuthState = {
    isAuthenticated: false,
    username: null,
    email: null
};