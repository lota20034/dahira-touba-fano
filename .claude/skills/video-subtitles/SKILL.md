---
name: video-subtitles
description: Aggiunge sottotitoli o testo su un video (italiano, francese, wolof...), incollati nel video o come file .srt. Da usare quando l'utente chiede sottotitoli, didascalie o titoli sovrapposti.
---

# Sottotitoli

1. Se l'utente fornisce il testo con i tempi, scrivi un file `.srt` (UTF-8):
   ```
   1
   00:00:00,000 --> 00:00:03,000
   Testo della prima riga
   ```
   Se non ci sono tempi né trascrizione, chiedi il testo: non inventarlo. L'audio non lo ascolto; per trascrivere serve un tool come faster-whisper (verifica se installabile).
2. Incolla nel video (burn-in):
   ```
   ffmpeg -i IN -vf "subtitles=sub.srt:force_style='FontSize=22,Outline=2,MarginV=40'" -c:a copy OUT.mp4
   ```
3. Testo semplice per tutta la durata: filtro `drawtext=text='Titolo':fontsize=48:fontcolor=white:x=(w-text_w)/2:y=h-120:box=1:boxcolor=black@0.5`.
4. Alternativa non invasiva per il sito: lascia il video pulito e offri `.srt`/`.vtt` da usare con `<track kind="subtitles">`.
5. Controlla un fotogramma del risultato (`ffmpeg -ss 2 -i OUT -frames:v 1 f.png`) e guardalo prima di consegnare.
