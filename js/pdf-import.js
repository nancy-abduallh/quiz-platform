/* Turns a teacher's PDF into an exam object.
   Expected layout (see README): Exam title, then Q1., options A) to D), Answer:, Explanation:, optional Code: */
const PDFImport = (() => {
  const MAX_Q = 15;
  const WORKER = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

  // Read a PDF file and return its text, one line per visual line.
  async function toText(file, lib = window.pdfjsLib) {
    if (!lib) throw new Error("The PDF reader could not load. Check the internet connection and try again.");
    if (lib.GlobalWorkerOptions) lib.GlobalWorkerOptions.workerSrc = WORKER;
    const buf = file.arrayBuffer ? await file.arrayBuffer() : file;
    const pdf = await lib.getDocument({ data: buf }).promise;
    const out = [];
    for (let p = 1; p <= pdf.numPages; p++) {
      const content = await (await pdf.getPage(p)).getTextContent();
      const rows = [];
      let y = null, row = null;
      for (const it of content.items) {
        if (!it.str && !it.hasEOL) continue;
        const yy = Math.round(it.transform[5]);
        if (row === null || Math.abs(yy - y) > 3) {
          // width of one character, used to turn the left offset into indentation spaces
          const cw = it.str.length ? it.width / it.str.length : 6;
          row = { x: it.transform[4], cw: cw > 1 ? cw : 6, t: "" };
          rows.push(row); y = yy;
        }
        row.t += it.str;
      }
      const minX = rows.length ? Math.min(...rows.map(r => r.x)) : 0;
      for (const r of rows) out.push(" ".repeat(Math.max(0, Math.round((r.x - minX) / r.cw))) + r.t);
    }
    const text = out.join("\n");
    if (text.replace(/\s/g, "").length < 20) throw new Error("This PDF has no readable text. Scanned photos are not supported.");
    return text;
  }

  // Parse the text into { title, qs, errors, warnings }.
  function parse(text) {
    const errors = [], warnings = [], qs = [];
    let title = "", cur = null, mode = "";
    const lines = text.replace(/\r/g, "").split("\n");

    const finish = () => {
      if (!cur) return;
      const n = cur.n, q = cur.q.trim();
      if (!q) errors.push(`Question ${n}: the question text is empty.`);
      if (cur.o.length < 2) errors.push(`Question ${n}: needs at least 2 options (A, B ...).`);
      if (cur.o.length > 4) errors.push(`Question ${n}: has more than 4 options.`);
      if (cur.a === null) errors.push(`Question ${n}: no "Answer:" line.`);
      else if (cur.a >= cur.o.length) errors.push(`Question ${n}: the answer points to an option that does not exist.`);
      if (!cur.why.trim()) warnings.push(`Question ${n}: no explanation. The student will see only the correct answer.`);
      const item = { q, o: cur.o.map(x => x.trim()), a: cur.a === null ? 0 : cur.a, why: cur.why.trim() };
      if (cur.c.length) item.c = cur.c.join("\n").replace(/\s+$/, "");
      qs.push(item);
      cur = null;
    };

    for (const raw of lines) {
      const l = raw.trim();
      if (!l) continue;
      let m;
      if (!cur && (m = l.match(/^(?:exam|title)\s*[:：-]\s*(.+)$/i))) { title = m[1].trim(); continue; }
      if ((m = l.match(/^(?:q(?:uestion)?\s*)?(\d{1,2})\s*[.):]\s*(.*)$/i)) && mode !== "c") {
        finish(); cur = { n: m[1], q: m[2], c: [], o: [], a: null, why: "" }; mode = "q"; continue;
      }
      if (!cur) continue;
      if ((m = l.match(/^answer\s*[:：-]\s*\(?([A-D])\)?/i))) { cur.a = "ABCD".indexOf(m[1].toUpperCase()); mode = "a"; continue; }
      if ((m = l.match(/^(?:explanation|why)\s*[:：-]\s*(.*)$/i))) { cur.why = m[1]; mode = "e"; continue; }
      if ((m = l.match(/^code\s*[:：-]\s*(.*)$/i))) { mode = "c"; if (m[1]) cur.c.push(m[1]); continue; }
      if ((m = l.match(/^\(?([A-D])\s*[.)]\s*(.*)$/))) {
        if (mode === "c" && cur.o.length === 0 && m[1] !== "A") { cur.c.push(raw.replace(/\s+$/, "")); continue; }
        cur.o.push(m[2]); mode = "o"; continue;
      }
      if (mode === "q") cur.q += " " + l;
      else if (mode === "c") cur.c.push(raw.replace(/\s+$/, ""));
      else if (mode === "o") cur.o[cur.o.length - 1] += " " + l;
      else if (mode === "e") cur.why += " " + l;
    }
    finish();
    if (!qs.length) errors.push("No questions found. Questions must start like \"Q1.\" or \"1.\".");
    if (qs.length > MAX_Q) errors.push(`This exam has ${qs.length} questions. The maximum is ${MAX_Q}.`);
    return { title, qs, errors, warnings };
  }
  return { toText, parse, MAX_Q };
})();
if (typeof module !== "undefined") module.exports = PDFImport;
