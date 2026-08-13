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
      { when: { not: ['met.marisol'] }, node: 'mar.marisol.first' },
      { when: { has: ['errand.petro-lisa'], not: ['c2.lisa'] }, node: 'mar.marisol.lisa' },
      { when: { has: ['met.simon'], not: ['c2.stall2'] }, node: 'mar.marisol.second' },
      { when: { has: ['c2.stall2', 'c2.ceviche'], not: ['c2.casero'] }, node: 'mar.marisol.yapa' },
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
      { when: { not: ['met.petro'] }, node: 'mar.petro.first' },
      { when: { has: ['met.petro'], not: ['c2.ceviche'] }, node: 'mar.petro.askceviche' },
      { when: { has: ['c2.ceviche'], not: ['c2.atenoon'] }, node: 'mar.petro.noonmeal' },
      { when: { has: ['c2.atenoon'], not: ['c2.lisa.ask'] }, node: 'mar.petro.lisa' },
      { when: { has: ['c2.lisa'], not: ['c2.lisa.done'] }, node: 'mar.petro.sudado' },
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
      { when: { not: ['c2.faus.news'] }, node: 'mar.faustino.news' },
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
];

export const CALETA_NODES: NodeMap = {
  // The walls themselves; without this arm they fall through to the
  // village's adobe line, which reads strangely far from the altiplano.
  'mar.ex.wall': {
    lines: [{ text: 'Quincha: cane and mud under salt-faded paint. The garua has rounded every corner it could reach.' }],
  },
  // ---------------- arrival ----------------
  'mar.arrive': {
    lines: [
      { text: 'The road gives up its last switchback and the air changes: salt, fish scale, something frying far away.' },
      { text: 'Grey sky, grey sea, one seam where they meet. The garúa sits on the village like a lid on a pot.' },
      { text: 'Down by the water, a fence of pale horses stands on end. They turn out to be boats.' },
    ],
    effects: ['set:c2.arrived'],
  },

  // ---------------- Marisol, the caserita ----------------
  'mar.marisol.first': {
    lines: [
      { who: 'Marisol', text: 'Ah, down from the sierra, pe. I can smell the woodsmoke from here. Good smell.' },
      { who: 'Marisol', text: 'Lisa today. Humble fish, honest fish. The corvina is for people who need to impress somebody.' },
      { who: 'Marisol', text: 'Come back, and come back again. A stall is not a shop, pe. It is a friendship with a scale in it.' },
    ],
    effects: ['set:met.marisol', 'journal:people.marisol', 'journal:words.pe'],
  },
  'mar.marisol.second': {
    lines: [
      { who: 'Marisol', text: 'Back again? Good. Twice is a habit starting.' },
      { who: 'Marisol', text: 'Choclo with your fish. Big kernels, milk teeth of the valley. It came down the mountain long before you did.' },
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
      { who: 'Marisol', text: 'The mountain and the sea have been trading words longer than anyone has been alive. You carry one down yourself.' },
    ],
  },
  'mar.marisol.cancha': {
    lines: [
      { who: 'Marisol', text: 'Toasted, it is cancha. You eat it by the fistful waiting for the ceviche. The waiting is part of the recipe.' },
    ],
  },
  // The yapa is not explained, it is received: one fish more on the scale,
  // no word said, and the journal page fills from the weight of it.
  'mar.marisol.yapa': {
    lines: [
      { who: 'Marisol', text: 'Three visits, casero. You are officially a habit now.' },
      { text: 'She weighs the lisa, then drops one small fish more on top without looking, and the parcel lands in your bag. Not a word about it.' },
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
      { who: 'Marisol', text: 'Pay for the yapa? Ha! Then it is just fish, pe.' },
      { who: 'Marisol', text: 'You cannot buy it. You become it. Keep showing up; that is the whole price.' },
    ],
  },
  'mar.marisol.ayni': {
    lines: [
      { who: 'Marisol', text: 'Ayni! You said it, not me. Yapa is a Quechua word too, you know. It swam down with everything else.' },
      { who: 'Marisol', text: 'Up there you return the help. Down here you return yourself, tomorrow, to this stall. Same circle, pe.' },
    ],
  },
  'mar.marisol.thanks': {
    lines: [
      { who: 'Marisol', text: 'De nada, casero. Tomorrow the bonito might come in. Or might not. La mar decides, we adjust.' },
    ],
  },
  'mar.marisol.lisa': {
    lines: [
      { who: 'Marisol', text: 'Petro sent you? Then this is hers: the best lisa of the morning, set aside before anyone argued.' },
      { text: 'She wraps the fish in yesterday’s newspaper, tight as a gift.' },
      { who: 'Marisol', text: 'Al toque, pe. A sudado does not like to wait.' },
    ],
    effects: ['set:c2.lisa', 'journal:words.altoque'],
  },
  'mar.marisol.rematar': {
    lines: [
      { who: 'Marisol', text: 'End of the day, whatever is left, we rematar. Slash the price, call the street, empty the table.' },
      { who: 'Marisol', text: 'Nobody gets rich after four o’clock, pe. But everybody eats. That is the arithmetic that matters.' },
    ],
    effects: ['set:c2.rematar', 'journal:customs.rematar'],
  },
  'mar.marisol.idle': {
    lines: [
      { who: 'Marisol', text: 'Lisa, lorna, a little bonito if the morning was kind. Ask me tomorrow and it will be a different poem, pe.' },
    ],
  },

  // ---------------- Don Simón, who says la mar ----------------
  'mar.simon.first': {
    lines: [
      { text: 'An old man sits at the pier rail, mending a line with hands that do not look at their work.' },
      { who: 'Don Simón', text: 'Fifty years I have worked out there. Go on, say something about it. Everyone does.' },
    ],
    effects: ['set:met.simon', 'journal:people.simon'],
    choices: [
      { text: '"The sea looks calm today."', goto: 'mar.simon.elmar' },
      { text: 'Say nothing. Watch the water with him.', goto: 'mar.simon.watch' },
    ],
  },
  'mar.simon.elmar': {
    lines: [
      { who: 'Don Simón', text: 'EL mar, you said. Landsman’s word. From the beach it is el mar, a view, a postcard.' },
      { who: 'Don Simón', text: 'Those of us she carries say LA mar. Feminine. You do not respect a postcard. You respect her.' },
      { who: 'Don Simón', text: 'She is hard, but fair. If you work, you eat. Say it right and she might even hear you.' },
    ],
    effects: ['journal:words.lamar'],
  },
  'mar.simon.watch': {
    lines: [
      { text: 'You watch together. The grey water folds and unfolds. After a while he nods, as if you passed something.' },
      { who: 'Don Simón', text: 'Most people talk first. La mar, we say. Not el mar. She is not scenery to the ones she feeds.' },
    ],
    effects: ['journal:words.lamar'],
  },
  'mar.simon.trade': {
    lines: [
      { who: 'Don Simón', text: 'My grandfather walked dried fish up into the mountains. Three days up, two down, the llamas complaining the whole way.' },
    ],
    effects: ['set:c2.trade'],
    choices: [
      { text: '"And came back with papas and chuño."', goto: 'mar.simon.knows', when: { has: ['page.dishes.papa'] } },
      { text: 'Ask what he brought back', goto: 'mar.simon.tells' },
    ],
  },
  'mar.simon.knows': {
    lines: [
      { who: 'Don Simón', text: 'Chuño! You have eaten up there. Then you already know half my family history.' },
      { who: 'Don Simón', text: 'Fish up, papas down, three thousand years of stairs. You walked the same road they did, just emptier-handed.' },
    ],
  },
  'mar.simon.tells': {
    lines: [
      { who: 'Don Simón', text: 'Papas. And chuño: a potato they freeze in the night frost and dry in the sun until it keeps forever.' },
      { who: 'Don Simón', text: 'Ugly as a stone, saves your life in a bad year. The mountain’s answer to salted fish. Same idea, opposite weather.' },
    ],
  },
  'mar.simon.nets': {
    lines: [
      { who: 'Don Simón', text: 'Evening now. The nets come up to the wall and we sew the day’s holes shut before they grow opinions.' },
      { who: 'Don Simón', text: 'Sit. Hands busy, tongues loose. That is how everything worth knowing gets said in this village.' },
    ],
    effects: ['set:net.start'],
  },
  'mar.simon.idle': {
    lines: [
      { who: 'Don Simón', text: 'No hay horario, hijo. Todo depende de la mar. There is no schedule. There is only her mood.' },
    ],
  },
  // The thread about her: the coast remembers a week of hesitation, and finds
  // it funny. He is telling a story about his father keeping the money.
  'mar.simon.her': {
    lines: [
      { text: 'He is coiling a line into a bucket, loop after loop, and does not stop when you say whose road you are walking.' },
      { who: 'Don Simón', text: 'Zoila. Red thread on her book. My father took her money for a passage north and sent me down to fetch her at dawn.' },
      { who: 'Don Simón', text: 'She was on the sand with her bag packed and she would not come. A week of that, then she went back up the road.' },
      { who: 'Don Simón', text: 'A month later, here she is again, onto the next boat like it was nothing. My father kept the money. She never asked.' },
      { text: 'He finds this very funny. He goes on coiling, and does not notice that you have stopped breathing quite normally.' },
    ],
    effects: ['set:c2.her.told', 'journal:her.passage'],
  },
  'mar.simon.netsAgain': {
    lines: [
      { who: 'Don Simón', text: 'The circle sits every evening, mended or not. Your hands know the knots now. Come tie a few, just to keep them honest.' },
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
      { who: 'Nilda', text: 'Wait. Your wrist. That band is pallay, that is highland weave. Who tied that on you?' },
      { who: 'Nilda', text: 'My mother came down from the sierra with one just like it. Her whole village in eleven rows of wool.' },
      { who: 'Nilda', text: 'My aunt still lives up there, past the pass. So you see, half of me is from where you just walked.' },
    ],
    effects: ['set:met.nilda', 'set:c2.kin', 'journal:people.nilda'],
  },
  'mar.nilda.first': {
    lines: [
      { who: 'Nilda', text: 'Down from the sierra, no? You have the walk. Unhurried, like the road is a friend.' },
      { who: 'Nilda', text: 'My mother came down that same road years ago. Half this village did, whatever airs the other half puts on.' },
    ],
    effects: ['set:met.nilda', 'journal:people.nilda'],
  },
  'mar.nilda.words': {
    lines: [
      { who: 'Nilda', text: 'You heard Rafa earlier. He is not cruel, just lazy in the mouth. It runs on the coast like a current.' },
      { who: 'Nilda', text: 'Meanwhile every kitchen here says choclo, cancha, yapa. Quechua words. The coast teases the mountain in the mountain’s own vocabulary.' },
      { who: 'Nilda', text: 'Al toque means right away, by the way. You will need that one. Everything here is al toque except the actual doing.' },
    ],
    effects: ['set:c2.nilda2', 'journal:words.altoque'],
  },
  'mar.nilda.idle': {
    lines: [
      { who: 'Nilda', text: 'If the fog feels heavy, wait for noon. The garúa is a lid, but every pot gets lifted eventually.' },
    ],
  },

  // ---------------- Rafa, surf kid ----------------
  'mar.rafa.first': {
    lines: [
      { who: 'Rafa', text: 'Habla causa! New face! You came down the hill the slow way, chévere.' },
      { who: 'Rafa', text: 'I teach surfing now. My father fished, his father fished, I fish a little and float a lot. Evolution, pe.' },
    ],
    effects: ['set:met.rafa', 'journal:people.rafa', 'journal:words.chevere'],
  },
  'mar.rafa.joke': {
    lines: [
      { who: 'Rafa', text: 'So how is life up in the clouds, causa? Everybody asleep by eight, counting llamas?' },
      { who: 'Nilda', text: 'Rafa. My mother is from up there. She was mending nets at four this morning while you were counting waves.' },
      { who: 'Rafa', text: '...Fair. Withdrawn, causa. My mouth surfs ahead of my brain sometimes.' },
      { who: 'Rafa', text: 'Causa means friend, by the way. Which I am being badly. Ask me anything, I owe you one.' },
    ],
    effects: ['set:c2.joke', 'journal:words.causa'],
  },
  'mar.rafa.props': {
    lines: [
      { who: 'Rafa', text: 'You went out on a caballito?! Causa, tourists fall off those in the shallows. Respect.' },
      { who: 'Rafa', text: 'Riding the wave home is the oldest surfing there is. Three thousand years, pe. My board is just a caballito with amnesia.' },
    ],
    effects: ['set:c2.rafa2'],
  },
  'mar.rafa.idle': {
    lines: [
      { who: 'Rafa', text: 'The sets are small today, but small waves are still waves, causa. Same as small good days.' },
    ],
  },

  // ---------------- Maestro Félix, boat-builder ----------------
  'mar.felix.first': {
    lines: [
      { text: 'A man kneels over bundles of dry reed, binding them with cord in long, even wraps. A half-born boat.' },
      { who: 'Maestro Félix', text: 'Caballito de totora. Two big bundles, the madres. Two small, the hijos. Mothers and children, tied into a horse.' },
      { who: 'Maestro Félix', text: 'A boat lasts a few weeks, then the sea has it back. So the boat is nothing. The knowing how is everything.' },
    ],
    effects: ['set:met.felix', 'journal:people.felix'],
  },
  // The generational lore waits at the pond itself, once he points the eye.
  'mar.felix.ponds': {
    lines: [
      { who: 'Maestro Félix', text: 'The reeds grow in the wachaques, ponds we dig at the desert’s edge until the ground gives up its water.' },
      { who: 'Maestro Félix', text: 'Bad years the ponds sicken: no totora, no caballito. So the village digs new ones together; go stand by the green and see.' },
    ],
    effects: ['set:c2.ponds', 'journal:customs.wachaque'],
  },
  'mar.felix.ride': {
    lines: [
      { who: 'Maestro Félix', text: 'You look at the horses like they might bite. They only throw you, and the water forgives beginners.' },
      { who: 'Maestro Félix', text: 'Kneel on; the horse and the wave teach the rest. Want it?' },
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
    lines: [{ who: 'Maestro Félix', text: 'The horses are patient. Drying is all they do with their day.' }],
  },
  'mar.felix.fiesta': {
    lines: [
      { who: 'Maestro Félix', text: 'End of June, San Pedrito. We build the saint a raft of totora, a patacho, and row him out to bless the water.' },
      { who: 'Maestro Félix', text: 'The year the ponds failed there was no patacho. The saint stayed dry and the whole village felt it in the chest.' },
    ],
    effects: ['set:c2.sanpedrito', 'journal:customs.sanpedrito'],
  },
  'mar.felix.idle': {
    lines: [
      { who: 'Maestro Félix', text: 'Always be partway through your next boat. It is good advice for boats and for most other things.' },
    ],
  },
  'mar.felix.rideAgain': {
    lines: [
      { who: 'Maestro Félix', text: 'A caballito dries idle on its tail there, waiting for someone with the timing. You have it now. Want the swell again?' },
    ],
    choices: [
      { text: 'Take a caballito out again', when: { has: ['c2.ride.done'] }, goto: 'mar.felix.rideReplay' },
      { text: 'Not just now', goto: 'mar.felix.idle' },
    ],
  },
  'mar.felix.rideReplay': {
    lines: [
      { who: 'Maestro Félix', text: 'Then go. Meet the wave, do not chase it. This time it is only for the ride.' },
    ],
    effects: ['set:replay.mode', 'set:wave.start'],
  },
  'mar.rode': {
    lines: [
      { text: 'The wave picks up the little horse and simply decides to keep it. The village rushes at you, whooping somewhere behind.' },
      { text: 'Wet to the ribs, heart going like a drum. Three thousand years of people have grinned exactly this grin.' },
      { who: 'Maestro Félix', text: 'There. Now you have been carried by la mar herself. She only does that for the ones who paddle.' },
    ],
    effects: ['set:c2.ride.done', 'clear:wave.start'],
  },
  'mar.mended': {
    lines: [
      { text: 'Knot by knot the holes close. The circle talks: prices, weather, a cousin in Lima, a pelican with a criminal record.' },
      { who: 'Don Simón', text: 'See? The net gets mended and so does the day. Waiting and mending, that is half this work. The half nobody photographs.' },
    ],
    effects: ['set:c2.nets.done', 'clear:net.start', 'journal:customs.espera'],
  },

  // ---------------- Doña Petro, picantería ----------------
  'mar.petro.first': {
    lines: [
      { text: 'You enter past the pots, because that is the only way in. Steam, ají, one long table half full of strangers not being strangers.' },
      { who: 'Doña Petro', text: 'Sit. There is no menu, hija de la sierra. Today the pots say tortitas de choclo, so that is what the day means.' },
      { text: 'Corn cakes, crisp at the edge, sweet in the middle. The person beside you passes the ají without being asked.' },
    ],
    effects: ['set:met.petro', 'journal:people.petro', 'journal:dishes.tortitas'],
    choices: [
      { text: 'Ask for ceviche, for dinner maybe', goto: 'mar.petro.noon' },
      { text: 'Eat what the pots say', goto: 'mar.petro.eats' },
    ],
  },
  'mar.petro.eats': {
    lines: [
      { who: 'Doña Petro', text: 'Good instinct. Argue with the sea, argue with your mother, never argue with the pot.' },
    ],
  },
  'mar.petro.askceviche': {
    lines: [{ who: 'Doña Petro', text: 'You have the look of someone about to ask for ceviche. Go on, ask. I enjoy this part.' }],
    next: 'mar.petro.noon',
  },
  'mar.petro.noon': {
    lines: [
      { who: 'Doña Petro', text: 'Ceviche? Hija, look at the light. It is past three; that fish came ashore at dawn and is done being ceviche today.' },
      { who: 'Doña Petro', text: 'Noon to three, that is the whole dish. Come tomorrow and taste two thousand years of fuss; tonight we eat warm things.' },
    ],
    effects: ['set:c2.ceviche', 'journal:customs.noon'],
  },
  'mar.petro.noonmeal': {
    lines: [
      { text: 'Noon. The fish was swimming at dawn. Lime, red onion, ají, a scatter of cancha, camote glowing orange at the rim.' },
      { text: 'It is bright as a slap and gentler. On the side, a small glass of the marinade itself: leche de tigre.' },
      { who: 'Doña Petro', text: 'Tiger’s milk. For courage, for hangovers, for existing. Drink it. Everything in this house works twice.' },
    ],
    effects: ['set:c2.atenoon', 'journal:dishes.ceviche', 'journal:dishes.lechedetigre'],
  },
  'mar.petro.lisa': {
    lines: [
      { who: 'Doña Petro', text: 'You have useful legs, casera. Marisol holds my lisa every morning and my knees hate the walk.' },
      { who: 'Doña Petro', text: 'Bring it and there is sudado in it for you. Fair trade. This is how the village runs, pe: on favors with flavor.' },
    ],
    effects: ['set:c2.lisa.ask', 'errand:petro-lisa', 'set:errand.petro-lisa'],
  },
  'mar.petro.sudado': {
    lines: [
      { text: 'The lisa goes into the pot with onions, tomato, ají, and a splash of chicha de jora that hisses like gossip.' },
      { who: 'Doña Petro', text: 'Sudado. The fish sweats, hence the name. Best cure for a long night or a long climb, and you have had one of those.' },
      { who: 'Doña Petro', text: 'You carried for me, so hear this: if that captain out there needs a galley hand, tell her Petro said your hands are clean.' },
    ],
    effects: ['set:c2.lisa.done', 'set:c2.vouch', 'errand.done', 'clear:errand.petro-lisa', 'journal:dishes.sudado'],
  },
  'mar.petro.idle': {
    lines: [
      { who: 'Doña Petro', text: 'Each weekday its own pot, hija. Come enough times and you will have eaten the whole week. That is the only menu.' },
    ],
  },
  'mar.petro.cookAgain': {
    lines: [
      { who: 'Doña Petro', text: 'The lisa came in fresh this morning. My knees are not what they were. Get behind the pots again, hija, and I will taste.' },
    ],
    choices: [
      { text: 'Cook the ceviche again', when: { has: ['c2.cook.done'] }, goto: 'mar.petro.cookReplay' },
      { text: 'Maybe at noon', goto: 'mar.petro.idle' },
    ],
  },
  'mar.petro.cookReplay': {
    lines: [
      { who: 'Doña Petro', text: 'Ya. The lime kisses, it does not marry. You remember. Go, no lesson today, only the eating.' },
    ],
    effects: ['set:replay.mode', 'set:c2.cook.start'],
  },

  // ---- the ceviche lesson: eaten first, learned second ----
  'mar.petro.teach': {
    lines: [
      { who: 'Doña Petro', text: 'You have eaten it. Good. Eating is the exam you take before the lesson, hija.' },
      { who: 'Doña Petro', text: 'Come behind the pots. Nobody stands behind my pots except family, and the ceviche is how you apply.' },
    ],
    choices: [
      { text: 'Step behind the pots', goto: 'mar.cook.begin' },
      { text: 'Not with these nerves', goto: 'mar.cook.later' },
    ],
  },
  'mar.cook.begin': {
    lines: [
      { who: 'Doña Petro', text: 'The lisa swam at dawn, the limes left the tree this morning, the clock says noon. Everything is ready except you.' },
      { text: 'She hands you the knife handle-first, which in this kitchen is a diploma you have not earned yet.' },
    ],
    effects: ['set:c2.cook.start'],
  },
  'mar.cook.later': {
    lines: [
      { who: 'Doña Petro', text: 'Nerves season nothing, hija. Come back before the clock does its only trick.' },
    ],
  },
  'mar.cook.finish': {
    lines: [
      { text: 'The plate goes out to the long table and comes back empty before you have wiped the board.' },
      { who: 'Doña Petro', text: 'You see? The fish works, the lime works, the clock works. We stay out of the way, politely, with a knife.' },
      { who: 'Doña Petro', text: 'Now you carry a noon in your hands, hija. Spend it anywhere on earth. It will not stop being noon.' },
    ],
    effects: ['clear:c2.cook.start', 'set:c2.cook.done'],
  },

  // ---------------- Don Wili, emolientero ----------------
  'mar.wili.first': {
    lines: [
      { who: 'Don Wili', text: 'Emoliente, casera. Barley, flax, herbs, a squeeze of lime. Hot glass for a grey morning.' },
      { text: 'It is thick, faintly sweet, tastes like a field decided to be tea. Warmth spreads to the fingertips.' },
      { who: 'Don Wili', text: 'I am here before the boats leave and after they return. The cart and I keep the hours nobody else wants.' },
    ],
    effects: ['set:met.wili', 'journal:people.wili', 'journal:dishes.emoliente'],
  },
  'mar.wili.chicharron': {
    lines: [
      { who: 'Don Wili', text: 'You are casero at the stall now, I hear. Then Sunday you must find the chicharrón de pescado, fried gold, eaten standing.' },
      { who: 'Don Wili', text: 'With my emoliente after, of course. One vice, one cure. The cart provides balance, pe.' },
    ],
    effects: ['set:c2.wili2', 'journal:dishes.chicharron'],
  },
  'mar.wili.idle': {
    lines: [
      { who: 'Don Wili', text: 'The garúa is good for business. Nobody refuses a hot glass inside a cloud.' },
    ],
  },

  // ---------------- Capitana Ríos, the barrier ----------------
  'mar.rios.first': {
    lines: [
      { text: 'At the pier’s end, a cargo ship’s launch is tied up. A woman in a salt-white cap checks a clipboard like it owes her money.' },
      { who: 'Capitana Ríos', text: 'No passengers. Working hands only, and I have a full crew. Mostly full. The galley is a diplomatic crisis.' },
      { who: 'Capitana Ríos', text: 'You want across the water, make this village vouch for you. A ship is a village too, just one that can sink.' },
    ],
    effects: ['set:met.rios', 'journal:people.rios'],
  },
  'mar.rios.not': {
    lines: [
      { who: 'Capitana Ríos', text: 'Still a stranger here, still a stranger to me. Be someone’s casero. Learn what la mar carries. Then we talk.' },
    ],
  },
  'mar.rios.yes': {
    lines: [
      { who: 'Capitana Ríos', text: 'So. Petro says your hands are clean, Marisol calls you casero, and Félix says a wave carried you and gave you back.' },
      { who: 'Capitana Ríos', text: 'They say a woman aboard is bad luck. I have crossed this ocean ninety times. The luck seems fine to me.' },
      { who: 'Capitana Ríos', text: 'Galley hand. We sail when the tide and the paperwork agree, which is never, so: soon. Go say your goodbyes.' },
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
      { text: 'At the west end of the malecón: llamas. Actual llamas, regarding the Pacific with deep reservation, panniers full of chuño.' },
      { who: 'Faustino', text: 'The soup-eater! Ha! The mountain misses you already, it said so. I brought the llamas down to check.' },
      { who: 'Faustino', text: 'Chuño and wool walk down, dried fish and salt walk up. My family has run this stair since before Peru had the name.' },
    ],
    effects: ['set:c2.faus.met'],
  },
  'mar.faustino.quiz': {
    lines: [
      { who: 'Faustino', text: 'Now, a bet. I say the coast has already washed the mountain out of you. Prove me wrong and I owe you a story.' },
      { who: 'Faustino', text: 'One thing the road up there taught you. Anything. The llamas are listening and they hate a liar.' },
    ],
    choices: [
      {
        text: '"The apacheta: you add a stone and leave a worry."',
        goto: 'mar.faustino.qStone',
        when: { has: ['page.customs.apacheta'] },
      },
      {
        text: '"Paca only moves for your whistle."',
        goto: 'mar.faustino.qPaca',
        when: { has: ['page.people.faustino'] },
      },
      { text: '"Honestly, it is all a blur of altitude."', goto: 'mar.faustino.blur' },
    ],
  },
  'mar.faustino.qStone': {
    lines: [
      { who: 'Faustino', text: 'Ayayay. The cairn at the pass. You set your stone on fifty years of strangers and walked down lighter.' },
      { who: 'Faustino', text: 'I lose, and losing to that answer is a pleasure. Your story: the pile is taller than my grandfather knew it. It grows on worries.' },
    ],
    effects: ['set:c2.faus.quiz'],
  },
  'mar.faustino.qPaca': {
    lines: [
      { who: 'Faustino', text: 'HA! One short, one long. She heard it from here, I promise you. Her ears are the best-fed part of her.' },
      { who: 'Faustino', text: 'I lose, gladly. Your story: Paca inherited that spot on the pass from her mother, who was worse. A dynasty of standing still.' },
    ],
    effects: ['set:c2.faus.quiz'],
  },
  'mar.faustino.blur': {
    lines: [
      { who: 'Faustino', text: 'Correct! That is exactly what the puna is. Thin air, thick sky, and the road doing your thinking for you.' },
      { who: 'Faustino', text: 'For the record, the blur contains: an apacheta, a stone pile where travelers each leave a worry, and my Paca, who moves for one whistle. Mine.' },
    ],
    effects: ['set:c2.faus.quiz'],
  },
  'mar.faustino.news': {
    lines: [
      { who: 'Faustino', text: 'News from up top, since you are owed some. Rosa invented a soup she claims is for winter. It is for missing you; anyone can see.' },
      { who: 'Faustino', text: 'And the dog crosses the bridge free now, both directions. Official business, Pilar says. The toll economy is in a golden age.' },
    ],
    effects: ['set:c2.faus.news'],
  },
  'mar.faustino.idle': {
    lines: [
      { who: 'Faustino', text: 'Two days to sell, one to drink the sea with my eyes, then up again before the llamas learn to like fish. A road is ayni with distance.' },
    ],
  },
  'mar.llama.train': {
    lines: [
      { text: 'A pack llama of the train, unloaded and unimpressed. The panniers smell of chuño; the llama smells of the whole road down.' },
      { text: 'It looks at the sea, then at you, then back at the sea, filing the entire ocean under: excessive.' },
    ],
  },

  // ---------------- Chasca, on the pier ----------------
  'mar.chasca.pier': {
    lines: [
      { who: 'Chasca', text: 'The soup-eater from Ch’aska Pampa! You DID take the road. I hoped the mountain would let you go.' },
      { who: 'Chasca', text: 'Stand there, pier behind you, horses of reed on end. The album needs you where the land runs out. Say fuzzy pickles!' },
    ],
    effects: ['set:met.chascaC', 'set:photo.flash', 'set:photo.c2.pier'],
  },
  'mar.chasca.album': {
    lines: [
      { who: 'Chasca', text: 'Two photographs of you now: one in the star plain, one at the sea’s edge. The album is becoming a road.' },
      { who: 'Chasca', text: 'I develop them all at the end of the journey. Whose journey? Mine, yours. The album has not decided yet.' },
    ],
  },

  // ---------------- the tidepool and the mail ----------------
  'mar.tidepool': {
    lines: [
      { text: 'A tidepool, low and glassy. Inside: a dried puffer fish puffed forever, a sea star missing one arm, a crab claw like a comma.' },
      { text: 'Somewhere in the mountains, a bridge magnate is owed something weird from the sea.' },
    ],
    choices: [
      { text: 'The permanently astonished puffer fish', goto: 'mar.gift.puffer' },
      { text: 'The four-armed sea star', goto: 'mar.gift.star' },
      { text: 'The punctuation crab claw', goto: 'mar.gift.claw' },
    ],
  },
  'mar.gift.puffer': {
    lines: [{ text: 'The puffer fish it is. It looks exactly how Pilar sounds. The harbor office can post a box this weird, surely.' }],
    effects: ['set:c2.gift', 'set:pilar.gift.puffer'],
  },
  'mar.gift.star': {
    lines: [{ text: 'The sea star it is. Four arms: proof the sea also does things approximately. The harbor office can post it.' }],
    effects: ['set:c2.gift', 'set:pilar.gift.star'],
  },
  'mar.gift.claw': {
    lines: [{ text: 'The claw it is. A comma from the sea’s own sentence. The harbor office will have a box small enough.' }],
    effects: ['set:c2.gift', 'set:pilar.gift.claw'],
  },
  'mar.post.send': {
    lines: [
      { text: 'The harbor office window is one plank and one stamp. The clerk weighs the strange little box without comment.' },
      { text: 'Address: Pilar. Bridge Authority. Ch’aska Pampa, up the mountain, mind the toll. The clerk nods; the address is complete.' },
      { text: 'And there is mail waiting for you, held under a tin of pins: a letter in handwriting like an invoice.' },
    ],
    effects: ['set:c2.gift.sent', 'letter:home.pilar'],
  },
  'mar.post.aurelio': {
    lines: [
      { text: 'The clerk holds up one finger, digs under the counter, and produces a second envelope, soft with re-reading weather.' },
    ],
    effects: ['letter:home.aurelio'],
  },
  'mar.post.idle': {
    lines: [
      { text: 'HARBOR OFFICE. Window closed for lunch. The sign does not say which lunch, or whose, or of which year.' },
    ],
  },

  // ---------------- examines, coastal ----------------
  'mar.ex.sand': { lines: [{ text: 'Sand the color of old paper. The desert walks right down to the water here; they have an arrangement.' }] },
  'mar.ex.wet': { lines: [{ text: 'The wet apron of the beach. Every seventh wave reaches further, like it is checking on you.' }] },
  'mar.ex.pier': { lines: [{ text: 'Old sugar-trade planks, grey and salt-cured. They creak in a language of their own.' }] },
  'mar.ex.casa': { lines: [{ text: 'Cane and mud under the paint, rebar hoping on the roof. Every house here is a plan for a bigger house.' }] },
  'mar.ex.net': { lines: [{ text: 'A gillnet drying, corks like beads. Each mended knot is a different evening of talk.' }] },
  'mar.ex.netmended': {
    lines: [{ text: 'Last evening’s net, spread to dry with its new knots pale in the old mesh. The circle will find it more holes by tonight.' }],
  },
  'mar.ex.crate': { lines: [{ text: 'Fish crates, silver tails over the rim. The pelicans study them with the patience of professionals.' }] },
  'mar.ex.caballito': {
    lines: [{ text: 'Reed horses stood on their tails to drain overnight. Born wet, retired in weeks, remembered for three thousand years.' }],
  },
  'mar.ex.caballito2': {
    lines: [{ text: 'Reed horses draining on their tails. One stands a shade darker than the rest, wet to the waterline, and you know exactly which ride that was.' }],
  },
  'mar.ex.boat': { lines: [{ text: 'A wooden chalana, paint peeling into the exact colors of the sky arguing with itself.' }] },
  'mar.ex.reeds': { lines: [{ text: 'Totora, green as a promise, growing where someone’s grandfather dug down to the water table.' }] },
  'mar.ex.pelican': { lines: [{ text: 'The pelican does not move. The pelican was here before you, and will outlast your opinion of it.' }] },
  'mar.ex.emoliente': { lines: [{ text: 'Glass jars of amber and violet, steaming faintly. A small lighthouse for cold hands.' }] },
  'mar.ex.sign': {
    lines: [{ text: 'LA CALETA, the sign says, and under it, smaller: NO HAY HORARIO. TODO DEPENDE DEL MAR. Someone crossed out EL and wrote LA.' }],
  },
  'mar.ex.sea': {
    lines: [
      { text: 'Grey-green and cold and absolutely full of intent. It is easy to see why the ones who work her say la mar.' },
    ],
  },
  'mar.ex.path2': { lines: [{ text: 'Hard-packed sand, swept by wind and brooms in unequal shifts.' }] },
  'mar.ex.plaza2': { lines: [{ text: 'The malecón. In the evening the whole village walks it end to end, slowly, for no reason except every reason.' }] },
  'mar.ex.pond': { lines: [{ text: 'Pond water the color of green glass. Reeds stand in it like a crowd waiting for news.' }] },
  'mar.ex.pond2': {
    lines: [{ text: 'Dug by hands that are gone, tended by hands that are here. The pond outlives every digger; that is the arrangement.' }],
  },
  'mar.ex.tuft2': { lines: [{ text: 'Dry dune grass, hanging on. Everything that lives here has decided to, firmly.' }] },
  'mar.pier.locked': {
    lines: [
      { text: 'The gangway to the launch, and beyond it, riding at anchor, a cargo ship the size of a small opinionated island.' },
      { text: 'The captain’s eyes find you before your foot finds the plank. Not yet, the eyes say. Earn the village first.' },
    ],
  },
  'mar.pier.next': {
    lines: [
      { text: 'THE CROSSING. Cargo, crew of twenty-three, one borrowed galley hand. The Pacific is wider than the whole story so far.' },
      { text: 'Chapter Three is being provisioned. The tide will say when.' },
    ],
  },

  // ---------------- the love layer: background things, each with a voice ----------------
  'mar.ex.seaweed': {
    lines: [{ text: 'Yuyo the tide tore loose, drying into dark ribbons. At noon it will be under someone’s ceviche; for now it is the sea’s laundry.' }],
  },
  'mar.ex.jelly': {
    lines: [{ text: 'A jellyfish the tide forgot, clear as a spilled dessert. You consider poking it, and decline with honor.' }],
    effects: ['set:c2.seen.jelly'],
  },
  'mar.ex.jelly2': {
    lines: [{ text: 'Still there. Still ninety percent sea and ten percent bad idea; the next tide can have it back.' }],
  },
  'mar.ex.shellbarrow': {
    lines: [{ text: 'A wheelbarrow heaped with concha shells from Petro’s kitchen. They will pave something someday, she says, and the barrow keeps waiting.' }],
  },
  'mar.ex.emolcrate': {
    lines: [{ text: 'Don Wili’s spare bottles, green and amber, straw between them. One has no label; that one, he says, is for the cold in the bones.' }],
  },
  'mar.ex.gato.pic': {
    lines: [{ text: 'The picantería cat, asleep at the warm end of the room. Petro calls it a bad cat, and the full bowl by the qoncha is also Petro’s.' }],
  },
  'mar.ex.chomba.pic': {
    lines: [
      { text: 'A chicha jar as tall as a child, brought down from the sierra by a cousin and never sent back up. It sweats in the corner all afternoon.' },
      { text: 'Petro serves from it on Sundays only, in a glass that is also older than the arrangement.' },
    ],
  },
  'mar.ex.crabtraps.pic': {
    lines: [{ text: 'Traps stacked indoors for the winter, out of the salt. Three seasons of repairs on them, all of them somebody else’s knots.' }],
  },
  'mar.ex.bidones.pic': {
    lines: [{ text: 'Drums at the head of the long table, holding water, oil and one that holds nothing and gets sat on when the room is full.' }],
  },
  'mar.ex.picchairs.pic': {
    lines: [{ text: 'The chair stack lives inside the door so it can go out fast. By one o’clock every one of these is on the sand with somebody in it.' }],
  },
  'mar.ex.gato': {
    lines: [{ text: 'A cat asleep exactly where the fish smell is best. It did nothing to earn this spot except be a cat, which was plenty.' }],
  },
  'mar.ex.driftbench': {
    lines: [{ text: 'A bench built from what the sea returned: two planks, one pallet, somebody’s old blue paint. Naturally, it faces the water.' }],
  },
  'mar.ex.limebasket': {
    lines: [{ text: 'Limones, small and mean and perfect. Their whole job takes under a minute, and they do it like a verdict.' }],
  },
  'mar.ex.laradio': {
    lines: [{ text: 'An old radio playing cumbia to the empty stools, quietly. Nobody remembers buying it and nobody would dare turn it off.' }],
  },
  'mar.ex.saltrack': {
    lines: [{ text: 'Lisa split and salted, going stiff and golden in the fog. The gallinazos keep a respectful distance of exactly one lunge.' }],
  },
  'mar.ex.dryreeds': {
    lines: [{ text: 'Totora cut green from the ponds, standing up to dry. In fifteen days it will be a horse; for now it is very patient grass.' }],
  },
  'mar.ex.dryreeds2': {
    lines: [{ text: 'Félix claims he can tell which pond a bundle came from by the smell. Nobody has ever caught him wrong, which proves nothing, pe.' }],
  },
  'mar.ex.netpoles': {
    lines: [{ text: 'Gillnets hung between poles to dry, corks ticking in the wind. Tonight they will be checked knot by knot, like every night.' }],
  },
  'mar.ex.netpoles2': {
    lines: [{ text: 'Somewhere in this mesh are the knots you tied with Don Simón. The net keeps them anonymous, the way la mar prefers.' }],
  },
  'mar.ex.crabtraps': {
    lines: [{ text: 'Crab traps stacked in a tower that leans like it has somewhere to be. The crabs know the whole design and come anyway.' }],
  },
  'mar.ex.picchairs': {
    lines: [{ text: 'Plastic chairs stacked seven high, sun-faded from red to a loyal pink. At noon they scatter, and every single one is taken.' }],
  },
  'mar.ex.buoywall': {
    lines: [{ text: 'Retired buoys hung on nails, sorted by nobody. Each one held a line once; each owner still swears he could tell you which.' }],
  },
  'mar.ex.kidmural': {
    lines: [{ text: 'The school kids painted la mar, and she came out purple with a whale in it. Nobody here has seen a whale, and nobody will paint over it.' }],
  },
  'mar.ex.pelicanpost': {
    lines: [{ text: 'A mooring post from the sugar days, now a full-time pelican office. Current occupant: present, upright, unimpressed.' }],
  },
  'mar.ex.galli': {
    lines: [{ text: 'Gallinazos in a row, black as spilled ink, supervising the beach. Nothing has died; they wait anyway, professionally.' }],
    effects: ['set:c2.seen.galli'],
  },
  'mar.ex.galli2': {
    lines: [{ text: 'One has shuffled half a step closer to the fish racks. The others pretend not to notice, which is how you know they noticed.' }],
  },
  'mar.ex.mototaxi': {
    lines: [{ text: 'A mototaxi parked at an angle only its owner could love. The mudflap says GRACIAS A DIOS; the engine, for now, says nothing.' }],
  },
  'mar.ex.pizarra': {
    lines: [{ text: 'The chalkboard says HOY: LO QUE DIGA LA MAR. Under it, in ghost chalk, the faded ancestors of every dish this week ever was.' }],
  },
  'mar.ex.tendal': {
    lines: [
      { text: 'A blue tarpaulin lashed to four poles over the cleaning table. Everything under it goes the color of a swimming pool, including you.' },
      { text: 'The shade is the whole village\'s, technically. In practice it belongs to whoever got here with fish first.' },
    ],
  },
  'mar.ex.bidones': {
    lines: [
      { text: 'Drums and fish boxes stacked against the wall, repainted every few years in whatever the boats had left over.' },
      { text: 'Blue, yellow, a red that used to be a bow. Nothing here has ever been thrown away, only relocated.' },
    ],
  },
  'mar.ex.pintura': {
    lines: [
      { text: 'A hull up on trestles, keel to the sky, half of it still salt-grey and half of it turquoise. The wet edge stops mid-stroke.' },
      { text: 'The tins are open and the brush is lying across one of them. Somebody was called away, and the sea is patient about this.' },
    ],
  },
  'mar.ex.pintura2': {
    lines: [
      { text: 'Another hand\'s width of turquoise since yesterday. It gets finished the way everything here gets finished: eventually, and beautifully.' },
    ],
  },
  'mar.ex.wallquincha': {
    lines: [
      { text: 'Cane and mud under salt-faded cream, and a band of sea blue up to your waist because that is the part that gets scrubbed.' },
      { text: 'Everything above the blue line is the wall. Everything below it is the argument the wall has been having with the ocean.' },
    ],
  },
  'mar.ex.floorcemento': {
    lines: [
      { text: 'Cement, poured once, mopped twice a day for forty years. The red oxide underneath has come back through where the chairs go.' },
      { text: 'You could map the busiest table in the room without ever seeing anyone sit at it.' },
    ],
  },
};

/** Coastal examine arms; map-tagged so shared props keep their Andes words at home. */
export const CALETA_EXAMINES: Record<string, ExamineArm[]> = {
  blocked: [{ map: 'la-caleta', node: 'mar.ex.wall' }, { map: 'picanteria', node: 'mar.ex.wall' }],
  // The picantería's shell is skinned to the chapter's own quincha and
  // cement (`art/sets/caleta.ts`), so it gets the chapter's own words too.
  wallInt: [{ map: 'picanteria', node: 'mar.ex.wallquincha' }],
  floorEarth: [{ map: 'picanteria', node: 'mar.ex.floorcemento' }],
  sand: [{ node: 'mar.ex.sand' }],
  sandWet: [
    { when: { has: ['pilar.sea'], not: ['c2.gift'] }, node: 'mar.tidepool' },
    { node: 'mar.ex.wet' },
  ],
  pierdeck: [{ node: 'mar.ex.pier' }],
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
