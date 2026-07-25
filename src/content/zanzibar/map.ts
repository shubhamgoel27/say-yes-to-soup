import type { MapData } from '../../engine/grid';
import { cellHash } from '../../art/pix';

/**
 * A fictional shore village near Stone Town. Coral-rag houses under lime
 * wash, carved doors, barazas grown into the house fronts; a spice-farm
 * edge at the top of the lane, a night-market corner warming up by the
 * jetty, and a tide that walks out and leaves its floor to be farmed.
 */

const W = 46;
const H = 32;

/** Nyumba anchors: 5x5 footprint, door at [+2,+4], casa grid unchanged. */
const NYUMBAS: [number, number][] = [
  [3, 6],
  [13, 6], // Mzee Rashid's; his baraza flanks the lane
  [22, 6], // the famous carved door; Chasca's spot
  [31, 6],
  [3, 13],
  [12, 13],
  [21, 13], // Bi Amina's kanga shop
  [30, 13],
];

/** Doors that open: the kanga shop. The rest are lives, latched. */
const OPEN_DOORS = new Set(['21,13']);

const onJetty = (x: number, y: number) => (x === 38 || x === 39) && y >= 21 && y <= 29;

function groundAt(x: number, y: number): string {
  if (onJetty(x, y)) return 'K';
  if (y >= 29) return 'S';
  if (y >= 23) return 'u'; // the tide-out flats, walked on
  if (y >= 20) return '.';
  // Lanes of crushed coral. The vertical lane climbs to the spice farm.
  if ((x === 9 || x === 10) && y >= 1 && y <= 19) return 'c';
  if ((y === 11 || y === 12) && x >= 1 && x <= 44) return 'c';
  if ((y === 18 || y === 19) && x >= 1 && x <= 44) return 'c';
  if ((x === 38 || x === 39) && y >= 13 && y <= 19) return 'c';
  // The spice-farm edge.
  if (y <= 4) {
    if (y >= 1 && y <= 3 && x >= 5 && x <= 17) return 'd';
    return 'G';
  }
  return '.';
}

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
  // Barazas built into the house fronts, facing the lane.
  if ((x === 14 || x === 16) && y === 11) return 'b';
  if ((x === 32 || x === 34) && y === 11) return 'b';
  if ((x === 4 || x === 6) && y === 18) return 'b';
  if ((x === 13 || x === 15) && y === 18) return 'b';
  // The market corner, waiting for dusk.
  if ((x === 37 || x === 42) && y === 13) return 'M';
  if ((x === 36 && y === 14) || (x === 44 && y === 14)) return 'z';
  if ((x === 36 && y === 16) || (x === 43 && y === 17)) return 'l';
  if (x === 43 && y === 15) return 'k';
  if (x === 41 && y === 16) return 't'; // the domino table
  if ((x === 40 || x === 42) && y === 17) return 'o';
  // Chasca's corner: the carved door of the third house, and a kanga rack.
  if (x === 26 && y === 11) return 'k';
  // Shore furniture.
  if (x === 36 && y === 20) return 'p'; // the shipping agent's counter
  if (x === 41 && y === 21) return 'g'; // the village sign
  if (x === 28 && y === 21) return 'N'; // Issa's half-built ngalawa
  if ((x === 14 && y === 24) || (x === 23 && y === 26)) return 'N';
  if (x === 24 && y === 29) return 'H'; // the jahazi at anchor
  // Mwani rows seamed across the flats.
  if ((y === 25 || y === 27) && x >= 4 && x <= 16 && x % 2 === 0) return 'w';
  // Clove-drying mats along the farm edge.
  if (y === 2 && (x === 6 || x === 8 || x === 12 || x === 14 || x === 16)) return 'm';
  if (y === 3 && (x === 5 || x === 17)) return 'm';
  // Clove and mango trees on the farm edge.
  if ((y === 2 && (x === 20 || x === 28 || x === 36 || x === 43)) || (y === 3 && (x === 24 || x === 32 || x === 40))) return 'T';
  // --- the love pass: life gathers at doors, corners, and the water line ---
  // Repairs against the fourth house: scaffolding, coral blocks, lime wash.
  if (x === 36 && y === 8) return 'R';
  if (x === 36 && y === 9) return 'O';
  if (x === 37 && y === 9) return 'V';
  // A kanga line strung between houses, out of the lane's dust.
  if (x === 19 && y === 8) return 'L';
  // Rashid's corner: the kahawa round, parked mid-conversation.
  if (x === 17 && y === 11) return 'J';
  // Doormats where the latched doors keep their households.
  if ((x === 33 && y === 11) || (x === 5 && y === 18)) return 'Z';
  // Cats, stationed where everyone must step around them.
  if ((x === 14 && y === 18) || (x === 44 && y === 16)) return 'P';
  // A white chicken patrols outside the kanga shop, on brand.
  if (x === 19 && y === 16) return 'Q';
  // The henna stall at the shop corner.
  if (x === 26 && y === 17) return 'U';
  // Market edges: the fish bicycle, and bao beside the domino table.
  if (x === 35 && y === 15) return 'B';
  if (x === 39 && y === 16) return 'A';
  // Fish traps stacked along the shore, and a spare sail on trestles.
  if ((x === 42 || x === 33) && y === 20) return 'E';
  if (x === 26 && y === 20) return 'W';
  // Two flip-flops, one goal.
  if (x === 18 && y === 21) return 'F';
  // Sparse dry tufts on open sand, deterministic so nothing crawls.
  if (groundAt(x, y) === '.' && y < 20) {
    if (cellHash(x, y, 71) < 0.04) return 'i';
  }
  if (groundAt(x, y) === 'G') {
    if (cellHash(x, y, 72) < 0.1) return 'i';
  }
  // What the tide forgot: starfish, shells, one crab with big plans.
  if (groundAt(x, y) === 'u' && cellHash(x, y, 73) < 0.055) return 'Y';
  if (groundAt(x, y) === '.' && y >= 20 && cellHash(x, y, 74) < 0.035) return 'Y';
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
  objects: [
    '#S#S#kk#S#S##',
    '#...........#',
    '#.k.......k.#',
    '#.........P.#',
    '#..tR...r...#',
    '#..o.....w..#',
    '#...........#',
    '#...........#',
    '######m######',
  ],
  triggers: [{ at: [6, 8], type: 'door', to: 'zanzibar', spawn: [23, 18], facing: 'down' }],
};
