import type { Dir } from '../engine/input';
import type { AudioBus } from '../engine/audio';

/**
 * The weaving mini-game: Carmen calls a color sequence, you call it back with
 * the arrow keys, and each color is a note, so a woven row is also a little
 * tune. Forgiving on purpose: a miss just means she calls the row again.
 * Three rows and the cloth takes you in.
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

export class WeavePanel {
  private phase: Phase = 'show';
  private row = 0;
  private seq: number[] = [];
  private at = 0; // reveal index or input index
  private t = 0;
  private lit: number | null = null;
  private woven: number[][] = [];
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
    this.row = 0;
    this.woven = [];
    this.root.hidden = false;
    this.startRow();
  }

  private startRow() {
    const len = ROWS[this.row] ?? 3;
    this.seq = Array.from({ length: len }, () => Math.floor(Math.random() * COLORS.length));
    this.phase = 'show';
    this.at = 0;
    this.t = 0;
    this.lit = null;
    this.render('Watch the colors Carmen calls...');
  }

  /** Driven by the fixed-timestep loop so it behaves under the dev sim too. */
  tick(dt: number) {
    if (!this.isOpen || this.phase !== 'show') return;
    this.t += dt;
    const step = Math.floor(this.t / SHOW_STEP);
    if (step < this.seq.length) {
      const idx = this.seq[step] ?? 0;
      if (this.lit !== step) {
        this.lit = step;
        this.audio.weaveNote(COLORS[idx]?.note ?? 0);
        this.render('Watch the colors Carmen calls...', step);
      }
    } else {
      this.phase = 'input';
      this.at = 0;
      this.lit = null;
      this.render('Now you. Call them back with the arrows.');
    }
  }

  onDir(dir: Dir) {
    if (this.phase !== 'input') return;
    const picked = COLORS.findIndex((c) => c.dir === dir);
    if (picked < 0) return;
    const want = this.seq[this.at];
    if (picked === want) {
      this.audio.weaveNote(COLORS[picked]?.note ?? 0);
      this.at++;
      this.render('Now you. Call them back with the arrows.', undefined, this.at);
      if (this.at >= this.seq.length) {
        this.woven.push([...this.seq]);
        this.row++;
        if (this.row >= ROWS.length) {
          this.phase = 'done';
          this.audio.weaveDone();
          this.render('The row holds. Carmen nods. Press Space.');
        } else {
          this.phase = 'row-done';
          this.render('Good. The next row is longer.');
        }
      }
    } else {
      this.audio.weaveNote(0, false);
      this.at = 0;
      this.phase = 'show';
      this.t = 0;
      this.lit = null;
      this.render('The thread slips. Carmen chuckles and calls it again.');
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

  private render(hint: string, litStep?: number, progress = 0) {
    const swatches = this.seq
      .map((c, i) => {
        const on =
          (this.phase === 'show' && litStep === i) ||
          (this.phase === 'input' && i < progress) ||
          this.phase === 'row-done' ||
          this.phase === 'done';
        return `<div class="w-cell${on ? ' on' : ''}" style="background:${on ? (COLORS[c]?.hex ?? '#fff') : 'rgba(43,33,24,0.15)'}"></div>`;
      })
      .join('');

    const cloth = this.woven
      .map(
        (row) =>
          `<div class="w-row">${row.map((c) => `<span style="background:${COLORS[c]?.hex}"></span>`).join('')}</div>`,
      )
      .join('');

    const legend = COLORS.map(
      (c) => `<span class="w-key"><b>${arrow(c.dir)}</b><i style="background:${c.hex}"></i></span>`,
    ).join('');

    this.root.innerHTML = `
      <div class="w-panel">
        <div class="w-title">The Loom</div>
        <div class="w-cloth">${cloth || '<div class="w-empty">an unwoven row waits</div>'}</div>
        <div class="w-seq">${swatches}</div>
        <div class="w-hint">${hint}</div>
        <div class="w-legend">${legend}</div>
      </div>`;
  }
}

function arrow(d: Dir): string {
  return d === 'up' ? '&#8593;' : d === 'down' ? '&#8595;' : d === 'left' ? '&#8592;' : '&#8594;';
}
