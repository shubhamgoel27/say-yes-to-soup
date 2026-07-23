import type { MapData } from '../../engine/grid';
import { cellHash } from '../../art/pix';

/**
 * The sicily chapter: a fictional fishing town on Sicily's east coast, in the
 * Aci Trezza tradition. Lava-black shoreline, the faraglioni standing offshore,
 * lemon terraces above the roofs, and 'a Muntagna presiding out of frame.
 * Summer; the light is a hammer until the passeggiata hour softens it.
 */

const W = 46;
const H = 30;

/** Casedda anchors: 5x5 footprint, door at [+2,+4], the shared casa grid. */
const CASEDDE: [number, number][] = [
  [2, 1],
  [9, 1],
  [26, 1],
  [2, 14],
  [27, 9], // the circolo dei pescatori
];

/** Doors that open: only the circolo. The rest are lives, latched. */
const OPEN_DOORS = new Set(['27,9']);

/** The chiesa facade owns these cells; anchor at (20,6). */
const CHURCH = new Set(['19,5', '20,5', '21,5', '19,6', '21,6']);

const onMole = (x: number, y: number) => (y === 19 || y === 20) && x >= 33 && x <= 42;

function groundAt(x: number, y: number): string {
  if (x >= 36 && !onMole(x, y)) return 'S';
  if (onMole(x, y)) return 'b';
  if (x >= 33) return 'h';
  if (y >= 21) return 'h';
  if (y === 19 || y === 20) return 'b';
  // The lemon terraces: the only green, held up by lava-stone walls.
  if (x >= 2 && x <= 7 && y >= 7 && y <= 13) return 'g';
  if (x >= 14 && x <= 25 && y >= 1 && y <= 4) return 'g';
  if (x >= 10 && x <= 30 && y >= 8 && y <= 18) return 'b';
  if (y === 7 && x >= 8 && x <= 32) return 'b';
  return 'd';
}

/** Cells the deterministic rock scatter must leave open (NPC homes, seats). */
const RESERVED = new Set(['34,16', '34,15', '34,17', '33,21', '35,21']);

function objectAt(x: number, y: number): string {
  // Boundary: walls behind the town, lava rock where the beach runs out.
  if (y === 0 && x < 36) return 'o';
  if (y === H - 1 && x < 36) return 'r';
  if (x === 0) return y <= 18 ? 'o' : 'r';
  for (const [hx, hy] of CASEDDE) {
    if (x >= hx && x < hx + 5 && y >= hy && y < hy + 5) {
      if (x === hx + 2 && y === hy + 4) return OPEN_DOORS.has(`${hx},${hy}`) ? ' ' : 'D';
      if (x === hx && y === hy + 4) return 'C';
      return 'x';
    }
  }
  if (CHURCH.has(`${x},${y}`)) return 'x';
  if (x === 20 && y === 6) return 'G';
  // The faraglioni, standing in their own myth.
  if ((x === 38 && y === 4) || (x === 42 && y === 9) || (x === 36 && y === 14)) return 'F';
  // Boats: two riding by the mole, one hauled up on the black sand.
  if ((x === 37 && y === 17) || (x === 39 && y === 22) || (x === 34 && y === 24)) return 'V';
  // The pescheria corner: Turi's stall between its crates.
  if (x === 31 && y === 17) return 'M';
  if ((x === 30 || x === 32) && y === 18) return 'K';
  // The granita bar and its outdoor tables.
  if (x === 11 && y === 15) return 'Q';
  if (x === 14 && y === 15) return 'l';
  if ((x === 10 || x === 13 || x === 16) && y === 17) return 'U';
  if (x === 18 && y === 16) return 'v';
  // The post office window, one counter deep.
  if (x === 24 && y === 18) return 'p';
  // Street furniture along the piazza's south edge and the lungomare.
  if ((x === 9 || x === 28) && y === 18) return 'L';
  if ((x === 18 || x === 26) && y === 21) return 'n';
  if ((x === 14 && y === 23) || (x === 24 && y === 25)) return 'N';
  // Lemon trees on both terraces.
  if ((x === 3 && y === 9) || (x === 5 && y === 11) || (x === 3 && y === 13) || (x === 6 && y === 9)) return 'T';
  if ((x === 15 && y === 2) || (x === 18 && y === 3) || (x === 21 && y === 2) || (x === 24 && y === 3)) return 'T';
  const g = groundAt(x, y);
  // Lava rock scattered where the flow met the sea, fixed so it never shifts.
  if (g === 'h' && !RESERVED.has(`${x},${y}`)) {
    if (cellHash(x, y, 71) < 0.05) return 'r';
  }
  if (g === 'g') {
    if (cellHash(x, y, 72) < 0.1) return 'i';
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

export const SICILY_MAP: MapData = {
  id: 'sicily',
  name: 'The Riviera of the Cyclops',
  spawn: [40, 20],
  spawnFacing: 'left',
  triggers: [{ at: [29, 13], type: 'door', to: 'circolo', spawn: [6, 8], facing: 'up' }],
  legend: {
    b: { t: 'basalto' },
    h: { t: 'lavashore' },
    d: { t: 'dirt' },
    g: { t: 'grass' },
    S: { t: 'sea', solid: true },
    ' ': { t: 'void' },
    o: { t: 'wallStone', solid: true, tall: true },
    C: { t: 'casedda', solid: true, tall: true },
    x: { t: 'blocked', solid: true, tall: true },
    D: { t: 'doorShut', solid: true, tall: true },
    G: { t: 'chiesa', solid: true, tall: true },
    F: { t: 'faraglione', solid: true, tall: true },
    V: { t: 'barca', solid: true, tall: true },
    M: { t: 'stall', solid: true, tall: true },
    K: { t: 'crate', solid: true },
    Q: { t: 'granitabar', solid: true, tall: true },
    U: { t: 'bartable', solid: true, tall: true },
    l: { t: 'barlamp', solid: true, tall: true },
    v: { t: 'vespa', solid: true },
    p: { t: 'postsign', solid: true, tall: true },
    L: { t: 'farol', solid: true, tall: true },
    T: { t: 'lemontree', solid: true, tall: true },
    n: { t: 'bench', solid: true },
    N: { t: 'net', solid: true },
    r: { t: 'lavarock', solid: true },
    i: { t: 'tuft' },
  },
  ground,
  objects,
};

/** The circolo dei pescatori: card tables, trophies, an espresso machine older than everyone. */
export const CIRCOLO_MAP: MapData = {
  id: 'circolo',
  name: 'Circolo dei Pescatori',
  spawn: [6, 8],
  spawnFacing: 'up',
  legend: {
    '.': { t: 'floorEarth' },
    '#': { t: 'wallInt', solid: true, tall: true },
    S: { t: 'shelf', solid: true, tall: true },
    R: { t: 'trofei', solid: true, tall: true },
    E: { t: 'macchina', solid: true, tall: true },
    T: { t: 'table', solid: true },
    s: { t: 'stool', solid: true },
    u: { t: 'rug' },
    m: { t: 'mat' },
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
    '#RR##SS###E###',
    '#            #',
    '# sTTs  sTTs #',
    '# sTTs  sTTs #',
    '#            #',
    '#     u      #',
    '#            #',
    '#            #',
    '#            #',
    '######m#######',
  ],
  triggers: [{ at: [6, 9], type: 'door', to: 'sicily', spawn: [29, 14], facing: 'down' }],
};
