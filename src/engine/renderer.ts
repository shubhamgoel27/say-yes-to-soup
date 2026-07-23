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

  constructor(readonly canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) throw new Error('2d canvas context unavailable');
    this.ctx = ctx;
    canvas.width = W;
    canvas.height = H;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    this.atmospheres = buildAtmospheres();
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

  /** Advance ambient animation. Called from the fixed-timestep update. */
  tick(dt: number) {
    this.time += dt;
    for (const e of this.emotes) e.t += dt;
    this.emotes = this.emotes.filter((e) => e.t < EMOTE_DUR);
    for (const p of this.puffs) p.t += dt;
    this.puffs = this.puffs.filter((p) => p.t < PUFF_DUR);
  }

  /** Pop a little thought bubble over someone's head. */
  emote(actor: Actor, kind: '!' | '♥' | '♪' | '?') {
    this.emotes = this.emotes.filter((e) => e.actor !== actor);
    this.emotes.push({ actor, kind, t: 0 });
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

    // Pass 1c: cast shade and walkable decor.
    for (let cy = y0; cy <= y1; cy++) {
      for (let cx = x0; cx <= x1; cx++) {
        const sx = (cx * TILE - cam.x) * A;
        const sy = (cy * TILE - cam.y) * A;
        if (!map.inBounds(cx, cy)) continue;

        // Anything wall-like above throws soft afternoon shade onto this cell.
        const above = map.object(cx, cy - 1);
        if (above?.solid && above.tall && !map.object(cx, cy)?.solid) {
          const grad = ctx.createLinearGradient(0, sy, 0, sy + 16);
          grad.addColorStop(0, 'rgba(30,22,14,0.26)');
          grad.addColorStop(1, 'rgba(30,22,14,0)');
          ctx.fillStyle = grad;
          ctx.fillRect(sx, sy, S, 16);
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

    sprites.forEach((s, i) => {
      const [px, py] = s.actor.renderPos();
      layers.push({
        sort: py / TILE,
        draw: () => this.drawSprite(s, (px - cam.x) * A, (py - cam.y) * A, i),
      });
    });
    for (const t of tall) {
      layers.push({
        sort: t.cy + 0.5,
        draw: () =>
          this.tiles.drawTall(ctx, t.kind, (t.cx * TILE - cam.x) * A, (t.cy * TILE - cam.y) * A, t.cx, t.cy),
      });
    }
    layers.sort((a, b) => a.sort - b.sort);
    for (const l of layers) l.draw();

    this.drawPuffs(cam);
    this.drawEmotes(cam);
    this.drawSmoke(map, cam);
    if (this.mood !== 'interior') {
      // Fog-lid moods have no sky to cast cloud shadows from.
      if (this.nightK < 0.5 && !this.noClouds.has(this.mood)) this.drawClouds(map, cam);
      this.drawLeaves(map, cam);
      if (this.nightK > 0.4) this.drawFireflies(map, cam);
    }
    this.drawMotes(map, cam);
    const atm = this.atmospheres[this.mood] ?? this.atmospheres['warm'];
    if (atm) ctx.drawImage(atm, 0, 0);
  }

  /** World-anchored tonal patches, keyed to a coarse grid so they never move. */
  private groundTint(map: TileMap, cam: Camera, x0: number, y0: number, x1: number, y1: number) {
    const ctx = this.ctx;
    const TINTS = [
      'rgba(96,70,36,0.085)', // dry shadowed earth
      'rgba(255,236,180,0.075)', // sun-bleached
      'rgba(88,104,60,0.07)', // faint green flush
      'rgba(140,90,50,0.06)', // iron warmth
    ];
    for (let gy = (y0 >> 2) - 1; gy <= (y1 >> 2) + 1; gy++) {
      for (let gx = (x0 >> 2) - 1; gx <= (x1 >> 2) + 1; gx++) {
        const h = cellHash(gx, gy, 101);
        if (h > 0.62) continue;
        const tint = TINTS[Math.floor(h * 40) % TINTS.length] ?? TINTS[0]!;
        const wx = (gx * 4 + 2 + (cellHash(gx, gy, 55) - 0.5) * 4) * TILE;
        const wy = (gy * 4 + 2 + (cellHash(gx, gy, 77) - 0.5) * 4) * TILE;
        // Skip patches centered outside the map so scree stays calm.
        if (!map.inBounds(Math.floor(wx / TILE), Math.floor(wy / TILE))) continue;
        const x = (wx - cam.x) * A;
        const y = (wy - cam.y) * A;
        const r = (2.2 + cellHash(gx, gy, 91) * 2.4) * TILE * A;
        const grad = ctx.createRadialGradient(x, y, r * 0.15, x, y, r);
        grad.addColorStop(0, tint);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(x - r, y - r, r * 2, r * 2);
      }
    }
  }

  private drawSprite(s: Sprite, sxf: number, syf: number, index: number) {
    const ctx = this.ctx;
    const sx = Math.round(sxf);
    const sy = Math.round(syf);
    // Soft contact shadow; the body bobs over it.
    const shGrad = ctx.createRadialGradient(sx + S / 2, sy + S - 6, 2, sx + S / 2, sy + S - 6, 22);
    shGrad.addColorStop(0, 'rgba(26,18,12,0.30)');
    shGrad.addColorStop(1, 'rgba(26,18,12,0)');
    ctx.save();
    ctx.translate(sx + S / 2, sy + S - 6);
    ctx.scale(1, 0.38);
    ctx.translate(-(sx + S / 2), -(sy + S - 6));
    ctx.fillStyle = shGrad;
    ctx.fillRect(sx + S / 2 - 24, sy + S - 30, 48, 48);
    ctx.restore();

    const row = DIR_ROW[s.actor.dir];
    const dx = sx - Math.floor((AW - S) / 2);
    const dy = sy - (AH - S);

    if (s.rig === 'animal') {
      const col = s.actor.walkFrame();
      ctx.drawImage(s.sheet, col * AW, row * AH, AW, AH, dx, dy, AW, AH);
      return;
    }

    // Humans: six-frame walk; at rest, a slow breath and the occasional blink.
    const idle = !s.actor.isMoving;
    let col = idle ? 0 : s.actor.walkFrame6();
    if (idle && s.actor.dir === 'down' && ((this.time + index * 1.37) % 4.1) < 0.14) {
      col = 6; // blink
    }
    if (idle) {
      const breathe = Math.sin((this.time + index * 0.9) * 2.6) * 1.6;
      if (breathe > 0.4) {
        const split = 18 * A;
        const dip = Math.min(3, breathe);
        ctx.drawImage(s.sheet, col * AW, row * AH, AW, split, dx, dy + dip, AW, split);
        ctx.drawImage(s.sheet, col * AW, row * AH + split, AW, AH - split, dx, dy + split, AW, AH - split);
        return;
      }
    }
    ctx.drawImage(s.sheet, col * AW, row * AH, AW, AH, dx, dy, AW, AH);
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
      const grad = ctx.createRadialGradient(x, y, r * 0.2, x, y, r);
      grad.addColorStop(0, 'rgba(30,24,40,0.10)');
      grad.addColorStop(0.7, 'rgba(30,24,40,0.06)');
      grad.addColorStop(1, 'rgba(30,24,40,0)');
      ctx.save();
      ctx.translate(x, y);
      ctx.scale(1, 0.42);
      ctx.translate(-x, -y);
      ctx.fillStyle = grad;
      ctx.fillRect(x - r, y - r, r * 2, r * 2);
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
      const grad = ctx.createRadialGradient(x, y, 0, x, y, 8);
      grad.addColorStop(0, `rgba(232,255,160,${0.9 * a})`);
      grad.addColorStop(0.4, `rgba(210,245,130,${0.35 * a})`);
      grad.addColorStop(1, 'rgba(210,245,130,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(x - 8, y - 8, 16, 16);
    }
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
