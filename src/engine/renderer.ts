import { ART, TILE, VIEW_H, VIEW_W } from './config';
import type { Actor } from './actor';
import type { TileMap } from './grid';
import type { Camera } from './camera';
import { PATHY, Tileset, WATERY } from '../art/tiles';
import { CHAR_H, CHAR_W, DIR_ROW } from '../art/character';
import { Rng, cellHash, outlineSheet, surface } from '../art/pix';

/**
 * The world composer, smooth-art era. Renders the scene at 4x logical
 * resolution (1280x720) with antialiasing into an offscreen canvas that the
 * GPU stage presents with lighting, bloom, and zoom. Game logic stays in
 * 16px tiles; only drawing knows about ART scale.
 */

const A = ART;
const S = TILE * A;

/** Which ground kinds grow which family of walkable micro-decor. */
const LIFE_FAMILY: Record<string, string> = {
  grass: 'green', puna: 'green',
  dirt: 'earth', laterite: 'earth',
  sand: 'sand',
  // A coral lane is crushed shell, not paving with weeds in it: green sprigs
  // at even spacing across it read as litter dropped on clean sand.
  corallane: 'sand',
  plaza: 'stone', lanepave: 'stone', basalto: 'stone', tataki: 'stone',
  galistone: 'stone', chowkbrick: 'stone',
};
/**
 * Base fraction of eligible cells that sprout, before the density field has
 * its say. Ground life is not weather: it gathers where feet do not go, so
 * this number is a ceiling that only wall bases, seams and shorelines reach.
 */
const LIFE_DENSITY: Record<string, number> = { green: 0.19, earth: 0.15, sand: 0.15, stone: 0.18 };
const AW = CHAR_W * A;
const AH = CHAR_H * A;
const W = VIEW_W * A;
const H = VIEW_H * A;

/**
 * The sun's shadows are composed in a small buffer and blown back up to the
 * screen: one composite instead of hundreds, and the upscale is where the
 * soft painterly edge comes from, for free.
 */
const SH_DIV = 7;
const SHW = Math.ceil(W / SH_DIV);
const SHH = Math.ceil(H / SH_DIV);

/** How far past the view a caster can stand and still throw into it. */
const SH_MX = 12;
const SH_MY = 9;

/**
 * How tall a person is, in tiles, for the sun. Not the height of the sprite,
 * which includes the headroom the art is drawn in, but the height a figure has
 * to stand next to a house whose castHeight is three and a half.
 */
const ACTOR_H = 1.15;

/** Depth into the cell each boundary-feather mask reaches, as a fraction. */
const SPILL_DEPTHS = [0.12, 0.2, 0.3, 0.42, 0.58];

export type Sprite = {
  actor: Actor;
  sheet: HTMLCanvasElement;
  /** Humans use the 7-column 6-frame rig with breathe/blink; animals the 3-column. */
  rig?: 'human' | 'animal';
  /** Marks the player for idle-life and NPC-glance logic; index 0 is assumed otherwise. */
  isPlayer?: boolean;
};

/** The species of ambient flier a mood invites across its sky. */
type FlierKind = 'gull' | 'songbird' | 'pigeon' | 'butterfly';
/** One passing flock: screen-space, timed, gone when it exits. */
type Flock = {
  kind: FlierKind;
  t: number;
  dur: number;
  sign: 1 | -1;
  y0: number;
  birds: { ox: number; oy: number; ph: number; sc: number }[];
};

/** Coastal skies get gulls. */
const GULL_MOODS = new Set([
  'garua', 'glare', 'openocean', 'setouchi', 'jagalchi', 'tideout', 'dusklamp',
  'ciclopi', 'passeggiata', 'tanabataNight',
]);
/** Delhi's air is pigeons, famously so at pigeon hour. */
const PIGEON_MOODS = new Set(['brasslight', 'pigeonhour']);
/** Nothing flies indoors or through real rain. */
const NO_FLIER_MOODS = new Set(['interior', 'monsoon', 'sawanrain']);

/** Building kinds that plausibly keep a hearth lit morning and evening. */
const HEARTH_KINDS = new Set([
  'house', 'casa', 'veedu', 'machiya', 'haveli', 'casona', 'casedda', 'nyumba', 'teahouse',
]);

/** A brief thought made visible: !, ♥, ♪, ? above someone's head. */
type Emote = { actor: Actor; kind: string; t: number };
/** A puff of dust where a foot just left. */
type Puff = { x: number; y: number; t: number };
/** Celebration particles: sparkle rings and drifting petals, cozy physics. */
type Party = { x: number; y: number; vx: number; vy: number; t: number; life: number; kind: 'sparkle' | 'petal'; hue: string; spin: number };

const EMOTE_DUR = 0.8;
const PUFF_DUR = 0.35;

/** Per-map light. Built-ins below; chapters register their own by name. */
export type Mood = string;

/** The paintable half of a chapter's MoodSpec (ambient lives in the stage). */
type MoodPaint = { top: string; mid: string; bottom: string; vig: number; glow?: string; noClouds?: boolean };

export class Renderer {
  readonly ctx: CanvasRenderingContext2D;
  private time = 0;
  private tiles = new Tileset();
  private atmospheres: Record<string, HTMLCanvasElement>;
  private noClouds = new Set<string>(['garua', 'interior']);
  private mood: Mood = 'warm';
  private nightK = 0;
  /** Rain is weather, not a look: it falls through whatever mood is lit. */
  private raining = false;
  private emotes: Emote[] = [];
  private puffs: Puff[] = [];
  private party: Party[] = [];

  /**
   * Per-frame gradients are the silent frame killer: at 60fps every
   * createRadialGradient is a small allocation and a shader rebuild. All the
   * soft blobs below are baked ONCE here and drawn with drawImage + alpha,
   * which is why the layered look stays and the jank goes.
   */
  private shadowBlob: HTMLCanvasElement;
  private tintPatches: HTMLCanvasElement[] = [];
  /** Baked walkable micro-decor per ground family; see groundLifePass. */
  private groundLife = new Map<string, HTMLCanvasElement[]>();
  private wallShadeStrip: HTMLCanvasElement;
  /** The ground's own darkening where it runs up against a tall thing's back. */
  private northContact: HTMLCanvasElement;
  private cloudPuff: HTMLCanvasElement;
  private fireflyGlow: HTMLCanvasElement;
  /** Surface history: damp, worn-pale, grime, and the pale standing-print. */
  private wearBlobs: HTMLCanvasElement[] = [];
  private standPrint: HTMLCanvasElement;
  /** Feather masks for ground-kind seams: [direction][variant]. */
  private spillMasks: HTMLCanvasElement[][] = [];
  /** Ground fragments already cut to a mask, keyed kind|dir|mask|variant. */
  private spillCache = new Map<string, HTMLCanvasElement | null>();
  /** Sun geometry, driven by the world clock: skew sign is throw direction. */
  private sunSkew = -0.55;
  private sunLen = 1;
  /** Where the sun is in its arc, 0 dawn to 1 dusk; kept for setNight. */
  private sunD = 0.5;
  /**
   * How much sun is still above the horizon, 1 to 0 across the sunset. Every
   * direct-light cue is multiplied by it, so when it reaches zero the world is
   * lit by lamps and nothing else throws.
   */
  private sunUp = 1;
  /** The cast-shadow throw for one tile of object height, in tiles. */
  private castX = 0;
  private castY = 0.2;
  private shadowRGB = '#2e2840';
  private shadowA = 0.26;
  /** Low-res composition buffer for the whole screen's cast shadows. */
  private shadowBuf = surface(SHW, SHH);
  /** Per-map caster heights in tiles, spread across each footprint. Once. */
  private casterCache = new Map<string, { h: Float32Array; foot: Float32Array }>();
  /** The visible window's fields: distance to solid, to water, seam flag. */
  private fx0 = 0;
  private fy0 = 0;
  private fw = 0;
  private fh = 0;
  private dSolid = new Uint8Array(0);
  private dWater = new Uint8Array(0);
  private fSeam = new Uint8Array(0);
  private fKind: string[] = [];
  /** Fires on the current map (tile coords), for the warm-side sprite pass. */
  private fires: [number, number][] = [];
  private fireScreen: [number, number][] = [];
  /** Scratch cell for per-sprite compositing (fire rim). */
  private scratch = surface(AW, AH);
  /** This frame's sprite world positions, x,y interleaved. Grown, never rebuilt. */
  private spriteXY = new Float64Array(64);
  /** Greeting waves and happy hops, keyed by actor, counted down in tick. */
  private waves = new Map<Actor, number>();
  private bounces = new Map<Actor, number>();
  /** Whoever is mid-sentence bobs gently. */
  private speaker: Actor | null = null;
  /** The facing-cell hint: a quiet pulse over whatever would respond. */
  private hint: [number, number] | null = null;
  /** Last frame's dt, for the few smoothed values updated at draw time. */
  private frameDt = 1 / 60;
  /** World clock as last given to setSun; gates hearth smoke by hour. */
  private dayT = 0.25;
  /** Per-actor walk lean (radians), eased toward the travel direction. */
  private leans = new Map<Actor, number>();
  /** The player's screen position this frame, for NPC glances. */
  private playerSX = -9999;
  private playerSY = -9999;

  // -- ambient fliers --------------------------------------------------
  /** Baked wing frames per species, each facing right. */
  private flierFrames: Record<FlierKind, HTMLCanvasElement[]>;
  private flock: Flock | null = null;
  /** Seconds until the next flock is considered; first one arrives earlyish. */
  private flockWait = 12;
  private flockSeq = 1;
  /** Debug knob (`?fliers=N`): force the between-flock gap to N seconds. */
  private flierEvery: number | null = null;
  /** Optional per-map species override; null follows the mood. */
  private flierKind: FlierKind | null = null;

  // -- hearth smoke ----------------------------------------------------
  /** Two baked wisp puffs, alternated so no two columns look stamped. */
  private smokePuffs: HTMLCanvasElement[] = [];
  /** Chimney anchors per map id, world-logical coords, found once. */
  private chimneyCache = new Map<string, [number, number][]>();

  constructor(readonly canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) throw new Error('2d canvas context unavailable');
    this.ctx = ctx;
    canvas.width = W;
    canvas.height = H;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    this.atmospheres = buildAtmospheres();

    // Bake the soft-blob library.
    {
      const sh = surface(128, 128);
      const g1 = sh.g.createRadialGradient(64, 64, 2, 64, 64, 64);
      g1.addColorStop(0, 'rgba(38,26,14,1)');
      g1.addColorStop(0.7, 'rgba(38,26,14,0.4)');
      g1.addColorStop(1, 'rgba(38,26,14,0)');
      sh.g.fillStyle = g1;
      sh.g.fillRect(0, 0, 128, 128);
      this.shadowBlob = sh.cv;

      const TINTS = [
        'rgba(96,70,36,0.11)',
        'rgba(255,236,180,0.10)',
        'rgba(88,104,60,0.10)',
        'rgba(140,90,50,0.08)',
      ];
      for (const tint of TINTS) {
        const tp = surface(256, 256);
        const g2 = tp.g.createRadialGradient(128, 128, 38, 128, 128, 128);
        g2.addColorStop(0, tint);
        g2.addColorStop(1, 'rgba(0,0,0,0)');
        tp.g.fillStyle = g2;
        tp.g.fillRect(0, 0, 256, 256);
        this.tintPatches.push(tp.cv);
      }

      const ws = surface(S, 16);
      const g3 = ws.g.createLinearGradient(0, 0, 0, 16);
      g3.addColorStop(0, 'rgba(30,22,14,0.26)');
      g3.addColorStop(1, 'rgba(30,22,14,0)');
      ws.g.fillStyle = g3;
      ws.g.fillRect(0, 0, S, 16);
      this.wallShadeStrip = ws.cv;

      // The far side. Where walkable ground runs into the back of a wall or
      // the eave of a roof, the ground goes dark before it gets there: it is
      // the only cue that says the plane beyond is lower and further away,
      // and without it a player standing on that row stands on the roof.
      const nc = surface(S, 26);
      const g3b = nc.g.createLinearGradient(0, 0, 0, 26);
      g3b.addColorStop(0, 'rgba(26,19,13,0)');
      g3b.addColorStop(0.55, 'rgba(26,19,13,0.13)');
      g3b.addColorStop(1, 'rgba(26,19,13,0.36)');
      nc.g.fillStyle = g3b;
      nc.g.fillRect(0, 0, S, 26);
      this.northContact = nc.cv;

      const cp = surface(256, 256);
      const g4 = cp.g.createRadialGradient(128, 128, 26, 128, 128, 128);
      g4.addColorStop(0, 'rgba(30,24,40,0.10)');
      g4.addColorStop(0.7, 'rgba(30,24,40,0.06)');
      g4.addColorStop(1, 'rgba(30,24,40,0)');
      cp.g.fillStyle = g4;
      cp.g.fillRect(0, 0, 256, 256);
      this.cloudPuff = cp.cv;

      const ff = surface(16, 16);
      const g5 = ff.g.createRadialGradient(8, 8, 0, 8, 8, 8);
      g5.addColorStop(0, 'rgba(232,255,160,0.9)');
      g5.addColorStop(0.4, 'rgba(210,245,130,0.35)');
      g5.addColorStop(1, 'rgba(210,245,130,0)');
      ff.g.fillStyle = g5;
      ff.g.fillRect(0, 0, 16, 16);
      this.fireflyGlow = ff.cv;

      // Surface history. Four washes at the scale a place actually wears at:
      // damp where the water reaches, pale where feet keep it swept, grime
      // banked against the walls, and the bleached print of something that
      // has stood in one spot for years.
      const WEAR: [string, string][] = [
        ['rgba(34,46,56,0.19)', 'rgba(34,46,56,0.11)'], // damp
        ['rgba(228,212,174,0.18)', 'rgba(228,212,174,0.11)'], // worn pale, desire path
        ['rgba(50,38,24,0.15)', 'rgba(50,38,24,0.09)'], // grime banked at a wall
      ];
      for (const [core, mid] of WEAR) {
        const wp = surface(256, 256);
        const gw = wp.g.createRadialGradient(128, 128, 20, 128, 128, 128);
        gw.addColorStop(0, core);
        gw.addColorStop(0.55, mid);
        gw.addColorStop(1, 'rgba(0,0,0,0)');
        wp.g.fillStyle = gw;
        wp.g.fillRect(0, 0, 256, 256);
        this.wearBlobs.push(wp.cv);
      }
      const sp = surface(256, 192);
      const gsp = sp.g.createRadialGradient(128, 96, 24, 128, 96, 118);
      gsp.addColorStop(0, 'rgba(236,226,198,0.19)');
      gsp.addColorStop(0.62, 'rgba(236,226,198,0.11)');
      gsp.addColorStop(1, 'rgba(236,226,198,0)');
      sp.g.save();
      sp.g.translate(128, 96);
      sp.g.scale(1, 0.62);
      sp.g.translate(-128, -96);
      sp.g.fillStyle = gsp;
      sp.g.fillRect(0, 0, 256, 192);
      sp.g.restore();
      this.standPrint = sp.cv;
    }

    this.bakeGroundLife();
    this.bakeSpillMasks();
    this.flierFrames = bakeFliers();
    this.smokePuffs = bakeSmokePuffs();

    // Debug knob: `?fliers=2` makes flocks near-constant for screenshots;
    // `?fliers=2,gull` also pins the species.
    try {
      const q = new URLSearchParams(location.search).get('fliers');
      if (q !== null) {
        const [n, kind] = q.split(',');
        this.flierEvery = Math.max(0.5, Number(n) || 2);
        this.flockWait = Math.min(this.flockWait, this.flierEvery);
        if (kind === 'gull' || kind === 'songbird' || kind === 'pigeon' || kind === 'butterfly') {
          this.flierKind = kind;
        }
      }
    } catch {
      // No location (tests); the default timers stand.
    }
  }

  /**
   * Ground life: the small stuff a place accumulates when people live in it.
   * Sprigs and clover on grass, pebbles and straw on earth lanes, shells on
   * sand, weeds working the joints of paving. Baked once as tile-sized
   * stamps; scattered deterministically so the world never reshuffles.
   */
  private bakeGroundLife() {
    const sprig = (g: CanvasRenderingContext2D, x: number, y: number, c1: string, c2: string, s = 1) => {
      g.lineCap = 'round';
      g.lineWidth = 2.2 * s;
      g.strokeStyle = c1;
      g.beginPath();
      g.moveTo(x, y);
      g.quadraticCurveTo(x - 3 * s, y - 5 * s, x - 4 * s, y - 9 * s);
      g.stroke();
      g.strokeStyle = c2;
      g.beginPath();
      g.moveTo(x, y);
      g.quadraticCurveTo(x + 3 * s, y - 6 * s, x + 3.6 * s, y - 10 * s);
      g.stroke();
    };
    const flower = (g: CanvasRenderingContext2D, x: number, y: number, c: string, heart: string) => {
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2 + 0.5;
        g.beginPath();
        g.ellipse(x + Math.cos(a) * 3, y + Math.sin(a) * 3, 2.6, 1.8, a, 0, Math.PI * 2);
        g.fillStyle = c;
        g.fill();
      }
      g.beginPath();
      g.arc(x, y, 1.8, 0, Math.PI * 2);
      g.fillStyle = heart;
      g.fill();
    };
    const pebble = (g: CanvasRenderingContext2D, x: number, y: number, rx: number, c: string) => {
      g.beginPath();
      g.ellipse(x, y, rx, rx * 0.72, 0, 0, Math.PI * 2);
      g.fillStyle = c;
      g.fill();
      g.beginPath();
      g.ellipse(x - rx * 0.2, y - rx * 0.25, rx * 0.55, rx * 0.34, 0, 0, Math.PI * 2);
      g.fillStyle = 'rgba(255,250,235,0.28)';
      g.fill();
    };
    const straw = (g: CanvasRenderingContext2D, x: number, y: number, c: string) => {
      g.lineCap = 'round';
      g.lineWidth = 1.7;
      g.strokeStyle = c;
      g.beginPath();
      g.moveTo(x, y);
      g.quadraticCurveTo(x + 6, y - 2, x + 12, y - 1);
      g.moveTo(x + 3, y + 3);
      g.quadraticCurveTo(x + 8, y + 1, x + 11, y + 3);
      g.stroke();
    };
    const clover = (g: CanvasRenderingContext2D, x: number, y: number, c: string) => {
      for (const [dx, dy] of [[-2.4, 0.8], [2.4, 0.8], [0, -2.2]] as const) {
        g.beginPath();
        g.arc(x + dx, y + dy, 2.5, 0, Math.PI * 2);
        g.fillStyle = c;
        g.fill();
      }
    };
    const shell = (g: CanvasRenderingContext2D, x: number, y: number, c: string, rib: string) => {
      g.beginPath();
      g.moveTo(x, y);
      g.arc(x, y, 5, Math.PI * 1.15, Math.PI * 1.85);
      g.closePath();
      g.fillStyle = c;
      g.fill();
      g.strokeStyle = rib;
      g.lineWidth = 1;
      for (const a of [1.3, 1.5, 1.7]) {
        g.beginPath();
        g.moveTo(x, y);
        g.lineTo(x + Math.cos(Math.PI * a) * 4.6, y + Math.sin(Math.PI * a) * 4.6);
        g.stroke();
      }
    };
    const moss = (g: CanvasRenderingContext2D, x: number, y: number, r: number) => {
      g.beginPath();
      g.ellipse(x, y, r, r * 0.6, 0.3, 0, Math.PI * 2);
      g.fillStyle = 'rgba(96,118,58,0.42)';
      g.fill();
      g.beginPath();
      g.ellipse(x + r * 0.5, y + r * 0.3, r * 0.5, r * 0.32, 0.3, 0, Math.PI * 2);
      g.fillStyle = 'rgba(96,118,58,0.30)';
      g.fill();
    };
    const crack = (g: CanvasRenderingContext2D, x: number, y: number) => {
      g.strokeStyle = 'rgba(50,40,30,0.16)';
      g.lineWidth = 1.4;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(x, y);
      g.lineTo(x + 7, y + 4);
      g.lineTo(x + 10, y + 11);
      g.moveTo(x + 7, y + 4);
      g.lineTo(x + 13, y + 5);
      g.stroke();
    };

    const G1 = '#5d7a3c';
    const G2 = '#7a9a4e';
    const bake = (family: string, painters: ((g: CanvasRenderingContext2D) => void)[]) => {
      this.groundLife.set(
        family,
        painters.map((paint) => {
          const { cv, g } = surface(S, S);
          paint(g);
          return cv;
        }),
      );
    };

    bake('green', [
      (g) => { sprig(g, 22, 40, G1, G2); sprig(g, 40, 30, G1, G2, 0.8); },
      (g) => { flower(g, 30, 32, '#efe9d4', '#d9a441'); sprig(g, 44, 44, G1, G2, 0.8); },
      (g) => { clover(g, 24, 36, 'rgba(74,102,52,0.55)'); clover(g, 40, 26, 'rgba(74,102,52,0.4)'); },
      (g) => { flower(g, 40, 40, '#d9a441', '#b5713f'); },
      (g) => { sprig(g, 18, 30, G1, G2); sprig(g, 34, 44, G1, G2, 0.9); sprig(g, 46, 26, G1, G2, 0.7); },
      (g) => { flower(g, 24, 28, '#c9a9d9', '#8a6b9a'); sprig(g, 42, 42, G1, G2, 0.8); },
    ]);
    bake('earth', [
      (g) => { pebble(g, 26, 36, 4, '#8d8578'); pebble(g, 36, 42, 2.8, '#9a9184'); },
      (g) => { straw(g, 20, 34, 'rgba(200,169,94,0.6)'); },
      (g) => { pebble(g, 40, 28, 3.2, '#8d8578'); straw(g, 18, 44, 'rgba(200,169,94,0.45)'); },
      (g) => { crack(g, 24, 26); },
      (g) => { pebble(g, 22, 40, 2.6, '#97836d'); pebble(g, 30, 34, 3.6, '#8d8578'); pebble(g, 41, 41, 2.2, '#9a9184'); },
      (g) => { sprig(g, 44, 36, 'rgba(122,138,84,0.7)', 'rgba(150,164,104,0.7)', 0.7); },
    ]);
    bake('sand', [
      (g) => { shell(g, 30, 38, '#d8c8ae', 'rgba(150,130,105,0.5)'); },
      (g) => { pebble(g, 24, 32, 3, '#b8a88e'); pebble(g, 40, 44, 2.2, '#c4b49a'); },
      (g) => {
        g.strokeStyle = 'rgba(255,252,240,0.22)';
        g.lineWidth = 2;
        g.lineCap = 'round';
        g.beginPath();
        g.moveTo(16, 34); g.quadraticCurveTo(28, 30, 40, 34);
        g.stroke();
      },
      (g) => { shell(g, 42, 28, '#c9b295', 'rgba(140,120,95,0.5)'); pebble(g, 22, 44, 2.4, '#b8a88e'); },
      (g) => { pebble(g, 34, 36, 2, '#7fa8a0'); },
      (g) => { shell(g, 26, 42, '#d8c8ae', 'rgba(150,130,105,0.5)'); },
    ]);
    bake('stone', [
      (g) => { sprig(g, 30, 40, 'rgba(86,116,52,0.95)', 'rgba(116,150,70,0.95)', 1.05); },
      (g) => { moss(g, 24, 44, 8); sprig(g, 30, 46, 'rgba(86,116,52,0.8)', 'rgba(116,150,70,0.8)', 0.7); },
      (g) => { crack(g, 30, 28); },
      (g) => { moss(g, 44, 26, 6); sprig(g, 20, 38, 'rgba(86,116,52,0.9)', 'rgba(116,150,70,0.9)', 0.85); },
      (g) => {
        g.fillStyle = 'rgba(239,233,212,0.5)';
        g.beginPath(); g.ellipse(28, 34, 2.4, 1.6, 0.4, 0, Math.PI * 2); g.fill();
        g.beginPath(); g.ellipse(38, 42, 2, 1.4, -0.6, 0, Math.PI * 2); g.fill();
      },
      (g) => { sprig(g, 46, 30, 'rgba(93,122,60,0.7)', 'rgba(122,154,78,0.7)', 0.7); },
    ]);
  }

  /**
   * Boundary feathering, part one: the masks.
   *
   * Every map paints its ground by rule — `y >= 26 is sand` — so every seam
   * between two materials is a ruled full-width line, and a frame full of
   * them reads as a bar chart. These masks are the cure: a soft ragged tongue
   * reaching in from one edge of a cell, five depths deep, four directions.
   * Cut a neighbouring material to one of them and the seam grows fingers.
   * Baked once; the choice per cell is hashed, so the coastline never moves.
   */
  private bakeSpillMasks() {
    for (let dir = 0; dir < 4; dir++) {
      const set: HTMLCanvasElement[] = [];
      for (let v = 0; v < SPILL_DEPTHS.length; v++) {
        const { cv, g } = surface(S, S);
        const depth = (SPILL_DEPTHS[v] ?? 0.5) * S;
        const r = new Rng(v * 9176 + dir * 613 + 29);
        g.save();
        g.translate(S / 2, S / 2);
        g.rotate((dir * Math.PI) / 2);
        g.translate(-S / 2, -S / 2);
        // A sliver along the whole edge, so however deep two neighbours reach
        // the seam itself never breaks into dashes.
        const grad = g.createLinearGradient(0, 0, 0, 8);
        grad.addColorStop(0, 'rgba(255,255,255,0.85)');
        grad.addColorStop(1, 'rgba(255,255,255,0)');
        g.fillStyle = grad;
        g.fillRect(0, 0, S, 9);
        // Then lobes, not a band. A band gives every cell the same square
        // shoulders and the seam comes out as brickwork; a lobe tapers to
        // nothing at the cell's own sides, so a deep cell beside a shallow one
        // reads as two bulges of a wandering edge rather than as a step.
        const lobe = (x: number, reach: number, soft: number) => {
          const rad = Math.max(6, reach * 1.15);
          const cyc = -reach * 0.22;
          const lg = g.createRadialGradient(x, cyc, rad * 0.12, x, cyc, rad);
          lg.addColorStop(0, 'rgba(255,255,255,1)');
          lg.addColorStop(soft, 'rgba(255,255,255,0.9)');
          lg.addColorStop(1, 'rgba(255,255,255,0)');
          g.fillStyle = lg;
          g.fillRect(x - rad, cyc - rad, rad * 2, rad * 2);
        };
        lobe(S * (0.28 + r.next() * 0.44), depth, 0.42 + r.next() * 0.2);
        lobe(S * (r.next() * 0.5 - 0.1), depth * (0.25 + r.next() * 0.4), 0.38);
        lobe(S * (0.6 + r.next() * 0.5), depth * (0.25 + r.next() * 0.4), 0.38);
        g.restore();
        set.push(cv);
      }
      this.spillMasks.push(set);
    }
  }

  /**
   * Boundary feathering, part two: one neighbouring material, already cut to
   * one mask. Composed on demand and kept, so a seam costs one drawImage.
   */
  private spillTile(kind: string, dir: number, mask: number, variant: number): HTMLCanvasElement | null {
    // Keyed on the art, not the kind: an interior floor is re-skinned per map.
    const key = `${this.tiles.artName(kind)}|${dir}|${mask}|${variant}`;
    const hit = this.spillCache.get(key);
    if (hit !== undefined) return hit;
    const src = this.tiles.groundImage(kind, variant);
    const m = this.spillMasks[dir]?.[mask];
    let out: HTMLCanvasElement | null = null;
    if (src && m) {
      const { cv, g } = surface(S, S);
      g.drawImage(src, 0, 0);
      g.globalCompositeOperation = 'destination-in';
      g.drawImage(m, 0, 0);
      out = cv;
    }
    this.spillCache.set(key, out);
    return out;
  }

  /** Chapters bring their own weather. */
  registerMoods(specs: Record<string, MoodPaint>) {
    for (const [name, s] of Object.entries(specs)) {
      this.atmospheres[name] = makeAtmosphere(s.top, s.mid, s.bottom, s.vig, s.glow);
      if (s.noClouds) this.noClouds.add(name);
    }
  }

  setMood(mood: Mood) {
    this.mood = mood;
  }

  /** Set by the world when the sky is actually open, whatever the mood. */
  setRaining(on: boolean) {
    this.raining = on;
  }

  /**
   * Force the ambient flier species for the current map, or null to let the
   * mood decide (gulls on coasts, pigeons in Delhi, songbirds inland).
   */
  setFlierKind(kind: 'gull' | 'songbird' | 'pigeon' | 'butterfly' | null) {
    this.flierKind = kind;
  }

  /** 0 = full day, 1 = deep night; gates the fireflies. */
  setNight(k: number) {
    this.nightK = k;
    this.refreshSun();
  }

  /**
   * The sun crosses the sky. Morning throws shadows one way, noon pulls them
   * short, evening throws them the other, and then it sets. Between 0.60 and
   * 0.72 the last of the direct light leaves the world; after that the only
   * light with a direction is the one coming out of somebody's window, and a
   * night frame belongs entirely to its lamps.
   */
  setSun(dayT: number) {
    this.dayT = dayT;
    this.sunD = Math.max(0, Math.min(1, (dayT - 0.02) / 0.58));
    const k = Math.max(0, Math.min(1, (dayT - 0.6) / 0.12));
    this.sunUp = 1 - k * k * (3 - 2 * k); // smoothstep out, no kink at either end
    this.refreshSun();
  }

  /**
   * Everything the hour decides about light, worked out once when the clock
   * moves rather than once a frame: nothing below allocates, and no gradient
   * is built after boot.
   *
   * The throw is cot(altitude), not a ramp — that is what makes a low sun run
   * five times noon rather than one and a half, and it is the difference
   * between golden hour reading as a direction and reading as a filter. The
   * colour goes with it: high sun casts a near-neutral shadow, low sun casts a
   * cold one, because the only light left in it is the sky's.
   */
  private sunQ = -1;
  private refreshSun() {
    // The clock ticks every frame and the light barely moves: quantise, so the
    // one string this builds is built a few hundred times a day, not 60 times
    // a second. Nothing in the draw path allocates.
    const q =
      Math.round(this.sunD * 400) * 4096 +
      Math.round(this.sunUp * 63) * 64 +
      Math.round(this.nightK * 63);
    if (q === this.sunQ) return;
    this.sunQ = q;
    const d = this.sunD;
    const c = Math.cos(Math.PI * d);
    this.sunSkew = -c * 0.75;
    this.sunLen = 0.55 + Math.abs(c) * 0.9 + this.nightK * 0.3;

    const alt = Math.max(0.06, Math.sin(Math.PI * d));
    const ang = ((10 + alt * 68) * Math.PI) / 180;
    const len = Math.max(0.45, Math.min(2.6, 0.9 / Math.tan(ang)));
    // Away from the sun: swinging east to west across the day, always leaning
    // a little down-screen so the shadow lands on ground the player can read.
    this.castX = this.sunSkew * len * 1.05;
    this.castY = 0.2 * len + 0.1;

    const cool = Math.max(0, Math.min(1, 0.34 + (1 - alt) * 0.56));
    const mix = (warm: number, cold: number) => Math.round(warm + (cold - warm) * cool);
    const r = mix(56, 40);
    const g = mix(43, 42);
    const b = mix(28, 76);
    this.shadowRGB = `rgb(${r},${g},${b})`;
    // Long shadows are more penumbra than umbra; and once the sun is down
    // there is nothing left to throw one, so the whole pass goes out with it
    // rather than leaving grey wedges lying across the lamplight all night.
    this.shadowA =
      0.3 * (1 - Math.min(0.32, (len - 0.45) * 0.16)) * (1 - this.nightK * 0.62) * this.sunUp;
  }

  /**
   * True when the sun's own pass is running: outdoors, with the sun still up.
   * When it is not, every sprite's little contact shadow goes back to being
   * the whole of its shadow, at the weight it carried before the pass existed.
   */
  private get sunPassOn(): boolean {
    return this.shadowA >= 0.02 && this.mood !== 'interior';
  }

  private contactA(lit: number, unlit: number): number {
    return this.sunPassOn ? lit : unlit;
  }

  /** The current map's fires, for warming the near side of whoever stands close. */
  setFires(cells: [number, number][]) {
    this.fires = cells;
  }

  /** Advance ambient animation. Called from the fixed-timestep update. */
  tick(dt: number) {
    this.time += dt;
    this.frameDt = dt;
    if (this.flock) {
      this.flock.t += dt;
      if (this.flock.t > this.flock.dur) this.flock = null;
    } else {
      this.flockWait -= dt;
      if (this.flockWait <= 0) this.trySpawnFlock();
    }
    for (const e of this.emotes) e.t += dt;
    this.emotes = this.emotes.filter((e) => e.t < EMOTE_DUR);
    for (const p of this.puffs) p.t += dt;
    this.puffs = this.puffs.filter((p) => p.t < PUFF_DUR);
    for (const p of this.party) {
      p.t += dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.kind === 'sparkle') {
        p.vx *= 1 - dt * 3;
        p.vy *= 1 - dt * 3;
      } else {
        p.vy += 26 * dt; // low gravity: flutter, not fall
        p.x += Math.sin(p.t * 3 + p.spin * 5) * 14 * dt;
      }
    }
    this.party = this.party.filter((p) => p.t < p.life);
    for (const [a, t] of this.waves) {
      if (t - dt <= 0) this.waves.delete(a);
      else this.waves.set(a, t - dt);
    }
    for (const [a, t] of this.bounces) {
      if (t - dt <= 0) this.bounces.delete(a);
      else this.bounces.set(a, t - dt);
    }
  }

  /** A raised-arm hello, played as dialogue opens. */
  wave(actor: Actor) {
    this.waves.set(actor, 0.9);
  }

  /** A happy little hop (petting, gifts, good news). */
  bounce(actor: Actor) {
    this.bounces.set(actor, 0.45);
  }

  /** The actor currently mid-sentence, or null. */
  setSpeaker(actor: Actor | null) {
    this.speaker = actor;
  }

  /** World tile that would respond to the action button, or null. */
  setHint(cell: [number, number] | null) {
    this.hint = cell;
  }

  /** Pop a little thought bubble over someone's head. */
  emote(actor: Actor, kind: '!' | '♥' | '♪' | '?') {
    this.emotes = this.emotes.filter((e) => e.actor !== actor);
    this.emotes.push({ actor, kind, t: 0 });
  }

  /**
   * Cozy celebration burst at a world position. Sparkles: a small ring, no
   * gravity, half a second. Petals: a slow flutter with sine drift, seconds.
   * Per the cookbook: overshoot small, gravity low, nothing startles.
   */
  burst(wx: number, wy: number, kind: 'sparkle' | 'petal', hues: string[] = ['#f2e6d0']) {
    const n = kind === 'sparkle' ? 10 : 16;
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + Math.random() * 0.5;
      const sp = kind === 'sparkle' ? 26 + Math.random() * 18 : 8 + Math.random() * 16;
      this.party.push({
        x: wx,
        y: wy,
        vx: Math.cos(a) * sp,
        vy: kind === 'sparkle' ? Math.sin(a) * sp : -14 - Math.random() * 18,
        t: 0,
        life: kind === 'sparkle' ? 0.55 : 1.8 + Math.random() * 1.2,
        kind,
        hue: hues[i % hues.length] ?? '#f2e6d0',
        spin: (Math.random() - 0.5) * 3,
      });
    }
  }

  /** Kick up dust at a tile a foot just left. */
  puffAt(cx: number, cy: number) {
    this.puffs.push({ x: cx * TILE + TILE / 2, y: cy * TILE + TILE - 2, t: 0 });
  }

  /**
   * Every so often something crosses the sky: gulls on the coast, pigeons in
   * Delhi, songbirds inland, butterflies low over daytime grass. Spawning is
   * deterministic-ish (hashed off a running sequence number); drawing is a
   * handful of baked frames, so a flock costs six drawImages.
   */
  private trySpawnFlock() {
    const seq = this.flockSeq++;
    const h = (salt: number) => cellHash(seq, 0, salt);
    const wait = (this.flierEvery ?? 20 + h(97) * 30);
    this.flockWait = Math.min(wait, 10); // retry soon if conditions refuse below
    if (typeof document !== 'undefined' && document.body.classList.contains('reduce-motion')) return;
    if (NO_FLIER_MOODS.has(this.mood)) return;
    if (this.nightK > 0.55) return; // deep night skies stay still

    let kind: FlierKind = PIGEON_MOODS.has(this.mood)
      ? 'pigeon'
      : GULL_MOODS.has(this.mood)
        ? 'gull'
        : this.nightK < 0.15 && h(11) < 0.4
          ? 'butterfly'
          : 'songbird';
    if (this.flierKind) kind = this.flierKind;

    const butterfly = kind === 'butterfly';
    const n = butterfly ? 2 + Math.floor(h(17) * 2) : 3 + Math.floor(h(17) * 4);
    const sign: 1 | -1 = h(19) < 0.5 ? 1 : -1;
    const birds: Flock['birds'] = [];
    for (let i = 0; i < n; i++) {
      birds.push({
        // A loose trailing vee: each bird hangs back and steps outward.
        ox: -sign * i * (butterfly ? 60 + h(29 + i) * 50 : 30 + h(29 + i) * 26),
        oy: (i % 2 ? -1 : 1) * Math.ceil(i / 2) * (butterfly ? 26 : 15) + (h(41 + i) - 0.5) * 12,
        ph: h(53 + i) * Math.PI * 2,
        sc: 0.82 + h(67 + i) * 0.3,
      });
    }
    this.flock = {
      kind,
      t: 0,
      dur: butterfly ? 17 : kind === 'gull' ? 10.5 : kind === 'pigeon' ? 8.5 : 7.5,
      sign,
      y0: butterfly ? H * (0.5 + h(23) * 0.34) : H * (0.09 + h(23) * 0.3),
      birds,
    };
    this.flockWait = wait;
  }

  /** The current flock, drawn in the sky layer: above world, under the vignette. */
  private drawFliers() {
    const f = this.flock;
    if (!f) return;
    const ctx = this.ctx;
    const frames = this.flierFrames[f.kind];
    if (!frames.length) return;
    const M = 160;
    const head = -M + (f.t / f.dur) * (W + 2 * M);
    const xBase = f.sign > 0 ? head : W - head;
    const fade = Math.min(1, f.t / 0.8, (f.dur - f.t) / 0.8);
    const butterfly = f.kind === 'butterfly';
    const flapHz = f.kind === 'gull' ? 3.4 : f.kind === 'pigeon' ? 6.2 : butterfly ? 0 : 7.6;
    for (const b of f.birds) {
      let x = xBase + b.ox;
      let y = f.y0 + b.oy + Math.sin(this.time * 1.3 + b.ph) * (butterfly ? 10 : 5);
      let idx: number;
      if (butterfly) {
        // Butterflies do not travel so much as get carried.
        x += Math.sin(this.time * 0.7 + b.ph) * 26;
        y += Math.sin(this.time * 1.9 + b.ph * 2) * 14;
        idx = [0, 1, 2, 1][Math.floor(this.time * 8 + b.ph * 4) % 4] ?? 0;
      } else {
        // Flap with a glide in it: hold the upstroke, snap through the middle.
        const s = Math.sin(this.time * flapHz + b.ph * 6);
        idx = s > 0.35 ? 0 : s < -0.35 ? 2 : 1;
      }
      const img = frames[idx];
      if (!img) continue;
      if (x < -M || x > W + M) continue;
      const w = img.width * b.sc;
      const hh = img.height * b.sc;
      // A faint shadow trailing below is what says "in the air, not on the
      // ground"; butterflies fly low, so theirs sits close.
      const drop = butterfly ? 16 : 46;
      ctx.globalAlpha = fade * (butterfly ? 0.1 : 0.08);
      ctx.drawImage(this.shadowBlob, x - w * 0.3 + 5, y + drop, w * 0.6, w * 0.22);
      ctx.save();
      ctx.globalAlpha = fade * (butterfly ? 0.95 : 0.9);
      ctx.translate(x, y);
      if (f.sign < 0) ctx.scale(-1, 1);
      ctx.drawImage(img, -w / 2, -hh / 2, w, hh);
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  }

  drawWorld(map: TileMap, cam: Camera, sprites: Sprite[]) {
    const ctx = this.ctx;
    // Which room we are in decides what its walls are made of. One lookup a
    // frame, and only when the map actually changed.
    this.tiles.setMap(map.id);
    const kindAt = (x: number, y: number) => (map.inBounds(x, y) ? map.ground(x, y).t : 'scree');

    const x0 = Math.floor(cam.x / TILE) - 3;
    const y0 = Math.floor(cam.y / TILE) - 5; // room for tall buildings above
    const x1 = Math.ceil((cam.x + VIEW_W) / TILE) + 3;
    const y1 = Math.ceil((cam.y + VIEW_H) / TILE) + 1;

    type TallEntry = { cx: number; cy: number; kind: string };
    const tall: TallEntry[] = [];

    this.buildFields(map, x0, y0, x1, y1);

    // Where everybody is, worked out once. Two passes want it now: the sun
    // lays their shadows down with the buildings' before the ground is
    // finished, then the depth sort draws them, and `renderPos` hands back a
    // fresh pair every time it is asked.
    const need = sprites.length * 2;
    if (this.spriteXY.length < need) this.spriteXY = new Float64Array(need + 32);
    for (let i = 0; i < sprites.length; i++) {
      const [px, py] = sprites[i]!.actor.renderPos();
      this.spriteXY[i * 2] = px;
      this.spriteXY[i * 2 + 1] = py;
    }

    // Pass 1a: seamless ground, then the seams between materials broken.
    for (let cy = y0; cy <= y1; cy++) {
      for (let cx = x0; cx <= x1; cx++) {
        const sx = (cx * TILE - cam.x) * A;
        const sy = (cy * TILE - cam.y) * A;
        const kind = kindAt(cx, cy);
        const group = WATERY.has(kind) ? WATERY : PATHY.has(kind) ? PATHY : null;
        const conn = group
          ? (dx: number, dy: number) => group.has(kindAt(cx + dx, cy + dy))
          : NEVER;
        this.tiles.drawGround(ctx, kind, sx, sy, cx, cy, conn, this.time);

        // Where two materials meet, each reaches into the other. Depth and
        // reach are hashed per cell and per side, so a straight generated
        // boundary comes out interlocked and no two cells agree on where it is.
        const fk = this.fi(cx, cy);
        // A path may be encroached on but never spills (it draws its own
        // rounded core); water and the outside of the world take part in
        // neither direction.
        if (fk < 0 || !this.fSeam[fk] || WATERY.has(kind) || kind === 'void' || kind === 'scree') {
          continue;
        }
        for (let d = 0; d < 4; d++) {
          const nx = cx + (d === 1 ? 1 : d === 3 ? -1 : 0);
          const ny = cy + (d === 0 ? -1 : d === 2 ? 1 : 0);
          const nk = this.fi(nx, ny);
          const other = nk >= 0 ? this.fKind[nk]! : kindAt(nx, ny);
          if (other === kind) continue;
          const pick = cellHash(cx, cy, 201 + d * 13);
          if (pick > 0.88) continue; // a few cells hold their line
          const img = this.spillTile(
            other,
            d,
            Math.floor(pick * 1.14 * SPILL_DEPTHS.length) % SPILL_DEPTHS.length,
            cellHash(cx, cy, 251 + d * 7) < 0.5 ? 0 : 1,
          );
          if (!img) continue;
          // Never at full strength: a seam is two materials arguing, not one
          // replacing the other tile by tile.
          ctx.globalAlpha = 0.82;
          ctx.drawImage(img, sx, sy);
          ctx.globalAlpha = 1;
        }
      }
    }

    // Pass 1b: large soft tonal patches spanning many tiles, so the land
    // breathes without any per-tile seams, and under them the record of use.
    this.groundTint(map, cam, x0, y0, x1, y1);
    this.groundWear(map, cam, x0, y0, x1, y1);

    // Pass 1b2: the water is alive. Sun glints ride the swell by day, and a
    // breathing line of foam works every edge where the sea meets land.
    this.drawWaterLife(map, cam, x0, y0, x1, y1, kindAt);

    // Pass 1b3: ground life, clustered. A uniform probability makes static,
    // and static is invisible; growth gathers at wall bases, in the joints of
    // a seam and along a tide line, and the middle of a thoroughfare stays
    // bare because feet keep it bare.
    ctx.globalAlpha = 1 - this.nightK * 0.6;
    for (let cy = y0; cy <= y1; cy++) {
      for (let cx = x0; cx <= x1; cx++) {
        if (!map.inBounds(cx, cy) || map.object(cx, cy)) continue;
        const family = LIFE_FAMILY[kindAt(cx, cy)];
        if (!family) continue;
        const fk = this.fi(cx, cy);
        if (fk < 0) continue;
        const ds = this.dSolid[fk]!;
        if (ds === 0) continue;
        const dw = this.dWater[fk]!;
        let dens = LIFE_DENSITY[family] ?? 0;
        dens *= ds === 1 ? 2.8 : ds === 2 ? 1.3 : ds === 3 ? 0.55 : 0.16;
        if (this.fSeam[fk]) dens *= 2.0;
        if (dw <= 1) dens *= family === 'sand' ? 3.0 : 1.5;
        else if (dw === 2) dens *= 1.3;
        if (cellHash(cx, cy, 131) >= dens) continue;
        const stamps = this.groundLife.get(family);
        if (!stamps?.length) continue;
        const pick = stamps[Math.floor(cellHash(cx, cy, 137) * stamps.length)];
        if (!pick) continue;
        const jx = (cellHash(cx, cy, 139) - 0.5) * 14;
        const jy = (cellHash(cx, cy, 149) - 0.5) * 10;
        ctx.drawImage(pick, (cx * TILE - cam.x) * A + jx, (cy * TILE - cam.y) * A + jy);
      }
    }
    ctx.globalAlpha = 1;

    // Pass 1b3b: and a ceiling on the ones that blow out.
    this.capGround();

    // Pass 1b4: and then the sun lays every standing thing across all of it,
    // the people included.
    this.drawCastShadows(map, cam, x0, y0, x1, y1, sprites);

    // Pass 1c: contact shade and walkable decor.
    for (let cy = y0; cy <= y1; cy++) {
      for (let cx = x0; cx <= x1; cx++) {
        const sx = (cx * TILE - cam.x) * A;
        const sy = (cy * TILE - cam.y) * A;
        if (!map.inBounds(cx, cy)) continue;

        const self = map.object(cx, cy);
        if (!self?.solid) {
          // Anything wall-like above shades the foot of its own near side.
          const above = map.object(cx, cy - 1);
          if (above?.solid && above.tall) ctx.drawImage(this.wallShadeStrip, sx, sy);
          // And the ground running into its far side goes dark before it gets
          // there. This is the whole depth cue for a roof that reaches the row
          // below you: without it the ridge lands at your feet and you read as
          // standing on the thatch.
          const below = map.object(cx, cy + 1);
          if (below?.solid && below.tall) ctx.drawImage(this.northContact, sx, sy + S - 26);
        }

        const obj = self;
        if (!obj) continue;
        if (obj.t === 'blocked') continue;
        if (obj.tall) tall.push({ cx, cy, kind: obj.t });
        else this.tiles.drawFlat(ctx, obj.t, sx, sy, cx, cy, this.time);
      }
    }

    // Pass 2: actors and tall objects, interleaved by depth.
    type Layer = { sort: number; draw: () => void };
    const layers: Layer[] = [];

    // Fires into screen space once per frame for the warm-side pass.
    this.fireScreen = this.fires.map(([fx, fy]) => [
      (fx * TILE + TILE / 2 - cam.x) * A,
      (fy * TILE + TILE / 2 - cam.y) * A,
    ]);

    const watery = (k: string) => k === 'sea' || k === 'water';
    // Note where the player stands (screen space) so idle NPCs can notice.
    let pi = sprites.findIndex((s) => s.isPlayer);
    if (pi < 0 && sprites.length) pi = 0;
    if (pi >= 0) {
      this.playerSX = (this.spriteXY[pi * 2]! - cam.x) * A;
      this.playerSY = (this.spriteXY[pi * 2 + 1]! - cam.y) * A;
    }
    sprites.forEach((s, i) => {
      const px = this.spriteXY[i * 2]!;
      const py = this.spriteXY[i * 2 + 1]!;
      const bx = Math.round(px / TILE);
      const by = Math.round(py / TILE);
      // Standing at the water's edge, you are in the water too, upside down.
      const reflect = watery(kindAt(bx, by + 1))
        ? { x: (bx * TILE - cam.x) * A - S * 0.5, y: ((by + 1) * TILE - cam.y) * A, w: S * 2, h: S * 1.5 }
        : null;
      layers.push({
        sort: py / TILE,
        draw: () => this.drawSprite(s, (px - cam.x) * A, (py - cam.y) * A, i, reflect),
      });
    });
    for (const t of tall) {
      layers.push({
        sort: t.cy + 0.5,
        draw: () => {
          const tx = (t.cx * TILE - cam.x) * A;
          const ty = (t.cy * TILE - cam.y) * A;
          // The sun's own throw is laid down by drawCastShadows; what is left
          // for each sprite here is the contact darkness at its own feet.
          // Where that pass does not run, indoors and after the sun is down,
          // this pool is the whole shadow again, at its old weight, because a
          // teahouse floor with nothing on it is flatter than one with.
          if (t.kind === 'tree' || t.kind === 'palm') {
            this.castShadow(tx + S / 2, ty + S - 8, 44, this.contactA(0.13, 0.2));
            this.drawDapple(tx + S / 2, ty + S - 8, t.cx, t.cy);
          } else if (this.tiles.isBuilding(t.kind)) {
            this.castShadow(tx + S * 2.2, ty + S - 4, 108, this.contactA(0.1, 0.16));
            // A house sprite is four tiles of art on a five-tile footprint, so
            // the row above it is solid with nothing painted on it and reads
            // as open street. Where the map agrees that row is solid, give it
            // the building's own roof; where it does not, leave the ground be.
            if (this.footprintCapped(map, t.kind, t.cx, t.cy)) {
              this.tiles.drawBuildingCap(ctx, t.kind, tx, ty, t.cx, t.cy);
            }
          } else if (this.tiles.castsSun(t.kind)) {
            this.castShadow(tx + S / 2, ty + S - 6, 30, this.contactA(0.12, 0.18));
          }
          if (!this.tiles.isBuilding(t.kind) && watery(kindAt(t.cx, t.cy + 1))) {
            this.reflectTall(t.kind, tx, ty, t.cx, t.cy, cam);
          }
          this.tiles.drawTall(ctx, t.kind, tx, ty, t.cx, t.cy);
        },
      });
    }
    layers.sort((a, b) => a.sort - b.sort);
    for (const l of layers) l.draw();

    // The quiet cursor of curiosity: a breathing dot over what would answer.
    if (this.hint) {
      const [hx, hy] = this.hint;
      const x = (hx * TILE + TILE / 2 - cam.x) * A;
      const y = (hy * TILE - cam.y) * A - 10;
      const pulse = 0.5 + Math.sin(this.time * 3.2) * 0.5;
      ctx.save();
      ctx.globalAlpha = 0.4 + pulse * 0.3;
      ctx.fillStyle = '#f2e6d0';
      ctx.strokeStyle = 'rgba(38,26,16,0.6)';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.arc(x, y - pulse * 3, 3.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    this.drawPuffs(cam);
    this.drawParty(cam);
    this.drawEmotes(cam);
    this.drawSmoke(map, cam);
    if (this.mood !== 'interior') {
      // Fog-lid moods have no sky to cast cloud shadows from.
      if (this.nightK < 0.5 && !this.noClouds.has(this.mood)) this.drawClouds(map, cam);
      this.drawLeaves(map, cam);
      if (this.nightK > 0.4) this.drawFireflies(map, cam);
      this.drawFliers();
    }
    this.drawMotes(map, cam);
    this.drawWeather(map, cam);
    const atm = this.atmospheres[this.mood] ?? this.atmospheres['warm'];
    if (atm) ctx.drawImage(atm, 0, 0);

  }

  /**
   * The visible window's three fields, rebuilt once a frame and read by every
   * pass that needs to know what a cell is *near*: how far to the nearest
   * solid thing, how far to water, and whether a ground seam runs through it.
   *
   * This is what turns a flat probability into a place. Weeds want wall bases
   * and seams; shells want the tide line; the middle of a thoroughfare wants
   * to stay bare, because feet keep it bare. Two chamfer sweeps over some six
   * hundred cells, into arrays allocated once.
   */
  private buildFields(map: TileMap, x0: number, y0: number, x1: number, y1: number) {
    const w = x1 - x0 + 1;
    const h = y1 - y0 + 1;
    const n = w * h;
    if (this.dSolid.length < n) {
      this.dSolid = new Uint8Array(n);
      this.dWater = new Uint8Array(n);
      this.fSeam = new Uint8Array(n);
      this.fKind = new Array<string>(n).fill('void');
    }
    this.fx0 = x0;
    this.fy0 = y0;
    this.fw = w;
    this.fh = h;
    const CAP = 9;
    for (let j = 0; j < h; j++) {
      for (let i = 0; i < w; i++) {
        const cx = x0 + i;
        const cy = y0 + j;
        const k = j * w + i;
        const inb = map.inBounds(cx, cy);
        const g = inb ? map.ground(cx, cy) : null;
        const kind = g ? g.t : 'void';
        this.fKind[k] = kind;
        const solid = !inb || g?.solid === true || map.object(cx, cy)?.solid === true;
        this.dSolid[k] = solid ? 0 : CAP;
        this.dWater[k] = WATERY.has(kind) ? 0 : CAP;
        this.fSeam[k] = 0;
      }
    }
    // Chamfer, both ways. Four-neighbour distance is close enough for a field
    // nobody measures and half the cost of the eight-neighbour one.
    for (let j = 0; j < h; j++) {
      for (let i = 0; i < w; i++) {
        const k = j * w + i;
        const up = j > 0 ? k - w : -1;
        const lf = i > 0 ? k - 1 : -1;
        let s = this.dSolid[k]!;
        let a = this.dWater[k]!;
        if (up >= 0) { s = Math.min(s, this.dSolid[up]! + 1); a = Math.min(a, this.dWater[up]! + 1); }
        if (lf >= 0) { s = Math.min(s, this.dSolid[lf]! + 1); a = Math.min(a, this.dWater[lf]! + 1); }
        this.dSolid[k] = s;
        this.dWater[k] = a;
      }
    }
    for (let j = h - 1; j >= 0; j--) {
      for (let i = w - 1; i >= 0; i--) {
        const k = j * w + i;
        const dn = j < h - 1 ? k + w : -1;
        const rt = i < w - 1 ? k + 1 : -1;
        let s = this.dSolid[k]!;
        let a = this.dWater[k]!;
        if (dn >= 0) { s = Math.min(s, this.dSolid[dn]! + 1); a = Math.min(a, this.dWater[dn]! + 1); }
        if (rt >= 0) { s = Math.min(s, this.dSolid[rt]! + 1); a = Math.min(a, this.dWater[rt]! + 1); }
        this.dSolid[k] = s;
        this.dWater[k] = a;
        // Seams, marked on both sides at once.
        const kind = this.fKind[k];
        if (rt >= 0 && this.fKind[rt] !== kind) { this.fSeam[k] = 1; this.fSeam[rt] = 1; }
        if (dn >= 0 && this.fKind[dn] !== kind) { this.fSeam[k] = 1; this.fSeam[dn] = 1; }
      }
    }
  }

  /** Field index for a world cell, or -1 outside this frame's window. */
  private fi(cx: number, cy: number): number {
    const i = cx - this.fx0;
    const j = cy - this.fy0;
    if (i < 0 || j < 0 || i >= this.fw || j >= this.fh) return -1;
    return j * this.fw + i;
  }

  /**
   * How tall every cell of this map stands, in tiles, spread across whole
   * footprints so a five-by-five house throws one shadow and not one from the
   * single cell that happens to carry its sprite. Worked out once per map.
   */
  private casterHeights(map: TileMap): { h: Float32Array; foot: Float32Array } {
    const hit = this.casterCache.get(map.id);
    if (hit) return hit;
    const grid = new Float32Array(map.w * map.h);
    const foot = new Float32Array(map.w * map.h).fill(1);
    const tallHere: boolean[] = new Array(map.w * map.h).fill(false);
    for (let y = 0; y < map.h; y++) {
      for (let x = 0; x < map.w; x++) {
        const o = map.object(x, y);
        if (!o?.tall || o.solid !== true) continue;
        const k = y * map.w + x;
        tallHere[k] = true;
        grid[k] = this.tiles.castHeight(o.t);
        foot[k] = this.tiles.castFootprint(o.t);
      }
    }
    // The invisible collision cells of a building carry no art and so no
    // height; four dilations hand them their neighbour's roofline.
    for (let pass = 0; pass < 6; pass++) {
      let moved = false;
      for (let y = 0; y < map.h; y++) {
        for (let x = 0; x < map.w; x++) {
          const k = y * map.w + x;
          // Only cells with no art of their own inherit: a garden wall that
          // happens to touch a house is a garden wall, and must not be handed
          // the house's roofline and throw a three-storey shadow.
          if (!tallHere[k] || grid[k]! > 0) continue;
          let best = 0;
          if (x > 0 && tallHere[k - 1]) best = Math.max(best, grid[k - 1]! - 0.02);
          if (x < map.w - 1 && tallHere[k + 1]) best = Math.max(best, grid[k + 1]! - 0.02);
          if (y > 0 && tallHere[k - map.w]) best = Math.max(best, grid[k - map.w]! - 0.02);
          if (y < map.h - 1 && tallHere[k + map.w]) best = Math.max(best, grid[k + map.w]! - 0.02);
          if (best > grid[k]!) { grid[k] = best; moved = true; }
        }
      }
      if (!moved) break;
    }
    const out = { h: grid, foot };
    this.casterCache.set(map.id, out);
    return out;
  }

  /**
   * A ceiling on the ground.
   *
   * A hard coastal noon is meant to be bright, but La Caleta was putting a
   * sixth of the frame at pure white: sand near the top of the range, a pale
   * wear wash over it, then an ambient of 0xffffff and the bloom on top, and
   * everything above the ceiling is the same colour: a hole in the picture
   * where the drawing should be. One `darken` fill per frame, in the one mood
   * that reaches it, holds the ground under the ceiling in a warm tone, so the
   * light keeps its temperature and the cloud-break silhouette comes back.
   * Nothing dimmer than the cap is touched at all: measured on
   * `caleta-mid-day`, pixels at a saturated channel go 23.6% to 2.5% while
   * the mean only moves 165 to 151, because what it takes away is the part
   * that had stopped being a drawing.
   */
  private static readonly GROUND_CEILING: Record<string, string> = {
    glare: 'rgb(192,183,165)',
  };

  private capGround() {
    const cap = Renderer.GROUND_CEILING[this.mood];
    if (!cap || this.nightK > 0.3) return;
    const ctx = this.ctx;
    ctx.globalCompositeOperation = 'darken';
    ctx.fillStyle = cap;
    ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'source-over';
  }

  /**
   * The sun lays every standing thing on the ground.
   *
   * The old model was a sixteen-pixel strip under any wall, always straight
   * down, always the same length, whatever the hour. This one projects each
   * footprint cell along the sun's own throw and unions the lot: a building's
   * five-by-five plan swept along one vector is exactly its shadow, and the
   * union means no two cells double-darken their overlap.
   *
   * It composes into a fifth-scale buffer and blows it back up, which is one
   * screen composite for the whole frame's shadows and gives the soft edge the
   * painterly idiom needs without a blur or a per-frame gradient anywhere.
   *
   * People are in it too. A figure standing in a lit street with nothing but a
   * dot under her is the one thing in the frame disobeying the light, and the
   * dot sits on her shoes rather than on the ground she is standing on, which
   * is exactly what made her read as floating over a roofline. She goes into
   * the same union as the houses, agreeing with them in direction, length and
   * colour, and her shadow lands where her feet are.
   */
  private drawCastShadows(
    map: TileMap,
    cam: Camera,
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    sprites: Sprite[],
  ) {
    // No sun reaches a room; indoors the lamps and the wall shade do the work.
    if (!this.sunPassOn) return;
    const { h: grid, foot } = this.casterHeights(map);
    const { cv, g } = this.shadowBuf;
    const k = A / SH_DIV;
    const s = TILE * k;
    g.clearRect(0, 0, SHW, SHH);
    g.beginPath();
    let any = false;
    // The convex hull of a base rectangle and its translate: the exact shape a
    // footprint sweeps along the sun. One subpath per caster, all into the same
    // path, so overlapping casters can never double darken.
    const sweep = (bx: number, by: number, w: number, hgt: number, dx: number, dy: number) => {
      if (by + dy + hgt < 0 || by > SHH) return;
      if (bx + Math.min(0, dx) > SHW || bx + w + Math.max(0, dx) < 0) return;
      g.moveTo(bx, by);
      g.lineTo(bx + w, by);
      if (dx >= 0) {
        g.lineTo(bx + w + dx, by + dy);
        g.lineTo(bx + w + dx, by + dy + hgt);
        g.lineTo(bx + dx, by + dy + hgt);
        g.lineTo(bx, by + hgt);
      } else {
        g.lineTo(bx + w, by + hgt);
        g.lineTo(bx + w + dx, by + dy + hgt);
        g.lineTo(bx + dx, by + dy + hgt);
        g.lineTo(bx + dx, by + dy);
      }
      g.closePath();
      any = true;
    };
    for (let cy = y0 - SH_MY; cy <= y1; cy++) {
      if (cy < 0 || cy >= map.h) continue;
      const row = cy * map.w;
      const by = (cy * TILE - cam.y) * k;
      for (let cx = x0 - SH_MX; cx <= x1 + SH_MX; cx++) {
        if (cx < 0 || cx >= map.w) continue;
        const hh = grid[row + cx];
        if (!hh) continue;
        // The far end of each cell's throw wanders a little. Nothing else in
        // the union shows, so this is the whole cost of an edge that reads as
        // painted rather than ruled.
        const wob = TILE * k * 0.34;
        const dx = this.castX * hh * TILE * k + (cellHash(cx, cy, 181) - 0.5) * wob;
        const dy = Math.max(0, this.castY * hh * TILE * k + (cellHash(cx, cy, 191) - 0.5) * wob * 0.7);
        // A post stands on a base, not on the whole cell it occupies.
        const fp = foot[row + cx]!;
        const w = s * fp;
        const inset = (s - w) / 2;
        sweep((cx * TILE - cam.x) * k + inset, by + inset, w, w, dx, dy);
      }
    }
    // And the people. Their base is a shoe's width of ground at their feet,
    // and they are as tall as a person is next to a house.
    for (let i = 0; i < sprites.length; i++) {
      const sp = sprites[i]!;
      const hh =
        sp.rig === 'animal' ? ACTOR_H * 0.42 : sp.actor.pose === 'sit' ? ACTOR_H * 0.62 : ACTOR_H;
      const fx = (this.spriteXY[i * 2]! + TILE / 2 - cam.x) * k;
      const fy = (this.spriteXY[i * 2 + 1]! + TILE - 2 - cam.y) * k;
      const w = TILE * k * 0.68;
      const d = TILE * k * 0.48;
      sweep(fx - w / 2, fy - d / 2, w, d, this.castX * hh * TILE * k, this.castY * hh * TILE * k);
    }
    if (!any) return;
    g.fillStyle = this.shadowRGB;
    g.fill();
    const ctx = this.ctx;
    ctx.globalAlpha = this.shadowA;
    ctx.drawImage(cv, 0, 0, SHW, SHH, 0, 0, W, H);
    ctx.globalAlpha = 1;
  }

  /**
   * True when the whole footprint row above a building's art is solid object:
   * the row a 4-tile-tall sprite on a 5-tile-deep footprint can never paint.
   * Anything less than solid all the way across is somebody's walkable ground
   * and gets left exactly as it is.
   */
  private footprintCapped(map: TileMap, kind: string, cx: number, cy: number): boolean {
    const span = this.tiles.buildingSpan(kind);
    if (!span) return false;
    const y = cy - span.rows;
    if (!map.inBounds(cx, y)) return false;
    for (let i = 0; i < span.cols; i++) {
      if (map.object(cx + i, y)?.solid !== true) return false;
    }
    return true;
  }

  /** World-anchored tonal patches, keyed to a coarse grid so they never move. */
  private groundTint(map: TileMap, cam: Camera, x0: number, y0: number, x1: number, y1: number) {
    const ctx = this.ctx;
    // Two octaves of gouache: broad warm/cool washes the size of a meadow,
    // then the familiar smaller patches. Flat fields stop being flat.
    const TINTS = [
      this.tintPatches[0]!, // dry shadowed earth
      this.tintPatches[1]!, // sun-bleached
      this.tintPatches[2]!, // faint green flush
      this.tintPatches[3]!, // iron warmth
    ];
    const octave = (cell: number, salt: number, rBase: number, rVar: number, boost: number) => {
      const gy0 = Math.floor(y0 / cell) - 1;
      const gy1 = Math.floor(y1 / cell) + 1;
      const gx0 = Math.floor(x0 / cell) - 1;
      const gx1 = Math.floor(x1 / cell) + 1;
      for (let gy = gy0; gy <= gy1; gy++) {
        for (let gx = gx0; gx <= gx1; gx++) {
          const h = cellHash(gx, gy, salt);
          if (h > 0.62) continue;
          const tint = TINTS[Math.floor(h * 40) % TINTS.length] ?? TINTS[0]!;
          const wx = (gx * cell + cell / 2 + (cellHash(gx, gy, salt + 3) - 0.5) * cell) * TILE;
          const wy = (gy * cell + cell / 2 + (cellHash(gx, gy, salt + 7) - 0.5) * cell) * TILE;
          // Skip patches centered outside the map so scree stays calm.
          if (!map.inBounds(Math.floor(wx / TILE), Math.floor(wy / TILE))) continue;
          const x = (wx - cam.x) * A;
          const y = (wy - cam.y) * A;
          const r = (rBase + cellHash(gx, gy, salt + 11) * rVar) * TILE * A;
          ctx.globalAlpha = boost;
          ctx.drawImage(tint, x - r, y - r, r * 2, r * 2);
        }
      }
    };
    octave(9, 131, 5.5, 4.5, 1); // the meadow-scale washes
    // A room's floor is swept. Outdoors the close-up octave was replaced by
    // `groundWear`, which knows about tide damp, grime banked against a wall
    // and lanes worn by feet, none of which is true of a tea house, where it
    // only ever put a dark rim around the room and took the contrast out of
    // the floor. Indoors, the old dapple stays.
    if (this.mood === 'interior') octave(4, 101, 2.2, 2.4, 0.9);
    ctx.globalAlpha = 1;
  }

  /**
   * What has happened here.
   *
   * The close-up octave of `groundTint` used to be pure hash: the same amount
   * of information everywhere, which is the same as none. This replaces it at
   * the same cost with a field that knows the map — damp within reach of the
   * water, grime banked against the walls, and the pale worn lanes where feet
   * have crossed a square for years. Five to fifteen tiles across, which is
   * the scale a two-hundred-tile piazza is empty at; twelve-pixel sprigs were
   * never going to fill it.
   */
  private groundWear(map: TileMap, cam: Camera, x0: number, y0: number, x1: number, y1: number) {
    if (this.mood === 'interior') return; // a floor is not a street
    const ctx = this.ctx;
    const damp = this.wearBlobs[0];
    const worn = this.wearBlobs[1];
    const grime = this.wearBlobs[2];
    if (!damp || !worn || !grime) return;
    const cell = 4;
    for (let gy = Math.floor(y0 / cell) - 1; gy <= Math.floor(y1 / cell) + 1; gy++) {
      for (let gx = Math.floor(x0 / cell) - 1; gx <= Math.floor(x1 / cell) + 1; gx++) {
        const h = cellHash(gx, gy, 101);
        const wx = gx * cell + cell / 2 + (cellHash(gx, gy, 104) - 0.5) * cell;
        const wy = gy * cell + cell / 2 + (cellHash(gx, gy, 108) - 0.5) * cell;
        const cx = Math.floor(wx);
        const cy = Math.floor(wy);
        if (!map.inBounds(cx, cy)) continue;
        const fk = this.fi(cx, cy);
        if (fk < 0) continue;
        const ds = this.dSolid[fk]!;
        const dw = this.dWater[fk]!;

        let img = worn;
        let a = 0;
        // The sea is not a damp bank. Its own cells were scoring dw = 0 and
        // taking the tideline wash at full strength, which laid a flat navy
        // sheet over every water tile in the game: half of Sicily's frame,
        // ten grey levels of contrast, and the glints under it.
        if (dw === 0) continue;
        if (dw <= 3) {
          // The tideline and the bank stay dark long after the water leaves.
          img = damp;
          a = (1 - (dw - 1) / 3) * 0.95;
        } else if (ds <= 1) {
          // Grit, splash and soot bank up wherever a wall stops a broom.
          img = grime;
          a = 0.8;
        } else {
          // Desire paths: two long-wavelength fields, one stretched along each
          // axis, so the worn ground runs in lanes the way walking wears it,
          // and the untrodden middle of a square keeps its colour.
          const lanes = Math.max(
            cellHash(Math.floor(wx / 7), Math.floor(wy / 2.4), 83),
            cellHash(Math.floor(wx / 2.4), Math.floor(wy / 7), 89),
          );
          if (lanes > 0.54) {
            a = (lanes - 0.54) * 2.6 * (ds >= 3 ? 1 : 0.6);
          } else if (lanes < 0.3) {
            // And between the lanes, where nobody walks, everything settles.
            img = grime;
            a = (0.3 - lanes) * 2.1;
          }
        }
        if (a < 0.06) continue;
        const r = (2.1 + h * 2.6) * TILE * A;
        ctx.globalAlpha = Math.min(1, a);
        ctx.drawImage(img, (wx * TILE - cam.x) * A - r, (wy * TILE - cam.y) * A - r, r * 2, r * 2);
      }
    }

    // And the pale rectangle where something has stood so long the sun went
    // round it: a charpai, a crate stack, a boat pulled up every winter.
    const big = 13;
    for (let gy = Math.floor(y0 / big) - 1; gy <= Math.floor(y1 / big); gy++) {
      for (let gx = Math.floor(x0 / big) - 1; gx <= Math.floor(x1 / big); gx++) {
        if (cellHash(gx, gy, 97) > 0.45) continue;
        const wx = gx * big + 1 + cellHash(gx, gy, 111) * (big - 2);
        const wy = gy * big + 1 + cellHash(gx, gy, 117) * (big - 2);
        const fk = this.fi(Math.floor(wx), Math.floor(wy));
        if (fk < 0) continue;
        const ds = this.dSolid[fk]!;
        if (ds < 1 || ds > 3 || this.dWater[fk]! < 3) continue;
        const rw = (2.2 + cellHash(gx, gy, 123) * 1.6) * TILE * A;
        const rh = rw * 0.66;
        ctx.globalAlpha = 1;
        ctx.drawImage(
          this.standPrint,
          (wx * TILE - cam.x) * A - rw,
          (wy * TILE - cam.y) * A - rh,
          rw * 2,
          rh * 2,
        );
      }
    }
    ctx.globalAlpha = 1;
  }

  private drawWaterLife(
    _map: TileMap,
    cam: Camera,
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    kindAt: (x: number, y: number) => string,
  ) {
    const ctx = this.ctx;
    const dayK = 1 - this.nightK;
    const watery = (k: string) => k === 'sea' || k === 'water';
    for (let cy = y0; cy <= y1; cy++) {
      for (let cx = x0; cx <= x1; cx++) {
        const kind = kindAt(cx, cy);
        if (!watery(kind)) continue;
        const sx = (cx * TILE - cam.x) * A;
        const sy = (cy * TILE - cam.y) * A;

        // Glints: two per tile, pulsing out of phase, gone after dark.
        if (dayK > 0.25) {
          ctx.fillStyle = '#f2f8f4';
          for (let i = 0; i < 2; i++) {
            const h = cellHash(cx, cy, 300 + i * 17);
            const pulse = Math.sin(this.time * (1.1 + h) + h * 40);
            if (pulse < 0.55) continue;
            const a = (pulse - 0.55) * 1.6 * dayK * (kind === 'sea' ? 0.55 : 0.4);
            const gx = sx + 8 + h * (S - 16);
            const gy = sy + 8 + cellHash(cx, cy, 350 + i * 13) * (S - 16);
            ctx.globalAlpha = a;
            ctx.beginPath();
            ctx.ellipse(gx, gy, 4.5, 1.4, 0, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.globalAlpha = 1;
        }

        // Foam: only the sea works its shoreline this hard.
        if (kind !== 'sea') continue;
        const edges: [number, number, boolean][] = [
          [0, -1, true], // land to the north: foam along the top edge
          [-1, 0, false], // land west: along the left edge
          [1, 0, false], // land east: along the right edge
        ];
        for (const [dx, dy, horizontal] of edges) {
          const nk = kindAt(cx + dx, cy + dy);
          if (watery(nk) || nk === 'void' || nk === 'scree') continue;
          const breathe = Math.sin(this.time * 1.4 + cx * 0.7 + cy * 0.4) * 2.2;
          ctx.save();
          ctx.strokeStyle = 'rgba(240,248,244,0.5)';
          ctx.lineWidth = 3;
          ctx.lineCap = 'round';
          ctx.beginPath();
          if (horizontal) {
            const fy = sy + 3 + Math.max(0, breathe);
            ctx.moveTo(sx + 2, fy);
            ctx.quadraticCurveTo(sx + S * 0.3, fy + 2.5, sx + S * 0.55, fy);
            ctx.quadraticCurveTo(sx + S * 0.8, fy - 2, sx + S - 2, fy + 1);
          } else {
            const fx = dx < 0 ? sx + 3 + Math.max(0, breathe) : sx + S - 3 - Math.max(0, breathe);
            ctx.moveTo(fx, sy + 2);
            ctx.quadraticCurveTo(fx + (dx < 0 ? 2.5 : -2.5), sy + S * 0.4, fx, sy + S * 0.7);
            ctx.quadraticCurveTo(fx + (dx < 0 ? -2 : 2), sy + S * 0.85, fx + 1, sy + S - 2);
          }
          ctx.stroke();
          // A fainter second line, lagging: the last wave still draining.
          ctx.globalAlpha = 0.3;
          ctx.lineWidth = 2;
          ctx.beginPath();
          if (horizontal) {
            const fy2 = sy + 9 + Math.max(0, -breathe);
            ctx.moveTo(sx + 4, fy2);
            ctx.quadraticCurveTo(sx + S * 0.5, fy2 + 2, sx + S - 4, fy2 - 1);
          } else {
            const fx2 = dx < 0 ? sx + 10 : sx + S - 10;
            ctx.moveTo(fx2, sy + 6);
            ctx.quadraticCurveTo(fx2 + (dx < 0 ? 2 : -2), sy + S * 0.5, fx2, sy + S - 6);
          }
          ctx.stroke();
          ctx.restore();
        }
      }
    }
  }

  /**
   * The sun has a direction. Everything that stands casts a soft skewed
   * shadow toward the north-west of the screen; at dusk the shadows stretch.
   * This one pass does more "real place" work than any texture.
   */
  /** Light through leaves: bright coins wobbling inside a canopy's shadow. */
  private drawDapple(sx: number, sy: number, cx: number, cy: number) {
    const dayK = 1 - this.nightK;
    if (dayK < 0.35) return;
    const ctx = this.ctx;
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 4; i++) {
      const h1 = cellHash(cx, cy, 400 + i * 7);
      const h2 = cellHash(cx, cy, 430 + i * 11);
      const wob = Math.sin(this.time * 1.2 + i * 1.9 + cx) * 4;
      const px = sx + this.sunSkew * this.sunLen * 26 + (h1 - 0.5) * 64 + wob;
      const py = sy - 2 + h2 * 16;
      ctx.globalAlpha = (0.05 + h2 * 0.05) * dayK;
      ctx.fillStyle = '#ffe9b0';
      ctx.beginPath();
      ctx.ellipse(px, py, 8 + h1 * 5, 3.4 + h2 * 2, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  /** A tall prop doubled into the water below it, wobbling with the swell. */
  private reflectTall(kind: string, sx: number, sy: number, cx: number, cy: number, cam: Camera) {
    const img = this.tiles.tallImage(kind, cx, cy);
    if (!img) return;
    const ctx = this.ctx;
    const baseY = sy + S - 2;
    const clipY = ((cy + 1) * TILE - cam.y) * A;
    ctx.save();
    ctx.beginPath();
    ctx.rect(sx - S, clipY, S * 3, S * 2);
    ctx.clip();
    ctx.globalAlpha = 0.18;
    const wob = Math.sin(this.time * 1.7 + cx * 1.3) * 2;
    ctx.translate(wob, 2 * baseY);
    ctx.scale(1, -1);
    ctx.drawImage(img.cvs, sx - img.ox, sy - img.oy);
    ctx.restore();
  }

  private castShadow(sx: number, sy: number, w: number, strength = 0.22) {
    const ctx = this.ctx;
    const a = strength * (1 - this.nightK * 0.55);
    if (a < 0.02) return;
    // A room's lamps never set; outdoors the lean of this pool goes out with
    // the sun, so after dark it is a contact shadow and not a leftover angle.
    const lean = this.mood === 'interior' ? 1 : this.sunUp;
    const len = 1 + (this.sunLen - 1) * lean;
    const ww = w * (0.7 + 0.35 * len);
    ctx.save();
    ctx.translate(sx, sy);
    ctx.transform(1, 0, this.sunSkew * len * lean, 0.32, 0, 0);
    ctx.globalAlpha = a;
    ctx.drawImage(this.shadowBlob, -ww, -ww, ww * 2, ww * 2);
    ctx.restore();
  }

  private drawSprite(
    s: Sprite,
    sxf: number,
    syf: number,
    index: number,
    reflect: { x: number; y: number; w: number; h: number } | null = null,
  ) {
    const ctx = this.ctx;
    // Fractional positions: sprites glide with the sub-pixel camera instead
    // of ticking against it.
    const sx = sxf;
    const sy = syf;
    // The figure's own throw is in the sun pass with everything else's; this
    // is only the darkness where her feet meet the ground. With no sun up it
    // is the whole of her shadow, so it goes back to its old weight.
    this.castShadow(sx + S / 2, sy + S - 6, 26, this.contactA(0.13, 0.24));

    // Walk lean: under two degrees into the direction of travel, eased in and
    // out so it reads as weight, never wobble. The rotation pivots at the feet.
    const lean = this.updateLean(s.actor);
    if (lean !== 0) {
      const fx = sx + S / 2;
      const fy = sy + S - 2;
      ctx.save();
      ctx.translate(fx, fy);
      ctx.rotate(lean);
      ctx.translate(-fx, -fy);
      this.drawSpriteBody(s, sx, sy, index, reflect);
      ctx.restore();
    } else {
      this.drawSpriteBody(s, sx, sy, index, reflect);
    }
  }

  /** Ease this actor's lean toward its target; returns radians. */
  private updateLean(a: Actor): number {
    const target =
      a.isMoving && !a.isBumping ? (a.dir === 'left' ? -1 : a.dir === 'right' ? 1 : 0) * 0.03 : 0;
    let cur = this.leans.get(a) ?? 0;
    cur += (target - cur) * Math.min(1, this.frameDt * 9);
    if (target === 0 && Math.abs(cur) < 0.0015) {
      this.leans.delete(a);
      return 0;
    }
    this.leans.set(a, cur);
    return cur;
  }

  private drawSpriteBody(
    s: Sprite,
    sx: number,
    sy: number,
    index: number,
    reflect: { x: number; y: number; w: number; h: number } | null,
  ) {
    const ctx = this.ctx;
    const isPlayer = s.isPlayer ?? index === 0;
    const idle = !s.actor.isMoving;

    // Idle life. After ten quiet seconds the player glances left, then right,
    // and now and then rolls a small stretch through the shoulders. Idle NPCs
    // near the player occasionally turn to look: noticed, not tracked.
    let drawDir = s.actor.dir;
    let stretch = 0;
    if (idle && s.rig !== 'animal' && s.actor.pose !== 'sit' && !s.actor.frozen) {
      if (isPlayer) {
        const it = s.actor.idleT - 10;
        if (it > 0) {
          const cyc = it % 13;
          if (cyc < 0.7) drawDir = 'left';
          else if (cyc >= 1.0 && cyc < 1.7) drawDir = 'right';
          else if (cyc >= 8 && cyc < 8.6) stretch = -Math.sin(((cyc - 8) / 0.6) * Math.PI) * 6;
        }
      } else {
        const ddx = this.playerSX - sx;
        const ddy = this.playerSY - sy;
        if (Math.abs(ddx) <= S * 2 && Math.abs(ddy) <= S * 2 && (this.time + index * 3.1) % 11 < 1.5) {
          drawDir = Math.abs(ddx) > Math.abs(ddy) ? (ddx > 0 ? 'right' : 'left') : ddy > 0 ? 'down' : 'up';
        }
      }
    }

    const row = DIR_ROW[drawDir];
    const dx = sx - Math.floor((AW - S) / 2);
    const dy = sy - (AH - S);

    const mirror = (col: number) => {
      if (!reflect) return;
      const baseY = sy + S - 2;
      ctx.save();
      ctx.beginPath();
      ctx.rect(reflect.x, reflect.y, reflect.w, reflect.h);
      ctx.clip();
      ctx.globalAlpha = 0.2;
      ctx.translate(Math.sin(this.time * 2 + sx * 0.02) * 2, 2 * baseY);
      ctx.scale(1, -1);
      ctx.drawImage(s.sheet, col * AW, row * AH, AW, AH, dx, dy, AW, AH);
      ctx.restore();
    };

    /**
     * Firelight warms the near side. Composited on a scratch cell so the
     * tint stays inside the figure's silhouette.
     */
    const drawLit = (col: number, ddy: number) => {
      const near = this.nearestFire(sx + S / 2, sy + S / 2);
      const strength = near ? near.k * (0.22 + this.nightK * 0.2) : 0;
      if (strength < 0.05) {
        ctx.drawImage(s.sheet, col * AW, row * AH, AW, AH, dx, dy + ddy, AW, AH);
        return;
      }
      const { cv, g } = this.scratch;
      g.clearRect(0, 0, AW, AH);
      g.globalCompositeOperation = 'source-over';
      g.drawImage(s.sheet, col * AW, row * AH, AW, AH, 0, 0, AW, AH);
      g.globalCompositeOperation = 'source-atop';
      const fromLeft = near !== null && near.dx < 0;
      const grad = g.createLinearGradient(fromLeft ? 0 : AW, 0, fromLeft ? AW : 0, 0);
      grad.addColorStop(0, `rgba(255,158,74,${strength})`);
      grad.addColorStop(0.65, 'rgba(255,158,74,0)');
      g.fillStyle = grad;
      g.fillRect(0, 0, AW, AH);
      ctx.drawImage(cv, dx, dy + ddy);
    };

    // Happy hops, speaking bobs, and idle stretches ride on top of any pose.
    const bounceT = this.bounces.get(s.actor) ?? 0;
    const hop = bounceT > 0 ? -Math.sin((1 - bounceT / 0.45) * Math.PI) * 7 : 0;
    const speakBob = this.speaker === s.actor ? Math.sin(this.time * 9) * 1.6 : 0;
    const lift = hop + speakBob + stretch;

    if (s.rig === 'animal') {
      const col = s.actor.walkFrame();
      mirror(col);
      drawLit(col, lift);
      return;
    }

    // Humans: six-frame walk; at rest, a slow breath and the occasional blink.
    // A seated pose overrides the legs entirely; a wave overrides the arms.
    let col = idle ? 0 : s.actor.walkFrame6();
    if (idle && drawDir === 'down' && ((this.time + index * 1.37) % 4.1) < 0.14) {
      col = 6; // blink
    }
    if (idle && (this.waves.get(s.actor) ?? 0) > 0) col = 8;
    if (s.actor.pose === 'sit') {
      mirror(7);
      drawLit(7, lift);
      return;
    }
    mirror(col);
    if (idle && lift === 0 && col !== 8) {
      const breathe = Math.sin((this.time + index * 0.9) * 2.6) * 1.6;
      if (breathe > 0.4) {
        const split = 18 * A;
        const dip = Math.min(3, breathe);
        ctx.drawImage(s.sheet, col * AW, row * AH, AW, split, dx, dy + dip, AW, split);
        ctx.drawImage(s.sheet, col * AW, row * AH + split, AW, AH - split, dx, dy + split, AW, AH - split);
        return;
      }
    }
    drawLit(col, lift);
  }

  /** Nearest fire within reach, as direction + falloff. */
  private nearestFire(sx: number, sy: number): { dx: number; k: number } | null {
    let best: { dx: number; k: number } | null = null;
    for (const [fx, fy] of this.fireScreen) {
      // Fires arrive in screen space from drawWorld's precompute.
      const ddx = fx - sx;
      const ddy = fy - sy;
      const d = Math.hypot(ddx, ddy) / (TILE * A);
      if (d > 3.5) continue;
      const k = 1 - d / 3.5;
      if (!best || k > best.k) best = { dx: ddx, k };
    }
    return best;
  }

  private drawParty(cam: Camera) {
    const ctx = this.ctx;
    for (const p of this.party) {
      const k = p.t / p.life;
      const x = (p.x - cam.x) * A;
      const y = (p.y - cam.y) * A;
      ctx.save();
      if (p.kind === 'sparkle') {
        // A twinkle: a four-point star shrinking as it fades.
        const r = (1 - k) * 6 + 1.5;
        ctx.globalAlpha = (1 - k) * (0.6 + Math.sin(p.t * 30) * 0.3);
        ctx.fillStyle = p.hue;
        ctx.translate(x, y);
        ctx.rotate(p.spin + p.t * 2);
        ctx.beginPath();
        for (let i = 0; i < 8; i++) {
          const rr2 = i % 2 === 0 ? r : r * 0.4;
          const a2 = (i / 8) * Math.PI * 2;
          ctx.lineTo(Math.cos(a2) * rr2, Math.sin(a2) * rr2);
        }
        ctx.closePath();
        ctx.fill();
      } else {
        // A petal: a tilted teardrop, alpha easing out at the end.
        ctx.globalAlpha = k > 0.75 ? (1 - k) * 4 : 0.9;
        ctx.fillStyle = p.hue;
        ctx.translate(x, y);
        ctx.rotate(p.spin + Math.sin(p.t * 2.4) * 0.8);
        ctx.beginPath();
        ctx.ellipse(0, 0, 5, 3, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  private drawPuffs(cam: Camera) {
    const ctx = this.ctx;
    for (const p of this.puffs) {
      const k = p.t / PUFF_DUR;
      const x = (p.x - cam.x) * A;
      const y = (p.y - cam.y) * A - k * 10;
      ctx.save();
      ctx.globalAlpha = 0.35 * (1 - k);
      ctx.fillStyle = '#d6c4a0';
      ctx.beginPath();
      ctx.arc(x - 8 - k * 6, y, 3 + k * 4, 0, Math.PI * 2);
      ctx.arc(x + 8 + k * 6, y - 3, 2.5 + k * 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  private drawEmotes(cam: Camera) {
    const ctx = this.ctx;
    for (const e of this.emotes) {
      const [px, py] = e.actor.renderPos();
      const rise = Math.min(1, e.t / 0.12);
      const x = (px - cam.x) * A + S / 2;
      const y = (py - cam.y) * A - 52 - rise * 14;
      // Soft bubble.
      ctx.fillStyle = 'rgba(250,243,228,0.96)';
      ctx.beginPath();
      ctx.roundRect(x - 17, y - 17, 34, 34, 10);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(x - 5, y + 16);
      ctx.lineTo(x, y + 25);
      ctx.lineTo(x + 5, y + 16);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = e.kind === '♥' ? '#c1512f' : '#2b2118';
      ctx.font = '600 22px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(e.kind, x, y + 2);
    }
  }

  /**
   * Hearth hours: how strongly the chimneys smoke right now. Cooking happens
   * at dawn and at dusk; midday and deep night the columns die down to zero.
   */
  private hearthK(): number {
    const d = this.dayT;
    const win = (t: number, a: number, b: number, f: number) =>
      Math.max(0, Math.min(1, (t - a) / f, (b - t) / f));
    const dm = d < 0.5 ? d + 1 : d; // unwrap dawn across the midnight seam
    return Math.max(win(dm, 0.955, 1.21, 0.05), win(d, 0.47, 0.76, 0.06));
  }

  /**
   * Where this map's smoke rises from. Authored `smoke` cells win; maps that
   * never declared any get chimneys derived from their hearth-bearing
   * buildings, anchored to the real roofline of each sprite. Found once.
   */
  private chimneysFor(map: TileMap): [number, number][] {
    let cells = this.chimneyCache.get(map.id);
    if (cells) return cells;
    cells = map.smoke.map(([ex, ey]) => [ex * TILE + TILE / 2, ey * TILE] as [number, number]);
    if (cells.length === 0) {
      for (let y = 0; y < map.h; y++) {
        for (let x = 0; x < map.w; x++) {
          const o = map.object(x, y);
          if (!o?.tall || !HEARTH_KINDS.has(o.t)) continue;
          const img = this.tiles.tallImage(o.t, x, y);
          if (!img) continue;
          // A fixed spot on the right shoulder of the roof, just below the ridge.
          cells.push([
            x * TILE - img.ox / A + (img.cvs.width / A) * 0.68,
            (y + 1) * TILE - img.cvs.height / A + 6,
          ]);
        }
      }
    }
    this.chimneyCache.set(map.id, cells);
    return cells;
  }

  /** Cookfire smoke: baked wisps rising with a sway, morning and evening only. */
  private drawSmoke(map: TileMap, cam: Camera) {
    if (this.mood === 'interior') return;
    const k = this.hearthK();
    if (k < 0.02) return;
    const ctx = this.ctx;
    const chimneys = this.chimneysFor(map);
    let onScreen = 0;
    for (let i = 0; i < chimneys.length; i++) {
      const cell = chimneys[i];
      if (!cell) continue;
      const bx = (cell[0] - cam.x) * A;
      const by = (cell[1] - cam.y) * A;
      if (bx < -80 || bx > W + 80 || by < -60 || by > H + 160) continue;
      if (++onScreen > 6) break; // wisp cap: never a screen full of smoke
      for (let p = 0; p < 3; p++) {
        const t = (this.time * 0.14 + p / 3 + i * 0.41) % 1;
        const x = bx + Math.sin(t * 4.2 + i * 2 + p * 1.7) * (5 + t * 15);
        const y = by - 4 - t * 128;
        const r = 10 + t * 26;
        const a = (t < 0.12 ? t / 0.12 : 1 - (t - 0.12) / 0.88) * 0.5 * k;
        const puff = this.smokePuffs[(i + p) % this.smokePuffs.length];
        if (!puff || a < 0.01) continue;
        ctx.globalAlpha = a;
        ctx.drawImage(puff, x - r, y - r, r * 2, r * 2);
      }
    }
    ctx.globalAlpha = 1;
  }

  /** Slow cloud shade drifting across the land. */
  /**
   * Live weather, by mood. The monsoon actually rains; the garúa actually
   * drifts. Weather is the difference between a backdrop and a place.
   */
  private drawWeather(map: TileMap, cam: Camera) {
    const ctx = this.ctx;
    const mood = this.mood;
    if (this.raining || mood === 'monsoon' || mood === 'sawanrain') {
      // Rain: fast slanted streaks in two depths, plus splash rings on the
      // ground that bloom and vanish. Steady, warm, unbothered.
      for (let layer = 0; layer < 2; layer++) {
        const n = layer === 0 ? 70 : 45;
        const speed = layer === 0 ? 640 : 430;
        const len = layer === 0 ? 26 : 16;
        const alpha = layer === 0 ? 0.34 : 0.2;
        ctx.strokeStyle = `rgba(205,225,235,${alpha})`;
        ctx.lineWidth = layer === 0 ? 1.8 : 1.2;
        ctx.beginPath();
        for (let i = 0; i < n; i++) {
          const h1 = cellHash(i, 101 + layer, 3);
          const h2 = cellHash(i, 137 + layer, 5);
          const fall = (this.time * speed * (0.8 + h2 * 0.4)) % (H + 80);
          const x = ((h1 * (W + 160) + this.time * 60) % (W + 160)) - 80;
          const y = fall - 40;
          ctx.moveTo(x, y);
          ctx.lineTo(x - len * 0.22, y + len);
        }
        ctx.stroke();
      }
      for (let i = 0; i < 12; i++) {
        const h1 = cellHash(i, 173, 7);
        const h2 = cellHash(i, 191, 11);
        const cycle = (this.time * (1.1 + h2 * 0.5) + h1 * 7) % 1;
        const wx = h1 * map.w * TILE;
        const wy = h2 * map.h * TILE;
        const x = (wx - cam.x) * A;
        const y = (wy - cam.y) * A;
        if (x < 0 || x >= W || y < 0 || y >= H) continue;
        const a = (1 - cycle) * 0.3;
        ctx.strokeStyle = `rgba(220,235,240,${a})`;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.ellipse(x, y, 3 + cycle * 9, (3 + cycle * 9) * 0.4, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    } else if (mood === 'garua' || mood === 'premonsoon') {
      // Fog bands sliding sideways, barely there, plus the finest drizzle.
      for (let i = 0; i < 4; i++) {
        const h1 = cellHash(i, 211, 13);
        const wy = ((h1 * H * 1.4 + this.time * 6 * (i % 2 ? 1 : -1)) % (H * 1.4)) - H * 0.2;
        const grad = ctx.createLinearGradient(0, wy - 40, 0, wy + 40);
        grad.addColorStop(0, 'rgba(215,222,226,0)');
        grad.addColorStop(0.5, `rgba(215,222,226,${mood === 'garua' ? 0.1 : 0.06})`);
        grad.addColorStop(1, 'rgba(215,222,226,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, wy - 40, W, 80);
      }
      if (mood === 'garua') {
        ctx.fillStyle = 'rgba(210,222,228,0.4)';
        for (let i = 0; i < 30; i++) {
          const h1 = cellHash(i, 227, 17);
          const h2 = cellHash(i, 241, 19);
          const x = (h1 * W + Math.sin(this.time * 0.8 + i) * 20) % W;
          const y = (h2 * H + this.time * 34 * (0.7 + h1 * 0.5)) % H;
          ctx.fillRect(x, y, 1.6, 3.2);
        }
      }
    }
  }

  private drawClouds(map: TileMap, cam: Camera) {
    const ctx = this.ctx;
    const worldW = map.w * TILE + 260;
    for (let i = 0; i < 3; i++) {
      const h1 = cellHash(i, 31, 7);
      const speed = 7 + h1 * 5;
      const wx = ((h1 * worldW + this.time * speed) % worldW) - 130;
      const wy = h1 * map.h * TILE * 0.8 + Math.sin(this.time * 0.05 + i * 2) * 14;
      const x = (wx - cam.x * 0.92) * A;
      const y = (wy - cam.y * 0.92) * A;
      const r = (55 + h1 * 40) * A;
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(1, 0.42);
      ctx.drawImage(this.cloudPuff, -r, -r, r * 2, r * 2);
      ctx.restore();
    }
  }

  /** Fireflies: slow wanderers with a pulse, out only after dark. */
  private drawFireflies(map: TileMap, cam: Camera) {
    const ctx = this.ctx;
    const worldW = map.w * TILE;
    const worldH = map.h * TILE;
    const strength = Math.min(1, (this.nightK - 0.4) / 0.4);
    for (let i = 0; i < 10; i++) {
      const h1 = cellHash(i, 53, 13);
      const h2 = cellHash(i, 71, 19);
      const wx = h1 * worldW + Math.sin(this.time * 0.5 + i * 2.2) * 26 + Math.sin(this.time * 1.3 + i) * 8;
      const wy = h2 * worldH + Math.cos(this.time * 0.4 + i * 1.7) * 18;
      const x = (((wx % worldW) + worldW) % worldW - cam.x) * A;
      const y = (((wy % worldH) + worldH) % worldH - cam.y) * A;
      if (x < 0 || x >= W || y < 0 || y >= H) continue;
      const pulse = Math.max(0, Math.sin(this.time * 1.8 + i * 2.6));
      const a = pulse * pulse * strength;
      if (a < 0.05) continue;
      ctx.globalAlpha = a;
      ctx.drawImage(this.fireflyGlow, x - 8, y - 8);
    }
    ctx.globalAlpha = 1;
  }

  /** A few leaves forever on their way somewhere else. */
  private drawLeaves(map: TileMap, cam: Camera) {
    const ctx = this.ctx;
    const worldW = map.w * TILE;
    const worldH = map.h * TILE;
    for (let i = 0; i < 6; i++) {
      const h1 = cellHash(i, 17, 23);
      const h2 = cellHash(i, 29, 41);
      const wx = (h1 * worldW + this.time * (11 + h2 * 8) + Math.sin(this.time * 1.7 + i) * 7) % worldW;
      const wy = (h2 * worldH + this.time * 16) % worldH;
      const x = (wx - cam.x) * A;
      const y = (wy - cam.y) * A;
      if (x < -8 || x >= W || y < -8 || y >= H) continue;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(Math.sin(this.time * 5 + i * 2) * 0.9);
      ctx.globalAlpha = 0.8;
      ctx.fillStyle = i % 2 ? '#6e9e5a' : '#a2823f';
      ctx.beginPath();
      ctx.ellipse(0, 0, 4.5, 2.2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  /** Faint sunlit dust drifting on the wind. */
  private drawMotes(map: TileMap, cam: Camera) {
    const ctx = this.ctx;
    const worldW = map.w * TILE;
    const worldH = map.h * TILE;
    for (let i = 0; i < 14; i++) {
      const h1 = cellHash(i, 7, 3);
      const h2 = cellHash(i, 13, 5);
      const wx = (h1 * worldW + this.time * (4 + h2 * 5)) % worldW;
      const wy = (h2 * worldH + this.time * 2 + Math.sin(this.time * 0.8 + i) * 4 + worldH) % worldH;
      const x = (wx - cam.x) * A;
      const y = (wy - cam.y) * A;
      if (x < 0 || x >= W || y < 0 || y >= H) continue;
      ctx.save();
      ctx.globalAlpha = 0.14;
      ctx.fillStyle = '#f2e6d0';
      ctx.beginPath();
      ctx.arc(x, y, 1.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
}

const NEVER = () => false;

/**
 * Bake the ambient flier frames once: tiny painted birds (three wing beats,
 * facing right; the renderer mirrors for the other way) and a butterfly whose
 * frames fold its wings. Gouache shapes, no outlines; they read at sky size.
 */
function bakeFliers(): Record<FlierKind, HTMLCanvasElement[]> {
  const wing = (
    g: CanvasRenderingContext2D,
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    w: number,
    c: string,
  ) => {
    const mx = (x0 + x1) / 2;
    const my = (y0 + y1) / 2;
    let nx = -(y1 - y0);
    let ny = x1 - x0;
    const n = Math.hypot(nx, ny) || 1;
    nx /= n;
    ny /= n;
    g.fillStyle = c;
    g.beginPath();
    g.moveTo(x0, y0);
    g.quadraticCurveTo(mx + nx * w, my + ny * w, x1, y1);
    g.quadraticCurveTo(mx - nx * w * 0.5, my - ny * w * 0.5, x0, y0 + 1.5);
    g.closePath();
    g.fill();
  };

  const bird = (
    wCv: number,
    hCv: number,
    body: string,
    belly: string,
    wingC: string,
    wingFar: string,
    beak: string,
    size: number,
  ): HTMLCanvasElement[] => {
    // Three beats: wings up, level, down.
    const TIPS: [number, number][] = [
      [-0.5, -0.85],
      [-1, -0.12],
      [-0.55, 0.75],
    ];
    return TIPS.map(([tx, ty]) => {
      const { cv, g } = surface(wCv, hCv);
      const cx = wCv * 0.52;
      const cy = hCv * 0.56;
      const L = size;
      // Far wing: shorter and darker, mostly lost behind the body.
      wing(g, cx + 3, cy - 2, cx + 3 + tx * L * 0.66, cy - 2 + ty * L * 0.5, L * 0.16, wingFar);
      // Body: a soft teardrop, tail trailing.
      g.fillStyle = body;
      g.beginPath();
      g.ellipse(cx, cy, L * 0.56, L * 0.28, -0.06, 0, Math.PI * 2);
      g.fill();
      g.beginPath();
      g.moveTo(cx - L * 0.5, cy - L * 0.16);
      g.lineTo(cx - L * 0.88, cy - L * 0.02);
      g.lineTo(cx - L * 0.46, cy + L * 0.15);
      g.closePath();
      g.fill();
      // Belly light.
      g.fillStyle = belly;
      g.beginPath();
      g.ellipse(cx + L * 0.08, cy + L * 0.1, L * 0.4, L * 0.15, -0.05, 0, Math.PI);
      g.fill();
      // Head and beak.
      g.fillStyle = body;
      g.beginPath();
      g.arc(cx + L * 0.56, cy - L * 0.14, L * 0.2, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = beak;
      g.beginPath();
      g.moveTo(cx + L * 0.72, cy - L * 0.19);
      g.lineTo(cx + L * 0.94, cy - L * 0.1);
      g.lineTo(cx + L * 0.72, cy - L * 0.05);
      g.closePath();
      g.fill();
      // Near wing, the one that sells the beat.
      wing(g, cx + 1, cy - L * 0.06, cx + 1 + tx * L, cy - L * 0.06 + ty * L * 0.9, L * 0.22, wingC);
      // The same soft ink edge every figure in the game wears.
      return outlineSheet(cv, wCv, hCv, 'rgba(38,26,16,0.4)', 1.4);
    });
  };

  const butterfly = (): HTMLCanvasElement[] =>
    // Three beats: open, half, folded; foreshortened by squeezing the lobes.
    [1, 0.55, 0.2].map((open) => {
      const { cv, g } = surface(22, 20);
      const cx = 11;
      const cy = 10;
      for (const sgn of [-1, 1] as const) {
        g.fillStyle = '#e0a94f';
        g.beginPath();
        g.ellipse(cx + sgn * 4.6 * open, cy - 2.4, 4.8 * open, 3.6, sgn * 0.5 * open, 0, Math.PI * 2);
        g.fill();
        g.fillStyle = '#d18f3c';
        g.beginPath();
        g.ellipse(cx + sgn * 3.6 * open, cy + 2.6, 3.4 * open, 2.6, sgn * -0.4 * open, 0, Math.PI * 2);
        g.fill();
        g.fillStyle = 'rgba(248,240,220,0.8)';
        g.beginPath();
        g.ellipse(cx + sgn * 5.4 * open, cy - 2.8, 1.5 * open, 1.1, 0, 0, Math.PI * 2);
        g.fill();
      }
      g.fillStyle = '#4a3a28';
      g.beginPath();
      g.ellipse(cx, cy, 1.1, 3.4, 0, 0, Math.PI * 2);
      g.fill();
      return outlineSheet(cv, 22, 20, 'rgba(38,26,16,0.35)', 1.2);
    });

  return {
    gull: bird(46, 34, '#f1efe4', '#dcd8ca', '#e9e7db', '#b9b7ac', '#d9a441', 16),
    songbird: bird(34, 27, '#7d5c38', '#d9a441', '#5c452c', '#4a3826', '#5a4a34', 12),
    pigeon: bird(36, 27, '#98a0b0', '#c4c8d2', '#7e8698', '#5f6678', '#8a7a6a', 12),
    butterfly: butterfly(),
  };
}

/** Two baked smoke wisps: a round breath and a lumpier curl. */
function bakeSmokePuffs(): HTMLCanvasElement[] {
  const puff = (lumpy: boolean): HTMLCanvasElement => {
    const { cv, g } = surface(64, 64);
    const blobAt = (x: number, y: number, r: number, a: number) => {
      const grad = g.createRadialGradient(x, y, 1, x, y, r);
      grad.addColorStop(0, `rgba(240,238,234,${a})`);
      grad.addColorStop(0.6, `rgba(232,230,228,${a * 0.55})`);
      grad.addColorStop(1, 'rgba(232,230,228,0)');
      g.fillStyle = grad;
      g.fillRect(x - r, y - r, r * 2, r * 2);
    };
    if (lumpy) {
      blobAt(26, 36, 22, 0.8);
      blobAt(40, 26, 18, 0.7);
      blobAt(34, 42, 14, 0.5);
    } else {
      blobAt(32, 32, 28, 0.85);
    }
    return cv;
  };
  return [puff(false), puff(true)];
}

/** One static light pass at full art resolution. */
function makeAtmosphere(
  top: string,
  mid: string,
  bottom: string,
  vigStrength: number,
  glow?: string,
): HTMLCanvasElement {
  const { cv, g } = surface(W, H);
  const grad = g.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, top);
  grad.addColorStop(0.5, mid);
  grad.addColorStop(1, bottom);
  g.fillStyle = grad;
  g.fillRect(0, 0, W, H);
  if (glow) {
    const gl = g.createRadialGradient(W / 2, H / 2, 40, W / 2, H / 2, H * 0.75);
    gl.addColorStop(0, glow);
    gl.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gl;
    g.fillRect(0, 0, W, H);
  }
  const vig = g.createRadialGradient(W / 2, H / 2, H * 0.45, W / 2, H / 2, H * 1.05);
  vig.addColorStop(0, 'rgba(0,0,0,0)');
  vig.addColorStop(1, `rgba(16,10,5,${vigStrength})`);
  g.fillStyle = vig;
  g.fillRect(0, 0, W, H);
  return cv;
}

/** The built-in moods every chapter can use without registering anything. */
function buildAtmospheres(): Record<string, HTMLCanvasElement> {
  const make = makeAtmosphere;
  return {
    warm: make('rgba(255,214,140,0.09)', 'rgba(255,214,140,0.02)', 'rgba(120,80,140,0.06)', 0.3),
    cool: make('rgba(150,180,215,0.10)', 'rgba(170,190,210,0.03)', 'rgba(90,110,150,0.07)', 0.34),
    dusty: make('rgba(255,196,120,0.13)', 'rgba(255,220,160,0.05)', 'rgba(200,140,90,0.07)', 0.26),
    interior: make('rgba(40,24,12,0.10)', 'rgba(0,0,0,0)', 'rgba(30,18,10,0.12)', 0.46, 'rgba(255,170,80,0.10)'),
    // Winter coast: a pearl-grey fog ceiling, sea and sky one color. Flat
    // light, soft vignette, no gold anywhere.
    garua: make('rgba(202,208,214,0.20)', 'rgba(192,199,205,0.11)', 'rgba(168,180,190,0.10)', 0.2),
    // Summer coast: hard blue glare off the water, black noon shadows.
    glare: make('rgba(165,215,250,0.10)', 'rgba(255,250,235,0.05)', 'rgba(255,238,200,0.06)', 0.2),
  };
}
