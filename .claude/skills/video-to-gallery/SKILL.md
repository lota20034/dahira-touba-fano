---
name: video-to-gallery
description: Prepara un video e lo inserisce nella pagina del sito (galleria.html o altra) con anteprima e lazy loading. Da usare quando l'utente vuole pubblicare un video sul sito della Dahira.
---

# Video nel sito

1. Il modo più semplice: carica il video su YouTube e aggiungi il link dal pannello admin (Foto e album → Aggiungi un video YouTube): compare da solo nell'album e nella pagina Media. Se serve un video caricato sul sito, leggi prima `galleria.html`, `assets/app.js` e `assets/site.css` e segui la struttura esistente (lightbox in `DTF.lightbox`): non introdurre framework.
2. Ottimizza il video con la skill `video-compress` (MP4 H.264, `+faststart`) e crea il poster con `video-thumbnail`. Metti i file nella stessa cartella degli altri media del sito.
3. Markup base:
   ```html
   <video controls preload="none" playsinline poster="media/nome-poster.jpg" width="100%">
     <source src="media/nome.mp4" type="video/mp4">
   </video>
   ```
   Niente autoplay con audio.
4. Ricordati di aggiungere l'URL a `sitemap.xml` solo se si crea una pagina nuova.
5. Rispetta privacy: se nel video compaiono persone riconoscibili, chiedi conferma all'utente che ha il consenso a pubblicarlo.
6. Non fare commit/push senza richiesta dell'utente.
