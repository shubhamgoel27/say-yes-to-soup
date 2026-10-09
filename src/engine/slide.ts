import { DIR_VEC, type Dir } from './input';

/**
 * Held keys slip round single small things. Pure, so the tests can hold it.
 *
 * Walking with the keys, a lone rock, a cactus or a tree in the line of
 * travel stopped the player dead: a knock, a lean, and a fiddly two-key
 * shuffle round something one tile wide (g1 at the pass and down La
 * Bajada, g3 on the terraces). A held direction into such a thing now steps
 * one cell aside and carries on past it, the way feet do.
 *
 * Only a thing exactly one cell across the line of travel counts: the cells
 * either side of it must be open ground. A wall, a fence, a house, a stall
 * row, anything two or more cells wide, stays exactly as solid as it was,
 * so leaning on it still knocks. Nothing slides into a doorway or onto a
 * cell somebody holds.
 */
export type SlideGround = {
  /** Map collision only: walls, props, water. */
  solid(x: number, y: number): boolean;
  /** Can the player step onto this cell right now (no body, no door)? */
  free(x: number, y: number): boolean;
};

const PERP: Record<Dir, [Dir, Dir]> = {
  up: ['left', 'right'],
  down: ['left', 'right'],
  left: ['up', 'down'],
  right: ['up', 'down'],
};

/**
 * The sidestep for a held `dir` from `at`, or null to knock as usual.
 * `prefer` breaks a tie between the two sides (the side the walker last
 * moved toward reads as the natural one).
 */
export function slideAround(g: SlideGround, at: [number, number], dir: Dir, prefer?: Dir | null): Dir | null {
  const [x, y] = at;
  const [dx, dy] = DIR_VEC[dir];
  const ox = x + dx;
  const oy = y + dy;
  if (!g.solid(ox, oy)) return null;
  const [a, b] = PERP[dir];
  // One cell across: open ground on both of its flanks.
  const flank = (s: Dir) => {
    const [sx, sy] = DIR_VEC[s];
    return !g.solid(ox + sx, oy + sy);
  };
  if (!flank(a) || !flank(b)) return null;
  // A side works when the walker can step there now and the cell past the
  // thing on that side is open, so the next held step carries on.
  const works = (s: Dir) => {
    const [sx, sy] = DIR_VEC[s];
    return g.free(x + sx, y + sy) && g.free(ox + sx, oy + sy);
  };
  const sides = [a, b].filter(works);
  if (sides.length === 0) return null;
  if (sides.length === 1) return sides[0]!;
  // Both open: the side the walker leans toward, else the one with the
  // longer open run ahead (a rock at a lane's edge sends you down the lane).
  if (prefer && sides.includes(prefer)) return prefer;
  const run = (s: Dir) => {
    const [sx, sy] = DIR_VEC[s];
    let n = 0;
    for (let k = 1; k <= 4 && g.free(x + sx + dx * k, y + sy + dy * k); k++) n++;
    return n;
  };
  return run(b) > run(a) ? b : a;
}
