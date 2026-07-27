import type { MapData } from '../../engine/grid';
import { cellHash } from '../../art/pix';

/**
 * A fictional shore village near Stone Town. Coral-rag houses under lime
 * wash, carved doors, barazas grown into house fronts; a spice-farm
 * edge at the top of the lane, a night-market corner warming up by the
 * jetty, and a tide that walks out and leaves its floor to be farmed.
 *
 * Laid out the way Stone Town actually is: no ruled streets. House fronts
 * step forward and back, so the lane pinches to a shoulder's width and then
 * opens without warning into a courtyard with a mango tree in it. Two rows
 * stay swept clear end to end, y12 and y19, because a lane you cannot walk
 * the length of is a diagram.
 */

const W = 46;
const H = 32;

/**
 * Nyumba anchors: 5x5 footprint, door at [+2,+4], casa grid unchanged. The
 * north side alternates between y5 (set back, leaving a pocket of shade in
 * front of the door) and y6 (built right out to the lane).
 */
const NYUMBAS: [number, number][] = [
  [2, 6],
  [12, 5], // Mzee Rashid's; set back, so his baraza sits in its own shade
  [22, 6], // the famous carved door; Chasca's spot
  [29, 7], // built right out into the lane, so it pinches to one tile
  [36, 6], // the house the market corner leans against
  [2, 14], // stepped down a row, so the south side is not a ruled row either
  [11, 13],
  [21, 13], // Bi Amina's kanga shop
  [28, 14], // the same trick on the lower lane, at the other end
];

/** Doors that open: the kanga shop. The rest are lives, latched. */
const OPEN_DOORS = new Set(['21,13']);

const onJetty = (x: number, y: number) => (x === 38 || x === 39) && y >= 21 && y <= 29;

/**
 * The water's edge, which is a curve because water does not do corners. The
 * tide line is where the wet floor begins; the sea edge is where walking
 * stops. Neither is ever a ruled band.
 */
const tideLine = (x: number) =>
  Math.round(23.2 + 1.7 * Math.sin(x * 0.17 + 2.1) + 1.0 * Math.sin(x * 0.43 + 0.4));
const seaEdge = (x: number) =>
  Math.round(28.7 + 1.1 * Math.sin(x * 0.21 + 0.7) + 0.6 * Math.sin(x * 0.55 + 2.6));

/**
 * A lane as a wandering band rather than a stripe: the centre drifts by a
 * tile and a half, the width breathes between two and four.
 */
function inLane(x: number, y: number, base: number, seed: number): boolean {
  const c = base + Math.sin(x * 0.31 + seed) * 0.95 + Math.sin(x * 0.13 + seed * 1.7) * 0.6;
  const half = 1.5 + 0.6 * Math.sin(x * 0.23 + seed * 2.3);
  return Math.abs(y - c) <= half;
}

/** The climb to the spice farm, wandering the same way. */
function inClimb(x: number, y: number): boolean {
  const c = 9.6 + Math.sin(y * 0.29 + 1.4) * 0.85;
  return y >= 1 && y <= 20 && Math.abs(x - c) <= 1.05;
}

/** Swept open ground: where the lanes meet, and in front of the carved door. */
const PLAZAS: [number, number, number][] = [
  [10, 11.4, 3.2], // the junction everyone crosses and nobody hurries through
  [24, 11.8, 2.7], // the swept square the carved door looks out on
  [19, 8.6, 3.1], // the courtyard between the two north houses
  [9, 18.6, 2.6], // where the climb meets the lower lane
  [38, 19.6, 2.4], // the top of the shore path
];

const inPlaza = (x: number, y: number) =>
  PLAZAS.some(([cx, cy, r]) => (x - cx) * (x - cx) + (y - cy) * (y - cy) * 1.7 <= r * r);

function groundAt(x: number, y: number): string {
  if (onJetty(x, y)) return 'K';
  if (y >= seaEdge(x)) return 'S';
  if (y >= tideLine(x)) return 'u'; // the tide-out flats, walked on
  if (y >= 20) return '.';
  if (inClimb(x, y)) return 'c';
  if (y >= 8 && y <= 15 && inLane(x, y, 11.5, 0.9)) return 'c';
  if (y >= 15 && y <= 21 && inLane(x, y, 18.6, 2.4)) return 'c';
  if ((x === 38 || x === 39) && y >= 13 && y <= 20) return 'c';
  if (y >= 4 && inPlaza(x, y)) return 'c';
  // The spice-farm edge, its drying ground cut on the diagonal.
  if (y <= 4) {
    if (y >= 1 && y <= 3 && x >= 4 + y && x <= 18 - Math.floor(y / 2)) return 'd';
    return 'G';
  }
  return '.';
}

/** Barazas, in runs of one and three, at whatever height the front sits. */
const BARAZAS = new Set(
  [
    [3, 11], [6, 11],
    [12, 10], [13, 10], [16, 10],
    [22, 11], [27, 11],
    [34, 9], [34, 10],
    [37, 11], [41, 11],
    [7, 18], [8, 18],
    [13, 18], [17, 18],
    [26, 18], [27, 18], [35, 18],
  ].map(([x, y]) => `${x},${y}`),
);

/** Makuti awnings: palm thatch on two poles, shade thrown across a doorway. */
const MAKUTI = new Set([[5, 11], [17, 10], [26, 11], [42, 15], [12, 18], [20, 18]].map(([x, y]) => `${x},${y}`));

/** Low coral-rag garden walls: the edge that tells you a space is a space. */
const WALLS = new Set(
  [
    // The courtyard between the north houses, walled along its back.
    [17, 5], [18, 5], [19, 5], [20, 5], [21, 5], [17, 6], [17, 7],
    // The yard beside the first house, closed off at the top of the alley.
    [7, 6], [8, 6],
    // Shore-facing plots, so the beach begins somewhere on purpose.
    [12, 20], [13, 20], [14, 20], [15, 20],
    [22, 20], [23, 20], [24, 20], [25, 20], [26, 20],
    [31, 20], [32, 20],
    // The market corner's back wall, holding the lamps in.
    [42, 11], [43, 11], [44, 11],
  ].map(([x, y]) => `${x},${y}`),
);

/** Mwani lines: three farms, staked where each farmer felt like staking. */
const MWANI = new Set(
  [
    [3, 24], [4, 24], [6, 25], [7, 25], [4, 26], [5, 26], [6, 26], [8, 27], [9, 27], [3, 27],
    [11, 25], [12, 25], [14, 26], [15, 26], [11, 27], [12, 27], [16, 27], [13, 28], [17, 28],
    [19, 26], [20, 26], [21, 26], [22, 27], [19, 28], [20, 28], [24, 28],
    [26, 26], [27, 26], [29, 27], [30, 27], [26, 28], [31, 28], [34, 27], [35, 28],
  ].map(([x, y]) => `${x},${y}`),
);

/** Clove mats, drifting across the drying ground instead of ruling it. */
const CLOVEMATS = new Set(
  [[6, 2], [7, 2], [8, 3], [12, 2], [13, 3], [14, 3], [16, 2], [5, 1], [11, 1]].map(([x, y]) => `${x},${y}`),
);

/** Trees on the farm edge, in the loose knots trees actually grow in. */
const TREES = new Set(
  [[20, 2], [21, 3], [24, 2], [28, 3], [29, 2], [33, 2], [36, 3], [37, 2], [41, 3], [44, 2], [42, 6], [44, 8]].map(
    ([x, y]) => `${x},${y}`,
  ),
);

/** The love pass, second time round: life gathers, and it gathers unevenly. */
const DECOR: Record<string, string> = {
  // --- the lane, north side ---
  '4,11': 'Z', // doormat under the first latched door
  '8,11': 'L', // a kanga line over the junction, which is where laundry goes
  '7,8': 'q', // madafu stacked in the alley yard, out of the sun
  '17,11': 'J', // Rashid's kahawa round, parked mid-conversation
  '14,10': 'P', // the ginger cat, in the pocket of shade, unmovable
  '19,6': 'T', // the courtyard mango, which is what the courtyard is for
  '20,7': 'q', // a heap of madafu under it, machete in the top one
  '18,8': 'z', // a spice sack open at the mouth
  '20,9': 'b', // one baraza inside the courtyard, facing the tree
  '19,11': 'L', // a kanga line strung across the courtyard mouth
  '27,10': 'k', // the kanga rack, out where the light is
  '31,12': 'Z', // doormat, fourth door, out where the lane squeezes past
  '35,5': 'L', // washing between the last two north houses
  '35,7': 'R', // repairs against the far wall: scaffold, blocks, lime
  '35,8': 'O',
  '34,8': 'V',
  // --- the lane, south side ---
  '19,16': 'Q', // the white chicken, still on brand
  '26,17': 'U', // the henna stall at the shop corner
  '26,15': 'L', // kangas drying between the shop and its neighbour
  '18,18': 'J', // a second kahawa round, at the other end of the day
  '21,18': 'L', // washing strung over the lower lane
  '30,19': 'Z',
  '20,17': 'q',
  '18,13': 'z',
  '4,19': 'Z',
  '7,17': 'P', // the black-and-white auditor
  '14,18': 'P', // the grey one, asleep, immovable by design
  '33,18': 'B', // the fish bicycle, leaned where it always leans
  '33,17': 'A', // bao, mid-game, beside it
  // --- the market corner ---
  '37,13': 'M',
  '36,13': 'z',
  '42,13': 'M',
  '43,13': 'k',
  '35,15': 'M', // the third stall, off on its own, which is how they stand
  '41,13': 'q', // green coconuts, the loudest thing on a bone-white street
  '44,14': 'z',
  '36,16': 'l',
  '41,15': 'l',
  '43,18': 'l',
  '41,16': 't', // the domino table
  '40,17': 'o',
  '42,17': 'o',
  '42,16': 'o',
  '39,16': 'e', // dagaa drying, silver, in the last of the sun
  '44,16': 'E',
  '44,18': 'P',
  // --- the shore ---
  '36,20': 'p', // the shipping agent's counter
  '41,20': 'g', // the village sign
  '28,21': 'N', // Issa's half-built ngalawa, hull up on blocks
  '31,21': 'W', // its spare spar on trestles beside it
  '33,21': 'E', // fish traps stacked at the yard's edge
  '26,21': 'j', // the handcart that brought all of it down
  '32,23': 'O', // coral blocks doubling as boat chocks
  '29,23': 'n', // the net he mends while he thinks about the hull
  '20,21': 'e', // dagaa racks on the dry sand
  '21,23': 'e',
  '18,21': 'n', // a net spread beside them, waiting on the needle
  '24,23': 'j', // the cart, run down for the morning's load
  '9,23': 'e',
  '8,21': 'q',
  '4,21': 'N', // a third hull, up on the dry sand at the far end
  '11,21': 'j',
  '18,23': 'F', // two flip-flops, one goal
  '14,24': 'N', // a second boat, nose to the tide
  '17,25': 'N',
  '15,23': 'n', // her net, spread to dry between them
  '12,23': 'q', // madafu for whoever is working
  '43,21': 'E',
  '33,25': 'j', // the cart gone out onto the flats after the seaweed
  '35,24': 'n',
  '44,23': 'n',
};

/** Boats afloat: placed against the water so the tide can move and they follow. */
const AFLOAT: [number, number, string][] = [
  [42, 1, 'H'], // the jahazi at anchor, just off the jetty head
  [36, 0, 'N'], // a ngalawa riding at the jetty's elbow
  [21, 1, 'N'],
  [12, 2, 'N'],
];

const AFLOAT_CELLS = new Map<string, string>(
  AFLOAT.map(([x, off, ch]) => [`${x},${Math.min(H - 2, seaEdge(x) + off)}`, ch]),
);

function objectAt(x: number, y: number): string {
  // Boundary: clove trees behind, rock groins beside, the sea below.
  if (y === 0) return 'T';
  if ((x === 0 || x === W - 1) && y <= 28) return 'r';
  for (const [hx, hy] of NYUMBAS) {
    if (x >= hx && x < hx + 5 && y >= hy && y < hy + 5) {
      if (x === hx + 2 && y === hy + 4) return OPEN_DOORS.has(`${hx},${hy}`) ? ' ' : 'D';
      if (x === hx && y === hy + 4) return 'C';
      return 'x';
    }
  }
  const key = `${x},${y}`;
  if (WALLS.has(key)) return 'a';
  if (BARAZAS.has(key)) return 'b';
  if (MAKUTI.has(key)) return 'h';
  if (TREES.has(key)) return 'T';
  if (CLOVEMATS.has(key)) return 'm';
  const dec = DECOR[key];
  if (dec) return dec;
  const boat = AFLOAT_CELLS.get(key);
  if (boat) return boat;
  // Mwani only grows where the tide leaves the floor bare.
  if (MWANI.has(key) && groundAt(x, y) === 'u') return 'w';
  // Sparse dry tufts on open sand, deterministic so nothing crawls.
  if (groundAt(x, y) === '.' && y < 20) {
    if (cellHash(x, y, 71) < 0.04) return 'i';
  }
  if (groundAt(x, y) === 'G') {
    if (cellHash(x, y, 72) < 0.1) return 'i';
  }
  // What the tide forgot: starfish, shells, one crab with big plans. They
  // gather along the tide line, because that is where the sea leaves them.
  if (groundAt(x, y) === 'u') {
    if (cellHash(x, y, 73) < (Math.abs(y - tideLine(x)) <= 1 ? 0.13 : 0.03)) return 'Y';
  }
  if (groundAt(x, y) === '.' && y >= 20 && cellHash(x, y, 74) < 0.03) return 'Y';
  return ' ';
}

function paint(): { ground: string[]; objects: string[] } {
  const ground: string[] = [];
  const objects: string[] = [];
  for (let y = 0; y < H; y++) {
    let g = '';
    let o = '';
    for (let x = 0; x < W; x++) {
      g += groundAt(x, y);
      o += objectAt(x, y);
    }
    ground.push(g);
    objects.push(o);
  }
  return { ground, objects };
}

const { ground, objects } = paint();

export const ZANZIBAR_MAP: MapData = {
  id: 'zanzibar',
  name: 'Fukoni',
  spawn: [38, 28],
  spawnFacing: 'up',
  triggers: [{ at: [23, 17], type: 'door', to: 'kangashop', spawn: [6, 7], facing: 'up' }],
  legend: {
    '.': { t: 'sand' },
    u: { t: 'sandWet' },
    G: { t: 'grass' },
    d: { t: 'dirt' },
    c: { t: 'corallane' },
    K: { t: 'pierdeck' },
    S: { t: 'sea', solid: true },
    ' ': { t: 'void' },
    T: { t: 'tree', solid: true, tall: true },
    r: { t: 'rock', solid: true },
    i: { t: 'tuft' },
    C: { t: 'nyumba', solid: true, tall: true },
    x: { t: 'blocked', solid: true, tall: true },
    D: { t: 'mlango', solid: true, tall: true },
    b: { t: 'baraza', solid: true },
    M: { t: 'stall', solid: true, tall: true },
    k: { t: 'kangarack', solid: true, tall: true },
    z: { t: 'spicesack', solid: true },
    l: { t: 'marketlamp', solid: true, tall: true },
    p: { t: 'postcounter', solid: true, tall: true },
    g: { t: 'signpost', solid: true, tall: true },
    t: { t: 'table', solid: true },
    o: { t: 'stool', solid: true },
    N: { t: 'ngalawa', solid: true, tall: true },
    H: { t: 'dhow', solid: true, tall: true },
    m: { t: 'clovemat', solid: true },
    w: { t: 'mwanirow', solid: true },
    A: { t: 'baoboard', solid: true, tall: true },
    B: { t: 'baiskeli', solid: true },
    E: { t: 'madema', solid: true, tall: true },
    F: { t: 'flipflopgoal' },
    J: { t: 'kahawatray', solid: true },
    L: { t: 'kangaline', solid: true, tall: true },
    O: { t: 'coralblocks', solid: true },
    P: { t: 'paka', solid: true },
    Q: { t: 'kuku', solid: true },
    R: { t: 'scaffold', solid: true, tall: true },
    U: { t: 'hennastool', solid: true },
    V: { t: 'limepail', solid: true },
    W: { t: 'sailspar', solid: true, tall: true },
    Y: { t: 'starfish' },
    Z: { t: 'doormat' },
    a: { t: 'ukuta', solid: true, tall: true },
    h: { t: 'makuti', solid: true, tall: true },
    q: { t: 'madafu', solid: true },
    e: { t: 'dagaa', solid: true },
    j: { t: 'mkokoteni', solid: true, tall: true },
    n: { t: 'nyavu', solid: true },
  },
  ground,
  objects,
};

/** Bi Amina's kanga shop: one cool room lined floor to ceiling with color. */
export const KANGASHOP_MAP: MapData = {
  id: 'kangashop',
  name: 'Kwa Bi Amina',
  spawn: [6, 7],
  spawnFacing: 'up',
  legend: {
    '.': { t: 'floorEarth' },
    '#': { t: 'wallInt', solid: true, tall: true },
    S: { t: 'shelf', solid: true, tall: true },
    k: { t: 'kangarack', solid: true, tall: true },
    t: { t: 'table', solid: true },
    o: { t: 'stool', solid: true },
    r: { t: 'rug' },
    m: { t: 'mat' },
    R: { t: 'radio', solid: true },
    w: { t: 'sewing', solid: true },
    P: { t: 'paka', solid: true },
    l: { t: 'marketlamp', solid: true, tall: true },
    L: { t: 'kangaline', solid: true, tall: true },
    U: { t: 'hennastool', solid: true },
    J: { t: 'kahawatray', solid: true },
    A: { t: 'baoboard', solid: true, tall: true },
    ' ': { t: 'void' },
  },
  ground: [
    '.............',
    '.............',
    '.............',
    '.............',
    '.............',
    '.............',
    '.............',
    '.............',
    '.............',
  ],
  // Racks all the way round the edge is a warehouse. This is a shop with a
  // side she works on and a side you sit on: the cutting counter, the
  // machine, the stool and the lamp are banked into the north-west where the
  // light is, two kangalines stand free in the middle so you have to walk
  // around cloth to cross the room, and the coffee tray, the henna stool and
  // the cat hold the far corner where customers end up.
  objects: [
    '#kk#S###SS###',
    '#ttw      kk#',
    '#lRo        #',
    '#        L  #',
    '#kk     L   #',
    '#k  r     U #',
    '#  r     JP #',
    '#A   k      #',
    '######m######',
  ],
  triggers: [{ at: [6, 8], type: 'door', to: 'zanzibar', spawn: [23, 18], facing: 'down' }],
};
