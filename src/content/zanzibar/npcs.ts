import type { ExamineArm, NodeMap, NpcDef } from '../schema';

/**
 * Fukoni's people. Swahili by ear: karibu, pole, pole pole, habari all the
 * way down. Rules unchanged from every coast before: nobody lectures, the
 * wrong branch is the warmer scene, two short sentences, and the whole
 * chapter runs at the speed of the tide, which is the point.
 */

export const ZANZIBAR_NPCS: NpcDef[] = [
  {
    id: 'rashid',
    name: 'Mzee Rashid',
    map: 'zanzibar',
    // At dawn the bench is empty: the goodbye is what he leaves on it.
    when: { not: ['c7.dawn'] },
    pos: [15, 11],
    range: 0,
    look: {
      skin: '#6b4a32',
      hair: '#d8d3c8',
      cloth: '#f2ead8',
      stripe: '#c9a35f',
      hat: '#e8dcc4',
      hatStyle: 'none',
    },
    entry: [
      { when: { not: ['c7.met.rashid'] }, node: 'c7.rashid.hello' },
      { when: { has: ['c7.met.rashid'], not: ['c7.greeting'] }, node: 'c7.rashid.ladder' },
      { when: { has: ['c7.greeting'], not: ['c7.baraza.sat'] }, node: 'c7.rashid.sit' },
      { when: { has: ['c7.baraza.sat'], not: ['c7.rashid.past'] }, node: 'c7.rashid.coffee' },
      // The bench remembers her. Earned by the coffee, which is earned by
      // sitting twice: he tells it to people who have stopped being visitors.
      { when: { has: ['c7.rashid.past'], not: ['c7.rashid.her'] }, node: 'c7.rashid.her' },
      { node: 'c7.rashid.idle' },
    ],
  },
  {
    id: 'amina',
    name: 'Bi Amina',
    map: 'kangashop',
    when: { not: ['c7.dawn'] },
    pos: [5, 2],
    range: 1,
    look: {
      skin: '#7a5138',
      hair: '#241a12',
      cloth: '#c1512f',
      stripe: '#f2e6d0',
      hat: '#e8dcc4',
      hatStyle: 'none',
      skirt: '#3f7fb0',
    },
    entry: [
      { when: { has: ['keepsake.band'], not: ['c7.met.amina'] }, node: 'c7.amina.band' },
      { when: { not: ['c7.met.amina'] }, node: 'c7.amina.first' },
      { when: { has: ['c7.met.amina'], not: ['c7.kanga.game'] }, node: 'c7.amina.game0' },
      { when: { has: ['c7.kanga.game'], not: ['c7.kanga.done'] }, node: 'c7.amina.pair' },
      { node: 'c7.amina.idle' },
    ],
  },
  {
    id: 'juma',
    name: 'Juma',
    map: 'zanzibar',
    when: { not: ['c7.dawn'] },
    pos: [10, 3],
    range: 1,
    look: {
      skin: '#5f4128',
      hair: '#241a12',
      cloth: '#4d7440',
      stripe: '#c9a35f',
      hat: '#e8dcc4',
      hatStyle: 'none',
    },
    entry: [
      { when: { not: ['c7.met.juma'] }, node: 'c7.juma.first' },
      { when: { has: ['c7.met.juma'], not: ['c7.saa'] }, node: 'c7.juma.late' },
      { when: { has: ['c7.saa'], not: ['c7.juma.cardamom'] }, node: 'c7.juma.mats' },
      { node: 'c7.juma.idle' },
    ],
  },
  {
    id: 'zuberi',
    name: 'Zuberi',
    map: 'zanzibar',
    when: { not: ['c7.dawn'] },
    pos: [40, 14],
    range: 1,
    look: {
      skin: '#6b4a32',
      hair: '#1c1410',
      cloth: '#c98a2e',
      stripe: '#f2e6d0',
      hat: '#e8dcc4',
      hatStyle: 'none',
    },
    entry: [
      { when: { not: ['c7.met.zuberi'] }, node: 'c7.zuberi.first' },
      { when: { has: ['c7.met.zuberi'], not: ['c7.zuberi.dusk'] }, node: 'c7.zuberi.dusk' },
      { when: { has: ['page.dishes.urojo'], not: ['c7.cook.done'] }, node: 'c7.zuberi.apron' },
      { when: { has: ['c7.cook.done'] }, node: 'c7.zuberi.cookAgain' },
      { node: 'c7.zuberi.idle' },
    ],
  },
  {
    id: 'salma',
    name: 'Mama Salma',
    map: 'zanzibar',
    when: { not: ['c7.dawn'] },
    pos: [10, 26],
    range: 1,
    look: {
      skin: '#7a5138',
      hair: '#241a12',
      cloth: '#3c6e64',
      stripe: '#f2e6d0',
      hat: '#e8dcc4',
      hatStyle: 'none',
      skirt: '#8a4a7d',
    },
    entry: [
      { when: { not: ['c7.met.salma'] }, node: 'c7.salma.first' },
      { when: { has: ['c7.met.salma'], not: ['c7.salma.helped'] }, node: 'c7.salma.again' },
      { when: { has: ['c7.salma.helped'], not: ['c7.salma.warm'] }, node: 'c7.salma.warm' },
      { node: 'c7.salma.idle' },
    ],
  },
  {
    id: 'issa',
    name: 'Fundi Issa',
    map: 'zanzibar',
    when: { not: ['c7.dawn'] },
    pos: [30, 21],
    range: 1,
    look: {
      skin: '#5f4128',
      hair: '#6b655c',
      cloth: '#5c6e77',
      stripe: '#d0b276',
      hat: '#e8dcc4',
      hatStyle: 'none',
    },
    entry: [
      { when: { not: ['c7.met.issa'] }, node: 'c7.issa.first' },
      { when: { has: ['c7.met.issa'], not: ['c7.issa.winds'] }, node: 'c7.issa.second' },
      { node: 'c7.issa.idle' },
    ],
  },
  {
    id: 'bakari',
    name: 'Kapteni Bakari',
    map: 'zanzibar',
    when: { not: ['c7.dawn'] },
    pos: [40, 16],
    range: 0,
    look: {
      skin: '#6b4a32',
      hair: '#cfc8ba',
      cloth: '#2c3e57',
      stripe: '#e8dcc4',
      hat: '#e8dcc4',
      hatStyle: 'none',
    },
    entry: [
      { when: { not: ['c7.met.bakari'] }, node: 'c7.bakari.first' },
      { when: { has: ['c7.met.bakari'], not: ['c7.sail.ok'] }, node: 'c7.bakari.sail' },
      { when: { has: ['c7.sail.ok'], not: ['c7.bakari.props'] }, node: 'c7.bakari.praise' },
      { when: { has: ['c7.sail.ok'] }, node: 'c7.bakari.sailAgain' },
      { node: 'c7.bakari.idle' },
    ],
  },
  {
    id: 'ali',
    name: 'Ali',
    map: 'zanzibar',
    when: { not: ['c7.dawn'] },
    pos: [37, 21],
    range: 0,
    look: {
      skin: '#8a5c3a',
      hair: '#2e2018',
      cloth: '#e8dcc4',
      stripe: '#5c6e77',
      hat: '#e8dcc4',
      hatStyle: 'none',
    },
    entry: [
      { when: { not: ['c7.met.ali'] }, node: 'c7.ali.first' },
      {
        when: { has: ['c7.sail.ok', 'c7.kanga.done', 'c7.greeting', 'c7.baraza.sat', 'c7.rashid.her'], not: ['c7.dawn'] },
        node: 'c7.ali.book',
      },
      { node: 'c7.ali.not' },
    ],
  },
  {
    // Her look is her look, everywhere; a captain does not change.
    id: 'riosC7',
    name: 'Capitana Ríos',
    map: 'zanzibar',
    when: { has: ['c7.arrived'], not: ['c7.complete', 'c7.dawn'] },
    pos: [39, 23],
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
      { when: { not: ['c7.rios.met'] }, node: 'c7.rios.hello' },
      { when: { has: ['c7.rios.met'], not: ['c7.rios.sat'] }, node: 'c7.rios.bench' },
      { node: 'c7.rios.idle' },
    ],
  },
  {
    id: 'chascaC7',
    name: 'Chasca',
    map: 'zanzibar',
    when: { not: ['c7.dawn'] },
    pos: [24, 11],
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
      { when: { not: ['c7.met.chasca'] }, node: 'c7.chasca.door' },
      { node: 'c7.chasca.again' },
    ],
  },
  {
    // Awake too early, in the carved doorway. She never says a word.
    id: 'mtotoC7',
    name: 'A girl in a doorway',
    map: 'zanzibar',
    when: { has: ['c7.dawn'] },
    pos: [24, 11],
    range: 0,
    look: {
      skin: '#6b4a32',
      hair: '#1c1410',
      cloth: '#c98a2e',
      stripe: '#f2e6d0',
      hat: '#e8dcc4',
      hatStyle: 'none',
      skirt: '#3f7fb0',
      kid: true,
    },
    entry: [
      { when: { not: ['c7.waved'] }, node: 'c7.dawn.child' },
      { node: 'c7.dawn.child2' },
    ],
  },
];

export const ZANZIBAR_NODES: NodeMap = {
  // The walls themselves; without this arm they fall through to the
  // village's adobe line, which reads strangely far from the altiplano.
  'c7.ex.wall': {
    lines: [{ text: 'Coral rag under lime: the reef, standing up as a wall.' }],
  },
  // ---------------- arrival ----------------
  'c7.arrive': {
    lines: [
      { text: 'Twelve days out of Bombay, then the last hour under sail: a jahazi, borrowed wind, a coast the color of bone and palm.' },
      { text: 'The tide is out; the sea has stepped back half a mile. Nobody hurries to meet you. Somebody waves anyway: karibu, come near.' },
    ],
    effects: ['set:c7.arrived'],
  },

  // ---------------- Mzee Rashid, the baraza ----------------
  'c7.rashid.hello': {
    lines: [
      { text: 'An old man sits on the stone bench built into his house front, as if the house grew him.' },
      { who: 'Mzee Rashid', text: 'Habari za asubuhi? How is your morning?' },
    ],
    effects: ['set:c7.met.rashid', 'journal:people.rashid'],
    choices: [
      { text: '"Nzuri, mzee. And yours?"', goto: 'c7.rashid.l2' },
      { text: '"Good, thanks. I need to arrange a passage north."', goto: 'c7.rashid.restart' },
    ],
  },
  'c7.rashid.ladder': {
    lines: [
      { text: 'The greeting resumes exactly where it must: the beginning.' },
      { who: 'Mzee Rashid', text: 'Habari za asubuhi?' },
    ],
    choices: [
      { text: '"Nzuri, mzee. And yours?"', goto: 'c7.rashid.l2' },
      { text: '"Nzuri. Listen, about the harbor..."', goto: 'c7.rashid.restart' },
    ],
  },
  'c7.rashid.l2': {
    lines: [{ who: 'Mzee Rashid', text: 'Nzuri sana. Habari za safari? How was the road that brought you?' }],
    choices: [
      { text: '"Long, and kind. Habari za nyumbani?"', goto: 'c7.rashid.l3' },
      { text: '"Fine, fine. So, the boats..."', goto: 'c7.rashid.restart' },
    ],
  },
  'c7.rashid.l3': {
    lines: [{ who: 'Mzee Rashid', text: 'Ah, you ask back! Nyumbani is well. And the home you carry with you, mgeni?' }],
    choices: [
      { text: 'Tell him about a stone village far uphill, slowly', goto: 'c7.rashid.earned' },
      { text: '"Complicated. Is that the time?"', goto: 'c7.rashid.restart' },
    ],
  },
  'c7.rashid.earned': {
    lines: [
      { who: 'Mzee Rashid', text: 'Hm. A grandmother’s road. A good reason to be in no hurry at all.' },
      { who: 'Mzee Rashid', text: 'You greeted all the way down. Most quit at the first nzuri. Karibu kijijini.' },
    ],
    effects: ['set:c7.greeting', 'journal:words.habari'],
  },
  'c7.rashid.restart': {
    lines: [
      { text: 'He settles deeper and begins again from the top.' },
      { who: 'Mzee Rashid', text: 'Habari za asubuhi? The greeting is not the door, mgeni. The greeting is the house.' },
    ],
  },
  'c7.rashid.sit': {
    lines: [{ who: 'Mzee Rashid', text: 'Sit. This bench has held four generations of news. It can hold your errands too.' }],
    choices: [
      { text: 'Sit down on the baraza', goto: 'c7.rashid.sat' },
      { text: '"Maybe later. I have a list."', goto: 'c7.rashid.hurry' },
    ],
  },
  'c7.rashid.hurry': {
    lines: [{ who: 'Mzee Rashid', text: 'Pole pole, mgeni. The list will keep. You are the only part of it that can spoil.' }],
  },
  // The sitting is the player's to keep or break.
  'c7.rashid.sat': {
    lines: [{ text: 'You sit. Nothing happens. A cat crosses; a door opens two houses down, and closes.' }],
    choices: [
      { text: 'Get up; you have a list', goto: 'c7.rashid.sat.rise' },
      { text: 'Keep sitting', goto: 'c7.rashid.sat.stay' },
    ],
  },
  'c7.rashid.sat.rise': {
    lines: [
      { text: 'His hand lands light on your arm, no weight in it at all.' },
      { who: 'Mzee Rashid', text: 'Pole pole ndio mwendo. Slowly, slowly is the way to go.' },
    ],
    next: 'c7.rashid.sat.end',
  },
  'c7.rashid.sat.stay': {
    lines: [
      { text: 'You stay. After a while he nods, as if you had said something.' },
      { who: 'Mzee Rashid', text: 'Pole pole ndio mwendo, mgeni.' },
    ],
    next: 'c7.rashid.sat.end',
  },
  'c7.rashid.sat.end': {
    lines: [{ text: 'The second sitting is easier. Down the lane, the morning agrees to pass by itself.' }],
    effects: ['set:c7.baraza.sat', 'journal:words.polepole', 'journal:customs.baraza'],
  },
  'c7.rashid.coffee': {
    lines: [
      { text: 'A boy brings kahawa in a tall brass pot. Rashid hands you a cup like a thimble.' },
      { who: 'Mzee Rashid', text: 'My grandfather was sold through this island. I say it once, so you know what the stone remembers. We do not make a museum of this bench.' },
      { who: 'Mzee Rashid', text: 'Now drink slowly. The cup is small so that the sitting is long.' },
    ],
    effects: ['set:c7.rashid.past'],
  },
  /**
   * Beat eight of the Her thread: the first crack in the myth. He is not
   * telling you anything, he is passing the time, and the sentence he repeats
   * has an ending he does not know and you do.
   */
  'c7.rashid.her': {
    lines: [
      { text: 'He shifts a hand-width along the bench, following the shade.' },
      { who: 'Mzee Rashid', text: 'Bi Zoila sat on that end through a season of long rains. That same red thread on the spine.' },
      { who: 'Mzee Rashid', text: 'One evening she said she might not go home, and nobody argued. People say that on this bench, and one or two mean it.' },
    ],
    choices: [
      { text: 'Say nothing.', goto: 'c7.rashid.her.quiet' },
      { text: '"Did she mean it?"', goto: 'c7.rashid.her.meant' },
    ],
  },
  'c7.rashid.her.quiet': {
    lines: [{ text: 'You look down the lane with him. The shade moves another hand-width.' }],
    next: 'c7.rashid.her2',
  },
  'c7.rashid.her.meant': {
    lines: [{ who: 'Mzee Rashid', text: 'The bench does not ask, mgeni. It only keeps the sitting.' }],
    next: 'c7.rashid.her2',
  },
  'c7.rashid.her2': {
    lines: [{ text: 'The lane goes on being the lane. The red thread on the spine is the same red thread.' }],
    effects: ['set:c7.rashid.her', 'journal:her.zanzibar'],
  },
  'c7.rashid.idle': {
    lines: [{ who: 'Mzee Rashid', text: 'The tide is out. It will come in. Between those two facts a person can live a whole good life, mgeni.' }],
  },

  // ---------------- the dawn: nobody says goodbye ----------------
  /**
   * The coast lets you go the way it let you in: without hurry and without
   * speeches. Ali books the dawn tide; the night passes in one fade; the lane
   * is empty, the bench is empty, and what is left on it says the rest.
   */
  'c7.dawn.go': {
    lines: [{ text: 'Ali writes your name in the ledger. You sleep above the counter, the tide loud under the floor.' }],
    effects: ['set:c7.dawn', 'travel:zanzibar,15,10,left'],
  },
  'c7.dawn.bench': {
    lines: [
      { text: 'First light. Every door on the lane is shut, and the baraza is empty.' },
      { text: 'At Rashid’s end of the bench the ginger cat sleeps on a folded kanga left for you. You slide it out; she allows it.' },
      { text: 'Along the hem: Haraka haraka haina baraka. Hurry, hurry has no blessing.' },
    ],
    effects: ['set:c7.complete', 'journal:words.haraka'],
  },
  'c7.dawn.cat': {
    lines: [{ text: 'The cat has the whole bench now.' }],
  },
  'c7.dawn.child': {
    lines: [
      { text: 'A small girl stands in the carved doorway, awake too early. She lifts one hand and waves.' },
      { text: 'You wave back. Neither of you says a word.' },
    ],
    effects: ['set:c7.waved'],
  },
  'c7.dawn.child2': {
    lines: [{ text: 'She is still in the doorway, watching the lane.' }],
  },
  'c7.dawn.jetty': {
    lines: [{ text: 'The freighter’s launch waits at the end of the jetty, engine ticking. Behind you the village sleeps on.' }],
    choices: [
      { text: 'Step down into the launch', goto: 'c7.ali.sail' },
      { text: 'One more look at the lane', goto: 'c7.dawn.stay' },
    ],
  },
  'c7.dawn.stay': {
    lines: [{ text: 'The lane holds still for you. The tide does not; it is already turning.' }],
  },

  // ---------------- Bi Amina, the kanga shop ----------------
  'c7.amina.band': {
    lines: [
      { who: 'Bi Amina', text: 'Karibu! Wait. Your wrist. Who wrote you?' },
      { who: 'Bi Amina', text: 'Rows like these are a village saying itself. I sell printed sentences; you have been wearing a woven one.' },
    ],
    effects: ['set:c7.met.amina', 'journal:people.amina', 'journal:words.karibu'],
    next: 'c7.amina.welcome',
  },
  'c7.amina.first': {
    lines: [
      { text: 'A single cool room, lined floor to ceiling with folded color.' },
      { who: 'Bi Amina', text: 'Karibu! Come near. Mgeni ni kuku mweupe: a guest is a white chicken. Everyone will notice you, so you may as well be fed.' },
    ],
    effects: ['set:c7.met.amina', 'journal:people.amina', 'journal:words.karibu'],
    next: 'c7.amina.welcome',
  },
  'c7.amina.welcome': {
    lines: [
      { text: 'Mandazi arrives, cardamom-sweet and hot, with ginger tea that bites back kindly.' },
      { who: 'Bi Amina', text: 'Eat. Then we discuss what the cloth has to say about you.' },
    ],
    effects: ['journal:dishes.mandazi', 'journal:dishes.chaitangawizi'],
    choices: [
      { text: 'Ask why the cloths have writing on them', goto: 'c7.amina.speaks' },
      { text: 'Eat first. Talk after.', goto: 'c7.amina.eatfirst' },
    ],
  },
  'c7.amina.speaks': {
    lines: [
      { who: 'Bi Amina', text: 'Every kanga carries a jina, a saying along the hem. Wear the right one near the right person, and everything is said.' },
      { who: 'Bi Amina', text: 'No shouting, no witnesses. It is the politest sharp thing ever invented.' },
    ],
  },
  'c7.amina.eatfirst': {
    lines: [{ who: 'Bi Amina', text: 'A guest who eats first was raised properly. The cloth is patient.' }],
  },
  'c7.amina.game0': {
    lines: [{ who: 'Bi Amina', text: 'Back again! Before I sell you anything, we play. I describe the day; you choose the kanga that answers it.' }],
    next: 'c7.amina.r1',
  },
  'c7.amina.r1': {
    lines: [{ who: 'Bi Amina', text: 'First: my cousin arrives from Pemba tomorrow, her first visit in years. Which kanga by the door?' }],
    choices: [
      // The answer moves around between rounds; always-first taught nothing.
      { text: '"Akili ni mali. Wits are wealth."', goto: 'c7.amina.r1n1' },
      { text: '"Mgeni ni kuku mweupe. A guest is a white chicken."', goto: 'c7.amina.r1y' },
      { text: '"Mapenzi ni kikohozi. Love is a cough."', goto: 'c7.amina.r1n2' },
    ],
  },
  'c7.amina.r1y': {
    lines: [{ who: 'Bi Amina', text: 'Eee! Yes. The white chicken stands out in the flock, so she is treated as special. My cousin will be fed until she complains.' }],
    next: 'c7.amina.r2',
  },
  'c7.amina.r1n1': {
    lines: [{ who: 'Bi Amina', text: 'WITS ARE WEALTH, for my cousin? She will hear me calling her poor and foolish in one cloth! Again.' }],
    next: 'c7.amina.r1',
  },
  'c7.amina.r1n2': {
    lines: [{ who: 'Bi Amina', text: 'Love is a cough, for my COUSIN? The lane would talk for a month. A guest stands out, mgeni. Again.' }],
    next: 'c7.amina.r1',
  },
  'c7.amina.r2': {
    lines: [{ who: 'Bi Amina', text: 'Second: the fish seller walks past the tailor’s daughter twice a day, for no fish reason. Which kanga does his mother wear?' }],
    choices: [
      { text: '"Mgeni ni kuku mweupe. A guest is a white chicken."', goto: 'c7.amina.r2n1' },
      { text: '"Mkono wa Mungu. The hand of God."', goto: 'c7.amina.r2n2' },
      { text: '"Mapenzi ni kikohozi. Love is a cough."', goto: 'c7.amina.r2y' },
    ],
  },
  'c7.amina.r2y': {
    lines: [{ who: 'Bi Amina', text: 'Mapenzi ni kikohozi, hayawezi kufichika! Love is a cough; it cannot be hidden. She says nothing, and the street is informed.' }],
    next: 'c7.amina.r3',
  },
  'c7.amina.r2n1': {
    lines: [{ who: 'Bi Amina', text: 'A white chicken? The boy is not a guest, he is a symptom! Again.' }],
    next: 'c7.amina.r2',
  },
  'c7.amina.r2n2': {
    lines: [{ who: 'Bi Amina', text: 'God has better things to do than the fish seller’s heart. Though not much better. Again.' }],
    next: 'c7.amina.r2',
  },
  'c7.amina.r3': {
    lines: [{ who: 'Bi Amina', text: 'Last: my neighbor got a new roof and now explains money at the well. Which kanga do I wear for water?' }],
    choices: [
      { text: '"A guest is a white chicken."', goto: 'c7.amina.r3n1' },
      { text: '"Love is a cough."', goto: 'c7.amina.r3n2' },
      { text: '"Akili ni mali. Wits are wealth."', goto: 'c7.amina.matched' },
    ],
  },
  'c7.amina.r3n1': {
    lines: [{ who: 'Bi Amina', text: 'She is not a guest; she is a neighbor, which is a life sentence! Again.' }],
    next: 'c7.amina.r3',
  },
  'c7.amina.r3n2': {
    lines: [{ who: 'Bi Amina', text: 'Love is a cough, for HER? That would start a story neither of us could afford. Again.' }],
    next: 'c7.amina.r3',
  },
  'c7.amina.matched': {
    lines: [
      { who: 'Bi Amina', text: 'AKILI NI MALI! Wits are wealth! I say nothing, I fetch my water, and her roof gets smaller with every step.' },
      { who: 'Bi Amina', text: 'You can hear cloth, mgeni. Come back and I will sell you words worth wearing.' },
    ],
    effects: ['set:c7.kanga.game'],
  },
  'c7.amina.pair': {
    lines: [
      { text: 'She pulls out a pair: sea-blue and rust, still joined as one long cloth.' },
      { who: 'Bi Amina', text: 'Kangas are born in pairs. One you cut and wear. The other is not yours, mgeni; it is for giving away.' },
    ],
    effects: ['set:c7.kanga.done', 'set:kanga.gift', 'journal:customs.kanga'],
    choices: [
      {
        text: '"Where I started, the sayings are woven in, not printed."',
        goto: 'c7.amina.pallay',
        when: { has: ['page.customs.pallay'] },
      },
      { text: 'Ask what your kanga says', goto: 'c7.amina.jina' },
    ],
  },
  'c7.amina.pallay': {
    lines: [{ who: 'Bi Amina', text: 'Woven in! So the cloth speaks there too, in thread instead of ink.' }],
    next: 'c7.amina.jina',
  },
  'c7.amina.jina': {
    lines: [{ who: 'Bi Amina', text: 'Yours says: Mkono wa Mungu hakuna wa kuushinda. No one can overcome the hand of God. For a traveler, that is a seatbelt.' }],
  },
  'c7.amina.idle': {
    lines: [{ who: 'Bi Amina', text: 'Wear the one; keep the other folded. When you meet the person it belongs to, the cloth will lean.' }],
  },

  // ---------------- Juma, the spice-farm edge ----------------
  'c7.juma.first': {
    lines: [
      { text: 'The lane ends in green: pepper vines up the palms, and mats of rust-red cloves drying by the path.' },
      { who: 'Juma', text: 'Mind the mats, mgeni! Come back at saa mbili and help me rake. Saa mbili sharp.' },
    ],
    effects: ['set:c7.met.juma', 'journal:people.juma'],
  },
  'c7.juma.late': {
    lines: [
      { text: 'You arrive at two in the afternoon. Juma is asleep in the shade; the mats are already raked.' },
      { who: 'Juma', text: 'Saa mbili, mgeni! Hour two! The day starts at sunrise here, so hour two is eight in the morning.' },
      { who: 'Juma', text: 'You are not late. You are six hours sideways. Tomorrow, saa mbili.' },
    ],
    effects: ['set:c7.saa', 'journal:customs.swahilitime'],
  },
  'c7.juma.mats': {
    lines: [
      { text: 'Saa mbili, sunrise math. The mats are full, and the raking has a rhythm.' },
      { who: 'Juma', text: 'These buds went to weddings in Bombay and coffee in Muscat before either of us had grandfathers.' },
    ],
    effects: ['set:c7.juma.cardamom'],
    choices: [
      {
        text: '"Cardamom. These pods were in every glass of chaya in Kerala."',
        goto: 'c7.juma.kerala',
        when: { has: ['page.words.chaya'] },
      },
      { text: 'Ask about the little green pods', goto: 'c7.juma.pods' },
    ],
  },
  'c7.juma.kerala': {
    lines: [{ who: 'Juma', text: 'You drank it in the hills it comes from! Same pod, same wind as your ship. Kerala, Oman, here: one kitchen, three coastlines.' }],
  },
  'c7.juma.pods': {
    lines: [{ who: 'Juma', text: 'Cardamom. Crush one and your tea grows a second opinion. It crossed from India with the wind, like the doors and the pilau.' }],
  },
  'c7.juma.idle': {
    lines: [{ who: 'Juma', text: 'The spice tours photograph the vanilla. The farming is before and after the photograph.' }],
  },

  // ---------------- Zuberi, the urojo cart ----------------
  'c7.zuberi.first': {
    lines: [
      { text: 'A cart at the market corner, a vat of turmeric-gold soup, a man building each bowl like an argument.' },
      { who: 'Zuberi', text: 'Urojo. Potatoes, bhajia, chili, lime: sour, hot, crowded. The market, in a bowl.' },
    ],
    effects: ['set:c7.met.zuberi', 'journal:dishes.urojo'],
    choices: [
      {
        text: '"Sour soup as a cure. In Peru they call it sudado."',
        goto: 'c7.zuberi.sudado',
        when: { has: ['page.dishes.sudado'] },
      },
      { text: 'Ask why it is sour', goto: 'c7.zuberi.cure' },
    ],
  },
  'c7.zuberi.sudado': {
    lines: [{ who: 'Zuberi', text: 'Peru knows! Sour is the cure, mgeni. Every coast keeps one pot like this.' }],
  },
  'c7.zuberi.cure': {
    lines: [{ who: 'Zuberi', text: 'Sour wakes you. Mango, lime, tamarind: the pot for long nights, long roads, long faces.' }],
  },
  'c7.zuberi.dusk': {
    lines: [
      { text: 'Dusk. The corner lamps kindle one by one.' },
      { who: 'Zuberi', text: 'Tonight, pweza wa nazi: octopus off the flats, in coconut curry. The real food of this island.' },
      { who: 'Zuberi', text: 'The next stall sells Zanzibar pizza. It is fine. It is from nowhere.' },
    ],
    effects: ['set:c7.zuberi.dusk', 'journal:dishes.pweza', 'journal:words.hamnashida'],
    choices: [
      { text: '"Hakuna matata, then?"', goto: 'c7.zuberi.hamna' },
      { text: 'Just eat the pweza', goto: 'c7.zuberi.pweza' },
    ],
  },
  'c7.zuberi.hamna': {
    lines: [{ who: 'Zuberi', text: 'Ha! Real Swahili, but we sell that one to visitors now. Between us we say hamna shida. Watch your soup get cheaper.' }],
  },
  'c7.zuberi.pweza': {
    lines: [{ text: 'The octopus is tender in a way that suggests a private agreement with the coconut.' }],
  },
  'c7.zuberi.cookAgain': {
    lines: [{ who: 'Zuberi', text: 'The vat is full. The apron is on the cart handle.' }],
    choices: [
      { text: 'Tie the apron on again', when: { has: ['c7.cook.done'] }, goto: 'c7.zuberi.cookReplay' },
      { text: '"I am here to eat tonight, not to ladle."', goto: 'c7.zuberi.idle' },
    ],
  },
  'c7.zuberi.cookReplay': {
    lines: [{ who: 'Zuberi', text: 'No lesson this time. Feed them however you hear them, and I will describe the damage.' }],
    effects: ['set:replay.mode', 'set:c7.cook.start'],
  },
  'c7.zuberi.idle': {
    lines: [{ who: 'Zuberi', text: 'Come at dusk. The night market sells the day itself, warmed up.' }],
  },
  'c7.zuberi.apron': {
    lines: [
      { text: 'The lunch line thins. Zuberi unties the spare apron from the cart handle.' },
      { who: 'Zuberi', text: 'Watching is half of nothing, mgeni. Come behind the pot; the next bowls are yours.' },
    ],
    choices: [
      { text: 'Tie on the apron', goto: 'c7.zuberi.apron.go' },
      { text: '"Another tide."', goto: 'c7.zuberi.apron.wait' },
    ],
  },
  'c7.zuberi.apron.go': {
    // The corner's rules live in the howTo card; he keeps only his favorite part.
    lines: [{ who: 'Zuberi', text: 'The customer calls the bowl; you answer it.' }],
    effects: ['set:c7.cook.start'],
  },
  'c7.zuberi.apron.wait': {
    lines: [{ who: 'Zuberi', text: 'Haya. The vat and I keep the same hours: until it is finished.' }],
  },
  'c7.cook.finish': {
    lines: [
      { text: 'The vat steams down to its last gold inch. Your wrists smell of lime and turmeric.' },
      { who: 'Zuberi', text: 'Bhajia from India, mango from the farms, cassava from the mainland, lime off our trees. Everything that anchors here ends up in the pot.' },
    ],
    effects: ['clear:c7.cook.start', 'set:c7.cook.done'],
  },

  // ---------------- Mama Salma, the mwani rows ----------------
  'c7.salma.first': {
    lines: [
      { text: 'Staked lines run across the wet flats like stitched seams. A woman ties red bunches along them.' },
      { who: 'Mama Salma', text: 'Mwani. Seaweed. We plant at low tide, and the sea farms it while we sleep.' },
    ],
    effects: ['set:c7.met.salma', 'journal:people.salma'],
    choices: [
      { text: 'Help her carry the wet sack up the beach', goto: 'c7.salma.carry' },
      { text: 'Ask about the rows first', goto: 'c7.salma.rows' },
    ],
  },
  'c7.salma.rows': {
    lines: [{ who: 'Mama Salma', text: 'Tied at low tide, harvested at low tide. The moon is the foreman here.' }],
    choices: [{ text: 'Help her carry the wet sack up the beach', goto: 'c7.salma.carry' }],
  },
  'c7.salma.again': {
    lines: [{ who: 'Mama Salma', text: 'Back again? The sack will not walk itself up the beach, and my back has opinions today.' }],
    choices: [
      { text: 'Take the sack', goto: 'c7.salma.carry' },
      { text: '"Not right now."', goto: 'c7.salma.nomind' },
    ],
  },
  'c7.salma.nomind': {
    lines: [{ who: 'Mama Salma', text: 'Haya. The tide keeps my hours anyway.' }],
  },
  'c7.salma.carry': {
    lines: [{ text: 'The sack is heavier than the sea smell suggests. You haul it past the tide line.' }],
    effects: ['set:c7.salma.helped'],
    next: 'c7.salma.carry2',
  },
  'c7.salma.carry2': {
    lines: [{ who: 'Mama Salma', text: 'Asante sana. And pole for the carrying: we say pole for any burden. I see the weight, even if I cannot take it.' }],
    effects: ['journal:words.asante', 'journal:words.pole'],
  },
  'c7.salma.warm': {
    lines: [
      { who: 'Mama Salma', text: 'The rows nearest shore die soft now. The water warms, so we walk farther out each year.' },
      { who: 'Mama Salma', text: 'My daughter wants a boat and nets in the deep water. Maybe she is right.' },
    ],
    effects: ['set:c7.salma.warm', 'journal:customs.mwani'],
  },
  'c7.salma.idle': {
    lines: [{ who: 'Mama Salma', text: 'Low tide is my office hours. At high tide, find me at the market.' }],
  },

  // ---------------- Fundi Issa, shaping ribs ----------------
  'c7.issa.first': {
    lines: [
      { text: 'A man bends a rib of mango wood over his knee, an outrigger hull beside him.' },
      { who: 'Fundi Issa', text: 'Ngalawa. One mango trunk, two arms, so the sea cannot flip her without asking twice.' },
      { who: 'Fundi Issa', text: 'The hull rots, mgeni. Every hull. So the boat is not the heirloom; the knowing how is.' },
    ],
    effects: ['set:c7.met.issa', 'journal:people.dhowbuilder', 'journal:customs.dhowknowledge'],
  },
  'c7.issa.second': {
    // The two-wind calendar moved onto the anchored jahazi (c7.ex.dhow.winds).
    lines: [
      { who: 'Fundi Issa', text: 'My master learned at Nungwi: keel first, no drawings. I learned by being wrong slowly.' },
      { who: 'Fundi Issa', text: 'The year’s timetable is riding at anchor out there. Go and read her rig.' },
    ],
    effects: ['set:c7.issa.winds'],
  },
  'c7.issa.idle': {
    lines: [{ who: 'Fundi Issa', text: 'A boat on the sand is a promise, mgeni; the tide is the notary.' }],
  },

  // ---------------- Kapteni Bakari, the domino table ----------------
  /**
   * The welcome stays human and short. The pilau moved onto the pot behind
   * the bones (c7.ex.pilaupot, which grants the page); the pizza claim moved
   * to the stall griddle; the captains' bickering lives in the idle now.
   */
  'c7.bakari.first': {
    lines: [
      { text: 'Four retired captains around a table, dominoes going down like verdicts.' },
      { who: 'Kapteni Bakari', text: 'Sit, mgeni, watch. On Friday that pot serves pilau, and the table eats together or not at all.' },
    ],
    effects: ['set:c7.met.bakari'],
  },
  'c7.bakari.sail': {
    lines: [{ who: 'Kapteni Bakari', text: 'You keep looking at the water like it owes you a ride. Come; the ngalawa needs exercise.' }],
    choices: [
      { text: 'Step aboard', goto: 'c7.bakari.go' },
      { text: '"Another tide."', goto: 'c7.bakari.later' },
    ],
  },
  'c7.bakari.go': {
    // The teaching lives in the howTo card and on the trim rose; he just casts off.
    lines: [{ who: 'Kapteni Bakari', text: 'Kaskazi today, steady from the northeast. Hands on the sheet; I will mind the tiller and the laughing.' }],
    effects: ['set:c7.sail.start'],
  },
  'c7.bakari.later': {
    lines: [{ who: 'Kapteni Bakari', text: 'Haya. The wind is not offended. It has other appointments.' }],
  },
  'c7.sail.done': {
    lines: [
      { text: 'The jetty comes back to meet you. Your hands have learned a small permanent thing about wind.' },
      { who: 'Kapteni Bakari', text: 'You luffed, you listened, you fixed it. That is the whole trade, mgeni.' },
    ],
    effects: ['clear:c7.sail.start', 'set:c7.sail.ok', 'journal:customs.lateen'],
  },
  'c7.bakari.praise': {
    lines: [{ who: 'Kapteni Bakari', text: 'The telltale streamed. On a strange ship north, help in the galley and stay off the ropes.' }],
    effects: ['set:c7.bakari.props'],
  },
  'c7.bakari.sailAgain': {
    lines: [{ who: 'Kapteni Bakari', text: 'The kaskazi is working and the ngalawa is tied to a post. A waste of two good things.' }],
    choices: [
      { text: 'Take the ngalawa out again', when: { has: ['c7.sail.ok'] }, goto: 'c7.bakari.sailReplay' },
      { text: '"Another tide, kapteni."', goto: 'c7.bakari.idle' },
    ],
  },
  'c7.bakari.sailReplay': {
    lines: [{ who: 'Kapteni Bakari', text: 'Nothing to prove today. Only the wind and the long way back to the jetty.' }],
    effects: ['set:replay.mode', 'set:c7.sail.start'],
  },
  'c7.bakari.idle': {
    // The captains' pizza argument, demoted from the welcome to table talk.
    lines: [
      { who: 'Kapteni Suleiman', text: 'Zanzibar pizza, Bakari: old food, from the Sultan’s own kitchen.' },
      { who: 'Kapteni Bakari', text: 'Suleiman also remembers winning arguments he lost. Your bone, kapteni.' },
    ],
  },

  // ---------------- Ali, the shipping agent ----------------
  'c7.ali.first': {
    lines: [
      { text: 'A counter at the jetty root, a ledger, and a man who has recorded cargo through three currencies.' },
      // Timeline note: the Suez Canal reopened on 1975-06-05 after eight years
      // closed. Her passage north through it is deliberately after that date,
      // which is why her margins run out of 1974 and into 1975 on this coast.
      { who: 'Ali', text: 'Deck passage north, through Suez? Ships call twice a month. But this coast is not finished with you yet.' },
    ],
    effects: ['set:c7.met.ali'],
  },
  'c7.ali.not': {
    lines: [{ who: 'Ali', text: 'The freighter keeps the tide’s hours, mgeni. So do I.' }],
  },
  'c7.ali.book': {
    lines: [{ who: 'Ali', text: 'Deck passage north: Suez, then the middle sea. She sails on the dawn tide, before the village is up.' }],
    choices: [
      { text: 'Sleep, and walk down at first light', goto: 'c7.dawn.go' },
      { text: '"Not yet. The coast is not finished being sat on."', goto: 'c7.ali.wait' },
    ],
  },
  'c7.ali.sail': {
    lines: [{ text: 'The freighter takes you the way the coast gave you everything: without hurry. Zanzibar lowers itself into the sea line, pole pole.' }],
    effects: ['travel:sicily'],
  },
  'c7.ali.wait': {
    lines: [{ who: 'Ali', text: 'Haya. The sea does not run out of north.' }],
  },

  // ---------------- Capitana Ríos, ashore on her rounds ----------------
  'c7.rios.hello': {
    lines: [
      { text: 'At the jetty root stands a silhouette you know from a bridge wing. Past the reef, riding at anchor: the Yacana.' },
      { who: 'Capitana Ríos', text: 'The galley hand. Cargo goes where cargo goes. Report: did the sea keep teaching you?' },
    ],
    effects: ['set:c7.rios.met'],
    choices: [
      { text: '"Still la mar, Capitana. Always."', goto: 'c7.rios.lamar', when: { has: ['page.words.lamar'] } },
      { text: '"You are talking to a shellback, Capitana."', goto: 'c7.rios.shellback', when: { has: ['c3.shellback'] } },
      { text: '"Honestly? I have forgotten half of it."', goto: 'c7.rios.honest' },
    ],
  },
  'c7.rios.lamar': {
    lines: [
      { who: 'Capitana Ríos', text: 'La mar. Still, and always. Ninety-four crossings, and the word walked ashore ahead of me.' },
      { text: 'Something in the dry face moves half a degree. On her, that is a salute.' },
    ],
  },
  'c7.rios.shellback': {
    lines: [{ who: 'Capitana Ríos', text: 'So you are. Neptune’s court does not revoke. Then stand like one; the tide here outranks us both.' }],
  },
  'c7.rios.honest': {
    lines: [
      { who: 'Capitana Ríos', text: 'Good. A sailor who admits forgetting logs honestly. So, once more for the log: la mar, never el mar.' },
      { who: 'Capitana Ríos', text: 'And you crossed the line on my deck: a shellback, whether you recall the soaking or not.' },
    ],
  },
  'c7.rios.bench': {
    lines: [
      { text: 'The Capitana has discovered the barazas. She reports on them like weather.' },
      { who: 'Capitana Ríos', text: 'Load-bearing stone, full view of the channel. I sat an hour. On my bridge we call that keeping watch.' },
      { text: 'From a woman who paces whole crossings, an hour of stone is practically a love letter.' },
    ],
    effects: ['set:c7.rios.sat'],
  },
  'c7.rios.idle': {
    lines: [{ who: 'Capitana Ríos', text: 'The Yacana loads cloves until the tide serves. Until then I am, technically, a tourist.' }],
  },

  // ---------------- Chasca, at the carved door ----------------
  'c7.chasca.door': {
    lines: [
      { who: 'Chasca', text: 'The soup-eater! Stand by the carved door: a hundred years of arrivals, and you are the newest. Smile!' },
      { text: 'The shutter clicks the moment the lane decides to be golden.' },
    ],
    effects: ['set:c7.met.chasca', 'set:photo.flash', 'set:photo.c7.door'],
  },
  'c7.chasca.again': {
    lines: [{ who: 'Chasca', text: 'Eight frames now, one per road. The album is starting to look like a sentence.' }],
  },

  // ---------------- the counter and the mail ----------------
  'c7.post.pilar': {
    lines: [{ text: 'Ali produces an envelope in handwriting you would recognize underwater: structurally, an invoice.' }],
    effects: ['letter:c7.pilar'],
  },
  'c7.post.mangben': {
    lines: [{ text: 'A second envelope, smelling faintly of a galley: garlic, diesel, benevolence.' }],
    effects: ['letter:c7.mangben'],
  },
  'c7.post.idle': {
    lines: [{ text: 'The tide table behind the counter disagrees with your watch by six hours exactly.' }],
  },

  // ---------------- examines ----------------
  'c7.ex.nyumba': {
    lines: [{ text: 'Reef, quarried and stacked. The house stays cool by remembering the sea it used to be.' }],
  },
  'c7.ex.mlango': {
    lines: [{ text: 'A carved door, ranks of brass studs. The town keeps its finest sentences on its doors.' }],
  },
  'c7.ex.baraza': {
    lines: [{ text: 'A stone bench grown into the house front, for news that does not need to knock.' }],
  },
  'c7.ex.ngalawa': {
    lines: [{ text: 'One mango trunk, two outrigger arms, a sail like a folded wing.' }],
  },
  'c7.ex.ngalawa.after': {
    // Dressing: the boat keeps the lesson after the reach is sailed.
    lines: [{ text: 'The ngalawa rests at her post. Your palm remembers where the sheet lives.' }],
  },
  'c7.ex.dhow': {
    lines: [{ text: 'A jahazi at anchor, lateen yard crossed like a drawn bow.' }],
  },
  'c7.ex.clovemat': {
    lines: [{ text: 'Cloves drying rust-red, fragrant enough to reorganize your priorities.' }],
  },
  'c7.ex.kangarack': {
    lines: [{ text: 'Kangas in printed ranks: a rack of things it would be unwise to say out loud.' }],
  },
  'c7.ex.spicesack': {
    lines: [{ text: 'Pepper, cinnamon bark, nutmeg still in its lace. The corner smells like a very old ship.' }],
  },
  'c7.ex.marketlamp.shop': {
    lines: [{ text: 'She lights this lamp for the cutting; the rest of the shop gets what is left.' }],
  },
  'c7.ex.marketlamp': {
    lines: [{ text: 'A hurricane lamp on a pole. The night market does not open; it kindles.' }],
  },
  'c7.ex.mwanirow': {
    lines: [{ text: 'Staked lines tufted with red mwani: a farm the sea waters twice a day.' }],
  },
  'c7.ex.corallane': {
    lines: [{ text: 'Crushed coral, white as bone, holding the day’s heat gently.' }],
  },
  'c7.ex.sand': {
    lines: [{ text: 'Coral sand, coarse with shell. Your shoes are beginning to feel like an opinion.' }],
  },
  'c7.ex.flats': {
    lines: [{ text: 'The sea’s floor, walked on. Starfish sprawl like dropped punctuation.' }],
  },
  'c7.ex.sea': {
    lines: [{ text: 'It has carried monsoons, dhows, cloves, grandmothers. Today, mostly light.' }],
  },
  'c7.ex.stall': {
    lines: [{ text: 'Bananas, limes, dried fish, sugarcane waiting for the press.' }],
  },
  'c7.ex.tree': {
    lines: [{ text: 'A clove tree. The buds are picked green, dried red, and argued over in gold.' }],
  },
  'c7.ex.sign': {
    lines: [{ text: 'FUKONI. Underneath, in another hand: pole pole ndio mwendo.' }],
  },
  'c7.ex.jetty': {
    lines: [{ text: 'Stone and mangrove poles, patched every generation since sail. It creaks in Swahili.' }],
  },
  'c7.ex.table': {
    lines: [{ text: 'A bone goes down with a click of finality.' }],
  },
  'c7.ex.pilaupot': {
    // The plate carries the remembering now; Bakari only pointed at the pot.
    lines: [{ text: 'A covered pot keeping Friday on a charcoal ring. The steam is pilau: Oman on one side, India on the other.' }],
    effects: ['set:c7.seen.pilau', 'journal:dishes.pilau'],
  },
  'c7.ex.stall.pizza': {
    // The Sultan's-kitchen story, retired from the welcome speech to the griddle.
    lines: [{ text: 'A griddle folds Zanzibar pizza. The captains claim the Sultan’s kitchen; Zuberi claims nowhere.' }],
  },
  'c7.ex.dhow.winds': {
    // Issa's two-wind calendar, read off the rig he pointed at.
    lines: [{ text: 'Her yard is set for the kaskazi, the northeast wind, until February. After April the kusi answers from the south.' }],
  },
  'c7.ex.shelfshop': {
    lines: [{ text: 'Folded kangas by the hundred, sorted by loudness.' }],
  },

  // ---------------- the love pass: small things, given voices ----------------
  'c7.ex.kline.a': {
    lines: [{ text: 'The nearest hem reads Wache waseme: let them talk. Somebody hung that one facing the lane on purpose.' }],
    effects: ['set:c7.seen.kline'],
  },
  'c7.ex.kline.b': {
    lines: [{ text: 'The cloths have turned in the wind; the message has not.' }],
  },
  'c7.ex.kline.c': {
    // Dressing: the shop line remembers your purchase.
    lines: [{ text: 'Sea-blue and rust flies at the end of the line now, twin to the cloth on your shoulder.' }],
  },
  'c7.ex.bao.a': {
    lines: [{ text: 'A bao board mid-game on a barrel. Both players walked away; the game is only breathing.' }],
    effects: ['set:c7.seen.bao'],
  },
  'c7.ex.bao.b': {
    lines: [{ text: 'You could move one seed and change two friendships. Every cat on this lane saw you think it.' }],
    effects: ['set:egg.c7.bao'],
  },
  'c7.egg.bao2': {
    lines: [{ text: 'Four seeds have moved since you last looked. Nobody was seen moving them.' }],
    effects: ['set:egg.c7.bao2'],
  },
  'c7.egg.bao3': {
    lines: [{ text: 'You check the board in passing, the way the whole lane does.' }],
  },
  'c7.ex.tray.after': {
    lines: [{ text: 'One of these cups was yours. That is how benches collect people.' }],
  },
  'c7.ex.tray': {
    lines: [{ text: 'A brass kahawa pot and cups the size of thimbles.' }],
  },
  'c7.ex.madema': {
    lines: [{ text: 'Woven fish traps. The fish swims in, reconsiders, and finds the door has become a wall.' }],
  },
  'c7.ex.coral': {
    lines: [{ text: 'Coral blocks queued for repairs. Somebody’s wall is about to remember the sea.' }],
  },
  'c7.ex.limepail': {
    lines: [{ text: 'Lime wash and a stiff brush: the wall’s next word in its old argument with the salt.' }],
  },
  'c7.ex.scaffold': {
    lines: [{ text: 'Mangrove poles lashed with rope, holding up a mason who is at lunch.' }],
  },
  'c7.ex.cat.a': {
    lines: [{ text: 'A cat, seated exactly where everyone must step around her.' }],
    effects: ['set:c7.cat.one'],
  },
  'c7.ex.cat.b': {
    lines: [{ text: 'Still there. The dhows shipped her ancestors in as ratters.' }],
    effects: ['set:c7.cat.two'],
  },
  'c7.ex.cat.c': {
    lines: [{ text: 'You and the cat have reached an understanding. The understanding is that the cat was right.' }],
  },
  'c7.ex.kuku.a': {
    lines: [{ text: 'A white chicken patrols the shop front like she holds the lease.' }],
    effects: ['set:c7.seen.kuku'],
  },
  'c7.ex.kuku.b': {
    lines: [{ text: 'Still white, still special. The proverb never mentioned modesty.' }],
  },
  'c7.ex.baiskeli': {
    lines: [{ text: 'A fish crate lashed over the back wheel. The bell works; the brakes are more of a conversation.' }],
  },
  'c7.ex.henna': {
    lines: [{ text: 'A tray of henna cones. Hold still and your hands leave wearing vines.' }],
  },
  'c7.ex.doormat': {
    lines: [{ text: 'Shoes queued beside the mat. You can take the household census without knocking.' }],
  },
  'c7.ex.goal': {
    lines: [{ text: 'Two flip-flops, one goal. Full time is when somebody’s mother uses their whole name.' }],
  },
  'c7.ex.starfish': {
    lines: [{ text: 'The tide left in a hurry: a starfish, a shell, one small crab with big plans.' }],
  },
  'c7.ex.sailspar.after': {
    lines: [{ text: 'Somewhere in those wraps is the place the wind leans. Your hands know it now.' }],
  },
  'c7.ex.sailspar': {
    lines: [{ text: 'A lateen sail furled along its spar: folded wind, waiting for the kaskazi.' }],
  },
  'c7.ex.radio.a': {
    lines: [{ text: 'Taarab pours out: strings, a violin, a voice saying something sharp, deniably.' }],
    effects: ['set:c7.seen.radio'],
  },
  'c7.ex.radio.b': {
    lines: [{ text: 'Bi Amina turns it up: Siti binti Saad, who recorded before any man on this coast dared.' }],
  },
  'c7.ex.sewing': {
    lines: [{ text: 'Scissors and chalk: where a pair becomes two kangas.' }],
  },
  'c7.ex.ukuta': {
    lines: [{ text: 'A coral wall at the exact height of a conversation, bougainvillea over the top.' }],
  },
  'c7.ex.makuti': {
    lines: [{ text: 'Coconut thatch thrown over the baraza. The shade arrives a step before you do.' }],
  },
  'c7.ex.madafu': {
    lines: [{ text: 'Green coconuts in the shade, one already open.' }],
  },
  'c7.ex.dagaa': {
    lines: [{ text: 'Whitebait drying silver on a rack, an octopus on the line above.' }],
  },
  'c7.ex.nyavu': {
    lines: [{ text: 'A net drying on the sand, the needle stuck in where the mending stopped for tea.' }],
  },
  'c7.ex.mkokoteni': {
    lines: [{ text: 'A handcart leaned on its shafts. Nobody leans a cart they mean to move soon.' }],
  },
  'c7.ex.wallcoral': {
    lines: [{ text: 'Reef rubble, painted white and asked to be a room.' }],
  },
  'c7.ex.floorlimescreed': {
    lines: [{ text: 'Lime screed, cool through your soles even at two in the afternoon.' }],
  },
  'c7.ex.rugmkeka': {
    lines: [{ text: 'A plaited mkeka. Everything in this shop that matters gets done sitting on one.' }],
  },
};

/** Examine arms; shared kinds stay map-tagged so their words stay home. */
export const ZANZIBAR_EXAMINES: Record<string, ExamineArm[]> = {
  blocked: [{ map: 'zanzibar', node: 'c7.ex.wall' }, { map: 'kangashop', node: 'c7.ex.wall' }],
  // Bi Amina's shop is skinned to coral rag, lime screed and mkeka in
  // `art/sets/zanzibar.ts`. The words follow the material.
  wallInt: [{ map: 'kangashop', node: 'c7.ex.wallcoral' }],
  floorEarth: [{ map: 'kangashop', node: 'c7.ex.floorlimescreed' }],
  rug: [{ map: 'kangashop', node: 'c7.ex.rugmkeka' }],
  nyumba: [{ node: 'c7.ex.nyumba' }],
  mlango: [{ node: 'c7.ex.mlango' }],
  baraza: [{ node: 'c7.ex.baraza' }],
  ngalawa: [
    { when: { has: ['c7.sail.ok'] }, node: 'c7.ex.ngalawa.after' },
    { node: 'c7.ex.ngalawa' },
  ],
  dhow: [
    { when: { has: ['c7.issa.winds'] }, node: 'c7.ex.dhow.winds' },
    { node: 'c7.ex.dhow' },
  ],
  clovemat: [{ node: 'c7.ex.clovemat' }],
  kangarack: [{ node: 'c7.ex.kangarack' }],
  spicesack: [{ node: 'c7.ex.spicesack' }],
  marketlamp: [
    { map: 'kangashop', node: 'c7.ex.marketlamp.shop' },
    { node: 'c7.ex.marketlamp' },
  ],
  mwanirow: [{ node: 'c7.ex.mwanirow' }],
  corallane: [{ node: 'c7.ex.corallane' }],
  postcounter: [
    { when: { not: ['letter.read.c7.pilar'] }, node: 'c7.post.pilar' },
    { when: { has: ['letter.read.c7.pilar'], not: ['letter.read.c7.mangben'] }, node: 'c7.post.mangben' },
    { node: 'c7.post.idle' },
  ],
  kangaline: [
    { when: { not: ['c7.seen.kline'] }, node: 'c7.ex.kline.a' },
    { when: { has: ['c7.kanga.done'] }, node: 'c7.ex.kline.c' },
    { node: 'c7.ex.kline.b' },
  ],
  baoboard: [
    { when: { not: ['c7.seen.bao'] }, node: 'c7.ex.bao.a' },
    // Keep looking in on the board and the game keeps living its slow life:
    // seeds move between visits, players never seen. Proper bao.
    { when: { not: ['egg.c7.bao'] }, node: 'c7.ex.bao.b' },
    { when: { not: ['egg.c7.bao2'] }, node: 'c7.egg.bao2' },
    { node: 'c7.egg.bao3' },
  ],
  kahawatray: [
    { when: { has: ['c7.rashid.past'] }, node: 'c7.ex.tray.after' },
    { node: 'c7.ex.tray' },
  ],
  madema: [{ node: 'c7.ex.madema' }],
  coralblocks: [{ node: 'c7.ex.coral' }],
  limepail: [{ node: 'c7.ex.limepail' }],
  scaffold: [{ node: 'c7.ex.scaffold' }],
  paka: [
    // At dawn only the ginger cat is out, beside Rashid's empty bench.
    { when: { has: ['c7.dawn'], not: ['c7.complete'] }, node: 'c7.dawn.bench' },
    { when: { has: ['c7.complete'] }, node: 'c7.dawn.cat' },
    { when: { not: ['c7.cat.one'] }, node: 'c7.ex.cat.a' },
    { when: { has: ['c7.cat.one'], not: ['c7.cat.two'] }, node: 'c7.ex.cat.b' },
    { node: 'c7.ex.cat.c' },
  ],
  kuku: [
    { when: { not: ['c7.seen.kuku'] }, node: 'c7.ex.kuku.a' },
    { node: 'c7.ex.kuku.b' },
  ],
  baiskeli: [{ node: 'c7.ex.baiskeli' }],
  hennastool: [{ node: 'c7.ex.henna' }],
  doormat: [{ node: 'c7.ex.doormat' }],
  flipflopgoal: [{ node: 'c7.ex.goal' }],
  starfish: [{ node: 'c7.ex.starfish' }],
  sailspar: [
    { when: { has: ['c7.sail.ok'] }, node: 'c7.ex.sailspar.after' },
    { node: 'c7.ex.sailspar' },
  ],
  radio: [
    { when: { not: ['c7.seen.radio'] }, node: 'c7.ex.radio.a' },
    { node: 'c7.ex.radio.b' },
  ],
  sewing: [{ node: 'c7.ex.sewing' }],
  ukuta: [{ node: 'c7.ex.ukuta' }],
  makuti: [{ node: 'c7.ex.makuti' }],
  madafu: [{ node: 'c7.ex.madafu' }],
  dagaa: [{ node: 'c7.ex.dagaa' }],
  nyavu: [{ node: 'c7.ex.nyavu' }],
  mkokoteni: [{ node: 'c7.ex.mkokoteni' }],
  sand: [{ map: 'zanzibar', node: 'c7.ex.sand' }],
  sandWet: [{ map: 'zanzibar', node: 'c7.ex.flats' }],
  sea: [{ map: 'zanzibar', node: 'c7.ex.sea' }],
  stall: [
    { map: 'zanzibar', when: { has: ['c7.met.bakari'] }, node: 'c7.ex.stall.pizza' },
    { map: 'zanzibar', node: 'c7.ex.stall' },
  ],
  tree: [{ map: 'zanzibar', node: 'c7.ex.tree' }],
  signpost: [{ map: 'zanzibar', node: 'c7.ex.sign' }],
  pierdeck: [
    { map: 'zanzibar', when: { has: ['c7.complete'] }, node: 'c7.dawn.jetty' },
    { map: 'zanzibar', node: 'c7.ex.jetty' },
  ],
  table: [
    { map: 'zanzibar', when: { has: ['c7.met.bakari'], not: ['c7.seen.pilau'] }, node: 'c7.ex.pilaupot' },
    { map: 'zanzibar', node: 'c7.ex.table' },
  ],
  shelf: [{ map: 'kangashop', node: 'c7.ex.shelfshop' }],
};

/** Event-triggered nodes, listed with their gating so tests can walk them. */
export const ZANZIBAR_EVENTS = [
  { node: 'c7.arrive' },
  { when: { has: ['c7.sail.start'] }, node: 'c7.sail.done' },
  { when: { has: ['c7.cook.start'] }, node: 'c7.cook.finish' },
];
