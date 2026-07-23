import type { MapData } from '../../engine/grid';

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
  if (y === 26 && (x === 5 || x === 11 || x === 36 || x === 41)) return 'R';
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
  },
  ground,
  objects,
};

/** Old Man Cho's tea house: shoes off, low tables, a kettle allowed to hurry. */
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
    m: { t: 'mat' },
    h: { t: 'hanjilamp', solid: true, tall: true },
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
    '#h  k      #',
    '#          #',
    '# TT   TT  #',
    '# mm   mm  #',
    '#          #',
    '#  TT      #',
    '#  mm     h#',
    '#####m######',
  ],
  triggers: [{ at: [5, 8], type: 'door', to: 'busan', spawn: [8, 7], facing: 'down' }],
};
