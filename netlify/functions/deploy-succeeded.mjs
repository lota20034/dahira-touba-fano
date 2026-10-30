// Dopo ogni pubblicazione avvisa Bing, DuckDuckGo, Yandex e gli altri motori IndexNow
// che le pagine del sito sono cambiate, così le rileggono presto.
// (Google non usa IndexNow: per Google c'è la sitemap in Search Console.)
const SITE = 'https://dahira-khadaikhoul-fadaili.netlify.app';
const KEY = '91651b22000883e8e962ed768f41b9a0';
const PAGES = ['/', '/chisiamo.html', '/commissioni.html', '/eventi.html', '/galleria.html', '/citazioni.html', '/social.html', '/contatti.html'];

export default async () => {
  try {
    const r = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'content-type': 'application/json; charset=utf-8' },
      body: JSON.stringify({ host: new URL(SITE).host, key: KEY, keyLocation: SITE + '/' + KEY + '.txt', urlList: PAGES.map((p) => SITE + p) })
    });
    console.log('IndexNow:', r.status);
  } catch (e) {
    console.log('IndexNow non raggiungibile:', e.message);
  }
  return new Response('ok');
};
