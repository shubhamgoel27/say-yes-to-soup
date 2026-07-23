import type { Dir } from '../../engine/input';
import type { AudioBus } from '../../engine/audio';

/**
 * The Yacana's two hands-on verbs.
 *
 * GalleyPanel: Ben calls the pot, you feed it, in order. A wrong pick cannot
 * fail anything: Ben chuckles and hands you the right thing, exactly the way
 * his aunties taught him. The adobo gets made either way; you get made too.
 *
 * StarPanel: the dark bow after lights-out. One river of stars, three names.
 * Walk a reticle across the sky and find each reading; a miss only nudges
 * you warmer. No timer, no failure, no hurry. The stars rise on schedule.
 */

// ---------------------------------------------------------------- the galley

type Ingredient = { name: string; note: string };

/** Ben's adobo, in the order the pot wants it. */
const STEPS: Ingredient[] = [
  { name: 'Garlic', note: 'A whole head, smashed flat with the knife. The pot wakes up.' },
  { name: 'Chicken', note: 'In it goes, skin down, until the edges brown and gossip.' },
  { name: 'Soy sauce', note: 'A long dark pour. "Half the argument," says Ben.' },
  { name: 'Cane vinegar', note: 'The other half. Do not stir yet! The vinegar needs its dignity.' },
  { name: 'Bay leaves', note: 'Three, no more. "They are loud leaves, pare."' },
  { name: 'Peppercorns', note: 'A rattling spoonful, whole. Now the lid, and now patience.' },
];

const PANTRY: string[] = [
  'Garlic',
  'Condensed milk',
  'Soy sauce',
  'Chicken',
  'Dried mango',
  'Cane vinegar',
  'Bay leaves',
  'Peppercorns',
];

const CHUCKLES = [
  'Ben chuckles. "For halo-halo maybe, not adobo." He hands you the',
  'Ben laughs into his towel. "My auntie would faint, pare." He hands you the',
  '"Bold! Wrong, but bold." He grins and hands you the',
];

const COLS = 4;

export class GalleyPanel {
  private step = 0;
  private cur = 0;
  private done = false;
  private misses = 0;
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
    this.step = 0;
    this.cur = 0;
    this.done = false;
    this.misses = 0;
    this.hint = 'Ben ties your apron. "First: the thing that wakes the pot up." Arrows choose, Space feeds the pot.';
    this.root.hidden = false;
    this.render();
  }

  onDir(dir: Dir) {
    if (this.done) return;
    const x = this.cur % COLS;
    const y = Math.floor(this.cur / COLS);
    const rows = Math.ceil(PANTRY.length / COLS);
    const nx = Math.max(0, Math.min(COLS - 1, x + (dir === 'left' ? -1 : dir === 'right' ? 1 : 0)));
    const ny = Math.max(0, Math.min(rows - 1, y + (dir === 'up' ? -1 : dir === 'down' ? 1 : 0)));
    this.cur = Math.min(PANTRY.length - 1, ny * COLS + nx);
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
    const want = STEPS[this.step];
    if (!want) return;
    const picked = PANTRY[this.cur] ?? '';
    if (picked === want.name) {
      this.audio.weaveNote(this.step % 7);
      this.hint = want.note;
    } else {
      // No failing in this galley. Ben hands you the right thing, laughing.
      this.audio.blip();
      const chuckle = CHUCKLES[this.misses % CHUCKLES.length] ?? CHUCKLES[0] ?? '';
      this.misses++;
      this.hint = `${chuckle} ${want.name.toLowerCase()}. ${want.note}`;
    }
    this.step++;
    if (this.step >= STEPS.length) {
      this.done = true;
      this.audio.weaveDone();
      this.hint =
        this.misses === 0
          ? 'The lid goes on. Ben looks at you with suspicion: "You have aunties, pare?" Press Space.'
          : 'The lid goes on. "Wrong answers included, that was cooking," Ben says, satisfied. Press Space.';
    }
    this.render();
  }

  private render() {
    const dots = STEPS.map((s, i) => {
      const on = i < this.step;
      return `<span style="display:inline-block;width:13px;height:13px;border-radius:50%;margin:0 3px;
        border:2px solid #2b2118;background:${on ? '#7a3b22' : 'transparent'}" title="${s.name}"></span>`;
    }).join('');
    const cells = PANTRY.map((name, i) => {
      const cur = i === this.cur;
      const used = STEPS.slice(0, this.step).some((s) => s.name === name);
      return `<div style="padding:7px 4px;border:2px solid ${cur ? '#c1512f' : 'rgba(43,33,24,0.55)'};
        border-radius:4px;font-size:12.5px;line-height:1.15;background:${used ? 'rgba(122,59,34,0.18)' : 'rgba(242,230,208,0.5)'};
        ${cur ? 'box-shadow:0 0 0 2px rgba(193,81,47,0.35);' : ''}${used ? 'opacity:0.65;' : ''}">${name}</div>`;
    }).join('');
    this.root.innerHTML = `
      <div class="w-panel">
        <div class="w-title">The Galley: Adobo</div>
        <div style="margin:2px 0 8px">${dots}</div>
        <div style="display:grid;grid-template-columns:repeat(${COLS},1fr);gap:6px;margin:0 2px 10px">${cells}</div>
        <div class="w-hint">${this.hint}</div>
      </div>`;
  }
}

// ---------------------------------------------------------------- the stars

type StarTarget = {
  title: string;
  ask: string;
  found: string;
  /** Region in sky coordinates, fractions of the field: [x0, y0, x1, y1]. */
  rect: [number, number, number, number];
};

const TARGETS: StarTarget[] = [
  {
    title: 'the Hunter',
    ask: 'Hana: "Start with the one every chart knows. The hunter, three stars for a belt, low in the west."',
    found: 'Hana: "Orion. The mate shoots his shoulder with the sextant. Hello, old reliable."',
    rect: [0.04, 0.52, 0.3, 0.9],
  },
  {
    title: 'Yacana',
    ask: '"Now yours. Not stars: the DARK. The llama in the Mayu, drinking so the rivers stay in their beds."',
    found: '"You found her by her darkness. A constellation of exactly nothing, and she still has eyes. I love her."',
    rect: [0.38, 0.14, 0.66, 0.52],
  },
  {
    title: 'the Amanogawa',
    ask: '"Last: the river itself. At home we say Amanogawa, the River of Heaven. Follow the bright dust northeast."',
    found: '"The Amanogawa. In twelve days I will see it from my grandmother\'s roof, and it will be the same river."',
    rect: [0.6, 0.04, 0.96, 0.44],
  },
];

/** A fixed hand-laid sky, so the constellations sit where the text says. */
const STARS: [number, number, number][] = [
  // The hunter, low in the southwest: shoulders, belt of three, feet.
  [0.1, 0.62, 2.4], [0.2, 0.6, 2.6], [0.13, 0.71, 2.2], [0.155, 0.7, 2.8], [0.18, 0.69, 2.2],
  [0.09, 0.82, 2.4], [0.22, 0.8, 2.6],
  // The Mayu band, running diagonally, dense with dust.
  [0.34, 0.5, 1.6], [0.4, 0.44, 1.8], [0.45, 0.4, 1.4], [0.5, 0.34, 2.0], [0.55, 0.3, 1.5],
  [0.6, 0.26, 1.8], [0.65, 0.2, 1.6], [0.7, 0.16, 2.0], [0.75, 0.12, 1.5], [0.42, 0.52, 1.3],
  [0.48, 0.46, 1.2], [0.58, 0.38, 1.3], [0.66, 0.3, 1.2], [0.72, 0.24, 1.4], [0.8, 0.18, 1.6],
  [0.84, 0.1, 1.8], [0.88, 0.16, 1.4], [0.63, 0.1, 1.5], [0.55, 0.16, 1.3], [0.47, 0.24, 1.4],
  // Loose sky everywhere else.
  [0.06, 0.12, 1.6], [0.14, 0.3, 1.3], [0.24, 0.2, 1.7], [0.3, 0.08, 1.4], [0.33, 0.3, 1.2],
  [0.28, 0.44, 1.3], [0.2, 0.48, 1.2], [0.36, 0.72, 1.5], [0.45, 0.66, 1.3], [0.55, 0.6, 1.4],
  [0.66, 0.56, 1.3], [0.76, 0.5, 1.5], [0.85, 0.42, 1.3], [0.9, 0.3, 1.5], [0.93, 0.55, 1.4],
  [0.82, 0.66, 1.3], [0.7, 0.72, 1.4], [0.6, 0.8, 1.3], [0.5, 0.86, 1.5], [0.38, 0.88, 1.2],
  [0.9, 0.78, 1.4], [0.79, 0.86, 1.2], [0.68, 0.9, 1.3], [0.96, 0.08, 1.3], [0.03, 0.4, 1.2],
];

const GRID_W = 12;
const GRID_H = 7;

export class StarPanel {
  private target = 0;
  private cx = 5;
  private cy = 3;
  private done = false;
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
    this.target = 0;
    this.cx = 5;
    this.cy = 3;
    this.done = false;
    this.hint = `${TARGETS[0]?.ask ?? ''} Arrows steer your eyes; Space says "there."`;
    this.root.hidden = false;
    this.render();
  }

  onDir(dir: Dir) {
    if (this.done) return;
    if (dir === 'left') this.cx = Math.max(0, this.cx - 1);
    if (dir === 'right') this.cx = Math.min(GRID_W - 1, this.cx + 1);
    if (dir === 'up') this.cy = Math.max(0, this.cy - 1);
    if (dir === 'down') this.cy = Math.min(GRID_H - 1, this.cy + 1);
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
    const t = TARGETS[this.target];
    if (!t) return;
    const fx = (this.cx + 0.5) / GRID_W;
    const fy = (this.cy + 0.5) / GRID_H;
    const [x0, y0, x1, y1] = t.rect;
    if (fx >= x0 && fx <= x1 && fy >= y0 && fy <= y1) {
      this.audio.chime();
      this.target++;
      const next = TARGETS[this.target];
      if (next) {
        this.hint = `${t.found} ${next.ask}`;
      } else {
        this.done = true;
        this.audio.weaveDone();
        this.hint = `${t.found} Three skies, one river. Press Space.`;
      }
    } else {
      // A miss only warms you up; the sky is not going anywhere.
      this.audio.blip();
      const dx = fx < x0 ? 'more to starboard' : fx > x1 ? 'more to port' : '';
      const dy = fy < y0 ? 'lower' : fy > y1 ? 'higher' : '';
      const nudge = [dy, dx].filter(Boolean).join(' and ');
      this.hint = `Hana tilts her head. "Warm. Look ${nudge || 'again, slower'}."`;
    }
    this.render();
  }

  private render() {
    const stars = STARS.map(
      ([x, y, r]) =>
        `<span style="position:absolute;left:${x * 100}%;top:${y * 100}%;width:${r}px;height:${r}px;
         border-radius:50%;background:#f2ead8;opacity:${0.55 + r * 0.14};transform:translate(-50%,-50%)"></span>`,
    ).join('');
    const found = TARGETS.slice(0, this.target)
      .map(
        (t) => `<span style="position:absolute;left:${t.rect[0] * 100}%;top:${t.rect[1] * 100}%;
          width:${(t.rect[2] - t.rect[0]) * 100}%;height:${(t.rect[3] - t.rect[1]) * 100}%;
          border:1.5px dashed rgba(180,210,240,0.55);border-radius:10px"></span>`,
      )
      .join('');
    const names = TARGETS.map(
      (t, i) =>
        `<span style="margin:0 6px;font-size:12px;${i < this.target ? '' : 'opacity:0.4'}">
          ${i < this.target ? '✦' : '·'} ${t.title}</span>`,
    ).join('');
    const ret = `<span style="position:absolute;left:${((this.cx + 0.5) / GRID_W) * 100}%;
      top:${((this.cy + 0.5) / GRID_H) * 100}%;width:26px;height:26px;border:2px solid #c1512f;
      border-radius:50%;transform:translate(-50%,-50%);box-shadow:0 0 8px rgba(193,81,47,0.5)"></span>`;
    this.root.innerHTML = `
      <div class="w-panel">
        <div class="w-title">The Star Deck</div>
        <div style="position:relative;height:190px;margin:4px 2px 8px;border:2px solid #2b2118;border-radius:4px;
          overflow:hidden;background:linear-gradient(160deg,#101a2e 0%,#16233c 45%,#0c1424 100%)">
          <span style="position:absolute;left:18%;top:110%;width:130%;height:34%;transform:rotate(-33deg);
            transform-origin:0 0;background:linear-gradient(rgba(190,210,235,0),rgba(190,210,235,0.16),rgba(190,210,235,0));
            filter:blur(2px)"></span>
          <span style="position:absolute;left:44%;top:20%;width:20%;height:30%;transform:rotate(-28deg);
            background:rgba(6,10,18,0.75);border-radius:45% 60% 50% 60%;filter:blur(3px)"></span>
          ${stars}${found}${ret}
        </div>
        <div style="margin-bottom:6px;color:#57452f">${names}</div>
        <div class="w-hint">${this.hint}</div>
      </div>`;
  }
}
