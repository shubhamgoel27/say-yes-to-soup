import type { Cond, NodeMap, NpcDef } from '../schema';
import type { Staging } from '../staging';

/**
 * Busan's goodbye, staged. Mr. Gong stamps the berth and says "First light,
 * before the auction eats her"; the night then passes in one door's dark
 * (a bunk above the ferry office, the cranes clanking), and you wake into
 * the lane at first light with the auction already spilling up it: crates
 * and foam boxes down both shoulders, the auctioneer singing prices on the
 * floor, buyers bidding with their fingers, and Sun-hee three customers
 * deep under the red awning. That is the picture "First light, the auction
 * spilling up the lane. Sun-hee does not look up." was written for.
 *
 * Row 13 is the barrows' row and stays clear end to end, the shoulders
 * (rows 10-11 and 15) take the crates, and every body stands two cells
 * clear of every other, so nobody is drawn over anybody.
 */

/** The dawn after the berth, until the Malabar Star has you. */
const DAWN: Cond = { has: ['c5.berth'], not: ['c6.arrived'] };

/**
 * Where the night's door lands you: on the lane beside her stall, facing
 * her, so the first Space is the goodbye and nobody is drawn over anybody.
 */
export const DAWN_LANDING: [number, number] = [18, 12];

export const STAGING: Staging = {
  hours: [
    // First light. Snapped in the dark of the door that ends the night, so
    // nobody watches the afternoon jump; after the goodbye the clock runs on
    // from dawn into the loading morning.
    // Held in the gold of the first quarter hour, where the day curve still
    // reads as dawn ("a dawn like oyster shell").
    { when: { has: ['c5.berth'], not: ['c5.bye'] }, on: ['busan', 'teahouse'], min: 0.005, max: 0.03, snap: true },
  ],
  blocking: [
    // She keeps her stall: the bag is packed and she is not looking up.
    { id: 'sunhee', when: DAWN, map: 'busan', at: [17, 12], dir: 'down', busy: true },
    // The lane's regulars are buying, not selling, at this hour.
    { id: 'daeho', when: DAWN, map: 'busan', at: [21, 11], dir: 'down' },
    { id: 'bak', when: DAWN, map: 'busan', at: [22, 14], dir: 'up' },
  ],
};

/**
 * The auction itself: three people who are only ever here at first light.
 * They have one line each, because at this hour nobody has two.
 */
export const AUCTION_NPCS: NpcDef[] = [
  {
    id: 'auctioneerC5',
    name: 'The auctioneer',
    map: 'busan',
    when: DAWN,
    pos: [24, 12],
    range: 0,
    look: {
      skin: '#d6a87a',
      hair: '#2a2420',
      cloth: '#2c3e57',
      stripe: '#f2e6d0',
      hat: '#e8dcc4',
      hatStyle: 'peaked',
      garb: 'jacket',
      pants: '#3d3a36',
    },
    entry: [{ node: 'c5.auction.caller' }],
  },
  {
    id: 'buyerC5',
    name: 'A restaurant buyer',
    map: 'busan',
    when: DAWN,
    // Off the shoulder past the foam boxes: at 24,10 the magpie's post
    // stood up out of the visor.
    pos: [27, 10],
    range: 0,
    look: {
      skin: '#e0b48a',
      hair: '#3a2c24',
      cloth: '#c96a5a',
      stripe: '#f2e6d0',
      hat: '#e8d0b0',
      hatStyle: 'visor',
      garb: 'shirt',
      pants: '#4a4a5c',
      apron: '#5a6e84',
    },
    entry: [{ node: 'c5.auction.buyer' }],
  },
  {
    id: 'porterC5',
    name: 'A porter',
    map: 'busan',
    when: DAWN,
    pos: [20, 15],
    range: 0,
    look: {
      skin: '#c99a6c',
      hair: '#1f1a16',
      cloth: '#5e7a52',
      stripe: '#c9a35f',
      hat: '#2c3e57',
      hatStyle: 'beanie',
      garb: 'coveralls',
      pants: '#3c4a5c',
      sleeves: 'short',
    },
    entry: [{ node: 'c5.auction.porter' }],
  },
];

export const AUCTION_NODES: NodeMap = {
  'c5.auction.caller': {
    lines: [
      { text: 'He sings the prices in one long breath of numbers. The buyers answer with their fingers and never with their mouths.' },
    ],
  },
  'c5.auction.buyer': {
    lines: [
      { who: 'A restaurant buyer', text: 'Three boxes of hairtail, and I never lifted a hand. Thirty years; he reads my eyebrows.' },
    ],
  },
  'c5.auction.porter': {
    lines: [
      { who: 'A porter', text: 'Ppalli, ppalli! Feet in, please. The ice does not wait for anybody.' },
    ],
  },
};

/** The crates the auction spills up the lane, down both shoulders. */
export const AUCTION_DRESSING = {
  map: 'busan',
  when: { has: ['c5.berth'] } as Cond,
  cells: [
    [19, 11, { t: 'foambox', solid: true }],
    [20, 10, { t: 'crate', solid: true }],
    [21, 10, { t: 'foambox', solid: true }],
    [23, 11, { t: 'basin', solid: true }],
    [22, 15, { t: 'crate', solid: true }],
    [23, 15, { t: 'foambox', solid: true }],
    [25, 15, { t: 'crate', solid: true }],
    [15, 15, { t: 'foambox', solid: true }],
  ] as [number, number, { t: string; solid?: boolean }][],
};
