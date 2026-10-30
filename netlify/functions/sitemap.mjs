// Sitemap per Google, sempre aggiornata: aggiunge da sola ogni evento creato nel pannello.
const SITE = 'https://dahira-khadaikhoul-fadaili.netlify.app';
const SUPABASE_URL = 'https://elgzwgudzwqrrzygfpkp.supabase.co';
const SUPABASE_KEY = 'sb_publishable_5rREEvJSaB4fLXNLSabFPQ_ooWsJEWH';
const PAGES = [
  ['/', '1.0'], ['/chisiamo.html', '0.8'], ['/commissioni.html', '0.8'], ['/eventi.html', '0.9'],
  ['/galleria.html', '0.7'], ['/citazioni.html', '0.6'], ['/social.html', '0.6'], ['/contatti.html', '0.8']
];
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export default async () => {
  const today = new Date().toISOString().slice(0, 10);
  let events = [];
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/events?select=id,title_it,event_date,cover_url,created_at&order=event_date.desc`, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
    });
    if (r.ok) events = await r.json();
  } catch (e) { /* se il database non risponde, la sitemap contiene comunque le pagine fisse */ }
  const urls = PAGES.map(([p, pr]) => `  <url><loc>${SITE}${p}</loc><lastmod>${today}</lastmod><priority>${pr}</priority>${p === '/' ?
    `<image:image><image:loc>${SITE}/img/tour/cancello.webp</image:loc><image:title>Keur Serigne Touba Fano</image:title></image:image><image:image><image:loc>${SITE}/img/tour/facciata-prato.webp</image:loc><image:title>Keur Serigne Touba Fano, la casa della Dahira Touba Fano</image:title></image:image>` : ''}</url>`);
  for (const e of events) {
    const img = e.cover_url ? `<image:image><image:loc>${esc(new URL(e.cover_url, SITE).href)}</image:loc><image:title>${esc(e.title_it)}</image:title></image:image>` : '';
    urls.push(`  <url><loc>${SITE}/evento.html?id=${e.id}</loc><lastmod>${(e.created_at || today).slice(0, 10)}</lastmod><priority>0.6</priority>${img}</url>`);
  }
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${urls.join('\n')}\n</urlset>\n`;
  return new Response(xml, { headers: { 'content-type': 'application/xml; charset=utf-8', 'cache-control': 'public, max-age=3600' } });
};

export const config = { path: '/sitemap.xml' };
