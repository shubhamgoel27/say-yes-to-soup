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
      {
        when: { has: ['c7.sail.ok', 'c7.kanga.done', 'c7.greeting', 'c7.baraza.sat'], not: ['c7.complete'] },
        node: 'c7.rashid.blessing',
      },
      { when: { has: ['c7.complete'] }, node: 'c7.rashid.after' },
      { node: 'c7.rashid.idle' },
    ],
  },
  {
    id: 'amina',
    name: 'Bi Amina',
    map: 'kangashop',
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
      { when: { has: ['c7.complete'] }, node: 'c7.ali.book' },
      { node: 'c7.ali.not' },
    ],
  },
  {
    // Her look is her look, everywhere; a captain does not change.
    id: 'riosC7',
    name: 'Capitana Ríos',
    map: 'zanzibar',
    when: { has: ['c7.arrived'], not: ['c7.complete'] },
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
];

export const ZANZIBAR_NODES: NodeMap = {
  // ---------------- arrival ----------------
  'c7.arrive': {
    lines: [
      { text: 'Twelve days of engine hum out of Kochi, then the last hour under sail: a jahazi, borrowed wind, a coast the color of bone and palm.' },
      { text: 'The tide is out. The sea has stepped back half a mile and left its floor drying in the sun, studded with starfish.' },
      { text: 'On the jetty, nobody hurries to meet you. Somebody waves anyway. Karibu, the wave says. Come near.' },
    ],
    effects: ['set:c7.arrived'],
  },

  // ---------------- Mzee Rashid, the baraza ----------------
  'c7.rashid.hello': {
    lines: [
      { text: 'An old man sits on the stone bench built into his house front, as if the house grew him. He watches the lane like a favorite program.' },
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
      { text: 'The bench has not moved. Neither has he. The greeting resumes exactly where it must: the beginning.' },
      { who: 'Mzee Rashid', text: 'Habari za asubuhi?' },
    ],
    choices: [
      { text: '"Nzuri, mzee. And yours?"', goto: 'c7.rashid.l2' },
      { text: '"Nzuri. Listen, about the harbor..."', goto: 'c7.rashid.restart' },
    ],
  },
  'c7.rashid.l2': {
    lines: [
      { who: 'Mzee Rashid', text: 'Nzuri sana. Habari za safari? How was the road that brought you?' },
    ],
    choices: [
      { text: '"Long, and kind. Habari za nyumbani?"', goto: 'c7.rashid.l3' },
      { text: '"Fine, fine. So, the boats..."', goto: 'c7.rashid.restart' },
    ],
  },
  'c7.rashid.l3': {
    lines: [
      { who: 'Mzee Rashid', text: 'Ah, you ask back! Nyumbani is well. The tide went out; it will come in.' },
      { who: 'Mzee Rashid', text: 'And the home you carry with you, mgeni? News of that one?' },
    ],
    choices: [
      { text: 'Tell him about a stone village very far uphill, slowly', goto: 'c7.rashid.earned' },
      { text: '"Complicated. Is that the time?"', goto: 'c7.rashid.restart' },
    ],
  },
  'c7.rashid.earned': {
    lines: [
      { who: 'Mzee Rashid', text: 'Hm. A grandmother’s road. That is a good reason to be in no hurry at all.' },
      { who: 'Mzee Rashid', text: 'You greeted all the way to the end. Most visitors quit at the first nzuri. Karibu kijijini: welcome to the village.' },
    ],
    effects: ['set:c7.greeting', 'journal:words.habari'],
  },
  'c7.rashid.restart': {
    lines: [
      { text: 'He does not frown. He settles deeper, like a man holding all the tide’s time, and begins again from the top.' },
      { who: 'Mzee Rashid', text: 'Habari za asubuhi? We will get there, mgeni. The greeting is not the door. The greeting is the house.' },
    ],
  },
  'c7.rashid.sit': {
    lines: [
      { who: 'Mzee Rashid', text: 'Sit. This bench has held four generations of news. It can hold your errands too.' },
    ],
    choices: [
      { text: 'Sit down on the baraza', goto: 'c7.rashid.sat' },
      { text: '"Maybe later. I have a list."', goto: 'c7.rashid.hurry' },
    ],
  },
  'c7.rashid.hurry': {
    lines: [
      { who: 'Mzee Rashid', text: 'Pole pole, mgeni. The list will still be a list. You are the only part of it that can spoil.' },
    ],
  },
  'c7.rashid.sat': {
    lines: [
      { text: 'You sit. Nothing happens. A cat crosses; a door opens two houses down, and closes. This, apparently, is the activity.' },
      { text: 'You shift to rise. His hand lands light on your arm, no weight in it at all.' },
      { who: 'Mzee Rashid', text: 'Pole pole ndio mwendo. Slowly, slowly is the way to go. It is not advice, mgeni; it is the road itself.' },
      { text: 'So you stay. The second sitting is easier. Somewhere down the lane, the morning agrees to pass by itself.' },
    ],
    effects: ['set:c7.baraza.sat', 'journal:words.polepole', 'journal:customs.baraza'],
  },
  'c7.rashid.coffee': {
    lines: [
      { text: 'A boy brings kahawa down the lane: tall brass pot, cups like thimbles. Rashid takes two and hands you one, bitter and ginger-edged.' },
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
      { text: 'He shifts a hand-width along the bench, following the shade, and considers the book on your hip without asking a thing about it.' },
      { who: 'Mzee Rashid', text: 'Bi Zoila sat on that end through a season of long rains. Feet on the stone, and that same red thread on the spine.' },
      { who: 'Mzee Rashid', text: 'One evening she said she might not go home, and nobody argued. People say that on this bench, and one or two of them mean it.' },
      { text: 'The lane goes on being the lane. You are holding that same book, which means you already know how her sentence ended.' },
    ],
    effects: ['set:c7.rashid.her', 'journal:her.zanzibar'],
  },
  'c7.rashid.blessing': {
    lines: [
      { who: 'Mzee Rashid', text: 'Bakari says you kept his telltale streaming. Amina says you can hear cloth. And twice you have sat here without asking the bench to be a bus stop.' },
      { who: 'Mzee Rashid', text: 'You arrived asking for a boat at the top of a greeting. Now you greet all the way down. Go tell Ali I said you are ready cargo.' },
      { text: 'He resumes watching the lane, which is to say he never stopped. You have been vouched for at the speed of the tide.' },
    ],
    effects: ['set:c7.complete'],
  },
  'c7.rashid.after': {
    lines: [
      { who: 'Mzee Rashid', text: 'The ship will leave when it leaves. Until then the bench is yours too. That is what it is for.' },
    ],
  },
  'c7.rashid.idle': {
    lines: [
      { who: 'Mzee Rashid', text: 'The tide is out. It will come in. Between those two facts a person can live a whole good life, mgeni.' },
    ],
  },

  // ---------------- Bi Amina, the kanga shop ----------------
  'c7.amina.band': {
    lines: [
      { who: 'Bi Amina', text: 'Karibu, karibu! Sit, the shop is cool. Wait. Your wrist. Who wrote you?' },
      { who: 'Bi Amina', text: 'This band is speech, mgeni. Rows like these are a village saying itself. I sell printed sentences; you have been wearing a woven one.' },
    ],
    effects: ['set:c7.met.amina', 'journal:people.amina'],
    next: 'c7.amina.welcome',
  },
  'c7.amina.first': {
    lines: [
      { text: 'The shop is a single cool room lined floor to ceiling with folded color. A woman looks up, delighted, as if you were expected.' },
      { who: 'Bi Amina', text: 'Karibu! Come near, come in. Mgeni ni kuku mweupe: a guest is a white chicken. Everyone will notice you, so you may as well be fed.' },
    ],
    effects: ['set:c7.met.amina', 'journal:people.amina'],
    next: 'c7.amina.welcome',
  },
  'c7.amina.welcome': {
    lines: [
      { text: 'Refusal is not offered as an option. Mandazi arrives, cardamom-sweet and still hot, with ginger tea that bites back kindly.' },
      { who: 'Bi Amina', text: 'Chai ya tangawizi, breakfast of this whole coast. Eat. Then we can discuss what the cloth has to say about you.' },
    ],
    effects: ['journal:words.karibu', 'journal:dishes.mandazi', 'journal:dishes.chaitangawizi'],
    choices: [
      { text: 'Ask why the cloths have writing on them', goto: 'c7.amina.speaks' },
      { text: 'Eat first. Talk after.', goto: 'c7.amina.eatfirst' },
    ],
  },
  'c7.amina.speaks': {
    lines: [
      { who: 'Bi Amina', text: 'Every kanga carries a jina, a saying printed along the hem. Wear the right proverb near the right person and everything is said, mgeni.' },
      { who: 'Bi Amina', text: 'No shouting, no witnesses. The cloth talks and the woman keeps her silence. It is the politest sharp thing ever invented.' },
    ],
  },
  'c7.amina.eatfirst': {
    lines: [
      { who: 'Bi Amina', text: 'A guest who eats first was raised properly. The cloth is patient; it has been talking for a hundred years.' },
    ],
  },
  'c7.amina.game0': {
    lines: [
      { who: 'Bi Amina', text: 'Back again! Good. Before I sell you anything, we play. I describe the day; you choose the kanga that answers it.' },
      { who: 'Bi Amina', text: 'Choose wrong and I will laugh at you with love. Ready?' },
    ],
    next: 'c7.amina.r1',
  },
  'c7.amina.r1': {
    lines: [
      { who: 'Bi Amina', text: 'First: my cousin arrives tomorrow from Pemba, her first visit in years. Which kanga do I hang by the door?' },
    ],
    choices: [
      { text: '"Mgeni ni kuku mweupe. A guest is a white chicken."', goto: 'c7.amina.r1y' },
      { text: '"Akili ni mali. Wits are wealth."', goto: 'c7.amina.r1n1' },
      { text: '"Mapenzi ni kikohozi. Love is a cough."', goto: 'c7.amina.r1n2' },
    ],
  },
  'c7.amina.r1y': {
    lines: [
      { who: 'Bi Amina', text: 'Eee! Yes. The white chicken stands out in the flock, so it is treated as special. My cousin will be fed until she complains.' },
    ],
    next: 'c7.amina.r2',
  },
  'c7.amina.r1n1': {
    lines: [
      { who: 'Bi Amina', text: 'You would greet my cousin with WITS ARE WEALTH? She will hear me calling her poor and foolish in one cloth!' },
      { who: 'Bi Amina', text: 'Think of the flock, mgeni. A guest stands out like a white chicken, and standing out means being treated specially. Again.' },
    ],
    next: 'c7.amina.r1',
  },
  'c7.amina.r1n2': {
    lines: [
      { who: 'Bi Amina', text: 'Love is a cough, for my COUSIN? The lane would talk for a month and I would deserve it.' },
      { who: 'Bi Amina', text: 'That one waits for a different neighbor, believe me. For a guest you want the white chicken. Again.' },
    ],
    next: 'c7.amina.r1',
  },
  'c7.amina.r2': {
    lines: [
      { who: 'Bi Amina', text: 'Second: the fish seller walks past the tailor’s daughter twice a day now, for no fish reason. Which kanga does his mother wear?' },
    ],
    choices: [
      { text: '"Mapenzi ni kikohozi. Love is a cough."', goto: 'c7.amina.r2y' },
      { text: '"Mgeni ni kuku mweupe. A guest is a white chicken."', goto: 'c7.amina.r2n1' },
      { text: '"Mkono wa Mungu. The hand of God."', goto: 'c7.amina.r2n2' },
    ],
  },
  'c7.amina.r2y': {
    lines: [
      { who: 'Bi Amina', text: 'Mapenzi ni kikohozi, hayawezi kufichika! Love is a cough; it cannot be hidden.' },
      { who: 'Bi Amina', text: 'His mother wears it, says nothing, and the whole street is informed. That is efficiency, mgeni.' },
    ],
    next: 'c7.amina.r3',
  },
  'c7.amina.r2n1': {
    lines: [
      { who: 'Bi Amina', text: 'A white chicken? The boy is not a guest, he is a symptom! Ha!' },
      { who: 'Bi Amina', text: 'What cannot be hidden, mgeni? A cough. And what else? Exactly. Again.' },
    ],
    next: 'c7.amina.r2',
  },
  'c7.amina.r2n2': {
    lines: [
      { who: 'Bi Amina', text: 'The hand of God! Mgeni, God has better things to do than the fish seller’s heart. Though not much better.' },
      { who: 'Bi Amina', text: 'The saying we need is about a thing that cannot be hidden, like a cough. Again.' },
    ],
    next: 'c7.amina.r2',
  },
  'c7.amina.r3': {
    lines: [
      { who: 'Bi Amina', text: 'Last: my neighbor got a new roof and has begun explaining money to everyone at the well. Which kanga do I wear to fetch water?' },
    ],
    choices: [
      { text: '"Akili ni mali. Wits are wealth."', goto: 'c7.amina.matched' },
      { text: '"A guest is a white chicken."', goto: 'c7.amina.r3n1' },
      { text: '"Love is a cough."', goto: 'c7.amina.r3n2' },
    ],
  },
  'c7.amina.r3n1': {
    lines: [
      { who: 'Bi Amina', text: 'She is not a guest, she is a neighbor, which is a life sentence! Ha!' },
      { who: 'Bi Amina', text: 'I need a cloth that mentions wealth without mentioning her roof. Think, mgeni. Again.' },
    ],
    next: 'c7.amina.r3',
  },
  'c7.amina.r3n2': {
    lines: [
      { who: 'Bi Amina', text: 'Love is a cough? For HER? Now THAT would start a story neither of us could afford.' },
      { who: 'Bi Amina', text: 'No. I want to answer her roof with my head held high. Wits, mgeni. Again.' },
    ],
    next: 'c7.amina.r3',
  },
  'c7.amina.matched': {
    lines: [
      { who: 'Bi Amina', text: 'AKILI NI MALI! Wits are wealth! I say nothing, I fetch my water, and her roof gets smaller with every step I take.' },
      { who: 'Bi Amina', text: 'You can hear cloth, mgeni. Come back and I will sell you some words worth wearing.' },
    ],
    effects: ['set:c7.kanga.game'],
  },
  'c7.amina.pair': {
    lines: [
      { text: 'She measures you with one look, then pulls out a pair: sea-blue and rust, a hem of white letters, still joined as one long cloth.' },
      { who: 'Bi Amina', text: 'Kangas are born in pairs, a gora. One you cut and wear. The other is not yours, mgeni; it is for giving away. That is the design.' },
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
    lines: [
      { who: 'Bi Amina', text: 'Woven in! So the cloth speaks there too, in thread instead of ink. The sea has been carrying that idea around like cargo.' },
      { who: 'Bi Amina', text: 'Yours says: Mkono wa Mungu hakuna wa kuushinda. No one can overcome the hand of God. For a traveler, that is a seatbelt.' },
    ],
  },
  'c7.amina.jina': {
    lines: [
      { who: 'Bi Amina', text: 'Yours says: Mkono wa Mungu hakuna wa kuushinda. No one can overcome the hand of God. For a traveler, mgeni, that is a seatbelt.' },
    ],
  },
  'c7.amina.idle': {
    lines: [
      { who: 'Bi Amina', text: 'Wear the one; keep the other folded. When you meet the person it belongs to, you will not have to ask. The cloth will lean.' },
    ],
  },

  // ---------------- Juma, the spice-farm edge ----------------
  'c7.juma.first': {
    lines: [
      { text: 'The lane ends in green: pepper vines climbing the palms, and mats of rust-red cloves drying by the path, the smell arriving first.' },
      { who: 'Juma', text: 'Mind the mats, mgeni! Three months of climbing dries on those. Sniff all you like; the smell is free.' },
      { who: 'Juma', text: 'Come back at saa mbili and help me rake them. Saa mbili sharp. Even a farm keeps some appointments.' },
    ],
    effects: ['set:c7.met.juma', 'journal:people.juma'],
  },
  'c7.juma.late': {
    lines: [
      { text: 'You arrive at two in the afternoon, punctual to your own wrist. Juma is asleep in the shade, hat down. The mats are already raked.' },
      { who: 'Juma', text: 'Saa mbili, mgeni! Hour two! The day starts at sunrise here, so hour two is eight in the morning. Subtract six from that watch.' },
      { who: 'Juma', text: 'You are not late, understand. You are six hours sideways. Nobody is wrong; the sun simply signed our clock first. Tomorrow, saa mbili.' },
    ],
    effects: ['set:c7.saa', 'journal:customs.swahilitime'],
  },
  'c7.juma.mats': {
    lines: [
      { text: 'Saa mbili, sunrise math. This time the mats are full and the raking is real work with a real rhythm to it.' },
      { who: 'Juma', text: 'These buds went to weddings in Bombay and coffee in Muscat before either of us had grandfathers. Pemba grows most of it now; the smell stays ours.' },
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
    lines: [
      { who: 'Juma', text: 'You drank it in the hills it comes from! Same pod, mgeni, carried by the same wind that carried your ship.' },
      { who: 'Juma', text: 'The monsoon is a spice road with weather. Kerala, Oman, here: one kitchen, three coastlines.' },
    ],
  },
  'c7.juma.pods': {
    lines: [
      { who: 'Juma', text: 'Cardamom, mgeni. Crush one and your tea grows a second opinion. It crossed from India with the wind, like the doors and the pilau.' },
    ],
  },
  'c7.juma.idle': {
    lines: [
      { who: 'Juma', text: 'The spice tours ride through at noon and photograph the vanilla. The farming is the part before and after the photograph, mgeni.' },
    ],
  },

  // ---------------- Zuberi, the urojo cart ----------------
  'c7.zuberi.first': {
    lines: [
      { text: 'A cart at the market corner, a vat of turmeric-gold soup, a man building each bowl like an argument he intends to win.' },
      { who: 'Zuberi', text: 'Urojo. Zanzibar mix. Potatoes, bhajia, crunch, chili, lime. Sour, hot, crowded: the market, in a bowl.' },
      { text: 'You ask how long it will take. He looks at you the way the tide looks at a schedule.' },
      { who: 'Zuberi', text: 'Pole pole, mgeni. The bowl arrives when it is a bowl. Yours is the only clock in this soup.' },
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
    lines: [
      { who: 'Zuberi', text: 'Peru knows! Sour is the cure, mgeni. Lime and mango wake up whatever the night flattened. Every coast keeps one pot like this.' },
    ],
  },
  'c7.zuberi.cure': {
    lines: [
      { who: 'Zuberi', text: 'Sour wakes you, mgeni. Mango, lime, tamarind: the pot for long nights, long roads, long faces. Sour soup is medicine everywhere the sea goes.' },
    ],
  },
  'c7.zuberi.dusk': {
    lines: [
      { text: 'Dusk. The corner lamps kindle one by one, and the smoke begins telling the whole shore what is cooking.' },
      { who: 'Zuberi', text: 'Tonight, pweza wa nazi: octopus that walked the flats at low tide, in coconut curry. That is the real food of this island.' },
      { who: 'Zuberi', text: 'The next stall will offer you Zanzibar pizza. It is fine, mgeni. But it is from nowhere, and least of all from here.' },
    ],
    effects: ['set:c7.zuberi.dusk', 'journal:dishes.pweza', 'journal:words.hamnashida'],
    choices: [
      { text: '"Hakuna matata, then?"', goto: 'c7.zuberi.hamna' },
      { text: 'Just eat the pweza', goto: 'c7.zuberi.pweza' },
    ],
  },
  'c7.zuberi.hamna': {
    lines: [
      { who: 'Zuberi', text: 'Ha! Real Swahili, yes. But we sell that phrase to visitors now, like the pizza. Between us we say hamna shida.' },
      { who: 'Zuberi', text: 'No worries, in work clothes. Say it and watch the price of your soup improve.' },
    ],
  },
  'c7.zuberi.pweza': {
    lines: [
      { text: 'The octopus is tender in a way that suggests a private agreement with the coconut. You understand the island a little more per bite.' },
    ],
  },
  'c7.zuberi.cookAgain': {
    lines: [
      { who: 'Zuberi', text: 'The vat is full and the corner is hungry, mgeni. The apron is where you left it, on the cart handle.' },
    ],
    choices: [
      { text: 'Tie the apron on again', when: { has: ['c7.cook.done'] }, goto: 'c7.zuberi.cookReplay' },
      { text: '"I am here to eat tonight, not to ladle."', goto: 'c7.zuberi.idle' },
    ],
  },
  'c7.zuberi.cookReplay': {
    lines: [
      { who: 'Zuberi', text: 'Good. No lesson in it this time; you know the corner. Feed them however you hear them, and I will describe the damage.' },
    ],
    effects: ['set:replay.mode', 'set:c7.cook.start'],
  },
  'c7.zuberi.idle': {
    lines: [
      { who: 'Zuberi', text: 'Come at dusk, mgeni. The day market sells things. The night market sells the day itself, warmed up.' },
    ],
  },
  'c7.zuberi.apron': {
    lines: [
      { text: 'The lunch line thins. Zuberi looks at you, then at the vat, then unties the spare apron from the cart handle.' },
      { who: 'Zuberi', text: 'You have eaten my urojo and watched me build it. Watching is half of nothing, mgeni. Come behind the pot; the next bowls are yours.' },
    ],
    choices: [
      { text: 'Tie on the apron', goto: 'c7.zuberi.apron.go' },
      { text: '"Another tide."', goto: 'c7.zuberi.apron.wait' },
    ],
  },
  'c7.zuberi.apron.go': {
    lines: [
      { who: 'Zuberi', text: 'Rules of the corner: the customer calls the bowl, you answer it. There are no wrong bowls. There are only bowls I get to describe.' },
    ],
    effects: ['set:c7.cook.start'],
  },
  'c7.zuberi.apron.wait': {
    lines: [
      { who: 'Zuberi', text: 'Haya. The vat and I keep the same hours: until it is finished.' },
    ],
  },
  'c7.cook.finish': {
    lines: [
      { text: 'The vat steams down to its last gold inch. Two customers fed, one apron returned, your wrists smelling of lime and turmeric.' },
      { who: 'Zuberi', text: 'You see what you built? Bhajia from India, mango from the farms, cassava from the mainland, lime off our own trees. One bowl.' },
      { who: 'Zuberi', text: 'Everything that ever anchored here ended up in the pot, mgeni. Urojo is the island writing its autobiography, and it lets anyone hold the pen.' },
    ],
    effects: ['clear:c7.cook.start', 'set:c7.cook.done'],
  },

  // ---------------- Mama Salma, the mwani rows ----------------
  'c7.salma.first': {
    lines: [
      { text: 'Far out on the wet flats, staked lines run like stitched seams. A woman moves along them tying red bunches, skirts knotted high.' },
      { who: 'Mama Salma', text: 'Mwani. Seaweed. We plant at low tide and the sea farms it for us while we sleep. Women’s crop, women’s money, since my mother’s time.' },
    ],
    effects: ['set:c7.met.salma', 'journal:people.salma'],
    choices: [
      { text: 'Help her carry the wet sack up the beach', goto: 'c7.salma.carry' },
      { text: 'Ask about the rows first', goto: 'c7.salma.rows' },
    ],
  },
  'c7.salma.rows': {
    lines: [
      { who: 'Mama Salma', text: 'Tied at low tide, harvested at low tide. The moon is the foreman here. Between tides we mend lines, mind children, argue prices.' },
    ],
    choices: [{ text: 'Help her carry the wet sack up the beach', goto: 'c7.salma.carry' }],
  },
  'c7.salma.again': {
    lines: [
      { who: 'Mama Salma', text: 'Back again? Good timing. The sack will not walk itself up the beach, and my back has opinions today.' },
    ],
    choices: [
      { text: 'Take the sack', goto: 'c7.salma.carry' },
      { text: '"Not right now."', goto: 'c7.salma.nomind' },
    ],
  },
  'c7.salma.nomind': {
    lines: [
      { who: 'Mama Salma', text: 'Haya. The tide keeps my hours anyway. Pole for your busy day, mgeni.' },
    ],
  },
  'c7.salma.carry': {
    lines: [
      { text: 'The sack is heavier than the sea smell suggests. You haul it past the tide line while she unties the next row one-handed, twice as fast.' },
      { who: 'Mama Salma', text: 'Asante sana! And pole for the carrying. We say pole for any burden, mgeni. It means: I see the weight, even if I cannot take it.' },
    ],
    effects: ['set:c7.salma.helped', 'journal:words.asante', 'journal:words.pole'],
  },
  'c7.salma.warm': {
    lines: [
      { who: 'Mama Salma', text: 'The rows nearest shore die soft now. The water warms a little, the mwani breaks before it is grown, so we walk farther out each year.' },
      { who: 'Mama Salma', text: 'My daughter wants nets in the deep water and a boat. Maybe she is right. The sea was our field; the field is moving, so we move.' },
    ],
    effects: ['set:c7.salma.warm', 'journal:customs.mwani'],
  },
  'c7.salma.idle': {
    lines: [
      { who: 'Mama Salma', text: 'Low tide is my office hours, mgeni. At high tide, look for me at the market, selling soap the color of the sea’s insides.' },
    ],
  },

  // ---------------- Fundi Issa, shaping ribs ----------------
  'c7.issa.first': {
    lines: [
      { text: 'Above the tide line a man bends a rib of mango wood over his knee, adze marks still bright, an outrigger hull waiting beside him.' },
      { who: 'Fundi Issa', text: 'Ngalawa. Dug from one mango trunk, given two arms so the sea cannot flip her without asking twice.' },
      { who: 'Fundi Issa', text: 'The hull rots, mgeni. Every hull, this one too.' },
      { who: 'Fundi Issa', text: 'So the boat is not the heirloom. The knowing how is the heirloom, and it only rots if you fail to hand it on.' },
    ],
    effects: ['set:c7.met.issa', 'journal:people.dhowbuilder', 'journal:customs.dhowknowledge'],
  },
  'c7.issa.second': {
    lines: [
      { who: 'Fundi Issa', text: 'My master learned at Nungwi: keel first, no drawings. I learned by watching his hands and by being wrong slowly.' },
      { who: 'Fundi Issa', text: 'Kaskazi blows from the northeast until February; kusi answers from the south after April. Boats and weddings are planned by those two.' },
    ],
    effects: ['set:c7.issa.winds'],
  },
  'c7.issa.idle': {
    lines: [
      { who: 'Fundi Issa', text: 'Come back when she floats, mgeni. A boat on the sand is a promise; the tide is the notary.' },
    ],
  },

  // ---------------- Kapteni Bakari, the domino table ----------------
  'c7.bakari.first': {
    lines: [
      { text: 'Four retired captains around a table, dominoes going down like weather reports. Nobody looks up, which is how you know the game matters.' },
      { who: 'Kapteni Bakari', text: 'Sit, mgeni, watch. This table has crossed to Bombay and back more times than it has legs.' },
      { text: 'A bone goes down with a click of finality. Somewhere in it there is a story about a cyclone; you can tell by the silence.' },
      { who: 'Kapteni Suleiman', text: 'Feed the mgeni Zanzibar pizza, Bakari. Old, old food. From the Sultan’s own kitchen.' },
      { who: 'Kapteni Bakari', text: 'Suleiman also remembers winning arguments he lost. Eat what Zuberi gives you, mgeni.' },
      { who: 'Kapteni Bakari', text: 'Friday, when the game ends, there is pilau. Rice that remembers Oman on one side and India on the other. The table eats together or not at all.' },
    ],
    effects: ['set:c7.met.bakari', 'journal:dishes.pilau'],
  },
  'c7.bakari.sail': {
    lines: [
      { who: 'Kapteni Bakari', text: 'You keep looking at the water like it owes you a ride. Come; the ngalawa needs exercise, and I need to see if you can listen with your hands.' },
    ],
    choices: [
      { text: 'Step aboard', goto: 'c7.bakari.go' },
      { text: '"Another tide."', goto: 'c7.bakari.later' },
    ],
  },
  'c7.bakari.go': {
    lines: [
      { who: 'Kapteni Bakari', text: 'Kaskazi today, steady from the northeast. Watch the telltale on the yard: when it streams, the sail is breathing. Keep it breathing.' },
    ],
    effects: ['set:c7.sail.start'],
  },
  'c7.bakari.later': {
    lines: [
      { who: 'Kapteni Bakari', text: 'Haya. The wind is not offended. It has other appointments.' },
    ],
  },
  'c7.sail.done': {
    lines: [
      { text: 'The village comes back to meet you, then the jetty. Your hands have learned a small permanent thing about wind.' },
      { who: 'Kapteni Bakari', text: 'You luffed, you listened, you fixed it. That is the whole trade, mgeni. The rest is repetition and weather.' },
    ],
    effects: ['clear:c7.sail.start', 'set:c7.sail.ok'],
  },
  'c7.bakari.praise': {
    lines: [
      { who: 'Kapteni Bakari', text: 'The telltale streamed, and Issa says the wind agreed with you. When you ride a strange ship north, help in the galley and stay off the ropes.' },
    ],
    effects: ['set:c7.bakari.props'],
  },
  'c7.bakari.sailAgain': {
    lines: [
      { who: 'Kapteni Bakari', text: 'The kaskazi is still working and the ngalawa is still tied to a post. Between us, that is a waste of two good things.' },
    ],
    choices: [
      { text: 'Take the ngalawa out again', when: { has: ['c7.sail.ok'] }, goto: 'c7.bakari.sailReplay' },
      { text: '"Another tide, kapteni."', goto: 'c7.bakari.idle' },
    ],
  },
  'c7.bakari.sailReplay': {
    lines: [
      { who: 'Kapteni Bakari', text: 'Haya. Nothing to prove today, mgeni. Only the wind, the telltale, and the long way back to the jetty.' },
    ],
    effects: ['set:replay.mode', 'set:c7.sail.start'],
  },
  'c7.bakari.idle': {
    lines: [
      { who: 'Kapteni Bakari', text: 'Dominoes are like harbors, mgeni. What matters is not the bone in your hand; it is the one already on the table.' },
    ],
  },

  // ---------------- Ali, the shipping agent ----------------
  'c7.ali.first': {
    lines: [
      { text: 'A counter at the jetty root, a ledger, and a man with the handwriting of someone who has recorded cargo through three currencies.' },
      { who: 'Ali', text: 'Deck passage north, through Suez? It exists, mgeni. Ships call twice a month.' },
      { who: 'Ali', text: 'But I book people the coast is finished with, and this coast is not finished with you. Come back when Mzee Rashid says you have slowed down.' },
    ],
    effects: ['set:c7.met.ali'],
  },
  'c7.ali.not': {
    lines: [
      { who: 'Ali', text: 'The ledger is patient, mgeni, and so is the pen. Rashid’s bench decides before I do.' },
    ],
  },
  'c7.ali.book': {
    lines: [
      { who: 'Ali', text: 'Rashid sent word. Deck passage north: Suez, then the middle sea, a freighter with a cook who loves and hates company in equal parts.' },
      { who: 'Ali', text: 'She sails on the tide after this one. Say your goodbyes pole pole; it is the only speed goodbyes keep.' },
    ],
    choices: [
      { text: 'Board when the tide serves', goto: 'c7.ali.sail' },
      { text: '"Not yet. The coast is not finished being sat on."', goto: 'c7.ali.wait' },
    ],
  },
  'c7.ali.sail': {
    lines: [
      { text: 'The freighter takes you the way the coast gave you everything: without hurry. Zanzibar lowers itself into the sea line, pole pole.' },
    ],
    effects: ['travel:sicily'],
  },
  'c7.ali.wait': {
    lines: [{ who: 'Ali', text: 'Haya. The sea does not run out of north.' }],
  },

  // ---------------- Capitana Ríos, ashore on her rounds ----------------
  'c7.rios.hello': {
    lines: [
      { text: 'At the jetty root stands a silhouette you know from a bridge wing. Past the reef, riding at anchor, unmistakably: the Yacana.' },
      { who: 'Capitana Ríos', text: 'The galley hand. Cargo goes where cargo goes, and this week it goes through Zanzibar. Do not look surprised; it undermines my navigation.' },
      { text: 'She is off watch. She holds her shore leave the way some people hold an unfamiliar baby.' },
      { who: 'Capitana Ríos', text: 'Well. Report. Did the sea keep teaching you after my deck, or did the land take it all back?' },
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
      { who: 'Capitana Ríos', text: 'La mar. Still, and always.' },
      { who: 'Capitana Ríos', text: 'Ninety-four crossings, and the word finally walked ashore ahead of me. Simón will hear of this, and he will be unbearable.' },
      { text: 'Something in the dry face moves half a degree. On her, that is a salute.' },
    ],
  },
  'c7.rios.shellback': {
    lines: [
      { who: 'Capitana Ríos', text: 'So you are. Neptune’s court does not revoke. Half my paperwork should be as permanent as that soaking.' },
      { who: 'Capitana Ríos', text: 'Then stand like one. The tide here outranks us both, which frankly is a relief.' },
    ],
  },
  'c7.rios.honest': {
    lines: [
      { who: 'Capitana Ríos', text: 'Good. A sailor who admits forgetting is a sailor who logs honestly. I would rather ship that than a confident memory.' },
      { who: 'Capitana Ríos', text: 'So, once more, for the log: la mar, never el mar. She carries us and could decline to; the ones she carries say it her way.' },
      { who: 'Capitana Ríos', text: 'And you crossed the line on my deck, so you are a shellback whether you recall the soaking or not. Neptune keeps his own ledger.' },
    ],
  },
  'c7.rios.bench': {
    lines: [
      { text: 'The Capitana has discovered the barazas. She reports on them the way she reports weather: facts first, feelings never, feelings anyway.' },
      { who: 'Capitana Ríos', text: 'Load-bearing stone, shaded, full view of the channel traffic. Whoever engineered that bench understood port operations completely.' },
      { who: 'Capitana Ríos', text: 'I sat on one for an hour this morning. The village calls it sitting; on my bridge we call it keeping watch. Acceptable naval architecture.' },
      { text: 'An hour, she says, like a logged fact. From a woman who paces whole crossings, an hour of stone is practically a love letter.' },
    ],
    effects: ['set:c7.rios.sat'],
  },
  'c7.rios.idle': {
    lines: [
      { who: 'Capitana Ríos', text: 'The Yacana loads cloves until the tide serves. Until then I am, technically, a tourist. Do not report me.' },
    ],
  },

  // ---------------- Chasca, at the carved door ----------------
  'c7.chasca.door': {
    lines: [
      { who: 'Chasca', text: 'The soup-eater! You keep arriving exactly where the album needs you. I am mid-bargain over a kanga; we are both enjoying it too much to finish.' },
      { who: 'Chasca', text: 'Now stand by the carved door. The studs, the arch, a hundred years of arrivals; you are simply the newest. Smile!' },
      { text: 'The shutter clicks at the exact moment the lane decides to be golden. She grins like she planned the light. Perhaps she did.' },
    ],
    effects: ['set:c7.met.chasca', 'set:photo.flash', 'set:photo.c7.door'],
  },
  'c7.chasca.again': {
    lines: [
      { who: 'Chasca', text: 'Seven photographs now, one per coast. The album is starting to look like a sentence with somewhere to get to, pole pole.' },
    ],
  },

  // ---------------- the counter and the mail ----------------
  'c7.post.pilar': {
    lines: [
      { text: 'The counter holds mail. Ali produces an envelope addressed in handwriting you would recognize underwater: it is, structurally, an invoice.' },
    ],
    effects: ['letter:c7.pilar'],
  },
  'c7.post.mangben': {
    lines: [
      { text: 'Ali digs again and comes up with a second envelope, this one smelling faintly of a galley: garlic, diesel, benevolence.' },
    ],
    effects: ['letter:c7.mangben'],
  },
  'c7.post.idle': {
    lines: [
      { text: 'SHIPPING AGENT. The ledger is closed, the pen capped. The tide table behind the counter disagrees with your watch by six hours exactly.' },
    ],
  },

  // ---------------- examines ----------------
  'c7.ex.nyumba': {
    lines: [
      { text: 'Coral rag under lime wash: the walls are reef, quarried and stacked. The house stays cool by remembering the sea it used to be.' },
    ],
  },
  'c7.ex.mlango': {
    lines: [
      { text: 'A carved door: arched frame, ranks of brass studs, a chain border for protection. The town keeps its finest sentences on its doors.' },
    ],
  },
  'c7.ex.baraza': {
    lines: [
      { text: 'A stone bench grown into the house front. Built so guests can be received without entering, and news without knocking.' },
    ],
  },
  'c7.ex.ngalawa': {
    lines: [
      { text: 'A ngalawa: one mango trunk, two outrigger arms, a sail like a folded wing. Nimble as a water strider and about as sinkable.' },
    ],
  },
  'c7.ex.dhow': {
    lines: [
      { text: 'A jahazi rides at anchor, lateen yard crossed like a drawn bow. Boats like her stitched this ocean together for a thousand years.' },
    ],
  },
  'c7.ex.clovemat': {
    lines: [
      { text: 'Cloves drying on a woven mat, rust-red and fragrant enough to reorganize your priorities. Three months of climbing per handful.' },
    ],
  },
  'c7.ex.kangarack': {
    lines: [
      { text: 'Kangas in ranks of printed color, each hem carrying its saying. A rack of things it would be unwise to say out loud.' },
    ],
  },
  'c7.ex.spicesack': {
    lines: [
      { text: 'Sacks rolled open: pepper, cinnamon bark, nutmeg still in its lace. The corner smells like the hold of a very old ship.' },
    ],
  },
  'c7.ex.marketlamp.shop': {
    lines: [
      { text: 'The lamp stands at the end of the cutting counter, not in the middle of the room. She lights it for the work; the rest of the shop gets what is left.' },
    ],
  },
  'c7.ex.marketlamp': {
    lines: [
      { text: 'A hurricane lamp on a pole, waiting for its hour. The night market does not open; it kindles.' },
    ],
  },
  'c7.ex.mwanirow': {
    lines: [
      { text: 'Staked lines seamed across the flats, tufted dark red with growing mwani. A farm the sea waters twice a day, no fence required.' },
    ],
  },
  'c7.ex.corallane': {
    lines: [
      { text: 'A lane of crushed coral, white as bone and swept clean. It holds the day’s heat gently, like everything else here.' },
    ],
  },
  'c7.ex.sand': {
    lines: [
      { text: 'Pale coral sand, coarse with shell. Barefoot country; your shoes are beginning to feel like an opinion.' },
    ],
  },
  'c7.ex.flats': {
    lines: [
      { text: 'The sea’s floor, walked on. Starfish sprawl like dropped punctuation, small crabs commute, and somewhere a woman hunts octopus on foot.' },
    ],
  },
  'c7.ex.sea': {
    lines: [
      { text: 'The Indian Ocean at its ease. It has carried monsoons, dhows, cloves, grandmothers. Today it is mostly carrying light.' },
    ],
  },
  'c7.ex.stall': {
    lines: [
      { text: 'A market stall under a striped awning: bananas, limes, dried fish, sugarcane waiting for the press.' },
    ],
  },
  'c7.ex.tree': {
    lines: [
      { text: 'A clove tree, glossy-leaved. The buds are picked green, dried red, and argued over in gold.' },
    ],
  },
  'c7.ex.sign': {
    lines: [
      { text: 'FUKONI, the sign says. Underneath, smaller, in another hand: pole pole ndio mwendo.' },
    ],
  },
  'c7.ex.jetty': {
    lines: [
      { text: 'Stone and mangrove-pole jetty, patched every generation since sail. It creaks in Swahili.' },
    ],
  },
  'c7.ex.table': {
    lines: [
      { text: 'The domino table. The bones are worn smooth as beach glass. Standing this close without playing feels like eavesdropping.' },
    ],
  },
  'c7.ex.shelfshop': {
    lines: [
      { text: 'Folded kangas by the hundred, sorted by loudness. The shelf is a library that happens to be wearable.' },
    ],
  },

  // ---------------- the love pass: small things, given voices ----------------
  'c7.ex.kline.a': {
    lines: [
      { text: 'Kangas drying in pairs, each hem holding its printed sentence up to the wind.' },
      { text: 'The nearest reads Wache waseme: let them talk. Somebody hung that one facing the lane on purpose.' },
    ],
    effects: ['set:c7.seen.kline'],
  },
  'c7.ex.kline.b': {
    lines: [
      { text: 'The cloths have turned in the wind; the message has not. Whoever should let them talk has presumably walked past by now.' },
    ],
  },
  'c7.ex.bao.a': {
    lines: [
      { text: 'A bao board mid-game on a barrel, seeds counted into their pits. Both players walked away; the game did not end, it is only breathing.' },
    ],
    effects: ['set:c7.seen.bao'],
  },
  'c7.ex.bao.b': {
    lines: [
      { text: 'You could move one seed and change two friendships. Do not touch the seeds. Every cat on this lane saw you think it.' },
    ],
  },
  'c7.ex.tray.after': {
    lines: [
      { text: 'The kahawa boy has moved down the lane. One of these cups was yours; the bench remembers who drank from it, which is how benches collect people.' },
    ],
  },
  'c7.ex.tray': {
    lines: [
      { text: 'A brass kahawa pot and cups the size of thimbles. The cup is small so the sitting can be long; refills are how the bench keeps you.' },
    ],
  },
  'c7.ex.madema': {
    lines: [
      { text: 'Madema: woven fish traps stacked like baskets that learned a trick. The fish swims in, reconsiders, and finds the door has become a wall.' },
    ],
  },
  'c7.ex.coral': {
    lines: [
      { text: 'Coral-rag blocks queued for repairs, pale and pocked, still faintly reef. Somebody’s wall is about to remember the sea again.' },
    ],
  },
  'c7.ex.limepail': {
    lines: [
      { text: 'A pail of lime wash and a stiff brush. The wall and the salt air are in a very old argument, and this is the wall’s next word.' },
    ],
  },
  'c7.ex.scaffold': {
    lines: [
      { text: 'Mangrove poles lashed with rope, not a nail anywhere, holding up a mason who is at lunch. The knots are the oldest technology on the wall.' },
    ],
  },
  'c7.ex.cat.a': {
    lines: [
      { text: 'A cat, seated exactly where everyone must step around her. She looks at you the way a landlord looks at a tenant.' },
    ],
    effects: ['set:c7.cat.one'],
  },
  'c7.ex.cat.b': {
    lines: [
      { text: 'Still there. Stone Town cats fear nothing; the dhows shipped their ancestors in as ratters, and the harbor has owed them wages ever since.' },
    ],
    effects: ['set:c7.cat.two'],
  },
  'c7.ex.cat.c': {
    lines: [
      { text: 'You and the cat have reached an understanding. The understanding is that the cat was right.' },
    ],
  },
  'c7.ex.kuku.a': {
    lines: [
      { text: 'A white chicken patrols the shop front like she holds the lease.' },
      { text: 'Mgeni ni kuku mweupe, says the cloth inside: a guest is a white chicken. This one has heard it, and it went straight to her head.' },
    ],
    effects: ['set:c7.seen.kuku'],
  },
  'c7.ex.kuku.b': {
    lines: [
      { text: 'Still here, still white, still special. The proverb never said anything about modesty.' },
    ],
  },
  'c7.ex.baiskeli': {
    lines: [
      { text: 'A bicycle with a fish crate lashed over the back wheel. The bell works perfectly; the brakes are more of a conversation.' },
    ],
  },
  'c7.ex.henna': {
    lines: [
      { text: 'A low stool and a tray of henna cones, aimed and ready. Sit, hold still, and your hands leave wearing vines a wedding would envy.' },
    ],
  },
  'c7.ex.doormat': {
    lines: [
      { text: 'A woven mat squared to the doorstep, shoes queued beside it. You can take the household census without knocking.' },
    ],
  },
  'c7.ex.goal': {
    lines: [
      { text: 'Two flip-flops, one goal. Kickoff is when school ends; full time is when somebody’s mother uses their whole name.' },
    ],
  },
  'c7.ex.starfish': {
    lines: [
      { text: 'The tide left in a hurry and forgot things: a starfish, a shell, one small crab with big plans. It will be back for none of them.' },
    ],
  },
  'c7.ex.sailspar.after': {
    lines: [
      { text: 'A spare sail furled on its spar. You look at it differently now; somewhere in those wraps is the exact place the wind leans, and your hands know it.' },
    ],
  },
  'c7.ex.sailspar': {
    lines: [
      { text: 'A lateen sail furled fat along its spar, resting on trestles above the sand. Folded wind, waiting for the kaskazi to ask for it back.' },
    ],
  },
  'c7.ex.radio.a': {
    lines: [
      { text: 'A radio with its antenna aimed at Stone Town. Taarab pours out: strings, a violin, a voice saying something sharp, deniably.' },
    ],
    effects: ['set:c7.seen.radio'],
  },
  'c7.ex.radio.b': {
    lines: [
      { text: 'Bi Amina turns it up for one song and says only: Siti binti Saad recorded before any man on this coast dared. The shop folds cloth in time.' },
    ],
  },
  'c7.ex.sewing': {
    lines: [
      { text: 'Scissors, chalk, a tape measure coiled like something tame. This is the table where a gora becomes two kangas: one to keep, one to give.' },
    ],
  },
  'c7.ex.ukuta': {
    lines: [
      { text: 'A low coral wall, limed on the street side and left honest on the other. Waist high, which is the exact height of a conversation.' },
      { text: 'Bougainvillea has been over the top of it for years. Nobody planted it. Nobody is going to be the one to cut it, either.' },
    ],
  },
  'c7.ex.makuti': {
    lines: [
      { text: 'Plaited coconut thatch on two poles, thrown out over the baraza. The shade arrives about a step before you do, and it is always cooler than it looks.' },
    ],
  },
  'c7.ex.madafu': {
    lines: [
      { text: 'Green coconuts heaped where the shade falls, panga standing in the pile. One is already open, going warm while its owner argues about something else.' },
    ],
  },
  'c7.ex.dagaa': {
    lines: [
      { text: 'Whitebait spread on a mesh rack, drying hard and silver in the sun. An octopus hangs on the line above, giving up its arms one at a time.' },
      { text: 'It will all be someone else’s stew by Thursday. The rack goes back under the house until the next good haul.' },
    ],
  },
  'c7.ex.nyavu': {
    lines: [
      { text: 'A net spread on the sand to dry, corks along one edge, stones along the other. The mending needle is stuck in where the work stopped for tea.' },
    ],
  },
  'c7.ex.mkokoteni': {
    lines: [
      { text: 'A handcart tipped onto its shafts, sacks still aboard. Nobody unloads a cart they can lean, and nobody leans a cart they mean to move soon.' },
    ],
  },
  'c7.ex.wallcoral': {
    lines: [
      { text: 'Coral rag under lime wash: rubble off a reef that stopped being a reef long before anyone here was born, painted white and asked to be a room.' },
      { text: 'The lumps take the light unevenly, so the wall is never one colour twice in a day. The carved lintel over it came off a mangrove.' },
    ],
  },
  'c7.ex.floorlimescreed': {
    lines: [
      { text: 'Lime screed, cool through your soles even at two in the afternoon. This is why the shoes came off at the door and not politeness.' },
    ],
  },
  'c7.ex.rugmkeka': {
    lines: [
      { text: 'A mkeka, plaited palm leaf with two dyed strips running its length. Everything in this shop that matters gets done sitting on one of these.' },
    ],
  },
};

/** Examine arms; shared kinds stay map-tagged so their words stay home. */
export const ZANZIBAR_EXAMINES: Record<string, ExamineArm[]> = {
  // Bi Amina's shop is skinned to coral rag, lime screed and mkeka in
  // `art/sets/zanzibar.ts`. The words follow the material.
  wallInt: [{ map: 'kangashop', node: 'c7.ex.wallcoral' }],
  floorEarth: [{ map: 'kangashop', node: 'c7.ex.floorlimescreed' }],
  rug: [{ map: 'kangashop', node: 'c7.ex.rugmkeka' }],
  nyumba: [{ node: 'c7.ex.nyumba' }],
  mlango: [{ node: 'c7.ex.mlango' }],
  baraza: [{ node: 'c7.ex.baraza' }],
  ngalawa: [{ node: 'c7.ex.ngalawa' }],
  dhow: [{ node: 'c7.ex.dhow' }],
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
    { node: 'c7.ex.kline.b' },
  ],
  baoboard: [
    { when: { not: ['c7.seen.bao'] }, node: 'c7.ex.bao.a' },
    { node: 'c7.ex.bao.b' },
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
  stall: [{ map: 'zanzibar', node: 'c7.ex.stall' }],
  tree: [{ map: 'zanzibar', node: 'c7.ex.tree' }],
  signpost: [{ map: 'zanzibar', node: 'c7.ex.sign' }],
  pierdeck: [{ map: 'zanzibar', node: 'c7.ex.jetty' }],
  table: [{ map: 'zanzibar', node: 'c7.ex.table' }],
  shelf: [{ map: 'kangashop', node: 'c7.ex.shelfshop' }],
};

/** Event-triggered nodes, listed with their gating so tests can walk them. */
export const ZANZIBAR_EVENTS = [
  { node: 'c7.arrive' },
  { when: { has: ['c7.sail.start'] }, node: 'c7.sail.done' },
  { when: { has: ['c7.cook.start'] }, node: 'c7.cook.finish' },
];
