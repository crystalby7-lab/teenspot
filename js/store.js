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
      return { authUid: null, users: {}, nicknames: {}, courses, reviews: {}, polls, votes: {}, saves: {}, submissions: {}, reports: {} };
    }
    function db() {
      if (d) return d;
      try { const raw = localStorage.getItem(KEY); if (raw) d = JSON.parse(raw); } catch (e) {}
      if (!d) d = fresh();
      return d;
    }
    function save() { try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) {} }
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
        delete D.saves[u]; delete D.users[u];
        D.authUid = null; save(); emit();
      },
      async resetDemo() { d = fresh(); save(); emit(); },
      // 관리자 (체험 모드에서는 누구나 관리자)
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
      async importSeed() { const f = fresh(); Object.assign(db().courses, f.courses); Object.assign(db().polls, f.polls); save(); }
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
        if (p && p.nickname) { try { await deleteDoc(doc(fs, "nicknames", p.nickname)); } catch (e) {} }
        await deleteDoc(doc(fs, "users", uid));
        await A.deleteUser(user);
        dirty();
      },
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
