// 브랜드: 마스코트 '스팟이'(핀 모양 캐릭터)와 워드마크
(function () {
  const NAVY = "#1E2A3E";
  const PIN = "M50 8C29.6 8 14 23.4 14 43.2c0 21.5 23.7 41 33.6 48.6a4 4 0 0 0 4.8 0C62.3 84.2 86 64.7 86 43.2 86 23.4 70.4 8 50 8z";
  function face(mood, c) {
    const eye = (x) => `<ellipse cx="${x}" cy="42" rx="4.6" ry="5.6" fill="${c}"/>`;
    const smile = `<path d="M42 54q8 7 16 0" stroke="${c}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
    switch (mood) {
      case "happy": return `<path d="M33 44q5.5-7 11 0M56 44q5.5-7 11 0" stroke="${c}" stroke-width="4" fill="none" stroke-linecap="round"/>${smile}`;
      case "wink": return `${eye(38.5)}<path d="M56 43q5.5-6 11 0" stroke="${c}" stroke-width="4" fill="none" stroke-linecap="round"/>${smile}`;
      case "sleepy": return `<path d="M33 43h11M56 43h11" stroke="${c}" stroke-width="4" stroke-linecap="round"/><path d="M45 55h10" stroke="${c}" stroke-width="4" stroke-linecap="round"/>`;
      case "wow": return `${eye(38.5)}${eye(61.5)}<ellipse cx="50" cy="56" rx="4.5" ry="5.5" fill="${c}"/>`;
      case "plain": return `${eye(38.5)}${eye(61.5)}`;
    }
    return `${eye(38.5)}${eye(61.5)}${smile}`;
  }
  // mood: default | happy | wink | sleepy | wow | plain, inverse: 흰 몸 + 네이비 얼굴 (어두운 배경용)
  function mascot(mood, size, opts) {
    opts = opts || {};
    const body = opts.inverse ? "#fff" : NAVY, ink = opts.inverse ? NAVY : "#fff";
    const shadow = opts.shadow === false ? "" : `<ellipse cx="50" cy="104" rx="20" ry="4" fill="${opts.inverse ? "rgba(255,255,255,.18)" : "rgba(30,42,62,.12)"}"/>`;
    return `<svg class="mascot ${opts.cls || ""}" width="${size}" height="${Math.round(size * 1.1)}" viewBox="0 0 100 110" aria-hidden="true">${shadow}<path d="${PIN}" fill="${body}"/>${face(mood, ink)}</svg>`;
  }
  // 워드마크: teensp + 핀 + t
  function wordmark(cls) {
    return `<span class="wordmark ${cls || ""}" aria-label="TeenSpot">teensp<svg class="wm-pin" viewBox="0 0 100 100" aria-hidden="true"><path d="${PIN}" fill="currentColor"/><ellipse cx="38.5" cy="42" rx="5" ry="6" fill="var(--wm-face, #fff)"/><ellipse cx="61.5" cy="42" rx="5" ry="6" fill="var(--wm-face, #fff)"/></svg>t</span>`;
  }
  window.TSBrand = { mascot, wordmark, PIN, NAVY };
})();
