import type { MapData } from '../../engine/grid';
import { cellHash } from '../../art/pix';

/**
 * Shionoura: a small fishing town on the Seto Inland Sea, early July.
 * A forested hill at the back, the Ebisu shrine up a flight of stone steps,
 * one shotengai of machiya shopfronts, and a harbor where the ferry
 * timetable structures everything. Cicadas own the trees.
 */

const W = 46;
const H = 32;

/** Machiya anchors: 5x5 footprint, door at [+2,+4], casa-compatible grid. */
const MACHIYA: [number, number][] = [
  [3, 5], // Daisuke's fish shop (he works the quay stall)
  [10, 5], // Sachiko's sweet shop, Kadoya
  [17, 5], // the tofu shop
  [24, 5], // the shuttered storefront
  [3, 13],
  [10, 13],
  [24, 13], // Fumi's minshuku, the Shiosai
  [33, 17], // the ferry office
];

/** Doors that open: only the minshuku (its door cell wears the noren). */
const OPEN_DOORS = new Set(['24,13']);

const inPier = (x: number, y: number) => (x === 21 || x === 22) && y >= 24 && y <= 30;

function groundAt(x: number, y: number): string {
  if (inPier(x, y)) return 'k';
  if (y >= 28) return 'S';
  if (y === 27) return 'u';
  if (y >= 24) return 's';
  // The quay: fitted stone from the old herring years.
  if ((y === 22 || y === 23) && x >= 6 && x <= 38) return 'P';
  if (y === 22 || y === 23) return 's';
  // The shotengai, half a town long.
  if ((y === 10 || y === 11) && x >= 2 && x <= 31) return 'P';
  // The shrine plateau and its stone steps.
  if (y >= 1 && y <= 4 && x >= 31 && x <= 44) return 'd';
  if (x === 36 && y >= 5 && y <= 9) return '-';
  // Lanes: shotengai down to the quay, and the minshuku's own path.
  if ((x === 16 || x === 17) && y >= 12 && y <= 21) return '-';
  if (x === 26 && y >= 18 && y <= 21) return '-';
  return 'g';
}

function objectAt(x: number, y: number): string {
  // Forested hill at the back; the sea needs no fence.
  if (y === 0) return 'F';
  if (x === 0 || x === W - 1) {
    if (y >= 24 && y <= 27) return 'r';
    if (y < 24) return 'F';
  }
  // Dense cedar band above the shop row.
  if ((y === 1 || y === 2) && x >= 1 && x <= 30) return 'F';
  // The shrine hill's wooded slope; only the steps pass through.
  if (y >= 5 && y <= 8 && x >= 31 && x <= 44 && x !== 36) return 'F';
  // The torii stands over the steps; you walk under it.
  if (x === 36 && y === 7) return 'T';
  // Moss owns the step edges; feet keep only the middle bare.
  if (x === 36 && (y === 8 || y === 9)) return 'm';
  // Shrine yard: the Ebisu hall, stone lanterns, bamboo, the ema rack.
  if (x === 37 && y === 1) return 'E';
  if ((x === 35 || x === 39) && y === 2) return 'I';
  if (x === 33 && y === 2) return 'a';
  if (x === 33 && y === 3) return 'B';
  if (x === 41 && y === 3) return 'b';
  // The Jizo at the foot of the steps, in his knitted red bib.
  if (x === 37 && y === 9) return 'j';
  for (const [hx, hy] of MACHIYA) {
    if (x >= hx && x < hx + 5 && y >= hy && y < hy + 5) {
      if (x === hx + 2 && y === hy + 4) return OPEN_DOORS.has(`${hx},${hy}`) ? 'N' : 'D';
      if (x === hx && y === hy + 4) return 'C';
      return 'x';
    }
  }
  // Tanabata bamboo between the shopfronts, already dressed in wishes.
  if ((x === 8 || x === 15 || x === 22) && y === 9) return 'B';
  if (x === 29 && y === 9) return 'b';
  if (x === 34 && y === 9) return 'B';
  // Shotengai furniture.
  if (x === 12 && y === 11) return 'L'; // Sachiko's omiyage counter
  if ((x === 2 || x === 30) && y === 11) return 'n';
  if ((x === 4 || x === 13 || x === 27) && y === 12) return 'c';
  // Life gathers at the shop doors: a bike, crates, flowers at a shut door.
  if (x === 10 && y === 10) return 'y'; // the granny bike outside Kadoya
  if (x === 14 && y === 10) return 'M'; // Setoda crates on summer duty
  if (x === 27 && y === 10) return 'q'; // still watered, though the shop sleeps
  if (x === 29 && y === 11) return '3'; // the bench's afternoon shift
  if (x === 31 && y === 12) return 'V'; // the vending machine on the corner
  // The minshuku's dooryard: wind chime, planter, hydrangeas, laundry.
  if (x === 24 && y === 18) return 'z';
  if (x === 27 && y === 18) return 'q';
  if (x === 28 && y === 19) return 'H';
  if (x === 15 && y === 13) return 'H';
  if (x === 30 && y === 16) return 'l';
  // The quay.
  if (x === 7 && y === 22) return 'f';
  if (x === 9 && y === 22) return 'o'; // glass floats, retired with honors
  if (x === 14 && y === 22) return 'L'; // Daisuke's morning stall
  if (x === 15 && y === 22) return 'h';
  if (x === 16 && y === 22) return '2'; // Kacho, the section chief
  if (x === 18 && y === 22) return 'G'; // the town sign
  if (x === 20 && y === 22) return '1'; // the quay supervisor, loafed
  if ((x === 25 || x === 29) && y === 22) return 'c';
  if (x === 27 && y === 22) return 'Y'; // the kingyo-sukui stall
  if (x === 30 && y === 22) return 'y'; // a bike leaned by the postbox
  if (x === 31 && y === 22) return 'X'; // the red postbox
  if (x === 34 && y === 22) return 'Q'; // the fishing co-op notice board
  if (x === 37 && y === 22) return 'p'; // the ferry timetable board
  // The pier: big-catch flags up for Tanabata, a stone lantern at the mouth.
  if (x === 21 && (y === 24 || y === 27)) return 'f';
  if (x === 21 && y === 30) return 'I';
  // The beach: boats, the kei truck backed onto the sand, drying nets.
  if (x === 11 && y === 24) return 'K';
  if (x === 13 && y === 24) return 'i'; // himono rack, one cat-jump too high
  if ((x === 8 || x === 32) && y === 25) return 't';
  if (x === 34 && y === 25) return 'v';
  if ((x === 5 || x === 40) && y === 26) return 'r';
  // Sparse grass tufts, deterministic so nothing crawls.
  if (groundAt(x, y) === 'g' && y >= 3 && y <= 21) {
    if (cellHash(x, y, 47) < 0.05) return 'w';
  }
  // Shells and sea glass where the tide leaves its small change.
  const gk = groundAt(x, y);
  if ((gk === 's' || gk === 'u') && y >= 24) {
    if (cellHash(x, y, 91) < 0.06) return 'e';
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

export const SHIONOURA_MAP: MapData = {
  id: 'shionoura',
  name: 'Shionoura',
  spawn: [22, 29],
  spawnFacing: 'up',
  triggers: [{ at: [26, 17], type: 'door', to: 'minshuku', spawn: [7, 10], facing: 'up' }],
  smoke: [[25, 14]],
  legend: {
    g: { t: 'grass' },
    d: { t: 'dirt' },
    '-': { t: 'path' },
    P: { t: 'plaza' },
    s: { t: 'sand' },
    u: { t: 'sandWet' },
    S: { t: 'sea', solid: true },
    k: { t: 'pierdeck' },
    F: { t: 'tree', solid: true, tall: true },
    r: { t: 'rock', solid: true },
    C: { t: 'machiya', solid: true, tall: true },
    x: { t: 'blocked', solid: true, tall: true },
    D: { t: 'doorShut', solid: true, tall: true },
    N: { t: 'noren', tall: true },
    T: { t: 'torii', tall: true },
    I: { t: 'ishidoro', solid: true, tall: true },
    E: { t: 'ebisudo', solid: true, tall: true },
    b: { t: 'bamboo', solid: true, tall: true },
    B: { t: 'bambooWish', solid: true, tall: true },
    f: { t: 'tairyobata', solid: true, tall: true },
    c: { t: 'chochin', solid: true, tall: true },
    K: { t: 'keitruck', solid: true, tall: true },
    Y: { t: 'yatai', solid: true, tall: true },
    X: { t: 'postbox', solid: true, tall: true },
    G: { t: 'signpost', solid: true, tall: true },
    p: { t: 'piersign', solid: true, tall: true },
    L: { t: 'stall', solid: true, tall: true },
    n: { t: 'bench', solid: true },
    h: { t: 'crate', solid: true },
    t: { t: 'boat', solid: true, tall: true },
    v: { t: 'net', solid: true },
    w: { t: 'tuft' },
    j: { t: 'jizo', solid: true, tall: true },
    a: { t: 'ema', solid: true, tall: true },
    m: { t: 'koke' },
    V: { t: 'jihanki', solid: true, tall: true },
    o: { t: 'ukidama', solid: true },
    M: { t: 'mikanbako', solid: true },
    y: { t: 'jitensha', solid: true },
    q: { t: 'ittokan', solid: true },
    H: { t: 'ajisai', solid: true },
    i: { t: 'himono', solid: true, tall: true },
    l: { t: 'monohoshi', solid: true, tall: true },
    Q: { t: 'gyokyo', solid: true, tall: true },
    z: { t: 'furin', solid: true, tall: true },
    '1': { t: 'nekoloaf', solid: true },
    '2': { t: 'nekoboss', solid: true },
    '3': { t: 'nekonap', solid: true },
    e: { t: 'kaigara' },
  },
  ground,
  objects,
};

/**
 * Fumi's minshuku, the Shiosai. The genkan by the door sits a step lower
 * than the wooden floor; the fiction respects the edge even where the
 * camera flattens it. Tatami room left, the ofuro behind its own wall.
 */
export const MINSHUKU_MAP: MapData = {
  id: 'minshuku',
  name: 'Minshuku Shiosai',
  spawn: [7, 10],
  spawnFacing: 'up',
  legend: {
    t: { t: 'tatami' },
    w: { t: 'floorWood' },
    g: { t: 'tataki' },
    '#': { t: 'wallShoji', solid: true, tall: true },
    S: { t: 'shelf', solid: true, tall: true },
    i: { t: 'irori', solid: true },
    o: { t: 'ofuro', solid: true },
    p: { t: 'pot', solid: true },
    T: { t: 'table', solid: true },
    s: { t: 'stool', solid: true },
    m: { t: 'mat' },
    f: { t: 'senpuki', solid: true },
    j: { t: 'mugicha', solid: true },
    z: { t: 'getarow' },
    ' ': { t: 'void' },
  },
  ground: [
    'wwwwwwwwwwwwwwww',
    'wtttttttwggggggw',
    'wtttttttwggggggw',
    'wtttttttwggggggw',
    'wtttttttwwwwwwww',
    'wtttttttwwwwwwww',
    'wwwwwwwwwwwwwwww',
    'wwwwwwwwwwwwwwww',
    'wwwwwwwwwwwwwwww',
    'wwwwwwwwwwwwwwww',
    'wwwwwwggggwwwwww',
    'wwwwwwggggwwwwww',
  ],
  objects: [
    '################',
    '#S  i   # o   p#',
    '#       #      #',
    '# sTTs  #      #',
    '#f             #',
    '#              #',
    '#              #',
    '#              #',
    '#             j#',
    '#              #',
    '#    m  z      #',
    '####### ########',
  ],
  triggers: [{ at: [7, 11], type: 'door', to: 'shionoura', spawn: [26, 18], facing: 'down' }],
};
