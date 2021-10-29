/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import {
    CognitoIdToken,
    CognitoAccessToken,
    CognitoRefreshToken,
    CognitoUserSession,
    CognitoUser,
    CognitoUserPool,
} from 'amazon-cognito-identity-js';
import awsmobile from '../../aws-exports';

export const setAuthSession = (session: any): void => {
    const idToken = new CognitoIdToken({
        IdToken: session.idToken.jwtToken
    });
    const accessToken = new CognitoAccessToken({
          AccessToken: session.accessToken.jwtToken
    });
    const refreshToken = new CognitoRefreshToken({
          RefreshToken: session.refreshToken.token
    });
    const clockDrift = session.clockDrift;
    const sessionData = {
        IdToken: idToken,
        AccessToken: accessToken,
        RefreshToken: refreshToken,
        ClockDrift: clockDrift
    };

    // Create the session
    const userSession  = new CognitoUserSession(sessionData);
    const userData = {
        Username: userSession.getIdToken().payload['cognito:username'],
        Pool: new CognitoUserPool({
            UserPoolId: awsmobile.aws_user_pools_id,
            ClientId: awsmobile.aws_user_pools_web_client_id
        })
    };

    // Make a new cognito user
    const cognitoUser = new CognitoUser(userData);
    // Attach the session to the user
    cognitoUser.setSignInUserSession(userSession);
};
