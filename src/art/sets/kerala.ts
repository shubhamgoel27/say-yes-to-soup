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
    'nilavilakku', 'jacktree', 'peppervine', 'oars', 'spicesacks', 'postbox',
    'cricketwall', 'posterwall', 'lungiline', 'busstop',
    'kallupalm', 'vaikkol', 'cheenavala',
  ],
  buildings: ['veedu'],
  windows: {
    veedu: [
      [15, -10],
      [67, -10],
    ],
  },
  glows: ['thattukada', 'aduppu', 'nilavilakku'],
  noInk: ['huskpile', 'hyacinth', 'waterlily', 'anthill', 'fallennut', 'tennisball', 'keralacat', 'chappals'],

  paint(make) {
    // ---------------------------------------------------------- grounds

    // Pokkali paddy: salt-tolerant rice standing in monsoon water. One field,
    // two harvests; rice now, prawns when the tide is invited in.
    // Chappals off at the threshold: the plainest sign in the subcontinent
    // that a house is open and you are meant to walk in. The task says "the
    // veedu with the open door", and this is that cue, visible by daylight.
    make('chappals', 3, (g, r) => {
      // A swept, water-darkened doorstep the slippers sit on.
      g.fillStyle = 'rgba(92,64,42,0.16)';
      g.beginPath();
      g.ellipse(S / 2, S * 0.62, S * 0.42, S * 0.22, 0, 0, Math.PI * 2);
      g.fill();
      const pair = (px: number, py: number, c1: string, c2: string, tilt: number) => {
        for (const dx of [-6, 6]) {
          g.save();
          g.translate(px + dx, py);
          g.rotate(tilt + (dx > 0 ? 0.12 : -0.12));
          oval(g, 0, 1.5, 5.5, 9, 'rgba(40,28,18,0.22)'); // its own small shadow
          oval(g, 0, 0, 5, 8.5, c1);
          oval(g, 0, -2.5, 3.6, 5.2, shade(c1, 0.1));
          // The toe strap, the part everyone recognises.
          g.strokeStyle = c2;
          g.lineWidth = 1.8;
          g.lineCap = 'round';
          g.beginPath();
          g.moveTo(-3.4, -1.5);
          g.quadraticCurveTo(0, -6.5, 3.4, -1.5);
          g.stroke();
          g.restore();
        }
      };
      pair(S * 0.34, S * 0.6, '#8a5a3c', '#d9a441', -0.2 + r.next() * 0.1);
      pair(S * 0.66, S * 0.68, '#4a6b7c', '#e8dcc4', 0.24 - r.next() * 0.1);
    });

    make('paddy', 4, (g, r) => {
      // A flooded field, and it has to LOOK flooded: painted the same green
      // as the walkable grass beside it, this solid ground read as an
      // invisible wall eight tiles wide. Water first, rice second.
      const base = '#4d6f62';
      rect(g, 0, 0, S, S, base);
      // The sheet of standing water, holding a pale sky.
      for (let i = 0; i < 5; i++) {
        const yy = r.int(S);
        vgrad(g, 0, yy, S, 5 + r.int(4), 'rgba(206,228,232,0.34)', 'rgba(0,0,0,0)');
      }
      // Wind ripple, the giveaway that this is a surface and not a lawn.
      // Kept sparse and low contrast: three per tile starts reading as
      // corduroy once the field is eight tiles wide.
      g.strokeStyle = 'rgba(226,240,240,0.16)';
      g.lineWidth = 1.1;
      for (let i = 0; i < 2; i++) {
        const yy = 10 + r.int(S - 20);
        g.beginPath();
        g.moveTo(0, yy);
        g.bezierCurveTo(S * 0.3, yy - 3.5, S * 0.7, yy + 3.5, S, yy);
        g.stroke();
      }
      // Young rice in loose rows.
      for (const row of [10 + r.int(6), 30 + r.int(8), 52 + r.int(6)]) {
        for (let x = 6 + r.int(6); x < S; x += 12 + r.int(6)) {
          const lean = (r.next() - 0.5) * 5;
          g.strokeStyle = shade(r.chance(0.5) ? '#6f9e52' : '#7fae5e', (r.next() - 0.5) * 0.1);
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

    // The toddy palm: notched all the way up, a rope loop for the feet, and
    // a pot lashed at the crown filling itself while everyone sleeps.
    make('kallupalm', 2, (g, r) => {
      softShadow(g, 34, 122, 22, 5, 0.22);
      const lean = (r.next() - 0.5) * 10;
      const topX = 34 + lean;
      const topY = 30;
      g.strokeStyle = '#7f6142';
      g.lineWidth = 7.5;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(32, 122);
      g.quadraticCurveTo(30 - lean * 0.6, 76, topX, topY);
      g.stroke();
      // The notches: sixty years of somebody's feet, cut two hands apart.
      g.strokeStyle = 'rgba(48,34,20,0.55)';
      g.lineWidth = 2.2;
      for (let t = 0.08; t < 0.94; t += 0.075) {
        const ix = 32 + (topX - 32) * t + (30 - lean * 0.6 - 32) * 2 * t * (1 - t);
        const iy = 122 - (122 - topY) * t - 10 * t * (1 - t);
        g.beginPath();
        g.moveTo(ix - 5, iy + 1);
        g.lineTo(ix + 5, iy - 1.5);
        g.stroke();
      }
      // The climbing rope, coiled at the foot where it was dropped.
      g.strokeStyle = '#b8a06a';
      g.lineWidth = 2.4;
      g.beginPath(); g.arc(20, 114, 7, 0, Math.PI * 2); g.stroke();
      g.beginPath(); g.arc(20, 114, 3.6, 0, Math.PI * 2); g.stroke();
      // Crown: fewer fronds than a coconut palm, and higher.
      for (let i = 0; i < 8; i++) {
        const a = -Math.PI * 0.95 + (i / 7) * Math.PI * 0.95;
        const fx = topX + Math.cos(a) * 24;
        const fy = topY + Math.sin(a) * 12 + 9;
        g.strokeStyle = shade(i % 2 ? '#48693c' : '#587f44', (r.next() - 0.5) * 0.1);
        g.lineWidth = 3.2;
        g.beginPath();
        g.moveTo(topX, topY);
        g.quadraticCurveTo((topX + fx) / 2, topY - 11, fx, fy + 7);
        g.stroke();
      }
      // The pot, lashed under the cut spathe, filling all night.
      const px = topX + 12;
      g.strokeStyle = '#8a7038';
      g.lineWidth = 1.8;
      g.beginPath(); g.moveTo(topX + 4, topY + 4); g.lineTo(px, topY + 12); g.stroke();
      oval(g, px, topY + 20, 8, 9.5, '#8c5a3c');
      oval(g, px - 2.5, topY + 17, 3, 3.4, shade('#8c5a3c', 0.24));
      oval(g, px, topY + 12.5, 5.6, 2.6, '#6d4530');
      oval(g, px, topY + 12, 4, 1.8, '#3b2618');
    }, 64, 128);

    // Vaikkol: the straw stack. Pokkali stubble twisted round a pole and
    // combed down, so the first rain runs off it instead of in.
    make('vaikkol', 3, (g, r) => {
      softShadow(g, 32, 90, 26, 7, 0.24);
      const straw = shade('#c9a24e', (r.next() - 0.5) * 0.09);
      // The body: a fat cone, wider at the shoulder than the foot.
      g.fillStyle = straw;
      g.beginPath();
      g.moveTo(6, 90);
      g.quadraticCurveTo(2, 56, 32, 20);
      g.quadraticCurveTo(62, 56, 58, 90);
      g.closePath();
      g.fill();
      vgrad(g, 4, 24, 56, 30, 'rgba(255,244,205,0.35)', 'rgba(0,0,0,0)');
      vgrad(g, 4, 66, 56, 24, 'rgba(0,0,0,0)', 'rgba(74,54,24,0.34)');
      // Combed straw, running the way the rain will.
      g.strokeStyle = 'rgba(122,92,36,0.4)';
      g.lineWidth = 1.3;
      for (let k = 0; k < 15; k++) {
        const sx = 6 + k * 3.4;
        g.beginPath();
        g.moveTo(sx, 88);
        g.quadraticCurveTo(32 + (sx - 32) * 0.5, 48, 32 + (sx - 32) * 0.22, 24);
        g.stroke();
      }
      // The rope belt that keeps a monsoon from unwinding it.
      g.strokeStyle = '#8a7038';
      g.lineWidth = 2.4;
      g.beginPath(); g.moveTo(9, 68); g.quadraticCurveTo(32, 74, 55, 68); g.stroke();
      g.beginPath(); g.moveTo(15, 46); g.quadraticCurveTo(32, 51, 49, 46); g.stroke();
      // The pole coming out of the top, and its rag.
      g.strokeStyle = '#6f5636';
      g.lineWidth = 3.4;
      g.beginPath(); g.moveTo(32, 24); g.lineTo(33, 4); g.stroke();
      if (r.chance(0.6)) {
        g.fillStyle = r.chance(0.5) ? '#c1512f' : '#3f7fb0';
        g.beginPath(); g.moveTo(33, 5); g.lineTo(46, 9); g.lineTo(33, 13); g.closePath(); g.fill();
      }
      // Loose straw at the foot, where the stack was fed.
      for (let k = 0; k < 7; k++) {
        oval(g, 6 + r.int(52), 86 + r.int(6), 5, 1.6, shade(straw, -0.12), (r.next() - 0.5) * 0.8);
      }
    }, 64, 96);

    // The cheena vala: the cantilever net, counterweighted with stones, dipped
    // and raised by four men and a great deal of shouting. The landmark you
    // can see from anywhere on this map, and steer home by.
    make('cheenavala', 2, (g, r) => {
      softShadow(g, 118, 152, 34, 8, 0.24);
      softShadow(g, 62, 150, 22, 6, 0.18);
      const teak = '#6b4a2c';
      const pole = (x1: number, y1: number, x2: number, y2: number, w: number, c: string) => {
        g.strokeStyle = c;
        g.lineWidth = w;
        g.lineCap = 'round';
        g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke();
      };
      // The net first, so every timber lands on top of it.
      const NA: [number, number] = [10, 60];
      const NB: [number, number] = [96, 30];
      const NC: [number, number] = [104, 108];
      const ND: [number, number] = [18, 128];
      g.save();
      g.beginPath();
      g.moveTo(NA[0], NA[1]); g.lineTo(NB[0], NB[1]); g.lineTo(NC[0], NC[1]); g.lineTo(ND[0], ND[1]);
      g.closePath();
      g.fillStyle = 'rgba(196,208,190,0.16)';
      g.fill();
      g.clip();
      g.strokeStyle = 'rgba(74,96,80,0.75)';
      g.lineWidth = 1.5;
      for (let k = -8; k <= 14; k++) {
        g.beginPath(); g.moveTo(k * 11, 8); g.quadraticCurveTo(52, 78, k * 11 + 34, 148); g.stroke();
        g.beginPath(); g.moveTo(k * 11 + 34, 8); g.quadraticCurveTo(52, 78, k * 11, 148); g.stroke();
      }
      g.restore();
      // The four spreader arms that hold the net's mouth open.
      pole(NA[0], NA[1], NB[0], NB[1], 3.4, shade(teak, 0.12));
      pole(NB[0], NB[1], NC[0], NC[1], 3.4, shade(teak, 0.06));
      pole(NC[0], NC[1], ND[0], ND[1], 3.4, shade(teak, 0.12));
      pole(ND[0], ND[1], NA[0], NA[1], 3.4, shade(teak, 0.06));
      // The cantilever arm, out from the frame over the water.
      pole(120, 66, 52, 76, 7, teak);
      g.strokeStyle = 'rgba(200,186,150,0.85)';
      g.lineWidth = 1.8;
      for (const [ax, ay] of [NA, NB, NC, ND]) {
        g.beginPath(); g.moveTo(52, 76); g.lineTo(ax, ay); g.stroke();
      }
      // The A-frame: two legs into the mud, a platform between them.
      pole(104, 152, 122, 62, 8, teak);
      pole(150, 150, 128, 62, 8, shade(teak, -0.08));
      pole(108, 116, 146, 112, 5, shade(teak, -0.05));
      rr(g, 98, 118, 62, 9, 3, shade(teak, 0.16));
      g.strokeStyle = 'rgba(50,34,18,0.4)';
      g.lineWidth = 1.4;
      for (let k = 0; k < 6; k++) {
        g.beginPath(); g.moveTo(102 + k * 11, 118); g.lineTo(102 + k * 11, 127); g.stroke();
      }
      // The counterweight stones, hung at the tail, sized entirely by argument.
      g.strokeStyle = 'rgba(210,196,160,0.85)';
      g.lineWidth = 1.6;
      for (let k = 0; k < 5; k++) {
        const sx = 132 + k * 9;
        const sy = 74 + (k % 2) * 8;
        g.beginPath(); g.moveTo(sx, 64 + k * 2); g.lineTo(sx, sy + 3); g.stroke();
        oval(g, sx, sy + 12, 7, 8.5, shade('#8c8479', (r.next() - 0.5) * 0.2));
        oval(g, sx - 2, sy + 9, 2.6, 3, shade('#8c8479', 0.2));
      }
      // The hauling rope down to its cleat, worn shiny by forty years of palms.
      g.strokeStyle = 'rgba(215,200,160,0.9)';
      g.lineWidth = 2;
      g.beginPath(); g.moveTo(122, 64); g.quadraticCurveTo(132, 96, 118, 116); g.stroke();
      // A lamp on the platform post, for the night lifts.
      oval(g, 152, 104, 6, 7.5, '#c9b48a');
      oval(g, 152, 104, 4, 5.4, '#f6dfa2');
      glowSpot(g, 152, 104, 16, '#ffefc0', 0.6);
      // A basket of the morning's catch, mostly optimism.
      oval(g, 136, 138, 12, 6, '#a58a5c');
      oval(g, 136, 135, 10, 4.4, '#8c7448');
      for (let k = 0; k < 4; k++) oval(g, 131 + k * 3.6, 134, 3.4, 1.4, '#b9c6ca', (r.next() - 0.5) * 0.6);
    }, 192, 160);

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

    // ------------------------------------------------- the love pass: talls

    // The nilavilakku: the brass lamp by the doorway, lit at dusk without
    // fail. In `glows`, so its small flame does its enormous job at night.
    make('nilavilakku', 1, (g) => {
      softShadow(g, 32, 90, 13, 4, 0.22);
      const brass = '#c8973b';
      // Foot: stacked discs.
      oval(g, 32, 86, 13, 4.5, shade(brass, -0.14));
      oval(g, 32, 83, 10, 3.5, brass);
      oval(g, 32, 80, 6.5, 2.6, shade(brass, 0.1));
      // Stem with a knop at the waist.
      rr(g, 29.5, 54, 5, 28, 2.5, shade(brass, -0.06));
      oval(g, 32, 68, 6, 2.8, brass);
      // The oil bowl, lip flared for five wicks.
      oval(g, 32, 52, 11, 4.5, shade(brass, -0.1));
      oval(g, 32, 49.5, 11, 4, shade(brass, 0.08));
      oval(g, 32, 48, 7.5, 2.8, shade(brass, -0.2));
      // Polish catches the light down one side.
      g.strokeStyle = 'rgba(255,240,200,0.5)';
      g.lineWidth = 1.6;
      g.beginPath();
      g.moveTo(30, 58);
      g.lineTo(30, 78);
      g.stroke();
      // The flame, small and certain.
      glowSpot(g, 32, 42, 10, '#ffca6a', 0.5);
      g.fillStyle = '#ffd98c';
      g.beginPath();
      g.moveTo(32, 36);
      g.quadraticCurveTo(35.4, 43, 32, 46.5);
      g.quadraticCurveTo(28.6, 43, 32, 36);
      g.fill();
      dot(g, 32, 44, 1.6, '#fff3d0');
    }, 64, 96);

    // The jackfruit tree: fruit straight off the trunk, the size of good
    // luggage, admired from a radius the whole village agrees on.
    make('jacktree', 2, (g, r) => {
      softShadow(g, 32, 122, 24, 5, 0.22);
      // Stout trunk.
      g.strokeStyle = '#6f5238';
      g.lineWidth = 10;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(33, 122);
      g.quadraticCurveTo(30, 88, 31, 52);
      g.stroke();
      // Dense, dark canopy.
      blob(g, 20, 48, 13, '#4d7440', r, 0.25);
      blob(g, 45, 46, 14, '#38592f', r, 0.25);
      blob(g, 32, 36, 17, '#3f6636', r, 0.24);
      blob(g, 32, 24, 12, '#4d7440', r, 0.26);
      blob(g, 16, 34, 9, '#38592f', r, 0.25);
      blob(g, 48, 32, 9, '#4d7440', r, 0.25);
      // The jackfruit, frank and enormous, hanging on the trunk itself.
      for (const [fx, fy, s] of [[27, 80, 1], [37, 95, 0.85]] as const) {
        g.strokeStyle = '#5a4630';
        g.lineWidth = 2.4;
        g.beginPath();
        g.moveTo(fx, fy - 12 * s);
        g.lineTo(fx + 2, fy - 16 * s);
        g.stroke();
        oval(g, fx, fy, 7.5 * s, 11 * s, shade('#9aa14f', (r.next() - 0.5) * 0.08));
        oval(g, fx - 2 * s, fy - 2 * s, 5 * s, 8 * s, shade('#a8ae59', 0.04));
        // Pebbled rind.
        g.fillStyle = 'rgba(90,100,50,0.5)';
        for (let i = 0; i < 14; i++) {
          const a = r.next() * Math.PI * 2;
          const rad = r.next() * 6 * s;
          g.fillRect(fx + Math.cos(a) * rad, fy + Math.sin(a) * rad * 1.4, 1.4, 1.4);
        }
      }
    }, 64, 128);

    // Pepper on an areca: the vine that towed Roman ships, now climbing a
    // thin palm at its own pace.
    make('peppervine', 2, (g, r) => {
      softShadow(g, 32, 90, 15, 4, 0.2);
      // Slim ringed trunk.
      g.strokeStyle = '#9c8468';
      g.lineWidth = 5;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(33, 90);
      g.quadraticCurveTo(31, 60, 32, 26);
      g.stroke();
      g.strokeStyle = 'rgba(90,70,48,0.4)';
      g.lineWidth = 1.2;
      for (let yy = 34; yy < 88; yy += 7) {
        g.beginPath();
        g.moveTo(29.5, yy);
        g.lineTo(35.5, yy - 1);
        g.stroke();
      }
      // A modest crown.
      for (let i = 0; i < 5; i++) {
        const a = -Math.PI * 0.9 + (i / 4) * Math.PI * 0.8;
        g.strokeStyle = shade('#5f8a4a', (r.next() - 0.5) * 0.1);
        g.lineWidth = 2.6;
        g.beginPath();
        g.moveTo(32, 26);
        g.quadraticCurveTo(32 + Math.cos(a) * 8, 20, 32 + Math.cos(a) * 15, 24 + Math.sin(a) * 7 + 6);
        g.stroke();
      }
      // The vine, spiraling: in front, behind, in front.
      g.strokeStyle = '#3f6636';
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(38, 88);
      g.bezierCurveTo(24, 78, 42, 66, 28, 56);
      g.bezierCurveTo(40, 48, 26, 40, 34, 32);
      g.stroke();
      // Heart leaves along the climb, alternating sides.
      for (const [lx, ly, flip] of [[39, 84, 1], [26, 74, -1], [41, 63, 1], [25, 52, -1], [39, 44, 1], [28, 35, -1]] as const) {
        const c = shade('#4d7440', (r.next() - 0.5) * 0.1);
        oval(g, lx, ly, 5.2, 3.8, c, flip * 0.6);
        oval(g, lx - flip * 2, ly + 2, 3.6, 2.6, shade(c, 0.08), flip * 0.4);
      }
      // Berry spikes: small green chains, patience in fruit form.
      for (const [bx, by] of [[24, 68], [41, 50]] as const) {
        for (let i = 0; i < 4; i++) dot(g, bx, by + i * 3, 1.5, i % 2 ? '#6f9b52' : '#5f8a4a');
      }
    }, 64, 96);

    // Oars by the jetty, propped in a lean cluster, blades up. None labeled,
    // all somebody's; everybody simply knows.
    make('oars', 2, (g, r) => {
      softShadow(g, 32, 90, 20, 5, 0.2);
      // A stout mooring post to lean on.
      rr(g, 29, 54, 7, 36, 3, '#5c4630');
      oval(g, 32.5, 55, 3.8, 2.2, '#7d5e3c');
      // Three paddles leaning together, tallest in the middle.
      const spec: [number, number, number][] = [
        [18, 12, 30], // baseX, topX, topY
        [30, 27, 18],
        [44, 47, 26],
      ];
      for (let i = 0; i < 3; i++) {
        const [bx0, tx0, ty0] = spec[i] ?? [30, 27, 18];
        const bx = bx0 + r.int(3);
        const tx = tx0 + r.int(3);
        const ty = ty0 + r.int(4);
        const wood = shade(i === 1 ? '#9c7a4c' : '#8a6a44', (r.next() - 0.5) * 0.1);
        // Shaft.
        g.strokeStyle = shade(wood, -0.1);
        g.lineWidth = 3.2;
        g.lineCap = 'round';
        g.beginPath();
        g.moveTo(bx, 88);
        g.lineTo(tx, ty + 14);
        g.stroke();
        // Blade: long leaf shape continuing the shaft's line.
        const ang = Math.atan2(ty + 14 - 88, tx - bx);
        const bxc = tx + Math.cos(ang) * 9;
        const byc = ty + 14 + Math.sin(ang) * 9;
        oval(g, bxc, byc, 5.5, 12, wood, ang + Math.PI / 2);
        // Midrib catching the light.
        g.strokeStyle = shade(wood, 0.18);
        g.lineWidth = 1.2;
        g.beginPath();
        g.moveTo(bxc - Math.cos(ang) * 8, byc - Math.sin(ang) * 8);
        g.lineTo(bxc + Math.cos(ang) * 8, byc + Math.sin(ang) * 8);
        g.stroke();
      }
    }, 64, 96);

    // Cardamom sacks under blue tarpaulin at the jetty office, counted twice
    // daily by a man who never appears to count.
    make('spicesacks', 2, (g, r) => {
      softShadow(g, 32, 90, 28, 6, 0.22);
      const jute = shade('#b09468', (r.next() - 0.5) * 0.06);
      // A low, wide pile: back row under canvas, front row owning up to it.
      rr(g, 12, 52, 20, 24, 8, shade(jute, -0.1));
      rr(g, 32, 52, 20, 24, 8, shade(jute, -0.14));
      rr(g, 4, 64, 22, 24, 8, shade(jute, 0.04));
      rr(g, 24, 66, 20, 22, 8, jute);
      rr(g, 42, 64, 19, 24, 8, shade(jute, -0.04));
      // Ear corners where the sacks were tied off.
      oval(g, 8, 64, 3, 4, shade(jute, -0.08), -0.5);
      oval(g, 58, 64, 3, 4, shade(jute, -0.12), 0.5);
      // Jute weave hints on the front row.
      g.strokeStyle = 'rgba(90,70,44,0.35)';
      g.lineWidth = 1;
      for (const [sx, sy] of [[7, 72], [27, 74], [45, 72]] as const) {
        for (let k = 0; k < 3; k++) {
          g.beginPath();
          g.moveTo(sx, sy + k * 4.5);
          g.lineTo(sx + 14, sy + k * 4.5 + 1);
          g.stroke();
        }
      }
      // Stencil on one sack only: a shipping word, half worn.
      g.fillStyle = 'rgba(60,44,26,0.65)';
      for (let k = 0; k < 4; k++) g.fillRect(27 + k * 4, 72, 2.4, 1.6);
      // The tarpaulin: an angular sheet over the back row, one corner hanging.
      g.beginPath();
      g.moveTo(2, 58);
      g.lineTo(10, 42);
      g.lineTo(40, 40);
      g.lineTo(58, 50);
      g.lineTo(60, 62);
      g.lineTo(52, 58);
      g.lineTo(50, 70);
      g.lineTo(44, 60);
      g.lineTo(20, 62);
      g.lineTo(12, 58);
      g.closePath();
      const tg = g.createLinearGradient(0, 40, 0, 68);
      tg.addColorStop(0, shade('#4a6f8a', 0.1));
      tg.addColorStop(1, shade('#4a6f8a', -0.12));
      g.fillStyle = tg;
      g.fill();
      // Fold creases, straight the way canvas folds straight.
      g.strokeStyle = 'rgba(220,235,240,0.3)';
      g.lineWidth = 1.3;
      g.beginPath();
      g.moveTo(12, 56);
      g.lineTo(38, 46);
      g.stroke();
      g.beginPath();
      g.moveTo(24, 60);
      g.lineTo(52, 52);
      g.stroke();
      // The tie-down rope, doing most of the actual work.
      g.strokeStyle = '#c8a55b';
      g.lineWidth = 1.8;
      g.beginPath();
      g.moveTo(3, 64);
      g.quadraticCurveTo(30, 56, 59, 60);
      g.stroke();
      dot(g, 59, 60, 2, '#a2762c');
    }, 64, 96);

    // The post box: British red on a pole, older than everyone's opinions
    // about it, fed with letters for Sharjah, Muscat, and Kochi.
    make('postbox', 1, (g) => {
      softShadow(g, 32, 90, 11, 4, 0.2);
      // Pole.
      rr(g, 30, 52, 4.5, 38, 2, '#4a4640');
      // The cylinder.
      const red = '#b5382e';
      rr(g, 20, 26, 24, 30, 7, red);
      const pg = g.createLinearGradient(20, 0, 44, 0);
      pg.addColorStop(0, 'rgba(255,220,200,0.25)');
      pg.addColorStop(0.5, 'rgba(0,0,0,0)');
      pg.addColorStop(1, 'rgba(40,10,10,0.25)');
      g.fillStyle = pg;
      g.beginPath();
      g.roundRect(20, 26, 24, 30, 7);
      g.fill();
      // Domed cap.
      oval(g, 32, 26, 13, 5.5, shade(red, -0.12));
      oval(g, 32, 24, 11, 4.2, shade(red, 0.06));
      dot(g, 32, 20.5, 2, shade(red, -0.1));
      // The slot, hungry.
      rr(g, 25, 33, 14, 2.8, 1.4, '#241a12');
      // Collection plate, twice a week.
      rr(g, 26, 40, 12, 7, 1, '#e8e0cc');
      g.strokeStyle = 'rgba(60,50,40,0.6)';
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(28, 43);
      g.lineTo(36, 43);
      g.moveTo(28, 45);
      g.lineTo(34, 45);
      g.stroke();
      // A monsoon's worth of rust starting at the collar.
      vgrad(g, 29, 54, 3, 10, 'rgba(120,60,30,0.5)', 'rgba(0,0,0,0)');
    }, 64, 96);

    // Chalked cricket stumps: the wall keeps wicket all year. Same coping as
    // the mural walls, because it is the same wall, further along.
    make('cricketwall', 1, (g, r) => {
      softShadow(g, 32, 90, 26, 5, 0.18);
      rr(g, 4, 34, 56, 54, 2, '#e8e0cc');
      vgrad(g, 4, 34, 56, 10, 'rgba(120,110,90,0.18)', 'rgba(0,0,0,0)');
      rr(g, 2, 28, 60, 9, 3, '#a35a3c');
      for (let x = 6; x < 60; x += 8) {
        g.strokeStyle = 'rgba(90,44,28,0.5)';
        g.lineWidth = 1.6;
        g.beginPath();
        g.moveTo(x, 29);
        g.lineTo(x, 36);
        g.stroke();
      }
      // Last year's stumps, faded, drawn shorter.
      g.strokeStyle = 'rgba(250,248,240,0.28)';
      g.lineWidth = 2;
      for (const sx of [20, 26, 32]) {
        g.beginPath();
        g.moveTo(sx + 8, 58);
        g.lineTo(sx + 7, 78);
        g.stroke();
      }
      // This year's stumps, taller, with bails and conviction.
      g.strokeStyle = 'rgba(252,250,242,0.95)';
      g.lineWidth = 3;
      for (const sx of [24, 31, 38]) {
        g.beginPath();
        g.moveTo(sx, 52 + r.int(2));
        g.lineTo(sx - 1, 80);
        g.stroke();
      }
      g.beginPath();
      g.moveTo(22, 51);
      g.lineTo(40, 50);
      g.stroke();
      // Ball scuffs, red as the lanes the ball lives on.
      for (let i = 0; i < 5; i++) {
        dot(g, 12 + r.int(40), 44 + r.int(38), 1.8 + r.next(), 'rgba(163,90,60,0.4)');
      }
      // A contested score, chalked and half rubbed out.
      g.strokeStyle = 'rgba(250,248,240,0.5)';
      g.lineWidth = 1.6;
      g.beginPath();
      g.moveTo(48, 44);
      g.lineTo(54, 44);
      g.moveTo(48, 47);
      g.lineTo(52, 47);
      g.stroke();
    }, 64, 96);

    // The temple festival poster, peeling in the damp: elephants, drummers,
    // a date the rain has half eaten.
    make('posterwall', 1, (g, r) => {
      softShadow(g, 32, 90, 26, 5, 0.18);
      // Older plaster, once cream, now instructive.
      rr(g, 4, 34, 56, 54, 2, '#ddd2b4');
      vgrad(g, 4, 34, 56, 10, 'rgba(110,100,80,0.2)', 'rgba(0,0,0,0)');
      vgrad(g, 4, 74, 56, 14, 'rgba(0,0,0,0)', 'rgba(70,90,60,0.28)');
      rr(g, 2, 28, 60, 9, 3, '#a35a3c');
      for (let x = 6; x < 60; x += 8) {
        g.strokeStyle = 'rgba(90,44,28,0.5)';
        g.lineWidth = 1.6;
        g.beginPath();
        g.moveTo(x, 29);
        g.lineTo(x, 36);
        g.stroke();
      }
      // The poster: marigold field, red title band.
      rr(g, 13, 42, 34, 36, 1, '#e8b23c');
      rr(g, 13, 42, 34, 8, 1, '#c1512f');
      g.fillStyle = 'rgba(255,240,210,0.85)';
      for (let k = 0; k < 4; k++) g.fillRect(16 + k * 7, 45, 4.5, 2);
      // The elephant, caparisoned, mid-procession.
      oval(g, 27, 62, 8, 6.5, '#3a3630');
      dot(g, 36, 59, 4, '#3a3630');
      g.strokeStyle = '#3a3630';
      g.lineWidth = 2.4;
      g.beginPath();
      g.moveTo(39, 61);
      g.quadraticCurveTo(42, 66, 40, 70);
      g.stroke();
      rr(g, 32, 54, 7, 4, 1, '#c8973b'); // the golden nettipattam
      // Legs.
      g.lineWidth = 2.2;
      for (const lx of [22, 26, 30]) {
        g.beginPath();
        g.moveTo(lx, 66);
        g.lineTo(lx, 71);
        g.stroke();
      }
      // The date, half eaten by rain.
      g.fillStyle = 'rgba(60,44,26,0.6)';
      for (let k = 0; k < 3; k++) g.fillRect(17 + k * 6, 73, 4, 2);
      vgrad(g, 28, 70, 12, 8, 'rgba(221,210,180,0.7)', 'rgba(0,0,0,0)');
      // The peel: one corner giving up, pale side out.
      g.fillStyle = '#f2ead8';
      g.beginPath();
      g.moveTo(47, 78);
      g.lineTo(38, 78);
      g.lineTo(47, 67);
      g.closePath();
      g.fill();
      g.strokeStyle = 'rgba(90,70,44,0.4)';
      g.lineWidth = 1.2;
      g.beginPath();
      g.moveTo(38, 78);
      g.lineTo(47, 67);
      g.stroke();
      // Rain streak, keeping at it.
      vgrad(g, 8 + r.int(40), 36, 5, 28, 'rgba(140,130,105,0.2)', 'rgba(0,0,0,0)');
    }, 64, 96);

    // The lungi line: checks and stripes flying the flags of a calm country.
    make('lungiline', 2, (g, r) => {
      softShadow(g, 64, 90, 46, 6, 0.16);
      // Poles.
      rr(g, 8, 36, 4.5, 54, 2, '#6f5238');
      rr(g, 115, 36, 4.5, 54, 2, '#6f5238');
      // The line, sagging honestly.
      g.strokeStyle = '#4a4034';
      g.lineWidth = 1.8;
      g.beginPath();
      g.moveTo(10, 40);
      g.quadraticCurveTo(64, 50, 117, 40);
      g.stroke();
      // Four lungis over the line.
      const cloths: [string, string][] = [
        ['#3c6e64', '#2c554c'],
        ['#7d3f34', '#5f2f28'],
        ['#c8a55b', '#a2762c'],
        ['#e8e0cc', '#b0a890'],
      ];
      for (let i = 0; i < 4; i++) {
        const cx = 18 + i * 24 + r.int(2);
        const topY = 40 + (1 - Math.abs(i - 1.5) / 1.5) * 4 + i * 0.5;
        const w = 19;
        const h = 32 + r.int(4);
        const c = cloths[i] ?? ['#3c6e64', '#2c554c'];
        // The hanging panel, bottom edge wavy.
        g.fillStyle = shade(c[0], (r.next() - 0.5) * 0.05);
        g.beginPath();
        g.moveTo(cx, topY);
        g.lineTo(cx + w, topY + 1);
        g.lineTo(cx + w - 1, topY + h);
        g.quadraticCurveTo(cx + w / 2, topY + h + 4, cx + 1, topY + h - 1);
        g.closePath();
        g.fill();
        // Checks: the madras grid.
        g.strokeStyle = shade(c[1], 0);
        g.lineWidth = 1;
        for (let gx = cx + 4; gx < cx + w; gx += 6) {
          g.beginPath();
          g.moveTo(gx, topY + 1);
          g.lineTo(gx, topY + h);
          g.stroke();
        }
        for (let gy = topY + 6; gy < topY + h; gy += 7) {
          g.beginPath();
          g.moveTo(cx + 1, gy);
          g.lineTo(cx + w - 1, gy);
          g.stroke();
        }
        // Fold light down the middle.
        vgrad(g, cx + w / 2 - 2, topY + 2, 4, h - 4, 'rgba(255,250,235,0.18)', 'rgba(0,0,0,0)');
        // Clothespins.
        dot(g, cx + 2, topY, 1.4, '#8a6a44');
        dot(g, cx + w - 2, topY + 1, 1.4, '#8a6a44');
      }
    }, 128, 96);

    // The bus shelter: one bench, one timetable, forty annotations. The bus
    // keeps its own counsel.
    make('busstop', 1, (g, r) => {
      softShadow(g, 64, 122, 52, 7, 0.22);
      // Back wall, washed cyan gone chalky.
      rr(g, 14, 60, 100, 60, 2, '#c6d0c2');
      vgrad(g, 14, 60, 100, 14, 'rgba(40,45,40,0.3)', 'rgba(0,0,0,0)');
      vgrad(g, 14, 104, 100, 16, 'rgba(0,0,0,0)', 'rgba(70,90,60,0.3)');
      // A painted ad ghost, mostly weather now.
      g.fillStyle = 'rgba(60,90,140,0.28)';
      for (let k = 0; k < 3; k++) g.fillRect(24 + k * 12, 78, 8, 5);
      // The timetable, argued with in several hands.
      rr(g, 72, 70, 28, 22, 1, '#e8e4d8');
      g.strokeStyle = 'rgba(50,60,80,0.65)';
      g.lineWidth = 1;
      for (let k = 0; k < 5; k++) {
        g.beginPath();
        g.moveTo(75, 74 + k * 3.6);
        g.lineTo(75 + 12 + r.int(9), 74 + k * 3.6);
        g.stroke();
      }
      // Corrections, in ballpoint and conviction.
      g.strokeStyle = 'rgba(150,50,40,0.7)';
      g.beginPath();
      g.moveTo(76, 77);
      g.lineTo(94, 76);
      g.moveTo(82, 84);
      g.quadraticCurveTo(88, 80, 95, 85);
      g.stroke();
      // The bench, one, slab and legs.
      rr(g, 26, 98, 74, 6, 2, '#7d5e3c');
      rr(g, 30, 104, 5, 14, 2, shade('#7d5e3c', -0.15));
      rr(g, 91, 104, 5, 14, 2, shade('#7d5e3c', -0.15));
      // Posts.
      rr(g, 9, 50, 6, 72, 2, '#8c8479');
      rr(g, 113, 50, 6, 72, 2, '#8c8479');
      // The tin roof, rusting at its own speed.
      g.beginPath();
      g.moveTo(2, 60);
      g.lineTo(126, 60);
      g.lineTo(118, 38);
      g.lineTo(10, 38);
      g.closePath();
      const rg = g.createLinearGradient(0, 38, 0, 60);
      rg.addColorStop(0, shade('#8a7264', 0.1));
      rg.addColorStop(1, shade('#8a7264', -0.14));
      g.fillStyle = rg;
      g.fill();
      // Corrugations.
      g.strokeStyle = 'rgba(60,45,35,0.35)';
      g.lineWidth = 1.4;
      for (let x = 12; x < 120; x += 8) {
        g.beginPath();
        g.moveTo(x + 5, 39);
        g.lineTo(x, 59);
        g.stroke();
      }
      // Rust blooms where the rain lingers.
      oval(g, 30 + r.int(60), 44 + r.int(10), 6, 3, 'rgba(150,84,58,0.4)');
      oval(g, 20 + r.int(80), 50 + r.int(8), 4, 2, 'rgba(150,84,58,0.35)');
      // Shade under the roof.
      vgrad(g, 14, 60, 100, 12, 'rgba(25,20,14,0.35)', 'rgba(0,0,0,0)');
    }, 128, 128);

    // ------------------------------------------------- the love pass: flats

    // Retting husk piles: patience, stacked in public on the way to the canal.
    make('huskpile', 3, (g, r) => {
      oval(g, 32, 50, 21, 6.5, 'rgba(30,24,16,0.16)');
      for (let i = 0; i < 9; i++) {
        const hx = 18 + r.int(28);
        const hy = 34 + r.int(14);
        const c = r.pick(['#8a6a44', '#9b7a50', '#7a5636'] as const);
        oval(g, hx, hy, 5.5 + r.next() * 2.5, 3.6 + r.next() * 1.4, shade(c, (r.next() - 0.5) * 0.1), (r.next() - 0.5) * 1.2);
      }
      // Loose fiber, gone golden already.
      g.strokeStyle = 'rgba(200,165,91,0.55)';
      g.lineWidth = 1.2;
      for (let i = 0; i < 5; i++) {
        const fx = 16 + r.int(32);
        const fy = 36 + r.int(12);
        g.beginPath();
        g.moveTo(fx, fy);
        g.quadraticCurveTo(fx + 3, fy + 2, fx + 6 + r.int(3), fy + 1);
        g.stroke();
      }
    });

    // Water hyacinth: a raft of its own opinions, uninvited, glossy.
    make('hyacinth', 3, (g, r) => {
      oval(g, 32, 38, 22, 12, 'rgba(15,35,30,0.3)');
      for (let i = 0; i < 9; i++) {
        const a = r.next() * Math.PI * 2;
        const d = r.next() * 15;
        const lx = 32 + Math.cos(a) * d;
        const ly = 38 + Math.sin(a) * d * 0.55;
        const c = r.pick(['#4f7d43', '#6f9b52', '#5f8a4a'] as const);
        dot(g, lx, ly, 4 + r.next() * 2.4, c);
        dot(g, lx - 1.4, ly - 1.4, 1.3, shade(c, 0.2));
      }
      // The bulbous floats that keep the whole argument up.
      for (let i = 0; i < 3; i++) {
        oval(g, 20 + r.int(24), 42 + r.int(4), 2.6, 3.4, '#8fae6f');
      }
      // A flower spike or two, lavender and pleased with itself.
      if (r.chance(0.75)) {
        const fx = 26 + r.int(12);
        for (let k = 0; k < 3; k++) dot(g, fx, 26 + k * 3, 2 - k * 0.3, k ? '#a78ac0' : '#b89cd0');
      }
    });

    // A waterlily holding the grey sky like it ordered it specially.
    make('waterlily', 2, (g, r) => {
      oval(g, 32, 40, 20, 10, 'rgba(15,35,30,0.28)');
      // Pads: discs with the classic notch.
      for (const [px2, py, rad, a0] of [[24, 40, 9.5, 0.6], [43, 44, 6.5, 2.4]] as const) {
        g.fillStyle = shade('#4d7440', (r.next() - 0.5) * 0.08);
        g.beginPath();
        g.moveTo(px2, py);
        g.arc(px2, py, rad, a0, a0 + Math.PI * 2 - 0.55);
        g.closePath();
        g.fill();
        g.strokeStyle = 'rgba(220,240,220,0.25)';
        g.lineWidth = 1;
        g.beginPath();
        g.arc(px2, py, rad * 0.6, a0 + 0.4, a0 + 2.2);
        g.stroke();
      }
      // The blossom, open to whatever the sky decides.
      for (let i = 0; i < 7; i++) {
        const a = (i / 7) * Math.PI * 2;
        oval(g, 33 + Math.cos(a) * 4.5, 32 + Math.sin(a) * 3, 3.4, 1.9, '#f2e6ea', a);
      }
      dot(g, 33, 32, 2.2, '#e8b23c');
    });

    // The anthill nobody disturbs. Nobody says why; both facts feel related.
    make('anthill', 2, (g, r) => {
      oval(g, 32, 54, 19, 6, 'rgba(30,24,16,0.18)');
      blob(g, 32, 46, 13, '#96543a', r, 0.2);
      blob(g, 31, 37, 9.5, '#a35a3c', r, 0.22);
      blob(g, 33, 29, 6, '#96543a', r, 0.25);
      // Weathered runnels down the flanks.
      g.strokeStyle = 'rgba(90,44,28,0.35)';
      g.lineWidth = 1.4;
      for (const [sx, sy] of [[26, 34], [36, 32], [30, 42]] as const) {
        g.beginPath();
        g.moveTo(sx, sy);
        g.quadraticCurveTo(sx - 1, sy + 6, sx + 1, sy + 11);
        g.stroke();
      }
      // Doors. Small ones, but busy.
      dot(g, 28, 44, 1.8, '#3a231a');
      dot(g, 37, 40, 1.4, '#3a231a');
      dot(g, 33, 27, 1.2, '#3a231a');
      // Grass keeping a respectful distance, mostly.
      g.strokeStyle = '#5f8a4a';
      g.lineWidth = 1.4;
      for (const gx of [16, 46, 40]) {
        g.beginPath();
        g.moveTo(gx, 52);
        g.quadraticCurveTo(gx + 1, 47, gx + 3, 44 + r.int(3));
        g.stroke();
      }
    });

    // A fallen coconut: by custom, the first to notice it may claim it.
    make('fallennut', 3, (g, r) => {
      oval(g, 33, 45, 11, 3.6, 'rgba(30,24,16,0.2)');
      const c = shade('#7a5a2e', (r.next() - 0.5) * 0.12);
      const tilt = -0.35 + (r.next() - 0.5) * 0.3;
      // Ovoid in the husk, one end coming to a soft point.
      oval(g, 31, 39, 10.5, 7, c, tilt);
      oval(g, 38, 36, 4, 3.4, c, tilt);
      oval(g, 28, 37, 4.5, 2.8, shade(c, 0.16), tilt);
      // Husk ridges running the long way.
      g.strokeStyle = 'rgba(60,42,26,0.4)';
      g.lineWidth = 1;
      for (const dy of [-3, 0, 3]) {
        g.beginPath();
        g.moveTo(23, 39 + dy);
        g.quadraticCurveTo(31, 36 + dy * 1.6, 40, 38 + dy);
        g.stroke();
      }
      // Sometimes a green one, down early and unripe about it.
      if (r.chance(0.5)) oval(g, 45, 43, 5.5, 4.2, '#8fae4f', 0.3);
      // A torn scrap of frond that came down with it.
      g.strokeStyle = shade('#4d7440', -0.05);
      g.lineWidth = 1.6;
      g.beginPath();
      g.moveTo(14, 46);
      g.quadraticCurveTo(19, 43, 24, 46);
      g.stroke();
    });

    // The lost tennis ball, bald from the lane, retired to the gutter.
    make('tennisball', 1, (g) => {
      oval(g, 33, 44, 7.5, 2.8, 'rgba(30,24,16,0.25)');
      dot(g, 32, 39, 6.5, '#b3a44e');
      dot(g, 30, 37, 2.2, shade('#b3a44e', 0.16));
      // The seam, worn to a rumor.
      g.strokeStyle = 'rgba(240,236,214,0.5)';
      g.lineWidth = 1.4;
      g.beginPath();
      g.arc(35, 36, 6.5, 1.4, 2.9);
      g.stroke();
      // Laterite dust: the lane keeps its share.
      dot(g, 35, 42, 1.6, 'rgba(163,90,60,0.5)');
      // A dead leaf, also retired.
      oval(g, 45, 45, 5, 2.2, '#9b7a50', 0.5);
    });

    // The chaya-glass rack: the regiment, drying upside down in ranks.
    make('glassrack', 1, (g) => {
      softShadow(g, 32, 58, 21, 4, 0.18);
      // Painted wooden frame, teal like the stall it serves.
      rr(g, 11, 20, 3.5, 38, 1.5, '#35625a');
      rr(g, 49.5, 20, 3.5, 38, 1.5, '#35625a');
      rr(g, 9, 36, 46, 3.5, 1.5, '#3c6e64');
      rr(g, 9, 54, 46, 3.5, 1.5, '#3c6e64');
      // Two ranks of glasses, bottoms up.
      for (const shelfY of [36, 54]) {
        for (let i = 0; i < 5; i++) {
          const gx = 14 + i * 8;
          rr(g, gx, shelfY - 10, 6, 10, 1.5, 'rgba(215,232,232,0.7)');
          rr(g, gx + 0.8, shelfY - 10, 4.4, 2.2, 1, 'rgba(250,255,255,0.65)');
          // The faint chaya ring no washing fully retires.
          rr(g, gx + 1, shelfY - 4, 4, 1.4, 0.7, 'rgba(181,113,63,0.4)');
        }
      }
    });

    // Umbrellas open on the veranda to dry, like bats airing before a shift.
    make('umbrellas', 2, (g, r) => {
      oval(g, 32, 50, 22, 6, 'rgba(30,24,16,0.18)');
      const brolly = (cx: number, cy: number, rad: number, lean: number) => {
        const ink = shade('#241a20', (r.next() - 0.5) * 0.06);
        // Canopy: a dome with a scalloped hem.
        g.fillStyle = ink;
        g.beginPath();
        g.moveTo(cx - rad, cy);
        g.quadraticCurveTo(cx - rad * 0.6, cy - rad * 0.95, cx + lean, cy - rad);
        g.quadraticCurveTo(cx + rad * 0.7, cy - rad * 0.9, cx + rad, cy);
        for (let k = 3; k >= 0; k--) {
          const sx = cx - rad + ((k + 0.5) / 4) * rad * 2;
          g.quadraticCurveTo(sx + rad / 8, cy + 3, sx - rad / 8, cy);
        }
        g.closePath();
        g.fill();
        // Ribs catching what light there is.
        g.strokeStyle = 'rgba(150,160,175,0.4)';
        g.lineWidth = 1;
        for (const t of [-0.5, 0, 0.5]) {
          g.beginPath();
          g.moveTo(cx + lean, cy - rad);
          g.quadraticCurveTo(cx + t * rad * 0.7, cy - rad * 0.5, cx + t * rad * 0.9, cy);
          g.stroke();
        }
        // Wet sheen along one shoulder; drying is a slow argument here.
        g.strokeStyle = 'rgba(200,215,230,0.35)';
        g.lineWidth = 2;
        g.beginPath();
        g.moveTo(cx - rad * 0.75, cy - rad * 0.3);
        g.quadraticCurveTo(cx - rad * 0.4, cy - rad * 0.85, cx + lean - 2, cy - rad * 0.95);
        g.stroke();
        // Ferrule and handle.
        g.strokeStyle = '#4a4034';
        g.lineWidth = 1.6;
        g.beginPath();
        g.moveTo(cx + lean, cy - rad);
        g.lineTo(cx + lean, cy - rad - 4);
        g.stroke();
        g.beginPath();
        g.moveTo(cx - lean * 0.5, cy);
        g.quadraticCurveTo(cx - lean * 0.5 + 2, cy + 6, cx - lean * 0.5 + 5, cy + 5);
        g.stroke();
      };
      brolly(20, 40, 13, 2);
      brolly(43, 44, 11, -2);
    });

    // ---------------------------------------------- the love pass: interior

    // The ammikkallu: a grinding stone worn into a shallow smile.
    make('ammi', 1, (g) => {
      oval(g, 32, 50, 20, 5.5, 'rgba(30,24,16,0.2)');
      // The slab.
      rr(g, 12, 34, 40, 15, 7, '#6b6a66');
      vgrad(g, 12, 34, 40, 6, 'rgba(255,250,240,0.18)', 'rgba(0,0,0,0)');
      // The hollow three generations ground into it.
      oval(g, 32, 42, 12, 4.5, '#5a5956');
      // The roller, resting mid-thought.
      rr(g, 22, 26, 20, 9, 4.5, '#7d7c78');
      vgrad(g, 22, 26, 20, 4, 'rgba(255,250,240,0.22)', 'rgba(0,0,0,0)');
      // Turmeric, which never fully leaves.
      oval(g, 45, 44, 3.6, 1.8, 'rgba(200,151,59,0.7)');
      oval(g, 18, 46, 2.4, 1.3, 'rgba(200,151,59,0.5)');
    });

    // Banana leaves cut and stacked, narrow ends pointing the same way.
    make('leafstack', 1, (g, r) => {
      oval(g, 32, 48, 20, 5, 'rgba(30,24,16,0.18)');
      for (let i = 0; i < 5; i++) {
        const c = shade(i % 2 ? '#5f8a4a' : '#4d7440', (r.next() - 0.5) * 0.06);
        oval(g, 32 + (i % 2) * 2 - 1, 44 - i * 2.6, 21 - i * 1.2, 5, c, (i % 2 ? 0.05 : -0.04));
      }
      // Midrib on the top leaf.
      g.strokeStyle = 'rgba(240,250,220,0.4)';
      g.lineWidth = 1.4;
      g.beginPath();
      g.moveTo(13, 34);
      g.lineTo(51, 33);
      g.stroke();
      g.strokeStyle = 'rgba(30,45,25,0.3)';
      g.lineWidth = 0.8;
      for (let x = 17; x < 49; x += 5) {
        g.beginPath();
        g.moveTo(x, 33.5);
        g.lineTo(x + 2, 30);
        g.stroke();
      }
    });

    // The kitchen supervisor, asleep at her post, on a mat she has claimed.
    make('keralacat', 1, (g) => {
      // The claimed mat: woven, once for guests.
      oval(g, 32, 42, 19, 10, '#7a8a5c');
      oval(g, 32, 42, 15.5, 7.5, '#8a9a68');
      g.strokeStyle = 'rgba(90,60,40,0.4)';
      g.lineWidth = 1;
      for (const rad of [11, 6]) {
        g.beginPath();
        g.ellipse(32, 42, rad, rad * 0.5, 0, 0, Math.PI * 2);
        g.stroke();
      }
      oval(g, 32, 44, 13, 5, 'rgba(30,24,16,0.2)');
      const fur = '#d09055';
      // Curled body.
      dot(g, 33, 38, 11, fur);
      oval(g, 36, 34, 6, 4.5, shade(fur, 0.12));
      // The tail, wrapped like a drawn curtain.
      g.strokeStyle = '#b5713f';
      g.lineWidth = 4;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(42, 42);
      g.quadraticCurveTo(34, 49, 24, 44);
      g.stroke();
      // Head tucked in, ears still on duty.
      dot(g, 24, 40, 6, fur);
      g.fillStyle = shade(fur, -0.08);
      g.beginPath();
      g.moveTo(20, 36);
      g.lineTo(22, 31);
      g.lineTo(24.5, 35);
      g.closePath();
      g.fill();
      g.beginPath();
      g.moveTo(26, 34.5);
      g.lineTo(28.5, 30.5);
      g.lineTo(30, 35);
      g.closePath();
      g.fill();
      // Stripes, faint, like a manager's pinstripe.
      g.strokeStyle = 'rgba(155,90,45,0.5)';
      g.lineWidth = 1.6;
      for (const [ax, s0, s1] of [[33, -0.6, 0.4], [37, -0.4, 0.5]] as const) {
        g.beginPath();
        g.arc(ax, 37, 7, s0, s1);
        g.stroke();
      }
      // The closed eye and a nose the size of a lentil.
      g.strokeStyle = '#5a3a22';
      g.lineWidth = 1.2;
      g.beginPath();
      g.moveTo(21, 40);
      g.quadraticCurveTo(22.5, 41, 24, 40);
      g.stroke();
      dot(g, 20, 42.5, 1, '#a86a6a');
    });

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
