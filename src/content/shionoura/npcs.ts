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
      { when: { has: ['page.dishes.dashi'], not: ['c4.cook.done'] }, node: 'c4.fumi.cookinvite' },
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
      { when: { has: ['c4.sachiko2'], not: ['c4.sachi.done'] }, node: 'c4.sachi.shop' },
      { node: 'c4.sachi.idle' },
    ],
  },
  {
    id: 'genji',
    name: 'Genji',
    map: 'shionoura',
    pos: [37, 3],
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
    // Ashore against the ferry office wall while the ship works, out of the
    // way of the quay's two lanes.
    pos: [35, 22],
    range: 0,
    look: {
      skin: '#dfb08a',
      hair: '#c98a3f',
      cloth: '#5c6e77',
      stripe: '#c9a35f',
      hat: '#e8dcc4',
      hatStyle: 'none',
    },
    entry: [
      { when: { not: ['c4.met.olena'] }, node: 'c4.olena.shore' },
      { when: { has: ['c4.met.olena'], not: ['c4.olena.quizzed'] }, node: 'c4.olena.quiz' },
      { node: 'c4.olena.idle' },
    ],
  },
];

export const SHIONOURA_NODES: NodeMap = {
  // ---------------- arrival ----------------
  'c4.arrive': {
    lines: [
      { text: 'The launch noses in past a stone lantern and the Inland Sea goes glass-flat behind you. Land, after thirty-one days of deck.' },
      { text: 'The heat is a wet towel. From the dark of the hill comes a wall of sound, sizzling like oil: cicadas, thousands, all of them certain.' },
      { text: 'Up the pier, boats fly bright banners for a festival that has not happened yet. Hana is already ashore, standing very still, looking at her town.' },
    ],
    effects: ['set:c4.arrived'],
  },

  // ---------------- Hana, home ----------------
  'c4.hana.first': {
    lines: [
      { who: 'Hana', text: 'Tadaima. That is what you say when you come home. I have been saying it under my breath since we passed the lighthouse.' },
      { who: 'Hana', text: 'And the town answers okaeri. Welcome back. You can be gone four years and the word waits for you. It waited for me.' },
      { who: 'Hana', text: 'Come. My grandmother keeps the minshuku past the shotengai, the one with the noren. She already made up your room, so arguing is useless.' },
    ],
    effects: ['set:met.hana', 'journal:people.hana', 'journal:words.tadaima'],
  },
  'c4.hana.onigiri': {
    lines: [
      { text: 'Hana presses a cloth bundle into your hands: two rice balls, still warm, wrapped like something precious. She uses both hands to give it.' },
      { who: 'Hana', text: 'Onigiri. Ferry food, boat food, everything food. My grandmother makes the umeboshi kind that fights back a little.' },
      { who: 'Hana', text: 'And learn sumimasen. It means excuse me, and thank you, and sorry, and hello-please-forgive-the-bother. One word, does the work of ten.' },
    ],
    effects: ['set:c4.hana2', 'journal:dishes.onigiri', 'journal:words.sumimasen'],
  },
  'c4.hana.gran': {
    lines: [
      { who: 'Hana', text: 'So you met Obaachan. Did she scold your shoes? She scolded mine, and I grew up in that genkan.' },
      { who: 'Hana', text: 'My grandfather fished tai from this water his whole life. His flags are the ones on the pier. She flies them for Tanabata now.' },
      { who: 'Hana', text: 'The seventh night is almost here. Bamboo is up, wishes are hanging, and the stalls are creeping onto the quay one by one. Watch the town get younger.' },
    ],
    effects: ['set:c4.hana3'],
  },
  'c4.matsuri': {
    lines: [
      { text: 'Dusk. Somebody switches on the chochin and the quay turns paper-orange. Geta clack on stone, a sound saved up all year for this.' },
      { text: 'Fumi in indigo, Daisuke bellowing prices for things he is giving away, Taro running the pier like it is new. Genji watches the sky.' },
      { text: 'The bamboo is heavy with wishes. Yours hangs among them, one strip of color in a town of them. The flags crack softly overhead.' },
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
      { who: 'Hana', text: 'From the deck, middle of the Pacific. I remember. No lights for a thousand miles and the river ran right over us.' },
      { who: 'Hana', text: 'Same river, this one. Tonight my whole town hangs its hopes on it, on paper. I think the ocean version and this version are both true.' },
    ],
    next: 'c4.matsuri.end',
  },
  'c4.matsuri.otsu': {
    lines: [
      { text: 'Otsukaresama, you say, to the quay, the flags, the whole tired shining town. A few heads turn.' },
      { who: 'Hana', text: 'Otsukaresama! comes back from three directions at once. You said it right. You said it like you meant the year, not the day.' },
    ],
    next: 'c4.matsuri.end',
  },
  'c4.matsuri.end': {
    lines: [
      { text: 'A drum starts somewhere, unhurried. The goldfish in its bag catches lantern light and becomes, briefly, the brightest thing in town.' },
      { who: 'Hana', text: 'Thank you for walking my home with me. When you sail, take some of tonight along. That is allowed. That is the whole point of omiyage.' },
    ],
  },
  'c4.hana.after': {
    lines: [
      { who: 'Hana', text: 'Captain Isao will take you across when you are ready. Busan first, he says, as if the sea were a bus route. For him it is.' },
      { who: 'Hana', text: 'I stay this time. Somebody has to teach the kids what a cadet does. Write to me from wherever the journal takes you.' },
    ],
  },
  'c4.hana.okaeri': {
    lines: [
      { text: 'Evening. You come up the lane as Hana holds the minshuku noren aside, and the word you have been carrying tries itself out: tadaima.' },
      { who: 'Hana', text: 'Okaeri.' },
      { who: 'Hana', text: 'No, do not apologize! You said it right, so the door answered. That is the whole machine. Welcome back, to a house not yours. Yet.' },
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
      { text: 'You step up into the cool wooden dark, two steps in before you notice the floor change under your feet. Sand grits on the boards behind you.' },
      { who: 'Fumi', text: 'Ah, ah, ah! Shoes! The genkan is the low floor, the shoes live there, the house starts where the wood does. Off, off.' },
      { text: 'She is laughing before you finish apologizing. Slippers appear from nowhere, pointed the right way, as if the house expected you.' },
      { who: 'Fumi', text: 'Hana radioed about you from the ship. So the room is aired and you are staying. In this house, the argument is the shorter path to yes.' },
    ],
    effects: ['set:met.fumi', 'journal:people.fumi', 'journal:customs.genkan'],
  },
  'c4.fumi.meal': {
    lines: [
      { text: 'A low table, a fish grilled whole, rice, miso soup, pickles the color of stained glass. She sits, waits, and puts her palms together.' },
      { who: 'Fumi', text: 'Itadakimasu. I humbly receive. You say it to the fish, the farmer, the sea, the cook. Mostly the cook, in this house.' },
      { text: 'The fish tastes like the morning it was caught. When the bowls are empty she bows a centimeter, and you copy her: gochisosama.' },
      { who: 'Fumi', text: 'Gochisosama deshita, yes. It was a feast, you say, even for barley tea and a rice ball. Especially then.' },
    ],
    effects: ['set:c4.meal', 'journal:words.itadakimasu', 'journal:words.gochisosama'],
  },
  'c4.fumi.dashi': {
    lines: [
      { who: 'Fumi', text: 'Come, the pot. Everyone thinks Japan is kombu and katsuobushi. Here we are iriko people: little dried anchovies, heads pinched off.' },
      { text: 'She drops a handful into cold water like she is counting coins. The kitchen slowly fills with the smell of the entire sea, concentrated.' },
      { who: 'Fumi', text: 'Iriko dashi. The Inland Sea in a saucepan. Udon, miso, everything stands on it. Rich people buy bonito; we caught our broth ourselves.' },
      { who: 'Fumi', text: 'Now, a favor with flavor in it. Daisuke on the quay holds a tai for me when the catch is good. My knees and that hill disagree. Fetch it?' },
    ],
    effects: ['set:c4.dashi', 'journal:dishes.dashi', 'errand:fumi-tai', 'set:errand.fumi-tai'],
  },
  'c4.fumi.taisomen': {
    lines: [
      { text: 'The tai goes into the pan whole, then over a nest of somen noodles fine as thread. She works without hurry and without one wasted motion.' },
      { who: 'Fumi', text: 'Tai-somen. Celebration food. A whole sea bream means a wedding, a homecoming, a festival. This week we have two of those, so.' },
      { text: 'Hana appears at the smell, exactly like a cat. The three of you eat at the low table while the cicadas saw the evening into lengths.' },
      { who: 'Fumi', text: 'Tai is the king here, the lucky fish. Ebisu-sama holds one under his arm. Eat the cheek, guest gets the cheek. House rule.' },
    ],
    effects: ['set:c4.taisomen', 'journal:dishes.tai', 'errand.done', 'clear:errand.fumi-tai'],
  },
  'c4.fumi.memory': {
    lines: [
      { who: 'Fumi', text: 'You eat like someone I heard about. My mother-in-law kept this house before me, and she told a story her whole life.' },
      { who: 'Fumi', text: 'A laughing foreigner, a girl who bowed too deep to everyone, even the postman. Stayed some nights in the year of the big Tanabata rain. 1974, I think.' },
      { who: 'Fumi', text: 'She wrote in a little book at this very table, and she thanked corrections. Twice, always twice. Why are you looking at me like that?' },
      { text: 'The journal sits in your pack, suddenly weighing more than everything else in it.' },
    ],
    effects: ['set:c4.fumi.nani'],
  },
  'c4.fumi.okaeri': {
    lines: [
      { who: 'Fumi', text: 'Okaeri. See, you came in from the bath and I said it without thinking. The house has decided you count as coming home.' },
      { who: 'Fumi', text: 'That is all okaeri is. A door that answers you. Take the word along; it works in every language, said or unsaid.' },
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
      { who: 'Fumi', text: 'You keep watching my hands at the pot. Watching is a fine start and a poor finish. So: tomorrow, dawn, before the guests wake.' },
      { who: 'Fumi', text: 'We make the morning dashi and the breakfast, you and me, while the house still whispers. Guests watch. Hands that help are something else.' },
    ],
    choices: [
      { text: 'Be in the kitchen at dawn', goto: 'c4.fumi.cookstart' },
      { text: 'Sleep first. Dawn comes early here.', goto: 'c4.fumi.cooklater' },
    ],
  },
  'c4.fumi.cookstart': {
    lines: [
      { text: 'Dawn arrives grey-pink through the shoji. The house is all small sounds: water, a knife somewhere, the first ferry clearing its throat.' },
      { who: 'Fumi', text: 'Quiet hands, quiet pot. I call the steps, you make them. The sea did most of the work already; we only have to ask it politely.' },
    ],
    effects: ['set:c4.cook.start'],
  },
  'c4.fumi.cooklater': {
    lines: [
      { who: 'Fumi', text: 'Mm. Dawn does not wait, but it does repeat. The pot and I will be there whichever morning your feet find first.' },
    ],
  },
  'c4.cook.finish': {
    lines: [
      { text: 'Two trays reach the low table: rice, miso blooming in the iriko dashi, pickles, the onigiri packed firm. The guests wake to a ready house.' },
      { who: 'Fumi', text: 'They will say itadakimasu to this and never know your hands are in it. Good. That is how a kitchen keeps its secrets.' },
      { who: 'Fumi', text: 'And you should know: a guest who makes breakfast has stopped being a guest. There is no ceremony for it. Only more work tomorrow.' },
    ],
    effects: ['clear:c4.cook.start', 'set:c4.cook.done'],
  },
  'c4.fumi.cookagain': {
    lines: [
      { who: 'Fumi', text: 'Dawn happens again tomorrow. It is very reliable that way. The pot does not count how many times you have made it, and neither do I.' },
    ],
    choices: [
      { text: 'Be in the kitchen at dawn again', when: { has: ['c4.cook.done'] }, goto: 'c4.fumi.cookreplay' },
      { text: 'Let the house sleep in', goto: 'c4.fumi.idle' },
    ],
  },
  'c4.fumi.cookreplay': {
    lines: [
      { who: 'Fumi', text: 'Mm. No calling the steps this morning. Your hands know where the kombu goes, and the kombu knows your hands.' },
    ],
    effects: ['set:replay.mode', 'set:c4.cook.start'],
  },

  // ---------------- Daisuke, tai pride ----------------
  'c4.dai.first': {
    lines: [
      { who: 'Daisuke', text: 'Irasshai! New face! Off the big ship, ne? Look at this. LOOK at it. Tai, red as a good sunrise, caught before you woke up.' },
      { who: 'Daisuke', text: 'Tomonoura nets tai one bay over and calls it famous. Fine. Ours swim harder currents, so the meat is sweeter. This is science.' },
    ],
    effects: ['set:met.daisuke', 'journal:people.daisuke'],
    choices: [
      { text: '"At home my fish lady made me a casero. A regular."', goto: 'c4.dai.casero', when: { has: ['c2.casero'] } },
      { text: 'Ask why tai is the king fish', goto: 'c4.dai.why' },
    ],
  },
  'c4.dai.casero': {
    lines: [
      { who: 'Daisuke', text: 'A regular! Then you know the rules already: come back, and come back again. The fish remembers faces. Well. I remember for it.' },
      { who: 'Daisuke', text: 'Your fish lady and I would argue happily for hours. Tell her the tai of Shionoura sends its respects to her lisa.' },
    ],
  },
  'c4.dai.why': {
    lines: [
      { who: 'Daisuke', text: 'Medetai! Happy, lucky, festive. Tai hides inside the word itself. A pun four hundred years old and still working, that is why.' },
      { who: 'Daisuke', text: 'Also Ebisu-sama carries one under his arm, and you do not argue with the fishing god about fish.' },
    ],
  },
  'c4.dai.tai': {
    lines: [
      { who: 'Daisuke', text: 'Fumi-san\'s tai! Held back the best one, do not tell the mayor. For her tai-somen you want it whole, eye clear, proud.' },
      { text: 'He wraps it and holds it out with both hands, like a diploma. You take it one-handed; his eyebrows climb.' },
      { who: 'Daisuke', text: 'Both hands, both hands! A gift has weight, ne. You catch the weight with two hands so the giver sees you feel it.' },
      { text: 'You take it again properly, with a small bow. He grins like the sunrise on his own flag.' },
    ],
    effects: ['set:c4.tai.got'],
  },
  'c4.dai.udon': {
    lines: [
      { text: 'Noon. Daisuke waves you onto a crate and sets down two bowls of udon, iriko broth, fat noodles. He inhales his in loud joyful yards.' },
      { text: 'You eat quietly, politely, the way you were raised. He slows. He watches. His face falls like a barometer.' },
      { who: 'Daisuke', text: 'Is it bad? It is bad. You eat like a funeral. The broth offended you, tell me straight, I can take it.' },
      { text: 'Two old men down the quay demonstrate without being asked, slurping like tide over gravel. You try it. The noodles taste warmer, somehow.' },
      { who: 'Daisuke', text: 'THERE it is! Loud means delicious, ne. Silence is for fish still in the water.' },
    ],
    effects: ['set:c4.slurp'],
  },
  'c4.dai.truck': {
    lines: [
      { text: 'The kei truck is backed to the boats, and the morning\'s crates outnumber the morning\'s hands. You join without being asked.' },
      { text: 'Ice, fish, ice, fish. The sun climbs. When the tailgate finally bangs shut, Daisuke claps your shoulder with a hand like a docking fender.' },
      { who: 'Daisuke', text: 'Otsukaresama! You must be tired, it means, but it means more: your tiredness is seen. The work happened, and you were in it.' },
      { who: 'Daisuke', text: 'We say it after hauling, after festivals, after anything shared. Now you are inside the word too, ne.' },
    ],
    effects: ['set:c4.otsukare', 'journal:words.otsukaresama'],
  },
  'c4.dai.idle': {
    lines: [
      { who: 'Daisuke', text: 'Morning market is gone by eight, ne. The whole ocean, sold before the town brushes its teeth. Come earlier tomorrow!' },
    ],
  },

  // ---------------- Sachiko, the omiyage counter ----------------
  'c4.sachi.first': {
    lines: [
      { who: 'Sachiko', text: 'Irasshai, irasshai! Come, taste first, questions after. This is the town meibutsu: lemon yokan, made with Setoda lemons since my grandmother.' },
      { text: 'A pale gold square, cool and dense, sweet and then sharply, wonderfully sour. It tastes like sunshine that studied abroad.' },
      { who: 'Sachiko', text: 'Every town in Japan has its famous thing, and travelers carry it home. Omiyage. Not a souvenir for you. A piece of here, for your people there.' },
      { text: 'Your people. Doña Petro at her pots. Pilar, Aurelio. It clicks like a latch: you have people now, in three ports behind you.' },
    ],
    effects: ['set:met.sachiko', 'journal:people.sachiko', 'journal:words.irasshai', 'journal:dishes.lemonyokan'],
  },
  'c4.sachi.lemons': {
    lines: [
      { who: 'Sachiko', text: 'The lemons ride the ferry from Setoda, one island over. Whole hillsides of them above the water: Lemon Valley since the sixties.' },
      { who: 'Sachiko', text: 'Most of Japan\'s lemons come from these islands. In July the mikan is only juice and jelly, so the lemon does the singing. Sour keeps you honest.' },
      { who: 'Sachiko', text: 'Come back when you have thought about your list. Omiyage is chosen slowly and given fast. Both halves matter.' },
    ],
    effects: ['set:c4.sachiko2', 'journal:dishes.lemon'],
  },
  'c4.sachi.shop': {
    lines: [
      { who: 'Sachiko', text: 'Ah, the traveler with three ports in her wake. I have thought about your people all morning. It is my favorite kind of puzzle.' },
      { who: 'Sachiko', text: 'A cook, a museum director, and a man with soup always on. Tell me who first, and I will wrap while you talk.' },
    ],
    choices: [
      { text: 'Lemon yokan for Doña Petro, cook to cook', goto: 'c4.omi.petro', when: { not: ['omiyage.petro'] } },
      { text: 'A tairyō-bata tenugui for Pilar\'s museum', goto: 'c4.omi.pilar', when: { not: ['omiyage.pilar'] } },
      { text: 'Shodoshima olive tea for Aurelio', goto: 'c4.omi.aurelio', when: { not: ['omiyage.aurelio'] } },
      { text: 'Still thinking. Choosing slowly, like you said.', goto: 'c4.sachi.browse' },
    ],
  },
  'c4.sachi.again': {
    lines: [{ who: 'Sachiko', text: 'There. Who else is on the list? A list of people who fed you is never short.' }],
    choices: [
      { text: 'Lemon yokan for Doña Petro, cook to cook', goto: 'c4.omi.petro', when: { not: ['omiyage.petro'] } },
      { text: 'A tairyō-bata tenugui for Pilar\'s museum', goto: 'c4.omi.pilar', when: { not: ['omiyage.pilar'] } },
      { text: 'Shodoshima olive tea for Aurelio', goto: 'c4.omi.aurelio', when: { not: ['omiyage.aurelio'] } },
      { text: 'That is all for today', goto: 'c4.sachi.browse' },
    ],
  },
  'c4.omi.petro': {
    lines: [
      { text: 'Sachiko wraps the yokan in paper the color of sea haze, folds sharp as sails, and presents it with both hands. You receive it with both.' },
      { who: 'Sachiko', text: 'For the cook who feeds strangers. Tell her the sour is Setoda lemon, and that some grandmother across the sea salutes her pots.' },
    ],
    effects: ['set:omiyage.petro', 'set:c4.omiyage', 'journal:customs.omiyage'],
    next: 'c4.sachi.again',
  },
  'c4.omi.pilar': {
    lines: [
      { text: 'A folded cotton tenugui: a big-catch flag in miniature, sunrise, waves, one emphatic tai. Museum-grade, at least for one museum you know of.' },
      { who: 'Sachiko', text: 'For the little director. Tell her boats fly these when the hold is FULL. An honest flag for an honest collection. Admission: one fact, I hear.' },
    ],
    effects: ['set:omiyage.pilar', 'set:c4.omiyage', 'journal:customs.omiyage'],
    next: 'c4.sachi.again',
  },
  'c4.omi.aurelio': {
    lines: [
      { text: 'A tin of roasted olive-leaf tea from Shodoshima, where Japan first coaxed olives to grow, back in 1908. It smells like a warm, dry hillside.' },
      { who: 'Sachiko', text: 'For the man whose soup is always on. A tea for people who understand that slow is a flavor. He will taste what I mean.' },
    ],
    effects: ['set:omiyage.aurelio', 'set:c4.omiyage', 'journal:customs.omiyage'],
    next: 'c4.sachi.again',
  },
  'c4.sachi.browse': {
    lines: [
      { who: 'Sachiko', text: 'Take your time. Omiyage waits better than fish. The wrapping paper is not going anywhere and neither am I.' },
    ],
  },
  'c4.sachi.alldone': {
    lines: [
      { who: 'Sachiko', text: 'Three parcels, three ports, all wrapped. Your pack now carries more of Shionoura than some residents do.' },
      { who: 'Sachiko', text: 'This is the real trick of travel, you know. You cannot bring your people along, so you carry the place back to them. Heavier, and worth it.' },
    ],
    effects: ['set:c4.sachi.done'],
  },
  'c4.sachi.idle': {
    lines: [
      { who: 'Sachiko', text: 'Festival week empties my shelves faster than typhoon week. Sweets and weather, the two local economies.' },
    ],
  },

  // ---------------- Genji, laconic at the shrine ----------------
  'c4.genji.first': {
    lines: [
      { text: 'A dry old man sweeps the shrine yard with the exact patience of the stones under him. He does not stop for you.' },
      { who: 'Genji', text: 'Ebisu. God of fishermen. He is smiling. I sweep.' },
      { text: 'The broom continues. It appears the introduction is complete, and, in its way, thorough.' },
    ],
    effects: ['set:met.genji', 'journal:people.genji'],
  },
  'c4.genji.amanogawa': {
    lines: [
      { who: 'Genji', text: 'You came back. Fine. Sit. Before the seventh night you should know what the fuss is.' },
      { who: 'Genji', text: 'Orihime wove, Hikoboshi herded, they fell in love and stopped working. The Sky King split them with a river of stars. The Amanogawa.' },
      { who: 'Genji', text: 'One night a year, the seventh of the seventh, magpies bridge the river and the two meet. If it rains, no bridge. So we watch the sky like fishermen.' },
      { text: 'He produces a strip of colored paper from his sleeve, as if he had always been holding it, and puts it in your hands. Both of his.' },
      { who: 'Genji', text: 'Tanzaku. Write one wish. Bamboo grows straight at heaven, so we hang wishes on it. Do not write a speech. The paper is small on purpose.' },
    ],
    effects: ['set:c4.tanzaku', 'journal:customs.tanabata'],
    choices: [
      { text: '"I saw this river from the ocean. They called it a river there too."', goto: 'c4.genji.mayu', when: { has: ['page.customs.starriver'] } },
      { text: 'Ask what happens if it rains', goto: 'c4.genji.rain' },
    ],
  },
  'c4.genji.mayu': {
    lines: [
      { who: 'Genji', text: 'Mm. Sailors, mountain people, us. Everyone looks up at the same spill of stars and thinks: water.' },
      { who: 'Genji', text: 'Nobody taught anybody. The sky just looks like a river, everywhere on earth. That is either a coincidence or the oldest agreement there is.' },
    ],
  },
  'c4.genji.rain': {
    lines: [
      { who: 'Genji', text: 'Rain, no magpies, no bridge. The lovers wait a year. Some towns cheat and hold Tanabata in August for clean skies.' },
      { who: 'Genji', text: 'We do not cheat. We hope. Hoping in tsuyu season is our local sport, and we are undefeated at losing.' },
    ],
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
      { who: 'Genji', text: 'The cicadas shout for seven years underground and one summer above. Make of that what you like. I sweep.' },
    ],
  },

  // ---------------- Taro, whose wish is too big ----------------
  'c4.taro.first': {
    lines: [
      { text: 'A kid sits at the foot of the shrine steps, surrounded by crumpled tanzaku like fallen petals. He is chewing the pencil, not writing.' },
      { who: 'Taro', text: 'The paper is TOO SMALL. My wish is that Dad\'s boat comes back full every day, and school stays open, and Gran\'s knees stop hurting, and, and.' },
      { who: 'Taro', text: 'Genji-san only gives you one strip a year. ONE. Who designed this system?' },
    ],
    effects: ['set:met.taro', 'journal:people.taro'],
  },
  'c4.taro.help': {
    lines: [
      { who: 'Taro', text: 'You write stuff in that book all the time. You are clearly a professional. How do I fit a wish this big on a paper this small?' },
    ],
    choices: [
      { text: '"Find the one wish hiding inside all of them."', goto: 'c4.taro.inside' },
      { text: '"Write the biggest one. The rest can ride on it."', goto: 'c4.taro.biggest' },
    ],
  },
  'c4.taro.inside': {
    lines: [
      { who: 'Taro', text: 'One wish inside the wishes... boat, school, knees... they are all just: everybody stays okay. THAT FITS.' },
      { text: 'He writes it in enormous wobbly characters, using the whole strip, and holds it up like a caught fish. Minna genki de. Everyone, be well.' },
      { who: 'Taro', text: 'Next year I am asking for a bicycle though. This year covers the important stuff.' },
    ],
    effects: ['set:c4.taro.wish'],
  },
  'c4.taro.biggest': {
    lines: [
      { who: 'Taro', text: 'The biggest... Dad\'s boat. Because if the boat comes back full, Gran gets medicine, and if there are fish there is a town, and a school in it.' },
      { text: 'He writes it carefully, tongue out, and nods at his own logic. One wish, towing three others like skiffs behind it.' },
      { who: 'Taro', text: 'You are good at this. Do you do weddings?' },
    ],
    effects: ['set:c4.taro.wish'],
  },
  'c4.taro.kingyo': {
    lines: [
      { who: 'Taro', text: 'Did you try the goldfish stall yet? The uncle acts tough but he has never let a kid walk away empty. Test him. For science.' },
    ],
  },
  'c4.taro.idle': {
    lines: [
      { who: 'Taro', text: 'Seventh night soon! If it rains I am personally complaining to the Sky King. Genji-san says get in line.' },
    ],
  },

  // ---------------- Captain Isao, the timetable ----------------
  'c4.isao.first': {
    lines: [
      { text: 'By the ferry office, an old captain studies the water with the expression of a man auditing an employee of fifty years.' },
      { who: 'Captain Isao', text: 'Isao. Forty-one years on this run. The ferry is the town\'s pulse: school, hospital, brides, coffins. All of it rides with me, on time.' },
      { who: 'Captain Isao', text: 'Art tourists ride too now, photographing my rust. The neighbor islands hang art in empty houses and call it a renaissance. Hmph.' },
    ],
    effects: ['set:met.captain', 'journal:people.captain'],
    choices: [
      { text: '"An old fisherman taught me to say la mar. The sea, like a person."', goto: 'c4.isao.lamar', when: { has: ['page.words.lamar'] } },
      { text: 'Ask about this sea', goto: 'c4.isao.umi' },
    ],
  },
  'c4.isao.lamar': {
    lines: [
      { who: 'Captain Isao', text: 'La mar. Mm. Yes. Here too the sea is somebody, not something. Fishermen apologize to her, thank her, grumble at her moods.' },
      { who: 'Captain Isao', text: 'Your fisherman and I would understand each other with no common word except that one. That is most of seafaring, honestly.' },
    ],
  },
  'c4.isao.umi': {
    lines: [
      { who: 'Captain Isao', text: 'The Seto Naikai. Seven hundred islands, calm as a held breath, and it has carried Japan\'s trade for two thousand years. A working sea.' },
      { who: 'Captain Isao', text: 'The old crews speak of it like a grandmother in the next room. You lower your voice, you mind your manners, you say thank you at the rail.' },
    ],
  },
  'c4.isao.ferry': {
    lines: [
      { who: 'Captain Isao', text: 'So. The festival is hung, the wishes are up, and your pack smells of lemon and wrapping paper. That is a traveler ready to travel.' },
      { who: 'Captain Isao', text: 'I run you to Shimonoseki on the morning boat. From there the Busan ferry crosses the strait, as it has since before either of us. Say the word.' },
    ],
    choices: [
      { text: 'Board for Busan', goto: 'c4.depart' },
      { text: 'Not yet. The town is not finished with me.', goto: 'c4.isao.wait' },
    ],
  },
  'c4.depart': {
    lines: [
      { text: 'The tairyō-bata crack once in the morning wind, as if the pier itself waved. Fumi pressed onigiri on you at dawn; arguing was, again, useless.' },
      { text: 'Okaeri, the town said when you came. Itterasshai, it says now: go, and come back. The gangway rings under your boots.' },
    ],
    effects: ['travel:busan'],
  },
  'c4.isao.wait': {
    lines: [
      { who: 'Captain Isao', text: 'Sensible. A town takes longer to leave than to reach. The timetable and I will be here; we are the two most reliable things on this coast.' },
    ],
  },
  'c4.isao.notyet': {
    lines: [
      { who: 'Captain Isao', text: 'Passage to Busan goes through me, but not before the seventh night. Even the timetable respects Tanabata. Even me.' },
    ],
  },

  // ---------------- Chasca, photographing noren ----------------
  'c4.chasca.noren': {
    lines: [
      { who: 'Chasca', text: 'The soup-eater! Crossing oceans now! I have been photographing these doorway curtains all morning. A shop that is open hangs its own flag. Poetry!' },
      { who: 'Chasca', text: 'Stand there, half through the noren, half in the street. In or out, the photo will not say. Perfect for an album about leaving. ¡Digan papas!' },
    ],
    effects: ['set:met.chascaC4', 'set:photo.flash', 'set:photo.c4.noren'],
  },
  'c4.chasca.deck': {
    lines: [
      { who: 'Chasca', text: 'The deck photo from the crossing came out ALL stars. You are a smudge of person under a river of light. My favorite smudge so far.' },
      { who: 'Chasca', text: 'And now here you are under paper lanterns instead. The album is learning what light does in different countries. So am I.' },
    ],
    effects: ['set:c4.chasca2'],
  },
  'c4.chasca.idle': {
    lines: [
      { who: 'Chasca', text: 'I develop everything at the end of the journey. Whose journey? Mine, yours. The album keeps its own counsel.' },
    ],
  },

  // ---------------- Olena, on shore leave while the Yacana unloads ----------------
  'c4.olena.shore': {
    lines: [
      { text: 'A familiar figure stands at the end of the quay in shore clothes that fit like a disguise, holding a glass jar up toward the green hills.' },
      { who: 'Olena', text: 'The galley hand. Do not look amazed; the Yacana unloads until tomorrow and I am on shore leave. It is an ancient maritime right.' },
      { who: 'Olena', text: 'The starter came ashore with me. Six oceans in this jar, and it has never once seen a mountain. Today it sees a mountain. Look at it bubble.' },
      { who: 'Olena', text: 'That is happiness. I have it on good authority. Mine.' },
    ],
    effects: ['set:c4.met.olena'],
  },
  'c4.olena.quiz': {
    lines: [
      { who: 'Olena', text: 'So. One day on land and the crossing is blurring for you already. It happens to everyone; the sea photographs badly in memory.' },
      { who: 'Olena', text: 'Prove me wrong. One thing from those thirty-one days that is still sharp. I am grading this.' },
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
      { who: 'Olena', text: 'Ducked by a bosun in a mop wig, technically. But the certificate is real, and the captain signs very few things twice.' },
      { who: 'Olena', text: 'Fine. Full marks. Frame the paper before the sea takes the memory back; it does that. Ask any shellback over sixty.' },
    ],
  },
  'c4.olena.a.river': {
    lines: [
      { who: 'Olena', text: 'Mayu, Milky Way, Amanogawa. Mm. And tonight this town hangs paper on bamboo for the third name. Convenient timing you have.' },
      { who: 'Olena', text: 'Full marks. You kept the sky, which is the largest thing we carry. Everything else on that ship is just steel and dinner.' },
    ],
  },
  'c4.olena.a.family': {
    lines: [
      { who: 'Olena', text: 'It bubbled immediately, yes. It does not do that for the chief engineer, and he has asked it nicely for two whole contracts.' },
      { who: 'Olena', text: 'So: family, confirmed on land, which makes it legal. The jar and I expect a letter someday. It reads slowly, so write big.' },
    ],
  },
  'c4.olena.a.wet': {
    lines: [
      { who: 'Olena', text: 'The sea is a big wet month. No stars, no certificate, no poetry. Finally, an honest sailor.' },
      { who: 'Olena', text: 'You would be amazed how many pass this quiz by failing it. Go, enjoy your land. It holds still, mostly. That never stops being funny.' },
    ],
  },
  'c4.olena.idle': {
    lines: [
      { who: 'Olena', text: 'We sail before your festival ends, so this is the goodbye watch. I am spending it here, teaching a jar what a mountain is.' },
    ],
  },

  // ---------------- the wish, written ----------------
  'c4.wish.write': {
    lines: [
      { text: 'The bamboo leans over you, already heavy with the town\'s hopes: exam luck, safe boats, a baby due in autumn, one that just says RAMEN.' },
      { text: 'Genji\'s tanzaku waits in your pocket, small on purpose. One wish, then. The pen hovers.' },
    ],
    choices: [
      { text: 'For the road: may it keep opening', goto: 'c4.wish.road' },
      { text: 'For the people met along it, every port of them', goto: 'c4.wish.people' },
      { text: 'For Nani: to finish what she started', goto: 'c4.wish.nani' },
    ],
  },
  'c4.wish.road': {
    lines: [
      { text: 'You write: may the road keep opening. Simple, greedy in the best direction. You tie it high, where the sea wind can read it.' },
      { text: 'The strip settles among the others, one color in a town of colors. It looks correct there. It looks like it always hung there.' },
    ],
    effects: ['set:wish.road', 'set:wish.written', 'set:c4.wish.hung'],
  },
  'c4.wish.people': {
    lines: [
      { text: 'You write: for everyone who fed me, keep well until I pass again. It barely fits. Taro would sympathize.' },
      { text: 'You tie it beside a wobbly strip that reads minna genki de, and the two wishes hang there agreeing with each other in different hands.' },
    ],
    effects: ['set:wish.people', 'set:wish.written', 'set:c4.wish.hung'],
  },
  'c4.wish.nani': {
    lines: [
      { text: 'You write her name, and then: let me finish the book you started. The pen presses harder than you meant it to.' },
      { text: 'You tie it where the morning sun will find it first. Somewhere under the same sky is a village that taught her to bow too deep.' },
    ],
    effects: ['set:wish.nani', 'set:wish.written', 'set:c4.wish.hung'],
  },

  // ---------------- kingyo-sukui ----------------
  'c4.kingyo.offer': {
    lines: [
      { text: 'The stall uncle looks you over, decides you are a customer, and hands you a paper scoop with the gravity of a sword master.' },
      { text: 'Poi, he says. Paper. One dip is honest, two is brave, three is goodbye. The goldfish have heard all of this before.' },
    ],
    effects: ['set:c4.kingyo.start'],
  },
  'c4.kingyo.won': {
    lines: [
      { text: 'The uncle ties the bag with a flourish and holds it out with both hands. You receive it with both, which earns an approving grunt.' },
      { text: 'A goldfish of your own, orange as a struck match, riding a bag of harbor-colored water. Taro will demand a full report.' },
    ],
    effects: ['clear:c4.kingyo.start', 'set:c4.kingyo.done'],
  },

  // ---------------- the post ----------------
  'c4.post.pilar': {
    lines: [
      { text: 'The red pillar box stands at attention. Beside it, the ferry office window doubles as the post counter, and the clerk waves an envelope.' },
      { text: 'Mail, held for a traveler answering your description. The handwriting is unmistakably an invoice wearing a stamp.' },
    ],
    effects: ['letter:c4.pilar'],
  },
  'c4.post.marisol': {
    lines: [
      { text: 'The clerk holds up one finger, checks under the ledger, and produces a second envelope. It smells faintly, impossibly, of the morning market.' },
    ],
    effects: ['letter:c4.marisol'],
  },
  'c4.ex.postbox': {
    lines: [
      { text: 'The red pillar box, patient as a shrine. Collection at eight and two, says the plate, and the box has never once been late.' },
    ],
  },

  // ---------------- ofuro ----------------
  'c4.ofuro.scene': {
    lines: [
      { text: 'The hinoki tub steams, hip-deep and inviting. You reach for the rim, and a voice comes through the wall with startling accuracy.' },
      { who: 'Fumi', text: 'Wash FIRST! Stool, bucket, soap, rinse, all of it, before one toe touches my tub. The bath is for soaking, not for cleaning.' },
      { text: 'You wash at the low stool until you squeak, then fold into water hot enough to reorganize your opinions. The little towel goes on your head.' },
      { who: 'Fumi', text: 'Better, ne? The tub water stays clean for the next person. A bath you share with the whole house, just not at the same time.' },
    ],
    effects: ['set:c4.ofuro', 'journal:customs.ofuro'],
  },
  'c4.ex.ofuro': {
    lines: [
      { text: 'The wooden tub, faithfully hot. The stool and bucket sit where the actual washing happens; the tub itself is only for arriving.' },
    ],
  },

  // ---------------- examines: new kinds ----------------
  'c4.ex.machiya': {
    lines: [
      { text: 'Dark cedar and white plaster under a heavy tile roof. The wood is silver where the salt wind works and black where the eaves defend it.' },
    ],
  },
  'c4.ex.noren': {
    lines: [
      { text: 'The noren breathes in the doorway. Hung out means open, taken in means closed; a shop that tells the truth with cloth.' },
    ],
  },
  'c4.ex.torii': {
    lines: [
      { text: 'The torii frames the steps: this side ordinary, that side sacred, one stride between them. You duck slightly, though there is no need.' },
    ],
  },
  'c4.ex.ishidoro': {
    lines: [
      { text: 'A stone lantern, mossy at the knees. Someone still lights it at dusk; boats coming home late steer small by its glow.' },
    ],
  },
  'c4.ex.bamboo': {
    lines: [
      { text: 'Green bamboo, cut fresh for the festival. It grows straight at heaven, which is the entire point of hanging hopes on it.' },
    ],
  },
  'c4.ex.bambooWish': {
    lines: [
      { text: 'Tanzaku flutter in five colors: exam luck, safe boats, a wobbly one that says RAMEN. The town\'s hopes, sorted by wind.' },
    ],
  },
  'c4.ex.tairyobata': {
    lines: [
      { text: 'Tairyō-bata: big-catch flags, sunrise and waves and one emphatic fish. Boats flew them coming home full; now they fly for festivals and homecomings.' },
    ],
    effects: ['journal:customs.tairyobata'],
  },
  'c4.ex.chochin': {
    lines: [
      { text: 'A paper lantern on its pole, ribs showing through like a fish held to the light. At dusk the whole quay turns this shade of orange.' },
    ],
  },
  'c4.ex.keitruck': {
    lines: [
      { text: 'The kei truck, small as a shoe and mighty as a mule. It idles at the port before dawn and knows every lane in town by heart.' },
    ],
  },
  'c4.ex.ebisudo': {
    lines: [
      { text: 'Ebisu smiles inside the little hall, a tai tucked under his arm. God of fishermen: the one god you tip in fish.' },
    ],
  },
  'c4.ex.yatai': {
    lines: [
      { text: 'A festival stall, red and white, one tub of goldfish rehearsing. The uncle is arranging paper scoops like a surgeon laying out instruments.' },
    ],
  },
  'c4.ex.yatai.after': {
    lines: [
      { text: 'The goldfish tub ripples with survivors and celebrities. The uncle nods at you: a colleague now, in the paper-scoop trade.' },
      { text: 'He taps a fresh poi twice against the rim and leaves it lying there, which is how a stall keeper asks a question.' },
    ],
    choices: [
      { text: 'Take the fresh poi', when: { has: ['c4.kingyo.done'] }, goto: 'c4.kingyo.replay' },
      { text: 'Give the goldfish the evening off', goto: 'c4.ex.yatai.watch' },
    ],
  },
  'c4.kingyo.replay': {
    lines: [
      { text: 'No ceremony this time, no lecture about one dip being honest. Just paper, water, and the small orange chance of a fish.' },
    ],
    effects: ['set:replay.mode', 'set:c4.kingyo.start'],
  },
  'c4.ex.yatai.watch': {
    lines: [
      { text: 'You stand and watch instead. A boy in a yukata tears through three poi in a row and is radiantly, completely happy about it.' },
    ],
  },
  'c4.ex.tatami': {
    lines: [
      { text: 'Tatami, green-gold and springy underfoot, smelling faintly of dry grass and summer. Slippers stop at its border; even they know.' },
      { text: 'No two mats are quite the same colour. They were made one at a time, and they have been standing in different amounts of sun ever since.' },
    ],
  },
  'c4.ex.floorWood': {
    lines: [
      { text: 'Dark boards polished by sixty years of socks. The house creaks in a friendly register, announcing everyone to everyone.' },
    ],
  },
  'c4.ex.tataki': {
    lines: [
      { text: 'The genkan: a cool stone floor a step below the house. Shoes stop here, and with them the road. The step up is the real front door.' },
      { text: 'Lime, earth and brine, beaten down by hand until it set. There is grit all the way through it; that is not wear, that is the recipe.' },
    ],
  },
  'c4.ex.wallShoji': {
    lines: [
      { text: 'Wood and paper walls that trade in light and rumor. A shoji does not block sound; it just asks everyone to pretend.' },
      { text: 'Clay above the rail, cedar below it, dark with sixty years of the same fire. The straw in the plaster still shows if you stand close.' },
      { text: 'One pane is patched with newer paper, a slightly wronger white. It will match in about ten years, and by then there will be another.' },
    ],
  },
  'c4.ex.irori': {
    lines: [
      { text: 'The sunken hearth, embers banked under ash. The kettle hook hangs over it like a question the house answers three times a day.' },
    ],
  },

  // ---------------- examines: shared kinds, this coast's words ----------------
  'c4.ex.sea': {
    lines: [
      { text: 'The Seto Inland Sea, flat as poured metal, islands stacked blue on blue to the haze. A sea with the manners of a lake and the memory of an ocean.' },
    ],
  },
  'c4.ex.sand': {
    lines: [
      { text: 'Coarse pale sand printed with gull cuneiform and one determined bicycle track.' },
    ],
  },
  'c4.ex.wet': {
    lines: [
      { text: 'The tide\'s wet hem. Tiny crabs vanish ahead of your shadow with bureaucratic efficiency.' },
    ],
  },
  'c4.ex.pier': {
    lines: [
      { text: 'Concrete and old timber, ringed with truck tires for fenders. The ferry kisses here three times a day, exactly on time.' },
    ],
  },
  'c4.ex.quay': {
    lines: [
      { text: 'Fitted stone, swept and sun-warm. By day the market, by dusk the promenade, by festival the whole town\'s living room.' },
    ],
  },
  'c4.ex.path': {
    lines: [
      { text: 'Stone worn smooth in the middle and mossy at the edges. Feet have been agreeing on this exact line for a few hundred years.' },
    ],
  },
  'c4.ex.yard': {
    lines: [
      { text: 'The shrine yard\'s raked earth, swept into faint tidy arcs. Genji\'s broom signature, renewed daily.' },
    ],
  },
  'c4.ex.hisashi': {
    lines: [
      { text: 'A shop awning on steel arms, cloth bleached on the seaward half only. No two on this street hang at the same height, and no two ever did.' },
    ],
  },
  'c4.ex.stall': {
    lines: [
      { text: 'A market stall, scales and ice and yesterday\'s prices chalked over twice. By eight in the morning it has already had its whole day.' },
    ],
  },
  'c4.ex.bench': {
    lines: [
      { text: 'A bench in the arcade\'s shade, seat polished to a shine. The morning shift is three grandmothers; the afternoon shift is the cat.' },
    ],
  },
  'c4.ex.boat': {
    lines: [
      { text: 'A small fishing boat, high-prowed, name painted twice, once faded and once fresh. Same name both times.' },
    ],
  },
  'c4.ex.crate': {
    lines: [
      { text: 'Styrofoam and wood crates, fish-silver at the seams. The stack is a public calendar: tall means the sea was generous.' },
    ],
  },
  'c4.ex.net': {
    lines: [
      { text: 'Nets drying in long green folds, smelling of iodine and patience. Every mend is a different evening of talk; that part is true everywhere.' },
    ],
  },
  'c4.ex.rock': {
    lines: [
      { text: 'Grey harbor stone, barnacled below the waterline, warm above it. The sea draws its own plimsoll line on everything.' },
    ],
  },
  'c4.ex.tree': {
    lines: [
      { text: 'The tree is shouting. Cicadas, dozens deep, sizzling like frying oil: jiri jiri jiri. Seven years underground for one loud summer.' },
    ],
  },
  'c4.ex.tuft': {
    lines: [
      { text: 'Summer grass, humming with small lives. Somewhere in it a cicada winds up like a starter motor.' },
    ],
  },
  'c4.ex.doorshut': {
    lines: [
      { text: 'A latched shopfront, noren taken in. Behind one, a radio and the smell of tofu; behind another, only dust and a faded FOR RENT in two languages.' },
    ],
  },
  'c4.ex.sign': {
    lines: [
      { text: 'SHIONOURA, the sign says, over a painted tai. Below, the ferry timetable, and below that, smaller: THE TIMETABLE IS THE TOWN. Somebody underlined it.' },
    ],
  },
  'c4.pier.notyet': {
    lines: [
      { text: 'The ferry office board: Shimonoseki twice daily, connections to the Busan ferry across the strait. Captain Isao\'s handwriting is naval and absolute.' },
      { text: 'Under the timetable, chalked: NO SAILINGS BEFORE THE SEVENTH NIGHT. THE STARS OUTRANK ME.' },
    ],
  },
  'c4.pier.next': {
    lines: [
      { text: 'THE MORNING BOAT: Shimonoseki, then Busan, the strait ferry that has stitched these two coasts together for a century.' },
      { text: 'Chapter Five is being provisioned. Captain Isao has already chalked your name on the manifest, spelled almost correctly.' },
    ],
  },
  // ---------------- examines: the love pass ----------------
  'c4.ex.jizo': {
    lines: [
      { text: 'A small stone Jizo beside the steps, hands folded, wearing a knitted red bib and cap. Someone has swept the leaves from his feet.' },
      { text: 'At his feet, one mikan jelly cup and a chipped teacup. The going rate, apparently, for watching over a town.' },
    ],
    effects: ['set:c4.seen.jizo'],
  },
  'c4.ex.jizo2': {
    lines: [
      { text: 'Look closer: the bib\'s wool is new, the stitches small and sure. Somebody in town reknits it every winter, and has for longer than anyone says.' },
    ],
  },
  'c4.ex.ema': {
    lines: [
      { text: 'Wooden ema hang two rows deep: safe boats, a fat catch, pass the exam. One just says COME BACK SOON, pressed hard enough to dent the plaque.' },
    ],
  },
  'c4.ex.koke': {
    lines: [
      { text: 'Moss upholsters the edges of the step, older than anyone who climbs it. The middle stays bare, argued smooth by feet with somewhere to be.' },
    ],
  },
  'c4.ex.jihanki': {
    lines: [
      { text: 'A vending machine hums alone on the corner, lit like a small shrine. Cold tea, hot coffee, corn soup: all hours, all seasons, no explanation.' },
    ],
    effects: ['set:c4.seen.jihanki'],
  },
  'c4.ex.jihanki2': {
    lines: [
      { text: 'Blue tabs for TSUMETAI, red for ATSUI: cold and hot living in one box. At dusk its light comes on, and the corner quietly counts on it.' },
    ],
  },
  'c4.ex.ukidama': {
    lines: [
      { text: 'Glass floats in a net bag, green as bottled sea. Plastic took their job years ago; nobody here would dream of letting the old crew go.' },
    ],
  },
  'c4.ex.mikanbako': {
    lines: [
      { text: 'Mikan crates stenciled SETODA, on summer duty with juice and jelly. The fruit itself is asleep on the terraces until autumn.' },
    ],
  },
  'c4.ex.jitensha': {
    lines: [
      { text: 'A granny bike with a basket, a bell, and no lock. The clack of its kickstand is one of the town\'s official sounds.' },
    ],
  },
  'c4.ex.ittokan': {
    lines: [
      { text: 'A square kerosene can, retired into a planter and heavy with hydrangeas. Nothing in Shionoura is thrown away; it is reassigned.' },
    ],
  },
  'c4.ex.ajisai': {
    lines: [
      { text: 'Hydrangeas holding the exact blue of seven in the evening. Tsuyu is a tiresome guest, but it does pay its rent in flowers.' },
    ],
  },
  'c4.ex.himono': {
    lines: [
      { text: 'Small fish dry butterflied on the net rack, salted and patient. It stands exactly one cat\'s jump too high, built by a town that knows its cats.' },
    ],
  },
  'c4.ex.monohoshi': {
    lines: [
      { text: 'Towels and aprons pinned hard against the sea wind. Fumi consults the sky like a tide table before trusting it with a single sock.' },
    ],
  },
  'c4.ex.gyokyo': {
    lines: [
      { text: 'The co-op board: quota notices, a typhoon drill, a crayon poster for the goldfish stall. Official and unofficial share the same four nails.' },
    ],
  },
  'c4.gyokyo.after': {
    lines: [
      { text: 'A new notice, brushed by hand: THE SEVENTH NIGHT WENT WELL. OTSUKARESAMA, MINNA. The co-op stamp underneath makes it official policy.' },
    ],
  },
  'c4.ex.furin': {
    lines: [
      { text: 'A glass furin translating sea wind into small bright syllables. Its paper strip adds a wish to every gust, free of charge.' },
    ],
  },
  'c4.ex.neko1': {
    lines: [
      { text: 'On the warm quay stone, a calico in full loaf: paws stowed, eyes at half mast. You have been seen, filed, and dismissed.' },
    ],
    effects: ['set:c4.seen.neko1'],
  },
  'c4.ex.neko1b': {
    lines: [
      { text: 'The loaf has not moved, but the eyes track you with the calm of middle management. This stretch of quay is hers, and the paperwork is in order.' },
    ],
  },
  'c4.neko2.tai': {
    lines: [
      { text: 'The stall cat has noticed Fumi\'s tai. He falls in beside you with the sudden warm loyalty of an old friend you have never met.' },
    ],
  },
  'c4.ex.neko2': {
    lines: [
      { text: 'A big scarred tom sits by the fish stall like he holds shares in it. Daisuke calls him Kacho, the section chief. Nobody laughs twice.' },
    ],
    effects: ['set:c4.seen.neko2'],
  },
  'c4.ex.neko2b': {
    lines: [
      { text: 'Kacho inspects the crates, the nets, and you, in that order of importance. Promotion here does not go through him; respect, however, does.' },
    ],
  },
  'c4.ex.neko3': {
    lines: [
      { text: 'Under the bench, a small black cat sleeps in the shade the grandmothers keep warm for it. The afternoon shift, technically on duty.' },
    ],
    effects: ['set:c4.seen.neko3'],
  },
  'c4.ex.neko3b': {
    lines: [
      { text: 'One ear swivels toward your footsteps, weighs the information, and stands down. You have been classified: harmless, carries no snacks.' },
    ],
  },
  'c4.ex.bathstool': {
    lines: [
      { text: 'The bath stool, knee-high and scrubbed pale, standing by the ofuro with the pail upended on it. You wash first; the tub is for after.' },
    ],
  },
  'c4.ex.chochin.in': {
    lines: [
      { text: 'A lantern brought in off the quay and stood in the hall, where the wooden floor runs too long for one window to reach the far end.' },
    ],
  },
  'c4.ex.monohoshi.in': {
    lines: [
      { text: 'The drying rack, moved indoors when the sky looks like this. Towels for six guests and one apron that has never once been a guest\u2019s.' },
    ],
  },
  'c4.ex.kaigara': {
    lines: [
      { text: 'Shells and sea glass, the tide\'s small change. Taro\'s exchange rate: white is common, pink is money, blue glass is beyond price.' },
    ],
  },
  'c4.ex.senpuki': {
    lines: [
      { text: 'An elderly electric fan sweeps the room in slow no\'s, disagreeing with summer on principle. It has outlived three sleeker replacements.' },
    ],
  },
  'c4.ex.mugicha': {
    lines: [
      { text: 'Cold mugicha sweating politely on its tray, one glass already poured for whoever passes. Refusing it is possible in theory only.' },
    ],
  },
  'c4.ex.getarow': {
    lines: [
      { text: 'Geta and sandals at the genkan edge, toes pointed out the door. The house sends you off ready, whichever way your feet decide.' },
    ],
  },

  'c4.ex.tablelow': {
    lines: [
      { text: 'The low table, legs folded under it like a resting animal. Meals, letters, homework, tea: the whole house happens at knee height.' },
    ],
  },
  'c4.ex.zabuton': {
    lines: [
      { text: 'A flat cushion, dented by decades of correct sitting. Your knees file a formal complaint and are overruled.' },
    ],
  },
  'c4.ex.kettle': {
    lines: [
      { text: 'An iron kettle, black and patient. It has outlived three emperors and intends to outlive the electric one on the counter.' },
    ],
  },
  'c4.ex.shelf2': {
    lines: [
      { text: 'Jars of iriko, kombu, pickled plums, and one shelf of guest cups that are never the everyday cups. Guests can tell. That is the point.' },
    ],
  },
  // Skinned to `goza` on this map in `art/sets/shionoura.ts`: the one room in
  // the game that knows what rush is should not be furnished with the shared
  // Andean weave.
  'c4.ex.mat2': {
    lines: [
      { text: 'A goza unrolled at the edge of the genkan, rush like the tatami but finer, bound down its long sides with indigo cloth.' },
      { text: 'Shoes lined up on it with their toes to the door, ready to leave the moment you are. Fumi\'s doing, silent as a tide.' },
    ],
  },
};

/** Examine arms; shared kinds are map-tagged so this coast keeps its own words. */
export const SHIONOURA_EXAMINES: Record<string, ExamineArm[]> = {
  machiya: [{ node: 'c4.ex.machiya' }],
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
    { when: { not: ['letter.read.c4.pilar'] }, node: 'c4.post.pilar' },
    { when: { has: ['letter.read.c4.pilar'], not: ['letter.read.c4.marisol'] }, node: 'c4.post.marisol' },
    { node: 'c4.ex.postbox' },
  ],
  yatai: [
    { when: { has: ['c4.kingyo.done'] }, node: 'c4.ex.yatai.after' },
    { when: { has: ['met.hana'], not: ['c4.kingyo.start', 'c4.kingyo.done'] }, node: 'c4.kingyo.offer' },
    { node: 'c4.ex.yatai' },
  ],
  jizo: [
    { when: { not: ['c4.seen.jizo'] }, node: 'c4.ex.jizo' },
    { node: 'c4.ex.jizo2' },
  ],
  ema: [{ node: 'c4.ex.ema' }],
  koke: [{ node: 'c4.ex.koke' }],
  jihanki: [
    { when: { not: ['c4.seen.jihanki'] }, node: 'c4.ex.jihanki' },
    { node: 'c4.ex.jihanki2' },
  ],
  ukidama: [{ node: 'c4.ex.ukidama' }],
  mikanbako: [{ node: 'c4.ex.mikanbako' }],
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
  kaigara: [{ node: 'c4.ex.kaigara' }],
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
  sea: [{ map: 'shionoura', node: 'c4.ex.sea' }],
  sand: [{ map: 'shionoura', node: 'c4.ex.sand' }],
  sandWet: [{ map: 'shionoura', node: 'c4.ex.wet' }],
  pierdeck: [{ map: 'shionoura', node: 'c4.ex.pier' }],
  plaza: [{ map: 'shionoura', node: 'c4.ex.quay' }],
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
