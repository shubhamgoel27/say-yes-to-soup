import { ART, PAL, TILE } from '../engine/config';
import { Rng, blob, cellHash, dot, glowSpot, oval, rect, rr, shade, softShadow, surface, vgrad } from './pix';

/**
 * The tileset, smooth-art era. Every texture is authored at 4x (64px tiles)
 * with antialiased vector shapes: soft gradients, organic blobs, rounded
 * forms, value-contrast instead of outlines. The renderer passes high-res
 * screen coordinates; game logic never knows.
 */

const S = TILE * ART; // 64: one tile of art

/** Ground kinds that count as "water" for bank autotiling. */
export const WATERY = new Set(['water', 'bridge', 'sea']);
/** Ground kinds paths visually connect to instead of growing a soft edge. */
export const PATHY = new Set(['path', 'plaza', 'bridge', 'dirt']);

export type Conn = (dx: number, dy: number) => boolean;

/** Freestanding tall things that sit on a soft cast shadow. */
const GROUNDED_TALL = new Set([
  'well', 'chichaflag', 'apacheta', 'tent', 'signpost', 'cactus', 'chomba', 'loom', 'stall', 'farol',
]);

export class Tileset {
  private v = new Map<string, HTMLCanvasElement[]>();
  private water: HTMLCanvasElement[] = [];
  private seaFrames: HTMLCanvasElement[] = [];

  constructor() {
    // ------------------------------------------------------------ grounds

    // Ground tiles must be SEAMLESS: one flat base color, detail only.
    // Large-scale tonal variation is painted by the renderer across tiles.
    const groundBase = (g: CanvasRenderingContext2D, _r: Rng, base: string) => {
      rect(g, 0, 0, S, S, base);
    };

    const grassTuft = (g: CanvasRenderingContext2D, _r: Rng, x: number, y: number, c1: string, c2: string) => {
      // A soft two-leaf sprig.
      g.strokeStyle = c1;
      g.lineWidth = 2.4;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(x, y);
      g.quadraticCurveTo(x - 3, y - 5, x - 4.5, y - 9);
      g.stroke();
      g.strokeStyle = c2;
      g.beginPath();
      g.moveTo(x, y);
      g.quadraticCurveTo(x + 3, y - 6, x + 4, y - 10);
      g.stroke();
    };

    this.make('puna', 6, (g, r) => {
      groundBase(g, r, shade(PAL.gold, 0.02));
      for (let i = 0; i < 7; i++) {
        grassTuft(g, r, 10 + r.int(S - 20), 14 + r.int(S - 20), shade(PAL.goldDark, 0.06), shade(PAL.gold, 0.16));
      }
      if (r.chance(0.4)) dot(g, r.int(S), r.int(S), 2, shade(PAL.stone, 0.12));
    });

    this.make('grass', 5, (g, r) => {
      groundBase(g, r, shade(PAL.green, 0.03));
      for (let i = 0; i < 7; i++) {
        grassTuft(g, r, 10 + r.int(S - 20), 14 + r.int(S - 20), shade(PAL.greenDark, 0.1), shade(PAL.green, 0.2));
      }
      if (r.chance(0.35)) dot(g, r.int(S), r.int(S), 1.6, '#e8e6c8');
    });

    this.make('dirt', 5, (g, r) => {
      groundBase(g, r, shade(PAL.earth, 0.01));
      for (let i = 0; i < 5; i++) {
        oval(g, r.int(S), r.int(S), 3 + r.int(3), 2, shade(PAL.earth, r.chance(0.5) ? -0.12 : 0.1));
      }
      for (let i = 0; i < 3; i++) dot(g, r.int(S), r.int(S), 1.8, shade(PAL.stone, 0.05));
    });

    this.make('floorEarth', 4, (g, r) => {
      groundBase(g, r, '#9c7a52');
      for (let i = 0; i < 3; i++) {
        oval(g, r.int(S), r.int(S), 4, 2.4, shade('#9c7a52', r.chance(0.5) ? -0.06 : 0.06));
      }
    });

    this.make('pathCore', 5, (g, r) => {
      rect(g, 0, 0, S, S, shade(PAL.earthDark, 0.02));
      for (let i = 0; i < 5; i++) {
        dot(g, r.int(S), r.int(S), 2 + r.next() * 1.6, shade(PAL.stone, (r.next() - 0.5) * 0.2));
      }
      for (let i = 0; i < 3; i++) {
        oval(g, r.int(S), r.int(S), 4, 2, shade(PAL.earthDark, r.chance(0.5) ? -0.07 : 0.08));
      }
    });

    this.make('plaza', 6, (g, r) => {
      const base = shade('#9c8f76', 0.05);
      rect(g, 0, 0, S, S, base);
      const joint = 'rgba(60,50,38,0.35)';
      const sy2 = 24 + r.int(18);
      const v1 = 16 + r.int(18);
      const v2 = 34 + r.int(18);
      // Slab tones.
      rr(g, 1.5, 1.5, v1 - 3, sy2 - 3, 5, shade(base, (r.next() - 0.5) * 0.045));
      rr(g, v1 + 1.5, 1.5, S - v1 - 3, sy2 - 3, 5, shade(base, (r.next() - 0.5) * 0.045));
      rr(g, 1.5, sy2 + 1.5, v2 - 3, S - sy2 - 3, 5, shade(base, (r.next() - 0.5) * 0.04));
      rr(g, v2 + 1.5, sy2 + 1.5, S - v2 - 3, S - sy2 - 3, 5, shade(base, (r.next() - 0.5) * 0.05));
      // Joints as soft dark lines.
      g.strokeStyle = joint;
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(0, sy2); g.lineTo(S, sy2);
      g.moveTo(v1, 0); g.lineTo(v1, sy2);
      g.moveTo(v2, sy2); g.lineTo(v2, S);
      g.stroke();
      if (r.chance(0.5)) grassTuft(g, r, r.chance(0.5) ? v1 : v2, sy2 + r.int(10), PAL.greenDark, PAL.green);
    });

    this.make('crop', 5, (g, r) => {
      rect(g, 0, 0, S, S, shade(PAL.earthDark, -0.1));
      for (const row of [8, 30, 52]) {
        // The mound.
        rr(g, 0, row - 5, S, 12, 6, shade(PAL.earth, 0.02));
        vgrad(g, 0, row - 5, S, 5, shade(PAL.earth, 0.12), 'rgba(0,0,0,0)');
        // Plants along the mound.
        for (let x = 6; x < S; x += 12 + r.int(8)) {
          const c = r.chance(0.7) ? PAL.greenDark : PAL.green;
          blob(g, x, row - 4, 5.5, c, r, 0.3);
          blob(g, x - 2.5, row - 6.5, 3, shade(c, 0.18), r, 0.3);
          if (r.chance(0.12)) dot(g, x + 1, row - 9, 1.6, '#e2d4f0');
        }
      }
    });

    // Water: four frames of soft ripple bands.
    for (let f = 0; f < 4; f++) {
      const { cv, g } = surface(S, S);
      const r = new Rng(900);
      rect(g, 0, 0, S, S, shade(PAL.waterDark, 0.0));
      for (let i = 0; i < 5; i++) {
        const y = r.int(S);
        const x = (r.int(S) + f * 8) % S;
        const w = 14 + r.int(16);
        g.strokeStyle = `rgba(190,225,238,${0.1 + r.next() * 0.12})`;
        g.lineWidth = 2.2;
        g.lineCap = 'round';
        g.beginPath();
        g.moveTo(x - w / 2, y);
        g.quadraticCurveTo(x, y - 2.5, x + w / 2, y);
        g.stroke();
      }
      const spF = r.int(4);
      if (spF === f) dot(g, r.int(S), r.int(S), 1.6, '#eaf6fa');
      this.water.push(cv);
    }

    // The sea far below: paler, hazier, slower.
    for (let f = 0; f < 3; f++) {
      const { cv, g } = surface(S, S);
      const r = new Rng(1400);
      rect(g, 0, 0, S, S, '#86b6cc');
      for (let i = 0; i < 4; i++) {
        const y = r.int(S);
        const x = (r.int(S) + f * 10) % S;
        g.strokeStyle = 'rgba(230,244,250,0.25)';
        g.lineWidth = 2;
        g.beginPath();
        g.moveTo(x - 12, y);
        g.quadraticCurveTo(x, y - 2, x + 12, y);
        g.stroke();
      }
      this.seaFrames.push(cv);
    }

    this.make('bridge', 2, (g, r) => {
      vgrad(g, 0, 0, S, S, shade(PAL.earth, 0.1), shade(PAL.earth, -0.02));
      // Planks.
      for (const x of [14, 34, 52]) {
        g.strokeStyle = 'rgba(70,52,34,0.4)';
        g.lineWidth = 2;
        g.beginPath();
        g.moveTo(x + r.int(4) - 2, 6);
        g.lineTo(x + r.int(4) - 2, S - 6);
        g.stroke();
      }
      rr(g, 0, 0, S, 7, 3, shade(PAL.earthDark, -0.05));
      rr(g, 0, S - 7, S, 7, 3, shade(PAL.earthDark, -0.12));
      vgrad(g, 0, 0, S, 3, 'rgba(255,240,210,0.25)', 'rgba(0,0,0,0)');
    });

    this.make('scree', 4, (g, r) => {
      const base = shade(PAL.ink, 0.1);
      rect(g, 0, 0, S, S, base);
      for (let i = 0; i < 5; i++) {
        oval(g, r.int(S), r.int(S), 4 + r.int(4), 3, shade(base, (r.next() - 0.4) * 0.2));
      }
    });

    this.make('cliff', 3, (g, r) => {
      vgrad(g, 0, 0, S, 18, shade(PAL.earth, 0.08), shade(PAL.earth, -0.04));
      vgrad(g, 0, 18, S, S - 18, shade('#8a6a4c', 0.02), shade('#8a6a4c', -0.22));
      for (let i = 0; i < 5; i++) {
        const x = r.int(S);
        g.strokeStyle = 'rgba(50,36,24,0.25)';
        g.lineWidth = 2.5;
        g.beginPath();
        g.moveTo(x, 22 + r.int(10));
        g.lineTo(x + r.int(8) - 4, S - 4 - r.int(10));
        g.stroke();
      }
      vgrad(g, 0, 16, S, 5, 'rgba(255,236,200,0.3)', 'rgba(0,0,0,0)');
    });

    // ------------------------------------------------------------ flats

    this.make('flower', 4, (g, r) => {
      const colors = ['#f2e6d0', '#9ed3ea', '#e8a8bc', '#d97b52'];
      for (let i = 0; i < 2 + r.int(2); i++) {
        const x = 10 + r.int(S - 20);
        const y = 14 + r.int(S - 24);
        const c = colors[r.int(colors.length)] ?? '#fff';
        g.strokeStyle = PAL.greenDark;
        g.lineWidth = 2;
        g.beginPath();
        g.moveTo(x, y + 8);
        g.quadraticCurveTo(x + 2, y + 4, x, y);
        g.stroke();
        for (let p = 0; p < 5; p++) {
          const a = (p / 5) * Math.PI * 2;
          dot(g, x + Math.cos(a) * 3.2, y + Math.sin(a) * 3.2, 2.4, c);
        }
        dot(g, x, y, 2, PAL.gold);
      }
    });

    this.make('tuft', 3, (g, r) => {
      const cx = S / 2;
      const cy = S - 12;
      for (let i = -4; i <= 4; i++) {
        g.strokeStyle = i % 2 ? shade(PAL.gold, 0.14) : shade(PAL.goldDark, 0.05);
        g.lineWidth = 2.6;
        g.lineCap = 'round';
        g.beginPath();
        g.moveTo(cx, cy);
        g.quadraticCurveTo(cx + i * 3, cy - 12, cx + i * 4.5, cy - 18 - r.int(8));
        g.stroke();
      }
      softShadow(g, cx, cy + 2, 12, 4, 0.16);
    });

    this.make('rock', 3, (g, r) => {
      const x = 22 + r.int(16);
      const y = 34 + r.int(10);
      softShadow(g, x, y + 8, 16, 5, 0.2);
      blob(g, x, y, 11, shade(PAL.stone, 0.02), r, 0.18);
      blob(g, x - 3, y - 4, 6.5, shade(PAL.stone, 0.16), r, 0.2);
      if (r.chance(0.6)) blob(g, x + 12, y + 5, 5, shade(PAL.stoneDark, 0.05), r, 0.2);
    });

    this.make('shrub', 3, (g, r) => {
      const x = S / 2 + r.int(10) - 5;
      const y = S - 20;
      softShadow(g, x, y + 8, 18, 6, 0.2);
      blob(g, x, y, 14, '#6b7d46', r, 0.25);
      blob(g, x - 5, y - 5, 8, shade('#6b7d46', 0.14), r, 0.25);
      blob(g, x + 7, y - 2, 6, shade('#6b7d46', -0.1), r, 0.25);
    });

    this.make('rug', 2, (g, r) => {
      const bands = [PAL.terracotta, PAL.gold, PAL.skyDeep, '#7a4460'];
      rr(g, 3, 3, S - 6, S - 6, 4, shade(PAL.cream, -0.06));
      for (let y = 6; y < S - 6; y += 7) {
        const c = bands[Math.floor(y / 7) % bands.length] ?? PAL.gold;
        rr(g, 5, y, S - 10, 5, 2, shade(c, r.chance(0.3) ? -0.06 : 0));
      }
      // Fringe.
      g.strokeStyle = PAL.cream;
      g.lineWidth = 1.6;
      for (let x = 6; x < S - 6; x += 5) {
        g.beginPath(); g.moveTo(x, 3); g.lineTo(x, 0.5); g.stroke();
        g.beginPath(); g.moveTo(x, S - 3); g.lineTo(x, S - 0.5); g.stroke();
      }
    });

    this.make('mat', 1, (g) => {
      rr(g, 8, 10, S - 16, S - 20, 5, '#c9b48a');
      rr(g, 11, 13, S - 22, S - 26, 4, shade('#c9b48a', -0.07));
      g.strokeStyle = 'rgba(90,70,45,0.3)';
      g.lineWidth = 1.6;
      for (let y = 17; y < S - 14; y += 6) {
        g.beginPath(); g.moveTo(12, y); g.lineTo(S - 12, y); g.stroke();
      }
    });

    this.make('cuy', 3, (g, r) => {
      const fur = r.pick(['#8a5a36', '#5c4030', '#c9a276']);
      const x = 24 + r.int(14);
      const y = 34 + r.int(8);
      softShadow(g, x + 2, y + 7, 12, 4, 0.18);
      oval(g, x, y, 11, 7, fur);
      dot(g, x + 10, y - 3, 5.5, fur); // head
      dot(g, x + 12.5, y - 4, 1.2, '#241a12'); // eye
      oval(g, x + 8, y - 8, 2, 2.8, shade(fur, -0.2)); // ear
      oval(g, x - 4, y - 3, 4, 3, shade(fur, 0.16)); // rump highlight
    });

    this.make('bench', 2, (g, r) => {
      const wood = '#8a6238';
      softShadow(g, S / 2, 52, 26, 6, 0.2);
      rr(g, 8, 40, 6, 12, 2, shade(wood, -0.14));
      rr(g, S - 14, 40, 6, 12, 2, shade(wood, -0.14));
      rr(g, 4, 30, S - 8, 12, 5, wood);
      vgrad(g, 4, 30, S - 8, 5, 'rgba(255,235,200,0.3)', 'rgba(0,0,0,0)');
      if (r.chance(0.5)) rr(g, 18 + r.int(14), 26, 14, 6, 3, PAL.terracotta); // folded manta
    });

    this.make('woodpile', 3, (g, r) => {
      const wood = '#7a5636';
      softShadow(g, S / 2, 56, 26, 6, 0.2);
      for (let row = 0; row < 3; row++) {
        const y = 48 - row * 10;
        const off = row % 2 ? 7 : 0;
        for (let x = 10 + off; x < S - 12; x += 13) {
          dot(g, x, y, 6, shade(wood, (r.next() - 0.5) * 0.16));
          dot(g, x, y, 3.6, shade('#c9a26a', 0.08));
          dot(g, x - 1, y - 1, 1.4, shade('#c9a26a', 0.25));
        }
      }
    });

    this.make('planter', 3, (g, r) => {
      const clay = '#a5643c';
      softShadow(g, S / 2, 54, 24, 5, 0.2);
      rr(g, 10, 38, S - 20, 16, 4, clay);
      vgrad(g, 10, 38, S - 20, 5, 'rgba(255,225,190,0.3)', 'rgba(0,0,0,0)');
      for (let i = 0; i < 6; i++) {
        const fx = 16 + r.int(S - 32);
        const fy = 28 + r.int(8);
        blob(g, fx, fy + 5, 4, PAL.greenDark, r, 0.3);
        dot(g, fx, fy, 3, r.chance(0.6) ? PAL.terracotta : '#e8a8bc');
        dot(g, fx - 1, fy - 1, 1.2, 'rgba(255,255,255,0.5)');
      }
    });

    this.make('qoncha', 3, (g, r) => {
      softShadow(g, S / 2, 56, 26, 6, 0.2);
      blob(g, S / 2, 44, 20, shade(PAL.stoneDark, 0.05), r, 0.12);
      blob(g, S / 2, 40, 15, shade(PAL.stoneDark, -0.06), r, 0.12);
      oval(g, S / 2, 40, 10, 7, '#241a12'); // firebox mouth
      // Pot above.
      oval(g, S / 2, 22, 12, 8, '#5a4030');
      oval(g, S / 2, 18, 12, 4, shade('#5a4030', 0.2));
    });

    this.make('campfire', 2, (g, r) => {
      softShadow(g, S / 2, 52, 24, 6, 0.2);
      for (let i = 0; i < 7; i++) {
        const a = (i / 7) * Math.PI * 2;
        dot(g, S / 2 + Math.cos(a) * 16, 46 + Math.sin(a) * 7, 5, shade(r.chance(0.5) ? PAL.stone : PAL.stoneDark, 0.02));
      }
      // Logs.
      g.strokeStyle = '#4d3a28';
      g.lineWidth = 5;
      g.lineCap = 'round';
      g.beginPath(); g.moveTo(S / 2 - 10, 48); g.lineTo(S / 2 + 10, 42); g.stroke();
      g.beginPath(); g.moveTo(S / 2 - 8, 42); g.lineTo(S / 2 + 10, 48); g.stroke();
      dot(g, S / 2, 44, 6, '#241a12');
    });

    this.make('table', 2, (g, r) => {
      const wood = '#8a6238';
      softShadow(g, S / 2, 56, 28, 6, 0.2);
      rr(g, 10, 44, 7, 12, 2, shade(wood, -0.16));
      rr(g, S - 17, 44, 7, 12, 2, shade(wood, -0.16));
      rr(g, 4, 14, S - 8, 34, 6, wood);
      vgrad(g, 4, 14, S - 8, 8, 'rgba(255,235,200,0.28)', 'rgba(0,0,0,0)');
      if (r.chance(0.6)) {
        dot(g, 22, 28, 6, PAL.cream); // cup
        oval(g, 42, 32, 8, 5, '#b5713f'); // dish of cancha
        dot(g, 40, 30, 1.6, PAL.gold);
        dot(g, 44, 31, 1.6, PAL.gold);
      }
    });

    this.make('stool', 2, (g) => {
      const wood = '#8a6238';
      softShadow(g, S / 2, 52, 18, 5, 0.18);
      rr(g, 22, 40, 5, 12, 2, shade(wood, -0.15));
      rr(g, S - 27, 40, 5, 12, 2, shade(wood, -0.15));
      oval(g, S / 2, 34, 15, 9, wood);
      oval(g, S / 2, 32, 15, 7, shade(wood, 0.12));
    });

    this.make('pot', 2, (g, r) => {
      const clay = '#a5643c';
      const x = 24 + r.int(14);
      softShadow(g, x, 52, 16, 5, 0.18);
      // Bellied pot.
      oval(g, x, 40, 13, 12, clay);
      oval(g, x - 4, 35, 5, 6, shade(clay, 0.18));
      oval(g, x, 28, 8, 3.5, shade(clay, -0.22));
      oval(g, x, 28, 5.5, 2.2, '#241a12');
    });

    this.make('gateOpen', 1, (g) => {
      const wood = '#7a5636';
      rr(g, 2, 10, 7, S - 14, 2, wood);
      vgrad(g, 2, 10, 7, 6, 'rgba(255,235,200,0.3)', 'rgba(0,0,0,0)');
      // Leaf folded back along the top.
      rr(g, 8, 10, 44, 12, 3, shade(wood, -0.05));
      g.strokeStyle = 'rgba(50,36,24,0.4)';
      g.lineWidth = 2;
      for (const lx of [20, 32, 44]) {
        g.beginPath(); g.moveTo(lx, 11); g.lineTo(lx, 21); g.stroke();
      }
    });

    // ------------------------------------------------------------ talls

    this.make('wallStone', 5, (g, r) => {
      // Dry-stone ridge: a soft mound of fitted boulders.
      vgrad(g, 0, 0, S, 40, shade(PAL.stone, 0.1), shade(PAL.stone, -0.02));
      vgrad(g, 0, 40, S, 24, shade(PAL.stoneDark, 0.02), shade(PAL.stoneDark, -0.12));
      let x = 4;
      while (x < S - 6) {
        const w = 12 + r.int(10);
        const tone = shade(PAL.stone, (r.next() - 0.35) * 0.2);
        blob(g, x + w / 2, 14 + r.int(14), w / 2, tone, r, 0.15);
        x += w + 3;
      }
      for (let i = 0; i < 3; i++) {
        blob(g, 8 + r.int(S - 16), 46 + r.int(10), 6, shade(PAL.stoneDark, (r.next() - 0.4) * 0.16), r, 0.18);
      }
      if (r.chance(0.4)) dot(g, r.int(S), 10 + r.int(24), 2.4, PAL.greenDark);
    });

    this.make('tree', 3, (g, r) => {
      // 128x144: a full smooth tree: blob canopy in three tones over a
      // gently curved trunk.
      const W = 128;
      const trunk = '#7a4a33';
      g.strokeStyle = trunk;
      g.lineWidth = 11;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(W / 2 + 2, 138);
      g.quadraticCurveTo(W / 2 - 2, 110, W / 2 + 1, 88);
      g.stroke();
      g.strokeStyle = shade(trunk, 0.14);
      g.lineWidth = 4;
      g.beginPath();
      g.moveTo(W / 2 - 2, 134);
      g.quadraticCurveTo(W / 2 - 5, 112, W / 2 - 3, 92);
      g.stroke();
      // Root flare.
      oval(g, W / 2, 138, 14, 5, shade(trunk, -0.12));
      // Canopy.
      const dark = shade(PAL.greenDark, -0.1);
      blob(g, W / 2, 56, 42, dark, r, 0.18);
      blob(g, W / 2 - 30, 68, 24, dark, r, 0.2);
      blob(g, W / 2 + 30, 66, 24, dark, r, 0.2);
      blob(g, W / 2 - 14, 46, 26, PAL.greenDark, r, 0.22);
      blob(g, W / 2 + 18, 52, 22, PAL.greenDark, r, 0.22);
      blob(g, W / 2 - 22, 40, 16, PAL.green, r, 0.25);
      blob(g, W / 2 + 8, 36, 18, PAL.green, r, 0.25);
      blob(g, W / 2 - 8, 30, 12, shade(PAL.green, 0.2), r, 0.28);
      blob(g, W / 2 + 22, 42, 9, shade(PAL.green, 0.16), r, 0.28);
      if (r.chance(0.6)) {
        for (let i = 0; i < 5; i++) dot(g, W / 2 - 30 + r.int(60), 34 + r.int(30), 2.2, PAL.terracotta);
      }
    }, 128, 144);

    this.make('house', 4, (g, r) => {
      // 352x256: the illustrated home, smooth edition.
      const W = 352;
      const plaster = shade(PAL.adobe, 0.1 + r.next() * 0.08);
      const straw = shade('#a87f48', (r.next() - 0.5) * 0.1);
      const wallTop = 122;
      const wallBot = 252;

      // Front wall with a gentle vertical gradient.
      vgrad(g, 16, wallTop, W - 32, wallBot - wallTop, shade(plaster, 0.06), shade(plaster, -0.07));
      // Soft tone patches and a worn brick spot.
      for (let i = 0; i < 5; i++) {
        glowSpot(g, 30 + r.int(W - 60), wallTop + 20 + r.int(90), 26, shade(plaster, (r.next() - 0.5) * 0.12), 0.5);
      }
      if (r.chance(0.7)) {
        const bx = r.chance(0.5) ? 36 : W - 96;
        const by = wallBot - 40 - r.int(20);
        rr(g, bx, by, 52, 28, 6, shade(PAL.adobe, -0.02));
        g.strokeStyle = 'rgba(90,55,35,0.4)';
        g.lineWidth = 2.4;
        g.beginPath();
        g.moveTo(bx + 4, by + 14); g.lineTo(bx + 48, by + 14);
        g.moveTo(bx + 26, by + 2); g.lineTo(bx + 26, by + 13);
        g.moveTo(bx + 14, by + 15); g.lineTo(bx + 14, by + 26);
        g.stroke();
      }
      // Base course + splash stain.
      vgrad(g, 16, wallBot - 14, W - 32, 14, 'rgba(0,0,0,0)', 'rgba(60,40,24,0.28)');
      // Side shading.
      vgrad(g, W - 34, wallTop, 18, wallBot - wallTop, 'rgba(0,0,0,0)', 'rgba(0,0,0,0)');
      g.save();
      g.globalAlpha = 0.18;
      g.fillStyle = '#241a12';
      g.fillRect(W - 26, wallTop, 10, wallBot - wallTop);
      g.restore();

      // Door: recessed, warm wood, rounded lintel.
      rr(g, 150, wallBot - 96, 66, 96, 6, shade(plaster, -0.34));
      rr(g, 156, wallBot - 88, 54, 88, 5, '#57402c');
      vgrad(g, 156, wallBot - 88, 54, 24, 'rgba(255,230,190,0.15)', 'rgba(0,0,0,0)');
      g.strokeStyle = 'rgba(35,24,15,0.5)';
      g.lineWidth = 2.4;
      for (const lx of [174, 192]) {
        g.beginPath(); g.moveTo(lx, wallBot - 84); g.lineTo(lx, wallBot - 6); g.stroke();
      }
      dot(g, 204, wallBot - 46, 3, PAL.gold); // handle
      rr(g, 146, wallBot - 102, 74, 10, 5, '#6b4a30'); // lintel beam
      // Chili ristra by the door.
      if (r.chance(0.6)) {
        const rx2 = r.chance(0.5) ? 134 : 232;
        g.strokeStyle = '#4d3a28';
        g.lineWidth = 2;
        g.beginPath(); g.moveTo(rx2, wallBot - 88); g.lineTo(rx2, wallBot - 74); g.stroke();
        for (let k = 0; k < 5; k++) {
          oval(g, rx2 + (k % 2 ? 3 : -3) * 0.7, wallBot - 72 + k * 6, 3.4, 5, k % 2 ? PAL.terracotta : shade(PAL.terracotta, -0.16));
        }
      }

      // Windows: deep, glowing glass, flower boxes.
      for (const wx of [52, 252]) {
        rr(g, wx, wallTop + 26, 48, 44, 6, shade(plaster, -0.34));
        rr(g, wx + 4, wallTop + 30, 40, 36, 5, '#2c3e57');
        vgrad(g, wx + 4, wallTop + 30, 40, 14, 'rgba(180,210,240,0.4)', 'rgba(0,0,0,0)');
        g.strokeStyle = '#6b4a30';
        g.lineWidth = 3;
        g.beginPath();
        g.moveTo(wx + 24, wallTop + 30); g.lineTo(wx + 24, wallTop + 66);
        g.moveTo(wx + 4, wallTop + 48); g.lineTo(wx + 44, wallTop + 48);
        g.stroke();
        rr(g, wx - 3, wallTop + 70, 54, 8, 4, shade(plaster, 0.12)); // sill
        // Flower box.
        rr(g, wx, wallTop + 78, 48, 12, 4, '#8a5330');
        for (let k = 0; k < 6; k++) {
          dot(g, wx + 6 + k * 8, wallTop + 76, 3.4, k % 2 ? PAL.terracotta : '#e8a8bc');
          dot(g, wx + 9 + k * 8, wallTop + 79, 2.6, PAL.greenDark);
        }
      }

      // Eave shadow.
      vgrad(g, 16, wallTop, W - 32, 18, 'rgba(30,20,12,0.4)', 'rgba(0,0,0,0)');

      // Roof: big smooth slope with painterly straw strokes.
      const roofBot = wallTop + 8;
      const roofTop = 16;
      g.beginPath();
      g.moveTo(4, roofBot);
      g.lineTo(24, roofTop);
      g.quadraticCurveTo(W / 2, roofTop - 8, W - 24, roofTop);
      g.lineTo(W - 4, roofBot);
      g.closePath();
      const roofGrad = g.createLinearGradient(0, roofTop - 8, 0, roofBot);
      roofGrad.addColorStop(0, shade(straw, 0.12));
      roofGrad.addColorStop(1, shade(straw, -0.1));
      g.fillStyle = roofGrad;
      g.fill();
      // Straw strokes.
      g.save();
      g.clip();
      for (let i = 0; i < 60; i++) {
        const sxp = 8 + r.int(W - 16);
        const syp = roofTop - 4 + r.int(roofBot - roofTop + 4);
        g.strokeStyle = `rgba(${r.chance(0.5) ? '120,86,48' : '215,180,120'},${0.16 + r.next() * 0.14})`;
        g.lineWidth = 1.8;
        g.beginPath();
        g.moveTo(sxp, syp);
        g.lineTo(sxp + (r.next() - 0.5) * 6, syp + 10 + r.int(8));
        g.stroke();
      }
      // Course shadows.
      for (const cy2 of [roofTop + 24, roofTop + 52, roofTop + 80]) {
        vgrad(g, 0, cy2, W, 8, 'rgba(60,42,24,0.22)', 'rgba(0,0,0,0)');
      }
      g.restore();
      // Ridge cap.
      g.strokeStyle = shade(straw, -0.28);
      g.lineWidth = 7;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(26, roofTop + 1);
      g.quadraticCurveTo(W / 2, roofTop - 7, W - 26, roofTop + 1);
      g.stroke();
      // Chimney.
      rr(g, 232, roofTop - 22, 26, 26, 4, shade(PAL.adobe, -0.04));
      rr(g, 228, roofTop - 26, 34, 8, 4, shade(PAL.adobe, -0.26));
      // Toritos and their cross on some ridges.
      if (r.chance(0.65)) {
        const tx2 = 100 + r.int(60);
        for (const bx of [tx2, tx2 + 34]) {
          oval(g, bx, roofTop - 8, 9, 5.5, '#b5573a');
          dot(g, bx + 8, roofTop - 11, 3.4, '#8a3a2e');
          g.strokeStyle = '#e8dcc4';
          g.lineWidth = 1.6;
          g.beginPath(); g.moveTo(bx + 10, roofTop - 14); g.lineTo(bx + 12, roofTop - 16); g.stroke();
        }
        g.strokeStyle = '#6b4a30';
        g.lineWidth = 2.6;
        g.beginPath();
        g.moveTo(tx2 + 17, roofTop - 24); g.lineTo(tx2 + 17, roofTop - 10);
        g.moveTo(tx2 + 12, roofTop - 19); g.lineTo(tx2 + 22, roofTop - 19);
        g.stroke();
      }
    }, 352, 256);

    this.make('well', 1, (g) => {
      const W = 64;
      softShadow(g, W / 2, 88, 26, 7, 0.22);
      // Posts.
      rr(g, 10, 22, 6, 56, 2, PAL.earthDark);
      rr(g, W - 16, 22, 6, 56, 2, PAL.earthDark);
      // Little thatch cap.
      g.beginPath();
      g.moveTo(2, 22);
      g.quadraticCurveTo(W / 2, 2, W - 2, 22);
      g.lineTo(W - 8, 28);
      g.quadraticCurveTo(W / 2, 10, 8, 28);
      g.closePath();
      g.fillStyle = '#c9a86a';
      g.fill();
      // Rope and bucket.
      g.strokeStyle = PAL.cream;
      g.lineWidth = 2;
      g.beginPath(); g.moveTo(W / 2, 24); g.lineTo(W / 2, 58); g.stroke();
      rr(g, W / 2 - 6, 56, 12, 9, 3, PAL.earthDark);
      // Stone ring.
      oval(g, W / 2, 78, 24, 13, shade(PAL.stone, 0.02));
      oval(g, W / 2, 74, 19, 9, '#241a12');
      oval(g, W / 2, 84, 24, 7, shade(PAL.stoneDark, -0.05));
    }, 64, 96);

    this.make('chichaflag', 1, (g) => {
      softShadow(g, 30, 88, 12, 4, 0.18);
      rr(g, 28, 16, 4, 76, 2, PAL.earthDark);
      // The red cloth, waving softly.
      g.beginPath();
      g.moveTo(32, 16);
      g.quadraticCurveTo(58, 20, 56, 34);
      g.quadraticCurveTo(44, 30, 32, 36);
      g.closePath();
      g.fillStyle = PAL.terracotta;
      g.fill();
      g.beginPath();
      g.moveTo(32, 22);
      g.quadraticCurveTo(48, 26, 50, 32);
      g.strokeStyle = shade(PAL.terracotta, -0.2);
      g.lineWidth = 2;
      g.stroke();
    }, 64, 96);

    this.make('doorShut', 2, (g) => {
      // Drawn over the house doorway when latched.
      rr(g, 10, 8, 44, 56, 5, '#57402c');
      vgrad(g, 10, 8, 44, 16, 'rgba(255,230,190,0.16)', 'rgba(0,0,0,0)');
      g.strokeStyle = 'rgba(35,24,15,0.5)';
      g.lineWidth = 2.2;
      for (const lx of [24, 38]) {
        g.beginPath(); g.moveTo(lx, 12); g.lineTo(lx, 60); g.stroke();
      }
      dot(g, 46, 36, 3, PAL.gold);
    });

    this.make('gate', 2, (g) => {
      const wood = '#7a5636';
      for (const x of [6, 22, 38, 54]) {
        rr(g, x, 20, 7, 72, 3, wood);
        vgrad(g, x, 20, 7, 8, 'rgba(255,235,200,0.25)', 'rgba(0,0,0,0)');
      }
      rr(g, 0, 24, S, 8, 3, shade(wood, 0.1));
      rr(g, 0, 56, S, 8, 3, shade(wood, -0.1));
      rr(g, 0, 84, S, 8, 3, shade(wood, -0.2));
    }, 64, 96);

    this.make('cactus', 3, (g, r) => {
      const green = '#5f7d4a';
      const x = 26 + r.int(12);
      softShadow(g, x + 4, 90, 14, 4, 0.2);
      // Main column.
      rr(g, x, 24, 13, 68, 6.5, green);
      vgrad(g, x, 24, 5, 68, 'rgba(230,255,210,0.22)', 'rgba(0,0,0,0)');
      // Arm.
      rr(g, x - 12, 40, 9, 22, 4.5, green);
      rr(g, x - 12, 36, 20, 9, 4.5, green);
      // Spines.
      g.strokeStyle = 'rgba(30,45,25,0.4)';
      g.lineWidth = 1.4;
      for (let i = 0; i < 8; i++) {
        const sy2 = 30 + r.int(56);
        g.beginPath(); g.moveTo(x + 2 + r.int(9), sy2); g.lineTo(x + 2 + r.int(9), sy2 + 4); g.stroke();
      }
      if (r.chance(0.4)) dot(g, x + 6, 22, 3.4, '#e8a8bc');
    }, 64, 96);

    this.make('apacheta', 1, (g) => {
      const r = new Rng(77);
      softShadow(g, 32, 90, 24, 6, 0.22);
      const stones: [number, number, number][] = [
        [32, 78, 20], [32, 62, 16], [32, 48, 12], [32, 36, 9], [32, 27, 6],
      ];
      for (const [x, y, rad] of stones) {
        blob(g, x + r.int(5) - 2, y, rad, shade(PAL.stone, (r.next() - 0.35) * 0.2), r, 0.15);
      }
      dot(g, 24, 60, 2.4, PAL.terracotta);
      dot(g, 40, 72, 2.4, PAL.skyDeep);
      dot(g, 33, 44, 2.4, PAL.gold);
    }, 64, 96);

    this.make('tent', 1, (g) => {
      softShadow(g, 34, 90, 28, 6, 0.22);
      g.beginPath();
      g.moveTo(6, 88);
      g.lineTo(32, 26);
      g.lineTo(60, 88);
      g.closePath();
      const grad = g.createLinearGradient(0, 26, 0, 88);
      grad.addColorStop(0, shade('#c9b48a', 0.1));
      grad.addColorStop(1, shade('#c9b48a', -0.08));
      g.fillStyle = grad;
      g.fill();
      // Opening.
      g.beginPath();
      g.moveTo(22, 88);
      g.lineTo(32, 46);
      g.lineTo(43, 88);
      g.closePath();
      g.fillStyle = 'rgba(28,20,12,0.85)';
      g.fill();
      g.strokeStyle = shade('#c9b48a', -0.25);
      g.lineWidth = 3;
      g.beginPath(); g.moveTo(32, 26); g.lineTo(32, 46); g.stroke();
    }, 64, 96);

    this.make('signpost', 1, (g) => {
      softShadow(g, 32, 90, 14, 4, 0.18);
      rr(g, 29, 30, 6, 60, 2, '#7a5636');
      // Board with arrow tip.
      g.beginPath();
      g.moveTo(12, 34);
      g.lineTo(48, 34);
      g.lineTo(58, 43);
      g.lineTo(48, 52);
      g.lineTo(12, 52);
      g.closePath();
      g.fillStyle = '#8a6238';
      g.fill();
      vgrad(g, 12, 34, 46, 6, 'rgba(255,235,200,0.3)', 'rgba(0,0,0,0)');
      g.strokeStyle = 'rgba(35,24,15,0.6)';
      g.lineWidth = 2;
      for (const lx of [20, 28, 36, 44]) {
        g.beginPath(); g.moveTo(lx, 41); g.lineTo(lx + 4, 41); g.stroke();
      }
    }, 64, 96);

    this.make('farol', 2, (g) => {
      const wood = '#5c4630';
      softShadow(g, 32, 90, 12, 4, 0.18);
      rr(g, 29, 26, 6, 64, 2, wood);
      // Lamp box with warm glass.
      rr(g, 20, 2, 24, 26, 5, shade(wood, -0.1));
      rr(g, 24, 6, 16, 18, 4, '#f2d8a0');
      glowSpot(g, 32, 15, 14, '#ffefc0', 0.9);
      rr(g, 18, 0, 28, 5, 2.5, shade(wood, -0.25));
    }, 64, 96);

    this.make('stall', 2, (g, r) => {
      const cloth = r.chance(0.5) ? PAL.terracotta : PAL.skyDeep;
      softShadow(g, 32, 90, 28, 6, 0.22);
      // Posts.
      rr(g, 8, 36, 6, 52, 2, '#7a5636');
      rr(g, 50, 36, 6, 52, 2, '#7a5636');
      // Counter with produce.
      rr(g, 6, 58, 52, 20, 4, '#8a6238');
      vgrad(g, 6, 58, 52, 6, 'rgba(255,235,200,0.3)', 'rgba(0,0,0,0)');
      dot(g, 18, 56, 4.6, PAL.gold);
      dot(g, 30, 55, 4.2, PAL.terracotta);
      dot(g, 42, 56, 4.4, PAL.greenDark);
      // Scalloped awning.
      g.beginPath();
      g.moveTo(2, 20);
      g.lineTo(62, 20);
      g.lineTo(62, 34);
      for (let x = 62; x > 2; x -= 12) {
        g.quadraticCurveTo(x - 6, 42, x - 12, 34);
      }
      g.closePath();
      g.fillStyle = cloth;
      g.fill();
      // Stripes.
      g.save();
      g.clip();
      g.fillStyle = PAL.cream;
      for (let x = 8; x < 64; x += 24) g.fillRect(x, 18, 12, 26);
      g.restore();
      vgrad(g, 2, 20, 60, 5, 'rgba(255,255,255,0.3)', 'rgba(0,0,0,0)');
    }, 64, 96);

    this.make('chomba', 1, (g) => {
      const clay = '#a5643c';
      softShadow(g, 32, 90, 22, 6, 0.22);
      oval(g, 32, 62, 22, 25, clay);
      oval(g, 24, 52, 7, 11, shade(clay, 0.18));
      oval(g, 32, 36, 12, 5, shade(clay, -0.2));
      oval(g, 32, 36, 8, 3.4, '#241a12');
      // Cloth over the shoulder.
      g.beginPath();
      g.moveTo(38, 40);
      g.quadraticCurveTo(52, 46, 50, 60);
      g.lineTo(42, 58);
      g.quadraticCurveTo(44, 48, 36, 44);
      g.closePath();
      g.fillStyle = PAL.cream;
      g.fill();
    }, 64, 96);

    this.make('loom', 1, (g) => {
      softShadow(g, 32, 90, 22, 5, 0.2);
      rr(g, 8, 8, 6, 80, 2, '#7a5636');
      rr(g, 50, 14, 6, 74, 2, '#7a5636');
      // Warp threads.
      g.strokeStyle = 'rgba(242,230,208,0.8)';
      g.lineWidth = 1.4;
      for (let x = 18; x <= 46; x += 4) {
        g.beginPath(); g.moveTo(x, 20); g.lineTo(x, 72); g.stroke();
      }
      // Woven band.
      rr(g, 16, 40, 32, 32, 3, PAL.terracotta);
      rect(g, 16, 48, 32, 4, PAL.cream);
      rect(g, 16, 60, 32, 4, PAL.gold);
      dot(g, 32, 55, 2.4, PAL.skyDeep);
      rr(g, 12, 72, 40, 7, 3, '#8a6238');
    }, 64, 96);

    this.make('shelf', 3, (g, r) => {
      const base = '#6e5138';
      vgrad(g, 0, 0, S, S, shade(base, 0.04), shade(base, -0.08));
      vgrad(g, 0, 0, S, 12, 'rgba(20,12,6,0.4)', 'rgba(0,0,0,0)');
      rr(g, 4, 24, S - 8, 5, 2, '#8a6238');
      rr(g, 4, 48, S - 8, 5, 2, '#8a6238');
      for (let i = 0; i < 3; i++) {
        const x = 10 + i * 18 + r.int(6);
        oval(g, x, 18, 5.5, 6, r.chance(0.5) ? PAL.cream : '#b5713f');
        oval(g, x + 4, 43, 5, 5, r.chance(0.5) ? '#a5643c' : PAL.cream);
      }
    });

    this.make('bed', 1, (g) => {
      const frame = '#7a5636';
      softShadow(g, S / 2, 58, 28, 6, 0.2);
      rr(g, 4, 8, S - 8, 50, 6, frame);
      rr(g, 8, 12, S - 16, 42, 5, '#e2d4b4');
      // Striped blanket.
      rr(g, 8, 30, S - 16, 24, 5, PAL.terracotta);
      rect(g, 8, 36, S - 16, 4, PAL.gold);
      rect(g, 8, 44, S - 16, 4, PAL.skyDeep);
      // Pillow.
      rr(g, 12, 14, 18, 12, 5, '#f2ead8');
    });

    this.make('wallInt', 6, (g, r) => {
      const base = '#6e5138';
      vgrad(g, 0, 0, S, S, shade(base, -0.14), shade(base, 0.03));
      vgrad(g, 0, 0, S, 16, 'rgba(15,10,6,0.5)', 'rgba(0,0,0,0)'); // soot
      const deco = r.int(4);
      if (deco === 0) {
        // Chili ristra.
        g.strokeStyle = '#4d3a28';
        g.lineWidth = 2;
        g.beginPath(); g.moveTo(32, 14); g.lineTo(32, 24); g.stroke();
        for (let k = 0; k < 4; k++) {
          oval(g, 32 + (k % 2 ? 3 : -3), 27 + k * 6, 3, 4.6, k % 2 ? PAL.terracotta : shade(PAL.terracotta, -0.16));
        }
      } else if (deco === 1) {
        // Herb bunch.
        g.strokeStyle = '#c9b48a';
        g.lineWidth = 2;
        g.beginPath(); g.moveTo(34, 14); g.lineTo(34, 22); g.stroke();
        blob(g, 34, 32, 9, PAL.greenDark, r, 0.3);
        blob(g, 30, 28, 5, PAL.green, r, 0.3);
      } else if (deco === 2) {
        // Deep little window with light.
        rr(g, 18, 20, 28, 26, 5, shade(base, -0.3));
        rr(g, 22, 24, 20, 18, 4, '#e8d9a8');
        glowSpot(g, 32, 32, 16, '#f6ecc8', 0.7);
      }
    });

    // Legacy kinds some content still references; simple smooth stand-ins.
    this.make('adobe', 2, (g, r) => {
      vgrad(g, 0, 0, S, S, shade(PAL.adobe, 0.12), shade(PAL.adobe, -0.02));
      glowSpot(g, r.int(S), r.int(S), 20, shade(PAL.adobe, -0.08), 0.4);
    });
    this.make('thatch', 2, (g, r) => {
      vgrad(g, 0, 0, S, S, shade('#a87f48', 0.08), shade('#a87f48', -0.06));
      for (let i = 0; i < 12; i++) {
        g.strokeStyle = `rgba(120,86,48,${0.2 + r.next() * 0.1})`;
        g.lineWidth = 1.6;
        const x = r.int(S);
        g.beginPath(); g.moveTo(x, r.int(S)); g.lineTo(x + 2, r.int(S)); g.stroke();
      }
    });
    this.make('thatchRidge', 2, (g) => {
      vgrad(g, 0, 0, S, S, shade('#a87f48', -0.1), shade('#a87f48', 0.02));
    });
  }

  private make(
    kind: string,
    n: number,
    fn: (g: CanvasRenderingContext2D, r: Rng, i: number) => void,
    w = S,
    h = S,
  ) {
    const out: HTMLCanvasElement[] = [];
    for (let i = 0; i < n; i++) {
      const { cv, g } = surface(w, h);
      fn(g, new Rng(kind.length * 7919 + i * 104729 + 17), i);
      out.push(cv);
    }
    this.v.set(kind, out);
  }

  private variant(kind: string, cx: number, cy: number): HTMLCanvasElement {
    const list = this.v.get(kind);
    if (!list || list.length === 0) return this.fallback();
    const pick = list[Math.floor(cellHash(cx, cy, 5) * list.length)];
    return pick ?? this.fallback();
  }

  private missing: HTMLCanvasElement | null = null;
  private fallback(): HTMLCanvasElement {
    if (!this.missing) {
      const { cv, g } = surface(S, S);
      rect(g, 0, 0, S, S, '#ff00ff');
      this.missing = cv;
    }
    return this.missing;
  }

  /** All coordinates below are high-res screen pixels (logical * ART). */

  drawGround(
    g: CanvasRenderingContext2D,
    kind: string,
    sx: number,
    sy: number,
    cx: number,
    cy: number,
    conn: Conn,
    time: number,
  ) {
    if (kind === 'sea') {
      const f = this.seaFrames[Math.floor(time * 1.4) % 3];
      if (f) g.drawImage(f, sx, sy);
      return;
    }
    if (kind === 'water') {
      const f = this.water[Math.floor(time * 2.2) % 4];
      if (f) g.drawImage(f, sx, sy);
      // Soft sandy banks with a lapping waterline.
      const sand = '#d9c188';
      const lap = 'rgba(180,220,235,0.7)';
      const lapOff = Math.sin(time * 2.4 + cx * 0.8 + cy) > 0 ? 1.5 : 0;
      g.fillStyle = sand;
      if (!conn(0, -1)) {
        g.fillRect(sx, sy, S, 4);
        g.fillStyle = lap;
        g.fillRect(sx, sy + 4 + lapOff, S, 2.4);
        g.fillStyle = sand;
      }
      if (!conn(0, 1)) {
        g.fillRect(sx, sy + S - 4, S, 4);
        g.fillStyle = lap;
        g.fillRect(sx, sy + S - 7 - lapOff, S, 2.4);
        g.fillStyle = sand;
      }
      if (!conn(-1, 0)) {
        g.fillRect(sx, sy, 4, S);
        g.fillStyle = lap;
        g.fillRect(sx + 4 + lapOff, sy, 2.4, S);
        g.fillStyle = sand;
      }
      if (!conn(1, 0)) {
        g.fillRect(sx + S - 4, sy, 4, S);
        g.fillStyle = lap;
        g.fillRect(sx + S - 7 - lapOff, sy, 2.4, S);
      }
      return;
    }

    if (kind === 'path') {
      g.drawImage(this.variant('puna', cx, cy), sx, sy);
      const l = conn(-1, 0) ? 0 : 8;
      const rgt = conn(1, 0) ? 0 : 8;
      const t = conn(0, -1) ? 0 : 8;
      const b = conn(0, 1) ? 0 : 8;
      const core = this.variant('pathCore', cx, cy);
      g.save();
      g.beginPath();
      // Round only true outer corners (both adjoining sides open).
      g.roundRect(sx + l, sy + t, S - l - rgt, S - t - b, [
        t && l ? 14 : 0,
        t && rgt ? 14 : 0,
        b && rgt ? 14 : 0,
        b && l ? 14 : 0,
      ]);
      g.clip();
      g.drawImage(core, sx, sy);
      g.restore();
      return;
    }

    g.drawImage(this.variant(kind, cx, cy), sx, sy);
  }

  /** Walkable decoration drawn between ground and the depth-sorted pass. */
  drawFlat(
    g: CanvasRenderingContext2D,
    kind: string,
    sx: number,
    sy: number,
    cx: number,
    cy: number,
    time: number,
  ) {
    if (kind === 'tuft' || kind === 'flower') {
      const sway = Math.sin(time * 2.1 - cx * 0.45 - cy * 0.18 + cellHash(cx, cy, 9) * 0.9) * 2.5;
      g.save();
      g.translate(sx + S / 2, sy + S);
      g.rotate(sway * 0.02);
      g.translate(-(sx + S / 2), -(sy + S));
      g.drawImage(this.variant(kind, cx, cy), sx, sy);
      g.restore();
      return;
    }
    if (kind === 'cuy') {
      const hop = Math.floor(time * 2 + cellHash(cx, cy, 11) * 4) % 4 === 0 ? -2 : 0;
      g.drawImage(this.variant(kind, cx, cy), sx, sy + hop);
      return;
    }
    g.drawImage(this.variant(kind, cx, cy), sx, sy);
    if (kind === 'campfire' || kind === 'qoncha') {
      // A living flame: layered teardrops that flicker.
      const fx = sx + S / 2;
      const fy = kind === 'campfire' ? sy + 44 : sy + 40;
      const k = Math.sin(time * 11 + cellHash(cx, cy, 17) * 6) * 0.5 + 0.5;
      glowSpot(g, fx, fy, 22 + k * 6, '#ffb35c', 0.5);
      const flame = (h: number, w: number, c: string) => {
        g.fillStyle = c;
        g.beginPath();
        g.moveTo(fx, fy - h);
        g.quadraticCurveTo(fx + w, fy - h * 0.4, fx, fy + 4);
        g.quadraticCurveTo(fx - w, fy - h * 0.4, fx, fy - h);
        g.fill();
      };
      flame(16 + k * 5, 8, '#e8862f');
      flame(10 + k * 4, 5.4, '#ffb54d');
      flame(5.5 + k * 2.4, 3, '#ffe9ad');
    }
  }

  drawTall(g: CanvasRenderingContext2D, kind: string, sx: number, sy: number, cx: number, cy: number) {
    const cvs = this.variant(kind, cx, cy);
    const ox = kind === 'house' ? ART * 4 : Math.floor((cvs.width - S) / 2);
    const oy = cvs.height - S;
    if (kind === 'tree') {
      softShadow(g, sx + S / 2, sy + S - 8, 40, 12, 0.24);
    } else if (kind === 'house') {
      // The building grounds itself with a long soft base shadow.
      const grad = g.createLinearGradient(0, sy + S, 0, sy + S + 18);
      grad.addColorStop(0, 'rgba(26,18,12,0.3)');
      grad.addColorStop(1, 'rgba(26,18,12,0)');
      g.fillStyle = grad;
      g.fillRect(sx - 12, sy + S, cvs.width - 8, 18);
    } else if (GROUNDED_TALL.has(kind)) {
      // Shadow baked into most tall sprites; nothing extra needed here.
    }
    g.drawImage(cvs, sx - ox, sy - oy);
  }
}
