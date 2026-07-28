import type { ChapterArt } from './index';
import { dot, oval, rr, rect, vgrad, glowSpot, softShadow, shade } from '../pix';
import { PAL } from '../../engine/config';

/**
 * Chapter Nine art: a Valles Centrales village in late October. Adobe and
 * green cantera, papel picado shivering over the streets, cempasuchil rows
 * burning orange at the edge of town, and candle glass everywhere, waiting
 * for the night the whole month leans toward.
 */

const S = 64;

/** Cochineal red, both continents. */
const GRANA = '#a02335';
const CANTERA = '#87a08a';
const MARIGOLD = '#e8862f';
const MARIGOLD_HI = '#ffa53f';

export const ART: ChapterArt = {
  aliases: { correo: 'signpost', colectivo: 'signpost' },
  grounded: [
    'portales', 'panstall', 'barrostall', 'telar', 'ofrenda', 'correo', 'colectivo',
    'rebozos', 'puestoflores', 'capilla',
    'tuba', 'rotulo', 'mercadocrates', 'pantray', 'bugambilia', 'nicho', 'paletas', 'ristra',
  ],
  buildings: ['casona'],
  windows: {
    casona: [
      [15, -10],
      [67, -10],
    ],
  },
  glows: ['comal', 'veladora', 'nicho', 'capilla'],
  pathy: ['petalpath'],
  noInk: ['gallina', 'cohete', 'streetdog'],
  /** Only the cocina: the village's own `floorEarth` cells stay swept earth. */
  skins: {
    cocina: { wallInt: 'wallCal', floorEarth: 'floorSaltillo', rug: 'rugPetate' },
  },

  paint(make) {
    // ------------------------------------------------------------ grounds

    // Cempasuchil field: dark loam, rows of marigold heads.
    make('cempa', 5, (g, r) => {
      rect(g, 0, 0, S, S, shade('#5c4030', 0.02));
      for (const row of [10, 32, 54]) {
        rr(g, 0, row - 4, S, 10, 5, shade('#6b4a34', 0.04));
        for (let x = 4; x < S; x += 10 + r.int(6)) {
          const c = r.chance(0.6) ? MARIGOLD : r.chance(0.5) ? MARIGOLD_HI : '#d9701f';
          dot(g, x, row - 5 - r.int(3), 4 + r.next() * 1.6, shade('#4d7440', -0.08));
          dot(g, x, row - 7 - r.int(3), 3.4 + r.next() * 2, c);
          dot(g, x - 1, row - 8 - r.int(2), 1.4, shade(c, 0.28));
        }
      }
    });

    // The marigold way: swept earth under a drift of loose petals.
    make('petalpath', 4, (g, r) => {
      rect(g, 0, 0, S, S, shade(PAL.earth, 0.01));
      for (let i = 0; i < 26; i++) {
        const x = r.int(S);
        const y = r.int(S);
        const mid = 1 - Math.abs(x - S / 2) / (S / 2);
        if (r.next() > mid * 0.92 + 0.08) continue;
        const c = r.chance(0.55) ? MARIGOLD : r.chance(0.5) ? MARIGOLD_HI : '#c9581f';
        oval(g, x, y, 2.2 + r.next() * 1.4, 1.4 + r.next(), c, r.next() * 3);
      }
      if (r.chance(0.4)) dot(g, r.int(S), r.int(S), 1.2, '#ffe9ad');
    });

    // ------------------------------------------------------------ props

    // Papel picado: two strings of pierced tissue, wind in every rectangle.
    make('papel', 3, (g, r) => {
      const colors = ['#c94f7c', MARIGOLD_HI, '#5fb0a5', '#8a5fb0', '#7d9b3f', '#e8dcc4'];
      for (const sy of [10, 26]) {
        g.strokeStyle = 'rgba(60,50,40,0.6)';
        g.lineWidth = 1.4;
        g.beginPath();
        g.moveTo(0, sy);
        g.quadraticCurveTo(S / 2, sy + 5, S, sy);
        g.stroke();
        for (let i = 0; i < 5; i++) {
          const x = 3 + i * 13 + r.int(3);
          const yy = sy + 2 + Math.sin((x / S) * Math.PI) * 4;
          const c = colors[r.int(colors.length)] ?? MARIGOLD_HI;
          rr(g, x, yy, 9, 11, 1, c);
          // The picado: light showing through the cut paper.
          dot(g, x + 4.5, yy + 4, 1.5, 'rgba(255,250,235,0.75)');
          dot(g, x + 2.5, yy + 8, 1, 'rgba(255,250,235,0.6)');
          dot(g, x + 6.5, yy + 8, 1, 'rgba(255,250,235,0.6)');
          g.strokeStyle = 'rgba(255,250,235,0.5)';
          g.lineWidth = 1;
          g.beginPath();
          g.moveTo(x + 1, yy + 10.5);
          g.lineTo(x + 8, yy + 10.5);
          g.stroke();
        }
      }
    });

    // A comal: clay griddle on three stones over a small patient fire.
    make('comal', 2, (g, r) => {
      softShadow(g, 32, 52, 22, 6, 0.2);
      // Embers first, then the stones that ring them.
      glowSpot(g, 32, 46, 16, '#ff9d3f', 0.55);
      dot(g, 32, 47, 5.5, '#e8862f');
      dot(g, 32, 47, 2.6, '#ffe9ad');
      for (const [sx, sy] of [
        [20, 48],
        [44, 48],
        [32, 54],
      ] as const) {
        oval(g, sx, sy, 6.5, 4.5, shade(PAL.stone, -0.12));
        oval(g, sx - 1.5, sy - 1.5, 3, 2, shade(PAL.stone, 0.1));
      }
      // The comal itself, wide and dark with years of tortillas.
      oval(g, 32, 38, 21, 8, shade('#8a5330', -0.28));
      oval(g, 32, 36.5, 19, 6.5, '#5c4030');
      oval(g, 26, 35, 7, 2.6, 'rgba(240,225,200,0.14)');
      // Tortillas at the cool edge, and one blistering in the middle.
      dot(g, 40, 36.5, 4.6, '#e8d9a8');
      dot(g, 40, 36.5, 3.6, shade('#e8d9a8', -0.04));
      dot(g, 28, 38, 4.2, '#e2cf9a');
      if (r.chance(0.7)) dot(g, 41.4, 35.6, 1, '#a2823f');
    });

    // Veladoras: candle glass, the small stubborn lights of the season.
    make('veladora', 3, (g, r) => {
      softShadow(g, 32, 55, 16, 5, 0.16);
      const jars = [
        [22, 46, 6, 10],
        [34, 44, 7, 12],
        [45, 47, 5.5, 9],
      ] as const;
      for (const [jx, jy, jw, jh] of jars) {
        rr(g, jx - jw / 2, jy, jw, jh, 2.5, 'rgba(200,225,225,0.5)');
        rr(g, jx - jw / 2 + 1, jy + jh * 0.45, jw - 2, jh * 0.5, 2, '#e8c874');
        glowSpot(g, jx, jy + 1, 9, '#ffd28a', 0.55);
        oval(g, jx, jy + 1, 1.6, 3, '#ffe9ad');
        dot(g, jx, jy - 0.5, 0.9, '#fff6d8');
      }
      for (let i = 0; i < 4; i++) {
        oval(g, 14 + r.int(38), 56 + r.int(5), 2, 1.2, r.chance(0.6) ? MARIGOLD : '#c9581f', r.next() * 3);
      }
    });

    // An alebrije table: dream animals in fresh paint, none of them ancient.
    make('alebrije', 2, (g, r) => {
      softShadow(g, 32, 52, 22, 6, 0.18);
      rr(g, 10, 34, 44, 20, 3, '#8a6238');
      vgrad(g, 10, 34, 44, 6, 'rgba(255,240,210,0.22)', 'rgba(0,0,0,0)');
      // A winged something.
      oval(g, 22, 28, 7, 4.5, '#c94f7c');
      oval(g, 17, 22, 4.5, 6, '#5fb0a5', -0.5);
      dot(g, 28.5, 26, 2.6, '#c94f7c');
      dot(g, 29.5, 25.3, 0.8, '#2b2118');
      for (let i = 0; i < 5; i++) dot(g, 17 + i * 2.6, 27 + (i % 2), 0.9, '#ffe9ad');
      // A long-necked something else.
      oval(g, 44, 30, 6, 4, '#8a5fb0');
      g.strokeStyle = '#8a5fb0';
      g.lineWidth = 3.4;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(48, 28);
      g.quadraticCurveTo(52, 22, 50, 17);
      g.stroke();
      dot(g, 50, 16, 2.4, '#8a5fb0');
      for (let i = 0; i < 4; i++) dot(g, 40 + i * 2.6, 29.4 + (i % 2) * 1.2, 0.8, MARIGOLD_HI);
      void r;
    });

    // A grave: whitewashed, swept, flowered. Somebody is expected.
    // Twenty four graves that all draw the same slab and the same cross read
    // as one grave printed twenty four times, which is the opposite of what a
    // family cemetery is. These differ in silhouette, not just in wash: a
    // tiled tomb stands taller than a mound with a wooden cross, and a kerbed
    // plot has no headstone at all.
    make('tumba', 5, (g, r, i) => {
      const kind = i % 5;
      const wash = r.chance(0.6) ? '#e6ded0' : '#cfd8e0';
      const marigolds = (n: number, y: number) => {
        for (let k = 0; k < n; k++) {
          dot(g, 18 + r.int(28), y + r.int(4), 2.4 + r.next(), r.chance(0.6) ? MARIGOLD : MARIGOLD_HI);
        }
      };
      const candle = (x: number, y: number) => {
        rr(g, x, y, 5, 8, 2, 'rgba(200,225,225,0.55)');
        dot(g, x + 2.5, y - 0.5, 1.2, '#ffe9ad');
      };

      if (kind === 1) {
        // An earth mound with a wooden cross: the oldest and the poorest.
        softShadow(g, 32, 52, 20, 5, 0.14);
        g.fillStyle = '#8d6f4e';
        g.beginPath();
        g.ellipse(32, 46, 18, 8, 0, 0, Math.PI * 2);
        g.fill();
        vgrad(g, 14, 38, 36, 6, 'rgba(255,240,215,0.28)', 'rgba(0,0,0,0)');
        g.strokeStyle = '#7a5636';
        g.lineWidth = 3.4;
        g.lineCap = 'round';
        g.beginPath();
        g.moveTo(32, 22);
        g.lineTo(32, 40);
        g.moveTo(25, 28);
        g.lineTo(39, 28);
        g.stroke();
        marigolds(5, 48);
        return;
      }
      if (kind === 2) {
        // A tiled tomb, paid for and proud of it: taller, with a coloured top.
        softShadow(g, 32, 54, 22, 6, 0.18);
        const tile = r.chance(0.5) ? '#7fa8b8' : '#c98f5f';
        rr(g, 13, 26, 38, 26, 3, shade(wash, -0.04));
        rr(g, 13, 22, 38, 8, 3, tile);
        vgrad(g, 13, 22, 38, 4, 'rgba(255,255,245,0.45)', 'rgba(0,0,0,0)');
        g.strokeStyle = shade(tile, -0.3);
        g.lineWidth = 1;
        for (let x = 20; x < 50; x += 8) {
          g.beginPath();
          g.moveTo(x, 22);
          g.lineTo(x, 30);
          g.stroke();
        }
        marigolds(4, 52);
        candle(46, 42);
        return;
      }
      if (kind === 3) {
        // A kerbed plot, no stone at all: a rectangle of gravel and flowers.
        softShadow(g, 32, 52, 21, 5, 0.12);
        rr(g, 12, 30, 40, 24, 2, shade(wash, -0.1));
        rr(g, 16, 34, 32, 16, 2, '#a89880');
        for (let k = 0; k < 10; k++) {
          dot(g, 18 + r.int(28), 36 + r.int(12), 1.4 + r.next(), r.chance(0.5) ? MARIGOLD : MARIGOLD_HI);
        }
        candle(14, 26);
        return;
      }
      if (kind === 4) {
        // A niche with an arched head, a little glass door, a photograph.
        softShadow(g, 32, 54, 20, 6, 0.18);
        rr(g, 16, 32, 32, 20, 3, wash);
        g.fillStyle = shade(wash, -0.05);
        g.beginPath();
        g.moveTo(22, 34);
        g.lineTo(22, 18);
        g.arc(32, 18, 10, Math.PI, 0);
        g.lineTo(42, 34);
        g.closePath();
        g.fill();
        rr(g, 27, 14, 10, 13, 2, 'rgba(150,180,190,0.5)');
        dot(g, 32, 20, 2.6, 'rgba(60,48,36,0.5)');
        marigolds(4, 50);
        return;
      }
      // The common one: a slab with a soft cross on its headstone.
      softShadow(g, 32, 52, 22, 6, 0.16);
      rr(g, 14, 34, 36, 18, 3, wash);
      vgrad(g, 14, 34, 36, 5, 'rgba(255,255,245,0.5)', 'rgba(0,0,0,0)');
      rr(g, 24, 16, 16, 20, 3, shade(wash, -0.06));
      g.strokeStyle = shade(wash, -0.35);
      g.lineWidth = 2.2;
      g.beginPath();
      g.moveTo(32, 20);
      g.lineTo(32, 30);
      g.moveTo(28, 23.5);
      g.lineTo(36, 23.5);
      g.stroke();
      marigolds(6, 50);
      candle(44, 40);
    });

    // Portales pier: green cantera, an arch springing to either side.
    make('portales', 2, (g, r) => {
      softShadow(g, 32, 90, 20, 5, 0.2);
      const stone = shade(CANTERA, (r.next() - 0.5) * 0.05);
      // The half-arches reaching toward the neighboring piers.
      g.strokeStyle = shade(stone, -0.1);
      g.lineWidth = 12;
      g.beginPath();
      g.moveTo(0, 26);
      g.quadraticCurveTo(14, 8, 32, 8);
      g.quadraticCurveTo(50, 8, 64, 26);
      g.stroke();
      g.strokeStyle = shade(stone, 0.1);
      g.lineWidth = 4;
      g.beginPath();
      g.moveTo(2, 22);
      g.quadraticCurveTo(15, 5, 32, 5);
      g.quadraticCurveTo(49, 5, 62, 22);
      g.stroke();
      // The pier: plinth, shaft, capital.
      rr(g, 22, 12, 20, 74, 3, stone);
      const grad = g.createLinearGradient(22, 0, 42, 0);
      grad.addColorStop(0, 'rgba(255,250,235,0.25)');
      grad.addColorStop(0.5, 'rgba(0,0,0,0)');
      grad.addColorStop(1, 'rgba(30,40,32,0.3)');
      g.fillStyle = grad;
      g.fillRect(22, 12, 20, 74);
      rr(g, 19, 10, 26, 8, 2, shade(stone, 0.08));
      rr(g, 18, 80, 28, 10, 2, shade(stone, -0.08));
      g.strokeStyle = 'rgba(40,55,44,0.35)';
      g.lineWidth = 1.4;
      g.beginPath();
      g.moveTo(24, 30);
      g.lineTo(24, 78);
      g.stroke();
    });

    // The camposanto arch: cantera posts, marigold garland, open middle.
    make('campogate', 1, (g) => {
      const stone = CANTERA;
      for (const px of [2, 52]) {
        rr(g, px, 20, 10, 74, 2, stone);
        vgrad(g, px, 20, 10, 12, 'rgba(255,250,235,0.3)', 'rgba(0,0,0,0)');
        rr(g, px - 2, 88, 14, 6, 2, shade(stone, -0.1));
      }
      g.strokeStyle = stone;
      g.lineWidth = 10;
      g.beginPath();
      g.moveTo(7, 26);
      g.quadraticCurveTo(32, 6, 57, 26);
      g.stroke();
      // The garland: marigold heads strung across the arch.
      for (let i = 0; i <= 8; i++) {
        const t = i / 8;
        const x = 7 + t * 50;
        const y = 26 - Math.sin(t * Math.PI) * 15 + 7;
        dot(g, x, y, 3.4, i % 2 ? MARIGOLD : MARIGOLD_HI);
        dot(g, x - 1, y - 1, 1.2, '#ffcf7a');
      }
    }, 64, 96);

    // The pan de muerto stall: shelves of bread with painted caritas.
    make('panstall', 2, (g, r) => {
      softShadow(g, 32, 90, 26, 6, 0.2);
      rr(g, 6, 40, 52, 44, 3, '#9b7a50');
      vgrad(g, 6, 40, 52, 8, 'rgba(255,240,210,0.2)', 'rgba(0,0,0,0)');
      for (const row of [48, 66] as const) {
        rect(g, 9, row + 8, 46, 3, shade('#9b7a50', -0.2));
        for (let i = 0; i < 4; i++) {
          const bx = 14 + i * 12;
          dot(g, bx, row + 2, 5.6, '#c98a2e');
          dot(g, bx, row + 1, 4.6, shade('#c98a2e', 0.12));
          // Bone strips crossed over the crown, sugar dust.
          g.strokeStyle = shade('#c98a2e', 0.3);
          g.lineWidth = 1.6;
          g.beginPath();
          g.moveTo(bx - 4, row);
          g.lineTo(bx + 4, row + 3);
          g.moveTo(bx + 4, row);
          g.lineTo(bx - 4, row + 3);
          g.stroke();
          // The carita, looking back at you.
          if (r.chance(0.6)) {
            dot(g, bx, row - 1, 2, '#f0e0c0');
            dot(g, bx - 0.8, row - 1.4, 0.5, '#7a4a20');
            dot(g, bx + 0.8, row - 1.4, 0.5, '#7a4a20');
          }
        }
      }
      // Awning in fiesta stripes.
      rr(g, 2, 22, 60, 9, 4, PAL.terracotta);
      g.fillStyle = PAL.cream;
      g.fillRect(12, 22, 11, 9);
      g.fillRect(36, 22, 11, 9);
      rr(g, 4, 29, 2.6, 30, 1.3, '#7a5636');
      rr(g, 57, 29, 2.6, 30, 1.3, '#7a5636');
    }, 64, 96);

    // Barro negro: grey clay gone black and shining under a quartz stone.
    make('barrostall', 2, (g, r) => {
      softShadow(g, 32, 90, 26, 6, 0.2);
      rr(g, 6, 42, 52, 42, 3, '#8a6a44');
      vgrad(g, 6, 42, 52, 8, 'rgba(255,240,210,0.18)', 'rgba(0,0,0,0)');
      for (const [px, py, prx, pry] of [
        [16, 50, 7, 8],
        [33, 48, 8.5, 10],
        [49, 51, 6, 7],
        [22, 70, 8, 9],
        [42, 70, 9, 10],
      ] as const) {
        oval(g, px, py, prx, pry, '#211d20');
        oval(g, px, py - pry * 0.55, prx * 0.55, pry * 0.28, '#161316');
        // The burnished shine: the whole point of the technique.
        oval(g, px - prx * 0.35, py - pry * 0.3, prx * 0.3, pry * 0.45, 'rgba(180,190,205,0.35)', -0.5);
        if (r.chance(0.5)) dot(g, px + prx * 0.3, py + pry * 0.2, 1.2, 'rgba(180,190,205,0.25)');
      }
      rr(g, 2, 24, 60, 9, 4, '#4a5d78');
      g.fillStyle = PAL.cream;
      g.fillRect(12, 24, 11, 9);
      g.fillRect(36, 24, 11, 9);
      rr(g, 4, 31, 2.6, 28, 1.3, '#7a5636');
      rr(g, 57, 31, 2.6, 28, 1.3, '#7a5636');
    }, 64, 96);

    // The rebozo rack: the loudest thing in the lane, and the only wall of
    // colour in a village built out of dry earth.
    make('rebozos', 3, (g, r) => {
      softShadow(g, 32, 90, 24, 6, 0.2);
      // The frame: two poles and a crossbar, lashed, leaning slightly.
      rr(g, 6, 20, 4.4, 68, 2, '#7a5636');
      rr(g, 53, 20, 4.4, 68, 2, '#7a5636');
      rr(g, 3, 16, 58, 5.5, 2.5, '#8a6238');
      const bolts = [GRANA, '#2f6f8a', MARIGOLD_HI, '#5c3a7a', '#3f7a52', '#c94f7c', '#d9a441'];
      // Cloth hung to be walked into: different lengths, different hems.
      let x = 7;
      let i = r.int(bolts.length);
      while (x < 52) {
        const w = 7 + r.int(6);
        const h = 34 + r.int(30);
        const c = bolts[i % bolts.length] ?? GRANA;
        i += 1 + r.int(3);
        rr(g, x, 20, w, h, 2, c);
        vgrad(g, x, 20, w, h * 0.35, 'rgba(255,250,235,0.22)', 'rgba(0,0,0,0)');
        vgrad(g, x, 20 + h * 0.5, w, h * 0.5, 'rgba(0,0,0,0)', 'rgba(30,20,26,0.28)');
        // The banded weave, and the knotted fringe at the bottom.
        g.strokeStyle = shade(c, 0.28);
        g.lineWidth = 1.2;
        for (let k = 1; k < 4; k++) {
          g.beginPath();
          g.moveTo(x + 0.5, 20 + (h * k) / 4);
          g.lineTo(x + w - 0.5, 20 + (h * k) / 4);
          g.stroke();
        }
        g.strokeStyle = shade(c, -0.2);
        g.lineWidth = 1;
        for (let k = 0; k < 4; k++) {
          const fx = x + 1.5 + k * ((w - 3) / 3);
          g.beginPath();
          g.moveTo(fx, 20 + h);
          g.lineTo(fx + (r.next() - 0.5) * 2, 20 + h + 4);
          g.stroke();
        }
        x += w + 1 + r.int(2);
      }
      // A folded stack on the ground where the seller sits.
      for (let k = 0; k < 3; k++) {
        rr(g, 12 + k, 80 - k * 4, 24, 5, 2, bolts[(i + k) % bolts.length] ?? GRANA);
      }
    }, 64, 96);

    // The flower stand: cempasuchil by the armful, cresta de gallo beside it,
    // the two colours this week is actually made of.
    make('puestoflores', 3, (g, r) => {
      softShadow(g, 32, 90, 26, 7, 0.22);
      // A cloth on the ground, buckets on it, the whole shop.
      oval(g, 32, 78, 27, 11, '#4a6d7a');
      oval(g, 32, 76, 24, 9, '#5c8494');
      for (const [bx, by, bw] of [[13, 50, 18], [34, 40, 21], [52, 54, 16]] as const) {
        // The bucket.
        rr(g, bx - bw / 2, by + 14, bw, 20, 3, '#9aa6ab');
        rr(g, bx - bw / 2, by + 13, bw, 5, 2, '#b9c4c9');
        vgrad(g, bx - bw / 2, by + 14, bw, 8, 'rgba(255,255,255,0.3)', 'rgba(0,0,0,0)');
        // The armful standing in it: marigold heads, and one bucket of red.
        const red = bx === 52;
        for (let k = 0; k < 16; k++) {
          const a = -2.1 + (k / 15) * 2.5 + (r.next() - 0.5) * 0.24;
          const rad = 18 + r.int(15);
          const hx = bx + Math.cos(a) * rad * 0.75;
          const hy = by + 16 + Math.sin(a) * rad;
          g.strokeStyle = '#4a6b3a';
          g.lineWidth = 1.6;
          g.beginPath();
          g.moveTo(bx, by + 18);
          g.quadraticCurveTo((bx + hx) / 2, (by + hy) / 2, hx, hy);
          g.stroke();
          dot(g, hx, hy, 4 + r.next() * 1.4, red ? (k % 2 ? GRANA : '#c94f7c') : k % 2 ? MARIGOLD : MARIGOLD_HI);
          dot(g, hx - 1.4, hy - 1.4, 1.5, red ? '#e0748a' : '#ffcf7a');
        }
      }
      // Loose heads on the cloth, and the tin the money lives in.
      for (let k = 0; k < 5; k++) {
        dot(g, 14 + r.int(38), 74 + r.int(8), 2.6, k % 2 ? MARIGOLD : GRANA);
      }
      rr(g, 44, 74, 10, 8, 2, '#c9b48a');
    }, 64, 96);

    // The Ramírez chapel: the family that could afford a roof over its dead,
    // whitewashed every October by an argument that is itself a tradition.
    make('capilla', 1, (g) => {
      softShadow(g, 48, 122, 34, 9, 0.26);
      const wash = '#efe7d6';
      const trim = CANTERA;
      // The body, with a shallow buttress each side.
      rr(g, 12, 44, 72, 78, 4, shade(wash, -0.06));
      rr(g, 16, 40, 64, 84, 4, wash);
      vgrad(g, 16, 40, 64, 26, 'rgba(255,255,246,0.5)', 'rgba(0,0,0,0)');
      vgrad(g, 16, 96, 64, 28, 'rgba(0,0,0,0)', 'rgba(60,50,44,0.28)');
      rr(g, 8, 108, 80, 16, 3, shade(trim, -0.06));
      // The gable and the little bell arch on top of it.
      g.fillStyle = shade(wash, 0.04);
      g.beginPath();
      g.moveTo(14, 44);
      g.lineTo(48, 12);
      g.lineTo(82, 44);
      g.closePath();
      g.fill();
      g.strokeStyle = trim;
      g.lineWidth = 4;
      g.beginPath();
      g.moveTo(12, 46);
      g.lineTo(48, 12);
      g.lineTo(84, 46);
      g.stroke();
      g.strokeStyle = '#8c8479';
      g.lineWidth = 3;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(48, 2);
      g.lineTo(48, 14);
      g.moveTo(42, 6);
      g.lineTo(54, 6);
      g.stroke();
      // The glazed door, its iron grille, and the family name below the arch.
      g.fillStyle = '#3a4a3e';
      g.beginPath();
      g.moveTo(32, 108);
      g.lineTo(32, 68);
      g.quadraticCurveTo(48, 52, 64, 68);
      g.lineTo(64, 108);
      g.closePath();
      g.fill();
      g.strokeStyle = shade(trim, 0.1);
      g.lineWidth = 2;
      for (const gx of [40, 48, 56]) {
        g.beginPath();
        g.moveTo(gx, 106);
        g.lineTo(gx, 62 + Math.abs(gx - 48) * 0.5);
        g.stroke();
      }
      g.beginPath();
      g.moveTo(34, 84);
      g.lineTo(62, 84);
      g.stroke();
      rr(g, 30, 56, 36, 6, 2, shade(trim, 0.14));
      // Behind the glass: candles that have been burning since Tuesday.
      glowSpot(g, 42, 96, 14, '#ffc978', 0.5);
      glowSpot(g, 54, 98, 12, '#ffc978', 0.42);
      rr(g, 40, 92, 5, 10, 2, 'rgba(255,236,200,0.85)');
      rr(g, 52, 94, 5, 9, 2, 'rgba(255,236,200,0.75)');
      // Marigolds banked along the plinth, and a jar of water for the flowers.
      for (let k = 0; k < 9; k++) {
        dot(g, 14 + k * 9 + (k % 2) * 3, 112 + (k % 3), 3.4, k % 2 ? MARIGOLD : MARIGOLD_HI);
      }
      rr(g, 76, 100, 9, 10, 2, 'rgba(200,225,225,0.55)');
      dot(g, 80.5, 96, 3, GRANA);
    }, 96, 128);

    // The telar: a standing tapestry loom, cochineal red walking up the warp.
    make('telar', 1, (g) => {
      softShadow(g, 32, 90, 22, 5, 0.2);
      rr(g, 8, 6, 6, 82, 2, '#7a5636');
      rr(g, 50, 6, 6, 82, 2, '#7a5636');
      rr(g, 6, 6, 52, 6, 2, '#8a6238');
      rr(g, 6, 80, 52, 7, 2, '#8a6238');
      g.strokeStyle = 'rgba(242,230,208,0.85)';
      g.lineWidth = 1.3;
      for (let x = 17; x <= 47; x += 3) {
        g.beginPath();
        g.moveTo(x, 14);
        g.lineTo(x, 78);
        g.stroke();
      }
      // The cloth so far: deep grana with a pale diamond finding its shape.
      rr(g, 15, 46, 34, 32, 2, GRANA);
      rect(g, 15, 50, 34, 2.4, shade(GRANA, -0.18));
      g.strokeStyle = PAL.cream;
      g.lineWidth = 1.8;
      g.beginPath();
      g.moveTo(32, 56);
      g.lineTo(41, 65);
      g.lineTo(32, 74);
      g.lineTo(23, 65);
      g.closePath();
      g.stroke();
      dot(g, 32, 65, 1.8, MARIGOLD_HI);
      // Skeins of dyed wool hung from the top beam.
      for (const [wx, wc] of [
        [20, GRANA],
        [28, shade(GRANA, 0.16)],
        [44, '#6b3550'],
      ] as const) {
        oval(g, wx, 20, 3.4, 6.5, wc);
        oval(g, wx, 15, 1.4, 2.4, '#7a5636');
      }
    }, 64, 96);

    // The ofrenda table: tiers, cloth, an arch of marigolds over everything.
    make('ofrenda', 1, (g) => {
      softShadow(g, 32, 90, 24, 6, 0.22);
      // Lower tier.
      rr(g, 8, 56, 48, 30, 3, '#8a6238');
      rr(g, 6, 52, 52, 10, 2, '#f0e8d4');
      // Upper tier.
      rr(g, 16, 36, 32, 18, 2, '#8a6238');
      rr(g, 14, 33, 36, 8, 2, '#f0e8d4');
      // Papel edge on the cloth.
      for (let i = 0; i < 8; i++) {
        rect(g, 8 + i * 6, 60, 4.4, 5, i % 2 ? '#c94f7c' : '#5fb0a5');
      }
      // The marigold arch.
      g.strokeStyle = '#4d7440';
      g.lineWidth = 5;
      g.beginPath();
      g.moveTo(8, 56);
      g.quadraticCurveTo(32, 6, 56, 56);
      g.stroke();
      for (let i = 0; i <= 9; i++) {
        const t = i / 9;
        const x = 8 + 48 * t;
        const y = 56 - Math.sin(t * Math.PI) * 42;
        dot(g, x, y, 3.6, i % 2 ? MARIGOLD : MARIGOLD_HI);
        dot(g, x - 1, y - 1, 1.3, '#ffcf7a');
      }
      // What the altar holds: candles, a framed photo, cups, bread.
      rr(g, 20, 24, 10, 12, 1.5, '#7a5636');
      rr(g, 21.5, 25.5, 7, 9, 1, '#e8d9a8');
      rr(g, 36, 26, 4, 10, 1.5, 'rgba(200,225,225,0.6)');
      dot(g, 38, 25, 1.3, '#ffe9ad');
      dot(g, 14, 48, 4, '#c98a2e');
      oval(g, 44, 49, 3.4, 2.2, '#b5573a');
      rr(g, 24, 44, 5, 7, 1.2, 'rgba(200,225,225,0.55)');
      dot(g, 26.5, 43, 1.2, '#ffe9ad');
      for (let i = 0; i < 5; i++) dot(g, 12 + i * 9, 63 + (i % 2) * 2, 2, MARIGOLD);
    }, 64, 96);

    // -------------------------------------------------- the love layer

    // Cut cempasuchil: armfuls tied with twine, waiting to be strung.
    make('cempacut', 3, (g, r) => {
      softShadow(g, 32, 50, 20, 6, 0.16);
      const bundles = r.chance(0.5) ? 2 : 3;
      for (let b = 0; b < bundles; b++) {
        const bx = 18 + b * 14 + r.int(4);
        const by = 44 + (b % 2) * 5;
        const a = -0.5 + r.next() * 1;
        // Stems bunched toward one end, twine, then the burning heads.
        g.strokeStyle = shade('#6b8a42', -0.06 + r.next() * 0.1);
        g.lineWidth = 1.6;
        for (let s = 0; s < 4; s++) {
          g.beginPath();
          g.moveTo(bx - 10, by + 3 - s * 1.6);
          g.lineTo(bx + 4, by - 2 + Math.sin(a) * 2);
          g.stroke();
        }
        rr(g, bx - 4, by - 3.4, 3, 6.4, 1.4, '#c9b06a');
        for (let f = 0; f < 6; f++) {
          const fx = bx + 5 + r.int(8);
          const fy = by - 5 + r.int(10);
          dot(g, fx, fy, 3.6 + r.next() * 1.6, r.chance(0.6) ? MARIGOLD : MARIGOLD_HI);
          dot(g, fx - 1.2, fy - 1.2, 1.4, '#ffcf7a');
        }
      }
      // A loose head that escaped the twine.
      dot(g, 12 + r.int(8), 54, 2.4, '#c9581f');
    });

    // An agave piña resting by a doorway: eight years, trimmed to a heart.
    make('agavepina', 2, (g, r) => {
      softShadow(g, 32, 54, 18, 6, 0.2);
      // The heart: pale flesh, leaf scars ringing it like tree rings.
      oval(g, 32, 42, 15, 13, '#d8c98f');
      oval(g, 32, 40, 14, 11, '#e6d9a4');
      for (let ring = 0; ring < 4; ring++) {
        g.strokeStyle = `rgba(138,122,60,${0.5 - ring * 0.08})`;
        g.lineWidth = 1.4;
        g.beginPath();
        g.ellipse(32, 42 - ring * 4, 13 - ring * 2.6, 4.4 - ring * 0.7, 0, Math.PI, Math.PI * 2);
        g.stroke();
      }
      // Trimmed leaf stubs, still a little green where the machete stopped.
      for (let i = 0; i < 7; i++) {
        const a = -0.4 - i * 0.38 + r.next() * 0.1;
        const sx = 32 + Math.cos(a) * 13;
        const sy = 40 + Math.sin(a) * 10;
        oval(g, sx, sy, 3.4, 2, shade('#8fae5c', (r.next() - 0.5) * 0.12), a);
      }
      dot(g, 27, 35, 3, 'rgba(255,246,220,0.5)');
    });

    // Papel picado not yet strung: folded flat, colors sorted, scissors on top.
    make('papelstack', 1, (g) => {
      softShadow(g, 32, 52, 18, 5, 0.16);
      const cols = ['#c94f7c', '#5fb0a5', MARIGOLD_HI, '#8a5fb0', '#e8dcc4', '#7d9b3f'];
      for (let i = 0; i < 6; i++) {
        const c = cols[i] ?? '#c94f7c';
        rr(g, 16 + (i % 2) * 2, 46 - i * 2.6, 30, 4.4, 1, c);
        rect(g, 16 + (i % 2) * 2, 48.2 - i * 2.6, 30, 1, shade(c, -0.22));
      }
      // The scissors, resting mid-thought.
      g.strokeStyle = '#5c6570';
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(26, 28);
      g.lineTo(38, 33);
      g.moveTo(28, 33);
      g.lineTo(38, 29);
      g.stroke();
      dot(g, 26.5, 27.5, 2, '#8a4a3a');
      dot(g, 27.5, 33.5, 2, '#8a4a3a');
    });

    // The street dog: warmest doorstep in the village, thoroughly earned.
    make('streetdog', 2, (g, r) => {
      // The doorstep mat he has annexed.
      oval(g, 32, 47, 19, 9, shade('#a2764a', -0.1));
      oval(g, 32, 46, 17, 7.5, '#b58755');
      rect(g, 17, 44, 30, 1.2, 'rgba(122,86,54,0.4)');
      const coat = r.chance(0.6) ? '#c9a06a' : '#9c7a4e';
      // Body stretched flat on its side, ribs rising once a minute.
      oval(g, 34, 42, 12, 6.5, coat);
      oval(g, 41, 40.5, 5.5, 5, shade(coat, -0.04));
      // The darker saddle every village dog is issued.
      oval(g, 35, 39.5, 7, 3.4, shade(coat, -0.16));
      // Head flat on the stone, ear flopped over, muzzle pale, nose dark.
      oval(g, 22, 42.5, 5.6, 4.4, coat);
      oval(g, 24.5, 38.8, 2.8, 3.6, shade(coat, -0.22), 0.5);
      oval(g, 16.8, 43.8, 3, 2.3, shade(coat, 0.2));
      dot(g, 14.6, 43.8, 1.4, '#3a2a20');
      // Closed eye: one contented line.
      g.strokeStyle = '#4a3826';
      g.lineWidth = 1.2;
      g.beginPath();
      g.moveTo(20.5, 40.8);
      g.lineTo(23, 40.8);
      g.stroke();
      // Front paws out ahead, tail curled around, pale at the tip.
      oval(g, 20, 47.5, 4.4, 1.8, shade(coat, 0.1));
      g.strokeStyle = shade(coat, -0.12);
      g.lineWidth = 3.2;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(45, 44);
      g.quadraticCurveTo(48, 49, 41, 50);
      g.stroke();
      dot(g, 40.5, 50, 1.8, shade(coat, 0.25));
    });

    // Chapulines by the scoop: toasted red, lime wedges standing by.
    make('chapulines', 2, (g, r) => {
      softShadow(g, 32, 52, 18, 5, 0.18);
      oval(g, 32, 44, 17, 9, '#9b7a50');
      oval(g, 32, 43, 15, 7.5, shade('#9b7a50', 0.12));
      oval(g, 32, 43, 13, 6, '#7a4a2a');
      // The heap, freckled with chile and salt.
      oval(g, 32, 41.5, 11.5, 5, '#a04a28');
      for (let i = 0; i < 16; i++) {
        dot(g, 23 + r.int(19), 37.5 + r.int(7), 0.9, r.chance(0.6) ? '#7a3018' : '#c1512f');
      }
      for (let i = 0; i < 5; i++) dot(g, 24 + r.int(17), 38 + r.int(6), 0.5, '#f0e0c0');
      // Lime wedges and the wooden scoop.
      oval(g, 45, 49, 3, 2.2, '#9bc25c', 0.4);
      oval(g, 48, 47, 3, 2.2, '#b8d878', -0.3);
      rr(g, 16, 46, 9, 3.4, 1.6, '#8a6238');
      oval(g, 17.5, 47.6, 2.6, 1.4, shade('#8a6238', -0.2));
    });

    // Cantaros in the shade: clay water jars, plates over their mouths.
    make('cantaros', 2, (g, r) => {
      softShadow(g, 32, 54, 19, 6, 0.2);
      for (const [cx, cy, cr] of [
        [24, 42, 10],
        [42, 45, 8],
      ] as const) {
        oval(g, cx, cy, cr, cr * 0.92, '#a2603a');
        oval(g, cx - cr * 0.3, cy - cr * 0.3, cr * 0.42, cr * 0.34, 'rgba(255,240,215,0.28)');
        oval(g, cx, cy + cr * 0.5, cr * 0.8, cr * 0.28, shade('#a2603a', -0.2));
        // Neck, and the little plate that keeps the flies honest.
        rr(g, cx - 3.4, cy - cr - 3, 6.8, 5, 2, shade('#a2603a', -0.08));
        oval(g, cx, cy - cr - 3, 5.4, 1.8, '#c9b06a');
      }
      // The dark bloom of dampness where the big jar sweats.
      oval(g, 24, 47, 6, 3, 'rgba(60,38,26,0.25)');
      if (r.chance(0.6)) dot(g, 33, 52, 1.2, 'rgba(90,130,150,0.5)');
    });

    // The metate: volcanic stone, three legs, generations of grinding.
    make('metate', 1, (g) => {
      softShadow(g, 32, 54, 19, 5, 0.2);
      // Legs first, then the sloped plate over them.
      for (const [lx, ly] of [
        [20, 49],
        [44, 49],
        [32, 53],
      ] as const) {
        rr(g, lx - 3, ly - 4, 6, 8, 2, '#4a4544');
      }
      g.fillStyle = '#5c5654';
      g.beginPath();
      g.moveTo(14, 44);
      g.lineTo(50, 40);
      g.lineTo(52, 46);
      g.lineTo(16, 50);
      g.closePath();
      g.fill();
      // The working face, polished paler by years of cacao and chile.
      g.fillStyle = '#736a66';
      g.beginPath();
      g.moveTo(16, 43);
      g.lineTo(48, 39.4);
      g.lineTo(50, 43);
      g.lineTo(18, 46.6);
      g.closePath();
      g.fill();
      oval(g, 33, 42.6, 10, 2.2, 'rgba(240,225,205,0.2)', -0.08);
      // The mano, resting across the top, and a dust of ground cacao.
      rr(g, 24, 36, 17, 4.4, 2.2, '#4a4544');
      oval(g, 25, 38, 2, 2, '#5c5654');
      for (let i = 0; i < 5; i++) dot(g, 22 + i * 5, 44 - i * 0.5, 0.8, '#5c4030');
    });

    // A broom mid-shift: every door sweeps to the middle of the street.
    make('escoba', 2, (g, r) => {
      // Swept arcs in the dust, the broom's signature.
      g.strokeStyle = 'rgba(120,90,60,0.3)';
      g.lineWidth = 1.2;
      for (let i = 0; i < 3; i++) {
        g.beginPath();
        g.arc(30 + i * 3, 52, 10 + i * 3, Math.PI * 1.15, Math.PI * 1.85);
        g.stroke();
      }
      softShadow(g, 34, 52, 14, 4, 0.14);
      // Handle leaning at the honest angle of a pause, not an abandonment.
      g.strokeStyle = '#8a6238';
      g.lineWidth = 3;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(22 + r.int(3), 10);
      g.lineTo(38, 44);
      g.stroke();
      // The bound twig head, worn to a slant.
      g.fillStyle = '#b09550';
      g.beginPath();
      g.moveTo(34, 40);
      g.lineTo(46, 44);
      g.lineTo(44, 52);
      g.lineTo(30, 48);
      g.closePath();
      g.fill();
      g.strokeStyle = shade('#b09550', -0.25);
      g.lineWidth = 1;
      for (let i = 0; i < 5; i++) {
        g.beginPath();
        g.moveTo(33 + i * 2.6, 42 + i * 0.8);
        g.lineTo(31 + i * 2.6, 50 + i * 0.5);
        g.stroke();
      }
      rr(g, 33, 40, 8, 3, 1.5, '#a02335');
    });

    // Hens on audit: whatever the comal drops, the committee finds.
    make('gallina', 3, (g, r) => {
      const brown = shade('#a2603a', (r.next() - 0.5) * 0.1);
      // Scratch marks: evidence of due diligence.
      g.strokeStyle = 'rgba(120,90,60,0.35)';
      g.lineWidth = 1;
      for (let i = 0; i < 4; i++) {
        g.beginPath();
        g.moveTo(14 + r.int(34), 50 + r.int(6));
        g.lineTo(18 + r.int(34), 52 + r.int(6));
        g.stroke();
      }
      // Hen one, brown, mid-peck: compact, tail up, beak to the ground.
      softShadow(g, 23, 50, 8, 2.6, 0.14);
      oval(g, 23, 43.5, 6.5, 5, brown);
      oval(g, 18.5, 39.5, 3.4, 4.6, shade(brown, -0.14), 0.5); // tail up
      dot(g, 28.5, 45.5, 2.6, shade(brown, 0.1)); // head, low
      dot(g, 29.2, 43.2, 1.1, '#c1512f'); // comb
      g.strokeStyle = '#e8a53f';
      g.lineWidth = 1.4;
      g.beginPath();
      g.moveTo(30.5, 46.5);
      g.lineTo(32.5, 48.5); // beak, at work
      g.moveTo(21, 48);
      g.lineTo(21, 51);
      g.moveTo(25, 48);
      g.lineTo(25, 51);
      g.stroke();
      dot(g, 33.6, 49.6, 0.7, '#c9b06a'); // the finding
      // Hen two, white, upright, supervising the audit.
      softShadow(g, 44, 51, 7, 2.6, 0.14);
      const white = '#e8dcc4';
      oval(g, 44, 43, 6, 4.8, white);
      oval(g, 39, 39, 3, 4.2, shade(white, -0.14), -0.5); // tail
      dot(g, 48.5, 37.5, 2.7, shade(white, 0.05)); // head, high
      oval(g, 47, 40.5, 2.2, 3, shade(white, 0.02), 0.3); // neck
      dot(g, 48.7, 34.7, 1.2, '#c1512f'); // comb
      g.strokeStyle = '#e8a53f';
      g.lineWidth = 1.4;
      g.beginPath();
      g.moveTo(51, 37.8);
      g.lineTo(53.4, 38.4); // beak, level, judging
      g.moveTo(42, 47.5);
      g.lineTo(42, 51);
      g.moveTo(46, 47.5);
      g.lineTo(46, 51);
      g.stroke();
      dot(g, 49.6, 36.6, 0.6, '#3a2a20'); // the eye that misses nothing
    });

    // A spent cohete: the stick comes down somewhere, every single time.
    make('cohete', 3, (g, r) => {
      const a = r.next() * 0.8 - 0.4;
      const cx = 26 + r.int(12);
      const cy = 44 + r.int(8);
      // The cane stick, and the scorched twist that did the announcing.
      g.strokeStyle = '#c9b06a';
      g.lineWidth = 2;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(cx - Math.cos(a) * 16, cy - Math.sin(a) * 6);
      g.lineTo(cx + Math.cos(a) * 12, cy + Math.sin(a) * 6);
      g.stroke();
      rr(g, cx + Math.cos(a) * 10 - 2.4, cy + Math.sin(a) * 6 - 3.6, 5.4, 7, 1.6, '#4a4038');
      dot(g, cx + Math.cos(a) * 10, cy + Math.sin(a) * 6 - 4, 1.6, '#2b2118');
      // A little ash, already being redistributed by hens.
      for (let i = 0; i < 4; i++) dot(g, cx + r.int(14) - 7, cy + 6 + r.int(4), 0.8, 'rgba(80,72,64,0.5)');
    });

    // The whitewash cubeta: tomb-tidying is housework for family who moved.
    make('cubeta', 1, (g) => {
      softShadow(g, 30, 54, 14, 5, 0.18);
      // Galvanized bucket, wire handle at ease.
      g.fillStyle = '#8a9299';
      g.beginPath();
      g.moveTo(20, 36);
      g.lineTo(40, 36);
      g.lineTo(37, 52);
      g.lineTo(23, 52);
      g.closePath();
      g.fill();
      vgrad(g, 20, 36, 20, 6, 'rgba(235,240,245,0.4)', 'rgba(0,0,0,0)');
      oval(g, 30, 36, 10, 3, '#6b7278');
      oval(g, 30, 36, 8.4, 2.2, '#e8e4da');
      g.strokeStyle = '#6b7278';
      g.lineWidth = 1.6;
      g.beginPath();
      g.arc(30, 38, 10, Math.PI * 1.1, Math.PI * 1.9);
      g.stroke();
      // The brush across the rim, and one drip that got away.
      rr(g, 33, 28, 4, 12, 2, '#8a6238');
      rr(g, 31.5, 25, 7, 5, 2, '#d9d2c2');
      dot(g, 26, 54, 1.6, '#e8e4da');
      dot(g, 42, 51, 1.2, '#e8e4da');
    });

    // The costal of petals: the whole field, folded into one sack.
    make('costal', 1, (g) => {
      softShadow(g, 32, 54, 17, 6, 0.2);
      // Woven sack with a rolled cuff, leaning slightly, full of orange.
      g.fillStyle = '#c9b06a';
      g.beginPath();
      g.moveTo(20, 30);
      g.quadraticCurveTo(14, 44, 18, 53);
      g.lineTo(46, 53);
      g.quadraticCurveTo(50, 42, 44, 30);
      g.closePath();
      g.fill();
      g.strokeStyle = 'rgba(122,102,54,0.5)';
      g.lineWidth = 1;
      for (let i = 0; i < 4; i++) {
        g.beginPath();
        g.moveTo(18, 34 + i * 5);
        g.lineTo(47, 34 + i * 5);
        g.stroke();
      }
      rr(g, 17, 27, 30, 6, 3, shade('#c9b06a', -0.1));
      // The payload, heaped over the cuff.
      for (let i = 0; i < 12; i++) {
        const px = 21 + ((i * 7) % 22);
        const py = 24 - Math.sin((i / 12) * Math.PI) * 4 + (i % 3);
        dot(g, px, py, 2.6, i % 2 ? MARIGOLD : MARIGOLD_HI);
      }
      // Petals that have already deserted.
      oval(g, 13, 52, 2.2, 1.3, '#c9581f', 0.4);
      oval(g, 50, 50, 2.2, 1.3, MARIGOLD, -0.3);
    });

    // Jicaras mouth-down: tejate tastes better from a gourd, and they know it.
    make('jicaras', 1, (g) => {
      softShadow(g, 32, 52, 16, 5, 0.16);
      // The drying stack, lacquer red and black.
      for (let i = 0; i < 3; i++) {
        const c = i % 2 ? '#8a2a28' : '#3a2a26';
        oval(g, 26, 48 - i * 5, 11 - i * 1.4, 4.6, c);
        oval(g, 26, 46.5 - i * 5, 9.5 - i * 1.4, 3.4, shade(c, 0.12));
      }
      // One upright, showing off its painted flowers.
      oval(g, 46, 46, 8, 6.5, '#a02335');
      oval(g, 46, 44.5, 6.6, 4.6, '#701a26');
      for (let i = 0; i < 3; i++) {
        dot(g, 41 + i * 5, 48.5, 1.4, i % 2 ? MARIGOLD_HI : '#5fb0a5');
        dot(g, 43.5 + i * 5, 50.5, 0.9, '#e8dcc4');
      }
    });

    // Cazuelas by size: the big one at the bottom is mole-only, and everyone knows.
    make('cazuelas', 1, (g) => {
      softShadow(g, 32, 54, 17, 5, 0.18);
      const clay = '#b06a3c';
      for (let i = 0; i < 3; i++) {
        const w = 16 - i * 4;
        const y = 48 - i * 8;
        // The bowl: glazed clay body with a bright wide rim.
        oval(g, 32, y, w, w * 0.55, shade(clay, -0.06 + i * 0.03));
        oval(g, 32, y - w * 0.28, w, w * 0.3, shade(clay, 0.16));
        oval(g, 32, y - w * 0.26, w - 2.4, w * 0.22, '#5c3424');
        // The glaze catching the one window's light.
        oval(g, 32 - w * 0.5, y - 1, 2.6, w * 0.3, 'rgba(255,235,205,0.38)', 0.3);
        // Each chipped in a different honest place.
        dot(g, 32 + (i % 2 ? w - 1.4 : 1.4 - w), y - w * 0.24, 1.1, '#e6d3ae');
      }
      // Little handles on the mole pot, for the two-person carry.
      oval(g, 15, 47, 2.2, 1.6, shade(clay, 0.1));
      oval(g, 49, 47, 2.2, 1.6, shade(clay, 0.1));
      // A wooden spoon standing in the top one, on principle.
      g.strokeStyle = '#a2764a';
      g.lineWidth = 2.4;
      g.beginPath();
      g.moveTo(34, 30);
      g.lineTo(40, 16);
      g.stroke();
      oval(g, 40.8, 14.5, 2.4, 3.2, '#b58755', 0.4);
    });

    // The tuba on its own chair outside rehearsal. The chair was brought out.
    make('tuba', 1, (g) => {
      softShadow(g, 32, 90, 20, 5, 0.2);
      // A woven-seat chair, the kind lent to instruments and grandmothers.
      g.strokeStyle = '#8a6238';
      g.lineWidth = 3.4;
      g.lineCap = 'round';
      for (const [x1, y1, x2, y2] of [
        [20, 88, 20, 62],
        [44, 88, 44, 62],
        [20, 62, 20, 34],
        [44, 62, 44, 34],
      ] as const) {
        g.beginPath();
        g.moveTo(x1, y1);
        g.lineTo(x2, y2);
        g.stroke();
      }
      rr(g, 18, 58, 28, 7, 2, '#a2764a');
      rect(g, 20, 59.5, 24, 1.6, 'rgba(240,220,180,0.35)');
      rr(g, 18, 34, 28, 5, 2, '#8a6238');
      // The tuba itself: one big ring of tubing, bell wide open to the sky.
      const brass = '#c9a35f';
      g.strokeStyle = shade(brass, -0.22);
      g.lineWidth = 7.5;
      g.beginPath();
      g.arc(30, 52, 11.5, 0, Math.PI * 2);
      g.stroke();
      g.strokeStyle = brass;
      g.lineWidth = 4.4;
      g.beginPath();
      g.arc(30, 52, 11.5, 0, Math.PI * 2);
      g.stroke();
      g.strokeStyle = 'rgba(255,240,205,0.55)';
      g.lineWidth = 1.6;
      g.beginPath();
      g.arc(30, 52, 13, Math.PI * 1.15, Math.PI * 1.55);
      g.stroke();
      // The neck climbing out of the ring toward the bell.
      g.strokeStyle = shade(brass, -0.08);
      g.lineWidth = 4;
      g.beginPath();
      g.moveTo(36, 42);
      g.quadraticCurveTo(42, 36, 40, 30);
      g.stroke();
      // The bell: a wide brass trumpet mouth, nothing like a face.
      g.fillStyle = shade(brass, 0.04);
      g.beginPath();
      g.moveTo(32, 30);
      g.quadraticCurveTo(30, 18, 26, 13);
      g.quadraticCurveTo(40, 8, 52, 14);
      g.quadraticCurveTo(46, 21, 46, 30);
      g.quadraticCurveTo(39, 34, 32, 30);
      g.closePath();
      g.fill();
      oval(g, 39, 14.5, 12, 4.6, shade(brass, -0.32), -0.08);
      oval(g, 39, 14.2, 10, 3.4, '#6e522a', -0.08);
      g.strokeStyle = '#fff0cf';
      g.lineWidth = 1.4;
      g.beginPath();
      g.arc(39, 16, 11.4, Math.PI * 1.05, Math.PI * 1.45);
      g.stroke();
      // Valve caps riding the near side of the ring.
      for (let i = 0; i < 3; i++) dot(g, 22 + i * 4.4, 60 - i * 3.6, 1.7, shade(brass, 0.18));
    }, 64, 96);

    // The rotulista's sign, half finished: lunch outranked the last letters.
    make('rotulo', 1, (g) => {
      softShadow(g, 32, 90, 20, 5, 0.2);
      // Board leaning against the wall, one shoulder higher.
      g.save();
      g.translate(32, 55);
      g.rotate(-0.06);
      rr(g, -24, -26, 48, 58, 3, '#f0e8d4');
      g.strokeStyle = '#7a5636';
      g.lineWidth = 3;
      g.strokeRect(-24, -26, 48, 58);
      // Finished letters: fat, shadowed, joyful. Abstract at this size.
      const done = ['#a02335', '#1c5c8a', '#a02335'];
      for (let i = 0; i < 3; i++) {
        const c = done[i] ?? '#a02335';
        rr(g, -18 + i * 13, -20, 9, 14, 2, c);
        rr(g, -16.5 + i * 13, -18.5, 9, 14, 2, 'rgba(0,0,0,0.18)');
        rr(g, -18 + i * 13, -20, 9, 14, 2, c);
        dot(g, -14 + i * 13, -16, 2, 'rgba(255,240,210,0.5)');
      }
      // The pencil ghosts of the letters still waiting.
      g.strokeStyle = 'rgba(90,80,70,0.4)';
      g.lineWidth = 1.2;
      for (let i = 0; i < 4; i++) {
        g.strokeRect(-18 + i * 10, 2, 7, 12);
      }
      // A flourish underline, finished first because it was the fun part.
      g.strokeStyle = '#c98a2e';
      g.lineWidth = 2.4;
      g.beginPath();
      g.moveTo(-19, 22);
      g.quadraticCurveTo(0, 27, 19, 21);
      g.stroke();
      g.restore();
      // Paint cans and the brush, holding the painter's place.
      oval(g, 12, 88, 5, 3, '#6b7278');
      rr(g, 7, 78, 10, 10, 2, '#8a9299');
      oval(g, 12, 78, 5, 1.8, '#a02335');
      g.strokeStyle = '#8a6238';
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(50, 88);
      g.lineTo(56, 76);
      g.stroke();
      dot(g, 56.5, 74.5, 2, '#a02335');
    }, 64, 96);

    // Market crates: tomatillos in their paper lanterns, chiles ranked by menace.
    make('mercadocrates', 1, (g, r) => {
      softShadow(g, 32, 90, 22, 5, 0.2);
      const slat = (x: number, y: number, w: number, h: number, c: string) => {
        rr(g, x, y, w, h, 2, c);
        g.strokeStyle = shade(c, -0.22);
        g.lineWidth = 1.2;
        for (let i = 1; i < 3; i++) {
          g.beginPath();
          g.moveTo(x + 2, y + (h / 3) * i);
          g.lineTo(x + w - 2, y + (h / 3) * i);
          g.stroke();
        }
      };
      // Bottom: dried pasilla, almost black, sweet like raisins.
      slat(10, 66, 44, 22, '#9b7a50');
      for (let i = 0; i < 7; i++) {
        oval(g, 15 + i * 5.6, 66 + r.int(4), 2.2, 5, '#3a2430', 0.2 + r.next() * 0.3);
      }
      // Middle, offset: red chiles with intentions.
      slat(14, 46, 40, 20, '#a2764a');
      for (let i = 0; i < 8; i++) {
        oval(g, 18 + i * 4.6, 46 + r.int(4), 2, 4.4, r.chance(0.7) ? '#b52a28' : '#c1512f', r.next() * 0.6 - 0.3);
      }
      // Top: tomatillos, husks half open like paper lanterns.
      slat(12, 26, 38, 20, '#8a6238');
      for (let i = 0; i < 6; i++) {
        const tx = 17 + i * 5.6;
        const ty = 26 + (i % 2) * 3;
        dot(g, tx, ty, 3.2, '#9bc25c');
        dot(g, tx - 1, ty - 1, 1.2, '#c9e28f');
        g.strokeStyle = '#c9b06a';
        g.lineWidth = 1;
        g.beginPath();
        g.moveTo(tx - 3, ty - 2);
        g.lineTo(tx - 4.4, ty - 5);
        g.moveTo(tx + 3, ty - 2);
        g.lineTo(tx + 4.4, ty - 5);
        g.stroke();
      }
    }, 64, 96);

    // Pan de muerto cooling by the door: forty caritas, all pointed at the street.
    make('pantray', 1, (g, r) => {
      softShadow(g, 32, 90, 22, 5, 0.2);
      // The rack: two shelves on sawhorse legs, a cloth for the top batch.
      g.strokeStyle = '#7a5636';
      g.lineWidth = 3;
      for (const [x1, x2] of [
        [14, 10],
        [50, 54],
      ] as const) {
        g.beginPath();
        g.moveTo(x1, 58);
        g.lineTo(x2, 90);
        g.stroke();
      }
      for (const y of [58, 36] as const) {
        rr(g, 8, y, 48, 6, 2, '#9b7a50');
        vgrad(g, 8, y, 48, 3, 'rgba(255,240,210,0.25)', 'rgba(0,0,0,0)');
      }
      // Loaves: round, bone strips crossed, sugar catching the light.
      for (const [row, count] of [
        [52, 4],
        [30, 4],
      ] as const) {
        for (let i = 0; i < count; i++) {
          const bx = 14 + i * 12;
          dot(g, bx, row, 5.4, '#c98a2e');
          dot(g, bx - 1, row - 1.4, 4, shade('#c98a2e', 0.14));
          g.strokeStyle = shade('#c98a2e', 0.32);
          g.lineWidth = 1.4;
          g.beginPath();
          g.moveTo(bx - 4, row - 3);
          g.lineTo(bx + 4, row + 3);
          g.moveTo(bx + 4, row - 3);
          g.lineTo(bx - 4, row + 3);
          g.stroke();
          if (r.chance(0.65)) {
            dot(g, bx, row - 1.6, 1.8, '#f0e0c0');
            dot(g, bx - 0.7, row - 2, 0.45, '#7a4a20');
            dot(g, bx + 0.7, row - 2, 0.45, '#7a4a20');
          }
        }
      }
      // The cloth, thrown back: this batch is cool enough to meet people.
      g.fillStyle = '#e8dcc4';
      g.beginPath();
      g.moveTo(50, 34);
      g.quadraticCurveTo(60, 40, 57, 52);
      g.lineTo(52, 52);
      g.quadraticCurveTo(54, 42, 48, 38);
      g.closePath();
      g.fill();
    }, 64, 96);

    // Bougainvillea over the wall: magenta by the armload, rent paid in color.
    make('bugambilia', 2, (g, r) => {
      softShadow(g, 32, 90, 18, 5, 0.16);
      // The woody idea of a trunk, mostly hidden by its own enthusiasm.
      g.strokeStyle = '#6e4a30';
      g.lineWidth = 4;
      g.beginPath();
      g.moveTo(30, 88);
      g.quadraticCurveTo(24, 60, 30, 34);
      g.stroke();
      g.lineWidth = 2.4;
      g.beginPath();
      g.moveTo(30, 56);
      g.quadraticCurveTo(42, 46, 50, 30);
      g.stroke();
      // The cascade: green underneath, magenta absolutely everywhere else.
      for (let i = 0; i < 30; i++) {
        const t = i / 30;
        const bx = 14 + r.int(38);
        const by = 8 + t * 52 + r.int(10);
        dot(g, bx, by, 3 + r.next() * 2.4, r.chance(0.3) ? '#4d7440' : shade('#c9356b', (r.next() - 0.5) * 0.14));
      }
      for (let i = 0; i < 8; i++) {
        dot(g, 16 + r.int(34), 10 + r.int(48), 1.2, '#e88ab0');
      }
      // The tiny true flowers, cream, hiding inside the colored bracts.
      for (let i = 0; i < 6; i++) dot(g, 18 + r.int(30), 14 + r.int(40), 0.9, '#f2e6d0');
      // Fallen bracts: the wall keeps sweeping, the vine keeps paying.
      for (let i = 0; i < 5; i++) {
        oval(g, 14 + r.int(36), 84 + r.int(8), 2, 1.2, '#b05080', r.next() * 3);
      }
    }, 64, 96);

    // A corner nicho: a thumb-sized saint, fresh marigolds, one steady flame.
    make('nicho', 1, (g) => {
      softShadow(g, 32, 90, 16, 5, 0.2);
      // The masonry post, whitewashed, sky-blue inside the arch.
      rr(g, 20, 34, 24, 54, 3, '#e6ded0');
      vgrad(g, 20, 34, 24, 10, 'rgba(255,255,245,0.5)', 'rgba(0,0,0,0)');
      rr(g, 24, 40, 16, 22, 7, '#54708a');
      rr(g, 25.5, 41.5, 13, 19, 6, '#3c5a78');
      // The saint: small, white-robed, infinitely patient.
      oval(g, 32, 54, 4, 6, '#e8dcc4');
      dot(g, 32, 46.5, 2.6, '#d9a97c');
      dot(g, 32, 44, 3.4, 'rgba(255,230,160,0.55)');
      // The veladora at the ledge, and the marigolds changed this morning.
      glowSpot(g, 27, 60, 8, '#ffd28a', 0.5);
      rr(g, 25, 58, 4.4, 6, 1.6, 'rgba(200,225,225,0.6)');
      oval(g, 27.2, 57.5, 1.2, 2, '#ffe9ad');
      for (let i = 0; i < 3; i++) dot(g, 34 + i * 3, 62.5, 2, i % 2 ? MARIGOLD : MARIGOLD_HI);
      // A small cross on top, and the ledge's permanent wax history.
      g.strokeStyle = '#8c8479';
      g.lineWidth = 2.4;
      g.beginPath();
      g.moveTo(32, 26);
      g.lineTo(32, 36);
      g.moveTo(28, 29.5);
      g.lineTo(36, 29.5);
      g.stroke();
      dot(g, 26, 65, 1, 'rgba(255,240,210,0.6)');
    }, 64, 96);

    // The paletero's bicycle cart, bell included. Every child can hear it.
    make('paletas', 1, (g) => {
      softShadow(g, 32, 90, 22, 5, 0.2);
      // Wheels first: the cart is a bicycle that grew up.
      for (const wx of [17, 47] as const) {
        dot(g, wx, 80, 9, '#3d3630');
        dot(g, wx, 80, 6.5, '#6b655c');
        dot(g, wx, 80, 2, '#c9c2b4');
        g.strokeStyle = '#c9c2b4';
        g.lineWidth = 1;
        for (let s = 0; s < 4; s++) {
          const a = (s / 4) * Math.PI;
          g.beginPath();
          g.moveTo(wx - Math.cos(a) * 6, 80 - Math.sin(a) * 6);
          g.lineTo(wx + Math.cos(a) * 6, 80 + Math.sin(a) * 6);
          g.stroke();
        }
      }
      // The insulated box, white as a promise of ice.
      rr(g, 10, 44, 44, 32, 4, '#f0ece2');
      vgrad(g, 10, 44, 44, 8, 'rgba(255,255,250,0.6)', 'rgba(0,0,0,0)');
      rr(g, 10, 44, 44, 7, 3, '#4a7ab5');
      // PALETAS, painted as joyful color-blocks at this scale.
      for (let i = 0; i < 6; i++) {
        rr(g, 14 + i * 6.4, 58, 4.4, 8, 1, i % 2 ? '#c94f7c' : '#4a7ab5');
      }
      // A painted paleta on the side, mid-melt, aspirational.
      rr(g, 44, 56, 6, 11, 3, '#5fb0a5');
      rect(g, 46.4, 67, 1.4, 5, '#8a6238');
      // Handlebar and THE BELL, silver, understated, world-famous.
      g.strokeStyle = '#6b655c';
      g.lineWidth = 2.6;
      g.beginPath();
      g.moveTo(54, 48);
      g.quadraticCurveTo(60, 44, 59, 38);
      g.stroke();
      dot(g, 59, 36, 2.6, '#c9c2b4');
      dot(g, 58.2, 35.2, 1, '#fff6e0');
      // The lid handle, worn to shine by one thumb.
      rr(g, 26, 41, 12, 3.4, 1.6, '#c9a35f');
    }, 64, 96);

    // A ristra and its garlic neighbor, hung from the kitchen beam.
    make('ristra', 1, (g, r) => {
      // The peg and the twine loop: infrastructure of a serious kitchen.
      rr(g, 26, 8, 12, 5, 2, '#7a5636');
      g.strokeStyle = '#c9b06a';
      g.lineWidth = 1.4;
      g.beginPath();
      g.moveTo(30, 13);
      g.lineTo(28, 20);
      g.moveTo(34, 13);
      g.lineTo(38, 20);
      g.stroke();
      // The ristra: chiles shingled tight, tapering, darkening as they dry.
      for (let i = 0; i < 9; i++) {
        const t = i / 9;
        const rx = 28 + Math.sin(i * 1.7) * 3;
        const ry = 22 + t * 44;
        const w = 4.6 - t * 1.6;
        oval(g, rx, ry, w, w * 1.9, shade('#b52a28', -t * 0.18 + (r.next() - 0.5) * 0.06), Math.sin(i) * 0.3);
        oval(g, rx - 1, ry - w, 1.2, 1.8, '#4d7440');
      }
      oval(g, 28, 70, 2.4, 4, '#701a26', 0.2);
      // The garlic braid: quieter, but it holds the whole cuisine together.
      for (let i = 0; i < 4; i++) {
        dot(g, 42, 24 + i * 8, 3.6 - i * 0.3, '#e8e0cc');
        dot(g, 41, 23 + i * 8, 1.4, '#f6f0e0');
      }
      g.strokeStyle = '#c9b06a';
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(42, 20);
      g.lineTo(42, 56);
      g.stroke();
    }, 64, 96);

    // ------------------------------------------------------------ casona

    make('casona', 4, (g, r) => {
      // 352x256: adobe under lime paint, green cantera around the openings,
      // a flat roof that has heard forty years of cohetes. Casa geometry.
      const W = 352;
      const coats = ['#c9903f', '#b5573a', '#c9766a', '#8a91b0'];
      const paintC = shade(coats[r.int(4)] ?? '#c9903f', (r.next() - 0.5) * 0.05);
      const wallTop = 96;
      const wallBot = 252;

      vgrad(g, 16, wallTop, W - 32, wallBot - wallTop, shade(paintC, 0.08), shade(paintC, -0.08));
      // Sun-fade streaks and a rain stain under the canal spout.
      for (let i = 0; i < 6; i++) {
        const fx = 24 + r.int(W - 60);
        vgrad(g, fx, wallTop, 10 + r.int(18), 50 + r.int(60), 'rgba(255,244,220,0.14)', 'rgba(0,0,0,0)');
      }
      // A patch where the lime gave up and the adobe shows.
      if (r.chance(0.75)) {
        const px2 = r.chance(0.5) ? 30 : W - 104;
        const py2 = wallBot - 55 - r.int(50);
        rr(g, px2, py2, 62, 38, 9, shade(PAL.adobe, -0.04));
        g.strokeStyle = 'rgba(105,70,42,0.4)';
        g.lineWidth = 2;
        for (let k = 1; k < 3; k++) {
          g.beginPath();
          g.moveTo(px2 + 4, py2 + k * 12);
          g.lineTo(px2 + 58, py2 + k * 12);
          g.stroke();
        }
      }
      vgrad(g, 16, wallBot - 16, W - 32, 16, 'rgba(0,0,0,0)', 'rgba(50,44,34,0.3)');
      g.save();
      g.globalAlpha = 0.16;
      g.fillStyle = '#1c1712';
      g.fillRect(W - 26, wallTop, 10, wallBot - wallTop);
      g.restore();

      // Door: casa footprint, framed in carved green cantera.
      rr(g, 146, wallBot - 100, 74, 100, 6, shade(CANTERA, (r.next() - 0.5) * 0.06));
      rr(g, 150, wallBot - 96, 66, 96, 6, shade(CANTERA, -0.18));
      rr(g, 156, wallBot - 88, 54, 88, 5, '#5c4630');
      vgrad(g, 156, wallBot - 88, 54, 20, 'rgba(255,240,210,0.14)', 'rgba(0,0,0,0)');
      g.strokeStyle = 'rgba(30,22,14,0.5)';
      g.lineWidth = 2.4;
      g.beginPath();
      g.moveTo(183, wallBot - 84);
      g.lineTo(183, wallBot - 6);
      g.stroke();
      for (const lx of [168, 198]) {
        g.beginPath();
        g.moveTo(lx, wallBot - 84);
        g.lineTo(lx, wallBot - 6);
        g.stroke();
      }
      dot(g, 176, wallBot - 46, 3, '#c9a35f');
      dot(g, 190, wallBot - 46, 3, '#c9a35f');

      // Windows with rejas: iron bars, cantera sills, shutters inside.
      for (const wx of [52, 252]) {
        rr(g, wx - 4, wallTop + 30, 56, 52, 4, shade(CANTERA, (r.next() - 0.5) * 0.06));
        rr(g, wx, wallTop + 34, 48, 44, 4, shade(paintC, -0.35));
        rr(g, wx + 4, wallTop + 38, 40, 36, 3, '#33415c');
        vgrad(g, wx + 4, wallTop + 38, 40, 13, 'rgba(210,230,245,0.35)', 'rgba(0,0,0,0)');
        g.strokeStyle = '#3d3630';
        g.lineWidth = 2.4;
        for (let k = 0; k < 4; k++) {
          g.beginPath();
          g.moveTo(wx + 8 + k * 11, wallTop + 36);
          g.lineTo(wx + 8 + k * 11, wallTop + 76);
          g.stroke();
        }
        rr(g, wx - 6, wallTop + 78, 60, 8, 4, shade(CANTERA, 0.1));
      }

      // Parapet with terracotta coping tiles and a canal spout.
      rr(g, 10, wallTop - 18, W - 20, 26, 6, shade(paintC, -0.13));
      for (let x = 14; x < W - 20; x += 24) {
        rr(g, x, wallTop - 20, 20, 8, 3, shade('#b5573a', (r.next() - 0.5) * 0.1));
      }
      vgrad(g, 16, wallTop + 8, W - 32, 14, 'rgba(25,20,14,0.35)', 'rgba(0,0,0,0)');
      rr(g, 60 + r.int(200), wallTop - 4, 14, 10, 2, shade(PAL.terracotta, -0.1));

      // Bougainvillea over one shoulder of the house, most years.
      if (r.chance(0.7)) {
        const bx = r.chance(0.5) ? 30 : W - 90;
        for (let i = 0; i < 26; i++) {
          const px3 = bx + r.int(70);
          const py3 = wallTop - 26 + r.int(70);
          dot(g, px3, py3, 2.6 + r.next() * 2, r.chance(0.75) ? '#c9356b' : '#4d7440');
        }
        for (let i = 0; i < 5; i++) dot(g, bx + r.int(70), wallTop - 24 + r.int(66), 1.2, '#e8dcc4');
      }
      // Papel picado pinned from parapet to parapet on fiesta blocks.
      if (r.chance(0.5)) {
        g.strokeStyle = 'rgba(60,50,40,0.5)';
        g.lineWidth = 1.4;
        g.beginPath();
        g.moveTo(40, wallTop - 26);
        g.quadraticCurveTo(W / 2, wallTop - 12, W - 40, wallTop - 26);
        g.stroke();
        const cols = ['#c94f7c', MARIGOLD_HI, '#5fb0a5', '#8a5fb0'];
        for (let i = 0; i < 7; i++) {
          const t = (i + 0.5) / 7;
          const x = 40 + (W - 80) * t;
          const y = wallTop - 26 + Math.sin(t * Math.PI) * 13;
          rr(g, x - 5, y, 10, 12, 1, cols[i % 4] ?? MARIGOLD_HI);
        }
      }
    }, 352, 256);

    // ------------------------------------------------ la cocina de Refugio

    /**
     * Painted plaster, the Valles Centrales way: a strong colour laid on to
     * about shoulder height and cal above it, so a kitchen is two colours and
     * the join is a hand's width of somebody's decision. The greens are the
     * chapter's cantera (`#87a08a`), the reds its grana (`#a02335`), and the
     * smoke above the comal is why the top of the wall is not white any more.
     */
    make('wallCal', 10, (g, r, i) => {
      const cal = '#efe5cf';
      // One colour for the whole room. Picking per tile made the kitchen a
      // patchwork quilt: nobody paints a wall four colours by the metre.
      const skirt = shade(CANTERA, (r.next() - 0.5) * 0.05);
      vgrad(g, 0, 0, S, S, shade(cal, 0.03), shade(cal, -0.05));
      // The colour, and the wobble in the line where the brush ran out.
      rect(g, 0, 30, S, 34, skirt);
      vgrad(g, 0, 30, S, 7, 'rgba(255,255,255,0.14)', 'rgba(0,0,0,0)');
      g.fillStyle = shade(skirt, -0.12);
      g.beginPath();
      g.moveTo(0, 30);
      g.quadraticCurveTo(32, 30 + (r.next() - 0.5) * 4, S, 30);
      g.lineTo(S, 32.5);
      g.quadraticCurveTo(32, 32.5 + (r.next() - 0.5) * 4, 0, 32.5);
      g.closePath();
      g.fill();
      // Comal smoke on the cal above it.
      vgrad(g, 0, 0, S, 18, 'rgba(70,54,38,0.22)', 'rgba(0,0,0,0)');
      // Four in ten.
      const deco = i < 4 ? i : -1;
      if (deco === 0) {
        // A talavera splashback: four tiles, blue on white, one cracked.
        for (let k = 0; k < 4; k++) {
          const tx = 16 + (k % 2) * 16;
          const ty = 20 + Math.floor(k / 2) * 16;
          rr(g, tx, ty, 15, 15, 1, '#f2ead8');
          dot(g, tx + 7.5, ty + 7.5, 4.4, '#2f5f9d');
          dot(g, tx + 7.5, ty + 7.5, 2, '#f2ead8');
          dot(g, tx + 2.5, ty + 2.5, 1.4, '#d9a52f');
        }
      } else if (deco === 1) {
        // La Guadalupana, and the marigold somebody put under her this week.
        rr(g, 23, 4, 18, 24, 2, '#c9a35f');
        rr(g, 25.5, 6.5, 13, 19, 1.5, '#2f6f8a');
        oval(g, 32, 15, 5, 8, '#e8e0d0');
        dot(g, 32, 11, 3, '#c98a6a');
        for (let k = 0; k < 8; k++) dot(g, 32 + Math.cos(k) * 8.5, 15 + Math.sin(k) * 11, 1, MARIGOLD_HI);
        dot(g, 32, 31, 3.2, MARIGOLD);
      } else if (deco === 2) {
        // A rack of tin milagros: hearts, legs, an eye, one whole cow.
        rr(g, 12, 22, 40, 3, 1.5, '#8a6b46');
        for (let k = 0; k < 5; k++) {
          const mx = 15 + k * 9;
          dot(g, mx, 18 - r.int(4), 2.6, '#c9ced0');
          dot(g, mx, 17, 1.2, '#e8ecee');
        }
      } else if (deco === 3) {
        // Papel picado pinned flat to the wall, left over from last year.
        const cols = [MARIGOLD, '#a02335', '#2f6f8a', '#7a4a8a'];
        for (let k = 0; k < 4; k++) {
          rr(g, 6 + k * 14, 8 + (k % 2) * 3, 12, 14, 1, cols[k] ?? MARIGOLD);
          dot(g, 12 + k * 14, 15 + (k % 2) * 3, 2.4, cal);
        }
      } else if (deco === 4) {
        // A hook, a jícara, and the string of garlic beside it.
        g.strokeStyle = '#8a8378';
        g.lineWidth = 2.4;
        g.beginPath(); g.moveTo(20, 6); g.lineTo(20, 14); g.stroke();
        oval(g, 20, 18, 6, 5, '#8a6238');
        oval(g, 20, 17, 4.4, 3.4, '#5c4030');
        g.strokeStyle = '#b5a882';
        g.lineWidth = 1.6;
        g.beginPath(); g.moveTo(44, 6); g.lineTo(44, 12); g.stroke();
        for (let k = 0; k < 4; k++) dot(g, 44 + (k % 2 ? 3 : -3), 15 + k * 4.4, 3, k % 2 ? '#efe6d2' : '#e0d6bc');
      }
    });

    /** Saltillo: fired clay tiles, laid by hand, no two the same colour, and
     * every one of them warm to walk on by ten in the morning. */
    make('floorSaltillo', 5, (g, r) => {
      const base = '#cc8a58';
      rect(g, 0, 0, S, S, base);
      // Four tiles to a cell, each its own firing.
      for (let k = 0; k < 4; k++) {
        const tx = (k % 2) * 32;
        const ty = Math.floor(k / 2) * 32;
        rect(g, tx, ty, 32, 32, shade(base, (r.next() - 0.5) * 0.07));
        vgrad(g, tx, ty, 32, 9, 'rgba(255,226,186,0.1)', 'rgba(0,0,0,0)');
      }
      // The grout, sanded and pale.
      g.strokeStyle = 'rgba(214,196,164,0.42)';
      g.lineWidth = 2.4;
      g.beginPath(); g.moveTo(0, 32); g.lineTo(S, 32); g.moveTo(32, 0); g.lineTo(32, S); g.stroke();
      if (r.chance(0.5)) oval(g, r.int(S), r.int(S), 6, 3, 'rgba(90,52,32,0.12)');
      if (r.chance(0.35)) dot(g, r.int(S), r.int(S), 1.6, MARIGOLD_HI); // a petal got in
    });

    /** A petate: woven palm, the mat everything in this village is done on. */
    make('rugPetate', 2, (g, r) => {
      const palm = '#cdb47e';
      rect(g, 0, 0, S, S, palm);
      for (let y = 0; y < S; y += 8) {
        for (let x = 0; x < S; x += 8) {
          const on = ((x / 8) + (y / 8)) % 2 === 0;
          rect(g, x, y, 8, 8, shade(palm, on ? 0.07 : -0.08));
        }
      }
      g.strokeStyle = 'rgba(120,92,54,0.16)';
      g.lineWidth = 1;
      for (let x = 4; x < S; x += 8) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, S); g.stroke(); }
      // Two dyed strips, grana and marigold, running its length.
      rect(g, 0, 18, S, 4, 'rgba(160,35,53,0.55)');
      rect(g, 0, 42, S, 4, 'rgba(232,134,47,0.5)');
      if (r.chance(0.5)) oval(g, r.int(S), r.int(S), 10, 4, 'rgba(255,240,205,0.1)');
    });
  },
};
