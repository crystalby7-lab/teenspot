// 일러스트 세트 (64x64, 납작한 스타일) + 글자에서 그림 찾기
(function () {
  const N = "#25324A", W = "#FFFFFF", A = "#F0785A", Y = "#FFC94A";
  const D = {
    // 음식
    ramen: { bg: "#FDECE6", g: `<path d="M12 22h40l-4.5 31a5 5 0 0 1-5 4.3H21.5a5 5 0 0 1-5-4.3z" fill="${A}"/><path d="M15 33h34l-1.2 9H16.2z" fill="${W}"/><path d="M24 37.5h16" stroke="${A}" stroke-width="2.4" stroke-linecap="round"/><path d="M12 22c0-3 2-4 4-4h32c2 0 4 1 4 4z" fill="#F6C24A"/><path d="M19 17c2-3 4 3 6 0s4 3 6 0 4 3 6 0 4 3 6 0" stroke="#E9A92E" stroke-width="2.6" fill="none" stroke-linecap="round"/><path d="M24 11c-1.5-2 1.5-3 0-5M32 11c-1.5-2 1.5-3 0-5M40 11c-1.5-2 1.5-3 0-5" stroke="#C9D0DC" stroke-width="2.2" fill="none" stroke-linecap="round"/>` },
    tteok: { bg: "#FDECE6", g: `<path d="M8 32h48a24 18 0 0 1-48 0z" fill="${N}"/><ellipse cx="32" cy="32" rx="24" ry="7" fill="#E5533D"/><rect x="16" y="24" width="14" height="7" rx="3.5" transform="rotate(-14 23 27)" fill="#FFF3E6"/><rect x="30" y="26" width="14" height="7" rx="3.5" transform="rotate(10 37 29)" fill="#FFF3E6"/><rect x="24" y="20" width="13" height="6.5" rx="3.2" transform="rotate(4 30 23)" fill="#FFE9D6"/><circle cx="44" cy="23" r="3" fill="#FFF3E6"/><path d="M41 23h6" stroke="#E5533D" stroke-width="1.4"/><path d="M20 50h24" stroke="#1A2335" stroke-width="3" stroke-linecap="round"/>` },
    mala: { bg: "#FDECE6", g: `<path d="M8 30h48a24 19 0 0 1-48 0z" fill="${N}"/><ellipse cx="32" cy="30" rx="24" ry="7" fill="#D9402B"/><path d="M18 27c3-4 7-4 9 0" stroke="#6BBF8A" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M37 25l9-3-2 5z" fill="#B3261E"/><circle cx="30" cy="31" r="2.6" fill="#F6C24A"/><circle cx="40" cy="31" r="2.2" fill="#FFE9D6"/><path d="M24 14c-1.5-2 1.5-3 0-5M32 14c-1.5-2 1.5-3 0-5M40 14c-1.5-2 1.5-3 0-5" stroke="#F5A38F" stroke-width="2.2" fill="none" stroke-linecap="round"/>` },
    cheese: { bg: "#FFF6DD", g: `<path d="M8 40l38-20 10 8v16H8z" fill="#FFC94A"/><path d="M8 40h48v8H8z" fill="#F2B233"/><path d="M8 40l38-20 10 8-48 12z" fill="#FFD866"/><circle cx="24" cy="44" r="2.6" fill="#E8A21E"/><circle cx="40" cy="45" r="2" fill="#E8A21E"/><circle cx="34" cy="33" r="2.4" fill="#F2B233"/><circle cx="46" cy="29" r="1.6" fill="#F2B233"/>` },
    onigiri: { bg: "#EEF2F7", g: `<path d="M32 10c3 0 5 2 7 5l13 24c3 6-1 13-8 13H20c-7 0-11-7-8-13l13-24c2-3 4-5 7-5z" fill="${W}"/><path d="M22 38h20v14H22z" fill="#2B2F38"/><path d="M27 41h10" stroke="#3E4452" stroke-width="2" stroke-linecap="round"/><circle cx="28" cy="27" r="1.6" fill="#E3E7EE"/><circle cx="36" cy="24" r="1.4" fill="#E3E7EE"/>` },
    kimbap: { bg: "#EEF6EE", g: `<circle cx="22" cy="34" r="15" fill="#2B2F38"/><circle cx="22" cy="34" r="11.5" fill="${W}"/><circle cx="18" cy="30.5" r="3" fill="${A}"/><circle cx="25.5" cy="30.5" r="2.8" fill="#6BBF8A"/><circle cx="22" cy="38" r="3" fill="${Y}"/><circle cx="44" cy="30" r="13" fill="#2B2F38"/><circle cx="44" cy="30" r="10" fill="${W}"/><circle cx="40.5" cy="27" r="2.7" fill="#6BBF8A"/><circle cx="47.5" cy="27.5" r="2.7" fill="${Y}"/><circle cx="44" cy="33.5" r="2.7" fill="${A}"/>` },
    sausage: { bg: "#FDECE6", g: `<rect x="10" y="24" width="44" height="16" rx="8" transform="rotate(-20 32 32)" fill="#E8746A"/><path d="M19 33l24-9" stroke="#F4A79C" stroke-width="3" stroke-linecap="round"/><path d="M16 46l-6 8" stroke="#C9A27A" stroke-width="3" stroke-linecap="round"/>` },
    icecream: { bg: "#FFF1F3", g: `<path d="M21 30h22L32 58z" fill="#E9B872"/><path d="M24 34l14 10M40 34L27 46M30 34l9 7" stroke="#D49A4E" stroke-width="1.6"/><circle cx="32" cy="23" r="12" fill="#FFF4E0"/><path d="M20 26c2 4 4 0 6 4s4-2 6 2 4-3 6 0 4 1 6-4" fill="#FFF4E0"/><circle cx="25" cy="18" r="6" fill="#F7B8C4"/><circle cx="34" cy="11" r="3" fill="#E5533D"/><path d="M34 8c1-3 3-3 4-4" stroke="#6BBF8A" stroke-width="1.8" fill="none" stroke-linecap="round"/>` },
    coffee: { bg: "#F3EEE8", g: `<path d="M18 22h28l-3.4 32a4 4 0 0 1-4 3.6H25.4a4 4 0 0 1-4-3.6z" fill="#E7EAF0"/><path d="M19.6 33h24.8l-2 21a4 4 0 0 1-4 3.6H25.6a4 4 0 0 1-4-3.6z" fill="#C8A27A"/><path d="M19.6 33h24.8l-.6 6H20.2z" fill="#E6CDAE"/><rect x="15" y="18" width="34" height="6" rx="3" fill="${W}"/><path d="M36 21l6-15" stroke="${N}" stroke-width="3" stroke-linecap="round"/>` },
    boba: { bg: "#F3EEE8", g: `<path d="M18 22h28l-3.4 32a4 4 0 0 1-4 3.6H25.4a4 4 0 0 1-4-3.6z" fill="#E8C9A8"/><circle cx="26" cy="50" r="2.6" fill="#3A2A24"/><circle cx="32" cy="52" r="2.6" fill="#3A2A24"/><circle cx="38" cy="50" r="2.6" fill="#3A2A24"/><circle cx="29" cy="46" r="2.6" fill="#3A2A24"/><circle cx="35" cy="46" r="2.6" fill="#3A2A24"/><rect x="15" y="18" width="34" height="6" rx="3" fill="${W}"/><path d="M34 21l5-16" stroke="${A}" stroke-width="4.5" stroke-linecap="round"/>` },
    yogurt: { bg: "#EEF2F7", g: `<path d="M14 28h36l-4 24a5 5 0 0 1-5 4H23a5 5 0 0 1-5-4z" fill="${W}"/><path d="M16 36h32" stroke="#DCE3EC" stroke-width="2"/><ellipse cx="32" cy="28" rx="18" ry="5" fill="#FAF6EE"/><circle cx="24" cy="26" r="2.4" fill="#C98B4E"/><circle cx="30" cy="24" r="2" fill="#D9A066"/><circle cx="37" cy="26" r="2.4" fill="#C98B4E"/><circle cx="42" cy="24.5" r="2.6" fill="#5B6BB8"/><circle cx="33" cy="28" r="2.2" fill="#B3261E"/>` },
    banana: { bg: "#FFF6DD", g: `<path d="M14 22c2 18 16 28 36 24 3-.6 3 3 0 4-22 7-38-6-40-26 0-3 4-4 4-2z" fill="#FFD54A"/><path d="M18 26c4 12 14 18 28 18" stroke="#F2B233" stroke-width="2.4" fill="none" stroke-linecap="round"/><path d="M10 22l2-6 4 2-2 5z" fill="#7A5A2E"/>` },
    croffle: { bg: "#FFF1E3", g: `<rect x="10" y="26" width="44" height="26" rx="8" fill="#E7A955"/><path d="M21 26v26M32 26v26M43 26v26M10 35h44M10 43h44" stroke="#C98B3A" stroke-width="2"/><circle cx="32" cy="22" r="9" fill="#FFE2B8"/><path d="M23 24c2 3 4 0 6 3s4-1 6 1 4-2 6 0" fill="#FFE2B8"/><circle cx="35" cy="14" r="2.6" fill="#E5533D"/>` },
    egg: { bg: "#FFF1E3", g: `<ellipse cx="26" cy="36" rx="11" ry="14" fill="#D9A066"/><ellipse cx="22" cy="31" rx="3" ry="4" fill="#E8BA88"/><ellipse cx="42" cy="38" rx="10" ry="12.5" fill="#C98B4E"/><ellipse cx="39" cy="34" rx="2.6" ry="3.4" fill="#DDA36C"/>` },
    pudding: { bg: "#FFF6DD", g: `<ellipse cx="32" cy="50" rx="22" ry="5" fill="${W}"/><path d="M18 48l4-24h20l4 24z" fill="#FFD27A"/><path d="M22 24h20l1.2 7c-4 3-7-1-11 2s-7-1-11 0z" fill="#9C5B2E"/><circle cx="36" cy="18" r="3.4" fill="#E5533D"/>` },
    bread: { bg: "#FFF1E3", g: `<path d="M10 40c0-12 10-20 22-20s22 8 22 20v4a4 4 0 0 1-4 4H14a4 4 0 0 1-4-4z" fill="#E3A15C"/><path d="M16 36c0-8 7-12 16-12s16 4 16 12" stroke="#F2C48D" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M14 40h36" stroke="#FFF8EE" stroke-width="5" stroke-linecap="round"/>` },
    pizza: { bg: "#FFF1E3", g: `<path d="M12 14l40 6-26 34z" fill="#FFCF5A"/><path d="M12 14l40 6" stroke="#E39B4A" stroke-width="6" stroke-linecap="round"/><circle cx="26" cy="26" r="4" fill="#E5533D"/><circle cx="38" cy="27" r="3.4" fill="#E5533D"/><circle cx="29" cy="38" r="3.4" fill="#E5533D"/>` },
    sushi: { bg: "#FDECE6", g: `<rect x="12" y="32" width="40" height="14" rx="6" fill="${W}"/><path d="M10 30c0-6 6-8 22-8s22 2 22 8c0 3-3 4-22 4s-22-1-22-4z" fill="#F48C6B"/><path d="M20 24l4 9M30 23l3 10M40 24l2 9" stroke="#FFC4B0" stroke-width="2.2" stroke-linecap="round"/>` },
    cutlet: { bg: "#FFF1E3", g: `<ellipse cx="32" cy="48" rx="24" ry="6" fill="${W}"/><rect x="12" y="22" width="40" height="22" rx="10" fill="#D98E3A"/><path d="M18 28h28M18 34h28M18 40h28" stroke="#C47A2C" stroke-width="2" stroke-dasharray="3 3"/><path d="M14 30c8-3 26-3 36 0" stroke="#6E3A1E" stroke-width="4" fill="none" stroke-linecap="round"/>` },
    corn: { bg: "#FFF6DD", g: `<ellipse cx="32" cy="30" rx="10" ry="20" fill="#FFD54A"/><path d="M24 22h16M23 30h18M24 38h16M28 12v36M36 12v36" stroke="#F2B233" stroke-width="1.8"/><path d="M22 34c-6 8-6 16 4 20l6-14z" fill="#6BBF8A"/><path d="M42 34c6 8 6 16-4 20l-6-14z" fill="#58A877"/>` },
    // 장소·활동
    mic: { bg: "#EEF0FA", g: `<circle cx="38" cy="22" r="11" fill="${N}"/><path d="M31 18h14M30 23h16M32 28h12" stroke="#4A5A78" stroke-width="1.6"/><path d="M30 28l-16 20a3.5 3.5 0 0 0 5 5l20-16z" fill="${A}"/><path d="M14 54c-3 3-6 2-6 6" stroke="${N}" stroke-width="2" fill="none" stroke-linecap="round"/>` },
    dice: { bg: "#EEF0FA", g: `<rect x="8" y="22" width="26" height="26" rx="6" fill="${W}"/><circle cx="15" cy="29" r="2.4" fill="${N}"/><circle cx="21" cy="35" r="2.4" fill="${N}"/><circle cx="27" cy="41" r="2.4" fill="${N}"/><rect x="32" y="14" width="24" height="24" rx="6" transform="rotate(14 44 26)" fill="${A}"/><circle cx="40" cy="22" r="2.2" fill="${W}"/><circle cx="48" cy="24" r="2.2" fill="${W}"/><circle cx="39" cy="30" r="2.2" fill="${W}"/><circle cx="47" cy="32" r="2.2" fill="${W}"/>` },
    camera: { bg: "#EEF2F7", g: `<rect x="8" y="20" width="48" height="32" rx="8" fill="${N}"/><path d="M22 20l3-6h14l3 6z" fill="${N}"/><circle cx="32" cy="36" r="10" fill="#4A5A78"/><circle cx="32" cy="36" r="6" fill="#9FB3D1"/><circle cx="30" cy="34" r="2" fill="${W}"/><rect x="44" y="25" width="6" height="4" rx="2" fill="${Y}"/>` },
    book: { bg: "#EEF6EE", g: `<path d="M8 18c8-2 16-1 24 4v32c-8-5-16-6-24-4z" fill="${W}"/><path d="M56 18c-8-2-16-1-24 4v32c8-5 16-6 24-4z" fill="#F4F6FA"/><path d="M32 22v32" stroke="${N}" stroke-width="2.4"/><path d="M14 28c4-1 8-.5 12 1M14 34c4-1 8-.5 12 1M38 29c4-1.5 8-2 12-1M38 35c4-1.5 8-2 12-1" stroke="#C9D0DC" stroke-width="2" stroke-linecap="round"/><path d="M44 14v12l3-2 3 2V14z" fill="${A}"/>` },
    house: { bg: "#EEF2F7", g: `<path d="M12 30L32 14l20 16" fill="${A}"/><path d="M8 32L32 12l24 20" stroke="${A}" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M16 30h32v22H16z" fill="${W}"/><rect x="28" y="38" width="9" height="14" rx="2" fill="${N}"/><rect x="19" y="35" width="6" height="6" rx="1.5" fill="#9FB3D1"/><rect x="40" y="35" width="6" height="6" rx="1.5" fill="#9FB3D1"/>` },
    balloon: { bg: "#FFF1F3", g: `<ellipse cx="24" cy="24" rx="11" ry="13" fill="${A}"/><ellipse cx="40" cy="22" rx="10" ry="12" fill="${Y}"/><path d="M24 37c-2 6 4 10 2 20M40 34c2 6-4 12 0 22" stroke="#9AA5B8" stroke-width="1.6" fill="none"/><path d="M22 37h4l-2 3zM38 34h4l-2 3z" fill="#9AA5B8"/><ellipse cx="20" cy="19" rx="2.5" ry="4" fill="#F7A891"/>` },
    key: { bg: "#FFF6DD", g: `<circle cx="22" cy="32" r="12" fill="${Y}"/><circle cx="22" cy="32" r="5" fill="#FFF6DD"/><path d="M32 30h22v6h-4v6h-6v-6h-4v-0h-8z" fill="${Y}"/>` },
    tree: { bg: "#EEF6EE", g: `<rect x="29" y="34" width="6" height="20" rx="3" fill="#B98552"/><circle cx="32" cy="26" r="15" fill="#6BBF8A"/><circle cx="22" cy="32" r="9" fill="#58A877"/><circle cx="42" cy="32" r="9" fill="#58A877"/><path d="M12 54h40" stroke="#9BD3AE" stroke-width="4" stroke-linecap="round"/>` },
    bag: { bg: "#FDECE6", g: `<path d="M14 24h36l-3 30H17z" fill="${A}"/><path d="M24 26v-6a8 8 0 0 1 16 0v6" stroke="${N}" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M14 24h36l-1 6H15z" fill="#E8634A"/>` },
    ticket: { bg: "#EEF0FA", g: `<path d="M10 22h44v7a4 4 0 0 0 0 8v7H10v-7a4 4 0 0 0 0-8z" transform="rotate(-10 32 33)" fill="${A}"/><path d="M38 20l3 26" stroke="#FFD2C5" stroke-width="2" stroke-dasharray="3 3"/><path d="M18 32l12-2M19 38l8-1.4" stroke="${W}" stroke-width="3" stroke-linecap="round"/>` },
    store: { bg: "#EEF2F7", g: `<rect x="12" y="28" width="40" height="26" rx="3" fill="${W}"/><path d="M10 18h44l2 10H8z" fill="${A}"/><path d="M19 18l-2 10M29 18l-1 10M37 18l1 10M45 18l2 10" stroke="${W}" stroke-width="3"/><rect x="28" y="38" width="10" height="16" fill="${N}"/><rect x="16" y="36" width="8" height="8" rx="1.5" fill="#9FB3D1"/>` },
    // 스타일
    shirt: { bg: "#EAF0F8", g: `<path d="M22 12l10 5 10-5 14 9-6 11-6-3v27H20V29l-6 3-6-11z" fill="${W}"/><path d="M26 12.5c1 4 3 6 6 6s5-2 6-6" stroke="#D3D9E3" stroke-width="2" fill="none"/>` },
    pants: { bg: "#EAF0F8", g: `<rect x="18" y="10" width="28" height="6" rx="1.5" fill="#4E73A8"/><path d="M18 16h28l4 40H36l-4-28-4 28H14z" fill="#5A7FB2"/><path d="M32 16v12" stroke="#4467A0" stroke-width="2"/>` },
    jacket: { bg: "#EEF0F3", g: `<path d="M24 14c0-6 16-6 16 0l14 6-5 14-5-2v24H20V32l-5 2-5-14z" fill="#8A8F9A"/><path d="M26 16c2 6 10 6 12 0" fill="#767B86"/><path d="M32 20v36" stroke="#C9CCD3" stroke-width="2"/><rect x="24" y="40" width="16" height="7" rx="2" fill="#767B86"/>` },
    lipstick: { bg: "#FDECE6", g: `<rect x="24" y="32" width="16" height="24" rx="2.5" fill="#2B2F38"/><rect x="23" y="28" width="18" height="6" rx="1.5" fill="#C9CED6"/><path d="M26 28V16l12-7v19z" fill="${A}"/>` },
    blush: { bg: "#FFF1F3", g: `<circle cx="28" cy="36" r="16" fill="#2B2F38"/><circle cx="28" cy="36" r="12" fill="#F7A8B8"/><circle cx="24" cy="32" r="3" fill="#FAC3CE"/><path d="M42 26l10-14" stroke="#C9A27A" stroke-width="4" stroke-linecap="round"/><ellipse cx="40" cy="28" rx="4" ry="6" transform="rotate(35 40 28)" fill="#E8D6C2"/>` },
    liner: { bg: "#EEF0F3", g: `<rect x="10" y="28" width="40" height="8" rx="3" transform="rotate(-30 30 32)" fill="#2B2F38"/><path d="M45 18l8-5-3 9z" fill="#1A1D24"/><rect x="12" y="38" width="8" height="8" rx="2" transform="rotate(-30 16 42)" fill="#C9CED6"/>` },
    comb: { bg: "#F3EEE8", g: `<rect x="10" y="20" width="44" height="10" rx="4" fill="${N}"/><path d="M15 30v16M20 30v18M25 30v18M30 30v18M35 30v18M40 30v18M45 30v18M50 30v16" stroke="${N}" stroke-width="2.6" stroke-linecap="round"/>` },
    phone: { bg: "#EEF0FA", g: `<rect x="18" y="8" width="28" height="48" rx="7" fill="${N}"/><rect x="21" y="13" width="22" height="36" rx="3" fill="#9FB3D1"/><circle cx="32" cy="27" r="6" fill="${W}"/><path d="M24 44c2-6 14-6 16 0" fill="${W}"/>` },
    sparkle: { bg: "#FFF6DD", g: `<path d="M30 8c2 12 6 16 18 18-12 2-16 6-18 18-2-12-6-16-18-18 12-2 16-6 18-18z" fill="${Y}"/><path d="M48 38c1 6 3 8 8 9-5 1-7 3-8 9-1-6-3-8-8-9 5-1 7-3 8-9z" fill="${A}"/>` }
  };
  // 글자에서 그림 찾기 (앞에 있을수록 먼저)
  const MATCH = [
    ["jacket", ["바람막이", "후드", "집업", "가디건", "겉옷", "자켓", "재킷", "니트"]],
    ["pants", ["바지", "데님", "팬츠", "슬랙스", "청바지"]],
    ["mala", ["마라"]],
    ["dice", ["보드게임"]],
    ["key", ["방탈출"]],
    ["book", ["도서관", "공부", "스터디"]],
    ["camera", ["포토", "사진"]],
    ["mic", ["노래"]],
    ["balloon", ["파티", "생일"]],
    ["tree", ["산책", "공원", "피크닉", "자락길", "폭포", "홍제천"]],
    ["bag", ["쇼핑", "소품", "빈티지", "액세서리", "생활용품"]],
    ["tteok", ["떡볶이", "떡"]],
    ["onigiri", ["삼각김밥", "삼김"]],
    ["kimbap", ["김밥"]],
    ["ramen", ["라면", "사리", "스파게티"]],
    ["cheese", ["치즈"]],
    ["sausage", ["소시지", "핫바"]],
    ["icecream", ["아이스크림"]],
    ["croffle", ["크로플", "와플"]],
    ["yogurt", ["요거트", "그래놀라"]],
    ["banana", ["바나나"]],
    ["egg", ["계란", "달걀"]],
    ["pudding", ["푸딩"]],
    ["cutlet", ["돈까스", "돈가스"]],
    ["pizza", ["피자"]],
    ["sushi", ["초밥"]],
    ["corn", ["콘"]],
    ["bread", ["빵", "베이커리"]],
    ["coffee", ["커피", "라떼", "아메리카노", "아아", "카페"]],
    ["boba", ["버블티", "음료", "디저트"]],
    ["house", ["집"]],
    ["shirt", ["티셔츠", "셔츠", "옷", "코디"]],
    ["lipstick", ["립", "코랄", "로즈", "베이지"]],
    ["blush", ["블러셔"]],
    ["liner", ["아이라인"]],
    ["comb", ["앞머리", "뱅", "머리", "펌", "컬", "브라운", "흑갈", "갈색"]],
    ["phone", ["프사"]],
    ["store", ["편의점"]]
  ];
  const CAT = { outfit: "shirt", makeup: "lipstick", hair: "comb", food: "ramen", play: "ticket", etc: "sparkle" };
  function match(text) {
    const t = String(text || "");
    for (const [k, ws] of MATCH) if (ws.some(w => t.includes(w))) return k;
    return null;
  }
  // 그림 (배경 포함): cls로 크기 조절
  function icon(name, cls, plain) {
    const d = D[name]; if (!d) return "";
    return `<span class="art ${cls || ""}" style="--art-bg:${plain ? "transparent" : d.bg}"><svg viewBox="0 0 64 64" aria-hidden="true">${d.g}</svg></span>`;
  }
  const iconFor = (text, cls, plain) => { const k = match(text); return k ? icon(k, cls, plain) : ""; };
  window.TSArt = { icon, iconFor, match, CAT, has: n => !!D[n], names: Object.keys(D) };
})();
