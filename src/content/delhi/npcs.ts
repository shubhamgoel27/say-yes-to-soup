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
    pos: [17, 15],
    range: 1,
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
      { when: { has: ['c11.duel.done', 'c11.chit.bombay'], not: ['c11.complete'] }, node: 'c11.kamla.blessing' },
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
    pos: [25, 26],
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
      { node: 'c11.sheru.idle' },
    ],
  },
];

export const DELHI_NODES: NodeMap = {
  // ---------------- arrival ----------------
  'c11.arrive': {
    lines: [
      { text: 'Three days north by rail. Chai vendors at every platform, languages changing station by station, the plains arriving green and flat on day three.' },
      { text: 'Then a walled city swallows the train whole. A rickshaw threads you through lanes that narrow like an argument and open like a laugh.' },
      { text: 'Bells, azan, kirtan, bicycle bells, a kadhai hissing somewhere. The air smells of rain that has not arrived and ghee that has.' },
      { text: 'The rickshaw stops in a chowk under a golden dome. The driver refuses your extra coin twice, takes it the third time, and blesses your journey.' },
    ],
    effects: ['set:c11.arrived'],
  },

  // ---------------- Bantu, the first friend ----------------
  'c11.bantu.first': {
    lines: [
      { who: 'Bantu', text: 'New face! Full backpack, zero idea where to look first. Scene kya hai, what is your scene? Actually wait, do not tell me. Traveler, hungry, lost.' },
      { who: 'Bantu', text: 'I am Bantu. Rickshaw apprentice, which means my uncle owns the rickshaw and I own the knowledge. This kucha is mine; I will lend it to you.' },
      { text: 'His rickshaw is a jugaad miracle: parts from three machines, tinsel from one wedding, and a bell that clearly outranks the brakes.' },
      { who: 'Bantu', text: 'Rule one: tension mat lo. Do not stress. Rule two: everything good here is behind a door that looks closed. It is not closed. Chalo!' },
    ],
    effects: ['set:c11.met.bantu', 'journal:people.bantu', 'journal:words.jugaad'],
  },
  'c11.bantu.bhaiya': {
    lines: [
      { who: 'Bantu', text: 'Watch me work. Oye Rafiq bhaiya, the tire! Meena didi, your cards came! See? Bhaiya, didi. Brother, sister. Everyone, all day.' },
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
      { who: 'Bantu', text: 'AY. You came pre-installed! Chetta, bhaiya, same software, different language. Say it and watch the whole gali soften.' },
      { who: 'Bantu', text: 'But note, I am Bantu bhaiya only until you meet my uncle. Then he is bhaiya and I am oye Bantu. The system has ranks.' },
      { who: 'Bantu', text: 'Now, chalo. Kamla Chachi first. Chachi means auntie, and auntie means you are about to be fed beyond your legal capacity.' },
    ],
    effects: ['set:c11.bhaiya', 'journal:words.bhaiya'],
  },
  'c11.bantu.bhaiya2': {
    lines: [
      { who: 'Bantu', text: 'Because it works! Call a stranger sir and he checks his wallet. Call him bhaiya and he checks if you have eaten. Brother, sister. Free to use.' },
      { who: 'Bantu', text: 'Try it. Bhaiya for men, didi for women, ji on the end for extra polish. You cannot overdose; doctors have checked.' },
      { who: 'Bantu', text: 'Now, chalo. Kamla Chachi first. Chachi means auntie, and auntie means you are about to be fed beyond your legal capacity.' },
    ],
    effects: ['set:c11.bhaiya', 'journal:words.bhaiya'],
  },
  'c11.bantu.nashta': {
    lines: [
      { who: 'Bantu', text: 'Nashta time. Breakfast. Do not argue, the city has already decided.' },
      { text: 'He orders bedmi puri and aloo sabzi for two without asking, then nagori halwa "for balance". The stall opens before seven; it is already a parliament.' },
      { who: 'Bantu', text: 'I said bas paanch minute to my uncle one hour ago. Five minutes. It is not a lie, it is a unit. Abhi means now, and now is flexible.' },
      { text: 'The sabzi is spiced for people with a full day of arguing ahead of them. Around you, the day\'s arguing has begun.' },
    ],
    effects: ['set:c11.nashta', 'journal:dishes.bedmi', 'journal:words.abhi'],
  },
  'c11.bantu.rain': {
    lines: [
      { who: 'Bantu', text: 'FIRST RAIN! Did you see me? I did one full lap of the chowk standing on the pedals. My uncle saw. Worth it.' },
      { who: 'Bantu', text: 'Now everything smells correct and the puddles belong to the kids. City rule. Adults may look, only we may jump.' },
    ],
    effects: ['set:c11.bantu.rained'],
  },
  'c11.bantu.station': {
    lines: [
      { who: 'Bantu', text: 'So. The chit is real, the train is real, Bombay is real. My rickshaw is also real, and it is the fastest way to the station that loves you back.' },
    ],
    choices: [
      { text: 'Ride to the station; the sea road west is waiting', goto: 'c11.depart' },
      { text: 'Not yet; the gali still has my mornings', goto: 'c11.bantu.stay' },
    ],
  },
  'c11.bantu.stay': {
    lines: [
      { who: 'Bantu', text: 'Correct answer also! The train runs daily, the mohalla runs always. Tension mat lo. I will keep the seat dusted.' },
    ],
  },
  'c11.depart': {
    lines: [
      { text: 'Last langar at dawn: dal, quiet, the floor level as ever. Kamla\'s parantha bundle rides on top of your pack, mango pickle wedged like a passport.' },
      { text: 'Bantu weaves through the waking lanes, ringing the bell at friends, which is everyone. At the station he refuses your coin twice and cries once.' },
      { text: 'Rail south through monsoon country. At the Bombay docks, Sethji\'s chit opens a berth like a spoken password; his cousin\'s firm loads for Zanzibar.' },
      { text: 'The ship swings west onto the old dhow road. In your pocket: bottled rain, a clove order, a winter IOU. The monsoon is the road, and the road is open.' },
    ],
    effects: ['set:c11.complete', 'travel:zanzibar'],
  },
  'c11.bantu.idle': {
    lines: [
      { who: 'Bantu', text: 'Aur batao! Tell me more. Where did you go, what did you eat, who fed you extra? These are the three news categories of this kucha.' },
    ],
    effects: ['journal:words.aurbatao'],
  },

  // ---------------- Kamla Chachi, the griddle ----------------
  'c11.kamla.first': {
    lines: [
      { text: 'The tawa corner smells like the reason the lane exists. A woman with forearms of authority looks up, and a plate is moving before you speak.' },
      { who: 'Kamla Chachi', text: 'Haan ji, sit. New face, old hunger; the gali feeds first and asks later. Aloo parantha, and the sides are not optional, they are the constitution.' },
      { text: 'Crisp shell, soft heart, four sides in formation: banana-tamarind chutney, mint chutney, aloo-methi, pickle. The first bite reorders your priorities.' },
      { who: 'Kamla Chachi', text: 'My great-grandfather fried on this spot. Four generations, one tawa, no onion, no garlic, no shortcuts. Now eat; questions digest better afterward.' },
    ],
    effects: ['set:c11.met.kamla', 'journal:people.kamla', 'journal:dishes.parantha', 'journal:words.haanji'],
  },
  'c11.kamla.dance': {
    lines: [
      { text: 'Your plate is somehow full again. You do not remember agreeing to this. Kamla watches you with the calm of a chess player three moves ahead.' },
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
  'c11.kamla.mathi': {
    lines: [
      { who: 'Kamla Chachi', text: 'Mathi! Ha! A licensed refuser. Here the word is pet bhar gaya, my stomach is full, said with the hand flat on the stomach. Show me.' },
      { text: 'You perform it: the phrase, the pat, the face of a person at peace. Kamla nods like an examiner, deeply satisfied.' },
      { who: 'Kamla Chachi', text: 'Perfect form. In Kerala that ends it in three rounds. Here the na means convince me, so: one jalebi. It is already on your plate. Dance finished.' },
    ],
    effects: ['set:c11.dance', 'journal:customs.thodaaur', 'journal:dishes.jalebi'],
  },
  'c11.kamla.dance2': {
    lines: [
      { who: 'Kamla Chachi', text: 'No? Beta, listen. The first no is a greeting, the second no is manners. Say pet bhar gaya, stomach full, with the hand flat on the stomach, so.' },
      { text: 'You perform it: the phrase, the pat, the face of a person at peace. Kamla nods like an examiner, deeply satisfied.' },
      { who: 'Kamla Chachi', text: 'Textbook. And because even a perfect na means convince me: one jalebi. It is already on your plate. Now the dance is finished.' },
    ],
    effects: ['set:c11.dance', 'journal:customs.thodaaur', 'journal:dishes.jalebi'],
  },
  'c11.kamla.cookoffer': {
    lines: [
      { who: 'Kamla Chachi', text: 'You eat with attention. That is half the training. The other half is the pin, the stuffing, and the flip, and my tawa is free at this exact moment.' },
    ],
    choices: [
      { text: 'Step behind the tawa', goto: 'c11.kamla.cookgo' },
      { text: 'Not yet; the lane is still teaching', goto: 'c11.kamla.cooklater' },
    ],
  },
  'c11.kamla.cookgo': {
    lines: [
      { who: 'Kamla Chachi', text: 'Wash the hands, tie the apron, respect the ghee. Aloo first; everyone begins at aloo. The tawa will speak, and you will learn its grammar.' },
    ],
    effects: ['set:c11.cook.start'],
  },
  'c11.kamla.cooklater': {
    lines: [
      { who: 'Kamla Chachi', text: 'The tawa holds no grudges, beta. It has outwaited four generations of cold feet.' },
    ],
  },
  'c11.cook.finish': {
    lines: [
      { text: 'Three paranthas: aloo, mooli, rabri. The last one goes to a porter who has eaten here for thirty years. He takes a bite and stops talking entirely.' },
      { who: 'Kamla Chachi', text: 'You hear that? Nothing. In this gali, silence is the trophy; we melt it down from compliments.' },
      { who: 'Kamla Chachi', text: 'When Sethji asks, and he will ask nothing, tell him Kamla says you can feed people. He knows what my sentences weigh.' },
    ],
    effects: ['clear:c11.cook.start', 'set:c11.cook.done'],
  },
  'c11.kamla.blessing': {
    lines: [
      { text: 'She is packing before you reach the counter: paranthas in paper, mango pickle in a jar with a lid that has survived three owners.' },
      { who: 'Kamla Chachi', text: 'Flew for the kucha in the rain, fed my customers, served at the langar. Beta, you arrived weeks ago; you are only now noticing.' },
      { who: 'Kamla Chachi', text: 'The bundle is for the train, the pickle for the ship, the recipe for wherever you stand next. The gali feeds first. Even when it is you leaving.' },
      { text: 'She holds your face in both hands, exactly the way Mariamma did, one ocean and half a country ago. Neither of them would find that remarkable.' },
    ],
    effects: ['set:c11.complete'],
  },
  'c11.kamla.after': {
    lines: [
      { who: 'Kamla Chachi', text: 'Eat on the train, eat on the ship, and write when you land. One line is enough; mothers and cooks read between lines professionally.' },
    ],
  },
  'c11.kamla.idle': {
    lines: [
      { who: 'Kamla Chachi', text: 'The dough rests, the ghee thinks, the queue grows. Everything in its order, beta, and the order begins with sit down.' },
    ],
  },
  'c11.kamla.cookagain': {
    lines: [
      { who: 'Kamla Chachi', text: 'The queue is the queue and my wrist is sixty-one years old. Your hands know the pin now. Come, stand where you stood.' },
    ],
    choices: [
      { text: 'Tie the apron again', when: { has: ['c11.cook.done'] }, goto: 'c11.kamla.cookReplay' },
      { text: 'Another day; the gali is still teaching', goto: 'c11.kamla.idle' },
    ],
  },
  'c11.kamla.cookReplay': {
    lines: [
      { who: 'Kamla Chachi', text: 'Nothing to prove today. Only the pin, the ghee, and the good noise. Burn one if you like; Sheru has been extremely patient.' },
    ],
    effects: ['set:replay.mode', 'set:c11.cook.start'],
  },

  // ---------------- the langar (scripted, unscored, sacred) ----------------
  'c11.jog.first': {
    lines: [
      { text: 'The hall is one floor and one smell: dal, ghee, woodsmoke. A mountain of a man, floury to the elbows, meets you at the shoe rack.' },
      { who: 'Joginder Singh', text: 'Welcome, welcome. Shoes there, beta. And the head stays covered; take a rumal from the basket, any color, they all fit everyone.' },
      { text: 'You tie one on. He straightens it with two fingers, the way you fix a nephew\'s collar, and waves you toward the striped rows of matting.' },
      { who: 'Joginder Singh', text: 'Everyone sits in pangat, the rows, all on one floor. No high seat, no low seat, no first, no last. Sit; the dal finds you.' },
    ],
    effects: ['set:c11.met.jog', 'journal:people.joginder', 'journal:customs.langar'],
    next: 'c11.jog.meal',
  },
  'c11.jog.meal': {
    lines: [
      { text: 'You sit between a porter and a man whose shoes outside cost more than the porter\'s month. The same ladle serves all three of you.' },
      { who: 'Joginder Singh', text: 'Both hands, beta, cupped, so. Receiving with two hands is the whole theology; the rest is footnotes.' },
      { text: 'Dal, roti, quiet. This place stands where the ninth Guru gave his head for another community\'s right to pray. He says it once, plainly, and ladles on.' },
    ],
    choices: [
      { text: 'Offer money for the meal', goto: 'c11.jog.money' },
      { text: 'Ask how you can possibly repay this', goto: 'c11.jog.hands' },
    ],
  },
  'c11.jog.money': {
    lines: [
      { text: 'You hold out folded notes. Joginder looks at them the way one looks at a child\'s drawing of a horse: with love, and no intention of using it.' },
      { who: 'Joginder Singh', text: 'Not coins, beta. Hands. The langar has no bill because it has no customers; it has only family who arrived hungry.' },
      { who: 'Joginder Singh', text: 'Come Tuesday. Sleeves up, atta ready. You will roll rotis, and we will call the account settled that was never open.' },
    ],
    effects: ['errand:seva-atta', 'set:errand.seva-atta'],
  },
  'c11.jog.hands': {
    lines: [
      { who: 'Joginder Singh', text: 'Ah, the right question, asked in the right order. The answer is seva: service. Anyone may serve here; no skill required, which is the point.' },
      { who: 'Joginder Singh', text: 'Come Tuesday. Sleeves up, atta ready. Knead, roll, wipe, stack. The kitchen will absorb you like it absorbs everything.' },
    ],
    effects: ['errand:seva-atta', 'set:errand.seva-atta'],
  },
  // The page fills while the flour is still on your wrists: the doing is the
  // teaching, and the ayni contrast lives in the journal's stitched margin.
  'c11.jog.seva': {
    lines: [
      { text: 'Tuesday. The kitchen is a weather system: steam, flour, forty wrists. You knead until your arms complain, then roll rotis, badly, then less badly.' },
      { who: 'Joginder Singh', text: 'Round is a direction, not a requirement. The deg does not grade; it feeds.' },
      { text: 'Hours pass in minutes. You wipe the floor where five hundred people sat, and it feels less like cleaning and more like turning a page.' },
    ],
    effects: ['errand.done', 'clear:errand.seva-atta', 'set:c11.seva.done', 'set:c11.seva.langar', 'journal:customs.seva'],
    next: 'c11.jog.soul',
  },
  'c11.jog.soul': {
    lines: [
      { who: 'Joginder Singh', text: 'Tell Sethji the langar says your hands are true; he weighs my sentences too. The rest, your wrists already know.' },
    ],
    next: 'c11.jog.moon',
  },
  // The moonlight etymology now waits in the chowk brick itself, where the
  // name lives. Joginder only points your eye at the place.
  'c11.jog.moon': {
    lines: [
      { who: 'Joginder Singh', text: 'When Bantu tells you Chandni Chowk means silver street, go and ask the bricks of the chowk yourself. Correct him gently; he is sixteen.' },
    ],
    effects: ['set:c11.jog2'],
  },
  'c11.jog.tuesday': {
    lines: [
      { who: 'Joginder Singh', text: 'The rotis you rolled were eaten before they cooled, beta. That is the only review this kitchen publishes.' },
    ],
    effects: ['set:c11.jog2'],
  },
  'c11.jog.idle': {
    lines: [
      { who: 'Joginder Singh', text: 'The deg is on, the floor is level, the door has no lock worth mentioning. Sit whenever the world gets tall; this room stays low on purpose.' },
    ],
  },

  // ---------------- Yusuf Miyan, the rooftop ----------------
  'c11.yusuf.first': {
    lines: [
      { text: 'The stair delivers you into sky. Domes to the east, a red wall northward, wires, tanks, laundry, and a man scattering grain like punctuation.' },
      { who: 'Ustad Yusuf Miyan', text: 'Hm. A ground person. The ground is that way, down the stairs you came up.' },
      { text: 'A pigeon lands on his shoulder and inspects you with one orange eye. Yusuf makes a sound, half whistle, half word, and the bird files its report.' },
      { who: 'Ustad Yusuf Miyan', text: 'You may stand there. Not there. There. The roofs are a country, and you have no papers yet.' },
    ],
    effects: ['set:c11.met.yusuf', 'journal:people.yusuf'],
  },
  'c11.yusuf.names': {
    lines: [
      { text: 'You come back. He pretends not to notice, which on this roof is a visa extension. The flock wheels once and settles.' },
      { who: 'Ustad Yusuf Miyan', text: 'That one is Begum, she runs the coop. Sikandar, vain, watch his landings. Chandni, white one, my father named her line. Say them back.' },
      { text: 'You say them back: Begum, Sikandar, Chandni. Begum ruffles at her name like a minister accepting protocol. Yusuf almost smiles; the wind reports it.' },
      { who: 'Ustad Yusuf Miyan', text: 'Every keeper calls his birds in his own tongue; no two roofs share a language. My ustad taught me mine. I answer to him still, forty years dead.' },
    ],
    effects: ['set:c11.names', 'journal:customs.kabootar'],
  },
  'c11.yusuf.offer': {
    lines: [
      { who: 'Ustad Yusuf Miyan', text: 'You learned the names before asking for the sky. Correct order; most people arrive backwards. So: the patang.' },
      { who: 'Ustad Yusuf Miyan', text: 'My dor is plain cotton. Glass string cuts birds and hands, and the sky has enough blood in it. On this roof we fly sharp minds, not sharp lines.' },
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
      { who: 'Ustad Yusuf Miyan', text: 'The wind writes the sentence; you choose the punctuation. Make your mistakes with my paper: it is cheap, and the wind is free.' },
    ],
    effects: ['set:c11.kite.start'],
  },
  'c11.yusuf.later': {
    lines: [
      { who: 'Ustad Yusuf Miyan', text: 'Good. Half of patangbazi is knowing when not to fly. You have mastered the easier half first.' },
    ],
  },
  'c11.kite.flown': {
    lines: [
      { text: 'The patang climbs like it remembered something urgent up there. A black kite crosses your line; saw on the taut, give on the gust, and then, release.' },
      { text: 'WOH KATA! The cry comes from three roofs you cannot see. The black patang drifts down the wind, free, and some kid two lanes over inherits a kingdom.' },
      { who: 'Ustad Yusuf Miyan', text: 'You pulled through no birds and lost no temper. For a first blood, acceptable. The wind will want to see you again; it is nosy about new hands.' },
    ],
    effects: ['clear:c11.kite.start', 'set:c11.kite.done', 'journal:customs.patang', 'journal:words.wohkata'],
  },
  // He is grading a hand, not telling a story. The roof keeps records the way
  // roofs do: by how badly somebody flew, and how much they enjoyed it.
  'c11.yusuf.her': {
    lines: [
      { text: 'He winds dor back onto the charkhi, thumb over finger, watching the roofs rather than his hands. The flock mutters about the wind.' },
      { who: 'Ustad Yusuf Miyan', text: 'Acceptable hands. Better than the last foreigner who stood on that exact tile. Zoila madam, the rains of seventy-four.' },
      { who: 'Ustad Yusuf Miyan', text: 'Three days up here and she cut nobody. Not one string, and four of her own patangs gone down the wind.' },
      { who: 'Ustad Yusuf Miyan', text: 'Every time the line went light she laughed loud enough that the neighbors came up to see who was winning. It was never her.' },
      { who: 'Ustad Yusuf Miyan', text: 'My ustad was alive then and had no patience for bad hands. He let her back up the stairs on the second day and the third.' },
      { text: 'The charkhi keeps turning. Two lanes over a kite gets away from somebody, and a whole roof shouts about it.' },
    ],
    effects: ['set:c11.her', 'journal:her.delhi'],
  },
  'c11.yusuf.begum': {
    lines: [
      { text: 'You open your jacket. Begum steps out onto Yusuf\'s wrist with the dignity of a queen returning from unjust exile, splint and all.' },
      { who: 'Ustad Yusuf Miyan', text: 'Begum. Begum, Begum. Somebody\'s glass line, and my slow old eyes. Sushila ji splinted this wing?' },
      { text: 'You nod. He is quiet for a while, making small sounds to the bird that are none of your business, and correctly so.' },
      { who: 'Ustad Yusuf Miyan', text: 'Thirty years she has called my kites cruelty, and thirty years she has mended what cruel strings cut. Tell her the argument stands, and the tea too.' },
    ],
    effects: ['errand.done', 'clear:errand.pigeon-home', 'set:c11.pigeon.home'],
  },
  'c11.yusuf.duel': {
    lines: [
      { who: 'Ustad Yusuf Miyan', text: 'The rains have opened and the roofs are restless: tonight the kucha flies its tournament. Three rivals, rising wind, a storm queuing behind the fort.' },
      { who: 'Ustad Yusuf Miyan', text: 'I have called my flock down early; the sky belongs to paper tonight. My hands are old, my dor is ready, and my roof needs a flyer. You.' },
    ],
    choices: [
      { text: 'Fly for the kucha', goto: 'c11.yusuf.duelgo' },
      { text: 'Not yet; steady my hands first', goto: 'c11.yusuf.duellater' },
    ],
  },
  'c11.yusuf.duelgo': {
    lines: [
      { who: 'Ustad Yusuf Miyan', text: 'Birds before glory, always; the rest your hands already know. Go. Make the sky shout.' },
    ],
    effects: ['set:c11.duel.start'],
  },
  'c11.yusuf.duellater': {
    lines: [
      { who: 'Ustad Yusuf Miyan', text: 'The dusk will hold. Come back before the light goes brass to purple; that is the flying hour, and it keeps no waiting room.' },
    ],
  },
  'c11.duel.won': {
    lines: [
      { text: 'Yellow, green, red: three lines sawed free, the sky shouting WOH KATA from fifty roofs. Then the storm arrives like a held note released.' },
      { text: 'Kites come down hand over hand; kulhads come out from under tarps. Nobody leaves. The whole mohalla stands soaked, laughing at the thunder\'s timing.' },
      { who: 'Ustad Yusuf Miyan', text: 'My ustad used to say the roofs are a country. Tonight you voted in its election. Go and be rained on properly; you have earned the weather.' },
    ],
    effects: ['clear:c11.duel.start', 'set:c11.duel.done'],
  },
  'c11.yusuf.after': {
    lines: [
      { who: 'Ustad Yusuf Miyan', text: 'The flock flew a full wheel this morning, storm-washed and showing off. Begum led. Her wing sits true, tell Sushila ji. Tell her the tea also stands.' },
    ],
    effects: ['set:c11.yusuf2'],
  },
  'c11.yusuf.idle': {
    lines: [
      { who: 'Ustad Yusuf Miyan', text: 'Dusk and dawn the flock flies; between, the roof thinks. You may think here too, if you do it quietly.' },
    ],
  },
  'c11.yusuf.flyagain': {
    lines: [
      { who: 'Ustad Yusuf Miyan', text: 'The wind is doing nothing important this evening. Neither, from the look of you, are you. The charkhi is where it always is.' },
    ],
    choices: [
      { text: 'Take the charkhi up again', when: { has: ['c11.kite.done'] }, goto: 'c11.yusuf.kiteReplay' },
      { text: 'Fly the tournament sky once more', when: { has: ['c11.duel.done'] }, goto: 'c11.yusuf.duelReplay' },
      { text: 'Just stand and watch the roofs', goto: 'c11.yusuf.idle' },
    ],
  },
  'c11.yusuf.kiteReplay': {
    lines: [
      { who: 'Ustad Yusuf Miyan', text: 'No tournament, no crowd, nothing riding on it. One kite, one argument, one sky. This is the version I actually like.' },
    ],
    effects: ['set:replay.mode', 'set:c11.kite.start'],
  },
  'c11.yusuf.duelReplay': {
    lines: [
      { who: 'Ustad Yusuf Miyan', text: 'The roofs replay that night constantly, and each telling adds a rival. Fly it again before they add a fourth. Yellow, green, red.' },
    ],
    effects: ['set:replay.mode', 'set:c11.duel.start'],
  },

  // ---------------- Sushila Jain, the bird ward ----------------
  'c11.sushila.first': {
    lines: [
      { text: 'At a folding table, a woman in white splints a pigeon\'s wing with two sticks and total calm. The bird supervises its own surgery, unimpressed.' },
      { who: 'Sushila Jain', text: 'Manjha cut. Glass string. Hold this end, do not squeeze, do not coo at her; she is a patient, not a toy.' },
      { text: 'You hold. She wraps. The pigeon files no complaints. Across the street the temple\'s bird hospital takes the bed cases; she takes the walk-ins.' },
      { who: 'Sushila Jain', text: 'Kites are a beautiful argument for cruelty; I have said so for thirty years. The pigeon men disagree. One at least flies cotton, which is something.' },
    ],
    effects: ['set:c11.met.sushila', 'journal:people.sushila'],
  },
  'c11.sushila.errand': {
    lines: [
      { who: 'Sushila Jain', text: 'You climb to that roof, yes? Good, be useful. This is Begum, the old man\'s head pigeon; her wing is set and her patience with me is finished.' },
      { text: 'She tucks the bird into your jacket with startling gentleness, then reassembles her sternness like a folding chair.' },
      { who: 'Sushila Jain', text: 'Straight up the stairs, no detours, no chai. And tell Yusuf the splint stays one more week, whatever the bird tells him.' },
    ],
    effects: ['errand:pigeon-home', 'set:errand.pigeon-home'],
  },
  'c11.sushila.argue': {
    lines: [
      { who: 'Sushila Jain', text: 'He said the argument stands and so does the tea. Hm. Thirty years and the man has finally produced one accurate sentence.' },
      { who: 'Sushila Jain', text: 'Write this down somewhere: you can disagree with someone every single day and still keep their tea warm. It is the mohalla\'s one weird trick.' },
    ],
    effects: ['set:c11.sushila2'],
  },
  'c11.sushila.idle': {
    lines: [
      { who: 'Sushila Jain', text: 'Cotton for wounds, cotton for kites. If everyone chose string the way they choose bandages, my table would be a chai stall.' },
    ],
  },

  // ---------------- Akhtar Bhai, the chai corner ----------------
  'c11.akhtar.first': {
    lines: [
      { text: 'The chai corner at the gali mouth: brass kettle, coal glow, kulhads stacked like a clay minaret. The man behind it is already pouring yours.' },
      { who: 'Akhtar Bhai', text: 'Kulhad chai, first one on the house, because the house makes the rules. Drink. The cup is clay from a riverbank, and the riverbank sends its regards.' },
      { text: 'The chai tastes of cardamom and rain-on-earth. When it is done, he gestures: you dash the kulhad on the stones, and it shatters with a musical clink.' },
      { who: 'Akhtar Bhai', text: 'One cup, one life, no washing up, and the lane gets a little more percussion. Now sit. Aur batao: tell me more. Everything. We have time; time has us.' },
    ],
    effects: ['set:c11.met.akhtar', 'journal:people.akhtar', 'journal:dishes.kulhadchai', 'journal:words.aurbatao'],
  },
  'c11.akhtar.menu': {
    lines: [
      { who: 'Akhtar Bhai', text: 'Aaiye, aaiye. Chai is default, sherbet is philosophy, and the khomcha there is empty, which is its own story. What will you have?' },
    ],
    choices: [
      { text: 'Ask about daulat ki chaat; Nani\'s journal mentions a moonlight dish', goto: 'c11.akhtar.daulat' },
      { text: 'Ask about the pink bottle behind the kettle', goto: 'c11.akhtar.rooh' },
      { text: 'Just chai, and the lane\'s news with it', goto: 'c11.akhtar.news' },
    ],
  },
  'c11.akhtar.daulat': {
    lines: [
      { who: 'Akhtar Bhai', text: 'Daulat ki chaat! In SAWAN? The moon is behind clouds, beta. Churned on cold nights, set by dew; the foam cannot hold. Come when your breath shows.' },
      { text: 'He slides over rabri instead, thick and sweet, an apology that outranks most gifts. Then he goes still, looking at your journal on the counter.' },
      { who: 'Akhtar Bhai', text: 'A girl with a journal like that asked my father the same, monsoon of 1974. He wrote her an IOU for December in the old tin. She never came to collect.' },
      { text: 'He taps the tin, twice, like a man knocking on a door he keeps for someone. Two generations, one IOU, held by a sweet. He writes yours under hers.' },
    ],
    effects: ['set:c11.promise.daulat', 'journal:dishes.daulat'],
  },
  'c11.akhtar.rooh': {
    lines: [
      { who: 'Akhtar Bhai', text: 'Rooh Afza! Rose and herbs, invented three lanes over in 1907. Pink as a wedding, cold as mercy. In milk for the devout, in ice water for the sweaty.' },
      { text: 'He pours a glass so pink it embarrasses the sunset. The first sip lowers the temperature of the entire afternoon by a felt ten degrees.' },
      { who: 'Akhtar Bhai', text: 'I call it the mohalla\'s blood type. Universal donor. Now, aur batao, what else does that journal of yours not know yet?' },
    ],
    effects: ['journal:dishes.roohafza'],
  },
  'c11.akhtar.news': {
    lines: [
      { who: 'Akhtar Bhai', text: 'News! The sky is loading a headline, the twins painted their kite green, and Sethji ignored a Bombay buyer so hard the man apologized for existing.' },
      { who: 'Akhtar Bhai', text: 'Also the monkeys moved their commute twenty minutes earlier, which the wire committee calls an infrastructure crisis. Chai?' },
    ],
  },
  'c11.akhtar.sher': {
    lines: [
      { text: 'You try the haveli wall\'s couplet: hazaaron khwahishen aisi, ki har khwahish pe dam nikle. A thousand desires, each worth a life.' },
      { who: 'Akhtar Bhai', text: 'WAH! Wah wah wah. Half the meter fell in a puddle but the heart arrived dry. Sher for chai, that is the standing offer; friend price, forever.' },
      { text: 'He pours with extra height, which is how kettles applaud. Two porters say wah as well, on principle. Poetry has a wholesale rate here.' },
      { who: 'Akhtar Bhai', text: 'Ghalib lived three lanes over and still owes half this city money. We forgave him in exchange for the couplets. Best trade Dilli ever made.' },
    ],
    effects: ['set:c11.sherchai', 'journal:customs.sher'],
  },
  'c11.akhtar.storm': {
    lines: [
      { who: 'Akhtar Bhai', text: 'Positions, positions! The sky has been building its opening line since lunch. Look at that cloud, black as a good kadhai. Any minute. ANY minute.' },
      { text: 'He narrates the sky like a cricket final: wind up, pigeons gone strategic, an umbrella seller appearing from nowhere, smelling profit.' },
    ],
    next: 'c11.rain.arrives',
  },
  'c11.rain.arrives': {
    lines: [
      { text: 'The first drop hits the tarpaulin like a drumbeat. Then the sky opens its accounts. In twenty minutes the lane is ankle-deep and delighted.' },
      { text: 'Kids commandeer the puddles. Somebody starts frying pakoras, because rain without pakoras is a wasted rain. The whole gali stands out in it, faces up.' },
    ],
    effects: ['set:c11.rain'],
    choices: [
      {
        text: '"I know this smell. It walked me up from Kerala; the same rain, gone north."',
        goto: 'c11.akhtar.ksmell',
        when: { has: ['c6.rain'] },
      },
      { text: 'Ask what the smell of it is', goto: 'c11.akhtar.mitti' },
    ],
  },
  'c11.akhtar.ksmell': {
    lines: [
      { who: 'Akhtar Bhai', text: 'Sunte ho? Listen to this one! Stood in the first rain on the Malabar coast, then RACED it here. Beat the monsoon north by days. Seniority, beta.' },
      { who: 'Akhtar Bhai', text: 'The smell is mitti, wet earth. Same perfume, two coasts. You have now heard one weather system greet two worlds; most people never even hear it knock.' },
    ],
  },
  'c11.akhtar.mitti': {
    lines: [
      { who: 'Akhtar Bhai', text: 'That, beta, is mitti. Wet earth. The first rain unlocks it from the stones like a debt repaid; every kulhad you drank from was practicing the smell.' },
      { who: 'Akhtar Bhai', text: 'There is a woman in the silver lane who sells exactly this in a bottle. Go and ask her about it once you have dried off. Or better, before.' },
    ],
  },
  'c11.akhtar.rainchai': {
    lines: [
      { who: 'Akhtar Bhai', text: 'Rain-watching chai is a separate product line: same kettle, better theater. Sit under the tarp; the lane will perform.' },
      { text: 'Thunder lands a beat late and Akhtar shakes his head like an umpire. The lane laughs. The kettle, on its coals, keeps the score.' },
    ],
    effects: ['set:c11.rainchai'],
  },
  'c11.akhtar.idle': {
    lines: [
      { who: 'Akhtar Bhai', text: 'The kettle is on, the sky is rehearsing, and the khomcha keeps its winter secret. Sit, drink, break the cup. The lane provides the rest.' },
    ],
  },

  // ---------------- Mehr Aapa, the attar lane ----------------
  'c11.mehr.first': {
    lines: [
      { text: 'A cabinet of amber bottles, each a small sun. The woman behind it watches you look, which is apparently the first transaction.' },
      { who: 'Mehr Aapa', text: 'No, you may not smell all of them. The nose is a small room; crowd it and nothing fits. One. Choose with your eyes first.' },
      { text: 'You point at a dark vial, second shelf. She raises an eyebrow one millimeter, which here is a standing ovation.' },
      { who: 'Mehr Aapa', text: 'Mitti attar. Baked earth from Kannauj, distilled into sandalwood. First rain, in a bottle. It is not for sale; it is for deserving.' },
    ],
    effects: ['set:c11.met.mehr'],
  },
  'c11.mehr.gift': {
    lines: [
      { who: 'Mehr Aapa', text: 'You want the mitti? Then earn it with your mouth, not your money. Describe a first rain. A real one, one you stood in. I will know the difference.' },
    ],
    choices: [
      {
        text: 'Describe Kerala\'s first rain: coins on tin, then tile, then the sky opening',
        goto: 'c11.mehr.kerala',
        when: { has: ['c6.rain'] },
      },
      { text: 'Admit you have not yet stood inside a proper first rain', goto: 'c11.mehr.wait' },
    ],
  },
  'c11.mehr.kerala': {
    lines: [
      { text: 'You give her the backwater monsoon: first drops like coins on tin, tiles answering deeper, kids running OUT of cover, the channel fizzing like soda.' },
      { who: 'Mehr Aapa', text: 'The tin before the tile. Yes. Only someone who stood in it knows the tin sings first. Hold out your hand.' },
      { text: 'A vial, small as a fingertip, warm from the shelf. One drop on your wrist and the whole first rain happens again, privately, in your nose.' },
      { who: 'Mehr Aapa', text: 'Delhi bottles its monsoon; now you carry ours beside yours. Open it once on the next coast and you are standing here. That is the entire technology.' },
    ],
    effects: ['set:c11.attar.mitti', 'journal:customs.mitti', 'journal:people.mehr'],
  },
  'c11.mehr.wait': {
    lines: [
      { who: 'Mehr Aapa', text: 'Honest, at least. Then wait; you are in luck\'s own city. Sawan is loading over the fort, and when it breaks, stand in it. Do not shelter. Attend.' },
      { who: 'Mehr Aapa', text: 'Come back wet, and describe what the stones give up. The bottle will still be here; deserving keeps.' },
    ],
    effects: ['set:c11.mehr.asked'],
  },
  'c11.mehr.rain2': {
    lines: [
      { text: 'You come back still damp and describe it: the first drop\'s drumbeat, the stones exhaling, the smell rising unlocked, kids claiming the puddles.' },
      { who: 'Mehr Aapa', text: 'The stones exhaling. Good. That smell is mitti; the earth keeps it in trust between rains and pays it out on the first drop. Hold out your hand.' },
      { text: 'A vial, small as a fingertip, warm from the shelf. One drop on your wrist and the rain happens again, privately, in your nose.' },
      { who: 'Mehr Aapa', text: 'Delhi bottles its monsoon; now you carry it. Wherever you land next, open it once and you will be standing here. That is the entire technology.' },
    ],
    effects: ['set:c11.attar.mitti', 'journal:customs.mitti', 'journal:people.mehr'],
  },
  'c11.mehr.waiting': {
    lines: [
      { who: 'Mehr Aapa', text: 'Still dry? The sky is composing, beta; sawan never misses its own opening night. When it breaks, stand in it, then come and tell me properly.' },
    ],
  },
  'c11.mehr.nani': {
    lines: [
      { who: 'Mehr Aapa', text: 'That journal. Sit. My mother kept this shop before me, and her ledgers keep everything, including one Peruvian girl, monsoon of 1974.' },
      { text: 'She turns cloth-bound pages: rose oil for a wedding, oud for a judge, and there: mitti attar, one tola, the girl with the journal. Paid with a story.' },
      { who: 'Mehr Aapa', text: 'Mother said she described a mountain rain so well the shop went quiet. Yours is the second vial we have given your family. Aapa keeps accounts.' },
    ],
    effects: ['set:c11.mehr.nani2'],
  },
  'c11.mehr.idle': {
    lines: [
      { who: 'Mehr Aapa', text: 'Perfume is memory with a stopper, beta. Choose slowly. The bottles are patient and so, professionally, am I.' },
    ],
  },

  // ---------------- Sethji, the barrier with a ledger ----------------
  'c11.sethji.cold': {
    lines: [
      { text: 'The spice end swallows the lane: sack mountains, chilli haze, porters with impossible loads. At its center, a man on a white-sheeted gaddi, writing.' },
      { text: 'You greet him. He does not look up. A porter sneezes three times, operatically; Sethji blesses him without breaking his line. You do not exist yet.' },
    ],
    effects: ['set:c11.met.sethji'],
  },
  'c11.sethji.cold2': {
    lines: [
      { text: 'Sethji weighs, writes, and ignores you with the ease of a man who has ignored viceroys. The scale clicks. The ledger fills. You remain scenery.' },
    ],
  },
  'c11.sethji.test': {
    lines: [
      { text: 'You say three names: Kamla, Joginder, Yusuf. The pen stops. For the first time in recorded history, Sethji Onkar Nath looks up.' },
      { who: 'Sethji Onkar Nath', text: 'The tawa says you feed, the langar says you serve, the roof says you read wind. Three sentences from three people who do not spend them. Hm.' },
      { text: 'He takes a pinch from an open sack and holds it out without a word: small green pods, sharp and sweet on the air. The market noise seems to lean in.' },
      { who: 'Sethji Onkar Nath', text: 'In this market nothing moves without a chit, and no chit was ever written for a stranger. So. Tell me what my hand holds, and where it grew up.' },
    ],
    choices: [
      {
        text: '"Small cardamom. Green, from the wet hills above the backwaters; it rode a jetty I stood on."',
        goto: 'c11.sethji.cardamom',
        when: { has: ['c6.complete'] },
      },
      { text: 'Admit your nose is untrained, and ask him to teach it', goto: 'c11.sethji.lesson' },
    ],
  },
  'c11.sethji.cardamom': {
    lines: [
      { who: 'Sethji Onkar Nath', text: 'The COAST. The firangi child names the coast. Nine generations on this gaddi, and I count on one hand the strangers who knew small elaichi from big.' },
      { text: 'He laughs, which rearranges the entire spice end; two porters nearly drop a sack from the novelty of it.' },
      { who: 'Sethji Onkar Nath', text: 'You stood on the jetty it left from? Then you and this pod are old shipmates. Sit. SIT. The market makes time for a nose with a memory.' },
    ],
    next: 'c11.sethji.chit',
  },
  'c11.sethji.lesson': {
    lines: [
      { who: 'Sethji Onkar Nath', text: 'Untrained and says so. Better than trained and wrong. Attend: small elaichi, green, from the wet southern hills. It smells like rain turning sweet.' },
      { text: 'He holds up a bigger pod, brown and smoky. Badi elaichi, from the eastern hills, all smoke and shoulder. You smell them in turn until it clicks.' },
      { who: 'Sethji Onkar Nath', text: 'Again. Eyes closed. Small. Big. Small. Good; the nose files fast once it opens an account. This market has trained worse students, all relatives.' },
    ],
    next: 'c11.sethji.chit',
  },
  'c11.sethji.chit': {
    lines: [
      { text: 'He pulls a pad of thin paper, writes six lines in a flowing hand, stamps it with a brass seal older than several countries, and folds it once.' },
      { who: 'Sethji Onkar Nath', text: 'To my cousin\'s firm, Bombay docks. They have loaded for Zanzibar since my grandfather sat here. Show this and a berth finds you; the chit is the road.' },
      { text: 'Then a cloth bag lands on top: cloves, tied with red thread. No traveler leaves his market empty-handed; carrying his cargo makes you his caravan.' },
      { who: 'Sethji Onkar Nath', text: 'Deliver the cloves with the chit. Trade likes a courier with clean hands and a trained nose. Now go; the ledger missed you the moment I looked up.' },
    ],
    effects: ['set:c11.chit.bombay', 'journal:people.sethji'],
  },
  'c11.sethji.after': {
    lines: [
      { who: 'Sethji Onkar Nath', text: 'The chit stays folded until Bombay, the cloves stay dry, and my regards stay unofficial. The road west is old and knows its own way. Match its pace.' },
    ],
  },

  // ---------------- Divakaran Master, over the mountains of books ----------------
  'c11.master.first': {
    lines: [
      { text: 'By the book bundles, a familiar figure weighs a dictionary in both hands like a fish he suspects of lying about its weight. White hair. Kerala cotton.' },
      { who: 'Divakaran Master', text: 'The letter-carrier! Ha! Of all the lanes in Hindustan. Sukhamano, are you well? Do not look amazed; readers migrate along the same rails as everyone.' },
      { who: 'Divakaran Master', text: 'Once a year I ride north and buy the grandhasala a sack of books by weight. Poetry is heavy, politics is cheap, and both facts please me enormously.' },
    ],
    effects: ['set:c11.met.master'],
  },
  'c11.master.quiz': {
    lines: [
      { who: 'Divakaran Master', text: 'Now. You left my village before I could set an examination, and a master never wastes a second chance. One question, and you may choose the question.' },
    ],
    effects: ['set:c11.master.quizzed'],
    choices: [
      {
        text: '"Head like a boat means yes. Head still, then you worry."',
        goto: 'c11.master.wobble',
        when: { has: ['page.customs.headwobble'] },
      },
      {
        text: '"I held seat forty-one in a chundan vallam. The song does the steering."',
        goto: 'c11.master.row',
        when: { has: ['c6.row.done'] },
      },
      { text: '"I respectfully fail. Teach me the model answer."', goto: 'c11.master.fail' },
    ],
  },
  'c11.master.wobble': {
    lines: [
      { who: 'Divakaran Master', text: 'Full marks! The wobble travels badly on paper and perfectly in person. Here they tilt the head too, you noticed? Same boat, different water.' },
      { who: 'Divakaran Master', text: 'Appu will be insufferable when I report a foreign student passed on his syllabus. I will tell him immediately, of course. Adipoli.' },
    ],
  },
  'c11.master.row': {
    lines: [
      { who: 'Divakaran Master', text: 'Seat forty-one! I watched from the bank with two newspapers and one umbrella. A hundred oars on one word: no shelf holds a better argument for rhythm.' },
      { who: 'Divakaran Master', text: 'Varkey still tells people a traveler rowed on the beat. He says it like HE taught you. Let him; captains need their fictions.' },
    ],
  },
  'c11.master.fail': {
    lines: [
      { who: 'Divakaran Master', text: 'An honest fail earns the full lesson. Model answer one: the head wobble. Side to side like a boat means yes; a still head is the one to worry about.' },
      { who: 'Divakaran Master', text: 'Model answer two: the snake boat. A hundred rowers, one song, oars striking on the word. Miss the beat and you row alone; nobody rows alone for long.' },
      { who: 'Divakaran Master', text: 'There. Educated retroactively. The reading room stamps its books the same way, always a little after they are borrowed.' },
    ],
  },
  'c11.master.idle': {
    lines: [
      { who: 'Divakaran Master', text: 'Delhi sells books by the kilo and poems by the couplet, and calls both a bargain. Correctly, in my assessment. The fan at home wants a full report.' },
    ],
  },

  // ---------------- Chasca, at the storm's shutter ----------------
  'c11.chasca.photo': {
    lines: [
      { text: 'She is on the parapet, soaked to the collarbones, camera dry under a plastic bag with a lens hole. Of course she is here. She is always exactly here.' },
      { who: 'Chasca', text: 'The soup-eater, RAINING. Perfect, do not dry off. Stand with the domes behind you and the last kites coming down; the album has waited for this sky.' },
      { text: 'Lightning obliges over the fort. Pigeons wheel one last silver loop between the raindrops. Her shutter clicks exactly once.' },
      { who: 'Chasca', text: 'A monsoon jetty, and now a monsoon roof. You keep standing where the weather signs its name. Say fuzzy pickles; you already did. I have it.' },
    ],
    effects: ['set:c11.met.chasca11', 'set:photo.flash', 'set:photo.c11.kites'],
  },
  'c11.chasca.album': {
    lines: [
      { who: 'Chasca', text: 'One frame, whole sky, no reshoots. The album grows by exactly one truth per country; this one is loud and wet and full of paper birds.' },
      { who: 'Chasca', text: 'Where the album ends, it develops. Whose end? The journey is still deciding. I only press the button at the right seconds.' },
    ],
  },

  // ---------------- Sheru, the gali dog ----------------
  'c11.sheru.first': {
    lines: [
      { text: 'A brown dog with one standing ear and a clear conscience trots over, inspects your shoes, and finds them acceptable. His tail signs the paperwork.' },
      { text: 'A card seller says his name is Sheru. The chai corner says Sheru. Kamla says Sheru but he answers her fastest, for professional reasons.' },
    ],
    effects: ['set:c11.met.sheru'],
  },
  'c11.sheru.rain': {
    lines: [
      { text: 'Sheru has relocated under the widest tarpaulin, dead center, dry as a minister. Monsoon veterans recognize each other; he blinks at you slowly.' },
    ],
    effects: ['set:c11.sheru2'],
  },
  'c11.sheru.idle': {
    lines: [
      { text: 'Sheru patrols the gali on a schedule known only to him and honored by everyone. A parantha edge finds him; statistically, one always does.' },
    ],
  },

  // ---------------- the post box ----------------
  'c11.post.pilar': {
    lines: [
      { text: 'The red pillar box has stood here since an empire mistook itself for permanent. A postman fishes out mail held for travelers, ledgered under a stone.' },
      { text: 'One envelope wears stamps like campaign medals and handwriting you would recognize in the dark: an invoice that learned calligraphy.' },
    ],
    effects: ['letter:delhi.pilar'],
  },
  'c11.post.mariamma': {
    lines: [
      { text: 'The postman checks the ledger twice and produces a second envelope, soft at the corners, postmarked with a green coast, smelling faintly of a kitchen.' },
    ],
    effects: ['letter:delhi.mariamma'],
  },
  'c11.post.idle': {
    lines: [
      { text: 'The post box swallows letters for Bombay, Muscat, Lima, and one backwater village. Collection twice daily, monsoon permitting; it usually permits.' },
    ],
  },

  // ---------------- examines: new kinds, exterior ----------------
  'c11.ex.galistone': {
    lines: [
      { text: 'Stone flags worn soft by four centuries of feet, patched with whatever the last repair had in the cart. The lane keeps its history underfoot.' },
    ],
  },
  'c11.ex.chowkbrick': {
    lines: [
      { text: 'The chowk\'s redone brick, herringbone and proud. By day it belongs to feet, handcarts, and rickshaws; the cars wait outside like scolded dogs.' },
    ],
  },
  // The sevadar sent you here; the square answers for its own name.
  'c11.ex.chowkbrick.moon': {
    lines: [
      { text: 'Down the chowk\'s spine the brick dips in one long shallow line: an old channel, paved over. A canal ran here once, and the moon rode it all night.' },
      { text: 'Chandni Chowk, the moonlight square. The silver shops came later and took the credit; the bricks under your feet never signed the paperwork.' },
    ],
    effects: ['journal:customs.chandni'],
  },
  'c11.ex.wornedge': {
    lines: [
      { text: 'Where brick meets dirt, a strip of neither: ground down by wheels, feet, and hooves into the city\'s own alloy. No mason made this. Everyone did.' },
    ],
  },
  'c11.ex.mohallawall': {
    lines: [
      { text: 'Plaster over brick over older brick: a civic geology. A film poster, an ad ghost, and a monsoon streak share the wall without friction.' },
    ],
  },
  'c11.ex.haveli': {
    lines: [
      { text: 'A haveli holding three centuries in one facade: carved jharokha above, aluminum shopfront below, wires riding past every window like ivy with a job.' },
    ],
  },
  'c11.ex.gurdwara': {
    lines: [
      { text: 'Sis Ganj Sahib. The ninth Guru gave his head here for another faith\'s freedom to pray; the kitchen behind this door has never closed its heart since.' },
    ],
  },
  'c11.ex.stairup': {
    lines: [
      { text: 'Whitewashed stairs worn shiny up the middle, climbing to the rooftop country. The best commute in the mohalla: twelve steps, one sky.' },
    ],
  },
  'c11.ex.griddle': {
    lines: [
      { text: 'Kamla\'s iron tawa over coals, black with forty years of virtue. The ghee tin beside it is dented into loyalty; the queue forms by reflex.' },
    ],
  },
  'c11.ex.griddle.after': {
    lines: [
      { text: 'The tawa that taught your hands. It sings low when the ghee is ready; you can hear the grammar now, which makes the whole lane read differently.' },
    ],
  },
  'c11.ex.jalebi': {
    lines: [
      { text: 'Bade Mian\'s kadhai, since 1902: batter coiling into ghee, syrup waiting like a patient bank. No menu, one product, zero doubt.' },
      { text: 'A jalebi lands in your hand, too hot to hold. You hold it. Around here that counts as both dessert and a handshake.' },
    ],
    effects: ['journal:dishes.jalebi'],
  },
  'c11.ex.chaikhana': {
    lines: [
      { text: 'Akhtar\'s corner: brass kettle, coal glow, kulhads in a clay minaret. The bench has heard forty years of news and improved most of it.' },
    ],
  },
  'c11.ex.kulhadtower': {
    lines: [
      { text: 'Unglazed clay cups stacked to a height only confidence explains. Each will hold one chai, add its riverbank to the flavor, and die a musical death.' },
    ],
  },
  'c11.ex.khomcha': {
    lines: [
      { text: 'A wicker khomcha, folded muslin, no wares. Daulat ki chaat is winter\'s: moonlight, dew, cold nights. Sawan gets the empty basket.' },
    ],
  },
  'c11.ex.khomcha.promise': {
    lines: [
      { text: 'The empty khomcha, waiting for December like everyone who heard the stories. In Akhtar\'s tin, two IOUs share a page: Nani\'s, and now yours.' },
    ],
  },
  'c11.ex.sackpyramid': {
    lines: [
      { text: 'A jute mountain range stenciled with districts. Cardamom, coriander, dried ginger: a subcontinent\'s pantry, stacked by porters who make it look easy.' },
      { text: 'You lean closer and the chilli dust files its objection. You sneeze twice, operatically. Somewhere a porter says bless you in three languages.' },
    ],
    effects: ['set:c11.sneezed'],
  },
  'c11.ex.sackpyramid.again': {
    lines: [
      { text: 'You breathe shallow this time, like the porters do. The sacks respect the adjustment. The sneeze waits, patient; it knows you will forget again.' },
    ],
  },
  'c11.ex.chilisacks': {
    lines: [
      { text: 'Open sacks of whole and ground chilli, red as a warning nobody heeds. The corridor sneezes on schedule and calls it seasoning.' },
    ],
  },
  'c11.ex.sethgaddi': {
    lines: [
      { text: 'The gaddi: white sheet, bolster, brass scale, and a ledger whose entries reach Bombay without standing up. Ninth generation on this exact cushion.' },
    ],
  },
  'c11.ex.sethgaddi.chit': {
    lines: [
      { text: 'The gaddi from which your road west was written in six lines and one brass stamp. The ledger has already moved on; ledgers always do.' },
    ],
  },
  'c11.ex.attarcase': {
    lines: [
      { text: 'Amber bottles in rows, each one a bottled weather: rose, oud, khus, and on the second shelf, the monsoon itself, waiting for a deserving nose.' },
    ],
  },
  'c11.ex.cardstall': {
    lines: [
      { text: 'Wedding cards fanned in red and gold: futures, printed in three scripts. The sample album is fat with other people\'s happiness and open for browsing.' },
    ],
  },
  'c11.ex.bookbundle': {
    lines: [
      { text: 'Books tied in jute, sold by weight, argued by title. Poetry is heavy and politics is cheap; the scale has no opinion and the buyers have several.' },
    ],
  },
  'c11.ex.signstack': {
    lines: [
      { text: 'Signboards stacked three deep in three scripts: Devanagari, Nastaliq, Latin. Half are hand-painted, and every letter is slightly proud of itself.' },
    ],
  },
  'c11.ex.wirebundle': {
    lines: [
      { text: 'A pole carrying every current the mohalla ever subscribed to, sagging like a python that ate the twentieth century. The monkeys call it a highway.' },
    ],
  },
  'c11.ex.rickshaw': {
    lines: [
      { text: 'A cycle-rickshaw in full regalia: painted flowers, tinsel, a bell that outranks the brakes. Parts from three machines and a prayer. Jugaad, licensed.' },
    ],
  },
  'c11.ex.thela': {
    lines: [
      { text: 'A thela of langra mangoes, straw-bedded, priced by conviction. The vendor names a figure with theatrical sorrow. You walk away; the dance requires it.' },
      { text: 'Arre suniye toh! He calls you back like a lost nephew, drops the price, adds one free for your health. The walk-away is a step; the call-back, a hug.' },
    ],
    effects: ['journal:customs.bargain'],
  },
  'c11.ex.thela.again': {
    lines: [
      { text: 'The mango vendor greets you as an old sparring partner. The first price is higher now, out of respect. Flattery, in this lane, is arithmetic.' },
    ],
  },
  'c11.ex.monkeywire': {
    lines: [
      { text: 'The monkey commute: along the wire, pause, judge the humans, proceed. The mohalla and the monkeys keep a treaty; the mangoes are the border dispute.' },
    ],
  },
  'c11.ex.peepal': {
    lines: [
      { text: 'The chowk\'s peepal, older than the pavement and most opinions. A diya burns in the niche; the thread round the trunk holds a hundred quiet asks.' },
    ],
  },
  'c11.ex.handpump': {
    lines: [
      { text: 'Cast iron, public, undefeated. The handle takes your whole weight and returns cold water from somewhere honest. Porters, pigeons, kids: one queue.' },
    ],
  },
  'c11.ex.gullywall': {
    lines: [
      { text: 'Three chalked stumps, forty years of scuffs: the maidan\'s wicket wall. The LBW appeal beside it has been under review since before you were born.' },
    ],
  },
  'c11.ex.birdward': {
    lines: [
      { text: 'A folding table of cotton, splints, small scissors: the bird ward. The temple across the street runs a whole bird hospital; this is its field desk.' },
    ],
  },
  'c11.ex.nishansahib': {
    lines: [
      { text: 'The nishan sahib, saffron over the whole square, visible from every roof. It marks the door that never closes and the kitchen that never asks.' },
    ],
  },
  'c11.ex.garlandline': {
    lines: [
      { text: 'Marigold garlands strung shoulder-high, sold by the arm\'s length. Weddings, temples, taxi dashboards: one orange blesses all three without prejudice.' },
    ],
  },
  'c11.ex.marigoldheap': {
    lines: [
      { text: 'Loose marigolds, the garland trade\'s spare change. By evening they will be on a doorstep, a shrine, or a puddle, and correct in all three places.' },
    ],
  },
  'c11.ex.spicespill': {
    lines: [
      { text: 'Turmeric and chilli dust tracked down the lane: an accidental map of the day\'s deliveries. The pigeons inspect it and file it under not food.' },
    ],
  },
  'c11.ex.kulhadshards': {
    lines: [
      { text: 'Spent kulhads, shattered musically, as intended. One cup, one chai, one small percussion solo. The lane\'s gutters glitter with clay applause.' },
    ],
  },
  'c11.ex.pigeonpeck': {
    lines: [
      { text: 'Pigeons at their ground shift, auditing spilled grain. At dusk they clock out, rise in one silver sheet, and become somebody\'s flying signature.' },
    ],
  },
  'c11.ex.puddle': {
    lines: [
      { text: 'A monsoon puddle holding the wire bundles and one cut kite, upside down. By city law it belongs to the kids; adults may only look.' },
    ],
  },
  'c11.ex.charpai': {
    lines: [
      { text: 'A charpai, rope-woven and sun-bleached, sagging with testimony. Load rating: two gossips, or one philosopher lying down.' },
    ],
  },
  'c11.ex.chalkpitch': {
    lines: [
      { text: 'The chalked crease of the maidan\'s test arena. It is redrawn after every rain and every argument, which arrive on roughly the same schedule.' },
    ],
  },

  // ---------------- examines: rooftop ----------------
  'c11.ex.kabootarkhana': {
    lines: [
      { text: 'The kabootar khana: whitewashed compartments, wire fronts, named tenants. Begum runs the coop; Yusuf merely pays the grain bill and takes the blame.' },
    ],
  },
  'c11.ex.kitestack': {
    lines: [
      { text: 'Patangs leaning in a paper rainbow: fighters, all of them, tissue and bamboo. Each costs less than a chai and carries more ambition than most careers.' },
    ],
  },
  'c11.ex.charkhi': {
    lines: [
      { text: 'The charkhi, wound fat with plain cotton dor. No glass on this roof: the ustad says the sky has enough blood in it, and his spool votes with him.' },
    ],
  },
  'c11.ex.watertank': {
    lines: [
      { text: 'A black water tank on stilts, the roof\'s civil servant. One pigeon stands on the lid at all times; the post appears to be hereditary.' },
    ],
  },
  'c11.ex.dhobiline': {
    lines: [
      { text: 'The dhobi line flies the mohalla\'s flags: kurtas, dupattas, one defecting bedsheet. In this wind, laundry is the roof\'s weather report.' },
    ],
  },
  'c11.ex.antennajugaad': {
    lines: [
      { text: 'A TV antenna guyed with kite string, aimed at a transmitter it believes in. Jugaad, aerial division: the picture snows only during cricket. Fate.' },
    ],
  },
  'c11.ex.fortwall': {
    lines: [
      { text: 'The Red Fort\'s long wall holds the northern horizon down, red as a held breath. Thunderheads stack behind it in sawan like an audience arriving early.' },
    ],
  },
  'c11.ex.jamadomes': {
    lines: [
      { text: 'Jama Masjid\'s domes ride the rooftop sea, white marble weather. At dusk they go rose-colored, and every pigeon in the walled city takes it personally.' },
    ],
  },
  'c11.ex.parapet': {
    lines: [
      { text: 'The parapet: brick lace at knee height, the correct place for elbows and evenings. The whole mohalla is down there, being audible.' },
    ],
  },
  'c11.ex.pigeonflock': {
    lines: [
      { text: 'The whole flock down at once on the swept lime, a grey carpet with opinions. Walk into it and it becomes weather for four seconds, then floor again.' },
      { text: 'Yusuf knows perhaps forty of them by name. He will tell you all forty if you stand still, and you will stand still.' },
    ],
  },
  'c11.ex.jaalipanel': {
    lines: [
      { text: 'A sandstone jaali standing free in the room, carved into a hundred small stars. The afternoon comes through it as coins and moves across the floor.' },
      { text: 'Cool on the palm even in June. The stone was cut so the wind can pass and the sun cannot. Somebody solved this a very long time ago.' },
    ],
  },
  'c11.ex.dryingcloth': {
    lines: [
      { text: 'Four lengths of cloth spread flat on the maidan dust, a stone on each corner. Red, indigo, one green with a gold border showing off.' },
      { text: 'The dhobi will be back before the rain. He always is. Sawan and he have an understanding neither of them has ever explained.' },
    ],
  },
  'c11.ex.parapetside': {
    lines: [
      { text: 'A party wall running north to south, knee high and a century old. On one side of it Yusuf\'s birds, on the other side the television. Peace holds.' },
    ],
  },
  'c11.ex.kitecut': {
    lines: [
      { text: 'A cut kite come to rest, someone\'s woh kata, now the roof\'s souvenir. Its severed line trails off the tile, still pointing at the fight it lost.' },
    ],
  },
  'c11.ex.terrace': {
    lines: [
      { text: 'Lime-washed terrace brick, sun-cured and rain-rinsed. A second city lives up here: tanks, lines, coops, kites, and the sky finally at arm\'s reach.' },
    ],
  },
  'c11.ex.tanktrio': {
    lines: [
      { text: 'A black tank up a welded frame with a blue drum sulking at its foot. The whole mohalla\'s water lives three storeys up and comes down grudgingly.' },
      { text: 'By four in the afternoon it is hot enough to make tea in. By four in the morning it is the coldest thing in Delhi. Nobody has solved this.' },
    ],
  },
  'c11.ex.dishantenna': {
    lines: [
      { text: 'A pale dish weighted down with two bricks, aimed at a satellite nobody has met. It brought two hundred channels and one permanent argument.' },
      { text: 'When it rains hard the picture goes, and the whole lane agrees the rain is at fault. When it clears, credit stays with the bricks.' },
    ],
  },
  'c11.ex.mumty': {
    lines: [
      { text: 'The mumty: a brick room the size of an argument, with a tin hat held down by two bricks and a bottle-green door that has never once been locked.' },
      { text: 'Twelve steps inside it, and then this. Every roof in the mohalla begins with a small dark room and ends with the whole sky.' },
    ],
  },
  'c11.ex.neemtub': {
    lines: [
      { text: 'A neem growing out of a cut oil drum, painted the blue of a bus. It gives the roof its only shade and the lane its only free toothbrushes.' },
    ],
  },
  'c11.ex.kitemast': {
    lines: [
      { text: 'A bamboo the length of two men, lashed to the parapet, flying whatever the roof currently declares. Last week it declared a shirt.' },
      { text: 'A cut kite is tied on at shoulder height. Not decoration. A receipt.' },
    ],
  },
  'c11.ex.wirespan': {
    lines: [
      { text: 'Nine cables crossing the gali at whatever height the last electrician could reach. One kite hangs in them, retired, out of everybody\'s jurisdiction.' },
      { text: 'Nobody knows which wire does what. Everybody knows whom to shout for. The system works, in the way most systems here work.' },
    ],
  },
  'c11.ex.clothspan': {
    lines: [
      { text: 'Cloth strung balcony to balcony over the lane: a red dupatta, a blue lungi, a white kurta with the sun straight through it. The gali\'s only colour.' },
      { text: 'Walk under it in sawan and it drips on you. Walk under it in June and it is the coolest twelve feet in Delhi.' },
    ],
  },
  'c11.ex.shopspill': {
    lines: [
      { text: 'A shop that ran out of shop: steel and plastic stacked one tile into the lane. The lane has always kept its shops in the lane. Nobody complains twice.' },
    ],
  },
  'c11.ex.signjut': {
    lines: [
      { text: 'A painted board on a pole, three scripts deep, with a tube light over it that has been failing politely since 1987. The shop below has moved twice.' },
    ],
  },
  'c11.ex.terracelime': {
    lines: [
      { text: 'Fresh chuna underfoot: Yusuf whitewashes his terrace for the birds, not the neighbors. The birds have never once said thank you. He continues.' },
    ],
  },
  'c11.ex.terracerose': {
    lines: [
      { text: 'The south terrace wears brick dust like an old shawl, worn to the pavers where the charpai parliament sits. Evening starts here and spreads.' },
    ],
  },
  'c11.ex.tulsipot': {
    lines: [
      { text: 'A tulsi in a stepped clay pot, watered before anyone\'s tea. Basil below, pigeons above, and not one leaf goes missing. Some treaties hold.' },
    ],
  },
  'c11.ex.transistor': {
    lines: [
      { text: 'A transistor with its aerial spliced by string, relaying the cricket to the entire sky. Scores travel roof to roof faster than the ball does.' },
    ],
  },
  'c11.ex.chaitray': {
    lines: [
      { text: 'The chai tray: kettle, kulhads, rusk that stays structural until dipped. Quorum for the roof parliament is two cups and one disagreement.' },
    ],
  },
  'c11.ex.charpaibed': {
    lines: [
      { text: 'A charpai made up properly: printed sheet, razai folded at the foot, one pillow that has heard everything. The parapet keeps its back.' },
    ],
  },
  'c11.ex.diyaledge': {
    lines: [
      { text: 'Clay diyas on a whitewashed ledge, lit for the dusk flight. The roof keeps its own constellation, maintained nightly, fueled by mustard oil.' },
    ],
  },
  'c11.ex.kitesnag': {
    lines: [
      { text: 'A cut kite snagged on a bamboo pole: some other roof\'s victory, this roof\'s flag. Nobody takes it down; that would be admitting things.' },
    ],
  },
  'c11.ex.grainspill': {
    lines: [
      { text: 'Bajra by the handful, the flock\'s payroll, audited continuously by beak. One grey feather left on the pile serves as the receipt.' },
    ],
  },
  'c11.ex.stool.roof': {
    lines: [
      { text: 'A low stool at charpai altitude, for the visitor whose knees vote against the floor. Up here even the furniture keeps the sky in view.' },
    ],
  },

  // ---------------- examines: langar hall ----------------
  'c11.ex.degpot': {
    lines: [
      { text: 'A deg the size of a well: dal for five hundred, stirred with a paddle you could row with. It has never once cooked for fewer than everyone.' },
    ],
  },
  'c11.ex.chulha': {
    lines: [
      { text: 'The langar chulha, fed since before dawn. The fire is tended in shifts by volunteers; the heat, like everything here, is donated.' },
    ],
  },
  'c11.ex.attaboard': {
    lines: [
      { text: 'Dough in planetary quantities and the rolling pins of everyone who ever said I can help. Round is a direction, not a requirement.' },
    ],
  },
  'c11.ex.rotistack': {
    lines: [
      { text: 'Rotis stacked warm in cloth, leaning with abundance. Production and blessing in one column; the stack never quite grows and never quite empties.' },
    ],
  },
  'c11.ex.pangat': {
    lines: [
      { text: 'The pangat rows: striped matting where a CEO and a porter eat the same dal at the same level. The floor is the point; no seat outranks another.' },
    ],
  },
  'c11.ex.rumalbasket': {
    lines: [
      { text: 'A basket of rumals in confident colors, for any head that arrived uncovered. Take one, tie it, belong. They all fit everyone; that is the design.' },
    ],
  },
  'c11.ex.shoerack': {
    lines: [
      { text: 'Everyone\'s dusty miles parked at one door: chappals, office shoes, one tiny pair with lights in the heels. The rack holds them without ranking them.' },
    ],
  },
  'c11.ex.doormat': {
    lines: [
      { text: 'Coir, honest, worn thin exactly where a thousand feet agreed to be polite. It greets a CEO and a porter with the same rough handshake.' },
    ],
  },
  'c11.ex.waterstation': {
    lines: [
      { text: 'Clay matkas sweating on an iron stand, steel tumblers below. Cold water, free, all July: the quietest ministry in the building.' },
    ],
  },
  'c11.ex.hallfan': {
    lines: [
      { text: 'The hall fan, cage dented, motor loyal, sweeping the pangat rows in slow forgiveness. Someone tied a ribbon to it to prove the breeze exists.' },
    ],
  },
  'c11.ex.khandapanel': {
    lines: [
      { text: 'The khanda over a saffron drape: the kitchen\'s compass. Below this wall everything is level; that is not decor, that is the instruction.' },
    ],
  },
  'c11.ex.ladlestand': {
    lines: [
      { text: 'Karchhis racked by wingspan and the brass bucket between rounds. The dal travels the rows two-handed; the ladle never points at anyone.' },
    ],
  },
  'c11.ex.thalistack': {
    lines: [
      { text: 'Five hundred steel thalis drying on edge, washed by whichever hands arrived. Tomorrow they will ring like shy bells all the way to the floor.' },
    ],
  },

  // ---------------- examines: the poet's haveli ----------------
  'c11.ex.couplet': {
    lines: [
      { text: 'Nastaliq on whitewash: hazaaron khwahishen aisi, ki har khwahish pe dam nikle. A thousand desires, each worth a life; many came true, still too few.' },
      { text: 'You read it twice, then once more with your lips moving. It files itself somewhere permanent. The chai-wallah at the gali mouth pays for such lines.' },
    ],
    effects: ['set:c11.sher.learned', 'journal:customs.sher'],
  },
  'c11.ex.couplet.again': {
    lines: [
      { text: 'The second panel, smaller: dil-e-nadaan tujhe hua kya hai. Oh innocent heart, what has happened to you. The wall asks everyone; nobody has to answer.' },
    ],
  },
  'c11.ex.divan': {
    lines: [
      { text: 'A divan with brocade bolsters, where visitors outstay beautifully. The cushions hold the shape of a century of good talks, none of them finished.' },
    ],
  },
  'c11.ex.takht': {
    lines: [
      { text: 'A low writing desk: paper, reed qalam, an inkwell that has outlived its opinions. Two lines begun, one crossed out. The crossing-out is the craft.' },
    ],
  },
  'c11.ex.bookchest': {
    lines: [
      { text: 'Divans of poets, a dictionary that lost an argument, dust holding it all in place. One volume lies open on top, mid-sentence since before Partition.' },
    ],
  },
  'c11.ex.mangocrate': {
    lines: [
      { text: 'A crate of langra in straw, perfuming the whole room; the caretaker keeps it the way other rooms keep flowers. Sawan\'s one non-negotiable furnishing.' },
      { text: 'Ghalib, asked what he required of mangoes: sweet, and many. A friend said even donkeys refuse them. Exactly, said Ghalib. Even donkeys.' },
    ],
    effects: ['journal:dishes.aam'],
  },
  'c11.ex.paandaan': {
    lines: [
      { text: 'A brass paandaan, hinged like a small bank vault, which socially it is. Betel leaf, areca, lime, cardamom: a whole diplomacy in one box.' },
    ],
  },
  'c11.ex.lampniche': {
    lines: [
      { text: 'A taaq in the wall: one oil lamp, fifty years of soot above it. Still the room\'s best reading light, says the room, and the room would know.' },
    ],
  },
  'c11.ex.couplitter': {
    lines: [
      { text: 'Crumpled drafts by the takht, each one a second line that refused to land. The wastebasket lost on points; the floor keeps the evidence.' },
    ],
  },

  // ---------------- examines: shared kinds, this chapter's voice ----------------
  'c11.ex.door': {
    lines: [
      { text: 'A door that looks closed. Per Bantu\'s rule two, it is not closed; it is simply resting. Behind it, someone\'s whole world keeps its own hours.' },
    ],
  },
  'c11.ex.farol': {
    lines: [
      { text: 'A lane lamp wired into the great overhead tangle by a method best not audited. In the rain its light goes soft, a candle inside a waterfall.' },
    ],
  },
  'c11.ex.tuft': {
    lines: [
      { text: 'Grass in a pavement crack, drinking the season. Even the weeds of this city are fed by somebody\'s spillage; it is that kind of city.' },
    ],
  },
  'c11.ex.dirt': {
    lines: [
      { text: 'The maidan\'s trampled earth: cricket pitch, wrestling ground, puddle nursery, and parliament floor, depending on the hour.' },
    ],
  },
  'c11.ex.wallint.langar': {
    lines: [
      { text: 'Whitewashed walls that hold steam, kirtan, and the smell of dal in equal measure. A painted line reads: recognize the whole human race as one.' },
    ],
  },
  'c11.ex.wallint.haveli': {
    lines: [
      { text: 'Cool lime-plastered walls a lakhori brick thick. Outside, the lane roars politely; in here, the loudest thing is the ink.' },
    ],
  },
  'c11.ex.shelf.langar': {
    lines: [
      { text: 'Steel thalis and katoris in gleaming battalions, washed by volunteers whose seva is exactly this: five hundred dishes, no ledger, no complaints desk.' },
    ],
  },
  'c11.ex.rug.haveli': {
    lines: [
      { text: 'A cotton dari, indigo-striped, worn to its geometry by listeners sitting exactly where you would sit. The mushaira is over; the dari disagrees.' },
    ],
  },
  'c11.ex.mat.langar': {
    lines: [
      { text: 'The threshold mat, thinned by every kind of foot the city makes. It has one job and no opinions, which is rare for this street.' },
    ],
  },
  'c11.ex.mat.haveli': {
    lines: [
      { text: 'A reed mat at the door, older than the electricity. You wipe your feet; the haveli notices, and approves in its cool, plastered way.' },
    ],
  },
  'c11.ex.floorterrazzo': {
    lines: [
      { text: 'Grey terrazzo in brass-edged bays, mopped between sittings. It has fed and been wiped clean more times than anybody has counted.' },
      { text: 'Still damp in patches. The mop never gets far ahead of the sangat, and is not supposed to.' },
    ],
  },
  'c11.ex.floorsandstone': {
    lines: [
      { text: 'Agra sandstone flags, laid before anyone\'s grandmother, cool in June. The entire argument for building a house around a courtyard, in one material.' },
    ],
  },
};

/** Examine arms: new kinds get untagged fallbacks, shared kinds speak only on these maps. */
export const DELHI_EXAMINES: Record<string, ExamineArm[]> = {
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
  marigoldheap: [{ node: 'c11.ex.marigoldheap' }],
  spicespill: [{ node: 'c11.ex.spicespill' }],
  kulhadshards: [{ node: 'c11.ex.kulhadshards' }],
  pigeonpeck: [{ node: 'c11.ex.pigeonpeck' }],
  puddle: [{ node: 'c11.ex.puddle' }],
  charpai: [{ node: 'c11.ex.charpai' }],
  dakkhana: [
    { when: { not: ['letter.read.delhi.pilar'] }, node: 'c11.post.pilar' },
    { when: { has: ['letter.read.delhi.pilar'], not: ['letter.read.delhi.mariamma'] }, node: 'c11.post.mariamma' },
    { node: 'c11.post.idle' },
  ],
  chalkpitch: [{ node: 'c11.ex.chalkpitch' }],
  kabootarkhana: [{ node: 'c11.ex.kabootarkhana' }],
  kitestack: [{ node: 'c11.ex.kitestack' }],
  tanktrio: [{ node: 'c11.ex.tanktrio' }],
  dishantenna: [{ node: 'c11.ex.dishantenna' }],
  mumty: [{ node: 'c11.ex.mumty' }],
  neemtub: [{ node: 'c11.ex.neemtub' }],
  kitemast: [{ node: 'c11.ex.kitemast' }],
  wirespan: [{ node: 'c11.ex.wirespan' }],
  clothspan: [{ node: 'c11.ex.clothspan' }],
  shopspill: [{ node: 'c11.ex.shopspill' }],
  signjut: [{ node: 'c11.ex.signjut' }],
  terracelime: [{ node: 'c11.ex.terracelime' }],
  terracerose: [{ node: 'c11.ex.terracerose' }],
  tulsipot: [{ node: 'c11.ex.tulsipot' }],
  transistor: [{ node: 'c11.ex.transistor' }],
  chaitray: [{ node: 'c11.ex.chaitray' }],
  charpaibed: [{ node: 'c11.ex.charpaibed' }],
  diyaledge: [{ node: 'c11.ex.diyaledge' }],
  kitesnag: [{ node: 'c11.ex.kitesnag' }],
  grainspill: [{ node: 'c11.ex.grainspill' }],
  charkhi: [{ node: 'c11.ex.charkhi' }],
  watertank: [{ node: 'c11.ex.watertank' }],
  dhobiline: [{ node: 'c11.ex.dhobiline' }],
  antennajugaad: [{ node: 'c11.ex.antennajugaad' }],
  fortwall: [{ node: 'c11.ex.fortwall' }],
  jamadomes: [{ node: 'c11.ex.jamadomes' }],
  parapet: [{ node: 'c11.ex.parapet' }],
  parapetside: [{ node: 'c11.ex.parapetside' }],
  dryingcloth: [{ node: 'c11.ex.dryingcloth' }],
  jaalipanel: [{ node: 'c11.ex.jaalipanel' }],
  pigeonflock: [{ node: 'c11.ex.pigeonflock' }],
  kitecut: [{ node: 'c11.ex.kitecut' }],
  degpot: [{ node: 'c11.ex.degpot' }],
  chulha: [{ node: 'c11.ex.chulha' }],
  attaboard: [{ node: 'c11.ex.attaboard' }],
  rotistack: [{ node: 'c11.ex.rotistack' }],
  pangat: [{ node: 'c11.ex.pangat' }],
  rumalbasket: [{ node: 'c11.ex.rumalbasket' }],
  shoerack: [{ node: 'c11.ex.shoerack' }],
  doormat: [{ node: 'c11.ex.doormat' }],
  waterstation: [{ node: 'c11.ex.waterstation' }],
  hallfan: [{ node: 'c11.ex.hallfan' }],
  khandapanel: [{ node: 'c11.ex.khandapanel' }],
  ladlestand: [{ node: 'c11.ex.ladlestand' }],
  thalistack: [{ node: 'c11.ex.thalistack' }],
  lampniche: [{ node: 'c11.ex.lampniche' }],
  couplitter: [{ node: 'c11.ex.couplitter' }],
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
  shelf: [{ map: 'delhi-langar', node: 'c11.ex.shelf.langar' }],
  rug: [{ map: 'delhi-haveli', node: 'c11.ex.rug.haveli' }],
  mat: [
    { map: 'delhi-langar', node: 'c11.ex.mat.langar' },
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
  // Pilar: election day on the bridge. Democracy, but make it an invoice.
  {
    id: 'delhi.pilar',
    from: 'Pilar, Bridge Authority, ELECTION HEADQUARTERS',
    when: { has: ['c6.row.done'] },
    body: [
      'Dear business partner. It is ELECTION DAY on the bridge. Electorate: nine people and one dog. Current count: four for me, four for my opponent, who is my cousin and wrong.',
      'The ninth voter has gone fishing. Fishing! During history! We have sent the dog to negotiate; the dog is deputy-eligible and motivated by jerky.',
      'I hear you rowed seat forty-one in a boat with one hundred oars. When I win, I am adding a navy to my platform retroactively. You are its admiral. The fee for admiral is one fact about India.',
      'Suspense is expensive. I am invoicing you for one day of it, payable in mail. Vote Pilar, wherever voting finds you.',
    ],
  },
  {
    id: 'delhi.pilar',
    from: 'Pilar, Bridge Authority, ELECTION HEADQUARTERS',
    body: [
      'Dear traveler. It is ELECTION DAY on the bridge. Electorate: nine people and one dog. Current count: four for me, four for my opponent, who is my cousin and wrong.',
      'The ninth voter has gone fishing. Fishing! During history! We have sent the dog to negotiate; the dog is deputy-eligible and motivated by jerky.',
      'My platform is unchanged: the toll stays, the museum grows, the facts get audited annually. My opponent promises free crossings, which is anarchy with extra steps.',
      'Suspense is expensive. I am invoicing you for one day of it, payable in mail. Vote Pilar, wherever voting finds you.',
    ],
  },
  // Mariamma, one monsoon behind you and one kitchen ahead of everyone.
  {
    id: 'delhi.mariamma',
    from: 'Mariamma, Kaithappuram',
    when: { has: ['c6.sadya.done'] },
    body: [
      'Mone. The rain here has settled into its long habit and the pot still improves overnight. Joseph sleeps until meals; the correct system continues.',
      'Auntie Leela and Auntie Rosamma still argue about which way you folded your leaf at my sadya. Leela says toward, Rosamma says away, and both claim your fold as their teaching.',
      'They say in Delhi the aunties feed you until you surrender. Good. Surrender. It is the only fight worth losing daily.',
      'Eat properly, cover your head where heads are covered, and write one line. Mothers read between lines; it is our alphabet.',
    ],
  },
  {
    id: 'delhi.mariamma',
    from: 'Mariamma, Kaithappuram',
    body: [
      'Mone. The rain here has settled into its long habit and the pot still improves overnight. Joseph sleeps until meals; the correct system continues.',
      'The little Japanese umbrella stands by the door where you left the story of it. Visitors ask; I tell it longer each time. That is how umbrellas grow.',
      'They say in Delhi the aunties feed you until you surrender. Good. Surrender. It is the only fight worth losing daily.',
      'Eat properly, cover your head where heads are covered, and write one line. Mothers read between lines; it is our alphabet.',
    ],
  },
];
