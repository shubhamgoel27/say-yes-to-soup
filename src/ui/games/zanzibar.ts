import type { Dir } from '../../engine/input';
import type { AudioBus } from '../../engine/audio';
import { Scene, mountScene, wobble, easeOutCubic, easeOutElastic, squashed } from './scene';
import { Rng, blob, dot, oval, rect, rr, surface, vgrad, glowSpot, softShadow } from '../../art/pix';

/**
 * The coast's hands-on verb: trimming a ngalawa's lateen sail on the kaskazi.
 *
 * The wind arrow wanders; you ease the sheet with left/right so the sail
 * angle stays inside the wind's good zone. When the telltale streams, you
 * make way. Luffing cannot hurt you; it only slows you down, which on this
 * coast is barely a punishment at all.
 */

type Cv = HTMLCanvasElement;

const calm = () => document.body.classList.contains('reduce-motion');

/** Maps a 0..1 track value (wind or sheet) onto a visible rig angle in radians. */
const visAng = (v: number) => (v - 0.5) * 0.9;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** A soft radial sprite so dynamic glows never build gradients per frame. */
function bakeGlow(color: string): Cv {
  const { cv, g } = surface(128, 128);
  glowSpot(g, 64, 64, 62, color, 1);
  return cv;
}

let shadowSpr: Cv | null = null;
function shadowSprite(): Cv {
  if (shadowSpr) return shadowSpr;
  const { cv, g } = surface(128, 64);
  softShadow(g, 64, 32, 58, 28, 0.55);
  shadowSpr = cv;
  return cv;
}

function blit(g: CanvasRenderingContext2D, cv: Cv, x: number, y: number, w: number, h: number, alpha: number) {
  g.globalAlpha = alpha;
  g.drawImage(cv, x, y, w, h);
  g.globalAlpha = 1;
}

/** A low ribbon of water: a wavy translucent band, cheap enough to animate. */
function waveBand(g: CanvasRenderingContext2D, w: number, y: number, amp: number, wl: number, ph: number, color: string, alpha: number, h = 4) {
  g.globalAlpha = alpha;
  g.fillStyle = color;
  g.beginPath();
  g.moveTo(-12, y + Math.sin(-12 / wl + ph) * amp);
  for (let x = 4; x <= w + 12; x += 16) g.lineTo(x, y + Math.sin(x / wl + ph) * amp);
  for (let x = w + 12; x >= -12; x -= 16) g.lineTo(x, y + Math.sin(x / wl + ph) * amp + h);
  g.closePath();
  g.fill();
  g.globalAlpha = 1;
}

// ---------------------------------------------------------------- sail bakes

let sailBgCv: Cv | null = null;
function sailBackdrop(): Cv {
  if (sailBgCv) return sailBgCv;
  const { cv, g } = surface(640, 340);
  vgrad(g, 0, 0, 640, 152, '#9fd3e8', '#f0e6c8');
  // Layered alpha discs, not a radial gradient: transparent-black stops muddy a light sky.
  for (const [r, a] of [[86, 0.08], [62, 0.1], [42, 0.14], [26, 0.22]] as const) {
    g.globalAlpha = a;
    dot(g, 528, 36, r, '#fff8e0');
  }
  g.globalAlpha = 1;
  dot(g, 528, 36, 16, '#fdf6de');
  const rng = new Rng(707);
  for (let i = 0; i < 4; i++) {
    const x = 46 + i * 158 + rng.int(56);
    const y = 26 + rng.int(54);
    g.globalAlpha = 0.72;
    for (let j = 0; j < 5; j++) oval(g, x + j * 15 - 30 + rng.int(9), y + rng.int(9) - 4, 15 + rng.int(13), 6 + rng.int(5), '#f7f1e2');
    g.globalAlpha = 1;
  }
  // A low green island far off to port, with two lazy palms.
  oval(g, 84, 149, 66, 9, '#86b28a');
  oval(g, 64, 145, 28, 7, '#6e9e5a');
  g.strokeStyle = '#54704a';
  g.lineWidth = 2;
  g.beginPath();
  g.moveTo(58, 146);
  g.quadraticCurveTo(60, 136, 66, 132);
  g.stroke();
  for (let k = 0; k < 5; k++) oval(g, 66 + Math.cos(k * 1.25) * 7, 131 + Math.sin(k * 1.25) * 3, 6, 2, '#4d7440', k * 0.7);
  // Other sails working the same wind, far off.
  g.fillStyle = '#f4efe0';
  g.beginPath();
  g.moveTo(432, 148); g.lineTo(438, 132); g.lineTo(441, 148); g.closePath(); g.fill();
  g.beginPath();
  g.moveTo(560, 149); g.lineTo(564, 139); g.lineTo(567, 149); g.closePath(); g.fill();
  rect(g, 0, 148, 640, 3, '#ece4c8');
  vgrad(g, 0, 151, 640, 189, '#57bfc9', '#22506a');
  g.globalAlpha = 0.2;
  oval(g, 528, 168, 58, 7, '#ffe9b0');
  oval(g, 522, 192, 42, 6, '#ffe9b0');
  g.globalAlpha = 1;
  sailBgCv = cv;
  return cv;
}

let coralCv: Cv | null = null;
function coralStrip(): Cv {
  if (coralCv) return coralCv;
  const { cv, g } = surface(1280, 108);
  const rng = new Rng(4141);
  const wrap = (draw: (x: number) => void, x: number) => {
    draw(x);
    draw(x - 1280);
    draw(x + 1280);
  };
  for (let i = 0; i < 24; i++) {
    const x = rng.int(1280);
    const y = 18 + rng.int(80);
    const r = 18 + rng.int(28);
    g.globalAlpha = 0.26;
    wrap((wx) => blob(g, wx, y, r, '#8fd8c9', new Rng(i * 31 + 5), 0.35), x);
    g.globalAlpha = 1;
  }
  for (let i = 0; i < 15; i++) {
    const x = rng.int(1280);
    const y = 30 + rng.int(66);
    g.globalAlpha = 0.3;
    wrap((wx) => blob(g, wx, y, 7 + rng.int(9), i % 3 ? '#c07a5a' : '#b8895e', new Rng(i * 17 + 3), 0.5), x);
    g.globalAlpha = 1;
  }
  g.strokeStyle = '#3f7a6a';
  g.lineWidth = 2;
  for (let i = 0; i < 20; i++) {
    const x = rng.int(1280);
    const y = 40 + rng.int(60);
    g.globalAlpha = 0.28;
    wrap((wx) => {
      g.beginPath();
      g.moveTo(wx, y);
      g.quadraticCurveTo(wx + 3, y - 8, wx - 2, y - 14);
      g.stroke();
    }, x);
    g.globalAlpha = 1;
  }
  coralCv = cv;
  return cv;
}

let villageCv: Cv | null = null;
function villageCard(): Cv {
  if (villageCv) return villageCv;
  const { cv, g } = surface(230, 110);
  oval(g, 120, 96, 110, 14, '#e3d4a8');
  for (let i = 0; i < 3; i++) {
    const x = 52 + i * 58;
    rr(g, x, 62, 34, 26, 2, '#c9a06a');
    g.fillStyle = '#8a6238';
    g.beginPath();
    g.moveTo(x - 5, 64); g.lineTo(x + 17, 46); g.lineTo(x + 39, 64); g.closePath(); g.fill();
    rect(g, x + 13, 74, 8, 14, '#5c4a30');
  }
  g.strokeStyle = '#6b4a32';
  g.lineWidth = 3;
  g.beginPath();
  g.moveTo(196, 92); g.quadraticCurveTo(200, 66, 210, 56);
  g.stroke();
  for (let k = 0; k < 6; k++) oval(g, 210 + Math.cos(k) * 12, 55 + Math.sin(k) * 5, 9, 2.5, '#4d7440', k * 0.9);
  g.strokeStyle = '#7d5836';
  g.lineWidth = 2.5;
  for (let i = 0; i < 5; i++) {
    g.beginPath();
    g.moveTo(6 + i * 9, 92); g.lineTo(6 + i * 9, 100);
    g.stroke();
  }
  rect(g, 2, 90, 46, 3, '#8a6238');
  villageCv = cv;
  return cv;
}

type SailPhase = 'sail' | 'done';

export class SailPanel {
  private phase: SailPhase = 'sail';
  private wind = 0.5; // where the good trim lives on the track, 0..1
  private windTarget = 0.5;
  private shiftT = 0; // seconds until the kaskazi wanders again
  private sail = 0.5; // your trim, 0..1
  private dist = 0; // way made good
  private need = 12;
  private wasTrim = false;
  private hint = '';
  private onDone: (() => void) | null = null;

  // The painted layer. Nothing below touches the sailing itself.
  private scene = new Scene();
  private setHint: (h: string) => void = () => {};
  private sailVis = 0; // eased rig angle, radians
  private heelVis = 0;
  private billow = 8;
  private luff = 5;
  private side = 0; // which side of the wind the trim sits, for boom thumps
  private scroll = 0;
  private sprayT = 0;
  private wakeT = 0;
  private doneT = 0;

  constructor(
    private root: HTMLElement,
    private audio: AudioBus,
  ) {}

  get isOpen(): boolean {
    return !this.root.hidden;
  }

  open(onDone: () => void) {
    this.onDone = onDone;
    this.phase = 'sail';
    this.wind = 0.5;
    this.windTarget = 0.62;
    this.shiftT = 3;
    this.sail = 0.24;
    this.dist = 0;
    this.wasTrim = false;
    this.hint = 'The kaskazi fills in from the northeast. Ease the sail with the arrows until the telltale streams.';
    this.root.hidden = false;
    this.root.style.lineHeight = '1.45'; // the #frame ancestor zeroes line-height; hints need it back
    const m = mountScene(this.root, 'The Kaskazi', this.scene);
    this.setHint = m.setHint;
    this.scene.restart();
    this.sailVis = visAng(this.sail);
    this.heelVis = 0.012;
    this.billow = 8;
    this.luff = 5;
    this.side = 0;
    this.scroll = 0;
    this.sprayT = 0.4;
    this.wakeT = 0.3;
    this.doneT = 0;
    this.scene.frame(0, (g) => this.paint(g));
    this.setHint(this.hint);
  }

  tick(dt: number) {
    if (!this.isOpen) return;
    if (this.phase === 'sail') {
      // The wind wanders, pole pole, and sometimes picks a new opinion.
      this.shiftT -= dt;
      if (this.shiftT <= 0) {
        this.windTarget = 0.18 + Math.random() * 0.64;
        this.shiftT = 2.6 + Math.random() * 2.6;
      }
      const d = this.windTarget - this.wind;
      this.wind += Math.max(-0.09 * dt, Math.min(0.09 * dt, d)) + (Math.random() - 0.5) * 0.02 * dt;
      this.wind = Math.max(0.05, Math.min(0.95, this.wind));

      const trimmed = Math.abs(this.sail - this.wind) < 0.11;
      if (trimmed && !this.wasTrim) {
        this.audio.slosh();
        this.scene.flash('#eaf8ff', 0.12);
        const bow = this.boatPoint(112, -2);
        this.scene.burst(bow.x, bow.y, { n: calm() ? 4 : 10, color: '#f2fbfa', speed: 120, grav: 300, size: 2.6, life: 0.55 });
      }
      this.wasTrim = trimmed;
      this.dist += dt * (trimmed ? 1 : 0.15);
      this.hint = trimmed
        ? 'The telltale streams. The hull hums; the outriggers barely kiss the water.'
        : 'The sail luffs and grumbles. No harm done; you just slow. Follow the wind arrow with the arrows.';
      if (this.dist >= this.need) {
        this.phase = 'done';
        this.audio.weaveDone();
        this.scene.flash('#ffe9b8', 0.3);
        if (!calm()) this.scene.thump(3, 0.04);
        this.hint = 'Bakari puts the tiller over and the village swings back into view. Press Space to come ashore.';
      }
    }
    this.animate(dt);
    this.scene.frame(dt, (g) => this.paint(g));
    const pct = Math.min(100, Math.round((this.dist / this.need) * 100));
    this.setHint(this.phase === 'sail' ? `${this.hint} <em>${pct}% of the reach sailed.</em>` : this.hint);
  }

  onDir(dir: Dir) {
    if (this.phase !== 'sail') return;
    if (dir === 'left') this.sail -= 0.05;
    if (dir === 'right') this.sail += 0.05;
    this.sail = Math.max(0.02, Math.min(0.98, this.sail));
  }

  onAction() {
    if (this.phase === 'done') {
      this.root.hidden = true;
      const done = this.onDone;
      this.onDone = null;
      done?.();
    }
  }

  // ------------------------------------------------------------ painted sea

  /** Eases the rig, spawns spray and wake, and thumps the boom across tacks. */
  private animate(dt: number) {
    const trimmed = Math.abs(this.sail - this.wind) < 0.11;
    const sp = this.phase === 'done' ? 0.4 : trimmed ? 1 : 0.25;
    this.scroll += dt * (26 + sp * 84);
    this.sailVis += (visAng(this.sail) - this.sailVis) * Math.min(1, dt * 5);
    this.heelVis += ((trimmed ? 0.05 : 0.012) - this.heelVis) * Math.min(1, dt * 2.5);
    this.billow += ((trimmed ? 20 : 7) - this.billow) * Math.min(1, dt * 4);
    this.luff += ((trimmed ? 1.1 : 6) - this.luff) * Math.min(1, dt * 4);
    const side = Math.sign(this.sail - this.wind) || this.side;
    if (side !== this.side && this.side !== 0 && this.phase === 'sail') {
      // The yard swings across and lands on the new tack with a knock.
      if (!calm()) this.scene.thump(3.5, 0.03);
      const m = this.boatPoint(26, -130);
      this.scene.burst(m.x, m.y, { n: calm() ? 2 : 5, color: '#efe6d0', speed: 40, grav: 60, size: 2, life: 0.4 });
    }
    this.side = side;
    this.sprayT -= dt;
    if (this.sprayT <= 0) {
      const bow = this.boatPoint(108, 2);
      const n = trimmed ? (calm() ? 3 : 8) : 2;
      this.scene.burst(bow.x, bow.y, { n, color: '#eefaf8', speed: trimmed ? 120 : 55, grav: 320, size: 2.4, life: 0.5 });
      this.sprayT = trimmed ? 0.32 : 1.1;
    }
    this.wakeT -= dt;
    if (this.wakeT <= 0) {
      const st = this.boatPoint(-98, 8);
      this.scene.burst(st.x, st.y, { n: 2, color: 'rgba(240,252,250,0.85)', kind: 'puff', speed: 16, grav: -4, size: 3, life: 0.9 });
      this.wakeT = trimmed ? 0.14 : 0.4;
    }
    if (this.phase === 'done') this.doneT += dt;
  }

  private boatPose() {
    const t = this.scene.time;
    return {
      x: 268,
      y: 226 + wobble(t, 1.15, 0.7) * 3.5,
      rot: wobble(t, 1.15) * 0.028 + wobble(t, 2.6, 1.4) * 0.01 + this.heelVis,
    };
  }

  /** World position of a boat-local point, for spawning spray off the hull. */
  private boatPoint(lx: number, ly: number) {
    const p = this.boatPose();
    const c = Math.cos(p.rot);
    const s = Math.sin(p.rot);
    return { x: p.x + lx * c - ly * s, y: p.y + lx * s + ly * c };
  }

  private paint(g: CanvasRenderingContext2D) {
    const t = this.scene.time;
    const W = this.scene.W;
    const H = this.scene.H;
    g.drawImage(sailBackdrop(), 0, 0);

    // Wind made visible: streak lines riding the kaskazi across the sky.
    const wa = visAng(this.wind);
    const dx = Math.cos(wa);
    const dy = Math.sin(wa);
    g.strokeStyle = '#ffffff';
    g.lineWidth = 1.5;
    const span = 780;
    for (let i = 0; i < 11; i++) {
      const d = (t * 150 + i * 293) % span;
      const ox = -60 + ((i * 67) % 40);
      const oy = 14 + ((i * 53) % 112);
      const x = ox + dx * d;
      const y = oy + dy * d;
      if (y > 144 || x > W + 20) continue;
      g.globalAlpha = 0.5 * Math.sin((d / span) * Math.PI);
      g.beginPath();
      g.moveTo(x, y);
      g.quadraticCurveTo(x + dx * 13 - dy * 2.5, y + dy * 13 + dx * 2.5, x + dx * 27, y + dy * 27);
      g.stroke();
    }
    g.globalAlpha = 1;

    waveBand(g, W, 168, 2.5, 46, t * 1.6, '#bfe8e6', 0.35, 3);

    // The reef sliding past under the hull: how you feel the boat move.
    const cx0 = -(this.scroll % 1280);
    g.drawImage(coralStrip(), cx0, 232);
    g.drawImage(coralStrip(), cx0 + 1280, 232);
    g.globalAlpha = 0.35;
    rect(g, 0, 232, W, H - 232, '#3d7d92');
    g.globalAlpha = 1;
    waveBand(g, W, 246, 3.5, 60, -t * 2.1 + 1.2, '#8fd8d2', 0.3, 4);

    if (this.phase === 'done') {
      const k = easeOutCubic(Math.min(1, this.doneT / 1.6));
      g.drawImage(villageCard(), W - 24 - 216 * k, 54);
    }

    this.paintBoat(g, t);
    waveBand(g, W, 302, 4, 70, t * 1.8 + 3, '#a8e0da', 0.22, 5);
    this.paintCompass(g);
  }

  private paintBoat(g: CanvasRenderingContext2D, t: number) {
    const pose = this.boatPose();
    const trimmed = Math.abs(this.sail - this.wind) < 0.11;
    g.save();
    g.translate(pose.x, pose.y);
    g.rotate(pose.rot);

    blit(g, shadowSprite(), -92, 8, 184, 48, 0.5);

    // Outrigger float, riding to seaward of the hull.
    g.strokeStyle = '#5c4a30';
    g.lineWidth = 3.5;
    g.beginPath();
    g.moveTo(-40, 6); g.quadraticCurveTo(-48, 20, -50, 32);
    g.moveTo(28, 4); g.quadraticCurveTo(24, 20, 18, 32);
    g.stroke();
    rr(g, -72, 28, 108, 8, 4, '#6b4a32');
    rr(g, -72, 33, 108, 3, 2, '#4a3222');

    // Hull: a worked dugout with a raised prow and an eye that watches the reef.
    g.fillStyle = '#7d5836';
    g.beginPath();
    g.moveTo(-95, -10);
    g.quadraticCurveTo(0, -1, 100, -16);
    g.lineTo(114, -34);
    g.quadraticCurveTo(112, -20, 102, -8);
    g.quadraticCurveTo(50, 17, 0, 17);
    g.quadraticCurveTo(-65, 14, -95, -10);
    g.closePath();
    g.fill();
    g.strokeStyle = '#a97c50';
    g.lineWidth = 3.5;
    g.beginPath();
    g.moveTo(-93, -9);
    g.quadraticCurveTo(0, 0, 99, -15);
    g.stroke();
    g.globalAlpha = 0.3;
    oval(g, 2, 12, 86, 5, '#241a12');
    g.globalAlpha = 1;
    dot(g, 96, -21, 3.2, '#f2e6d0');
    dot(g, 96.6, -21, 1.4, '#2b2118');

    // Mast, raked a little, with a pennant that knows the wind before you do.
    g.strokeStyle = '#5c4a30';
    g.lineWidth = 5;
    g.lineCap = 'round';
    g.beginPath();
    g.moveTo(14, -8);
    g.lineTo(26, -134);
    g.stroke();
    const wa = visAng(this.wind);
    const pdx = Math.cos(wa);
    const pdy = Math.sin(wa);
    g.fillStyle = '#c1512f';
    g.beginPath();
    g.moveTo(26, -136);
    g.lineTo(26 + pdx * 16, -136 + pdy * 16 + wobble(t, 9) * 1.6);
    g.lineTo(26 + pdx * 3, -130);
    g.closePath();
    g.fill();

    this.paintSail(g, t, trimmed, pdx, pdy);

    // Bakari on the tiller aft, you amidships on the sheet.
    g.strokeStyle = '#4a3222';
    g.lineWidth = 3;
    g.beginPath();
    g.moveTo(-88, -8); g.lineTo(-104, 4);
    g.stroke();
    rr(g, -78, -32, 11, 22, 4, '#2c3e57');
    dot(g, -72.5, -37, 4.5, '#6b4a32');
    dot(g, -71, -38.2, 1, '#e8dcc4');
    rr(g, -12, -34, 11, 22, 4, '#a2543c');
    dot(g, -6.5, -39, 4.5, '#8a5e42');

    if (trimmed) {
      g.strokeStyle = '#f2fbfa';
      g.lineWidth = 2;
      g.globalAlpha = 0.5;
      for (let i = 0; i < 3; i++) {
        const y = -2 + i * 7;
        const x = -100 - ((t * 260 + i * 37) % 46);
        g.beginPath();
        g.moveTo(x, y);
        g.lineTo(x - 14, y + 1);
        g.stroke();
      }
      g.globalAlpha = 1;
    }
    g.restore();
  }

  private paintSail(g: CanvasRenderingContext2D, t: number, trimmed: boolean, pdx: number, pdy: number) {
    const M = { x: 26, y: -134 };
    const a = this.sailVis;
    const ca = Math.cos(a);
    const sa = Math.sin(a);
    const rp = (px: number, py: number) => {
      const ddx = px - M.x;
      const ddy = py - M.y;
      return { x: M.x + ddx * ca - ddy * sa, y: M.y + ddx * sa + ddy * ca };
    };
    const A = rp(122, -50); // tack, dipped toward the bow
    const B = rp(-38, -168); // peak, high over the stern
    const C = rp(-70, -22); // clew, sheeted from your hand

    // Cloth first, then the yard laid over its luff edge.
    let ex = C.x - B.x;
    let ey = C.y - B.y;
    const el = Math.hypot(ex, ey) || 1;
    ex /= el;
    ey /= el;
    let px = -ey;
    let py = ex;
    if (px < 0) { px = -px; py = -py; }
    g.fillStyle = '#ece1c8';
    g.beginPath();
    g.moveTo(A.x, A.y);
    g.lineTo(B.x, B.y);
    const nL = 9;
    for (let i = 1; i <= nL; i++) {
      const s = i / nL;
      const bell = Math.sin(Math.PI * s);
      const off = bell * this.billow + Math.sin(t * 11 + s * 6.5) * this.luff * bell;
      g.lineTo(B.x + ex * el * s + px * off, B.y + ey * el * s + py * off);
    }
    g.quadraticCurveTo((C.x + A.x) / 2 + px * 5, (C.y + A.y) / 2 + 10, A.x, A.y);
    g.closePath();
    g.fill();

    // Seams and shading so the cloth reads as cloth, not paper.
    g.strokeStyle = 'rgba(90,70,40,0.16)';
    g.lineWidth = 1;
    for (const f of [0.3, 0.55, 0.8]) {
      const y1 = { x: lerp(A.x, B.x, f), y: lerp(A.y, B.y, f) };
      const y2 = { x: lerp(A.x, C.x, f), y: lerp(A.y, C.y, f) };
      const mx = (y1.x + y2.x) / 2 + px * this.billow * 0.5;
      const my = (y1.y + y2.y) / 2 + py * this.billow * 0.5;
      g.beginPath();
      g.moveTo(y1.x, y1.y);
      g.quadraticCurveTo(mx, my, y2.x, y2.y);
      g.stroke();
    }
    g.globalAlpha = 0.07;
    g.fillStyle = '#4a3a24';
    g.beginPath();
    g.moveTo(A.x, A.y); g.lineTo(B.x, B.y); g.lineTo(lerp(B.x, C.x, 0.4), lerp(B.y, C.y, 0.4));
    g.closePath();
    g.fill();
    g.globalAlpha = 1;
    if (this.luff > 3) {
      // Shiver bands chasing across a sail that has lost the wind.
      g.strokeStyle = 'rgba(43,33,24,0.1)';
      g.lineWidth = 6;
      for (let k = 0; k < 2; k++) {
        const u = 0.15 + (((t * 1.3 + k * 0.5) % 1) * 0.7);
        const y1 = { x: lerp(A.x, B.x, u), y: lerp(A.y, B.y, u) };
        const y2 = { x: lerp(A.x, C.x, u), y: lerp(A.y, C.y, u) };
        g.beginPath();
        g.moveTo(y1.x, y1.y);
        g.quadraticCurveTo((y1.x + y2.x) / 2 + px * 9, (y1.y + y2.y) / 2 + py * 9, y2.x, y2.y);
        g.stroke();
      }
    }

    // The yard, run out past both ends of the luff.
    g.strokeStyle = '#6b4a32';
    g.lineWidth = 4;
    g.beginPath();
    g.moveTo(A.x + (A.x - B.x) * 0.04, A.y + (A.y - B.y) * 0.04);
    g.lineTo(B.x + (B.x - A.x) * 0.04, B.y + (B.y - A.y) * 0.04);
    g.stroke();

    // Sheet from your hand to the clew.
    g.strokeStyle = 'rgba(58,42,26,0.8)';
    g.lineWidth = 1.5;
    g.beginPath();
    g.moveTo(-4, -26);
    g.quadraticCurveTo((C.x - 4) / 2, Math.max(C.y, -26) + 12, C.x, C.y);
    g.stroke();

    // The telltale: the whole game, one ribbon.
    const T = { x: lerp(A.x, B.x, 0.86), y: lerp(A.y, B.y, 0.86) };
    g.strokeStyle = '#c1512f';
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(T.x, T.y);
    let rx = T.x;
    let ry = T.y;
    for (let i = 1; i <= 6; i++) {
      const flap = trimmed ? Math.sin(t * 7 + i * 0.9) * 1.6 : Math.sin(t * 26 + i * 2.2) * 4;
      rx += pdx * (trimmed ? 6.4 : 4.4);
      ry += pdy * (trimmed ? 6.4 : 4.4) + flap;
      g.lineTo(rx, ry);
    }
    g.stroke();
  }

  private paintCompass(g: CanvasRenderingContext2D) {
    const x = 47;
    const y = 47;
    g.globalAlpha = 0.88;
    dot(g, x, y, 27, '#f2e6d0');
    g.globalAlpha = 1;
    g.strokeStyle = 'rgba(43,33,24,0.55)';
    g.lineWidth = 1.5;
    g.beginPath();
    g.arc(x, y, 27, 0, Math.PI * 2);
    g.stroke();
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      g.beginPath();
      g.moveTo(x + Math.cos(a) * 22, y + Math.sin(a) * 22);
      g.lineTo(x + Math.cos(a) * 26, y + Math.sin(a) * 26);
      g.stroke();
    }
    const deg = ((25 + (this.wind - 0.5) * 60) * Math.PI) / 180;
    g.save();
    g.translate(x, y);
    g.rotate(deg);
    g.fillStyle = '#c1512f';
    g.beginPath();
    g.moveTo(-14, -2.5); g.lineTo(8, -2.5); g.lineTo(8, -6.5); g.lineTo(19, 0); g.lineTo(8, 6.5); g.lineTo(8, 2.5); g.lineTo(-14, 2.5);
    g.closePath();
    g.fill();
    g.restore();
    g.fillStyle = 'rgba(43,33,24,0.8)';
    g.font = '600 10px Literata, Georgia, serif';
    g.textAlign = 'center';
    g.fillText('kaskazi', x, y + 41);
  }
}

// ---------------------------------------------------------------- the urojo cart

/**
 * UrojoPanel: behind Zuberi's pot at the market corner. The customer calls a
 * bowl; you build it from the components ringed around the vat, each add
 * landing with a visible splash. There is no wrong bowl. There are only bowls
 * Zuberi gets to describe afterward, which is his favorite part of the job.
 */

type UrojoItem = { name: string; color: string; splash: string };

const UROJO_ITEMS: UrojoItem[] = [
  { name: 'Mango sour', color: '#d9a83c', splash: 'The green mango goes in sharp. The broth brightens like it took offense.' },
  { name: 'Potato', color: '#e8d6a8', splash: 'Boiled potato, in with a plunk. The bowl gains ballast.' },
  { name: 'Bhajia', color: '#b06a2e', splash: 'Bhajia splash down and start drinking broth immediately. They know their work.' },
  { name: 'Boiled egg', color: '#f2ead8', splash: 'Half an egg settles in like a passenger who booked ahead.' },
  { name: 'Cassava crunch', color: '#d8c48a', splash: 'A fistful of cassava crisps. The bowl audibly gains an opinion.' },
  { name: 'Coconut chutney', color: '#e6e2d0', splash: 'A white spoonful of coconut chutney spreads calm over the whole argument.' },
  { name: 'Chili chutney', color: '#c1512f', splash: 'Red chutney hits the gold and blooms. Somewhere, a customer sits up straighter.' },
];

type UrojoRound = { call: string; want: 'brave' | 'crunch' };

const UROJO_ROUNDS: UrojoRound[] = [
  { call: 'Hamisi from the flats leans on the cart: "Sour and brave, please. The tide took my whole morning and I want it back."', want: 'brave' },
  { call: 'Bi Mwana the teacher is next: "Gentle for me, and extra crunch. I am grading essays tonight; I need courage, not heartburn."', want: 'crunch' },
];

type UrojoPhase = 'build' | 'served' | 'done';

type Float = { kind: number; sx: number; sy: number; fx: number; fy: number; born: number; landed: boolean; spin: number; phase: number };
type Ring = { x: number; y: number; t0: number };

const BOWL_X = 330;
const BOWL_Y = 196;
const SLOT_Y = 297;
const slotX = (i: number) => 55 + i * 76;

let urojoBgCv: Cv | null = null;
function urojoBackdrop(): Cv {
  if (urojoBgCv) return urojoBgCv;
  const { cv, g } = surface(640, 340);
  vgrad(g, 0, 0, 640, 132, '#5a4a82', '#d9915e');
  for (const [r, a] of [[92, 0.07], [64, 0.1], [42, 0.14], [24, 0.2]] as const) {
    g.globalAlpha = a;
    dot(g, 552, 78, r, '#ffcf8a');
  }
  g.globalAlpha = 1;
  dot(g, 552, 78, 12, '#ffe6b8');
  // Stone Town giving up its blue: rooftops, a dome, one palm.
  g.fillStyle = '#43333a';
  rect(g, 0, 108, 120, 26, '#43333a');
  rect(g, 128, 98, 90, 36, '#43333a');
  g.beginPath();
  g.arc(260, 112, 22, Math.PI, 0);
  g.fill();
  rect(g, 238, 112, 44, 22, '#43333a');
  rect(g, 300, 104, 110, 30, '#43333a');
  rect(g, 470, 96, 74, 38, '#43333a');
  rect(g, 560, 108, 80, 26, '#43333a');
  g.strokeStyle = '#3a2c31';
  g.lineWidth = 3;
  g.beginPath();
  g.moveTo(438, 132); g.quadraticCurveTo(442, 106, 452, 96);
  g.stroke();
  for (let k = 0; k < 6; k++) oval(g, 452 + Math.cos(k * 1.1) * 13, 95 + Math.sin(k * 1.1) * 5, 10, 3, '#3a2c31', k * 0.9);
  // Dusk street behind the cart.
  vgrad(g, 0, 132, 640, 104, '#8a5f46', '#6e4a38');
  g.globalAlpha = 0.25;
  for (let i = 0; i < 5; i++) rect(g, 20 + i * 130, 150, 64, 86, '#43333a');
  g.globalAlpha = 1;
  // The lamp wire with its bulbs; their glow flickers live.
  g.strokeStyle = 'rgba(30,22,26,0.8)';
  g.lineWidth = 1.5;
  g.beginPath();
  g.moveTo(0, 118);
  g.quadraticCurveTo(320, 152, 640, 108);
  g.stroke();
  for (let i = 0; i < 8; i++) {
    const x = 40 + i * 80;
    const u = x / 640;
    const y = (1 - u) * (1 - u) * 118 + 2 * (1 - u) * u * 152 + u * u * 108;
    dot(g, x, y + 4, 3, '#ffd9a0');
  }
  // The counter: cart wood, planked, with a proud front edge.
  vgrad(g, 0, 236, 640, 104, '#8a5c38', '#6e4526');
  g.strokeStyle = 'rgba(43,26,14,0.5)';
  g.lineWidth = 1.5;
  for (let i = 1; i < 5; i++) {
    g.beginPath();
    g.moveTo(0, 236 + i * 21);
    g.lineTo(640, 236 + i * 21);
    g.stroke();
  }
  const rng = new Rng(9911);
  g.strokeStyle = 'rgba(43,26,14,0.3)';
  for (let i = 0; i < 22; i++) {
    const x = rng.int(640);
    const y = 240 + rng.int(96);
    g.beginPath();
    g.moveTo(x, y);
    g.quadraticCurveTo(x + 14, y + 1, x + 30, y);
    g.stroke();
  }
  rect(g, 0, 234, 640, 5, '#a97c50');
  // Zuberi's vat, back left, with its ladle and a charcoal glow beneath.
  glowSpot(g, 92, 240, 46, '#e07830', 0.4);
  rr(g, 38, 166, 108, 76, 12, '#8f867a');
  rect(g, 38, 182, 12, 50, '#7c746a');
  rect(g, 134, 182, 12, 50, '#a29a8c');
  oval(g, 92, 166, 55, 14, '#b8b0a4');
  oval(g, 92, 166, 46, 10, '#5c5248');
  oval(g, 92, 166, 43, 9, '#d9a83c');
  g.strokeStyle = '#5c4a30';
  g.lineWidth = 4;
  g.beginPath();
  g.moveTo(126, 132); g.lineTo(106, 164);
  g.stroke();
  oval(g, 104, 166, 8, 4, '#8a7a5c');
  // A crate of limes and a stack of clean bowls.
  rr(g, 532, 196, 74, 40, 4, '#7d5836');
  g.strokeStyle = 'rgba(43,26,14,0.5)';
  g.lineWidth = 2;
  g.beginPath();
  g.moveTo(532, 210); g.lineTo(606, 210); g.moveTo(532, 224); g.lineTo(606, 224);
  g.stroke();
  const lr = new Rng(88);
  for (let i = 0; i < 8; i++) dot(g, 542 + lr.int(56), 198 + lr.int(10), 5, i % 2 ? '#7fae4a' : '#6a9440');
  urojoBgCv = cv;
  return cv;
}

let brothCv: Cv | null = null;
function brothDisc(): Cv {
  if (brothCv) return brothCv;
  const { cv, g } = surface(176, 60);
  g.save();
  g.translate(88, 30);
  g.scale(1, 60 / 176);
  const grad = g.createRadialGradient(0, -6, 6, 0, 0, 88);
  grad.addColorStop(0, '#eec254');
  grad.addColorStop(0.62, '#d9a232');
  grad.addColorStop(1, '#9a6a1c');
  g.fillStyle = grad;
  g.beginPath();
  g.arc(0, 0, 88, 0, Math.PI * 2);
  g.fill();
  g.restore();
  brothCv = cv;
  return cv;
}

let warmGlowCv: Cv | null = null;
function warmGlow(): Cv {
  if (!warmGlowCv) warmGlowCv = bakeGlow('#ffcf8a');
  return warmGlowCv;
}

let goldGlowCv: Cv | null = null;
function goldGlow(): Cv {
  if (!goldGlowCv) goldGlowCv = bakeGlow('#f7d98a');
  return goldGlowCv;
}

export class UrojoPanel {
  private phase: UrojoPhase = 'build';
  private round = 0;
  private cur = 0;
  private counts: number[] = [];
  private splashT = 0;
  private hint = '';
  private onDone: (() => void) | null = null;

  // The painted layer: everything from here down is bowls, steam, and light.
  private scene = new Scene();
  private setHint: (h: string) => void = () => {};
  private floats: Float[] = [];
  private rings: Ring[] = [];
  private bowlOff = 0;
  private steamT = 0;
  private bubbleT = 0;
  private mangoT = -9;
  private limeT = -9;
  private limeDropped = false;
  private nudgeT = -9;

  constructor(
    private root: HTMLElement,
    private audio: AudioBus,
  ) {}

  get isOpen(): boolean {
    return !this.root.hidden;
  }

  open(onDone: () => void) {
    this.onDone = onDone;
    this.phase = 'build';
    this.round = 0;
    this.startRound();
    this.hint = `Zuberi hands you the ladle. ${UROJO_ROUNDS[0]?.call ?? ''} Arrows choose, Space adds; choose SERVE when the bowl is a bowl.`;
    this.root.hidden = false;
    this.root.style.lineHeight = '1.45'; // the #frame ancestor zeroes line-height; hints need it back
    const m = mountScene(this.root, 'Behind the Urojo Pot', this.scene);
    this.setHint = m.setHint;
    this.scene.restart();
    this.bowlOff = 0;
    this.steamT = 0;
    this.bubbleT = 0.4;
    this.mangoT = this.limeT = this.nudgeT = -9;
    this.limeDropped = false;
    this.scene.frame(0, (g) => this.paint(g));
    this.setHint(this.hint);
  }

  private startRound() {
    this.cur = 0;
    this.counts = UROJO_ITEMS.map(() => 0);
    this.floats = [];
    this.rings = [];
  }

  private total(): number {
    return this.counts.reduce((a, b) => a + b, 0);
  }

  tick(dt: number) {
    if (!this.isOpen) return;
    if (this.splashT > 0) this.splashT = Math.max(0, this.splashT - dt);
    this.bowlOff += ((this.phase === 'build' ? 0 : 8) - this.bowlOff) * Math.min(1, dt * 6);
    this.steamT -= dt;
    if (this.steamT <= 0) {
      this.scene.waft(BOWL_X + (Math.random() - 0.5) * 90, BOWL_Y - 6, 'rgba(255,252,244,0.32)', 8);
      this.scene.waft(92, 146, 'rgba(255,252,244,0.3)', 9);
      this.steamT = 0.42;
    }
    this.bubbleT -= dt;
    if (this.bubbleT <= 0 && this.phase !== 'done') {
      const a = Math.random() * Math.PI * 2;
      const r = Math.random() * 0.8;
      this.scene.burst(BOWL_X + Math.cos(a) * 70 * r, BOWL_Y + Math.sin(a) * 24 * r, {
        n: 1, color: '#f0d488', speed: 5, grav: -22, size: 1.8, life: 0.5,
      });
      this.bubbleT = 0.5 + Math.random() * 0.5;
    }
    this.scene.frame(dt, (g) => this.paint(g));
    this.setHint(this.hint);
  }

  onDir(dir: Dir) {
    if (this.phase !== 'build') return;
    const n = UROJO_ITEMS.length + 1; // the ring, plus SERVE
    if (dir === 'left' || dir === 'up') this.cur = (this.cur + n - 1) % n;
    if (dir === 'right' || dir === 'down') this.cur = (this.cur + 1) % n;
  }

  /** Zuberi's read of the finished bowl. Every verdict is a passing grade. */
  private verdict(): string {
    const [mango = 0, , bhajia = 0, , crunch = 0, coco = 0, chili = 0] = this.counts;
    const everything = this.counts.every((c) => c > 0);
    const want = UROJO_ROUNDS[this.round]?.want;
    if (everything) {
      return 'Zuberi tastes the broth. "Ah, the tourist ratio. One of everything, all politely introduced. Also valid. Nobody leaves this cart wrong."';
    }
    if (want === 'brave') {
      if (chili + mango >= 3) return 'Hamisi drinks, coughs once, and salutes the pot. Zuberi nods: "Sour AND brave. That bowl argues back. He needed that."';
      if (coco >= 2) return 'Zuberi grins. "He asked for brave and you gave him a lullaby. Look at him. He is not complaining. Diplomacy is also a spice."';
      return 'Zuberi tilts the bowl, reading it. "Mild, sturdy, honest. Not the bowl he ordered; possibly the bowl he meant. Sawa. It serves."';
    }
    if (chili >= 2) return 'Bi Mwana takes one spoonful and fans herself with an essay. Zuberi beams: "Gentle was requested. Character was delivered. Also valid."';
    if (crunch + bhajia >= 3) return 'The teacher listens to her own bowl crunch and nods like a satisfied examiner. Zuberi: "Extra crunch, honored in full. Top marks."';
    return 'Zuberi shrugs happily. "A quiet bowl for a loud evening of essays. Not what she said; perhaps what she needed. The corner forgives."';
  }

  onAction() {
    if (this.phase === 'build') {
      if (this.cur === UROJO_ITEMS.length) {
        if (this.total() < 3) {
          this.audio.blip();
          this.nudgeT = this.scene.time;
          this.hint = 'Zuberi covers the bowl with one hand. "That is not urojo yet, that is a puddle with promise. Two or three more things, mgeni."';
          return;
        }
        this.audio.chime();
        this.hint = `${this.verdict()} Space for the next bowl.`;
        this.phase = 'served';
        this.limeT = this.scene.time;
        this.limeDropped = false;
        return;
      }
      const item = UROJO_ITEMS[this.cur];
      if (!item) return;
      this.counts[this.cur] = (this.counts[this.cur] ?? 0) + 1;
      this.dropFloat(this.cur);
      this.splashT = 0.6;
      this.audio.slosh();
      this.hint = item.splash;
      if (this.total() >= 10) {
        this.audio.chime();
        this.hint = `The bowl declines further cargo. ${this.verdict()} Space for the next bowl.`;
        this.phase = 'served';
        this.limeT = this.scene.time;
        this.limeDropped = false;
      }
    } else if (this.phase === 'served') {
      this.round++;
      const next = UROJO_ROUNDS[this.round];
      if (next) {
        this.startRound();
        this.phase = 'build';
        this.hint = `A clean bowl lands in your hands. ${next.call}`;
      } else {
        this.phase = 'done';
        this.audio.weaveDone();
        this.scene.flash('#ffe9b8', 0.3);
        this.scene.burst(BOWL_X, BOWL_Y - 30, { n: calm() ? 6 : 14, color: '#f2d98a', speed: 90, grav: 140, size: 3, life: 0.8 });
        this.hint = 'The line is fed. Zuberi reclaims the ladle with the tenderness of a man taking back a sleeping child. Press Space to come out.';
      }
    } else {
      this.root.hidden = true;
      const done = this.onDone;
      this.onDone = null;
      done?.();
    }
  }

  // ------------------------------------------------------------ painted cart

  /** Launches a topping from its saucer into the broth on a little arc. */
  private dropFloat(kind: number) {
    const i = this.floats.length;
    let fx = BOWL_X + (((i * 53) % 120) - 60) * 0.95;
    let fy = BOWL_Y + (((i * 37) % 36) - 18) * 0.85;
    const nx = (fx - BOWL_X) / 76;
    const ny = (fy - BOWL_Y) / 24;
    const d = Math.hypot(nx, ny);
    if (d > 1) {
      fx = BOWL_X + (fx - BOWL_X) / d;
      fy = BOWL_Y + (fy - BOWL_Y) / d;
    }
    this.floats.push({
      kind,
      sx: slotX(kind),
      sy: SLOT_Y - 12,
      fx,
      fy,
      born: this.scene.time,
      landed: false,
      spin: (Math.random() - 0.5) * 2.4,
      phase: Math.random() * 6.28,
    });
  }

  private paint(g: CanvasRenderingContext2D) {
    const t = this.scene.time;
    g.drawImage(urojoBackdrop(), 0, 0);

    // The lamp string breathes a little.
    for (let i = 0; i < 8; i++) {
      const x = 40 + i * 80;
      const u = x / 640;
      const y = (1 - u) * (1 - u) * 118 + 2 * (1 - u) * u * 152 + u * u * 108;
      blit(g, warmGlow(), x - 14, y - 10, 28, 28, 0.22 + wobble(t, 5, i * 1.7) * 0.06);
    }

    this.paintZuberi(g, t);
    this.paintBowl(g, t);
    this.paintRings(g, t);
    this.paintLime(g, t);
    this.paintSlots(g, t);
    this.paintTag(g);
  }

  private paintZuberi(g: CanvasRenderingContext2D, t: number) {
    // Zuberi keeps the vat company, stirring in no hurry at all.
    const x = 182;
    const y = 156;
    const sway = wobble(t, 1.4) * 1.2;
    rr(g, x - 15 + sway * 0.4, y, 30, 80, 9, '#c98a2e');
    rect(g, x - 15 + sway * 0.4, y + 26, 30, 6, '#f2e6d0');
    rr(g, x - 12 + sway * 0.4, y + 44, 24, 36, 4, '#e8dcc4');
    dot(g, x + sway, y - 10, 9.5, '#6b4a32');
    oval(g, x + sway, y - 18, 9, 4.5, '#e8dcc4');
    dot(g, x - 3 + sway, y - 10, 1.1, '#1c1410');
    dot(g, x + 3.5 + sway, y - 10, 1.1, '#1c1410');
    const stir = this.phase === 'done' ? 0.2 : Math.sin(t * 1.4) * 0.5;
    g.strokeStyle = '#c98a2e';
    g.lineWidth = 6;
    g.lineCap = 'round';
    g.beginPath();
    g.moveTo(x - 13, y + 12);
    g.quadraticCurveTo(x - 34, y + 10, x - 48 + stir * 12, y - 4 + Math.abs(stir) * 5);
    g.stroke();
    dot(g, x - 48 + stir * 12, y - 4 + Math.abs(stir) * 5, 3.4, '#6b4a32');
  }

  private paintBowl(g: CanvasRenderingContext2D, t: number) {
    const bx = BOWL_X;
    const by = BOWL_Y + this.bowlOff + (this.nudgeT > 0 && t - this.nudgeT < 0.4 ? 0 : 0);
    let nx = 0;
    if (this.nudgeT > 0 && t - this.nudgeT < 0.45) {
      const q = (t - this.nudgeT) / 0.45;
      nx = Math.sin(q * Math.PI * 4) * 4 * (1 - q);
    }
    blit(g, shadowSprite(), bx - 118 + nx, by + 16, 236, 62, 0.55);
    oval(g, bx + nx, by + 8, 100, 42, '#ddceac');
    g.strokeStyle = '#c1512f';
    g.lineWidth = 7;
    g.globalAlpha = 0.75;
    g.beginPath();
    g.ellipse(bx + nx, by + 10, 88, 34, 0, 0.45, Math.PI - 0.45);
    g.stroke();
    g.globalAlpha = 1;
    oval(g, bx + nx, by, 108, 40, '#e8dcc4');
    oval(g, bx + nx, by, 97, 34, '#cbb98f');

    // The broth: gold, simmering, never quite still.
    const sx = 1 + wobble(t, 1.6) * 0.012;
    const sy = 1 + wobble(t, 2.3, 1) * 0.025;
    g.drawImage(brothDisc(), bx + nx - 88 * sx, by + 2 - 30 * sy, 176 * sx, 60 * sy);
    g.globalAlpha = 0.1;
    oval(g, bx + nx - 24 + wobble(t, 0.9) * 7, by - 2, 34, 8, '#fff4d8');
    oval(g, bx + nx + 30 + wobble(t, 1.3, 2) * 5, by + 9, 21, 5.5, '#fff4d8');
    g.globalAlpha = 1;
    g.globalAlpha = 0.3;
    for (let i = 0; i < 5; i++) {
      const a = t * 0.3 + i * 1.26;
      dot(g, bx + nx + Math.cos(a) * (30 + i * 8), by + 2 + Math.sin(a) * (10 + i * 2.4), 2, '#b5741e');
    }
    g.globalAlpha = 1;
    if (t - this.mangoT < 0.6) {
      blit(g, goldGlow(), bx - 70, by - 26, 140, 52, 0.4 * (1 - (t - this.mangoT) / 0.6));
    }

    // Cargo, drawn back-to-front so the bowl stacks honestly.
    const order = this.floats.map((_, i) => i).sort((a, b) => (this.floats[a]?.fy ?? 0) - (this.floats[b]?.fy ?? 0));
    for (const i of order) {
      const f = this.floats[i];
      if (f) this.paintFloat(g, f, t, nx);
    }
    if (this.phase !== 'build' && this.limeT > 0 && t - this.limeT > 1.2) {
      // The squeezed wedge retires to the rim, garnish emeritus.
      oval(g, bx + 84, by - 8, 10, 5, '#d9e8a0', -0.4);
      g.strokeStyle = '#4d7440';
      g.lineWidth = 2.5;
      g.beginPath();
      g.ellipse(bx + 84, by - 10, 10, 5, -0.4, Math.PI * 1.05, Math.PI * 1.95);
      g.stroke();
    }
  }

  private paintFloat(g: CanvasRenderingContext2D, f: Float, t: number, nx: number) {
    const fl = 0.5;
    const age = t - f.born;
    let x = f.fx + nx;
    let y = f.fy;
    let rot = f.spin;
    if (age < fl) {
      const p = age / fl;
      x = lerp(f.sx, f.fx, p);
      y = lerp(f.sy, f.fy, p) - Math.sin(Math.PI * p) * 88;
      rot = p * f.spin * 4;
    } else {
      if (!f.landed) {
        f.landed = true;
        this.rings.push({ x: f.fx, y: f.fy, t0: t });
        const heavy = !calm();
        if ((f.kind === 1 || f.kind === 2) && heavy) this.scene.thump(2.5, 0.02);
        const n = f.kind === 3 ? 3 : heavy ? 9 : 4;
        this.scene.burst(f.fx, f.fy - 2, { n, color: '#e3b74a', speed: f.kind === 2 ? 130 : 80, grav: 320, size: 2.6, life: 0.5 });
        if (f.kind === 0) this.mangoT = t;
      }
      y += wobble(t * 1.5, 1, f.phase) * 1.8;
      rot = f.spin * 0.3 + wobble(t, 0.7, f.phase) * 0.1;
      if (f.kind === 1) {
        // The potato takes a full breath underwater before it agrees to float.
        const q = age - fl;
        y += q < 0.12 ? (q / 0.12) * 12 : 12 * (1 - easeOutElastic(Math.min(1, (q - 0.12) / 0.8)));
      }
    }
    const k = f.kind;
    if (k === 5 || k === 6) {
      this.paintSwirl(g, f, t, x, y, k === 5 ? '#e6e2d0' : '#c1512f', age, fl);
      return;
    }
    if (k === 0) {
      oval(g, x, y, 9, 4.5, '#d9a83c', rot);
      oval(g, x - Math.cos(rot) * 2, y - 3, 7.5, 1.8, '#8a9a44', rot);
    } else if (k === 1) {
      oval(g, x, y, 9, 6.5, '#e8d6a8', rot);
      oval(g, x, y + 2.4, 7, 3, '#c9b280', rot);
    } else if (k === 2) {
      dot(g, x - 3, y, 6, '#b06a2e');
      dot(g, x + 4, y - 2, 5, '#a05f28');
      dot(g, x - 4, y - 2.5, 1.1, '#5c3316');
      dot(g, x + 3, y + 1.5, 1.1, '#5c3316');
      dot(g, x + 6, y - 4, 1.1, '#5c3316');
    } else if (k === 3) {
      oval(g, x, y, 8.5, 6, '#f2ead8', rot * 0.3);
      dot(g, x, y - 0.8, 3.6, '#e0b33e');
    } else if (k === 4) {
      oval(g, x - 6, y - 2, 6.5, 2.6, '#d8c48a', rot + 0.5);
      oval(g, x + 5, y - 3.5, 6.5, 2.6, '#cdb578', rot - 0.4);
      oval(g, x, y + 2.5, 6.5, 2.6, '#d8c48a', rot + 1.2);
    }
  }

  /** Chutney does not land; it arrives, spiraling out into a tinted ribbon. */
  private paintSwirl(g: CanvasRenderingContext2D, f: Float, t: number, x: number, y: number, color: string, age: number, fl: number) {
    if (age < fl) {
      dot(g, x, y, 5.5, color);
      return;
    }
    const k = easeOutCubic(Math.min(1, (age - fl) / 1.2));
    g.globalAlpha = 0.16 * k;
    oval(g, x, y, 26 * k, 10 * k, color);
    g.globalAlpha = 0.45;
    g.strokeStyle = color;
    g.lineWidth = 4.5;
    g.lineCap = 'round';
    g.beginPath();
    const steps = Math.max(2, Math.floor(30 * k));
    const base = t * 0.35 + f.phase;
    for (let i = 0; i <= steps; i++) {
      const th = base + (i / 30) * 2.2 * 2 * Math.PI;
      const r = 3 + (i / 30) * 24;
      const px = x + Math.cos(th) * r;
      const py = y + Math.sin(th) * r * 0.4;
      if (i === 0) g.moveTo(px, py);
      else g.lineTo(px, py);
    }
    g.stroke();
    g.globalAlpha = 1;
  }

  private paintRings(g: CanvasRenderingContext2D, t: number) {
    for (let i = this.rings.length - 1; i >= 0; i--) {
      const r = this.rings[i];
      if (!r) continue;
      const q = (t - r.t0) / 0.55;
      if (q >= 1) {
        this.rings.splice(i, 1);
        continue;
      }
      g.globalAlpha = 0.45 * (1 - q);
      g.strokeStyle = '#f4e2a8';
      g.lineWidth = 2;
      g.beginPath();
      g.ellipse(r.x, r.y, 6 + q * 26, (6 + q * 26) * 0.38, 0, 0, Math.PI * 2);
      g.stroke();
      g.globalAlpha = 1;
    }
  }

  private paintLime(g: CanvasRenderingContext2D, t: number) {
    if (this.limeT < 0) return;
    const la = t - this.limeT;
    if (la >= 1.4) return;
    const p = easeOutCubic(Math.min(1, la / 0.5));
    const x = lerp(490, BOWL_X, p);
    const y = lerp(96, 158, p);
    let sy = 1;
    if (la > 0.55 && la < 0.95) sy = 1 - 0.42 * Math.sin((Math.PI * (la - 0.55)) / 0.4);
    if (la > 0.6 && !this.limeDropped) {
      this.limeDropped = true;
      this.scene.burst(BOWL_X, 172, { n: calm() ? 5 : 13, color: '#e9f2c0', speed: 55, grav: 460, size: 2, life: 0.5 });
      this.scene.flash('#fff3c4', 0.2);
      this.rings.push({ x: BOWL_X, y: BOWL_Y, t0: t + 0.12 });
    }
    g.globalAlpha = la > 1.1 ? 1 - (la - 1.1) / 0.3 : 1;
    squashed(g, x, y, 1, sy, (gg) => {
      oval(gg, x + 2, y - 10, 10, 7.5, '#6b4a32');
      oval(gg, x, y + 3, 12, 7, '#d9e8a0');
      gg.strokeStyle = '#4d7440';
      gg.lineWidth = 3;
      gg.beginPath();
      gg.ellipse(x, y + 1, 12, 7, 0, Math.PI * 1.02, Math.PI * 1.98);
      gg.stroke();
      gg.strokeStyle = 'rgba(120,140,60,0.6)';
      gg.lineWidth = 1;
      for (const a of [-0.5, 0, 0.5]) {
        gg.beginPath();
        gg.moveTo(x, y - 1);
        gg.lineTo(x + Math.sin(a) * 9, y + 8);
        gg.stroke();
      }
    });
    g.globalAlpha = 1;
  }

  private paintSlots(g: CanvasRenderingContext2D, t: number) {
    g.textAlign = 'center';
    for (let i = 0; i <= UROJO_ITEMS.length; i++) {
      const x = slotX(i);
      const sel = this.phase === 'build' && this.cur === i;
      const bob = sel ? wobble(t, 3.2) * 2.2 - 2 : 0;
      const y = SLOT_Y + bob;
      if (sel) blit(g, warmGlow(), x - 36, y - 24, 72, 48, 0.7);
      if (i === UROJO_ITEMS.length) {
        blit(g, shadowSprite(), x - 30, y + 6, 60, 18, 0.4);
        rr(g, x - 28, y - 14, 56, 26, 5, sel ? '#f7edd6' : '#e0d0ac');
        g.strokeStyle = sel ? '#c1512f' : 'rgba(43,33,24,0.55)';
        g.lineWidth = 2;
        g.beginPath();
        g.roundRect(x - 28, y - 14, 56, 26, 5);
        g.stroke();
        g.fillStyle = '#2b2118';
        g.font = '700 11px Literata, Georgia, serif';
        g.fillText('SERVE', x, y + 3);
        continue;
      }
      blit(g, shadowSprite(), x - 28, y + 4, 56, 20, 0.4);
      oval(g, x, y + 6, 27, 8.5, '#a97c50');
      oval(g, x, y + 5, 23, 6.5, '#c99a66');
      this.paintIcon(g, i, x, y - 4);
      if (sel) {
        g.strokeStyle = '#c1512f';
        g.lineWidth = 2;
        g.beginPath();
        g.ellipse(x, y + 2, 31, 15, 0, 0, Math.PI * 2);
        g.stroke();
      }
      const n = this.counts[i] ?? 0;
      if (n > 0) {
        dot(g, x + 24, y - 13, 7.5, '#c1512f');
        g.fillStyle = '#f7edd6';
        g.font = '700 10px Literata, Georgia, serif';
        g.fillText(String(n), x + 24, y - 9.5);
      }
      const short = ['Mango sour', 'Potato', 'Bhajia', 'Boiled egg', 'Cassava', 'Coconut', 'Chili'][i] ?? '';
      g.fillStyle = sel ? '#f7edd6' : 'rgba(242,230,208,0.72)';
      g.font = `${sel ? 600 : 500} 9px Literata, Georgia, serif`;
      g.fillText(short, x, 330);
    }
  }

  private paintIcon(g: CanvasRenderingContext2D, i: number, x: number, y: number) {
    if (i === 0) {
      oval(g, x - 4, y, 9, 4.5, '#d9a83c', -0.4);
      oval(g, x + 5, y - 2, 9, 4.5, '#d9a83c', 0.3);
      oval(g, x + 5, y - 5, 7.5, 1.6, '#8a9a44', 0.3);
    } else if (i === 1) {
      dot(g, x - 5, y + 1, 6, '#e8d6a8');
      dot(g, x + 5, y - 1, 6.5, '#e0cb98');
      dot(g, x + 1, y + 4, 5, '#e8d6a8');
    } else if (i === 2) {
      dot(g, x - 5, y, 5.5, '#b06a2e');
      dot(g, x + 4, y - 2, 5, '#a05f28');
      dot(g, x + 1, y + 4, 4.5, '#b06a2e');
      dot(g, x - 5, y - 2, 1, '#5c3316');
      dot(g, x + 4, y + 1, 1, '#5c3316');
    } else if (i === 3) {
      oval(g, x, y, 8.5, 6.5, '#f2ead8');
      dot(g, x, y - 0.8, 3.6, '#e0b33e');
    } else if (i === 4) {
      oval(g, x - 5, y - 1, 7, 2.6, '#d8c48a', 0.5);
      oval(g, x + 5, y - 2, 7, 2.6, '#cdb578', -0.4);
      oval(g, x, y + 3, 7, 2.6, '#d8c48a', 1.1);
    } else {
      const c = i === 5 ? '#e6e2d0' : '#c1512f';
      oval(g, x, y + 3, 9, 4.5, '#8a5c38');
      dot(g, x, y - 1, 5.5, c);
      dot(g, x - 2, y - 4, 2.5, c);
    }
  }

  private paintTag(g: CanvasRenderingContext2D) {
    const label = this.phase === 'done' ? 'the corner, fed' : `bowl ${Math.min(this.round + 1, UROJO_ROUNDS.length)} of ${UROJO_ROUNDS.length}`;
    g.save();
    g.translate(12, 12);
    g.rotate(-0.03);
    rr(g, 0, 0, 132, 24, 4, 'rgba(242,230,208,0.92)');
    g.strokeStyle = 'rgba(43,33,24,0.4)';
    g.lineWidth = 1.5;
    g.beginPath();
    g.roundRect(0, 0, 132, 24, 4);
    g.stroke();
    g.fillStyle = '#2b2118';
    g.font = '600 11px Literata, Georgia, serif';
    g.textAlign = 'left';
    g.fillText(label, 10, 16);
    g.restore();
  }
}
