# PageNow Chat Client

[![CircleCI](https://circleci.com/gh/PageNow/chat-client.svg?style=svg&circle-token=d9d24a3c9faf5c9b39718dc6a2eba2d0f88da260)](https://app.circleci.com/pipelines/github/PageNow/chat-client)
[![codecov](https://codecov.io/gh/PageNow/chat-client/branch/main/graph/badge.svg?token=0T4EIXF6FU)](https://codecov.io/gh/PageNow/chat-client)

## Deployment

### Dev

To set up hosting, run `amplify update hosting`.
To deploy to host, run `amplify publish`.

### Prod

* Update `shared/config.js`
* Update `aws-exports.js` redirect urls.

## Changing

If "access denied" error occurs for non-index pages, follow this [post](https://victorleungtw.medium.com/fix-aws-amplify-angular-app-error-on-access-denied-error-73c9476f9552).

## Work Flow

* Tabs
- Call http endpoint to get current user info
- If current user info is null, navigate to /user-registration
- Publish current user info

* Ohter components
- Subscribe to userService behaviorsubject
- Show content only when they receive 

## TODO

### Auth

* Change to Auth.currentUser() from currentSession() since we are using jwt interceptor now
* In first sign in - fetch user spinner is displayed forever
* First sign-in process is not smooth
* External provider - check if the same email exists

### Pages

* Better UI on displaying offline and current page

### Cache

* Use cache for profile images
* Use cache for friend requests

### Profile

* Validate or convert domain input by user

### License

* Link to simpleicon.com
* Link to fontawesome

## References

### AppSync

* https://github.com/arjunsk/amplify-appsync-app

### Amplify Authentication

* https://stackoverflow.com/questions/60244048/login-to-chrome-extension-via-website-with-aws-amplify

### Chrome Extension
* https://stackoverflow.com/questions/47075437/cannot-find-namespace-name-chrome

### ChatQL

* https://aws.amazon.com/blogs/mobile/building-a-serverless-real-time-chat-application-with-aws-appsync/
* https://github.com/aws-samples/aws-mobile-appsync-chat-starter-angular

### Testing

* https://pretagteam.com/question/thismobilityservicecurrentmessagesubscribe-is-not-a-function-in-angular-unit-testing
