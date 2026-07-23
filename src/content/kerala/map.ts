import type { MapData } from '../../engine/grid';
import { cellHash } from '../../art/pix';

/**
 * Kaithappuram: a fictional spit of land between paddy and lagoon in the
 * Vembanad backwaters, half a day by boat from Kochi. The water channel is
 * the street; the vallam is the bicycle. Edavappathi, the monsoon onset:
 * the air is a held breath, and the whole village knows what comes next.
 */

const W = 46;
const H = 32;

/** Veedu anchors: 5x5 footprint, casa grid, door at [+2,+4]. */
const VEEDUS: [number, number][] = [
  [12, 6], // Mariamma's house
  [26, 5], // the reading room
  [34, 5], // the Gulf house
  [37, 17], // the toddy shed, at a discreet distance
];

/** Doors that open: Mariamma's. Delivering the letter is the key to the rest. */
const OPEN_DOORS = new Set(['12,6']);

const inJetty = (x: number, y: number) => (x === 22 || x === 23) && y >= 24 && y <= 29;
const inPaddy = (x: number, y: number) => x >= 2 && x <= 9 && y >= 15 && y <= 23;
const inBund = (x: number, y: number) => x >= 1 && x <= 10 && y >= 14 && y <= 24;
const inCoirYard = (x: number, y: number) => x >= 4 && x <= 9 && y >= 8 && y <= 11;

function groundAt(x: number, y: number): string {
  if (inJetty(x, y)) return 'k';
  if (y >= 26) return 'w';
  if (y === 25) return 'd';
  if (inPaddy(x, y)) return 'p';
  if (inBund(x, y)) return 'd';
  // Laterite lanes: the red spine and its ribs.
  if (y === 12 && x >= 2 && x <= 43) return '-';
  if (x === 22 && y >= 13 && y <= 23) return '-';
  if (x === 14 && y === 11) return '-';
  if (x === 28 && y >= 10 && y <= 11) return '-';
  if (x === 36 && y >= 10 && y <= 11) return '-';
  if (x === 39 && y >= 22 && y <= 23) return '-';
  if (inCoirYard(x, y)) return 'd';
  return '.';
}

const PALMS = new Set(
  [
    [2, 4], [10, 3], [19, 4], [24, 3], [32, 3], [40, 4], [44, 7],
    [3, 13], [11, 17], [11, 22], [19, 20], [26, 17], [33, 14], [43, 13],
    [35, 15], [43, 16], [14, 23], [27, 23], [33, 23], [41, 23], [44, 22],
  ].map(([x, y]) => `${x},${y}`),
);

const BANANAS = new Set(
  [[11, 11], [17, 10], [33, 11], [42, 8], [31, 15], [2, 13]].map(([x, y]) => `${x},${y}`),
);

function objectAt(x: number, y: number): string {
  // Pandanus hedge seals the land edges; the water seals the south.
  if (y === 0) return 'H';
  if ((x === 0 || x === W - 1) && y <= 25) return 'H';
  for (const [hx, hy] of VEEDUS) {
    if (x >= hx && x < hx + 5 && y >= hy && y < hy + 5) {
      if (x === hx + 2 && y === hy + 4) return OPEN_DOORS.has(`${hx},${hy}`) ? ' ' : 'D';
      if (x === hx && y === hy + 4) return 'C';
      return 'x';
    }
  }
  const key = `${x},${y}`;
  if (PALMS.has(key)) return 'P';
  if (BANANAS.has(key)) return 'b';
  // The village's furniture.
  if (x === 18 && y === 13) return 'K'; // Shaji's thattukada
  if (x === 15 && y === 13) return 'n'; // the chaya bench
  if ((x === 24 || x === 25) && y === 9) return 'M'; // the mural wall
  if (x === 30 && y === 11) return 'L'; // the reading room lamp
  if (x === 21 && y === 23) return 'L'; // the jetty lamp
  if (x === 25 && y === 24) return 'g'; // the jetty office counter
  if (x === 36 && y === 21) return 'q'; // the toddy shed sign
  if ((x === 36 && y === 22) || (x === 42 && y === 20)) return 'j'; // kallu pots
  if ((x === 4 || x === 6 || x === 8) && y === 8) return 'c'; // coir rope racks
  if ((x === 17 || x === 29) && y === 24) return 'v'; // vallams hauled out
  if (x === 12 && y === 25) return 'v';
  if (x === 33 && y === 26) return 'V'; // the kettuvallam, moored at the bank
  // Sparse life on open grass, deterministic so it never shifts.
  if (groundAt(x, y) === '.') {
    const h = cellHash(x, y, 66);
    if (h < 0.045) return 'i';
  }
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

export const KERALA_MAP: MapData = {
  id: 'kerala',
  name: 'Kaithappuram',
  spawn: [22, 28],
  spawnFacing: 'up',
  triggers: [{ at: [14, 10], type: 'door', to: 'mariamma-veedu', spawn: [7, 8], facing: 'up' }],
  legend: {
    '.': { t: 'grass' },
    '-': { t: 'laterite' },
    d: { t: 'dirt' },
    p: { t: 'paddy', solid: true },
    w: { t: 'water', solid: true },
    k: { t: 'pierdeck' },
    H: { t: 'shrub', solid: true, tall: true },
    C: { t: 'veedu', solid: true, tall: true },
    x: { t: 'blocked', solid: true, tall: true },
    D: { t: 'doorShut', solid: true, tall: true },
    P: { t: 'palm', solid: true, tall: true },
    b: { t: 'banana', solid: true, tall: true },
    v: { t: 'vallam', solid: true, tall: true },
    V: { t: 'kettuvallam', solid: true, tall: true },
    c: { t: 'coirrack', solid: true, tall: true },
    K: { t: 'thattukada', solid: true, tall: true },
    M: { t: 'muralwall', solid: true, tall: true },
    g: { t: 'postsign', solid: true, tall: true },
    q: { t: 'shaapsign', solid: true, tall: true },
    L: { t: 'farol', solid: true, tall: true },
    n: { t: 'bench', solid: true },
    j: { t: 'pot', solid: true },
    i: { t: 'tuft' },
  },
  ground,
  objects,
};

/** Mariamma's kitchen: the hearth, the smoke-dark shelves, the long low room
 * where the sadya happens. You enter and are family; there is no other mode. */
export const MARIAMMA_VEEDU_MAP: MapData = {
  id: 'mariamma-veedu',
  name: "Mariamma's Kitchen",
  spawn: [7, 8],
  spawnFacing: 'up',
  legend: {
    '.': { t: 'floorEarth' },
    '#': { t: 'wallInt', solid: true, tall: true },
    S: { t: 'shelf', solid: true, tall: true },
    a: { t: 'aduppu', solid: true },
    T: { t: 'table', solid: true },
    s: { t: 'stool', solid: true },
    p: { t: 'pot', solid: true },
    m: { t: 'mat' },
    r: { t: 'rug' },
  },
  ground: [
    '..............',
    '..............',
    '..............',
    '..............',
    '..............',
    '..............',
    '..............',
    '..............',
    '..............',
    '..............',
  ],
  objects: [
    '###S#S####S###',
    '#a p p       #',
    '#            #',
    '#  sTTTTs    #',
    '#            #',
    '#   mmmm     #',
    '#            #',
    '#     r      #',
    '#            #',
    '#######m######',
  ],
  triggers: [{ at: [7, 9], type: 'door', to: 'kerala', spawn: [14, 11], facing: 'down' }],
};
