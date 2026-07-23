import type { ChapterArt } from './index';
import { blob, dot, glowSpot, oval, rect, rr, shade, softShadow, vgrad } from '../pix';
import { PAL } from '../../engine/config';

/**
 * Sicily's tile kinds: lava-black paving and shore, plaster-over-basalt
 * casedde with laundry lines, the faraglioni standing in the sea, lemon
 * trees, the granita bar, and the circolo's elderly chrome. Painterly vector
 * only; the palette runs black stone, plaster pastels, hard summer blue.
 */

const S = 64;

export const ART: ChapterArt = {
  aliases: { postsign: 'signpost' },
  grounded: [
    'faraglione',
    'lemontree',
    'granitabar',
    'bartable',
    'barlamp',
    'barca',
    'chiesa',
    'macchina',
    'trofei',
  ],
  buildings: ['casedda'],
  windows: {
    casedda: [
      [15, -10],
      [67, -10],
    ],
  },
  glows: ['barlamp'],
  pathy: ['basalto'],

  paint(make) {
    // ------------------------------------------------------------ grounds

    make('basalto', 5, (g, r) => {
      // Sun-worn lava paving: unmistakably grey, but noon-bright, not night.
      const base = '#8b8590';
      rect(g, 0, 0, S, S, base);
      // Two slab seams, soft dark joints; the mountain's stone, dressed.
      const sy = 22 + r.int(20);
      const vx = 18 + r.int(26);
      rr(g, 1.5, 1.5, S - 3, sy - 3, 5, shade(base, (r.next() - 0.5) * 0.06));
      rr(g, 1.5, sy + 1.5, vx - 3, S - sy - 3, 5, shade(base, (r.next() - 0.5) * 0.05));
      rr(g, vx + 1.5, sy + 1.5, S - vx - 3, S - sy - 3, 5, shade(base, (r.next() - 0.5) * 0.07));
      g.strokeStyle = 'rgba(18,14,22,0.4)';
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(0, sy);
      g.lineTo(S, sy);
      g.moveTo(vx, sy);
      g.lineTo(vx, S);
      g.stroke();
      // Glassy chips catching the sun, and a stubborn weed in a joint.
      if (r.chance(0.5)) dot(g, r.int(S), r.int(S), 1.6, 'rgba(230,238,246,0.5)');
      if (r.chance(0.2)) {
        g.strokeStyle = '#5f7a44';
        g.lineWidth = 2;
        g.beginPath();
        g.moveTo(vx, sy + 4);
        g.quadraticCurveTo(vx + 3, sy - 2, vx + 5, sy - 6);
        g.stroke();
      }
    });

    make('lavashore', 4, (g, r) => {
      const base = '#413c46';
      rect(g, 0, 0, S, S, base);
      // Water-rounded black cobbles, a shell, a salt line.
      for (let i = 0; i < 6; i++) {
        const c = shade(base, r.chance(0.5) ? -0.12 : 0.1);
        oval(g, r.int(S), r.int(S), 4 + r.int(4), 3 + r.int(2), c);
      }
      for (let i = 0; i < 3; i++) dot(g, r.int(S), r.int(S), 1.4, shade(base, 0.2));
      if (r.chance(0.18)) dot(g, r.int(S), r.int(S), 2, '#ede4cf');
      if (r.chance(0.3)) {
        g.strokeStyle = 'rgba(226,220,200,0.14)';
        g.lineWidth = 2;
        const yy = 8 + r.int(S - 16);
        g.beginPath();
        g.moveTo(0, yy);
        g.quadraticCurveTo(S / 2, yy + 4, S, yy);
        g.stroke();
      }
    });

    make('lavarock', 2, (g, r) => {
      softShadow(g, 32, 50, 20, 6, 0.2);
      const c = '#38323e';
      blob(g, 32, 38, 15, c, r, 0.3);
      blob(g, 26, 32, 9, shade(c, 0.12), r, 0.3);
      // Pores: the stone remembers being foam.
      for (let i = 0; i < 5; i++) dot(g, 22 + r.int(20), 28 + r.int(18), 1.3, shade(c, -0.25));
    });

    // ------------------------------------------------------------ flora

    make('lemontree', 2, (g, r) => {
      softShadow(g, 32, 90, 20, 6, 0.22);
      g.strokeStyle = '#6e5138';
      g.lineWidth = 6;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(32, 88);
      g.quadraticCurveTo(30 + r.int(6), 62, 32, 46);
      g.stroke();
      blob(g, 32, 34, 22, PAL.greenDark, r, 0.24);
      blob(g, 22, 40, 12, shade(PAL.greenDark, -0.08), r, 0.28);
      blob(g, 42, 28, 12, PAL.green, r, 0.28);
      blob(g, 30, 22, 10, shade(PAL.green, 0.12), r, 0.28);
      // The fruit: lamps somebody forgot to turn off.
      for (let i = 0; i < 7; i++) {
        const a = (i / 7) * Math.PI * 2 + r.next();
        const rad = 10 + r.int(9);
        dot(g, 32 + Math.cos(a) * rad, 32 + Math.sin(a) * rad * 0.8, 2.6, i % 2 ? '#e8d44d' : '#d9c22e');
      }
    }, 64, 96);

    // ------------------------------------------------------------ the sea's furniture

    make('faraglione', 2, (g, r) => {
      // A basalt stack: the giant's throw, still landing after three millennia.
      const c = '#3d3744';
      const w = 128;
      const baseY = 178;
      g.fillStyle = c;
      g.beginPath();
      g.moveTo(24, baseY);
      g.lineTo(30 + r.int(10), 96 + r.int(16));
      g.lineTo(44 + r.int(8), 40 + r.int(14));
      g.lineTo(66 + r.int(10), 12 + r.int(10));
      g.lineTo(84 + r.int(8), 52 + r.int(12));
      g.lineTo(96 + r.int(8), 120 + r.int(12));
      g.lineTo(104, baseY);
      g.closePath();
      g.fill();
      // Sunlit west faces, shadowed east ones.
      g.fillStyle = shade(c, 0.16);
      g.beginPath();
      g.moveTo(30, baseY - 10);
      g.lineTo(40, 70);
      g.lineTo(52, 34);
      g.lineTo(56, 90);
      g.lineTo(46, baseY - 4);
      g.closePath();
      g.fill();
      g.fillStyle = shade(c, -0.16);
      g.beginPath();
      g.moveTo(84, 60);
      g.lineTo(94, 124);
      g.lineTo(98, baseY - 6);
      g.lineTo(80, baseY - 8);
      g.closePath();
      g.fill();
      // Foam collar where the sea worries at it.
      oval(g, w / 2, baseY + 2, 46, 8, 'rgba(234,246,250,0.5)');
      oval(g, w / 2 - 18, baseY + 6, 18, 4, 'rgba(234,246,250,0.35)');
      oval(g, w / 2 + 22, baseY + 5, 14, 3.5, 'rgba(234,246,250,0.35)');
      // A gull, supervising.
      if (r.chance(0.7)) {
        g.strokeStyle = '#f0ede4';
        g.lineWidth = 2.4;
        g.beginPath();
        g.moveTo(60, 8);
        g.quadraticCurveTo(64, 4, 68, 8);
        g.stroke();
      }
    }, 128, 192);

    make('barca', 2, (g, r) => {
      // A painted wooden boat, eye at the prow, name on the bow.
      softShadow(g, 64, 82, 44, 9, 0.22);
      const hull = r.chance(0.5) ? '#e6e1d4' : '#4a7dab';
      const trim = hull === '#e6e1d4' ? '#3a6d9c' : '#e6e1d4';
      g.beginPath();
      g.moveTo(14, 58);
      g.quadraticCurveTo(64, 44, 114, 58);
      g.quadraticCurveTo(104, 82, 64, 84);
      g.quadraticCurveTo(24, 82, 14, 58);
      g.closePath();
      const grad = g.createLinearGradient(0, 44, 0, 84);
      grad.addColorStop(0, shade(hull, 0.12));
      grad.addColorStop(1, shade(hull, -0.14));
      g.fillStyle = grad;
      g.fill();
      // Gunwale in the second color, red waterline under it.
      g.strokeStyle = trim;
      g.lineWidth = 4;
      g.beginPath();
      g.moveTo(14, 58);
      g.quadraticCurveTo(64, 44, 114, 58);
      g.stroke();
      g.strokeStyle = '#b5443a';
      g.lineWidth = 2.4;
      g.beginPath();
      g.moveTo(20, 66);
      g.quadraticCurveTo(64, 56, 108, 66);
      g.stroke();
      // The eye that watches the horizon, repainted every spring.
      dot(g, 24, 60, 3.4, '#f2ede0');
      dot(g, 24.8, 60.4, 1.5, '#22303c');
      // Name plate amidships.
      rr(g, 52, 68, 26, 8, 3, shade('#e8dcc4', -0.04));
      g.strokeStyle = 'rgba(50,40,30,0.55)';
      g.lineWidth = 1.4;
      g.beginPath();
      g.moveTo(55, 72);
      g.lineTo(75, 72);
      g.stroke();
    }, 128, 96);

    // ------------------------------------------------------------ the bar

    make('granitabar', 1, (g) => {
      softShadow(g, 32, 90, 27, 6, 0.2);
      // Counter body, dark wood with a glass front.
      rr(g, 5, 46, 54, 36, 4, '#6b4f34');
      vgrad(g, 5, 46, 54, 8, 'rgba(255,244,220,0.2)', 'rgba(0,0,0,0)');
      rr(g, 9, 52, 46, 22, 3, 'rgba(214,232,240,0.55)');
      // The tubs: lemon, almond, coffee, mulberry with intentions.
      const flavors = ['#e3cf49', '#efe6d2', '#6b4a32', '#77406b'];
      for (let i = 0; i < 4; i++) {
        const fx = 11 + i * 11;
        rr(g, fx, 55, 9, 12, 2, '#c9c4bb');
        rr(g, fx + 1, 56, 7, 7, 2, flavors[i] ?? '#e3cf49');
      }
      // Brioche pyramid under a little dome, right of the tubs.
      dot(g, 50, 70, 4.5, '#d9a85e');
      dot(g, 50, 66.5, 2, '#c98a3e');
      // Striped awning on poles.
      rr(g, 2, 20, 60, 10, 5, '#3a6d9c');
      g.fillStyle = PAL.cream;
      for (const ax of [10, 30, 50]) g.fillRect(ax, 20, 9, 10);
      vgrad(g, 2, 26, 60, 5, 'rgba(20,25,40,0.18)', 'rgba(0,0,0,0)');
      rr(g, 4, 28, 2.6, 20, 1.3, '#5c4630');
      rr(g, 57, 28, 2.6, 20, 1.3, '#5c4630');
    }, 64, 96);

    make('bartable', 2, (g, r) => {
      softShadow(g, 32, 88, 18, 5, 0.18);
      // Umbrella first, then the little round table in its shade.
      g.strokeStyle = '#5c4630';
      g.lineWidth = 3;
      g.beginPath();
      g.moveTo(32, 84);
      g.lineTo(32, 22);
      g.stroke();
      const cloth = r.chance(0.5) ? PAL.cream : '#e8ddc0';
      g.fillStyle = cloth;
      g.beginPath();
      g.moveTo(6, 34);
      g.quadraticCurveTo(32, 2, 58, 34);
      g.quadraticCurveTo(45, 28, 32, 34);
      g.quadraticCurveTo(19, 28, 6, 34);
      g.closePath();
      g.fill();
      g.strokeStyle = PAL.terracotta;
      g.lineWidth = 2.4;
      g.beginPath();
      g.moveTo(10, 31);
      g.quadraticCurveTo(32, 6, 54, 31);
      g.stroke();
      dot(g, 32, 18, 2.4, '#5c4630');
      // Marble-top table and one waiting glass.
      oval(g, 32, 74, 15, 7, '#ddd6c8');
      oval(g, 32, 72, 15, 6, '#efe9dc');
      rr(g, 29, 76, 6, 10, 2, 'rgba(60,45,30,0.5)');
      rr(g, 36, 66, 4, 6, 1.5, 'rgba(214,232,240,0.8)');
    }, 64, 96);

    make('barlamp', 1, (g) => {
      softShadow(g, 32, 90, 13, 4, 0.18);
      g.strokeStyle = '#2b2b33';
      g.lineWidth = 4;
      g.beginPath();
      g.moveTo(32, 88);
      g.lineTo(32, 30);
      g.quadraticCurveTo(32, 20, 42, 20);
      g.stroke();
      // The lamp that opens the passeggiata.
      glowSpot(g, 44, 26, 18, '#ffd98c', 0.55);
      rr(g, 39, 20, 10, 13, 3, '#f6ecc8');
      rr(g, 38, 18, 12, 4, 2, '#2b2b33');
      dot(g, 44, 34, 2, '#2b2b33');
      dot(g, 32, 52, 2.2, '#3d3d47');
      dot(g, 32, 70, 2.2, '#3d3d47');
    }, 64, 96);

    make('vespa', 2, (g, r) => {
      softShadow(g, 32, 54, 22, 6, 0.18);
      const body = r.chance(0.5) ? '#9fc4b8' : '#ddd2b8';
      // Wheels.
      dot(g, 19, 48, 7, '#2f2a26');
      dot(g, 19, 48, 2.6, '#b9c4c9');
      dot(g, 47, 48, 7, '#2f2a26');
      dot(g, 47, 48, 2.6, '#b9c4c9');
      // Step-through body: rear cowl, floorboard, front shield.
      oval(g, 42, 38, 12, 9, body);
      rect(g, 24, 42, 18, 4, shade(body, -0.08));
      g.strokeStyle = shade(body, 0.06);
      g.lineWidth = 6;
      g.beginPath();
      g.moveTo(24, 44);
      g.quadraticCurveTo(20, 34, 22, 26);
      g.stroke();
      // Seat, handlebar, headlamp, mirror.
      rr(g, 36, 28, 13, 5, 2.5, '#3a3430');
      g.strokeStyle = '#3a3430';
      g.lineWidth = 2.6;
      g.beginPath();
      g.moveTo(22, 26);
      g.lineTo(28, 22);
      g.stroke();
      dot(g, 21, 24, 2.6, '#f2e6c8');
      dot(g, 29, 20, 1.6, '#b9c4c9');
    });

    // ------------------------------------------------------------ buildings

    make('casedda', 4, (g, r) => {
      // 352x256: plaster over lava stone, casa-compatible geometry so the
      // village grid matches: wall 96..252, door at 150, windows at 52/252.
      const W = 352;
      const coats = ['#e6d3ac', '#d9a878', '#c98a7a', '#dfc292'];
      const paint = shade(coats[r.int(4)] ?? '#e6d3ac', (r.next() - 0.5) * 0.05);
      const wallTop = 96;
      const wallBot = 252;
      const dark = '#3a3540';

      vgrad(g, 16, wallTop, W - 32, wallBot - wallTop, shade(paint, 0.07), shade(paint, -0.07));
      // Lime streaks and a patch where the plaster lost to the basalt bones.
      for (let i = 0; i < 6; i++) {
        const fx = 24 + r.int(W - 60);
        vgrad(g, fx, wallTop, 10 + r.int(18), 50 + r.int(70), 'rgba(246,240,226,0.14)', 'rgba(0,0,0,0)');
      }
      if (r.chance(0.75)) {
        const px = r.chance(0.5) ? 36 : W - 108;
        const py = wallBot - 66 - r.int(46);
        rr(g, px, py, 62, 38, 8, shade(dark, 0.06));
        g.strokeStyle = 'rgba(16,12,20,0.4)';
        g.lineWidth = 2;
        for (let k = 0; k < 4; k++) {
          g.beginPath();
          g.moveTo(px + 4, py + 8 + k * 9);
          g.lineTo(px + 58, py + 8 + k * 9);
          g.stroke();
        }
      }
      // Basalt quoins up the corners, and a stone base course.
      for (let k = 0; k < 5; k++) {
        const qy = wallTop + 12 + k * 30;
        rr(g, 16, qy, k % 2 ? 20 : 14, 16, 2, shade(dark, (r.next() - 0.5) * 0.1 + 0.05));
        rr(g, W - 16 - (k % 2 ? 20 : 14), qy, k % 2 ? 20 : 14, 16, 2, shade(dark, (r.next() - 0.5) * 0.1));
      }
      vgrad(g, 16, wallBot - 26, W - 32, 26, 'rgba(0,0,0,0)', 'rgba(30,26,36,0.45)');
      rect(g, 16, wallBot - 12, W - 32, 12, shade(dark, -0.05));
      // Side shade.
      g.save();
      g.globalAlpha = 0.15;
      g.fillStyle = '#1c1712';
      g.fillRect(W - 26, wallTop, 10, wallBot - wallTop);
      g.restore();

      // Door: basalt frame, wooden leaf, bead curtain hinted in the gap.
      rr(g, 150, wallBot - 96, 66, 96, 6, dark);
      rr(g, 156, wallBot - 88, 54, 88, 5, '#5c4630');
      vgrad(g, 156, wallBot - 88, 54, 20, 'rgba(240,225,200,0.16)', 'rgba(0,0,0,0)');
      g.strokeStyle = 'rgba(30,22,14,0.5)';
      g.lineWidth = 2.2;
      for (const lx of [174, 192]) {
        g.beginPath();
        g.moveTo(lx, wallBot - 84);
        g.lineTo(lx, wallBot - 6);
        g.stroke();
      }
      dot(g, 204, wallBot - 46, 3, PAL.cream);
      rr(g, 146, wallBot - 102, 74, 10, 5, shade(dark, 0.12));

      // Windows with green shutters pinned open, same sills as casa.
      for (const wx of [52, 252]) {
        rr(g, wx, wallTop + 34, 48, 44, 6, dark);
        rr(g, wx + 4, wallTop + 38, 40, 36, 5, '#2c3e57');
        vgrad(g, wx + 4, wallTop + 38, 40, 14, 'rgba(200,225,240,0.4)', 'rgba(0,0,0,0)');
        g.strokeStyle = '#4a4038';
        g.lineWidth = 3;
        g.beginPath();
        g.moveTo(wx + 24, wallTop + 38);
        g.lineTo(wx + 24, wallTop + 74);
        g.stroke();
        for (const shx of [wx - 14, wx + 48]) {
          rr(g, shx, wallTop + 36, 14, 44, 3, shade('#5a7a4d', (r.next() - 0.5) * 0.12));
          g.strokeStyle = 'rgba(28,40,26,0.5)';
          g.lineWidth = 1.6;
          for (let k = 1; k < 4; k++) {
            g.beginPath();
            g.moveTo(shx + 2, wallTop + 36 + k * 11);
            g.lineTo(shx + 12, wallTop + 36 + k * 11);
            g.stroke();
          }
        }
        rr(g, wx - 3, wallTop + 78, 54, 8, 4, shade(dark, 0.2));
      }

      // A shallow terracotta roof band above the wall.
      rr(g, 8, wallTop - 24, W - 16, 32, 6, '#a8583a');
      for (let tx = 14; tx < W - 20; tx += 22) {
        g.strokeStyle = 'rgba(70,30,18,0.4)';
        g.lineWidth = 2;
        g.beginPath();
        g.moveTo(tx, wallTop - 22);
        g.quadraticCurveTo(tx + 11, wallTop - 14, tx + 22, wallTop - 22);
        g.stroke();
      }
      vgrad(g, 8, wallTop - 24, W - 16, 8, 'rgba(255,240,214,0.25)', 'rgba(0,0,0,0)');
      vgrad(g, 16, wallTop + 8, W - 32, 12, 'rgba(20,16,24,0.35)', 'rgba(0,0,0,0)');

      // Laundry between the windows on some houses: flags of ordinary life.
      if (r.chance(0.6)) {
        g.strokeStyle = 'rgba(235,230,215,0.7)';
        g.lineWidth = 1.6;
        g.beginPath();
        g.moveTo(100, wallTop + 52);
        g.quadraticCurveTo(176, wallTop + 68, 252, wallTop + 50);
        g.stroke();
        const wash = ['#c98a7a', '#7f9fb5', PAL.cream, '#9fc4b8'];
        for (let k = 0; k < 4; k++) {
          rr(g, 112 + k * 36, wallTop + 56 + (k % 2) * 4, 20, 16, 3, wash[k] ?? PAL.cream);
        }
      }
    }, 352, 256);

    make('chiesa', 1, (g) => {
      // The facade: baroque curves in grey and black basalt, steps at the base.
      const W = 192;
      const stone = '#8c8479';
      const dark = '#3a3540';
      softShadow(g, W / 2, 198, 74, 10, 0.24);
      // Steps.
      for (let k = 0; k < 3; k++) {
        rr(g, 16 + k * 6, 186 - k * 8, W - 32 - k * 12, 10, 3, shade(stone, 0.04 + k * 0.04));
      }
      // Body.
      vgrad(g, 30, 60, W - 60, 116, shade(stone, 0.1), shade(stone, -0.06));
      // Basalt pilasters and cornice: the mountain, dressed for Sunday.
      for (const px of [30, 90, 150]) rr(g, px, 60, 12, 116, 2, shade(dark, 0.05));
      rr(g, 24, 52, W - 48, 12, 3, dark);
      rr(g, 24, 168, W - 48, 10, 3, shade(dark, -0.06));
      // Curved pediment with a bell niche.
      g.fillStyle = shade(stone, 0.06);
      g.beginPath();
      g.moveTo(40, 52);
      g.quadraticCurveTo(96, 2, 152, 52);
      g.closePath();
      g.fill();
      g.strokeStyle = dark;
      g.lineWidth = 4;
      g.beginPath();
      g.moveTo(40, 52);
      g.quadraticCurveTo(96, 2, 152, 52);
      g.stroke();
      g.fillStyle = shade(dark, -0.1);
      g.beginPath();
      g.arc(96, 38, 12, Math.PI, 0);
      g.closePath();
      g.fill();
      // The bell, and its patient rope.
      dot(g, 96, 34, 5.5, '#c9a35f');
      rr(g, 94.5, 26, 3, 5, 1, '#8a6a3a');
      // Arched door between the pilasters.
      g.fillStyle = dark;
      g.beginPath();
      g.moveTo(78, 176);
      g.lineTo(78, 130);
      g.quadraticCurveTo(96, 112, 114, 130);
      g.lineTo(114, 176);
      g.closePath();
      g.fill();
      g.fillStyle = '#4a3a2c';
      g.beginPath();
      g.moveTo(84, 176);
      g.lineTo(84, 134);
      g.quadraticCurveTo(96, 120, 108, 134);
      g.lineTo(108, 176);
      g.closePath();
      g.fill();
      dot(g, 104, 152, 2, PAL.cream);
      // Round window over the door, ringed in basalt.
      dot(g, 96, 90, 11, dark);
      dot(g, 96, 90, 8, '#2c3e57');
      glowSpot(g, 96, 90, 6, '#e8d9a8', 0.5);
      // Stucco panels either side.
      for (const sx of [48, 122]) {
        rr(g, sx, 76, 22, 34, 4, shade('#efe9dc', -0.02));
        rr(g, sx, 120, 22, 34, 4, shade('#efe9dc', -0.05));
      }
    }, 192, 208);

    // ------------------------------------------------------------ the circolo

    make('macchina', 1, (g) => {
      softShadow(g, 32, 90, 20, 5, 0.18);
      // The espresso machine older than every member: chrome, lever, steam.
      rr(g, 12, 40, 40, 44, 6, '#9aa6ab');
      vgrad(g, 12, 40, 40, 14, 'rgba(255,255,255,0.45)', 'rgba(0,0,0,0)');
      rr(g, 16, 30, 32, 14, 6, '#b9c4c9');
      dot(g, 32, 30, 7, '#c9d2d6');
      dot(g, 32, 27, 2.4, '#8a6a3a');
      // The lever, half salute, half ship's telegraph.
      g.strokeStyle = '#7a838a';
      g.lineWidth = 4;
      g.beginPath();
      g.moveTo(48, 40);
      g.lineTo(56, 22);
      g.stroke();
      dot(g, 56, 20, 3.4, '#3a3430');
      // Group heads and two small cups doing their duty.
      for (const px of [22, 38]) {
        rr(g, px, 62, 8, 6, 2, '#6b7378');
        rr(g, px + 1, 74, 6, 6, 2, PAL.cream);
      }
      // Steam, patient as the argument at the card table.
      g.strokeStyle = 'rgba(240,244,246,0.5)';
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(20, 26);
      g.quadraticCurveTo(16, 18, 20, 10);
      g.stroke();
    }, 64, 96);

    make('trofei', 1, (g) => {
      // The trophy shelf: cups, a plate from 1961, a mounted swordfish bill.
      for (const sy of [40, 70]) rr(g, 6, sy, 52, 6, 2, '#6e5138');
      // Cups on the top shelf.
      for (const cx of [16, 32, 47]) {
        rr(g, cx - 4, 26, 8, 12, 2, '#c9a35f');
        rr(g, cx - 6, 22, 12, 5, 2, shade('#c9a35f', 0.15));
        rr(g, cx - 2, 38, 4, 3, 1, '#8a6a3a');
      }
      // The plate, propped and engraved with an illegible triumph.
      dot(g, 20, 60, 9, '#d9d3c4');
      dot(g, 20, 60, 6, '#c2bba8');
      // The swordfish bill, mounted like a relic.
      g.strokeStyle = '#cfc8ba';
      g.lineWidth = 3.4;
      g.beginPath();
      g.moveTo(32, 66);
      g.lineTo(56, 56);
      g.stroke();
      rr(g, 30, 62, 6, 8, 2, '#5c4630');
      // A pennant that outlived its regatta.
      g.fillStyle = '#3a6d9c';
      g.beginPath();
      g.moveTo(8, 8);
      g.lineTo(24, 14);
      g.lineTo(8, 22);
      g.closePath();
      g.fill();
    }, 64, 96);
  },
};
