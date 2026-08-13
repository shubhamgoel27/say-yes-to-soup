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
  // ---------------- arrival ----------------
  'c8.arrive': {
    lines: [
      { text: 'The ship noses past two towers of black stone standing in the sea, and the mole reaches out to meet you.' },
      { text: 'The heat is a hand on your shoulder. Lemon terraces climb behind the roofs; above everything, a long grey shoulder of mountain smokes gently.' },
      { text: 'Somewhere in the piazza a bell counts eleven, and a voice is singing about fish.' },
    ],
    effects: ['set:c8.arrived'],
  },

  // ---------------- Nonna Concetta ----------------
  'c8.concetta.first': {
    lines: [
      { who: 'Nonna Concetta', text: 'Talìa, a new face. Thin, too. Sit nowhere, touch nothing, hold this.' },
      { text: 'She puts a heel of bread in your hand, still warm, as if you had asked. You had not.' },
      { who: 'Nonna Concetta', text: 'Eat, bedda. In this town nobody stands in the sun with empty hands. Not while I am alive.' },
    ],
    effects: ['set:met.concetta', 'journal:people.concetta', 'journal:words.bedda'],
  },
  'c8.concetta.fish': {
    lines: [
      { who: 'Nonna Concetta', text: 'My swordfish! Turi kept the belly cut for me, the thief, the angel. Give it here.' },
      { text: 'She weighs the parcel in one hand and reads it like a letter.' },
      { who: 'Nonna Concetta', text: 'Good. Sunday you eat at my table. This is not an invitation, bedda, it is a schedule.' },
    ],
    effects: [
      'errand.done',
      'clear:errand.turi-pisci',
      'set:c8.fish.delivered',
      'set:c8.pranzo.invite',
    ],
  },
  'c8.concetta.pranzo': {
    lines: [
      { text: 'Sunday. The table has grown two extra leaves and a bench from the church. Cousins appear like weather.' },
      { who: 'Nonna Concetta', text: 'Sit there, between Nino and the aunts. You are new, so you are family. That is the arithmetic.' },
    ],
    next: 'c8.pranzo.primo',
  },
  // The courses arrive as plates, not as a recitation; the dish page fills
  // the moment the Norma lands, which is where the ingredients now live.
  'c8.pranzo.primo': {
    lines: [
      { text: 'Olives, caponata, anchovies, one lap of the table and gone. Then the Norma lands, eggplant under snow, and the talk drops by half.' },
      { who: 'Nonna Concetta', text: 'Pasta alla Norma, bedda. A masterpiece got the name of a masterpiece, and you eat it while it is one.' },
    ],
    effects: ['journal:dishes.norma'],
    choices: [
      { text: 'Pass the plates and listen', goto: 'c8.pranzo.listen' },
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
      { text: 'Plates go around like tides. An aunt argues football with an uncle; both are enjoying losing.' },
      { who: 'Nonna Concetta', text: 'Cu mancia fa muddichi, we say. Who eats makes crumbs. Everything you do leaves traces, so do it at my table.' },
    ],
    next: 'c8.pranzo.end',
  },
  'c8.pranzo.band': {
    lines: [
      { who: 'Nonna Concetta', text: 'Wait. That wool on your wrist. Somebody tied that on you, and not for decoration.' },
      { who: 'Nonna Concetta', text: 'A grandmother did that, or someone doing a grandmother’s work. So you are already fed from far away. Good. Eat anyway.' },
    ],
    next: 'c8.pranzo.end',
  },
  'c8.pranzo.refuse': {
    lines: [
      { who: 'Nonna Concetta', text: 'No? NO? Bedda, look at your arms. A gull could carry you off.' },
      { text: 'The table falls silent to watch. Diplomacy fails in four languages. The second helping lands.' },
      { who: 'Nonna Concetta', text: 'There. Refusing is permitted, succeeding is not. Now you know the rules of this house.' },
    ],
    next: 'c8.pranzo.end',
  },
  'c8.pranzo.end': {
    lines: [
      { text: 'The pranzo does not end so much as widen: fruit, coffee, a sweet, the shade moving across the table.' },
      { who: 'Nonna Concetta', text: 'Sunday is not a meal, picciriddu. It is a roll call. Everyone answers, even the dead, even the ones in Torino.' },
      { text: 'Later, with the journal open, you find Nani’s entry on this page. It stops halfway down, mid sentence. The rest is just paper.' },
    ],
    effects: ['set:c8.pranzo', 'journal:customs.pranzo', 'journal:words.picciriddu'],
  },
  'c8.concetta.walk': {
    lines: [
      { who: 'Nonna Concetta', text: 'The light is going soft. You know what that means. It means nothing else may happen today.' },
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
      { who: 'Nonna Concetta', text: 'To? Nowhere, bedda. That is the whole art of it.' },
      { who: 'Nonna Concetta', text: 'You walk slow, you greet everyone, you arrive back where you started, richer. The walk has no goal. People are the goal.' },
    ],
    choices: [
      { text: 'Walk with her', goto: 'c8.walk.go' },
      { text: 'Not this evening', goto: 'c8.walk.later' },
    ],
  },
  'c8.walk.later': {
    lines: [
      { who: 'Nonna Concetta', text: 'Tomorrow the sun will set again, they tell me. I will be here. So will the whole town, walking.' },
    ],
  },
  'c8.walk.go': {
    lines: [
      { text: 'The town comes out at the hour the stones stop burning. Everyone, all at once, dressed a little nicer than the errand requires.' },
      { text: 'You walk the lungomare end to end at the speed of talk. Nods, gossip, a newborn admired like a moonrise, football argued in two languages.' },
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
      { who: 'Nonna Concetta', text: 'Pole pole. Say it again. Ha! A whole coast on the far side of the world, walking correctly.' },
      { who: 'Nonna Concetta', text: 'You see, bedda? Everywhere worth living, somebody invented this exact evening.' },
    ],
    next: 'c8.walk.end',
  },
  'c8.walk.match': {
    lines: [
      { text: 'You slow down until slow stops being an effort. Somewhere in the third lap it becomes the only sensible speed.' },
      { who: 'Nonna Concetta', text: 'There. Now you are not watching the passeggiata, you are in it. There is no other way to see it.' },
    ],
    next: 'c8.walk.end',
  },
  'c8.walk.end': {
    lines: [
      { text: 'The sun drops behind the roofs and the faraglioni go from black to blacker to holy.' },
      { text: 'Three laps, no destination, and somehow the whole town has told you goodnight by name.' },
    ],
    effects: ['set:c8.walk.done', 'journal:customs.passeggiata'],
  },
  'c8.concetta.after': {
    lines: [
      { who: 'Nonna Concetta', text: 'You walked properly and you ate properly. Whatever else happens in your life, bedda, those two things are settled.' },
      { who: 'Nonna Concetta', text: 'Come by before you sail. There will be something wrapped in paper. Do not argue with it.' },
    ],
  },
  'c8.concetta.idle': {
    lines: [
      { who: 'Nonna Concetta', text: 'Stand in the shade at least, bedda. The sun here does not joke after ten.' },
    ],
  },

  // ---------------- Turi, the fish vendor ----------------
  'c8.turi.first': {
    lines: [
      { text: 'A voice rolls across the piazza, half song, half landslide, entirely certain of itself.' },
      { who: 'Turi', text: 'PISCISPADA piscispada piscispadaaaa! TALÌA talìa talìa, vivu vivu VIVUUU!' },
      { who: 'Turi', text: 'You like the song? My father’s tune, his father’s words. Every stall sings its own. That is how you shop with your eyes shut.' },
    ],
    effects: ['set:met.turi', 'journal:people.turi', 'journal:words.talia'],
  },
  'c8.turi.haggle': {
    lines: [
      { text: 'A signora in black holds up a swordfish steak like evidence in a murder trial. Turi clutches his chest, mortally wounded by her offer.' },
      { who: 'Turi', text: 'Signora, at that price I row out and apologize to the fish personally!' },
      { text: 'She doubles it. He halves the difference. They shake hands like old dance partners, which is what they are. A small crowd applauds.' },
    ],
    effects: ['set:c8.haggle', 'journal:customs.abbanniata'],
  },
  'c8.turi.errand': {
    lines: [
      { who: 'Turi', text: 'You have working legs and an honest face. Two out of two, so: this parcel is Nonna Concetta’s, the belly cut, set aside since dawn.' },
      { who: 'Turi', text: 'She is by the church steps. Walk it over before the sun argues with the ice, and Sunday will take care of itself.' },
    ],
    effects: ['errand:turi-pisci', 'set:errand.turi-pisci', 'set:c8.fish.taken'],
  },
  'c8.turi.carry': {
    lines: [
      { who: 'Turi', text: 'Still holding my fish? The ice is losing, friend. Nonna Concetta, church steps, amunì.' },
    ],
  },
  'c8.turi.idle': {
    lines: [
      { who: 'Turi', text: 'Tomorrow, who knows. Sarago, maybe alalunga. The sea writes the menu and I just sing what she wrote.' },
    ],
  },

  // ---------------- Alfio, the granita bar ----------------
  'c8.alfio.first': {
    lines: [
      { text: 'The bar owns the shade. Metal tubs glisten behind glass: lemon, almond, coffee, something dark purple with intentions.' },
      { who: 'Alfio', text: 'Buongiorno! Sit, sit. What can I make you this fine morning?' },
    ],
    effects: ['set:met.alfio', 'journal:people.alfio'],
    choices: [
      { text: 'Order a cappuccino', goto: 'c8.alfio.cappuccino' },
      { text: 'Ask what one has for breakfast here', goto: 'c8.alfio.doctrine' },
    ],
  },
  'c8.alfio.cappuccino': {
    lines: [
      { text: 'A small silence. Alfio looks at you the way you look at someone standing in the rain holding a perfectly good umbrella.' },
      { who: 'Alfio', text: 'I can. The machine is right there. But friend, it is July. Milk and steam, in this heat? Your stomach did nothing to deserve it.' },
      { who: 'Alfio', text: 'Let me save your morning instead. Granita. This is not dessert, this is breakfast, and it is the law of the coast.' },
    ],
    next: 'c8.alfio.granita',
  },
  'c8.alfio.doctrine': {
    lines: [
      { who: 'Alfio', text: 'In summer? Granita con brioche. There is no second answer, only wrong ones.' },
      { who: 'Alfio', text: 'The doctrine: almond with coffee, always legal. Lemon stands alone, like a lighthouse. Gelsi, the mulberry, is a July mercy, ask while it lasts.' },
    ],
    next: 'c8.alfio.granita',
  },
  'c8.alfio.granita': {
    lines: [
      { text: 'A glass of almond granita arrives with coffee poured through it like dusk, and a brioche wearing a small hat.' },
      { who: 'Alfio', text: 'The knot on top is the tuppo. Named for the bun the grandmothers wear. Tear it off first and dip it. That part is not optional.' },
      { text: 'Cold, sweet, bitter, warm bread. Somewhere in the second dip the temperature outside stops being your enemy.' },
    ],
    effects: ['set:c8.granita', 'journal:dishes.granitabrioche'],
  },
  'c8.alfio.lunch': {
    lines: [
      { who: 'Alfio', text: 'Back at the right hour! The fryer just sang. You want one, of course you want one.' },
    ],
    choices: [
      { text: '"One arancina, please."', goto: 'c8.alfio.arancina' },
      { text: '"One arancino, please."', goto: 'c8.alfio.arancino' },
    ],
  },
  'c8.alfio.arancina': {
    lines: [
      { text: 'The bar does not go quiet. It goes loud. Three tables answer at once, delighted, like you pulled a rope attached to all of them.' },
      { who: 'Alfio', text: 'ArancinO, friend. Masculine, pointed like the mountain. In Palermo they say arancina and make it round, and they are wrong with confidence.' },
      { who: 'Alfio', text: 'They say our cone honors ’a Muntagna herself. Eat it and you will hear no more grammar from me. Welcome to the war, we are glad you enlisted.' },
    ],
    next: 'c8.alfio.eat',
  },
  'c8.alfio.arancino': {
    lines: [
      { who: 'Alfio', text: 'ArancinO! You hear this? A natural. Somebody in Palermo just felt a chill and does not know why.' },
      { who: 'Alfio', text: 'Here it is pointed like the mountain. Grammar and geology, both on our side.' },
    ],
    next: 'c8.alfio.eat',
  },
  'c8.alfio.eat': {
    lines: [
      { text: 'Saffron rice, a molten heart of ragù, a crust that shatters like an argument won. It needs both hands and gets them.' },
    ],
    effects: ['set:c8.arancino', 'journal:dishes.arancino'],
  },
  'c8.alfio.cannolo': {
    lines: [
      { text: 'In the case, a row of empty cannoli shells waits beside a pastry bag of ricotta the size of a housecat.' },
    ],
    choices: [
      { text: 'Ask why none of them are filled', goto: 'c8.alfio.case' },
      { text: 'Just order one', goto: 'c8.alfio.fills' },
    ],
  },
  'c8.alfio.case': {
    lines: [
      { who: 'Alfio', text: 'Because you had not ordered one yet. A cannolo is filled the moment you ask, never before. Otherwise the shell goes soft.' },
      { who: 'Alfio', text: 'A pre-filled cannolo is a confession, friend. It says: we hoped nobody who knew better would come in today.' },
    ],
    next: 'c8.alfio.fills',
  },
  'c8.alfio.fills': {
    lines: [
      { text: 'He fills the shell in two passes, dips each end in pistachio, and hands it over like a signed document.' },
      { text: 'The shell cracks. The ricotta is cool and barely sweet. You understand, suddenly, what all the empty shells were waiting for.' },
    ],
    effects: ['set:c8.cannolo', 'journal:dishes.cannolo'],
  },
  'c8.alfio.again': {
    lines: [
      { who: 'Alfio', text: 'The shells came out of the fryer blistered and rude, exactly right. Three of them, no customers waiting. Purely for the hands.' },
    ],
    choices: [
      { text: 'Take the pastry bag again', when: { has: ['c8.cook.done'] }, goto: 'c8.alfio.cookReplay' },
      { text: 'Stay on this side of the counter', goto: 'c8.alfio.idle' },
    ],
  },
  'c8.alfio.cookReplay': {
    lines: [
      { who: 'Alfio', text: 'No lesson today, friend. Fill them, dress them, and we eat the mistakes ourselves. That is the good half of this trade.' },
    ],
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
      { text: 'He wipes the marble in slow circles, the way a man does when the counter is clean already and his hands still want a job.' },
      { who: 'Alfio', text: 'La Zoila had that corner table one summer. I was fifteen, clearing glasses, and I used to read her book upside down.' },
      { who: 'Alfio', text: 'Then a week where she never opened it. I asked her why, and she said she would catch up later and what was in the brioche.' },
      { text: 'He laughs at his own fifteen-year-old nosiness and goes to see about the almond tub. In your bag her Sunday page still stops mid sentence.' },
    ],
    effects: ['set:c8.alfio.her', 'journal:her.sicily'],
  },
  'c8.alfio.idle': {
    lines: [
      { who: 'Alfio', text: 'The gelsi is nearly finished for the season. When it goes, it goes like a ferry: no argument, only a smaller horizon.' },
    ],
  },
  'c8.alfio.bag': {
    lines: [
      { text: 'The case has been restocked: a fresh rank of empty shells, and the pastry bag lying beside them like a sleeping housecat.' },
      { who: 'Alfio', text: 'You know the law now: filled at the moment, never before. But knowing with the head is half. Come around the counter; hold the bag.' },
    ],
    choices: [
      { text: 'Take the pastry bag', goto: 'c8.alfio.bag.go' },
      { text: '"Later. I respect the bag."', goto: 'c8.alfio.bag.wait' },
    ],
  },
  'c8.alfio.bag.go': {
    lines: [
      { who: 'Alfio', text: 'Three shells, three customers, zero mercy from the signora. The shell will tell your thumb, friend; listen with it.' },
    ],
    effects: ['set:c8.cook.start'],
  },
  'c8.alfio.bag.wait': {
    lines: [
      { who: 'Alfio', text: 'Wise to fear it a little. The bag can smell confidence.' },
    ],
  },
  'c8.cook.finish': {
    lines: [
      { text: 'Three shells filled at the moment, no sooner. The counter holds no evidence except one barman licking pistachio from his wrist.' },
      { who: 'Alfio', text: 'Now you see why the case sits empty on purpose. A filled shell waiting is a soggy lie, and this bar has never once lied about dessert.' },
      { who: 'Alfio', text: 'Cream only when it is asked for; crunch until the last second. If my whole life holds to that standard, friend, I die a happy barman.' },
    ],
    effects: ['clear:c8.cook.start', 'set:c8.cook.done'],
  },

  // ---------------- the circolo elders ----------------
  'c8.elders.first': {
    lines: [
      { text: 'Inside: cool dark, cards snapping, an espresso machine that predates the republic. Four faces look up. One chair stands empty.' },
      { who: 'The Elders', text: 'Sit? No, no. The table is full. That chair is not empty, it is occupied by a man who is late by some years.' },
      { who: 'The Elders', text: 'Watch, then. Scopa explains itself if you stand there long enough; talìa the table, not our faces.' },
      { text: 'They play a hand slowly, for your benefit, pretending it is for theirs.' },
    ],
    effects: ['set:met.elders', 'set:c8.circolo.watch', 'journal:customs.circolo'],
  },
  'c8.elders.notyet': {
    lines: [
      { who: 'The Elders', text: 'Still standing, still watching. Good. The chair is a serious matter; the table has to know your name first.' },
      { who: 'The Elders', text: 'In this town names travel by kitchen. Eat where you are told to eat, and the cards will hear about it.' },
    ],
  },
  'c8.elders.wave': {
    lines: [
      { text: 'The cards stop. The one with the anchor tattoo looks at you, then at the empty chair, then back. The others nod at nothing in particular.' },
      { who: 'The Elders', text: 'Concetta fed you Sunday. So. The chair has been empty long enough to become a superstition, and superstitions are bad for the knees.' },
      { who: 'The Elders', text: 'Sit, picciriddu. We play to a small number, for nothing. For nothing, and for everything, same as always.' },
    ],
    choices: [
      { text: 'Take the empty chair', goto: 'c8.elders.deal' },
      { text: 'Not yet', goto: 'c8.elders.respect' },
    ],
  },
  'c8.elders.respect': {
    lines: [
      { who: 'The Elders', text: 'He hesitates. You see this? Respect. The chair waited years, it can wait until you finish being polite.' },
    ],
  },
  'c8.elders.deal': {
    lines: [
      { text: 'The chair receives you like it remembers how. Cards land: three down, four faces up on the wood.' },
      { who: 'The Elders', text: 'Everything you watched standing up, you now do sitting down. Amunì, picciriddu, cut the deck.' },
    ],
    effects: ['set:c8.scopa.start'],
  },
  'c8.scopa.done': {
    lines: [
      { text: 'The last sweep is yours. SCOPA, and the word comes out of you at the correct volume, which is too loud.' },
      { text: 'A sideways card marks the point. Somebody thumps the table; the espresso machine hisses its approval from the corner.' },
      { who: 'The Elders', text: 'Ha! Talìa. The chair chose well. You lose the next hundred games to us, of course, but the first one is yours forever.' },
    ],
    effects: ['clear:c8.scopa.start', 'set:c8.scopa.won', 'journal:people.elders'],
  },
  // The mattanza argument moved off the table and onto the trophy shelf,
  // where it lives: the second line points the eye, the examine carries it.
  'c8.elders.post': {
    lines: [
      { who: 'The Elders', text: 'The one whose chair you sat in taught half this table to play. He would have hated your luck and liked your shouting.' },
      { who: 'The Elders', text: 'Now Peppino starts the mattanza story, so you are truly a member. Talìa the shelf while he talks; the trophies keep the honest version.' },
    ],
    effects: ['set:c8.elders.after'],
  },
  'c8.elders.again': {
    lines: [
      { who: 'The Elders', text: 'The chair is warm and the deck is shuffled. We promised you a hundred losses, picciriddu, and so far you have collected almost none.' },
    ],
    choices: [
      { text: 'Take the chair again', when: { has: ['c8.scopa.won'] }, goto: 'c8.elders.scopaReplay' },
      { text: 'Let them keep the afternoon', goto: 'c8.elders.idle' },
    ],
  },
  'c8.elders.scopaReplay': {
    lines: [
      { who: 'The Elders', text: 'Bravo. Nothing at stake today except the sevens, and the sevens are always at stake. Cut the deck. Amunì.' },
    ],
    effects: ['set:replay.mode', 'set:c8.scopa.start'],
  },
  'c8.elders.idle': {
    lines: [
      { who: 'The Elders', text: 'Cards, coffee, the fan when the fan agrees to work. Membership is for life, and the life is this exact afternoon, forever.' },
    ],
  },
  'c8.mimmo.idle': {
    lines: [
      { text: 'Mimmo studies his briscola hand with the concentration of a man defusing something. He does not look up.' },
      { text: 'You could be on fire. He would ask you to burn more quietly.' },
    ],
  },

  // ---------------- Don Saro, the priest ----------------
  'c8.saro.first': {
    lines: [
      { text: 'A priest with his cassock sleeves rolled up is carrying two oars and losing to both of them. He is soaked to the elbows and delighted.' },
      { who: 'Don Saro', text: 'Ah, a pair of hands! Take one end, God will take the other, and I will supervise us both.' },
      { who: 'Don Saro', text: 'The feast of San Giovanni is on us. The boat needs paint, the swordfish needs a swimmer, and the swimmer needs convincing. A normal week.' },
    ],
    effects: ['set:met.saro', 'journal:people.donsaro'],
  },
  'c8.saro.recruit': {
    lines: [
      { who: 'Don Saro', text: 'You! Providence is efficient today. One of my rowers has a wedding, his own, so his excuse is technically valid.' },
      { who: 'Don Saro', text: 'U pisci a mari. Four rowers, one rais shouting the stroke, and the strongest boy in town playing the swordfish that will not be caught. Until it is.' },
    ],
    choices: [
      { text: 'Take the oar', goto: 'c8.saro.launch' },
      { text: 'Ask what the pageant means first', goto: 'c8.saro.rite' },
      { text: 'Not yet', goto: 'c8.saro.wait' },
    ],
  },
  'c8.saro.rite': {
    lines: [
      { who: 'Don Saro', text: 'Two hundred years and change, this game. A parody of the old swordfish hunt, played to ask the sea for a generous year.' },
      { who: 'Don Saro', text: 'The saint watches from the steps and the fish escapes and escapes until it does not. Saints and the sea, they have an old understanding here.' },
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
      { who: 'Don Saro', text: 'On reeds! And ours goes down on painted wood to watch a fish get caught on purpose. Talìa, the same idea in two oceans.' },
      { who: 'Don Saro', text: 'Wherever people fish, sooner or later a saint learns to swim. I would like to meet that one. Perhaps the fish know each other already.' },
    ],
    choices: [
      { text: 'Take the oar', goto: 'c8.saro.launch' },
      { text: 'Not yet', goto: 'c8.saro.wait' },
    ],
  },
  'c8.saro.wait': {
    lines: [
      { who: 'Don Saro', text: 'The sea is patient and so am I, on my better days. Come back before the bells; the boat will not row itself, believe me, we have asked it.' },
    ],
  },
  'c8.saro.launch': {
    lines: [
      { text: 'They dress you in a rower’s sash that smells of last year’s festival and hand you an oar polished by decades of the same excitement.' },
      { who: 'Don Saro', text: 'The rais does the thinking and the sea does the arguing. Bring the arms and the laugh; that is the whole liturgy.' },
    ],
    effects: ['set:c8.pisci.start'],
  },
  'c8.pisci.done': {
    lines: [
      { text: 'The third time, the fish lets itself be caught, hauled up glittering and grinning and human, and the whole harbor roars.' },
      { text: 'Spray, bells, oars raised like a toast. The saint on the steps has the expression of someone whose plan worked exactly.' },
      { who: 'Don Saro', text: 'A generous year, then! You rowed like a native, which is to say badly, at the correct moments, with your whole heart.' },
    ],
    effects: ['clear:c8.pisci.start', 'set:c8.pisci.won', 'journal:customs.upisci'],
  },
  'c8.saro.post': {
    lines: [
      { who: 'Don Saro', text: 'My cassock will dry by the Assumption, God willing. Every year I say never again, and every year the sea and I forgive each other.' },
      { who: 'Don Saro', text: 'You stood in the boat, so you are in the story now. In fifty years some picciriddu will row your oar and not know your name. Perfect.' },
    ],
    effects: ['set:c8.saro.blessed'],
  },
  'c8.saro.again': {
    lines: [
      { who: 'Don Saro', text: 'The rais takes the boat out most evenings to keep the young ones honest. Your bench is free, and your sash has not dried anyway.' },
    ],
    choices: [
      { text: 'Take the oar again', when: { has: ['c8.pisci.won'] }, goto: 'c8.saro.pisciReplay' },
      { text: 'Leave the sea to itself tonight', goto: 'c8.saro.idle' },
    ],
  },
  'c8.saro.pisciReplay': {
    lines: [
      { who: 'Don Saro', text: 'Go on, no saint watching this time, only the rais and his lungs. Listen for the call and pull with it. That is all rowing has ever been.' },
    ],
    effects: ['set:replay.mode', 'set:c8.pisci.start'],
  },
  'c8.saro.idle': {
    lines: [
      { who: 'Don Saro', text: 'Bells at noon, nets at dawn, and everything else as the day decides. Cumu veni si cunta, we say. We tell it as it comes.' },
    ],
  },

  // ---------------- Nino, who might leave ----------------
  'c8.nino.first': {
    lines: [
      { text: 'A young man is mending a net with the speed of someone whose hands are elsewhere. A duffel bag sits behind him, packed, not hidden.' },
      { who: 'Nino', text: 'You came here on purpose? To this town? Half my school is in Torino making cars, and you sail in the opposite direction.' },
      { who: 'Nino', text: 'Cu nesci arrinesci, they say. Who leaves, succeeds. They say it like a blessing. It lands like a shove.' },
    ],
    effects: ['set:met.nino', 'journal:people.nino'],
  },
  'c8.nino.argument': {
    lines: [
      { who: 'Nino', text: 'You saw the chair at the circolo. The empty one. That was my grandfather’s. The sea kept him and the chair keeps his shape.' },
      { who: 'Nino', text: 'My uncle says the boat is his if I stay. Torino says a wage is mine if I go. Both of them are right, that is the trap of it.' },
    ],
    choices: [
      { text: '"Go. The town will still be here."', goto: 'c8.nino.go' },
      { text: '"Stay. Wages exist here too."', goto: 'c8.nino.stay' },
      { text: 'Say nothing and hold the net taut', goto: 'c8.nino.quiet' },
    ],
  },
  'c8.nino.go': {
    lines: [
      { who: 'Nino', text: 'Will it? Talìa the shutters, half this street is closed. Towns are not stones, they are people agreeing to stay.' },
      { who: 'Nino', text: 'And still. When I picture Torino, I cannot hear anything. No bells, no water. Maybe that is what a wage sounds like.' },
      { text: 'He shrugs, unconvinced by you and by himself, in equal measure.' },
    ],
    effects: ['set:c8.nino.talk'],
  },
  'c8.nino.stay': {
    lines: [
      { who: 'Nino', text: 'Spoken like someone with a ticket out in their pocket. Forgive me, that was unfair. Also accurate.' },
      { who: 'Nino', text: 'The fish get fewer every year. My grandfather knew a sea I will never meet. You cannot inherit a boat and pretend it is a future.' },
      { text: 'He goes back to the net. The knot he ties is perfect and angrier than the last one.' },
    ],
    effects: ['set:c8.nino.talk'],
  },
  'c8.nino.quiet': {
    lines: [
      { text: 'You take the net’s far edge and pull it straight. He works toward you, knot by knot, and the silence does the talking.' },
      { who: 'Nino', text: 'You are the only person in this town who has not voted on my life today. I notice it. Grazie.' },
      { text: 'The bag stays packed. The net gets mended. Neither fact wins.' },
    ],
    effects: ['set:c8.nino.talk'],
  },
  'c8.nino.rowing': {
    lines: [
      { who: 'Nino', text: 'I row in the pageant, same as every year. My grandfather’s stroke, they tell me, as if the arms remember what the heart is arguing about.' },
    ],
  },
  'c8.nino.idle': {
    lines: [
      { who: 'Nino', text: 'The bag? Still packed. Maybe October, maybe not. Cumu veni si cunta. We will tell it as it comes.' },
    ],
  },

  // ---------------- Rosaria, the lemon grower ----------------
  'c8.rosaria.first': {
    lines: [
      { text: 'Among the terraces a woman is thinning green fruit, dropping the culls into a bucket with the rhythm of long habit.' },
      { who: 'Rosaria', text: 'Mind the wall, it is older than the church. Lava stone. ’A Muntagna built my terraces herself, the generous monster.' },
      { who: 'Rosaria', text: 'We say ’a Muntagna. The Mountain, and she is a she. She burns a vineyard one century, gifts this soil the next. You live with her moods.' },
    ],
    effects: ['set:met.rosaria', 'journal:words.amuntagna'],
  },
  'c8.rosaria.bread': {
    lines: [
      { text: 'Noon stops the work. From a cloth she unwraps a flat loaf, splits it, and dresses it from bottles: oil, tomato, oregano, anchovy, a white cheese.' },
      { who: 'Rosaria', text: 'Pane cunzato. Seasoned bread, the poor man’s feast. When there was nothing, there was still this, so it tastes like surviving. Eat.' },
      { text: 'The oil runs to your wrist. Under the lemon trees, with the sea flashing between leaves, poverty food tastes like the whole point of farming.' },
    ],
    effects: ['set:c8.cunzato', 'journal:dishes.panecunzato'],
  },
  'c8.rosaria.idle': {
    lines: [
      { who: 'Rosaria', text: 'When she rumbles we sweep the ash off the leaves and say nothing rude where she can hear. She is the neighbor. You do not move away from her.' },
    ],
  },

  // ---------------- Mang Ben, ashore where the fish are honest ----------------
  'c8.ben.hello': {
    lines: [
      { text: 'At the fish stall, a man with a towel over one shoulder is holding up a sardine and congratulating it personally. You know that towel.' },
      { who: 'Mang Ben', text: 'Pare! You! The Yacana provisions down the coast this week, so of course I came where the fish are honest. Cooks ashore have instincts.' },
      { who: 'Mang Ben', text: 'And this market SINGS. At home the vendors call; here they perform opera. Turi and I are already family. He does not know it yet.' },
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
      { text: 'He sets the sardine down with ceremony and says nothing for a moment. His eyes shine. He blames onions; the stall has no onions.' },
      { who: 'Mang Ben', text: 'Garlic first. Vinegar undisturbed. You kept the order across three oceans, pare. Half my own crew stirs early and they have SEEN me cry.' },
      { who: 'Mang Ben', text: 'One pot, one crossing, and it stayed with you. This is the whole reason cooks feed people. Now I have to hug you. Occupational.' },
    ],
  },
  'c8.ben.sour': {
    lines: [
      { who: 'Mang Ben', text: 'Sinigang, urojo, agrodolce: every honest coast keeps one sour pot. I have argued this at four stalls this morning and I am WINNING.' },
      { who: 'Mang Ben', text: 'Turi says vinegar is for fish already caught. I say sour is how a kitchen tells the truth. We have agreed to argue again tomorrow.' },
    ],
  },
  'c8.ben.fed': {
    lines: [
      { who: 'Mang Ben', text: 'House rule one, pare: nobody stands in my doorway hungry. The rule travels. Doorways are everywhere.' },
      { who: 'Mang Ben', text: 'And if you forget all else, keep this: adobo goes garlic first, vinegar undisturbed. And sinigang, the sour soup, for any homesick face.' },
    ],
  },
  'c8.ben.anchovies': {
    lines: [
      { text: 'Ben holds a tin of Sicilian anchovies up to the light like contraband, reading the label with the reverence of a man reading scripture.' },
      { who: 'Mang Ben', text: 'For research, pare. Strictly professional. If a little research ends up on the crew’s pizza night, that is between me and the tin.' },
      { who: 'Mang Ben', text: 'A galley is a museum that eats its exhibits. I am only keeping the collection current.' },
    ],
    effects: ['set:c8.ben.tin'],
  },
  'c8.ben.idle': {
    lines: [
      { who: 'Mang Ben', text: 'The ship loads tomatoes tomorrow, and me with them. Find me before we sail or the goodbye keeps until Manila. It keeps, pare, but badly.' },
    ],
  },

  // ---------------- Chasca, sketching the stones ----------------
  'c8.chasca.stones': {
    lines: [
      { who: 'Chasca', text: 'The soup-eater! Of course you are here. I ran out of film in Tunis so I have been drawing, look, the stones keep almost holding still.' },
      { who: 'Chasca', text: 'They say a blinded giant threw these at a ship that got away. Imagine missing so beautifully that towns grow up to look at it.' },
      { who: 'Chasca', text: 'One frame left, I lied, there is always one. Stand with the stones and the story behind you. Say fuzzy pickles!' },
    ],
    effects: ['set:met.chascaC8', 'set:photo.flash', 'set:photo.c8.stones'],
  },
  'c8.chasca.album': {
    lines: [
      { who: 'Chasca', text: 'Eight photographs now. A mountain, a pier, a ship, and you in front of each one, slightly more weathered, slightly more somebody.' },
      { who: 'Chasca', text: 'The album ends where you end. No, that came out wrong. Where you arrive. Better.' },
    ],
  },

  // ---------------- Signor Patanè, the shipping agent ----------------
  'c8.patane.first': {
    lines: [
      { text: 'At the mole’s end, a folding table, a ledger, a stamp, and a man keeping all three in the only sliver of shade.' },
      { who: 'Signor Patanè', text: 'Patanè, agente marittimo. There is a ship to Veracruz, in principle. The schedule exists the way saints exist: firmly, and invisibly.' },
      { who: 'Signor Patanè', text: 'I book passage for cargo and for people the town has finished with. You? The town has barely started. Come back when it lets go of you.' },
    ],
    effects: ['set:met.patane'],
  },
  'c8.patane.not': {
    lines: [
      { who: 'Signor Patanè', text: 'Not yet, friend. I can hear it from here: a table, a card game, a boat, an evening walk, all still holding your name. Settle your accounts.' },
    ],
  },
  'c8.patane.yes': {
    lines: [
      { who: 'Signor Patanè', text: 'So. Concetta fed you, the circolo seated you, the saint got you soaked, and last evening you walked like a local, which is to say, nowhere.' },
      { who: 'Signor Patanè', text: 'That is every stamp this office requires. The town has signed you out, with regret, which is the only honorable way to be signed out.' },
      { who: 'Signor Patanè', text: 'Veracruz, then the mountains of Mexico. The Atlantic is long and the coffee aboard is a penance. Say your goodbyes slowly.' },
    ],
    effects: ['set:c8.complete'],
  },
  'c8.patane.board': {
    lines: [
      { who: 'Signor Patanè', text: 'The ship is provisioned, in principle and in fact. When you are ready, the gangway is that direction and so is Mexico.' },
    ],
    choices: [
      { text: 'Board for Veracruz', goto: 'c8.depart' },
      { text: 'Not yet', goto: 'c8.patane.wait' },
    ],
  },
  'c8.patane.wait': {
    lines: [
      { who: 'Signor Patanè', text: 'Wise. A departure hurried is a departure regretted. The town will spend you gladly for another day.' },
    ],
  },
  'c8.depart': {
    lines: [
      { text: 'The lines come off. The faraglioni slide past one last time, black against the glare, and the town folds itself back into the coast.' },
      { text: 'Somewhere behind, a bell. Somewhere ahead, the Atlantic, and after it, a valley full of marigolds you do not yet know you are owed.' },
    ],
    effects: ['travel:oaxaca'],
  },

  // ---------------- post office ----------------
  'c8.post.pilar': {
    lines: [
      { text: 'The post office window is one counter and one fan, both from another century. The clerk produces an envelope addressed in invoice handwriting.' },
    ],
    effects: ['letter:sicily.pilar'],
  },
  'c8.post.mariamma': {
    lines: [
      { text: 'The clerk checks under the blotter and finds a second envelope, soft blue, smelling faintly of cardamom and sea mail.' },
    ],
    effects: ['letter:sicily.mariamma'],
  },
  'c8.post.idle': {
    lines: [
      { text: 'POSTE. The window is open, technically. The fan turns its head from side to side like it disagrees with the whole arrangement.' },
    ],
  },

  // ---------------- examines: new kinds ----------------
  'c8.ex.casedda': {
    lines: [
      { text: 'Plaster over lava stone: pastel walls with black bones. Laundry crosses between balconies like signal flags of ordinary life.' },
    ],
  },
  'c8.ex.basalto': {
    lines: [
      { text: 'Paving cut from old lava flows, black and faintly glassy. The town walks every evening on the mountain’s cooled temper.' },
    ],
  },
  'c8.ex.lavashore': {
    lines: [
      { text: 'A beach with no sand, only black rock rounded by patient water. It holds the day’s heat like a grudge, then gives it back at dusk.' },
    ],
  },
  'c8.ex.lavarock': {
    lines: [
      { text: 'A boulder of basalt, porous as bread. A thousand years ago it was in a hurry; it has been resting here ever since.' },
    ],
  },
  'c8.ex.faraglione': {
    lines: [
      { text: 'The faraglioni. The story says a blinded giant hurled them at a ship that got away, and missed forever.' },
      { text: 'Boats thread between them daily, unbothered. Living inside a myth is mostly a matter of parking.' },
    ],
  },
  'c8.ex.lemontree': {
    lines: [
      { text: 'A lemon tree in full argument with gravity. The fruit glows against the lava wall like lamps someone forgot to turn off.' },
    ],
  },
  'c8.ex.granitabar': {
    lines: [
      { text: 'Tubs of granita smooth as marble: lemon, almond, coffee, mulberry. Behind the glass, empty cannoli shells wait to be asked.' },
    ],
  },
  'c8.ex.fontana': {
    lines: [
      { text: 'The piazza fountain: a lava basin, a bronze spout worn bright by hands, and water that has not been turned off in living memory.' },
      { text: 'Two boys are filling a bottle for a grandmother who is watching from a chair to make sure it is done properly.' },
    ],
  },
  'c8.ex.bucato': {
    lines: [
      { text: 'A line of washing strung from a shutter to a hook across the lane: two shirts, a tablecloth, and somebody’s enormous blue trousers.' },
      { text: 'It is the only flag this street flies. In August it is dry before the pegs are cold.' },
    ],
  },
  'c8.ex.bartable': {
    lines: [
      { text: 'A little round table under an umbrella, sized for two elbows and one long morning. The shade underneath is communal property.' },
    ],
  },
  'c8.ex.barlamp': {
    lines: [
      { text: 'The bar’s lamp, iron and glass. At dusk it comes on first, and the passeggiata orbits it like slow moths with opinions.' },
    ],
  },
  'c8.ex.barca': {
    lines: [
      { text: 'A wooden boat painted white and azure with a red waterline, an eye at the prow, and PROVVIDENZA lettered on the bow.' },
      { text: 'The eye watches the horizon. Somebody repaints it every spring, first, before anything else.' },
    ],
  },
  'c8.ex.chiesa': {
    lines: [
      { text: 'The church wears grey and black basalt like Sunday clothes. Even God, on this coast, builds with what the mountain gives.' },
      { text: 'On the steps, festival scaffolding: half altar, half boat launch.' },
    ],
  },
  'c8.ex.vespa': {
    lines: [
      { text: 'A Vespa the color of pistachio gelato, leaning on its stand. It is older than the mayor and runs better; both facts are public record.' },
    ],
  },
  'c8.ex.postsign': {
    lines: [
      { text: 'POSTE. One window, one fan, one clerk. The mail moves at the speed of the fan.' },
    ],
  },
  'c8.ex.macchina': {
    lines: [
      { text: 'The espresso machine: chrome gone soft with polishing, a lever like a ship’s telegraph. It is older than every member, and louder.' },
    ],
  },
  'c8.ex.trofei': {
    lines: [
      { text: 'Trophies: a regatta cup, a scopa tournament plate from 1961, a swordfish bill mounted like a saint’s relic. Nobody dusts the second-place ones.' },
    ],
  },
  'c8.ex.lemoncrate': {
    lines: [
      { text: 'Lemon crates stamped COOP. AGRUMARIA in blue stencil. It sits crooked on every crate, the same crooked, which takes practice.' },
    ],
  },
  'c8.ex.testadimoro': {
    lines: [
      { text: 'A painted ceramic head with basil growing for hair. The legend: a Moor loved a local girl and meant to sail home to another life.' },
      { text: 'She kept his head for a planter. The basil thrives, and the town considers the matter settled in her favor.' },
    ],
  },
  'c8.ex.edicola': {
    lines: [
      { text: 'A votive shrine in the lava stone, the Madonna small and certain in her arch. Two electric candles burn with bureaucratic steadiness.' },
      { text: 'The sea wind kept taking the real flames, so faith on this coast learned wiring. Somebody still changes the bougainvillea daily.' },
    ],
  },
  'c8.ex.edicola2': {
    lines: [
      { text: 'A third candle has appeared since the pageant. Four rowers, one swimming fish, everyone home wet and safe: that is worth a bulb.' },
    ],
  },
  'c8.ex.fichidindia': {
    lines: [
      { text: 'Prickly pear, growing out of bare lava like it signed a lease. The fruit is sweet, the spines are personal, and the harvest gloves are not optional.' },
    ],
  },
  'c8.ex.nonnachair': {
    lines: [
      { text: 'A kitchen chair set outside the door at a precise angle. It marks where the afternoon shade will be, updated seasonally, accurate to the minute.' },
    ],
  },
  'c8.ex.gattu': {
    lines: [
      { text: 'A cat asleep in the fruit bowl by the door, using two lemons as pillows. The household lost this argument years ago and now just buys more bowls.' },
    ],
  },
  'c8.ex.campetto': {
    lines: [
      { text: 'A chalk goal on the wall, and beside it a score: three tallies against two, the two crossed out and rewritten in fresher chalk.' },
      { text: 'The dispute is in its third day. Nobody plays until it is settled, so everyone argues instead of practicing.' },
    ],
  },
  'c8.ex.pomodori': {
    lines: [
      { text: 'Tomato bunches drying on a frame of retired oars, going from red to a deeper red with opinions. Winter sauce, paying its rent in advance.' },
    ],
  },
  'c8.ex.avvisi': {
    lines: [
      { text: 'The church notice board: mass times, the feast committee, and U PISCI A MARI in letters bigger than both. A pinned note asks for one more rower.' },
    ],
  },
  'c8.ex.avvisi2': {
    lines: [
      { text: 'Under the festival bill someone has chalked ANNATA BONA. Good year. The board keeps the parish records; the chalk keeps the important ones.' },
    ],
  },
  'c8.ex.limoni': {
    lines: [
      { text: 'Windfall lemons in the grass, too bruised for the crates, too proud for the compost. The terrace smells like the inside of the color yellow.' },
    ],
  },
  'c8.ex.lavagna': {
    lines: [
      { text: 'The score blackboard. NOI and LORO, us and them, in tallies that reset every night and settle nothing across decades.' },
    ],
  },
  'c8.ex.ventola': {
    lines: [
      { text: 'The standing fan, a member since 1968. It turns to face each speaker in turn, like it is following the argument, which it is.' },
    ],
  },
  'c8.ex.rug': {
    lines: [
      { text: 'Two pezzare the color of old wine, overlapping beside the card table, worn to the weave where the elders stand to argue about a hand.' },
      { text: 'Woven out of shirts that stopped being shirts. You can pick out a collar stripe, and somebody\'s Sunday blue.' },
    ],
  },
  'c8.ex.mat': {
    lines: [
      { text: 'The doormat says nothing at all. Members wipe their feet out of respect, not instruction.' },
    ],
  },

  // ---------------- examines: shared kinds, this map's voice ----------------
  'c8.ex.sea': {
    lines: [
      { text: 'The sea here is a hard summer blue with black stones standing in it. Homer put a giant on this shore and the water has been smug since.' },
    ],
  },
  'c8.ex.stall': {
    lines: [
      { text: 'Turi’s bench: swordfish steaks on ice, a whole head presiding, sardines in silver ranks. The abbanniata hangs over it like weather.' },
    ],
  },
  'c8.ex.crate': {
    lines: [
      { text: 'Fish crates stenciled with three different owners’ names, all crossed out. The crate outlives every claim to it.' },
    ],
  },
  'c8.ex.net': {
    lines: [
      { text: 'Nets drying on black rock, gold cork and green mesh. Mending them is the evening’s excuse for talking.' },
    ],
  },
  'c8.ex.bench': {
    lines: [
      { text: 'A bench facing the water, worn smooth by decades of the same elbows. Front-row seats to the passeggiata; arrive early or stand.' },
    ],
  },
  'c8.ex.farol': {
    lines: [
      { text: 'A street lamp on an iron stem. The moths hold their own small passeggiata around it, faster and with worse manners.' },
    ],
  },
  'c8.ex.grass': {
    lines: [
      { text: 'Terrace green, the coast’s rarest color, rationed by walls of stacked lava stone. Every flat meter here was argued out of a slope.' },
    ],
  },
  'c8.ex.dirt': {
    lines: [
      { text: 'A lane of packed earth between plaster walls, exactly one Vespa wide, as all things here eventually are.' },
    ],
  },
  'c8.ex.tuft': {
    lines: [
      { text: 'Dry summer grass, holding its breath until the autumn rains. Everything here budgets its green.' },
    ],
  },
  'c8.ex.table': {
    lines: [
      { text: 'The card table, felt gone bald at the dealer’s corner. Scores are chalked in a code no living member remembers agreeing to.' },
    ],
  },
  'c8.ex.stool': {
    lines: [
      { text: 'One chair at the scopa table sits at a slight angle, pushed back years ago and never quite pushed in. Nobody straightens it.' },
    ],
  },
  'c8.ex.stool.won': {
    lines: [
      { text: 'The chair that waited years sits square to the table now, warm most afternoons. A chair in use is not a monument, and the elders prefer it so.' },
    ],
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
      { text: 'Under the swordfish bill, the mattanza argument settles in, comfortable as a cat. Peppino’s grandfather rode the nets right here, off these rocks.' },
      { text: 'Favignana, rules the rest of the table, the other coast entirely. The man saw one tuna from a ferry and never recovered.' },
    ],
    effects: ['set:c8.mattanza.heard'],
  },
  'c8.ex.tray': {
    lines: [
      { text: 'A rank of fresh shells cools on the little table, blistered and rude from the fryer, empty on purpose. Promises, waiting to be asked for.' },
    ],
    effects: ['set:c8.tray.rest'],
  },
  'c8.ex.shelf': {
    lines: [
      { text: 'Shelves of the circolo’s estate: dominoes, a barometer set permanently to fair, and coffee cups that are members in their own right.' },
    ],
  },
  'c8.ex.banco': {
    lines: [
      { text: 'The bar: dark wood, a zinc top worn pale where sixty years of elbows have leaned, and a brass rail nobody has polished since the brass was new.' },
      { text: 'Two cups upended on a folded cloth, a bottle of amaro at the level it is always at, and a saucer of receipts under a lemon.' },
    ],
  },
  'c8.ex.lampadario': {
    lines: [
      { text: 'One bulb under a green enamel shade, hung over the card table on a flex that has been shortened twice to get it lower.' },
      { text: 'Everything else in the room is lit by what this lamp spills. That is not an accident; it is where the cards are.' },
    ],
  },
  'c8.ex.net.circolo': {
    lines: [
      { text: 'A net bundled in the corner since spring, brought in to mend and mended in the way things are mended indoors: eventually.' },
    ],
  },
  'c8.ex.lemoncrate.circolo': {
    lines: [
      { text: 'The cooperative stores its crates here because the club is dry and the club is never locked. Nobody voted on this.' },
    ],
  },
  'c8.ex.gattu.circolo': {
    lines: [
      { text: 'The club cat, asleep on the lemons in the one draught between the door and the fan. Membership was never discussed.' },
    ],
  },
  'c8.ex.nonnachair.circolo': {
    lines: [
      { text: 'Mimmo’s chair, carried in from a kitchen forty years ago and angled to the door so he sees who arrives before they see him.' },
    ],
  },
  'c8.ex.ventola.circolo': {
    lines: [
      { text: 'The fan stands by the door pointed at nobody in particular, which is the only setting the membership has ever agreed on.' },
    ],
  },
  'c8.ex.wallcalce': {
    lines: [
      { text: 'Whitewash over lava block, laid on by hand every spring, and sea-green oil paint to shoulder height because shoulders lean.' },
      { text: 'Where the calce has come off, the basalt underneath is still black. The mountain is in the wall; the wall would rather you did not dwell on it.' },
    ],
  },
  'c8.ex.floorgraniglia': {
    lines: [
      { text: 'Graniglia: marble chips in cement, ground flat some time between the wars. Cold, loud, and outliving its fourth generation of scopa players.' },
    ],
  },
};

/** Sicilian examine arms; shared props keep their words at home via map tags. */
export const SICILY_EXAMINES: Record<string, ExamineArm[]> = {
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
  testadimoro: [{ node: 'c8.ex.testadimoro' }],
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
