import type { Dir } from '../../engine/input';
import type { AudioBus } from '../../engine/audio';
import { PAL } from '../../engine/config';
import { Rng, dot, oval, rr, rect, shade, surface, vgrad, glowSpot, softShadow } from '../../art/pix';
import type { Surface } from '../../art/pix';
import { Scene, mountScene, wobble, easeOutCubic, easeOutBack, easeInOutSine } from './scene';

/** Shared: honor the reduce-motion toggle by muting shakes and thinning particles. */
function calm(): boolean {
  return document.body.classList.contains('reduce-motion');
}

/** The panel chrome inherits line-height 0; give the hint real lines so long copy wraps. */
function fixHint(root: HTMLElement) {
  const el = root.querySelector('.w-hint') as HTMLElement | null;
  if (el) el.style.lineHeight = '1.35';
}

// ---------------------------------------------------------------- kingyo-sukui

/**
 * Kingyo-sukui: goldfish scooping at the Tanabata stalls.
 *
 * A paper poi, a tub of goldfish, and physics that forgive. Each dip soaks
 * the paper whether you catch or not; when the poi finally gives way the
 * game ends warmly. There is no fail state: scoop nothing at all and the
 * stall uncle scoops one himself and hands you the bag anyway.
 */

type Fish = { x: number; v: number; deep: boolean; ph: number; ly: number; hv: number; dd: number };

type Ripple = { x: number; y: number; r: number; a: number };

const TUB = { x: 22, y: 20, w: 468, h: 300 };
const WATER = { x: 38, y: 36, w: 436, h: 268 };
const BOWL = { x: 572, y: 244, r: 36 };

export class KingyoPanel {
  private fish: Fish[] = [];
  private cx = 0.5; // the poi's position over the tub, 0..1
  private soak = 0; // 0..100; at 100 the paper gives way
  private caught = 0;
  private phase: 'scoop' | 'done' = 'scoop';
  private hint = '';
  private onDone: (() => void) | null = null;

  // Render-only state. None of it feeds back into the game.
  private scene = new Scene();
  private setHint: (h: string) => void = () => {};
  private bg: Surface | null = null;
  private glow: Surface | null = null;
  private paper: Surface | null = null;
  private tearStep = -1;
  private poiX = 0.5; // eased display position
  private dipT = 0;
  private ripples: Ripple[] = [];
  private flight: { x: number; y: number; t: number } | null = null;
  private bowlFish = 0;
  private bagT = 0;
  private shreds: { x: number; y: number; ph: number }[] = [];

  constructor(
    private root: HTMLElement,
    private audio: AudioBus,
  ) {}

  get isOpen(): boolean {
    return !this.root.hidden;
  }

  open(onDone: () => void) {
    this.onDone = onDone;
    this.phase = 'scoop';
    this.cx = 0.5;
    this.soak = 0;
    this.caught = 0;
    this.fish = [];
    for (let i = 0; i < 4; i++) {
      this.fish.push({
        x: (i + 0.5) / 4,
        v: (Math.random() - 0.5) * 0.5,
        deep: Math.random() < 0.4,
        ph: Math.random() * Math.PI * 2,
        ly: 80 + Math.random() * 160,
        hv: 0.2,
        dd: 0,
      });
    }
    this.hint = 'The poi is paper. Arrows to drift it, Space to scoop. Gently.';
    this.poiX = 0.5;
    this.dipT = 0;
    this.ripples = [];
    this.flight = null;
    this.bowlFish = 0;
    this.bagT = 0;
    this.shreds = [];
    this.tearStep = -1;
    const m = mountScene(this.root, 'Kingyo-sukui', this.scene);
    fixHint(this.root);
    this.setHint = m.setHint;
    this.scene.restart();
    this.root.hidden = false;
    this.setHint(this.hint);
  }

  tick(dt: number) {
    if (!this.isOpen) return;
    if (this.phase === 'scoop') {
      for (const f of this.fish) {
        f.x += f.v * dt * 0.35;
        if (f.x < 0.04 || f.x > 0.96) f.v = -f.v;
        if (Math.random() < dt * 0.4) f.v = (Math.random() - 0.5) * 0.6;
        if (Math.random() < dt * 0.25) f.deep = !f.deep;
      }
      // Paper soaks just by hovering near the water. It was always going to.
      this.soak = Math.min(100, this.soak + dt * 3);
      if (this.soak >= 100) this.finish();
    }
    this.scene.frame(dt, (g) => this.paint(g, dt));
    this.setHint(this.hint);
  }

  onDir(dir: Dir) {
    if (this.phase !== 'scoop') return;
    if (dir === 'left') this.cx = Math.max(0.04, this.cx - 0.07);
    if (dir === 'right') this.cx = Math.min(0.96, this.cx + 0.07);
  }

  onAction() {
    if (this.phase === 'done') {
      this.root.hidden = true;
      const done = this.onDone;
      this.onDone = null;
      done?.();
      return;
    }
    // The dip. Shallow fish near the poi come up; deep ones just watch.
    const px = this.fishX(this.poiX);
    const py = 168;
    this.dipT = 0.34;
    this.ripples.push({ x: px, y: py, r: 8, a: 0.6 });
    this.scene.burst(px, py, { n: calm() ? 4 : 9, color: '#cfe8ef', size: 2.6, speed: 70, grav: 190, life: 0.5 });
    const idx = this.fish.findIndex((f) => !f.deep && Math.abs(f.x - this.cx) < 0.09);
    if (idx >= 0) {
      const hit = this.fish[idx] as Fish;
      this.flight = { x: this.fishX(hit.x), y: this.fishY(hit), t: 0 };
      this.scene.tween(0, 1, 0.6, easeOutCubic, (v) => {
        if (this.flight) this.flight.t = v;
      }, () => {
        this.flight = null;
        this.bowlFish = Math.min(this.caught, 3);
        this.ripples.push({ x: BOWL.x, y: BOWL.y, r: 5, a: 0.5 });
        this.scene.burst(BOWL.x, BOWL.y - 8, { n: calm() ? 3 : 7, color: '#bfe0ea', size: 2.2, speed: 60, grav: 200, life: 0.45 });
      });
      this.fish.splice(idx, 1);
      this.caught++;
      this.audio.slosh();
      this.audio.weaveNote(this.caught % 7);
      if (!calm()) this.scene.thump(4, 0.04);
      this.scene.flash('#ffe9c4', 0.16);
      this.scene.burst(px, py, { n: calm() ? 5 : 12, color: '#8fd0e0', size: 2.2, speed: 110, grav: 240, life: 0.55, kind: 'streak' });
      this.soak = Math.min(100, this.soak + 18);
      this.hint = ['One! Level wrist, says the uncle.', 'Two! The uncle raises an eyebrow.', 'Three! Now you are showing off.'][
        Math.min(this.caught - 1, 2)
      ] as string;
      if (this.caught >= 3 || this.fish.length === 0) this.finish();
    } else {
      this.audio.slosh();
      this.soak = Math.min(100, this.soak + 26);
      this.ripples.push({ x: px, y: py, r: 14, a: 0.45 });
      this.hint = this.fish.some((f) => f.deep && Math.abs(f.x - this.cx) < 0.09)
        ? 'That one dove. The poi drinks the tub instead.'
        : 'Water, beautifully scooped. The paper darkens.';
    }
  }

  private finish() {
    this.phase = 'done';
    this.audio.weaveDone();
    this.scene.flash('#ffd9a0', 0.32);
    if (!calm()) this.scene.thump(3, 0.03);
    this.scene.burst(256, 168, { n: calm() ? 6 : 14, color: '#f2e6d0', size: 2.8, speed: 90, grav: 60, life: 0.8 });
    this.bagT = 0;
    this.scene.tween(0, 1, 0.7, easeOutBack, (v) => {
      this.bagT = v;
    });
    const rng = new Rng(31);
    this.shreds = [];
    for (let i = 0; i < 4; i++) {
      this.shreds.push({ x: this.fishX(this.poiX) + rng.range(-30, 30), y: 168 + rng.range(-14, 14), ph: rng.next() * 6 });
    }
    this.hint =
      this.caught === 0
        ? 'The poi gives way. The uncle laughs, scoops one himself, and hands you the bag anyway. Space.'
        : this.caught === 1
          ? 'The paper sighs and lets go. One goldfish, bagged with ceremony. Space.'
          : `The paper sighs and lets go. ${this.caught} goldfish, bagged with ceremony. Space.`;
  }

  private fishX(u: number): number {
    return WATER.x + 12 + u * (WATER.w - 24);
  }

  private fishY(f: Fish): number {
    return WATER.y + 24 + ((f.ly - 60) / 200) * (WATER.h - 60) + wobble(this.scene.time, 0.7, f.ph) * 9 + f.dd * 10;
  }

  /** The matsuri night, the tub, the lantern row: baked once. */
  private bake(): Surface {
    if (this.bg) return this.bg;
    const s = surface(640, 340);
    const g = s.g;
    const rng = new Rng(417);
    // Night planking around the tub, lantern-warmed at the top.
    vgrad(g, 0, 0, 640, 340, '#2a2028', '#1c151b');
    for (let y = 0; y < 340; y += 28) {
      const c = shade('#5a4030', -0.55 + rng.next() * 0.1);
      rect(g, 0, y, 640, 26, c);
      rect(g, 0, y + 26, 640, 2, 'rgba(10,6,8,0.6)');
      for (let k = 0; k < 4; k++) {
        rect(g, rng.int(640), y + 4 + rng.int(18), rng.range(20, 70), 1, 'rgba(0,0,0,0.14)');
      }
    }
    glowSpot(g, 100, 4, 150, '#ff9d4d', 0.2);
    glowSpot(g, 400, 0, 130, '#ffb066', 0.15);
    glowSpot(g, 600, 40, 110, '#ff9d4d', 0.14);
    // A lantern string clipped by the frame's top edge, plus one over the bowl corner.
    rect(g, 0, 3, 640, 1, 'rgba(240,220,180,0.25)');
    for (const lx of [96, 300, 452, 600]) {
      const full = lx === 600;
      const ly = full ? 26 : 6;
      glowSpot(g, lx, ly, 44, '#ffcf8e', 0.4);
      oval(g, lx, ly, 13, 16, '#e8b96a');
      oval(g, lx, ly - 3, 11, 10, '#f2cd85');
      g.strokeStyle = 'rgba(120,70,30,0.5)';
      g.lineWidth = 1;
      for (let i = -1; i <= 1; i++) {
        g.beginPath();
        g.ellipse(lx, ly + i * 6, 12, 3, 0, 0, Math.PI * 2);
        g.stroke();
      }
      rr(g, lx - 5, ly + 13, 10, 4, 1, '#7a4a24');
      if (full) rect(g, lx, 3, 1, 12, 'rgba(240,220,180,0.3)');
    }
    // Tanzaku wishes drifting at the right margin.
    for (const [tx, ty, tc, ta] of [
      [530, 30, PAL.terracotta, 0.2], [548, 44, PAL.green, -0.14], [620, 52, PAL.gold, 0.1], [514, 58, PAL.sky, -0.24],
    ] as const) {
      g.save();
      g.translate(tx, ty);
      g.rotate(ta);
      rr(g, -5, 0, 10, 24, 1, tc);
      rect(g, -5, 0, 10, 3, 'rgba(255,255,255,0.35)');
      g.restore();
    }
    // The tub: worn cedar rim, a rope band, dark water.
    softShadow(g, TUB.x + TUB.w / 2, TUB.y + TUB.h - 8, TUB.w / 2 + 14, 26, 0.4);
    rr(g, TUB.x, TUB.y, TUB.w, TUB.h, 42, '#6b4a2e');
    rr(g, TUB.x + 3, TUB.y + 3, TUB.w - 6, TUB.h - 6, 38, '#82593a');
    // Rim plank seams, top and bottom edges.
    g.strokeStyle = 'rgba(40,24,14,0.4)';
    g.lineWidth = 2;
    for (let x = TUB.x + 40; x < TUB.x + TUB.w - 30; x += 44) {
      g.beginPath();
      g.moveTo(x, TUB.y + 2);
      g.lineTo(x + 4, TUB.y + 15);
      g.moveTo(x, TUB.y + TUB.h - 2);
      g.lineTo(x - 4, TUB.y + TUB.h - 15);
      g.stroke();
    }
    g.strokeStyle = 'rgba(30,18,10,0.55)';
    g.lineWidth = 3;
    g.beginPath();
    g.roundRect(TUB.x + 8, TUB.y + 8, TUB.w - 16, TUB.h - 16, 33);
    g.stroke();
    g.strokeStyle = 'rgba(255,230,180,0.14)';
    g.lineWidth = 2;
    g.beginPath();
    g.roundRect(TUB.x + 2, TUB.y + 2, TUB.w - 4, 30, 36);
    g.stroke();
    // Water: teal deepening toward the walls, pebbly floor.
    g.save();
    g.beginPath();
    g.roundRect(WATER.x, WATER.y, WATER.w, WATER.h, 28);
    g.clip();
    vgrad(g, WATER.x, WATER.y, WATER.w, WATER.h, '#3e7d92', '#28556a');
    for (let i = 0; i < 26; i++) {
      dot(g, WATER.x + rng.int(WATER.w), WATER.y + rng.int(WATER.h), rng.range(2, 5), 'rgba(240,246,240,0.045)');
    }
    g.strokeStyle = 'rgba(8,24,32,0.5)';
    g.lineWidth = 14;
    g.beginPath();
    g.roundRect(WATER.x - 4, WATER.y - 4, WATER.w + 8, WATER.h + 8, 30);
    g.stroke();
    g.restore();
    // The corner still life: spare poi stack, soak tag, the waiting bowl.
    softShadow(g, 572, 96, 30, 12, 0.3);
    for (const [dx, dy, ra] of [[560, 92, 0.3], [582, 78, -0.2]] as const) {
      g.save();
      g.translate(dx, dy);
      g.rotate(ra);
      dot(g, 0, 0, 19, '#c1512f');
      dot(g, 0, 0, 15, '#efe4cc');
      rr(g, -3, 16, 6, 22, 3, '#c1512f');
      g.restore();
    }
    rr(g, 552, 148, 18, 58, 4, '#efe4cc');
    rr(g, 554, 150, 14, 54, 3, 'rgba(60,40,26,0.25)');
    softShadow(g, BOWL.x, BOWL.y + BOWL.r - 4, BOWL.r + 8, 12, 0.32);
    this.bg = s;
    return s;
  }

  /** A warm radial pool for lantern light on the water, baked once. */
  private glowSprite(): Surface {
    if (this.glow) return this.glow;
    const s = surface(128, 128);
    const grad = s.g.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, 'rgba(255,198,120,0.9)');
    grad.addColorStop(0.55, 'rgba(255,170,90,0.28)');
    grad.addColorStop(1, 'rgba(255,160,80,0)');
    s.g.fillStyle = grad;
    s.g.fillRect(0, 0, 128, 128);
    this.glow = s;
    return s;
  }

  /** The poi disc, re-baked only when the soak crosses a tear step. */
  private paperAt(step: number): Surface {
    if (this.paper && step === this.tearStep) return this.paper;
    this.tearStep = step;
    const s = this.paper && this.paper.cv.width === 64 ? this.paper : surface(64, 64);
    const g = s.g;
    g.clearRect(0, 0, 64, 64);
    const sog = Math.min(1, step / 11);
    g.globalAlpha = 0.94 - sog * 0.3;
    dot(g, 32, 32, 26, '#f2ead6');
    g.globalAlpha = 1;
    const rng = new Rng(77);
    // Fibers, then the soggy edge creeping inward, then true holes.
    g.strokeStyle = 'rgba(180,160,120,0.25)';
    g.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
      g.beginPath();
      g.arc(32, 32, 8 + i * 4, rng.next() * 6, rng.next() * 3 + 2);
      g.stroke();
    }
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2 + rng.next() * 0.4;
      const rad = 25 - rng.next() * 3 - sog * 6;
      dot(g, 32 + Math.cos(a) * rad, 32 + Math.sin(a) * rad, 3.5 + sog * 6, `rgba(150,128,92,${0.12 + sog * 0.4})`);
    }
    const holes = Math.floor(sog * 8);
    g.globalCompositeOperation = 'destination-out';
    for (let i = 0; i < holes; i++) {
      const a = rng.next() * Math.PI * 2;
      const rad = 12 + rng.next() * 12;
      dot(g, 32 + Math.cos(a) * rad, 32 + Math.sin(a) * rad, 2.5 + rng.next() * 3 + sog * 2, '#000');
    }
    g.globalCompositeOperation = 'source-over';
    // Ring the surviving paper so the disc still reads against dark water.
    g.strokeStyle = `rgba(120,96,64,${0.2 + sog * 0.3})`;
    g.lineWidth = 1.5;
    g.beginPath();
    g.arc(32, 32, 25.5, 0, Math.PI * 2);
    g.stroke();
    this.paper = s;
    return s;
  }

  private drawFish(g: CanvasRenderingContext2D, f: Fish, t: number) {
    const x = this.fishX(f.x);
    const y = this.fishY(f);
    const scale = 1.22 * (1 - f.dd * 0.28);
    const vy = Math.cos(t * 0.7 + f.ph) * 0.14;
    const ang = Math.atan2(vy, f.hv === 0 ? 0.01 : f.hv);
    softShadow(g, x + 4, y + 16 - f.dd * 8, 13 * scale, 5 * scale, 0.16 * (1 - f.dd * 0.5));
    g.save();
    g.translate(x, y);
    g.rotate(ang);
    g.scale(scale, scale);
    const spd = Math.abs(f.v);
    const tail = Math.sin(t * (5 + spd * 16) + f.ph) * 0.55;
    // The veil tail, two soft lobes beating.
    g.fillStyle = 'rgba(232,110,52,0.72)';
    g.beginPath();
    g.moveTo(-10, 0);
    g.quadraticCurveTo(-18, -3 + tail * 6, -25, -8 + tail * 7);
    g.quadraticCurveTo(-17, 0 + tail * 3, -10, 1);
    g.fill();
    g.fillStyle = 'rgba(206,88,44,0.62)';
    g.beginPath();
    g.moveTo(-10, 0);
    g.quadraticCurveTo(-18, 4 + tail * 5, -24, 9 + tail * 6);
    g.quadraticCurveTo(-16, 1 + tail * 3, -10, -1);
    g.fill();
    // The body, painted: warm orange, cap of red, pale belly, one dark eye.
    oval(g, 0, 0, 12, 5.6, '#e8862f');
    oval(g, 5, 0, 6.5, 4.6, '#ef9a44');
    oval(g, -1, -1.8, 7, 2.8, '#c1512f');
    oval(g, 2, 2, 7, 2.4, 'rgba(246,206,150,0.8)');
    const flap = Math.sin(t * 6 + f.ph) * 0.35;
    oval(g, 3, -5.5, 4, 1.7, 'rgba(240,150,70,0.7)', -0.5 + flap);
    oval(g, 3, 5.5, 4, 1.7, 'rgba(240,150,70,0.7)', 0.5 - flap);
    dot(g, 9.5, -1.8, 1.3, PAL.ink);
    if (f.dd > 0.03) oval(g, 0, 0, 15, 9, `rgba(22,54,66,${f.dd * 0.5})`);
    g.restore();
  }

  private paint(g: CanvasRenderingContext2D, dt: number) {
    const t = this.scene.time;
    g.drawImage(this.bake().cv, 0, 0);
    // Water life, clipped to the tub.
    g.save();
    g.beginPath();
    g.roundRect(WATER.x, WATER.y, WATER.w, WATER.h, 28);
    g.clip();
    const glow = this.glowSprite().cv;
    g.globalAlpha = 0.42 + wobble(t, 1.7) * 0.09;
    g.drawImage(glow, 120 + wobble(t, 0.9) * 9, 44 + wobble(t, 1.3, 2) * 6, 190, 92);
    g.globalAlpha = 0.3 + wobble(t, 1.2, 4) * 0.08;
    g.drawImage(glow, 330 + wobble(t, 0.7, 1) * 11, 36 + wobble(t, 1.5, 3) * 5, 150, 74);
    g.globalAlpha = 0.22 + wobble(t, 1, 2.5) * 0.06;
    g.drawImage(glow, 200 + wobble(t, 0.6, 5) * 12, 190 + wobble(t, 1.1, 1) * 7, 130, 62);
    g.globalAlpha = 1;
    // Drifting caustic rings.
    g.strokeStyle = 'rgba(225,244,248,1)';
    g.lineWidth = 1.2;
    for (let i = 0; i < 3; i++) {
      const rp = ((t * 14 + i * 42) % 120) / 120;
      g.globalAlpha = (1 - rp) * 0.16;
      g.beginPath();
      g.ellipse(200 + i * 90, 100 + i * 50, 14 + rp * 70, (14 + rp * 70) * 0.42, 0, 0, Math.PI * 2);
      g.stroke();
    }
    g.globalAlpha = 1;
    for (const f of this.fish) {
      // Ease the display heading and depth so darts lean and dives sink instead of snapping.
      f.hv += (f.v - f.hv) * Math.min(1, dt * 5);
      f.dd += ((f.deep ? 1 : 0) - f.dd) * Math.min(1, dt * 3);
    }
    const deepFish = this.fish.filter((f) => f.dd > 0.5);
    const shallowFish = this.fish.filter((f) => f.dd <= 0.5);
    for (const f of deepFish) this.drawFish(g, f, t);
    for (let i = this.ripples.length - 1; i >= 0; i--) {
      const rp = this.ripples[i] as Ripple;
      rp.r += 64 * dt;
      rp.a -= dt * 0.9;
      if (rp.a <= 0) {
        this.ripples.splice(i, 1);
        continue;
      }
      g.strokeStyle = `rgba(230,246,250,${rp.a})`;
      g.lineWidth = 1.6;
      g.beginPath();
      g.ellipse(rp.x, rp.y, rp.r, rp.r * 0.42, 0, 0, Math.PI * 2);
      g.stroke();
    }
    for (const f of shallowFish) this.drawFish(g, f, t);
    if (this.phase === 'done') {
      for (const sh of this.shreds) {
        g.save();
        g.translate(sh.x + wobble(t, 0.5, sh.ph) * 5, sh.y + wobble(t, 0.4, sh.ph + 2) * 3);
        g.rotate(sh.ph + wobble(t, 0.6, sh.ph) * 0.2);
        oval(g, 0, 0, 6, 3, 'rgba(238,228,204,0.35)');
        g.restore();
      }
    }
    g.restore();
    // The poi, gliding and dipping; gone once the paper has given way.
    if (this.phase === 'scoop') {
      this.poiX += (this.cx - this.poiX) * Math.min(1, dt * 10);
      this.dipT = Math.max(0, this.dipT - dt);
      const dipK = this.dipT > 0 ? Math.sin(((0.34 - this.dipT) / 0.34) * Math.PI) : 0;
      const px = this.fishX(this.poiX);
      const py = 152 + wobble(t, 1.6) * 3 + dipK * 12;
      softShadow(g, px, py + 16 - dipK * 10, 24, 9, 0.2 + dipK * 0.12);
      g.save();
      g.translate(px, py);
      g.rotate(wobble(t, 1.1) * 0.05);
      g.scale(1 + dipK * 0.06, 1 - dipK * 0.12);
      // Handle first, running off toward the player's hand at the frame's edge.
      g.save();
      g.rotate(0.5);
      rr(g, -4, 24, 8, 200, 4, '#b0452a');
      rr(g, -4, 24, 3, 200, 2, 'rgba(255,220,190,0.25)');
      g.restore();
      g.drawImage(this.paperAt(Math.floor(this.soak / 9)).cv, -32, -32);
      g.strokeStyle = '#c1512f';
      g.lineWidth = 5;
      g.beginPath();
      g.arc(0, 0, 27, 0, Math.PI * 2);
      g.stroke();
      g.strokeStyle = 'rgba(255,200,160,0.5)';
      g.lineWidth = 2;
      g.beginPath();
      g.arc(0, 0, 28.5, -2.4, -0.6);
      g.stroke();
      g.restore();
    }
    // A caught one arcs through the lantern light into the bowl.
    if (this.flight) {
      const k = this.flight.t;
      const fx = this.flight.x + (BOWL.x - this.flight.x) * k;
      const fy = this.flight.y + (BOWL.y - 10 - this.flight.y) * k - Math.sin(k * Math.PI) * 85;
      g.save();
      g.translate(fx, fy);
      g.rotate(k * Math.PI * 2.2);
      oval(g, 0, 0, 11, 5, '#e8862f');
      oval(g, -1, -1.6, 6, 2.4, '#c1512f');
      g.fillStyle = 'rgba(232,110,52,0.7)';
      g.beginPath();
      g.moveTo(-9, 0);
      g.quadraticCurveTo(-17, -6, -21, -2);
      g.quadraticCurveTo(-16, 2, -9, 1);
      g.fill();
      dot(g, 8.5, -1.6, 1.2, PAL.ink);
      g.restore();
      if (!calm() && Math.random() < dt * 20) {
        this.scene.burst(fx, fy, { n: 1, color: 'rgba(190,228,238,0.8)', size: 1.8, speed: 20, grav: 260, life: 0.35 });
      }
    }
    // The prize bowl, seen from above like the tub, caught fish circling.
    dot(g, BOWL.x, BOWL.y, BOWL.r, 'rgba(236,246,250,0.16)');
    dot(g, BOWL.x, BOWL.y, BOWL.r - 5, '#4c86a0');
    dot(g, BOWL.x, BOWL.y, BOWL.r - 7, '#5f9fc4');
    g.strokeStyle = 'rgba(244,252,255,0.5)';
    g.lineWidth = 2;
    g.beginPath();
    g.arc(BOWL.x, BOWL.y, BOWL.r - 1, 0, Math.PI * 2);
    g.stroke();
    g.globalAlpha = 0.24;
    g.drawImage(this.glowSprite().cv, BOWL.x - 30, BOWL.y - 26, 60, 44);
    g.globalAlpha = 1;
    for (let i = 0; i < this.bowlFish; i++) {
      const a = t * 1.1 + i * 2.2;
      const bx = BOWL.x + Math.cos(a) * 17;
      const by = BOWL.y + Math.sin(a) * 15;
      g.save();
      g.translate(bx, by);
      g.rotate(a + Math.PI / 2);
      oval(g, 0, 0, 6, 2.6, '#e8862f');
      g.fillStyle = 'rgba(232,110,52,0.7)';
      g.beginPath();
      g.moveTo(-5, 0);
      g.quadraticCurveTo(-10, Math.sin(t * 7 + i) * 3, -12, 1);
      g.quadraticCurveTo(-8, 2, -5, 1);
      g.fill();
      g.restore();
    }
    // The soak tag fills as the paper drinks.
    const fillH = (this.soak / 100) * 50;
    rect(g, 555, 151 + (52 - fillH), 12, fillH, 'rgba(176,86,48,0.85)');
    // The parting gift: a water bag swaying in lantern light.
    if (this.phase === 'done' && this.bagT > 0) {
      const bx = 256;
      const by = 168;
      g.save();
      g.translate(bx, by - 52);
      g.rotate(wobble(t, 1.3) * 0.06);
      g.scale(this.bagT * 1.3, this.bagT * 1.3);
      g.translate(0, 52 / 1.3);
      softShadow(g, 0, 42, 28, 9, 0.3);
      g.fillStyle = 'rgba(226,242,250,0.4)';
      g.beginPath();
      g.moveTo(0, -38);
      g.bezierCurveTo(26, -26, 30, 8, 22, 26);
      g.bezierCurveTo(12, 38, -12, 38, -22, 26);
      g.bezierCurveTo(-30, 8, -26, -26, 0, -38);
      g.fill();
      g.strokeStyle = 'rgba(150,190,205,0.7)';
      g.lineWidth = 2;
      g.stroke();
      g.save();
      g.beginPath();
      g.moveTo(0, -20);
      g.bezierCurveTo(24, -12, 27, 8, 20, 24);
      g.bezierCurveTo(11, 35, -11, 35, -20, 24);
      g.bezierCurveTo(-27, 8, -24, -12, 0, -20);
      g.clip();
      rect(g, -30, -8, 60, 46, 'rgba(88,158,182,0.9)');
      oval(g, -6, -4, 16, 4, 'rgba(210,236,244,0.5)');
      const n = Math.min(3, Math.max(1, this.caught));
      for (let i = 0; i < n; i++) {
        const fx2 = wobble(t, 1.2, i * 2.4) * 10;
        const fy2 = 10 + i * 8 + wobble(t, 1.6, i) * 3;
        oval(g, fx2, fy2, 7, 3.2, '#e8862f', wobble(t, 1.2, i * 2.4 + 1) * 0.4);
        dot(g, fx2 + 5, fy2 - 1, 0.9, PAL.ink);
      }
      g.restore();
      g.strokeStyle = 'rgba(255,255,255,0.5)';
      g.lineWidth = 2.5;
      g.beginPath();
      g.moveTo(-14, -22);
      g.quadraticCurveTo(-19, -4, -15, 16);
      g.stroke();
      dot(g, 0, -38, 4.5, '#c1512f');
      g.strokeStyle = 'rgba(193,81,47,0.8)';
      g.lineWidth = 1.5;
      g.beginPath();
      g.moveTo(-6, -41);
      g.quadraticCurveTo(0, -34, 6, -41);
      g.stroke();
      g.restore();
    }
  }
}

// ---------------------------------------------------------------- the dawn kitchen

/**
 * DashiPanel: the morning dashi and breakfast with Fumi, before the guests
 * wake. Four quiet movements: kombu into cold water and then WAIT (patience
 * is the ingredient), pull the kombu just before the boil, skim the iriko
 * foam, and press two onigiri firm but not angry. There is no fail state;
 * Fumi corrects the way her mother-in-law corrected her, once and warmly.
 */

type DashiPhase = 'steep' | 'pull' | 'skim' | 'onigiri' | 'done';

const STEEP_NEED = 7; // seconds the cold water gets before the flame
const PULL_LO = 72; // the sweet zone: kombu out JUST before the boil
const PULL_HI = 94;
const PACK_LO = 38; // the squeeze's wide soft zone
const PACK_HI = 92;

const WAIT_LINES = [
  'Fumi, without looking up: "Not yet. The sea takes its time."',
  '"Still not yet. Cold water asks; boiling water demands. We are asking."',
  '"Patience is also an ingredient. The cheapest one, and nobody stocks it."',
];

const POT = { cx: 268, sy: 152, rx: 126, ry: 25, bottom: 250 };

type Iriko = { x: number; y: number; ph: number; vy: number; state: 'fall' | 'dance' | 'sink' | 'rest'; hold: number };
type Bubble = { x: number; y: number; r: number; vy: number };

/** Mix two hex colors; k in [0,1]. */
function mix(a: string, b: string, k: number): string {
  const pa = Number.parseInt(a.slice(1), 16);
  const pb = Number.parseInt(b.slice(1), 16);
  const ch = (sh: number) => Math.round(((pa >> sh) & 255) + (((pb >> sh) & 255) - ((pa >> sh) & 255)) * k);
  return `#${((ch(16) << 16) | (ch(8) << 8) | ch(0)).toString(16).padStart(6, '0')}`;
}

export class DashiPanel {
  private phase: DashiPhase = 'steep';
  private dropped = false; // the kombu and iriko are in the water
  private steepT = 0; // seconds rested before the flame goes on
  private heat = 0; // 0..100 toward the boil
  private waitPokes = 0;
  private foam: { x: number; v: number }[] = [];
  private lx = 0.5; // the ladle, and later the hand, 0..1
  private squeeze = 0; // packing pressure, 0..110
  private squeezing = false;
  private packed = 0;
  private hint = '';
  private onDone: (() => void) | null = null;

  // Render-only state.
  private scene = new Scene();
  private setHint: (h: string) => void = () => {};
  private bg: Surface | null = null;
  private strip: Surface | null = null;
  private glow: Surface | null = null;
  private print: HTMLImageElement | null = null;
  private printOn = false;
  private heatT = 0; // eased display heat 0..1
  private goldT = 0; // eased broth tint 0..1
  private kombuState: 'out' | 'sinking' | 'in' | 'lifting' | 'gone' = 'out';
  private kombuK = 0; // 0..1 along the sink or the lift
  private irikos: Iriko[] = [];
  private bubbles: Bubble[] = [];
  private lxD = 0.5;
  private dipT = 0;
  private tasteT = 0;
  private tasteHold = 0;
  private boardT = 0;
  private popT = 0;
  private recoilT = 0;
  private steamAcc = 0;
  private packedD = 0;

  constructor(
    private root: HTMLElement,
    private audio: AudioBus,
  ) {}

  get isOpen(): boolean {
    return !this.root.hidden;
  }

  open(onDone: () => void) {
    this.onDone = onDone;
    this.phase = 'steep';
    this.dropped = false;
    this.steepT = 0;
    this.heat = 0;
    this.waitPokes = 0;
    this.foam = [];
    this.lx = 0.5;
    this.squeeze = 0;
    this.squeezing = false;
    this.packed = 0;
    this.hint =
      'A pot of cold water. Fumi lays out kombu and a handful of iriko, heads already pinched. "In they go. Space, then hands off."';
    this.heatT = 0;
    this.goldT = 0;
    this.kombuState = 'out';
    this.kombuK = 0;
    this.irikos = [];
    this.bubbles = [];
    this.lxD = 0.5;
    this.dipT = 0;
    this.tasteT = 0;
    this.tasteHold = 0;
    this.boardT = 0;
    this.popT = 0;
    this.recoilT = 0;
    this.steamAcc = 0;
    this.packedD = 0;
    if (!this.print) {
      // The Hiroshige tai from the scouting pass (CC0, Met Open Access), taped to the wall as journal ephemera.
      this.print = new Image();
      this.print.onload = () => {
        this.printOn = true;
        this.bg = null; // re-bake with the plate mounted
      };
      this.print.src = 'assets/games/hiroshige-medetai.jpg';
    }
    const m = mountScene(this.root, 'The Dawn Kitchen', this.scene);
    fixHint(this.root);
    this.setHint = m.setHint;
    this.scene.restart();
    this.root.hidden = false;
    this.setHint(this.hint);
  }

  tick(dt: number) {
    if (!this.isOpen) return;
    if (this.phase === 'steep' && this.dropped) {
      this.steepT += dt;
      if (this.steepT >= STEEP_NEED) {
        this.phase = 'pull';
        this.hint =
          'The flame goes on, low. "Now watch, not the clock, the kombu. Out it comes JUST before the boil. Space, at the right moment."';
      }
    } else if (this.phase === 'pull') {
      this.heat = Math.min(100, this.heat + dt * 13);
      if (this.heat >= 100) {
        // No failing in this kitchen. Her chopsticks were always nearby.
        this.audio.slosh();
        this.hint =
          'Her chopsticks flick the kombu out at the first true bubble. "Boiled kombu sulks and turns bitter. Near misses also teach." The iriko simmer on.';
        this.liftKombu();
        this.startSkim();
      }
    } else if (this.phase === 'skim') {
      for (const f of this.foam) {
        f.x += f.v * dt * 0.12;
        if (f.x < 0.06 || f.x > 0.94) f.v = -f.v;
      }
    } else if (this.phase === 'onigiri' && this.squeezing) {
      this.squeeze += dt * 46;
      if (this.squeeze > 108) {
        this.audio.blip();
        this.squeezing = false;
        this.squeeze = 0;
        if (!calm()) this.scene.thump(5, 0.05);
        this.scene.burst(438, 196, { n: calm() ? 5 : 14, color: '#f4efe4', size: 2.2, speed: 120, grav: 260, life: 0.55 });
        this.recoilT = 0.4;
        this.hint = 'The rice squeaks. Fumi raises one eyebrow. "You are angry at the rice? Loosen the hand. Again."';
      }
    }
    this.scene.frame(dt, (g) => this.paint(g, dt));
    this.setHint(this.hint);
  }

  onDir(dir: Dir) {
    if (this.phase === 'skim' || this.phase === 'onigiri') {
      if (dir === 'left') this.lx = Math.max(0.06, this.lx - 0.07);
      if (dir === 'right') this.lx = Math.min(0.94, this.lx + 0.07);
    }
  }

  onAction() {
    if (this.phase === 'done') {
      this.root.hidden = true;
      const done = this.onDone;
      this.onDone = null;
      done?.();
      return;
    }
    if (this.phase === 'steep') {
      if (!this.dropped) {
        this.dropped = true;
        this.audio.slosh();
        this.dropKombu();
        this.hint = 'The kombu slides under; the iriko follow like a small silver crowd. Now: nothing. The waiting IS the step.';
      } else {
        // The patience beat. Pressing early is answered, gently, every time.
        this.audio.blip();
        this.hint = WAIT_LINES[Math.min(this.waitPokes, WAIT_LINES.length - 1)] as string;
        this.waitPokes++;
      }
    } else if (this.phase === 'pull') {
      if (this.heat < PULL_LO) {
        this.audio.blip();
        this.hint = '"Not yet. See the little bubbles on the kombu, small as roe? When they hurry, you move."';
      } else {
        this.audio.chime();
        this.scene.flash('#fff2cf', 0.22);
        if (!calm()) this.scene.thump(3, 0.03);
        this.hint =
          'The kombu comes out glossy, one breath before the boil. Fumi nods once, which in this kitchen is applause. The iriko simmer on.';
        this.liftKombu();
        this.startSkim();
      }
    } else if (this.phase === 'skim') {
      const lpx = this.surfX(this.lxD);
      this.dipT = 0.3;
      const idx = this.foam.findIndex((f) => Math.abs(f.x - this.lx) < 0.1);
      if (idx >= 0) {
        this.foam.splice(idx, 1);
        this.audio.slosh();
        this.audio.weaveNote(this.foam.length % 7);
        this.scene.burst(lpx, POT.sy, { n: calm() ? 4 : 9, color: '#ddd8c6', size: 2.6, speed: 55, grav: 40, life: 0.5, kind: 'puff' });
        this.hint =
          this.foam.length > 0
            ? '"Just the grey foam, not the gold under it. The scum is the sea clearing its throat."'
            : 'The broth goes clear as morning water. "Iriko dashi. Taste later; smell now." You do. The whole Inland Sea, in a saucepan.';
        if (this.foam.length === 0) {
          this.phase = 'onigiri';
          this.lx = 0.5;
          this.hint +=
            ' Rice next, salted palms. "Space to squeeze, Space to let go. Firm enough to travel, kind enough to eat."';
          // The tasting lift: the ladle rises full of gold, trailing steam, then the board slides in.
          this.scene.flash('#ffe9b8', 0.3);
          this.scene.tween(0, 1, 1.1, easeInOutSine, (v) => {
            this.tasteT = v;
          }, () => {
            this.tasteHold = 1.3;
            this.scene.tween(0, 1, 0.7, easeOutCubic, (v) => {
              this.boardT = v;
            });
          });
        }
      } else {
        this.audio.blip();
        this.scene.burst(lpx, POT.sy + 4, { n: calm() ? 2 : 5, color: 'rgba(230,225,200,0.7)', size: 2, speed: 40, grav: 120, life: 0.4 });
        this.hint = 'The ladle lifts only good broth. The foam drifts on, smug. Follow it with the arrows.';
      }
    } else if (this.phase === 'onigiri') {
      if (!this.squeezing) {
        this.squeezing = true;
        this.squeeze = 0;
        this.hint = 'The rice is hot enough to argue with. You press, steady...';
      } else {
        this.squeezing = false;
        if (this.squeeze >= PACK_LO && this.squeeze <= PACK_HI) {
          this.packed++;
          this.audio.weaveNote(this.packed % 7);
          this.squeeze = 0;
          this.scene.flash('#fff2cf', 0.18);
          this.scene.burst(438, 196, { n: calm() ? 4 : 9, color: '#f4efe4', size: 1.8, speed: 60, grav: 180, life: 0.45 });
          this.popT = 0.01;
          this.scene.tween(0.01, 1, 0.55, easeOutBack, (v) => {
            this.popT = v;
          }, () => {
            this.packedD = this.packed;
            this.popT = 0;
          });
          if (this.packed >= 2) {
            this.phase = 'done';
            this.audio.weaveDone();
            this.scene.flash('#ffd9a0', 0.35);
            this.hint =
              'Two onigiri, three presses each, a tuck of umeboshi in the heart. Fumi wraps them while the miso blooms in the dashi. Space.';
          } else {
            this.hint = '"So. Your hands were listening." The first onigiri sits proud on the board. One more, for the other tray.';
          }
        } else {
          this.audio.blip();
          this.squeeze = 0;
          this.recoilT = 0.3;
          this.hint = '"Too shy. That one would not survive a pocket. The rice forgives; again, with conviction."';
        }
      }
    }
  }

  private startSkim() {
    this.phase = 'skim';
    this.lx = 0.5;
    this.foam = [
      { x: 0.22, v: (Math.random() - 0.5) * 0.6 },
      { x: 0.52, v: (Math.random() - 0.5) * 0.6 },
      { x: 0.8, v: (Math.random() - 0.5) * 0.6 },
    ];
  }

  // -------- render-only choreography

  private dropKombu() {
    this.kombuState = 'sinking';
    this.scene.tween(0, 1, 0.9, easeOutCubic, (v) => {
      this.kombuK = v;
      if (v > 0.62 && this.kombuState === 'sinking') {
        this.kombuState = 'in';
        this.scene.burst(POT.cx - 20, POT.sy, { n: calm() ? 3 : 8, color: '#cfe0e4', size: 2.4, speed: 60, grav: 180, life: 0.5 });
      }
    });
    // The iriko snow in after, flutter down, and dance on the surface before sinking.
    const rng = new Rng(129);
    this.irikos = [];
    for (let i = 0; i < 8; i++) {
      this.irikos.push({
        x: POT.cx - 76 + rng.next() * 152,
        y: POT.sy - 90 - rng.next() * 50,
        ph: rng.next() * Math.PI * 2,
        vy: 34 + rng.next() * 26,
        state: 'fall',
        hold: 1 + rng.next() * 1.6,
      });
    }
  }

  private liftKombu() {
    this.kombuState = 'lifting';
    this.scene.burst(POT.cx - 20, POT.sy - 6, { n: calm() ? 4 : 10, color: '#cfe0e4', size: 2.2, speed: 50, grav: 240, life: 0.5 });
    this.scene.tween(0, 1, 0.8, easeInOutSine, (v) => {
      this.kombuK = v;
    }, () => {
      this.kombuState = 'gone';
    });
  }

  private surfX(u: number): number {
    return POT.cx + (u - 0.5) * 2 * (POT.rx - 26);
  }

  /** Wall, window, beam, shelf, counter, konro, pot shell: baked once. */
  private bake(): Surface {
    if (this.bg) return this.bg;
    const s = surface(640, 340);
    const g = s.g;
    const rng = new Rng(88);
    vgrad(g, 0, 0, 640, 340, '#57453a', '#382c25');
    // Rough plaster.
    for (let i = 0; i < 70; i++) {
      dot(g, rng.int(640), rng.int(280), rng.range(3, 9), `rgba(${rng.chance(0.5) ? '255,240,210' : '20,12,8'},0.03)`);
    }
    // The beam.
    rect(g, 0, 0, 640, 26, '#402c1e');
    rect(g, 0, 24, 640, 3, 'rgba(0,0,0,0.4)');
    for (let i = 0; i < 8; i++) rect(g, rng.int(640), 4 + rng.int(16), rng.range(30, 90), 1, 'rgba(0,0,0,0.25)');
    // Dawn at the window: pale pearl light, warm at the sill.
    glowSpot(g, 88, 130, 130, '#e8d9a8', 0.14);
    rr(g, 24, 44, 130, 168, 4, '#5a4634');
    vgrad(g, 32, 52, 114, 152, '#c8d8dc', '#e4cfa2');
    g.fillStyle = '#5a4634';
    for (let i = 1; i < 3; i++) rect(g, 32 + (114 / 3) * i, 52, 4, 152, '#5a4634');
    for (let i = 1; i < 4; i++) rect(g, 32, 52 + (152 / 4) * i, 114, 4, '#5a4634');
    rect(g, 24, 208, 130, 6, '#4a3827');
    // The shelf and its jars.
    rect(g, 462, 158, 158, 9, '#5f4936');
    rect(g, 462, 165, 158, 3, 'rgba(0,0,0,0.35)');
    for (const [jx, jw, jh, jc] of [[478, 26, 34, '#8a6238'], [514, 20, 26, '#6b655c'], [543, 24, 40, '#4d7440']] as const) {
      rr(g, jx, 158 - jh, jw, jh, 4, jc);
      rect(g, jx, 158 - jh, jw, 5, shade(jc, -0.3));
      rect(g, jx + 3, 158 - jh + 7, 4, jh - 12, 'rgba(255,245,220,0.15)');
    }
    rr(g, 580, 108, 12, 50, 3, '#7a4a24');
    // The counter.
    rect(g, 0, 282, 640, 58, '#6e5138');
    rect(g, 0, 282, 640, 4, '#87664a');
    rect(g, 0, 300, 640, 2, 'rgba(0,0,0,0.25)');
    rect(g, 0, 320, 640, 2, 'rgba(0,0,0,0.25)');
    for (let i = 0; i < 10; i++) rect(g, rng.int(640), 288 + rng.int(48), rng.range(24, 80), 1, 'rgba(0,0,0,0.14)');
    // The konro, clay with a dark mouth, and the pot's iron shell.
    softShadow(g, POT.cx, 306, 120, 16, 0.35);
    rr(g, POT.cx - 92, 246, 184, 62, 10, '#8a5330');
    rr(g, POT.cx - 92, 246, 184, 10, 8, '#a06239');
    g.fillStyle = '#241a12';
    g.beginPath();
    g.roundRect(POT.cx - 26, 266, 52, 34, [14, 14, 4, 4]);
    g.fill();
    g.fillStyle = '#3f3833';
    g.beginPath();
    g.moveTo(POT.cx - POT.rx, POT.sy);
    g.bezierCurveTo(POT.cx - POT.rx, POT.bottom - 20, POT.cx - POT.rx + 22, POT.bottom, POT.cx - 60, POT.bottom);
    g.lineTo(POT.cx + 60, POT.bottom);
    g.bezierCurveTo(POT.cx + POT.rx - 22, POT.bottom, POT.cx + POT.rx, POT.bottom - 20, POT.cx + POT.rx, POT.sy);
    g.closePath();
    g.fill();
    rect(g, POT.cx - POT.rx + 16, POT.sy + 10, 10, 70, 'rgba(255,240,210,0.07)');
    // Handles and the dark interior before water is painted live.
    for (const hs of [-1, 1]) {
      rr(g, POT.cx + hs * (POT.rx + 2) - 7, POT.sy + 8, 14, 30, 6, '#2c2622');
    }
    oval(g, POT.cx, POT.sy, POT.rx, POT.ry, '#221c18');
    g.strokeStyle = '#55493f';
    g.lineWidth = 6;
    g.beginPath();
    g.ellipse(POT.cx, POT.sy, POT.rx, POT.ry, 0, 0, Math.PI * 2);
    g.stroke();
    g.strokeStyle = 'rgba(255,240,210,0.18)';
    g.lineWidth = 2;
    g.beginPath();
    g.ellipse(POT.cx, POT.sy - 2, POT.rx - 2, POT.ry - 2, 0, Math.PI * 1.15, Math.PI * 1.75);
    g.stroke();
    // The taped-in Hiroshige tai, a plate the traveler pasted over the shelf.
    if (this.printOn && this.print) {
      const img = this.print;
      const w = 128;
      const h = (w * img.height) / img.width;
      g.save();
      g.translate(482 + w / 2, 78);
      g.rotate(-0.05);
      softShadow(g, 0, h / 2 + 2, w / 2 + 6, 10, 0.3);
      rect(g, -w / 2 - 5, -h / 2 - 5, w + 10, h + 10, '#efe6d2');
      g.drawImage(img, -w / 2, -h / 2, w, h);
      g.fillStyle = 'rgba(238,228,200,0.65)';
      for (const [tx2, ty2, tr] of [[-w / 2, -h / 2, -0.7], [w / 2, h / 2, -0.7]] as const) {
        g.save();
        g.translate(tx2, ty2);
        g.rotate(tr);
        rect(g, -14, -5, 28, 10, 'rgba(238,228,200,0.65)');
        g.restore();
      }
      g.restore();
    }
    this.bg = s;
    return s;
  }

  private glowSprite(): Surface {
    if (this.glow) return this.glow;
    const s = surface(128, 128);
    const grad = s.g.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, 'rgba(255,186,100,0.9)');
    grad.addColorStop(1, 'rgba(255,160,80,0)');
    s.g.fillStyle = grad;
    s.g.fillRect(0, 0, 128, 128);
    this.glow = s;
    return s;
  }

  private meterStrip(): Surface {
    if (this.strip) return this.strip;
    const s = surface(240, 10);
    const grad = s.g.createLinearGradient(0, 0, 240, 0);
    grad.addColorStop(0, PAL.gold);
    grad.addColorStop(1, PAL.terracotta);
    s.g.fillStyle = grad;
    s.g.fillRect(0, 0, 240, 10);
    this.strip = s;
    return s;
  }

  private meter(
    g: CanvasRenderingContext2D, x: number, y: number, w: number, frac: number, label: string,
    zone?: [number, number], fill?: string,
  ) {
    g.font = '13px Georgia, serif';
    g.fillStyle = 'rgba(244,238,224,0.88)';
    g.fillText(label, x, y - 6);
    rr(g, x, y, w, 10, 5, 'rgba(0,0,0,0.4)');
    if (zone) {
      rect(g, x + (w * zone[0]) / 100, y + 1, (w * (zone[1] - zone[0])) / 100, 8, 'rgba(242,230,208,0.5)');
    }
    if (frac > 0.01) {
      g.save();
      g.beginPath();
      g.roundRect(x, y, w, 10, 5);
      g.clip();
      g.globalAlpha = 0.9;
      if (fill) rect(g, x, y, w * frac, 10, fill);
      else g.drawImage(this.meterStrip().cv, 0, 0, 240 * frac, 10, x, y, w * frac, 10);
      g.restore();
    }
  }

  private drawKombu(g: CanvasRenderingContext2D, t: number) {
    let x = POT.cx - 26;
    let y = POT.sy + 2;
    let rot = -0.08 + wobble(t, 0.8) * 0.05;
    let alpha = 0.88;
    if (this.kombuState === 'sinking') {
      const k = this.kombuK;
      x = POT.cx + 40 - 66 * k;
      y = POT.sy - 88 + 90 * k;
      rot = 0.5 - 0.58 * k;
    } else if (this.kombuState === 'lifting') {
      const k = this.kombuK;
      x = POT.cx - 26 + 150 * k;
      y = POT.sy + 2 - 190 * k;
      rot = -0.08 + 0.7 * k;
      alpha = 0.95;
      // Chopsticks reaching down from the upper right.
      g.strokeStyle = '#8a6238';
      g.lineWidth = 3;
      for (const o of [-3, 4]) {
        g.beginPath();
        g.moveTo(x + 40 + o, y - 60);
        g.lineTo(x + o * 0.4, y - 2);
        g.stroke();
      }
    } else if (this.kombuState === 'gone' || this.kombuState === 'out') {
      return;
    }
    g.save();
    g.globalAlpha = alpha;
    g.translate(x, y);
    g.rotate(rot);
    g.fillStyle = '#3d4a2e';
    g.beginPath();
    g.moveTo(-36, 0);
    g.bezierCurveTo(-20, -9, 22, -8, 38, -2);
    g.bezierCurveTo(24, 7, -18, 8, -36, 0);
    g.fill();
    g.strokeStyle = 'rgba(120,140,80,0.6)';
    g.lineWidth = 1.5;
    g.beginPath();
    g.moveTo(-30, -1);
    g.quadraticCurveTo(0, -4, 32, -2);
    g.stroke();
    if (this.kombuState === 'lifting') {
      g.strokeStyle = 'rgba(255,250,230,0.5)';
      g.beginPath();
      g.moveTo(-24, 1);
      g.quadraticCurveTo(0, 3, 26, 0);
      g.stroke();
    }
    g.restore();
  }

  private paint(g: CanvasRenderingContext2D, dt: number) {
    const t = this.scene.time;
    g.drawImage(this.bake().cv, 0, 0);
    const boiling = this.phase === 'pull';
    // Eased tints: heat carries the water blue to warm; gold arrives with the iriko broth.
    this.heatT += ((boiling || this.heat > 0 ? this.heat / 100 : 0) - this.heatT) * Math.min(1, dt * 2);
    const goldTarget = this.phase === 'skim' ? 0.6 : this.phase === 'onigiri' || this.phase === 'done' ? 1 : 0;
    this.goldT += (goldTarget - this.goldT) * Math.min(1, dt * 0.9);
    // The flame, only while the pull is on.
    if (boiling) {
      g.globalAlpha = 0.4 + wobble(t, 9) * 0.1;
      g.drawImage(this.glowSprite().cv, POT.cx - 55, 250, 110, 66);
      g.globalAlpha = 1;
      for (let i = 0; i < 4; i++) {
        const fx = POT.cx - 15 + i * 10;
        const fh = 13 + Math.sin(t * 12 + i * 2.1) * 6 + this.heatT * 6;
        g.fillStyle = i % 2 ? '#f4c96b' : '#e8973f';
        g.beginPath();
        g.moveTo(fx - 5, 298);
        g.quadraticCurveTo(fx - 6, 298 - fh * 0.6, fx, 298 - fh);
        g.quadraticCurveTo(fx + 6, 298 - fh * 0.6, fx + 5, 298);
        g.fill();
      }
    }
    // Water, clipped to the pot mouth.
    const cold = mix('#b9d3da', '#9fc3cf', this.heatT);
    const surf = mix(cold, '#c9a35f', this.goldT);
    g.save();
    g.beginPath();
    g.ellipse(POT.cx, POT.sy, POT.rx - 6, POT.ry - 4, 0, 0, Math.PI * 2);
    g.clip();
    rect(g, POT.cx - POT.rx, POT.sy - POT.ry, POT.rx * 2, POT.ry * 2, surf);
    oval(g, POT.cx, POT.sy + 6, POT.rx - 10, POT.ry - 6, mix(shade(surf, -0.18), '#a2823f', this.goldT * 0.4));
    // The window's pale morning lying on the water, wobbling.
    g.globalAlpha = 0.16 + wobble(t, 1.4) * 0.05;
    oval(g, POT.cx - 44 + wobble(t, 0.8) * 5, POT.sy - 4, 34, 7, '#f2ead6', 0.1);
    g.globalAlpha = 1;
    // Sunken iriko resting in the deep; the dancers come later in the draw order.
    for (const ir of this.irikos) {
      if (ir.state !== 'rest' && ir.state !== 'sink') continue;
      g.save();
      g.globalAlpha = ir.state === 'rest' ? 0.3 : 0.55;
      g.translate(ir.x + wobble(t, 0.6, ir.ph) * 4, Math.min(ir.y, POT.sy + POT.ry - 8));
      g.rotate(wobble(t, 0.5, ir.ph) * 0.3);
      oval(g, 0, 0, 5, 1.6, '#c9c9bf');
      dot(g, 4, 0, 1, '#8f8f85');
      g.restore();
    }
    // Roe-small bubbles climbing as the heat rises.
    if (boiling) {
      const rate = this.heatT * 26;
      if (Math.random() < dt * rate) {
        this.bubbles.push({ x: POT.cx - 70 + Math.random() * 140, y: POT.sy + POT.ry - 8, r: 1 + Math.random() * 1.6 + this.heatT, vy: 12 + Math.random() * 16 });
      }
    }
    for (let i = this.bubbles.length - 1; i >= 0; i--) {
      const b = this.bubbles[i] as Bubble;
      b.y -= b.vy * dt;
      if (b.y < POT.sy - POT.ry + 10) {
        this.bubbles.splice(i, 1);
        continue;
      }
      dot(g, b.x + wobble(t, 5, b.x) * 1.5, b.y, b.r, 'rgba(240,250,250,0.5)');
    }
    g.restore();
    // The kombu, in whatever state the morning has it.
    this.drawKombu(g, t);
    // Iriko falling and dancing on the surface: they flutter, truly.
    for (let i = this.irikos.length - 1; i >= 0; i--) {
      const ir = this.irikos[i] as Iriko;
      if (ir.state === 'fall') {
        ir.y += ir.vy * dt;
        ir.x += Math.sin(t * 6 + ir.ph) * 26 * dt;
        if (ir.y >= POT.sy - 2) {
          ir.y = POT.sy - 2;
          ir.state = 'dance';
        }
      } else if (ir.state === 'dance') {
        ir.hold -= dt;
        ir.x += Math.sin(t * 7 + ir.ph) * 14 * dt;
        if (ir.hold <= 0) ir.state = 'sink';
      } else if (ir.state === 'sink') {
        ir.y += 9 * dt;
        if (ir.y > POT.sy + 10) ir.state = 'rest';
      }
      if (ir.state === 'fall' || ir.state === 'dance') {
        g.save();
        g.translate(ir.x, ir.y + (ir.state === 'dance' ? Math.abs(Math.sin(t * 8 + ir.ph)) * -2.5 : 0));
        g.rotate(Math.sin(t * (ir.state === 'dance' ? 9 : 5) + ir.ph) * 0.5);
        oval(g, 0, 0, 5.5, 1.8, '#d8d8cc');
        oval(g, 0, -0.6, 4, 0.9, 'rgba(255,255,250,0.7)');
        dot(g, 4.5, 0, 1.1, '#8f8f85');
        g.restore();
      }
    }
    // Grey foam clusters riding the simmer.
    for (const f of this.foam) {
      const fx = this.surfX(f.x);
      const fy = POT.sy + wobble(t, 2.2, f.x * 9) * 3;
      softShadow(g, fx, fy + 4, 12, 4, 0.14);
      for (const [ox, oy, orr] of [[-5, 1, 4.6], [3, -1, 5.2], [8, 2, 3.6], [-1, 3, 4]] as const) {
        dot(g, fx + ox, fy + oy, orr, '#e6e2d3');
      }
      dot(g, fx + 2, fy - 2, 2.4, '#f2efe4');
    }
    // Steam, by mood: none in cold water, a thread near the boil, plenty over broth.
    this.steamAcc += dt;
    const steamEvery = boiling ? 0.34 - this.heatT * 0.2 : this.goldT > 0.2 ? 0.22 : 99;
    if (this.steamAcc > steamEvery && !calm()) {
      this.steamAcc = 0;
      this.scene.waft(POT.cx - 60 + Math.random() * 120, POT.sy - 8, 'rgba(255,252,244,0.3)', 8);
    }
    // The ladle: skimming, then the tasting lift.
    const showLadle = this.phase === 'skim' || this.tasteT > 0;
    if (showLadle) {
      this.lxD += (this.lx - this.lxD) * Math.min(1, dt * 10);
      this.dipT = Math.max(0, this.dipT - dt);
      const dipK = this.dipT > 0 ? Math.sin(((0.3 - this.dipT) / 0.3) * Math.PI) : 0;
      let cx2 = this.surfX(this.lxD);
      let cy2 = POT.sy - 10 + dipK * 9;
      if (this.tasteT > 0) {
        if (this.tasteHold > 0) this.tasteHold -= dt;
        const k = this.tasteT;
        cx2 = cx2 + (306 - cx2) * k;
        cy2 = cy2 + (84 - cy2) * k;
        if (!calm() && Math.random() < dt * 7) this.scene.waft(cx2, cy2 - 6, 'rgba(255,252,244,0.4)', 6);
        if (this.tasteHold < 0 && this.boardT >= 1) this.tasteT = Math.max(0, this.tasteT - dt * 1.4);
      }
      g.save();
      g.translate(cx2, cy2);
      g.rotate(-0.18 + dipK * 0.14);
      g.strokeStyle = '#8a6238';
      g.lineWidth = 5;
      g.beginPath();
      g.moveTo(10, -4);
      g.lineTo(120, -96);
      g.stroke();
      g.strokeStyle = 'rgba(255,240,210,0.25)';
      g.lineWidth = 1.5;
      g.beginPath();
      g.moveTo(11, -6);
      g.lineTo(119, -97);
      g.stroke();
      oval(g, 0, 0, 15, 8, '#7a5732');
      oval(g, 0, -1, 12, 5.6, this.tasteT > 0.3 ? '#d9b25f' : shade(surf, -0.08));
      oval(g, -3, -2.5, 5, 1.8, 'rgba(255,250,235,0.5)');
      g.restore();
    }
    // The board slides in for the onigiri movement.
    if (this.boardT > 0) {
      const bx = 336 + (1 - this.boardT) * 330;
      g.save();
      g.translate(bx - 336, 0);
      softShadow(g, 476, 320, 150, 14, 0.3);
      rr(g, 336, 238, 286, 84, 8, '#a97c50');
      rr(g, 336, 238, 286, 8, 6, '#bb8d5e');
      rect(g, 336, 314, 286, 8, '#7d5836');
      // The rice tub, still steaming.
      softShadow(g, 588, 268, 30, 10, 0.25);
      dot(g, 588, 252, 27, '#8a6238');
      dot(g, 588, 250, 22, '#6e4b28');
      oval(g, 588, 248, 19, 12, '#f4efe4');
      oval(g, 583, 244, 8, 4, '#fdfaf0');
      if (!calm() && Math.random() < dt * 3) this.scene.waft(588, 238, 'rgba(255,252,244,0.3)', 5);
      // Finished onigiri, sitting proud.
      const drawOni = (ox: number, oy: number, sc: number, rot: number) => {
        g.save();
        g.translate(ox, oy);
        g.rotate(rot);
        g.scale(sc, sc);
        softShadow(g, 0, 14, 18, 6, 0.24);
        g.fillStyle = '#f4efe4';
        g.beginPath();
        g.moveTo(0, -17);
        g.quadraticCurveTo(16, -12, 19, 10);
        g.quadraticCurveTo(10, 15, 0, 15);
        g.quadraticCurveTo(-10, 15, -19, 10);
        g.quadraticCurveTo(-16, -12, 0, -17);
        g.fill();
        g.fillStyle = 'rgba(220,208,184,0.6)';
        g.beginPath();
        g.moveTo(8, -12);
        g.quadraticCurveTo(15, -8, 17, 9);
        g.quadraticCurveTo(11, 13, 4, 14);
        g.fill();
        rr(g, -8, 2, 16, 12, 2, '#1c2418');
        rect(g, -8, 2, 16, 3, '#2c3a24');
        g.restore();
      };
      for (let i = 0; i < this.packedD; i++) drawOni(374 + i * 52, 280, 1, i === 0 ? -0.05 : 0.06);
      if (this.popT > 0 && this.packed > this.packedD) {
        const k = this.popT;
        const tx2 = 438 + (374 + this.packedD * 52 - 438) * k;
        const ty2 = 196 + (280 - 196) * k - Math.sin(Math.min(1, k) * Math.PI) * 40;
        drawOni(tx2, ty2, 0.6 + 0.4 * k, (1 - k) * 1.2);
      }
      // The pressing hands, unless the fresh one is mid-flight.
      if (this.phase === 'onigiri' && this.popT === 0) {
        this.recoilT = Math.max(0, this.recoilT - dt);
        const rec = this.recoilT > 0 ? Math.sin((this.recoilT / 0.4) * Math.PI) * 14 : 0;
        const sq = this.squeezing ? this.squeeze : 0;
        const gap = 40 - sq * 0.17 + rec;
        const press = sq / 108;
        g.save();
        g.translate(438, 196 + wobble(t, 1.2) * 2);
        // The rice between the palms, squashing as they close.
        g.save();
        g.scale(1 - press * 0.3, 1 + press * 0.34);
        oval(g, 0, 0, 17, 13, '#f4efe4');
        oval(g, -4, -4, 8, 5, '#fdfaf0');
        dot(g, 6, 4, 1.2, 'rgba(214,200,176,0.9)');
        dot(g, -7, 5, 1.1, 'rgba(214,200,176,0.9)');
        g.restore();
        if (!calm() && Math.random() < dt * 4) this.scene.waft(0, -12, 'rgba(255,252,244,0.35)', 4);
        for (const hs of [-1, 1]) {
          g.save();
          g.translate(hs * gap, 2);
          g.rotate(hs * (0.12 + press * 0.1));
          oval(g, 0, 0, 13, 18, '#e0b48a');
          oval(g, hs * -4, -3, 8, 12, '#ecc49c');
          for (let fi = 0; fi < 3; fi++) {
            oval(g, hs * -8, -12 + fi * 8, 6, 3.4, '#e0b48a', hs * 0.3);
          }
          g.restore();
        }
        g.restore();
      }
      g.restore();
    }
    // The painted meters, kept word for word.
    if (this.phase === 'steep') {
      const w = this.dropped ? Math.min(100, (this.steepT / STEEP_NEED) * 100) : 0;
      this.meter(g, 40, 320, 260, w / 100, 'cold water, resting', undefined, '#7fa8b5');
    } else if (boiling) {
      this.meter(g, 40, 320, 260, this.heat / 100, 'toward the boil (the pale band is your moment)', [PULL_LO, PULL_HI]);
    } else if (this.phase === 'skim') {
      g.font = '13px Georgia, serif';
      g.fillStyle = 'rgba(244,238,224,0.88)';
      g.fillText(`foam left: ${this.foam.length}. Arrows steer the ladle, Space skims.`, 40, 326);
    } else if (this.phase === 'onigiri') {
      const dots = '●'.repeat(this.packed);
      this.meter(g, 40, 320, 260, Math.min(100, this.squeeze) / 100, `the squeeze ${dots} (soft zone is wide; anger is not)`, [PACK_LO, PACK_HI]);
    }
  }
}
