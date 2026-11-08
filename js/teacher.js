/* Teacher area (#teacher): upload exam PDF, publish/remove exams, see every student result. */
let PEND = null;

/* Access: on the published page only the owner gets in. When opened as plain files,
   the teacher area asks for a password (set the first time). This keeps students out
   of the page; it is not bank-level security. */
const PK = "bw_tpw";
const H = s => { let a = 0xdeadbeef, b = 0x41c6ce57; for (let i = 0; i < s.length; i++) { const c = s.charCodeAt(i); a = Math.imul(a ^ c, 2654435761); b = Math.imul(b ^ c, 1597334677); } a = Math.imul(a ^ (a >>> 16), 2246822507) ^ Math.imul(b ^ (b >>> 13), 3266489909); b = Math.imul(b ^ (b >>> 16), 2246822507) ^ Math.imul(a ^ (a >>> 13), 3266489909); return (4294967296 * (2097151 & b) + (a >>> 0)).toString(36); };
const getPw = () => { try { return localStorage.getItem(PK); } catch (e) { return null; } };
const unlocked = () => { try { return sessionStorage.getItem("bw_ok") === "1"; } catch (e) { return false; } };

function showGate() {
  const first = !getPw();
  $("#tbox").style.display = "none"; $("#gate").style.display = ""; $("#tm").textContent = "";
  $("#gt").textContent = first ? "Create your teacher password" : "Teacher password";
  $("#gm").textContent = first ? "Choose a password (at least 6 characters). You will need it every time you open this page." : "Enter your password to continue.";
  $("#gb").textContent = first ? "Save password" : "Unlock";
  $("#ge").textContent = ""; $("#gp").value = ""; $("#gp").focus();
}
$("#gb").onclick = () => {
  const v = $("#gp").value, first = !getPw();
  if (first) { if (v.length < 6) { $("#ge").textContent = "Use at least 6 characters."; return; } try { localStorage.setItem(PK, H(v)); } catch (e) {} }
  else if (H(v) !== getPw()) { $("#ge").textContent = "Wrong password."; return; }
  try { sessionStorage.setItem("bw_ok", "1"); } catch (e) {}
  teacher();
};
$("#gp").onkeydown = e => { if (e.key === "Enter") $("#gb").click(); };

function teacher() {
  show("teacher");
  if (un) { un(); un = null; }
  $("#gate").style.display = "none";
  if (!Store.isTeacher()) {
    $("#tbox").style.display = "none";
    $("#tm").textContent = "Only the teacher can see this page.";
    return;
  }
  if (Store.mode() === "local" && !unlocked()) { showGate(); return; }
  $("#tbox").style.display = ""; $("#tm").textContent = "";
  exList();
  un = Store.watchAttempts(rows => {
    if (!rows) { $("#tm").textContent = "Could not load results."; return; }
    $("#s1").textContent = rows.length;
    $("#s2").textContent = rows.length ? Math.round(rows.reduce((t, a) => t + a.score / a.total, 0) / rows.length * 100) + "%" : "–";
    $("#s3").textContent = rows.reduce((t, a) => t + (a.leaves || 0), 0);
    $("#tb").innerHTML = rows.map(a => {
      const p = Math.round(a.score / a.total * 100);
      const d = new Date(a.ts).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });
      return `<tr><td>${esc(a.name)}</td><td>${esc(a.exam)}</td><td><b>${a.score}/${a.total} · ${p}%</b></td><td><span class="pill ${a.leaves ? "r" : "g"}">${a.leaves}</span></td><td>${a.secs != null ? fmt(a.secs) : "–"}</td><td>${d}</td></tr>`;
    }).join("") || `<tr><td colspan="6">No attempts yet.</td></tr>`;
  });
}

function exList() {
  const rows = EXAMS;
  $("#exl").innerHTML = rows.map(e =>
    `<div class="exr"><span><b>${esc(e.title)}</b> · ${e.qs.length} questions</span><button class="btn ghost sm" data-d="${esc(e.id)}">Remove</button></div>`
  ).join("") || `<p class="mu">No exams yet. Upload a PDF above to create the first one.</p>`;
}
$("#exl").onclick = async e => {
  const b = e.target, id = b.dataset.d;
  if (!id) return;
  if (!b.dataset.sure) { b.dataset.sure = "1"; b.textContent = "Sure? Click again"; return; }
  await Store.deleteExam(id);
};

$("#pf").onchange = async e => {
  const f = e.target.files[0];
  if (!f) return;
  const pv = $("#pvw");
  PEND = null;
  pv.innerHTML = `<p class="mu">Reading your PDF…</p>`;
  try {
    const r = PDFImport.parse(await PDFImport.toText(f));
    if (!r.title) r.title = f.name.replace(/\.pdf$/i, "");
    PEND = r;
    preview();
  } catch (err) {
    pv.innerHTML = `<p class="bad">${esc(err.message || "Could not read this PDF.")}</p>`;
  }
};

function preview() {
  const r = PEND, pv = $("#pvw");
  const list = (a, cls) => a.length ? `<ul class="${cls}">${a.map(x => `<li>${esc(x)}</li>`).join("")}</ul>` : "";
  pv.innerHTML =
    `<label class="mu" style="font-weight:600;display:block;margin-top:14px">Exam title</label><input id="pt" value="${esc(r.title)}">` +
    (r.errors.length ? `<div class="bad"><b>Fix these in your PDF, then upload it again:</b>${list(r.errors, "bad")}</div>` : "") +
    (r.warnings.length ? `<div class="mu">${list(r.warnings, "mu")}</div>` : "") +
    `<p><b>${r.qs.length} question${r.qs.length === 1 ? "" : "s"} found</b>. Correct answers are in green.</p>` +
    r.qs.map((q, k) => `<div class="pq"><b>${k + 1}. ${esc(q.q)}</b><br>` +
      q.o.map((t, j) => `<span class="${j === q.a ? "okc" : ""}">${L[j]}. ${esc(t)}</span>`).join(" &nbsp;·&nbsp; ") + `</div>`).join("") +
    `<p><button class="btn" id="pub" ${r.errors.length || !r.qs.length ? "disabled" : ""}>Publish exam</button></p>`;
  $("#pub").onclick = async () => {
    const btn = $("#pub");
    btn.disabled = true;
    try {
      await Store.saveExam({ id: "e" + Date.now(), title: $("#pt").value.trim() || r.title, qs: r.qs, ts: Date.now() });
      PEND = null; $("#pf").value = "";
      pv.innerHTML = `<p class="okc">Published ✓ Your student can now pick it on the exam page.</p>`;
    } catch (err) {
      btn.disabled = false;
      pv.insertAdjacentHTML("beforeend", `<p class="bad">Could not publish. Please try again.</p>`);
    }
  };
}
