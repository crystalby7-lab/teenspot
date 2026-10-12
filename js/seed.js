// 초기 예시 콘텐츠 (서대문구)
// 장소 이름은 일반 명칭, 비용은 1인 예상 금액이에요. 직접 다녀온 뒤 실제 정보로 바꿔주세요.

window.TS_SEED = {
  courses: [
    {
      id: "seed-01", title: "이대 앞 사진 찍고 떡볶이", gu: "서대문구", area: "이대",
      peopleMin: 2, peopleMax: 4, hours: 3,
      stops: [
        { name: "이대역 근처 포토부스", cost: 2000, note: "4컷 기준, 인원수로 나눈 금액" },
        { name: "이화여대 캠퍼스 산책", cost: 0, note: "ECC 계단에서 사진 찍기" },
        { name: "이대 앞 분식집 떡볶이", cost: 5000, note: "" },
        { name: "이대 골목 소품샵 구경", cost: 0, note: "" },
        { name: "버블티 테이크아웃", cost: 4500, note: "" }
      ],
      note: "예시 코스 · 가격은 방문 전 확인"
    },
    {
      id: "seed-02", title: "신촌 연세로 노래방 코스", gu: "서대문구", area: "신촌",
      peopleMin: 2, peopleMax: 5, hours: 3,
      stops: [
        { name: "신촌 코인노래방", cost: 3000, note: "곡 수에 따라 달라짐" },
        { name: "연세로 산책", cost: 0, note: "주말엔 차 없는 거리 행사 확인" },
        { name: "생활용품점 구경", cost: 3000, note: "" },
        { name: "디저트 테이크아웃", cost: 4000, note: "" }
      ],
      note: "예시 코스 · 가격은 방문 전 확인"
    },
    {
      id: "seed-03", title: "안산 자락길 피크닉", gu: "서대문구", area: "안산",
      peopleMin: 2, peopleMax: 6, hours: 3,
      stops: [
        { name: "편의점 간식 장보기", cost: 5000, note: "" },
        { name: "안산 자락길 걷기", cost: 0, note: "데크길이라 운동화면 충분" },
        { name: "전망 좋은 곳에서 간식 타임", cost: 0, note: "" }
      ],
      note: "예시 코스 · 날씨 확인 필수"
    },
    {
      id: "seed-04", title: "연희동 빵집 투어", gu: "서대문구", area: "연희동",
      peopleMin: 2, peopleMax: 3, hours: 3,
      stops: [
        { name: "연희동 베이커리", cost: 5000, note: "" },
        { name: "연희동 골목 산책", cost: 0, note: "" },
        { name: "카페 음료", cost: 5500, note: "" }
      ],
      note: "예시 코스 · 가격은 방문 전 확인"
    },
    {
      id: "seed-05", title: "독립공원 역사 산책", gu: "서대문구", area: "독립문",
      peopleMin: 2, peopleMax: 6, hours: 3,
      stops: [
        { name: "서대문독립공원 산책", cost: 0, note: "" },
        { name: "서대문형무소역사관", cost: 2000, note: "청소년 요금은 방문 전 확인" },
        { name: "영천시장 간식", cost: 3000, note: "" }
      ],
      note: "예시 코스 · 가격은 방문 전 확인"
    },
    {
      id: "seed-06", title: "신촌 보드게임 카페", gu: "서대문구", area: "신촌",
      peopleMin: 3, peopleMax: 6, hours: 4,
      stops: [
        { name: "보드게임 카페 2시간", cost: 8000, note: "시간제 요금" },
        { name: "분식으로 저녁", cost: 6000, note: "" }
      ],
      note: "예시 코스 · 가격은 방문 전 확인"
    },
    {
      id: "seed-07", title: "홍제천 산책 + 폭포 구경", gu: "서대문구", area: "홍제",
      peopleMin: 2, peopleMax: 4, hours: 2,
      stops: [
        { name: "홍제천 산책로", cost: 0, note: "" },
        { name: "홍제폭포 구경", cost: 0, note: "가동 시간 확인" },
        { name: "근처 카페 음료", cost: 5000, note: "" }
      ],
      note: "예시 코스 · 가격은 방문 전 확인"
    },
    {
      id: "seed-08", title: "이대 빈티지 쇼핑", gu: "서대문구", area: "이대",
      peopleMin: 2, peopleMax: 3, hours: 3,
      stops: [
        { name: "빈티지 숍 구경", cost: 0, note: "" },
        { name: "액세서리 가게", cost: 5000, note: "구경만 해도 OK" },
        { name: "와플 간식", cost: 3500, note: "" }
      ],
      note: "예시 코스 · 가격은 방문 전 확인"
    }
  ],
  polls: [
    { id: "q-01", cat: "food", question: "학원 끝나고 뭐 먹지?", a: { label: "마라탕", img: "" }, b: { label: "떡볶이", img: "" }, c: { label: "편의점 라면", img: "" }, d: { label: "김밥", img: "" } },
    { id: "q-02", cat: "play", question: "이번 주말 신촌에서 뭐 할까?", a: { label: "코인노래방", img: "" }, b: { label: "보드게임 카페", img: "" }, c: { label: "포토부스 + 카페", img: "" } },
    { id: "q-03", cat: "outfit", question: "흰 티셔츠엔 어떤 바지?", a: { label: "와이드 데님", img: "" }, b: { label: "카고 팬츠", img: "" }, c: { label: "트레이닝 팬츠", img: "" } },
    { id: "q-04", cat: "etc", question: "시험 기간 공부 장소는?", a: { label: "집", img: "" }, b: { label: "스터디카페", img: "" }, c: { label: "도서관", img: "" }, d: { label: "카페", img: "" } },
    { id: "q-05", cat: "makeup", question: "데일리 립 컬러는?", a: { label: "코랄", img: "" }, b: { label: "로즈", img: "" }, c: { label: "누디 베이지", img: "" } },
    { id: "q-06", cat: "food", question: "편의점 디저트 하나만 고르면?", a: { label: "푸딩", img: "" }, b: { label: "생크림빵", img: "" }, c: { label: "아이스크림", img: "" } },
    { id: "q-07", cat: "outfit", question: "쌀쌀한 날 겉옷은?", a: { label: "바람막이", img: "" }, b: { label: "후드 집업", img: "" }, c: { label: "가디건", img: "" } },
    { id: "q-08", cat: "hair", question: "앞머리 스타일은?", a: { label: "시스루뱅", img: "" }, b: { label: "앞머리 없이", img: "" } },
    { id: "q-09", cat: "play", question: "친구 생일 파티 장소는?", a: { label: "파티룸", img: "" }, b: { label: "방탈출 카페", img: "" }, c: { label: "노래방", img: "" } },
    { id: "q-10", cat: "hair", question: "가을 머리색은?", a: { label: "흑갈색", img: "" }, b: { label: "애쉬 브라운", img: "" }, c: { label: "자연 갈색", img: "" } },
    { id: "q-11", cat: "makeup", question: "블러셔 위치는?", a: { label: "광대 위", img: "" }, b: { label: "볼 중앙", img: "" } },
    { id: "q-12", cat: "etc", question: "프사 바꿀까?", a: { label: "바꾼다", img: "" }, b: { label: "그대로 둔다", img: "" } }
  ],
  // 공개 프로필 (TeenSpot 에디터 계정)
  publicProfiles: {
    teenspot: { nickname: "TeenSpot 에디터", official: true, avatar: { skin: 1, hairColor: 0, shirt: 0, bg: 0, hair: "bun", eyes: "smile", mouth: "smile", acc: "glasses", cheek: true }, styleTags: ["꾸안꾸", "캐주얼"], playTags: ["사진", "카페"], personalColor: "" }
  },
  // 예시 피드 게시물 (TeenSpot 에디터 계정)
  posts: [
    { id: "q-01", type: "vote", uid: "teenspot", nickname: "TeenSpot 에디터", cat: "food", question: "학원 끝나고 뭐 먹지?", text: "학원 10시에 끝나요. 늦게까지 여는 곳으로", a: { label: "마라탕", img: "" }, b: { label: "떡볶이", img: "" }, c: { label: "편의점 라면", img: "" }, d: { label: "김밥", img: "" } },
    { id: "q-02", type: "vote", uid: "teenspot", nickname: "TeenSpot 에디터", cat: "play", question: "이번 주말 신촌에서 뭐 할까?", text: "3명이고 예산은 1인 1만5천원", a: { label: "코인노래방", img: "" }, b: { label: "보드게임 카페", img: "" }, c: { label: "포토부스 + 카페", img: "" } },
    { id: "q-03", type: "vote", uid: "teenspot", nickname: "TeenSpot 에디터", cat: "outfit", question: "흰 티셔츠엔 어떤 바지?", text: "이번 주 등굣길 코디 고민 중", a: { label: "와이드 데님", img: "" }, b: { label: "카고 팬츠", img: "" }, c: { label: "트레이닝 팬츠", img: "" } },
    { id: "q-04", type: "vote", uid: "teenspot", nickname: "TeenSpot 에디터", cat: "etc", question: "시험 기간 공부 장소는?", text: "카페는 시끄러울까요?", a: { label: "집", img: "" }, b: { label: "스터디카페", img: "" }, c: { label: "도서관", img: "" }, d: { label: "카페", img: "" } },
    { id: "q-06", type: "vote", uid: "teenspot", nickname: "TeenSpot 에디터", cat: "food", question: "편의점 디저트 하나만 고르면?", text: "", a: { label: "푸딩", img: "" }, b: { label: "생크림빵", img: "" }, c: { label: "아이스크림", img: "" } }
  ]
};
