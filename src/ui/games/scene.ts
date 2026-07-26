/**
 * The minigame scene kit: every panel paints a real illustrated scene on a
 * shared canvas stage instead of abstract DOM bars. Painterly, animated,
 * juicy. All helpers are allocation-light: no per-frame gradients, no
 * per-frame closures in hot paths.
 *
 * A panel builds one Scene, keeps it for its lifetime, and each tick calls
 * scene.frame(dt, (g) => { ...paint with the same pix.ts idiom as the world });
 * tweens, particles, shake, and flash are managed for you.
 */

export type Ease = (t: number) => number;

export const easeOutCubic: Ease = (t) => 1 - (1 - t) ** 3;
export const easeInCubic: Ease = (t) => t ** 3;
export const easeInOutSine: Ease = (t) => 0.5 - Math.cos(Math.PI * t) / 2;
export const easeOutBack: Ease = (t) => 1 + 2.70158 * (t - 1) ** 3 + 1.70158 * (t - 1) ** 2;
export const easeOutElastic: Ease = (t) =>
  t === 0 || t === 1 ? t : 2 ** (-10 * t) * Math.sin((t * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1;

/** A soft wobble for idle life: wobble(time, 2.3) in [-1, 1]. */
export function wobble(time: number, speed = 1, phase = 0): number {
  return Math.sin(time * speed + phase);
}

type TweenRec = {
  from: number;
  to: number;
  dur: number;
  t: number;
  ease: Ease;
  apply: (v: number) => void;
  done?: () => void;
};

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  age: number;
  size: number;
  color: string;
  grav: number;
  drag: number;
  kind: 'dot' | 'puff' | 'spark' | 'streak';
  spin: number;
  rot: number;
};

export class Scene {
  readonly cv: HTMLCanvasElement;
  readonly g: CanvasRenderingContext2D;
  /** Logical size; paint in these units. */
  readonly W: number;
  readonly H: number;
  /** Seconds since the scene was (re)started; drive idle wobbles from this. */
  time = 0;

  private tweens: TweenRec[] = [];
  private parts: Particle[] = [];
  private shakeT = 0;
  private shakeAmp = 0;
  private flashT = 0;
  private flashColor = '#fff7e0';
  private hitstopT = 0;

  constructor(w = 640, h = 340) {
    this.W = w;
    this.H = h;
    this.cv = document.createElement('canvas');
    const dpr = Math.min(2, (globalThis.devicePixelRatio as number | undefined) ?? 1);
    this.cv.width = w * dpr;
    this.cv.height = h * dpr;
    this.cv.style.width = '100%';
    this.cv.style.borderRadius = '6px';
    this.cv.style.display = 'block';
    const g = this.cv.getContext('2d');
    if (!g) throw new Error('2d context unavailable');
    this.g = g;
    g.scale(dpr, dpr);
    g.imageSmoothingEnabled = true;
    g.imageSmoothingQuality = 'high';
  }

  /** Reset clocks and effects when a panel (re)opens. */
  restart() {
    this.time = 0;
    this.tweens.length = 0;
    this.parts.length = 0;
    this.shakeT = this.flashT = this.hitstopT = 0;
  }

  /** Animate a value; apply receives the eased value every frame. */
  tween(from: number, to: number, dur: number, ease: Ease, apply: (v: number) => void, done?: () => void) {
    this.tweens.push({ from, to, dur, t: 0, ease, apply, done });
  }

  /** A quick physical impact: tiny freeze + camera shake. */
  thump(amp = 5, freeze = 0.05) {
    this.shakeAmp = amp;
    this.shakeT = 0.28;
    this.hitstopT = freeze;
  }

  /** A soft full-frame glow, for wins and flashes of ghee-light. */
  flash(color = '#fff7e0', dur = 0.22) {
    this.flashColor = color;
    this.flashT = dur;
  }

  burst(x: number, y: number, opts: Partial<Particle> & { n?: number; spread?: number; speed?: number } = {}) {
    const n = opts.n ?? 10;
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = (opts.speed ?? 90) * (0.4 + Math.random() * 0.8);
      this.parts.push({
        x: x + (Math.random() - 0.5) * (opts.spread ?? 6),
        y: y + (Math.random() - 0.5) * (opts.spread ?? 6),
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - (opts.grav ?? 120) * 0.25,
        life: opts.life ?? 0.7,
        age: 0,
        size: opts.size ?? 3.5,
        color: opts.color ?? '#f2e6d0',
        grav: opts.grav ?? 120,
        drag: opts.drag ?? 2.2,
        kind: opts.kind ?? 'dot',
        spin: (Math.random() - 0.5) * 6,
        rot: Math.random() * Math.PI * 2,
      });
    }
  }

  /** Slow rising particles: steam over a deg, flour over a rolling board. */
  waft(x: number, y: number, color = 'rgba(255,252,244,0.35)', size = 7) {
    this.parts.push({
      x: x + (Math.random() - 0.5) * 10,
      y,
      vx: (Math.random() - 0.5) * 8,
      vy: -14 - Math.random() * 10,
      life: 1.6,
      age: 0,
      size,
      color,
      grav: -6,
      drag: 0.6,
      kind: 'puff',
      spin: 0,
      rot: 0,
    });
  }

  /**
   * Advance one frame and paint. Handles hit-stop, shake transform, particle
   * update/draw (over your paint), and the win flash. Returns dt actually
   * simulated (0 during hit-stop) so panels can pause their own motion.
   */
  frame(dt: number, paint: (g: CanvasRenderingContext2D) => void): number {
    if (this.hitstopT > 0) {
      this.hitstopT -= dt;
      dt = 0;
    }
    this.time += dt;

    for (let i = this.tweens.length - 1; i >= 0; i--) {
      const tw = this.tweens[i]!;
      tw.t = Math.min(tw.t + dt / tw.dur, 1);
      tw.apply(tw.from + (tw.to - tw.from) * tw.ease(tw.t));
      if (tw.t >= 1) {
        this.tweens.splice(i, 1);
        tw.done?.();
      }
    }

    const g = this.g;
    g.save();
    if (this.shakeT > 0) {
      this.shakeT -= dt;
      const k = (this.shakeT / 0.28) * this.shakeAmp;
      g.translate((Math.random() - 0.5) * k, (Math.random() - 0.5) * k);
    }
    paint(g);

    for (let i = this.parts.length - 1; i >= 0; i--) {
      const p = this.parts[i]!;
      p.age += dt;
      if (p.age >= p.life) {
        this.parts.splice(i, 1);
        continue;
      }
      p.vy += p.grav * dt;
      p.vx -= p.vx * p.drag * dt;
      p.vy -= p.vy * p.drag * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rot += p.spin * dt;
      const k = 1 - p.age / p.life;
      g.globalAlpha = p.kind === 'puff' ? k * 0.5 : k;
      g.fillStyle = p.color;
      if (p.kind === 'streak') {
        g.save();
        g.translate(p.x, p.y);
        g.rotate(Math.atan2(p.vy, p.vx));
        g.fillRect(-p.size, -1, p.size * 2, 2);
        g.restore();
      } else {
        const r = p.kind === 'puff' ? p.size * (1 + p.age * 0.9) : p.size * k;
        g.beginPath();
        g.arc(p.x, p.y, r, 0, Math.PI * 2);
        g.fill();
      }
    }
    g.globalAlpha = 1;

    if (this.flashT > 0) {
      this.flashT -= dt;
      g.globalAlpha = Math.max(0, this.flashT / 0.22) * 0.5;
      g.fillStyle = this.flashColor;
      g.fillRect(-20, -20, this.W + 40, this.H + 40);
      g.globalAlpha = 1;
    }
    g.restore();
    return dt;
  }
}

/**
 * Standard panel chrome: the journal-page frame every minigame lives in.
 * Returns the scene plus a hint setter; panels keep their existing root and
 * CSS classes so the pause/backdrop styling is untouched.
 */
export function mountScene(root: HTMLElement, title: string, scene: Scene): { setHint: (h: string) => void } {
  root.innerHTML = `
    <div class="w-panel">
      <div class="w-title">${title}</div>
      <div class="g-stage"></div>
      <div class="w-hint"></div>
    </div>`;
  root.querySelector('.g-stage')?.appendChild(scene.cv);
  const hintEl = root.querySelector('.w-hint') as HTMLElement | null;
  let last = '';
  return {
    setHint(h: string) {
      if (h === last || !hintEl) return;
      last = h;
      hintEl.innerHTML = h;
    },
  };
}

/** Draw with squash and stretch about (x, y): sy < 1 squashes, > 1 stretches. */
export function squashed(
  g: CanvasRenderingContext2D,
  x: number,
  y: number,
  sx: number,
  sy: number,
  draw: (g: CanvasRenderingContext2D) => void,
) {
  g.save();
  g.translate(x, y);
  g.scale(sx, sy);
  g.translate(-x, -y);
  draw(g);
  g.restore();
}
