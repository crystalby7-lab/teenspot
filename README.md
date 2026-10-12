# TeenSpot MVP

어른 리뷰 말고, 또래가 직접 해본 것. 10대 라이프스타일 커뮤니티 (피드 + SPOT + STYLE)

- 바닐라 JS + Firebase(구글 로그인, Firestore) + GitHub Pages
- `js/config.js`의 firebase 값이 비어 있으면 **체험 모드** (이 기기에만 저장, 누구나 관리자)

## 폴더 구조

```
index.html              앱 셸
css/style.css           디자인 시스템 (네이비 #1E2A3E, 쿨그레이 바탕)
fonts/                  SUIT(본문), Fredoka(로고·숫자) — 둘 다 OFL 라이선스, 앱에 포함
js/config.js            Firebase 설정, 문의 이메일, 시작 지역
js/store.js             데이터 계층 (체험 모드 / Firebase)
js/media.js             사진 압축 (비율 자르기, JPEG 재저장, 위치 정보 제거)
js/icons.js             선 아이콘
js/brand.js             마스코트 '스팟이'(보영 원본 그림)와 워드마크
js/avatar.js            아바타 캐릭터 (부위별 옵션 → SVG)
js/app.js               화면 31개, 라우터
js/seed.js              서대문구 예시 코스 8개, 결정 투표 12개
js/legal.js             약관 초안 4종
js/style-images.js      STYLE 투표 이미지 목록
images/style/           STYLE 투표 이미지 폴더
firestore.rules         보안 규칙
manifest.webmanifest    홈 화면 추가용
```

## 실제 모드 설정

1. Firebase 콘솔에서 새 프로젝트 만들기
2. Authentication > 로그인 방법 > Google 사용 설정
3. Authentication > 설정 > 승인된 도메인에 `아이디.github.io` 추가
4. Firestore Database 만들기 (서울 리전 `asia-northeast3`)
5. Firestore > 규칙 탭에 `firestore.rules` 내용 붙여넣고 게시
6. 프로젝트 설정 > 내 앱 > 웹 앱 추가 → 설정값을 `js/config.js`에 붙여넣기
7. GitHub에 올리고 Settings > Pages에서 배포
8. 앱에서 구글 로그인·가입 완료
9. Firestore > `admins` 컬렉션 만들기 → 문서 ID에 내 UID 입력 (Authentication > 사용자에서 확인)
10. 앱 > 마이 > 설정 > 관리자 페이지 > 예시 코스·투표 불러오기

## STYLE 이미지 추가

1. `images/style/`에 사진 넣기 (얼굴 없는 상품·코디 사진)
2. `js/style-images.js` 배열에 파일 이름 추가
3. 관리자 > 투표 관리에서 선택

## 정식 출시 전 확인

- `js/legal.js` 약관 검토
- `js/config.js` 문의 이메일 변경
- 예시 코스 가격·정보를 직접 다녀온 내용으로 교체

## 피드 사진 저장 방식

- Firebase Storage는 유료 요금제가 필요해서, 사진을 폰에서 압축한 뒤 Firestore `images` 컬렉션에 저장해요 (장당 약 200KB 이하)
- 게시물은 `posts` 컬렉션에 `pending`으로 저장되고, 관리자 승인 후 `approved`로 피드에 공개돼요
- 투표 게시물은 승인 시 `polls`에도 같은 ID로 만들어져 투표 탭에 함께 나와요
- 투표 선택지는 `a`, `b`(필수), `c`, `d`(선택). 사진은 모든 선택지에 넣거나 모두 빼요
- 카테고리: outfit 옷, makeup 화장, hair 머리, food 음식, play 놀거리, etc 기타
- `firestore.rules`가 바뀌면 Firebase 콘솔 규칙 탭에 다시 붙여넣고 게시해야 해요
