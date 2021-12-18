[한국어 README.md](./README_KO.md)

PageNow Home Page: https://pagenow.io <br/>
PageNow Chrome Web Store: https://chrome.google.com/webstore/detail/pagenow/lplobiaakhgkjcldopgkbcibeilddbmc

# PageNow Client

[![CircleCI](https://circleci.com/gh/PageNow/chat-client.svg?style=svg&circle-token=d9d24a3c9faf5c9b39718dc6a2eba2d0f88da260)](https://app.circleci.com/pipelines/github/PageNow/chat-client)
[![codecov](https://codecov.io/gh/PageNow/chat-client/branch/main/graph/badge.svg?token=0T4EIXF6FU)](https://codecov.io/gh/PageNow/chat-client)

PageNow client is an Angular web application that is injected to the iframe on each page.

## Components

### Pages

`Pages` is a component that shows the pages that friends are sharing. It is the main component of the client as it is the first page that opens.

### Chat

`Chat` is a component that provides conversation features. It supports typical message functionalities and UI.

### Search

`Search` is a component used to search other users using PageNow.

### Notifications

`Notification` is a component that shows unaccepted friend requests and unread share notifications that a user has received. 

### Profile

`Profile` is a component that shows user information.

## Deployment

### Dev

To set up hosting, run `amplify update hosting`.

To deploy to host, run `amplify publish`.

### Prod

* In [shared/config.ts](./src/app/shared/config.ts), update `EXTENSION_ID` to the ID of the publisehd extension and update all URLs to production endpoints.

* Update [aws-exports.js](./src/aws-exports.js) redirect urls to production url.

* Remove localhost from the redirect urls on AWS console and Google Developer Console.

* Run `ng build --configuration production` to build the client.

* Zip the outputs in `dist/` and upload it to Amplify frontend hosting.

### Issue

* If "access denied" error occurs for non-index pages, follow the instructions in this [post](https://victorleungtw.medium.com/fix-aws-amplify-angular-app-error-on-access-denied-error-73c9476f9552).
