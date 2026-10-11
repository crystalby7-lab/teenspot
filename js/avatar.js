// 아바타 캐릭터: 부위별 옵션을 골라 SVG로 그려요
(function () {
  const O = {
    skin: ["#FBE3D2", "#F6D2B6", "#E9B992", "#C98E66", "#8D5B3E"],
    hairColor: ["#2B2B33", "#4A3328", "#7A5236", "#8E8B87", "#E2C27C", "#E59BB0", "#6E8FD6"],
    shirt: ["#1E2A3E", "#F2F2F2", "#EE7E62", "#7FB49A", "#9AA9E6", "#F2C94C"],
    bg: ["#E8ECF3", "#FDEEE9", "#E6F4EE", "#EFEAF8", "#FFF4DB", "#E3F1F8"],
    hair: ["short", "bangs", "long", "pony", "curly", "bun", "buzz"],
    eyes: ["dot", "smile", "round", "wink", "sleepy"],
    mouth: ["smile", "open", "flat", "cat"],
    acc: ["none", "glasses", "sunglasses", "cap", "headphones", "ribbon"],
    cheek: [true, false]
  };
  const LABELS = {
    hair: { short: "숏컷", bangs: "단발 앞머리", long: "긴 머리", pony: "포니테일", curly: "곱슬", bun: "똥머리", buzz: "짧은 머리" },
    eyes: { dot: "기본", smile: "웃는 눈", round: "동그란 눈", wink: "윙크", sleepy: "졸린 눈" },
    mouth: { smile: "미소", open: "활짝", flat: "무표정", cat: "고양이 입" },
    acc: { none: "없음", glasses: "안경", sunglasses: "선글라스", cap: "모자", headphones: "헤드폰", ribbon: "리본" },
    cheek: { true: "볼터치", false: "없음" }
  };
  const DEFAULT = { skin: 1, hairColor: 0, shirt: 0, bg: 0, hair: "bangs", eyes: "dot", mouth: "smile", acc: "none", cheek: true };

  function norm(c) {
    c = Object.assign({}, DEFAULT, c || {});
    ["skin", "hairColor", "shirt", "bg"].forEach(k => { c[k] = Math.max(0, Math.min(O[k].length - 1, Number(c[k]) || 0)); });
    ["hair", "eyes", "mouth", "acc"].forEach(k => { if (O[k].indexOf(c[k]) < 0) c[k] = DEFAULT[k]; });
    c.cheek = c.cheek !== false && c.cheek !== "false";
    return c;
  }
  function hairBack(s, h) {
    if (s === "long") return `<path d="M28 58C28 28 44 19 60 19s32 9 32 39l3 50H25z" fill="${h}"/>`;
    if (s === "bangs") return `<path d="M30 56C30 30 44 21 60 21s30 9 30 35v24c-5 2-9 0-10-4H40c-1 4-5 6-10 4z" fill="${h}"/>`;
    if (s === "pony") return `<path d="M80 30c18 2 22 32 12 50-3-16-7-28-15-36z" fill="${h}"/>`;
    if (s === "bun") return `<circle cx="60" cy="20" r="11" fill="${h}"/>`;
    return "";
  }
  function hairFront(s, h) {
    switch (s) {
      case "short": return `<path d="M31 55c0-24 14-31 29-31 16 0 29 8 29 31-6-10-16-17-29-17-12 0-23 6-29 17z" fill="${h}"/>`;
      case "bangs": return `<path d="M32 51c0-18 13-25 28-25s28 7 28 25z" fill="${h}"/>`;
      case "long": return `<path d="M32 53c2-20 16-27 30-27 16 0 26 10 26 27-10-6-18-14-24-21-6 10-19 17-32 21z" fill="${h}"/>`;
      case "pony": return `<path d="M32 52c0-20 13-27 28-27s28 7 28 27c-8-7-17-11-28-11s-20 4-28 11z" fill="${h}"/>`;
      case "curly": return [[35, 50, 9], [40, 38, 10], [50, 30, 10], [62, 27, 10], [74, 30, 10], [83, 39, 10], [86, 51, 9]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${h}"/>`).join("");
      case "bun": return `<path d="M32 52c0-20 13-27 28-27s28 7 28 27c-8-7-17-11-28-11s-20 4-28 11z" fill="${h}"/>`;
      case "buzz": return `<path d="M33 50c1-17 13-23 27-23s26 6 27 23c-8-7-17-10-27-10s-19 3-27 10z" fill="${h}"/>`;
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
    }
    return `<circle cx="50" cy="58" r="3" fill="${ink}"/><circle cx="70" cy="58" r="3" fill="${ink}"/>`;
  }
  function mouth(s) {
    const ink = "#2B2F38";
    switch (s) {
      case "open": return `<path d="M54 67h12q0 8-6 8t-6-8z" fill="${ink}"/><path d="M57 72q3 2 6 0" stroke="#E97A7A" stroke-width="2" fill="none"/>`;
      case "flat": return `<path d="M55 69h10" stroke="${ink}" stroke-width="2.4" stroke-linecap="round"/>`;
      case "cat": return `<path d="M53 67q3.5 4 7 0q3.5 4 7 0" stroke="${ink}" stroke-width="2.2" fill="none" stroke-linecap="round"/>`;
    }
    return `<path d="M54 67q6 6 12 0" stroke="${ink}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;
  }
  function acc(s, h) {
    switch (s) {
      case "glasses": return `<g fill="none" stroke="#2B2F38" stroke-width="2"><circle cx="50" cy="58" r="7"/><circle cx="70" cy="58" r="7"/><path d="M57 58h6"/></g>`;
      case "sunglasses": return `<path d="M41 54h17v6q0 7-8.5 7T41 60zM62 54h17v6q0 7-8.5 7T62 60z" fill="#2B2F38"/><path d="M58 56h4" stroke="#2B2F38" stroke-width="2.4"/>`;
      case "cap": return `<path d="M31 46c0-18 13-25 29-25s29 7 29 25z" fill="#EE7E62"/><path d="M60 46h36q-2 6-12 6H60z" fill="#D86A50"/><circle cx="60" cy="22" r="2.5" fill="#D86A50"/>`;
      case "headphones": return `<path d="M30 58c0-24 14-36 30-36s30 12 30 36" stroke="#2B2F38" stroke-width="4" fill="none"/><rect x="24" y="52" width="10" height="16" rx="5" fill="#2B2F38"/><rect x="86" y="52" width="10" height="16" rx="5" fill="#2B2F38"/>`;
      case "ribbon": return `<path d="M72 30l12-7v14zM72 30l-1 12 12-5z" fill="#EE7E62"/><circle cx="73" cy="31" r="3" fill="#D86A50"/>`;
    }
    return "";
  }
  function render(cfg, size, cls) {
    const c = norm(cfg), h = O.hairColor[c.hairColor], s = size || 40;
    return `<svg class="avatar-svg ${cls || ""}" width="${s}" height="${s}" viewBox="0 0 120 120" aria-hidden="true">
      <rect width="120" height="120" fill="${O.bg[c.bg]}"/>
      ${hairBack(c.hair, h)}
      <path d="M22 122c0-26 17-36 38-36s38 10 38 36z" fill="${O.shirt[c.shirt]}"/>
      <rect x="54" y="78" width="12" height="12" rx="4" fill="${O.skin[c.skin]}"/>
      <circle cx="60" cy="56" r="28" fill="${O.skin[c.skin]}"/>
      ${c.cheek ? `<ellipse cx="44" cy="66" rx="5" ry="3" fill="#F29C9C" opacity=".55"/><ellipse cx="76" cy="66" rx="5" ry="3" fill="#F29C9C" opacity=".55"/>` : ""}
      ${eyes(c.eyes)}${mouth(c.mouth)}
      ${c.acc === "cap" ? "" : hairFront(c.hair, h)}
      ${acc(c.acc, h)}
    </svg>`;
  }
  function random() {
    const pick = a => a[Math.floor(Math.random() * a.length)];
    return { skin: Math.floor(Math.random() * 3), hairColor: Math.floor(Math.random() * 4), shirt: Math.floor(Math.random() * O.shirt.length), bg: Math.floor(Math.random() * O.bg.length), hair: pick(O.hair), eyes: pick(["dot", "smile", "round"]), mouth: pick(["smile", "open", "cat"]), acc: "none", cheek: true };
  }
  window.TSAvatar = { OPTIONS: O, LABELS, DEFAULT, norm, render, random };
})();
