import type { Dir } from '../engine/input';
import type { AudioBus } from '../engine/audio';
import { PAL } from '../engine/config';
import { surface, rect, rr, oval, dot, vgrad, shade, mute, glowSpot, softShadow, Rng, type Surface } from '../art/pix';
import { Scene, mountScene, easeOutCubic, easeInCubic, easeOutBack, wobble } from './games/scene';

/**
 * The weaving mini-game: Carmen calls a color sequence, you call it back with
 * the arrow keys, and each color is a note, so a woven row is also a little
 * tune. Forgiving on purpose: a miss just means she calls the row again.
 * Three rows and the cloth takes you in.
 *
 * Painted as a real backstrap loom: warp under tension between wall peg and
 * strap, the band growing row by row in the Ch'aska Pampa colors, a shuttle
 * that flies the shed on every good call.
 */

const COLORS = [
  { dir: 'left' as Dir, hex: '#c1512f', name: 'terracotta', note: 0 },
  { dir: 'up' as Dir, hex: '#8fcbe8', name: 'sky', note: 2 },
  { dir: 'right' as Dir, hex: '#c8a55b', name: 'gold', note: 4 },
  { dir: 'down' as Dir, hex: '#7a4460', name: 'violet', note: 6 },
];

const ROWS = [3, 4, 5];
const SHOW_STEP = 0.55;

type Phase = 'show' | 'input' | 'row-done' | 'done';

// ------------------------------------------------------------- loom geometry
const TOP_Y = 74;
const BOT_Y = 284;
const FELL0 = 240; // top of the starter band; new rows stack above it
const ROW_H = 13;
const TOP_L = 190;
const TOP_R = 320;
const BOT_L = 178;
const BOT_R = 332;

function edgeL(y: number): number {
  return TOP_L + ((BOT_L - TOP_L) * (y - TOP_Y)) / (BOT_Y - TOP_Y);
}
function edgeR(y: number): number {
  return TOP_R + ((BOT_R - TOP_R) * (y - TOP_Y)) / (BOT_Y - TOP_Y);
}

/** Yarn balls in a basket, laid out as a compass so the arrows read at a glance. */
const BALLS = [
  { x: 452, y: 178 }, // left: terracotta
  { x: 523, y: 106 }, // up: sky
  { x: 594, y: 178 }, // right: gold
  { x: 523, y: 250 }, // down: violet
];

const calm = () => document.body.classList.contains('reduce-motion');

// ------------------------------------------------------------- baked artwork
let bgCache: Surface | null = null;
let starterCache: Surface | null = null;
let shuttleCache: Surface | null = null;
const glowCache = new Map<string, HTMLCanvasElement>();

function glowCv(color: string): HTMLCanvasElement {
  let cv = glowCache.get(color);
  if (!cv) {
    const s = surface(96, 96);
    glowSpot(s.g, 48, 48, 46, color, 1);
    cv = s.cv;
    glowCache.set(color, cv);
  }
  return cv;
}

function paintArrow(g: CanvasRenderingContext2D, x: number, y: number, dir: Dir) {
  g.save();
  g.translate(x, y);
  const rot = dir === 'up' ? -Math.PI / 2 : dir === 'down' ? Math.PI / 2 : dir === 'left' ? Math.PI : 0;
  g.rotate(rot);
  g.strokeStyle = PAL.ink;
  g.lineWidth = 2.4;
  g.lineCap = 'round';
  g.beginPath();
  g.moveTo(-5, 0);
  g.lineTo(5, 0);
  g.moveTo(1.5, -3.8);
  g.lineTo(5.5, 0);
  g.lineTo(1.5, 3.8);
  g.stroke();
  g.restore();
}

function bg(): Surface {
  if (bgCache) return bgCache;
  const s = surface(640, 340);
  const g = s.g;
  const rng = new Rng(517);

  // Adobe wall, warm plaster, mottled the way real plaster is.
  vgrad(g, 0, 0, 640, 254, mute(shade(PAL.adobe, 0.42), 0.3), mute(shade(PAL.adobe, 0.22), 0.25));
  for (let i = 0; i < 40; i++) {
    g.globalAlpha = 0.05;
    dot(g, rng.int(640), rng.int(250), 8 + rng.int(22), rng.chance(0.5) ? '#7d5836' : '#e8d3ae');
  }
  g.globalAlpha = 1;

  // Packed-earth floor with a scatter of pebbles.
  vgrad(g, 0, 252, 640, 88, '#7f6039', '#553f24');
  rect(g, 0, 251, 640, 3, 'rgba(43,33,24,0.35)');
  for (let i = 0; i < 26; i++) {
    const y = 262 + rng.int(70);
    g.globalAlpha = 0.35;
    oval(g, rng.int(640), y, 2 + rng.next() * 2, 1.4, rng.chance(0.5) ? '#93744c' : '#4a3620');
  }
  g.globalAlpha = 1;

  // Window on the left: the pampa's own sky and one snowy apu.
  rr(g, 58, 38, 96, 96, 6, shade(PAL.adobeDark, -0.15));
  rr(g, 64, 44, 84, 80, 4, '#bfe0ef');
  vgrad(g, 64, 44, 84, 80, PAL.sky, '#e6ecd2');
  glowSpot(g, 128, 58, 26, '#fff3cf', 0.9);
  dot(g, 128, 58, 8, '#f9eed4');
  g.fillStyle = '#8d93b8';
  g.beginPath();
  g.moveTo(64, 124);
  g.lineTo(96, 84);
  g.lineTo(124, 124);
  g.closePath();
  g.fill();
  g.fillStyle = '#eef0f4';
  g.beginPath();
  g.moveTo(90, 92);
  g.lineTo(96, 84);
  g.lineTo(103, 93);
  g.lineTo(96, 96);
  g.closePath();
  g.fill();
  rect(g, 64, 82, 84, 2.4, 'rgba(122,74,44,0.7)'); // crossbar
  rr(g, 56, 132, 100, 7, 3, shade(PAL.adobeDark, -0.3)); // sill

  // A petate mat under the loom so the cloth end has somewhere soft to fall.
  softShadow(g, 256, 314, 120, 24, 0.3);
  rr(g, 168, 296, 176, 32, 10, '#a4784a');
  g.strokeStyle = 'rgba(80,54,28,0.35)';
  g.lineWidth = 1.2;
  for (let i = 0; i < 6; i++) {
    g.beginPath();
    g.moveTo(174, 301 + i * 4.6);
    g.lineTo(338, 301 + i * 4.6);
    g.stroke();
  }

  // The yarn basket: a flat coil basket holding the four calls.
  softShadow(g, 523, 202, 116, 40, 0.28);
  for (let i = 0; i < 5; i++) {
    const t = i / 4;
    oval(g, 523, 180, 108 - i * 4.6, 94 - i * 4, shade('#b98d54', -0.22 + t * 0.3));
  }
  oval(g, 523, 180, 88, 76, '#8a6537');
  oval(g, 523, 180, 84, 72, '#a57c46');
  // Loose wool tufts where the balls were wound from.
  const trng = new Rng(88);
  for (let i = 0; i < 5; i++) {
    g.globalAlpha = 0.5;
    dot(g, 505 + trng.int(38), 168 + trng.int(24), 4 + trng.int(4), '#e9dcc0');
  }
  g.globalAlpha = 1;

  // Arrow tags, one under each ball, so the keys stay legible.
  for (let i = 0; i < 4; i++) {
    const b = BALLS[i]!;
    const ty = b.y + 26;
    rr(g, b.x - 12, ty, 24, 19, 5, PAL.cream);
    rr(g, b.x - 12, ty + 15, 24, 4, 2, 'rgba(43,33,24,0.18)');
    paintArrow(g, b.x, ty + 9, COLORS[i]!.dir);
  }

  // The wall peg the loom bar is lashed to.
  dot(g, 255, 30, 6, shade(PAL.stoneDark, -0.15));
  dot(g, 254, 29, 3, shade(PAL.stone, 0.2));

  // A soft vignette so the scene sits into the page.
  const vig = g.createRadialGradient(320, 170, 150, 320, 170, 380);
  vig.addColorStop(0, 'rgba(0,0,0,0)');
  vig.addColorStop(1, 'rgba(40,26,16,0.26)');
  g.fillStyle = vig;
  g.fillRect(0, 0, 640, 340);

  bgCache = s;
  return s;
}

/** The band Carmen already wove: title-band stripes, so the cloth has a heritage. */
function starterBand(): Surface {
  if (starterCache) return starterCache;
  const s = surface(128, 44);
  const g = s.g;
  const stripes = ['#c1512f', '#d9a441', '#3f7fb0', '#6b8e4e', '#c1512f', '#d9a441'];
  for (let i = 0; i < 6; i++) {
    const c = stripes[i]!;
    rect(g, 0, i * 8, 128, 8, c);
    rect(g, 0, i * 8, 128, 1.4, shade(c, 0.18));
    rect(g, 0, i * 8 + 7, 128, 1, shade(c, -0.3));
  }
  // Pallay diamonds on the gold rows, little stars on the blue.
  for (let x = 10; x < 128; x += 21) {
    diamond(g, x, 12, 4, PAL.cream);
    diamond(g, x + 10, 20, 3, '#1d3d5c');
    diamond(g, x + 5, 36, 4, '#f4e6c8');
  }
  // Warp grain.
  g.globalAlpha = 0.12;
  for (let x = 2; x < 128; x += 4.5) rect(g, x, 0, 1.2, 44, '#f6ecd8');
  g.globalAlpha = 1;
  starterCache = s;
  return s;
}

function shuttleCv(): Surface {
  if (shuttleCache) return shuttleCache;
  const s = surface(90, 20);
  const g = s.g;
  g.fillStyle = '#8a5f38';
  g.beginPath();
  g.moveTo(3, 10);
  g.quadraticCurveTo(28, 1, 45, 1.5);
  g.quadraticCurveTo(62, 1, 87, 10);
  g.quadraticCurveTo(62, 19, 45, 18.5);
  g.quadraticCurveTo(28, 19, 3, 10);
  g.closePath();
  g.fill();
  g.strokeStyle = shade('#8a5f38', 0.25);
  g.lineWidth = 1.6;
  g.beginPath();
  g.moveTo(8, 8);
  g.quadraticCurveTo(45, 3.5, 82, 8);
  g.stroke();
  g.strokeStyle = shade('#8a5f38', -0.35);
  g.beginPath();
  g.moveTo(8, 12.5);
  g.quadraticCurveTo(45, 17, 82, 12.5);
  g.stroke();
  shuttleCache = s;
  return s;
}

function diamond(g: CanvasRenderingContext2D, x: number, y: number, r: number, c: string) {
  g.fillStyle = c;
  g.beginPath();
  g.moveTo(x, y - r);
  g.lineTo(x + r, y);
  g.lineTo(x, y + r);
  g.lineTo(x - r, y);
  g.closePath();
  g.fill();
}

const LOOM_LEGEND = [
  { keys: ['left', 'up', 'right', 'down'], does: 'call the colors back, as the basket shows' },
  { keys: ['space'], does: 'the next row' },
] as const;

export class WeavePanel {
  private phase: Phase = 'show';
  private row = 0;
  private seq: number[] = [];
  private at = 0; // reveal index or input index
  private t = 0;
  private lit: number | null = null;
  private woven: number[][] = [];
  private onDone: (() => void) | null = null;

  // Visual state only; game logic never reads any of this.
  private scene = new Scene();
  private setHintFn: ((h: string) => void) | null = null;
  private hint = '';
  private ballK = [0, 0, 0, 0];
  private slotK: number[] = [];
  private wob = 0;
  private rowSlide = 0;
  private batten = 0;
  private shuttleX = BOT_R + 44;
  private shuttleSide = 1; // which selvedge it rests at
  private shuttleFlying = false;
  private shuttleFrom = BOT_R + 44;
  private shuttleColor = COLORS[2]!.hex;

  constructor(
    private root: HTMLElement,
    private audio: AudioBus,
  ) {}

  get isOpen(): boolean {
    return !this.root.hidden;
  }

  open(onDone: () => void) {
    this.onDone = onDone;
    this.row = 0;
    this.woven = [];
    this.root.hidden = false;
    this.scene.restart();
    this.setHintFn = mountScene(this.root, 'The Loom', this.scene, LOOM_LEGEND).setHint;
    const hintEl = this.root.querySelector('.w-hint') as HTMLElement | null;
    if (hintEl) hintEl.style.lineHeight = '1.4'; // a parent zeroes line-height; wrapped hints must not overlap
    this.ballK = [0, 0, 0, 0];
    this.wob = 0;
    this.rowSlide = 0;
    this.batten = 0;
    this.shuttleSide = 1;
    this.shuttleX = BOT_R + 44;
    this.shuttleFlying = false;
    this.startRow();
  }

  private startRow() {
    const len = ROWS[this.row] ?? 3;
    this.seq = Array.from({ length: len }, () => Math.floor(Math.random() * COLORS.length));
    this.phase = 'show';
    this.at = 0;
    this.t = 0;
    this.lit = null;
    this.slotK = this.seq.map(() => 0);
    this.hint = 'Watch the colors Carmen calls...';
  }

  /** Driven by the fixed-timestep loop so it behaves under the dev sim too. */
  tick(dt: number) {
    if (!this.isOpen) return;
    if (this.phase === 'show') {
      this.t += dt;
      const step = Math.floor(this.t / SHOW_STEP);
      if (step < this.seq.length) {
        const idx = this.seq[step] ?? 0;
        if (this.lit !== step) {
          this.lit = step;
          this.audio.weaveNote(COLORS[idx]?.note ?? 0);
          this.animCall(idx, step);
        }
      } else {
        this.phase = 'input';
        this.at = 0;
        this.lit = null;
        this.hint = 'Now you. Call them back with the arrows.';
      }
    }
    if (this.phase === 'done' && !calm() && Math.random() < dt * 2.2) {
      this.scene.burst(200 + Math.random() * 110, 150 + Math.random() * 60, {
        n: 1, kind: 'spark', color: '#ffd98a', speed: 30, grav: -30, life: 0.7, size: 2.4,
      });
    }
    const sdt = this.scene.frame(dt, (g) => this.paint(g));
    for (let i = 0; i < 4; i++) this.ballK[i] = Math.max(0, (this.ballK[i] ?? 0) - sdt * 2.6);
    for (let i = 0; i < this.slotK.length; i++) this.slotK[i] = Math.max(0, (this.slotK[i] ?? 0) - sdt * 3);
    this.wob = Math.max(0, this.wob - sdt * 1.6);
    this.setHintFn?.(this.hint);
  }

  onDir(dir: Dir) {
    if (this.phase !== 'input') return;
    const picked = COLORS.findIndex((c) => c.dir === dir);
    if (picked < 0) return;
    const want = this.seq[this.at];
    if (picked === want) {
      this.audio.weaveNote(COLORS[picked]?.note ?? 0);
      this.at++;
      this.animPick(picked, this.at - 1);
      if (this.at >= this.seq.length) {
        this.woven.push([...this.seq]);
        this.row++;
        this.animLock();
        if (this.row >= ROWS.length) {
          this.phase = 'done';
          this.audio.weaveDone();
          this.animWin();
          this.hint = 'The row holds. Carmen nods. Press Space.';
        } else {
          this.phase = 'row-done';
          this.hint = 'Good. The next row is longer.';
        }
      }
    } else {
      this.audio.weaveNote(0, false);
      this.at = 0;
      this.phase = 'show';
      this.t = 0;
      this.lit = null;
      this.animMiss();
      this.hint = 'The thread slips. Carmen chuckles and calls it again.';
    }
  }

  onAction() {
    if (this.phase === 'row-done') {
      this.startRow();
    } else if (this.phase === 'done') {
      this.root.hidden = true;
      const done = this.onDone;
      this.onDone = null;
      done?.();
    }
  }

  // ------------------------------------------------------- animation triggers

  private fellY(): number {
    return FELL0 - this.woven.length * ROW_H;
  }

  private slotPos(i: number): { x: number; y: number } {
    const n = Math.max(1, this.seq.length);
    const span = Math.min(138, n * 38);
    return { x: 255 - span / 2 + (span * (i + 0.5)) / n, y: this.fellY() - 26 };
  }

  private animCall(idx: number, step: number) {
    this.ballK[idx] = 1;
    this.slotK[step] = 1;
    this.wob = Math.min(1, this.wob + 0.25);
    const b = BALLS[idx]!;
    if (!calm()) {
      this.scene.burst(b.x, b.y - 6, { n: 4, kind: 'spark', color: COLORS[idx]!.hex, speed: 70, grav: -40, life: 0.4, size: 2.6 });
    }
  }

  private animPick(idx: number, slot: number) {
    this.ballK[idx] = 1;
    this.slotK[slot] = 1;
    this.wob = Math.min(1.2, this.wob + 0.45);
    this.shuttleColor = COLORS[idx]!.hex;
    const y = this.fellY();
    const from = this.shuttleSide ? edgeR(y) + 42 : edgeL(y) - 42;
    this.shuttleSide = 1 - this.shuttleSide;
    const to = this.shuttleSide ? edgeR(y) + 42 : edgeL(y) - 42;
    this.shuttleX = from;
    this.shuttleFrom = from;
    this.shuttleFlying = true;
    this.scene.tween(from, to, 0.24, easeOutCubic, (v) => (this.shuttleX = v), () => (this.shuttleFlying = false));
    const p = this.slotPos(slot);
    this.scene.burst(p.x, p.y, { n: calm() ? 3 : 7, color: COLORS[idx]!.hex, speed: 55, life: 0.45, size: 2.6 });
  }

  /** The batten beats the new row down into the cloth; wool dust jumps off the fell. */
  private animLock() {
    this.rowSlide = 16;
    this.scene.tween(16, 0, 0.4, easeOutBack, (v) => (this.rowSlide = v));
    this.scene.tween(0, 30, 0.11, easeInCubic, (v) => (this.batten = v), () => {
      if (!calm()) this.scene.thump(4, 0.04);
      const y = this.fellY() + ROW_H;
      for (let i = 0; i < (calm() ? 3 : 7); i++) {
        this.scene.waft(edgeL(y) + 12 + i * 16, y - 4, 'rgba(242,230,208,0.5)', 6);
      }
      this.scene.burst(255, y - 2, { n: calm() ? 4 : 9, kind: 'puff', color: 'rgba(240,228,205,0.6)', speed: 40, grav: -20, life: 0.7, size: 4 });
      this.scene.tween(30, 0, 0.28, easeOutCubic, (v) => (this.batten = v));
    });
  }

  private animMiss() {
    this.wob = 1.6;
    if (!calm()) this.scene.thump(3, 0.03);
    for (let i = 0; i < this.seq.length; i++) {
      const p = this.slotPos(i);
      this.scene.burst(p.x, p.y, { n: 2, kind: 'puff', color: 'rgba(160,150,135,0.5)', speed: 30, life: 0.5, size: 3.4 });
    }
  }

  private animWin() {
    this.scene.flash('#ffe9b8', 0.35);
    if (!calm()) this.scene.thump(5, 0.06);
    const y = this.fellY() + 6;
    for (let i = 0; i < 4; i++) {
      this.scene.burst(215 + i * 26, y, {
        n: calm() ? 4 : 10, color: COLORS[i]!.hex, speed: 120, grav: 160, life: 0.9, size: 3, kind: i % 2 ? 'spark' : 'dot',
      });
    }
  }

  // ----------------------------------------------------------------- painting

  private paint(g: CanvasRenderingContext2D) {
    const time = this.scene.time;
    const fell = this.fellY();
    g.drawImage(bg().cv, 0, 0);

    // Lash ropes up to the wall peg, then the backstrap curving off-page to the weaver.
    g.strokeStyle = '#c9b490';
    g.lineWidth = 2.4;
    g.beginPath();
    g.moveTo(TOP_L + 2, TOP_Y - 2);
    g.lineTo(253, 32);
    g.moveTo(TOP_R - 2, TOP_Y - 2);
    g.lineTo(257, 32);
    g.stroke();
    g.strokeStyle = '#7a4a2c';
    g.lineWidth = 7;
    g.beginPath();
    g.moveTo(BOT_L + 4, BOT_Y + 4);
    g.quadraticCurveTo(216, 322, 240, 340);
    g.moveTo(BOT_R - 4, BOT_Y + 4);
    g.quadraticCurveTo(294, 322, 270, 340);
    g.stroke();

    this.paintWarp(g, time, fell);
    this.paintCloth(g, fell);
    this.paintSlots(g, time, fell);

    // The batten, a wooden sword resting in the shed until it beats.
    const bw = edgeR(fell - 40) - edgeL(fell - 40) + 24;
    const by = fell - 42 + this.batten;
    rr(g, edgeL(fell - 40) - 12, by, bw, 9, 4.5, '#7d5230');
    rect(g, edgeL(fell - 40) - 7, by + 1.6, bw - 10, 2, shade('#7d5230', 0.3));

    this.paintShuttle(g, time, fell);

    // Beams last so the warp tucks under them.
    rr(g, TOP_L - 13, TOP_Y - 6, TOP_R - TOP_L + 26, 11, 5, '#8a5f38');
    rect(g, TOP_L - 8, TOP_Y - 4, TOP_R - TOP_L + 16, 2, shade('#8a5f38', 0.3));
    rr(g, BOT_L - 12, BOT_Y - 3, BOT_R - BOT_L + 24, 12, 5.5, '#8a5f38');
    rect(g, BOT_L - 6, BOT_Y - 1, BOT_R - BOT_L + 12, 2.2, shade('#8a5f38', 0.3));

    this.paintBalls(g, time);
  }

  private paintWarp(g: CanvasRenderingContext2D, time: number, fell: number) {
    const n = 26;
    g.lineWidth = 1.5;
    for (let i = 0; i < n; i++) {
      const k = i / (n - 1);
      const xt = TOP_L + 4 + (TOP_R - TOP_L - 8) * k;
      const xb = edgeL(fell) + 4 + (edgeR(fell) - edgeL(fell) - 8) * k;
      const sway = Math.sin(time * 6.5 + i * 0.8) * (0.5 + this.wob * 4.5);
      const edge = i === 0 || i === n - 1;
      g.strokeStyle = edge ? '#b05032' : i % 2 ? '#e2d2b2' : '#efe2c6';
      g.beginPath();
      g.moveTo(xt, TOP_Y + 3);
      g.quadraticCurveTo((xt + xb) / 2 + sway * 2, (TOP_Y + fell) / 2, xb, fell);
      g.stroke();
    }
  }

  private paintCloth(g: CanvasRenderingContext2D, fell: number) {
    g.drawImage(starterBand().cv, BOT_L, FELL0, BOT_R - BOT_L, BOT_Y - FELL0);
    for (let k = 0; k < this.woven.length; k++) {
      const newest = k === this.woven.length - 1;
      const y = FELL0 - (k + 1) * ROW_H - (newest ? this.rowSlide : 0);
      this.paintRow(g, y, this.woven[k]!, k);
    }
    // Warp grain over the whole cloth, then the selvedges that hold it together.
    const top = fell - (this.woven.length ? this.rowSlide : 0);
    g.globalAlpha = 0.09;
    for (let x = BOT_L + 2; x < BOT_R - 1; x += 4.5) rect(g, x, top, 1.2, BOT_Y - top, '#f6ecd8');
    g.globalAlpha = 1;
    rect(g, edgeL(top) - 1, top, 3.4, BOT_Y - top, '#a34a2c');
    rect(g, edgeR(top) - 2.4, top, 3.4, BOT_Y - top, '#a34a2c');
  }

  private paintRow(g: CanvasRenderingContext2D, y: number, seq: number[], rowIdx: number) {
    const xl = edgeL(y + ROW_H / 2) + 3;
    const xr = edgeR(y + ROW_H / 2) - 3;
    const w = (xr - xl) / seq.length;
    for (let j = 0; j < seq.length; j++) {
      const c = COLORS[seq[j] ?? 0]!.hex;
      const x = xl + j * w;
      rect(g, x, y, w + 0.6, ROW_H, c);
      rect(g, x, y, w + 0.6, 1.6, shade(c, 0.2));
      rect(g, x, y + ROW_H - 1, w + 0.6, 1, shade(c, -0.32));
      const mx = x + w / 2;
      if ((j + rowIdx) % 2 === 0) diamond(g, mx, y + ROW_H / 2, 3.6, PAL.cream);
      else diamond(g, mx, y + ROW_H / 2, 2.6, shade(c, -0.45));
    }
  }

  private paintSlots(g: CanvasRenderingContext2D, time: number, fell: number) {
    // A pick-up stick carries the called pattern above the fell.
    const y = fell - 26;
    g.strokeStyle = '#b9895a';
    g.lineWidth = 4;
    g.beginPath();
    g.moveTo(edgeL(y) - 14, y);
    g.lineTo(edgeR(y) + 14, y);
    g.stroke();
    for (let i = 0; i < this.seq.length; i++) {
      const on =
        (this.phase === 'show' && this.lit === i) ||
        (this.phase === 'input' && i < this.at) ||
        this.phase === 'row-done' ||
        this.phase === 'done';
      const p = this.slotPos(i);
      if (on) {
        const c = COLORS[this.seq[i] ?? 0]!.hex;
        const r = 9 * (1 + (this.slotK[i] ?? 0) * 0.45);
        g.globalAlpha = 0.55 + (this.slotK[i] ?? 0) * 0.45;
        g.drawImage(glowCv(c), p.x - 21, p.y - 21, 42, 42);
        g.globalAlpha = 1;
        diamond(g, p.x, p.y, r, c);
        diamond(g, p.x, p.y - r * 0.28, r * 0.4, shade(c, 0.35));
      } else {
        g.strokeStyle = 'rgba(43,33,24,0.4)';
        g.lineWidth = 1.8;
        g.beginPath();
        g.arc(p.x, p.y, 6.5, 0, Math.PI * 2);
        g.stroke();
      }
      if (this.phase === 'input' && i === this.at) {
        const r = 10 + wobble(time, 5) * 1.6;
        g.strokeStyle = 'rgba(242,230,208,0.9)';
        g.lineWidth = 2;
        g.beginPath();
        g.arc(p.x, p.y, r, 0, Math.PI * 2);
        g.stroke();
      }
    }
  }

  private paintShuttle(g: CanvasRenderingContext2D, time: number, fell: number) {
    const y = fell - 12 + (this.shuttleFlying ? 0 : wobble(time, 2.1) * 1.5);
    if (this.shuttleFlying) {
      g.strokeStyle = this.shuttleColor;
      g.lineWidth = 2.2;
      g.beginPath();
      g.moveTo(this.shuttleFrom, y);
      g.lineTo(this.shuttleX, y);
      g.stroke();
    }
    g.drawImage(shuttleCv().cv, this.shuttleX - 45, y - 10);
    g.strokeStyle = this.shuttleColor;
    g.lineWidth = 2.6;
    for (let i = 0; i < 5; i++) {
      g.beginPath();
      g.moveTo(this.shuttleX - 10 + i * 5, y - 6.5);
      g.lineTo(this.shuttleX - 12 + i * 5, y + 6.5);
      g.stroke();
    }
  }

  private paintBalls(g: CanvasRenderingContext2D, time: number) {
    for (let i = 0; i < 4; i++) {
      const b = BALLS[i]!;
      const c = COLORS[i]!.hex;
      const k = this.ballK[i] ?? 0;
      const r = 23 * (1 + k * 0.3 + wobble(time, 1.7, i * 1.9) * 0.015);
      if (k > 0.02) {
        g.globalAlpha = k * 0.9;
        g.drawImage(glowCv(c), b.x - 52, b.y - 52, 104, 104);
        g.globalAlpha = 1;
      }
      oval(g, b.x, b.y + r * 0.85, r * 0.9, r * 0.28, 'rgba(30,20,12,0.3)');
      dot(g, b.x, b.y, r, c);
      g.strokeStyle = shade(c, -0.22);
      g.lineWidth = 1.8;
      for (const [a0, a1, tilt] of [[0.4, 2.6, 0.5], [3.4, 5.6, -0.6], [1.4, 3.6, 1.7]] as const) {
        g.beginPath();
        g.ellipse(b.x, b.y, r * 0.92, r * 0.5, tilt, a0, a1);
        g.stroke();
      }
      dot(g, b.x - r * 0.34, b.y - r * 0.4, r * 0.22, shade(c, 0.4));
    }
  }
}
