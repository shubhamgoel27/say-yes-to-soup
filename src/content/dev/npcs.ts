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
      { when: { not: ['met.aurelio'] }, node: 'aurelio.first' },
      {
        when: {
          has: ['bundle.delivered', 'challar.done', 'pallay.done'],
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
      {
        when: { has: ['errand.carmen-wichuna'], not: ['wichuna.have'] },
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
    range: 4,
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
      { when: { not: ['met.carmen'] }, node: 'carmen.first' },
      {
        when: { has: ['bundle.delivered'], not: ['errand.carmen-wichuna'] },
        node: 'carmen.ask',
      },
      {
        when: { has: ['wichuna.have'], not: ['wichuna.returned'] },
        node: 'carmen.wichuna',
      },
      {
        when: { has: ['wichuna.returned'], not: ['pallay.done'] },
        node: 'carmen.weaveOffer',
      },
      {
        when: { has: ['errand.carmen-wichuna'], not: ['wichuna.have'] },
        node: 'carmen.waiting',
      },
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
    pos: [39, 7],
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
      { node: 'paca.after' },
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
  'intro.wake': {
    lines: [
      { text: 'The bus left you at the bottom of the valley an hour ago. The driver pointed uphill and said only: arriba.' },
      { text: 'You grew up on her postcards. A camel with opinions. A sea the color of a bruise. "Eat first, ask after," in six languages.' },
      { text: 'Then the postcards stopped being from elsewhere, and then, last winter, they stopped.' },
      { text: 'The lawyer\'s envelope held no money and one journal, half full. Her note said the empty half was always yours.' },
      { text: 'So: unpaid leave, one bag, her route. You told everyone it was a short trip. Nobody believed you, least of all the bag.' },
      { text: "The journal's first page: \"Ch'aska Pampa. Start where the water is.\"" },
      { text: 'The rest of her page is blank. The village is not.' },
    ],
    effects: ['set:intro.done'],
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
      { who: 'Don Aurelio', text: 'But you said it. Sit, the stone is warm.' },
    ],
    effects: ['set:met.aurelio', 'journal:words.allillanchu', 'journal:people.aurelio'],
  },
  'aurelio.first.business': {
    lines: [
      { who: 'Don Aurelio', text: 'Mm. First: did you sleep warm?' },
      { who: 'Don Aurelio', text: 'And your family, they are well? The rains did not catch you on the pass?' },
      { text: 'Some minutes go by. They do not feel wasted.' },
      { who: 'Don Aurelio', text: 'Now. What did you want to ask?' },
    ],
    effects: ['set:met.aurelio', 'journal:customs.warmup', 'journal:people.aurelio'],
    next: 'aurelio.chaska',
  },
  'aurelio.chaska': {
    lines: [
      { who: 'Don Aurelio', text: "This place? Ch'aska Pampa. Star plain." },
      { who: 'Don Aurelio', text: 'When it rains, the ground fills with puddles, and the pampa catches stars. You can check my work tonight.' },
    ],
    effects: ['journal:words.chaska'],
  },
  'aurelio.idle': {
    lines: [
      { who: 'Don Aurelio', text: 'The well is older than the church. The water is older than everything. Have some, it is nobody’s to sell.' },
    ],
  },

  // ---------------- Rosa ----------------
  'rosa.first': {
    lines: [
      { who: 'Rosa', text: 'You walked up from the valley? Sit, sit, {name}. The soup is hot and you look like wind.' },
      { text: 'A bowl lands in front of you before you can answer. Steam. Potatoes. Something green and sharp.' },
    ],
    choices: [
      { text: 'Offer a few coins', goto: 'rosa.coins' },
      { text: 'Just say thank you', goto: 'rosa.thanks' },
    ],
  },
  'rosa.coins': {
    lines: [
      { text: 'Rosa looks at the coins the way you would look at a strange beetle.' },
      { who: 'Rosa', text: 'Keep them. Here, help comes back as help. Eat now, argue after.' },
    ],
    effects: ['set:met.rosa', 'journal:customs.ayni', 'journal:people.rosa'],
    next: 'rosa.bundle',
  },
  'rosa.thanks': {
    lines: [
      { who: 'Rosa', text: 'Sulpayki, we say. Sool-PIE-kee.' },
      { who: 'Rosa', text: 'It costs nothing and it pays everything. Now eat before it goes cold.' },
    ],
    effects: ['set:met.rosa', 'journal:words.sulpayki', 'journal:people.rosa'],
    next: 'rosa.bundle',
  },
  'rosa.bundle': {
    lines: [
      { who: 'Rosa', text: 'Since your legs work: carry this bundle up to my sister Justina, in the terraces past the lane.' },
      { who: 'Rosa', text: 'Then we are even. Almost.' },
      { text: 'You are now carrying a warm cloth bundle. It smells of wool and bread.' },
    ],
    effects: ['errand:rosa-bundle', 'set:errand.rosa-bundle'],
  },
  'rosa.waiting': {
    lines: [
      { who: 'Rosa', text: 'The bundle, wawa. Justina. Terraces. Up.' },
      { who: 'Rosa', text: 'She talks a lot. Bring patience, it weighs less than the bundle.' },
    ],
  },
  'rosa.even': {
    lines: [
      { who: 'Rosa', text: 'So she kept you talking. Ha! I warned you and I was right, my favorite combination.' },
      { who: 'Rosa', text: 'Now we are even. Which means now we can begin. Hold out your pocket.' },
      { text: 'She pours in a handful of boiled corn. It is still warm.' },
    ],
    effects: ['set:rosa.thanked', 'journal:dishes.mote'],
  },
  'rosa.idle': {
    lines: [
      { who: 'Rosa', text: 'If the flag is up, the chicha is fresh. If the flag is down, come back tomorrow and it will be up.' },
    ],
  },
  'rosa.epilogue': {
    lines: [
      { who: 'Rosa', text: 'So the journal is full. Good. Now start your own, and put my soup on the first page where it belongs.' },
    ],
  },

  // ---- the steady-hands chicha delivery (a walking puzzle) ----
  'rosa.chichaAsk': {
    lines: [
      { who: 'Rosa', text: 'Perfect timing. Teófilo left his caporal on my counter, full to the brim, and his knees refuse the trip back.' },
      { who: 'Rosa', text: 'Carry it in to him. Full glass, steady legs. Bump into things and the floor drinks better than he does.' },
    ],
    choices: [
      { text: 'Take the glass, carefully', goto: 'rosa.chichaAccept' },
      { text: 'Maybe with steadier hands later', goto: 'rosa.chichaLater' },
    ],
  },
  'rosa.chichaAccept': {
    lines: [
      { text: 'The glass is fuller than physics should allow. The surface watches you like a nervous passenger.' },
      { text: 'Three good bumps and it is gone. Walk gently.' },
    ],
    effects: ['set:carry.chicha'],
  },
  'rosa.chichaLater': {
    lines: [{ who: 'Rosa', text: 'Mm. The glass agrees to wait. The glass is more patient than Teófilo.' }],
  },
  'rosa.carrying': {
    lines: [
      { who: 'Rosa', text: 'Why are you back? The chicha goes THAT way. Walk like a llama on a ledge: slowly, and certain.' },
    ],
  },
  'rosa.refill': {
    lines: [
      { text: 'Rosa looks at the empty, guilty glass. Then at you. Then she laughs so hard the cuyes relocate.' },
      { who: 'Rosa', text: 'The floor thanks you. Pachamama got a generous pour today. Here, again, and this time: gently.' },
    ],
    effects: ['clear:chicha.spilled', 'set:carry.chicha'],
  },
  'teofilo.chicha': {
    lines: [
      { text: 'You set the caporal down in front of Teófilo. The surface is calm. Not a drop surrendered.' },
      { who: 'Don Teófilo', text: 'Not one drop! Rosa sent a llama after all, steady on every ledge.' },
      { who: 'Don Teófilo', text: 'Tomakusunchis, friend. "Let us drink together." Here there is no other kind of drinking.' },
      { text: 'He tips the first splash to the floor, for the earth. Then the glass, at last, gets to be a glass.' },
    ],
    effects: ['clear:carry.chicha', 'set:chicha.delivered', 'journal:words.tomakusunchis'],
  },
  'teofilo.epilogue': {
    lines: [
      { who: 'Don Teófilo', text: 'Amara\'s grandchild, they tell me. I owed her a laugh for fifty years. You collected it. We are even.' },
    ],
  },

  // ---------------- Justina ----------------
  'justina.first': {
    lines: [
      { who: 'Justina', text: 'You are standing on my potatoes.' },
      { who: 'Justina', text: 'No, those. Under your feet. Step left. ...There. Now we can talk like people.' },
    ],
    effects: ['set:met.justina', 'journal:people.justina'],
  },
  'justina.bundle': {
    lines: [
      { who: 'Justina', text: 'From Rosa? Give here. Ah. Wool, bread, and worry, as always.' },
      { who: 'Justina', text: 'She raised me after mama went to Lima. A sister who is half a mother, you carry her bundles forever.' },
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
  'justina.watia': {
    lines: [
      { who: 'Justina', text: 'Stay near when the harvest comes in. We build a little oven from the field itself, clods stacked so, fired until they glow.' },
      { who: 'Justina', text: 'Watia. The earth bakes its own potatoes. It asks nothing back except the first bite.' },
      { who: 'Justina', text: 'In fact. See those mounds? Early ones, ready. Dig them up for me and I will teach you their names. Every papa has a name.' },
    ],
    effects: ['journal:dishes.watia', 'set:dig.invite'],
  },
  'justina.after': {
    lines: [
      { who: 'Justina', text: 'These rows? Forty kinds of papa, and I know each one by its face.' },
      { who: 'Justina', text: 'There is one called llumchuy waqachi. "Makes the daughter-in-law cry." Knobbly on purpose. Our jokes are long games.' },
    ],
    effects: ['journal:dishes.papa'],
    choices: [
      { text: 'Build the watia again', when: { has: ['watia.done'] }, goto: 'justina.watiaAgain' },
      { text: 'Leave her to the rows', goto: 'justina.idle' },
    ],
  },
  'justina.watiaAgain': {
    lines: [
      { who: 'Justina', text: 'The ground is still warm from last time. No reason to waste good heat. Stack me another dome, just for the eating.' },
    ],
    effects: ['set:replay.mode', 'set:watia.start'],
  },
  'justina.idle': {
    lines: [
      { who: 'Justina', text: 'The stream does the talking for both of us today. Listen, it never repeats itself.' },
    ],
  },

  // ---------------- Mateo ----------------
  'mateo.first': {
    lines: [
      { who: 'Mateo', text: 'My grandfather knits faster than I text. True fact.' },
      { who: 'Mateo', text: 'He says a chullu keeps thoughts warm. I say my phone dies by noon anyway, so maybe he wins.' },
    ],
    effects: ['set:met.mateo', 'journal:people.mateo', 'journal:customs.chullu'],
  },
  'mateo.idle': {
    lines: [
      { who: 'Mateo', text: 'Everyone says the village is emptying. But the signal is best on the ridge, and from up there the pampa looks full.' },
      { who: 'Mateo', text: 'Also: the little kids swear something legendary sleeps under the bridge. The little kids swear a lot of things.' },
    ],
  },

  // ---------------- Doña Carmen ----------------
  'carmen.first': {
    lines: [
      { who: 'Doña Carmen', text: 'Sit if you like, the sun is free. This lliclla is for my granddaughter in Lima.' },
      { who: 'Doña Carmen', text: 'The zigzag is the river. The river is also the road of stars. One thread, two truths, that is weaving.' },
    ],
    effects: ['set:met.carmen', 'journal:people.carmen', 'journal:words.lliclla'],
  },
  'carmen.idle': {
    lines: [
      { who: 'Doña Carmen', text: 'My mother wove her stories. I weave mine. When the wawa wraps herself in this, she carries all of us. Heavy? No. Warm.' },
    ],
  },

  // ---------------- Don Teófilo, and the first splash ----------------
  'teofilo.first': {
    lines: [
      { who: 'Don Teófilo', text: 'Ah! The bundle-carrier. Rosa told the whole room before you crossed the bridge.' },
      { who: 'Don Teófilo', text: 'Sit. Tomakusunchis, let us drink together. The chomba was generous today.' },
      { text: 'He fills two glasses with cloudy, straw-colored chicha and slides one over.' },
    ],
    choices: [
      { text: 'Drink up', goto: 'teofilo.drink' },
      { text: 'Watch him first', goto: 'teofilo.watch' },
    ],
  },
  'teofilo.drink': {
    lines: [
      { text: 'You drink. It is sour, alive, and better than it sounds.' },
      { who: 'Don Teófilo', text: 'HA! Straight down! And the earth got nothing!' },
      { text: 'He tips his own glass and lets a little fall to the floor before he drinks.' },
      { who: 'Don Teófilo', text: 'First splash is for Pachamama. She drinks first, always. Now, again, and this time she goes first.' },
      { text: 'You pour a little out. The packed earth takes it without comment. Teófilo nods like something is settled.' },
    ],
    effects: ['set:challar.done', 'set:met.teofilo', 'journal:customs.challar', 'journal:people.teofilo'],
  },
  'teofilo.watch': {
    lines: [
      { text: 'You wait. He tips his glass and lets a little fall to the floor, murmuring something soft, then drinks.' },
      { text: 'You copy him, splash and all.' },
      { who: 'Don Teófilo', text: 'Yaw! You watched first. Watching first is its own wisdom, and rarer than it should be.' },
      { who: 'Don Teófilo', text: 'The splash is for Pachamama. She feeds us all year; she can drink first all year.' },
    ],
    effects: ['set:challar.done', 'set:met.teofilo', 'journal:customs.challar', 'journal:people.teofilo'],
  },
  'teofilo.haku': {
    lines: [
      { who: 'Don Teófilo', text: 'Haku! To the terraces! To the ridge! To anywhere!' },
      { text: 'He does not move. His knees have voted against the motion.' },
      { who: 'Don Teófilo', text: 'Haku means "let us go." The word still counts. The word is the going. You go; I will supervise.' },
    ],
    effects: ['journal:words.haku'],
  },
  'teofilo.idle': {
    lines: [
      { who: 'Don Teófilo', text: 'When the flag is up, this seat is mine. It is the only appointment I have kept for forty years.' },
    ],
  },

  // ---------------- Carmen's wichuna chain ----------------
  'carmen.ask': {
    lines: [
      { who: 'Doña Carmen', text: 'You have carrying legs, I hear. Rosa rates you highly, and Rosa rates nobody highly.' },
      { who: 'Doña Carmen', text: 'My wichuna, the little bone pick, is with Justina in the terraces. These fingers miss it. Bring it back?' },
    ],
    effects: ['errand:carmen-wichuna', 'set:errand.carmen-wichuna'],
  },
  'carmen.waiting': {
    lines: [
      { who: 'Doña Carmen', text: 'The wichuna, wawa. Justina has it. Llama bone, smooth as river stone. She will pretend she forgot.' },
    ],
  },
  'justina.wichuna': {
    lines: [
      { who: 'Justina', text: 'The wichuna? I was going to return it. In my own season.' },
      { text: 'She produces a small polished bone pick from her lliclla, wrapped in cloth like something precious. It is something precious.' },
      { who: 'Justina', text: 'Tell my sister-in-craft: her pick picked nothing here. My hands kept dropping the pattern. Some tools choose one person.' },
    ],
    effects: ['set:wichuna.have', 'set:met.justina', 'journal:people.justina'],
  },
  'carmen.wichuna': {
    lines: [
      { who: 'Doña Carmen', text: 'Ah. There you are, old friend.' },
      { text: 'She is talking to the pick, not to you. Then she remembers you, and pats the ground beside her.' },
      { who: 'Doña Carmen', text: 'Look. This border is my mother. This color is this village. This zigzag is the river and the sky road both.' },
      { who: 'Doña Carmen', text: 'Sumaq, no? Beautiful. The word also means delicious. We saw no reason to have two words.' },
    ],
    effects: ['set:wichuna.returned', 'errand.done', 'journal:words.sumaq'],
    next: 'carmen.weaveOffer',
  },
  'carmen.weaveOffer': {
    lines: [
      { who: 'Doña Carmen', text: 'Now. A returned tool must work the same day; that is its thanks.' },
      { who: 'Doña Carmen', text: 'Sit at the loom. Watch the colors I call, then call them back with your hands. The cloth forgives; I mostly do too.' },
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
      { text: 'Row by row the pattern comes, crooked, then less crooked, then almost right.' },
      { who: 'Doña Carmen', text: 'Ha! Look at that row. Crooked as the river. Good. Now the cloth has you in it too.' },
      { who: 'Doña Carmen', text: 'My granddaughter will wear this in Lima and carry a stranger who tried. That is pallay. Nothing written down; everything written in.' },
      { text: 'She knots your practice rows into a narrow band and ties it at your wrist. "So your hands remember the mountain."' },
    ],
    effects: ['clear:weave.start', 'set:pallay.done', 'set:keepsake.band', 'journal:customs.pallay'],
  },
  'carmen.after': {
    lines: [
      { who: 'Doña Carmen', text: 'The lliclla grows a row a day. Like the potatoes. Like the wawa it is for. Nothing good hurries.' },
    ],
    choices: [
      { text: 'Sit at the loom again', when: { has: ['pallay.done'] }, goto: 'carmen.weaveAgain' },
      { text: 'Just passing by', goto: 'carmen.idle' },
    ],
  },
  'carmen.weaveAgain': {
    lines: [
      { who: 'Doña Carmen', text: 'The loom is free most evenings. No lesson this time, no cloth to keep. Only the pleasure of a straight row. Sit.' },
    ],
    effects: ['set:replay.mode', 'set:weave.start'],
  },
  'carmen.epilogue': {
    lines: [
      { who: 'Doña Carmen', text: 'A finished journal and a crooked row in my cloth. Amara would call that a fair trade. She would be right.' },
    ],
  },

  // ---- Carmen's pattern quiz (a riddle from a person, not a system) ----
  'carmen.riddle': {
    lines: [
      { who: 'Doña Carmen', text: 'Sit. You wove a row, so now you are a student, and students get examined. Do not look so worried, the tea is included.' },
      { who: 'Doña Carmen', text: 'First question. In the cloth: which one is the river?' },
    ],
    choices: [
      { text: 'The zigzag', goto: 'carmen.r1right' },
      { text: 'The little diamond', goto: 'carmen.r1diamond' },
      { text: 'The eye shape', goto: 'carmen.r1eye' },
    ],
  },
  'carmen.r1right': {
    lines: [{ who: 'Doña Carmen', text: 'Mayu q\'enqo. The river that is also the road of stars. Correct, and do not get smug.' }],
    next: 'carmen.r2',
  },
  'carmen.r1diamond': {
    lines: [
      { who: 'Doña Carmen', text: 'That is a qocha, a lake. A river that sat down and gave up. Not the same thing at all.' },
      { who: 'Doña Carmen', text: 'The zigzag, wawa. Rivers argue with the land. Straight lines are for people in a hurry.' },
    ],
    next: 'carmen.r2',
  },
  'carmen.r1eye': {
    lines: [
      { who: 'Doña Carmen', text: 'The ñawi? That is an eye. If your rivers have eyes, we should discuss what is in your cup.' },
    ],
    next: 'carmen.r2',
  },
  'carmen.r2': {
    lines: [{ who: 'Doña Carmen', text: 'Second question. Sumaq means beautiful, or delicious?' }],
    choices: [
      { text: 'Beautiful', goto: 'carmen.r2half' },
      { text: 'Delicious', goto: 'carmen.r2half2' },
      { text: 'Both, and on purpose', goto: 'carmen.r2right' },
    ],
  },
  'carmen.r2right': {
    lines: [{ who: 'Doña Carmen', text: 'Both! One word, because why should the eyes and the tongue keep separate books. You HAVE been listening.' }],
    next: 'carmen.r3',
  },
  'carmen.r2half': {
    lines: [{ who: 'Doña Carmen', text: 'Half marks. It is also delicious. A word big enough for a lliclla and a soup. Most words are too small.' }],
    next: 'carmen.r3',
  },
  'carmen.r2half2': {
    lines: [{ who: 'Doña Carmen', text: 'Half marks. It is also beautiful. Anything worth eating is worth looking at first.' }],
    next: 'carmen.r3',
  },
  'carmen.r3': {
    lines: [{ who: 'Doña Carmen', text: 'Last one, and it matters. Who knits the chullus?' }],
    choices: [
      { text: 'The men', goto: 'carmen.r3right' },
      { text: 'The grandmothers', goto: 'carmen.r3wrong' },
      { text: 'The llamas', goto: 'carmen.r3llama' },
    ],
  },
  'carmen.r3right': {
    lines: [{ who: 'Doña Carmen', text: 'The men! Since they were boys. Ask Mateo\'s grandfather; better, ask Mateo, and watch him admit it.' }],
    next: 'carmen.riddleEnd',
  },
  'carmen.r3wrong': {
    lines: [
      { who: 'Doña Carmen', text: 'The grandmothers WEAVE. The men knit. We keep the whole cloth economy carefully divided so everyone stays necessary.' },
    ],
    next: 'carmen.riddleEnd',
  },
  'carmen.r3llama': {
    lines: [
      { text: 'Carmen looks at you for a long, level moment.' },
      { who: 'Doña Carmen', text: 'The llamas GROW the wool. If they also knitted it, wawa, what exactly would be left for us to do?' },
      { text: 'Somewhere on the east road, a llama sneezes with what can only be pride.' },
    ],
    next: 'carmen.riddleEnd',
  },
  'carmen.riddleEnd': {
    lines: [
      { who: 'Doña Carmen', text: 'Enough. You pass, roughly. Hold out your wrist.' },
      { text: 'She ties on a thin woven band: terracotta, sky, gold, violet. The colors of your crooked row.' },
      { who: 'Doña Carmen', text: 'So the next village knows somebody already started on you.' },
    ],
    effects: ['set:riddle.done'],
  },

  // ---------------- Aurelio remembers ----------------
  'aurelio.nani': {
    lines: [
      { who: 'Don Aurelio', text: 'Sit. The stone is warm and I have been deciding something.' },
      { who: 'Don Aurelio', text: 'That journal you carry. Red thread on the spine. I watched a girl sew that thread, right here, in 1974.' },
      { text: 'The well rope creaks. Somewhere a loom keeps its slow time.' },
      { who: 'Don Aurelio', text: 'Amara. She greeted everyone, even the dogs. She drank her chicha straight down and the whole room laughed. You have her way of standing.' },
    ],
    next: 'aurelio.nani2',
  },
  'aurelio.nani2': {
    lines: [
      { text: 'From inside his poncho he brings out a letter, soft with fifty years of being carried.' },
      { who: 'Don Aurelio', text: 'She left it for the road east and never came back for it. I kept it. Ayni, you understand. She helped my mother with the harvest.' },
      { who: 'Don Aurelio', text: 'A debt does not expire. It waits, like a seed. Take it to the east gate. The road will tell you the rest.' },
    ],
    effects: ['set:nani.letter', 'errand:nani-letter', 'set:errand.nani-letter'],
  },
  'aurelio.go': {
    lines: [
      { who: 'Don Aurelio', text: 'The gate, wawa. East, past the terraces. Letters are patient, but not forever.' },
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
      { who: 'Justina', text: 'Puma maki! Puma\'s paw. Good soil manners; came up on the first ask.' },
    ],
    effects: ['set:dig.1'],
  },
  'dig.spot2': {
    lines: [
      { text: 'You dig. Deep purple-red, almost glowing against the soil.' },
      { who: 'Justina', text: 'Yana wayru. The ceremony one. For weddings and for showing off, which are related events.' },
    ],
    effects: ['set:dig.2'],
  },
  'dig.spot3': {
    lines: [
      { text: 'You dig. A smooth, generously rounded potato.' },
      { who: 'Justina', text: 'Wira pasña. It means... a well-fed young lady. Do not look at me, I did not name them.' },
      { text: 'In the next row, something small and round pokes up from the soil, considers society, and decides against it.' },
    ],
    effects: ['set:dig.3'],
  },
  'dig.spot4': {
    lines: [
      { text: 'You dig. Pale gold with deep crimson eyes.' },
      { who: 'Justina', text: 'Puka ñawi pasña, the red-eyed girl. She was up too late listening to the stream, like everyone here.' },
    ],
    effects: ['set:dig.4'],
  },
  'dig.spot5': {
    lines: [
      { text: 'You dig. It is... knobbly. Aggressively knobbly. A fist of knuckles with deep, spiteful eyes.' },
      { who: 'Justina', text: 'AH! Llumchuy waqachi! "Makes the daughter-in-law cry!" Try peeling it thin and clean. Go on. Try.' },
    ],
    effects: ['set:dig.5'],
  },
  'dig.finish': {
    lines: [
      { who: 'Justina', text: 'Five names, five faces. Now you know this field better than most cousins.' },
      { text: 'She loads your arms with your own harvest. The knobbly one goes on top, like a warning.' },
    ],
    effects: ['set:dig.done', 'journal:dishes.llumchuy'],
  },

  // ---------------- the watia, built where it grew ----------------
  'justina.watiaInvite': {
    lines: [
      { who: 'Justina', text: 'Papas with names deserve better than a pot, wawa. Today the field does its own cooking.' },
      { who: 'Justina', text: 'The watia. Clods for walls, fire for a heart, papas for a reason. I supervise. You stack.' },
    ],
    choices: [
      { text: 'Build the oven', goto: 'justina.watiaStart' },
      { text: 'Catch your breath first', goto: 'justina.watiaLater' },
    ],
  },
  'justina.watiaStart': {
    lines: [
      { text: 'She kicks a heel into the dry row and up comes a clod, hard as bread crust. The field is full of them.' },
      { who: 'Justina', text: 'Big ones at the bottom, small ones for the roof. A little house for the fire. Haku.' },
    ],
    effects: ['set:watia.start'],
  },
  'justina.watiaLater': {
    lines: [
      { who: 'Justina', text: 'Mm. The field waited all season; it can wait for your lungs. The clods are going nowhere. They are clods.' },
    ],
  },
  'watia.finish': {
    lines: [
      { text: 'Earth over embers over papas. Then the waiting, which smells better every minute of it.' },
      { text: 'Justina rakes one out with a stick, tosses it palm to palm, splits it. Steam climbs out like something set free.' },
      { who: 'Justina', text: 'First bite is the field\'s fee. Eat. No pot in Peru can do this; the earth cooks its own, and does it best.' },
      { text: 'It tastes of smoke and rain and the exact ground you are standing on. Every oven after this one will lose the comparison.' },
    ],
    effects: ['clear:watia.start', 'set:watia.done'],
  },

  // ---------------- the dog ----------------
  'allqu.first': {
    lines: [
      { text: 'A tan dog is supervising the plaza. You remember your instructions and greet it properly. "Allillanchu."' },
      { text: 'The dog considers your credentials. The tail renders its verdict.' },
      { text: 'You appear to have a colleague now.' },
    ],
    effects: ['set:allqu.friend', 'journal:people.allqu'],
  },
  'allqu.idle': {
    lines: [{ text: 'The dog checks in: everything smells approximately correct. The patrol continues.' }],
  },
  // Petting escalates, because the game should always out-commit the player.
  'allqu.pet1': {
    lines: [{ text: 'You pet the dog. The tail concurs.' }],
  },
  'allqu.pet2': {
    lines: [{ text: 'You pet the dog again. The dog was hoping you would come to this conclusion.' }],
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
      { text: 'A small girl stands by the bridge with her arms crossed. A hand-lettered sign leans on the rail: PUENTE. TOLL. YES REALLY.' },
      { who: 'Pilar', text: 'Bridge toll. One interesting fact. I do not accept compliments, weather, or facts about llamas. Everyone has facts about llamas.' },
    ],
    choices: [
      { text: 'Offer the most interesting thing you know', goto: 'pilar.pay' },
      { text: 'Point out you could just... wade across', goto: 'pilar.around' },
    ],
  },
  'pilar.pay': {
    lines: [
      { text: 'You offer the best thing you have learned so far. She hears it out with the face of a customs official.' },
      { who: 'Pilar', text: 'Acceptable. Barely. You may pass forever: lifetime membership. It expires whenever I decide.' },
      { who: 'Pilar', text: 'Membership includes the bridge, the view from the bridge, and hearing about my other offers. Mostly the last one.' },
    ],
    effects: ['set:met.pilar', 'journal:people.pilar'],
  },
  'pilar.around': {
    lines: [
      { who: 'Pilar', text: 'The river is cold and the toll follows you. It is a very advanced toll.' },
      { text: 'She presses her thumb to the back of your hand like a stamp.' },
      { who: 'Pilar', text: 'There. Member. That was the free trial. It ends whenever I decide. Everything here ends whenever I decide.' },
    ],
    effects: ['set:met.pilar', 'journal:people.pilar'],
  },
  'pilar.rocks': {
    lines: [
      { who: 'Pilar', text: 'New business. Lucky rocks. This one is very lucky: it survived being thrown at Mateo.' },
      { who: 'Pilar', text: 'No refunds, because no payments. It is a pure business. My caserita gets the friend price, which is also nothing, but WARMER.' },
      { text: 'You are now the owner of a rock. It does feel a little lucky.' },
    ],
    effects: ['set:pilar.s1'],
  },
  'pilar.tour': {
    lines: [
      { who: 'Pilar', text: 'Special offer. For one fact I will show you the exact spot where nothing sleeps under the bridge.' },
      { who: 'Pilar', text: 'I discovered the nothing myself. Mateo says the story is made up. The story is about MY bridge, so I decide, and it is real.' },
      { text: 'She points at a patch of dark water. It is a very convincing patch. There is definitely nothing there.' },
    ],
    effects: ['set:pilar.s2'],
  },
  'pilar.mayor': {
    lines: [
      { who: 'Pilar', text: 'When I am mayor of the bridge, the toll will be two facts. Enjoy the old prices while you can.' },
      { who: 'Pilar', text: 'Don Aurelio says the village has no mayor. Correct. The position is open. I have a sign and everything.' },
    ],
    effects: ['set:pilar.s3'],
  },
  'pilar.promoted': {
    lines: [
      { who: 'Pilar', text: 'Stop. You know too many things now. It is making my toll look small.' },
      { who: 'Pilar', text: 'Fine. I am promoting you: co-owner of the bridge. Unpaid. The bridge has expenses. Your first job is the expenses.' },
      { text: 'You are now, apparently, in bridge management. The dog is listed as security.' },
    ],
    effects: ['set:pilar.promoted'],
  },
  'pilar.ships': {
    lines: [
      { who: 'Pilar', text: 'Co-owner briefing. Expansion. The river touches the sea, so the sea is technically bridge water. Follow the logic.' },
      { who: 'Pilar', text: 'Ships will owe the toll. In principle. The invoices are drafted. The sea has not responded, which legally is agreement.' },
    ],
    effects: ['set:pilar.s4'],
  },
  'pilar.epilogue': {
    lines: [
      { who: 'Pilar', text: 'You finished the whole old book? Adults finish their books and then they leave. You will leave too.' },
      { text: 'She looks at the water for a moment, conducting some internal negotiation.' },
      { who: 'Pilar', text: 'Bring me something from the sea. A weird one. Not a fact: a THING. That is the exit toll. It is non-negotiable and I will wait.' },
    ],
    effects: ['set:pilar.sea'],
  },
  'pilar.idle': {
    lines: [
      { who: 'Pilar', text: 'The toll stands. The economy of the bridge is strong. Membership renewal is automatic and free, you are welcome.' },
    ],
  },

  // ---- Chasca, the traveling photographer ----
  'chasca.first': {
    lines: [
      { who: 'Chasca', text: 'Stop! Perfect. The light, the ridge, the wind in your poncho. Do not move a single humble thread.' },
      { who: 'Chasca', text: 'Chasca. I photograph the roads. Somebody should be keeping the evidence.' },
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
      { who: 'Chasca', text: 'Lovely. The picture will be beautiful. Wherever pictures go.' },
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
      { who: 'Chasca', text: 'One day I will show them all in a row: every traveler, every road, one long face the world makes.' },
    ],
  },

  // ---- epilogues: the village knows what you finished ----
  'justina.epilogue': {
    lines: [
      { who: 'Justina', text: 'The whole journal? Then write this in the margin: the terraces gave their best papa to Amara\'s grandchild, and the terraces do not regret it.' },
    ],
  },
  'mateo.epilogue': {
    lines: [
      { who: 'Mateo', text: 'You finished the old book? I told my grandfather. He knitted a whole row without saying anything, which for him is a standing ovation.' },
    ],
  },

  // ---------------- the east road ----------------
  'faustino.first': {
    lines: [
      { who: 'Faustino', text: 'Ho! A walker! Sit, the fire is honest and the wind is not.' },
      { who: 'Faustino', text: 'Faustino. Arriero. I walk roads for a living, and my llamas walk them for a better living; they get paid in grass.' },
      { who: 'Faustino', text: 'Where does this road go? Down, friend, until the air gets thick and the sea starts talking.' },
      { who: 'Faustino', text: 'Other foods there. Other words. Same soup, underneath.' },
    ],
    effects: ['set:met.faustino', 'journal:people.faustino'],
    next: 'faustino.whistle',
  },
  'faustino.whistle': {
    lines: [
      { who: 'Faustino', text: 'Ah, but you met Paca at the pass, no? She holds that spot like she pays rent on it.' },
      { text: 'He puts two fingers to his teeth and whistles, one short, one long.' },
      { text: 'From up the road comes the sound of a llama making a large decision slowly.' },
      { who: 'Faustino', text: 'She will move. Eventually. It is her one flaw and her whole personality.' },
    ],
    effects: ['set:paca.moved'],
  },
  'faustino.idle': {
    lines: [
      { who: 'Faustino', text: 'A road is just ayni with distance, friend. It carries you; someday you carry something back along it.' },
    ],
  },
  'faustino.kintu': {
    lines: [
      { who: 'Faustino', text: 'Before you walk further: a proper goodbye. Sit.' },
      { text: 'From his pouch he picks three coca leaves, dark and unbroken, and stacks them shiny side up. He holds them out to you.' },
    ],
    choices: [
      { text: 'Take it with one hand', goto: 'faustino.kintu1' },
      { text: 'Take it with both hands', goto: 'faustino.kintu2' },
    ],
  },
  'faustino.kintu1': {
    lines: [
      { text: 'You reach out with one hand. Faustino does not move. He just waits, holding the k\'intu, patient as the pass.' },
      { text: 'Your second hand eventually catches up with your manners. He nods.' },
      { who: 'Faustino', text: 'Both hands. A k\'intu is not change from the market. Now: blow over it, gently, and name what you are grateful to.' },
      { text: 'You blow across the leaves toward the mountains. The wind takes it from there. It knows the addresses.' },
    ],
    effects: ['set:kintu.done', 'journal:customs.kintu'],
  },
  'faustino.kintu2': {
    lines: [
      { who: 'Faustino', text: 'Both hands, first try. Somebody already started on you, I think.' },
      { who: 'Faustino', text: 'Now blow over it, soft, and name what you are grateful to. The mountains collect these. They have room.' },
      { text: 'You blow across the leaves toward the peaks. The wind takes it from there. It knows the addresses.' },
    ],
    effects: ['set:kintu.done', 'journal:customs.kintu'],
  },
  'paca.block': {
    lines: [
      { text: 'A llama occupies the exact center of the pass, with the calm of a mountain that recently learned to chew.' },
      { text: 'You explain your situation. Paca examines your soul. Paca is unmoved.' },
      { text: 'Perhaps someone on this road knows the appropriate paperwork.' },
    ],
  },
  'paca.after': {
    lines: [
      { text: 'Paca has relocated by almost a full meter, an enormous concession, generously given.' },
      { text: 'She hums to herself, low and self-satisfied. If llamas have theme songs, hers is about being right.' },
    ],
  },
  'llama.look': {
    lines: [
      { text: 'The brown llama regards you from a great social distance. Its wool moves in the wind like slow water.' },
    ],
  },
  'llama.look2': {
    lines: [
      { text: 'This llama hums, low and thoughtful. Faustino says they hum to keep the herd found. It is a location, sung.' },
    ],
  },
  'ex.apacheta': {
    lines: [
      { text: 'A cairn of traveler stones, older than anyone\'s grandmother. Cloth offerings fade between the layers.' },
      { text: 'You find a stone that fits your hand, and add your journey to the pile.' },
    ],
    effects: ['journal:customs.apacheta'],
  },
  'ex.tent': {
    lines: [{ text: 'Canvas, rope, and wind-patience. Inside: a bedroll, a coca pouch, and three novels in Spanish.' }],
  },
  'ex.campfire': {
    lines: [
      { text: 'A fire built by someone who has built ten thousand fires. It burns exactly as much as it should.' },
      { text: 'You feel rested just standing here. The fire asks for nothing in return. Some fires are simply like that.' },
    ],
  },
  'ex.signpost': {
    lines: [
      { text: 'The board points east, carved by many hands over many years. Distances have been added, argued with, crossed out.' },
      { text: 'Someone has simply written: "MORE." The road agrees, and keeps going to prove it.' },
      { text: 'Past this sign the road drops to the sea, and to a village that smells of salt and fried things. The caleta is real. Keep walking.' },
    ],
  },
  'ex.sea.first': {
    lines: [
      { text: 'The land stops. And there, far below, going on until it becomes the sky:' },
      { text: 'The sea.' },
      { text: 'It does not look real. It looks like the altiplano lay down at last and turned silver in its sleep.' },
      { text: 'Somewhere down there, per Faustino, it is talking. You believe him now.' },
    ],
    effects: ['set:sea.seen'],
  },
  'ex.sea': {
    lines: [
      { text: 'Still there. Still enormous. The sea does not require repeat astonishment, but it accepts it graciously.' },
    ],
  },
  'ex.cliff': {
    lines: [
      { text: 'The land ends politely, without a railing. Far below, the other half of the world practices its breathing.' },
    ],
  },
  'ex.bajadasign': {
    lines: [
      { text: 'A board at the elbow of the last switchback, lettered by somebody patient: LA CALETA, and under it an arrow, pointing down.' },
      { text: 'The arrow has been repainted more often than the letters. People keep needing to be told that yes, it really is just down there.' },
    ],
  },
  'ex.ladera': {
    lines: [
      { text: 'The raw face of the slope, loose rubble at the angle where rubble stops sliding. Nothing walks on it twice.' },
      { text: 'This is the whole argument for the switchbacks: the mountain would rather you went the long way, and it wins.' },
    ],
  },
  'ex.puna': {
    lines: [{ text: 'Dry gold grass to every horizon. The wind is reading it aloud, softly, to nobody.' }],
  },
  'ex.cactus': {
    lines: [{ text: 'A column cactus, standing the way only things with no appointments can stand. One pink flower, against all advice.' }],
  },
  'ex.shrub': {
    lines: [{ text: 'A low, wind-bullied shrub. It has chosen to interpret the climate as a challenge.' }],
  },
  'ex.path': {
    lines: [{ text: 'The path is older than the village. Feet agreed on it before houses did.' }],
  },
  'ex.plaza': {
    lines: [{ text: 'Flagstones worn smooth by market days, festivals, and ten thousand unhurried conversations.' }],
  },
  'ex.bench': {
    lines: [
      { text: 'A bench worn smooth by fifty years of sitting out the afternoon. It has heard everything twice.' },
    ],
  },
  'ex.woodpile': {
    lines: [
      { text: 'Split eucalyptus, stacked with the particular pride of someone who is ready for winter.' },
    ],
  },
  'ex.planter': {
    lines: [
      { text: 'Geraniums in a clay box, blazing away at 3,800 meters like it is nothing. Somebody waters these before dawn.' },
    ],
  },
  'ex.farol': {
    lines: [
      { text: 'A lamp post, lit each evening by whoever passes first. The village has never discussed this system. It simply works.' },
    ],
  },
  'ex.stall': {
    lines: [
      { text: 'A market stall, asleep between Sundays. The awning stays proud all week out of principle.' },
      { text: 'Someone has left out corn, ají, and greens for whoever needs them. The birds are aware of the policy.' },
    ],
  },
  'ex.thatchRidge': {
    lines: [
      { text: 'Along the roofline, two small ceramic bulls flank a cross: the toritos, on guard against bad luck and bad weather.' },
      { text: 'They have a good record so far.' },
    ],
  },
  'ex.grass': {
    lines: [{ text: 'Riverbank green, the only place in the valley the color gets to show off.' }],
  },

  // ---------------- the east gate ----------------
  'gate.closed': {
    lines: [
      { text: 'A wooden gate across the east road, gray with weather. Beyond it, the ridge, and beyond that, everything else.' },
      { text: 'It is not locked. It is just not yet.' },
    ],
  },
  'gate.final': {
    lines: [
      { text: 'You unfold Nani\'s letter at the gate, where she meant to open it.' },
      { text: '"To whoever I become next: the village taught me everything except how to leave it. Go east anyway. Say yes to soup. Start where the water is."' },
      { text: 'The wind combs through the ichu. Below, smoke rises from four kitchens, straight as loom threads.' },
      { text: 'You write her name into the journal, on the page it was always waiting for.' },
    ],
    effects: ['errand.done', 'set:story.complete', 'journal:people.nani'],
    next: 'gate.end',
  },
  'gate.end': {
    lines: [
      { text: 'End of Chapter One. The road east continues in the next region, when it is built.' },
      { text: 'Ch\'aska Pampa remains open: pages unfilled, people mid-story, soup presumably hot.' },
    ],
  },
  'gate.after': {
    lines: [
      { text: 'The gate stands easy on its hinges now. The road east hums quietly to itself, waiting for its chapter.' },
    ],
  },

  // ---------------- examines ----------------
  'ex.well': {
    lines: [
      { text: 'Cold, sweet water, a long way down. A tin cup hangs from the post for anyone who thirsts.' },
    ],
  },
  'ex.flag': {
    lines: [
      { text: 'A red cloth on a pole over the doorway. The sign, known for a hundred miles, that fresh chicha waits inside.' },
      { text: 'Under it, someone has poured a first splash onto the ground. The earth drinks first here.' },
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
      { text: 'Warped planks, silver with age. They creak in a friendly way.' },
      { text: 'There is nothing under the bridge. There has never been anything under the bridge. The village is very firm about this.' },
      { text: '(The firmness is administered by a small girl with a sign.)' },
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
  'ex.tuft': {
    lines: [{ text: 'Ichu bunchgrass, gold and sharp. The whole pampa whispers with it when the wind combs through.' }],
  },
  'ex.rock': {
    lines: [{ text: 'A boulder, sitting exactly where the glacier left it. It is not planning to move.' }],
  },
  'ex.doorShut': {
    lines: [{ text: 'Latched. From inside: the clack of a loom, a radio speaking Quechua, someone laughing at it.' }],
  },
  'ex.chomba': {
    lines: [
      { text: 'The great clay mother of the house. Inside, chicha dreams its slow, sour dreams.' },
    ],
  },
  'ex.qoncha': {
    lines: [
      { text: 'The q\'oncha, stones and mud and forty years of fire. The walls above it are glossy black and proud of it.' },
    ],
  },
  'ex.loom': {
    lines: [
      { text: 'A backstrap loom, one end lashed to the post, the other end an empty strap, waiting for its weaver.' },
    ],
  },
  'ex.bed': {
    lines: [{ text: 'Sheepskins and a striped blanket heavy enough to argue with the altiplano night.' }],
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
    lines: [{ text: 'Packed earth, swept morning and evening until it shines like something harder. A floor that is also a habit.' }],
  },
  'ex.wallStone': {
    lines: [{ text: 'Dry stone, stacked by hands that trusted gravity and won. No mortar; just patience with corners.' }],
  },
  'ex.dirt': {
    lines: [{ text: 'Bare worked earth. Somebody turns this ground and the ground, on balance, cooperates.' }],
  },
  'ex.wallInt': {
    lines: [{ text: 'A wall that has heard everything and repeated none of it.' }],
  },
  'ex.mat': {
    lines: [{ text: 'The threshold mat, thin with welcomes.' }],
  },
  'ex.pot': {
    lines: [
      { text: 'A clay pot of chuño, potatoes freeze-dried under June stars. Ten years of winters could not outlast it.' },
      { text: 'You feel a brief, inherited urge to smash it and check inside. You rise above your training. It is somebody\'s dinner.' },
    ],
  },
  'ex.cuy': {
    lines: [
      { text: 'A guinea pig considers you briefly, then continues its important business under the furniture.' },
      { text: 'The kitchen census: about twenty, all opinionated.' },
    ],
  },

  // ---------------- the background life ----------------
  'ex.pirca': {
    lines: [
      { text: 'A pirca, field stones stacked without mortar. Every stone got picked up twice: once to clear the field, once to become the wall.' },
      { text: 'There is a gap a few steps along. It is not a failure of the wall; it is the door everyone voted for with their feet.' },
    ],
  },
  'ex.michi': {
    lines: [
      { text: 'On the warmest stone of the wall, a cat has folded itself into a perfect circle. It is off duty. It was never on duty.' },
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
      { text: 'Strings of red ají and gold maize dry on the rack, out of reach of the dogs and almost out of reach of the children.' },
      { text: 'Every house can read a rack like this the way a bank reads a ledger. It says: a good year.' },
    ],
  },
  'ex.chuno': {
    lines: [
      { text: 'Bitter potatoes spread on straw, freezing all night and drying all day. In a week they will be chuño, and chuño keeps ten years.' },
      { text: 'The frost works for free. It is the only laborer in the valley nobody owes ayni.' },
    ],
  },
  'ex.adobera': {
    lines: [
      { text: 'Adobe bricks curing under a plastic sheet, mud and straw on their way to being somebody\'s second room.' },
      { text: 'One brick holds a perfect dog print. It will be laid anyway; walls need a little luck worked in.' },
    ],
  },
  'ex.latacan': {
    lines: [
      { text: 'Geraniums blazing out of rusty lard cans by the door. Nobody repaints the cans; the flowers are carrying the whole act.' },
    ],
  },
  'ex.nicho': {
    lines: [
      { text: 'A whitewashed niche, and inside, a small saint in a hand-woven manta sized for a doll.' },
      { text: 'The flowers are fresh today. Whoever tends this does not want to be thanked, so you nod and keep walking.' },
    ],
  },
  'ex.nicho.after': {
    lines: [
      { text: 'The little saint has a new knitted hat against the coming cold. It fits, which means somebody measured.' },
    ],
  },
  'ex.sacos.stall': {
    lines: [
      { text: 'Sacks rolled open at the mouth: white mote, dried habas, coffee-dark chuño. The scoop is a tin cup with firm opinions on fair measure.' },
    ],
  },
  'ex.sacos': {
    lines: [
      { text: 'Sacks of sprouted corn resting against the wall. Rosa calls it jora; the chomba in the corner calls it destiny.' },
    ],
  },
  'ex.grano': {
    lines: [
      { text: 'Spilled barley by the stall. The hens found out before you did, and they are working the spill in shifts.' },
    ],
  },
  'ex.chakitaqlla': {
    lines: [
      { text: 'A chakitaqlla leans on the wall: the foot plow, older here than the wheel and considerably less impressed by it.' },
      { text: 'The footrest is polished bright. That shine is a hundred planting mornings deep.' },
    ],
  },
  'ex.tendedero': {
    lines: [
      { text: 'Llicllas and a heavy pollera dry on the line, hems weighted so the wind takes no souvenirs.' },
    ],
  },
  'ex.tendedero.pallay': {
    lines: [
      { text: 'You can read the line now: ch\'aska stars, a river border running like the Mayu. Carmen\'s alphabet, out in the sun.' },
    ],
  },
  'ex.sapling': {
    lines: [
      { text: 'A eucalyptus sapling tied to a cane, planted the same season as somebody\'s baby. They are neck and neck.' },
    ],
  },
  'ex.pelota': {
    lines: [
      { text: 'A soccer ball, wedged in the roof grass. It has been up there long enough to fade on one side.' },
      { text: 'Ask anyone: greatest goal ever scored in this valley. Ask the goalkeeper: wind.' },
    ],
    effects: ['set:pelota.seen'],
  },
  'ex.pelota.again': {
    lines: [
      { text: 'Still up there. Rescue plans exist, but every ladder in the village turns out to be busy.' },
    ],
  },
  'ex.gallina': {
    lines: [
      { text: 'A hen, auditing the ground with total confidence. She finds something every third step, or claims to.' },
    ],
  },
  'ex.kite': {
    lines: [
      { text: 'High in the branches, a kite shaped like a condor, tail ribbons still trying. It flew beautifully once, witnesses insist.' },
    ],
  },
  'ex.kite.faustino': {
    lines: [
      { text: 'Faustino swears a real condor circled it twice and left unconvinced. The kite has chosen to take this as a compliment.' },
    ],
  },
  'ex.hitchpost': {
    lines: [
      { text: 'A hitching rail rubbed smooth by mule rope, salt going one way over the pass and sugar coming back the other.' },
      { text: 'The ground nearby has been diplomatically swept. Mules are mules.' },
    ],
  },
  'ex.qepi': {
    lines: [
      { text: 'A traveler\'s q\'epi rests by the cairn: a carrying cloth knotted around everything that matters today.' },
      { text: 'You do not look inside. The knot is a door, and it is closed.' },
    ],
  },
  'ex.apachetita': {
    lines: [
      { text: 'A young apacheta, ankle high. Every traveler leaves a stone, and with it a little of the weight that has no weight.' },
    ],
  },
  'ex.apachetita.stone': {
    lines: [
      { text: 'You add a stone before you have finished deciding to. The pile is one traveler taller now, and so, somehow, are you.' },
    ],
  },
  'ex.lagarto': {
    lines: [
      { text: 'A lizard flat on a warm stone, doing the most important work on this road: nothing, magnificently.' },
    ],
  },
  'ex.charango': {
    lines: [
      { text: 'Don Teófilo\'s charango, propped where his hand can find it without looking. The strings are new; the jokes they accompany are not.' },
    ],
  },
  'ex.pushka': {
    lines: [
      { text: 'A pushka drop spindle in a basket of cloud-colored wool. It is never idle long; hands here spin even while walking.' },
    ],
  },
  'ex.dyepots': {
    lines: [
      { text: 'Little pots of dye: cochineal red from crushed insects, q\'olle yellow from flowers. A kitchen, but for color.' },
      { text: 'The red pot is stained a red that will outlive the pot.' },
    ],
  },
  'ex.wellstone': {
    lines: [
      { text: 'Small dark setts laid in rings around the wellhead, wet in the middle at any hour, swept every morning by whoever arrives first.' },
      { text: 'Stand on it and you can feel the square lean inward. This is the place the village is measured from.' },
    ],
  },
  'ex.plazaworn': {
    lines: [
      { text: 'The paving here is rubbed pale and smooth, the joints packed with dust. Nothing grows in it. Nothing gets the chance.' },
      { text: 'Four of these tracks cross the square, and every one of them bends toward the well.' },
    ],
  },
  'ex.parva': {
    lines: [
      { text: 'A parva: barley sheaves stacked into a rick and tied at the crown, with one flat stone on top in case the wind has opinions.' },
      { text: 'It is taller than you are and smells like a warm afternoon that happened three months ago.' },
    ],
  },
  'ex.cantaros': {
    lines: [
      { text: 'Cántaros set down in a queue at the well, each one holding a place for somebody who is currently busy talking.' },
      { text: 'The order is not written anywhere. Everyone knows it anyway.' },
    ],
  },
  'ex.batea.chicheria': {
    lines: [
      { text: 'The straining trough, hollowed from one block and stained the colour of every batch that has ever gone through it.' },
      { text: 'Rosa will not have it scrubbed out. She says the wood remembers how, and she is not entirely joking.' },
    ],
  },
  'ex.cantaros.chicheria': {
    lines: [
      { text: 'Cántaros lined up in the corner waiting to be filled, each with a different chip out of its lip so nobody argues about whose is whose.' },
    ],
  },
  'ex.grano.chicheria': {
    lines: [
      { text: 'Sprouted maize spread out to dry on a cloth, sweet and faintly sour. This is the part that takes the days; the rest is just waiting.' },
    ],
  },
  'ex.qepi.indoors': {
    lines: [
      { text: 'Somebody\u2019s q\u2019epi set down inside the door, knot still tied. It will be picked up on the way out and not a moment before.' },
    ],
  },
  'ex.mantas.carmen': {
    lines: [
      { text: 'Finished mantas folded at the foot of the bed, four deep, each one a season. Doña Carmen keeps the newest on the bottom.' },
    ],
  },
  'ex.batea': {
    lines: [
      { text: 'A stone trough worn dish-shaped in the middle, half full of grey water with the soap still on it, one red cloth over the lip.' },
      { text: 'Whoever is washing today has gone off to say one more thing to somebody.' },
    ],
  },
  'ex.mantas': {
    lines: [
      { text: 'Mantas spread out on the paving with stones on the corners: cochineal red, indigo, a yellow that argues with the sun and wins.' },
      { text: 'Every band of pattern is somebody counting in their head for a week.' },
    ],
  },
  'ex.mantas.woven': {
    lines: [
      { text: 'You can read them now, a little. That row of hooks is the one Carmen called out to you, and yours came out crookeder than these.' },
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
  tuft: [{ node: 'ex.tuft' }],
  rock: [{ node: 'ex.rock' }],
  doorShut: [{ node: 'ex.doorShut' }],
  chomba: [{ node: 'ex.chomba' }],
  qoncha: [{ node: 'ex.qoncha' }],
  loom: [{ node: 'ex.loom' }],
  bed: [{ node: 'ex.bed' }],
  table: [{ node: 'ex.table' }],
  stool: [{ node: 'ex.stool' }],
  shelf: [{ node: 'ex.shelf' }],
  rug: [{ node: 'ex.rug' }],
  floorEarth: [{ node: 'ex.floor' }],
  wallStone: [{ node: 'ex.wallStone' }],
  dirt: [{ node: 'ex.dirt' }],
  wallInt: [{ node: 'ex.wallInt' }],
  mat: [{ node: 'ex.mat' }],
  pot: [{ node: 'ex.pot' }],
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
  grass: [{ node: 'ex.grass' }],
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
