/**
 * The few canvas calls the art leans on that older browsers lack, filled in
 * before any other module runs (main.ts imports this first).
 *
 * roundRect arrived in Safari 16 and Firefox 112. The art draws with it from
 * module top level, so on iOS 15 (the last for the iPhone 6s, 7 and SE) the
 * game threw before its first frame and sat on the loader for good.
 */

type Radii = number | DOMPointInit | (number | DOMPointInit)[];

/** Corner radii in the spec's order: top-left, top-right, bottom-right, bottom-left. */
function corners(r: Radii | undefined, w: number, h: number): [number, number, number, number] {
  const n = (Array.isArray(r) ? r : [r ?? 0]).map((v) => Math.max(0, typeof v === 'number' ? v : (v?.x ?? 0)));
  const [a = 0, b = a, c = a, d = b] = n;
  // As the spec reads a list: [all], [tl+br, tr+bl], [tl, tr+bl, br], [tl, tr, br, bl].
  const radii: [number, number, number, number] =
    n.length >= 4 ? [a, b, c, d] : n.length === 3 ? [a, b, c, b] : n.length === 2 ? [a, b, a, b] : [a, a, a, a];
  const [tl, tr, br, bl] = radii;
  // Scaled down together so neighbouring corners never cross, as the native call does.
  const k = Math.min(1, w / (tl + tr || 1), w / (bl + br || 1), h / (tl + bl || 1), h / (tr + br || 1));
  return [tl * k, tr * k, br * k, bl * k];
}

function roundRect(this: CanvasPath, x: number, y: number, w: number, h: number, r?: Radii) {
  // Negative sizes draw from the other edge, as the native call does.
  if (w < 0) (x += w), (w = -w);
  if (h < 0) (y += h), (h = -h);
  const [tl, tr, br, bl] = corners(r, w, h);
  this.moveTo(x + tl, y);
  this.lineTo(x + w - tr, y);
  this.arcTo(x + w, y, x + w, y + tr, tr);
  this.lineTo(x + w, y + h - br);
  this.arcTo(x + w, y + h, x + w - br, y + h, br);
  this.lineTo(x + bl, y + h);
  this.arcTo(x, y + h, x, y + h - bl, bl);
  this.lineTo(x, y + tl);
  this.arcTo(x, y, x + tl, y, tl);
  this.closePath();
}

const g = globalThis as unknown as Record<string, { prototype?: { roundRect?: unknown } } | undefined>;
for (const name of ['CanvasRenderingContext2D', 'OffscreenCanvasRenderingContext2D', 'Path2D']) {
  const proto = g[name]?.prototype;
  if (proto && typeof proto.roundRect !== 'function') {
    Object.defineProperty(proto, 'roundRect', { value: roundRect, configurable: true, writable: true });
  }
}

export {};
