/* =====================================================================
   Il giro della casa — Keur Serigne Touba Fano
   14 foto vere; i punti dorati portano da una tappa all'altra.
   Per cambiare un testo o un punto: modifica l'elenco NODES qui sotto
   (x e y sono la posizione del punto sulla foto, in percentuale).
   ===================================================================== */
(function () {
'use strict';
var D = window.DTF, $ = D.$;
var NODES = [
  {img:'cancello',a:1.7877,f:[.5,.55],t:['Il cancello','Le portail'],h1:true,
   p:['Da fuori la riconosci così: due pilastri bianchi e il cancello grigio. Entra e percorri il vialetto tra le siepi.','De l\'extérieur, tu la reconnais ainsi : deux piliers blancs et le portail gris. Entre et suis l\'allée entre les haies.'],
   hs:[{x:50,y:63,l:['Entra nel vialetto','Entre dans l\'allée'],to:1}]},
  {img:'facciata-prato',a:2.2099,f:[.6,.5],t:['Arrivo alla casa','Arrivée à la maison'],
   p:['In fondo al vialetto vedi la casa bianca, con il piazzale di ghiaia e i pioppi. Si intravedono già le scale.','Au bout de l\'allée, tu vois la maison blanche, avec la cour de gravier et les peupliers. On aperçoit déjà l\'escalier.'],
   hs:[{x:66,y:40,l:['Le scale','L\'escalier'],to:2},{x:47,y:55,l:['Davanti alla casa','Devant la maison'],to:3,left:true}]},
  {img:'scale',a:1.4337,f:[.45,.5],t:['Le scale','L\'escalier'],
   p:['La scala esterna che sale alla loggia del primo piano.','L\'escalier extérieur qui monte à la loggia du premier étage.'],
   hs:[{x:52,y:78,l:['Davanti alla casa','Devant la maison'],to:3}]},
  {img:'facciata-cucina',a:2.2099,f:[.45,.5],t:['La casa da davanti','La maison de face'],
   p:['A sinistra la cucina, al centro la porta grigia, a destra la scala.','À gauche la cuisine, au centre la porte grise, à droite l\'escalier.'],
   hs:[{x:14,y:60,l:['La cucina','La cuisine'],to:4},{x:73,y:47,l:['Le scale','L\'escalier'],to:2}]},
  {img:'vicolo-coperto',a:2.3324,f:[.42,.55],t:['La cucina','La cuisine'],
   p:['L\'anteprima della cucina. Accanto, a sinistra, parte un piccolo vicolo.','Un aperçu de la cuisine. À côté, à gauche, part une petite ruelle.'],
   hs:[{x:12,y:64,l:['Il vicolo','La ruelle'],to:5},{x:55,y:62,l:['Commissione Cucina','Commission Cuisine'],comm:'cucina',left:true}]},
  {img:'vialetto',a:1.2125,f:[.48,.5],t:['Il vicolo','La ruelle'],
   p:['Il vialetto di pietra lungo la casa. In fondo, il padiglione rotondo: lì c\'è la commissione Caffè.','L\'allée de pierre le long de la maison. Au fond, le pavillon rond : c\'est là que se trouve la commission Café.'],
   hs:[{x:49,y:47,l:['Commissione Caffè','Commission Café'],to:6}]},
  {img:'padiglione',a:1.7998,f:[.42,.55],t:['La commissione Caffè','La commission Café'],
   p:['Il padiglione rotondo, da vicino: qui la commissione prepara il Café Touba.','Le pavillon rond, de près : ici la commission prépare le Café Touba.'],
   hs:[{x:41,y:66,l:['Scopri la commissione','Découvrir la commission'],comm:'caffe'},{x:88,y:50,l:['A destra: le altre sale','À droite : les autres salles'],to:7,left:true}]},
  {img:'giardino',a:1.7957,f:[.6,.5],t:['Verso le altre sale','Vers les autres salles'],
   p:['A destra del giardino, sotto il pergolato, si entra nelle altre sale.','À droite du jardin, sous la pergola, on entre dans les autres salles.'],
   hs:[{x:93,y:42,l:['Le altre sale','Les autres salles'],to:8,left:true},{x:11,y:45,l:['Commissione Caffè','Commission Café'],to:6}]},
  {img:'pergolato',a:1.7837,f:[.55,.55],t:['Le altre sale','Les autres salles'],
   p:['Sotto il pergolato ci sono gli ingressi alle sale. Ripercorrendo verso il piazzale trovi la porta con i due vasi.','Sous la pergola se trouvent les entrées des salles. En revenant vers la cour, tu trouves la porte aux deux pots de fleurs.'],
   hs:[{x:13,y:57,l:['La porta con i vasi','La porte aux pots de fleurs'],to:9}]},
  {img:'porta-socchiusa',a:1.7817,f:[.5,.5],t:['La porta con i vasi','La porte aux pots de fleurs'],
   p:['Porta in legno, lanterna sopra e due vasi di gerani rossi davanti.','Porte en bois, lanterne au-dessus et deux pots de géraniums rouges devant.'],
   hs:[{x:52,y:55,l:['Entra','Entre'],to:10}]},
  {img:'porta-aperta',a:1.7817,f:[.5,.5],t:['Si entra','On entre'],
   p:['Dietro la porta c\'è un\'altra sala.','Derrière la porte se trouve une autre salle.'],
   hs:[{x:52,y:52,l:['La sala','La salle'],to:11}]},
  {img:'sala',a:1.7817,f:[.55,.5],t:['La sala','La salle'],
   p:['La sala vuota, con le colonne bianche e le pareti gialle.','La salle vide, avec ses colonnes blanches et ses murs jaunes.'],
   hs:[{x:84,y:56,l:['Esci: i bagni','Sors : les toilettes'],to:12,left:true}]},
  {img:'portico',a:1.7857,f:[.45,.5],t:['I bagni','Les toilettes'],
   p:['Uscendo dalla stessa porta, di fronte c\'è l\'edificio dei bagni, per le donne e per gli uomini.','En sortant par la même porte, en face se trouve le bâtiment des toilettes, pour les femmes et pour les hommes.'],
   hs:[{x:82,y:46,l:['Il giardinetto','Le petit jardin'],to:13,left:true}]},
  {img:'giardinetto',a:1.768,f:[.5,.5],t:['Il giardinetto','Le petit jardin'],
   p:['Il piccolo giardino tra gli alberi. Il giro finisce qui.','Le petit jardin entre les arbres. La visite se termine ici.'],
   hs:[{x:50,y:74,l:['Torna al cancello','Retour au portail'],to:0}]}
];
var tour = $('tour'); if (!tour) return;
var reduce = D.reduce, layers = [$('layerA'), $('layerB')], active = 0, cur = -1, N = NODES.length, playing = false, inView = true;
var barsEl = $('bars'), capEl = $('cap'), hlEl = $('hl'), hint = $('hint'), edgeL = $('edgeL'), edgeR = $('edgeR'), edges = [];
var ARROW = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>';
var st = {x:0,y:0,tx:0,ty:0,bx:0,by:0,pw:0,ph:0,minX:0,minY:0};
function L(a) { return D.L(a[0], a[1]); }
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
barsEl.innerHTML = NODES.map(function () { return '<span><i></i></span>'; }).join('');
function renderHl() {
  hlEl.innerHTML = NODES.map(function (n, i) { return '<button type="button" data-i="' + i + '" class="' + (i === cur ? 'on' : '') + '"><span class="ring"><img src="img/tour/' + n.img + '.webp" alt="" loading="lazy"></span><span>' + (i + 1) + '. ' + D.esc(L(n.t)) + '</span></button>'; }).join('');
}
renderHl();
var bars = [].slice.call(barsEl.children);
function build(layer, i) {
  var n = NODES[i];
  layer.querySelector('.zoom').innerHTML = '<div class="pano"><img src="img/tour/' + n.img + '.webp" alt="' + D.esc(L(n.t)) + '"' + (i === 0 ? ' fetchpriority="high"' : '') + '>' +
    n.hs.map(function (h, k) { return '<button type="button" class="hs' + (h.left ? ' left' : '') + (h.comm ? ' comm' : '') + '" style="left:' + h.x + '%;top:' + h.y + '%" data-k="' + k + '"><span class="dot"></span><span class="lbl">' + D.esc(L(h.l)) + ARROW + '</span></button>'; }).join('') + '</div>';
}
function measure(i) {
  var n = NODES[i], W = tour.clientWidth, H = tour.clientHeight, z = matchMedia('(pointer:fine)').matches ? 1.1 : 1.02;
  var pw = Math.max(W, H * n.a) * z, ph = pw / n.a; if (ph < H * z) { ph = H * z; pw = ph * n.a; }
  var fx = n.f[0]; if (W < pw * .7 && n.hs.length) { var sx = 0; n.hs.forEach(function (h) { sx += h.x / 100; }); fx = (sx / n.hs.length + fx) / 2; }
  return {pw: pw, ph: ph, minX: W - pw, minY: H - ph, bx: clamp(W / 2 - fx * pw, W - pw, 0), by: clamp(H / 2 - n.f[1] * ph, H - ph, 0)};
}
function size(layer, m) { var p = layer.querySelector('.pano'); p.style.width = m.pw + 'px'; p.style.height = m.ph + 'px'; }
function setState(m) { st.pw = m.pw; st.ph = m.ph; st.minX = m.minX; st.minY = m.minY; st.bx = st.tx = st.x = m.bx; st.by = st.ty = st.y = m.by; }
function caption() {
  var n = NODES[cur], nx = NODES[(cur + 1) % N];
  var tag = n.h1 ? 'h1' : 'h2';
  var title = n.h1 ? 'Keur Serigne <em>Touba</em> Fano' : D.esc(L(n.t));
  capEl.innerHTML = '<span class="n">' + D.esc(D.L('Tappa ', 'Étape ') + (cur + 1) + D.L(' di ', ' sur ') + N + ' · ' + L(n.t)) + '</span><' + tag + '>' + title + '</' + tag + '><p>' + D.esc(L(n.p)) + '</p>';
  $('nextT').textContent = '· ' + L(nx.t);
}
function buildEdges() {
  var n = NODES[cur]; edgeL.innerHTML = ''; edgeR.innerHTML = '';
  edges = n.hs.map(function (h) {
    var l = document.createElement('button'), r = document.createElement('button'); l.type = r.type = 'button';
    l.innerHTML = '<svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>' + D.esc(L(h.l)); r.innerHTML = D.esc(L(h.l)) + '<svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>';
    l.hidden = r.hidden = true;
    l.onclick = r.onclick = function () { user(); st.tx = st.bx = clamp(tour.clientWidth / 2 - h.x / 100 * st.pw, st.minX, 0); };
    edgeL.appendChild(l); edgeR.appendChild(r); return {h: h, l: l, r: r};
  });
}
function go(i, fromEl) {
  i = (i + N) % N; if (i === cur) return;
  var old = layers[active], nxt = layers[1 - active], first = cur < 0;
  build(nxt, i); var m = measure(i); size(nxt, m); setState(m);
  nxt.querySelector('.pano').style.transform = 'translate3d(' + m.bx + 'px,' + m.by + 'px,0)';
  if (!first && !reduce && nxt.animate) {
    var tr = tour.getBoundingClientRect(), ox = tr.width / 2, oy = tr.height / 2;
    if (fromEl) { var r = fromEl.querySelector('.dot').getBoundingClientRect(); ox = r.left + r.width / 2 - tr.left; oy = r.top + r.height / 2 - tr.top; }
    var oz = old.querySelector('.zoom'); oz.style.transformOrigin = ox + 'px ' + oy + 'px';
    oz.animate([{transform: 'scale(1)'}, {transform: 'scale(' + (fromEl ? 1.7 : 1.06) + ')'}], {duration: 850, easing: 'cubic-bezier(.5,0,.2,1)'});
    old.animate([{opacity: 1, visibility: 'visible'}, {opacity: 0, visibility: 'visible'}], {duration: 850, easing: 'ease-in'});
    var nz = nxt.querySelector('.zoom'); nz.style.transformOrigin = '50% 50%';
    nz.animate([{transform: 'scale(' + (fromEl ? 1.14 : 1.04) + ')'}, {transform: 'scale(1)'}], {duration: 1000, easing: 'cubic-bezier(.2,.7,.2,1)'});
    nxt.animate([{opacity: 0}, {opacity: 1}], {duration: 650, delay: 220, fill: 'backwards'});
  }
  old.classList.remove('on'); nxt.classList.add('on'); active = 1 - active; cur = i;
  caption(); buildEdges();
  bars.forEach(function (b, k) { b.classList.toggle('done', k < i); b.classList.toggle('on', k === i); var bi = b.firstChild; bi.style.animation = 'none'; void bi.offsetWidth; bi.style.animation = ''; });
  [].forEach.call(hlEl.children, function (b, k) { b.classList.toggle('on', k === i); });
  var hb = hlEl.children[i]; if (!first) hlEl.scrollTo({left: hb.offsetLeft - hlEl.clientWidth / 2 + hb.clientWidth / 2, behavior: reduce ? 'auto' : 'smooth'});
  var pre = new Image(); pre.src = 'img/tour/' + NODES[(i + 1) % N].img + '.webp';
}
function setPlaying(p) {
  playing = p && !reduce; tour.classList.toggle('playing', playing && inView);
  $('ppIcon').innerHTML = playing ? '<rect x="3" y="2" width="3.5" height="12"/><rect x="9.5" y="2" width="3.5" height="12"/>' : '<path d="M4 2l10 6-10 6z"/>';
  $('ppText').textContent = playing ? D.L('Pausa', 'Pause') : D.L('Giro automatico', 'Visite automatique');
  $('pp').setAttribute('aria-label', playing ? D.L('Metti in pausa il giro', 'Mettre la visite en pause') : D.L('Avvia il giro automatico', 'Lancer la visite automatique'));
}
function user() { hint.classList.add('off'); if (playing) setPlaying(false); }
barsEl.addEventListener('animationend', function () { if (playing) go(cur + 1); });
$('pp').addEventListener('click', function () { hint.classList.add('off'); setPlaying(!playing); });
$('prev').addEventListener('click', function () { user(); go(cur - 1); });
$('next').addEventListener('click', function () { user(); go(cur + 1); });
hlEl.addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) { user(); go(+b.dataset.i); } });
tour.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight') { user(); go(cur + 1); } else if (e.key === 'ArrowLeft') { user(); go(cur - 1); } });
var drag = null, moved = 0;
tour.addEventListener('click', function (e) {
  var b = e.target.closest('.hs'); if (!b || moved > 8) return; var h = NODES[cur].hs[+b.dataset.k]; user();
  if (h.comm) { if (D.openCommission) D.openCommission(h.comm); else location.href = 'commissioni.html#' + h.comm; return; }
  go(h.to, b);
});
tour.addEventListener('pointerdown', function (e) { if (e.pointerType === 'mouse' && e.button !== 0) return; if (e.target.closest('.ctrl')) return; drag = {x: e.clientX, y: e.clientY, sx: st.tx, sy: st.ty, touch: e.pointerType !== 'mouse'}; moved = 0; });
addEventListener('pointermove', function (e) {
  if (drag) {
    var dx = e.clientX - drag.x, dy = e.clientY - drag.y; moved = Math.max(moved, Math.abs(dx) + Math.abs(dy));
    if (moved > 6) { tour.classList.add('dragging'); hint.classList.add('off'); }
    st.tx = clamp(drag.sx + dx, st.minX, 0); if (!drag.touch) st.ty = clamp(drag.sy + dy, st.minY, 0); st.bx = st.tx; st.by = st.ty; return;
  }
  if (e.pointerType !== 'mouse' || reduce) return;
  var r = tour.getBoundingClientRect(); if (e.clientY < r.top || e.clientY > r.bottom) return;
  var mx = (e.clientX - r.left) / r.width - .5, my = (e.clientY - r.top) / r.height - .5;
  st.tx = clamp(st.bx - mx * (st.pw - r.width) * .6, st.minX, 0); st.ty = clamp(st.by - my * (st.ph - r.height) * .6, st.minY, 0);
}, {passive: true});
function endDrag() { if (drag) { drag = null; setTimeout(function () { tour.classList.remove('dragging'); }, 0); } }
addEventListener('pointerup', endDrag); addEventListener('pointercancel', endDrag);
addEventListener('resize', function () { if (cur < 0) return; var m = measure(cur); size(layers[active], m); setState(m); });
var raf = 0;
function tick() {
  raf = 0; if (!inView || document.hidden) return;
  st.x += (st.tx - st.x) * .09; st.y += (st.ty - st.y) * .09;
  var p = layers[active].querySelector('.pano'); if (p) p.style.transform = 'translate3d(' + st.x.toFixed(1) + 'px,' + st.y.toFixed(1) + 'px,0)';
  var W = tour.clientWidth; edges.forEach(function (e) { var x = st.x + e.h.x / 100 * st.pw; var Lh = x < 18, Rh = x > W - 18; if (e.l.hidden === Lh) e.l.hidden = !Lh; if (e.r.hidden === Rh) e.r.hidden = !Rh; });
  raf = requestAnimationFrame(tick);
}
function startLoop() { if (!raf) raf = requestAnimationFrame(tick); }
if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { inView = es[0].isIntersecting; tour.classList.toggle('playing', playing && inView); if (inView) startLoop(); }, {threshold: .2}).observe(tour);
document.addEventListener('visibilitychange', startLoop);
document.addEventListener('dtf:lang', function () {
  if (cur < 0) return; var i = cur, l = layers[active]; build(l, i); size(l, {pw: st.pw, ph: st.ph}); caption(); buildEdges(); renderHl(); setPlaying(playing);
  $('hint').innerHTML = D.t('Tocca i punti dorati per muoverti · trascina per guardarti intorno', 'Touche les points dorés pour avancer · fais glisser pour regarder autour');
});
D.tourGo = function (i) { tour.scrollIntoView({behavior: reduce ? 'auto' : 'smooth', block: 'start'}); go(i, null); };
go(0, null); setPlaying(false); startLoop();
})();
