import type { MapData } from '../../engine/grid';
import { cellHash } from '../../art/pix';

/**
 * La Bajada: the switchback descent west of the pass. The puna gives way to
 * cactus and shrub, and at the bottom of the map the land simply stops, and
 * there it is, for the first time: the sea, far below, exactly where Faustino
 * said it would start talking. Chapter Two's front porch.
 */

const W = 30;
const H = 22;

/** The road switchbacks down: three landings joined by short drops. */
function onRoad(x: number, y: number): boolean {
  // The mouth of the pass: three tiles wide right up to the map edge,
  // matching the flared road on the east-road side.
  if (x <= 4 && y >= 3 && y <= 5) return true;
  if (y === 4 && x >= 1 && x <= 24) return true;
  if (x === 24 && y >= 4 && y <= 10) return true;
  if (y === 10 && x >= 5 && x <= 24) return true;
  if (x === 5 && y >= 10 && y <= 16) return true;
  if (y === 16 && x >= 5 && x <= 20) return true;
  // A small landing where the switchbacks hand you on toward La Caleta.
  if (x >= 18 && x <= 20 && y >= 15 && y <= 17) return true;
  return false;
}

/** The mirador: the one shelf off the road, where the sea is first seen. */
const onOverlook = (x: number, y: number): boolean => x >= 10 && x <= 13 && y >= 17 && y <= 18;

function groundAt(x: number, y: number): string {
  if (y >= H - 2) return 'S'; // the sea, far below
  if (y === H - 3) return 'V'; // the cliff lip
  // The road, and the beaten pull-off where everyone stops to look at the sea.
  if (onRoad(x, y) || onOverlook(x, y)) return '-';
  return 'L'; // the ladera: rubble too steep to cross, which is why there is a road
}

function objectAt(x: number, y: number): string {
  if (y === 0 || x === 0 || x === W - 1) {
    if (x === 0 && onRoad(x, y)) return ' '; // the road in from the pass, full width
    if (y >= H - 3) return ' '; // the ridge never argues with the sea
    return 'o';
  }
  const g = groundAt(x, y);
  // The board on the landing, so the way onward is a place and not a hunch.
  if (x === 18 && y === 17) return 'P';
  // Apachetas along the descent, gaining a stone per traveler. They grow
  // taller the closer the road gets to the sea, as the loads get lighter.
  // The last one stands where the road hands you over, in time to be seen.
  if ((x === 23 && y === 6) || (x === 6 && y === 12) || (x === 17 && y === 15)) return 'a';
  // Lizards keep the warm rubble at the road's edge, an arm's length away.
  if ((x === 10 && y === 11) || (x === 17 && y === 17)) return 'z';
  // Nothing else stands on the road, the pull-off or the cliff: the shelf
  // keeps its room for a tripod and two people looking at the same thing.
  if (g !== 'L') return ' ';
  const h = cellHash(x, y, 47);
  // Drier life as the map descends.
  if (y > 12) {
    if (h < 0.05) return 'C';
    if (h < 0.1) return 'b';
    if (h > 0.995) return 'r';
  } else {
    if (h < 0.03) return 'C';
    if (h < 0.09) return 'i';
    if (h < 0.11) return 'f';
    if (h > 0.994) return 'r';
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

export const LA_BAJADA_MAP: MapData = {
  id: 'la-bajada',
  name: 'La Bajada',
  spawn: [1, 4],
  spawnFacing: 'right',
  legend: {
    '-': { t: 'path' },
    ' ': { t: 'void' },
    L: { t: 'ladera', solid: true },
    P: { t: 'signpost', solid: true, tall: true },
    V: { t: 'cliff', solid: true },
    S: { t: 'sea', solid: true },
    o: { t: 'wallStone', solid: true, tall: true },
    C: { t: 'cactus', solid: true, tall: true },
    b: { t: 'shrub', solid: true },
    i: { t: 'tuft' },
    f: { t: 'flower' },
    r: { t: 'rock', solid: true },
    a: { t: 'apachetita', solid: true },
    z: { t: 'lagarto' },
  },
  ground,
  objects,
  triggers: [
    // The pass mouth, three tiles wide, mirrors the east-road side row for row.
    { at: [0, 3], type: 'door', to: 'east-road', spawn: [50, 5], facing: 'left' },
    { at: [0, 4], type: 'door', to: 'east-road', spawn: [50, 6], facing: 'left' },
    { at: [0, 5], type: 'door', to: 'east-road', spawn: [50, 7], facing: 'left' },
    // The switchbacks keep going; the coast is real now. The whole landing
    // at the road's end hands you on, lane for lane, no square-hunting.
    { at: [20, 15], type: 'door', to: 'la-caleta', spawn: [7, 1], facing: 'down' },
    { at: [20, 16], type: 'door', to: 'la-caleta', spawn: [8, 1], facing: 'down' },
    { at: [20, 17], type: 'door', to: 'la-caleta', spawn: [9, 1], facing: 'down' },
  ],
};
