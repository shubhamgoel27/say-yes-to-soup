import type { Dir } from '../../engine/input';
import type { AudioBus } from '../../engine/audio';
import { surface, rect, rr, oval, dot, vgrad, shade, glowSpot, softShadow, Rng, type Surface } from '../../art/pix';
import { Scene, mountScene, easeInCubic, easeOutCubic, wobble } from './scene';

/**
 * The highlands' hands-on verb: the watia earth oven, built with Justina at
 * the terrace edge after the dig.
 *
 * WatiaPanel: three phases, none failable.
 *  1. stack: five clods placed with the arrows and Space; they rise into a
 *     little dome over the papas.
 *  2. fire: rhythm presses feed the mouth of the oven until the clods glow.
 *     Overfeeding is not a mistake, it is a show; Justina just whistles.
 *  3. collapse: one committed press brings the dome down on the papas, which
 *     is the whole point and the best part.
 *
 * Painted as a dusk terrace: real clods with baked ember-glow, heat shimmer,
 * and the dome tumbling down in a golden flash at the end.
 */

type WatiaPhase = 'stack' | 'fire' | 'collapse' | 'done';

/** Slot positions along the dome arc, in percent of the scene box. */
const SLOTS: { x: number; y: number; s: number }[] = [
  { x: 22, y: 74, s: 30 }, // left footing
  { x: 66, y: 74, s: 30 }, // right footing
  { x: 27, y: 56, s: 26 }, // left shoulder
  { x: 61, y: 56, s: 26 }, // right shoulder
  { x: 44, y: 44, s: 24 }, // the crown
];

/** Percent slots mapped into scene pixels: the dome sits big on the dug row. */
function slotPx(i: number): { x: number; y: number; w: number; h: number } {
  const s = SLOTS[i]!;
  return { x: 145 + s.x * 3.5, y: 272 + (s.y - 74) * 1.9, w: s.s * 3.5, h: s.s * 2.2 };
}

/** Where each clod lands when the dome comes down: a proper heap over the papas. */
function fallenPx(i: number): { x: number; y: number } {
  const p = slotPx(i);
  return { x: p.x + (300 - p.x) * 0.55, y: i === 4 ? 280 : i >= 2 ? 292 : 298 };
}

const FALL_DELAY = [0.3, 0.36, 0.16, 0.22, 0.04];

const calm = () => document.body.classList.contains('reduce-motion');

// ------------------------------------------------------------- baked artwork
let bgCache: Surface | null = null;
let emberGlow: HTMLCanvasElement | null = null;
let meterBar: Surface | null = null;
const coldClods: (Surface | null)[] = [null, null, null, null, null];
const hotClods: (Surface | null)[] = [null, null, null, null, null];
let papasCache: Surface | null = null;
let splitPapa: Surface | null = null;

function emberCv(): HTMLCanvasElement {
  if (!emberGlow) {
    const s = surface(160, 160);
    glowSpot(s.g, 80, 80, 78, '#ff8c28', 1);
    emberGlow = s.cv;
  }
  return emberGlow;
}

function bg(): Surface {
  if (bgCache) return bgCache;
  const s = surface(640, 340);
  const g = s.g;
  const rng = new Rng(4021);

  // Dusk sky over the pampa, the sun going down low and gold.
  const sky = g.createLinearGradient(0, 0, 0, 175);
  sky.addColorStop(0, '#9dbfd3');
  sky.addColorStop(0.6, '#e5d3a6');
  sky.addColorStop(1, '#efd9a2');
  g.fillStyle = sky;
  g.fillRect(0, 0, 640, 340);
  glowSpot(g, 512, 104, 74, '#ffe9b0', 0.9);
  dot(g, 512, 104, 16, '#f9edd0');

  // Two quiet birds heading home.
  g.strokeStyle = 'rgba(70,60,50,0.55)';
  g.lineWidth = 1.4;
  for (const [bx, by, sw] of [[150, 46, 5], [172, 56, 4]] as const) {
    g.beginPath();
    g.moveTo(bx - sw, by);
    g.quadraticCurveTo(bx - sw * 0.3, by - sw * 0.8, bx, by);
    g.quadraticCurveTo(bx + sw * 0.3, by - sw * 0.8, bx + sw, by);
    g.stroke();
  }

  // Cordillera veils.
  g.fillStyle = '#8d93b8';
  g.beginPath();
  g.moveTo(0, 170);
  g.lineTo(60, 112);
  g.lineTo(128, 152)
  g.lineTo(196, 100);
  g.lineTo(268, 158);
  g.lineTo(340, 126);
  g.lineTo(430, 170);
  g.lineTo(0, 170);
  g.closePath();
  g.fill();
  g.fillStyle = '#eef0f4';
  g.beginPath();
  g.moveTo(186, 111);
  g.lineTo(196, 100);
  g.lineTo(207, 112);
  g.lineTo(196, 116);
  g.closePath();
  g.fill();
  g.fillStyle = '#a4a9c6';
  g.beginPath();
  g.moveTo(340, 170);
  g.lineTo(470, 106);
  g.lineTo(610, 170);
  g.closePath();
  g.fill();

  // Terraces stepping down toward the viewer.
  const bands = ['#a8a05c', '#96975a', '#7f9152'];
  for (let i = 0; i < 3; i++) {
    const y = 152 + i * 16;
    g.fillStyle = bands[i]!;
    g.beginPath();
    g.moveTo(0, y + 18);
    g.quadraticCurveTo(320, y - 7 + (i % 2) * 9, 640, y + 16);
    g.lineTo(640, y + 40);
    g.lineTo(0, y + 40);
    g.closePath();
    g.fill();
    g.strokeStyle = 'rgba(90,84,40,0.4)';
    g.lineWidth = 1.6;
    g.beginPath();
    g.moveTo(0, y + 18);
    g.quadraticCurveTo(320, y - 7 + (i % 2) * 9, 640, y + 16);
    g.stroke();
  }

  // The dug row up front: dark turned earth, still holding the day's heat.
  vgrad(g, 0, 202, 640, 138, '#63492b', '#352513');
  g.beginPath();
  g.moveTo(0, 212);
  g.quadraticCurveTo(320, 198, 640, 210);
  g.lineTo(640, 202);
  g.lineTo(0, 202);
  g.closePath();
  g.fillStyle = '#7f9152';
  g.fill();
  for (let i = 0; i < 5; i++) {
    g.strokeStyle = 'rgba(30,20,10,0.35)';
    g.lineWidth = 3;
    g.beginPath();
    g.moveTo(0, 232 + i * 24);
    g.quadraticCurveTo(320, 224 + i * 24, 640, 234 + i * 24);
    g.stroke();
  }
  for (let i = 0; i < 52; i++) {
    const y = 214 + rng.int(120);
    g.globalAlpha = 0.5;
    oval(g, rng.int(640), y, 3 + rng.next() * 4.5, 2 + rng.next() * 2.4, rng.chance(0.5) ? '#6b4a32' : '#4a3620');
  }
  g.globalAlpha = 1;

  // The chakitaqlla leaning where the dig left it.
  g.strokeStyle = '#7a5636';
  g.lineWidth = 7;
  g.lineCap = 'round';
  g.beginPath();
  g.moveTo(58, 330);
  g.lineTo(106, 172);
  g.stroke();
  g.lineWidth = 5;
  g.beginPath();
  g.moveTo(78, 264);
  g.lineTo(104, 256);
  g.stroke();
  g.fillStyle = '#6b655c';
  g.beginPath();
  g.moveTo(52, 340);
  g.lineTo(62, 316);
  g.lineTo(72, 323);
  g.lineTo(63, 340);
  g.closePath();
  g.fill();

  // Spare clods waiting in a heap by Justina's feet.
  softShadow(g, 508, 322, 56, 15, 0.3);
  for (const [cx, cy, cr] of [[488, 316, 15], [514, 318, 17], [532, 308, 12], [502, 302, 13]] as const) {
    oval(g, cx, cy, cr, cr * 0.7, '#6b4a32');
    oval(g, cx - cr * 0.25, cy - cr * 0.3, cr * 0.5, cr * 0.3, shade('#6b4a32', 0.14));
  }
  softShadow(g, 583, 322, 34, 10, 0.3);

  // The fire pit: scorched earth ringed with small stones.
  oval(g, 300, 294, 112, 27, '#241a10');
  oval(g, 300, 293, 103, 22, '#19110a');
  for (let i = 0; i < 11; i++) {
    const a = (i / 11) * Math.PI * 2;
    dot(g, 300 + Math.cos(a) * 110, 294 + Math.sin(a) * 24, 3.6, i % 2 ? '#8c8479' : '#6b655c');
  }

  const vig = g.createRadialGradient(320, 170, 160, 320, 170, 390);
  vig.addColorStop(0, 'rgba(0,0,0,0)');
  vig.addColorStop(1, 'rgba(40,26,16,0.28)');
  g.fillStyle = vig;
  g.fillRect(0, 0, 640, 340);

  bgCache = s;
  return s;
}

let justinaCache: Surface | null = null;

/** Justina supervising, hands folded, montera against the dusk. Feet at the sprite's bottom center. */
function justinaCv(): Surface {
  if (justinaCache) return justinaCache;
  const s = surface(76, 118);
  const g = s.g;
  const cx = 38;
  // Pollera skirt, layered, with a golden hem.
  g.fillStyle = '#38506e';
  g.beginPath();
  g.moveTo(cx - 13, 52);
  g.quadraticCurveTo(cx - 24, 96, cx - 26, 112);
  g.lineTo(cx + 26, 112);
  g.quadraticCurveTo(cx + 24, 96, cx + 13, 52);
  g.closePath();
  g.fill();
  rect(g, cx - 26, 106, 52, 4, '#c8a55b');
  rect(g, cx - 25, 98, 50, 2.4, shade('#38506e', -0.3));
  // Lliclla over the shoulders, sky-deep with a stripe.
  g.fillStyle = '#5f9fc4';
  g.beginPath();
  g.moveTo(cx - 15, 28);
  g.quadraticCurveTo(cx - 20, 42, cx - 14, 56);
  g.lineTo(cx + 14, 56);
  g.quadraticCurveTo(cx + 20, 42, cx + 15, 28);
  g.closePath();
  g.fill();
  rect(g, cx - 15, 40, 30, 3, '#c8a55b');
  oval(g, cx, 56, 14, 5, shade('#5f9fc4', -0.25));
  // Folded hands.
  oval(g, cx, 58, 6.5, 4, '#c08050');
  // Head, braids, montera.
  dot(g, cx, 22, 10, '#c08050');
  oval(g, cx - 3, 20, 3, 2, shade('#c08050', 0.18));
  g.strokeStyle = '#20140c';
  g.lineWidth = 4;
  g.beginPath();
  g.moveTo(cx - 9, 20);
  g.quadraticCurveTo(cx - 13, 36, cx - 11, 50);
  g.moveTo(cx + 9, 20);
  g.quadraticCurveTo(cx + 13, 36, cx + 11, 50);
  g.stroke();
  oval(g, cx, 13, 15, 5.5, '#8a3a2e');
  oval(g, cx, 10, 9, 4, shade('#8a3a2e', 0.12));
  rect(g, cx - 15, 12, 30, 2, shade('#8a3a2e', -0.3));
  justinaCache = s;
  return s;
}

/** Bake one clod twice, cold and ember-hot, from the same lumpy geometry. */
function bakeClod(i: number): void {
  const p = slotPx(i);
  const w = p.w;
  const h = p.h;
  const rng = new Rng(31 + i * 77);
  const lumps: { dx: number; dy: number; r: number }[] = [];
  for (let l = 0; l < 5; l++) {
    lumps.push({ dx: (rng.next() - 0.5) * w * 0.6, dy: (rng.next() - 0.5) * h * 0.44, r: w * (0.2 + rng.next() * 0.14) });
  }
  const cracks: [number, number][][] = [];
  for (let c = 0; c < 3; c++) {
    const pts: [number, number][] = [];
    let x = -w * 0.34;
    let y = (rng.next() - 0.5) * h * 0.4;
    for (let k = 0; k < 4; k++) {
      pts.push([x, y]);
      x += w * 0.22;
      y += (rng.next() - 0.5) * h * 0.36;
    }
    cracks.push(pts);
  }
  const paint = (hot: boolean): Surface => {
    const s = surface(w + 20, h + 20);
    const g = s.g;
    g.translate(w / 2 + 10, h / 2 + 10);
    const base = hot ? '#54291a' : '#6b4a32';
    oval(g, 0, 0, w * 0.48, h * 0.46, base);
    for (const l of lumps) {
      oval(g, l.dx, l.dy, l.r, l.r * 0.72, base);
      oval(g, l.dx - l.r * 0.2, l.dy - l.r * 0.28, l.r * 0.6, l.r * 0.36, shade(base, hot ? 0.22 : 0.16));
    }
    oval(g, 0, h * 0.2, w * 0.4, h * 0.22, shade(base, -0.24));
    if (hot) {
      glowSpot(g, 0, 0, w * 0.5, '#ff8c28', 0.5);
      g.lineCap = 'round';
      for (const pts of cracks) {
        g.strokeStyle = '#ff9a3d';
        g.lineWidth = 2.4;
        g.beginPath();
        for (let k = 0; k < pts.length; k++) {
          const [px, py] = pts[k]!;
          if (k === 0) g.moveTo(px, py);
          else g.lineTo(px, py);
        }
        g.stroke();
        for (const [px, py] of pts) dot(g, px, py, 1.8, '#ffd75e');
      }
    } else {
      for (let d = 0; d < 4; d++) dot(g, (rng.next() - 0.5) * w * 0.6, (rng.next() - 0.5) * h * 0.4, 1.6, shade(base, -0.35));
    }
    return s;
  };
  coldClods[i] = paint(false);
  hotClods[i] = paint(true);
}

function clodCv(i: number, hot: boolean): Surface {
  if (!coldClods[i]) bakeClod(i);
  return (hot ? hotClods[i] : coldClods[i])!;
}

/** The three papas waiting in the pit: golden, purple, oca-orange. */
function papasCv(): Surface {
  if (papasCache) return papasCache;
  const s = surface(96, 30);
  const g = s.g;
  const draw = (x: number, y: number, rx: number, ry: number, c: string) => {
    oval(g, x, y, rx, ry, c);
    oval(g, x - rx * 0.28, y - ry * 0.34, rx * 0.5, ry * 0.4, shade(c, 0.2));
    for (let d = 0; d < 3; d++) dot(g, x - rx * 0.5 + d * rx * 0.5, y + (d % 2) * 3 - 1, 1.1, shade(c, -0.35));
  };
  draw(18, 16, 13, 9, '#c9a35f');
  draw(46, 19, 11, 8, '#6a3f66');
  draw(74, 16, 13, 8, '#b8803e');
  papasCache = s;
  return s;
}

/** One papa raked out and split open, steam-ready. */
function splitPapaCv(): Surface {
  if (splitPapa) return splitPapa;
  const s = surface(44, 24);
  const g = s.g;
  oval(g, 13, 14, 11, 8, '#a6813e');
  oval(g, 13, 11, 9.5, 5, '#f0d9a8');
  oval(g, 12, 10, 6, 2.6, '#f9ecca');
  oval(g, 32, 15, 10, 7, '#a6813e');
  oval(g, 32, 12, 8.5, 4.4, '#eed4a0');
  splitPapa = s;
  return s;
}

function meterCv(): Surface {
  if (meterBar) return meterBar;
  const s = surface(200, 10);
  const grad = s.g.createLinearGradient(0, 0, 200, 0);
  grad.addColorStop(0, '#8a4a2e');
  grad.addColorStop(0.6, '#e8722c');
  grad.addColorStop(1, '#ffd75e');
  s.g.fillStyle = grad;
  s.g.beginPath();
  s.g.roundRect(0, 0, 200, 10, 5);
  s.g.fill();
  meterBar = s;
  return s;
}

const WATIA_LEGEND = [
  { keys: ['left', 'right'], does: 'choose a gap in the dome' },
  { keys: ['space'], does: 'set the clod in it' },
] as const;

export class WatiaPanel {
  private phase: WatiaPhase = 'stack';
  private placed: boolean[] = [];
  private cursor = 0;
  private glow = 0; // 0..1 the clods' heat
  private best = 0; // highest glow reached, for the overshoot whistle
  private pulse = 0; // fire flicker clock
  private fallen = false;
  private hint = '';
  private onDone: (() => void) | null = null;

  // Visual state only; game logic never reads any of this.
  private scene = new Scene();
  private setHintFn: ((h: string) => void) | null = null;
  private dropOff: number[] = [];
  private squash: number[] = [];
  private fallT: number[] = [];
  private flare = 1;
  private popped = false;
  private papaPop = 0;
  private doneT = 0;
  private emberAcc = 0;
  private shimmerAcc = 0;
  private steamAcc = 0;

  constructor(
    private root: HTMLElement,
    private audio: AudioBus,
  ) {}

  get isOpen(): boolean {
    return !this.root.hidden;
  }

  open(onDone: () => void) {
    this.onDone = onDone;
    this.phase = 'stack';
    this.placed = SLOTS.map(() => false);
    this.cursor = 0;
    this.glow = 0;
    this.best = 0;
    this.pulse = 0;
    this.fallen = false;
    this.hint = 'Big ones at the bottom. Arrows pick a spot; Space sets the clod.';
    this.root.hidden = false;
    this.scene.restart();
    this.setHintFn = mountScene(this.root, 'The Watia', this.scene, WATIA_LEGEND).setHint;
    const hintEl = this.root.querySelector('.w-hint') as HTMLElement | null;
    if (hintEl) hintEl.style.lineHeight = '1.4'; // a parent zeroes line-height; wrapped hints must not overlap
    this.dropOff = SLOTS.map(() => 0);
    this.squash = SLOTS.map(() => 0);
    this.fallT = SLOTS.map(() => 0);
    this.flare = 1;
    this.popped = false;
    this.papaPop = 0;
    this.doneT = 0;
    this.emberAcc = this.shimmerAcc = this.steamAcc = 0;
  }

  tick(dt: number) {
    if (!this.isOpen) return;
    this.pulse += dt;
    if (this.phase === 'fire') {
      this.glow = Math.max(0, this.glow - dt * 0.055);
    }
    const sdt = this.scene.frame(dt, (g) => this.paint(g));
    this.emit(sdt);
    this.setHintFn?.(this.hint);
  }

  onDir(dir: Dir) {
    if (this.phase !== 'stack') return;
    if (dir === 'left' || dir === 'up') this.cursor = (this.cursor + SLOTS.length - 1) % SLOTS.length;
    if (dir === 'right' || dir === 'down') this.cursor = (this.cursor + 1) % SLOTS.length;
  }

  onAction() {
    if (this.phase === 'stack') {
      if (this.placed[this.cursor]) {
        this.audio.bump();
        this.hint = 'That one is set. The dome wants a gap filled, not a clod polished.';
        const slot = this.cursor;
        this.scene.tween(1, 0, 0.25, easeOutCubic, (v) => (this.squash[slot] = v * 0.5));
      } else {
        this.placed[this.cursor] = true;
        this.audio.dig();
        this.animPlace(this.cursor);
        const left = this.placed.filter((p) => !p).length;
        this.hint =
          left > 0
            ? `Good. It holds. ${left} more and the little house has a roof.`
            : 'A dome! Crooked, and standing anyway. Now the fire goes in the mouth.';
        if (left === 0) {
          this.phase = 'fire';
          this.glow = 0.12;
          this.hint = 'Feed the fire: press Space with the flame, steady as a heartbeat.';
        }
      }
    } else if (this.phase === 'fire') {
      this.glow = Math.min(1.35, this.glow + 0.11);
      this.best = Math.max(this.best, this.glow);
      this.audio.weaveNote(Math.floor(this.glow * 6));
      this.animFeed();
      if (this.glow >= 1) {
        this.phase = 'collapse';
        this.scene.flash('#ffb45e', 0.25);
        this.hint =
          this.best > 1.2
            ? 'Justina whistles, long and low. The clods are practically stars. Space: bring it all down on the papas.'
            : 'The clods glow like a small sunset. Space: bring the dome down on the papas.';
      } else if (this.glow > 0.75) {
        this.hint = 'Almost. The clods are blushing. Keep the rhythm.';
      } else {
        this.hint = 'The fire eats and asks for more. Steady presses, like a heartbeat.';
      }
    } else if (this.phase === 'collapse') {
      this.fallen = true;
      this.phase = 'done';
      this.audio.weaveDone();
      this.animCollapse();
      this.hint = 'WHUMP. Earth over embers over papas. The field is cooking its own. Press Space.';
    } else if (this.phase === 'done') {
      this.root.hidden = true;
      const done = this.onDone;
      this.onDone = null;
      done?.();
    }
  }

  // ------------------------------------------------------- animation triggers

  private animPlace(i: number) {
    this.dropOff[i] = -120;
    this.scene.tween(-120, 0, 0.3, easeInCubic, (v) => (this.dropOff[i] = v), () => {
      if (!calm()) this.scene.thump(3, 0.03);
      this.squash[i] = 1;
      this.scene.tween(1, 0, 0.32, easeOutCubic, (v) => (this.squash[i] = v));
      const p = slotPx(i);
      this.scene.burst(p.x, p.y + p.h * 0.3, {
        n: calm() ? 4 : 9, kind: 'puff', color: 'rgba(150,116,80,0.55)', speed: 55, grav: -10, life: 0.6, size: 4,
      });
    });
  }

  private animFeed() {
    this.flare = 1.55;
    this.scene.tween(1.55, 1, 0.35, easeOutCubic, (v) => (this.flare = v));
    if (!calm()) this.scene.thump(1.6, 0.02);
    this.scene.burst(300, 248, {
      n: calm() ? 3 : 8, kind: 'spark', color: '#ffcf6a', speed: 65, grav: -110, life: 0.55, size: 2.4,
    });
  }

  /** The dome comes down clod by clod, crown first, then the golden reveal. */
  private animCollapse() {
    for (let i = 0; i < SLOTS.length; i++) {
      const idx = i;
      this.scene.tween(0, 1, FALL_DELAY[i] ?? 0.2, easeInCubic, () => {}, () => {
        this.scene.tween(0, 1, 0.32, easeInCubic, (v) => (this.fallT[idx] = v), () => {
          const f = fallenPx(idx);
          if (idx === 4 && !calm()) this.scene.thump(6, 0.08);
          this.scene.burst(f.x, f.y + 8, {
            n: calm() ? 4 : 10, kind: 'puff', color: 'rgba(140,105,70,0.6)', speed: 70, grav: -8, life: 0.7, size: 5,
          });
          this.scene.burst(f.x, f.y, { n: calm() ? 2 : 6, kind: 'spark', color: '#ffb347', speed: 90, grav: 60, life: 0.5, size: 2.2 });
        });
      });
    }
    this.scene.flash('#ffdf9a', 0.35);
    // After the dust, one papa tumbles out for the cook's tithe.
    this.scene.tween(0, 1, 1.05, easeInCubic, () => {}, () => {
      this.popped = true;
      this.scene.flash('#ffd98a', 0.4);
      if (!calm()) this.scene.thump(3, 0.04);
      this.scene.burst(316, 288, { n: calm() ? 5 : 12, kind: 'spark', color: '#ffd75e', speed: 110, grav: 140, life: 0.7, size: 2.6 });
      this.scene.tween(0, 1, 0.6, easeOutCubic, (v) => (this.papaPop = v));
    });
  }

  private emit(sdt: number) {
    if (sdt <= 0) return;
    const q = calm() ? 0.4 : 1;
    if (this.phase === 'fire' || this.phase === 'collapse') {
      this.emberAcc += sdt * (1.5 + this.glow * 4.5) * q;
      while (this.emberAcc > 1) {
        this.emberAcc -= 1;
        this.scene.burst(282 + Math.random() * 36, 244, { n: 1, kind: 'spark', color: '#ffcf6a', speed: 26, grav: -85, life: 0.8, size: 2 });
      }
      this.shimmerAcc += sdt * (2 + this.glow * 3) * q;
      while (this.shimmerAcc > 1) {
        this.shimmerAcc -= 1;
        this.scene.waft(230 + Math.random() * 140, 186, 'rgba(255,236,200,0.14)', 14);
      }
    } else if (this.phase === 'done') {
      this.doneT += sdt;
      this.steamAcc += sdt * 2.6 * q;
      while (this.steamAcc > 1) {
        this.steamAcc -= 1;
        this.scene.waft(258 + Math.random() * 84, 268, 'rgba(255,252,244,0.4)', 8);
        if (this.popped && this.papaPop >= 1) this.scene.waft(426 + Math.random() * 12, 288, 'rgba(255,252,244,0.45)', 5);
      }
    }
  }

  // ----------------------------------------------------------------- painting

  private paint(g: CanvasRenderingContext2D) {
    const time = this.scene.time;
    g.drawImage(bg().cv, 0, 0);

    // Justina keeps watch by the clod pile, swaying just enough to be alive.
    const jd = justinaCv();
    g.save();
    g.translate(583, 322);
    g.rotate(Math.sin(time * 1.1) * 0.02);
    g.drawImage(jd.cv, -jd.cv.width / 2, -jd.cv.height + 4);
    g.restore();

    const heat = Math.min(1, this.glow);
    const emberFade = this.phase === 'done' ? Math.max(0.3, 1 - this.doneT * 0.12) : 1;

    // The baked ember glow breathing behind the whole oven.
    if (this.phase !== 'stack') {
      const r = 135 + heat * 70 + Math.sin(this.pulse * 5) * 7;
      g.globalAlpha = (0.2 + heat * 0.45) * emberFade;
      g.drawImage(emberCv(), 300 - r, 252 - r * 0.62, r * 2, r * 1.24);
      g.globalAlpha = 1;
    }

    // Papas in the pit, until the earth takes them.
    if (!this.fallen) g.drawImage(papasCv().cv, 238, 273, 124, 39);

    if (this.phase === 'stack') this.paintGhosts(g, time);
    if (this.fallen) {
      const settle = Math.min(1, (this.fallT[0] ?? 0) + (this.fallT[1] ?? 0));
      g.globalAlpha = settle * 0.9;
      oval(g, 300, 299, 118, 28, '#4a3521');
      g.globalAlpha = 1;
    }
    this.paintClods(g, heat, emberFade);
    if (this.phase === 'fire' || this.phase === 'collapse') this.paintFlame(g, time);
    if (this.phase === 'stack') this.paintCursor(g, time);
    if (this.popped) this.paintPoppedPapa(g);
    if (this.phase === 'fire') this.paintMeter(g);
  }

  private paintGhosts(g: CanvasRenderingContext2D, time: number) {
    for (let i = 0; i < SLOTS.length; i++) {
      if (this.placed[i]) continue;
      const p = slotPx(i);
      const cur = i === this.cursor;
      if (cur) {
        g.globalAlpha = 0.35 + 0.15 * Math.sin(time * 5);
        g.drawImage(emberCv(), p.x - p.w * 0.7, p.y - p.w * 0.7, p.w * 1.4, p.w * 1.4);
        g.globalAlpha = 1;
      }
      g.save();
      g.setLineDash([7, 6]);
      g.lineDashOffset = cur ? -time * 14 : 0;
      g.strokeStyle = cur ? '#f4d06f' : 'rgba(255,246,230,0.4)';
      g.lineWidth = cur ? 2.4 : 1.8;
      const sc = cur ? 1 + 0.04 * Math.sin(time * 5) : 1;
      g.beginPath();
      g.ellipse(p.x, p.y, p.w * 0.48 * sc, p.h * 0.44 * sc, 0, 0, Math.PI * 2);
      g.stroke();
      g.restore();
    }
  }

  private paintClods(g: CanvasRenderingContext2D, heat: number, emberFade: number) {
    for (let i = 0; i < SLOTS.length; i++) {
      if (!this.placed[i]) continue;
      const p = slotPx(i);
      const f = fallenPx(i);
      const ft = this.fallT[i] ?? 0;
      const x = p.x + (f.x - p.x) * ft;
      const y = p.y + (f.y - p.y) * ft + (this.dropOff[i] ?? 0);
      const sq = this.squash[i] ?? 0;
      const cold = clodCv(i, false);
      const hot = clodCv(i, true);
      const shadowK = Math.max(0, 1 - Math.abs(this.dropOff[i] ?? 0) / 120);
      oval(g, x, p.y + (f.y - p.y) * ft + p.h * 0.42, p.w * 0.5 * shadowK, p.h * 0.16 * shadowK, 'rgba(20,12,6,0.35)');
      g.save();
      g.translate(x, y);
      if (ft > 0 && ft < 1) g.rotate((i % 2 ? 1 : -1) * 0.35 * ft);
      g.scale(1 + sq * 0.22, 1 - sq * 0.26);
      g.drawImage(cold.cv, -cold.cv.width / 2, -cold.cv.height / 2);
      const flick = 0.85 + 0.15 * Math.sin(this.pulse * 7 + i * 1.7);
      const hotA = heat * flick * emberFade * (this.phase === 'stack' ? 0 : 1);
      if (hotA > 0.01) {
        g.globalAlpha = hotA;
        g.drawImage(hot.cv, -hot.cv.width / 2, -hot.cv.height / 2);
        g.globalAlpha = 1;
      }
      g.restore();
      // Overshoot heat: white-hot glints when the glow passes its peak.
      if (this.glow > 1.05 && !this.fallen) {
        dot(g, x + Math.sin(this.pulse * 9 + i * 2) * p.w * 0.2, y - p.h * 0.1, 1.8, '#fff3c0');
      }
    }
  }

  private paintFlame(g: CanvasRenderingContext2D, time: number) {
    const x = 300;
    const y = 296;
    const fl = this.flare * (1 + 0.09 * Math.sin(time * 11) + 0.05 * Math.sin(time * 23));
    const lean = Math.sin(time * 7) * 5;
    const tongue = (w: number, h: number, c: string, a: number) => {
      g.globalAlpha = a;
      g.fillStyle = c;
      g.beginPath();
      g.moveTo(x - w, y);
      g.quadraticCurveTo(x - w * 0.9, y - h * 0.55, x + lean * (h / 46), y - h);
      g.quadraticCurveTo(x + w * 0.9, y - h * 0.55, x + w, y);
      g.closePath();
      g.fill();
    };
    g.globalAlpha = 0.55;
    g.drawImage(emberCv(), x - 52, y - 68, 104, 104);
    tongue(18, 56 * fl, '#e8722c', 0.92);
    tongue(11.5, 38 * fl, '#ffb347', 0.95);
    tongue(6.5, 21 * fl, '#ffe9a8', 1);
    g.globalAlpha = 1;
  }

  private paintCursor(g: CanvasRenderingContext2D, time: number) {
    if (!this.placed[this.cursor]) return;
    const p = slotPx(this.cursor);
    g.strokeStyle = '#f4d06f';
    g.lineWidth = 2.4;
    g.beginPath();
    g.ellipse(p.x, p.y, p.w * 0.56 + Math.sin(time * 5) * 1.5, p.h * 0.5 + Math.sin(time * 5), 0, 0, Math.PI * 2);
    g.stroke();
  }

  private paintPoppedPapa(g: CanvasRenderingContext2D) {
    const t = this.papaPop;
    const x = 316 + 114 * t;
    const y = 294 - 170 * t * (1 - t);
    if (t < 1) {
      softShadow(g, 430, 306, 18, 6, 0.25 * t);
      g.save();
      g.translate(x, y);
      g.rotate(t * 5.2);
      oval(g, 0, 0, 13, 9.5, '#c9a35f');
      oval(g, -3.4, -3.4, 6.5, 3.8, shade('#c9a35f', 0.2));
      g.restore();
    } else {
      g.drawImage(splitPapaCv().cv, 406, 286, 53, 29);
    }
  }

  private paintMeter(g: CanvasRenderingContext2D) {
    const w = 200;
    const x = 220;
    const y = 318;
    rr(g, x - 3, y - 3, w + 6, 16, 8, 'rgba(20,12,6,0.55)');
    const frac = Math.min(1, this.glow);
    if (frac > 0.01) {
      g.drawImage(meterCv().cv, 0, 0, w * frac, 10, x, y, w * frac, 10);
    }
    const gk = wobble(this.pulse, 6) * 0.5 + 0.5;
    dot(g, x + w * frac, y + 5, 3 + gk * 1.5, '#ffd75e');
  }
}
