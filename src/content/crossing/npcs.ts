import type { EventNode, ExamineArm, LetterDef, NodeMap, NpcDef } from '../schema';

/**
 * The crew of the MV Yacana. A ship is a village of two dozen: the cook is
 * its heart, the bosun its weather, the captain its law. Taglish in the
 * galley, bells on the deck, one river of stars overhead with three names.
 * Rules unchanged: nobody lectures, the wrong branch is the warmer scene.
 */

export const CROSSING_NPCS: NpcDef[] = [
  {
    id: 'mangben',
    name: 'Mang Ben',
    map: 'galley',
    pos: [3, 2],
    range: 1,
    look: {
      skin: '#a06a42',
      hair: '#3d362e',
      cloth: '#e8e4d6',
      stripe: '#c1512f',
      hat: '#e8dcc4',
      hatStyle: 'none',
    },
    entry: [
      { when: { not: ['c3.met.ben'] }, node: 'c3.ben.first' },
      { when: { has: ['c3.met.ben'], not: ['c3.baon'] }, node: 'c3.ben.baon' },
      { when: { has: ['c3.baon'], not: ['c3.baon.done'] }, node: 'c3.ben.wait' },
      { when: { has: ['c3.baon.done'], not: ['c3.cook.done'] }, node: 'c3.ben.cookoffer' },
      { when: { has: ['c3.cook.done'], not: ['c3.shellback'] }, node: 'c3.ben.mess' },
      { when: { has: ['c3.shellback'], not: ['c3.feast'] }, node: 'c3.ben.feast' },
      { node: 'c3.ben.idle' },
    ],
  },
  {
    id: 'joseph',
    name: 'Joseph',
    map: 'ship',
    pos: [15, 11],
    range: 1,
    look: {
      skin: '#7a4a2e',
      hair: '#1c1410',
      cloth: '#d9694a',
      stripe: '#f2e6d0',
      hat: '#e8dcc4',
      hatStyle: 'none',
    },
    entry: [
      { when: { has: ['c3.baon'], not: ['c3.baon.done'] }, node: 'c3.jos.baon' },
      { when: { not: ['c3.met.joseph'] }, node: 'c3.jos.first' },
      { when: { has: ['c3.shellback'], not: ['joseph.letter'] }, node: 'c3.jos.entrust' },
      { when: { has: ['joseph.letter'] }, node: 'c3.jos.after' },
      { node: 'c3.jos.idle' },
    ],
  },
  {
    id: 'hana',
    name: 'Hana',
    map: 'ship',
    pos: [21, 5],
    range: 1,
    look: {
      skin: '#d9a878',
      hair: '#241a12',
      cloth: '#2c3e57',
      stripe: '#f2e6d0',
      hat: '#e8dcc4',
      hatStyle: 'none',
    },
    entry: [
      { when: { not: ['c3.met.hana'] }, node: 'c3.hana.first' },
      { when: { has: ['c3.met.hana'], not: ['c3.stars.done'] }, node: 'c3.hana.stars' },
      { when: { has: ['c3.stars.done'], not: ['c3.hana.tanabata'] }, node: 'c3.hana.words' },
      { node: 'c3.hana.idle' },
    ],
  },
  {
    id: 'olena',
    name: 'Olena',
    map: 'ship',
    pos: [27, 20],
    range: 1,
    look: {
      skin: '#dfb08a',
      hair: '#c98a3f',
      cloth: '#5c6e77',
      stripe: '#c9a35f',
      hat: '#e8dcc4',
      hatStyle: 'none',
    },
    entry: [
      { when: { not: ['c3.met.olena'] }, node: 'c3.olena.first' },
      { when: { has: ['c3.met.olena'], not: ['c3.olena.bread'] }, node: 'c3.olena.starter' },
      { when: { has: ['c3.olena.bread', 'c3.shellback'], not: ['c3.olena.dateline'] }, node: 'c3.olena.dateline' },
      { node: 'c3.olena.idle' },
    ],
  },
  {
    id: 'bosun',
    name: 'The Bosun',
    map: 'ship',
    pos: [22, 14],
    range: 2,
    look: {
      skin: '#8f5c38',
      hair: '#4a4038',
      cloth: '#3f7fb0',
      stripe: '#e8dcc4',
      hat: '#c9a35f',
      hatStyle: 'none',
    },
    entry: [
      { when: { not: ['c3.met.bosun'] }, node: 'c3.bosun.first' },
      { when: { has: ['c3.cook.done'], not: ['c3.wog'] }, node: 'c3.bosun.summons' },
      { when: { has: ['c3.wog'], not: ['c3.shellback'] }, node: 'c3.bosun.court' },
      { when: { has: ['c3.shellback'] }, node: 'c3.bosun.after' },
      { node: 'c3.bosun.idle' },
    ],
  },
  {
    // Her look is her look from La Caleta, exactly; a captain does not change.
    id: 'riosC3',
    name: 'Capitana Ríos',
    map: 'ship',
    pos: [22, 19],
    range: 0,
    look: {
      skin: '#c98f5e',
      hair: '#1c1410',
      cloth: '#2c3e57',
      stripe: '#e8dcc4',
      hat: '#2c3e57',
      hatStyle: 'montera',
    },
    entry: [
      { when: { has: ['c2.casero'], not: ['c3.met.rios'] }, node: 'c3.rios.first.casero' },
      { when: { not: ['c3.met.rios'] }, node: 'c3.rios.first' },
      { when: { has: ['c3.shellback'], not: ['letter.read.c3.pilar'] }, node: 'c3.rios.mail' },
      { when: { has: ['letter.read.c3.pilar'], not: ['letter.read.c3.petro'] }, node: 'c3.rios.mail2' },
      {
        when: {
          has: ['c3.cook.done', 'joseph.letter', 'c3.stars.done', 'c3.olena.bread', 'letter.read.c3.petro'],
          not: ['c3.complete'],
        },
        node: 'c3.rios.landfall',
      },
      { when: { has: ['c3.complete'] }, node: 'c3.rios.after' },
      { node: 'c3.rios.idle' },
    ],
  },
  {
    id: 'chascaC3',
    name: 'Chasca',
    map: 'ship',
    pos: [18, 15],
    range: 0,
    look: {
      skin: '#c98f5e',
      hair: '#241a12',
      cloth: '#8a4a7d',
      stripe: '#8fcbe8',
      hat: '#d9694a',
      hatStyle: 'montera',
      skirt: '#54708a',
    },
    entry: [
      { when: { not: ['c3.met.chasca'] }, node: 'c3.chasca.deck' },
      { node: 'c3.chasca.album' },
    ],
  },
];

export const CROSSING_NODES: NodeMap = {
  // ---------------- boarding and arrival ----------------
  'c3.board': {
    lines: [
      { text: 'The tide and the paperwork finally agree. The launch takes you out past the break to the anchored wall of the MV Yacana.' },
      { text: 'The goodbyes stay on the pier: fish, fog, one pelican with a criminal record. Then the ladder. Thirty rungs, each with an opinion.' },
    ],
    effects: ['travel:ship'],
  },
  'c3.arrive': {
    lines: [
      { text: 'A new deck underfoot, humming. Not a sound so much as a heartbeat too big to hear; the engine, four decks down, already at work.' },
      { text: 'Containers stand lashed in painted stacks like a steel bazaar. Aft, the white house watches everything with bridge-window eyes.' },
      { text: 'Somewhere below, someone is frying garlic. Thirty-one days to Japan, and it smells like the crossing might be edible.' },
    ],
    effects: ['set:c3.arrived'],
  },

  // ---------------- Capitana Ríos, la mar's own ----------------
  'c3.rios.first.casero': {
    lines: [
      { who: 'Capitana Ríos', text: 'So. Marisol calls you casero and Petro swears your hands are clean. Good enough for my galley; better than most paperwork.' },
      { who: 'Capitana Ríos', text: 'Mang Ben runs the galley, which means he runs the morale. Report to him. Whatever he says outranks whatever I say.' },
      { who: 'Capitana Ríos', text: 'La mar is generous this week. Enjoy that sentence while it is true.' },
    ],
    effects: ['set:c3.met.rios'],
    choices: [
      { text: '"La mar. Don Simón taught me to say it that way."', goto: 'c3.rios.lamar.knows', when: { has: ['page.words.lamar'] } },
      { text: 'Ask why she says la mar', goto: 'c3.rios.lamar' },
      { text: 'Go find the galley', goto: 'c3.rios.go' },
    ],
  },
  'c3.rios.first': {
    lines: [
      { text: 'The captain looks up from a clipboard. The clipboard appears to be losing.' },
      { who: 'Capitana Ríos', text: 'The galley hand. Petro vouched, so the village vouched, so here you are. A ship floats on that arithmetic as much as on steel.' },
      { who: 'Capitana Ríos', text: 'Mang Ben runs the galley, which means he runs the morale. Report to him. La mar is generous this week; help him keep it so.' },
    ],
    effects: ['set:c3.met.rios'],
    choices: [
      { text: '"La mar. Don Simón taught me to say it that way."', goto: 'c3.rios.lamar.knows', when: { has: ['page.words.lamar'] } },
      { text: 'Ask why she says la mar', goto: 'c3.rios.lamar' },
      { text: 'Go find the galley', goto: 'c3.rios.go' },
    ],
  },
  'c3.rios.lamar': {
    lines: [
      { who: 'Capitana Ríos', text: 'El mar is the thing on charts. La mar is the one who carries us, and could decline to. The ones she carries say it her way.' },
      { who: 'Capitana Ríos', text: 'Ninety-two crossings and I have never once said it wrong. Superstition is only respect with barnacles on it.' },
    ],
  },
  'c3.rios.lamar.knows': {
    lines: [
      { who: 'Capitana Ríos', text: 'Simón taught you on the pier, did he. Then you already know the first rule of my ship without me saying it.' },
      { who: 'Capitana Ríos', text: 'She is hard but fair. If you work, you eat. Out here that is not philosophy; it is the duty roster.' },
    ],
  },
  'c3.rios.go': {
    lines: [
      { who: 'Capitana Ríos', text: 'Through the house door, follow the garlic. And bus your own tray, or Ben will teach you the word for people who do not.' },
    ],
  },
  'c3.rios.mail': {
    lines: [
      { text: 'The captain produces a canvas sack gone soft at the corners. MAIL, it says, in stenciled letters that have crossed oceans.' },
      { who: 'Capitana Ríos', text: 'The agent in Callao threw the bundle aboard with the last launch. Mid-ocean, it finally surfaces. Two are for you.' },
      { who: 'Capitana Ríos', text: 'This one smells like an invoice. I did not ask.' },
    ],
    effects: ['letter:c3.pilar'],
  },
  'c3.rios.mail2': {
    lines: [
      { who: 'Capitana Ríos', text: 'There was a second envelope stuck to the first. Grease spot on the flap. In my experience, the better kind of letter.' },
    ],
    effects: ['letter:c3.petro'],
  },
  'c3.rios.landfall': {
    lines: [
      { who: 'Capitana Ríos', text: 'Ben feeds you, Joseph trusts you, the cadet lent you her sky, and even the engineer let you hold the jar. That is the whole ship.' },
      { who: 'Capitana Ríos', text: 'Land tomorrow. When you smell green, and the birds stop following and start leading, go stand at the bow.' },
      { who: 'Capitana Ríos', text: 'Ninety-two crossings and that moment still gets me. La mar hands you back. Do not miss it.' },
    ],
    effects: ['set:c3.complete'],
  },
  'c3.rios.after': {
    lines: [
      { who: 'Capitana Ríos', text: 'The Shionoura pilot boards at dawn. Until then the bow is yours. Say your goodbyes; a ship remembers who says them.' },
    ],
  },
  'c3.rios.idle': {
    lines: [
      { who: 'Capitana Ríos', text: 'Four on, eight off, and the paperwork stands its own watch. Go on. The deck is better company than I am today.' },
    ],
  },

  // ---------------- Mang Ben, the galley's heart ----------------
  'c3.ben.first': {
    lines: [
      { text: 'The galley frames a man mid-stir: three pots going, a towel over one shoulder like a sash of office.' },
      { who: 'Mang Ben', text: 'Ah, the new hands! Kain na, come and eat. Nobody stands in my doorway hungry; on this ship that is the entire constitution.' },
      { text: 'Rice, fried fish, and a mug of coffee strong enough to stand the spoon up. He watches you eat like it is the evening news.' },
      { who: 'Mang Ben', text: 'Mang Ben. Just Ben makes the bosun smirk, so use the Mang. Kumusta? No, eat first, answer after. House rule two.' },
    ],
    effects: ['set:c3.met.ben', 'journal:words.kainna', 'journal:people.ben', 'journal:dishes.galleycoffee'],
  },
  'c3.ben.baon': {
    lines: [
      { who: 'Mang Ben', text: 'Favor na, pare. Joseph has the watch and forgot his night lunch again. That boy remembers every rope aboard and zero meals.' },
      { text: 'He packs a covered plate and tucks the cloth around it the way you tuck a blanket around a child.' },
      { who: 'Mang Ben', text: 'Port rail, forward, where the chipping hammer is complaining. Walk it steady and it stays warm. Sige, go before the rice cools.' },
    ],
    effects: ['set:c3.baon', 'errand:ben-baon', 'set:errand.ben-baon'],
  },
  'c3.ben.wait': {
    lines: [
      { who: 'Mang Ben', text: 'Still aboard, still holding the plate? It is getting philosophical under that cloth, pare. Port rail, forward. Joseph.' },
    ],
  },
  'c3.ben.cookoffer': {
    lines: [
      { who: 'Mang Ben', text: 'Week three. The salad is a memory, the freezer is the whole harvest now, and the faces in my mess are getting long.' },
      { who: 'Mang Ben', text: 'So tonight: lutong bahay. Home cooking, the medicine kind. Adobo first; the dish every Filipino abroad learns before the alphabet.' },
      { who: 'Mang Ben', text: 'And sinigang after, sour soup for Joseph’s homesick face. Sour fish soup fixes sailors on every coast. Ask your captain.' },
    ],
    effects: ['journal:words.lutongbahay', 'journal:dishes.sinigang'],
    choices: [
      { text: 'Roll up your sleeves', goto: 'c3.ben.cookstart' },
      { text: 'Not yet; the deck first', goto: 'c3.ben.cooklater' },
    ],
  },
  'c3.ben.cookstart': {
    lines: [
      { who: 'Mang Ben', text: 'Sige! Apron on. I call the pot, you feed it. Wrong answers are allowed; that is exactly how my aunties taught me.' },
    ],
    effects: ['set:c3.cook.start'],
  },
  'c3.ben.cooklater': {
    lines: [
      { who: 'Mang Ben', text: 'The pot is patient and so am I. One of us is lying, pare. Come back hungry.' },
    ],
  },
  'c3.cooked': {
    lines: [
      { text: 'The pot settles, dark and glossy. Garlic, soy, vinegar and time: the whole argument reduces to one certain sauce.' },
      { who: 'Mang Ben', text: 'Masarap! When you hear that word across the mess tonight, remember you earned a piece of it. Adobo keeps; homesickness does not.' },
      { text: 'At dinner the mess is loud again. Joseph has two helpings of sinigang and no long face at all. Medicine, administered.' },
    ],
    effects: ['clear:c3.cook.start', 'set:c3.cook.done', 'journal:dishes.adobo', 'journal:words.masarap'],
  },
  'c3.ben.mess': {
    lines: [
      { who: 'Mang Ben', text: 'Hear the mess room tonight? Loud. The mess is the heart of the ship, pare, and that is a healthy heartbeat.' },
      { who: 'Mang Ben', text: 'Also: the bosun keeps looking at the chart and grinning. When a bosun grins, pollywogs should stretch first. I say no more.' },
    ],
  },
  'c3.ben.feast': {
    lines: [
      { who: 'Mang Ben', text: 'A shellback in my galley! Then hear the good news: the bosun’s birthday drowned in the dateline, so I am cooking pancit anyway.' },
      { who: 'Mang Ben', text: 'Long noodles, long life. You do not cut them, and you do not skip them just because Tuesday sank, pare.' },
      { who: 'Mang Ben', text: 'Take a plate when you go up. And ingat, ha? Take care. I say it to everyone who leaves my galley. It works; look at this crew.' },
    ],
    effects: ['set:c3.feast', 'journal:dishes.pancit', 'journal:words.ingat'],
  },
  'c3.ben.idle': {
    lines: [
      { who: 'Mang Ben', text: 'The fresh stores are finished, so now the freezer and the rice sack tell the story. Watch me make them interesting, pare.' },
    ],
  },

  // ---------------- Joseph, AB, Kerala ----------------
  'c3.jos.first': {
    lines: [
      { text: 'An AB works a chipping hammer along the rail, unhurried, as if he and the rust have reached an understanding.' },
      { who: 'Joseph', text: 'The new galley hands! Good. Twenty-three crew and the cook still needs more hands; that tells you who really runs this ship.' },
      { who: 'Joseph', text: 'Joseph. Able seaman, from Kerala, the backwaters near Kochi. Nine months aboard, three to go. My mother keeps the truer count.' },
    ],
    effects: ['set:c3.met.joseph', 'journal:people.joseph'],
  },
  'c3.jos.baon': {
    lines: [
      { who: 'Joseph', text: 'Ben sent the baon? Then you are my favorite person on this watch. Joseph, by the way. Able seaman, Kerala.' },
      { text: 'He eats standing at the rail, plate balanced like it grew there. Somewhere aft, the bell strikes twice, bright as a coin.' },
      { who: 'Joseph', text: 'Two bells. One strike for each half hour of the watch; at eight bells the watch is done and somebody gets to sleep. Sea arithmetic.' },
      { who: 'Joseph', text: 'Four hours on, eight off, around the clock. The whole ship sleeps in shifts so that she never has to.' },
    ],
    effects: [
      'set:c3.baon.done',
      'set:c3.met.joseph',
      'errand.done',
      'clear:errand.ben-baon',
      'journal:words.bells',
      'journal:customs.watches',
      'journal:people.joseph',
    ],
  },
  'c3.jos.entrust': {
    lines: [
      { who: 'Joseph', text: 'A word, friend. You land in Japan and keep going; from there, ships run everywhere. Mine runs the wrong way first.' },
      { text: 'From inside his jacket: a letter gone soft at the folds, and a small cloth bundle knotted with more care than any lashing on deck.' },
      { who: 'Joseph', text: 'For my mother. Mariamma, in the backwaters near Kochi; every boatman knows the house. The letter says what letters say.' },
      { who: 'Joseph', text: 'If your road ever bends through Kerala, carry them to her. If it does not, carry them anyway. Roads listen when you hold something.' },
    ],
    choices: [
      { text: 'Take the letter and the bundle', goto: 'c3.jos.entrust.yes' },
      { text: '"What is in the bundle?"', goto: 'c3.jos.entrust.what' },
    ],
  },
  'c3.jos.entrust.what': {
    lines: [
      { who: 'Joseph', text: 'Sandalwood soap, and a photograph of this ship. She will scold the soap for its price and frame the photograph. Mothers.' },
    ],
    next: 'c3.jos.entrust.yes',
  },
  'c3.jos.entrust.yes': {
    lines: [
      { text: 'The letter and the bundle settle into your pack beside Nani’s journal, as if the three of them had traveled together before.' },
      { who: 'Joseph', text: 'Amma will feed you until you surrender, you know. That is the delivery fee. I apologize in advance and not sincerely.' },
    ],
    effects: ['set:joseph.letter'],
  },
  'c3.jos.after': {
    lines: [
      { who: 'Joseph', text: 'Three months more and I follow my own letter home. Take the slow road, friend, so I win the race to my own kitchen.' },
    ],
  },
  'c3.jos.idle': {
    lines: [
      { who: 'Joseph', text: 'Rust never sleeps, so the chipping hammer cannot either. Honest work. The sea just permanently disagrees with it.' },
    ],
  },

  // ---------------- Hana, cadet, bound for Shionoura ----------------
  'c3.hana.first': {
    lines: [
      { text: 'A young officer in cadet coveralls leans at the bow rail, logging seabirds in a notebook far too neat for this wind.' },
      { who: 'Hana', text: 'Oh! Hello. Hana. Deck cadet, first contract, and in twelve days I will see my own harbor from a bridge wing. Shionoura.' },
      { who: 'Hana', text: 'My grandmother keeps an inn there. I have timed my whole life to be home for Tanabata, the star festival. Seventh day, seventh month.' },
    ],
    effects: ['set:c3.met.hana', 'journal:people.hana'],
  },
  'c3.hana.stars': {
    lines: [
      { who: 'Hana', text: 'The mate is teaching me star sights, sextant and all. The satellites could sulk someday; the sky does not. The bow is best, at night.' },
      { who: 'Hana', text: 'The same river of stars carries three names on this one ship. Come after dark. Show me yours and I will show you mine.' },
    ],
    choices: [
      { text: 'Meet her on the dark bow', goto: 'c3.hana.starstart' },
      { text: 'Later; the stars will keep', goto: 'c3.hana.starlater' },
    ],
  },
  'c3.hana.starstart': {
    lines: [
      { text: 'Night folds over the ship. The working lights die forward, the engine hums below, and the sky comes down to the rail to meet you.' },
    ],
    effects: ['set:c3.stars.start'],
  },
  'c3.hana.starlater': {
    lines: [
      { who: 'Hana', text: 'They rise on schedule. The mate says it is the only thing aboard that does. Find me when the deck goes dark.' },
    ],
  },
  'c3.starsdone': {
    lines: [
      { text: 'Three skies, one river. The hunter wheels away west, the dark llama drinks at the Mayu, and dead ahead the Amanogawa waits for July.' },
      { who: 'Hana', text: 'Amanogawa. The River of Heaven. On its two banks, two stars wait all year for one night to meet. That is what Tanabata is for.' },
      { who: 'Hana', text: 'And your llama is not stars at all but the dark between them! The ship is named for her, you know. Somebody’s grandmother knew.' },
    ],
    effects: ['clear:c3.stars.start', 'set:c3.stars.done', 'journal:customs.starriver'],
  },
  'c3.hana.words': {
    lines: [
      { who: 'Hana', text: 'You gave me a constellation, so: arigatou. Thank you. Your first word of Japanese, and honestly the one I use most.' },
      { who: 'Hana', text: 'In Shionoura, ask for Minato-ya, my grandmother Fumi’s inn. Say arigatou at her door and you will be adopted by dinner.' },
    ],
    effects: ['set:c3.hana.tanabata'],
  },
  'c3.hana.idle': {
    lines: [
      { who: 'Hana', text: 'Eleven days. Ten if the current is kind. My grandmother is already airing the good futons; I can feel it from here.' },
    ],
  },

  // ---------------- Olena, second engineer ----------------
  'c3.olena.first': {
    lines: [
      { text: 'The second engineer takes her sun break at the rail, coveralls tied at the waist, face tipped up like a solar panel.' },
      { who: 'Olena', text: 'Ah. The galley hand. Good, you exist; Ben talks about you, and Ben exaggerates everything except food.' },
      { who: 'Olena', text: 'Olena. Second engineer, from Odesa. I keep four thousand tons of machinery alive. My method? Politeness, mostly.' },
    ],
    effects: ['set:c3.met.olena', 'journal:people.olena'],
  },
  'c3.olena.starter': {
    lines: [
      { who: 'Olena', text: 'Come. Hold this, carefully. It is older than my contract and more temperamental than the main engine.' },
      { text: 'A glass jar, warm from her hands. Inside, something pale breathes: a sourdough starter, alive, and clearly opinionated.' },
      { who: 'Olena', text: 'From my mother’s kitchen in Odesa. Six oceans it has crossed with me. On land I have one address; at sea, I have this.' },
      { who: 'Olena', text: 'Feed it while I check the purifier. If it bubbles, you are family. If it does not, we will never speak of this again.' },
      { text: 'You feed it a spoon of flour. It bubbles, smugly. Four decks down, the engine keeps the same patient time.' },
    ],
    effects: ['set:c3.olena.bread'],
  },
  'c3.olena.dateline': {
    lines: [
      { who: 'Olena', text: 'You noticed we crossed the dateline in the night? Tuesday is gone. The whole day. The company does not pay it back; I checked.' },
      { who: 'Olena', text: 'The bosun’s birthday was on that Tuesday. Officially he is now a man with no age. He is delighted. Do not ruin it for him.' },
    ],
    effects: ['set:c3.olena.dateline', 'journal:customs.dateline'],
  },
  'c3.olena.idle': {
    lines: [
      { who: 'Olena', text: 'The engine hum? You stop hearing it in week one. Then in port, the silence wakes you like an alarm. The sea keeps you either way.' },
    ],
  },

  // ---------------- the Bosun, and the court of Neptune ----------------
  'c3.bosun.first': {
    lines: [
      { text: 'The bosun stands in the container canyon, one hand on a lashing rod, testing it the way you test a drum.' },
      { who: 'The Bosun', text: 'New hands. Two rules on my deck: one hand for you, one for the ship. And no whistling; the wind takes requests too seriously.' },
      { who: 'The Bosun', text: 'The cat outranks you. The cook outranks me. Learn the ladder and this is the happiest steel village afloat.' },
    ],
    effects: ['set:c3.met.bosun', 'journal:people.bosun'],
  },
  'c3.bosun.summons': {
    lines: [
      { text: 'The bosun unrolls a scroll with terrible ceremony. It is a cargo manifest wearing a border drawn in marker.' },
      { who: 'The Bosun', text: 'Hear ye. Tomorrow this vessel crosses the Line, and King Neptune finds among her crew a POLLYWOG, unbaptized in his domain. You.' },
      { who: 'The Bosun', text: 'A pollywog has never crossed the equator. A shellback has, and fears nothing but dry land. By Thursday you will be one or the other.' },
      { who: 'The Bosun', text: 'All voluntary, all gentle, mostly flour. My court has been kind for a thousand years, ever since the Vikings invented it.' },
      { who: 'Hana', text: 'Four hundred. The book on the bridge says four hundred years.' },
      { who: 'The Bosun', text: 'The book was not there.' },
    ],
    effects: ['set:c3.wog', 'journal:words.pollywog'],
    choices: [
      { text: 'Submit to the court of Neptune', goto: 'c3.bosun.court' },
      { text: 'Ask what happens to refusers', goto: 'c3.bosun.refuse' },
    ],
  },
  'c3.bosun.refuse': {
    lines: [
      { who: 'The Bosun', text: 'Nothing, wog. They watch from the rail with dry hair, and regret it at every karaoke night for the rest of the run.' },
      { text: 'He rerolls the manifest with dignity. The particular dignity of a man who has already hidden the flour somewhere.' },
    ],
  },
  'c3.bosun.court': {
    lines: [
      { text: 'Noon, on the Line. Neptune holds court on the hatch: the bosun in a mop wig and a bedsheet, trident of taped-together boat hooks.' },
      { who: 'The Bosun', text: 'The charge: presuming to enter my kingdom unshelled and unsalted. How plead you? Wrong. All wogs plead wrong. It is tradition.' },
      { text: 'The royal barber pats your face with flour. The royal court, meaning everyone off watch, tips one bucket of warm sea over you.' },
      { text: 'Then the bosun shakes your dripping hand and the whole deck cheers like something true just happened. Somehow, it did.' },
      { who: 'The Bosun', text: 'Rise, shellback, child of Neptune. The certificate is signed by the captain and by me. Frame it. I am famous nowhere else.' },
    ],
    effects: ['set:c3.shellback', 'journal:customs.linecrossing'],
  },
  'c3.bosun.after': {
    lines: [
      { who: 'The Bosun', text: 'Shellback. It sits well on you. Next crossing you are on the bucket side of the ceremony, which I promise is even better.' },
    ],
  },
  'c3.bosun.idle': {
    lines: [
      { who: 'The Bosun', text: 'Lashings, turnbuckles, twist-locks. La mar tries every knot all day, and I answer for all of them all night.' },
    ],
  },

  // ---------------- Chasca, amidships ----------------
  'c3.chasca.deck': {
    lines: [
      { who: 'Chasca', text: 'The soup-eater! Do not look so surprised. Photographers ride cargo ships; how else do you photograph the middle of the sea?' },
      { who: 'Chasca', text: 'I paid my passage like a lady and I sleep in a hammock between mountains of boxes. Best room I have ever had. No walls!' },
      { who: 'Chasca', text: 'Stand at the rail. Sky behind you, thirty days of nowhere in every direction. The album needs the middle. Say fuzzy pickles!' },
    ],
    effects: ['set:c3.met.chasca', 'set:photo.flash', 'set:photo.c3.deck'],
  },
  'c3.chasca.album': {
    lines: [
      { who: 'Chasca', text: 'Three photographs now: the star plain, the sea’s edge, and the middle of everything. The album is growing a spine.' },
      { who: 'Chasca', text: 'Chapter by chapter, somebody keeps walking into focus. I will not say who. The darkroom keeps secrets better than I do.' },
    ],
  },

  // ---------------- karaoke night ----------------
  'c3.karaoke': {
    lines: [
      { text: 'After dinner, the machine is wheeled to the head of the mess with the reverence of an altar. Nobody laughs. Nobody would dare.' },
      { text: 'Joseph sings a Malayalam song about rain. Ben commits entirely to a ballad. Then Olena stands, dead serious, and breaks every heart aboard.' },
      { text: 'They hand you the microphone anyway. The scoring machine gives you a 74; the crew cheers like it said 100. Ritual, accomplished.' },
    ],
    effects: ['set:c3.karaoke.done', 'journal:customs.karaoke'],
  },

  // ---------------- departure ----------------
  'c3.depart': {
    lines: [
      { text: 'A small brown bird lands on the rail. Wrong for open ocean; exactly right for a coast. Then the smell arrives: green, wet, alive.' },
      { text: 'Land birds lead the bow now. Islands rise out of the haze, pine-shouldered, and a town the size of a held breath gathers round a harbor.' },
      { text: 'The engine falls to a whisper, lines go over, and thirty-one days end in one gentle bump. Shionoura. The gangway swings down.' },
    ],
    effects: ['travel:shionoura'],
  },

  // ---------------- examines: the deck ----------------
  'c3.ex.deck': {
    lines: [{ text: 'Steel plating painted deck-green, repainted so many times the coats have geology. Nonskid grit holds every step you give it.' }],
  },
  'c3.ex.railing': {
    lines: [{ text: 'White rails, waist high, cold in any weather. Below them la mar goes by at fourteen knots, minding everything at once.' }],
  },
  'c3.ex.contA': {
    lines: [{ text: 'Rust-red boxes lashed four square with rods and twist-locks. The manifest says machine parts. The bosun says "weather, eventually."' }],
  },
  'c3.ex.contB': {
    lines: [{ text: 'Blue containers wearing other people’s addresses. Somebody’s whole shop is inside one, crossing an ocean without a window.' }],
  },
  'c3.ex.contC': {
    lines: [{ text: 'A green stack, salt-streaked. One is a reefer; it hums to itself day and night, keeping somebody’s fish colder than the sea.' }],
  },
  'c3.ex.lifeboat': {
    lines: [{ text: 'Orange, enclosed, hanging in its davits like a seed that hopes never to sprout. The bosun drills it weekly anyway. Kindly, but weekly.' }],
  },
  'c3.ex.winch': {
    lines: [{ text: 'A mooring winch wound with wire that could tow a village. The grease on it is fresh. That is the bosun’s signature.' }],
  },
  'c3.ex.bollard': {
    lines: [{ text: 'Twin black bollards, waists polished bright by hawsers. In port, a figure eight of rope around these holds the whole ship still.' }],
  },
  'c3.ex.funnel': {
    lines: [{ text: 'The funnel, buff yellow with a navy band, breathing one long thin ribbon at the sky. The ship’s heartbeat, made visible.' }],
  },
  'c3.ex.shiphouse': {
    lines: [{ text: 'The house: white steel stacked over the galley, the cabins, the bridge. An entire village fitted into one apartment block, aft.' }],
  },
  'c3.ex.hammock2': {
    lines: [{ text: 'Chasca’s hammock. A camera bag hangs at its head, and the sea appears to have been given instructions to hold still.' }],
  },
  'c3.ex.hammock': {
    lines: [{ text: 'A hammock slung between the container stacks, swinging easy with the roll. Somebody aboard is winning at rooms.' }],
  },
  'c3.ex.bell2': {
    lines: [{ text: 'MV YACANA, says the bronze lip. Two strikes: an hour into the watch. You can read the ship’s arithmetic now.' }],
  },
  'c3.ex.bell': {
    lines: [{ text: 'A bronze bell under its little roof, polished to gold. Mostly ceremony now, the crew says. It still gets rung, and rung right.' }],
  },
  'c3.ex.jackstaff': {
    lines: [{ text: 'The jackstaff at the bow’s very point, flag snapping. Past it: nothing, then more nothing, then Japan.' }],
  },
  'c3.ex.cat3': {
    lines: [{ text: 'Landfall eve. The cat rises, stretches fore and aft, and walks the full length of your shin. On purpose. The bosun, passing, salutes you both.' }],
  },
  'c3.ex.cat2': {
    lines: [{ text: 'The cat licks her fur down flat. Fur licked against the grain means storm, says the bosun. She is saying nothing either way.' }],
  },
  'c3.ex.cat': {
    lines: [{ text: 'The ship’s cat, asleep on a coil of rope, in charge of everything. She does not care that you exist. It is oddly restful.' }],
  },
  'c3.ex.crate': {
    lines: [{ text: 'Spare hatch beams and lashing gear under a tarp, tied down twice. On deck, "loose" is just an early word for "lost."' }],
  },
  'c3.ex.sea': {
    lines: [{ text: 'La mar, all the way down and all the way out. Fourteen knots of west for weeks, and she still looks like she is deciding.' }],
  },

  // ---------------- examines: the galley ----------------
  'c3.ex.stove': {
    lines: [{ text: 'The galley range, gimballed against the roll, one stockpot on low forever. The most defended territory on the ship.' }],
  },
  'c3.ex.karaoke': {
    lines: [{ text: 'The karaoke machine rests under a fitted cover, like important equipment. Aboard, it is. The scoreboard has made enemies.' }],
  },
  'c3.ex.trayrack': {
    lines: [{ text: 'The tray rack by the scullery hatch. A sign in three languages and one drawing: BUS YOUR OWN TRAY. The drawing is stern.' }],
  },
  'c3.ex.wallsteel': {
    lines: [{ text: 'White-painted steel, warm from the sun on its far side. When the soup boils, condensation draws brief rivers down it.' }],
  },
  'c3.ex.floorsteel': {
    lines: [{ text: 'Scuffed steel underfoot, the sand-paint worn smooth in one path from stove to table. Thirty years of dinners went this way.' }],
  },
  'c3.ex.table': {
    lines: [{ text: 'The long mess table, rimmed so the plates cannot wander. Fiddles, Joseph calls the rims. In weather, the sea eats here too.' }],
  },
  'c3.ex.shelf': {
    lines: [{ text: 'Provisions, week three: rice in bulk, tins in ranks, the last onions hanging like medals. The freshness countdown, shelved.' }],
  },
  'c3.ex.pot': {
    lines: [{ text: 'The stockpot mutters on its hook. Whatever it is becoming, it has been becoming it since Callao.' }],
  },
};

/** Examine arms: every new kind speaks; shared kinds get map-tagged voices. */
export const CROSSING_EXAMINES: Record<string, ExamineArm[]> = {
  deck: [{ node: 'c3.ex.deck' }],
  railing: [{ node: 'c3.ex.railing' }],
  contA: [{ node: 'c3.ex.contA' }],
  contB: [{ node: 'c3.ex.contB' }],
  contC: [{ node: 'c3.ex.contC' }],
  lifeboat: [{ node: 'c3.ex.lifeboat' }],
  winch: [{ node: 'c3.ex.winch' }],
  bollard: [{ node: 'c3.ex.bollard' }],
  funnel: [{ node: 'c3.ex.funnel' }],
  shiphouse: [{ node: 'c3.ex.shiphouse' }],
  hammock: [
    { when: { has: ['c3.met.chasca'] }, node: 'c3.ex.hammock2' },
    { node: 'c3.ex.hammock' },
  ],
  shipbell: [
    { when: { has: ['page.words.bells'] }, node: 'c3.ex.bell2' },
    { node: 'c3.ex.bell' },
  ],
  jackstaff: [
    { when: { has: ['c3.complete'] }, node: 'c3.depart' },
    { node: 'c3.ex.jackstaff' },
  ],
  shipcat: [
    { when: { has: ['c3.complete'] }, node: 'c3.ex.cat3' },
    { when: { has: ['c3.shellback'] }, node: 'c3.ex.cat2' },
    { node: 'c3.ex.cat' },
  ],
  stove: [{ node: 'c3.ex.stove' }],
  karaoke: [
    { when: { has: ['c3.cook.done'], not: ['c3.karaoke.done'] }, node: 'c3.karaoke' },
    { node: 'c3.ex.karaoke' },
  ],
  trayrack: [{ node: 'c3.ex.trayrack' }],
  wallSteel: [{ node: 'c3.ex.wallsteel' }],
  floorSteel: [{ node: 'c3.ex.floorsteel' }],
  // Shared kinds, spoken in this chapter's voice only on this chapter's maps.
  sea: [{ map: 'ship', node: 'c3.ex.sea' }],
  crate: [{ map: 'ship', node: 'c3.ex.crate' }],
  table: [{ map: 'galley', node: 'c3.ex.table' }],
  shelf: [{ map: 'galley', node: 'c3.ex.shelf' }],
  pot: [{ map: 'galley', node: 'c3.ex.pot' }],
  // The entry hook: La Caleta's pier sign now boards the Yacana.
  piersign: [{ map: 'la-caleta', when: { has: ['c2.complete'] }, node: 'c3.board' }],
};

/** Event-triggered nodes, listed with gating so tests can prove them reachable. */
export const CROSSING_EVENTS: EventNode[] = [
  { node: 'c3.arrive' },
  { when: { has: ['c3.cook.start'] }, node: 'c3.cooked' },
  { when: { has: ['c3.stars.start'] }, node: 'c3.starsdone' },
];

/** The mid-ocean mail bundle. Pilar's reply names the actual creature sent. */
export const CROSSING_LETTERS: LetterDef[] = [
  {
    id: 'c3.pilar',
    from: 'Pilar, Bridge Authority, Marine Acquisitions Desk',
    when: { has: ['pilar.gift.puffer'] },
    body: [
      'Dear business partner. The box arrived. Inside was a fish that had clearly heard amazing news and decided to stay that way forever.',
      'The puffer fish now guards the toll sign. Traffic pays faster. Astonishment, it turns out, is good for business.',
      'Official notice: the Bridge Authority has annexed ships. In principle. Any ship crossing my bridge owes one fact. Inform your captain.',
      'The dog greeted the puffer fish once, from a distance, and has respected it ever since. P.S. This letter is also a receipt.',
    ],
  },
  {
    id: 'c3.pilar',
    from: 'Pilar, Bridge Authority, Marine Acquisitions Desk',
    when: { has: ['pilar.gift.star'] },
    body: [
      'Dear business partner. The box arrived. Inside was a sea star with four arms that refuses to discuss the fifth. I respect it deeply.',
      'It has been appointed Toll Inspector. It inspects nothing, slowly. The position suits it and morale at the bridge is high.',
      'Official notice: the Bridge Authority has annexed ships. In principle. Any ship crossing my bridge owes one fact. Inform your captain.',
      'The dog and the inspector have divided the territory between them. P.S. This letter is also a receipt.',
    ],
  },
  {
    id: 'c3.pilar',
    from: 'Pilar, Bridge Authority, Marine Acquisitions Desk',
    when: { has: ['pilar.gift.claw'] },
    body: [
      'Dear business partner. The box arrived. Inside was a crab claw shaped exactly like a comma. The sea punctuates! This changes everything.',
      'The claw now sits on the toll sign, where it makes the sign a longer sentence. Tourists read it twice. Twice the facts. Genius.',
      'Official notice: the Bridge Authority has annexed ships. In principle. Any ship crossing my bridge owes one fact. Inform your captain.',
      'The dog tried to bury the comma once. There was a hearing. P.S. This letter is also a receipt.',
    ],
  },
  {
    id: 'c3.pilar',
    from: 'Pilar, Bridge Authority',
    body: [
      'Dear business partner. No sea thing has arrived at this office. I am choosing to believe in shipping delays and not in betrayal.',
      'The shelf I built for it stands empty, which the dog finds comfortable. He is not the intended exhibit. Tell the sea to hurry.',
      'Official notice: the Bridge Authority has annexed ships. In principle. Any ship crossing my bridge owes one fact. Inform your captain.',
      'P.S. This letter is also an invoice, for the shelf.',
    ],
  },
  {
    id: 'c3.petro',
    from: 'Doña Petro, La Picantería',
    when: { has: ['c2.casero'] },
    body: [
      'Casera. Marisol tells the whole malecón that her casero sailed with the capitana. She says it proudly, like weather she predicted.',
      'Listen: a galley is only a picantería that moves. Same law applies. Feed them what the pots say, and never argue with the pot.',
      'The sudado was better the week you carried the lisa. That is not sentiment, it is seasoning. Pass this way again and test me.',
    ],
  },
  {
    id: 'c3.petro',
    from: 'Doña Petro, La Picantería',
    body: [
      'Hija. The fog has lifted twice since you sailed, and the village has decided it is your doing. Let them; it costs nothing.',
      'Eat warm things at night. The sea is cold at the bottom and it climbs. Ask your captain for soup, not for courage.',
      'The pots say you come back this way someday. The pots are never wrong, hija. Only slow.',
    ],
  },
];
