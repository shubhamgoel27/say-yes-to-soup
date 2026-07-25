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

// ---------------------------------------------------------------- the noon

/**
 * CevichePanel: behind Doña Petro's pots at noon, assembling the dish in its
 * one true order. The clock is the enemy that isn't: the only timing that
 * matters is the lime "kiss," a bar you must pull the fish out of while it is
 * bright. Leave it too long and the fish is "cooked to death, hija"; Petro
 * hands you more fish, warmly, forever. Nothing else can go wrong.
 */

type CevicheStep = 'cut' | 'salt' | 'lime' | 'onion' | 'aji' | 'sides' | 'pour' | 'done';

const CEVICHE_ORDER: CevicheStep[] = ['cut', 'salt', 'lime', 'onion', 'aji', 'sides', 'pour', 'done'];

export class CevichePanel {
  private step: CevicheStep = 'cut';
  private cuts = 0;
  private sides = 0;
  private kiss = 0; // lime marination 0..1, filling in real time
  private spoiled = 0; // fish handed back, for the flavor lines
  private pour = 0;
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
    this.step = 'cut';
    this.cuts = 0;
    this.sides = 0;
    this.kiss = 0;
    this.spoiled = 0;
    this.pour = 0;
    this.hint = 'The dawn lisa, the board, the knife. Space to cut: even pieces, no ceremony.';
    this.root.hidden = false;
    this.render();
  }

  tick(dt: number) {
    if (!this.isOpen) return;
    if (this.step === 'lime') {
      this.kiss += dt * 0.22;
      if (this.kiss >= 1) {
        // Too long in the lime. Petro's verdict is warm and non-negotiable.
        this.spoiled++;
        this.kiss = 0;
        this.audio.bump();
        this.hint =
          this.spoiled === 1
            ? '"Cooked to death, hija." She eats the evidence and hands you more fish. "The lime kisses. It does not marry."'
            : '"Again dead! Good, I was hungry." More fish arrives. Pull it OUT while the bar burns bright.';
      }
      this.render();
    }
  }

  onDir(_dir: Dir) {
    // The kitchen needs only the one button and your nerve.
  }

  private advance() {
    this.step = CEVICHE_ORDER[CEVICHE_ORDER.indexOf(this.step) + 1] as CevicheStep;
  }

  onAction() {
    switch (this.step) {
      case 'cut': {
        this.cuts++;
        this.audio.blip();
        if (this.cuts >= 3) {
          this.advance();
          this.hint = 'Cut. Now salt, first and alone. Space to scatter it like you mean it.';
        } else {
          this.hint = ['Through the middle. The fish does not object.', 'Again. Even pieces; the lime treats them all the same.'][
            this.cuts - 1
          ] as string;
        }
        break;
      }
      case 'salt': {
        this.audio.slosh();
        this.advance();
        this.hint = 'Now the lime. The fish goes IN, and comes OUT while the bar is bright. A kiss, not a marriage. Space when it burns.';
        this.kiss = 0;
        break;
      }
      case 'lime': {
        if (this.kiss >= 0.5 && this.kiss < 0.8) {
          this.audio.weaveNote(4);
          this.advance();
          this.hint = 'OUT, at the exact bright second. The flesh has turned white at the edges only. Petro says nothing, loudly. Now the onion.';
        } else if (this.kiss < 0.5) {
          this.audio.bump();
          this.hint = 'Too soon; the lime has barely said hello. Back in. Wait for the bright zone, then pull.';
        }
        break;
      }
      case 'onion': {
        this.audio.blip();
        this.advance();
        this.hint = 'Red onion, sliced to feathers. Now the ají, and less than your pride wants.';
        break;
      }
      case 'aji': {
        this.audio.blip();
        this.advance();
        this.hint = 'A whisper of ají. Now the rim: cancha on one side, camote on the other. Space for each.';
        break;
      }
      case 'sides': {
        this.sides++;
        this.audio.slosh();
        if (this.sides >= 2) {
          this.advance();
          this.hint = 'Crunch and sweetness seated at the rim. Last: the leche de tigre, poured into its own glass. Space to pour.';
        } else {
          this.hint = 'Cancha down, toasted and rattling. Now the camote, orange as a good sunset.';
        }
        break;
      }
      case 'pour': {
        this.pour = 1;
        this.audio.weaveDone();
        this.advance();
        this.hint = 'The tiger gets its glass. The clock says four minutes past noon, which is exactly on time. Press Space.';
        break;
      }
      case 'done': {
        this.root.hidden = true;
        const done = this.onDone;
        this.onDone = null;
        done?.();
        break;
      }
    }
    this.render();
  }

  private render() {
    const idx = CEVICHE_ORDER.indexOf(this.step);
    const at = (s: CevicheStep) => idx > CEVICHE_ORDER.indexOf(s);
    // The fish: whole, then pieces, whitening after the lime.
    const fishColor = at('lime') ? '#f3ece2' : '#d8a8a0';
    const fish =
      this.cuts < 3
        ? `<div style="position:absolute;left:34%;top:30%;width:32%;height:16%;border-radius:50% 60% 60% 50%;
             background:#b8c4cc;border:1px solid #8fa0aa"></div>`
        : [0, 1, 2, 3]
            .map(
              (i) =>
                `<div style="position:absolute;left:${30 + i * 11}%;top:${31 + (i % 2) * 3}%;width:8%;height:11%;
                   border-radius:38%;background:${fishColor};border:1px solid #c2b8a8"></div>`,
            )
            .join('');
    const salt = at('salt')
      ? [12, 30, 48, 62, 75]
          .map((x, i) => `<div style="position:absolute;left:${x}%;top:${26 + (i % 3) * 5}%;width:1.5%;height:2%;border-radius:50%;background:#fff"></div>`)
          .join('')
      : '';
    const onion = at('onion')
      ? [36, 47, 58]
          .map((x) => `<div style="position:absolute;left:${x}%;top:28%;width:7%;height:4%;border-radius:50%;border:2px solid #a05a8c;background:transparent"></div>`)
          .join('')
      : '';
    const aji = at('aji')
      ? `<div style="position:absolute;left:49%;top:36%;width:4%;height:3%;border-radius:40%;background:#e8a03c"></div>`
      : '';
    const sides = `
      ${this.sides >= 1 ? `<div style="position:absolute;left:16%;top:44%;width:10%;height:7%;border-radius:45%;background:#d9b96a"></div>` : ''}
      ${this.sides >= 2 ? `<div style="position:absolute;left:72%;top:44%;width:10%;height:7%;border-radius:45%;background:#d97b3c"></div>` : ''}`;
    const glass = `
      <div style="position:absolute;left:84%;top:18%;width:9%;height:26%;border:2px solid rgba(255,255,255,.5);border-top:none;border-radius:0 0 30% 30%">
        <div style="position:absolute;bottom:0;left:0;width:100%;height:${this.pour ? 78 : 0}%;background:#e8e3cf;transition:height .6s"></div>
      </div>`;
    const limeBar =
      this.step === 'lime'
        ? `<div style="margin:8px auto 0;width:74%;height:12px;border-radius:6px;background:rgba(0,0,0,.35);position:relative;overflow:hidden">
             <div style="position:absolute;left:50%;width:30%;height:100%;background:rgba(214,255,140,.35);border-left:1px solid #d6ff8c;border-right:1px solid #d6ff8c"></div>
             <div style="position:absolute;left:${Math.min(99, this.kiss * 100)}%;top:-2px;width:3px;height:16px;background:${this.kiss >= 0.5 && this.kiss < 0.8 ? '#d6ff8c' : '#f2e6d0'}"></div>
           </div>`
        : '';
    const clockMin = 1 + idx * 0.5 + this.spoiled;
    this.root.innerHTML = `
      <div class="w-panel">
        <div class="w-title">Behind the Pots</div>
        <div style="position:relative;margin:6px auto;width:min(340px,86vw);height:170px;
          background:linear-gradient(#3d3226,#2e2a20);border-radius:10px;overflow:hidden">
          <div style="position:absolute;left:12%;top:20%;width:70%;height:52%;border-radius:50%;
            background:#efe7d8;box-shadow:inset 0 4px 10px rgba(0,0,0,.25)"></div>
          ${fish}${salt}${onion}${aji}${sides}${glass}
          <div style="position:absolute;right:3%;bottom:4%;font-size:11px;color:rgba(255,255,255,.6)">
            12:${String(Math.floor(clockMin)).padStart(2, '0')} · the clock approves
          </div>
        </div>
        ${limeBar}
        <div class="w-hint">${this.hint}</div>
      </div>`;
  }
}
