import type { Dir } from '../../engine/input';
import type { AudioBus } from '../../engine/audio';

/**
 * Kingyo-sukui: goldfish scooping at the Tanabata stalls.
 *
 * A paper poi, a tub of goldfish, and physics that forgive. Each dip soaks
 * the paper whether you catch or not; when the poi finally gives way the
 * game ends warmly. There is no fail state: scoop nothing at all and the
 * stall uncle scoops one himself and hands you the bag anyway.
 */

type Fish = { x: number; v: number; deep: boolean };

export class KingyoPanel {
  private fish: Fish[] = [];
  private cx = 0.5; // the poi's position over the tub, 0..1
  private soak = 0; // 0..100; at 100 the paper gives way
  private caught = 0;
  private phase: 'scoop' | 'done' = 'scoop';
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
      });
    }
    this.hint = 'The poi is paper. Arrows to drift it, Space to scoop. Gently.';
    this.root.hidden = false;
    this.render();
  }

  tick(dt: number) {
    if (!this.isOpen || this.phase !== 'scoop') return;
    for (const f of this.fish) {
      f.x += f.v * dt * 0.35;
      if (f.x < 0.04 || f.x > 0.96) f.v = -f.v;
      if (Math.random() < dt * 0.4) f.v = (Math.random() - 0.5) * 0.6;
      if (Math.random() < dt * 0.25) f.deep = !f.deep;
    }
    // Paper soaks just by hovering near the water. It was always going to.
    this.soak = Math.min(100, this.soak + dt * 3);
    if (this.soak >= 100) this.finish();
    this.render();
  }

  onDir(dir: Dir) {
    if (this.phase !== 'scoop') return;
    if (dir === 'left') this.cx = Math.max(0.04, this.cx - 0.07);
    if (dir === 'right') this.cx = Math.min(0.96, this.cx + 0.07);
    this.render();
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
    const idx = this.fish.findIndex((f) => !f.deep && Math.abs(f.x - this.cx) < 0.09);
    if (idx >= 0) {
      this.fish.splice(idx, 1);
      this.caught++;
      this.audio.slosh();
      this.audio.weaveNote(this.caught % 7);
      this.soak = Math.min(100, this.soak + 18);
      this.hint = ['One! Level wrist, says the uncle.', 'Two! The uncle raises an eyebrow.', 'Three! Now you are showing off.'][
        Math.min(this.caught - 1, 2)
      ] as string;
      if (this.caught >= 3 || this.fish.length === 0) this.finish();
    } else {
      this.audio.slosh();
      this.soak = Math.min(100, this.soak + 26);
      this.hint = this.fish.some((f) => f.deep && Math.abs(f.x - this.cx) < 0.09)
        ? 'That one dove. The poi drinks the tub instead.'
        : 'Water, beautifully scooped. The paper darkens.';
    }
    this.render();
  }

  private finish() {
    this.phase = 'done';
    this.audio.weaveDone();
    this.hint =
      this.caught === 0
        ? 'The poi gives way. The uncle laughs, scoops one himself, and hands you the bag anyway. Space.'
        : this.caught === 1
          ? 'The paper sighs and lets go. One goldfish, bagged with ceremony. Space.'
          : `The paper sighs and lets go. ${this.caught} goldfish, bagged with ceremony. Space.`;
  }

  private render() {
    const fishSpans = this.fish
      .map(
        (f) =>
          `<div style="position:absolute;left:${(f.x * 100).toFixed(1)}%;top:${f.deep ? 68 : 40}%;width:14px;height:8px;margin-left:-7px;border-radius:50%;background:${f.deep ? '#a8642f' : '#e8862f'};opacity:${f.deep ? 0.55 : 1};box-shadow:0 0 6px rgba(232,134,47,0.5)"></div>`,
      )
      .join('');
    const poi = `<div style="position:absolute;left:${(this.cx * 100).toFixed(1)}%;top:8%;width:26px;height:26px;margin-left:-13px;border-radius:50%;border:3px solid #c1512f;background:rgba(242,230,208,${Math.max(0.15, 0.9 - this.soak / 130)});"></div>`;
    const tub = `<div style="position:relative;height:84px;border-radius:12px;background:linear-gradient(#7fb5c9,#4e8fa6);overflow:hidden;margin:8px 0">${fishSpans}${this.phase === 'scoop' ? poi : ''}</div>`;
    const meter = `<div style="height:8px;border-radius:4px;background:rgba(0,0,0,0.25);overflow:hidden"><div style="height:100%;width:${this.soak.toFixed(0)}%;background:linear-gradient(90deg,#c9a35f,#c1512f)"></div></div>`;
    this.root.innerHTML = `
      <div class="w-panel">
        <div class="w-title">Kingyo-sukui</div>
        ${tub}
        <div style="font-size:11px;opacity:0.8;margin-bottom:2px">the paper poi ${'&#9679;'.repeat(this.caught)}</div>
        ${meter}
        <div class="w-hint">${this.hint}</div>
      </div>`;
  }
}
