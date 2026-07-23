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
  grounded: ['portales', 'panstall', 'barrostall', 'telar', 'ofrenda', 'correo', 'colectivo'],
  buildings: ['casona'],
  windows: {
    casona: [
      [15, -10],
      [67, -10],
    ],
  },
  glows: ['comal', 'veladora'],
  pathy: ['petalpath'],

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
    make('tumba', 3, (g, r) => {
      softShadow(g, 32, 52, 22, 6, 0.16);
      const wash = r.chance(0.6) ? '#e6ded0' : '#cfd8e0';
      rr(g, 14, 34, 36, 18, 3, wash);
      vgrad(g, 14, 34, 36, 5, 'rgba(255,255,245,0.5)', 'rgba(0,0,0,0)');
      // Headstone with a soft cross.
      rr(g, 24, 16, 16, 20, 3, shade(wash, -0.06));
      g.strokeStyle = shade(wash, -0.35);
      g.lineWidth = 2.2;
      g.beginPath();
      g.moveTo(32, 20);
      g.lineTo(32, 30);
      g.moveTo(28, 23.5);
      g.lineTo(36, 23.5);
      g.stroke();
      // Marigolds heaped at the foot; a candle keeping its corner.
      for (let i = 0; i < 6; i++) {
        dot(g, 18 + r.int(28), 50 + r.int(4), 2.4 + r.next(), r.chance(0.6) ? MARIGOLD : MARIGOLD_HI);
      }
      rr(g, 44, 40, 5, 8, 2, 'rgba(200,225,225,0.55)');
      dot(g, 46.5, 39.5, 1.2, '#ffe9ad');
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
  },
};
