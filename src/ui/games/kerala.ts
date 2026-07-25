import type { Dir } from '../../engine/input';
import type { AudioBus } from '../../engine/audio';

/**
 * The backwater's two hands-on verbs.
 *
 * RowPanel: a seat in the chundan vallam. The vanchipattu is the engine: the
 * lead singer calls, the crew answers, and the oars strike exactly on the
 * beat. Press on the beat and the boat surges; miss and the stroke is ragged,
 * but the song forgives. There is no failure, only rhythm found late.
 *
 * SadyaPanel: serving the banana-leaf feast. Every dish has its place on the
 * leaf; wrong placements earn warm auntie corrections, never scoldings. Ends
 * with the leaf-fold question, on which the aunties have never once agreed.
 */

// ------------------------------------------------------------- the rowing

const CALLS = [
  'Aarppo! Irro irro irro!',
  'Thithithara thithithai...',
  'Kuthippin makkale, kuthippin!',
  'Aaaarppo! The channel answers back.',
];

type RowPhase = 'row' | 'done';

export class RowPanel {
  private phase: RowPhase = 'row';
  private x = 1; // the beat marker, 1 -> 0 across the track
  private speed = 0.5;
  private progress = 0;
  private good = 0;
  private call = 0;
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
    this.phase = 'row';
    this.x = 1;
    this.speed = 0.5;
    this.progress = 0;
    this.good = 0;
    this.call = 0;
    this.hint = 'The singer calls; the oars answer. Space exactly as the beat reaches the blades.';
    this.root.hidden = false;
    this.render();
  }

  tick(dt: number) {
    if (!this.isOpen || this.phase !== 'row') return;
    this.x -= dt * this.speed;
    if (this.x < -0.08) {
      // A beat sailed past unstruck. The boat glides; the song circles back.
      this.x = 1;
      this.hint = 'The beat comes around again. The song waits for no one, and forgives everyone.';
    }
    this.render();
  }

  onDir(_dir: Dir) {
    // The song sets the course; you only have to be on time.
  }

  onAction() {
    if (this.phase === 'row') {
      if (this.x <= 0.22 && this.x >= -0.06) {
        this.good++;
        this.progress = Math.min(1, this.progress + 0.13);
        this.speed += 0.04;
        this.audio.slosh();
        this.call = (this.call + 1) % CALLS.length;
        this.hint = `${CALLS[this.call]} A hundred blades bite as one, and the boat SURGES.`;
      } else {
        this.progress = Math.min(1, this.progress + 0.03);
        this.audio.bump();
        this.hint = 'Ragged. Your oar slaps alone; the song scoops you back onto the beat.';
      }
      this.x = 1;
      if (this.progress >= 1) {
        this.phase = 'done';
        this.audio.weaveDone();
        this.hint = 'The finish post flies past. Somewhere behind you, the whole bank is roaring. Press Space.';
      }
      this.render();
    } else {
      this.root.hidden = true;
      const done = this.onDone;
      this.onDone = null;
      done?.();
    }
  }

  private render() {
    const beatPct = Math.max(0, Math.min(100, this.x * 100));
    const prog = Math.round(this.progress * 100);
    const track =
      this.phase === 'row'
        ? `<div class="c-track">
             <div class="c-zone"></div>
             <div class="c-horse"></div>
             <div class="c-wave" style="left:${beatPct}%"></div>
           </div>
           <div class="c-count">${prog}m of 100 &middot; ${this.good} clean strokes</div>`
        : `<div class="c-track"><div class="c-zone wide"></div></div>
           <div class="c-count">across the line</div>`;
    this.root.innerHTML = `
      <div class="w-panel">
        <div class="w-title">The Chundan Vallam</div>
        ${track}
        <div class="w-hint">${this.hint}</div>
      </div>`;
  }
}

// ------------------------------------------------------------- the sadya

/** Slots on the leaf, 3 columns x 2 rows. Narrow end of the leaf points left. */
const SLOTS = ['inji puli', 'thoran', 'avial', 'banana', 'rice', 'pappadam'];

/** Serving order, each with its home slot and its auntie correction. */
const COURSES: { item: string; slot: number; oops: string }[] = [
  { item: 'pappadam', slot: 5, oops: 'Auntie Leela taps your wrist. "Pappadam sits low, mone, bottom right. It likes company with the rice."' },
  { item: 'inji puli', slot: 0, oops: 'Auntie Rosamma clicks her tongue kindly. "Pickles go top left, where the narrow end points. Small things, small corner."' },
  { item: 'thoran', slot: 1, oops: '"Thoran up top, in the middle," Auntie Leela says, steering your hand with two fingers. "It has always lived there."' },
  { item: 'avial', slot: 2, oops: '"Avial keeps the top right seat," says Auntie Rosamma. "It is the eldest of the vegetables. Respect."' },
  { item: 'banana', slot: 3, oops: 'Auntie Leela smiles. "The banana waits at bottom left, mole. Dessert should be visible but not ambitious."' },
  { item: 'rice', slot: 4, oops: '"Rice last, rice center," both aunties say together, delighted to finally agree on something.' },
];

type SadyaPhase = 'serve' | 'fold' | 'gag' | 'done';

export class SadyaPanel {
  private phase: SadyaPhase = 'serve';
  private placed: (string | null)[] = [];
  private course = 0;
  private cur = 0;
  private fold: 'toward' | 'away' = 'toward';
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
    this.phase = 'serve';
    this.placed = [null, null, null, null, null, null];
    this.course = 0;
    this.cur = 0;
    this.fold = 'toward';
    this.hint = 'Narrow end of the leaf points left. Arrows choose a spot; Space serves the pappadam. Right hand only.';
    this.root.hidden = false;
    this.render();
  }

  onDir(dir: Dir) {
    if (this.phase === 'serve') {
      const x = this.cur % 3;
      const y = Math.floor(this.cur / 3);
      const nx = Math.max(0, Math.min(2, x + (dir === 'left' ? -1 : dir === 'right' ? 1 : 0)));
      const ny = Math.max(0, Math.min(1, y + (dir === 'up' ? -1 : dir === 'down' ? 1 : 0)));
      this.cur = ny * 3 + nx;
      this.render();
    } else if (this.phase === 'fold') {
      if (dir === 'left') this.fold = 'toward';
      if (dir === 'right') this.fold = 'away';
      this.render();
    }
  }

  onAction() {
    if (this.phase === 'serve') {
      const c = COURSES[this.course];
      if (!c) return;
      if (this.cur === c.slot) {
        this.placed[c.slot] = c.item;
        this.audio.chime();
        this.course++;
        const next = COURSES[this.course];
        if (next) {
          this.hint = `Just so. Now the ${next.item}, with the right hand, like you have done this all your life.`;
        } else {
          this.phase = 'fold';
          this.hint = 'The leaf is full and correct. Now: fold it toward you, or away? Left and right choose; Space commits.';
        }
      } else {
        this.audio.blip();
        this.hint = c.oops;
      }
      this.render();
    } else if (this.phase === 'fold') {
      this.phase = 'gag';
      this.audio.weaveNote(3);
      this.hint =
        this.fold === 'toward'
          ? '"Toward you! Satisfied!" beams Auntie Leela. "Away means satisfied," says Auntie Rosamma, folding hers away. Press Space.'
          : '"Away, correct!" says Auntie Rosamma. "Toward you means satisfied," says Auntie Leela, folding hers toward. Press Space.';
      this.render();
    } else if (this.phase === 'gag') {
      this.phase = 'done';
      this.audio.weaveDone();
      this.hint = 'They argue happily over your folded leaf. Either way, the leaf says you ate well. Press Space.';
      this.render();
    } else {
      this.root.hidden = true;
      const done = this.onDone;
      this.onDone = null;
      done?.();
    }
  }

  private render() {
    const leafStyle =
      'background:#4d7440;border-radius:14px 40px 40px 14px;padding:10px;display:grid;' +
      'grid-template-columns:repeat(3,1fr);gap:6px;margin:8px 0;';
    const cells = SLOTS.map((slot, i) => {
      const has = this.placed[i];
      const cur = this.phase === 'serve' && i === this.cur;
      const style =
        `border-radius:8px;padding:6px 4px;text-align:center;font-size:11px;min-width:64px;` +
        `background:${has ? '#e8e0c8' : 'rgba(255,255,255,0.12)'};` +
        `color:${has ? '#3a2e22' : 'rgba(242,230,208,0.75)'};` +
        `outline:${cur ? '2px solid #f2e6d0' : 'none'};`;
      return `<div style="${style}">${has ?? slot}</div>`;
    }).join('');
    const serving =
      this.phase === 'serve'
        ? `<div class="c-count">serving: ${COURSES[this.course]?.item ?? ''}</div>`
        : this.phase === 'fold'
          ? `<div class="c-count">fold: ${this.fold === 'toward' ? '&larr; toward you' : 'away &rarr;'}</div>`
          : `<div class="c-count">the leaf is folded</div>`;
    this.root.innerHTML = `
      <div class="w-panel">
        <div class="w-title">The Sadya Leaf</div>
        <div style="${leafStyle}">${cells}</div>
        ${serving}
        <div class="w-hint">${this.hint}</div>
      </div>`;
  }
}

// ------------------------------------------------------------- the chaya pull

/**
 * ChayaPanel: the meter-long pour at Shaji's thattukada. First the boil, a
 * patience beat the kettle refuses to hurry. Then the pull, three times: Space
 * lifts the pouring arm and it keeps climbing; Space again lets the tea go.
 * Height is froth, and each pull wants more of it. Too low is not chaya, it is
 * surrender; too high spills, earns laughter and a wet counter, and costs
 * nothing. It ends with the glass and the question of the hand beneath it.
 */

const PULL_TARGETS = [0.5, 0.66, 0.82];

const PULL_PRAISE = [
  'A hand-span of air under the stream. The tea lands frothing, surprised at itself.',
  'Half a meter of falling chaya, not a drop astray. The froth climbs like a good rumor.',
  'The full meter. Tumbler to tumbler in one bronze arc, and the froth stands like a monsoon cloud.',
];

type ChayaPhase = 'boil' | 'pull' | 'serve' | 'done';

export class ChayaPanel {
  private phase: ChayaPhase = 'boil';
  private boil = 0;
  private stirs = 0;
  private pullIdx = 0;
  private arm = 0;
  private lifting = false;
  private spills = 0;
  private serve: 'flourish' | 'under' = 'under';
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
    this.phase = 'boil';
    this.boil = 0;
    this.stirs = 0;
    this.pullIdx = 0;
    this.arm = 0;
    this.lifting = false;
    this.spills = 0;
    this.serve = 'under';
    this.hint = 'Milk and tea over the flame. Nothing to press yet; the boil is the boil.';
    this.root.hidden = false;
    this.render();
  }

  tick(dt: number) {
    if (!this.isOpen) return;
    if (this.phase === 'boil') {
      const was = this.boil;
      this.boil = Math.min(1, this.boil + dt / 4.5);
      if (was < 1 && this.boil >= 1) {
        this.audio.chime();
        this.hint = 'The boil climbs the pot and holds. "Now," says Shaji. Space to take up the tumblers.';
      }
      this.render();
    } else if (this.phase === 'pull' && this.lifting) {
      this.arm = Math.min(1, this.arm + dt * (0.45 + this.arm * 0.25));
      if (this.arm >= 1) {
        // Overshoot: the arc outruns the tumbler. A wet counter, never a failure.
        this.lifting = false;
        this.arm = 0;
        this.spills++;
        this.audio.slosh();
        this.hint = 'The arc outruns the glass; chaya rings the counter. Shaji laughs like a kettle. "Now it is a real thattukada. Again, from the wrist."';
      }
      this.render();
    }
  }

  onDir(dir: Dir) {
    if (this.phase === 'serve') {
      if (dir === 'left') this.serve = 'flourish';
      if (dir === 'right') this.serve = 'under';
      this.render();
    }
  }

  onAction() {
    if (this.phase === 'boil') {
      if (this.boil < 1) {
        this.stirs++;
        this.audio.blip();
        this.hint = [
          '"Patience is an ingredient," says Shaji. The milk thinks about it, walls first.',
          'Shaji moves your hand off the pot with one finger. "The boil answers to the flame, mone, not to us."',
          'The kettle mutters. You wait. Around here, this counts as working.',
        ][(this.stirs - 1) % 3] as string;
      } else {
        this.phase = 'pull';
        this.hint = 'Two tumblers, one stream. Space lifts the pouring arm; Space again lets the tea go. Height is froth.';
      }
      this.render();
      return;
    }
    if (this.phase === 'pull') {
      if (!this.lifting) {
        this.lifting = true;
        this.audio.blip();
        this.hint = 'The arm climbs, the stream thins and sings. Let go when the height feels like bragging.';
      } else {
        this.lifting = false;
        const target = PULL_TARGETS[this.pullIdx] ?? 0.8;
        if (this.arm >= target) {
          this.audio.chime();
          this.hint = PULL_PRAISE[this.pullIdx] as string;
          this.pullIdx++;
          this.arm = 0;
          if (this.pullIdx >= PULL_TARGETS.length) {
            this.phase = 'serve';
            this.hint += ' Now the glass. Left and right choose how it is handed over; Space commits.';
          } else {
            this.hint += ' "Higher," says Shaji, already pleased. The next pull wants more air.';
          }
        } else {
          this.audio.bump();
          this.arm = 0;
          this.hint = '"That is not chaya, that is surrender," says Shaji. "Again. The wrist knows; let it brag a little."';
        }
      }
      this.render();
      return;
    }
    if (this.phase === 'serve') {
      this.phase = 'done';
      this.audio.weaveDone();
      this.hint =
        this.serve === 'under'
          ? 'One hand pouring, one hand under the glass. Shaji nods like a co-conspirator. Press Space.'
          : 'You hand it across with a flourish. "Fast service," says Shaji. His eyebrow files a small report. Press Space.';
      this.render();
      return;
    }
    // done
    this.root.hidden = true;
    const done = this.onDone;
    this.onDone = null;
    done?.();
  }

  private render() {
    let middle = '';
    let count = '';
    if (this.phase === 'boil') {
      const pct = Math.round(this.boil * 100);
      middle = `<div class="c-track" style="background:linear-gradient(#7a6a55,#4a4036)">
           <div class="c-wave" style="left:0;width:${pct}%;background:linear-gradient(#f2e0c0,#c99a5e)"></div>
         </div>`;
      count = `<div class="c-count">the boil: ${pct}%</div>`;
    } else if (this.phase === 'pull') {
      const target = (PULL_TARGETS[this.pullIdx] ?? 0.8) * 100;
      const arm = this.arm * 100;
      middle = `<div style="height:120px;width:28px;margin:8px auto;position:relative;border-radius:6px;
             background:rgba(255,255,255,0.08);overflow:hidden">
           <div style="position:absolute;left:0;right:0;bottom:${target}%;height:2px;background:rgba(242,230,208,0.8)"></div>
           <div style="position:absolute;left:0;right:0;bottom:0;height:${arm}%;background:linear-gradient(#f6e3b0,#b0703c)"></div>
         </div>`;
      const wet = this.spills > 0 ? ` &middot; counter: wet x${this.spills}` : '';
      count = `<div class="c-count">pull ${Math.min(this.pullIdx + 1, 3)} of 3${wet}</div>`;
    } else if (this.phase === 'serve') {
      count = `<div class="c-count">${
        this.serve === 'flourish' ? '&larr; hand it over with a flourish' : 'one hand under the glass &rarr;'
      }</div>`;
    } else {
      count = `<div class="c-count">the glass is poured</div>`;
    }
    this.root.innerHTML = `
      <div class="w-panel">
        <div class="w-title">The Meter-Long Pour</div>
        ${middle}
        ${count}
        <div class="w-hint">${this.hint}</div>
      </div>`;
  }
}
