/* Start-up: connect storage, load exams, then show the right page. */
(async () => {
  EXAMS = [];
  fillSel();
  await Store.init();
  Store.watchExams(list => {
    EXAMS = list; window.LOADED = true;
    fillSel();
    if (location.hash === "#teacher") exList();
  });
  route();
})();

/* Scroll reveal for the "How it works" cards */
(() => {
  const items = document.querySelectorAll(".reveal");
  if (!window.IntersectionObserver) { items.forEach(x => x.classList.add("in")); return; }
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: 0.2 });
  items.forEach(x => io.observe(x));
})();
