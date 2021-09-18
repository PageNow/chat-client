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

export const HEARTBEAT_PERIOD = 5000; // send heartbeat every 15 seconds

export const EXTENSION_ID = 'lblmbljddmmblccgdabmmfmhaokfcfff';

export const USER_API_URL = 'https://23j6nca7m1.execute-api.us-west-2.amazonaws.com/dev';
export const PRESENCE_API_URL = 'https://zyz4giy4oi.execute-api.us-west-2.amazonaws.com/dev';

export const SEARCH_RESULT_LIMIT = 10;

export const INITIAL_MESSAGE_OFFSET = 0;

export const INITIAL_MESSAGE_LIMIT = 15;
