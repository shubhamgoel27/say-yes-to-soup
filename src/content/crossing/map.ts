import type { MapData } from '../../engine/grid';

/**
 * The MV Yacana: a mid-size container ship, Callao to Japan, thirty-one days.
 * The whole chapter is her weather deck and her galley. Bow forward (north),
 * container bays lashed midships, the white house aft, la mar on every side.
 */

const W = 44;
const H = 32;

/** Hull span per row, inclusive. The bow tapers; the beam runs 14..29. */
function hullSpan(y: number): [number, number] | null {
  if (y === 2) return [20, 23];
  if (y === 3) return [19, 24];
  if (y === 4) return [18, 25];
  if (y === 5) return [17, 26];
  if (y === 6) return [16, 27];
  if (y === 7) return [15, 28];
  if (y >= 8 && y <= 29) return [14, 29];
  return null;
}

const inHull = (x: number, y: number): boolean => {
  const s = hullSpan(y);
  return !!s && x >= s[0] && x <= s[1];
};

/** Deck-edge cells: any hull cell with open water beside it wears a railing. */
const isEdge = (x: number, y: number): boolean =>
  inHull(x, y) && !(inHull(x - 1, y) && inHull(x + 1, y) && inHull(x, y - 1) && inHull(x, y + 1));

/** The house: 5x5 casa footprint, anchor bottom-left, door at [+2,+4]. */
const HOUSE: [number, number] = [19, 22];

/** Container bays: [x0, x1, y0, y1, legend char]. Uniform color per block. */
const BAYS: [number, number, number, number, string][] = [
  [16, 20, 12, 13, 'A'],
  [23, 27, 12, 13, 'B'],
  [16, 20, 16, 17, 'C'],
  [23, 27, 16, 17, 'A'],
];

function groundAt(x: number, y: number): string {
  return inHull(x, y) ? 'd' : 'S';
}

function objectAt(x: number, y: number): string {
  if (!inHull(x, y)) return ' ';
  // The jackstaff takes the bow tip's place at the rail.
  if (x === 21 && y === 2) return 'J';
  if (isEdge(x, y)) return '=';
  // The house aft, casa-pattern: anchor char, blocked cells, open door.
  const [hx, hy] = HOUSE;
  if (x >= hx && x < hx + 5 && y >= hy && y < hy + 5) {
    if (x === hx + 2 && y === hy + 4) return ' '; // the open door, a trigger
    if (x === hx && y === hy + 4) return 'H';
    return 'x';
  }
  for (const [x0, x1, y0, y1, ch] of BAYS) {
    if (x >= x0 && x <= x1 && y >= y0 && y <= y1) return ch;
  }
  if (x === 25 && y === 27) return 'F'; // the funnel
  if (x === 18 && y === 26) return 'b'; // the ship's bell by the house corner
  if (x === 26 && y === 23) return 'L'; // the lifeboat in its davits
  if ((x === 18 || x === 25) && y === 6) return 'w'; // mooring winches, foredeck
  if ((x === 16 || x === 27) && (y === 10 || y === 19)) return 'o'; // bollards
  if (x === 17 && y === 15) return 'h'; // a hammock, between the stacks
  if (x === 17 && y === 27) return 'c'; // the ship's cat, off duty
  if (x === 20 && y === 9) return 't'; // spare hatch beams, lashed
  // Life clusters where the work is: the bosun's starboard-forward corner.
  if (x === 27 && y === 7) return 'D'; // oil drums, stenciled
  if (x === 28 && y === 8) return 'R'; // fire hose on its reel
  // Joseph's port-rail war on rust, tools staged where he left them.
  if (x === 15 && y === 9) return 'p'; // paint cans and a wire brush
  if ((x === 15 && y === 13) || (x === 28 && y === 17)) return 'u'; // rust blooms
  if ((x === 17 && y === 10) || (x === 26 && y === 19)) return 'r'; // rope coils, flemished flat
  if (x === 23 && y === 4) return 'f'; // a flying fish, stranded overnight
  if (x === 24 && y === 10) return 'T'; // the tarp-covered something
  if ((x === 26 && y === 15) || (x === 15 && y === 20)) return 'P'; // port-stenciled crates
  if (x === 28 && y === 24) return 'G'; // life ring on its stand, named
  if (x === 15 && y === 27) return 'D'; // more drums, aft
  // The aft port strip, where off-watch life happens in the house's lee.
  if (x === 18 && y === 22) return 'V'; // the little deck shrine
  if (x === 16 && y === 24) return 'y'; // the laundry line
  if (x === 24 && y === 28) return 'z'; // the fishing rod, lashed to the stern rail
  if (x === 21 && y === 27) return 'm'; // the welcome mat at the watertight door
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

export const SHIP_MAP: MapData = {
  id: 'ship',
  name: 'MV Yacana',
  spawn: [15, 18],
  spawnFacing: 'right',
  triggers: [{ at: [21, 26], type: 'door', to: 'galley', spawn: [7, 8], facing: 'up' }],
  smoke: [[25, 27]],
  legend: {
    d: { t: 'deck' },
    S: { t: 'sea', solid: true },
    ' ': { t: 'void' },
    '=': { t: 'railing', solid: true },
    J: { t: 'jackstaff', solid: true, tall: true },
    H: { t: 'shiphouse', solid: true, tall: true },
    x: { t: 'blocked', solid: true, tall: true },
    A: { t: 'contA', solid: true, tall: true },
    B: { t: 'contB', solid: true, tall: true },
    C: { t: 'contC', solid: true, tall: true },
    F: { t: 'funnel', solid: true, tall: true },
    b: { t: 'shipbell', solid: true, tall: true },
    L: { t: 'lifeboat', solid: true, tall: true },
    w: { t: 'winch', solid: true },
    o: { t: 'bollard', solid: true },
    h: { t: 'hammock', solid: true, tall: true },
    c: { t: 'shipcat', solid: true },
    t: { t: 'crate', solid: true },
    D: { t: 'oildrum', solid: true },
    R: { t: 'hosereel', solid: true },
    p: { t: 'paintcans', solid: true },
    u: { t: 'rustpatch' },
    r: { t: 'ropecoil' },
    f: { t: 'flyingfish' },
    T: { t: 'tarpthing', solid: true },
    P: { t: 'portcrate', solid: true, tall: true },
    G: { t: 'lifering', solid: true, tall: true },
    V: { t: 'deckshrine', solid: true, tall: true },
    y: { t: 'laundry', solid: true, tall: true },
    z: { t: 'sternrod', solid: true, tall: true },
    m: { t: 'mat' },
  },
  ground,
  objects,
};

/** The galley and mess: one long table, the stove, the karaoke machine. */
export const GALLEY_MAP: MapData = {
  id: 'galley',
  name: 'The Galley',
  spawn: [7, 8],
  spawnFacing: 'up',
  legend: {
    '.': { t: 'floorSteel' },
    '#': { t: 'wallSteel', solid: true, tall: true },
    S: { t: 'shelf', solid: true, tall: true },
    q: { t: 'stove', solid: true },
    p: { t: 'pot', solid: true },
    T: { t: 'table', solid: true },
    s: { t: 'stool', solid: true },
    K: { t: 'karaoke', solid: true, tall: true },
    t: { t: 'trayrack', solid: true },
    m: { t: 'mat' },
    M: { t: 'menuboard', solid: true, tall: true },
    D: { t: 'dartboard', solid: true, tall: true },
    G: { t: 'chessset', solid: true },
    P: { t: 'galleyplant', solid: true, tall: true },
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
    '##SMS#S##S#D##',
    '#q p p      K#',
    '#            #',
    '#  sTTTTTGs  #',
    '#            #',
    '#  sTTTTTTs  #',
    '#            #',
    '# t         P#',
    '#            #',
    '#######m######',
  ],
  triggers: [{ at: [7, 9], type: 'door', to: 'ship', spawn: [21, 27], facing: 'down' }],
};
