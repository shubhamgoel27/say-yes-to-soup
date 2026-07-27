import type { Dir } from '../engine/input';
import type { AudioBus } from '../engine/audio';
import { Scene, mountScene, wobble, easeOutCubic, easeOutBack, keyCap, paperTag } from './games/scene';
import { surface, type Surface, Rng, dot, oval, rect, rr, vgrad, shade, mute, glowSpot } from '../art/pix';
import { PAL } from '../engine/config';

/**
 * The coast's two hands-on verbs, plus the noon kitchen. Same logic as ever;
 * the rendering is now a painted canvas scene per panel (see games/scene.ts).
 *
 * WavePanel: kneel on a caballito, punch through three waves with a well-timed
 * paddle, then balance the ride home. Forgiving on purpose: a mistimed paddle
 * just pushes you back a little; the ride cannot be failed, only wobbled.
 *
 * NetPanel: the evening net circle. No timer, no failure. Walk the shuttle to
 * each hole and tie it shut; the day mends alongside.
 */

const calm = () => document.body.classList.contains('reduce-motion');

/** The shared .w-hint style collapses wrapped lines; restore breathing room. */
const hintHtml = (h: string) => `<span style="display:inline-block;line-height:1.45">${h}</span>`;

/** Baked radial glow sprites, one per color, so no per-frame gradients. */
const glowCache = new Map<string, Surface>();
function glowTex(color: string): Surface {
  let s = glowCache.get(color);
  if (!s) {
    s = surface(96, 96);
    glowSpot(s.g, 48, 48, 46, color, 1);
    glowCache.set(color, s);
  }
  return s;
}

function stampGlow(g: CanvasRenderingContext2D, x: number, y: number, r: number, color: string, alpha: number) {
  const s = glowTex(color);
  g.globalAlpha = alpha;
  g.drawImage(s.cv, x - r, y - r, r * 2, r * 2);
  g.globalAlpha = 1;
}

function gull(g: CanvasRenderingContext2D, x: number, y: number, r: number, c: string, flap = 0) {
  g.strokeStyle = c;
  g.lineWidth = 1.6;
  g.beginPath();
  g.moveTo(x - r, y);
  g.quadraticCurveTo(x - r * 0.4, y - r * (0.7 + flap), x, y);
  g.quadraticCurveTo(x + r * 0.4, y - r * (0.7 + flap), x + r, y);
  g.stroke();
}

// ---------------------------------------------------------------- the ride

type WavePhase = 'paddle' | 'ride' | 'done';

type WaveBake = { sky: Surface; bands: Surface[]; hull: Surface; rider: Surface };
let waveBaked: WaveBake | null = null;

const BAND_W = 800;

function bakeBand(h: number, period: number, top: string, deep: string, foam: number, seed: number): Surface {
  const s = surface(BAND_W, h);
  const g = s.g;
  vgrad(g, 0, 10, BAND_W, h - 10, top, deep);
  g.fillStyle = top;
  for (let x = 0; x < BAND_W; x += period) {
    g.beginPath();
    g.ellipse(x + period / 2, 12, period / 2 + 2, 9, 0, Math.PI, 0);
    g.fill();
  }
  g.strokeStyle = `rgba(246,240,226,${foam})`;
  g.lineWidth = 2.4;
  for (let x = 0; x < BAND_W; x += period) {
    g.beginPath();
    g.ellipse(x + period / 2, 11, period / 2 - 4, 7, 0, Math.PI * 1.12, Math.PI * 1.88);
    g.stroke();
  }
  const rng = new Rng(seed);
  for (let i = 0; i < BAND_W / 9; i++) {
    dot(g, rng.next() * BAND_W, 6 + rng.next() * 16, 0.8 + rng.next() * 1.4, `rgba(246,240,226,${foam * 0.65})`);
  }
  return s;
}

function bakeWaveSky(): Surface {
  const s = surface(640, 340);
  const g = s.g;
  vgrad(g, 0, 0, 640, 210, mute('#a9bcc4', 0.12), '#e5ddc8');
  glowSpot(g, 498, 64, 110, '#f7edd2', 0.75);
  dot(g, 498, 64, 26, 'rgba(247,240,220,0.5)');
  const rng = new Rng(9);
  for (let i = 0; i < 6; i++) {
    const y = 26 + i * 24 + rng.next() * 12;
    oval(g, 50 + rng.next() * 540, y, 60 + rng.next() * 70, 7 + rng.next() * 6, 'rgba(235,231,219,0.4)');
  }
  vgrad(g, 0, 140, 640, 40, 'rgba(229,221,200,0)', 'rgba(229,221,200,0.7)');
  gull(g, 152, 58, 7, 'rgba(72,74,72,0.5)');
  gull(g, 428, 88, 5, 'rgba(72,74,72,0.38)');
  return s;
}

/** The reed horse, stern left and prow curling up on the right. */
function bakeHull(): Surface {
  const s = surface(176, 110);
  const g = s.g;
  const straw = PAL.gold;
  const dk = shade(straw, -0.34);
  const lt = shade(straw, 0.3);
  const body = () => {
    g.beginPath();
    g.moveTo(10, 66);
    g.quadraticCurveTo(70, 50, 122, 54);
    g.quadraticCurveTo(146, 52, 150, 20);
    g.quadraticCurveTo(152, 10, 144, 12);
    g.quadraticCurveTo(134, 28, 126, 58);
    g.quadraticCurveTo(122, 84, 74, 88);
    g.quadraticCurveTo(26, 88, 10, 66);
    g.closePath();
  };
  g.fillStyle = straw;
  body();
  g.fill();
  // Underside falls into cool shadow.
  g.save();
  body();
  g.clip();
  vgrad(g, 0, 58, 176, 52, 'rgba(0,0,0,0)', 'rgba(58,40,60,0.42)');
  // Deck catches the pale garua light.
  g.strokeStyle = lt;
  g.lineWidth = 4;
  g.beginPath();
  g.moveTo(14, 62);
  g.quadraticCurveTo(72, 48, 118, 52);
  g.quadraticCurveTo(142, 50, 147, 22);
  g.stroke();
  // Reed strands run the length of the bundle.
  g.strokeStyle = `rgba(90,64,28,0.5)`;
  g.lineWidth = 1.4;
  for (let i = 0; i < 4; i++) {
    g.beginPath();
    g.moveTo(12, 66 + i * 5);
    g.quadraticCurveTo(72, 56 + i * 7, 126, 60 + i * 6);
    g.stroke();
  }
  g.beginPath();
  g.moveTo(130, 52);
  g.quadraticCurveTo(142, 42, 146, 18);
  g.stroke();
  g.restore();
  // A second, smaller roll rides on top toward the stern.
  g.fillStyle = shade(straw, 0.12);
  g.beginPath();
  g.moveTo(16, 60);
  g.quadraticCurveTo(60, 44, 108, 52);
  g.quadraticCurveTo(66, 58, 20, 66);
  g.closePath();
  g.fill();
  // Rope lashings.
  g.strokeStyle = shade(dk, -0.15);
  g.lineWidth = 3;
  for (const lx of [42, 76, 110]) {
    g.beginPath();
    g.moveTo(lx, 50);
    g.quadraticCurveTo(lx + 4, 68, lx - 2, 86);
    g.stroke();
  }
  // Soft ink edge, the cut-paper look.
  g.strokeStyle = 'rgba(38,26,16,0.4)';
  g.lineWidth = 2;
  body();
  g.stroke();
  return s;
}

/** The rider kneels; the lean is applied per frame. */
function bakeRider(): Surface {
  const s = surface(48, 58);
  const g = s.g;
  rr(g, 7, 40, 32, 14, 7, '#3c6e64'); // tucked legs and skirt
  rr(g, 12, 17, 20, 27, 9, '#a25a3e'); // torso, leaning into the sea
  rr(g, 26, 23, 15, 7, 3.5, shade('#a25a3e', -0.12)); // forward arm
  dot(g, 24, 11, 8, '#b97f52');
  oval(g, 23, 7.5, 8, 5, '#241a12');
  oval(g, 24, 5.5, 11.5, 3.6, '#e0d0a0'); // straw brim
  oval(g, 24, 2.6, 6, 3.6, '#d4bd85');
  g.strokeStyle = 'rgba(38,26,16,0.35)';
  g.lineWidth = 1.6;
  g.beginPath();
  g.roundRect(7, 40, 32, 14, 7);
  g.stroke();
  return s;
}

function waveBake(): WaveBake {
  if (!waveBaked) {
    waveBaked = {
      sky: bakeWaveSky(),
      bands: [
        bakeBand(58, 100, mute(PAL.water, 0.4), mute(PAL.waterDark, 0.35), 0.3, 31),
        bakeBand(72, 88, PAL.water, PAL.waterDark, 0.45, 47),
        bakeBand(110, 76, shade(PAL.water, -0.06), shade(PAL.waterDark, -0.16), 0.6, 63),
      ],
      hull: bakeHull(),
      rider: bakeRider(),
    };
  }
  return waveBaked;
}

function drawCaballito(
  g: CanvasRenderingContext2D,
  b: WaveBake,
  x: number,
  y: number,
  tilt: number,
  lean: number,
  paddleK: number,
  time: number,
) {
  g.save();
  g.translate(x, y);
  g.rotate(tilt);
  // The rider kneels on the deck; lean tips them at the ankles.
  g.save();
  g.translate(-28, -32);
  g.rotate(lean * 0.35);
  g.drawImage(b.rider.cv, -26, -52);
  g.restore();
  g.drawImage(b.hull.cv, -92, -84);
  // The split-cane paddle swings through the stroke, blade first.
  const pa = 0.7 - Math.sin(Math.min(1, paddleK) * Math.PI) * 1.05 + wobble(time, 1.7) * 0.05;
  const bx = -12 + Math.cos(pa) * 62;
  const by = -56 + Math.sin(pa) * 62;
  g.strokeStyle = '#8a6a3a';
  g.lineWidth = 3.5;
  g.lineCap = 'round';
  g.beginPath();
  g.moveTo(-12 - Math.cos(pa) * 16, -56 - Math.sin(pa) * 16);
  g.lineTo(bx, by);
  g.stroke();
  oval(g, bx, by, 5, 9, '#a5824a', pa);
  // Waterline foam where the reeds meet the sea.
  oval(g, -30, 2, 46, 5, 'rgba(246,240,226,0.4)');
  oval(g, 30, 5, 24, 4, 'rgba(246,240,226,0.3)');
  g.restore();
}

/** The incoming swell, rearing and curling as it nears the horse. */
function drawSwell(g: CanvasRenderingContext2D, wx: number, baseY: number, h: number, curl: number, time: number) {
  const lipX = wx - 20 - curl * 30; // the lip overhangs toward the horse
  const lipY = baseY - h;
  // Dark back of the wave.
  g.fillStyle = shade(PAL.waterDark, -0.12);
  g.beginPath();
  g.moveTo(wx + 130, baseY + 26);
  g.quadraticCurveTo(wx + 76, baseY - h * 0.4, wx + 34, baseY - h * 0.9);
  g.quadraticCurveTo(wx + 12, lipY - 8, lipX, lipY);
  g.quadraticCurveTo(wx - 46, baseY - h * 0.4, wx - 58, baseY + 26);
  g.closePath();
  g.fill();
  // Concave lit face under the curl.
  g.fillStyle = shade(PAL.water, 0.16);
  g.beginPath();
  g.moveTo(wx - 54, baseY + 24);
  g.quadraticCurveTo(wx - 44, baseY - h * 0.5, lipX + 6, lipY + 5);
  g.quadraticCurveTo(lipX + 20, lipY + h * 0.28, wx - 4, baseY - h * 0.3);
  g.quadraticCurveTo(wx + 2, baseY, wx - 2, baseY + 24);
  g.closePath();
  g.fill();
  // Foam streaks race down the face.
  g.strokeStyle = 'rgba(246,240,226,0.5)';
  g.lineWidth = 2;
  for (let i = 0; i < 3; i++) {
    g.beginPath();
    g.moveTo(lipX + 8 + i * 9, lipY + 6 + i * 4);
    g.quadraticCurveTo(wx - 34 + i * 8, baseY - h * 0.5, wx - 46 + i * 10, baseY + 10);
    g.stroke();
  }
  // The curling lip, thick with foam.
  for (let i = 0; i < 8; i++) {
    const k = i / 7;
    const fx = lipX + k * (wx + 10 - lipX) + wobble(time, 6, i) * 2.4;
    const fy = lipY + Math.sin(k * 2.4) * 9 - 3 + wobble(time, 5, i * 2) * 2;
    dot(g, fx, fy, 5.4 - k * 2.6, 'rgba(248,243,230,0.92)');
  }
  dot(g, lipX - 3, lipY + 6, 3, 'rgba(248,243,230,0.85)');
  dot(g, lipX - 8, lipY + 13, 2.2, 'rgba(248,243,230,0.7)');
  oval(g, wx - 46, baseY + 22, 32, 7, 'rgba(246,240,226,0.45)');
}

const WAVE_LEGEND = [
  { keys: ['space'], does: 'paddle as the swell reaches you' },
  { keys: ['left', 'right'], does: 'hold the middle on the ride' },
] as const;

export class WavePanel {
  private phase: WavePhase = 'paddle';
  private waves = 0; // waves punched through
  private x = 1; // incoming wave position, 1 -> 0 across the track
  private speed = 0.55;
  private balance = 0; // -1..1 during the ride
  private drift = 0;
  private rideT = 0;
  private hint = '';
  private onDone: (() => void) | null = null;

  // Visual state only; game logic never reads these.
  private scene: Scene | null = null;
  private ui: { setHint: (h: string) => void } | null = null;
  private lunge = 0; // forward surge offset after a punch
  private paddleK = 1; // paddle stroke animation, 0 at strike
  private leanV = 0; // smoothed lean during the ride
  private hx = 170; // horse screen x, chases its target
  private foamT = 0;
  private gullT = 0;

  constructor(
    private root: HTMLElement,
    private audio: AudioBus,
  ) {}

  get isOpen(): boolean {
    return !this.root.hidden;
  }

  open(onDone: () => void) {
    this.onDone = onDone;
    this.phase = 'paddle';
    this.waves = 0;
    this.x = 1;
    this.speed = 0.55;
    this.balance = 0;
    this.rideT = 0;
    this.hint = 'A swell rolls in. Space to paddle as it reaches you.';
    this.root.hidden = false;
    this.scene ??= new Scene();
    this.ui = mountScene(this.root, 'The Caballito', this.scene, WAVE_LEGEND);
    this.scene.restart();
    this.lunge = 0;
    this.paddleK = 1;
    this.leanV = 0;
    this.hx = 170;
  }

  tick(dt: number) {
    if (!this.isOpen) return;
    if (this.phase === 'paddle') {
      this.x -= dt * this.speed;
      if (this.x < -0.08) {
        // The wave passed; it shoves, it does not punish.
        this.audio.slosh();
        this.x = 1;
        this.hint = 'It rolls you back a little. Again: Space right as it arrives.';
        const sc = this.scene!;
        sc.thump(calm() ? 0 : 3, 0.03);
        if (!calm()) sc.burst(this.hx + 36, 262, { n: 12, color: 'rgba(246,240,226,0.9)', speed: 110, grav: 200, size: 3 });
        this.hx = 120; // shoved back; eases home in paint
      }
    } else if (this.phase === 'ride') {
      this.drift += (Math.random() - 0.5) * 2.6 * dt;
      this.drift = Math.max(-1, Math.min(1, this.drift));
      this.balance += this.drift * dt * 1.4;
      this.balance = Math.max(-1, Math.min(1, this.balance));
      if (Math.abs(this.balance) < 0.45) this.rideT += dt;
      if (this.rideT >= 4) {
        this.phase = 'done';
        this.audio.weaveDone();
        this.hint = 'The wave sets you down on the sand like a parcel. Press Space.';
        const sc = this.scene!;
        sc.thump(calm() ? 0 : 4, 0.04);
        sc.flash('#f7e9c8', 0.3);
        if (!calm()) {
          sc.burst(430, 262, { n: 10, color: 'rgba(240,230,208,0.9)', speed: 70, grav: 160, size: 3 });
          for (let i = 0; i < 4; i++) {
            sc.burst(360 + i * 40, 120 + i * 14, { n: 1, kind: 'streak', color: 'rgba(250,248,240,0.85)', speed: 140, grav: -40, size: 8, life: 1 });
          }
        }
      }
    }
    this.paintFrame(dt);
  }

  onDir(dir: Dir) {
    if (this.phase !== 'ride') return;
    if (dir === 'left') this.balance -= 0.16;
    if (dir === 'right') this.balance += 0.16;
    // A correction kicks spray off the hull.
    const sc = this.scene;
    if (sc && !calm()) {
      const side = dir === 'left' ? 1 : -1;
      sc.burst(this.hx + side * 44, 264, { n: 6, color: 'rgba(246,240,226,0.85)', speed: 90, grav: 240, size: 2.6, life: 0.5 });
    }
  }

  onAction() {
    if (this.phase === 'paddle') {
      // The strike zone: the wave is on top of you.
      if (this.x <= 0.22 && this.x >= -0.06) {
        this.waves++;
        this.audio.slosh();
        const sc = this.scene!;
        this.paddleK = 0;
        sc.thump(calm() ? 0 : 6, 0.06);
        sc.flash('rgba(246,240,226,0.6)', 0.16);
        if (!calm()) {
          sc.burst(this.hx + 70, 240, { n: 20, color: 'rgba(250,246,236,0.95)', speed: 150, grav: 260, size: 3.4 });
          sc.burst(this.hx + 50, 258, { n: 8, color: PAL.water, speed: 90, grav: 220, size: 3 });
        }
        this.lunge = 1;
        if (this.waves >= 3) {
          this.phase = 'ride';
          this.hint = 'Past the break. Now the wave home: hold the middle with the arrows.';
          this.hx = 320;
        } else {
          this.x = 1;
          this.speed += 0.12;
          this.hint = `Through! ${3 - this.waves} more between you and open water.`;
        }
      } else {
        this.audio.bump();
        this.paddleK = 0;
        this.scene!.thump(calm() ? 0 : 2, 0.02);
        if (!calm()) this.scene!.burst(this.hx + 70, 244, { n: 5, color: 'rgba(246,240,226,0.7)', speed: 60, grav: 200, size: 2.4, life: 0.4 });
        this.hint = 'Too eager. Let the swell reach the horse first.';
      }
    } else if (this.phase === 'done') {
      this.root.hidden = true;
      const done = this.onDone;
      this.onDone = null;
      done?.();
    }
  }

  private paintFrame(dt: number) {
    const sc = this.scene;
    if (!sc) return;
    this.paddleK = Math.min(1, this.paddleK + dt * 2.6);
    this.lunge = Math.max(0, this.lunge - dt * 1.8);
    sc.frame(dt, (g) => this.paint(g, sc, dt));
    this.ui?.setHint(hintHtml(this.hint));
  }

  private paint(g: CanvasRenderingContext2D, sc: Scene, dt: number) {
    const b = waveBake();
    const t = sc.time;
    g.drawImage(b.sky.cv, 0, 0);

    const band = (s: Surface, y: number, speed: number, bob: number) => {
      const off = ((t * speed) % BAND_W + BAND_W) % BAND_W;
      const yy = y + wobble(t, 0.9, y) * bob;
      g.drawImage(s.cv, -off, yy);
      g.drawImage(s.cv, BAND_W - off, yy);
    };
    band(b.bands[0]!, 148, 9, 1.2);
    band(b.bands[1]!, 178, 18, 2);

    const riding = this.phase !== 'paddle';
    // Horse target position and posture.
    let targetX = 170;
    let tilt = wobble(t, 1.6) * 0.05;
    let lean = 0;
    if (this.phase === 'ride') {
      targetX = 320 + this.balance * 180;
      this.leanV += (this.balance - this.leanV) * Math.min(1, dt * 6);
      tilt = this.leanV * 0.28 + wobble(t, 2.1) * 0.03;
      lean = this.leanV * (Math.abs(this.balance) > 0.45 ? 1.5 : 1);
    } else if (this.phase === 'done') {
      // Set down on the sand, level and dripping.
      targetX = 476;
      this.leanV += (0 - this.leanV) * Math.min(1, dt * 3);
      tilt = this.leanV * 0.28;
    }
    this.hx += (targetX - this.hx) * Math.min(1, dt * 5);
    const hy = 258 + wobble(t, 1.4) * 3;

    // Close the seam between the mid band and the foreground water.
    g.fillStyle = shade(PAL.waterDark, -0.08);
    g.fillRect(0, 242, 640, 98);

    if (this.phase === 'paddle') {
      // Strike zone shimmer where the swell must meet the horse.
      const near = this.x <= 0.3;
      stampGlow(g, this.hx + 44, 262, 54, '#f2ead2', near ? 0.32 + wobble(t, 6) * 0.1 : 0.12);
      const wx = this.hx + 44 + this.x * 430;
      const h = 58 + (1 - this.x) * 54;
      drawSwell(g, wx, 266, h, 1 - this.x, t);
    }

    // The beach slides in from the right as the ride home progresses.
    if (riding) {
      const p = this.phase === 'done' ? 1 : Math.min(1, this.rideT / 4);
      const bw = 60 + easeOutCubic(p) * 220;
      g.fillStyle = '#dcC49a'.toLowerCase();
      g.beginPath();
      g.moveTo(640, 340);
      g.lineTo(640, 236);
      g.quadraticCurveTo(640 - bw * 0.7, 240, 640 - bw, 268);
      g.quadraticCurveTo(640 - bw * 0.6, 310, 640, 340);
      g.closePath();
      g.fill();
      oval(g, 640 - bw + 6, 270, 26, 5, 'rgba(246,240,226,0.6)');
    }

    drawCaballito(g, b, this.hx, hy + this.lunge * -4, tilt, lean, this.paddleK, t);

    // Wake foam behind a moving horse.
    this.foamT += dt;
    if (this.foamT > 0.16 && this.phase !== 'done' && !calm()) {
      this.foamT = 0;
      sc.waft(this.hx - 70, hy + 4, 'rgba(246,240,226,0.5)', 5);
    }

    band(b.bands[2]!, 262, 34, 2.4);

    if (this.phase === 'done') {
      // Ashore: the hull rests on the sand while gulls take the credit.
      this.gullT += dt;
      if (this.gullT > 1.4 && !calm()) {
        this.gullT = 0;
        const gx2 = 300 + Math.random() * 200;
        sc.burst(gx2, 90 + Math.random() * 50, { n: 1, kind: 'streak', color: 'rgba(250,248,240,0.7)', speed: 120, grav: -30, size: 7, life: 1.2 });
      }
      gull(g, 480 + wobble(t, 0.7) * 12, 70 + wobble(t, 1.1) * 6, 8, 'rgba(72,74,72,0.6)', wobble(t, 8) * 0.3);
    }

    // Progress, painted small: three foam medallions, then the ride clock.
    if (this.phase === 'paddle') {
      for (let i = 0; i < 3; i++) {
        const cx = 26 + i * 22;
        if (i < this.waves) dot(g, cx, 24, 7, 'rgba(246,240,226,0.95)');
        g.strokeStyle = 'rgba(246,240,226,0.8)';
        g.lineWidth = 1.6;
        g.beginPath();
        g.arc(cx, 24, 7, 0, Math.PI * 2);
        g.stroke();
      }
    } else {
      g.fillStyle = 'rgba(250,246,236,0.85)';
      g.font = '12px system-ui, sans-serif';
      g.textAlign = 'right';
      g.fillText(this.phase === 'done' ? 'ashore' : `${Math.max(0, 4 - this.rideT).toFixed(1)}s`, 622, 28);
      g.textAlign = 'left';
    }
  }
}

// ---------------------------------------------------------------- the nets

const NET_W = 9;
const NET_H = 5;

const NET_X0 = 100;
const NET_X1 = 540;
const NET_Y0 = 76;
const NET_CW = (NET_X1 - NET_X0) / NET_W;
const NET_CH = 33;

let netBg: Surface | null = null;

function bakeNetBg(): Surface {
  if (netBg) return netBg;
  const s = surface(640, 340);
  const g = s.g;
  // Evening over the caleta: gold sinking into violet, sea gone copper.
  vgrad(g, 0, 0, 640, 120, '#77688a', '#d99a5a');
  vgrad(g, 0, 120, 640, 60, '#d99a5a', '#f2d7a0');
  glowSpot(g, 470, 158, 120, '#ffd98e', 0.8);
  dot(g, 470, 152, 17, '#ffe9b8');
  gull(g, 200, 70, 6, 'rgba(50,38,48,0.55)');
  gull(g, 250, 88, 4.5, 'rgba(50,38,48,0.42)');
  // The sea, with the sun's path hammered across it.
  vgrad(g, 0, 168, 640, 46, shade(PAL.waterDark, -0.05), shade(PAL.waterDark, -0.3));
  const rng = new Rng(21);
  for (let i = 0; i < 40; i++) {
    const y = 172 + rng.next() * 38;
    const w = 6 + rng.next() * 22;
    const x = 470 + (rng.next() - 0.5) * (30 + (y - 168) * 4);
    oval(g, x, y, w / 2, 1.1, `rgba(255,220,150,${0.5 - (y - 168) * 0.008})`);
  }
  for (let i = 0; i < 26; i++) {
    oval(g, rng.next() * 640, 172 + rng.next() * 40, 8, 1, 'rgba(30,30,50,0.25)');
  }
  // Dark beach in the foreground, pebbled.
  vgrad(g, 0, 210, 640, 130, '#6d5a46', '#493b2e');
  for (let i = 0; i < 60; i++) {
    dot(g, rng.next() * 640, 218 + rng.next() * 118, 1 + rng.next() * 2.2, rng.chance(0.5) ? 'rgba(30,22,16,0.3)' : 'rgba(220,200,170,0.14)');
  }
  // A beached hull far left, clocking out.
  g.fillStyle = 'rgba(46,34,26,0.85)';
  g.beginPath();
  g.moveTo(-10, 250);
  g.quadraticCurveTo(40, 232, 86, 244);
  g.quadraticCurveTo(40, 258, -10, 262);
  g.closePath();
  g.fill();
  // Two driftwood posts hold the net.
  for (const px of [70, 570]) {
    vgrad(g, px - 7, 58, 14, 200, '#8a6a48', '#5d4226');
    g.strokeStyle = 'rgba(38,26,16,0.5)';
    g.lineWidth = 2;
    g.strokeRect(px - 7, 58, 14, 200);
    oval(g, px, 58, 8, 4, '#9a7852');
    oval(g, px, 262, 13, 5, 'rgba(20,14,10,0.4)');
  }
  netBg = s;
  return s;
}

let needleBaked: Surface | null = null;

function bakeNeedle(): Surface {
  if (needleBaked) return needleBaked;
  const s = surface(20, 58);
  const g = s.g;
  g.fillStyle = '#a97c50';
  g.beginPath();
  g.moveTo(10, 1);
  g.quadraticCurveTo(17, 14, 15, 30);
  g.quadraticCurveTo(14, 48, 10, 57);
  g.quadraticCurveTo(6, 48, 5, 30);
  g.quadraticCurveTo(3, 14, 10, 1);
  g.closePath();
  g.fill();
  rr(g, 8, 8, 4.5, 16, 2.2, '#4c3520'); // the open eye
  g.fillStyle = '#c49a66'; // the tongue inside it
  g.beginPath();
  g.moveTo(10.2, 10);
  g.lineTo(11.6, 19);
  g.lineTo(10.2, 22.5);
  g.lineTo(8.8, 19);
  g.closePath();
  g.fill();
  g.strokeStyle = 'rgba(60,40,20,0.4)';
  g.lineWidth = 1;
  g.beginPath();
  g.moveTo(7, 30);
  g.quadraticCurveTo(8, 42, 9, 52);
  g.stroke();
  g.strokeStyle = 'rgba(38,26,16,0.45)';
  g.lineWidth = 1.6;
  g.beginPath();
  g.moveTo(10, 1);
  g.quadraticCurveTo(17, 14, 15, 30);
  g.quadraticCurveTo(14, 48, 10, 57);
  g.quadraticCurveTo(6, 48, 5, 30);
  g.quadraticCurveTo(3, 14, 10, 1);
  g.closePath();
  g.stroke();
  needleBaked = s;
  return s;
}

const NET_LEGEND = [
  { keys: ['left', 'right', 'up', 'down'], does: 'walk the needle' },
  { keys: ['space'], does: 'tie the hole under it' },
] as const;

export class NetPanel {
  private holes = new Set<number>();
  private cur = 0;
  private hint = '';
  private done = false;
  private onDone: (() => void) | null = null;

  // Visual state only.
  private scene: Scene | null = null;
  private ui: { setHint: (h: string) => void } | null = null;
  private torn = new Set<number>(); // the holes as first found, for new-rope color
  private vx = 0;
  private vy = 0;
  private tieT = 0; // knot-tying loop animation
  private tieCell = -1;
  private sagK = 1; // net slack; tweens toward taut at the end
  private mistT = 0;

  constructor(
    private root: HTMLElement,
    private audio: AudioBus,
  ) {}

  get isOpen(): boolean {
    return !this.root.hidden;
  }

  open(onDone: () => void) {
    this.onDone = onDone;
    this.done = false;
    this.holes.clear();
    while (this.holes.size < 6) {
      this.holes.add(Math.floor(Math.random() * NET_W * NET_H));
    }
    this.cur = Math.floor(NET_H / 2) * NET_W;
    this.hint = 'Walk the shuttle with the arrows. Space ties a hole shut.';
    this.root.hidden = false;
    this.scene ??= new Scene();
    this.ui = mountScene(this.root, 'The Net Circle', this.scene, NET_LEGEND);
    this.scene.restart();
    this.torn = new Set(this.holes);
    const c = this.cellCenter(this.cur);
    this.vx = c[0];
    this.vy = c[1];
    this.tieT = 0;
    this.tieCell = -1;
    this.sagK = 1;
  }

  tick(dt: number) {
    if (!this.isOpen) return;
    const sc = this.scene;
    if (!sc) return;
    this.tieT = Math.max(0, this.tieT - dt);
    this.mistT += dt;
    if (this.mistT > 0.8 && !calm()) {
      this.mistT = 0;
      sc.waft(80 + Math.random() * 480, 200, 'rgba(240,215,170,0.2)', 9);
    }
    sc.frame(dt, (g) => this.paint(g, sc, dt));
    this.ui?.setHint(hintHtml(this.hint));
  }

  onDir(dir: Dir) {
    if (this.done) return;
    const x = this.cur % NET_W;
    const y = Math.floor(this.cur / NET_W);
    const nx = Math.max(0, Math.min(NET_W - 1, x + (dir === 'left' ? -1 : dir === 'right' ? 1 : 0)));
    const ny = Math.max(0, Math.min(NET_H - 1, y + (dir === 'up' ? -1 : dir === 'down' ? 1 : 0)));
    this.cur = ny * NET_W + nx;
  }

  onAction() {
    if (this.done) {
      this.root.hidden = true;
      const done = this.onDone;
      this.onDone = null;
      done?.();
      return;
    }
    if (this.holes.has(this.cur)) {
      this.holes.delete(this.cur);
      this.audio.weaveNote(this.holes.size % 7);
      const sc = this.scene!;
      this.tieT = 0.55;
      this.tieCell = this.cur;
      sc.thump(calm() ? 0 : 2, 0.02);
      if (!calm()) {
        const c = this.cellCenter(this.cur);
        sc.burst(c[0], c[1], { n: 7, color: 'rgba(230,214,178,0.9)', speed: 55, grav: 90, size: 2, life: 0.5 });
      }
      this.hint = ['A cousin in Lima...', 'Prices, weather...', 'That pelican again...', 'Knot by knot.'][
        this.holes.size % 4
      ] as string;
      if (this.holes.size === 0) {
        this.done = true;
        this.audio.weaveDone();
        this.hint = 'The net is whole. So, somehow, is the evening. Press Space.';
        // The whole net pulls taut.
        sc.tween(this.sagK, 0.12, 0.8, easeOutBack, (v) => (this.sagK = v));
        sc.flash('#ffe6b8', 0.3);
        sc.thump(calm() ? 0 : 3, 0.03);
      }
    } else {
      this.audio.blip();
      this.scene?.thump(calm() ? 0 : 1.5, 0);
      this.hint = 'That mesh holds. Find the gaps.';
    }
  }

  /** Node position with sag and a breath of wind. */
  private node(i: number, j: number, t: number): [number, number] {
    const u = i / NET_W;
    const sag = this.sagK * 26 * Math.sin(Math.PI * u) * (0.35 + 0.65 * (j / NET_H));
    const wind = wobble(t, 0.9, i * 0.7) * 1.6 * (0.3 + j / NET_H);
    return [NET_X0 + i * NET_CW + wind, NET_Y0 + j * NET_CH + sag];
  }

  private cellCenter(cell: number, t = 0): [number, number] {
    const ci = cell % NET_W;
    const cj = Math.floor(cell / NET_W);
    const a = this.node(ci, cj, t);
    const b = this.node(ci + 1, cj + 1, t);
    return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  }

  private strand(g: CanvasRenderingContext2D, a: [number, number], b: [number, number], c: string, w: number) {
    g.strokeStyle = c;
    g.lineWidth = w;
    g.beginPath();
    g.moveTo(a[0], a[1]);
    g.quadraticCurveTo((a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + 2.5 * this.sagK, b[0], b[1]);
    g.stroke();
  }

  /** A torn strand: two frayed stubs that curl off into nothing. */
  private frayed(g: CanvasRenderingContext2D, a: [number, number], b: [number, number], t: number) {
    g.strokeStyle = '#6e5a42';
    g.lineWidth = 2.6;
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    for (const [ox, oy, s] of [
      [a[0], a[1], 1],
      [b[0], b[1], -1],
    ] as const) {
      const sway = wobble(t, 1.4, ox) * 2;
      g.beginPath();
      g.moveTo(ox, oy);
      g.quadraticCurveTo(ox + dx * 0.18 * s, oy + dy * 0.18 * s + 3, ox + dx * 0.24 * s + sway, oy + dy * 0.24 * s + 8);
      g.stroke();
    }
  }

  private paint(g: CanvasRenderingContext2D, sc: Scene, dt: number) {
    const t = sc.time;
    g.drawImage(bakeNetBg().cv, 0, 0);

    // Current cell, lit like the last of the sun found it.
    const cc = this.cellCenter(this.cur, t);
    stampGlow(g, cc[0], cc[1], 52, '#ffdf9e', this.done ? 0 : 0.5 + wobble(t, 4) * 0.08);

    // The headrope ties the whole net to its posts.
    const hl = this.node(0, 0, t);
    const hr = this.node(NET_W, 0, t);
    g.strokeStyle = '#a8916c';
    g.lineWidth = 3.5;
    g.lineCap = 'round';
    g.beginPath();
    g.moveTo(70, 66);
    g.lineTo(hl[0], hl[1]);
    g.stroke();
    g.beginPath();
    g.moveTo(hr[0], hr[1]);
    g.lineTo(570, 66);
    g.stroke();
    for (let i = 0; i < NET_W; i++) {
      this.strand(g, this.node(i, 0, t), this.node(i + 1, 0, t), '#a8916c', 3.5);
    }
    // Bottom corners lashed down the posts.
    g.lineWidth = 2;
    const bl = this.node(0, NET_H, t);
    const br = this.node(NET_W, NET_H, t);
    g.beginPath();
    g.moveTo(70, 226);
    g.lineTo(bl[0], bl[1]);
    g.stroke();
    g.beginPath();
    g.moveTo(br[0], br[1]);
    g.lineTo(570, 226);
    g.stroke();

    const rope = '#c6b190';
    const newRope = '#eddcb2';
    const cellState = (ci: number, cj: number): 0 | 1 | 2 => {
      if (ci < 0 || cj < 0 || ci >= NET_W || cj >= NET_H) return 0;
      const idx = cj * NET_W + ci;
      if (this.holes.has(idx)) return 2;
      return this.torn.has(idx) ? 1 : 0;
    };
    // Horizontal strands, then vertical; torn cells break their borders.
    for (let j = 0; j <= NET_H; j++) {
      for (let i = 0; i < NET_W; i++) {
        const a = this.node(i, j, t);
        const b = this.node(i + 1, j, t);
        const s = Math.max(cellState(i, j - 1), cellState(i, j));
        if (s === 2) this.frayed(g, a, b, t);
        else this.strand(g, a, b, s === 1 ? newRope : rope, s === 1 ? 2.4 : 2);
      }
    }
    for (let i = 0; i <= NET_W; i++) {
      for (let j = 0; j < NET_H; j++) {
        const a = this.node(i, j, t);
        const b = this.node(i, j + 1, t);
        const s = Math.max(cellState(i - 1, j), cellState(i, j));
        if (s === 2) this.frayed(g, a, b, t);
        else this.strand(g, a, b, s === 1 ? newRope : rope, s === 1 ? 2.4 : 2);
      }
    }
    // Knots at every crossing, and a proud one where a hole was closed.
    for (let j = 0; j <= NET_H; j++) {
      for (let i = 0; i <= NET_W; i++) {
        const n = this.node(i, j, t);
        dot(g, n[0], n[1], 1.6, 'rgba(90,72,48,0.7)');
      }
    }
    for (const idx of this.torn) {
      if (this.holes.has(idx)) continue;
      const c = this.cellCenter(idx, t);
      dot(g, c[0], c[1], 2.6, '#8a6a42');
      g.strokeStyle = 'rgba(237,220,178,0.8)';
      g.lineWidth = 1.4;
      g.beginPath();
      g.arc(c[0], c[1], 4.5, 0, Math.PI * 2);
      g.stroke();
    }

    // The shuttle walks; while tying it swings a little loop around the knot.
    const target = this.cellCenter(this.cur, t);
    this.vx += (target[0] - this.vx) * Math.min(1, dt * 10);
    this.vy += (target[1] - this.vy) * Math.min(1, dt * 10);
    let nx = this.vx;
    let ny = this.vy;
    let rot = (target[0] - this.vx) * 0.02 + wobble(t, 2.2) * 0.08;
    if (this.tieT > 0 && this.tieCell >= 0) {
      const k = 1 - this.tieT / 0.55;
      const c = this.cellCenter(this.tieCell, t);
      const ang = k * Math.PI * 2 - Math.PI / 2;
      nx = c[0] + Math.cos(ang) * 11;
      ny = c[1] + Math.sin(ang) * 11;
      rot = ang + Math.PI / 2;
      g.strokeStyle = 'rgba(237,220,178,0.9)';
      g.lineWidth = 2;
      g.beginPath();
      g.arc(c[0], c[1], 13 * (1 - k * 0.6), -Math.PI / 2, ang);
      g.stroke();
    }
    // Trailing twine back to the last mended knot.
    if (this.tieCell >= 0 && !this.holes.has(this.tieCell)) {
      const c = this.cellCenter(this.tieCell, t);
      g.strokeStyle = 'rgba(230,214,178,0.55)';
      g.lineWidth = 1.3;
      g.beginPath();
      g.moveTo(c[0], c[1]);
      g.quadraticCurveTo((c[0] + nx) / 2, (c[1] + ny) / 2 + 10 + wobble(t, 1.8) * 3, nx, ny + 24);
      g.stroke();
    }
    g.save();
    g.translate(nx, ny);
    g.rotate(rot);
    g.drawImage(bakeNeedle().cv, -10, -29);
    g.restore();

    // Holes left, painted small in the corner.
    g.fillStyle = 'rgba(255,240,214,0.8)';
    g.font = '12px system-ui, sans-serif';
    g.textAlign = 'right';
    g.fillText(this.done ? 'whole' : `${this.holes.size} to mend`, 622, 28);
    g.textAlign = 'left';
  }
}

// ---------------------------------------------------------------- the noon

/**
 * CevichePanel: behind Doña Petro's pots at noon, assembling the dish in its
 * one true order. The clock is the enemy that isn't: the only timing that
 * matters is the lime "kiss," a bar you must pull the fish out of while it is
 * bright. Leave it too long and the fish is "cooked to death, hija"; Petro
 * hands you more fish, warmly, forever. Nothing else can go wrong.
 */

type CevicheStep = 'cut' | 'salt' | 'lime' | 'onion' | 'aji' | 'sides' | 'pour' | 'done';

const CEVICHE_ORDER: CevicheStep[] = ['cut', 'salt', 'lime', 'onion', 'aji', 'sides', 'pour', 'done'];

const BOWL_X = 290;
const BOWL_Y = 208;

let cevBg: Surface | null = null;

function bakeCevBg(): Surface {
  if (cevBg) return cevBg;
  const s = surface(640, 340);
  const g = s.g;
  // The picanteria table at noon: warm wood, pots murmuring behind.
  vgrad(g, 0, 0, 640, 74, '#43331f', '#5d4529');
  for (const [px, py, pr] of [
    [96, 46, 40],
    [196, 50, 32],
    [560, 48, 36],
  ] as const) {
    // Clay pots on the back fire, lidded and muttering.
    g.beginPath();
    g.moveTo(px - pr, py);
    g.quadraticCurveTo(px - pr - 6, py - pr * 0.7, px - pr * 0.62, py - pr * 0.78);
    g.lineTo(px + pr * 0.62, py - pr * 0.78);
    g.quadraticCurveTo(px + pr + 6, py - pr * 0.7, px + pr, py);
    g.quadraticCurveTo(px + pr * 0.8, py + pr * 0.34, px, py + pr * 0.36);
    g.quadraticCurveTo(px - pr * 0.8, py + pr * 0.34, px - pr, py);
    g.closePath();
    g.fillStyle = '#4a341f';
    g.fill();
    oval(g, px, py - pr * 0.78, pr * 0.66, pr * 0.16, '#2e2216');
    g.strokeStyle = 'rgba(200,165,91,0.4)';
    g.lineWidth = 2.4;
    g.beginPath();
    g.ellipse(px, py - pr * 0.72, pr * 0.62, pr * 0.14, 0, Math.PI, 0);
    g.stroke();
    g.strokeStyle = 'rgba(255,220,160,0.18)';
    g.lineWidth = 3;
    g.beginPath();
    g.ellipse(px - pr * 0.4, py - pr * 0.1, pr * 0.3, pr * 0.4, 0.3, Math.PI * 0.9, Math.PI * 1.5);
    g.stroke();
  }
  vgrad(g, 0, 70, 640, 270, '#8a5f3c', '#6a462b');
  const rng = new Rng(5);
  for (let y = 116; y < 340; y += 52) {
    g.strokeStyle = 'rgba(40,26,14,0.4)';
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(0, y + rng.next() * 6);
    g.lineTo(640, y + rng.next() * 6);
    g.stroke();
  }
  for (let i = 0; i < 70; i++) {
    oval(g, rng.next() * 640, 80 + rng.next() * 250, 6 + rng.next() * 14, 0.8, 'rgba(50,32,16,0.18)');
  }
  glowSpot(g, 320, 40, 300, '#ffdf9a', 0.22);
  // The shelf over the fire, where the whole dish waits in its own order.
  rr(g, 244, 63, 296, 9, 2, '#3a2a18');
  rr(g, 244, 62, 296, 7, 2, '#7d5836');
  rect(g, 246, 62.5, 292, 2, 'rgba(255,232,190,0.28)');
  for (const bx of [262, 516]) {
    g.fillStyle = '#5c4024';
    g.beginPath();
    g.moveTo(bx, 71);
    g.lineTo(bx + 9, 71);
    g.lineTo(bx + 9, 82);
    g.closePath();
    g.fill();
  }
  // The cutting board, up and to the left, with the dawn's flour of salt.
  rr(g, 64, 62, 190, 52, 10, '#b98a58');
  rr(g, 64, 62, 190, 8, 6, 'rgba(255,236,200,0.25)');
  g.strokeStyle = 'rgba(38,26,16,0.45)';
  g.lineWidth = 2;
  g.beginPath();
  g.roundRect(64, 62, 190, 52, 10);
  g.stroke();
  // The stone bowl, the whole point of the counter: thick rim, real belly.
  oval(g, BOWL_X, BOWL_Y + 66, 150, 20, 'rgba(20,14,10,0.42)');
  // Belly bulges below the rim and sits on a foot.
  const belly = () => {
    g.beginPath();
    g.moveTo(BOWL_X - 156, BOWL_Y - 8);
    g.quadraticCurveTo(BOWL_X - 152, BOWL_Y + 46, BOWL_X - 88, BOWL_Y + 60);
    g.quadraticCurveTo(BOWL_X, BOWL_Y + 76, BOWL_X + 88, BOWL_Y + 60);
    g.quadraticCurveTo(BOWL_X + 152, BOWL_Y + 46, BOWL_X + 156, BOWL_Y - 8);
    g.closePath();
  };
  g.fillStyle = '#6f6860';
  belly();
  g.fill();
  g.save();
  belly();
  g.clip();
  vgrad(g, BOWL_X - 156, BOWL_Y + 26, 312, 52, 'rgba(0,0,0,0)', 'rgba(28,20,26,0.42)');
  g.restore();
  // The rim, a wide stone band.
  oval(g, BOWL_X, BOWL_Y - 8, 158, 46, '#9a9184');
  oval(g, BOWL_X - 30, BOWL_Y - 22, 96, 20, 'rgba(224,216,200,0.3)');
  for (let i = 0; i < 120; i++) {
    const a = rng.next() * Math.PI * 2;
    const rr2 = 0.62 + rng.next() * 0.38;
    dot(
      g,
      BOWL_X + Math.cos(a) * rr2 * 152,
      BOWL_Y - 8 + Math.sin(a) * rr2 * 42,
      0.8 + rng.next() * 1.5,
      rng.chance(0.5) ? 'rgba(60,56,50,0.4)' : 'rgba(214,208,196,0.32)',
    );
  }
  for (let i = 0; i < 40; i++) {
    dot(g, BOWL_X + (rng.next() - 0.5) * 280, BOWL_Y + 30 + rng.next() * 34, 0.9 + rng.next() * 1.5, 'rgba(40,34,30,0.35)');
  }
  // The well drops away inside, dark at the near wall.
  oval(g, BOWL_X, BOWL_Y - 6, 128, 34, '#3c3630');
  oval(g, BOWL_X, BOWL_Y - 2, 112, 26, '#565048');
  oval(g, BOWL_X, BOWL_Y, 102, 22, '#655c50');
  g.strokeStyle = 'rgba(20,14,10,0.5)';
  g.lineWidth = 2.4;
  g.beginPath();
  g.ellipse(BOWL_X, BOWL_Y - 6, 128, 34, 0, 0, Math.PI * 2);
  g.stroke();
  g.strokeStyle = 'rgba(38,26,16,0.5)';
  g.lineWidth = 2.4;
  g.beginPath();
  g.ellipse(BOWL_X, BOWL_Y - 8, 158, 46, 0, Math.PI * 0.94, Math.PI * 0.06);
  g.stroke();
  g.beginPath();
  g.moveTo(BOWL_X - 156, BOWL_Y - 8);
  g.quadraticCurveTo(BOWL_X - 152, BOWL_Y + 46, BOWL_X - 88, BOWL_Y + 60);
  g.quadraticCurveTo(BOWL_X, BOWL_Y + 76, BOWL_X + 88, BOWL_Y + 60);
  g.quadraticCurveTo(BOWL_X + 152, BOWL_Y + 46, BOWL_X + 156, BOWL_Y - 8);
  g.stroke();
  // The glass waits on its own ring of shadow.
  oval(g, 560, 188, 26, 7, 'rgba(20,14,10,0.35)');
  cevBg = s;
  return s;
}

/**
 * Doña Petro's mise en place, on the shelf over the fire, in the order the
 * dish is built. The step you are on is the lit one and wears its own name
 * and its own key; the ones behind you go quiet. The recipe used to live
 * entirely in the sentence under the picture.
 */
const MISE: { tag: string; x: number }[] = [
  { tag: 'cut the lisa', x: 268 },
  { tag: 'the salt, alone', x: 308 },
  { tag: 'the lime', x: 348 },
  { tag: 'the onion', x: 388 },
  { tag: 'the ají', x: 428 },
  { tag: 'the rim', x: 468 },
  { tag: 'the glass', x: 508 },
];
const MISE_Y = 50;
let miseCache: Surface | null = null;

const CEVICHE_LEGEND = [
  { keys: ['space'], does: 'the next move, on the lit thing' },
] as const;

/** Where the cut cubes settle inside the bowl, seeded so nothing crawls. */
const CUBE_SPOTS: [number, number, number][] = (() => {
  const rng = new Rng(88);
  const spots: [number, number, number][] = [];
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2 + rng.next();
    const r = 0.25 + rng.next() * 0.6;
    spots.push([Math.cos(a) * r * 72, Math.sin(a) * r * 16 - 6, rng.next() * Math.PI]);
  }
  return spots;
})();

export class CevichePanel {
  private step: CevicheStep = 'cut';
  private cuts = 0;
  private sides = 0;
  private kiss = 0; // lime marination 0..1, filling in real time
  private spoiled = 0; // fish handed back, for the flavor lines
  private pour = 0;
  private hint = '';
  private onDone: (() => void) | null = null;

  // Visual state only.
  private scene: Scene | null = null;
  private ui: { setHint: (h: string) => void } | null = null;
  private chopT = 1; // knife stroke, 0 at the cut
  private dropAt = -1; // scene.time when cubes tumbled in
  private saltAt = -1;
  private onionAt = -1;
  private ajiAt = -1;
  private sideAt: number[] = [-1, -1];
  private pourAt = -1;
  private milk = 0; // eased cloudiness of the leche
  private lastSqueeze = -1;
  private steamT = 0;

  constructor(
    private root: HTMLElement,
    private audio: AudioBus,
  ) {}

  get isOpen(): boolean {
    return !this.root.hidden;
  }

  open(onDone: () => void) {
    this.onDone = onDone;
    this.step = 'cut';
    this.cuts = 0;
    this.sides = 0;
    this.kiss = 0;
    this.spoiled = 0;
    this.pour = 0;
    this.hint = 'The dawn lisa, the board, the knife. Space to cut: even pieces, no ceremony.';
    this.root.hidden = false;
    this.scene ??= new Scene();
    this.ui = mountScene(this.root, 'Behind the Pots', this.scene, CEVICHE_LEGEND);
    this.scene.restart();
    this.chopT = 1;
    this.dropAt = this.saltAt = this.onionAt = this.ajiAt = this.pourAt = -1;
    this.sideAt = [-1, -1];
    this.milk = 0;
    this.lastSqueeze = -1;
  }

  tick(dt: number) {
    if (!this.isOpen) return;
    const sc = this.scene;
    if (!sc) return;
    if (this.step === 'lime') {
      this.kiss += dt * 0.22;
      if (this.kiss >= 1) {
        // Too long in the lime. Petro's verdict is warm and non-negotiable.
        this.spoiled++;
        this.kiss = 0;
        this.audio.bump();
        sc.thump(calm() ? 0 : 4, 0.05);
        if (!calm()) sc.burst(BOWL_X, BOWL_Y - 20, { n: 12, kind: 'puff', color: 'rgba(214,208,196,0.7)', speed: 40, grav: -30, size: 6, life: 0.8 });
        this.dropAt = sc.time; // more fish arrives, tumbling in fresh
        this.milk = Math.min(this.milk, 0.3);
        this.hint =
          this.spoiled === 1
            ? '"Cooked to death, hija." She eats the evidence and hands you more fish. "The lime kisses. It does not marry."'
            : '"Again dead! Good, I was hungry." More fish arrives. Pull it OUT while the bar burns bright.';
      }
    }
    this.paintFrame(dt);
  }

  onDir(_dir: Dir) {
    // The kitchen needs only the one button and your nerve.
  }

  private advance() {
    this.step = CEVICHE_ORDER[CEVICHE_ORDER.indexOf(this.step) + 1] as CevicheStep;
  }

  onAction() {
    const sc = this.scene;
    switch (this.step) {
      case 'cut': {
        this.cuts++;
        this.audio.blip();
        this.chopT = 0;
        sc?.thump(calm() ? 0 : 3, 0.03);
        if (sc && !calm()) sc.burst(160, 88, { n: 5, kind: 'spark', color: 'rgba(230,238,244,0.9)', speed: 60, grav: 140, size: 2, life: 0.4 });
        if (this.cuts >= 3) {
          this.advance();
          if (sc) this.dropAt = sc.time; // and the cubes tumble into the bowl
          this.hint = 'Cut. Now salt, first and alone. Space to scatter it like you mean it.';
        } else {
          this.hint = ['Through the middle. The fish does not object.', 'Again. Even pieces; the lime treats them all the same.'][
            this.cuts - 1
          ] as string;
        }
        break;
      }
      case 'salt': {
        this.audio.slosh();
        this.advance();
        if (sc) {
          this.saltAt = sc.time;
          if (!calm()) sc.burst(BOWL_X, BOWL_Y - 70, { n: 16, color: 'rgba(255,255,255,0.95)', speed: 55, grav: 320, size: 1.6, life: 0.6 });
        }
        this.hint = 'Now the lime. The fish goes IN, and comes OUT while the bar is bright. A kiss, not a marriage. Space when it burns.';
        this.kiss = 0;
        break;
      }
      case 'lime': {
        if (this.kiss >= 0.5 && this.kiss < 0.8) {
          this.audio.weaveNote(4);
          this.advance();
          sc?.flash('rgba(214,255,140,0.5)', 0.25);
          if (sc && !calm()) sc.burst(BOWL_X, BOWL_Y - 24, { n: 10, color: 'rgba(230,242,176,0.9)', speed: 70, grav: 200, size: 2.4 });
          this.hint = 'OUT, at the exact bright second. The flesh has turned white at the edges only. Petro says nothing, loudly. Now the onion.';
        } else if (this.kiss < 0.5) {
          this.audio.bump();
          sc?.thump(calm() ? 0 : 2, 0.02);
          this.hint = 'Too soon; the lime has barely said hello. Back in. Wait for the bright zone, then pull.';
        }
        break;
      }
      case 'onion': {
        this.audio.blip();
        this.advance();
        if (sc) this.onionAt = sc.time;
        this.hint = 'Red onion, sliced to feathers. Now the ají, and less than your pride wants.';
        break;
      }
      case 'aji': {
        this.audio.blip();
        this.advance();
        if (sc) this.ajiAt = sc.time;
        this.hint = 'A whisper of ají. Now the rim: cancha on one side, camote on the other. Space for each.';
        break;
      }
      case 'sides': {
        this.sides++;
        this.audio.slosh();
        if (sc) {
          this.sideAt[this.sides - 1] = sc.time;
          sc.thump(calm() ? 0 : 2.5, 0.02);
        }
        if (this.sides >= 2) {
          this.advance();
          this.hint = 'Crunch and sweetness seated at the rim. Last: the leche de tigre, poured into its own glass. Space to pour.';
        } else {
          this.hint = 'Cancha down, toasted and rattling. Now the camote, orange as a good sunset.';
        }
        break;
      }
      case 'pour': {
        this.pour = 1;
        this.audio.weaveDone();
        this.advance();
        if (sc) {
          this.pourAt = sc.time;
          sc.flash('#ffe9c0', 0.3);
        }
        this.hint = 'The tiger gets its glass. The clock says four minutes past noon, which is exactly on time. Press Space.';
        break;
      }
      case 'done': {
        this.root.hidden = true;
        const done = this.onDone;
        this.onDone = null;
        done?.();
        break;
      }
    }
  }

  private paintFrame(dt: number) {
    const sc = this.scene;
    if (!sc) return;
    this.chopT = Math.min(1, this.chopT + dt * 3.4);
    // The leche clouds over as the lime works; eased, never sudden.
    const idx = CEVICHE_ORDER.indexOf(this.step);
    const target = idx > CEVICHE_ORDER.indexOf('lime') ? 0.8 : this.step === 'lime' ? 0.15 + this.kiss * 0.7 : 0;
    this.milk += (target - this.milk) * Math.min(1, dt * 2.2);
    this.steamT += dt;
    if (this.steamT > 0.5 && !calm()) {
      this.steamT = 0;
      sc.waft(90 + Math.random() * 120, 30, 'rgba(255,250,240,0.25)', 8);
    }
    sc.frame(dt, (g) => this.paint(g, sc));
    this.ui?.setHint(hintHtml(this.hint));
  }

  /** One ingredient on the shelf, painted at its own small still-life scale. */
  private paintMiseItem(g: CanvasRenderingContext2D, i: number, x: number, y: number) {
    switch (i) {
      case 0: // the lisa
        oval(g, x, y, 15, 6, '#b8c4cc');
        oval(g, x, y - 3, 12, 3, '#dde3e7');
        g.fillStyle = '#9fb0ba';
        g.beginPath();
        g.moveTo(x + 13, y - 2);
        g.lineTo(x + 21, y - 6);
        g.lineTo(x + 21, y + 6);
        g.closePath();
        g.fill();
        dot(g, x - 9, y - 1, 1.5, '#2b2118');
        break;
      case 1: // salt in its dish
        oval(g, x, y + 5, 13, 4.5, '#8f867a');
        g.fillStyle = '#f4f0e6';
        g.beginPath();
        g.moveTo(x - 10, y + 4);
        g.quadraticCurveTo(x, y - 11, x + 10, y + 4);
        g.closePath();
        g.fill();
        oval(g, x - 3, y - 1, 4, 2, '#ffffff');
        break;
      case 2: // limes
        dot(g, x - 6, y + 1, 8, '#6d9a35');
        dot(g, x + 7, y - 2, 8.5, '#7fae3f');
        oval(g, x + 5, y - 5, 4, 2, '#a8cc6a');
        break;
      case 3: // the red onion
        dot(g, x, y, 10, '#8c3a6e');
        g.strokeStyle = 'rgba(232,200,220,0.75)';
        g.lineWidth = 1.4;
        for (const a of [-0.5, 0.1, 0.7]) {
          g.beginPath();
          g.arc(x, y, 7, a, a + 1.5);
          g.stroke();
        }
        g.strokeStyle = '#6b8e4e';
        g.lineWidth = 2;
        g.beginPath();
        g.moveTo(x, y - 9);
        g.lineTo(x + 3, y - 15);
        g.stroke();
        break;
      case 4: // ají, two of them
        for (const [dx, dy, ro] of [[-4, 2, 0.4], [5, -1, -0.3]] as const) {
          g.save();
          g.translate(x + dx, y + dy);
          g.rotate(ro);
          oval(g, 0, 0, 9, 4, '#e8a03c');
          oval(g, -3, -1, 5, 2.4, '#f2bc63');
          g.strokeStyle = '#6b8e4e';
          g.lineWidth = 1.6;
          g.beginPath();
          g.moveTo(8, 0);
          g.lineTo(13, -3);
          g.stroke();
          g.restore();
        }
        break;
      case 5: // cancha and camote on a plate
        oval(g, x, y + 4, 15, 5, '#b5713f');
        oval(g, x, y + 2, 13, 4, '#c98a63');
        for (let k = 0; k < 4; k++) dot(g, x - 9 + k * 4, y - 1, 2.4, k % 2 ? '#d9b96a' : '#c98a2e');
        oval(g, x + 8, y - 2, 6, 3.4, '#d97b3c');
        break;
      default: // the tiger's glass
        g.fillStyle = 'rgba(255,255,255,0.28)';
        g.beginPath();
        g.moveTo(x - 7, y - 10);
        g.lineTo(x - 6, y + 6);
        g.quadraticCurveTo(x, y + 10, x + 6, y + 6);
        g.lineTo(x + 7, y - 10);
        g.closePath();
        g.fill();
        g.strokeStyle = 'rgba(255,255,255,0.7)';
        g.lineWidth = 1.4;
        g.stroke();
        break;
    }
  }

  /** The seven ingredients, painted once into a strip of 44px cells. */
  private miseSheet(): Surface {
    if (miseCache) return miseCache;
    const s = surface(MISE.length * 44, 44);
    for (let i = 0; i < MISE.length; i++) this.paintMiseItem(s.g, i, i * 44 + 22, 22);
    miseCache = s;
    return miseCache;
  }

  /**
   * The recipe, on the shelf, in order. The lit one is the one your hands are
   * on; behind it the finished ones go quiet. This is the decision the caption
   * used to have to make for you.
   */
  private paintMise(g: CanvasRenderingContext2D, t: number, idx: number) {
    const sheet = this.miseSheet().cv;
    for (let i = 0; i < MISE.length; i++) {
      const m = MISE[i]!;
      const cur = i === idx;
      const past = i < idx;
      if (cur) {
        stampGlow(g, m.x, MISE_Y, 30, '#ffe9c0', 0.62 + wobble(t, 2.6) * 0.1);
        // A pool of lamplight on the plank, so the lit one is lit, not merely
        // brighter than its neighbours.
        g.globalAlpha = 0.32;
        oval(g, m.x, 64, 22, 4, '#ffdba8');
        g.globalAlpha = 1;
      }
      g.globalAlpha = past ? 0.4 : cur ? 1 : 0.78;
      const lift = cur ? -2 - Math.abs(wobble(t, 3.2)) * 1.6 : 0;
      g.drawImage(sheet, i * 44, 0, 44, 44, m.x - 22, MISE_Y + lift - 22, 44, 44);
      g.globalAlpha = 1;
      if (past) {
        // A chalk tick on the shelf edge: done, and not coming back.
        g.strokeStyle = 'rgba(244,236,214,0.6)';
        g.lineWidth = 1.8;
        g.lineCap = 'round';
        g.beginPath();
        g.moveTo(m.x - 5, 58);
        g.lineTo(m.x - 1, 62);
        g.lineTo(m.x + 6, 52);
        g.stroke();
      }
      if (cur) {
        // The tag hangs on a thread from the shelf, over the thing it names.
        g.strokeStyle = 'rgba(244,234,210,0.55)';
        g.lineWidth = 1.2;
        g.beginPath();
        g.moveTo(m.x, 25);
        g.lineTo(m.x, MISE_Y - 15);
        g.stroke();
        paperTag(g, m.x, 17, m.tag, 10.5, 0.96);
        keyCap(g, m.x, 78, 'space', 0.95, 0.82);
      }
    }
  }

  private paint(g: CanvasRenderingContext2D, sc: Scene) {
    const t = sc.time;
    const idx = CEVICHE_ORDER.indexOf(this.step);
    const at = (s: CevicheStep) => idx > CEVICHE_ORDER.indexOf(s);
    g.drawImage(bakeCevBg().cv, 0, 0);
    this.paintMise(g, t, idx);

    // The lisa on its board, in as many pieces as you have earned.
    if (this.cuts < 3) {
      const segs = this.cuts + 1;
      const fx = 152;
      const fy = 88;
      for (let i = 0; i < segs; i++) {
        const w = 148 / segs;
        const ox = fx - 74 + i * w + i * 3;
        oval(g, ox + w / 2, fy, w / 2 + 1, 17, '#b8c4cc');
        oval(g, ox + w / 2, fy - 8, w / 2 - 2, 6, '#8fa2ae');
        oval(g, ox + w / 2, fy + 6, w / 2 - 3, 8, '#dde3e7');
      }
      // Tail, eye, gill live on the end pieces.
      g.fillStyle = '#9fb0ba';
      g.beginPath();
      g.moveTo(fx + 74, fy - 4);
      g.lineTo(fx + 98, fy - 13);
      g.lineTo(fx + 98, fy + 13);
      g.lineTo(fx + 74, fy + 4);
      g.closePath();
      g.fill();
      dot(g, fx - 60, fy - 5, 2.6, '#2b2118');
      g.strokeStyle = 'rgba(120,134,144,0.8)';
      g.lineWidth = 1.6;
      g.beginPath();
      g.arc(fx - 50, fy, 9, -0.9, 0.9);
      g.stroke();
      // The knife falls with each press.
      const k = this.chopT;
      const lift = Math.sin(Math.min(1, k) * Math.PI) * 26;
      g.save();
      g.translate(fx + 20, 60 - lift);
      g.rotate(-0.12 + k * 0.12);
      rr(g, -6, -6, 44, 9, 3, '#d6dade');
      g.fillStyle = '#d6dade';
      g.beginPath();
      g.moveTo(38, -6);
      g.lineTo(52, -1);
      g.lineTo(38, 3);
      g.closePath();
      g.fill();
      rr(g, -30, -7, 26, 10, 4, '#5d4226');
      g.restore();
    }

    // Cubes tumble in and rest; the lime whitens them from the edges.
    if (this.dropAt >= 0) {
      const whiten = at('lime') ? 0.85 : this.step === 'lime' ? this.kiss * 0.75 : 0;
      for (let i = 0; i < CUBE_SPOTS.length; i++) {
        const [sx, sy, srot] = CUBE_SPOTS[i]!;
        const p = Math.max(0, Math.min(1, (t - this.dropAt - i * 0.06) / 0.55));
        if (p <= 0) continue;
        const e = easeOutBack(p);
        const x = 160 + (BOWL_X + sx - 160) * p;
        const y = 92 + (BOWL_Y + sy - 92) * e - Math.sin(p * Math.PI) * 46;
        g.save();
        g.translate(x, y);
        g.rotate(srot + (1 - p) * 3);
        rr(g, -9, -8, 18, 16, 4, '#d8a8a0');
        rr(g, -9, -8, 18, 6, 3, '#e8c2ba');
        if (whiten > 0) {
          g.globalAlpha = whiten;
          g.strokeStyle = '#f3ece2';
          g.lineWidth = 3;
          g.beginPath();
          g.roundRect(-8, -7, 16, 14, 4);
          g.stroke();
          g.globalAlpha = whiten * 0.5;
          rr(g, -9, -8, 18, 16, 4, '#f3ece2');
          g.globalAlpha = 1;
        }
        if (this.saltAt >= 0 && p >= 1) {
          dot(g, -3, -2, 1, 'rgba(255,255,255,0.9)');
          dot(g, 4, 3, 1, 'rgba(255,255,255,0.8)');
        }
        g.restore();
      }
    }

    // The leche de tigre pools and clouds.
    if (this.milk > 0.02) {
      g.globalAlpha = Math.min(0.5, this.milk * 0.5);
      oval(g, BOWL_X, BOWL_Y - 2, 96, 22, '#dce8c0');
      g.globalAlpha = Math.min(0.85, this.milk);
      oval(g, BOWL_X, BOWL_Y - 2, 90, 19, '#efece0');
      g.globalAlpha = 1;
      oval(g, BOWL_X - 30 + wobble(t, 0.7) * 8, BOWL_Y - 6, 24, 4, `rgba(255,252,244,${0.28 * this.milk})`);
    }

    // Two lime halves squeeze over the bowl while the kiss runs.
    if (this.step === 'lime') {
      const cycle = (t * 0.85) % 1;
      const sq = Math.max(0, Math.sin(cycle * Math.PI * 2 - Math.PI / 2) * 0.5 + 0.5);
      const n = Math.floor(t * 0.85 * 2);
      if (sq > 0.9 && n !== this.lastSqueeze) {
        this.lastSqueeze = n;
        if (!calm()) {
          sc.burst(BOWL_X - 36, 140, { n: 5, color: 'rgba(230,242,176,0.9)', speed: 30, grav: 380, size: 2, life: 0.55 });
          sc.burst(BOWL_X + 52, 134, { n: 4, color: 'rgba(230,242,176,0.85)', speed: 26, grav: 380, size: 1.8, life: 0.5 });
        }
      }
      for (const [lx, ly, ph] of [
        [BOWL_X - 36, 116, 0],
        [BOWL_X + 52, 108, 0.4],
      ] as const) {
        const k = 1 - Math.max(0, Math.sin((cycle + ph) % 1 * Math.PI * 2 - Math.PI / 2) * 0.5 + 0.5) * 0.3;
        g.save();
        g.translate(lx, ly);
        g.scale(1, k);
        oval(g, 0, 0, 22, 19, '#7fae3f');
        oval(g, 0, 3.5, 18, 14, '#d8e89a');
        g.strokeStyle = 'rgba(150,170,90,0.8)';
        g.lineWidth = 1.3;
        for (let i = 0; i < 5; i++) {
          const a = Math.PI * 0.25 + (i / 4) * Math.PI * 0.5;
          g.beginPath();
          g.moveTo(0, 3.5);
          g.lineTo(Math.cos(a) * 16, 3.5 + Math.sin(a) * 12);
          g.stroke();
        }
        g.restore();
      }
    } else if (at('lime')) {
      // Spent halves rest at the rim, rind up.
      oval(g, BOWL_X - 126, BOWL_Y - 40, 14, 9, '#7fae3f');
      oval(g, BOWL_X - 106, BOWL_Y - 32, 12, 8, '#8fba50');
    }

    // Onion feathers drift down and settle.
    if (this.onionAt >= 0) {
      for (let i = 0; i < 5; i++) {
        const p = Math.max(0, Math.min(1, (t - this.onionAt - i * 0.12) / 0.9));
        if (p <= 0) continue;
        const tx = BOWL_X - 70 + i * 34;
        const ty = BOWL_Y - 12 + (i % 2) * 10;
        const y = 70 + (ty - 70) * easeOutCubic(p);
        const x = tx + Math.sin(p * 5 + i) * 10 * (1 - p);
        g.strokeStyle = '#8c3a6e';
        g.lineWidth = 3.4;
        g.beginPath();
        g.arc(x, y, 10, Math.PI * (1.1 + p * 0.05), Math.PI * 1.9);
        g.stroke();
        g.strokeStyle = '#e8c8dc';
        g.lineWidth = 1.5;
        g.beginPath();
        g.arc(x, y, 10, Math.PI * 1.15, Math.PI * 1.85);
        g.stroke();
      }
    }

    // The whisper of aji.
    if (this.ajiAt >= 0) {
      const p = Math.min(1, (t - this.ajiAt) / 0.4);
      const e = easeOutBack(p);
      for (let i = 0; i < 3; i++) {
        oval(g, BOWL_X - 12 + i * 14, BOWL_Y - 18 + (i % 2) * 8, 6 * e, 3 * e, '#e8a03c');
      }
    }

    // Cancha from the left, camote from the right, each on its plate.
    for (const [side, when] of [
      [0, this.sideAt[0]!],
      [1, this.sideAt[1]!],
    ] as const) {
      if (when < 0) continue;
      const p = Math.min(1, (t - when) / 0.6);
      const e = easeOutBack(p);
      const homeX = side === 0 ? 92 : 548;
      const x = side === 0 ? -80 + (homeX + 80) * e : 720 - (720 - homeX) * e;
      const y = 296;
      oval(g, x, y + 12, 52, 10, 'rgba(20,14,10,0.3)');
      oval(g, x, y, 54, 18, '#b5713f');
      oval(g, x, y - 3, 46, 13, '#c98a63');
      if (side === 0) {
        const rng = new Rng(7);
        for (let i = 0; i < 9; i++) {
          dot(g, x - 30 + rng.next() * 60, y - 6 + rng.next() * 8, 3.4, rng.chance(0.5) ? '#d9b96a' : '#c98a2e');
        }
      } else {
        for (let i = 0; i < 3; i++) {
          oval(g, x - 18 + i * 18, y - 4, 11, 6.5, '#d97b3c');
          g.strokeStyle = '#8c4a2c';
          g.lineWidth = 1.6;
          g.beginPath();
          g.ellipse(x - 18 + i * 18, y - 4, 11, 6.5, 0, 0, Math.PI * 2);
          g.stroke();
        }
      }
    }

    // The tiger's own glass, filling on the pour.
    const gx = 560;
    const gTop = 112;
    const gBot = 186;
    // A faint pane of glass, honest about being empty.
    g.fillStyle = 'rgba(255,255,255,0.07)';
    g.beginPath();
    g.moveTo(gx - 23, gTop);
    g.lineTo(gx - 21, gBot - 12);
    g.quadraticCurveTo(gx, gBot + 2, gx + 21, gBot - 12);
    g.lineTo(gx + 23, gTop);
    g.closePath();
    g.fill();
    const fill = this.pourAt < 0 ? 0 : Math.min(1, (t - this.pourAt) / 0.8);
    if (this.pourAt >= 0 && fill < 1) {
      g.strokeStyle = 'rgba(239,236,224,0.85)';
      g.lineWidth = 4;
      g.beginPath();
      g.moveTo(gx, 84);
      g.quadraticCurveTo(gx + 2, 130, gx, gBot - 8);
      g.stroke();
      if (!calm()) sc.burst(gx, gBot - 8, { n: 1, color: 'rgba(239,236,224,0.8)', speed: 26, grav: 120, size: 1.6, life: 0.3 });
    }
    const fh = 58 * easeOutCubic(fill) * (this.pour ? 1 : 0);
    if (fh > 0) {
      rr(g, gx - 19, gBot - 8 - fh, 38, fh + 4, 5, '#efece0');
      oval(g, gx, gBot - 8 - fh, 19, 4, '#f7f4ea');
    }
    g.strokeStyle = 'rgba(255,255,255,0.6)';
    g.lineWidth = 2.4;
    g.beginPath();
    g.moveTo(gx - 23, gTop);
    g.lineTo(gx - 21, gBot - 12);
    g.quadraticCurveTo(gx, gBot + 2, gx + 21, gBot - 12);
    g.lineTo(gx + 23, gTop);
    g.stroke();
    g.strokeStyle = 'rgba(255,255,255,0.28)';
    g.lineWidth = 1.4;
    g.beginPath();
    g.ellipse(gx, gTop, 22, 5, 0, 0, Math.PI * 2);
    g.stroke();

    // The lime bar, same zone as ever: out while it burns bright.
    if (this.step === 'lime') {
      rr(g, 130, 306, 380, 12, 6, 'rgba(20,14,10,0.5)');
      rr(g, 130 + 380 * 0.5, 306, 380 * 0.3, 12, 3, `rgba(214,255,140,${0.3 + wobble(t, 5) * 0.08})`);
      g.strokeStyle = '#d6ff8c';
      g.lineWidth = 1.4;
      g.strokeRect(130 + 380 * 0.5, 306, 380 * 0.3, 12);
      const cx = 130 + Math.min(0.99, this.kiss) * 380;
      const hot = this.kiss >= 0.5 && this.kiss < 0.8;
      rr(g, cx - 2, 302, 4, 20, 2, hot ? '#d6ff8c' : '#f2e6d0');
      if (hot) stampGlow(g, cx, 312, 20, '#d6ff8c', 0.5);
    }

    // The clock, still approving.
    const clockMin = 1 + idx * 0.5 + this.spoiled;
    g.fillStyle = 'rgba(255,248,235,0.65)';
    g.font = '11px system-ui, sans-serif';
    g.textAlign = 'right';
    g.fillText(`12:${String(Math.floor(clockMin)).padStart(2, '0')} · the clock approves`, 628, 332);
    g.textAlign = 'left';
  }
}
