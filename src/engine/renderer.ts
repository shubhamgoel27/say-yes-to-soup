import { ART, TILE, VIEW_H, VIEW_W } from './config';
import type { Actor } from './actor';
import type { TileMap } from './grid';
import type { Camera } from './camera';
import { PATHY, Tileset, WATERY } from '../art/tiles';
import { CHAR_H, CHAR_W, DIR_ROW } from '../art/character';
import { cellHash, surface } from '../art/pix';

/**
 * The world composer, smooth-art era. Renders the scene at 4x logical
 * resolution (1280x720) with antialiasing into an offscreen canvas that the
 * GPU stage presents with lighting, bloom, and zoom. Game logic stays in
 * 16px tiles; only drawing knows about ART scale.
 */

const A = ART;
const S = TILE * A;
const AW = CHAR_W * A;
const AH = CHAR_H * A;
const W = VIEW_W * A;
const H = VIEW_H * A;

export type Sprite = {
  actor: Actor;
  sheet: HTMLCanvasElement;
  /** Humans use the 7-column 6-frame rig with breathe/blink; animals the 3-column. */
  rig?: 'human' | 'animal';
};

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
  private wallShadeStrip: HTMLCanvasElement;
  private cloudPuff: HTMLCanvasElement;
  private fireflyGlow: HTMLCanvasElement;
  /** Sun geometry, driven by the world clock: skew sign is throw direction. */
  private sunSkew = -0.55;
  private sunLen = 1;
  /** Fires on the current map (tile coords), for the warm-side sprite pass. */
  private fires: [number, number][] = [];
  private fireScreen: [number, number][] = [];
  /** Scratch cell for per-sprite compositing (fire rim). */
  private scratch = surface(AW, AH);
  /** Greeting waves and happy hops, keyed by actor, counted down in tick. */
  private waves = new Map<Actor, number>();
  private bounces = new Map<Actor, number>();
  /** Whoever is mid-sentence bobs gently. */
  private speaker: Actor | null = null;
  /** The facing-cell hint: a quiet pulse over whatever would respond. */
  private hint: [number, number] | null = null;

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
    }
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

  /** 0 = full day, 1 = deep night; gates the fireflies. */
  setNight(k: number) {
    this.nightK = k;
  }

  /**
   * The sun crosses the sky. Morning throws shadows one way, noon pulls them
   * short, evening throws them the other; night holds the last dusk angle,
   * faded, for the lamps to argue with.
   */
  setSun(dayT: number) {
    const d = Math.max(0, Math.min(1, (dayT - 0.02) / 0.58));
    this.sunSkew = -Math.cos(Math.PI * d) * 0.75;
    this.sunLen = 0.55 + Math.abs(Math.cos(Math.PI * d)) * 0.9 + this.nightK * 0.3;
  }

  /** The current map's fires, for warming the near side of whoever stands close. */
  setFires(cells: [number, number][]) {
    this.fires = cells;
  }

  /** Advance ambient animation. Called from the fixed-timestep update. */
  tick(dt: number) {
    this.time += dt;
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

  drawWorld(map: TileMap, cam: Camera, sprites: Sprite[]) {
    const ctx = this.ctx;
    const kindAt = (x: number, y: number) => (map.inBounds(x, y) ? map.ground(x, y).t : 'scree');

    const x0 = Math.floor(cam.x / TILE) - 3;
    const y0 = Math.floor(cam.y / TILE) - 5; // room for tall buildings above
    const x1 = Math.ceil((cam.x + VIEW_W) / TILE) + 3;
    const y1 = Math.ceil((cam.y + VIEW_H) / TILE) + 1;

    type TallEntry = { cx: number; cy: number; kind: string };
    const tall: TallEntry[] = [];

    // Pass 1a: seamless ground.
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
      }
    }

    // Pass 1b: large soft tonal patches spanning many tiles, so the land
    // breathes without any per-tile seams.
    this.groundTint(map, cam, x0, y0, x1, y1);

    // Pass 1b2: the water is alive. Sun glints ride the swell by day, and a
    // breathing line of foam works every edge where the sea meets land.
    this.drawWaterLife(map, cam, x0, y0, x1, y1, kindAt);

    // Pass 1c: cast shade and walkable decor.
    for (let cy = y0; cy <= y1; cy++) {
      for (let cx = x0; cx <= x1; cx++) {
        const sx = (cx * TILE - cam.x) * A;
        const sy = (cy * TILE - cam.y) * A;
        if (!map.inBounds(cx, cy)) continue;

        // Anything wall-like above throws soft afternoon shade onto this cell.
        const above = map.object(cx, cy - 1);
        if (above?.solid && above.tall && !map.object(cx, cy)?.solid) {
          ctx.drawImage(this.wallShadeStrip, sx, sy);
        }

        const obj = map.object(cx, cy);
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
    sprites.forEach((s, i) => {
      const [px, py] = s.actor.renderPos();
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
          // Trees, props, and whole buildings cast into the same sun as people.
          if (t.kind === 'tree' || t.kind === 'palm') {
            this.castShadow(tx + S / 2, ty + S - 8, 52, 0.2);
            this.drawDapple(tx + S / 2, ty + S - 8, t.cx, t.cy);
          } else if (this.tiles.isBuilding(t.kind)) this.castShadow(tx + S * 2.2, ty + S - 4, 120, 0.16);
          else if (this.tiles.castsSun(t.kind)) this.castShadow(tx + S / 2, ty + S - 6, 34, 0.18);
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
    }
    this.drawMotes(map, cam);
    this.drawWeather(map, cam);
    const atm = this.atmospheres[this.mood] ?? this.atmospheres['warm'];
    if (atm) ctx.drawImage(atm, 0, 0);

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
    octave(4, 101, 2.2, 2.4, 0.9); // the close-up dapple
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
    const ww = w * (0.7 + 0.35 * this.sunLen);
    ctx.save();
    ctx.translate(sx, sy);
    ctx.transform(1, 0, this.sunSkew * this.sunLen, 0.32, 0, 0);
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
    // A directional cast shadow: the figure stands IN the light, not on a dot.
    this.castShadow(sx + S / 2, sy + S - 6, 30, 0.24);

    const row = DIR_ROW[s.actor.dir];
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

    // Happy hops and speaking bobs ride on top of any pose.
    const bounceT = this.bounces.get(s.actor) ?? 0;
    const hop = bounceT > 0 ? -Math.sin((1 - bounceT / 0.45) * Math.PI) * 7 : 0;
    const speakBob = this.speaker === s.actor ? Math.sin(this.time * 9) * 1.6 : 0;
    const lift = hop + speakBob;

    if (s.rig === 'animal') {
      const col = s.actor.walkFrame();
      mirror(col);
      drawLit(col, lift);
      return;
    }

    // Humans: six-frame walk; at rest, a slow breath and the occasional blink.
    // A seated pose overrides the legs entirely; a wave overrides the arms.
    const idle = !s.actor.isMoving;
    let col = idle ? 0 : s.actor.walkFrame6();
    if (idle && s.actor.dir === 'down' && ((this.time + index * 1.37) % 4.1) < 0.14) {
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

  /** Cookfire smoke drifting up from the chimneys: soft round puffs now. */
  private drawSmoke(map: TileMap, cam: Camera) {
    const ctx = this.ctx;
    map.smoke.forEach(([ex, ey], i) => {
      const bx = (ex * TILE + TILE / 2 - cam.x) * A;
      const by = (ey * TILE - cam.y) * A;
      if (bx < -80 || bx > W + 80 || by < -80 || by > H + 120) return;
      for (let k = 0; k < 4; k++) {
        const t = (this.time * 0.3 + k / 4 + i * 0.41) % 1;
        const x = bx + Math.sin(t * 5 + i * 2 + k) * 12;
        const y = by - 16 - t * 100;
        const r = 5 + t * 14;
        const a = (t < 0.12 ? t / 0.12 : 1 - (t - 0.12) / 0.88) * 0.3;
        ctx.save();
        ctx.globalAlpha = a;
        ctx.fillStyle = '#e6ded0';
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    });
  }

  /** Slow cloud shade drifting across the land. */
  /**
   * Live weather, by mood. The monsoon actually rains; the garúa actually
   * drifts. Weather is the difference between a backdrop and a place.
   */
  private drawWeather(map: TileMap, cam: Camera) {
    const ctx = this.ctx;
    const mood = this.mood;
    if (mood === 'monsoon') {
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
