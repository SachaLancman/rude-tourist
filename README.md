# Rude Tourist

A travel phrasebook of insults and survival phrases. Pick your language and the one you are travelling to, put up to 24 phrases on your board, and tap one to see it in both languages, read how to pronounce it, and hear it spoken.

Web app (React + Vite), built so it can later be wrapped for iOS and Android with Capacitor.

## Run

```bash
npm install
npm run dev
```

## Phrases

- `src/phrases.ts` holds the phrase list and English, French, Spanish, Italian and German.
- `src/packs.ts` holds the other languages, one block per language. To add a language, copy a block, translate it, and add the language to `LANGS` in `src/phrases.ts`.

## Audio

Each phrase has a recorded clip in `public/audio/<lang>/<phraseId>.mp3`, generated with ElevenLabs:

```bash
ELEVENLABS_API_KEY=... npx tsx scripts/generate-audio.ts
```

It only generates missing clips. `--native --force` regenerates everything with a native speaker per language (needs a paid ElevenLabs plan).

The current clips were made on the ElevenLabs free plan, which does not allow commercial use. Regenerate them on a paid plan before release.
