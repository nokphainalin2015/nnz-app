// nnz vitamin shop · ບໍ່ຈຳເປັນຕ້ອງແກ້ໄຟລ໌ນີ້ · ແກ້ສິນຄ້າໃນ products.csv ຫຼື Google Sheet · ແກ້ເບີໃນ config.js
(function(){
const CFG = window.NNZ_CONFIG || {};
const NEEDS = [
  {id:"new", lb:"ສິນຄ້າໃໝ່", ic:'<path d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.5 6.7 19.4l1.2-6L3.4 9.3l6-.7z"/>'},
  {id:"trial", lb:"ຂວດແບ່ງລອງ", ic:'<rect x="8" y="7" width="8" height="13" rx="2.5"/><path d="M9.5 4h5v3h-5z"/>'},
  {id:"immune", lb:"ພູມຕ້ານທານ", ic:'<path d="M12 3l7 3v5c0 4.5-3 8.2-7 10-4-1.8-7-5.5-7-10V6z"/>'},
  {id:"skin", lb:"ຜິວ ແລະ ຄວາມງາມ", ic:'<path d="M12 21c-4-3-7-6-7-10a7 7 0 0 1 14 0c0 4-3 7-7 10z"/><path d="M9.5 11.5c.8 1 4.2 1 5 0"/>'},
  {id:"sleep", lb:"ນອນ ແລະ ຄວາມຄຽດ", ic:'<path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"/>'},
  {id:"joint", lb:"ກະດູກ ແລະ ຂໍ້", ic:'<path d="M8 6a2.5 2.5 0 1 0-3 3l9 9a2.5 2.5 0 1 0 3-3z"/>'},
  {id:"liver", lb:"ຕັບ ແລະ ການຍ່ອຍ", ic:'<path d="M4 9c0-3 3-4 8-4s8 2 8 5-3 9-9 9c-4 0-7-4-7-10z"/>'},
  {id:"kids", lb:"ເດັກນ້ອຍ", ic:'<circle cx="12" cy="9" r="4"/><path d="M6 20c1-3 3.5-5 6-5s5 2 6 5"/>'},
  {id:"women", lb:"ແມ່ ແລະ ຜູ້ຍິງ", ic:'<circle cx="12" cy="8" r="5"/><path d="M12 13v8M9 18h6"/>'},
  {id:"t:beauty", lb:"ຄວາມງາມ", ic:'<path d="M9 3h6v4H9z"/><rect x="7" y="7" width="10" height="14" rx="3"/>'},
  {id:"t:perfume", lb:"ນ້ຳຫອມ", ic:'<path d="M10 3h4v3h-4z"/><rect x="6" y="8" width="12" height="13" rx="3"/><path d="M12 6v2"/>'},
  {id:"t:sport", lb:"ກິລາ ແລະ ໂປຣຕີນ", ic:'<path d="M3 10v4M6 8v8M18 8v8M21 10v4M6 12h12"/>'}
];
const TYPE_LB = {supplement:"ວິຕາມິນ ແລະ ອາຫານເສີມ", beauty:"ຄວາມງາມ", perfume:"ນ້ຳຫອມ", sport:"ກິລາ ແລະ ໂປຣຕີນ", other:"ອື່ນໆ"};
const DELIVERY = [
  {id:"rider", lb:"ໄຣເດີສົ່ງພາຍໃນມື້", sub:"ນະຄອນຫຼວງວຽງຈັນ"},
  {id:"hal", lb:"ຂົນສົ່ງ ຮຸ່ງອາລຸນ", sub:"ຕ່າງແຂວງ"},
  {id:"anousith", lb:"ຂົນສົ່ງ ອານຸສິດ", sub:"ຕ່າງແຂວງ"},
  {id:"mixay", lb:"ຂົນສົ່ງ ມີໄຊ", sub:"ຕ່າງແຂວງ"}
];

const $ = s => document.querySelector(s);
const kip = n => Number(n).toLocaleString("en-US") + " ກີບ";
const esc = s => String(s==null?"":s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const waLink = text => "https://wa.me/" + (CFG.whatsapp || "") + "?text=" + encodeURIComponent(text);
function store(k, v){ try{ if(v===undefined) return JSON.parse(localStorage.getItem(k)||"null"); localStorage.setItem(k, JSON.stringify(v)); }catch(e){ return null; } }

// ----- CSV -----
function parseCSV(text){
  const rows=[]; let row=[], f="", q=false;
  text = text.replace(/^﻿/,"");
  for(let i=0;i<text.length;i++){
    const c=text[i];
    if(q){ if(c==='"'){ if(text[i+1]==='"'){f+='"';i++;} else q=false; } else f+=c; }
    else if(c==='"') q=true;
    else if(c===','){ row.push(f); f=""; }
    else if(c==='\n'||c==='\r'){ if(c==='\r'&&text[i+1]==='\n') i++; row.push(f); rows.push(row); row=[]; f=""; }
    else f+=c;
  }
  if(f!==""||row.length){ row.push(f); rows.push(row); }
  const head = (rows.shift()||[]).map(h=>h.trim().toLowerCase());
  return rows.filter(r=>r.some(x=>x.trim())).map(r=>Object.fromEntries(head.map((h,i)=>[h,(r[i]||"").trim()])));
}
const yes = v => /^(yes|y|1|true|ມີ|ແມ່ນ)$/i.test(String(v).trim());
const num = v => Number(String(v).replace(/[^\d.]/g,"")) || 0;
function hueOf(s){ let h=0; for(const ch of String(s)) h=(h*31+ch.charCodeAt(0))%360; return h; }
// ຊື່ຫຍໍ້ຍີ່ຫໍ້ທີ່ທີມໃຊ້ໃນ Pancake → ຊື່ເຕັມໃຫ້ລູກຄ້າອ່ານ (ຄົ້ນຫາໄດ້ທັງ 2 ແບບ)
const BRANDS = {hc:"Healthy Care", ntbt:"Nature's Bounty", bm:"Blackmores", ntw:"Nature's Way", ntm:"Nature Made", kl:"Kirkland", lsp:"Life Space", spl:"Springleaf", sw:"Swisse"};
const fullBrand = s => String(s).replace(/(^|[\s(\/])(hc|ntbt|bm|ntw|ntm|kl|lsp|spl)(?=[\s)\/.,]|$)/gi, (a,pre,b)=>pre+BRANDS[b.toLowerCase()]);
function toProduct(r, i){
  const id = r.id || String(i+1);
  const tsz = (r.trial_size||"").split("|"), tpr = (r.trial_price||"").split("|");
  const trials = tpr.map((pr,k)=>({qty:(tsz[k]||"").trim(), price:num(pr)})).filter(t=>t.price>0);
  let type = (r.type||"supplement").trim().toLowerCase();
  if(type!=="perfume" && /ນ້ຳຫອມ|\bED[PT]\b|parfum|cologne|club de nuit/i.test(r.name_lo||"")) type = "perfume";
  const tags = (r.category||"").split(/[|,]/).map(s=>s.trim().toLowerCase()).filter(Boolean)
    .concat(yes(r.best_seller)?["best"]:[], yes(r.new)?["new"]:[], yes(r.sale)?["sale"]:[], ["t:"+type]);
  const raw = r.name_lo || r.name_en || "—", nm = fullBrand(raw);
  return {
    id, nm, en:r.name_en || "", size:r.size || "", brand:fullBrand(r.brand || ""), type, tags,
    full:num(r.price_full), was:num(r.price_old)||0,
    trials, trial: trials[0] || null,
    stock: r.in_stock==="" ? true : yes(r.in_stock),
    photo: r.photo || "", tiktok: r.tiktok || "", hue: hueOf(r.brand||nm),
    find: (nm+" "+raw+" "+(r.name_en||"")+" "+(r.search||"")).toLowerCase()
  };
}

// ລວມນ້ຳຫອມຂະໜາດຕ່າງໆ (ລະຫັດ A134ກ່ອງໃຫຍ່ / A134ແບ່ງ5ML ...) ເປັນສິນຄ້າດຽວ ເພາະ Pancake ແຍກເປັນຫຼາຍລາຍການ
const VAR_RX = /^(.+?)\s*(ກ່ອງໃຫຍ່|ແບ່ງ\s*([\d.]+)\s*ML)\s*$/i;
function mergeVariants(rows){
  const groups = new Map(), out = [];
  rows.forEach(r => {
    const m = VAR_RX.exec((r.code||"").trim());
    if(!m){ out.push(r); return; }
    const key = m[1].trim()+"|"+(r.name_lo||"").trim().toLowerCase();
    if(!groups.has(key)){ groups.set(key, []); out.push(groups.get(key)); }
    groups.get(key).push({r, ml: m[3] ? m[3]+"ml" : ""});
  });
  return out.map(x => {
    if(!Array.isArray(x)) return x;
    if(x.length===1 && !x[0].ml) return x[0].r; // ແຖວແບ່ງດ່ຽວ (ບໍ່ມີຂວດເຕັມ) ຕ້ອງສະແດງເປັນຂວດແບ່ງ ບໍ່ແມ່ນລາຄາຂວດເຕັມ
    const main = x.find(v=>!v.ml);
    const base = {...(main ? main.r : x[0].r)};
    const splits = x.filter(v=>v.ml && num(v.r.price_full)>0 && (v.r.in_stock==="" || yes(v.r.in_stock))).sort((a,b)=>parseFloat(b.ml)-parseFloat(a.ml));
    if(!main){ base.price_full = ""; base.price_old = ""; }
    base.trial_size = splits.map(v=>v.ml).join("|");
    base.trial_price = splits.map(v=>v.r.price_full).join("|");
    base.photo = (main && main.r.photo) || (x.find(v=>v.r.photo)||{r:{}}).r.photo || "";
    base.in_stock = x.some(v=>v.r.in_stock==="" || yes(v.r.in_stock)) ? "yes" : "no";
    return base;
  });
}

let shown = 40;
let P = [], cart = store("nnz-cart") || [], tab = "home", filter = null, query = "", delivery = store("nnz-delivery") || "rider", pay = store("nnz-pay") || "qr", loadErr = "";

function shapeOf(p){
  const n = p.find || "";
  if(p.type==="perfume") return "perfume";
  if(p.type==="sport" || /powder|whey|protein|ຜົງ/.test(n)) return "tub";
  if(/gumm|ກຳມີ້|jelly|ເຈວລີ/.test(n)) return "jar";
  if(/serum|essence|drop|oil\b|ເອສເຊັນ/.test(n) && p.type==="beauty") return "dropper";
  if(p.type==="beauty") return "tube";
  return "bottle";
}
function pic(p){
  if(p.photo){
    const gd = (p.photo.match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:export=\w+&)?id=|thumbnail\?id=)([\w-]{20,})/)||[])[1];
    const src = gd ? `https://drive.google.com/thumbnail?id=${gd}&sz=w800` : /^https?:/i.test(p.photo) ? p.photo : "images/" + p.photo;
    return `<img src="${esc(src)}" alt="${esc(p.nm)}" loading="lazy" style="width:100%;height:100%;object-fit:cover;display:block">`;
  }
  const h = p.hue, dark = `hsl(${h} 45% 28%)`, main = `hsl(${h} 62% 52%)`, soft = `hsl(${h} 70% 95%)`, ink = `hsl(${h} 45% 20%)`;
  const brand = esc((p.brand||"nnz").toUpperCase().slice(0,10));
  const sub = esc((p.trial && !p.full) ? "ແບ່ງ " + p.trial.qty : (p.nm.match(/\d+\s?(?:mg|ml|g|iu|met|caps?|tabs?)\b/i)||[""])[0]);
  const lab = (x,y,w,hh) => `<rect x="${x}" y="${y}" width="${w}" height="${hh}" rx="6" fill="${soft}"/>
    <text x="100" y="${y+hh/2-2}" text-anchor="middle" font-family="Inter,sans-serif" font-weight="800" font-size="${brand.length>7?11:13}" fill="${ink}">${brand}</text>
    <text x="100" y="${y+hh/2+13}" text-anchor="middle" font-family="Inter,'Noto Sans Lao',sans-serif" font-weight="600" font-size="9" fill="${dark}">${sub}</text>`;
  const shine = (x,y,hh) => `<rect x="${x}" y="${y}" width="8" height="${hh}" rx="4" fill="#fff" opacity=".25"/>`;
  const shapes = {
    bottle: `<rect x="72" y="28" width="56" height="22" rx="6" fill="${dark}"/><rect x="58" y="48" width="84" height="132" rx="18" fill="${main}"/>${lab(62,84,76,62)}${shine(68,56,112)}`,
    jar: `<rect x="56" y="46" width="88" height="22" rx="8" fill="${dark}"/><rect x="48" y="66" width="104" height="114" rx="22" fill="${main}"/>${lab(56,94,88,58)}${shine(56,74,96)}`,
    tub: `<rect x="44" y="50" width="112" height="20" rx="6" fill="${dark}"/><path d="M48 70h104l-8 110H56z" fill="${main}"/>${lab(58,98,84,58)}${shine(60,76,96)}`,
    perfume: `<rect x="84" y="26" width="32" height="26" rx="5" fill="${dark}"/><rect x="94" y="50" width="12" height="12" fill="${dark}"/><rect x="50" y="60" width="100" height="120" rx="14" fill="${main}" opacity=".9"/><rect x="58" y="68" width="84" height="104" rx="10" fill="#fff" opacity=".18"/>${lab(64,98,72,52)}`,
    tube: `<path d="M70 30h60l6 120H64z" fill="${main}"/><rect x="78" y="148" width="44" height="32" rx="5" fill="${dark}"/>${lab(70,66,60,58)}${shine(76,36,104)}`,
    dropper: `<rect x="90" y="18" width="20" height="26" rx="10" fill="${dark}"/><rect x="82" y="42" width="36" height="16" rx="4" fill="${dark}"/><rect x="62" y="56" width="76" height="124" rx="14" fill="${main}"/>${lab(66,92,68,58)}${shine(68,62,110)}`
  };
  return `<svg viewBox="0 0 200 200" role="img" aria-label="${esc(p.nm)}"><ellipse cx="100" cy="184" rx="58" ry="7" fill="hsl(${h} 30% 40% / .16)"/>${shapes[shapeOf(p)]}</svg>`;
}
function card(p){
  return `<button class="card" data-open="${esc(p.id)}" aria-label="${esc(p.nm)}">
    <div class="pic">${pic(p)}${!p.stock?'<span class="tag out">ໝົດຊົ່ວຄາວ</span>':(p.was>p.full?'<span class="tag">ຫຼຸດລາຄາ</span>':'')}${p.trial?'<span class="tag trial">ມີຂວດແບ່ງ</span>':''}${hasVid(p.id)?'<span class="vbadge">▶ ມີວິດີໂອ</span>':''}</div>
    <div class="body"><div class="nm">${esc(p.nm)}</div><div class="meta">${esc(TYPE_LB[p.type]||"")}</div>
    <div class="pr">${p.full?`<b>${kip(p.full)}</b>`:`<b>${kip(p.trial.price)}</b>`}${p.was>p.full?`<s>${kip(p.was)}</s>`:''}${p.full&&p.trial?`<small>ແບ່ງລອງ ${kip(p.trial.price)}</small>`:(!p.full?'<small>ຂວດແບ່ງ</small>':'')}</div></div>
  </button>`;
}
function list(){
  const q = query.trim().toLowerCase();
  return P.filter(p => (!filter || (filter==="trial" ? !!p.trial : p.tags.includes(filter))) &&
    (!q || q.split(/\s+/).every(w=>p.find.includes(w))));
}
const needBtn = n => `<button class="need" data-need="${n.id}" aria-pressed="${filter===n.id}"><span class="dot"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${n.ic}</svg></span>${n.lb}</button>`;

let V = [];
const vidsOf = id => V.filter(v=>(v.products||[]).includes(id)).sort((a,b)=>(b.n||0)-(a.n||0));
const PRODUCT_VIDEOS = false; // ເຈົ້າຂອງຂໍປິດວິດີໂອໃນໜ້າສິນຄ້າໄວ້ກ່ອນ (2026-11-19) · ປ່ຽນເປັນ true ເພື່ອເປີດຄືນ
const hasVid = id => PRODUCT_VIDEOS && V.some(v=>(v.products||[]).includes(id));
const ACC = {nnz_vitaminofficial:"NNZ vitamin official", nnzvitamin2:"NNZ vitamin ຊ່ອງສຳຮອງ"};
const ttUrl = v => `https://www.tiktok.com/@${v.acc}/video/${v.id}`;
const vidCard = v => `<button class="vcard" data-vid="${esc(v.id)}" aria-label="ເບິ່ງວິດີໂອ ${esc(v.title||'NNZ')}">
  <div class="vthumb">${v.cover?`<img src="images/${esc(v.cover)}" alt="" loading="lazy">`:'<div class="vph">NNZ</div>'}
    <span class="vplay"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></span>
    <span class="vviews">▶ ${esc(v.views)}</span></div>
  <span class="vtitle">${esc(v.title||'ວິດີໂອຈາກ NNZ')}</span></button>`;
function openVideo(id){
  const v = V.find(x=>x.id===id); if(!v) return;
  const prods = (v.products||[]).map(pid=>P.find(p=>p.id===pid)).filter(Boolean);
  const sh = document.createElement("div"); sh.className="sheet"; sh.setAttribute("role","dialog"); sh.setAttribute("aria-modal","true"); sh.setAttribute("aria-label","ວິດີໂອ");
  sh.innerHTML = `<div class="panel"><div class="grab"></div><div class="wrap">
    <button class="close" data-x>ປິດ</button>
    <div class="vplayer"><iframe src="https://www.tiktok.com/player/v1/${esc(v.id)}?autoplay=1&description=1&music_info=0" allow="autoplay; encrypted-media; fullscreen; picture-in-picture" allowfullscreen title="TikTok"></iframe></div>
    <p class="note" style="margin:0">${esc(ACC[v.acc]||'NNZ')} · ▶ ${esc(v.views)} ວິວ</p>
    ${prods.map(p=>`<button class="clip" data-vprod="${esc(p.id)}" style="text-align:left;width:100%;cursor:pointer"><div class="play" style="background:var(--brand,#e52535)">🛒</div><div><b style="font-size:14px">${esc(p.nm)}</b><div class="note">ເບິ່ງລາຄາ ແລະ ສັ່ງຊື້</div></div></button>`).join("")}
    <a class="cta ghost" href="${esc(ttUrl(v))}" target="_blank" rel="noopener">ເປີດໃນແອັບ TikTok</a>
  </div></div>`;
  document.body.appendChild(sh); document.body.style.overflow="hidden";
  const onKey = e => { if(e.key==="Escape") close(); };
  const close = () => { sh.remove(); document.body.style.overflow=""; document.removeEventListener("keydown", onKey); };
  document.addEventListener("keydown", onKey);
  sh.addEventListener("click", e => {
    if(e.target===sh || e.target.closest("[data-x]")) return close();
    const o = e.target.closest("[data-vprod]"); if(o){ close(); openProduct(o.dataset.vprod); }
  });
}
function renderHome(){
  if(loadErr) return `<div class="wrap"><div class="empty"><b>ໂຫຼດລາຍການສິນຄ້າບໍ່ໄດ້</b><span>${esc(loadErr)}</span><span>ຖາມແອັດມິນທາງ WhatsApp ໄດ້ເລີຍ</span></div></div>`;
  if(!P.length) return `<div class="wrap"><div class="empty"><b>ກຳລັງໂຫຼດສິນຄ້າ…</b></div></div>`;
  const pick = (f,n=12) => P.filter(f).slice(0,n);
  const best = pick(p=>p.tags.includes("best")), news = pick(p=>p.tags.includes("new")), sale = pick(p=>p.tags.includes("sale"));
  const trial = pick(p=>p.trial && p.type==="supplement"), perf = pick(p=>p.type==="perfume" && p.trial), beauty = pick(p=>p.type==="beauty");
  const rowSec = (title, need, arr, note="") => arr.length ? `<section><div class="sechead"><h2>${title}</h2><button class="more" data-need="${need}">ເບິ່ງທັງໝົດ</button></div>${note}<div class="row">${arr.map(card).join("")}</div></section>` : "";
  return `<div class="wrap">
    <section aria-label="ວິທີສັ່ງ"><div class="steps">
      <div class="step"><i>1</i>ເລືອກສິນຄ້າ</div><div class="step"><i>2</i>ເລືອກຂວດເຕັມ ຫຼື ຂວດແບ່ງ</div><div class="step"><i>3</i>ໃສ່ກະຕ່າ</div><div class="step"><i>4</i>ສົ່ງອໍເດີທາງ WhatsApp</div>
    </div></section>
    ${V.length?`<section><div class="sechead"><h2>ວິດີໂອຍອດນິຍົມ</h2><a class="more" href="https://www.tiktok.com/@nnz_vitaminofficial" target="_blank" rel="noopener">TikTok</a></div><div class="row vrow">${V.filter(v=>v.row!==false).slice(0,16).map(vidCard).join("")}</div></section>`:''}
    <section><div class="sechead"><h2>ເລືອກຕາມສິ່ງທີ່ຕ້ອງການ</h2></div><div class="needs">${NEEDS.map(needBtn).join("")}</div></section>
    ${rowSec("ຂາຍດີ","best",best)}
    ${rowSec("ຂວດແບ່ງ ຊື້ລອງກ່ອນ","trial",trial,'<p class="note" style="margin:-4px 0 10px">ແບ່ງຈາກຂວດໃຫຍ່ ໂດຍທີມທີ່ໃສ່ຖົງມື ຜ້າກັນເປື້ອນ ແລະ ໝວກ · ຕິດວິທີກິນທຸກຂວດ</p>')}
    ${rowSec("ສິນຄ້າໃໝ່","new",news)}
    ${rowSec("ລາຄາພິເສດ","sale",sale)}
    ${rowSec("ນ້ຳຫອມ ມີແບ່ງ 10ml","t:perfume",perf)}
    ${rowSec("ຄວາມງາມ","t:beauty",beauty)}
    <p class="note" style="text-align:center">ສິນຄ້າທັງໝົດ <span class="num">${P.length.toLocaleString("en-US")}</span> ລາຍການ · ຄົ້ນຫາດ້ວຍຊື່ ຫຼື ຍີ່ຫໍ້ໄດ້ທາງເທິງ</p>
  </div>`;
}
function renderAll(){
  const items = list();
  const nm = filter ? ((NEEDS.find(n=>n.id===filter)||{}).lb || {best:"ຂາຍດີ",sale:"ລາຄາພິເສດ"}[filter] || "") : "ສິນຄ້າທັງໝົດ";
  return `<div class="wrap">
    <div class="sechead"><h2>${esc(query?`ຜົນຄົ້ນຫາ "${query}"`:nm)}</h2>${filter||query?'<button class="more" data-clear>ລ້າງຕົວກອງ</button>':''}</div>
    <div class="needs" style="grid-template-columns:repeat(auto-fill,minmax(72px,1fr))">${NEEDS.map(needBtn).join("")}</div>
    <p class="note num" style="margin:0">${items.length.toLocaleString("en-US")} ລາຍການ</p>
    ${items.length?`<div class="grid">${items.slice(0,shown).map(card).join("")}</div>${items.length>shown?`<button class="cta ghost" data-more style="width:100%">ເບິ່ງເພີ່ມ (ເຫຼືອ <span class="num">${(items.length-shown).toLocaleString("en-US")}</span>)</button>`:''}`:`<div class="empty"><b>ບໍ່ພົບສິນຄ້າທີ່ຄົ້ນຫາ</b><span>ລອງພິມຊື່ອື່ນ ຫຼື ຖາມແອັດມິນທາງ WhatsApp</span></div>`}
  </div>`;
}
const cartTotal = () => cart.reduce((s,l)=>s+l.price*l.qty,0);
function orderText(){
  const d = DELIVERY.find(x=>x.id===delivery) || DELIVERY[0];
  const lines = cart.map((l,i)=>`${i+1}. ${l.nm} (${l.opt}) x${l.qty} = ${kip(l.price*l.qty)}`).join("\n");
  return `APP · ອໍເດີໃໝ່ຈາກແອັບ nnz\nລະຫັດອໍເດີ: ${orderCode}\n${lines}\nລວມຄ່າສິນຄ້າ: ${kip(cartTotal())}\nຈັດສົ່ງ: ${d.lb} (${d.sub})\n${d.id==='rider'?'ທີ່ຢູ່ / ຈຸດສົ່ງ':'ສາຂາຂົນສົ່ງ ('+d.lb.replace('ຂົນສົ່ງ ','')+')'}: ${cust.place||''}\n\nຊື່: ${cust.name||''}\nເບີໂທ: ${cust.phone||''}\nຈ່າຍແບບ: ${pay==="qr"?"ສະແກນ QR (ແນບສະລິບ)":"ເກັບເງິນປາຍທາງ (COD)"}`;
}
function renderCart(){
  if(!cart.length) return `<div class="wrap"><h2>ກະຕ່າ</h2><div class="empty"><b>ກະຕ່າຍັງວ່າງ</b><span>ເລືອກສິນຄ້າ ແລ້ວກົດ "ໃສ່ກະຕ່າ"</span><button class="cta" data-tab-go="home" style="flex:none">ເລືອກສິນຄ້າ</button></div></div>`;
  return `<div class="wrap">
    <h2>ກະຕ່າ <span class="note num">(${cart.reduce((s,l)=>s+l.qty,0)} ຊິ້ນ)</span></h2>
    ${cart.map((l,i)=>{const p=P.find(x=>x.id===l.id)||{hue:0,nm:l.nm,en:""};return `<div class="line"><div class="mini">${pic(p)}</div><div class="info"><b>${esc(l.nm)}</b><span>${esc(l.opt)} · ${kip(l.price)}</span></div>
      <div class="qty"><button data-dec="${i}" aria-label="ຫຼຸດ">−</button><span>${l.qty}</span><button data-inc="${i}" aria-label="ເພີ່ມ">+</button></div></div>`}).join("")}
    <div class="fieldset" role="radiogroup" aria-label="ວິທີຈັດສົ່ງ"><b>ວິທີຈັດສົ່ງ</b>
      ${DELIVERY.map(d=>`<label class="radio" for="dl-${d.id}"><input type="radio" id="dl-${d.id}" name="dl" value="${d.id}" ${delivery===d.id?'checked':''}><span>${d.lb}<small>${d.sub} · ແອັດມິນແຈ້ງຄ່າສົ່ງ</small></span></label>`).join("")}
    </div>
    <div class="fieldset"><b>${delivery==="rider"?"ສົ່ງໃຫ້ໃສ":"ຝາກສາຂາໃດ"}</b>
      <label class="fld"><span>${delivery==="rider"?"ທີ່ຢູ່ ຫຼື ຈຸດສົ່ງ (ບ້ານ, ເມືອງ, ຈຸດສັງເກດ)":"ຊື່ສາຂາ "+(DELIVERY.find(x=>x.id===delivery)||{lb:""}).lb.replace("ຂົນສົ່ງ ","")+" ທີ່ຈະໄປຮັບເຄື່ອງ (ແຂວງ, ເມືອງ, ສາຂາ)"}</span>
        <input class="inp" data-cust="place" value="${esc(cust.place||"")}" placeholder="${delivery==="rider"?"ເຊັ່ນ ບ້ານໂພນທັນ ເມືອງໄຊເສດຖາ ໃກ້ຕະຫຼາດ":"ເຊັ່ນ ສາຂາ ປາກເຊ ແຂວງຈຳປາສັກ"}" autocomplete="street-address"></label>
      <label class="fld"><span>ຊື່ຜູ້ຮັບ</span><input class="inp" data-cust="name" value="${esc(cust.name||"")}" autocomplete="name"></label>
      <label class="fld"><span>ເບີໂທຜູ້ຮັບ</span><input class="inp" data-cust="phone" value="${esc(cust.phone||"")}" inputmode="tel" autocomplete="tel" placeholder="020 xxxx xxxx"></label>
    </div>
    <div class="total"><span>ລວມຄ່າສິນຄ້າ</span><span class="num">${kip(cartTotal())}</span></div>
    <p class="note">ຍັງບໍ່ລວມຄ່າສົ່ງ · ແອັດມິນຈະແຈ້ງຄ່າສົ່ງໃນ WhatsApp</p>
    <div class="fieldset" role="radiogroup" aria-label="ວິທີຈ່າຍເງິນ"><b>ວິທີຈ່າຍເງິນ</b>
      <label class="radio" for="py-qr"><input type="radio" id="py-qr" name="py" value="qr" ${pay==="qr"?'checked':''}><span>ສະແກນ QR ຈ່າຍເລີຍ<small>OnePay · LAO QR · ຈ່າຍໄດ້ທຸກທະນາຄານ</small></span></label>
      <label class="radio" for="py-cod"><input type="radio" id="py-cod" name="py" value="cod" ${pay==="cod"?'checked':''}><span>ເກັບເງິນປາຍທາງ (COD)<small>ຈ່າຍເມື່ອຮັບເຄື່ອງ</small></span></label>
    </div>
    ${pay==="qr"&&CFG.payQr?`<div class="payqr">
      <p class="paystep"><b>1.</b> ໂອນຄ່າສິນຄ້າ <span class="num">${kip(cartTotal())}</span> ໃຫ້ກົງຍອດ</p>
      <p class="paystep"><b>2.</b> ໃນຊ່ອງ <b>ໝາຍເຫດ / ເນື້ອໃນການໂອນ</b> ໃສ່ລະຫັດອໍເດີ <span class="ocode num">${esc(orderCode)}</span></p>
      <img src="${esc(CFG.payQr)}" alt="QR ຮັບເງິນ ${esc(CFG.payName||"")}" width="260" height="295">
      <p class="note">ຊື່ບັນຊີ: ${esc(CFG.payName||"")} · ກວດຊື່ໃຫ້ກົງກ່ອນໂອນ</p>
      <a class="cta ghost" href="${esc(CFG.payQr)}" download="nnz-QR.jpg">ບັນທຶກຮູບ QR ໄວ້ສະແກນໃນແອັບທະນາຄານ</a>
      <p class="paystep"><b>3.</b> ກົດສົ່ງອໍເດີ ແລ້ວແນບຮູບສະລິບໃນ WhatsApp · ແອັດມິນກວດເງິນເຂົ້າບັນຊີແລ້ວຈຶ່ງສົ່ງເຄື່ອງ</p>
      <div class="safe"><b>⚠ ກັນຖືກຫຼອກ</b><span>ຮ້ານຮັບເງິນເຂົ້າຊື່ <b>${esc(CFG.payName||"")}</b> ເທົ່ານັ້ນ. ແອັດມິນບໍ່ເຄີຍສົ່ງ QR ຫຼື ເລກບັນຊີອື່ນໃຫ້ໂອນ. ຖ້າມີຄົນຂໍໃຫ້ໂອນບ່ອນອື່ນ ໃຫ້ໂທຫາ ${esc(CFG.whatsappShow||"")} ກ່ອນ.</span></div>
    </div>`:''}
    <a class="cta wa" id="sendWa" href="${waLink(orderText())}" target="_blank" rel="noopener">ສົ່ງອໍເດີທາງ WhatsApp</a>
    <details><summary class="note">ຖ້າ WhatsApp ບໍ່ເປີດ ໃຫ້ຄັດລອກຂໍ້ຄວາມນີ້ໄປສົ່ງເອງ</summary>
      <textarea class="msg" id="msg" readonly>${esc(orderText())}</textarea>
      <button class="cta ghost" id="copyMsg" style="width:100%;margin-top:8px">ຄັດລອກຂໍ້ຄວາມ</button></details>
  </div>`;
}
function renderContact(){
  return `<div class="wrap"><h2>ຕິດຕໍ່ຮ້ານ</h2><div class="contact">
    <div class="ccard"><b>WhatsApp</b><a class="num" href="https://wa.me/${esc(CFG.whatsapp||"")}" target="_blank" rel="noopener">${esc(CFG.whatsappShow||"")}</a>${CFG.whatsapp2?`<a class="num" href="https://wa.me/${esc(CFG.whatsapp2)}" target="_blank" rel="noopener">${esc(CFG.whatsappShow2||"")}</a>`:""}</div>
    <div class="ccard safe"><b>⚠ ເບີ ແລະ ບັນຊີທາງການ</b><span>ຮ້ານມີເບີ WhatsApp 2 ເບີຂ້າງເທິງເທົ່ານັ້ນ · ຮັບເງິນເຂົ້າຊື່ ${esc(CFG.payName||"")} ເທົ່ານັ້ນ · ຮ້ານບໍ່ເຄີຍຂໍລະຫັດ OTP ຫຼື ລະຫັດຜ່ານ</span></div>
    <div class="ccard"><b>ໜ້າຮ້ານ</b><span>${esc(CFG.address||"")}</span></div>
    <div class="ccard"><b>ຈັດສົ່ງ</b><span>ໄຣເດີສົ່ງພາຍໃນມື້ໃນນະຄອນຫຼວງວຽງຈັນ · ຕ່າງແຂວງຝາກ ຮຸ່ງອາລຸນ · ອານຸສິດ · ມີໄຊ</span></div>
    <div class="ccard"><b>ຂາຍຍ່ອຍເທົ່ານັ້ນ</b><span>ຮ້ານດູແລສິນຄ້າເອງທຸກຂວດ ເພື່ອໃຫ້ລູກຄ້າໄດ້ຂອງແທ້</span></div>
  </div></div>`;
}
let lastView = "";
function render(){
  const v = $("#view");
  const sig = tab+"|"+filter+"|"+query; if(sig!==lastView){ shown = 40; lastView = sig; }
  v.innerHTML = tab==="home" ? (query||filter ? renderAll() : renderHome()) : tab==="all" ? renderAll() : tab==="cart" ? renderCart() : renderContact();
  const cur = tab==="home"&&(query||filter) ? "all" : tab;
  document.querySelectorAll("nav.tabs button").forEach(b=>{ b.removeAttribute("aria-current"); if(b.dataset.tab===cur) b.setAttribute("aria-current","page"); });
  const n = cart.reduce((s,l)=>s+l.qty,0); const bd=$("#badge"); bd.hidden = !n; bd.textContent = n;
}
let cust = store("nnz-cust") || {name:"",phone:"",place:""};
const newCode = () => "NNZ" + String(Math.floor(1000 + Math.random()*9000));
let orderCode = store("nnz-oc") || newCode(); store("nnz-oc", orderCode);
const save = () => { store("nnz-cart", cart); if(!cart.length){ orderCode = newCode(); store("nnz-oc", orderCode); } };
let toastT;
function toast(t){ let el=$(".toast"); if(!el){el=document.createElement("div");el.className="toast";el.setAttribute("role","status");document.body.appendChild(el);} el.textContent=t; el.hidden=false; clearTimeout(toastT); toastT=setTimeout(()=>el.hidden=true,1800); }

function heroPic(p){
  const m = /^p\/((?:fb|p2)_\d{4}\.jpg|pf_\d{2}\.jpg)$/.exec(p.photo||"");
  if(!m) return pic(p);
  return `<img src="images/hd/${m[1]}" alt="${esc(p.nm)}" onerror="this.onerror=null;this.src='images/${esc(p.photo)}'" style="width:100%;height:100%;object-fit:contain;display:block">`;
}
function openZoom(src, title){
  const z=document.createElement("div"); z.className="zoomv"; z.setAttribute("role","dialog"); z.setAttribute("aria-modal","true"); z.setAttribute("aria-label",title||"ຮູບ");
  z.innerHTML=`<div class="zbar"><span>ແຕະຮູບ = ຂະຫຍາຍ/ຫຍໍ້ · ໃຊ້ 2 ນິ້ວຊູມໄດ້</span><button data-zx>ປິດ</button></div><div class="zbox"><img src="${esc(src)}" alt="${esc(title||"")}"></div>`;
  document.body.appendChild(z);
  const onKey=e=>{ if(e.key==="Escape") close(); };
  const close=()=>{ z.remove(); document.removeEventListener("keydown",onKey); };
  document.addEventListener("keydown",onKey);
  z.addEventListener("click",e=>{ e.stopPropagation(); if(e.target.closest("[data-zx]")) return close(); if(e.target.tagName==="IMG"){ const box=z.querySelector(".zbox"); const r=e.target.getBoundingClientRect(); const fx=(e.clientX-r.left)/r.width, fy=(e.clientY-r.top)/r.height; z.classList.toggle("big"); if(z.classList.contains("big")) requestAnimationFrame(()=>{ box.scrollLeft=fx*e.target.offsetWidth-box.clientWidth/2; box.scrollTop=fy*e.target.offsetHeight-box.clientHeight/2; }); } });
}
function openProduct(id){
  const p = P.find(x=>x.id===id); if(!p) return;
  let opt = p.full ? "full" : "t0", qty = 1, vi = 0;
  const optPrice = o => o==="full" ? p.full : p.trials[+o.slice(1)].price;
  const optLabel = o => o==="full" ? ("ຂວດເຕັມ "+p.size).trim() : ("ຂວດແບ່ງ "+p.trials[+o.slice(1)].qty).trim();
  const sh = document.createElement("div"); sh.className="sheet"; sh.setAttribute("role","dialog"); sh.setAttribute("aria-modal","true"); sh.setAttribute("aria-label",p.nm);
  const draw = () => {
    const price = optPrice(opt);
    sh.innerHTML = `<div class="panel"><div class="grab"></div><div class="wrap">
      <button class="close" data-x>ປິດ</button>
      <div class="hero${p.photo?' zoomable':''}" ${p.photo?'data-zoom role="button" aria-label="ກົດເພື່ອຂະຫຍາຍຮູບ"':''}>${heroPic(p)}${p.photo?'<span class="zhint">🔍 ກົດເບິ່ງຮູບໃຫຍ່</span>':''}</div>${p.photo?'':'<p class="note" style="margin:-6px 0 0">ຮູບປະກອບ · ສິນຄ້າຈິງອາດຕ່າງຈາກຮູບ</p>'}
      <div><h2 style="font-size:20px">${esc(p.nm)}</h2><div class="note">${esc([p.brand,TYPE_LB[p.type],p.size].filter(Boolean).join(" · "))}</div></div>
      <span class="stock ${p.stock?'':'out'}">${p.stock?'ມີສິນຄ້າ ພ້ອມສົ່ງ':'ໝົດຊົ່ວຄາວ · ກຳລັງນຳເຂົ້າ'}</span>
      <div class="opts">
        ${p.full?`<button class="opt" data-opt="full" aria-pressed="${opt==='full'}"><span class="t">ຂວດເຕັມ</span><span class="s">${esc(p.size)||'ທັງຂວດ'}</span><span class="p">${kip(p.full)}</span>${p.was>p.full?`<s class="note num">${kip(p.was)}</s>`:''}</button>`:''}
        ${p.trials.map((t,k)=>`<button class="opt" data-opt="t${k}" aria-pressed="${opt==='t'+k}"><span class="t">ຂວດແບ່ງ</span><span class="s">${esc(t.qty)}</span><span class="p">${kip(t.price)}</span></button>`).join("")}
        ${p.full&&!p.trials.length?'<button class="opt" disabled><span class="t">ຂວດແບ່ງ</span><span class="s">ສິນຄ້ານີ້ບໍ່ມີຂວດແບ່ງ</span><span class="p">—</span></button>':''}
      </div>
      ${(()=>{const vs=PRODUCT_VIDEOS?vidsOf(p.id):[]; if(!vs.length) return ""; const v=vs[Math.min(vi,vs.length-1)];
        return `<div class="pvid"><div class="sechead" style="margin:0"><h2 style="font-size:16px">ວິດີໂອສິນຄ້ານີ້</h2>${vs.length>1?`<button class="more" data-vnext>ຄລິບອື່ນ (${vi%vs.length+1}/${vs.length})</button>`:''}</div>
        <div class="vplayer"><iframe src="https://www.tiktok.com/player/v1/${esc(v.id)}?autoplay=0&description=0&music_info=0" loading="lazy" allow="autoplay; encrypted-media; fullscreen; picture-in-picture" allowfullscreen title="TikTok"></iframe></div>
        <p class="note" style="margin:0">▶ ${esc(v.views||"")} ວິວ ໃນ TikTok · ${esc(ACC[v.acc]||"NNZ")}</p></div>`;})()}
      ${p.tiktok?`<a class="clip" href="${esc(p.tiktok)}" target="_blank" rel="noopener" style="text-decoration:none;color:inherit"><div class="play"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></div><div><b style="font-size:14px">ເບິ່ງຄລິບຣີວິວ</b><div class="note">ເປີດໃນ TikTok</div></div></a>`:''}
      ${p.stock?`<div class="buyrow"><div class="qty"><button data-q="-1" aria-label="ຫຼຸດ">−</button><span>${qty}</span><button data-q="1" aria-label="ເພີ່ມ">+</button></div>
        <button class="cta" data-add>ໃສ່ກະຕ່າ · <span class="num">${kip(price*qty)}</span></button></div>`
      :`<a class="cta ghost" href="${waLink('ແຈ້ງເຕືອນເມື່ອ '+p.nm+(p.en?' ('+p.en+')':'')+' ເຂົ້າໃໝ່ ແດ່')}" target="_blank" rel="noopener">ແຈ້ງເຕືອນຂ້ອຍເມື່ອສິນຄ້າເຂົ້າ</a>
        <p class="note" style="margin:0">ກົດແລ້ວຈະເປີດ WhatsApp ພ້ອມຂໍ້ຄວາມ ໃຫ້ທ່ານກົດສົ່ງເອງ</p>`}
      <p class="note" style="margin:0">ອາຫານເສີມບໍ່ແມ່ນຢາ ແລະ ບໍ່ໄດ້ໃຊ້ປິ່ນປົວພະຍາດ · ອ່ານວິທີກິນຢູ່ຂ້າງຂວດ</p>
    </div></div>`;
  };
  draw(); document.body.appendChild(sh); document.body.style.overflow="hidden";
  const onKey = e => { if(e.key==="Escape") close(); };
  const close = () => { sh.remove(); document.body.style.overflow=""; document.removeEventListener("keydown", onKey); };
  document.addEventListener("keydown", onKey);
  sh.addEventListener("click", e => {
    if(e.target===sh || e.target.closest("[data-x]")) return close();
    if(e.target.closest("[data-zoom]")){ const im=sh.querySelector(".hero img"); if(im) openZoom(im.src, p.nm); return; }
    const o = e.target.closest("[data-opt]"); if(o && !o.disabled){ opt=o.dataset.opt; draw(); return; }
    if(e.target.closest("[data-vnext]")){ vi=(vi+1)%Math.max(1,vidsOf(p.id).length); draw(); return; }
    const q = e.target.closest("[data-q]"); if(q){ qty=Math.max(1,Math.min(20,qty+ +q.dataset.q)); draw(); return; }
    if(e.target.closest("[data-add]")){
      const optLb = optLabel(opt), price = optPrice(opt);
      const ex = cart.find(l=>l.id===p.id && l.opt===optLb);
      if(ex) ex.qty+=qty; else cart.push({id:p.id, nm:p.nm, opt:optLb, price, qty});
      save(); close(); render(); toast("ໃສ່ກະຕ່າແລ້ວ");
    }
  });
  sh.querySelector("[data-x]").focus();
}

document.addEventListener("click", e => {
  const t = e.target.closest("nav.tabs button"); if(t){ tab=t.dataset.tab; if(tab==="home"){filter=null;query="";$("#q").value="";} render(); window.scrollTo(0,0); return; }
  const g = e.target.closest("[data-tab-go]"); if(g){ tab=g.dataset.tabGo; render(); return; }
  const o = e.target.closest("[data-open]"); if(o){ openProduct(o.dataset.open); return; }
  const vd = e.target.closest("[data-vid]"); if(vd){ openVideo(vd.dataset.vid); return; }
  const n = e.target.closest("[data-need]"); if(n){ filter = filter===n.dataset.need && tab==="all" ? null : n.dataset.need; tab="all"; render(); window.scrollTo(0,0); return; }
  if(e.target.closest("[data-more]")){ shown += 40; render(); return; }
  if(e.target.closest("[data-clear]")){ filter=null; query=""; $("#q").value=""; render(); return; }
  const inc = e.target.closest("[data-inc]"); if(inc){ cart[+inc.dataset.inc].qty++; save(); render(); return; }
  const dec = e.target.closest("[data-dec]"); if(dec){ const i=+dec.dataset.dec; cart[i].qty--; if(cart[i].qty<1) cart.splice(i,1); save(); render(); return; }
  if(e.target.closest("#copyMsg")){ const ta=$("#msg"); const fb=()=>{ta.select();toast("ກົດຄ້າງແລ້ວເລືອກ ຄັດລອກ");}; try{ navigator.clipboard.writeText(ta.value).then(()=>toast("ຄັດລອກແລ້ວ"),fb); }catch(_){ fb(); } }
});
document.addEventListener("input", e => {
  const k = e.target.dataset && e.target.dataset.cust; if(!k) return;
  cust[k] = e.target.value; store("nnz-cust", cust);
  const a = document.getElementById("sendWa"); if(a) a.href = waLink(orderText());
  const m = document.getElementById("msg"); if(m) m.value = orderText();
});
document.addEventListener("change", e => { if(e.target.name==="dl"){ delivery=e.target.value; store("nnz-delivery",delivery); render(); }
  if(e.target.name==="py"){ pay=e.target.value; store("nnz-pay",pay); render(); } });
$("#q").addEventListener("input", e => { query=e.target.value; if(query && tab!=="all") tab="all"; render(); });

$("#proto").hidden = !CFG.sampleMode;
$("#topWa").href = waLink("ສະບາຍດີ nnz ວິຕາມິນ ຂໍສອບຖາມສິນຄ້າ");
render();

// ----- ໂຫຼດສິນຄ້າ: Google Sheet ກ່ອນ ຖ້າບໍ່ໄດ້ ໃຊ້ products.csv -----
async function load(url){ const r = await fetch(url, {cache:"no-store"}); if(!r.ok) throw new Error("HTTP "+r.status); const t = await r.text(); if(!/^\uFEFF?id,/.test(t)) throw new Error("not product csv"); return t; }
(async () => {
  let text = "";
  try{ text = await load(CFG.sheetCsvUrl || "products.csv"); }
  catch(e){ try{ if(CFG.sheetCsvUrl) text = await load("products.csv"); else throw e; }catch(e2){ loadErr = "ກວດອິນເຕີເນັດ ແລ້ວລອງເປີດໃໝ່"; } }
  if(text){
    P = mergeVariants(parseCSV(text).filter(r=>!/ກົ້ນຂວດ/.test(r.name_lo||""))).map(toProduct).filter(p=>p.full>0 || p.trials.length); // ນ້ຳຫອມກົ້ນຂວດ ມີຢ່າງລະຂວດ ບໍ່ສະແດງໃນແອັບ
    P.sort((a,b)=>(b.photo?1:0)-(a.photo?1:0)); // ສິນຄ້າທີ່ມີຮູບແທ້ຂຶ້ນກ່ອນ
    fetch("videos.json?t="+Date.now(),{cache:"no-store"}).then(r=>r.ok?r.json():[]).then(j=>{ V=Array.isArray(j)?j:[]; render(); }).catch(()=>{});
    // ລາຄາໃນກະຕ່າເກົ່າ ໃຫ້ກົງກັບລາຄາລ່າສຸດ
    cart = cart.filter(l=>P.some(p=>p.id===l.id)).map(l=>{ const p=P.find(x=>x.id===l.id); const t=p.trials.find(t=>("ຂວດແບ່ງ "+t.qty).trim()===l.opt); return {...l, nm:p.nm, price: t? t.price : (p.full||l.price)}; });
    save();
  }
  render();
})();

if("serviceWorker" in navigator && location.protocol==="https:"){ navigator.serviceWorker.register("sw.js").catch(()=>{}); }
})();
