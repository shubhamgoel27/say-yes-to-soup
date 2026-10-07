import { MAP_PINS, type ChapterArt } from './sets/index';
import { Rng, dot, oval, shade, softShadow } from './pix';
import { PAL } from '../engine/config';
import { JUG } from '../content/return/staging';

/**
 * The ending's own props: the apacheta on the pass, big enough to be the
 * thing a journey ends at, and the one jug the village argues around at the
 * well. Both are things the last evening's words point at, so both have to
 * be unmistakable at a glance.
 *
 * The apacheta has two variants on one pile: as the world finds it, and
 * with the river stone on top. The ending pins the east road's cairn to the
 * second the moment the stone is laid (see `setCairnStone`).
 */

/** The cairn's cell on the east road, and the variant that carries the stone. */
export const CAIRN_AT: [number, number] = [14, 5];
const CAIRN_STONE_V = 1;

/** One field stone: a flat, faceted lump with its top in the light. */
function fieldStone(g: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number, col: string, r: Rng) {
  const n = 7 + r.int(3);
  const tilt = (r.next() - 0.5) * 0.35;
  g.save();
  g.beginPath();
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + tilt;
    const k = 0.82 + r.next() * 0.26;
    const px = x + Math.cos(a) * rx * k;
    // Flatter underneath: stones settle onto the ones below them.
    const py = y + Math.sin(a) * ry * k * (Math.sin(a) > 0 ? 0.8 : 1);
    if (i === 0) g.moveTo(px, py);
    else g.lineTo(px, py);
  }
  g.closePath();
  g.fillStyle = col;
  g.fill();
  g.clip();
  // The top face catches the sky; the underside sits in the pile's shade.
  oval(g, x - rx * 0.18, y - ry * 0.55, rx * 0.95, ry * 0.6, shade(col, 0.16));
  oval(g, x + rx * 0.2, y + ry * 0.85, rx * 1.1, ry * 0.55, shade(col, -0.22));
  // A lichen freckle on some, rust-orange or sage, the way puna stones wear it.
  if (r.chance(0.35)) dot(g, x + (r.next() - 0.5) * rx, y - ry * 0.2, 1.6 + r.next() * 1.4, r.chance(0.5) ? '#c98a45' : '#a7ae84');
  g.restore();
}

/** The whole pile, the same stones every time it is painted. */
function apacheta(g: CanvasRenderingContext2D, withStone: boolean) {
  const r = new Rng(19740);
  const W = 128;
  const base = 150;
  softShadow(g, W / 2 + 4, base, 60, 12, 0.3);
  const greys = ['#8c8479', '#9a9083', '#7c766c', '#a39a8a', '#857a6b', '#b0a594', '#766d61'];
  // Courses from the top down, each a little wider, each in front of the
  // last: a cone of stones carried up one at a time.
  const top = 30;
  const rows: { y: number; half: number; size: number; t: number }[] = [];
  for (let y = top; y <= base - 8; y += 9.5) {
    const t = (y - top) / (base - 8 - top);
    rows.push({ y, half: 9 + 45 * Math.pow(t, 0.85), size: 7.5 + 8 * t, t });
  }
  for (const row of rows) {
    const count = Math.max(1, Math.round((row.half * 2) / (row.size * 1.55)));
    for (let i = 0; i < count; i++) {
      const f = count === 1 ? 0.5 : i / (count - 1);
      const x = W / 2 - row.half + f * row.half * 2 + (r.next() - 0.5) * 5;
      // Older stones lower down, darker with weather; the odd quartz glint.
      const col = r.chance(0.08) ? '#d9d2c2' : shade(r.pick(greys), (r.next() - 0.5) * 0.1 - 0.12 * row.t);
      fieldStone(g, x, row.y + (r.next() - 0.5) * 3, row.size * (0.95 + r.next() * 0.35), row.size * 0.7, col, r);
    }
  }
  // The capstone that was there before you.
  fieldStone(g, W / 2 + 1, top - 7, 7.5, 5.5, '#9a9083', r);

  // What travelers leave besides stones: a k'intu of three coca leaves on a
  // ledge, and an old red wool tie gone pink in the sun.
  const leaf = (lx: number, ly: number, rot: number) => oval(g, lx, ly, 4.2, 1.9, '#5f7a3a', rot);
  leaf(38, 112, -0.5);
  leaf(41, 110, -0.1);
  leaf(44, 111, 0.35);
  g.strokeStyle = '#c4626a';
  g.lineWidth = 2.2;
  g.lineCap = 'round';
  g.beginPath();
  g.moveTo(74, 70);
  g.quadraticCurveTo(80, 74, 84, 71);
  g.moveTo(84, 71);
  g.quadraticCurveTo(87, 78, 85, 84);
  g.stroke();
  // Ichu grass leaning on the foot of it.
  g.strokeStyle = shade(PAL.goldDark, 0.1);
  g.lineWidth = 1.8;
  for (const [gx, lean] of [[20, -1], [104, 1], [96, 1]] as const) {
    for (let i = -1; i <= 1; i++) {
      g.beginPath();
      g.moveTo(gx, base - 2);
      g.quadraticCurveTo(gx + (i + lean) * 3, base - 10, gx + (i + lean) * 6, base - 18 - r.int(5));
      g.stroke();
    }
  }

  if (!withStone) return;
  // The river stone from Carmen's shawl: smooth where every other stone is
  // broken, blue-grey where they are dun, the newest thing on the mountain.
  const sx = W / 2 + 2;
  const sy = top - 13;
  softShadow(g, sx + 2, sy + 7, 14, 3.5, 0.4);
  oval(g, sx, sy, 13, 8.5, '#6f8e96');
  oval(g, sx - 2, sy - 2.5, 10, 5.2, '#94b4b8');
  oval(g, sx + 3, sy + 4.4, 10, 3, '#55707a');
  // A pale band through it, the way river stones keep a seam of quartz.
  g.strokeStyle = 'rgba(232,240,236,0.55)';
  g.lineWidth = 1.6;
  g.beginPath();
  g.moveTo(sx - 11, sy + 2);
  g.quadraticCurveTo(sx, sy - 1, sx + 12, sy + 1);
  g.stroke();
  oval(g, sx - 5, sy - 4.2, 3.6, 1.5, 'rgba(244,250,246,0.9)', -0.25);
}

/**
 * The jug at the well, with the splash Don Teófilo gave the earth first and
 * the cup that goes round. A flat prop on the setts at the well's front-left,
 * so the circle has a middle and nobody can stand on it.
 */
function jug(g: CanvasRenderingContext2D, poured: boolean) {
  // The ch'alla: a dark splash on the stone, still wet, once the evening has begun.
  if (poured) {
    oval(g, 18, 46, 10, 4, 'rgba(58,36,22,0.35)', -0.2);
    dot(g, 9, 44, 1.6, 'rgba(58,36,22,0.3)');
    dot(g, 28, 49, 1.2, 'rgba(58,36,22,0.3)');
  }
  softShadow(g, 42, 56, 16, 5, 0.3);
  const clay = '#b5583a';
  const cx = 42;
  // Belly, shoulder, neck and the flared lip: a puyñu, round and heavy.
  oval(g, cx, 40, 14, 15, clay);
  oval(g, cx - 3, 34, 9, 8, shade(clay, 0.14));
  oval(g, cx + 4, 48, 11, 5, shade(clay, -0.2));
  g.fillStyle = shade(clay, -0.04);
  g.beginPath();
  g.moveTo(cx - 5, 27);
  g.lineTo(cx - 4, 15);
  g.lineTo(cx + 4, 15);
  g.lineTo(cx + 5, 27);
  g.closePath();
  g.fill();
  oval(g, cx, 14, 7, 2.6, shade(clay, 0.1));
  oval(g, cx, 14, 4.6, 1.5, '#3a2416');
  // Strap handles low on the belly.
  oval(g, cx - 14, 42, 2.6, 3.6, shade(clay, -0.16));
  oval(g, cx + 14, 42, 2.6, 3.6, shade(clay, -0.16));
  // The painted band: cream, with a dark stepped line walking round it.
  g.save();
  g.beginPath();
  g.ellipse(cx, 40, 14, 15, 0, 0, Math.PI * 2);
  g.clip();
  g.fillStyle = '#ead9b6';
  g.fillRect(cx - 15, 33, 30, 7);
  g.strokeStyle = '#3a2416';
  g.lineWidth = 1.4;
  g.beginPath();
  let up = true;
  g.moveTo(cx - 15, 38);
  for (let x = cx - 15; x < cx + 15; x += 4) {
    g.lineTo(x + 2, up ? 35 : 38);
    g.lineTo(x + 4, up ? 35 : 38);
    up = !up;
  }
  g.stroke();
  g.restore();
  // The cup that goes round: a small wooden q'iru, a little chicha left in it.
  const kx = 15;
  g.fillStyle = '#7a4f2c';
  g.beginPath();
  g.moveTo(kx - 6, 42);
  g.lineTo(kx - 4.5, 54);
  g.lineTo(kx + 4.5, 54);
  g.lineTo(kx + 6, 42);
  g.closePath();
  g.fill();
  oval(g, kx, 42, 6, 2.2, '#a9764a');
  oval(g, kx, 42.3, 4.6, 1.5, '#d8b56a');
}

/** Set the river stone on the east road's cairn, or take it off (a fresh journey). */
export function setCairnStone(on: boolean) {
  const pin = MAP_PINS['east-road']?.get(CAIRN_AT[1] * 4096 + CAIRN_AT[0])?.find((p) => p.kind === 'apacheta');
  if (pin) pin.v = on ? CAIRN_STONE_V : 0;
}

/** Whether the earth has had its splash from the jug yet (the staging places the jug). */
export function setJugPoured(on: boolean) {
  const pin = MAP_PINS[JUG.map]?.get(JUG.at[1] * 4096 + JUG.at[0])?.find((p) => p.kind === 'jug');
  if (pin) pin.v = on ? 1 : 0;
}

export const ART: ChapterArt = {
  paint(make) {
    make('apacheta', 2, (g, _r, i) => apacheta(g, i === CAIRN_STONE_V), 128, 160);
    make('jug', 2, (g, _r, i) => jug(g, i === 1));
  },
  grounded: ['apacheta'],
  // The east road's cairn always resolves through a pin, so the stone can be
  // set on it at runtime by changing the pin's variant (one live Map entry).
  pins: {
    'east-road': [{ kind: 'apacheta', at: CAIRN_AT, v: 0 }],
    [JUG.map]: [{ kind: 'jug', at: JUG.at, v: 0 }],
  },
};
