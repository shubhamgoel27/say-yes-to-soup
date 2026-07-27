import type { Dir } from '../../engine/input';
import type { AudioBus } from '../../engine/audio';
import { Scene, mountScene, wobble, easeOutCubic, keyCap } from './scene';
import { type Surface, Rng, surface, rect, rr, oval, dot, vgrad, shade, glowSpot } from '../../art/pix';

/**
 * Chapter Nine's two hands-on verbs.
 *
 * MolePanel: the hour of stirring. You walk the wooden spoon in circles while
 * Abuela Chela narrates thirty ingredients' worth of memory. Wrong directions
 * just slosh. The one real danger is the comal at your elbow: let the chiles
 * catch and the whole pot goes bitter, which is the only thing a mole cook is
 * actually afraid of. Chela has done it herself, so the pot simply starts over.
 *
 * OfrendaPanel: building Nani's ofrenda, three levels, no wrong answers.
 * Every placement echoes a chapter of the journey; the altar is the journal
 * with candles. Items appear based on what the player actually carried here.
 */

// ------------------------------------------------------------ shared helpers

const reduceMotion = () => document.body.classList.contains('reduce-motion');

function hex2(c: string): [number, number, number] {
  const n = Number.parseInt(c.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** Linear mix of two hex colors; t in [0, 1]. */
function mix(a: string, b: string, t: number): string {
  const [ar, ag, ab] = hex2(a);
  const [br, bg, bb] = hex2(b);
  const q = (x: number, y: number) => Math.round(x + (y - x) * t);
  return `rgb(${q(ar, br)},${q(ag, bg)},${q(ab, bb)})`;
}

/** Sample a multi-stop color ramp at t in [0, 1]. */
function ramp(stops: string[], t: number): string {
  const n = stops.length - 1;
  const k = Math.max(0, Math.min(0.999, t)) * n;
  const i = Math.floor(k);
  return mix(stops[i] ?? '#000', stops[i + 1] ?? stops[i] ?? '#000', k - i);
}

/** Soft radial glow baked once; drawn per frame with plain drawImage. */
function bakeGlow(color: string, r = 64): Surface {
  const s = surface(r * 2, r * 2);
  const grad = s.g.createRadialGradient(r, r, 0, r, r, r);
  grad.addColorStop(0, color);
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  s.g.fillStyle = grad;
  s.g.fillRect(0, 0, r * 2, r * 2);
  return s;
}

// ------------------------------------------------------------ the save peek

/**
 * Panels are built at boot with no handle on GameState, so the ofrenda reads
 * the autosave (written on every flag change, always current by open()).
 */
function savedFlags(): Set<string> {
  try {
    const raw = localStorage.getItem('elsewhere.save');
    if (!raw) return new Set();
    const data = JSON.parse(raw) as { flags?: string[] };
    return new Set(data.flags ?? []);
  } catch {
    return new Set();
  }
}

// ------------------------------------------------------------ the mole

const STIR_ORDER: Dir[] = ['up', 'right', 'down', 'left'];
const STIR_ROUNDS = 6;

const STIR_LINES = [
  'Chela: The chilhuacle is from La Cañada. One little valley grows it for the whole world, and barely.',
  'Chela: Burnt tortilla goes in. Burnt on purpose. Black is a flavor if you mean it.',
  'Chela: Almonds, raisins, sesame. Thirty things that argue in the bag and agree in the pot.',
  'Chela: My mother stirred this the year your Nani ate here. Same pot. Pots remember.',
  'Chela: The chocolate goes in last and thanks you for waiting.',
  'Chela: Slower. Mole can smell a hurry.',
];

/** The mole's hour, as color: raw chile red down to polished-olla black. */
const MOLE_RAMP = ['#a83a26', '#7c2e1c', '#54211a', '#33170f', '#1c0f0a'];

// The comal keeps its own clock. Now and then the chiles start to catch and
// you have this many seconds to sweep them off before the pot turns bitter.
const SMOKE_GRACE = 5;
const SMOKE_FIRST = 9;
const SMOKE_GAP = 11;
const SMOKE_WARN =
  '<b>Smoke off the comal.</b> The chiles are catching. Space, now, sweep them off the heat.';
const SMOKE_SAVED = 'Off the heat in time. Chela, without turning around: good ears. That is most of cooking.';
const SCORCHED =
  'The chiles go to carbon and the smoke turns bitter. Chela lifts the whole pot off the fire, saying nothing unkind.<br>' +
  '<b>Chela:</b> I have burnt this mole twice, hija, and once with my mother watching. Space, and we begin the pot again.';
const SECOND_POT = 'Fresh chiles, a washed pot, the same hour ahead. The second one is always better. She would know.';
const OPENING = 'The spoon stands up in the pot by itself. Stir in circles: up, right, down, left.';

const POT_X = 300;
const POT_Y = 184;
const POT_RX = 82;
const STIR_R = 52;

let cocinaBg: Surface | null = null;
let emberGlow: Surface | null = null;

/** Chela's kitchen, baked once: adobe, window light, shelf, hearth, cazuela. */
function bakeCocina(): Surface {
  if (cocinaBg) return cocinaBg;
  const s = surface(640, 340);
  const g = s.g;
  const r = new Rng(99173);

  // Adobe wall, smoke-darkened toward the rafters.
  vgrad(g, 0, 0, 640, 262, '#8a5330', '#a5673c');
  for (let i = 0; i < 110; i++) dot(g, r.int(640), r.int(255), 0.8 + r.next() * 1.5, 'rgba(43,33,24,0.06)');
  vgrad(g, 0, 0, 640, 70, 'rgba(24,15,10,0.42)', 'rgba(24,15,10,0)');
  glowSpot(g, 300, 40, 200, '#241610', 0.35);

  // Window with late valley light.
  rr(g, 48, 38, 112, 102, 5, '#5c4030');
  vgrad(g, 56, 46, 96, 86, '#ffd9a0', '#e8a35c');
  oval(g, 84, 128, 46, 18, '#b5713f');
  oval(g, 138, 132, 40, 16, '#a5673c');
  dot(g, 130, 66, 8, 'rgba(255,246,220,0.85)');
  rect(g, 102, 46, 4, 86, '#5c4030');
  rect(g, 56, 86, 96, 4, '#5c4030');
  glowSpot(g, 104, 90, 90, 'rgba(255,220,160,0.5)', 0.5);

  // Shelf on the right: chocolate discs, a clay jar, a bottle of mezcal.
  rr(g, 452, 100, 156, 9, 3, '#7d5836');
  rect(g, 462, 109, 6, 12, '#6b4a2e');
  rect(g, 592, 109, 6, 12, '#6b4a2e');
  for (let i = 0; i < 3; i++) oval(g, 492, 96 - i * 7, 18, 6, shade('#3a2418', i * 0.06));
  dot(g, 492, 82, 3, '#54331f');
  oval(g, 545, 88, 13, 5, '#8a5330');
  rr(g, 532, 74, 26, 18, 6, '#a06a42');
  oval(g, 545, 74, 13, 5, shade('#a06a42', 0.15));
  rr(g, 582, 68, 12, 32, 4, '#4e6e50');
  rect(g, 585, 60, 6, 10, '#4e6e50');

  // A ristra of dried chiles by the shelf.
  rect(g, 618, 30, 2, 26, '#6b5636');
  for (let i = 0; i < 7; i++) {
    const cy = 56 + i * 13;
    oval(g, 612 + (i % 2) * 10, cy, 5.5, 11, shade('#7c2e1c', (r.next() - 0.5) * 0.15), 0.5 - (i % 2));
  }

  // The hearth: adobe top band and warm front face.
  rect(g, 0, 238, 640, 26, '#a5673c');
  vgrad(g, 0, 262, 640, 78, '#8a5330', '#5c3a24');
  rect(g, 0, 236, 640, 3, '#c98a54');
  for (let i = 0; i < 40; i++) dot(g, r.int(640), 268 + r.int(66), 1 + r.next() * 1.6, 'rgba(43,33,24,0.08)');

  // The brasero, with its fire mouth under the cazuela.
  oval(g, 300, 262, 116, 26, '#6b4226');
  oval(g, 300, 256, 104, 20, '#54331f');
  rr(g, 266, 252, 68, 36, 14, '#1c0f0a');

  // The cazuela: fat clay body, painted band, wide rim, two handles.
  oval(g, 300, 220, 102, 46, '#7a4a2a');
  oval(g, 274, 206, 40, 22, 'rgba(214,160,104,0.28)');
  g.strokeStyle = '#54331f';
  g.lineWidth = 3;
  g.beginPath();
  g.ellipse(300, 226, 96, 20, 0, 0.25, Math.PI - 0.25);
  g.stroke();
  for (let i = 0; i < 9; i++) dot(g, 224 + i * 19, 238 + Math.sin(i * 1.7) * 3, 2, '#e8dcc4');
  oval(g, 300, 185, 100, 26, '#8a5836');
  oval(g, 300, 185, 88, 22, '#2a1710');
  g.lineWidth = 7;
  g.strokeStyle = '#7a4a2a';
  for (const sx of [-1, 1]) {
    g.beginPath();
    g.arc(300 + sx * 102, 198, 12, sx > 0 ? -0.9 : Math.PI - 2.2, sx > 0 ? 0.9 : Math.PI + 2.2);
    g.stroke();
  }

  // The side comal over coals, where chiles toast and seeds pop.
  oval(g, 505, 250, 66, 15, '#241a12');
  oval(g, 505, 245, 64, 14, '#4a4038');
  oval(g, 505, 243, 56, 11, '#5a5046');
  for (let i = 0; i < 6; i++) dot(g, 470 + i * 14, 258 + (i % 2) * 3, 3, '#33170f');

  // The near counter: sesame bowl, tortilla stack, almonds.
  oval(g, 132, 246, 30, 11, '#8a5330');
  oval(g, 132, 242, 24, 7, '#6b4226');
  for (let i = 0; i < 14; i++) dot(g, 118 + r.int(28), 238 + r.int(6), 1.4, '#e3c98e');
  for (let i = 0; i < 4; i++) oval(g, 196, 246 - i * 4, 26, 5, shade('#d8b678', i * 0.05));
  for (let i = 0; i < 5; i++) oval(g, 248 + i * 9, 248 + (i % 2) * 3, 4, 2.6, '#b5824c', 0.6);

  cocinaBg = s;
  return s;
}

const MOLE_LEGEND = [
  { keys: ['left', 'up', 'right', 'down'], does: 'stir, going the way the circle goes' },
  { keys: ['space'], does: 'when the pot has decided' },
] as const;

export class MolePanel {
  private step = 0;
  private rounds = 0;
  private done = false;
  private failed = false;
  private hint = '';
  private onDone: (() => void) | null = null;
  /** Set when the pot is started over after a scorch, so Chela can say so. */
  private againHint = '';
  /** Seconds until the chiles next catch; -1 while they already are. */
  private comalT = SMOKE_FIRST;
  private smoke = -1;

  private scene: Scene | null = null;
  private setHint: ((h: string) => void) | null = null;
  private spoonA = -Math.PI / 2;
  private spoonTarget = -Math.PI / 2;
  private swirl = 0;
  private trail: { a: number; t: number }[] = [];
  private sloshT = 0;
  private chocoT = -1;
  private steamT = 0;
  private popT = 1.2;
  private restT = 0;

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
    this.rounds = 0;
    this.done = false;
    this.failed = false;
    this.comalT = SMOKE_FIRST;
    this.smoke = -1;
    this.hint = this.againHint || OPENING;
    this.againHint = '';
    this.spoonA = this.spoonTarget = -Math.PI / 2;
    this.swirl = 0;
    this.trail = [];
    this.sloshT = 0;
    this.chocoT = -1;
    this.popT = 1.2;
    this.restT = 0;
    this.scene ??= new Scene();
    this.scene.restart();
    // The #frame ancestor zeroes line-height for canvas layout; restore it
    // here so two-line hints do not collapse onto themselves.
    this.root.style.lineHeight = '1.45';
    this.setHint = mountScene(this.root, 'The Hour of Stirring', this.scene, MOLE_LEGEND).setHint;
    this.setHint(this.hint);
    this.root.hidden = false;
  }

  onDir(dir: Dir) {
    if (this.done || this.failed) return;
    const sc = this.scene;
    if (dir === STIR_ORDER[this.step]) {
      this.step = (this.step + 1) % 4;
      this.audio.slosh();
      this.spoonTarget += Math.PI / 2;
      if (this.step === 0) {
        this.rounds++;
        this.hint = STIR_LINES[Math.min(this.rounds - 1, STIR_LINES.length - 1)] ?? '';
        if (sc) for (let i = 0; i < 3; i++) sc.waft(POT_X - 30 + i * 30, POT_Y - 8, 'rgba(250,244,232,0.4)', 9);
        if (this.rounds === 5) this.chocoT = 0;
        if (this.rounds >= STIR_ROUNDS) {
          this.done = true;
          this.audio.weaveDone();
          sc?.flash('#ffdda8', 0.3);
          this.hint = 'The mole turns glossy and goes quiet, like it has decided something. Press Space.';
        }
      }
    } else {
      this.audio.bump();
      this.sloshT = 0.45;
      if (sc) {
        const p = this.moleColor();
        sc.burst(POT_X + Math.cos(this.spoonA) * 58, POT_Y - 3, { n: 5, color: p, speed: 62, grav: 320, life: 0.4, size: 2.6 });
        if (!reduceMotion()) sc.thump(2.5, 0.02);
      }
      this.hint = 'It sloshes. With the circle, not against it. The pot sets the pace.';
    }
  }

  onAction() {
    if (this.failed) {
      // A burnt pot is not the end of the evening, only of this pot. Same
      // hands, same hour, second try, and the story flag is still unset.
      const done = this.onDone;
      this.onDone = null;
      this.againHint = SECOND_POT;
      if (done) this.open(done);
      return;
    }
    if (this.done) {
      this.root.hidden = true;
      const done = this.onDone;
      this.onDone = null;
      done?.();
      return;
    }
    if (this.smoke >= 0) {
      // The save: bare fingers, one sweep, the chiles land on the cloth.
      this.smoke = -1;
      this.comalT = SMOKE_GAP + Math.random() * 3;
      this.audio.blip();
      this.scene?.burst(505, 236, { n: reduceMotion() ? 3 : 8, color: '#7c2e1c', speed: 96, grav: 300, life: 0.5, size: 2.6 });
      this.scene?.waft(505, 228, 'rgba(240,232,220,0.3)', 7);
      this.hint = SMOKE_SAVED;
      return;
    }
    this.audio.blip();
    this.scene?.waft(POT_X, POT_Y - 10, 'rgba(250,244,232,0.4)', 10);
    this.hint = 'No shortcuts. The hour is an ingredient. Keep the spoon walking.';
  }

  /** The chiles win. Bitter all the way down, and nobody in the room minds. */
  private scorch() {
    this.failed = true;
    this.smoke = -1;
    this.hint = SCORCHED;
    this.audio.denied();
    const sc = this.scene;
    if (sc) {
      sc.flash('#2a1710', 0.35);
      if (!reduceMotion()) sc.thump(4, 0.05);
      for (let i = 0; i < 3; i++) sc.waft(485 + i * 20, 232, 'rgba(38,30,26,0.55)', 12);
    }
  }

  tick(dt: number) {
    if (!this.isOpen || !this.scene) return;
    const sc = this.scene;

    // The spoon eases toward its next quarter turn; the mole keeps a memory
    // of the motion as ambient swirl.
    const gap = this.spoonTarget - this.spoonA;
    const step = gap * Math.min(1, dt * 9);
    this.spoonA += step;
    this.swirl += step + dt * 0.3;
    if (Math.abs(gap) > 0.02 && !this.done) this.trail.push({ a: this.spoonA, t: sc.time });
    while (this.trail.length > 60) this.trail.shift();

    if (this.sloshT > 0) this.sloshT -= dt;
    if (this.chocoT >= 0 && this.chocoT < 2) {
      const was = this.chocoT;
      this.chocoT += dt;
      if (was < 0.85 && this.chocoT >= 0.85) {
        sc.burst(POT_X, POT_Y - 4, { n: reduceMotion() ? 4 : 9, color: '#3a2418', speed: 70, grav: 300, life: 0.45, size: 2.8 });
        if (!reduceMotion()) sc.thump(3, 0.03);
      }
    }
    if (this.done && this.restT < 1) this.restT = Math.min(1, this.restT + dt / 0.8);

    // The comal's own clock: the chiles catch, you get five seconds of smoke
    // and a growing complaint before the pot turns bitter.
    if (!this.done && !this.failed) {
      if (this.smoke < 0) {
        this.comalT -= dt;
        if (this.comalT <= 0) {
          this.smoke = 0;
          this.audio.bump();
          sc.waft(505, 230, 'rgba(60,48,40,0.4)', 9);
        }
      } else {
        this.smoke += dt;
        if (Math.random() < dt * (5 + this.smoke * 3)) {
          const k = Math.min(1, this.smoke / SMOKE_GRACE);
          sc.waft(490 + Math.random() * 32, 232, `rgba(48,38,30,${(0.2 + k * 0.35).toFixed(2)})`, 8 + k * 6);
        }
        if (this.smoke >= SMOKE_GRACE) this.scorch();
      }
    }
    if (this.failed && Math.random() < dt * 6) {
      sc.waft(478 + Math.random() * 54, 230, 'rgba(34,26,22,0.45)', 11 + Math.random() * 6);
    }

    // Steam always; seeds pop on the comal now and then.
    this.steamT -= dt;
    if (this.steamT <= 0) {
      this.steamT = 0.13 + Math.random() * 0.1;
      sc.waft(POT_X + (Math.random() - 0.5) * 88, POT_Y - 6, 'rgba(250,244,232,0.30)', 6 + Math.random() * 4);
      if (Math.random() < 0.4) sc.waft(505 + (Math.random() - 0.5) * 60, 238, 'rgba(240,232,220,0.16)', 5);
    }
    this.popT -= dt;
    if (this.popT <= 0) {
      this.popT = 0.9 + Math.random() * 1.5;
      const px = 480 + Math.random() * 50;
      sc.burst(px, 238, { n: reduceMotion() ? 2 : 5, kind: 'spark', color: '#f4d98c', speed: 74, grav: 240, life: 0.45, size: 2 });
      sc.burst(px, 238, { n: 2, color: '#e8dcc4', speed: 46, grav: 260, life: 0.4, size: 1.6 });
    }

    sc.frame(dt, (g) => this.paint(g));
    const warn = this.smoke >= 0 ? `${SMOKE_WARN}<br>` : '';
    this.setHint?.(warn + this.hint);
  }

  private moleColor(): string {
    if (this.failed) return '#332a22';
    return ramp(MOLE_RAMP, Math.min(1, (this.rounds + this.step / 4) / STIR_ROUNDS));
  }

  private paint(g: CanvasRenderingContext2D) {
    const sc = this.scene as Scene;
    const t = sc.time;
    g.drawImage(bakeCocina().cv, 0, 0);

    // Firelight breathing under the pot, then the flames in the brasero mouth.
    emberGlow ??= bakeGlow('rgba(255,154,60,0.85)');
    g.globalAlpha = 0.4 + 0.1 * wobble(t, 5.2);
    g.drawImage(emberGlow.cv, POT_X - 105, 190, 210, 120);
    g.globalAlpha = 0.3 + 0.08 * wobble(t, 6.1, 2);
    g.drawImage(emberGlow.cv, 445, 205, 120, 74);
    g.globalAlpha = 1;
    for (let i = 0; i < 4; i++) {
      const fx = 279 + i * 14 + wobble(t, 5 + i, i * 2.1) * 3;
      const h = 13 + 6 * wobble(t, 6.4, i * 1.7) + 3 * wobble(t, 11, i);
      oval(g, fx, 280 - h * 0.5, 5.5, h * 0.62, i % 2 ? '#e8863a' : '#c8501e');
      oval(g, fx, 282 - h * 0.34, 3, h * 0.36, '#f4c15c');
    }
    dot(g, 300 + wobble(t, 7) * 2, 281, 2.2, '#fff0c0');

    // Chiles toasting on the comal, darkening round by round, charring late.
    // While they are catching the comal glows hot and they blacken fast.
    const smokeK = this.smoke >= 0 ? Math.min(1, this.smoke / SMOKE_GRACE) : 0;
    if (smokeK > 0 || this.failed) {
      emberGlow ??= bakeGlow('rgba(255,154,60,0.85)');
      g.globalAlpha = this.failed ? 0.2 : 0.3 + 0.3 * smokeK + 0.08 * wobble(t, 9);
      const w = 130 + smokeK * 30;
      g.drawImage(emberGlow.cv, 505 - w / 2, 214, w, 74);
      g.globalAlpha = 1;
    }
    const toast = Math.min(1, this.rounds / STIR_ROUNDS + 0.08);
    const chileC = this.failed ? '#120a08' : mix('#b03524', '#2e1410', Math.min(1, toast + smokeK * 0.55));
    const spots: [number, number, number][] = [[483, 239, 0.5], [508, 234, -0.4], [530, 241, 0.9]];
    for (const [cx, cy, rot] of spots) {
      oval(g, cx, cy + wobble(t, 9, cx) * 0.6, 12, 4.6, chileC, rot);
      dot(g, cx - Math.cos(rot) * 11, cy - 4, 1.6, '#4d7440');
      if (toast > 0.45) {
        dot(g, cx + 3, cy, 1.3, 'rgba(20,10,6,' + (toast * 0.8).toFixed(2) + ')');
        dot(g, cx - 4, cy + 1, 1, 'rgba(20,10,6,' + (toast * 0.7).toFixed(2) + ')');
      }
    }

    // Heat shimmer standing over the comal.
    g.strokeStyle = 'rgba(255,238,214,0.09)';
    g.lineWidth = 4;
    for (let c = 0; c < 3; c++) {
      const x0 = 480 + c * 22;
      g.beginPath();
      for (let y = 232; y >= 160; y -= 7) {
        const x = x0 + Math.sin(y * 0.11 + t * 4 + c * 2) * 4;
        if (y === 232) g.moveTo(x, y);
        else g.lineTo(x, y);
      }
      g.stroke();
    }

    // The mole surface: the whole hour told as one deepening color.
    const molc = this.moleColor();
    const sloshK = this.sloshT > 0 ? (this.sloshT / 0.45) * Math.sin(t * 26) : 0;
    g.save();
    g.translate(POT_X, POT_Y);
    g.scale(1 + sloshK * 0.02, 0.25 * (1 - sloshK * 0.06));
    g.fillStyle = molc;
    g.beginPath();
    g.arc(0, 0, POT_RX, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = 'rgba(20,10,6,0.5)';
    g.lineWidth = 7;
    g.beginPath();
    g.arc(0, 0, POT_RX - 3, 0, Math.PI * 2);
    g.stroke();

    // Swirl rings that follow the spoon, plus the fading vortex trail.
    g.lineWidth = 3;
    for (let i = 0; i < 3; i++) {
      g.strokeStyle = shade(MOLE_RAMP[Math.min(4, this.rounds)] ?? '#54211a', 0.16);
      g.globalAlpha = 0.4 - i * 0.09;
      g.beginPath();
      g.arc(0, 0, 24 + i * 21, this.swirl * (1 - i * 0.18) + i * 2.1, this.swirl * (1 - i * 0.18) + i * 2.1 + 2);
      g.stroke();
    }
    g.lineWidth = 7;
    g.lineCap = 'round';
    for (let i = 1; i < this.trail.length; i++) {
      const a = this.trail[i - 1] as { a: number; t: number };
      const b = this.trail[i] as { a: number; t: number };
      const age = sc.time - b.t;
      if (age > 0.55 || b.a <= a.a) continue;
      g.globalAlpha = (1 - age / 0.55) * 0.55;
      g.strokeStyle = shade(MOLE_RAMP[Math.min(4, this.rounds)] ?? '#54211a', 0.3);
      g.beginPath();
      g.arc(0, 0, STIR_R, a.a, b.a);
      g.stroke();
    }
    g.globalAlpha = 1;

    // The pot is never still: slow blisters rise, swell, and sink again.
    for (let i = 0; i < 4; i++) {
      const bp = (t * 0.5 + i * 0.63) % 1;
      const bx = Math.cos(i * 2.4 + Math.floor(t * 0.5 + i * 0.63) * 2.7) * (18 + i * 13);
      const by = Math.sin(i * 1.7 + Math.floor(t * 0.5 + i * 0.63) * 3.9) * (14 + i * 9);
      const br = Math.sin(bp * Math.PI) * 3.4;
      if (br > 0.4) {
        g.strokeStyle = shade(MOLE_RAMP[Math.min(4, this.rounds)] ?? '#54211a', 0.22);
        g.lineWidth = 2;
        g.globalAlpha = 0.7;
        g.beginPath();
        g.arc(bx, by, br, 0, Math.PI * 2);
        g.stroke();
        g.globalAlpha = 1;
      }
    }

    // A scorched pot skins over: grey islands where the gloss should be.
    if (this.failed) {
      for (let i = 0; i < 9; i++) {
        const a = i * 2.4;
        const rad = 12 + (i % 4) * 18;
        g.globalAlpha = 0.4;
        dot(g, Math.cos(a) * rad, Math.sin(a) * rad, 7 + (i % 3) * 4, '#6b6154');
        g.globalAlpha = 0.3;
        dot(g, Math.cos(a + 1) * rad * 0.8, Math.sin(a + 1) * rad * 0.8, 5 + (i % 2) * 3, '#8a7d68');
      }
      g.globalAlpha = 1;
    }

    // Win gloss: the surface turns lacquer and catches the window light.
    if (this.done) {
      g.globalAlpha = 0.16 + 0.05 * wobble(t, 1.6);
      g.fillStyle = '#fff3d8';
      g.beginPath();
      g.ellipse(-22, -6, 34, 12, -0.4, 0, Math.PI * 2);
      g.fill();
      g.globalAlpha = 1;
    }
    g.restore();

    // The chocolate disc arcs from the shelf and dissolves in a swirl.
    if (this.chocoT >= 0 && this.chocoT < 2) {
      const k = Math.min(1, this.chocoT / 0.85);
      if (k < 1) {
        const e = easeOutCubic(k);
        const x = 492 + (POT_X - 492) * e;
        const y = 86 + (POT_Y - 8 - 86) * e - Math.sin(Math.PI * k) * 64;
        oval(g, x, y, 15, 6.5, '#3a2418', Math.sin(k * 9) * 0.4);
        oval(g, x, y - 2, 11, 4, '#54331f', Math.sin(k * 9) * 0.4);
        dot(g, x, y - 2, 2, '#7a5a38');
      } else {
        const d = (this.chocoT - 0.85) / 1.15;
        g.save();
        g.translate(POT_X, POT_Y);
        g.scale(1, 0.25);
        g.globalAlpha = (1 - d) * 0.7;
        g.strokeStyle = '#2a1810';
        g.lineWidth = 8 * (1 - d * 0.6);
        g.beginPath();
        for (let a = 0; a < 4.6; a += 0.18) {
          const rad = (10 + a * 9) * (1 - d * 0.5);
          const x = Math.cos(a + this.swirl) * rad;
          const y = Math.sin(a + this.swirl) * rad;
          if (a === 0) g.moveTo(x, y);
          else g.lineTo(x, y);
        }
        g.stroke();
        g.restore();
        g.globalAlpha = 1;
      }
    }

    // The wooden spoon: standing and walking circles, then laid to rest.
    const rest = easeOutCubic(this.restT);
    const tipX = POT_X + Math.cos(this.spoonA) * STIR_R * (1 - rest);
    const tipY = POT_Y + Math.sin(this.spoonA) * STIR_R * 0.25 * (1 - rest) - rest * 4;
    const topX = POT_X + Math.cos(this.spoonA) * 34 * (1 - rest) + rest * 108;
    const topY = 88 * (1 - rest) + rest * 172;
    const lean = wobble(t, 1.7) * 1.5 * (1 - rest);
    g.lineCap = 'round';
    g.strokeStyle = '#2b2118';
    g.lineWidth = 10;
    g.beginPath();
    g.moveTo(tipX, tipY);
    g.quadraticCurveTo((tipX + topX) / 2 + lean, (tipY + topY) / 2, topX + lean, topY);
    g.stroke();
    g.strokeStyle = '#c9a35f';
    g.lineWidth = 6.5;
    g.beginPath();
    g.moveTo(tipX, tipY);
    g.quadraticCurveTo((tipX + topX) / 2 + lean, (tipY + topY) / 2, topX + lean, topY);
    g.stroke();
    dot(g, topX + lean, topY, 5.5, '#c9a35f');
    dot(g, topX + lean - 1.5, topY - 1.5, 1.8, '#e8d3a0');
    if (rest > 0.5) oval(g, tipX - 10, tipY, 13, 6, '#b08a4c', 0.15);

    // Where the spoon goes next, on the rim it goes round. The circle is the
    // whole input and it used to be spelled out only in the caption, which is
    // a poor place to keep a thing you need on every single press.
    if (!this.done && !this.failed) {
      const nd = STIR_ORDER[this.step] ?? 'up';
      const na = nd === 'up' ? -Math.PI / 2 : nd === 'down' ? Math.PI / 2 : nd === 'left' ? Math.PI : 0;
      const kx = POT_X + Math.cos(na) * (POT_RX + 20);
      const ky = POT_Y + Math.sin(na) * (POT_RX * 0.25 + 22);
      const puff = 0.86 + Math.abs(wobble(t, 3.4)) * 0.1;
      keyCap(g, kx, ky, nd, 0.95, puff);
      // The three still to come, faint, so the round reads as a round.
      for (let i = 1; i < 4; i++) {
        const d2 = STIR_ORDER[(this.step + i) % 4] ?? 'up';
        const a2 = d2 === 'up' ? -Math.PI / 2 : d2 === 'down' ? Math.PI / 2 : d2 === 'left' ? Math.PI : 0;
        keyCap(
          g,
          POT_X + Math.cos(a2) * (POT_RX + 20),
          POT_Y + Math.sin(a2) * (POT_RX * 0.25 + 22),
          d2,
          0.28,
          0.72,
        );
      }
    }

    // The six rounds, told as six little chiles on the hearth edge.
    for (let i = 0; i < STIR_ROUNDS; i++) {
      const cx = 66 + i * 25;
      if (i < this.rounds) {
        oval(g, cx, 305, 8, 4.4, '#7c2e1c', 0.35);
        dot(g, cx - 6, 302, 1.4, '#4d7440');
        dot(g, cx - 2, 303.6, 1.2, 'rgba(255,236,200,0.5)');
      } else {
        g.strokeStyle = 'rgba(242,230,208,0.5)';
        g.lineWidth = 1.6;
        g.beginPath();
        g.ellipse(cx, 305, 8, 4.4, 0.35, 0, Math.PI * 2);
        g.stroke();
      }
    }
  }
}

// ------------------------------------------------------------ the ofrenda

type OfrendaItem = { id: string; label: string; echo: string };

const LEVELS = ['cielo, for what guides', 'the table, for what feeds', 'earth, for what walks'];

function buildItems(flags: Set<string>): OfrendaItem[] {
  const items: OfrendaItem[] = [
    {
      id: 'photo',
      label: 'her photograph, from the journal',
      echo: 'Refugio wipes the glass with her thumb. Fifty years, and the smile has not aged a day.',
    },
    {
      id: 'cempa',
      label: 'cempasúchil, a double armful',
      echo: 'The scent climbs the room. Orange is how the dead find the door, Elías says. She always found doors.',
    },
    {
      id: 'agua',
      label: 'a clay cup of water',
      echo: 'For the thirsty traveler. She crossed an ocean twice. She will be thirsty.',
    },
    {
      id: 'pan',
      label: 'pan de muerto, carita up',
      echo: 'The little face looks out from the crown of the loaf. The panadero pressed it there for her by name.',
    },
  ];
  if (flags.has('c9.of.omiyage')) {
    items.push({
      id: 'omiyage',
      label: 'the omiyage from Shionoura',
      echo: 'A gift wrapped for one friend, arriving for another. Kindness reroutes. It does not expire.',
    });
  }
  if (flags.has('c9.of.kanga')) {
    items.push({
      id: 'kanga',
      label: 'the kanga meant for giving',
      echo: 'One worn, one given, Bi Amina said. The cloth finally learns who it was folded for.',
    });
  }
  if (flags.has('c9.of.wish')) {
    const echo = flags.has('wish.nani')
      ? 'The Tanabata wish, refolded. You asked the sky to help you find her. The altar answers: found.'
      : flags.has('wish.people')
        ? 'The Tanabata wish, refolded. You asked for the people of the road. Tonight they are all one village.'
        : 'The Tanabata wish, refolded. You asked for a safe road. It ended at an altar, which is safe enough.';
    items.push({ id: 'wish', label: 'the tanzaku wish, refolded', echo });
  }
  items.push({
    id: 'band',
    label: 'the woven band at your wrist',
    echo: 'You hold your wrist to the candle. The grana answers the marigolds. The band stays on; some things are carried, not left.',
  });
  return items;
}

/** Tier geometry: [left, right, item base y] from the top level down. */
const TIERS: [number, number, number][] = [
  [250, 470, 113],
  [210, 510, 166],
  [170, 550, 219],
];
const TIER_CAP = [4, 6, 8];
const CANDLES: [number, number][] = [[264, 113], [456, 113], [224, 166], [496, 166], [184, 219], [536, 219]];
const HELD: [number, number] = [86, 296];
const VELA: [number, number] = [360, 300];

type Placed = { id: string; level: number; x: number; y: number; tilt: number; t: number; land: number };

let altarBg: Surface | null = null;
let candleGlow: Surface | null = null;
let picado: Surface[] | null = null;

/** One marigold pom, the flower the whole holiday runs on. */
function pom(g: CanvasRenderingContext2D, x: number, y: number, r: number, rng: Rng) {
  dot(g, x, y, r, '#c96a2e');
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2 + rng.next();
    dot(g, x + Math.cos(a) * r * 0.55, y + Math.sin(a) * r * 0.55, r * 0.42, '#e8863a');
  }
  dot(g, x, y, r * 0.34, '#f4b04c');
}

/** Refugio's front room at dusk, baked once: wall, window, tiers, arch. */
function bakeAltar(): Surface {
  if (altarBg) return altarBg;
  const s = surface(640, 340);
  const g = s.g;
  const r = new Rng(41977);

  // Dusk wall warming toward the floor, where the candles will live.
  vgrad(g, 0, 0, 640, 340, '#453353', '#8a5330');
  for (let i = 0; i < 120; i++) dot(g, r.int(640), r.int(340), 0.8 + r.next() * 1.4, 'rgba(30,20,32,0.06)');

  // Window onto the last of the light.
  rr(g, 28, 44, 108, 128, 5, '#4a3226');
  vgrad(g, 36, 52, 92, 112, '#222a54', '#e8863a');
  oval(g, 60, 162, 42, 16, '#241a2e');
  oval(g, 112, 166, 44, 18, '#2e2238');
  dot(g, 58, 70, 1.6, '#f2e6d0');
  dot(g, 96, 62, 1.2, '#f2e6d0');
  dot(g, 116, 84, 1.4, '#f2e6d0');
  dot(g, 76, 96, 5.5, 'rgba(244,230,196,0.9)');
  rect(g, 78, 52, 4, 112, '#4a3226');
  rect(g, 36, 106, 92, 4, '#4a3226');

  // Clay floor and the petal path that leads the dead to the door.
  vgrad(g, 0, 282, 640, 58, '#6b4a30', '#4a3020');
  for (let i = 0; i < 60; i++) {
    const t = r.next();
    dot(g, 360 + (r.next() - 0.5) * (40 + t * 150), 336 - t * 48, 1.6 + r.next() * 1.6, r.chance(0.7) ? '#e8863a' : '#c96a2e');
  }

  // The altar: cloth falling to the floor, then three stepped tiers.
  g.fillStyle = '#e9dcc2';
  g.beginPath();
  g.moveTo(170, 224);
  g.lineTo(550, 224);
  g.lineTo(584, 322);
  g.lineTo(136, 322);
  g.closePath();
  g.fill();
  for (let i = 0; i < 9; i++) {
    const x = 168 + i * 46;
    g.strokeStyle = 'rgba(120,95,60,0.18)';
    g.lineWidth = 3;
    g.beginPath();
    g.moveTo(x, 240);
    g.lineTo(x + (i - 4) * 3.4, 318);
    g.stroke();
  }
  const face = (li: number, top: number, bot: number) => {
    const [l, rg] = TIERS[li] as [number, number, number];
    vgrad(g, l, top, rg - l, bot - top, '#f2e6d0', '#dcc9a4');
    rect(g, l, top, rg - l, 3.5, '#faf2e0');
    rect(g, l, top + 5, rg - l, 1.5, 'rgba(160,35,53,0.4)');
    for (let x = l + 7; x < rg - 3; x += 13) {
      g.fillStyle = '#f2e6d0';
      g.beginPath();
      g.arc(x, bot, 5.5, 0, Math.PI);
      g.fill();
      dot(g, x, bot - 1, 1.2, 'rgba(138,98,56,0.35)');
    }
  };
  face(2, 214, 258);
  face(1, 161, 210);
  face(0, 108, 157);

  // A woven hem at the cloth's foot, and loose petals up on the tiers.
  for (let i = 0; i < 30; i++) {
    const c = ['#c1512f', '#c8a55b', '#4e8fa6', '#a02335', '#e8dcc4'][i % 5] ?? '#c1512f';
    rect(g, 140 + i * 15, 310, 15, 8, c);
  }
  rect(g, 140, 308, 442, 2, '#8a5330');
  for (const [tl, tr, ty] of TIERS) {
    for (let i = 0; i < 7; i++) {
      const x = tl + 10 + r.next() * (tr - tl - 20);
      if (r.chance(0.8)) oval(g, x, ty + 1.5 + r.next() * 2, 2.2, 1.3, r.chance(0.6) ? '#e8863a' : '#c96a2e', r.next() * 3);
    }
  }

  // Level names, embroidered on each cloth face.
  g.font = 'italic 11px Georgia, serif';
  g.textAlign = 'center';
  g.fillStyle = 'rgba(110,80,45,0.85)';
  g.fillText(LEVELS[0] ?? '', 360, 148);
  g.fillText(LEVELS[1] ?? '', 360, 200);
  g.fillText(LEVELS[2] ?? '', 360, 250);

  // The cempasuchil arch over the cielo level.
  for (let t = 0; t <= 1.001; t += 0.055) {
    const x = 250 + (470 - 250) * t;
    const y = 126 - Math.sin(t * Math.PI) * 74;
    if (r.chance(0.5)) oval(g, x + 4, y + 5, 6, 3.4, '#4d7440', r.next());
    pom(g, x + (r.next() - 0.5) * 6, y + (r.next() - 0.5) * 5, 6.5 + r.next() * 2.5, r);
  }
  for (const bx of [250, 470]) {
    pom(g, bx - 8, 122, 7, r);
    pom(g, bx + 7, 126, 8, r);
    pom(g, bx, 132, 6.5, r);
  }

  // Candle bodies, unlit; flames are painted alive each frame.
  for (const [cx, cy] of CANDLES) {
    oval(g, cx, cy - 1, 7, 2.6, 'rgba(26,18,12,0.22)');
    rr(g, cx - 4, cy - 17, 8, 16, 2.5, '#efe5cc');
    oval(g, cx, cy - 17, 4, 1.8, '#f7efd9');
    rect(g, cx - 0.6, cy - 20, 1.2, 3.5, '#54432c');
  }
  // The tall veladora waiting on the floor for the camposanto.
  oval(g, VELA[0], VELA[1] + 2, 12, 4, 'rgba(26,18,12,0.28)');
  rr(g, VELA[0] - 8, VELA[1] - 26, 16, 27, 4, 'rgba(200,150,84,0.55)');
  rr(g, VELA[0] - 6, VELA[1] - 22, 12, 22, 3, '#e8d8b4');
  rect(g, VELA[0] - 0.7, VELA[1] - 26, 1.4, 4, '#54432c');

  altarBg = s;
  return s;
}

/** Papel picado banners, four colors, punched once and reused. */
function bakePicado(): Surface[] {
  if (picado) return picado;
  const colors = ['#c1512f', '#c8a55b', '#4e8fa6', '#8a5a86'];
  picado = colors.map((c, ci) => {
    const s = surface(30, 22);
    const g = s.g;
    const r = new Rng(700 + ci);
    rect(g, 0, 0, 30, 22, c);
    g.globalCompositeOperation = 'destination-out';
    for (let i = 0; i < 5; i++) dot(g, 5 + i * 5, 6 + (i % 2) * 4, 1.7 + r.next(), '#000');
    dot(g, 15, 13, 3, '#000');
    dot(g, 7, 14, 2, '#000');
    dot(g, 23, 14, 2, '#000');
    for (let x = 0; x < 30; x += 6) {
      g.beginPath();
      g.moveTo(x, 22);
      g.lineTo(x + 3, 17);
      g.lineTo(x + 6, 22);
      g.closePath();
      g.fill();
    }
    g.globalCompositeOperation = 'source-over';
    return s;
  });
  return picado;
}

/** One ofrenda item, painted small; x is center, y is the shelf line. */
function paintItem(g: CanvasRenderingContext2D, id: string, x: number, y: number, tilt: number, s = 1.25) {
  g.save();
  g.translate(x, y);
  g.rotate(tilt);
  g.scale(s, s);
  oval(g, 0, 1, 12, 3.2, 'rgba(26,18,12,0.20)');
  switch (id) {
    case 'photo': {
      rr(g, -13, -33, 26, 33, 2.5, '#c8a55b');
      rect(g, -10, -30, 20, 26, '#f2ead6');
      dot(g, 0, -21, 5, '#8f5c38');
      oval(g, 0, -25, 5, 3, '#3d3630');
      oval(g, 0, -12, 7, 5, '#a02335');
      rect(g, -10, -30, 20, 4, 'rgba(255,255,255,0.35)');
      break;
    }
    case 'cempa': {
      g.strokeStyle = '#4d7440';
      g.lineWidth = 2;
      for (const [sx, sy] of [[-7, -12], [0, -16], [7, -11]]) {
        g.beginPath();
        g.moveTo(sx as number * 0.4, 0);
        g.lineTo(sx as number, sy as number);
        g.stroke();
      }
      const r = new Rng(5);
      pom(g, -8, -16, 6.5, r);
      pom(g, 1, -21, 7.5, r);
      pom(g, 9, -14, 6, r);
      break;
    }
    case 'agua': {
      g.fillStyle = '#b5713f';
      g.beginPath();
      g.moveTo(-8, -16);
      g.lineTo(8, -16);
      g.lineTo(6, 0);
      g.lineTo(-6, 0);
      g.closePath();
      g.fill();
      oval(g, 0, -16, 8, 3, '#8a5330');
      oval(g, 0, -16, 6, 2.2, '#4e8fa6');
      dot(g, -2, -16.5, 1, 'rgba(255,255,255,0.6)');
      break;
    }
    case 'pan': {
      oval(g, 0, -8, 13, 9, '#c9884f');
      oval(g, -3, -11, 6, 4, '#d89c60');
      g.strokeStyle = '#b5713f';
      g.lineWidth = 3;
      for (const a of [0.5, 1.6, 2.6]) {
        g.beginPath();
        g.arc(0, -8, 10, a - 0.4, a + 0.4);
        g.stroke();
      }
      dot(g, 0, -14, 3, '#c9884f');
      dot(g, -1.2, -14.4, 0.7, '#54331f');
      dot(g, 1.2, -14.4, 0.7, '#54331f');
      for (let i = 0; i < 6; i++) dot(g, -8 + i * 3.2, -6 - (i % 3) * 4, 0.8, '#f7efd9');
      break;
    }
    case 'omiyage': {
      rr(g, -11, -15, 22, 15, 2, '#e8dcc4');
      rect(g, -11, -12, 22, 2.5, 'rgba(138,98,56,0.3)');
      rect(g, -1.2, -15, 2.4, 15, '#a02335');
      rect(g, -11, -9, 22, 2.4, '#a02335');
      dot(g, 0, -8, 2.6, '#a02335');
      break;
    }
    case 'kanga': {
      for (let i = 0; i < 3; i++) {
        rr(g, -13, -5 - i * 5, 26, 5, 1.5, i % 2 ? '#46527a' : '#3a4668');
        rect(g, -13, -2.4 - i * 5, 26, 1.6, '#e8863a');
      }
      for (let i = 0; i < 5; i++) dot(g, -9 + i * 4.5, -12.5, 0.9, '#e8dcc4');
      break;
    }
    case 'wish': {
      g.strokeStyle = '#a02335';
      g.lineWidth = 1.2;
      g.beginPath();
      g.moveTo(0, -26);
      g.lineTo(2, -30);
      g.stroke();
      rr(g, -4, -26, 8, 26, 1.5, '#f4ecdc');
      rect(g, -4, -26, 8, 3, '#d8a0a8');
      g.fillStyle = 'rgba(70,60,50,0.7)';
      for (let i = 0; i < 4; i++) rect(g, -1.4, -20 + i * 4.6, 2.8, 2.2, 'rgba(70,60,50,0.7)');
      break;
    }
    default: {
      // The woven band, curled into a small ring.
      oval(g, 0, -6, 11, 6.5, '#a02335');
      oval(g, 0, -6, 7, 3.6, '#e9dcc2');
      g.strokeStyle = '#c98a2e';
      g.lineWidth = 1.6;
      g.beginPath();
      g.ellipse(0, -6, 9.2, 5.1, 0, 0, Math.PI * 2);
      g.stroke();
    }
  }
  g.restore();
}

const OFRENDA_LEGEND = [
  { keys: ['up', 'down'], does: 'choose a shelf' },
  { keys: ['space'], does: 'set the thing down there' },
] as const;

export class OfrendaPanel {
  private items: OfrendaItem[] = [];
  private placed: string[][] = [[], [], []];
  private idx = 0;
  private level = 1;
  private echo = '';
  private hint = '';
  private done = false;
  private onDone: (() => void) | null = null;

  private scene: Scene | null = null;
  private setHint: ((h: string) => void) | null = null;
  private recs: Placed[] = [];
  private lit = 0;
  private straightT = -1;
  private velaLit = false;

  constructor(
    private root: HTMLElement,
    private audio: AudioBus,
  ) {}

  get isOpen(): boolean {
    return !this.root.hidden;
  }

  open(onDone: () => void) {
    this.onDone = onDone;
    this.items = buildItems(savedFlags());
    this.placed = [[], [], []];
    this.idx = 0;
    this.level = 1;
    this.echo = '';
    this.done = false;
    this.recs = [];
    this.lit = 0;
    this.straightT = -1;
    this.velaLit = false;
    this.hint = 'Three levels. Up and down to choose one, Space to set the item there. There is no wrong shelf.';
    this.scene ??= new Scene();
    this.scene.restart();
    this.root.style.lineHeight = '1.45';
    this.setHint = mountScene(this.root, 'An Ofrenda for Nani', this.scene, OFRENDA_LEGEND).setHint;
    this.root.hidden = false;
  }

  onDir(dir: Dir) {
    if (this.done) return;
    if (dir === 'up') this.level = Math.max(0, this.level - 1);
    if (dir === 'down') this.level = Math.min(2, this.level + 1);
    this.audio.select();
  }

  onAction() {
    if (this.done) {
      this.root.hidden = true;
      const done = this.onDone;
      this.onDone = null;
      done?.();
      return;
    }
    const item = this.items[this.idx];
    if (!item) return;
    this.placed[this.level]?.push(item.label);
    this.audio.weaveNote(this.idx % 7);
    this.place(item.id, this.level);
    this.echo = item.echo;
    this.idx++;
    if (this.idx >= this.items.length) {
      this.done = true;
      this.audio.weaveDone();
      this.straightT = 0;
      this.hint = 'Refugio lights the last candle. The altar holds a whole journey now. Press Space.';
    } else {
      this.hint = 'The village watches, and nobody corrects a single placement. Next: choose a level, Space to set.';
    }
  }

  private place(id: string, level: number) {
    // Center-out slots, so the altar composes itself symmetrically: first
    // item at the middle of the shelf, then alternating left and right.
    const n = (this.placed[level]?.length ?? 1) - 1;
    const base = (TIERS[level] as [number, number, number])[2];
    const cap = TIER_CAP[level] ?? 6;
    const row = n < cap ? 0 : 1;
    const i = row === 0 ? n : n - cap;
    const k = i === 0 ? 0 : Math.ceil(i / 2) * (i % 2 ? -1 : 1);
    const sp = [38, 42, 46][level] ?? 42;
    this.recs.push({
      id,
      level,
      x: 360 + k * sp + row * 19,
      y: base + row * 11,
      tilt: (id === 'photo' ? 0.09 : (Math.random() - 0.5) * 0.1) * (Math.random() < 0.5 ? 1 : -1) || 0.09,
      t: 0,
      land: -1,
    });
  }

  tick(dt: number) {
    if (!this.isOpen || !this.scene) return;
    const sc = this.scene;

    for (const rec of this.recs) {
      if (rec.t < 1) {
        rec.t = Math.min(1, rec.t + dt / 0.6);
        if (rec.t >= 1) {
          rec.land = sc.time;
          sc.flash('#ffe7c0', 0.12);
          sc.waft(rec.x, rec.y - 14, 'rgba(255,220,150,0.35)', 6);
          if (rec.id === 'cempa') {
            sc.burst(rec.x, rec.y - 12, { n: reduceMotion() ? 5 : 13, color: '#e8863a', speed: 46, grav: 70, life: 1.6, size: 2.6 });
            sc.burst(rec.x, rec.y - 12, { n: reduceMotion() ? 2 : 6, color: '#c96a2e', speed: 34, grav: 60, life: 1.4, size: 2.1 });
            sc.burst(rec.x, rec.y - 14, { n: reduceMotion() ? 2 : 4, color: '#f4b04c', speed: 40, grav: 55, life: 1.5, size: 1.8 });
          }
          const want = this.done ? CANDLES.length : Math.floor((CANDLES.length * this.idx) / this.items.length);
          if (want > this.lit) {
            this.lit = want;
            const c = CANDLES[this.lit - 1];
            if (c) sc.waft(c[0], c[1] - 22, 'rgba(255,214,140,0.5)', 4);
          }
        }
      }
    }
    if (this.straightT >= 0 && this.straightT < 1) {
      const was = this.straightT;
      this.straightT = Math.min(1, this.straightT + dt / 0.9);
      if (was < 0.35 && this.straightT >= 0.35) sc.flash('#ffe7c0', 0.15);
      if (this.straightT >= 0.6) this.velaLit = true;
    }

    sc.frame(dt, (g) => this.paint(g));
    const current = this.done
      ? '<i>every item is placed</i>'
      : `in your hands: <b>${this.items[this.idx]?.label ?? ''}</b> (${this.idx + 1} of ${this.items.length})`;
    const echo = this.echo ? `<i>${this.echo}</i><br>` : '';
    this.setHint?.(`${current}<br>${echo}${this.hint}`);
  }

  private flame(g: CanvasRenderingContext2D, x: number, y: number, t: number, ph: number, s = 1) {
    candleGlow ??= bakeGlow('rgba(255,179,92,0.9)');
    const fl = 0.85 + 0.12 * Math.sin(t * 6.5 + ph) + 0.05 * Math.sin(t * 11.7 + ph * 2);
    g.globalAlpha = 0.38 * fl;
    const r = 34 * s;
    g.drawImage(candleGlow.cv, x - r, y - 6 - r, r * 2, r * 2);
    g.globalAlpha = 1;
    const h = 9 * fl * s;
    const sway = Math.sin(t * 3.1 + ph) * 1.1;
    oval(g, x + sway * 0.5, y - h * 0.5, 3 * s, h * 0.62, '#f2a23c');
    oval(g, x + sway * 0.4, y - h * 0.4, 1.6 * s, h * 0.4, '#fff3d0');
  }

  private paint(g: CanvasRenderingContext2D) {
    const sc = this.scene as Scene;
    const t = sc.time;
    g.drawImage(bakeAltar().cv, 0, 0);

    // The chosen level breathes with a soft candle-colored glow.
    if (!this.done) {
      candleGlow ??= bakeGlow('rgba(255,179,92,0.9)');
      const [l, r, base] = TIERS[this.level] as [number, number, number];
      g.globalAlpha = 0.22 + 0.05 * wobble(t, 2.2);
      g.drawImage(candleGlow.cv, l, base - 46, r - l, 62);
      g.globalAlpha = 1;
      g.strokeStyle = 'rgba(193,81,47,0.75)';
      g.lineWidth = 2;
      g.beginPath();
      g.roundRect(l + 2, base - 3, r - l - 4, 44 - this.level * 1.5, 4);
      g.stroke();
    }

    // Papel picado, strung with a little sway that settles as dusk does.
    const flags = bakePicado();
    const amp = (reduceMotion() ? 0.02 : 0.09) * Math.exp(-t * 0.25) + 0.022;
    g.strokeStyle = 'rgba(43,33,24,0.55)';
    g.lineWidth = 1.4;
    g.beginPath();
    g.moveTo(140, 24);
    g.quadraticCurveTo(370, 66, 604, 36);
    g.stroke();
    for (let i = 0; i < 9; i++) {
      const k = 0.08 + i * 0.105;
      const u = 1 - k;
      const x = u * u * 140 + 2 * u * k * 370 + k * k * 604;
      const y = u * u * 24 + 2 * u * k * 66 + k * k * 36;
      const f = flags[i % flags.length];
      if (!f) continue;
      g.save();
      g.translate(x, y);
      g.rotate(Math.sin(t * 1.6 + i * 1.3) * amp);
      g.drawImage(f.cv, -15, 1);
      g.restore();
    }

    // Placed items, top tier first so lower shelves overlap correctly.
    for (const lv of [0, 1, 2]) {
      for (const rec of this.recs) {
        if (rec.level !== lv) continue;
        const e = easeOutCubic(rec.t);
        const x = HELD[0] + (rec.x - HELD[0]) * e;
        const y = HELD[1] + (rec.y - HELD[1]) * e - Math.sin(Math.PI * rec.t) * 46;
        let tilt = rec.tilt * (0.4 + 0.6 * e);
        if (rec.id === 'photo' && this.straightT > 0) tilt = rec.tilt * (1 - easeOutCubic(Math.min(1, this.straightT / 0.6)));
        paintItem(g, rec.id, x, y, tilt);
        if (rec.land >= 0) {
          const age = t - rec.land;
          if (age < 0.9) {
            candleGlow ??= bakeGlow('rgba(255,179,92,0.9)');
            g.globalAlpha = 0.45 * (1 - age / 0.9);
            g.drawImage(candleGlow.cv, x - 30, y - 44, 60, 60);
            g.globalAlpha = 1;
          }
        }
      }
    }

    // Candles come alive one by one; the veladora waits for Refugio.
    for (let i = 0; i < this.lit; i++) {
      const c = CANDLES[i];
      if (c) this.flame(g, c[0], c[1] - 19, t, i * 1.9, 1.25);
    }
    if (this.velaLit) this.flame(g, VELA[0], VELA[1] - 25, t, 4.2, 1.5);

    // What your hands hold next, bobbing gently by the petal path.
    if (!this.done) {
      const item = this.items[this.idx];
      if (item) {
        candleGlow ??= bakeGlow('rgba(255,179,92,0.9)');
        const by = HELD[1] + wobble(t, 2, 1) * 2.5;
        g.globalAlpha = 0.44;
        g.drawImage(candleGlow.cv, HELD[0] - 40, by - 54, 80, 80);
        g.globalAlpha = 1;
        paintItem(g, item.id, HELD[0], by, wobble(t, 1.4) * 0.05, 1.45);
      }
    }
  }
}
