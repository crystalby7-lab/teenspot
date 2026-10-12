// 브랜드: 마스코트 '스팟이'(보영이 그린 조약돌 캐릭터)와 워드마크
(function () {
  const NAVY = "#1E2A3E";
  const W = "#fff";
  // 지도 핀 (코스 경로 썸네일에서 사용)
  const PIN = "M50 8C29.6 8 14 23.4 14 43.2c0 21.5 23.7 41 33.6 48.6a4 4 0 0 0 4.8 0C62.3 84.2 86 64.7 86 43.2 86 23.4 70.4 8 50 8z";
  // 스팟이 몸통: 살짝 기울어진 조약돌 (viewBox 0 0 122 148)
  const BODY = "M27 10c22 1 46 4 58 14 9 8 10 26 11 46 6 18 13 32 14 46-10 8-29 14-44 18-14-8-30-20-44-35-9-20-17-38-17-56 0-14 9-24 22-33z";
  const LIMBS = [[11, 99, 8, 5.5, -35], [98, 77, 8, 5.5, 8], [47, 133, 8, 5.5, -25], [108, 128, 8.5, 5.5, -8]];

  function limbs(fill, line) {
    return LIMBS.map(([x, y, rx, ry, r]) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" transform="rotate(${r} ${x} ${y})" fill="${fill}" stroke="${line}" stroke-width="4.5"/>`).join("");
  }
  // 얼굴: 속 빈 세로 타원 눈 + 떠 있는 눈썹 + P 모양 코
  function face(mood, c) {
    const sw = 3.4;
    const eye = (x, y, big) => `<ellipse cx="${x}" cy="${y}" rx="${big ? 5.2 : 4.4}" ry="${big ? 7.6 : 6.4}" fill="none" stroke="${c}" stroke-width="${sw}"/>`;
    const arc = (x, y) => `<path d="M${x - 5} ${y + 2}q5-8 10 0" stroke="${c}" stroke-width="${sw}" fill="none" stroke-linecap="round"/>`;
    const flat = (x, y) => `<path d="M${x - 5} ${y}h10" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>`;
    const brows = (lift) => `<path d="M${24 - 5} ${43 - lift}h10M${67 - 7.5} ${41 - lift}h15" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>`;
    const nose = `<g transform="translate(-6 1)"><path d="M51 70v-9q0-3 3-3t3 3-3 3h-3" stroke="${c}" stroke-width="3.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M51 70l2 6" stroke="${c}" stroke-width="3.2" stroke-linecap="round"/></g>`;
    switch (mood) {
      case "happy": return brows(3) + arc(24, 55) + arc(67, 53) + nose;
      case "wink": return brows(1) + eye(24, 55) + arc(67, 53) + nose;
      case "sleepy": return `<path d="M19 46h10M60 44h15" stroke="${c}" stroke-width="${sw}" stroke-linecap="round"/>` + flat(24, 56) + flat(67, 54) + nose;
      case "wow": return brows(5) + eye(24, 55, true) + eye(67, 53, true) + nose + `<ellipse cx="49" cy="85" rx="3.2" ry="4" fill="none" stroke="${c}" stroke-width="3"/>`;
    }
    return brows(0) + eye(24, 55) + eye(67, 53) + nose;
  }
  // mood: default | happy | wink | sleepy | wow, inverse: 어두운 배경용 (흰 몸, 네이비 선)
  function mascot(mood, size, opts) {
    opts = opts || {};
    const shadow = opts.shadow === false ? "" : `<ellipse cx="64" cy="142" rx="38" ry="3.6" fill="${opts.inverse ? "rgba(255,255,255,.16)" : "rgba(30,42,62,.12)"}"/>`;
    const line = opts.inverse ? NAVY : NAVY;
    return `<svg class="mascot ${opts.cls || ""}" width="${size}" height="${Math.round(size * 148 / 122)}" viewBox="0 0 122 148" aria-hidden="true">${shadow}${limbs(W, line)}<path d="${BODY}" fill="${W}" stroke="${line}" stroke-width="5" stroke-linejoin="round"/>${face(mood, NAVY)}</svg>`;
  }
  // 워드마크: teensp + 스팟이(o 자리) + t
  function wordmark(cls) {
    return `<span class="wordmark ${cls || ""}" aria-label="TeenSpot">teensp<svg class="wm-pin" viewBox="0 0 122 148" aria-hidden="true"><path d="${BODY}" fill="currentColor"/><ellipse cx="24" cy="55" rx="6" ry="9" fill="var(--wm-face, #fff)"/><ellipse cx="67" cy="53" rx="6" ry="9" fill="var(--wm-face, #fff)"/></svg>t</span>`;
  }
  window.TSBrand = { mascot, wordmark, PIN, BODY, NAVY };
})();
