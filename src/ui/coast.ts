import type { Dir } from '../engine/input';
import type { AudioBus } from '../engine/audio';

/**
 * The coast's two hands-on verbs.
 *
 * WavePanel: kneel on a caballito, punch through three waves with a well-timed
 * paddle, then balance the ride home. Forgiving on purpose: a mistimed paddle
 * just pushes you back a little; the ride cannot be failed, only wobbled.
 *
 * NetPanel: the evening net circle. No timer, no failure. Walk the shuttle to
 * each hole and tie it shut; the day mends alongside.
 */

// ---------------------------------------------------------------- the ride

type WavePhase = 'paddle' | 'ride' | 'done';

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
    this.render();
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
      }
      this.render();
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
      }
      this.render();
    }
  }

  onDir(dir: Dir) {
    if (this.phase !== 'ride') return;
    if (dir === 'left') this.balance -= 0.16;
    if (dir === 'right') this.balance += 0.16;
  }

  onAction() {
    if (this.phase === 'paddle') {
      // The strike zone: the wave is on top of you.
      if (this.x <= 0.22 && this.x >= -0.06) {
        this.waves++;
        this.audio.slosh();
        if (this.waves >= 3) {
          this.phase = 'ride';
          this.hint = 'Past the break. Now the wave home: hold the middle with the arrows.';
        } else {
          this.x = 1;
          this.speed += 0.12;
          this.hint = `Through! ${3 - this.waves} more between you and open water.`;
        }
      } else {
        this.audio.bump();
        this.hint = 'Too eager. Let the swell reach the horse first.';
      }
      this.render();
    } else if (this.phase === 'done') {
      this.root.hidden = true;
      const done = this.onDone;
      this.onDone = null;
      done?.();
    }
  }

  private render() {
    const wavePct = Math.max(0, Math.min(100, this.x * 100));
    const track =
      this.phase === 'paddle'
        ? `<div class="c-track">
             <div class="c-zone"></div>
             <div class="c-horse"></div>
             <div class="c-wave" style="left:${wavePct}%"></div>
           </div>
           <div class="c-count">${'&#9679;'.repeat(this.waves)}${'&#9675;'.repeat(3 - this.waves)}</div>`
        : `<div class="c-track">
             <div class="c-zone wide"></div>
             <div class="c-rider" style="left:${50 + this.balance * 44}%"></div>
           </div>
           <div class="c-count">${this.phase === 'done' ? 'ashore' : `${Math.max(0, 4 - this.rideT).toFixed(1)}s`}</div>`;
    this.root.innerHTML = `
      <div class="w-panel">
        <div class="w-title">The Caballito</div>
        ${track}
        <div class="w-hint">${this.hint}</div>
      </div>`;
  }
}

// ---------------------------------------------------------------- the nets

const NET_W = 9;
const NET_H = 5;

export class NetPanel {
  private holes = new Set<number>();
  private cur = 0;
  private hint = '';
  private done = false;
  private onDone: (() => void) | null = null;

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
    this.render();
  }

  onDir(dir: Dir) {
    if (this.done) return;
    const x = this.cur % NET_W;
    const y = Math.floor(this.cur / NET_W);
    const nx = Math.max(0, Math.min(NET_W - 1, x + (dir === 'left' ? -1 : dir === 'right' ? 1 : 0)));
    const ny = Math.max(0, Math.min(NET_H - 1, y + (dir === 'up' ? -1 : dir === 'down' ? 1 : 0)));
    this.cur = ny * NET_W + nx;
    this.render();
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
      this.hint = ['A cousin in Lima...', 'Prices, weather...', 'That pelican again...', 'Knot by knot.'][
        this.holes.size % 4
      ] as string;
      if (this.holes.size === 0) {
        this.done = true;
        this.audio.weaveDone();
        this.hint = 'The net is whole. So, somehow, is the evening. Press Space.';
      }
    } else {
      this.audio.blip();
      this.hint = 'That mesh holds. Find the gaps.';
    }
    this.render();
  }

  private render() {
    const cells = Array.from({ length: NET_W * NET_H }, (_, i) => {
      const hole = this.holes.has(i);
      const cur = i === this.cur;
      return `<div class="n-cell${hole ? ' hole' : ''}${cur ? ' cur' : ''}"></div>`;
    }).join('');
    this.root.innerHTML = `
      <div class="w-panel">
        <div class="w-title">The Net Circle</div>
        <div class="n-grid" style="grid-template-columns:repeat(${NET_W},1fr)">${cells}</div>
        <div class="w-hint">${this.hint}</div>
      </div>`;
  }
}
