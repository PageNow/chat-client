import { AuthState } from '../auth/auth.model';

export const AUTH_STATE_KEY = '@LOCALSTORAGE: AUTH-STATE';
export const DEFAULT_AUTH_STATE: AuthState = {
    isAuthenticated: false,
    userId: null,
    email: null,
    jwt: null
};

export const INITIAL_TAB = 'pages';

export const HEARTBEAT_PERIOD = 20000; // send heartbeat every 20 seconds

export const EXTENSION_ID = 'lblmbljddmmblccgdabmmfmhaokfcfff';

export const USER_API_URL = 'http://localhost:8007';
