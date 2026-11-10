import { LANGS, type Lang, type Phrase } from './phrases'

let current: HTMLAudioElement | null = null

function findVoice(lang: Lang): SpeechSynthesisVoice | undefined {
  const voices = window.speechSynthesis?.getVoices() ?? []
  const norm = (v: SpeechSynthesisVoice) => v.lang.replace('_', '-').toLowerCase()
  const locale = LANGS[lang].locale.toLowerCase()
  return voices.find((v) => norm(v) === locale) ?? voices.find((v) => norm(v).startsWith(lang))
}

// Device text-to-speech, used only when a recorded clip is missing.
// Returns false when the device has no voice for this language.
// Never falls back to another language's voice: an English voice reading French sounds wrong.
function speakWithDevice(text: string, lang: Lang, rate: number): boolean {
  const synth = window.speechSynthesis
  if (!synth) return false
  const voice = findVoice(lang)
  if (!voice) return false
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = LANGS[lang].locale
  utterance.voice = voice
  utterance.rate = rate
  synth.speak(utterance)
  return true
}

// Plays the recorded clip (public/audio/<lang>/<id>.mp3, made by scripts/generate-audio.ts).
// Resolves false when nothing could be played.
export async function playPhrase(phrase: Phrase, lang: Lang, rate = 1): Promise<boolean> {
  stopSpeaking()
  const audio = new Audio(`${import.meta.env.BASE_URL}audio/${lang}/${phrase.id}.mp3`)
  audio.playbackRate = rate
  audio.preservesPitch = true
  current = audio
  try {
    await audio.play()
    return true
  } catch {
    if (current !== audio) return true // replaced by a newer tap
    current = null
    return speakWithDevice(phrase.text[lang], lang, rate)
  }
}

export function stopSpeaking() {
  current?.pause()
  current = null
  window.speechSynthesis?.cancel()
}
