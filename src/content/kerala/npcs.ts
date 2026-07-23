import type { ExamineArm, NodeMap, NpcDef } from '../schema';

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
      { when: { not: ['met.mariamma'] }, node: 'c6.mariamma.nofirst' },
      { when: { has: ['c6.letter.delivered'], not: ['c6.mariamma2'] }, node: 'c6.mariamma.kitchen' },
      { when: { has: ['c6.mariamma2', 'c6.chaya'], not: ['c6.sadya.ask'] }, node: 'c6.mariamma.sadyaplan' },
      { when: { has: ['c6.sadya.ask'], not: ['c6.sadya.done'] }, node: 'c6.mariamma.sadyastart' },
      {
        when: { has: ['c6.row.done', 'c6.sadya.done', 'c6.rain'], not: ['c6.complete'] },
        node: 'c6.mariamma.blessing',
      },
      { when: { has: ['c6.complete'] }, node: 'c6.mariamma.after' },
      { node: 'c6.mariamma.idle' },
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
      { when: { has: ['c6.letter.delivered'], not: ['met.shaji'] }, node: 'c6.shaji.firstwarm' },
      { when: { not: ['met.shaji'] }, node: 'c6.shaji.first' },
      { when: { has: ['met.shaji', 'c6.letter.delivered'], not: ['c6.chaya'] }, node: 'c6.shaji.chaya' },
      { when: { has: ['c6.chaya', 'page.words.chetta'], not: ['c6.chetta'] }, node: 'c6.shaji.chetta' },
      { when: { has: ['c6.rain'], not: ['c6.rainchaya'] }, node: 'c6.shaji.rainstall' },
      { node: 'c6.shaji.idle' },
    ],
  },
  {
    id: 'appu',
    name: 'Appu',
    map: 'kerala',
    pos: [24, 15],
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
      { when: { has: ['met.omana', 'c6.letter.delivered'], not: ['c6.rope.errand'] }, node: 'c6.omana.rope' },
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
      { when: { not: ['met.varkey'] }, node: 'c6.varkey.first' },
      { when: { has: ['errand.coir-rope'], not: ['c6.rope.given'] }, node: 'c6.varkey.rope' },
      { when: { has: ['c6.rope.given', 'c6.letter.delivered'], not: ['c6.row.done'] }, node: 'c6.varkey.invite' },
      { when: { has: ['c6.row.done'], not: ['c6.varkey2'] }, node: 'c6.varkey.after' },
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

export const KERALA_NODES: NodeMap = {
  // ---------------- arrival ----------------
  'c6.arrive': {
    lines: [
      { text: 'The cargo ship left you at Kochi; a chugging boat left you here, on a jetty the width of a promise.' },
      { text: 'Green water, green banks, green light. The air is a wet towel that smells of mud, smoke, and something frying.' },
      { text: 'In your pocket: a letter and a small parcel, carried across one whole ocean. Joseph said: the house with the open door.' },
      { text: 'Above the palms, the sky is stacking dark clouds like cargo. Everyone walks as if they know the schedule.' },
    ],
    effects: ['set:c6.arrived'],
  },

  // ---------------- Mariamma, the front door ----------------
  'c6.mariamma.letter': {
    lines: [
      { text: 'The open door breathes out woodsmoke and curry leaves. A small woman looks up, and somehow knows before you speak.' },
      { who: 'Mariamma', text: 'That is my Joseph’s knot on that parcel. Sit. Sit! Did you eat? You will eat.' },
      { text: 'She reads the letter aloud, to you, to the kitchen, to the smoke. At "Amma, I eat well, nobody cooks like you" she cries.' },
      { who: 'Mariamma', text: 'He says the cook is Filipino and very good. Then he says do not tell the cook, but Amma, your meen curry wins.' },
      { text: 'She laughs, wipes her eyes with the end of her mundu, and keeps reading. The page trembles a little, like the palms outside.' },
    ],
    effects: ['set:met.mariamma', 'set:c6.letter.delivered', 'clear:joseph.letter', 'journal:people.mariamma'],
    next: 'c6.mariamma.gift',
  },
  'c6.mariamma.gift': {
    lines: [
      { text: 'The parcel: a folding umbrella from Japan, small as a mango, black as a crow. She opens it indoors without one flicker of worry.' },
      { who: 'Mariamma', text: 'An umbrella, before edavappathi! The boy remembers the sky. Ha! He forgets my birthday and remembers the sky.' },
      { text: 'She laughs again, properly this time, and stands the little umbrella by the door like a guest of honor.' },
    ],
    next: 'c6.mariamma.adopt',
  },
  'c6.mariamma.adopt': {
    lines: [
      { who: 'Mariamma', text: 'You carried my son’s voice across the sea. So. In this house you are not sir, not madam. You are mone. My child.' },
      { who: 'Mariamma', text: 'Say nanni if you must thank me. That is thanks in Malayalam. But family says it rarely and shows it daily.' },
      { who: 'Mariamma', text: 'Now go and drink chaya at Shaji’s stall, and tell him whose guest you are. The village will do the rest.' },
    ],
    effects: ['journal:words.nanni'],
  },
  'c6.mariamma.nofirst': {
    lines: [
      { who: 'Mariamma', text: 'A new face at my door, and rain coming. Both are reasons to sit. Did you eat?' },
    ],
    effects: ['set:met.mariamma'],
  },
  'c6.mariamma.kitchen': {
    lines: [
      { who: 'Mariamma', text: 'Sukhamano, mone? It means, are you well. You answer: sukham! Say it until it is true; that is how it works.' },
      { text: 'She lifts the lid on a clay pot. Meen curry, dark red, sour with kudampuli. It has been resting since yesterday.' },
      { who: 'Mariamma', text: 'Fish curry is better on the second day. The pot thinks about it overnight. People also improve if you let them sit.' },
      { who: 'Mariamma', text: 'One more lesson. Anyone older is chetta or chechi, elder brother, elder sister. Address the village correctly and it is all relatives.' },
    ],
    effects: ['set:c6.mariamma2', 'journal:words.sukhamano', 'journal:words.chetta', 'journal:dishes.meencurry'],
  },
  'c6.mariamma.sadyaplan': {
    lines: [
      { who: 'Mariamma', text: 'Sunday I am laying a sadya. For the letter, for the umbrella, for the whole village that raised my Joseph.' },
      { who: 'Mariamma', text: 'Banana leaves, rice, ten dishes, payasam at the end. My knees can cook but they cannot also serve. Your hands, mone?' },
      { text: 'It is not really a question. In this kitchen, the questions are decorations.' },
    ],
    effects: ['set:c6.sadya.ask'],
  },
  'c6.mariamma.sadyastart': {
    lines: [
      { who: 'Mariamma', text: 'The leaves are cut, the aunties have arrived, the payasam is behaving. We only lack a pair of serving hands.' },
    ],
    choices: [
      { text: 'Take up the serving spoon', goto: 'c6.sadya.go' },
      { text: 'Not yet', goto: 'c6.sadya.wait' },
    ],
  },
  'c6.sadya.go': {
    lines: [
      { who: 'Mariamma', text: 'Right hand only, mone. The left hand has other duties in life and everyone at the leaf knows what they are.' },
      { text: 'Auntie Leela and Auntie Rosamma flank you like tugboats. The first banana leaf is laid, narrow end pointing left.' },
    ],
    effects: ['set:c6.sadya.start'],
  },
  'c6.sadya.wait': {
    lines: [
      { who: 'Mariamma', text: 'Go, walk, come back hungry. A sadya waits better than it reheats, but not by much.' },
    ],
  },
  'c6.sadya.served': {
    lines: [
      { text: 'Leaf after leaf, you learn the map: pickles small and sharp up left, rice arriving last like a monarch. Your right hand aches politely.' },
      { text: 'The room eats, argues, laughs, asks for more payasam. Someone says mathi, enough, and means it the third time they say it.' },
      { who: 'Auntie Leela', text: 'See how the child folds the leaf! Toward, satisfied. I taught that.' },
      { who: 'Auntie Rosamma', text: 'Away means satisfied, Leela. Your whole family folds it wrong and has since 1951.' },
      { who: 'Mariamma', text: 'Both of you, mathi. The leaf is folded, the child ate, Joseph’s letter is answered. That is the grammar that matters.' },
    ],
    effects: ['set:c6.sadya.done', 'clear:c6.sadya.start', 'journal:dishes.sadya', 'journal:dishes.payasam'],
  },
  'c6.mariamma.blessing': {
    lines: [
      { who: 'Mariamma', text: 'Come here. Rowed with the club, served at my sadya, stood in the first rain like a local fool. Mone, you are done arriving.' },
      { text: 'She holds your face in both hands, the way you handle something you intend to keep. Her eyes shine; the good kind, this time.' },
      { who: 'Mariamma', text: 'The sea took my son and sends me letters. Now it takes you too. Go to Moosa at the jetty; the wind is already asking about you.' },
    ],
    effects: ['set:c6.complete'],
  },
  'c6.mariamma.after': {
    lines: [
      { who: 'Mariamma', text: 'When you reach the next coast, eat properly and write to me. One page, no news needed. Mothers read between lines; it is our alphabet.' },
    ],
  },
  'c6.mariamma.idle': {
    lines: [
      { who: 'Mariamma', text: 'The pot is thinking, the rain is coming, the leaf is cut. Sit, mone. Hurry is for people with worse kitchens.' },
    ],
  },

  // ---------------- Shaji, the thattukada ----------------
  'c6.shaji.first': {
    lines: [
      { text: 'A stall the size of a wardrobe, a kettle the size of an ambition. The man behind it nods with professional politeness.' },
      { who: 'Shaji', text: 'Chaya, sir? Puttu, sir? Sit, sir. The bench is for customers and philosophers, and the rate is the same.' },
    ],
    effects: ['set:met.shaji', 'journal:people.shaji'],
  },
  'c6.shaji.firstwarm': {
    lines: [
      { who: 'Shaji', text: 'You are the one! Mariamma chechi’s letter, from Joseph, across the whole sea. The village knew before you knocked, sir.' },
      { who: 'Shaji', text: 'For that, the bench, the good glass, and my full attention. This is a thattukada; news and chaya are both served hot.' },
    ],
    effects: ['set:met.shaji', 'journal:people.shaji'],
  },
  'c6.shaji.chaya': {
    lines: [
      { text: 'He pours tea from one tumbler to another in a long bronze arc, a meter of chaya airborne and not one drop lost.' },
      { who: 'Shaji', text: 'Pulling cools it, mixes it, and looks magnificent. Three jobs, one wrist. That is management, sir.' },
      { text: 'On a steel plate: puttu, a soft white cylinder of rice and coconut, with kadala curry. Beside it a parotta, flaking into ribbons.' },
      { who: 'Shaji', text: 'Puttu for the morning, parotta for the soul. Tear it with the fingers, sir. Cutlery is for people in a hurry to be elsewhere.' },
    ],
    effects: ['set:c6.chaya', 'journal:words.chaya', 'journal:dishes.puttu', 'journal:dishes.parotta'],
    choices: [
      { text: '"In Busan the ajumma always added a little extra. Deom, she called it."', goto: 'c6.shaji.deom', when: { has: ['page.words.deom'] } },
      { text: 'Ask why the glass is only three-quarters full', goto: 'c6.shaji.extra' },
    ],
  },
  'c6.shaji.deom': {
    lines: [
      { who: 'Shaji', text: 'Deom! A name for it! Here it has no name, sir. I pour short, you notice, I top it up, we are both pleased. Naming it would spoil the aim.' },
      { text: 'He tops your glass with a flourish. The extra is always poured last, so it stays the extra.' },
    ],
    next: 'c6.shaji.wobble',
  },
  'c6.shaji.extra': {
    lines: [
      { who: 'Shaji', text: 'Watch, sir.' },
      { text: 'He tops the glass with one more pull, unasked. It is a small ceremony: the short pour, the noticing, the topping-up.' },
      { who: 'Shaji', text: 'The last splash is not chaya, sir. It is the message. Regulars get it without asking; that is what regular means.' },
    ],
    next: 'c6.shaji.wobble',
  },
  'c6.shaji.wobble': {
    lines: [
      { text: 'You ask if there will be puttu again tomorrow. Shaji tilts his head side to side, side to side. You take it as a no and start to stand.' },
      { who: 'Appu', text: 'Where are you GOING? That means yes! Head goes like a boat, answer is yes. Head goes still, THEN you worry.' },
      { who: 'Shaji', text: 'The boy translates for tourists and crows. Yes, puttu tomorrow, sir. The head said so plainly.' },
    ],
    effects: ['journal:customs.headwobble'],
  },
  'c6.shaji.chetta': {
    lines: [
      { text: 'You put down the glass and try it: Shaji chetta, one more chaya?' },
      { who: 'Shaji', text: 'AH. Chetta! Did you hear, kettle? Promoted!' },
      { who: 'Shaji', text: 'No more sir, mone. Sir is a coat for strangers; this bench was never for strangers, only for family who had not arrived yet.' },
    ],
    effects: ['set:c6.chetta'],
  },
  'c6.shaji.rainstall': {
    lines: [
      { text: 'The stall in the rain is a lighthouse with snacks. Under the awning, six people, four umbrellas, one argument about football.' },
      { who: 'Shaji', text: 'Rain-watching chaya is kattan, mone. Black, no milk, sweet. The rain provides the milk feelings.' },
    ],
    effects: ['set:c6.rainchaya'],
  },
  'c6.shaji.idle': {
    lines: [
      { who: 'Shaji', text: 'Chaya kudikkam? The kettle has opinions about everyone, but it keeps them at a simmer. Sit; it likes you.' },
    ],
  },

  // ---------------- Appu, translator of heads ----------------
  'c6.appu.first': {
    lines: [
      { who: 'Appu', text: 'I am Appu. I translate. Not languages, heads. Wobble means yes, big wobble means definitely, slow wobble means yes but sadly.' },
      { who: 'Appu', text: 'Also I rate things. The jetty: okay. Joseph chettan’s ship: adipoli. You walking here from another ocean: ADIPOLI.' },
      { who: 'Appu', text: 'Adipoli means excellent. Top class. You may use it, no fee. First one is free because you are Mariamma ammachi’s guest.' },
    ],
    effects: ['set:met.appu', 'journal:words.adipoli'],
  },
  'c6.appu.race': {
    lines: [
      { who: 'Appu', text: 'I SAW YOU. In the boat! Your oar went wrong two times and then RIGHT the rest of the times. Adipoli!' },
      { who: 'Appu', text: 'When I am big I will be the singer, not a rower. The singer steers a hundred people with one throat. That is the real captain.' },
    ],
    effects: ['set:c6.appu2'],
  },
  'c6.appu.idle': {
    lines: [
      { who: 'Appu', text: 'Practice with me. I wobble, you answer.' },
      { text: 'He wobbles his head. You wobble back. He grades it with a fisherman’s squint: passable, improving, adipoli.' },
    ],
  },

  // ---------------- Kuttan, toddy tapper and philosopher ----------------
  'c6.kuttan.first': {
    lines: [
      { text: 'High in a coconut palm, a man is at work. He descends the trunk with a frog’s confidence, a knife and a pot at his hip.' },
      { who: 'Kuttan', text: 'Sixty feet up, twice a day, forty years. People ask if I am afraid of the palm. Wrong question. The palm and I are colleagues.' },
      { who: 'Kuttan', text: 'This pot is kallu. Sweet at dawn, sour by dark, same pot. Most things are like that. Most people also.' },
    ],
    effects: ['set:met.kuttan', 'journal:people.kuttan'],
  },
  'c6.kuttan.smell': {
    lines: [
      { who: 'Kuttan', text: 'Stand still. Breathe through the nose. Wet earth, hot tin, something green waking up. You smell it?' },
      { who: 'Kuttan', text: 'From the top of a palm you can watch it walking in across the lagoon, grey as an elephant, twice as sure of itself.' },
    ],
    next: 'c6.rain.arrives',
  },
  'c6.rain.arrives': {
    lines: [
      { text: 'The first drops land like coins on the tin roofs, then the tile roofs answer, deeper, and then the sky simply opens.' },
      { text: 'Nobody runs for cover. Kids run OUT of cover. The tea stall fills, the frogs start their shift, the channel fizzes like soda.' },
      { text: 'Edavappathi. The monsoon has arrived, and the village greets it like a relative who always comes on the promised day.' },
    ],
    effects: ['set:c6.rain', 'journal:customs.monsoon'],
  },
  'c6.kuttan.rain': {
    lines: [
      { who: 'Kuttan', text: 'You planned around the rain, I saw; errands first, sky checked twice. We plan WITH it. It is not weather here, it is a relative.' },
      { who: 'Kuttan', text: 'Fish move, roofs get tested, kallu tastes better. The rain does not care who curses it, which is a kind of wisdom.' },
    ],
    effects: ['set:c6.kuttan2'],
  },
  'c6.kuttan.idle': {
    lines: [
      { who: 'Kuttan', text: 'A poler went by this morning, up the channel, never waved. Twenty years he has not waved. Consistency is also a friendship.' },
    ],
  },

  // ---------------- Omana, coir cooperative ----------------
  'c6.omana.first': {
    lines: [
      { text: 'By the racks, a woman rolls coconut fiber against her thigh, and rope simply happens, golden and continuous.' },
      { who: 'Omana', text: 'Husk soaks in the canal six months before it will be rope. Six months! Patience is the raw material; coconut is just the excuse.' },
      { who: 'Omana', text: 'The cooperative is eleven women and one ledger. The rope holds boats, beds, and roofs. The ledger holds the eleven of us.' },
    ],
    effects: ['set:met.omana', 'journal:people.omana'],
  },
  'c6.omana.rope': {
    lines: [
      { who: 'Omana', text: 'Guest of Mariamma chechi, your legs are younger than my afternoon. This coil goes to Varkey at the bank; race season eats rope like rice.' },
      { who: 'Omana', text: 'Tell him it is the good lay, three strand. If he squeezes it and makes his face, make the face back. That is negotiation here.' },
    ],
    effects: ['set:c6.rope.errand', 'errand:coir-rope', 'set:errand.coir-rope'],
  },
  'c6.omana.paddy': {
    lines: [
      { who: 'Omana', text: 'You see the flooded field? Pokkali rice. It grows tall in the monsoon with its feet in brackish water; no other rice would tolerate it.' },
      { who: 'Omana', text: 'After harvest the field is opened to the tide, and prawns farm the stubble. Rice feeds prawn, prawn feeds soil. The field works both shifts.' },
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
      { text: 'One room, one ceiling fan, four newspapers on sticks, and shelves argued into order. A sign says: GRANDHASALA. READING ROOM.' },
      { who: 'Divakaran Master', text: 'Every village has one. A laborer can read Marx, poetry, or the football page, and argue about all three before lunch. Usually he does.' },
      { who: 'Divakaran Master', text: 'Whole generations learned letters in rooms like this. I keep the fan going and the arguments fair. It is quiet work. I am quietly proud of it.' },
    ],
    effects: ['set:met.librarian', 'journal:people.librarian', 'journal:customs.readingroom'],
  },
  'c6.lib.rain': {
    lines: [
      { who: 'Divakaran Master', text: 'First rain always fills the room. Half come for the roof, half for the paper, all stay for the argument.' },
      { who: 'Divakaran Master', text: 'Travelers shelter here too, every monsoon, for fifty years. They dry off between the poets and the sports page. Some of them even sign the register.' },
    ],
    effects: ['set:c6.lib2'],
  },
  'c6.lib.idle': {
    lines: [
      { who: 'Divakaran Master', text: 'The mural is new paint on an old habit. The book pours out readers; the wall has been saying so since before I had this many white hairs.' },
    ],
  },

  // ---------------- Captain Varkey, the race ----------------
  'c6.varkey.first': {
    lines: [
      { text: 'On the bank, a crew drills strokes in an imaginary boat, counting in song. A thick-armed man watches them like a debt.' },
      { who: 'Captain Varkey', text: 'Club boat. Chundan vallam, hundred and one seats, and I am one rower short, which is the same as being short a lung.' },
      { who: 'Captain Varkey', text: 'Mind Raghavan, the stroke caller. He acknowledges only rowers. Everyone else is scenery to him, including, currently, you.' },
    ],
    effects: ['set:met.varkey'],
  },
  'c6.varkey.rope': {
    lines: [
      { who: 'Captain Varkey', text: 'From Omana chechi? Give here.' },
      { text: 'He squeezes the coil and makes a face like a man auditing his own funeral. You make the face back. He almost smiles.' },
      { who: 'Captain Varkey', text: 'Good lay. The boat is a hundred feet of wood held together by this and by shouting. Tell her the club says nanni, and I said nothing.' },
    ],
    effects: ['set:c6.rope.given', 'errand.done', 'clear:errand.coir-rope'],
  },
  'c6.varkey.invite': {
    lines: [
      { who: 'Captain Varkey', text: 'You carried rope without dropping it and letters across an ocean. Hands and reliability. I can teach rhythm to anything with both.' },
      { who: 'Captain Varkey', text: 'The song is the whole trick. Singer calls, crew answers, oars strike ON the word. Miss the beat and you row alone; nobody rows alone for long.' },
    ],
    choices: [
      { text: 'Take the empty seat', goto: 'c6.varkey.go' },
      { text: 'Not yet', goto: 'c6.varkey.later' },
    ],
  },
  'c6.varkey.go': {
    lines: [
      { who: 'Captain Varkey', text: 'Seat forty-one. Oar in, eyes on nothing, ears on the song. The boat will tell you the rest; she is older than your country.' },
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
      { text: 'The song swallows you. Call, answer, strike; call, answer, strike. Somewhere in the middle you stop rowing and start belonging.' },
      { text: 'The boat surges each time a hundred blades bite at once, a muscle the length of a street. The bank blurs green; the crowd is one long vowel.' },
      { who: 'Captain Varkey', text: 'Ragged twice, on the beat the rest. For a first row in a chundan, I have seen worse from cousins.' },
      { text: 'Raghavan the stroke caller, who has not once looked at you, looks at you. One nod. It weighs more than the trophy would.' },
    ],
    effects: ['set:c6.row.done', 'clear:c6.row.start', 'journal:customs.vallamkali'],
  },
  'c6.varkey.after': {
    lines: [
      { who: 'Captain Varkey', text: 'Race day is after the rains settle in. We will row wet and win wet; the trophy dries the same either way.' },
      { who: 'Captain Varkey', text: 'The lake gives less fish every year; the houseboats churn it like soup. But race week, the water is only ours again.' },
    ],
    effects: ['set:c6.varkey2'],
  },
  'c6.varkey.idle': {
    lines: [
      { who: 'Captain Varkey', text: 'Stroke, stroke, STROKE. You cannot say it too many times. You can say it too few; that is called losing.' },
    ],
  },

  // ---------------- Moosa, the jetty office ----------------
  'c6.moosa.first': {
    lines: [
      { text: 'By the jetty office, sacks stenciled CARDAMOM wait under tarpaulin. A white-bearded man counts them without appearing to count.' },
      { who: 'Moosa', text: 'Moosa. Spices go down this water to Kochi, then wherever the wind always took them. The trade is older than the paperwork, and the paperwork is old.' },
      { who: 'Moosa', text: 'My grandfather said the monsoon is not weather, it is a road. It blows one way half the year, then turns around and comes home.' },
    ],
    effects: ['set:met.moosa'],
  },
  'c6.moosa.berth': {
    lines: [
      { who: 'Moosa', text: 'So. The village vouches for you: the mother, the captain, the kettle, even the boy who rates things. That is a full manifest of opinions.' },
      { who: 'Moosa', text: 'A spice ship leaves Kochi going west; her mate owes me two favors, and you will be one. Pepper went that road to Zanzibar before anyone wrote it down.' },
      { who: 'Moosa', text: 'The wind that brought your boat in can carry you out. That has been the whole arrangement here for two thousand years.' },
    ],
    effects: ['set:c6.depart.ready'],
  },
  'c6.moosa.sail': {
    lines: [
      { who: 'Moosa', text: 'The berth is held, the rain has settled into its rhythm, and the wind is asking. Well, traveler?' },
    ],
    choices: [
      { text: 'Sail west with the spice ship', goto: 'c6.depart' },
      { text: 'Not yet; the village still has my mornings', goto: 'c6.moosa.wait' },
    ],
  },
  'c6.moosa.wait': {
    lines: [
      { who: 'Moosa', text: 'Take your mornings. The monsoon keeps its schedule better than any of us; it will not leave without you.' },
    ],
  },
  'c6.depart': {
    lines: [
      { text: 'Mariamma packs food for four days and advice for forty. The little Japanese umbrella waves from her doorway until the boat turns.' },
      { text: 'At Kochi the spice ship takes you aboard smelling of pepper and diesel. The wind fills in behind the rain, going west, going old roads.' },
      { text: 'Zanzibar, the mate says, tasting the word. The monsoon is the road, and the road is open.' },
    ],
    effects: ['travel:zanzibar'],
  },
  'c6.moosa.idle': {
    lines: [
      { who: 'Moosa', text: 'Cardamom in the sacks, rain on the tarpaulin, tea in the flask. Some inventories are simply a good day, counted.' },
    ],
  },

  // ---------------- Chasca, under the umbrella ----------------
  'c6.chasca.wait': {
    lines: [
      { who: 'Chasca', text: 'The soup-eater! Following me, or followed? The album refuses to say.' },
      { who: 'Chasca', text: 'No photograph yet. The sky here is loading its answer, and I intend to be under it when it argues. Come back when it does.' },
    ],
  },
  'c6.chasca.photo': {
    lines: [
      { text: 'She stands at the jetty’s end under a big black umbrella, dry as an idea, while the monsoon roars on the water around her.' },
      { who: 'Chasca', text: 'PERFECT. Stand there, rain behind you, channel silver, palms bowing. The album needs you mid-downpour, grinning like a local.' },
      { who: 'Chasca', text: 'Every chapter you stand where the land runs out. Have you noticed? Say fuzzy pickles!' },
    ],
    effects: ['set:met.chascaC6', 'set:photo.flash', 'set:photo.c6.jetty'],
  },
  'c6.chasca.album': {
    lines: [
      { who: 'Chasca', text: 'A star plain, a grey pier, and now a monsoon jetty. The album is becoming a weather report of one person’s luck.' },
      { who: 'Chasca', text: 'I develop them all at the end. Whose end? The journey decides these things, not me. I only press the button at the right seconds.' },
    ],
  },

  // ---------------- the post office ----------------
  'c6.post.pilar': {
    lines: [
      { text: 'The jetty office window is one plank, one stamp pad, and a ledger fat with monsoons. Mail waits under a tin of cardamom.' },
      { text: 'The clerk slides over an envelope in handwriting you would recognize underwater: an invoice wearing a stamp.' },
    ],
    effects: ['letter:kochi.pilar'],
  },
  'c6.post.hana': {
    lines: [
      { text: 'The clerk holds up one finger, checks the ledger twice, and produces a second envelope, postmarked with a small inland sea.' },
    ],
    effects: ['letter:kochi.hana'],
  },
  'c6.post.idle': {
    lines: [
      { text: 'JETTY OFFICE, says the board. Below, chalked: BOAT WHEN IT COMES. RAIN WHEN IT LIKES. The chalk has been rained on and rewritten many times.' },
    ],
  },

  // ---------------- examines: new kinds ----------------
  'c6.ex.paddy': {
    lines: [
      { text: 'A flooded field of young pokkali rice, tall and unbothered with its feet in brackish water. After harvest, the tide farms prawns here.' },
      { text: 'One field, two harvests, no chemicals. The farmer’s summary is shorter: the field works both shifts.' },
    ],
    effects: ['journal:customs.pokkali'],
  },
  'c6.ex.laterite': {
    lines: [{ text: 'Laterite: the red road of the coast. It stains hems, football knees, and the rain runoff, all the same proud color.' }],
  },
  'c6.ex.palm': {
    lines: [
      { text: 'A coconut palm leans the way sixty years of wind suggested. Everything on it is used: nut, husk, frond, sap, shade.' },
    ],
  },
  'c6.ex.banana': {
    lines: [{ text: 'Banana leaves wide as tables, which is exactly what they will become. One is torn; the wind eats first.' }],
  },
  'c6.ex.vallam': {
    lines: [
      { text: 'A vallam hauled out on the bank, planks stitched with coconut rope. The backwater’s bicycle: school runs, vegetables, one priest at a time.' },
    ],
  },
  'c6.ex.kettuvallam': {
    lines: [
      { text: 'A kettuvallam, the tied boat: anjili wood and bamboo lashed with coir, famously no nails. It hauled rice for generations.' },
      { text: 'Most of its cousins carry tourists now. The neighbors have opinions about this, and the opinions are not unanimous.' },
    ],
  },
  'c6.ex.coirrack': {
    lines: [
      { text: 'Golden rope drying on the rack, spun from husk that soaked six months in the canal. Patience, with a product.' },
    ],
  },
  'c6.ex.stall': {
    lines: [
      { text: 'The thattukada: kettle, glasses, griddle, awning. A complete civilization in four square meters, open early and late.' },
    ],
  },
  'c6.ex.mural': {
    lines: [
      { text: 'A whitewashed wall doing its two jobs: holding up a tiled coping, and holding forth. A red flag on one panel, an open book on the other.' },
      { text: 'The book pours out little painted readers. Someone retouches it every year before the rains, first the book, then the flag.' },
    ],
  },
  'c6.ex.veedu': {
    lines: [
      { text: 'A tile-roofed veedu, painted with Gulf wages and washed by every monsoon since. The deep eaves mean the sky here is taken seriously.' },
    ],
  },
  'c6.ex.shaap': {
    lines: [
      { text: 'A modest board: KALLU SHAAP. The toddy shed keeps a polite distance from the church, the temple, and most afternoons.' },
    ],
  },
  'c6.ex.aduppu': {
    lines: [
      { text: 'The aduppu: a clay hearth burning coconut husk and shell. The smoke has seasoned the rafters, the pots, and the family stories.' },
    ],
  },
  // ---------------- examines: shared kinds, this map's voice ----------------
  'c6.ex.water': {
    lines: [
      { text: 'The channel is the street. Green glass water, frog opinions at dusk, and a stillness between rains that feels deliberate.' },
    ],
  },
  'c6.ex.pier': {
    lines: [{ text: 'Jetty planks, silvered by sun and fattened by rain, in strict annual alternation. They give slightly, like a handshake.' }],
  },
  'c6.ex.door': {
    lines: [
      { text: 'Latched, not locked. The umbrella by the step says everything about the season; the doormat says WELCOME in two scripts.' },
    ],
  },
  'c6.ex.pot': {
    lines: [{ text: 'A clay pot of kallu, sweet this morning, sour by dark. It keeps toddy time, the strictest clock in the village.' }],
  },
  'c6.ex.pot.kitchen': {
    lines: [{ text: 'The meen curry pot, resting. Day-two curry outranks day-one curry, and everyone in this kitchen knows the hierarchy.' }],
  },
  'c6.ex.shrub': {
    lines: [{ text: 'Pandanus thicket, spiny and satisfied. It hems the village the way commas hem a long sentence.' }],
  },
  'c6.ex.bench': {
    lines: [{ text: 'The chaya bench. Load rating: three philosophers, or four football arguments, or one traveler with questions.' }],
  },
  'c6.ex.farol': {
    lines: [{ text: 'A lamp on a pole, wired with hope and tape. In the rain its light goes soft, a candle inside a waterfall.' }],
  },
  'c6.ex.tuft': {
    lines: [{ text: 'Grass fat with the coming rain. Even the weeds here look like they eat well.' }],
  },
  'c6.ex.wallint': {
    lines: [{ text: 'Smoke-cured walls, a calendar from a rice mill, and a framed photograph of Joseph in his crisp merchant navy whites.' }],
  },
  'c6.ex.shelf': {
    lines: [{ text: 'Steel tins in parade order: chili, coriander, turmeric, and a kudampuli tin that outranks the others by smell alone.' }],
  },
  'c6.ex.mat': {
    lines: [{ text: 'Woven mats where the sadya guests will sit. The floor is furniture here; it has always been enough.' }],
  },
};

/** Examine arms: new kinds get untagged fallbacks, shared kinds speak only on this map. */
export const KERALA_EXAMINES: Record<string, ExamineArm[]> = {
  paddy: [{ node: 'c6.ex.paddy' }],
  laterite: [{ node: 'c6.ex.laterite' }],
  palm: [{ node: 'c6.ex.palm' }],
  banana: [{ node: 'c6.ex.banana' }],
  vallam: [{ node: 'c6.ex.vallam' }],
  kettuvallam: [{ node: 'c6.ex.kettuvallam' }],
  coirrack: [{ node: 'c6.ex.coirrack' }],
  thattukada: [{ node: 'c6.ex.stall' }],
  muralwall: [{ node: 'c6.ex.mural' }],
  veedu: [{ node: 'c6.ex.veedu' }],
  shaapsign: [{ node: 'c6.ex.shaap' }],
  aduppu: [{ node: 'c6.ex.aduppu' }],
  postsign: [
    { when: { not: ['letter.read.kochi.pilar'] }, node: 'c6.post.pilar' },
    { when: { has: ['letter.read.kochi.pilar'], not: ['letter.read.kochi.hana'] }, node: 'c6.post.hana' },
    { node: 'c6.post.idle' },
  ],
  water: [{ map: 'kerala', node: 'c6.ex.water' }],
  pierdeck: [{ map: 'kerala', node: 'c6.ex.pier' }],
  doorShut: [{ map: 'kerala', node: 'c6.ex.door' }],
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
};

/** Event-triggered nodes, listed with their gating so tests can walk them. */
export const KERALA_EVENTS = [
  { node: 'c6.arrive' },
  { when: { has: ['c6.row.start'] }, node: 'c6.rowed' },
  { when: { has: ['c6.sadya.start'] }, node: 'c6.sadya.served' },
];
