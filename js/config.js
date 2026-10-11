// TeenSpot 설정
// firebase 값을 비워두면 '체험 모드'로 동작해요 (데이터가 이 기기에만 저장됨).
// Firebase 콘솔 > 프로젝트 설정 > 내 앱(웹)에서 복사한 값을 넣으면 실제 모드로 바뀌어요.
window.TS_CONFIG = {
  firebase: {
    apiKey: "",
    authDomain: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: ""
  },
  // 설정 > 문의하기에 쓰일 이메일 (공개해도 되는 주소로 바꿔주세요)
  contactEmail: "contact@example.com",
  // MVP 서비스 지역
  launchGu: "서대문구"
};
