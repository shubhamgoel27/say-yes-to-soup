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

export class UrojoPanel {
  private phase: UrojoPhase = 'build';
  private round = 0;
  private cur = 0;
  private counts: number[] = [];
  private dots: { color: string; x: number; y: number }[] = [];
  private splashT = 0;
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
    this.phase = 'build';
    this.round = 0;
    this.startRound();
    this.hint = `Zuberi hands you the ladle. ${UROJO_ROUNDS[0]?.call ?? ''} Arrows choose, Space adds; choose SERVE when the bowl is a bowl.`;
    this.root.hidden = false;
    this.render();
  }

  private startRound() {
    this.cur = 0;
    this.counts = UROJO_ITEMS.map(() => 0);
    this.dots = [];
  }

  private total(): number {
    return this.counts.reduce((a, b) => a + b, 0);
  }

  tick(dt: number) {
    if (!this.isOpen) return;
    if (this.splashT > 0) {
      this.splashT -= dt;
      if (this.splashT <= 0) {
        this.splashT = 0;
        this.render();
      }
    }
  }

  onDir(dir: Dir) {
    if (this.phase !== 'build') return;
    const n = UROJO_ITEMS.length + 1; // the ring, plus SERVE
    if (dir === 'left' || dir === 'up') this.cur = (this.cur + n - 1) % n;
    if (dir === 'right' || dir === 'down') this.cur = (this.cur + 1) % n;
    this.render();
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
          this.hint = 'Zuberi covers the bowl with one hand. "That is not urojo yet, that is a puddle with promise. Two or three more things, mgeni."';
          this.render();
          return;
        }
        this.audio.chime();
        this.hint = `${this.verdict()} Space for the next bowl.`;
        this.phase = 'served';
        this.render();
        return;
      }
      const item = UROJO_ITEMS[this.cur];
      if (!item) return;
      this.counts[this.cur] = (this.counts[this.cur] ?? 0) + 1;
      const i = this.dots.length;
      this.dots.push({
        color: item.color,
        x: 28 + ((i * 37) % 45),
        y: 26 + ((i * 53) % 40),
      });
      this.splashT = 0.6;
      this.audio.slosh();
      this.hint = item.splash;
      if (this.total() >= 10) {
        this.audio.chime();
        this.hint = `The bowl declines further cargo. ${this.verdict()} Space for the next bowl.`;
        this.phase = 'served';
      }
      this.render();
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
        this.hint = 'The line is fed. Zuberi reclaims the ladle with the tenderness of a man taking back a sleeping child. Press Space to come out.';
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
    const roundLabel = this.phase === 'done' ? 'the corner, fed' : `bowl ${Math.min(this.round + 1, UROJO_ROUNDS.length)} of ${UROJO_ROUNDS.length}`;
    const dots = this.dots
      .map(
        (d) => `<span style="position:absolute;left:${d.x}%;top:${d.y}%;width:11px;height:11px;border-radius:50%;
          background:${d.color};border:1px solid rgba(43,33,24,0.4);transform:translate(-50%,-50%)"></span>`,
      )
      .join('');
    const splash = this.splashT > 0
      ? `<span style="position:absolute;left:50%;top:50%;width:78%;height:78%;border:3px solid rgba(217,168,60,0.7);
          border-radius:50%;transform:translate(-50%,-50%)"></span>`
      : '';
    const bowl = `
      <div style="position:relative;width:150px;height:110px;margin:2px auto 8px;border-radius:50%;
        background:radial-gradient(ellipse at 50% 42%, #e0b33e 0%, #c99230 55%, #8a5c1e 100%);
        border:4px solid #5c4a30;box-shadow:0 4px 8px rgba(43,33,24,0.35)">${dots}${splash}</div>`;
    const cells = UROJO_ITEMS.map((it, i) => {
      const cur = i === this.cur && this.phase === 'build';
      const n = this.counts[i] ?? 0;
      return `<div style="padding:6px 3px;border:2px solid ${cur ? '#c1512f' : 'rgba(43,33,24,0.55)'};border-radius:4px;
        font-size:12px;line-height:1.15;background:rgba(242,230,208,0.5);${cur ? 'box-shadow:0 0 0 2px rgba(193,81,47,0.35);' : ''}">
        <span style="display:inline-block;width:9px;height:9px;border-radius:50%;background:${it.color};margin-right:3px"></span>${it.name}${n > 0 ? ` &times;${n}` : ''}</div>`;
    });
    const serveCur = this.cur === UROJO_ITEMS.length && this.phase === 'build';
    cells.push(`<div style="padding:6px 3px;border:2px solid ${serveCur ? '#c1512f' : 'rgba(43,33,24,0.55)'};border-radius:4px;
      font-size:12px;font-weight:bold;text-align:center;background:${serveCur ? '#f7edd6' : 'rgba(242,230,208,0.5)'};
      ${serveCur ? 'box-shadow:0 0 0 2px rgba(193,81,47,0.35);' : ''}">SERVE</div>`);
    this.root.innerHTML = `
      <div class="w-panel">
        <div class="w-title">Behind the Urojo Pot</div>
        <div class="c-count">${roundLabel}</div>
        ${bowl}
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:5px;margin:0 2px 8px">${cells.join('')}</div>
        <div class="w-hint">${this.hint}</div>
      </div>`;
  }
}
