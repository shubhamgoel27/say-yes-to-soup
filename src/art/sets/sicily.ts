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
    'fontana',
    'faraglione',
    'lemontree',
    'granitabar',
    'bartable',
    'barlamp',
    'barca',
    'chiesa',
    'macchina',
    'trofei',
    'testadimoro',
    'edicola',
    'fichidindia',
    'pomodori',
    'avvisi',
    'lavagna',
    'ventola',
    'banco',
  ],
  buildings: ['casedda'],
  windows: {
    casedda: [
      [15, -10],
      [67, -10],
    ],
  },
  glows: ['barlamp', 'edicola', 'lampadario'],
  pathy: ['basalto'],
  noInk: ['campetto', 'limoni'],
  /** The circolo is whitewash, oil paint and graniglia, not Andean adobe. */
  skins: {
    circolo: { wallInt: 'wallCalce', floorEarth: 'floorGraniglia', rug: 'rugPezzara' },
  },

  paint(make) {
    // ------------------------------------------------------------ grounds

    make('basalto', 9, (g, r, i) => {
      // Sun-worn lava paving: unmistakably grey, but noon-bright, not night.
      // It was laid by hand over two centuries, so it must not tile like a
      // spreadsheet: a ninth of these cells is one uncut slab, a third runs
      // its joints the other way, and no two neighbours share a pattern.
      const base = '#8b8590';
      rect(g, 0, 0, S, S, base);
      const joint = (ax: number, ay: number, bx: number, by: number) => {
        g.strokeStyle = 'rgba(18,14,22,0.36)';
        g.lineWidth = 2;
        g.beginPath();
        g.moveTo(ax, ay);
        g.quadraticCurveTo((ax + bx) / 2 + (r.next() - 0.5) * 5, (ay + by) / 2 + (r.next() - 0.5) * 5, bx, by);
        g.stroke();
      };
      const slab = (x: number, y: number, w: number, h: number) =>
        rr(g, x + 1.5, y + 1.5, w - 3, h - 3, 5, shade(base, (r.next() - 0.5) * 0.09));
      const mode = i % 3;
      if (i === 4) {
        // One whole slab, quarried in a good year and never cracked since.
        slab(0, 0, S, S);
        joint(0, -1, S, 1);
      } else if (mode === 0) {
        const sy = 20 + r.int(24);
        const vx = 16 + r.int(30);
        slab(0, 0, S, sy);
        slab(0, sy, vx, S - sy);
        slab(vx, sy, S - vx, S - sy);
        joint(0, sy, S, sy);
        joint(vx, sy, vx + (r.next() - 0.5) * 6, S);
      } else if (mode === 1) {
        // Joints running the other way: a stretch relaid after the flow.
        const vx = 20 + r.int(24);
        const sy = 18 + r.int(28);
        slab(0, 0, vx, S);
        slab(vx, 0, S - vx, sy);
        slab(vx, sy, S - vx, S - sy);
        joint(vx, 0, vx, S);
        joint(vx, sy, S, sy + (r.next() - 0.5) * 6);
      } else {
        // Small setts around a bigger one: where a lane elbows into the piazza.
        const vx = 22 + r.int(16);
        const sy = 24 + r.int(14);
        slab(0, 0, vx, sy);
        slab(vx, 0, S - vx, sy);
        slab(0, sy, S, S - sy);
        joint(vx, 0, vx, sy);
        joint(0, sy, S, sy);
      }
      // Sand drifted into the low corner of some slabs, and glassy chips.
      if (r.chance(0.35)) oval(g, r.int(S), r.int(S), 9 + r.int(9), 5 + r.int(5), 'rgba(196,168,122,0.13)');
      if (r.chance(0.5)) dot(g, r.int(S), r.int(S), 1.6, 'rgba(230,238,246,0.5)');
      if (r.chance(0.22)) {
        const wx = 8 + r.int(48);
        const wy = 10 + r.int(44);
        g.strokeStyle = '#5f7a44';
        g.lineWidth = 2;
        g.beginPath();
        g.moveTo(wx, wy);
        g.quadraticCurveTo(wx + 3, wy - 6, wx + 5, wy - 10);
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

    make('lavarock', 5, (g, r) => {
      // No two of these are the same size: a reef of identical pebbles reads
      // as wallpaper, and this coast is a rubble field, not a pattern.
      const s = 0.62 + r.next() * 0.75;
      const cxx = 32 + (r.next() - 0.5) * 14;
      const cyy = 40 + (r.next() - 0.5) * 10;
      softShadow(g, cxx, cyy + 12, 20 * s, 6 * s, 0.2);
      const c = shade('#38323e', (r.next() - 0.5) * 0.16);
      blob(g, cxx, cyy - 2, 15 * s, c, r, 0.34);
      blob(g, cxx - 6 * s, cyy - 8 * s, 9 * s, shade(c, 0.12), r, 0.34);
      if (r.chance(0.4)) blob(g, cxx + 11 * s, cyy + 2, 6 * s, shade(c, -0.08), r, 0.3);
      // Pores: the stone remembers being foam.
      for (let i = 0; i < 5; i++) {
        dot(g, cxx - 10 * s + r.int(20 * s), cyy - 12 * s + r.int(18 * s), 1.3, shade(c, -0.25));
      }
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

    make('fontana', 1, (g) => {
      // The piazza's one loud thing, and the reason the piazza is where it is:
      // a lava basin the width of two men, a bronze spout polished bright by
      // four generations of hands, and water that has never been turned off.
      const cx = 64;
      softShadow(g, cx, 152, 46, 11, 0.26);
      const stone = '#4a4450';
      // The basin: an eight-sided tub cut from the mountain and set down here.
      g.fillStyle = shade(stone, -0.12);
      g.beginPath();
      g.moveTo(10, 112);
      g.lineTo(22, 96);
      g.lineTo(106, 96);
      g.lineTo(118, 112);
      g.lineTo(106, 144);
      g.lineTo(22, 144);
      g.closePath();
      g.fill();
      rr(g, 12, 90, 104, 14, 5, stone);
      vgrad(g, 12, 90, 104, 7, 'rgba(255,246,224,0.24)', 'rgba(0,0,0,0)');
      vgrad(g, 14, 124, 100, 20, 'rgba(0,0,0,0)', 'rgba(18,14,22,0.4)');
      // The water inside it, holding the sky, a leaf, and a slick of pollen.
      oval(g, cx, 104, 46, 12, '#4a7f9c');
      oval(g, cx, 101, 39, 9, '#7fb3c9');
      oval(g, 44, 100, 12, 3, 'rgba(240,250,255,0.65)');
      oval(g, 86, 105, 7, 2, 'rgba(240,250,255,0.4)');
      dot(g, 74, 100, 2, '#5f7a44');
      // The pillar, its cornice, and the small cross the mason threw in free.
      rr(g, 50, 30, 28, 66, 4, shade(stone, 0.08));
      vgrad(g, 50, 30, 28, 22, 'rgba(255,246,224,0.2)', 'rgba(0,0,0,0)');
      rr(g, 44, 22, 40, 12, 4, shade(stone, 0.18));
      rr(g, 46, 78, 36, 10, 4, shade(stone, 0.12));
      // A carved face on the pillar, worn down to an opinion.
      dot(g, 64, 52, 9, shade(stone, -0.08));
      dot(g, 60, 50, 1.8, shade(stone, -0.3));
      dot(g, 68, 50, 1.8, shade(stone, -0.3));
      g.strokeStyle = shade(stone, -0.28);
      g.lineWidth = 1.6;
      g.beginPath();
      g.moveTo(60, 57);
      g.quadraticCurveTo(64, 59, 68, 57);
      g.stroke();
      g.strokeStyle = '#c9a35f';
      g.lineWidth = 3;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(64, 6);
      g.lineTo(64, 22);
      g.moveTo(56, 12);
      g.lineTo(72, 12);
      g.stroke();
      // Two bronze spouts: one running, one retired mid-argument in 1974.
      g.strokeStyle = '#b98a3e';
      g.lineWidth = 5;
      g.beginPath();
      g.moveTo(52, 68);
      g.lineTo(38, 76);
      g.moveTo(76, 68);
      g.lineTo(90, 76);
      g.stroke();
      dot(g, 38, 76, 3.4, '#d9b463');
      dot(g, 90, 76, 3.4, '#8a6a3a');
      // The one that runs, and the ring it has worn in the water.
      g.strokeStyle = 'rgba(214,240,250,0.75)';
      g.lineWidth = 3.4;
      g.beginPath();
      g.moveTo(38, 79);
      g.quadraticCurveTo(40, 92, 42, 102);
      g.stroke();
      oval(g, 42, 103, 9, 3.4, 'rgba(240,252,255,0.55)');
      dot(g, 47, 98, 1.6, 'rgba(255,255,255,0.8)');
      dot(g, 36, 94, 1.2, 'rgba(255,255,255,0.6)');
      // A tin bucket waiting its turn, and a wet patch that never dries.
      rr(g, 16, 128, 16, 15, 3, '#9aa6ab');
      rr(g, 16, 126, 16, 4, 2, '#b9c4c9');
      g.strokeStyle = '#7a838a';
      g.lineWidth = 1.6;
      g.beginPath();
      g.arc(24, 126, 8, Math.PI, 0);
      g.stroke();
      oval(g, 92, 148, 20, 6, 'rgba(40,60,80,0.2)');
    }, 128, 160);

    make('bucato', 3, (g, r) => {
      // Washing strung across the lane: the only flag this street flies.
      const wash = ['#c98a7a', '#7f9fb5', PAL.cream, '#9fc4b8', '#e8dcc4', '#b5443a'];
      g.strokeStyle = 'rgba(240,236,224,0.75)';
      g.lineWidth = 1.6;
      g.beginPath();
      g.moveTo(0, 9);
      g.quadraticCurveTo(S / 2, 15, S, 9);
      g.stroke();
      let x = 2 + r.int(4);
      while (x < S - 10) {
        const w = 9 + r.int(9);
        const h = 12 + r.int(12);
        const yy = 11 + Math.sin((x / S) * Math.PI) * 4.5;
        const c = wash[r.int(wash.length)] ?? PAL.cream;
        rr(g, x, yy, w, h, 2, c);
        vgrad(g, x, yy, w, h * 0.4, 'rgba(255,250,235,0.22)', 'rgba(0,0,0,0)');
        // A fold, and the peg holding the whole argument together.
        g.strokeStyle = shade(c, -0.14);
        g.lineWidth = 1.2;
        g.beginPath();
        g.moveTo(x + w * 0.5, yy + 3);
        g.lineTo(x + w * 0.5, yy + h - 2);
        g.stroke();
        dot(g, x + 2, yy - 1, 1.2, '#8a6a3a');
        dot(g, x + w - 2, yy - 1, 1.2, '#8a6a3a');
        x += w + 3 + r.int(6);
      }
    });

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

    // ------------------------------------------------------------ street life

    make('lemoncrate', 3, (g, r) => {
      softShadow(g, 32, 56, 22, 6, 0.2);
      const wood = '#b58a54';
      // Lower crate, slatted, with the cooperative's stencil band.
      rr(g, 10, 34, 44, 22, 3, shade(wood, -0.06));
      g.strokeStyle = 'rgba(60,40,20,0.35)';
      g.lineWidth = 2;
      for (const ly of [40, 50]) {
        g.beginPath();
        g.moveTo(12, ly);
        g.lineTo(52, ly);
        g.stroke();
      }
      // The stencil: blue band, pale letters, crooked the same way every time.
      g.save();
      g.translate(32, 45);
      g.rotate((r.next() - 0.5) * 0.06 - 0.03);
      rr(g, -17, -4, 34, 8, 2, 'rgba(58,109,156,0.85)');
      g.strokeStyle = 'rgba(242,237,224,0.9)';
      g.lineWidth = 1.5;
      for (let k = 0; k < 6; k++) {
        const lx = -13 + k * 5 + (r.next() - 0.5);
        g.beginPath();
        g.moveTo(lx, -1.6);
        g.lineTo(lx + 2.4, 1.8);
        g.stroke();
      }
      g.restore();
      // Upper crate rides a little off-square; lemons crowd the rim.
      const ox = r.chance(0.5) ? -3 : 3;
      rr(g, 14 + ox, 18, 38, 18, 3, wood);
      vgrad(g, 14 + ox, 18, 38, 6, 'rgba(255,240,210,0.2)', 'rgba(0,0,0,0)');
      g.strokeStyle = 'rgba(60,40,20,0.35)';
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(16 + ox, 27);
      g.lineTo(50 + ox, 27);
      g.stroke();
      for (let i = 0; i < 6; i++) {
        dot(g, 20 + ox + i * 5.2, 17 + (i % 2) * 2.4, 3.4, i % 2 ? '#e3cf49' : '#d9c22e');
      }
      if (r.chance(0.7)) oval(g, 26 + ox, 13.5, 4, 1.8, '#5f7a44', 0.5);
    });

    make('testadimoro', 2, (g, r) => {
      // A glazed maiolica head for a planter, basil for hair. The legend
      // supplies the rest.
      softShadow(g, 32, 90, 17, 5, 0.2);
      const skin = r.chance(0.5) ? '#b07848' : '#6e4a30';
      // The base: white ceramic collar painted with a blue wave, the shelf
      // the whole legend stands on.
      rr(g, 18, 74, 28, 14, 5, '#efe9dc');
      g.strokeStyle = '#3a6d9c';
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(21, 81);
      for (let k = 0; k < 4; k++) g.quadraticCurveTo(24 + k * 6, 77.5, 27 + k * 6, 81);
      g.stroke();
      // The head, glazed and wide, with a ceramic shine up one cheek.
      oval(g, 32, 58, 17, 18, skin);
      oval(g, 25, 52, 5, 8, shade(skin, 0.18), -0.3);
      // Face: calm, painted, in on the joke.
      dot(g, 26, 57, 2, '#2b2016');
      dot(g, 38, 57, 2, '#2b2016');
      g.strokeStyle = '#2b2016';
      g.lineWidth = 1.5;
      for (const bx of [26, 38]) {
        g.beginPath();
        g.moveTo(bx - 3.4, 53);
        g.quadraticCurveTo(bx, 51, bx + 3.4, 53);
        g.stroke();
      }
      dot(g, 32, 67, 2.6, '#a04738');
      dot(g, 15, 60, 2.2, '#c9a35f');
      dot(g, 49, 60, 2.2, '#c9a35f');
      // The hair: basil, thriving, faintly smug.
      blob(g, 32, 28, 12, PAL.greenDark, r, 0.3);
      blob(g, 22, 33, 8, '#5f7a44', r, 0.3);
      blob(g, 42, 32, 8, shade('#5f7a44', 0.12), r, 0.3);
      blob(g, 32, 20, 7, shade(PAL.green, 0.12), r, 0.3);
      dot(g, 26, 22, 1.6, shade(PAL.green, 0.3));
      dot(g, 39, 26, 1.6, shade(PAL.green, 0.3));
      // Crown over the brow, painted after the basil so royalty stays visible.
      rr(g, 20, 40, 24, 7, 3, '#c9a35f');
      g.fillStyle = '#c9a35f';
      for (const px of [23, 30, 37]) {
        g.beginPath();
        g.moveTo(px, 41);
        g.lineTo(px + 3.5, 35);
        g.lineTo(px + 7, 41);
        g.closePath();
        g.fill();
      }
      dot(g, 26, 43.5, 1.5, '#b5443a');
      dot(g, 32, 43.5, 1.5, '#3a6d9c');
      dot(g, 38, 43.5, 1.5, '#4a7a4a');
    }, 64, 96);

    make('edicola', 1, (g) => {
      softShadow(g, 32, 90, 16, 5, 0.2);
      // A lava-stone aedicule with a little pediment.
      g.fillStyle = '#3a3540';
      g.beginPath();
      g.moveTo(10, 32);
      g.lineTo(32, 16);
      g.lineTo(54, 32);
      g.closePath();
      g.fill();
      rr(g, 14, 30, 36, 58, 4, '#3a3540');
      // The niche, plastered pale.
      g.fillStyle = '#efe9dc';
      g.beginPath();
      g.moveTo(20, 84);
      g.lineTo(20, 48);
      g.quadraticCurveTo(32, 34, 44, 48);
      g.lineTo(44, 84);
      g.closePath();
      g.fill();
      // The Madonna: blue robe, gold halo, small and certain.
      g.strokeStyle = '#c9a35f';
      g.lineWidth = 1.6;
      g.beginPath();
      g.arc(32, 52, 5.5, 0, Math.PI * 2);
      g.stroke();
      oval(g, 32, 67, 6, 10, '#3a6d9c');
      oval(g, 32, 64, 4.5, 7, shade('#3a6d9c', 0.12));
      dot(g, 32, 53, 3.6, '#e0b48a');
      // Two electric candles, steady in any wind.
      glowSpot(g, 24.5, 73, 8, '#ffd98c', 0.6);
      glowSpot(g, 39.5, 73, 8, '#ffd98c', 0.6);
      rr(g, 23, 74, 3, 9, 1.5, '#f2ede0');
      rr(g, 38, 74, 3, 9, 1.5, '#f2ede0');
      dot(g, 24.5, 72.5, 1.4, '#ffb54d');
      dot(g, 39.5, 72.5, 1.4, '#ffb54d');
      // A jam jar of bougainvillea somebody keeps current.
      rr(g, 29, 78, 6, 7, 2, 'rgba(214,232,240,0.8)');
      dot(g, 30, 76, 2, '#c65a8a');
      dot(g, 34, 75.5, 2, '#a04a78');
    }, 64, 96);

    make('fichidindia', 2, (g, r) => {
      softShadow(g, 32, 90, 19, 6, 0.22);
      // Prickly pear with a toe-hold in the lava.
      blob(g, 32, 84, 9, '#38323e', r, 0.3);
      const pad = '#5f7a44';
      oval(g, 30, 66, 10, 14, pad, -0.15);
      oval(g, 18, 53, 8, 11, shade(pad, 0.08), -0.5);
      oval(g, 43, 51, 9, 12, shade(pad, -0.06), 0.4);
      oval(g, 31, 39, 8, 11, shade(pad, 0.14), 0.1);
      // Fruit along the rims, sunset-colored and defended.
      dot(g, 34, 29, 2.8, '#d9694a');
      dot(g, 27, 31, 2.4, '#c1512f');
      dot(g, 48, 42, 2.6, '#d9694a');
      dot(g, 14, 45, 2.3, '#c98a3e');
      // Spines: small pale ticks, entirely serious.
      g.strokeStyle = 'rgba(240,238,225,0.7)';
      g.lineWidth = 1;
      for (let i = 0; i < 10; i++) {
        const px = 16 + r.int(32);
        const py = 38 + r.int(34);
        g.beginPath();
        g.moveTo(px, py);
        g.lineTo(px + 1.6, py - 2.2);
        g.stroke();
      }
    }, 64, 96);

    make('nonnachair', 1, (g) => {
      softShadow(g, 32, 56, 16, 5, 0.2);
      // A kitchen chair, set at the angle the shade will want at four o'clock.
      g.save();
      g.translate(32, 40);
      g.rotate(-0.14);
      const wood = '#8a6a3a';
      g.strokeStyle = shade(wood, -0.1);
      g.lineWidth = 3;
      g.lineCap = 'round';
      for (const [lx, ly] of [[-11, 14], [11, 14], [-9, 10], [9, 10]] as const) {
        g.beginPath();
        g.moveTo(lx * 0.85, 2);
        g.lineTo(lx, ly);
        g.stroke();
      }
      // Woven rush seat, worn pale in the middle.
      rr(g, -13, -4, 26, 11, 3, '#d0b276');
      oval(g, 0, 1, 8, 3.5, shade('#d0b276', 0.14));
      // Ladder back, two slats and the posts.
      g.strokeStyle = wood;
      g.lineWidth = 3;
      g.beginPath();
      g.moveTo(-12, -4);
      g.lineTo(-12, -32);
      g.moveTo(12, -4);
      g.lineTo(12, -32);
      g.stroke();
      rr(g, -12, -31, 24, 4.5, 2, wood);
      rr(g, -12, -21, 24, 4.5, 2, shade(wood, -0.06));
      g.restore();
    });

    make('gattu', 1, (g, r) => {
      softShadow(g, 32, 52, 18, 5, 0.18);
      // The fruit bowl, ceramic, no longer in charge of fruit.
      oval(g, 32, 45, 19, 8, '#3a6d9c');
      oval(g, 32, 42, 17, 6, shade('#3a6d9c', 0.16));
      // Two lemons, demoted to pillows.
      dot(g, 17, 40, 4, '#e3cf49');
      dot(g, 47, 41, 3.6, '#d9c22e');
      // The cat, curled to the exact diameter of the bowl.
      const fur = r.chance(0.5) ? '#c98a5e' : '#8c8479';
      blob(g, 32, 35, 11, fur, r, 0.14);
      // Tail wrapped round like a signature.
      g.strokeStyle = shade(fur, -0.12);
      g.lineWidth = 4;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(42, 38);
      g.quadraticCurveTo(46, 30, 38, 27);
      g.stroke();
      // Head tucked, one ear up on duty.
      dot(g, 24, 31, 5.5, shade(fur, 0.06));
      g.fillStyle = shade(fur, -0.06);
      g.beginPath();
      g.moveTo(20, 28);
      g.lineTo(22, 22.5);
      g.lineTo(25, 27);
      g.closePath();
      g.fill();
      // Stripes and a shut eye.
      g.strokeStyle = shade(fur, -0.18);
      g.lineWidth = 1.6;
      for (const sx of [30, 35, 39]) {
        g.beginPath();
        g.moveTo(sx, 28);
        g.quadraticCurveTo(sx + 1, 32, sx, 36);
        g.stroke();
      }
      g.beginPath();
      g.moveTo(21.5, 31.5);
      g.quadraticCurveTo(23.5, 33, 25.5, 31.5);
      g.stroke();
    });

    make('campetto', 1, (g, r) => {
      // Chalk goal on the wall behind, ball at the base. No ink, no shadow:
      // chalk is not an object, it is a claim.
      const chalk = 'rgba(240,238,230,0.8)';
      g.strokeStyle = chalk;
      g.lineWidth = 2.6;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(13, 58);
      g.quadraticCurveTo(12 + r.next(), 38, 14, 18);
      g.quadraticCurveTo(30, 16.5, 46, 18);
      g.quadraticCurveTo(47 + r.next(), 38, 46, 58);
      g.stroke();
      // A few strokes of net, drawn by the optimist of the two.
      g.strokeStyle = 'rgba(240,238,230,0.32)';
      g.lineWidth = 1.2;
      for (let i = 0; i < 4; i++) {
        g.beginPath();
        g.moveTo(17 + i * 7, 20);
        g.lineTo(23 + i * 7, 54);
        g.stroke();
      }
      // The score: three tallies, then two with one crossed out and rewritten.
      g.strokeStyle = chalk;
      g.lineWidth = 2.2;
      for (let i = 0; i < 3; i++) {
        g.beginPath();
        g.moveTo(51 + i * 4, 22);
        g.lineTo(51.6 + i * 4, 30);
        g.stroke();
      }
      for (let i = 0; i < 2; i++) {
        g.beginPath();
        g.moveTo(51 + i * 4, 36);
        g.lineTo(51.6 + i * 4, 44);
        g.stroke();
      }
      // The dispute, in strikethrough.
      g.strokeStyle = 'rgba(240,238,230,0.55)';
      g.beginPath();
      g.moveTo(49, 42);
      g.lineTo(60, 38);
      g.stroke();
      g.strokeStyle = 'rgba(255,255,255,0.9)';
      g.beginPath();
      g.moveTo(53, 48);
      g.lineTo(53.8, 56);
      g.stroke();
      // The ball, waiting for jurisprudence.
      dot(g, 44, 86, 5.5, '#e8e4d6');
      dot(g, 42, 84.5, 1.8, '#3a3430');
      dot(g, 46.5, 87.5, 1.5, '#3a3430');
      oval(g, 44, 90, 6, 2, 'rgba(20,16,24,0.18)');
      // Penalty spot, regulation chalk.
      dot(g, 26, 84, 2, 'rgba(240,238,230,0.5)');
    }, 64, 96);

    make('pomodori', 1, (g, r) => {
      softShadow(g, 32, 90, 18, 5, 0.2);
      // An A-frame of old oars, strung with drying tomato bunches.
      const wood = '#6e5138';
      g.strokeStyle = wood;
      g.lineWidth = 4;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(14, 88);
      g.lineTo(27, 28);
      g.moveTo(50, 88);
      g.lineTo(37, 28);
      g.stroke();
      g.beginPath();
      g.moveTo(16, 38);
      g.lineTo(48, 38);
      g.stroke();
      for (const bx of [22, 32, 42]) {
        g.strokeStyle = '#8a7a5a';
        g.lineWidth = 1.4;
        g.beginPath();
        g.moveTo(bx, 38);
        g.lineTo(bx, 46);
        g.stroke();
        const reds = ['#b5443a', '#c1512f', '#8f3030'];
        for (let i = 0; i < 9; i++) {
          dot(g, bx + (r.next() - 0.5) * 8, 47 + r.next() * 20, 2.5, reds[r.int(3)] ?? '#b5443a');
        }
      }
    }, 64, 96);

    make('avvisi', 1, (g, r) => {
      softShadow(g, 32, 90, 19, 5, 0.2);
      const wood = '#5c4630';
      rr(g, 12, 50, 4, 38, 2, wood);
      rr(g, 48, 50, 4, 38, 2, wood);
      // The board, roofed like everything the parish owns.
      rr(g, 4, 16, 56, 8, 3, '#a8583a');
      rr(g, 6, 22, 52, 34, 3, '#6e5138');
      rr(g, 9, 25, 46, 28, 2, '#4a3a2c');
      // Notices: mass times, the festival bill with its red band, a small
      // handwritten one pinned at an angle of mild emergency.
      rr(g, 12, 28, 14, 11, 1, '#f2ede0');
      rr(g, 29, 27, 18, 15, 1, '#efe9dc');
      rect(g, 31, 29, 14, 3.4, '#b5443a');
      g.strokeStyle = 'rgba(58,74,99,0.6)';
      g.lineWidth = 1;
      for (let i = 0; i < 3; i++) {
        g.beginPath();
        g.moveTo(14, 31 + i * 2.6);
        g.lineTo(24, 31 + i * 2.6);
        g.moveTo(31, 35 + i * 2.4);
        g.lineTo(44, 35 + i * 2.4);
        g.stroke();
      }
      g.save();
      g.translate(20, 46);
      g.rotate(0.12 + (r.next() - 0.5) * 0.06);
      rr(g, -5, -4, 10, 8, 1, '#e8dcc4');
      g.strokeStyle = 'rgba(90,70,50,0.6)';
      g.beginPath();
      g.moveTo(-3, -1);
      g.lineTo(3, -1);
      g.moveTo(-3, 1.6);
      g.lineTo(2, 1.6);
      g.stroke();
      g.restore();
      // Pins.
      dot(g, 19, 27, 1.2, '#b5443a');
      dot(g, 38, 26, 1.2, '#3a6d9c');
      dot(g, 20, 42, 1.2, '#b5443a');
    }, 64, 96);

    make('limoni', 3, (g, r) => {
      // Windfall lemons: no outline, no shadow, just fruit met with grass.
      const n = 2 + r.int(2);
      for (let i = 0; i < n; i++) {
        const x = 14 + r.int(36);
        const y = 26 + r.int(24);
        oval(g, x, y + 3.5, 6, 2, 'rgba(30,40,20,0.18)');
        oval(g, x, y, 5.5, 4.2, i % 2 ? '#e3cf49' : '#d9c22e', (r.next() - 0.5) * 0.8);
        dot(g, x + 3.4, y - 1.4, 1, 'rgba(255,250,220,0.7)');
      }
      if (r.chance(0.6)) oval(g, 20 + r.int(24), 30 + r.int(16), 4, 1.6, '#5f7a44', r.next());
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

    make('lavagna', 1, (g) => {
      // The score blackboard: NOI on the left, LORO on the right, forever.
      rr(g, 8, 18, 48, 62, 3, '#6e5138');
      rr(g, 12, 22, 40, 54, 2, '#2e3330');
      // Ghosts of erased seasons under tonight's chalk.
      rr(g, 15, 40, 16, 10, 2, 'rgba(200,200,195,0.08)');
      rr(g, 34, 55, 14, 12, 2, 'rgba(200,200,195,0.08)');
      const chalk = 'rgba(238,236,228,0.8)';
      g.strokeStyle = chalk;
      g.lineWidth = 1.8;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(32, 26);
      g.lineTo(32, 72);
      g.stroke();
      // Headers: two scribbles standing in for the eternal teams.
      g.beginPath();
      g.moveTo(16, 28);
      g.quadraticCurveTo(22, 26.5, 28, 28);
      g.moveTo(36, 28);
      g.quadraticCurveTo(42, 26.5, 48, 28);
      g.stroke();
      // Tonight's tallies, gate style, one side already smug.
      for (let i = 0; i < 4; i++) {
        g.beginPath();
        g.moveTo(16 + i * 3.4, 34);
        g.lineTo(16.6 + i * 3.4, 42);
        g.stroke();
      }
      g.beginPath();
      g.moveTo(14.5, 41);
      g.lineTo(28, 35);
      g.stroke();
      for (let i = 0; i < 3; i++) {
        g.beginPath();
        g.moveTo(37 + i * 3.4, 34);
        g.lineTo(37.6 + i * 3.4, 42);
        g.stroke();
      }
      // Older rows, fading with dignity.
      g.strokeStyle = 'rgba(238,236,228,0.35)';
      for (let i = 0; i < 5; i++) {
        g.beginPath();
        g.moveTo(15 + i * 3.2, 52);
        g.lineTo(15.6 + i * 3.2, 58);
        g.stroke();
      }
      // Chalk ledge, one stub, one rag beyond hope.
      rr(g, 10, 78, 44, 4.5, 2, '#8a6a3a');
      rr(g, 20, 74.5, 6, 3.4, 1.5, '#efe9dc');
      oval(g, 42, 77, 6, 2.4, '#8c8479');
    }, 64, 96);

    make('ventola', 1, (g) => {
      softShadow(g, 32, 90, 12, 4, 0.16);
      // The standing fan, member since 1968, tilted mid-argument.
      g.save();
      g.translate(32, 86);
      g.rotate(0.05);
      oval(g, 0, 0, 11, 3.5, '#3a3430');
      g.strokeStyle = '#7a838a';
      g.lineWidth = 3.4;
      g.beginPath();
      g.moveTo(0, -2);
      g.lineTo(0, -34);
      g.stroke();
      // The cage, chrome that remembers being shiny.
      g.strokeStyle = '#9aa6ab';
      g.lineWidth = 2;
      g.beginPath();
      g.arc(0, -48, 14, 0, Math.PI * 2);
      g.stroke();
      g.lineWidth = 1;
      g.beginPath();
      g.arc(0, -48, 9, 0, Math.PI * 2);
      g.stroke();
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        g.beginPath();
        g.moveTo(Math.cos(a) * 3.4, -48 + Math.sin(a) * 3.4);
        g.lineTo(Math.cos(a) * 13.4, -48 + Math.sin(a) * 13.4);
        g.stroke();
      }
      // Blades at rest behind the wire, and the hub.
      oval(g, -5, -44, 6, 3, 'rgba(154,166,171,0.5)', 0.6);
      oval(g, 5, -52, 6, 3, 'rgba(154,166,171,0.5)', 0.6);
      dot(g, 0, -48, 3.4, '#6b7378');
      g.restore();
    }, 64, 96);

    make('banco', 3, (g, _r, i) => {
      softShadow(g, 32, 92, 26, 6, 0.2);
      // The circolo's bar: a run of dark wood with a zinc top gone soft with
      // sixty years of wiping. Three variants so a three-cell counter is one
      // counter and not the same cell printed three times.
      const wood = '#5c3f2a';
      rr(g, 0, 52, 64, 40, 2, wood);
      vgrad(g, 0, 52, 64, 18, 'rgba(255,236,200,0.10)', 'rgba(0,0,0,0)');
      // Panelled front, the beading that every bar in Sicily has.
      g.strokeStyle = 'rgba(28,18,10,0.35)';
      g.lineWidth = 1.6;
      for (const px of [12, 32, 52]) {
        g.beginPath();
        g.moveTo(px, 60);
        g.lineTo(px, 88);
        g.stroke();
      }
      // The zinc top, and the brass rail along its lip.
      rr(g, -2, 44, 68, 11, 3, '#9aa6ab');
      vgrad(g, -2, 44, 68, 6, 'rgba(255,255,255,0.42)', 'rgba(0,0,0,0)');
      rr(g, -2, 54, 68, 3, 1.5, '#b08a48');
      // What is standing on it depends which stretch of counter this is.
      if (i === 0) {
        // Cups upended on a folded cloth, waiting to be needed.
        rr(g, 10, 36, 26, 8, 3, '#d9d3c4');
        for (const cx of [16, 25, 34]) {
          rr(g, cx - 4, 30, 8, 7, 2, PAL.cream);
          oval(g, cx, 30, 4, 1.6, shade(PAL.cream, -0.12));
        }
      } else if (i === 1) {
        // The amaro bottle nobody has bought and everybody has poured from.
        rr(g, 26, 22, 9, 22, 3, '#3f2a18');
        rr(g, 28.5, 14, 4, 10, 2, '#3f2a18');
        rr(g, 26, 30, 9, 7, 1, '#c9a35f');
        dot(g, 30.5, 13, 2.2, '#8a6a3a');
        // and one glass of water, the way espresso is properly served.
        rr(g, 42, 32, 7, 12, 2, 'rgba(214,228,232,0.75)');
      } else {
        // The till end: a saucer of receipts, a lemon, a pack of cards.
        oval(g, 20, 40, 9, 3.4, '#cfc8ba');
        rr(g, 14, 34, 12, 6, 1, '#efe9dc');
        dot(g, 40, 38, 6, '#d8c04a');
        dot(g, 38.5, 36, 1.8, 'rgba(255,255,255,0.5)');
        rr(g, 48, 34, 10, 8, 1.5, '#b5443a');
        rr(g, 50, 32, 10, 8, 1.5, PAL.cream);
      }
    }, 64, 96);

    make('lampadario', 1, (g) => {
      // The one bulb over the card table, on a flex that has been shortened
      // twice. Everything else in the room is lit by whatever it spills.
      g.strokeStyle = '#3a3430';
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(32, 0);
      g.lineTo(32, 20);
      g.stroke();
      // The enamel shade: green outside, white and bounced inside.
      g.fillStyle = '#4d6b52';
      g.beginPath();
      g.moveTo(32, 18);
      g.lineTo(52, 40);
      g.lineTo(12, 40);
      g.closePath();
      g.fill();
      g.fillStyle = 'rgba(255,244,214,0.30)';
      g.beginPath();
      g.moveTo(32, 24);
      g.lineTo(46, 39);
      g.lineTo(18, 39);
      g.closePath();
      g.fill();
      rr(g, 12, 38, 40, 4, 2, shade('#4d6b52', -0.2));
      // The bulb, and the pool of light it throws onto the cards below.
      dot(g, 32, 45, 6, '#ffe6ac');
      glowSpot(g, 32, 46, 30, 'rgba(255,214,138,0.55)', 0.85);
      glowSpot(g, 32, 74, 26, 'rgba(255,204,128,0.28)', 0.6);
    }, 64, 96);

    // ------------------------------------------------------- the circolo

    /**
     * The circolo's wall: calce, whitewash slapped on over lava-stone block
     * every spring, with the sea-green oil dado every bar, barbershop and
     * parish hall in Sicily wears up to shoulder height. The plaster and the
     * basalt bones under it are `casedda`'s own (`#e6d3ac`, `#3a3540`), so
     * the room agrees with the street it opens onto.
     */
    make('wallCalce', 10, (g, r, i) => {
      const calce = '#e8e2d0';
      const oil = '#6f8f82';
      vgrad(g, 0, 0, S, S, shade(calce, 0.03), shade(calce, -0.06));
      // Brushed on by hand: the streaks never lie flat.
      for (let i = 0; i < 5; i++) {
        vgrad(g, r.int(S), 0, 6 + r.int(10), 34, 'rgba(252,248,238,0.24)', 'rgba(0,0,0,0)');
      }
      // The oil dado, and the black line ruled along the top of it.
      rect(g, 0, 34, S, 30, shade(oil, -0.02));
      vgrad(g, 0, 34, S, 6, 'rgba(255,255,255,0.14)', 'rgba(0,0,0,0)');
      rect(g, 0, 32.5, S, 2, '#3a3540');
      // Where the whitewash has come off, the basalt shows through, black.
      if (r.chance(0.5)) oval(g, r.int(S), 8 + r.int(20), 7, 4, 'rgba(58,53,64,0.2)');
      // Four in ten: a circolo hangs things sparsely and never moves them.
      const deco = i < 4 ? i : -1;
      if (deco === 0) {
        // The tournament board: names in chalk, and last year's still on it.
        rr(g, 12, 6, 40, 24, 1.5, '#2f2b34');
        g.strokeStyle = 'rgba(230,226,212,0.6)';
        g.lineWidth = 1.2;
        for (const ly of [12, 17, 22, 27]) { g.beginPath(); g.moveTo(16, ly); g.lineTo(40 + r.int(8), ly); g.stroke(); }
        g.beginPath(); g.moveTo(32, 6); g.lineTo(32, 30); g.stroke();
      } else if (deco === 1) {
        // A saint's card and a photo of a boat, both slightly crooked.
        rr(g, 14, 8, 15, 20, 1, '#f2ead8');
        rr(g, 16.5, 11, 10, 12, 0.8, '#8fb4c4');
        dot(g, 21.5, 15, 3, '#e8c25a');
        rr(g, 36, 11, 18, 14, 1, '#f2ead8');
        rr(g, 38, 13, 14, 10, 0.8, '#3f6b8a');
        rr(g, 41, 18, 8, 3, 1, '#d9853f');
      } else if (deco === 2) {
        // A window with the shutters pulled to against the afternoon.
        rr(g, 16, 4, 32, 26, 2, '#5f7a44');
        rr(g, 19, 7, 26, 20, 1.5, shade('#5f7a44', 0.12));
        g.strokeStyle = 'rgba(40,54,32,0.55)';
        g.lineWidth = 1.6;
        for (let sy = 10; sy < 27; sy += 4) { g.beginPath(); g.moveTo(19, sy); g.lineTo(45, sy); g.stroke(); }
        // The one blade of Sicilian light that gets through anyway.
        rect(g, 31, 7, 2.4, 20, '#f6ecc8');
      } else if (deco === 3) {
        // A row of pegs, one cap, one jacket nobody has claimed since March.
        rr(g, 6, 24, 52, 3, 1.5, '#5c3f2a');
        for (let k = 0; k < 4; k++) dot(g, 12 + k * 13, 28, 2, '#5c3f2a');
        oval(g, 25, 22, 8, 4.4, '#3f4a56');
        rr(g, 44, 28, 12, 18, 3, '#4a5560');
      }
    });

    /**
     * Graniglia: chips of marble set in cement and ground flat, the floor of
     * every Italian room built between the wars. It is cold, it is loud, and
     * it has outlived four generations of scopa players.
     */
    make('floorGraniglia', 5, (g, r) => {
      const base = '#c9c2b0';
      rect(g, 0, 0, S, S, base);
      // The chips: grey, ox-blood and lava black, scattered not spaced.
      // Chips, not confetti: at 64px a terrazzo chip is barely a pixel and
      // a shade off its bed. Anything bigger reads as a party.
      const chips = ['#b3ab9c', '#c0a294', '#a49f9e', '#d6d0c0'];
      for (let i = 0; i < 16; i++) {
        oval(g, r.int(S), r.int(S), 0.8 + r.next(), 0.7 + r.next() * 0.7, chips[r.int(4)] ?? '#b3ab9c');
      }
      // Tile joints, on two of five variants, so a floor reads as laid.
      if (r.chance(0.45)) {
        g.strokeStyle = 'rgba(120,114,102,0.3)';
        g.lineWidth = 1.4;
        g.beginPath(); g.moveTo(0, 32); g.lineTo(S, 32); g.moveTo(32, 0); g.lineTo(32, S); g.stroke();
      }
      if (r.chance(0.4)) oval(g, r.int(S), r.int(S), 15, 6, 'rgba(255,250,236,0.09)');
    });

    /** A pezzara: strips of worn shirt woven into a runner, because nobody
     * in this room has ever thrown cloth away. */
    make('rugPezzara', 2, (g, r) => {
      const warp = '#cbbfa6';
      rect(g, 0, 0, S, S, warp);
      // Four wide strips, not twelve narrow ones: at this scale a fine
      // stripe reads as a barcode and a wide one reads as cloth.
      const rags = ['#9d6b5e', '#6b8296', '#c2ac82', '#84998f'];
      for (let y = 0; y < S; y += 16) {
        const c = rags[Math.floor(y / 16) % 4] ?? '#9d6b5e';
        rect(g, 0, y, S, 15, shade(c, r.chance(0.4) ? -0.05 : 0.02));
        rect(g, 0, y + 6, S, 2.4, shade(c, 0.14));
      }
      // The warp showing through where it is worn thin.
      g.strokeStyle = 'rgba(230,224,208,0.2)';
      g.lineWidth = 1;
      for (let x = 3; x < S; x += 6) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, S); g.stroke(); }
      if (r.chance(0.5)) oval(g, r.int(S), r.int(S), 12, 6, 'rgba(40,32,24,0.1)');
    });
  },
};
