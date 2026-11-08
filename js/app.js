const MAXL=3,$=s=>document.querySelector(s),L="ABCD";
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
let S={name:"",i:0,ans:[],leaves:0,on:false,done:false,t:0},CUR=null,EXAMS=[],un=null;
let st=0;
function show(id){const cur=document.querySelector("section.v.on"),n=++st;
const go=()=>{if(n!==st)return;document.querySelectorAll("section.v").forEach(x=>{x.classList.remove("out");x.classList.toggle("on",x.id===id)});scrollTo({top:0,behavior:"smooth"})};
if(cur&&cur.id!==id){cur.classList.add("out");setTimeout(go,230)}else go()}
let TK=0,lastI=-1;const fmt=s=>String(Math.floor(s/60)).padStart(2,"0")+":"+String(s%60).padStart(2,"0");
function tick(){$("#tk").textContent=fmt(Math.floor((Date.now()-S.t0)/1000))}
function countUp(sc,n){let i=0;const el=$("#sc");el.textContent="0/"+n;if(!sc)return;const t=setInterval(()=>{i++;el.textContent=i+"/"+n;if(i>=sc)clearInterval(t)},Math.max(45,900/sc))}
function route(){if(location.hash==="#teacher"){teacher();return}if(S.on)return show("exam");show(S.done?"result":"home")}
addEventListener("hashchange",()=>{if(S.on&&location.hash==="#teacher"){location.hash="";return}route()});
function fillSel(){if(S.on)return;const s=$("#ex"),keep=s.value;s.innerHTML=EXAMS.map(e=>`<option value="${esc(e.id)}">${esc(e.title)}</option>`).join("")||`<option value="">${window.LOADED?"No exam available yet":"Loading exams…"}</option>`;s.disabled=!EXAMS.length;if(EXAMS.some(e=>e.id===keep))s.value=keep;pick()}
function pick(){CUR=EXAMS.find(e=>e.id===$("#ex").value)||EXAMS[0]||null;$("#nq").textContent=CUR?CUR.qs.length+" multiple-choice questions":"No exam is available yet";chk()}
function chk(){$("#go").disabled=!CUR||$("#nm").value.trim().length<2}
$("#ex").onchange=pick;
$("#nm").oninput=chk;
$("#go").onclick=()=>{S={name:$("#nm").value.trim(),i:0,ans:[],leaves:0,on:true,done:false,t:0};try{document.documentElement.requestFullscreen&&document.documentElement.requestFullscreen().catch(()=>{})}catch(e){}$("#lv").textContent="";S.t0=Date.now();$("#sn").textContent=S.name;$("#se").textContent=CUR.title;$("#av").textContent=S.name[0].toUpperCase();clearInterval(TK);TK=setInterval(tick,1000);tick();lastI=-1;draw();show("exam")};
function draw(){const n=CUR.qs.length,x=CUR.qs[S.i],a=S.ans[S.i];
$("#cnt").textContent="Question "+(S.i+1)+" of "+n;$("#pb").style.width=(S.ans.filter(v=>v!=null).length/n*100)+"%";
$("#nav").innerHTML=CUR.qs.map((_,k)=>`<b class="${S.ans[k]!=null?"a":""} ${k===S.i?"c":""}" data-k="${k}">${k+1}</b>`).join("");
$("#nav").onclick=e=>{if(e.target.dataset.k){S.i=+e.target.dataset.k;draw()}};
const last=S.i===n-1,un=n-S.ans.filter(v=>v!=null).length;
$("#qc").innerHTML=`<h2>${esc(x.q)}</h2>${x.c?`<pre>${esc(x.c)}</pre>`:""}`+x.o.map((t,k)=>`<button class="opt ${a===k?"s":""}" data-k="${k}"><span>${L[k]}</span>${esc(t)}</button>`).join("")+
`<div class="row"><button class="btn ghost" id="pv" ${S.i?"":"disabled"}>← Back</button>${last?`<button class="btn" id="fin">Finish${un?" ("+un+" unanswered)":""}</button>`:`<button class="btn" id="nx">Next →</button>`}</div>`;
document.querySelectorAll(".opt").forEach(b=>b.onclick=()=>{S.ans[S.i]=+b.dataset.k;draw()});
$("#pv").onclick=()=>{S.i--;draw()};if($("#nx"))$("#nx").onclick=()=>{S.i++;draw()};if($("#fin"))$("#fin").onclick=()=>finish();if(lastI!==S.i){const c=$("#qc");c.classList.remove("sl","sr");void c.offsetWidth;c.classList.add(S.i>lastI?"sl":"sr");lastI=S.i}}
let lock=0;function leave(){if(!S.on)return;const n=Date.now();if(n-lock<1200)return;lock=n;S.leaves++;$("#lv").textContent="Tab leaves: "+S.leaves+"/"+MAXL;$("#wn").textContent=S.leaves;$("#warn").classList.add("on");if(S.leaves>=MAXL){$("#warn").classList.remove("on");finish()}}
document.addEventListener("visibilitychange",()=>{if(document.hidden)leave()});addEventListener("blur",leave);
["contextmenu","copy","paste","cut"].forEach(t=>document.addEventListener(t,e=>{if(S.on)e.preventDefault()}));
async function finish(){S.on=false;S.done=true;clearInterval(TK);try{document.fullscreenElement&&document.exitFullscreen()}catch(e){}
const n=CUR.qs.length,sc=CUR.qs.filter((q,k)=>S.ans[k]===q.a).length,p=Math.round(sc/n*100);
show("result");countUp(sc,n);$("#pc").textContent=p+"%";
$("#msg").textContent=p>=80?"Excellent work, "+S.name+"!":p>=50?"Good effort, "+S.name+"!":"Keep going, "+S.name+"!";
requestAnimationFrame(()=>setTimeout(()=>$("#rg").style.strokeDashoffset=628.3*(1-sc/n),80));
$("#rv").innerHTML=CUR.qs.map((q,k)=>{const ok=S.ans[k]===q.a,m=S.ans[k];return `<div class="card it ${ok?"":"w"}" style="animation-delay:${k*.08}s"><span class="tag">${ok?"✓ Correct":"✗ Wrong"} · Question ${k+1}</span><h3>${esc(q.q)}</h3>${q.c?`<pre>${esc(q.c)}</pre>`:""}<div>${ok?"Your answer: ":"Your answer: <b>"+(m==null?"none":L[m]+". "+esc(q.o[m]))+"</b><br>Correct answer: "}<b>${L[q.a]}. ${esc(q.o[q.a])}</b></div><div class="why">${esc(q.why)}</div></div>`}).join("");
$("#sv").textContent="Saving your result…";
const rec={name:S.name,exam:CUR.title,examId:CUR.id,score:sc,total:n,leaves:S.leaves,secs:Math.floor((Date.now()-S.t0)/1000),ts:Date.now(),answers:S.ans.map(v=>v==null?-1:v)};
try{const m=await Store.saveAttempt(rec);$("#sv").textContent=m==="cloud"?"Result sent to your teacher ✓":"Result saved on this computer ✓"}catch(e){$("#sv").textContent="Could not save your result. Please tell your teacher."}}
