import type { MapData } from '../../engine/grid';
import { cellHash } from '../../art/pix';

/**
 * Kaithappuram: a fictional spit of land between paddy and lagoon in the
 * Vembanad backwaters, half a day by boat from Kochi. The water channel is
 * the street; the vallam is the bicycle. Edavappathi, the monsoon onset:
 * the air is a held breath, and the whole village knows what comes next.
 *
 * So the water is never far from the eye: the main channel runs along the
 * south with a bank that wanders, a retting creek pushes up into the land
 * behind the toddy shed, and the coir yard keeps its own soaking pool. The
 * paddy is a shape a field surveyor argued about, not a rectangle.
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

/**
 * The bank, which is a curve, because a lagoon has never once agreed to be
 * a straight line. Everything below it is channel.
 */
const bankY = (x: number) =>
  Math.round(25.9 + 1.3 * Math.sin(x * 0.19 + 0.6) + 1.0 * Math.sin(x * 0.47 + 2.9) + 0.6 * Math.sin(x * 0.83 + 0.2));

/**
 * The retting creek: the channel reaches inland behind the toddy shed, so
 * husks can soak where nobody has to smell them at dinner.
 */
function inCreek(x: number, y: number): boolean {
  if (y < 19) return false;
  const c = 31.4 + Math.sin(y * 0.42 + 0.6) * 1.2;
  const half = y > 22 ? 1.2 : 0.7;
  return Math.abs(x - c) <= half;
}

/** The coir yard's soaking pool, up at the north-west corner. */
const inRettingPool = (x: number, y: number) =>
  (x - 3.2) * (x - 3.2) + (y - 9.6) * (y - 9.6) * 2.1 <= 3.4;

/** The pokkali plot: a shape argued over by three generations of surveyors. */
function inPaddy(x: number, y: number): boolean {
  if (y < 15 || y > 23) return false;
  const left = 2.2 + 1.0 * Math.sin(y * 0.55 + 0.3);
  const right = 8.7 + 1.4 * Math.sin(y * 0.38 + 2.4);
  return x >= left && x <= right;
}

/** The second plot, the one the co-operative flooded last, east of the lane. */
function inPaddy2(x: number, y: number): boolean {
  if (y < 17 || y > 21) return false;
  const left = 13.4 + 0.9 * Math.sin(y * 0.61 + 1.7);
  const right = 18.4 + 1.1 * Math.sin(y * 0.44 + 0.2);
  return x >= left && x <= right;
}

const anyPaddy = (x: number, y: number) => inPaddy(x, y) || inPaddy2(x, y);

/** The bund: the walked earth ridge that holds each plot's water in. */
function onBund(x: number, y: number): boolean {
  if (anyPaddy(x, y)) return false;
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (anyPaddy(x + dx, y + dy)) return true;
    }
  }
  return false;
}

/** Laterite lanes: the red spine, wandering, and the ribs it throws off. */
function onSpine(x: number, y: number): boolean {
  const c = 11.9 + Math.sin(x * 0.24 + 0.5) * 0.6 + Math.sin(x * 0.09 + 1.9) * 0.45;
  const half = 0.75 + 0.35 * Math.sin(x * 0.21 + 1.2);
  return x >= 1 && x <= 44 && Math.abs(y - c) <= half;
}

function onJettyLane(x: number, y: number): boolean {
  const c = 22.2 + Math.sin(y * 0.33 + 2.0) * 0.9;
  return y >= 12 && y <= 24 && Math.abs(x - c) <= 0.85;
}

/** The rib that runs diagonally down to the toddy shed and the creek. */
function onShedPath(x: number, y: number): boolean {
  if (y < 13 || y > 23) return false;
  const c = 30.5 + (y - 13) * 0.75;
  return Math.abs(x - c) <= 0.8;
}

/** Bathing steps cut into the bank: the kadavu, where the village meets water. */
const KADAVU = new Set(
  [[18, 24], [19, 24], [18, 25], [19, 25], [19, 26], [38, 27], [39, 27], [39, 28]].map(([x, y]) => `${x},${y}`),
);

const inCoirYard = (x: number, y: number) => x >= 4 && x <= 9 && y >= 8 && y <= 11;

function groundAt(x: number, y: number): string {
  if (inJetty(x, y)) return 'k';
  // The kadavu first: laterite steps deliberately built out into the water.
  if (KADAVU.has(`${x},${y}`)) return '-';
  if (inRettingPool(x, y)) return 'w';
  if (y >= bankY(x) || inCreek(x, y)) return 'w';
  if (y >= bankY(x) - 1) return 'd';
  if (anyPaddy(x, y)) return 'p';
  if (onBund(x, y)) return 'd';
  if (onSpine(x, y) || onJettyLane(x, y) || onShedPath(x, y)) return '-';
  if (x === 14 && y === 11) return '-';
  if (x === 28 && y >= 10 && y <= 11) return '-';
  if (x === 36 && y >= 10 && y <= 11) return '-';
  if (inCoirYard(x, y)) return 'd';
  return '.';
}

/**
 * Palms grow in knots, leaning off each other, because that is how a nut
 * falls and where the light is. Never at intervals.
 */
const PALMS = new Set(
  [
    // the roadside grove at the top of the map
    [2, 4], [3, 3], [5, 4],
    [10, 3], [11, 2],
    [18, 4], [19, 3], [21, 4], [20, 2],
    [30, 3], [31, 2], [33, 4],
    [40, 3], [41, 2], [44, 6], [43, 8],
    // the ones leaning out over the channel, which is most of them
    [12, 23], [13, 22], [14, 22],
    [25, 22], [26, 24],
    [34, 22], [35, 23], [37, 22],
    [42, 22], [43, 23], [44, 21],
    // inland knots, in the space between houses
    [25, 15], [26, 16], [24, 16],
    [10, 13], [11, 16],
    [33, 13], [32, 14],
    [43, 15], [42, 16],
  ].map(([x, y]) => `${x},${y}`),
);

/** Toddy palms: notched, roped, and wearing a pot at the crown. */
const KALLUPALMS = new Set([[35, 20], [36, 15], [39, 21], [41, 19]].map(([x, y]) => `${x},${y}`));

const BANANAS = new Set(
  [[11, 11], [10, 10], [17, 10], [33, 11], [42, 9], [31, 15], [2, 13], [3, 14], [30, 17], [29, 18]].map(
    ([x, y]) => `${x},${y}`,
  ),
);

/** Straw stacks: the pokkali stubble, saved before the rain finds it. */
const VAIKKOL = new Set([[16, 14], [17, 15], [8, 5], [27, 20], [28, 19], [24, 20]].map(([x, y]) => `${x},${y}`));

/** The love pass: small true things, clustered where life gathers. */
const DECOR: Record<string, string> = {
  '13,11': 'N', // the nilavilakku, flanking Mariamma's door
  '15,11': 'U', // umbrellas open to dry on the veranda, like bats
  '16,11': 'U',
  '17,7': 'J', // the jackfruit tree, admired from a sensible radius
  '42,13': 'e', // pepper vine on an areca, among Kuttan's palms
  '17,13': 'G', // the chaya-glass rack, Shaji's regiment
  '23,9': 'W', // chalked cricket stumps beside the murals
  '23,11': 't', // the lost tennis ball, in the gutter by the lane
  '19,22': 'o', // oars leaning by the kadavu
  '16,24': 'j', // brass pots waiting their turn at the steps
  '20,23': 'h',
  '26,24': 'S', // spice sacks under tarp, by the jetty office
  '26,25': 'S',
  '21,21': 'B', // the post box on its pole
  '11,14': 'l', // the lungi line, between coir yard and paddy
  '12,14': 'l',
  '4,12': 'h', // husk piles bound for the retting canal
  '5,12': 'h',
  '3,11': 'h',
  '29,20': 'h', // and the ones already stacked at the creek
  '25,18': 'h',
  '26,19': 'l', // a lungi line between the two straw stacks
  '27,17': 'n', // the bench under the palms, facing the water like everything
  '34,21': 'h',
  '34,16': 'a', // the anthill nobody disturbs
  '43,11': 's', // the bus shelter, one bench, forty timetable opinions
  '35,17': 'r', // the temple festival poster, peeling
  '19,5': 'f', // fallen coconuts, claimed by nobody for now
  '40,5': 'f',
  '20,20': 'f',
  '25,14': 'f',
  '9,4': 'f',
};

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
  // Chappals on the step below the one door that opens. They sit outside the
  // footprint on purpose: anything drawn on the door cell itself is covered
  // by the house sprite, which is why the open door had no cue at all.
  for (const [hx, hy] of VEEDUS) {
    if (OPEN_DOORS.has(`${hx},${hy}`) && x === hx + 2 && y === hy + 5) return 'O';
  }

  const key = `${x},${y}`;
  const ground = groundAt(x, y);
  if (ground === 'w') {
    // Reeds fringe wherever the bank has just given up, in ragged handfuls,
    // and never on the strip of earth people walk.
    if ((y <= bankY(x) + 1 || inCreek(x, y)) && cellHash(x, y, 70) < 0.34) return 'R';
    if (x === 33 && y === 27) return 'V'; // the kettuvallam, moored at the bank
    if (x === 20 && y === 26) return 'V';
    // Vallams out on the channel: the street has traffic on it.
    if ((x === 15 && y === 29) || (x === 35 && y === 30) || (x === 8 && y === 28)) return 'v';
    // The cheena vala stands out in the channel itself, net toward the far
    // bank: the one thing on this map you can see from anywhere on it.
    if (x === 29 && y === 28) return 'F';
    // Weed drifts in the slack water, so the channel is never a flat sheet.
    if (cellHash(x, y, 68) < 0.05) return cellHash(x, y, 69) < 0.6 ? 'y' : 'Y';
    return ' ';
  }
  if (PALMS.has(key)) return 'P';
  if (KALLUPALMS.has(key)) return 'T';
  if (BANANAS.has(key)) return 'b';
  if (VAIKKOL.has(key)) return 'A';
  const dec = DECOR[key];
  if (dec) return dec;
  // The village's furniture, clustered around the two places people stand.
  if (x === 18 && y === 13) return 'K'; // Shaji's thattukada
  if (x === 15 && y === 13) return 'n'; // the chaya bench
  if (x === 20 && y === 14) return 'n';
  if ((x === 24 || x === 25) && y === 9) return 'M'; // the mural wall
  if (x === 30 && y === 11) return 'L'; // the reading room lamp
  if (x === 21 && y === 23) return 'L'; // the jetty lamp
  if (x === 25 && y === 25) return 'g'; // the jetty office counter
  if (x === 36 && y === 21) return 'q'; // the toddy shed sign
  if ((x === 36 && y === 22) || (x === 38 && y === 20) || (x === 37 && y === 21)) return 'j'; // kallu pots
  if ((x === 4 || x === 5 || x === 8) && y === 8) return 'c'; // coir rope racks
  if (x === 7 && y === 9) return 'c';
  // Vallams, nosed into the bank at whatever angle they were left.
  if (x === 17 && y === 24) return 'v';
  if (x === 15 && y === 24) return 'v';
  if (x === 34 && y === 24) return 'v';
  if (x === 12 && y === 25) return 'v';
  // Sparse life on open grass, deterministic so it never shifts.
  if (ground === '.') {
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
    // The one door that opens says so, in chappals.
    O: { t: 'chappals' },
    P: { t: 'palm', solid: true, tall: true },
    T: { t: 'kallupalm', solid: true, tall: true },
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
    N: { t: 'nilavilakku', solid: true, tall: true },
    U: { t: 'umbrellas', solid: true },
    J: { t: 'jacktree', solid: true, tall: true },
    e: { t: 'peppervine', solid: true, tall: true },
    G: { t: 'glassrack', solid: true },
    W: { t: 'cricketwall', solid: true, tall: true },
    t: { t: 'tennisball' },
    o: { t: 'oars', solid: true, tall: true },
    S: { t: 'spicesacks', solid: true, tall: true },
    B: { t: 'postbox', solid: true, tall: true },
    l: { t: 'lungiline', solid: true, tall: true },
    h: { t: 'huskpile' },
    y: { t: 'hyacinth' },
    Y: { t: 'waterlily' },
    a: { t: 'anthill', solid: true },
    s: { t: 'busstop', solid: true, tall: true },
    r: { t: 'posterwall', solid: true, tall: true },
    f: { t: 'fallennut' },
    A: { t: 'vaikkol', solid: true, tall: true },
    R: { t: 'reeds', solid: true },
    F: { t: 'cheenavala', solid: true, tall: true },
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
    g: { t: 'ammi', solid: true },
    l: { t: 'leafstack', solid: true },
    c: { t: 'keralacat', solid: true },
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
    '###S#SS##S####',
    '#a  p       g#',
    '#pp        l #',
    '#  sTTT      #',
    '#     Ts     #',
    '#  mmm       #',
    '#      mm  c #',
    '#   r        #',
    '#         p  #',
    '#######m######',
  ],
  triggers: [{ at: [7, 9], type: 'door', to: 'kerala', spawn: [14, 11], facing: 'down' }],
};
