import type { ExamineArm, NodeMap, NpcDef } from '../schema';

/**
 * La Caleta's people. Coastal Spanish flavored with ribereño slang (pe, causa,
 * chévere, al toque) and the Quechua that walked down the mountain inside it
 * (yapa, choclo, cancha). Rules unchanged from the Andes: nobody lectures,
 * people disagree, the wrong branch is the warmer scene, two short sentences.
 */

export const CALETA_NPCS: NpcDef[] = [
  {
    id: 'marisol',
    name: 'Marisol',
    map: 'la-caleta',
    pos: [27, 20],
    range: 1,
    look: {
      skin: '#b97f52',
      hair: '#241a12',
      cloth: '#3f7fb0',
      stripe: '#f2e6d0',
      hat: '#e8dcc4',
      hatStyle: 'none',
      skirt: '#3c6e64',
    },
    entry: [
      // First visit: hello, and Petro's lisa to carry in past the pots. The
      // lisa goes one way only; the second visit is the one with the yapa.
      { when: { not: ['met.marisol'] }, node: 'mar.marisol.first' },
      { when: { not: ['c2.lisa'] }, node: 'mar.marisol.lisa' },
      { when: { has: ['c2.lisa.done'], not: ['c2.casero'] }, node: 'mar.marisol.second' },
      { when: { has: ['c2.casero', 'c2.nets.done'], not: ['c2.rematar'] }, node: 'mar.marisol.rematar' },
      { node: 'mar.marisol.idle' },
    ],
  },
  {
    id: 'simon',
    name: 'Don Simón',
    map: 'la-caleta',
    pos: [22, 27],
    range: 1,
    look: {
      skin: '#a06a42',
      hair: '#cfc8ba',
      cloth: '#5c6e77',
      stripe: '#c9a35f',
      hat: '#e8dcc4',
      hatStyle: 'none',
    },
    entry: [
      { when: { not: ['met.simon'] }, node: 'mar.simon.first' },
      { when: { has: ['met.simon'], not: ['c2.trade'] }, node: 'mar.simon.trade' },
      { when: { has: ['c2.trade', 'c2.ride.done'], not: ['c2.nets.done'] }, node: 'mar.simon.nets' },
      // Once you are somebody's casero the pier talks to you differently, and
      // an old man remembers a passage his father was paid for twice.
      { when: { has: ['c2.casero'], not: ['c2.her.told'] }, node: 'mar.simon.her' },
      { when: { has: ['c2.nets.done'] }, node: 'mar.simon.netsAgain' },
      { node: 'mar.simon.idle' },
    ],
  },
  {
    id: 'nilda',
    name: 'Nilda',
    map: 'la-caleta',
    pos: [15, 22],
    range: 2,
    look: {
      skin: '#c98f5e',
      hair: '#2e2018',
      cloth: '#c1512f',
      stripe: '#f2e6d0',
      hat: '#e8dcc4',
      hatStyle: 'none',
      skirt: '#54708a',
    },
    entry: [
      { when: { has: ['keepsake.band'], not: ['met.nilda'] }, node: 'mar.nilda.band' },
      { when: { not: ['met.nilda'] }, node: 'mar.nilda.first' },
      { when: { has: ['met.nilda', 'c2.joke'], not: ['c2.nilda2'] }, node: 'mar.nilda.words' },
      { node: 'mar.nilda.idle' },
    ],
  },
  {
    id: 'rafa',
    name: 'Rafa',
    map: 'la-caleta',
    pos: [12, 24],
    range: 2,
    look: {
      skin: '#b97f52',
      hair: '#1c1410',
      cloth: '#d9694a',
      stripe: '#8fcbe8',
      hat: '#e8dcc4',
      hatStyle: 'none',
    },
    entry: [
      { when: { not: ['met.rafa'] }, node: 'mar.rafa.first' },
      { when: { has: ['met.rafa', 'met.nilda'], not: ['c2.joke'] }, node: 'mar.rafa.joke' },
      { when: { has: ['c2.ride.done'], not: ['c2.rafa2'] }, node: 'mar.rafa.props' },
      { node: 'mar.rafa.idle' },
    ],
  },
  {
    id: 'felix',
    name: 'Maestro Félix',
    map: 'la-caleta',
    pos: [15, 24],
    range: 1,
    look: {
      skin: '#8f5c38',
      hair: '#6b655c',
      cloth: '#c9a35f',
      stripe: '#5c6e77',
      hat: '#d0b276',
      hatStyle: 'montera',
    },
    entry: [
      { when: { not: ['met.felix'] }, node: 'mar.felix.first' },
      { when: { has: ['met.felix'], not: ['c2.ponds'] }, node: 'mar.felix.ponds' },
      { when: { has: ['c2.ponds'], not: ['c2.ride.done'] }, node: 'mar.felix.ride' },
      { when: { has: ['c2.ride.done'], not: ['c2.sanpedrito'] }, node: 'mar.felix.fiesta' },
      { when: { has: ['c2.ride.done'] }, node: 'mar.felix.rideAgain' },
      { node: 'mar.felix.idle' },
    ],
  },
  {
    id: 'petro',
    name: 'Doña Petro',
    map: 'picanteria',
    pos: [3, 2],
    range: 1,
    look: {
      skin: '#a06a42',
      hair: '#4a4038',
      cloth: '#8a4a7d',
      stripe: '#f2e6d0',
      hat: '#e8dcc4',
      hatStyle: 'none',
      skirt: '#7d3f34',
    },
    entry: [
      // Marisol's lisa is the first thing through the door if you carry it,
      // whether or not Petro has met you yet: the parcel introduces you.
      { when: { has: ['c2.lisa'], not: ['c2.lisa.done', 'met.petro'] }, node: 'mar.petro.sudado.first' },
      { when: { has: ['c2.lisa'], not: ['c2.lisa.done'] }, node: 'mar.petro.sudado' },
      { when: { not: ['met.petro'] }, node: 'mar.petro.first' },
      { when: { has: ['met.petro'], not: ['c2.ceviche'] }, node: 'mar.petro.askceviche' },
      { when: { has: ['c2.ceviche'], not: ['c2.atenoon'] }, node: 'mar.petro.noonmeal' },
      { when: { has: ['c2.atenoon'], not: ['c2.cook.done'] }, node: 'mar.petro.teach' },
      { when: { has: ['c2.cook.done'] }, node: 'mar.petro.cookAgain' },
      { node: 'mar.petro.idle' },
    ],
  },
  {
    id: 'wili',
    name: 'Don Wili',
    map: 'la-caleta',
    pos: [36, 21],
    range: 1,
    look: {
      skin: '#8f5c38',
      hair: '#2e2018',
      cloth: '#4d7440',
      stripe: '#c9a35f',
      hat: '#5c4630',
      hatStyle: 'none',
    },
    entry: [
      { when: { not: ['met.wili'] }, node: 'mar.wili.first' },
      { when: { has: ['met.wili', 'c2.casero'], not: ['c2.wili2'] }, node: 'mar.wili.chicharron' },
      { node: 'mar.wili.idle' },
    ],
  },
  {
    id: 'rios',
    name: 'Capitana Ríos',
    map: 'la-caleta',
    pos: [22, 29],
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
      // Somebody already, by the time you find her: no lecture about it.
      {
        when: { has: ['c2.vouch', 'c2.casero', 'c2.ride.done'], not: ['met.rios'] },
        node: 'mar.rios.first.ready',
      },
      { when: { not: ['met.rios'] }, node: 'mar.rios.first' },
      {
        when: { has: ['met.rios', 'c2.vouch', 'c2.casero', 'c2.ride.done'], not: ['c2.complete'] },
        node: 'mar.rios.yes',
      },
      { when: { has: ['c2.complete'] }, node: 'mar.rios.wait' },
      { node: 'mar.rios.not' },
    ],
  },
  {
    id: 'faustinoC',
    name: 'Faustino',
    map: 'la-caleta',
    when: { has: ['c2.arrived'] },
    pos: [8, 22],
    range: 1,
    look: {
      skin: '#a5744a',
      hair: '#241a12',
      cloth: '#5c4a6e',
      stripe: '#c9a35f',
      hat: '#3d3226',
      hatStyle: 'chullu',
    },
    entry: [
      { when: { not: ['c2.faus.met'] }, node: 'mar.faustino.down' },
      { when: { not: ['c2.faus.quiz'] }, node: 'mar.faustino.quiz' },
      { node: 'mar.faustino.idle' },
    ],
  },
  {
    id: 'llama-costa',
    name: 'Llama',
    map: 'la-caleta',
    when: { has: ['c2.arrived'] },
    pos: [6, 23],
    range: 1,
    sprite: 'llamaBrown',
    look: {
      skin: '#c98f5f',
      hair: '#3a2a1c',
      cloth: '#8a3a2e',
      stripe: '#f2e6d0',
      hat: '#c9a35f',
      hatStyle: 'none',
    },
    entry: [{ node: 'mar.llama.train' }],
  },
  {
    id: 'chascaC',
    name: 'Chasca',
    map: 'la-caleta',
    pos: [25, 24],
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
      { when: { not: ['met.chascaC'] }, node: 'mar.chasca.pier' },
      { node: 'mar.chasca.album' },
    ],
  },
  // The long table's strangers, mid-lunch on its stools. They stay seated;
  // the table is half full whenever you come in, which is what Petro's door
  // line has always promised.
  {
    id: 'lucho',
    name: 'Don Lucho',
    map: 'picanteria',
    pos: [11, 3],
    range: 0,
    sits: 'right',
    look: {
      skin: '#8f5c38',
      hair: '#4a4038',
      cloth: '#4f6e8a',
      stripe: '#e8dcc4',
      hat: '#e2d2a8',
      hatStyle: 'straw',
      garb: 'shirt',
      pants: '#3a3a40',
    },
    entry: [{ node: 'mar.diner.lucho' }],
  },
  {
    id: 'yesenia',
    name: 'Yesenia',
    map: 'picanteria',
    pos: [11, 5],
    range: 0,
    sits: 'right',
    look: {
      skin: '#b07a4e',
      hair: '#241a12',
      cloth: '#d9694a',
      stripe: '#f2e6d0',
      hat: '#241a12',
      hatStyle: 'none',
      garb: 'dress',
      skirt: '#54708a',
      hairdo: 'braids',
    },
    entry: [{ node: 'mar.diner.yesenia' }],
  },
];

export const CALETA_NODES: NodeMap = {
  // The walls themselves; without this arm they fall through to the
  // village's adobe line, which reads strangely far from the altiplano.
  'mar.ex.wall': {
    lines: [
      { text: 'Quincha: cane and mud under salt-faded paint. The garúa has rounded every corner it could reach.' },
    ],
  },
  // ---------------- arrival ----------------
  'mar.arrive': {
    lines: [
      { text: 'The road gives up its last switchback and the air changes: salt, fish scale, something frying.' },
      { text: 'Grey sky, grey sea. By the water, a fence of pale horses stands on end. They turn out to be boats.' },
    ],
    effects: ['set:c2.arrived'],
  },

  // ---------------- Marisol, the caserita ----------------
  'mar.marisol.first': {
    lines: [
      { who: 'Marisol', text: 'Down from the sierra, pe. You smell of woodsmoke. Good smell.' },
      { who: 'Marisol', text: 'Lisa today. Humble fish, honest fish. A stall is not a shop; you will see.' },
    ],
    effects: ['set:met.marisol', 'journal:people.marisol', 'journal:words.pe'],
    next: 'mar.marisol.lisa',
  },
  'mar.marisol.second': {
    lines: [
      { who: 'Marisol', text: 'Back again, and Petro already told half the malecón her lisa came in warm. Twice is a habit starting.' },
      { who: 'Marisol', text: 'Choclo with your fish. It came down the mountain long before you did.' },
    ],
    effects: ['set:c2.stall2', 'journal:words.choclo'],
    choices: [
      { text: '"We call it mote up there, boiled."', goto: 'mar.marisol.mote', when: { has: ['page.dishes.mote'] } },
      { text: 'Ask what to do with it', goto: 'mar.marisol.cancha' },
    ],
  },
  'mar.marisol.mote': {
    lines: [
      { who: 'Marisol', text: 'Mote! My grandmother said it exactly so. Same corn, different pot, pe.' },
    ],
    next: 'mar.marisol.yapa',
  },
  'mar.marisol.cancha': {
    lines: [
      { who: 'Marisol', text: 'Toasted, it is cancha. You eat it by the fistful while you wait for the ceviche. The waiting is part of the recipe.' },
    ],
    next: 'mar.marisol.yapa',
  },
  // The yapa is not explained, it is received: one fish more on the scale,
  // no word said, and the journal page fills from the weight of it.
  'mar.marisol.yapa': {
    lines: [
      { who: 'Marisol', text: 'Two visits and Petro’s word behind you. Casero, officially.' },
      { text: 'She weighs the lisa, then drops one small fish more on top without looking. Not a word.' },
    ],
    effects: ['set:c2.casero', 'journal:words.yapa', 'journal:customs.caserita'],
    choices: [
      { text: 'Offer to pay for the extra fish', goto: 'mar.marisol.tip' },
      { text: '"That is ayni wearing a swimsuit."', goto: 'mar.marisol.ayni', when: { has: ['page.customs.ayni'] } },
      { text: 'Just say thank you', goto: 'mar.marisol.thanks' },
    ],
  },
  'mar.marisol.tip': {
    lines: [
      { who: 'Marisol', text: 'Pay for the yapa? Ha! Then it is just fish, pe. You cannot buy it. Keep showing up; that is the price.' },
    ],
  },
  'mar.marisol.ayni': {
    lines: [
      { who: 'Marisol', text: 'Ayni! You said it, not me. Yapa is a Quechua word too; it swam down with everything else.' },
      { who: 'Marisol', text: 'Up there you return the help. Down here you return yourself, tomorrow. Same circle, pe.' },
    ],
  },
  'mar.marisol.thanks': {
    lines: [
      { who: 'Marisol', text: 'De nada, casero. Tomorrow, maybe bonito. La mar decides; we adjust.' },
    ],
  },
  // The errand runs one way, stall to pots: Petro never has to send you.
  'mar.marisol.lisa': {
    lines: [
      { who: 'Marisol', text: 'You will be going in past the pots; everybody does. Take Doña Petro her lisa. I set it aside before anyone argued.' },
      { text: 'She wraps the fish in yesterday’s newspaper, tight as a gift.' },
      { who: 'Marisol', text: 'Al toque, pe. A sudado does not like to wait.' },
    ],
    effects: ['set:c2.lisa', 'journal:words.altoque', 'errand:petro-lisa', 'set:errand.petro-lisa'],
  },
  'mar.marisol.rematar': {
    lines: [
      { who: 'Marisol', text: 'When the sun leans, pe, prices lean with it. Stay and watch the table.' },
    ],
  },
  'mar.marisol.idle': {
    lines: [
      { who: 'Marisol', text: 'Lisa, lorna, a little bonito if the morning was kind. Tomorrow, a different poem, pe.' },
    ],
  },

  // ---------------- Don Simón, who says la mar ----------------
  'mar.simon.first': {
    lines: [
      { text: 'An old man at the pier rail mends a line without looking at his hands.' },
      { who: 'Don Simón', text: 'Fifty years out there. Go on, say something about it. Everyone does.' },
    ],
    effects: ['set:met.simon', 'journal:people.simon'],
    choices: [
      { text: '"El mar looks calm today."', goto: 'mar.simon.elmar' },
      { text: 'Say nothing. Watch the water with him.', goto: 'mar.simon.watch' },
    ],
  },
  'mar.simon.elmar': {
    lines: [
      { who: 'Don Simón', text: 'EL mar, you said. Landsman’s word. From the beach it is a view, a postcard.' },
      { who: 'Don Simón', text: 'The ones she carries say LA mar. You do not respect a postcard. You respect her.' },
    ],
    effects: ['journal:words.lamar'],
    next: 'mar.simon.trade',
  },
  'mar.simon.watch': {
    lines: [
      { text: 'You watch the grey water together. After a while he nods, as if you passed something.' },
      { who: 'Don Simón', text: 'Most people talk first. La mar, we say. She is not scenery to the ones she feeds.' },
    ],
    effects: ['journal:words.lamar'],
    next: 'mar.simon.trade',
  },
  'mar.simon.trade': {
    lines: [
      { who: 'Don Simón', text: 'My grandfather walked dried fish up into the mountains. Three days up, two down, llamas complaining.' },
    ],
    effects: ['set:c2.trade'],
    choices: [
      { text: '"And came back with papas and chuño."', goto: 'mar.simon.knows', when: { has: ['page.dishes.papa'] } },
      { text: 'Ask what he brought back', goto: 'mar.simon.tells' },
    ],
  },
  'mar.simon.knows': {
    lines: [
      { who: 'Don Simón', text: 'Chuño! You have eaten up there. Fish up, papas down, three thousand years of stairs.' },
    ],
  },
  'mar.simon.tells': {
    lines: [
      { who: 'Don Simón', text: 'Papas. And chuño, frozen by night and dried by day until it keeps forever. The mountain\'s salted fish.' },
    ],
  },
  'mar.simon.nets': {
    lines: [
      { who: 'Don Simón', text: 'The boats are in, so the nets come up to the wall and we sew the day’s holes shut before they grow opinions.' },
      { who: 'Don Simón', text: 'Sit. Hands busy, tongues loose.' },
    ],
    effects: ['set:net.start'],
  },
  'mar.simon.idle': {
    lines: [
      { who: 'Don Simón', text: 'No hay horario, joven. Todo depende de la mar. There is only her mood.' },
    ],
  },
  // The thread about her: the coast remembers a week of hesitation, and finds
  // it funny. He is telling a story about his father keeping the money.
  'mar.simon.her': {
    lines: [
      { text: 'He is coiling a line into a bucket, and does not stop when you say whose road you walk.' },
      { who: 'Don Simón', text: 'Zoila. Red thread on her book. My father sold her a passage north, and she would not get in the boat.' },
      { who: 'Don Simón', text: 'A week she sat on the sand, bag packed. Then back up the road.' },
    ],
    effects: ['set:c2.her.told', 'journal:her.passage'],
    // The joke lands only if you wait for it; asking is the same as waiting.
    choices: [
      { text: '"And then?"', goto: 'mar.simon.her2' },
      { text: 'Wait for the rest.', goto: 'mar.simon.her2' },
    ],
  },
  'mar.simon.her2': {
    lines: [
      { who: 'Don Simón', text: 'A month later, there she is again, onto the next boat like nothing. My father kept the money. She never asked.' },
      { text: 'He finds this very funny, and does not notice your breathing has gone strange.' },
    ],
  },
  'mar.simon.netsAgain': {
    lines: [
      { who: 'Don Simón', text: 'The circle sits every evening. Your hands know the knots now. Come keep them honest.' },
    ],
    choices: [
      { text: 'Join the net circle again', when: { has: ['c2.nets.done'] }, goto: 'mar.simon.netsReplay' },
      { text: 'Another evening', goto: 'mar.simon.idle' },
    ],
  },
  'mar.simon.netsReplay': {
    lines: [
      { who: 'Don Simón', text: 'Bueno. Sit. No knot to prove tonight, only the good quiet of doing it.' },
    ],
    effects: ['set:replay.mode', 'set:net.start'],
  },

  // ---------------- Nilda, born of two altitudes ----------------
  'mar.nilda.band': {
    lines: [
      { who: 'Nilda', text: 'Wait. That band on your wrist is pallay, highland weave.' },
      { who: 'Nilda', text: 'My mother came down from the sierra with one just like it. Half of me is from where you just walked.' },
    ],
    effects: ['set:met.nilda', 'journal:people.nilda'],
  },
  'mar.nilda.first': {
    lines: [
      { who: 'Nilda', text: 'Down from the sierra, no? You have the walk.' },
      { who: 'Nilda', text: 'My mother came down that road. Half this village did, whatever airs the other half puts on.' },
    ],
    effects: ['set:met.nilda', 'journal:people.nilda'],
  },
  'mar.nilda.words': {
    lines: [
      { who: 'Nilda', text: 'Rafa is not cruel, just lazy in the mouth. He teased you over choclo, a Quechua word.' },
      { who: 'Nilda', text: 'Al toque, they will promise you. Then watch the actual doing.' },
    ],
    effects: ['set:c2.nilda2', 'journal:words.altoque'],
  },
  'mar.nilda.idle': {
    lines: [
      { who: 'Nilda', text: 'Fog heavy? Wait for noon. The garúa is a lid, and every pot gets lifted.' },
    ],
    choices: [
      { text: '"Remind me where I was going?"', goto: 'mar.nilda.thread' },
      { text: 'Wait for noon together', goto: 'mar.nilda.threadNo' },
    ],
  },
  'mar.nilda.thread': {
    lines: [
      { who: 'Nilda', text: 'The fog eats directions. Ask your wrist, and tell the mountain my mother says hola.' },
    ],
    effects: ['thread:'],
  },
  'mar.nilda.threadNo': {
    lines: [{ who: 'Nilda', text: 'Good company shortens fog. Proven fact, no citation.' }],
  },

  // ---------------- Rafa, surf kid ----------------
  'mar.rafa.first': {
    lines: [
      { who: 'Rafa', text: 'Habla causa! New face! You came down the slow way. Chévere.' },
      { who: 'Rafa', text: 'My father fished, his father fished. I fish a little and float a lot. Evolution, pe.' },
    ],
    effects: ['set:met.rafa', 'journal:people.rafa', 'journal:words.chevere'],
  },
  'mar.rafa.joke': {
    lines: [
      { who: 'Rafa', text: 'So how is life up in the clouds, causa? Asleep by eight, counting llamas?' },
      { who: 'Nilda', text: 'Rafa. My mother is from up there. She was mending nets at four while you counted waves.' },
      { who: 'Rafa', text: '...Fair. Withdrawn, causa. Causa means friend. Which I am being badly.' },
    ],
    effects: ['set:c2.joke', 'journal:words.causa'],
  },
  'mar.rafa.props': {
    lines: [
      { who: 'Rafa', text: 'You rode a caballito?! Causa, tourists fall off those in the shallows. Respect.' },
      { who: 'Rafa', text: 'Three thousand years of surfing, pe. My board is just a caballito with amnesia.' },
    ],
    effects: ['set:c2.rafa2'],
  },
  'mar.rafa.idle': {
    lines: [
      { who: 'Rafa', text: 'Small sets today, but small waves are still waves, causa. Same as small good days.' },
    ],
    choices: [
      { text: '"Which way was I paddling, causa?"', goto: 'mar.rafa.thread' },
      { text: 'Watch the sets a while', goto: 'mar.rafa.threadNo' },
    ],
  },
  'mar.rafa.thread': {
    lines: [
      { who: 'Rafa', text: 'Lost on land? Chévere, the sea does it to me daily. Wrist out, causa.' },
    ],
    effects: ['thread:'],
  },
  'mar.rafa.threadNo': {
    lines: [{ who: 'Rafa', text: 'Watching counts as surfing if you do it with respect, pe.' }],
  },

  // ---------------- Maestro Félix, boat-builder ----------------
  'mar.felix.first': {
    lines: [
      { text: 'A man binds bundles of dry reed in long, even wraps. A half-born boat.' },
      { who: 'Maestro Félix', text: 'Caballito de totora. Two big bundles, the madres; two small, the hijos. In a month the sea takes it back.' },
    ],
    effects: ['set:met.felix', 'journal:people.felix'],
    next: 'mar.felix.ponds',
  },
  // Boat, ponds, offer: one telling, the way he binds a bundle, without
  // letting go of the reed in between.
  'mar.felix.ponds': {
    lines: [
      { who: 'Maestro Félix', text: 'The reeds grow in wachaques, ponds dug at the desert’s edge down to water.' },
      { who: 'Maestro Félix', text: 'Bad years they sicken, and the village digs new ones together. Every horse on this sand drank from one.' },
    ],
    effects: ['set:c2.ponds', 'journal:customs.wachaque'],
    next: 'mar.felix.ride',
  },
  'mar.felix.ride': {
    lines: [
      { who: 'Maestro Félix', text: 'You look at the horses like they might bite. They only throw you, and the water forgives beginners. Want it?' },
    ],
    choices: [
      { text: 'Kneel onto the caballito', goto: 'mar.felix.ridestart' },
      { text: 'Not yet', goto: 'mar.felix.ridelater' },
    ],
  },
  'mar.felix.ridestart': {
    lines: [{ who: 'Maestro Félix', text: 'Knees wide. The horse knows the way home better than you do.' }],
    effects: ['set:wave.start'],
  },
  'mar.felix.ridelater': {
    lines: [
      { who: 'Maestro Félix', text: 'The horses are patient. Drying is all they do all day.' },
    ],
  },
  'mar.felix.fiesta': {
    lines: [
      { who: 'Maestro Félix', text: 'The bundles under the red cloth? Go look. Not every reed is for horses.' },
    ],
  },
  'mar.felix.idle': {
    lines: [
      { who: 'Maestro Félix', text: 'Always be partway through your next boat. Good advice for boats and most other things.' },
    ],
  },
  'mar.felix.rideAgain': {
    lines: [
      { who: 'Maestro Félix', text: 'A caballito dries on its tail there, waiting for someone with the timing. Want the swell again?' },
    ],
    choices: [
      { text: 'Take a caballito out again', when: { has: ['c2.ride.done'] }, goto: 'mar.felix.rideReplay' },
      { text: 'Not just now', goto: 'mar.felix.idle' },
    ],
  },
  'mar.felix.rideReplay': {
    lines: [
      { who: 'Maestro Félix', text: 'Then go. Meet the wave; do not chase it.' },
    ],
    effects: ['set:replay.mode', 'set:wave.start'],
  },
  'mar.rode': {
    lines: [
      { text: 'The wave picks up the little horse and decides to keep it. Behind you, the village whoops.' },
      { who: 'Maestro Félix', text: 'There. Carried by la mar herself. She only does that for the ones who paddle.' },
    ],
    effects: ['set:c2.ride.done', 'clear:wave.start'],
  },
  'mar.mended': {
    lines: [
      { text: 'Knot by knot the holes close. The circle talks: prices, a cousin in Lima, a pelican with a record.' },
      { who: 'Don Simón', text: 'See? The net gets mended, and so does the day. The half of this work nobody photographs.' },
    ],
    effects: ['set:c2.nets.done', 'clear:net.start', 'journal:customs.espera'],
  },

  // ---------------- the long table ----------------
  'mar.diner.lucho': {
    lines: [
      { text: 'A fisherman in a straw hat, halfway through a sudado, moves his elbow to make room without looking up.' },
      { who: 'Don Lucho', text: 'Sit, sit. At this table you are a stranger for one spoonful. After that you are passing the ají.' },
    ],
  },
  'mar.diner.yesenia': {
    lines: [
      { who: 'Yesenia', text: 'I came in for ten minutes in 2009. Petro keeps a stool warm for anyone who means to leave quickly.' },
    ],
  },

  // ---------------- Doña Petro, picantería ----------------
  'mar.petro.first': {
    lines: [
      { text: 'In past the pots: steam, ají, one long table half full of strangers not being strangers.' },
      { who: 'Doña Petro', text: 'No menu here, criatura de la sierra. Today the pots say tortitas de choclo.' },
    ],
    effects: ['set:met.petro', 'journal:people.petro'],
    choices: [
      { text: 'Ask for ceviche', goto: 'mar.petro.noon' },
      { text: 'Eat what the pots say', goto: 'mar.petro.eats' },
    ],
  },
  'mar.petro.eats': {
    lines: [
      { who: 'Doña Petro', text: 'Good instinct. Argue with the sea, argue with your mother, never argue with the pot.' },
    ],
    effects: ['journal:dishes.tortitas'],
  },
  'mar.petro.askceviche': {
    lines: [
      { who: 'Doña Petro', text: 'You have the look of someone about to ask for ceviche. Go on. I enjoy this part.' },
    ],
    choices: [
      { text: 'Ask for ceviche', goto: 'mar.petro.noon' },
      { text: 'Eat what the pots say', goto: 'mar.petro.eats', when: { not: ['page.dishes.tortitas'] } },
    ],
  },
  // Served the moment it is asked for. The rule is still taught (a lunch
  // dish, never supper), but no "come back at noon" that no clock honors,
  // and no claim about the hour that the sky outside could contradict.
  'mar.petro.noon': {
    lines: [
      { who: 'Doña Petro', text: 'Ceviche? Corazón, the boats came in at dawn and that fish is still talking about the sea.' },
      { who: 'Doña Petro', text: 'Ceviche is lunch, never supper. After three it is old fish wearing lime. Today you are early enough.' },
    ],
    effects: ['set:c2.ceviche', 'journal:customs.noon'],
    next: 'mar.petro.noonmeal',
  },
  'mar.petro.noonmeal': {
    lines: [
      { text: 'Fish that was swimming at dawn: lime, red onion, ají, cancha, camote glowing orange at the rim.' },
      { who: 'Doña Petro', text: 'And the marinade, in a glass. Leche de tigre. For courage, for hangovers, for existing. Drink.' },
    ],
    effects: ['set:c2.atenoon', 'journal:dishes.ceviche', 'journal:dishes.lechedetigre'],
  },
  // The parcel as an introduction: first time through the door with it.
  'mar.petro.sudado.first': {
    lines: [
      { text: 'In past the pots: steam, ají, one long table half full of strangers not being strangers.' },
      { text: 'A woman at the stove takes Marisol’s parcel out of your hands before you can explain it.' },
      { text: 'In it goes, with onion, tomato, ají, and a splash of chicha that hisses like gossip.' },
      { who: 'Doña Petro', text: 'Petro. Sudado. If that captain needs a galley hand, tell her Petro says your hands are clean.' },
    ],
    effects: [
      'set:met.petro',
      'journal:people.petro',
      'set:c2.lisa.done',
      'set:c2.vouch',
      'errand.done',
      'clear:errand.petro-lisa',
      'journal:dishes.sudado',
    ],
  },
  'mar.petro.sudado': {
    lines: [
      { text: 'Petro has the parcel out of your hands before you can explain it. Onion, tomato, ají, and a splash of chicha that hisses like gossip.' },
      { who: 'Doña Petro', text: 'Sudado. If that captain needs a galley hand, tell her Petro says your hands are clean.' },
    ],
    effects: [
      'set:met.petro',
      'journal:people.petro',
      'set:c2.lisa.done',
      'set:c2.vouch',
      'errand.done',
      'clear:errand.petro-lisa',
      'journal:dishes.sudado',
    ],
  },
  'mar.petro.idle': {
    lines: [
      { who: 'Doña Petro', text: 'Each weekday its own pot, corazón. Come enough times and you will have eaten the whole week.' },
    ],
  },
  'mar.petro.cookAgain': {
    lines: [
      { who: 'Doña Petro', text: 'The lisa came in fresh. Get behind the pots again, corazón, and I will taste.' },
    ],
    choices: [
      { text: 'Cook the ceviche again', when: { has: ['c2.cook.done'] }, goto: 'mar.petro.cookReplay' },
      { text: 'Maybe at noon', goto: 'mar.petro.idle' },
    ],
  },
  'mar.petro.cookReplay': {
    lines: [
      { who: 'Doña Petro', text: 'Ya. The lime kisses, it does not marry. No lesson today, only the eating.' },
    ],
    effects: ['set:replay.mode', 'set:c2.cook.start'],
  },

  // ---- the ceviche lesson: eaten first, learned second ----
  'mar.petro.teach': {
    lines: [
      { who: 'Doña Petro', text: 'You have eaten it. Good; eating is the exam before the lesson.' },
      { who: 'Doña Petro', text: 'Only family stands behind my pots. The ceviche is how you apply.' },
    ],
    choices: [
      { text: 'Step behind the pots', goto: 'mar.cook.begin' },
      { text: 'Not with these nerves', goto: 'mar.cook.later' },
    ],
  },
  'mar.cook.begin': {
    lines: [
      { text: 'She hands you the knife handle-first, which in this kitchen is a diploma you have not earned yet.' },
    ],
    effects: ['set:c2.cook.start'],
  },
  'mar.cook.later': {
    lines: [
      { who: 'Doña Petro', text: 'Nerves season nothing, corazón. Come back before the clock does its only trick.' },
    ],
  },
  'mar.cook.finish': {
    lines: [
      { text: 'The plate goes out to the long table and comes back empty before you have wiped the board.' },
      { who: 'Doña Petro', text: 'The fish works, the lime works, the clock works. We stay out of the way, with a knife.' },
    ],
    effects: ['clear:c2.cook.start', 'set:c2.cook.done'],
  },

  // ---------------- Don Wili, emolientero ----------------
  'mar.wili.first': {
    lines: [
      { who: 'Don Wili', text: 'Emoliente, casero. Barley, flax, herbs, lime. Hot glass for a grey morning.' },
      { text: 'Thick, faintly sweet, like a field decided to be tea. The warmth reaches your fingertips.' },
    ],
    effects: ['set:met.wili', 'journal:people.wili', 'journal:dishes.emoliente'],
  },
  'mar.wili.chicharron': {
    lines: [
      { who: 'Don Wili', text: 'Casero at the stall now? Then Sunday, chicharrón de pescado: fried gold, eaten standing, my emoliente after.' },
    ],
    effects: ['set:c2.wili2', 'journal:dishes.chicharron'],
  },
  'mar.wili.idle': {
    lines: [
      { who: 'Don Wili', text: 'The garúa is good for business. Nobody refuses a hot glass inside a cloud.' },
    ],
    choices: [
      { text: '"Where was I headed, Don Wili?"', goto: 'mar.wili.thread' },
      { text: 'Just warming your hands', goto: 'mar.wili.threadNo' },
    ],
  },
  'mar.wili.thread': {
    lines: [
      { who: 'Don Wili', text: 'Everyone who stops here forgot something, pe. Hold your wrist over the steam.' },
    ],
    effects: ['thread:'],
  },
  'mar.wili.threadNo': {
    lines: [
      { who: 'Don Wili', text: 'The cart is always open. That is the whole secret of the cart.' },
    ],
  },

  // ---------------- Capitana Ríos, the barrier ----------------
  'mar.rios.first': {
    lines: [
      { text: 'At the pier’s end, a woman in a salt-white cap checks a clipboard like it owes her money.' },
      { who: 'Capitana Ríos', text: 'No passengers. Working hands only, and my galley is a diplomatic crisis.' },
      { who: 'Capitana Ríos', text: 'Want across? Be somebody here first. A ship is a village too, one that can sink.' },
    ],
    effects: ['set:met.rios', 'journal:people.rios'],
  },
  'mar.rios.first.ready': {
    lines: [
      { text: 'At the pier’s end, a woman in a salt-white cap checks a clipboard like it owes her money.' },
      { who: 'Capitana Ríos', text: 'Ríos, of the Yacana. No passengers; working hands only. I was about to tell you to be somebody here first.' },
    ],
    effects: ['set:met.rios', 'journal:people.rios'],
    next: 'mar.rios.yes',
  },
  'mar.rios.not': {
    lines: [
      { who: 'Capitana Ríos', text: 'Still a stranger here, still a stranger to me. Be someone’s casero. Learn what la mar carries.' },
    ],
  },
  'mar.rios.yes': {
    lines: [
      { who: 'Capitana Ríos', text: 'So. Petro says your hands are clean, Marisol calls you casero, and a wave gave you back to Félix. Still want across?' },
    ],
    choices: [
      { text: '"Yes. When do we sail?"', goto: 'mar.rios.accept' },
      { text: '"Yes, once my goodbyes are said."', goto: 'mar.rios.goodbyes' },
    ],
  },
  'mar.rios.goodbyes': {
    lines: [
      { who: 'Capitana Ríos', text: 'Good answer. Take the evening for it.' },
      { text: 'You make the rounds: a nod from Petro over the pots, a wave from Marisol, Félix pretending not to watch.' },
    ],
    next: 'mar.rios.accept',
  },
  'mar.rios.accept': {
    lines: [
      { who: 'Capitana Ríos', text: 'Galley hand, then. We sail when the tide and the paperwork agree, which is never, so: soon.' },
      { text: 'On the pier rail, a parcel in yesterday’s newspaper, tied tight as a gift. One fish more than anybody paid for.' },
    ],
    effects: ['set:c2.complete'],
  },
  'mar.rios.wait': {
    lines: [
      { who: 'Capitana Ríos', text: 'Rest. Eat something warm. The Pacific is long and the galley coffee is a punishment from God.' },
    ],
  },

  // ---------------- Faustino, down the mountain with the trade ----------------
  'mar.faustino.down': {
    lines: [
      { text: 'At the west end of the malecón: llamas, regarding the Pacific with deep reservation.' },
      { who: 'Faustino', text: 'The soup-eater! The mountain misses you already. I brought the llamas down to check.' },
    ],
    effects: ['set:c2.faus.met'],
    // Greeting, news, the bet: one sitting by the llamas, not three.
    next: 'mar.faustino.news',
  },
  'mar.faustino.quiz': {
    lines: [
      { who: 'Faustino', text: 'A bet: the coast has washed the mountain out of you. One thing the road taught you. Go.' },
    ],
    choices: [
      {
        text: '"The apacheta: a stone, and a worry left."',
        goto: 'mar.faustino.qStone',
        when: { has: ['page.customs.apacheta'] },
      },
      {
        text: '"Paca only moves for your whistle."',
        goto: 'mar.faustino.qPaca',
        when: { has: ['page.people.faustino'] },
      },
      { text: '"Honestly? A blur of altitude."', goto: 'mar.faustino.blur' },
    ],
  },
  'mar.faustino.qStone': {
    lines: [
      { who: 'Faustino', text: 'Ayayay. The cairn at the pass. I lose, and losing to that is a pleasure. The pile grows on worries.' },
    ],
    effects: ['set:c2.faus.quiz'],
  },
  'mar.faustino.qPaca': {
    lines: [
      { who: 'Faustino', text: 'HA! One short, one long. I lose, gladly. Paca inherited that spot from her mother, who was worse.' },
    ],
    effects: ['set:c2.faus.quiz'],
  },
  'mar.faustino.blur': {
    lines: [
      { who: 'Faustino', text: 'Correct! That is exactly what the puna is: thin air, thick sky, the road doing your thinking.' },
    ],
    effects: ['set:c2.faus.quiz'],
  },
  'mar.faustino.news': {
    lines: [
      { who: 'Faustino', text: 'News from up top. Rosa invented a soup she says is for winter. It is for missing you.' },
      { who: 'Faustino', text: 'And the dog sleeps by the well now, facing the pass road. Nobody has the heart to tell him.' },
    ],
    effects: ['set:c2.faus.news'],
    next: 'mar.faustino.quiz',
  },
  'mar.faustino.idle': {
    lines: [
      { who: 'Faustino', text: 'Two days to sell, one to drink the sea with my eyes. Then up, before the llamas learn to like fish.' },
    ],
  },
  'mar.llama.train': {
    lines: [
      { text: 'A pack llama, unloaded and unimpressed. It looks at the sea, then at you, and files the whole ocean under: excessive.' },
    ],
  },

  // ---------------- Chasca, on the pier ----------------
  'mar.chasca.pier': {
    lines: [
      { who: 'Chasca', text: 'The soup-eater! You DID take the road.' },
      { who: 'Chasca', text: 'Stand there, pier behind you, reed horses on end. The album needs you where the land runs out. Say fuzzy pickles!' },
    ],
    effects: ['set:met.chascaC', 'set:photo.flash', 'set:photo.c2.pier'],
  },
  'mar.chasca.album': {
    lines: [
      { who: 'Chasca', text: 'Two photographs of you now: the star plain and the sea’s edge. The album is becoming a road.' },
    ],
  },

  // ---------------- the tidepool and the mail ----------------
  'mar.tidepool': {
    lines: [
      { text: 'You crouch at the wet sand. The last wave has left a shallow puddle, and a small museum in it.' },
      { text: 'A puffer fish puffed forever, a four-armed sea star, a crab claw like a comma.' },
      { text: 'Somewhere up the mountain, a bridge magnate is owed something weird.' },
    ],
    choices: [
      { text: 'The astonished puffer fish', goto: 'mar.gift.puffer' },
      { text: 'The four-armed sea star', goto: 'mar.gift.star' },
      { text: 'The comma of a crab claw', goto: 'mar.gift.claw' },
    ],
  },
  'mar.gift.puffer': {
    lines: [
      { text: 'The puffer fish. It looks exactly how Pilar sounds. The harbor office can post it.' },
    ],
    effects: ['set:c2.gift', 'set:pilar.gift.puffer'],
  },
  'mar.gift.star': {
    lines: [
      { text: 'The sea star. Four arms: proof the sea also does things approximately. The harbor office can post it.' },
    ],
    effects: ['set:c2.gift', 'set:pilar.gift.star'],
  },
  'mar.gift.claw': {
    lines: [
      { text: 'The claw. A comma from the sea’s own sentence. The harbor office can post it.' },
    ],
    effects: ['set:c2.gift', 'set:pilar.gift.claw'],
  },
  'mar.post.send': {
    lines: [
      { text: 'The harbor office: one plank, one stamp. To: Pilar. Bridge Authority. Ch’aska Pampa. Mind the toll.' },
      { text: 'And mail for you, under a tin of pins, in handwriting like an invoice.' },
    ],
    effects: ['set:c2.gift.sent', 'letter:home.pilar'],
  },
  'mar.post.aurelio': {
    lines: [
      { text: 'The clerk digs under the counter and produces a second envelope, soft with re-reading weather.' },
    ],
    effects: ['letter:home.aurelio'],
  },
  'mar.post.idle': {
    lines: [
      { text: 'HARBOR OFFICE. Closed for lunch. The sign does not say which lunch, or of which year.' },
    ],
  },

  // ---------------- examines, coastal ----------------
  'mar.ex.sand': {
    lines: [
      { text: 'Sand the color of old paper. The desert walks right down to the water here.' },
    ],
  },
  'mar.ex.wet': {
    lines: [
      { text: 'The wet apron of the beach. Every seventh wave reaches further, checking on you.' },
    ],
  },
  'mar.ex.pier': { lines: [{ text: 'Old sugar-trade planks, grey and salt-cured. They creak in a language of their own.' }] },
  'mar.egg.echo': {
    lines: [
      { text: 'You hold the print against the view: same planks, fifty years between two pairs of shoes.' },
      { text: 'The boards creak their one word. They said it to her too.' },
    ],
    effects: ['set:egg.c2.echo'],
  },
  'mar.ex.casa': {
    lines: [
      { text: 'Cane and mud under paint, rebar hoping on the roof. Every house here is a plan for a bigger house.' },
    ],
  },
  'mar.ex.net': { lines: [{ text: 'A gillnet drying, corks like beads. Each mended knot is a different evening of talk.' }] },
  'mar.ex.netmended': {
    lines: [
      { text: 'Last evening’s net drying, new knots pale in the old mesh. Yours are in there.' },
    ],
  },
  'mar.ex.crate': {
    lines: [
      { text: 'Fish crates, silver tails over the rim. The pelicans wait their moment.' },
    ],
  },
  'mar.ex.caballito': {
    lines: [
      { text: 'Reed horses on their tails, draining. Born wet, retired in weeks, remembered three thousand years.' },
    ],
  },
  'mar.ex.caballito2': {
    lines: [
      { text: 'One reed horse stands darker than the rest, wet to the waterline. You know exactly which ride that was.' },
    ],
  },
  'mar.ex.boat': {
    lines: [
      { text: 'A wooden chalana, paint peeling into the colors of the sky arguing with itself.' },
    ],
  },
  'mar.ex.reeds': {
    lines: [
      { text: 'Totora, green as a promise, where someone’s grandfather dug down to water.' },
    ],
  },
  'mar.ex.pelican': {
    lines: [
      { text: 'The pelican was here before you, and will outlast your opinion of it.' },
    ],
  },
  'mar.ex.emoliente': { lines: [{ text: 'Glass jars of amber and violet, steaming faintly. A small lighthouse for cold hands.' }] },
  'mar.ex.sign': {
    lines: [
      { text: 'LA CALETA. NO HAY HORARIO. TODO DEPENDE DEL MAR. Someone crossed out EL and wrote LA.' },
    ],
  },
  'mar.ex.sea': {
    lines: [
      { text: 'Grey-green and cold, dragging ropes of kelp sideways. Easy to see why the ones who work her say la mar.' },
    ],
  },
  'mar.ex.path2': { lines: [{ text: 'Hard-packed sand, swept by wind and brooms in unequal shifts.' }] },
  'mar.ex.plaza2': {
    lines: [
      { text: 'The malecón. In the evening the whole village walks it end to end, slowly, twice.' },
    ],
  },
  'mar.ex.pond': {
    lines: [
      { text: 'Green glass water. Reeds stand in it like a crowd waiting for news.' },
    ],
  },
  'mar.ex.pond2': {
    lines: [
      { text: 'Dug by hands that are gone, tended by hands that are here. The pond outlives every digger.' },
    ],
  },
  'mar.ex.tuft2': {
    lines: [
      { text: 'Dry dune grass, hanging on, firmly.' },
    ],
  },
  'mar.ex.fogon': {
    lines: [
      { text: 'The fogón: bricks, mud, forty years of fire. The wall above is glossy black and proud of it.' },
    ],
  },
  'mar.pier.locked': {
    lines: [
      { text: 'The gangway to the launch. Beyond, at anchor, a cargo ship the size of a small opinionated island.' },
      { text: 'The captain’s eyes find you first. Not yet, they say.' },
    ],
  },
  'mar.pier.next': {
    lines: [
      { text: 'THE CROSSING. Cargo, crew of twenty-three, one borrowed galley hand. The tide will say when.' },
    ],
  },

  // ---------------- the love layer: background things, each with a voice ----------------
  'mar.ex.seaweed': {
    lines: [
      { text: 'Yuyo torn loose by the tide, drying into dark ribbons. At noon it goes under someone’s ceviche.' },
    ],
  },
  'mar.ex.jelly': {
    lines: [
      { text: 'A jellyfish the tide forgot, clear as a spilled dessert. The next tide is due by evening.' },
    ],
    effects: ['set:c2.seen.jelly'],
  },
  'mar.ex.jelly2': {
    lines: [
      { text: 'Still there. Ninety percent sea, ten percent bad idea.' },
    ],
  },
  'mar.ex.shellbarrow': {
    lines: [
      { text: 'A wheelbarrow of concha shells from Petro’s kitchen. They will pave something someday, she says.' },
    ],
  },
  'mar.ex.emolcrate': {
    lines: [
      { text: 'Don Wili’s spare bottles. One has no label; that one, he says, is for the cold in the bones.' },
    ],
  },
  'mar.ex.gato.pic': {
    lines: [
      { text: 'The picantería cat, asleep at the warm end. Petro calls it a bad cat. The full bowl by the fogón is also Petro’s.' },
    ],
  },
  'mar.ex.chomba.pic': {
    lines: [
      { text: 'A chicha jar as tall as a child, brought down by a cousin and never sent back up. Sundays only.' },
    ],
  },
  'mar.ex.crabtraps.pic': {
    lines: [
      { text: 'Traps stacked indoors for winter, mended in somebody else’s knots.' },
    ],
  },
  'mar.ex.bidones.pic': {
    lines: [
      { text: 'Drums at the head of the table: water, oil, and one that holds nothing and gets sat on.' },
    ],
  },
  'mar.ex.picchairs.pic': {
    lines: [
      { text: 'The chair stack lives by the door. By one o’clock every chair is on the sand with somebody in it.' },
    ],
  },
  'mar.ex.gato': {
    lines: [
      { text: 'A cat asleep exactly where the fish smell is best. It earned this by being a cat.' },
    ],
  },
  'mar.ex.driftbench': {
    lines: [
      { text: 'A bench built from what the sea returned: two planks, one pallet, old blue paint. It faces the water.' },
    ],
  },
  'mar.ex.limebasket': {
    lines: [
      { text: 'Limones, small and mean and perfect. Their job takes under a minute, and they do it like a verdict.' },
    ],
  },
  'mar.ex.laradio': {
    lines: [
      { text: 'An old radio playing cumbia to the empty stools. Nobody would dare turn it off.' },
    ],
  },
  'mar.ex.saltrack': {
    lines: [
      { text: 'Lisa split and salted, stiffening in the fog. The gallinazos keep exactly one lunge away.' },
    ],
  },
  'mar.ex.dryreeds': {
    lines: [
      { text: 'Totora standing up to dry. In fifteen days it will be a horse; for now it is patient grass.' },
    ],
  },
  'mar.ex.dryreeds2': {
    lines: [
      { text: 'Félix says he can tell which pond a bundle came from by smell. Nobody has caught him wrong, which proves nothing, pe.' },
    ],
  },
  // San Pedrito is learned by looking: the fiesta lives in the reed racks,
  // and Félix only points the eye. The custom fills the page from the prop.
  'mar.ex.patacho': {
    lines: [
      { text: 'One lot stands apart under red cloth: reed for San Pedrito, end of June.' },
      { text: 'The village builds the saint a totora raft and rows him out to bless the water.' },
    ],
    effects: ['set:c2.sanpedrito', 'journal:customs.sanpedrito'],
  },
  // The remate is learned by watching the stall at the leaning hour, not by
  // a fifth conversation. Marisol keeps the pointer; the table does the rest.
  'mar.ex.remate': {
    lines: [
      { text: 'The sun leans and the stall changes: a chalk slash through every price, Marisol calling the street to the table.' },
      { text: 'Nobody gets rich after four. But the table goes home empty and the street goes home fed.' },
    ],
    effects: ['set:c2.rematar', 'journal:customs.rematar'],
  },
  'mar.ex.stallday': {
    lines: [
      { text: 'Marisol’s table: lisa, lorna, a little bonito. The ledger under the scale runs half the malecón.' },
    ],
  },
  'mar.ex.netpoles': {
    lines: [
      { text: 'Gillnets drying between poles, corks ticking in the wind.' },
    ],
  },
  'mar.ex.netpoles2': {
    lines: [
      { text: 'Somewhere in this mesh are your knots. The net keeps them anonymous.' },
    ],
  },
  'mar.ex.crabtraps': {
    lines: [
      { text: 'Crab traps stacked in a leaning tower. The crabs know the design and come anyway.' },
    ],
  },
  'mar.ex.picchairs': {
    lines: [
      { text: 'Plastic chairs seven high, faded from red to a loyal pink. At noon every one is taken.' },
    ],
  },
  'mar.ex.buoywall': {
    lines: [
      { text: 'Retired buoys on nails. Each owner still swears he could tell you which was his.' },
    ],
  },
  'mar.ex.kidmural': {
    lines: [
      { text: 'The school kids painted la mar purple, with a whale. Nobody here has seen a whale. Nobody will paint over it.' },
    ],
  },
  'mar.ex.pelicanpost': {
    lines: [
      { text: 'A mooring post from the sugar days, now a pelican office. Occupant: present, unimpressed.' },
    ],
  },
  'mar.ex.galli': {
    lines: [
      { text: 'Gallinazos in a row on the dune ridge, black as spilled ink. Nothing has died. They wait anyway.' },
    ],
    effects: ['set:c2.seen.galli'],
  },
  'mar.ex.galli2': {
    lines: [
      { text: 'One has shuffled half a step closer to the fish racks. The others pretend not to notice.' },
    ],
  },
  'mar.ex.mototaxi': {
    lines: [
      { text: 'A mototaxi parked at an angle only its owner could love. The mudflap says GRACIAS A DIOS.' },
    ],
  },
  'mar.ex.pizarra': {
    lines: [
      { text: 'HOY: LO QUE DIGA LA MAR. Under it, in ghost chalk, every dish this week ever was.' },
    ],
  },
  'mar.ex.tendal': {
    lines: [
      { text: 'A blue tarp over the cleaning table. Everything under it goes swimming-pool blue, including you.' },
    ],
  },
  'mar.ex.bidones': {
    lines: [
      { text: 'Drums and fish boxes, repainted in whatever the boats had left over. Nothing here is thrown away, only relocated.' },
    ],
  },
  'mar.ex.pintura': {
    lines: [
      { text: 'A hull on trestles, half salt-grey, half turquoise, the wet edge stopped mid-stroke. Somebody was called away.' },
    ],
  },
  'mar.ex.pintura2': {
    lines: [
      { text: 'Another hand’s width of turquoise since yesterday. It will get finished the way things here do: eventually, beautifully.' },
    ],
  },
  'mar.ex.wallquincha': {
    lines: [
      { text: 'Cane and mud under salt-faded cream, with a band of sea blue to your waist, the part that gets scrubbed.' },
    ],
  },
  'mar.ex.floorcemento': {
    lines: [
      { text: 'Cement mopped twice a day for forty years. The red oxide shows through where the chairs go.' },
    ],
  },
};

/** Coastal examine arms; map-tagged so shared props keep their Andes words at home. */
export const CALETA_EXAMINES: Record<string, ExamineArm[]> = {
  blocked: [{ map: 'la-caleta', node: 'mar.ex.wall' }, { map: 'picanteria', node: 'mar.ex.wall' }],
  // The picantería's shell is skinned to the chapter's own quincha and
  // cement (`art/sets/caleta.ts`), so it gets the chapter's own words too.
  wallInt: [{ map: 'picanteria', node: 'mar.ex.wallquincha' }],
  // Petro cooks on a coastal fogón; q'oncha is the highland word.
  qoncha: [{ map: 'picanteria', node: 'mar.ex.fogon' }],
  floorEarth: [{ map: 'picanteria', node: 'mar.ex.floorcemento' }],
  sand: [{ node: 'mar.ex.sand' }],
  sandWet: [
    { when: { has: ['pilar.sea'], not: ['c2.gift'] }, node: 'mar.tidepool' },
    { node: 'mar.ex.wet' },
  ],
  pierdeck: [
    // Stand where the photo was taken, print in the bag: the view, fifty
    // years apart, says its one word once.
    { map: 'la-caleta', when: { has: ['photo.c2.pier'], not: ['egg.c2.echo'] }, node: 'mar.egg.echo' },
    { node: 'mar.ex.pier' },
  ],
  casa: [{ node: 'mar.ex.casa' }],
  net: [
    { map: 'la-caleta', when: { has: ['c2.nets.done'] }, node: 'mar.ex.netmended' },
    { node: 'mar.ex.net' },
  ],
  crate: [{ node: 'mar.ex.crate' }],
  caballito: [
    { map: 'la-caleta', when: { has: ['c2.ride.done'] }, node: 'mar.ex.caballito2' },
    { node: 'mar.ex.caballito' },
  ],
  boat: [{ node: 'mar.ex.boat' }],
  reeds: [{ node: 'mar.ex.reeds' }],
  pelican: [{ node: 'mar.ex.pelican' }],
  emoliente: [{ node: 'mar.ex.emoliente' }],
  harborsign: [
    { when: { has: ['c2.gift'], not: ['c2.gift.sent'] }, node: 'mar.post.send' },
    { when: { has: ['c2.gift.sent'], not: ['letter.read.home.aurelio'] }, node: 'mar.post.aurelio' },
    { node: 'mar.post.idle' },
  ],
  piersign: [
    { when: { has: ['c2.complete'] }, node: 'mar.pier.next' },
    { node: 'mar.pier.locked' },
  ],
  // The stall is a shared kind: Marisol's table keeps coastal words at home,
  // and at the leaning hour it teaches the remate all by itself.
  stall: [
    { map: 'la-caleta', when: { has: ['c2.casero', 'c2.nets.done'], not: ['c2.rematar'] }, node: 'mar.ex.remate' },
    { map: 'la-caleta', node: 'mar.ex.stallday' },
  ],
  signpost: [{ map: 'la-caleta', node: 'mar.ex.sign' }],
  sea: [{ map: 'la-caleta', node: 'mar.ex.sea' }],
  path: [{ map: 'la-caleta', node: 'mar.ex.path2' }],
  plaza: [{ map: 'la-caleta', node: 'mar.ex.plaza2' }],
  water: [
    { map: 'la-caleta', when: { has: ['c2.ponds'] }, node: 'mar.ex.pond2' },
    { map: 'la-caleta', node: 'mar.ex.pond' },
  ],
  tuft: [{ map: 'la-caleta', node: 'mar.ex.tuft2' }],
  // The love layer: every background thing answers when looked at.
  seaweed: [{ node: 'mar.ex.seaweed' }],
  jellyfish: [
    { when: { has: ['c2.seen.jelly'] }, node: 'mar.ex.jelly2' },
    { node: 'mar.ex.jelly' },
  ],
  shellbarrow: [{ node: 'mar.ex.shellbarrow' }],
  emolcrate: [{ node: 'mar.ex.emolcrate' }],
  gato: [
    { map: 'picanteria', node: 'mar.ex.gato.pic' },
    { node: 'mar.ex.gato' },
  ],
  driftbench: [{ node: 'mar.ex.driftbench' }],
  limebasket: [{ node: 'mar.ex.limebasket' }],
  laradio: [{ node: 'mar.ex.laradio' }],
  saltrack: [{ node: 'mar.ex.saltrack' }],
  dryreeds: [
    { map: 'la-caleta', when: { has: ['c2.ride.done'], not: ['c2.sanpedrito'] }, node: 'mar.ex.patacho' },
    { when: { has: ['c2.ponds'] }, node: 'mar.ex.dryreeds2' },
    { node: 'mar.ex.dryreeds' },
  ],
  netpoles: [
    { when: { has: ['c2.nets.done'] }, node: 'mar.ex.netpoles2' },
    { node: 'mar.ex.netpoles' },
  ],
  crabtraps: [
    { map: 'picanteria', node: 'mar.ex.crabtraps.pic' },
    { node: 'mar.ex.crabtraps' },
  ],
  picchairs: [
    { map: 'picanteria', node: 'mar.ex.picchairs.pic' },
    { node: 'mar.ex.picchairs' },
  ],
  chomba: [{ map: 'picanteria', node: 'mar.ex.chomba.pic' }],
  buoywall: [{ node: 'mar.ex.buoywall' }],
  kidmural: [{ node: 'mar.ex.kidmural' }],
  pelicanpost: [{ node: 'mar.ex.pelicanpost' }],
  gallinazos: [
    { when: { has: ['c2.seen.galli'] }, node: 'mar.ex.galli2' },
    { node: 'mar.ex.galli' },
  ],
  mototaxi: [{ node: 'mar.ex.mototaxi' }],
  pizarra: [{ node: 'mar.ex.pizarra' }],
  tendal: [{ node: 'mar.ex.tendal' }],
  bidones: [
    { map: 'picanteria', node: 'mar.ex.bidones.pic' },
    { node: 'mar.ex.bidones' },
  ],
  pintura: [
    { when: { has: ['c2.complete'] }, node: 'mar.ex.pintura2' },
    { node: 'mar.ex.pintura' },
  ],
};

/** Event-triggered nodes, listed with their gating so tests can walk them. */
export const CALETA_EVENTS = [
  { node: 'mar.arrive' },
  { when: { has: ['wave.start'] }, node: 'mar.rode' },
  { when: { has: ['net.start'] }, node: 'mar.mended' },
  { when: { has: ['c2.cook.start'] }, node: 'mar.cook.finish' },
];
