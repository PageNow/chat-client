import { AuthState } from '../auth/auth.model';

export const AUTH_STATE_KEY = '@LOCALSTORAGE: AUTH-STATE';
export const DEFAULT_AUTH_STATE: AuthState = {
    isAuthenticated: false,
    userId: null,
    email: null,
    jwt: null
};

export const VALID_PROFILE_IMG_TYPES = ['image/png', 'image/jpeg', 'image/jpg'];

export const INITIAL_TAB = 'pages';

export const SEARCH_RESULT_LIMIT = 10;

export const INITIAL_MESSAGE_OFFSET = 0;

export const INITIAL_MESSAGE_LIMIT = 15;
export const LOAD_MESSAGE_LIMIT = 20;
