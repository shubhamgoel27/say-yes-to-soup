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
  if (x === 32 && y === 26) return 'k'; // the chakitaqlla leans on the house wall
  if (x === 21 && y === 15) return 'W'; // the well
  if ((x === 18 && y === 14) || (x === 25 && y === 18)) return 'M'; // market stalls
  if (x === 13 && y === 26) return 'F'; // Rosa's chicha flag, beside her door
  // Street furniture: the village owns its plaza.
  if ((x === 19 && y === 15) || (x === 23 && y === 17)) return 'n'; // benches
  if ((x === 16 && y === 23) || (x === 34 && y === 7)) return 'Y'; // woodpiles, off the worn path
  if ((x === 9 && y === 26) || (x === 32 && y === 11)) return 'p'; // planters
  if ((x === 17 && y === 13) || (x === 25 && y === 13) || (x === 7 && y === 15) || (x === 36 && y === 12)) return 'L'; // lamp posts
  for (const [tx, ty] of TREES) if (x === tx && y === ty) return 'T';

  // Background life: clustered at doors, corners, and the cold flat, the way
  // it actually gathers. Every kind here answers the action button.
  if (x === 13 && y === 12) return 'a'; // ají and maize drying by the north house
  if ((x === 13 && y === 4) || (x === 14 && y === 4) || (x === 14 && y === 5)) return 'u'; // chuño on the cold flat
  if (x === 27 && y === 27) return 'B'; // adobe bricks curing under plastic
  // Geraniums in lard cans by the chichería door: one either side of the turn,
  // so the worn path elbows toward the doorway instead of running on into grass.
  if ((x === 11 && y === 26) || (x === 11 && y === 27)) return 'g';
  if (x === 20 && y === 10) return 'N'; // the votive niche beside the lane
  if (x === 26 && y === 18) return 'S'; // sacks of mote and habas at the stall
  if (x === 25 && y === 19) return 'j'; // spilled barley; the hens know
  if (x === 33 && y === 4) return 't'; // the clothesline behind Carmen's house
  if ((x === 6 && y === 9) || (x === 6 && y === 23)) return 'e'; // eucalyptus saplings on the bank
  if ((x === 15 && y === 22) || (x === 7 && y === 17) || (x === 8 && y === 25)) return 'h'; // hens

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
  },
  ground,
  objects,
  // One cookfire per house, rising from the roof ridge.
  smoke: HOUSES.map(([hx, hy]) => [hx + 3, hy]),
};
