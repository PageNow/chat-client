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

export const HEARTBEAT_PERIOD = 15000; // send heartbeat every 15 seconds

export const EXTENSION_ID = 'lblmbljddmmblccgdabmmfmhaokfcfff';

export const USER_API_URL = 'http://localhost:8007';

export const SEARCH_RESULT_LIMIT = 10;
