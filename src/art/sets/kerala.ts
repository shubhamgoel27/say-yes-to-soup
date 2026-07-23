import type { ChapterArt } from './index';
import { dot, oval, rr, rect, vgrad, glowSpot, softShadow, shade, blob } from '../pix';
import { PAL } from '../../engine/config';

/**
 * Kerala backwater art: coconut green over laterite red, water everywhere,
 * everything either freshly washed or about to be. Painted in the smooth
 * idiom: flat seamless grounds, soft gradients, no outlines.
 */

const S = 64;

export const ART: ChapterArt = {
  aliases: {
    postsign: 'signpost', // the jetty office counter
    shaapsign: 'signpost', // the toddy shed's modest advertisement
    aduppu: 'qoncha', // the wood-fired hearth; clay is clay at any latitude
  },
  grounded: [
    'palm', 'banana', 'vallam', 'kettuvallam', 'coirrack', 'thattukada', 'muralwall',
    'postsign', 'shaapsign', // aliased signpost art keeps its baked shadow
  ],
  buildings: ['veedu'],
  windows: {
    veedu: [
      [15, -10],
      [67, -10],
    ],
  },
  glows: ['thattukada', 'aduppu'],

  paint(make) {
    // ---------------------------------------------------------- grounds

    // Pokkali paddy: salt-tolerant rice standing in monsoon water. One field,
    // two harvests; rice now, prawns when the tide is invited in.
    make('paddy', 4, (g, r) => {
      const base = '#5f7f4a';
      rect(g, 0, 0, S, S, base);
      // Still water glints between the rows.
      for (let i = 0; i < 3; i++) {
        const yy = r.int(S);
        vgrad(g, 0, yy, S, 3, 'rgba(210,230,225,0.16)', 'rgba(0,0,0,0)');
      }
      // Young rice in loose rows.
      for (const row of [12, 34, 54]) {
        for (let x = 6 + r.int(6); x < S; x += 12 + r.int(6)) {
          const lean = (r.next() - 0.5) * 5;
          g.strokeStyle = shade(r.chance(0.5) ? '#7fb35a' : '#8fbf68', (r.next() - 0.5) * 0.08);
          g.lineWidth = 1.8;
          g.lineCap = 'round';
          g.beginPath();
          g.moveTo(x, row);
          g.quadraticCurveTo(x + lean, row - 6, x + lean * 1.6, row - 10 - r.int(4));
          g.stroke();
        }
      }
    });

    // Laterite: the red road of the coast, iron-rich and unembarrassed.
    make('laterite', 5, (g, r) => {
      const base = '#a35a3c';
      rect(g, 0, 0, S, S, shade(base, 0.02));
      for (let i = 0; i < 5; i++) {
        dot(g, r.int(S), r.int(S), 1.6 + r.next() * 1.4, shade(base, r.chance(0.5) ? -0.12 : 0.1));
      }
      for (let i = 0; i < 2; i++) {
        oval(g, r.int(S), r.int(S), 4, 2, shade(base, -0.07));
      }
      if (r.chance(0.3)) dot(g, r.int(S), r.int(S), 2.2, '#c9c4bb'); // a pale pebble
    });

    // ---------------------------------------------------------- talls

    // The coconut palm: taller than the Andean tree ever dreamed, trunk
    // leaning the way sixty years of sea wind suggested.
    make('palm', 3, (g, r) => {
      softShadow(g, 34, 122, 22, 5, 0.22);
      const lean = (r.next() - 0.5) * 14;
      const topX = 34 + lean;
      const topY = 28;
      // Trunk: a long curve, ringed.
      g.strokeStyle = '#8a6a48';
      g.lineWidth = 7;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(32, 122);
      g.quadraticCurveTo(30 - lean * 0.6, 74, topX, topY);
      g.stroke();
      g.strokeStyle = 'rgba(60,42,26,0.35)';
      g.lineWidth = 1.6;
      for (let t = 0.12; t < 0.95; t += 0.09) {
        const ix = 32 + (topX - 32) * t + (30 - lean * 0.6 - 32) * 2 * t * (1 - t);
        const iy = 122 + (topY - 122) * t + (74 - 122 - (topY - 122) * 0.5) * 2 * t * (1 - t) * 0.4;
        g.beginPath();
        g.moveTo(ix - 4, iy);
        g.lineTo(ix + 4, iy - 1.5);
        g.stroke();
      }
      // Crown: fronds flung out and drooping.
      for (let i = 0; i < 9; i++) {
        const a = -Math.PI * 0.95 + (i / 8) * Math.PI * 0.95;
        const fx = topX + Math.cos(a) * 26;
        const fy = topY + Math.sin(a) * 13 + 10;
        g.strokeStyle = shade(i % 2 ? '#4d7440' : '#5f8a4a', (r.next() - 0.5) * 0.1);
        g.lineWidth = 3.4;
        g.beginPath();
        g.moveTo(topX, topY);
        g.quadraticCurveTo((topX + fx) / 2, topY - 12, fx, fy + 8);
        g.stroke();
      }
      // Coconuts, in committee.
      for (let i = 0; i < 3; i++) {
        dot(g, topX - 4 + i * 4.5, topY + 6 + (i % 2) * 3, 3.4, shade('#7a5a2e', (r.next() - 0.5) * 0.1));
      }
    }, 64, 128);

    // Banana plant: leaves like green sails, one always torn by yesterday.
    make('banana', 3, (g, r) => {
      softShadow(g, 32, 90, 20, 5, 0.2);
      g.strokeStyle = '#6f9b52';
      g.lineWidth = 5;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(32, 90);
      g.lineTo(32, 48);
      g.stroke();
      const leaf = (a: number, len: number, c: string, torn: boolean) => {
        const tipX = 32 + Math.cos(a) * len;
        const tipY = 46 + Math.sin(a) * len * 0.6;
        g.fillStyle = c;
        g.beginPath();
        g.moveTo(32, 48);
        g.quadraticCurveTo(32 + Math.cos(a - 0.5) * len * 0.7, 40 + Math.sin(a) * len * 0.3, tipX, tipY);
        g.quadraticCurveTo(32 + Math.cos(a + 0.5) * len * 0.7, 52 + Math.sin(a) * len * 0.4, 32, 50);
        g.closePath();
        g.fill();
        if (torn) {
          g.strokeStyle = 'rgba(30,45,25,0.5)';
          g.lineWidth = 1.6;
          g.beginPath();
          g.moveTo((32 + tipX) / 2, (48 + tipY) / 2 - 3);
          g.lineTo((32 + tipX) / 2 + 2, (48 + tipY) / 2 + 4);
          g.stroke();
        }
      };
      leaf(-2.6, 26, shade('#5f8a4a', (r.next() - 0.5) * 0.08), false);
      leaf(-0.5, 27, shade('#6f9b52', (r.next() - 0.5) * 0.08), r.chance(0.8));
      leaf(-1.9, 30, shade('#4d7440', (r.next() - 0.5) * 0.08), false);
      leaf(-1.2, 31, shade('#5f8a4a', (r.next() - 0.5) * 0.08), r.chance(0.4));
      // A young hand of bananas.
      if (r.chance(0.6)) {
        for (let i = 0; i < 4; i++) oval(g, 28 + i * 2.6, 58 + (i % 2), 2.2, 4, '#8fae4f');
      }
    }, 64, 96);

    // The vallam: the backwater bicycle, hauled out and resting on its side.
    make('vallam', 2, (g, r) => {
      softShadow(g, 64, 80, 42, 8, 0.22);
      const hull = shade('#4a3524', (r.next() - 0.5) * 0.08);
      g.beginPath();
      g.moveTo(8, 66);
      g.quadraticCurveTo(24, 56, 64, 55);
      g.quadraticCurveTo(104, 56, 120, 66);
      g.quadraticCurveTo(100, 80, 64, 82);
      g.quadraticCurveTo(28, 80, 8, 66);
      g.closePath();
      const grad = g.createLinearGradient(0, 54, 0, 82);
      grad.addColorStop(0, shade(hull, 0.16));
      grad.addColorStop(1, shade(hull, -0.14));
      g.fillStyle = grad;
      g.fill();
      // Gunwale line, oiled and dark.
      g.strokeStyle = shade(hull, -0.3);
      g.lineWidth = 2.6;
      g.beginPath();
      g.moveTo(8, 66);
      g.quadraticCurveTo(64, 52, 120, 66);
      g.stroke();
      // Coir stitching along the strake: rope, not nails.
      g.strokeStyle = 'rgba(200,165,91,0.55)';
      g.lineWidth = 1.4;
      for (let x = 20; x <= 108; x += 8) {
        g.beginPath();
        g.moveTo(x, 70);
        g.lineTo(x + 3, 74);
        g.stroke();
      }
      // A paddle left aboard, sure of tomorrow.
      g.strokeStyle = '#8a6a44';
      g.lineWidth = 3;
      g.beginPath();
      g.moveTo(52, 60);
      g.lineTo(86, 52);
      g.stroke();
      oval(g, 90, 51, 7, 3.4, '#8a6a44', -0.2);
    }, 128, 96);

    // The kettuvallam: the lorry of the old economy, moored and enormous.
    // Anjili planks stitched with coconut rope, famously no nails.
    make('kettuvallam', 1, (g) => {
      // Hull low in the water; no cast shadow, the water holds it.
      const hull = '#3e2f22';
      g.beginPath();
      g.moveTo(6, 96);
      g.quadraticCurveTo(30, 84, 96, 82);
      g.quadraticCurveTo(162, 84, 186, 96);
      g.quadraticCurveTo(160, 112, 96, 114);
      g.quadraticCurveTo(32, 112, 6, 96);
      g.closePath();
      const grad = g.createLinearGradient(0, 82, 0, 114);
      grad.addColorStop(0, shade(hull, 0.14));
      grad.addColorStop(1, shade(hull, -0.18));
      g.fillStyle = grad;
      g.fill();
      // The arched canopy of woven bamboo and palm.
      g.beginPath();
      g.moveTo(34, 88);
      g.quadraticCurveTo(96, 26, 158, 88);
      g.closePath();
      const cg = g.createLinearGradient(0, 30, 0, 90);
      cg.addColorStop(0, shade('#a8854a', 0.12));
      cg.addColorStop(1, shade('#a8854a', -0.12));
      g.fillStyle = cg;
      g.fill();
      // Weave bands.
      g.strokeStyle = 'rgba(90,64,32,0.5)';
      g.lineWidth = 2;
      for (const t of [0.25, 0.5, 0.75]) {
        g.beginPath();
        g.moveTo(34 + (158 - 34) * t * 0.2, 88 - 54 * Math.sin(Math.PI * t) * 0.2);
        g.quadraticCurveTo(96, 26 + 62 * (1 - Math.sin(Math.PI * t)) * 0.4 + t * 8, 158 - 124 * t * 0.2, 88);
        g.stroke();
      }
      // Coir lashings along the gunwale.
      g.strokeStyle = 'rgba(200,165,91,0.6)';
      g.lineWidth = 1.6;
      for (let x = 24; x <= 168; x += 12) {
        g.beginPath();
        g.moveTo(x, 90);
        g.lineTo(x + 4, 95);
        g.stroke();
      }
      // Dark waterline.
      g.strokeStyle = 'rgba(20,26,24,0.6)';
      g.lineWidth = 3;
      g.beginPath();
      g.moveTo(10, 104);
      g.quadraticCurveTo(96, 118, 182, 104);
      g.stroke();
    }, 192, 128);

    // Coir rack: golden rope from soaked husk, patience made visible.
    make('coirrack', 2, (g, r) => {
      softShadow(g, 32, 90, 22, 5, 0.2);
      rr(g, 10, 30, 5, 58, 2, '#7a5636');
      rr(g, 49, 30, 5, 58, 2, '#7a5636');
      rr(g, 8, 28, 48, 5, 2, '#8a6238');
      // Hanks of golden rope over the bar.
      for (let i = 0; i < 4; i++) {
        const x = 16 + i * 9 + r.int(2);
        g.strokeStyle = shade('#c8a55b', (r.next() - 0.5) * 0.12);
        g.lineWidth = 4.6;
        g.lineCap = 'round';
        g.beginPath();
        g.moveTo(x, 33);
        g.quadraticCurveTo(x - 1.5, 55, x + 1, 74 + r.int(6));
        g.stroke();
        g.strokeStyle = 'rgba(120,86,40,0.4)';
        g.lineWidth = 1.2;
        g.beginPath();
        g.moveTo(x - 1, 40);
        g.lineTo(x + 1, 52);
        g.stroke();
      }
      // The husk pile that all of it used to be.
      blob(g, 22, 86, 8, '#8a6a44', r, 0.3);
      blob(g, 32, 88, 6, '#9b7a50', r, 0.3);
    }, 64, 96);

    // Shaji's thattukada: kettle, glasses, the whole institution on wheels
    // that never turn. The stove keeps it in `glows`.
    make('thattukada', 1, (g) => {
      softShadow(g, 32, 90, 26, 6, 0.2);
      // Legs and counter.
      rr(g, 8, 76, 4, 12, 1.5, '#5c4630');
      rr(g, 52, 76, 4, 12, 1.5, '#5c4630');
      rr(g, 4, 52, 56, 26, 4, '#3c6e64');
      vgrad(g, 4, 52, 56, 8, 'rgba(255,255,255,0.2)', 'rgba(0,0,0,0)');
      // The brass kettle, hero of the establishment.
      oval(g, 18, 46, 9, 7, '#c8973b');
      rr(g, 14, 34, 8, 6, 2, '#c8973b');
      g.strokeStyle = '#a2762c';
      g.lineWidth = 2.4;
      g.beginPath();
      g.moveTo(26, 44);
      g.quadraticCurveTo(34, 38, 32, 48);
      g.stroke();
      // Chaya glasses in a rank.
      for (let i = 0; i < 3; i++) {
        rr(g, 34 + i * 8, 42, 6, 10, 1.5, 'rgba(230,240,240,0.7)');
        rr(g, 35 + i * 8, 46, 4, 5.4, 1, '#b5713f');
      }
      // Steam.
      glowSpot(g, 20, 30, 10, '#f2ead8', 0.5);
      // Striped awning.
      rr(g, 2, 18, 60, 9, 4, '#3c6e64');
      g.fillStyle = PAL.cream;
      g.fillRect(12, 18, 10, 9);
      g.fillRect(32, 18, 10, 9);
      g.fillRect(52, 18, 8, 9);
      rr(g, 4, 24, 2.6, 30, 1.3, '#5c4630');
      rr(g, 57, 24, 2.6, 30, 1.3, '#5c4630');
    }, 64, 96);

    // The mural wall: whitewash, tile coping, and the village's opinions.
    make('muralwall', 2, (g, r, i) => {
      softShadow(g, 32, 90, 26, 5, 0.18);
      rr(g, 4, 34, 56, 54, 2, '#e8e0cc');
      vgrad(g, 4, 34, 56, 10, 'rgba(120,110,90,0.18)', 'rgba(0,0,0,0)');
      // Clay tile coping.
      rr(g, 2, 28, 60, 9, 3, '#a35a3c');
      for (let x = 6; x < 60; x += 8) {
        g.strokeStyle = 'rgba(90,44,28,0.5)';
        g.lineWidth = 1.6;
        g.beginPath();
        g.moveTo(x, 29);
        g.lineTo(x, 36);
        g.stroke();
      }
      if (i === 0) {
        // The party mural: a red field, a star, slogans in confident dashes.
        rr(g, 10, 42, 28, 18, 2, '#b5382e');
        dot(g, 17, 49, 4.5, '#f2e6d0');
        g.strokeStyle = '#b5382e';
        g.lineWidth = 2.6;
        for (const [lx, ly, lw] of [[12, 68, 26], [12, 74, 34], [12, 80, 20]]) {
          g.beginPath();
          g.moveTo(lx ?? 12, ly ?? 68);
          g.lineTo((lx ?? 12) + (lw ?? 20), ly ?? 68);
          g.stroke();
        }
      } else {
        // The library mural: an open book pouring readers out of its pages.
        g.fillStyle = '#3f6fa0';
        g.beginPath();
        g.moveTo(14, 58);
        g.quadraticCurveTo(28, 48, 32, 54);
        g.quadraticCurveTo(36, 48, 50, 58);
        g.lineTo(48, 66);
        g.quadraticCurveTo(36, 58, 32, 62);
        g.quadraticCurveTo(28, 58, 16, 66);
        g.closePath();
        g.fill();
        for (let k = 0; k < 3; k++) dot(g, 20 + k * 12, 74 + (k % 2) * 3, 2.6, '#b5382e');
      }
      // Rain streak, already rehearsing.
      vgrad(g, 8 + r.int(40), 36, 6, 30, 'rgba(140,130,105,0.2)', 'rgba(0,0,0,0)');
    }, 64, 96);

    // ---------------------------------------------------------- the veedu
    // 352x256, casa wall geometry so village grids match: tiled roof over
    // Gulf-money paint, deep eaves because the sky here means it.
    make('veedu', 3, (g, r) => {
      const W2 = 352;
      const coats = ['#e8e0c8', '#cfe0d0', '#e6cfc0'];
      const paint = shade(coats[r.int(3)] ?? '#e8e0c8', (r.next() - 0.5) * 0.05);
      const wallTop = 96;
      const wallBot = 252;

      // Wall.
      vgrad(g, 16, wallTop, W2 - 32, wallBot - wallTop, shade(paint, 0.07), shade(paint, -0.08));
      // Monsoon stains washing down from the eaves.
      for (let i = 0; i < 6; i++) {
        const fx = 24 + r.int(W2 - 60);
        vgrad(g, fx, wallTop, 10 + r.int(14), 46 + r.int(50), 'rgba(110,110,90,0.12)', 'rgba(0,0,0,0)');
      }
      // Green damp creeping up from the plinth.
      vgrad(g, 16, wallBot - 26, W2 - 32, 26, 'rgba(0,0,0,0)', 'rgba(70,90,60,0.3)');
      // Side shade.
      g.save();
      g.globalAlpha = 0.15;
      g.fillStyle = '#1c1712';
      g.fillRect(W2 - 26, wallTop, 10, wallBot - wallTop);
      g.restore();

      // Door: teak, same footprint as casa so the grids agree.
      rr(g, 150, wallBot - 96, 66, 96, 6, shade(paint, -0.3));
      rr(g, 156, wallBot - 88, 54, 88, 5, '#5c3d26');
      vgrad(g, 156, wallBot - 88, 54, 20, 'rgba(240,220,190,0.14)', 'rgba(0,0,0,0)');
      g.strokeStyle = 'rgba(35,22,12,0.55)';
      g.lineWidth = 2.4;
      for (const ly of [wallBot - 60, wallBot - 32]) {
        g.beginPath();
        g.moveTo(158, ly);
        g.lineTo(208, ly);
        g.stroke();
      }
      dot(g, 204, wallBot - 46, 3, '#c8a55b');
      rr(g, 146, wallBot - 102, 74, 10, 5, shade(paint, -0.2));

      // Windows, casa geometry, green shutters pinned open.
      for (const wx of [52, 252]) {
        rr(g, wx, wallTop + 34, 48, 44, 6, shade(paint, -0.3));
        rr(g, wx + 4, wallTop + 38, 40, 36, 5, '#2c3e40');
        vgrad(g, wx + 4, wallTop + 38, 40, 14, 'rgba(200,230,225,0.35)', 'rgba(0,0,0,0)');
        g.strokeStyle = '#4a3524';
        g.lineWidth = 3;
        g.beginPath();
        g.moveTo(wx + 24, wallTop + 38);
        g.lineTo(wx + 24, wallTop + 74);
        g.stroke();
        for (const shx of [wx - 14, wx + 48]) {
          rr(g, shx, wallTop + 36, 14, 44, 3, shade('#4d7440', (r.next() - 0.5) * 0.1));
          g.strokeStyle = 'rgba(28,42,26,0.5)';
          g.lineWidth = 1.6;
          for (let k = 1; k < 4; k++) {
            g.beginPath();
            g.moveTo(shx + 2, wallTop + 36 + k * 11);
            g.lineTo(shx + 12, wallTop + 36 + k * 11);
            g.stroke();
          }
        }
        rr(g, wx - 3, wallTop + 78, 54, 8, 4, shade(paint, 0.12));
      }

      // The tiled roof: clay courses, deep overhang, gable shadow beneath.
      g.beginPath();
      g.moveTo(0, wallTop + 6);
      g.lineTo(44, 26);
      g.lineTo(W2 - 44, 26);
      g.lineTo(W2, wallTop + 6);
      g.closePath();
      const rg = g.createLinearGradient(0, 22, 0, wallTop + 6);
      rg.addColorStop(0, shade('#a3563a', 0.12));
      rg.addColorStop(1, shade('#a3563a', -0.12));
      g.fillStyle = rg;
      g.fill();
      // Tile courses following the slope.
      g.strokeStyle = 'rgba(90,40,26,0.4)';
      g.lineWidth = 2.2;
      for (let t = 1; t <= 5; t++) {
        const y = 26 + ((wallTop + 6 - 26) * t) / 6;
        const inset = 44 - (44 * t) / 6;
        g.beginPath();
        g.moveTo(inset, y);
        g.lineTo(W2 - inset, y);
        g.stroke();
      }
      // Vertical pan-tile ribs.
      g.strokeStyle = 'rgba(90,40,26,0.25)';
      g.lineWidth = 1.8;
      for (let x = 24; x < W2 - 20; x += 16) {
        g.beginPath();
        g.moveTo(x + 10, 30);
        g.lineTo(x, wallTop + 2);
        g.stroke();
      }
      // Ridge cap.
      rr(g, 40, 20, W2 - 80, 10, 5, shade('#8a4630', 0.06));
      // Eave shadow on the wall.
      vgrad(g, 16, wallTop + 4, W2 - 32, 16, 'rgba(25,20,14,0.38)', 'rgba(0,0,0,0)');
      // A crow on the ridge, sometimes. There is always a crow.
      if (r.chance(0.6)) {
        const cx = 70 + r.int(W2 - 140);
        oval(g, cx, 16, 6, 4.4, '#241a12');
        dot(g, cx + 5, 13, 2.6, '#241a12');
      }
    }, 352, 256);
  },
};
