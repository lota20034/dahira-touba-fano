/* =====================================================================
   Yobalou Biss Bi — la citazione del venerdì
   - DTF.yobalou(cfg, quotes): elenco dei venerdì (dal più recente) con la loro citazione
   - DTF.quoteImage(q, formato, data): crea l'immagine per Instagram/TikTok/WhatsApp
     formato 'post' = 1080x1350 (4:5), 'story' = 1080x1920 (9:16)
   ===================================================================== */
(function () {
'use strict';
var D = window.DTF;
D.yobalou = function (cfg, quotes) {
  var map = (cfg && cfg.yobalou) || {}, today = D.today();
  return Object.keys(map).filter(function (d) { return d <= today; }).sort().reverse().map(function (d) {
    return {date: d, q: quotes.filter(function (x) { return x.id === map[d]; })[0]};
  }).filter(function (x) { return x.q; });
};
D.fridayLabel = function (iso) { return D.date(iso, {weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'}); };

function loadImg(src) { return new Promise(function (ok) { var i = new Image(); i.crossOrigin = 'anonymous'; i.onload = function () { ok(i); }; i.onerror = function () { ok(null); }; i.src = src; }); }
function wrap(ctx, text, maxW) {
  var words = String(text || '').split(/\s+/), lines = [], line = '';
  words.forEach(function (w) { var t = line ? line + ' ' + w : w; if (ctx.measureText(t).width > maxW && line) { lines.push(line); line = w; } else line = t; });
  if (line) lines.push(line); return lines;
}
// scrive un blocco di testo, rimpicciolendo il carattere finché entra nell'altezza disponibile
function fit(ctx, text, font, size, minSize, maxW, maxH, lh) {
  var s = size, lines;
  do { ctx.font = font.replace('{s}', s); lines = wrap(ctx, text, maxW); if (lines.length * s * lh <= maxH) break; s -= 2; } while (s > minSize);
  return {lines: lines, size: s, h: lines.length * s * lh};
}
D.THEMES = {
  verde: {bg: ['#24502c', '#0b2412'], star: 'rgba(201,168,76,.10)', frame: '#c9a84c', frame2: 'rgba(201,168,76,.45)', wo: '#ffffff', it: '#e2e8df', fr: '#c2ccbf', label: '#c9a84c', date: '#e8d5a3', sign: '#e8d5a3', sub: '#c2ccbf'},
  oro:   {bg: ['#f1e2b3', '#c9a84c'], star: 'rgba(14,42,20,.10)', frame: '#0e2a14', frame2: 'rgba(14,42,20,.35)', wo: '#0e2a14', it: '#1a3d21', fr: '#2c4a30', label: '#0e2a14', date: '#1a3d21', sign: '#0e2a14', sub: '#1a3d21'},
  crema: {bg: ['#fbf8f1', '#efe5cf'], star: 'rgba(201,168,76,.22)', frame: '#c9a84c', frame2: 'rgba(201,168,76,.5)', wo: '#0e2a14', it: '#3b4a3d', fr: '#5a685c', label: '#8a6d1f', date: '#5a685c', sign: '#0e2a14', sub: '#5a685c'}
};
// opts: {theme, wo, it, fr, label} — wo/it/fr sono i testi da mettere (vuoto = non si mette)
D.quoteImage = function (q, fmt, iso, opts) {
  opts = opts || {};
  var th = D.THEMES[opts.theme] || D.THEMES.verde;
  var txt = {wo: 'wo' in opts ? opts.wo : q.text_wo, it: 'it' in opts ? opts.it : q.text_it, fr: 'fr' in opts ? opts.fr : q.text_fr};
  var W = 1080, H = fmt === 'story' ? 1920 : 1350, c = document.createElement('canvas'); c.width = W; c.height = H;
  var x = c.getContext('2d'), pad = 100, cx = W / 2, st = fmt === 'story';
  var fonts = document.fonts ? Promise.all(['italic 400 60px "Playfair Display"', '700 60px "Playfair Display"', '400 30px Inter', 'italic 400 30px Inter', '600 26px Inter'].map(function (f) { return document.fonts.load(f).catch(function () {}); })) : Promise.resolve();
  return Promise.all([fonts, loadImg('/img/logo.webp')]).then(function (r) {
    var logo = r[1];
    var g = x.createRadialGradient(cx, H * 0.38, 80, cx, H * 0.45, H * 0.8); g.addColorStop(0, th.bg[0]); g.addColorStop(1, th.bg[1]);
    x.fillStyle = g; x.fillRect(0, 0, W, H);
    // stella a otto punte in filigrana
    x.save(); x.translate(cx, H / 2); x.strokeStyle = th.star; x.lineWidth = 2;
    [0, 45, 22.5, 67.5].forEach(function (a, k) { var s = k < 2 ? 760 : 560; x.save(); x.rotate(a * Math.PI / 180); x.strokeRect(-s / 2, -s / 2, s, s); x.restore(); });
    x.beginPath(); x.arc(0, 0, 500, 0, Math.PI * 2); x.stroke(); x.restore();
    x.strokeStyle = th.frame; x.lineWidth = 3; x.strokeRect(40, 40, W - 80, H - 80);
    x.strokeStyle = th.frame2; x.lineWidth = 1; x.strokeRect(54, 54, W - 108, H - 108);
    var y = st ? 210 : 130;
    if (logo) { x.save(); x.beginPath(); x.arc(cx, y + 60, 60, 0, Math.PI * 2); x.clip(); x.drawImage(logo, cx - 60, y, 120, 120); x.restore(); x.strokeStyle = th.frame; x.lineWidth = 3; x.beginPath(); x.arc(cx, y + 60, 61, 0, Math.PI * 2); x.stroke(); }
    y += 170;
    x.textAlign = 'center'; x.textBaseline = 'alphabetic';
    var label = opts.label || (iso ? 'YOBALOU BISS BI' : 'KÀDDU');
    x.fillStyle = th.label; x.font = '600 26px Inter, sans-serif'; x.fillText(label.toUpperCase().split('').join(' '), cx, y);
    if (iso) { y += 44; x.fillStyle = th.date; x.font = '400 26px Inter, sans-serif'; x.fillText(new Date(iso + 'T12:00:00').toLocaleDateString('fr-FR', {weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'}), cx, y); }
    y += 40; x.fillStyle = th.frame; x.fillRect(cx - 40, y, 80, 3);
    var bottom = H - (st ? 320 : 200), avail = bottom - y - 60, maxW = W - pad * 2;
    var n = (txt.wo ? 1 : 0) + (txt.it ? 1 : 0) + (txt.fr ? 1 : 0);
    var wo = txt.wo ? fit(x, '“' + txt.wo + '”', 'italic 400 {s}px "Playfair Display", Georgia, serif', st ? 100 : 78, 32, maxW, avail * (n === 1 ? 0.9 : 0.55), 1.28) : null;
    var trMax = n === 1 ? (st ? 64 : 54) : (st ? 44 : 36), share = txt.wo ? 0.2 : (n === 1 ? 0.9 : 0.42);
    var it = txt.it ? fit(x, (txt.wo ? '' : '“') + txt.it + (txt.wo ? '' : '”'), (txt.wo ? '' : 'italic ') + '400 {s}px ' + (txt.wo ? 'Inter, sans-serif' : '"Playfair Display", Georgia, serif'), trMax, 22, maxW, avail * share, 1.38) : null;
    var fr = txt.fr ? fit(x, txt.fr, 'italic 400 {s}px Inter, sans-serif', txt.wo || txt.it ? trMax - 4 : trMax, 22, maxW, avail * share, 1.38) : null;
    var total = (wo ? wo.h : 0) + (it ? it.h : 0) + (fr ? fr.h : 0) + (n - 1) * 40;
    y += 60 + Math.max(0, (avail - total) / 2);
    function draw(b, font, color) { x.font = font.replace('{s}', b.size); x.fillStyle = color; var lh = b.h / b.lines.length; b.lines.forEach(function (l, k) { x.fillText(l, cx, y + b.size + k * lh); }); y += b.h + 40; }
    if (wo) draw(wo, 'italic 400 {s}px "Playfair Display", Georgia, serif', th.wo);
    if (it) draw(it, (txt.wo ? '' : 'italic ') + '400 {s}px ' + (txt.wo ? 'Inter, sans-serif' : '"Playfair Display", Georgia, serif'), txt.wo ? th.it : th.wo);
    if (fr) draw(fr, 'italic 400 {s}px Inter, sans-serif', th.fr);
    x.fillStyle = th.label; x.font = '600 26px Inter, sans-serif';
    if (q.author) x.fillText(q.author.toUpperCase().split('').join(' '), cx, bottom + 20);
    x.fillStyle = th.sign; x.font = '700 34px "Playfair Display", Georgia, serif';
    x.fillText('Dahira Touba Fano', cx, H - (st ? 200 : 118));
    x.fillStyle = th.sub; x.font = '400 22px Inter, sans-serif';
    x.fillText('Keur Serigne Touba Fano · Khadaikhoul Fadha-il', cx, H - (st ? 162 : 84));
    if (st) { x.font = '600 22px Inter, sans-serif'; x.fillStyle = th.label; x.fillText('dahira-khadaikhoul-fadaili.netlify.app', cx, H - 110); }
    return new Promise(function (ok) { c.toBlob(function (b) { ok(b); }, 'image/jpeg', 0.92); });
  });
};
// anteprima orizzontale 1200x630 per WhatsApp / Facebook / Telegram (quella che compare quando si incolla il link)
D.quoteOg = function (q, iso) {
  var W = 1200, H = 630, c = document.createElement('canvas'); c.width = W; c.height = H;
  var x = c.getContext('2d'), side = 360;
  var fonts = document.fonts ? Promise.all(['italic 400 60px "Playfair Display"', '700 60px "Playfair Display"', '400 30px Inter', '600 26px Inter'].map(function (f) { return document.fonts.load(f).catch(function () {}); })) : Promise.resolve();
  return Promise.all([fonts, loadImg('/img/logo.webp')]).then(function (r) {
    var logo = r[1];
    x.fillStyle = '#fbf8f1'; x.fillRect(0, 0, W, H);
    var g = x.createRadialGradient(side / 2, H / 2, 40, side / 2, H / 2, 420); g.addColorStop(0, '#24502c'); g.addColorStop(1, '#0b2412');
    x.fillStyle = g; x.fillRect(0, 0, side, H);
    x.save(); x.beginPath(); x.rect(0, 0, side, H); x.clip(); x.translate(side / 2, H / 2); x.strokeStyle = 'rgba(201,168,76,.14)'; x.lineWidth = 2;
    [0, 45].forEach(function (a) { x.save(); x.rotate(a * Math.PI / 180); x.strokeRect(-170, -170, 340, 340); x.restore(); }); x.restore();
    x.fillStyle = '#c9a84c'; x.fillRect(side, 0, 6, H);
    x.textAlign = 'center';
    if (logo) { x.save(); x.beginPath(); x.arc(side / 2, 210, 78, 0, Math.PI * 2); x.clip(); x.drawImage(logo, side / 2 - 78, 132, 156, 156); x.restore(); x.strokeStyle = '#c9a84c'; x.lineWidth = 3; x.beginPath(); x.arc(side / 2, 210, 79, 0, Math.PI * 2); x.stroke(); }
    x.fillStyle = '#c9a84c'; x.font = '600 22px Inter, sans-serif'; x.fillText((iso ? 'YOBALOU BISS BI' : 'KÀDDU').split('').join(' '), side / 2, 350);
    if (iso) { x.fillStyle = '#e8d5a3'; x.font = '400 20px Inter, sans-serif'; x.fillText(new Date(iso + 'T12:00:00').toLocaleDateString('fr-FR', {day: 'numeric', month: 'long', year: 'numeric'}), side / 2, 384); }
    x.fillStyle = '#fff'; x.font = '700 30px "Playfair Display", Georgia, serif'; x.fillText('Dahira', side / 2, 480); x.fillText('Touba Fano', side / 2, 518);
    var L = side + 70, maxW = W - L - 70, cx = L + maxW / 2;
    var main = q.text_wo || q.text_it, tr = q.text_wo ? q.text_it : q.text_fr;
    var a = fit(x, '“' + main + '”', 'italic 400 {s}px "Playfair Display", Georgia, serif', 52, 26, maxW, tr ? 330 : 440, 1.25);
    var b = tr ? fit(x, tr, '400 {s}px Inter, sans-serif', 28, 18, maxW, 140, 1.4) : null;
    var tot = a.h + (b ? b.h + 30 : 0) + (q.author ? 50 : 0), y = (H - tot) / 2;
    x.fillStyle = '#0e2a14'; x.font = 'italic 400 ' + a.size + 'px "Playfair Display", Georgia, serif';
    a.lines.forEach(function (l, k) { x.fillText(l, cx, y + a.size + k * a.h / a.lines.length); }); y += a.h + 30;
    if (b) { x.fillStyle = '#5a685c'; x.font = '400 ' + b.size + 'px Inter, sans-serif'; b.lines.forEach(function (l, k) { x.fillText(l, cx, y + b.size + k * b.h / b.lines.length); }); y += b.h + 20; }
    if (q.author) { x.fillStyle = '#8a6d1f'; x.font = '600 18px Inter, sans-serif'; x.fillText(q.author.toUpperCase().split('').join(' '), cx, y + 30); }
    return new Promise(function (ok) { c.toBlob(function (bl) { ok(bl); }, 'image/jpeg', 0.86); });
  });
};
// divide un testo in frasi (per scegliere quali parti mettere nell'immagine)
D.sentences = function (s) { return String(s || '').replace(/\s+/g, ' ').trim().match(/[^.!?;:…]+[.!?;:…]*["”»]?\s*/g) || []; };
// link breve della citazione (mostra l'anteprima su WhatsApp e apre la pagina per condividerla)
D.quoteLink = function (id) { return location.origin + '/q/' + id; };
// scarica o condividi l'immagine (sul telefono si apre la condivisione: Instagram, WhatsApp…)
D.shareQuoteImage = function (q, fmt, iso, opts) {
  return D.quoteImage(q, fmt, iso, opts).then(function (blob) {
    var name = 'yobalou-biss-bi' + (iso ? '-' + iso : '') + (fmt === 'story' ? '-storia' : '-post') + '.jpg';
    var file = window.File ? new File([blob], name, {type: 'image/jpeg'}) : null;
    var data = {files: [file], title: iso ? 'Yobalou Biss Bi' : 'Dahira Touba Fano'}; if (opts && opts.text) data.text = opts.text;
    if (file && navigator.canShare && navigator.canShare(data)) return navigator.share(data).catch(function () {});
    if (file && navigator.canShare && navigator.canShare({files: [file]})) return navigator.share({files: [file]}).catch(function () {});
    var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
  });
};
})();
