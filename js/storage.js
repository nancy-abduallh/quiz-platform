/* Storage layer. Every other file talks to this one only.
   - Published on Claude: uses the shared database (results reach the teacher from any device).
   - Opened as plain files: falls back to this browser's localStorage.
   To use your own backend later, replace the functions below and keep the same names. */
const Store = (() => {
  let db = null, user = null, cloud = false;
  const subs = { exams: [], att: [] };
  const ls = {
    get(k) { try { return JSON.parse(localStorage.getItem(k)) || []; } catch (e) { return []; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };
  const ping = kind => subs[kind].forEach(f => f());

  async function init() {
    try {
      if (window.claude) { db = await claude.use("db"); user = await claude.use("user"); }
    } catch (e) { db = null; }
    cloud = !!db;
  }
  const mode = () => (cloud ? "cloud" : "local");
  const isTeacher = () => (cloud ? !!(user && user.isOwner()) : true);

  function watchExams(cb) {
    if (cloud) {
      return db.collection("exams").onSnapshot(
        s => cb(s.docs.map(d => d.data()).sort((a, b) => a.ts - b.ts)),
        () => cb([])
      );
    }
    const f = () => cb(ls.get("bw_exams"));
    subs.exams.push(f); f();
    return () => { subs.exams = subs.exams.filter(x => x !== f); };
  }
  async function saveExam(ex) {
    if (cloud) await db.collection("exams").doc(ex.id).set(ex);
    else { ls.set("bw_exams", ls.get("bw_exams").concat(ex)); ping("exams"); }
  }
  async function deleteExam(id) {
    if (cloud) await db.collection("exams").doc(id).delete();
    else { ls.set("bw_exams", ls.get("bw_exams").filter(e => e.id !== id)); ping("exams"); }
  }

  // One document per student holds all of her attempts, so nothing is ever overwritten.
  async function saveAttempt(rec) {
    if (cloud) {
      if (!user) throw new Error("not signed in");
      const ref = db.collection("attempts").doc(await user.id());
      let runs = [];
      try { const o = await ref.get(); runs = ((o.data && o.data()) || {}).runs || []; } catch (e) {}
      runs.push(rec);
      await ref.set({ runs });
    } else { ls.set("bw_att", ls.get("bw_att").concat(rec)); ping("att"); }
    return mode();
  }
  function watchAttempts(cb) {
    if (cloud) {
      return db.collection("attempts").onSnapshot(
        s => cb(s.docs.flatMap(d => d.data().runs || []).sort((a, b) => b.ts - a.ts)),
        () => cb(null)
      );
    }
    const f = () => cb(ls.get("bw_att").slice().sort((a, b) => b.ts - a.ts));
    subs.att.push(f); f();
    return () => { subs.att = subs.att.filter(x => x !== f); };
  }
  return { init, mode, isTeacher, watchExams, saveExam, deleteExam, saveAttempt, watchAttempts };
})();
