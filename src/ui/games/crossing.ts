import type { Dir } from '../../engine/input';
import type { AudioBus } from '../../engine/audio';
import { Scene, mountScene, wobble, easeInOutSine, easeOutBack, easeOutCubic, paperTag } from './scene';
import { Rng, dot, oval, rect, rr, shade, surface, vgrad } from '../../art/pix';

/**
 * The Yacana's two hands-on verbs.
 *
 * GalleyPanel: Ben calls the pot, you feed it, in order. A wrong pick cannot
 * fail anything: Ben chuckles and hands you the right thing, exactly the way
 * his aunties taught him. The adobo gets made either way; you get made too.
 * The one thing that can go wrong is the one thing adobo is actually about:
 * after the lid, the sauce reduces, and a pot left on the fire too long
 * catches. Ben is unbothered by that too. One press and the garlic starts over.
 *
 * StarPanel: the dark bow after lights-out. One river of stars, three names.
 * Walk a reticle across the sky and find each reading; a miss only nudges
 * you warmer. No timer, no failure, no hurry. The stars rise on schedule.
 *
 * Both scenes ride the ship's roll: a slow global sway on everything drawn,
 * so the pot rocks on its burner and the sky leans against the rail.
 */

const calm = () => document.body.classList.contains('reduce-motion');

/** The overlay frame zeroes line-height for canvas layout; give wrapped hints theirs back. */
function fixHintLeading(root: HTMLElement) {
  const el = root.querySelector('.w-hint') as HTMLElement | null;
  if (el) el.style.lineHeight = '1.4';
}

const SCENE_W = 640;
const SCENE_H = 340;

/** Soft radial glow sprite, baked once and tinted by globalAlpha at draw time. */
function bakeGlow(color: string, r = 64): HTMLCanvasElement {
  const { cv, g } = surface(r * 2, r * 2);
  const grad = g.createRadialGradient(r, r, 0, r, r, r);
  grad.addColorStop(0, color);
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, r * 2, r * 2);
  return cv;
}

function bakeVignette(colorRgb: string, alpha: number): HTMLCanvasElement {
  const { cv, g } = surface(SCENE_W, SCENE_H);
  const grad = g.createRadialGradient(320, 170, 130, 320, 170, 400);
  grad.addColorStop(0, 'rgba(0,0,0,0)');
  grad.addColorStop(1, `rgba(${colorRgb},${alpha})`);
  g.fillStyle = grad;
  g.fillRect(0, 0, SCENE_W, SCENE_H);
  return cv;
}

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

/** Seconds the covered pot takes to go from all-vinegar to catching. */
const SIMMER_DUR = 11;
const SIMMER_CALM = 15;
/** Below this the sauce is still sharp; past the edge it is a near thing. */
const SIMMER_READY = 0.6;
const SIMMER_EDGE = 0.86;

/**
 * Esc raises the engine's own strip over an open panel. The pot has the
 * decency to wait while it is up: nothing burns behind a menu.
 */
const stripUp = () => (document.querySelector('.ht-strip') as HTMLElement | null)?.hidden === false;

// Shelf geometry: two wooden shelves of four slots on the galley's right wall.
const SLOT_X0 = 432;
const SLOT_DX = 57;
const SLOT_Y = [178, 262];
const POT_X = 172;
const POT_MOUTH_Y = 152;
const POT_BASE_Y = 218;

function slotPos(i: number): [number, number] {
  const col = i % COLS;
  const row = Math.floor(i / COLS);
  return [SLOT_X0 + col * SLOT_DX, SLOT_Y[row] ?? 252];
}

let pantrySheet: HTMLCanvasElement | null = null;
const CELL_W = 62;
const CELL_H = 58;

/** Eight little still-lifes, one per pantry slot, baked once. */
function makePantrySheet(): HTMLCanvasElement {
  if (pantrySheet) return pantrySheet;
  const { cv, g } = surface(CELL_W * PANTRY.length, CELL_H);
  const r = new Rng(77);
  for (let i = 0; i < PANTRY.length; i++) {
    g.save();
    g.translate(i * CELL_W + CELL_W / 2, CELL_H - 7);
    g.scale(1.28, 1.28);
    switch (i) {
      case 0: { // garlic: papery bulb, clove seams, a stub of stem
        oval(g, 0, -10, 12, 11, '#e4dcc6');
        oval(g, -4, -12, 6, 8, shade('#e4dcc6', 0.12));
        g.strokeStyle = 'rgba(140,120,90,0.5)';
        g.lineWidth = 1;
        for (const sx of [-5, 0, 5]) {
          g.beginPath();
          g.moveTo(sx, -20);
          g.quadraticCurveTo(sx * 1.5, -10, sx * 0.7, -1);
          g.stroke();
        }
        rr(g, -2, -25, 4, 7, 2, '#c9b98a');
        break;
      }
      case 1: { // condensed milk: squat can, cream label, red band
        rr(g, -11, -26, 22, 26, 2, '#9aa0a2');
        rect(g, -11, -20, 22, 15, '#efe6ce');
        rect(g, -11, -13, 22, 4, '#c1512f');
        oval(g, 0, -26, 11, 3.4, '#b8bcbc');
        oval(g, 0, -26, 8, 2.2, '#d5d8d6');
        break;
      }
      case 2: { // soy sauce: tall dark bottle, red cap
        rr(g, -8, -22, 16, 22, 3, '#241a12');
        rect(g, -3.5, -30, 7, 9, '#31241a');
        rr(g, -4.5, -34, 9, 5, 1.5, '#c1512f');
        rect(g, -6, -16, 12, 10, '#e8dcc4');
        rect(g, -4, -13.5, 8, 1.6, '#7a3b22');
        rect(g, -4, -10.5, 6, 1.3, 'rgba(43,33,24,0.55)');
        break;
      }
      case 3: { // chicken: two drumsticks crossed on a scrap of paper
        oval(g, 0, -2, 15, 5, '#e0d6ba');
        for (const [ox, rot] of [[-3, -0.5], [4, 0.35]] as const) {
          g.save();
          g.translate(ox, -8);
          g.rotate(rot);
          oval(g, 0, 3, 7, 9, '#d9a06a');
          oval(g, -2, 1, 4.5, 6, shade('#d9a06a', 0.15));
          rect(g, -1.5, -14, 3, 8, '#e8ddc0');
          dot(g, -2.5, -14, 2, '#f2ead8');
          dot(g, 2.5, -14, 2, '#f2ead8');
          g.restore();
        }
        break;
      }
      case 4: { // dried mango: clear packet, orange strips
        rr(g, -11, -28, 22, 28, 2.5, 'rgba(220,228,230,0.5)');
        rect(g, -11, -28, 22, 4, '#d9a441');
        for (let s = 0; s < 3; s++) {
          rr(g, -7 + s * 5, -21 + (s % 2) * 2, 4.5, 17, 2.2, s % 2 ? '#e0912e' : '#d9862e');
        }
        g.strokeStyle = 'rgba(255,255,255,0.5)';
        g.lineWidth = 1;
        g.strokeRect(-11, -28, 22, 28);
        break;
      }
      case 5: { // cane vinegar: pale bottle, milky white, green cap
        rr(g, -8, -22, 16, 22, 3, 'rgba(214,220,214,0.65)');
        rr(g, -6.5, -16, 13, 15, 2, '#efe9da');
        rect(g, -3.5, -30, 7, 9, 'rgba(214,220,214,0.7)');
        rr(g, -4.5, -34, 9, 5, 1.5, '#4d7440');
        rect(g, -5, -13, 10, 6, '#e8dcc4');
        rect(g, -3.5, -11.5, 7, 1.5, '#4d7440');
        break;
      }
      case 6: { // bay leaves: a sprig of loud leaves
        g.strokeStyle = '#7a6a3e';
        g.lineWidth = 1.6;
        g.beginPath();
        g.moveTo(-8, 0);
        g.quadraticCurveTo(0, -14, 9, -26);
        g.stroke();
        for (const [lt, side] of [[0.25, 1], [0.45, -1], [0.65, 1], [0.85, -1]] as const) {
          const lx = -8 + 17 * lt;
          const ly = -26 * lt * lt - 2 * lt;
          oval(g, lx + side * 4, ly - 3, 6.5, 3, lt > 0.5 ? '#6e9e5a' : '#5c8752', side * 0.7 - 0.5);
        }
        break;
      }
      default: { // peppercorns: corked jar, rattling spoonful
        rr(g, -9, -20, 18, 20, 3, 'rgba(210,218,220,0.5)');
        rr(g, -6, -27, 12, 8, 2, '#c9a06a');
        for (let p = 0; p < 12; p++) {
          dot(g, -6 + r.next() * 12, -14 + r.next() * 11, 1.6, p % 3 ? '#241a12' : '#3d2a1a');
        }
        g.strokeStyle = 'rgba(255,255,255,0.45)';
        g.lineWidth = 1;
        g.strokeRect(-9, -20, 18, 20);
        break;
      }
    }
    g.restore();
  }
  pantrySheet = cv;
  return cv;
}

let galleyBg: HTMLCanvasElement | null = null;

/** The galley itself: white steel, rivets, wood shelves, stove. Baked once. */
function makeGalleyBg(): HTMLCanvasElement {
  if (galleyBg) return galleyBg;
  const { cv, g } = surface(700, 400);
  g.translate(30, 30);
  // Steel wall, warm under the galley lamp.
  vgrad(g, -30, -30, 700, 290, '#e3e5da', '#c6cabf');
  // Lamp warmth pooling top center.
  const lamp = g.createRadialGradient(300, -10, 20, 300, -10, 340);
  lamp.addColorStop(0, 'rgba(255,220,160,0.30)');
  lamp.addColorStop(1, 'rgba(255,220,160,0)');
  g.fillStyle = lamp;
  g.fillRect(-30, -30, 700, 290);
  // Plate seams and rivets: a wall that was welded, not wished.
  g.strokeStyle = 'rgba(90,95,90,0.20)';
  g.lineWidth = 2;
  for (const sy of [40, 130]) {
    g.beginPath();
    g.moveTo(-30, sy);
    g.lineTo(670, sy);
    g.stroke();
    g.fillStyle = 'rgba(70,75,72,0.28)';
    for (let x = -20; x < 670; x += 34) dot(g, x, sy, 1.6, 'rgba(70,75,72,0.28)');
  }
  // Floor: worn checker plate.
  vgrad(g, -30, 258, 700, 112, '#6b675c', '#4f4c44');
  g.strokeStyle = 'rgba(30,28,24,0.35)';
  g.lineWidth = 1.5;
  for (let x = -20; x < 670; x += 58) {
    g.beginPath();
    g.moveTo(x, 258);
    g.lineTo(x - 26, 370);
    g.stroke();
  }
  // Stove block, left: steel range with oven door and a warm slit.
  rr(g, 58, 218, 244, 92, 4, '#8e938f');
  vgrad(g, 58, 218, 244, 10, 'rgba(255,255,255,0.35)', 'rgba(255,255,255,0)');
  rr(g, 58, 208, 244, 14, 3, '#565b57');
  rr(g, 92, 240, 120, 54, 4, '#6d726e');
  rr(g, 100, 262, 104, 6, 3, '#b9bdb8');
  rect(g, 96, 288, 112, 4, 'rgba(255,170,80,0.35)');
  rr(g, 232, 244, 54, 44, 3, '#7a7f7b');
  dot(g, 259, 266, 6, '#565b57');
  // Burner ring under the pot.
  oval(g, POT_X, 222, 66, 12, '#3c403d');
  oval(g, POT_X, 221, 58, 9, '#2a2d2b');
  // Chalk menu board over the stove.
  rr(g, 236, 22, 158, 84, 5, '#8a6a44');
  rr(g, 242, 28, 146, 72, 3, '#39403a');
  g.font = '600 21px Caveat, cursive';
  g.fillStyle = 'rgba(238,234,220,0.9)';
  g.textAlign = 'center';
  g.fillText('adobong manok', 315, 52);
  g.strokeStyle = 'rgba(238,234,220,0.4)';
  g.lineWidth = 1;
  g.beginPath();
  g.moveTo(256, 60);
  g.lineTo(374, 59);
  g.stroke();
  // Pantry shelf unit, right: dark wood, two boards, a chalk name plate.
  rr(g, 402, 100, 236, 208, 5, '#5c4430');
  rect(g, 408, 106, 224, 196, '#4a3626');
  rr(g, 414, 112, 212, 26, 3, '#39403a');
  for (const sy of [SLOT_Y[0] ?? 0, SLOT_Y[1] ?? 0]) {
    rect(g, 404, sy + 2, 232, 9, '#8a6a44');
    rect(g, 404, sy + 2, 232, 2.5, '#a58254');
    rect(g, 404, sy + 11, 232, 3, 'rgba(20,14,8,0.5)');
  }
  // Fiddle rails so jars stay home in a swell.
  rect(g, 404, (SLOT_Y[0] ?? 0) - 30, 232, 2.5, 'rgba(201,163,95,0.5)');
  rect(g, 404, (SLOT_Y[1] ?? 0) - 30, 232, 2.5, 'rgba(201,163,95,0.5)');
  // Utensil rail above the stove.
  rect(g, 70, 122, 160, 4, '#7a7f7b');
  dot(g, 74, 124, 2.5, '#565b57');
  dot(g, 226, 124, 2.5, '#565b57');
  galleyBg = cv;
  return cv;
}

let galleyGlow: HTMLCanvasElement | null = null;
let flameGlow: HTMLCanvasElement | null = null;
let galleyVig: HTMLCanvasElement | null = null;

type Fly = { icon: number; sx: number; sy: number; t: number };

const GALLEY_LEGEND = [
  { keys: ['left', 'right', 'up', 'down'], does: 'reach along the pantry' },
  { keys: ['space'], does: 'put it in the pot' },
] as const;

export class GalleyPanel {
  private step = 0;
  private cur = 0;
  private done = false;
  private misses = 0;
  private hint = '';
  private onDone: (() => void) | null = null;

  private sc = new Scene(SCENE_W, SCENE_H);
  private ui: { setHint: (h: string) => void } | null = null;
  private fly: Fly | null = null;
  private used = new Set<string>();
  private landed = 0;
  private wobIdx = -1;
  private wobT = 1;
  private lidT = 0;
  private lidGoing = false;
  private lidding = false;
  private steamAcc = 0;
  /** -1 while the pot is still being fed; 0..1 once the lid is on. */
  private simmer = -1;
  private burnt = false;

  constructor(
    private root: HTMLElement,
    private audio: AudioBus,
  ) {}

  get isOpen(): boolean {
    return !this.root.hidden;
  }

  /** True only while the pantry is live: not simmering, not burnt, not finished. */
  private get feeding(): boolean {
    return !this.done && !this.burnt && this.simmer < 0;
  }

  open(onDone: () => void) {
    this.onDone = onDone;
    this.step = 0;
    this.cur = 0;
    this.done = false;
    this.misses = 0;
    this.fly = null;
    this.used.clear();
    this.landed = 0;
    this.wobIdx = -1;
    this.wobT = 1;
    this.lidT = 0;
    this.lidGoing = false;
    this.lidding = false;
    this.simmer = -1;
    this.burnt = false;
    this.steamAcc = 0;
    this.hint = 'Ben ties your apron. "First: the thing that wakes the pot up." Arrows choose, Space feeds the pot.';
    makeGalleyBg();
    makePantrySheet();
    galleyGlow ??= bakeGlow('rgba(255,214,150,0.9)', 44);
    flameGlow ??= bakeGlow('rgba(255,150,60,0.9)', 56);
    galleyVig ??= bakeVignette('42,26,16', 0.28);
    this.sc.restart();
    this.ui = mountScene(this.root, 'The Galley: Adobo', this.sc, GALLEY_LEGEND);
    fixHintLeading(this.root);
    this.root.hidden = false;
  }

  onDir(dir: Dir) {
    if (!this.feeding) return;
    const x = this.cur % COLS;
    const y = Math.floor(this.cur / COLS);
    const rows = Math.ceil(PANTRY.length / COLS);
    const nx = Math.max(0, Math.min(COLS - 1, x + (dir === 'left' ? -1 : dir === 'right' ? 1 : 0)));
    const ny = Math.max(0, Math.min(rows - 1, y + (dir === 'up' ? -1 : dir === 'down' ? 1 : 0)));
    this.cur = Math.min(PANTRY.length - 1, ny * COLS + nx);
  }

  onAction() {
    if (this.burnt) {
      // Scrub the pot, start the garlic again. Nothing was lost but one dinner.
      const again = this.onDone;
      if (again) this.open(again);
      return;
    }
    if (this.done) {
      this.root.hidden = true;
      const done = this.onDone;
      this.onDone = null;
      done?.();
      return;
    }
    if (this.simmer >= 0) {
      this.liftOff();
      return;
    }
    const want = STEPS[this.step];
    if (!want) return;
    const picked = PANTRY[this.cur] ?? '';
    if (picked === want.name) {
      this.audio.weaveNote(this.step % 7);
      this.hint = want.note;
      this.launch(want.name);
    } else {
      // No failing in this galley. Ben hands you the right thing, laughing.
      this.audio.blip();
      const chuckle = CHUCKLES[this.misses % CHUCKLES.length] ?? CHUCKLES[0] ?? '';
      this.misses++;
      this.hint = `${chuckle} ${want.name.toLowerCase()}. ${want.note}`;
      this.wiggleThenLaunch(this.cur, want.name);
    }
    this.step++;
    if (this.step >= STEPS.length) {
      this.lidding = true;
      this.hint = 'Six things and no more. Ben slides the lid over. "Now she argues with herself, pare. Watch the sauce go down."';
    }
  }

  /** Lid on: the only part of adobo that cannot be hurried begins. */
  private startSimmer() {
    this.simmer = 0;
    this.hint = 'The sarsa starts going down under the lid. Ben: "When the smell turns sweet and dark, off the heat." Space lifts the pot.';
  }

  /** Space during the simmer. Too early is only a shake of the head. */
  private liftOff() {
    if (this.simmer < SIMMER_READY) {
      this.audio.blip();
      this.hint = 'Ben leans over and sniffs. "All vinegar still, pare. She has not finished arguing." Give her a little longer.';
      return;
    }
    this.done = true;
    this.audio.weaveDone();
    this.sc.flash('#ffe2b0', 0.3);
    this.sc.tween(1, 0.58, 0.45, easeOutCubic, (v) => {
      this.lidT = v;
    });
    this.sc.waft(POT_X - 32, POT_MOUTH_Y, 'rgba(255,252,244,0.4)', 9);
    this.sc.waft(POT_X + 32, POT_MOUTH_Y, 'rgba(255,252,244,0.4)', 9);
    this.hint =
      this.misses === 0
        ? 'Off the heat on exactly the right breath, dark and glossy. Ben looks at you with suspicion: "You have aunties, pare?" Press Space.'
        : 'Off the heat, dark and glossy. "Wrong answers included, that was cooking," Ben says, satisfied. Press Space.';
  }

  /** The pot catches. Ben has burnt more dinners than you will ever cook. */
  private burn() {
    this.burnt = true;
    this.simmer = 1;
    this.audio.blip();
    this.sc.flash('#3a2410', 0.4);
    if (!calm()) this.sc.thump(5, 0.05);
    this.sc.tween(1, 0.55, 0.4, easeOutCubic, (v) => {
      this.lidT = v;
    });
    for (let i = 0; i < (calm() ? 3 : 7); i++) {
      this.sc.waft(POT_X + (Math.random() - 0.5) * 74, POT_MOUTH_Y - 4, 'rgba(46,38,30,0.55)', 11);
    }
    this.hint =
      'Nasunog. Ben lifts the pot off the fire, calm as weather. "Burnt one, pare. Every cook owes the pot a few." Press Space and the garlic goes back in.';
  }

  tick(dt: number) {
    if (!this.isOpen) return;
    const simDt = this.sc.frame(dt, (g) => this.paint(g));
    // The reduction runs on its own clock, and only while the pot is unattended
    // by menus. Ben calls it twice before it ever catches.
    if (this.simmer >= 0 && !this.done && !this.burnt && !stripUp()) {
      const was = this.simmer;
      this.simmer = Math.min(1, this.simmer + simDt / (calm() ? SIMMER_CALM : SIMMER_DUR));
      if (was < SIMMER_READY && this.simmer >= SIMMER_READY) {
        this.audio.chime();
        this.hint = 'The whole galley goes sweet and dark at once. Ben, not looking up: "Ngayon na. Now, pare." Space lifts the pot off.';
      } else if (was < SIMMER_EDGE && this.simmer >= SIMMER_EDGE) {
        this.hint = 'A thin sharp note arrives under the sweet. Ben stops wiping the counter. "Ay. Now now now." Space, off the heat.';
      }
      if (this.simmer >= 1) this.burn();
    }
    // Steam keeps pace with the pot: more in it, more of it.
    if (this.landed >= 2 && !this.burnt) {
      this.steamAcc += simDt;
      const every = (calm() ? 0.6 : 0.3) / Math.min(2, 0.6 + this.landed * 0.25);
      if (this.steamAcc > every) {
        this.steamAcc = 0;
        this.sc.waft(POT_X + (Math.random() - 0.5) * 50, POT_MOUTH_Y - 2, 'rgba(255,252,244,0.42)', 8);
      }
    }
    this.ui?.setHint(this.hint);
  }

  /** Send an ingredient arcing from its shelf slot into the pot. */
  private launch(name: string) {
    if (this.fly) this.land();
    const idx = PANTRY.indexOf(name);
    const [sx, sy] = slotPos(Math.max(0, idx));
    this.fly = { icon: Math.max(0, idx), sx, sy, t: 0 };
    this.sc.burst(sx, sy - 18, { n: calm() ? 2 : 5, color: 'rgba(240,232,210,0.8)', speed: 40, size: 2, life: 0.35 });
    this.sc.tween(0, 1, 0.62, easeInOutSine, (v) => {
      if (this.fly) this.fly.t = v;
    }, () => this.land());
  }

  /** A wrong pick shivers on its shelf, then Ben lobs the right one over. */
  private wiggleThenLaunch(pickedIdx: number, wantName: string) {
    this.wobIdx = pickedIdx;
    this.sc.tween(0, 1, 0.38, easeOutCubic, (v) => {
      this.wobT = v;
    }, () => {
      this.wobIdx = -1;
      this.launch(wantName);
    });
  }

  /** The plop: splash, steam, and the pot visibly one step richer. */
  private land() {
    const f = this.fly;
    if (!f) return;
    this.fly = null;
    const name = PANTRY[f.icon] ?? '';
    this.used.add(name);
    this.landed = Math.min(STEPS.length, this.landed + 1);
    if (!calm()) this.sc.thump(3, 0.03);
    const splash = this.landed >= 3 ? '#6b4522' : '#c9a06a';
    this.sc.burst(POT_X, POT_MOUTH_Y + 2, { n: calm() ? 4 : 10, color: splash, speed: 75, size: 2.6, life: 0.5, grav: 260 });
    this.sc.waft(POT_X, POT_MOUTH_Y - 4, 'rgba(255,252,244,0.4)', 9);
    if (this.lidding && this.landed >= STEPS.length && !this.lidGoing) {
      this.lidGoing = true;
      this.sc.tween(0, 1, 0.55, easeOutBack, (v) => {
        this.lidT = v;
      }, () => {
        if (!calm()) this.sc.thump(4, 0.04);
        this.sc.waft(POT_X - 40, POT_MOUTH_Y, 'rgba(255,252,244,0.35)', 7);
        this.sc.waft(POT_X + 40, POT_MOUTH_Y, 'rgba(255,252,244,0.35)', 7);
        this.startSimmer();
      });
    }
  }

  // ------------------------------------------------------------- painting

  private paint(g: CanvasRenderingContext2D) {
    const t = this.sc.time;
    const roll = wobble(t, 0.5);
    rect(g, 0, 0, SCENE_W, SCENE_H, '#c9cec4');
    g.save();
    // The whole galley leans with the ship, slow as breathing.
    g.translate(320, 470);
    g.rotate(roll * 0.013);
    g.translate(-320, -470);
    if (galleyBg) g.drawImage(galleyBg, -30, -30);
    this.porthole(g, roll);
    this.utensils(g, roll, t);
    this.chalkTicks(g);
    this.stovePot(g, roll, t);
    this.simmerGauge(g, t);
    this.pantryShelf(g, t);
    this.flyDraw(g);
    g.restore();
    if (galleyVig) g.drawImage(galleyVig, 0, 0);
  }

  /** The sea outside keeps its own level while the frame rolls around it. */
  private porthole(g: CanvasRenderingContext2D, roll: number) {
    g.save();
    g.beginPath();
    g.arc(78, 78, 30, 0, Math.PI * 2);
    g.clip();
    rect(g, 42, 42, 72, 72, '#a9cbd8');
    g.save();
    g.translate(78, 78);
    g.rotate(-roll * 0.05);
    rect(g, -40, roll * 5, 80, 60, '#4e8fa6');
    rect(g, -40, roll * 5, 80, 2, 'rgba(240,248,244,0.55)');
    rect(g, -28, roll * 5 + 8, 22, 1.4, 'rgba(240,248,244,0.3)');
    g.restore();
    g.restore();
    g.strokeStyle = '#c9a35f';
    g.lineWidth = 5;
    g.beginPath();
    g.arc(78, 78, 31, 0, Math.PI * 2);
    g.stroke();
    g.strokeStyle = '#8a6a3e';
    g.lineWidth = 1.4;
    g.beginPath();
    g.arc(78, 78, 34, 0, Math.PI * 2);
    g.stroke();
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 + 0.5;
      dot(g, 78 + Math.cos(a) * 31, 78 + Math.sin(a) * 31, 1.8, '#8a6a3e');
    }
  }

  /** Ladle and skimmer on the rail, swinging a half-beat behind the roll. */
  private utensils(g: CanvasRenderingContext2D, roll: number, t: number) {
    const hooks: [number, number][] = [[104, 0], [140, 1.7], [176, 3.1]];
    for (const [hx, ph] of hooks) {
      const a = -roll * 0.11 + wobble(t, 1.4, ph) * 0.02;
      g.save();
      g.translate(hx, 126);
      g.rotate(a);
      g.strokeStyle = '#565b57';
      g.lineWidth = 2.6;
      g.beginPath();
      g.moveTo(0, 0);
      g.lineTo(0, 30);
      g.stroke();
      if (ph === 0) {
        oval(g, 0, 36, 8, 6.5, '#7a7f7b');
        oval(g, -2, 34.5, 4, 2.6, '#a8ada9');
      } else if (ph < 2) {
        dot(g, 0, 36, 8, '#8e938f');
        for (const [px, py] of [[-3, 34], [3, 34], [0, 38]] as const) dot(g, px, py, 1.2, '#565b57');
      } else {
        rr(g, -5, 30, 10, 14, 2, '#8a6a44');
      }
      g.restore();
    }
  }

  /** Six chalk boxes on Ben's board, checked as the pot fills. */
  private chalkTicks(g: CanvasRenderingContext2D) {
    for (let i = 0; i < STEPS.length; i++) {
      const bx = 256 + i * 20;
      g.strokeStyle = 'rgba(238,234,220,0.65)';
      g.lineWidth = 1.4;
      g.strokeRect(bx, 72, 13, 13);
      if (i < this.landed) {
        g.strokeStyle = 'rgba(238,234,220,0.95)';
        g.lineWidth = 2;
        g.beginPath();
        g.moveTo(bx + 2.5, 79);
        g.lineTo(bx + 5.5, 82.5);
        g.lineTo(bx + 11, 74.5);
        g.stroke();
      }
    }
  }

  /** The pot itself: rocking on the burner, contents assembling step by step. */
  private stovePot(g: CanvasRenderingContext2D, roll: number, t: number) {
    // Flames first, licking under the pot rim. Burnt or plated, the fire is out.
    const heat = this.burnt || this.done ? 0.22 : 1;
    if (flameGlow) {
      g.globalAlpha = (0.4 + wobble(t, 11) * 0.08) * heat;
      g.drawImage(flameGlow, POT_X - 78, POT_BASE_Y - 52, 156, 110);
      g.globalAlpha = 1;
    }
    for (let i = 0; i < 6; i++) {
      const fx = POT_X - 30 + i * 12;
      const fh = (7 + Math.sin(t * 12 + i * 2.1) * 3.5) * heat;
      oval(g, fx, POT_BASE_Y + 3, 4, fh, i % 2 ? '#e08a2e' : '#f4c25f');
    }
    const rot = roll * 0.055 + (this.landed > 0 ? Math.sin(t * 8.5) * 0.004 : 0);
    g.save();
    g.translate(POT_X, POT_BASE_Y);
    g.rotate(rot);
    g.translate(-POT_X, -POT_BASE_Y);
    // Body: dark enamel with one warm window-light down the flank.
    vgrad(g, POT_X - 62, POT_MOUTH_Y, 124, POT_BASE_Y - POT_MOUTH_Y, '#70767c', '#4a4f54');
    rect(g, POT_X - 62, POT_BASE_Y - 4, 124, 4, '#33373b');
    rect(g, POT_X - 44, POT_MOUTH_Y + 8, 9, 52, 'rgba(255,244,224,0.20)');
    // Handles.
    for (const s of [-1, 1]) {
      g.strokeStyle = '#33373b';
      g.lineWidth = 5;
      g.beginPath();
      g.arc(POT_X + s * 64, POT_MOUTH_Y + 22, 9, -Math.PI / 2, Math.PI / 2, s < 0);
      g.stroke();
    }
    // Mouth and contents. The broth stays level while the pot leans.
    oval(g, POT_X, POT_MOUTH_Y, 62, 13, '#565b60');
    oval(g, POT_X, POT_MOUTH_Y + 1, 55, 10.5, '#31353a');
    g.save();
    g.beginPath();
    g.ellipse(POT_X, POT_MOUTH_Y + 1, 55, 10.5, 0, 0, Math.PI * 2);
    g.clip();
    g.translate(POT_X, POT_MOUTH_Y + 1);
    g.rotate(-rot * 1.5);
    g.translate(-POT_X, -(POT_MOUTH_Y + 1));
    this.contents(g, t);
    g.restore();
    // Rim highlight over the clip.
    g.strokeStyle = 'rgba(230,236,238,0.5)';
    g.lineWidth = 1.6;
    g.beginPath();
    g.ellipse(POT_X, POT_MOUTH_Y - 1, 61, 12.5, 0, Math.PI * 1.05, Math.PI * 1.75);
    g.stroke();
    // The lid, arriving from above at the end.
    if (this.lidT > 0) {
      const ly = POT_MOUTH_Y - 3 - (1 - this.lidT) * 70;
      oval(g, POT_X, ly, 60, 12, '#b8bcb8');
      oval(g, POT_X, ly - 2, 52, 9, '#cdd1cc');
      dot(g, POT_X, ly - 8, 5, '#565b57');
      dot(g, POT_X - 1.5, ly - 9.5, 1.8, '#e6eae5');
    }
    g.restore();
    // Sea rails in front of the pot: the ship's own answer to the roll.
    for (const ry of [178, 200]) {
      rect(g, 66, ry, 232, 3, '#b4b8b3');
      rect(g, 66, ry, 232, 1.2, '#d8dcd6');
    }
    rect(g, 66, 176, 4, 30, '#8e938f');
    rect(g, 294, 176, 4, 30, '#8e938f');
  }

  /** What is in the pot so far, in the order the pot wanted it. */
  private contents(g: CanvasRenderingContext2D, t: number) {
    const cx = POT_X;
    const cy = POT_MOUTH_Y + 1;
    const n = this.landed;
    if (this.burnt) {
      // Black, dry, and stuck to the bottom. It happens to every galley.
      oval(g, cx, cy, 55, 10.5, '#2a1c10');
      for (let i = 0; i < 8; i++) dot(g, cx - 36 + i * 10, cy + Math.sin(i * 1.7) * 3.5, 2.6, '#150e07');
      return;
    }
    if (n === 0) {
      oval(g, cx - 16, cy - 2, 14, 3, 'rgba(220,226,228,0.14)');
      return;
    }
    // Base broth deepens as the argument assembles.
    const broth = n >= 4 ? '#4a2c17' : n >= 3 ? '#54331c' : n >= 2 ? '#8a5b30' : '#6d6357';
    oval(g, cx, cy, 55, 10.5, broth);
    if (n >= 1 && n < 3) {
      for (let i = 0; i < 6; i++) dot(g, cx - 30 + i * 12, cy - 1 + Math.sin(i * 2.7) * 3.5, 2.6, '#e4dcc6');
    }
    if (n >= 2) {
      for (const [ox, oy, r] of [[-26, 1, 9], [-2, -2, 11], [24, 2, 8.5]] as const) {
        oval(g, cx + ox, cy + oy, r, r * 0.55, n >= 3 ? '#8a5b30' : '#c99a66');
        oval(g, cx + ox - 2, cy + oy - 1.5, r * 0.55, r * 0.3, n >= 3 ? '#a87340' : '#e0b884');
      }
    }
    if (n >= 4) {
      // The vinegar gloss: one long unstirred shine.
      oval(g, cx - 10, cy - 3, 26, 3, 'rgba(255,236,200,0.22)', -0.06);
    }
    if (n >= 5) {
      for (const [ox, oy, a] of [[-34, -3, 0.5], [12, 4, -0.4], [34, -2, 0.9]] as const) {
        oval(g, cx + ox, cy + oy, 7, 3, '#4d7440', a);
        oval(g, cx + ox, cy + oy, 7, 1.2, '#3d5c33', a);
      }
    }
    if (n >= 6) {
      for (let i = 0; i < 9; i++) dot(g, cx - 36 + i * 9, cy + Math.sin(i * 2.1) * 4, 1.5, '#241a12');
    }
    // Simmer bubbles once there is liquid to argue in.
    if (n >= 3) {
      for (let i = 0; i < 4; i++) {
        const ph = t * 1.8 + i * 1.9;
        const bx = cx + Math.sin(ph) * (16 + i * 9);
        const k = (ph % 1.4) / 1.4;
        dot(g, bx, cy - 2 + Math.cos(i) * 3, 1.2 + k * 1.4, `rgba(230,200,150,${0.5 - k * 0.4})`);
      }
    }
  }

  /**
   * The reduction gauge, mounted on the stove front: how far down the sauce
   * has gone. The gold band is the window where the pot should come off.
   */
  private simmerGauge(g: CanvasRenderingContext2D, t: number) {
    if (this.simmer < 0) return;
    const x = 62;
    const y = 314;
    const w = 240;
    const h = 14;
    const bx = x + w * SIMMER_READY;
    rr(g, x - 3, y - 3, w + 6, h + 6, 4, '#8a6a44');
    rr(g, x - 1.5, y - 1.5, w + 3, h + 3, 3, '#c9a35f');
    rr(g, x, y, w, h, 3, '#241a12');
    rect(g, bx, y, w * (1 - SIMMER_READY), h, 'rgba(232,192,99,0.24)');
    const k = Math.min(1, this.simmer);
    const col = this.burnt ? '#3a2a1c' : k >= SIMMER_EDGE ? '#c1512f' : k >= SIMMER_READY ? '#e8c063' : '#a8703a';
    rr(g, x, y, Math.max(4, w * k), h, 3, col);
    if (!this.burnt && !this.done && k >= SIMMER_READY) {
      g.globalAlpha = 0.3 + Math.sin(t * 7) * 0.22;
      rr(g, bx, y - 1.5, w * (1 - SIMMER_READY), h + 3, 3, '#ffe2b0');
      g.globalAlpha = 1;
    }
    rect(g, bx - 1, y - 5, 2, h + 10, 'rgba(238,234,220,0.85)');
    g.font = "18px Caveat, 'Segoe Script', cursive";
    g.textAlign = 'left';
    g.fillStyle = this.burnt ? '#d98a6a' : 'rgba(238,234,220,0.9)';
    g.fillText(this.burnt ? 'nasunog' : this.done ? 'tapos na' : 'sarsa', x, y - 8);
  }

  /** The pantry: eight painted things on two boards, one warmed by choice. */
  private pantryShelf(g: CanvasRenderingContext2D, t: number) {
    const sheet = makePantrySheet();
    for (let i = 0; i < PANTRY.length; i++) {
      const flying = this.fly !== null && PANTRY[this.fly.icon] === PANTRY[i] && !this.used.has(PANTRY[i] ?? '');
      if (flying) continue;
      const [sx, sy] = slotPos(i);
      const isCur = i === this.cur && this.feeding;
      const used = this.used.has(PANTRY[i] ?? '');
      let ox = 0;
      if (i === this.wobIdx) ox = Math.sin(this.wobT * 26) * 3.5 * (1 - this.wobT);
      const bob = isCur ? Math.sin(t * 3.2) * 2 : 0;
      if (isCur && galleyGlow) {
        g.globalAlpha = 0.8 + Math.sin(t * 3.2) * 0.15;
        g.drawImage(galleyGlow, sx - 39, sy - 60, 78, 78);
        g.globalAlpha = 1;
        rr(g, sx - 21, sy + 4.5, 42, 4, 2, '#c1512f');
      }
      g.globalAlpha = used ? 0.35 : 1;
      g.drawImage(sheet, i * CELL_W, 0, CELL_W, CELL_H, sx - CELL_W / 2 + ox, sy - CELL_H + 4 + bob, CELL_W, CELL_H);
      g.globalAlpha = 1;
      if (used) {
        g.strokeStyle = 'rgba(238,234,220,0.85)';
        g.lineWidth = 2.6;
        g.beginPath();
        g.moveTo(sx - 8, sy - 20);
        g.lineTo(sx - 2, sy - 13);
        g.lineTo(sx + 9, sy - 32);
        g.stroke();
      }
    }
    // The chalk name plate reads out whatever your hand is hovering over.
    if (this.feeding) {
      g.font = "600 20px Caveat, 'Segoe Script', cursive";
      g.textAlign = 'center';
      g.fillStyle = 'rgba(238,234,220,0.95)';
      g.fillText(PANTRY[this.cur] ?? '', 520, 131);
    }
  }

  /** The ingredient in the air, on its way to becoming dinner. */
  private flyDraw(g: CanvasRenderingContext2D) {
    const f = this.fly;
    if (!f) return;
    const sheet = makePantrySheet();
    const k = f.t;
    const x = f.sx + (POT_X - f.sx) * k;
    const y = f.sy - 22 + (POT_MOUTH_Y - f.sy + 16) * k - Math.sin(Math.PI * k) * 72;
    g.save();
    g.translate(x, y);
    g.rotate(-0.15 + k * 0.9);
    const s = 1 - k * 0.25;
    g.scale(s, s);
    g.drawImage(sheet, f.icon * CELL_W, 0, CELL_W, CELL_H, -CELL_W / 2, -CELL_H / 2, CELL_W, CELL_H);
    g.restore();
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
    found:
      '"The Amanogawa. Two stars wait on its banks all year to meet for one night: Tanabata. In twelve days I watch it from my grandmother\'s roof."',
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

/** Sky field in scene pixels: fractions map through these. */
const FIELD_H = 280;
const FIELD_TOP = 6;
const fpx = (fx: number) => fx * SCENE_W;
const fpy = (fy: number) => FIELD_TOP + fy * FIELD_H;

/** Constellation ink: polylines drawn on when each reading is found. */
const LINES: [number, number][][][] = [
  [
    // The hunter: the classic hourglass, feet to belt to shoulders.
    [[0.09, 0.82], [0.13, 0.71], [0.1, 0.62], [0.2, 0.6], [0.18, 0.69], [0.22, 0.8]],
    [[0.13, 0.71], [0.155, 0.7], [0.18, 0.69]],
  ],
  [
    // The Yacana: a loop around her darkness, neck reaching up the river.
    [
      [0.42, 0.50], [0.40, 0.38], [0.43, 0.27], [0.49, 0.21], [0.55, 0.19], [0.60, 0.15],
      [0.635, 0.175], [0.61, 0.24], [0.555, 0.28], [0.52, 0.36], [0.515, 0.46], [0.42, 0.50],
    ],
  ],
  [
    // The Amanogawa: the river's own line, northeast along the bright dust.
    [[0.60, 0.40], [0.655, 0.33], [0.70, 0.25], [0.76, 0.185], [0.83, 0.125], [0.895, 0.075], [0.945, 0.05]],
  ],
];

const LABEL_AT: [number, number][] = [[0.155, 0.545], [0.485, 0.565], [0.79, 0.27]];
const LINE_COLOR = ['rgba(240,214,150,0.9)', 'rgba(190,176,224,0.75)', 'rgba(200,222,244,0.8)'];
/** Whose sky each reading belongs to: the tag says it so nobody has to. */
const SKY_OF = ["the mate's sky", "Nani's sky", "Hana's sky"];

/** Per-star twinkle phases and speeds, fixed so the sky never crawls. */
const TWINKLE: [number, number][] = STARS.map((_, i) => {
  const r = new Rng(i * 131 + 7);
  return [r.next() * Math.PI * 2, 0.9 + r.next() * 1.6];
});

let skyBg: HTMLCanvasElement | null = null;

/** The night: indigo gradient, the Mayu, and the llama's darkness. Baked. */
function makeSkyBg(): HTMLCanvasElement {
  if (skyBg) return skyBg;
  const { cv, g } = surface(700, 400);
  g.translate(30, 30);
  vgrad(g, -30, -30, 700, 400, '#0a1124', '#101b30');
  vgrad(g, -30, 210, 700, 100, 'rgba(24,36,60,0)', 'rgba(30,44,70,0.5)');
  // The Mayu: a diagonal band of faint dust and softer light.
  const r = new Rng(1974);
  g.save();
  g.translate(fpx(0.62), fpy(0.28));
  g.rotate(-0.62);
  g.filter = 'blur(10px)';
  for (const [bx, bw] of [[-220, 190], [-40, 220], [150, 180]] as const) {
    g.fillStyle = 'rgba(186,204,232,0.10)';
    oval(g, bx, 0, bw * 0.7, 34, 'rgba(186,204,232,0.10)');
  }
  g.filter = 'none';
  for (let i = 0; i < 260; i++) {
    const dx = (r.next() - 0.5) * 640;
    const dy = (r.next() - 0.5) * 76 * (1 - Math.abs(dx) / 800);
    dot(g, dx, dy, 0.5 + r.next() * 1.1, `rgba(214,226,244,${0.05 + r.next() * 0.14})`);
  }
  g.restore();
  // The Yacana: the dark shape inside the light, drinking.
  g.save();
  g.filter = 'blur(7px)';
  g.fillStyle = 'rgba(4,7,14,0.78)';
  g.beginPath();
  g.ellipse(fpx(0.47), fpy(0.38), 46, 26, -0.45, 0, Math.PI * 2);
  g.fill();
  g.beginPath();
  g.ellipse(fpx(0.56), fpy(0.25), 34, 17, -0.85, 0, Math.PI * 2);
  g.fill();
  g.beginPath();
  g.ellipse(fpx(0.615), fpy(0.17), 13, 9, -0.6, 0, Math.PI * 2);
  g.fill();
  g.filter = 'none';
  g.restore();
  skyBg = cv;
  return cv;
}

let railFg: HTMLCanvasElement | null = null;

/** The ship's rail at the bottom of the night, silhouette and moon-rim. */
function makeRailFg(): HTMLCanvasElement {
  if (railFg) return railFg;
  const { cv, g } = surface(700, 160);
  // A mast and its stays, holding up the left edge of the sky.
  rect(g, 36, 0, 5, 84, '#0a0e15');
  g.strokeStyle = 'rgba(12,17,26,0.8)';
  g.lineWidth = 1.6;
  g.beginPath();
  g.moveTo(38, 4);
  g.lineTo(150, 78);
  g.moveTo(38, 26);
  g.lineTo(0, 70);
  g.stroke();
  // Top rail with one thread of starlight along it.
  rr(g, 0, 74, 700, 6, 3, '#0c1119');
  rect(g, 0, 74, 700, 1.5, 'rgba(150,178,214,0.30)');
  rect(g, 0, 104, 700, 3.5, '#0a0e15');
  for (let x = 20; x < 700; x += 56) rect(g, x, 78, 4, 48, '#090d14');
  // Bulwark and deck.
  rect(g, 0, 126, 700, 34, '#070a10');
  rect(g, 0, 126, 700, 1.5, 'rgba(120,150,190,0.14)');
  // A bollard and a sleeping coil of rope.
  rr(g, 108, 108, 26, 20, 3, '#0a0f16');
  oval(g, 121, 108, 15, 5, '#10151d');
  g.strokeStyle = '#121009';
  for (let i = 0; i < 3; i++) {
    g.lineWidth = 4 - i;
    g.beginPath();
    g.ellipse(232, 128, 16 - i * 4, 6 - i * 1.6, 0, 0, Math.PI * 2);
    g.stroke();
  }
  railFg = cv;
  return cv;
}

let starGlow: HTMLCanvasElement | null = null;
let starCross: HTMLCanvasElement | null = null;
let chartCard: HTMLCanvasElement | null = null;
let chartLoaded = false;

/** Nani's chart: an 1825 Urania's Mirror plate, taped in like a stamp. */
function makeChartCard(): HTMLCanvasElement {
  if (chartCard) return chartCard;
  const { cv } = surface(150, 210);
  chartCard = cv;
  paintChartCard(null);
  const im = new Image();
  im.onload = () => {
    chartLoaded = true;
    paintChartCard(im);
  };
  im.src = '/assets/games/uranias-mirror-orion.jpg';
  return cv;
}

function paintChartCard(im: HTMLImageElement | null) {
  const cv = chartCard;
  const g = cv?.getContext('2d');
  if (!cv || !g) return;
  g.clearRect(0, 0, 150, 210);
  // Soft thrown shadow, baked into the card so it rotates along.
  g.save();
  g.filter = 'blur(6px)';
  g.fillStyle = 'rgba(0,0,0,0.4)';
  g.beginPath();
  g.roundRect(17, 17, 124, 190, 3);
  g.fill();
  g.filter = 'none';
  g.restore();
  // The card: aged cream stock.
  vgrad(g, 13, 11, 124, 190, '#efe3c6', '#e2d2ac');
  g.strokeStyle = 'rgba(120,96,60,0.35)';
  g.lineWidth = 1;
  g.strokeRect(15.5, 13.5, 119, 185);
  // The plate itself, or its promise while the scan is still in the post.
  if (im) {
    g.drawImage(im, 25, 19, 100, 144);
    g.fillStyle = 'rgba(214,168,96,0.13)';
    g.fillRect(25, 19, 100, 144);
  } else {
    rect(g, 25, 19, 100, 144, '#e8dcbe');
  }
  g.strokeStyle = 'rgba(90,70,44,0.4)';
  g.strokeRect(25, 19, 100, 144);
  // Hand caption under the plate.
  g.font = "15px Caveat, 'Segoe Script', cursive";
  g.textAlign = 'center';
  g.fillStyle = '#6b543a';
  g.fillText("Nani's chart · 1825", 75, 183);
  // The stamp-frame conceit: perforated edges, punched clean through.
  g.save();
  g.globalCompositeOperation = 'destination-out';
  for (let x = 13; x <= 137; x += 8) {
    dot(g, x, 11, 2.4, '#000');
    dot(g, x, 201, 2.4, '#000');
  }
  for (let y = 11; y <= 201; y += 8) {
    dot(g, 13, y, 2.4, '#000');
    dot(g, 137, y, 2.4, '#000');
  }
  g.restore();
  // Two strips of old tape, the kind that outlives the taper.
  for (const [tx, ty, ta] of [[24, 6, -0.5], [124, 196, -0.5]] as const) {
    g.save();
    g.translate(tx, ty);
    g.rotate(ta);
    g.fillStyle = 'rgba(235,224,196,0.55)';
    g.fillRect(-16, -7, 32, 14);
    g.strokeStyle = 'rgba(255,255,255,0.25)';
    g.lineWidth = 1;
    g.strokeRect(-16, -7, 32, 14);
    g.restore();
  }
}

let starVig: HTMLCanvasElement | null = null;

type Shoot = { x: number; y: number; vx: number; vy: number; age: number };

const STAR_LEGEND = [
  { keys: ['left', 'right', 'up', 'down'], does: 'swing the glass across the sky' },
  { keys: ['space'], does: 'name what is in it' },
] as const;

export class StarPanel {
  private target = 0;
  private cx = 5;
  private cy = 3;
  private done = false;
  private hint = '';
  private onDone: (() => void) | null = null;

  private sc = new Scene(SCENE_W, SCENE_H);
  private ui: { setHint: (h: string) => void } | null = null;
  private rx = 0;
  private ry = 0;
  private foundP = [0, 0, 0];
  private labelA = [0, 0, 0];
  private missT = 1;
  private shoot: Shoot | null = null;
  private shootIn = 5;

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
    this.foundP = [0, 0, 0];
    this.labelA = [0, 0, 0];
    this.missT = 1;
    this.shoot = null;
    this.shootIn = 5;
    this.hint = `${TARGETS[0]?.ask ?? ''} Arrows steer your eyes; Space says "there."`;
    makeSkyBg();
    makeRailFg();
    makeChartCard();
    starGlow ??= bakeGlow('rgba(242,234,216,0.95)', 20);
    starCross ??= bakeStarCross();
    starVig ??= bakeVignette('4,7,16', 0.34);
    this.rx = ((this.cx + 0.5) / GRID_W) * SCENE_W;
    this.ry = FIELD_TOP + ((this.cy + 0.5) / GRID_H) * FIELD_H;
    this.sc.restart();
    this.ui = mountScene(this.root, 'The Star Deck', this.sc, STAR_LEGEND);
    fixHintLeading(this.root);
    this.root.hidden = false;
  }

  onDir(dir: Dir) {
    if (this.done) return;
    if (dir === 'left') this.cx = Math.max(0, this.cx - 1);
    if (dir === 'right') this.cx = Math.min(GRID_W - 1, this.cx + 1);
    if (dir === 'up') this.cy = Math.max(0, this.cy - 1);
    if (dir === 'down') this.cy = Math.min(GRID_H - 1, this.cy + 1);
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
      this.beginFound(this.target - 1);
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
      this.missT = 0;
      this.sc.tween(0, 1, 0.4, easeOutCubic, (v) => {
        this.missT = v;
      });
    }
  }

  tick(dt: number) {
    if (!this.isOpen) return;
    // The reticle glides; nothing on this deck teleports.
    const tx = ((this.cx + 0.5) / GRID_W) * SCENE_W;
    const ty = FIELD_TOP + ((this.cy + 0.5) / GRID_H) * FIELD_H;
    const k = Math.min(1, dt * 10);
    this.rx += (tx - this.rx) * k;
    this.ry += (ty - this.ry) * k;
    // A shooting star every little while, because the Pacific shows off.
    if (!calm()) {
      this.shootIn -= dt;
      if (this.shootIn <= 0 && !this.shoot) {
        this.shootIn = 6 + Math.random() * 6;
        this.shoot = { x: 80 + Math.random() * 420, y: 20 + Math.random() * 60, vx: 200 + Math.random() * 120, vy: 70, age: 0 };
      }
      if (this.shoot) {
        this.shoot.x += this.shoot.vx * dt;
        this.shoot.y += this.shoot.vy * dt;
        this.shoot.age += dt;
        if (this.shoot.age > 0.7) this.shoot = null;
      }
    }
    this.sc.frame(dt, (g) => this.paint(g));
    this.ui?.setHint(this.hint);
  }

  /** Ink the found constellation on, then let its name settle in. */
  private beginFound(i: number) {
    const t = TARGETS[i];
    if (!t) return;
    this.sc.flash('#ffe9b8', 0.28);
    const cx = fpx((t.rect[0] + t.rect[2]) / 2);
    const cy = fpy((t.rect[1] + t.rect[3]) / 2);
    this.sc.burst(cx, cy, { n: calm() ? 5 : 14, color: '#e8c063', speed: 60, size: 2, life: 0.8, grav: -10, kind: 'spark' });
    this.sc.tween(0, 1, 1.15, easeInOutSine, (v) => {
      this.foundP[i] = v;
    }, () => {
      this.sc.tween(0, 1, 0.6, easeInOutSine, (v) => {
        this.labelA[i] = v;
      });
    });
  }

  // ------------------------------------------------------------- painting

  private paint(g: CanvasRenderingContext2D) {
    const t = this.sc.time;
    const roll = wobble(t, 0.4);
    rect(g, 0, 0, SCENE_W, SCENE_H, '#0a1124');
    // Sky, stars, ink, and reticle all lean together with the ship.
    g.save();
    g.translate(320, 620);
    g.rotate(roll * 0.011);
    g.translate(-320, -620);
    if (skyBg) g.drawImage(skyBg, -30, -30);
    this.starsDraw(g, t);
    if (this.shoot) {
      const s = this.shoot;
      const a = (1 - s.age / 0.7) * 0.8;
      g.strokeStyle = `rgba(244,240,226,${a})`;
      g.lineWidth = 1.4;
      g.beginPath();
      g.moveTo(s.x, s.y);
      g.lineTo(s.x - s.vx * 0.11, s.y - s.vy * 0.11);
      g.stroke();
    }
    this.constellations(g, t);
    this.reticle(g, t);
    g.restore();
    // The rail sways a half-step against the sky.
    g.save();
    g.translate(320, 400);
    g.rotate(-roll * 0.005);
    g.translate(-320, -400);
    if (railFg) g.drawImage(railFg, -30 + roll * 3, 188);
    g.restore();
    this.tracker(g);
    const card = makeChartCard();
    g.save();
    g.translate(548, 244);
    g.rotate(-0.085 + wobble(t, 0.7, 1) * 0.006);
    g.drawImage(card, -75, -105);
    g.restore();
    if (starVig) g.drawImage(starVig, 0, 0);
    void chartLoaded;
  }

  /** The fixed sky, each star breathing on its own clock. */
  private starsDraw(g: CanvasRenderingContext2D, t: number) {
    const glow = starGlow;
    const cross = starCross;
    if (!glow || !cross) return;
    for (let i = 0; i < STARS.length; i++) {
      const [fx, fy, r] = STARS[i] ?? [0, 0, 1];
      const [ph, sp] = TWINKLE[i] ?? [0, 1];
      const x = fpx(fx);
      const y = fpy(fy);
      const tw = calm() ? 0.1 : 0.24;
      const a = Math.max(0.15, Math.min(1, 0.5 + r * 0.14 + Math.sin(t * sp + ph) * tw));
      const s = r * 7;
      g.globalAlpha = a;
      g.drawImage(glow, x - s / 2, y - s / 2, s, s);
      if (r >= 2.2) {
        g.globalAlpha = a * 0.7;
        const cs = r * 11;
        g.drawImage(cross, x - cs / 2, y - cs / 2, cs, cs);
      }
    }
    g.globalAlpha = 1;
  }

  /** Ink lines drawn on as each reading lands, plus names in Hana's hand. */
  private constellations(g: CanvasRenderingContext2D, t: number) {
    g.lineCap = 'round';
    g.lineJoin = 'round';
    for (let i = 0; i < 3; i++) {
      const p = this.foundP[i] ?? 0;
      if (p <= 0) continue;
      const segs = LINES[i] ?? [];
      let total = 0;
      const lens: number[] = [];
      for (const seg of segs) {
        let l = 0;
        for (let j = 1; j < seg.length; j++) {
          const [ax, ay] = seg[j - 1] ?? [0, 0];
          const [bx, by] = seg[j] ?? [0, 0];
          l += Math.hypot(fpx(bx) - fpx(ax), fpy(by) - fpy(ay));
        }
        lens.push(l);
        total += l;
      }
      let budget = total * p;
      g.strokeStyle = LINE_COLOR[i] ?? 'rgba(240,214,150,0.9)';
      if (i === 1) g.setLineDash([5, 4]);
      for (let s = 0; s < segs.length && budget > 0; s++) {
        const seg = segs[s] ?? [];
        const segLen = lens[s] ?? 0;
        const draw = Math.min(budget, segLen);
        budget -= draw;
        g.lineWidth = 3;
        g.globalAlpha = 0.22;
        this.strokePartial(g, seg, draw);
        g.lineWidth = 1.5;
        g.globalAlpha = 0.95;
        this.strokePartial(g, seg, draw);
      }
      g.setLineDash([]);
      g.globalAlpha = 1;
      // The llama gets her eyes back, and they are warm.
      if (i === 1 && p >= 1) {
        const blink = 0.6 + Math.sin(t * 2.2) * 0.3;
        g.globalAlpha = blink;
        dot(g, fpx(0.588), fpy(0.185), 1.8, '#e8c063');
        dot(g, fpx(0.607), fpy(0.205), 1.6, '#e8c063');
        g.globalAlpha = 1;
      }
      const la = this.labelA[i] ?? 0;
      if (la > 0) {
        const [lx, ly] = LABEL_AT[i] ?? [0.5, 0.5];
        g.globalAlpha = la * 0.9;
        g.font = "17px Caveat, 'Segoe Script', cursive";
        g.textAlign = 'center';
        g.fillStyle = '#e8d3a0';
        g.fillText(TARGETS[i]?.title ?? '', fpx(lx), fpy(ly) + (1 - la) * 6);
        g.globalAlpha = 1;
        // A paper tag under the name: three skies, each claimed in the doing.
        paperTag(g, fpx(lx), fpy(ly) + 16, SKY_OF[i] ?? '', 10, la * 0.9);
      }
    }
  }

  private strokePartial(g: CanvasRenderingContext2D, seg: [number, number][], drawLen: number) {
    g.beginPath();
    let left = drawLen;
    for (let j = 1; j < seg.length && left > 0; j++) {
      const [ax, ay] = seg[j - 1] ?? [0, 0];
      const [bx, by] = seg[j] ?? [0, 0];
      const x0 = fpx(ax);
      const y0 = fpy(ay);
      const x1 = fpx(bx);
      const y1 = fpy(by);
      const l = Math.hypot(x1 - x0, y1 - y0);
      if (j === 1) g.moveTo(x0, y0);
      if (left >= l) {
        g.lineTo(x1, y1);
        left -= l;
      } else {
        const k = left / l;
        g.lineTo(x0 + (x1 - x0) * k, y0 + (y1 - y0) * k);
        left = 0;
      }
    }
    g.stroke();
  }

  /** The brass reticle: your eyes, walking the sky. */
  private reticle(g: CanvasRenderingContext2D, t: number) {
    const shake = (1 - this.missT) * Math.sin(this.missT * 30) * 4;
    const x = this.rx + shake;
    const y = this.ry;
    const r = 15 + Math.sin(t * 2) * 0.8;
    if (starGlow) {
      g.globalAlpha = 0.16;
      g.drawImage(starGlow, x - 26, y - 26, 52, 52);
      g.globalAlpha = 1;
    }
    g.strokeStyle = 'rgba(201,163,95,0.95)';
    g.lineWidth = 1.8;
    g.beginPath();
    g.arc(x, y, r, 0, Math.PI * 2);
    g.stroke();
    const rot = t * 0.3;
    g.strokeStyle = '#c1512f';
    g.lineWidth = 2;
    for (let i = 0; i < 4; i++) {
      const a = rot + (i * Math.PI) / 2;
      g.beginPath();
      g.moveTo(x + Math.cos(a) * (r + 2), y + Math.sin(a) * (r + 2));
      g.lineTo(x + Math.cos(a) * (r + 7), y + Math.sin(a) * (r + 7));
      g.stroke();
    }
    dot(g, x, y, 1.5, '#e8c063');
  }

  /** Three names on the rail; the found ones get their star back. */
  private tracker(g: CanvasRenderingContext2D) {
    g.font = "16px Caveat, 'Segoe Script', cursive";
    g.textAlign = 'left';
    let x = 20;
    for (let i = 0; i < TARGETS.length; i++) {
      const foundNow = i < this.target;
      const mark = foundNow ? '✦ ' : '· ';
      g.fillStyle = foundNow ? '#e8c063' : 'rgba(120,134,158,0.85)';
      const text = mark + (TARGETS[i]?.title ?? '');
      g.fillText(text, x, 330);
      x += g.measureText(text).width + 22;
    }
  }
}

/** Four thin diffraction points for the brightest stars. Baked once. */
function bakeStarCross(): HTMLCanvasElement {
  const { cv, g } = surface(48, 48);
  const grad = g.createLinearGradient(0, 24, 48, 24);
  grad.addColorStop(0, 'rgba(242,234,216,0)');
  grad.addColorStop(0.5, 'rgba(242,234,216,0.9)');
  grad.addColorStop(1, 'rgba(242,234,216,0)');
  g.fillStyle = grad;
  g.fillRect(0, 23.2, 48, 1.6);
  const grad2 = g.createLinearGradient(24, 0, 24, 48);
  grad2.addColorStop(0, 'rgba(242,234,216,0)');
  grad2.addColorStop(0.5, 'rgba(242,234,216,0.9)');
  grad2.addColorStop(1, 'rgba(242,234,216,0)');
  g.fillStyle = grad2;
  g.fillRect(23.2, 0, 1.6, 48);
  return cv;
}
