// 아바타 캐릭터: 부위별 옵션을 골라 SVG로 그려요
// ITEMS에 가격(포인트)이 있어요. 0이면 기본 무료, EVENT는 기간 한정
(function () {
  const O = {
    skin: ["#FBE3D2", "#F6D2B6", "#E9B992", "#C98E66", "#8D5B3E"],
    hairColor: ["#2B2B33", "#4A3328", "#7A5236", "#8E8B87", "#E2C27C", "#E59BB0", "#6E8FD6", "#9B7FD1"],
    shirt: ["#1E2A3E", "#F2F2F2", "#EE7E62", "#7FB49A", "#9AA9E6", "#F2C94C", "#C9A27E", "#E59BB0"],
    bg: ["#E8ECF3", "#FDEEE9", "#E6F4EE", "#EFEAF8", "#FFF4DB", "#E3F1F8", "#1E2A3E", "#FCE4EC"],
    hair: ["short", "bangs", "long", "pony", "buzz", "bun", "curly", "wave", "hime", "twoblock", "pigtails", "halfup"],
    brows: ["none", "straight", "arched", "thick"],
    eyes: ["dot", "smile", "round", "wink", "sleepy", "star"],
    lashes: [false, true],
    mouth: ["smile", "open", "flat", "cat", "tongue"],
    cheek: [true, false],
    mark: ["none", "freckles", "mole"],
    top: ["tee", "hoodie", "collar", "knit", "overall", "jersey"],
    acc: ["none", "glasses", "cap", "ribbon", "sunglasses", "headphones", "beanie", "bucket", "hairpin", "earrings", "mask", "flower", "maple"],
    pattern: ["none", "check", "stripes", "stars", "hearts"],
    frame: ["none", "ring", "dashed", "double", "sparkle"]
  };
  const LABELS = {
    hair: { short: "숏컷", bangs: "단발 앞머리", long: "긴 머리", pony: "포니테일", buzz: "짧은 머리", bun: "똥머리", curly: "곱슬", wave: "웨이브", hime: "히메컷", twoblock: "투블럭", pigtails: "양갈래", halfup: "반묶음" },
    brows: { none: "없음", straight: "일자 눈썹", arched: "둥근 눈썹", thick: "진한 눈썹" },
    eyes: { dot: "기본", smile: "웃는 눈", round: "동그란 눈", wink: "윙크", sleepy: "졸린 눈", star: "반짝 눈" },
    lashes: { false: "없음", true: "속눈썹" },
    mouth: { smile: "미소", open: "활짝", flat: "무표정", cat: "고양이 입", tongue: "메롱" },
    cheek: { true: "볼터치", false: "없음" },
    mark: { none: "없음", freckles: "주근깨", mole: "점" },
    top: { tee: "티셔츠", hoodie: "후드", collar: "셔츠 카라", knit: "니트", overall: "멜빵", jersey: "저지" },
    acc: { none: "없음", glasses: "안경", cap: "모자", ribbon: "리본", sunglasses: "선글라스", headphones: "헤드폰", beanie: "비니", bucket: "버킷햇", hairpin: "머리핀", earrings: "귀걸이", mask: "마스크", flower: "꽃", maple: "단풍잎" },
    pattern: { none: "단색", check: "체크", stripes: "줄무늬", stars: "별", hearts: "하트" },
    frame: { none: "없음", ring: "네이비 테두리", dashed: "점선 테두리", double: "이중 테두리", sparkle: "반짝 테두리" }
  };
  // 가격표 (포인트). 없는 항목은 무료
  const ITEMS = {
    hair: { curly: 40, bun: 40, wave: 80, hime: 80, twoblock: 60, pigtails: 100, halfup: 80 },
    brows: { arched: 20, thick: 20 },
    eyes: { star: 60 },
    lashes: { true: 30 },
    mouth: { tongue: 40 },
    mark: { freckles: 30, mole: 20 },
    top: { hoodie: 60, collar: 50, knit: 60, overall: 90, jersey: 70 },
    acc: { sunglasses: 50, headphones: 70, beanie: 60, bucket: 80, hairpin: 30, earrings: 40, mask: 30, flower: 50, maple: 0 },
    pattern: { check: 40, stripes: 40, stars: 60, hearts: 60 },
    frame: { ring: 50, dashed: 50, double: 80, sparkle: 120 },
    hairColor: { 5: 40, 6: 40, 7: 40 },
    shirt: { 6: 20, 7: 20 },
    bg: { 6: 30, 7: 30 }
  };
  const EVENT = { "acc:maple": { label: "가을 한정", from: "2026-10-01", to: "2026-11-30" } };
  // 닉네임 옆 배지
  const BADGES = [
    { id: "", label: "없음", price: 0 },
    { id: "explorer", label: "코스 탐험가", price: 60 },
    { id: "voter", label: "투표왕", price: 60 },
    { id: "photo", label: "사진 장인", price: 80 },
    { id: "foodie", label: "꿀조합 연구원", price: 80 },
    { id: "autumn", label: "가을 산책러", price: 0, event: { label: "가을 한정", from: "2026-10-01", to: "2026-11-30" } }
  ];
  const DEFAULT = { skin: 1, hairColor: 0, shirt: 0, bg: 0, hair: "bangs", brows: "none", eyes: "dot", lashes: false, mouth: "smile", cheek: true, mark: "none", top: "tee", acc: "none", pattern: "none", frame: "none" };
  const COLOR_KEYS = ["skin", "hairColor", "shirt", "bg"];
  const BOOL_KEYS = ["lashes", "cheek"];

  const itemKey = (k, v) => k + ":" + v;
  const priceOf = (k, v) => ((ITEMS[k] || {})[v] || 0);
  const today = () => new Date().toISOString().slice(0, 10);
  function eventOf(k, v) { return EVENT[itemKey(k, v)] || null; }
  function eventActive(ev) { if (!ev) return true; const d = today(); return d >= ev.from && d <= ev.to; }
  // 이벤트 아이템은 기간 안에만 보이고(가지고 있으면 계속 보임), 기간 안에는 무료로 받기
  function isVisible(k, v, owned) { const ev = eventOf(k, v); return !ev || eventActive(ev) || owned.has(itemKey(k, v)); }
  function isOwned(k, v, owned) { return priceOf(k, v) === 0 && !eventOf(k, v) ? true : owned.has(itemKey(k, v)); }

  function norm(c) {
    c = Object.assign({}, DEFAULT, c || {});
    COLOR_KEYS.forEach(k => { c[k] = Math.max(0, Math.min(O[k].length - 1, Number(c[k]) || 0)); });
    Object.keys(O).forEach(k => { if (COLOR_KEYS.includes(k) || BOOL_KEYS.includes(k)) return; if (O[k].indexOf(c[k]) < 0) c[k] = DEFAULT[k]; });
    BOOL_KEYS.forEach(k => { c[k] = c[k] === true || c[k] === "true" ? true : c[k] === false || c[k] === "false" ? false : DEFAULT[k]; });
    return c;
  }

  /* ---------- 그리기 ---------- */
  function background(c) {
    const col = O.bg[c.bg], dark = c.bg === 6, ink = dark ? "rgba(255,255,255,.14)" : "rgba(30,42,62,.08)";
    let p = "";
    if (c.pattern === "check") p = [20, 40, 60, 80, 100].map(v => `<path d="M${v} 0v120M0 ${v}h120" stroke="${ink}" stroke-width="5"/>`).join("");
    if (c.pattern === "stripes") p = [-60, -30, 0, 30, 60, 90].map(v => `<path d="M${v} 120l60-120" stroke="${ink}" stroke-width="8"/>`).join("");
    if (c.pattern === "stars") p = [[18, 20], [96, 16], [104, 64], [14, 70], [92, 104], [30, 104]].map(([x, y]) => `<path transform="translate(${x} ${y})" d="M0-6l1.8 4.2 4.2 1.8-4.2 1.8L0 6l-1.8-4.2L-6 0l4.2-1.8z" fill="${dark ? "rgba(255,255,255,.35)" : "rgba(30,42,62,.16)"}"/>`).join("");
    if (c.pattern === "hearts") p = [[18, 22], [100, 18], [106, 66], [12, 72], [94, 104], [26, 104]].map(([x, y]) => `<path transform="translate(${x} ${y}) scale(.5)" d="M0 4c-2-5-10-5-10 1 0 5 6 8 10 11 4-3 10-6 10-11 0-6-8-6-10-1z" fill="${dark ? "rgba(255,180,200,.5)" : "rgba(238,126,98,.28)"}"/>`).join("");
    return `<rect width="120" height="120" fill="${col}"/>${p}`;
  }
  function hairBack(s, h) {
    switch (s) {
      case "long": case "hime": return `<path d="M28 58C28 28 44 19 60 19s32 9 32 39l3 50H25z" fill="${h}"/>`;
      case "wave": return `<path d="M28 58C28 28 44 19 60 19s32 9 32 39c4 9-3 15 1 23s-2 15 2 24H25c4-9-2-16 2-24s-3-14 1-22z" fill="${h}"/>`;
      case "bangs": return `<path d="M30 56C30 30 44 21 60 21s30 9 30 35v24c-5 2-9 0-10-4H40c-1 4-5 6-10 4z" fill="${h}"/>`;
      case "pony": return `<path d="M80 30c18 2 22 32 12 50-3-16-7-28-15-36z" fill="${h}"/>`;
      case "bun": return `<circle cx="60" cy="20" r="11" fill="${h}"/>`;
      case "halfup": return `<path d="M30 58C30 30 44 21 60 21s30 9 30 37l2 40H28z" fill="${h}"/><circle cx="60" cy="22" r="8" fill="${h}"/>`;
      case "pigtails": return `<ellipse cx="25" cy="66" rx="9" ry="15" transform="rotate(14 25 66)" fill="${h}"/><ellipse cx="95" cy="66" rx="9" ry="15" transform="rotate(-14 95 66)" fill="${h}"/><circle cx="31" cy="52" r="3.4" fill="#EE7E62"/><circle cx="89" cy="52" r="3.4" fill="#EE7E62"/>`;
    }
    return "";
  }
  function hairFront(s, h) {
    switch (s) {
      case "short": return `<path d="M31 55c0-24 14-31 29-31 16 0 29 8 29 31-6-10-16-17-29-17-12 0-23 6-29 17z" fill="${h}"/>`;
      case "bangs": case "pigtails": return `<path d="M32 51c0-18 13-25 28-25s28 7 28 25z" fill="${h}"/>`;
      case "long": case "halfup": case "wave": return `<path d="M32 53c2-20 16-27 30-27 16 0 26 10 26 27-10-6-18-14-24-21-6 10-19 17-32 21z" fill="${h}"/>`;
      case "hime": return `<path d="M32 49c0-17 13-24 28-24s28 7 28 24z" fill="${h}"/><rect x="29" y="44" width="9" height="34" rx="2" fill="${h}"/><rect x="82" y="44" width="9" height="34" rx="2" fill="${h}"/>`;
      case "pony": case "bun": return `<path d="M32 52c0-20 13-27 28-27s28 7 28 27c-8-7-17-11-28-11s-20 4-28 11z" fill="${h}"/>`;
      case "curly": return [[35, 50, 9], [40, 38, 10], [50, 30, 10], [62, 27, 10], [74, 30, 10], [83, 39, 10], [86, 51, 9]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${h}"/>`).join("");
      case "buzz": return `<path d="M33 50c1-17 13-23 27-23s26 6 27 23c-8-7-17-10-27-10s-19 3-27 10z" fill="${h}"/>`;
      case "twoblock": return `<path d="M33 54c0-6 1-10 2-13 3 5 4 9 4 13zM87 54c0-6-1-10-2-13-3 5-4 9-4 13z" fill="${h}" opacity=".35"/><path d="M36 47c0-16 11-24 25-24 15 0 24 8 24 24-7-9-14-12-25-12-10 0-17 4-24 12z" fill="${h}"/>`;
    }
    return "";
  }
  function brows(s, h) {
    switch (s) {
      case "straight": return `<path d="M44 48h11M65 48h11" stroke="${h}" stroke-width="2.6" stroke-linecap="round"/>`;
      case "arched": return `<path d="M44 49q5.5-4 11 0M65 49q5.5-4 11 0" stroke="${h}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`;
      case "thick": return `<path d="M44 48h11M65 48h11" stroke="${h}" stroke-width="4.2" stroke-linecap="round"/>`;
    }
    return "";
  }
  function eyes(s) {
    const ink = "#2B2F38";
    switch (s) {
      case "smile": return `<path d="M45 59q5-5 10 0M65 59q5-5 10 0" stroke="${ink}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`;
      case "round": return `<circle cx="50" cy="58" r="5" fill="#fff"/><circle cx="70" cy="58" r="5" fill="#fff"/><circle cx="51" cy="59" r="2.8" fill="${ink}"/><circle cx="71" cy="59" r="2.8" fill="${ink}"/>`;
      case "wink": return `<circle cx="50" cy="58" r="3" fill="${ink}"/><path d="M65 59q5-5 10 0" stroke="${ink}" stroke-width="2.6" fill="none" stroke-linecap="round"/>`;
      case "sleepy": return `<path d="M45 59h10M65 59h10" stroke="${ink}" stroke-width="2.6" stroke-linecap="round"/>`;
      case "star": return [50, 70].map(x => `<ellipse cx="${x}" cy="58" rx="3.6" ry="4.3" fill="${ink}"/><path transform="translate(${x + 1.2} ${56.6})" d="M0-2l.6 1.4L2 0l-1.4.6L0 2l-.6-1.4L-2 0l1.4-.6z" fill="#fff"/>`).join("");
    }
    return `<circle cx="50" cy="58" r="3" fill="${ink}"/><circle cx="70" cy="58" r="3" fill="${ink}"/>`;
  }
  function lashes(on) { return on ? `<path d="M45 55l-3-2M45.5 57l-3.4-.4M75 55l3-2M74.5 57l3.4-.4" stroke="#2B2F38" stroke-width="1.8" stroke-linecap="round"/>` : ""; }
  function mouth(s) {
    const ink = "#2B2F38";
    switch (s) {
      case "open": return `<path d="M54 67h12q0 8-6 8t-6-8z" fill="${ink}"/><path d="M57 72q3 2 6 0" stroke="#E97A7A" stroke-width="2" fill="none"/>`;
      case "flat": return `<path d="M55 69h10" stroke="${ink}" stroke-width="2.4" stroke-linecap="round"/>`;
      case "cat": return `<path d="M53 67q3.5 4 7 0q3.5 4 7 0" stroke="${ink}" stroke-width="2.2" fill="none" stroke-linecap="round"/>`;
      case "tongue": return `<path d="M54 67q6 6 12 0" stroke="${ink}" stroke-width="2.4" fill="none" stroke-linecap="round"/><path d="M58 70.5h5v2.5q0 3-2.5 3t-2.5-3z" fill="#F07A86"/>`;
    }
    return `<path d="M54 67q6 6 12 0" stroke="${ink}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;
  }
  function marks(s) {
    if (s === "freckles") return [[41, 64], [44, 67], [38, 67], [79, 64], [76, 67], [82, 67]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.1" fill="#B07A55"/>`).join("");
    if (s === "mole") return `<circle cx="76" cy="66" r="1.4" fill="#5A4034"/>`;
    return "";
  }
  function top(t, col, skin) {
    const base = `<path d="M22 122c0-26 17-36 38-36s38 10 38 36z" fill="${col}"/>`;
    const neck = `<rect x="54" y="78" width="12" height="12" rx="4" fill="${skin}"/>`;
    switch (t) {
      case "hoodie": return `<path d="M40 92c4-10 12-12 20-12s16 2 20 12" fill="none" stroke="${col}" stroke-width="10" stroke-linecap="round"/>${base}${neck}<path d="M44 90c3 6 9 9 16 9s13-3 16-9" fill="none" stroke="rgba(0,0,0,.18)" stroke-width="3"/><path d="M54 98v10M66 98v10" stroke="rgba(255,255,255,.75)" stroke-width="2.2" stroke-linecap="round"/>`;
      case "collar": return `${base}${neck}<path d="M60 92l-12-6-3 10zM60 92l12-6 3 10z" fill="#fff" stroke="rgba(0,0,0,.12)" stroke-width="1.2" stroke-linejoin="round"/><path d="M60 96v24" stroke="rgba(0,0,0,.14)" stroke-width="1.6"/>`;
      case "knit": return `${base}${neck}<path d="M47 89q13 8 26 0" fill="none" stroke="rgba(0,0,0,.18)" stroke-width="5"/>` + [100, 108, 116].map(y => `<path d="M26 ${y}h68" stroke="rgba(255,255,255,.22)" stroke-width="2.4"/>`).join("");
      case "overall": return `<path d="M22 122c0-26 17-36 38-36s38 10 38 36z" fill="#F4F4F2"/>${neck}<path d="M42 102h36v20H42z" fill="${col}"/><path d="M44 102l-4-14M76 102l4-14" stroke="${col}" stroke-width="5" stroke-linecap="round"/><circle cx="46" cy="104" r="2" fill="#F2C94C"/><circle cx="74" cy="104" r="2" fill="#F2C94C"/>`;
      case "jersey": return `${base}${neck}<path d="M50 88l10 12 10-12" fill="none" stroke="#fff" stroke-width="3" stroke-linejoin="round"/><path d="M26 108c4-8 9-12 16-14M94 108c-4-8-9-12-16-14" stroke="#fff" stroke-width="3" fill="none" opacity=".8"/>`;
    }
    return `${base}${neck}<path d="M50 88q10 7 20 0" fill="none" stroke="rgba(0,0,0,.14)" stroke-width="2.4"/>`;
  }
  function acc(s) {
    switch (s) {
      case "glasses": return `<g fill="none" stroke="#2B2F38" stroke-width="2"><circle cx="50" cy="58" r="7"/><circle cx="70" cy="58" r="7"/><path d="M57 58h6"/></g>`;
      case "sunglasses": return `<path d="M41 54h17v6q0 7-8.5 7T41 60zM62 54h17v6q0 7-8.5 7T62 60z" fill="#2B2F38"/><path d="M58 56h4" stroke="#2B2F38" stroke-width="2.4"/>`;
      case "cap": return `<path d="M31 46c0-18 13-25 29-25s29 7 29 25z" fill="#EE7E62"/><path d="M60 46h36q-2 6-12 6H60z" fill="#D86A50"/><circle cx="60" cy="22" r="2.5" fill="#D86A50"/>`;
      case "headphones": return `<path d="M30 58c0-24 14-36 30-36s30 12 30 36" stroke="#2B2F38" stroke-width="4" fill="none"/><rect x="24" y="52" width="10" height="16" rx="5" fill="#2B2F38"/><rect x="86" y="52" width="10" height="16" rx="5" fill="#2B2F38"/>`;
      case "ribbon": return `<path d="M72 30l12-7v14zM72 30l-1 12 12-5z" fill="#EE7E62"/><circle cx="73" cy="31" r="3" fill="#D86A50"/>`;
      case "beanie": return `<path d="M30 48c0-20 13-29 30-29s30 9 30 29z" fill="#9AA9E6"/><rect x="28" y="42" width="64" height="10" rx="5" fill="#8496DE"/>` + [36, 44, 52, 60, 68, 76, 84].map(x => `<path d="M${x} 44v6" stroke="rgba(255,255,255,.45)" stroke-width="2" stroke-linecap="round"/>`).join("") + `<circle cx="60" cy="16" r="6" fill="#B9C4EF"/>`;
      case "bucket": return `<path d="M36 40c2-14 11-20 24-20s22 6 24 20z" fill="#C9A27E"/><path d="M24 46q36-14 72 0l-4 6q-32-10-64 0z" fill="#B48C68"/>`;
      case "hairpin": return `<path d="M74 34l10-5M76 39l10-5" stroke="#F2C94C" stroke-width="3" stroke-linecap="round"/>`;
      case "earrings": return `<circle cx="32" cy="70" r="2.6" fill="#E2C27C"/><circle cx="88" cy="70" r="2.6" fill="#E2C27C"/>`;
      case "mask": return `<path d="M32 62l12 4M88 62l-12 4" stroke="#DADDE3" stroke-width="1.6"/><rect x="43" y="61" width="34" height="18" rx="8" fill="#F7F8FA" stroke="#DADDE3" stroke-width="1.4"/><path d="M47 67h26M47 72h26" stroke="#E6E8EC" stroke-width="1.4"/>`;
      case "flower": return `<g transform="translate(79 31)">${[0, 72, 144, 216, 288].map(a => `<circle cx="${(5 * Math.cos(a * Math.PI / 180)).toFixed(1)}" cy="${(5 * Math.sin(a * Math.PI / 180)).toFixed(1)}" r="4" fill="#F7A8BC"/>`).join("")}<circle r="3" fill="#F2C94C"/></g>`;
      case "maple": return `<g transform="translate(80 30) rotate(18) scale(.55)"><path d="M0-16l3 7 7-3-2 8 8 2-7 5 3 6-8-2-1 9h-6l-1-9-8 2 3-6-7-5 8-2-2-8 7 3z" fill="#E8743B"/><path d="M0-4v20" stroke="#B9531F" stroke-width="2"/></g>`;
    }
    return "";
  }
  function frame(s) {
    switch (s) {
      case "ring": return `<circle cx="60" cy="60" r="56.5" fill="none" stroke="#1E2A3E" stroke-width="7"/>`;
      case "dashed": return `<circle cx="60" cy="60" r="56.5" fill="none" stroke="#1E2A3E" stroke-width="5" stroke-dasharray="7 6" stroke-linecap="round"/>`;
      case "double": return `<circle cx="60" cy="60" r="57" fill="none" stroke="#1E2A3E" stroke-width="4"/><circle cx="60" cy="60" r="50.5" fill="none" stroke="#1E2A3E" stroke-width="2"/>`;
      case "sparkle": return `<circle cx="60" cy="60" r="56.5" fill="none" stroke="#F2C94C" stroke-width="5"/>` + [[16, 22], [104, 26], [100, 98]].map(([x, y]) => `<path transform="translate(${x} ${y})" d="M0-8l2.2 5.8L8 0l-5.8 2.2L0 8l-2.2-5.8L-8 0l5.8-2.2z" fill="#F2C94C"/>`).join("");
    }
    return "";
  }
  function render(cfg, size, cls) {
    const c = norm(cfg), h = O.hairColor[c.hairColor], s = size || 40, skin = O.skin[c.skin];
    const hat = ["cap", "beanie", "bucket"].includes(c.acc);
    return `<svg class="avatar-svg ${cls || ""}" width="${s}" height="${s}" viewBox="0 0 120 120" aria-hidden="true">
      ${background(c)}
      ${hairBack(c.hair, h)}
      ${top(c.top, O.shirt[c.shirt], skin)}
      <circle cx="60" cy="56" r="28" fill="${skin}"/>
      ${c.cheek ? `<ellipse cx="44" cy="66" rx="5" ry="3" fill="#F29C9C" opacity=".55"/><ellipse cx="76" cy="66" rx="5" ry="3" fill="#F29C9C" opacity=".55"/>` : ""}
      ${marks(c.mark)}${brows(c.brows, h)}${eyes(c.eyes)}${lashes(c.lashes)}${c.acc === "mask" ? "" : mouth(c.mouth)}
      ${hat ? "" : hairFront(c.hair, h)}
      ${acc(c.acc)}
      ${frame(c.frame)}
    </svg>`;
  }
  function random(owned) {
    owned = owned || new Set();
    const pick = k => { const opts = O[k].filter(v => isOwned(k, v, owned) && isVisible(k, v, owned)); return opts[Math.floor(Math.random() * opts.length)]; };
    const pickIdx = k => { const opts = O[k].map((_, i) => i).filter(i => isOwned(k, i, owned) && isVisible(k, i, owned)); return opts[Math.floor(Math.random() * opts.length)]; };
    return { skin: Math.floor(Math.random() * 3), hairColor: pickIdx("hairColor"), shirt: pickIdx("shirt"), bg: pickIdx("bg"), hair: pick("hair"), brows: pick("brows"), eyes: pick("eyes"), lashes: false, mouth: pick("mouth"), cheek: true, mark: "none", top: pick("top"), acc: Math.random() < .5 ? "none" : pick("acc"), pattern: "none", frame: "none" };
  }
  window.TSAvatar = { OPTIONS: O, LABELS, ITEMS, EVENT, BADGES, DEFAULT, COLOR_KEYS, norm, render, random, priceOf, itemKey, eventOf, eventActive, isVisible, isOwned };
})();
