(function () {
  "use strict";
  const CFG = window.TS_CONFIG || {};
  const LEGAL = window.TS_LEGAL || {};
  const LAUNCH_GU = CFG.launchGu || "서대문구";
  const $app = document.getElementById("app");
  const $modal = document.getElementById("modal-root");
  const $toast = document.getElementById("toast");

  const S = { store: null, user: null, profile: null, admin: false, draft: {}, booted: false, lastPath: "" };
  const LS = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };

  /* ---------- 공통 유틸 ---------- */
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const won = n => (Number(n) === 0 ? "무료" : Number(n).toLocaleString("ko-KR") + "원");
  const pct = (x, t) => (t ? Math.round((x / t) * 100) : 0);
  const fmtDate = t => { const d = new Date(t); return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`; };
  const GU_LIST = ["강남구", "강동구", "강북구", "강서구", "관악구", "광진구", "구로구", "금천구", "노원구", "도봉구", "동대문구", "동작구", "마포구", "서대문구", "서초구", "성동구", "성북구", "송파구", "양천구", "영등포구", "용산구", "은평구", "종로구", "중구", "중랑구"];
  const CATS = { outfit: "옷", makeup: "화장", hair: "머리" };
  const INTERESTS = ["옷", "화장", "머리", "놀거리"];
  const REPORT_REASONS = ["광고·홍보", "욕설·비하", "개인정보 노출", "사실과 다른 정보", "청소년에게 위험한 장소", "기타"];
  const BANNED = ["운영자", "관리자", "admin", "teenspot", "시발", "씨발", "병신", "fuck"];

  function toast(msg) {
    $toast.textContent = msg; $toast.classList.add("show");
    clearTimeout(toast.t); toast.t = setTimeout(() => $toast.classList.remove("show"), 2200);
  }
  function go(h) { if (location.hash === h) render(); else location.hash = h; }
  function back(fallback) { if (history.length > 1) history.back(); else go(fallback || "#/home"); }
  function parse() {
    const h = location.hash.replace(/^#/, "") || "/home";
    const [path, qs] = h.split("?");
    return { parts: path.split("/").filter(Boolean).map(decodeURIComponent), q: Object.fromEntries(new URLSearchParams(qs || "")), path };
  }

  /* ---------- 렌더링 ---------- */
  let token = 0;
  function paint(t, html, bind) {
    if (t !== token) return false;
    const p = parse().path;
    $app.innerHTML = html;
    if (p !== S.lastPath) {
      window.scrollTo(0, 0);
      const first = $app.firstElementChild;
      if (first) { first.classList.add("enter"); setTimeout(() => first.classList.remove("enter"), 320); }
    }
    S.lastPath = p;
    if (bind) bind();
    hydrateImages($app);
    return true;
  }
  const imgCache = {};
  function imgTag(ref, alt, cls) {
    ref = ref || "";
    if (ref.indexOf("img:") === 0) {
      const id = ref.slice(4);
      return imgCache[id] ? `<img class="${cls || ""}" src="${imgCache[id]}" alt="${esc(alt || "")}">` : `<img class="${cls || ""} lazy" data-img="${esc(id)}" alt="${esc(alt || "")}">`;
    }
    return ref ? `<img class="${cls || ""}" src="${esc(ref)}" alt="${esc(alt || "")}" loading="lazy">` : "";
  }
  function hydrateImages(root) {
    (root || $app).querySelectorAll("img[data-img]").forEach(async el => {
      const id = el.dataset.img; el.removeAttribute("data-img");
      try {
        if (!imgCache[id]) imgCache[id] = await S.store.getImage(id);
        if (imgCache[id]) { el.src = imgCache[id]; el.classList.remove("lazy"); }
      } catch (e) {}
    });
  }
  const loadingHtml = () => `<div class="skeleton" aria-busy="true" aria-label="불러오는 중">
      <div class="sk sk-title"></div>
      ${[0, 1, 2].map(() => `<div class="sk-row"><div class="sk sk-thumb"></div><div class="grow"><div class="sk sk-line"></div><div class="sk sk-line short"></div></div></div>`).join("")}
    </div>`;
  const mascot = (mood, size, opts) => window.TSBrand.mascot(mood, size, opts);
  function errorHtml(e) {
    const offline = !navigator.onLine;
    return `<div class="center-screen">
      ${mascot(offline ? "sleepy" : "wow", 84)}
      <h2>${offline ? "인터넷 연결이 끊겼어요" : "문제가 생겼어요"}</h2>
      <p class="muted">${offline ? "연결을 확인하고 다시 시도해주세요" : esc(e && e.message ? e.message : "잠시 후 다시 시도해주세요")}</p>
      <button class="btn" data-act="retry">다시 시도</button>
    </div>`;
  }
  function emptyHtml(icon, title, desc, action) {
    return `<div class="empty"><div class="state-icon">${ic(icon, 26)}</div><h3>${esc(title)}</h3>${desc ? `<p class="muted">${esc(desc)}</p>` : ""}${action || ""}</div>`;
  }
  function header(title, opts) {
    opts = opts || {};
    if (opts.back) return `<header class="topbar sub">
      <button class="icon-btn" data-act="back" aria-label="뒤로">${ic("back", 24)}</button>
      <h1>${esc(title)}</h1>
      <div class="topbar-right">${opts.right || ""}</div>
    </header>`;
    return `<header class="topbar root">
      ${opts.brand ? window.TSBrand.wordmark("wm-bar") : `<h1 class="title-lg">${esc(title)}</h1>`}
      <div class="topbar-right">${opts.right || ""}</div>
    </header>`;
  }
  function tabbar(active) {
    const tabs = [["home", "home", "홈"], ["feed", "grid", "피드"], ["spot", "pin", "코스"], ["style", "shirt", "스타일"], ["me", "user", "마이"]];
    return `<nav class="tabbar">${tabs.map(([k, i, l]) => `<a href="#/${k}" class="${active === k ? "on" : ""}" ${active === k ? 'aria-current="page"' : ""}><span class="tab-ic">${ic(i, 23)}</span><span>${l}</span></a>`).join("")}</nav>`;
  }
  const demoBadge = () => (S.store && S.store.mode === "demo" ? `<span class="badge-demo">체험 모드</span>` : "");
  function page(inner, tab, bar) { return `<div class="page ${tab ? "has-tab" : ""} ${bar ? "has-bar" : ""}">${inner}</div>${tab ? tabbar(tab) : ""}`; }

  document.addEventListener("click", e => {
    const a = e.target.closest("[data-act]");
    if (!a) return;
    const act = a.dataset.act;
    if (act === "back") { e.preventDefault(); back(a.dataset.fallback); }
    if (act === "retry") { e.preventDefault(); render(); }
    if (act === "go") { e.preventDefault(); go(a.dataset.to); }
    if (act === "close-modal") { e.preventDefault(); closeModal(); }
  });

  /* ---------- 모달 ---------- */
  function openModal(html) {
    $modal.innerHTML = `<div class="modal-bg" data-act="close-modal"></div><div class="sheet">${html}</div>`;
    $modal.classList.add("open");
    return $modal.querySelector(".sheet");
  }
  function closeModal() { $modal.classList.remove("open"); $modal.innerHTML = ""; }
  function confirmSheet(title, desc, okLabel, danger) {
    return new Promise(res => {
      const el = openModal(`<h3>${esc(title)}</h3>${desc ? `<p class="muted">${esc(desc)}</p>` : ""}
        <div class="row gap"><button class="btn ghost" data-r="0">취소</button><button class="btn ${danger ? "danger" : ""}" data-r="1">${esc(okLabel || "확인")}</button></div>`);
      el.querySelectorAll("[data-r]").forEach(b => (b.onclick = () => { closeModal(); res(b.dataset.r === "1"); }));
      $modal.querySelector(".modal-bg").onclick = () => { closeModal(); res(false); };
    });
  }
  function reportSheet(type, targetId, extra) {
    const el = openModal(`<h3>신고하기</h3><p class="muted">신고 사유를 골라주세요. 운영자가 확인 후 조치해요.</p>
      <div class="list-choice">${REPORT_REASONS.map(r => `<button class="choice" data-reason="${esc(r)}">${esc(r)}</button>`).join("")}</div>
      <button class="btn ghost block" data-act="close-modal">취소</button>`);
    el.querySelectorAll("[data-reason]").forEach(b => (b.onclick = async () => {
      b.disabled = true;
      try { await S.store.report(type, targetId, b.dataset.reason, extra); closeModal(); toast("신고가 접수됐어요"); }
      catch (e) { closeModal(); toast("신고에 실패했어요. 다시 시도해주세요"); }
    }));
  }
  async function share(title, hash) {
    const url = location.href.split("#")[0] + hash;
    try {
      if (navigator.share) { await navigator.share({ title, url }); return; }
      await navigator.clipboard.writeText(url); toast("링크를 복사했어요");
    } catch (e) { if (e && e.name !== "AbortError") toast("링크: " + url); }
  }

  /* ---------- 라우터 ---------- */
  window.addEventListener("hashchange", () => render());
  async function render() {
    if (!S.booted) return;
    closeModal();
    const t = ++token;
    try { await route(t); }
    catch (e) { console.error(e); paint(t, errorHtml(e)); }
  }
  async function route(t) {
    const { parts: p, q } = parse();
    if (p[0] === "legal") return screenLegal(t, p[1]);

    if (!S.user) {
      if (p[0] === "install") return screenInstall(t);
      if (LS.get("ts-onboarded") !== "1") return screenOnboarding(t, Number(p[0] === "onboarding" ? p[1] : 0) || 0);
      return screenLogin(t);
    }
    if (!S.profile) {
      const step = p[0] === "signup" ? p[1] : "age";
      const map = { age: screenAge, blocked: screenBlocked, terms: screenTerms, nickname: screenNickname, region: screenRegion, interests: screenInterests };
      return (map[step] || screenAge)(t, q);
    }
    switch (p[0]) {
      case "spot": return p[1] === "list" ? screenCourseList(t, q) : screenSpot(t);
      case "course": return p[2] === "review" ? screenReviewForm(t, p[1]) : screenCourse(t, p[1]);
      case "submit": return p[1] === "done" ? screenSubmitDone(t) : screenSubmit(t);
      case "style": return p[1] === "history" ? screenStyleHistory(t) : screenStyle(t, q);
      case "poll": return screenPoll(t, p[1]);
      case "saved": return screenSaved(t, q);
      case "feed": return screenFeed(t, q);
      case "post":
        if (p[1] === "new") return p[2] === "review" ? screenNewReview(t, q) : screenNewVote(t);
        if (p[1] === "done") return screenPostDone(t);
        return screenPost(t, p[1]);
      case "me": return p[1] === "edit" ? screenMeEdit(t) : p[1] === "style" ? screenAvatarEdit(t) : screenMe(t);
      case "u": return screenUser(t, p[1]);
      case "points": return screenPoints(t);
      case "notifications": return screenNotis(t);
      case "blocked": return screenBlockList(t);
      case "settings": return screenSettings(t);
      case "withdraw": return screenWithdraw(t);
      case "admin": return screenAdmin(t, p, q);
      default: return screenHome(t);
    }
  }

  /* =========================================================
     1. 첫 실행
     ========================================================= */
  const ONBOARD = [
    { mood: "happy", chips: ["3명", "1만5천원", "4시간"], title: "친구랑 어디 가지?", desc: "인원, 예산, 시간만 고르면\n또래가 직접 다녀온 코스를 보여줘요" },
    { mood: "wink", chips: ["와이드 데님", "vs", "카고 팬츠"], title: "뭐가 더 어울릴까?", desc: "옷, 화장, 머리 고민을\n또래 투표로 결정해요" },
    { mood: "default", chips: ["댓글 없음", "구 단위 공개", "1:1 메시지 없음"], title: "안심하고 쓰는 공간", desc: "선택과 칭찬만 주고받아요\n올린 사진은 운영자가 확인한 뒤 공개돼요" }
  ];
  function screenOnboarding(t, i) {
    i = Math.max(0, Math.min(ONBOARD.length - 1, i));
    const s = ONBOARD[i], last = i === ONBOARD.length - 1;
    paint(t, `<div class="onboard">
      <div class="onboard-top"><button class="link" data-act="skip">건너뛰기</button></div>
      <div class="onboard-body">
        <div class="onboard-art" data-slide="${i}">
          ${s.chips.map((c, k) => `<span class="ob-chip c${k} ${c === "vs" ? "vs" : ""}">${esc(c)}</span>`).join("")}
          ${mascot(s.mood, 132)}
        </div>
        <h1>${esc(s.title)}</h1>
        <p>${esc(s.desc).replace(/\n/g, "<br>")}</p>
      </div>
      <div class="dots">${ONBOARD.map((_, k) => `<i class="${k === i ? "on" : ""}"></i>`).join("")}</div>
      <button class="btn block lg" data-act="next">${last ? "시작하기" : "다음"}</button>
    </div>`, () => {
      const done = () => { LS.set("ts-onboarded", "1"); go(isStandalone() ? "#/login" : "#/install"); };
      $app.querySelector('[data-act="skip"]').onclick = done;
      $app.querySelector('[data-act="next"]').onclick = () => (last ? done() : go("#/onboarding/" + (i + 1)));
    });
  }

  let installEvt = null;
  window.addEventListener("beforeinstallprompt", e => { e.preventDefault(); installEvt = e; });
  const isStandalone = () => (window.matchMedia && matchMedia("(display-mode: standalone)").matches) || navigator.standalone === true;
  const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent);
  function screenInstall(t) {
    LS.set("ts-onboarded", "1");
    const ios = isIOS();
    paint(t, `<div class="onboard">
      <div class="onboard-body">
        <div class="onboard-icon">${ic("phone", 52)}</div>
        <h1>홈 화면에 추가하기</h1>
        <p>앱처럼 바로 열 수 있어요</p>
        <div class="card steps">
          ${ios
            ? `<div><b>1</b> 사파리 하단의 공유 버튼 <span class="kbd">${ic("share", 15)}</span> 누르기</div><div><b>2</b> '홈 화면에 추가' 선택</div><div><b>3</b> 오른쪽 위 '추가' 누르기</div>`
            : `<div><b>1</b> 아래 '설치하기' 버튼 누르기</div><div><b>2</b> 버튼이 없으면 브라우저 메뉴 <span class="kbd">${ic("more", 15)}</span> 열기</div><div><b>3</b> '홈 화면에 추가' 또는 '앱 설치' 선택</div>`}
        </div>
      </div>
      ${!ios ? `<button class="btn block lg" data-act="install">설치하기</button>` : ""}
      <button class="btn ${ios ? "" : "ghost"} block lg" data-act="later">${ios ? "확인했어요" : "나중에 할게요"}</button>
    </div>`, () => {
      const inst = $app.querySelector('[data-act="install"]');
      if (inst) inst.onclick = async () => {
        if (!installEvt) { toast("브라우저 메뉴에서 '홈 화면에 추가'를 눌러주세요"); return; }
        installEvt.prompt(); try { await installEvt.userChoice; } catch (e) {} installEvt = null; go("#/login");
      };
      $app.querySelector('[data-act="later"]').onclick = () => go("#/login");
    });
  }

  /* =========================================================
     2. 가입·동의
     ========================================================= */
  function screenLogin(t) {
    paint(t, `<div class="login">
      <div class="login-hero">
        ${mascot("happy", 104, { inverse: true })}
        <h1>${window.TSBrand.wordmark("wm-login")}</h1>
        <p>어른 리뷰 말고,<br>또래가 직접 해본 것</p>
        ${demoBadge()}
      </div>
      <div class="login-bottom">
        <button class="btn google block lg" data-act="google">${GOOGLE_G} Google로 시작하기</button>
        <p class="tiny muted">시작하면 <a href="#/legal/terms">이용약관</a>과 <a href="#/legal/privacy">개인정보 수집·이용</a> 내용을 확인한 것으로 봐요. 동의는 다음 단계에서 받아요.</p>
        ${S.store.loadError ? `<p class="tiny warn">Firebase 연결에 실패해 체험 모드로 열렸어요</p>` : ""}
      </div>
    </div>`, () => {
      $app.querySelector('[data-act="google"]').onclick = async e => {
        e.currentTarget.disabled = true;
        try { await S.store.signIn(); }
        catch (err) { toast("로그인에 실패했어요: " + (err.code || err.message)); }
        finally { const b = $app.querySelector('[data-act="google"]'); if (b) b.disabled = false; }
      };
    });
  }
  function stepHeader(n, title) {
    return `<header class="topbar">${n > 1 ? `<button class="icon-btn" data-act="back" aria-label="뒤로">${ic("back", 24)}</button>` : `<span class="icon-spacer"></span>`}<div class="progress"><i style="width:${(n / 5) * 100}%"></i></div><span class="muted tiny">${n}/5</span></header><h1 class="step-title">${title}</h1>`;
  }
  function calcAge(y, m) {
    const d = new Date(); let a = d.getFullYear() - y;
    if (d.getMonth() + 1 < m) a -= 1;
    return a;
  }
  function screenAge(t) {
    const yNow = new Date().getFullYear();
    const years = []; for (let y = yNow - 8; y >= yNow - 30; y--) years.push(y);
    const dr = S.draft;
    paint(t, `<div class="page form-page">
      ${stepHeader(1, "출생 연월을 알려주세요")}
      <p class="muted">TeenSpot은 만 14~19세 청소년을 위한 서비스예요</p>
      <div class="row gap">
        <label class="field grow"><span>연도</span><select id="by"><option value="">선택</option>${years.map(y => `<option ${dr.birthYear === y ? "selected" : ""}>${y}</option>`).join("")}</select></label>
        <label class="field grow"><span>월</span><select id="bm"><option value="">선택</option>${Array.from({ length: 12 }, (_, i) => i + 1).map(m => `<option ${dr.birthMonth === m ? "selected" : ""}>${m}</option>`).join("")}</select></label>
      </div>
      <div class="bottom-cta"><button class="btn block lg" id="next" disabled>다음</button>
      <button class="link block" data-act="logout">다른 계정으로 로그인</button></div>
    </div>`, () => {
      const by = $app.querySelector("#by"), bm = $app.querySelector("#bm"), nx = $app.querySelector("#next");
      const chk = () => (nx.disabled = !(by.value && bm.value));
      by.onchange = bm.onchange = chk; chk();
      nx.onclick = () => {
        const y = Number(by.value), m = Number(bm.value), age = calcAge(y, m);
        if (age < 14) return go("#/signup/blocked?k=young");
        if (age > 19) return go("#/signup/blocked?k=adult");
        S.draft.birthYear = y; S.draft.birthMonth = m;
        go("#/signup/terms");
      };
      $app.querySelector('[data-act="logout"]').onclick = () => S.store.signOut();
    });
  }
  function screenBlocked(t, q) {
    const young = q.k !== "adult";
    paint(t, `<div class="center-screen">
      ${mascot(young ? "wink" : "plain", 84)}
      <h2>${young ? "만 14세부터 가입할 수 있어요" : "TeenSpot은 10대 전용이에요"}</h2>
      <p class="muted">${young ? "조금만 기다렸다가 다시 만나요!" : "만 14~19세 청소년만 가입할 수 있어요"}</p>
      <button class="btn" data-act="out">처음으로</button>
    </div>`, () => { $app.querySelector('[data-act="out"]').onclick = async () => { S.draft = {}; await S.store.signOut(); }; });
  }
  function screenTerms(t) {
    if (!S.draft.birthYear) return go("#/signup/age");
    const a = (S.draft.agree = S.draft.agree || { terms: false, privacy: false, guide: false, marketing: false });
    const items = [["terms", "서비스 이용약관", true], ["privacy", "개인정보 수집·이용 동의", true], ["guide", "커뮤니티 가이드라인", true], ["marketing", "마케팅 정보 수신", false]];
    paint(t, `<div class="page form-page">
      ${stepHeader(2, "약관에 동의해주세요")}
      <label class="check all"><input type="checkbox" id="all"><span>전체 동의</span></label>
      <div class="divider"></div>
      <div class="card terms-list">${items.map(([k, l, req]) => `<div class="check-row"><label class="check"><input type="checkbox" data-k="${k}" ${a[k] ? "checked" : ""}><span><em class="${req ? "req" : "opt"}">${req ? "필수" : "선택"}</em> ${l}</span></label><a class="link" href="#/legal/${k}">보기</a></div>`).join("")}</div>
      <div class="bottom-cta"><button class="btn block lg" id="next" disabled>다음</button></div>
    </div>`, () => {
      const all = $app.querySelector("#all"), boxes = [...$app.querySelectorAll("[data-k]")], nx = $app.querySelector("#next");
      const sync = () => { boxes.forEach(b => (a[b.dataset.k] = b.checked)); all.checked = boxes.every(b => b.checked); nx.disabled = !(a.terms && a.privacy && a.guide); };
      boxes.forEach(b => (b.onchange = sync));
      all.onchange = () => { boxes.forEach(b => (b.checked = all.checked)); sync(); };
      sync();
      nx.onclick = () => go("#/signup/nickname");
    });
  }
  function validNick(n) {
    if (n.length < 2 || n.length > 10) return "2~10자로 입력해주세요";
    if (!/^[가-힣a-zA-Z0-9_]+$/.test(n)) return "한글, 영문, 숫자, _만 쓸 수 있어요";
    const low = n.toLowerCase();
    if (BANNED.some(b => low.includes(b))) return "사용할 수 없는 단어가 포함돼 있어요";
    return "";
  }
  function nicknameField(initial) {
    return `<label class="field"><span>닉네임</span>
      <div class="row gap"><input id="nick" maxlength="10" placeholder="2~10자" value="${esc(initial || "")}" autocomplete="off"><button class="btn ghost sm" id="chk">중복 확인</button></div>
      <small id="nmsg" class="muted">이름이나 학교를 드러내지 않는 닉네임을 추천해요</small></label>`;
  }
  function bindNickname(current, onState) {
    const inp = $app.querySelector("#nick"), msg = $app.querySelector("#nmsg"), chk = $app.querySelector("#chk");
    let ok = !!current && inp.value === current;
    const set = (text, cls) => { msg.textContent = text; msg.className = cls; };
    inp.oninput = () => { ok = !!current && inp.value.trim() === current; onState(ok, inp.value.trim()); set(ok ? "지금 쓰는 닉네임이에요" : "중복 확인을 해주세요", "muted"); };
    chk.onclick = async e => {
      e.preventDefault();
      const n = inp.value.trim(), err = validNick(n);
      if (err) { set(err, "warn"); return; }
      chk.disabled = true;
      try {
        if (await S.store.nicknameTaken(n)) { ok = false; set("이미 사용 중인 닉네임이에요", "warn"); }
        else { ok = true; set("사용할 수 있는 닉네임이에요", "okc"); }
      } catch (er) { set("확인에 실패했어요. 다시 시도해주세요", "warn"); }
      chk.disabled = false; onState(ok, n);
    };
    onState(ok, inp.value.trim());
  }
  function screenNickname(t) {
    if (!S.draft.agree) return go("#/signup/age");
    paint(t, `<div class="page form-page">
      ${stepHeader(3, "닉네임을 정해주세요")}
      ${nicknameField(S.draft.nickOk ? S.draft.nickname : "")}
      <div class="bottom-cta"><button class="btn block lg" id="next" disabled>다음</button></div>
    </div>`, () => {
      const nx = $app.querySelector("#next");
      bindNickname(S.draft.nickOk ? S.draft.nickname : "", (ok, n) => { nx.disabled = !ok; if (ok) { S.draft.nickname = n; S.draft.nickOk = true; } });
      nx.onclick = () => go("#/signup/region");
    });
  }
  function regionFields(gu) {
    return `<label class="field"><span>시·도</span><select id="sido"><option>서울특별시</option></select></label>
      <label class="field"><span>구</span><select id="gu"><option value="">선택</option>${GU_LIST.map(g => `<option ${g === gu ? "selected" : ""}>${g}</option>`).join("")}</select></label>
      <p class="hint">지금은 <b>${esc(LAUNCH_GU)}</b> 코스부터 준비하고 있어요. 다른 구도 곧 늘어나요!</p>`;
  }
  function screenRegion(t) {
    if (!S.draft.nickOk) return go("#/signup/nickname");
    paint(t, `<div class="page form-page">
      ${stepHeader(4, "어느 구에 살아요?")}
      <p class="muted">동네 단위까지만 받아요. 정확한 위치는 저장하지 않아요</p>
      ${regionFields(S.draft.gu)}
      <div class="bottom-cta"><button class="btn block lg" id="next" disabled>다음</button></div>
    </div>`, () => {
      const gu = $app.querySelector("#gu"), nx = $app.querySelector("#next");
      const chk = () => (nx.disabled = !gu.value); gu.onchange = chk; chk();
      nx.onclick = () => { S.draft.gu = gu.value; go("#/signup/interests"); };
    });
  }
  function screenInterests(t) {
    if (!S.draft.gu) return go("#/signup/region");
    const sel = new Set(S.draft.interests || []);
    paint(t, `<div class="page form-page">
      ${stepHeader(5, "관심 있는 걸 골라주세요")}
      <p class="muted">여러 개 골라도 돼요</p>
      <div class="chips big">${INTERESTS.map(i => `<button class="chip ${sel.has(i) ? "on" : ""}" data-i="${i}">${i}</button>`).join("")}</div>
      <div class="bottom-cta"><button class="btn block lg" id="next" disabled>TeenSpot 시작하기</button></div>
    </div>`, () => {
      const nx = $app.querySelector("#next");
      $app.querySelectorAll("[data-i]").forEach(b => (b.onclick = () => { sel.has(b.dataset.i) ? sel.delete(b.dataset.i) : sel.add(b.dataset.i); b.classList.toggle("on"); nx.disabled = !sel.size; }));
      nx.disabled = !sel.size;
      nx.onclick = async () => {
        nx.disabled = true; nx.textContent = "준비 중...";
        const d = S.draft;
        try {
          await S.store.setNickname(d.nickname);
          const profile = {
            nickname: d.nickname, birthYear: d.birthYear, birthMonth: d.birthMonth, gu: d.gu, interests: [...sel],
            agreements: { terms: true, privacy: true, guide: true, marketing: !!d.agree.marketing, at: Date.now() },
            createdAt: Date.now()
          };
          await S.store.saveProfile(profile);
          S.profile = profile; S.draft = {};
          await ensurePublic();
          S.admin = await S.store.isAdmin();
          toast(`${profile.nickname}님, 환영해요!`);
          go("#/home");
        } catch (e) {
          toast(e.message || "가입에 실패했어요");
          nx.disabled = false; nx.textContent = "TeenSpot 시작하기";
          if (/닉네임/.test(e.message || "")) { S.draft.nickOk = false; go("#/signup/nickname"); }
        }
      };
    });
  }
  function screenLegal(t, key) {
    const doc = LEGAL[key];
    if (!doc) return go("#/home");
    paint(t, `<div class="page">${header(doc.title, { back: true })}<article class="legal">${doc.body}<p class="tiny muted">시행일: 정식 출시일</p></article></div>`);
  }

  /* =========================================================
     3. 홈
     ========================================================= */
  // 코스 썸네일: 장소 수만큼 점을 이은 작은 경로 그림
  function routeThumb(n) {
    n = Math.max(2, Math.min(6, n));
    const pts = Array.from({ length: n }, (_, i) => [10 + (i * 36) / (n - 1), i % 2 ? 36 : 22]);
    const d = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1]).join(" ");
    const last = pts[n - 1];
    return `<svg viewBox="0 0 56 56" aria-hidden="true"><path d="${d}" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="1 4" stroke-linecap="round" opacity=".55"/>
      ${pts.slice(0, -1).map(p => `<circle cx="${p[0].toFixed(1)}" cy="${p[1]}" r="3.4" fill="currentColor"/>`).join("")}
      <path transform="translate(${(last[0] - 7).toFixed(1)} ${last[1] - 15}) scale(.14)" d="${window.TSBrand.PIN}" fill="currentColor"/></svg>`;
  }
  function courseCard(c) {
    return `<a class="course-card" href="#/course/${encodeURIComponent(c.id)}">
      <div class="cc-thumb">${routeThumb(c.stops.length)}<small>${esc(c.area || c.gu.replace("구", ""))}</small></div>
      <div class="cc-body">
        <h3>${esc(c.title)}</h3>
        <div class="cc-sub"><span>${c.peopleMin}~${c.peopleMax}명</span><span>${c.hours}시간</span><span>${c.stops.length}곳</span></div>
        <div class="cc-meta"><b class="num">${won(c.total)}</b><span class="per">1인</span><span class="cc-rec">추천 <em class="num">${c.recCount}</em></span></div>
      </div>
    </a>`;
  }
  const courseList = arr => `<div class="group">${arr.map(courseCard).join("")}</div>`;
  function pollThumb(side, p) {
    const o = p[side];
    return o.img ? imgTag(o.img, o.label) : `<span>${esc(o.label)}</span>`;
  }
  function pollCard(p, voted) {
    return `<a class="card poll-card" href="#/poll/${encodeURIComponent(p.id)}">
      <div class="pc-top"><span class="tag">${CATS[p.cat] || ""}</span>${voted ? `<span class="tag done">투표 완료</span>` : `<span class="tag new">투표하기</span>`}</div>
      <h3>${esc(p.question)}</h3>
      <div class="pc-ab"><div class="ab a">${pollThumb("a", p)}</div><i>vs</i><div class="ab b">${pollThumb("b", p)}</div></div>
    </a>`;
  }
  const popular = arr => [...arr].sort((a, b) => b.recCount - a.recCount || b.reviewCount - a.reviewCount || (b.createdAt || 0) - (a.createdAt || 0));
  async function screenHome(t) {
    paint(t, page(header("", { brand: true }) + loadingHtml(), "home"));
    const [courses, polls, votes, feed] = await Promise.all([S.store.listCourses(), S.store.listPolls(), S.store.myVotes(), S.store.listFeed()]);
    const gu = S.profile.gu;
    const strip = visible(feed).slice(0, 8);
    let local = courses.filter(c => c.gu === gu), fallback = false;
    if (!local.length) { local = courses.filter(c => c.gu === LAUNCH_GU); fallback = true; }
    const top = popular(local).slice(0, 3);
    const nextPoll = polls.find(p => !votes[p.id]);
    const f = S.spotFilter || (S.spotFilter = { people: 3, budget: 15000, hours: 4, gu });
    const budgetLabel = (BUDGETS.find(b => b[0] === f.budget) || [0, "예산 자유"])[1];
    const findHref = `#/spot/list?people=${f.people}&budget=${f.budget}&hours=${f.hours}&gu=${encodeURIComponent(f.gu)}`;
    paint(t, page(`
      ${header("", { brand: true, right: `${demoBadge()}<a class="gu-chip" href="#/me/edit">${ic("pin", 15)}${esc(gu)}</a>${bellHtml()}` })}
      <section class="hero">
        <div class="hero-text">
          <p>${esc(S.profile.nickname)}님, 이번 주말엔</p>
          <h2>친구랑<br>어디 갈까?</h2>
        </div>
        <div class="hero-mascot">${mascot("default", 76, { inverse: true })}</div>
        <a class="hero-cond" href="#/spot" aria-label="조건 바꾸기">
          <span><small>인원</small><b class="num">${f.people}명</b></span>
          <span><small>1인 예산</small><b class="num">${budgetLabel === "상관없음" ? "자유" : budgetLabel}</b></span>
          <span><small>시간</small><b class="num">${f.hours ? f.hours + "시간" : "자유"}</b></span>
          ${ic("edit", 16, "hc-edit")}
        </a>
        <a class="btn light block lg" href="${findHref}">이 조건으로 코스 찾기</a>
      </section>
      <section>
        <div class="sec-head"><h2>오늘의 투표</h2><a href="#/style" class="more-link">더보기${ic("chev", 14)}</a></div>
        ${nextPoll ? pollCard(nextPoll, false) : emptyHtml("checkCircle", "모든 투표에 참여했어요", "새 투표가 올라오면 알려드릴게요", `<a class="btn ghost sm" href="#/style/history">내 선택 보기</a>`)}
      </section>
      <section>
        <div class="sec-head"><h2>새 피드</h2><a href="#/feed" class="more-link">전체${ic("chev", 14)}</a></div>
        ${strip.length ? `<div class="strip">${strip.map(p => `<a class="strip-item" href="#/post/${encodeURIComponent(p.id)}">${imgTag(postThumbRef(p), postTitle(p))}<span>${esc(postTitle(p))}</span></a>`).join("")}</div>`
          : emptyHtml("image", "아직 게시물이 없어요", "", `<a class="btn sm" href="#/feed">피드 가기</a>`)}
      </section>
      <section>
        <div class="sec-head"><h2>지금 뜨는 코스</h2><a href="#/spot/list" class="more-link">전체${ic("chev", 14)}</a></div>
        ${fallback ? `<p class="hint">${esc(gu)} 코스는 준비 중이에요. ${esc(LAUNCH_GU)} 코스를 먼저 보여드려요</p>` : ""}
        ${top.length ? courseList(top) : emptyHtml("map", "아직 코스가 없어요", "첫 코스를 제보해주세요")}
      </section>
      <a class="cta-card" href="#/submit"><span class="cta-ic">${ic("send", 20)}</span><div><b>나만 아는 코스가 있어요</b><p class="muted tiny">제보하면 승인 후 모두에게 보여져요</p></div>${ic("chev", 18, "chev")}</a>
    `, "home"));
    syncRewards().then(refreshBell);
  }

  /* =========================================================
     4. SPOT
     ========================================================= */
  const BUDGETS = [[5000, "5천원"], [10000, "1만원"], [15000, "1만5천원"], [20000, "2만원"], [30000, "3만원"], [0, "상관없음"]];
  const HOURS = [[2, "2시간"], [3, "3시간"], [4, "4시간"], [6, "6시간"], [0, "상관없음"]];
  function screenSpot(t) {
    const f = S.spotFilter || (S.spotFilter = { people: 3, budget: 15000, hours: 4, gu: S.profile.gu });
    paint(t, page(`
      ${header("코스")}
      <h1 class="step-title">오늘 친구랑 어디 갈까?</h1>
      <div class="card form-card">
        <div class="field"><span>인원</span>
          <div class="stepper"><button data-p="-1" aria-label="줄이기">${ic("minus", 18)}</button><b id="pv">${f.people}명</b><button data-p="1" aria-label="늘리기">${ic("plus", 18)}</button></div></div>
        <div class="field"><span>1인 예산</span><div class="chips" id="bud">${BUDGETS.map(([v, l]) => `<button class="chip ${f.budget === v ? "on" : ""}" data-v="${v}">${l}</button>`).join("")}</div></div>
        <div class="field"><span>시간</span><div class="chips" id="hrs">${HOURS.map(([v, l]) => `<button class="chip ${f.hours === v ? "on" : ""}" data-v="${v}">${l}</button>`).join("")}</div></div>
        <label class="field"><span>지역</span><select id="gu">${GU_LIST.map(g => `<option ${g === f.gu ? "selected" : ""}>${g}</option>`).join("")}</select></label>
      </div>
      <button class="btn block lg" id="find">코스 찾기</button>
      <div class="row gap center mt"><a class="link" href="#/spot/list">전체 코스 보기</a><span class="muted">·</span><a class="link" href="#/submit">코스 제보하기</a></div>
    `, "spot"), () => {
      $app.querySelectorAll("[data-p]").forEach(b => (b.onclick = () => { f.people = Math.max(1, Math.min(10, f.people + Number(b.dataset.p))); $app.querySelector("#pv").textContent = f.people + "명"; }));
      const pick = (id, key) => $app.querySelectorAll(`#${id} .chip`).forEach(b => (b.onclick = () => { f[key] = Number(b.dataset.v); $app.querySelectorAll(`#${id} .chip`).forEach(x => x.classList.toggle("on", x === b)); }));
      pick("bud", "budget"); pick("hrs", "hours");
      $app.querySelector("#gu").onchange = e => (f.gu = e.target.value);
      $app.querySelector("#find").onclick = () => go(`#/spot/list?people=${f.people}&budget=${f.budget}&hours=${f.hours}&gu=${encodeURIComponent(f.gu)}`);
    });
  }
  async function screenCourseList(t, q) {
    const filtered = !!q.gu;
    const title = filtered ? "추천 코스" : "전체 코스";
    paint(t, page(header(title, { back: true }) + loadingHtml(), "spot"));
    let list = await S.store.listCourses();
    if (filtered) {
      const people = Number(q.people) || 0, budget = Number(q.budget) || 0, hours = Number(q.hours) || 0;
      list = list.filter(c => c.gu === q.gu && (!people || (people >= c.peopleMin && people <= c.peopleMax)) && (!budget || c.total <= budget) && (!hours || c.hours <= hours));
    }
    const sort = q.sort || "rec";
    list = sort === "cheap" ? [...list].sort((a, b) => a.total - b.total) : popular(list);
    const qs = new URLSearchParams(q);
    const link = s => { qs.set("sort", s); return "#/spot/list?" + qs.toString(); };
    const cond = filtered ? `<div class="cond">${esc(q.gu)} · ${q.people}명 · ${Number(q.budget) ? "1인 " + won(q.budget) + " 이하" : "예산 상관없음"} · ${Number(q.hours) ? q.hours + "시간 이내" : "시간 상관없음"}</div>` : "";
    paint(t, page(`
      ${header(title, { back: true })}
      ${cond}
      <div class="seg"><a href="${link("rec")}" class="${sort === "rec" ? "on" : ""}">추천순</a><a href="${link("cheap")}" class="${sort === "cheap" ? "on" : ""}">저렴한 순</a></div>
      ${list.length ? `<p class="list-count">코스 <b class="num">${list.length}</b>개</p>` + courseList(list)
        : emptyHtml("search", "조건에 맞는 코스가 없어요", "예산이나 시간을 조금 늘려보거나, 알고 있는 코스를 제보해주세요",
          `<div class="row gap center"><a class="btn ghost sm" href="#/spot">조건 바꾸기</a><a class="btn sm" href="#/submit">코스 제보</a></div>`)}
    `, "spot"));
  }
  async function screenCourse(t, id) {
    paint(t, page(header("코스", { back: true }) + loadingHtml()));
    const [c, reviews, mine, saves, feed] = await Promise.all([S.store.getCourse(id), S.store.listReviews(id), S.store.myReview(id), S.store.getSaves(), S.store.listFeed()]);
    const photos = visible(feed).filter(p => p.type === "review" && p.courseId === id);
    if (!c) return paint(t, page(header("코스", { back: true }) + emptyHtml("alert", "코스를 찾을 수 없어요", "삭제됐거나 주소가 잘못됐어요", `<a class="btn sm" href="#/spot">코스 찾기로</a>`)));
    let saved = saves.some(s => s.type === "course" && s.id === id);
    const recRate = pct(c.recCount, c.reviewCount);
    paint(t, page(`
      ${header("코스", { back: true, right: `<button class="icon-btn" id="share" aria-label="공유">${ic("share", 22)}</button><button class="icon-btn" id="more" aria-label="더보기">${ic("more", 22)}</button>` })}
      <section class="course-head">
        <p class="muted tiny">${esc(c.gu)} · ${esc(c.area)}</p>
        <h1>${esc(c.title)}</h1>
        <div class="pills"><span>${ic("users", 15)}${c.peopleMin}~${c.peopleMax}명</span><span>${ic("clock", 15)}${c.hours}시간</span><span>${ic("wallet", 15)}1인 ${won(c.total)}</span></div>
        ${c.submittedBy ? `<p class="tiny muted">제보: ${esc(c.submittedBy)}</p>` : ""}
      </section>
      <section class="card">
        <ol class="timeline">${c.stops.map((s, i) => `<li><span class="tl-num">${i + 1}</span><div><b>${esc(s.name)}</b>${s.note ? `<p class="muted tiny">${esc(s.note)}</p>` : ""}</div><span class="tl-cost">${won(s.cost)}</span></li>`).join("")}</ol>
        <div class="total"><span>1인 예상 합계</span><b>${won(c.total)}</b></div>
        ${c.note ? `<p class="tiny muted">${esc(c.note)}</p>` : ""}
      </section>
      <section class="stats card">
        <div><b>${c.reviewCount}</b><span>다녀온 후기</span></div>
        <div><b>${c.reviewCount ? recRate + "%" : "-"}</b><span>추천</span></div>
        <div><b>${c.avgSpent != null ? won(c.avgSpent) : "-"}</b><span>실제 평균 지출</span></div>
      </section>
      <section>
        <div class="sec-head"><h2>사진 후기 <small class="muted">${photos.length}</small></h2><button class="link" id="addphoto">사진 올리기</button></div>
        ${photos.length ? `<div class="strip">${photos.map(p => `<a class="strip-item" href="#/post/${encodeURIComponent(p.id)}">${imgTag(postThumbRef(p), p.courseTitle)}<span>${esc(p.nickname)}</span></a>`).join("")}</div>`
          : `<button class="photo-empty" id="addphoto2">${ic("camera", 22)}<span>다녀온 사진을 첫 번째로 올려주세요</span></button>`}
      </section>
      <section>
        <div class="sec-head"><h2>다녀온 후기</h2></div>
        ${visible(reviews).length ? visible(reviews).map(r => `<div class="review card">
            <div class="rv-top"><a href="#/u/${encodeURIComponent(r.uid)}"><b>${esc(r.nickname)}</b></a><span class="rec-pill ${r.recommend ? "yes" : "no"}">${r.recommend ? "추천" : "비추천"}</span></div>
            <p>${esc(r.text)}</p>
            <div class="rv-meta muted tiny"><span>실제 지출 ${won(r.spent)}</span><span>${esc(r.date || "")}</span>${r.uid !== S.user.uid ? `<button class="link tiny" data-rep="${esc(r.uid)}">신고</button>` : ""}</div>
          </div>`).join("") : emptyHtml("edit", "아직 후기가 없어요", "다녀왔다면 첫 후기를 남겨주세요")}
      </section>
      <div class="action-bar"><button class="save-btn ${saved ? "on" : ""}" id="save" aria-label="저장">${ic("bookmark", 24)}<span>저장</span></button><button class="btn lg grow" id="rev">${mine ? "내 후기 수정하기" : "다녀왔어요, 후기 쓰기"}</button></div>
    `, null, true), () => {
      $app.querySelector("#save").onclick = async e => {
        const b = e.currentTarget; b.disabled = true;
        try { saved = await S.store.toggleSave("course", id); b.classList.toggle("on", saved); toast(saved ? "저장했어요" : "저장을 취소했어요"); } catch (er) { toast("저장에 실패했어요"); }
        b.disabled = false;
      };
      $app.querySelector("#share").onclick = () => share(c.title, "#/course/" + encodeURIComponent(id));
      $app.querySelector("#rev").onclick = () => go(`#/course/${encodeURIComponent(id)}/review`);
      ["#addphoto", "#addphoto2"].forEach(sel => { const b = $app.querySelector(sel); if (b) b.onclick = () => go("#/post/new/review?course=" + encodeURIComponent(id)); });
      $app.querySelector("#more").onclick = () => {
        const el = openModal(`<button class="choice" id="rc">이 코스 신고하기</button><button class="btn ghost block" data-act="close-modal">닫기</button>`);
        el.querySelector("#rc").onclick = () => reportSheet("course", id, { title: c.title });
      };
      $app.querySelectorAll("[data-rep]").forEach(b => (b.onclick = () => reportSheet("review", id + "/" + b.dataset.rep, { cid: id, uid: b.dataset.rep, title: c.title })));
    });
  }
  async function screenReviewForm(t, id) {
    paint(t, page(header("후기 쓰기", { back: true }) + loadingHtml()));
    const [c, mine] = await Promise.all([S.store.getCourse(id), S.store.myReview(id)]);
    if (!c) return go("#/spot");
    const today = new Date().toISOString().slice(0, 10);
    let rec = mine ? mine.recommend : null;
    paint(t, page(`
      ${header(mine ? "후기 수정" : "후기 쓰기", { back: true })}
      <p class="muted">${esc(c.title)}</p>
      <label class="field"><span>다녀온 날짜</span><input type="date" id="date" max="${today}" value="${esc(mine ? mine.date : today)}"></label>
      <label class="field"><span>1인 실제 지출 (원)</span><input type="number" id="spent" inputmode="numeric" min="0" step="500" placeholder="예상 ${c.total}" value="${mine ? mine.spent : ""}"></label>
      <div class="field"><span>친구들한테 추천해요?</span><div class="row gap"><button class="choice grow ${rec === true ? "on" : ""}" data-rec="1">${ic("up", 18)} 추천</button><button class="choice grow ${rec === false ? "on" : ""}" data-rec="0">${ic("down", 18)} 비추천</button></div></div>
      <label class="field"><span>한 줄 후기 <small class="muted" id="cnt">0/100</small></span><textarea id="text" maxlength="100" rows="3" placeholder="좋았던 점, 바뀐 가격, 꿀팁">${esc(mine ? mine.text : "")}</textarea></label>
      <p class="tiny muted">친구 이름, 학교, 연락처는 쓰지 말아주세요</p>
      <div class="bottom-cta">${mine ? `<button class="link block warn" id="del">후기 삭제</button>` : ""}<button class="btn block lg" id="ok">${mine ? "수정 완료" : "후기 남기기"}</button></div>
    `), () => {
      const tx = $app.querySelector("#text"), cnt = $app.querySelector("#cnt");
      const upd = () => (cnt.textContent = tx.value.length + "/100"); tx.oninput = upd; upd();
      $app.querySelectorAll("[data-rec]").forEach(b => (b.onclick = () => { rec = b.dataset.rec === "1"; $app.querySelectorAll("[data-rec]").forEach(x => x.classList.toggle("on", x === b)); }));
      $app.querySelector("#ok").onclick = async e => {
        const date = $app.querySelector("#date").value, spentRaw = $app.querySelector("#spent").value, text = tx.value.trim();
        if (!date) return toast("다녀온 날짜를 골라주세요");
        if (spentRaw === "" || Number(spentRaw) < 0) return toast("실제 지출을 입력해주세요");
        if (rec === null) return toast("추천 여부를 골라주세요");
        if (text.length < 5) return toast("한 줄 후기를 5자 이상 써주세요");
        e.currentTarget.disabled = true;
        try { await S.store.saveReview(id, { date, spent: Math.round(Number(spentRaw)), recommend: rec, text }); const got = mine ? 0 : await award("review", id); toast(got ? `후기를 남겼어요 +${got}P` : "후기를 남겼어요"); back(); }
        catch (er) { toast("저장에 실패했어요"); e.currentTarget.disabled = false; }
      };
      const del = $app.querySelector("#del");
      if (del) del.onclick = async () => { if (await confirmSheet("후기를 삭제할까요?", "삭제하면 되돌릴 수 없어요", "삭제", true)) { await S.store.deleteReview(id); toast("삭제했어요"); back(); } };
    });
  }

  /* 코스 폼 (제보·관리자 공용) */
  function courseFormHtml(c) {
    c = c || { gu: S.profile.gu === LAUNCH_GU ? LAUNCH_GU : S.profile.gu, peopleMin: 2, peopleMax: 4, hours: 3, stops: [{ name: "", cost: 0, note: "" }, { name: "", cost: 0, note: "" }] };
    return `
      <label class="field"><span>코스 이름</span><input id="f-title" maxlength="30" placeholder="예: 신촌 노래방 코스" value="${esc(c.title || "")}"></label>
      <div class="row gap">
        <label class="field grow"><span>구</span><select id="f-gu">${GU_LIST.map(g => `<option ${g === c.gu ? "selected" : ""}>${g}</option>`).join("")}</select></label>
        <label class="field grow"><span>동네</span><input id="f-area" maxlength="10" placeholder="예: 신촌" value="${esc(c.area || "")}"></label>
      </div>
      <div class="row gap">
        <label class="field grow"><span>최소 인원</span><input id="f-pmin" type="number" min="1" max="10" value="${c.peopleMin}"></label>
        <label class="field grow"><span>최대 인원</span><input id="f-pmax" type="number" min="1" max="10" value="${c.peopleMax}"></label>
        <label class="field grow"><span>시간</span><input id="f-hours" type="number" min="1" max="12" value="${c.hours}"></label>
      </div>
      <div class="field"><span>장소 (순서대로, 비용은 1인 기준)</span><div id="stops"></div>
        <button class="btn ghost sm" id="add-stop">+ 장소 추가</button></div>
      <div class="total"><span>1인 예상 합계</span><b id="f-total">0원</b></div>
      <label class="field"><span>메모 (선택)</span><input id="f-note" maxlength="40" placeholder="예: 주말엔 사람이 많아요" value="${esc(c.note || "")}"></label>`;
  }
  function bindCourseForm(c) {
    let stops = (c && c.stops ? c.stops : [{ name: "", cost: 0, note: "" }, { name: "", cost: 0, note: "" }]).map(s => ({ name: s.name, cost: s.cost, note: s.note || "" }));
    const box = $app.querySelector("#stops"), tot = $app.querySelector("#f-total");
    const draw = () => {
      box.innerHTML = stops.map((s, i) => `<div class="stop-row" data-i="${i}">
        <span class="stop-n">${i + 1}</span>
        <input data-k="name" maxlength="25" placeholder="장소 이름" value="${esc(s.name)}">
        <input data-k="cost" type="number" min="0" step="500" inputmode="numeric" placeholder="비용" value="${s.cost || ""}">
        <button class="icon-btn sm" data-del="${i}" aria-label="삭제">${ic("x", 16)}</button>
        <input data-k="note" class="full" maxlength="30" placeholder="한 줄 팁 (선택)" value="${esc(s.note || "")}">
      </div>`).join("");
      box.querySelectorAll("[data-k]").forEach(inp => (inp.oninput = inp.onchange = () => {
        const i = Number(inp.closest(".stop-row").dataset.i); stops[i][inp.dataset.k] = inp.dataset.k === "cost" ? Number(inp.value) || 0 : inp.value; sum();
      }));
      box.querySelectorAll("[data-del]").forEach(b => (b.onclick = e => { e.preventDefault(); if (stops.length > 1) { stops.splice(Number(b.dataset.del), 1); draw(); } }));
      sum();
    };
    const sum = () => (tot.textContent = won(stops.reduce((s, x) => s + (Number(x.cost) || 0), 0)));
    $app.querySelector("#add-stop").onclick = e => { e.preventDefault(); if (stops.length >= 8) return toast("장소는 8개까지 넣을 수 있어요"); stops.push({ name: "", cost: 0, note: "" }); draw(); };
    draw();
    return () => {
      const v = id => $app.querySelector(id).value.trim();
      const out = { title: v("#f-title"), gu: v("#f-gu"), area: v("#f-area"), peopleMin: Number(v("#f-pmin")), peopleMax: Number(v("#f-pmax")), hours: Number(v("#f-hours")), note: v("#f-note"), stops: stops.filter(s => s.name.trim()).map(s => ({ ...s, name: s.name.trim() })) };
      if (out.title.length < 2) return [null, "코스 이름을 입력해주세요"];
      if (!out.area) return [null, "동네를 입력해주세요"];
      if (!(out.peopleMin >= 1 && out.peopleMax >= out.peopleMin)) return [null, "인원을 확인해주세요"];
      if (!(out.hours >= 1)) return [null, "시간을 확인해주세요"];
      if (out.stops.length < 2) return [null, "장소를 2곳 이상 넣어주세요"];
      return [out, ""];
    };
  }
  function screenSubmit(t) {
    paint(t, page(`
      ${header("코스 제보", { back: true })}
      <p class="muted">친구들이랑 직접 가본 코스를 알려주세요. 운영자 확인 후 공개돼요</p>
      ${courseFormHtml()}
      <p class="tiny muted">광고·홍보 목적의 제보는 공개되지 않아요</p>
      <div class="bottom-cta"><button class="btn block lg" id="ok">제보하기</button></div>
    `), () => {
      const read = bindCourseForm();
      $app.querySelector("#ok").onclick = async e => {
        const [c, err] = read(); if (err) return toast(err);
        e.currentTarget.disabled = true;
        try { await S.store.submitCourse(c); go("#/submit/done"); }
        catch (er) { toast("제보에 실패했어요"); e.currentTarget.disabled = false; }
      };
    });
  }
  function screenSubmitDone(t) {
    paint(t, `<div class="center-screen">${mascot("happy", 92)}<h2>제보가 접수됐어요</h2><p class="muted">운영자 확인 후 공개되면 마이 > 내 제보에서 확인할 수 있어요</p>
      <div class="row gap center"><a class="btn ghost" href="#/me">내 제보 보기</a><a class="btn" href="#/home">홈으로</a></div></div>`);
  }

  /* =========================================================
     5. STYLE
     ========================================================= */
  async function screenStyle(t, q) {
    const cat = q.cat || "all";
    paint(t, page(header("스타일") + loadingHtml(), "style"));
    const [polls, votes] = await Promise.all([S.store.listPolls(), S.store.myVotes()]);
    const list = polls.filter(p => cat === "all" || p.cat === cat);
    list.sort((a, b) => (votes[a.id] ? 1 : 0) - (votes[b.id] ? 1 : 0));
    paint(t, page(`
      ${header("스타일", { right: `<a class="link" href="#/style/history">내 선택</a>` })}
      <p class="muted">사람이 아니라 선택지를 골라요. 결과는 투표 후에 볼 수 있어요</p>
      <div class="seg">${[["all", "전체"], ...Object.entries(CATS)].map(([k, l]) => `<a href="#/style?cat=${k}" class="${cat === k ? "on" : ""}">${l}</a>`).join("")}</div>
      ${list.length ? list.map(p => pollCard(p, !!votes[p.id])).join("") : emptyHtml("vote", "아직 투표가 없어요", "곧 새 투표가 올라와요")}
    `, "style"));
  }
  async function screenPoll(t, id) {
    paint(t, page(header("투표", { back: true }) + loadingHtml(), "style"));
    const [polls, votes, saves] = await Promise.all([S.store.listPolls(), S.store.myVotes(), S.store.getSaves()]);
    const p = polls.find(x => x.id === id);
    if (!p) return paint(t, page(header("투표", { back: true }) + emptyHtml("alert", "투표를 찾을 수 없어요", "", `<a class="btn sm" href="#/style">스타일로</a>`), "style"));
    let saved = saves.some(s => s.type === "poll" && s.id === id);
    const mine = votes[id];
    const next = polls.find(x => x.id !== id && !votes[x.id]);
    const right = `<button class="icon-btn bm ${saved ? "on" : ""}" id="save" aria-label="저장">${ic("bookmark", 22)}</button><button class="icon-btn" id="more" aria-label="더보기">${ic("more", 22)}</button>`;
    const bindCommon = () => {
      $app.querySelector("#save").onclick = async e => {
        try { saved = await S.store.toggleSave("poll", id); e.currentTarget.classList.toggle("on", saved); toast(saved ? "저장했어요" : "저장을 취소했어요"); } catch (er) { toast("저장에 실패했어요"); }
      };
      $app.querySelector("#more").onclick = () => {
        const el = openModal(`<button class="choice" id="sh">공유하기</button><button class="choice" id="rp">이 투표 신고하기</button><button class="btn ghost block" data-act="close-modal">닫기</button>`);
        el.querySelector("#sh").onclick = () => { closeModal(); share(p.question, "#/poll/" + encodeURIComponent(id)); };
        el.querySelector("#rp").onclick = () => reportSheet("poll", id, { title: p.question });
      };
    };
    if (!mine) {
      paint(t, page(`
        ${header(CATS[p.cat] || "투표", { back: true, right })}
        <h1 class="poll-q">${esc(p.question)}</h1>
        <div class="vote-ab">
          <button class="vote-opt a" data-v="a">${pollThumb("a", p)}<b>${esc(p.a.label)}</b></button>
          <button class="vote-opt b" data-v="b">${pollThumb("b", p)}<b>${esc(p.b.label)}</b></button>
        </div>
        <p class="tiny muted center">한 번 고르면 바꿀 수 없어요</p>
      `, "style"), () => {
        bindCommon();
        $app.querySelectorAll("[data-v]").forEach(b => (b.onclick = async () => {
          $app.querySelectorAll("[data-v]").forEach(x => (x.disabled = true)); b.classList.add("picked");
          try { await S.store.vote(id, b.dataset.v); const got = await award("vote", id); if (got) toast(`투표 완료 +${got}P`); render(); } catch (e) { toast("투표에 실패했어요"); $app.querySelectorAll("[data-v]").forEach(x => (x.disabled = false)); }
        }));
      });
      return;
    }
    const r = await S.store.pollResult(id);
    const total = r.a + r.b, pa = pct(r.a, total), pb = total ? 100 - pa : 0;
    const win = r.a === r.b ? null : r.a > r.b ? "a" : "b";
    paint(t, page(`
      ${header(CATS[p.cat] || "투표", { back: true, right })}
      <h1 class="poll-q">${esc(p.question)}</h1>
      <div class="result card">
        ${["a", "b"].map(k => `<div class="res-row ${mine === k ? "mine" : ""}">
          <div class="res-thumb ${k}">${pollThumb(k, p)}</div>
          <div class="grow"><div class="res-label"><b>${esc(p[k].label)}</b>${mine === k ? `<span class="tag">내 선택</span>` : ""}<span class="res-pct">${k === "a" ? pa : pb}%</span></div>
          <div class="bar"><i class="${k}" style="width:${k === "a" ? pa : pb}%"></i></div></div></div>`).join("")}
        <p class="center muted">또래 <b>${total.toLocaleString("ko-KR")}명</b>이 투표했어요</p>
        <p class="center">${win === null ? "의견이 딱 반반이에요" : win === mine ? "다수와 같은 선택이에요" : "소수의 취향을 골랐어요"}</p>
      </div>
      ${next ? `<a class="btn block lg" href="#/poll/${encodeURIComponent(next.id)}">다음 투표</a>` : `<a class="btn block lg" href="#/style">스타일로 돌아가기</a>`}
    `, "style"), bindCommon);
  }
  async function screenStyleHistory(t) {
    paint(t, page(header("내 선택 기록", { back: true }) + loadingHtml(), "style"));
    const [polls, votes] = await Promise.all([S.store.listPolls(), S.store.myVotes()]);
    const mine = polls.filter(p => votes[p.id]);
    const counts = {}; mine.forEach(p => (counts[p.cat] = (counts[p.cat] || 0) + 1));
    paint(t, page(`
      ${header("내 선택 기록", { back: true })}
      ${mine.length ? `<div class="stats card">${Object.entries(CATS).map(([k, l]) => `<div><b>${counts[k] || 0}</b><span>${l}</span></div>`).join("")}</div>
        ${mine.map(p => `<a class="card hist" href="#/poll/${encodeURIComponent(p.id)}"><span class="tag">${CATS[p.cat]}</span><div class="grow"><b>${esc(p.question)}</b><p class="muted tiny">내 선택: ${esc(p[votes[p.id]].label)}</p></div>${ic("chev", 18, "chev")}</a>`).join("")}`
        : emptyHtml("vote", "아직 참여한 투표가 없어요", "", `<a class="btn sm" href="#/style">투표하러 가기</a>`)}
    `, "style"));
  }

  /* =========================================================
     피드 · 사진 업로드
     ========================================================= */
  const PRAISE = {
    vote: [["fit", "잘 어울려"], ["try", "따라 해볼래"], ["sense", "센스 있어"]],
    review: [["go", "가보고 싶어"], ["tip", "꿀팁 고마워"], ["pic", "사진 맛집"]]
  };
  const ago = t => {
    const s = (Date.now() - t) / 1000;
    if (s < 60) return "방금";
    if (s < 3600) return Math.floor(s / 60) + "분 전";
    if (s < 86400) return Math.floor(s / 3600) + "시간 전";
    if (s < 86400 * 7) return Math.floor(s / 86400) + "일 전";
    return fmtDate(t);
  };
  const postThumbRef = p => (p.type === "vote" ? p.a && p.a.img : (p.images || [])[0]) || "";
  const postTitle = p => (p.type === "vote" ? p.question : p.courseTitle) || "게시물";
  const IMG_LIMIT = () => (S.store.mode === "demo" ? { w: 640, chars: 110000 } : { w: 960, chars: 280000 });

  async function feedContext(posts) {
    const [votes, saves] = await Promise.all([S.store.myVotes(), S.store.getSaves()]);
    const results = {};
    await Promise.all(posts.filter(p => p.type === "vote" && p.pollId && votes[p.pollId]).map(async p => { results[p.pollId] = await S.store.pollResult(p.pollId); }));
    const pubs = await S.store.getPublicProfiles([...new Set(posts.map(p => p.uid))]);
    return { votes, results, pubs, saved: new Set(saves.filter(s => s.type === "post").map(s => s.id)) };
  }
  function voteAreaHtml(p, mine, r) {
    if (!mine || !r) {
      return `<div class="pv-grid">${["a", "b"].map(k => `<button class="pv-opt" data-pick="${k}" aria-label="${esc(p[k].label)} 선택">${imgTag(p[k].img, p[k].label)}<span class="pv-label">${esc(p[k].label)}</span></button>`).join("")}</div>
        <p class="pv-hint">마음에 드는 쪽을 눌러 투표해요</p>`;
    }
    const total = r.a + r.b, pa = pct(r.a, total), pb = total ? 100 - pa : 0;
    return `<div class="pv-grid done">${["a", "b"].map(k => { const v = k === "a" ? pa : pb; return `<div class="pv-opt ${mine === k ? "mine" : ""}">${imgTag(p[k].img, p[k].label)}<div class="pv-res"><b>${v}%</b><span>${esc(p[k].label)}${mine === k ? " · 내 선택" : ""}</span></div></div>`; }).join("")}</div>
      <p class="pv-hint">또래 ${total.toLocaleString("ko-KR")}명 참여</p>`;
  }
  function feedCard(p, ctx) {
    const isVote = p.type === "vote";
    const mine = isVote && p.pollId ? ctx.votes[p.pollId] : null;
    const body = isVote
      ? `<p class="post-q">${esc(p.question)}</p><div class="pv" data-poll="${esc(p.pollId || "")}">${voteAreaHtml(p, mine, ctx.results[p.pollId])}</div>`
      : `<div class="carousel"><div class="track">${(p.images || []).map(ref => `<div class="slide">${imgTag(ref, p.courseTitle)}</div>`).join("")}</div>${(p.images || []).length > 1 ? `<div class="cdots">${p.images.map((_, i) => `<i class="${i ? "" : "on"}"></i>`).join("")}</div>` : ""}</div>
         ${p.courseId ? `<a class="course-chip" href="#/course/${encodeURIComponent(p.courseId)}">${ic("pin", 15)}<span>${esc(p.courseTitle)}</span>${ic("chev", 15)}</a>` : ""}`;
    return `<article class="post" data-pid="${esc(p.id)}">
      <header class="post-head"><a class="post-author" href="#/u/${encodeURIComponent(p.uid)}">${avatarHtml(ctx.pubs[p.uid], 36)}
        <div class="grow"><div class="name-line">${authorLine(ctx.pubs[p.uid], p.nickname)}</div><p class="muted tiny">${isVote ? (CATS[p.cat] || "스타일") + " 투표" : "코스 후기"} · ${ago(p.approvedAt || p.createdAt)}</p></div></a>
        <button class="icon-btn" data-more aria-label="더보기">${ic("more", 20)}</button></header>
      ${body}
      ${p.text ? `<p class="post-text">${esc(p.text)}</p>` : ""}
      <footer class="post-actions">
        <button class="like ${p.myLike ? "on" : ""}" data-like aria-label="좋아요">${ic("heart", 24)}<span>${p.likes || 0}</span></button>
        <button class="icon-btn bm ${ctx.saved.has(p.id) ? "on" : ""}" data-save aria-label="저장">${ic("bookmark", 22)}</button>
      </footer>
      <div class="praise">${(PRAISE[p.type] || []).map(([k, l]) => `<button class="pchip ${p.myPraise === k ? "on" : ""}" data-praise="${k}">${l}<em>${(p.praise || {})[k] || 0}</em></button>`).join("")}</div>
    </article>`;
  }
  function bindFeed(posts, ctx) {
    const byId = Object.fromEntries(posts.map(p => [p.id, p]));
    $app.querySelectorAll("article.post").forEach(el => {
      const p = byId[el.dataset.pid]; if (!p) return;
      const likeBtn = el.querySelector("[data-like]");
      likeBtn.onclick = async () => {
        const on = !p.myLike; p.myLike = on; p.likes = (p.likes || 0) + (on ? 1 : -1);
        likeBtn.classList.toggle("on", on); likeBtn.querySelector("span").textContent = p.likes;
        try { await S.store.react(p.id, { like: on }); } catch (e) { toast("반영에 실패했어요"); }
      };
      el.querySelectorAll("[data-praise]").forEach(b => (b.onclick = async () => {
        const k = b.dataset.praise, prev = p.myPraise, next = prev === k ? null : k;
        p.praise = { ...(p.praise || {}) };
        if (prev) p.praise[prev] = Math.max(0, (p.praise[prev] || 1) - 1);
        if (next) p.praise[next] = (p.praise[next] || 0) + 1;
        p.myPraise = next;
        el.querySelectorAll("[data-praise]").forEach(x => { x.classList.toggle("on", x.dataset.praise === next); x.querySelector("em").textContent = p.praise[x.dataset.praise] || 0; });
        try { await S.store.react(p.id, { praise: next }); } catch (e) { toast("반영에 실패했어요"); }
      }));
      const sv = el.querySelector("[data-save]");
      sv.onclick = async () => {
        try { const on = await S.store.toggleSave("post", p.id); sv.classList.toggle("on", on); toast(on ? "저장했어요" : "저장을 취소했어요"); } catch (e) { toast("저장에 실패했어요"); }
      };
      el.querySelector("[data-more]").onclick = () => {
        const own = p.uid === S.user.uid;
        const sh = openModal(`<button class="choice" data-m="share">${ic("share", 18)} 공유하기</button>
          ${own ? `<button class="choice warn" data-m="del">${ic("x", 18)} 게시물 삭제</button>` : `<button class="choice" data-m="report">${ic("flag", 18)} 신고하기</button><button class="choice warn" data-m="block">${ic("block", 18)} 이 사용자 차단하기</button>`}
          <button class="btn ghost block" data-act="close-modal">닫기</button>`);
        sh.querySelector('[data-m="share"]').onclick = () => { closeModal(); share(postTitle(p), "#/post/" + encodeURIComponent(p.id)); };
        const rp = sh.querySelector('[data-m="report"]');
        if (rp) rp.onclick = () => reportSheet("post", p.id, { title: postTitle(p) });
        const bk = sh.querySelector('[data-m="block"]');
        if (bk) bk.onclick = async () => { closeModal(); if (await blockFlow(p.uid, (ctx.pubs[p.uid] || {}).nickname || p.nickname)) render(); };
        const dl = sh.querySelector('[data-m="del"]');
        if (dl) dl.onclick = async () => {
          closeModal();
          if (!(await confirmSheet("게시물을 삭제할까요?", "사진과 받은 반응이 모두 지워져요", "삭제", true))) return;
          try { await S.store.deletePost(p.id); toast("삭제했어요"); render(); } catch (e) { toast("삭제에 실패했어요"); }
        };
      };
      const pv = el.querySelector(".pv");
      if (pv) pv.querySelectorAll("[data-pick]").forEach(b => (b.onclick = async () => {
        if (!p.pollId) return;
        const choice = b.dataset.pick;
        pv.querySelectorAll("[data-pick]").forEach(x => (x.disabled = true)); b.classList.add("picked");
        try {
          await S.store.vote(p.pollId, choice);
          award("vote", p.pollId).then(got => { if (got) toast(`투표 완료 +${got}P`); });
          ctx.votes[p.pollId] = choice;
          const r = await S.store.pollResult(p.pollId);
          pv.innerHTML = voteAreaHtml(p, choice, r); hydrateImages(pv);
        } catch (e) { toast("투표에 실패했어요"); pv.querySelectorAll("[data-pick]").forEach(x => (x.disabled = false)); }
      }));
      const track = el.querySelector(".track"), dots = el.querySelectorAll(".cdots i");
      if (track && dots.length) track.addEventListener("scroll", () => {
        const i = Math.round(track.scrollLeft / track.clientWidth);
        dots.forEach((d, k) => d.classList.toggle("on", k === i));
      }, { passive: true });
    });
  }
  function uploadSheet(courseId) {
    const el = openModal(`<h3>무엇을 올릴까요?</h3><p class="muted">올린 게시물은 운영자 확인 후 피드에 공개돼요</p>
      <div class="list-choice">
        <button class="choice tall" data-u="vote"><span class="cta-ic">${ic("vote", 20)}</span><div><b>스타일 투표</b><p class="muted tiny">사진 2장으로 A/B 투표 받기</p></div></button>
        <button class="choice tall" data-u="review"><span class="cta-ic">${ic("camera", 20)}</span><div><b>코스 사진 후기</b><p class="muted tiny">다녀온 코스 사진 최대 4장</p></div></button>
      </div>
      <button class="btn ghost block" data-act="close-modal">닫기</button>`);
    el.querySelector('[data-u="vote"]').onclick = () => { closeModal(); go("#/post/new/vote"); };
    el.querySelector('[data-u="review"]').onclick = () => { closeModal(); go("#/post/new/review" + (courseId ? "?course=" + encodeURIComponent(courseId) : "")); };
  }
  async function screenFeed(t, q) {
    const f = ["vote", "review"].includes(q.f) ? q.f : "all";
    const right = `<button class="icon-btn" id="up" aria-label="게시물 올리기">${ic("plus", 24)}</button>`;
    paint(t, page(header("피드", { right }) + loadingHtml(), "feed"));
    const all = visible(await S.store.listFeed());
    const posts = all.filter(p => f === "all" || p.type === f);
    const ctx = await feedContext(posts);
    paint(t, page(`
      ${header("피드", { right })}
      <div class="seg">${[["all", "전체"], ["vote", "투표"], ["review", "코스 후기"]].map(([k, l]) => `<a href="#/feed?f=${k}" class="${f === k ? "on" : ""}">${l}</a>`).join("")}</div>
      ${posts.length ? `<div class="feed">${posts.map(p => feedCard(p, ctx)).join("")}</div><p class="tiny muted center feed-end">모든 게시물을 봤어요</p>`
        : emptyHtml("image", "아직 게시물이 없어요", "첫 사진을 올려보세요", `<button class="btn sm" id="up2">게시물 올리기</button>`)}
    `, "feed"), () => {
      $app.querySelector("#up").onclick = () => uploadSheet();
      const u2 = $app.querySelector("#up2"); if (u2) u2.onclick = () => uploadSheet();
      bindFeed(posts, ctx);
    });
  }
  async function screenPost(t, id) {
    paint(t, page(header("게시물", { back: true }) + loadingHtml()));
    let p = visible(await S.store.listFeed()).find(x => x.id === id);
    let pending = false;
    if (!p) { p = (await S.store.myPosts()).find(x => x.id === id); pending = !!p; }
    if (!p && S.admin) { p = (await S.store.listPosts()).find(x => x.id === id); pending = !!p; }
    if (!p) return paint(t, page(header("게시물", { back: true }) + emptyHtml("alert", "게시물을 찾을 수 없어요", "삭제됐거나 아직 공개되지 않았어요", `<a class="btn sm" href="#/feed">피드로</a>`)));
    const ctx = await feedContext([p]);
    const st = STATUS[p.status] || STATUS.pending;
    paint(t, page(`
      ${header("게시물", { back: true })}
      ${pending && p.status !== "approved" ? `<p class="hint ${p.status === "rejected" ? "hint-warn" : ""}">${p.status === "rejected" ? `<b>공개되지 않았어요</b><br>${esc(rejectNote(p))}. 내용을 바꿔서 다시 올릴 수 있어요` : "검토 중이에요. 운영자 확인 후 피드에 공개돼요"}</p>` : ""}
      <div class="feed">${feedCard(p, ctx)}</div>
    `), () => bindFeed([p], ctx));
  }

  function photoRules() {
    return `<label class="check notice"><input type="checkbox" id="rule"><span>얼굴, 이름, 학교, 교복이 나오지 않는 사진이에요</span></label>
      <p class="tiny muted">얼굴이 나오거나 가이드라인에 맞지 않으면 공개되지 않아요. 사진 속 위치 정보는 자동으로 지워져요</p>`;
  }
  function bindPicker(input, ratio, onPicked) {
    input.onchange = async () => {
      const files = [...input.files]; input.value = "";
      for (const f of files) {
        try { const lim = IMG_LIMIT(); onPicked(await window.TSMedia.compress(f, ratio, lim.w, lim.chars)); }
        catch (e) { toast(e.message); }
      }
    };
  }
  function screenNewVote(t) {
    const st = { cat: "outfit", a: null, b: null };
    paint(t, page(`
      ${header("스타일 투표 올리기", { back: true })}
      <div class="field"><span>카테고리</span><div class="chips" id="cat">${Object.entries(CATS).map(([k, l]) => `<button class="chip ${k === st.cat ? "on" : ""}" data-v="${k}">${l}</button>`).join("")}</div></div>
      <label class="field"><span>질문</span><input id="qq" maxlength="30" placeholder="예: 이 니트엔 어떤 바지?"></label>
      <div class="field"><span>사진 2장 (3:4로 잘려요)</span>
        <div class="slot-grid">${["a", "b"].map(k => `<div class="slot-col"><button class="slot" id="slot-${k}" aria-label="${k.toUpperCase()} 사진 고르기"><span class="slot-empty">${ic("image", 26)}<b>${k.toUpperCase()} 사진</b></span></button>
          <input type="file" accept="image/*" id="file-${k}" hidden>
          <input id="label-${k}" maxlength="15" placeholder="${k.toUpperCase()} 이름 (예: ${k === "a" ? "와이드 데님" : "카고 팬츠"})"></div>`).join("")}</div></div>
      <label class="field"><span>한 줄 설명 (선택) <small class="muted" id="cnt">0/100</small></span><textarea id="text" rows="2" maxlength="100" placeholder="어떤 상황에 입을 옷인지 알려주면 투표하기 쉬워요"></textarea></label>
      ${photoRules()}
      <div class="bottom-cta"><button class="btn block lg" id="ok">올리기</button></div>
    `), () => {
      $app.querySelectorAll("#cat .chip").forEach(b => (b.onclick = () => { st.cat = b.dataset.v; $app.querySelectorAll("#cat .chip").forEach(x => x.classList.toggle("on", x === b)); }));
      ["a", "b"].forEach(k => {
        const slot = $app.querySelector("#slot-" + k), file = $app.querySelector("#file-" + k);
        slot.onclick = () => file.click();
        bindPicker(file, 0.75, data => { st[k] = data; slot.innerHTML = `<img src="${data}" alt="">`; slot.classList.add("filled"); });
      });
      const tx = $app.querySelector("#text"), cnt = $app.querySelector("#cnt");
      tx.oninput = () => (cnt.textContent = tx.value.length + "/100");
      $app.querySelector("#ok").onclick = async e => {
        const question = $app.querySelector("#qq").value.trim(), la = $app.querySelector("#label-a").value.trim(), lb = $app.querySelector("#label-b").value.trim();
        if (question.length < 3) return toast("질문을 입력해주세요");
        if (!st.a || !st.b) return toast("사진을 2장 모두 골라주세요");
        if (!la || !lb) return toast("A, B 이름을 입력해주세요");
        if (!$app.querySelector("#rule").checked) return toast("사진 확인에 체크해주세요");
        const btn = e.currentTarget; btn.disabled = true; btn.textContent = "올리는 중...";
        try {
          const [ra, rb] = [await S.store.uploadImage(st.a), await S.store.uploadImage(st.b)];
          await S.store.createPost({ type: "vote", cat: st.cat, question, text: tx.value.trim(), a: { label: la, img: ra }, b: { label: lb, img: rb } });
          go("#/post/done");
        } catch (er) { toast(er.message || "올리기에 실패했어요"); btn.disabled = false; btn.textContent = "올리기"; }
      };
    });
  }
  async function screenNewReview(t, q) {
    paint(t, page(header("코스 사진 후기", { back: true }) + loadingHtml()));
    const courses = (await S.store.listCourses()).sort((a, b) => a.title.localeCompare(b.title, "ko"));
    const st = { images: [] };
    paint(t, page(`
      ${header("코스 사진 후기", { back: true })}
      <label class="field"><span>다녀온 코스</span><select id="course"><option value="">코스 선택</option>${courses.map(c => `<option value="${esc(c.id)}" ${c.id === q.course ? "selected" : ""}>${esc(c.title)} · ${esc(c.area)}</option>`).join("")}</select></label>
      <div class="field"><span>사진 (최대 4장, 4:5로 잘려요) <small class="muted" id="pc">0/4</small></span>
        <div class="photo-grid" id="photos"></div><input type="file" accept="image/*" multiple id="file" hidden></div>
      <label class="field"><span>한 줄 후기 <small class="muted" id="cnt">0/100</small></span><textarea id="text" rows="3" maxlength="100" placeholder="분위기, 꿀팁, 바뀐 가격"></textarea></label>
      ${photoRules()}
      <div class="bottom-cta"><button class="btn block lg" id="ok">올리기</button></div>
    `), () => {
      const box = $app.querySelector("#photos"), file = $app.querySelector("#file"), pc = $app.querySelector("#pc");
      const draw = () => {
        box.innerHTML = st.images.map((d, i) => `<div class="ph"><img src="${d}" alt=""><button class="ph-x" data-x="${i}" aria-label="사진 빼기">${ic("x", 14)}</button>${i === 0 ? `<span class="ph-cover">대표</span>` : ""}</div>`).join("")
          + (st.images.length < 4 ? `<button class="ph add" id="add" aria-label="사진 추가">${ic("plus", 22)}</button>` : "");
        pc.textContent = st.images.length + "/4";
        box.querySelectorAll("[data-x]").forEach(b => (b.onclick = () => { st.images.splice(Number(b.dataset.x), 1); draw(); }));
        const add = box.querySelector("#add"); if (add) add.onclick = () => file.click();
      };
      bindPicker(file, 0.8, data => { if (st.images.length < 4) { st.images.push(data); draw(); } else toast("사진은 4장까지 올릴 수 있어요"); });
      draw();
      const tx = $app.querySelector("#text"), cnt = $app.querySelector("#cnt");
      tx.oninput = () => (cnt.textContent = tx.value.length + "/100");
      $app.querySelector("#ok").onclick = async e => {
        const cid = $app.querySelector("#course").value, c = courses.find(x => x.id === cid), text = tx.value.trim();
        if (!c) return toast("다녀온 코스를 골라주세요");
        if (!st.images.length) return toast("사진을 1장 이상 골라주세요");
        if (text.length < 5) return toast("한 줄 후기를 5자 이상 써주세요");
        if (!$app.querySelector("#rule").checked) return toast("사진 확인에 체크해주세요");
        const btn = e.currentTarget; btn.disabled = true; btn.textContent = "올리는 중...";
        try {
          const refs = [];
          for (const d of st.images) refs.push(await S.store.uploadImage(d));
          await S.store.createPost({ type: "review", courseId: c.id, courseTitle: c.title, images: refs, text });
          go("#/post/done");
        } catch (er) { toast(er.message || "올리기에 실패했어요"); btn.disabled = false; btn.textContent = "올리기"; }
      };
    });
  }
  function screenPostDone(t) {
    paint(t, `<div class="center-screen">${mascot("happy", 92)}<h2>게시물을 올렸어요</h2><p class="muted">운영자 확인 후 피드에 공개돼요<br>마이에서 진행 상황을 볼 수 있어요</p>
      <div class="row gap center"><a class="btn ghost" href="#/me">내 게시물 보기</a><a class="btn" href="#/feed">피드로</a></div></div>`);
  }

  /* =========================================================
     공개 프로필 · 아바타 꾸미기
     ========================================================= */
  const STYLE_TAGS = ["꾸안꾸", "힙", "캐주얼", "러블리", "시크", "모리걸", "Y2K", "스트릿", "클래식", "스포티", "빈티지", "미니멀"];
  const PLAY_TAGS = ["사진", "카페", "노래방", "쇼핑", "산책", "맛집", "보드게임", "전시", "영화", "운동"];
  const PCOLORS = [["warm", "웜톤"], ["cool", "쿨톤"], ["", "아직 몰라"]];
  const pcLabel = v => (PCOLORS.find(x => x[0] === v) || [])[1] || "";
  function avatarHtml(pub, size, cls) {
    return `<span class="av ${cls || ""}" style="width:${size}px;height:${size}px">${window.TSAvatar.render(pub && pub.avatar, size)}</span>`;
  }
  function ageOf(pub) { return pub && pub.birthYear ? calcAge(pub.birthYear, pub.birthMonth || 1) : null; }
  function authorLine(pub, fallbackNick) {
    const nick = (pub && pub.nickname) || fallbackNick || "알 수 없음";
    const age = ageOf(pub);
    return `<b>${esc(nick)}</b>${pub && pub.official ? `<span class="badge-official">공식</span>` : age ? `<span class="age-chip">${age}살</span>` : ""}${badgeOf(pub)}`;
  }
  async function ensurePublic() {
    try {
      S.pub = await S.store.getPublicProfile();
      if (!S.pub && S.profile) {
        const p = S.profile;
        await S.store.savePublicProfile({ nickname: p.nickname, birthYear: p.birthYear, birthMonth: p.birthMonth, avatar: window.TSAvatar.random(new Set()), styleTags: [], playTags: [], personalColor: "" });
        S.pub = await S.store.getPublicProfile();
      }
    } catch (e) { console.error(e); }
  }
  async function screenUser(t, uid) {
    paint(t, page(header("프로필", { back: true }) + loadingHtml()));
    const [pub, feed] = await Promise.all([S.store.getPublicProfile(uid), S.store.listFeed()]);
    if (!pub) return paint(t, page(header("프로필", { back: true }) + emptyHtml("user", "프로필을 찾을 수 없어요", "탈퇴했거나 주소가 잘못됐어요")));
    const isBlocked = blockedSet().has(uid);
    const posts = isBlocked ? [] : feed.filter(p => p.uid === uid);
    const likes = posts.reduce((s, p) => s + (p.likes || 0), 0);
    const mine = uid === S.user.uid;
    const age = ageOf(pub);
    const right = mine ? `<a class="icon-btn" href="#/me/style" aria-label="프로필 꾸미기">${ic("edit", 21)}</a>` : `<button class="icon-btn" id="more" aria-label="더보기">${ic("more", 22)}</button>`;
    paint(t, page(`
      ${header(mine ? "내 프로필" : "프로필", { back: true, right })}
      <section class="pp-head">
        ${avatarHtml(pub, 96, "lg")}
        <h1>${esc(pub.nickname)}</h1>
        <div class="pp-meta">${pub.official ? `<span class="badge-official">공식</span>` : age ? `<span class="age-chip">${age}살</span>` : ""}${pub.personalColor ? `<span class="pc-chip ${esc(pub.personalColor)}">${pcLabel(pub.personalColor)}</span>` : ""}${badgeOf(pub)}</div>
        <div class="pp-stats"><div><b>${posts.length}</b><span>게시물</span></div><div><b>${likes}</b><span>받은 좋아요</span></div></div>
      </section>
      <section class="card pp-tags">
        <div><span class="pp-label">추구미</span><div class="tagrow">${(pub.styleTags || []).length ? pub.styleTags.map(x => `<span class="tag lg">${esc(x)}</span>`).join("") : `<span class="muted tiny">${mine ? "아직 고르지 않았어요" : "비공개"}</span>`}</div></div>
        <div><span class="pp-label">좋아하는 놀거리</span><div class="tagrow">${(pub.playTags || []).length ? pub.playTags.map(x => `<span class="tag lg soft">${esc(x)}</span>`).join("") : `<span class="muted tiny">${mine ? "아직 고르지 않았어요" : "비공개"}</span>`}</div></div>
      </section>
      ${mine ? `<a class="btn ghost block" href="#/me/style">${ic("edit", 18)} 프로필 꾸미기</a>` : ""}
      <section>
        <div class="sec-head"><h2>게시물</h2></div>
        ${isBlocked ? emptyHtml("block", "차단한 사용자예요", "오른쪽 위 메뉴에서 차단을 풀 수 있어요") : posts.length ? `<div class="thumb-grid">${posts.map(x => `<a href="#/post/${encodeURIComponent(x.id)}">${imgTag(postThumbRef(x), postTitle(x))}</a>`).join("")}</div>` : emptyHtml("image", "아직 공개된 게시물이 없어요", "")}
      </section>
    `), () => {
      const m = $app.querySelector("#more");
      if (m) m.onclick = () => {
        const isB = blockedSet().has(uid);
        const el = openModal(`<button class="choice" id="ru">${ic("flag", 18)} 이 프로필 신고하기</button><button class="choice ${isB ? "" : "warn"}" id="bu">${ic("block", 18)} ${isB ? "차단 해제" : "이 사용자 차단하기"}</button><button class="btn ghost block" data-act="close-modal">닫기</button>`);
        el.querySelector("#ru").onclick = () => reportSheet("user", uid, { title: pub.nickname });
        el.querySelector("#bu").onclick = async () => { closeModal(); if (isB) { await setBlocked(uid, false); toast("차단을 풀었어요"); render(); } else if (await blockFlow(uid, pub.nickname)) render(); };
      };
    });
  }
  // 조사: 받침 유무에 따라 을/를, 은/는, 이/가
  function josa(word, pair) {
    const ch = String(word).trim().slice(-1), code = ch.charCodeAt(0) - 0xAC00;
    const hasFinal = code >= 0 && code <= 11171 ? code % 28 !== 0 : /[0-9LMNRlmnr]$/.test(ch);
    const [withF, without] = pair.split("/");
    return word + (hasFinal ? withF : without);
  }
  /* ---------- 포인트 ---------- */
  const EARN = { checkin: [10, "출석 체크"], vote: [2, "투표 참여"], review: [10, "후기 작성"], post: [20, "게시물 공개"], sub: [30, "코스 제보 공개"] };
  const todayStr = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
  const pts = () => (S.profile && S.profile.points) || 0;
  const ownedSet = () => new Set((S.profile && S.profile.owned) || []);
  async function savePts(upd) { Object.assign(S.profile, upd); try { await S.store.saveProfile(upd); } catch (e) { console.error(e); } }
  async function award(type, id) {
    if (!S.profile) return 0;
    const key = type + ":" + id, rw = S.profile.rewards || {};
    if (rw[key]) return 0;
    const [amt, label] = EARN[type];
    await savePts({ points: pts() + amt, rewards: { ...rw, [key]: Date.now() }, pointLog: [{ label, amt, at: Date.now() }, ...(S.profile.pointLog || [])].slice(0, 30) });
    return amt;
  }
  async function spend(itemKey, price, label) {
    if (pts() < price) return false;
    const owned = [...ownedSet(), itemKey];
    await savePts({ points: pts() - price, owned, pointLog: [{ label: label + " 열기", amt: -price, at: Date.now() }, ...(S.profile.pointLog || [])].slice(0, 30) });
    return true;
  }
  async function grantFree(itemKey) { if (!ownedSet().has(itemKey)) await savePts({ owned: [...ownedSet(), itemKey] }); }
  // 출석, 공개된 게시물·제보 보상을 한 번에 확인
  async function syncRewards() {
    if (S.rewardSynced || !S.profile) return;
    S.rewardSynced = true;
    let total = 0;
    const checkin = await award("checkin", todayStr());
    try {
      const [posts, subs] = await Promise.all([S.store.myPosts(), S.store.mySubmissions()]);
      for (const p of posts) if (p.status === "approved") total += await award("post", p.id);
      for (const s of subs) if (s.status === "approved") total += await award("sub", s.id);
    } catch (e) {}
    if (checkin && total) toast(`출석 체크 +${checkin}P · 공개 보상 +${total}P`);
    else if (checkin) toast(`출석 체크 +${checkin}P`);
    else if (total) toast(`게시물 공개 보상 +${total}P`);
  }
  const ptsChip = () => `<a class="pts-chip" href="#/points" aria-label="내 포인트">${ic("coin", 16)}<b class="num">${pts().toLocaleString("ko-KR")}P</b></a>`;
  function badgeOf(pub) { const b = window.TSAvatar.BADGES.find(x => x.id && x.id === (pub && pub.badge)); return b ? `<span class="badge-item">${esc(b.label)}</span>` : ""; }
  function screenPoints(t) {
    const log = (S.profile.pointLog || []);
    paint(t, page(`
      ${header("포인트", { back: true })}
      <section class="pts-hero">
        <p>내 포인트</p>
        <b class="num">${pts().toLocaleString("ko-KR")}P</b>
        <a class="btn light sm" href="#/me/style">꾸미기 아이템 보러 가기</a>
      </section>
      <section>
        <div class="sec-head"><h2>모으는 방법</h2></div>
        <div class="group earn-list">${Object.entries(EARN).map(([k, [amt, label]]) => `<div class="earn-row"><span>${label}${k === "checkin" ? " (하루 1번)" : k === "vote" ? " (투표마다)" : ""}</span><b class="num">+${amt}P</b></div>`).join("")}</div>
      </section>
      <section>
        <div class="sec-head"><h2>최근 내역</h2></div>
        ${log.length ? `<div class="group earn-list">${log.map(x => `<div class="earn-row"><span>${esc(x.label)}<small>${ago(x.at)}</small></span><b class="num ${x.amt < 0 ? "minus" : ""}">${x.amt > 0 ? "+" : ""}${x.amt}P</b></div>`).join("")}</div>` : emptyHtml("coin", "아직 내역이 없어요", "출석 체크와 투표로 첫 포인트를 모아보세요")}
      </section>
      <p class="tiny muted mt">포인트는 TeenSpot 안에서 꾸미기 아이템을 여는 데만 쓰여요. 현금으로 바꾸거나 사고팔 수 없어요</p>
    `));
  }

  function screenAvatarEdit(t) {
    const A = window.TSAvatar, O = A.OPTIONS, L = A.LABELS;
    const pub = S.pub || {};
    const st = { avatar: A.norm(pub.avatar), badge: pub.badge || "", styleTags: [...(pub.styleTags || [])], playTags: [...(pub.playTags || [])], personalColor: pub.personalColor || "", tab: "hair" };
    const TABS = [["hair", "머리"], ["face", "얼굴"], ["top", "옷"], ["acc", "소품"], ["deco", "배경"]];
    const lockTag = (k, v) => {
      const owned = ownedSet();
      if (A.isOwned(k, v, owned)) return "";
      const ev = A.eventOf(k, v);
      return ev ? `<em class="lock ev">${esc(ev.label)}</em>` : `<em class="lock">${ic("lock", 11)}${A.priceOf(k, v)}P</em>`;
    };
    const swatches = (key) => `<div class="sw-row">${O[key].map((c, i) => A.isVisible(key, i, ownedSet()) ? `<button class="sw ${st.avatar[key] === i ? "on" : ""} ${A.isOwned(key, i, ownedSet()) ? "" : "locked"}" data-k="${key}" data-v="${i}" style="background:${c}" aria-label="${key} ${i + 1}">${A.isOwned(key, i, ownedSet()) ? "" : ic("lock", 13)}</button>` : "").join("")}</div>`;
    const opts = (key) => `<div class="opt-grid">${O[key].filter(v => A.isVisible(key, v, ownedSet())).map(v => { const cfg = { ...st.avatar, [key]: v }; return `<button class="opt ${String(st.avatar[key]) === String(v) ? "on" : ""}" data-k="${key}" data-v="${v}">${A.render(cfg, 56)}<span>${L[key][v]}</span>${lockTag(key, v)}</button>`; }).join("")}</div>`;
    const badges = () => `<div class="chips" id="badges">${A.BADGES.filter(b => !b.event || A.eventActive(b.event) || ownedSet().has("badge:" + b.id)).map(b => { const own = !b.id || (!b.price && !b.event) || ownedSet().has("badge:" + b.id); return `<button class="chip ${st.badge === b.id ? "on" : ""}" data-badge="${b.id}">${esc(b.label)}${own ? "" : b.event ? ` <small>${esc(b.event.label)}</small>` : ` <small>${ic("lock", 11)}${b.price}P</small>`}</button>`; }).join("")}</div>`;
    const panel = () => {
      switch (st.tab) {
        case "hair": return `<p class="pl">머리 모양</p>${opts("hair")}<p class="pl">머리 색</p>${swatches("hairColor")}`;
        case "face": return `<p class="pl">피부 톤</p>${swatches("skin")}<p class="pl">눈</p>${opts("eyes")}<p class="pl">눈썹</p>${opts("brows")}<p class="pl">속눈썹</p>${opts("lashes")}<p class="pl">입</p>${opts("mouth")}<p class="pl">볼</p>${opts("cheek")}<p class="pl">주근깨·점</p>${opts("mark")}`;
        case "top": return `<p class="pl">옷 종류</p>${opts("top")}<p class="pl">옷 색</p>${swatches("shirt")}`;
        case "acc": return `<p class="pl">소품</p>${opts("acc")}`;
        default: return `<p class="pl">배경 색</p>${swatches("bg")}<p class="pl">배경 무늬</p>${opts("pattern")}<p class="pl">프로필 테두리</p>${opts("frame")}<p class="pl">닉네임 옆 배지</p>${badges()}`;
      }
    };
    const tagPicker = (id, list, sel) => `<div class="chips" id="${id}">${list.map(x => `<button class="chip ${sel.includes(x) ? "on" : ""}" data-t="${esc(x)}">${esc(x)}</button>`).join("")}</div>`;
    paint(t, page(`
      ${header("프로필 꾸미기", { back: true, right: ptsChip() })}
      <section class="av-stage"><div id="preview">${avatarHtml({ avatar: st.avatar }, 132, "lg")}</div><div id="badge-prev" class="badge-prev">${badgeOf({ badge: st.badge })}</div><button class="btn ghost sm" id="rand">랜덤</button></section>
      <div class="seg" id="tabs">${TABS.map(([k, l]) => `<a href="javascript:void 0" data-tab="${k}" class="${k === st.tab ? "on" : ""}">${l}</a>`).join("")}</div>
      <div class="card av-panel" id="panel">${panel()}</div>
      <div class="field"><span>추구미 <small class="muted">최대 3개</small></span>${tagPicker("style", STYLE_TAGS, st.styleTags)}</div>
      <div class="field"><span>퍼스널컬러</span><div class="chips" id="pc">${PCOLORS.map(([v, l]) => `<button class="chip ${st.personalColor === v ? "on" : ""}" data-v="${v}">${l}</button>`).join("")}</div></div>
      <div class="field"><span>좋아하는 놀거리 <small class="muted">최대 3개</small></span>${tagPicker("play", PLAY_TAGS, st.playTags)}</div>
      <p class="hint mt">프로필에는 닉네임, 아바타, 나이, 고른 태그만 보여요. 지역과 이메일은 공개되지 않아요</p>
      <div class="bottom-cta"><button class="btn block lg" id="ok">저장</button></div>
    `), () => {
      const preview = () => { $app.querySelector("#preview").innerHTML = avatarHtml({ avatar: st.avatar }, 132, "lg"); $app.querySelector("#badge-prev").innerHTML = badgeOf({ badge: st.badge }); };
      const refreshChip = () => { const c = $app.querySelector(".pts-chip b"); if (c) c.textContent = pts().toLocaleString("ko-KR") + "P"; };
      // 잠긴 아이템: 이벤트면 무료로 받고, 아니면 포인트로 열기
      const unlock = (key, label, price, ev, apply) => {
        if (ev) {
          const el = openModal(`<h3>${esc(label)}</h3><p class="muted">${esc(ev.label)} 아이템이에요. 기간 안에 받으면 계속 쓸 수 있어요</p><div class="row gap"><button class="btn ghost" data-act="close-modal">닫기</button><button class="btn" id="get">무료로 받기</button></div>`);
          el.querySelector("#get").onclick = async () => { await grantFree(key); closeModal(); toast(`${josa(label, "을/를")} 받았어요`); apply(); };
          return;
        }
        if (pts() < price) {
          const el = openModal(`<h3>포인트가 ${(price - pts()).toLocaleString("ko-KR")}P 부족해요</h3><p class="muted">${esc(josa(label, "은/는"))} ${price}P예요. 출석 체크, 투표, 후기 작성으로 포인트를 모을 수 있어요</p><div class="row gap"><button class="btn ghost" data-act="close-modal">닫기</button><a class="btn" href="#/points">모으는 방법</a></div>`);
          el.querySelector("a.btn").onclick = () => closeModal();
          return;
        }
        const el = openModal(`<h3>${esc(josa(label, "을/를"))} 열까요?</h3><p class="muted">${price}P를 써요. 지금 ${pts().toLocaleString("ko-KR")}P가 있어요</p><div class="row gap"><button class="btn ghost" data-act="close-modal">취소</button><button class="btn" id="buy">${price}P로 열기</button></div>`);
        el.querySelector("#buy").onclick = async () => { const ok = await spend(key, price, label); closeModal(); if (ok) { toast(`${josa(label, "을/를")} 열었어요`); refreshChip(); apply(); } };
      };
      const drawPanel = () => {
        const el = $app.querySelector("#panel"); el.innerHTML = panel();
        el.querySelectorAll("[data-k]").forEach(b => (b.onclick = () => {
          const k = b.dataset.k, raw = b.dataset.v;
          const v = A.COLOR_KEYS.includes(k) ? Number(raw) : (k === "cheek" || k === "lashes") ? raw === "true" : raw;
          const apply = () => { st.avatar[k] = v; drawPanel(); preview(); };
          if (A.isOwned(k, v, ownedSet())) return apply();
          const label = (L[k] && L[k][v]) || (k === "hairColor" ? "머리 색" : k === "shirt" ? "옷 색" : k === "bg" ? "배경 색" : "아이템");
          unlock(A.itemKey(k, v), label, A.priceOf(k, v), A.eventOf(k, v), apply);
        }));
        el.querySelectorAll("[data-badge]").forEach(b => (b.onclick = () => {
          const id = b.dataset.badge, def = A.BADGES.find(x => x.id === id);
          const apply = () => { st.badge = id; drawPanel(); preview(); };
          if (!id || (!def.price && !def.event) || ownedSet().has("badge:" + id)) return apply();
          unlock("badge:" + id, def.label + " 배지", def.price, def.event || null, apply);
        }));
      };
      drawPanel();
      $app.querySelectorAll("#tabs [data-tab]").forEach(a => (a.onclick = e => { e.preventDefault(); st.tab = a.dataset.tab; $app.querySelectorAll("#tabs a").forEach(x => x.classList.toggle("on", x === a)); drawPanel(); }));
      $app.querySelector("#rand").onclick = () => { st.avatar = A.norm({ ...st.avatar, ...A.random(ownedSet()) }); drawPanel(); preview(); };
      const bindTags = (id, arr) => $app.querySelectorAll(`#${id} .chip`).forEach(b => (b.onclick = () => {
        const v = b.dataset.t, i = arr.indexOf(v);
        if (i >= 0) arr.splice(i, 1); else { if (arr.length >= 3) return toast("최대 3개까지 고를 수 있어요"); arr.push(v); }
        b.classList.toggle("on", arr.includes(v));
      }));
      bindTags("style", st.styleTags); bindTags("play", st.playTags);
      $app.querySelectorAll("#pc .chip").forEach(b => (b.onclick = () => { st.personalColor = b.dataset.v; $app.querySelectorAll("#pc .chip").forEach(x => x.classList.toggle("on", x === b)); }));
      $app.querySelector("#ok").onclick = async e => {
        e.currentTarget.disabled = true;
        try {
          await S.store.savePublicProfile({ avatar: st.avatar, badge: st.badge, styleTags: st.styleTags, playTags: st.playTags, personalColor: st.personalColor });
          S.pub = await S.store.getPublicProfile();
          toast("프로필을 저장했어요"); go("#/u/" + encodeURIComponent(S.user.uid));
        } catch (er) { toast("저장에 실패했어요"); e.currentTarget.disabled = false; }
      };
    });
  }

  /* =========================================================
     알림 · 반려 사유 · 차단
     ========================================================= */
  const POST_REASONS = ["얼굴이 보여요", "이름·학교·교복이 보여요", "다른 사람이 찍은 사진 같아요", "주제와 맞지 않아요", "광고·홍보 같아요"];
  const SUB_REASONS = ["정보가 부족해요", "이미 있는 코스예요", "청소년에게 맞지 않는 장소예요", "광고·홍보 같아요"];
  function reasonSheet(title, reasons) {
    return new Promise(res => {
      const el = openModal(`<h3>${esc(title)}</h3><p class="muted">작성자에게 반려 사유가 보여요</p>
        <div class="list-choice">${reasons.map(r => `<button class="choice" data-r="${esc(r)}">${esc(r)}</button>`).join("")}</div>
        <button class="btn ghost block" data-r="">취소</button>`);
      el.querySelectorAll("[data-r]").forEach(b => (b.onclick = () => { closeModal(); res(b.dataset.r || null); }));
      $modal.querySelector(".modal-bg").onclick = () => { closeModal(); res(null); };
    });
  }
  const rejectNote = x => (x && x.status === "rejected" ? `반려 사유: ${x.rejectReason || "가이드라인에 맞지 않아요"}` : "");

  // 차단
  const blockedSet = () => new Set((S.profile && S.profile.blocked) || []);
  const visible = arr => { const b = blockedSet(); return arr.filter(x => !b.has(x.uid)); };
  async function setBlocked(uid, on) {
    const b = blockedSet(); on ? b.add(uid) : b.delete(uid);
    Object.assign(S.profile, { blocked: [...b] });
    await S.store.saveProfile({ blocked: [...b] });
  }
  async function blockFlow(uid, nick) {
    if (!(await confirmSheet(`${josa(nick || "이 사용자", "을/를")} 차단할까요?`, "이 사용자의 게시물과 후기가 내 화면에 보이지 않게 돼요. 설정에서 언제든 풀 수 있어요", "차단", true))) return false;
    try { await setBlocked(uid, true); toast("차단했어요"); return true; } catch (e) { toast("차단에 실패했어요"); return false; }
  }
  async function screenBlockList(t) {
    paint(t, page(header("차단한 사용자", { back: true }) + loadingHtml()));
    const ids = [...blockedSet()];
    const pubs = await S.store.getPublicProfiles(ids);
    paint(t, page(`
      ${header("차단한 사용자", { back: true })}
      ${ids.length ? `<div class="group">${ids.map(u => `<div class="hist block-row">${avatarHtml(pubs[u], 40)}<div class="grow"><b>${esc((pubs[u] || {}).nickname || "탈퇴한 사용자")}</b></div><button class="btn ghost sm" data-unblock="${esc(u)}">차단 해제</button></div>`).join("")}</div>`
        : emptyHtml("user", "차단한 사용자가 없어요", "")}
    `), () => {
      $app.querySelectorAll("[data-unblock]").forEach(b => (b.onclick = async () => { await setBlocked(b.dataset.unblock, false); toast("차단을 풀었어요"); render(); }));
    });
  }

  // 알림: 게시물·제보 승인과 반려, 받은 좋아요·칭찬, 내 투표 참여 수
  const qj = (title, pair) => { const w = josa(title, pair); return `'${title}'${w.slice(title.length)}`; };
  async function buildNotis() {
    const [posts, subs, rx] = await Promise.all([S.store.myPosts(), S.store.mySubmissions(), S.store.myReactions()]);
    const blocked = blockedSet();
    const out = [];
    posts.forEach(p => {
      const title = postTitle(p);
      if (p.status === "approved") out.push({ at: p.approvedAt || p.createdAt, icon: "checkCircle", text: `게시물 ${qj(title, "이/가")} 피드에 공개됐어요`, href: "#/post/" + encodeURIComponent(p.id) });
      if (p.status === "rejected") out.push({ at: p.rejectedAt || p.createdAt, icon: "alert", warn: true, text: `게시물 ${qj(title, "이/가")} 공개되지 않았어요`, sub: rejectNote(p), href: "#/post/" + encodeURIComponent(p.id) });
    });
    subs.forEach(s => {
      if (s.status === "approved") out.push({ at: s.approvedAt || s.createdAt, icon: "map", text: `제보한 코스 ${qj(s.title, "이/가")} 공개됐어요`, href: "#/course/" + encodeURIComponent(s.courseId || "") });
      if (s.status === "rejected") out.push({ at: s.rejectedAt || s.createdAt, icon: "alert", warn: true, text: `제보한 코스 ${qj(s.title, "이/가")} 공개되지 않았어요`, sub: rejectNote(s), href: "#/me" });
    });
    const rxv = rx.filter(r => !blocked.has(r.uid));
    const pubs = await S.store.getPublicProfiles([...new Set(rxv.map(r => r.uid))]);
    const byPost = Object.fromEntries(posts.map(p => [p.id, p]));
    rxv.forEach(r => {
      const p = byPost[r.pid]; if (!p) return;
      const nick = (pubs[r.uid] || {}).nickname || "누군가";
      const praise = r.praise ? ((PRAISE[p.type] || []).find(x => x[0] === r.praise) || [])[1] : "";
      if (!r.like && !praise) return;
      out.push({ at: r.at || 0, icon: "heart", av: pubs[r.uid], text: praise ? `${nick}님이 ${qj(praise, "을/를")} 보냈어요` : `${nick}님이 내 게시물을 좋아해요`, sub: postTitle(p), href: "#/post/" + encodeURIComponent(p.id) });
    });
    for (const p of posts.filter(x => x.type === "vote" && x.pollId && x.status === "approved")) {
      try { const r = await S.store.pollResult(p.pollId); const n = r.a + r.b; if (n) out.push({ at: p.approvedAt || p.createdAt, icon: "vote", text: `내 투표 '${p.question}'에 ${n}명이 참여했어요`, sub: `${p.a.label} ${pct(r.a, n)}% · ${p.b.label} ${n ? 100 - pct(r.a, n) : 0}%`, href: "#/post/" + encodeURIComponent(p.id) }); } catch (e) {}
    }
    return out.sort((a, b) => b.at - a.at);
  }
  async function refreshBell() {
    try {
      const list = await buildNotis();
      const seen = (S.profile && S.profile.notiSeen) || 0;
      const n = list.filter(x => x.at > seen).length;
      const dot = document.querySelector(".bell .bell-dot");
      if (dot) { dot.hidden = !n; dot.textContent = n > 9 ? "9+" : n; }
    } catch (e) {}
  }
  const bellHtml = () => `<a class="icon-btn bell" href="#/notifications" aria-label="알림">${ic("bell", 22)}<span class="bell-dot num" hidden></span></a>`;
  async function screenNotis(t) {
    paint(t, page(header("알림", { back: true }) + loadingHtml()));
    const list = await buildNotis();
    const seen = (S.profile && S.profile.notiSeen) || 0;
    paint(t, page(`
      ${header("알림", { back: true })}
      ${list.length ? `<div class="group noti-list">${list.map(x => `<a class="noti ${x.at > seen ? "new" : ""}" href="${x.href}">
          ${x.av ? avatarHtml(x.av, 40) : `<span class="noti-ic ${x.warn ? "warn" : ""}">${ic(x.icon, 19)}</span>`}
          <div class="grow"><p>${esc(x.text)}</p>${x.sub ? `<small>${esc(x.sub)}</small>` : ""}<time>${ago(x.at)}</time></div></a>`).join("")}</div>`
        : `<div class="center-screen">${mascot("sleepy", 80)}<h2>아직 알림이 없어요</h2><p class="muted">게시물을 올리거나 투표하면 소식이 여기 모여요</p></div>`}
    `));
    if (list.length) S.store.saveProfile({ notiSeen: Date.now() }).then(() => { S.profile.notiSeen = Date.now(); }).catch(() => {});
  }

  /* =========================================================
     6. 저장·마이
     ========================================================= */
  async function screenSaved(t, q) {
    const tab = ["poll", "post"].includes(q.tab) ? q.tab : "course";
    paint(t, page(header("저장한 항목", { back: true }) + loadingHtml(), "me"));
    const [saves, courses, polls, votes, feed] = await Promise.all([S.store.getSaves(), S.store.listCourses(), S.store.listPolls(), S.store.myVotes(), S.store.listFeed()]);
    const ids = saves.filter(s => s.type === tab).sort((a, b) => b.at - a.at).map(s => s.id);
    const src = tab === "course" ? courses : tab === "poll" ? polls : feed;
    const items = ids.map(i => src.find(c => c.id === i)).filter(Boolean);
    const empty = { course: ["저장한 코스가 없어요", "spot"], poll: ["저장한 투표가 없어요", "style"], post: ["저장한 게시물이 없어요", "feed"] }[tab];
    const list = !items.length ? emptyHtml("bookmark", empty[0], "마음에 드는 걸 저장해두면 여기 모여요", `<a class="btn sm" href="#/${empty[1]}">둘러보기</a>`)
      : tab === "course" ? courseList(items)
      : tab === "poll" ? items.map(p => pollCard(p, !!votes[p.id])).join("")
      : `<div class="thumb-grid">${items.map(p => `<a href="#/post/${encodeURIComponent(p.id)}">${imgTag(postThumbRef(p), postTitle(p))}</a>`).join("")}</div>`;
    paint(t, page(`
      ${header("저장한 항목", { back: true })}
      <div class="seg">${[["course", "코스"], ["poll", "투표"], ["post", "게시물"]].map(([k, l]) => `<a href="#/saved?tab=${k}" class="${tab === k ? "on" : ""}">${l}</a>`).join("")}</div>
      ${list}
    `, "me"));
  }
  const STATUS = { pending: ["검토 중", "pending"], approved: ["공개됨", "ok"], rejected: ["반려", "no"] };
  async function screenMe(t) {
    paint(t, page(header("마이") + loadingHtml(), "me"));
    const [reviews, subs, posts] = await Promise.all([S.store.myReviews(), S.store.mySubmissions(), S.store.myPosts()]);
    const p = S.profile;
    paint(t, page(`
      ${header("마이", { right: `<a class="icon-btn" href="#/settings" aria-label="설정">${ic("settings", 22)}</a>` })}
      <section class="card profile-card">
        <div class="profile">
          <a href="#/u/${encodeURIComponent(S.user.uid)}">${avatarHtml(S.pub, 64)}</a>
          <div class="grow"><div class="name-line"><h2>${esc(p.nickname)}</h2>${ageOf(S.pub) ? `<span class="age-chip">${ageOf(S.pub)}살</span>` : ""}</div>
            <div class="tagrow sm">${S.pub && (S.pub.styleTags || []).length ? S.pub.styleTags.map(x => `<span class="tag">${esc(x)}</span>`).join("") : `<span class="muted tiny">추구미를 골라 프로필을 꾸며보세요</span>`}</div></div>
        </div>
        <div class="row gap mt"><a class="btn ghost sm grow" href="#/me/style">프로필 꾸미기</a><a class="btn ghost sm grow" href="#/u/${encodeURIComponent(S.user.uid)}">내 프로필 보기</a></div>
        <a class="link block tiny" href="#/me/edit">닉네임·지역·관심사 수정 (지역은 비공개)</a>
      </section>
      <div class="group me-links">
        <a class="hist" href="#/points">${ic("coin", 20)}<div class="grow"><b>포인트</b></div><b class="num pts-val">${pts().toLocaleString("ko-KR")}P</b>${ic("chev", 18, "chev")}</a>
        <a class="hist" href="#/saved">${ic("bookmark", 20)}<div class="grow"><b>저장한 항목</b></div>${ic("chev", 18, "chev")}</a>
      </div>
      <section>
        <div class="sec-head"><h2>내 게시물 <small class="muted">${posts.length}</small></h2><button class="link" id="up">올리기</button></div>
        ${posts.length ? `<div class="thumb-grid">${posts.map(x => { const st = STATUS[x.status] || STATUS.pending; return `<a href="#/post/${encodeURIComponent(x.id)}">${imgTag(postThumbRef(x), postTitle(x))}${x.status !== "approved" ? `<span class="status ${st[1]}">${st[0]}</span>` : ""}</a>`; }).join("")}</div>`
          : emptyHtml("image", "아직 올린 게시물이 없어요", "")}
      </section>
      <section>
        <div class="sec-head"><h2>내 후기 <small class="muted">${reviews.length}</small></h2></div>
        ${reviews.length ? reviews.map(r => `<a class="card hist" href="#/course/${encodeURIComponent(r.cid)}"><span class="rec-pill ${r.recommend ? "yes" : "no"}">${r.recommend ? "추천" : "비추천"}</span><div class="grow"><b>${esc(r.courseTitle)}</b><p class="muted tiny">${esc(r.text)}</p></div>${ic("chev", 18, "chev")}</a>`).join("")
          : emptyHtml("edit", "아직 쓴 후기가 없어요", "")}
      </section>
      <section>
        <div class="sec-head"><h2>내 제보 <small class="muted">${subs.length}</small></h2><a class="link" href="#/submit">제보하기</a></div>
        ${subs.length ? subs.map(s => { const st = STATUS[s.status] || STATUS.pending; return `<${s.courseId ? `a href="#/course/${encodeURIComponent(s.courseId)}"` : "div"} class="card hist"><div class="grow"><b>${esc(s.title)}</b><p class="muted tiny">${s.status === "rejected" ? esc(rejectNote(s)) : esc(s.area) + " · " + fmtDate(s.createdAt)}</p></div><span class="status ${st[1]}">${st[0]}</span></${s.courseId ? "a" : "div"}>`; }).join("")
          : emptyHtml("send", "아직 제보한 코스가 없어요", "")}
      </section>
    `, "me"), () => { $app.querySelector("#up").onclick = () => uploadSheet(); });
  }
  function screenMeEdit(t) {
    const p = S.profile, sel = new Set(p.interests || []);
    paint(t, page(`
      ${header("프로필 수정", { back: true })}
      ${nicknameField(p.nickname)}
      ${regionFields(p.gu)}
      <div class="field"><span>관심 카테고리</span><div class="chips">${INTERESTS.map(i => `<button class="chip ${sel.has(i) ? "on" : ""}" data-i="${i}">${i}</button>`).join("")}</div></div>
      <div class="bottom-cta"><button class="btn block lg" id="ok">저장</button></div>
    `), () => {
      let nickOk = true, nick = p.nickname;
      bindNickname(p.nickname, (ok, n) => { nickOk = ok; nick = n; });
      $app.querySelectorAll("[data-i]").forEach(b => (b.onclick = e => { e.preventDefault(); sel.has(b.dataset.i) ? sel.delete(b.dataset.i) : sel.add(b.dataset.i); b.classList.toggle("on"); }));
      $app.querySelector("#ok").onclick = async e => {
        const gu = $app.querySelector("#gu").value;
        if (!nickOk) return toast("닉네임 중복 확인을 해주세요");
        if (!gu) return toast("구를 골라주세요");
        if (!sel.size) return toast("관심 카테고리를 1개 이상 골라주세요");
        e.currentTarget.disabled = true;
        try {
          if (nick !== p.nickname) await S.store.setNickname(nick, p.nickname);
          const upd = { nickname: nick, gu, interests: [...sel] };
          await S.store.saveProfile(upd); Object.assign(S.profile, upd);
          if (S.pub && S.pub.nickname !== nick) { await S.store.savePublicProfile({ nickname: nick }); S.pub = await S.store.getPublicProfile(); }
          if (S.spotFilter) S.spotFilter.gu = gu;
          toast("저장했어요"); back("#/me");
        } catch (er) { toast(er.message || "저장에 실패했어요"); e.currentTarget.disabled = false; }
      };
    });
  }
  function screenSettings(t) {
    const mail = CFG.contactEmail || "";
    paint(t, page(`
      ${header("설정", { back: true })}
      <div class="menu card">
        <a href="#/legal/terms">서비스 이용약관${ic("chev", 18, "chev")}</a>
        <a href="#/legal/privacy">개인정보 수집·이용${ic("chev", 18, "chev")}</a>
        <a href="#/legal/guide">커뮤니티 가이드라인${ic("chev", 18, "chev")}</a>
        <a href="#/blocked">차단한 사용자 <small class="muted num">${blockedSet().size || ""}</small>${ic("chev", 18, "chev")}</a>
        <a href="#/legal/marketing">마케팅 정보 수신 <small class="muted">${S.profile.agreements && S.profile.agreements.marketing ? "동의함" : "동의 안 함"}</small>${ic("chev", 18, "chev")}</a>
      </div>
      <div class="menu card">
        <button id="mkt">마케팅 수신 ${S.profile.agreements && S.profile.agreements.marketing ? "끄기" : "켜기"}${ic("chev", 18, "chev")}</button>
        <a href="mailto:${esc(mail)}?subject=${encodeURIComponent("[TeenSpot 문의]")}">문의하기${ic("chev", 18, "chev")}</a>
        ${S.admin ? `<a href="#/admin">관리자 페이지${ic("chev", 18, "chev")}</a>` : ""}
        ${S.store.mode === "demo" ? `<button id="reset">체험 데이터 초기화${ic("chev", 18, "chev")}</button>` : ""}
      </div>
      <div class="menu card">
        <button id="logout">로그아웃${ic("chev", 18, "chev")}</button>
        <a href="#/withdraw" class="warn">회원 탈퇴${ic("chev", 18, "chev")}</a>
      </div>
      <p class="tiny muted center">TeenSpot MVP · ${S.store.mode === "demo" ? "체험 모드" : "운영 모드"}</p>
    `), () => {
      $app.querySelector("#mkt").onclick = async () => {
        const ag = { ...(S.profile.agreements || {}), marketing: !(S.profile.agreements && S.profile.agreements.marketing), marketingAt: Date.now() };
        try { await S.store.saveProfile({ agreements: ag }); S.profile.agreements = ag; toast(ag.marketing ? "마케팅 수신에 동의했어요" : "마케팅 수신을 껐어요"); render(); } catch (e) { toast("변경에 실패했어요"); }
      };
      $app.querySelector("#logout").onclick = async () => { if (await confirmSheet("로그아웃할까요?", "", "로그아웃")) await S.store.signOut(); };
      const rs = $app.querySelector("#reset");
      if (rs) rs.onclick = async () => { if (await confirmSheet("체험 데이터를 초기화할까요?", "가입 정보와 후기, 투표가 모두 지워져요", "초기화", true)) { S.profile = null; await S.store.resetDemo(); } };
    });
  }
  function screenWithdraw(t) {
    paint(t, page(`
      ${header("회원 탈퇴", { back: true })}
      <h1 class="step-title">정말 떠나시나요?</h1>
      <div class="card">
        <p><b>탈퇴하면 아래 정보가 모두 삭제되고 되돌릴 수 없어요</b></p>
        <ul class="del-list"><li>계정 정보 (닉네임, 출생 연월, 지역, 관심사)</li><li>작성한 후기</li><li>제보한 코스 (승인된 코스는 운영 코스로 남아요)</li><li>올린 게시물과 사진, 받은 반응</li><li>투표 기록, 좋아요·칭찬 기록</li><li>저장한 코스·투표</li><li>신고 내역</li></ul>
      </div>
      ${S.store.mode === "firebase" ? `<p class="tiny muted">본인 확인을 위해 구글 로그인 창이 한 번 더 열려요</p>` : ""}
      <label class="check"><input type="checkbox" id="agree"><span>위 내용을 확인했어요</span></label>
      <div class="bottom-cta"><button class="btn danger block lg" id="ok" disabled>탈퇴하기</button></div>
    `), () => {
      const ag = $app.querySelector("#agree"), ok = $app.querySelector("#ok");
      ag.onchange = () => (ok.disabled = !ag.checked);
      ok.onclick = async () => {
        ok.disabled = true; ok.textContent = "삭제 중...";
        try { await S.store.deleteAccount(); S.profile = null; LS.set("ts-withdrawn", "1"); toast("탈퇴가 완료됐어요. 그동안 고마웠어요"); }
        catch (e) { toast("탈퇴에 실패했어요: " + (e.code || e.message)); ok.disabled = false; ok.textContent = "탈퇴하기"; }
      };
    });
  }

  /* =========================================================
     9. 관리자
     ========================================================= */
  async function screenAdmin(t, p, q) {
    if (!S.admin) return paint(t, page(header("관리자", { back: true }) + emptyHtml("lock", "관리자만 볼 수 있어요", "")));
    const sub = p[1];
    if (sub === "course") return adminCourseEdit(t, p[2]);
    if (sub === "poll") return adminPollEdit(t, p[2]);
    if (sub === "courses") return adminCourses(t);
    if (sub === "polls") return adminPolls(t);
    if (sub === "submissions") return adminSubmissions(t);
    if (sub === "reports") return adminReports(t);
    if (sub === "posts") return adminPosts(t);
    paint(t, page(header("관리자", { back: true }) + loadingHtml()));
    const [courses, polls, subs, reps, posts] = await Promise.all([S.store.listCourses(), S.store.listPolls(), S.store.listSubmissions(), S.store.listReports(), S.store.listPosts()]);
    const pendingPosts = posts.filter(x => x.status === "pending").length;
    const pending = subs.filter(s => s.status === "pending").length, open = reps.filter(r => r.status === "open").length;
    const launch = courses.filter(c => c.gu === LAUNCH_GU).length;
    paint(t, page(`
      ${header("관리자", { back: true })}
      <div class="stats card"><div><b>${launch}<small>/30</small></b><span>${esc(LAUNCH_GU)} 코스</span></div><div><b>${polls.length}<small>/30</small></b><span>투표</span></div><div><b>${courses.reduce((s, c) => s + c.reviewCount, 0)}</b><span>후기</span></div></div>
      <div class="menu card">
        <a href="#/admin/courses">코스 관리 <small class="muted">${courses.length}</small>${ic("chev", 18, "chev")}</a>
        <a href="#/admin/polls">투표 관리 <small class="muted">${polls.length}</small>${ic("chev", 18, "chev")}</a>
        <a href="#/admin/submissions">제보 승인 ${pending ? `<span class="dot-n">${pending}</span>` : ""}${ic("chev", 18, "chev")}</a>
        <a href="#/admin/posts">게시물 승인 ${pendingPosts ? `<span class="dot-n">${pendingPosts}</span>` : ""}${ic("chev", 18, "chev")}</a>
        <a href="#/admin/reports">신고 처리 ${open ? `<span class="dot-n">${open}</span>` : ""}${ic("chev", 18, "chev")}</a>
      </div>
      <div class="menu card"><button id="seed">예시 코스·투표 불러오기${ic("chev", 18, "chev")}</button></div>
      <p class="tiny muted">예시 데이터는 같은 ID로 덮어써서 여러 번 눌러도 중복되지 않아요</p>
    `), () => {
      $app.querySelector("#seed").onclick = async () => {
        if (!(await confirmSheet("예시 코스 8개와 투표 9개를 불러올까요?", "", "불러오기"))) return;
        try { await S.store.importSeed(); toast("불러왔어요"); render(); } catch (e) { toast("실패: " + e.message); }
      };
    });
  }
  async function adminCourses(t) {
    paint(t, page(header("코스 관리", { back: true }) + loadingHtml()));
    const list = (await S.store.listCourses()).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    paint(t, page(`
      ${header("코스 관리", { back: true, right: `<a class="btn sm" href="#/admin/course/new">+ 새 코스</a>` })}
      ${list.length ? list.map(c => `<div class="card hist"><div class="grow"><b>${esc(c.title)}</b><p class="muted tiny">${esc(c.gu)} · ${esc(c.area)} · 1인 ${won(c.total)} · 후기 ${c.reviewCount}</p></div>
        <a class="btn ghost sm" href="#/admin/course/${encodeURIComponent(c.id)}">수정</a><button class="btn ghost sm warn" data-del="${esc(c.id)}">삭제</button></div>`).join("") : emptyHtml("map", "코스가 없어요", "")}
    `), () => {
      $app.querySelectorAll("[data-del]").forEach(b => (b.onclick = async () => {
        if (!(await confirmSheet("코스를 삭제할까요?", "달린 후기도 함께 삭제돼요", "삭제", true))) return;
        await S.store.deleteCourse(b.dataset.del); toast("삭제했어요"); render();
      }));
    });
  }
  async function adminCourseEdit(t, id) {
    const isNew = !id || id === "new";
    const c = isNew ? null : await S.store.getCourse(id);
    paint(t, page(`
      ${header(isNew ? "새 코스" : "코스 수정", { back: true })}
      ${courseFormHtml(c)}
      <div class="bottom-cta"><button class="btn block lg" id="ok">${isNew ? "등록" : "저장"}</button></div>
    `), () => {
      const read = bindCourseForm(c);
      $app.querySelector("#ok").onclick = async e => {
        const [out, err] = read(); if (err) return toast(err);
        e.currentTarget.disabled = true;
        try { await S.store.saveCourse(isNew ? out : { ...out, id }); toast("저장했어요"); go("#/admin/courses"); }
        catch (er) { toast("저장 실패: " + er.message); e.currentTarget.disabled = false; }
      };
    });
  }
  async function adminPolls(t) {
    paint(t, page(header("투표 관리", { back: true }) + loadingHtml()));
    const polls = await S.store.listPolls();
    const results = await Promise.all(polls.map(p => S.store.pollResult(p.id)));
    paint(t, page(`
      ${header("투표 관리", { back: true, right: `<a class="btn sm" href="#/admin/poll/new">+ 새 투표</a>` })}
      ${polls.length ? polls.map((p, i) => `<div class="card hist"><span class="tag">${CATS[p.cat]}</span><div class="grow"><b>${esc(p.question)}</b><p class="muted tiny">${esc(p.a.label)} ${results[i].a} : ${results[i].b} ${esc(p.b.label)}</p></div>
        <a class="btn ghost sm" href="#/admin/poll/${encodeURIComponent(p.id)}">수정</a><button class="btn ghost sm warn" data-del="${esc(p.id)}">삭제</button></div>`).join("") : emptyHtml("vote", "투표가 없어요", "")}
    `), () => {
      $app.querySelectorAll("[data-del]").forEach(b => (b.onclick = async () => {
        if (!(await confirmSheet("투표를 삭제할까요?", "투표 기록도 함께 삭제돼요", "삭제", true))) return;
        await S.store.deletePoll(b.dataset.del); toast("삭제했어요"); render();
      }));
    });
  }
  async function adminPollEdit(t, id) {
    const isNew = !id || id === "new";
    const p = isNew ? { cat: "outfit", question: "", a: { label: "", img: "" }, b: { label: "", img: "" } } : (await S.store.listPolls()).find(x => x.id === id);
    if (!p) return go("#/admin/polls");
    const imgs = window.TS_STYLE_IMAGES || [];
    const imgSel = (k, cur) => `<select id="${k}-img"><option value="">이미지 없음 (글자로 표시)</option>${cur && !imgs.some(f => "images/style/" + f === cur) ? `<option value="${esc(cur)}" selected>현재 이미지 유지</option>` : ""}${imgs.map(f => { const v = "images/style/" + f; return `<option value="${esc(v)}" ${v === cur ? "selected" : ""}>${esc(f)}</option>`; }).join("")}</select>`;
    paint(t, page(`
      ${header(isNew ? "새 투표" : "투표 수정", { back: true })}
      <label class="field"><span>카테고리</span><select id="cat">${Object.entries(CATS).map(([k, l]) => `<option value="${k}" ${p.cat === k ? "selected" : ""}>${l}</option>`).join("")}</select></label>
      <label class="field"><span>질문</span><input id="qq" maxlength="30" placeholder="예: 흰 티셔츠엔 어떤 바지?" value="${esc(p.question)}"></label>
      ${["a", "b"].map(k => `<div class="card"><b>선택지 ${k.toUpperCase()}</b>
        <label class="field"><span>이름</span><input id="${k}-label" maxlength="15" value="${esc(p[k].label)}"></label>
        <label class="field"><span>이미지</span>${imgSel(k, p[k].img)}</label>
        <div class="img-prev" id="${k}-prev">${p[k].img ? imgTag(p[k].img, "") : ""}</div></div>`).join("")}
      <p class="tiny muted">이미지는 images/style 폴더에 넣고 js/style-images.js 목록에 추가하면 여기서 고를 수 있어요. 얼굴이 나온 사진은 쓰지 않아요</p>
      <div class="bottom-cta"><button class="btn block lg" id="ok">${isNew ? "등록" : "저장"}</button></div>
    `), () => {
      ["a", "b"].forEach(k => ($app.querySelector(`#${k}-img`).onchange = e => (($app.querySelector(`#${k}-prev`).innerHTML = e.target.value ? imgTag(e.target.value, "") : ""), hydrateImages($app))));
      $app.querySelector("#ok").onclick = async e => {
        const v = s => $app.querySelector(s).value.trim();
        const out = { id: isNew ? null : id, cat: v("#cat"), question: v("#qq"), a: { label: v("#a-label"), img: v("#a-img") }, b: { label: v("#b-label"), img: v("#b-img") } };
        if (out.question.length < 3) return toast("질문을 입력해주세요");
        if (!out.a.label || !out.b.label) return toast("선택지 이름을 입력해주세요");
        e.currentTarget.disabled = true;
        try { await S.store.savePoll(out); toast("저장했어요"); go("#/admin/polls"); }
        catch (er) { toast("저장 실패: " + er.message); e.currentTarget.disabled = false; }
      };
    });
  }
  async function adminSubmissions(t) {
    paint(t, page(header("제보 승인", { back: true }) + loadingHtml()));
    const subs = await S.store.listSubmissions();
    const pending = subs.filter(s => s.status === "pending"), done = subs.filter(s => s.status !== "pending");
    const card = s => { const st = STATUS[s.status] || STATUS.pending; return `<div class="card sub-card">
      <div class="rv-top"><b>${esc(s.title)}</b><span class="status ${st[1]}">${st[0]}</span></div>
      <p class="muted tiny">${esc(s.gu)} · ${esc(s.area)} · ${s.peopleMin}~${s.peopleMax}명 · ${s.hours}시간 · 제보 ${esc(s.nickname)} · ${fmtDate(s.createdAt)}</p>
      <ol class="timeline sm">${(s.stops || []).map((x, i) => `<li><span class="tl-num">${i + 1}</span><div><b>${esc(x.name)}</b>${x.note ? `<p class="muted tiny">${esc(x.note)}</p>` : ""}</div><span class="tl-cost">${won(x.cost)}</span></li>`).join("")}</ol>
      ${s.note ? `<p class="tiny">${esc(s.note)}</p>` : ""}
      ${s.status === "pending" ? `<div class="row gap"><button class="btn ghost grow warn" data-rej="${esc(s.id)}">반려</button><button class="btn grow" data-ok="${esc(s.id)}">승인</button></div>` : ""}
    </div>`; };
    paint(t, page(`
      ${header("제보 승인", { back: true })}
      <div class="sec-head"><h2>대기 중 ${pending.length}</h2></div>
      ${pending.length ? pending.map(card).join("") : emptyHtml("checkCircle", "검토할 제보가 없어요", "")}
      ${done.length ? `<div class="sec-head"><h2>처리 완료</h2></div>${done.map(card).join("")}` : ""}
    `), () => {
      $app.querySelectorAll("[data-ok]").forEach(b => (b.onclick = async () => { b.disabled = true; await S.store.approveSubmission(b.dataset.ok); toast("승인했어요. 코스로 공개됐어요"); render(); }));
      $app.querySelectorAll("[data-rej]").forEach(b => (b.onclick = async () => { const r = await reasonSheet("반려 사유를 골라주세요", SUB_REASONS); if (r) { await S.store.rejectSubmission(b.dataset.rej, r); toast("반려했어요"); render(); } }));
    });
  }
  async function adminReports(t) {
    paint(t, page(header("신고 처리", { back: true }) + loadingHtml()));
    const reps = await S.store.listReports();
    const open = reps.filter(r => r.status === "open");
    const label = { course: "코스", review: "후기", poll: "투표", post: "게시물", user: "프로필" };
    const target = r => r.type === "user" ? `#/u/${encodeURIComponent(r.targetId)}` : r.type === "post" ? `#/post/${encodeURIComponent(r.targetId)}` : r.type === "review" ? `#/course/${encodeURIComponent((r.extra || {}).cid || "")}` : r.type === "course" ? `#/course/${encodeURIComponent(r.targetId)}` : `#/poll/${encodeURIComponent(r.targetId)}`;
    paint(t, page(`
      ${header("신고 처리", { back: true })}
      ${reps.length ? reps.map(r => `<div class="card sub-card">
        <div class="rv-top"><b>[${label[r.type] || r.type}] ${esc((r.extra || {}).title || r.targetId)}</b><span class="status ${r.status === "open" ? "pending" : "ok"}">${r.status === "open" ? "대기" : "처리됨"}</span></div>
        <p class="tiny">사유: ${esc(r.reason)} · ${fmtDate(r.createdAt)}</p>
        <div class="row gap"><a class="btn ghost sm" href="${target(r)}">내용 보기</a>
          ${r.type === "review" && r.status === "open" ? `<button class="btn ghost sm warn" data-delrev="${esc(r.id)}">후기 삭제</button>` : ""}
          ${r.type === "post" && r.status === "open" ? `<button class="btn ghost sm warn" data-delpost="${esc(r.id)}">게시물 삭제</button>` : ""}
          ${r.status === "open" ? `<button class="btn sm" data-done="${esc(r.id)}">처리 완료</button>` : ""}</div>
      </div>`).join("") : emptyHtml("flag", "신고가 없어요", "")}
    `), () => {
      $app.querySelectorAll("[data-done]").forEach(b => (b.onclick = async () => { await S.store.resolveReport(b.dataset.done); toast("처리했어요"); render(); }));
      $app.querySelectorAll("[data-delpost]").forEach(b => (b.onclick = async () => {
        const r = reps.find(x => x.id === b.dataset.delpost); if (!r) return;
        if (!(await confirmSheet("이 게시물을 삭제할까요?", "사진과 반응이 모두 지워져요", "삭제", true))) return;
        try { await S.store.deletePost(r.targetId); await S.store.resolveReport(r.id); toast("게시물을 삭제했어요"); render(); }
        catch (e) { toast("삭제 실패: " + e.message); }
      }));
      $app.querySelectorAll("[data-delrev]").forEach(b => (b.onclick = async () => {
        const r = reps.find(x => x.id === b.dataset.delrev); if (!r) return;
        if (!(await confirmSheet("이 후기를 삭제할까요?", "", "삭제", true))) return;
        try { await S.store.deleteReview(r.extra.cid, r.extra.uid); await S.store.resolveReport(r.id); toast("후기를 삭제했어요"); render(); }
        catch (e) { toast("삭제 실패: " + e.message); }
      }));
    });
  }

  async function adminPosts(t) {
    paint(t, page(header("게시물 승인", { back: true }) + loadingHtml()));
    const posts = await S.store.listPosts();
    const pending = posts.filter(x => x.status === "pending"), done = posts.filter(x => x.status !== "pending");
    const card = x => { const st = STATUS[x.status] || STATUS.pending; const imgs = x.type === "vote" ? [x.a.img, x.b.img] : x.images || []; return `<div class="card sub-card">
      <div class="rv-top"><b>${x.type === "vote" ? "[투표] " + esc(x.question) : "[코스 후기] " + esc(x.courseTitle)}</b><span class="status ${st[1]}">${st[0]}</span></div>
      <p class="muted tiny">${esc(x.nickname)} · ${fmtDate(x.createdAt)}${x.type === "vote" ? ` · ${esc(x.a.label)} vs ${esc(x.b.label)}` : ""}</p>
      <div class="review-imgs">${imgs.map(r => imgTag(r, "")).join("")}</div>
      ${x.text ? `<p class="tiny">${esc(x.text)}</p>` : ""}
      ${x.status === "rejected" ? `<p class="tiny warn">${esc(rejectNote(x))}</p>` : ""}
      ${x.status === "pending" ? `<p class="tiny muted">얼굴·이름·학교·교복이 보이면 반려해주세요</p><div class="row gap"><button class="btn ghost grow warn" data-rej="${esc(x.id)}">반려</button><button class="btn grow" data-ok="${esc(x.id)}">승인</button></div>`
        : `<div class="row gap"><a class="btn ghost sm" href="#/post/${encodeURIComponent(x.id)}">보기</a><button class="btn ghost sm warn" data-del="${esc(x.id)}">삭제</button></div>`}
    </div>`; };
    paint(t, page(`
      ${header("게시물 승인", { back: true })}
      <div class="sec-head"><h2>대기 중 ${pending.length}</h2></div>
      ${pending.length ? pending.map(card).join("") : emptyHtml("checkCircle", "검토할 게시물이 없어요", "")}
      ${done.length ? `<div class="sec-head mt"><h2>처리 완료</h2></div>${done.map(card).join("")}` : ""}
    `), () => {
      $app.querySelectorAll("[data-ok]").forEach(b => (b.onclick = async () => { b.disabled = true; try { await S.store.approvePost(b.dataset.ok); toast("승인했어요. 피드에 공개됐어요"); render(); } catch (e) { toast("실패: " + e.message); b.disabled = false; } }));
      $app.querySelectorAll("[data-rej]").forEach(b => (b.onclick = async () => { const r = await reasonSheet("반려 사유를 골라주세요", POST_REASONS); if (r) { await S.store.rejectPost(b.dataset.rej, r); toast("반려했어요"); render(); } }));
      $app.querySelectorAll("[data-del]").forEach(b => (b.onclick = async () => { if (await confirmSheet("게시물을 삭제할까요?", "사진과 반응이 모두 지워져요", "삭제", true)) { await S.store.deletePost(b.dataset.del); toast("삭제했어요"); render(); } }));
    });
  }

  /* ---------- 네트워크 상태 ---------- */
  const $net = document.getElementById("net");
  const netUpd = () => $net.classList.toggle("show", !navigator.onLine);
  window.addEventListener("online", netUpd); window.addEventListener("offline", netUpd);

  /* ---------- 시작 ---------- */
  async function boot() {
    const started = Date.now();
    S.store = await window.TSStore.create();
    await S.store.init();
    let first = true;
    S.store.onAuth(async u => {
      S.user = u; S.profile = null; S.admin = false; S.pub = null;
      if (u) {
        try { S.profile = await S.store.getProfile(); } catch (e) { console.error(e); }
        if (S.profile) { try { S.admin = await S.store.isAdmin(); } catch (e) {} await ensurePublic(); }
      }
      if (first) {
        first = false;
        const wait = Math.max(0, 900 - (Date.now() - started));
        await new Promise(r => setTimeout(r, wait));
        document.getElementById("splash").classList.add("hide");
        S.booted = true;
      }
      const p = parse().parts[0];
      if (!u && p !== "legal" && p !== "onboarding" && p !== "install") { if (location.hash && location.hash !== "#/login") { history.replaceState(null, "", "#/login"); } }
      else if (u && !S.profile && p !== "signup" && p !== "legal") history.replaceState(null, "", "#/signup/age");
      else if (u && S.profile && (p === "signup" || p === "login" || p === "onboarding" || p === "install")) history.replaceState(null, "", "#/home");
      render();
    });
    netUpd();
  }
  boot().catch(e => { console.error(e); document.getElementById("splash").classList.add("hide"); S.booted = true; $app.innerHTML = errorHtml(e); });
})();
