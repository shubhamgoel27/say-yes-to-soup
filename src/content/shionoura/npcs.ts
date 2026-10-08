import type { ExamineArm, NodeMap, NpcDef } from '../schema';

/**
 * Shionoura's people. Rural Inland Sea Japanese: informal, teasing, direct.
 * A fishing port runs on banter and nicknames, not keigo. Corrections are
 * warm, the wrong branch is the kinder scene, and the cicadas never stop.
 */

export const SHIONOURA_NPCS: NpcDef[] = [
  {
    id: 'hana',
    name: 'Hana',
    map: 'shionoura',
    // At the head of the pier, a row back from the walking rows, looking at
    // her town. Her leash stays on the town side of the quay.
    pos: [22, 21],
    range: 1,
    look: {
      skin: '#e8c39a',
      hair: '#241a12',
      cloth: '#2c3e57',
      stripe: '#f2e6d0',
      hat: '#e8dcc4',
      hatStyle: 'none',
    },
    entry: [
      { when: { not: ['met.hana'] }, node: 'c4.hana.first' },
      { when: { has: ['met.hana'], not: ['c4.hana2'] }, node: 'c4.hana.onigiri' },
      {
        when: {
          has: ['c4.omiyage', 'c4.wish.hung', 'c4.kingyo.done', 'met.fumi', 'met.daisuke', 'met.sachiko', 'met.genji'],
          not: ['c4.complete'],
        },
        node: 'c4.matsuri',
      },
      { when: { has: ['met.fumi'], not: ['c4.hana3'] }, node: 'c4.hana.gran' },
      { when: { has: ['c4.hana3', 'page.words.tadaima'], not: ['c4.hana.okaeri'] }, node: 'c4.hana.okaeri' },
      { when: { has: ['c4.complete'] }, node: 'c4.hana.after' },
      { node: 'c4.hana.idle' },
    ],
  },
  {
    id: 'fumi',
    name: 'Fumi',
    map: 'minshuku',
    pos: [4, 6],
    range: 1,
    look: {
      skin: '#dcae85',
      hair: '#b9b0a2',
      cloth: '#3a4e7a',
      stripe: '#f2e6d0',
      hat: '#e8dcc4',
      hatStyle: 'none',
      skirt: '#5c4630',
    },
    entry: [
      { when: { not: ['met.fumi'] }, node: 'c4.fumi.first' },
      { when: { has: ['met.fumi'], not: ['c4.meal'] }, node: 'c4.fumi.meal' },
      { when: { has: ['c4.meal'], not: ['c4.dashi'] }, node: 'c4.fumi.dashi' },
      { when: { has: ['c4.tai.got'], not: ['c4.taisomen'] }, node: 'c4.fumi.taisomen' },
      { when: { has: ['c4.taisomen'], not: ['c4.fumi.nani'] }, node: 'c4.fumi.memory' },
      { when: { has: ['c4.ofuro'], not: ['c4.okaeri'] }, node: 'c4.fumi.okaeri' },
      { when: { has: ['c4.dashi'], not: ['c4.cook.done'] }, node: 'c4.fumi.cookinvite' },
      // A guest who makes breakfast has stopped being a guest, so the guest
      // book comes out, and the guest book remembers longer than the town.
      { when: { has: ['c4.cook.done'], not: ['c4.her.told'] }, node: 'c4.fumi.her' },
      { when: { has: ['c4.cook.done'] }, node: 'c4.fumi.cookagain' },
      { node: 'c4.fumi.idle' },
    ],
  },
  {
    id: 'daisuke',
    name: 'Daisuke',
    map: 'shionoura',
    // Beside his own stall on the town-side row, not in front of it.
    pos: [13, 21],
    range: 1,
    look: {
      skin: '#c99a6b',
      hair: '#2b2118',
      cloth: '#3f7fb0',
      stripe: '#e8dcc4',
      hat: '#e8dcc4',
      hatStyle: 'none',
    },
    entry: [
      { when: { not: ['met.daisuke'] }, node: 'c4.dai.first' },
      { when: { has: ['errand.fumi-tai'], not: ['c4.tai.got'] }, node: 'c4.dai.tai' },
      { when: { has: ['c4.taisomen'], not: ['c4.slurp'] }, node: 'c4.dai.udon' },
      { when: { has: ['c4.slurp'], not: ['c4.otsukare'] }, node: 'c4.dai.truck' },
      { node: 'c4.dai.idle' },
    ],
  },
  {
    id: 'sachiko',
    name: 'Sachiko',
    map: 'shionoura',
    // Behind her counter, framed by it and the mikan crates. A shopkeeper
    // minding her wares does not wander into the middle of her own street.
    pos: [13, 10],
    range: 0,
    look: {
      skin: '#e3b58c',
      hair: '#3a2e24',
      cloth: '#c9a35f',
      stripe: '#f2e6d0',
      hat: '#e8dcc4',
      hatStyle: 'none',
      skirt: '#7d3f34',
    },
    entry: [
      { when: { not: ['met.sachiko'] }, node: 'c4.sachi.first' },
      { when: { has: ['met.sachiko'], not: ['c4.sachiko2'] }, node: 'c4.sachi.lemons' },
      {
        when: { has: ['omiyage.petro', 'omiyage.pilar', 'omiyage.aurelio'], not: ['c4.sachi.done'] },
        node: 'c4.sachi.alldone',
      },
      // A player who never paid Pilar's toll has two people on the list.
      {
        when: { has: ['omiyage.petro', 'omiyage.aurelio'], not: ['met.pilar', 'c4.sachi.done'] },
        node: 'c4.sachi.alldone',
      },
      { when: { has: ['c4.sachiko2'], not: ['c4.sachi.done'] }, node: 'c4.sachi.shop' },
      { node: 'c4.sachi.idle' },
    ],
  },
  {
    id: 'genji',
    name: 'Genji',
    map: 'shionoura',
    // A row up the yard, so his broom never wanders him into the cedar
    // crowns along row 4, where only his head showed above the canopy.
    pos: [37, 2],
    range: 1,
    look: {
      skin: '#c99a6b',
      hair: '#cfc8ba',
      cloth: '#6b655c',
      stripe: '#f2e6d0',
      hat: '#e8dcc4',
      hatStyle: 'none',
    },
    entry: [
      { when: { not: ['met.genji'] }, node: 'c4.genji.first' },
      { when: { has: ['met.genji'], not: ['c4.tanzaku'] }, node: 'c4.genji.amanogawa' },
      { when: { has: ['c4.wish.hung'], not: ['c4.genji3'] }, node: 'c4.genji.hung' },
      { node: 'c4.genji.idle' },
    ],
  },
  {
    id: 'taro',
    name: 'Taro',
    map: 'shionoura',
    // Under the wish bamboo by the shrine steps, off the approach itself.
    pos: [33, 9],
    range: 1,
    look: {
      skin: '#e8c39a',
      hair: '#241a12',
      cloth: '#d9694a',
      stripe: '#8fcbe8',
      hat: '#e8dcc4',
      hatStyle: 'none',
      kid: true,
    },
    entry: [
      { when: { not: ['met.taro'] }, node: 'c4.taro.first' },
      { when: { has: ['met.taro'], not: ['c4.taro.wish'] }, node: 'c4.taro.help' },
      { when: { has: ['c4.taro.wish'], not: ['c4.kingyo.done'] }, node: 'c4.taro.kingyo' },
      { node: 'c4.taro.idle' },
    ],
  },
  {
    id: 'isao',
    name: 'Captain Isao',
    map: 'shionoura',
    // At the corner of the ferry office, on the town-side row.
    pos: [32, 21],
    range: 1,
    look: {
      skin: '#c08b5e',
      hair: '#e6e0d4',
      cloth: '#2c3e57',
      stripe: '#c9a35f',
      hat: '#2c3e57',
      hatStyle: 'none',
    },
    entry: [
      { when: { has: ['c4.complete'], not: ['met.captain'] }, node: 'c4.isao.meet' },
      { when: { not: ['met.captain'] }, node: 'c4.isao.first' },
      { when: { has: ['c4.complete'] }, node: 'c4.isao.ferry' },
      { node: 'c4.isao.notyet' },
    ],
  },
  {
    id: 'chascaC4',
    name: 'Chasca',
    map: 'shionoura',
    // On the kerb side, shooting the shopfronts across the walking row.
    pos: [20, 12],
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
      { when: { not: ['met.chascaC4'] }, node: 'c4.chasca.noren' },
      { when: { has: ['met.chascaC4', 'photo.c3.deck'], not: ['c4.chasca2'] }, node: 'c4.chasca.deck' },
      { node: 'c4.chasca.idle' },
    ],
  },
  {
    // Her look is her look from the Yacana, exactly; an engineer does not change.
    // Ashore only while the ship unloads: she sails before the festival ends.
    id: 'olenaC4',
    name: 'Olena',
    map: 'shionoura',
    when: { has: ['c4.arrived'], not: ['c4.complete'] },
    // At the end of the quay, where the paving gives out onto sand, holding
    // the starter up to the hills: exactly where her line puts her, and no
    // longer standing in the ferry office doorway.
    pos: [38, 22],
    range: 0,
    look: {
      skin: '#dfb08a',
      hair: '#c98a3f',
      cloth: '#5c6e77',
      stripe: '#c9a35f',
      hat: '#e8dcc4',
      hatStyle: 'none',
      prop: 'jar',
    },
    entry: [
      { when: { not: ['c4.met.olena'] }, node: 'c4.olena.shore' },
      { when: { has: ['c4.met.olena'], not: ['c4.olena.quizzed'] }, node: 'c4.olena.quiz' },
      { node: 'c4.olena.idle' },
    ],
  },
];

export const SHIONOURA_NODES: NodeMap = {
  // The walls themselves; without this arm they fall through to the
  // village's adobe line, which reads strangely far from the altiplano.
  'c4.ex.wall': {
    lines: [{ text: 'Cedar boards silvered by salt wind. Nobody painted them; the sea did.' }],
  },
  // ---------------- arrival ----------------
  'c4.arrive': {
    lines: [
      { text: 'The launch noses in past a stone lantern, and the Inland Sea goes glass-flat behind you. Land, after thirty-one days of deck.' },
      { text: 'Boats fly bright banners for a festival that has not happened yet. Hana is already ashore, standing very still, looking at her town.' },
    ],
    effects: ['set:c4.arrived'],
  },

  // ---------------- Hana, home ----------------
  'c4.hana.first': {
    lines: [
      { who: 'Hana', text: 'Tadaima. That is what you say when you come home. I have been saying it under my breath since the lighthouse.' },
      { who: 'Hana', text: 'And the town answers okaeri. Four years gone, and the word waited for me.' },
      { who: 'Hana', text: 'My grandmother keeps the minshuku past the shotengai, behind the noren. Your room is made up; arguing is useless.' },
    ],
    effects: ['set:met.hana', 'journal:people.hanahome', 'journal:words.tadaima'],
    next: 'c4.hana.onigiri',
  },
  'c4.hana.onigiri': {
    lines: [
      { text: 'Hana presses a cloth bundle into your hands with both of hers: two rice balls, still warm.' },
      { who: 'Hana', text: 'Onigiri. Ferry food, boat food, everything food. Obaachan’s umeboshi fights back a little.' },
      { text: 'She says sumimasen to a porter, to the tea cart, over her change. Three jobs, one word.' },
    ],
    effects: ['set:c4.hana2', 'journal:dishes.onigiri', 'journal:words.sumimasen'],
  },
  'c4.hana.gran': {
    lines: [
      { who: 'Hana', text: 'So you met Obaachan. Did she scold your shoes? She scolded mine, and I grew up in that genkan.' },
      { who: 'Hana', text: 'My grandfather fished tai from this water his whole life. Those are his flags on the pier. She flies them for Tanabata now.' },
    ],
    effects: ['set:c4.hana3'],
  },
  'c4.matsuri': {
    lines: [
      { text: 'Dusk. The chochin come on and the quay turns paper-orange. Geta clack on stone, a sound saved up all year for this.' },
      { text: 'The bamboo is heavy with wishes, yours among them. Daisuke is bellowing prices for things he is giving away.' },
      { who: 'Hana', text: 'Orihime and Hikoboshi get one night a year, and they chose a good one. Look up. The clouds are thinking about it.' },
    ],
    effects: ['set:c4.complete'],
    choices: [
      { text: '"I saw this river from the middle of the ocean."', goto: 'c4.matsuri.river', when: { has: ['page.customs.starriver'] } },
      { text: 'Say otsukaresama, to nobody in particular', goto: 'c4.matsuri.otsu', when: { has: ['page.words.otsukaresama'] } },
      { text: 'Watch the lanterns with her', goto: 'c4.matsuri.end' },
    ],
  },
  'c4.matsuri.river': {
    lines: [
      { who: 'Hana', text: 'The deck, mid-Pacific. Same river. Tonight my whole town hangs its hopes on it, on paper; I think both versions are true.' },
    ],
    next: 'c4.matsuri.end',
  },
  'c4.matsuri.otsu': {
    lines: [
      { text: 'Otsukaresama, you say, to the whole tired shining town, and it comes back from three directions at once.' },
    ],
    next: 'c4.matsuri.end',
  },
  'c4.matsuri.end': {
    lines: [
      { text: 'A drum starts somewhere. Your goldfish catches the lantern light and becomes, briefly, the brightest thing in town.' },
      { who: 'Hana', text: 'Thank you for walking my home with me. When you sail, take some of tonight along. That is the whole point of omiyage.' },
    ],
  },
  'c4.hana.after': {
    lines: [
      { who: 'Hana', text: 'Captain Isao takes you across when you are ready. Busan first, he says, as if the sea were a bus route.' },
      { who: 'Hana', text: 'I stay this time. Write to me from wherever the journal takes you.' },
    ],
  },
  'c4.hana.okaeri': {
    lines: [
      { text: 'Before you can say hello, the word you have been carrying tries itself out on Hana: tadaima. I am home.' },
      { who: 'Hana', text: 'Okaeri.' },
      { who: 'Hana', text: 'No, do not apologize! You said it right, so the town answered. Welcome back, to a home not yours. Yet.' },
    ],
    effects: ['set:c4.hana.okaeri'],
  },
  'c4.hana.idle': {
    lines: [
      { who: 'Hana', text: 'Four years away and the ferry is still three minutes early. Some things you can lean your whole life against.' },
    ],
  },

  // ---------------- Fumi, the hearth ----------------
  'c4.fumi.first': {
    lines: [
      { text: 'You step up into the cool wooden dark. Sand grits on the boards behind you.' },
      { who: 'Fumi', text: 'Ah, ah, ah! Shoes! The shoes live down there; the house starts where the wood does. Off, off.' },
      { text: 'Laughing, she sets out slippers pointed the right way. Hana radioed from the ship; your room is aired, as threatened.' },
    ],
    effects: ['set:met.fumi', 'journal:people.fumi', 'journal:customs.genkan'],
    next: 'c4.fumi.meal',
  },
  'c4.fumi.meal': {
    lines: [
      { text: 'A low table, a fish grilled whole, pickles the color of stained glass. She puts her palms together.' },
      { who: 'Fumi', text: 'Itadakimasu. I humbly receive. To the fish, the farmer, the sea, the cook. Mostly the cook.' },
    ],
    effects: ['journal:words.itadakimasu'],
    choices: [
      { text: 'Say it back: itadakimasu', goto: 'c4.fumi.meal.say' },
      { text: 'Copy her hands, palms together', goto: 'c4.fumi.meal.copy' },
    ],
  },
  'c4.fumi.meal.say': {
    lines: [
      { text: 'Itadakimasu, you say. It comes out steadier than you expected.' },
    ],
    next: 'c4.fumi.meal2',
  },
  'c4.fumi.meal.copy': {
    lines: [
      { text: 'You put your palms together and bow a little. She nods: the hands said it well enough.' },
    ],
    next: 'c4.fumi.meal2',
  },
  'c4.fumi.meal2': {
    lines: [
      { text: 'The fish tastes like the morning it was caught. When the bowls are empty she bows a centimeter, and you copy her: gochisosama.' },
      { who: 'Fumi', text: 'Gochisosama deshita, yes. It means it was a feast, and you say it even for barley tea and a rice ball. Especially then.' },
    ],
    effects: ['set:c4.meal', 'journal:words.gochisosama'],
  },
  // The broth is learned at the pot, not across it: the dawn kitchen teaches
  // the steps in hand, and the dashi page fills when the cooking is done.
  'c4.fumi.dashi': {
    lines: [
      { who: 'Fumi', text: 'The smell? Iriko, the little dried fish. This house’s broth; the pot will teach you more than I can.' },
      { who: 'Fumi', text: 'Daisuke is holding a tai for me, and the hill got longer this year. Fetch it?' },
    ],
    effects: ['set:c4.dashi', 'errand:fumi-tai', 'set:errand.fumi-tai'],
  },
  'c4.fumi.taisomen': {
    lines: [
      { text: 'The tai goes into the pan whole, then over a nest of somen fine as thread. Hana appears at the smell, exactly like a cat.' },
      { who: 'Fumi', text: 'Tai-somen. A whole sea bream means a wedding, a homecoming, a festival. This week, two of those.' },
      { who: 'Fumi', text: 'The cheek is yours; the guest gets the cheek. House rule, no appeal.' },
    ],
    effects: ['set:c4.taisomen', 'journal:dishes.tai', 'errand.done', 'clear:errand.fumi-tai'],
  },
  'c4.fumi.memory': {
    lines: [
      { who: 'Fumi', text: 'You eat like someone I heard about. My mother-in-law kept this house before me.' },
      { who: 'Fumi', text: 'She told of a foreign girl who bowed too deep to everyone, even the postman. 1974, the year of the big Tanabata rain.' },
      { who: 'Fumi', text: 'She wrote in a little book at this table and thanked corrections twice. Why are you looking at me like that?' },
    ],
    choices: [
      { text: 'Take the journal out', goto: 'c4.fumi.memory.show' },
      { text: 'Leave it in the pack', goto: 'c4.fumi.memory.keep' },
    ],
  },
  'c4.fumi.memory.show': {
    lines: [
      { text: 'You lay the little book on the table. Fumi looks at the cover a long moment and does not open it.' },
    ],
    next: 'c4.fumi.memory.end',
  },
  'c4.fumi.memory.keep': {
    lines: [
      { text: 'Your hand rests on the pack flap a moment, and Fumi pretends not to see it.' },
    ],
    next: 'c4.fumi.memory.end',
  },
  'c4.fumi.memory.end': {
    lines: [
      { who: 'Fumi', text: 'Mm. The table remembers her elbows, I think. Tables are sentimental; ask any innkeeper.' },
    ],
    effects: ['set:c4.fumi.nani'],
  },
  'c4.fumi.okaeri': {
    lines: [
      { who: 'Fumi', text: 'Okaeri. See, you came in from the bath and I said it without thinking. The house has decided you count.' },
    ],
    effects: ['set:c4.okaeri'],
  },
  'c4.fumi.idle': {
    lines: [
      { who: 'Fumi', text: 'The forecast argues about the seventh. Rain, stars, rain. Tsuyu is a guest that never learned when to leave.' },
    ],
  },
  'c4.fumi.cookinvite': {
    lines: [
      { who: 'Fumi', text: 'You keep watching my hands at the pot. Watching is a fine start and a poor finish.' },
      { who: 'Fumi', text: 'Tomorrow, dawn, before the guests wake: the morning dashi and the breakfast, you and me.' },
    ],
    choices: [
      { text: 'Be in the kitchen at dawn', goto: 'c4.fumi.cookstart' },
      { text: 'Sleep first. Dawn comes early here.', goto: 'c4.fumi.cooklater' },
    ],
  },
  'c4.fumi.cookstart': {
    lines: [
      { text: 'Dawn comes grey-pink through the shoji: water, a knife somewhere, the first ferry clearing its throat.' },
      { who: 'Fumi', text: 'Quiet hands, quiet pot. I call the steps, you make them.' },
    ],
    effects: ['set:c4.cook.start'],
  },
  'c4.fumi.cooklater': {
    lines: [
      { who: 'Fumi', text: 'Mm. Dawn does not wait, but it does repeat.' },
    ],
  },
  'c4.cook.finish': {
    lines: [
      { text: 'Two trays reach the low table: rice, miso blooming in the iriko dashi, pickles. The guests wake to a ready house.' },
      { who: 'Fumi', text: 'A guest who makes breakfast has stopped being a guest. There is no ceremony for it. Only more work tomorrow.' },
    ],
    effects: ['clear:c4.cook.start', 'set:c4.cook.done', 'journal:dishes.dashi'],
  },
  // The thread about her. The town does not wonder why she stayed; it never
  // wonders. Two lines in a ledger, three weeks apart, and no one asked once.
  'c4.fumi.her': {
    lines: [
      { text: 'She writes you into the guest book, turning back a page to find room.' },
      { who: 'Fumi', text: 'Ah. Here she is again, in my mother-in-law’s hand. Zoila-san, written in for one night.' },
      { who: 'Fumi', text: 'The next line is three weeks later, and it is her leaving. Nothing in between.' },
    ],
    choices: [
      { text: 'Say nothing.', goto: 'c4.fumi.her.quiet' },
      { text: '"Three weeks is a long stop."', goto: 'c4.fumi.her.long' },
    ],
  },
  'c4.fumi.her.quiet': {
    lines: [
      { text: 'You let the ledger lie open between you. The pen waits with its cap off.' },
    ],
    next: 'c4.fumi.her2',
  },
  'c4.fumi.her.long': {
    lines: [
      { who: 'Fumi', text: 'Mm. Long for a ferry town, short for a life. The ledger only counts nights.' },
    ],
    next: 'c4.fumi.her2',
  },
  'c4.fumi.her2': {
    lines: [
      { who: 'Fumi', text: 'People stop here. The ferry goes without them and the town does not ask why. Tea? The pot is still hot.' },
    ],
    effects: ['set:c4.her.told', 'journal:her.threeweeks'],
  },
  'c4.fumi.cookagain': {
    lines: [
      { who: 'Fumi', text: 'Dawn happens again tomorrow. The pot does not count, and neither do I.' },
    ],
    choices: [
      { text: 'Be in the kitchen at dawn again', when: { has: ['c4.cook.done'] }, goto: 'c4.fumi.cookreplay' },
      { text: 'Let the house sleep in', goto: 'c4.fumi.idle' },
    ],
  },
  'c4.fumi.cookreplay': {
    lines: [
      { who: 'Fumi', text: 'No calling the steps this morning. Your hands know where the kombu goes.' },
    ],
    effects: ['set:replay.mode', 'set:c4.cook.start'],
  },

  // ---------------- Daisuke, tai pride ----------------
  'c4.dai.first': {
    lines: [
      { who: 'Daisuke', text: 'Irasshai! New face! LOOK at this. Tai, red as a good sunrise, caught before you woke up.' },
      { who: 'Daisuke', text: 'Tomonoura one bay over calls its tai famous. Ours swim harder currents, so the meat is sweeter. Science.' },
    ],
    effects: ['set:met.daisuke', 'journal:people.daisuke'],
    choices: [
      { text: '"At home my fish lady made me a casero. A regular."', goto: 'c4.dai.casero', when: { has: ['c2.casero'] } },
      { text: 'Ask why tai is the king fish', goto: 'c4.dai.why' },
    ],
  },
  'c4.dai.casero': {
    lines: [
      { who: 'Daisuke', text: 'A regular! Then you know the rules: come back, and come back again. The fish remembers faces. Well. I remember for it.' },
      { who: 'Daisuke', text: 'Tell your fish lady the tai of Shionoura sends its respects to her lisa.' },
    ],
  },
  'c4.dai.why': {
    lines: [
      { who: 'Daisuke', text: 'Medetai! Happy, lucky, festive. Tai hides inside the word. A pun four hundred years old and still working.' },
      { who: 'Daisuke', text: 'Also Ebisu-sama carries one under his arm, and you do not argue with the fishing god about fish.' },
    ],
  },
  // The two-hands lesson is something you get wrong, not something you hear.
  'c4.dai.tai': {
    lines: [
      { who: 'Daisuke', text: 'Fumi-san’s tai! I held back the best one, do not tell the mayor. Whole, eye clear, proud.' },
      { text: 'He holds it out with both hands, like a diploma.' },
    ],
    choices: [
      { text: 'Take it one-handed', goto: 'c4.dai.tai.one' },
      { text: 'Take it with both hands', goto: 'c4.dai.tai.two' },
    ],
  },
  'c4.dai.tai.one': {
    lines: [
      { who: 'Daisuke', text: 'Both hands, both hands! A gift has weight, ne. Catch it with two so the giver sees you feel it.' },
      { text: 'You take it again properly, with a small bow. He grins like the sunrise on his own flag.' },
    ],
    effects: ['set:c4.tai.got'],
  },
  'c4.dai.tai.two': {
    lines: [
      { text: 'You take it with both hands and a small bow. His eyebrows climb, and then he grins like the sunrise on his own flag.' },
      { who: 'Daisuke', text: 'Two hands! Somebody raised you right, ne. A gift has weight.' },
    ],
    effects: ['set:c4.tai.got'],
  },
  'c4.dai.udon': {
    lines: [
      { text: 'Noon. Daisuke sets down two bowls of udon and inhales his in loud joyful yards. You eat the way you were raised: quietly.' },
      { who: 'Daisuke', text: 'Is it bad? You eat like a funeral. Tell me straight, I can take it.' },
    ],
    choices: [
      { text: 'Slurp it his way', goto: 'c4.dai.slurp' },
      { text: '"It is perfect. I am just quiet."', goto: 'c4.dai.quiet' },
    ],
  },
  'c4.dai.quiet': {
    lines: [
      { who: 'Daisuke', text: 'Quiet! Udon cannot hear quiet. Go on, like the tide over gravel.' },
    ],
    next: 'c4.dai.slurp',
  },
  'c4.dai.slurp': {
    lines: [
      { text: 'You try it his way, tide over gravel. The noodles taste warmer, somehow.' },
      { who: 'Daisuke', text: 'THERE it is! Loud means delicious, ne. Silence is for fish still in the water.' },
    ],
    effects: ['set:c4.slurp'],
    next: 'c4.dai.truck',
  },
  'c4.dai.truck': {
    lines: [
      { text: 'After, the kei truck is backed to the boats and the crates outnumber the hands. You join in: ice, fish, ice, fish.' },
      { text: 'The tailgate bangs shut. Daisuke claps your shoulder with a hand like a docking fender.' },
      { who: 'Daisuke', text: 'Otsukaresama! Your tiredness is seen, ne; the work happened and you were in it.' },
    ],
    effects: ['set:c4.otsukare', 'journal:words.otsukaresama'],
  },
  'c4.dai.idle': {
    lines: [
      { who: 'Daisuke', text: 'Market is gone by eight, ne. The whole ocean, sold before the town brushes its teeth.' },
    ],
    choices: [
      { text: '"Daisuke, which way was I going?"', goto: 'c4.dai.thread' },
      { text: 'Eye the last crates', goto: 'c4.dai.threadNo' },
    ],
  },
  'c4.dai.thread': {
    lines: [
      { who: 'Daisuke', text: 'Ha! Even the fish know where they are going, ne. Wrist out; red thread beats a tide table.' },
    ],
    effects: ['thread:'],
  },
  'c4.dai.threadNo': {
    lines: [{ who: 'Daisuke', text: 'The ocean restocks tonight. Best supplier in the business, ne.' }],
  },

  // ---------------- Sachiko, the omiyage counter ----------------
  'c4.sachi.first': {
    lines: [
      { who: 'Sachiko', text: 'Irasshai, irasshai! Taste first, questions after. Lemon yokan, made with Setoda lemons since my grandmother.' },
      { text: 'A pale gold square, sweet and then sharply, wonderfully sour. It tastes like sunshine that studied abroad. You think at once of the people at home.' },
    ],
    effects: ['set:met.sachiko', 'journal:people.sachiko', 'journal:words.irasshai'],
    next: 'c4.sachi.lemons',
  },
  // The lemon lore rides where the lemons do: on the stenciled crates, found
  // once Sachiko has nodded at them. The page fills at the noticing.
  'c4.sachi.lemons': {
    lines: [
      { who: 'Sachiko', text: 'The lemons ride the ferry from Setoda, one island over; the crates by the counter came with them. Omiyage is chosen slowly and given fast.' },
    ],
    effects: ['set:c4.sachiko2', 'journal:dishes.lemonyokan'],
    next: 'c4.sachi.shop',
  },
  'c4.sachi.shop': {
    lines: [
      { who: 'Sachiko', text: 'Now. Who fed you on the way here? Name them one at a time.' },
    ],
    choices: [
      { text: 'Lemon yokan for Doña Petro, cook to cook', goto: 'c4.omi.petro', when: { not: ['omiyage.petro'] } },
      { text: 'A tairyō-bata tenugui for Pilar\'s museum', goto: 'c4.omi.pilar', when: { has: ['met.pilar'], not: ['omiyage.pilar'] } },
      { text: 'Shodoshima olive tea for Aurelio', goto: 'c4.omi.aurelio', when: { not: ['omiyage.aurelio'] } },
      { text: 'Still thinking. Choosing slowly, like you said.', goto: 'c4.sachi.browse' },
    ],
  },
  'c4.sachi.again': {
    lines: [{ who: 'Sachiko', text: 'There. Who else? A list of people who fed you is never short.' }],
    choices: [
      { text: 'Lemon yokan for Doña Petro, cook to cook', goto: 'c4.omi.petro', when: { not: ['omiyage.petro'] } },
      { text: 'A tairyō-bata tenugui for Pilar\'s museum', goto: 'c4.omi.pilar', when: { has: ['met.pilar'], not: ['omiyage.pilar'] } },
      { text: 'Shodoshima olive tea for Aurelio', goto: 'c4.omi.aurelio', when: { not: ['omiyage.aurelio'] } },
      { text: 'That is all for today', goto: 'c4.sachi.browse' },
    ],
  },
  'c4.omi.petro': {
    lines: [
      { text: 'She wraps the yokan in paper the color of sea haze, folds sharp as sails, and presents it with both hands.' },
      { who: 'Sachiko', text: 'For the cook who feeds strangers. Tell her the sour is Setoda lemon.' },
    ],
    effects: ['set:omiyage.petro', 'set:c4.omiyage', 'journal:customs.omiyage'],
    next: 'c4.sachi.again',
  },
  'c4.omi.pilar': {
    lines: [
      { text: 'A folded tenugui: a big-catch flag in miniature, sunrise, waves, one emphatic tai.' },
      { who: 'Sachiko', text: 'For the little director. Boats fly these when the hold is FULL. An honest flag for an honest collection.' },
    ],
    effects: ['set:omiyage.pilar', 'set:c4.omiyage', 'journal:customs.omiyage'],
    next: 'c4.sachi.again',
  },
  'c4.omi.aurelio': {
    lines: [
      { text: 'A tin of olive-leaf tea from Shodoshima, where Japan first coaxed olives to grow. It smells like a warm, dry hillside.' },
      { who: 'Sachiko', text: 'For the man whose soup is always on. A tea for people who know slow is a flavor.' },
    ],
    effects: ['set:omiyage.aurelio', 'set:c4.omiyage', 'journal:customs.omiyage'],
    next: 'c4.sachi.again',
  },
  'c4.sachi.browse': {
    lines: [
      { who: 'Sachiko', text: 'Take your time. Omiyage waits better than fish.' },
    ],
  },
  'c4.sachi.alldone': {
    lines: [
      { who: 'Sachiko', text: 'A parcel for everyone who fed you. You cannot bring your people here, so you carry the place back to them. Heavier, and worth it.' },
    ],
    effects: ['set:c4.sachi.done'],
  },
  'c4.sachi.idle': {
    lines: [
      { who: 'Sachiko', text: 'Festival week empties my shelves faster than typhoon week.' },
    ],
  },

  // ---------------- Genji, laconic at the shrine ----------------
  'c4.genji.first': {
    lines: [
      { text: 'A dry old man sweeps the shrine yard with the patience of the stones under him. He does not stop for you.' },
      { who: 'Genji', text: 'Ebisu. God of fishermen. He is smiling. I sweep.' },
      { text: 'It appears the introduction is complete, and, in its way, thorough.' },
    ],
    effects: ['set:met.genji', 'journal:people.genji'],
    next: 'c4.genji.amanogawa',
  },
  // The myth is not recited; Genji points and the sky over the water tells it.
  // The Amanogawa examine holds the story, the journal rhyme the recognition.
  'c4.genji.amanogawa': {
    lines: [
      { who: 'Genji', text: 'The seventh night. Ask the sky over the water after dark; it tells it better than a broom.' },
      { text: 'The broom stops, which is an event. He puts a strip of colored paper in your hands, with both of his.' },
      { who: 'Genji', text: 'Tanzaku. One wish. The paper is small on purpose.' },
    ],
    effects: ['set:c4.tanzaku'],
  },
  'c4.genji.hung': {
    lines: [
      { who: 'Genji', text: 'I saw your strip on the bamboo. Good knot.' },
      { text: 'He resumes sweeping. From Genji, this is roughly a festival of approval.' },
    ],
    effects: ['set:c4.genji3'],
  },
  'c4.genji.idle': {
    lines: [
      { who: 'Genji', text: 'Seven years underground, one summer shouting. Make of that what you like. I sweep.' },
    ],
    choices: [
      { text: '"Which way was I going, Genji-san?"', goto: 'c4.genji.thread' },
      { text: 'Leave him to the sweeping', goto: 'c4.genji.threadNo' },
    ],
  },
  'c4.genji.thread': {
    lines: [
      { who: 'Genji', text: 'The steps go up and the steps go down. For everything in between, ask your wrist. I sweep.' },
    ],
    effects: ['thread:'],
  },
  'c4.genji.threadNo': {
    lines: [{ who: 'Genji', text: 'Mm.' }],
  },

  // ---------------- Taro, whose wish is too big ----------------
  'c4.taro.first': {
    lines: [
      { text: 'A kid sits at the foot of the shrine steps among crumpled tanzaku, chewing the pencil.' },
      { who: 'Taro', text: 'The paper is TOO SMALL. Dad’s boat comes back full, and school stays open, and Gran’s knees stop hurting, and, and.' },
      { who: 'Taro', text: 'Genji-san gives you one strip a year. ONE. Who designed this system?' },
    ],
    effects: ['set:met.taro', 'journal:people.taro'],
    next: 'c4.taro.help',
  },
  'c4.taro.help': {
    lines: [
      { who: 'Taro', text: 'You write in that book all the time. Professional. How do I fit a wish this big on a paper this small?' },
    ],
    choices: [
      { text: '"Find the one wish hiding inside all of them."', goto: 'c4.taro.inside' },
      { text: '"Write the biggest one. The rest can ride on it."', goto: 'c4.taro.biggest' },
    ],
  },
  'c4.taro.inside': {
    lines: [
      { who: 'Taro', text: 'Boat, school, knees... they are all just: everybody stays okay. THAT FITS.' },
      { text: 'He writes it in enormous wobbly characters across the whole strip: minna genki de. Everyone, be well.' },
      { who: 'Taro', text: 'Next year I am asking for a bicycle though.' },
    ],
    effects: ['set:c4.taro.wish'],
  },
  'c4.taro.biggest': {
    lines: [
      { who: 'Taro', text: 'Dad’s boat. If it comes back full, Gran gets medicine, and if there are fish there is a school.' },
      { text: 'He writes it, tongue out. One wish, towing three others like skiffs.' },
      { who: 'Taro', text: 'You are good at this. Do you do weddings?' },
    ],
    effects: ['set:c4.taro.wish'],
  },
  'c4.taro.kingyo': {
    lines: [
      { who: 'Taro', text: 'The goldfish uncle acts tough, but he has never let a kid walk away empty. Test him. For science.' },
    ],
  },
  'c4.taro.idle': {
    lines: [
      { who: 'Taro', text: 'If it rains on the seventh night I am complaining to the Sky King. Genji-san says get in line.' },
    ],
    choices: [
      { text: '"Taro, remind me where I was headed?"', goto: 'c4.taro.thread' },
      { text: 'Leave him to his campaign', goto: 'c4.taro.threadNo' },
    ],
  },
  'c4.taro.thread': {
    lines: [
      { who: 'Taro', text: 'A grown-up, lost? AMAZING. Okay: hold your wrist up like a hero and follow the red.' },
    ],
    effects: ['thread:'],
  },
  'c4.taro.threadNo': {
    lines: [{ who: 'Taro', text: 'Tell the Sky King I am WAITING.' }],
  },

  // ---------------- Captain Isao, the timetable ----------------
  'c4.isao.first': {
    lines: [
      { text: 'By the ferry office, an old captain studies the water like a man auditing an employee of fifty years.' },
      { who: 'Captain Isao', text: 'Isao. Forty-one years on this run. School, hospital, brides, coffins: all of it rides with me, on time.' },
    ],
    effects: ['set:met.captain', 'journal:people.captain'],
    choices: [
      { text: '"An old fisherman taught me to say la mar. The sea, like a person."', goto: 'c4.isao.lamar', when: { has: ['page.words.lamar'] } },
      { text: 'Ask about this sea', goto: 'c4.isao.umi' },
    ],
  },
  'c4.isao.lamar': {
    lines: [
      { who: 'Captain Isao', text: 'La mar. Mm. Here too the sea is somebody. Fishermen apologize to her, thank her, grumble at her moods.' },
      { who: 'Captain Isao', text: 'Your fisherman and I would understand each other with only that one word between us.' },
    ],
  },
  'c4.isao.umi': {
    lines: [
      { who: 'Captain Isao', text: 'The Seto Naikai. Seven hundred islands, calm as a held breath.' },
      { who: 'Captain Isao', text: 'The old crews speak of it like a grandmother in the next room. You say thank you at the rail.' },
    ],
  },
  // Met for the first time on the last morning: one introduction, then the boat.
  'c4.isao.meet': {
    lines: [
      { text: 'By the ferry office, an old captain studies the water like a man auditing an employee of fifty years.' },
      { who: 'Captain Isao', text: 'Isao. Forty-one years on this run. I wondered when the festival would finish with you.' },
    ],
    effects: ['set:met.captain', 'journal:people.captain'],
    next: 'c4.isao.ferry',
  },
  'c4.isao.ferry': {
    lines: [
      { who: 'Captain Isao', text: 'So. The wishes are up and your pack smells of lemon and wrapping paper.' },
      { who: 'Captain Isao', text: 'Shimonoseki on the morning boat, then the Busan ferry. Say the word.' },
    ],
    choices: [
      { text: 'Board for Busan', goto: 'c4.depart' },
      { text: 'Not yet. The town is not finished with me.', goto: 'c4.isao.wait' },
    ],
  },
  // Miokuri: a house sees its guest off until the guest is out of sight.
  // Shionoura's goodbye is a bow that outlasts the view of it.
  'c4.depart': {
    lines: [
      { text: 'The tairyō-bata crack once in the morning wind. Okaeri, the town said when you came; itterasshai, it says now: go, and come back.' },
      { text: 'Fumi stands at the end of the pier and bows. When the boat rounds the lighthouse, she is still bowing.' },
    ],
    effects: ['travel:busan'],
  },
  'c4.isao.wait': {
    lines: [
      { who: 'Captain Isao', text: 'Sensible. A town takes longer to leave than to reach. The timetable and I will be here.' },
    ],
  },
  'c4.isao.notyet': {
    lines: [
      { who: 'Captain Isao', text: 'Passage to Busan goes through me, but not before the seventh night. Even the timetable respects Tanabata.' },
    ],
  },

  // ---------------- Chasca, photographing noren ----------------
  'c4.chasca.noren': {
    lines: [
      { who: 'Chasca', text: 'The soup-eater! A shop that is open hangs its own flag. Poetry!' },
      { who: 'Chasca', text: 'Stand half through the noren. In or out, the photo will not say. Perfect for an album about leaving. ¡Digan papas!' },
    ],
    effects: ['set:met.chascaC4', 'set:photo.flash', 'set:photo.c4.noren'],
  },
  'c4.chasca.deck': {
    lines: [
      { who: 'Chasca', text: 'The deck photo came out ALL stars, and you a smudge under them. My favorite smudge so far.' },
    ],
    effects: ['set:c4.chasca2'],
  },
  'c4.chasca.idle': {
    lines: [
      { who: 'Chasca', text: 'I develop everything at the end of the journey. Whose journey? The album keeps its own counsel.' },
    ],
  },

  // ---------------- Olena, on shore leave while the Yacana unloads ----------------
  'c4.olena.shore': {
    lines: [
      { text: 'At the end of the quay, in shore clothes, a familiar figure holds a glass jar up toward the green hills.' },
      { who: 'Olena', text: 'The galley hand. Shore leave while the Yacana unloads: an ancient maritime right.' },
      { who: 'Olena', text: 'This starter has seen six oceans and never a mountain. Look at it bubble.' },
    ],
    effects: ['set:c4.met.olena'],
    next: 'c4.olena.quiz',
  },
  'c4.olena.quiz': {
    lines: [
      { who: 'Olena', text: 'One day on land and the crossing blurs. Prove me wrong: one thing from it that is still sharp.' },
    ],
    effects: ['set:c4.olena.quizzed'],
    choices: [
      { text: '"I was ducked by Neptune himself and have the certificate."', goto: 'c4.olena.a.neptune', when: { has: ['c3.shellback'] } },
      { text: '"The river has three names and I found all three."', goto: 'c4.olena.a.river', when: { has: ['page.customs.starriver'] } },
      { text: '"Your starter bubbled for me. You said that made us family."', goto: 'c4.olena.a.family', when: { has: ['c3.olena.bread'] } },
      { text: '"The sea is a big wet month, Olena."', goto: 'c4.olena.a.wet' },
    ],
  },
  'c4.olena.a.neptune': {
    lines: [
      { who: 'Olena', text: 'Ducked by a bosun in a mop wig, technically. But the certificate is real. Full marks; frame it before the sea takes the memory back.' },
    ],
  },
  'c4.olena.a.river': {
    lines: [
      { who: 'Olena', text: 'Mayu, Milky Way, Amanogawa. Tonight this town hangs paper for the third name. Convenient timing.' },
      { who: 'Olena', text: 'Full marks. You kept the sky. Everything else on that ship is just steel and dinner.' },
    ],
  },
  'c4.olena.a.family': {
    lines: [
      { who: 'Olena', text: 'It bubbled immediately. It does not do that for the chief engineer, and he has asked nicely for two contracts.' },
      { who: 'Olena', text: 'So: family, confirmed on land, which makes it legal. The jar expects a letter. Write big.' },
    ],
  },
  'c4.olena.a.wet': {
    lines: [
      { who: 'Olena', text: 'The sea is a big wet month. No stars, no certificate, no poetry. Finally, an honest sailor.' },
      { who: 'Olena', text: 'Go, enjoy your land. It holds still, mostly. That never stops being funny.' },
    ],
  },
  'c4.olena.idle': {
    lines: [
      { who: 'Olena', text: 'We sail before your festival ends, so this is the goodbye watch. I am spending it teaching a jar what a mountain is.' },
    ],
  },

  // ---------------- the wish, written ----------------
  'c4.wish.write': {
    lines: [
      { text: 'The bamboo leans over you, heavy with the town’s hopes: safe boats, a baby due in autumn, one that just says RAMEN.' },
      { text: 'One wish, then. The pen hovers.' },
    ],
    choices: [
      { text: 'For the road: may it keep opening', goto: 'c4.wish.road' },
      { text: 'For the people met along it, every port of them', goto: 'c4.wish.people' },
      { text: 'For Nani: to finish what she started', goto: 'c4.wish.nani' },
    ],
  },
  'c4.wish.road': {
    lines: [
      { text: 'May the road keep opening. Greedy in the best direction. You tie it high, where the sea wind can read it.' },
    ],
    effects: ['set:wish.road', 'set:wish.written', 'set:c4.wish.hung'],
  },
  'c4.wish.people': {
    lines: [
      { text: 'For everyone who fed me: keep well until I pass again. It barely fits. Taro would sympathize.' },
      { text: 'You tie it beside a wobbly strip that reads minna genki de.' },
    ],
    effects: ['set:wish.people', 'set:wish.written', 'set:c4.wish.hung'],
  },
  'c4.wish.nani': {
    lines: [
      { text: 'You write her name, and then: let me finish the book you started. The pen presses harder than you meant it to.' },
      { text: 'You tie it where the morning sun will find it first.' },
    ],
    effects: ['set:wish.nani', 'set:wish.written', 'set:c4.wish.hung'],
  },

  // ---------------- kingyo-sukui ----------------
  'c4.kingyo.offer': {
    lines: [
      { text: 'The stall uncle hands you a paper scoop with the gravity of a sword master. Poi, he says. One dip is honest, two is brave, three is goodbye.' },
    ],
    effects: ['set:c4.kingyo.start'],
  },
  'c4.kingyo.won': {
    lines: [
      { text: 'The uncle holds out the bag with both hands. You take it with both, and he grunts approval.' },
      { text: 'A goldfish of your own, orange as a struck match.' },
    ],
    effects: ['clear:c4.kingyo.start', 'set:c4.kingyo.done'],
  },

  // ---------------- the post ----------------
  'c4.post.pilar': {
    lines: [
      { text: 'The ferry office window doubles as the post counter, and the clerk waves an envelope addressed in very large, very certain capitals.' },
    ],
    effects: ['letter:c4.pilar'],
  },
  'c4.post.marisol': {
    lines: [
      { text: 'The clerk checks under the ledger and produces an envelope. It smells faintly, impossibly, of the morning market.' },
    ],
    effects: ['letter:c4.marisol'],
  },
  'c4.ex.postbox': {
    lines: [
      { text: 'The red pillar box. Collection at eight and two, and the box has never once been late.' },
    ],
  },

  // ---------------- ofuro ----------------
  // The order of the bath is a thing you get wrong, then right.
  'c4.ofuro.scene': {
    lines: [
      { text: 'The hinoki tub steams, hip-deep and inviting. The stool and bucket wait by the wall.' },
    ],
    choices: [
      { text: 'Climb straight into the tub', goto: 'c4.ofuro.tub' },
      { text: 'Wash at the stool first', goto: 'c4.ofuro.wash' },
    ],
  },
  'c4.ofuro.tub': {
    lines: [
      { who: 'Fumi', text: 'Wash FIRST! Stool, bucket, soap, rinse, before one toe touches my tub.' },
    ],
    next: 'c4.ofuro.wash',
  },
  'c4.ofuro.wash': {
    lines: [
      { text: 'You wash at the stool until you squeak, then fold into water hot enough to reorganize your opinions.' },
      { who: 'Fumi', text: 'Better, ne? The water stays clean for the next person.' },
    ],
    effects: ['set:c4.ofuro', 'journal:customs.ofuro'],
  },
  'c4.ex.ofuro': {
    lines: [
      { text: 'The wooden tub, faithfully hot. The washing happens at the stool; the tub is only for arriving.' },
    ],
  },

  // ---------------- examines: new kinds ----------------
  'c4.ex.machiya': {
    lines: [
      { text: 'Dark cedar and white plaster, silver where the salt wind works and black where the eaves defend it.' },
    ],
  },
  'c4.ex.ferryoffice': {
    lines: [
      { text: 'The ferry office. In the post window the clerk looks up over his glasses, sees you are not the ferry, and goes back to the ledger.' },
    ],
  },
  'c4.ex.noren': {
    lines: [
      { text: 'Noren hung out means open, taken in means closed: a shop that tells the truth with cloth.' },
    ],
  },
  'c4.ex.torii': {
    lines: [
      { text: 'This side ordinary, that side sacred, one stride between. You duck slightly, though there is no need.' },
    ],
  },
  'c4.ex.ishidoro': {
    lines: [
      { text: 'A stone lantern, mossy at the knees. Boats coming home late steer small by its glow.' },
    ],
  },
  'c4.ex.bamboo': {
    lines: [
      { text: 'Bamboo cut fresh for the festival. It grows straight at heaven, which is the point of hanging hopes on it.' },
    ],
  },
  'c4.ex.bambooWish': {
    lines: [
      { text: 'Tanzaku flutter in five colors: exam luck, safe boats, RAMEN. The town’s hopes, sorted by wind.' },
    ],
  },
  'c4.ex.tairyobata': {
    lines: [
      { text: 'Tairyō-bata, big-catch flags: sunrise, waves, one emphatic fish. Boats flew them coming home full.' },
    ],
    effects: ['journal:customs.tairyobata'],
  },
  'c4.ex.chochin': {
    lines: [
      { text: 'A paper lantern, ribs showing like a fish held to the light. At dusk the whole quay turns this orange.' },
    ],
  },
  'c4.ex.keitruck': {
    lines: [
      { text: 'The kei truck, small as a shoe and mighty as a mule. It knows every lane in town by heart.' },
    ],
  },
  'c4.ex.ebisudo': {
    lines: [
      { text: 'Ebisu smiles inside the little hall, a tai under his arm: the one god you tip in fish.' },
    ],
  },
  'c4.ex.yatai': {
    lines: [
      { text: 'A red and white stall, one tub of goldfish rehearsing. The uncle lays out paper scoops like surgical instruments.' },
    ],
  },
  'c4.ex.yatai.after': {
    lines: [
      { text: 'The uncle taps a fresh poi twice on the rim and leaves it there, which is how a stall asks a question.' },
    ],
    choices: [
      { text: 'Take the fresh poi', when: { has: ['c4.kingyo.done'] }, goto: 'c4.kingyo.replay' },
      { text: 'Give the goldfish the evening off', goto: 'c4.ex.yatai.watch' },
    ],
  },
  'c4.kingyo.replay': {
    lines: [
      { text: 'No lecture this time. Just paper, water, and the small orange chance of a fish.' },
    ],
    effects: ['set:replay.mode', 'set:c4.kingyo.start'],
  },
  'c4.ex.yatai.watch': {
    lines: [
      { text: 'A boy in a yukata tears through three poi in a row and is radiantly happy about it.' },
    ],
  },
  'c4.ex.tatami': {
    lines: [
      { text: 'Tatami, green-gold and springy, smelling faintly of dry grass. Slippers stop at its border.' },
    ],
  },
  'c4.ex.floorWood': {
    lines: [
      { text: 'Dark boards polished by sixty years of socks. The house creaks, announcing everyone to everyone.' },
    ],
  },
  'c4.ex.tataki': {
    lines: [
      { text: 'The genkan: cool stone a step below the house. Shoes stop here, and with them the road.' },
    ],
  },
  'c4.ex.wallShoji': {
    lines: [
      { text: 'Wood and paper walls that trade in light and rumor. A shoji does not block sound; it asks everyone to pretend.' },
    ],
  },
  'c4.ex.irori': {
    lines: [
      { text: 'The sunken hearth, embers banked under ash, the kettle hook hanging over it like a question.' },
    ],
  },

  // ---------------- examines: shared kinds, this coast's words ----------------
  // Where Genji pointed. The Tanabata myth, told by the sky it happened in;
  // this is also the local locksmith for the star-river knowledge.
  'c4.ex.amanogawa': {
    lines: [
      { text: 'Past the last lantern the star river shows itself: the Amanogawa.' },
      { text: 'Orihime wove, Hikoboshi herded, and love stopped the work. The Sky King parted them with this river; magpies bridge it one night a year.' },
      { text: 'Rain on the seventh night means no bridge, so the town watches the sky like fishermen.' },
    ],
    effects: ['set:c4.seen.amanogawa', 'journal:customs.tanabata'],
  },
  'c4.ex.sea': {
    lines: [
      { text: 'The Inland Sea, flat as poured metal, islands stacked blue on blue: the manners of a lake and the memory of an ocean.' },
    ],
  },
  'c4.ex.sand': {
    lines: [
      { text: 'Coarse pale sand printed with gull cuneiform and one determined bicycle track.' },
    ],
  },
  'c4.ex.wet': {
    lines: [
      { text: 'The tide’s wet hem. Tiny crabs vanish ahead of your shadow with bureaucratic efficiency.' },
    ],
  },
  'c4.ex.pier': {
    lines: [
      { text: 'Concrete ringed with truck tires. The ferry kisses here three times a day, exactly on time.' },
    ],
  },
  // The first stand on the quay carries what the gangway used to narrate:
  // the heat and the cicadas, met at your own pace instead of in a corridor.
  'c4.ex.quay.heat': {
    lines: [
      { text: 'The heat is a wet towel. From the hill, a wall of sound sizzling like oil: cicadas, thousands, all of them certain.' },
    ],
    effects: ['set:c4.quay.heat'],
  },
  'c4.ex.quay': {
    lines: [
      { text: 'Fitted stone, sun-warm. By day the market, by dusk the promenade, by festival the town’s living room.' },
    ],
  },
  'c4.ex.path': {
    lines: [
      { text: 'Stone worn smooth in the middle, mossy at the edges. Feet have agreed on this line for a few hundred years.' },
    ],
  },
  'c4.ex.yard': {
    lines: [
      { text: 'Raked earth in faint tidy arcs: Genji’s broom signature, renewed daily.' },
    ],
  },
  'c4.ex.hisashi': {
    lines: [
      { text: 'A shop awning bleached on the seaward half only. No two on this street hang at the same height.' },
    ],
  },
  'c4.ex.stall': {
    lines: [
      { text: 'Scales, ice, yesterday’s prices chalked over twice. By eight it has already had its whole day.' },
    ],
  },
  'c4.ex.bench': {
    lines: [
      { text: 'A bench in the arcade’s shade. The morning shift is three grandmothers; the afternoon shift is the cat.' },
    ],
  },
  'c4.ex.boat': {
    lines: [
      { text: 'A high-prowed fishing boat, name painted twice, once faded and once fresh. Same name both times.' },
    ],
  },
  'c4.ex.crate': {
    lines: [
      { text: 'Fish crates, silver at the seams. The stack is a public calendar: tall means the sea was generous.' },
    ],
  },
  'c4.ex.net': {
    lines: [
      { text: 'Nets drying in green folds, smelling of iodine and patience.' },
    ],
  },
  'c4.ex.rock': {
    lines: [
      { text: 'A stone the sea rounded long ago, warm on top. Nearer the water its cousins still wear barnacles.' },
    ],
  },
  'c4.ex.tree': {
    lines: [
      { text: 'The tree is shouting. Cicadas, dozens deep: jiri jiri jiri. Seven years underground for one loud summer.' },
    ],
  },
  'c4.ex.tuft': {
    lines: [
      { text: 'Summer grass. Somewhere in it a cicada winds up like a starter motor.' },
    ],
  },
  'c4.ex.doorshut': {
    lines: [
      { text: 'A latched shopfront, noren taken in. Behind it, a radio and the smell of tofu.' },
    ],
  },
  'c4.ex.sign': {
    lines: [
      { text: 'SHIONOURA, over a painted tai. Below the timetable, smaller: THE TIMETABLE IS THE TOWN. Somebody underlined it.' },
    ],
  },
  'c4.pier.notyet': {
    lines: [
      { text: 'Chalked under the ferry board, in Captain Isao’s naval hand: NO SAILINGS BEFORE THE SEVENTH NIGHT.' },
    ],
  },
  'c4.pier.next': {
    lines: [
      { text: 'THE MORNING BOAT: Shimonoseki, then Busan. Captain Isao has chalked your name on the manifest, spelled almost correctly.' },
    ],
  },
  // ---------------- examines: the love pass ----------------
  'c4.ex.jizo': {
    lines: [
      { text: 'A small stone Jizo in a knitted red bib. At his feet, a mikan jelly cup and a chipped teacup.' },
    ],
    effects: ['set:c4.seen.jizo'],
  },
  'c4.ex.jizo2': {
    lines: [
      { text: 'The bib’s wool is new. Somebody reknits it every winter, and has for longer than anyone says.' },
    ],
  },
  'c4.ex.ema': {
    lines: [
      { text: 'Wooden ema two rows deep: safe boats, a fat catch. One says COME BACK SOON, pressed hard enough to dent the plaque.' },
    ],
  },
  'c4.ex.koke': {
    lines: [
      { text: 'Moss on the edges of the step, older than anyone who climbs it. The middle stays bare.' },
    ],
  },
  'c4.ex.jihanki': {
    lines: [
      { text: 'A vending machine hums alone on the corner, lit like a small shrine. Corn soup, all hours.' },
    ],
    effects: ['set:c4.seen.jihanki'],
  },
  'c4.ex.jihanki2': {
    lines: [
      { text: 'Blue for TSUMETAI, red for ATSUI. At dusk the corner quietly counts on its light.' },
    ],
  },
  'c4.ex.ukidama': {
    lines: [
      { text: 'Glass floats in a net bag, green as bottled sea. Plastic took their job; nobody here would let the old crew go.' },
    ],
  },
  // The crates Sachiko nodded at, carrying Lemon Valley in stencil form.
  'c4.ex.setoda': {
    lines: [
      { text: 'SETODA, say the stencils: Lemon Valley, terraced hillsides above the water. Most of Japan’s lemons grow on those slopes.' },
    ],
    effects: ['set:c4.seen.setoda', 'journal:dishes.lemon'],
  },
  'c4.ex.mikanbako': {
    lines: [
      { text: 'Mikan crates on summer duty with juice and jelly. The fruit itself is asleep on the terraces until autumn.' },
    ],
  },
  'c4.ex.jitensha': {
    lines: [
      { text: 'A granny bike with a basket, a bell, and no lock. The clack of its kickstand is an official town sound.' },
    ],
  },
  'c4.ex.ittokan': {
    lines: [
      { text: 'A kerosene can, retired into a planter of hydrangeas. Nothing here is thrown away; it is reassigned.' },
    ],
  },
  'c4.ex.ajisai': {
    lines: [
      { text: 'Hydrangeas the exact blue of seven in the evening. Tsuyu is a tiresome guest, but it pays its rent in flowers.' },
    ],
  },
  'c4.ex.himono': {
    lines: [
      { text: 'Small fish drying butterflied on the rack, exactly one cat’s jump too high.' },
    ],
  },
  'c4.ex.monohoshi': {
    lines: [
      { text: 'Towels pinned hard against the sea wind. Fumi consults the sky like a tide table before trusting it with a sock.' },
    ],
  },
  'c4.ex.gyokyo': {
    lines: [
      { text: 'The co-op board: quota notices, a typhoon drill, a crayon poster for the goldfish stall.' },
    ],
  },
  'c4.gyokyo.after': {
    lines: [
      { text: 'A new notice, brushed by hand: THE SEVENTH NIGHT WENT WELL. OTSUKARESAMA, MINNA.' },
    ],
  },
  'c4.ex.furin': {
    lines: [
      { text: 'A glass furin translating sea wind into small bright syllables.' },
    ],
  },
  'c4.ex.neko1': {
    lines: [
      { text: 'A calico in full loaf on the warm quay stone. You have been seen, filed, and dismissed.' },
    ],
    effects: ['set:c4.seen.neko1'],
  },
  'c4.ex.neko1b': {
    lines: [
      { text: 'The loaf has not moved, but the eyes track you with the calm of middle management.' },
    ],
  },
  'c4.neko2.tai': {
    lines: [
      { text: 'The stall cat has noticed Fumi’s tai, and falls in beside you like an old friend you have never met.' },
    ],
  },
  'c4.ex.neko2': {
    lines: [
      { text: 'A scarred tom by the fish stall, like he holds shares in it. Daisuke calls him Kacho, the section chief.' },
    ],
    effects: ['set:c4.seen.neko2'],
  },
  'c4.ex.neko2b': {
    lines: [
      { text: 'Kacho inspects the crates, the nets, and you, in that order of importance.' },
    ],
  },
  'c4.ex.neko3': {
    lines: [
      { text: 'Under the bench, a small black cat sleeps in the shade the grandmothers keep warm for it.' },
    ],
    effects: ['set:c4.seen.neko3'],
  },
  'c4.ex.neko3b': {
    lines: [
      { text: 'One ear swivels toward you and stands down. Classified: harmless, carries no snacks.' },
    ],
  },
  'c4.ex.bathstool': {
    lines: [
      { text: 'The bath stool, scrubbed pale, the pail upended on it. You wash first; the tub is for after.' },
    ],
  },
  'c4.ex.chochin.in': {
    lines: [
      { text: 'A lantern brought in off the quay, standing where the hall runs too long for one window.' },
    ],
  },
  'c4.ex.monohoshi.in': {
    lines: [
      { text: 'The drying rack, moved indoors when the sky looks like this.' },
    ],
  },
  'c4.ex.kaigara': {
    lines: [
      { text: 'Shells and sea glass. By Taro’s exchange rate, white is common, pink is money, blue glass is beyond price.' },
    ],
  },
  'c4.egg.shell': {
    lines: [
      { text: 'One pink shell finds its way into your pocket. Two streets later it is at Jizo’s feet, beside the jelly cup. Some coins only spend one way.' },
    ],
    effects: ['set:egg.c4.shell'],
  },
  'c4.egg.jizo': {
    lines: [
      { text: 'Your pink shell has been moved front and center. Whoever tends Jizo has accepted the deposit.' },
    ],
    effects: ['set:egg.c4.shell.seen'],
  },
  'c4.ex.senpuki': {
    lines: [
      { text: 'An elderly fan sweeps the room in slow no’s, disagreeing with summer on principle.' },
    ],
  },
  'c4.ex.mugicha': {
    lines: [
      { text: 'Cold mugicha sweating on its tray, one glass poured for whoever passes. Refusing it is possible in theory only.' },
    ],
  },
  'c4.ex.getarow': {
    lines: [
      { text: 'Geta at the genkan edge, toes pointed out the door, ready whichever way your feet decide.' },
    ],
  },

  'c4.ex.tablelow': {
    lines: [
      { text: 'The low table, legs folded under it like a resting animal. The whole house happens at knee height.' },
    ],
  },
  'c4.ex.zabuton': {
    lines: [
      { text: 'A flat cushion, dented by decades of correct sitting. Your knees file a complaint and are overruled.' },
    ],
  },
  'c4.ex.kettle': {
    lines: [
      { text: 'An iron kettle, black and patient. It intends to outlive the electric one on the counter.' },
    ],
  },
  'c4.ex.shelf2': {
    lines: [
      { text: 'Iriko, kombu, pickled plums, and guest cups that are never the everyday cups. Guests can tell. That is the point.' },
    ],
  },
  // Skinned to `goza` on this map in `art/sets/shionoura.ts`: the one room in
  // the game that knows what rush is should not be furnished with the shared
  // Andean weave.
  'c4.ex.mat2': {
    lines: [
      { text: 'A goza at the genkan’s edge, shoes lined up on it, toes to the door: Fumi’s doing.' },
    ],
  },
};

/** Examine arms; shared kinds are map-tagged so this coast keeps its own words. */
export const SHIONOURA_EXAMINES: Record<string, ExamineArm[]> = {
  blocked: [{ map: 'shionoura', node: 'c4.ex.wall' }, { map: 'minshuku', node: 'c4.ex.wall' }],
  machiya: [{ node: 'c4.ex.machiya' }],
  ferryoffice: [{ node: 'c4.ex.ferryoffice' }],
  noren: [{ node: 'c4.ex.noren' }],
  hisashi: [{ node: 'c4.ex.hisashi' }],
  torii: [{ node: 'c4.ex.torii' }],
  ishidoro: [{ node: 'c4.ex.ishidoro' }],
  bamboo: [{ node: 'c4.ex.bamboo' }],
  bambooWish: [
    { when: { has: ['c4.tanzaku'], not: ['c4.wish.hung'] }, node: 'c4.wish.write' },
    { node: 'c4.ex.bambooWish' },
  ],
  tairyobata: [{ node: 'c4.ex.tairyobata' }],
  chochin: [
    { map: 'minshuku', node: 'c4.ex.chochin.in' },
    { node: 'c4.ex.chochin' },
  ],
  keitruck: [{ node: 'c4.ex.keitruck' }],
  ebisudo: [{ node: 'c4.ex.ebisudo' }],
  postbox: [
    // Pilar writes only to someone who has met her at the bridge.
    { when: { has: ['met.pilar'], not: ['letter.read.c4.pilar'] }, node: 'c4.post.pilar' },
    { when: { not: ['letter.read.c4.marisol'] }, node: 'c4.post.marisol' },
    { node: 'c4.ex.postbox' },
  ],
  yatai: [
    { when: { has: ['c4.kingyo.done'] }, node: 'c4.ex.yatai.after' },
    { when: { has: ['met.hana'], not: ['c4.kingyo.start', 'c4.kingyo.done'] }, node: 'c4.kingyo.offer' },
    { node: 'c4.ex.yatai' },
  ],
  jizo: [
    { when: { not: ['c4.seen.jizo'] }, node: 'c4.ex.jizo' },
    // If a pink shell left the beach in your pocket, it surfaces here; the
    // town's unseen caretaker accepts the deposit by the next visit.
    { when: { has: ['egg.c4.shell'], not: ['egg.c4.shell.seen'] }, node: 'c4.egg.jizo' },
    { node: 'c4.ex.jizo2' },
  ],
  ema: [{ node: 'c4.ex.ema' }],
  koke: [{ node: 'c4.ex.koke' }],
  jihanki: [
    { when: { not: ['c4.seen.jihanki'] }, node: 'c4.ex.jihanki' },
    { node: 'c4.ex.jihanki2' },
  ],
  ukidama: [{ node: 'c4.ex.ukidama' }],
  mikanbako: [
    { map: 'shionoura', when: { has: ['c4.sachiko2'], not: ['c4.seen.setoda'] }, node: 'c4.ex.setoda' },
    { node: 'c4.ex.mikanbako' },
  ],
  jitensha: [{ node: 'c4.ex.jitensha' }],
  ittokan: [{ node: 'c4.ex.ittokan' }],
  ajisai: [{ node: 'c4.ex.ajisai' }],
  himono: [{ node: 'c4.ex.himono' }],
  monohoshi: [
    { map: 'minshuku', node: 'c4.ex.monohoshi.in' },
    { node: 'c4.ex.monohoshi' },
  ],
  gyokyo: [
    { when: { has: ['c4.complete'] }, node: 'c4.gyokyo.after' },
    { node: 'c4.ex.gyokyo' },
  ],
  furin: [{ node: 'c4.ex.furin' }],
  nekoloaf: [
    { when: { not: ['c4.seen.neko1'] }, node: 'c4.ex.neko1' },
    { node: 'c4.ex.neko1b' },
  ],
  nekoboss: [
    { when: { has: ['c4.tai.got'], not: ['c4.taisomen'] }, node: 'c4.neko2.tai' },
    { when: { not: ['c4.seen.neko2'] }, node: 'c4.ex.neko2' },
    { node: 'c4.ex.neko2b' },
  ],
  nekonap: [
    { when: { not: ['c4.seen.neko3'] }, node: 'c4.ex.neko3' },
    { node: 'c4.ex.neko3b' },
  ],
  kaigara: [
    { when: { has: ['c4.seen.jizo'], not: ['egg.c4.shell'] }, node: 'c4.egg.shell' },
    { node: 'c4.ex.kaigara' },
  ],
  zabuton: [{ node: 'c4.ex.zabuton' }],
  senpuki: [{ node: 'c4.ex.senpuki' }],
  mugicha: [{ node: 'c4.ex.mugicha' }],
  getarow: [{ node: 'c4.ex.getarow' }],
  tatami: [{ node: 'c4.ex.tatami' }],
  floorWood: [{ node: 'c4.ex.floorWood' }],
  tataki: [{ node: 'c4.ex.tataki' }],
  wallShoji: [{ node: 'c4.ex.wallShoji' }],
  irori: [{ node: 'c4.ex.irori' }],
  ofuro: [
    { when: { has: ['c4.meal'], not: ['c4.ofuro'] }, node: 'c4.ofuro.scene' },
    { node: 'c4.ex.ofuro' },
  ],
  sea: [
    { map: 'shionoura', when: { has: ['c4.tanzaku'], not: ['c4.seen.amanogawa'] }, node: 'c4.ex.amanogawa' },
    { map: 'shionoura', node: 'c4.ex.sea' },
  ],
  sand: [{ map: 'shionoura', node: 'c4.ex.sand' }],
  sandWet: [{ map: 'shionoura', node: 'c4.ex.wet' }],
  pierdeck: [{ map: 'shionoura', node: 'c4.ex.pier' }],
  plaza: [
    { map: 'shionoura', when: { not: ['c4.quay.heat'] }, node: 'c4.ex.quay.heat' },
    { map: 'shionoura', node: 'c4.ex.quay' },
  ],
  path: [{ map: 'shionoura', node: 'c4.ex.path' }],
  dirt: [{ map: 'shionoura', node: 'c4.ex.yard' }],
  stall: [{ map: 'shionoura', node: 'c4.ex.stall' }],
  bench: [{ map: 'shionoura', node: 'c4.ex.bench' }],
  boat: [{ map: 'shionoura', node: 'c4.ex.boat' }],
  crate: [{ map: 'shionoura', node: 'c4.ex.crate' }],
  net: [{ map: 'shionoura', node: 'c4.ex.net' }],
  rock: [{ map: 'shionoura', node: 'c4.ex.rock' }],
  tree: [{ map: 'shionoura', node: 'c4.ex.tree' }],
  tuft: [{ map: 'shionoura', node: 'c4.ex.tuft' }],
  doorShut: [{ map: 'shionoura', node: 'c4.ex.doorshut' }],
  signpost: [{ map: 'shionoura', node: 'c4.ex.sign' }],
  piersign: [
    { map: 'shionoura', when: { has: ['c4.complete'] }, node: 'c4.pier.next' },
    { map: 'shionoura', node: 'c4.pier.notyet' },
  ],
  table: [{ map: 'minshuku', node: 'c4.ex.tablelow' }],
  stool: [{ map: 'minshuku', node: 'c4.ex.bathstool' }],
  pot: [{ map: 'minshuku', node: 'c4.ex.kettle' }],
  shelf: [{ map: 'minshuku', node: 'c4.ex.shelf2' }],
  mat: [{ map: 'minshuku', node: 'c4.ex.mat2' }],
};

/** Event-triggered nodes, listed with their gating so tests can walk them. */
export const SHIONOURA_EVENTS = [
  { node: 'c4.arrive' },
  { when: { has: ['c4.kingyo.start'] }, node: 'c4.kingyo.won' },
  { when: { has: ['c4.cook.start'] }, node: 'c4.cook.finish' },
];
