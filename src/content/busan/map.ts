import type { MapData } from '../../engine/grid';
import { cellHash } from '../../art/pix';

/**
 * Mulmang-gol: a fictional harborside market quarter in Busan, folded between
 * the fish quay and a hillside of stacked pastel houses. One warm lane in the
 * Jagalchi tradition: awnings, basins, dried fish, steam, and container
 * cranes grazing along the waterline like orange giraffes.
 */

const W = 44;
const H = 30;

/** The tea house: casa-pattern 5x5 footprint, anchor bottom-left, open door. */
const TEA: [number, number] = [6, 2];

function groundAt(x: number, y: number): string {
  // The ferry jetty walks out into the harbor.
  if (y >= 26) return x >= 20 && x <= 23 && y <= 27 ? 'k' : 'S';
  // The quay.
  if (y >= 24) return 'k';
  // The market lane.
  if (y >= 12 && y <= 14) return 'P';
  // The dried-fish alley, lane to quay.
  if (x >= 30 && x <= 31 && y >= 15 && y <= 23) return 'P';
  // The jetty path up to the lane.
  if (x >= 20 && x <= 21 && y >= 15 && y <= 23) return '-';
  // The stairs up to the tea house terrace.
  if (x >= 8 && x <= 9 && y >= 7 && y <= 11) return '-';
  return 'd';
}

/**
 * The clutter of a lived-in lane, placed by hand. Market rows loud and
 * stacked; the hill terrace quieter, all jars and drying mats and weeds.
 */
const POIS: Record<string, string> = {
  // Market lane and stall rows.
  '21,11': 'B', // basins stacked head-high beside the stalls
  '27,11': 'w', // the wall of hand-written price signs
  '35,11': 'p', // a market parasol past the eomuk cart
  '39,11': 't', // the tteok shop's steamer stack
  '2,13': 's', // the delivery scooter, parked at the lane's west end
  '10,14': 'h', // the lane-washing hose, coiled by its drain
  '9,15': 'p', // parasol shading the gukbap counter's overflow stool
  // Mid-block, between lane and quay.
  '4,17': 'z', // rubber boots upside down on the fence
  '19,18': 'l', // lotus lanterns strung beside the jetty path
  '22,20': 'l',
  '30,22': 'h', // the alley's own hose, by its own drain
  // The dried-fish alley walls.
  '29,19': 'q', // dried squid pinned up like laundry
  '32,18': 'q',
  // The hill terrace: quieter, older, greener.
  '2,3': 'j', // onggi jars at the pastel houses' feet
  '11,3': 'j', // the tea house's own onggi corner
  '41,3': 'j',
  '13,6': 'c', // gochugaru chilies drying on woven mats
  '33,3': 'c',
  '38,6': 'c',
  '28,4': 'g', // the magpie's wire
  '20,5': 'Y', // winter's yeontan, delivered early and stacked proud
  '36,8': 'z', // more boots, drying where the hill wind runs
  '7,9': 'r', // the stair handrail, with its halfway stool
  // The quay.
  '6,23': 'B', // basins rinsed and stacked by the water
  '15,24': 'y', // styrofoam towers
  '3,25': 'y',
  '31,25': 'y',
  '28,24': 'C', // the market cat, asleep on a lid
  '17,25': 'U', // a bollard, under new management (a gull)
};

function objectAt(x: number, y: number): string {
  // The hillside backdrop: two rows of stacked pastel houses.
  if (y <= 1) return 'H';
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
  // The hill spills a few houses onto the terrace corners.
  if ((x === 2 || x === 3 || x === 40 || x === 41) && y === 2) return 'H';
  // North side of the lane: the stalls.
  if (y === 11) {
    if (x === 13 || x === 17 || x === 25) return 'A';
    if (x === 15 || x === 19) return 'b';
    if (x === 23) return 'v';
    if (x === 33) return 'E';
    if (x === 3 || x === 29 || x === 37) return 'L';
  }
  // South side of the lane.
  if (y === 15) {
    if (x === 12) return 'G';
    if (x === 5) return 'u';
    if (x === 16 || x === 39) return 'L';
    if (x === 26) return 'v';
  }
  // The dried-fish alley wall, racks staggered both sides.
  if (x === 29 && y >= 16 && y <= 22 && y % 2 === 0) return 'f';
  if (x === 32 && y >= 15 && y <= 21 && y % 2 === 1) return 'f';
  // Benches on the terrace and the mid-block.
  if ((x === 14 || x === 24) && y === 22) return 'n';
  if ((x === 3 || x === 13) && y === 4) return 'n';
  // The harbor edge: ferry office, post window, a lamp.
  if (y === 23) {
    if (x === 37) return 'F';
    if (x === 40) return 'm';
    if (x === 10) return 'L';
  }
  if (y === 24 && (x === 6 || x === 27)) return 'K';
  if (y === 25 && x === 34) return 'K';
  // Cranes stand in the first water row so the quay can look up at them.
  // They are three tiles tall now, so they keep clear of where people stand.
  if (y === 26 && (x === 5 || x === 11 || x === 32 || x === 41)) return 'R';
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
    E: { t: 'eomukcart', solid: true, tall: true },
    G: { t: 'hotteokcart', solid: true, tall: true },
    u: { t: 'stall', solid: true, tall: true },
    f: { t: 'fishrack', solid: true, tall: true },
    L: { t: 'farol', solid: true, tall: true },
    F: { t: 'ferrysign', solid: true, tall: true },
    m: { t: 'postwindow', solid: true, tall: true },
    R: { t: 'crane', solid: true, tall: true },
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
