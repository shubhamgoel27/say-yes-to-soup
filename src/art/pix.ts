/** Tiny pixel-art toolkit: offscreen surfaces, seeded randomness, color math. */

export type Surface = { cv: HTMLCanvasElement; g: CanvasRenderingContext2D };

export function surface(w: number, h: number): Surface {
  const cv = document.createElement('canvas');
  cv.width = w;
  cv.height = h;
  const g = cv.getContext('2d');
  if (!g) throw new Error('2d context unavailable');
  g.imageSmoothingEnabled = true; // the smooth-art era
  return { cv, g };
}

/** mulberry32. Art must be identical on every load, so no Math.random anywhere. */
export class Rng {
  private s: number;
  constructor(seed: number) {
    this.s = seed >>> 0 || 1;
  }
  next(): number {
    this.s = (this.s + 0x6d2b79f5) | 0;
    let t = Math.imul(this.s ^ (this.s >>> 15), 1 | this.s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  int(n: number): number {
    return Math.floor(this.next() * n);
  }
  range(lo: number, hi: number): number {
    return lo + this.int(hi - lo + 1);
  }
  chance(p: number): boolean {
    return this.next() < p;
  }
  pick<T>(a: readonly T[]): T {
    const v = a[this.int(a.length)];
    if (v === undefined) throw new Error('pick from empty array');
    return v;
  }
}

/** Deterministic per-cell hash so world texture never crawls under the camera. */
export function cellHash(x: number, y: number, salt: number): number {
  let h = (x * 374761393 + y * 668265263 + salt * 1274126177) | 0;
  h = (h ^ (h >>> 13)) * 1274126177;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

function hex2rgb(hex: string): [number, number, number] {
  const n = Number.parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgb2hsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h: number;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;
  return [h * 360, s, l];
}

function hsl2hex(h: number, s: number, l: number): string {
  h = ((h % 360) + 360) % 360;
  s = Math.max(0, Math.min(1, s));
  l = Math.max(0, Math.min(1, l));
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;
  if (h < 60) [r, g, b] = [c, x, 0];
  else if (h < 120) [r, g, b] = [x, c, 0];
  else if (h < 180) [r, g, b] = [0, c, x];
  else if (h < 240) [r, g, b] = [0, x, c];
  else if (h < 300) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  const q = (v: number) => Math.round((v + m) * 255);
  return `#${((1 << 24) | (q(r) << 16) | (q(g) << 8) | q(b)).toString(16).slice(1)}`;
}

/** Shortest-arc hue move toward a target, capped at `deg` degrees. */
function hueToward(h: number, target: number, deg: number): number {
  let d = ((target - h + 540) % 360) - 180;
  d = Math.max(-deg, Math.min(deg, d));
  return h + d;
}

/**
 * Lighten (amt > 0) or darken (amt < 0) a hex color. amt in [-1, 1].
 *
 * Painterly, not linear: shadows shift COOL (toward blue-violet) and gain a
 * little saturation; highlights shift WARM (toward sunlit yellow) and relax.
 * This one function is why nothing in the game shades toward dead gray, and
 * why every generator inherits an art-directed palette for free.
 */
export function shade(hex: string, amt: number): string {
  const [r, g, b] = hex2rgb(hex);
  let [h, s, l] = rgb2hsl(r, g, b);
  const k = Math.abs(amt);
  if (amt < 0) {
    l = l * (1 - k * 0.82);
    s = Math.min(1, s + k * 0.22 + (s < 0.08 ? k * 0.1 : 0));
    h = hueToward(h, 258, k * 26); // toward cool violet-blue
  } else {
    l = l + (0.96 - l) * k;
    s = Math.max(0, s - k * 0.3);
    h = hueToward(h, 55, k * 20); // toward warm sun
  }
  return hsl2hex(h, s, l);
}

export function px(g: CanvasRenderingContext2D, x: number, y: number, c: string) {
  g.fillStyle = c;
  g.fillRect(x, y, 1, 1);
}

// ---------------------------------------------------------------- smooth kit
// Helpers for the high-resolution art style: soft organic shapes, gradients,
// gentle shadows. Everything antialiased; nothing snapped to a pixel grid.

/** Filled circle. */
export function dot(g: CanvasRenderingContext2D, x: number, y: number, r: number, c: string) {
  g.fillStyle = c;
  g.beginPath();
  g.arc(x, y, r, 0, Math.PI * 2);
  g.fill();
}

/** Filled ellipse. */
export function oval(
  g: CanvasRenderingContext2D,
  x: number,
  y: number,
  rx: number,
  ry: number,
  c: string,
  rot = 0,
) {
  g.fillStyle = c;
  g.beginPath();
  g.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2);
  g.fill();
}

/** Rounded rectangle. */
export function rr(
  g: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  c: string,
) {
  g.fillStyle = c;
  g.beginPath();
  g.roundRect(x, y, w, h, r);
  g.fill();
}

/** An organic blob: a wobbly circle, the building block of soft foliage. */
export function blob(
  g: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  c: string,
  rng: Rng,
  wobble = 0.22,
) {
  const n = 9;
  g.fillStyle = c;
  g.beginPath();
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * Math.PI * 2;
    const rad = r * (1 + (rng.next() - 0.5) * wobble);
    const x = cx + Math.cos(a) * rad;
    const y = cy + Math.sin(a) * rad;
    if (i === 0) g.moveTo(x, y);
    else g.quadraticCurveTo(
      cx + Math.cos(a - Math.PI / n) * rad * 1.08,
      cy + Math.sin(a - Math.PI / n) * rad * 1.08,
      x, y,
    );
  }
  g.closePath();
  g.fill();
}

/** Vertical linear gradient fill over a rect. */
export function vgrad(
  g: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  top: string,
  bottom: string,
) {
  const grad = g.createLinearGradient(0, y, 0, y + h);
  grad.addColorStop(0, top);
  grad.addColorStop(1, bottom);
  g.fillStyle = grad;
  g.fillRect(x, y, w, h);
}

/** Soft radial pool of color, fading to transparent. */
export function glowSpot(
  g: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  c: string,
  alpha: number,
) {
  const grad = g.createRadialGradient(x, y, 0, x, y, r);
  grad.addColorStop(0, c);
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  g.save();
  g.globalAlpha = alpha;
  g.fillStyle = grad;
  g.fillRect(x - r, y - r, r * 2, r * 2);
  g.restore();
}

/** Soft elliptical contact shadow. */
export function softShadow(
  g: CanvasRenderingContext2D,
  x: number,
  y: number,
  rx: number,
  ry: number,
  alpha = 0.22,
) {
  const grad = g.createRadialGradient(x, y, 0, x, y, rx);
  grad.addColorStop(0, `rgba(26,18,12,${alpha})`);
  grad.addColorStop(0.7, `rgba(26,18,12,${alpha * 0.5})`);
  grad.addColorStop(1, 'rgba(26,18,12,0)');
  g.save();
  g.translate(x, y);
  g.scale(1, ry / rx);
  g.translate(-x, -y);
  g.fillStyle = grad;
  g.fillRect(x - rx, y - rx, rx * 2, rx * 2);
  g.restore();
}

export function rect(
  g: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  c: string,
) {
  g.fillStyle = c;
  g.fillRect(x, y, w, h);
}

/**
 * Wraps every sprite in a sheet with a soft ink edge, cell by cell so
 * neighboring frames never bleed into each other. In the smooth era this is
 * the cut-paper look: figures read as illustrations pasted into the world,
 * and pop off any ground they stand on.
 */
/** Mixes a hex color toward its own gray, for grounds that should recede. */
export function mute(hex: string, k: number): string {
  const n = Number.parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 0xff;
  const g = (n >> 8) & 0xff;
  const b = n & 0xff;
  const l = 0.299 * r + 0.587 * g + 0.114 * b;
  const mix = (c: number) => Math.round(c + (l - c) * k);
  return `#${((mix(r) << 16) | (mix(g) << 8) | mix(b)).toString(16).padStart(6, '0')}`;
}

export function outlineSheet(
  sheet: HTMLCanvasElement,
  cellW: number,
  cellH: number,
  color = 'rgba(38,26,16,0.55)',
  radius = 2,
): HTMLCanvasElement {
  const { cv: out, g } = surface(sheet.width, sheet.height);
  const { cv: cell, g: cg } = surface(cellW, cellH);
  const { cv: sil, g: sg } = surface(cellW, cellH);

  // Eight offsets make a smooth ring at antialiased resolution.
  const ring: [number, number][] = [];
  for (let k = 0; k < 8; k++) {
    ring.push([Math.cos((k / 8) * Math.PI * 2) * radius, Math.sin((k / 8) * Math.PI * 2) * radius]);
  }

  for (let cy = 0; cy < sheet.height; cy += cellH) {
    for (let cx = 0; cx < sheet.width; cx += cellW) {
      cg.clearRect(0, 0, cellW, cellH);
      cg.drawImage(sheet, cx, cy, cellW, cellH, 0, 0, cellW, cellH);
      // Silhouette of this cell in the outline color.
      sg.clearRect(0, 0, cellW, cellH);
      sg.globalCompositeOperation = 'source-over';
      sg.drawImage(cell, 0, 0);
      sg.globalCompositeOperation = 'source-in';
      sg.fillStyle = color;
      sg.fillRect(0, 0, cellW, cellH);
      // Stamp the silhouette around the ring, then the art on top, clipped
      // so nothing leaks into the neighboring frame.
      g.save();
      g.beginPath();
      g.rect(cx, cy, cellW, cellH);
      g.clip();
      for (const [dx, dy] of ring) {
        g.drawImage(sil, cx + dx, cy + dy);
      }
      g.drawImage(cell, cx, cy);
      g.restore();
    }
  }
  return out;
}
