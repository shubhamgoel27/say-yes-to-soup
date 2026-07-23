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
  if (y === 4 && x >= 1 && x <= 24) return true;
  if (x === 24 && y >= 4 && y <= 10) return true;
  if (y === 10 && x >= 5 && x <= 24) return true;
  if (x === 5 && y >= 10 && y <= 16) return true;
  if (y === 16 && x >= 5 && x <= 20) return true;
  return false;
}

function groundAt(x: number, y: number): string {
  if (y >= H - 2) return 'S'; // the sea, far below
  if (y === H - 3) return 'V'; // the cliff lip
  if (onRoad(x, y)) return '-';
  return ',';
}

function objectAt(x: number, y: number): string {
  if (y === 0 || x === 0 || x === W - 1) {
    if (x === 0 && y === 4) return ' '; // the road in from the pass
    if (y >= H - 3) return ' '; // the ridge never argues with the sea
    return 'o';
  }
  if (groundAt(x, y) !== ',') return ' ';
  // The photographer's tripod spot faces the overlook.
  if (x === 12 && y === 18) return ' ';
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
    ',': { t: 'puna' },
    '-': { t: 'path' },
    ' ': { t: 'void' },
    V: { t: 'cliff', solid: true },
    S: { t: 'sea', solid: true },
    o: { t: 'wallStone', solid: true, tall: true },
    C: { t: 'cactus', solid: true, tall: true },
    b: { t: 'shrub', solid: true },
    i: { t: 'tuft' },
    f: { t: 'flower' },
    r: { t: 'rock', solid: true },
  },
  ground,
  objects,
  triggers: [{ at: [0, 4], type: 'door', to: 'east-road', spawn: [50, 6], facing: 'left' }],
};
