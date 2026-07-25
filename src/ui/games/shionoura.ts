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

// ---------------------------------------------------------------- the dawn kitchen

/**
 * DashiPanel: the morning dashi and breakfast with Fumi, before the guests
 * wake. Four quiet movements: kombu into cold water and then WAIT (patience
 * is the ingredient), pull the kombu just before the boil, skim the iriko
 * foam, and press two onigiri firm but not angry. There is no fail state;
 * Fumi corrects the way her mother-in-law corrected her, once and warmly.
 */

type DashiPhase = 'steep' | 'pull' | 'skim' | 'onigiri' | 'done';

const STEEP_NEED = 7; // seconds the cold water gets before the flame
const PULL_LO = 72; // the sweet zone: kombu out JUST before the boil
const PULL_HI = 94;
const PACK_LO = 38; // the squeeze's wide soft zone
const PACK_HI = 92;

const WAIT_LINES = [
  'Fumi, without looking up: "Not yet. The sea takes its time."',
  '"Still not yet. Cold water asks; boiling water demands. We are asking."',
  '"Patience is also an ingredient. The cheapest one, and nobody stocks it."',
];

export class DashiPanel {
  private phase: DashiPhase = 'steep';
  private dropped = false; // the kombu and iriko are in the water
  private steepT = 0; // seconds rested before the flame goes on
  private heat = 0; // 0..100 toward the boil
  private waitPokes = 0;
  private foam: { x: number; v: number }[] = [];
  private lx = 0.5; // the ladle, and later the hand, 0..1
  private squeeze = 0; // packing pressure, 0..110
  private squeezing = false;
  private packed = 0;
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
    this.phase = 'steep';
    this.dropped = false;
    this.steepT = 0;
    this.heat = 0;
    this.waitPokes = 0;
    this.foam = [];
    this.lx = 0.5;
    this.squeeze = 0;
    this.squeezing = false;
    this.packed = 0;
    this.hint =
      'A pot of cold water. Fumi lays out kombu and a handful of iriko, heads already pinched. "In they go. Space, then hands off."';
    this.root.hidden = false;
    this.render();
  }

  tick(dt: number) {
    if (!this.isOpen) return;
    if (this.phase === 'steep' && this.dropped) {
      this.steepT += dt;
      if (this.steepT >= STEEP_NEED) {
        this.phase = 'pull';
        this.hint =
          'The flame goes on, low. "Now watch, not the clock, the kombu. Out it comes JUST before the boil. Space, at the right moment."';
      }
    } else if (this.phase === 'pull') {
      this.heat = Math.min(100, this.heat + dt * 13);
      if (this.heat >= 100) {
        // No failing in this kitchen. Her chopsticks were always nearby.
        this.audio.slosh();
        this.hint =
          'Her chopsticks flick the kombu out at the first true bubble. "Boiled kombu sulks and turns bitter. Near misses also teach." The iriko simmer on.';
        this.startSkim();
      }
    } else if (this.phase === 'skim') {
      for (const f of this.foam) {
        f.x += f.v * dt * 0.12;
        if (f.x < 0.06 || f.x > 0.94) f.v = -f.v;
      }
    } else if (this.phase === 'onigiri' && this.squeezing) {
      this.squeeze += dt * 46;
      if (this.squeeze > 108) {
        this.audio.blip();
        this.squeezing = false;
        this.squeeze = 0;
        this.hint = 'The rice squeaks. Fumi raises one eyebrow. "You are angry at the rice? Loosen the hand. Again."';
      }
    }
    this.render();
  }

  onDir(dir: Dir) {
    if (this.phase === 'skim' || this.phase === 'onigiri') {
      if (dir === 'left') this.lx = Math.max(0.06, this.lx - 0.07);
      if (dir === 'right') this.lx = Math.min(0.94, this.lx + 0.07);
      this.render();
    }
  }

  onAction() {
    if (this.phase === 'done') {
      this.root.hidden = true;
      const done = this.onDone;
      this.onDone = null;
      done?.();
      return;
    }
    if (this.phase === 'steep') {
      if (!this.dropped) {
        this.dropped = true;
        this.audio.slosh();
        this.hint = 'The kombu slides under; the iriko follow like a small silver crowd. Now: nothing. The waiting IS the step.';
      } else {
        // The patience beat. Pressing early is answered, gently, every time.
        this.audio.blip();
        this.hint = WAIT_LINES[Math.min(this.waitPokes, WAIT_LINES.length - 1)] as string;
        this.waitPokes++;
      }
    } else if (this.phase === 'pull') {
      if (this.heat < PULL_LO) {
        this.audio.blip();
        this.hint = '"Not yet. See the little bubbles on the kombu, small as roe? When they hurry, you move."';
      } else {
        this.audio.chime();
        this.hint =
          'The kombu comes out glossy, one breath before the boil. Fumi nods once, which in this kitchen is applause. The iriko simmer on.';
        this.startSkim();
      }
    } else if (this.phase === 'skim') {
      const idx = this.foam.findIndex((f) => Math.abs(f.x - this.lx) < 0.1);
      if (idx >= 0) {
        this.foam.splice(idx, 1);
        this.audio.slosh();
        this.audio.weaveNote(this.foam.length % 7);
        this.hint =
          this.foam.length > 0
            ? '"Just the grey foam, not the gold under it. The scum is the sea clearing its throat."'
            : 'The broth goes clear as morning water. "Iriko dashi. Taste later; smell now." You do. The whole Inland Sea, in a saucepan.';
        if (this.foam.length === 0) {
          this.phase = 'onigiri';
          this.lx = 0.5;
          this.hint +=
            ' Rice next, salted palms. "Space to squeeze, Space to let go. Firm enough to travel, kind enough to eat."';
        }
      } else {
        this.audio.blip();
        this.hint = 'The ladle lifts only good broth. The foam drifts on, smug. Follow it with the arrows.';
      }
    } else if (this.phase === 'onigiri') {
      if (!this.squeezing) {
        this.squeezing = true;
        this.squeeze = 0;
        this.hint = 'The rice is hot enough to argue with. You press, steady...';
      } else {
        this.squeezing = false;
        if (this.squeeze >= PACK_LO && this.squeeze <= PACK_HI) {
          this.packed++;
          this.audio.weaveNote(this.packed % 7);
          this.squeeze = 0;
          if (this.packed >= 2) {
            this.phase = 'done';
            this.audio.weaveDone();
            this.hint =
              'Two onigiri, three presses each, a tuck of umeboshi in the heart. Fumi wraps them while the miso blooms in the dashi. Space.';
          } else {
            this.hint = '"So. Your hands were listening." The first onigiri sits proud on the board. One more, for the other tray.';
          }
        } else {
          this.audio.blip();
          this.squeeze = 0;
          this.hint = '"Too shy. That one would not survive a pocket. The rice forgives; again, with conviction."';
        }
      }
    }
    this.render();
  }

  private startSkim() {
    this.phase = 'skim';
    this.lx = 0.5;
    this.foam = [
      { x: 0.22, v: (Math.random() - 0.5) * 0.6 },
      { x: 0.52, v: (Math.random() - 0.5) * 0.6 },
      { x: 0.8, v: (Math.random() - 0.5) * 0.6 },
    ];
  }

  private render() {
    const steeping = this.phase === 'steep';
    const boiling = this.phase === 'pull';
    const waterTop = boiling ? '#9fc3cf' : '#b9d3da';
    const waterBot = this.phase === 'skim' || this.phase === 'onigiri' || this.phase === 'done' ? '#c9b87a' : '#7fa8b5';
    const kombu =
      this.dropped && (steeping || boiling)
        ? `<div style="position:absolute;left:30%;top:52%;width:40%;height:16%;border-radius:40%;background:#3d4a2e;opacity:0.8;transform:rotate(-6deg)"></div>`
        : '';
    const foamDots = this.foam
      .map(
        (f) =>
          `<div style="position:absolute;left:${(f.x * 100).toFixed(1)}%;top:26%;width:16px;height:9px;margin-left:-8px;border-radius:50%;background:#e6e2d3;opacity:0.85"></div>`,
      )
      .join('');
    const ladle =
      this.phase === 'skim'
        ? `<div style="position:absolute;left:${(this.lx * 100).toFixed(1)}%;top:10%;width:22px;height:22px;margin-left:-11px;border-radius:50%;border:3px solid #6b655c;background:rgba(242,230,208,0.35)"></div>`
        : '';
    const pot = `<div style="position:relative;height:84px;border-radius:10px 10px 26px 26px;border:3px solid #4a4038;background:linear-gradient(${waterTop},${waterBot});overflow:hidden;margin:8px 0">${kombu}${foamDots}${ladle}</div>`;

    let meter = '';
    if (steeping) {
      const w = this.dropped ? Math.min(100, (this.steepT / STEEP_NEED) * 100) : 0;
      meter = `<div style="font-size:11px;opacity:0.8;margin-bottom:2px">cold water, resting</div>
        <div style="height:8px;border-radius:4px;background:rgba(0,0,0,0.25);overflow:hidden"><div style="height:100%;width:${w.toFixed(0)}%;background:#7fa8b5"></div></div>`;
    } else if (boiling) {
      meter = `<div style="font-size:11px;opacity:0.8;margin-bottom:2px">toward the boil (the pale band is your moment)</div>
        <div style="position:relative;height:10px;border-radius:5px;background:rgba(0,0,0,0.25);overflow:hidden">
          <div style="position:absolute;left:${PULL_LO}%;width:${PULL_HI - PULL_LO}%;height:100%;background:rgba(242,230,208,0.5)"></div>
          <div style="position:absolute;height:100%;width:${this.heat.toFixed(0)}%;background:linear-gradient(90deg,#c9a35f,#c1512f);opacity:0.85"></div>
        </div>`;
    } else if (this.phase === 'onigiri') {
      meter = `<div style="font-size:11px;opacity:0.8;margin-bottom:2px">the squeeze ${'&#9679;'.repeat(this.packed)} (soft zone is wide; anger is not)</div>
        <div style="position:relative;height:10px;border-radius:5px;background:rgba(0,0,0,0.25);overflow:hidden">
          <div style="position:absolute;left:${PACK_LO}%;width:${PACK_HI - PACK_LO}%;height:100%;background:rgba(242,230,208,0.5)"></div>
          <div style="position:absolute;height:100%;width:${Math.min(100, this.squeeze).toFixed(0)}%;background:linear-gradient(90deg,#c9a35f,#c1512f);opacity:0.85"></div>
        </div>`;
    } else if (this.phase === 'skim') {
      meter = `<div style="font-size:11px;opacity:0.8">foam left: ${this.foam.length}. Arrows steer the ladle, Space skims.</div>`;
    }

    this.root.innerHTML = `
      <div class="w-panel">
        <div class="w-title">The Dawn Kitchen</div>
        ${pot}
        ${meter}
        <div class="w-hint">${this.hint}</div>
      </div>`;
  }
}
