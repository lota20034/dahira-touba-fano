---
name: video-thumbnail
description: Estrae copertina (poster) e fotogrammi da un video e li guarda per capirne il contenuto. Da usare per creare la miniatura, scegliere il momento migliore o descrivere cosa mostra un video.
---

# Copertina e fotogrammi

- Un fotogramma: `ffmpeg -ss 00:00:02 -i IN -frames:v 1 -q:v 2 poster.jpg`
- Un fotogramma ogni N secondi (per "guardare" il video): `ffmpeg -i IN -vf "fps=1/3,scale=480:-1" frames/f_%02d.png`, poi leggi le immagini con Read.
- Contact sheet unico: `ffmpeg -i IN -vf "fps=1/2,scale=320:-1,tile=4x3" sheet.jpg`
- Estrarre l'audio: `ffmpeg -i IN -vn -c:a aac audio.m4a`

Ricorda: dai fotogrammi vedo le immagini, non sento l'audio. Salva i file temporanei fuori dal repo. Quando descrivi persone, limitati a ciò che si vede e non attribuire nomi o identità.
