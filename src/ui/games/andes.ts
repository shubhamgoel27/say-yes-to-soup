import type { Dir } from '../../engine/input';
import type { AudioBus } from '../../engine/audio';

/**
 * The highlands' hands-on verb: the watia earth oven, built with Justina at
 * the terrace edge after the dig.
 *
 * WatiaPanel: three phases, none failable.
 *  1. stack: five clods placed with the arrows and Space; they rise into a
 *     little dome over the papas.
 *  2. fire: rhythm presses feed the mouth of the oven until the clods glow.
 *     Overfeeding is not a mistake, it is a show; Justina just whistles.
 *  3. collapse: one committed press brings the dome down on the papas, which
 *     is the whole point and the best part.
 */

type WatiaPhase = 'stack' | 'fire' | 'collapse' | 'done';

/** Slot positions along the dome arc, in percent of the scene box. */
const SLOTS: { x: number; y: number; s: number }[] = [
  { x: 22, y: 74, s: 30 }, // left footing
  { x: 66, y: 74, s: 30 }, // right footing
  { x: 27, y: 56, s: 26 }, // left shoulder
  { x: 61, y: 56, s: 26 }, // right shoulder
  { x: 44, y: 44, s: 24 }, // the crown
];

export class WatiaPanel {
  private phase: WatiaPhase = 'stack';
  private placed: boolean[] = [];
  private cursor = 0;
  private glow = 0; // 0..1 the clods' heat
  private best = 0; // highest glow reached, for the overshoot whistle
  private pulse = 0; // fire flicker clock
  private fallen = false;
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
    this.phase = 'stack';
    this.placed = SLOTS.map(() => false);
    this.cursor = 0;
    this.glow = 0;
    this.best = 0;
    this.pulse = 0;
    this.fallen = false;
    this.hint = 'Big ones at the bottom. Arrows pick a spot; Space sets the clod.';
    this.root.hidden = false;
    this.render();
  }

  tick(dt: number) {
    if (!this.isOpen) return;
    this.pulse += dt;
    if (this.phase === 'fire') {
      this.glow = Math.max(0, this.glow - dt * 0.055);
      this.render();
    } else if (this.phase === 'collapse') {
      // Keep the embers breathing while the moment gathers.
      this.render();
    }
  }

  onDir(dir: Dir) {
    if (this.phase !== 'stack') return;
    if (dir === 'left' || dir === 'up') this.cursor = (this.cursor + SLOTS.length - 1) % SLOTS.length;
    if (dir === 'right' || dir === 'down') this.cursor = (this.cursor + 1) % SLOTS.length;
    this.render();
  }

  onAction() {
    if (this.phase === 'stack') {
      if (this.placed[this.cursor]) {
        this.audio.bump();
        this.hint = 'That one is set. The dome wants a gap filled, not a clod polished.';
      } else {
        this.placed[this.cursor] = true;
        this.audio.dig();
        const left = this.placed.filter((p) => !p).length;
        this.hint =
          left > 0
            ? `Good. It holds. ${left} more and the little house has a roof.`
            : 'A dome! Crooked, and standing anyway. Now the fire goes in the mouth.';
        if (left === 0) {
          this.phase = 'fire';
          this.glow = 0.12;
          this.hint = 'Feed the fire: press Space with the flame, steady as a heartbeat.';
        }
      }
      this.render();
    } else if (this.phase === 'fire') {
      this.glow = Math.min(1.35, this.glow + 0.11);
      this.best = Math.max(this.best, this.glow);
      this.audio.weaveNote(Math.floor(this.glow * 6));
      if (this.glow >= 1) {
        this.phase = 'collapse';
        this.hint =
          this.best > 1.2
            ? 'Justina whistles, long and low. The clods are practically stars. Space: bring it all down on the papas.'
            : 'The clods glow like a small sunset. Space: bring the dome down on the papas.';
      } else if (this.glow > 0.75) {
        this.hint = 'Almost. The clods are blushing. Keep the rhythm.';
      } else {
        this.hint = 'The fire eats and asks for more. Steady presses, like a heartbeat.';
      }
      this.render();
    } else if (this.phase === 'collapse') {
      this.fallen = true;
      this.phase = 'done';
      this.audio.weaveDone();
      this.hint = 'WHUMP. Earth over embers over papas. The field is cooking its own. Press Space.';
      this.render();
    } else if (this.phase === 'done') {
      this.root.hidden = true;
      const done = this.onDone;
      this.onDone = null;
      done?.();
    }
  }

  private clodColor(i: number): string {
    if (this.phase === 'stack') return '#6b4a32';
    const g = Math.min(1, this.glow);
    const flick = 0.92 + 0.08 * Math.sin(this.pulse * 7 + i * 1.7);
    const r = Math.round((107 + 148 * g) * flick);
    const gr = Math.round(74 + 40 * g * flick);
    return `rgb(${Math.min(255, r)},${gr},${Math.round(50 - 20 * g)})`;
  }

  private render() {
    const flame =
      this.phase === 'fire'
        ? `<div style="position:absolute;left:44%;top:60%;width:12%;height:16%;border-radius:50% 50% 40% 40%;
             background:radial-gradient(ellipse at 50% 80%, #ffd75e, #e8722c 65%, transparent 75%);
             transform:scaleY(${1 + 0.2 * Math.sin(this.pulse * 6)});opacity:.95"></div>`
        : '';
    const clods = SLOTS.map((s, i) => {
      const there = this.placed[i];
      const falling = this.fallen ? 'top:72%;' : `top:${s.y}%;`;
      const cur = this.phase === 'stack' && i === this.cursor;
      const body = there
        ? `<div style="position:absolute;left:${s.x + (this.fallen ? (i % 2 ? 4 : -4) : 0)}%;${falling}width:${s.s * 0.55}%;height:${s.s * 0.38}%;
             border-radius:46% 54% 50% 50%;background:${this.clodColor(i)};
             box-shadow:0 2px 4px rgba(0,0,0,.35)${this.phase !== 'stack' && !this.fallen ? `,0 0 ${10 + this.glow * 16}px rgba(255,140,40,${0.25 + Math.min(1, this.glow) * 0.5})` : ''};
             transition:top .5s ease-in"></div>`
        : '';
      const ghost =
        this.phase === 'stack' && !there
          ? `<div style="position:absolute;left:${s.x}%;top:${s.y}%;width:${s.s * 0.55}%;height:${s.s * 0.38}%;
               border-radius:46% 54% 50% 50%;border:2px dashed ${cur ? '#f4d06f' : 'rgba(255,255,255,.25)'};
               ${cur ? 'box-shadow:0 0 10px rgba(244,208,111,.5);' : ''}"></div>`
          : '';
      const ring =
        cur && there
          ? `<div style="position:absolute;left:${s.x - 1}%;top:${s.y - 2}%;width:${s.s * 0.62}%;height:${s.s * 0.46}%;
               border-radius:50%;border:2px solid #f4d06f"></div>`
          : '';
      return body + ghost + ring;
    }).join('');
    const papas = `
      <div style="position:absolute;left:38%;top:78%;width:7%;height:5%;border-radius:50%;background:#c9a35f"></div>
      <div style="position:absolute;left:46%;top:80%;width:6%;height:5%;border-radius:48% 52% 55% 45%;background:#8a5a86"></div>
      <div style="position:absolute;left:53%;top:78%;width:7%;height:5%;border-radius:55% 45% 50% 50%;background:#b8803e"></div>`;
    const meter =
      this.phase === 'fire'
        ? `<div style="margin:8px auto 0;width:70%;height:10px;border-radius:5px;background:rgba(0,0,0,.35);overflow:hidden">
             <div style="width:${Math.min(100, this.glow * 100)}%;height:100%;border-radius:5px;
               background:linear-gradient(90deg,#8a4a2e,#e8722c,#ffd75e);transition:width .12s"></div>
           </div>`
        : '';
    const steam =
      this.phase === 'done'
        ? `<div style="position:absolute;left:46%;top:30%;width:8%;height:34%;opacity:.55;
             background:radial-gradient(ellipse at 50% 100%, rgba(255,255,255,.75), transparent 70%);
             border-radius:50%"></div>`
        : '';
    this.root.innerHTML = `
      <div class="w-panel">
        <div class="w-title">The Watia</div>
        <div style="position:relative;margin:6px auto;width:min(340px,86vw);height:180px;
          background:linear-gradient(#2e2418,#3d2f1e 70%,#54422a);border-radius:10px;overflow:hidden">
          <div style="position:absolute;left:10%;top:82%;width:80%;height:10%;border-radius:50%;background:#241a10"></div>
          ${papas}${flame}${clods}${steam}
        </div>
        ${meter}
        <div class="w-hint">${this.hint}</div>
      </div>`;
  }
}
