/* =====================================================================
   Dahira Touba Fano — script comune a tutte le pagine
   Menu, lingua IT/FR, dati da Supabase, medaglioni, lightbox.
   Se Supabase non risponde, il sito mostra comunque i testi di base.
   ===================================================================== */
(function () {
'use strict';
var SUPABASE_URL = 'https://elgzwgudzwqrrzygfpkp.supabase.co';
var SUPABASE_KEY = 'sb_publishable_5rREEvJSaB4fLXNLSabFPQ_ooWsJEWH';
var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
var D = window.DTF = {};
D.reduce = reduce;
D.sb = (window.supabase && window.supabase.createClient) ? window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY) : null;
function $(id) { return document.getElementById(id); }
D.$ = $;

/* ---------- Testi ---------- */
var esc = D.esc = function (s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; });
};
// testo nelle due lingue: <span data-it>…</span><span data-fr>…</span>
D.t = function (it, fr, tag) {
  tag = tag || 'span'; it = it || fr || ''; fr = fr || it;
  if (it === fr) return '<' + tag + '>' + esc(it) + '</' + tag + '>';
  return '<' + tag + ' data-it>' + esc(it) + '</' + tag + '><' + tag + ' data-fr>' + esc(fr) + '</' + tag + '>';
};
// paragrafi da un testo con righe vuote
D.paras = function (it, fr) {
  function p(s) { return String(s || '').split(/\n\s*\n/).filter(Boolean).map(function (x) { return '<p>' + esc(x.trim()) + '</p>'; }).join(''); }
  it = it || fr || ''; fr = fr || it;
  return it === fr ? p(it) : '<div data-it>' + p(it) + '</div><div data-fr>' + p(fr) + '</div>';
};

/* ---------- Lingua ---------- */
D.lang = 'it';
try { D.lang = localStorage.getItem('dtf_lang') === 'fr' ? 'fr' : 'it'; } catch (e) {}
var qlang = new URLSearchParams(location.search).get('lang'); if (qlang === 'fr' || qlang === 'it') D.lang = qlang;
D.setLang = function (l) {
  D.lang = l === 'fr' ? 'fr' : 'it';
  document.body.classList.toggle('lang-fr', D.lang === 'fr');
  document.documentElement.lang = D.lang;
  [].forEach.call(document.querySelectorAll('.lang button'), function (b) { b.setAttribute('aria-pressed', b.dataset.l === D.lang); });
  try { localStorage.setItem('dtf_lang', D.lang); } catch (e) {}
  document.dispatchEvent(new CustomEvent('dtf:lang'));
};
D.L = function (it, fr) { return D.lang === 'fr' ? (fr || it) : (it || fr); };

/* ---------- Simboli ---------- */
D.ICONS = {
  caffe: '<path d="M4 9h12v4a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z"/><path d="M16 10h1.5a2.5 2.5 0 0 1 0 5H16"/><path d="M8 3c-.7.8-.7 1.7 0 2.6M12 3c-.7.8-.7 1.7 0 2.6"/><path d="M3 21h15"/>',
  cucina: '<path d="M3 11h18"/><path d="M5 11v2a7 7 0 0 0 7 7h0a7 7 0 0 0 7-7v-2"/><path d="M9 11V9a3 3 0 0 1 6 0v2"/><path d="M12 4v2"/>',
  audiovisivo: '<rect x="3" y="7" width="12" height="10" rx="1.5"/><path d="M15 11l6-3.5v9L15 13z"/><circle cx="7" cy="10" r=".6"/>',
  organizzazione: '<rect x="3" y="5" width="18" height="16" rx="1.5"/><path d="M3 10h18M8 3v4M16 3v4"/><path d="M7 14h4M7 17h7"/>',
  kourel: '<path d="M12 7c-2-1.6-5-2-8-1.4V18c3-.6 6-.2 8 1.4 2-1.6 5-2 8-1.4V5.6C17 5 14 5.4 12 7z"/><path d="M12 7v12.4"/><path d="M7 2.6c.8.5 1.2 1.2 1.2 2M17 2.6c-.8.5-1.2 1.2-1.2 2M12 1.6v1.6"/>',
  archivio: '<rect x="3" y="4" width="18" height="5" rx="1"/><path d="M5 9v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9"/><path d="M10 13h4"/>',
  evento: '<path d="M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.4 6.8 19.1l1-5.8L3.5 9.2l5.9-.9z"/>'
};
D.STAR = '<svg viewBox="0 0 100 100" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width=".9"><rect x="21" y="21" width="58" height="58"/><rect x="21" y="21" width="58" height="58" transform="rotate(45 50 50)"/><rect x="30" y="30" width="40" height="40" transform="rotate(22.5 50 50)"/><rect x="30" y="30" width="40" height="40" transform="rotate(67.5 50 50)"/><circle cx="50" cy="50" r="46"/><circle cx="50" cy="50" r="22"/></g></svg>';
D.icon = function (id) { return '<svg viewBox="0 0 24 24" aria-hidden="true">' + (D.ICONS[id] || D.ICONS.evento) + '</svg>'; };
D.medal = function (id, extra) {
  return '<span class="medal' + (extra ? ' ' + extra : '') + '"><span class="rim"></span><span class="face"><span class="stars">' + D.STAR + '</span><span class="ico">' + D.icon(id) + '</span></span><span class="shine"></span></span>';
};
var SVG = {
  arrowL: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>',
  arrowR: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>',
  close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  pin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>',
  clock: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  cal: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="1.5"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>'
};
D.SVG = SVG;

/* ---------- Dati di base (se il database non risponde) ---------- */
D.DEFAULTS = {
  commissions: [
    {id:'caffe',sort:1,icon:'caffe',name_it:'Caffè',name_fr:'Café',lead_it:'Prepara e serve il Café Touba a ogni incontro della dahira, perché nessuno resti senza una tazza.',lead_fr:'Prépare et sert le Café Touba à chaque réunion de la dahira, pour que personne ne reste sans sa tasse.',story_title_it:'La storia del Café Touba',story_title_fr:"L'histoire du Café Touba",story_it:"Il Café Touba è caffè tostato insieme al djar, il pepe di Guinea, a volte con un po' di chiodi di garofano. Prende il nome dalla città santa di Touba.\n\nSecondo la tradizione è legato a Cheikh Ahmadou Bamba, Serigne Touba: la tradizione racconta che lo portò con sé al ritorno dall'esilio in Gabon. Per i murid prepararlo e offrirlo è un gesto di servizio, la khidma: per questo a ogni dahira si distribuisce a tutti.",story_fr:"Le Café Touba est un café torréfié avec le djar, le poivre de Guinée, parfois avec quelques clous de girofle. Il porte le nom de la ville sainte de Touba.\n\nSelon la tradition, il est lié à Cheikh Ahmadou Bamba, Serigne Touba : la tradition raconte qu'il l'a rapporté à son retour d'exil au Gabon. Pour les mourides, le préparer et l'offrir est un geste de service, la khidma : c'est pourquoi à chaque dahira on le distribue à tous."},
    {id:'cucina',sort:2,icon:'cucina',name_it:'Cucina',name_fr:'Cuisine',lead_it:"Gestita dalle Sokhna, prepara i pasti e cura l'accoglienza durante gli incontri e le ricorrenze religiose.",lead_fr:"Gérée par les Sokhna, elle prépare les repas et assure l'accueil lors des réunions et des fêtes religieuses."},
    {id:'audiovisivo',sort:3,icon:'audiovisivo',name_it:'Audiovisivo',name_fr:'Audiovisuel',lead_it:'Documenta e trasmette gli eventi della dahira, gestisce i social e il podcast Keur Serigne Touba, e custodisce la memoria della comunità.',lead_fr:'Documente et diffuse les événements de la dahira, gère les réseaux sociaux et le podcast Keur Serigne Touba, et préserve la mémoire de la communauté.'},
    {id:'organizzazione',sort:4,icon:'organizzazione',name_it:'Organizzazione',name_fr:'Organisation',lead_it:'Organizza gli incontri del sabato, le lezioni di Corano, le veglie e le grandi ricorrenze, e cura le decorazioni della casa.',lead_fr:"Organise les réunions du samedi, les cours de Coran, les veillées et les grandes fêtes, et s'occupe des décorations de la maison."},
    {id:'kourel',sort:5,icon:'kourel',name_it:'Kourel Fano',name_fr:'Kourel Fano',lead_it:'Il Kourel Fano declama in coro i khassaïdes, i poemi scritti da Cheikh Ahmadou Bamba in lode del Profeta (PSL). Guidati da un capo coro che accorda le voci, i suoi membri cantano seduti in cerchio durante gli incontri della dahira, le veglie e il Magal.',lead_fr:'Le Kourel Fano déclame en chœur les khassaïdes, les poèmes composés par Cheikh Ahmadou Bamba à la louange du Prophète (PSL). Guidés par un maître de chœur qui harmonise les voix, ses membres chantent assis en cercle lors des réunions de la dahira, des veillées et du Magal.',story_title_it:'Una tradizione voluta da Serigne Touba',story_title_fr:'Une tradition voulue par Serigne Touba',story_it:'È una tradizione voluta da Serigne Touba stesso, che chiese al fratello Serigne Massamba Mbacké di formare il primo kourel, scegliendo persone pie, con una bella voce e una dizione chiara.',story_fr:'Cette tradition remonte à Serigne Touba lui-même, qui demanda à son frère Serigne Massamba Mbacké de former le premier kourel, en choisissant des personnes pieuses, à la belle voix et à la diction claire.'}
  ],
  weekly: [
    {id:'venerdi',day_it:'Venerdì',day_fr:'Vendredi',time:'',title_it:'Yobalu Aljuma',title_fr:'Yobalu Aljuma',text_it:'Lettura della Surah Al-Kahf ogni venerdì mattina, pratica settimanale della comunità.',text_fr:'Lecture de la Sourate Al-Kahf chaque vendredi matin, pratique hebdomadaire de la communauté.',program:[]},
    {id:'sabato',day_it:'Sabato',day_fr:'Samedi',time:'15:00',title_it:'Dahira generale',title_fr:'Dahira général',text_it:"L'incontro settimanale della comunità a Keur Serigne Touba Fano. Tutti sono benvenuti.",text_fr:'La réunion hebdomadaire de la communauté à Keur Serigne Touba Fano. Tout le monde est le bienvenu.',program:[{t:'15:00',l:'Al Quran Ak Durus'},{t:'16:15',l:'Kourèl Xassida'},{t:'17:15',l:'Takusàn'},{t:'17:30',l:'Kourèl Zikroulah'},{t:'18:15',l:'Waxtàne Ak Sognè'}]},
    {id:'domenica',day_it:'Domenica',day_fr:'Dimanche',time:'',title_it:'Lezioni di Corano',title_fr:'Cours de Coran',text_it:'Lo studio del Corano, aperto a grandi e piccoli.',text_fr:"L'étude du Coran, ouverte aux grands et aux petits.",program:[]}
  ],
  diayante: {visible:false,iban:'',holder:'',causale:'Diayanté Dahira Touba Fano',goal:0,raised:0,text_it:'Ogni contributo aiuta la casa, gli eventi e le attività della comunità. Si dona con un semplice bonifico, senza commissioni.',text_fr:'Chaque contribution aide la maison, les événements et les activités de la communauté. On donne par un simple virement, sans frais.'},
  links: {maps:'https://maps.app.goo.gl/Qmxy6Exi93mN8in39',youtube:'https://www.youtube.com/@DAHIRATOUBAFANO',telegram:'',whatsapp:'https://whatsapp.com/channel/0029VaztSqeKQuJGy0AREc0V',instagram_dahira:'https://www.instagram.com/dahira_touba_fano_',instagram_daray:'https://www.instagram.com/daray.toubafano',tiktok_dahira:'https://www.tiktok.com/@dahiratoubafano',tiktok_kourel:'https://www.tiktok.com/@kourel.touba.fano',qr:'https://benvenutidahiratoubafano.netlify.app/'},
  quotes: [
    {text_wo:'Liggéey mooy jaamu Yàlla. Ku liggéey ñeppam du fax.',text_it:'Il lavoro è il culto di Dio. Chi lavora con tutto sé stesso non sarà mai deluso.',text_fr:'Le travail est le culte de Dieu. Celui qui travaille de tout son être ne sera jamais déçu.',author:'Mame Cheikh Ibrahima Fall'},
    {text_wo:'Bul tiit dara, tiit rekk Yàlla. Ku tiit Yàlla, dara du ko tiit.',text_it:'Non temere nulla, temi solo Dio. Chi teme Dio, niente può temerlo.',text_fr:'Ne crains rien, crains seulement Dieu. Celui qui craint Dieu, rien ne peut lui faire peur.',author:'Mame Cheikh Ibrahima Fall'},
    {text_wo:'Xam nga ko ci lu muy def, du ci lu muy wax.',text_it:'Lo conosci da ciò che fa, non da ciò che dice.',text_fr:"On le connaît par ce qu'il fait, pas par ce qu'il dit.",author:'Mame Cheikh Ibrahima Fall'}
  ]
};

/* ---------- Lettura dal database ---------- */
var cache = {};
D.q = function (key, build) {
  if (cache[key]) return cache[key];
  if (!D.sb) return Promise.resolve(null);
  cache[key] = Promise.resolve().then(function () { return build(D.sb); }).then(function (r) {
    if (r.error) { console.warn('[dtf]', key, r.error.message); return null; }
    return r.data;
  }).catch(function (e) { console.warn('[dtf]', key, e); return null; });
  return cache[key];
};
D.settings = function () {
  return D.q('settings', function (sb) { return sb.from('settings').select('key,value'); }).then(function (rows) {
    var s = JSON.parse(JSON.stringify({weekly: D.DEFAULTS.weekly, diayante: D.DEFAULTS.diayante, links: D.DEFAULTS.links}));
    (rows || []).forEach(function (r) {
      if (r.value && typeof r.value === 'object' && !Array.isArray(r.value) && s[r.key] && !Array.isArray(s[r.key])) s[r.key] = Object.assign(s[r.key], r.value);
      else s[r.key] = r.value;
    });
    return s;
  });
};
D.commissions = function () {
  return D.q('commissions', function (sb) { return sb.from('commissions').select('*').order('sort'); }).then(function (rows) {
    return rows && rows.length ? rows : D.DEFAULTS.commissions;
  });
};
D.albums = function () {
  return D.q('albums', function (sb) { return sb.from('albums').select('*, events(id,title_it,title_fr,event_date,cover_url), media(count)').order('sort'); }).then(function (r) { return r || []; });
};
D.events = function () {
  return D.q('events', function (sb) { return sb.from('events').select('*').order('event_date', {ascending: false}); }).then(function (r) { return r || []; });
};
D.media = function (albumId) {
  return D.q('media:' + albumId, function (sb) { return sb.from('media').select('*').eq('album_id', albumId).order('sort').order('created_at'); }).then(function (r) { return r || []; });
};
D.carousel = function () {
  return D.q('carousel', function (sb) { return sb.from('media').select('*').eq('in_carousel', true).eq('kind', 'photo').order('created_at', {ascending: false}).limit(24); }).then(function (r) { return r || []; });
};
D.quotes = function () {
  return D.q('quotes', function (sb) { return sb.from('quotes').select('*').order('order_index'); }).then(function (r) { return r && r.length ? r : D.DEFAULTS.quotes; });
};
D.albumTitle = function (a, comms) {
  if (a.kind === 'evento' && a.events) return [a.events.title_it, a.events.title_fr];
  if (a.kind === 'commissione') {
    var c = (comms || []).filter(function (x) { return x.id === a.commission_id; })[0];
    if (c) return [c.name_it, c.name_fr];
  }
  return [a.title_it || 'Album', a.title_fr || a.title_it || 'Album'];
};

/* ---------- Date ---------- */
D.date = function (iso, opts) {
  if (!iso) return '';
  var d = new Date(iso + 'T12:00:00');
  opts = opts || {day: 'numeric', month: 'long', year: 'numeric'};
  return D.t(d.toLocaleDateString('it-IT', opts), d.toLocaleDateString('fr-FR', opts));
};
D.dateBox = function (iso) {
  var d = new Date(iso + 'T12:00:00');
  return '<b>' + d.getDate() + '</b>' + D.t(d.toLocaleDateString('it-IT', {month: 'short'}).replace('.', ''), d.toLocaleDateString('fr-FR', {month: 'short'}).replace('.', ''));
};
D.today = function () { var d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };

/* ---------- YouTube ---------- */
D.ytId = function (url) {
  var m = String(url || '').match(/(?:youtu\.be\/|v=|embed\/|shorts\/|live\/)([\w-]{11})/);
  return m ? m[1] : null;
};
D.ytThumb = function (url) { var id = D.ytId(url); return id ? 'https://i.ytimg.com/vi/' + id + '/hqdefault.jpg' : ''; };
D.ytEmbed = function (url) { var id = D.ytId(url); return id ? 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0' : ''; };

/* ---------- Menu e piè di pagina ---------- */
var PAGES = [
  {href: 'index.html', it: 'Home', fr: 'Accueil'},
  {href: 'chisiamo.html', it: 'Chi siamo', fr: 'Qui sommes-nous'},
  {href: 'commissioni.html', it: 'Commissioni', fr: 'Commissions', sub: true},
  {href: 'eventi.html', it: 'Eventi', fr: 'Événements'},
  {href: 'galleria.html', it: 'Galleria', fr: 'Galerie'},
  {href: 'citazioni.html', it: 'Citazioni', fr: 'Citations'},
  {href: 'social.html', it: 'Media', fr: 'Médias'},
  {href: 'contatti.html', it: 'Contatti', fr: 'Contact'}
];
function here() { var p = location.pathname.split('/').pop() || 'index.html'; return p === '' ? 'index.html' : p; }
function renderNav(comms) {
  var top = $('top'); if (!top) return;
  var cur = here();
  top.className = 'top';
  top.innerHTML = '<div class="wrap">' +
    '<a class="brand" href="index.html"><img src="img/logo-192.webp" alt="" width="40" height="40"><span><b>Dahira Touba Fano</b><small>Keur Serigne Touba</small></span></a>' +
    '<nav class="nav" id="nav" aria-label="Menu principale">' + PAGES.map(function (p) {
      var on = p.href === cur ? ' aria-current="page"' : '';
      if (p.sub) {
        return '<div class="has-sub' + (p.href === cur ? ' cur' : '') + '"><button class="sub-btn" type="button" aria-expanded="false">' + D.t(p.it, p.fr) + '</button><div class="sub">' +
          '<a href="commissioni.html">' + D.icon('evento') + D.t('Tutte le commissioni', 'Toutes les commissions') + '</a>' +
          comms.map(function (c) { return '<a href="commissioni.html#' + c.id + '">' + D.icon(c.icon) + D.t(c.name_it, c.name_fr) + '</a>'; }).join('') + '</div></div>';
      }
      return '<a href="' + p.href + '"' + on + '>' + D.t(p.it, p.fr) + '</a>';
    }).join('') + '</nav>' +
    '<div class="lang" role="group" aria-label="Lingua / Langue"><button type="button" data-l="it" aria-pressed="true">IT</button><button type="button" data-l="fr" aria-pressed="false">FR</button></div>' +
    '<button class="menu-btn" id="menuBtn" type="button" aria-expanded="false" aria-controls="nav">' + D.t('Menu', 'Menu') + '</button></div>';
  var nav = $('nav'), btn = $('menuBtn');
  function setMenu(o) { nav.classList.toggle('open', o); btn.setAttribute('aria-expanded', o); document.body.classList.toggle('menu-open', o); }
  btn.addEventListener('click', function () { setMenu(!nav.classList.contains('open')); });
  nav.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  var sb = top.querySelector('.sub-btn'), hs = top.querySelector('.has-sub');
  sb.addEventListener('click', function () { var o = !hs.classList.contains('open'); hs.classList.toggle('open', o); sb.setAttribute('aria-expanded', o); });
  document.addEventListener('click', function (e) { if (!e.target.closest('.has-sub')) { hs.classList.remove('open'); sb.setAttribute('aria-expanded', false); } });
  top.querySelector('.lang').addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) D.setLang(b.dataset.l); });
  addEventListener('resize', function () { if (innerWidth > 1020) setMenu(false); });
}
function renderFoot(comms, links) {
  var f = $('foot'); if (!f) return;
  f.className = 'foot';
  f.innerHTML = '<div class="wrap">' +
    '<div class="who-col"><div class="who"><img src="img/logo-192.webp" alt="" width="46" height="46"><div><b>Dahira Touba Fano</b><span>Khadaikhoul Fadha-il · Keur Serigne Touba Fano</span></div></div>' +
    '<p style="margin-top:1rem;max-width:40ch">' + D.t('Comunità Mouride a Fano. Ci incontriamo ogni sabato a Monterado (AN).', 'Communauté mouride à Fano. Nous nous réunissons chaque samedi à Monterado (AN).') + '</p></div>' +
    '<div><h4>' + D.t('Il sito', 'Le site') + '</h4><nav>' + PAGES.map(function (p) { return '<a href="' + p.href + '">' + D.t(p.it, p.fr) + '</a>'; }).join('') + '</nav></div>' +
    '<div><h4>' + D.t('Commissioni', 'Commissions') + '</h4><nav>' + comms.map(function (c) { return '<a href="commissioni.html#' + c.id + '">' + D.t(c.name_it, c.name_fr) + '</a>'; }).join('') +
    '<a href="' + esc(links.maps) + '" target="_blank" rel="noopener">' + D.t('Come arrivare', 'Comment venir') + '</a></nav></div>' +
    '<div class="copy"><span>© ' + new Date().getFullYear() + ' Dahira Touba Fano · Khadaikhoul Fadha-il</span><a href="admin.html">' + D.t('Area riservata', 'Espace réservé') + '</a></div></div>';
}

/* ---------- Lightbox ---------- */
D.lightbox = function (items, start) {
  if (!items.length) return;
  var i = start || 0, last = document.activeElement;
  var lb = document.createElement('div');
  lb.className = 'lb'; lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-modal', 'true'); lb.setAttribute('aria-label', D.L('Foto', 'Photo'));
  lb.innerHTML = '<div class="lb-top"><span class="lb-n"></span><button type="button" class="lb-x" aria-label="' + D.L('Chiudi', 'Fermer') + '">' + SVG.close + '</button></div>' +
    '<div class="lb-stage"><div class="lb-media" style="display:contents"></div>' + (items.length > 1 ? '<div class="lb-nav"><button type="button" class="lb-p" aria-label="' + D.L('Precedente', 'Précédente') + '">' + SVG.arrowL + '</button><button type="button" class="lb-f" aria-label="' + D.L('Successiva', 'Suivante') + '">' + SVG.arrowR + '</button></div>' : '') + '</div>' +
    '<div class="lb-cap"></div>';
  document.body.appendChild(lb); document.documentElement.style.overflow = 'hidden';
  function show() {
    var m = items[i], box = lb.querySelector('.lb-media');
    box.innerHTML = m.kind === 'youtube' ? '<iframe src="' + esc(D.ytEmbed(m.url)) + '" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen title="Video"></iframe>' : '<img src="' + esc(m.url) + '" alt="' + esc(D.L(m.caption_it, m.caption_fr) || '') + '">';
    lb.querySelector('.lb-n').textContent = (i + 1) + ' / ' + items.length;
    lb.querySelector('.lb-cap').innerHTML = (m.caption_it || m.caption_fr) ? D.t(m.caption_it, m.caption_fr) : '';
  }
  function go(d) { i = (i + d + items.length) % items.length; show(); }
  function close() { lb.remove(); document.documentElement.style.overflow = ''; document.removeEventListener('keydown', key); if (last) last.focus({preventScroll: true}); }
  function key(e) { if (e.key === 'Escape') close(); else if (e.key === 'ArrowRight') go(1); else if (e.key === 'ArrowLeft') go(-1); }
  lb.querySelector('.lb-x').onclick = close;
  if (items.length > 1) { lb.querySelector('.lb-p').onclick = function () { go(-1); }; lb.querySelector('.lb-f').onclick = function () { go(1); }; }
  lb.addEventListener('click', function (e) { if (e.target === lb || e.target.classList.contains('lb-stage')) close(); });
  var sx = null; lb.addEventListener('pointerdown', function (e) { sx = e.clientX; });
  lb.addEventListener('pointerup', function (e) { if (sx != null && Math.abs(e.clientX - sx) > 50 && items.length > 1) go(e.clientX < sx ? 1 : -1); sx = null; });
  document.addEventListener('keydown', key);
  show(); lb.querySelector('.lb-x').focus();
};
// griglia di foto con lightbox
D.photoGrid = function (el, items) {
  if (!items.length) { el.innerHTML = '<div class="empty">' + D.t('Non ci sono ancora foto in questo album.', "Il n'y a pas encore de photos dans cet album.") + '</div>'; return; }
  el.innerHTML = '<div class="photos">' + items.map(function (m, k) {
    var src = m.kind === 'youtube' ? D.ytThumb(m.url) : m.url;
    return '<button type="button" data-k="' + k + '" class="' + (m.kind === 'youtube' ? 'yt' : '') + '" aria-label="' + esc(D.L(m.caption_it, m.caption_fr) || (m.kind === 'youtube' ? 'Video' : D.L('Apri la foto', 'Ouvrir la photo'))) + '"><img src="' + esc(src) + '" alt="" loading="lazy" decoding="async"></button>';
  }).join('') + '</div>';
  el.querySelector('.photos').addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) D.lightbox(items, +b.dataset.k); });
};

/* ---------- Medaglioni e pagina della commissione ---------- */
D.mountCommissions = function (opts) {
  var comms = opts.comms, box = opts.container, sheet, body, openId = null, lastBtn = null;
  box.innerHTML = comms.map(function (c) {
    return '<button class="mbtn rv" type="button" data-id="' + esc(c.id) + '" aria-label="' + esc(D.L('Entra nella commissione ', 'Entrer dans la commission ') + D.L(c.name_it, c.name_fr)) + '">' + D.medal(c.icon) +
      '<span class="name">' + D.t(c.name_it, c.name_fr) + '</span><span class="go">' + D.t('Entra', 'Entrer') + '</span></button>';
  }).join('');
  var btns = [].slice.call(box.children);
  btns.forEach(function (b) {
    var m = b.querySelector('.medal');
    b.addEventListener('pointermove', function (e) { if (reduce || e.pointerType !== 'mouse') return; var r = m.getBoundingClientRect(); m.style.setProperty('--ry', ((e.clientX - r.left) / r.width - .5) * 24 + 'deg'); m.style.setProperty('--rx', -((e.clientY - r.top) / r.height - .5) * 24 + 'deg'); });
    b.addEventListener('pointerleave', function () { m.style.setProperty('--rx', '0deg'); m.style.setProperty('--ry', '0deg'); });
    b.addEventListener('click', function () { location.hash = b.dataset.id; });
  });
  sheet = document.createElement('div');
  sheet.className = 'sheet'; sheet.hidden = true; sheet.setAttribute('role', 'dialog'); sheet.setAttribute('aria-modal', 'true'); sheet.setAttribute('aria-labelledby', 'sheetTitle');
  sheet.innerHTML = '<div class="sheet-top"><button type="button" class="s-back">' + SVG.arrowL + D.t('Tutte le commissioni', 'Toutes les commissions') + '</button><button type="button" class="s-x" aria-label="' + D.L('Chiudi', 'Fermer') + '">' + SVG.close + '</button></div><div class="s-in"></div>';
  document.body.appendChild(sheet); body = sheet.querySelector('.s-in');
  function back() { history.length > 1 && opts.backHash ? (location.hash = opts.backHash) : (location.hash = opts.backHash || ''); }
  sheet.querySelector('.s-back').onclick = back; sheet.querySelector('.s-x').onclick = back;
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && openId) back(); });
  function fill(c) {
    var i = comms.indexOf(c), prev = comms[(i + comms.length - 1) % comms.length], next = comms[(i + 1) % comms.length];
    var head = c.cover_url ?
      '<div class="sheet-hero"><div class="sheet-photo"><img src="' + esc(c.cover_url) + '" alt=""></div><div class="sheet-badge" id="sheetMedalBox">' + D.medal(c.icon, 'spin ghost') + '</div></div><div class="sheet-body">' :
      '<div class="sheet-body nophoto"><div class="nophoto-medal" id="sheetMedalBox">' + D.medal(c.icon, 'spin ghost') + '</div>';
    body.innerHTML = head + '<span class="eyebrow">' + D.t('Commissione', 'Commission') + '</span><h2 id="sheetTitle">' + D.t(c.name_it, c.name_fr) + '</h2>' +
      (c.lead_it || c.lead_fr ? '<div class="lead">' + D.paras(c.lead_it, c.lead_fr) + '</div>' : '') +
      (c.story_it || c.story_fr ? '<div class="card"><h3>' + D.t(c.story_title_it || 'La storia', c.story_title_fr || "L'histoire") + '</h3>' + D.paras(c.story_it, c.story_fr) +
        (c.id === 'caffe' && opts.onTour ? '<button type="button" class="btn" data-tour="caffe" style="justify-self:start;margin-top:.4rem">' + D.t('Vedi dove si trova nel giro della casa', 'Voir où elle se trouve dans la visite') + '</button>' : '') + '</div>' : '') +
      '<div class="card"><h3>' + D.t('Galleria', 'Galerie') + '</h3><div class="s-gal"><div class="skel" style="height:160px"></div></div></div>' +
      '<div class="pager"><button type="button" data-go="' + esc(prev.id) + '"><small>' + D.t('Precedente', 'Précédente') + '</small><b>' + D.t(prev.name_it, prev.name_fr) + '</b></button><button type="button" data-go="' + esc(next.id) + '"><small>' + D.t('Successiva', 'Suivante') + '</small><b>' + D.t(next.name_it, next.name_fr) + '</b></button></div></div>';
    var gal = body.querySelector('.s-gal');
    D.albums().then(function (albums) {
      var a = albums.filter(function (x) { return x.kind === 'commissione' && x.commission_id === c.id; })[0];
      if (!a) { gal.innerHTML = '<div class="empty">' + D.t('Le foto arriveranno presto.', 'Les photos arrivent bientôt.') + '</div>'; return; }
      D.media(a.id).then(function (items) { if (openId === c.id) D.photoGrid(gal, items); });
    });
  }
  body.addEventListener('click', function (e) {
    var g = e.target.closest('[data-go]'); if (g) { location.hash = g.dataset.go; return; }
    var t = e.target.closest('[data-tour]'); if (t && opts.onTour) { opts.onTour(t.dataset.tour); }
  });
  function open(id) {
    var c = comms.filter(function (x) { return x.id === id; })[0]; if (!c) return;
    var already = openId !== null; openId = id; fill(c);
    var btn = btns.filter(function (b) { return b.dataset.id === id; })[0]; lastBtn = btn;
    sheet.hidden = false; document.documentElement.style.overflow = 'hidden'; sheet.scrollTop = 0;
    var target = body.querySelector('#sheetMedalBox .medal');
    function reveal() { target.classList.remove('ghost'); }
    if (already || reduce || !sheet.animate || !btn) { reveal(); if (sheet.animate && !reduce) body.animate([{opacity: 0, transform: 'translateY(16px)'}, {opacity: 1, transform: 'none'}], {duration: 400, easing: 'ease-out'}); sheet.querySelector('.s-x').focus(); return; }
    var src = btn.querySelector('.medal'), sr = src.getBoundingClientRect(), tr = target.getBoundingClientRect();
    if (!(sr.bottom > 0 && sr.top < innerHeight)) sr = {left: innerWidth / 2 - 60, top: innerHeight / 2 - 60, width: 120, height: 120};
    var cx = sr.left + sr.width / 2, cy = sr.top + sr.height / 2, R = Math.hypot(Math.max(cx, innerWidth - cx), Math.max(cy, innerHeight - cy));
    sheet.animate([{clipPath: 'circle(0px at ' + cx + 'px ' + cy + 'px)'}, {clipPath: 'circle(' + R + 'px at ' + cx + 'px ' + cy + 'px)'}], {duration: 850, delay: 180, easing: 'cubic-bezier(.7,0,.2,1)', fill: 'backwards'});
    body.animate([{opacity: 0, transform: 'translateY(24px)'}, {opacity: 1, transform: 'none'}], {duration: 550, delay: 880, easing: 'ease-out', fill: 'backwards'});
    var fly = document.createElement('div'); fly.className = 'flyer'; fly.innerHTML = D.medal(c.icon);
    fly.style.cssText = 'left:' + sr.left + 'px;top:' + sr.top + 'px;width:' + sr.width + 'px;height:' + sr.height + 'px;perspective:900px';
    fly.firstChild.style.width = '100%'; document.body.appendChild(fly);
    var dx = tr.left + tr.width / 2 - cx, dy = tr.top + tr.height / 2 - cy, sc = tr.width / sr.width;
    var a = fly.firstChild.animate([{transform: 'translate(0,0) scale(1) rotateY(0deg)'}, {transform: 'translate(' + dx * .35 + 'px,' + dy * .35 + 'px) scale(' + (sc * 1.3) + ') rotateY(200deg)', offset: .55}, {transform: 'translate(' + dx + 'px,' + dy + 'px) scale(' + sc + ') rotateY(360deg)'}], {duration: 1100, easing: 'cubic-bezier(.55,0,.25,1)', fill: 'forwards'});
    src.style.opacity = 0;
    a.onfinish = function () { reveal(); fly.remove(); src.style.opacity = ''; sheet.querySelector('.s-x').focus(); };
  }
  function close() {
    if (openId === null) return; openId = null;
    var btn = lastBtn, done = function () { sheet.hidden = true; document.documentElement.style.overflow = ''; if (btn) btn.focus({preventScroll: true}); };
    if (reduce || !sheet.animate || !btn) { done(); return; }
    var r = btn.querySelector('.medal').getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    if (r.bottom < 0 || r.top > innerHeight) { cx = innerWidth / 2; cy = innerHeight / 2; }
    var R = Math.hypot(Math.max(cx, innerWidth - cx), Math.max(cy, innerHeight - cy));
    sheet.animate([{clipPath: 'circle(' + R + 'px at ' + cx + 'px ' + cy + 'px)'}, {clipPath: 'circle(0px at ' + cx + 'px ' + cy + 'px)'}], {duration: 600, easing: 'cubic-bezier(.7,0,.3,1)'}).onfinish = done;
  }
  function route() { var h = decodeURIComponent(location.hash.slice(1)); if (comms.some(function (c) { return c.id === h; })) open(h); else close(); }
  addEventListener('hashchange', route); route();
  document.addEventListener('dtf:lang', function () { if (openId) fill(comms.filter(function (x) { return x.id === openId; })[0]); var t = body.querySelector('#sheetMedalBox .medal'); if (t) t.classList.remove('ghost'); });
};

/* ---------- Comparsa allo scroll ---------- */
D.reveal = function () {
  if (reduce || !('IntersectionObserver' in window)) return;
  document.documentElement.classList.add('js');
  var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, {rootMargin: '0px 0px -8% 0px'});
  [].forEach.call(document.querySelectorAll('.rv:not(.in)'), function (n) { if (n.getBoundingClientRect().top < innerHeight * .92) n.classList.add('in'); else io.observe(n); });
  setTimeout(function () { [].forEach.call(document.querySelectorAll('.rv'), function (n) { n.classList.add('in'); }); }, 3500);
};

D.toast = function (msg) {
  var t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); t.innerHTML = msg;
  document.body.appendChild(t); setTimeout(function () { t.remove(); }, 2600);
};
D.copy = function (text, okMsg) {
  function fallback() { var r = document.createRange(), el = document.createElement('textarea'); el.value = text; document.body.appendChild(el); el.select(); try { document.execCommand('copy'); } catch (e) {} el.remove(); D.toast(okMsg); }
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(function () { D.toast(okMsg); }, fallback); else fallback();
};

/* ---------- Avvio ---------- */
D.ready = Promise.all([D.commissions(), D.settings()]).then(function (r) {
  D.comms = r[0]; D.cfg = r[1];
  renderNav(D.comms); renderFoot(D.comms, D.cfg.links); D.setLang(D.lang);
  return {comms: D.comms, cfg: D.cfg};
});
D.setLang(D.lang);
})();
