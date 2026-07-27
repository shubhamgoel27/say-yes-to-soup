import type { MapData } from '../../engine/grid';
import { cellHash } from '../../art/pix';

/**
 * Mulmang-gol: a fictional harborside market quarter in Busan, folded between
 * the fish quay and a hillside of stacked pastel houses. One warm lane in the
 * Jagalchi tradition: awnings, basins, dried fish, steam, and container
 * cranes grazing along the waterline like orange giraffes.
 *
 * The lane is drawn the way a market wears one: wide where the auction floor
 * spills out, pinched at the west mouth, thinning to a footpath at the east
 * wall. Everything that stands still stands on a shoulder; row 13 is clear
 * from end to end, because that is where the barrows go.
 */

const W = 44;
const H = 30;

/** The tea house: casa-pattern 5x5 footprint, anchor bottom-left, open door. */
const TEA: [number, number] = [6, 2];

/**
 * The lane, segment by segment: [x from, x to, first paved row, last paved
 * row]. Row 13 belongs to every segment; the shoulders wander.
 */
const LANE: [number, number, number, number][] = [
  [1, 4, 12, 14], // the west mouth, pinched between the scooter and the wall
  [5, 9, 12, 15], // the gukbap counter spills its stools south
  [10, 12, 11, 14],
  [13, 15, 11, 15], // Mi-ja's griddle corner, wide on both shoulders
  [16, 19, 11, 14],
  [20, 26, 10, 15], // the auction floor: the lane opens out and looks up
  [27, 31, 12, 16], // and closes again at the alley mouth, spilling south
  [32, 36, 11, 14],
  [37, 40, 12, 14],
  [41, 42, 13, 13], // a footpath by the time it reaches the east wall
];

const inLane = (x: number, y: number) =>
  LANE.some(([x0, x1, ny, sy]) => x >= x0 && x <= x1 && y >= ny && y <= sy);

/** The dried-fish alley, wider at the drain where the washing happens. */
function inAlley(x: number, y: number): boolean {
  if (y >= 15 && y <= 16) return x >= 30 && x <= 31;
  if (y >= 17 && y <= 19) return x >= 29 && x <= 31;
  if (y >= 20 && y <= 22) return x >= 30 && x <= 31;
  if (y === 23) return x >= 30 && x <= 33;
  return false;
}

/** The track worn from the jetty up to the lane. It leans east, then back. */
const JETTY: Record<number, [number, number]> = {
  15: [19, 22],
  16: [19, 22],
  17: [20, 22],
  18: [20, 23],
  19: [21, 23],
  20: [21, 23],
  21: [20, 23],
  22: [20, 22],
  23: [20, 22],
};

/** The stairs to the tea house terrace, splayed at the foot like worn steps. */
function inStairs(x: number, y: number): boolean {
  if (y >= 7 && y <= 11) return x === 8 || x === 9;
  return false;
}

/**
 * How far north the quay reaches, column by column. The stone was poured in
 * whatever decade the money turned up, so its landward edge is a set of
 * notches and one bite where the old slipway never got paved at all.
 */
function quayTop(x: number): number {
  if (x >= 36) return 22; // the ferry forecourt, swept and signed
  if (x >= 33) return 23;
  if (x >= 25 && x <= 27) return 23; // a tongue of stone where the ice comes up
  if (x >= 18 && x <= 19) return 23;
  if (x >= 12 && x <= 14) return 25; // the old slipway: hard ground, never paved
  if (x >= 6 && x <= 9) return 23;
  return 24;
}

/**
 * Two aprons of wet paving out in the yard, laid where the hose runs and
 * poured to no shape in particular: the wash-down under the alley mouth, and
 * the old slip's rinsing floor. Both hang off ground that is already stone.
 */
function inWash(x: number, y: number): boolean {
  if (y === 19) return x >= 26 && x <= 28;
  if (y === 20) return x >= 25 && x <= 28;
  if (y === 21) return (x >= 26 && x <= 27) || (x >= 6 && x <= 9);
  if (y === 22) return x >= 5 && x <= 8;
  return false;
}

/** The wharf: the jetty, and the apron it grew when the ferries got bigger. */
const onWharf = (x: number, y: number) =>
  (x >= 20 && x <= 23 && y <= 27) || (x >= 24 && x <= 30 && y === 26);

function groundAt(x: number, y: number): string {
  if (y >= 26) return onWharf(x, y) ? 'k' : 'S';
  if (y >= quayTop(x)) return 'k';
  if (inLane(x, y) || inAlley(x, y) || inWash(x, y)) return 'P';
  const jetty = JETTY[y];
  if (jetty && x >= jetty[0] && x <= jetty[1]) return '-';
  if (inStairs(x, y)) return '-';
  if (x === 10 && y >= 9 && y <= 10) return '-'; // the apron at the stairs' foot
  if (x === 7 && y === 11) return '-';
  return 'd';
}

/**
 * The hill spills roofs down between the terraces, never by the same amount.
 * [x from, x to, lowest row of houses].
 */
const HILLSPILL: [number, number, number][] = [
  [1, 4, 3],
  [11, 15, 2],
  [16, 17, 3],
  [24, 27, 2],
  [31, 33, 3],
  [38, 42, 2],
];

/**
 * The clutter of a lived-in lane, placed by hand and placed in company: three
 * things together, a gap you could park a barrow in, then one thing alone.
 */
const POIS: Record<string, string> = {
  // ---- the hill terrace: the market's quiet back, all jars and drying mats.
  '1,4': 'j', // three onggi at the west houses' feet, in an elbow
  '2,4': 'j',
  '2,5': 'j',
  '4,6': 'n', // a bench two steps off, facing the wrong way on purpose
  '1,7': 'c', // gochugaru drying where the hill wind runs
  '2,7': 'c',
  '4,9': 'z', // boots upside down on the fence
  '11,3': 'j', // the tea house's own onggi corner
  '12,3': 'j',
  '11,4': 'j',
  '12,5': 'Y', // its winter coal, delivered early and stacked proud
  '7,9': 'r', // the stair handrail, with its halfway stool
  '10,8': 'r',
  '11,8': 'p', // a parasol and a bench at the top of the lane
  '12,9': 'n',
  '14,4': 'q', // squid pinned up like laundry between the roofs
  '15,4': 'q',
  '16,5': 'q',
  '20,8': 'c', // the open terrace keeps one red thing to look at
  '21,8': 'c',
  '24,9': 'g', // the magpie's wire, at the terrace's east edge
  '19,3': 'Y',
  '20,3': 'Y',
  '33,5': 'c', // the east terrace's drying patch
  '34,5': 'c',
  '33,6': 'c',
  '36,8': 'z', // more boots, drying where the hill wind runs
  '37,8': 'z',
  '41,4': 'j',
  '42,4': 'j',
  '38,10': 'p',

  // ---- the lane, west mouth.
  '1,11': 'B', // basins stacked head-high where the lane begins
  '2,11': 's', // the delivery scooter, parked past argument
  '4,10': 'L',
  '5,16': 'u', // the gukbap counter, and the overflow it always has
  '6,17': 'K',
  '7,16': 'p',
  '8,17': 'b',
  '10,16': 'v', // a grate breathing the kitchen below
  '11,10': 'w', // the wall of hand-written price signs

  // ---- Mi-ja's corner: the griddle, and everything it collects.
  '12,15': 'G',
  '11,15': 'K',
  '13,16': 'b',
  '13,10': 'A',
  '14,17': 'X', // the barrow, parked while its owner argues

  // ---- Sun-hee's stall: the red awning the letter tells you to find.
  '17,11': 'R',
  '16,10': 'b',

  // ---- the auction floor: loud along its north lip, piled in its east
  // corner, and swept clear down the middle where the barrows come up.
  '20,9': 'A',
  '22,8': 'A',
  '23,9': 'A',
  '21,9': 'b',
  '25,9': 'B',
  '26,10': 'y',
  '26,11': 'b',
  '25,12': 'X',
  '24,16': 'K', // the day's crates, stacked off the floor at the south lip
  '25,16': 'K',
  '24,17': 'y',
  '26,15': 'v',

  // ---- the stack yard west of the jetty path.
  '17,16': 'y',
  '18,17': 'y',
  '18,18': 'y',
  '16,18': 'B',
  '15,19': 'K',
  '16,19': 'K',
  '15,20': 'K',
  '13,19': 'z',
  '18,21': 'X',
  '16,22': 'y',
  '16,23': 'y',
  '17,23': 'C', // the cat that owns the lid
  '19,18': 'l', // lotus lanterns, strung alternately over the walk
  '23,17': 'L', // and the lamp that still burns over the path at dawn
  '24,20': 'l',
  '19,22': 'l',
  '24,22': 'n', // a bench at the head of the jetty, for the ones who wait
  '25,23': 'K',

  // ---- and the wash-down yard east of it.
  '26,18': 'B',
  '27,19': 'K',
  '27,20': 'K',
  '25,21': 'p',
  '28,22': 'K',
  '29,22': 'y',
  '28,23': 'b',

  // ---- the yard between lane and quay: bounded, worked, mostly clear.
  '3,18': 'z',
  '4,18': 'z',
  '7,19': 'q',
  '8,19': 'q',
  '7,20': 'q',
  '2,20': 'y',
  '3,20': 'y',
  '2,21': 'y',
  '5,21': 'b',
  '9,18': 'K',
  '10,18': 'K',
  '11,20': 'c', // the open turning ground keeps one red thing in it
  '10,21': 'h', // the lane-washing hose, coiled by its drain
  '13,22': 'y',
  '13,23': 'y',
  '14,24': 'K',
  '9,17': 'n',

  // ---- and the lane's own floor: hoses across it, basins set down on it.
  '9,13': 'h',
  '18,13': 'h',
  '23,14': 'h',
  '14,12': 'b',
  '22,12': 'b',
  '34,12': 'b',
  '29,14': 'b',

  // ---- the dried-fish alley and its outer wall.
  '30,19': 'h',
  '33,17': 'q',
  '33,18': 'q',
  '28,16': 'q',

  // ---- the east lane: the eomuk cart and the tteok shop.
  '33,10': 'E',
  '35,10': 'A',
  '37,11': 'L',
  '39,11': 't',
  '40,11': 'w',
  '35,16': 'n',
  '36,16': 'n',
  '38,17': 'K',
  '39,19': 'K', // the ferry's freight, waiting where it can be counted
  '40,19': 'K',
  '39,20': 'y',
  '42,17': 'q',
  '41,16': 'p',

  // ---- the quay.
  '6,23': 'B', // basins rinsed and stacked by the water
  '7,23': 'K',
  '8,23': 'K',
  '3,24': 'y',
  '4,24': 'y',
  '16,24': 'U', // a bollard, under new management, with the slip's own clutter
  '15,24': 'y',
  '35,23': 'L',
  '37,23': 'F',
  '40,23': 'm',
  '38,22': 'K',
  '39,22': 'K',
  '38,23': 'K',
  '42,24': 'y',
  '42,23': 'y',
  '26,26': 'K', // the apron's own furniture, out at the water's edge
  '28,26': 'y',
  '29,26': 'U',
};

function objectAt(x: number, y: number): string {
  // The hillside backdrop: two solid rows, then roofs spilling down unevenly.
  if (y <= 1) return 'H';
  if (HILLSPILL.some(([x0, x1, down]) => x >= x0 && x <= x1 && y <= down)) return 'H';
  if (x === 0 || x === W - 1) {
    if (y <= 11) return 'H';
    if (y <= 25) return 'o';
    return ' ';
  }
  // The tea house footprint.
  const [hx, hy] = TEA;
  if (x >= hx && x < hx + 5 && y >= hy && y < hy + 5) {
    if (x === hx + 2 && y === hy + 4) return ' '; // the open door
    if (x === hx && y === hy + 4) return 'T';
    return 'x';
  }
  // The alley walls: racks in pairs and singles, never at one pitch.
  if (x === 32 && (y === 16 || y === 17 || y === 19 || y === 20 || y === 22)) return 'f';
  if (x === 28 && (y === 18 || y === 19 || y === 21)) return 'f';
  // Cranes stand in the water so the quay can look up at them.
  if (y === 26 && (x === 3 || x === 9 || x === 16 || x === 34 || x === 41)) return 'N';
  const poi = POIS[`${x},${y}`];
  if (poi) return poi;
  // Weeds in the yard corners, deterministic so the map never crawls.
  if (groundAt(x, y) === 'd' && cellHash(x, y, 55) < 0.05) return 'i';
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

export const BUSAN_MAP: MapData = {
  id: 'busan',
  name: 'Mulmang-gol',
  spawn: [21, 27],
  spawnFacing: 'up',
  triggers: [{ at: [8, 6], type: 'door', to: 'teahouse', spawn: [5, 7], facing: 'up' }],
  smoke: [[7, 3]],
  legend: {
    d: { t: 'dirt' },
    '-': { t: 'path' },
    P: { t: 'lanepave' },
    k: { t: 'pierdeck' },
    S: { t: 'sea', solid: true },
    ' ': { t: 'void' },
    H: { t: 'hillhouses', solid: true, tall: true },
    o: { t: 'wallStone', solid: true, tall: true },
    T: { t: 'teahouse', solid: true, tall: true },
    x: { t: 'blocked', solid: true, tall: true },
    A: { t: 'awning', solid: true, tall: true },
    R: { t: 'hongawning', solid: true, tall: true },
    N: { t: 'crane', solid: true, tall: true },
    E: { t: 'eomukcart', solid: true, tall: true },
    G: { t: 'hotteokcart', solid: true, tall: true },
    u: { t: 'stall', solid: true, tall: true },
    f: { t: 'fishrack', solid: true, tall: true },
    L: { t: 'farol', solid: true, tall: true },
    F: { t: 'ferrysign', solid: true, tall: true },
    m: { t: 'postwindow', solid: true, tall: true },
    X: { t: 'barrow', solid: true, tall: true },
    b: { t: 'basin', solid: true },
    v: { t: 'steamvent', solid: true },
    n: { t: 'bench', solid: true },
    K: { t: 'crate', solid: true },
    B: { t: 'basinstack', solid: true, tall: true },
    q: { t: 'squidline', solid: true, tall: true },
    j: { t: 'onggi', solid: true, tall: true },
    p: { t: 'parasol', solid: true, tall: true },
    s: { t: 'scooter', solid: true, tall: true },
    l: { t: 'lotusline', solid: true, tall: true },
    g: { t: 'magpie', solid: true, tall: true },
    w: { t: 'pricewall', solid: true, tall: true },
    z: { t: 'bootfence', solid: true, tall: true },
    t: { t: 'steamerstack', solid: true, tall: true },
    r: { t: 'handrail', solid: true, tall: true },
    c: { t: 'chilimat', solid: true },
    y: { t: 'foambox', solid: true },
    C: { t: 'marketcat', solid: true },
    U: { t: 'gullpost', solid: true },
    Y: { t: 'yeontan', solid: true },
    h: { t: 'hosecoil' },
    i: { t: 'tuft' },
  },
  ground,
  objects,
};

/**
 * Old Man Cho's tea house: shoes off, low tables, a kettle allowed to hurry.
 * The near table group sits one column west of the door so the tile you face
 * when you arrive is floor, not a stool hidden under your own sprite.
 */
export const TEAHOUSE_MAP: MapData = {
  id: 'teahouse',
  name: 'The Tea House',
  spawn: [5, 7],
  spawnFacing: 'up',
  legend: {
    '.': { t: 'floorOndol' },
    '#': { t: 'wallInt', solid: true, tall: true },
    S: { t: 'shelf', solid: true, tall: true },
    k: { t: 'kettle', solid: true },
    T: { t: 'table', solid: true },
    s: { t: 'stool', solid: true },
    m: { t: 'mat' },
    h: { t: 'hanjilamp', solid: true, tall: true },
    e: { t: 'shoerow', solid: true },
    g: { t: 'goboard', solid: true },
    y: { t: 'yeontan', solid: true },
    ' ': { t: 'void' },
  },
  ground: [
    '............',
    '............',
    '............',
    '............',
    '............',
    '............',
    '............',
    '............',
    '............',
  ],
  objects: [
    '####S##S####',
    '#h  k    y #',
    '#          #',
    '# TTs  TTs #',
    '# mm   mm  #',
    '#          #',
    '# TTs   g  #',
    '# mm  e   h#',
    '#####m######',
  ],
  triggers: [{ at: [5, 8], type: 'door', to: 'busan', spawn: [8, 7], facing: 'down' }],
};
