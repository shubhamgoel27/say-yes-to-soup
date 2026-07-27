import type { MapData } from '../../engine/grid';
import { cellHash } from '../../art/pix';

/**
 * La Caleta: a fictional fishing village on the Peruvian north coast, in the
 * Huanchaco tradition. Desert dunes behind, a cold rich sea in front, and a
 * pier from the old sugar days walking out into it. Green happens exactly
 * twice: the totora ponds, and nowhere else.
 */

const W = 48;
const H = 34;

/** Casa anchors: 5x5 footprint, door at [+2,+4], same grid as the highlands. */
const CASAS: [number, number][] = [
  [10, 5],
  [17, 5],
  [26, 5],
  [33, 5],
  [2, 14],
  [16, 14], // the picantería
  [30, 14], // the harbor office
];

/** Doors that open: the picantería. The rest are lives, latched. */
const OPEN_DOORS = new Set(['16,14']);

const inPier = (x: number, y: number) => (x === 22 || x === 23) && y >= 22 && y <= 30;

/**
 * The love layer: hand-placed working clutter, clustered the way life
 * clusters (doors, corners, the pier root, the water line). Keys are "x,y".
 */
const PROPS: Record<string, string> = {
  // Upper village: the road in, and the pond edge where totora dries.
  '5,11': 'X', // the mototaxi, parked at its owner's angle
  '36,1': 'G', // gallinazos on the dune ridge, supervising
  '39,5': 'T', // totora bundles drying by the ponds
  '40,10': 'T',
  // The picanteria's orbit: chairs, shells, buoys, the cat.
  '15,18': 'b', // buoys on the seaward wall
  '14,19': 'W', // the shell wheelbarrow
  '20,19': 'H', // stacked plastic chairs
  '17,19': 'z', // the cat, where the fish smell is best
  '5,19': 'm', // the school kids' mural of la mar
  // Marisol's stall and the harbor office: fish work.
  '29,20': 'Y', // salted lisa on racks
  '33,20': 'Y',
  '38,20': 'Q', // Don Wili's spare bottle crate
  // The pier root and the beach: gear at rest.
  '26,23': 't', // crab traps by the fish crates
  '21,24': 'E', // the pelican's post
  '31,24': 'G', // more gallinazos, nearer the racks
  '11,27': 'p', // nets drying on poles, west beach
  '40,24': 'p', // and east
  '7,25': 'F', // the driftwood bench, facing the water
  '17,28': 'J', // one stranded jellyfish, tide's own still life
};

const isBeach = (x: number, y: number) => y >= 26 && y <= 28 && !inPier(x, y);

function groundAt(x: number, y: number): string {
  if (inPier(x, y) && y >= 24) return 'k';
  if (y >= 29) return 'S';
  if (y === 28) return 'u';
  if (y >= 24) return 's';
  // The malecón: a paved promenade above the beach.
  if ((y === 22 || y === 23) && x >= 6 && x <= 41) return 'P';
  // The totora ponds at the desert's edge.
  if (x >= 41 && x <= 45 && y >= 5 && y <= 8) return 'w';
  if (x >= 40 && x <= 46 && y >= 4 && y <= 9) return '.';
  if (x >= 39 && x <= 46 && y >= 3 && y <= 10) return 'd';
  // Streets: hard-packed sand. The road in from La Bajada arrives three tiles
  // wide, the way the pass above it does, and narrows once it is in the village.
  if (x >= 7 && x <= 9 && y >= 1 && y <= 3) return '-';
  if (x === 8 && y >= 1 && y <= 21) return '-';
  if (y === 12 && x >= 2 && x <= 45) return '-';
  if (x === 24 && y >= 13 && y <= 21) return '-';
  for (const dx of [12, 19, 28, 35]) {
    if (x === dx && y >= 10 && y <= 11) return '-';
  }
  for (const dx of [4, 18, 32]) {
    if (x === dx && y >= 19 && y <= 21) return '-';
  }
  return 's';
}

function objectAt(x: number, y: number): string {
  // The dune ridge; the road from La Bajada parts it, three tiles wide.
  if (y === 0 || (x === 0 && y < 24) || (x === W - 1 && y < 24)) {
    if (x >= 7 && x <= 9 && y === 0) return ' ';
    return 'o';
  }
  // Rocky groins where the beach meets the map edge.
  if ((x === 0 || x === W - 1) && y >= 24 && y <= 28) return 'r';
  for (const [hx, hy] of CASAS) {
    if (x >= hx && x < hx + 5 && y >= hy && y < hy + 5) {
      if (x === hx + 2 && y === hy + 4) return OPEN_DOORS.has(`${hx},${hy}`) ? ' ' : 'D';
      if (x === hx && y === hy + 4) return 'C';
      return 'x';
    }
  }
  // The malecón owns its furniture.
  if ((x === 10 || x === 20 || x === 40) && y === 21) return 'L';
  if ((x === 13 || x === 34) && y === 21) return 'n';
  if (x === 27 && y === 21) return 'M'; // Marisol's fish stall
  if (x === 37 && y === 21) return 'e'; // the emoliente cart
  if (x === 9 && y === 21) return 'g'; // the village sign
  if (x === 31 && y === 19) return 'h'; // the harbor office counter
  if (x === 23 && y === 30) return 'j'; // the sign at the end of the pier
  if (x === 25 && y === 23) return 'K'; // fish crates by the pier root
  // Caballitos stood on their tails to drain, a fence of horses.
  if ((x === 10 || x === 12 || x === 14 || x === 16) && y === 25) return 'c';
  if ((x === 30 && y === 26) || (x === 35 && y === 25)) return 'B';
  if ((x === 28 && y === 24) || (x === 18 && y === 26)) return 'N';
  if ((x === 26 && y === 27) || (x === 38 && y === 27) || (x === 37 && y === 28)) return 'A';
  // Reeds around the ponds. The eastern clumps stand out in the shallows,
  // which leaves the strip of bank under the ridge walkable end to end.
  if ((x === 40 || x === 45) && (y === 5 || y === 7)) return 'R';
  if ((x === 42 && y === 4) || (x === 44 && y === 9) || (x === 41 && y === 9)) return 'R';
  const prop = PROPS[`${x},${y}`];
  if (prop) return prop;
  // Tide wrack along the water line, deterministic like all scatter.
  if (isBeach(x, y)) {
    const gr = groundAt(x, y);
    if ((gr === 's' || gr === 'u') && cellHash(x, y, 71) < 0.09) return 'y';
  }
  // Sparse dry life on open sand, deterministic so it never shifts.
  if (groundAt(x, y) === 's' && y < 22) {
    const h = cellHash(x, y, 63);
    if (h < 0.05) return 'i';
    if (h > 0.995) return 'r';
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

export const LA_CALETA_MAP: MapData = {
  id: 'la-caleta',
  name: 'La Caleta',
  spawn: [8, 1],
  spawnFacing: 'down',
  triggers: [
    // The whole mouth of the road carries you back up, lane for lane.
    { at: [7, 0], type: 'door', to: 'la-bajada', spawn: [19, 15], facing: 'left' },
    { at: [8, 0], type: 'door', to: 'la-bajada', spawn: [19, 16], facing: 'left' },
    { at: [9, 0], type: 'door', to: 'la-bajada', spawn: [19, 17], facing: 'left' },
    { at: [18, 18], type: 'door', to: 'picanteria', spawn: [7, 8], facing: 'up' },
  ],
  legend: {
    s: { t: 'sand' },
    u: { t: 'sandWet' },
    d: { t: 'dirt' },
    '.': { t: 'grass' },
    '-': { t: 'path' },
    P: { t: 'plaza' },
    k: { t: 'pierdeck' },
    w: { t: 'water', solid: true },
    S: { t: 'sea', solid: true },
    ' ': { t: 'void' },
    o: { t: 'wallStone', solid: true, tall: true },
    C: { t: 'casa', solid: true, tall: true },
    x: { t: 'blocked', solid: true, tall: true },
    D: { t: 'doorShut', solid: true, tall: true },
    M: { t: 'stall', solid: true, tall: true },
    L: { t: 'farol', solid: true, tall: true },
    g: { t: 'signpost', solid: true, tall: true },
    h: { t: 'harborsign', solid: true, tall: true },
    j: { t: 'piersign', solid: true, tall: true },
    e: { t: 'emoliente', solid: true, tall: true },
    c: { t: 'caballito', solid: true, tall: true },
    B: { t: 'boat', solid: true, tall: true },
    n: { t: 'bench', solid: true },
    N: { t: 'net', solid: true },
    K: { t: 'crate', solid: true },
    A: { t: 'pelican', solid: true },
    R: { t: 'reeds', solid: true },
    r: { t: 'rock', solid: true },
    i: { t: 'tuft' },
    // The love layer's kinds.
    X: { t: 'mototaxi', solid: true, tall: true },
    G: { t: 'gallinazos', solid: true, tall: true },
    T: { t: 'dryreeds', solid: true, tall: true },
    Y: { t: 'saltrack', solid: true, tall: true },
    p: { t: 'netpoles', solid: true, tall: true },
    t: { t: 'crabtraps', solid: true, tall: true },
    b: { t: 'buoywall', solid: true, tall: true },
    m: { t: 'kidmural', solid: true, tall: true },
    E: { t: 'pelicanpost', solid: true, tall: true },
    H: { t: 'picchairs', solid: true, tall: true },
    W: { t: 'shellbarrow', solid: true },
    Q: { t: 'emolcrate', solid: true },
    F: { t: 'driftbench', solid: true },
    z: { t: 'gato', solid: true },
    J: { t: 'jellyfish' },
    y: { t: 'seaweed' },
  },
  ground,
  objects,
};

/** Doña Petro's picantería: enter past the pots; one long table; no menu. */
export const PICANTERIA_MAP: MapData = {
  id: 'picanteria',
  name: 'La Picantería',
  spawn: [7, 8],
  spawnFacing: 'up',
  legend: {
    '.': { t: 'floorEarth' },
    '#': { t: 'wallInt', solid: true, tall: true },
    S: { t: 'shelf', solid: true, tall: true },
    q: { t: 'qoncha', solid: true },
    T: { t: 'table', solid: true },
    s: { t: 'stool', solid: true },
    p: { t: 'pot', solid: true },
    r: { t: 'rug' },
    m: { t: 'mat' },
    l: { t: 'limebasket', solid: true },
    Z: { t: 'pizarra', solid: true, tall: true },
    a: { t: 'laradio', solid: true },
    z: { t: 'gato', solid: true },
    ' ': { t: 'void' },
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
    '##S#S####S####',
    '#q p pl   Z  #',
    '#            #',
    '#  sTTTTTTs  #',
    '#            #', // the aisle between the tables, where the plates go
    '#  sTTTTTTs  #',
    '#            #',
    '#  zr        #',
    '#           a#',
    '#######m######',
  ],
  triggers: [{ at: [7, 9], type: 'door', to: 'la-caleta', spawn: [18, 19], facing: 'down' }],
};
