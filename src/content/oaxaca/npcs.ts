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
      { when: { has: ['met.refugio', 'met.elias', 'met.chela'], not: ['c9.ledger'] }, node: 'c9.refugio.ledger' },
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
      { when: { not: ['met.caretaker'] }, node: 'c9.care.first' },
      { when: { has: ['c9.debt.paid', 'c9.ofrenda.done'], not: ['c9.complete'] }, node: 'c9.vigil' },
      { when: { has: ['c9.ledger'], not: ['c9.path.task'] }, node: 'c9.care.path' },
      { when: { has: ['c9.path.task'], not: ['c9.path.laid'] }, node: 'c9.care.wait' },
      { when: { has: ['c9.complete'] }, node: 'c9.care.after' },
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
    when: { has: ['c9.ofrenda.done'] },
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
    entry: [
      { when: { has: ['c9.complete'] }, node: 'c9.refugio.after' },
      { node: 'c9.refugio.tonight' },
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
  // ---------------- arrival ----------------
  'c9.arrive': {
    lines: [
      { text: 'The colectivo shudders off toward the highway, and the valley closes its quiet around the sound.' },
      { text: 'Somewhere a cohete goes up: one bang, no spectacle. The dogs complain about it professionally.' },
      { text: 'Woodsmoke, copal, a tuba practicing scales behind a door. The whole village smells faintly of oranges that turn out to be flowers.' },
    ],
    effects: ['set:c9.arrived'],
  },

  // ---------------- Doña Refugio, the tejatera ----------------
  'c9.refugio.first': {
    lines: [
      { text: 'In the cool of the kitchen a woman works a clay basin, lifting the corn-and-cacao with her forearm until white foam rises.' },
      { who: 'Doña Refugio', text: 'Tejate. Sit. The foam is the prize, and the foam does not wait for introductions.' },
      { text: 'It is cold, faintly of flowers, drunk from a painted jícara. She watches you drink like the drink is a question.' },
      { who: 'Doña Refugio', text: 'You carry that book on your hip the way some people carry a sleeping child. Come back when you have met my village.' },
    ],
    effects: ['set:met.refugio', 'journal:people.refugio', 'journal:dishes.tejate'],
  },
  'c9.refugio.ledger': {
    lines: [
      { who: 'Doña Refugio', text: 'Elías told me about your wrist. Chela told me about your appetite. Now show me the book you carry like a child.' },
      { text: 'You hand over the journal. She turns pages with a wet thumb, and then she stops turning.' },
      { who: 'Doña Refugio', text: 'This hand wrote in my mother’s kitchen. I was nine. She drew the comal with me sitting beside it, there, in the corner.' },
    ],
    next: 'c9.refugio.ledger2',
  },
  'c9.refugio.ledger2': {
    lines: [
      { text: 'From under the altar table she brings a notebook, swollen with years, spine mended with cloth. The guelaguetza ledger.' },
      { who: 'Doña Refugio', text: 'What this village lends, this village writes. Weddings, funerals, fiestas. Kindness with a page number.' },
      { text: 'She finds the line without looking for it. Nani, 1975: one week of shelter, one mole feast. Owed.' },
    ],
    effects: ['set:c9.ledger', 'journal:words.guelaguetza'],
    next: 'c9.refugio.telegram',
  },
  'c9.refugio.telegram': {
    lines: [
      { who: 'Doña Refugio', text: 'She stayed the week before the fiesta, right where you stand. She was going to help with the mole. She never got to.' },
      { who: 'Doña Refugio', text: 'A telegram came up from the town. Her mother was dying in Peru. She left that same night, and the road never brought her back.' },
      { who: 'Doña Refugio', text: 'My mother kept her cup on the shelf a whole year. Then she wrote the line, so we would not be allowed to forget.' },
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
      { text: 'Ayni, yapa, deom, pilón, guelaguetza. An old tea sage in Busan asked what the weightless thing weighs when you find its last name.' },
      { text: 'You look at the line in the ledger and answer him out loud. Nothing. And a village remembers it for fifty years.' },
      { who: 'Doña Refugio', text: 'Whoever taught you that question, tell them an old woman in the valley says: correct. Now let me tell you the rest.' },
    ],
    effects: ['set:c9.riddle.answered'],
    next: 'c9.refugio.owe',
  },
  'c9.refugio.chain': {
    lines: [
      { who: 'Doña Refugio', text: 'It is not charity and it is not a bill. Today for you, tomorrow for me, and the notebook keeps us honest across the years.' },
      { who: 'Doña Refugio', text: 'A debt of kindness does not shame anybody. It only waits. Ours has waited fifty years, light as air the whole time.' },
    ],
    next: 'c9.refugio.owe',
  },
  'c9.refugio.owe': {
    lines: [
      { who: 'Doña Refugio', text: 'A guelaguetza is not owed to a grave. It is owed to a family, and here is her family, standing in my kitchen.' },
      { who: 'Doña Refugio', text: 'The fiesta needs what it always needs. Chela’s mole wants hands. Tacho’s bread wants carrying. The camposanto path wants petals.' },
      { who: 'Doña Refugio', text: 'Work her week, the one she never finished. Then we will talk about what my mother wrote on the next page.' },
    ],
  },
  'c9.refugio.bread': {
    lines: [
      { text: 'You set the basket down. The smell of orange blossom and egg bread takes the room without a fight.' },
      { who: 'Doña Refugio', text: 'Straight from the oven to the altar, the way it should arrive. My mother is getting her favorite this year.' },
      { who: 'Doña Refugio', text: 'Look at you, carrying bread through this village. Fifty years folds up very small, sometimes.' },
    ],
    effects: ['errand.done', 'clear:errand.pan-refugio', 'set:c9.bread.done'],
  },
  'c9.refugio.family': {
    lines: [
      { text: 'The altar rises through the afternoon: two levels, then a third, cloth smoothed, the marigold arch tied over everything.' },
      { who: 'Doña Refugio', text: 'Water for the thirst. Salt for the seasoning of life. Copal to carry what we say upward. Candles so nobody trips on the dark.' },
      { text: 'Her mother’s photograph goes up last, next to a cup for tejate. You hand her things before she asks; she stops noticing you are a guest.' },
      { who: 'Doña Refugio', text: 'There. The mole is resting, the bread is up, the path is laid. The ledger line is paid, hija. Fifty years late and right on time.' },
    ],
    effects: ['set:c9.family.done', 'set:c9.debt.paid', 'journal:customs.ofrenda'],
    next: 'c9.refugio.page2',
  },
  'c9.refugio.page2': {
    lines: [
      { text: 'She opens the ledger to cross out the line. Then she turns the page and goes still.' },
      { who: 'Doña Refugio', text: 'This is my mother’s hand. I never read past the entry. Look.' },
      { text: 'Below the old ink, smaller: Debts of kindness pass to the children. Both directions.' },
      { who: 'Doña Refugio', text: 'Both directions, hija. You paid hers. Now this village pays what it owes her, to you. We are building your Nani an ofrenda.' },
    ],
    next: 'c9.altar.hub',
  },
  'c9.altar.hub': {
    lines: [
      { text: 'A small table appears beside the family altar, carried in by neighbors who do not knock. Refugio spreads a white cloth.' },
      { who: 'Doña Refugio', text: 'The altar holds what she loved and what she was owed. What did the road put in your hands? Bring all of it.' },
    ],
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
      { text: 'The little parcel from the Seto sea, still in its careful paper. It was always going to be opened by somebody loved.' },
      { who: 'Doña Refugio', text: 'A gift that traveled this far is not late. It is exactly on time for a different person. Set it with the rest.' },
    ],
    effects: ['set:c9.of.omiyage'],
    next: 'c9.altar.hub',
  },
  'c9.altar.kanga': {
    lines: [
      { text: 'The kanga unfolds in her kitchen, and the proverb along its edge gets read aloud by a woman who cannot read Swahili and gets it right anyway.' },
      { who: 'Doña Refugio', text: 'One worn, one given. Whoever folded this knew the same arithmetic as my mother’s notebook.' },
    ],
    effects: ['set:c9.of.kanga'],
    next: 'c9.altar.hub',
  },
  'c9.altar.wish': {
    lines: [
      { text: 'The strip of Tanabata paper has gone soft at the folds from riding in the journal. The wish is still legible. It mostly came true.' },
      { who: 'Doña Refugio', text: 'A wish that crossed three oceans belongs on an altar. Where else do wishes and the dead both get fed?' },
    ],
    effects: ['set:c9.of.wish'],
    next: 'c9.altar.hub',
  },
  'c9.altar.begin': {
    lines: [
      { who: 'Doña Refugio', text: 'Three levels. What guides her, what feeds her, what walks with her. Your hands, hija. We will tell you nothing unless you ask.' },
    ],
    effects: ['set:c9.ofrenda.start'],
  },
  'c9.altar.wait': {
    lines: [
      { who: 'Doña Refugio', text: 'The candles keep. Walk, breathe, come back. Altars are patient; it is their whole profession.' },
    ],
  },
  'c9.ofrenda.built': {
    lines: [
      { text: 'The small altar glows beside the big one: her photograph, her bread, her flowers, the journey arranged around her like company.' },
      { who: 'Doña Refugio', text: 'Fifty years she had no place set in this valley. Look at her now. Tonight we take the last candle to the camposanto.' },
      { text: 'The journal sits at the altar’s foot, closed. For once it does not feel half finished. It feels half full.' },
    ],
    effects: ['clear:c9.ofrenda.start', 'set:c9.ofrenda.done'],
  },
  'c9.refugio.again': {
    lines: [
      { who: 'Doña Refugio', text: 'The small table is waiting, and so are the neighbors. Nobody builds an altar alone. That is nearly the law here.' },
    ],
    next: 'c9.altar.hub',
  },
  // At the wall, at the vigil, with her family's row behind her.
  'c9.refugio.tonight': {
    lines: [
      { text: 'She has claimed a piece of the south wall with a blanket, a basket, and one candle set well apart from her family’s row.' },
      { who: 'Doña Refugio', text: 'That one is not ours. That one faces out, toward the road. A light is set that way for somebody who is still walking.' },
      { who: 'Doña Refugio', text: 'Sit. Melitón will tell you these graves are his. Do not believe a word of it; he only sweeps them.' },
    ],
  },
  'c9.refugio.after': {
    lines: [
      { who: 'Doña Refugio', text: 'The ledger is closed, both directions. That does not mean you stop being family. It means you start.' },
      { who: 'Doña Refugio', text: 'When you go, go the long way home, and tell the sea it is only borrowing you. The colectivo passes the south corner of the plaza.' },
    ],
  },
  'c9.refugio.idle': {
    lines: [
      { who: 'Doña Refugio', text: 'The fiesta has enough people talking. It is short of people doing. You know where the doing is.' },
    ],
  },

  // ---------------- Elías, cochineal red ----------------
  'c9.elias.band': {
    lines: [
      { text: 'The weaver’s hand closes gently around your wrist before either of you says a word. He turns the woven band to the light.' },
      { who: 'Elías', text: 'Padiuxi. Forgive my hands, they saw it first. This red. Where did a traveler get this red?' },
      { who: 'Elías', text: 'Grana cochinilla. An insect raised on the nopal, crushed to make kings jealous. My yarn is dyed with it, and so is your wrist.' },
      { who: 'Elías', text: 'It was born in your mountains, friend. Peru grows most of it to this day. Two continents, one small stubborn bug. You wear the proof.' },
    ],
    effects: ['set:met.elias', 'journal:people.elias', 'journal:customs.grana'],
  },
  'c9.elias.first': {
    lines: [
      { text: 'A man sits at a standing loom in his doorway, walking deep red up the warp a thread at a time.' },
      { who: 'Elías', text: 'Padiuxi. That is a hello, and it costs you nothing to keep. The loom does not mind an audience, it minds a hurry.' },
    ],
    effects: ['set:met.elias', 'journal:people.elias'],
    choices: [
      { text: 'Ask about the red', goto: 'c9.elias.red' },
      { text: 'Ask about the cloth on the loom', goto: 'c9.elias.loom' },
    ],
  },
  'c9.elias.red': {
    lines: [
      { who: 'Elías', text: 'Grana cochinilla. An insect that lives on the nopal, dried and crushed. The Spaniards shipped it out like red gold.' },
      { who: 'Elías', text: 'It started in the Andes long before it made Oaxaca rich. The same bug dyed cloth there a thousand years ago. Red with a passport.' },
    ],
    effects: ['journal:customs.grana'],
  },
  'c9.elias.loom': {
    lines: [
      { who: 'Elías', text: 'A tapestry, Teotitlán style, though this village never claims their name. The diamond is the valley. The red is an insect’s whole opinion.' },
      { who: 'Elías', text: 'Ask me about the red some time. It has crossed more oceans than you have.' },
    ],
  },
  'c9.elias.dye': {
    lines: [
      { who: 'Elías', text: 'The dye pot today: grana with lime juice makes flame, grana with ash makes wine. One insect, a whole argument of reds.' },
      { who: 'Elías', text: 'For the fiesta I dye double. The dead see best at night, my grandmother said, but they see red at any hour.' },
    ],
    effects: ['set:c9.elias2', 'journal:customs.grana'],
  },
  'c9.elias.idle': {
    lines: [
      { who: 'Elías', text: 'Thread, beat, thread, beat. A tapestry is just patience with a pattern to hide inside.' },
    ],
  },

  // ---------------- Abuela Chela, the mole ----------------
  'c9.chela.first': {
    lines: [
      { text: 'On Refugio’s patio an old woman commands a comal the size of a wagon wheel. A tlayuda is browning on it, big as the moon.' },
      { who: 'Abuela Chela', text: 'You look hungry in the specific way of travelers. Sit on the low stool. The low stool is for guests who stay.' },
      { text: 'Tlayuda with beans, quesillo, a swipe of asiento. A neighbor passing the gate calls out: ¡provecho! You have never met her.' },
      { who: 'Abuela Chela', text: 'You answer gracias, igualmente, and you say it to strangers eating from now on. It is free, and it seasons the whole street.' },
    ],
    effects: ['set:met.chela', 'journal:people.chela', 'journal:dishes.tlayuda', 'journal:words.provecho'],
  },
  'c9.chela.mole': {
    lines: [
      { who: 'Abuela Chela', text: 'So Refugio read you the line. Good. Then you know this mole negro is three days old already and still two days from done.' },
      { who: 'Abuela Chela', text: 'Thirty things go in and I am short the ones that matter: chilhuacle, mulato, pasilla. Eugenia holds them for me at the stall.' },
      { who: 'Abuela Chela', text: 'Go, tell her it is for the mole of the fiesta. And do not shake the bag; chiles bruise like opinions.' },
    ],
    effects: ['set:c9.mole.ask', 'errand:chela-chiles', 'set:errand.chela-chiles'],
  },
  'c9.chela.chiles': {
    lines: [
      { text: 'You call her name from the gate. Without turning from the comal she answers: ¿Mande?' },
      { who: 'Abuela Chela', text: 'Mande, we say here. Not qué. My mother would reach for the wooden spoon over qué. You will learn to flinch too.' },
      { text: 'She opens the bag and inhales like a doctor listening to a chest. The chilhuacle passes inspection.' },
      { who: 'Abuela Chela', text: 'Now the chocolate. Tacho grinds cacao when the bread lets him. Tell him: for the mole, the good disc, not the tourist disc.' },
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
      { who: 'Abuela Chela', text: 'Chiles toasted black, seeds burnt on purpose, bread and tortilla burnt on more purpose. Now it all becomes one thing, slowly.' },
    ],
    effects: ['errand.done', 'clear:errand.chela-choco', 'set:c9.choco.done'],
    next: 'c9.chela.stir',
  },
  'c9.chela.stir': {
    lines: [
      { who: 'Abuela Chela', text: 'The pot wants an hour of stirring and my shoulder is older than the pot. Your Nani was promised this exact hour, you know.' },
      { who: 'Abuela Chela', text: 'She left before the stirring. The mole never held it against her, but it kept the hour open. Take the spoon?' },
    ],
    choices: [
      { text: 'Take the spoon', goto: 'c9.chela.stiryes' },
      { text: 'Not yet', goto: 'c9.chela.stirno' },
    ],
  },
  'c9.chela.stiryes': {
    lines: [
      { who: 'Abuela Chela', text: 'In circles, with the pot, never against it. The mole sets the pace and you agree with it. That is the entire recipe for everything.' },
    ],
    effects: ['set:c9.mole.start'],
  },
  'c9.chela.stirno': {
    lines: [
      { who: 'Abuela Chela', text: 'The pot can idle. Idling is half of cooking. The other half is showing up, so show up.' },
    ],
  },
  'c9.chela.again': {
    lines: [
      { who: 'Abuela Chela', text: 'The spoon has not forgotten you. Neither have I, and I am the more patient of the two.' },
    ],
    next: 'c9.chela.stir',
  },
  'c9.mole.stirred': {
    lines: [
      { text: 'Somewhere in the hour, your arm stops being yours and becomes the pot’s. The mole turns glossy, black as a polished olla, quiet.' },
      { who: 'Abuela Chela', text: 'There. Fifty years ago I promised a traveler she would stir this pot. I am telling her right now that her family kept the appointment.' },
      { text: 'She says it to the steam, conversationally, like the steam has ears. On this patio, this week, it might.' },
    ],
    effects: ['clear:c9.mole.start', 'set:c9.mole.done', 'journal:dishes.molenegro'],
  },
  'c9.chela.rest': {
    lines: [
      { who: 'Abuela Chela', text: 'The mole rests until the fiesta, and so should you. Here, a spoonful over rice, for quality control. You are the control.' },
      { text: 'A neighbor leans on the gate, eating a memela. You say ¡provecho! before you can think about it. She grins: gracias, igualmente.' },
    ],
    next: 'c9.chela.moleAgain',
  },
  'c9.chela.moleAgain': {
    lines: [
      { who: 'Abuela Chela', text: 'There is always another pot, hija. This valley eats mole faster than one shoulder can stir it.' },
    ],
    choices: [
      { text: 'Take the spoon again', when: { has: ['c9.mole.done'] }, goto: 'c9.chela.moleReplay' },
      { text: 'Let the pot rest', goto: 'c9.chela.idle' },
    ],
  },
  'c9.chela.moleReplay': {
    lines: [
      { who: 'Abuela Chela', text: 'Bueno. Nothing to prove tonight. Only the circles, the smoke to keep an ear on, and me talking at your elbow.' },
    ],
    effects: ['set:replay.mode', 'set:c9.mole.start'],
  },
  'c9.chela.idle': {
    lines: [
      { who: 'Abuela Chela', text: 'The comal keeps its own calendar. Tortillas daily, memelas for whoever earns them, and one mole a year that eats the whole week.' },
    ],
  },

  // ---------------- Doña Eugenia, marchanta ----------------
  'c9.eugenia.first': {
    lines: [
      { who: 'Doña Eugenia', text: '¡Pásele, marchanta, pásele! Chiles, cacao, sal de gusano. Everything the season wants, and a few things it forgot to want.' },
      { who: 'Doña Eugenia', text: 'Marchanta is what we call each other, you and I. You buy from me twice and the word does the rest. It is a small marriage of errands.' },
    ],
    effects: ['set:met.eugenia', 'journal:words.marchanta'],
  },
  'c9.eugenia.chiles': {
    lines: [
      { who: 'Doña Eugenia', text: 'For Chela’s mole? Then you get the chilhuacle I do not put on the table. One little valley grows it, and it costs like it knows.' },
      { text: 'She weighs the dark chiles like contraband, wraps them, and then drops a fistful of cacao beans on top without a word.' },
      { who: 'Doña Eugenia', text: 'The pilón, marchanta. The little extra, for regulars. You do not ask, I do not explain. It simply happens between us.' },
    ],
    effects: ['set:c9.chiles', 'journal:customs.pilon'],
  },
  'c9.eugenia.idle': {
    lines: [
      { who: 'Doña Eugenia', text: 'Tomorrow the tianguis is in the next town, and I go where the tianguis goes. Today, lucky for you, it is my patio.' },
    ],
  },

  // ---------------- Tacho, the panadero ----------------
  'c9.pan.first': {
    lines: [
      { text: 'The panadería breathes heat into the lane. Racks of round loaves cool by the door, each crown pressed with a small painted face.' },
      { who: 'Tacho', text: 'Pan de muerto, the Oaxaca way: pan de yema, and the carita on top. Here the bread looks back at you. It is only polite.' },
      { who: 'Tacho', text: 'The next batch comes out ahorita. You want to wait, wait. Ahorita is a word with room in it.' },
    ],
    effects: ['set:met.pan', 'journal:people.panadero'],
  },
  'c9.pan.choco': {
    lines: [
      { who: 'Tacho', text: 'For the mole? Then the good disc, stone-ground, almost no sugar. The tourist disc is for people who drink chocolate with their eyes.' },
      { text: 'While he wraps it he beats a jug of chocolate de agua to foam and pours you a cup, water-dark and honest.' },
      { who: 'Tacho', text: 'In water, not milk, so the cacao does the talking. Dunk bread in it at the fiesta and you will understand this village completely.' },
    ],
    effects: ['set:c9.choco', 'journal:dishes.chocolatedeagua'],
  },
  'c9.pan.bread': {
    lines: [
      { text: 'The oven finally opens. The batch you were promised ahorita arrives one errand, two conversations, and one stirred pot later.' },
      { who: 'Tacho', text: 'You see? Ahorita came. It always comes. It just refuses to be supervised.' },
      { who: 'Tacho', text: 'This basket is for Refugio’s altar, promised for the guelaguetza. Your arms look honest. Carry it warm, that is the whole trick.' },
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
    lines: [
      { who: 'Tacho', text: 'Flour at four, ovens at five, caritas at six. The dead eat better than the living this month and nobody complains.' },
    ],
  },

  // ---------------- Silvino, the alebrije carver ----------------
  'c9.carver.first': {
    lines: [
      { text: 'A man paints dots on a carved creature: half iguana, half trumpet, somehow also a cat. It dries in the sun looking pleased.' },
      { who: 'Silvino', text: 'Alebrijes. I dream them, the copal wood argues, we settle out of court. This one wanted wings and got a better tail instead.' },
    ],
    effects: ['set:met.carver', 'journal:people.carver'],
    choices: [
      { text: '"These must be ancient. Spirit guides, no?"', goto: 'c9.carver.honest' },
      { text: 'Ask what he dreams', goto: 'c9.carver.dreams' },
    ],
  },
  'c9.carver.honest': {
    lines: [
      { who: 'Silvino', text: 'Ha! Ancient like my bicycle. A man in Mexico City, Pedro Linares, dreamed them in a fever around 1936. Paper first, wood later.' },
      { who: 'Silvino', text: 'Arrazola and Tilcajete made them theirs with copal and a knife. Newness is not a scandal, friend. Every tradition was Tuesday once.' },
    ],
  },
  'c9.carver.dreams': {
    lines: [
      { who: 'Silvino', text: 'Last night, a donkey with fish for ears. The night before, nothing, so I painted the tail of the nothing. It sold by noon.' },
      { who: 'Silvino', text: 'People want the creatures to be four thousand years old. They are younger than my grandmother. Both facts are good ones.' },
    ],
  },
  'c9.carver.second': {
    lines: [
      { who: 'Silvino', text: 'Nico told you they are ancient guardians, no? His cousin saw a movie. I told him the true story and he liked it better. A fever! A dream!' },
      { who: 'Silvino', text: 'Since that movie, more visitors come. Some come to see, some come to take. Be the kind that sees, and the village will show you everything.' },
    ],
    effects: ['set:c9.carver2'],
  },
  'c9.carver.idle': {
    lines: [
      { who: 'Silvino', text: 'The paint decides when it is done. I only hold the brush and outvote it occasionally.' },
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
      { who: 'Silvino', text: 'Every time you walk past, it grows a little braver. Keep visiting and I will have to charge it rent.' },
      { text: 'Today: a third eye, or possibly a polka dot with ambition. Either way, it suits.' },
    ],
  },

  // ---------------- Nico, the comparsa kid ----------------
  'c9.kid.first': {
    lines: [
      { who: 'Nico', text: 'You came for the fiesta? I am IN the comparsa this year. We go house to house all night with the banda. ALL night. I get a costume.' },
      { who: 'Nico', text: 'My trombone is borrowed and I know four notes, but at night, moving, four notes is plenty. You will hear us. Everyone hears us.' },
      { who: 'Nico', text: 'Did you see the alebrijes? They are ancient, you know. Spirit guardians from a thousand years. My cousin told me.' },
    ],
    effects: ['set:met.kid', 'journal:people.kid'],
  },
  'c9.kid.two': {
    lines: [
      { who: 'Nico', text: 'Okay, Silvino says the alebrijes came from a fever dream in 1936, which is honestly BETTER. A fever! You can catch one anytime!' },
      { who: 'Nico', text: 'Also, the face paint is for us, for the comparsa. Not for standing next to graves taking pictures. Melitón made that rule very clear.' },
    ],
    effects: ['set:c9.kid2'],
  },
  'c9.kid.idle': {
    lines: [
      { who: 'Nico', text: 'When a cohete goes up, the dogs complain and my mother says ya empezó. It has begun. It began weeks ago. It is always beginning.' },
    ],
  },

  // ---------------- Don Melitón, camposanto caretaker ----------------
  'c9.care.first': {
    lines: [
      { text: 'An old man sweeps between the graves with a broom worn to a slant, unhurried, like the dust and he have an understanding.' },
      { who: 'Don Melitón', text: 'Welcome. Walk anywhere, the paths are for walking. We are getting the beds ready; company is coming from far away.' },
    ],
    effects: ['set:met.caretaker', 'journal:people.caretaker'],
    choices: [
      { text: '"So this is like a Mexican Halloween?"', goto: 'c9.care.halloween' },
      { text: 'Ask who the company is', goto: 'c9.care.night' },
    ],
  },
  'c9.care.halloween': {
    lines: [
      { who: 'Don Melitón', text: 'A fair guess, and a wrong one, and you are not the first. Halloween dresses up as the dead to be safe from them. We set the table for ours.' },
      { who: 'Don Melitón', text: 'Nobody here is afraid of my guests. They are our mothers. You do not fear your mother; you make her favorite dish and you wait up.' },
      { who: 'Don Melitón', text: 'Some Halloween leaks in at the edges, sure. Plastic pumpkins at the tianguis. The children enjoy both. The graves only get one.' },
    ],
  },
  'c9.care.night': {
    lines: [
      { who: 'Don Melitón', text: 'The dead, señorita. The first night the angelitos, the little ones, with sweets and no chile. The second night the grown ones, with mezcal.' },
      { who: 'Don Melitón', text: 'It is not a mourning. It is a reunion with candles. There will be laughing at these graves, and it will be the respectful kind.' },
    ],
  },
  'c9.care.path': {
    lines: [
      { who: 'Don Melitón', text: 'Refugio sent word about the ledger. Then you can carry this: a costal of cempasúchil petals, and the job that goes with it.' },
      { who: 'Don Melitón', text: 'The path from my gate toward the village wants a fresh line of petals. Scent and color, so the souls do not wander the wrong lane.' },
      { who: 'Don Melitón', text: 'Lay them thick where the path bends. The dead were people; people miss turns.' },
    ],
    effects: ['set:c9.path.task'],
  },
  'c9.care.wait': {
    lines: [
      { who: 'Don Melitón', text: 'The costal will not lay itself along the path, and I have swept the same spot twice waiting to watch you do it.' },
    ],
  },
  'c9.vigil': {
    lines: [
      { text: 'Night. The camposanto is a low field of candlelight, and it is loud: gossip, a guitar, somebody’s laugh rolling between the stones.' },
      { text: 'Families eat at the graves they washed. A tamal is set at a headstone the way you would set it before an uncle: casually, certain.' },
      { who: 'Don Melitón', text: 'You see? A reunion. The ones who cry, cry a while, and then someone hands them bread. The night knows its business.' },
    ],
    next: 'c9.vigil2',
  },
  'c9.vigil2': {
    lines: [
      { text: 'On the south wall, apart from her family’s row, Refugio has set one extra candle facing out, the way a light is set for a traveler.' },
      { who: 'Doña Refugio', text: 'For Amara, called Nani. She has an altar in my kitchen and a place on my wall. Fifty years owed, both directions, and paid.' },
      { text: 'The petals you laid run gate to lane to doorway. If she is coming, she will not miss the turn.' },
    ],
    next: 'c9.vigil3',
  },
  'c9.vigil3': {
    lines: [
      { who: 'Don Melitón', text: 'Sit. Eat. Tonight nobody in this camposanto is a stranger, which for one night includes the dead.' },
      { text: 'You stay until the candles are low. Someone tells a story about your grandmother that you have never heard, and now will never forget.' },
      { text: 'The half-finished journal was never unfinished. It was a table set early, waiting for the family to arrive. Tonight it did.' },
    ],
    effects: ['set:c9.complete', 'journal:customs.camposanto'],
  },
  'c9.care.after': {
    lines: [
      { who: 'Don Melitón', text: 'The candles are low and nobody has gone home. That is the whole review; the village will repeat it until roughly forever.' },
      { who: 'Don Melitón', text: 'Doors stay open for you here, señorita. That is not a saying. I mean the doors.' },
    ],
  },
  'c9.care.idle': {
    lines: [
      { who: 'Don Melitón', text: 'Sweep, wash, whitewash, flowers. A camposanto is a garden where the flowers are people. It wants the same daily attention.' },
    ],
  },

  // ---------------- the families at the vigil ----------------
  'c9.vigil.epifania': {
    lines: [
      { text: 'An old woman sits on a folded blanket with her back against a headstone somebody washed white this morning.' },
      { who: 'Doña Epifania', text: 'My mother. She hated to be cold, so I bring one blanket, for me, and I sit close, and we both get the good of it.' },
    ],
  },
  'c9.vigil.bernardo': {
    lines: [
      { who: 'Bernardo', text: 'Mezcal? It is for my father, but he never once finished a glass without help. A family tradition, on both sides of the stone.' },
      { text: 'He tips a splash onto the earth before he drinks. Your own hand moves to do the same before you decide anything about it.' },
    ],
  },
  'c9.vigil.luz': {
    lines: [
      { who: 'Luz', text: 'Tamal. Take it. Do not look at the basket; the basket is not in charge of this night, I am.' },
      { text: 'She is two graves along before you finish thanking her, delivering the same instruction in the same unarguable tone.' },
    ],
  },
  'c9.vigil.serafin': {
    lines: [
      { text: 'A man plays quietly three graves along: the same song around and around, with a different mistake each time.' },
      { who: 'Serafín', text: 'She only ever liked the one song. Fifty-one years of it. I have gotten worse at the middle part on purpose; she laughed at that part.' },
    ],
  },
  'c9.vigil.chuy': {
    lines: [
      { who: 'Chuy', text: 'Look. Wax. If you catch it coming off the candle it goes hard in your hand and then you have a little planet.' },
      { text: 'He has eleven little planets. He is willing, with visible effort, to part with the smallest and least round of them.' },
    ],
  },

  // ---------------- Chasca, in the cempasúchil ----------------
  'c9.chasca.field': {
    lines: [
      { who: 'Chasca', text: 'The soup-eater, standing waist-deep in marigolds. I have followed you across one entire planet and this is the picture I was saving film for.' },
      { who: 'Chasca', text: 'Orange to the horizon, you in the middle, the camposanto wall behind. Do not smile. Just be arriving. You are very good at arriving.' },
      { text: 'The shutter clicks once. She lowers the camera slowly, like setting down a full cup.' },
      { who: 'Chasca', text: 'That was the last frame of the roll, and the roll is the album. Albums end, you know. That is how you can tell they were about something.' },
    ],
    effects: ['set:met.chascaC9', 'set:photo.flash', 'set:photo.c9.field'],
  },
  'c9.chasca.album': {
    lines: [
      { who: 'Chasca', text: 'Nine chapters of you in one bag. I will develop them all at home, in the dark, and the journey will happen again in a tray of water.' },
      { who: 'Chasca', text: 'When you get back, come see the album. It was always going to end where the road ends. Endings are just where albums learn what they are.' },
    ],
  },

  // ---------------- post office ----------------
  'c9.post.pilar': {
    lines: [
      { text: 'The correo counter under the portales holds one clerk, one stamp pad, and a shoebox marked EXTRANJERO. Your name is in the shoebox.' },
      { text: 'An envelope in handwriting you know: it usually looks like an invoice. This time the lines are straight and careful.' },
    ],
    effects: ['letter:oax.pilar'],
  },
  'c9.post.concetta': {
    lines: [
      { text: 'The clerk snaps his fingers and produces a second envelope, sea-stamped, smelling faintly of lemons that traveled badly.' },
    ],
    effects: ['letter:oax.concetta'],
  },
  'c9.post.idle': {
    lines: [
      { text: 'CORREO, says the little sign, and under it: SI NO ESTOY, AHORITA VENGO. The clerk is there anyway, disappointed you did not test it.' },
    ],
  },

  // ---------------- departure ----------------
  'c9.depart': {
    lines: [
      { text: 'The colectivo idles at the south corner, pointed at the highway, the coast, the ship, the long way home.' },
      { text: 'Down to Veracruz, across one more ocean, down one more coast. La Caleta first, then the old road up. The journal rides on top of the bag now.' },
    ],
    choices: [
      { text: 'Board. The long way home.', goto: 'c9.depart.go' },
      { text: 'Not yet. The village is still warm.', goto: 'c9.depart.stay' },
    ],
  },
  'c9.depart.go': {
    lines: [
      { text: 'The village lets you go the way it took you in: without ceremony, with bread for the road you did not ask for.' },
      { text: 'Weeks fold into wake and coastline. Then a grey morning, a familiar fog, and a pier standing on old sugar-trade legs. La Caleta.' },
    ],
    effects: ['travel:la-caleta,22,28,up'],
  },
  'c9.depart.stay': {
    lines: [
      { text: 'The driver nods and settles his hat back over his eyes. Ahorita, his posture says. The word finally makes perfect sense.' },
    ],
  },

  // ---------------- examines ----------------
  'c9.ex.casona': {
    lines: [
      { text: 'Adobe under lime paint, green cantera around the door, rebar praying for a second floor. Bougainvillea is slowly buying the wall.' },
    ],
  },
  'c9.ex.portales': {
    lines: [
      { text: 'The portales: arches of green cantera, the same stone as the grand churches, scaled to a village that likes its grandeur sittable.' },
    ],
  },
  'c9.ex.papel': {
    lines: [
      { text: 'Papel picado shivers overhead, whole scenes scissored into tissue. The wind reads each flag and keeps none of them.' },
    ],
  },
  'c9.ex.cempa': {
    lines: [
      { text: 'Cempasúchil to the field’s edge, orange arguing with orange. The scent is loud. This is the crop you can hear.' },
    ],
  },
  'c9.path.lay': {
    lines: [
      { text: 'You walk the lane from the camposanto gate, sowing petals by the handful. The costal lightens; the road turns the color of embers.' },
      { text: 'Behind you the path burns quietly orange, gate to lane to doorway. A woman crosses herself and thanks you by name. You never told her it.' },
    ],
    effects: ['set:c9.path.laid', 'journal:customs.cempasuchil'],
  },
  'c9.ex.petals1': {
    lines: [
      { text: 'A thin line of last year’s petals, ghost-orange, pressed into the earth. The path remembers being lit, and expects it again.' },
    ],
  },
  'c9.ex.petals2': {
    lines: [
      { text: 'The petal path runs whole from the camposanto gate into the village, laid by your own hands. Bright enough to follow home from either end.' },
    ],
  },
  'c9.ex.comal': {
    lines: [
      { text: 'The big comal, black with decades, over a fire kept modest on purpose. Tortillas at the edge, a tlayuda in the middle, order everywhere.' },
    ],
  },
  'c9.ex.veladora': {
    lines: [
      { text: 'Veladoras in glass, lit early and left burning. Small lights posted like sentries along the route the dead will take.' },
    ],
  },
  'c9.ex.panstall': {
    lines: [
      { text: 'Rounds of pan de muerto, sugar-dusted, each crown wearing its small painted carita. A whole shelf of bread, looking back.' },
    ],
  },
  'c9.ex.barrostall': {
    lines: [
      { text: 'Barro negro: grey clay burnished with a quartz stone until it fires black and shining. Doña Rosa’s trick, the whole craft turned by one woman’s hands.' },
    ],
  },
  'c9.ex.telar': {
    lines: [
      { text: 'The standing loom, warp like harp strings, a deep red cloth climbing it. The red is cochineal: an insect’s life, continued as color.' },
    ],
  },
  'c9.ex.alebrije': {
    lines: [
      { text: 'Copal-wood creatures drying in the sun: impossible anatomy, confident paint. None of them are ancient. All of them are certain.' },
    ],
  },
  'c9.ex.rebozos': {
    lines: [
      { text: 'A rack of rebozos hung to be walked into: cochineal red, indigo, one green that argues with everything near it and wins.' },
      { text: 'The seller says a rebozo carries a baby, a market load, or a grief, depending on the year. She says it like a price list.' },
    ],
  },
  'c9.ex.puestoflores': {
    lines: [
      { text: 'Buckets of cempasuchil by the armful, and one bucket of cresta de gallo, red as a stove ring. The whole week is these two colors.' },
      { text: 'You buy them by the arm, not by the stem. Everyone leaves this stall carrying more orange than they can see over.' },
    ],
  },
  'c9.ex.capilla': {
    lines: [
      { text: 'A small whitewashed chapel over one family’s dead, with a glass door and candles behind it that have been lit since Tuesday.' },
      { text: 'It is repainted every October, by an argument about the color, which is settled the same way every year: white, and someone sulks.' },
    ],
  },
  'c9.ex.campogate': {
    lines: [
      { text: 'The camposanto arch, garlanded in marigolds. Gates usually keep things out. This one is decorated for arrivals.' },
    ],
  },
  'c9.ex.tumba.night': {
    lines: [
      { text: 'A grave dressed like a dinner table: candles, mole, marigolds, a poured mezcal. Whoever sleeps here is being kept excellent company.' },
    ],
  },
  'c9.ex.tumba': {
    lines: [
      { text: 'A whitewashed grave, freshly swept, marigolds heaped at its foot. The stone is old; the attention is this morning’s.' },
    ],
  },
  'c9.ex.ofrenda0': {
    lines: [
      { text: 'Bare boards and folded cloth, a marigold arch half tied. An altar the way a stage is a play: not yet, but soon.' },
    ],
  },
  'c9.ex.ofrenda2': {
    lines: [
      { text: 'The family ofrenda stands complete: water, salt, copal, candles, her mother’s photograph over the bread. Beside it a small table waits, empty.' },
    ],
  },
  'c9.ex.ofrenda3': {
    lines: [
      { text: 'Two altars glow side by side. On the small one: her photograph, her bread, and pieces of a journey arranged like family around her.' },
      { text: 'The room smells of copal and marigold. Nobody here would call the journal half finished now.' },
    ],
  },
  'c9.ex.ofrenda1': {
    lines: [
      { text: 'The ofrenda is filling day by day: cloth, then candles, then the marigold arch. Altars are built the way trust is, in layers.' },
    ],
  },
  'c9.ex.colectivo': {
    lines: [
      { text: 'The colectivo stop. A hand-lettered sign gives the schedule as SALIDAS: AHORITA. The driver sleeps under his hat, honoring it exactly.' },
    ],
  },
  'c9.ex.plaza': {
    lines: [
      { text: 'The plaza breathes in the evening: bench talk under the portales, the banda rehearsing somewhere close, papel picado keeping time overhead.' },
    ],
  },
  'c9.ex.path9': {
    lines: [
      { text: 'Packed valley earth, swept by doorways as far as each broom claims. The street is a shared floor and everyone knows their tile.' },
    ],
  },
  'c9.ex.stall9': {
    lines: [
      { text: 'Eugenia’s stall: chiles by their first names, cacao in fat sacks, chapulines by the scoop, sal de gusano in careful jars.' },
    ],
  },
  'c9.ex.door9': {
    lines: [
      { text: 'From behind the door, a clarinet climbs a scale, misses the top step, and tries again. The banda practices; nobody inside cares that you exist.' },
    ],
  },
  'c9.ex.tree9': {
    lines: [
      { text: 'Shade tree with bougainvillea using it as a ladder. The magenta is winning, to nobody’s regret.' },
    ],
  },
  'c9.ex.sign9': {
    lines: [
      { text: 'The village sign, repainted every fiesta. Under the name, smaller: LOS MUERTOS NO SE FUERON. SE ADELANTARON. The dead did not leave; they went ahead.' },
    ],
  },
  'c9.ex.patio': {
    lines: [
      { text: 'Swept earth patio, the comal at its heart. The ground is kept like a floor because that is exactly what it is.' },
    ],
  },
  'c9.ex.wall9': {
    lines: [
      { text: 'The camposanto wall, whitewashed for the season. On the inside face, generations of names; on this side, marigold garlands.' },
    ],
  },
  'c9.ex.bench9': {
    lines: [
      { text: 'A cantera bench polished by fifty years of sitters. The stone has learned the shape of a good long evening.' },
    ],
  },
  'c9.ex.farol9': {
    lines: [
      { text: 'A plaza lamp, already ringed with moths that clearly know something about the coming nights.' },
    ],
  },
  'c9.ex.tuft9': {
    lines: [
      { text: 'Dry valley grass, gone gold. At 1,500 meters the light cuts sharp and everything casts an opinion of a shadow.' },
    ],
  },

  // ---------------- the love layer: small things, each with a voice ----------------
  'c9.ex.cempacut': {
    lines: [
      { text: 'Cut cempasúchil in tied armfuls, stems to one side, fire to the other. The stems are for the living to carry; the color is for someone else.' },
    ],
  },
  'c9.ex.agave': {
    lines: [
      { text: 'An agave piña by the door, fat as a sleeping pig. Eight years growing in the hills, and it will be sipped slowly, which is only fair.' },
    ],
  },
  'c9.ex.papelstack': {
    lines: [
      { text: 'Papel picado still folded in its stack, colors sorted, scissors resting. A whole sky, waiting in a doorway to be hung.' },
    ],
  },
  'c9.ex.dog1': {
    lines: [
      { text: 'A village dog asleep on the panadería step, the warmest stone on the street.' },
      { text: 'He audited every doorway in the village for a year. This is his published finding.' },
    ],
    effects: ['set:c9.dog.known'],
  },
  'c9.ex.dog2': {
    lines: [
      { text: 'He opens one eye, files you under harmless, and closes it again. The oven wall backs his decision completely.' },
    ],
  },
  'c9.ex.chapulines': {
    lines: [
      { text: 'Chapulines by the scoop, toasted with lime and chile. Crunchy, salty, and proof the valley wastes nothing that hops.' },
    ],
  },
  'c9.ex.cantaros': {
    lines: [
      { text: 'Clay cántaros sweating politely in the shade, a plate over each mouth. The water tastes of rain first and the jar second, in that order.' },
    ],
  },
  'c9.ex.metate': {
    lines: [
      { text: 'Chela’s metate, knee-high, older than the patio around it. Cacao and chile have polished the stone into one long shallow smile.' },
    ],
  },
  'c9.ex.escoba': {
    lines: [
      { text: 'A broom resting mid-shift. Every door sweeps to the middle of the street, where its territory meets the neighbor’s, exactly.' },
    ],
  },
  'c9.ex.gallina': {
    lines: [
      { text: 'Hens auditing the ground, clause by clause. Whatever the comal drops, the committee finds it first.' },
    ],
  },
  'c9.ex.cohete': {
    lines: [
      { text: 'A spent cohete stick, back down from this morning’s announcement. One bang, no spectacle: the sky clearing its throat, the dogs objecting.' },
    ],
  },
  'c9.ex.cubeta': {
    lines: [
      { text: 'Whitewash and a stiff brush, resting between graves. Tidying a tomb is housework here, done for family who only moved.' },
    ],
  },
  'c9.ex.costal.full': {
    lines: [
      { text: 'A costal packed with cempasúchil petals to the brim. It smells like the whole field agreed to travel.' },
    ],
  },
  'c9.ex.costal.empty': {
    lines: [
      { text: 'The costal, empty now and folded square. Every petal it held is out on the path, doing its one bright job.' },
    ],
  },
  'c9.ex.jicaras': {
    lines: [
      { text: 'Painted jícaras stacked mouth-down to dry, red and black lacquer. Tejate tastes better from a gourd, and the gourds seem to know.' },
    ],
  },

  // ---------------- examines: the cocina, indoors and in its own voice ----------------
  'c9.ex.comal.cocina': {
    lines: [
      { text: 'The kitchen comal, set low against the west wall where the smoke knows the way out. It is the only fire in the room and it is never quite out.' },
    ],
  },
  'c9.ex.metate.cocina': {
    lines: [
      { text: 'Refugio’s metate, kept on the floor by the fire because that is where the knees go. The stone leans a little, worn deeper on the near side.' },
    ],
  },
  'c9.ex.escoba.cocina': {
    lines: [
      { text: 'The broom parked in the corner by the door, bristles up, so the dust it has already gathered stays gathered.' },
    ],
  },
  'c9.ex.cantaros.cocina': {
    lines: [
      { text: 'Two cántaros just inside the door, plates over their mouths, set where anyone coming in from the sun will reach them first.' },
    ],
  },
  'c9.ex.papel.cocina': {
    lines: [
      { text: 'Papel picado strung across the kitchen at exactly the height of a tall guest, who will duck, and a short one, who will not.' },
      { text: 'These are the practice ones, cut early to get the hand back. The good strings go out over the street.' },
    ],
  },
  'c9.ex.costal.cocina': {
    lines: [
      { text: 'Costales banked in the corner: corn in one, dried chiles in another, and a third holding nothing at all but its own shape.' },
    ],
  },
  'c9.ex.papelstack.cocina': {
    lines: [
      { text: 'A stack of tissue half cut, the scissors resting on it mid-flower. Whoever it is comes back to this between everything else.' },
    ],
  },
  'c9.ex.ristra': {
    lines: [
      { text: 'A ristra of chiles hung on the wall to dry, pasilla and guajillo braided in together, going darker and quieter by the week.' },
    ],
  },
  'c9.ex.cazuelas': {
    lines: [
      { text: 'Cazuelas stacked by size, each chipped in a different honest place.' },
      { text: 'The big one at the bottom is for mole only. Everyone knows this without being told.' },
    ],
  },
  'c9.ex.tuba1': {
    lines: [
      { text: 'The banda’s tuba rests on a chair outside rehearsal, catching its breath.' },
      { text: 'The chair was carried out specifically. A tuba does not sit on the ground like some clarinet.' },
    ],
    effects: ['set:c9.tuba.known'],
  },
  'c9.ex.tuba2': {
    lines: [
      { text: 'Inside, the banda runs the same eight bars without it. You can hear the exact hole where the tuba goes.' },
    ],
  },
  'c9.ex.rotulo': {
    lines: [
      { text: 'A hand-painted sign, half born: three letters with fat shadows and curls, then pencil ghosts where the rest will be.' },
      { text: 'The flourish underneath is already finished. It was clearly the fun part.' },
    ],
  },
  'c9.ex.bugambilia': {
    lines: [
      { text: 'Bougainvillea pouring over the wall, magenta by the armload. The wall considers this fair rent for being slowly taken apart.' },
    ],
  },
  'c9.ex.nicho': {
    lines: [
      { text: 'A corner nicho: a saint the size of a thumb, marigolds changed this morning, one steady flame. Easy to miss, kept too well to be forgotten.' },
    ],
  },
  'c9.ex.paletas': {
    lines: [
      { text: 'The paletero’s bicycle cart, parked with intent near the colectivo stop.' },
      { text: 'The bell is small and silver, and every child in the valley can hear it through a closed door and a nap.' },
    ],
  },
  'c9.ex.crates': {
    lines: [
      { text: 'Market crates in a leaning tower: tomatillos still in their paper lanterns, chiles ranked by how much they intend to hurt you.' },
    ],
  },
  'c9.ex.pantray': {
    lines: [
      { text: 'Trays of pan de muerto cooling by the door, caritas up. Forty small painted faces, patient, all pointed at the street.' },
    ],
  },
  'c9.ex.pantray.out': {
    lines: [
      { text: 'The rack stands one batch lighter: the altar bread went out first, warm, in your arms. The rest cools for the living, who can wait.' },
    ],
  },
  'c9.ex.alebrije.close': {
    lines: [
      { text: 'Up close the half-painted one is an argument: cobalt insists, orange objects, dots file in to mediate. The colors argue, and the colors win.' },
    ],
    effects: ['set:c9.alebrije.close'],
  },
  'c9.ex.wallcal': {
    lines: [
      { text: 'Cal above, colour below, and the join is a hand\'s width of somebody\'s decision made once and never revisited.' },
      { text: 'The top of the wall has gone the soft brown of thirty years of comal smoke. Refugio calls that seasoning and refuses to paint over it.' },
    ],
  },
  'c9.ex.floorsaltillo': {
    lines: [
      { text: 'Saltillo tiles, fired by hand, no two the same red. Warm underfoot by ten in the morning and still warm at midnight.' },
      { text: 'A marigold petal has got into the grout. Several have. It is that month.' },
    ],
  },
  'c9.ex.rugpetate': {
    lines: [
      { text: 'A petate of woven palm with a grana stripe and a marigold one. Babies sleep on these, chiles dry on these, and eventually everyone is wrapped in one.' },
    ],
  },
};

/** Valley examine arms; shared props keep map tags so other coasts stay themselves. */
export const OAXACA_EXAMINES: Record<string, ExamineArm[]> = {
  // The cocina is skinned to painted cal, saltillo and petate in
  // `art/sets/oaxaca.ts`. The village's own `floorEarth` cells keep their
  // patio words below.
  wallInt: [{ map: 'cocina', node: 'c9.ex.wallcal' }],
  rug: [{ map: 'cocina', node: 'c9.ex.rugpetate' }],
  casona: [{ node: 'c9.ex.casona' }],
  portales: [{ node: 'c9.ex.portales' }],
  papel: [
    { map: 'cocina', node: 'c9.ex.papel.cocina' },
    { node: 'c9.ex.papel' },
  ],
  cempa: [{ node: 'c9.ex.cempa' }],
  petalpath: [
    { when: { has: ['c9.path.task'], not: ['c9.path.laid'] }, node: 'c9.path.lay' },
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
    { when: { has: ['c9.complete'] }, node: 'c9.ex.tumba.night' },
    { node: 'c9.ex.tumba' },
  ],
  ofrenda: [
    { when: { not: ['c9.ledger'] }, node: 'c9.ex.ofrenda0' },
    { when: { has: ['c9.ofrenda.done'] }, node: 'c9.ex.ofrenda3' },
    { when: { has: ['c9.family.done'] }, node: 'c9.ex.ofrenda2' },
    { node: 'c9.ex.ofrenda1' },
  ],
  correo: [
    { when: { not: ['letter.read.oax.pilar'] }, node: 'c9.post.pilar' },
    { when: { has: ['letter.read.oax.pilar'], not: ['letter.read.oax.concetta'] }, node: 'c9.post.concetta' },
    { node: 'c9.post.idle' },
  ],
  colectivo: [
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
