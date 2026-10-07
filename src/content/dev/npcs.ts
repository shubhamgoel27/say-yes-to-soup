import { PAL } from '../../engine/config';
import type { EventNode, ExamineArm, NodeMap, NpcDef } from '../schema';

/**
 * The villagers of Ch'aska Pampa and everything they can say.
 *
 * Writing rules (the quality bar):
 *  - nobody explains their culture; they live it, at most two short sentences a box
 *  - getting something slightly wrong is always the warmer scene
 *  - Quechua arrives by exposure, never as a vocab lesson
 *  - people disagree with each other and tease each other
 */

/** Animals ignore the look; the type simply requires one. */
const PLACEHOLDER_LOOK = {
  skin: '#c98f5f',
  hair: '#3a2a1c',
  cloth: PAL.terracotta,
  stripe: PAL.cream,
  hat: PAL.gold,
  hatStyle: 'none',
} as const;

export const NPCS: NpcDef[] = [
  {
    id: 'aurelio',
    name: 'Don Aurelio',
    map: 'village',
    pos: [20, 14],
    range: 0,
    look: {
      skin: '#b07948',
      hair: '#8f8578',
      cloth: '#6b4a3a',
      stripe: PAL.cream,
      hat: PAL.goldDark,
      hatStyle: 'chullu',
    },
    entry: [
      {
        // A player who reaches the letter without ever sitting at the well
        // gets his greeting first, in the same sitting, not a second visit.
        when: {
          has: ['bundle.delivered', 'challar.done', 'pallay.done', 'her.zoila'],
          not: ['nani.letter', 'met.aurelio'],
        },
        node: 'aurelio.nani.meet',
      },
      { when: { not: ['met.aurelio'] }, node: 'aurelio.first' },
      {
        // He will not hand over the letter until somebody has said her name
        // out loud. Every chapter after this one assumes you are carrying it.
        when: {
          has: ['bundle.delivered', 'challar.done', 'pallay.done', 'her.zoila'],
          not: ['nani.letter'],
        },
        node: 'aurelio.nani',
      },
      { when: { has: ['nani.letter'], not: ['story.complete'] }, node: 'aurelio.go' },
      { when: { has: ['story.complete'] }, node: 'aurelio.done' },
      { when: { not: ['page.words.chaska'] }, node: 'aurelio.chaska' },
      { node: 'aurelio.idle' },
    ],
  },
  {
    id: 'rosa',
    name: 'Rosa',
    map: 'village',
    // Just off the corner where the worn path turns toward her door, not on it.
    pos: [15, 28],
    range: 2,
    look: {
      skin: '#b97f4f',
      hair: '#2b1c10',
      cloth: '#8a3a2e',
      stripe: PAL.cream,
      hat: '#7a2f24',
      hatStyle: 'montera',
      skirt: '#7a4460',
    },
    entry: [
      { when: { not: ['met.rosa'] }, node: 'rosa.first' },
      { when: { has: ['errand.rosa-bundle'], not: ['bundle.delivered'] }, node: 'rosa.waiting' },
      { when: { has: ['bundle.delivered'], not: ['rosa.thanked'] }, node: 'rosa.even' },
      { when: { has: ['carry.chicha'] }, node: 'rosa.carrying' },
      { when: { has: ['chicha.spilled'] }, node: 'rosa.refill' },
      {
        when: { has: ['challar.done'], not: ['chicha.delivered'] },
        node: 'rosa.chichaAsk',
      },
      { when: { has: ['story.complete'] }, node: 'rosa.epilogue' },
      { node: 'rosa.idle' },
    ],
  },
  {
    id: 'justina',
    name: 'Justina',
    map: 'village',
    pos: [35, 24],
    range: 2,
    look: {
      skin: '#c08050',
      hair: '#20140c',
      cloth: PAL.skyDeep,
      stripe: PAL.gold,
      hat: '#8a3a2e',
      hatStyle: 'montera',
      skirt: '#38506e',
    },
    entry: [
      { when: { has: ['errand.rosa-bundle'], not: ['bundle.delivered'] }, node: 'justina.bundle' },
      // Normally handed over the moment the watia is eaten; this arm only
      // catches a journey saved between the two.
      {
        when: { has: ['watia.done'], not: ['wichuna.have'] },
        node: 'justina.wichuna',
      },
      { when: { has: ['dig.done'], not: ['watia.done'] }, node: 'justina.watiaInvite' },
      { when: { not: ['met.justina'] }, node: 'justina.first' },
      { when: { has: ['story.complete'] }, node: 'justina.epilogue' },
      { when: { has: ['bundle.delivered'] }, node: 'justina.after' },
      { node: 'justina.idle' },
    ],
  },
  {
    id: 'mateo',
    name: 'Mateo',
    map: 'village',
    pos: [33, 15],
    // Two, not four: a leash of four reached the cell behind the tree at
    // 35,12, where he stood with his head growing out of its canopy.
    range: 2,
    look: {
      skin: '#c98f5f',
      hair: '#3a2a1c',
      cloth: PAL.greenDark,
      stripe: PAL.gold,
      hat: PAL.terracotta,
      hatStyle: 'chullu',
    },
    entry: [
      { when: { not: ['met.mateo'] }, node: 'mateo.first' },
      { when: { has: ['story.complete'] }, node: 'mateo.epilogue' },
      { node: 'mateo.idle' },
    ],
  },
  {
    id: 'carmen',
    name: 'Doña Carmen',
    map: 'village',
    pos: [30, 12],
    range: 2,
    look: {
      skin: '#a06a40',
      hair: '#5c5148',
      cloth: PAL.terracotta,
      stripe: PAL.sky,
      hat: PAL.stoneDark,
      hatStyle: 'montera',
      skirt: '#5c3a52',
    },
    entry: [
      // The pick comes home in one walk, Justina to Carmen: whoever carries
      // it gets the loom, met or not. No fetch-and-return.
      {
        when: { has: ['wichuna.have'], not: ['wichuna.returned'] },
        node: 'carmen.wichuna',
      },
      { when: { not: ['met.carmen'] }, node: 'carmen.first' },
      {
        when: { has: ['wichuna.returned'], not: ['pallay.done'] },
        node: 'carmen.weaveOffer',
      },
      // The name, and the half warp. Once you have sat at her loom she is
      // willing to be annoyed at somebody in front of you.
      { when: { has: ['pallay.done'], not: ['her.zoila'] }, node: 'carmen.zoila' },
      { when: { has: ['pallay.done'], not: ['riddle.done'] }, node: 'carmen.riddle' },
      { when: { has: ['story.complete'] }, node: 'carmen.epilogue' },
      { when: { has: ['pallay.done'] }, node: 'carmen.after' },
      { node: 'carmen.idle' },
    ],
  },
  {
    id: 'teofilo',
    name: 'Don Teófilo',
    map: 'chicheria',
    pos: [4, 4],
    range: 0,
    look: {
      skin: '#9c6b42',
      hair: '#8f8578',
      cloth: '#4a5e46',
      stripe: PAL.gold,
      hat: '#5c4a36',
      hatStyle: 'chullu',
    },
    entry: [
      { when: { has: ['carry.chicha'] }, node: 'teofilo.chicha' },
      { when: { not: ['challar.done'] }, node: 'teofilo.first' },
      { when: { not: ['page.words.haku'] }, node: 'teofilo.haku' },
      { when: { has: ['story.complete'] }, node: 'teofilo.epilogue' },
      { node: 'teofilo.idle' },
    ],
  },
  {
    id: 'allqu',
    name: 'The Dog',
    map: 'village',
    pos: [23, 18],
    range: 3,
    sprite: 'dog',
    look: PLACEHOLDER_LOOK,
    entry: [
      { when: { not: ['allqu.friend'] }, node: 'allqu.first' },
      { node: 'allqu.idle' },
    ],
  },
  {
    id: 'pilar',
    name: 'Pilar',
    map: 'village',
    pos: [8, 18],
    range: 2,
    look: {
      skin: '#d8a06c',
      hair: '#241a12',
      cloth: '#3f7fb0',
      stripe: '#f2e6d0',
      hat: PAL.gold,
      hatStyle: 'none',
      skirt: '#d9694a',
      kid: true,
    },
    entry: [
      { when: { not: ['met.pilar'] }, node: 'pilar.first' },
      { when: { has: ['story.complete'], not: ['pilar.sea'] }, node: 'pilar.epilogue' },
      { when: { has: ['page.people.nani'], not: ['pilar.promoted'] }, node: 'pilar.promoted' },
      { when: { not: ['pilar.s1'] }, node: 'pilar.rocks' },
      { when: { not: ['pilar.s2'] }, node: 'pilar.tour' },
      { when: { not: ['pilar.s3'] }, node: 'pilar.mayor' },
      { when: { has: ['pilar.promoted'], not: ['pilar.s4'] }, node: 'pilar.ships' },
      { node: 'pilar.idle' },
    ],
  },
  {
    id: 'chasca',
    name: 'Chasca',
    map: 'la-bajada',
    pos: [12, 18],
    range: 0,
    look: {
      skin: '#b3814f',
      hair: '#241a12',
      cloth: '#3d5c66',
      stripe: PAL.cream,
      hat: '#8a6238',
      hatStyle: 'montera',
      skirt: '#5c4632',
    },
    entry: [
      { when: { not: ['met.chasca'] }, node: 'chasca.first' },
      { when: { not: ['photo.taken'] }, node: 'chasca.offer' },
      { node: 'chasca.idle' },
    ],
  },
  {
    id: 'faustino',
    name: 'Faustino',
    map: 'east-road',
    // West of the pass gap, on purpose. He camped at the old tambo beyond
    // the wall once, which put the only man who can whistle Paca aside on
    // the far side of the llama plugging the only opening: a hard softlock
    // proven by flood fill and found by a real player standing at it.
    pos: [24, 8],
    range: 1,
    look: {
      skin: '#a5744a',
      hair: '#241a12',
      cloth: '#5c4a6e',
      stripe: PAL.gold,
      hat: '#3d3226',
      hatStyle: 'chullu',
    },
    entry: [
      { when: { not: ['met.faustino'] }, node: 'faustino.first' },
      { when: { not: ['paca.moved'] }, node: 'faustino.whistle' },
      { when: { not: ['kintu.done'] }, node: 'faustino.kintu' },
      { node: 'faustino.idle' },
    ],
  },
  {
    id: 'paca',
    name: 'Paca',
    map: 'east-road',
    pos: [30, 6],
    range: 0,
    sprite: 'llama',
    look: PLACEHOLDER_LOOK,
    entry: [
      { when: { not: ['paca.moved'] }, node: 'paca.block' },
      // Keep coming back and she keeps having opinions. The third audience
      // is the one she has been saving.
      { when: { not: ['egg.paca.one'] }, node: 'paca.after' },
      { when: { not: ['egg.paca.two'] }, node: 'paca.opinions' },
      { node: 'paca.medal' },
    ],
  },
  {
    id: 'llama-urpi',
    name: 'Llama',
    map: 'east-road',
    pos: [20, 4],
    range: 3,
    sprite: 'llamaBrown',
    look: PLACEHOLDER_LOOK,
    entry: [{ node: 'llama.look' }],
  },
  {
    id: 'llama-tika',
    name: 'Llama',
    map: 'east-road',
    pos: [44, 8],
    range: 3,
    sprite: 'llama',
    look: PLACEHOLDER_LOOK,
    entry: [{ node: 'llama.look2' }],
  },
];

export const NODES: NodeMap = {
  // ---------------- intro ----------------
  // Three lines, then the village. Everything else the intro used to narrate
  // (the postcards, the envelope, the bag nobody believed) now lives in the
  // bag itself, one card per look, at whatever pace the player browses.
  'intro.wake': {
    lines: [
      { text: 'The bus left you at the bottom of the valley. The driver pointed uphill: arriba. The road gave out an hour later, at a well.' },
      { text: 'Her journal, half full, opens on one line: "Ch’aska Pampa. Start where the water is."' },
      { text: 'The rest of her page is blank. The village is not.' },
    ],
    effects: ['set:intro.done'],
  },

  // ---------------- the bag, and the postcards in it ----------------
  // The q'epi at the spawn. Each look draws the next card; no card repeats.
  'ex.bag.first': {
    lines: [
      { text: 'Your bag. You said this was a short trip. Nobody believed you, least of all the bag.' },
      { text: 'Her postcards ride in the top pocket, in order.' },
    ],
    effects: ['set:bag.opened'],
  },
  'ex.bag.card1': {
    lines: [
      { text: 'The first postcard: a camel she never met, mid-opinion. On the back she swears the camel started it.' },
    ],
    effects: ['set:bag.card1'],
  },
  'ex.bag.card2': {
    lines: [
      { text: 'Next card: a sea the color of a bruise. She swam in it anyway. "Cold is a rumor," she wrote. She lied.' },
    ],
    effects: ['set:bag.card2'],
  },
  'ex.bag.card3': {
    lines: [
      { text: 'The creased one: "Eat first, ask after," in six languages. You can read two of them and believe all six.' },
    ],
    effects: ['set:bag.card3'],
  },
  'ex.bag.card4': {
    lines: [
      { text: 'The last cards stopped being from elsewhere. Then, last winter, they stopped.' },
      { text: 'Under them, the lawyer\'s envelope: no money, one note. The empty half of the journal was always yours.' },
    ],
    effects: ['set:bag.done'],
  },
  'ex.bag.after': {
    lines: [{ text: 'The bag waits, packed for a short trip. You both know better now.' }],
  },

  // ---------------- Don Aurelio ----------------
  'aurelio.first': {
    lines: [{ who: 'Don Aurelio', text: 'Allillanchu.' }],
    choices: [
      { text: '"...Alli... llanchu?"', goto: 'aurelio.first.echo' },
      { text: 'Ask about the village', goto: 'aurelio.first.business' },
    ],
  },
  'aurelio.first.echo': {
    lines: [
      { who: 'Don Aurelio', text: 'Allillanmi! Ha. You said it like a sneeze.' },
      { who: 'Don Aurelio', text: 'But you said it. Here, the stone is warm. There is room.' },
    ],
    effects: ['set:met.aurelio', 'journal:words.allillanchu', 'journal:people.aurelio'],
  },
  'aurelio.first.business': {
    lines: [
      { who: 'Don Aurelio', text: 'Mm. First: did you sleep warm? Your family is well? No rain on the pass?' },
      { text: 'By the third answer you have forgotten your question.' },
      { who: 'Don Aurelio', text: 'Now. What did you want to ask?' },
    ],
    effects: ['set:met.aurelio', 'journal:customs.warmup', 'journal:people.aurelio'],
    next: 'aurelio.chaska',
  },
  'aurelio.chaska': {
    lines: [
      { who: 'Don Aurelio', text: 'This place? Ch’aska Pampa. Star plain. When it rains, the puddles catch stars. Check my work tonight.' },
    ],
    effects: ['journal:words.chaska'],
  },
  'aurelio.idle': {
    lines: [
      { who: 'Don Aurelio', text: 'The well is older than the church. Have some; water is nobody’s to sell.' },
    ],
  },

  // ---------------- Rosa ----------------
  'rosa.first': {
    lines: [
      { who: 'Rosa', text: 'You walked up from the valley? Sit, sit, {name}. The soup is hot and you look like wind.' },
      { text: 'A bowl lands in front of you before you can answer. Steam. Potatoes. Something green and sharp.' },
    ],
    effects: ['journal:dishes.rosasoup'],
    choices: [
      { text: 'Offer a few coins', goto: 'rosa.coins' },
      { text: 'Just say thank you', goto: 'rosa.thanks' },
    ],
  },
  'rosa.coins': {
    lines: [
      { text: 'Rosa looks at the coins like a strange beetle.' },
      { who: 'Rosa', text: 'Keep them. Here, help comes back as help. Eat now, argue after.' },
    ],
    effects: ['set:met.rosa', 'journal:customs.ayni', 'journal:people.rosa'],
    next: 'rosa.bundle',
  },
  'rosa.thanks': {
    lines: [
      { who: 'Rosa', text: 'Sulpayki, we say. Sool-PIE-kee.' },
      { who: 'Rosa', text: 'It costs nothing and it pays everything. Now eat.' },
    ],
    effects: ['set:met.rosa', 'journal:words.sulpayki', 'journal:people.rosa'],
    next: 'rosa.bundle',
  },
  'rosa.bundle': {
    lines: [
      { who: 'Rosa', text: 'Since your legs work: carry this bundle up to my sister Justina, in the terraces. Then we are even. Almost.' },
    ],
    effects: ['errand:rosa-bundle', 'set:errand.rosa-bundle'],
  },
  'rosa.waiting': {
    lines: [
      { who: 'Rosa', text: 'The bundle, wawa. Justina. Terraces. Up. Bring patience; she talks.' },
    ],
  },
  'rosa.even': {
    lines: [
      { who: 'Rosa', text: 'So she kept you talking. Ha! I warned you.' },
      { who: 'Rosa', text: 'Now we are even, so now we can begin. Hold out your pocket.' },
      { text: 'She pours in a handful of warm boiled corn.' },
    ],
    effects: ['set:rosa.thanked', 'journal:dishes.mote'],
  },
  'rosa.idle': {
    lines: [
      { who: 'Rosa', text: 'Flag up, chicha fresh. Flag down, come back tomorrow; it will be up.' },
    ],
  },
  'rosa.epilogue': {
    lines: [
      { who: 'Rosa', text: 'So the journal is full. Good. Start your own, and put my soup on the first page.' },
    ],
  },

  // ---- the steady-hands chicha delivery (a walking puzzle) ----
  'rosa.chichaAsk': {
    lines: [
      { who: 'Rosa', text: 'Teófilo left his caporal here, full to the brim. His knees refuse the trip back.' },
      { who: 'Rosa', text: 'Carry it in? Bump into things and the floor drinks it.' },
    ],
    choices: [
      { text: 'Take the glass, carefully', goto: 'rosa.chichaAccept' },
      { text: 'Maybe with steadier hands later', goto: 'rosa.chichaLater' },
    ],
  },
  'rosa.chichaAccept': {
    lines: [
      { text: 'The glass is fuller than physics should allow. Three good bumps and it is gone.' },
    ],
    effects: ['set:carry.chicha'],
  },
  'rosa.chichaLater': {
    lines: [{ who: 'Rosa', text: 'Mm. The glass agrees to wait. The glass is more patient than Teófilo.' }],
  },
  'rosa.carrying': {
    lines: [
      { who: 'Rosa', text: 'The chicha goes THAT way. Walk like a llama on a ledge: slowly, and certain.' },
    ],
  },
  'rosa.refill': {
    lines: [
      { text: 'Rosa looks at the empty glass, then at you, and laughs so hard the cuyes relocate.' },
      { who: 'Rosa', text: 'Pachamama got a generous pour. Again: gently.' },
    ],
    effects: ['clear:chicha.spilled', 'set:carry.chicha'],
  },
  'teofilo.chicha': {
    lines: [
      { text: 'You set the caporal down in front of Teófilo. Not a drop surrendered.' },
      { who: 'Don Teófilo', text: 'Not one drop! Tomakusunchis: let us drink together. There is no other kind.' },
      { text: 'The first splash goes to the earth. Then the glass gets to be a glass.' },
    ],
    effects: ['clear:carry.chicha', 'set:chicha.delivered', 'journal:words.tomakusunchis'],
  },
  'teofilo.epilogue': {
    lines: [
      { who: 'Don Teófilo', text: 'Zoila\'s grandchild, they tell me. I owed her a laugh for fifty years. You collected it.' },
    ],
  },

  // ---------------- Justina ----------------
  'justina.first': {
    lines: [
      { who: 'Justina', text: 'You are standing on my potatoes.' },
      { who: 'Justina', text: 'No, those. Step left. ...There. Now we can talk like people.' },
    ],
    effects: ['set:met.justina', 'journal:people.justina'],
  },
  'justina.bundle': {
    lines: [
      { who: 'Justina', text: 'From Rosa? Give here. Ah. Wool, bread, and worry, as always.' },
      { who: 'Justina', text: 'Sulpayki, wawa. Yes, wawa. Everyone younger than my knees is wawa.' },
    ],
    effects: [
      'errand.done',
      'set:bundle.delivered',
      'set:met.justina',
      'journal:people.justina',
      'journal:words.wawa',
    ],
    next: 'justina.watia',
  },
  // No watia lecture here: the oven explains itself when it gets built, and
  // its journal page arrives with the first bite, at watia.finish.
  'justina.watia': {
    lines: [
      { who: 'Justina', text: 'Those mounds? Early papas, ready. Dig them up and I will tell you their names. Every papa has a name.' },
    ],
    effects: ['set:dig.invite'],
  },
  'justina.after': {
    lines: [
      { who: 'Justina', text: 'Forty kinds of papa in these rows. I know each one by its face.' },
    ],
    choices: [
      { text: 'Build the watia again', when: { has: ['watia.done'] }, goto: 'justina.watiaAgain' },
      { text: 'Leave her to the rows', goto: 'justina.idle' },
    ],
  },
  'justina.watiaAgain': {
    lines: [
      { who: 'Justina', text: 'The ground is still warm from last time. Stack me another dome, just for the eating.' },
    ],
    effects: ['set:replay.mode', 'set:watia.start'],
  },
  'justina.idle': {
    lines: [
      { who: 'Justina', text: 'The stream does the talking for both of us today. It never repeats itself.' },
    ],
  },

  // ---------------- Mateo ----------------
  'mateo.first': {
    lines: [
      { who: 'Mateo', text: 'My grandfather knits faster than I text. I timed us. He heard, and knitted me this hat.' },
      { who: 'Mateo', text: 'A chullu keeps thoughts warm, he says. My phone dies by noon, so maybe he wins.' },
    ],
    effects: ['set:met.mateo', 'journal:people.mateo', 'journal:customs.chullu'],
  },
  'mateo.idle': {
    lines: [
      { who: 'Mateo', text: 'Everyone says the village is emptying. From the ridge, where the signal is, it looks full.' },
    ],
    choices: [
      { text: '"Remind me where I was headed?"', when: { has: ['pallay.done'] }, goto: 'mateo.thread' },
      { text: 'Leave him to the signal', goto: 'mateo.threadNo' },
    ],
  },
  'mateo.thread': {
    lines: [
      { who: 'Mateo', text: 'You have GPS on your wrist and I climb a ridge for one bar. Hold it out.' },
    ],
    effects: ['thread:'],
  },
  'mateo.threadNo': {
    lines: [{ who: 'Mateo', text: 'Say hi to the ridge if you pass it. The ridge and I are close.' }],
  },

  // ---------------- Doña Carmen ----------------
  'carmen.first': {
    lines: [
      { who: 'Doña Carmen', text: 'Mind the warp; it bites strangers. This lliclla is for my granddaughter in Lima.' },
      { who: 'Doña Carmen', text: 'The zigzag is the river, and the road of stars. The thread is not confused; you are.' },
    ],
    effects: ['set:met.carmen', 'journal:people.carmen', 'journal:words.lliclla'],
  },
  'carmen.idle': {
    lines: [
      { who: 'Doña Carmen', text: 'My mother wove her stories. I weave mine. The wawa who wears this carries all of us. Heavy? No. Warm.' },
    ],
  },

  // ---------------- Don Teófilo, and the first splash ----------------
  'teofilo.first': {
    lines: [
      { who: 'Don Teófilo', text: 'Ah! The bundle-carrier. Rosa told the whole room before you reached the door.' },
      { text: 'He pats the stool beside his, the seat he has kept for forty years, and slides you a glass of cloudy chicha.' },
    ],
    choices: [
      { text: 'Drink up', goto: 'teofilo.drink' },
      { text: 'Watch him first', goto: 'teofilo.watch' },
    ],
  },
  'teofilo.drink': {
    lines: [
      { text: 'You drink. Sour, alive, better than it sounds.' },
      { who: 'Don Teófilo', text: 'HA! Straight down, and the earth got nothing! First splash is for Pachamama. Again.' },
      { text: 'You pour a little out. Teófilo nods like something is settled.' },
    ],
    effects: ['set:challar.done', 'set:met.teofilo', 'journal:customs.challar', 'journal:people.teofilo'],
  },
  'teofilo.watch': {
    lines: [
      { text: 'You wait. He tips a little to the floor, murmurs something, and drinks. You copy him, splash and all.' },
      { who: 'Don Teófilo', text: 'Yaw! You watched first. Rarer than it should be. Pachamama always drinks first.' },
    ],
    effects: ['set:challar.done', 'set:met.teofilo', 'journal:customs.challar', 'journal:people.teofilo'],
  },
  'teofilo.haku': {
    lines: [
      { who: 'Don Teófilo', text: 'Haku! Let us go! To the terraces! To the ridge!' },
      { text: 'He does not move. His knees have voted against the motion.' },
      { who: 'Don Teófilo', text: 'The word still counts. You go; I supervise.' },
    ],
    effects: ['journal:words.haku'],
  },
  'teofilo.idle': {
    lines: [
      { who: 'Don Teófilo', text: 'When the flag is up, this seat is mine. The only appointment I have kept for forty years.' },
    ],
  },

  // ---------------- Carmen's wichuna, carried one way ----------------
  // Justina hands it over with the first bite of the watia; it goes downhill
  // to Carmen in one walk, and the loom is waiting at the other end.
  'justina.wichuna': {
    lines: [
      { who: 'Justina', text: 'Since you are going down anyway. This is Doña Carmen’s wichuna. I borrowed it at planting.' },
      { text: 'She unwraps a polished bone pick from her lliclla like something precious. It is.' },
      { who: 'Justina', text: 'Tell her I was returning it. In my own season. She will know which season that is.' },
    ],
    effects: ['set:wichuna.have', 'errand:carmen-wichuna', 'set:errand.carmen-wichuna'],
  },
  'carmen.wichuna': {
    lines: [
      { who: 'Doña Carmen', text: 'Ah. There you are, old friend.' },
      { text: 'She is talking to the pick. Then she remembers you, and pats the ground beside the loom.' },
      { who: 'Doña Carmen', text: 'This lliclla is for my granddaughter in Lima. The border is my mother; the zigzag, the river.' },
      { who: 'Doña Carmen', text: 'Sumaq, no? Beautiful. Also delicious. Why keep two words?' },
    ],
    effects: [
      'set:wichuna.returned',
      'errand.done',
      'set:met.carmen',
      'journal:people.carmen',
      'journal:words.lliclla',
      'journal:words.sumaq',
    ],
    next: 'carmen.weaveOffer',
  },
  'carmen.weaveOffer': {
    lines: [
      { who: 'Doña Carmen', text: 'A returned tool must work the same day; that is its thanks. Sit at the loom.' },
    ],
    choices: [
      { text: 'Sit at the loom', goto: 'carmen.weaveStart' },
      { text: 'Another time', goto: 'carmen.weaveLater' },
    ],
  },
  'carmen.weaveStart': {
    lines: [{ text: 'You take the strap. The loom tightens against your back like a patient animal.' }],
    effects: ['set:weave.start'],
  },
  'carmen.weaveLater': {
    lines: [
      { who: 'Doña Carmen', text: 'Mm. The loom has waited fifty years for lazier hands than yours. It can wait an afternoon.' },
    ],
  },
  'carmen.woven': {
    lines: [
      { text: 'Row by row the pattern comes: crooked, then less crooked, then almost right.' },
      { who: 'Doña Carmen', text: 'Ha! Crooked as the river. Good. Now the cloth has you in it too.' },
      { text: 'She knots your rows into a band at your wrist. "So your hands remember the mountain."' },
      { who: 'Doña Carmen', text: 'When you lose the way, ask your wrist. Walk where the red spools.' },
    ],
    // The trailing 'thread:' makes her teach line literal: the moment her
    // words close, the thread spools once from the loom, unasked, so the
    // player has seen it work before ever pressing N.
    effects: ['clear:weave.start', 'set:pallay.done', 'set:keepsake.band', 'journal:customs.pallay', 'thread:'],
    // She does not wait for a second visit to say it; the name comes while
    // her hands are still on your knot.
    next: 'carmen.zoila',
  },
  'carmen.after': {
    lines: [
      { who: 'Doña Carmen', text: 'The lliclla grows a row a day. Like the potatoes. Nothing good hurries.' },
    ],
    choices: [
      { text: 'Sit at the loom again', when: { has: ['pallay.done'] }, goto: 'carmen.weaveAgain' },
      { text: 'Just passing by', goto: 'carmen.idle' },
    ],
  },
  'carmen.weaveAgain': {
    lines: [
      { who: 'Doña Carmen', text: 'No lesson this time, no cloth to keep. Only the pleasure of a straight row. Sit.' },
    ],
    effects: ['set:replay.mode', 'set:weave.start'],
  },
  'carmen.epilogue': {
    lines: [
      { who: 'Doña Carmen', text: 'A finished journal and a crooked row in my cloth. Zoila would call that a fair trade. She would be right.' },
    ],
  },

  // ---- Her, beat one: the name, and the goodbye that was not one ----
  // Carmen never stops weaving through any of this. She is not telling you
  // something; she is finishing a complaint she started in 1974.
  'carmen.zoila': {
    lines: [
      { who: 'Doña Carmen', text: 'You held that shuttle the way Zoila did. Badly, and entirely unbothered.' },
      { text: 'Zoila. You have only ever called her Nani.' },
      { text: 'Carmen says it like the name of someone who owes her money.' },
    ],
    next: 'carmen.zoila2',
  },
  'carmen.zoila2': {
    lines: [
      { who: 'Doña Carmen', text: 'We were warping this loom together. I slept. By morning her half was tied off and she was gone down the west road.' },
      { who: 'Doña Carmen', text: 'A note on the post. I am still not calling that a goodbye.' },
    ],
    choices: [
      { text: '"She meant to come back."', goto: 'carmen.zoila.meant' },
      { text: 'Say nothing.', goto: 'carmen.zoila.quiet' },
    ],
  },
  'carmen.zoila.meant': {
    lines: [
      { who: 'Doña Carmen', text: 'Everyone means to. I kept her side of the warp two years.' },
      { text: 'She does not look up.' },
    ],
    effects: ['set:her.zoila', 'journal:her.chaska'],
  },
  'carmen.zoila.quiet': {
    lines: [
      { who: 'Doña Carmen', text: 'Good. There is nothing to say. I kept her side of the warp two years.' },
      { text: 'Her hands have not stopped once.' },
    ],
    effects: ['set:her.zoila', 'journal:her.chaska'],
  },

  // ---- Carmen's pattern quiz (a riddle from a person, not a system) ----
  'carmen.riddle': {
    lines: [
      { who: 'Doña Carmen', text: 'You wove a row, so now you get examined. Which one is the river?' },
    ],
    choices: [
      { text: 'The zigzag', goto: 'carmen.r1right' },
      { text: 'The little diamond', goto: 'carmen.r1diamond' },
      { text: 'The eye shape', goto: 'carmen.r1eye' },
    ],
  },
  'carmen.r1right': {
    lines: [
      { who: 'Doña Carmen', text: 'Mayu q\'enqo. Correct, and do not get smug.' },
    ],
    next: 'carmen.r3',
  },
  'carmen.r1diamond': {
    lines: [
      { who: 'Doña Carmen', text: 'That is a qocha, a lake: a river that sat down and gave up. The zigzag, wawa. Rivers argue.' },
    ],
    next: 'carmen.r3',
  },
  'carmen.r1eye': {
    lines: [
      { who: 'Doña Carmen', text: 'The ñawi? That is an eye. If your rivers have eyes, we should discuss what is in your cup.' },
    ],
    next: 'carmen.r3',
  },
  'carmen.r3': {
    lines: [
      { who: 'Doña Carmen', text: 'Last one, and it matters. Who knits the chullus?' },
    ],
    choices: [
      { text: 'The men', goto: 'carmen.r3right' },
      { text: 'The grandmothers', goto: 'carmen.r3wrong' },
      { text: 'The llamas', goto: 'carmen.r3llama' },
    ],
  },
  'carmen.r3right': {
    lines: [
      { who: 'Doña Carmen', text: 'The men! Since they were boys. Ask Mateo, and watch him admit it.' },
    ],
    next: 'carmen.riddleEnd',
  },
  'carmen.r3wrong': {
    lines: [
      { who: 'Doña Carmen', text: 'The grandmothers WEAVE. The men knit. We divide the cloth so everyone stays necessary.' },
    ],
    next: 'carmen.riddleEnd',
  },
  'carmen.r3llama': {
    lines: [
      { text: 'Carmen looks at you for a long, level moment.' },
      { who: 'Doña Carmen', text: 'The llamas GROW the wool. If they knitted it too, what would be left for us?' },
    ],
    next: 'carmen.riddleEnd',
  },
  'carmen.riddleEnd': {
    lines: [
      { who: 'Doña Carmen', text: 'Enough. You pass, roughly. Wrist.' },
      { text: 'She turns the band once, reading it, and ties one more knot into it. Tight.' },
    ],
    effects: ['set:riddle.done'],
  },

  // ---------------- Aurelio remembers ----------------
  // By the time this fires the player has already found Zoila at Carmen's
  // loom (her.zoila gates the entry). Aurelio does not retell her; he hands
  // over what he kept. Her portrait lives in the journal's Nani margins.
  'aurelio.nani.meet': {
    lines: [{ who: 'Don Aurelio', text: 'Allillanchu. At last. I have watched you run errands past my well since you came up the valley.' }],
    choices: [
      { text: '"...Alli... llanchu?"', goto: 'aurelio.nani.echo' },
      { text: 'Sit down on the warm stone', goto: 'aurelio.nani.sit' },
    ],
  },
  'aurelio.nani.echo': {
    lines: [{ who: 'Don Aurelio', text: 'Allillanmi! Ha. You said it like a sneeze. But you said it.' }],
    effects: ['set:met.aurelio', 'journal:words.allillanchu', 'journal:people.aurelio'],
    next: 'aurelio.nani',
  },
  'aurelio.nani.sit': {
    lines: [{ text: 'He shifts over without being asked. The stone is warm where he was.' }],
    effects: ['set:met.aurelio', 'journal:people.aurelio'],
    next: 'aurelio.nani',
  },
  'aurelio.nani': {
    lines: [
      { who: 'Don Aurelio', text: 'I have been deciding something all morning, and it is decided.' },
      { who: 'Don Aurelio', text: 'I watched Zoila sew that red thread on your journal. Right here, 1974.' },
    ],
    next: 'aurelio.nani2',
  },
  'aurelio.nani2': {
    lines: [
      { text: 'From inside his poncho, a letter, soft with fifty years of carrying.' },
      { who: 'Don Aurelio', text: 'She left it for the road west and never came back for it. Ayni does not expire.' },
      { who: 'Don Aurelio', text: 'Take it to the gate. The road will tell you the rest.' },
    ],
    effects: ['set:nani.letter', 'errand:nani-letter', 'set:errand.nani-letter'],
  },
  'aurelio.go': {
    lines: [
      { who: 'Don Aurelio', text: 'The gate, wawa. Past the terraces. Letters are patient, but not forever.' },
    ],
  },
  'aurelio.done': {
    lines: [
      { who: 'Don Aurelio', text: 'So now you know where the road goes. Walk slowly. That was always the whole trick.' },
    ],
  },

  // ---------------- digging with Justina ----------------
  'dig.spot1': {
    lines: [
      { text: 'You dig. A fat golden papa, shaped like a cat\'s paw.' },
      { who: 'Justina', text: 'Puma maki! Puma\'s paw. Came up on the first ask; good manners.' },
    ],
    // The first named papa carries the papa page: the fact arrives in your
    // hands, dirt still on it, instead of in a speech about the rows.
    effects: ['set:dig.1', 'journal:dishes.papa'],
  },
  'dig.spot2': {
    lines: [
      { text: 'You dig. Deep purple-red, almost glowing.' },
      { who: 'Justina', text: 'Yana wayru. For weddings and for showing off, which are related events.' },
    ],
    effects: ['set:dig.2'],
  },
  'dig.spot3': {
    lines: [
      { text: 'You dig. A smooth, generously rounded potato.' },
      { who: 'Justina', text: 'Wira pasña. A well-fed young lady. Do not look at me, I did not name them.' },
    ],
    effects: ['set:dig.3'],
  },
  'dig.spot4': {
    lines: [
      { text: 'You dig. Pale gold, crimson eyes.' },
      { who: 'Justina', text: 'Puka ñawi pasña, the red-eyed girl. Up too late listening to the stream, like everyone here.' },
    ],
    effects: ['set:dig.4'],
  },
  'dig.spot5': {
    lines: [
      { text: 'You dig. Knobbly. Aggressively knobbly. A fist of knuckles with spiteful eyes.' },
      { who: 'Justina', text: 'AH! Llumchuy waqachi! "Makes the daughter-in-law cry!" Try peeling it thin. Go on.' },
    ],
    effects: ['set:dig.5'],
  },
  'dig.finish': {
    lines: [
      { who: 'Justina', text: 'Five names, five faces. You know this field better than most cousins now.' },
      { text: 'She loads your arms with the harvest, the knobbly one on top like a warning.' },
    ],
    effects: ['set:dig.done', 'journal:dishes.llumchuy'],
  },

  // ---------------- the watia, built where it grew ----------------
  'justina.watiaInvite': {
    lines: [
      { who: 'Justina', text: 'Papas with names deserve better than a pot. Today the field cooks: the watia. You stack.' },
    ],
    choices: [
      { text: 'Build the oven', goto: 'justina.watiaStart' },
      { text: 'Catch your breath first', goto: 'justina.watiaLater' },
    ],
  },
  'justina.watiaStart': {
    lines: [
      { text: 'She kicks up a clod from the dry row, hard as bread crust.' },
      { who: 'Justina', text: 'Big ones at the bottom, small for the roof. Haku.' },
    ],
    effects: ['set:watia.start'],
  },
  'justina.watiaLater': {
    lines: [
      { who: 'Justina', text: 'The field waited all season; it can wait for your lungs. The clods are going nowhere. They are clods.' },
    ],
  },
  'watia.finish': {
    lines: [
      { text: 'Earth over embers over papas, then the waiting. Justina rakes one out and splits it; the steam escapes.' },
      { who: 'Justina', text: 'First bite is the field\'s fee. Eat.' },
      { text: 'It tastes of smoke and rain and the ground you are standing on.' },
    ],
    effects: ['clear:watia.start', 'set:watia.done', 'journal:dishes.watia'],
    next: 'justina.wichuna',
  },

  // ---------------- the dog ----------------
  'allqu.first': {
    lines: [
      { text: 'A tan dog is supervising the plaza. You greet it properly: "Allillanchu."' },
      { text: 'The tail renders its verdict. You appear to have a colleague now.' },
    ],
    effects: ['set:allqu.friend', 'journal:people.allqu'],
  },
  'allqu.idle': {
    lines: [{ text: 'The dog noses your hand, finds everything approximately correct, and moves on.' }],
    choices: [
      { text: '"Which way was I headed, colleague?"', when: { has: ['pallay.done'] }, goto: 'allqu.thread' },
      { text: 'A quick pat', goto: 'allqu.pet1' },
    ],
  },
  'allqu.thread': {
    lines: [
      { text: 'The dog sniffs the band once and points its whole body the way the red goes. Colleagues share leads.' },
    ],
    effects: ['thread:'],
  },
  // Petting escalates, because the game should always out-commit the player.
  'allqu.pet1': {
    lines: [{ text: 'You pet the dog. The tail concurs.' }],
  },
  'allqu.pet2': {
    lines: [{ text: 'You pet the dog again. The dog was hoping you would come to this conclusion.' }],
    // Third pet: the friendship is now official on both sides. Elsewhere in
    // the village, quietly, a very old rescue mission becomes possible.
    effects: ['set:egg.allqu.devoted'],
  },
  'allqu.pet3': {
    lines: [{ text: 'Further petting. The dog leans into it with its entire professional weight.' }],
  },
  'allqu.pet4': {
    lines: [{ text: 'Critical pet! The dog briefly forgets every duty it has ever held.' }],
  },
  'allqu.pet5': {
    lines: [{ text: 'The dog is now mostly composed of contentment and a little dust. You did this.' }],
  },

  // ---- Pilar, toll collector of the bridge ----
  //
  // The comedy engine: nine years old, absolute deadpan, unwavering belief in
  // the Bridge Economy. Escalating schemes; the game never wins the argument.
  'pilar.first': {
    lines: [
      { text: 'A small girl by the bridge, arms crossed. Her sign: PUENTE. TOLL. YES REALLY.' },
      { who: 'Pilar', text: 'Toll is one interesting fact. Not the weather. Not llamas. Everyone has llama facts.' },
    ],
    choices: [
      { text: 'Offer the most interesting thing you know', goto: 'pilar.pay' },
      { text: 'Point out you could just... wade across', goto: 'pilar.around' },
    ],
  },
  'pilar.pay': {
    lines: [
      { text: 'You offer the best thing you have learned. She hears it out like a customs official.' },
      { who: 'Pilar', text: 'Acceptable. Barely. Lifetime membership. Expires whenever I decide.' },
    ],
    effects: ['set:met.pilar', 'journal:people.pilar'],
  },
  'pilar.around': {
    lines: [
      { who: 'Pilar', text: 'The river is cold and the toll follows you.' },
      { text: 'She presses her thumb to your hand like a stamp.' },
      { who: 'Pilar', text: 'Member. Free trial. It ends whenever I decide.' },
    ],
    effects: ['set:met.pilar', 'journal:people.pilar'],
  },
  'pilar.rocks': {
    lines: [
      { who: 'Pilar', text: 'New business. Lucky rocks. This one survived being thrown at Mateo.' },
      { who: 'Pilar', text: 'No refunds, because no payments. Friend price is also nothing, but WARMER.' },
    ],
    effects: ['set:pilar.s1'],
  },
  'pilar.tour': {
    lines: [
      { who: 'Pilar', text: 'For one fact I will show you where nothing sleeps under the bridge. I discovered the nothing myself.' },
      { text: 'She points at dark water. There is definitely nothing there.' },
    ],
    effects: ['set:pilar.s2'],
  },
  'pilar.mayor': {
    lines: [
      { who: 'Pilar', text: 'When I am mayor of the bridge, the toll goes up to two facts. The position is open. I have a sign.' },
    ],
    effects: ['set:pilar.s3'],
  },
  'pilar.promoted': {
    lines: [
      { who: 'Pilar', text: 'Stop. You know too many things. It makes my toll look small.' },
      { who: 'Pilar', text: 'Fine: co-owner of the bridge. Unpaid. The dog is security.' },
    ],
    effects: ['set:pilar.promoted'],
  },
  'pilar.ships': {
    lines: [
      { who: 'Pilar', text: 'Expansion. The river touches the sea, so the sea is bridge water. Ships owe the toll.' },
      { who: 'Pilar', text: 'The sea has not replied, which legally is agreement.' },
    ],
    effects: ['set:pilar.s4'],
  },
  'pilar.epilogue': {
    lines: [
      { who: 'Pilar', text: 'You finished the whole old book? Adults finish their books and then they leave.' },
      { who: 'Pilar', text: 'Bring me something from the sea. A weird one. A THING, not a fact. That is the exit toll.' },
    ],
    effects: ['set:pilar.sea'],
  },
  'pilar.idle': {
    lines: [
      { who: 'Pilar', text: 'The toll stands. The bridge economy is strong.' },
    ],
    choices: [
      { text: '"Which way was I going, mayor?"', when: { has: ['pallay.done'] }, goto: 'pilar.thread' },
      { text: 'Just admiring the bridge', goto: 'pilar.threadNo' },
    ],
  },
  'pilar.thread': {
    lines: [
      { who: 'Pilar', text: 'Directions are one fact each. ...Fine, co-owners navigate free. Wrist out.' },
    ],
    effects: ['thread:'],
  },
  'pilar.threadNo': {
    lines: [{ who: 'Pilar', text: 'Correct. It is a very good bridge. Admission is free today only.' }],
  },

  // ---- Chasca, the traveling photographer ----
  'chasca.first': {
    lines: [
      { who: 'Chasca', text: 'Stop! Perfect. The light, the ridge, the wind in your poncho. Do not move.' },
      { who: 'Chasca', text: 'Chasca. I photograph the roads. Somebody should keep the evidence.' },
    ],
    effects: ['set:met.chasca', 'journal:people.chasca'],
    next: 'chasca.offer',
  },
  'chasca.offer': {
    lines: [
      { who: 'Chasca', text: 'A portrait, {name}? You, the descent, and the sea making its entrance behind you.' },
    ],
    choices: [
      { text: 'Pose', goto: 'chasca.snap' },
      { text: 'Politely decline', goto: 'chasca.decline' },
    ],
  },
  'chasca.snap': {
    lines: [
      { who: 'Chasca', text: 'Chin up. Eyes on the far water. And... ¡digan papas!' },
      { text: 'You say papas.' },
    ],
    effects: ['set:photo.taken', 'set:photo.flash'],
  },
  'chasca.decline': {
    lines: [
      { who: 'Chasca', text: 'As you wish. The view poses anyway. It has never once declined.' },
    ],
  },
  'chasca.idle': {
    lines: [
      { who: 'Chasca', text: 'One day I will show them all in a row: every traveler, every road.' },
    ],
  },

  // ---- epilogues: the village knows what you finished ----
  'justina.epilogue': {
    lines: [
      { who: 'Justina', text: 'The whole journal? Then write in the margin: the terraces gave their best papa to Zoila\'s grandchild, and do not regret it.' },
    ],
  },
  'mateo.epilogue': {
    lines: [
      { who: 'Mateo', text: 'You finished the old book? I told my grandfather. He knitted a whole row in silence, which for him is a standing ovation.' },
    ],
  },

  // ---------------- the east road ----------------
  // Faustino keeps the human moment; the game's thesis is nowhere in his
  // mouth. What the road teaches, the road teaches. The cliff shows the rest.
  'faustino.first': {
    lines: [
      { who: 'Faustino', text: 'Ho! A walker! Come in out of the wind; the fire is honest and the wind is not.' },
      { who: 'Faustino', text: 'Faustino. Arriero. My llamas and I walk roads for a living. They get paid in grass.' },
    ],
    effects: ['set:met.faustino', 'journal:people.faustino'],
    next: 'faustino.whistle',
  },
  'faustino.whistle': {
    lines: [
      { who: 'Faustino', text: 'Paca holds the pass like she pays rent on it.' },
      { text: 'One short whistle, one long. Up the road, a llama begins a large decision, slowly.' },
    ],
    effects: ['set:paca.moved'],
  },
  'faustino.idle': {
    lines: [
      { who: 'Faustino', text: 'This road took salt up my whole life and brought sugar back down. Nobody rides it free; it just bills late.' },
    ],
  },
  'faustino.kintu': {
    lines: [
      { who: 'Faustino', text: 'Before you walk on: a proper goodbye.' },
      { text: 'He stacks three coca leaves, shiny side up, and holds them out.' },
    ],
    choices: [
      { text: 'Take it with one hand', goto: 'faustino.kintu1' },
      { text: 'Take it with both hands', goto: 'faustino.kintu2' },
    ],
  },
  'faustino.kintu1': {
    lines: [
      { text: 'You reach with one hand. Faustino waits, patient as the pass, until your other hand catches up with your manners.' },
      { who: 'Faustino', text: 'Both hands. Now blow over it, gently, and name what you are grateful to.' },
      { text: 'The wind takes it toward the peaks. It knows the addresses.' },
    ],
    effects: ['set:kintu.done', 'journal:customs.kintu'],
  },
  'faustino.kintu2': {
    lines: [
      { who: 'Faustino', text: 'Both hands, first try. Now blow over it, soft, and name what you are grateful to.' },
      { text: 'The wind takes it toward the peaks. It knows the addresses.' },
    ],
    effects: ['set:kintu.done', 'journal:customs.kintu'],
  },
  'paca.block': {
    lines: [
      { text: 'A llama occupies the exact center of the pass, calm as a mountain that recently learned to chew.' },
      { text: 'Paca is unmoved. The muleteer up the road moves her daily, with one whistle.' },
    ],
  },
  'paca.after': {
    lines: [
      { text: 'Paca has relocated by almost a full meter, an enormous concession. She hums to herself about being right.' },
    ],
    effects: ['set:egg.paca.one'],
  },
  'paca.opinions': {
    lines: [
      { text: 'Paca inspects your bag, your boots, and your intentions, in that order. She resumes chewing, which is how a llama adjourns.' },
    ],
    effects: ['set:egg.paca.two'],
  },
  'paca.medal': {
    lines: [
      { text: 'She leans her long neck down and breathes one warm breath into your hair. From Paca, this is a medal ceremony.' },
    ],
  },
  'llama.look': {
    lines: [
      { text: 'The brown llama regards you from a great social distance.' },
    ],
  },
  'llama.look2': {
    lines: [
      { text: 'This llama hums, low and thoughtful, to keep the herd found. A location, sung.' },
    ],
  },
  'ex.apacheta': {
    lines: [
      { text: 'A cairn of traveler stones, older than anyone\'s grandmother. You find one that fits your hand and add your journey to the pile.' },
    ],
    effects: ['journal:customs.apacheta'],
  },
  'ex.tent': {
    lines: [
      { text: 'Canvas, rope, wind-patience. Inside: a bedroll, a coca pouch, three Spanish novels.' },
    ],
  },
  'ex.campfire': {
    lines: [
      { text: 'A fire built by someone who has built ten thousand. It burns exactly as much as it should.' },
    ],
  },
  'ex.signpost': {
    lines: [
      { text: 'The board points west. Distances have been carved, argued with, crossed out. Someone has simply written: "MORE."' },
    ],
  },
  'ex.sea.first': {
    lines: [
      { text: 'The land stops. And there, far below, going on until it becomes the sky:' },
      { text: 'The sea.' },
      { text: 'It looks like the altiplano lay down at last and turned silver in its sleep.' },
    ],
    effects: ['set:sea.seen'],
  },
  'ex.sea': {
    lines: [
      { text: 'Still there. Still enormous. The sea accepts repeat astonishment graciously.' },
    ],
  },
  'ex.cliff': {
    lines: [
      { text: 'The land ends politely, without a railing. Far below, the other half of the world practices its breathing.' },
    ],
  },
  'ex.bajadasign': {
    lines: [
      { text: 'LA CALETA, and an arrow pointing down. The arrow has been repainted more often than the letters.' },
    ],
  },
  'ex.ladera': {
    lines: [
      { text: 'Loose rubble at the angle where it stops sliding. The mountain wants you to take the switchbacks, and wins.' },
    ],
  },
  'ex.puna': {
    lines: [{ text: 'Dry gold grass to every horizon. The wind is reading it aloud, softly, to nobody.' }],
  },
  'ex.cactus': {
    lines: [
      { text: 'A column cactus with no appointments. One pink flower, against all advice.' },
    ],
  },
  'ex.shrub': {
    lines: [
      { text: 'A wind-bullied shrub that takes the climate as a challenge.' },
    ],
  },
  'ex.path': {
    lines: [{ text: 'The path is older than the village. Feet agreed on it before houses did.' }],
  },
  'ex.plaza': {
    lines: [{ text: 'Flagstones worn smooth by market days, festivals, and ten thousand unhurried conversations.' }],
  },
  'ex.bench': {
    lines: [
      { text: 'A bench worn smooth by fifty years of afternoons. It has heard everything twice.' },
    ],
  },
  'ex.woodpile': {
    lines: [
      { text: 'Split eucalyptus, stacked with the particular pride of someone who is ready for winter.' },
    ],
  },
  'ex.planter': {
    lines: [
      { text: 'Geraniums blazing away at 3,800 meters like it is nothing.' },
    ],
  },
  'ex.farol': {
    lines: [
      { text: 'A lamp post, lit each evening by whoever passes first. Nobody ever arranged this.' },
    ],
  },
  'ex.stall': {
    lines: [
      { text: 'A market stall, asleep between Sundays. Corn, ají, and greens left out for whoever needs them. The birds know the policy.' },
    ],
  },
  'ex.thatchRidge': {
    lines: [
      { text: 'Two small ceramic bulls flank a cross on the roofline, on guard against bad luck and weather. Good record so far.' },
    ],
  },
  'ex.grass': {
    lines: [{ text: 'Riverbank green, the only place in the valley the color gets to show off.' }],
  },

  // ---------------- the east gate ----------------
  'gate.closed': {
    lines: [
      { text: 'A wooden gate across the pass road, gray with weather. It is not locked. It is just not yet.' },
    ],
  },
  'gate.final': {
    lines: [
      { text: 'You unfold Nani\'s letter at the gate, where she meant to open it.' },
      { text: '"To whoever I become next: the village taught me everything except how to leave it. Go west anyway. Say yes to soup."' },
      { text: 'Below, four kitchens send up smoke, straight as loom threads. You write her name on its waiting page.' },
    ],
    effects: ['errand.done', 'set:story.complete', 'journal:people.nani'],
    next: 'gate.end',
  },
  'gate.end': {
    lines: [
      { text: 'End of Chapter One. Ch’aska Pampa remains open: pages unfilled, people mid-story, soup presumably hot.' },
    ],
  },
  'gate.after': {
    lines: [
      { text: 'The gate stands easy on its hinges now. The road west hums to itself.' },
    ],
  },

  // ---------------- examines ----------------
  'ex.well': {
    lines: [
      { text: 'Cold, sweet water, a long way down. A tin cup hangs on the post for anyone.' },
    ],
  },
  'ex.flag': {
    lines: [
      { text: 'A red cloth over the doorway: fresh chicha inside. Under it, a first splash on the ground. The earth drinks first.' },
    ],
    effects: ['journal:dishes.chicha'],
  },
  'ex.crop': {
    lines: [
      { text: 'Rows of flowering potato plants, each row a different leaf, a different name.' },
    ],
    effects: ['journal:dishes.papa'],
  },
  'ex.water': {
    lines: [{ text: 'Snowmelt, in a hurry. It has somewhere to be and always has.' }],
  },
  'ex.bridge': {
    lines: [
      { text: 'Warped planks, silver with age. There is nothing under the bridge. The village is firm about this.' },
    ],
  },
  'ex.tree': {
    lines: [{ text: 'A queñua tree. Its red bark peels like paper, like it is always writing something.' }],
  },
  'ex.adobe': {
    lines: [{ text: 'Mud brick, straw, and sun. The wall gives back the afternoon’s heat all night.' }],
  },
  'ex.thatch': {
    lines: [{ text: 'Combed courses of ichu grass. A roof you grow, then comb, then trust.' }],
  },
  'ex.flower': {
    lines: [{ text: 'Small stubborn flowers, growing at an altitude that argues against them.' }],
  },
  'ex.grass.away': {
    lines: [
      { text: 'Grass, doing what grass does on every road: holding the ground together.' },
    ],
  },
  'ex.tuft.away': {
    lines: [{ text: 'A tuft of wiry grass, combed one way by the wind. It knows where the weather comes from.' }],
  },
  'ex.rock.away': {
    lines: [{ text: 'A rock, older than the lane around it. It is not planning to move.' }],
  },
  'ex.pot.away': {
    lines: [{ text: 'A clay pot with its lid on. Somebody\'s dinner is in there, keeping its own counsel.' }],
  },
  'ex.tuft': {
    lines: [{ text: 'Ichu bunchgrass, gold and sharp. The whole pampa whispers with it when the wind combs through.' }],
  },
  'ex.rock': {
    lines: [{ text: 'A boulder, sitting exactly where the glacier left it. It is not planning to move.' }],
  },
  'ex.doorShut': {
    lines: [{ text: 'Latched. From inside: the clack of a loom, a radio speaking Quechua, someone laughing at it.' }],
  },
  'ex.doorShut.away': {
    lines: [{ text: 'Latched. From inside: a radio in a language you are still learning, a pan, someone laughing at both.' }],
  },
  'ex.chomba': {
    lines: [
      { text: 'The great clay mother of the house. Inside, chicha dreams its slow, sour dreams.' },
    ],
  },
  'ex.qoncha': {
    lines: [
      { text: 'The q\'oncha: stones, mud, forty years of fire. The wall above is glossy black and proud of it.' },
    ],
  },
  'ex.loom': {
    lines: [
      { text: 'A backstrap loom lashed to the post, its empty strap waiting for the weaver.' },
    ],
  },
  'ex.olla': {
    lines: [
      { text: 'A blackened clay olla on three stones, steaming. Potatoes, something green, a ladle already in it. Somebody has counted you in.' },
    ],
  },
  'ex.bed': {
    lines: [{ text: 'Sheepskins and a striped blanket heavy enough to argue with the altiplano night.' }],
  },
  'ex.table.away': {
    lines: [{ text: 'A worn table, wiped down and set again. Every kitchen on the road has one that has heard everything.' }],
  },
  'ex.shelf.away': {
    lines: [{ text: 'Cups, bowls, a tin of something sweet. Everything within reach of whoever cooks here.' }],
  },
  'ex.table': {
    lines: [{ text: 'A worn table. A dish of toasted cancha sits out for whoever comes. You take exactly three.' }],
  },
  'ex.stool': {
    lines: [{ text: 'A low stool, polished by generations of sitting out the afternoon.' }],
  },
  'ex.shelf': {
    lines: [{ text: 'Cups, bowls, a tin of sugar, and one photograph of Lima, face down.' }],
  },
  'ex.rug': {
    lines: [{ text: 'A woven rug in the house colors. Your feet feel welcomed.' }],
  },
  'ex.floor': {
    lines: [
      { text: 'Packed earth, swept morning and evening until it shines. A floor that is also a habit.' },
    ],
  },
  'ex.wallStone': {
    lines: [
      { text: 'Dry stone, no mortar. Just patience with corners.' },
    ],
  },
  'ex.dirt': {
    lines: [
      { text: 'Bare worked earth. Somebody turns it, and it mostly cooperates.' },
    ],
  },
  'ex.wallInt': {
    lines: [{ text: 'Adobe, whitewashed to shoulder height, still warm where the afternoon sun sat on it.' }],
  },
  'ex.mat': {
    lines: [{ text: 'The threshold mat, thin with welcomes.' }],
  },
  'ex.pot': {
    lines: [
      { text: 'A clay pot of chuño, potatoes freeze-dried under June stars. You feel an inherited urge to smash it. It is somebody\'s dinner.' },
    ],
  },
  'ex.cuy': {
    lines: [
      { text: 'A guinea pig considers you, then resumes its business under the furniture. Kitchen census: about twenty, all opinionated.' },
    ],
  },

  // ---------------- the background life ----------------
  'ex.pirca': {
    lines: [
      { text: 'A pirca, field stones stacked without mortar. Every stone got picked up twice: once to clear the field, once to become the wall.' },
    ],
  },
  'ex.michi': {
    lines: [
      { text: 'On the warmest stone, a cat folded into a perfect circle. Off duty. Never on duty.' },
    ],
    effects: ['set:michi.seen'],
  },
  'ex.michi.again': {
    lines: [
      { text: 'Still asleep. One ear swivels toward you, files a brief report, and stands down.' },
    ],
  },
  'ex.ajirack': {
    lines: [
      { text: 'Red ají and gold maize drying on the rack, just out of reach of the dogs. It says: a good year.' },
    ],
  },
  'ex.chuno': {
    lines: [
      { text: 'Bitter potatoes freezing by night, drying by day, on their way to chuño. The frost is the only laborer nobody owes ayni.' },
    ],
  },
  'ex.adobera': {
    lines: [
      { text: 'Adobe bricks curing under plastic. One holds a perfect dog print. It will be laid anyway; walls need a little luck.' },
    ],
  },
  'ex.latacan': {
    lines: [
      { text: 'Geraniums blazing out of rusty lard cans. The flowers are carrying the whole act.' },
    ],
  },
  'ex.nicho': {
    lines: [
      { text: 'A whitewashed niche, a small saint in a doll-sized manta, fresh flowers. You nod and walk on.' },
    ],
  },
  'ex.nicho.after': {
    lines: [
      { text: 'The little saint has a new knitted hat for the cold. It fits; somebody measured.' },
    ],
  },
  'ex.sacos.stall': {
    lines: [
      { text: 'Sacks rolled open: mote, habas, dark chuño. The tin scoop has firm opinions on fair measure.' },
    ],
  },
  'ex.sacos': {
    lines: [
      { text: 'Sacks of sprouted corn by the wall. Rosa calls it jora; the chomba calls it destiny.' },
    ],
  },
  'ex.grano': {
    lines: [
      { text: 'Spilled barley. The hens found it first and are working it in shifts.' },
    ],
  },
  'ex.chakitaqlla': {
    lines: [
      { text: 'A chakitaqlla, the foot plow, older here than the wheel. The footrest shines a hundred planting mornings deep.' },
    ],
  },
  'ex.tendedero': {
    lines: [
      { text: 'Llicllas and a pollera drying on the line, hems weighted so the wind takes no souvenirs.' },
    ],
  },
  'ex.tendedero.pallay': {
    lines: [
      { text: 'You can read the line now: ch\'aska stars, a river border. Carmen\'s alphabet, out in the sun.' },
    ],
  },
  'ex.sapling': {
    lines: [
      { text: 'A eucalyptus sapling planted the same season as somebody\'s baby. They are neck and neck.' },
    ],
  },
  'ex.pelota': {
    lines: [
      { text: 'A soccer ball wedged in the roof grass, faded on one side. Greatest goal ever scored in this valley. Ask the goalkeeper: wind.' },
    ],
    effects: ['set:pelota.seen'],
  },
  'ex.pelota.again': {
    lines: [
      { text: 'Still up there. Rescue plans exist, but every ladder in the village turns out to be busy.' },
    ],
  },
  'ex.pelota.down': {
    lines: [
      { text: 'The famous roof ball is down, lightly toothmarked, guarded by a certain dog. Nobody is asking the dog anything.' },
    ],
  },
  'ex.gallina': {
    lines: [
      { text: 'A hen works the ground with total confidence, finding something every third step, or claiming to.' },
    ],
  },
  'ex.kite': {
    lines: [
      { text: 'High in the branches, a condor kite, tail ribbons still trying. It flew beautifully once, witnesses insist.' },
    ],
  },
  'ex.kite.faustino': {
    lines: [
      { text: 'Faustino swears a real condor circled it twice and left unconvinced. The kite takes this as a compliment.' },
    ],
  },
  'ex.hitchpost': {
    lines: [
      { text: 'A hitching rail rubbed smooth by mule rope: salt one way over the pass, sugar the other.' },
    ],
  },
  'ex.qepi': {
    lines: [
      { text: 'A traveler\'s q\'epi by the cairn, knotted around everything that matters today. The knot is a door, and it is closed.' },
    ],
  },
  'ex.apachetita': {
    lines: [
      { text: 'A young apacheta, ankle high. Every traveler leaves a stone, and a little of the weight that has no weight.' },
    ],
  },
  'ex.apachetita.stone': {
    lines: [
      { text: 'You add a stone before you finish deciding to.' },
    ],
  },
  'ex.lagarto': {
    lines: [
      { text: 'A lizard flat on a warm stone, doing nothing, magnificently.' },
    ],
  },
  'ex.charango': {
    lines: [
      { text: 'Don Teófilo\'s charango, where his hand finds it without looking. New strings; old jokes.' },
    ],
  },
  'ex.pushka': {
    lines: [
      { text: 'A drop spindle in a basket of cloud-colored wool. Hands here spin even while walking.' },
    ],
  },
  'ex.dyepots': {
    lines: [
      { text: 'Pots of dye: cochineal red, q\'olle yellow. A kitchen, but for color.' },
    ],
  },
  'ex.wellstone': {
    lines: [
      { text: 'Dark setts in rings around the wellhead, wet at any hour. The village is measured from here.' },
    ],
  },
  'ex.plazaworn': {
    lines: [
      { text: 'Paving rubbed pale by feet. Four of these tracks cross the square, and every one bends toward the well.' },
    ],
  },
  'ex.parva': {
    lines: [
      { text: 'A parva: barley sheaves tied at the crown, a flat stone on top in case the wind has opinions.' },
    ],
  },
  'ex.cantaros': {
    lines: [
      { text: 'Cántaros queued at the well, holding places for people busy talking. Everyone knows the order.' },
    ],
  },
  'ex.batea.chicheria': {
    lines: [
      { text: 'The straining trough, stained by every batch it ever held. Rosa will not have it scrubbed. The wood remembers how, she says.' },
    ],
  },
  'ex.cantaros.chicheria': {
    lines: [
      { text: 'Cántaros waiting to be filled, each with its own chip in the lip so nobody argues whose is whose.' },
    ],
  },
  'ex.grano.chicheria': {
    lines: [
      { text: 'Sprouted maize drying on a cloth, sweet and faintly sour. This part takes the days; the rest is waiting.' },
    ],
  },
  'ex.qepi.indoors': {
    lines: [
      { text: 'Somebody’s q’epi inside the door, knot still tied, waiting for the way out.' },
    ],
  },
  'ex.mantas.carmen': {
    lines: [
      { text: 'Finished mantas at the foot of the bed, four deep, a season each. Carmen keeps the newest on the bottom.' },
    ],
  },
  'ex.batea': {
    lines: [
      { text: 'A stone trough of soapy water, one red cloth over the lip. The washer went off to say one more thing.' },
    ],
  },
  'ex.mantas': {
    lines: [
      { text: 'Mantas spread on the paving, stones on the corners: cochineal, indigo, a yellow that argues with the sun.' },
    ],
  },
  'ex.mantas.woven': {
    lines: [
      { text: 'You can read them now, a little. That row of hooks is the one Carmen called out to you. Yours came out crookeder.' },
    ],
  },
};

/**
 * Examine arms per tile kind, first matching condition wins. This one table is
 * how the world answers the action button when no villager is in front of you.
 */
export const EXAMINES: Record<string, ExamineArm[]> = {
  well: [{ node: 'ex.well' }],
  chichaflag: [{ node: 'ex.flag' }],
  crop: [{ node: 'ex.crop' }],
  water: [{ node: 'ex.water' }],
  bridge: [{ node: 'ex.bridge' }],
  tree: [{ node: 'ex.tree' }],
  adobe: [{ node: 'ex.adobe' }],
  thatch: [{ node: 'ex.thatch' }],
  thatchRidge: [{ node: 'ex.thatchRidge' }],
  house: [{ node: 'ex.adobe' }],
  blocked: [{ node: 'ex.adobe' }],
  flower: [{ node: 'ex.flower' }],
  tuft: [{ node: 'ex.tuft', scope: 'home' }, { node: 'ex.tuft.away', scope: 'away' }],
  rock: [{ node: 'ex.rock', scope: 'home' }, { node: 'ex.rock.away', scope: 'away' }],
  doorShut: [{ node: 'ex.doorShut', scope: 'home' }, { node: 'ex.doorShut.away', scope: 'away' }],
  chomba: [{ node: 'ex.chomba' }],
  qoncha: [{ node: 'ex.qoncha' }],
  loom: [{ node: 'ex.loom' }],
  olla: [{ node: 'ex.olla' }],
  bed: [{ node: 'ex.bed' }],
  table: [{ node: 'ex.table', scope: 'home' }, { node: 'ex.table.away', scope: 'away' }],
  stool: [{ node: 'ex.stool' }],
  shelf: [{ node: 'ex.shelf', scope: 'home' }, { node: 'ex.shelf.away', scope: 'away' }],
  rug: [{ node: 'ex.rug' }],
  floorEarth: [{ node: 'ex.floor' }],
  wallStone: [{ node: 'ex.wallStone' }],
  dirt: [{ node: 'ex.dirt' }],
  wallInt: [{ node: 'ex.wallInt' }],
  mat: [{ node: 'ex.mat' }],
  pot: [{ node: 'ex.pot', scope: 'home' }, { node: 'ex.pot.away', scope: 'away' }],
  cuy: [{ node: 'ex.cuy' }],
  gate: [
    { when: { has: ['errand.nani-letter'] }, node: 'gate.final' },
    { node: 'gate.closed' },
  ],
  gateOpen: [{ node: 'gate.after' }],
  stall: [{ node: 'ex.stall' }],
  bench: [{ node: 'ex.bench' }],
  woodpile: [{ node: 'ex.woodpile' }],
  planter: [{ node: 'ex.planter' }],
  farol: [{ node: 'ex.farol' }],
  apacheta: [{ node: 'ex.apacheta' }],
  tent: [{ node: 'ex.tent' }],
  campfire: [{ node: 'ex.campfire' }],
  signpost: [
    { map: 'la-bajada', node: 'ex.bajadasign' },
    { node: 'ex.signpost' },
  ],
  ladera: [{ node: 'ex.ladera' }],
  cactus: [{ node: 'ex.cactus' }],
  shrub: [{ node: 'ex.shrub' }],
  // The overlook: the cliff carries the first sight of the sea, because the
  // sea itself is beyond facing range (the drop is in the way, as drops are).
  cliff: [
    { when: { has: ['sea.seen'] }, node: 'ex.cliff' },
    { node: 'ex.sea.first' },
  ],
  sea: [
    { when: { has: ['sea.seen'] }, node: 'ex.sea' },
    { node: 'ex.sea.first' },
  ],
  // The background life, all of it with something to say.
  pirca: [{ node: 'ex.pirca' }],
  pircamichi: [
    { when: { has: ['michi.seen'] }, node: 'ex.michi.again' },
    { node: 'ex.michi' },
  ],
  ajirack: [{ node: 'ex.ajirack' }],
  chuno: [{ node: 'ex.chuno' }],
  adobera: [{ node: 'ex.adobera' }],
  latacan: [{ node: 'ex.latacan' }],
  nicho: [
    { when: { has: ['story.complete'] }, node: 'ex.nicho.after' },
    { node: 'ex.nicho' },
  ],
  sacos: [
    { map: 'village', node: 'ex.sacos.stall' },
    { node: 'ex.sacos' },
  ],
  grano: [
    { map: 'chicheria', node: 'ex.grano.chicheria' },
    { node: 'ex.grano' },
  ],
  chakitaqlla: [{ node: 'ex.chakitaqlla' }],
  tendedero: [
    { when: { has: ['pallay.done'] }, node: 'ex.tendedero.pallay' },
    { node: 'ex.tendedero' },
  ],
  sapling: [{ node: 'ex.sapling' }],
  pelota: [
    // Once the dog is truly yours, the ball is off the roof (see the village
    // dressing). No ladder was involved and none will take credit.
    { when: { has: ['egg.allqu.devoted'] }, node: 'ex.pelota.down' },
    { when: { has: ['pelota.seen'] }, node: 'ex.pelota.again' },
    { node: 'ex.pelota' },
  ],
  gallina: [{ node: 'ex.gallina' }],
  condorkite: [
    { when: { has: ['met.faustino'] }, node: 'ex.kite.faustino' },
    { node: 'ex.kite' },
  ],
  hitchpost: [{ node: 'ex.hitchpost' }],
  qepi: [
    { map: 'chicheria', node: 'ex.qepi.indoors' },
    { map: 'casa-carmen', node: 'ex.qepi.indoors' },
    // On the village map the q'epi at the spawn is yours: the postcards come
    // out one look at a time, in the order she sent them.
    { map: 'village', when: { not: ['bag.opened'] }, node: 'ex.bag.first' },
    { map: 'village', when: { not: ['bag.card1'] }, node: 'ex.bag.card1' },
    { map: 'village', when: { not: ['bag.card2'] }, node: 'ex.bag.card2' },
    { map: 'village', when: { not: ['bag.card3'] }, node: 'ex.bag.card3' },
    { map: 'village', when: { not: ['bag.done'] }, node: 'ex.bag.card4' },
    { map: 'village', node: 'ex.bag.after' },
    { node: 'ex.qepi' },
  ],
  apachetita: [
    { when: { has: ['sea.seen'] }, node: 'ex.apachetita.stone' },
    { node: 'ex.apachetita' },
  ],
  lagarto: [{ node: 'ex.lagarto' }],
  charango: [{ node: 'ex.charango' }],
  pushka: [{ node: 'ex.pushka' }],
  dyepots: [{ node: 'ex.dyepots' }],
  parva: [{ node: 'ex.parva' }],
  cantaros: [
    { map: 'chicheria', node: 'ex.cantaros.chicheria' },
    { node: 'ex.cantaros' },
  ],
  batea: [
    { map: 'chicheria', node: 'ex.batea.chicheria' },
    { node: 'ex.batea' },
  ],
  mantas: [
    { map: 'casa-carmen', node: 'ex.mantas.carmen' },
    { when: { has: ['pallay.done'] }, node: 'ex.mantas.woven' },
    { node: 'ex.mantas' },
  ],
  // The look-is-never-wasted rule: even plain ground answers.
  puna: [{ node: 'ex.puna' }],
  path: [{ node: 'ex.path' }],
  plaza: [{ node: 'ex.plaza' }],
  plazaWorn: [{ node: 'ex.plazaworn' }],
  wellstone: [{ node: 'ex.wellstone' }],
  // Andes words stay in the Andes; elsewhere the plain kinds get a line
  // that is true in any village on the route.
  grass: [{ node: 'ex.grass', scope: 'home' }, { node: 'ex.grass.away', scope: 'away' }],
};

/** Where the promising mounds appear once Justina invites you to dig. */
export const DIG_SPOTS: { at: [number, number]; node: string; flag: string }[] = [
  { at: [35, 21], node: 'dig.spot1', flag: 'dig.1' },
  { at: [38, 22], node: 'dig.spot2', flag: 'dig.2' },
  { at: [36, 25], node: 'dig.spot3', flag: 'dig.3' },
  { at: [33, 27], node: 'dig.spot4', flag: 'dig.4' },
  { at: [39, 27], node: 'dig.spot5', flag: 'dig.5' },
];

/**
 * Nodes reached by gameplay events rather than conversation, with their
 * gating, so tests can prove every page still unlockable.
 */
export const EVENT_NODES: EventNode[] = [
  ...DIG_SPOTS.map((s) => ({ when: { has: ['dig.invite'] }, node: s.node })),
  { when: { has: ['dig.1', 'dig.2', 'dig.3', 'dig.4', 'dig.5'] }, node: 'dig.finish' },
  { when: { has: ['weave.start'] }, node: 'carmen.woven' },
  { when: { has: ['watia.start'] }, node: 'watia.finish' },
];
