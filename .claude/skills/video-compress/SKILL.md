---
name: video-compress
description: Comprime e converte un video (es. .mov da iPhone) in MP4 H.264 leggero per il web. Da usare quando l'utente chiede di ridurre il peso, convertire o ottimizzare un video.
---

# Comprimere un video per il web

Usa ffmpeg (già installato). Non sovrascrivere mai l'originale: scrivi in un nuovo file.

1. Ispeziona: `ffprobe -v error -show_entries format=duration,size:stream=codec_name,width,height -of default=nw=1 INPUT`
2. Comprimi (max 1080p, compatibile con Safari/iPhone):
   ```
   ffmpeg -i INPUT -vf "scale='min(1080,iw)':-2" -c:v libx264 -crf 26 -preset slow \
     -pix_fmt yuv420p -c:a aac -b:a 128k -movflags +faststart OUTPUT.mp4
   ```
   - `-crf` più alto = file più piccolo (23 buona qualità, 28 molto leggero).
   - Per video verticali da telefono la rotazione è gestita in automatico.
3. Se serve un peso massimo (es. 10 MB): bitrate = (MB*8192)/durata_s - 128 kbps, poi usa `-b:v` a due passaggi.
4. Riporta all'utente peso prima/dopo e durata.
