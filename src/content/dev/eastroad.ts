import type { MapData } from '../../engine/grid';
import { cellHash } from '../../art/pix';

/**
 * The East Road: the pass out of the valley, unlocked when Chapter One ends.
 * A long, windy walk with llamas, an apacheta cairn, the arriero's camp, and a
 * signboard pointing at everything that comes next. Chapter Two grows from
 * this road's far end.
 */

const W = 52;
const H = 13;

const ROAD_Y = 6;

function groundAt(_x: number, y: number): string {
  if (y === ROAD_Y) return '-';
  return ',';
}

function objectAt(x: number, y: number): string {
  // Ridge walls top and bottom; open at both ends of the road.
  if (y <= 1 || y >= H - 2) return 'o';
  if (x === 0 && y !== ROAD_Y) return 'o';
  if (x === W - 1 && y !== ROAD_Y) return 'o';

  // The narrow pass: boulders pinch the road where Paca holds court.
  if ((x === 30 || x === 31) && (y === ROAD_Y - 1 || y === ROAD_Y + 1)) return 'o';

  if (x === 14 && y === ROAD_Y - 1) return 'A'; // the apacheta cairn
  if (x === 13 && y === ROAD_Y - 1) return 'e'; // a traveler's q'epi, resting by it
  // The kite tree: a wind-bent queñua holding somebody's condor, mid-descent.
  if (x === 9 && y === ROAD_Y - 2) return 'K';
  // The arriero's camp, south of the road past the pass.
  if (x === 38 && y === ROAD_Y + 2) return 'E'; // tent
  if (x === 40 && y === ROAD_Y + 2) return 'k'; // campfire
  if (x === 40 && y === ROAD_Y + 3) return 's'; // stool
  if (x === 36 && y === ROAD_Y + 2) return 'h'; // the hitching rail, swept
  if (x === 49 && y === ROAD_Y - 1) return 'P'; // the signboard east

  // Windswept scatter, sparser than the valley floor.
  if (groundAt(x, y) === ',') {
    const h = cellHash(x, y, 33);
    if (h < 0.02) return 'f';
    if (h < 0.1) return 'i';
    if (h > 0.992) return 'r';
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

export const EAST_ROAD_MAP: MapData = {
  id: 'east-road',
  name: 'The East Road',
  spawn: [1, ROAD_Y],
  spawnFacing: 'right',
  legend: {
    ',': { t: 'puna' },
    '-': { t: 'path' },
    ' ': { t: 'void' },
    o: { t: 'wallStone', solid: true, tall: true },
    A: { t: 'apacheta', solid: true, tall: true },
    E: { t: 'tent', solid: true, tall: true },
    k: { t: 'campfire', solid: true },
    s: { t: 'stool', solid: true },
    P: { t: 'signpost', solid: true, tall: true },
    e: { t: 'qepi', solid: true },
    K: { t: 'condorkite', solid: true, tall: true },
    h: { t: 'hitchpost', solid: true, tall: true },
    f: { t: 'flower' },
    i: { t: 'tuft' },
    r: { t: 'rock', solid: true },
  },
  ground,
  objects,
  triggers: [
    { at: [0, ROAD_Y], type: 'door', to: 'village', spawn: [40, 16], facing: 'left' },
    { at: [W - 1, ROAD_Y], type: 'door', to: 'la-bajada', spawn: [1, 4], facing: 'right' },
  ],
};
