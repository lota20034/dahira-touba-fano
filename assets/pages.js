/* =====================================================================
   Dahira Touba Fano — cosa fa ogni pagina (dati dal database)
   ===================================================================== */
(function () {
'use strict';
var D = window.DTF, $ = D.$, t = D.t, esc = D.esc, SVG = D.SVG;
var P = D.page = {};

function weekHtml(list) {
  return (list || []).map(function (d) {
    return '<div class="day rv"><div class="cal">' + t('Ogni', 'Chaque') + '<b>' + t(d.day_it, d.day_fr) + '</b></div><div><h3>' + t(d.title_it, d.title_fr) + '</h3><p>' + t(d.text_it, d.text_fr) + '</p>' +
      (d.program && d.program.length ? '<ul class="prog">' + d.program.map(function (p) { return '<li><time>' + esc(p.t) + '</time><span>' + esc(p.l) + '</span></li>'; }).join('') + '</ul>' :
        (d.time ? '<span class="when">' + t('Dalle ', 'Dès ') + esc(d.time) + '</span>' : '<span class="when">' + t('Orario da confermare', 'Horaire à confirmer') + '</span>')) + '</div></div>';
  }).join('');
}
function albumCard(a, comms, opts) {
  var tt = D.albumTitle(a, comms), n = (a.media && a.media[0] && a.media[0].count) || 0;
  var cov = a.cover_url || (a.events && a.events.cover_url);
  var href = opts && opts.href ? opts.href(a) : 'galleria.html?album=' + a.id;
  var sub = a.kind === 'evento' && a.events ? D.date(a.events.event_date) : a.kind === 'commissione' ? t('Commissione', 'Commission') : a.kind === 'archivio' ? t('Foto di ogni momento', 'Photos de tous les moments') : '';
  var icon = a.kind === 'commissione' ? ((comms.filter(function (c) { return c.id === a.commission_id; })[0] || {}).icon) : a.kind === 'archivio' ? 'archivio' : 'evento';
  return '<a class="album rv" href="' + href + '"><span class="cov">' + (cov ? '<img src="' + esc(cov) + '" alt="" loading="lazy">' : '<span class="ph">' + D.medal(icon) + '</span>') +
    '<span class="n">' + n + ' ' + t(n === 1 ? 'elemento' : 'elementi', n === 1 ? 'élément' : 'éléments') + '</span></span><b>' + t(tt[0], tt[1]) + '</b><small>' + sub + '</small></a>';
}
// copertina automatica: la prima foto dell'album se non c'è una copertina scelta
function fillCovers(albums) {
  var need = albums.filter(function (a) { return !a.cover_url && !(a.events && a.events.cover_url) && a.media && a.media[0] && a.media[0].count; });
  if (!need.length || !D.sb) return Promise.resolve(albums);
  return D.sb.from('media').select('album_id,url,kind,sort,created_at').in('album_id', need.map(function (a) { return a.id; })).eq('kind', 'photo').order('sort').order('created_at').limit(400).then(function (r) {
    (r.data || []).forEach(function (m) { var a = need.filter(function (x) { return x.id === m.album_id; })[0]; if (a && !a._cov) { a._cov = 1; a.cover_url = m.url; } });
    return albums;
  }, function () { return albums; });
}
function channels(links) {
  var I = {
    yt: '<svg viewBox="0 0 24 24"><path d="M23 7.2a3 3 0 0 0-2.1-2.1C19 4.6 12 4.6 12 4.6s-7 0-8.9.5A3 3 0 0 0 1 7.2 31 31 0 0 0 .5 12 31 31 0 0 0 1 16.8a3 3 0 0 0 2.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.1c.4-1.6.5-3.2.5-4.8s-.1-3.2-.5-4.8zM9.7 15.1V8.9l5.8 3.1z"/></svg>',
    tt: '<svg viewBox="0 0 24 24"><path d="M16.6 2h-3.4v13.6a2.9 2.9 0 1 1-2.9-2.9c.3 0 .6 0 .9.1V9.3a6.4 6.4 0 1 0 5.4 6.3V8.7A8 8 0 0 0 21 10V6.6a4.5 4.5 0 0 1-4.4-4.6z"/></svg>',
    ig: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>',
    wa: '<svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.8 14.2c-.2.7-1.4 1.3-2 1.3-.5.1-1.2.1-1.9-.1a17 17 0 0 1-1.7-.6 13.4 13.4 0 0 1-5.2-4.6c-.6-.8-1-1.8-1-2.8s.5-1.5.7-1.7c.2-.2.4-.3.6-.3h.4c.2 0 .4 0 .6.4l.8 2c.1.2.1.3 0 .5l-.3.5-.4.4c-.1.1-.3.3-.1.6.2.3.7 1.2 1.6 2 1.1 1 2 1.3 2.3 1.4.3.2.5.1.6 0l.9-1c.2-.3.4-.2.6-.1l1.9.9c.3.1.5.2.5.3.1.2.1.6-.1 1.3z"/></svg>',
    tg: '<svg viewBox="0 0 24 24"><path d="M21.9 4.3 18.7 19.5c-.2 1-.9 1.3-1.8.8l-4.8-3.6-2.3 2.2c-.3.3-.5.5-1 .5l.3-4.9 8.9-8c.4-.3-.1-.5-.6-.2l-11 6.9-4.7-1.5c-1-.3-1-1 .2-1.5L20.6 3c.9-.3 1.6.2 1.3 1.3z"/></svg>',
    g: '<svg viewBox="0 0 24 24"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/></svg>'
  };
  var list = [
    ['yt', 'YouTube', '@DAHIRATOUBAFANO', links.youtube, ['Iscriviti', "S'abonner"]],
    ['wa', t('Canale WhatsApp', 'Chaîne WhatsApp'), 'Dahira Touba Fano', links.whatsapp, ['Segui', 'Suivre']],
    ['tg', 'Telegram', t('Tutti i video', 'Toutes les vidéos'), links.telegram, ['Segui', 'Suivre']],
    ['ig', 'Instagram · Dahira', '@dahira_touba_fano_', links.instagram_dahira, ['Segui', 'Suivre']],
    ['ig', 'Instagram · Daray', '@daray.toubafano', links.instagram_daray, ['Segui', 'Suivre']],
    ['tt', 'TikTok · Dahira', '@dahiratoubafano', links.tiktok_dahira, ['Segui', 'Suivre']],
    ['tt', 'TikTok · Kourel', '@kourel.touba.fano', links.tiktok_kourel, ['Segui', 'Suivre']],
    ['g', 'Google', 'Keur Serigne Touba Fano', links.maps, ['Recensione', 'Avis']]
  ];
  return list.filter(function (c) { return c[3]; }).map(function (c) {
    return '<a class="ch" href="' + esc(c[3]) + '" target="_blank" rel="noopener"><span class="ic">' + I[c[0]] + '</span><span><b>' + c[1] + '</b><small>' + c[2] + '</small></span><span class="go">' + t(c[4][0], c[4][1]) + '</span></a>';
  }).join('');
}
function mapsLinks(links) { [].forEach.call(document.querySelectorAll('#mapsBtn'), function (a) { if (links.maps) a.href = links.maps; }); }

/* ---------------- Home ---------------- */
P.home = function () {
  D.ready.then(function (r) {
    var comms = r.comms, cfg = r.cfg;
    mapsLinks(cfg.links);
    D.openCommission = function (id) { location.hash = id; };
    D.mountCommissions({container: $('medals'), comms: comms, backHash: 'commissioni', onTour: function (id) { location.hash = 'casa'; setTimeout(function () { D.tourGo && D.tourGo(6); }, 50); }});
    $('week').innerHTML = weekHtml(cfg.weekly);
    // prossimo evento
    D.events().then(function (evs) {
      var today = D.today(), fut = evs.filter(function (e) { return e.event_date >= today; }).sort(function (a, b) { return a.event_date < b.event_date ? -1 : 1; });
      var e = fut[0] || evs[0], box = $('nextEvent');
      if (!e) { box.innerHTML = '<div class="empty" style="grid-column:1/-1">' + t('Presto i prossimi eventi. Intanto ci vediamo ogni sabato!', 'Bientôt les prochains événements. En attendant, on se voit chaque samedi !') + '</div>'; return; }
      if (!fut[0]) $('nextEye').innerHTML = t('Ultimo grande evento', 'Dernier grand événement');
      box.innerHTML = '<a class="poster" href="evento.html?id=' + e.id + '">' + (e.cover_url ? '<img src="' + esc(e.cover_url) + '" alt="" loading="lazy">' : '<span class="ph">' + D.medal('evento') + '</span>') + '</a>' +
        '<div class="prose"><span class="datebox">' + D.dateBox(e.event_date) + '</span><h3 style="font-size:clamp(1.7rem,4vw,2.4rem);color:var(--green)">' + t(e.title_it, e.title_fr) + '</h3>' +
        (e.desc_it || e.desc_fr ? '<p>' + t(e.desc_it, e.desc_fr) + '</p>' : '') +
        '<div class="meta">' + '<span>' + SVG.cal + D.date(e.event_date, {weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'}) + '</span>' + (e.location ? '<span>' + SVG.pin + esc(e.location) + '</span>' : '') + '</div>' +
        '<div class="actions"><a class="btn dark" href="evento.html?id=' + e.id + '">' + t(fut[0] ? 'Dettagli' : 'Guarda le foto', fut[0] ? 'Détails' : 'Voir les photos') + '</a><a class="btn line" href="eventi.html">' + t('Tutti gli eventi', 'Tous les événements') + '</a></div></div>';
    });
    // ultimi album
    D.albums().then(fillCovers).then(function (albums) {
      var list = albums.filter(function (a) { return a.media && a.media[0] && a.media[0].count > 0; })
        .sort(function (a, b) { var da = a.events ? a.events.event_date : a.created_at, db = b.events ? b.events.event_date : b.created_at; return da < db ? 1 : -1; }).slice(0, 4);
      $('latestAlbums').innerHTML = list.length ? list.map(function (a) { return albumCard(a, comms); }).join('') : '<div class="empty">' + t('Gli album arriveranno presto.', 'Les albums arrivent bientôt.') + '</div>';
      D.reveal();
    });
    // citazione
    D.quotes().then(function (qs) {
      var yb = D.yobalou ? D.yobalou(cfg, qs)[0] : null, q = yb ? yb.q : qs[Math.floor(Math.random() * qs.length)];
      $('quote').innerHTML = (yb ? '<span class="eyebrow">Yobalou Biss Bi · ' + D.fridayLabel(yb.date) + '</span>' : '') +
        '<p class="wo">“' + esc(q.text_wo || q.text_it) + '”</p>' + (q.text_wo ? '<p class="tr">' + t(q.text_it, q.text_fr) + '</p>' : '') + (q.author ? '<cite>' + esc(q.author) + '</cite>' : '');
    });
    // Diayanté
    var dy = cfg.diayante;
    if (dy && dy.visible && dy.iban) {
      var sec = $('diayante'); sec.hidden = false;
      $('dyText').innerHTML = t(dy.text_it, dy.text_fr);
      var goal = +dy.goal || 0, raised = +dy.raised || 0, pct = goal ? Math.min(100, Math.round(raised / goal * 100)) : 0;
      var eur = function (n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' €'; };
      $('dyBox').innerHTML = '<div class="card">' + (goal ? '<div class="goal"><b>' + eur(raised) + '</b><span>' + t('raccolti su ', 'récoltés sur ') + eur(goal) + '</span></div><div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + pct + '"><i style="width:0%"></i></div>' : '') +
        '<div class="iban"><div><small>IBAN' + (dy.holder ? ' · ' + esc(dy.holder) : '') + '</small><code>' + esc(dy.iban) + '</code></div><button type="button" id="copyIban">' + t('Copia IBAN', "Copier l'IBAN") + '</button></div>' +
        (dy.causale ? '<p style="color:var(--on-dark-muted);font-size:.9rem">' + t('Causale: ', 'Motif : ') + '<strong style="color:var(--gold2)">' + esc(dy.causale) + '</strong></p>' : '') + '</div>' +
        '<ul style="margin:0;padding-left:1.1rem;color:var(--on-dark-muted);display:grid;gap:.5rem"><li>' + t('Apri l’app della tua banca e scegli “bonifico”.', 'Ouvre l’application de ta banque et choisis « virement ».') + '</li><li>' + t('Incolla l’IBAN e scrivi la causale.', 'Colle l’IBAN et écris le motif.') + '</li><li>' + t('Jërëjëf! Ogni dono, anche piccolo, sostiene la dahira.', 'Jërëjëf ! Chaque don, même petit, soutient la dahira.') + '</li></ul>';
      $('copyIban').onclick = function () { D.copy(dy.iban.replace(/\s/g, ''), D.L('IBAN copiato', 'IBAN copié')); };
      if ('IntersectionObserver' in window) new IntersectionObserver(function (es, o) { if (es[0].isIntersecting) { var b = sec.querySelector('.progress i'); if (b) b.style.width = pct + '%'; o.disconnect(); } }).observe(sec);
    }
    D.reveal();
  });
};

P.chi = function () { D.ready.then(function (r) { $('week').innerHTML = weekHtml(r.cfg.weekly); D.reveal(); }); };

P.commissioni = function () {
  D.ready.then(function (r) {
    D.mountCommissions({container: $('medals'), comms: r.comms, backHash: 'commissioni', onTour: function () { location.href = 'index.html#casa'; }});
    $('commList').innerHTML = r.comms.map(function (c) {
      return '<a class="info rv" href="#' + esc(c.id) + '" style="text-decoration:none"><span style="width:56px;display:block">' + D.medal(c.icon) + '</span><h3>' + t(c.name_it, c.name_fr) + '</h3><p>' + t(c.lead_it, c.lead_fr) + '</p></a>';
    }).join('');
    D.reveal();
  });
};

P.eventi = function () {
  D.ready.then(function (r) {
    $('week').innerHTML = weekHtml(r.cfg.weekly);
    D.events().then(function (evs) {
      var today = D.today();
      var fut = evs.filter(function (e) { return e.event_date >= today; }).sort(function (a, b) { return a.event_date < b.event_date ? -1 : 1; });
      var past = evs.filter(function (e) { return e.event_date < today; });
      $('upcoming').innerHTML = fut.length ? fut.map(function (e) {
        return '<a class="ev-row" href="evento.html?id=' + e.id + '"><span class="d">' + D.dateBox(e.event_date) + '</span><span><h3>' + t(e.title_it, e.title_fr) + '</h3><p>' + (e.location ? esc(e.location) : '') + '</p></span><span class="arr">' + SVG.arrowR + '</span></a>';
      }).join('') : '<div class="empty">' + t('Nessun evento in programma per ora. Ci vediamo ogni sabato!', 'Aucun événement prévu pour le moment. On se voit chaque samedi !') + '</div>';
      D.albums().then(fillCovers).then(function (albums) {
        var byEv = {}; albums.forEach(function (a) { if (a.event_id) byEv[a.event_id] = a; });
        var years = {}; past.forEach(function (e) { var y = e.event_date.slice(0, 4); (years[y] = years[y] || []).push(e); });
        var ys = Object.keys(years).sort().reverse();
        $('past').innerHTML = ys.length ? ys.map(function (y) {
          return '<h3 class="year" style="color:#fff">' + y + '</h3><div class="albums">' + years[y].map(function (e) {
            var a = byEv[e.id] || {id: '', kind: 'evento', media: [{count: 0}]};
            a.events = e; if (!a.cover_url) a.cover_url = e.cover_url;
            return albumCard(a, r.comms, {href: function () { return 'evento.html?id=' + e.id; }});
          }).join('') + '</div>';
        }).join('') : '<div class="empty">' + t('L’archivio è ancora vuoto.', 'Les archives sont encore vides.') + '</div>';
        D.reveal();
      });
    });
    D.reveal();
  });
};

P.evento = function () {
  var id = new URLSearchParams(location.search).get('id');
  D.ready.then(function () {
    if (!id || !D.sb) { $('evHead').innerHTML = '<h1>' + t('Evento non trovato', 'Événement introuvable') + '</h1>'; $('evGal').innerHTML = ''; return; }
    D.sb.from('events').select('*').eq('id', id).maybeSingle().then(function (r) {
      var e = r.data;
      if (!e) { $('evHead').innerHTML = '<h1>' + t('Evento non trovato', 'Événement introuvable') + '</h1>'; $('evGal').innerHTML = ''; return; }
      document.title = D.L(e.title_it, e.title_fr) + ' | Dahira Touba Fano';
      var link = document.createElement('link'); link.rel = 'canonical'; link.href = location.origin + '/evento.html?id=' + e.id; document.head.appendChild(link);
      var md = document.querySelector('meta[name="description"]'); if (md && (e.desc_it || e.title_it)) md.content = (e.title_it + ' — ' + (e.desc_it || '')).slice(0, 155);
      var ld = document.createElement('script'); ld.type = 'application/ld+json';
      ld.textContent = JSON.stringify({'@context': 'https://schema.org', '@type': 'Event', name: e.title_it, startDate: e.event_date, description: e.desc_it || e.title_it,
        eventStatus: 'https://schema.org/EventScheduled', eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
        image: e.cover_url ? [new URL(e.cover_url, location.origin).href] : [location.origin + '/img/og.jpg'],
        location: {'@type': 'Place', name: 'Keur Serigne Touba Fano', address: {'@type': 'PostalAddress', streetAddress: "Via dell'Artigianato", addressLocality: 'Monterado, Trecastelli', addressRegion: 'AN', postalCode: '60012', addressCountry: 'IT'}},
        organizer: {'@type': 'Organization', name: 'Dahira Touba Fano', url: location.origin + '/'}});
      document.head.appendChild(ld);
      if (e.cover_url) $('evBg').src = e.cover_url;
      $('evHead').innerHTML = '<span class="eyebrow" style="color:var(--gold)">' + D.date(e.event_date, {weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'}) + '</span><h1>' + t(e.title_it, e.title_fr) + '</h1>' + (e.location ? '<p>' + esc(e.location) + '</p>' : '');
      var yt = e.youtube_url && D.ytId(e.youtube_url);
      $('evBody').innerHTML = (e.cover_url ? '<div class="poster" style="max-width:420px"><img src="' + esc(e.cover_url) + '" alt="' + esc(D.L(e.title_it, e.title_fr)) + '"></div>' : '<div class="poster" style="max-width:420px"><span class="ph">' + D.medal('evento') + '</span></div>') +
        '<div class="prose light"><span class="datebox">' + D.dateBox(e.event_date) + '</span>' + D.paras(e.desc_it, e.desc_fr) +
        '<div class="meta">' + (e.location ? '<span>' + SVG.pin + esc(e.location) + '</span>' : '') + '</div>' +
        '<div class="actions">' + (yt ? '<button type="button" class="btn dark" id="evYt">' + t('Guarda il video', 'Voir la vidéo') + '</button>' : '') +
        (e.telegram_url ? '<a class="btn line" href="' + esc(e.telegram_url) + '" target="_blank" rel="noopener">' + t('Guarda su Telegram', 'Voir sur Telegram') + '</a>' : '') + '</div></div>';
      if (yt) $('evYt').onclick = function () { D.lightbox([{kind: 'youtube', url: e.youtube_url}], 0); };
      D.sb.from('albums').select('id').eq('event_id', id).maybeSingle().then(function (a) {
        if (!a.data) { D.photoGrid($('evGal'), []); return; }
        D.media(a.data.id).then(function (items) { D.photoGrid($('evGal'), items); });
      });
    });
  });
};

P.galleria = function () {
  var params = new URLSearchParams(location.search), albumId = params.get('album'), filter = params.get('f') || 'tutti';
  D.ready.then(function (r) {
    var comms = r.comms;
    D.albums().then(fillCovers).then(function (albums) {
      if (albumId) {
        var a = albums.filter(function (x) { return x.id === albumId; })[0];
        $('galList').hidden = true; $('galAlbum').hidden = false;
        if (!a) { $('albTitle').innerHTML = t('Album non trovato', 'Album introuvable'); return; }
        var tt = D.albumTitle(a, comms);
        document.title = D.L(tt[0], tt[1]) + ' | Galleria · Dahira Touba Fano';
        $('albEye').innerHTML = a.kind === 'evento' ? t('Evento', 'Événement') : a.kind === 'commissione' ? t('Commissione', 'Commission') : t('Album', 'Album');
        $('albTitle').innerHTML = t(tt[0], tt[1]);
        $('albSub').innerHTML = a.kind === 'evento' && a.events ? D.date(a.events.event_date) + ' · <a href="evento.html?id=' + a.event_id + '">' + t('Vai all’evento', 'Voir l’événement') + '</a>' : a.kind === 'commissione' ? '<a href="commissioni.html#' + esc(a.commission_id) + '">' + t('Vai alla commissione', 'Voir la commission') + '</a>' : '';
        $('albPhotos').innerHTML = '<div class="skel" style="height:240px"></div>';
        D.media(a.id).then(function (items) { D.photoGrid($('albPhotos'), items); });
        return;
      }
      var full = albums.filter(function (a) { return a.media && a.media[0] && a.media[0].count > 0; });
      var chips = [['tutti', 'Tutti', 'Tous'], ['evento', 'Eventi', 'Événements']].concat(comms.map(function (c) { return ['c:' + c.id, c.name_it, c.name_fr]; })).concat([['archivio', 'Archivio', 'Archives']]);
      chips = chips.filter(function (c) { return c[0] === 'tutti' || full.some(function (a) { return match(a, c[0]); }); });
      function match(a, f) { return f === 'tutti' || (f === 'evento' && a.kind === 'evento') || (f === 'archivio' && a.kind === 'archivio') || (f === 'c:' + a.commission_id); }
      function draw() {
        $('chips').innerHTML = chips.map(function (c) { return '<button type="button" data-f="' + c[0] + '" aria-pressed="' + (c[0] === filter) + '">' + t(c[1], c[2]) + '</button>'; }).join('');
        var list = full.filter(function (a) { return match(a, filter); }).sort(function (a, b) {
          var ka = a.kind === 'evento' ? 0 : a.kind === 'commissione' ? 1 : 2, kb = b.kind === 'evento' ? 0 : b.kind === 'commissione' ? 1 : 2;
          if (ka !== kb) return ka - kb;
          if (ka === 0) return a.events.event_date < b.events.event_date ? 1 : -1;
          return a.sort - b.sort;
        });
        $('albums').innerHTML = list.length ? list.map(function (a) { return albumCard(a, comms); }).join('') : '<div class="empty">' + t('Nessun album qui per ora.', 'Aucun album ici pour le moment.') + '</div>';
        D.reveal();
      }
      $('chips').addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b) return; filter = b.dataset.f; history.replaceState(null, '', filter === 'tutti' ? 'galleria.html' : 'galleria.html?f=' + encodeURIComponent(filter)); draw(); });
      draw();
    });
  });
};

P.citazioni = function () {
  D.ready.then(function (r) {
    D.quotes().then(function (qs) {
      var yb = D.yobalou(r.cfg, qs), box = $('yobalou');
      if (yb.length) {
        var cur = yb[0], q = cur.q;
        box.hidden = false;
        box.innerHTML = '<div class="wrap"><div class="yb"><span class="eyebrow">Yobalou Biss Bi · ' + D.fridayLabel(cur.date) + '</span>' +
          '<p class="wo">“' + esc(q.text_wo || q.text_it) + '”</p>' + (q.text_wo ? '<p class="tr">' + t(q.text_it, q.text_fr) + '</p>' : '') + (q.author ? '<cite>' + esc(q.author) + '</cite>' : '') +
          '<div class="actions" style="justify-content:center"><button type="button" class="btn" data-img="post">' + t('Immagine per i post', 'Image pour les posts') + '</button><button type="button" class="btn ghost" data-img="story">' + t('Immagine per le storie', 'Image pour les stories') + '</button></div></div>' +
          (yb.length > 1 ? '<details class="yb-arch"><summary>' + t('I venerdì passati', 'Les vendredis passés') + ' (' + (yb.length - 1) + ')</summary><ol>' + yb.slice(1).map(function (x) {
            return '<li><span class="eyebrow">' + D.fridayLabel(x.date) + '</span><p class="wo">“' + esc(x.q.text_wo || x.q.text_it) + '”</p>' + (x.q.text_wo ? '<p class="tr">' + t(x.q.text_it, x.q.text_fr) + '</p>' : '') + '</li>';
          }).join('') + '</ol></details>' : '') + '</div>';
        box.addEventListener('click', function (e) { var b = e.target.closest('[data-img]'); if (!b) return; b.disabled = true; D.shareQuoteImage(q, b.dataset.img, cur.date).then(function () { b.disabled = false; }); });
      }
      $('quotes').innerHTML = qs.map(function (q, i) {
        return '<article class="q rv"><p class="wo">“' + esc(q.text_wo || q.text_it) + '”</p>' + (q.text_wo ? '<p class="tr">' + t(q.text_it, q.text_fr) + '</p>' : '') +
          '<footer><cite>' + esc(q.author || '') + '</cite><button type="button" data-i="' + i + '">' + t('Copia', 'Copier') + '</button></footer></article>';
      }).join('');
      $('quotes').addEventListener('click', function (e) {
        var b = e.target.closest('button'); if (!b) return; var q = qs[+b.dataset.i];
        var txt = '“' + (q.text_wo || '') + '”\n' + D.L(q.text_it, q.text_fr) + (q.author ? '\n— ' + q.author : '') + '\n\nDahira Touba Fano';
        if (navigator.share) navigator.share({text: txt}).catch(function () { D.copy(txt, D.L('Citazione copiata', 'Citation copiée')); }); else D.copy(txt, D.L('Citazione copiata', 'Citation copiée'));
      });
      D.reveal();
    });
  });
};

P.media = function () {
  D.ready.then(function (r) {
    var links = r.cfg.links;
    $('channels').innerHTML = channels(links);
    if (links.qr) $('qrLink').href = links.qr;
    var box = $('videos');
    function draw(vids) {
      box.innerHTML = vids.length ? vids.map(function (v, i) {
        return '<div class="video rv"><button type="button" class="frame" data-i="' + i + '" aria-label="' + esc(D.L('Guarda il video', 'Voir la vidéo')) + '"><img src="' + esc(D.ytThumb(v.url)) + '" alt="" loading="lazy"></button>' + ((v.caption_it || v.caption_fr) ? '<b>' + t(v.caption_it, v.caption_fr) + '</b>' : '') + '</div>';
      }).join('') : '<div class="empty">' + t('I video arriveranno presto.', 'Les vidéos arrivent bientôt.') + '</div>';
      box.onclick = function (e) {
        var b = e.target.closest('.frame'); if (!b || b.classList.contains('playing')) return;
        var v = vids[+b.dataset.i]; b.classList.add('playing');
        b.insertAdjacentHTML('beforeend', '<iframe src="' + esc(D.ytEmbed(v.url)) + '" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen title="Video"></iframe>');
      };
      D.reveal();
    }
    if (!D.sb) { draw([]); return; }
    D.sb.from('media').select('*').eq('kind', 'youtube').order('created_at', {ascending: false}).limit(30).then(function (res) { draw(res.data || []); }, function () { draw([]); });
  });
};

P.contatti = function () { D.ready.then(function (r) { mapsLinks(r.cfg.links); $('channels').innerHTML = channels(r.cfg.links); D.reveal(); }); };
})();
