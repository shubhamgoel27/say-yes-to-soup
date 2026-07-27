import type { MapData } from '../../engine/grid';
import { cellHash } from '../../art/pix';

/**
 * La Caleta: a fictional fishing village on the Peruvian north coast, in the
 * Huanchaco tradition. Desert dunes behind, a cold rich sea in front, and a
 * pier from the old sugar days walking out into it. Green happens exactly
 * twice: the totora ponds, and nowhere else.
 *
 * The two strongest lines here are the malecón and the water, so neither of
 * them is allowed to be straight: the promenade widens into aprons and thins
 * to a walkway, and the beach runs out into spits and gets bitten into coves.
 */

const W = 48;
const H = 34;

/**
 * Casa anchors: 5x5 footprint, door at [+2,+4], same grid as the highlands.
 * The four along the dune stand at four different setbacks, because a street
 * where every house steps back the same distance is a drawing of a street.
 */
const CASAS: [number, number][] = [
  [10, 4],
  [17, 6],
  [26, 5],
  [34, 3],
  [2, 15],
  [16, 14], // the picantería
  [30, 16], // the harbor office
];

/** Doors that open: the picantería. The rest are lives, latched. */
const OPEN_DOORS = new Set(['16,14']);

const inPier = (x: number, y: number) => (x === 22 || x === 23) && y >= 22 && y <= 30;

/**
 * The promenade's northern edge, x by x. It bellies out into an apron in front
 * of the harbor office where the boats are met, holds two rows down most of
 * the village, and thins to a single walkway at the eastern end where the
 * dune comes down to the water.
 */
function maleconTop(x: number): number | null {
  if (x < 3 || x > 43) return null;
  if (x <= 7) return 22;
  if (x <= 13) return 21;
  if (x <= 17) return 22;
  if (x <= 20) return 21;
  if (x <= 25) return 22;
  if (x <= 29) return 20;
  if (x <= 34) return 22;
  if (x <= 38) return 21;
  return 23;
}

/**
 * And its seaward edge, which is a wall in some places, a slipway stepping
 * down onto the sand in others, and in one stretch simply gone, because the
 * dune came over it in a bad winter and nobody has argued with that yet.
 */
function maleconBot(x: number): number {
  if (x <= 6) return 23;
  if (x <= 10) return 24;
  if (x <= 16) return 23;
  if (x <= 21) return 24;
  if (x <= 26) return 23;
  if (x <= 30) return 22;
  if (x <= 36) return 23;
  return 24;
}

/**
 * The water line, x by x, moving one row at a time. Two sand spits run out
 * where the current drops what it is carrying (the caballito ground in the
 * west, the boat ground in the east) and the sea takes a bite out of the
 * beach on the far side of the pier.
 */
const SEA_TOP = [
  30, 30, 29, 29, 29, 30, 30, 31, 31, 31, 31, 31, 30, 30, 30, 29,
  29, 29, 29, 29, 30, 30, 30, 30, 29, 28, 28, 28, 29, 29, 30, 30,
  31, 31, 31, 31, 31, 30, 30, 30, 29, 29, 29, 30, 30, 30, 30, 30,
];

const seaTop = (x: number): number => SEA_TOP[x] ?? 30;

/**
 * The swept yard between the two western houses: packed earth kept clear on
 * purpose, because nets get laid out flat here and sand is no help at all.
 */
function inYard(x: number, y: number): boolean {
  const dx = (x - 13.5) / 3.4;
  const dy = (y - 10.2) / 2;
  return dx * dx + dy * dy <= 1;
}

/** The totora ponds: an oval of open water in a ring of green in the desert. */
function pond(x: number, y: number): number {
  const dx = (x - 43) / 3.4;
  const dy = (y - 6.4) / 2.6;
  return dx * dx + dy * dy;
}

/**
 * The love layer: hand-placed working clutter, clustered the way life clusters
 * (doors, corners, the pier root, the water line) and never on one line with
 * itself. Keys are "x,y".
 */
const PROPS: Record<string, string> = {
  // Upper village: the road in, the dune ridge, the pond edge.
  '5,10': 'X', // the mototaxi, parked at its owner's angle
  '6,11': 'U', // drums by the road, painted the year the boat was
  '5,13': 't', // crab traps stacked in the wall's shade
  '4,9': 'p', // one net pole up on the dune, out of everyone's way
  '20,2': 'p', // and one on the ridge, the highest thing in the village
  '36,1': 'G', // gallinazos on the dune ridge, supervising
  '39,5': 'T', // totora bundles drying by the ponds
  '40,10': 'T',
  '41,10': 'T',
  '44,11': 'T',
  // The alleys between the dune houses, where the boats live out of the surf.
  '15,6': 'c', // caballitos stood on end against a gable to drain
  '15,7': 'c',
  '25,8': 'c', // and one on its own, leaning where its owner can see it
  '16,9': 'b', // buoys hung on the alley wall
  '9,4': 'b', // and a wall of them where the road comes in
  '11,10': 'T', // totora carried up from the ponds, drying on the swept yard
  '12,11': 'T',
  '15,11': 'W', // the shell barrow, parked out of the wind
  '23,4': 'Y', // one salt rack up on the dune, catching the first sun
  '35,11': 'p',
  '13,13': 'U',
  '22,13': 'n', // a bench facing down the street toward the pier
  '31,10': 'Y', // salt racks up where the sun gets at them all day
  '32,11': 'Y',
  // The picantería's orbit: chairs, shells, buoys, the cat.
  '15,18': 'b', // buoys on the seaward wall
  '21,16': 'b', // and more of them, on the wall opposite
  '14,19': 'W', // the shell wheelbarrow
  '20,19': 'H', // stacked plastic chairs
  '17,19': 'z', // the cat, where the fish smell is best
  '7,18': 'm', // the school kids' mural of la mar
  // The malecón, nothing on the walking row: sign, lamps, benches, stalls,
  // the emoliente man's whole establishment, and the crates that come off
  // the boats. Three heights, three rows, no two at the same spacing.
  '10,21': 'g', // the village sign
  '12,21': 'L',
  '26,20': 'L',
  '35,22': 'L',
  '14,22': 'n',
  '31,22': 'n',
  '27,21': 'M', // Marisol's fish stall
  '29,21': 'h', // the harbor office counter, out on the apron
  '25,22': 'K', // fish crates at the pier root
  '26,21': 't', // crab traps stacked against them
  '33,22': 'U', // drums and crates, painted against the salt
  '37,21': 'e', // the emoliente cart
  '38,22': 'Q', // Don Wili's spare bottle crate
  '42,21': 'Y', // the last salt rack, on its own where the promenade runs out
  '43,19': 't', // traps nobody has come back for
  '5,21': 'U', // and drums at the other end, holding the west corner down
  // Salt racks, set back off the promenade where the sun gets at them.
  '25,20': 'Y',
  '26,19': 'Y',
  '29,19': 'Y',
  // The beach: gear at rest, and the boat that is being made beautiful again.
  '7,25': 'F', // the driftwood bench, facing the water
  '8,26': 'I', // the boat up on trestles, half repainted, tins open
  '11,27': 'p', // nets drying on poles, west beach
  '12,28': 'p',
  '41,25': 'p', // and one pole on its own in the east
  '21,24': 'E', // the pelican's post
  '27,25': 'V', // the tarpaulin the fish get cleaned under
  '28,25': 'N', // nets, spread where the shade ends
  '19,27': 'N',
  '18,26': 'N',
  '31,24': 'G', // more gallinazos, nearer the racks
  '30,26': 'B', // boats drawn up, two together and one apart
  '31,27': 'B',
  '36,27': 'B',
  '26,27': 'A',
  '38,27': 'A',
  '37,28': 'A',
  '40,25': 'p',
  '17,28': 'J', // one stranded jellyfish, tide's own still life
  '23,30': 'j', // the sign at the end of the pier
};

/**
 * Caballitos de totora stood on their tails to drain. Not a fence: a trio
 * leaning together, a pair further along, and one on its own at the end,
 * none of them agreeing on which row to stand in.
 */
const CABALLITOS = new Set(['9,25', '10,26', '11,25', '15,26', '16,25', '20,26']);

/** Reeds standing out of the shallows, where they are already solid water. */
const REEDS = new Set(['41,6', '43,5', '45,6', '43,8', '42,7']);

const isBeach = (x: number, y: number) => y >= 24 && y < seaTop(x) && !inPier(x, y);

function groundAt(x: number, y: number): string {
  if (inPier(x, y) && y >= 24) return 'k';
  // The malecón: a paved promenade above the beach, never the same width for
  // more than a few strides, and never the same edge either.
  const mt = maleconTop(x);
  if (mt !== null && y >= mt && y <= maleconBot(x)) return 'P';
  if (y >= seaTop(x)) return 'S';
  if (y === seaTop(x) - 1) return 'u';
  if (y >= 24) return 's';
  // The totora ponds at the desert's edge.
  const p = pond(x, y);
  if (p <= 0.55) return 'w';
  if (p <= 1) return '.';
  if (p <= 1.7) return 'd';
  // Streets: hard-packed sand. The road in from La Bajada arrives three tiles
  // wide, the way the pass above it does, and narrows once it is in the village.
  if (x >= 7 && x <= 9 && y >= 1 && y <= 3) return '-';
  if (x === 8 && y >= 1 && y <= 21) return '-';
  if (x >= 7 && x <= 9 && y >= 5 && y <= 7) return '-'; // the passing place
  if (x >= 8 && x <= 10 && y >= 16 && y <= 18) return '-';
  if (y === 12 && x >= 2 && x <= 45) return '-';
  if (x === 24 && y >= 13 && y <= 21) return '-';
  // The street's shoulders, worn wide wherever people stop to talk in it.
  if (y === 11 && x >= 5 && x <= 8) return '-';
  if (y === 13 && x >= 13 && x <= 17) return '-';
  if (y === 11 && x >= 26 && x <= 29) return '-';
  if (y === 13 && x >= 37 && x <= 41) return '-';
  if (inYard(x, y)) return 'd';
  // Each door keeps its own alley down to the nearest public thing: the
  // street for the dune houses, the promenade for the ones below it.
  for (const [hx, hy] of CASAS) {
    if (x !== hx + 2) continue;
    if (hy < 12) {
      if (y > hy + 4 && y <= 11) return '-';
    } else if (y >= hy + 4 && y <= 21) {
      return '-';
    }
  }
  return 's';
}

function objectAt(x: number, y: number): string {
  // The dune ridge; the road from La Bajada parts it, three tiles wide.
  if (y === 0 || (x === 0 && y < 24) || (x === W - 1 && y < 24)) {
    if (x >= 7 && x <= 9 && y === 0) return ' ';
    return 'o';
  }
  // Rocky groins where the beach meets the map edge.
  if ((x === 0 || x === W - 1) && y >= 24 && y <= 28) return 'r';
  for (const [hx, hy] of CASAS) {
    if (x >= hx && x < hx + 5 && y >= hy && y < hy + 5) {
      if (x === hx + 2 && y === hy + 4) return OPEN_DOORS.has(`${hx},${hy}`) ? ' ' : 'D';
      if (x === hx && y === hy + 4) return 'C';
      return 'x';
    }
  }
  if (CABALLITOS.has(`${x},${y}`)) return 'c';
  if (REEDS.has(`${x},${y}`)) return 'R';
  const prop = PROPS[`${x},${y}`];
  if (prop) return prop;
  // Tide wrack along the water line, deterministic like all scatter.
  if (isBeach(x, y)) {
    const gr = groundAt(x, y);
    if ((gr === 's' || gr === 'u') && cellHash(x, y, 71) < 0.09) return 'y';
  }
  // Sparse dry life on open sand, deterministic so it never shifts.
  if (groundAt(x, y) === 's' && y < 22) {
    const h = cellHash(x, y, 63);
    if (h < 0.05) return 'i';
    if (h > 0.995) return 'r';
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

export const LA_CALETA_MAP: MapData = {
  id: 'la-caleta',
  name: 'La Caleta',
  spawn: [8, 1],
  spawnFacing: 'down',
  triggers: [
    // The whole mouth of the road carries you back up, lane for lane.
    { at: [7, 0], type: 'door', to: 'la-bajada', spawn: [19, 15], facing: 'left' },
    { at: [8, 0], type: 'door', to: 'la-bajada', spawn: [19, 16], facing: 'left' },
    { at: [9, 0], type: 'door', to: 'la-bajada', spawn: [19, 17], facing: 'left' },
    { at: [18, 18], type: 'door', to: 'picanteria', spawn: [7, 8], facing: 'up' },
  ],
  legend: {
    s: { t: 'sand' },
    u: { t: 'sandWet' },
    d: { t: 'dirt' },
    '.': { t: 'grass' },
    '-': { t: 'path' },
    P: { t: 'plaza' },
    k: { t: 'pierdeck' },
    w: { t: 'water', solid: true },
    S: { t: 'sea', solid: true },
    ' ': { t: 'void' },
    o: { t: 'wallStone', solid: true, tall: true },
    C: { t: 'casa', solid: true, tall: true },
    x: { t: 'blocked', solid: true, tall: true },
    D: { t: 'doorShut', solid: true, tall: true },
    M: { t: 'stall', solid: true, tall: true },
    L: { t: 'farol', solid: true, tall: true },
    g: { t: 'signpost', solid: true, tall: true },
    h: { t: 'harborsign', solid: true, tall: true },
    j: { t: 'piersign', solid: true, tall: true },
    e: { t: 'emoliente', solid: true, tall: true },
    c: { t: 'caballito', solid: true, tall: true },
    B: { t: 'boat', solid: true, tall: true },
    n: { t: 'bench', solid: true },
    N: { t: 'net', solid: true },
    K: { t: 'crate', solid: true },
    A: { t: 'pelican', solid: true },
    R: { t: 'reeds', solid: true },
    r: { t: 'rock', solid: true },
    i: { t: 'tuft' },
    // The love layer's kinds.
    X: { t: 'mototaxi', solid: true, tall: true },
    G: { t: 'gallinazos', solid: true, tall: true },
    T: { t: 'dryreeds', solid: true, tall: true },
    Y: { t: 'saltrack', solid: true, tall: true },
    p: { t: 'netpoles', solid: true, tall: true },
    t: { t: 'crabtraps', solid: true, tall: true },
    b: { t: 'buoywall', solid: true, tall: true },
    m: { t: 'kidmural', solid: true, tall: true },
    E: { t: 'pelicanpost', solid: true, tall: true },
    H: { t: 'picchairs', solid: true, tall: true },
    W: { t: 'shellbarrow', solid: true },
    Q: { t: 'emolcrate', solid: true },
    F: { t: 'driftbench', solid: true },
    z: { t: 'gato', solid: true },
    J: { t: 'jellyfish' },
    y: { t: 'seaweed' },
    // The colour the glare used to eat: a tarpaulin, painted drums, and a
    // boat being made beautiful again on the sand.
    V: { t: 'tendal', solid: true, tall: true },
    U: { t: 'bidones', solid: true },
    I: { t: 'pintura', solid: true, tall: true },
  },
  ground,
  objects,
};

/** Doña Petro's picantería: enter past the pots; one long table; no menu. */
export const PICANTERIA_MAP: MapData = {
  id: 'picanteria',
  name: 'La Picantería',
  spawn: [7, 8],
  spawnFacing: 'up',
  legend: {
    '.': { t: 'floorEarth' },
    '#': { t: 'wallInt', solid: true, tall: true },
    S: { t: 'shelf', solid: true, tall: true },
    q: { t: 'qoncha', solid: true },
    T: { t: 'table', solid: true },
    s: { t: 'stool', solid: true },
    p: { t: 'pot', solid: true },
    r: { t: 'rug' },
    m: { t: 'mat' },
    l: { t: 'limebasket', solid: true },
    Z: { t: 'pizarra', solid: true, tall: true },
    a: { t: 'laradio', solid: true },
    z: { t: 'gato', solid: true },
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
  // The fire and the pots hold one end, and the long table runs at them but
  // not squarely: the short table sits inboard of it, so the room has an
  // elbow rather than two parallel bars.
  objects: [
    '##S#S####S####',
    '#q p pl   Z  #',
    '#            #',
    '#  sTTTTTTs  #',
    '#            #', // the aisle between the tables, where the plates go
    '#   sTTTT    #',
    '#            #',
    '#  zr      a #',
    '#  r         #',
    '#######m######',
  ],
  triggers: [{ at: [7, 9], type: 'door', to: 'la-caleta', spawn: [18, 19], facing: 'down' }],
};
