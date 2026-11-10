import { PACKS } from './packs'

type CoreLang = 'en' | 'fr' | 'es' | 'it' | 'de'
type PackLang = keyof typeof PACKS
export type Lang = CoreLang | PackLang
// Languages the app can explain things in. Pronunciation guides are written for these readers.
export type HomeLang = 'en' | 'fr'
export type Category = 'insult' | 'basic'

export const LANGS: Record<Lang, { name: Record<HomeLang, string>; flag: string; locale: string }> = {
  en: { name: { en: 'English', fr: 'Anglais' }, flag: '🇬🇧', locale: 'en-GB' },
  fr: { name: { en: 'French', fr: 'Français' }, flag: '🇫🇷', locale: 'fr-FR' },
  es: { name: { en: 'Spanish', fr: 'Espagnol' }, flag: '🇪🇸', locale: 'es-ES' },
  it: { name: { en: 'Italian', fr: 'Italien' }, flag: '🇮🇹', locale: 'it-IT' },
  de: { name: { en: 'German', fr: 'Allemand' }, flag: '🇩🇪', locale: 'de-DE' },
  pt: { name: { en: 'Portuguese (Brazil)', fr: 'Portugais (Brésil)' }, flag: '🇧🇷', locale: 'pt-BR' },
  nl: { name: { en: 'Dutch', fr: 'Néerlandais' }, flag: '🇳🇱', locale: 'nl-NL' },
  ja: { name: { en: 'Japanese', fr: 'Japonais' }, flag: '🇯🇵', locale: 'ja-JP' },
  el: { name: { en: 'Greek', fr: 'Grec' }, flag: '🇬🇷', locale: 'el-GR' },
  tr: { name: { en: 'Turkish', fr: 'Turc' }, flag: '🇹🇷', locale: 'tr-TR' },
  pl: { name: { en: 'Polish', fr: 'Polonais' }, flag: '🇵🇱', locale: 'pl-PL' },
}

export const HOME_LANGS: HomeLang[] = ['en', 'fr']
export const MAX_BOARD = 24

export interface Phrase {
  id: string
  cat: Category
  text: Record<Lang, string>
  // pron[target][reader]: how `target` text sounds, spelled for a `reader`-language speaker
  pron: Record<Lang, Partial<Record<HomeLang, string>>>
}

// Row order: en, en for fr reader | fr, fr for en reader | es, en reader, fr reader | it, ... | de, ...
function p(
  id: string, cat: Category,
  en: string, enFr: string,
  fr: string, frEn: string,
  es: string, esEn: string, esFr: string,
  it: string, itEn: string, itFr: string,
  de: string, deEn: string, deFr: string,
): Phrase {
  const text = { en, fr, es, it, de } as Record<Lang, string>
  const pron = {
    en: { fr: enFr },
    fr: { en: frEn },
    es: { en: esEn, fr: esFr },
    it: { en: itEn, fr: itFr },
    de: { en: deEn, fr: deFr },
  } as Phrase['pron']
  for (const [lang, pack] of Object.entries(PACKS) as [PackLang, Record<string, [string, string, string]>][]) {
    const entry = pack[id]
    if (!entry) {
      console.error(`Pack "${lang}" is missing phrase "${id}"`)
      continue
    }
    text[lang] = entry[0]
    pron[lang] = { en: entry[1], fr: entry[2] }
  }
  return { id, cat, text, pron }
}

export const PHRASES: Phrase[] = [
  p('idiot', 'insult',
    "You're an idiot.", 'yor ann i-di-eutt',
    "T'es un idiot.", 'tay uhn ee-DYOH',
    'Eres un idiota.', 'EH-res oon ee-DYOH-tah', 'é-rèss oune i-dio-ta',
    'Sei un idiota.', 'say oon ee-DYOH-tah', 'seï oune i-dio-ta',
    'Du bist ein Idiot.', 'doo bist ine ee-DYOHT', 'dou bist aïne i-di-ôte'),
  p('shut-up', 'insult',
    'Shut up!', 'cheut eup',
    'Ferme-la !', 'fairm-LAH',
    '¡Cállate!', 'KAH-yah-teh', 'ka-ya-té',
    'Stai zitto!', 'sty TSEET-toh', 'staï tsit-to',
    'Halt die Klappe!', 'hahlt dee KLAH-peh', 'halt di kla-peu'),
  p('get-lost', 'insult',
    'Get lost!', 'guète lost',
    'Dégage !', 'day-GAHZH',
    '¡Lárgate!', 'LAR-gah-teh', 'lar-ga-té',
    'Sparisci!', 'spah-REE-shee', 'spa-ri-chi',
    'Hau ab!', 'how AHP', 'haou ap'),
  p('useless', 'insult',
    "You're useless.", 'yor iouss-less',
    "T'es nul.", 'tay NUUL',
    'Eres un inútil.', 'EH-res oon ee-NOO-teel', 'é-rèss oune i-nou-til',
    'Sei un incapace.', 'say oon een-kah-PAH-cheh', 'seï oune inn-ka-pa-tché',
    'Du bist nutzlos.', 'doo bist NOOTS-lohs', 'dou bist noutss-lôss'),
  p('jerk', 'insult',
    'What a jerk!', 'ouate e djeurk',
    'Quel abruti !', 'kel ah-broo-TEE',
    '¡Qué imbécil!', 'keh eem-BEH-seel', 'ké im-bé-sil',
    'Che cretino!', 'keh kreh-TEE-noh', 'ké cré-ti-no',
    'Was für ein Depp!', 'vahs fuer ine DEP', 'vass fur aïne dèp'),
  p('grandma', 'insult',
    'You drive like a grandma.', 'you draïve laïk e grann-ma',
    'Tu conduis comme une mamie.', 'tu kon-DWEE kom oon mah-MEE',
    'Conduces como una abuela.', 'kon-DOO-ses KOH-moh OO-nah ah-BWEH-lah', 'kone-dou-sèss ko-mo ou-na a-boué-la',
    'Guidi come una nonna.', 'GWEE-dee KOH-meh OO-nah NON-nah', 'goui-di ko-mé ou-na no-na',
    'Du fährst wie eine Oma.', 'doo fairst vee EYE-neh OH-mah', 'dou fèrst vi aï-neu ô-ma'),
  p('kidding', 'insult',
    'Are you kidding me?', 'ar you ki-dinng mi',
    'Tu te fous de moi ?', 'tu tuh foo duh MWAH',
    '¿Me estás tomando el pelo?', 'meh es-TAHS toh-MAHN-doh el PEH-loh', 'mé ès-tass to-mann-do èl pé-lo',
    'Mi prendi in giro?', 'mee PREN-dee een JEE-roh', 'mi prèn-di inn dji-ro',
    'Willst du mich veräppeln?', 'vilst doo mikh fair-EP-eln', 'vilst dou mich fèr-è-peuln'),
  p('goldfish', 'insult',
    'You have the brain of a goldfish.', 'you hav ze brèïne ov e gôld-fich',
    "T'as un cerveau de poisson rouge.", 'tah uhn sair-VOH duh pwah-SOHN ROOZH',
    'Tienes cerebro de pez.', 'TYEH-nes seh-REH-broh deh PES', 'tié-nèss sé-ré-bro dé pèss',
    'Hai il cervello di un pesce rosso.', 'eye eel cher-VEL-loh dee oon PEH-sheh ROS-soh', 'aï il tchèr-vèl-lo di oune pé-ché ros-so',
    'Du hast das Gehirn eines Goldfischs.', 'doo hahst dahs geh-HEERN EYE-nes GOLT-fishs', 'dou hast dass gué-hirn aï-nèss golt-fichs'),
  p('business', 'insult',
    'Mind your own business.', 'maïnd yor ône biz-nèss',
    'Occupe-toi de tes oignons.', 'oh-koop-TWAH duh tay zoh-NYOHN',
    'Métete en tus asuntos.', 'MEH-teh-teh en toos ah-SOON-tohs', 'mé-té-té èn touss a-soun-toss',
    'Fatti gli affari tuoi.', 'FAHT-tee lyee ahf-FAH-ree TWOY', 'fat-ti lyi af-fa-ri tou-oï',
    'Kümmer dich um deinen eigenen Kram.', 'KUEM-mer dikh oom DYE-nen EYE-geh-nen KRAHM', 'ku-meur dich oum daï-neun aï-gueu-neun krâm'),
  p('pain', 'insult',
    "You're a pain in the neck.", 'yor e pèïne inn ze nèk',
    "T'es un casse-pieds.", 'tay uhn kahs-PYAY',
    'Eres un pesado.', 'EH-res oon peh-SAH-doh', 'é-rèss oune pé-sa-do',
    'Sei un rompiscatole.', 'say oon rom-pee-SKAH-toh-leh', 'seï oune rom-pi-ska-to-lé',
    'Du bist eine Nervensäge.', 'doo bist EYE-neh NAIR-fen-zay-geh', 'dou bist aï-neu nèr-feun-zè-gueu'),
  p('rip-off', 'insult',
    'This is a rip-off!', 'zis iz e ri-pof',
    "C'est de l'arnaque !", 'say duh lar-NAHK',
    '¡Esto es una estafa!', 'ES-toh es OO-nah es-TAH-fah', 'ès-to èss ou-na ès-ta-fa',
    'Questa è una fregatura!', 'KWES-tah eh OO-nah freh-gah-TOO-rah', 'kouès-ta è ou-na fré-ga-tou-ra',
    'Das ist Abzocke!', 'dahs ist AHP-tsok-eh', 'dass ist ap-tso-keu'),
  p('coffee', 'insult',
    'Your coffee tastes like dishwater.', 'yor ko-fi tèïsts laïk dich-ouo-teur',
    "Ton café, c'est du jus de chaussette.", 'tohn kah-FAY say du zhoo duh shoh-SET',
    'Tu café sabe a agua sucia.', 'too kah-FEH SAH-beh ah AH-gwah SOO-syah', 'tou ka-fé sa-bé a a-goua sou-sia',
    'Il tuo caffè sa di acqua sporca.', 'eel TOO-oh kahf-FEH sah dee AHK-kwah SPOR-kah', 'il tou-o kaf-fè sa di a-koua spor-ka',
    'Dein Kaffee schmeckt wie Spülwasser.', 'dine KAH-feh shmekt vee SHPUEL-vah-ser', 'daïne ka-fé chmèkt vi chpul-va-seur'),
  p('lake', 'insult',
    'Go jump in a lake!', 'gô djeump inn e lèïk',
    'Va te faire cuire un œuf !', 'vah tuh fair KWEER uhn UHF',
    '¡Vete a freír espárragos!', 'VEH-teh ah freh-EER es-PAH-rah-gohs', 'vé-té a fré-ir ès-pa-ra-goss',
    'Vai a quel paese!', 'vye ah kwel pah-EH-zeh', 'vaï a kouèl pa-é-zé',
    'Geh dahin, wo der Pfeffer wächst!', 'gay dah-HIN voh dair PFEF-fer vekst', 'gué da-hine vo dèr pfè-feur vèkst'),
  p('wet-dog', 'insult',
    'You smell like a wet dog.', 'you smèl laïk e ouèt dog',
    'Tu sens le chien mouillé.', 'tu sahn luh SHYEHN moo-YAY',
    'Hueles a perro mojado.', 'WEH-les ah PEH-rroh moh-HAH-doh', 'oué-lèss a pé-rro mo-rha-do',
    'Puzzi di cane bagnato.', 'POOT-tsee dee KAH-neh bahn-YAH-toh', 'pou-tsi di ka-né ba-gna-to',
    'Du riechst nach nassem Hund.', 'doo reekhst nahkh NAHS-sem HOONT', 'dou richst narh na-seum hount'),
  p('nobody-asked', 'insult',
    'Nobody asked you.', 'nô-bo-di askt you',
    "Personne t'a rien demandé.", 'pair-SON tah ryehn duh-mahn-DAY',
    'Nadie te ha preguntado.', 'NAH-dyeh teh ah preh-goon-TAH-doh', 'na-dié té a pré-goun-ta-do',
    "Nessuno te l'ha chiesto.", 'nes-SOO-noh teh lah KYES-toh', 'nès-sou-no té la kiès-to',
    'Dich hat keiner gefragt.', 'dikh haht KYE-ner geh-FRAHKT', 'dich hat kaï-neur gué-frâkt'),
  p('clown', 'insult',
    'You clown!', 'you klaoun',
    'Espèce de clown !', 'es-PES duh KLOON',
    '¡Payaso!', 'pah-YAH-soh', 'pa-ya-so',
    'Pagliaccio!', 'pahl-YAH-choh', 'pa-lia-tcho',
    'Du Clown!', 'doo KLOWN', 'dou klaoun'),

  p('hello', 'basic',
    'Hello', 'hè-lô',
    'Bonjour', 'bohn-ZHOOR',
    'Hola', 'OH-lah', 'o-la',
    'Ciao', 'CHOW', 'tchao',
    'Hallo', 'HAH-loh', 'ha-lo'),
  p('thanks', 'basic',
    'Thank you', 'sènk you',
    'Merci', 'mair-SEE',
    'Gracias', 'GRAH-syahs', 'gra-siass',
    'Grazie', 'GRAHT-tsyeh', 'gra-tsié',
    'Danke', 'DAHN-keh', 'dann-keu'),
  p('sorry', 'basic',
    'Sorry', 'so-ri',
    'Pardon', 'par-DOHN',
    'Perdón', 'pair-DOHN', 'pèr-done',
    'Mi scusi', 'mee SKOO-zee', 'mi skou-zi',
    'Entschuldigung', 'ent-SHOOL-dee-goong', 'ènt-choul-di-goung'),
  p('bathroom', 'basic',
    'Where is the bathroom?', 'ouèr iz ze bass-roum',
    'Où sont les toilettes ?', 'oo sohn lay twah-LET',
    '¿Dónde está el baño?', 'DOHN-deh es-TAH el BAHN-yoh', 'donn-dé ès-ta èl ba-gno',
    "Dov'è il bagno?", 'doh-VEH eel BAHN-yoh', 'do-vè il ba-gno',
    'Wo ist die Toilette?', 'voh ist dee twah-LET-teh', 'vo ist di toua-lè-teu'),
  p('how-much', 'basic',
    'How much is it?', 'haou meutch iz it',
    "C'est combien ?", 'say kohm-BYEHN',
    '¿Cuánto cuesta?', 'KWAHN-toh KWES-tah', 'kouann-to kouès-ta',
    'Quanto costa?', 'KWAHN-toh KOS-tah', 'kouann-to kos-ta',
    'Was kostet das?', 'vahs KOS-tet dahs', 'vass kos-tèt dass'),
  p('beer', 'basic',
    'A beer, please.', 'e bir, pliz',
    "Une bière, s'il vous plaît.", 'oon BYAIR seel voo PLAY',
    'Una cerveza, por favor.', 'OO-nah sair-VEH-sah por fah-VOR', 'ou-na sèr-vé-sa por fa-vor',
    'Una birra, per favore.', 'OO-nah BEER-rah pair fah-VOH-reh', 'ou-na bi-rra pèr fa-vo-ré',
    'Ein Bier, bitte.', 'ine BEER BIT-teh', 'aïne bir, bi-teu'),
  p('understand', 'basic',
    "I don't understand.", 'aï dônt eun-deur-stènd',
    'Je ne comprends pas.', 'zhuh nuh kohm-PRAHN pah',
    'No entiendo.', 'noh en-TYEN-doh', 'no èn-tièn-do',
    'Non capisco.', 'non kah-PEES-koh', 'none ka-pis-ko',
    'Ich verstehe nicht.', 'ikh fair-SHTAY-eh nikht', 'ich fèr-chté-eu nicht'),
  p('check', 'basic',
    'The check, please.', 'ze tchèk, pliz',
    "L'addition, s'il vous plaît.", 'lah-dee-SYOHN seel voo PLAY',
    'La cuenta, por favor.', 'lah KWEN-tah por fah-VOR', 'la kouèn-ta por fa-vor',
    'Il conto, per favore.', 'eel KON-toh pair fah-VOH-reh', 'il konn-to pèr fa-vo-ré',
    'Die Rechnung, bitte.', 'dee REKH-noong BIT-teh', 'di rèch-noung, bi-teu'),
]

export const PHRASE_BY_ID = new Map(PHRASES.map((ph) => [ph.id, ph]))
export const DEFAULT_BOARD = ['idiot', 'shut-up', 'grandma', 'goldfish', 'lake', 'beer']
