/**
 * Shortest walks over a tile grid, where some floor costs more than other
 * floor. The red thread uses it to lie around the cell under a lamp's head or
 * a tree's canopy (walkable, but painted over) whenever a short detour
 * exists, and to go straight through when none does. Pure, so the tests can
 * hold the yarn to it without a renderer.
 */

/** Four-way neighbours, in the order every walk in the game tries them. */
const STEPS = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
] as const;

/**
 * Cheapest path from `from` to any cell in `goals` (cell indices y*w+x).
 * Each step costs 1 plus `extra(x, y)` for the cell stepped onto. Returns the
 * cells walked, start excluded, or null when no goal can be reached. Equal
 * costs keep the first-found order, so with no extra cost anywhere this
 * returns exactly what a breadth-first search would.
 */
export function cheapestPath(
  w: number,
  h: number,
  from: [number, number],
  goals: Set<number>,
  blocked: (x: number, y: number) => boolean,
  extra: (x: number, y: number) => number,
): [number, number][] | null {
  const start = from[1] * w + from[0];
  if (goals.has(start)) return [];
  const dist = new Map<number, number>([[start, 0]]);
  const prev = new Map<number, number>();
  // A tiny binary heap of [cost, order, cell]; order breaks ties FIFO.
  const heap: [number, number, number][] = [[0, 0, start]];
  let order = 1;
  const less = (a: [number, number, number], b: [number, number, number]) =>
    a[0] < b[0] || (a[0] === b[0] && a[1] < b[1]);
  const push = (n: [number, number, number]) => {
    heap.push(n);
    let i = heap.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (!less(heap[i]!, heap[p]!)) break;
      [heap[i], heap[p]] = [heap[p]!, heap[i]!];
      i = p;
    }
  };
  const pop = (): [number, number, number] => {
    const top = heap[0]!;
    const last = heap.pop()!;
    if (heap.length) {
      heap[0] = last;
      let i = 0;
      for (;;) {
        const l = i * 2 + 1;
        const r = l + 1;
        let m = i;
        if (l < heap.length && less(heap[l]!, heap[m]!)) m = l;
        if (r < heap.length && less(heap[r]!, heap[m]!)) m = r;
        if (m === i) break;
        [heap[i], heap[m]] = [heap[m]!, heap[i]!];
        i = m;
      }
    }
    return top;
  };
  while (heap.length) {
    const [d, , ci] = pop();
    if (d > (dist.get(ci) ?? Infinity)) continue;
    if (goals.has(ci)) {
      const path: [number, number][] = [];
      for (let at = ci; at !== start; at = prev.get(at) ?? start) {
        const ax = at % w;
        path.unshift([ax, (at - ax) / w]);
      }
      return path;
    }
    const cx = ci % w;
    const cy = (ci - cx) / w;
    for (const [dx, dy] of STEPS) {
      const nx = cx + dx;
      const ny = cy + dy;
      if (nx < 0 || ny < 0 || nx >= w || ny >= h || blocked(nx, ny)) continue;
      const ni = ny * w + nx;
      const nd = d + 1 + extra(nx, ny);
      if (nd >= (dist.get(ni) ?? Infinity)) continue;
      dist.set(ni, nd);
      prev.set(ni, ci);
      push([nd, order++, ni]);
    }
  }
  return null;
}
