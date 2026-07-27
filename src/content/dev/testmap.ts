import type { MapData } from '../../engine/grid';
import { cellHash } from '../../art/pix';

/**
 * Ch'aska Pampa: a plaza with a well, a stream with a bridge, house clusters,
 * potato terraces, a threshing floor and a sheep fold. Painted by rule so it
 * can be reshaped in seconds, but consumed through the same TileMap loader
 * real hand-authored regions use.
 *
 * The plaza is the hub of the first hour, so it is the one thing here that is
 * shaped by hand rather than by a rectangle: a wandering apron of paving that
 * bulges east along the street and narrows to a spur in the south, with the
 * well at its exact middle and worn stone running to it from every mouth.
 */

const W = 44;
const H = 32;

const HOUSES: [number, number][] = [
  [10, 7],
  [27, 6],
  [10, 21],
  [29, 21],
];

/**
 * Trees in twos and threes with long gaps between, never on a line: a
 * eucalyptus file down the stream bank, a grove on the plaza's north
 * shoulder, one big tree standing in the square itself.
 */
const TREES: [number, number][] = [
  [3, 4], [3, 5], [3, 12], [3, 20], [3, 21], [3, 27],
  [16, 10], [15, 12], [14, 14],
  [16, 18],
  [30, 3], [31, 4],
  [38, 5], [39, 4],
  [35, 12], [37, 19],
  [26, 26], [16, 28], [17, 30],
];

/**
 * The cancha: a scuffed oval of bare earth on the south flat with four stones
 * for two goals, which is where the ball on the roof was going when it left.
 * Empty on purpose, and shaped so the emptiness reads as a place.
 */
function inCancha(x: number, y: number): boolean {
  const dx = (x - 24.5) / 5.2;
  const dy = (y - 29) / 1.7;
  return dx * dx + dy * dy <= 1;
}

/**
 * The plaza, span by span. Nine rows that never agree on where their edges
 * are: the paving swells around the well, runs out east with the street,
 * reaches a tongue up the lane toward the niche and tapers to a spur in the
 * south. The mean of these spans is the well's own cell.
 */
const PLAZA: Record<number, [number, number]> = {
  11: [20, 23],
  12: [19, 24],
  13: [17, 26],
  14: [16, 27],
  15: [15, 27],
  16: [15, 28],
  17: [16, 26],
  18: [16, 25],
  19: [18, 23],
  20: [19, 21],
};

function inPlaza(x: number, y: number): boolean {
  const s = PLAZA[y];
  return !!s && x >= s[0] && x <= s[1];
}

/**
 * The stone people actually walk on, rubbed pale and dust-filled: the street
 * crossing the square, the lane running down it, the standing ring at the
 * well, and the diagonal short cut from the market corner to Rosa's lane.
 * Everything converges on one cell, which is the point.
 */
const WORN = new Set<string>();
for (let x = 15; x <= 28; x++) WORN.add(`${x},16`);
for (let y = 11; y <= 20; y++) WORN.add(`21,${y}`);
for (const [x, y] of [
  [20, 14], [21, 14], [22, 14], [20, 15], [22, 15], [20, 16], [22, 16], [21, 13],
  [25, 13], [24, 14], [23, 15], [20, 17], [19, 18], [18, 18], [17, 18], [17, 19],
  [21, 12], [22, 13], [19, 19], [23, 16],
]) {
  WORN.add(`${x},${y}`);
}

/**
 * The era: the threshing floor south of the square, beaten round and hard by
 * generations of hooves walking barley in circles. Shaped emptiness, and the
 * lane crosses straight through the middle of it, because it always has.
 */
function inEra(x: number, y: number): boolean {
  const dx = (x - 19) / 3.6;
  const dy = (y - 23.4) / 3.2;
  return dx * dx + dy * dy <= 1;
}

function groundAt(x: number, y: number): string {
  // Stream down the western side, bridged where the main street crosses it.
  if (x >= 4 && x <= 5) return y === 16 ? 'b' : 'w';
  if (x === 3 || x === 6) return '.'; // green banks
  // The plaza, and the tracks worn across it. The apron: nine cells of dark
  // wet cobble set in a ring around the well, swept and splashed daily, so the
  // pale square has a dark middle and the middle has the well standing in it.
  if (inPlaza(x, y)) {
    if (Math.abs(x - 21) <= 1 && Math.abs(y - 15) <= 1) return 'K';
    return WORN.has(`${x},${y}`) ? 'R' : 'P';
  }
  // Main street and the lane up toward the ridge, with the shoulders the
  // street has worn wide where carts pass each other and people stand.
  if (y === 16 && x >= 6 && x <= 40) return '-';
  if (y === 17 && x >= 8 && x <= 11) return '-';
  if (y === 15 && x >= 30 && x <= 34) return '-';
  if (y === 17 && x >= 35 && x <= 38) return '-';
  if (x === 21 && y >= 3 && y <= 28) return inEra(x, y) ? 'd' : '-';
  if (inEra(x, y) || inCancha(x, y)) return 'd';
  // Short paths from each house door down to the street, worn right up to
  // (and under) the doorway itself. The northern houses face the street, so
  // theirs runs straight. The southern two turn their backs on it: their path
  // leaves the street along the flank nearer the plaza, drops past the wall
  // and comes back up to the door from below, which is the side that opens.
  for (const [hx, hy] of HOUSES) {
    const door = hx + 2;
    if (hy < 16) {
      if (x === door && y >= hy + 4 && y <= 16) return '-';
      continue;
    }
    const side = door < 21 ? hx + 5 : hx - 1;
    const foot = hy + 6; // the row below the house, where the doorway looks out
    if (x === side && y >= 16 && y <= foot) return '-';
    if (y === foot && x >= Math.min(door, side) && x <= Math.max(door, side)) return '-';
    if (x === door && y >= hy + 4 && y <= foot) return '-';
  }
  // Potato terraces in the southeast: planted beds banded with bare earth
  // walkways, the way hillside terraces actually read.
  if (x >= 31 && x <= 40 && y >= 21 && y <= 28) return y % 3 === 2 ? 'd' : 'c';
  // The cold flat where chuño is laid out, a patch of bare frozen ground.
  if (x >= 12 && x <= 16 && y >= 3 && y <= 6 && (x + y) % 7 !== 0) return 'd';
  return ','; // puna grassland
}

/** Houses whose doors open (the others are latched, with lives behind them). */
const OPEN_DOORS = new Set(['10,21', '27,6']);

function objectAt(x: number, y: number): string {
  // Stone ridge enclosing the valley. The gate is the only way out of it, and
  // the ridge behind the gate is unbroken, so no tile is left stranded on the
  // far side of a door the player is carried through the moment they touch it.
  if (y <= 1 || y >= H - 1 || x === 0 || x === W - 1) return 'o';
  // The gate across the east road, shut until the story opens it.
  if ((x === 41 || x === 42) && y === 16) return 'G';
  // Houses are single illustrated sprites now; the grid only collides.
  // 'H' anchors the drawing at the bottom-left wall cell; 'x' cells are
  // invisible collision; the door cell stays open (or latched with 'D').
  for (const [hx, hy] of HOUSES) {
    if (x >= hx && x < hx + 5 && y >= hy && y < hy + 5) {
      if (x === hx + 2 && y === hy + 4) return OPEN_DOORS.has(`${hx},${hy}`) ? ' ' : 'D';
      if (x === hx && y === hy + 4) return 'H';
      // The southeast house keeps the soccer ball on its roof: a tall sprite
      // borrowing this collision cell, painted high enough to sit on the thatch.
      if (hx === 29 && x === hx + 4 && y === hy + 4) return 'l';
      return 'x';
    }
  }
  // The pirca along the top of the terraces, with the gap everyone uses
  // instead of walking around. The cat owns the warmest stone at x=37.
  if (y === 20 && x >= 30 && x <= 40) {
    if (x === 35) return ' '; // the gap, ratified by feet (and the harvest)
    return x === 37 ? 'Q' : 'q';
  }
  // The sheep fold up under the north ridge: three walls of pirca and a gap
  // driven through it, holding nothing most of the year but a straw rick and
  // whatever the hens can get away with. Bounded emptiness, on purpose.
  if (y === 2 && x >= 22 && x <= 28 && x !== 26) return 'q';
  if ((x === 22 || x === 28) && y >= 3 && y <= 5) return 'q';
  if (x === 24 && y === 3) return 'v'; // the straw rick inside the fold
  if (x === 25 && y === 4) return 'j'; // fodder trodden into the ground
  if (x === 23 && y === 4) return 'h';

  if (x === 32 && y === 26) return 'k'; // the chakitaqlla leans on the house wall
  if (x === 13 && y === 26) return 'F'; // Rosa's chicha flag, beside her door
  // ---------------------------------------------------------- the plaza
  if (x === 21 && y === 15) return 'W'; // the well, the middle of everything
  if (x === 22 && y === 14) return 'C'; // cántaros queued for their turn at it
  if (x === 19 && y === 15) return 'z'; // the batea, where the washing happens
  // The market corner: two stalls set at an angle to each other, the sacks
  // behind them, and the barley that always ends up on the ground.
  if ((x === 25 && y === 13) || (x === 26 && y === 14)) return 'M';
  if (x === 27 && y === 14) return 'S';
  if (x === 26 && y === 15) return 'j';
  // The shady corner: the plaza tree, and two benches turned to face it.
  if ((x === 17 && y === 18) || (x === 18 && y === 19)) return 'n';
  // Cloth spread out for sale where the light lands longest. The one loud
  // color in the square, and it is visible from every mouth of it.
  if ((x === 23 && y === 17) || (x === 22 && y === 18)) return 'm';
  // Street furniture: the village owns its plaza.
  if ((x === 19 && y === 12) || (x === 24 && y === 19) || (x === 7 && y === 15) || (x === 33 && y === 17)) return 'L';
  if ((x === 16 && y === 23) || (x === 34 && y === 7) || (x === 35 && y === 8)) return 'Y'; // woodpiles
  if ((x === 9 && y === 26) || (x === 32 && y === 11)) return 'p'; // planters
  for (const [tx, ty] of TREES) if (x === tx && y === ty) return 'T';

  // ------------------------------------------------------ the threshing floor
  if ((x === 17 && y === 21) || (x === 20 && y === 25)) return 'v'; // straw ricks
  if (x === 18 && y === 24) return 'S'; // the sacks the barley goes home in
  if ((x === 19 && y === 22) || (x === 18 && y === 26)) return 'j'; // spilled grain
  if ((x === 20 && y === 23) || (x === 17 && y === 25)) return 'h'; // hens, delighted
  // Four stones, two goals, one entire generation's worth of arguments.
  if ((x === 20 || x === 29) && (y === 28 || y === 30)) return 'r';

  // Background life: clustered at doors, corners, and the cold flat, the way
  // it actually gathers. Every kind here answers the action button.
  if (x === 13 && y === 12) return 'a'; // ají and maize drying by the north house
  if ((x === 13 && y === 4) || (x === 14 && y === 4) || (x === 14 && y === 5) || (x === 16 && y === 6)) return 'u';
  if ((x === 27 && y === 27) || (x === 26 && y === 27) || (x === 27 && y === 28)) return 'B'; // adobe bricks curing
  // Geraniums in lard cans by the chichería door: one either side of the turn,
  // so the worn path elbows toward the doorway instead of running on into grass.
  if ((x === 11 && y === 26) || (x === 11 && y === 27)) return 'g';
  if ((x === 28 && y === 11) || (x === 30 && y === 11)) return 'g'; // and at Carmen's
  if (x === 20 && y === 10) return 'N'; // the votive niche beside the lane
  if (x === 33 && y === 4) return 't'; // the clothesline behind Carmen's house
  if ((x === 6 && y === 9) || (x === 6 && y === 23) || (x === 6 && y === 24)) return 'e'; // eucalyptus saplings
  if ((x === 7 && y === 17) || (x === 8 && y === 25)) return 'h'; // hens

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
    R: { t: 'plazaWorn' },
    K: { t: 'wellstone' },
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
    q: { t: 'pirca', solid: true },
    Q: { t: 'pircamichi', solid: true },
    k: { t: 'chakitaqlla', solid: true, tall: true },
    a: { t: 'ajirack', solid: true, tall: true },
    u: { t: 'chuno' },
    B: { t: 'adobera', solid: true },
    g: { t: 'latacan', solid: true },
    N: { t: 'nicho', solid: true, tall: true },
    S: { t: 'sacos', solid: true },
    j: { t: 'grano' },
    t: { t: 'tendedero', solid: true, tall: true },
    e: { t: 'sapling', solid: true, tall: true },
    h: { t: 'gallina' },
    l: { t: 'pelota', solid: true, tall: true },
    v: { t: 'parva', solid: true, tall: true },
    C: { t: 'cantaros', solid: true },
    z: { t: 'batea', solid: true },
    m: { t: 'mantas' },
  },
  ground,
  objects,
  // One cookfire per house, rising from the roof ridge.
  smoke: HOUSES.map(([hx, hy]) => [hx + 3, hy]),
};
