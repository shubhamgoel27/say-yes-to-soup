import type { JournalEntry, TaskDef } from '../schema';

/**
 * The backwater pages of Nani's journal. 1974: she came in on the spice road
 * and the monsoon caught her here. Her entries from Kerala are thoughtful,
 * slower, as if the rain got into her pacing.
 */

export const KERALA_JOURNAL: JournalEntry[] = [
  // ---------------- words ----------------
  {
    id: 'words.nanni',
    tab: 'words',
    title: 'Nanni',
    script: 'നന്ദി',
    sub: 'Thank you. The first Malayalam word I learned and the one I use least.',
    you: 'Mariamma taught it and then told me not to overuse it. Gratitude here is a verb with your hands, not a word with your mouth.',
  },
  {
    id: 'words.sukhamano',
    tab: 'words',
    title: 'Sukhamano?',
    script: 'സുഖമാണോ',
    sub: 'Are you well? Answered: sukham! Well.',
    nani: 'Sukhamano, they ask. Are you well. The answer is sukham, and by the time you have said it enough times, it is true.',
    you: 'Not small talk; a small treaty. Both sides agree to be well, and the day proceeds from there.',
  },
  {
    id: 'words.chetta',
    tab: 'words',
    title: 'Chetta, chechi',
    script: 'ചേട്ടാ',
    sub: 'Elder brother (chechi, ചേച്ചി: elder sister). The default address for anyone slightly older, related or not.',
    you: 'I said "Shaji chetta" once and was promoted from sir to mone on the spot. The whole village is relatives if you address it right.',
    rhyme: {
      with: 'words.causa',
      note: 'The coast called me causa, the backwater calls me chechi. Family words, handed to strangers on purpose.',
    },
  },
  {
    id: 'words.chaya',
    tab: 'words',
    title: 'Chaya',
    script: 'ചായ',
    sub: 'Tea, milky and pulled in a long arc to cool it. "Chaya kudikkam?" is the social handshake.',
    nani: 'A man threw tea a full meter through the air and did not look at it. I asked why. To cool it, he said, and because beauty is free.',
    you: 'Shaji pours short, notices, tops it up. The last splash is the message. Kattan, black and sweet, is the rain-watching version.',
    rhyme: {
      with: 'dishes.emoliente',
      note: 'A hot glass at odd hours, poured by someone who watched the street. Every coast invents this mercy.',
    },
  },
  {
    id: 'words.adipoli',
    tab: 'words',
    title: 'Adipoli',
    sub: 'Excellent. Top class. Appu’s rating system, license granted free.',
    you: 'Appu rates everything: the jetty (okay), his brother’s ship (adipoli), the first rain (ADIPOLI). It is a philosophy small enough to carry.',
  },

  // ---------------- dishes ----------------
  {
    id: 'dishes.puttu',
    tab: 'dishes',
    title: 'Puttu',
    script: 'പുട്ട്',
    sub: 'Steamed cylinders of rice flour and coconut, with kadala curry. Morning architecture.',
    you: 'It arrives standing up, like a small tower with a job. Black chickpeas alongside. Shaji says puttu is for the morning; the morning agrees.',
  },
  {
    id: 'dishes.parotta',
    tab: 'dishes',
    title: 'Parotta',
    script: 'പൊറോട്ട',
    sub: 'Maida dough beaten and coiled into flaky layers. Torn with the fingers, never cut.',
    you: 'It comes apart in ribbons, and tearing it is half the eating. Cutlery, says Shaji, is for people in a hurry to be elsewhere.',
  },
  {
    id: 'dishes.meencurry',
    tab: 'dishes',
    title: 'Meen curry',
    sub: 'Fish curry soured with kudampuli, smoked Malabar tamarind. Better on day two.',
    nani: 'The fish curry is better on the second day. So is the village, and so, I suspect, am I.',
    you: 'Mariamma’s pot rests overnight and thinks about it. Dark red, sour, absolute. Joseph crossed an ocean and still ranks it first.',
  },
  {
    id: 'dishes.sadya',
    tab: 'dishes',
    title: 'Sadya',
    script: 'സദ്യ',
    sub: 'The banana-leaf feast: rice, ten dishes, each with its place. Narrow end of the leaf points left.',
    nani: 'I was seated before a leaf and fed until mathi. It means enough. It took me four tries to say it and mean it.',
    you: 'I served it leaf by leaf: pickles up left, avial up right, rice last, right hand only. The leaf is a map, and the aunties are the cartographers.',
  },
  {
    id: 'dishes.payasam',
    tab: 'dishes',
    title: 'Payasam',
    script: 'പായസം',
    sub: 'The sweet finish: rice or vermicelli in milk and jaggery, poured onto the leaf.',
    you: 'Served last, straight onto the leaf, eaten by hand like everything else. Guests said mathi and held out their leaves anyway. Both were sincere.',
  },

  // ---------------- people ----------------
  {
    id: 'people.mariamma',
    tab: 'people',
    title: 'Mariamma',
    sub: 'Joseph’s mother. Reads letters aloud to the kitchen. Adopts travelers on sight.',
    you: 'She cried once at the letter and laughed twice, once at the umbrella. Then she made me family, which here is a single administrative step.',
  },
  {
    id: 'people.kuttan',
    tab: 'people',
    title: 'Kuttan',
    sub: 'Toddy tapper. Climbs sixty feet with a frog’s confidence, twice a day, forty years.',
    you: 'He calls the palm a colleague and the rain a relative. Kallu is sweet at dawn and sour by dark; he says most people are like that too.',
  },
  {
    id: 'people.shaji',
    tab: 'people',
    title: 'Shaji',
    sub: 'The thattukada. Kettle, griddle, awning, and the village’s news cycle.',
    you: 'Pulls chaya in a meter-long arc, three jobs with one wrist. Promoted me from sir to mone the day I earned chetta. The bench remembers.',
  },
  {
    id: 'people.omana',
    tab: 'people',
    title: 'Omana',
    sub: 'Coir cooperative: eleven women, one ledger, endless golden rope.',
    you: 'Rolls rope out of husk against her thigh while explaining that patience is the raw material. The rope holds boats; the ledger holds the eleven.',
  },
  {
    id: 'people.librarian',
    tab: 'people',
    title: 'Divakaran Master',
    sub: 'Keeper of the reading room: one fan, four newspapers, fair arguments.',
    you: 'Quietly proud of a quiet room where laborers argue poetry and football before lunch. He keeps the fan going; the village does the thinking.',
  },

  // ---------------- customs ----------------
  {
    id: 'customs.monsoon',
    tab: 'customs',
    title: 'Edavappathi',
    sub: 'The monsoon’s arrival, around the first of June. Not weather; a relative who keeps the promised day.',
    nani: 'The first rain hit the tile roofs like applause for no one. Everyone came out to hear it anyway.',
    you: 'I planned around the rain. The village plans with it: boats bailed, umbrellas at every door, kids running OUT of cover. I stood in it and understood.',
  },
  {
    id: 'customs.vallamkali',
    tab: 'customs',
    title: 'Vallam kali',
    sub: 'Snake-boat racing. A chundan vallam seats a hundred rowers; the vanchipattu song is the engine.',
    you: 'Singer calls, crew answers, oars strike on the word. Miss the beat and you row alone; nobody rows alone for long. I have a seat number now.',
    rhyme: {
      with: 'customs.wachaque',
      note: 'A boat a hundred rowers long, a pond dug by every hand in the village. Some things are too big to be owned, so they are kept.',
    },
  },
  {
    id: 'customs.readingroom',
    tab: 'customs',
    title: 'The reading room',
    sub: 'The grandhasala: every village has one. A room where anyone can read, and therefore argue.',
    nani: 'The first rain caught me on the path and a reading room took me in. I dried off between a newspaper argument and a shelf of poets.',
    you: 'One room, one fan, whole generations of letters. Travelers have signed the register for fifty years; I looked for her name a long time.',
  },
  {
    id: 'customs.pokkali',
    tab: 'customs',
    title: 'Pokkali',
    sub: 'Salt-tolerant rice in monsoon, prawns on the same field after. Rice feeds prawn; prawn feeds soil.',
    you: 'One flooded field, two harvests, zero chemicals. I walked the bund twice looking for the trick; there is no trick.',
  },
  {
    id: 'customs.headwobble',
    tab: 'customs',
    title: 'The head wobble',
    sub: 'A side-to-side tilt meaning yes, okay, I hear you. Looks exactly like no to the untrained.',
    you: 'I misread it once and nearly walked away from tomorrow’s puttu. Appu’s rule: head goes like a boat, the answer is yes. Head goes still, then worry.',
  },

  // ---------------- her ----------------
  {
    id: 'her.kerala',
    tab: 'her',
    title: 'Sukham, for two weeks',
    sub: 'Mariamma, who was asked once to keep it out of a letter, and kept it out of every letter.',
    you: 'There is a page in here about answering sukham until it is true. She wrote it in the fortnight Mariamma spent hearing her say it and knowing better. I have known her by her handwriting my whole life; that is not the same as knowing her.',
  },
];

/** Backwater loose threads; merged ahead of the earlier chapters' lists. */
export const KERALA_TASKS: TaskDef[] = [
  {
    when: { has: ['c6.arrived'], not: ['c6.letter.delivered'] },
    text: 'Joseph’s letter and parcel have crossed an ocean in your pocket. His mother Mariamma is up from the jetty, the veedu with the open door.',
  },
  {
    when: { has: ['c6.letter.delivered'], not: ['c6.letter.heard'] },
    text: 'The letter is in Mariamma’s hands and her eyes are already shining. Stay in the kitchen; some readings need a witness.',
  },
  {
    when: { has: ['c6.letter.delivered'], not: ['c6.chaya'] },
    text: 'Mariamma’s orders: chaya at Shaji’s thattukada, and tell him whose guest you are. The village will do the rest.',
  },
  {
    when: { has: ['errand.coir-rope'], not: ['c6.rope.given'] },
    text: 'Omana’s coil of good three-strand rides on your shoulder. Captain Varkey drills his crew on the bank by the vallams.',
  },
  {
    when: { has: ['c6.rope.given'], not: ['c6.row.done'] },
    text: 'Varkey’s chundan vallam is short one rower, and he has decided your hands will do. The song does the steering; you only have to be on time.',
  },
  {
    when: { has: ['c6.mariamma2', 'c6.chaya'], not: ['c6.sadya.ask'] },
    text: 'Something is bubbling in Mariamma’s kitchen besides the curry. Go back; the questions there are decorations.',
  },
  {
    when: { has: ['c6.sadya.ask'], not: ['c6.sadya.done'] },
    text: 'Sunday’s sadya needs serving hands: banana leaves, ten dishes, two aunties, one right hand. Mariamma’s kitchen, whenever you are ready.',
  },
  {
    when: { has: ['c6.cook.start'], not: ['c6.cook.done'] },
    text: 'Behind Shaji’s kettle: let the milk-tea boil at its own pace, then pull it high. Froth is the grade, and the counter forgives.',
  },
  {
    when: { has: ['page.words.chaya'], not: ['c6.cook.done'] },
    text: 'Shaji has been looking at your wrists like a coach. He thinks they are ready for the meter-long pour; report to the thattukada.',
  },
  {
    when: { has: ['c6.joseph.met'], not: ['c6.joseph.quizzed'] },
    text: 'Joseph is home, feet under his mother’s table, taking testimony about his own ship. Give your report; bring an appetite.',
  },
  {
    when: { has: ['c6.chaya'], not: ['c6.rain'] },
    text: 'Kuttan by the eastern palms keeps sniffing the air like it owes him news. Ask him what the sky is planning.',
  },
  {
    when: { has: ['c6.rain'], not: ['photo.c6.jetty'] },
    text: 'Chasca is at the end of the jetty under a big black umbrella, not one drop on her. The album wants you mid-downpour.',
  },
  {
    when: { has: ['c6.letter.delivered'], not: ['letter.read.kochi.pilar'] },
    text: 'Mail waits at the jetty office window, held under a tin of cardamom. One envelope looks suspiciously like an invoice.',
  },
  {
    when: { has: ['c6.row.done', 'c6.sadya.done', 'c6.rain'], not: ['c6.complete'] },
    text: 'Rowed, served, rained on. Go and stand in Mariamma’s kitchen; she will know what that adds up to before you do.',
  },
  {
    when: { has: ['c6.complete'] },
    text: 'Moosa has named you a train and a spice street in Delhi: Khari Baoli, three days north. Until then, Kaithappuram keeps your mornings.',
  },
  {
    when: { has: ['c6.arrived'], not: ['c6.complete'] },
    text: 'Kaithappuram is a spit of land between paddy and lagoon: the thattukada, the reading room, the coir yard, the palms. Walk it slowly; it notices.',
  },
];
