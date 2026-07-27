import type { MapData } from '../../engine/grid';
import { cellHash } from '../../art/pix';

/**
 * A fictional village in the Valles Centrales of Oaxaca, late October. The
 * cempasucil fields are lit orange, the banda is practicing behind doors,
 * cohetes go off at hours nobody schedules, and the camposanto is being
 * swept for the night everyone is walking toward.
 */

const W = 46;
const H = 32;

/**
 * Casona anchors: 5x5 footprint, door at [+2,+4], casa-compatible grid. No
 * two of them stand on the same line: the street bends where the ground made
 * it bend, and the houses were built to the street, not to a ruler.
 */
const CASONAS: [number, number][] = [
  [4, 4],
  [12, 6],
  [18, 4],
  [26, 6], // the panaderia
  [33, 3], // Elias's workshop, loom out front
  [6, 16], // Dona Refugio's house, comal patio below
];

/** Doors that open: Refugio's kitchen. The rest hold banda practice. */
const OPEN_DOORS = new Set(['6,16']);

const inEll = (x: number, y: number, cx: number, cy: number, rx: number, ry: number) =>
  ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1;

/** Distance from a cell to a segment: the lanes here were walked, not drawn. */
function segDist(x: number, y: number, ax: number, ay: number, bx: number, by: number) {
  const dx = bx - ax;
  const dy = by - ay;
  const t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(x - (ax + dx * t), y - (ay + dy * t));
}

/** The main street: two rows the whole way, and never once on one line. */
const streetY = (x: number) => 13.5 + 0.85 * Math.sin((x + 4) / 5.5) + 0.3 * Math.sin(x / 2.1);

/** The plaza: an old atrio that grew lopsided around its own portales. */
const PLAZA: [number, number, number, number][] = [
  [21, 19.6, 7.6, 4.2],
  [16.5, 20.5, 4.6, 3.4],
  [26, 17.8, 4.2, 2.6],
];

/** The marigold way, strewn from the gate down to where the street takes over. */
const PETAL: [number, number, number, number][] = [
  [40, 1, 40.4, 6],
  [40.4, 6, 38.6, 11.6],
];

function groundAt(x: number, y: number): string {
  // The marigold way: petals from the camposanto gate down to the street.
  for (const [ax, ay, bx, by] of PETAL) if (segDist(x, y, ax, ay, bx, by) <= 0.7) return 'm';
  // Streets: the long one east to west, the one that climbs to the camposanto
  // road, and the one the colectivo grinds up from the valley floor.
  if (Math.abs(y - streetY(x)) <= 1.15 && x >= 2 && x <= 43) return '-';
  if (segDist(x, y, 24.4, 2, 23.6, 12) <= 0.9) return '-';
  if (segDist(x, y, 23.4, 24, 24.5, 29.6) <= 0.9) return '-';
  // The plaza with its portales.
  for (const [cx, cy, rx, ry] of PLAZA) if (inEll(x, y, cx, cy, rx, ry)) return 'P';
  // Refugio's swept-earth comal patio, worn pale where the women stand.
  if (inEll(x, y, 8.6, 22, 4.4, 2.0)) return 'f';
  // The cempasuchil field at the village edge, cut in rows the rows follow.
  if (inEll(x, y, 6, 28.2, 5.4, 2.8) || inEll(x, y, 10.5, 27, 3.2, 2.0)) return 'F';
  if (inEll(x, y, 39, 26, 5.0, 2.6)) return 'F';
  // Green where the rains were generous this year.
  if (inEll(x, y, 33.5, 26, 5.4, 3.0) || inEll(x, y, 29, 27.5, 3.0, 2.0)) return 'g';
  if (inEll(x, y, 7, 24.6, 6.0, 2.2)) return 'g';
  if (inEll(x, y, 40.5, 18.5, 5.0, 3.6) || inEll(x, y, 36.5, 21, 3.0, 2.4)) return 'g';
  if (inEll(x, y, 15.5, 27.5, 3.6, 2.2)) return 'g';
  return 's';
}

/**
 * The love layer: small true things clustered where life actually gathers,
 * doorways, the market lane, the patio, the road out. Nothing blocks a lane,
 * nothing sits at even spacing, and the colour lives out here in the objects:
 * the ground is dry earth all week, and this week the village is not.
 */
const PROPS = new Map<string, string>([
  // ---- the market lane, north side: the stalls stand in front of the houses
  ['10,11', 'V'], // the flower stand, first thing you meet and the loudest
  ['11,12', 'q'], // market crates: tomatillos, chiles, a pyramid of limes
  ['13,12', 'M'], // Eugenia's chile and cacao stall
  ['14,12', 'h'], // the chapulines basket at her elbow
  ['9,12', 'L'],
  ['17,12', 'B'], // barro negro, black as a wet stone
  ['20,12', 'Z'], // the rebozo rack, hung to be walked into
  ['21,11', 'u'], // the banda's tuba, on its own chair outside rehearsal
  ['27,12', 'p'], // the pan de muerto stall
  ['30,12', 'y'], // trays cooling in the doorway draft
  ['31,11', 'd'], // the street dog on the warm panaderia step
  ['32,12', 'L'],
  // ---- and the south side, where the market spills toward the plaza ----
  ['18,15', 'j'], // the carver's table of alebrijes, drying in the sun
  ['17,17', 'V'], // a second flower stand, backed against the arcade
  ['22,15', 'q'],
  ['26,15', 'S'], // the village sign, off the road where it can be read
  ['15,15', 'Z'],
  // ---- doorways: what each house put outside this morning ----
  ['5,9', 'A'], // agave piña resting by a door, eight years old
  ['13,11', 'W'], // papel picado still folded, waiting in a doorway
  ['10,6', 'R'], // the rotulista's half-finished sign between casonas
  ['9,7', 'K'],
  ['34,11', 'T'], // the telar, red cloth half born
  ['36,11', 'Z'],
  ['32,8', 'A'],
  ['23,3', 'N'], // corner nicho on the camposanto road
  ['26,2', 'K'],
  ['1,12', 'b'], // bougainvillea over the west wall
  ['44,16', 'b'], // bougainvillea over the east wall
  // ---- the plaza: the arcade, the correo, the tree everyone meets under ---
  ['28,18', 'E'], // correo counter under the portales
  ['14,19', 'n'],
  ['23,21', 'n'],
  ['16,18', 'L'],
  ['17,20', 'V'], // flowers sold in the plaza too, all week, by anyone
  ['18,21', 'q'],
  ['15,22', 'n'],
  ['26,20', 't'], // the plaza's own tree, off centre, older than the arcade
  ['25,22', 't'],
  ['13,22', 'L'],
  ['20,23', 'j'],
  // ---- Refugio's patio: the comal, the water, the metate, the broom ----
  ['7,22', 'c'], // Chela's comal
  ['5,20', 'J'], // Refugio's water cantaros in the shade
  ['10,23', 'e'], // the metate on Chela's patio
  ['11,23', 'Q'], // the patio broom, mid-shift
  ['11,21', 'v'],
  ['6,23', 'K'],
  ['3,18', 'l'], // hens auditing the ground
  ['4,19', 'l'],
  ['2,21', 't'],
  // ---- the field, the road out, and the paletero who works both ----
  ['11,26', 'K'], // cut cempasuchil bundles at the field edge
  ['12,27', 'K'],
  ['10,28', 'K'],
  ['13,25', 't'],
  ['8,25', 'V'], // the third flower stand, at the field gate itself
  ['23,28', 'X'], // the colectivo stop
  ['26,28', 'z'], // the paletero's bicycle cart near the colectivo
  ['27,26', 'l'],
  ['21,26', 'N'], // the roadside nicho, for whoever is travelling
  ['22,27', 'v'],
  ['20,25', 'K'],
  ['27,24', 't'],
  ['32,25', 't'],
  ['33,27', 'l'],
  ['30,23', 'A'],
  ['31,22', 'A'],
  ['43,19', 't'],
  ['41,22', 'A'],
  ['38,24', 'K'],
  ['39,23', 'K'],
  // ---- the camposanto road: petals, candles, bundles staged for tonight ---
  ['40,10', 'v'],
  ['41,6', 'v'],
  ['42,11', 'K'],
  ['41,15', 'K'],
  ['9,2', 't'],
  ['31,2', 't'],
  ['3,11', 't'],
]);

/** Papel picado, strung in runs so each string is one string, not four dots. */
const PAPEL = new Set([
  '15,13', '16,13', '17,13',
  '29,13', '30,13',
  '23,7', '24,7', '25,7',
  '19,18', '20,18', '21,18',
  '36,14', '37,14',
  '24,25',
]);

/** The portales: two contiguous arcades meeting at the plaza's north corner. */
const PORTALES = new Set([
  '18,16', '19,16', '20,16', '21,16', '22,16',
  '25,17', '26,17', '27,17', '28,17', '29,17',
]);

function objectAt(x: number, y: number): string {
  // Boundary adobe-and-stone wall; the camposanto arch parts the north side.
  if (y === 0 || y === H - 1 || x === 0 || x === W - 1) return 'o';
  if (x === 40 && y === 1) return 'G'; // the arch you walk under
  for (const [hx, hy] of CASONAS) {
    if (x >= hx && x < hx + 5 && y >= hy && y < hy + 5) {
      if (x === hx + 2 && y === hy + 4) return OPEN_DOORS.has(`${hx},${hy}`) ? ' ' : 'D';
      if (x === hx && y === hy + 4) return 'C';
      return 'x';
    }
  }
  const key = `${x},${y}`;
  if (PORTALES.has(key)) return 'a';
  if (PAPEL.has(key)) return 'w';
  const prop = PROPS.get(key);
  if (prop) return prop;
  // Dry-valley life, deterministic so it never shifts, and gathered along the
  // edges: weeds come up where one kind of ground gives way to another.
  if (groundAt(x, y) === 's') {
    const h = cellHash(x, y, 91);
    const edge =
      x <= 1 || x >= 44 || y <= 1 || y >= 30 ||
      groundAt(x + 1, y) !== 's' || groundAt(x - 1, y) !== 's' ||
      groundAt(x, y + 1) !== 's' || groundAt(x, y - 1) !== 's';
    if (edge && h < 0.12) return 'i';
    if (h > 0.988 && h < 0.994) return 'k'; // spent cohete sticks, obviously
    // A stone big enough to stub a toe never sits where feet actually go.
    const byRoad = [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => {
      const g = groundAt(x + (dx as number), y + (dy as number));
      return g === '-' || g === 'P';
    });
    if (edge && !byRoad && h > 0.982) return 'r';
  }
  return ' ';
}

function paint(w: number, h: number, gFn: (x: number, y: number) => string, oFn: (x: number, y: number) => string) {
  const ground: string[] = [];
  const objects: string[] = [];
  for (let y = 0; y < h; y++) {
    let g = '';
    let o = '';
    for (let x = 0; x < w; x++) {
      g += gFn(x, y);
      o += oFn(x, y);
    }
    ground.push(g);
    objects.push(o);
  }
  return { ground, objects };
}

const main = paint(W, H, groundAt, objectAt);

export const OAXACA_MAP: MapData = {
  id: 'oaxaca',
  name: 'San Isidro Guelazana',
  spawn: [24, 27],
  spawnFacing: 'up',
  triggers: [
    { at: [8, 20], type: 'door', to: 'cocina', spawn: [7, 8], facing: 'up' },
    { at: [40, 1], type: 'door', to: 'camposanto', spawn: [10, 12], facing: 'up' },
  ],
  smoke: [
    [28, 7],
    [8, 17],
  ],
  legend: {
    s: { t: 'dirt' },
    g: { t: 'grass' },
    P: { t: 'plaza' },
    '-': { t: 'path' },
    m: { t: 'petalpath' },
    F: { t: 'cempa' },
    f: { t: 'floorEarth' },
    o: { t: 'wallStone', solid: true, tall: true },
    C: { t: 'casona', solid: true, tall: true },
    x: { t: 'blocked', solid: true, tall: true },
    D: { t: 'doorShut', solid: true, tall: true },
    G: { t: 'campogate', tall: true },
    a: { t: 'portales', solid: true, tall: true },
    M: { t: 'stall', solid: true, tall: true },
    B: { t: 'barrostall', solid: true, tall: true },
    p: { t: 'panstall', solid: true, tall: true },
    T: { t: 'telar', solid: true, tall: true },
    E: { t: 'correo', solid: true, tall: true },
    S: { t: 'signpost', solid: true, tall: true },
    X: { t: 'colectivo', solid: true, tall: true },
    L: { t: 'farol', solid: true, tall: true },
    j: { t: 'alebrije', solid: true },
    c: { t: 'comal', solid: true },
    v: { t: 'veladora', solid: true },
    w: { t: 'papel', tall: true },
    n: { t: 'bench', solid: true },
    t: { t: 'tree', solid: true, tall: true },
    r: { t: 'rock', solid: true },
    i: { t: 'tuft' },
    A: { t: 'agavepina', solid: true },
    u: { t: 'tuba', solid: true, tall: true },
    W: { t: 'papelstack', solid: true },
    d: { t: 'streetdog', solid: true },
    y: { t: 'pantray', solid: true, tall: true },
    R: { t: 'rotulo', solid: true, tall: true },
    q: { t: 'mercadocrates', solid: true, tall: true },
    h: { t: 'chapulines', solid: true },
    N: { t: 'nicho', solid: true, tall: true },
    b: { t: 'bugambilia', solid: true, tall: true },
    J: { t: 'cantaros', solid: true },
    e: { t: 'metate', solid: true },
    Q: { t: 'escoba', solid: true },
    z: { t: 'paletas', solid: true, tall: true },
    K: { t: 'cempacut', solid: true },
    Z: { t: 'rebozos', solid: true, tall: true },
    V: { t: 'puestoflores', solid: true, tall: true },
    l: { t: 'gallina' },
    k: { t: 'cohete' },
    ' ': { t: 'void' },
  },
  ground: main.ground,
  objects: main.objects,
};

/** Refugio's kitchen and altar room: the ofrenda grows here all chapter. */
export const COCINA_MAP: MapData = {
  id: 'cocina',
  name: 'La Cocina de Refugio',
  spawn: [7, 8],
  spawnFacing: 'up',
  legend: {
    '.': { t: 'floorEarth' },
    '#': { t: 'wallInt', solid: true, tall: true },
    S: { t: 'shelf', solid: true, tall: true },
    O: { t: 'ofrenda', solid: true, tall: true },
    v: { t: 'veladora', solid: true },
    p: { t: 'pot', solid: true },
    T: { t: 'table', solid: true },
    s: { t: 'stool', solid: true },
    r: { t: 'rug' },
    m: { t: 'mat' },
    R: { t: 'ristra', solid: true, tall: true },
    j: { t: 'jicaras', solid: true },
    z: { t: 'cazuelas', solid: true },
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
    '##S########S##',
    '#p RvO  O vj #',
    '#z           #',
    '#            #',
    '#            #',
    '#   sTTTTs   #',
    '#            #',
    '#  r         #',
    '#            #',
    '#######m######',
  ],
  triggers: [{ at: [7, 9], type: 'door', to: 'oaxaca', spawn: [8, 21], facing: 'down' }],
};

/** The camposanto: swept graves, marigolds against the wall, candles. */
const CW = 20;
const CH = 14;

/**
 * The petal way, strewn by hand from the gate to the chapel, so it wanders
 * the way a person carrying a basket wanders.
 */
const CAMPO_PETAL: [number, number, number, number][] = [
  [10, 13.5, 10.2, 10],
  [10.2, 10, 11.6, 7.4],
  [11.6, 7.4, 13.4, 5.6],
];

function campoGround(x: number, y: number): string {
  for (const [ax, ay, bx, by] of CAMPO_PETAL) if (segDist(x, y, ax, ay, bx, by) <= 0.65) return 'm';
  // The marigold bed along the north wall, banked deeper where the gate is.
  if (y === 1 && x >= 2 && x <= 17) return 'F';
  if (y === 2 && (x === 4 || x === 5 || x === 10 || x === 11)) return 'F';
  // Grass where nobody has been buried yet, which is where the families sit.
  if (inEll(x, y, 3.5, 11.5, 3.4, 2.0) || inEll(x, y, 16.5, 9.5, 3.0, 2.4)) return 'g';
  return 's';
}

/**
 * The graves stand in families, not in ranks: a plot bought in 1902 and added
 * to ever since, then a gap where the ground is bad, then two on their own.
 * The open middle is not emptiness, it is where the whole village will sit.
 */
const TUMBAS: [number, number][] = [
  // the Soto plot, bought in 1902 and added to ever since
  [2, 3], [3, 3], [2, 4], [3, 5], [4, 5], [2, 6],
  // Epifania's people, three of them, shoulder to shoulder
  [6, 3], [7, 3], [6, 4],
  // and Bernardo's, who paid for the chapel and never stopped saying so
  [16, 4], [17, 4], [17, 5],
  // the Cruz side, under the wall where the ground is best
  [12, 3], [13, 4], [12, 5],
  // Serafin's brother and the two nobody claims any more
  [8, 8], [9, 8], [8, 7],
  // Chuy's grandmother, and his grandmother's sister beside her
  [13, 9], [14, 10], [13, 10],
  // the newest two, still raw, nearest the gate
  [5, 11], [6, 11],
  // and one on its own, older than the wall it leans toward
  [17, 11],
];

/** Cells the vigil needs kept clear: the families' own standing room. */
const CAMPO_KEEP = new Set(['11,6', '11,11', '6,5', '16,5', '12,6', '8,9', '12,9', '10,12', '10,13']);

const CAMPO_FIXED = new Map<string, string>([
  ['15,4', 'H'], // the Ramirez chapel, whitewashed every October by argument
  ['3,7', 'v'],
  ['7,5', 'v'],
  ['16,7', 'v'],
  ['14,12', 'v'],
  ['2,10', 't'],
  ['18,8', 't'],
  ['4,12', 'n'], // benches carried in for the vigil, facing their own rows
  ['15,12', 'n'],
  ['11,12', 'c'], // the petal costal by the gate
  ['9,4', 'B'], // whitewash bucket, lid off, brush across it
  ['9,5', 'Q'], // Meliton's slanted broom, exactly where he set it down
  ['3,2', 'K'], // cut marigolds below the wall row
  ['12,2', 'K'],
  ['13,3', 'K'],
]);

function campoObject(x: number, y: number): string {
  if (y === 0 || x === 0 || x === CW - 1) return 'o';
  if (y === CH - 1) return x === 10 ? ' ' : 'o';
  const key = `${x},${y}`;
  if (TUMBAS.some(([tx, ty]) => tx === x && ty === y)) return 'U';
  return CAMPO_FIXED.get(key) ?? ' ';
}

const campo = paint(CW, CH, campoGround, campoObject);

export const CAMPOSANTO_MAP: MapData = {
  id: 'camposanto',
  name: 'El Camposanto',
  spawn: [10, 12],
  spawnFacing: 'up',
  legend: {
    s: { t: 'dirt' },
    g: { t: 'grass' },
    m: { t: 'petalpath' },
    F: { t: 'cempa' },
    o: { t: 'wallStone', solid: true, tall: true },
    U: { t: 'tumba', solid: true },
    v: { t: 'veladora', solid: true },
    t: { t: 'tree', solid: true, tall: true },
    n: { t: 'bench', solid: true },
    c: { t: 'costal', solid: true },
    B: { t: 'cubeta', solid: true },
    Q: { t: 'escoba', solid: true },
    K: { t: 'cempacut', solid: true },
    H: { t: 'capilla', solid: true, tall: true },
    ' ': { t: 'void' },
  },
  ground: campo.ground,
  objects: campo.objects,
  triggers: [{ at: [10, 13], type: 'door', to: 'oaxaca', spawn: [40, 2], facing: 'down' }],
};

/**
 * A candle at the foot of every grave, on the night. Derived from the graves
 * themselves so the two can never drift apart, and filtered so no family
 * loses the tile it stands on.
 */
export const CAMPO_VIGIL_CELLS: [number, number][] = (() => {
  const out: [number, number][] = [];
  const taken = new Set<string>();
  for (const [x, y] of TUMBAS) {
    for (const [cx, cy] of [[x, y + 1], [x + 1, y], [x - 1, y]] as [number, number][]) {
      const key = `${cx},${cy}`;
      if (taken.has(key) || CAMPO_KEEP.has(key)) continue;
      if (cx < 1 || cy < 1 || cx > CW - 2 || cy > CH - 2) continue;
      if (campoObject(cx, cy) !== ' ') continue;
      taken.add(key);
      out.push([cx, cy]);
      break;
    }
  }
  return out;
})();
