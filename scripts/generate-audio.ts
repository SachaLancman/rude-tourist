// Generates one native-voice MP3 per phrase and language with ElevenLabs.
// Usage: ELEVENLABS_API_KEY=... npx tsx scripts/generate-audio.ts [lang ...] [--only id,id] [--force] [--native]
// Writes public/audio/<lang>/<phraseId>.mp3. Existing files are skipped unless --force,
// so re-running after adding phrases or languages only pays for the new clips.
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { LANGS, PHRASES, type Lang } from '../src/phrases'

const MODEL = 'eleven_v4'
const CONCURRENCY = 2 // free tier allows 2 parallel requests

// Built-in voice: works on the free plan. The model speaks each language through it.
const BUILTIN = { id: 'JBFqnCBsd6RMkjVDRZzb', name: 'George' }

// One native speaker per language from the ElevenLabs voice library. Needs a paid plan
// (free accounts cannot use library voices via the API). Use with --native --force.
// Languages added after the voice survey have no picked voice yet and use the built-in one.
const NATIVE_VOICES: Partial<Record<Lang, { id: string; name: string }>> = {
  en: { id: 'JBFqnCBsd6RMkjVDRZzb', name: 'George' },
  fr: { id: 'AfbuxQ9DVtS4azaxN1W7', name: 'Léo' },
  es: { id: 'HMCmDsbKeaSZp5LMOYKR', name: 'Johnny' },
  it: { id: 'W71zT1VwIFFx3mMGH2uZ', name: 'MarcoTrox' },
  de: { id: 'fzqS9sNPYJhLlhsfDm0l', name: 'Mark' },
  pt: { id: 'rpNe0HOx7heUulPiOEaG', name: 'Diego' },
  nl: { id: 'dLPO5AsXc3FZDbTh1IKa', name: 'Ido' },
  ja: { id: '3JDquces8E8bkmvbh6Bc', name: 'Otani' },
  el: { id: '5DAtyqt3LGjv9jkjNVFd', name: 'Eugene' },
  tr: { id: '7VqWGAWwo2HMrylfKrcm', name: 'Fatih' },
  pl: { id: 'o2xdfKUpc1Bwq7RchZuW', name: 'Piotr' },
}

const key = process.env.ELEVENLABS_API_KEY
if (!key) {
  console.error('ELEVENLABS_API_KEY is not set')
  process.exit(1)
}

const args = process.argv.slice(2)
const force = args.includes('--force')
const native = args.includes('--native')
const onlyArg = args[args.indexOf('--only') + 1]
const only = args.includes('--only') ? new Set(onlyArg.split(',')) : null
const langs = (args.filter((a) => a in LANGS) as Lang[])
const targetLangs = langs.length ? langs : (Object.keys(LANGS) as Lang[])

const outRoot = join(import.meta.dirname, '..', 'public', 'audio')

const jobs = targetLangs.flatMap((lang) =>
  PHRASES.filter((p) => !only || only.has(p.id)).map((p) => ({
    lang,
    id: p.id,
    text: p.text[lang],
    file: join(outRoot, lang, `${p.id}.mp3`),
  })),
).filter((j) => force || !existsSync(j.file))

const chars = jobs.reduce((n, j) => n + j.text.length, 0)
console.log(`${jobs.length} clips to generate, ${chars} characters`)

async function generate(job: (typeof jobs)[number]) {
  const voice = (native && NATIVE_VOICES[job.lang]) || BUILTIN
  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voice.id}?output_format=mp3_44100_128`,
    {
      method: 'POST',
      headers: { 'xi-api-key': key!, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: job.text,
        model_id: MODEL,
        language_code: job.lang,
        voice_settings: { stability: 0.4, similarity_boost: 0.8, style: 0.35 },
      }),
    },
  )
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`)
  mkdirSync(join(outRoot, job.lang), { recursive: true })
  writeFileSync(job.file, Buffer.from(await res.arrayBuffer()))
}

let next = 0
let failed = 0
async function worker() {
  while (next < jobs.length) {
    const job = jobs[next++]
    try {
      await generate(job)
      console.log(`ok   ${job.lang}/${job.id}`)
    } catch (e) {
      failed++
      console.error(`FAIL ${job.lang}/${job.id}: ${(e as Error).message}`)
    }
  }
}

await Promise.all(Array.from({ length: CONCURRENCY }, worker))
console.log(failed ? `${failed} clips failed` : 'all clips done')
process.exitCode = failed ? 1 : 0
