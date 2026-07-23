import type { MapData } from '../../engine/grid';
import { cellHash } from '../../art/pix';

/**
 * Prototype village for tuning feel: a plaza with a well, a stream with a
 * bridge, house clusters, potato terraces, and scattered life. Painted by rule
 * so it can be reshaped in seconds, but consumed through the same TileMap
 * loader real hand-authored regions will use.
 */

const W = 44;
const H = 32;

const HOUSES: [number, number][] = [
  [10, 7],
  [27, 6],
  [10, 21],
  [29, 21],
];

const TREES: [number, number][] = [
  [8, 12], [7, 20], [24, 4], [26, 26], [35, 12], [16, 27], [38, 5],
  [7, 4], [17, 3], [37, 17], [19, 24],
];

function groundAt(x: number, y: number): string {
  // Stream down the western side, bridged where the main street crosses it.
  if (x >= 4 && x <= 5) return y === 16 ? 'b' : 'w';
  if (x === 3 || x === 6) return '.'; // green banks
  // Plaza around the well.
  if (x >= 17 && x <= 25 && y >= 13 && y <= 18) return 'P';
  // Main street and the lane up toward the ridge.
  if (y === 16 && x >= 6 && x <= 40) return '-';
  if (x === 21 && y >= 3 && y <= 28) return '-';
  // Short paths from each house door down to the street, worn right up to
  // (and under) the doorway itself.
  for (const [hx, hy] of HOUSES) {
    if (x === hx + 2 && ((hy < 16 && y >= hy + 4 && y <= 16) || (hy > 16 && y >= 16 && y <= hy + 4))) return '-';
  }
  // Potato terraces in the southeast: planted beds banded with bare earth
  // walkways, the way hillside terraces actually read.
  if (x >= 31 && x <= 40 && y >= 21 && y <= 28) return y % 3 === 2 ? 'd' : 'c';
  return ','; // puna grassland
}

/** Houses whose doors open (the others are latched, with lives behind them). */
const OPEN_DOORS = new Set(['10,21', '27,6']);

function objectAt(x: number, y: number): string {
  // Stone ridge enclosing the valley, parted where the east road leaves it.
  if (y <= 1 || y >= H - 1 || x === 0 || x === W - 1) {
    if (x === W - 1 && y === 16) return ' '; // the road runs out through the ridge
    return 'o';
  }
  // The gate across the east road, shut until the story opens it.
  if ((x === 41 || x === 42) && y === 16) return 'G';
  // Houses are single illustrated sprites now; the grid only collides.
  // 'H' anchors the drawing at the bottom-left wall cell; 'x' cells are
  // invisible collision; the door cell stays open (or latched with 'D').
  for (const [hx, hy] of HOUSES) {
    if (x >= hx && x < hx + 5 && y >= hy && y < hy + 5) {
      if (x === hx + 2 && y === hy + 4) return OPEN_DOORS.has(`${hx},${hy}`) ? ' ' : 'D';
      if (x === hx && y === hy + 4) return 'H';
      return 'x';
    }
  }
  if (x === 21 && y === 15) return 'W'; // the well
  if ((x === 18 && y === 14) || (x === 25 && y === 18)) return 'M'; // market stalls
  if (x === 13 && y === 26) return 'F'; // Rosa's chicha flag, beside her door
  // Street furniture: the village owns its plaza.
  if ((x === 19 && y === 15) || (x === 23 && y === 17)) return 'n'; // benches
  if ((x === 15 && y === 23) || (x === 34 && y === 7)) return 'Y'; // woodpiles
  if ((x === 9 && y === 26) || (x === 32 && y === 11)) return 'p'; // planters
  if ((x === 17 && y === 13) || (x === 25 && y === 13) || (x === 7 && y === 15) || (x === 36 && y === 12)) return 'L'; // lamp posts
  for (const [tx, ty] of TREES) if (x === tx && y === ty) return 'T';

  // Scattered life on open grassland only, deterministic so it never shifts.
  if (groundAt(x, y) === ',') {
    const h = cellHash(x, y, 21);
    if (h < 0.030) return 'f'; // wildflowers
    if (h < 0.085) return 'i'; // ichu tufts
    if (h > 0.994) return 'r'; // boulders
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

export const VILLAGE_MAP: MapData = {
  id: 'village',
  name: "Ch'aska Pampa",
  spawn: [21, 17],
  spawnFacing: 'up',
  triggers: [
    { at: [12, 25], type: 'door', to: 'chicheria', spawn: [6, 7], facing: 'up' },
    { at: [29, 10], type: 'door', to: 'casa-carmen', spawn: [5, 7], facing: 'up' },
  ],
  legend: {
    ',': { t: 'puna' },
    '.': { t: 'grass' },
    d: { t: 'dirt' },
    '-': { t: 'path' },
    P: { t: 'plaza' },
    c: { t: 'crop' },
    w: { t: 'water', solid: true },
    b: { t: 'bridge' },
    ' ': { t: 'void' },
    o: { t: 'wallStone', solid: true, tall: true },
    H: { t: 'house', solid: true, tall: true },
    x: { t: 'blocked', solid: true, tall: true },
    M: { t: 'stall', solid: true, tall: true },
    T: { t: 'tree', solid: true, tall: true },
    W: { t: 'well', solid: true, tall: true },
    F: { t: 'chichaflag', solid: true, tall: true },
    D: { t: 'doorShut', solid: true, tall: true },
    G: { t: 'gate', solid: true, tall: true },
    n: { t: 'bench', solid: true },
    Y: { t: 'woodpile', solid: true },
    p: { t: 'planter', solid: true },
    L: { t: 'farol', solid: true, tall: true },
    f: { t: 'flower' },
    i: { t: 'tuft' },
    r: { t: 'rock', solid: true },
  },
  ground,
  objects,
  // One cookfire per house, rising from the roof ridge.
  smoke: HOUSES.map(([hx, hy]) => [hx + 3, hy]),
};
