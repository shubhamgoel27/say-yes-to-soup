import { TILE } from './config';

/**
 * Who a click was aimed at. Pure, so the tests can hold it without a page.
 *
 * A figure is drawn about a tile and a half tall: its cell, and the head and
 * hat up in the cell above. The eye clicks the drawn body, so that is what is
 * tested first. But a hand is slower than a wanderer: Justina took one step
 * between the moment the player aimed at her and the moment the button went
 * down, the click landed on the grass she had just left, and the walk ended
 * beside her, facing nowhere, with no talk (g3 desk-32, f3 with Rosa). So a
 * click on the body someone was drawn in a moment ago, or a near miss by a
 * few pixels, still means them.
 */

export type AimBody<T> = {
  who: T;
  /** Where the body is drawn now: its cell's top-left, in world px. */
  at: [number, number];
  /** The cells its last steps left, and how many ms ago each, if it just
   * moved. Leave it out for someone walking with purpose (a scene's walk to
   * its mark): a click on the floor behind them is a click on the floor. */
  left?: { cell: [number, number]; ago: number }[];
};

/** How long a body is still "there" after stepping off, in ms: a hand's lag. */
export const AIM_LAG_MS = 650;
/** ...and only while they are still within this many cells of it. */
export const AIM_NEAR = 2;
/** A near miss still counts within this many world px of the drawn body. */
export const AIM_SLOP = 3;

/** The drawn body's box, from the top of the hat to the feet. */
function inBody(wx: number, wy: number, x: number, y: number, slop: number): boolean {
  return wx >= x + 2 - slop && wx <= x + TILE - 2 + slop && wy >= y - 13 - slop && wy <= y + TILE + slop;
}

const centreDist = (wx: number, wy: number, x: number, y: number) =>
  Math.abs(wx - (x + TILE / 2)) + Math.abs(wy - (y + TILE / 2));

export function aimedAt<T>(wx: number, wy: number, bodies: AimBody<T>[]): T | undefined {
  // 1. The body drawn under the pointer, nearest centre first.
  // 2. The place someone was drawn a moment ago.
  // 3. A near miss on someone drawn now.
  const tiers: ((b: AimBody<T>) => [number, number] | null)[] = [
    (b) => (inBody(wx, wy, b.at[0], b.at[1], 0) ? b.at : null),
    (b) => {
      for (const l of b.left ?? []) {
        if (l.ago > AIM_LAG_MS) continue;
        // Still near it: an ambler a step or two on, not someone striding past.
        if (Math.abs(b.at[0] / TILE - l.cell[0]) + Math.abs(b.at[1] / TILE - l.cell[1]) > AIM_NEAR) continue;
        const lx = l.cell[0] * TILE;
        const ly = l.cell[1] * TILE;
        if (inBody(wx, wy, lx, ly, 0)) return [lx, ly];
      }
      return null;
    },
    (b) => (inBody(wx, wy, b.at[0], b.at[1], AIM_SLOP) ? b.at : null),
  ];
  for (const tier of tiers) {
    let best: T | undefined;
    let bestD = Infinity;
    for (const b of bodies) {
      const at = tier(b);
      if (!at) continue;
      const d = centreDist(wx, wy, at[0], at[1]);
      if (d < bestD) {
        best = b.who;
        bestD = d;
      }
    }
    if (best !== undefined) return best;
  }
  return undefined;
}
