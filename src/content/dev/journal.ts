import type { ErrandDef, JournalEntry } from '../schema';

/**
 * The journal is the game's Pokédex: four kinds of page, filled by noticing.
 * Nani's 1974 entries sit above yours in a faded hand; some pages she never
 * reached, and the blank space is deliberate.
 */

export const JOURNAL: JournalEntry[] = [
  // ---- words ----
  {
    id: 'words.allillanchu',
    tab: 'words',
    title: 'Allillanchu',
    sub: '"Are you well?" The everyday greeting.',
    nani: 'Say it to everyone you pass. Even the dogs.',
    you: 'Aurelio says I pronounced it like a sneeze. He answered anyway: allillanmi. Just fine.',
  },
  {
    id: 'words.sulpayki',
    tab: 'words',
    title: 'Sulpayki',
    sub: 'Thank you.',
    nani: 'From "may God repay you," worn smooth like a river stone.',
    you: 'Rosa would not take my coins. Sulpayki turned out to be the correct currency.',
  },
  {
    id: 'words.wawa',
    tab: 'words',
    title: 'Wawa',
    sub: 'Baby. Also anyone an auntie decides to love.',
    you: 'Justina called me wawa. I am fully grown. I did not correct her.',
  },
  {
    id: 'words.chaska',
    tab: 'words',
    title: "Ch'aska",
    sub: 'Star. The village name means "star plain."',
    nani: 'On clear nights the pampa doubles the sky.',
    you: 'Aurelio says the plain catches stars when it rains. I checked. Puddles, everywhere, all shining.',
  },
  {
    id: 'words.lliclla',
    tab: 'words',
    title: 'Lliclla',
    sub: 'The woven cloth carried on the shoulders.',
    you: "Carmen is weaving one for a granddaughter in Lima. The zigzag is the river. The river is also the sky.",
  },
  {
    id: 'words.haku',
    tab: 'words',
    title: 'Haku!',
    sub: '"Let\'s go!" The most useful word in the language.',
    nani: 'Everything here begins with somebody shouting haku.',
    you: "Teófilo shouts it, then lets his knees veto it. The word still counts, he says. The word is the going.",
  },
  {
    id: 'words.sumaq',
    tab: 'words',
    title: 'Sumaq',
    sub: 'Beautiful. Also delicious. One word, on purpose.',
    you: 'Carmen held up the half-woven lliclla and said sumaq. Then she said it again about the soup. Both times she was right.',
  },
  {
    id: 'words.tomakusunchis',
    tab: 'words',
    title: 'Tomakusunchis',
    sub: '"Let us drink together." Never just "drink."',
    nani: 'Nobody here drinks alone. The word will not allow it.',
    you: 'I carried a full glass across the whole room to earn this word. The floor got none of it. Teófilo checked.',
  },

  // ---- dishes ----
  {
    id: 'dishes.mote',
    tab: 'dishes',
    title: 'Mote',
    sub: 'Fat corn kernels, boiled soft, eaten by the handful.',
    nani: 'Good for the road. Better for the waiting.',
    you: 'Rosa poured some into my pocket like it was nothing. My pocket disagrees.',
  },
  {
    id: 'dishes.chicha',
    tab: 'dishes',
    title: 'Chicha de jora',
    sub: 'Corn beer, faintly sour, still alive in the glass.',
    nani: 'A red flag over a door means the batch is fresh. Follow the flag.',
    you: 'The first splash goes to the ground, for Pachamama. Always the first one.',
  },
  {
    id: 'dishes.papa',
    tab: 'dishes',
    title: 'Papa',
    sub: 'Not "potato." Hundreds of named kinds.',
    you: 'One variety is called llumchuy waqachi: "makes the daughter-in-law cry." It is knobbly on purpose. The jokes here are long games.',
  },
  {
    id: 'dishes.watia',
    tab: 'dishes',
    title: 'Watia',
    sub: 'An oven built from the field itself.',
    nani: 'Clods stacked into a little dome, fired until they glow, then collapsed over the harvest.',
    you: 'Justina says the earth bakes its own potatoes and asks nothing for it except the first bite.',
  },
  {
    id: 'dishes.llumchuy',
    tab: 'dishes',
    title: 'Llumchuy waqachi',
    sub: '"Makes the daughter-in-law cry." A potato, and a test.',
    nani: 'It made me cry. I peeled it badly on purpose the second time.',
    you: 'Dug one up myself. Knobbly as a fist of knuckles. Justina watched me hold it and laughed for a full minute.',
  },

  // ---- people ----
  {
    id: 'people.aurelio',
    tab: 'people',
    title: 'Don Aurelio',
    sub: 'Sits by the well. In no hurry, ever.',
    nani: 'There is an old man at the well who asks about your sleep before your name.',
    you: 'Fifty years later there is still an old man at the well. It cannot be the same one. I have not ruled it out.',
  },
  {
    id: 'people.rosa',
    tab: 'people',
    title: 'Rosa Quispe',
    sub: 'Keeps the chichería under the red flag.',
    you: 'Feeds strangers on sight. Refuses money like it is a strange beetle. Collects favors instead, and pays them forward uphill.',
  },
  {
    id: 'people.justina',
    tab: 'people',
    title: 'Justina Quispe',
    sub: "Rosa's sister. Works the terraces.",
    you: 'Talks the way the stream runs, constantly and mostly downhill. Raised by Rosa after their mother went to Lima.',
  },
  {
    id: 'people.mateo',
    tab: 'people',
    title: 'Mateo',
    sub: 'Youngest person still in the village, and aware of it.',
    you: 'Climbs the ridge for phone signal. Says from up there the pampa looks full. I think he climbs for the view.',
  },
  {
    id: 'people.carmen',
    tab: 'people',
    title: 'Doña Carmen',
    sub: 'Weaves in her courtyard, facing the morning sun.',
    you: 'Her backstrap loom is tied to a post; the other end is tied to her. She says the tension is the point.',
  },
  {
    id: 'people.teofilo',
    tab: 'people',
    title: 'Don Teófilo',
    sub: 'Holds down the far table at the chichería.',
    nani: 'There is a young man at the chichería who laughs before the joke.',
    you: 'There is an old man at the chichería who laughs before the joke. I have questions about time.',
  },
  {
    id: 'people.nani',
    tab: 'people',
    title: 'Nani',
    sub: 'Zoila. 1974. She started this.',
    you: 'She sat at the same well, misheard the same words, carried bundles up the same hill. The journal was never half finished. It was waiting.',
  },
  {
    id: 'people.allqu',
    tab: 'people',
    title: 'The Dog',
    sub: 'Allqu: dog. This one in particular.',
    nani: 'Say it to everyone you pass. Even the dogs.',
    you: 'I said allillanchu to a dog, as instructed. The dog took it as a job offer. We work together now.',
  },
  {
    id: 'people.faustino',
    tab: 'people',
    title: 'Faustino',
    sub: 'Arriero. Walks roads for a living, all of them.',
    you: 'Knows every pass by its wind. Says the roads run down and down until the air gets thick and the sea starts talking. I intend to check.',
  },
  {
    id: 'people.pilar',
    tab: 'people',
    title: 'Pilar',
    sub: 'Nine. Toll collector, entrepreneur, mayor-elect of the bridge.',
    nani: 'There is always one child running the village. Find her early and pay whatever she asks.',
    you: 'Her toll is one interesting fact. I am a lifetime member, a co-owner, and somehow responsible for the expenses. The dog is security.',
  },
  {
    id: 'people.chasca',
    tab: 'people',
    title: 'Chasca',
    sub: 'Photographs the roads. Somebody should.',
    you: 'She made me say papas at the exact moment I first saw the sea. The picture will show a person mid-astonishment. Accurate, then.',
  },

  // ---- customs ----
  {
    id: 'customs.ayni',
    tab: 'customs',
    title: 'Ayni',
    sub: 'Help is a loan between equals, never a purchase.',
    nani: 'I offered money for kindness. Once.',
    you: "Rosa's silence taught me the exchange rate. Soup costs one carried bundle, paid uphill.",
  },
  {
    id: 'customs.warmup',
    tab: 'customs',
    title: 'The slow greeting',
    sub: 'Sleep, family, rain. Then, and only then, business.',
    nani: 'The fastest way here is slowly.',
    you: 'I asked Aurelio one question and answered four of his first. My question improved while it waited.',
  },
  {
    id: 'customs.chullu',
    tab: 'customs',
    title: 'The chullu',
    sub: 'The earflap hat. The men knit them.',
    you: "Mateo's grandfather knits faster than Mateo texts. A tight-knit chullu holds water; a suitor's gets tested.",
  },
  {
    id: 'customs.challar',
    tab: 'customs',
    title: 'The first splash',
    sub: 'Before you drink, the earth drinks.',
    nani: 'I drank mine straight down. The whole room found this very funny.',
    you: 'So did I. So did the whole room. Fifty years apart, the same laugh. The splash goes to Pachamama first, always.',
  },
  {
    id: 'customs.pallay',
    tab: 'customs',
    title: 'Pallay',
    sub: 'The patterns picked into the cloth, held only in memory.',
    you: 'Carmen reads her mother in a border, her village in a color. Nothing is written down. Everything is written in. She let me weave a row. It is the crooked one. She says that makes it mine.',
  },
  {
    id: 'customs.apacheta',
    tab: 'customs',
    title: 'The apacheta',
    sub: 'A cairn at the pass. Every traveler adds a stone.',
    nani: 'I put a stone on it going out. I meant to take a different road home.',
    you: 'I added mine on top of fifty years of strangers. The pile knows more geography than any map.',
  },
  {
    id: 'customs.kintu',
    tab: 'customs',
    title: "The k'intu",
    sub: 'Three perfect coca leaves, offered and received with both hands.',
    nani: 'Take it with both hands. I learned that with one.',
    you: 'So did I. Faustino just waited, holding it out, until my second hand caught up with my manners.',
  },

  // ---- her ----
  // The Her tab carries no Nani column on purpose: these pages are not what
  // she wrote, they are what she left behind in other people.
  {
    id: 'her.chaska',
    tab: 'her',
    title: 'The half warp',
    sub: 'Doña Carmen, at the loom. Still annoyed, fifty years on.',
    you: 'Her name is Zoila. She left in the night with her half of a warp tied off and a note on the post, and Carmen kept the rest of it two years before using it up.',
  },
];

export const JOURNAL_BY_ID = new Map(JOURNAL.map((e) => [e.id, e]));

/**
 * The living task list: every open thread the player might be holding,
 * derived from flags, in priority order. All matching entries show in the
 * journal's Tasks tab; the first one becomes the HUD chip. Written as
 * directions a villager would give, not quest-log bark.
 */
export const TASKS: { when: { has?: string[]; not?: string[] }; text: string }[] = [
  {
    when: { has: ['carry.chicha'] },
    text: "You are carrying Teófilo's caporal, full to the brim. It goes INTO the chichería: Rosa's house under the red flag, south side of the village. Walk gently; three bumps and the floor drinks it.",
  },
  {
    when: { has: ['chicha.spilled'] },
    text: 'The caporal is empty and the floor is very pleased with itself. Ask Rosa for a refill and try again, slower.',
  },
  {
    when: { has: ['errand.rosa-bundle'], not: ['bundle.delivered'] },
    text: "Rosa's bundle goes to her sister Justina, up in the potato terraces at the village's southeast corner.",
  },
  {
    when: { has: ['dig.invite'], not: ['dig.done'] },
    text: 'Justina pointed out glinting mounds among the terrace rows. Dig every one; she promises each papa has a name worth hearing.',
  },
  {
    when: { has: ['watia.start'] },
    text: 'The watia is half-born among the rows: stack the clods into a little house, feed the fire until they glow, then bring the whole thing down on the papas.',
  },
  {
    when: { has: ['dig.done'], not: ['watia.start', 'watia.done'] },
    text: 'The harvest is out of the ground and Justina is eyeing the dry clods. She wants to build the watia with you in the terraces, while the papas still remember the soil.',
  },
  {
    when: { has: ['errand.carmen-wichuna'], not: ['wichuna.have'] },
    text: "Carmen's wichuna, a llama-bone weaving pick, is on loan to Justina in the terraces. Retrieve it.",
  },
  {
    when: { has: ['wichuna.have'], not: ['wichuna.returned'] },
    text: 'The wichuna is in your bag, wrapped like something precious. Bring it home to Doña Carmen, near the northeast house.',
  },
  {
    when: { has: ['wichuna.returned'], not: ['pallay.done'] },
    text: 'Carmen offered to sit you at the loom and call the colors. Go back when your hands feel steady.',
  },
  {
    when: { has: ['met.rosa'], not: ['errand.rosa-bundle', 'bundle.delivered'] },
    text: 'Rosa mentioned a bundle for her sister. Talk to her again before she rescinds the soup.',
  },
  {
    when: { has: ['bundle.delivered'], not: ['challar.done'] },
    text: 'People keep mentioning the chichería under the red flag. Step through the doorway of Rosa\'s house; someone inside has been holding a seat for forty years.',
  },
  {
    when: { has: ['bundle.delivered'], not: ['errand.carmen-wichuna', 'pallay.done'] },
    text: 'Doña Carmen, who weaves near the northeast house, has heard about your carrying legs. Go say allillanchu.',
  },
  {
    when: { has: ['pallay.done'], not: ['her.zoila'] },
    text: 'Doña Carmen went quiet at the end of the weaving, the way people do when they have decided to say something. Sit at her loom again.',
  },
  {
    when: {
      has: ['bundle.delivered', 'challar.done', 'pallay.done', 'her.zoila'],
      not: ['nani.letter'],
    },
    text: 'Don Aurelio has been watching you with a decision in his pocket. Sit with him at the well.',
  },
  {
    when: { has: ['errand.nani-letter'], not: ['story.complete'] },
    text: "Nani's letter wants opening at the east gate, past the terraces, where she meant to open it.",
  },
  {
    // The one documented stuck point: a llama wall with an off-screen key.
    when: { has: ['story.complete'], not: ['paca.moved'] },
    text: 'A llama holds the pass east of the village and is not persuaded by explanations. The muleteer on that road moves her daily; flag him down.',
  },
  {
    when: { has: ['story.complete'], not: ['c2.arrived'] },
    text: 'The east gate stands open: the pass, Paca, the switchbacks of La Bajada. The road runs all the way down now; there is a village at the bottom where the air smells of salt. Follow the descent to its end.',
  },
  {
    when: { not: ['met.rosa'] },
    text: 'Meet the village. Someone near the red-flag house is already ladling soup for you.',
  },
];

export const ERRANDS: ErrandDef[] = [
  { id: 'rosa-bundle', label: "Rosa's bundle, for Justina in the terraces" },
  { id: 'carmen-wichuna', label: "Carmen's wichuna, on loan to Justina" },
  { id: 'nani-letter', label: "Nani's unsent letter, for the road east" },
];

export const ERRAND_BY_ID = new Map(ERRANDS.map((e) => [e.id, e]));
