import type { MapData } from '../../engine/grid';
import { cellHash } from '../../art/pix';

/**
 * The sicily chapter: a fictional fishing town on Sicily's east coast, in the
 * Aci Trezza tradition. Lava-black shoreline, the faraglioni standing offshore,
 * lemon terraces above the roofs, and 'a Muntagna presiding out of frame.
 * Summer; the light is a hammer until the passeggiata hour softens it.
 *
 * The town is not laid out on a ruler. It grew along a contour: the sea edge
 * wanders, the piazza is a lopsided apron in front of the chiesa, the lanes
 * meet it at the angles the ground allowed, and the old flow still shoulders
 * up through the paving where the flow actually went.
 */

const W = 46;
const H = 30;

/** Casedda anchors: 5x5 footprint, door at [+2,+4], the shared casa grid. */
const CASEDDE: [number, number][] = [
  [2, 1],
  [9, 1],
  [26, 1],
  [2, 14],
  [11, 9], // the block that gives the piazza its west wall
  [22, 14], // and the one the piazza has to go around to reach the water
  [27, 9], // the circolo dei pescatori
];

/** Doors that open: only the circolo. The rest are lives, latched. */
const OPEN_DOORS = new Set(['27,9']);

/** The chiesa facade owns these cells; anchor at (20,6). */
const CHURCH = new Set(['19,5', '20,5', '21,5', '19,6', '21,6']);

/**
 * The coast, authored row by row: the first column that is water. Two points
 * and a bay between them, then the shore swinging away south-east of the mole.
 */
const SHORE = [
  38, 38, 37, 36, 36, 37, 38, 38, 37, 36,
  35, 35, 36, 37, 37, 37, 36, 35, 34, 33,
  33, 34, 34, 33, 32, 31, 30, 29, 28, 27,
];

/**
 * ...and the same coast turning west along the bottom of the frame: the first
 * row that is water, column by column. 30 means the water never gets there.
 */
const COAST = [
  30, 30, 30, 29, 29, 29, 28, 28, 29, 29,
  28, 28, 27, 27, 26, 26, 26, 25, 25, 25,
  25, 24, 24, 24, 24, 23, 23, 23, 23, 22,
  22, 22, 22, 22, 22, 22, 22, 22, 22, 22,
  22, 22, 22, 22, 22, 22,
];

/** The mole: a built thing, so it is straight, with a fat head at the end. */
const onMole = (x: number, y: number) =>
  ((y === 19 || y === 20) && x >= 33 && x <= 42) || (y === 18 && x >= 40 && x <= 42) || (y === 21 && x >= 40 && x <= 42);

const isSea = (x: number, y: number) =>
  !onMole(x, y) && (x >= (SHORE[y] ?? 46) || y >= (COAST[x] ?? 30));

/** How far the water is, in tiles, by the nearer of the two coasts. */
const fromSea = (x: number, y: number) => Math.min((SHORE[y] ?? 46) - x, (COAST[x] ?? 30) - y);

const inEll = (x: number, y: number, cx: number, cy: number, rx: number, ry: number) =>
  ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1;

/** Distance from a cell to a segment: lanes are drawn, not ruled into rows. */
function segDist(x: number, y: number, ax: number, ay: number, bx: number, by: number) {
  const dx = bx - ax;
  const dy = by - ay;
  const t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(x - (ax + dx * t), y - (ay + dy * t));
}

/** The piazza: three overlapping aprons, widest under the chiesa steps. */
const PIAZZA: [number, number, number, number][] = [
  [20.5, 11.4, 8.4, 4.8],
  [15.6, 15.4, 5.4, 3.0],
  [25.4, 8.6, 4.6, 2.4],
  [24.5, 15.4, 5.6, 2.9], // the corner that pours down toward the water
  [20.2, 17.4, 4.6, 2.3], // and the last few steps of it, onto the lungomare
];

/** Lanes, as the ground allowed them: ax, ay, bx, by, half width. */
const LANES: [number, number, number, number, number][] = [
  [20, 6.6, 20.4, 9.5, 2.1], // the chiesa steps pouring into the piazza
  [12.6, 14.6, 7.4, 19.4, 1.5], // the diagonal lane down to the lungomare
  [12.2, 8.8, 8.4, 6.2, 1.2], // the lane climbing between the casedde
  [28.2, 13.6, 31.6, 18.4, 1.4], // the lane out to the pescheria corner
  [10.5, 6.4, 30.5, 7.4, 1.15], // the street behind the piazza, off true by a tile
];

/** The lungomare: two rows wide the whole way, but never on one line. */
const lungoY = (x: number) => 19.6 + 0.55 * Math.sin((x + 3) / 6.4);

function groundAt(x: number, y: number): string {
  if (isSea(x, y)) return 'S';
  if (onMole(x, y)) return 'b';
  // The tongue of lava that came down ahead of the town and never left: it
  // shoulders up through the lungomare, and the paving simply stops at it.
  if (inEll(x, y, 19, 21.4, 3.0, 2.8)) return 'h';
  // The lungomare: a built edge, so it holds its two rows against the shore.
  if (Math.abs(y - lungoY(x)) <= 1.2) return 'b';
  // The slipway, cut down the beach at the angle a hull wants to be dragged.
  if (segDist(x, y, 10.6, 20.5, 13.4, 24.8) <= 0.85) return 'b';
  // Black sand and old flow: a strip along the water, wide where the boats
  // are hauled out, pinched to nothing under the north point.
  const beach = 2.6 + 2.4 * Math.max(0, Math.min(1, (y - 8) / 12));
  if (fromSea(x, y) <= beach) return 'h';
  if (inEll(x, y, 22.5, 23.5, 3.4, 2.2) || inEll(x, y, 6, 25.5, 9.5, 4.6)) return 'h';
  // The piazza the lungomare hangs off, and the lanes that feed it.
  for (const [cx, cy, rx, ry] of PIAZZA) if (inEll(x, y, cx, cy, rx, ry)) return 'b';
  for (const [ax, ay, bx, by, w] of LANES) if (segDist(x, y, ax, ay, bx, by) <= w) return 'b';
  // The lemon terraces: the only green, held up by lava-stone walls.
  if (inEll(x, y, 4.6, 10, 3.8, 3.6) || inEll(x, y, 3.4, 12.8, 2.6, 2.2)) return 'g';
  if (inEll(x, y, 17.5, 2.4, 4.6, 2.4) || inEll(x, y, 23, 2, 3.4, 2.6)) return 'g';
  return 'd';
}

/**
 * The rock does not fall evenly. It piles where the flow broke: reefs off the
 * point, a spill under the lava tongue, a scatter at the foot of the mole.
 */
const REEFS: [number, number, number][] = [
  [35.5, 2.5, 3.4],
  [33.5, 6.5, 2.4],
  [21.5, 23.5, 3.2],
  [16.5, 22.5, 2.2],
  [30.5, 21.5, 2.6],
  [6, 27, 3.4],
  [11.5, 25.5, 2.0],
];

function rockAt(x: number, y: number): boolean {
  if (y === 19 || y === 20) return false; // the passeggiata crosses, always
  for (const [cx, cy, r] of REEFS) {
    const d = Math.hypot(x - cx, y - cy) / r;
    if (d <= 1 && cellHash(x, y, 71) < 0.44 - d * 0.34) return true;
  }
  return false;
}

/** Cells the rock and the tufts must leave open: homes, seats, routes. */
const RESERVED = new Set(['34,16', '34,15', '34,17', '33,21', '33,19', '33,20', '12,25', '13,25']);

/**
 * Everything the town leaves lying about, placed by hand and in clusters:
 * three things together, then a gap, then one thing on its own.
 */
const PROPS = new Map<string, string>([
  // ---- the piazza: the fountain first, off the chiesa's axis on purpose ----
  ['22,10', 'Y'], // the fountain, running since before anyone's grandmother
  ['24,11', 'n'], // one bench turned to watch it, squared to nothing
  ['18,7', 'A'], // parish notices, pinned where everyone must pass them
  ['23,7', 'e'], // the votive edicola on the far side of the steps
  ['25,9', 'm'], // a testa di moro carried out one spring and never carried back
  ['17,11', 'v'], // a vespa parked across the corner of the paving
  ['16,14', 'l'], // the bar's lamp on its post, out where the tables end
  ['26,13', 'c'], // the circolo's chair, angled at the door it came out of
  ['25,13', 'a'], // and the cat that inherited the fruit bowl beside it
  ['16,9', 'k'], // crates against the corner of the block, in from the terraces
  ['16,10', 'k'],
  ['13,14', 'c'], // the chair by the new block's door, and the pot beside it
  ['12,14', 'k'],
  ['19,13', 'n'], // the bench everyone means when they say the bench
  ['18,15', 'k'], // somebody's crates, a chair, and the cat that came with them
  ['17,16', 'c'],
  ['19,16', 'a'],
  // the granita bar, and the tables that wander off downhill from it
  ['11,15', 'Q'],
  ['13,16', 'U'],
  ['14,17', 'U'],
  ['10,17', 'U'],
  ['9,16', 'c'], // a kitchen chair holding the shade for its owner
  ['8,15', 'a'], // the cat, in the fruit bowl, on the step
  // ---- the poste corner, on the paving that pours down to the water ----
  ['27,17', 'p'],
  ['28,17', 'n'],
  ['28,15', 'L'],
  // ---- the pescheria corner: the stall, its crates, its nets ----
  ['31,17', 'M'],
  ['30,18', 'K'],
  ['32,18', 'K'],
  ['30,16', 'K'],
  ['32,17', 'N'],
  // ---- laundry: strung over the alley, the street, and the passeggiata ----
  ['7,3', 'H'],
  ['8,3', 'H'],
  ['8,19', 'H'],
  ['9,19', 'H'],
  ['10,19', 'H'],
  ['14,6', 'H'],
  ['15,6', 'H'],
  ['16,6', 'H'],
  ['24,6', 'H'],
  ['25,6', 'H'],
  // ---- the boys' corner behind the houses, and the flow beyond it ----
  ['32,1', 'w'], // the chalk goal on the north wall, score still under dispute
  ['33,7', 'k'],
  ['35,5', 'f'],
  ['36,7', 'f'],
  ['12,6', 'c'],
  ['29,6', 'a'],
  // ---- the west terrace: lemons, tomatoes, the wall that holds it up ----
  ['3,9', 'T'],
  ['6,8', 'T'],
  ['5,10', 'T'],
  ['2,12', 'T'],
  ['7,11', 'T'],
  ['7,13', 'k'],
  ['6,14', 'k'],
  ['7,16', 'P'], // tomatoes drying beside Nonna Concetta's lane
  ['5,17', 'P'],
  ['3,19', 'm'], // teste di moro flanking the seafront casedda's door
  ['5,19', 'm'],
  // ---- the terrace over the roofs, planted the year the road came ----
  ['15,2', 'T'],
  ['16,4', 'T'],
  ['21,1', 'T'],
  ['24,3', 'T'],
  ['25,1', 'T'],
  // ---- the lungomare: a bench where the view is, a lamp where it is not ----
  ['16,18', 'n'],
  ['23,18', 'n'],
  ['13,18', 'L'],
  ['6,18', 'L'],
  ['28,21', 'L'],
  ['21,22', 'f'], // prickly pear rooted in the flow that crosses the walk
  ['17,23', 'f'],
  // ---- the working shore: the slipway, the hauled boats, the drying nets ----
  ['15,22', 'V'],
  ['16,24', 'V'],
  ['9,23', 'V'],
  ['9,26', 'N'], // one net spread wide for mending, and one still bundled
  ['10,26', 'N'],
  ['13,24', 'N'],
  ['14,23', 'k'],
  ['10,27', 'f'],
  ['3,23', 'V'],
  ['4,25', 'k'],
  ['6,22', 'P'], // a tomato frame, moved down out of the wind
  ['7,21', 'c'],
  // ---- the mole: its head, its lamp, its cargo ----
  ['41,18', 'L'],
  ['40,18', 'N'],
  ['41,21', 'N'],
  ['42,21', 'k'],
  ['33,21', 'k'], // the cooperative's lemons, waiting for Patanè's ship
  ['32,21', 'k'],
  // ---- the water: the faraglioni in their own myth, and boats riding ----
  ['38,9', 'F'],
  ['41,11', 'F'],
  ['38,15', 'F'],
  ['43,4', 'F'],
  ['36,13', 'V'],
  ['38,22', 'V'],
  ['31,25', 'V'],
]);

function objectAt(x: number, y: number): string {
  // Boundary: walls behind the town, lava rock where the beach runs out.
  if (isSea(x, y)) return PROPS.get(`${x},${y}`) ?? ' ';
  if (y === 0) return 'o';
  if (y === H - 1) return 'r';
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
  const prop = PROPS.get(`${x},${y}`);
  if (prop) return prop;
  const g = groundAt(x, y);
  if (g === 'h' && !RESERVED.has(`${x},${y}`) && rockAt(x, y)) return 'r';
  if (g === 'g') {
    // Windfall lemons under the trees, dry tufts along the terrace wall.
    if (cellHash(x, y, 73) < 0.14) return 'z';
    if (cellHash(x, y, 72) < 0.1) return 'i';
  }
  return ' ';
}

/**
 * Rock that falls in a ring can leave a pocket of sand nobody can step into.
 * A pocket inside a reef is simply more reef, so fill it: the flood fill in
 * the test suite is the same walk, and this keeps the shore honest by
 * construction instead of by hand-checked coordinates.
 */
function sealPockets(ground: string[], objects: string[]) {
  const walkThrough = new Set([' ', 'i', 'z', 'w', 'H']);
  const solid = (x: number, y: number) =>
    ground[y]?.[x] === 'S' || !walkThrough.has(objects[y]?.[x] ?? ' ');
  const seen = new Set<string>();
  const queue: [number, number][] = [[40, 20], [29, 13]];
  for (const [x, y] of queue) seen.add(`${x},${y}`);
  while (queue.length) {
    const [x, y] = queue.shift() as [number, number];
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
      const k = `${nx},${ny}`;
      if (seen.has(k) || solid(nx, ny)) continue;
      seen.add(k);
      queue.push([nx, ny]);
    }
  }
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (solid(x, y) || seen.has(`${x},${y}`)) continue;
      objects[y] = `${objects[y]?.slice(0, x)}r${objects[y]?.slice(x + 1)}`;
    }
  }
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
  sealPockets(ground, objects);
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
    k: { t: 'lemoncrate', solid: true },
    m: { t: 'testadimoro', solid: true, tall: true },
    e: { t: 'edicola', solid: true, tall: true },
    f: { t: 'fichidindia', solid: true, tall: true },
    c: { t: 'nonnachair', solid: true },
    a: { t: 'gattu', solid: true },
    w: { t: 'campetto', tall: true },
    P: { t: 'pomodori', solid: true, tall: true },
    A: { t: 'avvisi', solid: true, tall: true },
    z: { t: 'limoni' },
    Y: { t: 'fontana', solid: true, tall: true },
    H: { t: 'bucato', tall: true },
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
    B: { t: 'lavagna', solid: true, tall: true },
    f: { t: 'ventola', solid: true, tall: true },
    Y: { t: 'banco', solid: true, tall: true },
    O: { t: 'lampadario', tall: true },
    N: { t: 'net', solid: true },
    k: { t: 'lemoncrate', solid: true },
    c: { t: 'nonnachair', solid: true },
    a: { t: 'gattu', solid: true },
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
  // The club has a serving side and a sitting side, and they are not the
  // same half of the room. The bar runs along the north-west under the
  // trophies; the one bulb hangs over the scopa table, which is where the
  // eye goes and where the argument is; the cooperative's lemon crates and
  // the fan live down by the door, so you come in past somebody's business.
  objects: [
    '##RR#S###BS###',
    '#EYYY        #',
    '# s  O       #',
    '#   TT       #',
    '#  uTT s   c #',
    '# uus    TTs #',
    '#         k  #',
    '#N   f    kk #',
    '#N       a   #',
    '######m#######',
  ],
  triggers: [{ at: [6, 9], type: 'door', to: 'sicily', spawn: [29, 14], facing: 'down' }],
};
