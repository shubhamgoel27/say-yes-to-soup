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

/** Casona anchors: 5x5 footprint, door at [+2,+4], casa-compatible grid. */
const CASONAS: [number, number][] = [
  [4, 5],
  [12, 5],
  [18, 5],
  [26, 5], // the panaderia
  [33, 5], // Elias's workshop, loom out front
  [6, 16], // Dona Refugio's house, comal patio below
];

/** Doors that open: Refugio's kitchen. The rest hold banda practice. */
const OPEN_DOORS = new Set(['6,16']);

function groundAt(x: number, y: number): string {
  // The marigold way: petals from the camposanto gate down to the street.
  if (x === 40 && y >= 1 && y <= 12) return 'm';
  // Streets.
  if (y === 13 && x >= 2 && x <= 43) return '-';
  if (x === 24 && ((y >= 2 && y <= 12) || y === 14 || y === 15 || (y >= 24 && y <= 29))) return '-';
  // The plaza with its portales.
  if (x >= 14 && x <= 28 && y >= 16 && y <= 23) return 'P';
  // Refugio's swept-earth comal patio.
  if (x >= 5 && x <= 12 && y >= 21 && y <= 23) return 'f';
  // The cempasuchil field at the village edge.
  if (x >= 2 && x <= 10 && y >= 26 && y <= 30) return 'F';
  // Green where the rains were generous this year.
  if (x >= 30 && x <= 38 && y >= 24 && y <= 28) return 'g';
  if (x >= 2 && x <= 12 && y >= 23 && y <= 25) return 'g';
  if (x >= 36 && x <= 44 && y >= 16 && y <= 22) return 'g';
  return 's';
}

/**
 * The love layer: small true things clustered where life actually gathers,
 * doorways, the market lane, the patio, the road out. Nothing blocks a lane.
 */
const EXTRAS = new Map<string, string>([
  ['5,10', 'A'], // agave piña resting by a door, eight years old
  ['21,10', 'u'], // the banda's tuba, on its own chair outside rehearsal
  ['13,10', 'W'], // papel picado still folded, waiting in a doorway
  ['27,10', 'd'], // the street dog on the warm panaderia step
  ['30,10', 'y'], // pan de muerto trays cooling by the bakery
  ['10,7', 'R'], // the rotulista's half-finished sign between casonas
  ['12,12', 'q'], // market crates: tomatillos and chiles
  ['14,12', 'h'], // the chapulines basket at the stall's elbow
  ['23,3', 'N'], // corner nicho on the camposanto road
  ['1,12', 'b'], // bougainvillea over the west wall
  ['44,15', 'b'], // bougainvillea over the east wall
  ['5,20', 'J'], // Refugio's water cantaros in the shade
  ['10,23', 'e'], // the metate on Chela's patio
  ['12,23', 'Q'], // the patio broom, mid-shift
  ['26,28', 'z'], // the paletero's bicycle cart near the colectivo
  ['11,27', 'K'], // cut cempasuchil bundles at the field edge
  ['12,28', 'K'],
  ['42,12', 'K'], // bundles staged by the camposanto lane
  ['3,18', 'l'], // hens auditing the ground
  ['33,26', 'l'],
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
  // The market lane along the main street.
  if (x === 13 && y === 12) return 'M'; // the chile and cacao stall
  if (x === 17 && y === 12) return 'B'; // barro negro pottery
  if (x === 27 && y === 12) return 'p'; // the pan de muerto stall
  // Plaza furniture: portales row, benches, farol, the post office counter.
  if (y === 16 && (x === 15 || x === 17 || x === 19 || x === 21 || x === 26 || x === 28)) return 'a';
  if ((x === 18 && y === 19) || (x === 26 && y === 21)) return 'n';
  if ((x === 10 || x === 30) && y === 12) return 'L';
  if (x === 14 && y === 22) return 'L';
  if (x === 28 && y === 17) return 'E'; // correo counter under the portales
  if (x === 25 && y === 14) return 'S'; // the village sign
  if (x === 16 && y === 24) return 'j'; // the alebrije table
  if (x === 23 && y === 28) return 'X'; // the colectivo stop
  if (x === 7 && y === 22) return 'c'; // Chela's comal
  if (x === 36 && y === 11) return 'T'; // the telar, red cloth half born
  // Veladoras: small lights left where the path will need them.
  if ((x === 39 && y === 12) || (x === 41 && y === 6) || (x === 11 && y === 21)) return 'v';
  // Papel picado strings across streets and plaza.
  const papel = new Set(['16,13', '22,13', '28,13', '34,13', '24,7', '24,15', '20,17', '24,25']);
  if (papel.has(`${x},${y}`)) return 'w';
  // Trees: jacaranda shade and bougainvillea climbing the walls.
  const trees = new Set(['3,11', '31,15', '43,18', '12,25', '33,25', '9,2', '31,2', '3,24']);
  if (trees.has(`${x},${y}`)) return 't';
  const extra = EXTRAS.get(`${x},${y}`);
  if (extra) return extra;
  // Sparse dry-valley life, deterministic so it never shifts.
  if (groundAt(x, y) === 's') {
    const h = cellHash(x, y, 91);
    if (h < 0.04) return 'i';
    if (h > 0.986 && h < 0.993) return 'k'; // spent cohete sticks, obviously
    if (h > 0.995) return 'r';
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
    [28, 6],
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

function campoGround(x: number, y: number): string {
  if (x === 10 && y >= 2 && y <= 13) return 'm';
  if (y === 1 && x >= 2 && x <= 17) return 'F';
  return 's';
}

function campoObject(x: number, y: number): string {
  if (y === 0 || x === 0 || x === CW - 1) return 'o';
  if (y === CH - 1) return x === 10 ? ' ' : 'o';
  const tumbas = new Set(['3,4', '5,4', '7,4', '13,4', '15,4', '17,4', '3,7', '5,7', '7,7', '13,7', '15,7', '17,7', '4,10', '6,10', '14,10', '16,10']);
  if (tumbas.has(`${x},${y}`)) return 'U';
  const velas = new Set(['4,5', '14,5', '6,8', '16,8', '9,10', '11,10']);
  if (velas.has(`${x},${y}`)) return 'v';
  if ((x === 2 && y === 11) || (x === 17 && y === 11)) return 't';
  // Benches for the vigil: brought out each year, facing the family rows.
  if ((x === 4 && y === 12) || (x === 15 && y === 12)) return 'n';
  // The caretaker's working corner: whitewash, broom, the costal of petals.
  if (x === 12 && y === 12) return 'c'; // the petal costal by the gate
  if (x === 8 && y === 7) return 'B'; // whitewash bucket between graves
  if (x === 18 && y === 3) return 'Q'; // Melitón's slanted broom
  if (x === 3 && y === 2) return 'K'; // cut marigolds below the wall row
  return ' ';
}

const campo = paint(CW, CH, campoGround, campoObject);

export const CAMPOSANTO_MAP: MapData = {
  id: 'camposanto',
  name: 'El Camposanto',
  spawn: [10, 12],
  spawnFacing: 'up',
  legend: {
    s: { t: 'dirt' },
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
    ' ': { t: 'void' },
  },
  ground: campo.ground,
  objects: campo.objects,
  triggers: [{ at: [10, 13], type: 'door', to: 'oaxaca', spawn: [40, 2], facing: 'down' }],
};
