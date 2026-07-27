import type { Dir } from '../../engine/input';
import type { AudioBus } from '../../engine/audio';
import { Scene, easeInCubic, easeOutBack, easeOutCubic, mountScene, squashed, wobble } from './scene';
import { Rng, dot, oval, rect, rr, shade, surface } from '../../art/pix';

/**
 * Sicily's three hands-on verbs, each painted as a small moving picture.
 *
 * ScopaPanel: a real, small scopa at the circolo, on real worn wood. The
 * forty Sicilian faces are hand-painted miniatures (denari coins, coppe
 * chalices, spade swords, bastoni cudgels); cards deal with a slide and
 * settle, captures snap together, and a scopa sweeps the table in a flash.
 *
 * PisciPanel: an oar in U pisci a mari. A painted boat with the prow eye
 * rides real water under 'a Muntagna; the rais's call rolls in as a swell,
 * fish shadows circle, and the catch breaks the surface in spray.
 *
 * CannoloPanel: behind Alfio's counter. Shells fried to blistered gold, the
 * ricotta piped in as a growing spiral from each end, then the garnish and a
 * falling veil of powdered sugar. The law is the lesson.
 */

// ---------------------------------------------------------------- shared kit

const calm = (): boolean => typeof document !== 'undefined' && document.body.classList.contains('reduce-motion');

type TextOpt = { size?: number; color?: string; align?: CanvasTextAlign; italic?: boolean; bold?: boolean; alpha?: number };

function inkText(g: CanvasRenderingContext2D, s: string, x: number, y: number, o: TextOpt = {}) {
  g.save();
  g.globalAlpha = o.alpha ?? 1;
  g.fillStyle = o.color ?? '#2b2118';
  g.font = `${o.italic ? 'italic ' : ''}${o.bold ? '700' : '600'} ${o.size ?? 13}px Georgia, 'Times New Roman', serif`;
  g.textAlign = o.align ?? 'left';
  g.textBaseline = 'middle';
  g.fillText(s, x, y);
  g.restore();
}

/** The page inherits line-height 0 into .w-hint; give our long hints room to wrap. */
function fixHint(root: HTMLElement) {
  const el = root.querySelector('.w-hint') as HTMLElement | null;
  if (el) el.style.lineHeight = '1.45';
}

/** Baked radial glow discs; per-frame gradients are forbidden by the brief. */
const glowCache = new Map<string, HTMLCanvasElement>();
function glowDisc(r: number, color: string): HTMLCanvasElement {
  const key = `${r}|${color}`;
  const hit = glowCache.get(key);
  if (hit) return hit;
  const { cv, g } = surface(r * 2, r * 2);
  const grad = g.createRadialGradient(r, r, 0, r, r, r);
  grad.addColorStop(0, color);
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, r * 2, r * 2);
  glowCache.set(key, cv);
  return cv;
}

function bakedVGrad(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, top: string, bottom: string) {
  const grad = g.createLinearGradient(0, y, 0, y + h);
  grad.addColorStop(0, top);
  grad.addColorStop(1, bottom);
  g.fillStyle = grad;
  g.fillRect(x, y, w, h);
}

// ---------------------------------------------------------------- scopa

type Card = { v: number; s: number };

const SUIT_NAMES = ['denari', 'coppe', 'spade', 'bastoni'] as const;

const COACH = [
  'An elder taps the deck: "The settebello, the seven of denari. She is the bride of the game. Guard her."',
  '"Count the denari as they go. Most coins is a point, and coins remember who held them."',
  '"Most cards is a point too. Greed, in this one case, is technique."',
  '"When the table adds up to your card, take the whole sum. Arithmetic is also fishing."',
  '"If you cannot capture, feed the table something small. Never leave a seven lying in the sun."',
] as const;

function deckOf(): Card[] {
  const d: Card[] = [];
  for (let s = 0; s < 4; s++) {
    for (let v = 1; v <= 10; v++) d.push({ v, s });
  }
  for (let i = d.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const a = d[i];
    const b = d[j];
    if (a && b) {
      d[i] = b;
      d[j] = a;
    }
  }
  return d;
}

/** Indices of a subset of `table` summing to `v`, preferring fewer cards. */
function findSum(table: Card[], v: number): number[] | null {
  let best: number[] | null = null;
  const n = table.length;
  for (let mask = 1; mask < 1 << n; mask++) {
    let sum = 0;
    const idx: number[] = [];
    for (let i = 0; i < n; i++) {
      if (mask & (1 << i)) {
        sum += table[i]?.v ?? 0;
        idx.push(i);
      }
    }
    if (sum === v && (best === null || idx.length < best.length)) best = idx;
  }
  return best;
}

// ---- the hand-painted Sicilian deck ----

const CW = 46;
const CH = 66;
const SUIT_TINT = ['#a2823f', '#c1512f', '#5c6d8c', '#4d7440'] as const;

/** A denari coin: gold face, radiating engraving, a bright boss. */
function pipDenari(g: CanvasRenderingContext2D, x: number, y: number, r: number) {
  dot(g, x, y, r, '#8a6a28');
  dot(g, x, y, r - 1.1, '#d9b25f');
  g.strokeStyle = '#a2823f';
  g.lineWidth = 1;
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2 + 0.39;
    g.beginPath();
    g.moveTo(x + Math.cos(a) * r * 0.34, y + Math.sin(a) * r * 0.34);
    g.lineTo(x + Math.cos(a) * (r - 1.7), y + Math.sin(a) * (r - 1.7));
    g.stroke();
  }
  dot(g, x, y, Math.max(1, r * 0.28), '#f0dfae');
  dot(g, x - r * 0.42, y - r * 0.42, Math.max(0.8, r * 0.16), 'rgba(255,250,230,0.85)');
}

/** A coppe chalice: terracotta bowl, gold stem and foot. */
function pipCoppe(g: CanvasRenderingContext2D, x: number, y: number, h: number) {
  const top = y - h * 0.5;
  g.fillStyle = '#c1512f';
  g.beginPath();
  g.moveTo(x - h * 0.55, top);
  g.quadraticCurveTo(x - h * 0.5, y + h * 0.05, x, y + h * 0.12);
  g.quadraticCurveTo(x + h * 0.5, y + h * 0.05, x + h * 0.55, top);
  g.closePath();
  g.fill();
  oval(g, x, top, h * 0.55, h * 0.16, '#e0a06a');
  rect(g, x - 0.9, y + h * 0.1, 1.8, h * 0.45, '#a2823f');
  oval(g, x, y + h * 0.62, h * 0.42, h * 0.13, '#c8a55b');
  dot(g, x - h * 0.24, y - h * 0.18, Math.max(0.8, h * 0.09), 'rgba(255,240,220,0.6)');
}

/** A spade sword: steel blade, gold guard, dark grip, tilted like the deck's. */
function pipSpade(g: CanvasRenderingContext2D, x: number, y: number, h: number) {
  g.save();
  g.translate(x, y);
  g.rotate(-0.35);
  rr(g, -1.2, -h, 2.4, h * 1.1, 1.1, '#8b95ab');
  rect(g, -1.2, -h, 1, h, '#cfd6e2');
  rr(g, -4.2, h * 0.1 - 1, 8.4, 2, 1, '#c8a55b');
  rr(g, -1.3, h * 0.1 + 1, 2.6, h * 0.42, 1.2, '#59371e');
  dot(g, 0, h * 0.6, 1.5, '#c8a55b');
  g.restore();
}

/** A bastoni cudgel: raw wood, knobbed, honest. */
function pipBastoni(g: CanvasRenderingContext2D, x: number, y: number, h: number) {
  g.save();
  g.translate(x, y);
  g.rotate(0.3);
  g.fillStyle = '#8a6238';
  g.beginPath();
  g.moveTo(-1.4, -h);
  g.lineTo(1.4, -h);
  g.lineTo(2.6, h * 0.6);
  g.quadraticCurveTo(0, h * 0.95, -2.6, h * 0.6);
  g.closePath();
  g.fill();
  dot(g, 0, -h, Math.max(1.4, h * 0.26), '#6b4a2e');
  rect(g, -0.5, -h * 0.7, 1, h * 1.2, 'rgba(240,224,190,0.35)');
  dot(g, -2, h * 0.1, 0.9, '#5a3a24');
  dot(g, 1.8, -h * 0.3, 0.9, '#5a3a24');
  g.restore();
}

function pip(g: CanvasRenderingContext2D, s: number, x: number, y: number, r: number) {
  if (s === 0) pipDenari(g, x, y, r);
  else if (s === 1) pipCoppe(g, x, y, r * 1.6);
  else if (s === 2) pipSpade(g, x, y, r * 1.5);
  else pipBastoni(g, x, y, r * 1.5);
}

const PIPS: Record<number, [number, number][]> = {
  1: [[0, 0]],
  2: [[0, -14], [0, 14]],
  3: [[0, -16], [0, 0], [0, 16]],
  4: [[-8, -13], [8, -13], [-8, 13], [8, 13]],
  5: [[-8, -14], [8, -14], [0, 0], [-8, 14], [8, 14]],
  6: [[-8, -16], [8, -16], [-8, 0], [8, 0], [-8, 16], [8, 16]],
  7: [[-8, -16], [8, -16], [0, -8], [-8, 0], [8, 0], [-8, 16], [8, 16]],
};

/** The court in miniature: 8 fante, 9 cavallo, 10 re, robed in the suit. */
function paintCourt(g: CanvasRenderingContext2D, v: number, s: number) {
  const x = 23;
  const suitC = SUIT_TINT[s] ?? '#a2823f';
  const dark = shade(suitC, -0.25);
  oval(g, x, 56, 12, 2.6, 'rgba(43,33,24,0.18)');
  if (v === 9) {
    // The cavallo: a stocky horse, a rider with the suit in hand.
    g.strokeStyle = '#7d5836';
    g.lineWidth = 1.6;
    g.beginPath();
    g.moveTo(x - 12, 44);
    g.quadraticCurveTo(x - 17, 48, x - 15, 53);
    g.stroke();
    oval(g, x - 1, 45, 12, 6, '#a97c50');
    for (const lx of [-9, -4, 4, 9]) rect(g, x + lx, 48, 2, 8, '#7d5836');
    oval(g, x + 10, 38, 4.5, 7, '#a97c50', 0.5);
    dot(g, x + 13.5, 33.5, 2.4, '#a97c50');
    dot(g, x + 14.5, 33, 0.8, '#2b2118');
    rr(g, x - 7, 27, 9, 13, 3, suitC);
    dot(g, x - 2.5, 22, 4, '#c08a5c');
    rr(g, x - 6.5, 17.5, 8, 3.4, 1.6, dark);
    rect(g, x + 1, 29, 7, 2.4, suitC);
    pip(g, s, x + 11, 25, 4.2);
    return;
  }
  rect(g, x - 4, 44, 3.2, 11, '#59371e');
  rect(g, x + 1, 44, 3.2, 11, '#59371e');
  g.fillStyle = suitC;
  g.beginPath();
  const wTop = v === 10 ? 8 : 7;
  const wBot = v === 10 ? 10 : 8;
  g.moveTo(x - wTop, 26);
  g.lineTo(x + wTop, 26);
  g.lineTo(x + wBot, 46);
  g.lineTo(x - wBot, 46);
  g.closePath();
  g.fill();
  rect(g, x - wBot, 38, wBot * 2, 2, dark);
  if (v === 10) rect(g, x - 1, 26, 2, 20, '#d9b25f');
  rr(g, x + wTop - 2, 28, 9, 3, 1.5, suitC);
  pip(g, s, x + wTop + 8, 27, 4.2);
  dot(g, x, 20, 5, '#c08a5c');
  dot(g, x - 1.8, 20, 0.7, '#2b2118');
  dot(g, x + 1.8, 20, 0.7, '#2b2118');
  g.fillStyle = '#2e2018';
  g.beginPath();
  g.arc(x, 19, 5, Math.PI, 0);
  g.fill();
  if (v === 10) {
    g.fillStyle = '#d9b25f';
    g.beginPath();
    g.moveTo(x - 5, 11);
    g.lineTo(x - 5, 16);
    g.lineTo(x + 5, 16);
    g.lineTo(x + 5, 11);
    g.lineTo(x + 3, 14);
    g.lineTo(x, 11);
    g.lineTo(x - 3, 14);
    g.closePath();
    g.fill();
  } else {
    rr(g, x - 5, 13, 10, 4, 2, dark);
  }
}

const faceCache = new Map<number, HTMLCanvasElement>();
function cardFace(v: number, s: number): HTMLCanvasElement {
  const key = s * 16 + v;
  const hit = faceCache.get(key);
  if (hit) return hit;
  const { cv, g } = surface(CW, CH);
  const rng = new Rng(key * 977 + 11);
  rr(g, 0, 0, CW, CH, 5, '#efe2c4');
  rr(g, 1.5, 1.5, CW - 3, CH * 0.4, 4, 'rgba(255,250,235,0.45)');
  g.strokeStyle = 'rgba(58,42,26,0.65)';
  g.lineWidth = 1.4;
  g.beginPath();
  g.roundRect(0.8, 0.8, CW - 1.6, CH - 1.6, 4.5);
  g.stroke();
  g.strokeStyle = SUIT_TINT[s] ?? '#a2823f';
  g.globalAlpha = 0.4;
  g.lineWidth = 1;
  g.beginPath();
  g.roundRect(3.5, 3.5, CW - 7, CH - 7, 3);
  g.stroke();
  g.globalAlpha = 1;
  for (let i = 0; i < 3; i++) {
    dot(g, 3 + rng.next() * (CW - 6), 3 + rng.next() * (CH - 6), 1 + rng.next(), 'rgba(120,95,60,0.12)');
  }
  if (v <= 7) {
    for (const [dx, dy] of PIPS[v] ?? []) pip(g, s, 23 + dx, 36 + dy, v === 1 ? 11 : 6);
  } else {
    paintCourt(g, v, s);
  }
  g.fillStyle = s === 0 ? '#8a6a28' : '#3a2a1a';
  g.font = "700 10px Georgia, 'Times New Roman', serif";
  g.textAlign = 'left';
  g.textBaseline = 'alphabetic';
  g.fillText(String(v), 4, 13);
  pip(g, s, 8, 21, 3.2);
  faceCache.set(key, cv);
  return cv;
}

let backCache: HTMLCanvasElement | null = null;
function cardBack(): HTMLCanvasElement {
  if (backCache) return backCache;
  const { cv, g } = surface(CW, CH);
  rr(g, 0, 0, CW, CH, 5, '#a34a2e');
  g.strokeStyle = 'rgba(242,230,208,0.75)';
  g.lineWidth = 1.4;
  g.beginPath();
  g.roundRect(3, 3, CW - 6, CH - 6, 3);
  g.stroke();
  g.save();
  g.beginPath();
  g.roundRect(5, 5, CW - 10, CH - 10, 2.5);
  g.clip();
  g.strokeStyle = 'rgba(242,230,208,0.35)';
  g.lineWidth = 1;
  for (let k = -CH; k < CW + CH; k += 8) {
    g.beginPath();
    g.moveTo(k, 0);
    g.lineTo(k + CH, CH);
    g.stroke();
    g.beginPath();
    g.moveTo(k, CH);
    g.lineTo(k + CH, 0);
    g.stroke();
  }
  g.restore();
  dot(g, CW / 2, CH / 2, 6.5, '#8a3a22');
  dot(g, CW / 2, CH / 2, 4.6, '#d9b25f');
  dot(g, CW / 2, CH / 2, 1.8, '#8a3a22');
  backCache = cv;
  return cv;
}

let scopaBgCache: HTMLCanvasElement | null = null;
function scopaBg(): HTMLCanvasElement {
  if (scopaBgCache) return scopaBgCache;
  const { cv, g } = surface(640, 340);
  const rng = new Rng(88123);
  bakedVGrad(g, 0, 0, 640, 340, '#7a5a38', '#523a22');
  for (const py of [68, 137, 206, 275]) {
    rect(g, 0, py, 640, 2, 'rgba(38,24,12,0.4)');
    rect(g, 0, py + 2, 640, 1, 'rgba(240,220,180,0.09)');
  }
  for (let i = 0; i < 110; i++) {
    const y = rng.next() * 340;
    const x = rng.next() * 640;
    g.strokeStyle = `rgba(30,19,10,${0.05 + rng.next() * 0.09})`;
    g.lineWidth = 1;
    g.beginPath();
    g.moveTo(x, y);
    g.quadraticCurveTo(x + 12 + rng.next() * 14, y + (rng.next() - 0.5) * 3, x + 26 + rng.next() * 26, y);
    g.stroke();
  }
  for (const [kx, ky] of [[204, 40], [438, 250], [560, 148]] as const) {
    oval(g, kx, ky, 5, 3.4, 'rgba(30,19,10,0.3)');
    oval(g, kx, ky, 2.2, 1.5, 'rgba(58,40,22,0.5)');
  }
  // The playing field, worn paler by fifty years of exactly this.
  g.drawImage(glowDisc(250, 'rgba(240,214,160,0.16)'), 70, -80, 500, 500);
  for (const [cx2, cy2] of [[0, 0], [640, 0], [0, 340], [640, 340]] as const) {
    g.drawImage(glowDisc(190, 'rgba(16,10,5,0.4)'), cx2 - 190, cy2 - 190);
  }
  // An espresso, finished an hour ago, still presiding. Corner rite.
  g.strokeStyle = 'rgba(60,38,18,0.22)';
  g.lineWidth = 3;
  g.beginPath();
  g.arc(516, 92, 12, 0, Math.PI * 2);
  g.stroke();
  oval(g, 578, 70, 28, 7, 'rgba(30,18,10,0.3)');
  oval(g, 576, 66, 27, 8.5, '#d9cdb2');
  oval(g, 576, 64, 27, 8, '#f2ead6');
  rr(g, 552, 66, 26, 3, 1.5, '#b8b2a4');
  g.fillStyle = '#efe6d2';
  g.beginPath();
  g.moveTo(561, 46);
  g.quadraticCurveTo(563, 60, 568, 62);
  g.lineTo(584, 62);
  g.quadraticCurveTo(589, 60, 591, 46);
  g.closePath();
  g.fill();
  g.strokeStyle = '#efe6d2';
  g.lineWidth = 3;
  g.beginPath();
  g.arc(593, 53, 6, -Math.PI / 2, Math.PI / 2);
  g.stroke();
  oval(g, 576, 46, 15, 6, '#f7f0e0');
  oval(g, 576, 46, 11.5, 4.4, '#2e1d12');
  oval(g, 573, 45.4, 4, 1.6, 'rgba(200,150,90,0.45)');
  // The chalk slate, in a code no living member remembers agreeing to.
  rr(g, 14, 272, 152, 60, 5, 'rgba(20,12,6,0.4)');
  rr(g, 12, 270, 152, 58, 5, '#57452f');
  rr(g, 17, 275, 142, 48, 3, '#33332f');
  for (let i = 0; i < 8; i++) {
    g.strokeStyle = `rgba(230,230,220,${0.04 + rng.next() * 0.06})`;
    g.lineWidth = 1;
    g.beginPath();
    g.moveTo(20 + rng.next() * 120, 278 + rng.next() * 40);
    g.lineTo(30 + rng.next() * 126, 278 + rng.next() * 40);
    g.stroke();
  }
  scopaBgCache = cv;
  return cv;
}

const ckey = (c: Card) => c.s * 10 + c.v;
const DECK_AT = { x: 64, y: 152 };
const PILE_ME = { x: 592, y: 302 };
const PILE_OPP = { x: 46, y: 32 };

type Spr = { card: Card; x: number; y: number; rot: number; sc: number; up: boolean; layer: number; rl: number; dead: boolean };

type ScopaPhase = 'play' | 'wait' | 'between' | 'lost' | 'done';

/**
 * What the elder says when he wins, which he is allowed to do. Losing is a
 * real outcome here: a card game you cannot lose is not a card game. The
 * story flag only ever comes from a win, and a loss costs nothing but the
 * afternoon, which is what the afternoon is for.
 */
const CONSOLATIONS = [
  'You played fast and honest. Fast is worth two points; honest is worth the chair. Keep the second one.',
  'Ha! Do not make that face. I have been losing at this table since before your country had that flag.',
  'The cards were his tonight, not yours. Next deal they change sides, they always do. That is why we deal again.',
] as const;

export class ScopaPanel {
  private deck: Card[] = [];
  private table: Card[] = [];
  private hand: Card[] = [];
  private opp: Card[] = [];
  private cursor = 0;
  private phase: ScopaPhase = 'play';
  private waitT = 0;
  private myCards = 0;
  private oppCards = 0;
  private myDenari = 0;
  private oppDenari = 0;
  private mySette = false;
  private myScope = 0;
  private oppScope = 0;
  private myPts = 0;
  private oppPts = 0;
  private target = 6;
  private lastCapMine = false;
  private coachI = 0;
  private lesson = '';
  private consolI = 0;
  private hint = '';
  private flourish = '';
  private onDone: (() => void) | null = null;

  private scene: Scene | null = null;
  private setHint: (h: string) => void = () => {};
  private sprs = new Map<number, Spr>();
  private q: { t: number; fn: () => void }[] = [];
  private flourishAt = -1;
  private steamAt = 0;
  private sparkleAt = 0;

  constructor(
    private root: HTMLElement,
    private audio: AudioBus,
  ) {}

  get isOpen(): boolean {
    return !this.root.hidden;
  }

  open(onDone: () => void) {
    this.onDone = onDone;
    this.myPts = 0;
    this.oppPts = 0;
    this.target = 6;
    this.coachI = 0;
    this.lesson = '';
    this.scene ??= new Scene();
    this.scene.restart();
    this.setHint = mountScene(this.root, 'Scopa at the Circolo', this.scene).setHint;
    fixHint(this.root);
    this.sprs.clear();
    this.q.length = 0;
    this.flourishAt = -1;
    this.startRound();
    this.hint = 'Left and right pick a card, Space plays it. Match a table card, or sum several. Sweep the table for a scopa.';
    this.root.hidden = false;
    this.setHint(this.hint);
  }

  private startRound() {
    this.deck = deckOf();
    this.table = this.deck.splice(0, 4);
    this.hand = this.deck.splice(0, 3);
    this.opp = this.deck.splice(0, 3);
    this.cursor = 0;
    this.myCards = 0;
    this.oppCards = 0;
    this.myDenari = 0;
    this.oppDenari = 0;
    this.mySette = false;
    this.myScope = 0;
    this.oppScope = 0;
    this.lastCapMine = false;
    this.flourish = '';
    this.phase = 'play';
    this.vfxDeal();
  }

  // ---- visual layer: sprites, slots, and the moments ----

  private later(t: number, fn: () => void) {
    this.q.push({ t, fn });
  }

  private spawn(c: Card, x: number, y: number, up: boolean, layer: number): Spr {
    const s: Spr = { card: c, x, y, rot: 0, sc: 1, up, layer, rl: 0, dead: false };
    this.sprs.set(ckey(c), s);
    return s;
  }

  private fly(s: Spr, x: number, y: number, rot: number, dur: number, ease = easeOutCubic, done?: () => void) {
    const sc = this.scene;
    if (!sc) return;
    const fx = s.x;
    const fy = s.y;
    const fr = s.rot;
    sc.tween(0, 1, dur, ease, (t) => {
      s.x = fx + (x - fx) * t;
      s.y = fy + (y - fy) * t;
      s.rot = fr + (rot - fr) * t;
    }, done);
  }

  private tableSlot(i: number, n: number): { x: number; y: number } {
    const rows = Math.ceil(n / 6);
    const row = Math.floor(i / 6);
    const inRow = row === rows - 1 ? n - row * 6 : 6;
    const col = i % 6;
    const y = rows === 1 ? 165 : 132 + row * 66;
    return { x: 320 + (col - (inRow - 1) / 2) * 56, y };
  }

  private handSlot(i: number, n: number): { x: number; y: number } {
    return { x: 320 + (i - (n - 1) / 2) * 62, y: 286 };
  }

  private oppSlot(i: number, n: number): { x: number; y: number } {
    return { x: 320 + (i - (n - 1) / 2) * 40, y: 44 };
  }

  private vfxDeal() {
    if (!this.scene) return;
    this.sprs.clear();
    this.table.forEach((c, i) => this.later(0.06 + i * 0.11, () => {
      const s = this.spawn(c, DECK_AT.x, DECK_AT.y, true, 0);
      s.rot = -0.5;
      const t = this.tableSlot(i, this.table.length);
      this.fly(s, t.x, t.y, (Math.random() - 0.5) * 0.07, 0.38, easeOutBack);
    }));
    this.vfxDealHands(0.55);
  }

  private vfxDealHands(delay = 0.05) {
    if (!this.scene) return;
    this.hand.forEach((c, i) => this.later(delay + i * 0.11, () => {
      const s = this.spawn(c, DECK_AT.x, DECK_AT.y, true, 1);
      s.rot = -0.5;
      const t = this.handSlot(i, this.hand.length);
      this.fly(s, t.x, t.y, 0, 0.38, easeOutBack);
    }));
  }

  private ensureSpr(c: Card, mine: boolean): Spr {
    return this.sprs.get(ckey(c)) ?? this.spawn(c, 320, mine ? 286 : 44, true, 2);
  }

  private vfxRelayout() {
    this.table.forEach((c, i) => {
      const s = this.sprs.get(ckey(c));
      if (!s || s.dead || s.layer === 2) return;
      const t = this.tableSlot(i, this.table.length);
      if (Math.abs(s.x - t.x) + Math.abs(s.y - t.y) > 1) this.fly(s, t.x, t.y, s.rot, 0.3);
    });
    this.hand.forEach((c, i) => {
      const s = this.sprs.get(ckey(c));
      if (!s || s.dead) return;
      const t = this.handSlot(i, this.hand.length);
      if (Math.abs(s.x - t.x) + Math.abs(s.y - t.y) > 1) this.fly(s, t.x, t.y, 0, 0.3);
    });
  }

  private vfxPlace(card: Card, mine: boolean) {
    if (!this.scene) return;
    const s = this.ensureSpr(card, mine);
    s.layer = 2;
    const i = this.table.indexOf(card);
    const t = this.tableSlot(i < 0 ? this.table.length - 1 : i, this.table.length);
    this.fly(s, t.x, t.y, (Math.random() - 0.5) * 0.08, 0.42, easeOutBack, () => {
      s.layer = 0;
    });
    this.later(0.05, () => this.vfxRelayout());
  }

  private vfxCapture(got: Card[], mine: boolean) {
    const sc = this.scene;
    if (!sc || got.length === 0) return;
    const pile = mine ? PILE_ME : PILE_OPP;
    const sprs = got.map((c) => this.ensureSpr(c, mine));
    let gx = 0;
    let gy = 0;
    for (const s of sprs) {
      s.layer = 2;
      gx += s.x;
      gy += s.y;
    }
    gx /= sprs.length;
    gy /= sprs.length;
    sprs.forEach((s, i) => this.fly(s, gx + (i - (sprs.length - 1) / 2) * 5, gy, 0, 0.24));
    this.later(0.3, () => {
      if (!calm()) sc.thump(3, 0.03);
      sc.burst(gx, gy, { n: calm() ? 4 : 10, color: '#f0dfae', size: 2.4, speed: 70, life: 0.5 });
      for (const s of sprs) {
        sc.tween(1, 0.55, 0.34, easeInCubic, (v) => {
          s.sc = v;
        });
        this.fly(s, pile.x + (Math.random() - 0.5) * 6, pile.y, mine ? 0.3 : -0.3, 0.34, easeInCubic, () => {
          s.dead = true;
          this.sprs.delete(ckey(s.card));
        });
      }
      this.later(0.12, () => this.vfxRelayout());
    });
  }

  private vfxScopa(mine: boolean) {
    const sc = this.scene;
    if (!sc) return;
    this.later(0.36, () => {
      sc.flash(mine ? '#ffe9b0' : '#e8dcc4', mine ? 0.3 : 0.18);
      if (!calm()) {
        sc.thump(mine ? 5 : 3, 0.05);
        sc.burst(320, 168, { n: mine ? 16 : 8, kind: 'streak', color: '#e8c86a', speed: 240, life: 0.55, grav: 40, size: 7 });
      }
      this.flourishAt = sc.time;
    });
  }

  /** What `card` would take off the table right now, or null for nothing. */
  private wouldTake(card: Card): Card[] | null {
    const single = this.table.find((t) => t.v === card.v);
    if (single) return [single];
    const idx = findSum(this.table, card.v);
    if (!idx) return null;
    return idx.map((i) => this.table[i]).filter((c): c is Card => !!c);
  }

  /**
   * The elder watches every card you do not play. When he wins he says one
   * true thing about the hand, which is the entire reason to lose to him.
   */
  private noteLesson(played: Card) {
    const sette = (cs: Card[]) => cs.some((c) => c.v === 7 && c.s === 0);
    const took = this.wouldTake(played);
    const rest = this.hand.filter((c) => c !== played);
    if (this.table.some((t) => t.v === 7 && t.s === 0) && !(took && sette(took))) {
      const saver = rest.find((c) => {
        const t = this.wouldTake(c);
        return !!t && sette(t);
      });
      if (saver) {
        this.lesson = `The settebello was lying there in the sun and your ${saver.v} was in your hand. She is a whole point, bedda. Her first, always.`;
        return;
      }
    }
    if (took) return;
    const alt = rest.find((c) => !!this.wouldTake(c));
    if (alt) {
      const got = this.wouldTake(alt) ?? [];
      this.lesson =
        got.length === 1
          ? `You held the ${alt.v} and its twin was lying right there on the wood, in the sun, waiting. Talìa before you play, picciriddu.`
          : `You held the ${alt.v}, and the wood was showing ${got.map((c) => c.v).join(' and ')}. Arithmetic, picciriddu. Arithmetic is also fishing.`;
    }
  }

  /** Play `card`: capture by exact match first, else by sum, else it stays. */
  private resolve(card: Card, mine: boolean): string {
    const single = this.table.findIndex((t) => t.v === card.v);
    let taken: Card[] = [];
    if (single >= 0) {
      taken = this.table.splice(single, 1);
    } else {
      const idx = findSum(this.table, card.v);
      if (idx) {
        taken = idx
          .slice()
          .sort((a, b) => b - a)
          .map((i) => this.table.splice(i, 1)[0])
          .filter((c): c is Card => !!c);
      }
    }
    if (taken.length === 0) {
      this.table.push(card);
      this.vfxPlace(card, mine);
      return mine ? 'No capture; the card stays on the wood.' : 'The elder feeds the table a card, watching you sideways.';
    }
    const got = [...taken, card];
    const denari = got.filter((c) => c.s === 0).length;
    const sette = got.some((c) => c.v === 7 && c.s === 0);
    if (mine) {
      this.myCards += got.length;
      this.myDenari += denari;
      if (sette) this.mySette = true;
      this.lastCapMine = true;
    } else {
      this.oppCards += got.length;
      this.oppDenari += denari;
      this.lastCapMine = false;
    }
    this.vfxCapture(got, mine);
    let msg = mine ? `You take ${got.length} cards.` : `The elder captures ${got.length}.`;
    if (sette) msg += mine ? ' The settebello is yours!' : ' The settebello slips away to his pile.';
    if (this.table.length === 0) {
      if (mine) {
        this.myScope++;
        this.flourish = 'SCOPA!';
        this.audio.chime();
        msg = 'SCOPA! The table is swept clean. A card goes face up, sideways, for the score.';
      } else {
        this.oppScope++;
        msg = 'Scopa for the elder. He does not shout. He has shouted enough this century, he says.';
      }
      this.vfxScopa(mine);
    } else if (mine) {
      this.audio.weaveNote(got.length % 7);
    }
    return msg;
  }

  private oppPlay() {
    let bestI = -1;
    let bestScore = -1;
    for (let i = 0; i < this.opp.length; i++) {
      const c = this.opp[i];
      if (!c) continue;
      const single = this.table.some((t) => t.v === c.v);
      const sum = single ? null : findSum(this.table, c.v);
      if (!single && !sum) continue;
      const takenVs = single ? [c.v] : (sum ?? []).map((j) => this.table[j]?.v ?? 0);
      let score = takenVs.length;
      if (takenVs.includes(7)) score += 2;
      if (c.s === 0) score += 1;
      if (score > bestScore) {
        bestScore = score;
        bestI = i;
      }
    }
    if (bestI < 0) {
      let lowI = 0;
      let lowV = 99;
      for (let i = 0; i < this.opp.length; i++) {
        const c = this.opp[i];
        if (c && c.v + (c.s === 0 ? 5 : 0) < lowV) {
          lowV = c.v + (c.s === 0 ? 5 : 0);
          lowI = i;
        }
      }
      bestI = lowI;
    }
    const played = this.opp.splice(bestI, 1)[0];
    if (played) this.hint = this.resolve(played, false);
  }

  private afterTurns() {
    if (this.hand.length === 0 && this.opp.length === 0) {
      if (this.deck.length > 0) {
        this.hand = this.deck.splice(0, 3);
        this.opp = this.deck.splice(0, 3);
        this.cursor = 0;
        const coach = COACH[this.coachI % COACH.length];
        this.coachI++;
        this.hint = `New hands. ${coach ?? ''}`;
        this.vfxDealHands();
      } else {
        // Leftovers go to the last capturer, without a scopa.
        const leftD = this.table.filter((c) => c.s === 0).length;
        if (this.table.length > 0) this.vfxCapture(this.table.slice(), this.lastCapMine);
        if (this.lastCapMine) {
          this.myCards += this.table.length;
          this.myDenari += leftD;
          if (this.table.some((c) => c.v === 7 && c.s === 0)) this.mySette = true;
        } else {
          this.oppCards += this.table.length;
          this.oppDenari += leftD;
        }
        this.table = [];
        let mine = this.myScope;
        let theirs = this.oppScope;
        const notes: string[] = [];
        if (this.myCards > this.oppCards) {
          mine++;
          notes.push('most cards, yours');
        } else if (this.oppCards > this.myCards) {
          theirs++;
          notes.push('most cards, his');
        }
        if (this.myDenari > this.oppDenari) {
          mine++;
          notes.push('most denari, yours');
        } else if (this.oppDenari > this.myDenari) {
          theirs++;
          notes.push('most denari, his');
        }
        if (this.mySette) {
          mine++;
          notes.push('the settebello, yours');
        } else {
          theirs++;
          notes.push('the settebello, his');
        }
        if (this.myScope > 0) notes.push(`${this.myScope} scopa of yours`);
        if (this.oppScope > 0) notes.push(`${this.oppScope} of his`);
        this.myPts += mine;
        this.oppPts += theirs;
        this.phase = 'between';
        this.hint = `The deal is done: ${notes.join('; ')}. Space to count on.`;
        return;
      }
    }
    this.phase = 'play';
  }

  tick(dt: number) {
    if (!this.isOpen) return;
    if (this.phase === 'wait') {
      this.waitT -= dt;
      if (this.waitT <= 0) {
        this.flourish = '';
        if (this.opp.length > 0) this.oppPlay();
        this.afterTurns();
      }
    }
    const sc = this.scene;
    if (!sc) return;
    for (let i = this.q.length - 1; i >= 0; i--) {
      const j = this.q[i];
      if (!j) continue;
      j.t -= dt;
      if (j.t <= 0) {
        this.q.splice(i, 1);
        j.fn();
      }
    }
    this.hand.forEach((c, i) => {
      const s = this.sprs.get(ckey(c));
      if (!s) return;
      const t = i === this.cursor && this.phase === 'play' ? 1 : 0;
      s.rl += (t - s.rl) * Math.min(1, dt * 12);
    });
    sc.frame(dt, (g) => this.paint(g));
    this.setHint(this.hint);
  }

  onDir(dir: Dir) {
    if (this.phase !== 'play' || this.hand.length === 0) return;
    if (dir === 'left') this.cursor = (this.cursor + this.hand.length - 1) % this.hand.length;
    if (dir === 'right') this.cursor = (this.cursor + 1) % this.hand.length;
  }

  onAction() {
    if (this.phase === 'play') {
      if (this.cursor >= this.hand.length) this.cursor = Math.max(0, this.hand.length - 1);
      const chosen = this.hand[this.cursor];
      if (!chosen) return;
      this.noteLesson(chosen);
      const played = this.hand.splice(this.cursor, 1)[0];
      if (!played) return;
      this.hint = this.resolve(played, true);
      this.cursor = 0;
      this.phase = 'wait';
      this.waitT = 0.8;
    } else if (this.phase === 'between') {
      const over = this.myPts >= this.target || this.oppPts >= this.target;
      if (over && this.myPts > this.oppPts) {
        this.phase = 'done';
        this.flourish = '';
        this.hint = `${this.myPts} to ${this.oppPts}. The table thumps; the chair is yours now, officially. Press Space.`;
        this.audio.weaveDone();
        const sc = this.scene;
        if (sc) {
          sc.flash('#ffe1a0', 0.4);
          if (!calm()) sc.thump(5, 0.05);
          sc.burst(320, 150, { n: calm() ? 8 : 24, color: '#e8c86a', speed: 160, life: 0.9, size: 3, grav: 160 });
        }
      } else if (over && this.oppPts > this.myPts) {
        // He wins one. Nothing is lost except the game, and the game was
        // never the point: the rematch is, and so is what he says next.
        this.phase = 'lost';
        this.flourish = '';
        this.audio.bump();
        const sc = this.scene;
        if (sc) {
          sc.flash('#e8dcc4', 0.14);
          if (!calm()) sc.thump(2, 0.03);
        }
        const said = this.lesson || CONSOLATIONS[this.consolI % CONSOLATIONS.length] || '';
        this.consolI++;
        this.lesson = '';
        this.hint =
          `${this.oppPts} to ${this.myPts}, his. He gathers the cards without hurrying and taps them square. ` +
          `"${said}" Nobody has ever left this table after one game. Space, and he deals again.`;
      } else {
        this.startRound();
        this.hint = `${this.myPts} to ${this.oppPts}, playing to ${this.target}. The deal passes; the fan takes a turn too.`;
      }
    } else if (this.phase === 'lost') {
      this.myPts = 0;
      this.oppPts = 0;
      this.startRound();
      this.hint = 'Fresh deal, nothing owed, the espresso going cold in exactly the same place. "Now. The sevens, then everything else."';
    } else if (this.phase === 'done') {
      this.root.hidden = true;
      const done = this.onDone;
      this.onDone = null;
      done?.();
    }
  }

  private pilePaint(g: CanvasRenderingContext2D, p: { x: number; y: number }, count: number, rot: number) {
    if (count <= 0) return;
    const b = cardBack();
    const layers = Math.min(3, 1 + (count >> 3));
    g.save();
    g.translate(p.x, p.y);
    g.rotate(rot);
    g.scale(0.62, 0.62);
    for (let i = layers - 1; i >= 0; i--) g.drawImage(b, -CW / 2 - i * 2, -CH / 2 - i * 2);
    g.restore();
    inkText(g, String(count), p.x + (p.x > 320 ? -32 : 32), p.y, { size: 12, color: 'rgba(242,230,208,0.85)', align: 'center' });
  }

  private paint(g: CanvasRenderingContext2D) {
    const sc = this.scene;
    if (!sc) return;
    g.drawImage(scopaBg(), 0, 0);
    if (sc.time - this.steamAt > 1.15) {
      this.steamAt = sc.time;
      sc.waft(576, 40, 'rgba(255,250,240,0.28)', 5);
    }
    if (this.deck.length > 0) {
      const b = cardBack();
      const layers = Math.min(3, 1 + (this.deck.length >> 4));
      for (let i = layers - 1; i >= 0; i--) g.drawImage(b, DECK_AT.x - CW / 2 - i * 1.5, DECK_AT.y - CH / 2 - i * 1.5);
      inkText(g, `deck ${this.deck.length}`, DECK_AT.x, DECK_AT.y + 46, { size: 11, color: 'rgba(242,230,208,0.75)', align: 'center', italic: true });
    }
    const nb = this.opp.length;
    for (let i = 0; i < nb; i++) {
      const o = this.oppSlot(i, nb);
      g.save();
      g.translate(o.x, o.y + wobble(sc.time, 1.4, i) * 1.5);
      g.rotate((i - (nb - 1) / 2) * 0.07);
      oval(g, 2, CH / 2 - 2, CW * 0.5, 5, 'rgba(24,14,8,0.25)');
      g.drawImage(cardBack(), -CW / 2, -CH / 2);
      g.restore();
    }
    this.pilePaint(g, PILE_ME, this.myCards, 0.28);
    this.pilePaint(g, PILE_OPP, this.oppCards, -0.28);
    const all = [...this.sprs.values()].sort((a, b) => a.layer - b.layer);
    for (const s of all) {
      const lift = s.rl * 14;
      const bob = s.layer === 1 ? wobble(sc.time, 1.8, s.card.v) * 1.2 : 0;
      if (s.card.v === 7 && s.card.s === 0 && s.up) {
        const a = 0.22 + 0.12 * Math.sin(sc.time * 3);
        g.globalAlpha = a;
        g.drawImage(glowDisc(44, 'rgba(255,214,110,0.85)'), s.x - 44, s.y - lift + bob - 44);
        g.globalAlpha = 1;
      }
      if (s.rl > 0.02) {
        g.globalAlpha = s.rl * 0.9;
        g.drawImage(glowDisc(46, 'rgba(255,214,120,0.5)'), s.x - 46, s.y - lift - 38);
        g.globalAlpha = 1;
      }
      g.save();
      g.translate(s.x, s.y - lift + bob);
      g.rotate(s.rot);
      g.scale(s.sc, s.sc);
      oval(g, 2, CH / 2 - 1, CW * 0.52, 5, 'rgba(24,14,8,0.28)');
      g.drawImage(s.up ? cardFace(s.card.v, s.card.s) : cardBack(), -CW / 2, -CH / 2);
      g.restore();
    }
    if (this.phase === 'play' && this.hand.length > 0) {
      const c = this.hand[Math.min(this.cursor, this.hand.length - 1)];
      const s = c ? this.sprs.get(ckey(c)) : undefined;
      if (s) {
        const ty = s.y - s.rl * 14 - CH / 2 - 12 + Math.sin(sc.time * 5) * 2.5;
        g.fillStyle = '#e8c86a';
        g.strokeStyle = 'rgba(43,33,24,0.7)';
        g.lineWidth = 1.5;
        g.beginPath();
        g.moveTo(s.x - 6, ty - 7);
        g.lineTo(s.x + 6, ty - 7);
        g.lineTo(s.x, ty);
        g.closePath();
        g.fill();
        g.stroke();
        const nm = SUIT_NAMES[c?.s ?? 0] ?? '';
        inkText(g, nm, s.x, ty - 16, { size: 10, color: 'rgba(242,230,208,0.8)', align: 'center', italic: true });
      }
    }
    if (this.flourish && this.flourishAt >= 0) {
      const t = Math.min(1, (sc.time - this.flourishAt) / 0.35);
      const k = easeOutBack(t);
      g.save();
      g.translate(320, 160);
      g.scale(k, k);
      g.rotate(-0.04);
      g.font = "700 42px Georgia, 'Times New Roman', serif";
      g.textAlign = 'center';
      g.textBaseline = 'middle';
      g.lineWidth = 7;
      g.strokeStyle = 'rgba(43,33,24,0.85)';
      g.strokeText(this.flourish, 0, 0);
      g.fillStyle = '#ffe1a0';
      g.fillText(this.flourish, 0, 0);
      g.restore();
    }
    if (this.phase === 'lost') {
      inkText(g, 'he shuffles without being asked', 320, 152, {
        size: 13,
        italic: true,
        color: 'rgba(244,236,214,0.85)',
        align: 'center',
      });
    }
    if (this.phase === 'done' && sc.time - this.sparkleAt > 0.7) {
      this.sparkleAt = sc.time;
      sc.burst(140 + Math.random() * 360, 90 + Math.random() * 60, { n: calm() ? 2 : 4, color: '#ffe1a0', size: 2, speed: 40, life: 0.6, grav: 60 });
    }
    inkText(g, `you ${this.myPts} · him ${this.oppPts}`, 88, 292, { size: 14, color: 'rgba(244,242,232,0.9)', align: 'center' });
    inkText(g, `playing to ${this.target}`, 88, 311, { size: 12, color: 'rgba(244,242,232,0.65)', align: 'center', italic: true });
  }
}

// ---------------------------------------------------------------- u pisci

const SEA_Y = 118;
const BOAT_AT = { x: 150, y: 178 };
const callX = (x: number): number => 208 + x * 372;

let pisciBgCache: HTMLCanvasElement | null = null;
function pisciBg(): HTMLCanvasElement {
  if (pisciBgCache) return pisciBgCache;
  const { cv, g } = surface(640, 340);
  const rng = new Rng(41177);
  bakedVGrad(g, 0, 0, 640, SEA_Y, '#9fd4ec', '#efe0b4');
  g.drawImage(glowDisc(64, 'rgba(255,240,200,0.85)'), 456, -18);
  dot(g, 520, 46, 13, '#f7ead0');
  // 'a Muntagna, presiding, one facet in shadow.
  g.fillStyle = '#8d93b8';
  g.beginPath();
  g.moveTo(-10, SEA_Y + 2);
  g.lineTo(92, 26);
  g.lineTo(118, 32);
  g.lineTo(236, SEA_Y + 2);
  g.closePath();
  g.fill();
  g.fillStyle = '#7d84a8';
  g.beginPath();
  g.moveTo(118, 32);
  g.lineTo(236, SEA_Y + 2);
  g.lineTo(104, SEA_Y + 2);
  g.lineTo(104, 40);
  g.closePath();
  g.fill();
  g.strokeStyle = 'rgba(60,58,86,0.4)';
  g.lineWidth = 1.4;
  for (const [sx, sy, ln] of [[70, 62, 30], [96, 48, 40], [130, 58, 34]] as const) {
    g.beginPath();
    g.moveTo(sx, sy);
    g.lineTo(sx + 6, sy + ln);
    g.stroke();
  }
  // The town along the black shore, porcelain small, and the campanile.
  for (let i = 0; i < 16; i++) {
    const hx = 96 + i * 13 + rng.int(5);
    const hh = 6 + rng.int(7);
    rect(g, hx, SEA_Y - hh, 9, hh, rng.chance(0.5) ? '#e0cfa8' : '#d9c298');
    rect(g, hx, SEA_Y - hh - 2, 9, 2.5, '#b5713f');
  }
  rect(g, 262, SEA_Y - 26, 9, 26, '#e8dcc4');
  rect(g, 261, SEA_Y - 28, 11, 3, '#b5713f');
  dot(g, 266.5, SEA_Y - 30, 3.4, '#8a9e8a');
  bakedVGrad(g, 0, SEA_Y, 640, 340 - SEA_Y, '#63a4c4', '#274f63');
  rect(g, 0, SEA_Y, 640, 2, 'rgba(250,245,225,0.5)');
  // The faraglioni: thrown things that missed forever. Stout basalt, not sails.
  for (const [fx, fw, fh] of [[502, 46, 42], [552, 30, 26]] as const) {
    g.fillStyle = '#4a4550';
    g.beginPath();
    g.moveTo(fx - fw / 2, 158);
    g.lineTo(fx - fw * 0.34, 158 - fh * 0.7);
    g.lineTo(fx - fw * 0.08, 158 - fh);
    g.lineTo(fx + fw * 0.2, 158 - fh * 0.78);
    g.lineTo(fx + fw * 0.38, 158 - fh * 0.4);
    g.lineTo(fx + fw / 2, 158);
    g.closePath();
    g.fill();
    g.fillStyle = '#5f5a68';
    g.beginPath();
    g.moveTo(fx - fw * 0.08, 158 - fh);
    g.lineTo(fx - fw * 0.34, 158 - fh * 0.7);
    g.lineTo(fx - fw / 2, 158);
    g.lineTo(fx - fw * 0.14, 158);
    g.closePath();
    g.fill();
    oval(g, fx, 159, fw * 0.62, 3.6, 'rgba(240,250,250,0.45)');
  }
  for (let i = 0; i < 46; i++) {
    const y = SEA_Y + 8 + rng.next() * 200;
    g.strokeStyle = `rgba(240,248,244,${0.05 + rng.next() * 0.14})`;
    g.lineWidth = 1;
    const x = rng.next() * 640;
    g.beginPath();
    g.moveTo(x, y);
    g.lineTo(x + 8 + rng.next() * 18, y);
    g.stroke();
  }
  pisciBgCache = cv;
  return cv;
}

let pisciBoatCache: HTMLCanvasElement | null = null;
function pisciBoat(): HTMLCanvasElement {
  if (pisciBoatCache) return pisciBoatCache;
  const { cv, g } = surface(210, 92);
  // Hull: lava-black, sheer bands in feast-day paint, the stem rising.
  g.fillStyle = '#23262e';
  g.beginPath();
  g.moveTo(10, 34);
  g.lineTo(196, 34);
  g.quadraticCurveTo(204, 28, 202, 20);
  g.lineTo(198, 20);
  g.quadraticCurveTo(196, 30, 188, 40);
  g.lineTo(190, 40);
  g.closePath();
  g.fill();
  g.fillStyle = '#23262e';
  g.beginPath();
  g.moveTo(8, 36);
  g.quadraticCurveTo(6, 52, 30, 66);
  g.lineTo(168, 66);
  g.quadraticCurveTo(192, 52, 196, 36);
  g.closePath();
  g.fill();
  rect(g, 14, 40, 176, 6, '#c1512f');
  rect(g, 14, 46, 176, 5, '#e0b13d');
  rect(g, 14, 51, 176, 5, '#3a5f8a');
  rect(g, 10, 36, 188, 3.5, '#e8dcc4');
  // The eye on the prow. The boat must see the fish before you do.
  oval(g, 176, 47, 7.5, 5.5, '#f4efe4');
  g.strokeStyle = '#3a5f8a';
  g.lineWidth = 1.6;
  g.beginPath();
  g.ellipse(176, 47, 8.5, 6.5, 0, 0, Math.PI * 2);
  g.stroke();
  dot(g, 178, 47, 2.6, '#1c2430');
  dot(g, 179, 46, 0.9, '#f4efe4');
  // Flag at the stem.
  g.fillStyle = '#c1512f';
  g.beginPath();
  g.moveTo(201, 20);
  g.lineTo(212, 23);
  g.lineTo(201, 27);
  g.closePath();
  g.fill();
  // Three rowers, one rhythm.
  const cloth = ['#f2e6d0', '#c1512f', '#3a5f8a'] as const;
  [60, 95, 130].forEach((sx, i) => {
    rr(g, sx - 5, 22, 10, 15, 3, cloth[i] ?? '#f2e6d0');
    dot(g, sx, 16, 4.5, '#b97f52');
    g.strokeStyle = '#2b2118';
    g.lineWidth = 1.6;
    g.beginPath();
    g.arc(sx, 15, 4.5, Math.PI * 1.1, Math.PI * 1.9);
    g.stroke();
  });
  // The rais at the stern, all voice. His calling arm is drawn live.
  rect(g, 26, 30, 3, 8, '#2b2118');
  rect(g, 32, 30, 3, 8, '#2b2118');
  rr(g, 24, 14, 13, 17, 3, '#2b2b33');
  g.strokeStyle = '#c1512f';
  g.lineWidth = 2.4;
  g.beginPath();
  g.moveTo(26, 16);
  g.lineTo(35, 28);
  g.stroke();
  dot(g, 30.5, 8, 5, '#b97f52');
  rr(g, 25, 2.5, 11, 4, 2, '#2b2b33');
  pisciBoatCache = cv;
  return cv;
}

let pisciFishCache: HTMLCanvasElement | null = null;
function pisciFish(): HTMLCanvasElement {
  if (pisciFishCache) return pisciFishCache;
  const { cv, g } = surface(120, 36);
  // Tail first, then the silver body, then the famous nose.
  g.fillStyle = '#55677a';
  g.beginPath();
  g.moveTo(30, 18);
  g.lineTo(8, 5);
  g.lineTo(16, 18);
  g.lineTo(8, 31);
  g.closePath();
  g.fill();
  oval(g, 58, 18, 30, 11, '#c8d2da');
  oval(g, 58, 14, 30, 7.5, '#55677a');
  oval(g, 60, 23, 25, 5.5, '#e8eef2');
  g.fillStyle = '#55677a';
  g.beginPath();
  g.moveTo(48, 9);
  g.quadraticCurveTo(56, -2, 68, 8);
  g.closePath();
  g.fill();
  g.fillStyle = '#3a4450';
  g.beginPath();
  g.moveTo(86, 15);
  g.lineTo(118, 12.5);
  g.lineTo(87, 18.5);
  g.closePath();
  g.fill();
  dot(g, 78, 15.5, 3, '#f2f2ee');
  dot(g, 78.6, 15.5, 1.6, '#1c2430');
  g.strokeStyle = 'rgba(28,36,48,0.6)';
  g.lineWidth = 1.2;
  g.beginPath();
  g.arc(78, 20, 5, Math.PI * 0.15, Math.PI * 0.7);
  g.stroke();
  rect(g, 40, 15, 30, 1.4, 'rgba(255,255,255,0.5)');
  pisciFishCache = cv;
  return cv;
}

type PisciPhase = 'row' | 'leap' | 'lost' | 'done';

export class PisciPanel {
  private phase: PisciPhase = 'row';
  private strokes = 0; // good strokes this leg
  private broke = 0; // mistimed pulls this pass; three and the stroke breaks
  private leg = 0; // 0..2; the fish escapes after legs 0 and 1
  private x = 1; // the rais's call rolling toward the boat
  private speed = 0.5;
  private leapT = 0;
  private hint = '';
  private onDone: (() => void) | null = null;

  private scene: Scene | null = null;
  private setHint: (h: string) => void = () => {};
  private lunge = 0;
  private rockT = 9;
  private prevLeap = 0;
  private pullT = 9;
  private foamAt = 0;
  private smokeAt = 0;
  private sparkAt = 0;

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
    this.strokes = 0;
    this.broke = 0;
    this.leg = 0;
    this.x = 1;
    this.speed = 0.5;
    this.scene ??= new Scene();
    this.scene.restart();
    this.setHint = mountScene(this.root, 'U Pisci a Mari', this.scene).setHint;
    fixHint(this.root);
    this.lunge = 0;
    this.rockT = 9;
    this.pullT = 9;
    this.prevLeap = 0;
    this.hint = 'The rais lifts his arm. Space to pull as his call reaches the boat.';
    this.root.hidden = false;
    this.setHint(this.hint);
  }

  tick(dt: number) {
    if (!this.isOpen) return;
    if (this.phase === 'row') {
      this.x -= dt * this.speed;
      if (this.x < -0.08) {
        this.audio.slosh();
        this.x = 1;
        this.scene?.burst(BOAT_AT.x - 60, 198, { n: calm() ? 2 : 6, color: 'rgba(235,248,250,0.85)', size: 2, speed: 60, life: 0.5, grav: 220 });
        this.rockT = 0;
        this.stumble('The call goes by unpulled. The rais forgives you at the top of his voice. Again.');
      }
    } else if (this.phase === 'leap') {
      this.leapT -= dt;
      const t = 1 - Math.max(0, this.leapT) / 1.5;
      const pt = 1 - this.prevLeap / 1.5;
      const sc = this.scene;
      if (sc && pt < 0.5 && t >= 0.5) {
        sc.burst(203, 74, { n: calm() ? 3 : 6, color: '#f4efe4', kind: 'spark', size: 2.2, speed: 50, life: 0.4, grav: 30 });
      }
      if (sc && pt < 0.93 && t >= 0.93) {
        sc.burst(75, 198, { n: calm() ? 6 : 16, color: 'rgba(235,248,250,0.9)', size: 2.6, speed: 130, life: 0.6, grav: 300 });
        if (!calm()) sc.thump(3, 0.03);
      }
      this.prevLeap = Math.max(0, this.leapT);
      if (this.leapT <= 0) {
        this.phase = 'row';
        this.x = 1;
        this.broke = 0; // a new pass, and the rhythm starts forgiven
        this.speed += 0.14;
        this.hint = 'The boat comes about. The rais calls faster now; the fish has made it personal.';
      }
    }
    this.rockT += dt;
    this.pullT += dt;
    const sc = this.scene;
    if (!sc) return;
    sc.frame(dt, (g) => this.paint(g));
    this.setHint(this.hint);
  }

  onDir(dir: Dir) {
    void dir;
  }

  /**
   * One oar out of time. Three in the same pass and the boat stops being a
   * boat, which is the fail: loud, wet, and instantly repeatable. The fish is
   * never lost, only postponed until everyone stops laughing.
   */
  private stumble(msg: string) {
    this.broke++;
    if (this.broke < 3) {
      this.hint = msg;
      return;
    }
    this.phase = 'lost';
    this.audio.bump();
    const sc = this.scene;
    if (sc) {
      sc.flash('#eaf6fa', 0.16);
      if (!calm()) sc.thump(4, 0.05);
      sc.burst(BOAT_AT.x, 200, { n: calm() ? 6 : 18, color: 'rgba(235,248,250,0.9)', size: 2.8, speed: 120, life: 0.7, grav: 300 });
    }
    this.hint =
      'The stroke breaks. Four oars, four opinions, and the boat sits down in the water like a tired dog. ' +
      'The rais laughs until he has to hold the gunwale. "Amunì, from the top." Space to take it again.';
  }

  onAction() {
    const sc = this.scene;
    if (this.phase === 'lost') {
      this.phase = 'row';
      this.strokes = 0;
      this.broke = 0;
      this.leg = 0;
      this.x = 1;
      this.speed = 0.5;
      this.hint = 'He wipes his eyes and lifts his arm again. Space to pull as the call reaches the boat.';
      return;
    }
    if (this.phase === 'row') {
      if (this.x <= 0.24 && this.x >= -0.08) {
        this.strokes++;
        this.audio.slosh();
        if (sc) {
          this.pullT = 0;
          sc.burst(BOAT_AT.x - 20, 202, { n: calm() ? 5 : 14, color: 'rgba(238,250,252,0.9)', size: 2.6, speed: 110, life: 0.55, grav: 320 });
          if (!calm()) sc.thump(2, 0.02);
          sc.tween(10, 0, 0.5, easeOutCubic, (v) => {
            this.lunge = v;
          });
        }
        if (this.strokes >= 3) {
          if (this.leg < 2) {
            this.leg++;
            this.strokes = 0;
            this.phase = 'leap';
            this.leapT = 1.5;
            this.prevLeap = 1.5;
            this.audio.jingle();
            if (sc) {
              sc.burst(340, 198, { n: calm() ? 8 : 20, color: 'rgba(238,250,252,0.9)', size: 3, speed: 150, life: 0.7, grav: 300 });
              sc.flash('#eaf6fa', 0.15);
              if (!calm()) sc.thump(3, 0.04);
            }
            this.hint =
              this.leg === 1
                ? 'The swordfish LEAPS, silver and laughing, clean over the bow. The crowd howls. It escapes, as scripted.'
                : 'Almost aboard, and gone again in a sheet of spray. The saint on the steps looks unsurprised.';
          } else {
            this.phase = 'done';
            this.audio.weaveDone();
            if (sc) {
              sc.flash('#ffe9b0', 0.4);
              if (!calm()) sc.thump(5, 0.05);
              sc.burst(160, 130, { n: calm() ? 10 : 26, color: '#e8c86a', size: 3, speed: 170, life: 0.9, grav: 200 });
              sc.burst(160, 170, { n: calm() ? 6 : 16, color: 'rgba(238,250,252,0.9)', size: 2.6, speed: 120, life: 0.6, grav: 320 });
            }
            this.hint = 'The fish surrenders, grinning, hauled up to bells and roaring. Press Space.';
          }
        } else {
          this.x = 1;
          this.hint = `Pull! Together! ${3 - this.strokes} more to close on the fish.`;
        }
      } else {
        this.audio.bump();
        this.rockT = 0;
        sc?.burst(BOAT_AT.x + 40, 196, { n: 2, color: 'rgba(235,248,250,0.7)', size: 1.8, speed: 40, life: 0.4, grav: 180 });
        this.stumble('Early. The blade slaps air. Wait for the call to reach the boat; the sea keeps the tempo, not you.');
      }
    } else if (this.phase === 'done') {
      this.root.hidden = true;
      const done = this.onDone;
      this.onDone = null;
      done?.();
    }
  }

  private waves(g: CanvasRenderingContext2D, y: number, k: number, off: number) {
    g.strokeStyle = `rgba(235,248,250,${0.14 + k * 0.14})`;
    g.lineWidth = 2;
    g.beginPath();
    for (let x = -10; x <= 650; x += 16) {
      const yy = y + Math.sin((x + off) * 0.045) * 3.4 * k + Math.sin(x * 0.11 - off * 0.03) * 1.6;
      if (x === -10) g.moveTo(x, yy);
      else g.lineTo(x, yy);
    }
    g.stroke();
  }

  private paint(g: CanvasRenderingContext2D) {
    const sc = this.scene;
    if (!sc) return;
    g.drawImage(pisciBg(), 0, 0);
    if (sc.time - this.smokeAt > 0.4) {
      this.smokeAt = sc.time;
      sc.waft(98 + Math.random() * 12, 28, 'rgba(210,205,218,0.5)', 11);
    }
    this.waves(g, 148, 0.35, sc.time * 18);
    // Fish shadows: the sea is never empty here, only patient.
    for (let k = 0; k < 2; k++) {
      const xx = (k ? 470 : 380) + Math.sin(sc.time * 0.3 + k * 2.1) * 44;
      const yy = 236 + k * 42;
      oval(g, xx, yy, 15, 3.6, 'rgba(14,36,48,0.35)');
      oval(g, xx - 15, yy, 4, 2.4, 'rgba(14,36,48,0.3)');
    }
    if (this.phase === 'row') {
      const sxx = 330 - this.leg * 45 + Math.sin(sc.time * 0.7) * 22;
      oval(g, sxx, 210, 30, 5.5, 'rgba(10,30,42,0.45)');
      rect(g, sxx + 28, 208.6, 16, 1.8, 'rgba(10,30,42,0.4)');
      // The pull window: a patch of sunstruck water off the bow.
      const za = 0.32 + 0.12 * Math.sin(sc.time * 4);
      g.save();
      g.globalAlpha = za;
      g.translate(238, 196);
      g.scale(1, 0.42);
      g.drawImage(glowDisc(72, 'rgba(255,220,140,0.9)'), -72, -72);
      g.restore();
      // The call, rolling in as a swell with a lit crest.
      const cx2 = callX(this.x);
      oval(g, cx2, 202, 30, 6, 'rgba(10,30,42,0.25)');
      oval(g, cx2, 194, 26, 7, 'rgba(228,244,248,0.32)');
      g.strokeStyle = 'rgba(250,252,250,0.85)';
      g.lineWidth = 2.5;
      g.beginPath();
      g.arc(cx2, 199, 18, Math.PI * 1.15, Math.PI * 1.85);
      g.stroke();
      if (sc.time - this.foamAt > 0.12) {
        this.foamAt = sc.time;
        sc.burst(cx2 - 8, 190, { n: 1, speed: 18, grav: 70, size: 1.6, color: 'rgba(240,250,250,0.8)', life: 0.5 });
      }
    }
    // The boat, riding it.
    const bob = wobble(sc.time, 1.5) * 3;
    const bx = BOAT_AT.x + this.lunge;
    const by = BOAT_AT.y + bob;
    const rock = this.rockT < 0.6 ? Math.sin(this.rockT * 18) * 0.05 * (1 - this.rockT / 0.6) : 0;
    g.save();
    g.translate(bx, by);
    g.rotate(wobble(sc.time, 1.5, 1.2) * 0.03 + rock);
    const pk = Math.min(1, this.pullT / 0.45);
    const oarA = 0.62 - Math.sin(pk * Math.PI) * 0.55;
    g.strokeStyle = '#6b4a2e';
    g.lineWidth = 3.5;
    g.lineCap = 'round';
    for (const ox of [-45, -10, 25]) {
      const tipX = ox + Math.cos(oarA) * 36;
      const tipY = -8 + Math.sin(oarA) * 36;
      g.beginPath();
      g.moveTo(ox, -8);
      g.lineTo(tipX, tipY);
      g.stroke();
      oval(g, tipX, tipY, 4.5, 2.4, '#8a6238', oarA);
    }
    g.drawImage(pisciBoat(), -105, -46);
    const armA = -2.0 + (1 - Math.min(1, Math.max(0, this.x))) * 1.6;
    g.strokeStyle = '#2b2b33';
    g.lineWidth = 4;
    g.beginPath();
    g.moveTo(-77, -27);
    g.lineTo(-77 + Math.cos(armA) * 17, -27 + Math.sin(armA) * 17);
    g.stroke();
    dot(g, -77 + Math.cos(armA) * 19, -27 + Math.sin(armA) * 19, 2.4, '#b97f52');
    g.restore();
    this.waves(g, 208, 0.6, -sc.time * 24);
    if (this.phase === 'leap') {
      const t = 1 - Math.max(0, this.leapT) / 1.5;
      const fx = 330 - 258 * t;
      const fy = 196 - Math.sin(Math.PI * t) * 92;
      g.save();
      g.translate(fx, fy);
      g.scale(-1, 1);
      g.rotate(Math.sin((t - 0.5) * Math.PI) * -0.85);
      g.drawImage(pisciFish(), -60, -18);
      g.restore();
      if (!calm() && Math.random() < 0.5) {
        sc.burst(fx, fy + 8, { n: 1, color: 'rgba(220,240,248,0.8)', size: 1.6, speed: 20, life: 0.45, grav: 260 });
      }
    }
    if (this.phase === 'done') {
      const fx = BOAT_AT.x + 14;
      const fy = 116 + wobble(sc.time, 2) * 3;
      g.strokeStyle = 'rgba(43,33,24,0.6)';
      g.lineWidth = 1.4;
      g.beginPath();
      g.moveTo(BOAT_AT.x - 72, 150);
      g.quadraticCurveTo(fx - 20, 130, fx, fy + 20);
      g.stroke();
      g.save();
      g.translate(fx, fy);
      g.rotate(-1.25);
      g.drawImage(pisciFish(), -60, -18);
      g.restore();
      if (sc.time - this.sparkAt > 0.55) {
        this.sparkAt = sc.time;
        const fxx = fx + (Math.random() - 0.5) * 50;
        sc.burst(fxx, fy - 20, { n: calm() ? 2 : 4, color: '#ffe1a0', kind: 'spark', size: 2, speed: 40, life: 0.6, grav: 60 });
        sc.burst(fx, fy + 24, { n: 1, color: 'rgba(220,240,248,0.8)', size: 1.6, speed: 8, life: 0.6, grav: 240 });
      }
    }
    this.waves(g, 262, 0.8, sc.time * 30);
    // The tally plank: corks for strokes, the pass named.
    rr(g, 12, 300, 172, 30, 5, 'rgba(58,42,26,0.78)');
    for (let i = 0; i < 3; i++) {
      const filled = i < this.strokes || this.phase === 'done';
      dot(g, 30 + i * 19, 315, 6, filled ? '#e8b04a' : 'rgba(242,230,208,0.18)');
      g.strokeStyle = 'rgba(242,230,208,0.6)';
      g.lineWidth = 1.4;
      g.beginPath();
      g.arc(30 + i * 19, 315, 6, 0, Math.PI * 2);
      g.stroke();
    }
    const chase = this.phase === 'done' ? 'caught' : ['first pass', 'second pass', 'the taking'][this.leg] ?? '';
    inkText(g, chase, 92, 315, { size: 12, color: 'rgba(242,230,208,0.9)', italic: true });
    // The rhythm plank: three oars in time, and how many are not.
    rr(g, 192, 300, 138, 30, 5, 'rgba(58,42,26,0.78)');
    g.lineCap = 'round';
    for (let i = 0; i < 3; i++) {
      const gone = i < this.broke || this.phase === 'lost';
      g.strokeStyle = gone ? '#c1512f' : 'rgba(242,230,208,0.7)';
      g.lineWidth = 2.6;
      const x0 = 204 + i * 15;
      g.beginPath();
      g.moveTo(x0, gone ? 320 : 322);
      g.lineTo(x0 + (gone ? 9 : 7), gone ? 310 : 308);
      g.stroke();
    }
    inkText(g, 'the stroke', 252, 315, { size: 12, color: 'rgba(242,230,208,0.9)', italic: true });
    if (this.phase === 'lost') {
      inkText(g, 'the rais is still laughing', 344, 70, {
        size: 14,
        italic: true,
        color: 'rgba(40,52,72,0.75)',
        align: 'center',
      });
    }
  }
}

// ---------------------------------------------------------------- the cannoli

/**
 * CannoloPanel: behind Alfio's counter with the pastry bag. Each shell is
 * filled at the moment, never before: press to pipe, press to stop in the
 * sweet zone, both ends, then the garnish. The one real failure is greed:
 * overfill and the shell splits, Alfio eats the evidence, and a blameless
 * new shell is on the board before you can apologize. Nothing is lost but
 * the shell. The law is the lesson: a filled shell waiting is a soggy lie.
 */

type CannoloGarnish = { name: string; line: string };

const GARNISHES: CannoloGarnish[] = [
  { name: 'Pistachio', line: '"Pistachio: the classicist. Somewhere in the hills, Bronte nods."' },
  { name: 'Candied orange', line: '"Candied orange: sunshine that learned how to keep. My grandmother\'s vote."' },
  { name: 'Chocolate', line: '"Chocolate: the modernist. The nonnas complain about it and take two."' },
];

const GCOL = ['#7fae62', '#e0913d', '#4a2f1e'] as const;

type CannoloCustomer = { call: string; served: string };

const CUSTOMERS: CannoloCustomer[] = [
  {
    call: 'First customer: the signora in black from the fish stall. "One cannolo. I will know if the shell sat," she says, entirely correctly.',
    served: 'The signora bites, listens to the crack like a jeweler, and nods once. From her, that is a standing ovation.',
  },
  {
    call: 'Next: a rower from the pageant, still damp, sash and all. "Two ends, full honors. I have earned the loud kind."',
    served: 'The rower eats it in two bites and raises the stub like an oar. The bar applauds the crumbs.',
  },
  {
    call: 'Last customer: Alfio himself, arms folded, off duty for exactly one pastry. "Impress me. I taught you everything you know today."',
    served: 'Alfio chews with his eyes shut, professionally. "Tsk. Tragic," he says, finishing it. "I have nothing left to teach."',
  },
];

const SHELL_AT = { x: 285, y: 250 };
const ENDS = [177, 393] as const;
const GBOWLS = [{ x: 206, y: 176 }, { x: 320, y: 170 }, { x: 434, y: 176 }] as const;

let cannoloBgCache: HTMLCanvasElement | null = null;
function cannoloBg(): HTMLCanvasElement {
  if (cannoloBgCache) return cannoloBgCache;
  const { cv, g } = surface(640, 340);
  const rng = new Rng(70211);
  bakedVGrad(g, 0, 0, 640, 190, '#5c4430', '#8a6a4a');
  // Two shelves of jars and bottles, blurred by warmth and habit.
  for (const shelfY of [42, 104]) {
    for (let i = 0; i < 12; i++) {
      const bx = 12 + i * 53 + rng.int(14);
      const bh = 16 + rng.int(16);
      const bw = 10 + rng.int(8);
      const col = rng.pick(['#7a5a38', '#5c6d50', '#8a6a3a', '#6b4a4e', '#4a5a68'] as const);
      g.globalAlpha = 0.8;
      rr(g, bx, shelfY - bh, bw, bh, 3, col);
      rect(g, bx + 2, shelfY - bh + 2, 2, bh - 5, 'rgba(255,240,210,0.25)');
      if (rng.chance(0.5)) rect(g, bx + bw / 2 - 2, shelfY - bh - 4, 4, 4, shade(col, -0.2));
      g.globalAlpha = 1;
    }
    rect(g, 0, shelfY, 640, 5, '#3a2a1c');
    rect(g, 0, shelfY, 640, 1.5, 'rgba(240,220,180,0.18)');
  }
  g.drawImage(glowDisc(150, 'rgba(255,220,160,0.28)'), -40, -60, 300, 300);
  // The marble, veined like weather.
  bakedVGrad(g, 0, 190, 640, 132, '#e8e2d4', '#c2bbaa');
  rect(g, 0, 190, 640, 3, '#f4efe4');
  for (let i = 0; i < 15; i++) {
    g.strokeStyle = `rgba(120,116,104,${0.08 + rng.next() * 0.14})`;
    g.lineWidth = 1;
    const x = rng.next() * 640;
    const y = 196 + rng.next() * 120;
    g.beginPath();
    g.moveTo(x, y);
    g.bezierCurveTo(x + 30, y + 8 + rng.next() * 8, x + 60, y - 8, x + 100 + rng.next() * 40, y + 6);
    g.stroke();
  }
  bakedVGrad(g, 0, 322, 640, 18, '#7d5836', '#5a3c22');
  // The board the shell rests on.
  rr(g, 148, 270, 274, 26, 8, 'rgba(60,38,18,0.28)');
  rr(g, 150, 266, 270, 26, 8, '#a8824a');
  rect(g, 150, 266, 270, 5, shade('#a8824a', 0.14));
  g.strokeStyle = 'rgba(90,60,30,0.35)';
  g.lineWidth = 1;
  for (const ly of [276, 283] as const) {
    g.beginPath();
    g.moveTo(158, ly);
    g.lineTo(412, ly);
    g.stroke();
  }
  // The gauge: brass strip, a craftsman's honesty about quantities.
  rr(g, 158, 304, 284, 16, 6, 'rgba(60,38,18,0.3)');
  rr(g, 160, 305, 280, 13, 5, '#57452f');
  // The serving tray, doily and all.
  oval(g, 552, 296, 76, 24, '#9a948a');
  oval(g, 552, 293, 72, 21, '#ccc6b8');
  oval(g, 552, 292, 62, 16, '#efe8d8');
  cannoloBgCache = cv;
  return cv;
}

let shellSprCache: HTMLCanvasElement | null = null;
function shellSpr(): HTMLCanvasElement {
  if (shellSprCache) return shellSprCache;
  const { cv, g } = surface(232, 72);
  const rng = new Rng(9922);
  // The tube, fried to blistered gold.
  rr(g, 8, 8, 216, 56, 27, '#c9924a');
  g.save();
  g.beginPath();
  g.roundRect(8, 8, 216, 56, 27);
  g.clip();
  rect(g, 8, 38, 216, 26, '#a8712e');
  rect(g, 8, 52, 216, 12, '#8a5c28');
  g.restore();
  rr(g, 14, 10, 204, 16, 10, 'rgba(240,200,130,0.55)');
  for (let i = 0; i < 30; i++) {
    const bx = 22 + rng.next() * 188;
    const by = 14 + rng.next() * 44;
    const r = 1.6 + rng.next() * 3.4;
    dot(g, bx, by, r, rng.chance(0.6) ? '#e0b464' : '#a06a2e');
    if (rng.chance(0.6)) dot(g, bx - r * 0.3, by - r * 0.3, r * 0.35, 'rgba(255,240,210,0.7)');
  }
  // Open ends: dark, waiting, honest about their emptiness.
  for (const [ex, flip] of [[18, 1], [214, -1]] as const) {
    oval(g, ex, 36, 11, 27, '#6e441f');
    oval(g, ex - flip * 1.5, 36, 9, 24, '#3a2412');
    g.strokeStyle = 'rgba(240,214,160,0.6)';
    g.lineWidth = 1.6;
    g.beginPath();
    g.ellipse(ex, 36, 11, 27, 0, 0, Math.PI * 2);
    g.stroke();
  }
  shellSprCache = cv;
  return cv;
}

let bagSprCache: HTMLCanvasElement | null = null;
function bagSpr(): HTMLCanvasElement {
  if (bagSprCache) return bagSprCache;
  const { cv, g } = surface(90, 140);
  // Cloth cone, twisted shut, star tip. The housecat of ricotta.
  g.fillStyle = '#9aa0a8';
  g.beginPath();
  g.moveTo(38, 108);
  g.lineTo(52, 108);
  g.lineTo(48, 132);
  g.lineTo(42, 132);
  g.closePath();
  g.fill();
  rect(g, 41, 126, 8, 2, '#6b7078');
  g.fillStyle = '#efe6d2';
  g.beginPath();
  g.moveTo(12, 14);
  g.quadraticCurveTo(2, 62, 39, 112);
  g.lineTo(51, 112);
  g.quadraticCurveTo(88, 62, 78, 14);
  g.closePath();
  g.fill();
  g.strokeStyle = 'rgba(120,95,60,0.28)';
  g.lineWidth = 1.6;
  for (const [fx, fy] of [[28, 30], [45, 26], [60, 32]] as const) {
    g.beginPath();
    g.moveTo(fx, fy);
    g.quadraticCurveTo(fx + 3, fy + 40, 45, 106);
    g.stroke();
  }
  rr(g, 30, 96, 30, 9, 3, '#c1512f');
  dot(g, 45, 11, 10, '#e0d4bc');
  g.strokeStyle = '#8a6238';
  g.lineWidth = 2;
  g.beginPath();
  g.moveTo(35, 8);
  g.quadraticCurveTo(45, 16, 55, 8);
  g.stroke();
  bagSprCache = cv;
  return cv;
}

let miniCannoloCache: HTMLCanvasElement | null = null;
function miniCannolo(): HTMLCanvasElement {
  if (miniCannoloCache) return miniCannoloCache;
  const { cv, g } = surface(64, 22);
  rr(g, 6, 3, 52, 16, 8, '#c9924a');
  rr(g, 8, 4, 48, 6, 4, 'rgba(240,200,130,0.5)');
  dot(g, 7, 11, 5.5, '#f4efe4');
  dot(g, 57, 11, 5.5, '#f4efe4');
  miniCannoloCache = cv;
  return cv;
}

type CannoloPhase = 'pipe' | 'burst' | 'garnish' | 'served' | 'done';

export class CannoloPanel {
  private phase: CannoloPhase = 'pipe';
  private shell = 0; // 0..2
  private end = 0; // 0..1, both ends or it is not a cannolo
  private fill = 0; // 0..1 for the current end
  private flowing = false;
  private zoneLo = 0.6;
  private zoneW = 0.2;
  private speed = 0.42;
  private burstT = 0;
  private gCur = 0;
  private hint = '';
  private onDone: (() => void) | null = null;

  private scene: Scene | null = null;
  private setHint: (h: string) => void = () => {};
  private bagEase = 0;
  private creamDone0 = 0;
  private creamDone1 = 0;
  private curGarn = -1;
  private doneShells: number[] = [];
  private servedT = 9;
  private tweezT = 9;
  private spitAt = 0;
  private splats: { x: number; y: number; r: number }[] = [];

  constructor(
    private root: HTMLElement,
    private audio: AudioBus,
  ) {}

  get isOpen(): boolean {
    return !this.root.hidden;
  }

  open(onDone: () => void) {
    this.onDone = onDone;
    this.phase = 'pipe';
    this.shell = 0;
    this.end = 0;
    this.fill = 0;
    this.flowing = false;
    this.speed = 0.42;
    this.zoneLo = 0.6;
    this.gCur = 0;
    this.scene ??= new Scene();
    this.scene.restart();
    this.setHint = mountScene(this.root, 'The Pastry Bag', this.scene).setHint;
    fixHint(this.root);
    this.bagEase = 0;
    this.creamDone0 = 0;
    this.creamDone1 = 0;
    this.curGarn = -1;
    this.doneShells = [];
    this.servedT = 9;
    this.tweezT = 9;
    this.splats = [];
    this.hint = `${CUSTOMERS[0]?.call ?? ''} Space starts the ricotta; Space again stops it in the sweet zone.`;
    this.root.hidden = false;
    this.setHint(this.hint);
  }

  tick(dt: number) {
    if (!this.isOpen) return;
    if (this.phase === 'pipe' && this.flowing) {
      this.fill += dt * this.speed;
      if (this.fill >= 1) {
        // The eruption. Nobody grieves; the owner performs quality control.
        this.flowing = false;
        this.fill = 0;
        this.end = 0;
        this.phase = 'burst';
        this.burstT = 1.6;
        this.audio.slosh();
        const sc = this.scene;
        if (sc) {
          if (!calm()) sc.thump(6, 0.07);
          for (const ex of ENDS) {
            sc.burst(ex, SHELL_AT.y, { n: calm() ? 6 : 18, color: '#f0e8d2', size: 4, speed: 180, life: 0.8, grav: 320 });
          }
          const rng = new Rng((Math.random() * 1e9) | 0);
          this.splats = Array.from({ length: 7 }, () => ({
            x: 185 + rng.next() * 230,
            y: 280 + rng.next() * 28,
            r: 4 + rng.next() * 7,
          }));
        }
        this.creamDone0 = 0;
        this.creamDone1 = 0;
        this.hint =
          'Too much. The shell splits along its seam and lets go from both ends at once. Alfio catches the wreck and eats it in one bite. ' +
          '"Quality control." Another shell is already on the board. Space, or wait for him to chew.';
      }
    } else if (this.phase === 'burst') {
      this.burstT -= dt;
      if (this.burstT <= 0) this.freshShell();
    }
    this.bagEase += ((this.flowing ? 1 : 0) - this.bagEase) * Math.min(1, dt * 8);
    this.servedT += dt;
    this.tweezT += dt;
    const sc = this.scene;
    if (!sc) return;
    sc.frame(dt, (g) => this.paint(g));
    this.setHint(this.hint);
  }

  /** Same customer, same order, no scolding. The split shell costs nothing. */
  private freshShell() {
    this.phase = 'pipe';
    this.splats = [];
    this.burstT = 0;
    this.end = 0;
    this.fill = 0;
    this.creamDone0 = 0;
    this.creamDone1 = 0;
    this.hint = 'A fresh shell, blameless. Space to pipe, Space to stop; the sweet zone forgives, the far wall does not.';
  }

  onDir(dir: Dir) {
    if (this.phase !== 'garnish') return;
    if (dir === 'left' || dir === 'up') this.gCur = (this.gCur + GARNISHES.length - 1) % GARNISHES.length;
    if (dir === 'right' || dir === 'down') this.gCur = (this.gCur + 1) % GARNISHES.length;
  }

  onAction() {
    const sc = this.scene;
    if (this.phase === 'burst') {
      this.freshShell();
      return;
    }
    if (this.phase === 'pipe') {
      if (!this.flowing) {
        this.flowing = true;
        this.hint =
          this.end === 0
            ? 'The ricotta moves. Watch the meter; stop inside the zone.'
            : 'Second end filling. The bag is warmer now, and so is your nerve.';
        return;
      }
      this.flowing = false;
      if (this.fill < this.zoneLo) {
        this.hint = 'Alfio squints down the shell. "That end is still hungry, friend. Again, with courage." The flow waits on your thumb.';
      } else {
        const generous = this.fill > this.zoneLo + this.zoneW;
        sc?.burst(ENDS[this.end] ?? 177, SHELL_AT.y, { n: calm() ? 3 : 7, color: '#f4efe4', size: 2, speed: 40, life: 0.4, grav: 160 });
        if (this.end === 0) {
          this.creamDone0 = this.fill;
          this.end = 1;
          this.fill = 0;
          this.hint = generous
            ? 'Generous, but the shell holds. "Now the other end. A cannolo has no back door, friend; both ends or it is a lie with a hole in it."'
            : 'Clean stop. "Now the other end. A cannolo has no back door, friend. Both ends, always."';
        } else {
          this.creamDone1 = this.fill;
          this.phase = 'garnish';
          this.audio.chime();
          sc?.flash('#fff2d8', 0.18);
          this.hint = generous
            ? 'Both ends full to the brim and holding. "Now the ends get dressed. Arrows choose the garnish; there is no wrong door on this one."'
            : 'Both ends, filled at the moment, no sooner. "Now the garnish. Arrows choose; every answer is correct, which is rare in this country."';
        }
      }
    } else if (this.phase === 'garnish') {
      const g = GARNISHES[this.gCur];
      if (!g) return;
      this.audio.jingle();
      this.curGarn = this.gCur;
      this.phase = 'served';
      this.servedT = 0;
      if (this.gCur === 1) this.tweezT = 0;
      if (sc) {
        const col = GCOL[this.gCur] ?? '#7fae62';
        for (const ex of ENDS) {
          sc.burst(ex, SHELL_AT.y - 26, { n: calm() ? 6 : 14, color: col, size: 2.2, speed: 70, life: 0.7, grav: 260 });
        }
      }
      this.hint = `Both ends dipped. ${g.line} ${CUSTOMERS[this.shell]?.served ?? ''} Space for the next.`;
    } else if (this.phase === 'served') {
      this.doneShells.push(this.curGarn);
      this.shell++;
      if (this.shell < CUSTOMERS.length) {
        this.phase = 'pipe';
        this.end = 0;
        this.fill = 0;
        this.creamDone0 = 0;
        this.creamDone1 = 0;
        this.curGarn = -1;
        this.speed += 0.12; // the bag warms, the ricotta hurries
        this.zoneLo = 0.56 + this.shell * 0.05;
        this.hint = `${CUSTOMERS[this.shell]?.call ?? ''} The ricotta runs faster as the bag warms. Space to pipe.`;
      } else {
        this.phase = 'done';
        this.audio.weaveDone();
        if (sc) {
          sc.flash('#ffe9c0', 0.35);
          if (!calm()) sc.thump(4, 0.04);
          sc.burst(552, 250, { n: calm() ? 8 : 20, color: '#e8c86a', size: 2.6, speed: 130, life: 0.8, grav: 200 });
        }
        this.hint = 'Three shells, three moments, zero soggy lies. Alfio holds out his hand for the bag with visible reluctance. Press Space.';
      }
    } else if (this.phase === 'done') {
      this.root.hidden = true;
      const done = this.onDone;
      this.onDone = null;
      done?.();
    }
  }

  /** The ricotta at one end: a mound that spirals up, then dares to lean out. */
  private drawCream(g: CanvasRenderingContext2D, endX: number, dir: number, f: number, garn: number, active: boolean) {
    if (f <= 0.02) return;
    const sc = this.scene;
    const r = 5 + f * 15;
    const out = Math.max(0, f - 0.35) * 26;
    const cx = endX + dir * (4 + out * 0.5);
    oval(g, cx, SHELL_AT.y + 2, r * 0.9 + out * 0.35, r * 0.92, '#e3dcc8');
    oval(g, cx - dir * 1.5, SHELL_AT.y, r * 0.85 + out * 0.3, r * 0.88, '#f6f1e2');
    const rot = active && this.flowing && sc ? sc.time * 7 : 0.6;
    g.strokeStyle = 'rgba(210,200,178,0.85)';
    g.lineWidth = 1.4;
    for (let k = 0; k < 2; k++) {
      g.beginPath();
      g.arc(cx, SHELL_AT.y, r * (0.35 + k * 0.28), rot + k * 2, rot + k * 2 + 3.6);
      g.stroke();
    }
    dot(g, cx + dir * r * 0.35, SHELL_AT.y - r * 0.55, r * 0.26, '#fbf7ec');
    if (garn >= 0) {
      const col = GCOL[garn] ?? '#7fae62';
      const rng = new Rng(garn * 51 + endX);
      for (let k = 0; k < 11; k++) {
        const a = rng.next() * Math.PI * 2;
        const rad = rng.next() * r * 0.72;
        const px2 = cx + Math.cos(a) * rad;
        const py2 = SHELL_AT.y + Math.sin(a) * rad * 0.9;
        if (garn === 1) rr(g, px2 - 2, py2 - 1.5, 4, 3, 1, shade(col, (rng.next() - 0.5) * 0.14));
        else dot(g, px2, py2, garn === 2 ? 1.9 : 1.6, shade(col, (rng.next() - 0.5) * 0.14));
      }
    }
  }

  private paint(g: CanvasRenderingContext2D) {
    const sc = this.scene;
    if (!sc) return;
    g.drawImage(cannoloBg(), 0, 0);
    // The garnish bar: three bowls, three philosophies.
    const activeG = this.phase === 'garnish';
    GBOWLS.forEach((b, i) => {
      const sel = activeG && i === this.gCur;
      const yb = b.y + (sel ? -4 - Math.abs(Math.sin(sc.time * 5)) * 3 : 0);
      if (sel) {
        g.globalAlpha = 0.8;
        g.drawImage(glowDisc(46, 'rgba(255,214,120,0.55)'), b.x - 46, yb - 34);
        g.globalAlpha = 1;
      }
      oval(g, b.x, yb + 9, 27, 8, 'rgba(50,32,16,0.28)');
      oval(g, b.x, yb + 5, 26, 9.5, '#8a5330');
      oval(g, b.x, yb + 2, 22, 7, '#6e4526');
      const col = GCOL[i] ?? '#7fae62';
      const rng = new Rng(i * 17 + 5);
      for (let k = 0; k < 9; k++) {
        const px2 = b.x + (rng.next() - 0.5) * 32;
        const py2 = yb + 1 - rng.next() * 4;
        if (i === 1) rr(g, px2 - 2, py2 - 1.5, 4, 3, 1, shade(col, (rng.next() - 0.5) * 0.12));
        else dot(g, px2, py2, 2 + rng.next(), shade(col, (rng.next() - 0.5) * 0.12));
      }
      if (activeG) {
        const gn = GARNISHES[i]?.name ?? '';
        rr(g, b.x - 44, yb + 17, 88, 16, 3, sel ? '#f7edd6' : 'rgba(242,230,208,0.72)');
        if (sel) {
          g.strokeStyle = '#c1512f';
          g.lineWidth = 1.6;
          g.beginPath();
          g.roundRect(b.x - 44, yb + 17, 88, 16, 3);
          g.stroke();
        }
        inkText(g, gn, b.x, yb + 25, { size: 10.5, align: 'center', color: sel ? '#2b2118' : 'rgba(43,33,24,0.75)' });
      }
    });
    // Finished cannoli collect on the tray, dressed and vouched for.
    this.doneShells.forEach((garn, i) => {
      g.save();
      g.translate(508 + i * 36, 290 - i * 7);
      g.rotate(-0.12 + i * 0.11);
      g.drawImage(miniCannolo(), -32, -11);
      const col = GCOL[garn] ?? '#7fae62';
      dot(g, -26, 0, 2, col);
      dot(g, 26, 0, 2, col);
      g.restore();
    });
    // The shell of the hour.
    if (this.phase !== 'done') {
      oval(g, SHELL_AT.x, 284, 110, 9, 'rgba(40,24,10,0.28)');
      g.drawImage(shellSpr(), SHELL_AT.x - 116, SHELL_AT.y - 36);
      const end0 = this.phase === 'pipe' && this.end === 0 ? this.fill : this.creamDone0;
      const end1 = this.end === 1 && this.phase === 'pipe' ? this.fill : this.creamDone1;
      this.drawCream(g, ENDS[0], -1, end0, this.curGarn, this.end === 0);
      this.drawCream(g, ENDS[1], 1, end1, this.curGarn, this.end === 1);
      if (this.phase === 'pipe' && this.flowing && sc.time - this.spitAt > 0.06) {
        this.spitAt = sc.time;
        const ex = ENDS[this.end] ?? 177;
        const dir = this.end === 0 ? -1 : 1;
        sc.burst(ex + dir * 10, SHELL_AT.y - 16, { n: 1, speed: 10, grav: 240, size: 2, color: '#f4efe4', life: 0.28 });
      }
      if (this.phase === 'burst') {
        const a = Math.max(0, this.burstT / 1.6);
        for (const sp of this.splats) {
          oval(g, sp.x, sp.y + 1.6, sp.r, sp.r * 0.45, `rgba(150,138,110,${0.5 * a})`);
          oval(g, sp.x, sp.y, sp.r, sp.r * 0.45, `rgba(250,246,234,${0.95 * a})`);
        }
      }
    }
    // The bag, sighing over whichever end is hungry.
    if (this.phase === 'pipe' || this.phase === 'burst') {
      const side = this.end === 0 ? -1 : 1;
      const ex = ENDS[this.end] ?? 177;
      const tipX = ex + side * 16 + wobble(sc.time, 1.3) * 2;
      const tipY = SHELL_AT.y - 34 + this.bagEase * 12 + wobble(sc.time, 1.7, 2) * 1.5;
      const sway = wobble(sc.time, this.flowing ? 9 : 1.6) * (this.flowing ? 0.025 : 0.045);
      g.save();
      g.translate(tipX, tipY);
      g.rotate(-side * 0.55 + sway);
      const squeeze = this.flowing ? 0.94 + Math.sin(sc.time * 11) * 0.02 : 1;
      squashed(g, 0, -60, 2 - squeeze, squeeze, (gg) => gg.drawImage(bagSpr(), -45, -128));
      g.restore();
    }
    // The gauge: needle, sweet zone, no diplomacy.
    if (this.phase === 'pipe' || this.phase === 'burst') {
      const zx = 160 + this.zoneLo * 280;
      const zw = this.zoneW * 280;
      rr(g, zx, 306, zw, 11, 4, '#e0b13d');
      rr(g, zx, 306, zw, 4.5, 2, 'rgba(255,240,200,0.55)');
      for (const f of [0.25, 0.5, 0.75]) rect(g, 160 + f * 280, 307, 1.5, 9, 'rgba(242,230,208,0.3)');
      const pct = Math.min(100, this.fill * 100);
      const nx = 160 + Math.min(1, this.fill) * 280;
      rect(g, nx - 0.8, 305, 1.6, 13, '#f4efe4');
      g.fillStyle = '#f4efe4';
      g.strokeStyle = 'rgba(43,33,24,0.7)';
      g.lineWidth = 1.4;
      g.beginPath();
      g.moveTo(nx - 5.5, 296);
      g.lineTo(nx + 5.5, 296);
      g.lineTo(nx, 304);
      g.closePath();
      g.fill();
      g.stroke();
      inkText(g, `${Math.round(pct)}%`, 452, 312, { size: 12, color: '#2b2118', bold: true });
    }
    // The order ticket, impaled on habit.
    g.save();
    g.translate(88, 38);
    g.rotate(-0.03);
    rr(g, -75, -25, 150, 52, 4, 'rgba(50,32,16,0.25)');
    rr(g, -77, -27, 150, 52, 4, '#f7f0dc');
    rr(g, -14, -31, 28, 9, 2, 'rgba(220,200,150,0.55)');
    inkText(g, `shell ${Math.min(this.shell + 1, 3)} of 3`, -66, -12, { size: 12.5, bold: true });
    const state =
      this.phase === 'burst' ? 'erupted'
      : this.phase === 'pipe' ? `end ${this.end + 1} of 2 · ${this.flowing ? 'piping' : 'holding'}`
      : this.phase === 'garnish' ? 'the garnish'
      : this.phase === 'served' ? 'served'
      : 'the bag returns';
    inkText(g, state, -66, 8, { size: 11.5, italic: true, color: 'rgba(43,33,24,0.8)' });
    g.restore();
    // Tweezers for the candied orange; every jewel is placed, never dropped.
    if (this.tweezT < 1.0) {
      const p = this.tweezT;
      const yy = p < 0.5 ? 118 + 108 * easeOutCubic(p * 2) : 226 - 108 * easeInCubic((p - 0.5) * 2);
      g.strokeStyle = '#59616b';
      g.lineWidth = 2.6;
      g.beginPath();
      g.moveTo(ENDS[1] + 26, yy - 42);
      g.lineTo(ENDS[1] + 2, yy);
      g.moveTo(ENDS[1] + 34, yy - 40);
      g.lineTo(ENDS[1] + 5, yy + 1);
      g.stroke();
      if (p < 0.55) rr(g, ENDS[1], yy - 2, 6, 4.5, 1, '#e0913d');
    }
    // The sugar, falling like weather that loves you.
    if (this.phase === 'served' && this.servedT < 2.0) {
      const n = calm() ? 1 : 3;
      for (let k = 0; k < n; k++) {
        sc.burst(168 + Math.random() * 240, 178, { n: 1, speed: 6, grav: 32, drag: 0.5, size: 1.8, color: 'rgba(252,250,242,0.95)', life: 1.0 });
      }
    }
    if (this.phase === 'served') {
      // The veil settles: a pale dusting gathers on the shell's shoulder.
      const k = Math.min(0.5, Math.max(0, this.servedT - 0.25) * 0.35);
      if (k > 0.01) rr(g, SHELL_AT.x - 104, SHELL_AT.y - 30, 208, 20, 10, `rgba(250,247,240,${k})`);
    }
    if (this.phase === 'served' || this.phase === 'done') {
      inkText(g, 'filled at the moment, never before', 320, 152, { size: 13, italic: true, color: 'rgba(244,236,214,0.85)', align: 'center' });
    }
  }
}
