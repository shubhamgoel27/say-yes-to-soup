import type { Dir } from '../../engine/input';
import type { AudioBus } from '../../engine/audio';
import { Scene, mountScene, easeInCubic, easeOutCubic, easeOutElastic, easeInOutSine, wobble, squashed, keyCap, paperTag } from './scene';
import { Rng, dot, oval, rr, rect, vgrad, surface, shade, glowSpot } from '../../art/pix';

/**
 * Busan's hands-on verb: the hotteok griddle.
 *
 * HotteokPanel: three discs of dough, one spatula, one moment each. A heat
 * marker slides across the griddle track; press Space inside the golden zone
 * to flip clean. A mistimed press burns that one past gold, which ends the
 * batch and costs nothing: Mi-ja claims the dark one, hands you fresh dough,
 * and Space starts the batch over on the spot. Nothing wasted, nobody shamed.
 *
 * Visual layer: a market cart at night. Lantern bokeh in the dark, a real
 * cast-iron griddle with an oil sheen, a dough ball that lands with a squash,
 * a brass press that flattens it with a thump and an oil-sparkle burst, then
 * an honest arc of a flip and an eased browning with char freckles. The
 * timing marker is diegetic: the dough's edge goes gold, and a heat gauge
 * arcs over the disc so the eye can be precise about it.
 */

type HotteokPhase = 'press' | 'burnt' | 'done';

const ROUNDS = 3;

// ---------------------------------------------------------------- stagecraft
const W = 640;
const H = 340;
const GX = 320; // griddle center
const GY = 206;
const DX = 252; // the working disc's spot on the iron
const DY = 198;
const TINX = 570; // the paper-lined tin where finished discs stack
const TINY = 282;

const HOTTEOK_LEGEND = [{ keys: ['space'], does: 'press and flip, in the golden middle' }] as const;

/** Mi-ja's dough tray on the counter: what is still to come, in the picture. */
const TRAY_X = 86;
const TRAY_Y = 300;

const RAW = '#f0e3c0';
const GOLD = '#d9a441';
const OVER = '#96602c';

/** Multi-stop browning ramp for the dough's edge: pale, gold, past gold. */
const EDGE_STOPS: [number, string][] = [
  [0, '#f0e3c0'],
  [0.38, '#e2b45f'],
  [0.5, '#d9a441'],
  [0.62, '#c9862f'],
  [1, '#6e4526'],
];

function lerpHex(a: string, b: string, k: number): string {
  const pa = Number.parseInt(a.slice(1), 16);
  const pb = Number.parseInt(b.slice(1), 16);
  const ch = (sh: number) => Math.round(((pa >> sh) & 255) + (((pb >> sh) & 255) - ((pa >> sh) & 255)) * k);
  return `#${((ch(16) << 16) | (ch(8) << 8) | ch(0)).toString(16).padStart(6, '0')}`;
}

function edgeTone(t: number): string {
  for (let i = 1; i < EDGE_STOPS.length; i++) {
    const [t1, c1] = EDGE_STOPS[i]!;
    const [t0, c0] = EDGE_STOPS[i - 1]!;
    if (t <= t1) return lerpHex(c0, c1, (t - t0) / (t1 - t0));
  }
  return EDGE_STOPS[EDGE_STOPS.length - 1]![1];
}

const calm = () => document.body.classList.contains('reduce-motion');
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

/** Where the i-th finished disc rests in the tin. */
const slot = (i: number): [number, number] => [TINX - 13 + i * 13, TINY - 2 - i * 10];

// ------------------------------------------------------------------- baking
// All gradients live here, painted once at 2x and reused every frame.

type Baked = { bg: HTMLCanvasElement; griddle: HTMLCanvasElement; glow: HTMLCanvasElement };
let baked: Baked | null = null;

function bakeGlow(): HTMLCanvasElement {
  const { cv, g } = surface(128, 128);
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, 'rgba(255,213,138,0.9)');
  grad.addColorStop(0.5, 'rgba(255,180,90,0.28)');
  grad.addColorStop(1, 'rgba(255,160,70,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  return cv;
}

function bakeBg(): HTMLCanvasElement {
  const { cv, g } = surface(W * 2, H * 2);
  g.scale(2, 2);
  const rng = new Rng(4177);
  vgrad(g, 0, 0, W, H, '#141126', '#2e1e2c');
  vgrad(g, 0, 140, W, 100, 'rgba(193,81,47,0)', 'rgba(193,81,47,0.18)');
  // Distant stall silhouettes, barely there.
  g.fillStyle = '#1c1730';
  for (let i = 0; i < 5; i++) {
    const x = 20 + i * 130 + rng.int(40);
    rr(g, x, 128 + rng.int(24), 84 + rng.int(50), 80, 6, '#1c1730');
  }
  // Market-lantern bokeh, warm and out of focus.
  const boke = ['#e8a84d', '#d9a441', '#c1512f', '#f2e6d0', '#8a4a7d'];
  for (let i = 0; i < 34; i++) {
    const x = rng.int(W);
    const y = 16 + rng.int(160);
    const r = 3 + rng.next() * 12;
    g.globalAlpha = 0.07 + rng.next() * 0.2;
    dot(g, x, y, r, rng.pick(boke));
  }
  g.globalAlpha = 1;
  // A sagging string of small lanterns across the top.
  g.strokeStyle = 'rgba(20,14,24,0.9)';
  g.lineWidth = 1.6;
  g.beginPath();
  for (let i = 0; i <= 24; i++) {
    const t = i / 24;
    const x = 20 + t * 600;
    const y = 26 + Math.sin(Math.PI * t) * 30;
    if (i === 0) g.moveTo(x, y);
    else g.lineTo(x, y);
  }
  g.stroke();
  for (let i = 0; i <= 8; i++) {
    const t = i / 8;
    const x = 20 + t * 600;
    const y = 26 + Math.sin(Math.PI * t) * 30;
    glowSpot(g, x, y + 10, 24, '#e8a84d', 0.4);
    rr(g, x - 5, y + 2, 10, 13, 4, i % 3 === 1 ? '#d9a441' : '#c1512f');
    rect(g, x - 3, y, 6, 2.4, '#8a6a2f');
    rect(g, x - 3, y + 14.4, 6, 2, '#8a6a2f');
  }
  // Two big paper lanterns flanking the cart, mostly glow.
  glowSpot(g, 86, 66, 84, '#d9a441', 0.3);
  glowSpot(g, 560, 74, 92, '#e07a3f', 0.26);
  oval(g, 86, 66, 20, 25, '#d9a441');
  oval(g, 86, 66, 20, 25, 'rgba(255,240,200,0.25)');
  oval(g, 560, 74, 22, 27, '#c1512f');
  // The cart counter under everything: worn planks catching lantern light.
  vgrad(g, 0, 290, W, 50, '#6e4a2c', '#37220f');
  rr(g, -4, 288, W + 8, 6, 3, '#8a5f38');
  for (let i = 0; i < 9; i++) {
    const x = 8 + i * 74 + rng.int(10);
    rect(g, x, 296, 2, 44, 'rgba(30,18,8,0.5)');
  }
  glowSpot(g, GX, 296, 180, '#c1512f', 0.22);
  // Mi-ja's tray of waiting dough, and her oil can, on the near counter: the
  // batch you have left to cook is a thing on the cart, not a number in prose.
  oval(g, TRAY_X, TRAY_Y + 14, 62, 13, 'rgba(8,5,4,0.45)');
  rr(g, TRAY_X - 58, TRAY_Y - 12, 116, 26, 7, '#3a2c20');
  rr(g, TRAY_X - 55, TRAY_Y - 14, 110, 24, 6, '#6b4a2c');
  rr(g, TRAY_X - 51, TRAY_Y - 11, 102, 15, 4, '#8a5f38');
  rect(g, TRAY_X - 51, TRAY_Y - 11, 102, 2, 'rgba(255,232,190,0.2)');
  glowSpot(g, TRAY_X, TRAY_Y - 6, 54, '#d9a441', 0.12);
  // The oil can beside it, catching one lantern.
  rr(g, TRAY_X + 78, TRAY_Y - 30, 26, 42, 4, '#8c8479');
  rr(g, TRAY_X + 81, TRAY_Y - 27, 8, 36, 3, '#b8b0a4');
  g.strokeStyle = '#8c8479';
  g.lineWidth = 3;
  g.beginPath();
  g.moveTo(TRAY_X + 104, TRAY_Y - 24);
  g.lineTo(TRAY_X + 120, TRAY_Y - 34);
  g.stroke();
  rr(g, TRAY_X + 86, TRAY_Y - 36, 10, 8, 2, '#6e675e');
  // A quiet vignette so the griddle owns the light.
  vgrad(g, 0, 0, W, 46, 'rgba(8,5,12,0.5)', 'rgba(8,5,12,0)');
  vgrad(g, 0, H - 30, W, 30, 'rgba(8,5,12,0)', 'rgba(8,5,12,0.4)');
  return cv;
}

function bakeGriddle(): HTMLCanvasElement {
  const { cv, g } = surface(W * 2, H * 2);
  g.scale(2, 2);
  const rng = new Rng(9301);
  oval(g, GX, GY + 58, 268, 40, 'rgba(8,5,4,0.5)');
  oval(g, GX, GY + 14, 258, 96, '#191410');
  oval(g, GX, GY, 258, 94, '#3b342b');
  oval(g, GX, GY, 236, 82, '#37302a');
  oval(g, GX - 6, GY - 3, 214, 72, '#463e33');
  // Rim bevel catching the lanterns.
  g.strokeStyle = 'rgba(240,220,180,0.12)';
  g.lineWidth = 3;
  g.beginPath();
  g.ellipse(GX, GY, 248, 89, 0, Math.PI * 1.05, Math.PI * 1.75);
  g.stroke();
  // Years of seasoning: faint patina rings.
  g.strokeStyle = 'rgba(20,14,10,0.35)';
  g.lineWidth = 2;
  for (const k of [0.82, 0.6, 0.38]) {
    g.beginPath();
    g.ellipse(GX - 4, GY - 2, 214 * k, 72 * k, 0, 0, Math.PI * 2);
    g.stroke();
  }
  // The oil sheen: one broad soft light and a couple of dragged streaks.
  glowSpot(g, GX - 84, GY - 26, 140, '#7d7057', 0.55);
  glowSpot(g, GX + 70, GY + 20, 96, '#5c523f', 0.4);
  g.globalAlpha = 0.07;
  oval(g, GX - 60, GY - 24, 120, 20, '#ffeecb', -0.35);
  oval(g, GX + 40, GY + 10, 90, 13, '#ffeecb', -0.2);
  g.globalAlpha = 1;
  // Scattered oil beads glinting.
  for (let i = 0; i < 26; i++) {
    const a = rng.next() * Math.PI * 2;
    const k = rng.next() * 0.9;
    g.globalAlpha = 0.1 + rng.next() * 0.14;
    dot(g, GX + Math.cos(a) * 210 * k, GY + Math.sin(a) * 70 * k, 0.8 + rng.next() * 1.4, '#ffe8c0');
  }
  g.globalAlpha = 1;
  // Handle lugs.
  rr(g, GX - 288, GY - 10, 34, 20, 8, '#241d16');
  rr(g, GX + 254, GY - 10, 34, 20, 8, '#241d16');
  // Coal light breathing up from under the rim.
  glowSpot(g, GX, GY + 92, 110, '#e06a2f', 0.28);
  // The paper-lined tin, waiting on the counter beside the iron.
  oval(g, TINX, TINY + 16, 52, 15, 'rgba(10,6,4,0.45)');
  oval(g, TINX, TINY + 10, 50, 17, '#59544c');
  oval(g, TINX, TINY + 7, 50, 17, '#8c8479');
  oval(g, TINX, TINY + 7, 43, 13, '#544f47');
  oval(g, TINX, TINY + 6, 41, 12, '#efe4cc');
  g.strokeStyle = 'rgba(120,100,70,0.5)';
  g.lineWidth = 1;
  for (let i = 0; i < 4; i++) {
    g.beginPath();
    g.moveTo(TINX - 32 + i * 17, TINY + 1);
    g.lineTo(TINX - 24 + i * 17, TINY + 11);
    g.stroke();
  }
  glowSpot(g, TINX - 20, TINY - 2, 40, '#d9a441', 0.14);
  return cv;
}

function bake(): Baked {
  if (!baked) baked = { bg: bakeBg(), griddle: bakeGriddle(), glow: bakeGlow() };
  return baked;
}

// ------------------------------------------------------------- disc painting

/** A finished disc, golden or browned past gold, char freckles and all. */
function cookedDisc(
  g: CanvasRenderingContext2D,
  x: number,
  y: number,
  rx: number,
  ry: number,
  gold: boolean,
  seed: number,
  freckA: number,
) {
  const base = gold ? GOLD : OVER;
  oval(g, x, y + ry * 0.18, rx, ry, shade(base, -0.5));
  oval(g, x, y, rx, ry, base);
  oval(g, x - rx * 0.08, y - ry * 0.08, rx * 0.6, ry * 0.6, shade(base, -0.12));
  g.strokeStyle = gold ? '#a8712c' : '#5e3a1a';
  g.lineWidth = Math.max(2, rx * 0.06);
  g.beginPath();
  g.ellipse(x, y, rx * 0.94, ry * 0.94, 0, 0, Math.PI * 2);
  g.stroke();
  const rng = new Rng(seed);
  const n = gold ? 11 : 18;
  g.globalAlpha = freckA;
  for (let i = 0; i < n; i++) {
    const a = rng.next() * Math.PI * 2;
    const k = 0.3 + rng.next() * 0.62;
    dot(g, x + Math.cos(a) * rx * k, y + Math.sin(a) * ry * k, (0.8 + rng.next() * 1.6) * (rx / 46), gold ? '#6e4526' : '#33200e');
  }
  // Seeds tucked at the fold, Busan style.
  for (let i = 0; i < 5; i++) {
    const a = rng.next() * Math.PI * 2;
    const k = rng.next() * 0.3;
    oval(g, x + Math.cos(a) * rx * k, y + Math.sin(a) * ry * k, 1.6 * (rx / 46), 1 * (rx / 46), rng.chance(0.5) ? RAW : '#6e4526', a);
  }
  g.globalAlpha = Math.min(1, freckA) * 0.2;
  oval(g, x - rx * 0.3, y - ry * 0.35, rx * 0.36, ry * 0.26, '#fff2d8', -0.4);
  g.globalAlpha = 1;
}

/** The working dough: plump ball easing into a pressed disc, edge browning. */
function doughBall(g: CanvasRenderingContext2D, x: number, y: number, flat: number, edge: string, glowK: number, tm: number) {
  const rx = 30 + 16 * flat;
  const ry = 24 - 3 * flat;
  const dome = 16 - 12 * flat;
  g.globalAlpha = 0.32;
  oval(g, x, y + ry * 0.55, rx * 1.06, ry * 0.5, '#120b06');
  g.globalAlpha = 1;
  if (glowK > 0) {
    g.globalAlpha = 0.35 * glowK * (0.8 + 0.2 * wobble(tm, 6));
    oval(g, x, y + 2, rx * 1.12, ry * 0.98, edge);
    g.globalAlpha = 1;
  }
  oval(g, x, y + 2, rx, ry * 0.9, edge); // the browning base rim, the tell
  oval(g, x, y - dome * 0.35, rx * 0.94, ry * 0.82, '#ecdcae');
  oval(g, x - rx * 0.1, y - dome * 0.5, rx * 0.7, ry * 0.6, '#f3e6ba');
  g.globalAlpha = 0.55;
  oval(g, x - rx * 0.26, y - dome * 0.7, rx * 0.34, ry * 0.26, '#faf0d2', -0.4);
  g.globalAlpha = 0.25 + 0.12 * wobble(tm, 3.4);
  dot(g, x + rx * 0.32, y - dome * 0.2, 1.6, '#fff6dd'); // oil glisten
  dot(g, x - rx * 0.05, y + 2, 1.2, '#fff6dd');
  g.globalAlpha = 1;
}

/** The brass press: flat plate, wooden handle, ready to thump. */
function pressTool(g: CanvasRenderingContext2D, x: number, y: number) {
  rr(g, x - 5, y - 66, 10, 54, 4, '#6e4a2c');
  rr(g, x - 5, y - 66, 4, 54, 3, '#8a6238');
  rr(g, x - 9, y - 17, 18, 9, 3, '#8a6a2f');
  oval(g, x, y + 4, 42, 13, '#71541f');
  oval(g, x, y, 42, 12, '#c9a35f');
  oval(g, x - 6, y - 2, 26, 6.5, '#dcbe7c');
  g.globalAlpha = 0.5;
  oval(g, x - 14, y - 3, 10, 2.6, '#f3e3b4', -0.3);
  g.globalAlpha = 1;
}

// The press timeline, in seconds from the moment of the Space press.
const T_IMPACT = 0.1; // press meets dough
const T_LIFT = 0.28; // press back up
const T_FLIP0 = 0.14; // disc leaves the iron
const T_LAND = 0.56; // disc lands, cooked side up
const T_SLIDE1 = 0.92; // disc arrives in the tin

export class HotteokPanel {
  private phase: HotteokPhase = 'press';
  private round = 0;
  private golden = 0;
  private t = 0; // marker position 0..1, ping-ponging
  private dirn = 1;
  private speed = 0.55;
  private hint = '';
  private onDone: (() => void) | null = null;

  // Visual layer only, below here.
  private scene = new Scene(W, H);
  private setHint: ((h: string) => void) | null = null;
  private results: ('gold' | 'dark')[] = [];
  private landed = 0;
  private anim = -1; // press-and-flip timeline clock, <0 idle
  private animGold = true;
  private hasBall = false;
  private ballDrop = -1; // ball drop timeline clock, <0 inactive
  private ballLandT = 9; // seconds since the ball landed, drives squash
  private steamT = 0;
  private sizzT = 0;
  private smokeT = 0; // the burnt one's dark curl
  private bite = 0; // done-phase reveal 0..1
  private biteHold = 0;
  private winFired = false;

  constructor(
    private root: HTMLElement,
    private audio: AudioBus,
  ) {}

  get isOpen(): boolean {
    return !this.root.hidden;
  }

  open(onDone: () => void) {
    this.onDone = onDone;
    this.phase = 'press';
    this.round = 0;
    this.golden = 0;
    this.t = 0;
    this.dirn = 1;
    this.speed = 0.55;
    this.hint = 'The dough sizzles. Space presses and flips: catch the heat in the golden middle.';
    this.root.hidden = false;
    this.scene.restart();
    this.setHint = mountScene(this.root, 'The Hotteok Griddle', this.scene, HOTTEOK_LEGEND).setHint;
    // The overlay inherits line-height 0 from the stage frame; wrapped hints
    // would overlap themselves. Restore normal leading inside this panel.
    const hintEl = this.root.querySelector('.w-hint') as HTMLElement | null;
    if (hintEl) hintEl.style.lineHeight = '1.45';
    this.results = [];
    this.landed = 0;
    this.anim = -1;
    this.hasBall = false;
    this.ballLandT = 9;
    this.smokeT = 0;
    this.bite = 0;
    this.biteHold = 0;
    this.winFired = false;
    this.startDrop();
    this.setHint(this.hint);
  }

  tick(dt: number) {
    if (!this.isOpen) return;
    // The heat only counts while a ball is actually on the iron: the gauge and
    // the marker appear and move together, so the rhythm is press, flip, wait
    // for the next dough, press. Nothing sweeps past behind the animation.
    if (this.phase === 'press' && this.anim < 0 && this.hasBall) {
      this.t += this.dirn * this.speed * dt;
      if (this.t > 1) {
        this.t = 1;
        this.dirn = -1;
      } else if (this.t < 0) {
        this.t = 0;
        this.dirn = 1;
      }
    }
    this.stepVisual(dt);
    this.scene.frame(dt, (g) => this.paint(g));
    this.setHint?.(this.hint);
  }

  onDir(dir: Dir) {
    void dir; // the griddle only knows one move
  }

  onAction() {
    if (this.phase === 'done') {
      this.root.hidden = true;
      const done = this.onDone;
      this.onDone = null;
      done?.();
      return;
    }
    if (this.phase === 'burnt') {
      // Fresh dough, same hands, no ceremony. The batch simply begins again.
      const done = this.onDone;
      if (done) this.open(done);
      return;
    }
    // The golden middle of the griddle. Early and late are different
    // mistakes and must not be told the same story: pressing as early as
    // physically possible used to report "too late".
    if (this.t < 0.38) {
      // Too soon is not a ruined one. The dough simply is not ready, and
      // Mi-ja will not let you lift it yet.
      this.audio.bump();
      this.hint = 'Not yet. Pale dough, raw fold. Mi-ja taps your wrist and the disc stays down.';
      return;
    }
    if (this.t > 0.62) {
      // A burnt one costs that disc, and only that disc. The card promises
      // exactly this, so the batch must not restart underneath it.
      this.round++;
      this.audio.bump();
      this.scene.flash('#2a1a10', 0.2);
      this.hint =
        this.round >= ROUNDS
          ? 'Past gold, and that is the batch. "Those are mine, then," says Mi-ja, entirely unbothered. Press Space.'
          : `Past gold. <b>Burnt.</b> "That one is mine, then," says Mi-ja, already rolling the next ball. ${ROUNDS - this.round} to go.`;
      this.startFlip(false);
      if (this.round >= ROUNDS) {
        // The batch is finished either way; a burnt one is not a failure
        // state, it is one hotteok Mi-ja eats standing up.
        this.phase = this.golden > 0 ? 'done' : 'burnt';
        if (this.phase === 'done') this.audio.weaveDone();
      } else {
        this.t = 0;
        this.dirn = 1;
      }
      return;
    }
    this.round++;
    this.golden++;
    this.audio.slosh();
    this.hint = [
      'A clean flip. The seeds stay tucked in the fold.',
      'Gold both sides. Mi-ja nods without looking.',
      'The sugar sighs inside. That is the sound of correct.',
    ][(this.golden - 1) % 3] as string;
    if (this.round >= ROUNDS) {
      this.phase = 'done';
      this.audio.weaveDone();
      this.hint = 'Three golden. Dae-ho pretends not to be impressed and fails. Press Space.';
    } else {
      this.t = 0;
      this.dirn = 1;
      this.speed += 0.12;
      this.hint += ` Next disc: ${ROUNDS - this.round} to go.`;
    }
    this.startFlip(true);
  }

  // ------------------------------------------------------------ visual clock

  private startDrop() {
    this.ballDrop = 0;
    this.hasBall = false;
  }

  private startFlip(gold: boolean) {
    // If the last disc is still airborne, it lands instantly; one at a time.
    if (this.anim >= 0) this.landed = this.results.length;
    this.results.push(gold ? 'gold' : 'dark');
    this.anim = 0;
    this.animGold = gold;
    this.hasBall = true; // the press needs something under it, even mid-spam
    this.ballDrop = -1;
  }

  private stepVisual(dt: number) {
    const s = this.scene;
    this.ballLandT += dt;

    if (this.ballDrop >= 0) {
      const prev = this.ballDrop;
      this.ballDrop += dt;
      if (prev < 0.3 && this.ballDrop >= 0.3) {
        this.hasBall = true;
        this.ballDrop = -1;
        this.ballLandT = 0;
        if (!calm()) s.thump(3, 0.03);
        s.burst(DX, DY + 8, { n: calm() ? 3 : 8, speed: 60, color: '#ffe2a0', kind: 'spark', size: 1.6, life: 0.4, grav: 160 });
        s.waft(DX, DY - 16);
      }
    }

    if (this.anim >= 0) {
      const prev = this.anim;
      this.anim += dt;
      if (prev < T_IMPACT && this.anim >= T_IMPACT) {
        if (!calm()) s.thump(6, 0.05);
        s.burst(DX, DY - 6, { n: calm() ? 5 : 16, speed: 170, color: '#ffd98a', kind: 'spark', size: 2.2, life: 0.5, grav: 260 });
        s.waft(DX - 10, DY - 20);
        s.waft(DX + 12, DY - 22);
      }
      if (prev < T_LAND && this.anim >= T_LAND) {
        if (!calm()) s.thump(3.5, 0.03);
        s.burst(DX, DY + 4, { n: calm() ? 3 : 9, speed: 70, color: '#ffe8c0', kind: 'dot', size: 1.8, life: 0.4, grav: 200 });
        if (this.animGold) s.flash('#ffe9b0', 0.16);
        else s.burst(DX, DY - 6, { n: calm() ? 3 : 9, speed: 40, color: '#4a382c', kind: 'puff', size: 5, life: 1.1, grav: -30 });
        s.waft(DX, DY - 18);
      }
      if (this.anim >= T_SLIDE1) {
        this.anim = -1;
        this.landed = this.results.length;
        this.hasBall = false;
        if (this.phase === 'press') this.startDrop();
      }
    }

    if (this.phase === 'done' && this.anim < 0 && this.landed >= this.results.length) {
      if (!this.winFired) {
        this.winFired = true;
        this.scene.flash('#ffe9b0', 0.34);
        s.burst(TINX, TINY - 24, { n: calm() ? 8 : 24, speed: 120, color: '#ffd98a', kind: 'spark', size: 2, life: 0.8, grav: 90 });
      }
      this.biteHold += dt;
      if (this.biteHold > 0.45) this.bite = Math.min(1, this.bite + dt / 0.9);
    }

    // The burnt one keeps announcing itself: a dark curl off wherever it lies.
    if (this.phase === 'burnt') {
      this.smokeT += dt;
      if (this.smokeT >= (calm() ? 0.5 : 0.2)) {
        this.smokeT = 0;
        const [bx, by] = slot(this.results.length - 1);
        const at: [number, number] = this.anim >= 0 ? [DX, DY - 12] : [bx, by - 12];
        s.waft(at[0], at[1], 'rgba(58,44,34,0.5)', 9);
      }
    }

    // Steam wafting all through the night; sizzle glints while dough cooks.
    this.steamT += dt;
    const steamEvery = calm() ? 0.7 : 0.38;
    if (this.steamT >= steamEvery) {
      this.steamT = 0;
      if (this.hasBall && this.anim < 0) s.waft(DX + (Math.random() - 0.5) * 30, DY - 14);
      if (this.landed > 0) s.waft(TINX + (Math.random() - 0.5) * 30, TINY - 12 - this.landed * 6);
      if (this.bite > 0.6) s.waft(DX + 8, DY - 20);
    }
    this.sizzT += dt;
    if (this.sizzT >= (calm() ? 0.6 : 0.22) && this.hasBall && this.anim < 0) {
      this.sizzT = 0;
      const a = Math.random() * Math.PI * 2;
      const sx = DX + Math.cos(a) * 30;
      const sy = DY + 4 + Math.sin(a) * 12;
      s.burst(sx, sy, { n: 1, speed: 30, color: '#ffe8b8', kind: 'spark', size: 1.3, life: 0.3, grav: -40 });
    }
  }

  // ---------------------------------------------------------------- painting

  private paint(g: CanvasRenderingContext2D) {
    const bk = bake();
    const tm = this.scene.time;
    g.drawImage(bk.bg, 0, 0, W, H);
    // Lanterns breathe.
    g.globalAlpha = 0.22 + 0.1 * wobble(tm, 2.1);
    g.drawImage(bk.glow, 86 - 52, 66 - 52, 104, 104);
    g.globalAlpha = 0.2 + 0.09 * wobble(tm, 1.7, 2.2);
    g.drawImage(bk.glow, 560 - 56, 74 - 56, 112, 112);
    g.globalAlpha = 1;
    g.drawImage(bk.griddle, 0, 0, W, H);
    // Coal flicker under the rim, oil shimmer drifting on the iron.
    g.globalAlpha = 0.16 + 0.08 * wobble(tm, 3.1, 1.7);
    g.drawImage(bk.glow, GX - 130, 258, 260, 90);
    g.globalAlpha = 0.05 + 0.03 * wobble(tm, 0.7);
    oval(g, GX - 60 + 26 * wobble(tm, 0.33), GY - 28, 110, 22, '#fff0d0', -0.4);
    g.globalAlpha = 1;

    this.paintStack(g);
    this.paintTray(g, tm);
    if (this.phase === 'press' && this.anim < 0 && this.hasBall) this.paintGauge(g, tm);
    this.paintWorking(g, tm);
    if (this.phase !== 'done' || this.anim >= 0) this.paintPress(g, tm);
    if (this.bite > 0) this.paintReveal(g, tm);
  }

  private paintStack(g: CanvasRenderingContext2D) {
    const shown = Math.min(this.landed, this.results.length) - (this.bite > 0 ? 1 : 0);
    for (let i = 0; i < shown; i++) {
      const kind = this.results[i]!;
      const [sx, sy] = slot(i);
      cookedDisc(g, sx, sy, 33, 19, kind === 'gold', 101 + i * 7, 0.85);
    }
  }

  /**
   * The dough still to come, sitting in its tray. Three balls at the start,
   * one leaving the tray each time you commit one to the iron: the batch's
   * shape, in the picture, instead of "2 to go" at the end of a sentence.
   */
  private paintTray(g: CanvasRenderingContext2D, tm: number) {
    const onIron = this.hasBall || this.ballDrop >= 0 || this.anim >= 0 ? 1 : 0;
    const left = Math.max(0, ROUNDS - this.round - onIron);
    for (let i = 0; i < left; i++) {
      const x = TRAY_X - 32 + i * 32;
      const y = TRAY_Y - 12 + wobble(tm, 0.8, i * 2) * 0.6;
      g.globalAlpha = 0.35;
      oval(g, x, y + 11, 15, 5, '#120b06');
      g.globalAlpha = 1;
      oval(g, x, y, 15, 13, '#e4d3a4');
      oval(g, x - 4, y - 4, 9, 7, '#f3e6ba');
      g.globalAlpha = 0.4;
      dot(g, x + 5, y + 3, 1.4, '#fff6dd');
      g.globalAlpha = 1;
    }
    paperTag(g, TRAY_X, TRAY_Y - 40, left === 1 ? 'one more' : left === 0 ? 'the batch is in' : `${left} more`, 10, 0.9);
  }

  private paintGauge(g: CanvasRenderingContext2D, tm: number) {
    const cx = DX;
    const cy = DY + 8;
    // Tucked close over the disc: any wider and the hovering press hides the
    // one thing the player must read, the golden middle.
    const R = 64;
    const A0 = -2.62;
    const A1 = -0.52;
    const at = (k: number) => A0 + (A1 - A0) * k;
    g.lineCap = 'round';
    // A dark backing so the track never dissolves into the night market.
    g.strokeStyle = 'rgba(16,10,20,0.5)';
    g.lineWidth = 10;
    g.beginPath();
    g.arc(cx, cy, R, A0, A1);
    g.stroke();
    g.strokeStyle = 'rgba(242,230,208,0.34)';
    g.lineWidth = 4;
    g.beginPath();
    g.arc(cx, cy, R, A0, A1);
    g.stroke();
    // The golden middle, banded and haloed: the one place worth pressing.
    g.globalAlpha = 0.45 + 0.12 * wobble(tm, 2.4);
    g.strokeStyle = 'rgba(230,160,60,0.55)';
    g.lineWidth = 18;
    g.beginPath();
    g.arc(cx, cy, R, at(0.38), at(0.62));
    g.stroke();
    g.globalAlpha = 1;
    g.strokeStyle = 'rgba(255,214,124,0.95)';
    g.lineWidth = 9;
    g.beginPath();
    g.arc(cx, cy, R, at(0.38), at(0.62));
    g.stroke();
    // Two hairline ticks: the exact moment the gold opens and closes.
    g.strokeStyle = 'rgba(255,240,205,0.75)';
    g.lineWidth = 2;
    for (const k of [0.38, 0.62]) {
      const a = at(k);
      g.beginPath();
      g.moveTo(cx + Math.cos(a) * (R - 13), cy + Math.sin(a) * (R - 13));
      g.lineTo(cx + Math.cos(a) * (R + 13), cy + Math.sin(a) * (R + 13));
      g.stroke();
    }
    // The key, sitting on the one place worth pressing it. The gauge used to
    // say when; nothing in the frame said with what.
    const mid = at(0.5);
    keyCap(g, cx + Math.cos(mid) * (R + 23), cy + Math.sin(mid) * (R + 23), 'space', 0.95, 0.92);
    const ang = at(clamp01(this.t));
    const bx = cx + Math.cos(ang) * R;
    const by = cy + Math.sin(ang) * R;
    const hot = this.t >= 0.38 && this.t <= 0.62;
    g.globalAlpha = hot ? 0.5 + 0.2 * wobble(tm, 8) : 0.3;
    g.drawImage(bake().glow, bx - 15, by - 15, 30, 30);
    g.globalAlpha = 1;
    dot(g, bx, by, hot ? 5.5 : 4.4, hot ? '#ffd98a' : '#f2e6d0');
  }

  private paintWorking(g: CanvasRenderingContext2D, tm: number) {
    if (this.anim >= 0) {
      const a = this.anim;
      const seed = 101 + (this.results.length - 1) * 7;
      if (a < T_FLIP0) {
        // The press meets the dough: full flatten, no daylight under it.
        const flat = clamp01(a / T_IMPACT);
        doughBall(g, DX, DY, Math.max(flat, 0.4), edgeTone(0.5), 0, tm);
      } else if (a < T_LAND) {
        // The flip: a real arc, the disc turning edge-on at the top.
        const ft = clamp01((a - T_FLIP0) / (T_LAND - T_FLIP0));
        const y = DY - Math.sin(Math.PI * ft) * 86;
        const x = DX + 10 * Math.sin(Math.PI * ft);
        const squish = Math.max(0.14, Math.abs(Math.cos(Math.PI * ft)));
        g.globalAlpha = 0.26 * (1 - Math.sin(Math.PI * ft) * 0.7);
        oval(g, DX, DY + 14, 48, 13, '#120b06');
        g.globalAlpha = 1;
        squashed(g, x, y, 1 + (1 - squish) * 0.12, squish, (gg) => {
          if (ft < 0.5) doughBall(gg, x, y, 1, edgeTone(0.5), 0, tm);
          else cookedDisc(gg, x, y, 46, 28, this.animGold, seed, ft);
        });
      } else {
        // Sliding off to the tin, freckles settling in as it cools.
        const st = easeInOutSine(clamp01((a - T_LAND) / (T_SLIDE1 - T_LAND)));
        const i = this.results.length - 1;
        const [tx, ty] = slot(i);
        const x = DX + (tx - DX) * st;
        const y = DY + (ty - DY) * st;
        const r = 46 + (33 - 46) * st;
        const land = clamp01((a - T_LAND) / 0.3);
        squashed(g, x, y, 1 + (1 - easeOutElastic(land)) * 0.2, 0.72 + 0.28 * easeOutElastic(land), (gg) => {
          cookedDisc(gg, x, y, r, r * 0.6, this.animGold, seed, 0.7 + 0.3 * st);
        });
      }
    } else if (this.hasBall) {
      const sy = 0.62 + 0.38 * easeOutElastic(clamp01(this.ballLandT / 0.5));
      const hot = this.t >= 0.38 && this.t <= 0.62;
      squashed(g, DX, DY + 10, 1 + (1 - sy) * 0.6, sy, (gg) => {
        doughBall(gg, DX, DY, 0.12, edgeTone(this.phase === 'press' ? this.t : 0.5), hot ? 1 : 0, tm);
      });
    } else if (this.ballDrop >= 0) {
      // The next ball falls in, all anticipation.
      const k = easeInCubic(clamp01(this.ballDrop / 0.3));
      const y = DY - 130 + 130 * k;
      g.globalAlpha = 0.1 + 0.22 * k;
      oval(g, DX, DY + 12, 26 + 8 * k, 8, '#120b06');
      g.globalAlpha = 1;
      squashed(g, DX, y, 1 - 0.08 * k, 1 + 0.16 * k, (gg) => {
        oval(gg, DX, y, 27, 24, '#ecdcae');
        oval(gg, DX - 7, y - 7, 12, 9, '#f3e6ba');
      });
    }
  }

  private paintPress(g: CanvasRenderingContext2D, tm: number) {
    let k = 0; // 0 hovering, 1 on the dough
    if (this.anim >= 0 && this.anim < T_LIFT) {
      k = this.anim < T_IMPACT ? easeInCubic(this.anim / T_IMPACT) : 1 - easeOutCubic((this.anim - T_IMPACT) / (T_LIFT - T_IMPACT));
    }
    const rest = DY - 108 + 3 * wobble(tm, 1.6);
    const y = rest + (DY - 16 - rest) * k;
    pressTool(g, DX, y);
  }

  private paintReveal(g: CanvasRenderingContext2D, tm: number) {
    // The bite reveal: one from the batch, torn open, sugar lava on show.
    const k = this.bite;
    const gold = this.golden > 0;
    const move = easeOutCubic(clamp01(k / 0.6));
    const i = this.results.length - 1;
    const [sx, sy] = slot(i);
    const x = sx + (DX + 14 - sx) * move;
    const y = sy + (DY - 6 - sy) * move;
    const r = 33 + 16 * move;
    const gap = k <= 0.6 ? 0 : ((k - 0.6) / 0.4) * 21;
    g.globalAlpha = 0.3 * move;
    oval(g, x, y + r * 0.62, r * 1.05, r * 0.3, '#120b06');
    g.globalAlpha = 1;
    if (gap > 0) {
      // Molten brown sugar between the halves, seeds caught in it.
      oval(g, x, y + 4, gap * 0.7 + 6, 11, '#5a2e0e');
      oval(g, x, y + 3, gap * 0.6 + 4, 8.5, '#a05a1c');
      g.globalAlpha = 0.65;
      oval(g, x - 2, y + 1, gap * 0.35 + 2, 3.6, '#e8a84d');
      g.globalAlpha = 1;
      dot(g, x - gap * 0.2, y + 3, 1.4, RAW);
      dot(g, x + gap * 0.25, y + 5, 1.3, '#3d2410');
    }
    for (const side of [-1, 1]) {
      g.save();
      g.beginPath();
      if (side < 0) g.rect(x - r - gap, y - r, r + gap / 2, r * 2);
      else g.rect(x + gap / 2, y - r, r + gap, r * 2);
      g.clip();
      cookedDisc(g, x + side * gap * 0.7, y, r, r * 0.6, gold, 101 + i * 7, 1);
      if (gap > 0) {
        // The torn face of the dough, pale at the cut.
        rect(g, side < 0 ? x - gap / 2 - 3.5 : x + gap / 2, y - r * 0.42, 3.5, r * 0.8, '#e8d1a0');
      }
      g.restore();
    }
    if (gap > 2) {
      // Sugar strings sagging between the halves. Worth it, entirely.
      g.strokeStyle = '#a05a1c';
      g.lineWidth = 2.2;
      for (const [fy, sag] of [[-4, 7], [3, 10]] as const) {
        g.beginPath();
        g.moveTo(x - gap * 0.6, y + fy);
        g.quadraticCurveTo(x, y + fy + sag + wobble(tm, 3) * 1.5, x + gap * 0.6, y + fy);
        g.stroke();
      }
      g.strokeStyle = 'rgba(232,168,77,0.7)';
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(x - gap * 0.6, y - 4.8);
      g.quadraticCurveTo(x, y + 3 + wobble(tm, 3) * 1.5, x + gap * 0.6, y - 4.8);
      g.stroke();
      // A slow drip finding the iron.
      const dl = clamp01((k - 0.75) / 0.25) * (10 + wobble(tm, 1.2) * 2);
      if (dl > 1) {
        rect(g, x - 1, y + 8, 2, dl, '#8a4a1a');
        dot(g, x, y + 8 + dl, 2.4, '#a05a1c');
        g.globalAlpha = 0.6;
        dot(g, x - 0.7, y + 7 + dl, 0.9, '#e8a84d');
        g.globalAlpha = 1;
      }
    }
  }
}
