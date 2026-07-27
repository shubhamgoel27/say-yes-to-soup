import type { ChapterArt } from './index';
import { Rng, blob, dot, mute, oval, rect, rr, shade, softShadow, vgrad } from '../pix';
import { PAL } from '../../engine/config';

/**
 * Ch'aska Pampa densification art: the background life of a highland village.
 * Pirca walls, chuño on straw, drying ají, geraniums in lard cans, hens, and
 * the one soccer ball nobody has rescued from the roof. Painterly, no
 * outlines; value contrast does the talking.
 */

const S = 64;

/** A run of dry-stacked field stones filling the tile edge to edge. */
function pircaStones(g: CanvasRenderingContext2D, r: Rng) {
  // Base course: big stones sitting into the ground.
  for (let x = -4; x < S + 6; x += 12 + r.int(5)) {
    blob(g, x + 4, 52 + r.int(4), 8 + r.int(3), shade(PAL.stone, (r.next() - 0.55) * 0.2), r, 0.16);
  }
  // Middle course.
  for (let x = -2 + r.int(6); x < S + 4; x += 11 + r.int(5)) {
    blob(g, x + 3, 41 + r.int(3), 7 + r.int(3), shade(PAL.stone, (r.next() - 0.35) * 0.2), r, 0.16);
  }
  // Cap stones, flatter, with daylight showing through the odd chink.
  for (let x = 2 + r.int(8); x < S; x += 13 + r.int(6)) {
    oval(g, x + 4, 32 + r.int(3), 7.5, 5, shade(PAL.stoneDark, 0.1 + (r.next() - 0.5) * 0.12));
    dot(g, x + 1, 30, 1.6, shade(PAL.stone, 0.24));
  }
  // A little grass leaning on the base, the wall and the field on speaking terms.
  if (r.chance(0.7)) {
    g.strokeStyle = shade(PAL.goldDark, 0.08);
    g.lineWidth = 1.8;
    g.lineCap = 'round';
    const gx = 8 + r.int(S - 16);
    for (let i = -1; i <= 1; i++) {
      g.beginPath();
      g.moveTo(gx, 58);
      g.quadraticCurveTo(gx + i * 3, 52, gx + i * 5, 47 - r.int(4));
      g.stroke();
    }
  }
}

export const ART: ChapterArt = {
  grounded: ['ajirack', 'nicho', 'chakitaqlla', 'tendedero', 'sapling', 'condorkite', 'hitchpost', 'parva'],
  noInk: ['chuno', 'grano', 'gallina', 'lagarto'],
  pathy: ['plazaWorn'],

  paint(make) {
    // ------------------------------------------------------ the descent

    // The ladera: the raw slope La Bajada's switchbacks are cut into. Loose
    // dry rubble on a face too steep to stand on, so the road is the road.
    make('ladera', 5, (g, r) => {
      // Cool grey rubble, so the warm road across it reads as a road.
      rect(g, 0, 0, S, S, mute(shade(PAL.stone, -0.02), 0.06));
      // Short downhill streaks where the last rain sorted the stones.
      for (let i = 0; i < 3; i++) {
        const gx = 6 + r.int(S - 12);
        const gy = r.int(S - 16);
        g.strokeStyle = i % 2 ? 'rgba(255,246,225,0.10)' : 'rgba(48,40,32,0.14)';
        g.lineWidth = 2.5 + r.int(3);
        g.lineCap = 'round';
        g.beginPath();
        g.moveTo(gx, gy);
        g.quadraticCurveTo(gx + 3 - r.int(6), gy + 9, gx + 5 - r.int(10), gy + 16);
        g.stroke();
      }
      // Rubble caught on the way down, each stone lit from above.
      for (let i = 0; i < 9; i++) {
        const sx = r.int(S);
        const sy = r.int(S);
        const c = shade(PAL.stoneDark, 0.06 + (r.next() - 0.5) * 0.3);
        blob(g, sx, sy, 2.5 + r.int(4), c, r, 0.24);
        dot(g, sx - 1, sy - 2, 1.3, shade(c, 0.22));
      }
      if (r.chance(0.5)) oval(g, r.int(S), r.int(S), 8, 3.5, 'rgba(48,40,32,0.10)');
    });

    // ------------------------------------------------------- village flats

    // The pirca: field stones stacked dry, the wall every field grows.
    make('pirca', 3, (g, r) => {
      vgrad(g, 0, 54, S, 10, 'rgba(26,18,12,0.18)', 'rgba(26,18,12,0)');
      pircaStones(g, r);
    });

    // Same wall, plus the cat that has claimed its warmest stone.
    make('pircamichi', 1, (g) => {
      const r = new Rng(93);
      vgrad(g, 0, 54, S, 10, 'rgba(26,18,12,0.18)', 'rgba(26,18,12,0)');
      pircaStones(g, r);
      // The cat: one warm circle of fur, off duty.
      const fur = '#c07a3e';
      oval(g, 37, 27, 11, 6.5, fur);
      oval(g, 33, 25, 6, 5, shade(fur, 0.1)); // shoulder curl
      dot(g, 45, 24, 4.6, fur); // head tucked toward tail
      oval(g, 42, 20.5, 1.8, 2.6, shade(fur, -0.18)); // ear
      oval(g, 47, 20.5, 1.8, 2.6, shade(fur, -0.18)); // ear
      // Tail wrapped around the whole arrangement.
      g.strokeStyle = shade(fur, -0.12);
      g.lineWidth = 3.4;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(27, 28);
      g.quadraticCurveTo(34, 34, 44, 30);
      g.stroke();
      // Stripes and a closed eye.
      g.strokeStyle = shade(fur, -0.22);
      g.lineWidth = 1.4;
      for (const sx of [33, 37, 41]) {
        g.beginPath();
        g.moveTo(sx, 23);
        g.quadraticCurveTo(sx + 1, 26, sx, 29);
        g.stroke();
      }
      g.beginPath();
      g.moveTo(44.4, 24);
      g.lineTo(46.6, 24.4);
      g.stroke();
    });

    // Chuño freeze-drying on straw: the frost's night shift, laid out neatly.
    make('chuno', 2, (g, r) => {
      // A rectangular bed of laid straw, soft-cornered so it melts into the puna.
      const x0 = 4 + r.int(4);
      const y0 = 18 + r.int(4);
      const w = 54 - r.int(6);
      const h = 32 + r.int(6);
      rr(g, x0, y0, w, h, 12, 'rgba(201,180,138,0.75)');
      rr(g, x0 + 4, y0 + 3, w - 8, h - 6, 10, 'rgba(216,196,150,0.55)');
      g.strokeStyle = 'rgba(160,132,84,0.5)';
      g.lineWidth = 1.2;
      for (let i = 0; i < 12; i++) {
        const sx = x0 + 3 + r.int(w - 12);
        const sy = y0 + 3 + r.int(h - 8);
        g.beginPath();
        g.moveTo(sx, sy);
        g.lineTo(sx + 6 + r.int(5), sy + (r.next() - 0.5) * 3);
        g.stroke();
      }
      // The potatoes in loose rows, small and dark and patient.
      for (let row = 0; row < 3; row++) {
        for (let px2 = x0 + 8 + r.int(4); px2 < x0 + w - 6; px2 += 6 + r.int(4)) {
          const py = y0 + 7 + row * (h / 3.4) + (r.next() - 0.5) * 3;
          oval(g, px2, py, 1.9 + r.next() * 0.9, 1.6 + r.next() * 0.7, shade('#4a3a30', (r.next() - 0.4) * 0.2));
          if (r.chance(0.3)) dot(g, px2 - 0.6, py - 0.6, 0.6, 'rgba(235,240,245,0.5)'); // frost glint
        }
      }
    });

    // Adobe bricks curing under plastic: next year's room, still lying down.
    make('adobera', 2, (g, r) => {
      softShadow(g, 32, 52, 26, 6, 0.18);
      // Two neat courses of drying bricks.
      for (let row = 0; row < 2; row++) {
        for (let i = 0; i < 3; i++) {
          const bx = 8 + i * 17 + (row % 2) * 4;
          const by = 34 + row * 11;
          rr(g, bx, by, 15, 9, 2, shade(PAL.adobeDark, 0.06 + (r.next() - 0.5) * 0.1));
          vgrad(g, bx, by, 15, 3, 'rgba(255,230,190,0.25)', 'rgba(0,0,0,0)');
        }
      }
      // The plastic sheet over one end, pinned with stones.
      g.fillStyle = 'rgba(200,220,235,0.4)';
      g.beginPath();
      g.moveTo(2, 30);
      g.lineTo(30, 27);
      g.lineTo(34, 54);
      g.lineTo(4, 57);
      g.closePath();
      g.fill();
      g.strokeStyle = 'rgba(240,250,255,0.5)';
      g.lineWidth = 1.2;
      g.beginPath();
      g.moveTo(6, 33);
      g.quadraticCurveTo(18, 38, 30, 34);
      g.stroke();
      dot(g, 5, 31, 3, shade(PAL.stone, -0.1));
      dot(g, 32, 52, 3, shade(PAL.stoneDark, 0.06));
      // One brick carries a dog print. It will be laid anyway.
      dot(g, 47, 47, 1.4, shade(PAL.adobeDark, -0.25));
      for (let t = 0; t < 3; t++) dot(g, 45 + t * 2, 44.6, 0.8, shade(PAL.adobeDark, -0.25));
    });

    // Geraniums in rusty lard cans: the flowers carry the whole act.
    make('latacan', 2, (g, r) => {
      softShadow(g, 30, 56, 22, 5, 0.18);
      const cans: [number, number, number][] = [[18, 44, 7], [36, 47, 8], [50, 45, 6]];
      for (const [cx2, cy2, w] of cans) {
        rr(g, cx2 - w / 2, cy2 - 10, w, 13, 1.5, shade('#8c8479', 0.05));
        // Rust blooming up from the seams.
        blob(g, cx2 + (r.next() - 0.5) * 4, cy2 - 2, 3.4, 'rgba(163,90,60,0.75)', r, 0.3);
        blob(g, cx2 - 2, cy2 - 8, 2.2, 'rgba(138,83,48,0.6)', r, 0.3);
        vgrad(g, cx2 - w / 2, cy2 - 10, w, 4, 'rgba(255,255,255,0.28)', 'rgba(0,0,0,0)');
        // The geranium: green mound, unreasonable red.
        blob(g, cx2, cy2 - 15, 5.5, PAL.greenDark, r, 0.3);
        blob(g, cx2 - 3, cy2 - 13, 3.4, shade(PAL.green, -0.05), r, 0.3);
        for (let i = 0; i < 3; i++) {
          dot(g, cx2 - 4 + r.int(9), cy2 - 22 + r.int(6), 2.6, r.chance(0.7) ? PAL.terracotta : '#e8a8bc');
        }
        dot(g, cx2 + 1, cy2 - 21, 1, 'rgba(255,255,255,0.5)');
      }
    });

    // Sacks rolled open at the mouth: mote, habas, and dark chuño by the cup.
    make('sacos', 2, (g, r) => {
      softShadow(g, 32, 56, 26, 6, 0.2);
      const sack = (x: number, y: number, w: number, h: number, cloth: string, fill: (fx: number, fy: number) => void) => {
        rr(g, x, y - h, w, h, 6, cloth);
        vgrad(g, x, y - h, w, 6, 'rgba(255,240,210,0.25)', 'rgba(0,0,0,0)');
        // Rolled rim.
        rr(g, x - 1, y - h - 2, w + 2, 7, 3.5, shade(cloth, -0.14));
        for (let i = 0; i < 9; i++) fill(x + 4 + r.int(w - 8), y - h + 1 + r.int(3));
      };
      sack(6, 56, 18, 22, '#c9b48a', (fx, fy) => dot(g, fx, fy, 1.7, '#efe6d2')); // mote
      sack(25, 58, 18, 26, '#a58a5c', (fx, fy) => oval(g, fx, fy, 2, 1.4, '#9b8a4f')); // habas
      sack(44, 56, 16, 20, '#b5a074', (fx, fy) => dot(g, fx, fy, 1.6, '#4a3a30')); // chuño
      // The measuring cup, sitting in the mote like it owns the place.
      rr(g, 12, 30, 7, 6, 1.5, '#c8c4bb');
      vgrad(g, 12, 30, 7, 2, 'rgba(255,255,255,0.5)', 'rgba(0,0,0,0)');
    });

    // Spilled barley: news travels fast among hens.
    make('grano', 1, (g) => {
      const r = new Rng(41);
      blob(g, 30, 36, 10, 'rgba(200,165,91,0.28)', r, 0.3);
      for (let i = 0; i < 26; i++) {
        const a = r.next() * Math.PI * 2;
        const d = r.next() * r.next() * 16;
        oval(g, 30 + Math.cos(a) * d * 1.3, 36 + Math.sin(a) * d, 1.5, 1, shade(PAL.gold, (r.next() - 0.3) * 0.2));
      }
      // The trail back toward the sack that started it.
      for (let i = 0; i < 5; i++) oval(g, 40 + i * 4, 32 - i * 2, 1.4, 1, shade(PAL.goldDark, 0.1));
    });

    // A hen, mid-audit.
    make('gallina', 3, (g, r, i) => {
      const body = r.pick(['#c9a276', '#e8e0cc', '#b0703c']);
      const x = 24 + r.int(14);
      const y = 36 + r.int(6);
      softShadow(g, x + 2, y + 8, 10, 3.4, 0.15);
      // Tail up, opinions high.
      g.fillStyle = shade(body, -0.18);
      g.beginPath();
      g.moveTo(x - 7, y - 2);
      g.quadraticCurveTo(x - 14, y - 12, x - 8, y - 9);
      g.quadraticCurveTo(x - 12, y - 4, x - 6, y + 1);
      g.closePath();
      g.fill();
      oval(g, x, y, 9, 6.5, body);
      oval(g, x - 2, y - 2, 5, 3.4, shade(body, 0.14));
      const pecking = i === 1;
      const hx = pecking ? x + 10 : x + 8;
      const hy = pecking ? y + 4 : y - 7;
      dot(g, hx, hy, 3.6, body);
      dot(g, hx + 1.4, hy - 2.8, 1.6, PAL.terracotta); // comb
      dot(g, hx + 1.2, hy - 0.6, 0.9, '#241a12'); // eye
      g.fillStyle = shade(PAL.gold, 0.15);
      g.beginPath();
      g.moveTo(hx + 3, hy);
      g.lineTo(hx + 7, hy + (pecking ? 2 : 1));
      g.lineTo(hx + 3, hy + 2.4);
      g.closePath();
      g.fill();
      g.strokeStyle = shade(PAL.gold, -0.2);
      g.lineWidth = 1.6;
      for (const lx of [x - 2, x + 3]) {
        g.beginPath();
        g.moveTo(lx, y + 5);
        g.lineTo(lx + 0.5, y + 10);
        g.stroke();
      }
    });

    // The traveler's q'epi: a knotted carrying cloth, resting but not open.
    make('qepi', 2, (g, r) => {
      softShadow(g, 32, 54, 20, 5, 0.2);
      const cloth = shade(PAL.terracotta, (r.next() - 0.5) * 0.08);
      blob(g, 32, 42, 14, cloth, r, 0.18);
      blob(g, 28, 38, 9, shade(cloth, 0.12), r, 0.2);
      // Woven bands riding over the bundle.
      g.lineWidth = 3;
      for (const [c, off] of [[PAL.cream, -4], [PAL.gold, 3]] as [string, number][]) {
        g.strokeStyle = c;
        g.beginPath();
        g.moveTo(20, 46 + off);
        g.quadraticCurveTo(32, 30 + off, 45, 45 + off);
        g.stroke();
      }
      // The knot: two little ears, a door and it is closed.
      oval(g, 29, 27, 3.4, 5, shade(cloth, -0.12));
      oval(g, 36, 27, 3.4, 5, shade(cloth, -0.18));
      dot(g, 32.5, 31, 3.2, shade(cloth, -0.06));
    });

    // A young apacheta: ankle high, gaining a stone per traveler.
    make('apachetita', 3, (g, r, i) => {
      softShadow(g, 32, 54, 16, 5, 0.2);
      const tiers = 2 + i;
      let y = 48;
      let rad = 8.5;
      for (let t = 0; t < tiers; t++) {
        blob(g, 32 + r.int(5) - 2, y, rad, shade(PAL.stone, (r.next() - 0.35) * 0.2), r, 0.15);
        y -= rad * 1.2;
        rad *= 0.76;
      }
      // Small offerings tucked among the stones.
      if (i >= 1) dot(g, 26, 46, 1.8, PAL.terracotta);
      if (i === 2) dot(g, 37, 38, 1.8, PAL.skyDeep);
    });

    // A lizard on a warm stone, working hard at nothing.
    make('lagarto', 2, (g, r) => {
      const x = 26 + r.int(10);
      const y = 36 + r.int(6);
      oval(g, x, y, 13, 8, 'rgba(187,172,150,0.95)');
      oval(g, x - 3, y - 2, 8, 4.4, 'rgba(208,194,170,0.95)');
      // The lizard, comma-shaped, entirely committed.
      const skin = '#4d5c30';
      g.strokeStyle = skin;
      g.lineWidth = 3.2;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(x - 6, y + 1);
      g.quadraticCurveTo(x, y - 3, x + 5, y - 1);
      g.stroke();
      g.lineWidth = 1.6;
      g.beginPath();
      g.moveTo(x - 6, y + 1);
      g.quadraticCurveTo(x - 11, y + 3, x - 13, y + 7);
      g.stroke();
      dot(g, x + 6.5, y - 1.5, 2.2, skin);
      dot(g, x + 7.3, y - 2.2, 0.7, '#241a12');
      g.strokeStyle = shade(skin, -0.15);
      g.lineWidth = 1.2;
      for (const [lx, ly] of [[x - 3, y + 3], [x + 3, y + 2]]) {
        g.beginPath();
        g.moveTo(lx ?? 0, ly ?? 0);
        g.lineTo((lx ?? 0) + 2, (ly ?? 0) + 3);
        g.stroke();
      }
    });

    // ------------------------------------------------------ interior flats

    // Don Teófilo's charango, propped against the wall within reach of his chair.
    make('charango', 1, (g) => {
      softShadow(g, 34, 56, 18, 5, 0.18);
      // Neck, leaning.
      g.strokeStyle = '#5c4630';
      g.lineWidth = 4.4;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(40, 46);
      g.lineTo(26, 12);
      g.stroke();
      rr(g, 21, 6, 9, 8, 3, '#4d3a28'); // tuning head
      // Rounded little body, soundboard pale.
      oval(g, 42, 46, 9.5, 12, '#8a6238');
      oval(g, 41, 45, 6.5, 9, shade(PAL.cream, -0.08));
      dot(g, 40, 42, 2.4, '#3a2a1c'); // sound hole
      rr(g, 38, 50, 7, 2, 1, '#5c4630'); // bridge
      // Strings, catching the hearth light.
      g.strokeStyle = 'rgba(240,230,205,0.75)';
      g.lineWidth = 0.9;
      for (let i = -1; i <= 1; i++) {
        g.beginPath();
        g.moveTo(25.5 + i * 1.4, 11);
        g.lineTo(40 + i * 1.8, 51);
        g.stroke();
      }
    });

    // A pushka drop spindle in its basket of cloud-colored wool.
    make('pushka', 1, (g) => {
      const r = new Rng(58);
      softShadow(g, 32, 56, 20, 5, 0.18);
      // The basket, woven in bands.
      oval(g, 32, 46, 15, 9, '#a58a5c');
      oval(g, 32, 42, 14, 6, shade('#a58a5c', 0.12));
      g.strokeStyle = 'rgba(110,86,50,0.5)';
      g.lineWidth = 1.4;
      for (const by of [46, 50]) {
        g.beginPath();
        g.ellipse(32, by, 14.4, 7.4, 0, 0.15 * Math.PI, 0.85 * Math.PI);
        g.stroke();
      }
      // Wool rising out of it like weather.
      blob(g, 28, 36, 8, '#efe6d2', r, 0.25);
      blob(g, 37, 34, 6.5, '#e2d8c2', r, 0.25);
      blob(g, 32, 30, 5, '#f6efdd', r, 0.25);
      // The spindle: shaft, whorl, and a thread already leaving.
      g.strokeStyle = '#5c4630';
      g.lineWidth = 2.6;
      g.beginPath();
      g.moveTo(40, 40);
      g.lineTo(52, 16);
      g.stroke();
      oval(g, 49, 22, 5, 2.6, '#8a6238');
      g.strokeStyle = 'rgba(240,230,205,0.8)';
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(50, 20);
      g.quadraticCurveTo(44, 28, 36, 33);
      g.stroke();
    });

    // Doña Carmen's dye pots: a kitchen, but for color.
    make('dyepots', 1, (g) => {
      softShadow(g, 32, 56, 22, 5, 0.18);
      const pot = (x: number, y: number, w: number, c: string) => {
        oval(g, x, y, w, w * 0.72, '#a5643c');
        oval(g, x, y - w * 0.5, w * 0.82, w * 0.34, shade('#a5643c', -0.2));
        oval(g, x, y - w * 0.5, w * 0.62, w * 0.24, c);
        dot(g, x - w * 0.25, y - w * 0.55, 1.2, 'rgba(255,255,255,0.4)');
      };
      pot(16, 44, 9, '#a32e38'); // cochineal, deeper than the pot deserves
      pot(35, 47, 10, shade(PAL.gold, 0.12)); // q'olle yellow
      pot(51, 43, 7.5, '#6b7d46'); // ch'illca green
      // The stirring stick, stained for life.
      g.strokeStyle = '#7a5636';
      g.lineWidth = 2.6;
      g.beginPath();
      g.moveTo(24, 54);
      g.lineTo(46, 30);
      g.stroke();
      g.strokeStyle = 'rgba(163,46,56,0.8)';
      g.beginPath();
      g.moveTo(24, 54);
      g.lineTo(31, 46);
      g.stroke();
      // A drop of red that will outlive everything here.
      dot(g, 20, 52, 1.8, 'rgba(163,46,56,0.65)');
    });

    // ------------------------------------------------------- grounded talls

    // The drying rack: strings of red ají and gold maize, a bank statement.
    make('ajirack', 2, (g, r) => {
      softShadow(g, 32, 90, 24, 5, 0.2);
      rr(g, 8, 30, 5, 58, 2, '#7a5636');
      rr(g, 51, 30, 5, 58, 2, '#7a5636');
      rr(g, 6, 27, 52, 5, 2, '#8a6238');
      vgrad(g, 6, 27, 52, 2, 'rgba(255,235,200,0.3)', 'rgba(0,0,0,0)');
      // Ají strings: little red flames on a thread.
      for (let sxi = 0; sxi < 3; sxi++) {
        const x = 15 + sxi * 12 + r.int(3);
        g.strokeStyle = 'rgba(90,70,45,0.6)';
        g.lineWidth = 1.2;
        g.beginPath();
        g.moveTo(x, 32);
        g.lineTo(x + 1, 66 + r.int(6));
        g.stroke();
        for (let k = 0; k < 6; k++) {
          const wob = (k % 2 ? 2.4 : -2.4) * (0.7 + r.next() * 0.5);
          oval(g, x + wob * 0.6, 36 + k * 5.5, 2.2, 4, shade(k % 3 === 2 ? '#c94f2a' : PAL.terracotta, (r.next() - 0.5) * 0.12));
        }
      }
      // Maize pairs, tied by their husks over the bar.
      for (const x of [46, 52]) {
        g.strokeStyle = '#c9b48a';
        g.lineWidth = 1.6;
        g.beginPath();
        g.moveTo(x, 30);
        g.lineTo(x, 38);
        g.stroke();
        oval(g, x, 44, 3.4, 7.5, shade(PAL.gold, 0.1));
        g.strokeStyle = 'rgba(140,105,45,0.5)';
        g.lineWidth = 0.9;
        g.beginPath();
        g.moveTo(x - 1.2, 38);
        g.lineTo(x - 1.2, 50);
        g.stroke();
      }
    }, 64, 96);

    // The votive niche: whitewash, a small saint, flowers replaced by nobody.
    make('nicho', 1, (g) => {
      softShadow(g, 32, 90, 22, 5, 0.2);
      // Stone plinth.
      rr(g, 20, 76, 24, 12, 2, shade(PAL.stone, -0.04));
      // Whitewashed body.
      rr(g, 16, 36, 32, 44, 3, '#ece2cc');
      vgrad(g, 16, 36, 32, 8, 'rgba(120,110,90,0.16)', 'rgba(0,0,0,0)');
      // Little tin gable roof.
      g.beginPath();
      g.moveTo(12, 38);
      g.lineTo(32, 24);
      g.lineTo(52, 38);
      g.closePath();
      g.fillStyle = shade(PAL.terracotta, -0.12);
      g.fill();
      g.strokeStyle = 'rgba(90,40,26,0.5)';
      g.lineWidth = 1.4;
      g.beginPath();
      g.moveTo(22, 31);
      g.lineTo(42, 31);
      g.stroke();
      // The arched dark room and the saint in a doll-sized manta.
      g.fillStyle = '#2c2018';
      g.beginPath();
      g.moveTo(22, 74);
      g.lineTo(22, 52);
      g.quadraticCurveTo(32, 40, 42, 52);
      g.lineTo(42, 74);
      g.closePath();
      g.fill();
      dot(g, 32, 53, 3.2, '#e8c49a'); // face
      dot(g, 32, 48.6, 3.8, shade(PAL.gold, 0.24)); // halo behind
      dot(g, 32, 53, 3.2, '#e8c49a');
      g.fillStyle = PAL.terracotta;
      g.beginPath();
      g.moveTo(32, 56);
      g.lineTo(26, 72);
      g.lineTo(38, 72);
      g.closePath();
      g.fill();
      g.strokeStyle = PAL.cream;
      g.lineWidth = 1.2;
      g.beginPath();
      g.moveTo(29.4, 62);
      g.lineTo(34.6, 62);
      g.stroke();
      // Today's flowers, in a tin at the saint's feet.
      dot(g, 26, 82, 2, PAL.terracotta);
      dot(g, 30, 80, 2, '#e8a8bc');
      dot(g, 34, 82, 2, PAL.gold);
      g.strokeStyle = PAL.greenDark;
      g.lineWidth = 1.2;
      for (const fx of [26, 30, 34]) {
        g.beginPath();
        g.moveTo(fx, 84);
        g.lineTo(fx, 87);
        g.stroke();
      }
    }, 64, 96);

    // The chakitaqlla, leaning where its owner can find it by feel.
    make('chakitaqlla', 1, (g) => {
      softShadow(g, 34, 90, 18, 5, 0.18);
      // Long shaft, leaning like it earned the rest.
      g.strokeStyle = '#7a5636';
      g.lineWidth = 5;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(24, 88);
      g.quadraticCurveTo(30, 56, 41, 22);
      g.stroke();
      // The point: fire-hardened, ground-colored.
      g.strokeStyle = '#4d3a28';
      g.lineWidth = 5;
      g.beginPath();
      g.moveTo(24, 88);
      g.lineTo(20, 94);
      g.stroke();
      // Footrest peg, polished bright by a hundred planting mornings.
      g.strokeStyle = '#8a6238';
      g.lineWidth = 4;
      g.beginPath();
      g.moveTo(27, 74);
      g.lineTo(40, 70);
      g.stroke();
      dot(g, 38, 70.6, 2, 'rgba(240,225,195,0.6)');
      // Leather lashings.
      g.strokeStyle = 'rgba(120,86,40,0.85)';
      g.lineWidth = 1.6;
      for (const t of [0.62, 0.66]) {
        const lx = 24 + (41 - 24) * t;
        const ly = 88 + (22 - 88) * t;
        g.beginPath();
        g.moveTo(lx - 3, ly);
        g.lineTo(lx + 3, ly - 1.4);
        g.stroke();
      }
      // Curved handhold at the top.
      g.strokeStyle = '#7a5636';
      g.lineWidth = 4;
      g.beginPath();
      g.moveTo(41, 22);
      g.quadraticCurveTo(46, 16, 52, 16);
      g.stroke();
    }, 64, 96);

    // The clothesline: llicllas out in the sun, hems weighted against wind.
    make('tendedero', 1, (g) => {
      const r = new Rng(29);
      softShadow(g, 30, 90, 26, 5, 0.16);
      softShadow(g, 100, 90, 26, 5, 0.16);
      rr(g, 12, 30, 5, 60, 2, '#7a5636');
      rr(g, 110, 30, 5, 60, 2, '#7a5636');
      // The line, sagging honestly.
      g.strokeStyle = 'rgba(90,70,45,0.8)';
      g.lineWidth = 1.6;
      g.beginPath();
      g.moveTo(15, 34);
      g.quadraticCurveTo(64, 44, 112, 34);
      g.stroke();
      // Three pieces drying: red lliclla, cream cloth, deep blue pollera.
      const hang = (x: number, w: number, h: number, base: string, bands: string[]) => {
        const sag = 34 + ((x + w / 2 - 15) / 97) * 0 + 5 * Math.sin(Math.PI * ((x + w / 2 - 15) / 97));
        rr(g, x, sag, w, h, 2, base);
        vgrad(g, x, sag, w, 5, 'rgba(255,245,225,0.25)', 'rgba(0,0,0,0)');
        let by = sag + 5;
        for (const b of bands) {
          rr(g, x + 1.5, by, w - 3, 3.4, 1.2, b);
          by += 7;
        }
        // Wind, negotiating with the hem.
        g.strokeStyle = shade(base, -0.18);
        g.lineWidth = 1.2;
        g.beginPath();
        g.moveTo(x + 2, sag + h - 1);
        g.quadraticCurveTo(x + w / 2, sag + h + 2.4 + r.next() * 2, x + w - 2, sag + h - 1);
        g.stroke();
      };
      hang(22, 24, 30, '#8a3a2e', [PAL.gold, PAL.cream, PAL.gold]);
      hang(52, 20, 24, shade(PAL.cream, -0.05), ['rgba(160,140,105,0.5)']);
      hang(78, 26, 34, '#38506e', [PAL.cream, PAL.terracotta]);
      // Clothespins, tiny and vigilant.
      for (const px2 of [24, 44, 54, 70, 80, 102]) {
        rr(g, px2, 32 + 5 * Math.sin(Math.PI * ((px2 - 15) / 97)), 2, 5, 1, '#a58a5c');
      }
    }, 128, 96);

    // A eucalyptus sapling with its stake: planted the year a baby was.
    make('sapling', 2, (g, r) => {
      softShadow(g, 32, 90, 16, 4, 0.18);
      // Stone ring at the base, someone means this tree to live.
      for (let i = 0; i < 5; i++) {
        const a = Math.PI * (0.15 + (i / 4) * 0.7);
        dot(g, 32 + Math.cos(a) * 12, 88 + Math.sin(a) * 3 - 2, 2.6, shade(PAL.stone, (r.next() - 0.4) * 0.16));
      }
      // Slim trunk with the lean it will spend a lifetime correcting.
      const lean = (r.next() - 0.5) * 8;
      g.strokeStyle = '#7a5f42';
      g.lineWidth = 3;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(32, 88);
      g.quadraticCurveTo(32 + lean, 60, 32 + lean * 1.6, 34);
      g.stroke();
      // The stake and its figure-eight tie.
      g.strokeStyle = '#7a5636';
      g.lineWidth = 2.6;
      g.beginPath();
      g.moveTo(24, 88);
      g.lineTo(24, 52);
      g.stroke();
      g.strokeStyle = 'rgba(200,165,91,0.8)';
      g.lineWidth = 1.6;
      g.beginPath();
      g.moveTo(23, 58);
      g.quadraticCurveTo(28, 56, 33, 59);
      g.moveTo(23, 61);
      g.quadraticCurveTo(28, 63, 33, 60);
      g.stroke();
      // Young eucalyptus leaves, sage-green pairs drooping along the stem.
      for (let i = 0; i < 10; i++) {
        const t = 0.3 + (i / 10) * 0.7;
        const bx = 32 + lean * t * 1.4;
        const by = 88 - t * 54;
        const side = i % 2 ? 1 : -1;
        g.save();
        g.translate(bx + side * 5.5, by + 2);
        g.rotate(side * 0.85 + (r.next() - 0.5) * 0.3);
        oval(g, 0, 0, 3.2, 7, shade(i % 3 === 0 ? '#79975e' : '#5f8a4a', (r.next() - 0.5) * 0.12));
        g.restore();
      }
      // A pale new tip, the part the frost worries about.
      oval(g, 32 + lean * 1.5, 31, 2.2, 4.4, '#9bb578');
    }, 64, 96);

    // The kite tree: a wind-bent queñua holding a condor kite it did not ask for.
    make('condorkite', 1, (g) => {
      const r = new Rng(84);
      softShadow(g, 32, 122, 22, 5, 0.2);
      // Papery red trunk, leaning hard east with the prevailing argument.
      g.strokeStyle = '#8a5330';
      g.lineWidth = 7;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(26, 122);
      g.quadraticCurveTo(24, 84, 38, 56);
      g.stroke();
      g.strokeStyle = '#a5643c';
      g.lineWidth = 4;
      g.beginPath();
      g.moveTo(34, 68);
      g.quadraticCurveTo(46, 58, 52, 50);
      g.moveTo(30, 82);
      g.quadraticCurveTo(18, 72, 14, 62);
      g.stroke();
      // Peeling bark, always writing something.
      g.strokeStyle = 'rgba(200,140,100,0.6)';
      g.lineWidth = 1.4;
      for (let i = 0; i < 5; i++) {
        const t = 0.2 + i * 0.15;
        g.beginPath();
        g.moveTo(26 + 10 * t, 118 - 58 * t);
        g.lineTo(30 + 10 * t, 116 - 58 * t);
        g.stroke();
      }
      // Sparse tough canopy.
      blob(g, 44, 44, 13, '#55703f', r, 0.25);
      blob(g, 20, 56, 10, '#4d6639', r, 0.25);
      blob(g, 34, 38, 9, '#618048', r, 0.25);
      // The kite: a condor by intention, caught by profession. It sits IN the
      // branches, one wing swallowed by foliage, not perched on top.
      g.save();
      g.translate(38, 41);
      g.rotate(-0.38);
      // Wings spread, dark with white collar and wingtip fingers.
      g.fillStyle = '#241a12';
      g.beginPath();
      g.moveTo(0, 0);
      g.quadraticCurveTo(-14, -8, -22, -2);
      g.quadraticCurveTo(-13, 2, 0, 3);
      g.quadraticCurveTo(13, 2, 22, -2);
      g.quadraticCurveTo(14, -8, 0, 0);
      g.closePath();
      g.fill();
      dot(g, 0, 1, 3.4, '#241a12');
      oval(g, 0, -1.4, 2.8, 1.4, PAL.cream); // the collar
      dot(g, 0, -3.4, 1.6, '#8a5330'); // head
      g.strokeStyle = PAL.cream;
      g.lineWidth = 1;
      for (const wx of [-19, 19]) {
        g.beginPath();
        g.moveTo(wx, -3);
        g.lineTo(wx + (wx < 0 ? -3 : 3), -6);
        g.stroke();
      }
      g.restore();
      // A leaf clump back over the left wing: tangled, not resting.
      blob(g, 26, 42, 7, '#55703f', r, 0.25);
      blob(g, 46, 36, 5.5, '#618048', r, 0.25);
      // Tail ribbons and the string, dangling clear of the leaves, still trying.
      g.strokeStyle = 'rgba(240,230,205,0.9)';
      g.lineWidth = 1.2;
      g.beginPath();
      g.moveTo(40, 46);
      g.quadraticCurveTo(50, 62, 46, 80);
      g.stroke();
      for (let i = 0; i < 3; i++) {
        oval(g, 47 + (i % 2) * 3, 56 + i * 8, 2.2, 3.6, i % 2 ? PAL.terracotta : PAL.sky);
      }
    }, 64, 128);

    // The hitching rail: rubbed smooth by generations of mule rope.
    make('hitchpost', 1, (g) => {
      softShadow(g, 32, 90, 26, 5, 0.2);
      rr(g, 12, 44, 6, 46, 2, '#6b4a30');
      rr(g, 46, 44, 6, 46, 2, '#6b4a30');
      // The rail, worn pale on top where every rope has been.
      rr(g, 6, 40, 52, 7, 3, '#8a6238');
      vgrad(g, 6, 40, 52, 3, 'rgba(240,225,195,0.5)', 'rgba(0,0,0,0)');
      // A rope coiled around the rail, ready for the next Tuesday.
      g.strokeStyle = '#c9b48a';
      g.lineWidth = 2.2;
      g.lineCap = 'round';
      for (let i = 0; i < 4; i++) {
        g.beginPath();
        g.moveTo(34 + i * 3.4, 39);
        g.quadraticCurveTo(36 + i * 3.4, 43.5, 34.6 + i * 3.4, 48);
        g.stroke();
      }
      // The short tail, tucked back over itself the way arrieros do.
      g.beginPath();
      g.moveTo(46, 44);
      g.quadraticCurveTo(51, 46, 50, 51);
      g.stroke();
      dot(g, 50, 52, 2, '#a58a5c');
      // Ground worn bare below the rail; swept, diplomatically.
      oval(g, 30, 88, 18, 4, 'rgba(125,88,54,0.35)');
    }, 64, 96);

    // -------------------------------------------------------------- pelota

    // The soccer ball on the roof, faded on one side, legend on all sides.
    // Painted at the top of a tall transparent sprite so it lands on the
    // thatch of the house whose collision cell it borrows.
    make('pelota', 1, (g) => {
      // A few straws bending under it: wedged, not resting.
      g.strokeStyle = 'rgba(120,90,50,0.8)';
      g.lineWidth = 1.6;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(24, 36);
      g.quadraticCurveTo(32, 30, 42, 33);
      g.moveTo(26, 39);
      g.quadraticCurveTo(35, 34, 44, 37);
      g.stroke();
      // The ball: slightly soft, sun-bleached toward the sky side.
      oval(g, 34, 28, 9.5, 8.6, '#ddd6c2');
      const grad = g.createLinearGradient(24, 18, 44, 38);
      grad.addColorStop(0, 'rgba(255,252,240,0.5)');
      grad.addColorStop(1, 'rgba(120,110,90,0.28)');
      g.fillStyle = grad;
      g.beginPath();
      g.ellipse(34, 28, 9.5, 8.6, 0, 0, Math.PI * 2);
      g.fill();
      // Faded patches, the famous pentagons, approximately.
      g.fillStyle = 'rgba(60,52,44,0.75)';
      for (const [px2, py, pr] of [[34, 24, 2.8], [28, 30, 2.4], [40, 31, 2.4], [34, 35, 2]]) {
        g.beginPath();
        g.arc(px2 ?? 0, py ?? 0, pr ?? 2, 0, Math.PI * 2);
        g.fill();
      }
      dot(g, 30, 23, 1.6, 'rgba(255,255,255,0.6)');
    }, 64, 192);

    // ------------------------------------------------------- the plaza itself

    /**
     * Paving that people have walked the shine off. Same slabs as the plaza,
     * but the joints are packed with pale dust instead of shadow, the arrises
     * are rounded away and nothing grows in the cracks. Laid along the ways
     * everyone actually crosses the square, it draws the desire lines the
     * village drew first.
     */
    make('plazaWorn', 6, (g, r) => {
      const base = '#b8a888';
      rect(g, 0, 0, S, S, base);
      const sy2 = 26 + r.int(14);
      const v1 = 18 + r.int(14);
      const v2 = 32 + r.int(16);
      for (const [rx, ry, rw, rh] of [
        [1.5, 1.5, v1 - 3, sy2 - 3],
        [v1 + 1.5, 1.5, S - v1 - 3, sy2 - 3],
        [1.5, sy2 + 1.5, v2 - 3, S - sy2 - 3],
        [v2 + 1.5, sy2 + 1.5, S - v2 - 3, S - sy2 - 3],
      ] as [number, number, number, number][]) {
        rr(g, rx, ry, rw, rh, 9, shade(base, (r.next() - 0.5) * 0.05));
        // The polish: a soft highlight sitting in the middle of each slab,
        // which is where feet land and where the sun finds them.
        oval(g, rx + rw / 2, ry + rh / 2, rw * 0.4, rh * 0.38, 'rgba(255,248,226,0.26)');
      }
      // Joints filled with pale dust, not shadow.
      g.strokeStyle = 'rgba(226,212,182,0.7)';
      g.lineWidth = 2.6;
      g.beginPath();
      g.moveTo(0, sy2); g.lineTo(S, sy2);
      g.moveTo(v1, 0); g.lineTo(v1, sy2);
      g.moveTo(v2, sy2); g.lineTo(v2, S);
      g.stroke();
      g.strokeStyle = 'rgba(96,84,66,0.16)';
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(0, sy2 + 1.6); g.lineTo(S, sy2 + 1.6);
      g.stroke();
      for (let i = 0; i < 4; i++) dot(g, r.int(S), r.int(S), 1.4, 'rgba(120,104,80,0.14)');
    });

    /**
     * The well apron: small dark setts laid in rings around the wellhead,
     * kept wet by a hundred years of buckets and swept every morning by
     * whoever gets there first. Nine cells of it make a dark middle for a pale
     * square, which is how a plaza tells you where its middle is.
     */
    make('wellstone', 5, (g, r) => {
      const base = mute(shade(PAL.stoneDark, -0.02), 0.05);
      rect(g, 0, 0, S, S, base);
      // Setts, laid in slightly curved courses.
      for (let row = 0; row < 6; row++) {
        const cy = 5 + row * 11 + r.int(3);
        for (let cx = -6; cx < S + 8; cx += 10 + r.int(4)) {
          const bow = Math.sin((cx / S) * Math.PI) * 2.4;
          const tone = shade(base, 0.06 + (r.next() - 0.5) * 0.28);
          rr(g, cx, cy + bow, 8 + r.int(3), 8.5, 3, tone);
          // Each sett takes the light on its crown.
          oval(g, cx + 4, cy + bow + 2.4, 3, 1.8, 'rgba(255,246,224,0.16)');
        }
      }
      // Water that never quite dries, and the ring it leaves as it does.
      if (r.chance(0.7)) {
        const px2 = 10 + r.int(40);
        const py = 10 + r.int(40);
        oval(g, px2, py, 9 + r.int(6), 6 + r.int(4), 'rgba(70,110,124,0.24)');
        oval(g, px2 - 2, py - 1.5, 4, 2.4, 'rgba(190,225,238,0.24)');
      }
      if (r.chance(0.5)) oval(g, r.int(S), r.int(S), 7, 3, 'rgba(28,22,16,0.14)');
      // A stray green in one joint. The sweeping is thorough, not perfect.
      if (r.chance(0.35)) {
        g.strokeStyle = shade(PAL.greenDark, 0.06);
        g.lineWidth = 1.6;
        g.lineCap = 'round';
        const gx = 8 + r.int(S - 16);
        const gy = 20 + r.int(30);
        for (let i = -1; i <= 1; i++) {
          g.beginPath();
          g.moveTo(gx, gy);
          g.quadraticCurveTo(gx + i * 2, gy - 4, gx + i * 4, gy - 7);
          g.stroke();
        }
      }
    });

    /**
     * A parva: barley sheaves stood in a rick to finish drying, tied off at
     * the crown with a straw rope and a stone. The tallest warm thing on the
     * threshing floor, and in the fold the only thing at all.
     */
    make('parva', 2, (g, r) => {
      softShadow(g, 32, 90, 24, 6, 0.22);
      // The body: overlapping courses of sheaves, each one leaning slightly.
      for (let course = 0; course < 6; course++) {
        const cy = 88 - course * 12;
        const halfW = 29 - course * 3.6;
        for (let i = 0; i < 7; i++) {
          const sx = 32 - halfW + (i / 6) * halfW * 2;
          const tone = shade(PAL.gold, 0.06 + (r.next() - 0.5) * 0.26);
          g.save();
          g.translate(sx, cy);
          g.rotate((sx - 32) * 0.014 + (r.next() - 0.5) * 0.09);
          rr(g, -5, -15, 10, 19, 4.5, tone);
          g.restore();
        }
        // A line of shadow under each course, so it reads as stacked.
        oval(g, 32, cy + 3, halfW * 0.94, 3.4, 'rgba(90,66,32,0.18)');
      }
      // The crown, gathered and tied.
      blob(g, 32, 20, 12, shade(PAL.gold, 0.16), r, 0.22);
      blob(g, 29, 15, 8, shade(PAL.gold, 0.28), r, 0.24);
      g.strokeStyle = 'rgba(120,92,44,0.7)';
      g.lineWidth = 2.2;
      g.beginPath();
      g.moveTo(20, 29);
      g.quadraticCurveTo(32, 24, 44, 29);
      g.stroke();
      // Loose straws catching the light, and the stone holding it all down.
      g.strokeStyle = shade(PAL.gold, 0.34);
      g.lineWidth = 1.4;
      g.lineCap = 'round';
      for (let i = 0; i < 7; i++) {
        const bx = 14 + r.int(36);
        const by = 30 + r.int(48);
        g.beginPath();
        g.moveTo(bx, by);
        g.lineTo(bx + 4 - r.int(9), by - 5 - r.int(5));
        g.stroke();
      }
      oval(g, 34, 14, 5.4, 4.2, shade(PAL.stone, -0.04));
      oval(g, 32.5, 12.4, 3.2, 2.4, shade(PAL.stone, 0.16));
    }, 64, 96);

    /**
     * Cántaros left in a queue at the well while their owners talk. Terracotta
     * against grey paving: the small warm note that says the well is used.
     */
    make('cantaros', 2, (g, r) => {
      softShadow(g, 32, 54, 26, 6, 0.2);
      const jar = (cx: number, cy: number, s: number, tilt: number) => {
        g.save();
        g.translate(cx, cy);
        g.rotate(tilt);
        const body = shade(PAL.terracotta, -0.16 + (r.next() - 0.5) * 0.1);
        oval(g, 0, 0, 9 * s, 11 * s, body);
        // The shoulder catches the sky; the belly holds the shade.
        oval(g, -2.6 * s, -3.4 * s, 5 * s, 5.4 * s, shade(body, 0.2));
        oval(g, 3.4 * s, 3 * s, 4 * s, 5 * s, shade(body, -0.14));
        // Neck and lip.
        rr(g, -3.4 * s, -16 * s, 6.8 * s, 7 * s, 2, shade(body, -0.06));
        oval(g, 0, -16 * s, 5.4 * s, 2.4 * s, shade(body, 0.24));
        // A band of white slip, painted by somebody in a hurry.
        g.strokeStyle = 'rgba(238,226,200,0.75)';
        g.lineWidth = 1.6 * s;
        g.beginPath();
        g.moveTo(-7.4 * s, -3 * s);
        g.quadraticCurveTo(0, -1 * s, 7.4 * s, -3 * s);
        g.stroke();
        g.restore();
      };
      jar(18, 40, 1, -0.12);
      jar(44, 42, 0.86, 0.16);
      jar(31, 46, 1.12, 0.02);
      // One tipped on its side, empty, waiting its turn.
      g.save();
      g.translate(52, 54);
      g.rotate(1.5);
      oval(g, 0, 0, 7, 8.4, shade(PAL.terracotta, -0.26));
      oval(g, 0, -11, 4, 2, '#3a2418');
      g.restore();
    });

    /**
     * The batea: a stone trough beside the well with the morning's washing in
     * it, and the suds nobody has tipped out yet. The one cool note in a
     * square made of gold and dust.
     */
    make('batea', 1, (g) => {
      const r = new Rng(77);
      softShadow(g, 32, 58, 30, 7, 0.24);
      // The hewn block, worn dish-shaped in the middle.
      rr(g, 3, 14, 58, 42, 6, shade(PAL.stone, -0.06));
      vgrad(g, 3, 14, 58, 11, 'rgba(255,246,224,0.28)', 'rgba(0,0,0,0)');
      rr(g, 9, 20, 46, 30, 11, shade(PAL.stoneDark, -0.1));
      // Water, with the sky in it and the soap on it.
      rr(g, 12, 23, 40, 24, 10, shade(PAL.water, -0.06));
      oval(g, 27, 31, 14, 6, 'rgba(190,225,238,0.36)');
      for (let i = 0; i < 10; i++) {
        dot(g, 15 + r.int(34), 25 + r.int(19), 1.6 + r.next() * 2.2, 'rgba(255,255,255,0.5)');
      }
      // A cloth hung over the near lip, still dripping.
      g.fillStyle = '#c23a52';
      g.beginPath();
      g.moveTo(34, 24);
      g.quadraticCurveTo(52, 30, 49, 56);
      g.quadraticCurveTo(39, 60, 32, 48);
      g.closePath();
      g.fill();
      g.strokeStyle = 'rgba(255,240,225,0.6)';
      g.lineWidth = 1.8;
      g.beginPath();
      g.moveTo(36, 32);
      g.quadraticCurveTo(45, 38, 44, 51);
      g.stroke();
      // The bar of soap, and a puddle spreading off the near corner.
      rr(g, 16, 46, 11, 6, 2.5, '#e8e2c8');
      oval(g, 14, 60, 15, 5, 'rgba(120,150,160,0.24)');
    });

    /**
     * Mantas spread out for sale on the paving, weighted at the corners with
     * stones. Cochineal red, indigo, q'olle yellow: the loudest thing in the
     * square, and deliberately the thing you see first from any of its mouths.
     */
    make('mantas', 3, (g, r, i) => {
      const sets: string[][] = [
        ['#a8232b', '#e8d28c', '#2f4f7a'],
        ['#7a2450', '#d9694a', '#e8e0cc'],
        ['#274c66', '#c8a55b', '#a8232b'],
      ];
      const pal = sets[i % sets.length] ?? sets[0]!;
      const cloth = (x: number, y: number, w: number, h: number, rot: number, base: string) => {
        g.save();
        g.translate(x, y);
        g.rotate(rot);
        oval(g, 2, h / 2 + 2, w * 0.52, 4, 'rgba(60,44,28,0.16)');
        rr(g, -w / 2, -h / 2, w, h, 2, base);
        // Warp stripes, then the pallay band down the middle.
        for (let s = -h / 2 + 3; s < h / 2 - 1; s += 4.5) {
          rect(g, -w / 2, s, w, 1.4, shade(base, 0.22));
        }
        rect(g, -w / 2, -3, w, 6, shade(base, -0.2));
        g.fillStyle = pal[2] ?? '#e8e0cc';
        for (let k = -w / 2 + 4; k < w / 2 - 2; k += 7) {
          g.beginPath();
          g.moveTo(k, -2.4);
          g.lineTo(k + 3, 0);
          g.lineTo(k, 2.4);
          g.lineTo(k - 3, 0);
          g.closePath();
          g.fill();
        }
        // Fringe along the near edge.
        g.strokeStyle = shade(base, 0.3);
        g.lineWidth = 1;
        for (let k = -w / 2 + 2; k < w / 2; k += 3) {
          g.beginPath();
          g.moveTo(k, h / 2);
          g.lineTo(k + 1, h / 2 + 3);
          g.stroke();
        }
        // The stone holding the corner down against the wind.
        oval(g, -w / 2 + 4, -h / 2 + 3, 3.4, 2.6, shade(PAL.stone, -0.02));
        g.restore();
      };
      cloth(24, 26, 34, 20, -0.09, pal[0] ?? '#a8232b');
      cloth(38, 46, 30, 18, 0.13, pal[1] ?? '#2f4f7a');
      // A folded one waiting its turn on top of the pile.
      rr(g, 6, 46, 18, 8, 2, shade(pal[2] ?? '#e8e0cc', -0.06));
      rr(g, 7, 43, 16, 5, 2, shade(pal[0] ?? '#a8232b', 0.06));
      void r;
    });
  },
};
