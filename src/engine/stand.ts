import type { Dir } from './input';

/**
 * Where two people stand to talk. Pure, so the tests can hold every talk on
 * every map to it without a renderer.
 *
 * A body is two tiles tall: it stands on its cell and its head fills the
 * cell above. Two speakers one directly above the other therefore draw as
 * one pile. They settle side by side on one row instead: orthogonally
 * adjacent and facing, so the talk reads as two people and the next Space
 * still finds the person, never the scenery beside them.
 *
 * Every cell a settle walks someone onto has to be clean (see Ground.clean):
 * open floor, no doorway, no prop painted over the body, the head not inside
 * a wall or a prop, and no third body on the cell, above it or below it.
 */

export type Cell = [number, number];

export type Ground = {
  /** Can a body step across this cell at all (in bounds, not solid, not a door)? */
  passable(x: number, y: number): boolean;
  /** Can a body settle here for a talk? Passable, and nothing drawn over or through the figure. */
  clean(x: number, y: number): boolean;
  /** Is this cell held by a body other than the two speakers? */
  held(x: number, y: number): boolean;
};

export type SettleMove = { who: 'player' | 'npc'; steps: Dir[] };

export type Settle =
  /** Already standing well: side by side on a row, or not adjacent at all. */
  | { kind: 'none' }
  /** Scripted steps, in order (both movers may walk at once), then both face. */
  | { kind: 'move'; moves: SettleMove[]; player: Cell; npc: Cell; playerFace: Dir; npcFace: Dir }
  /** Nowhere clean to go: they hold their cells and lean apart. */
  | { kind: 'lean' };

/** A settling body's landing: clean, and nobody else in its column, a row off. */
export function roomFor(g: Ground, x: number, y: number): boolean {
  return g.clean(x, y) && !g.held(x, y) && !g.held(x, y - 1) && !g.held(x, y + 1);
}

const side = (s: number): Dir => (s > 0 ? 'right' : 'left');

/**
 * How two speakers settle. `npcMay` is false for anyone who must hold their
 * place (seated, staged, stationed, mid-step): then only the player moves.
 * Options, best first:
 *  1. the player walks round to stand beside them on their row (two steps);
 *  2. the villager steps aside and the player steps into the place they left;
 *  3. the villager walks round to stand beside the player (two steps);
 *  4. the player steps back one cell, leaving a clear cell between faces.
 * Failing all of them: lean.
 */
export function planSettle(g: Ground, player: Cell, npc: Cell, npcMay: boolean): Settle {
  const [px, py] = player;
  const [nx, ny] = npc;
  if (px !== nx || Math.abs(py - ny) !== 1) return { kind: 'none' };
  const x = px;
  const up: Dir = 'up';
  const down: Dir = 'down';
  // From the player's row to the villager's, and back.
  const toNpcRow: Dir = ny < py ? up : down;
  const toPlayerRow: Dir = ny < py ? down : up;

  for (const s of [1, -1]) {
    // 1. Round the corner to their row: (x+s, py) then (x+s, ny).
    if (g.passable(x + s, py) && !g.held(x + s, py) && roomFor(g, x + s, ny)) {
      return {
        kind: 'move',
        moves: [{ who: 'player', steps: [side(s), toNpcRow] }],
        player: [x + s, ny],
        npc,
        playerFace: side(-s),
        npcFace: side(s),
      };
    }
  }
  if (npcMay) {
    for (const s of [1, -1]) {
      // 2. They step aside on their row; the player steps up into their place.
      if (roomFor(g, x + s, ny) && roomFor(g, x, ny)) {
        return {
          kind: 'move',
          moves: [
            { who: 'npc', steps: [side(s)] },
            { who: 'player', steps: [toNpcRow] },
          ],
          player: [x, ny],
          npc: [x + s, ny],
          playerFace: side(s),
          npcFace: side(-s),
        };
      }
    }
    for (const s of [1, -1]) {
      // 3. They walk round the corner to the player's row.
      if (g.passable(x + s, ny) && !g.held(x + s, ny) && roomFor(g, x + s, py)) {
        return {
          kind: 'move',
          moves: [{ who: 'npc', steps: [side(s), toPlayerRow] }],
          player,
          npc: [x + s, py],
          playerFace: side(s),
          npcFace: side(-s),
        };
      }
    }
  }
  // 4. One step back along the column: a whole clear cell between the two
  // figures, so neither face is drawn under the other's feet.
  const back = py + (py - ny);
  if (roomFor(g, x, back)) {
    return {
      kind: 'move',
      moves: [{ who: 'player', steps: [toPlayerRow] }],
      player: [x, back],
      npc,
      playerFace: toNpcRow,
      npcFace: toPlayerRow,
    };
  }
  return { kind: 'lean' };
}

/**
 * Reading a tall thing from a cell its paint falls over (below a well, its
 * arch round your head; above it, its stone over your legs): the one or two
 * steps to a clean cell beside it, side cells first, and the way to face it
 * from there. Null when the reader already stands clean, or nowhere clean is
 * within two steps (a gate set in a wall). `g.passable` is a step a body can
 * take now; `g.held` a cell somebody else holds.
 */
export function planBesideProp(
  g: Ground,
  player: Cell,
  prop: Cell,
): { steps: Dir[]; at: Cell; face: Dir } | null {
  if (g.clean(player[0], player[1])) return null;
  const free = (x: number, y: number) => g.passable(x, y) && !g.held(x, y);
  let best: { steps: Dir[]; at: Cell; side: boolean } | null = null;
  const consider = (steps: Dir[], at: Cell) => {
    const [x, y] = at;
    if (Math.abs(x - prop[0]) + Math.abs(y - prop[1]) !== 1) return;
    if (!roomFor(g, x, y)) return;
    const side = y === prop[1];
    if (!best || steps.length < best.steps.length || (steps.length === best.steps.length && side && !best.side)) {
      best = { steps, at, side };
    }
  };
  const dirs: Dir[] = ['left', 'right', 'down', 'up'];
  for (const d1 of dirs) {
    const a = stepCell(player, d1);
    if (!free(a[0], a[1])) continue;
    consider([d1], a);
    for (const d2 of dirs) {
      const b = stepCell(a, d2);
      if ((b[0] === player[0] && b[1] === player[1]) || !free(b[0], b[1])) continue;
      consider([d1, d2], b);
    }
  }
  if (!best) return null;
  const { steps, at } = best as { steps: Dir[]; at: Cell };
  const face: Dir = prop[0] > at[0] ? 'right' : prop[0] < at[0] ? 'left' : prop[1] > at[1] ? 'down' : 'up';
  return { steps, at, face };
}

const stepCell = ([x, y]: Cell, d: Dir): Cell => [
  x + (d === 'right' ? 1 : d === 'left' ? -1 : 0),
  y + (d === 'down' ? 1 : d === 'up' ? -1 : 0),
];

// ---------------------------------------------------------------- props over a body

/** A tall prop's art: its size and where it hangs from its cell, in art pixels. */
export type PropArt = { w: number; h: number; ox: number; oy: number };

/** What the cover test needs of a map. TileMap fits. */
export type PropMap = {
  w: number;
  h: number;
  object(x: number, y: number): { t: string; solid?: boolean; tall?: boolean } | null;
};

/**
 * Points down a standing figure, in logical pixels from its cell's top-left:
 * hat, face, chest, hips, shins, each at the centre and either side. A figure
 * is two tiles tall, so the head is up in the cell above.
 */
export const BODY_SAMPLES: [number, number][] = [];
for (const fy of [-13, -8, -2, 4, 10]) for (const fx of [5, 8, 11]) BODY_SAMPLES.push([fx, fy]);

/**
 * Is a body standing on (x, y) drawn under a tall prop's art, or with its
 * head inside a wall or a prop? `art` sizes a kind's sprite at a cell. With
 * `pixel` (art pixel solid?) the test is on the painted pixels; without it,
 * on the art's whole rectangle, which can only say yes more often.
 *
 * Only props drawn after the body can hide it: those on its own row or nearer
 * the eye. A prop in the cell above is drawn first, behind the figure, and
 * reads as growing out of the hat; that counts too (`headIn`).
 */
export function bodyCovered(
  m: PropMap,
  x: number,
  y: number,
  art: (kind: string, cx: number, cy: number) => PropArt | null,
  isBuilding: (kind: string) => boolean,
  pixel?: (kind: string, cx: number, cy: number, ax: number, ay: number) => boolean,
): boolean {
  if (headIn(m, x, y, isBuilding)) return true;
  const T = 16;
  const A = 4;
  for (let cy = y; cy <= Math.min(m.h - 1, y + 6); cy++) {
    for (let cx = Math.max(0, x - 6); cx <= Math.min(m.w - 1, x + 6); cx++) {
      const o = m.object(cx, cy);
      if (!o?.tall || o.t === 'blocked') continue;
      const a = art(o.t, cx, cy);
      if (!a) continue;
      // The art's origin in world logical pixels.
      const lx = cx * T - a.ox / A;
      const ty = cy * T - a.oy / A;
      if (lx > x * T + 12 || lx + a.w / A < x * T + 4 || ty > y * T + 11) continue;
      let hits = 0;
      for (const [fx, fy] of BODY_SAMPLES) {
        const ax = (x * T + fx - lx) * A;
        const ay = (y * T + fy - ty) * A;
        if (ax < 0 || ay < 0 || ax >= a.w || ay >= a.h) continue;
        if (!pixel || pixel(o.t, cx, cy, ax, ay)) hits++;
      }
      if (hits >= (pixel ? 2 : 1)) return true;
    }
  }
  return false;
}

/** Is the cell above (x, y), where a figure's head is, a tall prop or a wall? */
export function headIn(m: PropMap, x: number, y: number, isBuilding: (kind: string) => boolean): boolean {
  const o = y > 0 ? m.object(x, y - 1) : null;
  return !!o && !!o.tall && !!o.solid && o.t !== 'blocked' && !isBuilding(o.t);
}
