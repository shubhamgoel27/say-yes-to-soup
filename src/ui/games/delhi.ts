import type { Dir } from '../../engine/input';
import type { AudioBus } from '../../engine/audio';
import { Scene, mountScene, wobble, easeOutCubic, easeOutBack, easeInOutSine, keyCap } from './scene';
import { Rng, dot, oval, rr, shade, surface, vgrad, softShadow } from '../../art/pix';

/**
 * Old Delhi's two hands-on verbs.
 *
 * ParanthaPanel: Kamla Chachi's griddle. Roll the disc even, cup the
 * stuffing, seal without tearing, and flip on the sound the tawa makes, not
 * on the clock. Three paranthas, rising in ambition: aloo, mooli, and the
 * rabri graduation. Success is measured in a customer's silence.
 *
 * PatangPanel: the rooftop, a patang on plain cotton dor. Two verbs only:
 * kheench (pull, Up) when the line is taut, dheel (slack, Down) when the
 * gust comes. When pigeons cross, you give the sky back; that is Yusuf's
 * one law, and the game's. Practice flies one rival; the tournament flies
 * three, into the front of a monsoon storm.
 *
 * Both panels paint real scenes now: the tawa close-up in the gali, and the
 * rooftop sky at pigeon hour. The logic underneath is untouched, save one
 * repair: the second roll used to dead-end and never reach the tawa.
 *
 * Both also know how to fail, warmly. Ignore the tawa twice on one parantha
 * and it burns: Kamla is delighted, Sheru is delighted, and fresh dough
 * lands in your palm on the next press. Let the rival's line saw yours three
 * times and he takes your dor: your patang tumbles away over the rooftops,
 * the flock scatters, and Yusuf unwinds another off the charkhi. Kaghaz
 * sasta hai, hawa muft. Neither failure ever costs more than the round, and
 * neither can end the panel; only finishing does.
 */

const linear = (t: number) => t;

const calmMotion = () => document.body.classList.contains('reduce-motion');

/** Hex blend, for dough browning and sky moods. */
function mixHex(a: string, b: string, t: number): string {
  const pa = Number.parseInt(a.slice(1), 16);
  const pb = Number.parseInt(b.slice(1), 16);
  const ch = (sh: number) => {
    const va = (pa >> sh) & 255;
    const vb = (pb >> sh) & 255;
    return Math.round(va + (vb - va) * Math.max(0, Math.min(1, t)));
  };
  return `#${((ch(16) << 16) | (ch(8) << 8) | ch(0)).toString(16).padStart(6, '0')}`;
}

/** Baked radial glows, cached; per-frame gradients are banned in panels. */
const glowCache = new Map<string, HTMLCanvasElement>();
function glowCv(color: string, r: number): HTMLCanvasElement {
  const key = `${color}/${r}`;
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
function stampGlow(g: CanvasRenderingContext2D, x: number, y: number, r: number, color: string, alpha: number) {
  const cv = glowCv(color, 64);
  g.globalAlpha = alpha;
  g.drawImage(cv, x - r, y - r, r * 2, r * 2);
  g.globalAlpha = 1;
}

/** Shared soft vignette so both scenes sit into the journal page. */
let vignCache: HTMLCanvasElement | null = null;
function vignette(): HTMLCanvasElement {
  if (vignCache) return vignCache;
  const { cv, g } = surface(640, 340);
  const grad = g.createRadialGradient(320, 170, 150, 320, 170, 360);
  grad.addColorStop(0, 'rgba(40,26,16,0)');
  grad.addColorStop(1, 'rgba(40,26,16,0.30)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 640, 340);
  vignCache = cv;
  return cv;
}

// ------------------------------------------------------------ the griddle

type Course = {
  name: string;
  stuffing: string;
  /** Width of the good zone on the rolling meter, in 0..1. */
  zone: number;
  /** Flips needed on the tawa. */
  flips: number;
  intro: string;
  /** Filling paint: mound color plus fleck colors. */
  fill: string;
  flecks: string[];
};

const COURSES: Course[] = [
  {
    name: 'aloo parantha',
    stuffing: 'spiced potato, coriander, one secret',
    zone: 0.3,
    flips: 2,
    intro: 'Aloo first. Everyone begins at aloo; it forgives like a grandmother.',
    fill: '#d9a441',
    flecks: ['#3d5226', '#b5432f'],
  },
  {
    name: 'mooli parantha',
    stuffing: 'grated radish, squeezed dry, ajwain',
    zone: 0.22,
    flips: 3,
    intro: 'Mooli now. Wet radish tears the dough; Kamla has squeezed it so you cannot fail her. Only yourself.',
    fill: '#e8e0cc',
    flecks: ['#4d7440', '#8a6238'],
  },
  {
    name: 'rabri parantha',
    stuffing: 'thickened sweet milk, pistachio, nerve',
    zone: 0.15,
    flips: 3,
    intro: 'The rabri parantha. The graduation. Kamla folds her arms, which is the highest form of watching.',
    fill: '#f0e0b8',
    flecks: ['#7a9e5a', '#c98a2e'],
  },
];

const OOPS_ROLL = [
  'Lopsided. Kamla flattens it with one pass, no comment. The comment is the silence.',
  'Too thin at the edge. "The stuffing will escape there, beta. Stuffing always finds the thin place."',
  'She takes your hands in hers and rolls one slow circle. "Feel that? Even. The pin listens to the palms."',
];

/** Three ways to miss the singing band, none of them fatal. */
const OOPS_EARLY = 'Early. The underside is pale as a clerk. "Listen to the tawa, beta. It says when."';
const OOPS_LATE = 'A beat late; the palta lifts a dark ring. Kamla turns that side toward herself and says nothing about it.';
const OOPS_IGNORED = 'Late. A dark scorch ring, and a smell with an opinion. One more like that and it is Sheru\'s dinner.';

/**
 * The burn. Kamla has waited all evening for this and it has made her
 * evening; the gali dog has waited all his life. Nothing is lost but the
 * parantha, and the parantha was never the point.
 */
const BURNT_LINES = [
  'Black as a bad decision. Kamla laughs from the belly, the first real laugh she has given you, and scrapes it off with two strokes.',
  'Burnt. Kamla holds it up to the lane like evidence. "See? A cook. Only cooks burn things; eaters just complain."',
  'Charcoal. She is enjoying this enormously. "Ghee is cheap, beta. Atta is cheap. Learning is the only expensive thing here."',
];

/** Blister freckles in unit-disc coords, revealed as a side browns. */
const FRECKLES: [number, number, number, number][] = (() => {
  const rng = new Rng(1974);
  const out: [number, number, number, number][] = [];
  for (let i = 0; i < 30; i++) {
    const a = rng.next() * Math.PI * 2;
    const rad = Math.sqrt(rng.next()) * 0.86;
    out.push([Math.cos(a) * rad, Math.sin(a) * rad, 1.6 + rng.next() * 2.6, 0.3 + rng.next() * 0.6]);
  }
  return out;
})();

const TAWA = { x: 438, y: 228, rx: 118, ry: 52 } as const;
const CHAKLA = { x: 140, y: 236 } as const;
const TRACK = { x: 58, y: 293, w: 168 } as const;
const STACK = { x: 592, y: 294 } as const;

const DOUGH = '#eadbb0';
const GOLD_BROWN = '#c8842e';
const DEEP_BROWN = '#8a5330';

let stallCache: HTMLCanvasElement | null = null;
function stallBg(): HTMLCanvasElement {
  if (stallCache) return stallCache;
  const { cv, g } = surface(640, 340);
  const rng = new Rng(411);

  // The gali wall, warm plaster gone damp at the top: it is sawan outside.
  vgrad(g, 0, 0, 640, 210, '#d4ab72', '#b68e59');
  for (let i = 0; i < 14; i++) {
    const x = rng.next() * 640;
    const y = 46 + rng.next() * 150;
    oval(g, x, y, 12 + rng.next() * 24, 4 + rng.next() * 7, `rgba(96,74,58,${0.03 + rng.next() * 0.03})`);
  }
  for (let i = 0; i < 6; i++) {
    const x = 30 + rng.next() * 580;
    rect(g, x, 34, 2 + rng.next() * 4, 26 + rng.next() * 50, 'rgba(90,70,58,0.06)');
  }

  // Kamla's iron: a palta and a jhara hanging from nails by the tawa's side.
  for (const [hx, hy, hl] of [[104, 88, 62], [146, 92, 52]] as const) {
    dot(g, hx, hy, 2.2, '#4a3226');
    g.strokeStyle = '#4a3226';
    g.lineWidth = 4;
    g.beginPath();
    g.moveTo(hx, hy);
    g.lineTo(hx + 3, hy + hl);
    g.stroke();
    if (hl > 56) {
      rr(g, hx - 8, hy + hl, 22, 13, 3, '#3d2a1e');
      rr(g, hx - 6, hy + hl + 2, 18, 9, 2, '#54402e');
    } else {
      dot(g, hx + 4, hy + hl + 6, 10, '#3d2a1e');
      dot(g, hx + 4, hy + hl + 6, 7, '#54402e');
      for (let k = 0; k < 5; k++) dot(g, hx + Math.cos(k * 1.25) * 4.5 + 4, hy + hl + 6 + Math.sin(k * 1.25) * 4.5, 1, '#2b2118');
    }
    rr(g, hx - 2, hy + 4, 5, 14, 2, '#8a5f38');
  }

  // A niche shelf with the stall's brass and pickle jars.
  rr(g, 246, 118, 330, 11, 2, '#775233');
  rect(g, 246, 129, 330, 3, 'rgba(43,33,24,0.28)');
  for (const [px, pw] of [[276, 34], [330, 26]] as const) {
    oval(g, px, 112, pw / 2, 8, '#a9803c');
    rr(g, px - pw / 2, 92, pw, 22, 6, '#c8963f');
    oval(g, px, 92, pw / 2, 6, '#e0b45f');
    oval(g, px - pw / 5, 100, pw / 6, 7, 'rgba(255,236,190,0.5)');
  }
  for (const [jx, jc] of [[392, '#a84a2e'], [430, '#c98a2e'], [468, '#6e7a3a']] as const) {
    rr(g, jx - 13, 90, 26, 28, 4, 'rgba(214,224,222,0.5)');
    rr(g, jx - 11, 98, 22, 18, 3, jc);
    rr(g, jx - 9, 86, 18, 6, 2, '#8a5f38');
  }
  for (let i = 0; i < 5; i++) oval(g, 530, 116 - i * 4, 26 - i, 4, i % 2 ? '#c9c2b4' : '#b3aca0');

  // Awning stripes with scalloped hems, and marigold swags below.
  for (let i = 0; i < 17; i++) rect(g, i * 40, 0, 40, 30, i % 2 ? '#e6d5ae' : '#b5533a');
  for (let i = 0; i < 17; i++) {
    g.fillStyle = i % 2 ? '#e6d5ae' : '#b5533a';
    g.beginPath();
    g.arc(i * 40 + 20, 30, 20, 0, Math.PI);
    g.fill();
  }
  rect(g, 0, 48, 640, 8, 'rgba(43,33,24,0.10)');
  for (let s = 0; s < 2; s++) {
    const x0 = s * 320;
    g.strokeStyle = 'rgba(60,44,30,0.5)';
    g.lineWidth = 1.2;
    g.beginPath();
    g.moveTo(x0, 50);
    g.quadraticCurveTo(x0 + 160, 50 + 52, x0 + 320, 50);
    g.stroke();
    for (let i = 0; i <= 14; i++) {
      const t = i / 14;
      const x = x0 + t * 320;
      const y = 50 + Math.sin(t * Math.PI) * 26;
      dot(g, x, y, 4.6, i % 2 ? '#e8952c' : '#d9772c');
      dot(g, x - 1.4, y - 1.4, 1.8, i % 2 ? '#f6b04a' : '#e8952c');
      if (i % 3 === 1) oval(g, x + 3, y + 4, 3, 1.8, '#4d7440', 0.6);
    }
  }

  // The counter: thick old wood, ghee-stained near the tawa.
  rect(g, 0, 198, 640, 8, '#a87d4e');
  vgrad(g, 0, 206, 640, 134, '#8a5f38', '#5c3d24');
  g.strokeStyle = 'rgba(60,40,24,0.4)';
  g.lineWidth = 1.6;
  for (const y of [246, 292]) {
    g.beginPath();
    g.moveTo(0, y);
    g.lineTo(640, y + 6);
    g.stroke();
  }
  for (let i = 0; i < 12; i++) {
    oval(g, TAWA.x - 40 + rng.next() * 110, 300 + rng.next() * 32, 5 + rng.next() * 9, 2 + rng.next() * 3, 'rgba(46,29,18,0.25)');
  }

  // The chakla, dusted with flour, with a dotted ring where even lives.
  softShadow(g, CHAKLA.x, CHAKLA.y + 26, 84, 22, 0.3);
  oval(g, CHAKLA.x, CHAKLA.y + 5, 86, 34, '#8a5f38');
  oval(g, CHAKLA.x, CHAKLA.y, 86, 34, '#c69a62');
  oval(g, CHAKLA.x, CHAKLA.y - 2, 78, 29, '#d3a86e');
  for (let i = 0; i < 46; i++) {
    const a = rng.next() * Math.PI * 2;
    const rad = Math.sqrt(rng.next());
    dot(g, CHAKLA.x + Math.cos(a) * rad * 74, CHAKLA.y + Math.sin(a) * rad * 26, 0.8 + rng.next() * 1.8, 'rgba(246,238,216,0.55)');
  }
  g.strokeStyle = 'rgba(43,33,24,0.30)';
  g.lineWidth = 1.4;
  g.setLineDash([5, 6]);
  g.beginPath();
  g.ellipse(CHAKLA.x, CHAKLA.y - 1, 57, 22, 0, 0, Math.PI * 2);
  g.stroke();
  g.setLineDash([]);

  // The rolling scale inlaid on the counter edge; the gold zone is dynamic.
  rr(g, TRACK.x - 5, TRACK.y - 5, TRACK.w + 10, 10, 5, 'rgba(30,20,13,0.45)');

  // Atta peras waiting their turn, in a steel bowl by the board.
  softShadow(g, 58, 216, 26, 8, 0.24);
  oval(g, 58, 210, 26, 11, '#b3aca0');
  oval(g, 58, 207, 22, 8, '#8c8479');
  oval(g, 50, 204, 9, 6.5, '#eadbb0');
  oval(g, 66, 205, 9, 6.5, '#e2d2a4');
  oval(g, 48, 201, 3.5, 2, '#f6ecc8');
  oval(g, 64, 202, 3.5, 2, '#f2e6c0');

  // The filling katori, deep brass, and the ghee lota with its spoon.
  softShadow(g, 280, 276, 32, 9, 0.28);
  g.fillStyle = '#a9803c';
  g.beginPath();
  g.moveTo(254, 252);
  g.quadraticCurveTo(256, 274, 280, 275);
  g.quadraticCurveTo(304, 274, 306, 252);
  g.closePath();
  g.fill();
  oval(g, 280, 252, 26, 10, '#c8963f');
  oval(g, 280, 252, 22, 8, '#59371e');
  oval(g, 262, 260, 5, 7, 'rgba(255,236,190,0.35)');
  // (The ghee lota is painted after the tawa so it sits in front of it.)

  // The tawa itself: old iron, a life of heat written on it.
  softShadow(g, TAWA.x, TAWA.y + 34, 132, 30, 0.34);
  oval(g, TAWA.x, TAWA.y + 6, TAWA.rx + 6, TAWA.ry + 5, '#191412');
  oval(g, TAWA.x, TAWA.y, TAWA.rx + 6, TAWA.ry + 5, '#241d1a');
  oval(g, TAWA.x, TAWA.y, TAWA.rx - 6, TAWA.ry - 5, '#332a24');
  oval(g, TAWA.x, TAWA.y + 2, TAWA.rx - 42, TAWA.ry - 22, '#3d3129');
  for (let i = 0; i < 24; i++) {
    const a = rng.next() * Math.PI * 2;
    const rad = Math.sqrt(rng.next());
    oval(g, TAWA.x + Math.cos(a) * rad * 96, TAWA.y + Math.sin(a) * rad * 40, 2 + rng.next() * 5, 1 + rng.next() * 2, 'rgba(20,14,10,0.4)');
  }
  g.strokeStyle = 'rgba(240,200,140,0.16)';
  g.lineWidth = 3;
  g.beginPath();
  g.ellipse(TAWA.x, TAWA.y - 1, TAWA.rx, TAWA.ry, 0, Math.PI * 1.15, Math.PI * 1.85);
  g.stroke();
  g.strokeStyle = '#241d1a';
  g.lineWidth = 5;
  g.beginPath();
  g.moveTo(TAWA.x - TAWA.rx - 4, TAWA.y - 2);
  g.lineTo(TAWA.x - TAWA.rx - 22, TAWA.y - 14);
  g.stroke();

  // The ghee lota with its spoon, parked in front of the tawa's cool edge.
  softShadow(g, 340, 282, 22, 7, 0.26);
  g.fillStyle = '#b3873c';
  g.beginPath();
  g.moveTo(324, 252);
  g.quadraticCurveTo(318, 272, 326, 278);
  g.quadraticCurveTo(334, 283, 340, 283);
  g.quadraticCurveTo(352, 283, 357, 276);
  g.quadraticCurveTo(363, 269, 356, 252);
  g.closePath();
  g.fill();
  oval(g, 340, 252, 16, 6, '#e0b45f');
  oval(g, 340, 252, 12, 4.4, '#f2d98a');
  oval(g, 330, 264, 4, 9, 'rgba(255,236,190,0.4)');
  g.strokeStyle = '#6e4a2c';
  g.lineWidth = 3;
  g.beginPath();
  g.moveTo(334, 249);
  g.lineTo(324, 231);
  g.stroke();
  dot(g, 323, 230, 3.4, '#8a5f38');

  // The serving thali waiting at the counter's edge.
  softShadow(g, STACK.x, STACK.y + 10, 42, 12, 0.26);
  oval(g, STACK.x, STACK.y + 3, 42, 15, '#a9803c');
  oval(g, STACK.x, STACK.y, 42, 15, '#c8963f');
  oval(g, STACK.x, STACK.y - 1, 35, 11, '#b58a3f');
  g.strokeStyle = 'rgba(255,236,190,0.35)';
  g.lineWidth = 1.6;
  g.beginPath();
  g.ellipse(STACK.x, STACK.y - 1, 38, 12.5, 0, Math.PI * 1.1, Math.PI * 1.9);
  g.stroke();
  stallCache = cv;
  return cv;
}

function rect(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, c: string) {
  g.fillStyle = c;
  g.fillRect(x, y, w, h);
}

let gheeCache: HTMLCanvasElement | null = null;
function gheeSheet(): HTMLCanvasElement {
  if (gheeCache) return gheeCache;
  const { cv, g } = surface(280, 130);
  const grad = g.createRadialGradient(140, 65, 6, 140, 65, 130);
  grad.addColorStop(0, 'rgba(255,228,150,0.75)');
  grad.addColorStop(0.4, 'rgba(255,214,130,0.28)');
  grad.addColorStop(1, 'rgba(255,214,130,0)');
  g.save();
  g.translate(140, 65);
  g.scale(1, 0.46);
  g.translate(-140, -65);
  g.fillStyle = grad;
  g.fillRect(0, -80, 280, 290);
  g.restore();
  gheeCache = cv;
  return cv;
}

/** One parantha, seen from above at tawa angle. brown in 0..1 per side shown. */
function drawParantha(
  g: CanvasRenderingContext2D,
  x: number,
  y: number,
  rx: number,
  ry: number,
  brown: number,
  seed: number,
) {
  oval(g, x, y + 3, rx, ry, 'rgba(26,16,10,0.35)');
  oval(g, x, y, rx, ry, mixHex(DOUGH, GOLD_BROWN, brown * 0.9));
  if (brown > 0.55) {
    g.globalAlpha = (brown - 0.55) * 1.4;
    oval(g, x, y, rx * 0.94, ry * 0.94, mixHex(GOLD_BROWN, DEEP_BROWN, (brown - 0.55) * 1.6));
    g.globalAlpha = 1;
  }
  oval(g, x - rx * 0.24, y - ry * 0.3, rx * 0.42, ry * 0.36, `rgba(250,238,205,${0.28 - brown * 0.16})`);
  oval(g, x + rx * 0.3, y + ry * 0.18, rx * 0.3, ry * 0.26, `rgba(250,238,205,${0.16 - brown * 0.1})`);
  for (let i = 0; i < FRECKLES.length; i++) {
    const f = FRECKLES[(i + seed) % FRECKLES.length];
    if (!f) continue;
    const [fx, fy, fr, th] = f;
    if (brown <= th) continue;
    g.globalAlpha = Math.min(0.85, (brown - th) * 3);
    oval(g, x + fx * rx, y + fy * ry, fr, fr * (ry / rx), i % 3 ? '#5a3018' : '#3d2014');
    g.globalAlpha = 1;
  }
  g.strokeStyle = `rgba(255,236,190,${0.25 + brown * 0.2})`;
  g.lineWidth = 1.6;
  g.beginPath();
  g.ellipse(x, y - 1, rx * 0.99, ry * 0.99, 0, Math.PI * 1.15, Math.PI * 1.85);
  g.stroke();
}

const SHERU = { coat: '#c08a4e', lit: '#d9a86a', line: '#4a2f1c' } as const;

/** Body and head as one silhouette, so the outline pass is the same shapes. */
function sheruBody(g: CanvasRenderingContext2D, i: number, color: string) {
  rr(g, -46 - i, -64 - i, 58 + 2 * i, 68 + 2 * i, 22 + i, color);
  rr(g, -10 - i, -76 - i, 38 + 2 * i, 52 + 2 * i, 16 + i, color);
  rr(g, 8 - i, -58 - i, 20 + 2 * i, 60 + 2 * i, 9 + i, color);
  rr(g, 2 - i, -12 - i, 32 + 2 * i, 12 + 2 * i, 6 + i, color);
}
function sheruHead(g: CanvasRenderingContext2D, i: number, color: string, caught: boolean) {
  // Ears first: they sit behind the skull in the silhouette.
  g.fillStyle = color;
  g.beginPath();
  g.moveTo(-8 - i, -16);
  g.lineTo(-2, -48 - i - (caught ? 5 : 0));
  g.lineTo(10 + i, -17);
  g.closePath();
  g.fill();
  g.beginPath();
  g.moveTo(-12, -18 - i);
  g.quadraticCurveTo(-34 - i, -14, -27 - i, 6 + i);
  g.quadraticCurveTo(-14, -4, -6, -12);
  g.closePath();
  g.fill();
  rr(g, -20 - i, -22 - i, 44 + 2 * i, 36 + 2 * i, 14 + i, color);
  rr(g, 14 - i, -10 - i, 32 + 2 * i, 20 + 2 * i, 8 + i, color);
}

/**
 * Sheru, the gali's dog: brown, one standing ear, one clear conscience. He
 * sits side-on at the front edge of the stall, most of him below the frame,
 * facing the tawa with the patience of an employee. He is drawn large on
 * purpose; a small dog in the corner would read as a prop, and he is not.
 */
function drawSheru(
  g: CanvasRenderingContext2D,
  x: number,
  ground: number,
  time: number,
  caught: boolean,
  rise: number,
) {
  const S = 1.32;
  const wag = Math.sin(time * (caught ? 17 : 11));
  const tilt = caught ? -0.26 : -0.05 + Math.sin(time * 2.2) * 0.035;

  softShadow(g, x + 4, ground - 2, 52, 12, 0.34);
  g.save();
  g.translate(x, ground);
  g.scale(S, S);
  g.globalAlpha = Math.min(1, rise * 2.5);

  // Tail, sweeping the dust behind him at a rate set by the ghee.
  for (const [w, c] of [[13, SHERU.line], [7, SHERU.coat]] as const) {
    g.strokeStyle = c;
    g.lineWidth = w;
    g.lineCap = 'round';
    g.beginPath();
    g.moveTo(-40, -34);
    g.quadraticCurveTo(-66, -48, -58 + wag * 15, -70 + Math.cos(time * 11) * 8);
    g.stroke();
  }
  g.lineCap = 'butt';

  // Outline pass, then the coat: a street dog needs a hard edge to read
  // against a counter that is exactly his color.
  sheruBody(g, 3, SHERU.line);
  sheruBody(g, 0, SHERU.coat);
  rr(g, -42, -60, 44, 26, 15, SHERU.lit);
  rr(g, 2, -12, 32, 12, 6, SHERU.lit);

  g.save();
  g.translate(16, -74);
  g.rotate(tilt);
  sheruHead(g, 3, SHERU.line, caught);
  sheruHead(g, 0, SHERU.coat, caught);
  rr(g, 14, -10, 32, 20, 8, SHERU.lit);
  rr(g, -16, -20, 28, 11, 7, SHERU.lit);
  // Nose, and the one eye you can see, which is watching the tawa.
  rr(g, 38, -8, 12, 12, 5, '#3d2a1e');
  dot(g, 44, -3, 2.6, '#2b2118');
  dot(g, 0, -10, 3.4, '#2b2118');
  dot(g, -1, -11.4, 1.2, '#f6ecc8');
  if (caught) {
    // The parantha is gone. A tongue appears, briefly, in gratitude.
    rr(g, 30, 6, 18, 9, 4, '#c4626a');
    dot(g, 52, 8 + Math.sin(time * 6) * 2, 2, '#3d2a1e');
  }
  g.restore();

  g.globalAlpha = 1;
  g.restore();
}

type PPhase = 'roll' | 'stuff' | 'tawa' | 'burnt' | 'served' | 'done';

const TAWA_LEGEND = [{ keys: ['space'], does: 'stop the pin, turn the parantha, lift it off' }] as const;

export class ParanthaPanel {
  private phase: PPhase = 'roll';
  private course = 0;
  private meter = 0; // rolling meter position, bounces 0..1
  private dir = 1;
  private flipsDone = 0;
  private sizzle = 0; // 0..1, flip window near the top
  private rolled = 0;
  /** Missed singing windows on THIS parantha. The second one burns it. */
  private overheld = 0;
  private burnt = 0; // burnt paranthas, for the caption's honest arithmetic
  private hint = '';
  private onDone: (() => void) | null = null;

  // Visual layer only, from here down.
  private scene: Scene | null = null;
  private setHint: ((h: string) => void) | null = null;
  private flipA = 1; // flip arc anim, 1 = at rest
  private flipSwapped = false;
  private landSq = 1; // landing squash scale
  private wobA = 1; // failed-roll dough wobble
  private brownUp = 0; // browning of the side facing up
  private brownDown = 0;
  private slideA = 1; // finished parantha arcing to the thali
  private stacked = 0;
  private servedT = 0; // butter-melting clock
  private steamT = 0;
  private flourT = 0;
  private singT = 0;
  private burnT = 0; // seconds since the burn, drives the toss and the dog
  private burntLine = 0;

  constructor(
    private root: HTMLElement,
    private audio: AudioBus,
  ) {}

  get isOpen(): boolean {
    return !this.root.hidden;
  }

  open(onDone: () => void) {
    this.onDone = onDone;
    this.course = 0;
    this.burnt = 0;
    this.stacked = 0;
    this.slideA = 1;
    this.servedT = 0;
    this.freshDough(`${COURSES[0]?.intro} Space stops the pin when the disc is even: the middle of the meter.`);
    this.root.hidden = false;
    if (!this.scene) this.scene = new Scene();
    this.scene.restart();
    this.setHint = mountScene(this.root, "Kamla Chachi's Tawa", this.scene, TAWA_LEGEND).setHint;
    // The overlay root inherits #frame's line-height: 0; restore prose here.
    this.root.style.lineHeight = '1.45';
    this.render();
  }

  tick(dt: number) {
    if (!this.isOpen) return;
    if (this.phase === 'roll') {
      const speed = 0.9 + this.course * 0.35;
      this.meter += dt * speed * this.dir;
      if (this.meter > 1) {
        this.meter = 1;
        this.dir = -1;
      }
      if (this.meter < 0) {
        this.meter = 0;
        this.dir = 1;
      }
      this.render();
    } else if (this.phase === 'tawa') {
      // The sizzle climbs; flip inside the singing window near the top.
      this.sizzle = Math.min(1, this.sizzle + dt * (0.34 + this.course * 0.1));
      if (this.sizzle >= 1) {
        // Held too long. Once is a scorch ring and a warning; twice on the
        // same parantha and the tawa has made its decision without you.
        this.sizzle = 0;
        this.overheld++;
        const s = this.scene;
        if (this.overheld >= 2) {
          this.burnIt();
        } else {
          this.audio.bump();
          this.hint = OOPS_IGNORED;
          this.brownDown = Math.min(1, this.brownDown + 0.3);
          if (s) {
            if (!calmMotion()) s.thump(2, 0.02);
            for (let i = 0; i < 3; i++) s.waft(TAWA.x - 20 + i * 22, TAWA.y - 24, 'rgba(96,86,78,0.5)', 8);
          }
        }
      }
      this.render();
    } else if (this.phase === 'burnt') {
      this.burnT += dt;
      this.render();
    }
    const s = this.scene;
    if (!s) return;
    if (this.phase === 'tawa' && this.flipA >= 1) {
      this.brownDown = Math.min(1, this.brownDown + dt * (0.05 + this.sizzle * 0.16));
    }
    if (this.phase === 'served' || this.phase === 'done') this.servedT += dt;
    this.driveWafts(s, dt);
    s.frame(dt, (g) => this.paint(g));
    this.setHint?.(this.caption());
  }

  onDir(_dir: Dir) {
    // The griddle has no steering, only timing and Kamla's eyebrows.
  }

  onAction() {
    // Clamped: after the last course this.course is 3, and the served and
    // done presses must still land or the panel can never close.
    const c = COURSES[Math.min(this.course, COURSES.length - 1)];
    if (!c) return;
    const s = this.scene;
    if (this.phase === 'burnt') {
      // Fresh atta, same parantha, no ledger kept. Nothing here can be lost
      // except a parantha, and a parantha was never the point.
      this.audio.blip();
      this.freshDough(`Fresh atta in your palm and the same ${c.name} to make. Space stops the pin when the disc is even.`);
      if (s) {
        s.burst(CHAKLA.x, CHAKLA.y - 8, { n: calmMotion() ? 4 : 11, color: 'rgba(246,238,216,0.85)', speed: 60, grav: 70, size: 2.6, life: 0.5 });
        if (!calmMotion()) s.thump(2, 0.02);
      }
      this.render();
      return;
    }
    if (this.phase === 'roll') {
      const mid = Math.abs(this.meter - 0.5);
      if (mid <= c.zone / 2) {
        this.rolled++;
        this.audio.chime();
        if (s) {
          if (!calmMotion()) s.thump(2, 0.02);
          s.burst(CHAKLA.x, CHAKLA.y - 10, { n: calmMotion() ? 4 : 10, color: 'rgba(246,238,216,0.8)', speed: 55, grav: 60, size: 2.6, life: 0.5 });
        }
        if (this.rolled === 1) {
          this.hint = `Even. Now cup the stuffing: ${c.stuffing}. Space to seal it in, gently, like closing a letter.`;
          this.phase = 'stuff';
        } else if (this.rolled >= 3) {
          // Repair: the second even roll now truly carries the parcel to the
          // griddle; this transition used to be unreachable and the panel
          // could never finish. Same copy and setup as the sealed path.
          this.phase = 'tawa';
          this.sizzle = 0;
          this.flipsDone = 0;
          this.hint = 'Onto the tawa. The ghee hisses low, then SINGS. Space exactly when the song starts: the bright band.';
          this.brownUp = 0;
          this.brownDown = 0;
          if (s) {
            if (!calmMotion()) s.thump(3, 0.03);
            s.burst(TAWA.x, TAWA.y - 8, { n: calmMotion() ? 5 : 14, color: '#ffd98a', kind: 'spark', speed: 120, grav: 40, size: 2.2, life: 0.5 });
            for (let i = 0; i < 3; i++) s.waft(TAWA.x - 24 + i * 24, TAWA.y - 20);
          }
        }
      } else {
        this.audio.blip();
        this.hint = OOPS_ROLL[Math.min(2, this.course)] as string;
        if (s) {
          this.wobA = 0;
          s.tween(0, 1, 0.5, easeOutCubic, (v) => (this.wobA = v));
          s.burst(CHAKLA.x + (this.meter - 0.5) * 120, CHAKLA.y, { n: 4, color: 'rgba(246,238,216,0.7)', speed: 40, grav: 80, size: 2, life: 0.4 });
        }
      }
      this.render();
      return;
    }
    if (this.phase === 'stuff') {
      // Sealing is a single act of faith; the second roll goes back to the meter.
      if (this.rolled === 1) {
        this.rolled = 2;
        this.audio.blip();
        this.hint = 'Sealed, no tears. Now roll it out again, thin but unbroken. Same meter, smaller mercy.';
        this.phase = 'roll';
        this.meter = 0;
        this.dir = 1;
        if (s) {
          s.burst(CHAKLA.x, CHAKLA.y - 8, { n: calmMotion() ? 3 : 8, color: 'rgba(246,238,216,0.8)', speed: 45, grav: 70, size: 2.2, life: 0.45 });
        }
      } else {
        this.audio.chime();
        this.phase = 'tawa';
        this.sizzle = 0;
        this.flipsDone = 0;
        this.hint = 'Onto the tawa. The ghee hisses low, then SINGS. Space exactly when the song starts: the bright band.';
        this.brownUp = 0;
        this.brownDown = 0;
      }
      this.render();
      return;
    }
    if (this.phase === 'roll' as PPhase) return;
    if (this.phase === 'tawa') {
      const onTheWord = this.sizzle >= 0.62 && this.sizzle <= 0.88;
      const early = this.sizzle < 0.62;
      this.sizzle = 0;
      if (onTheWord) {
        this.audio.slosh();
        this.startFlip();
        this.landFlip(c, false);
      } else {
        // Off the band on either side. Early leaves it pale and unturned;
        // past the band it turns anyway with a dark ring, because a hand
        // that acted is always answered. Only ignoring the tawa can burn.
        this.audio.bump();
        this.hint = early ? OOPS_EARLY : OOPS_LATE;
        if (s) {
          if (!calmMotion()) s.thump(2, 0.02);
          s.burst(TAWA.x, TAWA.y - 6, { n: 4, color: 'rgba(255,226,160,0.7)', speed: 60, grav: 100, size: 2, life: 0.4 });
          if (early) {
            this.landSq = 0.85;
            s.tween(0.85, 1, 0.3, easeOutBack, (v) => (this.landSq = v));
          }
        }
        if (!early) {
          this.brownDown = Math.min(1, this.brownDown + 0.22);
          this.startFlip();
          this.landFlip(c, true);
        }
      }
      this.render();
      return;
    }
    if (this.phase === 'served') {
      this.phase = 'done';
      this.audio.weaveDone();
      this.hint = 'Silence, the good kind, three plates deep. In this gali that is a standing ovation. Press Space.';
      this.scene?.flash('#fff3d8', 0.35);
      this.render();
      return;
    }
    this.root.hidden = true;
    const done = this.onDone;
    this.onDone = null;
    done?.();
  }

  /**
   * Back to the pin with one parantha's worth of state cleared. Used by
   * open() and by the retry after a burn, so a fresh start is a fresh start
   * either way: the courses already plated stay plated.
   */
  private freshDough(hint: string) {
    this.phase = 'roll';
    this.meter = 0;
    this.dir = 1;
    this.rolled = 0;
    this.flipsDone = 0;
    this.sizzle = 0;
    this.overheld = 0;
    this.burnT = 0;
    this.flipA = 1;
    this.landSq = 1;
    this.wobA = 1;
    this.brownUp = 0;
    this.brownDown = 0;
    this.hint = hint;
  }

  /**
   * The burn. Smoke, a laugh, and a dog with excellent timing. The story
   * cannot be lost here; only this one parantha can, and Sheru disagrees
   * that it was lost at all.
   */
  private burnIt() {
    this.phase = 'burnt';
    this.burnT = 0;
    this.burnt++;
    this.burntLine = (this.burntLine + 1) % BURNT_LINES.length;
    this.brownUp = 1;
    this.brownDown = 1;
    this.audio.bump();
    this.hint = `${BURNT_LINES[this.burntLine]} Sheru is already sitting, ears forward, being extremely good. Press Space for fresh atta.`;
    const s = this.scene;
    if (!s) return;
    if (!calmMotion()) s.thump(5, 0.05);
    for (let i = 0; i < 6; i++) s.waft(TAWA.x - 46 + i * 18, TAWA.y - 18, 'rgba(64,58,54,0.6)', 11);
    s.burst(TAWA.x, TAWA.y - 6, { n: calmMotion() ? 5 : 13, color: 'rgba(58,44,34,0.8)', speed: 90, grav: -30, size: 3.4, life: 0.9 });
  }

  /**
   * One turn of the parantha counted: the next flip, the next course, or the
   * plate. Shared by the on-the-word flip and the late one, so a late hand
   * still moves the dish forward and only the browning remembers.
   */
  private landFlip(c: Course, late: boolean) {
    const s = this.scene;
    this.flipsDone++;
    if (this.flipsDone < c.flips) {
      if (!late) this.hint = `Flipped on the word. ${c.flips - this.flipsDone} more; the tawa will tell you when.`;
      return;
    }
    this.audio.weaveNote(this.course + 2);
    this.course++;
    const next = COURSES[this.course];
    if (next) {
      this.hint = `${late ? 'It goes out anyway; nobody in this gali has ever sent a parantha back.' : 'Golden, blistered, correct.'} ${next.intro} Back to the pin: Space stops it even.`;
      this.phase = 'roll';
      this.rolled = 0;
      this.overheld = 0;
      this.meter = 0;
      this.dir = 1;
      this.brownUp = 0;
      this.brownDown = 0;
      if (s) {
        s.flash('#ffe9c0', 0.25);
        this.slideA = 0;
        s.tween(0, 1, 0.75, easeInOutSine, (v) => (this.slideA = v), () => {
          this.stacked++;
          if (!calmMotion()) s.thump(2, 0.02);
          s.burst(STACK.x, STACK.y - 14, { n: 6, color: '#ffd98a', kind: 'spark', speed: 70, grav: 60, size: 2, life: 0.45 });
        });
      }
      return;
    }
    this.phase = 'served';
    this.hint =
      'The rabri parantha goes to the porter in the corner. He takes one bite and stops talking entirely. Kamla nods once. Press Space.';
    this.servedT = 0;
    if (s) {
      s.flash('#ffe9c0', 0.3);
      s.burst(320, 200, { n: calmMotion() ? 8 : 20, color: '#ffd98a', kind: 'spark', speed: 130, grav: 90, size: 2.4, life: 0.8 });
    }
  }

  /** The flip: a full arc with rotation, ghee sparkle burst on landing. */
  private startFlip() {
    const s = this.scene;
    if (!s) return;
    this.flipA = 0;
    this.flipSwapped = false;
    s.tween(0, 1, 0.58, linear, (v) => (this.flipA = v), () => {
      if (!calmMotion()) s.thump(4, 0.05);
      s.burst(TAWA.x, TAWA.y - 4, { n: calmMotion() ? 6 : 16, color: '#ffd98a', kind: 'spark', speed: 150, grav: 160, size: 2.4, life: 0.55 });
      s.burst(TAWA.x, TAWA.y, { n: 5, color: 'rgba(255,236,190,0.6)', speed: 70, grav: 30, size: 3, life: 0.5 });
      this.landSq = 0.72;
      s.tween(0.72, 1, 0.35, easeOutBack, (v) => (this.landSq = v));
      for (let i = 0; i < 3; i++) s.waft(TAWA.x - 26 + i * 26, TAWA.y - 22);
    });
  }

  /** Ambient steam, flour motes, sizzle sparkle. Timed, not per-frame. */
  private driveWafts(s: Scene, dt: number) {
    this.steamT -= dt;
    this.flourT -= dt;
    this.singT -= dt;
    const heavy = !calmMotion();
    if (this.phase === 'tawa' && this.brownDown > 0.15 && this.steamT <= 0) {
      this.steamT = heavy ? 0.3 : 0.6;
      s.waft(TAWA.x - 40 + Math.random() * 80, TAWA.y - 22);
    }
    if (this.phase === 'burnt' && this.steamT <= 0) {
      // Black smoke, plentiful, entirely unembarrassed. Two plumes a beat,
      // because one is not a smell the whole gali can read from its doorways.
      this.steamT = heavy ? 0.08 : 0.2;
      s.waft(TAWA.x - 40 + Math.random() * 80, TAWA.y - 16, 'rgba(58,50,46,0.6)', 13);
      s.waft(TAWA.x - 24 + Math.random() * 48, TAWA.y - 34, 'rgba(88,80,74,0.45)', 9);
    }
    if ((this.phase === 'served' || this.phase === 'done') && this.steamT <= 0) {
      this.steamT = heavy ? 0.25 : 0.5;
      s.waft(300 + Math.random() * 60, 168, 'rgba(255,252,244,0.4)', 8);
    }
    if (this.phase === 'roll' && this.flourT <= 0 && heavy) {
      this.flourT = 0.55;
      s.waft(62 + this.meter * 156 + (Math.random() - 0.5) * 40, CHAKLA.y - 18, 'rgba(240,232,210,0.3)', 5);
    }
    if (this.phase === 'tawa' && this.sizzle >= 0.62 && this.sizzle <= 0.88 && this.singT <= 0 && heavy) {
      this.singT = 0.1;
      const a = Math.random() * Math.PI * 2;
      const bx = TAWA.x + Math.cos(a) * 66;
      const by = TAWA.y + Math.sin(a) * 28;
      s.burst(bx, by, { n: 1, color: '#ffe9a8', kind: 'spark', speed: 60, grav: -50, size: 1.8, life: 0.4 });
    }
  }

  private caption(): string {
    const c = COURSES[Math.min(this.course, COURSES.length - 1)];
    let count: string;
    if (this.phase === 'roll') {
      count = `${c?.name} &middot; ${this.rolled === 0 ? 'first roll' : 'second roll, thinner'}`;
    } else if (this.phase === 'stuff') {
      count = `${c?.name} &middot; ${c?.stuffing}`;
    } else if (this.phase === 'tawa') {
      count = `${c?.name} &middot; flip ${this.flipsDone + 1} of ${c?.flips} &middot; listen for the singing band`;
    } else if (this.phase === 'burnt') {
      count = `${c?.name} &middot; one for the dog &middot; Space for fresh atta`;
    } else {
      count = 'the plate goes out';
    }
    if (this.burnt > 0 && this.phase !== 'burnt') {
      count += ` &middot; Sheru fed ${this.burnt}`;
    }
    return `${this.hint}<div class="c-count">${count}</div>`;
  }

  private render() {
    // The canvas repaints every tick; button presses only refresh the words.
    this.setHint?.(this.caption());
  }

  // ------------------------------------------------- painting the griddle

  private paint(g: CanvasRenderingContext2D) {
    const s = this.scene;
    if (!s) return;
    const t = s.time;
    g.drawImage(stallBg(), 0, 0);

    // The bulb on its cord, swaying in the gali's damp breath.
    const ang = Math.sin(t * 0.9) * 0.06 + Math.sin(t * 2.3) * 0.015;
    const bx = 368 + Math.sin(ang) * 52;
    const by = 6 + Math.cos(ang) * 52;
    g.strokeStyle = 'rgba(30,22,16,0.8)';
    g.lineWidth = 1.6;
    g.beginPath();
    g.moveTo(368, 0);
    g.quadraticCurveTo(368 + Math.sin(ang) * 22, 30, bx, by);
    g.stroke();
    const flick = 0.42 + Math.sin(t * 13) * 0.03 + Math.sin(t * 29) * 0.02;
    stampGlow(g, bx, by + 4, 64, 'rgba(255,214,140,1)', flick);
    oval(g, bx, by + 5, 6.5, 8.5, '#ffd98a');
    oval(g, bx, by + 3, 3, 4, '#fff3d0');
    rr(g, bx - 3.4, by - 6, 6.8, 5, 2, '#6b5a44');
    stampGlow(g, TAWA.x, TAWA.y, 150, 'rgba(255,206,130,1)', 0.16 + flick * 0.1);

    // Dust motes drifting through the bulb light: the always-wind.
    g.fillStyle = 'rgba(255,240,210,0.20)';
    for (let i = 0; i < 8; i++) {
      const mx = 300 + ((t * (6 + i) + i * 83) % 220) - 40;
      const my = 70 + ((i * 47 + t * 9) % 120);
      g.fillRect(mx, my + Math.sin(t + i) * 6, 1.6, 1.6);
    }

    if (this.phase === 'roll' || this.phase === 'stuff') this.paintBoard(g, t);
    if (this.phase === 'tawa' || this.phase === 'roll' || this.phase === 'stuff') this.paintTawa(g, t);
    if (this.phase === 'burnt') this.paintBurnt(g, t);
    if (this.slideA < 1) this.paintSlide(g);
    this.paintStack(g);
    if (this.phase === 'served' || this.phase === 'done') this.paintServed(g, t);
    g.drawImage(vignette(), 0, 0);
  }

  private paintBoard(g: CanvasRenderingContext2D, t: number) {
    const c = COURSES[Math.min(this.course, COURSES.length - 1)] ?? COURSES[0];
    if (!c) return;
    const rolling = this.phase === 'roll';
    const skew = rolling ? (this.meter - 0.5) * 2 : 0;
    const second = this.rolled >= 2;
    const dx = CHAKLA.x - skew * 12;
    const dy = CHAKLA.y - 2;
    const rx = (second ? 56 : 46) * (1 + Math.abs(skew) * 0.1);
    const ry = (second ? 22 : 21) * (1 - Math.abs(skew) * 0.06);
    const wsq = 1 + Math.sin((1 - this.wobA) * 9) * 0.1 * (1 - this.wobA);

    // The dough: lopsided under a wandering pin, round when you catch it even.
    g.save();
    g.translate(dx, dy);
    g.scale(1, wsq);
    oval(g, 0, 2, rx, ry, '#cdb488');
    oval(g, 0, 0, rx, ry, DOUGH);
    oval(g, -rx * 0.24, -ry * 0.34, rx * 0.4, ry * 0.34, '#f6ecc8');
    if (Math.abs(skew) > 0.15) {
      g.globalAlpha = Math.min(0.5, Math.abs(skew));
      oval(g, skew * rx * 0.5, 0, rx * 0.34, ry * 0.7, '#d8c290');
      g.globalAlpha = 1;
    }
    if (second) {
      g.globalAlpha = 0.28;
      oval(g, 0, 0, rx * 0.4, ry * 0.4, c.fill);
      g.globalAlpha = 0.3;
      g.strokeStyle = '#a8905e';
      g.lineWidth = 1.2;
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2 + 0.3;
        g.beginPath();
        g.moveTo(Math.cos(a) * rx * 0.18, Math.sin(a) * ry * 0.18);
        g.lineTo(Math.cos(a) * rx * 0.52, Math.sin(a) * ry * 0.52);
        g.stroke();
      }
      g.globalAlpha = 1;
    }
    g.restore();

    if (this.phase === 'stuff') {
      // The stuffing, cupped and waiting; fold lines breathe an invitation.
      const mound = 1 + wobble(t, 2.1) * 0.03;
      oval(g, dx, dy - 4, 24 * mound, 13 * mound, c.fill);
      oval(g, dx - 6, dy - 9, 9, 4.5, shade(c.fill, 0.25));
      const frng = new Rng(77 + this.course);
      for (let i = 0; i < 9; i++) {
        const a = frng.next() * Math.PI * 2;
        const rad = Math.sqrt(frng.next()) * 0.8;
        dot(g, dx + Math.cos(a) * rad * 20, dy - 5 + Math.sin(a) * rad * 9, 1.4, c.flecks[i % c.flecks.length] ?? '#3d5226');
      }
      g.strokeStyle = `rgba(43,33,24,${0.25 + Math.sin(t * 3) * 0.12})`;
      g.lineWidth = 1.4;
      g.setLineDash([4, 5]);
      g.beginPath();
      g.ellipse(dx, dy, 40, 16, 0, 0, Math.PI * 2);
      g.stroke();
      g.setLineDash([]);
      oval(g, 280, 251, 18, 6.4, c.fill);
      oval(g, 276, 249, 6, 2.4, shade(c.fill, 0.2));
      dot(g, 273, 251, 1.4, c.flecks[0] ?? '#3d5226');
      dot(g, 287, 252, 1.4, c.flecks[1] ?? '#b5432f');
    }

    if (rolling) {
      // The belan rides the meter; catch it over the dotted ring.
      const px = 62 + this.meter * 156;
      const py = 206 + Math.sin(t * 6) * 1.2;
      oval(g, px, dy - 2, 34, 8, 'rgba(26,16,10,0.20)');
      g.save();
      g.translate(px, py);
      g.rotate(-0.05 + Math.sin(t * 2) * 0.015);
      rr(g, -78, -9, 22, 18, 8, '#8a5f38');
      rr(g, 56, -9, 22, 18, 8, '#8a5f38');
      rr(g, -60, -11, 120, 22, 10, '#b98a58');
      rr(g, -60, -11, 120, 8, 8, '#cfa06a');
      rect(g, -60, 6, 120, 3, 'rgba(60,40,24,0.35)');
      g.restore();

      // The scale on the counter edge: the even zone, and where the pin is.
      const zx = TRACK.x + (0.5 - c.zone / 2) * TRACK.w;
      const zw = c.zone * TRACK.w;
      stampGlow(g, TRACK.x + TRACK.w / 2, TRACK.y, 26 + zw / 2, 'rgba(232,190,100,1)', 0.3 + Math.sin(t * 4) * 0.1);
      rr(g, zx, TRACK.y - 3.5, zw, 7, 3.5, '#c8a55b');
      const kx = TRACK.x + this.meter * TRACK.w;
      const inZone = Math.abs(this.meter - 0.5) <= c.zone / 2;
      if (inZone) stampGlow(g, kx, TRACK.y, 16, 'rgba(255,226,150,1)', 0.7);
      dot(g, kx, TRACK.y, 5.4, '#2b2118');
      dot(g, kx, TRACK.y, 3.8, inZone ? '#ffe9b0' : '#f2e6d0');
    }
  }

  private paintTawa(g: CanvasRenderingContext2D, t: number) {
    // Ghee: a baked highlight sheet, shimmering and slowly wandering.
    const sh = gheeSheet();
    g.globalAlpha = 0.14 + Math.sin(t * 2.1) * 0.05 + this.sizzle * 0.14;
    g.drawImage(sh, TAWA.x - 140 + Math.sin(t * 0.7) * 8, TAWA.y - 65 + Math.cos(t * 0.5) * 3);
    g.globalAlpha = 1;

    if (this.phase !== 'tawa') return;
    const nBub = Math.round(4 + this.sizzle * 14);
    for (let i = 0; i < nBub; i++) {
      const a = i * 2.399 + t * 0.8;
      const rad = 0.82 + Math.sin(t * 5 + i * 1.7) * 0.06;
      const bx = TAWA.x + Math.cos(a) * 68 * rad;
      const by = TAWA.y + Math.sin(a) * 30 * rad;
      dot(g, bx, by, 1.4 + Math.sin(t * 9 + i) * 0.7, 'rgba(255,240,200,0.55)');
    }

    // The parantha itself, blistering; during the flip it takes to the air.
    let px = TAWA.x;
    let py = TAWA.y - 2;
    let sy = this.landSq;
    let rot = 0;
    let shown = this.brownUp;
    if (this.flipA < 1) {
      const ft = this.flipA;
      if (ft > 0.5 && !this.flipSwapped) {
        this.flipSwapped = true;
        const tmp = this.brownUp;
        this.brownUp = this.brownDown;
        this.brownDown = tmp;
      }
      shown = this.brownUp;
      py = TAWA.y - 2 - Math.sin(ft * Math.PI) * 92;
      px = TAWA.x + Math.sin(ft * Math.PI) * 26 - ft * 8;
      sy = Math.max(0.1, Math.abs(Math.cos(ft * Math.PI)));
      rot = Math.sin(ft * Math.PI) * 0.3;
    }
    if (this.flipA < 1) oval(g, TAWA.x, TAWA.y, 58, 26, 'rgba(20,12,8,0.28)');
    g.save();
    g.translate(px, py);
    g.rotate(rot);
    g.scale(1, sy);
    drawParantha(g, 0, 0, 58, 30, shown, this.course * 7);
    g.restore();

    // The sizzle arc: the tawa's voice, climbing toward the singing band.
    const a0 = Math.PI * 1.05;
    const span = Math.PI * 0.9;
    const inWin = this.sizzle >= 0.62 && this.sizzle <= 0.88;
    g.strokeStyle = 'rgba(30,20,13,0.4)';
    g.lineWidth = 5;
    g.beginPath();
    g.ellipse(TAWA.x, TAWA.y, TAWA.rx + 16, TAWA.ry + 14, 0, a0, a0 + span);
    g.stroke();
    g.strokeStyle = 'rgba(200,165,91,0.6)';
    g.beginPath();
    g.ellipse(TAWA.x, TAWA.y, TAWA.rx + 16, TAWA.ry + 14, 0, a0 + span * 0.62, a0 + span * 0.88);
    g.stroke();
    g.strokeStyle = inWin ? '#ffd98a' : '#e8b04a';
    g.lineWidth = 5;
    g.beginPath();
    g.ellipse(TAWA.x, TAWA.y, TAWA.rx + 16, TAWA.ry + 14, 0, a0, a0 + span * this.sizzle);
    g.stroke();
    const wm = a0 + span * 0.75;
    const wmx = TAWA.x + Math.cos(wm) * (TAWA.rx + 16);
    const wmy = TAWA.y + Math.sin(wm) * (TAWA.ry + 14);
    stampGlow(g, wmx, wmy, 30, 'rgba(255,214,130,1)', inWin ? 0.65 + Math.sin(t * 9) * 0.25 : 0.2);
    const tip = a0 + span * this.sizzle;
    const tx = TAWA.x + Math.cos(tip) * (TAWA.rx + 16);
    const ty = TAWA.y + Math.sin(tip) * (TAWA.ry + 14);
    dot(g, tx, ty, 4, inWin ? '#fff3d0' : '#ffd98a');
  }

  /**
   * The burn, staged in three beats. The disc sits on the iron gone black,
   * smoking honestly. Sheru rises into frame at the counter's front edge,
   * having heard the smell from two lanes away. Then the palta lifts the ruin
   * off the tawa, it arcs down, and it never touches the ground.
   */
  private paintBurnt(g: CanvasRenderingContext2D, t: number) {
    const bt = this.burnT;
    // The tawa keeps its heat; the ghee sheet dims under the smoke.
    const sh = gheeSheet();
    g.globalAlpha = 0.09 + Math.sin(t * 2.1) * 0.03;
    g.drawImage(sh, TAWA.x - 140, TAWA.y - 65);
    g.globalAlpha = 1;

    // Sheru first, so the parantha lands in front of his muzzle, not behind.
    const rise = easeOutCubic(Math.min(1, bt / 0.55));
    const dogX = 132;
    const dogGround = 392 - rise * 34;
    const toss = Math.max(0, Math.min(1, (bt - 1) / 0.8));
    const caught = toss >= 1;
    // The muzzle tip, in canvas space: where the parantha stops existing.
    const mouth: [number, number] = [dogX + 66, dogGround - 66];
    drawSheru(g, dogX, dogGround, t, caught, rise);

    // The burnt disc: on the iron, then an arc into a waiting mouth.
    if (!caught) {
      const bx = TAWA.x + (mouth[0] - TAWA.x) * toss;
      const by = TAWA.y - 4 + (mouth[1] - (TAWA.y - 4)) * toss - Math.sin(toss * Math.PI) * 74;
      if (toss === 0) oval(g, TAWA.x, TAWA.y + 4, 58, 25, 'rgba(12,8,6,0.45)');
      g.save();
      g.translate(bx, by);
      g.rotate(toss * 2.4);
      const rx = 56 - toss * 20;
      oval(g, 0, 0, rx, rx * 0.5, '#2a2018');
      oval(g, 0, 0, rx * 0.9, rx * 0.45, '#160f0c');
      // Char scale: cracked, dull, and holding two last embers.
      const rng = new Rng(909);
      for (let i = 0; i < 16; i++) {
        const a = rng.next() * Math.PI * 2;
        const rad = Math.sqrt(rng.next()) * 0.85;
        oval(g, Math.cos(a) * rad * rx, Math.sin(a) * rad * rx * 0.5, 2 + rng.next() * 4, 1.4, '#0a0806');
      }
      const ember = 0.4 + Math.sin(t * 7) * 0.3;
      dot(g, -rx * 0.3, rx * 0.12, 1.9, `rgba(232,124,52,${ember})`);
      dot(g, rx * 0.22, -rx * 0.1, 1.4, `rgba(232,144,62,${ember * 0.7})`);
      g.restore();
    }

    // The smoke column, and the gali reading it from three doorways away.
    g.globalAlpha = Math.min(0.42, bt * 0.6);
    stampGlow(g, TAWA.x - 20, 130, 170, 'rgba(84,76,70,1)', 0.55);
    g.globalAlpha = 1;
  }

  /** A finished parantha arcs from the tawa to the waiting thali. */
  private paintSlide(g: CanvasRenderingContext2D) {
    const a = this.slideA;
    const x = TAWA.x + (STACK.x - TAWA.x) * a;
    const y = TAWA.y - 6 + (STACK.y - 20 - TAWA.y) * a - Math.sin(a * Math.PI) * 66;
    const sc = 1 - a * 0.42;
    g.save();
    g.translate(x, y);
    g.rotate(a * 1.6);
    g.scale(sc, sc);
    drawParantha(g, 0, 0, 58, 30, 1, (this.course + 2) * 7);
    g.restore();
  }

  private paintStack(g: CanvasRenderingContext2D) {
    for (let i = 0; i < this.stacked; i++) {
      drawParantha(g, STACK.x + (i % 2 ? 3 : -2), STACK.y - 4 - i * 8, 34, 12, 1, i * 5);
    }
  }

  /** The plate goes out: stack, melting butter pat, the good silence. */
  private paintServed(g: CanvasRenderingContext2D, t: number) {
    rect(g, 0, 0, 640, 340, 'rgba(28,18,12,0.32)');
    stampGlow(g, 320, 200, 220, 'rgba(255,206,130,1)', 0.4 + Math.sin(t * 1.4) * 0.05);
    softShadow(g, 320, 262, 130, 32, 0.4);
    oval(g, 320, 246, 126, 42, '#a9803c');
    oval(g, 320, 242, 126, 42, '#c8963f');
    oval(g, 320, 241, 110, 34, '#b58a3f');
    g.strokeStyle = 'rgba(255,236,190,0.4)';
    g.lineWidth = 2;
    g.beginPath();
    g.ellipse(320, 240, 118, 38, 0, Math.PI * 1.1, Math.PI * 1.9);
    g.stroke();
    const lift = Math.sin(t * 1.1) * 1.5;
    drawParantha(g, 320, 232 + lift * 0.2, 84, 30, 1, 3);
    drawParantha(g, 316, 216 + lift * 0.4, 80, 28, 0.92, 9);
    drawParantha(g, 323, 200 + lift * 0.6, 76, 27, 0.96, 15);

    // The butter pat: it arrives square and leaves as weather.
    const melt = Math.min(1, this.servedT / 7);
    const bx = 316;
    const by = 192 + lift * 0.6;
    g.globalAlpha = 0.5 + melt * 0.3;
    oval(g, bx, by + 5, 12 + melt * 30, 5 + melt * 8, '#f2d98a');
    g.globalAlpha = 1;
    const bw = 24 * (1 + melt * 0.45);
    const bh = 13 * (1 - melt * 0.72);
    rr(g, bx - bw / 2, by - bh, bw, bh, 3, '#f7e8b0');
    rr(g, bx - bw / 2, by - bh, bw, bh * 0.4, 3, '#fdf3cd');
    dot(g, bx - bw * 0.22, by - bh * 0.7, 1.6, '#fffbe8');

    // Katoris of achar and onion; no parantha travels alone.
    oval(g, 164, 270, 25, 10, '#a9803c');
    oval(g, 164, 267, 21, 8, '#6e4526');
    for (let i = 0; i < 5; i++) dot(g, 156 + i * 4, 266 + (i % 2), 2.4, i % 2 ? '#b5432f' : '#8a3428');
    oval(g, 478, 270, 25, 10, '#a9803c');
    oval(g, 478, 267, 21, 8, '#8a5330');
    g.strokeStyle = '#e8d9c8';
    g.lineWidth = 1.8;
    for (let i = 0; i < 3; i++) {
      g.beginPath();
      g.ellipse(472 + i * 6, 266, 6 - i, 3, 0.3 * i, 0, Math.PI * 2);
      g.stroke();
    }
    if (this.phase === 'done') {
      stampGlow(g, 320, 170, 300, 'rgba(255,226,160,1)', 0.16 + Math.sin(t * 0.8) * 0.04);
    }
  }
}

// ------------------------------------------------------------ the patang

type Wind = 'steady' | 'gust' | 'birds';
type KPhase = 'launch' | 'duel' | 'cut' | 'between' | 'storm' | 'done';

/**
 * Losing your own dor. Three sawings and the rival takes it; the roofs shout
 * the same two words they shout for anybody, and Ustad Yusuf, who has been
 * cut more times than anyone alive, reaches for the charkhi without comment.
 */
const CUT_LINES = [
  'WOH KATA. This time it is yours. The dor goes slack in your fist like a sentence someone finished for you.',
  'The saw catches, sings once, and stops. Yours. Somewhere across the kucha a boy is already running for the rooftops.',
  'Gone. Your patang lifts free, turns over twice, and goes to be somebody else\'s kingdom two lanes east.',
];

const YUSUF_AFTER_CUT = [
  'Yusuf spits a seed over the parapet and unwinds another. "Kaghaz sasta hai, hawa muft. Paper is cheap, the wind is free."',
  'Yusuf is already tying the next one on. "Every flyer on this roof has fed that sky. You are on the register now. Again."',
  'Yusuf hands you a fresh patang, moon patch and all. "The wind took a tax. It always does. Pay it and keep flying."',
];

type Rival = { name: string; need: number; line: string };

const PRACTICE_RIVALS: Rival[] = [
  {
    name: 'the black patang from the water-tank roof',
    need: 5,
    line: 'The black kite drifts down the wind, cut loose. From the far roof, an approving insult.',
  },
];

const TOURNAMENT_RIVALS: Rival[] = [
  {
    name: 'the paper-seller\'s yellow patang',
    need: 4,
    line: 'Woh kata! The yellow one spirals into the kinari lane. The paper-seller applauds his own defeat; it was his paper.',
  },
  {
    name: 'the twins\' green patang',
    need: 5,
    line: 'Woh kata! The green kite folds and the twins shout at each other with delight. Two roofs over, money changes hands.',
  },
  {
    name: 'the ustad\'s old shahgird, flying red',
    need: 6,
    line: 'The red patang hangs, saws back hard, and then lets go into the rain. From his roof the shahgird salutes his teacher through you.',
  },
];

const PRACTICE_LOOKS = [{ paper: '#332b36', patch: '#8a7f98' }];
const TOURNAMENT_LOOKS = [
  { paper: '#dcae3c', patch: '#f2e6d0' },
  { paper: '#5d8a4a', patch: '#e8d9a8' },
  { paper: '#a83828', patch: '#f0c8a0' },
];

const ANCHOR = { x: 296, y: 322 } as const;
const RIVAL_ANCHOR = { x: 650, y: 236 } as const;

let skyCache: HTMLCanvasElement | null = null;
function skyBg(): HTMLCanvasElement {
  if (skyCache) return skyCache;
  const { cv, g } = surface(640, 340);
  const grad = g.createLinearGradient(0, 0, 0, 320);
  grad.addColorStop(0, '#7b6f9e');
  grad.addColorStop(0.32, '#b98a92');
  grad.addColorStop(0.6, '#e8a878');
  grad.addColorStop(0.84, '#f6c98e');
  grad.addColorStop(1, '#f9d9a0');
  g.fillStyle = grad;
  g.fillRect(0, 0, 640, 340);
  const sun = g.createRadialGradient(150, 176, 4, 150, 176, 120);
  sun.addColorStop(0, 'rgba(255,236,190,0.95)');
  sun.addColorStop(0.3, 'rgba(255,220,160,0.5)');
  sun.addColorStop(1, 'rgba(255,220,160,0)');
  g.fillStyle = sun;
  g.fillRect(20, 50, 260, 250);
  dot(g, 150, 176, 17, '#ffeccc');
  const rng = new Rng(88);
  for (let i = 0; i < 5; i++) {
    const y = 34 + i * 22 + rng.next() * 10;
    oval(g, 80 + rng.next() * 480, y, 70 + rng.next() * 90, 4 + rng.next() * 3, `rgba(199,139,160,${0.2 + rng.next() * 0.15})`);
    oval(g, 60 + rng.next() * 500, y + 8, 40 + rng.next() * 70, 2.6, 'rgba(242,201,168,0.35)');
  }
  skyCache = cv;
  return cv;
}

let hazeFarCache: HTMLCanvasElement | null = null;
function hazeFar(): HTMLCanvasElement {
  if (hazeFarCache) return hazeFarCache;
  const { cv, g } = surface(760, 200);
  const C = '#b28a9b';
  const base = 118;
  g.fillStyle = C;
  // The great dome, its drum, and the finial: the skyline's deep breath.
  g.beginPath();
  g.arc(230, base - 24, 62, Math.PI, 0);
  g.fill();
  rect(g, 168, base - 26, 124, 30, C);
  rect(g, 222, base - 96, 4, 14, C);
  dot(g, 224, base - 98, 4, C);
  oval(g, 224, base - 86, 8, 4, C);
  // Minarets, and the small chhatris that keep the dome company.
  for (const mx of [128, 330]) {
    rect(g, mx - 6, base - 78, 12, 82, C);
    g.beginPath();
    g.arc(mx, base - 78, 8, Math.PI, 0);
    g.fill();
    rect(g, mx - 1.6, base - 92, 3.2, 8, C);
  }
  for (const [cx2, cr] of [[420, 22], [498, 16], [566, 26], [660, 18], [60, 18]] as const) {
    g.beginPath();
    g.arc(cx2, base - 6, cr, Math.PI, 0);
    g.fill();
    rect(g, cx2 - cr, base - 8, cr * 2, 12, C);
  }
  rect(g, 0, base, 760, 82, C);
  hazeFarCache = cv;
  return cv;
}

let hazeMidCache: HTMLCanvasElement | null = null;
function hazeMid(): HTMLCanvasElement {
  if (hazeMidCache) return hazeMidCache;
  const { cv, g } = surface(760, 170);
  const C = '#7e5b6b';
  const rng = new Rng(23);
  let x = 0;
  const base = 66;
  while (x < 760) {
    const w = 50 + rng.next() * 90;
    const h = 14 + rng.next() * 34;
    rect(g, x, base - h, w, h + 8, C);
    if (rng.chance(0.5)) for (let i = 0; i < w / 12; i++) rect(g, x + 3 + i * 12, base - h - 5, 7, 5, C);
    if (rng.chance(0.35)) rect(g, x + w * 0.3, base - h - 16, 3, 16, C);
    x += w + 8 + rng.next() * 20;
  }
  // The water tank on stilts: every Delhi roof's punctuation mark.
  rect(g, 540, base - 64, 46, 30, C);
  for (const lx of [544, 578]) rect(g, lx, base - 34, 5, 30, C);
  rect(g, 536, base - 68, 54, 6, C);
  // A leaning bamboo and one stuck, surrendered kite.
  g.strokeStyle = C;
  g.lineWidth = 3;
  g.beginPath();
  g.moveTo(352, base + 4);
  g.lineTo(372, base - 58);
  g.stroke();
  g.beginPath();
  g.moveTo(372, base - 58);
  g.lineTo(366, base - 70);
  g.lineTo(378, base - 66);
  g.closePath();
  g.fill();
  rect(g, 0, base + 4, 760, 100, C);
  hazeMidCache = cv;
  return cv;
}

let parapetCache: HTMLCanvasElement | null = null;
function parapet(): HTMLCanvasElement {
  if (parapetCache) return parapetCache;
  const { cv, g } = surface(640, 140);
  const rng = new Rng(5);
  const top = 96;
  // The pole that carries the pennant, planted in a corner of the roof.
  g.strokeStyle = '#4a3226';
  g.lineWidth = 5;
  g.beginPath();
  g.moveTo(56, top + 10);
  g.lineTo(56, 26);
  g.stroke();
  vgrad(g, 0, top, 640, 44, '#8a4f3a', '#5f3226');
  rect(g, 0, top, 640, 6, '#a06a48');
  rect(g, 0, top, 640, 2.4, '#d99a5a');
  g.strokeStyle = 'rgba(50,28,20,0.45)';
  g.lineWidth = 1.4;
  for (let r = 0; r < 3; r++) {
    const y = top + 12 + r * 11;
    g.beginPath();
    g.moveTo(0, y);
    g.lineTo(640, y);
    g.stroke();
    for (let i = 0; i < 16; i++) {
      const bx = ((i * 41 + r * 20) % 660) - 10;
      g.beginPath();
      g.moveTo(bx, y - 11);
      g.lineTo(bx, y);
      g.stroke();
    }
  }
  for (let i = 0; i < 12; i++) {
    oval(g, rng.next() * 640, top + 8 + rng.next() * 30, 6 + rng.next() * 10, 3, 'rgba(46,26,18,0.18)');
  }
  // A kulhad of chai and a tulsi pot: the roof is lived on, not visited.
  oval(g, 384, top + 3, 9, 3.4, '#6e4526');
  rr(g, 376, top - 12, 16, 15, 3, '#b5713f');
  oval(g, 384, top - 12, 8, 3, '#8a5330');
  rr(g, 598, top - 16, 26, 18, 4, '#a85a38');
  oval(g, 611, top - 16, 13, 4, '#8a4a2e');
  g.strokeStyle = '#4d7440';
  g.lineWidth = 2;
  for (const a of [-0.7, -0.2, 0.35, 0.8]) {
    g.beginPath();
    g.moveTo(611, top - 18);
    g.quadraticCurveTo(611 + a * 10, top - 30, 611 + a * 16, top - 26);
    g.stroke();
  }
  parapetCache = cv;
  return cv;
}

let stormCache: HTMLCanvasElement | null = null;
function stormBank(): HTMLCanvasElement {
  if (stormCache) return stormCache;
  const { cv, g } = surface(380, 170);
  const rng = new Rng(64);
  for (let i = 0; i < 16; i++) {
    const x = rng.next() * 300;
    const y = 30 + rng.next() * 90;
    oval(g, x, y, 46 + rng.next() * 60, 20 + rng.next() * 18, i % 2 ? 'rgba(74,68,86,0.8)' : 'rgba(90,82,102,0.7)');
  }
  for (let i = 0; i < 8; i++) {
    oval(g, rng.next() * 280, 24 + rng.next() * 40, 40 + rng.next() * 40, 12, 'rgba(120,108,128,0.5)');
  }
  stormCache = cv;
  return cv;
}

/**
 * A paper patang: diamond on a bamboo spine, bowed cross, tassel tail.
 * Rotation follows flight; the tail flutters against the wind's grain.
 */
function drawPatang(
  g: CanvasRenderingContext2D,
  x: number,
  y: number,
  rot: number,
  s: number,
  paper: string,
  patch: string,
  time: number,
  tailDx: number,
) {
  // The tail first, so the kite flies over it: little paper bows on a thread.
  const tipX = x + Math.sin(rot) * s * 1.16;
  const tipY = y + Math.cos(rot) * s * 1.16;
  g.strokeStyle = 'rgba(240,230,214,0.6)';
  g.lineWidth = 1.2;
  g.beginPath();
  g.moveTo(tipX, tipY);
  let px = tipX;
  let py = tipY;
  for (let i = 1; i <= 6; i++) {
    px = tipX + tailDx * i * 0.16 * s * 0.12 + Math.sin(time * 4 + i * 1.1) * (1.5 + i * 1.5);
    py = tipY + i * s * 0.34;
    g.lineTo(px, py);
    if (i < 6) {
      g.save();
      g.translate(px, py);
      g.rotate(Math.sin(time * 5 + i) * 0.7);
      g.fillStyle = i % 2 ? paper : patch;
      g.fillRect(-3.2, -1.4, 6.4, 2.8);
      g.restore();
    }
  }
  g.stroke();
  g.save();
  g.translate(x, y);
  g.rotate(-rot);
  const w = s * 0.82;
  const hTop = s * 1.02;
  const hBot = s * 1.16;
  // Left half in shade, right half catching the pigeon-hour sun.
  g.fillStyle = shade(paper, -0.14);
  g.beginPath();
  g.moveTo(0, -hTop);
  g.lineTo(-w, 0);
  g.lineTo(0, hBot);
  g.closePath();
  g.fill();
  g.fillStyle = shade(paper, 0.08);
  g.beginPath();
  g.moveTo(0, -hTop);
  g.lineTo(w, 0);
  g.lineTo(0, hBot);
  g.closePath();
  g.fill();
  // The pasted moon patch, and the bones: spine and bowed cross.
  g.fillStyle = patch;
  g.beginPath();
  g.arc(0, -s * 0.1, s * 0.26, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = shade(paper, -0.05);
  g.beginPath();
  g.arc(s * 0.09, -s * 0.13, s * 0.2, 0, Math.PI * 2);
  g.fill();
  g.strokeStyle = 'rgba(43,33,24,0.65)';
  g.lineWidth = 1.3;
  g.beginPath();
  g.moveTo(0, -hTop);
  g.lineTo(0, hBot);
  g.stroke();
  g.beginPath();
  g.moveTo(-w, 0);
  g.quadraticCurveTo(0, -s * 0.34, w, 0);
  g.stroke();
  // Tassels at the wingtips.
  g.fillStyle = patch;
  for (const sx of [-1, 1]) {
    g.beginPath();
    g.moveTo(sx * w, 0);
    g.lineTo(sx * (w + 4), 4 + Math.sin(time * 6 + sx) * 2);
    g.lineTo(sx * (w - 1), 5);
    g.closePath();
    g.fill();
  }
  g.restore();
}

function drawPigeon(g: CanvasRenderingContext2D, x: number, y: number, sc: number, flap: number) {
  oval(g, x, y, 5.6 * sc, 2.6 * sc, '#5a5766');
  dot(g, x - 5 * sc, y - 1.4 * sc, 1.7 * sc, '#4c4959');
  g.strokeStyle = '#8b8798';
  g.lineWidth = 1.6 * sc;
  for (const sgn of [-1, 1]) {
    g.beginPath();
    g.moveTo(x + 1 * sc, y);
    g.quadraticCurveTo(x + 3 * sc, y - (4 + flap * 5) * sc * sgn * 0.5 - 3 * sc, x + 7 * sc, y - flap * 7 * sc);
    g.stroke();
  }
}

/** The crossing flock: x offset, y offset, and how near the bird is flying. */
const FLOCK: [number, number, number][] = [
  [0, 0, 2.2], [48, -22, 1.8], [92, 10, 2.6], [136, -34, 1.6],
  [172, -6, 2.3], [212, -42, 1.5], [252, 16, 2.8], [296, -18, 2],
  [338, 2, 1.7], [372, -28, 2.4],
];

const KITE_LEGEND = [
  { keys: ['up'], does: 'kheench, pull, when the line is taut' },
  { keys: ['down'], does: 'dheel, slack, for gusts and birds' },
  { keys: ['space'], does: 'launch, and go again' },
] as const;

export class PatangPanel {
  private phase: KPhase = 'launch';
  private wind: Wind = 'steady';
  private windT = 0;
  private windDur = 2;
  private progress = 0;
  private rivalIdx = 0;
  private cuts = 0;
  private altitude = 0.3;
  private blessed = 0; // pigeon crossings honored
  /** How far the rival's line has sawed through YOURS. Three and it goes. */
  private selfFray = 0;
  private lost = 0; // dors given to the sky, for the caption's honesty
  private hint = '';
  private onDone: (() => void) | null = null;

  // Visual layer only, from here down.
  private scene: Scene | null = null;
  private setHint: ((h: string) => void) | null = null;
  private kx = 322;
  private ky = 264;
  private kvx = 0;
  private kvy = 0;
  private rkx = 700;
  private rky = 40;
  private rvx = 0;
  private rvy = 0;
  private gustK = 0;
  private stormK = 0;
  private rainK = 0;
  private sawGlowT = 0;
  private fraySelfT = 0;
  private bokataT = 0;
  private cutT = 99; // >= 99 means no cut kite in the air
  private cutX = 0;
  private cutY = 0;
  private cutRot = 0;
  private cutPaper = '#332b36';
  private cutPatch = '#8a7f98';
  /** A beaten rival spirals into the lane; your own kite sails out. */
  private cutSink = 26;
  private cutDrift = 110;
  private bokataMine = false;
  private scatterT = 0;
  private scatterX = 0;
  private scatterY = 0;

  constructor(
    private root: HTMLElement,
    private audio: AudioBus,
    private tournament = false,
  ) {}

  get isOpen(): boolean {
    return !this.root.hidden;
  }

  private get rivals(): Rival[] {
    return this.tournament ? TOURNAMENT_RIVALS : PRACTICE_RIVALS;
  }

  private get looks() {
    return this.tournament ? TOURNAMENT_LOOKS : PRACTICE_LOOKS;
  }

  open(onDone: () => void) {
    this.onDone = onDone;
    this.phase = 'launch';
    this.wind = 'steady';
    this.windT = 0;
    this.windDur = 2;
    this.progress = 0;
    this.rivalIdx = 0;
    this.cuts = 0;
    this.altitude = 0.3;
    this.blessed = 0;
    this.selfFray = 0;
    this.lost = 0;
    this.bokataMine = false;
    this.scatterT = 0;
    this.hint = this.tournament
      ? 'The mohalla is on its roofs. Yusuf hands you the charkhi: "Fly for the kucha. Space when the breeze leans in."'
      : 'The patang lies on your palm like a letter to the sky. Space when the breeze leans in, and up she goes.';
    this.root.hidden = false;
    this.kx = 322;
    this.ky = 264;
    this.kvx = 0;
    this.kvy = 0;
    this.rkx = 700;
    this.rky = 40;
    this.rvx = 0;
    this.rvy = 0;
    this.gustK = 0;
    this.stormK = 0;
    this.rainK = 0;
    this.sawGlowT = 0;
    this.fraySelfT = 0;
    this.bokataT = 0;
    this.cutT = 99;
    if (!this.scene) this.scene = new Scene();
    this.scene.restart();
    this.setHint = mountScene(this.root, this.tournament ? 'The Sawan Tournament' : 'Patangbazi', this.scene, KITE_LEGEND).setHint;
    // The overlay root inherits #frame's line-height: 0; restore prose here.
    this.root.style.lineHeight = '1.45';
    this.render();
  }

  tick(dt: number) {
    if (!this.isOpen) return;
    // While the dor is gone there is no weather to answer: the roof simply
    // watches your patang leave, and waits for you to take the next one.
    if (this.phase !== 'done' && this.phase !== 'between' && this.phase !== 'cut') {
      this.windT += dt;
      if (this.phase !== 'launch' && this.windT >= this.windDur) {
        this.windT = 0;
        // Weather schedule: mostly steady, gusts often, pigeons on their own clock.
        const roll = Math.random();
        const gustChance = this.tournament && this.rivalIdx === 2 ? 0.5 : 0.32;
        const birdChance = this.tournament ? 0.22 : 0.16;
        if (roll < birdChance) {
          this.wind = 'birds';
          this.windDur = 2.4;
          this.hint = 'PIGEONS. A flock crosses your line, wings everywhere. Dheel, Down, give the sky back. Yusuf is watching.';
        } else if (roll < birdChance + gustChance) {
          this.wind = 'gust';
          this.windDur = 1.6 + Math.random();
          this.hint = this.tournament && this.rivalIdx === 2
            ? 'The storm front SHOVES. Dheel, Down, ride it or the dor sings itself apart.'
            : 'A gust leans hard on the line. Dheel, Down; let her drink some slack.';
        } else {
          this.wind = 'steady';
          this.windDur = 1.8 + Math.random() * 1.4;
          this.hint = 'The line comes taut and steady. Kheench, Up: saw, saw, the cotton knows its work.';
        }
      }
      this.render();
    }
    const s = this.scene;
    if (!s) return;
    this.fly(dt);
    s.frame(dt, (g) => this.paint(g));
    this.setHint?.(this.caption());
  }

  /** Visual flight: springs toward targets; rotation follows velocity. */
  private fly(dt: number) {
    const t = this.scene?.time ?? 0;
    const gustTarget = (this.wind === 'gust' ? 1 : 0) + (this.tournament && this.rivalIdx === 2 && this.phase === 'duel' ? 0.35 : 0);
    this.gustK += (Math.min(1.2, gustTarget) - this.gustK) * Math.min(1, 2.4 * dt);
    const stormOn = this.tournament && (this.rivalIdx >= 2 || this.phase === 'storm' || this.phase === 'done');
    this.stormK += ((stormOn ? 1 : 0) - this.stormK) * Math.min(1, 0.5 * dt);
    const rainOn = this.tournament && (this.phase === 'storm' || this.phase === 'done');
    this.rainK += ((rainOn ? 1 : 0) - this.rainK) * Math.min(1, 0.8 * dt);
    this.sawGlowT = Math.max(0, this.sawGlowT - dt);
    this.fraySelfT = Math.max(0, this.fraySelfT - dt);
    this.bokataT = Math.max(0, this.bokataT - dt);
    this.scatterT = Math.max(0, this.scatterT - dt);
    if (this.cutT < 99) {
      // The cut kite is nobody's now; the wind does the flying.
      this.cutX += (this.cutDrift + this.gustK * 70) * dt;
      this.cutY += (-58 * Math.exp(-2 * this.cutT) + this.cutSink + 22 * Math.sin(this.cutT * 2.6)) * dt;
      this.cutRot += (2.1 + Math.sin(this.cutT * 3.2) * 1.1) * dt;
      this.cutT += dt;
    }

    let tx = 310 + Math.sin(t * 0.5) * 14 - this.gustK * 52;
    let ty = 252 - this.altitude * 178;
    if (this.phase === 'launch') {
      tx = 322;
      ty = 262 + Math.sin(t * 1.3) * 3 - (Math.sin(t * 2.6) > 0.72 ? 7 : 0);
    }
    if (this.phase === 'done') {
      tx = 316;
      ty = this.tournament ? 258 : 276;
    }
    this.kvx += (tx - this.kx) * 5.4 * dt;
    this.kvy += (ty - this.ky) * 5.4 * dt;
    const damp = Math.max(0, 1 - 3.4 * dt);
    this.kvx *= damp;
    this.kvy *= damp;
    this.kx += this.kvx * dt;
    this.ky += this.kvy * dt;
    // The frame is the sky's edge; the dor never lets her leave it.
    this.kx = Math.min(560, Math.max(130, this.kx));
    this.ky = Math.min(300, Math.max(52, this.ky));

    const rtx = 462 + Math.sin(t * 0.62 + 2) * 56 - this.gustK * 34;
    const rty = 104 + Math.sin(t * 0.43 + 0.7) * 40;
    this.rvx += (rtx - this.rkx) * 4.6 * dt;
    this.rvy += (rty - this.rky) * 4.6 * dt;
    this.rvx *= damp;
    this.rvy *= damp;
    this.rkx += this.rvx * dt;
    this.rky += this.rvy * dt;
  }

  onDir(dir: Dir) {
    if (this.phase !== 'duel') return;
    const rival = this.rivals[this.rivalIdx];
    if (!rival) return;
    const s = this.scene;
    if (dir === 'up') {
      if (this.wind === 'steady') {
        this.progress += 1;
        this.altitude = Math.min(1, this.altitude + 0.08);
        this.audio.blip();
        this.hint = 'The dor bites. You feel the other line through your fingers like a pulse.';
        if (s) {
          this.kvy -= 130;
          this.kvx -= 55;
          this.sawGlowT = 0.55;
          const cross = this.crossing();
          if (cross) {
            s.burst(cross[0], cross[1], { n: calmMotion() ? 3 : 7, color: '#ffd98a', kind: 'spark', speed: 110, grav: 140, size: 2, life: 0.4 });
          }
          if (!calmMotion()) s.thump(2, 0.015);
        }
        if (this.progress >= rival.need) this.cutRival(rival);
      } else if (this.wind === 'gust') {
        this.progress = Math.max(0, this.progress - 1);
        this.altitude = Math.max(0.12, this.altitude - 0.1);
        if (s) {
          this.kvx += 210;
          this.kvy += 60;
          if (!calmMotion()) s.thump(3, 0.03);
        }
        // Pulling into a shove strains your own cotton, not his.
        this.fray('You pulled into the gust; the patang staggers sideways. "Dheel!" barks Yusuf. "The sky is bigger than you!"');
      } else {
        // Pulling through pigeons: the one real sin, and even it is warm.
        this.progress = Math.max(0, this.progress - 2);
        this.audio.bump();
        this.hint = 'Yusuf\'s hand closes on the dor. "Not through birds. Never through birds." The flock passes; the duel waits.';
        if (s) {
          this.kvy += 130;
          if (!calmMotion()) s.thump(4, 0.04);
          s.burst(this.kx, 140, { n: calmMotion() ? 4 : 10, color: '#8b8798', kind: 'streak', speed: 180, grav: -20, size: 6, life: 0.5 });
        }
      }
    } else if (dir === 'down') {
      if (this.wind === 'gust') {
        this.audio.slosh();
        this.altitude = Math.min(1, this.altitude + 0.04);
        this.hint = 'Slack, and she climbs the gust like a stair. The line hums, happy.';
        if (s) {
          this.kvy -= 95;
          this.kvx += 42;
        }
      } else if (this.wind === 'birds') {
        this.audio.chime();
        this.blessed++;
        this.hint = 'You give ground; the flock pours past your slack line, close enough to hear. Yusuf says nothing, loudly, with approval.';
        if (s && !calmMotion()) {
          for (let i = 0; i < 4; i++) s.waft(this.kx - 60 + i * 40, 150, 'rgba(236,230,224,0.4)', 4);
        }
      } else {
        this.progress = Math.max(0, this.progress - 1);
        if (s) this.kvy += 70;
        // Slack in steady air is an invitation, and he accepts it every time.
        this.fray('Slack in steady air, and the rival line saws YOU. His dor takes the offer without thanking you for it.');
      }
    }
    this.render();
  }

  /**
   * One more pass of his line across yours. Twice is a warning you can feel
   * through the cotton; the third takes the kite. Nothing else is at stake:
   * the round resets, the tournament does not, and the story never can.
   */
  private fray(line: string) {
    this.selfFray++;
    if (this.selfFray >= 3) {
      this.getCut(line);
      return;
    }
    this.audio.bump();
    this.fraySelfT = 1;
    const warn = this.selfFray === 1
      ? 'A thin fray opens where the lines kiss. You feel it arrive in your fingers.'
      : 'The dor sings a wrong, thin note. Yusuf hears it from six feet away and says nothing, which is worse.';
    this.hint = `${line} ${warn}`;
    const s = this.scene;
    if (!s) return;
    const cross = this.crossing();
    if (cross) {
      s.burst(cross[0], cross[1], { n: calmMotion() ? 3 : 6, color: '#ffb070', kind: 'spark', speed: 80, grav: 120, size: 1.8, life: 0.45 });
    }
  }

  /**
   * The cut, and it is yours. The kite goes over the rooftops with nobody
   * holding it, the flock comes off the coops in one sheet, and the charkhi
   * is already turning in an old man's hands. This is the best thing that
   * can go wrong on this roof, which is why it is allowed to.
   */
  private getCut(line: string) {
    const s = this.scene;
    this.lost++;
    this.selfFray = 0;
    this.progress = 0;
    this.phase = 'cut';
    this.wind = 'steady';
    this.fraySelfT = 0;
    this.audio.bump();
    const cry = CUT_LINES[(this.lost - 1) % CUT_LINES.length];
    const ustad = YUSUF_AFTER_CUT[(this.lost - 1) % YUSUF_AFTER_CUT.length];
    this.hint = `${line} ${cry} ${ustad} Press Space and take it up again.`;
    if (!s) return;
    s.flash('#e2d8e8', 0.28);
    if (!calmMotion()) s.thump(8, 0.08);
    // Your patang becomes the loose one: same machinery, your colors.
    this.cutT = 0;
    this.cutX = this.kx;
    this.cutY = this.ky;
    this.cutRot = 0;
    this.cutPaper = '#c1512f';
    this.cutPatch = '#f2e6d0';
    // Yours does not spiral into a lane. It keeps its height and goes east,
    // over roofs you have never stood on, to be somebody else's.
    this.cutSink = 9;
    this.cutDrift = 132;
    this.bokataT = 2.1;
    this.bokataMine = true;
    // Every coop on the block empties at once. That sound is the whole scene.
    this.scatterT = 1.5;
    this.scatterX = this.kx - 30;
    this.scatterY = Math.min(190, this.ky + 56);
    s.burst(this.kx, this.ky, { n: calmMotion() ? 4 : 10, color: '#c1512f', speed: 100, grav: 60, size: 2.6, life: 0.9 });
    s.burst(this.scatterX, this.scatterY, { n: calmMotion() ? 6 : 16, color: '#8b8798', kind: 'streak', speed: 260, grav: -40, size: 8, life: 0.7 });
  }

  /**
   * Yusuf's answer to a cut: another kite, immediately, no lecture. The
   * round starts over with the same rival; every cut already earned stays
   * earned, so a lost dor costs a round and never the night.
   */
  private relaunch() {
    this.phase = 'launch';
    this.wind = 'steady';
    this.windT = 0;
    this.windDur = 2;
    this.selfFray = 0;
    this.progress = 0;
    this.altitude = 0.3;
    this.kx = 322;
    this.ky = 264;
    this.kvx = 0;
    this.kvy = 0;
    this.rkx = 700;
    this.rky = 40;
    this.rvx = 0;
    this.rvy = 0;
    this.fraySelfT = 0;
    this.bokataT = 0;
    this.bokataMine = false;
    this.audio.chime();
    this.hint = 'The new patang lies on your palm, lighter than the last one felt. Space when the breeze leans in, and up she goes.';
    this.scene?.burst(322, 292, { n: calmMotion() ? 4 : 9, color: 'rgba(214,180,140,0.6)', speed: 60, grav: 90, size: 2.4, life: 0.5 });
  }

  private cutRival(rival: Rival) {
    // The CUT: the sky gets one kite lighter and one roar louder.
    const s = this.scene;
    const look = this.looks[this.rivalIdx] ?? { paper: '#332b36', patch: '#8a7f98' };
    if (s) {
      s.flash('#ffe4b8', 0.3);
      if (!calmMotion()) s.thump(7, 0.07);
      const cross = this.crossing() ?? [this.rkx, this.rky + 30];
      s.burst(cross[0], cross[1], { n: calmMotion() ? 6 : 16, color: '#ffd98a', kind: 'spark', speed: 190, grav: 160, size: 2.6, life: 0.6 });
      s.burst(this.rkx, this.rky, { n: calmMotion() ? 4 : 9, color: look.paper, speed: 90, grav: 40, size: 2.6, life: 0.8 });
      s.burst(360, 140, { n: calmMotion() ? 5 : 14, color: '#8b8798', kind: 'streak', speed: 220, grav: -30, size: 7, life: 0.6 });
      this.cutT = 0;
      this.cutX = this.rkx;
      this.cutY = this.rky;
      this.cutRot = 0;
      this.cutPaper = look.paper;
      this.cutPatch = look.patch;
      this.cutSink = 26;
      this.cutDrift = 110;
      this.bokataT = 1.7;
      this.bokataMine = false;
      this.rkx = 720;
      this.rky = 30;
      this.rvx = 0;
      this.rvy = 0;
    }
    this.cuts++;
    this.audio.weaveNote(this.cuts + 2);
    this.rivalIdx++;
    this.progress = 0;
    // A won round is also a fresh spool: whatever he sawed, you wind past it.
    this.selfFray = 0;
    if (this.rivalIdx >= this.rivals.length) {
      this.phase = this.tournament ? 'storm' : 'between';
      this.hint = this.tournament
        ? `${rival.line} And then the first fat drops arrive, warm as chai. Press Space.`
        : `${rival.line} Press Space to bring her down; Yusuf's word, not yours.`;
    } else {
      this.phase = 'between';
      this.hint = `${rival.line} Press Space; the next line is already climbing.`;
    }
  }

  onAction() {
    const s = this.scene;
    if (this.phase === 'cut') {
      this.relaunch();
      this.render();
      return;
    }
    if (this.phase === 'launch') {
      this.phase = 'duel';
      this.audio.chime();
      this.windT = 0;
      this.windDur = 2;
      this.wind = 'steady';
      // The current rival, not the first: after a cut you meet him again.
      this.hint = `${this.rivals[this.rivalIdx]?.name ?? 'A rival'} crosses your line. Up is kheench, Down is dheel. The sharper line wins.`;
      if (s) {
        this.kvy = -330;
        this.kvx = -40;
        s.burst(322, 292, { n: calmMotion() ? 4 : 9, color: 'rgba(214,180,140,0.6)', speed: 60, grav: 90, size: 2.4, life: 0.5 });
      }
      this.render();
      return;
    }
    if (this.phase === 'between') {
      if (this.rivalIdx >= this.rivals.length) {
        this.phase = 'done';
        this.audio.weaveDone();
        this.hint = 'The patang comes down hand over hand, polite as a guest. Press Space.';
        s?.flash('#ffe9c0', 0.3);
      } else {
        this.phase = 'duel';
        this.windT = 0;
        this.wind = 'steady';
        this.hint = `${this.rivals[this.rivalIdx]?.name} rises to meet you. Kheench on taut, dheel on gusts, and mind the birds.`;
        this.rkx = 700;
        this.rky = 30;
      }
      this.render();
      return;
    }
    if (this.phase === 'storm') {
      this.phase = 'done';
      this.audio.weaveDone();
      this.hint = 'The sky opens properly. Nobody leaves the roofs; the kites come down and the kulhads come out. Press Space.';
      if (s) {
        s.flash('#fff3d8', 0.35);
        if (!calmMotion()) s.thump(3, 0.03);
      }
      this.render();
      return;
    }
    if (this.phase === 'done') {
      this.root.hidden = true;
      const done = this.onDone;
      this.onDone = null;
      done?.();
    }
  }

  private caption(): string {
    const alt = Math.round(this.altitude * 100);
    let count: string;
    if (this.phase === 'cut') {
      count = 'the dor is gone &middot; the charkhi is already turning &middot; Space';
    } else if (this.phase === 'launch') {
      count = 'the charkhi is wound with plain cotton dor';
    } else {
      const dor = this.selfFray === 0 ? 'dor sound' : this.selfFray === 1 ? 'dor fraying' : 'dor nearly through';
      count = `altitude ${alt} &middot; cuts ${this.cuts}${this.tournament ? ' of 3' : ''} &middot; flocks honored ${this.blessed} &middot; ${dor}`;
    }
    if (this.lost > 0 && this.phase !== 'cut') count += ` &middot; given to the sky ${this.lost}`;
    return `${this.hint}<div class="c-count">${count}</div>`;
  }

  private render() {
    // The canvas repaints every tick; inputs only refresh the words below it.
    this.setHint?.(this.caption());
  }

  /** Where the two dor chords meet, if they do. */
  private crossing(): [number, number] | null {
    const x1 = ANCHOR.x;
    const y1 = ANCHOR.y;
    const x2 = this.kx;
    const y2 = this.ky;
    const x3 = RIVAL_ANCHOR.x;
    const y3 = RIVAL_ANCHOR.y;
    const x4 = this.rkx;
    const y4 = this.rky;
    const den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
    if (Math.abs(den) < 0.001) return null;
    const ta = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den;
    const ub = ((x1 - x3) * (y1 - y2) - (y1 - y3) * (x1 - x2)) / den;
    if (ta < 0.08 || ta > 0.92 || ub < 0.08 || ub > 0.92) return null;
    return [x1 + ta * (x2 - x1), y1 + ta * (y2 - y1)];
  }

  // ------------------------------------------------- painting the rooftop

  private paint(g: CanvasRenderingContext2D) {
    const s = this.scene;
    if (!s) return;
    const t = s.time;
    g.drawImage(skyBg(), 0, 0);

    // The far flock wheeling over the kucha: it is that hour.
    g.strokeStyle = 'rgba(80,70,88,0.5)';
    g.lineWidth = 1.2;
    for (let i = 0; i < 6; i++) {
      const a = t * 0.45 + i * 1.05;
      const wx = 432 + Math.cos(a) * 52;
      const wy = 64 + Math.sin(a) * 17;
      const f = Math.sin(t * 11 + i * 2);
      g.beginPath();
      g.moveTo(wx - 3, wy);
      g.quadraticCurveTo(wx, wy - 2 - f * 1.6, wx + 3, wy);
      g.stroke();
    }

    // Layered haze, each veil drifting on its own slow wind.
    g.drawImage(hazeFar(), -34 + Math.sin(t * 0.05) * 8 - this.gustK * 10, 126);
    if (this.stormK > 0.01) {
      g.globalAlpha = this.stormK * 0.95;
      g.drawImage(stormBank(), -20 + this.stormK * 26 + Math.sin(t * 0.2) * 6, 8);
      g.globalAlpha = 1;
    }
    g.drawImage(hazeMid(), -46 + Math.sin(t * 0.045 + 1.3) * 11 - this.gustK * 20, 194);
    if (this.stormK > 0.01) {
      g.fillStyle = `rgba(74,72,92,${this.stormK * 0.22})`;
      g.fillRect(0, 0, 640, 340);
    }

    // Wind made visible: long pale threads combing the sky, and in a gust
    // they stop being a texture and start being the weather that is happening
    // to you. The number in the caption was never going to do this.
    const wa = 0.07 + this.gustK * 0.42;
    g.strokeStyle = `rgba(255,246,230,${wa})`;
    g.lineWidth = 1.6 + this.gustK * 2.2;
    g.lineCap = 'round';
    const wsp = 90 + this.gustK * 420;
    const lanes = 5 + Math.round(this.gustK * 5);
    for (let i = 0; i < lanes; i++) {
      const wx = 640 - (((t * wsp + i * 173) % 900) - 130);
      const wy = 42 + i * 30 + ((i * 37) % 19);
      const len = 90 + this.gustK * 130;
      g.beginPath();
      g.moveTo(wx, wy);
      g.quadraticCurveTo(wx + len * 0.45, wy - 7 - this.gustK * 5, wx + len, wy - 3);
      g.stroke();
    }

    if (this.rainK > 0.01) {
      g.strokeStyle = `rgba(226,232,240,${0.24 * this.rainK})`;
      g.lineWidth = 1.2;
      for (let i = 0; i < 46; i++) {
        const rx = ((i * 89) % 700) - 30 + Math.sin(i) * 8;
        const ry = ((t * 430 + i * 97) % 380) - 20;
        g.beginPath();
        g.moveTo(rx, ry);
        g.lineTo(rx - 7 - this.gustK * 8, ry + 16);
        g.stroke();
      }
    }

    if (this.wind === 'birds' && this.phase === 'duel') this.paintFlock(g, t);
    if (this.cutT < 8) this.paintCutKite(g, t);
    if (this.scatterT > 0) this.paintScatter(g, t);

    const duelish = this.phase === 'duel';
    // The rival stays up through the cut; he has earned the view.
    if (duelish || this.phase === 'cut') this.paintRival(g, t);
    this.paintYourLine(g, t);
    if (this.phase !== 'cut') {
      drawPatang(g, this.kx, this.ky, Math.max(-0.55, Math.min(0.55, this.kvx * 0.004)) + Math.sin(t * 1.7) * 0.05,
        this.phase === 'launch' ? 20 : 26, '#c1512f', '#f2e6d0', t, -this.kvx * 0.06 - this.gustK * 8);
    }

    if (duelish) this.paintCrossing(g, t);

    g.drawImage(parapet(), 0, 200);
    this.paintPennant(g, t);
    this.paintCharkhi(g, t);
    if (this.phase === 'cut') this.paintSlackDor(g, t);
    if (duelish || this.phase === 'launch') this.paintChit(g, t);
    if (this.bokataT > 0) this.paintBokata(g);
    g.drawImage(vignette(), 0, 0);
  }

  private paintYourLine(g: CanvasRenderingContext2D, t: number) {
    if (this.phase === 'cut') return; // the slack dor is drawn over the parapet
    // Slack you can see: a gust puts a real belly in the dor, a steady wind
    // pulls it near straight. The line is the wind's own readout.
    const sag = this.wind === 'gust' ? 46 + Math.sin(t * 2.2) * 7 : 8 + Math.sin(t * 1.1) * 3;
    const mx = (ANCHOR.x + this.kx) / 2 + this.gustK * -14;
    const my = (ANCHOR.y + this.ky) / 2 + sag;
    g.strokeStyle = this.fraySelfT > 0 ? `rgba(255,140,90,${0.5 + Math.sin(t * 20) * 0.3})` : 'rgba(244,236,220,0.75)';
    g.lineWidth = 1.4;
    g.beginPath();
    g.moveTo(ANCHOR.x, ANCHOR.y);
    g.quadraticCurveTo(mx, my, this.kx, this.ky + 14);
    g.stroke();
    // A glass glint slides along the dor: cotton, but proud of itself.
    const gt = (t * 0.4) % 1;
    const gx = (1 - gt) * (1 - gt) * ANCHOR.x + 2 * (1 - gt) * gt * mx + gt * gt * this.kx;
    const gy = (1 - gt) * (1 - gt) * ANCHOR.y + 2 * (1 - gt) * gt * my + gt * gt * (this.ky + 14);
    dot(g, gx, gy, 1.3, 'rgba(255,246,220,0.9)');

    // Fraying, made honest: one whisker of loose cotton per pass he has
    // taken across your line, so the third one is never a surprise.
    for (let i = 0; i < this.selfFray; i++) {
      const k = 0.42 + i * 0.16;
      const fx = (1 - k) * (1 - k) * ANCHOR.x + 2 * (1 - k) * k * mx + k * k * this.kx;
      const fy = (1 - k) * (1 - k) * ANCHOR.y + 2 * (1 - k) * k * my + k * k * (this.ky + 14);
      stampGlow(g, fx, fy, 13, 'rgba(255,150,80,1)', 0.35 + Math.sin(t * 7 + i) * 0.14);
      g.strokeStyle = 'rgba(255,168,110,0.85)';
      g.lineWidth = 1.1;
      for (let k2 = 0; k2 < 3; k2++) {
        const a = k2 * 2.2 + 0.6 + Math.sin(t * 6 + k2 + i) * 0.3;
        g.beginPath();
        g.moveTo(fx, fy);
        g.lineTo(fx + Math.cos(a) * 6.5, fy + Math.sin(a) * 6.5);
        g.stroke();
      }
    }
  }

  private paintRival(g: CanvasRenderingContext2D, t: number) {
    const look = this.looks[this.rivalIdx] ?? { paper: '#332b36', patch: '#8a7f98' };
    const mx = (RIVAL_ANCHOR.x + this.rkx) / 2 + 10;
    const my = (RIVAL_ANCHOR.y + this.rky) / 2 + 16;
    g.strokeStyle = 'rgba(226,212,196,0.6)';
    g.lineWidth = 1.2;
    g.beginPath();
    g.moveTo(RIVAL_ANCHOR.x, RIVAL_ANCHOR.y);
    g.quadraticCurveTo(mx, my, this.rkx, this.rky + 12);
    g.stroke();
    drawPatang(g, this.rkx, this.rky, Math.max(-0.5, Math.min(0.5, this.rvx * 0.004)) + Math.sin(t * 1.3 + 2) * 0.06,
      23, look.paper, look.patch, t, -this.rvx * 0.06);
  }

  private paintCrossing(g: CanvasRenderingContext2D, t: number) {
    const cross = this.crossing();
    if (!cross) return;
    const rival = this.rivals[this.rivalIdx];
    const frayK = rival ? this.progress / rival.need : 0;
    const [cx2, cy2] = cross;
    if (frayK > 0.02) {
      stampGlow(g, cx2, cy2, 20 + frayK * 16, 'rgba(255,150,70,1)', 0.2 + frayK * 0.5);
      g.strokeStyle = `rgba(255,120,60,${0.4 + frayK * 0.5})`;
      g.lineWidth = 1.4;
      for (let i = 0; i < 3; i++) {
        const a = i * 2.1 + 0.4;
        g.beginPath();
        g.moveTo(cx2 + Math.cos(a) * 3, cy2 + Math.sin(a) * 3);
        g.lineTo(cx2 + Math.cos(a) * (6 + frayK * 6), cy2 + Math.sin(a) * (6 + frayK * 6));
        g.stroke();
      }
    }
    if (this.sawGlowT > 0) {
      const k = this.sawGlowT / 0.55;
      stampGlow(g, cx2, cy2, 26, 'rgba(255,214,130,1)', k * 0.8);
      dot(g, cx2, cy2, 2.2 + Math.sin(t * 30) * 1, `rgba(255,244,210,${k})`);
    }
  }

  private paintCutKite(g: CanvasRenderingContext2D, t: number) {
    const ct = this.cutT;
    // The loose dor curls after it, spending its tension in loops.
    g.strokeStyle = 'rgba(240,230,214,0.55)';
    g.lineWidth = 1.1;
    g.beginPath();
    g.moveTo(this.cutX, this.cutY + 8);
    for (let i = 1; i <= 14; i++) {
      g.lineTo(
        this.cutX - i * 8 - Math.sin(ct * 2 + i * 0.8) * 7,
        this.cutY + 8 + Math.sin(i * 0.9 + ct * 3) * (3 + i * 1.2) + i * 1.6,
      );
    }
    g.stroke();
    g.save();
    g.translate(this.cutX, this.cutY);
    g.rotate(this.cutRot);
    g.scale(1, 0.72 + Math.sin(ct * 5) * 0.24);
    drawPatang(g, 0, 0, 0, 21, this.cutPaper, this.cutPatch, t, 6);
    g.restore();
  }

  /**
   * Every coop on the block emptying at once. A kite comes off its line and
   * the roofs answer with birds; this is the sound Old Delhi actually makes.
   */
  private paintScatter(g: CanvasRenderingContext2D, t: number) {
    const e = easeOutCubic(Math.max(0, Math.min(1, 1 - this.scatterT / 1.5)));
    g.globalAlpha = Math.min(1, this.scatterT * 1.4);
    for (let i = 0; i < 13; i++) {
      const a = (i / 13) * Math.PI * 2 + 0.4;
      const d = 18 + e * (150 + (i % 5) * 44);
      const px = this.scatterX + Math.cos(a) * d * 1.6;
      const py = this.scatterY + Math.sin(a) * d * 0.62 - e * 34;
      drawPigeon(g, px, py, 1.2 - e * 0.3, Math.sin(t * 18 + i * 1.7));
    }
    g.globalAlpha = 1;
  }

  /**
   * The flock, drawn big enough to be the reason you gave slack. It used to
   * be eight specks in the upper right that a player could miss entirely
   * while the caption insisted they were the whole event.
   */
  private paintFlock(g: CanvasRenderingContext2D, t: number) {
    const p = Math.min(1, this.windT / this.windDur);
    const fx = 760 - p * 980;
    for (let i = 0; i < FLOCK.length; i++) {
      const o = FLOCK[i];
      if (!o) continue;
      const x = fx + o[0];
      const y = 132 + o[1] + Math.sin(t * 2 + i) * 6;
      const flap = Math.sin(t * 15 + i * 1.4);
      // A soft shadow under each bird so the flock has weight against the sky.
      g.globalAlpha = 0.16;
      oval(g, x + 5, y + 13, 9, 3, '#3a3446');
      g.globalAlpha = 1;
      drawPigeon(g, x, y, o[2] ?? 2, flap);
    }
  }

  private paintPennant(g: CanvasRenderingContext2D, t: number) {
    const lift = 0.25 + this.gustK * 0.75 + Math.sin(t * (3 + this.gustK * 5)) * 0.12;
    const px = 56;
    const py = 228;
    g.fillStyle = this.wind === 'gust' ? '#7ea0c8' : '#c8a55b';
    g.beginPath();
    g.moveTo(px, py);
    g.quadraticCurveTo(px + 16, py - 4 * lift + 3, px + 30 + lift * 10, py + 8 - lift * 16);
    g.lineTo(px + 14, py + 10);
    g.closePath();
    g.fill();
    dot(g, px, py, 2, '#2b2118');
  }

  /**
   * The dor with nothing on the end of it. It comes off the charkhi in slack
   * loops, lies along the parapet, and hangs over the edge where the kite
   * used to pull. Drawn over the wall so you can actually see it go limp.
   */
  private paintSlackDor(g: CanvasRenderingContext2D, t: number) {
    const fall = Math.min(1, this.cutT * 0.8);
    g.strokeStyle = 'rgba(244,236,220,0.7)';
    g.lineWidth = 1.4;
    g.beginPath();
    g.moveTo(ANCHOR.x + 12, 310);
    for (let i = 1; i <= 16; i++) {
      const k = i / 16;
      g.lineTo(
        ANCHOR.x + 12 + k * 176,
        // Taut at the instant of the cut, a lazy scallop a moment later.
        306 - 46 * (1 - fall) * Math.sin(k * 0.9) + fall * Math.sin(k * 7 + t * 1.4) * 7 + fall * k * 24,
      );
    }
    g.stroke();
  }

  private paintCharkhi(g: CanvasRenderingContext2D, t: number) {
    const bob = Math.sin(t * 1.3) * 1.6 + (this.sawGlowT > 0.35 ? -3 : 0);
    const cx2 = ANCHOR.x;
    const cy2 = 314 + bob;
    g.strokeStyle = 'rgba(43,33,24,0.7)';
    g.lineWidth = 3.4;
    g.beginPath();
    g.moveTo(cx2 - 20, cy2 + 12);
    g.lineTo(cx2 + 22, cy2 + 10);
    g.stroke();
    for (const sx of [-14, 15]) {
      oval(g, cx2 + sx, cy2, 5.5, 11, '#8a5f38');
      oval(g, cx2 + sx, cy2, 3, 8.5, '#a87d4e');
    }
    rr(g, cx2 - 11, cy2 - 7, 23, 14, 6, '#e8dcc4');
    rr(g, cx2 - 11, cy2 - 7, 23, 14, 6, 'rgba(200,165,91,0.25)');
    g.strokeStyle = 'rgba(160,130,92,0.8)';
    g.lineWidth = 1;
    for (let i = 0; i < 4; i++) {
      g.beginPath();
      g.moveTo(cx2 - 10, cy2 - 5 + i * 3.4);
      g.lineTo(cx2 + 11, cy2 - 6 + i * 3.4);
      g.stroke();
    }
  }

  /**
   * The weather chit, and the answer to it. The wind state was legible enough
   * here; what was missing was the move it asks for, which lived in a sentence
   * that the response to your last input immediately overwrote. Now the chit
   * carries the key, so it stays a readout for as long as the wind lasts.
   */
  private paintChit(g: CanvasRenderingContext2D, t: number) {
    const launch = this.phase === 'launch';
    const tag = launch
      ? 'the breeze leans in'
      : this.wind === 'steady' ? 'taut and steady' : this.wind === 'gust' ? 'GUST' : 'PIGEONS CROSSING';
    const under = this.wind === 'steady' ? 'rgba(200,165,91,0.9)' : this.wind === 'gust' ? 'rgba(120,160,200,0.95)' : 'rgba(168,166,176,0.95)';
    const answer = launch ? 'let her go' : this.wind === 'steady' ? 'kheench · pull' : 'dheel · give slack';
    const key: 'up' | 'down' | 'space' = launch ? 'space' : this.wind === 'steady' ? 'up' : 'down';
    g.save();
    g.translate(536, 34);
    g.rotate(0.03 + Math.sin(t * 0.8) * 0.012);
    rr(g, -96, -20, 192, 60, 4, 'rgba(43,33,24,0.5)');
    rr(g, -94, -21, 190, 59, 4, 'rgba(244,234,214,0.94)');
    g.fillStyle = '#2b2118';
    g.font = '600 16px Fraunces, Georgia, serif';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillText(tag, 0, -7);
    rr(g, -64, 3, 128, 3, 1.5, launch ? 'rgba(200,165,91,0.9)' : under);
    const capW = keyCap(g, -56, 22, key, 1, 0.92);
    g.fillStyle = 'rgba(43,33,24,0.85)';
    g.font = 'italic 13px Fraunces, Georgia, serif';
    g.textAlign = 'left';
    // Start clear of the cap's real right edge. This used to be a constant,
    // and the cap ate the first letter of 'let her go' on the launch frame,
    // which is the first thing a player ever sees of this game.
    g.fillText(answer, -56 + capW / 2 + 7, 22);
    g.restore();
  }

  /**
   * The cry, which the roofs shout the same either way. Only the color
   * changes: gold when the sky lost a kite to you, cold silver when it was
   * yours, and the same fifty voices behind both.
   */
  private paintBokata(g: CanvasRenderingContext2D) {
    const span = this.bokataMine ? 2.1 : 1.7;
    const k = this.bokataT / span;
    const inK = Math.min(1, (1 - k) * 6);
    const y = 118 - (1 - k) * 26;
    g.save();
    g.globalAlpha = Math.min(1, k * 3) * inK;
    g.translate(340, y);
    g.rotate(this.bokataMine ? 0.04 : -0.05);
    g.font = 'italic 700 52px Fraunces, Georgia, serif';
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.strokeStyle = this.bokataMine ? 'rgba(34,28,42,0.85)' : 'rgba(43,33,24,0.85)';
    g.lineWidth = 7;
    g.strokeText('bo kata!', 0, 0);
    g.fillStyle = this.bokataMine ? '#e4dcee' : '#fff3d8';
    g.fillText('bo kata!', 0, 0);
    if (this.bokataMine) {
      g.font = 'italic 500 17px Fraunces, Georgia, serif';
      g.fillStyle = 'rgba(228,220,238,0.9)';
      g.fillText('and it was yours', 0, 34);
    }
    g.restore();
  }
}
