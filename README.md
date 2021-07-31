# chat-client

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