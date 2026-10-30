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
D.quoteImage = function (q, fmt, iso) {
  var W = 1080, H = fmt === 'story' ? 1920 : 1350, c = document.createElement('canvas'); c.width = W; c.height = H;
  var x = c.getContext('2d'), pad = 96, cx = W / 2;
  var fonts = document.fonts ? Promise.all(['italic 400 60px "Playfair Display"', '700 60px "Playfair Display"', '400 30px Inter', '600 26px Inter'].map(function (f) { return document.fonts.load(f).catch(function () {}); })) : Promise.resolve();
  return Promise.all([fonts, loadImg('/img/logo.webp')]).then(function (r) {
    var logo = r[1];
    // sfondo verde con stella a otto punte in filigrana
    var g = x.createRadialGradient(cx, H * 0.38, 80, cx, H * 0.45, H * 0.8); g.addColorStop(0, '#24502c'); g.addColorStop(1, '#0b2412');
    x.fillStyle = g; x.fillRect(0, 0, W, H);
    x.save(); x.translate(cx, H / 2); x.strokeStyle = 'rgba(201,168,76,.10)'; x.lineWidth = 2;
    [0, 45, 22.5, 67.5].forEach(function (a, k) { var s = k < 2 ? 760 : 560; x.save(); x.rotate(a * Math.PI / 180); x.strokeRect(-s / 2, -s / 2, s, s); x.restore(); });
    x.beginPath(); x.arc(0, 0, 500, 0, Math.PI * 2); x.stroke(); x.restore();
    // cornice oro
    x.strokeStyle = '#c9a84c'; x.lineWidth = 3; x.strokeRect(40, 40, W - 80, H - 80);
    x.strokeStyle = 'rgba(201,168,76,.45)'; x.lineWidth = 1; x.strokeRect(54, 54, W - 108, H - 108);
    var y = fmt === 'story' ? 210 : 130;
    if (logo) { x.save(); x.beginPath(); x.arc(cx, y + 60, 60, 0, Math.PI * 2); x.clip(); x.drawImage(logo, cx - 60, y, 120, 120); x.restore(); x.strokeStyle = '#c9a84c'; x.lineWidth = 3; x.beginPath(); x.arc(cx, y + 60, 61, 0, Math.PI * 2); x.stroke(); }
    y += 170;
    x.textAlign = 'center'; x.textBaseline = 'alphabetic';
    x.fillStyle = '#c9a84c'; x.font = '600 26px Inter, sans-serif';
    x.fillText('Y O B A L O U   B I S S   B I', cx, y);
    if (iso) { y += 44; x.fillStyle = '#e8d5a3'; x.font = '400 26px Inter, sans-serif'; x.fillText(new Date(iso + 'T12:00:00').toLocaleDateString('fr-FR', {weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'}), cx, y); }
    y += 40; x.fillStyle = '#c9a84c'; x.fillRect(cx - 40, y, 80, 3);
    // spazio per i testi
    var bottom = H - (fmt === 'story' ? 300 : 190), avail = bottom - y - 60, maxW = W - pad * 2;
    var wo = q.text_wo ? fit(x, '“' + q.text_wo + '”', 'italic 400 {s}px "Playfair Display", Georgia, serif', fmt === 'story' ? 84 : 66, 34, maxW, avail * 0.55, 1.28) : null;
    var it = fit(x, q.text_it || '', '400 {s}px Inter, sans-serif', fmt === 'story' ? 42 : 34, 22, maxW, avail * 0.2, 1.4);
    var fr = fit(x, q.text_fr || '', '400 {s}px Inter, sans-serif', fmt === 'story' ? 42 : 34, 22, maxW, avail * 0.2, 1.4);
    var total = (wo ? wo.h + 50 : 0) + it.h + (q.text_fr ? 30 + fr.h : 0);
    y += 60 + Math.max(0, (avail - total) / 2);
    function draw(b, font, color) { x.font = font.replace('{s}', b.size); x.fillStyle = color; b.lines.forEach(function (l, k) { x.fillText(l, cx, y + b.size + k * b.size * (b.h / b.lines.length / b.size)); }); y += b.h; }
    if (wo) { draw(wo, 'italic 400 {s}px "Playfair Display", Georgia, serif', '#ffffff'); y += 50; }
    draw(it, '400 {s}px Inter, sans-serif', '#e2e8df');
    if (q.text_fr) { y += 30; draw(fr, 'italic 400 {s}px Inter, sans-serif', '#c2ccbf'); }
    // autore e firma
    x.fillStyle = '#c9a84c'; x.font = '600 26px Inter, sans-serif';
    x.fillText((q.author || 'Mame Cheikh Ibrahima Fall').toUpperCase().split('').join(' ').replace(/ {3}/g, '   '), cx, bottom + 20);
    x.fillStyle = '#e8d5a3'; x.font = '700 34px "Playfair Display", Georgia, serif';
    x.fillText('Dahira Touba Fano', cx, H - (fmt === 'story' ? 190 : 110));
    x.fillStyle = '#c2ccbf'; x.font = '400 22px Inter, sans-serif';
    x.fillText('Keur Serigne Touba Fano · Khadaikhoul Fadha-il', cx, H - (fmt === 'story' ? 150 : 76));
    return new Promise(function (ok) { c.toBlob(function (b) { ok(b); }, 'image/jpeg', 0.92); });
  });
};
// scarica o condividi l'immagine (sul telefono si apre la condivisione: Instagram, WhatsApp…)
D.shareQuoteImage = function (q, fmt, iso) {
  return D.quoteImage(q, fmt, iso).then(function (blob) {
    var name = 'yobalou-biss-bi' + (iso ? '-' + iso : '') + (fmt === 'story' ? '-storia' : '-post') + '.jpg';
    var file = window.File ? new File([blob], name, {type: 'image/jpeg'}) : null;
    if (file && navigator.canShare && navigator.canShare({files: [file]})) return navigator.share({files: [file], title: 'Yobalou Biss Bi'}).catch(function () {});
    var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
  });
};
})();
