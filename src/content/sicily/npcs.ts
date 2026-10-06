import type { EventNode, ExamineArm, NodeMap, NpcDef } from '../schema';

/**
 * The town's people. Italian for strangers and officialdom, Sicilian for
 * feeling: amuni, bedda, talia, picciriddu. Rules unchanged since the Andes:
 * nobody lectures, people disagree, the wrong branch is the warmer scene,
 * two short sentences. No mafia, no mainland bleed, dialect is never a joke.
 */

export const SICILY_NPCS: NpcDef[] = [
  {
    id: 'concetta',
    name: 'Nonna Concetta',
    map: 'sicily',
    pos: [17, 9],
    range: 1,
    look: {
      skin: '#c08a5c',
      hair: '#cfc8ba',
      cloth: '#3a3d4d',
      stripe: '#f2e6d0',
      hat: '#e8dcc4',
      hatStyle: 'none',
      skirt: '#2e3140',
    },
    entry: [
      { when: { not: ['met.concetta'] }, node: 'c8.concetta.first' },
      { when: { has: ['errand.turi-pisci'], not: ['c8.fish.delivered'] }, node: 'c8.concetta.fish' },
      { when: { has: ['c8.pranzo.invite'], not: ['c8.pranzo'] }, node: 'c8.concetta.pranzo' },
      {
        when: { has: ['c8.pranzo', 'c8.scopa.won', 'c8.pisci.won'], not: ['c8.walk.done'] },
        node: 'c8.concetta.walk',
      },
      // Water the Moor's basil and her next hello is a silent promotion.
      { when: { has: ['egg.c8.basil'], not: ['egg.c8.basil.nod'] }, node: 'c8.egg.concetta' },
      { when: { has: ['c8.walk.done'] }, node: 'c8.concetta.after' },
      { node: 'c8.concetta.idle' },
    ],
  },
  {
    id: 'turi',
    name: 'Turi',
    map: 'sicily',
    pos: [31, 18],
    range: 0,
    look: {
      skin: '#b97f52',
      hair: '#241a12',
      cloth: '#4a6d8c',
      stripe: '#e8dcc4',
      hat: '#e8dcc4',
      hatStyle: 'none',
    },
    entry: [
      { when: { not: ['met.turi'] }, node: 'c8.turi.first' },
      { when: { has: ['met.turi'], not: ['c8.haggle'] }, node: 'c8.turi.haggle' },
      { when: { has: ['c8.haggle'], not: ['c8.fish.taken'] }, node: 'c8.turi.errand' },
      { when: { has: ['c8.fish.taken'], not: ['c8.fish.delivered'] }, node: 'c8.turi.carry' },
      { node: 'c8.turi.idle' },
    ],
  },
  {
    id: 'alfio',
    name: 'Alfio',
    map: 'sicily',
    pos: [12, 16],
    range: 1,
    look: {
      skin: '#a06a42',
      hair: '#2e2018',
      cloth: '#f2e6d0',
      stripe: '#3a5f8a',
      hat: '#e8dcc4',
      hatStyle: 'none',
    },
    entry: [
      { when: { not: ['met.alfio'] }, node: 'c8.alfio.first' },
      { when: { has: ['c8.granita'], not: ['c8.arancino'] }, node: 'c8.alfio.lunch' },
      { when: { has: ['c8.arancino'], not: ['c8.cannolo'] }, node: 'c8.alfio.cannolo' },
      { when: { has: ['page.dishes.cannolo'], not: ['c8.cook.done'] }, node: 'c8.alfio.bag' },
      // Told to whoever has stood on his side of the counter. The pranzo is
      // in the gate too, so the page of hers that stops mid sentence is
      // already in the player's hands when he says this and shrugs it off.
      { when: { has: ['c8.cook.done', 'c8.pranzo'], not: ['c8.alfio.her'] }, node: 'c8.alfio.her' },
      { when: { has: ['c8.cook.done'] }, node: 'c8.alfio.again' },
      { node: 'c8.alfio.idle' },
    ],
  },
  {
    id: 'c8elders',
    name: 'The Elders',
    map: 'circolo',
    pos: [3, 4],
    range: 0,
    look: {
      skin: '#8f5c38',
      hair: '#cfc8ba',
      cloth: '#5c6e77',
      stripe: '#c9a35f',
      hat: '#4a4038',
      hatStyle: 'none',
    },
    entry: [
      { when: { not: ['met.elders'] }, node: 'c8.elders.first' },
      { when: { has: ['met.elders', 'c8.pranzo'], not: ['c8.scopa.won'] }, node: 'c8.elders.wave' },
      { when: { has: ['met.elders'], not: ['c8.pranzo'] }, node: 'c8.elders.notyet' },
      { when: { has: ['c8.scopa.won'], not: ['c8.elders.after'] }, node: 'c8.elders.post' },
      { when: { has: ['c8.scopa.won'] }, node: 'c8.elders.again' },
      { node: 'c8.elders.idle' },
    ],
  },
  {
    id: 'mimmo',
    name: 'Mimmo',
    map: 'circolo',
    pos: [10, 4],
    range: 0,
    look: {
      skin: '#a06a42',
      hair: '#6b655c',
      cloth: '#3f4a3d',
      stripe: '#8c8479',
      hat: '#e8dcc4',
      hatStyle: 'none',
    },
    entry: [{ node: 'c8.mimmo.idle' }],
  },
  {
    id: 'donsaro',
    name: 'Don Saro',
    map: 'sicily',
    pos: [20, 8],
    range: 1,
    look: {
      skin: '#b97f52',
      hair: '#4a4038',
      cloth: '#2b2b33',
      stripe: '#f2e6d0',
      hat: '#2b2b33',
      hatStyle: 'none',
    },
    entry: [
      { when: { not: ['met.saro'] }, node: 'c8.saro.first' },
      { when: { has: ['met.saro', 'c8.pranzo'], not: ['c8.pisci.won'] }, node: 'c8.saro.recruit' },
      { when: { has: ['c8.pisci.won'], not: ['c8.saro.blessed'] }, node: 'c8.saro.post' },
      { when: { has: ['c8.pisci.won'] }, node: 'c8.saro.again' },
      { node: 'c8.saro.idle' },
    ],
  },
  {
    // Mending his net on the mole's north row, so the row you land on stays
    // open all the way ashore. The mole is two tiles wide: he stays put.
    id: 'nino',
    name: 'Nino',
    map: 'sicily',
    pos: [38, 19],
    range: 0,
    look: {
      skin: '#b97f52',
      hair: '#1c1410',
      cloth: '#c1512f',
      stripe: '#2c3e57',
      hat: '#e8dcc4',
      hatStyle: 'none',
    },
    entry: [
      { when: { not: ['met.nino'] }, node: 'c8.nino.first' },
      { when: { has: ['met.nino', 'c8.circolo.watch'], not: ['c8.nino.talk'] }, node: 'c8.nino.argument' },
      { when: { has: ['c8.nino.talk'], not: ['c8.pisci.won'] }, node: 'c8.nino.rowing' },
      { node: 'c8.nino.idle' },
    ],
  },
  {
    id: 'rosaria',
    name: 'Rosaria',
    map: 'sicily',
    pos: [4, 12],
    range: 1,
    look: {
      skin: '#c08a5c',
      hair: '#4a4038',
      cloth: '#7d9b3f',
      stripe: '#f2e6d0',
      hat: '#d0b276',
      hatStyle: 'none',
      skirt: '#8a5330',
    },
    entry: [
      { when: { not: ['met.rosaria'] }, node: 'c8.rosaria.first' },
      { when: { has: ['met.rosaria'], not: ['c8.cunzato'] }, node: 'c8.rosaria.bread' },
      { node: 'c8.rosaria.idle' },
    ],
  },
  {
    // Ashore while the Yacana works her Mediterranean leg. Cooks come ashore
    // at provisioning stops, and cooks ashore go where the fish are honest.
    id: 'mangbenC8',
    name: 'Mang Ben',
    map: 'sicily',
    when: { has: ['c8.arrived'], not: ['c8.complete'] },
    pos: [29, 16],
    range: 1,
    look: {
      skin: '#a06a42',
      hair: '#3d362e',
      cloth: '#e8e4d6',
      stripe: '#c1512f',
      hat: '#e8dcc4',
      hatStyle: 'none',
    },
    entry: [
      { when: { not: ['c8.ben.met'] }, node: 'c8.ben.hello' },
      { when: { has: ['c8.ben.met'], not: ['c8.ben.tin'] }, node: 'c8.ben.anchovies' },
      { node: 'c8.ben.idle' },
    ],
  },
  {
    id: 'chascaC8',
    name: 'Chasca',
    map: 'sicily',
    pos: [34, 16],
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
      { when: { not: ['met.chascaC8'] }, node: 'c8.chasca.stones' },
      { node: 'c8.chasca.album' },
    ],
  },
  {
    // The folding table is at the mole's very end, in the corner, where it
    // leaves both rows of the walk clear behind him.
    id: 'patane',
    name: 'Signor Patanè',
    map: 'sicily',
    pos: [42, 19],
    range: 0,
    look: {
      skin: '#a06a42',
      hair: '#6b655c',
      cloth: '#8ba3b5',
      stripe: '#2c3e57',
      hat: '#e8dcc4',
      hatStyle: 'montera',
    },
    entry: [
      { when: { not: ['met.patane'] }, node: 'c8.patane.first' },
      {
        when: {
          has: ['met.patane', 'c8.pranzo', 'c8.scopa.won', 'c8.pisci.won', 'c8.walk.done'],
          not: ['c8.complete'],
        },
        node: 'c8.patane.yes',
      },
      { when: { has: ['c8.complete'] }, node: 'c8.patane.board' },
      { node: 'c8.patane.not' },
    ],
  },
];

export const SICILY_NODES: NodeMap = {
  // The walls themselves; without this arm they fall through to the
  // village's adobe line, which reads strangely far from the altiplano.
  'c8.ex.wall': {
    lines: [{ text: 'Golden limestone, warm past midnight. Look closely and the grain shows shells.' }],
  },
  // ---------------- arrival ----------------
  'c8.arrive': {
    lines: [
      { text: 'The ship noses past two black stone towers in the sea. The heat reaches you before the gangway does.' },
      { text: 'A grey mountain smokes above the lemon terraces. A bell counts eleven; a voice sings about fish.' },
    ],
    effects: ['set:c8.arrived'],
  },

  // ---------------- Nonna Concetta ----------------
  'c8.concetta.first': {
    lines: [
      { who: 'Nonna Concetta', text: 'Talìa, a new face. Thin, too. Hold this.' },
      { text: 'She puts a heel of bread in your hand, still warm, as if you had asked. You had not.' },
      { who: 'Nonna Concetta', text: 'Eat, bedda. Nobody stands in my sun with empty hands.' },
    ],
    effects: ['set:met.concetta', 'journal:people.concetta', 'journal:words.bedda'],
  },
  'c8.concetta.fish': {
    lines: [
      { who: 'Nonna Concetta', text: 'My swordfish! Turi kept the belly cut for me, the thief, the angel.' },
      { who: 'Nonna Concetta', text: 'Sunday you eat at my table. This is not an invitation, bedda, it is a schedule.' },
    ],
    effects: [
      'errand.done',
      'clear:errand.turi-pisci',
      'set:c8.fish.delivered',
      'set:c8.pranzo.invite',
    ],
  },
  // The pranzo is served, not recited: each course lands as one beat and the
  // player eats it. The dish page fills when the Norma arrives.
  'c8.concetta.pranzo': {
    lines: [
      { text: 'Sunday. The table has grown two leaves and a church bench. Cousins appear like weather.' },
      { who: 'Nonna Concetta', text: 'Sit. You are new, so you are family. That is the arithmetic.' },
    ],
    next: 'c8.pranzo.antipasti',
  },
  'c8.pranzo.antipasti': {
    lines: [{ text: 'Olives, caponata, anchovies. A plate arrives at your elbow before you have finished sitting.' }],
    choices: [{ text: 'Eat', goto: 'c8.pranzo.primo' }],
  },
  'c8.pranzo.primo': {
    lines: [
      { text: 'The antipasti vanish in one lap. Then the Norma lands, eggplant under snow, and the talk drops by half.' },
      { who: 'Nonna Concetta', text: 'Pasta alla Norma, bedda. Eat it while it is a masterpiece.' },
    ],
    effects: ['journal:dishes.norma'],
    choices: [
      { text: 'Eat, and pass the plates', goto: 'c8.pranzo.listen' },
      {
        text: 'Let her see the woven band on your wrist',
        goto: 'c8.pranzo.band',
        when: { has: ['keepsake.band'] },
      },
      { text: 'Try to refuse a second helping', goto: 'c8.pranzo.refuse' },
    ],
  },
  'c8.pranzo.listen': {
    lines: [
      { text: 'An aunt argues football with an uncle; both are enjoying losing.' },
      { who: 'Nonna Concetta', text: 'Cu mancia fa muddichi. Who eats makes crumbs. Make yours at my table.' },
    ],
    next: 'c8.pranzo.end',
  },
  'c8.pranzo.band': {
    lines: [
      { who: 'Nonna Concetta', text: 'That wool on your wrist. A grandmother tied that, or someone doing a grandmother’s work.' },
      { who: 'Nonna Concetta', text: 'So you are already fed from far away. Good. Eat anyway.' },
    ],
    next: 'c8.pranzo.end',
  },
  'c8.pranzo.refuse': {
    lines: [
      { who: 'Nonna Concetta', text: 'No? NO? Bedda, look at your arms. A gull could carry you off.' },
      { text: 'Diplomacy fails in four languages. The second helping lands.' },
    ],
    choices: [
      { text: 'Eat the second helping', goto: 'c8.pranzo.eat2' },
      { text: 'Push the plate one inch away', goto: 'c8.pranzo.push' },
    ],
  },
  'c8.pranzo.eat2': {
    lines: [{ text: 'You eat it. It is, infuriatingly, even better than the first.' }],
    next: 'c8.pranzo.end',
  },
  'c8.pranzo.push': {
    lines: [{ text: 'The plate returns two inches. Physics at this table answers to Concetta.' }],
    next: 'c8.pranzo.end',
  },
  'c8.pranzo.end': {
    lines: [
      { text: 'Fruit, coffee, a sweet. The pranzo does not end; it widens.' },
      { who: 'Nonna Concetta', text: 'Sunday is a roll call, picciriddu. Everyone answers, even the dead, even the ones in Torino.' },
      { text: 'Later, Nani’s entry on this page stops mid-sentence. The rest is just paper.' },
    ],
    effects: ['set:c8.pranzo', 'journal:customs.pranzo', 'journal:words.picciriddu'],
  },
  'c8.concetta.walk': {
    lines: [
      { who: 'Nonna Concetta', text: 'The light is going soft. Nothing else may happen today.' },
      { who: 'Nonna Concetta', text: 'Amunì, bedda. We walk.' },
    ],
    effects: ['journal:words.amuni'],
    choices: [
      { text: 'Walk with her', goto: 'c8.walk.go' },
      { text: 'Ask where you are walking to', goto: 'c8.walk.nowhere' },
      { text: 'Not this evening', goto: 'c8.walk.later' },
    ],
  },
  'c8.walk.nowhere': {
    lines: [
      { who: 'Nonna Concetta', text: 'To? Nowhere, bedda. You walk slow, greet everyone, and arrive back where you started, richer.' },
    ],
    choices: [
      { text: 'Walk with her', goto: 'c8.walk.go' },
      { text: 'Not this evening', goto: 'c8.walk.later' },
    ],
  },
  'c8.walk.later': {
    lines: [
      { who: 'Nonna Concetta', text: 'Tomorrow the sun sets again, they tell me. I will be here. So will the whole town, walking.' },
    ],
  },
  'c8.walk.go': {
    lines: [
      { text: 'The town comes out when the stones stop burning, dressed nicer than the errand requires.' },
      { text: 'Nods, gossip, a newborn admired like a moonrise, at the speed of talk.' },
    ],
    choices: [
      {
        text: '"In Zanzibar they taught me this pace. Pole pole."',
        goto: 'c8.walk.polepole',
        when: { has: ['page.words.polepole'] },
      },
      { text: 'Match her pace and say nothing', goto: 'c8.walk.match' },
    ],
  },
  'c8.walk.polepole': {
    lines: [
      { who: 'Nonna Concetta', text: 'Pole pole. Ha! A whole coast on the far side of the world, walking correctly.' },
      { who: 'Nonna Concetta', text: 'Everywhere worth living, bedda, somebody invented this exact evening.' },
    ],
    next: 'c8.walk.end',
  },
  'c8.walk.match': {
    lines: [
      { text: 'You slow down until slow stops being an effort. By the third lap it is the only sensible speed.' },
      { who: 'Nonna Concetta', text: 'There. You are in it now.' },
    ],
    next: 'c8.walk.end',
  },
  'c8.walk.end': {
    lines: [
      { text: 'The lamps take over. Three laps, no destination, and the whole town has said goodnight by name.' },
    ],
    effects: ['set:c8.walk.done', 'journal:customs.passeggiata'],
  },
  'c8.concetta.after': {
    lines: [
      { who: 'Nonna Concetta', text: 'You walked properly and you ate properly. When you sail, there will be something in paper. Do not argue with it.' },
    ],
  },
  'c8.concetta.idle': {
    lines: [{ who: 'Nonna Concetta', text: 'Stand in the shade at least, bedda. The sun here does not joke after ten.' }],
  },

  // ---------------- Turi, the fish vendor ----------------
  'c8.turi.first': {
    lines: [
      { who: 'Turi', text: 'PISCISPADA piscispada piscispadaaaa! TALÌA talìa talìa, vivu vivu VIVUUU!' },
      { who: 'Turi', text: 'My father’s tune. Every stall sings its own; you could shop with your eyes shut.' },
    ],
    effects: ['set:met.turi', 'journal:people.turi', 'journal:words.talia'],
  },
  'c8.turi.haggle': {
    lines: [
      { text: 'A signora holds up a swordfish steak like evidence. Turi clutches his chest.' },
      { who: 'Turi', text: 'Signora, at that price I row out and apologize to the fish personally!' },
      { text: 'They meet in the middle and shake like old dance partners. The crowd applauds.' },
    ],
    effects: ['set:c8.haggle', 'journal:customs.abbanniata'],
  },
  'c8.turi.errand': {
    lines: [
      { who: 'Turi', text: 'You have working legs and an honest face. This is Nonna Concetta’s belly cut, set aside since dawn.' },
      { who: 'Turi', text: 'Church steps. Walk it over before the sun argues with the ice.' },
    ],
    effects: ['errand:turi-pisci', 'set:errand.turi-pisci', 'set:c8.fish.taken'],
  },
  'c8.turi.carry': {
    lines: [{ who: 'Turi', text: 'Still holding my fish? The ice is losing, friend. Church steps, amunì.' }],
  },
  'c8.turi.idle': {
    lines: [{ who: 'Turi', text: 'Tomorrow, who knows. The sea writes the menu and I just sing what she wrote.' }],
  },

  // ---------------- Alfio, the granita bar ----------------
  'c8.alfio.first': {
    lines: [
      { text: 'The bar owns the shade. Behind glass: lemon, almond, coffee, something dark purple with intentions.' },
      { who: 'Alfio', text: 'Buongiorno! Sit, sit. What can I make you?' },
    ],
    effects: ['set:met.alfio', 'journal:people.alfio'],
    choices: [
      { text: 'Order a cappuccino', goto: 'c8.alfio.cappuccino' },
      { text: 'Ask what one has for breakfast here', goto: 'c8.alfio.doctrine' },
    ],
  },
  'c8.alfio.cappuccino': {
    lines: [
      { text: 'Alfio looks at you the way you look at someone in the rain holding a closed umbrella.' },
      { who: 'Alfio', text: 'Friend, it is July. Hot milk? Have a granita. Not dessert: breakfast. The law of the coast.' },
    ],
    choices: [
      { text: 'Surrender to the granita', goto: 'c8.alfio.surrender' },
      { text: 'Hold out for the cappuccino', goto: 'c8.alfio.insist' },
    ],
  },
  'c8.alfio.surrender': {
    lines: [{ who: 'Alfio', text: 'Bravo. Your stomach thanks you. July thanks you.' }],
    next: 'c8.alfio.granita',
  },
  'c8.alfio.insist': {
    lines: [
      { who: 'Alfio', text: 'Then both: the cappuccino for the principle, a granita for the education. Only one goes on the bill.' },
    ],
    next: 'c8.alfio.granita',
  },
  'c8.alfio.doctrine': {
    lines: [{ who: 'Alfio', text: 'In summer? Granita con brioche. There is no second answer, only wrong ones.' }],
    next: 'c8.alfio.granita',
  },
  'c8.alfio.granita': {
    lines: [
      { text: 'Almond granita, coffee poured through it like dusk, and a brioche wearing a small hat.' },
      { who: 'Alfio', text: 'Tear the hat off first and dip. Not optional.' },
      { text: 'Cold, sweet, bitter, warm bread. The heat stops being your enemy.' },
    ],
    effects: ['set:c8.granita', 'journal:dishes.granitabrioche'],
  },
  'c8.alfio.lunch': {
    lines: [{ who: 'Alfio', text: 'Back at the right hour! The fryer just sang. You want one, of course you want one.' }],
    choices: [
      { text: '"One arancina, please."', goto: 'c8.alfio.arancina' },
      { text: '"One arancino, please."', goto: 'c8.alfio.arancino' },
    ],
  },
  'c8.alfio.arancina': {
    lines: [
      { text: 'The bar does not go quiet. It goes loud.' },
      { who: 'Alfio', text: 'ArancinO, friend. Masculine, pointed like the mountain. In Palermo they say arancina and make it round, and they are wrong with confidence.' },
      { who: 'Alfio', text: 'Eat it. Welcome to the war.' },
    ],
    next: 'c8.alfio.eat',
  },
  'c8.alfio.arancino': {
    lines: [
      { who: 'Alfio', text: 'ArancinO! You hear this? A natural. Somebody in Palermo just felt a chill and does not know why.' },
    ],
    next: 'c8.alfio.eat',
  },
  'c8.alfio.eat': {
    lines: [{ text: 'Saffron rice, a molten heart of ragù, a crust that shatters like an argument won. It needs both hands.' }],
    effects: ['set:c8.arancino', 'journal:dishes.arancino'],
  },
  'c8.alfio.cannolo': {
    lines: [{ text: 'In the case, a row of empty cannoli shells waits beside a pastry bag of ricotta the size of a housecat.' }],
    choices: [
      { text: 'Ask why none of them are filled', goto: 'c8.alfio.case' },
      { text: 'Just order one', goto: 'c8.alfio.fills' },
    ],
  },
  'c8.alfio.case': {
    lines: [
      { who: 'Alfio', text: 'Because you had not ordered yet. A cannolo is filled when you ask, never before. Anything else is a confession.' },
    ],
    next: 'c8.alfio.fills',
  },
  'c8.alfio.fills': {
    lines: [
      { text: 'He fills it in two passes, dips both ends in pistachio, and hands it over like a signed document.' },
      { text: 'The shell cracks. The ricotta is cool and barely sweet. So that is what the empty shells were for.' },
    ],
    effects: ['set:c8.cannolo', 'journal:dishes.cannolo'],
  },
  'c8.alfio.again': {
    lines: [{ who: 'Alfio', text: 'Fresh shells, blistered and rude, exactly right. No customers waiting. Purely for the hands.' }],
    choices: [
      { text: 'Take the pastry bag again', when: { has: ['c8.cook.done'] }, goto: 'c8.alfio.cookReplay' },
      { text: 'Stay on this side of the counter', goto: 'c8.alfio.idle' },
    ],
  },
  'c8.alfio.cookReplay': {
    lines: [{ who: 'Alfio', text: 'No lesson today. Fill them, dress them, and we eat the mistakes ourselves.' }],
    effects: ['set:replay.mode', 'set:c8.cook.start'],
  },
  /**
   * Beat nine of the Her thread: the silence gets a witness, and the witness
   * is a boy who was nosy about a stranger's handwriting. He thought nothing
   * of it in 1975 and thinks nothing of it now. Nothing here explains
   * anything; only Oaxaca is allowed to do that.
   */
  'c8.alfio.her': {
    lines: [
      { text: 'He wipes the clean marble in slow circles.' },
      { who: 'Alfio', text: 'La Zoila had that corner table one summer. I was fifteen, clearing glasses, reading her book upside down.' },
    ],
    choices: [
      { text: 'Say nothing.', goto: 'c8.alfio.her.quiet' },
      { text: '"Upside down? What did it say?"', goto: 'c8.alfio.her.read' },
    ],
  },
  'c8.alfio.her.quiet': {
    lines: [{ text: 'You let the circles finish. The marble shines where it already shone.' }],
    next: 'c8.alfio.her2',
  },
  'c8.alfio.her.read': {
    lines: [{ who: 'Alfio', text: 'Lists, friend. Words with their prices. I hoped for secrets and got groceries.' }],
    next: 'c8.alfio.her2',
  },
  'c8.alfio.her2': {
    lines: [
      { who: 'Alfio', text: 'Then a week she never opened it. I asked why. She said later, and what was in the brioche.' },
      { text: 'He laughs at his fifteen-year-old self and goes to see about the almond tub.' },
    ],
    effects: ['set:c8.alfio.her', 'journal:her.sicily'],
  },
  'c8.alfio.idle': {
    lines: [{ who: 'Alfio', text: 'The gelsi is nearly finished for the season. When it goes, it goes like a ferry: no argument.' }],
  },
  'c8.alfio.bag': {
    lines: [
      { text: 'A fresh rank of empty shells, and the pastry bag lying beside them like a sleeping housecat.' },
      { who: 'Alfio', text: 'You know the law with your head. Now the hands. Come around the counter.' },
    ],
    choices: [
      { text: 'Take the pastry bag', goto: 'c8.alfio.bag.go' },
      { text: '"Later. I respect the bag."', goto: 'c8.alfio.bag.wait' },
    ],
  },
  'c8.alfio.bag.go': {
    lines: [{ who: 'Alfio', text: 'Three shells, three customers, zero mercy from the signora. Let the shell tell your thumb.' }],
    effects: ['set:c8.cook.start'],
  },
  'c8.alfio.bag.wait': {
    lines: [{ who: 'Alfio', text: 'Wise to fear it a little. The bag can smell confidence.' }],
  },
  'c8.cook.finish': {
    lines: [
      { text: 'Three shells, filled at the moment. The only evidence is pistachio on a barman’s wrist.' },
      { who: 'Alfio', text: 'Cream when asked for, crunch to the last second. Hold to that and you die a happy barman.' },
    ],
    effects: ['clear:c8.cook.start', 'set:c8.cook.done'],
  },

  // ---------------- the circolo elders ----------------
  'c8.elders.first': {
    lines: [
      { text: 'Cool dark, cards snapping, an espresso machine older than the republic. One chair stands empty.' },
      { who: 'The Elders', text: 'Sit? No. That chair is occupied by a man who is late by some years.' },
      { who: 'The Elders', text: 'Watch, then. Talìa the table, not our faces.' },
    ],
    effects: ['set:met.elders', 'set:c8.circolo.watch', 'journal:customs.circolo'],
  },
  'c8.elders.notyet': {
    lines: [
      { who: 'The Elders', text: 'Still watching. Good. In this town names travel by kitchen; eat where you are told and the cards will hear.' },
    ],
  },
  'c8.elders.wave': {
    lines: [
      { text: 'The cards stop. The one with the anchor tattoo looks at you, then at the empty chair.' },
      { who: 'The Elders', text: 'Concetta fed you Sunday. And a chair empty too long becomes a superstition.' },
      { who: 'The Elders', text: 'Sit, picciriddu. We play for nothing, and for everything.' },
    ],
    choices: [
      { text: 'Take the empty chair', goto: 'c8.elders.deal' },
      { text: 'Not yet', goto: 'c8.elders.respect' },
    ],
  },
  'c8.elders.respect': {
    lines: [
      { who: 'The Elders', text: 'He hesitates. You see? Respect. The chair can wait until you finish being polite.' },
    ],
  },
  'c8.elders.deal': {
    lines: [
      { text: 'The chair receives you like it remembers how.' },
      { who: 'The Elders', text: 'What you watched standing up, now do sitting down. Amunì, picciriddu, cut the deck.' },
    ],
    effects: ['set:c8.scopa.start'],
  },
  'c8.scopa.done': {
    lines: [
      { text: 'The last sweep is yours. SCOPA, and it comes out of you at the correct volume, which is too loud.' },
      { who: 'The Elders', text: 'Ha! The chair chose well. You lose the next hundred games, of course, but this one is yours forever.' },
    ],
    effects: ['clear:c8.scopa.start', 'set:c8.scopa.won', 'journal:people.elders'],
  },
  // The mattanza argument moved off the table and onto the trophy shelf,
  // where it lives: the second line points the eye, the examine carries it.
  'c8.elders.post': {
    lines: [
      { who: 'The Elders', text: 'His chair, his luck, your shouting. He would have liked the shouting.' },
      { who: 'The Elders', text: 'Now Peppino starts the mattanza story. Talìa the trophy shelf; it keeps the honest version.' },
    ],
    effects: ['set:c8.elders.after'],
  },
  'c8.elders.again': {
    lines: [
      { who: 'The Elders', text: 'We promised you a hundred losses, picciriddu. So far, almost none.' },
    ],
    choices: [
      { text: 'Take the chair again', when: { has: ['c8.scopa.won'] }, goto: 'c8.elders.scopaReplay' },
      { text: 'Let them keep the afternoon', goto: 'c8.elders.idle' },
    ],
  },
  'c8.elders.scopaReplay': {
    lines: [{ who: 'The Elders', text: 'Nothing at stake but the sevens, and the sevens are always at stake. Cut the deck.' }],
    effects: ['set:replay.mode', 'set:c8.scopa.start'],
  },
  'c8.elders.idle': {
    lines: [{ who: 'The Elders', text: 'Cards, coffee, the fan when it agrees to work. Membership is for life.' }],
  },
  'c8.mimmo.idle': {
    lines: [
      { text: 'Mimmo does not look up from his cards. You could be on fire; he would ask you to burn more quietly.' },
    ],
  },

  // ---------------- Don Saro, the priest ----------------
  'c8.saro.first': {
    lines: [
      { text: 'A priest, sleeves rolled, is carrying two oars and losing to both. He is soaked and delighted.' },
      { who: 'Don Saro', text: 'Ah, a pair of hands! Take one end, God will take the other, and I will supervise us both.' },
    ],
    effects: ['set:met.saro', 'journal:people.donsaro'],
  },
  'c8.saro.recruit': {
    lines: [
      { who: 'Don Saro', text: 'You! One of my rowers has a wedding, his own. Providence sends a replacement.' },
      { who: 'Don Saro', text: 'U pisci a mari: four rowers, a rais shouting the stroke, and a boy playing a swordfish who will not be caught.' },
    ],
    choices: [
      { text: 'Take the oar', goto: 'c8.saro.launch' },
      { text: 'Ask what the pageant means first', goto: 'c8.saro.rite' },
      { text: 'Not yet', goto: 'c8.saro.wait' },
    ],
  },
  'c8.saro.rite': {
    lines: [
      { who: 'Don Saro', text: 'The old swordfish hunt, played as a comedy to ask the sea for a generous year. The saint watches from the steps.' },
    ],
    choices: [
      { text: 'Take the oar', goto: 'c8.saro.launch' },
      {
        text: '"In Peru the saint sails out on a reed raft."',
        goto: 'c8.saro.peru',
        when: { has: ['page.customs.sanpedrito'] },
      },
      { text: 'Not yet', goto: 'c8.saro.wait' },
    ],
  },
  'c8.saro.peru': {
    lines: [
      { who: 'Don Saro', text: 'On reeds! Ours watches a fish get caught on purpose. Talìa, the same idea in two oceans.' },
      { who: 'Don Saro', text: 'Wherever people fish, sooner or later a saint learns to swim.' },
    ],
    choices: [
      { text: 'Take the oar', goto: 'c8.saro.launch' },
      { text: 'Not yet', goto: 'c8.saro.wait' },
    ],
  },
  'c8.saro.wait': {
    lines: [{ who: 'Don Saro', text: 'Come back before the bells. The boat will not row itself; we have asked it.' }],
  },
  'c8.saro.launch': {
    lines: [
      { text: 'A sash that smells of last year’s festival, and an oar polished by decades of the same excitement.' },
      { who: 'Don Saro', text: 'Bring the arms and the laugh. That is the whole liturgy.' },
    ],
    effects: ['set:c8.pisci.start'],
  },
  'c8.pisci.done': {
    lines: [
      { text: 'The third time, the fish lets itself be caught, hauled up grinning and human, and the harbor roars.' },
      { who: 'Don Saro', text: 'A generous year! You rowed like a native: badly, at the correct moments, with your whole heart.' },
    ],
    effects: ['clear:c8.pisci.start', 'set:c8.pisci.won', 'journal:customs.upisci'],
  },
  'c8.saro.post': {
    lines: [
      { who: 'Don Saro', text: 'Every year I say never again, and every year the sea and I forgive each other.' },
      { who: 'Don Saro', text: 'In fifty years some picciriddu will row your oar and not know your name. Perfect.' },
    ],
    effects: ['set:c8.saro.blessed'],
  },
  'c8.saro.again': {
    lines: [
      { who: 'Don Saro', text: 'The rais takes the boat out most evenings. Your bench is free.' },
    ],
    choices: [
      { text: 'Take the oar again', when: { has: ['c8.pisci.won'] }, goto: 'c8.saro.pisciReplay' },
      { text: 'Leave the sea to itself tonight', goto: 'c8.saro.idle' },
    ],
  },
  'c8.saro.pisciReplay': {
    lines: [{ who: 'Don Saro', text: 'No saint watching this time, only the rais and his lungs. Pull with the call.' }],
    effects: ['set:replay.mode', 'set:c8.pisci.start'],
  },
  'c8.saro.idle': {
    lines: [{ who: 'Don Saro', text: 'Cumu veni si cunta: we tell it as it comes. Today there is nothing to tell, grazie a Dio.' }],
  },

  // ---------------- Nino, who might leave ----------------
  'c8.nino.first': {
    lines: [
      { text: 'A young man mends a net, a duffel bag packed behind him, not hidden.' },
      { who: 'Nino', text: 'You came here on purpose? Half my school is in Torino.' },
      { who: 'Nino', text: 'Cu nesci arrinesci: who leaves, succeeds. They say it like a blessing. It lands like a shove.' },
    ],
    effects: ['set:met.nino', 'journal:people.nino'],
  },
  'c8.nino.argument': {
    lines: [
      { who: 'Nino', text: 'The empty chair at the circolo was my grandfather’s. The sea kept him.' },
      { who: 'Nino', text: 'The boat is mine if I stay; a wage is mine if I go. Both are right. That is the trap.' },
    ],
    choices: [
      { text: '"Go. The town will still be here."', goto: 'c8.nino.go' },
      { text: '"Stay. Wages exist here too."', goto: 'c8.nino.stay' },
      { text: 'Say nothing and hold the net taut', goto: 'c8.nino.quiet' },
    ],
  },
  'c8.nino.go': {
    lines: [
      { who: 'Nino', text: 'Will it? Half this street is shuttered. And still, when I picture Torino I hear nothing. No bells, no water.' },
    ],
    effects: ['set:c8.nino.talk'],
  },
  'c8.nino.stay': {
    lines: [
      { who: 'Nino', text: 'Spoken like someone with a ticket in their pocket. My grandfather knew a sea I will never meet.' },
    ],
    effects: ['set:c8.nino.talk'],
  },
  'c8.nino.quiet': {
    lines: [
      { text: 'You take the net’s far edge and pull it straight. He works toward you, knot by knot.' },
      { who: 'Nino', text: 'You are the only person in town who has not voted on my life today. Grazie.' },
    ],
    effects: ['set:c8.nino.talk'],
  },
  'c8.nino.rowing': {
    lines: [
      { who: 'Nino', text: 'I row in the pageant. My grandfather’s stroke, they tell me, as if the arms know what the heart is arguing about.' },
    ],
  },
  'c8.nino.idle': {
    lines: [{ who: 'Nino', text: 'The bag? Still packed. Maybe October, maybe not. Cumu veni si cunta.' }],
  },

  // ---------------- Rosaria, the lemon grower ----------------
  'c8.rosaria.first': {
    lines: [
      { who: 'Rosaria', text: 'Mind the wall, it is lava stone. ’A Muntagna built my terraces herself, the generous monster.' },
      { who: 'Rosaria', text: 'The Mountain, and she is a she. She burns a vineyard one century and gifts this soil the next.' },
    ],
    effects: ['set:met.rosaria', 'journal:words.amuntagna'],
  },
  'c8.rosaria.bread': {
    lines: [
      { text: 'At noon she splits a flat loaf and dresses it from bottles: oil, tomato, oregano, anchovy, cheese.' },
      { who: 'Rosaria', text: 'Pane cunzato. When there was nothing, there was still this. Eat.' },
    ],
    effects: ['set:c8.cunzato', 'journal:dishes.panecunzato'],
  },
  'c8.rosaria.idle': {
    lines: [
      { who: 'Rosaria', text: 'When she rumbles we sweep the ash off the leaves and say nothing rude where she can hear.' },
    ],
  },

  // ---------------- Mang Ben, ashore where the fish are honest ----------------
  'c8.ben.hello': {
    lines: [
      { text: 'At the fish stall, a man with a towel on one shoulder is congratulating a sardine. You know that towel.' },
      { who: 'Mang Ben', text: 'Pare! The Yacana provisions down the coast, so I came where the fish sing. Turi and I are family already; he does not know it.' },
    ],
    effects: ['set:c8.ben.met'],
    choices: [
      { text: '"Adobo order, go: garlic first, vinegar undisturbed."', goto: 'c8.ben.adobo', when: { has: ['c3.cook.done'] } },
      { text: '"I told the locals about sinigang. They countered with agrodolce."', goto: 'c8.ben.sour', when: { has: ['page.dishes.sinigang'] } },
      { text: '"Mostly I remember that you fed me before you knew my name."', goto: 'c8.ben.fed' },
    ],
  },
  'c8.ben.adobo': {
    lines: [
      { text: 'He sets the sardine down and says nothing for a moment. His eyes shine. He blames onions; the stall has no onions.' },
      { who: 'Mang Ben', text: 'Three oceans and you kept the order, pare. Now I have to hug you. Occupational.' },
    ],
  },
  'c8.ben.sour': {
    lines: [
      { who: 'Mang Ben', text: 'Sinigang, urojo, agrodolce: every honest coast keeps one sour pot. I have argued this at four stalls and I am WINNING.' },
    ],
  },
  'c8.ben.fed': {
    lines: [
      { who: 'Mang Ben', text: 'House rule one, pare: nobody stands in my doorway hungry. The rule travels.' },
      { who: 'Mang Ben', text: 'And keep this: adobo goes garlic first, vinegar undisturbed. Sinigang, the sour soup, for any homesick face.' },
    ],
  },
  'c8.ben.anchovies': {
    lines: [
      { text: 'Ben holds a tin of Sicilian anchovies up to the light like contraband.' },
      { who: 'Mang Ben', text: 'For research, pare. If the research ends up on the crew’s pizza night, that is between me and the tin.' },
    ],
    effects: ['set:c8.ben.tin'],
  },
  'c8.ben.idle': {
    lines: [
      { who: 'Mang Ben', text: 'The ship loads tomatoes tomorrow, and me with them. Find me before we sail, pare.' },
    ],
  },

  // ---------------- Chasca, sketching the stones ----------------
  'c8.chasca.stones': {
    lines: [
      { who: 'Chasca', text: 'The soup-eater! A blinded giant threw these at a ship and missed. Imagine missing so beautifully.' },
      { who: 'Chasca', text: 'One frame left, I lied, there is always one. Stand with the stones. Say fuzzy pickles!' },
    ],
    effects: ['set:met.chascaC8', 'set:photo.flash', 'set:photo.c8.stones'],
  },
  'c8.chasca.album': {
    lines: [
      { who: 'Chasca', text: 'Eight photographs now, and you in front of each one, slightly more somebody.' },
      { who: 'Chasca', text: 'The album ends where you end. No, that came out wrong. Where you arrive. Better.' },
    ],
  },

  // ---------------- Signor Patanè, the shipping agent ----------------
  'c8.patane.first': {
    lines: [
      { text: 'At the mole’s end, a folding table, a ledger, and a man keeping both in the only shade.' },
      { who: 'Signor Patanè', text: 'Patanè, agente marittimo. A ship to Veracruz exists, in principle, the way saints exist. The town has barely started on you.' },
    ],
    effects: ['set:met.patane'],
  },
  'c8.patane.not': {
    lines: [
      { who: 'Signor Patanè', text: 'Not yet, friend. A table, a card game, a boat, an evening walk: all still holding your name.' },
    ],
  },
  'c8.patane.yes': {
    lines: [
      { who: 'Signor Patanè', text: 'So. Concetta fed you, the circolo seated you, the saint got you soaked, and you walked nowhere like a local.' },
      { who: 'Signor Patanè', text: 'The town signs you out, with regret, the only honorable way. Veracruz, then the mountains of Mexico.' },
    ],
    effects: ['set:c8.complete'],
  },
  'c8.patane.board': {
    lines: [
      { who: 'Signor Patanè', text: 'Provisioned, in principle and in fact. The gangway is that way, and so is Mexico.' },
    ],
    choices: [
      { text: 'Walk to the gangway', goto: 'c8.depart' },
      { text: 'Not yet', goto: 'c8.patane.wait' },
    ],
  },
  'c8.patane.wait': {
    lines: [{ who: 'Signor Patanè', text: 'Wise. The town will gladly spend you another day.' }],
  },
  /**
   * The send-off. Every other coast ends on someone wise sending you on;
   * this one tries to, and collapses into the town's favorite sport. The
   * horn wins the argument, and Alfio's last word is lost to it.
   */
  'c8.depart': {
    lines: [
      { text: 'Half the town has come down the mole to see you off properly. Nobody agrees on properly.' },
      { who: 'Nonna Concetta', text: 'A goodbye is eaten, bedda. Two arancine, still warm. Do not argue with the paper.' },
      { who: 'Alfio', text: 'ArancinE? Nonna. In front of the ship?' },
    ],
    choices: [
      { text: 'Thank her for the arancini', goto: 'c8.depart.i' },
      { text: 'Thank her for the arancine', goto: 'c8.depart.e' },
      { text: 'Hold the parcel and say nothing', goto: 'c8.depart.quiet' },
    ],
  },
  'c8.depart.i': {
    lines: [
      { who: 'Alfio', text: 'ArancinI! You hear? Even leaving, a natural.' },
      { who: 'Nonna Concetta', text: 'My mother said arancine, and she buried two husbands and a bishop.' },
    ],
    next: 'c8.depart.loud',
  },
  'c8.depart.e': {
    lines: [
      { who: 'Nonna Concetta', text: 'You see? The child has manners.' },
      { who: 'Alfio', text: 'The child has been FED, Nonna. That is not grammar.' },
    ],
    next: 'c8.depart.loud',
  },
  'c8.depart.quiet': {
    lines: [{ text: 'You say nothing. It does not help. On this coast, neutral is just a third side.' }],
    next: 'c8.depart.loud',
  },
  'c8.depart.loud': {
    lines: [
      { who: 'Turi', text: 'A goodbye is not eaten, it is SUNG! Piscispadaaa, arrivederciii...' },
      { who: 'Don Saro', text: 'Friends, please. A goodbye is blessed. Quietly, and in order, and' },
      { text: 'The elders side with Alfio, Rosaria with Concetta, Turi keeps singing, and nobody hears the priest.' },
    ],
    next: 'c8.depart.horn',
  },
  'c8.depart.horn': {
    lines: [
      { text: 'The ship’s horn lands on all of them at once, one long note that ends every argument on the coast mid-sentence.' },
      { text: 'Alfio shouts something from the quay, both hands cupped. The horn takes every word.' },
      { text: 'The faraglioni slide past. Behind you, very small, the town is arguing again.' },
    ],
    effects: ['journal:customs.sendoff', 'travel:oaxaca'],
  },

  // ---------------- post office ----------------
  'c8.post.pilar': {
    lines: [
      { text: 'One counter, one fan, both from another century. The clerk produces an envelope addressed in invoice handwriting.' },
    ],
    effects: ['letter:sicily.pilar'],
  },
  'c8.post.mariamma': {
    lines: [
      { text: 'Under the blotter, a second envelope: soft blue, smelling faintly of cardamom and sea mail.' },
    ],
    effects: ['letter:sicily.mariamma'],
  },
  'c8.post.idle': {
    lines: [
      { text: 'POSTE. The fan turns its head from side to side like it disagrees with the whole arrangement.' },
    ],
  },

  // ---------------- examines: new kinds ----------------
  'c8.ex.casedda': {
    lines: [{ text: 'Pastel plaster over lava stone. Laundry crosses between balconies like signal flags of ordinary life.' }],
  },
  'c8.ex.basalto': {
    lines: [{ text: 'Paving cut from old lava, black and faintly glassy. The town walks every evening on the mountain’s cooled temper.' }],
  },
  'c8.ex.lavashore': {
    lines: [{ text: 'A beach with no sand, only black rock rounded by patient water. It holds the day’s heat past midnight.' }],
  },
  'c8.ex.lavarock': {
    lines: [{ text: 'Basalt, porous as bread. A thousand years ago it was in a hurry; it has been resting here ever since.' }],
  },
  'c8.ex.faraglione': {
    lines: [
      { text: 'The faraglioni, thrown by a blinded giant who missed. Boats thread between them daily; living in a myth is mostly parking.' },
    ],
  },
  'c8.ex.lemontree': {
    lines: [{ text: 'A lemon tree in full argument with gravity. The fruit glows against the lava wall like forgotten lamps.' }],
  },
  'c8.ex.granitabar': {
    lines: [{ text: 'Granita smooth as marble: lemon, almond, coffee, mulberry. Behind the glass, empty cannoli shells wait to be asked.' }],
  },
  'c8.ex.fontana': {
    lines: [
      { text: 'A lava basin and a bronze spout worn bright by hands. The water has not been turned off in living memory.' },
    ],
  },
  'c8.ex.bucato': {
    lines: [
      { text: 'Washing strung across the lane: two shirts, a tablecloth, somebody’s enormous blue trousers. The only flag this street flies.' },
    ],
  },
  'c8.ex.bartable': {
    lines: [{ text: 'A little round table sized for two elbows and one long morning. The shade underneath is communal property.' }],
  },
  'c8.ex.barlamp': {
    lines: [{ text: 'The bar’s iron lamp. At dusk it comes on first, and the passeggiata orbits it like slow moths with opinions.' }],
  },
  'c8.ex.barca': {
    lines: [
      { text: 'A wooden boat, white and azure, PROVVIDENZA on the bow and an eye at the prow. Somebody repaints the eye every spring, first.' },
    ],
  },
  'c8.ex.chiesa': {
    lines: [
      { text: 'The church wears grey and black basalt like Sunday clothes. On the steps, festival scaffolding: half altar, half boat launch.' },
    ],
  },
  'c8.ex.vespa': {
    lines: [{ text: 'A pistachio-green Vespa, older than the mayor and running better. Both facts are public record.' }],
  },
  'c8.ex.macchina': {
    lines: [{ text: 'The espresso machine: chrome gone soft with polishing, a lever like a ship’s telegraph. Older than every member, and louder.' }],
  },
  'c8.ex.trofei': {
    lines: [
      { text: 'A regatta cup, a scopa plate from 1961, a swordfish bill mounted like a relic. Nobody dusts the second-place ones.' },
    ],
  },
  'c8.ex.lemoncrate': {
    lines: [{ text: 'Crates stenciled COOP. AGRUMARIA, crooked on every crate, the same crooked, which takes practice.' }],
  },
  'c8.ex.testadimoro': {
    lines: [
      { text: 'A ceramic head with basil for hair. A Moor loved a local girl and meant to sail home; she kept his head for a planter.' },
    ],
    effects: ['set:egg.c8.moro'],
  },
  'c8.egg.basil1': {
    lines: [
      { text: 'The basil hair droops in the glare. There is a cup of fountain water in your hand before you have finished deciding.' },
    ],
    effects: ['set:egg.c8.basil'],
  },
  'c8.egg.basil2': {
    lines: [
      { text: 'The Moor\'s basil stands up straight again, and somebody has topped up your watering. The pot keeps two gardeners now.' },
    ],
  },
  'c8.egg.concetta': {
    lines: [
      { text: 'Concetta passes without a word, pinches one basil leaf from the Moor\'s crown, and crushes it under your nose.' },
      { who: 'Nonna Concetta', text: 'Mm. You water, it grows, you belong. Now stand in the shade, bedda.' },
    ],
    effects: ['set:egg.c8.basil.nod'],
  },
  'c8.ex.edicola': {
    lines: [
      { text: 'A small Madonna with two electric candles. The sea wind kept taking the flames, so faith here learned wiring.' },
    ],
  },
  'c8.ex.edicola2': {
    lines: [{ text: 'A third candle since the pageant. Four rowers, one swimming fish, everyone home wet and safe: worth a bulb.' }],
  },
  'c8.ex.fichidindia': {
    lines: [{ text: 'Prickly pear growing out of bare lava like it signed a lease. The fruit is sweet; the spines are personal.' }],
  },
  'c8.ex.nonnachair': {
    lines: [{ text: 'A kitchen chair outside the door at a precise angle: where the afternoon shade will be, accurate to the minute.' }],
  },
  'c8.ex.gattu': {
    lines: [{ text: 'A cat asleep in the fruit bowl, two lemons for pillows. The household lost this argument years ago and buys more bowls.' }],
  },
  'c8.ex.campetto': {
    lines: [
      { text: 'A chalk goal, a score of three to two, the two crossed out and rewritten. Nobody plays until it is settled.' },
    ],
  },
  'c8.ex.pomodori': {
    lines: [{ text: 'Tomato bunches drying on a frame of retired oars. Winter sauce, paying its rent in advance.' }],
  },
  'c8.ex.avvisi': {
    lines: [
      { text: 'Mass times, the feast committee, and U PISCI A MARI in letters bigger than both. A pinned note asks for one more rower.' },
    ],
  },
  'c8.ex.avvisi2': {
    lines: [{ text: 'Under the festival bill someone has chalked ANNATA BONA. Good year. The chalk keeps the important records.' }],
  },
  'c8.ex.limoni': {
    lines: [{ text: 'Windfall lemons, too bruised for the crates, too proud for the compost. The terrace smells like the inside of yellow.' }],
  },
  'c8.ex.lavagna': {
    lines: [{ text: 'The score blackboard: NOI and LORO, us and them, in tallies that reset every night and settle nothing across decades.' }],
  },
  'c8.ex.ventola': {
    lines: [{ text: 'The standing fan turns to face each speaker in turn, like it is following the argument, which it is.' }],
  },
  'c8.ex.rug': {
    lines: [
      { text: 'Two pezzare woven from shirts that stopped being shirts, worn thin where the elders stand to argue.' },
    ],
  },
  'c8.ex.mat': {
    lines: [{ text: 'The doormat says nothing at all. Members wipe their feet out of respect, not instruction.' }],
  },

  // ---------------- examines: shared kinds, this map's voice ----------------
  'c8.ex.sea': {
    lines: [{ text: 'Hard summer blue with black stones standing in it. Homer put a giant on this shore and the water has been smug since.' }],
  },
  'c8.ex.stall': {
    lines: [{ text: 'Turi’s bench: swordfish steaks on ice, a whole head presiding, sardines in silver ranks.' }],
  },
  'c8.ex.crate': {
    lines: [{ text: 'Fish crates stenciled with three owners’ names, all crossed out. The crate outlives every claim to it.' }],
  },
  'c8.ex.net': {
    lines: [{ text: 'Nets drying on black rock, gold cork and green mesh. Mending them is the evening’s excuse for talking.' }],
  },
  'c8.ex.bench': {
    lines: [{ text: 'A bench facing the water, front-row seats to the passeggiata. Arrive early or stand.' }],
  },
  'c8.ex.farol': {
    lines: [{ text: 'A street lamp. The moths hold their own small passeggiata around it, faster and with worse manners.' }],
  },
  'c8.ex.grass': {
    lines: [{ text: 'Terrace green, rationed by walls of lava stone. Every flat meter here was argued out of a slope.' }],
  },
  'c8.ex.dirt': {
    lines: [{ text: 'A lane of packed earth exactly one Vespa wide, as all things here eventually are.' }],
  },
  'c8.ex.tuft': {
    lines: [{ text: 'Dry summer grass, holding its breath until the autumn rains.' }],
  },
  'c8.ex.table': {
    lines: [{ text: 'The card table, felt gone bald at the dealer’s corner. Scores in a code no living member remembers agreeing to.' }],
  },
  'c8.ex.stool': {
    lines: [{ text: 'One chair at the scopa table sits at a slight angle, pushed back years ago and never pushed in. Nobody straightens it.' }],
  },
  'c8.ex.stool.won': {
    lines: [{ text: 'The chair that waited years sits square to the table now, warm most afternoons. The elders prefer it so.' }],
  },
  /**
   * The elders play on their own schedule, invitation or none. Watching the
   * table is how scopa gets learned here; the game arrives half-taught.
   */
  'c8.ex.scopawatch': {
    lines: [
      { text: 'A seven of denari comes down and the table goes quiet around it. Whatever the settebello means, it is what a bride means at a wedding.' },
      { text: 'One elder feeds the table a small card and studies the ceiling. Another sums three cards into his own, sweeps the wood, and shouts.' },
    ],
  },
  'c8.ex.trofei.mattanza': {
    lines: [
      { text: 'The mattanza argument: Peppino’s grandfather rode the nets off these rocks. Favignana, rules the table. He saw one tuna from a ferry.' },
    ],
    effects: ['set:c8.mattanza.heard'],
  },
  'c8.ex.tray': {
    lines: [{ text: 'Fresh shells cool on the little table, blistered and rude from the fryer, empty on purpose. Promises, waiting to be asked for.' }],
    effects: ['set:c8.tray.rest'],
  },
  'c8.ex.shelf': {
    lines: [{ text: 'Dominoes, a barometer set permanently to fair, and coffee cups that are members in their own right.' }],
  },
  'c8.ex.banco': {
    lines: [
      { text: 'Dark wood and a zinc top worn pale by sixty years of elbows. A bottle of amaro at the level it is always at.' },
    ],
  },
  'c8.ex.lampadario': {
    lines: [
      { text: 'One bulb under a green shade, its flex shortened twice to get it nearer the cards.' },
    ],
  },
  'c8.ex.net.circolo': {
    lines: [{ text: 'A net bundled in the corner since spring, mended the way things are mended indoors: eventually.' }],
  },
  'c8.ex.lemoncrate.circolo': {
    lines: [{ text: 'The cooperative stores its crates here because the club is dry and never locked. Nobody voted on this.' }],
  },
  'c8.ex.gattu.circolo': {
    lines: [{ text: 'The club cat, asleep on the lemons in the one draught between door and fan. Membership was never discussed.' }],
  },
  'c8.ex.nonnachair.circolo': {
    lines: [{ text: 'Mimmo’s chair, angled to the door so he sees who arrives before they see him.' }],
  },
  'c8.ex.ventola.circolo': {
    lines: [{ text: 'The fan points at nobody in particular, the only setting the membership has ever agreed on.' }],
  },
  'c8.ex.wallcalce': {
    lines: [
      { text: 'Whitewash over lava block. Where the calce has come off, the basalt beneath is still black.' },
    ],
  },
  'c8.ex.floorgraniglia': {
    lines: [{ text: 'Graniglia: marble chips in cement, ground flat between the wars. Cold, loud, and outliving its fourth generation of players.' }],
  },
};

/** Sicilian examine arms; shared props keep their words at home via map tags. */
export const SICILY_EXAMINES: Record<string, ExamineArm[]> = {
  blocked: [{ map: 'sicily', node: 'c8.ex.wall' }, { map: 'circolo', node: 'c8.ex.wall' }],
  // The circolo is skinned to calce, graniglia and pezzara in
  // `art/sets/sicily.ts`; each surface says what it is made of.
  wallInt: [{ map: 'circolo', node: 'c8.ex.wallcalce' }],
  floorEarth: [{ map: 'circolo', node: 'c8.ex.floorgraniglia' }],
  casedda: [{ node: 'c8.ex.casedda' }],
  basalto: [{ node: 'c8.ex.basalto' }],
  lavashore: [{ node: 'c8.ex.lavashore' }],
  lavarock: [{ node: 'c8.ex.lavarock' }],
  faraglione: [{ node: 'c8.ex.faraglione' }],
  lemontree: [{ node: 'c8.ex.lemontree' }],
  fontana: [{ node: 'c8.ex.fontana' }],
  bucato: [{ node: 'c8.ex.bucato' }],
  granitabar: [{ node: 'c8.ex.granitabar' }],
  bartable: [
    // The fryer's work rests here after the pastry-bag lesson, seen once.
    { when: { has: ['c8.cook.done'], not: ['c8.tray.rest'] }, node: 'c8.ex.tray' },
    { node: 'c8.ex.bartable' },
  ],
  barlamp: [{ node: 'c8.ex.barlamp' }],
  barca: [{ node: 'c8.ex.barca' }],
  chiesa: [{ node: 'c8.ex.chiesa' }],
  vespa: [{ node: 'c8.ex.vespa' }],
  macchina: [{ node: 'c8.ex.macchina' }],
  trofei: [
    // Pointed at by the elders after the first game; heard once, then the
    // shelf goes back to holding still.
    { when: { has: ['c8.elders.after'], not: ['c8.mattanza.heard'] }, node: 'c8.ex.trofei.mattanza' },
    { node: 'c8.ex.trofei' },
  ],
  banco: [{ node: 'c8.ex.banco' }],
  lampadario: [{ node: 'c8.ex.lampadario' }],
  lemoncrate: [
    { map: 'circolo', node: 'c8.ex.lemoncrate.circolo' },
    { node: 'c8.ex.lemoncrate' },
  ],
  testadimoro: [
    { when: { has: ['egg.c8.basil'] }, node: 'c8.egg.basil2' },
    { when: { has: ['egg.c8.moro'] }, node: 'c8.egg.basil1' },
    { node: 'c8.ex.testadimoro' },
  ],
  edicola: [
    { when: { has: ['c8.pisci.won'] }, node: 'c8.ex.edicola2' },
    { node: 'c8.ex.edicola' },
  ],
  fichidindia: [{ node: 'c8.ex.fichidindia' }],
  nonnachair: [
    { map: 'circolo', node: 'c8.ex.nonnachair.circolo' },
    { node: 'c8.ex.nonnachair' },
  ],
  gattu: [
    { map: 'circolo', node: 'c8.ex.gattu.circolo' },
    { node: 'c8.ex.gattu' },
  ],
  campetto: [{ node: 'c8.ex.campetto' }],
  pomodori: [{ node: 'c8.ex.pomodori' }],
  avvisi: [
    { when: { has: ['c8.pisci.won'] }, node: 'c8.ex.avvisi2' },
    { node: 'c8.ex.avvisi' },
  ],
  limoni: [{ node: 'c8.ex.limoni' }],
  lavagna: [{ node: 'c8.ex.lavagna' }],
  ventola: [
    { map: 'circolo', node: 'c8.ex.ventola.circolo' },
    { node: 'c8.ex.ventola' },
  ],
  postsign: [
    { when: { not: ['letter.read.sicily.pilar'] }, node: 'c8.post.pilar' },
    {
      when: { has: ['letter.read.sicily.pilar'], not: ['letter.read.sicily.mariamma'] },
      node: 'c8.post.mariamma',
    },
    { node: 'c8.post.idle' },
  ],
  sea: [{ map: 'sicily', node: 'c8.ex.sea' }],
  stall: [{ map: 'sicily', node: 'c8.ex.stall' }],
  crate: [{ map: 'sicily', node: 'c8.ex.crate' }],
  net: [
    { map: 'circolo', node: 'c8.ex.net.circolo' },
    { map: 'sicily', node: 'c8.ex.net' },
  ],
  bench: [{ map: 'sicily', node: 'c8.ex.bench' }],
  farol: [{ map: 'sicily', node: 'c8.ex.farol' }],
  grass: [{ map: 'sicily', node: 'c8.ex.grass' }],
  dirt: [{ map: 'sicily', node: 'c8.ex.dirt' }],
  tuft: [{ map: 'sicily', node: 'c8.ex.tuft' }],
  table: [
    // Once the elders point you at the table, watching it teaches scopa.
    { map: 'circolo', when: { has: ['c8.circolo.watch'], not: ['c8.scopa.won'] }, node: 'c8.ex.scopawatch' },
    { map: 'circolo', node: 'c8.ex.table' },
  ],
  stool: [
    { map: 'circolo', when: { has: ['c8.scopa.won'] }, node: 'c8.ex.stool.won' },
    { map: 'circolo', node: 'c8.ex.stool' },
  ],
  shelf: [{ map: 'circolo', node: 'c8.ex.shelf' }],
  rug: [{ map: 'circolo', node: 'c8.ex.rug' }],
  mat: [{ map: 'circolo', node: 'c8.ex.mat' }],
};

/** Event-triggered nodes, listed with their gating so tests can walk them. */
export const SICILY_EVENTS: EventNode[] = [
  { node: 'c8.arrive' },
  { when: { has: ['c8.scopa.start'] }, node: 'c8.scopa.done' },
  { when: { has: ['c8.pisci.start'] }, node: 'c8.pisci.done' },
  { when: { has: ['c8.cook.start'] }, node: 'c8.cook.finish' },
];
