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
    // At his counter, in front of the range, and staying there: a cook does
    // not wander off from three pots.
    pos: [3, 2],
    range: 0,
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
      { when: { has: ['c3.cook.done'], not: ['c3.ben.messtold', 'c3.shellback'] }, node: 'c3.ben.mess' },
      // A ship keeps its stories in the crew, not the hull. Once you have
      // cooked with him you are galley, and the galley's own legend is yours.
      { when: { has: ['c3.cook.done'], not: ['c3.her.told'] }, node: 'c3.ben.her' },
      { when: { has: ['c3.shellback'], not: ['c3.feast'] }, node: 'c3.ben.feast' },
      { when: { has: ['c3.cook.done'] }, node: 'c3.ben.cookagain' },
      { node: 'c3.ben.idle' },
    ],
  },
  {
    id: 'joseph',
    name: 'Joseph',
    map: 'ship',
    // One tile in off the rail, kneeling at his rust: the port lane is the
    // only way forward on this side, and a man with a wire brush is a wall.
    pos: [16, 11],
    range: 0,
    look: {
      skin: '#7a4a2e',
      hair: '#1c1410',
      cloth: '#d9694a',
      stripe: '#f2e6d0',
      hat: '#e8dcc4',
      hatStyle: 'none',
    },
    entry: [
      { when: { has: ['c3.baon', 'c3.met.joseph'], not: ['c3.baon.done'] }, node: 'c3.jos.baon.known' },
      { when: { has: ['c3.baon'], not: ['c3.baon.done'] }, node: 'c3.jos.baon' },
      { when: { not: ['c3.met.joseph'] }, node: 'c3.jos.first' },
      { when: { has: ['c3.shellback'], not: ['joseph.letter'] }, node: 'c3.jos.entrust' },
      { when: { has: ['joseph.letter'] }, node: 'c3.jos.after' },
      { node: 'c3.jos.idle' },
    ],
  },
  {
    // Suffixed like every villager who appears in more than one chapter
    // (hanaC5, chascaC3): Shionoura's homecoming Hana owns the plain id,
    // and a duplicate here made the red thread aim at a ship no door
    // reaches, so it rested for every Shionoura task that named her.
    id: 'hanaC3',
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
      { when: { has: ['c3.stars.done'] }, node: 'c3.hana.starsagain' },
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
      // The starter rides with her: her journal line says so.
      prop: 'jar',
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
      // Found the galley before the captain? Then Ben already gave the
      // orders she was going to give, and she knows it.
      { when: { has: ['c3.met.ben'], not: ['c3.met.rios'] }, node: 'c3.rios.first.late' },
      { when: { has: ['c2.casero'], not: ['c3.met.rios'] }, node: 'c3.rios.first.casero' },
      { when: { not: ['c3.met.rios'] }, node: 'c3.rios.first' },
      // Pilar writes only to people who owe her a sea thing; everyone else
      // gets Petro's letter alone.
      { when: { has: ['c3.shellback', 'pilar.sea'], not: ['letter.read.c3.pilar'] }, node: 'c3.rios.mail' },
      { when: { has: ['letter.read.c3.pilar'], not: ['letter.read.c3.petro'] }, node: 'c3.rios.mail2' },
      { when: { has: ['c3.shellback'], not: ['letter.read.c3.petro'] }, node: 'c3.rios.mail.one' },
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
  // The walls themselves; without this arm they fall through to the
  // village's adobe line, which reads strangely far from the altiplano.
  'c3.ex.wall': {
    lines: [
      { text: 'White steel, painted so many times the rivets are soft shapes. Under the layers, the sea keeps trying to get in.' },
    ],
  },
  // ---------------- boarding and arrival ----------------
  'c3.board': {
    lines: [
      { text: 'The tide and the paperwork finally agree. The launch takes you out past the break to the MV Yacana.' },
      { text: 'Then the ladder. Thirty rungs, each with an opinion.' },
    ],
    effects: ['travel:ship'],
  },
  'c3.arrive': {
    lines: [
      { text: 'A new deck underfoot, humming: the engine, four decks down, a heartbeat too big to hear.' },
      { text: 'Somewhere below, someone is frying garlic. Thirty-one days to Japan, and the crossing smells edible.' },
    ],
    effects: ['set:c3.arrived'],
  },

  // ---------------- Capitana Ríos, la mar's own ----------------
  'c3.rios.first.casero': {
    lines: [
      { who: 'Capitana Ríos', text: 'Aboard, then. On land you were somebody’s casero; at sea that makes you crew. Better than paperwork.' },
      { who: 'Capitana Ríos', text: 'Mang Ben runs the galley, so he runs the morale. Report to him. He outranks me.' },
    ],
    effects: ['set:c3.met.rios'],
    choices: [
      { text: '"La mar. Don Simón taught me."', goto: 'c3.rios.lamar.knows', when: { has: ['page.words.lamar'] } },
      { text: 'Ask why she says la mar', goto: 'c3.rios.lamar' },
      { text: 'Go find the galley', goto: 'c3.rios.go' },
    ],
  },
  'c3.rios.first': {
    lines: [
      { text: 'The captain looks up from a clipboard.' },
      { who: 'Capitana Ríos', text: 'The galley hand. Petro says your hands are clean. A ship floats on that as much as on steel.' },
      { who: 'Capitana Ríos', text: 'Mang Ben runs the galley, so he runs the morale. Report to him.' },
    ],
    effects: ['set:c3.met.rios'],
    choices: [
      { text: '"La mar. Don Simón taught me."', goto: 'c3.rios.lamar.knows', when: { has: ['page.words.lamar'] } },
      { text: 'Ask why she says la mar', goto: 'c3.rios.lamar' },
      { text: 'Go find the galley', goto: 'c3.rios.go' },
    ],
  },
  'c3.rios.first.late': {
    lines: [
      { text: 'The captain looks up from a clipboard, and then at the galley grease on your sleeve.' },
      { who: 'Capitana Ríos', text: 'Ben found you before I did. He finds everyone first; it is the garlic. Petro swears your hands are clean. Ben will find out if she was right.' },
    ],
    effects: ['set:c3.met.rios'],
    choices: [
      { text: '"La mar. Don Simón taught me."', goto: 'c3.rios.lamar.knows', when: { has: ['page.words.lamar'] } },
      { text: 'Ask why she says la mar', goto: 'c3.rios.lamar' },
      { text: 'Back to work', goto: 'c3.rios.work' },
    ],
  },
  'c3.rios.work': {
    lines: [
      { who: 'Capitana Ríos', text: 'Go on, then. One hand for you, one for the ship, and bus your own tray.' },
    ],
  },
  'c3.rios.lamar': {
    lines: [
      { who: 'Capitana Ríos', text: 'El mar is the thing on charts. La mar is the one who carries us, and could decline to.' },
      { who: 'Capitana Ríos', text: 'Call it superstition. I call it not arguing with my employer.' },
    ],
  },
  'c3.rios.lamar.knows': {
    lines: [
      { who: 'Capitana Ríos', text: 'Simón taught you, did he. Then you know my first rule: she is hard but fair. Work, and you eat.' },
    ],
  },
  'c3.rios.go': {
    lines: [
      { who: 'Capitana Ríos', text: 'Through the house door; follow the garlic. And bus your own tray.' },
    ],
  },
  'c3.rios.mail': {
    lines: [
      { text: 'The captain produces a canvas sack gone soft at the corners.' },
      { who: 'Capitana Ríos', text: 'Mail. Callao threw it aboard with the last launch. Two for you. This one is addressed in capitals, underlined twice.' },
    ],
    effects: ['letter:c3.pilar'],
  },
  'c3.rios.mail2': {
    lines: [
      { who: 'Capitana Ríos', text: 'A second envelope was stuck to the first. Grease spot on the flap. The better kind of letter.' },
    ],
    effects: ['letter:c3.petro'],
  },
  'c3.rios.mail.one': {
    lines: [
      { text: 'The captain produces a canvas sack gone soft at the corners.' },
      { who: 'Capitana Ríos', text: 'Mail. Callao threw it aboard with the last launch. One for you, grease spot on the flap. The better kind of letter.' },
    ],
    effects: ['letter:c3.petro'],
  },
  'c3.rios.landfall': {
    lines: [
      { who: 'Capitana Ríos', text: 'Land tomorrow. When you smell green, and the birds stop following and start leading, go stand at the bow.' },
      { who: 'Capitana Ríos', text: 'Ninety-two crossings and it still gets me. La mar hands you back. Do not miss it.' },
    ],
    effects: ['set:c3.complete'],
  },
  'c3.rios.after': {
    lines: [
      { who: 'Capitana Ríos', text: 'The Shionoura pilot boards at dawn. Until then the bow is yours.' },
    ],
  },
  'c3.rios.idle': {
    lines: [
      { who: 'Capitana Ríos', text: 'Four on, eight off, and the paperwork stands its own watch. The deck is better company today.' },
    ],
  },

  // ---------------- Mang Ben, the galley's heart ----------------
  'c3.ben.first': {
    lines: [
      { text: 'The galley frames a man mid-stir: three pots going, a towel over one shoulder like a sash of office.' },
      { who: 'Mang Ben', text: 'Ah, the new hands! Kain na, come and eat. Nobody stands in my doorway hungry; on this ship that is the entire constitution.' },
    ],
    effects: ['set:c3.met.ben', 'journal:people.ben', 'journal:words.kainna'],
    next: 'c3.ben.first2',
  },
  'c3.ben.first2': {
    lines: [
      { text: 'Rice, fried fish, coffee strong enough to stand the spoon up. He watches you eat like the evening news.' },
      { who: 'Mang Ben', text: 'Mang Ben. Kumusta? No, eat first, answer after. House rule two.' },
    ],
    effects: ['journal:dishes.galleycoffee'],
    // House rule three, said with your mouth still full: fed hands carry.
    next: 'c3.ben.baon',
  },
  'c3.ben.baon': {
    lines: [
      { who: 'Mang Ben', text: 'And since you are fed: favor na, anak. Joseph has the watch and forgot his night lunch again.' },
      { text: 'He tucks a cloth around a covered plate the way you tuck a blanket around a child.' },
      { who: 'Mang Ben', text: 'Port rail, forward. Walk it steady and it stays warm. Sige.' },
    ],
    effects: ['set:c3.baon', 'errand:ben-baon', 'set:errand.ben-baon'],
  },
  'c3.ben.wait': {
    lines: [
      { who: 'Mang Ben', text: 'Still holding the plate? It is getting philosophical under that cloth, anak. Port rail. Joseph.' },
    ],
  },
  'c3.ben.cookoffer': {
    lines: [
      { who: 'Mang Ben', text: 'Week three. The salad is a memory and the faces in my mess are long.' },
      { who: 'Mang Ben', text: 'Tonight, lutong bahay: home cooking, the medicine kind. Adobo, and sinigang for Joseph’s homesick face.' },
    ],
    effects: ['journal:words.lutongbahay', 'journal:dishes.sinigang'],
    choices: [
      { text: 'Roll up your sleeves', goto: 'c3.ben.cookstart' },
      { text: 'Not yet; the deck first', goto: 'c3.ben.cooklater' },
    ],
  },
  'c3.ben.cookstart': {
    lines: [
      { who: 'Mang Ben', text: 'Sige! Apron on. I call the pot, you feed it. Wrong answers allowed; that is how my aunties taught me.' },
    ],
    effects: ['set:c3.cook.start'],
  },
  'c3.ben.cooklater': {
    lines: [
      { who: 'Mang Ben', text: 'The pot is patient and so am I. One of us is lying, anak.' },
    ],
  },
  'c3.cooked': {
    lines: [
      { text: 'The pot settles, dark and glossy: garlic, soy, vinegar, and time.' },
      { who: 'Mang Ben', text: 'Masarap! Hear that word in the mess tonight and know you earned a piece of it.' },
      { text: 'At dinner Joseph has two helpings of sinigang. Medicine, administered.' },
    ],
    effects: ['clear:c3.cook.start', 'set:c3.cook.done', 'journal:dishes.adobo', 'journal:words.masarap'],
  },
  'c3.ben.mess': {
    lines: [
      { who: 'Mang Ben', text: 'Hear the mess tonight? Loud. A healthy heartbeat, anak.' },
      { who: 'Mang Ben', text: 'Also: the bosun keeps looking at the chart and grinning. Pollywogs should stretch. I say no more.' },
    ],
    // Said once, and then the galley goes back to offering you an apron.
    effects: ['set:c3.ben.messtold'],
  },
  // The thread about her, arriving the way ship stories always do: secondhand,
  // twice removed, and funnier every time it changes hands.
  'c3.ben.her': {
    lines: [
      { text: 'He is portioning tomorrow’s rice, counting scoops and losing the count.' },
      { who: 'Mang Ben', text: 'You chop quiet, anak. This run had a loud one once, the cook who taught me said.' },
      { who: 'Mang Ben', text: 'A passenger girl who would not stay out of the galley. Zoila. Peeled onions and sang the whole watch.' },
    ],
    choices: [
      { text: 'Say nothing.', goto: 'c3.ben.her.quiet' },
      { text: '"Could she sing?"', goto: 'c3.ben.her.sing' },
    ],
  },
  'c3.ben.her.quiet': {
    lines: [
      { text: 'You keep chopping. The knife holds the beat the song once kept.' },
    ],
    next: 'c3.ben.her2',
  },
  'c3.ben.her.sing': {
    lines: [
      { text: 'You ask before you can stop yourself.' },
    ],
    next: 'c3.ben.her2',
  },
  'c3.ben.her2': {
    lines: [
      { who: 'Mang Ben', text: 'Badly, they say. They hid the ladle and she sang anyway. Thirty-one days, and the old cook missed it after.' },
      { text: 'He laughs at his trays, delighted with a fifty-year-old joke that was never his.' },
    ],
    effects: ['set:c3.her.told', 'journal:her.galley'],
  },
  'c3.ben.feast': {
    lines: [
      { who: 'Mang Ben', text: 'A shellback in my galley! The bosun’s birthday drowned in the dateline, so I am cooking pancit anyway.' },
      { who: 'Mang Ben', text: 'Long noodles, long life. You do not cut them. Ingat, ha? Take care. I say it to everyone who leaves my galley.' },
    ],
    effects: ['set:c3.feast', 'journal:dishes.pancit', 'journal:words.ingat'],
  },
  'c3.ben.cookagain': {
    lines: [
      { who: 'Mang Ben', text: 'Pare! The freezer surrendered another chicken. Same pot, same argument. Again?' },
    ],
    choices: [
      { text: 'Tie the apron on again', when: { has: ['c3.cook.done'] }, goto: 'c3.ben.cookreplay' },
      { text: 'Not this watch', goto: 'c3.ben.idle' },
    ],
  },
  'c3.ben.cookreplay': {
    lines: [
      { who: 'Mang Ben', text: 'Sige. No lesson tonight. Garlic first.' },
    ],
    effects: ['set:replay.mode', 'set:c3.cook.start'],
  },
  'c3.ben.idle': {
    lines: [
      { who: 'Mang Ben', text: 'The fresh stores are finished. Now the freezer and the rice sack tell the story. Watch me make it interesting.' },
    ],
  },

  // ---------------- Joseph, AB, Kerala ----------------
  'c3.jos.first': {
    lines: [
      { text: 'An AB works a chipping hammer along the rail, unhurried, as if he and the rust have an understanding.' },
      { who: 'Joseph', text: 'The new galley hand! Joseph. Able seaman, from Kerala, near Kochi. Nine months aboard, three to go. My mother keeps the truer count.' },
    ],
    effects: ['set:c3.met.joseph', 'journal:people.joseph'],
  },
  'c3.jos.baon': {
    lines: [
      { who: 'Joseph', text: 'Ben sent the baon? You are my favorite person on this watch. Joseph. Able seaman, Kerala.' },
    ],
    effects: ['set:c3.met.joseph', 'journal:people.joseph'],
    next: 'c3.jos.baon2',
  },
  // The same plate for a man who already told you his name at the rail.
  'c3.jos.baon.known': {
    lines: [
      { who: 'Joseph', text: 'Ben sent the baon? You are my favorite person on this watch. My mother will hear about you.' },
    ],
    next: 'c3.jos.baon2',
  },
  'c3.jos.baon2': {
    lines: [
      { text: 'He eats at the rail, plate balanced like it grew there. Aft, the bell strikes twice, bright as a coin.' },
    ],
    effects: ['journal:words.bells'],
    next: 'c3.jos.baon3',
  },
  'c3.jos.baon3': {
    lines: [
      { who: 'Joseph', text: 'Two bells. One hour of the watch down, and better fed. Tell Ben the plate came home warm.' },
    ],
    effects: ['set:c3.baon.done', 'errand.done', 'clear:errand.ben-baon', 'journal:customs.watches'],
  },
  'c3.jos.entrust': {
    lines: [
      { who: 'Joseph', text: 'A word, friend. You land in Japan and keep going. My ship runs the wrong way first.' },
      { text: 'From his jacket: a letter soft at the folds, and a cloth bundle knotted with more care than any lashing.' },
      { who: 'Joseph', text: 'For my mother, Mariamma, near Kochi. If your road bends through Kerala, carry them to her.' },
    ],
    choices: [
      { text: 'Take the letter and the bundle', goto: 'c3.jos.entrust.yes' },
      { text: '"What is in the bundle?"', goto: 'c3.jos.entrust.what' },
    ],
  },
  'c3.jos.entrust.what': {
    lines: [
      { who: 'Joseph', text: 'Sandalwood soap, and a photograph of this ship. She will scold the soap for its price and frame the photograph.' },
    ],
    next: 'c3.jos.entrust.yes',
  },
  'c3.jos.entrust.yes': {
    lines: [
      { text: 'The letter and the bundle settle into your pack beside Nani’s journal, like old traveling companions.' },
      { who: 'Joseph', text: 'Amma will feed you until you surrender. That is the delivery fee.' },
    ],
    effects: ['set:joseph.letter'],
  },
  'c3.jos.after': {
    lines: [
      { who: 'Joseph', text: 'Three months more and I follow my own letter home. Take the slow road, so I win the race to my own kitchen.' },
    ],
  },
  'c3.jos.idle': {
    lines: [
      { who: 'Joseph', text: 'Rust never sleeps, so the chipping hammer cannot either. The sea permanently disagrees with my work.' },
    ],
    choices: [
      { text: '"Which way was I headed, Joseph?"', goto: 'c3.jos.thread' },
      { text: 'Leave him to the rust', goto: 'c3.jos.threadNo' },
    ],
  },
  'c3.jos.thread': {
    lines: [
      { who: 'Joseph', text: 'On a ship there is forward, aft, and overboard. For the fourth direction, ask your wrist.' },
    ],
    effects: ['thread:'],
  },
  'c3.jos.threadNo': {
    lines: [{ who: 'Joseph', text: 'The rust and I will be right here. We are inseparable.' }],
  },

  // ---------------- Hana, cadet, bound for Shionoura ----------------
  'c3.hana.first': {
    lines: [
      { text: 'A cadet leans at the bow rail, logging seabirds in a notebook far too neat for this wind.' },
      { who: 'Hana', text: 'Oh! Hana. Deck cadet. At the end of this crossing I see my own harbor, Shionoura. Home for Tanabata, the star festival.' },
    ],
    effects: ['set:c3.met.hana', 'journal:people.hana'],
    next: 'c3.hana.stars',
  },
  'c3.hana.stars': {
    lines: [
      { who: 'Hana', text: 'The river of stars has three names on this one ship. Come to the bow after dark. Show me yours; I will show you mine.' },
    ],
    choices: [
      { text: 'Meet her on the dark bow', goto: 'c3.hana.starstart' },
      { text: 'Later; the stars will keep', goto: 'c3.hana.starlater' },
    ],
  },
  'c3.hana.starstart': {
    lines: [
      { text: 'Night folds over the ship. The working lights die forward, and the sky comes down to the rail to meet you.' },
    ],
    effects: ['set:c3.stars.start'],
  },
  'c3.hana.starlater': {
    lines: [
      { who: 'Hana', text: 'They rise on schedule; the mate says it is the only thing aboard that does. Find me when the deck goes dark.' },
    ],
  },
  // The naming happened on the bow, in the game's own hand; this is only the
  // coming down. The starriver page and its rhyme carry the recognition.
  'c3.starsdone': {
    lines: [
      { text: 'Three skies, one river, inked in your own hand.' },
      { who: 'Hana', text: 'And the ship is named for your llama, you know. Somebody’s grandmother knew exactly where to look.' },
    ],
    effects: ['clear:c3.stars.start', 'set:c3.stars.done', 'journal:customs.starriver'],
    next: 'c3.hana.words',
  },
  'c3.hana.words': {
    lines: [
      { who: 'Hana', text: 'You gave me a constellation, so: arigatou. Your first word of Japanese.' },
      { who: 'Hana', text: 'In Shionoura, ask for Minato-ya, my grandmother Fumi’s inn. Say arigatou at her door and let her decide the rest.' },
    ],
    effects: ['set:c3.hana.tanabata'],
  },
  'c3.hana.starsagain': {
    lines: [
      { who: 'Hana', text: 'The lights go out forward again at eight bells. Stand at the bow with me?' },
    ],
    choices: [
      { text: 'Go up to the dark bow', when: { has: ['c3.stars.done'] }, goto: 'c3.hana.starsreplay' },
      { text: 'Another night', goto: 'c3.hana.idle' },
    ],
  },
  'c3.hana.starsreplay': {
    lines: [
      { who: 'Hana', text: 'No names to prove tonight. Only the three skies, and the two of us being small under them.' },
    ],
    effects: ['set:replay.mode', 'set:c3.stars.start'],
  },
  'c3.hana.idle': {
    lines: [
      { who: 'Hana', text: 'Fewer days every watch, and fewer still if the current is kind. My grandmother is already airing the good futons; I can feel it.' },
    ],
  },

  // ---------------- Olena, second engineer ----------------
  'c3.olena.first': {
    lines: [
      { text: 'The second engineer takes her sun break at the rail, face tipped up like a solar panel.' },
      { who: 'Olena', text: 'Ah. The galley hand. Olena, second engineer, Odesa. I keep four thousand tons of machinery alive, mostly by politeness.' },
    ],
    effects: ['set:c3.met.olena', 'journal:people.olena'],
    next: 'c3.olena.starter',
  },
  'c3.olena.starter': {
    lines: [
      { who: 'Olena', text: 'Come. Hold this, carefully. It is more temperamental than the main engine.' },
      { text: 'A warm glass jar. Inside, something pale breathes: a sourdough starter, alive and opinionated.' },
      { who: 'Olena', text: 'My mother’s, from Odesa. Feed it. If it bubbles, you are family.' },
      { text: 'You feed it a spoon of flour. It bubbles, smugly.' },
    ],
    effects: ['set:c3.olena.bread'],
  },
  'c3.olena.dateline': {
    lines: [
      { who: 'Olena', text: 'We crossed the dateline in the night. Tuesday is gone. The company does not pay it back; I checked.' },
      { who: 'Olena', text: 'It was the bosun’s birthday. Officially he has no age now. He is delighted.' },
    ],
    effects: ['set:c3.olena.dateline', 'journal:customs.dateline'],
  },
  'c3.olena.idle': {
    lines: [
      { who: 'Olena', text: 'The engine hum? You stop hearing it in week one. Then in port, the silence wakes you like an alarm.' },
    ],
    choices: [
      { text: '"Remind me where I was going?"', goto: 'c3.olena.thread' },
      { text: 'Share the sun break', goto: 'c3.olena.threadNo' },
    ],
  },
  'c3.olena.thread': {
    lines: [
      { who: 'Olena', text: 'One moving part and no manual. Hold it out. If my engine ran on grandmother-thread, I would sleep better.' },
    ],
    effects: ['thread:'],
  },
  'c3.olena.threadNo': {
    lines: [
      { who: 'Olena', text: 'Good decision. The sun is free, and the company cannot bill for it.' },
    ],
  },

  // ---------------- the Bosun, and the court of Neptune ----------------
  'c3.bosun.first': {
    lines: [
      { text: 'The bosun stands in the container canyon, testing a lashing rod like a drum.' },
      { who: 'The Bosun', text: 'Two rules on my deck: one hand for you, one for the ship. And no whistling; the wind takes requests.' },
    ],
    effects: ['set:c3.met.bosun', 'journal:people.bosun'],
  },
  // The summons is a summons. The history and the gag live on the scroll he
  // posts (see c3.ex.manifest); the court itself carries the doing.
  'c3.bosun.summons': {
    lines: [
      { text: 'The bosun unrolls a scroll with terrible ceremony: a cargo manifest wearing a marker border.' },
      { who: 'The Bosun', text: 'Hear ye. Tomorrow at noon we cross the Line, and Neptune finds one POLLYWOG aboard. You. Court on the hatch.' },
    ],
    effects: ['set:c3.wog', 'journal:words.pollywog'],
    choices: [
      { text: 'Submit to the court of Neptune', goto: 'c3.bosun.court' },
      { text: 'Ask what happens to refusers', goto: 'c3.bosun.refuse' },
    ],
  },
  'c3.bosun.refuse': {
    lines: [
      { who: 'The Bosun', text: 'Nothing, wog. They watch from the rail with dry hair, and regret it at every karaoke night after.' },
    ],
  },
  'c3.bosun.court': {
    lines: [
      { text: 'Noon, on the Line. Neptune holds court on the hatch: the bosun in a mop wig and a bedsheet, trident of taped boat hooks.' },
      { who: 'The Bosun', text: 'The charge: entering my kingdom unshelled and unsalted. How plead you? Wrong. All wogs plead wrong.' },
      { text: 'Flour on your head, one bucket of warm sea over you, and the whole deck cheering.' },
      { who: 'The Bosun', text: 'Rise, shellback, child of Neptune.' },
    ],
    effects: ['set:c3.shellback', 'journal:customs.linecrossing'],
  },
  'c3.bosun.after': {
    lines: [
      { who: 'The Bosun', text: 'Shellback. It sits well on you. Next crossing you are on the bucket side, which is even better.' },
    ],
  },
  'c3.bosun.idle': {
    lines: [
      { who: 'The Bosun', text: 'Lashings, turnbuckles, twist-locks. La mar tries every knot all day, and I answer for them all night.' },
    ],
    choices: [
      { text: '"Bosun, which way was I bound?"', goto: 'c3.bosun.thread' },
      { text: 'Keep walking the lane', goto: 'c3.bosun.threadNo' },
    ],
  },
  'c3.bosun.thread': {
    lines: [
      { who: 'The Bosun', text: 'Lost between the bays? Cadets manage it weekly. Wrist out: red line, fair lead, no chafe.' },
    ],
    effects: ['thread:'],
  },
  'c3.bosun.threadNo': {
    lines: [{ who: 'The Bosun', text: 'One hand for the ship as you go. The other one is your business.' }],
  },

  // ---------------- Chasca, amidships ----------------
  'c3.chasca.deck': {
    lines: [
      { who: 'Chasca', text: 'The soup-eater! How else do you photograph the middle of the sea? You ride a cargo ship.' },
      { who: 'Chasca', text: 'Stand at the rail with all that nothing behind you. Say fuzzy pickles!' },
    ],
    effects: ['set:c3.met.chasca', 'set:photo.flash', 'set:photo.c3.deck'],
  },
  'c3.chasca.album': {
    lines: [
      { who: 'Chasca', text: 'Three photographs now: the star plain, the sea’s edge, the middle of everything. The album is growing a spine.' },
    ],
  },

  // ---------------- karaoke night ----------------
  'c3.karaoke': {
    lines: [
      { text: 'After dinner the karaoke machine is wheeled out with the reverence of an altar.' },
      { text: 'Joseph sings about rain in Malayalam. Ben commits to a ballad. Olena stands and breaks every heart aboard.' },
      { text: 'Then you. The machine says 74; the crew cheers like it said 100.' },
    ],
    effects: ['set:c3.karaoke.done', 'journal:customs.karaoke'],
  },

  // ---------------- departure ----------------
  'c3.depart': {
    lines: [
      { text: 'A small brown bird lands on the rail. Then the smell arrives: green, wet, alive. Land birds lead the bow now.' },
      { text: 'Ben comes up the ladder with a covered plate, its cloth tucked like a blanket, and leaves it in your hands. This watch, the baon is yours.' },
      { text: 'Islands rise out of the haze. The engine drops to a murmur, the anchor chain runs out, and the pilot’s launch comes alongside for you. Shionoura.' },
    ],
    effects: ['travel:shionoura'],
  },

  // ---------------- examines: the deck ----------------
  'c3.ex.deck': {
    lines: [
      { text: 'Deck-green steel, repainted so often the coats have geology. The nonskid grit holds every step.' },
    ],
  },
  'c3.ex.railing': {
    lines: [
      { text: 'White rails, waist high, cold in any weather. Below, la mar goes by at fourteen knots.' },
    ],
  },
  'c3.ex.contA': {
    lines: [
      { text: 'Rust-red boxes lashed four square. The manifest says machine parts. The bosun says "weather, eventually."' },
    ],
  },
  'c3.ex.contB': {
    lines: [
      { text: 'Blue containers wearing other people’s addresses. Somebody’s whole shop is in one, crossing an ocean without a window.' },
    ],
  },
  'c3.ex.contC': {
    lines: [
      { text: 'A green stack, salt-streaked. One is a reefer, humming day and night to keep somebody’s fish colder than the sea.' },
    ],
  },
  'c3.ex.lifeboat': {
    lines: [
      { text: 'Orange, enclosed, hanging in its davits like a seed that hopes never to sprout. Drilled weekly anyway.' },
    ],
  },
  'c3.ex.winch': {
    lines: [
      { text: 'A mooring winch wound with wire that could tow a village. The fresh grease is the bosun’s signature.' },
    ],
  },
  'c3.ex.bollard': {
    lines: [
      { text: 'Twin black bollards, waists polished bright by hawsers.' },
    ],
  },
  'c3.ex.funnel': {
    lines: [
      { text: 'The funnel, buff yellow with a navy band, breathing one thin ribbon at the sky.' },
    ],
  },
  'c3.ex.shiphouse': {
    lines: [
      { text: 'The house: galley, cabins, bridge, white steel stacked aft. A whole village in one apartment block.' },
    ],
  },
  // The bosun's scroll, posted: Neptune's court in marker-on-paper voice.
  // The lore of the line-crossing lives here now, not in his mouth.
  'c3.ex.manifest': {
    lines: [
      { text: 'Taped to the house door: BY ORDER OF KING NEPTUNE, ALL POLLYWOGS STAND TRIAL AT NOON, ON THE LINE.' },
      { text: 'Then, smaller: A POLLYWOG HAS NEVER CROSSED THE EQUATOR. VOLUNTARY. GENTLE. MOSTLY FLOUR.' },
    ],
  },
  // The keepsake after the court: the certificate lands as a thing, not a speech.
  'c3.ex.manifest2': {
    lines: [
      { text: 'Where the summons hung, a certificate: SHELLBACK, over your name, signed by the captain and King Neptune.' },
      { text: 'Neptune’s handwriting is the bosun’s exactly. Nobody aboard has found this worth mentioning.' },
    ],
  },
  'c3.ex.hammock2': {
    lines: [
      { text: 'Chasca’s hammock, a camera bag hung at its head.' },
    ],
  },
  'c3.ex.hammock': {
    lines: [
      { text: 'A hammock slung between the container stacks. Somebody aboard is winning at rooms.' },
    ],
  },
  'c3.ex.bell2': {
    lines: [
      { text: 'MV YACANA, says the bronze lip. Two strikes: an hour into the watch. You can read the ship’s arithmetic now.' },
    ],
  },
  'c3.ex.bell': {
    lines: [
      { text: 'A bronze bell polished to gold. Mostly ceremony now, the crew says. It still gets rung right.' },
    ],
  },
  'c3.ex.jackstaff': {
    lines: [
      { text: 'The jackstaff at the bow’s point, flag snapping. Past it: nothing, more nothing, then Japan.' },
    ],
  },
  'c3.ex.cat3': {
    lines: [
      { text: 'Landfall eve. The cat rises, stretches, and walks the full length of your shin. On purpose.' },
    ],
  },
  'c3.ex.cat2': {
    lines: [
      { text: 'The cat licks her fur flat. Against the grain means storm, says the bosun. She is saying nothing.' },
    ],
  },
  'c3.ex.cat': {
    lines: [
      { text: 'The ship’s cat, asleep on a coil of rope, in charge of everything. She does not care that you exist. It is restful.' },
    ],
  },
  'c3.ex.crate': {
    lines: [
      { text: 'Spare hatch beams under a tarp, tied down twice. On deck, "loose" is an early word for "lost."' },
    ],
  },
  'c3.ex.sea': {
    lines: [
      { text: 'La mar, all the way down and all the way out. Weeks of west, and she still looks like she is deciding.' },
    ],
  },
  'c3.ex.oildrum': {
    lines: [
      { text: 'Oil drums stenciled CALLAO STORES over older ports. A drum never retires; it changes jobs.' },
    ],
  },
  'c3.ex.hosereel': {
    lines: [
      { text: 'The fire hose, drilled monthly, needed never. The bosun re-rolls it after every drill; the last man rolled it wrong.' },
    ],
  },
  'c3.ex.paintcans': {
    lines: [
      { text: 'Deck green by the gallon, a brush mid-career. The sea calls the color a challenge.' },
    ],
  },
  'c3.ex.rustpatch': {
    lines: [
      { text: 'A rust bloom, wire-brushed at the edges. The bosun is losing this one politely, an inch a week.' },
    ],
  },
  'c3.ex.ropecoil': {
    lines: [
      { text: 'A mooring line flemished into a flat spiral. No sign says do not step on it; you just know.' },
    ],
  },
  'c3.ex.flyingfish': {
    lines: [
      { text: 'A flying fish stranded overnight, wings folded like an umbrella. Ben calls this room service.' },
    ],
  },
  'c3.ex.tarp3': {
    lines: [
      { text: 'Landfall eve, and the tarp is still a tarp. It has crossed the whole Pacific unexplained, which feels like tenure.' },
    ],
  },
  'c3.ex.tarp2': {
    lines: [
      { text: 'A shellback outranks a secret, so you ask again. She is not ready to meet people, the bosun says.' },
    ],
  },
  'c3.ex.tarp': {
    lines: [
      { text: 'Something bulky under a green tarp, lashed with the bosun’s best. Nobody will say what. Asking makes the smiles worse.' },
    ],
  },
  'c3.ex.portcrate2': {
    lines: [
      { text: 'Tomorrow a red line goes through KOBE. MOMBASA moves up one, the way places wait for you.' },
    ],
  },
  'c3.ex.portcrate': {
    lines: [
      { text: 'Crates stenciled with ports: CALLAO struck through, KOBE waiting, MOMBASA queued. Cargo reads like an itinerary.' },
    ],
  },
  'c3.ex.lifering': {
    lines: [
      { text: 'M V YACANA, around the orange ring. If the worst happens, the ship throws you her own name.' },
    ],
  },
  'c3.ex.deckshrine': {
    lines: [
      { text: 'A welded shrine the size of a breadbox: battery candle, coins in five currencies. La mar accepts all denominations.' },
    ],
  },
  'c3.ex.laundry': {
    lines: [
      { text: 'Coveralls drying between rails: engine orange, deck navy, one pair sized like weather.' },
    ],
  },
  'c3.ex.hammock.galley': {
    lines: [
      { text: 'A hammock in the mess corner, because the mess is cool and the cabins are not. Held by seniority.' },
    ],
  },
  'c3.ex.laundry.galley': {
    lines: [
      { text: 'The drying rack sits where the stove heat goes. The room smells of soap and diesel.' },
    ],
  },
  'c3.ex.deckshrine.galley': {
    lines: [
      { text: 'The mess shrine above the serving hatch. Battery candle, five currencies, one plastic flower going pale.' },
    ],
  },
  'c3.ex.portcrate.galley': {
    lines: [
      { text: 'Stores crates inside the door, half unpacked, the manifest already out of date.' },
    ],
  },
  'c3.ex.sternrod': {
    lines: [
      { text: 'A rod lashed to the stern rail, trolling since Callao. Catch so far: one clump of kelp. Morale high.' },
    ],
  },
  'c3.ex.matdeck': {
    lines: [
      { text: 'A WELCOME mat at the foot of a watertight door. Ben put it there; the door has felt friendlier since.' },
    ],
  },

  // ---------------- examines: the galley ----------------
  'c3.ex.stove': {
    lines: [
      { text: 'The range, gimballed against the roll, one stockpot on low forever. The most defended territory aboard.' },
    ],
  },
  'c3.ex.counter': {
    lines: [
      { text: 'The steel counter: a board scarred pale, a cleaver, a heap of peeled garlic, and a tray of rice plated for the next watch.' },
    ],
  },
  'c3.ex.karaoke': {
    lines: [
      { text: 'The karaoke machine, under a fitted cover like important equipment. Aboard, it is.' },
    ],
  },
  'c3.ex.trayrack': {
    lines: [
      { text: 'BUS YOUR OWN TRAY, in three languages and one stern drawing.' },
    ],
  },
  'c3.ex.wallsteel': {
    lines: [
      { text: 'White steel, warm from the sun beyond. When the soup boils, condensation draws brief rivers down it.' },
    ],
  },
  'c3.ex.floorsteel': {
    lines: [
      { text: 'Scuffed steel, the grit-paint worn smooth in one path from stove to table. Thirty years of dinners went this way.' },
    ],
  },
  'c3.ex.table': {
    lines: [
      { text: 'The long mess table, rimmed so plates cannot wander. In weather, the sea eats here too.' },
    ],
  },
  'c3.ex.shelf': {
    lines: [
      { text: 'Week three: rice in bulk, tins in ranks, the last onions hanging like medals.' },
    ],
  },
  'c3.ex.pot': {
    lines: [
      { text: 'The stockpot mutters on its hook. It has been becoming something since Callao.' },
    ],
  },
  // Skinned to `dunnage` on this map in `art/sets/crossing.ts`: a woven mat is
  // a floor covering for a room with a floor, and this room has a sole.
  'c3.ex.matgalley': {
    lines: [
      { text: 'A dunnage board at the threshold, worn pale by every pair of deck boots aboard. Wipe twice; Ben hears the difference.' },
    ],
  },
  'c3.ex.menuboard2': {
    lines: [
      { text: 'Tonight: adobo and sinigang, underlined twice. Smaller: ask the new hands how it happened.' },
    ],
  },
  'c3.ex.menuboard': {
    lines: [
      { text: 'Ben’s chalk menu: rice, fried fish, soup of the day. The soup of the day has been "yes" since Callao.' },
    ],
  },
  'c3.ex.dartboard': {
    lines: [
      { text: 'Two darts and a hole in the set. The third went over the side off Panama; scores carry an asterisk since.' },
    ],
  },
  'c3.ex.chessset2': {
    lines: [
      { text: 'White claims the missing Tuesday ate a move. The captain has wisely declined the case.' },
    ],
  },
  'c3.ex.chessset': {
    lines: [
      { text: 'A chess game taped down mid-siege. Olena versus the chief engineer, day nineteen; touching it is mutiny.' },
    ],
  },
  'c3.ex.galleyplant2': {
    lines: [
      { text: 'The pothos got watered three times today. Nobody wants it to die on their turn, so close to land.' },
    ],
  },
  'c3.ex.galleyplant': {
    lines: [
      { text: 'A pothos in a rice tin, the ship’s one garden. The rota: HANA, JOSEPH, OLENA, BEN, and the bosun in different ink.' },
    ],
  },
};

/** Examine arms: every new kind speaks; shared kinds get map-tagged voices. */
export const CROSSING_EXAMINES: Record<string, ExamineArm[]> = {
  blocked: [{ map: 'ship', node: 'c3.ex.wall' }, { map: 'galley', node: 'c3.ex.wall' }],
  deck: [{ node: 'c3.ex.deck' }],
  railing: [{ node: 'c3.ex.railing' }],
  contA: [{ node: 'c3.ex.contA' }],
  contB: [{ node: 'c3.ex.contB' }],
  contC: [{ node: 'c3.ex.contC' }],
  lifeboat: [{ node: 'c3.ex.lifeboat' }],
  winch: [{ node: 'c3.ex.winch' }],
  bollard: [{ node: 'c3.ex.bollard' }],
  funnel: [{ node: 'c3.ex.funnel' }],
  shiphouse: [
    { when: { has: ['c3.shellback'] }, node: 'c3.ex.manifest2' },
    { when: { has: ['c3.wog'] }, node: 'c3.ex.manifest' },
    { node: 'c3.ex.shiphouse' },
  ],
  hammock: [
    { map: 'galley', node: 'c3.ex.hammock.galley' },
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
  oildrum: [{ node: 'c3.ex.oildrum' }],
  hosereel: [{ node: 'c3.ex.hosereel' }],
  paintcans: [{ node: 'c3.ex.paintcans' }],
  rustpatch: [{ node: 'c3.ex.rustpatch' }],
  ropecoil: [{ node: 'c3.ex.ropecoil' }],
  flyingfish: [{ node: 'c3.ex.flyingfish' }],
  tarpthing: [
    { when: { has: ['c3.complete'] }, node: 'c3.ex.tarp3' },
    { when: { has: ['c3.shellback'] }, node: 'c3.ex.tarp2' },
    { node: 'c3.ex.tarp' },
  ],
  portcrate: [
    { map: 'galley', node: 'c3.ex.portcrate.galley' },
    { when: { has: ['c3.complete'] }, node: 'c3.ex.portcrate2' },
    { node: 'c3.ex.portcrate' },
  ],
  lifering: [{ node: 'c3.ex.lifering' }],
  deckshrine: [
    { map: 'galley', node: 'c3.ex.deckshrine.galley' },
    { node: 'c3.ex.deckshrine' },
  ],
  laundry: [
    { map: 'galley', node: 'c3.ex.laundry.galley' },
    { node: 'c3.ex.laundry' },
  ],
  sternrod: [{ node: 'c3.ex.sternrod' }],
  menuboard: [
    { when: { has: ['c3.cook.done'] }, node: 'c3.ex.menuboard2' },
    { node: 'c3.ex.menuboard' },
  ],
  dartboard: [{ node: 'c3.ex.dartboard' }],
  chessset: [
    { when: { has: ['c3.olena.dateline'] }, node: 'c3.ex.chessset2' },
    { node: 'c3.ex.chessset' },
  ],
  galleyplant: [
    { when: { has: ['c3.complete'] }, node: 'c3.ex.galleyplant2' },
    { node: 'c3.ex.galleyplant' },
  ],
  stove: [{ node: 'c3.ex.stove' }],
  galleycounter: [{ node: 'c3.ex.counter' }],
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
  mat: [
    { map: 'ship', node: 'c3.ex.matdeck' },
    { map: 'galley', node: 'c3.ex.matgalley' },
  ],
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
      'P.S. The shelf was not free. Neither is waiting.',
    ],
  },
  {
    id: 'c3.petro',
    from: 'Doña Petro, La Picantería',
    when: { has: ['c2.casero'] },
    body: [
      'Casero. Marisol tells the whole malecón that her casero sailed with the capitana. She says it proudly, like weather she predicted.',
      'Listen: a galley is only a picantería that moves. Same law applies. Feed them what the pots say, and never argue with the pot.',
      'The capitana taught me her cook’s word once: baon. Food packed for somebody’s watch, the love kept warm under the cloth. We always had the thing; now you have the word.',
      'The sudado was better the week you carried the lisa. That is not sentiment, it is seasoning. Pass this way again and test me.',
    ],
  },
  {
    id: 'c3.petro',
    from: 'Doña Petro, La Picantería',
    body: [
      'Corazón. The fog has lifted twice since you sailed, and the village has decided it is your doing. Let them; it costs nothing.',
      'Eat warm things at night. The sea is cold at the bottom and it climbs. Ask your captain for soup, not for courage.',
      'Her cook has a word, the capitana says: baon. Food packed for somebody’s watch, love kept warm under a cloth. Eat yours, and carry someone else’s.',
      'The pots say you come back this way someday. The pots are never wrong, corazón. Only slow.',
    ],
  },
];
