// Link breve di una citazione: https://dahira-khadaikhoul-fadaili.netlify.app/q/<id>
// - WhatsApp, Instagram, Telegram e Facebook leggono qui titolo, testo e immagine dell'anteprima
// - chi apre il link viene portato subito alla pagina citazione.html?id=<id> (scegli le frasi e condividi)
// L'immagine dell'anteprima la prepara il pannello admin quando salvi la citazione (gallery/citazioni/<id>.jpg).
const SUPABASE_URL = 'https://elgzwgudzwqrrzygfpkp.supabase.co';
const SUPABASE_KEY = 'sb_publishable_5rREEvJSaB4fLXNLSabFPQ_ooWsJEWH'; // chiave pubblica (solo lettura)

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const cut = (s, n) => { s = String(s || '').replace(/\s+/g, ' ').trim(); return s.length > n ? s.slice(0, n - 1).trimEnd() + '…' : s; };

export default async (req, context) => {
  const origin = new URL(req.url).origin;
  const id = String(context.params?.id || '').replace(/[^\w-]/g, '');
  const target = `${origin}/citazione.html?id=${encodeURIComponent(id)}`;
  let q = null, image = `${origin}/img/og.jpg`, w = 900, h = 900;
  try {
    const headers = { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` };
    const [res, img] = await Promise.all([
      fetch(`${SUPABASE_URL}/rest/v1/quotes?id=eq.${encodeURIComponent(id)}&select=text_wo,text_it,text_fr,author`, { headers }),
      fetch(`${SUPABASE_URL}/storage/v1/object/public/gallery/citazioni/${encodeURIComponent(id)}.jpg`, { method: 'HEAD' })
    ]);
    if (res.ok) q = (await res.json())[0] || null;
    if (img.ok) {
      const v = (img.headers.get('etag') || img.headers.get('last-modified') || '').replace(/[^\w]/g, '').slice(0, 16);
      image = `${SUPABASE_URL}/storage/v1/object/public/gallery/citazioni/${encodeURIComponent(id)}.jpg${v ? '?v=' + v : ''}`; w = 1200; h = 630;
    }
  } catch (e) { console.log('quote-preview', e.message); }

  const main = q ? (q.text_wo || q.text_it) : 'Kàddu · Parole di saggezza';
  const title = q ? `“${cut(main, 90)}”` : 'Citazioni | Dahira Touba Fano';
  const desc = q ? cut([q.text_wo ? q.text_it : q.text_fr, q.author && !/^dahira touba fano$/i.test(q.author.trim()) ? '— ' + q.author : '', 'Dahira Touba Fano · Keur Serigne Touba Fano'].filter(Boolean).join(' '), 200)
    : 'Le parole di saggezza della Dahira Touba Fano, in wolof con la traduzione.';
  const html = `<!DOCTYPE html>
<html lang="it"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)} | Dahira Touba Fano</title>
<meta name="description" content="${esc(desc)}">
<meta name="robots" content="noindex,follow">
<link rel="canonical" href="${esc(target)}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="Dahira Touba Fano">
<meta property="og:locale" content="it_IT">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${esc(origin + '/q/' + id)}">
<meta property="og:image" content="${esc(image)}">
<meta property="og:image:secure_url" content="${esc(image)}">
<meta property="og:image:type" content="image/jpeg">
<meta property="og:image:width" content="${w}">
<meta property="og:image:height" content="${h}">
<meta property="og:image:alt" content="${esc(cut(main, 120))}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}">
<meta name="twitter:image" content="${esc(image)}">
<meta http-equiv="refresh" content="0;url=${esc(target)}">
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#0e2a14;color:#e8d5a3;font:16px/1.5 system-ui,sans-serif;text-align:center;padding:24px}a{color:#c9a84c}</style>
</head><body>
<p>${esc(title)}<br><a href="${esc(target)}">Apri la citazione</a></p>
<script>location.replace(${JSON.stringify(target)});</script>
</body></html>`;
  return new Response(html, {
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'public, max-age=0, must-revalidate',
      'netlify-cdn-cache-control': 'public, s-maxage=600, stale-while-revalidate=86400'
    }
  });
};

export const config = { path: '/q/:id' };
