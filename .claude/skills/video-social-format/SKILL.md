---
name: video-social-format
description: Esporta un video nei formati per i social (9:16 Reels/TikTok/Stories, 1:1, 16:9 YouTube). Da usare quando l'utente chiede di preparare un video per Instagram, TikTok, Facebook o YouTube.
---

# Formati social

Ricodifica sempre con `-c:v libx264 -pix_fmt yuv420p -c:a aac -movflags +faststart`.

- **9:16 (1080x1920)**, ritaglio centrale: `-vf "crop='min(iw,ih*9/16)':ih,scale=1080:1920"`
- **9:16 senza tagliare** (sfondo sfocato): 
  `-filter_complex "[0:v]scale=1080:1920,boxblur=20[bg];[0:v]scale=1080:-2[fg];[bg][fg]overlay=(W-w)/2:(H-h)/2"`
- **1:1 (1080x1080)**: `-vf "crop='min(iw,ih)':'min(iw,ih)',scale=1080:1080"`
- **16:9 (1920x1080)**: `-vf "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2"`
- Durate indicative: Reels/Stories fino a ~90 s (le Stories vengono divise a 60 s), TikTok fino a 10 min, Shorts fino a 3 min.

Guarda sempre un fotogramma del risultato per verificare che soggetto e testo non siano tagliati. Chiedi all'utente quali formati servono.
