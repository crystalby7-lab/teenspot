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
    { id: "poll-01", cat: "outfit", question: "흰 티셔츠엔 어떤 바지?", a: { label: "와이드 데님", img: "" }, b: { label: "카고 팬츠", img: "" } },
    { id: "poll-02", cat: "outfit", question: "가을 가디건 색은?", a: { label: "아이보리", img: "" }, b: { label: "차콜", img: "" } },
    { id: "poll-03", cat: "outfit", question: "쌀쌀한 날 겉옷은?", a: { label: "바람막이", img: "" }, b: { label: "후드 집업", img: "" } },
    { id: "poll-04", cat: "makeup", question: "데일리 립 컬러는?", a: { label: "코랄", img: "" }, b: { label: "로즈", img: "" } },
    { id: "poll-05", cat: "makeup", question: "아이라인 모양은?", a: { label: "일자로 짧게", img: "" }, b: { label: "살짝 올려서", img: "" } },
    { id: "poll-06", cat: "makeup", question: "블러셔 위치는?", a: { label: "광대 위", img: "" }, b: { label: "볼 중앙", img: "" } },
    { id: "poll-07", cat: "hair", question: "앞머리 스타일은?", a: { label: "시스루뱅", img: "" }, b: { label: "앞머리 없이", img: "" } },
    { id: "poll-08", cat: "hair", question: "가을 머리색은?", a: { label: "흑갈색", img: "" }, b: { label: "애쉬 브라운", img: "" } },
    { id: "poll-09", cat: "hair", question: "펌을 한다면?", a: { label: "C컬", img: "" }, b: { label: "S컬", img: "" } }
  ]
};
