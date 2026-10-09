import type { ExamineArm, Line, NodeMap, NpcDef } from '../schema';

/**
 * Kaithappuram's people. Malayalam arrives by ear: nanni, sukhamano, chetta,
 * chaya kudikkam, and the head wobble that means yes while looking like no.
 * Rules unchanged: nobody lectures, neighbors disagree, warm corrections,
 * the wrong branch is the warmer scene, two short sentences.
 */

export const KERALA_NPCS: NpcDef[] = [
  {
    id: 'mariamma',
    name: 'Mariamma',
    map: 'mariamma-veedu',
    pos: [3, 2],
    range: 1,
    look: {
      skin: '#7a4a2e',
      hair: '#d9d4c8',
      cloth: '#f2ead8',
      stripe: '#c8a55b',
      hat: '#e8dcc4',
      hatStyle: 'none',
      skirt: '#f2ead8',
    },
    entry: [
      { when: { has: ['joseph.letter'], not: ['c6.letter.delivered'] }, node: 'c6.mariamma.letter' },
      { when: { has: ['c6.letter.delivered'], not: ['c6.letter.heard'] }, node: 'c6.mariamma.read' },
      // The umbrella visit ends with her deciding something; this is it.
      { when: { has: ['c6.letter.heard'], not: ['c6.kunje'] }, node: 'c6.mariamma.adopt' },
      { when: { not: ['met.mariamma'] }, node: 'c6.mariamma.nofirst' },
      // Back from Shaji's with chaya in you: the kitchen lesson, and the
      // sadya plan in the same sitting.
      { when: { has: ['c6.letter.delivered', 'c6.chaya'], not: ['c6.mariamma2'] }, node: 'c6.mariamma.kitchen' },
      { when: { has: ['c6.mariamma2', 'c6.chaya'], not: ['c6.sadya.ask'] }, node: 'c6.mariamma.sadyaplan' },
      { when: { has: ['c6.sadya.ask'], not: ['c6.sadya.done'] }, node: 'c6.mariamma.sadyastart' },
      // After the feast, once you are sitting in her house the way a guest
      // of the house sits. She is not planning to say any of this.
      // If the race and the rain both came first, her story runs straight
      // into the blessing, so the last visit is one sitting, not two.
      {
        when: { has: ['c6.row.done', 'c6.sadya.done', 'c6.rain'], not: ['c6.her', 'c6.complete'] },
        node: 'c6.mariamma.herLast',
      },
      { when: { has: ['c6.sadya.done'], not: ['c6.her'] }, node: 'c6.mariamma.her' },
      {
        when: { has: ['c6.row.done', 'c6.sadya.done', 'c6.rain'], not: ['c6.complete'] },
        node: 'c6.mariamma.blessing',
      },
      { when: { has: ['c6.complete'] }, node: 'c6.mariamma.after' },
      { when: { has: ['c6.sadya.done'] }, node: 'c6.mariamma.sadyaAgain' },
      { node: 'c6.mariamma.idle' },
    ],
  },
  {
    // Joseph comes home for the chapter's last stretch: his contract paid off
    // at Kochi once the village had already made you family.
    id: 'josephC6',
    name: 'Joseph',
    map: 'mariamma-veedu',
    when: { has: ['c6.letter.delivered', 'c6.complete'] },
    pos: [8, 2],
    range: 1,
    look: {
      skin: '#7a4a2e',
      hair: '#241a12',
      cloth: '#3e5a77',
      stripe: '#f2e6d0',
      hat: '#2c3e57',
      hatStyle: 'none',
    },
    entry: [
      { when: { not: ['c6.joseph.met'] }, node: 'c6.joseph.home' },
      { when: { has: ['c6.joseph.met'], not: ['c6.joseph.quizzed'] }, node: 'c6.joseph.quiz' },
      { when: { has: ['c6.joseph.quizzed'], not: ['c6.joseph.ocean'] }, node: 'c6.joseph.ocean' },
      { node: 'c6.joseph.idle' },
    ],
  },
  {
    id: 'shaji',
    name: 'Shaji',
    map: 'kerala',
    pos: [19, 13],
    range: 1,
    look: {
      skin: '#8a5636',
      hair: '#2b2118',
      cloth: '#3f7fb0',
      stripe: '#f2e6d0',
      hat: '#e8dcc4',
      hatStyle: 'none',
    },
    entry: [
      { when: { has: ['c6.kunje'], not: ['met.shaji'] }, node: 'c6.shaji.firstwarm' },
      { when: { not: ['met.shaji'] }, node: 'c6.shaji.first' },
      { when: { has: ['met.shaji', 'c6.kunje'], not: ['c6.chaya'] }, node: 'c6.shaji.chaya' },
      { when: { has: ['c6.chaya', 'c6.mariamma2'], not: ['c6.wobble'] }, node: 'c6.shaji.wobble' },
      { when: { has: ['c6.chaya', 'page.words.chetta'], not: ['c6.chetta'] }, node: 'c6.shaji.chetta' },
      { when: { has: ['c6.rain'], not: ['c6.rainchaya'] }, node: 'c6.shaji.rainstall' },
      { when: { has: ['page.words.chaya', 'c6.mariamma2'], not: ['c6.cook.done'] }, node: 'c6.shaji.cookoffer' },
      { when: { has: ['c6.cook.done'] }, node: 'c6.shaji.pourAgain' },
      { node: 'c6.shaji.idle' },
    ],
  },
  {
    id: 'appu',
    name: 'Appu',
    map: 'kerala',
    // Out in front of the palm knot: at 24,15 he spawned tucked behind the
    // trunk at 24,16, which ran straight through him.
    pos: [22, 15],
    range: 3,
    look: {
      skin: '#8a5636',
      hair: '#241a12',
      cloth: '#d9694a',
      stripe: '#8fcbe8',
      hat: '#e8dcc4',
      hatStyle: 'none',
      kid: true,
    },
    entry: [
      { when: { not: ['met.appu'] }, node: 'c6.appu.first' },
      { when: { has: ['met.appu', 'c6.row.done'], not: ['c6.appu2'] }, node: 'c6.appu.race' },
      { node: 'c6.appu.idle' },
    ],
  },
  {
    id: 'kuttan',
    name: 'Kuttan',
    map: 'kerala',
    pos: [40, 15],
    range: 1,
    look: {
      skin: '#6b3f24',
      hair: '#241a12',
      cloth: '#8a5330',
      stripe: '#f2e6d0',
      hat: '#e8dcc4',
      hatStyle: 'none',
    },
    entry: [
      { when: { has: ['c6.chaya'], not: ['met.kuttan', 'c6.rain'] }, node: 'c6.kuttan.meet' },
      { when: { not: ['met.kuttan'] }, node: 'c6.kuttan.first' },
      { when: { has: ['met.kuttan', 'c6.chaya'], not: ['c6.rain'] }, node: 'c6.kuttan.smell' },
      { when: { has: ['c6.rain'], not: ['c6.kuttan2'] }, node: 'c6.kuttan.rain' },
      { node: 'c6.kuttan.idle' },
    ],
  },
  {
    id: 'omana',
    name: 'Omana',
    map: 'kerala',
    pos: [6, 10],
    range: 1,
    look: {
      skin: '#9c6a42',
      hair: '#2e2018',
      cloth: '#3c6e64',
      stripe: '#c8a55b',
      hat: '#e8dcc4',
      hatStyle: 'none',
      skirt: '#7d3f34',
    },
    entry: [
      { when: { not: ['met.omana'] }, node: 'c6.omana.first' },
      { when: { has: ['met.omana'], not: ['c6.rope.errand'] }, node: 'c6.omana.rope' },
      { when: { has: ['c6.rope.given'], not: ['c6.omana2'] }, node: 'c6.omana.paddy' },
      { node: 'c6.omana.idle' },
    ],
  },
  {
    id: 'librarian',
    name: 'Divakaran Master',
    map: 'kerala',
    pos: [28, 10],
    range: 0,
    look: {
      skin: '#8a5636',
      hair: '#cfc8ba',
      cloth: '#e8e0cc',
      stripe: '#8c8479',
      hat: '#e8dcc4',
      hatStyle: 'none',
    },
    entry: [
      { when: { not: ['met.librarian'] }, node: 'c6.lib.first' },
      { when: { has: ['met.librarian', 'c6.rain'], not: ['c6.lib2'] }, node: 'c6.lib.rain' },
      { node: 'c6.lib.idle' },
    ],
  },
  {
    id: 'varkey',
    name: 'Captain Varkey',
    map: 'kerala',
    pos: [27, 24],
    range: 1,
    look: {
      skin: '#7a4a2e',
      hair: '#3a2e22',
      cloth: '#c1512f',
      stripe: '#f2e6d0',
      hat: '#e8dcc4',
      hatStyle: 'none',
    },
    entry: [
      { when: { has: ['errand.coir-rope'], not: ['met.varkey', 'c6.rope.given'] }, node: 'c6.varkey.meet' },
      { when: { not: ['met.varkey'] }, node: 'c6.varkey.first' },
      { when: { has: ['errand.coir-rope'], not: ['c6.rope.given'] }, node: 'c6.varkey.rope' },
      { when: { has: ['c6.rope.given', 'c6.letter.delivered'], not: ['c6.row.done'] }, node: 'c6.varkey.invite' },
      { when: { has: ['c6.row.done'], not: ['c6.varkey2'] }, node: 'c6.varkey.after' },
      { when: { has: ['c6.row.done'] }, node: 'c6.varkey.rowAgain' },
      { node: 'c6.varkey.idle' },
    ],
  },
  {
    id: 'moosa',
    name: 'Moosa',
    map: 'kerala',
    pos: [24, 23],
    range: 0,
    look: {
      skin: '#7a4a2e',
      hair: '#cfc8ba',
      cloth: '#2c3e57',
      stripe: '#c8a55b',
      hat: '#f2ead8',
      hatStyle: 'none',
    },
    entry: [
      { when: { has: ['c6.complete'], not: ['met.moosa', 'c6.depart.ready'] }, node: 'c6.moosa.meet' },
      { when: { not: ['met.moosa'] }, node: 'c6.moosa.first' },
      { when: { has: ['c6.complete'], not: ['c6.depart.ready'] }, node: 'c6.moosa.berth' },
      { when: { has: ['c6.depart.ready'] }, node: 'c6.moosa.sail' },
      { node: 'c6.moosa.idle' },
    ],
  },
  {
    id: 'chascaC6',
    name: 'Chasca',
    map: 'kerala',
    pos: [23, 26],
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
      { when: { has: ['c6.rain'], not: ['met.chascaC6'] }, node: 'c6.chasca.photo' },
      { when: { not: ['met.chascaC6'] }, node: 'c6.chasca.wait' },
      { node: 'c6.chasca.album' },
    ],
  },
];

// Scenes that can be heard on their own or folded into a later visit share
// their words, so the two tellings never drift apart.
const HER_OPEN: Line[] = [
  { text: 'She scrapes coconut and nods at the step by the door.' },
  { who: 'Mariamma', text: 'A Peru girl sat there in the rain year, writing. Zoila. Every morning I asked sukhamano, and she said sukham.' },
  { who: 'Mariamma', text: 'For two weeks that was not true. She would not let me send for a doctor, or put it in any letter.' },
];
const HER_QUIET: Line[] = [
  { text: 'The scraper keeps the time neither of you wants to name.' },
];
const HER_WHY: Line[] = [
  { who: 'Mariamma', text: 'Because she asked the way you ask for salt, kunje. Some things you only argue with after the boat has gone.' },
];
const HER_CLOSE: Line[] = [
  { who: 'Mariamma', text: 'She walked onto the boat herself. That is the part I keep. Ayyo, my mouth; you have her face when you listen.' },
  { text: 'She turns back to the blade, faster than before.' },
];
const KUTTAN_HELLO: Line[] = [
  { text: 'A man comes down a palm with a frog’s confidence, a pot at his hip.' },
  { who: 'Kuttan', text: 'Sixty feet, twice a day, forty years. Afraid of the palm? We are colleagues.' },
  { who: 'Kuttan', text: 'This pot is kallu. Sweet at dawn, sour by dark, same pot. Most people also.' },
];
const VARKEY_HELLO: Line[] = [
  { text: 'On the bank, a crew rows an imaginary boat, counting in song.' },
  { who: 'Captain Varkey', text: 'A hundred and one seats, and I am one rower short, which is the same as being short a lung.' },
  { who: 'Captain Varkey', text: 'Mind Raghavan, the stroke caller. He acknowledges only rowers. You are currently scenery.' },
];
const MOOSA_HELLO: Line[] = [
  { text: 'Sacks stenciled CARDAMOM wait under tarpaulin. A white-bearded man counts them without appearing to count.' },
  { who: 'Moosa', text: 'Moosa. Spices go down this water to Kochi, then wherever the wind takes them.' },
  { who: 'Moosa', text: 'My grandfather said the monsoon is not weather, it is a road. Half the year one way, then it comes home.' },
];

export const KERALA_NODES: NodeMap = {
  // The walls themselves; without this arm they fall through to the
  // village's adobe line, which reads strangely far from the altiplano.
  'c6.ex.wall': {
    lines: [{ text: 'Laterite block under lime wash, streaked where every monsoon has signed its name.' }],
  },
  // ---------------- arrival ----------------
  'c6.arrive': {
    lines: [
      { text: 'A chugging boat from Kochi leaves you on a jetty one handcart wide.' },
      { text: 'Green water, green light, air that leans on you. Joseph said: the house with the open door.' },
      { text: 'Above the palms the sky is stacking clouds like cargo. The rains have taken a week off.' },
    ],
    effects: ['set:c6.arrived'],
  },

  // ---------------- Mariamma, the front door ----------------
  // The delivery runs through the letter channel: the conversation ends, the
  // page you carried across an ocean unfolds on screen, and her reaction
  // waits for the next word. Reading, gift and adoption are the second
  // visit: the umbrella first, then what she decides about you.
  'c6.mariamma.letter': {
    lines: [
      { text: 'The open door breathes woodsmoke and curry leaves. A small woman looks up and somehow knows before you speak.' },
      { who: 'Mariamma', text: 'That is my Joseph’s knot on that parcel. Come in, come in! Did you eat? You will eat.' },
      { text: 'You hand her the letter. She unfolds it like something that might fly away.' },
    ],
    effects: [
      'set:met.mariamma',
      'set:c6.letter.delivered',
      'clear:joseph.letter',
      'letter:joseph.amma',
    ],
  },
  'c6.mariamma.read': {
    lines: [
      { text: 'She reads it aloud, to you, to the kitchen, to the smoke. At "Amma, nobody cooks like you" she cries.' },
      { who: 'Mariamma', text: 'He says the cook is Filipino and very good. Then he says do not tell the cook, but Amma, your meen curry wins.' },
    ],
    effects: ['set:c6.letter.heard'],
    choices: [
      { text: 'Hand her the parcel now', goto: 'c6.mariamma.hand' },
      { text: 'Wait until she finishes the letter', goto: 'c6.mariamma.waitread' },
    ],
  },
  'c6.mariamma.hand': {
    lines: [
      { text: 'You slide the parcel across. Inside: a folding umbrella from Japan, small as a mango.' },
    ],
    next: 'c6.mariamma.gift',
  },
  'c6.mariamma.waitread': {
    lines: [
      { text: 'You wait while she reads to the end, twice. Then she opens the parcel: a folding umbrella from Japan, small as a mango.' },
    ],
    next: 'c6.mariamma.gift',
  },
  'c6.mariamma.gift': {
    lines: [
      { who: 'Mariamma', text: 'An umbrella, in the rains! Ha! He forgets my birthday and remembers the sky.' },
      { text: 'She opens it indoors without a flicker of worry, stands it by the door like a guest of honor, and looks at you as if deciding something.' },
    ],
    effects: ['journal:people.mariamma'],
    next: 'c6.mariamma.adopt',
  },
  'c6.mariamma.adopt': {
    lines: [
      { who: 'Mariamma', text: 'You carried my son’s voice across the sea. So: in this house you are not sir, not madam. You are kunje. Little one, mine.' },
    ],
    effects: ['set:c6.kunje', 'journal:words.nanni'],
    choices: [
      { text: '"Thank you, Mariamma."', goto: 'c6.mariamma.nanni' },
      { text: 'Lift the curry pot onto the hearth for her', goto: 'c6.mariamma.shown' },
    ],
  },
  'c6.mariamma.nanni': {
    lines: [
      { who: 'Mariamma', text: 'Nanni, we say. But family says it rarely and shows it daily.' },
      { who: 'Mariamma', text: 'Now go and drink chaya at Shaji’s stall, and tell him whose guest you are.' },
    ],
  },
  'c6.mariamma.shown': {
    lines: [
      { who: 'Mariamma', text: 'See? Shown, not said. If you must say it, the word is nanni.' },
      { who: 'Mariamma', text: 'Now go and drink chaya at Shaji’s stall, and tell him whose guest you are.' },
    ],
  },
  'c6.mariamma.nofirst': {
    lines: [
      { who: 'Mariamma', text: 'A new face at my door, and rain coming. Both are reasons to sit. Did you eat?' },
    ],
    effects: ['set:met.mariamma'],
  },
  'c6.mariamma.kitchen': {
    lines: [
      { who: 'Mariamma', text: 'Sukhamano, kunje? Are you well? You answer: sukham! Say it until it is true.' },
      { who: 'Mariamma', text: 'This meen curry has rested since yesterday; it is better on the second day. People also improve if you let them sit.' },
    ],
    effects: ['set:c6.mariamma2', 'journal:words.sukhamano', 'journal:dishes.meencurry'],
    next: 'c6.mariamma.kitchen2',
  },
  'c6.mariamma.kitchen2': {
    lines: [
      { who: 'Mariamma', text: 'And anyone older is chetta or chechi. Address the village correctly and it is all relatives.' },
    ],
    effects: ['journal:words.chetta'],
    next: 'c6.mariamma.sadyaplan',
  },
  // The one thing this kitchen kept. She does not diagnose it, does not dress
  // it up, and stops the moment she hears who she is saying it to.
  'c6.mariamma.her': {
    lines: HER_OPEN,
    choices: [
      { text: 'Say nothing.', goto: 'c6.mariamma.her.quiet' },
      { text: '"Why did you agree?"', goto: 'c6.mariamma.her.why' },
    ],
  },
  'c6.mariamma.her.quiet': {
    lines: HER_QUIET,
    next: 'c6.mariamma.her2',
  },
  'c6.mariamma.her.why': {
    lines: HER_WHY,
    next: 'c6.mariamma.her2',
  },
  'c6.mariamma.her2': {
    lines: HER_CLOSE,
    effects: ['set:c6.her', 'journal:her.kerala'],
  },
  // The same story on the last visit, ending in the blessing instead of the blade.
  'c6.mariamma.herLast': {
    lines: HER_OPEN,
    choices: [
      { text: 'Say nothing.', goto: 'c6.mariamma.herLast.quiet' },
      { text: '"Why did you agree?"', goto: 'c6.mariamma.herLast.why' },
    ],
  },
  'c6.mariamma.herLast.quiet': { lines: HER_QUIET, next: 'c6.mariamma.herLast2' },
  'c6.mariamma.herLast.why': { lines: HER_WHY, next: 'c6.mariamma.herLast2' },
  'c6.mariamma.herLast2': {
    lines: HER_CLOSE,
    effects: ['set:c6.her', 'journal:her.kerala'],
    next: 'c6.mariamma.blessing',
  },
  'c6.mariamma.sadyaplan': {
    lines: [
      { who: 'Mariamma', text: 'And today I lay a sadya, for the letter and the village that raised my Joseph.' },
      { who: 'Mariamma', text: 'My knees can cook but they cannot also serve. Your hands, kunje?' },
      { text: 'In this kitchen, the questions are decorations.' },
    ],
    effects: ['set:c6.sadya.ask'],
    choices: [
      { text: 'Take up the serving spoon', goto: 'c6.sadya.go' },
      { text: 'Not yet', goto: 'c6.sadya.wait' },
    ],
  },
  'c6.mariamma.sadyastart': {
    lines: [
      { who: 'Mariamma', text: 'The leaves are cut and the aunties have arrived. We only lack a pair of serving hands.' },
    ],
    choices: [
      { text: 'Take up the serving spoon', goto: 'c6.sadya.go' },
      { text: 'Not yet', goto: 'c6.sadya.wait' },
    ],
  },
  // The rules live on the how-to card and in the aunties' corrections inside
  // the panel; the send-off only has to be a send-off.
  'c6.sadya.go': {
    lines: [
      { text: 'Auntie Leela and Auntie Rosamma flank you like tugboats. The first banana leaf is already down.' },
    ],
    effects: ['set:c6.sadya.start'],
  },
  'c6.sadya.wait': {
    lines: [
      { who: 'Mariamma', text: 'Go, walk, come back hungry. A sadya waits better than it reheats, but not by much.' },
    ],
  },
  // The map of the leaf and the fold argument both happen inside the panel
  // now, hands-on; the journal pages fill here, from the doing. One line of
  // afterglow, one line of Mariamma, and the room goes back to eating.
  'c6.sadya.served': {
    lines: [
      { text: 'The room eats, argues, asks for more payasam. Someone says mathi, enough, and means it the third time.' },
      { who: 'Mariamma', text: 'The leaf is folded, the child ate, Joseph’s letter is answered. That is the grammar that matters.' },
    ],
    effects: ['set:c6.sadya.done', 'clear:c6.sadya.start', 'journal:dishes.sadya', 'journal:dishes.payasam'],
  },
  // A Kaithappuram send-off: a thumb's cross on the forehead, the way this
  // house sends its children out of the door, Joseph included, every voyage.
  'c6.mariamma.blessing': {
    lines: [
      { who: 'Mariamma', text: 'Rowed with the club, served at my sadya, stood in the rain like a local fool. Kunje, you are done arriving.' },
      { text: 'She wets her thumb and draws a small cross on your forehead, the way this house has sent Joseph out of the door every voyage.' },
      { who: 'Mariamma', text: 'The sea borrowed my son, and he writes to me from it. Now it borrows you. Go to Moosa.' },
    ],
    effects: ['set:c6.complete'],
  },
  'c6.mariamma.after': {
    lines: [
      { who: 'Mariamma', text: 'At the next coast, eat properly and write to me. One page, no news needed. Mothers read between lines.' },
    ],
    choices: [
      { text: 'Ask if there are leaves left to lay', when: { has: ['c6.sadya.done'] }, goto: 'c6.mariamma.sadyaReplay' },
      { text: 'Just sit with her a while', goto: 'c6.mariamma.idle' },
    ],
  },
  'c6.mariamma.sadyaAgain': {
    lines: [
      { who: 'Mariamma', text: 'The aunties are back and still wrong about the fold. There are leaves cut, kunje, and my knees have not improved.' },
    ],
    choices: [
      { text: 'Take up the serving spoon again', when: { has: ['c6.sadya.done'] }, goto: 'c6.mariamma.sadyaReplay' },
      { text: 'Sit on the step instead', goto: 'c6.mariamma.idle' },
    ],
  },
  'c6.mariamma.sadyaReplay': {
    lines: [
      { who: 'Mariamma', text: 'Go on. Nothing to prove today, only leaves to fill. Your hand already knows where the rice belongs.' },
    ],
    effects: ['set:replay.mode', 'set:c6.sadya.start'],
  },
  'c6.mariamma.idle': {
    lines: [
      { who: 'Mariamma', text: 'Kunje, did you eat? Do not answer; sit, and the answer will become yes.' },
    ],
  },

  // ---------------- Shaji, the thattukada ----------------
  'c6.shaji.first': {
    lines: [
      { text: 'A stall the size of a wardrobe, a kettle the size of a temple bell.' },
      { who: 'Shaji', text: 'Chaya, guest? Puttu? The bench is for customers and philosophers, and the rate is the same.' },
    ],
    effects: ['set:met.shaji', 'journal:people.shaji'],
  },
  'c6.shaji.firstwarm': {
    lines: [
      { who: 'Shaji', text: 'You are the one! Mariamma chechi’s letter, from Joseph, across the whole sea. The village knew before you knocked.' },
      { who: 'Shaji', text: 'For that, the good glass. This is a thattukada; news and chaya are both served hot.' },
    ],
    effects: ['set:met.shaji', 'journal:people.shaji'],
    next: 'c6.shaji.chaya',
  },
  'c6.shaji.chaya': {
    lines: [
      { text: 'He pours from tumbler to tumbler in a long bronze arc, a meter of chaya airborne, not a drop lost.' },
      { text: 'Then a steel plate: puttu, a white cylinder of rice and coconut, with kadala curry, and a flaking parotta.' },
      { who: 'Shaji', text: 'Tear it with the fingers, guest. Cutlery is for people in a hurry to be elsewhere.' },
    ],
    effects: ['set:c6.chaya', 'journal:words.chaya', 'journal:dishes.puttu'],
    choices: [
      { text: '"In Busan the ajumma always added a little extra. Deom, she called it."', goto: 'c6.shaji.deom', when: { has: ['page.words.deom'] } },
      { text: 'Ask why the glass is only three-quarters full', goto: 'c6.shaji.extra' },
    ],
  },
  'c6.shaji.deom': {
    lines: [
      { who: 'Shaji', text: 'Deom! A name for it! Here it has no name, guest. I pour short, you notice, I top it up. Naming it would spoil the aim.' },
    ],
    effects: ['journal:dishes.parotta'],
  },
  'c6.shaji.extra': {
    lines: [
      { text: 'He tops the glass with one more pull, unasked.' },
      { who: 'Shaji', text: 'The last splash is not chaya, guest. It is the message. Regulars get it without asking; that is what regular means.' },
    ],
    effects: ['journal:dishes.parotta'],
  },
  // Its own visit: the plate is one sitting; the head wobble comes when you
  // are back from Mariamma's kitchen, and Shaji's dare follows it.
  'c6.shaji.wobble': {
    lines: [
      { text: 'Puttu tomorrow? Shaji tilts his head side to side. You take it as a no and start to stand.' },
      { who: 'Appu', text: 'Where are you GOING? That means yes! Head goes like a boat, answer is yes.' },
      { who: 'Shaji', text: 'The boy translates for tourists and crows. Yes, puttu.' },
    ],
    effects: ['set:c6.wobble', 'journal:customs.headwobble'],
    next: 'c6.shaji.cookoffer',
  },
  'c6.shaji.chetta': {
    lines: [
      { text: 'You try it: Shaji chetta, one more chaya?' },
      { who: 'Shaji', text: 'AH. Chetta! Did you hear, kettle? Promoted!' },
      { who: 'Shaji', text: 'No more guest, kunje. This bench was never for strangers, only for family who had not arrived yet.' },
    ],
    effects: ['set:c6.chetta'],
  },
  'c6.shaji.rainstall': {
    lines: [
      { text: 'The stall in the rain is a lighthouse with snacks: six people, four umbrellas, one argument about football.' },
      { who: 'Shaji', text: 'Rain-watching chaya is kattan, kunje. Black, no milk, sweet. The rain provides the milk feelings.' },
    ],
    effects: ['set:c6.rainchaya'],
  },
  'c6.shaji.idle': {
    lines: [
      { who: 'Shaji', text: 'Chaya kudikkam? The kettle has opinions about everyone, but it keeps them at a simmer.' },
    ],
  },
  'c6.shaji.pourAgain': {
    lines: [
      { who: 'Shaji', text: 'The kettle has been asking after you, kunje.' },
    ],
    choices: [
      { text: 'Step behind the kettle again', when: { has: ['c6.cook.done'] }, goto: 'c6.shaji.pourReplay' },
      { text: 'The customer side, today', goto: 'c6.shaji.idle' },
    ],
  },
  'c6.shaji.pourReplay': {
    lines: [
      { who: 'Shaji', text: 'No lesson, no counting. Pull it high enough that the bench looks up.' },
    ],
    effects: ['set:replay.mode', 'set:c6.cook.start'],
  },
  'c6.shaji.cookoffer': {
    lines: [
      { text: 'Shaji sets two empty tumblers on the counter like a dare.' },
      { who: 'Shaji', text: 'Kunje, you have watched enough chaya. It is time the chaya watched you. Come behind the kettle.' },
    ],
    choices: [
      { text: 'Step behind the kettle', goto: 'c6.shaji.cookgo' },
      { text: 'Not today; the bench needs me', goto: 'c6.shaji.cooklater' },
    ],
  },
  'c6.shaji.cookgo': {
    lines: [
      { who: 'Shaji', text: 'Milk, tea, sugar, patience, height. The last two are the recipe.' },
    ],
    effects: ['set:c6.cook.start'],
  },
  'c6.shaji.cooklater': {
    lines: [
      { who: 'Shaji', text: 'The kettle takes no offense. It has outlasted braver refusals than yours.' },
    ],
  },
  'c6.cook.finish': {
    lines: [
      { text: 'The last glass goes to a poler who never ordered and was always going to get one.' },
      { who: 'Shaji', text: 'Wrist, height, froth, no funeral for the spills. Kunje, I promote you: customer to nuisance. My highest rank.' },
    ],
    effects: ['clear:c6.cook.start', 'set:c6.cook.done'],
    choices: [
      {
        text: '"In Busan an ajumma tucked my hand under the bag. A thing given is heavier than a thing bought."',
        goto: 'c6.cook.twohands',
        when: { has: ['page.customs.twohands'] },
      },
      { text: 'Ask why the glass rides with one hand underneath', goto: 'c6.cook.flourish' },
    ],
  },
  'c6.cook.twohands': {
    lines: [
      { who: 'Shaji', text: 'Then Busan and this bench agree, kunje. The hand under the glass says: this is given, not merely sold.' },
      { text: 'He serves the next glass with one hand under it, a little more visibly than usual.' },
    ],
  },
  'c6.cook.flourish': {
    lines: [
      { who: 'Shaji', text: 'The top hand pours; the bottom hand gives. A glass with a hand under it is offered, kunje, not just delivered.' },
    ],
  },

  // ---------------- Appu, translator of heads ----------------
  'c6.appu.first': {
    lines: [
      { who: 'Appu', text: 'I am Appu. I translate heads. Also I rate things. The jetty: okay. You walking here from another ocean: ADIPOLI.' },
      { who: 'Appu', text: 'Adipoli means excellent. You may use it, no fee, because you are Mariamma ammachi’s guest.' },
    ],
    effects: ['set:met.appu', 'journal:words.adipoli'],
  },
  'c6.appu.race': {
    lines: [
      { who: 'Appu', text: 'I SAW YOU. Your oar went wrong two times and then RIGHT the rest of the times. Adipoli!' },
      { who: 'Appu', text: 'When I am big I will be the singer, not a rower. The singer steers a hundred people with one throat.' },
    ],
    effects: ['set:c6.appu2'],
  },
  'c6.appu.idle': {
    lines: [
      { who: 'Appu', text: 'Practice with me. I wobble, you answer.' },
      { text: 'You wobble back. He grades it with a fisherman’s squint: passable, improving, adipoli.' },
    ],
    choices: [
      { text: '"Appu, where was I supposed to be?"', goto: 'c6.appu.thread' },
      { text: 'One more wobble', goto: 'c6.appu.threadNo' },
    ],
  },
  'c6.appu.thread': {
    lines: [
      { who: 'Appu', text: 'You forgot? Even the herons know your schedule. Ask the red string; it gossips less than the aunties.' },
    ],
    effects: ['thread:'],
  },
  'c6.appu.threadNo': {
    lines: [{ text: 'He wobbles approvingly. Some appointments can wait for a good wobble.' }],
  },

  // ---------------- Kuttan, toddy tapper and philosopher ----------------
  'c6.kuttan.first': {
    lines: KUTTAN_HELLO,
    effects: ['set:met.kuttan', 'journal:people.kuttan'],
  },
  // First met with the chaya already drunk: hello, then straight to the sky.
  'c6.kuttan.meet': {
    lines: KUTTAN_HELLO,
    effects: ['set:met.kuttan', 'journal:people.kuttan'],
    next: 'c6.kuttan.smell',
  },
  'c6.kuttan.smell': {
    lines: [
      { who: 'Kuttan', text: 'Stand still. Breathe. Wet earth, hot tin. From up a palm you can watch it walking back across the lagoon, grey as an elephant.' },
    ],
    next: 'c6.rain.arrives',
  },
  // The c6.rain flag flips the map to the monsoon mood and starts the rain
  // audio the moment this node is entered, so the sky does the describing.
  // What remains is only what a man up a palm would actually shout.
  'c6.rain.arrives': {
    lines: [
      { who: 'Kuttan', text: 'HA! There she is.' },
      { who: 'Kuttan', text: 'Edavappathi, kunje, back from her dry week. Stand in it a minute; reunions matter here.' },
    ],
    effects: ['set:c6.rain', 'journal:customs.monsoon'],
  },
  'c6.kuttan.rain': {
    lines: [
      { who: 'Kuttan', text: 'You planned around the rain, I saw. We plan WITH it.' },
      { who: 'Kuttan', text: 'Fish move, roofs get tested, kallu tastes better. The rain does not care who curses it, which is a kind of wisdom.' },
    ],
    effects: ['set:c6.kuttan2'],
  },
  'c6.kuttan.idle': {
    lines: [
      { who: 'Kuttan', text: 'A poler went by this morning and never waved. Twenty years he has not waved. Consistency is also a friendship.' },
    ],
  },

  // ---------------- Omana, coir cooperative ----------------
  'c6.omana.first': {
    lines: [
      { text: 'A woman rolls coconut fiber against her thigh, and rope simply happens.' },
      { who: 'Omana', text: 'Husk soaks six months in the canal before it is rope. Patience is the raw material; coconut is the excuse.' },
      { who: 'Omana', text: 'The cooperative is eleven women and one ledger. The rope holds boats. The ledger holds the eleven of us.' },
    ],
    effects: ['set:met.omana', 'journal:people.omana'],
    next: 'c6.omana.rope',
  },
  'c6.omana.rope': {
    lines: [
      { who: 'Omana', text: 'Your legs are younger than my afternoon. This coil goes to Varkey at the bank; race season eats rope like rice.' },
      { who: 'Omana', text: 'If he squeezes it and makes his face, make the face back. That is negotiation here.' },
    ],
    effects: ['set:c6.rope.errand', 'errand:coir-rope', 'set:errand.coir-rope'],
  },
  'c6.omana.paddy': {
    lines: [
      { who: 'Omana', text: 'See the flooded field? Pokkali rice, feet in brackish water. After harvest the tide comes in and the prawns take the stubble.' },
      { who: 'Omana', text: 'The field works both shifts.' },
    ],
    effects: ['set:c6.omana2', 'journal:customs.pokkali'],
  },
  'c6.omana.idle': {
    lines: [
      { who: 'Omana', text: 'Rope cannot be hurried and cannot be fooled. That is why we like it better than most committees.' },
    ],
  },

  // ---------------- Divakaran Master, the reading room ----------------
  'c6.lib.first': {
    lines: [
      { text: 'One room, one ceiling fan, four newspapers on sticks. A sign says: GRANDHASALA. READING ROOM.' },
      { who: 'Divakaran Master', text: 'I keep the fan going and the arguments fair. Generations learned letters here, Marx to the football page.' },
    ],
    effects: ['set:met.librarian', 'journal:people.librarian', 'journal:customs.readingroom'],
  },
  'c6.lib.rain': {
    lines: [
      { who: 'Divakaran Master', text: 'The rain always fills the room. Half come for the roof, half for the paper, all stay for the argument.' },
      { who: 'Divakaran Master', text: 'Travelers shelter here too, every monsoon for fifty years. Some of them even sign the register.' },
    ],
    effects: ['set:c6.lib2'],
  },
  'c6.lib.idle': {
    lines: [
      { who: 'Divakaran Master', text: 'The mural is new paint on an old habit. The book pours out readers; the wall said so before my hair went white.' },
    ],
  },

  // ---------------- Captain Varkey, the race ----------------
  'c6.varkey.first': {
    lines: VARKEY_HELLO,
    effects: ['set:met.varkey'],
  },
  'c6.varkey.meet': {
    lines: VARKEY_HELLO,
    effects: ['set:met.varkey'],
    next: 'c6.varkey.rope',
  },
  'c6.varkey.rope': {
    lines: [
      { who: 'Captain Varkey', text: 'From Omana chechi? Give here.' },
      { text: 'He squeezes the coil and makes a face like a man auditing his own funeral. You make the face back. He almost smiles.' },
      { who: 'Captain Varkey', text: 'Good lay. Tell her the club says nanni, and I said nothing.' },
    ],
    effects: ['set:c6.rope.given', 'errand.done', 'clear:errand.coir-rope'],
  },
  // How the song steers the boat is taught by the how-to card and by the
  // song itself, one safe ragged stroke at a time. Varkey only recruits.
  'c6.varkey.invite': {
    lines: [
      { who: 'Captain Varkey', text: 'You carried rope without dropping it and a letter across an ocean. I can teach rhythm to anything that reliable.' },
    ],
    choices: [
      { text: 'Take the empty seat', goto: 'c6.varkey.go' },
      { text: 'Not yet', goto: 'c6.varkey.later' },
    ],
  },
  'c6.varkey.go': {
    lines: [
      { who: 'Captain Varkey', text: 'Seat forty-one. Oar in, ears on the song. The boat will tell you the rest; she is older than your country.' },
    ],
    effects: ['set:c6.row.start'],
  },
  'c6.varkey.later': {
    lines: [
      { who: 'Captain Varkey', text: 'The seat stays empty and the water stays patient. Neither is a permanent condition.' },
    ],
  },
  'c6.rowed': {
    lines: [
      { text: 'Call, answer, strike. A hundred blades bite at once, a muscle the length of a street.' },
      { who: 'Captain Varkey', text: 'Ragged twice, on the beat the rest. I have seen worse from cousins.' },
      { text: 'Raghavan the stroke caller, who has not once looked at you, looks at you. One nod.' },
    ],
    effects: ['set:c6.row.done', 'clear:c6.row.start', 'journal:customs.vallamkali'],
  },
  'c6.varkey.after': {
    lines: [
      { who: 'Captain Varkey', text: 'Race day is when the rains steady again. We will row wet and win wet.' },
      { who: 'Captain Varkey', text: 'The lake gives less fish every year; the houseboats churn it like soup. But race week, the water is ours again.' },
    ],
    effects: ['set:c6.varkey2'],
  },
  'c6.varkey.rowAgain': {
    lines: [
      { who: 'Captain Varkey', text: 'Seat forty-one stays empty on practice evenings now. From this lot, that is a love letter.' },
    ],
    choices: [
      { text: 'Take seat forty-one again', when: { has: ['c6.row.done'] }, goto: 'c6.varkey.rowReplay' },
      { text: 'Watch from the bank tonight', goto: 'c6.varkey.idle' },
    ],
  },
  'c6.varkey.rowReplay': {
    lines: [
      { who: 'Captain Varkey', text: 'Oar in. Nobody counting your ragged ones. Row for the noise a hundred blades make together.' },
    ],
    effects: ['set:replay.mode', 'set:c6.row.start'],
  },
  'c6.varkey.idle': {
    lines: [
      { who: 'Captain Varkey', text: 'Stroke, stroke, STROKE. You cannot say it too many times. You can say it too few; that is called losing.' },
    ],
  },

  // ---------------- Joseph, home from the sea ----------------
  // The homecoming runs straight into the testimony; the star river waits
  // for a second visit, when he has had time to sit down.
  'c6.joseph.home': {
    lines: [
      { text: 'A duffel hits the floor with the sound of nine months ending. In the doorway, salt-stained and grinning: Joseph.' },
      { text: 'He sees his own letter on the shelf, soft at the creases, and stops. An able seaman, suddenly unable.' },
      { who: 'Joseph', text: 'You beat me home, friend. I sent you the slow road so I would win the race to my own kitchen.' },
    ],
    effects: ['set:c6.joseph.met'],
    next: 'c6.joseph.quiz',
  },
  'c6.joseph.quiz': {
    lines: [
      { who: 'Joseph', text: 'Now, report on my ship. Did Ben make you cry with the vinegar? Be honest.' },
      { text: 'Mariamma sets down three glasses. Testimony is taken with chaya.' },
    ],
    effects: ['set:c6.joseph.quizzed'],
    choices: [
      { text: '"I stood Neptune\'s court and rose a shellback. I fear nothing but dry land."', goto: 'c6.joseph.shellback', when: { has: ['c3.shellback'] } },
      { text: '"You had two helpings of sinigang one homesick night. Ben called it medicine."', goto: 'c6.joseph.sinigang', when: { has: ['page.dishes.sinigang'] } },
      { text: '"A galley hand does not inform on the galley."', goto: 'c6.joseph.code' },
    ],
  },
  'c6.joseph.shellback': {
    lines: [
      { who: 'Joseph', text: 'A shellback! The bosun kept that Neptune wig in the paint locker like a state secret the whole crew was in on. Frame it.' },
    ],
  },
  'c6.joseph.sinigang': {
    lines: [
      { who: 'Joseph', text: 'Two helpings, witnessed. Guilty. Ben knew my face was homesick before I did.' },
      { who: 'Joseph', text: 'Here we sour the fish with kudampuli and call it medicine too. Amma’s pot and Ben’s would argue all night and both win.' },
    ],
  },
  'c6.joseph.code': {
    lines: [
      { who: 'Joseph', text: 'Ha! The galley protects its own. So I will inform on myself: the vinegar got me my first week, and the sinigang cured my worst.' },
    ],
  },
  'c6.joseph.ocean': {
    lines: [
      { text: 'He looks at nothing a while, the way sailors do.' },
      { who: 'Joseph', text: 'Some watches I found the Mayu, your star river, running bank to bank over the same ocean.' },
      { who: 'Joseph', text: 'It made the distance one room. The letter said that badly.' },
    ],
    effects: ['set:c6.joseph.ocean'],
  },
  'c6.joseph.idle': {
    lines: [
      { who: 'Joseph', text: 'Nine months of watches to sleep off, and Amma wakes me only for meals. It is the correct system; do not tell the sea.' },
    ],
  },

  // ---------------- Moosa, the jetty office ----------------
  'c6.moosa.first': {
    lines: MOOSA_HELLO,
    effects: ['set:met.moosa'],
  },
  'c6.moosa.meet': {
    lines: MOOSA_HELLO,
    effects: ['set:met.moosa'],
    next: 'c6.moosa.berth',
  },
  'c6.moosa.berth': {
    lines: [
      { who: 'Moosa', text: 'Your road goes north. My buyers sit in Khari Baoli, the spice street of Delhi; the seths there hold every berth out of Bombay.' },
      { who: 'Moosa', text: 'Three days by rail. Ask for Sethji Onkar Nath, and do not let his frown fool you into leaving.' },
    ],
    effects: ['set:c6.depart.ready'],
  },
  'c6.moosa.sail': {
    lines: [
      { who: 'Moosa', text: 'The ticket is bought and the north is asking. Well, traveler?' },
    ],
    choices: [
      { text: 'Take the train north, toward Delhi', goto: 'c6.depart' },
      { text: 'Not yet; the village still has my mornings', goto: 'c6.moosa.wait' },
    ],
  },
  'c6.moosa.wait': {
    lines: [
      { who: 'Moosa', text: 'Take your mornings. The monsoon keeps its schedule better than any of us.' },
    ],
  },
  'c6.depart': {
    lines: [
      { text: 'Mariamma has come down to the jetty with food for four days and advice for forty. The little umbrella waves from the bank until the boat turns.' },
      { text: 'Then the northbound train: three days of paddy, hills, wheat, haze.' },
      { text: 'Somewhere ahead, a walled city is waiting out the heat for the same rain you left.' },
    ],
    effects: ['travel:delhi,42,26,up'],
  },
  'c6.moosa.idle': {
    lines: [
      { who: 'Moosa', text: 'Forty sacks yesterday, forty sacks today. On this jetty, boring news is the good kind.' },
    ],
    choices: [
      { text: '"Moosa, remind me where I was going?"', goto: 'c6.moosa.thread' },
      { text: 'Leave him to the manifest', goto: 'c6.moosa.threadNo' },
    ],
  },
  'c6.moosa.thread': {
    lines: [
      { who: 'Moosa', text: 'A cargo that forgets its port. I have shipped stranger. Check the wrist, friend; red thread clears customs everywhere.' },
    ],
    effects: ['thread:'],
  },
  'c6.moosa.threadNo': {
    lines: [{ who: 'Moosa', text: 'Good. Stand there and be boring news with me a while.' }],
  },

  // ---------------- Chasca, under the umbrella ----------------
  'c6.chasca.wait': {
    lines: [
      { who: 'Chasca', text: 'The soup-eater! No photograph yet. The sky here is loading its answer; come back when it argues.' },
    ],
  },
  'c6.chasca.photo': {
    lines: [
      { text: 'She stands at the jetty’s end under a big black umbrella, dry as an idea, while the monsoon roars.' },
      { who: 'Chasca', text: 'PERFECT. Rain behind you, channel silver. Every chapter you stand where the land runs out; have you noticed? Say fuzzy pickles!' },
    ],
    effects: ['set:met.chascaC6', 'set:photo.flash', 'set:photo.c6.jetty'],
  },
  'c6.chasca.album': {
    lines: [
      { who: 'Chasca', text: 'A star plain, a grey pier, a monsoon jetty. I develop them all at the end. Whose end? The journey decides that, not me.' },
    ],
  },

  // ---------------- the post office ----------------
  'c6.post.pilar': {
    lines: [
      { text: 'One plank, one stamp pad, mail under a tin of cardamom. The clerk slides over an envelope with VOTE written on the back.' },
    ],
    effects: ['letter:kochi.pilar'],
  },
  'c6.post.hana': {
    lines: [
      { text: 'The clerk checks the ledger twice and produces an envelope postmarked with a small inland sea.' },
    ],
    effects: ['letter:kochi.hana'],
  },
  'c6.post.idle': {
    lines: [
      { text: 'JETTY OFFICE. Below, chalked: BOAT WHEN IT COMES. RAIN WHEN IT LIKES.' },
    ],
  },

  // ---------------- examines: new kinds ----------------
  'c6.ex.paddy': {
    lines: [
      { text: 'Young pokkali rice, tall and unbothered with its feet in brackish water. After harvest, the tide farms prawns here.' },
    ],
    effects: ['journal:customs.pokkali'],
  },
  'c6.ex.laterite': {
    lines: [{ text: 'Laterite, the red road of the coast. It stains hems and football knees the same proud color.' }],
  },
  'c6.ex.palm': {
    lines: [
      { text: 'A coconut palm leaning the way sixty years of wind suggested. Nut, husk, frond, sap, shade: all of it gets used.' },
    ],
  },
  'c6.ex.banana': {
    lines: [{ text: 'Banana leaves wide as tables, which is exactly what they will become. One is torn; the wind eats first.' }],
  },
  'c6.ex.vallam': {
    lines: [
      { text: 'A vallam hauled out on the bank, planks stitched with coconut rope. The backwater’s bicycle.' },
    ],
  },
  'c6.ex.kettuvallam': {
    lines: [
      { text: 'A kettuvallam, the tied boat: no nails, only coir. It hauled rice for generations; its cousins carry tourists now.' },
    ],
  },
  'c6.ex.coirrack': {
    lines: [
      { text: 'Golden rope drying on the rack, from husk that soaked six months in the canal. Patience, with a product.' },
    ],
  },
  'c6.ex.stall': {
    lines: [
      { text: 'Kettle, glasses, griddle, awning: a complete civilization in four square meters.' },
    ],
  },
  'c6.ex.mural': {
    lines: [
      { text: 'A whitewashed wall: a red flag on one panel, an open book pouring out little painted readers on the other.' },
    ],
  },
  'c6.ex.veedu': {
    lines: [
      { text: 'A tile-roofed veedu, painted with Gulf wages. The deep eaves mean the sky here is taken seriously.' },
    ],
  },
  'c6.ex.shaap': {
    lines: [
      { text: 'KALLU SHAAP. The toddy shed keeps a polite distance from the church, the temple, and most afternoons.' },
    ],
  },
  'c6.ex.aduppu': {
    lines: [
      { text: 'A clay hearth burning coconut husk. The smoke has seasoned the rafters, the pots, and the family stories.' },
    ],
  },
  // ---------------- examines: the love pass ----------------
  'c6.ex.nilavilakku': {
    lines: [
      { text: 'A brass nilavilakku by the doorway, lit at dusk without fail: a small flame with the enormous job of meaning home.' },
    ],
  },
  'c6.ex.umbrellas': {
    lines: [
      { text: 'Three black umbrellas open on the veranda like bats airing before the night shift.' },
    ],
  },
  'c6.ex.umbrellas.rain': {
    lines: [
      { text: 'Two umbrellas drip on the veranda, off duty. The third is out in the weather, earning its keep.' },
    ],
  },
  'c6.ex.jacktree': {
    lines: [
      { text: 'Jackfruit the size of good luggage. You admire it from a radius the whole village agrees on.' },
    ],
  },
  'c6.ex.peppervine': {
    lines: [
      { text: 'A pepper vine up the areca palm. These small green berries once towed Roman ships across an ocean.' },
    ],
  },
  'c6.ex.glassrack': {
    lines: [
      { text: 'A dozen chaya glasses drying upside down in ranks. Shaji calls it the regiment.' },
    ],
  },
  'c6.ex.cricketwall': {
    lines: [
      { text: 'Three stumps chalked on the wall, redrawn a little taller every summer. The boundary is wherever the arguing says.' },
    ],
    effects: ['set:c6.stumps.seen'],
  },
  'c6.ex.tennisball': {
    lines: [
      { text: 'One bald tennis ball in the gutter. Somewhere nearby, a wall knows the whole story.' },
    ],
  },
  'c6.ex.tennisball.six': {
    lines: [
      { text: 'So the gutter is the boundary. One bald ball, retired exactly where the last big six put it.' },
    ],
  },
  'c6.ex.oars': {
    lines: [
      { text: 'Oars lean at the jetty in order of height, like a family photo. None are labeled; everybody simply knows.' },
    ],
  },
  'c6.ex.oars.after': {
    lines: [
      { text: 'Oars in order of height, one blade still wet. None are labeled, and one of them is yours.' },
    ],
  },
  'c6.ex.vallam.after': {
    lines: [
      { text: 'Hauled out with her oars shipped, still dripping. Your shoulders count her seats differently now.' },
    ],
  },
  'c6.ex.spicesacks': {
    lines: [
      { text: 'Sacks stenciled CARDAMOM. The smell escapes the jute anyway; fragrance has never respected packaging.' },
    ],
  },
  'c6.ex.spicesacks.manifest': {
    lines: [
      { text: 'Cardamom under tarpaulin. The next consignment north has your name penciled in the margin.' },
    ],
  },
  'c6.ex.postbox': {
    lines: [
      { text: 'A post box painted the stubborn red of an empire that left. It swallows the village’s love twice a week.' },
    ],
  },
  'c6.ex.postbox.carried': {
    lines: [
      { text: 'Letters for Sharjah, Muscat, Kochi. You carried one by hand; the box pretends not to be impressed.' },
    ],
  },
  'c6.ex.lungiline': {
    lines: [
      { text: 'Lungis drying on the line, flapping like the flags of a calm country. The rain will undo this; nobody minds.' },
    ],
  },
  'c6.ex.huskpile': {
    lines: [
      { text: 'Coconut husks bound for the canal and six months of soaking. Patience, stacked in public.' },
    ],
  },
  'c6.ex.hyacinth': {
    lines: [
      { text: 'Water hyacinth drifting in a raft of its own opinions.' },
    ],
  },
  'c6.ex.waterlily': {
    lines: [
      { text: 'A waterlily holding the grey sky like it ordered it specially. The frogs treat the pads as furniture.' },
    ],
  },
  'c6.ex.anthill': {
    lines: [
      { text: 'An anthill, red as the lanes. Nobody disturbs it and nobody says why; both facts feel related.' },
    ],
    effects: ['set:c6.ant.seen'],
  },
  'c6.ex.anthill.again': {
    lines: [
      { text: 'Still there, still busy. Whatever the arrangement is, it is clearly working.' },
    ],
  },
  'c6.ex.busstop': {
    lines: [
      { text: 'A bus shelter, one bench, one timetable. The timetable carries forty annotations, all in disagreement.' },
    ],
  },
  'c6.ex.posterwall': {
    lines: [
      { text: 'A temple festival poster peeling in the damp: elephants, drummers, a date the rain has half eaten.' },
    ],
  },
  'c6.ex.fallennut': {
    lines: [
      { text: 'A coconut down since the last wind. By custom the first to notice it may claim it.' },
    ],
    effects: ['set:egg.c6.nut'],
  },
  'c6.egg.thud': {
    lines: [
      { text: 'A second nut rests two steps from where you just stood. The tree missed; around here that is the traditional greeting.' },
    ],
    effects: ['set:egg.c6.thud'],
  },
  'c6.egg.lookup': {
    lines: [
      { text: 'You glance up before stepping into the shade, the way everyone born here does.' },
    ],
    effects: ['set:egg.c6.lookup'],
  },
  'c6.egg.echo': {
    lines: [
      { text: 'From this plank the print matches: silver water, sky mid-argument. Fifty years, same opening line.' },
    ],
    effects: ['set:egg.c6.echo'],
  },
  'c6.ex.kallupalm': {
    lines: [
      { text: 'A palm notched all the way up, a pot lashed under the cut spathe. Whoever climbed it was up there before you woke.' },
    ],
    effects: ['set:c6.seen.tapper'],
  },
  'c6.ex.kallupalm.again': {
    lines: [
      { text: 'The pot has filled a finger since you looked. Nobody is coming for it until the light goes.' },
    ],
  },
  'c6.ex.vaikkol': {
    lines: [
      { text: 'A straw stack combed downward round a pole, so the first rain runs off it instead of into it.' },
    ],
  },
  'c6.ex.cheenavala': {
    lines: [
      { text: 'The cheena vala: a net the size of a room on teak arms, bowing to the water for about a bucket. Not efficient. It is the horizon.' },
    ],
    effects: ['set:c6.seen.vala'],
  },
  'c6.ex.cheenavala.again': {
    lines: [
      { text: 'It dips again. Somebody up on the platform says a number, and somebody below disagrees warmly.' },
    ],
  },
  'c6.ex.reeds': {
    lines: [
      { text: 'Reeds standing in their own reflection. Something small moves off through them and declines to explain itself.' },
    ],
  },
  'c6.ex.ammi': {
    lines: [
      { text: 'A grinding stone worn into a shallow smile by three generations of chutney.' },
    ],
  },
  'c6.ex.leafstack': {
    lines: [
      { text: 'Banana leaves stacked, narrow ends all one way. Even in a pile they keep their table manners.' },
    ],
  },
  'c6.ex.leafstack.after': {
    lines: [
      { text: 'A few leaves left from the sadya. Nothing in this kitchen is allowed to retire.' },
    ],
  },
  'c6.ex.cat': {
    lines: [
      { text: 'A cat asleep in the warm corner, employed at the rank of kitchen supervisor.' },
    ],
    effects: ['set:c6.cat.seen'],
  },
  'c6.ex.cat.again': {
    lines: [
      { text: 'Still asleep. One ear has rotated toward the fish curry pot.' },
    ],
  },
  // ---------------- examines: shared kinds, this map's voice ----------------
  'c6.ex.water': {
    lines: [
      { text: 'The channel is the street. Green glass water and a stillness between rains that feels deliberate.' },
    ],
  },
  'c6.ex.pier': {
    lines: [{ text: 'Jetty planks, silvered by sun and fattened by rain. They give slightly, like a handshake.' }],
  },
  'c6.ex.chappals': {
    lines: [
      { text: 'Two pairs of chappals kicked off by the door. A door with shoes outside it is not a closed door.' },
    ],
  },
  'c6.ex.door': {
    lines: [
      { text: 'Latched, not locked. The doormat says WELCOME in two scripts.' },
    ],
  },
  'c6.ex.pot': {
    lines: [{ text: 'A clay pot of kallu, sweet this morning, sour by dark: the strictest clock in the village.' }],
  },
  'c6.ex.pot.kitchen': {
    lines: [{ text: 'The meen curry pot, resting. Day-two curry outranks day-one curry.' }],
  },
  'c6.ex.uri': {
    lines: [
      { text: 'A clay pot slung from the rafters, because ants can climb anything except air.' },
    ],
  },
  'c6.ex.spicesacks.kitchen': {
    lines: [{ text: 'Rice sacks folded down to the level the household is at.' }],
  },
  'c6.ex.chappals.kitchen': {
    lines: [{ text: 'Chappals inside the door rather than outside it: rain is expected, and everybody agrees.' }],
  },
  'c6.ex.umbrellas.kitchen': {
    lines: [{ text: 'Three umbrellas in the corner, dripping a small honest map of the last time anyone went out.' }],
  },
  'c6.ex.umbrella.gift': {
    lines: [
      { text: 'Three tall umbrellas, and one from Japan, small as a mango, standing by the door like a guest of honor.' },
    ],
  },
  'c6.ex.shrub': {
    lines: [{ text: 'Pandanus thicket, spiny and satisfied. It hems the village the way commas hem a long sentence.' }],
  },
  'c6.ex.bench': {
    lines: [{ text: 'The chaya bench. Load rating: three philosophers, or four football arguments.' }],
  },
  'c6.ex.farol': {
    lines: [{ text: 'A lamp on a pole, wired with hope and tape. In the rain its light goes soft.' }],
  },
  'c6.ex.tuft': {
    lines: [{ text: 'Grass fat with the coming rain. Even the weeds here look like they eat well.' }],
  },
  'c6.ex.wallint': {
    lines: [{ text: 'Smoke-cured walls, a rice-mill calendar, and Joseph in his crisp merchant navy whites.' }],
  },
  'c6.ex.shelf': {
    lines: [{ text: 'Steel tins in parade order, and a kudampuli tin that outranks the others by smell alone.' }],
  },
  'c6.ex.mat': {
    lines: [{ text: 'Woven mats where the sadya guests will sit. The floor is furniture here.' }],
  },
  'c6.ex.stool': {
    lines: [
      { text: 'A kitchen stool worn smooth by three generations of supervised tasting.' },
    ],
  },
  'c6.ex.flooroxide': {
    lines: [
      { text: 'Red oxide, polished with coconut oil and fifty years of bare feet. Your reflection is upside down and slightly orange.' },
    ],
  },
  'c6.ex.rugcoir': {
    lines: [
      { text: 'A coir mat, rough enough to take the outside off your feet, which is the whole job.' },
    ],
  },
};

/** Examine arms: new kinds get untagged fallbacks, shared kinds speak only on this map. */
export const KERALA_EXAMINES: Record<string, ExamineArm[]> = {
  blocked: [{ map: 'kerala', node: 'c6.ex.wall' }, { map: 'mariamma-veedu', node: 'c6.ex.wall' }],
  // The veedu is skinned to laterite, red oxide and coir in
  // `art/sets/kerala.ts`; these are the words that go with those surfaces.
  floorEarth: [{ map: 'mariamma-veedu', node: 'c6.ex.flooroxide' }],
  rug: [{ map: 'mariamma-veedu', node: 'c6.ex.rugcoir' }],
  paddy: [{ node: 'c6.ex.paddy' }],
  laterite: [{ node: 'c6.ex.laterite' }],
  palm: [
    { when: { has: ['egg.c6.thud'], not: ['egg.c6.lookup'] }, node: 'c6.egg.lookup' },
    { node: 'c6.ex.palm' },
  ],
  banana: [{ node: 'c6.ex.banana' }],
  vallam: [
    { when: { has: ['c6.row.done'] }, node: 'c6.ex.vallam.after' },
    { node: 'c6.ex.vallam' },
  ],
  kettuvallam: [{ node: 'c6.ex.kettuvallam' }],
  coirrack: [{ node: 'c6.ex.coirrack' }],
  thattukada: [{ node: 'c6.ex.stall' }],
  muralwall: [{ node: 'c6.ex.mural' }],
  veedu: [{ node: 'c6.ex.veedu' }],
  shaapsign: [{ node: 'c6.ex.shaap' }],
  aduppu: [{ node: 'c6.ex.aduppu' }],
  postsign: [
    // Pilar writes only to someone who has met her at the bridge.
    { when: { has: ['met.pilar'], not: ['letter.read.kochi.pilar'] }, node: 'c6.post.pilar' },
    { when: { not: ['letter.read.kochi.hana'] }, node: 'c6.post.hana' },
    { node: 'c6.post.idle' },
  ],
  nilavilakku: [{ node: 'c6.ex.nilavilakku' }],
  umbrellas: [
    { map: 'mariamma-veedu', when: { has: ['c6.letter.delivered'] }, node: 'c6.ex.umbrella.gift' },
    { map: 'mariamma-veedu', node: 'c6.ex.umbrellas.kitchen' },
    { when: { has: ['c6.rain'] }, node: 'c6.ex.umbrellas.rain' },
    { node: 'c6.ex.umbrellas' },
  ],
  jacktree: [{ node: 'c6.ex.jacktree' }],
  peppervine: [{ node: 'c6.ex.peppervine' }],
  glassrack: [{ node: 'c6.ex.glassrack' }],
  cricketwall: [{ node: 'c6.ex.cricketwall' }],
  tennisball: [
    { when: { has: ['c6.stumps.seen'] }, node: 'c6.ex.tennisball.six' },
    { node: 'c6.ex.tennisball' },
  ],
  oars: [
    { when: { has: ['c6.row.done'] }, node: 'c6.ex.oars.after' },
    { node: 'c6.ex.oars' },
  ],
  spicesacks: [
    { map: 'mariamma-veedu', node: 'c6.ex.spicesacks.kitchen' },
    { when: { has: ['c6.depart.ready'] }, node: 'c6.ex.spicesacks.manifest' },
    { node: 'c6.ex.spicesacks' },
  ],
  uri: [{ node: 'c6.ex.uri' }],
  postbox: [
    { when: { has: ['c6.letter.delivered'] }, node: 'c6.ex.postbox.carried' },
    { node: 'c6.ex.postbox' },
  ],
  lungiline: [{ node: 'c6.ex.lungiline' }],
  huskpile: [{ node: 'c6.ex.huskpile' }],
  hyacinth: [{ node: 'c6.ex.hyacinth' }],
  waterlily: [{ node: 'c6.ex.waterlily' }],
  anthill: [
    { when: { has: ['c6.ant.seen'] }, node: 'c6.ex.anthill.again' },
    { node: 'c6.ex.anthill' },
  ],
  busstop: [{ node: 'c6.ex.busstop' }],
  posterwall: [{ node: 'c6.ex.posterwall' }],
  fallennut: [
    // Come back to the spot and the grove has sent a second one. The tree
    // missed; that is how this coast says hello.
    { when: { has: ['egg.c6.nut'], not: ['egg.c6.thud'] }, node: 'c6.egg.thud' },
    { node: 'c6.ex.fallennut' },
  ],
  kallupalm: [
    { when: { has: ['c6.seen.tapper'] }, node: 'c6.ex.kallupalm.again' },
    { node: 'c6.ex.kallupalm' },
  ],
  vaikkol: [{ node: 'c6.ex.vaikkol' }],
  cheenavala: [
    { when: { has: ['c6.seen.vala'] }, node: 'c6.ex.cheenavala.again' },
    { node: 'c6.ex.cheenavala' },
  ],
  reeds: [{ map: 'kerala', node: 'c6.ex.reeds' }],
  ammi: [{ node: 'c6.ex.ammi' }],
  leafstack: [
    { when: { has: ['c6.sadya.done'] }, node: 'c6.ex.leafstack.after' },
    { node: 'c6.ex.leafstack' },
  ],
  keralacat: [
    { when: { has: ['c6.cat.seen'] }, node: 'c6.ex.cat.again' },
    { node: 'c6.ex.cat' },
  ],
  water: [{ map: 'kerala', node: 'c6.ex.water' }],
  pierdeck: [
    // The jetty from the monsoon photo: the view, fifty years apart.
    { map: 'kerala', when: { has: ['photo.c6.jetty'], not: ['egg.c6.echo'] }, node: 'c6.egg.echo' },
    { map: 'kerala', node: 'c6.ex.pier' },
  ],
  doorShut: [{ map: 'kerala', node: 'c6.ex.door' }],
  chappals: [
    { map: 'mariamma-veedu', node: 'c6.ex.chappals.kitchen' },
    { node: 'c6.ex.chappals' },
  ],
  pot: [
    { map: 'kerala', node: 'c6.ex.pot' },
    { map: 'mariamma-veedu', node: 'c6.ex.pot.kitchen' },
  ],
  shrub: [{ map: 'kerala', node: 'c6.ex.shrub' }],
  bench: [{ map: 'kerala', node: 'c6.ex.bench' }],
  farol: [{ map: 'kerala', node: 'c6.ex.farol' }],
  tuft: [{ map: 'kerala', node: 'c6.ex.tuft' }],
  wallInt: [{ map: 'mariamma-veedu', node: 'c6.ex.wallint' }],
  shelf: [{ map: 'mariamma-veedu', node: 'c6.ex.shelf' }],
  mat: [{ map: 'mariamma-veedu', node: 'c6.ex.mat' }],
  stool: [{ map: 'mariamma-veedu', node: 'c6.ex.stool' }],
};

/** Event-triggered nodes, listed with their gating so tests can walk them. */
export const KERALA_EVENTS = [
  { node: 'c6.arrive' },
  { when: { has: ['c6.row.start'] }, node: 'c6.rowed' },
  { when: { has: ['c6.sadya.start'] }, node: 'c6.sadya.served' },
  { when: { has: ['c6.cook.start'] }, node: 'c6.cook.finish' },
];
