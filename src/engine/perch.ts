import type { Dir } from './input';

/**
 * Evening seats, claimed once at boot. Pure, so the tests can hold every
 * perch on every map to the same rules as every other place a body stands.
 *
 * Every bench-like object recruits its evening sitter: the closest wandering
 * human within eight tiles of home claims the walkable cell beside it,
 * facing the seat, the same way the player sits. One villager per seat,
 * seats in reading order, ties broken by roster order, so the same people
 * take the same benches every single dusk.
 *
 * A perch must be clean, like any other cell a body is put on: Hana's
 * golden-hour perch by the Busan crates was under the crane's crossbeam,
 * and she sat drawn on the beam for the whole of Mr. Gong's scene (g2
 * bu-gong-01). `clean` rejects such cells; the seat then takes its next side.
 */

export type PerchMap = {
  w: number;
  h: number;
  inBounds(x: number, y: number): boolean;
  solid(x: number, y: number): boolean;
  object(x: number, y: number): { t: string } | null;
};

export type PerchSitter = { id: string; map: string; pos: [number, number]; range: number; sprite?: string };

export type Perch = { at: [number, number]; dir: Dir };

const PERCHES: [number, number, Dir][] = [
  [0, 1, 'up'],
  [-1, 0, 'right'],
  [1, 0, 'left'],
  [0, -1, 'down'],
];

export function claimPerches(
  maps: Record<string, PerchMap>,
  people: PerchSitter[],
  opts: {
    sitKinds: (mapId: string) => ReadonlySet<string>;
    /** Interiors keep no evening benches. */
    skip: (mapId: string) => boolean;
    /** Bodies that stand in one place for good, as "map:x,y". */
    posted: ReadonlySet<string>;
    /** Can a body sit on this cell without a prop drawn over it? */
    clean?: (mapId: string, x: number, y: number) => boolean;
  },
): Map<string, Perch> {
  const claimed = new Set<string>();
  const out = new Map<string, Perch>();
  for (const [mid, tm] of Object.entries(maps)) {
    if (opts.skip(mid)) continue;
    const kinds = opts.sitKinds(mid);
    const seats: [number, number][] = [];
    for (let y = 0; y < tm.h; y++) {
      for (let x = 0; x < tm.w; x++) {
        if (kinds.has(tm.object(x, y)?.t ?? '')) seats.push([x, y]);
      }
    }
    const sitters = people.filter((v) => v.map === mid && !v.sprite && v.range > 0);
    for (const [sx, sy] of seats) {
      let best: PerchSitter | null = null;
      let bestD = 9;
      for (const v of sitters) {
        if (out.has(v.id)) continue;
        const d = Math.max(Math.abs(sx - v.pos[0]), Math.abs(sy - v.pos[1]));
        if (d < bestD) {
          bestD = d;
          best = v;
        }
      }
      if (!best) continue;
      for (const [dx, dy, dir] of PERCHES) {
        const px = sx + dx;
        const py = sy + dy;
        const k = `${mid}:${px},${py}`;
        if (!tm.inBounds(px, py) || tm.solid(px, py) || claimed.has(k)) continue;
        // Personal space: a perch directly above or below another sitter or
        // anyone posted for good would seat two bodies in one pile.
        const near = (y: number) => claimed.has(`${mid}:${px},${y}`) || opts.posted.has(`${mid}:${px},${y}`);
        if (opts.posted.has(k) || near(py - 1) || near(py + 1)) continue;
        if (opts.clean && !opts.clean(mid, px, py)) continue;
        claimed.add(k);
        out.set(best.id, { at: [px, py], dir });
        break;
      }
    }
  }
  return out;
}
