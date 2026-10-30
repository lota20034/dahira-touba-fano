// Tiene sveglio il database Supabase (piano gratuito: va in pausa dopo 7 giorni senza attività).
// Netlify esegue questa funzione da sola, una volta al giorno. Non serve fare nulla.
const SUPABASE_URL = 'https://elgzwgudzwqrrzygfpkp.supabase.co';
const SUPABASE_KEY = 'sb_publishable_5rREEvJSaB4fLXNLSabFPQ_ooWsJEWH'; // chiave pubblica, la stessa di config.js

export default async () => {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/gallery_photos?select=id&limit=1`, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
  });
  console.log('Supabase keepalive:', res.status);
  return new Response(`keepalive ${res.status}`);
};

export const config = { schedule: '@daily' };
