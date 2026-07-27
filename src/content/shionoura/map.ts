import type { MapData } from '../../engine/grid';
import { cellHash } from '../../art/pix';

/**
 * Shionoura: a small fishing town on the Seto Inland Sea, early July.
 * A forested hill at the back, the Ebisu shrine up a flight of stone steps,
 * one shotengai of machiya shopfronts, and a harbor where the ferry
 * timetable structures everything. Cicadas own the trees.
 *
 * Nothing here was built to a plan. The shops stand at four different
 * setbacks because four different families built them in four different
 * decades, the pavement was poured to fit whatever was already there, and the
 * quay grew a tongue where the ice cart needed one. The one row kept honest
 * is the middle of the shotengai and the two seaward rows of the quay, which
 * are for walking and stay empty.
 */

const W = 46;
const H = 32;

/**
 * Machiya anchors: 5x5 footprint, door at [+2,+4], casa-compatible grid.
 * The y varies on purpose: a shop at 4 stands a row back off the pavement and
 * keeps a forecourt; a shop at 5 puts its sill on the kerb.
 */
const MACHIYA: [number, number][] = [
  [2, 5], // Daisuke's fish shop (he works the quay stall)
  [8, 4], // Sachiko's sweet shop, Kadoya, set back behind its own forecourt
  [15, 5], // the tofu shop
  [23, 4], // the shuttered storefront, further back than anything
  [2, 14],
  [9, 13],
  [24, 13], // Fumi's minshuku, the Shiosai
  [33, 17], // the ferry office
];

/** Doors that open: only the minshuku (its door cell wears the noren). */
const OPEN_DOORS = new Set(['24,13']);

const inPier = (x: number, y: number) => (x === 21 || x === 22) && y >= 24 && y <= 30;

/**
 * The shotengai, segment by segment: [x from, x to, first paved row, last].
 * Row 11 belongs to every segment and carries nothing; the shoulders follow
 * the shopfronts in and out, and widen at the gaps between them.
 */
const STREET: [number, number, number, number][] = [
  [2, 6, 10, 12],
  [7, 12, 9, 12], // up into Kadoya's forecourt
  [13, 14, 10, 13], // the two-tile gap: a bench, a cat, a bamboo
  [15, 19, 10, 12],
  [20, 22, 10, 13], // the three-tile gap: the vending machine's corner
  [23, 27, 9, 12], // the shuttered shop's forecourt, weedy and paved
  [28, 31, 10, 12],
  [32, 37, 10, 11], // the arm that carries the pavement to the steps
];

/** The quay's landward edge, which was poured a bay at a time. */
const QUAY: [number, number, number][] = [
  [5, 9, 22],
  [10, 16, 21],
  [17, 19, 22],
  [20, 23, 21],
  [24, 25, 20], // the tongue the ice cart made them pour
  [26, 32, 21],
  [33, 38, 22],
];

const inStreet = (x: number, y: number) =>
  STREET.some(([x0, x1, ny, sy]) => x >= x0 && x <= x1 && y >= ny && y <= sy);

const inQuay = (x: number, y: number) =>
  QUAY.some(([x0, x1, ny]) => x >= x0 && x <= x1 && y >= ny && y <= 23);

/** Bare earth where feet and errands have worn the grass off. */
function inYard(x: number, y: number): boolean {
  // The minshuku's dooryard, swept every morning by a woman with opinions.
  if (y === 18) return x >= 24 && x <= 28;
  if (y === 19) return x >= 25 && x <= 28;
  if (y === 20) return x >= 26 && x <= 27;
  return false;
}

/** The drying ground east of the lane: trodden flat, poles standing in it. */
function inDry(x: number, y: number): boolean {
  if (y === 14) return x >= 19 && x <= 22;
  if (y === 15) return x >= 18 && x <= 22;
  if (y === 16) return x >= 19 && x <= 21;
  return false;
}

function groundAt(x: number, y: number): string {
  if (inPier(x, y)) return 'k';
  if (y >= 28) return 'S';
  if (y === 27) return 'u';
  if (y >= 24) return 's';
  if (inQuay(x, y)) return 'P';
  if (y === 22 || y === 23) return 's';
  if (inStreet(x, y)) return 'P';
  // The shrine plateau and its stone steps, wide enough to climb two abreast.
  if (y >= 1 && y <= 4 && x >= 31 && x <= 44) return 'd';
  if ((x === 35 || x === 36) && y >= 5 && y <= 9) return '-';
  // Lanes: shotengai down to the quay, and the minshuku's own path.
  if ((x === 16 || x === 17) && y >= 12 && y <= 21) return '-';
  if (x === 26 && y >= 18 && y <= 21) return '-';
  if (inYard(x, y) || inDry(x, y)) return 'd';
  return 'g';
}

/** The cedar band above the town, whose lower edge is a ragged thing. */
function inCedar(x: number, y: number): boolean {
  if (y === 1) return x >= 1 && x <= 30;
  if (y === 2) return (x >= 1 && x <= 9) || (x >= 13 && x <= 21) || (x >= 26 && x <= 30);
  if (y === 3) return (x >= 3 && x <= 5) || (x >= 17 && x <= 19);
  return false;
}

function objectAt(x: number, y: number): string {
  // Forested hill at the back; the sea needs no fence.
  if (y === 0) return 'F';
  if (x === 0 || x === W - 1) {
    if (y >= 24 && y <= 27) return 'r';
    if (y < 24) return 'F';
  }
  if (inCedar(x, y)) return 'F';
  // The shrine hill's wooded slope; only the steps pass through.
  if (y >= 5 && y <= 8 && x >= 31 && x <= 44 && x !== 35 && x !== 36) return 'F';
  // The torii stands over the steps; you walk under it.
  if (x === 36 && y === 7) return 'T';
  // Moss owns the shaded west step; feet keep the torii's own line bare.
  if (x === 35 && y >= 6 && y <= 9) return 'm';
  // Shrine yard: the Ebisu hall, its lanterns square to it, and everything
  // else the parishioners have left leaning off the axis.
  if (x === 37 && y === 1) return 'E';
  if ((x === 35 || x === 39) && y === 2) return 'I';
  if (x === 33 && y === 2) return 'a';
  if (x === 33 && y === 3) return 'B';
  if (x === 41 && y === 3) return 'b';
  if (x === 42 && y === 2) return 'b';
  if (x === 40 && y === 1) return 'b';
  // The Jizo at the foot of the steps, in his knitted red bib.
  if (x === 37 && y === 9) return 'j';
  for (const [hx, hy] of MACHIYA) {
    if (x >= hx && x < hx + 5 && y >= hy && y < hy + 5) {
      if (x === hx + 2 && y === hy + 4) return OPEN_DOORS.has(`${hx},${hy}`) ? 'N' : 'D';
      if (x === hx && y === hy + 4) return 'C';
      return 'x';
    }
  }
  const poi = POIS[`${x},${y}`];
  if (poi) return poi;
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

/**
 * Everything that stands still, placed by hand and placed where a person
 * would actually have put it down: against a wall, beside a door, leaning on
 * whatever was nearest. Nothing at a regular pitch, nothing on a walking row.
 */
const POIS: Record<string, string> = {
  // ---- the shotengai, shop side. Each shop dresses its own frontage and no
  // two of them are dressed alike.
  '2,10': 'q', // the fish shop waters its can, daily, whatever the weather
  '3,10': 'A', // and puts its awning out, slung low, indigo gone to slate
  '4,9': 'c', // its lantern, hung off the eave and out over the kerb
  '5,12': 'n',
  '7,10': 'y', // a bike parked in the slot between two shops
  '9,9': 'y', // the granny bike outside Kadoya, unlocked since 1981
  '11,9': 'L', // Sachiko's omiyage counter, out in her forecourt
  '12,9': 'M', // Setoda crates on summer duty
  '12,12': 'c',
  '13,9': 'B', // tanabata bamboo in the two-tile gap, already dressed
  '14,13': 'n',
  '13,13': '3', // and the bench's afternoon shift
  '18,10': 'A', // the tofu shop's awning, hung a hand higher than the others
  '19,10': 'y', // its bike, also unlocked
  '20,9': 'B',
  '21,13': 'V', // the vending machine, humming in the wide gap
  '23,9': 'q', // still watered, though the shop sleeps
  '23,10': 'c',
  '24,9': 'A', // and its awning is still out, faded through to the patch
  '26,9': 'M',
  '25,12': '3', // a bench, a cat and a lantern, all on the same two metres
  '26,12': 'n',
  '27,12': 'c',
  '29,10': 'b', // bamboo where the pavement runs out of shops
  '30,12': 'n',
  '31,10': 'B',
  '34,9': 'B',
  // One stone lantern at the foot of the climb. The Jizo answers it from the
  // far side of the steps, which is not the same thing as matching it.
  '34,10': 'I',
  '6,12': 'h',
  '10,12': 'M',
  '30,10': 'q',

  // ---- between the shotengai and the water: the lane, the drying ground and
  // the minshuku's dooryard.
  '15,13': 'H',
  '19,14': 'l', // the drying ground: poles, a rack, and the flat earth between
  '21,14': 'l',
  '20,16': 'i',
  '18,17': 'H',
  '19,18': 'H',
  '21,15': 'y', // a bike laid on its side where a bike gets laid on its side
  '24,19': 'r',
  '14,19': 'r',
  '3,19': 'H',
  '4,20': 'H',
  '7,20': 'r',
  '11,18': 'l', // the back gardens dry their washing where nobody has to see it
  '12,18': 'l',
  '10,19': 'H',
  '8,13': 'q',
  '25,18': 'z', // the minshuku's wind chime, hung by the door
  '27,18': 'q',
  '27,19': 'H',
  '28,20': 'H',
  '29,18': 'l',
  '25,19': 'n',
  '30,16': 'l',
  '34,13': 'b', // the hill's skirt comes down to the pavement's east end
  '35,14': 'b',
  '31,15': 'r',
  '32,16': 'H',

  // ---- the quay. The row nearest the water carries nothing at all; what
  // stands here stands where its owner set it down, at whatever depth.
  '6,21': 'o', // glass floats, retired with honors
  '8,20': 'f', // a big-catch flag at the west end, back on the grass
  '11,20': 'h',
  '12,21': 'M',
  '14,21': 'L', // Daisuke's morning stall, east of where Daisuke stands
  '15,22': 'h', // and one crate carried down toward the water and forgotten
  '18,21': 'G', // the town sign, up on the grass verge
  '19,20': '2', // Kacho, the section chief, on the high ground
  '20,21': '1', // the quay supervisor, loafed
  '26,22': 'c',
  '24,20': 'Y', // the kingyo-sukui stall, out on the tongue where it can be seen
  '25,20': 'c',
  '27,21': 'M',
  '28,22': 'h',
  '30,21': 'y', // a bike leaned against the postbox, as bikes are
  '31,21': 'X', // the red postbox
  '34,22': 'Q', // the fishing co-op notice board
  '37,22': 'p', // the ferry timetable board

  // ---- the pier and the beach. The flags do not match and never have.
  '20,24': 'f',
  '23,26': 'f',
  '21,30': 'I',
  '18,24': 'K', // the kei truck, backed onto the sand by the pier head
  '14,24': 'i', // himono rack, one cat-jump too high
  '7,25': 't', // two boats hauled up together, one further out
  '9,26': 't',
  '10,27': 'v',
  '16,26': 'r',
  '17,25': 'v',
  '18,26': 'o',
  '26,25': 't', // and a third boat east of the pier, on its side
  '27,26': 'h',
  '29,27': 'v',
  '31,25': 't',
  '33,26': 'v',
  '36,26': 'r',
  '5,26': 'r',
  '40,26': 'r',
};

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
    A: { t: 'hisashi', solid: true, tall: true },
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
    b: { t: 'zabuton' },
    c: { t: 'chochin', solid: true, tall: true },
    n: { t: 'nekoloaf', solid: true },
    N: { t: 'nekonap', solid: true },
    k: { t: 'mikanbako', solid: true },
    d: { t: 'monohoshi', solid: true, tall: true },
    h: { t: 'himono', solid: true, tall: true },
    u: { t: 'ukidama', solid: true },
    F: { t: 'tairyobata', solid: true, tall: true },
    K: { t: 'kaigara' },
    B: { t: 'jitensha', solid: true },
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
  // Six empty rows of wooden floor was the whole middle of this house. Now
  // the irori and its cushions hold the tatami room, the ofuro room behind
  // its wall is the working side with the bath stool and the pails, and the
  // hall between them is a minshuku actually lived in: the guests' low table
  // off the door lane, the drying rack and the mikan crates banked against
  // the east wall, the big-catch flag on the west, and a lantern standing
  // where the light is needed. The lane from the genkan north never closes.
  objects: [
    '################',
    '#S  ib  #so  p #',
    '# bb  j #   p  #',
    '# TTb   #  K   #',
    '#f   b   N    d#',
    '#F    b   c   h#',
    '#    TT        #',
    '#  n bb b   u  #',
    '#          kk j#',
    '#KK       kkk  #',
    '#    m  z B    #',
    '####### ########',
  ],
  triggers: [{ at: [7, 11], type: 'door', to: 'shionoura', spawn: [26, 18], facing: 'down' }],
};
