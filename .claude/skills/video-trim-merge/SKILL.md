---
name: video-trim-merge
description: Taglia, unisce, accelera o rallenta clip video. Da usare quando l'utente chiede di tagliare un pezzo, unire più video, cambiare velocità o togliere l'audio.
---

# Tagliare e unire

- **Taglio preciso** (ricodifica): `ffmpeg -ss 00:00:03 -to 00:00:10 -i IN -c:v libx264 -crf 22 -c:a aac OUT.mp4`
- **Taglio veloce senza ricodifica** (taglia sui keyframe): `ffmpeg -ss 3 -to 10 -i IN -c copy OUT.mp4`
- **Unire** clip con stessi codec/risoluzione: crea `list.txt` con righe `file 'a.mp4'` e usa
  `ffmpeg -f concat -safe 0 -i list.txt -c copy OUT.mp4`.
  Se risoluzioni diverse, ricodifica con `-filter_complex "[0:v][0:a][1:v][1:a]concat=n=2:v=1:a=1"` dopo aver scalato con `scale`+`setsar=1`.
- **Velocità** 2x: `-filter_complex "[0:v]setpts=0.5*PTS[v];[0:a]atempo=2[a]" -map "[v]" -map "[a]"`
- **Senza audio**: `-an`. **Solo audio**: `-vn -c:a libmp3lame`.

Lavora in una cartella di lavoro (scratchpad), non nel repo, finché l'utente non approva il risultato.
