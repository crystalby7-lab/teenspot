// 초기 예시 콘텐츠 (서대문구)
// 장소 이름은 일반 명칭, 비용은 1인 예상 금액이에요. 직접 다녀온 뒤 실제 정보로 바꿔주세요.

// 예시 투표용 일러스트 (사진 대신 쓰는 간단한 그림)
(function () {
  const svg = (bg, body) => "data:image/svg+xml;utf8," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400"><rect width="300" height="400" fill="${bg}"/>${body}</svg>`);
  const wide = c => `<rect x="88" y="58" width="124" height="22" rx="4" fill="${c}"/><path d="M88 80h124l26 282h-80l-8-196-8 196H62z" fill="${c}"/><path d="M150 80v86" stroke="rgba(0,0,0,.18)" stroke-width="3"/>`;
  const cargo = c => `<rect x="94" y="58" width="112" height="22" rx="4" fill="${c}"/><path d="M94 80h112l12 282h-60l-8-190-8 190H82z" fill="${c}"/><rect x="72" y="196" width="30" height="44" rx="5" fill="rgba(0,0,0,.14)"/><rect x="198" y="196" width="30" height="44" rx="5" fill="rgba(0,0,0,.14)"/>`;
  const cardi = c => `<path d="M100 66l50 26 50-26 54 40-24 58-16-10v196H86V154l-16 10-24-58z" fill="${c}"/><path d="M150 92v258" stroke="rgba(0,0,0,.16)" stroke-width="3"/><path d="M118 70l32 70 32-70" fill="none" stroke="rgba(0,0,0,.16)" stroke-width="3"/>` + [170, 215, 260, 305].map(y => `<circle cx="160" cy="${y}" r="5" fill="rgba(0,0,0,.25)"/>`).join("");
  const wind = c => `<path d="M104 76c8-34 84-34 92 0l58 36-24 60-16-10v188H86V162l-16 10-24-60z" fill="${c}"/><path d="M150 96v254" stroke="rgba(255,255,255,.5)" stroke-width="4"/><path d="M86 230h128" stroke="rgba(0,0,0,.12)" stroke-width="10"/>`;
  const hood = c => `<path d="M112 92c-6-56 82-56 76 0l66 24-24 60-16-10v184H86V166l-16 10-24-60z" fill="${c}"/><path d="M150 112v238" stroke="rgba(0,0,0,.2)" stroke-width="3"/><rect x="108" y="250" width="84" height="44" rx="10" fill="rgba(0,0,0,.1)"/>`;
  const lip = c => `<path d="M60 300c50-40 130-40 180-10" stroke="${c}" stroke-width="26" stroke-linecap="round" fill="none" opacity=".55"/><rect x="122" y="196" width="56" height="150" rx="6" fill="#2B2F38"/><rect x="118" y="186" width="64" height="18" rx="4" fill="#C9CED6"/><path d="M128 186v-62l44-30v92z" fill="${c}"/>`;
  window.TS_ART = {
    "poll-01": [svg("#E9EEF5", wide("#5A7FB2")), svg("#F1EEE6", cargo("#9C8B6B"))],
    "poll-02": [svg("#F4F1EA", cardi("#E6DDCB")), svg("#ECEDEF", cardi("#4A4E57"))],
    "poll-03": [svg("#EAF0F2", wind("#3F7C8C")), svg("#F0EEF2", hood("#8A8F9A"))],
    "poll-04": [svg("#FBF0EC", lip("#F07A5E")), svg("#F7EEF1", lip("#C2566F"))]
  };
})();

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
    { id: "q-02", cat: "play", question: "이번 주말 신촌에서 뭐 할까?", a: { label: "코인노래방", img: "" }, b: { label: "보드게임 카페", img: "" }, c: { label: "포토부스 + 카페", img: "" } },
    { id: "q-03", cat: "outfit", question: "흰 티셔츠엔 어떤 바지?", a: { label: "와이드 데님", img: window.TS_ART["poll-01"][0] }, b: { label: "카고 팬츠", img: window.TS_ART["poll-01"][1] } },
    { id: "q-04", cat: "etc", question: "시험 기간 공부 장소는?", a: { label: "집", img: "" }, b: { label: "스터디카페", img: "" }, c: { label: "도서관", img: "" }, d: { label: "카페", img: "" } },
    { id: "q-05", cat: "makeup", question: "데일리 립 컬러는?", a: { label: "코랄", img: window.TS_ART["poll-04"][0] }, b: { label: "로즈", img: window.TS_ART["poll-04"][1] } },
    { id: "q-07", cat: "outfit", question: "쌀쌀한 날 겉옷은?", a: { label: "바람막이", img: window.TS_ART["poll-03"][0] }, b: { label: "후드 집업", img: window.TS_ART["poll-03"][1] } },
    { id: "q-08", cat: "hair", question: "앞머리 스타일은?", a: { label: "시스루뱅", img: "" }, b: { label: "앞머리 없이", img: "" } },
    { id: "q-09", cat: "play", question: "친구 생일 파티 장소는?", a: { label: "파티룸", img: "" }, b: { label: "방탈출 카페", img: "" }, c: { label: "노래방", img: "" } },
    { id: "q-10", cat: "hair", question: "가을 머리색은?", a: { label: "흑갈색", img: "" }, b: { label: "애쉬 브라운", img: "" }, c: { label: "자연 갈색", img: "" } },
    { id: "q-11", cat: "makeup", question: "블러셔 위치는?", a: { label: "광대 위", img: "" }, b: { label: "볼 중앙", img: "" } },
    { id: "q-12", cat: "etc", question: "프사 바꿀까?", a: { label: "바꾼다", img: "" }, b: { label: "그대로 둔다", img: "" } },
    { id: "q-13", cat: "outfit", question: "가을 가디건 색은?", a: { label: "아이보리", img: window.TS_ART["poll-02"][0] }, b: { label: "차콜", img: window.TS_ART["poll-02"][1] } }
  ],
  // 공개 프로필 (TeenSpot 에디터 계정)
  publicProfiles: {
    teenspot: { nickname: "TeenSpot 에디터", official: true, avatar: { skin: 1, hairColor: 0, shirt: 0, bg: 0, hair: "bun", eyes: "smile", mouth: "smile", acc: "glasses", cheek: true }, styleTags: ["꾸안꾸", "캐주얼"], playTags: ["사진", "카페"], personalColor: "" }
  },
  // 예시 피드 게시물 (TeenSpot 에디터 계정)
  posts: [
    { id: "q-02", type: "vote", uid: "teenspot", nickname: "TeenSpot 에디터", cat: "play", question: "이번 주말 신촌에서 뭐 할까?", text: "3명이고 예산은 1인 1만5천원", a: { label: "코인노래방", img: "" }, b: { label: "보드게임 카페", img: "" }, c: { label: "포토부스 + 카페", img: "" } },
    { id: "q-03", type: "vote", uid: "teenspot", nickname: "TeenSpot 에디터", cat: "outfit", question: "흰 티셔츠엔 어떤 바지?", text: "이번 주 등굣길 코디 고민 중", a: { label: "와이드 데님", img: window.TS_ART["poll-01"][0] }, b: { label: "카고 팬츠", img: window.TS_ART["poll-01"][1] } },
    { id: "q-05", type: "vote", uid: "teenspot", nickname: "TeenSpot 에디터", cat: "makeup", question: "데일리 립 컬러는?", text: "가을에 쓸 립 하나만 고른다면", a: { label: "코랄", img: window.TS_ART["poll-04"][0] }, b: { label: "로즈", img: window.TS_ART["poll-04"][1] } },
    { id: "q-04", type: "vote", uid: "teenspot", nickname: "TeenSpot 에디터", cat: "etc", question: "시험 기간 공부 장소는?", text: "카페는 시끄러울까요?", a: { label: "집", img: "" }, b: { label: "스터디카페", img: "" }, c: { label: "도서관", img: "" }, d: { label: "카페", img: "" } },
    { id: "q-d1", type: "combo", uid: "teenspot", nickname: "TeenSpot 에디터", store: "delivery", title: "엽떡 + 허니콤보", text: "국룰 조합. 3~4명이 나눠 먹기 좋아요", items: [{ name: "엽기떡볶이 오리지널", price: 14000 }, { name: "허니콤보", price: 23000 }], images: [] },
    { id: "q-d2", type: "combo", uid: "teenspot", nickname: "TeenSpot 에디터", store: "delivery", title: "엽떡 풀세트", text: "중국당면은 꼭 추가, 주먹밥은 남은 국물에 비벼요", items: [{ name: "엽기떡볶이", price: 14000 }, { name: "중국당면 추가", price: 2000 }, { name: "주먹밥", price: 2000 }, { name: "쿨피스", price: 1500 }], images: [] },
    { id: "q-d3", type: "combo", uid: "teenspot", nickname: "TeenSpot 에디터", store: "delivery", title: "마라탕 + 꿔바로우", text: "마라탕은 1단계부터, 꿔바로우는 나눠 먹기", items: [{ name: "마라탕", price: 9000 }, { name: "꿔바로우 소", price: 10000 }], images: [] },
    { id: "q-d4", type: "combo", uid: "teenspot", nickname: "TeenSpot 에디터", store: "delivery", title: "로제떡볶이 + 치즈볼", text: "로제는 덜 매워서 매운 거 못 먹는 친구랑", items: [{ name: "로제떡볶이", price: 15000 }, { name: "치즈볼", price: 4000 }], images: [] },
    { id: "q-c1", type: "combo", uid: "teenspot", nickname: "TeenSpot 에디터", store: "cu", title: "마크정식", text: "떡볶이 위에 치즈 올리고 전자레인지 1분", items: [{ name: "매운 떡볶이 컵", price: 2500 }, { name: "스파게티 컵라면", price: 1500 }, { name: "소시지", price: 1500 }, { name: "스트링치즈", price: 1200 }], images: [] },
    { id: "q-c2", type: "combo", uid: "teenspot", nickname: "TeenSpot 에디터", store: "gs25", title: "치즈 라볶이", text: "라면 사리는 반만 넣어야 안 퍼져요", items: [{ name: "떡볶이 컵", price: 2500 }, { name: "라면 사리", price: 900 }, { name: "슬라이스 치즈", price: 800 }], images: [] },
    { id: "q-c3", type: "combo", uid: "teenspot", nickname: "TeenSpot 에디터", store: "seven", title: "아이스크림 라떼", text: "컵에 아이스크림 먼저 넣고 커피 붓기", items: [{ name: "바닐라 아이스크림", price: 1500 }, { name: "컵커피", price: 2000 }], images: [] },
    { id: "q-c4", type: "combo", uid: "teenspot", nickname: "TeenSpot 에디터", store: "cu", title: "삼김 국밥", text: "컵라면 국물에 삼각김밥 말아서", items: [{ name: "컵라면", price: 1300 }, { name: "참치마요 삼각김밥", price: 1300 }, { name: "구운 계란", price: 1000 }], images: [] },
    { id: "q-c5", type: "combo", uid: "teenspot", nickname: "TeenSpot 에디터", store: "emart24", title: "요거트 볼", text: "바나나는 잘라서 맨 위에", items: [{ name: "플레인 요거트", price: 1500 }, { name: "그래놀라", price: 2000 }, { name: "바나나", price: 1000 }], images: [] },
    { id: "q-c6", type: "combo", uid: "teenspot", nickname: "TeenSpot 에디터", store: "cafe", title: "크로플 + 아이스크림", text: "따뜻할 때 바로 올려야 맛있어요", items: [{ name: "크로플", price: 4000 }, { name: "아이스크림 추가", price: 1500 }], images: [] }
  ]
};
