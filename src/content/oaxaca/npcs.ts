import type { EventNode, ExamineArm, NodeMap, NpcDef } from '../schema';

/**
 * The valley village's people, late October. Spanish with Zapotec underneath
 * (padiuxi, guelaguetza), cohetes punctuating the mornings, and one ledger
 * that has been waiting fifty years for somebody to walk back in. Rules
 * unchanged: nobody lectures, warm corrections, the wrong branch is the
 * warmer scene, two short sentences.
 */

export const OAXACA_NPCS: NpcDef[] = [
  {
    id: 'refugio',
    name: 'Doña Refugio',
    map: 'cocina',
    // The night the ofrenda is finished she is not in her kitchen, because
    // nobody in this village is. She is at the camposanto wall (below).
    when: { not: ['c9.ofrenda.done'] },
    pos: [4, 3],
    range: 1,
    look: {
      skin: '#a06a42',
      hair: '#b8b2a6',
      cloth: '#e8dcc4',
      stripe: '#a02335',
      hat: '#e8dcc4',
      hatStyle: 'none',
      skirt: '#4a3a4e',
    },
    entry: [
      { when: { not: ['met.refugio'] }, node: 'c9.refugio.first' },
      { when: { has: ['errand.pan-refugio'], not: ['c9.bread.done'] }, node: 'c9.refugio.bread' },
      { when: { has: ['met.refugio', 'met.elias', 'met.chela'], not: ['c9.ledger.out'] }, node: 'c9.refugio.ledger' },
      { when: { has: ['c9.ledger.out'], not: ['c9.ledger'] }, node: 'c9.refugio.lookit' },
      { when: { has: ['c9.ledger'], not: ['c9.telegram'] }, node: 'c9.refugio.telegram' },
      {
        when: { has: ['c9.mole.done', 'c9.bread.done', 'c9.path.laid'], not: ['c9.family.done'] },
        node: 'c9.refugio.family',
      },
      { when: { has: ['c9.family.done'], not: ['c9.ofrenda.done'] }, node: 'c9.refugio.again' },
      { node: 'c9.refugio.idle' },
    ],
  },
  {
    id: 'elias',
    name: 'Elías',
    map: 'oaxaca',
    pos: [35, 12],
    range: 1,
    look: {
      skin: '#8f5c38',
      hair: '#3d3630',
      cloth: '#e8dcc4',
      stripe: '#a02335',
      hat: '#e8dcc4',
      hatStyle: 'none',
    },
    entry: [
      { when: { has: ['keepsake.band'], not: ['met.elias'] }, node: 'c9.elias.band' },
      { when: { not: ['met.elias'] }, node: 'c9.elias.first' },
      { when: { has: ['met.elias'], not: ['c9.elias2'] }, node: 'c9.elias.dye' },
      { node: 'c9.elias.idle' },
    ],
  },
  {
    id: 'chela',
    name: 'Abuela Chela',
    map: 'oaxaca',
    // After the vigil she is at the colectivo corner instead (chelaBye),
    // with tlayudas, and still with the spoon for anyone who asks.
    when: { not: ['c9.vigil.done'] },
    pos: [9, 22],
    range: 1,
    look: {
      skin: '#b97f52',
      hair: '#cfc8ba',
      cloth: '#3a4668',
      stripe: '#c98a2e',
      hat: '#e8dcc4',
      hatStyle: 'none',
      skirt: '#5c3a30',
    },
    entry: [
      { when: { not: ['met.chela'] }, node: 'c9.chela.first' },
      { when: { has: ['c9.ledger'], not: ['c9.mole.ask'] }, node: 'c9.chela.mole' },
      { when: { has: ['c9.chiles'], not: ['c9.chiles.done'] }, node: 'c9.chela.chiles' },
      { when: { has: ['c9.choco'], not: ['c9.choco.done'] }, node: 'c9.chela.choco' },
      { when: { has: ['c9.choco.done'], not: ['c9.mole.done'] }, node: 'c9.chela.again' },
      { when: { has: ['c9.mole.done'], not: ['c9.complete'] }, node: 'c9.chela.rest' },
      { when: { has: ['c9.mole.done'] }, node: 'c9.chela.moleAgain' },
      { node: 'c9.chela.idle' },
    ],
  },
  {
    id: 'eugenia',
    name: 'Doña Eugenia',
    map: 'oaxaca',
    pos: [13, 13],
    range: 1,
    look: {
      skin: '#c98f5e',
      hair: '#2e2018',
      cloth: '#c1512f',
      stripe: '#e8dcc4',
      hat: '#e8dcc4',
      hatStyle: 'none',
      skirt: '#3c5a50',
    },
    entry: [
      { when: { not: ['met.eugenia'] }, node: 'c9.eugenia.first' },
      { when: { has: ['errand.chela-chiles'], not: ['c9.chiles'] }, node: 'c9.eugenia.chiles' },
      { node: 'c9.eugenia.idle' },
    ],
  },
  {
    id: 'tacho',
    name: 'Tacho',
    map: 'oaxaca',
    pos: [28, 11],
    range: 1,
    look: {
      skin: '#a06a42',
      hair: '#1c1410',
      cloth: '#e2d4b4',
      stripe: '#b5573a',
      hat: '#e8dcc4',
      hatStyle: 'none',
    },
    entry: [
      { when: { not: ['met.pan'] }, node: 'c9.pan.first' },
      { when: { has: ['errand.chela-choco'], not: ['c9.choco'] }, node: 'c9.pan.choco' },
      { when: { has: ['c9.ledger'], not: ['c9.bread.ask'] }, node: 'c9.pan.bread' },
      { node: 'c9.pan.idle' },
    ],
  },
  {
    id: 'silvino',
    name: 'Silvino',
    map: 'oaxaca',
    pos: [17, 24],
    range: 1,
    look: {
      skin: '#8f5c38',
      hair: '#241a12',
      cloth: '#5fb0a5',
      stripe: '#c94f7c',
      hat: '#e8dcc4',
      hatStyle: 'none',
    },
    entry: [
      { when: { not: ['met.carver'] }, node: 'c9.carver.first' },
      { when: { has: ['met.carver', 'met.kid'], not: ['c9.carver2'] }, node: 'c9.carver.second' },
      { when: { not: ['c9.carver.i1'] }, node: 'c9.carver.idle' },
      { when: { not: ['c9.carver.i2'] }, node: 'c9.carver.idle2' },
      { node: 'c9.carver.idle3' },
    ],
  },
  {
    id: 'nico',
    name: 'Nico',
    map: 'oaxaca',
    pos: [20, 20],
    range: 3,
    look: {
      skin: '#b97f52',
      hair: '#1c1410',
      cloth: '#d9694a',
      stripe: '#8fcbe8',
      hat: '#e8dcc4',
      hatStyle: 'none',
      kid: true,
    },
    entry: [
      { when: { not: ['met.kid'] }, node: 'c9.kid.first' },
      { when: { has: ['met.kid', 'c9.carver2'], not: ['c9.kid2'] }, node: 'c9.kid.two' },
      { node: 'c9.kid.idle' },
    ],
  },
  {
    id: 'meliton',
    name: 'Don Melitón',
    map: 'camposanto',
    pos: [11, 6],
    range: 1,
    look: {
      skin: '#8f5c38',
      hair: '#6b655c',
      cloth: '#5c6e77',
      stripe: '#c9a35f',
      hat: '#d0b276',
      hatStyle: 'montera',
    },
    entry: [
      { when: { has: ['c9.ledger'], not: ['met.caretaker', 'c9.path.task'] }, node: 'c9.care.meet' },
      { when: { not: ['met.caretaker'] }, node: 'c9.care.first' },
      { when: { has: ['c9.debt.paid', 'c9.ofrenda.done'], not: ['c9.vigil.done'] }, node: 'c9.vigil' },
      { when: { has: ['c9.ledger'], not: ['c9.path.task'] }, node: 'c9.care.path' },
      { when: { has: ['c9.path.task'], not: ['c9.path.laid'] }, node: 'c9.care.wait' },
      { when: { has: ['c9.vigil.done'] }, node: 'c9.care.after' },
      { node: 'c9.care.idle' },
    ],
  },
  // ---- the vigil. Present only on the night the ofrenda is finished, which
  // is the night the chapter has been walking toward. Before that the yard is
  // Melitón, a broom and a lot of swept dirt; after it, this. ----
  {
    id: 'refugioVigil',
    name: 'Doña Refugio',
    map: 'camposanto',
    // She keeps the wall until she has seen you off at the colectivo corner;
    // the vigil ends with you carried straight there at first light, so the
    // two of her are never in sight of each other.
    when: { has: ['c9.ofrenda.done'], not: ['c9.bye'] },
    pos: [11, 11],
    range: 0,
    look: {
      skin: '#a06a42',
      hair: '#b8b2a6',
      cloth: '#e8dcc4',
      stripe: '#a02335',
      hat: '#e8dcc4',
      hatStyle: 'none',
      skirt: '#4a3a4e',
    },
    entry: [{ node: 'c9.refugio.tonight' }],
  },
  // ---- first light at the colectivo corner: the two who fed you see you
  // off. Nobody arranged it; everybody knew. ----
  {
    id: 'refugioBye',
    name: 'Doña Refugio',
    map: 'oaxaca',
    when: { has: ['c9.vigil.done'] },
    pos: [22, 28],
    range: 0,
    look: {
      skin: '#a06a42',
      hair: '#b8b2a6',
      cloth: '#e8dcc4',
      stripe: '#a02335',
      hat: '#e8dcc4',
      hatStyle: 'none',
      skirt: '#4a3a4e',
    },
    entry: [
      { when: { has: ['c9.vigil.done'], not: ['c9.bye'] }, node: 'c9.bye' },
      { node: 'c9.refugio.after' },
    ],
  },
  {
    id: 'chelaBye',
    name: 'Abuela Chela',
    map: 'oaxaca',
    when: { has: ['c9.vigil.done'] },
    pos: [24, 28],
    range: 0,
    look: {
      skin: '#b97f52',
      hair: '#cfc8ba',
      cloth: '#3a4668',
      stripe: '#c98a2e',
      hat: '#e8dcc4',
      hatStyle: 'none',
      skirt: '#5c3a30',
    },
    entry: [
      { when: { has: ['c9.vigil.done'], not: ['c9.bye'] }, node: 'c9.bye' },
      { node: 'c9.chela.moleAgain' },
    ],
  },
  {
    id: 'epifania',
    name: 'Doña Epifania',
    map: 'camposanto',
    when: { has: ['c9.ofrenda.done'] },
    pos: [6, 5],
    range: 0,
    look: {
      skin: '#b97f52',
      hair: '#d6d0c4',
      cloth: '#5c3a5e',
      stripe: '#e8dcc4',
      hat: '#e8dcc4',
      hatStyle: 'none',
      skirt: '#2f3a52',
    },
    entry: [{ node: 'c9.vigil.epifania' }],
  },
  {
    id: 'bernardo',
    name: 'Bernardo',
    map: 'camposanto',
    when: { has: ['c9.ofrenda.done'] },
    pos: [16, 5],
    range: 0,
    look: {
      skin: '#8f5c38',
      hair: '#241a12',
      cloth: '#3a4668',
      stripe: '#c9a35f',
      hat: '#d0b276',
      hatStyle: 'montera',
    },
    entry: [{ node: 'c9.vigil.bernardo' }],
  },
  {
    id: 'luz',
    name: 'Luz',
    map: 'camposanto',
    when: { has: ['c9.ofrenda.done'] },
    pos: [12, 6],
    range: 2,
    look: {
      skin: '#c98f5e',
      hair: '#2e2018',
      cloth: '#c1512f',
      stripe: '#f2e6d0',
      hat: '#e8dcc4',
      hatStyle: 'none',
      skirt: '#3c5a50',
    },
    entry: [{ node: 'c9.vigil.luz' }],
  },
  {
    id: 'serafin',
    name: 'Serafín',
    map: 'camposanto',
    when: { has: ['c9.ofrenda.done'] },
    pos: [8, 9],
    range: 0,
    look: {
      skin: '#a06a42',
      hair: '#6b655c',
      cloth: '#5c6e77',
      stripe: '#a02335',
      hat: '#e8dcc4',
      hatStyle: 'none',
    },
    entry: [{ node: 'c9.vigil.serafin' }],
  },
  {
    id: 'chuy',
    name: 'Chuy',
    map: 'camposanto',
    when: { has: ['c9.ofrenda.done'] },
    pos: [12, 9],
    range: 2,
    look: {
      skin: '#b97f52',
      hair: '#1c1410',
      cloth: '#5fb0a5',
      stripe: '#d9a441',
      hat: '#e8dcc4',
      hatStyle: 'none',
      kid: true,
    },
    entry: [{ node: 'c9.vigil.chuy' }],
  },
  {
    id: 'chascaC9',
    name: 'Chasca',
    map: 'oaxaca',
    pos: [6, 27],
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
      { when: { not: ['met.chascaC9'] }, node: 'c9.chasca.field' },
      { node: 'c9.chasca.album' },
    ],
  },
];

export const OAXACA_NODES: NodeMap = {
  // The walls themselves; without this arm they fall through to the
  // village's adobe line, which reads strangely far from the altiplano.
  'c9.ex.wall': {
    lines: [{ text: "Adobe under paint the colour of a parrot's opinion. Where a flake has fallen, an older colour was waiting." }],
  },
  // ---------------- arrival ----------------
  'c9.arrive': {
    lines: [
      { text: 'The colectivo shudders off toward the highway. A cohete goes up, one bang, and the dogs complain professionally.' },
      { text: 'Woodsmoke, copal, a tuba practicing behind a door. The village smells faintly of oranges that turn out to be flowers.' },
    ],
    effects: ['set:c9.arrived'],
  },

  // ---------------- Doña Refugio, the tejatera ----------------
  'c9.refugio.first': {
    lines: [
      { text: 'In the cool kitchen a woman lifts corn-and-cacao in a clay basin with her forearm until white foam rises.' },
      { who: 'Doña Refugio', text: 'Tejate. Sit. The foam does not wait for introductions.' },
      { who: 'Doña Refugio', text: 'You carry that book like something you have stopped noticing you hold. Come back when you have met my village.' },
    ],
    effects: ['set:met.refugio', 'journal:people.refugio', 'journal:dishes.tejate'],
  },
  // The ledger is not narrated at you. She sets it on the table and you read
  // it yourself: the examine on the table (c9.ledger.read) finds the line.
  'c9.refugio.ledger': {
    lines: [
      { who: 'Doña Refugio', text: 'Elías told me about your wrist. Chela told me about your appetite. Now show me the book.' },
      { text: 'She turns the pages with a wet thumb, and then she stops turning.' },
      { who: 'Doña Refugio', text: 'This hand wrote in my mother’s kitchen. I was nine.' },
      { text: 'From under the altar table she brings a notebook, spine mended with cloth, lays it open on the table, and waits.' },
    ],
    effects: ['set:c9.ledger.out'],
  },
  'c9.refugio.lookit': {
    lines: [{ who: 'Doña Refugio', text: 'It is on the table. Read it the way she read your book: slowly.' }],
  },
  'c9.refugio.telegram': {
    lines: [
      { who: 'Doña Refugio', text: 'She stayed the week before the fiesta, right where you stand. She was going to help with the mole.' },
      { text: 'From the back of the ledger she takes a folded paper, soft as cloth at the creases, and puts it in your hands.' },
      { who: 'Doña Refugio', text: 'She left that same night, and the road never brought her back.' },
    ],
    effects: ['set:c9.telegram', 'letter:oax.telegram', 'journal:her.oaxaca'],
    next: 'c9.refugio.name',
  },
  'c9.refugio.name': {
    lines: [
      { who: 'Doña Refugio', text: 'My mother kept her cup on the shelf a whole year. Then she wrote the line, so we would not be allowed to forget.' },
      { text: 'You say the name you called her: Nani. Refugio repeats it once, and now the village has it too.' },
    ],
    choices: [
      {
        text: 'Answer Old Man Cho, half a world late: say what it weighs',
        goto: 'c9.refugio.riddle',
        when: { has: ['riddle.cho'] },
      },
      { text: 'Ask what a guelaguetza asks of you', goto: 'c9.refugio.chain' },
    ],
  },
  'c9.refugio.riddle': {
    lines: [
      { text: 'Ayni, yapa, deom, pilón, guelaguetza. In Busan an old tea sage asked what the weightless thing weighs.' },
      { text: 'You answer him out loud: nothing. And a village remembers it for fifty years.' },
      { who: 'Doña Refugio', text: 'Tell whoever asked you that an old woman in the valley says: correct.' },
    ],
    effects: ['set:c9.riddle.answered'],
    next: 'c9.refugio.owe',
  },
  'c9.refugio.chain': {
    lines: [
      { who: 'Doña Refugio', text: 'Not charity, not a bill. Today for you, tomorrow for me. A debt of kindness shames nobody; it only waits.' },
    ],
    next: 'c9.refugio.owe',
  },
  'c9.refugio.owe': {
    lines: [
      { who: 'Doña Refugio', text: 'It is owed to a family, and here is her family, standing in my kitchen.' },
      { who: 'Doña Refugio', text: 'Work her week, the one she never finished. Then we will talk about the next page.' },
    ],
  },
  'c9.refugio.bread': {
    lines: [
      { text: 'You set the basket down. Orange blossom and egg bread take the room without a fight.' },
      { who: 'Doña Refugio', text: 'Straight from the oven to the altar. Look at you, carrying bread through this village. Fifty years folds up very small.' },
    ],
    effects: ['errand.done', 'clear:errand.pan-refugio', 'set:c9.bread.done'],
  },
  // The altar itself is shown by the build game and by the ofrenda examine;
  // here the work is one beat, and then the page that turns the chapter.
  'c9.refugio.family': {
    lines: [
      { text: 'All afternoon you hand her things before she asks, until she stops noticing you are a guest.' },
      { who: 'Doña Refugio', text: 'There. Mole, bread, path. The ledger line is paid, corazón. Fifty years late and right on time.' },
    ],
    effects: ['set:c9.family.done', 'set:c9.debt.paid'],
    next: 'c9.refugio.page2',
  },
  'c9.refugio.page2': {
    lines: [
      { text: 'She turns the page to cross the line out. Below it, in her mother’s smaller hand: Debts of kindness pass to the children. Both directions.' },
      { who: 'Doña Refugio', text: 'Both directions, corazón. You paid hers. Now this village pays what it owes her, to you. We are building your Nani an ofrenda.' },
    ],
    next: 'c9.altar.hub',
  },
  'c9.altar.hub': {
    lines: [{ who: 'Doña Refugio', text: 'What did the road put in your hands? Bring all of it.' }],
    choices: [
      {
        text: 'The omiyage from Shionoura, chosen for Doña Petro and never posted',
        goto: 'c9.altar.omiyage',
        when: { has: ['omiyage.petro'], not: ['c9.of.omiyage'] },
      },
      {
        text: 'The omiyage from Shionoura, chosen for Pilar and never posted',
        goto: 'c9.altar.omiyage',
        when: { has: ['omiyage.pilar'], not: ['c9.of.omiyage'] },
      },
      {
        text: 'The omiyage from Shionoura, chosen for Aurelio and never posted',
        goto: 'c9.altar.omiyage',
        when: { has: ['omiyage.aurelio'], not: ['c9.of.omiyage'] },
      },
      {
        text: 'The kanga Bi Amina folded for giving',
        goto: 'c9.altar.kanga',
        when: { has: ['kanga.gift'], not: ['c9.of.kanga'] },
      },
      {
        text: 'The tanzaku wish for a safe road',
        goto: 'c9.altar.wish',
        when: { has: ['wish.road'], not: ['c9.of.wish'] },
      },
      {
        text: 'The tanzaku wish for the people of the road',
        goto: 'c9.altar.wish',
        when: { has: ['wish.people'], not: ['c9.of.wish'] },
      },
      {
        text: 'The tanzaku wish about finding her',
        goto: 'c9.altar.wish',
        when: { has: ['wish.nani'], not: ['c9.of.wish'] },
      },
      { text: 'Light the candles and begin', goto: 'c9.altar.begin' },
      { text: 'Not yet. Your hands are not ready.', goto: 'c9.altar.wait' },
    ],
  },
  'c9.altar.omiyage': {
    lines: [
      { text: 'The little parcel from the Seto sea, still in its careful paper.' },
      { who: 'Doña Refugio', text: 'A gift that traveled this far is not late. It is on time for a different person.' },
    ],
    effects: ['set:c9.of.omiyage'],
    next: 'c9.altar.hub',
  },
  'c9.altar.kanga': {
    lines: [
      { text: 'She reads the kanga’s proverb aloud. She cannot read Swahili, and she gets it right anyway.' },
      { who: 'Doña Refugio', text: 'One worn, one given. My mother’s notebook knew the same arithmetic.' },
    ],
    effects: ['set:c9.of.kanga'],
    next: 'c9.altar.hub',
  },
  'c9.altar.wish': {
    lines: [
      { text: 'The Tanabata paper has gone soft at the folds. The wish is still legible. It mostly came true.' },
      { who: 'Doña Refugio', text: 'Where else do wishes and the dead both get fed?' },
    ],
    effects: ['set:c9.of.wish'],
    next: 'c9.altar.hub',
  },
  'c9.altar.begin': {
    lines: [
      { who: 'Doña Refugio', text: 'Three levels. What guides her, what feeds her, what walks with her. Your hands, corazón.' },
    ],
    effects: ['set:c9.ofrenda.start'],
  },
  'c9.altar.wait': {
    lines: [{ who: 'Doña Refugio', text: 'The candles keep. Altars are patient; it is their whole profession.' }],
  },
  'c9.ofrenda.built': {
    lines: [
      { who: 'Doña Refugio', text: 'All this time she had no place set in this valley. Look at her now.' },
      { text: 'The journal sits at the altar’s foot, closed. For once it does not feel half finished. It feels half full.' },
      { who: 'Doña Refugio', text: 'Tonight we take the last candle to the camposanto.' },
    ],
    // The customs page fills here, with your own hands just off the altar: the
    // elements taught themselves as you placed them.
    effects: ['clear:c9.ofrenda.start', 'set:c9.ofrenda.done', 'journal:customs.ofrenda'],
  },
  'c9.refugio.again': {
    lines: [{ who: 'Doña Refugio', text: 'The small table is waiting. Nobody builds an altar alone; that is nearly the law here.' }],
    next: 'c9.altar.hub',
  },
  // At the wall, at the vigil, with her family's row behind her.
  'c9.refugio.tonight': {
    lines: [
      { text: 'She has claimed a piece of the south wall: a blanket, a basket, and one candle set apart from her family’s row.' },
      { who: 'Doña Refugio', text: 'That one faces out, toward the road. A light set that way is for somebody still walking.' },
    ],
  },
  'c9.refugio.after': {
    lines: [
      { who: 'Doña Refugio', text: 'The ledger is closed, both directions. That does not mean you stop being family. It means you start.' },
      { who: 'Doña Refugio', text: 'Go the long way home. The colectivo knows the road to the coast; it has been practicing.' },
    ],
  },
  // First light at the corner. Short on purpose: these two say goodbye the
  // way they cook, with their hands busy.
  'c9.bye': {
    lines: [
      { text: 'First light. Refugio and Chela are at the colectivo corner before you, which nobody arranged and everybody knew.' },
      { who: 'Abuela Chela', text: 'Tlayudas, two. One for the road, and one for whoever on the road looks hungriest. You will know them.' },
      { who: 'Doña Refugio', text: 'The ledger has a new line. Your name, and nothing owed. I left room under it.' },
      { who: 'Abuela Chela', text: 'Do not cry on the tlayudas. They are wrapped for dry weather.' },
      { text: 'Refugio straightens your collar, which did not need it, and steps back so the road can have you.' },
    ],
    effects: ['set:c9.bye', 'set:c9.complete'],
  },
  'c9.refugio.idle': {
    lines: [{ who: 'Doña Refugio', text: 'The fiesta has enough people talking. It is short of people doing.' }],
  },

  // ---------------- Elías, cochineal red ----------------
  'c9.elias.band': {
    lines: [
      { text: 'The weaver’s hand closes gently around your wrist before either of you says a word.' },
      { who: 'Elías', text: 'Padiuxi. Forgive my hands, they saw it first. Where did a traveler get this red?' },
      { who: 'Elías', text: 'Grana cochinilla. A bug from the nopal, born in your mountains. My yarn is dyed with it, and so is your wrist.' },
    ],
    effects: ['set:met.elias', 'journal:people.elias', 'journal:customs.grana'],
  },
  'c9.elias.first': {
    lines: [
      { text: 'A man at a standing loom in his doorway walks deep red up the warp, a thread at a time.' },
      { who: 'Elías', text: 'Padiuxi. That is a hello. The loom does not mind an audience, it minds a hurry.' },
    ],
    effects: ['set:met.elias', 'journal:people.elias'],
    choices: [
      { text: 'Ask about the red', goto: 'c9.elias.red' },
      { text: 'Ask about the cloth on the loom', goto: 'c9.elias.loom' },
    ],
  },
  'c9.elias.red': {
    lines: [
      { who: 'Elías', text: 'Grana cochinilla. An insect from the nopal, dried and crushed. The Spaniards shipped it out like red gold.' },
      { who: 'Elías', text: 'It dyed cloth in the Andes a thousand years before it made Oaxaca rich. Red with a passport.' },
    ],
    effects: ['journal:customs.grana'],
  },
  'c9.elias.loom': {
    lines: [
      { who: 'Elías', text: 'The diamond is the valley. The red is an insect’s whole opinion. Ask me about the red some time.' },
    ],
  },
  'c9.elias.dye': {
    lines: [
      { who: 'Elías', text: 'Grana with lime makes flame; grana with ash makes wine. One insect, a whole argument of reds.' },
      { who: 'Elías', text: 'For the fiesta I dye double. The dead see red at any hour, my grandmother said.' },
    ],
    effects: ['set:c9.elias2', 'journal:customs.grana'],
  },
  'c9.elias.idle': {
    lines: [{ who: 'Elías', text: 'Thread, beat, thread, beat. A tapestry is patience with a pattern to hide inside.' }],
  },

  // ---------------- Abuela Chela, the mole ----------------
  'c9.chela.first': {
    lines: [
      { text: 'On Refugio’s patio an old woman commands a comal the size of a wagon wheel. A tlayuda browns on it, big as the moon.' },
      { who: 'Abuela Chela', text: 'You look hungry in the way of travelers. Sit on the low stool; it is for guests who stay.' },
      { text: 'A neighbor passing the gate calls out: ¡provecho! You have never met her. Chela answers for you: gracias, igualmente.' },
    ],
    effects: ['set:met.chela', 'journal:people.chela', 'journal:dishes.tlayuda', 'journal:words.provecho'],
  },
  'c9.chela.mole': {
    lines: [
      { who: 'Abuela Chela', text: 'So you found the line. Then you know this mole negro is three days old and two days from done.' },
      { who: 'Abuela Chela', text: 'I am short the chiles that matter. Eugenia holds them at her stall. Do not shake the bag; chiles bruise like opinions.' },
    ],
    effects: ['set:c9.mole.ask', 'errand:chela-chiles', 'set:errand.chela-chiles'],
  },
  'c9.chela.chiles': {
    lines: [
      { text: 'You call her name from the gate. Without turning from the comal she answers: ¿Mande?' },
      { who: 'Abuela Chela', text: 'Mande, we say, not qué. My mother reached for the spoon over qué.' },
      { who: 'Abuela Chela', text: 'Good chiles. Now the chocolate: Tacho, the good disc, not the tourist disc.' },
    ],
    effects: [
      'journal:words.mande',
      'errand.done',
      'clear:errand.chela-chiles',
      'set:c9.chiles.done',
      'errand:chela-choco',
      'set:errand.chela-choco',
    ],
  },
  'c9.chela.choco': {
    lines: [
      { text: 'The chocolate disc goes into her palm and she nods once, which from Chela is a parade.' },
    ],
    effects: ['errand.done', 'clear:errand.chela-choco', 'set:c9.choco.done'],
    next: 'c9.chela.stir',
  },
  'c9.chela.stir': {
    lines: [
      { who: 'Abuela Chela', text: 'The pot wants an hour of stirring, and my shoulder is older than the pot.' },
      { who: 'Abuela Chela', text: 'Your Nani was promised this exact hour. She left before it. Take the spoon?' },
    ],
    choices: [
      { text: 'Take the spoon', goto: 'c9.chela.stiryes' },
      { text: 'Not yet', goto: 'c9.chela.stirno' },
    ],
  },
  'c9.chela.stiryes': {
    lines: [{ who: 'Abuela Chela', text: 'With the pot, never against it. The mole sets the pace.' }],
    effects: ['set:c9.mole.start'],
  },
  'c9.chela.stirno': {
    lines: [{ who: 'Abuela Chela', text: 'The pot can idle. Idling is half of cooking. The other half is showing up.' }],
  },
  'c9.chela.again': {
    lines: [{ who: 'Abuela Chela', text: 'The spoon has not forgotten you. Neither have I.' }],
    next: 'c9.chela.stir',
  },
  'c9.mole.stirred': {
    lines: [
      { text: 'Somewhere in the hour your arm becomes the pot’s. The mole turns glossy, black as a polished olla, quiet.' },
      { who: 'Abuela Chela', text: 'There. I promised a traveler she would stir this pot. Her family kept the appointment.' },
      { text: 'She says it to the steam, like the steam has ears. This week, it might.' },
    ],
    effects: ['clear:c9.mole.start', 'set:c9.mole.done', 'journal:dishes.molenegro'],
  },
  'c9.chela.rest': {
    lines: [
      { who: 'Abuela Chela', text: 'The mole rests until the fiesta, and so should you. Here, a spoonful over rice, for quality control. You are the control.' },
      { text: 'A neighbor at the gate is eating a memela. You say ¡provecho! before you think. She grins: gracias, igualmente.' },
    ],
    next: 'c9.chela.moleAgain',
  },
  'c9.chela.moleAgain': {
    lines: [{ who: 'Abuela Chela', text: 'There is always another pot, mi vida. This valley eats mole faster than one shoulder stirs it.' }],
    choices: [
      { text: 'Take the spoon again', when: { has: ['c9.mole.done'] }, goto: 'c9.chela.moleReplay' },
      { text: 'Let the pot rest', goto: 'c9.chela.idle' },
    ],
  },
  'c9.chela.moleReplay': {
    lines: [{ who: 'Abuela Chela', text: 'Bueno. Nothing to prove tonight. Only the circles, the smoke, and me at your elbow.' }],
    effects: ['set:replay.mode', 'set:c9.mole.start'],
  },
  'c9.chela.idle': {
    lines: [{ who: 'Abuela Chela', text: 'Tortillas daily, memelas for whoever earns them, and one mole a year that eats the whole week.' }],
  },

  // ---------------- Doña Eugenia, marchanta ----------------
  'c9.eugenia.first': {
    lines: [
      { who: 'Doña Eugenia', text: '¡Pásele, marchanta, pásele! Chiles, cacao, sal de gusano.' },
      { who: 'Doña Eugenia', text: 'Marchanta is what we call each other, you and I. Buy from me twice and the word does the rest.' },
    ],
    effects: ['set:met.eugenia', 'journal:words.marchanta'],
  },
  'c9.eugenia.chiles': {
    lines: [
      { who: 'Doña Eugenia', text: 'For Chela’s mole? Then the chilhuacle I keep under the table. One little valley grows it.' },
      { text: 'She wraps the dark chiles, then drops a fistful of cacao beans on top without a word.' },
      { who: 'Doña Eugenia', text: 'The pilón, marchanta. You do not ask, I do not explain.' },
    ],
    effects: ['set:c9.chiles', 'journal:customs.pilon'],
  },
  'c9.eugenia.idle': {
    lines: [
      { who: 'Doña Eugenia', text: 'Tomorrow the tianguis is in the next town, and I go where it goes. Today it is my patio.' },
    ],
    choices: [
      { text: '"Doña Eugenia, where was I headed?"', goto: 'c9.eugenia.thread' },
      { text: 'Smell the chiles a moment longer', goto: 'c9.eugenia.threadNo' },
    ],
  },
  'c9.eugenia.thread': {
    lines: [{ who: 'Doña Eugenia', text: 'Ay, marchanta. Ask your wrist; it shops smarter than you.' }],
    effects: ['thread:'],
  },
  'c9.eugenia.threadNo': {
    lines: [{ who: 'Doña Eugenia', text: 'Take your time. The pasilla waited fifty years for its pot.' }],
  },

  // ---------------- Tacho, the panadero ----------------
  'c9.pan.first': {
    lines: [
      { text: 'The panadería breathes heat into the lane. Each loaf cooling by the door wears a small painted face.' },
      { who: 'Tacho', text: 'Pan de muerto, with the carita on top. Here the bread looks back at you. It is only polite.' },
      { who: 'Tacho', text: 'The next batch comes out ahorita. Ahorita is a word with room in it.' },
    ],
    effects: ['set:met.pan', 'journal:people.panadero'],
  },
  'c9.pan.choco': {
    lines: [
      { who: 'Tacho', text: 'For the mole? Then the good disc, stone-ground. The tourist disc is for people who drink with their eyes.' },
      { text: 'While he wraps it he beats a cup of chocolate de agua to foam for you, water-dark and honest.' },
    ],
    effects: ['set:c9.choco', 'journal:dishes.chocolatedeagua'],
  },
  'c9.pan.bread': {
    lines: [
      { text: 'The batch you were promised ahorita arrives one errand, two conversations, and one stirred pot later.' },
      { who: 'Tacho', text: 'You see? Ahorita came. It just refuses to be supervised.' },
      { who: 'Tacho', text: 'This basket is for Refugio’s altar. Carry it warm; that is the whole trick.' },
    ],
    effects: [
      'journal:words.ahorita',
      'journal:dishes.pandemuerto',
      'set:c9.bread.ask',
      'errand:pan-refugio',
      'set:errand.pan-refugio',
    ],
  },
  'c9.pan.idle': {
    lines: [{ who: 'Tacho', text: 'Flour at four, ovens at five, caritas at six. The dead eat better than the living this month.' }],
    choices: [
      { text: '"Tacho, what was I meant to be doing?"', goto: 'c9.pan.thread' },
      { text: 'Breathe the oven air', goto: 'c9.pan.threadNo' },
    ],
  },
  'c9.pan.thread': {
    lines: [{ who: 'Tacho', text: 'Follow the red, amigo. Dough and travelers both rise where they are put.' }],
    effects: ['thread:'],
  },
  'c9.pan.threadNo': {
    lines: [{ who: 'Tacho', text: 'Best smell in the valley, and it is free.' }],
  },

  // ---------------- Silvino, the alebrije carver ----------------
  'c9.carver.first': {
    lines: [
      { text: 'A man paints dots on a carved creature: half iguana, half trumpet, somehow also a cat.' },
      { who: 'Silvino', text: 'Alebrijes. I dream them, the copal wood argues, we settle out of court.' },
    ],
    effects: ['set:met.carver', 'journal:people.carver'],
    choices: [
      { text: '"These must be ancient. Spirit guides, no?"', goto: 'c9.carver.honest' },
      { text: 'Ask what he dreams', goto: 'c9.carver.dreams' },
    ],
  },
  'c9.carver.honest': {
    lines: [
      { who: 'Silvino', text: 'Ha! Ancient like my bicycle. Pedro Linares dreamed them in a fever around 1936, in Mexico City. Paper first, wood later.' },
      { who: 'Silvino', text: 'Newness is not a scandal, friend. Every tradition was Tuesday once.' },
    ],
  },
  'c9.carver.dreams': {
    lines: [
      { who: 'Silvino', text: 'Last night, a donkey with fish for ears. The night before, nothing, so I painted the tail of the nothing. It sold by noon.' },
    ],
  },
  'c9.carver.second': {
    lines: [
      { who: 'Silvino', text: 'Nico told you they are ancient guardians? His cousin saw a movie. I told him about the fever. He liked it better.' },
      { who: 'Silvino', text: 'Since the movie, some visitors come to see and some to take. Be the kind that sees.' },
    ],
    effects: ['set:c9.carver2'],
  },
  'c9.carver.idle': {
    lines: [
      { text: 'The iguana-trumpet-cat has gained wings since this morning. Small ones, but clearly going somewhere.' },
    ],
    effects: ['set:c9.carver.i1'],
  },
  'c9.carver.idle2': {
    lines: [
      { text: 'The creature now has wings AND eyebrows. The eyebrows appear skeptical about the wings.' },
      { who: 'Silvino', text: 'It asked for them. Who am I to refuse a commission from the commissioned?' },
    ],
    effects: ['set:c9.carver.i2'],
  },
  'c9.carver.idle3': {
    lines: [
      { who: 'Silvino', text: 'Every time you walk past, it grows a little braver. Today: a third eye, or a polka dot with ambition.' },
    ],
  },

  // ---------------- Nico, the comparsa kid ----------------
  'c9.kid.first': {
    lines: [
      { who: 'Nico', text: 'I am IN the comparsa this year. House to house all night with the banda. ALL night.' },
      { who: 'Nico', text: 'My trombone is borrowed and I know four notes. At night, moving, four notes is plenty.' },
      { who: 'Nico', text: 'Did you see the alebrijes? Ancient spirit guardians. My cousin told me.' },
    ],
    effects: ['set:met.kid', 'journal:people.kid'],
  },
  'c9.kid.two': {
    lines: [
      { who: 'Nico', text: 'Okay, Silvino says the alebrijes came from a fever dream in 1936. A fever! You can catch one anytime!' },
    ],
    effects: ['set:c9.kid2'],
  },
  'c9.kid.idle': {
    lines: [
      { who: 'Nico', text: 'When a cohete goes up my mother says ya empezó. It has begun. It began weeks ago. It is always beginning.' },
    ],
  },

  // ---------------- Don Melitón, camposanto caretaker ----------------
  'c9.care.first': {
    lines: [
      { text: 'An old man sweeps between the graves, moving the dust only as far as it agrees to go.' },
      { who: 'Don Melitón', text: 'Welcome. We are getting the beds ready; company is coming from far away.' },
    ],
    effects: ['set:met.caretaker', 'journal:people.caretaker'],
    choices: [
      { text: '"So this is like a Mexican Halloween?"', goto: 'c9.care.halloween' },
      { text: 'Ask who the company is', goto: 'c9.care.night' },
    ],
  },
  'c9.care.halloween': {
    lines: [
      { who: 'Don Melitón', text: 'A fair guess, and a wrong one. Halloween dresses up as the dead to be safe from them. We set the table for ours.' },
      { who: 'Don Melitón', text: 'Nobody fears my guests. They are our mothers. You make her favorite dish and you wait up.' },
    ],
  },
  'c9.care.night': {
    lines: [
      { who: 'Don Melitón', text: 'The dead, joven. First night the angelitos, with sweets. Second night the grown ones, with mezcal.' },
      { who: 'Don Melitón', text: 'It is not a mourning. It is a reunion with candles.' },
    ],
  },
  // Sent here by Refugio before ever meeting him: a welcome, then the petals.
  'c9.care.meet': {
    lines: [
      { text: 'An old man sweeps between the graves, moving the dust only as far as it agrees to go.' },
      { who: 'Don Melitón', text: 'Welcome. We are getting the beds ready; company is coming from far away.' },
    ],
    effects: ['set:met.caretaker', 'journal:people.caretaker'],
    next: 'c9.care.path',
  },
  'c9.care.path': {
    lines: [
      { who: 'Don Melitón', text: 'Refugio sent word. Then carry this: a costal of cempasúchil petals, and the job that goes with it.' },
      { who: 'Don Melitón', text: 'A line of petals from my gate toward the village, so the souls do not wander the wrong lane. Thick where it bends.' },
    ],
    effects: ['set:c9.path.task'],
  },
  'c9.care.wait': {
    lines: [
      { who: 'Don Melitón', text: 'The costal will not lay itself. I have swept the same spot twice waiting to watch you.' },
    ],
  },
  // The vigil is shown, not told: the candle dressing, the velacion mood and
  // the families themselves carry the night. What remains is what only a
  // person could say, plus the one thing that happens to you.
  'c9.vigil': {
    lines: [
      { who: 'Don Melitón', text: 'You see? A reunion. The ones who cry, cry a while, and then someone hands them bread.' },
    ],
    next: 'c9.vigil2',
  },
  // No one holds your face here. Refugio puts a lit candle in your hands and
  // has you set it beside hers, facing the road: the village's gesture, not
  // the elders' pattern from every other coast.
  'c9.vigil2': {
    lines: [
      { text: 'On the south wall, apart from her family’s row, one candle faces out toward the road. Refugio lights a second from it and hands it to you.' },
      { who: 'Doña Refugio', text: 'For Zoila, called Nani by exactly one person. Set it next to mine. Your petals will show her the turn.' },
    ],
    next: 'c9.vigil3',
  },
  'c9.vigil3': {
    lines: [
      { text: 'You set it down. Two small lights, facing the road. Someone starts on your grandmother: a borrowed horse, the wrong river, her refusing to dry off.' },
      { text: 'You stay until the candles are low. You will never hear it the same twice.' },
    ],
    // The night ends where the chapter does: at first light, at the
    // colectivo corner, with the two women who fed you already waiting.
    // The chapter closes after their goodbye, not before it.
    effects: ['set:c9.vigil.done', 'journal:customs.camposanto', 'travel:oaxaca,23,26,down'],
  },
  'c9.care.after': {
    lines: [
      { who: 'Don Melitón', text: 'Doors stay open for you here, joven. That is not a saying. I mean the doors.' },
    ],
  },
  'c9.care.idle': {
    lines: [
      { who: 'Don Melitón', text: 'Sweep, wash, whitewash, flowers. A camposanto is a garden where the flowers are people.' },
    ],
  },

  // ---------------- the families at the vigil ----------------
  'c9.vigil.epifania': {
    lines: [
      { who: 'Doña Epifania', text: 'My mother hated the cold. So I bring one blanket, I sit close to her stone, and we both get the good of it.' },
    ],
  },
  'c9.vigil.bernardo': {
    lines: [
      { who: 'Bernardo', text: 'Mezcal? It is for my father, but he never once finished a glass without help.' },
      { text: 'He tips a splash onto the earth before he drinks. Your hand moves to do the same before you decide anything.' },
    ],
  },
  'c9.vigil.luz': {
    lines: [
      { who: 'Luz', text: 'Tamal. Take it. The basket is not in charge of this night; I am.' },
    ],
  },
  'c9.vigil.serafin': {
    lines: [
      { who: 'Serafín', text: 'She only ever liked the one song. Fifty-one years of it. I play the middle part badly on purpose; she laughed at that part.' },
    ],
  },
  'c9.vigil.chuy': {
    lines: [
      { who: 'Chuy', text: 'Look. Catch the wax coming off the candle and it goes hard in your hand. Then you have a little planet.' },
      { text: 'He has eleven little planets. With visible effort, he parts with the smallest.' },
    ],
  },

  // ---------------- Chasca, in the cempasúchil ----------------
  'c9.chasca.field': {
    lines: [
      { who: 'Chasca', text: 'The soup-eater, waist-deep in marigolds. This is the picture I was saving film for.' },
      { who: 'Chasca', text: 'Do not smile. Just be arriving. You are very good at arriving.' },
      { text: 'The shutter clicks once. She lowers the camera slowly, like setting down a full cup. Last frame of the roll.' },
    ],
    effects: ['set:met.chascaC9', 'set:photo.flash', 'set:photo.c9.field'],
  },
  'c9.chasca.album': {
    lines: [
      { who: 'Chasca', text: 'Nine chapters of you in one bag. When you get home, come see the album. Endings are where albums learn what they are.' },
    ],
  },

  // ---------------- post office ----------------
  'c9.post.pilar': {
    lines: [
      { text: 'Under the portales: one clerk, one stamp pad, a shoebox marked EXTRANJERO. Your name is in it.' },
      { text: 'Handwriting you know, that usually looks like an invoice. This time the lines are straight and careful.' },
    ],
    effects: ['letter:oax.pilar'],
  },
  'c9.post.concetta': {
    lines: [
      { text: 'The clerk produces an envelope, sea-stamped, smelling faintly of lemons that traveled badly.' },
    ],
    effects: ['letter:oax.concetta'],
  },
  'c9.post.idle': {
    lines: [
      { text: 'CORREO, says the sign, and under it: SI NO ESTOY, AHORITA VENGO. The clerk is there anyway.' },
    ],
  },

  // ---------------- departure ----------------
  'c9.depart': {
    lines: [
      { text: 'The colectivo idles at the south corner, pointed at the highway, the coast, the ship, the long way home. It smells of tlayuda now.' },
    ],
    choices: [
      { text: 'Board. The long way home.', goto: 'c9.depart.go' },
      { text: 'Not yet. The village is still warm.', goto: 'c9.depart.stay' },
    ],
  },
  'c9.depart.go': {
    lines: [
      { text: 'The village lets you go the way it took you in: two women waving, one dog escorting the wheels to the edge of town, and no ceremony at all.' },
      { text: 'Weeks fold into wake and coastline. Then a grey morning, a familiar fog, a pier on old sugar-trade legs. La Caleta.' },
    ],
    effects: ['travel:la-caleta,22,28,up'],
  },
  'c9.depart.stay': {
    lines: [
      { text: 'The driver settles his hat back over his eyes. Ahorita, his posture says. The word finally makes sense.' },
    ],
  },

  // ---------------- examines ----------------
  'c9.ex.casona': {
    lines: [{ text: 'Adobe under lime paint, green cantera around the door, rebar praying for a second floor.' }],
  },
  'c9.ex.portales': {
    lines: [{ text: 'Arches of green cantera, the stone of the grand churches, scaled to a village that likes its grandeur sittable.' }],
  },
  'c9.ex.papel': {
    lines: [{ text: 'Papel picado shivers overhead, whole scenes scissored into tissue.' }],
  },
  'c9.ex.cempa': {
    lines: [{ text: 'Cempasúchil to the field’s edge, orange arguing with orange. The scent is loud.' }],
  },
  /**
   * The petal path is walked, not chosen: with Melitón's costal on your
   * shoulder, every step down the lane from the arch lets a handful go (the
   * engine's step hook in main.ts), and the bottom bend finishes it with
   * c9.path.lay. Space on the bare lane sows one handful by hand and says so,
   * then a second press lays the rest, for anyone who would rather not walk.
   */
  'c9.path.shoulder': {
    lines: [
      { text: 'You shoulder the costal. It weighs almost nothing and smells like the whole valley.' },
      { text: 'The lane starts just outside the arch. Walk it down to the street and let the petals go. Thick where it bends.' },
    ],
  },
  'c9.path.sow': {
    lines: [
      { text: 'You let a handful go. It lands in a little orange argument and stays. The rest wants walking: down the lane, thick where it bends.' },
    ],
    effects: ['set:c9.path.sown'],
  },
  'c9.path.lay': {
    lines: [
      { text: 'The costal is empty by the last bend. Behind you the lane runs ember-orange all the way up to the arch.' },
      { text: 'A woman crosses herself and thanks you by name. You never told her it.' },
    ],
    effects: ['set:c9.path.laid', 'journal:customs.cempasuchil'],
  },
  'c9.ex.petals1': {
    lines: [{ text: 'A thin line of last year’s petals pressed into the earth. The path remembers being lit.' }],
  },
  'c9.ex.petals2': {
    lines: [{ text: 'The petal path runs whole from the camposanto gate into the village. Bright enough to follow home from either end.' }],
  },
  'c9.ex.comal': {
    lines: [{ text: 'The big comal, black with decades, over a fire kept modest on purpose.' }],
  },
  'c9.ex.veladora': {
    lines: [{ text: 'Veladoras in glass, posted like sentries along the route the dead will take.' }],
  },
  'c9.ex.panstall': {
    lines: [{ text: 'Pan de muerto, sugar-dusted, each crown wearing a painted carita. A whole shelf of bread, looking back.' }],
  },
  'c9.ex.barrostall': {
    lines: [{ text: 'Barro negro: grey clay burnished with quartz until it fires black. The shelf shines like wet river stones.' }],
  },
  'c9.ex.telar': {
    lines: [{ text: 'The standing loom, warp like harp strings, red cloth climbing it. Cochineal: an insect’s life, continued as color.' }],
  },
  'c9.ex.alebrije': {
    lines: [{ text: 'Copal-wood creatures drying in the sun. None of them are ancient. All of them are certain.' }],
  },
  'c9.ex.rebozos': {
    lines: [
      { text: 'Rebozos in cochineal red and indigo. A rebozo carries a baby, a market load, or a grief, the seller says, like a price list.' },
    ],
  },
  'c9.ex.puestoflores': {
    lines: [
      { text: 'Cempasúchil by the armful and one bucket of cresta de gallo, red as a stove ring. The whole week is these two colors.' },
    ],
  },
  'c9.ex.capilla': {
    lines: [
      { text: 'A whitewashed chapel over one family’s dead. Repainted every October after an argument about color: white, and someone sulks.' },
    ],
  },
  'c9.ex.campogate': {
    lines: [{ text: 'The camposanto arch, garlanded in marigolds. This gate is decorated for arrivals.' }],
  },
  'c9.ex.tumba.night': {
    lines: [{ text: 'A grave dressed like a dinner table: candles, mole, marigolds, a poured mezcal. Excellent company.' }],
  },
  'c9.ex.tumba': {
    lines: [{ text: 'A whitewashed grave, freshly swept. The stone is old; the attention is this morning’s.' }],
  },
  'c9.ex.ofrenda0': {
    lines: [{ text: 'Bare boards and folded cloth, a marigold arch half tied. Not yet, but soon.' }],
  },
  'c9.ex.ofrenda2': {
    lines: [
      { text: 'Three levels, cloth smoothed, the marigold arch tied over everything. Her mother’s photograph sits above a cup for tejate.' },
      { text: 'Beside it a small table waits, empty.' },
    ],
  },
  'c9.ex.ofrenda3': {
    lines: [
      { text: 'Two altars glow side by side. On the small one: her photograph, her bread, and a journey arranged like family around her.' },
    ],
  },
  'c9.ex.ofrenda1': {
    lines: [{ text: 'The ofrenda fills day by day: cloth, then candles, then the arch. Altars are built the way trust is, in layers.' }],
  },
  'c9.ex.colectivo': {
    lines: [{ text: 'The colectivo stop. SALIDAS: AHORITA. The driver sleeps under his hat, honoring it exactly.' }],
  },
  'c9.ex.plaza': {
    lines: [{ text: 'Bench talk under the portales, the banda rehearsing close by, papel picado keeping time overhead.' }],
  },
  'c9.ex.path9': {
    lines: [{ text: 'Packed valley earth, swept by each doorway as far as its broom claims.' }],
  },
  'c9.ex.stall9': {
    lines: [{ text: 'Eugenia’s stall: chiles by their first names, cacao in fat sacks, chapulines by the scoop.' }],
  },
  'c9.ex.door9': {
    lines: [{ text: 'Behind the door a clarinet climbs a scale, misses the top step, and tries again.' }],
  },
  'c9.ex.tree9': {
    lines: [{ text: 'A shade tree with bougainvillea using it as a ladder. The magenta is winning.' }],
  },
  'c9.ex.sign9': {
    lines: [
      { text: 'Under the village name: LOS MUERTOS NO SE FUERON. SE ADELANTARON. The dead did not leave; they went ahead.' },
    ],
  },
  'c9.ex.patio': {
    lines: [{ text: 'A swept earth patio, kept like a floor because that is what it is.' }],
  },
  'c9.ex.wall9': {
    lines: [{ text: 'The camposanto wall, whitewashed. Names on the inside face; marigold garlands on this one.' }],
  },
  'c9.ex.bench9': {
    lines: [{ text: 'A cantera bench polished by fifty years of sitters.' }],
  },
  'c9.ex.farol9': {
    lines: [{ text: 'A plaza lamp ringed with moths that clearly know something about the coming nights.' }],
  },
  'c9.ex.tuft9': {
    lines: [{ text: 'Dry valley grass gone gold. The high light gives everything an opinion of a shadow.' }],
  },

  // ---------------- the love layer: small things, each with a voice ----------------
  'c9.ex.cempacut': {
    lines: [{ text: 'Cut cempasúchil in tied armfuls. The stems are for the living to carry; the color is for someone else.' }],
  },
  'c9.ex.agave': {
    lines: [{ text: 'An agave piña by the door, fat as a sleeping pig. Eight years growing, and it will be sipped slowly.' }],
  },
  'c9.ex.papelstack': {
    lines: [{ text: 'Papel picado folded in its stack, scissors resting. A whole sky, waiting to be hung.' }],
  },
  'c9.ex.dog1': {
    lines: [
      { text: 'A village dog asleep on the panadería step, the warmest stone on the street. A year of auditing doorways; this is his finding.' },
    ],
    effects: ['set:c9.dog.known'],
  },
  'c9.ex.dog2': {
    lines: [{ text: 'He opens one eye, files you under harmless, and closes it again.' }],
  },
  'c9.ex.chapulines': {
    lines: [{ text: 'Chapulines toasted with lime and chile. Proof the valley wastes nothing that hops.' }],
  },
  'c9.ex.cantaros': {
    lines: [{ text: 'Clay cántaros sweating in the shade. The water tastes of rain first and the jar second.' }],
  },
  'c9.ex.metate': {
    lines: [{ text: 'Chela’s metate, polished by cacao and chile into one long shallow smile.' }],
  },
  'c9.ex.escoba': {
    lines: [{ text: 'A broom resting mid-shift. Every door sweeps to the middle of the street, exactly.' }],
  },
  'c9.ex.gallina': {
    lines: [{ text: 'Hens auditing the ground. Whatever the comal drops, the committee finds it first.' }],
  },
  'c9.ex.cohete': {
    lines: [{ text: 'A spent cohete stick, back down from this morning’s announcement.' }],
  },
  'c9.ex.cubeta': {
    lines: [{ text: 'Whitewash and a stiff brush. Tidying a tomb is housework here, for family who only moved.' }],
  },
  'c9.ex.costal.full': {
    lines: [{ text: 'A costal packed with cempasúchil petals. It smells like the whole field agreed to travel.' }],
  },
  'c9.ex.costal.empty': {
    lines: [{ text: 'The costal, empty and folded square. Every petal it held is out on the path.' }],
  },
  'c9.ex.jicaras': {
    lines: [{ text: 'Painted jícaras stacked mouth-down to dry. Tejate tastes better from a gourd, and the gourds know.' }],
  },

  // ---------------- examines: the cocina, indoors and in its own voice ----------------
  // The ledger is read, not recited: Refugio leaves it open on the table and
  // the player finds the 1975 line with their own eyes.
  'c9.ex.mesa': {
    lines: [{ text: 'The kitchen table, scrubbed pale. Under the altar end, a shelf holds one cloth-mended notebook.' }],
  },
  'c9.ledger.read': {
    lines: [
      { text: 'The guelaguetza ledger. Weddings, funerals, fiestas: fifty years of lending, line after line crossed out, repaid.' },
      { text: 'One page stops you. Zoila, 1975: one week of shelter, one mole feast. Owed. Nothing crosses it out.' },
    ],
    effects: ['set:c9.ledger', 'journal:words.guelaguetza'],
  },
  'c9.ex.ledger.after': {
    lines: [{ text: 'The ledger, back under the altar table, and one line that waited for you.' }],
  },
  'c9.ex.comal.cocina': {
    lines: [{ text: 'The kitchen comal, low against the west wall where the smoke knows the way out. It is never quite out.' }],
  },
  'c9.ex.metate.cocina': {
    lines: [{ text: 'Refugio’s metate on the floor by the fire, worn deeper on the near side.' }],
  },
  'c9.ex.escoba.cocina': {
    lines: [{ text: 'The broom parked bristles up, so the dust it has gathered stays gathered.' }],
  },
  'c9.ex.cantaros.cocina': {
    lines: [{ text: 'Two cántaros by the door, where anyone coming in from the sun reaches them first.' }],
  },
  'c9.ex.papel.cocina': {
    lines: [{ text: 'Practice papel picado, strung at exactly the height of a tall guest, who will duck.' }],
  },
  'c9.ex.costal.cocina': {
    lines: [{ text: 'Costales in the corner: corn in one, dried chiles in another, a third holding only its own shape.' }],
  },
  'c9.ex.papelstack.cocina': {
    lines: [{ text: 'A stack of tissue half cut, the scissors resting mid-flower.' }],
  },
  'c9.ex.ristra': {
    lines: [{ text: 'A ristra of pasilla and guajillo drying on the wall, going darker and quieter by the week.' }],
  },
  'c9.ex.cazuelas': {
    lines: [{ text: 'Cazuelas stacked by size, each chipped in a different honest place. The big one is for mole only.' }],
  },
  'c9.ex.tuba1': {
    lines: [
      { text: 'The banda’s tuba rests on a chair outside rehearsal. A tuba does not sit on the ground like some clarinet.' },
    ],
    effects: ['set:c9.tuba.known'],
  },
  'c9.ex.tuba2': {
    lines: [{ text: 'Inside, the banda runs eight bars without it. You can hear the exact hole where the tuba goes.' }],
  },
  'c9.ex.rotulo': {
    lines: [{ text: 'A hand-painted sign, three letters done and the rest in pencil. The flourish is finished; it was the fun part.' }],
  },
  'c9.ex.bugambilia': {
    lines: [{ text: 'Bougainvillea pouring over the wall. The wall considers it fair rent for being slowly taken apart.' }],
  },
  'c9.ex.nicho': {
    lines: [{ text: 'A corner nicho: a thumb-sized saint, marigolds changed this morning, one steady flame.' }],
  },
  'c9.ex.paletas': {
    lines: [{ text: 'The paletero’s cart. Every child in the valley can hear its small silver bell through a closed door and a nap.' }],
  },
  'c9.ex.crates': {
    lines: [{ text: 'Tomatillos in their paper lanterns, chiles ranked by how much they intend to hurt you.' }],
  },
  'c9.ex.pantray': {
    lines: [{ text: 'Trays of pan de muerto cooling, caritas up. Forty small faces, all pointed at the street.' }],
  },
  'c9.ex.pantray.out': {
    lines: [{ text: 'The rack is one batch lighter: the altar bread went out first, warm, in your arms.' }],
  },
  'c9.ex.alebrije.close': {
    lines: [{ text: 'Up close the half-painted one is an argument: cobalt insists, orange objects, dots file in to mediate.' }],
    effects: ['set:c9.alebrije.close'],
  },
  'c9.ex.wallcal': {
    lines: [{ text: 'Cal above, colour below. The top has gone brown with thirty years of comal smoke; Refugio calls that seasoning.' }],
  },
  'c9.ex.floorsaltillo': {
    lines: [{ text: 'Saltillo tiles, no two the same red. A marigold petal has got into the grout. Several have. It is that month.' }],
  },
  'c9.ex.rugpetate': {
    lines: [{ text: 'A palm petate with a grana stripe. Babies sleep on these, chiles dry on these, and eventually everyone is wrapped in one.' }],
  },
};

/** Valley examine arms; shared props keep map tags so other coasts stay themselves. */
export const OAXACA_EXAMINES: Record<string, ExamineArm[]> = {
  blocked: [{ map: 'oaxaca', node: 'c9.ex.wall' }, { map: 'cocina', node: 'c9.ex.wall' }, { map: 'camposanto', node: 'c9.ex.wall' }],
  // The cocina is skinned to painted cal, saltillo and petate in
  // `art/sets/oaxaca.ts`. The village's own `floorEarth` cells keep their
  // patio words below.
  wallInt: [{ map: 'cocina', node: 'c9.ex.wallcal' }],
  rug: [{ map: 'cocina', node: 'c9.ex.rugpetate' }],
  // The kitchen table carries the ledger once Refugio sets it out; finding
  // the 1975 line is the player's own act, and it grants the journal page.
  table: [
    { map: 'cocina', when: { has: ['c9.ledger.out'], not: ['c9.ledger'] }, node: 'c9.ledger.read' },
    { map: 'cocina', when: { has: ['c9.ledger'] }, node: 'c9.ex.ledger.after' },
    { map: 'cocina', node: 'c9.ex.mesa' },
  ],
  casona: [{ node: 'c9.ex.casona' }],
  portales: [{ node: 'c9.ex.portales' }],
  papel: [
    { map: 'cocina', node: 'c9.ex.papel.cocina' },
    { node: 'c9.ex.papel' },
  ],
  cempa: [{ node: 'c9.ex.cempa' }],
  petalpath: [
    { when: { has: ['c9.path.task'], not: ['c9.path.laid', 'c9.path.sown'] }, node: 'c9.path.sow', cue: true },
    { when: { has: ['c9.path.task', 'c9.path.sown'], not: ['c9.path.laid'] }, node: 'c9.path.lay', cue: true },
    { when: { has: ['c9.path.laid'] }, node: 'c9.ex.petals2' },
    { node: 'c9.ex.petals1' },
  ],
  comal: [
    { map: 'cocina', node: 'c9.ex.comal.cocina' },
    { node: 'c9.ex.comal' },
  ],
  ristra: [{ node: 'c9.ex.ristra' }],
  veladora: [{ node: 'c9.ex.veladora' }],
  panstall: [{ node: 'c9.ex.panstall' }],
  barrostall: [{ node: 'c9.ex.barrostall' }],
  telar: [{ node: 'c9.ex.telar' }],
  rebozos: [{ node: 'c9.ex.rebozos' }],
  puestoflores: [{ node: 'c9.ex.puestoflores' }],
  capilla: [{ node: 'c9.ex.capilla' }],
  alebrije: [
    { when: { has: ['met.carver'], not: ['c9.alebrije.close'] }, node: 'c9.ex.alebrije.close' },
    { node: 'c9.ex.alebrije' },
  ],
  campogate: [{ node: 'c9.ex.campogate' }],
  tumba: [
    { when: { has: ['c9.vigil.done'] }, node: 'c9.ex.tumba.night' },
    { node: 'c9.ex.tumba' },
  ],
  ofrenda: [
    { when: { not: ['c9.ledger'] }, node: 'c9.ex.ofrenda0' },
    { when: { has: ['c9.ofrenda.done'] }, node: 'c9.ex.ofrenda3' },
    { when: { has: ['c9.family.done'] }, node: 'c9.ex.ofrenda2' },
    { node: 'c9.ex.ofrenda1' },
  ],
  correo: [
    // Pilar writes only to someone who has met her at the bridge.
    { when: { has: ['met.pilar'], not: ['letter.read.oax.pilar'] }, node: 'c9.post.pilar' },
    { when: { not: ['letter.read.oax.concetta'] }, node: 'c9.post.concetta' },
    { node: 'c9.post.idle' },
  ],
  colectivo: [
    { when: { has: ['c9.vigil.done'], not: ['c9.bye'] }, node: 'c9.bye' },
    { when: { has: ['c9.complete'] }, node: 'c9.depart' },
    { node: 'c9.ex.colectivo' },
  ],
  plaza: [{ map: 'oaxaca', node: 'c9.ex.plaza' }],
  path: [{ map: 'oaxaca', node: 'c9.ex.path9' }],
  stall: [{ map: 'oaxaca', node: 'c9.ex.stall9' }],
  doorShut: [{ map: 'oaxaca', node: 'c9.ex.door9' }],
  tree: [
    { map: 'oaxaca', node: 'c9.ex.tree9' },
    { map: 'camposanto', node: 'c9.ex.tree9' },
  ],
  signpost: [{ map: 'oaxaca', node: 'c9.ex.sign9' }],
  floorEarth: [
    { map: 'oaxaca', node: 'c9.ex.patio' },
    { map: 'cocina', node: 'c9.ex.floorsaltillo' },
  ],
  wallStone: [{ map: 'camposanto', node: 'c9.ex.wall9' }],
  bench: [{ map: 'oaxaca', node: 'c9.ex.bench9' }],
  farol: [{ map: 'oaxaca', node: 'c9.ex.farol9' }],
  tuft: [{ map: 'oaxaca', node: 'c9.ex.tuft9' }],
  cempacut: [{ node: 'c9.ex.cempacut' }],
  agavepina: [{ node: 'c9.ex.agave' }],
  papelstack: [
    { map: 'cocina', node: 'c9.ex.papelstack.cocina' },
    { node: 'c9.ex.papelstack' },
  ],
  streetdog: [
    { when: { not: ['c9.dog.known'] }, node: 'c9.ex.dog1' },
    { node: 'c9.ex.dog2' },
  ],
  chapulines: [{ node: 'c9.ex.chapulines' }],
  cantaros: [
    { map: 'cocina', node: 'c9.ex.cantaros.cocina' },
    { node: 'c9.ex.cantaros' },
  ],
  metate: [
    { map: 'cocina', node: 'c9.ex.metate.cocina' },
    { node: 'c9.ex.metate' },
  ],
  escoba: [
    { map: 'cocina', node: 'c9.ex.escoba.cocina' },
    { node: 'c9.ex.escoba' },
  ],
  gallina: [{ node: 'c9.ex.gallina' }],
  cohete: [{ node: 'c9.ex.cohete' }],
  cubeta: [{ node: 'c9.ex.cubeta' }],
  costal: [
    { map: 'cocina', node: 'c9.ex.costal.cocina' },
    // The sack Melitón hands over is also where the job starts: shouldering
    // it is the cue to walk the lane, where the petals actually go down.
    { when: { has: ['c9.path.task'], not: ['c9.path.laid'] }, node: 'c9.path.shoulder' },
    { when: { has: ['c9.path.laid'] }, node: 'c9.ex.costal.empty' },
    { node: 'c9.ex.costal.full' },
  ],
  jicaras: [{ node: 'c9.ex.jicaras' }],
  cazuelas: [{ node: 'c9.ex.cazuelas' }],
  tuba: [
    { when: { not: ['c9.tuba.known'] }, node: 'c9.ex.tuba1' },
    { node: 'c9.ex.tuba2' },
  ],
  rotulo: [{ node: 'c9.ex.rotulo' }],
  bugambilia: [{ node: 'c9.ex.bugambilia' }],
  nicho: [{ node: 'c9.ex.nicho' }],
  paletas: [{ node: 'c9.ex.paletas' }],
  mercadocrates: [{ node: 'c9.ex.crates' }],
  pantray: [
    { when: { has: ['c9.bread.done'] }, node: 'c9.ex.pantray.out' },
    { node: 'c9.ex.pantray' },
  ],
};

/** Event-triggered nodes, listed with their gating so tests can walk them. */
export const OAXACA_EVENTS: EventNode[] = [
  { node: 'c9.arrive' },
  { when: { has: ['c9.mole.start'] }, node: 'c9.mole.stirred' },
  { when: { has: ['c9.ofrenda.start'] }, node: 'c9.ofrenda.built' },
];
