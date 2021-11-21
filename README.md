# PageNow Chat Client

[![CircleCI](https://circleci.com/gh/PageNow/chat-client.svg?style=svg&circle-token=d9d24a3c9faf5c9b39718dc6a2eba2d0f88da260)](https://app.circleci.com/pipelines/github/PageNow/chat-client)
[![codecov](https://codecov.io/gh/PageNow/chat-client/branch/main/graph/badge.svg?token=0T4EIXF6FU)](https://codecov.io/gh/PageNow/chat-client)

Link to Chrome Web Store: https://chrome.google.com/webstore/detail/pagenow/lplobiaakhgkjcldopgkbcibeilddbmc

Chat client is the web application that is injected to the iframe on each page.

## Deployment

### Dev

To set up hosting, run `amplify update hosting`.
To deploy to host, run `amplify publish`.

### Prod

* Update `shared/config.ts`
* Update `aws-exports.js` redirect urls.
* Remove localhost from the redirect urls on aws console and Google developer console.
* Run `ng build`.

### Issue

* If "access denied" error occurs for non-index pages, follow this [post](https://victorleungtw.medium.com/fix-aws-amplify-angular-app-error-on-access-denied-error-73c9476f9552).

## TODO

### Cache

* Use cache for profile images.

### Profile

*  Make public profile as an independent page.

## References

### Amplify Authentication

* https://stackoverflow.com/questions/60244048/login-to-chrome-extension-via-website-with-aws-amplify

### Chrome Extension
* https://stackoverflow.com/questions/47075437/cannot-find-namespace-name-chrome

### ChatQL

* https://aws.amazon.com/blogs/mobile/building-a-serverless-real-time-chat-application-with-aws-appsync/
* https://github.com/aws-samples/aws-mobile-appsync-chat-starter-angular

### Testing

* https://pretagteam.com/question/thismobilityservicecurrentmessagesubscribe-is-not-a-function-in-angular-unit-testing
