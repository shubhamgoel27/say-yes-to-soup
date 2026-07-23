import type { Dir } from '../../engine/input';
import type { AudioBus } from '../../engine/audio';

/**
 * The coast's hands-on verb: trimming a ngalawa's lateen sail on the kaskazi.
 *
 * The wind arrow wanders; you ease the sheet with left/right so the sail
 * angle stays inside the wind's good zone. When the telltale streams, you
 * make way. Luffing cannot hurt you; it only slows you down, which on this
 * coast is barely a punishment at all.
 */

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
    this.render();
  }

  tick(dt: number) {
    if (!this.isOpen || this.phase !== 'sail') return;
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
    if (trimmed && !this.wasTrim) this.audio.slosh();
    this.wasTrim = trimmed;
    this.dist += dt * (trimmed ? 1 : 0.15);
    this.hint = trimmed
      ? 'The telltale streams. The hull hums; the outriggers barely kiss the water.'
      : 'The sail luffs and grumbles. No harm done; you just slow. Follow the wind arrow with the arrows.';
    if (this.dist >= this.need) {
      this.phase = 'done';
      this.audio.weaveDone();
      this.hint = 'Bakari puts the tiller over and the village swings back into view. Press Space to come ashore.';
    }
    this.render();
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

  private render() {
    const zoneLeft = Math.max(0, Math.min(78, (this.wind - 0.11) * 100));
    const sailPct = 4 + this.sail * 92;
    const arrowDeg = 25 + (this.wind - 0.5) * 60; // NE-ish, wandering
    const trimmed = Math.abs(this.sail - this.wind) < 0.11;
    const pct = Math.min(100, Math.round((this.dist / this.need) * 100));
    this.root.innerHTML = `
      <div class="w-panel">
        <div class="w-title">The Kaskazi</div>
        <div style="font-size:13px;margin-bottom:2px;">wind
          <span style="display:inline-block;transform:rotate(${arrowDeg}deg);font-size:18px;">&#10148;</span>
          &nbsp; telltale: <em>${this.phase === 'done' ? 'ashore' : trimmed ? 'streaming' : 'fluttering'}</em>
        </div>
        <div class="c-track">
          <div class="c-zone" style="left:${zoneLeft}%;width:22%;"></div>
          <div class="c-rider" style="left:${sailPct}%;"></div>
        </div>
        <div class="c-count">${pct}% of the reach sailed</div>
        <div class="w-hint">${this.hint}</div>
      </div>`;
  }
}
