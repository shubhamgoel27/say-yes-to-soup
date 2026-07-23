import type { Dir } from '../../engine/input';
import type { AudioBus } from '../../engine/audio';

/**
 * Busan's hands-on verb: the hotteok griddle.
 *
 * HotteokPanel: three discs of dough, one spatula, one moment each. A heat
 * marker slides across the griddle track; press Space inside the golden zone
 * to flip clean. There is no failing: a mistimed press just browns one past
 * gold, and burnt ones are for the cook. Nothing wasted, nobody shamed.
 */

type HotteokPhase = 'press' | 'done';

const ROUNDS = 3;

export class HotteokPanel {
  private phase: HotteokPhase = 'press';
  private round = 0;
  private golden = 0;
  private burnt = 0;
  private t = 0; // marker position 0..1, ping-ponging
  private dirn = 1;
  private speed = 0.55;
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
    this.phase = 'press';
    this.round = 0;
    this.golden = 0;
    this.burnt = 0;
    this.t = 0;
    this.dirn = 1;
    this.speed = 0.55;
    this.hint = 'The dough sizzles. Space when the heat sits in the golden middle.';
    this.root.hidden = false;
    this.render();
  }

  tick(dt: number) {
    if (!this.isOpen || this.phase !== 'press') return;
    this.t += this.dirn * this.speed * dt;
    if (this.t > 1) {
      this.t = 1;
      this.dirn = -1;
    } else if (this.t < 0) {
      this.t = 0;
      this.dirn = 1;
    }
    this.render();
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
    // The golden middle of the griddle.
    const inZone = this.t >= 0.38 && this.t <= 0.62;
    this.round++;
    if (inZone) {
      this.golden++;
      this.audio.slosh();
      this.hint = [
        'A clean flip. The seeds stay tucked in the fold.',
        'Gold both sides. Mi-ja nods without looking.',
        'The sugar sighs inside. That is the sound of correct.',
      ][(this.golden - 1) % 3] as string;
    } else {
      this.burnt++;
      this.audio.bump();
      this.hint = 'A beat late. This one browns past gold. "For the cook," says Mi-ja, unbothered.';
    }
    if (this.round >= ROUNDS) {
      this.phase = 'done';
      this.audio.weaveDone();
      this.hint =
        this.burnt === 0
          ? 'Three golden. Dae-ho pretends not to be impressed and fails. Press Space.'
          : 'The batch is done and every one of them gets eaten. Press Space.';
    } else {
      this.t = 0;
      this.dirn = 1;
      this.speed += 0.16;
      this.hint += ` Next disc: ${ROUNDS - this.round} to go.`;
    }
    this.render();
  }

  private render() {
    const pct = Math.max(0, Math.min(100, this.t * 100));
    const marks = '&#9679;'.repeat(this.golden) + '&#9675;'.repeat(this.burnt) + '&#183;'.repeat(ROUNDS - this.round);
    const iron = 'background:linear-gradient(#6a5f52,#3a332c)';
    const zone =
      'left:38%;width:24%;border-left:2px dashed rgba(242,230,208,0.7);background:rgba(217,164,65,0.4)';
    const spat = `left:${pct}%;background:linear-gradient(#f6e3b0,#d9a441)`;
    const track =
      this.phase === 'press'
        ? `<div class="c-track" style="${iron}">
             <div class="c-zone" style="${zone}"></div>
             <div class="c-wave" style="${spat}"></div>
           </div>
           <div class="c-count">${marks}</div>`
        : `<div class="c-track" style="${iron}">
             <div class="c-zone wide" style="background:rgba(217,164,65,0.3)"></div>
           </div>
           <div class="c-count">${marks} off the griddle</div>`;
    this.root.innerHTML = `
      <div class="w-panel">
        <div class="w-title">The Hotteok Griddle</div>
        ${track}
        <div class="w-hint">${this.hint}</div>
      </div>`;
  }
}
