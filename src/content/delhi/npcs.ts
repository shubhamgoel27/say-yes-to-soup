import type { ExamineArm, LetterDef, NodeMap, NpcDef } from '../schema';

/**
 * Kucha Aab-o-Daana's people. Hindi and Urdu lean on the same counter here:
 * haan ji, aur batao, thoda aur lo, woh kata. Rules unchanged: nobody
 * lectures, neighbors disagree, warm corrections, the wrong branch is the
 * warmer scene, two short sentences, and the gurdwara is never a game.
 */

export const DELHI_NPCS: NpcDef[] = [
  {
    id: 'bantu',
    name: 'Bantu',
    map: 'delhi',
    pos: [41, 22],
    range: 2,
    look: {
      skin: '#9c6a42',
      hair: '#241a12',
      cloth: '#3f7fb0',
      stripe: '#f2e6d0',
      hat: '#e8dcc4',
      hatStyle: 'none',
    },
    // Seated in the evening langar: no lane business from the pangat row.
    visiting: { 'delhi-langar': 'c11.bantu.langar' },
    entry: [
      { when: { has: ['c11.complete'] }, node: 'c11.bantu.station' },
      { when: { not: ['c11.met.bantu'] }, node: 'c11.bantu.first' },
      { when: { has: ['c11.met.bantu'], not: ['c11.bhaiya'] }, node: 'c11.bantu.bhaiya' },
      { when: { has: ['c11.bhaiya'], not: ['c11.nashta'] }, node: 'c11.bantu.nashta' },
      { when: { has: ['c11.rain'], not: ['c11.bantu.rained'] }, node: 'c11.bantu.rain' },
      { node: 'c11.bantu.idle' },
    ],
  },
  {
    id: 'kamla',
    name: 'Kamla Chachi',
    map: 'delhi',
    // At her own tawa (16,14), and still: her wander used to carry her
    // under the cloth line, which hung across her for every word.
    pos: [17, 14],
    range: 0,
    look: {
      skin: '#8a5636',
      hair: '#3a2e22',
      cloth: '#c04858',
      stripe: '#e8d9a8',
      hat: '#e8dcc4',
      hatStyle: 'none',
      skirt: '#8a3428',
    },
    entry: [
      { when: { not: ['c11.met.kamla'] }, node: 'c11.kamla.first' },
      { when: { has: ['c11.met.kamla'], not: ['c11.dance'] }, node: 'c11.kamla.dance' },
      { when: { has: ['c11.dance'], not: ['c11.cook.done'] }, node: 'c11.kamla.cookoffer' },
      { when: { has: ['c11.complete'] }, node: 'c11.kamla.after' },
      { when: { has: ['c11.cook.done'] }, node: 'c11.kamla.cookagain' },
      { node: 'c11.kamla.idle' },
    ],
  },
  {
    id: 'joginder',
    name: 'Joginder Singh',
    map: 'delhi-langar',
    pos: [10, 2],
    range: 1,
    look: {
      skin: '#8a5636',
      hair: '#2b2118',
      cloth: '#54708a',
      stripe: '#e8dcc4',
      hat: '#e8952c',
      hatStyle: 'chullu',
    },
    entry: [
      { when: { not: ['c11.met.jog'] }, node: 'c11.jog.first' },
      // Head covered first, then the row: both are the player's own doing.
      { when: { has: ['c11.met.jog'], not: ['c11.rumal'] }, node: 'c11.jog.basket' },
      { when: { has: ['c11.rumal'], not: ['c11.jog.fed'] }, node: 'c11.jog.sit' },
      { when: { has: ['errand.seva-atta'], not: ['c11.seva.done'] }, node: 'c11.jog.seva' },
      { when: { has: ['c11.seva.done'], not: ['c11.jog2'] }, node: 'c11.jog.tuesday' },
      { node: 'c11.jog.idle' },
    ],
  },
  {
    id: 'yusuf',
    name: 'Ustad Yusuf Miyan',
    map: 'delhi-rooftop',
    pos: [7, 5],
    range: 1,
    look: {
      skin: '#7a4a2e',
      hair: '#cfc8ba',
      cloth: '#e8e0cc',
      stripe: '#8c8479',
      hat: '#d9d4c8',
      hatStyle: 'none',
    },
    entry: [
      { when: { not: ['c11.met.yusuf'] }, node: 'c11.yusuf.first' },
      { when: { has: ['errand.pigeon-home'], not: ['c11.pigeon.home'] }, node: 'c11.yusuf.begum' },
      { when: { has: ['c11.met.yusuf'], not: ['c11.names'] }, node: 'c11.yusuf.names' },
      { when: { has: ['c11.names'], not: ['c11.kite.done'] }, node: 'c11.yusuf.offer' },
      // One kite flown makes you a hand he can compare against other hands.
      // The roof has been holding this comparison since 1974.
      { when: { has: ['c11.kite.done'], not: ['c11.her'] }, node: 'c11.yusuf.her' },
      // The goodbye is a kite let go: Nani lost four down this wind, laughing.
      { when: { has: ['c11.duel.done', 'c11.chit.bombay'], not: ['c11.complete'] }, node: 'c11.yusuf.bye' },
      { when: { has: ['c11.kite.done', 'c11.rain'], not: ['c11.duel.done'] }, node: 'c11.yusuf.duel' },
      { when: { has: ['c11.duel.done'], not: ['c11.yusuf2'] }, node: 'c11.yusuf.after' },
      { when: { has: ['c11.kite.done'] }, node: 'c11.yusuf.flyagain' },
      { node: 'c11.yusuf.idle' },
    ],
  },
  {
    id: 'mehr',
    name: 'Mehr Aapa',
    map: 'delhi',
    pos: [7, 7],
    range: 1,
    look: {
      skin: '#9c6a42',
      hair: '#d9d4c8',
      cloth: '#3d5a4a',
      stripe: '#c8a55b',
      hat: '#e8dcc4',
      hatStyle: 'none',
      skirt: '#2c443c',
    },
    entry: [
      { when: { not: ['c11.met.mehr'] }, node: 'c11.mehr.first' },
      { when: { has: ['c11.met.mehr'], not: ['c11.attar.mitti', 'c11.mehr.asked'] }, node: 'c11.mehr.gift' },
      { when: { has: ['c11.mehr.asked', 'c11.rain'], not: ['c11.attar.mitti'] }, node: 'c11.mehr.rain2' },
      { when: { has: ['c11.mehr.asked'], not: ['c11.attar.mitti'] }, node: 'c11.mehr.waiting' },
      { when: { has: ['c11.attar.mitti'], not: ['c11.mehr.nani2'] }, node: 'c11.mehr.nani' },
      { node: 'c11.mehr.idle' },
    ],
  },
  {
    id: 'sethji',
    name: 'Sethji Onkar Nath',
    map: 'delhi',
    pos: [5, 12],
    range: 0,
    look: {
      skin: '#8a5636',
      hair: '#cfc8ba',
      cloth: '#f2ead8',
      stripe: '#c8a55b',
      hat: '#e8dcc4',
      hatStyle: 'none',
    },
    entry: [
      {
        when: { has: ['c11.cook.done', 'c11.seva.done', 'c11.kite.done'], not: ['c11.chit.bombay'] },
        node: 'c11.sethji.test',
      },
      { when: { not: ['c11.met.sethji'] }, node: 'c11.sethji.cold' },
      { when: { has: ['c11.chit.bombay'] }, node: 'c11.sethji.after' },
      { node: 'c11.sethji.cold2' },
    ],
  },
  {
    id: 'sushila',
    name: 'Sushila Jain',
    map: 'delhi',
    pos: [43, 9],
    range: 1,
    look: {
      skin: '#9c6a42',
      hair: '#2e2018',
      cloth: '#e8e0cc',
      stripe: '#8a4a7d',
      hat: '#e8dcc4',
      hatStyle: 'none',
      skirt: '#d8d2c6',
    },
    entry: [
      { when: { not: ['c11.met.sushila'] }, node: 'c11.sushila.first' },
      {
        when: { has: ['c11.met.sushila', 'c11.met.yusuf'], not: ['errand.pigeon-home', 'c11.pigeon.home'] },
        node: 'c11.sushila.errand',
      },
      { when: { has: ['c11.pigeon.home'], not: ['c11.sushila2'] }, node: 'c11.sushila.argue' },
      { node: 'c11.sushila.idle' },
    ],
  },
  {
    id: 'akhtar',
    name: 'Akhtar Bhai',
    map: 'delhi',
    pos: [34, 15],
    range: 1,
    look: {
      skin: '#7a4a2e',
      hair: '#3a2e22',
      cloth: '#8a3428',
      stripe: '#e8d9a8',
      hat: '#e8dcc4',
      hatStyle: 'none',
    },
    entry: [
      { when: { not: ['c11.met.akhtar'] }, node: 'c11.akhtar.first' },
      { when: { has: ['c11.sher.learned'], not: ['c11.sherchai'] }, node: 'c11.akhtar.sher' },
      { when: { has: ['c11.met.akhtar'], not: ['c11.promise.daulat'] }, node: 'c11.akhtar.menu' },
      { when: { has: ['c11.promise.daulat'], not: ['c11.rain'] }, node: 'c11.akhtar.storm' },
      { when: { has: ['c11.rain'], not: ['c11.rainchai'] }, node: 'c11.akhtar.rainchai' },
      { node: 'c11.akhtar.idle' },
    ],
  },
  {
    // Divakaran Master rides the same rails you did, once a year, to buy a
    // sack of books for the grandhasala. The reading room travels too.
    id: 'librarianC11',
    name: 'Divakaran Master',
    map: 'delhi',
    when: { has: ['c11.arrived'], not: ['c11.complete'] },
    pos: [30, 7],
    range: 1,
    look: {
      skin: '#8a5636',
      hair: '#cfc8ba',
      cloth: '#e8e0cc',
      stripe: '#8c8479',
      hat: '#e8dcc4',
      hatStyle: 'none',
    },
    entry: [
      { when: { not: ['c11.met.master'] }, node: 'c11.master.first' },
      { when: { has: ['c11.met.master'], not: ['c11.master.quizzed'] }, node: 'c11.master.quiz' },
      { node: 'c11.master.idle' },
    ],
  },
  {
    id: 'chascaC11',
    name: 'Chasca',
    map: 'delhi-rooftop',
    when: { has: ['c11.duel.done'] },
    pos: [18, 11],
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
      { when: { not: ['c11.met.chasca11'] }, node: 'c11.chasca.photo' },
      { node: 'c11.chasca.album' },
    ],
  },
  {
    // Sheru: the gali's dog, employed by everyone, owned by no one. A
    // managed neighbor with a pension plan of parantha edges.
    id: 'sheru',
    name: 'Sheru',
    map: 'delhi',
    // North-east of the peepal: from 25,26 his wander reached row 29, where
    // the south wall's art swallowed him whole, and the crown hid him.
    pos: [28, 24],
    range: 3,
    sprite: 'dog',
    look: {
      skin: '#c98f5e',
      hair: '#241a12',
      cloth: '#8a5330',
      stripe: '#e8dcc4',
      hat: '#e8dcc4',
      hatStyle: 'none',
    },
    entry: [
      { when: { not: ['c11.met.sheru'] }, node: 'c11.sheru.first' },
      { when: { has: ['c11.rain'], not: ['c11.sheru2'] }, node: 'c11.sheru.rain' },
      // After the tawa lesson he considers you a colleague, and colleagues
      // get walked home. Keep coming back; the third visit is his gift.
      { when: { has: ['c11.cook.done'], not: ['egg.c11.sheru1'] }, node: 'c11.egg.sheru1' },
      { when: { has: ['egg.c11.sheru1'], not: ['egg.c11.sheru2'] }, node: 'c11.egg.sheru2' },
      { when: { has: ['egg.c11.sheru2'], not: ['egg.c11.sheru3'] }, node: 'c11.egg.sheru3' },
      { node: 'c11.sheru.idle' },
    ],
  },
  {
    // "Oye Rafiq bhaiya, the tire!": Bantu's shout needs somebody to land on.
    // At the rickshaw stand below the dak khana, crouched at a back wheel.
    id: 'rafiq',
    name: 'Rafiq',
    map: 'delhi',
    pos: [44, 25],
    range: 0,
    look: {
      skin: '#8a5636',
      hair: '#2b2118',
      cloth: '#e3dccb',
      stripe: '#8a6a48',
      hat: '#b8483a',
      hatStyle: 'kerchief',
      garb: 'kurta',
      pants: '#5a5248',
      beard: 'moustache',
    },
    entry: [{ node: 'c11.rafiq' }],
  },
  {
    // "Meena didi, your cards came!": out of the dak khana with the parcel.
    id: 'meena',
    name: 'Meena',
    map: 'delhi',
    pos: [46, 20],
    range: 0,
    look: {
      skin: '#9c6a42',
      hair: '#1f1712',
      cloth: '#2f7d74',
      stripe: '#e8b04a',
      hat: '#e8dcc4',
      hatStyle: 'none',
      garb: 'salwar',
      pants: '#2f7d74',
      shawl: '#e8b04a',
      hairdo: 'braids',
    },
    entry: [{ node: 'c11.meena' }],
  },
];

export const DELHI_NODES: NodeMap = {
  // The walls themselves; without this arm they fall through to the
  // village's adobe line, which reads strangely far from the altiplano.
  'c11.ex.wall': {
    lines: [{ text: 'Thin old bricks under lime plaster. The newest paint is only the top page.' }],
  },
  // ---------------- arrival ----------------
  'c11.arrive': {
    lines: [
      { text: 'Three days north by rail, then a walled city. The rickshaw driver refuses your coin twice, takes it the third time, and blesses your journey.' },
    ],
    effects: ['set:c11.arrived'],
  },

  // ---------------- Bantu, the first friend ----------------
  'c11.bantu.first': {
    lines: [
      { who: 'Bantu', text: 'New face! Full backpack, zero idea where to look. Traveler, hungry, lost?' },
      { who: 'Bantu', text: 'I am Bantu. My uncle owns the rickshaw; I own the knowledge.' },
    ],
    effects: ['set:c11.met.bantu', 'journal:people.bantu'],
  },
  // The two Bantu shouts at, so the shout has somewhere to land.
  'c11.rafiq': {
    lines: [
      { who: 'Rafiq', text: 'The tire is fine. Bantu shouts at it every morning, and that is what keeps it fine.' },
    ],
  },
  'c11.meena': {
    lines: [
      { who: 'Meena', text: 'Two hundred wedding cards, and the press spelled the groom wrong on every one. My sister says it is a sign. Of what, she will not say.' },
    ],
  },
  'c11.bantu.bhaiya': {
    lines: [
      { who: 'Bantu', text: 'Watch me work. Oye Rafiq bhaiya, the tire! Meena didi, your cards came! Everyone, all day.' },
    ],
    choices: [
      {
        text: '"In Kerala it was chetta and chechi. So here I say Bantu bhaiya?"',
        goto: 'c11.bantu.chetta',
        when: { has: ['page.words.chetta'] },
      },
      { text: 'Ask why he calls strangers family', goto: 'c11.bantu.bhaiya2' },
    ],
  },
  'c11.bantu.chetta': {
    lines: [
      { who: 'Bantu', text: 'AY. You came pre-installed! Chetta, bhaiya: same software, different language.' },
      { who: 'Bantu', text: 'Now chalo: Kamla Chachi first. Auntie means you are about to be overfed.' },
    ],
    effects: ['set:c11.bhaiya', 'journal:words.bhaiya'],
  },
  'c11.bantu.bhaiya2': {
    lines: [
      { who: 'Bantu', text: 'Call a stranger sir and he checks his wallet. Call him bhaiya and he checks if you have eaten.' },
      { who: 'Bantu', text: 'Now chalo: Kamla Chachi first. Auntie means you are about to be overfed.' },
    ],
    effects: ['set:c11.bhaiya', 'journal:words.bhaiya'],
  },
  'c11.bantu.nashta': {
    lines: [
      { who: 'Bantu', text: 'Nashta time. Do not argue; the city has decided.' },
      { text: 'Bedmi puri and aloo for two, ordered without asking.' },
      { who: 'Bantu', text: 'I told my uncle I would be back abhi, right now. He will see me at lunch. He knows.' },
    ],
    effects: ['set:c11.nashta', 'journal:dishes.bedmi', 'journal:words.abhi'],
  },
  'c11.bantu.rain': {
    lines: [
      { who: 'Bantu', text: 'FIRST RAIN! One full lap of the chowk standing on the pedals. The puddles belong to the kids now; adults may only look.' },
    ],
    effects: ['set:c11.bantu.rained'],
  },
  'c11.bantu.station': {
    lines: [
      { who: 'Bantu', text: 'So. The chit is real, the train is real. My rickshaw is the fastest real thing to the station.' },
    ],
    choices: [
      { text: 'Ride to the station', goto: 'c11.depart' },
      { text: 'Not yet; one more chai first', goto: 'c11.bantu.stay' },
    ],
  },
  'c11.bantu.stay': {
    lines: [
      { who: 'Bantu', text: 'Correct answer also! I will keep the seat dusted.' },
    ],
  },
  'c11.depart': {
    lines: [
      { text: 'Bantu rings his bell at everyone on the way to the station, cries once, loudly, and denies it.' },
      { text: 'In Bombay the chit opens a berth like a password. The ship swings west onto the old dhow road.' },
    ],
    effects: ['set:c11.complete', 'travel:zanzibar'],
  },
  'c11.bantu.langar': {
    lines: [
      { text: 'Bantu sits cross-legged in the row, plate held out for the dal.' },
      { who: 'Bantu', text: 'Same dal for the teacher, the uncle and me. Best restaurant in Delhi, and nobody gets a bill.' },
    ],
  },
  'c11.bantu.idle': {
    lines: [
      { who: 'Bantu', text: 'Aur batao! Tell me more. Who fed you extra? That is the news here.' },
    ],
    effects: ['journal:words.aurbatao'],
    choices: [
      { text: '"Which way was I headed, bhaiya?"', goto: 'c11.bantu.thread' },
      { text: 'Trade news instead', goto: 'c11.bantu.threadNo' },
    ],
  },
  'c11.bantu.thread': {
    lines: [
      { who: 'Bantu', text: 'Lost? In MY mohalla? Hold out the wrist.' },
    ],
    effects: ['thread:'],
  },
  'c11.bantu.threadNo': {
    lines: [
      { who: 'Bantu', text: 'Correct. News first, destinations later.' },
    ],
  },

  // ---------------- Kamla Chachi, the griddle ----------------
  'c11.kamla.first': {
    lines: [
      { text: 'The tawa corner smells like the reason the lane exists.' },
      { who: 'Kamla Chachi', text: 'Haan ji, come. The gali feeds first and asks later. Aloo parantha, four sides. Eat.' },
    ],
    effects: ['set:c11.met.kamla', 'journal:people.kamla', 'journal:dishes.parantha'],
  },
  'c11.kamla.dance': {
    lines: [
      { text: 'Your plate is somehow full again.' },
      { who: 'Kamla Chachi', text: 'Thoda aur lo. Take a little more.' },
    ],
    choices: [
      {
        text: '"In Kerala I learned mathi, enough, said three times. Does that work here?"',
        goto: 'c11.kamla.mathi',
        when: { has: ['c6.sadya.done'] },
      },
      { text: 'Refuse politely; you are genuinely full', goto: 'c11.kamla.dance2' },
    ],
  },
  // The refusal is done, not described: the pat is the player's own move.
  'c11.kamla.mathi': {
    lines: [
      { who: 'Kamla Chachi', text: 'Mathi! Ha! A licensed refuser. Here the word is pet bhar gaya, stomach full, with the hand flat on it. Show me.' },
    ],
    choices: [{ text: 'Hand flat on your stomach: "Pet bhar gaya."', goto: 'c11.kamla.jalebi' }],
  },
  'c11.kamla.dance2': {
    lines: [
      { who: 'Kamla Chachi', text: 'No? Beta, the first no is a greeting, the second is manners. Say pet bhar gaya, stomach full, hand flat on it, so.' },
    ],
    choices: [{ text: 'Hand flat on your stomach: "Pet bhar gaya."', goto: 'c11.kamla.jalebi' }],
  },
  'c11.kamla.jalebi': {
    lines: [
      { text: 'Kamla nods like an examiner.' },
      { who: 'Kamla Chachi', text: 'Textbook. And because even a perfect na means convince me: one jalebi.' },
    ],
    effects: ['set:c11.dance', 'journal:customs.thodaaur', 'journal:dishes.jalebi'],
  },
  // Third visit: the haanji page lands here, once the ji has had time to be
  // heard forty times, instead of stacking into the greeting.
  'c11.kamla.cookoffer': {
    lines: [
      { who: 'Kamla Chachi', text: 'Haan ji, you eat with attention. That is half the training. The pin and the flip are the rest.' },
    ],
    effects: ['journal:words.haanji'],
    choices: [
      { text: 'Step behind the tawa', goto: 'c11.kamla.cookgo' },
      { text: 'Not yet; the lane is still teaching', goto: 'c11.kamla.cooklater' },
    ],
  },
  'c11.kamla.cookgo': {
    lines: [
      { who: 'Kamla Chachi', text: 'Wash the hands, respect the ghee. Aloo first; everyone begins at aloo.' },
    ],
    effects: ['set:c11.cook.start'],
  },
  'c11.kamla.cooklater': {
    lines: [
      { who: 'Kamla Chachi', text: 'The tawa holds no grudges, beta.' },
    ],
  },
  'c11.cook.finish': {
    lines: [
      { text: 'Aloo, mooli, rabri. The last goes to a porter who has eaten here thirty years. He bites, and stops talking.' },
      { who: 'Kamla Chachi', text: 'Hear that? Nothing. In this gali, silence is the trophy. Tell Sethji that Kamla says you can feed people.' },
    ],
    effects: ['clear:c11.cook.start', 'set:c11.cook.done'],
  },
  'c11.kamla.after': {
    lines: [
      { who: 'Kamla Chachi', text: 'Eat on the train, write when you land. One line is enough; a cook can taste the rest.' },
    ],
  },
  'c11.kamla.idle': {
    lines: [
      { who: 'Kamla Chachi', text: 'Sixty-one years this wrist, and it still argues with the rolling pin. Watch it win.' },
    ],
  },
  'c11.kamla.cookagain': {
    lines: [
      { who: 'Kamla Chachi', text: 'Your hands know the pin now. Come, stand where you stood.' },
    ],
    choices: [
      { text: 'Tie the apron again', when: { has: ['c11.cook.done'] }, goto: 'c11.kamla.cookReplay' },
      { text: 'Another day', goto: 'c11.kamla.idle' },
    ],
  },
  'c11.kamla.cookReplay': {
    lines: [
      { who: 'Kamla Chachi', text: 'Nothing to prove today. Burn one if you like; Sheru is patient.' },
    ],
    effects: ['set:replay.mode', 'set:c11.cook.start'],
  },

  // ---------------- the langar (scripted, unscored, sacred) ----------------
  // You cover your own head and sit yourself down: the basket and the row
  // are things you do, not things you are told about.
  'c11.jog.first': {
    lines: [
      { text: 'One floor and one smell: dal, ghee, woodsmoke. A big man, floury to the elbows, meets you at the shoe rack.' },
      { who: 'Joginder Singh', text: 'Welcome, welcome. Shoes there, beta, and the head stays covered. Rumals in the basket; they fit everyone.' },
    ],
    effects: ['set:c11.met.jog', 'journal:people.joginder'],
  },
  'c11.jog.basket': {
    lines: [{ who: 'Joginder Singh', text: 'The basket by the door, beta. Any color.' }],
  },
  'c11.jog.tie': {
    lines: [
      { text: 'You tie one on, crooked. Joginder straightens it with two fingers.' },
      { who: 'Joginder Singh', text: 'Pangat, the rows: everyone on one floor. No high seat, no first, no last.' },
    ],
    effects: ['set:c11.rumal'],
    choices: [
      { text: 'Sit down in the row', goto: 'c11.jog.meal' },
      { text: 'Look around the hall first', goto: 'c11.jog.later' },
    ],
  },
  'c11.jog.later': {
    lines: [{ who: 'Joginder Singh', text: 'Take your time. The dal finds you wherever you sit.' }],
  },
  'c11.jog.sit': {
    lines: [{ who: 'Joginder Singh', text: 'Sit, beta. The dal finds you.' }],
    choices: [
      { text: 'Sit down in the row', goto: 'c11.jog.meal' },
      { text: 'Not yet', goto: 'c11.jog.later' },
    ],
  },
  'c11.jog.meal': {
    lines: [
      { text: 'You sit between a porter and a man whose shoes cost the porter\'s month. One ladle serves you both.' },
      { who: 'Joginder Singh', text: 'Both hands, beta, cupped, the way you take a gift. Same ladle, same dal, for everyone in the row.' },
      { text: 'This place stands where the ninth Guru gave his head for another faith\'s right to pray.' },
    ],
    effects: ['set:c11.jog.fed', 'journal:customs.langar'],
    choices: [
      { text: 'Offer money for the meal', goto: 'c11.jog.money' },
      { text: 'Ask how you can possibly repay this', goto: 'c11.jog.hands' },
    ],
  },
  'c11.jog.money': {
    lines: [
      { text: 'You hold out folded notes. He folds them back into your hand.' },
      { who: 'Joginder Singh', text: 'Not coins, beta. Hands. Come Tuesday, sleeves up, and we will settle the account that was never open.' },
    ],
    effects: ['errand:seva-atta', 'set:errand.seva-atta'],
  },
  'c11.jog.hands': {
    lines: [
      { who: 'Joginder Singh', text: 'The right question. The answer is seva: service. Come Tuesday, sleeves up. No skill required; that is the point.' },
    ],
    effects: ['errand:seva-atta', 'set:errand.seva-atta'],
  },
  // The page fills while the flour is still on your wrists: the doing is the
  // teaching, and the ayni contrast lives in the journal's stitched margin.
  'c11.jog.seva': {
    lines: [
      { text: 'Tuesday. Steam, flour, forty wrists. You roll rotis badly, then less badly.' },
      { who: 'Joginder Singh', text: 'Round is a direction, not a requirement. The deg does not grade; it feeds.' },
      { text: 'You wipe the floor where five hundred people sat. It takes an hour and does not feel like one.' },
    ],
    effects: ['errand.done', 'clear:errand.seva-atta', 'set:c11.seva.done', 'set:c11.seva.langar', 'journal:customs.seva'],
    next: 'c11.jog.soul',
  },
  'c11.jog.soul': {
    lines: [
      { who: 'Joginder Singh', text: 'Tell Sethji the langar says your hands are true.' },
    ],
  },
  // Second visit after the seva: the review, then the Chandni pointer. The
  // moonlight etymology itself waits in the chowk brick, where the name
  // lives; Joginder only points your eye at the place (gate: c11.jog2).
  'c11.jog.tuesday': {
    lines: [
      { who: 'Joginder Singh', text: 'Your rotis were eaten before they cooled. That is our only review.' },
      { who: 'Joginder Singh', text: 'Bantu says Chandni Chowk means silver street. Ask the chowk\'s bricks, then correct him gently; he is sixteen.' },
    ],
    effects: ['set:c11.jog2'],
  },
  'c11.jog.idle': {
    lines: [{ who: 'Joginder Singh', text: 'Sit whenever the world gets tall, beta; this room stays low on purpose.' }],
  },

  // ---------------- Yusuf Miyan, the rooftop ----------------
  'c11.yusuf.first': {
    lines: [
      { text: 'The stair delivers you into sky: domes, wires, laundry, and a man scattering grain.' },
      { who: 'Ustad Yusuf Miyan', text: 'Hm. A ground person. The ground is down the stairs.' },
    ],
    choices: [
      { text: 'Stand exactly where he points', goto: 'c11.yusuf.first.stand' },
      { text: 'Ask about the birds', goto: 'c11.yusuf.first.birds' },
    ],
  },
  'c11.yusuf.first.stand': {
    lines: [
      { text: 'You stand on the top stair. A pigeon lands on his shoulder and inspects you.' },
      { who: 'Ustad Yusuf Miyan', text: 'Obedient. You may stay. The roofs are a country, and you have no papers yet.' },
    ],
    effects: ['set:c11.met.yusuf', 'journal:people.yusuf'],
  },
  'c11.yusuf.first.birds': {
    lines: [
      { text: 'A pigeon lands on his shoulder. He whistles half a word, and it settles.' },
      { who: 'Ustad Yusuf Miyan', text: 'They have names you have not earned. The roofs are a country; you have no papers.' },
    ],
    effects: ['set:c11.met.yusuf', 'journal:people.yusuf'],
  },
  // The names are a recital, so the player recites them.
  'c11.yusuf.names': {
    lines: [
      { who: 'Ustad Yusuf Miyan', text: 'Begum runs the coop. Sikandar is vain. Chandni, the white one: my father named her line.' },
    ],
    next: 'c11.yusuf.names.say',
  },
  'c11.yusuf.names.say': {
    lines: [{ who: 'Ustad Yusuf Miyan', text: 'Say them back.' }],
    choices: [
      { text: '"Begum, Sultan, Chandni."', goto: 'c11.yusuf.names.miss' },
      { text: '"Begum, Sikandar, Chandni."', goto: 'c11.yusuf.names.ok' },
      { text: '"Begum, Sikandar, and... the white one?"', goto: 'c11.yusuf.names.white' },
    ],
  },
  'c11.yusuf.names.miss': {
    lines: [{ who: 'Ustad Yusuf Miyan', text: 'Sultan is the neighbor\'s cat, and an enemy of this roof. Again.' }],
    next: 'c11.yusuf.names.say',
  },
  'c11.yusuf.names.white': {
    lines: [{ who: 'Ustad Yusuf Miyan', text: 'The white one has a name older than you. Again.' }],
    next: 'c11.yusuf.names.say',
  },
  'c11.yusuf.names.ok': {
    lines: [
      { text: 'Begum ruffles at her name like a minister accepting protocol.' },
      { who: 'Ustad Yusuf Miyan', text: 'Every keeper calls his birds in his own tongue. Mine came from my ustad, forty years dead.' },
    ],
    effects: ['set:c11.names', 'journal:customs.kabootar'],
    next: 'c11.yusuf.offer',
  },
  'c11.yusuf.offer': {
    lines: [
      { who: 'Ustad Yusuf Miyan', text: 'Names before sky. Correct order. So: the patang.' },
      { who: 'Ustad Yusuf Miyan', text: 'My dor is plain cotton. Glass cuts birds and hands.' },
    ],
    choices: [
      { text: 'Take the charkhi', goto: 'c11.yusuf.go' },
      { text: 'Not yet; the wind and I are strangers', goto: 'c11.yusuf.later' },
    ],
  },
  // No lecture before the sky: the panel's own weather teaches kheench and
  // dheel, and the first frayed dor teaches the one law about birds.
  'c11.yusuf.go': {
    lines: [
      { who: 'Ustad Yusuf Miyan', text: 'The wind writes the sentence; you choose the punctuation.' },
    ],
    effects: ['set:c11.kite.start'],
  },
  'c11.yusuf.later': {
    lines: [
      { who: 'Ustad Yusuf Miyan', text: 'Good. Half of patangbazi is knowing when not to fly.' },
    ],
  },
  'c11.kite.flown': {
    lines: [
      { text: 'The patang climbs like it remembered something urgent. A rival line parts somewhere over the domes: WOH KATA!' },
      { who: 'Ustad Yusuf Miyan', text: 'The roof keeps the score and I keep the tea. The wind will want you again.' },
    ],
    effects: ['clear:c11.kite.start', 'set:c11.kite.done', 'journal:customs.patang', 'journal:words.wohkata'],
  },
  // He is grading a hand, not telling a story. The roof keeps records the way
  // roofs do: by how badly somebody flew, and how much they enjoyed it.
  'c11.yusuf.her': {
    lines: [
      { who: 'Ustad Yusuf Miyan', text: 'Acceptable hands. Zoila madam stood on that tile, the rains of seventy-four.' },
      { who: 'Ustad Yusuf Miyan', text: 'Three days up here and she cut nobody. Four of her own patangs went down the wind.' },
    ],
    choices: [
      { text: '"Four kites gone. Was she upset?"', goto: 'c11.yusuf.her.ask' },
      { text: 'Say nothing; help him wind the dor.', goto: 'c11.yusuf.her.wind' },
    ],
  },
  'c11.yusuf.her.ask': {
    lines: [
      { who: 'Ustad Yusuf Miyan', text: 'Every time the line went light she laughed so loud the neighbors came up to see who was winning. It was never her.' },
    ],
    effects: ['set:c11.her', 'journal:her.delhi'],
  },
  'c11.yusuf.her.wind': {
    lines: [{ text: 'You take a turn on the charkhi. He watches your thumb and approves by not commenting.' }],
    next: 'c11.yusuf.her.ask',
  },
  'c11.yusuf.begum': {
    lines: [
      { text: 'Begum steps from your jacket onto his wrist like a queen back from exile.' },
      { who: 'Ustad Yusuf Miyan', text: 'Begum, Begum. Somebody\'s glass line. Sushila ji splinted this?' },
      { who: 'Ustad Yusuf Miyan', text: 'Thirty years she has called my kites cruelty and mended what they cut. Tell her the argument stands, and the tea too.' },
    ],
    effects: ['errand.done', 'clear:errand.pigeon-home', 'set:c11.pigeon.home'],
  },
  'c11.yusuf.duel': {
    lines: [
      { who: 'Ustad Yusuf Miyan', text: 'The rains have opened. The kucha flies its tournament: three rivals, and a storm behind the fort.' },
      { who: 'Ustad Yusuf Miyan', text: 'My hands are old and my roof needs a flyer. You.' },
    ],
    choices: [
      { text: 'Fly for the kucha', goto: 'c11.yusuf.duelgo' },
      { text: 'Not yet; steady my hands first', goto: 'c11.yusuf.duellater' },
    ],
  },
  'c11.yusuf.duelgo': {
    lines: [{ who: 'Ustad Yusuf Miyan', text: 'Birds before glory, always. Go. Make the sky shout.' }],
    effects: ['set:c11.duel.start'],
  },
  'c11.yusuf.duellater': {
    lines: [
      { who: 'Ustad Yusuf Miyan', text: 'The rivals will wait. They enjoy the waiting.' },
    ],
  },
  'c11.duel.won': {
    lines: [
      { text: 'Yellow, green, red: three lines sawed free, and WOH KATA from fifty roofs. Then the storm lands all at once.' },
      { who: 'Ustad Yusuf Miyan', text: 'The roofs are a country, and you have voted. Go and be rained on properly.' },
    ],
    effects: ['clear:c11.duel.start', 'set:c11.duel.done'],
  },
  'c11.yusuf.after': {
    lines: [
      { who: 'Ustad Yusuf Miyan', text: 'The flock flew a full wheel after the storm. Begum led. Tell Sushila ji the wing sits true.' },
    ],
    effects: ['set:c11.yusuf2'],
  },
  // Delhi's goodbye: no food, no turned back. One plain kite, flown and then
  // given the whole line, follows her four west. The roof counts to five.
  'c11.yusuf.bye': {
    lines: [
      { text: 'One plain patang waits on the charkhi, and no rival is up.' },
      { who: 'Ustad Yusuf Miyan', text: 'Her four went down the wind laughing. Send one after them: fly it, then give it the whole dor.' },
    ],
    choices: [
      { text: 'Fly it, and let the line run out', goto: 'c11.yusuf.bye2' },
      { text: 'Not yet', goto: 'c11.yusuf.byelater' },
    ],
  },
  'c11.yusuf.bye2': {
    lines: [
      { text: 'It climbs over the domes. You open your fingers, and the dor runs out past the knot.' },
      { text: 'West over the roofs it goes, small, then smaller. Below, a child shouts woh kata at nobody.' },
      { who: 'Ustad Yusuf Miyan', text: 'Five. Your family keeps a long account with this sky.' },
    ],
    effects: ['set:c11.complete'],
  },
  'c11.yusuf.byelater': {
    lines: [{ who: 'Ustad Yusuf Miyan', text: 'The kite keeps. So does the wind, mostly.' }],
  },
  'c11.yusuf.idle': {
    lines: [
      { who: 'Ustad Yusuf Miyan', text: 'Between the flights, the roof thinks. You may think here too.' },
    ],
  },
  'c11.yusuf.flyagain': {
    lines: [
      { who: 'Ustad Yusuf Miyan', text: 'The wind is doing nothing important. Neither, from the look of you, are you.' },
    ],
    choices: [
      { text: 'Take the charkhi up again', when: { has: ['c11.kite.done'] }, goto: 'c11.yusuf.kiteReplay' },
      { text: 'Fly the tournament sky once more', when: { has: ['c11.duel.done'] }, goto: 'c11.yusuf.duelReplay' },
      { text: 'Just stand and watch the roofs', goto: 'c11.yusuf.idle' },
    ],
  },
  'c11.yusuf.kiteReplay': {
    lines: [
      { who: 'Ustad Yusuf Miyan', text: 'No tournament. One kite, one sky. This is the version I actually like.' },
    ],
    effects: ['set:replay.mode', 'set:c11.kite.start'],
  },
  'c11.yusuf.duelReplay': {
    lines: [{ who: 'Ustad Yusuf Miyan', text: 'The roofs replay that night constantly, and each telling adds a rival. Yellow, green, red.' }],
    effects: ['set:replay.mode', 'set:c11.duel.start'],
  },

  // ---------------- Sushila Jain, the bird ward ----------------
  'c11.sushila.first': {
    lines: [
      { text: 'A woman in white splints a pigeon\'s wing with total calm.' },
      { who: 'Sushila Jain', text: 'Manjha cut. Glass string. Hold this end; do not squeeze. She is a patient, not a toy.' },
    ],
    effects: ['set:c11.met.sushila'],
    choices: [{ text: 'Hold the wing still', goto: 'c11.sushila.held' }],
  },
  'c11.sushila.held': {
    lines: [
      { text: 'You hold. She wraps. The pigeon blinks through its own surgery.' },
      { who: 'Sushila Jain', text: 'Kites are a beautiful argument for cruelty. I have said so for thirty years.' },
    ],
    effects: ['journal:people.sushila'],
  },
  'c11.sushila.errand': {
    lines: [
      { who: 'Sushila Jain', text: 'You climb to that roof, yes? This is Begum, the old man\'s head pigeon. Her patience with me is finished.' },
      { who: 'Sushila Jain', text: 'Straight up the stairs. The splint stays one more week, whatever the bird tells him.' },
    ],
    effects: ['errand:pigeon-home', 'set:errand.pigeon-home'],
  },
  'c11.sushila.argue': {
    lines: [
      { who: 'Sushila Jain', text: 'The argument stands and so does the tea? Thirty years, and the man finally says one accurate sentence.' },
      { who: 'Sushila Jain', text: 'Write it down: you can disagree with someone every day and still keep their tea warm.' },
    ],
    effects: ['set:c11.sushila2'],
  },
  'c11.sushila.idle': {
    lines: [
      { who: 'Sushila Jain', text: 'Cotton for wounds, cotton for kites.' },
    ],
  },

  // ---------------- Akhtar Bhai, the chai corner ----------------
  'c11.akhtar.first': {
    lines: [
      { text: 'Brass kettle, coal glow, kulhads stacked like a clay minaret.' },
      { who: 'Akhtar Bhai', text: 'Kulhad chai, first one free. Drink, then the cup goes on the stones: one cup, one life, no washing up.' },
    ],
    effects: ['set:c11.met.akhtar', 'journal:people.akhtar'],
    choices: [
      { text: 'Dash the empty kulhad on the stones', goto: 'c11.akhtar.dash' },
      { text: 'Keep the cup', goto: 'c11.akhtar.keep' },
    ],
  },
  'c11.akhtar.keep': {
    lines: [
      { who: 'Akhtar Bhai', text: 'Keep it? Then it is a souvenir and I am a museum. The stones are waiting.' },
    ],
    next: 'c11.akhtar.dash',
  },
  'c11.akhtar.dash': {
    lines: [
      { text: 'It shatters, musically. The lane gets a little more percussion.' },
    ],
  },
  'c11.akhtar.menu': {
    lines: [
      { who: 'Akhtar Bhai', text: 'Aaiye, aaiye. Chai is default, sherbet is philosophy.' },
    ],
    choices: [
      { text: 'Ask about Nani\'s moonlight dish', goto: 'c11.akhtar.daulat' },
      { text: 'Ask about the pink bottle', goto: 'c11.akhtar.rooh' },
      { text: 'Just chai, and the news', goto: 'c11.akhtar.news' },
    ],
  },
  'c11.akhtar.daulat': {
    lines: [
      { who: 'Akhtar Bhai', text: 'Daulat ki chaat? In SAWAN? It sets on winter dew. Come when your breath shows.' },
      { text: 'Then he sees the journal on the counter, and goes still.' },
      { who: 'Akhtar Bhai', text: 'A girl with that same journal asked my father, monsoon of 1974. Her December IOU is still in this tin. Yours goes under it.' },
    ],
    effects: ['set:c11.promise.daulat', 'journal:dishes.daulat'],
    next: 'c11.akhtar.storm',
  },
  'c11.akhtar.rooh': {
    lines: [
      { who: 'Akhtar Bhai', text: 'Rooh Afza! Rose and herbs, pink as a wedding, cold as mercy.' },
      { text: 'The first sip lowers the afternoon by ten degrees.' },
    ],
    effects: ['journal:dishes.roohafza'],
  },
  'c11.akhtar.news': {
    lines: [
      { who: 'Akhtar Bhai', text: 'News! The sky is loading a headline, and Sethji ignored a Bombay buyer so hard the man apologized.' },
    ],
  },
  'c11.akhtar.sher': {
    lines: [
      { text: 'You try the haveli wall\'s couplet: hazaaron khwahishen aisi, ki har khwahish pe dam nikle.' },
      { who: 'Akhtar Bhai', text: 'WAH! Half the meter fell in a puddle, but the heart arrived dry. Sher for chai, forever.' },
      { who: 'Akhtar Bhai', text: 'Ghalib lived three lanes over and owed half this city money. We forgave him for the couplets.' },
    ],
    effects: ['set:c11.sherchai', 'journal:customs.sher'],
  },
  'c11.akhtar.storm': {
    lines: [
      { who: 'Akhtar Bhai', text: 'Positions! The sky has been building its opening line all day. Any minute. ANY minute.' },
    ],
    next: 'c11.rain.arrives',
  },
  'c11.rain.arrives': {
    lines: [
      { text: 'The first drop hits the chai stall’s striped awning like a drumbeat. Then the lane is ankle-deep and delighted.' },
      { text: 'Somebody starts frying pakoras. The whole gali stands out in it, faces up.' },
    ],
    effects: ['set:c11.rain'],
    choices: [
      {
        text: '"I know this smell. It walked me up from Kerala."',
        goto: 'c11.akhtar.ksmell',
        when: { has: ['c6.rain'] },
      },
      { text: 'Ask what the smell is', goto: 'c11.akhtar.mitti' },
    ],
  },
  'c11.akhtar.ksmell': {
    lines: [
      { who: 'Akhtar Bhai', text: 'Sunte ho? This one stood in the first rain in Kerala, then RACED it here.' },
      { who: 'Akhtar Bhai', text: 'The smell is mitti, wet earth. Same perfume, two coasts.' },
    ],
  },
  'c11.akhtar.mitti': {
    lines: [
      { who: 'Akhtar Bhai', text: 'That, beta, is mitti. Wet earth. Every kulhad you drank from was practicing the smell.' },
      { who: 'Akhtar Bhai', text: 'A woman in the attar lane sells exactly this in a bottle.' },
    ],
  },
  'c11.akhtar.rainchai': {
    lines: [
      { who: 'Akhtar Bhai', text: 'Rain-watching chai: same kettle, better theater.' },
      { text: 'Thunder lands a beat late, and Akhtar shakes his head like an umpire.' },
    ],
    effects: ['set:c11.rainchai'],
  },
  'c11.akhtar.idle': {
    lines: [
      { who: 'Akhtar Bhai', text: 'Between errands? That is my entire clientele.' },
    ],
    choices: [
      { text: '"Remind me which errand, Akhtar Bhai?"', goto: 'c11.akhtar.thread' },
      { text: 'Just the chai', goto: 'c11.akhtar.threadNo' },
    ],
  },
  'c11.akhtar.thread': {
    lines: [{ who: 'Akhtar Bhai', text: 'Breaking news: traveler mislays own morning. Sources say the wrist knows.' }],
    effects: ['thread:'],
  },
  'c11.akhtar.threadNo': {
    lines: [
      { who: 'Akhtar Bhai', text: 'Wise. All roads pass this kettle.' },
    ],
  },

  // ---------------- Mehr Aapa, the attar lane ----------------
  'c11.mehr.first': {
    lines: [
      { text: 'A cabinet of amber bottles, each a small sun.' },
      { who: 'Mehr Aapa', text: 'No, you may not smell them all. The nose is a small room. Choose with your eyes.' },
    ],
    effects: ['set:c11.met.mehr'],
    choices: [
      { text: 'Point at the dark vial on the second shelf', goto: 'c11.mehr.vial' },
      { text: 'Point at the rose, obviously', goto: 'c11.mehr.rose' },
    ],
  },
  'c11.mehr.rose': {
    lines: [
      { who: 'Mehr Aapa', text: 'Rose is for weddings and apologies. Your eyes went to the dark one first.' },
    ],
    next: 'c11.mehr.vial',
  },
  'c11.mehr.vial': {
    lines: [
      { who: 'Mehr Aapa', text: 'Mitti attar: baked earth, distilled into sandalwood. First rain, in a bottle. Not for sale; for deserving.' },
    ],
  },
  'c11.mehr.gift': {
    lines: [
      { who: 'Mehr Aapa', text: 'You want the mitti? Earn it with your mouth, not your money. Describe a first rain you stood in.' },
    ],
    choices: [
      {
        text: 'Describe Kerala\'s first rain: coins on tin, then tile',
        goto: 'c11.mehr.kerala',
        when: { has: ['c6.rain'] },
      },
      { text: 'Admit you have not stood in one yet', goto: 'c11.mehr.wait' },
    ],
  },
  'c11.mehr.kerala': {
    lines: [
      { text: 'You give her the backwater monsoon: coins on tin, then tile, kids running OUT of cover.' },
      { who: 'Mehr Aapa', text: 'The tin before the tile. Only someone who stood in it knows the tin sings first.' },
      { text: 'A vial small as a fingertip. One drop on your wrist and the first rain happens again.' },
    ],
    effects: ['set:c11.attar.mitti', 'journal:customs.mitti', 'journal:people.mehr'],
  },
  'c11.mehr.wait': {
    lines: [
      { who: 'Mehr Aapa', text: 'Honest, at least. When sawan breaks, stand in it. Then come back wet and tell me.' },
    ],
    effects: ['set:c11.mehr.asked'],
  },
  'c11.mehr.rain2': {
    lines: [
      { text: 'You come back damp: the drumbeat, the stones exhaling, kids claiming the puddles.' },
      { who: 'Mehr Aapa', text: 'The stones exhaling. Good. That is mitti.' },
      { text: 'A vial small as a fingertip. One drop on your wrist and the first rain happens again.' },
    ],
    effects: ['set:c11.attar.mitti', 'journal:customs.mitti', 'journal:people.mehr'],
  },
  'c11.mehr.waiting': {
    lines: [
      { who: 'Mehr Aapa', text: 'Still dry? When sawan breaks, stand in it.' },
    ],
  },
  'c11.mehr.nani': {
    lines: [
      { who: 'Mehr Aapa', text: 'That journal. My mother\'s ledger keeps one Peruvian girl, monsoon of 1974.' },
      { text: 'Mitti attar, one tola. Paid with a story: a mountain rain, told so well the shop went quiet.' },
      { who: 'Mehr Aapa', text: 'Yours is the second vial we have given your family.' },
    ],
    effects: ['set:c11.mehr.nani2'],
  },
  'c11.mehr.idle': {
    lines: [{ who: 'Mehr Aapa', text: 'Perfume is memory with a stopper, beta. Choose slowly.' }],
  },

  // ---------------- Sethji, the barrier with a ledger ----------------
  'c11.sethji.cold': {
    lines: [
      { text: 'The spice end: sack mountains, chilli haze, and a man on a white gaddi, writing.' },
      { text: 'You greet him. He does not look up.' },
    ],
    effects: ['set:c11.met.sethji'],
  },
  'c11.sethji.cold2': {
    lines: [{ text: 'Sethji weighs, writes, and ignores you with the ease of a man who has ignored viceroys.' }],
  },
  'c11.sethji.test': {
    lines: [
      { text: 'You say three names: Kamla, Joginder, Yusuf. The pen stops.' },
      { who: 'Sethji Onkar Nath', text: 'The tawa says you feed, the langar says you serve, the roof says you read wind. Hm. Nothing in this market moves without a chit.' },
    ],
    next: 'c11.sethji.pods',
  },
  // The smell test is the player's nose, not his lecture: two pods, one
  // question, as many sniffs as it takes.
  'c11.sethji.pods': {
    lines: [
      { text: 'He holds out two pods, one in each palm: small and green, big and brown.' },
      { who: 'Sethji Onkar Nath', text: 'Which one grew in the wet hills of the south?' },
    ],
    choices: [
      {
        text: '"The small green one. It rode down to a jetty I stood on."',
        goto: 'c11.sethji.cardamom',
        when: { has: ['c6.complete'] },
      },
      { text: 'Smell the small green pod', goto: 'c11.sethji.small' },
      { text: 'Smell the big brown pod', goto: 'c11.sethji.big' },
    ],
  },
  'c11.sethji.small': {
    lines: [{ text: 'Sharp and sweet, like rain turning to sugar.' }],
    choices: [
      { text: '"This one."', goto: 'c11.sethji.lesson' },
      { text: 'Smell the other', goto: 'c11.sethji.big' },
    ],
  },
  'c11.sethji.big': {
    lines: [{ text: 'Smoke and shoulder: a campfire in a husk.' }],
    choices: [
      { text: '"This one."', goto: 'c11.sethji.wrong' },
      { text: 'Smell the other', goto: 'c11.sethji.small' },
    ],
  },
  'c11.sethji.wrong': {
    lines: [{ who: 'Sethji Onkar Nath', text: 'Badi elaichi, from the eastern hills. Smoke does not grow in rain, beta. Again.' }],
    next: 'c11.sethji.pods',
  },
  'c11.sethji.lesson': {
    lines: [
      { who: 'Sethji Onkar Nath', text: 'Small elaichi. Untrained, and right anyway.' },
    ],
    next: 'c11.sethji.chit',
  },
  'c11.sethji.cardamom': {
    lines: [
      { who: 'Sethji Onkar Nath', text: 'The COAST. Nine generations on this gaddi, and few strangers have known small elaichi from big.' },
      { who: 'Sethji Onkar Nath', text: 'You stood on its jetty? Then you and this pod are old shipmates.' },
    ],
    next: 'c11.sethji.chit',
  },
  'c11.sethji.chit': {
    lines: [
      { text: 'He writes six lines, stamps them with a brass seal, and folds the chit once.' },
      { who: 'Sethji Onkar Nath', text: 'My cousin\'s firm, Bombay docks; they load for Zanzibar. These cloves go with you: carry my cargo.' },
      { who: 'Sethji Onkar Nath', text: 'Now go. The ledger missed you the moment I looked up.' },
    ],
    effects: ['set:c11.chit.bombay', 'journal:people.sethji'],
  },
  'c11.sethji.after': {
    lines: [
      { who: 'Sethji Onkar Nath', text: 'The chit stays folded until Bombay, the cloves stay dry.' },
    ],
  },

  // ---------------- Divakaran Master, over the mountains of books ----------------
  'c11.master.first': {
    lines: [
      { text: 'By the book bundles, a familiar figure weighs a dictionary.' },
      { who: 'Divakaran Master', text: 'The letter-carrier! I buy the reading room its books by weight: poetry is heavy, politics is cheap.' },
    ],
    effects: ['set:c11.met.master'],
  },
  'c11.master.quiz': {
    lines: [
      { who: 'Divakaran Master', text: 'You left my village before I could set an examination. One question; you choose it.' },
    ],
    effects: ['set:c11.master.quizzed'],
    choices: [
      {
        text: '"I rowed seat forty-one in a chundan vallam."',
        goto: 'c11.master.row',
        when: { has: ['c6.row.done'] },
      },
      { text: '"I respectfully fail."', goto: 'c11.master.fail' },
    ],
  },
  'c11.master.row': {
    lines: [
      { who: 'Divakaran Master', text: 'Seat forty-one! I watched from the bank with two newspapers and one umbrella.' },
    ],
  },
  'c11.master.fail': {
    lines: [
      { who: 'Divakaran Master', text: 'An honest fail earns the lesson: a hundred rowers, one song. Miss the beat and you row alone.' },
    ],
  },
  'c11.master.idle': {
    lines: [{ who: 'Divakaran Master', text: 'Delhi sells books by the kilo and poems by the couplet, and calls both a bargain. Correctly.' }],
  },

  // ---------------- Chasca, at the storm's shutter ----------------
  'c11.chasca.photo': {
    lines: [
      { text: 'She is on the parapet, soaked, camera dry under a plastic bag with a lens hole.' },
      { who: 'Chasca', text: 'The soup-eater, RAINING. Perfect, do not dry off.' },
      { text: 'Lightning obliges over the fort. Her shutter clicks once.' },
    ],
    effects: ['set:c11.met.chasca11', 'set:photo.flash', 'set:photo.c11.kites'],
  },
  'c11.chasca.album': {
    lines: [{ who: 'Chasca', text: 'One frame, whole sky, no reshoots. This one is loud and wet and full of paper birds.' }],
  },

  // ---------------- Sheru, the gali dog ----------------
  'c11.sheru.first': {
    lines: [
      { text: 'A brown dog with one standing ear inspects your shoes and finds them acceptable.' },
      { text: 'Everyone calls him Sheru. He answers Kamla fastest, for professional reasons.' },
    ],
    effects: ['set:c11.met.sheru'],
  },
  'c11.sheru.rain': {
    lines: [{ text: 'Sheru is soaked to the ears and bears it like a minister at a ribbon-cutting. He blinks at you slowly.' }],
    effects: ['set:c11.sheru2'],
  },
  'c11.egg.sheru1': {
    lines: [{ text: 'Sheru finds you before the smell of your pockets does. The tawa business made you colleagues.' }],
    effects: ['set:egg.c11.sheru1'],
  },
  'c11.egg.sheru2': {
    lines: [{ text: 'Today he walks one shop ahead of you, checking back like a hired guide. At Akhtar\'s corner he stares at the kettle.' }],
    effects: ['set:egg.c11.sheru2'],
  },
  'c11.egg.sheru3': {
    lines: [
      { text: 'At the chai corner a kulhad is already down off the stack, steam up, unasked for.' },
      { who: 'Akhtar Bhai', text: 'The dog said you were coming. Regulars here are appointed by Sheru, beta.' },
    ],
    effects: ['set:egg.c11.sheru3'],
  },
  'c11.sheru.idle': {
    lines: [{ text: 'Sheru patrols on a schedule known only to him. A parantha edge finds him; statistically, one always does.' }],
  },

  // ---------------- the post box ----------------
  'c11.post.pilar': {
    lines: [
      { text: 'The red pillar box has stood here since an empire mistook itself for permanent. A postman fishes out mail held for travelers.' },
      { text: 'One envelope wears stamps like campaign medals.' },
    ],
    effects: ['letter:delhi.pilar'],
  },
  'c11.post.mariamma': {
    lines: [{ text: 'The postman produces an envelope soft at the corners, postmarked with a green coast, smelling faintly of a kitchen.' }],
    effects: ['letter:delhi.mariamma'],
  },
  'c11.post.idle': {
    lines: [{ text: 'The post box swallows letters for Bombay, Muscat, Lima, and one backwater village. Monsoon permitting.' }],
  },

  // ---------------- examines: new kinds, exterior ----------------
  // Kinds that say one thing share one node (sacks and spills, wires and
  // spans, terrace and its washes): the lane is dense, the reading is not.
  'c11.ex.galistone': {
    lines: [{ text: 'Stone flags worn soft by four centuries of feet.' }],
  },
  'c11.ex.chowkbrick': {
    lines: [{ text: 'Herringbone brick. The cars wait outside the chowk like scolded dogs.' }],
  },
  // The sevadar sent you here; the square answers for its own name.
  'c11.ex.chowkbrick.moon': {
    lines: [
      { text: 'Down the chowk\'s spine the brick dips in one shallow line: an old canal, paved over. The moon rode it all night.' },
      { text: 'Chandni Chowk, the moonlight square. The silver shops came later and took the credit.' },
    ],
    effects: ['journal:customs.chandni'],
  },
  'c11.ex.wornedge': {
    lines: [{ text: 'A strip ground down by wheels, feet, and hooves. No mason made this. Everyone did.' }],
  },
  'c11.ex.mohallawall': {
    lines: [{ text: 'A film poster, an ad ghost, and a monsoon streak, sharing one wall without friction.' }],
  },
  'c11.ex.haveli': {
    lines: [{ text: 'A carved jharokha above, an aluminum shopfront below, wires past every window like ivy with a job.' }],
  },
  'c11.ex.gurdwara': {
    lines: [{ text: 'Sis Ganj Sahib. The kitchen behind this door has never closed.' }],
  },
  'c11.ex.stairup': {
    lines: [{ text: 'Twelve whitewashed steps, worn shiny up the middle, and then one sky.' }],
  },
  'c11.ex.griddle': {
    lines: [{ text: 'Kamla\'s iron tawa, black with forty years of virtue. The queue forms by reflex.' }],
  },
  'c11.ex.griddle.after': {
    lines: [{ text: 'The tawa that taught your hands. You can hear when the ghee is ready now.' }],
  },
  'c11.ex.jalebi': {
    lines: [{ text: 'Bade Mian\'s kadhai, since 1902. A jalebi lands in your hand, too hot to hold. You hold it; here that is a handshake.' }],
    effects: ['journal:dishes.jalebi'],
  },
  'c11.ex.chaikhana': {
    lines: [{ text: 'Akhtar\'s bench has heard forty years of news and improved most of it.' }],
  },
  'c11.ex.kulhadtower': {
    lines: [{ text: 'Clay cups stacked to a height only confidence explains. Each will die a musical death.' }],
  },
  'c11.ex.khomcha': {
    lines: [{ text: 'A wicker khomcha, folded muslin, no wares. Sawan gets the empty basket.' }],
  },
  'c11.ex.khomcha.promise': {
    lines: [{ text: 'The empty khomcha, waiting for December. In Akhtar\'s tin, two IOUs share a page.' }],
  },
  'c11.ex.sackpyramid': {
    lines: [{ text: 'A jute mountain range of cardamom and dried ginger. You lean closer and sneeze twice. A porter blesses you in three languages.' }],
    effects: ['set:c11.sneezed'],
  },
  'c11.ex.sackpyramid.again': {
    lines: [{ text: 'You breathe shallow, like the porters. The sneeze waits; it knows you will forget.' }],
  },
  'c11.ex.chilisacks': {
    lines: [{ text: 'Chilli, red as a warning nobody heeds, tracked down the lane in a map of the day\'s deliveries.' }],
  },
  'c11.ex.sethgaddi': {
    lines: [{ text: 'White sheet, brass scale, and a ledger whose entries reach Bombay without standing up.' }],
  },
  'c11.ex.sethgaddi.chit': {
    lines: [{ text: 'Your road west was written here in six lines. The ledger has already moved on.' }],
  },
  'c11.ex.attarcase': {
    lines: [{ text: 'Rose, oud, khus, and on the second shelf, the monsoon itself.' }],
  },
  'c11.ex.cardstall': {
    lines: [{ text: 'Wedding cards in red and gold: futures, printed in three scripts.' }],
  },
  'c11.ex.bookbundle': {
    lines: [{ text: 'Books tied in jute, sold by weight, argued by title.' }],
  },
  'c11.ex.signstack': {
    lines: [{ text: 'Signboards in three scripts, one tube light failing politely since 1987.' }],
  },
  'c11.ex.wirebundle': {
    lines: [{ text: 'Every current the mohalla ever subscribed to. Nobody knows which wire does what; everybody knows whom to shout for.' }],
  },
  // Jugaad lives on the rickshaw it describes, not in Bantu's greeting.
  'c11.ex.rickshaw': {
    lines: [{ text: 'Parts from three machines, wedding tinsel, and a bell that outranks the brakes. Jugaad, licensed.' }],
    effects: ['journal:words.jugaad'],
  },
  'c11.ex.thela': {
    lines: [
      { text: 'Langra mangoes, priced with theatrical sorrow. You walk away; the dance requires it.' },
      { text: 'Arre suniye toh! He calls you back like a lost nephew and adds one free for your health.' },
    ],
    effects: ['journal:customs.bargain'],
  },
  'c11.ex.thela.again': {
    lines: [{ text: 'The first price is higher now, out of respect.' }],
  },
  'c11.ex.monkeywire': {
    lines: [{ text: 'The monkey commute: along the wire, pause, judge the humans, proceed.' }],
  },
  'c11.ex.peepal': {
    lines: [{ text: 'The thread round the peepal\'s trunk holds a hundred quiet asks.' }],
  },
  'c11.ex.handpump': {
    lines: [{ text: 'Cast iron, public, undefeated. Porters, pigeons, kids: one queue.' }],
  },
  'c11.ex.gullywall': {
    lines: [{ text: 'Three chalked stumps. The LBW appeal beside them has been under review since before you were born.' }],
  },
  'c11.ex.birdward': {
    lines: [{ text: 'Cotton, splints, small scissors: the bird hospital\'s field desk.' }],
  },
  'c11.ex.nishansahib': {
    lines: [{ text: 'Saffron over the whole square, marking the door that never closes.' }],
  },
  'c11.ex.garlandline': {
    lines: [{ text: 'Marigolds by the arm\'s length. Weddings, temples, taxi dashboards: one orange blesses all three.' }],
  },
  // The kulhad page fills here, over the evidence, not in Akhtar's greeting:
  // you understand the cup's whole life at the sight of its afterlife.
  'c11.ex.kulhadshards': {
    lines: [{ text: 'Spent kulhads, shattered as intended. The gutters glitter with clay applause.' }],
    effects: ['journal:dishes.kulhadchai'],
  },
  'c11.ex.pigeonpeck': {
    lines: [{ text: 'Pigeons auditing spilled grain, one grey feather left behind.' }],
  },
  'c11.ex.puddle': {
    lines: [{ text: 'A puddle holding one cut kite, upside down. By city law it belongs to the kids.' }],
  },
  'c11.ex.charpai': {
    lines: [{ text: 'A rope charpai, sagging with testimony. Load rating: two gossips, or one philosopher lying down.' }],
  },

  // ---------------- examines: rooftop ----------------
  'c11.ex.kabootarkhana': {
    lines: [{ text: 'Whitewashed compartments, named tenants. Begum runs the coop; Yusuf pays the grain bill.' }],
  },
  'c11.ex.kitestack': {
    lines: [{ text: 'Patangs in a paper rainbow. Each costs less than a chai and carries more ambition than most careers.' }],
  },
  'c11.ex.charkhi': {
    lines: [{ text: 'The charkhi, wound fat with plain cotton dor. No glass on this roof.' }],
  },
  'c11.ex.tanktrio': {
    lines: [{ text: 'A black tank on stilts. One pigeon stands on the lid at all times; the post appears to be hereditary.' }],
  },
  'c11.ex.dhobiline': {
    lines: [{ text: 'Kurtas, dupattas, one defecting bedsheet. Laundry is the weather report up here.' }],
  },
  'c11.ex.dishantenna': {
    lines: [{ text: 'A dish weighted with two bricks, an antenna guyed with kite string. The picture snows only during cricket.' }],
  },
  'c11.ex.fortwall': {
    lines: [{ text: 'The Red Fort\'s wall holds the northern horizon down. Thunderheads stack behind it like an early audience.' }],
  },
  'c11.ex.jamadomes': {
    lines: [{ text: 'At dusk the domes go rose, and every pigeon in the walled city takes it personally.' }],
  },
  'c11.ex.parapet': {
    lines: [{ text: 'Brick lace at knee height, the correct place for elbows and evenings.' }],
  },
  'c11.ex.pigeonflock': {
    lines: [{ text: 'A grey carpet with opinions. Walk in and it becomes weather for four seconds.' }],
  },
  'c11.ex.jaalipanel': {
    lines: [{ text: 'A sandstone jaali of a hundred small stars. The afternoon comes through as coins.' }],
  },
  'c11.ex.dryingcloth': {
    lines: [{ text: 'Cloth laid flat on the dust, a stone on each corner. The dhobi will be back before the rain. He always is.' }],
  },
  'c11.ex.kitecut': {
    lines: [{ text: 'A cut kite come to rest. Nobody takes it down; that would be admitting things.' }],
  },
  'c11.ex.terrace': {
    lines: [{ text: 'Lime-washed terrace brick, whitewashed for the birds. A second city, with the sky at arm\'s reach.' }],
  },
  'c11.ex.mumty': {
    lines: [{ text: 'Every roof here begins with a small dark room like this one and ends with the whole sky.' }],
  },
  'c11.ex.neemtub': {
    lines: [{ text: 'A neem in a bus-blue oil drum: the roof\'s only shade, the lane\'s only free toothbrushes.' }],
  },
  // Down in the gali there are four of these, so none is the only shade.
  'c11.ex.neemtub.lane': {
    lines: [{ text: 'A neem in a bus-blue oil drum, watered with whatever is left in the kettle. The lane\'s only free toothbrushes.' }],
  },
  'c11.ex.kitemast': {
    lines: [{ text: 'A cut kite tied to a bamboo mast at shoulder height. Not decoration. A receipt.' }],
  },
  'c11.ex.shopspill': {
    lines: [{ text: 'A shop that ran out of shop. Nobody complains twice.' }],
  },
  'c11.ex.tulsipot': {
    lines: [{ text: 'A tulsi, watered before anyone\'s tea. Pigeons above, and not one leaf missing.' }],
  },
  'c11.ex.transistor': {
    lines: [{ text: 'The cricket, relayed roof to roof faster than the ball.' }],
  },
  'c11.ex.chaitray': {
    lines: [{ text: 'Quorum for the roof parliament: two cups and one disagreement.' }],
  },
  'c11.ex.diyaledge': {
    lines: [{ text: 'Clay diyas lit for the dusk flight: the roof\'s own constellation.' }],
  },
  'c11.ex.stool.roof': {
    lines: [{ text: 'A low stool for knees that vote against the floor.' }],
  },

  // ---------------- examines: langar hall ----------------
  'c11.ex.degpot': {
    lines: [{ text: 'A deg the size of a well. It has never cooked for fewer than everyone.' }],
  },
  'c11.ex.chulha': {
    lines: [{ text: 'Fed since before dawn. The heat, like everything here, is donated.' }],
  },
  'c11.ex.attaboard': {
    lines: [{ text: 'Dough in planetary quantities, and the rolling pins of everyone who ever said I can help.' }],
  },
  'c11.ex.rotistack': {
    lines: [{ text: 'Rotis warm in cloth. The stack never quite grows and never quite empties.' }],
  },
  'c11.ex.pangat': {
    lines: [{ text: 'Striped matting, one level. The floor is the point.' }],
  },
  'c11.ex.rumalbasket': {
    lines: [{ text: 'Rumals in confident colors. They all fit everyone.' }],
  },
  'c11.ex.shoerack': {
    lines: [{ text: 'Chappals, office shoes, one tiny pair with lights in the heels, held without ranking.' }],
  },
  'c11.ex.doormat': {
    lines: [{ text: 'Coir, worn thin where a thousand feet agreed to be polite.' }],
  },
  'c11.ex.waterstation': {
    lines: [{ text: 'Sweating clay matkas. Cold water, free, all July: the quietest ministry in the building.' }],
  },
  'c11.ex.hallfan': {
    lines: [{ text: 'Someone tied a ribbon to the fan to prove the breeze exists.' }],
  },
  'c11.ex.khandapanel': {
    lines: [{ text: 'The khanda over a saffron drape. Below it, everything is level.' }],
  },
  'c11.ex.ladlestand': {
    lines: [{ text: 'Karchhis racked by wingspan. The ladle never points at anyone.' }],
  },
  'c11.ex.thalistack': {
    lines: [{ text: 'Five hundred steel thalis, washed by whichever hands arrived. No ledger.' }],
  },

  // ---------------- examines: the poet's haveli ----------------
  'c11.ex.couplet': {
    lines: [
      { text: 'Nastaliq on whitewash: hazaaron khwahishen aisi, ki har khwahish pe dam nikle. A thousand desires, each worth a life.' },
      { text: 'You read it twice, lips moving. The chai-wallah at the gali mouth pays for lines like this.' },
    ],
    effects: ['set:c11.sher.learned', 'journal:customs.sher'],
  },
  'c11.ex.couplet.again': {
    lines: [{ text: 'The second panel: dil-e-nadaan tujhe hua kya hai. Oh innocent heart, what has happened to you.' }],
  },
  'c11.ex.divan': {
    lines: [{ text: 'Brocade bolsters holding the shape of a century of good talks, none of them finished.' }],
  },
  'c11.ex.takht': {
    lines: [{ text: 'Two lines begun, one crossed out, the drafts crumpled on the floor. The crossing-out is the craft.' }],
  },
  'c11.ex.bookchest': {
    lines: [{ text: 'One volume lies open on top, mid-sentence since before Partition.' }],
  },
  'c11.ex.mangocrate': {
    lines: [{ text: 'Langra in straw. A friend told Ghalib even donkeys refuse mangoes. Exactly, said Ghalib. Even donkeys.' }],
    effects: ['journal:dishes.aam'],
  },
  'c11.ex.paandaan': {
    lines: [{ text: 'A brass paandaan, hinged like a small bank vault: a whole diplomacy in one box.' }],
  },
  'c11.ex.lampniche': {
    lines: [{ text: 'One oil lamp, fifty years of soot. Still the best reading light in the room.' }],
  },

  // ---------------- examines: shared kinds, this chapter's voice ----------------
  'c11.ex.door': {
    lines: [{ text: 'A door that looks closed. In this gali it is only resting.' }],
  },
  'c11.ex.farol': {
    lines: [{ text: 'A lane lamp wired into the tangle by a method best not audited.' }],
  },
  'c11.ex.tuft': {
    lines: [{ text: 'Grass in a crack, fed like everything here by somebody\'s spillage.' }],
  },
  'c11.ex.dirt': {
    lines: [{ text: 'Cricket pitch, wrestling ground, puddle nursery, parliament floor, depending on the hour.' }],
  },
  'c11.ex.wallint.langar': {
    lines: [{ text: 'A painted line on the whitewash: recognize the whole human race as one.' }],
  },
  'c11.ex.wallint.haveli': {
    lines: [{ text: 'Lime plaster a lakhori brick thick. In here, the loudest thing is the ink.' }],
  },
  'c11.ex.rug.haveli': {
    lines: [{ text: 'An indigo dari worn to its geometry. The mushaira is over; the dari disagrees.' }],
  },
  'c11.ex.mat.haveli': {
    lines: [{ text: 'A reed mat older than the electricity. You wipe your feet; the haveli approves.' }],
  },
  'c11.ex.floorterrazzo': {
    lines: [{ text: 'Grey terrazzo, still damp. The mop never gets far ahead of the sangat.' }],
  },
  'c11.ex.floorsandstone': {
    lines: [{ text: 'Agra sandstone, cool in June: the whole argument for a courtyard house.' }],
  },
};

/** Examine arms: new kinds get untagged fallbacks, shared kinds speak only on these maps. */
export const DELHI_EXAMINES: Record<string, ExamineArm[]> = {
  blocked: [{ map: 'delhi', node: 'c11.ex.wall' }, { map: 'delhi-rooftop', node: 'c11.ex.wall' }, { map: 'delhi-langar', node: 'c11.ex.wall' }, { map: 'delhi-haveli', node: 'c11.ex.wall' }],
  // Both Delhi rooms are skinned in `art/sets/delhi.ts`: terrazzo in the
  // hall, sandstone in the haveli. Two floors, two different lives.
  floorEarth: [
    { map: 'delhi-langar', node: 'c11.ex.floorterrazzo' },
    { map: 'delhi-haveli', node: 'c11.ex.floorsandstone' },
  ],
  galistone: [{ node: 'c11.ex.galistone' }],
  chowkbrick: [
    // Once Joginder points your eye at the name, the square tells its own
    // moonlight story; the page fills where the canal was.
    { when: { has: ['c11.jog2'] }, node: 'c11.ex.chowkbrick.moon' },
    { node: 'c11.ex.chowkbrick' },
  ],
  wornedge: [{ node: 'c11.ex.wornedge' }],
  terrace: [{ node: 'c11.ex.terrace' }],
  mohallawall: [{ node: 'c11.ex.mohallawall' }],
  haveli: [{ node: 'c11.ex.haveli' }],
  gurdwara: [{ node: 'c11.ex.gurdwara' }],
  stairup: [{ node: 'c11.ex.stairup' }],
  paranthagriddle: [
    { when: { has: ['c11.cook.done'] }, node: 'c11.ex.griddle.after' },
    { node: 'c11.ex.griddle' },
  ],
  jalebikadhai: [{ node: 'c11.ex.jalebi' }],
  chaikhana: [{ node: 'c11.ex.chaikhana' }],
  kulhadtower: [{ node: 'c11.ex.kulhadtower' }],
  khomcha: [
    { when: { has: ['c11.promise.daulat'] }, node: 'c11.ex.khomcha.promise' },
    { node: 'c11.ex.khomcha' },
  ],
  sackpyramid: [
    { when: { has: ['c11.sneezed'] }, node: 'c11.ex.sackpyramid.again' },
    { node: 'c11.ex.sackpyramid' },
  ],
  chilisacks: [{ node: 'c11.ex.chilisacks' }],
  sethgaddi: [
    { when: { has: ['c11.chit.bombay'] }, node: 'c11.ex.sethgaddi.chit' },
    { node: 'c11.ex.sethgaddi' },
  ],
  attarcase: [{ node: 'c11.ex.attarcase' }],
  cardstall: [{ node: 'c11.ex.cardstall' }],
  bookbundle: [{ node: 'c11.ex.bookbundle' }],
  signstack: [{ node: 'c11.ex.signstack' }],
  wirebundle: [{ node: 'c11.ex.wirebundle' }],
  rickshaw: [{ node: 'c11.ex.rickshaw' }],
  thela: [
    { when: { has: ['page.customs.bargain'] }, node: 'c11.ex.thela.again' },
    { node: 'c11.ex.thela' },
  ],
  monkeywire: [{ node: 'c11.ex.monkeywire' }],
  peepal: [{ node: 'c11.ex.peepal' }],
  handpump: [{ node: 'c11.ex.handpump' }],
  gullywall: [{ node: 'c11.ex.gullywall' }],
  birdward: [{ node: 'c11.ex.birdward' }],
  nishansahib: [{ node: 'c11.ex.nishansahib' }],
  garlandline: [{ node: 'c11.ex.garlandline' }],
  marigoldheap: [{ node: 'c11.ex.garlandline' }],
  spicespill: [{ node: 'c11.ex.chilisacks' }],
  kulhadshards: [{ node: 'c11.ex.kulhadshards' }],
  pigeonpeck: [{ node: 'c11.ex.pigeonpeck' }],
  puddle: [{ node: 'c11.ex.puddle' }],
  charpai: [{ node: 'c11.ex.charpai' }],
  dakkhana: [
    // Pilar writes only to someone who has met her at the bridge.
    { when: { has: ['met.pilar'], not: ['letter.read.delhi.pilar'] }, node: 'c11.post.pilar' },
    { when: { not: ['letter.read.delhi.mariamma'] }, node: 'c11.post.mariamma' },
    { node: 'c11.post.idle' },
  ],
  chalkpitch: [{ node: 'c11.ex.gullywall' }],
  kabootarkhana: [{ node: 'c11.ex.kabootarkhana' }],
  kitestack: [{ node: 'c11.ex.kitestack' }],
  tanktrio: [{ node: 'c11.ex.tanktrio' }],
  dishantenna: [{ node: 'c11.ex.dishantenna' }],
  mumty: [{ node: 'c11.ex.mumty' }],
  neemtub: [{ map: 'delhi', node: 'c11.ex.neemtub.lane' }, { node: 'c11.ex.neemtub' }],
  kitemast: [{ node: 'c11.ex.kitemast' }],
  wirespan: [{ node: 'c11.ex.wirebundle' }],
  clothspan: [{ node: 'c11.ex.dhobiline' }],
  shopspill: [{ node: 'c11.ex.shopspill' }],
  signjut: [{ node: 'c11.ex.signstack' }],
  terracelime: [{ node: 'c11.ex.terrace' }],
  terracerose: [{ node: 'c11.ex.terrace' }],
  tulsipot: [{ node: 'c11.ex.tulsipot' }],
  transistor: [{ node: 'c11.ex.transistor' }],
  chaitray: [{ node: 'c11.ex.chaitray' }],
  charpaibed: [{ node: 'c11.ex.charpai' }],
  diyaledge: [{ node: 'c11.ex.diyaledge' }],
  kitesnag: [{ node: 'c11.ex.kitecut' }],
  grainspill: [{ node: 'c11.ex.pigeonpeck' }],
  charkhi: [{ node: 'c11.ex.charkhi' }],
  watertank: [{ node: 'c11.ex.tanktrio' }],
  dhobiline: [{ node: 'c11.ex.dhobiline' }],
  antennajugaad: [{ node: 'c11.ex.dishantenna' }],
  fortwall: [{ node: 'c11.ex.fortwall' }],
  jamadomes: [{ node: 'c11.ex.jamadomes' }],
  parapet: [{ node: 'c11.ex.parapet' }],
  parapetside: [{ node: 'c11.ex.parapet' }],
  dryingcloth: [{ node: 'c11.ex.dryingcloth' }],
  jaalipanel: [{ node: 'c11.ex.jaalipanel' }],
  pigeonflock: [{ node: 'c11.ex.pigeonflock' }],
  kitecut: [{ node: 'c11.ex.kitecut' }],
  degpot: [{ node: 'c11.ex.degpot' }],
  chulha: [{ node: 'c11.ex.chulha' }],
  attaboard: [{ node: 'c11.ex.attaboard' }],
  rotistack: [{ node: 'c11.ex.rotistack' }],
  pangat: [{ node: 'c11.ex.pangat' }],
  rumalbasket: [
    { when: { has: ['c11.met.jog'], not: ['c11.rumal'] }, node: 'c11.jog.tie' },
    { node: 'c11.ex.rumalbasket' },
  ],
  shoerack: [{ node: 'c11.ex.shoerack' }],
  doormat: [{ node: 'c11.ex.doormat' }],
  waterstation: [{ node: 'c11.ex.waterstation' }],
  hallfan: [{ node: 'c11.ex.hallfan' }],
  khandapanel: [{ node: 'c11.ex.khandapanel' }],
  ladlestand: [{ node: 'c11.ex.ladlestand' }],
  thalistack: [{ node: 'c11.ex.thalistack' }],
  lampniche: [{ node: 'c11.ex.lampniche' }],
  couplitter: [{ node: 'c11.ex.takht' }],
  coupletwall: [
    { when: { has: ['c11.sher.learned'] }, node: 'c11.ex.couplet.again' },
    { node: 'c11.ex.couplet' },
  ],
  divan: [{ node: 'c11.ex.divan' }],
  takht: [{ node: 'c11.ex.takht' }],
  bookchest: [{ node: 'c11.ex.bookchest' }],
  mangocrate: [{ node: 'c11.ex.mangocrate' }],
  paandaan: [{ node: 'c11.ex.paandaan' }],
  doorShut: [{ map: 'delhi', node: 'c11.ex.door' }],
  farol: [{ map: 'delhi', node: 'c11.ex.farol' }],
  stool: [{ map: 'delhi-rooftop', node: 'c11.ex.stool.roof' }],
  tuft: [{ map: 'delhi', node: 'c11.ex.tuft' }],
  dirt: [{ map: 'delhi', node: 'c11.ex.dirt' }],
  wallInt: [
    { map: 'delhi-langar', node: 'c11.ex.wallint.langar' },
    { map: 'delhi-haveli', node: 'c11.ex.wallint.haveli' },
  ],
  shelf: [{ map: 'delhi-langar', node: 'c11.ex.thalistack' }],
  rug: [{ map: 'delhi-haveli', node: 'c11.ex.rug.haveli' }],
  mat: [
    { map: 'delhi-langar', node: 'c11.ex.doormat' },
    { map: 'delhi-haveli', node: 'c11.ex.mat.haveli' },
  ],
};

/** Event-triggered nodes, listed with their gating so tests can walk them. */
export const DELHI_EVENTS = [
  { node: 'c11.arrive' },
  { when: { has: ['c11.cook.start'] }, node: 'c11.cook.finish' },
  { when: { has: ['c11.kite.start'] }, node: 'c11.kite.flown' },
  { when: { has: ['c11.duel.start'] }, node: 'c11.duel.won' },
];

/** Mail waiting at the red pillar box; variants react to what you did. */
export const DELHI_LETTERS: LetterDef[] = [
  // Pilar: election day on the bridge.
  {
    id: 'delhi.pilar',
    from: 'Pilar, Bridge Authority, ELECTION HEADQUARTERS',
    when: { has: ['c6.row.done'] },
    body: [
      'Dear business partner. It is ELECTION DAY on the bridge. Electorate: nine people and one dog. Current count: four for me, four for my opponent, who is my cousin and wrong.',
      'The ninth voter has gone fishing. Fishing! During history! We have sent the dog to negotiate; the dog is deputy-eligible and motivated by jerky.',
      'I hear you rowed seat forty-one in a boat with one hundred oars. When I win, I am adding a navy to my platform retroactively. You are its admiral. The fee for admiral is one fact about India.',
      'Suspense is expensive. You owe me one day of it, payable in mail. Vote Pilar, wherever voting finds you.',
    ],
  },
  {
    id: 'delhi.pilar',
    from: 'Pilar, Bridge Authority, ELECTION HEADQUARTERS',
    body: [
      'Dear traveler. It is ELECTION DAY on the bridge. Electorate: nine people and one dog. Current count: four for me, four for my opponent, who is my cousin and wrong.',
      'The ninth voter has gone fishing. Fishing! During history! We have sent the dog to negotiate; the dog is deputy-eligible and motivated by jerky.',
      'My platform is unchanged: the toll stays, the museum grows, the facts get audited annually. My opponent promises free crossings, which is anarchy with extra steps.',
      'Suspense is expensive. You owe me one day of it, payable in mail. Vote Pilar, wherever voting finds you.',
    ],
  },
  // Mariamma, one monsoon behind you and one kitchen ahead of everyone.
  {
    id: 'delhi.mariamma',
    from: 'Mariamma, Kaithappuram',
    when: { has: ['c6.sadya.done'] },
    body: [
      'Kunje. The rain here has settled into its long habit and the pot still improves overnight. Joseph sleeps until meals; the correct system continues.',
      'Auntie Leela and Auntie Rosamma still argue about which way you folded your leaf at my sadya. Leela says toward, Rosamma says away, and both claim your fold as their teaching.',
      'They say in Delhi the aunties feed you until you surrender. Good. Surrender. It is the only fight worth losing daily.',
      'Eat properly, cover your head where heads are covered, and write one line. Mothers read between lines; it is our alphabet.',
    ],
  },
  {
    id: 'delhi.mariamma',
    from: 'Mariamma, Kaithappuram',
    body: [
      'Kunje. The rain here has settled into its long habit and the pot still improves overnight. Joseph sleeps until meals; the correct system continues.',
      'The little Japanese umbrella stands by the door where you left the story of it. Visitors ask; I tell it longer each time. That is how umbrellas grow.',
      'They say in Delhi the aunties feed you until you surrender. Good. Surrender. It is the only fight worth losing daily.',
      'Eat properly, cover your head where heads are covered, and write one line. Mothers read between lines; it is our alphabet.',
    ],
  },
];
