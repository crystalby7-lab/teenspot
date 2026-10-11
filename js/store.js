// 데이터 계층: Firebase 설정이 있으면 Firestore, 없으면 체험 모드(이 기기 저장)
(function () {
  const CFG = window.TS_CONFIG || {};
  const SEED = window.TS_SEED || { courses: [], polls: [] };
  const useFirebase = !!(CFG.firebase && CFG.firebase.apiKey);
  const now = () => Date.now();
  const rid = () => Math.random().toString(36).slice(2, 9) + now().toString(36);

  function withStats(course, reviews) {
    const rs = reviews || [];
    const rec = rs.filter(r => r.recommend).length;
    const spent = rs.length ? Math.round(rs.reduce((s, r) => s + (r.spent || 0), 0) / rs.length) : null;
    const total = (course.stops || []).reduce((s, x) => s + (Number(x.cost) || 0), 0);
    return { ...course, total, reviewCount: rs.length, recCount: rec, avgSpent: spent };
  }
  function cleanPost(p) {
    const out = { type: p.type === "vote" ? "vote" : "review", text: String(p.text || "").slice(0, 100) };
    if (out.type === "vote") {
      out.cat = p.cat; out.question = String(p.question || "").slice(0, 30);
      out.a = { label: String(p.a.label || "").slice(0, 15), img: p.a.img };
      out.b = { label: String(p.b.label || "").slice(0, 15), img: p.b.img };
    } else {
      out.courseId = p.courseId; out.courseTitle = p.courseTitle || "";
      out.images = (p.images || []).slice(0, 4);
    }
    return out;
  }
  function withReactions(p, rs, uid) {
    const arr = rs || [], praise = {};
    arr.forEach(r => { if (r.praise) praise[r.praise] = (praise[r.praise] || 0) + 1; });
    const mine = arr.find(r => r.uid === uid) || null;
    return { ...p, likes: arr.filter(r => r.like).length, praise, myLike: !!(mine && mine.like), myPraise: mine ? mine.praise || null : null };
  }
  const postImageRefs = p => (p.type === "vote" ? [p.a && p.a.img, p.b && p.b.img] : p.images || []).filter(r => typeof r === "string" && r.indexOf("img:") === 0).map(r => r.slice(4));
  const byNewest = (a, b) => (b.approvedAt || b.createdAt || 0) - (a.approvedAt || a.createdAt || 0);

  function cleanPublic(p) {
    const out = {};
    if (p.nickname != null) out.nickname = String(p.nickname).slice(0, 10);
    if (p.birthYear != null) out.birthYear = Number(p.birthYear);
    if (p.birthMonth != null) out.birthMonth = Number(p.birthMonth);
    if (p.avatar) out.avatar = p.avatar;
    if (p.styleTags) out.styleTags = p.styleTags.slice(0, 3);
    if (p.playTags) out.playTags = p.playTags.slice(0, 3);
    if (p.personalColor != null) out.personalColor = p.personalColor;
    return out;
  }

  function cleanCourse(c) {
    return {
      title: c.title, gu: c.gu, area: c.area || "",
      peopleMin: Number(c.peopleMin) || 1, peopleMax: Number(c.peopleMax) || 6,
      hours: Number(c.hours) || 3,
      stops: (c.stops || []).map(s => ({ name: s.name, cost: Number(s.cost) || 0, note: s.note || "" })),
      note: c.note || ""
    };
  }

  /* ---------------- 체험 모드 ---------------- */
  function makeDemo() {
    const KEY = "teenspot-demo-v1";
    let d = null;
    const listeners = [];
    function fresh() {
      const courses = {}, polls = {};
      SEED.courses.forEach(c => { courses[c.id] = { ...cleanCourse(c), id: c.id, createdAt: now() }; });
      SEED.polls.forEach((p, i) => { polls[p.id] = { ...p, createdAt: now() - i }; });
      return { authUid: null, users: {}, nicknames: {}, courses, reviews: {}, polls, votes: {}, saves: {}, submissions: {}, reports: {}, images: {}, posts: seedPosts(), reactions: {}, publics: seedPublics() };
    }
    function seedPublics() { return JSON.parse(JSON.stringify(SEED.publicProfiles || {})); }
    function seedPosts() {
      const posts = {};
      (SEED.posts || []).forEach((p, i) => { posts[p.id] = { ...p, status: "approved", pollId: p.type === "vote" ? p.id : null, createdAt: now() - (i + 1) * 3600e3, approvedAt: now() - (i + 1) * 3600e3 }; });
      return posts;
    }
    function db() {
      if (d) return d;
      try { const raw = localStorage.getItem(KEY); if (raw) d = JSON.parse(raw); } catch (e) {}
      if (!d) d = fresh();
      if (!d.publics) d.publics = seedPublics();
      if (!d.posts) { d.posts = seedPosts(); d.images = d.images || {}; d.reactions = d.reactions || {}; SEED.polls.forEach(p => { if (d.polls[p.id]) d.polls[p.id] = { ...d.polls[p.id], a: p.a, b: p.b }; }); }
      return d;
    }
    function save() { try { localStorage.setItem(KEY, JSON.stringify(d)); return true; } catch (e) { return false; } }
    const user = () => (db().authUid ? { uid: db().authUid, email: "demo@teenspot.app" } : null);
    const me = () => db().authUid;
    function emit() { listeners.forEach(f => f(user())); }
    const reviewsOf = cid => Object.values(db().reviews[cid] || {});

    return {
      mode: "demo",
      async init() { db(); },
      onAuth(cb) { listeners.push(cb); setTimeout(() => cb(user()), 0); },
      async signIn() { db().authUid = "demo-user"; save(); emit(); },
      async signOut() { db().authUid = null; save(); emit(); },
      async getProfile() { return db().users[me()] || null; },
      async saveProfile(p) { db().users[me()] = { ...(db().users[me()] || {}), ...p, updatedAt: now() }; save(); },
      async nicknameTaken(n) { const o = db().nicknames[n]; return !!o && o !== me(); },
      async setNickname(n, old) {
        const t = db().nicknames;
        if (t[n] && t[n] !== me()) throw new Error("이미 사용 중인 닉네임이에요");
        if (old && old !== n && t[old] === me()) delete t[old];
        t[n] = me(); save();
      },
      async listCourses() { return Object.values(db().courses).map(c => withStats(c, reviewsOf(c.id))); },
      async getCourse(id) { const c = db().courses[id]; return c ? withStats(c, reviewsOf(id)) : null; },
      async listReviews(cid) { return reviewsOf(cid).sort((a, b) => b.createdAt - a.createdAt); },
      async myReview(cid) { return (db().reviews[cid] || {})[me()] || null; },
      async saveReview(cid, r) {
        const p = db().users[me()];
        db().reviews[cid] = db().reviews[cid] || {};
        const old = db().reviews[cid][me()];
        db().reviews[cid][me()] = { ...r, uid: me(), cid, nickname: p.nickname, createdAt: old ? old.createdAt : now(), updatedAt: now() };
        save();
      },
      async deleteReview(cid, uid) { if (db().reviews[cid]) delete db().reviews[cid][uid || me()]; save(); },
      async myReviews() {
        const out = [];
        Object.entries(db().reviews).forEach(([cid, m]) => { if (m[me()]) out.push({ ...m[me()], courseTitle: (db().courses[cid] || {}).title || "삭제된 코스" }); });
        return out.sort((a, b) => b.createdAt - a.createdAt);
      },
      async submitCourse(c) {
        const id = rid();
        db().submissions[id] = { ...cleanCourse(c), id, uid: me(), nickname: db().users[me()].nickname, status: "pending", createdAt: now() };
        save(); return id;
      },
      async mySubmissions() { return Object.values(db().submissions).filter(s => s.uid === me()).sort((a, b) => b.createdAt - a.createdAt); },
      async listPolls() { return Object.values(db().polls).sort((a, b) => b.createdAt - a.createdAt); },
      async myVotes() { const o = {}; Object.entries(db().votes).forEach(([pid, m]) => { if (m[me()]) o[pid] = m[me()]; }); return o; },
      async vote(pid, choice) {
        db().votes[pid] = db().votes[pid] || {};
        if (db().votes[pid][me()]) return;
        db().votes[pid][me()] = choice; save();
      },
      async pollResult(pid) { const v = Object.values(db().votes[pid] || {}); return { a: v.filter(x => x === "a").length, b: v.filter(x => x === "b").length }; },
      async getSaves() { const s = db().saves[me()] || {}; return Object.values(s); },
      async toggleSave(type, id) {
        const s = (db().saves[me()] = db().saves[me()] || {});
        const k = type + "_" + id;
        if (s[k]) { delete s[k]; save(); return false; }
        s[k] = { type, id, at: now() }; save(); return true;
      },
      async report(type, targetId, reason, extra) {
        const id = rid();
        db().reports[id] = { id, type, targetId, reason, extra: extra || {}, uid: me(), status: "open", createdAt: now() };
        save();
      },
      async deleteAccount() {
        const u = me(), D = db();
        Object.values(D.reviews).forEach(m => delete m[u]);
        Object.values(D.votes).forEach(m => delete m[u]);
        Object.keys(D.submissions).forEach(k => { if (D.submissions[k].uid === u) delete D.submissions[k]; });
        Object.keys(D.reports).forEach(k => { if (D.reports[k].uid === u) delete D.reports[k]; });
        Object.keys(D.nicknames).forEach(k => { if (D.nicknames[k] === u) delete D.nicknames[k]; });
        Object.values(D.posts).filter(p => p.uid === u).forEach(p => { postImageRefs(p).forEach(k => delete D.images[k]); if (p.pollId) { delete D.polls[p.pollId]; delete D.votes[p.pollId]; } delete D.reactions[p.id]; delete D.posts[p.id]; });
        Object.keys(D.images).forEach(k => { if (D.images[k].uid === u) delete D.images[k]; });
        Object.values(D.reactions).forEach(m => delete m[u]);
        delete D.saves[u]; delete D.users[u]; delete D.publics[u];
        D.authUid = null; save(); emit();
      },
      async resetDemo() { d = fresh(); save(); emit(); },
      // 공개 프로필
      async getPublicProfile(uid) { return db().publics[uid || me()] || null; },
      async getPublicProfiles(uids) { const o = {}; uids.forEach(u => { if (db().publics[u]) o[u] = db().publics[u]; }); return o; },
      async savePublicProfile(p) { db().publics[me()] = { ...(db().publics[me()] || {}), ...cleanPublic(p), uid: me(), updatedAt: now() }; save(); },

      // 피드
      async uploadImage(dataUrl) {
        const id = rid(); db().images[id] = { data: dataUrl, uid: me() };
        if (!save()) { delete db().images[id]; throw new Error("체험 모드 저장 공간이 가득 찼어요. 설정에서 체험 데이터를 초기화해주세요"); }
        return "img:" + id;
      },
      async getImage(id) { const x = db().images[id]; return x ? x.data : ""; },
      async createPost(p) {
        const id = rid();
        db().posts[id] = { ...cleanPost(p), id, uid: me(), nickname: db().users[me()].nickname, status: "pending", createdAt: now() };
        save(); return id;
      },
      async listFeed() {
        const R = db().reactions;
        return Object.values(db().posts).filter(p => p.status === "approved").map(p => withReactions(p, Object.values(R[p.id] || {}), me())).sort(byNewest);
      },
      async myPosts() { return Object.values(db().posts).filter(p => p.uid === me()).sort((a, b) => b.createdAt - a.createdAt); },
      async react(pid, r) {
        const R = db().reactions; R[pid] = R[pid] || {};
        const cur = R[pid][me()] || { like: false, praise: null };
        R[pid][me()] = { ...cur, ...r, uid: me(), at: now() }; save();
      },
      async deletePost(id) {
        const D = db(), p = D.posts[id]; if (!p) return;
        postImageRefs(p).forEach(k => delete D.images[k]);
        if (p.pollId) { delete D.polls[p.pollId]; delete D.votes[p.pollId]; }
        delete D.reactions[id]; delete D.posts[id]; save();
      },

      // 관리자 (체험 모드에서는 누구나 관리자)
      async listPosts() { return Object.values(db().posts).sort((a, b) => b.createdAt - a.createdAt); },
      async approvePost(id) {
        const D = db(), p = D.posts[id]; if (!p) return;
        if (p.type === "vote") { D.polls[id] = { id, cat: p.cat, question: p.question, a: p.a, b: p.b, uid: p.uid, nickname: p.nickname, createdAt: now() }; p.pollId = id; }
        p.status = "approved"; p.approvedAt = now(); save();
      },
      async rejectPost(id) { const p = db().posts[id]; if (p) { p.status = "rejected"; save(); } },
      async isAdmin() { return true; },
      async listSubmissions() { return Object.values(db().submissions).sort((a, b) => b.createdAt - a.createdAt); },
      async approveSubmission(id) {
        const s = db().submissions[id]; if (!s) return;
        const cid = rid();
        db().courses[cid] = { ...cleanCourse(s), id: cid, submittedBy: s.nickname, createdAt: now() };
        s.status = "approved"; s.courseId = cid; save();
      },
      async rejectSubmission(id) { if (db().submissions[id]) { db().submissions[id].status = "rejected"; save(); } },
      async saveCourse(c) { const id = c.id || rid(); db().courses[id] = { ...(db().courses[id] || { createdAt: now() }), ...cleanCourse(c), id }; save(); return id; },
      async deleteCourse(id) { delete db().courses[id]; delete db().reviews[id]; save(); },
      async savePoll(p) {
        const id = p.id || rid();
        db().polls[id] = { ...(db().polls[id] || { createdAt: now() }), id, cat: p.cat, question: p.question, a: p.a, b: p.b };
        save(); return id;
      },
      async deletePoll(id) { delete db().polls[id]; delete db().votes[id]; save(); },
      async listReports() { return Object.values(db().reports).sort((a, b) => b.createdAt - a.createdAt); },
      async resolveReport(id) { if (db().reports[id]) { db().reports[id].status = "done"; save(); } },
      async importSeed() { const f = fresh(); Object.assign(db().courses, f.courses); Object.assign(db().polls, f.polls); Object.assign(db().posts, f.posts); save(); }
    };
  }

  /* ---------------- Firebase 모드 ---------------- */
  async function makeFirebase() {
    const base = "https://www.gstatic.com/firebasejs/10.12.2/";
    const [App, A, F] = await Promise.all([
      import(base + "firebase-app.js"), import(base + "firebase-auth.js"), import(base + "firebase-firestore.js")
    ]);
    const app = App.initializeApp(CFG.firebase);
    const auth = A.getAuth(app);
    const fs = F.getFirestore(app);
    const { doc, getDoc, getDocs, setDoc, addDoc, updateDoc, deleteDoc, collection, collectionGroup, query, where, getCountFromServer } = F;
    const provider = new A.GoogleAuthProvider();
    const me = () => auth.currentUser && auth.currentUser.uid;
    const list = snap => snap.docs.map(x => ({ ...x.data(), id: x.id }));
    try { await A.getRedirectResult(auth); } catch (e) {}

    let reviewCache = null;
    async function allReviews() {
      if (reviewCache) return reviewCache;
      const snap = await getDocs(collectionGroup(fs, "reviews"));
      const m = {};
      snap.docs.forEach(x => { const cid = x.ref.parent.parent.id; (m[cid] = m[cid] || []).push({ ...x.data(), cid }); });
      reviewCache = m; return m;
    }
    const dirty = () => { reviewCache = null; };
    let rxCache = null;
    const pubCache = {};
    async function allReactions() {
      if (rxCache) return rxCache;
      const snap = await getDocs(collectionGroup(fs, "reactions"));
      const m = {};
      snap.docs.forEach(x => { const pid = x.ref.parent.parent.id; (m[pid] = m[pid] || []).push(x.data()); });
      rxCache = m; return m;
    }
    async function removePost(id) {
      const s = await getDoc(doc(fs, "posts", id)); if (!s.exists()) return;
      const p = s.data();
      const rx = await getDocs(collection(fs, "posts", id, "reactions"));
      await Promise.all(rx.docs.map(x => deleteDoc(x.ref)));
      if (p.pollId) {
        const vs = await getDocs(collection(fs, "polls", p.pollId, "votes"));
        await Promise.all(vs.docs.map(x => deleteDoc(x.ref)));
        await deleteDoc(doc(fs, "polls", p.pollId));
      }
      await Promise.all(postImageRefs(p).map(k => deleteDoc(doc(fs, "images", k)).catch(() => {})));
      await deleteDoc(doc(fs, "posts", id));
      rxCache = null;
    }

    return {
      mode: "firebase",
      async init() {},
      onAuth(cb) { A.onAuthStateChanged(auth, u => cb(u ? { uid: u.uid, email: u.email } : null)); },
      async signIn() {
        try { await A.signInWithPopup(auth, provider); }
        catch (e) {
          if (["auth/popup-blocked", "auth/operation-not-supported-in-this-environment", "auth/cancelled-popup-request"].includes(e.code)) return A.signInWithRedirect(auth, provider);
          if (e.code === "auth/popup-closed-by-user") return;
          throw e;
        }
      },
      async signOut() { await A.signOut(auth); },
      async getProfile() { const s = await getDoc(doc(fs, "users", me())); return s.exists() ? s.data() : null; },
      async saveProfile(p) { await setDoc(doc(fs, "users", me()), { ...p, updatedAt: now() }, { merge: true }); },
      async nicknameTaken(n) { const s = await getDoc(doc(fs, "nicknames", n)); return s.exists() && s.data().uid !== me(); },
      async setNickname(n, old) {
        const s = await getDoc(doc(fs, "nicknames", n));
        if (s.exists()) { if (s.data().uid === me()) return; throw new Error("이미 사용 중인 닉네임이에요"); }
        await setDoc(doc(fs, "nicknames", n), { uid: me() });
        if (old && old !== n) { try { await deleteDoc(doc(fs, "nicknames", old)); } catch (e) {} }
      },
      async listCourses() { const [snap, rv] = await Promise.all([getDocs(collection(fs, "courses")), allReviews()]); return list(snap).map(c => withStats(c, rv[c.id])); },
      async getCourse(id) { const s = await getDoc(doc(fs, "courses", id)); if (!s.exists()) return null; const rv = await allReviews(); return withStats({ ...s.data(), id }, rv[id]); },
      async listReviews(cid) { const snap = await getDocs(collection(fs, "courses", cid, "reviews")); return snap.docs.map(x => ({ ...x.data(), cid })).sort((a, b) => b.createdAt - a.createdAt); },
      async myReview(cid) { const s = await getDoc(doc(fs, "courses", cid, "reviews", me())); return s.exists() ? s.data() : null; },
      async saveReview(cid, r) {
        const p = await this.getProfile(); const old = await this.myReview(cid);
        await setDoc(doc(fs, "courses", cid, "reviews", me()), { ...r, uid: me(), nickname: p.nickname, createdAt: old ? old.createdAt : now(), updatedAt: now() });
        dirty();
      },
      async deleteReview(cid, uid) { await deleteDoc(doc(fs, "courses", cid, "reviews", uid || me())); dirty(); },
      async myReviews() {
        const [rv, snap] = await Promise.all([allReviews(), getDocs(collection(fs, "courses"))]);
        const titles = {}; snap.docs.forEach(x => { titles[x.id] = x.data().title; });
        const out = []; Object.values(rv).forEach(arr => arr.forEach(r => { if (r.uid === me()) out.push({ ...r, courseTitle: titles[r.cid] || "삭제된 코스" }); }));
        return out.sort((a, b) => b.createdAt - a.createdAt);
      },
      async submitCourse(c) {
        const p = await this.getProfile();
        const r = await addDoc(collection(fs, "submissions"), { ...cleanCourse(c), uid: me(), nickname: p.nickname, status: "pending", createdAt: now() });
        return r.id;
      },
      async mySubmissions() { const snap = await getDocs(query(collection(fs, "submissions"), where("uid", "==", me()))); return list(snap).sort((a, b) => b.createdAt - a.createdAt); },
      async listPolls() { return list(await getDocs(collection(fs, "polls"))).sort((a, b) => b.createdAt - a.createdAt); },
      async myVotes() {
        const polls = await this.listPolls(); const o = {};
        await Promise.all(polls.map(async p => { const s = await getDoc(doc(fs, "polls", p.id, "votes", me())); if (s.exists()) o[p.id] = s.data().choice; }));
        return o;
      },
      async vote(pid, choice) {
        const ref = doc(fs, "polls", pid, "votes", me());
        if ((await getDoc(ref)).exists()) return;
        await setDoc(ref, { choice, at: now() });
      },
      async pollResult(pid) {
        const c = collection(fs, "polls", pid, "votes");
        const [a, b] = await Promise.all([getCountFromServer(query(c, where("choice", "==", "a"))), getCountFromServer(query(c, where("choice", "==", "b")))]);
        return { a: a.data().count, b: b.data().count };
      },
      async getSaves() { return list(await getDocs(collection(fs, "users", me(), "saves"))); },
      async toggleSave(type, id) {
        const ref = doc(fs, "users", me(), "saves", type + "_" + id);
        if ((await getDoc(ref)).exists()) { await deleteDoc(ref); return false; }
        await setDoc(ref, { type, id, at: now() }); return true;
      },
      async report(type, targetId, reason, extra) { await addDoc(collection(fs, "reports"), { type, targetId, reason, extra: extra || {}, uid: me(), status: "open", createdAt: now() }); },
      async deleteAccount() {
        const user = auth.currentUser;
        try { await A.reauthenticateWithPopup(user, provider); } catch (e) { if (e.code !== "auth/user-mismatch") throw e; }
        const uid = user.uid;
        const p = await this.getProfile();
        const [courses, polls, subs, reps, saves] = await Promise.all([
          getDocs(collection(fs, "courses")), getDocs(collection(fs, "polls")),
          getDocs(query(collection(fs, "submissions"), where("uid", "==", uid))),
          getDocs(query(collection(fs, "reports"), where("uid", "==", uid))),
          getDocs(collection(fs, "users", uid, "saves"))
        ]);
        const jobs = [];
        courses.docs.forEach(c => jobs.push(deleteDoc(doc(fs, "courses", c.id, "reviews", uid))));
        polls.docs.forEach(x => jobs.push(deleteDoc(doc(fs, "polls", x.id, "votes", uid))));
        subs.docs.concat(reps.docs, saves.docs).forEach(x => jobs.push(deleteDoc(x.ref)));
        await Promise.all(jobs);
        const [myPosts, approved, myImgs] = await Promise.all([
          getDocs(query(collection(fs, "posts"), where("uid", "==", uid))),
          getDocs(query(collection(fs, "posts"), where("status", "==", "approved"))),
          getDocs(query(collection(fs, "images"), where("uid", "==", uid)))
        ]);
        for (const x of myPosts.docs) await removePost(x.id);
        await Promise.all(approved.docs.map(x => deleteDoc(doc(fs, "posts", x.id, "reactions", uid)).catch(() => {})));
        await Promise.all(myImgs.docs.map(x => deleteDoc(x.ref).catch(() => {})));
        if (p && p.nickname) { try { await deleteDoc(doc(fs, "nicknames", p.nickname)); } catch (e) {} }
        try { await deleteDoc(doc(fs, "publicProfiles", uid)); } catch (e) {}
        await deleteDoc(doc(fs, "users", uid));
        await A.deleteUser(user);
        dirty();
      },
      async getPublicProfile(uid) { const s = await getDoc(doc(fs, "publicProfiles", uid || me())); return s.exists() ? s.data() : null; },
      async getPublicProfiles(uids) {
        const o = {};
        await Promise.all([...new Set(uids)].map(async u => {
          if (pubCache[u]) { o[u] = pubCache[u]; return; }
          try { const s = await getDoc(doc(fs, "publicProfiles", u)); if (s.exists()) o[u] = pubCache[u] = s.data(); } catch (e) {}
        }));
        return o;
      },
      async savePublicProfile(p) { await setDoc(doc(fs, "publicProfiles", me()), { ...cleanPublic(p), uid: me(), updatedAt: now() }, { merge: true }); delete pubCache[me()]; },
      async uploadImage(dataUrl) { const r = await addDoc(collection(fs, "images"), { data: dataUrl, uid: me(), createdAt: now() }); return "img:" + r.id; },
      async getImage(id) { const s = await getDoc(doc(fs, "images", id)); return s.exists() ? s.data().data : ""; },
      async createPost(p) {
        const prof = await this.getProfile();
        const r = await addDoc(collection(fs, "posts"), { ...cleanPost(p), uid: me(), nickname: prof.nickname, status: "pending", createdAt: now() });
        return r.id;
      },
      async listFeed() {
        const [snap, rx] = await Promise.all([getDocs(query(collection(fs, "posts"), where("status", "==", "approved"))), allReactions()]);
        return list(snap).map(p => withReactions(p, rx[p.id], me())).sort(byNewest);
      },
      async myPosts() { return list(await getDocs(query(collection(fs, "posts"), where("uid", "==", me())))).sort((a, b) => b.createdAt - a.createdAt); },
      async react(pid, r) {
        const ref = doc(fs, "posts", pid, "reactions", me());
        const s = await getDoc(ref);
        const cur = s.exists() ? s.data() : { like: false, praise: null };
        await setDoc(ref, { like: !!cur.like, praise: cur.praise || null, ...r, uid: me(), at: now() });
        rxCache = null;
      },
      async deletePost(id) { await removePost(id); },
      async listPosts() { return list(await getDocs(collection(fs, "posts"))).sort((a, b) => b.createdAt - a.createdAt); },
      async approvePost(id) {
        const s = await getDoc(doc(fs, "posts", id)); if (!s.exists()) return;
        const p = s.data();
        if (p.type === "vote") await setDoc(doc(fs, "polls", id), { cat: p.cat, question: p.question, a: p.a, b: p.b, uid: p.uid, nickname: p.nickname, createdAt: now() });
        await updateDoc(doc(fs, "posts", id), { status: "approved", pollId: p.type === "vote" ? id : null, approvedAt: now() });
      },
      async rejectPost(id) { await updateDoc(doc(fs, "posts", id), { status: "rejected" }); },
      async isAdmin() { try { return (await getDoc(doc(fs, "admins", me()))).exists(); } catch (e) { return false; } },
      async listSubmissions() { return list(await getDocs(collection(fs, "submissions"))).sort((a, b) => b.createdAt - a.createdAt); },
      async approveSubmission(id) {
        const s = await getDoc(doc(fs, "submissions", id)); if (!s.exists()) return;
        const data = s.data();
        const r = await addDoc(collection(fs, "courses"), { ...cleanCourse(data), submittedBy: data.nickname, createdAt: now() });
        await updateDoc(doc(fs, "submissions", id), { status: "approved", courseId: r.id });
      },
      async rejectSubmission(id) { await updateDoc(doc(fs, "submissions", id), { status: "rejected" }); },
      async saveCourse(c) {
        if (c.id) { await setDoc(doc(fs, "courses", c.id), cleanCourse(c), { merge: true }); return c.id; }
        const r = await addDoc(collection(fs, "courses"), { ...cleanCourse(c), createdAt: now() }); return r.id;
      },
      async deleteCourse(id) {
        const rs = await getDocs(collection(fs, "courses", id, "reviews"));
        await Promise.all(rs.docs.map(x => deleteDoc(x.ref)));
        await deleteDoc(doc(fs, "courses", id)); dirty();
      },
      async savePoll(p) {
        const data = { cat: p.cat, question: p.question, a: p.a, b: p.b };
        if (p.id) { await setDoc(doc(fs, "polls", p.id), data, { merge: true }); return p.id; }
        const r = await addDoc(collection(fs, "polls"), { ...data, createdAt: now() }); return r.id;
      },
      async deletePoll(id) {
        const vs = await getDocs(collection(fs, "polls", id, "votes"));
        await Promise.all(vs.docs.map(x => deleteDoc(x.ref)));
        await deleteDoc(doc(fs, "polls", id));
      },
      async listReports() { return list(await getDocs(collection(fs, "reports"))).sort((a, b) => b.createdAt - a.createdAt); },
      async resolveReport(id) { await updateDoc(doc(fs, "reports", id), { status: "done" }); },
      async importSeed() {
        const t = now();
        await Promise.all(SEED.courses.map(c => setDoc(doc(fs, "courses", c.id), { ...cleanCourse(c), createdAt: t })));
        await Promise.all(SEED.polls.map((p, i) => setDoc(doc(fs, "polls", p.id), { cat: p.cat, question: p.question, a: p.a, b: p.b, createdAt: t - i })));
        await Promise.all(Object.entries(SEED.publicProfiles || {}).map(([u, pp]) => setDoc(doc(fs, "publicProfiles", u), { ...pp, uid: u, updatedAt: t })));
        await Promise.all((SEED.posts || []).map((p, i) => setDoc(doc(fs, "posts", p.id), { ...p, status: "approved", pollId: p.type === "vote" ? p.id : null, createdAt: t - (i + 1) * 3600e3, approvedAt: t - (i + 1) * 3600e3 })));
      }
    };
  }

  window.TSStore = {
    async create() {
      if (useFirebase) {
        try { return await makeFirebase(); }
        catch (e) { console.error(e); const s = makeDemo(); s.loadError = e; return s; }
      }
      return makeDemo();
    }
  };
})();
