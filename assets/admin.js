/* =====================================================================
   Dahira Touba Fano — pannello admin
   Eventi, foto e album, commissioni, citazioni, orari e Diayanté.
   Le foto vengono rimpicciolite e compresse prima di caricarle.
   ===================================================================== */
(function () {
'use strict';
var D = window.DTF, sb = D.sb, esc = D.esc;
var BUCKET = 'gallery';
function $(id) { return document.getElementById(id); }
function qs(sel, el) { return (el || document).querySelector(sel); }
function qsa(sel, el) { return [].slice.call((el || document).querySelectorAll(sel)); }
function val(id) { var e = $(id); return e ? e.value.trim() : ''; }
function msg(el, text, kind) { el.innerHTML = text ? '<div class="msg ' + (kind || '') + '">' + text + '</div>' : ''; if (text && kind === 'ok') setTimeout(function () { if (el.firstChild && el.firstChild.textContent === tmp(text)) el.innerHTML = ''; }, 5000); }
function tmp(h) { var d = document.createElement('div'); d.innerHTML = h; return d.textContent; }
function fail(el, e) { console.error(e); msg(el, 'Non è andato a buon fine: ' + esc((e && (e.message || e.error_description)) || e) + '. Riprova; se continua, ricarica la pagina.', 'err'); }
function fmtDate(d) { return d ? new Date(d + 'T12:00:00').toLocaleDateString('it-IT', {day: 'numeric', month: 'long', year: 'numeric'}) : ''; }
// pulsante elimina in due tocchi
function twoStep(btn, fn) {
  var armed = false, label = btn.textContent, timer;
  btn.addEventListener('click', function () {
    if (!armed) { armed = true; btn.classList.add('sure'); btn.textContent = 'Sicura? Tocca di nuovo'; timer = setTimeout(function () { armed = false; btn.classList.remove('sure'); btn.textContent = label; }, 4000); return; }
    clearTimeout(timer); armed = false; btn.classList.remove('sure'); btn.textContent = label; fn();
  });
}

if (!sb) { document.body.innerHTML = '<div class="login"><div class="box"><h1>Errore</h1><p>Non riesco a caricare la libreria di Supabase. Controlla la connessione e ricarica.</p></div></div>'; return; }

/* ---------------- Foto: rimpicciolire e comprimere ---------------- */
function loadImage(file) {
  if (window.createImageBitmap) return createImageBitmap(file, {imageOrientation: 'from-image'}).catch(function () { return viaImg(file); });
  return viaImg(file);
}
function viaImg(file) {
  return new Promise(function (ok, ko) { var u = URL.createObjectURL(file), im = new Image(); im.onload = function () { ok(im); }; im.onerror = function () { ko(new Error('formato non leggibile (prova con una foto JPG o PNG)')); }; im.src = u; });
}
function compress(file, max) {
  max = max || 1600;
  return loadImage(file).then(function (img) {
    var w = img.width, h = img.height, s = Math.min(1, max / Math.max(w, h));
    var c = document.createElement('canvas'); c.width = Math.round(w * s); c.height = Math.round(h * s);
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
    return new Promise(function (ok) { c.toBlob(function (b) { ok(b); }, 'image/webp', 0.82); }).then(function (b) {
      if (b && b.type === 'image/webp') return b;
      return new Promise(function (ok) { c.toBlob(function (b2) { ok(b2); }, 'image/jpeg', 0.85); });
    });
  });
}
function upload(blob, folder) {
  var ext = blob.type === 'image/webp' ? 'webp' : 'jpg';
  var path = folder + '/' + Date.now() + '_' + Math.random().toString(36).slice(2, 8) + '.' + ext;
  return sb.storage.from(BUCKET).upload(path, blob, {contentType: blob.type, cacheControl: '31536000'}).then(function (r) {
    if (r.error) throw r.error;
    return {path: path, url: sb.storage.from(BUCKET).getPublicUrl(path).data.publicUrl};
  });
}
function removeFiles(paths) { paths = paths.filter(Boolean); return paths.length ? sb.storage.from(BUCKET).remove(paths) : Promise.resolve(); }

/* ---------------- Dati ---------------- */
var S = {events: [], albums: [], comms: [], quotes: [], settings: {}, current: null};
function loadAll() {
  return Promise.all([
    sb.from('events').select('*').order('event_date', {ascending: false}),
    sb.from('albums').select('*, media(count)').order('sort'),
    sb.from('commissions').select('*').order('sort'),
    sb.from('quotes').select('*').order('order_index'),
    sb.from('settings').select('key,value')
  ]).then(function (r) {
    r.forEach(function (x) { if (x.error) throw x.error; });
    S.events = r[0].data; S.albums = r[1].data; S.comms = r[2].data; S.quotes = r[3].data;
    S.settings = {}; r[4].data.forEach(function (x) { S.settings[x.key] = x.value; });
  });
}
function albumName(a) {
  if (a.kind === 'evento') { var e = S.events.filter(function (x) { return x.id === a.event_id; })[0]; return e ? e.title_it + ' · ' + fmtDate(e.event_date) : 'Evento'; }
  if (a.kind === 'commissione') { var c = S.comms.filter(function (x) { return x.id === a.commission_id; })[0]; return 'Commissione ' + (c ? c.name_it : a.commission_id); }
  return a.title_it || 'Album';
}
function count(a) { return (a.media && a.media[0] && a.media[0].count) || 0; }

/* ---------------- Accesso ---------------- */
function showLogin(text) { $('appView').hidden = true; $('loginView').hidden = false; if (text) msg($('lMsg'), text, 'err'); }
function start() {
  sb.auth.getSession().then(function (r) {
    if (!r.data.session) return showLogin();
    sb.rpc('is_admin').then(function (a) {
      if (!a.data) { sb.auth.signOut(); return showLogin('Questo account non ha i permessi di admin.'); }
      $('loginView').hidden = true; $('appView').hidden = false;
      loadAll().then(function () { renderAll(); openTab(location.hash.slice(1) || 'eventi'); }).catch(function (e) { fail(qs('[data-panel="eventi"]'), e); });
    });
  });
}
$('loginForm').addEventListener('submit', function (e) {
  e.preventDefault(); msg($('lMsg'), 'Accesso in corso…');
  sb.auth.signInWithPassword({email: val('lEmail'), password: $('lPass').value}).then(function (r) {
    if (r.error) return msg($('lMsg'), 'Email o password non corrette.', 'err');
    msg($('lMsg'), ''); start();
  });
});
$('logout').onclick = function () { sb.auth.signOut().then(function () { showLogin(); }); };

/* ---------------- Schede ---------------- */
function openTab(name) {
  if (!qs('[data-panel="' + name + '"]')) name = 'eventi';
  qsa('.tabs button').forEach(function (b) { b.setAttribute('aria-selected', b.dataset.tab === name); });
  qsa('[data-panel]').forEach(function (p) { p.hidden = p.dataset.panel !== name; });
  history.replaceState(null, '', '#' + name); scrollTo(0, 0);
}
qs('.tabs').addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) openTab(b.dataset.tab); });
function renderAll() { renderEvents(); renderPhotos(); renderComms(); renderQuotes(); renderSettings(); }

/* ================= EVENTI ================= */
var evEdit = null, evCover = {file: null, remove: false};
function renderEvents() {
  var p = qs('[data-panel="eventi"]'), today = D.today();
  var fut = S.events.filter(function (e) { return e.event_date >= today; }).sort(function (a, b) { return a.event_date < b.event_date ? -1 : 1; });
  var past = S.events.filter(function (e) { return e.event_date < today; });
  var e = evEdit || {};
  p.innerHTML =
    '<div class="box" id="evFormBox"><h2>' + (evEdit ? 'Modifica evento' : 'Nuovo evento') + '</h2>' +
    '<p class="hint">Quando salvi un evento nuovo, nasce da solo il suo album: dopo l\'evento ci aggiungi le foto.</p>' +
    '<div class="row"><label class="f">Titolo (italiano) *<input id="evTi" value="' + esc(e.title_it) + '" required></label><label class="f">Titolo (francese)<input id="evTf" value="' + esc(e.title_fr) + '"></label></div>' +
    '<div class="row"><label class="f">Data *<input id="evDate" type="date" value="' + esc(e.event_date) + '" required></label><label class="f">Luogo<input id="evLoc" value="' + esc(e.location || 'Keur Serigne Touba Fano, Monterado (AN)') + '"></label></div>' +
    '<div class="row"><label class="f">Descrizione (italiano)<small>Orari, ospiti, programma…</small><textarea id="evDi">' + esc(e.desc_it) + '</textarea></label><label class="f">Descrizione (francese)<small>Se la lasci vuota si vede quella italiana.</small><textarea id="evDf">' + esc(e.desc_fr) + '</textarea></label></div>' +
    '<label class="f">Locandina o foto di copertina<small>Si vede nella lista degli eventi e in alto nella pagina dell\'evento.</small><input id="evCover" type="file" accept="image/*"></label>' +
    '<div class="cover-prev" id="evCoverPrev">' + (e.cover_url ? '<img src="' + esc(e.cover_url) + '" alt=""><label class="check"><input type="checkbox" id="evCoverDel"> Togli la copertina</label>' : '') + '</div>' +
    '<div class="row"><label class="f">Video YouTube<small>Incolla il link del video (facoltativo).</small><input id="evYt" type="url" inputmode="url" value="' + esc(e.youtube_url) + '" placeholder="https://youtu.be/…"></label><label class="f">Link Telegram<small>Facoltativo.</small><input id="evTg" type="url" inputmode="url" value="' + esc(e.telegram_url) + '" placeholder="https://t.me/…"></label></div>' +
    '<div class="bar"><button class="b gold" id="evSave" type="button">' + (evEdit ? 'Salva le modifiche' : 'Crea l\'evento') + '</button>' + (evEdit ? '<button class="b line" id="evCancel" type="button">Annulla</button>' : '') + '</div><div id="evMsg"></div></div>' +
    '<div class="box"><h2>Prossimi eventi</h2><div class="list">' + (fut.length ? fut.map(evItem).join('') : '<p class="hint">Nessun evento in programma.</p>') + '</div></div>' +
    '<div class="box"><h2>Eventi passati</h2><div class="list">' + (past.length ? past.map(evItem).join('') : '<p class="hint">Nessuno.</p>') + '</div></div>';
  $('evCover').onchange = function () { var f = this.files[0]; evCover.file = f || null; if (f) $('evCoverPrev').innerHTML = '<img src="' + URL.createObjectURL(f) + '" alt=""><span class="hint">Nuova copertina (verrà compressa)</span>'; };
  $('evSave').onclick = saveEvent;
  if ($('evCancel')) $('evCancel').onclick = function () { evEdit = null; evCover = {file: null}; renderEvents(); };
  qsa('[data-ev-edit]', p).forEach(function (b) { b.onclick = function () { evEdit = S.events.filter(function (x) { return x.id === b.dataset.evEdit; })[0]; evCover = {file: null}; renderEvents(); $('evFormBox').scrollIntoView({behavior: 'smooth'}); }; });
  qsa('[data-ev-photos]', p).forEach(function (b) { b.onclick = function () { var a = S.albums.filter(function (x) { return x.event_id === b.dataset.evPhotos; })[0]; if (a) { S.current = a.id; renderPhotos(); openTab('foto'); } }; });
  qsa('[data-ev-del]', p).forEach(function (b) { twoStep(b, function () { deleteEvent(b.dataset.evDel); }); });
}
function evItem(e) {
  var a = S.albums.filter(function (x) { return x.event_id === e.id; })[0], n = a ? count(a) : 0;
  return '<div class="item">' + (e.cover_url ? '<img src="' + esc(e.cover_url) + '" alt="">' : '<span class="ph">' + new Date(e.event_date + 'T12:00:00').getDate() + '</span>') +
    '<div><b>' + esc(e.title_it) + '</b><small>' + fmtDate(e.event_date) + ' · ' + n + ' foto/video</small></div>' +
    '<div class="bar" style="justify-content:flex-end"><button class="b sm line" data-ev-edit="' + e.id + '">Modifica</button><button class="b sm" data-ev-photos="' + e.id + '">Foto</button><button class="b sm red" data-ev-del="' + e.id + '">Elimina</button></div></div>';
}
function saveEvent() {
  var box = $('evMsg'), btn = $('evSave');
  var row = {title_it: val('evTi'), title_fr: val('evTf') || null, event_date: val('evDate'), location: val('evLoc') || null, desc_it: val('evDi') || null, desc_fr: val('evDf') || null, youtube_url: val('evYt') || null, telegram_url: val('evTg') || null};
  if (!row.title_it || !row.event_date) return msg(box, 'Scrivi almeno il titolo e la data.', 'err');
  btn.disabled = true; msg(box, 'Salvataggio…');
  var old = evEdit, oldPath = old && old.cover_path, p = Promise.resolve();
  if (evCover.file) p = compress(evCover.file, 1600).then(function (b) { return upload(b, 'eventi'); }).then(function (u) { row.cover_url = u.url; row.cover_path = u.path; });
  else if ($('evCoverDel') && $('evCoverDel').checked) { row.cover_url = null; row.cover_path = null; }
  p.then(function () {
    return old ? sb.from('events').update(row).eq('id', old.id).select().single() : sb.from('events').insert(row).select().single();
  }).then(function (r) {
    if (r.error) throw r.error;
    if (oldPath && 'cover_url' in row && row.cover_path !== oldPath) removeFiles([oldPath]);
    var a = S.albums.filter(function (x) { return x.event_id === r.data.id; })[0];
    if ('cover_url' in row && a) return sb.from('albums').update({cover_url: row.cover_url}).eq('id', a.id).then(function () { return r; });
    return r;
  }).then(function (r) {
    var id = r.data.id; evEdit = null; evCover = {file: null};
    return loadAll().then(function () {
      renderEvents(); renderPhotos();
      msg($('evMsg'), 'Evento salvato. <button class="b sm" id="evGoPhotos" type="button">Aggiungi le foto di questo evento</button>', 'ok');
      $('evGoPhotos').onclick = function () { var a = S.albums.filter(function (x) { return x.event_id === id; })[0]; if (a) { S.current = a.id; renderPhotos(); openTab('foto'); } };
    });
  }).catch(function (e) { btn.disabled = false; fail(box, e); });
}
function deleteEvent(id) {
  var e = S.events.filter(function (x) { return x.id === id; })[0], a = S.albums.filter(function (x) { return x.event_id === id; })[0];
  var p = a ? sb.from('media').select('storage_path').eq('album_id', a.id) : Promise.resolve({data: []});
  p.then(function (r) {
    var paths = (r.data || []).map(function (m) { return m.storage_path; }).concat([e && e.cover_path]);
    return sb.from('events').delete().eq('id', id).then(function (d) { if (d.error) throw d.error; return removeFiles(paths); });
  }).then(loadAll).then(function () { renderEvents(); renderPhotos(); }).catch(function (err) { fail($('evMsg'), err); });
}

/* ================= FOTO E ALBUM ================= */
var mediaList = [];
function renderPhotos() {
  var p = qs('[data-panel="foto"]');
  if (!S.current || !S.albums.some(function (a) { return a.id === S.current; })) { var arch = S.albums.filter(function (a) { return a.kind === 'archivio'; })[0]; S.current = arch ? arch.id : (S.albums[0] && S.albums[0].id); }
  function opts(kind) {
    var list = S.albums.filter(function (a) { return a.kind === kind; });
    if (kind === 'evento') list.sort(function (a, b) { var ea = S.events.filter(function (x) { return x.id === a.event_id; })[0] || {}, eb = S.events.filter(function (x) { return x.id === b.event_id; })[0] || {}; return (ea.event_date || '') < (eb.event_date || '') ? 1 : -1; });
    return list.map(function (a) { return '<option value="' + a.id + '"' + (a.id === S.current ? ' selected' : '') + '>' + esc(albumName(a)) + ' (' + count(a) + ')' + (a.hidden ? ' · nascosto' : '') + '</option>'; }).join('');
  }
  var a = S.albums.filter(function (x) { return x.id === S.current; })[0] || {};
  p.innerHTML =
    '<div class="box"><h2>Scegli l\'album</h2><label class="f">Album<select id="albSel"><optgroup label="Eventi">' + opts('evento') + '</optgroup><optgroup label="Commissioni">' + opts('commissione') + '</optgroup><optgroup label="Altri album">' + opts('archivio') + '</optgroup></select></label>' +
    '<div class="bar"><button class="b sm line" id="albNew" type="button">+ Nuovo album libero</button><a class="b sm line" id="albView" target="_blank" rel="noopener" href="galleria.html?album=' + a.id + '">Vedi sul sito ↗</a></div>' +
    '<div id="albNewBox" hidden class="row"><label class="f">Nome del nuovo album<input id="albNewName" placeholder="es. Decorazioni Magal 2026"></label><div class="bar" style="align-self:end"><button class="b" id="albNewSave" type="button">Crea</button></div></div>' +
    (a.kind === 'archivio' ? '<details class="sec"><summary>Impostazioni di questo album</summary><div><div class="row"><label class="f">Nome (italiano)<input id="albTi" value="' + esc(a.title_it) + '"></label><label class="f">Nome (francese)<input id="albTf" value="' + esc(a.title_fr) + '"></label></div><div class="bar"><button class="b sm" id="albSaveName" type="button">Salva il nome</button>' + (a.title_it !== 'Archivio' ? '<button class="b sm red" id="albDel" type="button">Elimina l\'album e le sue foto</button>' : '') + '</div></div></details>' : '') +
    '<label class="check"><input type="checkbox" id="albHidden"' + (a.hidden ? ' checked' : '') + '> Album nascosto (non si vede sul sito finché non togli la spunta)</label><div id="albMsg"></div></div>' +
    '<div class="box"><h2>Aggiungi foto</h2><p class="hint">Puoi sceglierne tante insieme. Le rimpicciolisco e comprimo da sola prima di caricarle, così occupano poco spazio.</p>' +
    '<label class="drop" id="drop"><b>Tocca qui per scegliere le foto</b><span class="hint">oppure trascinale qui dal computer</span><input id="files" type="file" accept="image/*" multiple hidden></label>' +
    '<div class="row"><label class="f">Didascalia per queste foto (facoltativa)<input id="upCap" placeholder="es. Magal Touba Fano 2026"></label><label class="check" style="align-self:end"><input type="checkbox" id="upCar"> Mostra anche in homepage</label></div><div id="upProg" class="prog"></div></div>' +
    '<div class="box"><h2>Aggiungi un video YouTube</h2><div class="row"><label class="f">Link del video<input id="ytUrl" type="url" inputmode="url" placeholder="https://youtu.be/…"></label><label class="f">Titolo (facoltativo)<input id="ytCap"></label></div><div class="bar"><button class="b" id="ytAdd" type="button">Aggiungi il video</button></div><div id="ytMsg"></div></div>' +
    '<div class="box"><h2>Foto e video nell\'album</h2><p class="hint">⭐ = copertina dell\'album. Le didascalie si salvano da sole quando esci dal campo.</p><div id="mGrid" class="grid"><p class="hint">Caricamento…</p></div></div>';
  $('albSel').onchange = function () { S.current = this.value; renderPhotos(); };
  $('albNew').onclick = function () { $('albNewBox').hidden = false; $('albNewName').focus(); };
  $('albNewSave').onclick = function () {
    var n = val('albNewName'); if (!n) return;
    sb.from('albums').insert({kind: 'archivio', title_it: n, title_fr: n, sort: 50}).select().single().then(function (r) { if (r.error) throw r.error; S.current = r.data.id; return loadAll(); }).then(renderPhotos).catch(function (e) { fail($('albMsg'), e); });
  };
  $('albHidden').onchange = function () { var h = this.checked; sb.from('albums').update({hidden: h}).eq('id', a.id).then(function (r) { if (r.error) return fail($('albMsg'), r.error); a.hidden = h; msg($('albMsg'), h ? 'Album nascosto.' : 'Album visibile sul sito.', 'ok'); }); };
  if ($('albSaveName')) $('albSaveName').onclick = function () { sb.from('albums').update({title_it: val('albTi'), title_fr: val('albTf') || val('albTi')}).eq('id', a.id).then(function (r) { if (r.error) return fail($('albMsg'), r.error); loadAll().then(renderPhotos); }); };
  if ($('albDel')) twoStep($('albDel'), function () {
    sb.from('media').select('storage_path').eq('album_id', a.id).then(function (r) {
      var paths = (r.data || []).map(function (m) { return m.storage_path; });
      return sb.from('albums').delete().eq('id', a.id).then(function (d) { if (d.error) throw d.error; return removeFiles(paths); });
    }).then(function () { S.current = null; return loadAll(); }).then(renderPhotos).catch(function (e) { fail($('albMsg'), e); });
  });
  var drop = $('drop'), input = $('files');
  input.onchange = function () { uploadMany([].slice.call(this.files)); this.value = ''; };
  ['dragenter', 'dragover'].forEach(function (t) { drop.addEventListener(t, function (e) { e.preventDefault(); drop.classList.add('over'); }); });
  ['dragleave', 'drop'].forEach(function (t) { drop.addEventListener(t, function (e) { e.preventDefault(); drop.classList.remove('over'); }); });
  drop.addEventListener('drop', function (e) { uploadMany([].slice.call(e.dataTransfer.files).filter(function (f) { return /^image\//.test(f.type); })); });
  $('ytAdd').onclick = function () {
    var u = val('ytUrl'); if (!D.ytId(u)) return msg($('ytMsg'), 'Questo link non sembra un video di YouTube.', 'err');
    sb.from('media').insert({album_id: a.id, kind: 'youtube', url: u, caption_it: val('ytCap') || null, caption_fr: val('ytCap') || null, sort: nextSort()}).then(function (r) {
      if (r.error) return fail($('ytMsg'), r.error); $('ytUrl').value = ''; $('ytCap').value = ''; msg($('ytMsg'), 'Video aggiunto.', 'ok'); refreshMedia();
    });
  };
  refreshMedia();
}
function nextSort() { return mediaList.length ? Math.max.apply(null, mediaList.map(function (m) { return m.sort || 0; })) + 10 : 10; }
function uploadMany(files) {
  if (!files.length) return;
  var box = $('upProg'), cap = val('upCap') || null, car = $('upCar').checked, album = S.current, done = 0, errs = 0, base = nextSort();
  box.innerHTML = '<div>Caricamento di ' + files.length + ' foto… non chiudere la pagina.</div><div class="pbar"><i id="upBar"></i></div><div id="upTxt" class="hint"></div>';
  var i = 0;
  function one() {
    if (i >= files.length) {
      box.innerHTML = '<div class="msg ' + (errs ? 'err' : 'ok') + '">' + (files.length - errs) + ' foto caricate' + (errs ? ', ' + errs + ' non riuscite (vedi sopra)' : '') + '.</div>';
      loadAll().then(function () { var s = $('albSel'); if (s) qsa('option', s).forEach(function (o) { var a = S.albums.filter(function (x) { return x.id === o.value; })[0]; if (a) o.textContent = albumName(a) + ' (' + count(a) + ')' + (a.hidden ? ' · nascosto' : ''); }); });
      refreshMedia(); return;
    }
    var f = files[i], k = i++;
    $('upTxt').textContent = 'Foto ' + (k + 1) + ' di ' + files.length + ': ' + f.name;
    compress(f, 1600).then(function (b) { return upload(b, album); }).then(function (u) {
      return sb.from('media').insert({album_id: album, kind: 'photo', url: u.url, storage_path: u.path, caption_it: cap, caption_fr: cap, in_carousel: car, sort: base + k * 10}).then(function (r) { if (r.error) throw r.error; });
    }).catch(function (e) { errs++; console.error(e); box.insertAdjacentHTML('afterbegin', '<div class="msg err">' + esc(f.name) + ': ' + esc(e.message || e) + '</div>'); })
      .then(function () { done++; var bar = $('upBar'); if (bar) bar.style.width = (done / files.length * 100) + '%'; one(); });
  }
  one();
}
function refreshMedia() {
  var g = $('mGrid'); if (!g) return;
  sb.from('media').select('*').eq('album_id', S.current).order('sort').order('created_at').then(function (r) {
    if (r.error) return fail(g, r.error);
    mediaList = r.data; var a = S.albums.filter(function (x) { return x.id === S.current; })[0] || {};
    var others = S.albums.filter(function (x) { return x.id !== S.current; });
    g.innerHTML = mediaList.length ? mediaList.map(function (m, k) {
      var th = m.kind === 'youtube' ? D.ytThumb(m.url) : m.url;
      return '<div class="card" data-id="' + m.id + '"><div class="th"><img src="' + esc(th) + '" alt="" loading="lazy">' + (m.kind === 'youtube' ? '<span class="yt">VIDEO</span>' : '') + (a.cover_url === m.url ? '<span class="cov">⭐ copertina</span>' : '') + '</div>' +
        '<div class="bd"><input data-f="caption_it" value="' + esc(m.caption_it) + '" placeholder="Didascalia (IT)"><input data-f="caption_fr" value="' + esc(m.caption_fr) + '" placeholder="Didascalia (FR)">' +
        '<label class="check" style="min-height:30px;font-size:.82rem"><input type="checkbox" data-car' + (m.in_carousel ? ' checked' : '') + '> In homepage</label>' +
        '<div class="bar"><button class="b sm line" data-up' + (k === 0 ? ' disabled' : '') + ' aria-label="Sposta prima">↑</button><button class="b sm line" data-down' + (k === mediaList.length - 1 ? ' disabled' : '') + ' aria-label="Sposta dopo">↓</button>' + (m.kind === 'photo' ? '<button class="b sm line" data-cover>⭐</button>' : '') + '<button class="b sm red" data-del>Elimina</button></div>' +
        '<select data-move><option value="">Sposta in un altro album…</option>' + others.map(function (o) { return '<option value="' + o.id + '">' + esc(albumName(o)) + '</option>'; }).join('') + '</select></div></div>';
    }).join('') : '<p class="hint">Questo album è ancora vuoto.</p>';
    qsa('.card', g).forEach(function (card) {
      var m = mediaList.filter(function (x) { return x.id === card.dataset.id; })[0];
      qsa('[data-f]', card).forEach(function (inp) { inp.onchange = function () { var o = {}; o[inp.dataset.f] = inp.value.trim() || null; sb.from('media').update(o).eq('id', m.id).then(function (r) { if (r.error) fail(g, r.error); else { inp.style.borderColor = '#2e7d43'; setTimeout(function () { inp.style.borderColor = ''; }, 1200); } }); }; });
      qs('[data-car]', card).onchange = function () { sb.from('media').update({in_carousel: this.checked}).eq('id', m.id); };
      var up = qs('[data-up]', card), dn = qs('[data-down]', card), cv = qs('[data-cover]', card);
      up.onclick = function () { move(m, -1); }; dn.onclick = function () { move(m, 1); };
      if (cv) cv.onclick = function () { setCover(a, m.url); };
      twoStep(qs('[data-del]', card), function () { sb.from('media').delete().eq('id', m.id).then(function (r) { if (r.error) return fail(g, r.error); removeFiles([m.storage_path]); if (a.cover_url === m.url) sb.from('albums').update({cover_url: null}).eq('id', a.id); loadAll().then(refreshMedia); }); });
      qs('[data-move]', card).onchange = function () { var to = this.value; if (!to) return; sb.from('media').update({album_id: to}).eq('id', m.id).then(function (r) { if (r.error) return fail(g, r.error); loadAll().then(refreshMedia); }); };
    });
  });
}
function move(m, dir) {
  var i = mediaList.indexOf(m), j = i + dir; if (j < 0 || j >= mediaList.length) return;
  var arr = mediaList.slice(); arr.splice(i, 1); arr.splice(j, 0, m);
  var ups = [];
  arr.forEach(function (x, k) { var s = (k + 1) * 10; if (x.sort !== s) { x.sort = s; ups.push(sb.from('media').update({sort: s}).eq('id', x.id)); } });
  Promise.all(ups).then(refreshMedia);
}
function setCover(a, url) {
  sb.from('albums').update({cover_url: url}).eq('id', a.id).then(function (r) {
    if (r.error) return fail($('albMsg'), r.error);
    a.cover_url = url; msg($('albMsg'), 'Copertina aggiornata.', 'ok'); refreshMedia();
  });
}

/* ================= COMMISSIONI ================= */
function renderComms() {
  var p = qs('[data-panel="commissioni"]');
  p.innerHTML = '<div class="box"><h2>Le commissioni</h2><p class="hint">Per ognuna puoi mettere una foto di copertina (si vede in grande quando si apre la pagina della commissione, accanto al simbolo che ruota) e cambiare i testi. Le foto della sua galleria le aggiungi da “Foto e album”.</p></div>' +
    S.comms.map(function (c) {
      return '<details class="sec" data-c="' + c.id + '"><summary>' + D.medal(c.icon) + esc(c.name_it) + '</summary><div>' +
        '<label class="f">Foto di copertina<small>Meglio una foto orizzontale.</small><input type="file" accept="image/*" data-cov></label>' +
        '<div class="cover-prev" data-cprev>' + (c.cover_url ? '<img src="' + esc(c.cover_url) + '" alt=""><label class="check"><input type="checkbox" data-covdel> Togli la foto</label>' : '<span class="hint">Nessuna foto: si vede solo il medaglione.</span>') + '</div>' +
        '<div class="row"><label class="f">Nome (italiano)<input data-k="name_it" value="' + esc(c.name_it) + '"></label><label class="f">Nome (francese)<input data-k="name_fr" value="' + esc(c.name_fr) + '"></label></div>' +
        '<div class="row"><label class="f">Cosa fa (italiano)<textarea data-k="lead_it">' + esc(c.lead_it) + '</textarea></label><label class="f">Cosa fa (francese)<textarea data-k="lead_fr">' + esc(c.lead_fr) + '</textarea></label></div>' +
        '<div class="row"><label class="f">Titolo del riquadro “storia” (IT)<small>Facoltativo.</small><input data-k="story_title_it" value="' + esc(c.story_title_it) + '"></label><label class="f">Titolo del riquadro “storia” (FR)<input data-k="story_title_fr" value="' + esc(c.story_title_fr) + '"></label></div>' +
        '<div class="row"><label class="f">Storia (italiano)<small>Lascia una riga vuota tra un paragrafo e l\'altro.</small><textarea data-k="story_it" style="min-height:160px">' + esc(c.story_it) + '</textarea></label><label class="f">Storia (francese)<textarea data-k="story_fr" style="min-height:160px">' + esc(c.story_fr) + '</textarea></label></div>' +
        '<div class="bar"><button class="b gold" data-save type="button">Salva ' + esc(c.name_it) + '</button><button class="b line" data-gal type="button">Foto della galleria</button></div><div data-msg></div></div></details>';
    }).join('');
  qsa('details.sec', p).forEach(function (d) {
    var c = S.comms.filter(function (x) { return x.id === d.dataset.c; })[0], file = null;
    qs('[data-cov]', d).onchange = function () { file = this.files[0] || null; if (file) qs('[data-cprev]', d).innerHTML = '<img src="' + URL.createObjectURL(file) + '" alt=""><span class="hint">Nuova foto (verrà compressa)</span>'; };
    qs('[data-gal]', d).onclick = function () { var a = S.albums.filter(function (x) { return x.commission_id === c.id; })[0]; if (a) { S.current = a.id; renderPhotos(); openTab('foto'); } };
    qs('[data-save]', d).onclick = function () {
      var btn = this, box = qs('[data-msg]', d), row = {updated_at: new Date().toISOString()};
      qsa('[data-k]', d).forEach(function (i) { row[i.dataset.k] = i.value.trim() || null; });
      if (!row.name_it) return msg(box, 'Il nome in italiano non può essere vuoto.', 'err');
      btn.disabled = true; msg(box, 'Salvataggio…');
      var old = c.cover_path, pr = Promise.resolve(), del = qs('[data-covdel]', d);
      if (file) pr = compress(file, 1800).then(function (b) { return upload(b, 'commissioni'); }).then(function (u) { row.cover_url = u.url; row.cover_path = u.path; });
      else if (del && del.checked) { row.cover_url = null; row.cover_path = null; }
      pr.then(function () { return sb.from('commissions').update(row).eq('id', c.id); }).then(function (r) {
        if (r.error) throw r.error;
        if (old && 'cover_path' in row && row.cover_path !== old) removeFiles([old]);
        return loadAll();
      }).then(function () { renderComms(); var nd = qs('details[data-c="' + c.id + '"]', p); nd.open = true; msg(qs('[data-msg]', nd), 'Salvato. Si vede subito sul sito.', 'ok'); })
        .catch(function (e) { btn.disabled = false; fail(box, e); });
    };
  });
}

/* ================= CITAZIONI e YOBALOU BISS BI ================= */
function nextFriday() { var d = new Date(); d.setHours(12); d.setDate(d.getDate() + ((5 - d.getDay() + 7) % 7)); return d.toISOString().slice(0, 10); }
function renderQuotes() {
  var p = qs('[data-panel="citazioni"]'), yob = Object.assign({}, S.settings.yobalou || {});
  function dateOf(id) { return Object.keys(yob).filter(function (d) { return yob[d] === id; }).sort().reverse(); }
  var cur = D.yobalou({yobalou: yob}, S.quotes)[0];
  var future = Object.keys(yob).filter(function (d) { return d > D.today(); }).sort();
  function form(q, i) {
    q = q || {}; var ds = q.id ? dateOf(q.id) : [];
    return '<div class="box" data-q="' + (q.id || 'new') + '"><h3>' + (q.id ? 'Citazione ' + (i + 1) : 'Nuova citazione') + (ds.length ? ' <span class="tag">Yobalou ' + ds.map(fmtDate).join(', ') + '</span>' : '') + '</h3>' +
      '<label class="f">Testo originale (wolof)<textarea data-k="text_wo" style="min-height:70px">' + esc(q.text_wo) + '</textarea></label>' +
      '<div class="row"><label class="f">Traduzione italiana<textarea data-k="text_it" style="min-height:70px">' + esc(q.text_it) + '</textarea></label><label class="f">Traduzione francese<textarea data-k="text_fr" style="min-height:70px">' + esc(q.text_fr) + '</textarea></label></div>' +
      '<div class="row"><label class="f">Autore<input data-k="author" value="' + esc(q.author || 'Mame Cheikh Ibrahima Fall') + '"></label><label class="f">Posizione<small>1 = la prima della pagina.</small><input data-k="order_index" type="number" inputmode="numeric" value="' + esc(q.order_index != null ? q.order_index : S.quotes.length + 1) + '"></label>' +
      '<label class="f">Yobalou Biss Bi del venerdì<small>Scegli il venerdì in cui deve uscire. Vuoto = citazione normale.</small><input data-yob type="date" value="' + esc(q.id ? (ds[0] || '') : nextFriday()) + '"></label></div>' +
      '<div class="bar"><button class="b gold" data-save type="button">' + (q.id ? 'Salva' : 'Aggiungi la citazione') + '</button>' + (q.id ? '<button class="b line sm" data-img="post" type="button">Immagine post 4:5</button><button class="b line sm" data-img="story" type="button">Immagine storia 9:16</button><button class="b red" data-del type="button">Elimina</button>' : '') + '</div><div data-msg></div></div>';
  }
  p.innerHTML =
    '<div class="box"><h2>Yobalou Biss Bi</h2>' + (cur ? '<p>Questa settimana (' + fmtDate(cur.date) + '): <strong>“' + esc(cur.q.text_wo || cur.q.text_it) + '”</strong></p>' : '<p class="hint">Nessun Yobalou Biss Bi ancora: aggiungi una citazione e scegli il venerdì. Finché non ce n\'è uno, in home esce una citazione a caso.</p>') +
    (future.length ? '<p class="hint">Già programmati: ' + future.map(fmtDate).join(' · ') + '</p>' : '') +
    '<p class="hint">Ogni Yobalou Biss Bi compare da solo il suo venerdì in home e in cima alla pagina Citazioni; quelli passati restano nell\'archivio. Con “Immagine post / storia” scarichi il post già pronto per Instagram, TikTok e WhatsApp (dal telefono si apre direttamente la condivisione).</p></div>' +
    form(null) + S.quotes.map(function (q, i) { return form(q, i); }).join('');
  function saveYob(id, date) {
    Object.keys(yob).forEach(function (d) { if (yob[d] === id && d !== date) delete yob[d]; });
    if (date) yob[date] = id;
    return sb.from('settings').upsert({key: 'yobalou', value: yob, updated_at: new Date().toISOString()}).then(function (r) { if (r.error) throw r.error; S.settings.yobalou = yob; });
  }
  qsa('[data-q]', p).forEach(function (b) {
    var id = b.dataset.q, box = qs('[data-msg]', b);
    qs('[data-save]', b).onclick = function () {
      var row = {}; qsa('[data-k]', b).forEach(function (i) { row[i.dataset.k] = i.value.trim() || null; });
      row.order_index = parseInt(row.order_index, 10) || 0;
      var date = qs('[data-yob]', b).value;
      if (!row.text_wo && !row.text_it) return msg(box, 'Scrivi almeno il testo in wolof o in italiano.', 'err');
      if (date && yob[date] && yob[date] !== id) { var other = S.quotes.filter(function (x) { return x.id === yob[date]; })[0]; if (other && !b.dataset.ok) { b.dataset.ok = 1; return msg(box, 'Per ' + fmtDate(date) + ' c\'è già un\'altra citazione. Tocca di nuovo “Salva” per sostituirla.', 'err'); } }
      if (date && new Date(date + 'T12:00:00').getDay() !== 5 && !b.dataset.okday) { b.dataset.okday = 1; return msg(box, 'Attenzione: ' + fmtDate(date) + ' non è un venerdì. Tocca di nuovo “Salva” se va bene lo stesso.', 'err'); }
      msg(box, 'Salvataggio…');
      (id === 'new' ? sb.from('quotes').insert(row).select().single() : sb.from('quotes').update(row).eq('id', id).select().single()).then(function (r) {
        if (r.error) throw r.error; return saveYob(r.data.id, date);
      }).then(loadAll).then(function () { renderQuotes(); msg(qs('[data-q="new"] [data-msg]', p), 'Citazione salvata.' + (date ? ' Yobalou Biss Bi di ' + fmtDate(date) + '.' : ''), 'ok'); })
        .catch(function (e) { fail(box, e); });
    };
    qsa('[data-img]', b).forEach(function (btn) { btn.onclick = function () {
      var q = S.quotes.filter(function (x) { return x.id === id; })[0]; btn.disabled = true; msg(box, 'Preparo l\'immagine…');
      D.shareQuoteImage(q, btn.dataset.img, dateOf(id)[0] || null).then(function () { btn.disabled = false; msg(box, ''); }, function (e) { btn.disabled = false; fail(box, e); });
    }; });
    var del = qs('[data-del]', b); if (del) twoStep(del, function () { sb.from('quotes').delete().eq('id', id).then(function (r) { if (r.error) return fail(box, r.error); return saveYob(id, null); }).then(loadAll).then(renderQuotes).catch(function (e) { fail(box, e); }); });
  });
}

/* ================= ORARI, DIAYANTÉ, LINK ================= */
function renderSettings() {
  var p = qs('[data-panel="impostazioni"]');
  var weekly = JSON.parse(JSON.stringify(S.settings.weekly || D.DEFAULTS.weekly));
  var dy = Object.assign({}, D.DEFAULTS.diayante, S.settings.diayante || {});
  var ln = Object.assign({}, D.DEFAULTS.links, S.settings.links || {});
  function dayForm(d, i) {
    return '<details class="sec" data-day="' + i + '"' + (i === 1 ? ' open' : '') + '><summary>' + esc(d.day_it || 'Giorno') + ' · ' + esc(d.title_it || '') + '</summary><div>' +
      '<div class="row"><label class="f">Giorno (IT)<input data-k="day_it" value="' + esc(d.day_it) + '"></label><label class="f">Giorno (FR)<input data-k="day_fr" value="' + esc(d.day_fr) + '"></label><label class="f">Orario d\'inizio<small>es. 15:00 — vuoto = “orario da confermare”</small><input data-k="time" value="' + esc(d.time) + '"></label></div>' +
      '<div class="row"><label class="f">Titolo (IT)<input data-k="title_it" value="' + esc(d.title_it) + '"></label><label class="f">Titolo (FR)<input data-k="title_fr" value="' + esc(d.title_fr) + '"></label></div>' +
      '<div class="row"><label class="f">Descrizione (IT)<textarea data-k="text_it" style="min-height:70px">' + esc(d.text_it) + '</textarea></label><label class="f">Descrizione (FR)<textarea data-k="text_fr" style="min-height:70px">' + esc(d.text_fr) + '</textarea></label></div>' +
      '<div class="f" style="display:grid;gap:.4rem"><span style="font-size:.82rem;font-weight:600;color:var(--green)">Programma (facoltativo)</span><div class="prog-rows">' + (d.program || []).map(progRow).join('') + '</div><div class="bar"><button class="b sm line" data-addp type="button">+ Aggiungi una riga</button><button class="b sm red" data-delday type="button">Togli questo giorno</button></div></div></div></details>';
  }
  function progRow(r) { return '<div class="pr"><input data-pt value="' + esc(r && r.t) + '" placeholder="15:00"><input data-pl value="' + esc(r && r.l) + '" placeholder="Al Quran Ak Durus"><button class="b sm red" data-delp type="button" aria-label="Togli la riga">✕</button></div>'; }
  function L(k, label, hint) { return '<label class="f">' + label + (hint ? '<small>' + hint + '</small>' : '') + '<input data-l="' + k + '" type="url" inputmode="url" value="' + esc(ln[k]) + '"></label>'; }
  p.innerHTML =
    '<div class="box"><h2>Appuntamenti fissi</h2><p class="hint">Si vedono nella home, in “Chi siamo” e in “Eventi”.</p><div id="days" style="display:grid;gap:.8rem">' + weekly.map(dayForm).join('') + '</div>' +
    '<div class="bar"><button class="b sm line" id="addDay" type="button">+ Aggiungi un giorno</button></div><div class="bar"><button class="b gold" id="saveWeek" type="button">Salva gli appuntamenti</button></div><div id="weekMsg"></div></div>' +
    '<div class="box"><h2>Diayanté (donazioni)</h2><p class="hint">Finché non spunti “Mostra sul sito” e non c\'è l\'IBAN, la sezione resta nascosta. La barra si aggiorna appena cambi la cifra raccolta.</p>' +
    '<label class="check"><input type="checkbox" id="dyVis"' + (dy.visible ? ' checked' : '') + '> Mostra la sezione Diayanté sul sito</label>' +
    '<div class="row"><label class="f">Intestatario del conto<input id="dyHolder" value="' + esc(dy.holder) + '"></label><label class="f">IBAN<input id="dyIban" value="' + esc(dy.iban) + '" autocapitalize="characters" spellcheck="false"></label></div>' +
    '<div class="row"><label class="f">Causale<input id="dyCaus" value="' + esc(dy.causale) + '"></label><label class="f">Obiettivo (€)<small>0 = niente barra</small><input id="dyGoal" type="number" inputmode="numeric" min="0" value="' + esc(dy.goal) + '"></label><label class="f">Raccolti finora (€)<input id="dyRaised" type="number" inputmode="numeric" min="0" value="' + esc(dy.raised) + '"></label></div>' +
    '<div class="row"><label class="f">Testo (IT)<textarea id="dyTi" style="min-height:70px">' + esc(dy.text_it) + '</textarea></label><label class="f">Testo (FR)<textarea id="dyTf" style="min-height:70px">' + esc(dy.text_fr) + '</textarea></label></div>' +
    '<div class="bar"><button class="b gold" id="saveDy" type="button">Salva Diayanté</button></div><div id="dyMsg"></div></div>' +
    '<div class="box"><h2>Link e social</h2><div class="row">' + L('telegram', 'Canale Telegram', 'Quando lo aprite, incolla qui il link.') + L('youtube', 'YouTube') + L('whatsapp', 'Canale WhatsApp') + L('maps', 'Google Maps') + L('instagram_dahira', 'Instagram Dahira') + L('instagram_daray', 'Instagram Daray') + L('tiktok_dahira', 'TikTok Dahira') + L('tiktok_kourel', 'TikTok Kourel') + L('qr', 'Pagina link e QR') + '</div>' +
    '<div class="bar"><button class="b gold" id="saveLinks" type="button">Salva i link</button></div><div id="lnMsg"></div></div>';
  var days = $('days');
  days.addEventListener('click', function (e) {
    var t = e.target;
    if (t.matches('[data-addp]')) t.closest('details').querySelector('.prog-rows').insertAdjacentHTML('beforeend', progRow());
    if (t.matches('[data-delp]')) t.closest('.pr').remove();
    if (t.matches('[data-delday]')) t.closest('details').remove();
  });
  $('addDay').onclick = function () { days.insertAdjacentHTML('beforeend', dayForm({day_it: 'Nuovo giorno', program: []}, 99)); days.lastElementChild.open = true; };
  function saveSetting(key, value, box) {
    return sb.from('settings').upsert({key: key, value: value, updated_at: new Date().toISOString()}).then(function (r) {
      if (r.error) return fail(box, r.error); S.settings[key] = value; msg(box, 'Salvato. Si vede subito sul sito.', 'ok');
    });
  }
  $('saveWeek').onclick = function () {
    var list = qsa('details[data-day]', days).map(function (d, i) {
      var o = {id: 'g' + i}; qsa('[data-k]', d).forEach(function (x) { o[x.dataset.k] = x.value.trim(); });
      o.program = qsa('.pr', d).map(function (r) { return {t: qs('[data-pt]', r).value.trim(), l: qs('[data-pl]', r).value.trim()}; }).filter(function (r) { return r.t || r.l; });
      return o;
    });
    saveSetting('weekly', list, $('weekMsg'));
  };
  $('saveDy').onclick = function () {
    var v = {visible: $('dyVis').checked, holder: val('dyHolder'), iban: val('dyIban').toUpperCase(), causale: val('dyCaus'), goal: +val('dyGoal') || 0, raised: +val('dyRaised') || 0, text_it: val('dyTi'), text_fr: val('dyTf')};
    if (v.visible && !v.iban) return msg($('dyMsg'), 'Per mostrare la sezione serve l\'IBAN.', 'err');
    saveSetting('diayante', v, $('dyMsg'));
  };
  $('saveLinks').onclick = function () { var v = {}; qsa('[data-l]', p).forEach(function (i) { v[i.dataset.l] = i.value.trim(); }); saveSetting('links', v, $('lnMsg')); };
}

start();
})();
