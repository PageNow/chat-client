[English README.md](./README.md)

PageNow 홈페이지: https://pagenow.io <br/>
PageNow 크롬 웹스토어: https://chrome.google.com/webstore/detail/pagenow/lplobiaakhgkjcldopgkbcibeilddbmc

# PageNow 클라이언트

PageNow 클라이언트는 모든 페이지의 아이프레임에 삽입되는 Angular 웹 앱입니다.

## 컴포넌트

### Pages

`Pages`는 친구들이 현재 공유 중인 활동을 볼 수 있는 컴포넌트입니다. 클라이언트의 첫 페이지이기 때문에 PageNow의 가장 핵심적인 페이지입니다.

### Chat

`Chat`은 전형적인 메시징 기능과 UI를 제공하는 컴포넌트입니다.

### Search

`Search`는 다른 유저를 검색할 수 있는 컴포넌트입니다.

### Notifications

`Notification`은 수락하지 않은 친구 요청과 읽지 않은 활동 공유 알림을 볼 수 있는 컴포넌트입니다.

### Profile

`Profile`은 사용자 정보를 표시하는 컴포넌트입니다.

## 배포

### Dev

호스팅을 세팅하려면 `amplify update hosting`을 실행합니다.

배포를 하려면 `amplify publish`을 실행합니다.

### Prod

* [shared/config.ts](./src/app/shared/config.ts)의 `EXTENSION_ID`를 퍼블리싱된 익스텐션의 아이디로 설정하고, 사용된 API 주소를 프로덕션 엔드포인트로 업데이트합니다.

* [aws-exports.js](./src/aws-exports.js)의 redirect 주소를 클라이언트 주소로 업데이트합니다.

* AWS 콘솔과 Google 개발자 콘솔의 redirect 주소에서 로컬 호스트를 제거합니다.

* `ng build --configuration production`를 실행하여 클라이언트를 빌드합니다.

* `dist/`의 파일을 압축하여 Amplify frontend 호스팅에 업로드합니다.

### 디버깅

* "access denied" 에러가 발생하면 이 [글](https://victorleungtw.medium.com/fix-aws-amplify-angular-app-error-on-access-denied-error-73c9476f9552)을 참고하여 Amplify 설정을 바꿉니다.
