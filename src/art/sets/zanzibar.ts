import type { ChapterArt } from './index';
import { dot, glowSpot, oval, rect, rr, shade, softShadow, vgrad } from '../pix';
import { PAL } from '../../engine/config';

/**
 * Zanzibar shore village: coral rag under lime wash, carved doors that are
 * the town's face, barazas grown into house fronts, a tide that walks out
 * half a mile and leaves its floor to be farmed. Whites and bones and
 * rust-reds; the only loud color hangs on the kanga racks on purpose.
 */

const S = 64;

/** Lime-washed coral rag, plus the rubble showing where the wash lost. */
const CORAL_WASHES = ['#f0e9d9', '#e9e0cb', '#e3d6bd', '#e6e3d4', '#e9dcbc', '#dee1d6'];
const KANGA_INKS = ['#c1512f', '#3f7fb0', '#8a4a7d', '#c98a2e', '#4d7440', '#a03a4a'];

export const ART: ChapterArt = {
  buildings: ['nyumba'],
  windows: { nyumba: [[15, -10], [67, -10]] },
  grounded: [
    'kangarack', 'marketlamp', 'ngalawa', 'dhow', 'kangaline', 'baoboard', 'madema', 'scaffold',
    'sailspar', 'makuti', 'mkokoteni', 'ukuta',
  ],
  glows: ['marketlamp'],
  aliases: { postcounter: 'signpost' },
  noInk: ['starfish', 'flipflopgoal', 'doormat'],

  paint(make) {
    // ------------------------------------------------------------ grounds

    // Crushed-coral lane: seamless flat base, shell flecks, a swept look.
    make('corallane', 5, (g, r) => {
      rect(g, 0, 0, S, S, '#eae0c6');
      for (let i = 0; i < 6; i++) {
        dot(g, r.int(S), r.int(S), 1.2 + r.next(), shade('#eae0c6', r.chance(0.5) ? -0.07 : 0.09));
      }
      if (r.chance(0.3)) oval(g, r.int(S), r.int(S), 4, 1.6, 'rgba(150,130,95,0.14)');
      if (r.chance(0.2)) dot(g, r.int(S), r.int(S), 2, '#f6efdd'); // a shell chip
    });

    // ------------------------------------------------------------ flats

    // Baraza: the stone bench built into a house front. Drawn high in the
    // tile so it reads as attached to the wall behind it.
    make('baraza', 2, (g, r) => {
      softShadow(g, S / 2, 40, 26, 7, 0.16);
      const stone = shade('#e6dcc2', (r.next() - 0.5) * 0.05);
      // Masonry base.
      rr(g, 4, 16, 56, 22, 3, shade(stone, -0.16));
      // Seat slab, worn smooth in the middle.
      rr(g, 2, 8, 60, 14, 4, stone);
      vgrad(g, 2, 8, 60, 5, 'rgba(255,252,240,0.5)', 'rgba(0,0,0,0)');
      oval(g, 32, 14, 18, 4, shade(stone, -0.05));
      // Mortar seams on the base.
      g.strokeStyle = 'rgba(120,100,70,0.35)';
      g.lineWidth = 1.6;
      for (const lx of [20, 42]) {
        g.beginPath(); g.moveTo(lx, 24); g.lineTo(lx, 36); g.stroke();
      }
      g.beginPath(); g.moveTo(6, 28); g.lineTo(58, 28); g.stroke();
      // Sometimes a thimble coffee cup, left mid-conversation.
      if (r.chance(0.5)) {
        dot(g, 48, 10, 3.2, '#f2ead8');
        dot(g, 48, 9.4, 1.8, '#4a3320');
      }
    });

    // A mat of cloves drying by the lane: rust-red on woven palm.
    make('clovemat', 3, (g, r) => {
      softShadow(g, 32, 54, 26, 6, 0.12);
      rr(g, 5, 8, 54, 46, 3, shade('#c9a86a', (r.next() - 0.5) * 0.06));
      g.strokeStyle = 'rgba(140,110,60,0.4)';
      g.lineWidth = 1.4;
      for (let k = 1; k < 5; k++) {
        g.beginPath(); g.moveTo(7, 8 + k * 9); g.lineTo(57, 8 + k * 9); g.stroke();
      }
      g.beginPath(); g.moveTo(32, 10); g.lineTo(32, 52); g.stroke();
      // The harvest, three months of climbing per handful.
      for (let i = 0; i < 60; i++) {
        const cx = 9 + r.int(46);
        const cy = 12 + r.int(38);
        oval(g, cx, cy, 1.6, 0.9, r.chance(0.5) ? '#8a3a22' : '#a04a28', (r.next() - 0.5) * 2);
      }
    });

    // Spice sacks rolled open at the mouth.
    make('spicesack', 2, (g, r) => {
      softShadow(g, 32, 54, 24, 6, 0.16);
      const burlap = shade('#a58a5c', (r.next() - 0.5) * 0.06);
      const spice = r.chance(0.5) ? ['#c98a2e', '#a04a28'] : ['#6b3a26', '#c9a86a'];
      // Two sacks leaning together.
      rr(g, 8, 22, 24, 32, 6, burlap);
      rr(g, 32, 26, 24, 28, 6, shade(burlap, -0.08));
      // Rolled cuffs.
      rr(g, 6, 18, 28, 9, 4, shade(burlap, 0.12));
      rr(g, 30, 23, 28, 8, 4, shade(burlap, 0.04));
      // Spice mounds.
      oval(g, 20, 20, 9, 4, spice[0] ?? '#c98a2e');
      oval(g, 44, 25, 9, 3.6, spice[1] ?? '#a04a28');
      dot(g, 17, 18, 1.2, shade(spice[0] ?? '#c98a2e', 0.2));
      dot(g, 47, 24, 1.2, shade(spice[1] ?? '#a04a28', 0.2));
      // Stitch lines.
      g.strokeStyle = 'rgba(90,70,40,0.4)';
      g.lineWidth = 1.4;
      g.beginPath(); g.moveTo(12, 30); g.lineTo(12, 50); g.stroke();
      g.beginPath(); g.moveTo(52, 32); g.lineTo(52, 50); g.stroke();
    });

    // A staked mwani line, tufted dark red, drawn to sit on wet sand.
    make('mwanirow', 3, (g, r) => {
      // Two lines, because nobody stakes just one, and the second is always
      // a little out of true with the first.
      const line = (y0: number, sag: number, n: number) => {
        g.strokeStyle = '#6b5136';
        g.lineWidth = 3.2;
        g.beginPath(); g.moveTo(2, y0 - 4); g.lineTo(3, y0 + 18); g.stroke();
        g.beginPath(); g.moveTo(61, y0 - 5); g.lineTo(60, y0 + 17); g.stroke();
        g.strokeStyle = 'rgba(225,220,200,0.85)';
        g.lineWidth = 1.6;
        g.beginPath();
        g.moveTo(3, y0);
        g.quadraticCurveTo(32, y0 + sag, 60, y0 - 1);
        g.stroke();
        for (let i = 0; i < n; i++) {
          const t = (i + 0.5) / n;
          const bx = 4 + t * 56 + r.int(2);
          const by = y0 + sag * 4 * t * (1 - t) + 2;
          oval(g, bx, by + 5, 4.6, 6.5, i % 2 ? '#7d3b3f' : '#66313c');
          oval(g, bx + 2, by + 2.5, 3, 4.2, '#93504f');
          oval(g, bx - 2, by + 8, 2.4, 3.4, '#5c2c36');
        }
      };
      line(16, 6, 7);
      line(38, 5, 6);
      // The wet glint the whole farm sits in.
      oval(g, 32, 54, 26, 4, 'rgba(200,225,230,0.2)');
      oval(g, 20, 30, 16, 3, 'rgba(200,225,230,0.14)');
    });

    // Carved door, drawn over a nyumba doorway when latched. The town's
    // face: studs, arched or square frames, a chain border for protection.
    make('mlango', 3, (g, r, i) => {
      const wood = i === 2 ? '#4e6b66' : i === 1 ? '#3f2d1c' : '#4a3320';
      const frame = shade(wood, -0.25);
      if (i === 0) {
        // Indian round-top: the arch, the brass, the whole dowry.
        g.fillStyle = frame;
        g.beginPath();
        g.moveTo(8, 64); g.lineTo(8, 24);
        g.quadraticCurveTo(32, 0, 56, 24); g.lineTo(56, 64);
        g.closePath(); g.fill();
        g.fillStyle = wood;
        g.beginPath();
        g.moveTo(13, 64); g.lineTo(13, 26);
        g.quadraticCurveTo(32, 7, 51, 26); g.lineTo(51, 64);
        g.closePath(); g.fill();
        // Brass studs in ranks.
        for (let ry = 0; ry < 4; ry++) {
          for (let rx2 = 0; rx2 < 3; rx2++) {
            dot(g, 20 + rx2 * 12, 26 + ry * 10, 2.4, shade(PAL.gold, 0.15));
            dot(g, 19.4 + rx2 * 12, 25.4 + ry * 10, 1, '#fdf3d0');
          }
        }
      } else {
        // Square-top with a carved lintel band.
        rr(g, 8, 12, 48, 52, 2, frame);
        rr(g, 13, 18, 38, 46, 2, wood);
        rr(g, 6, 6, 52, 9, 2, frame);
        // Chain motif along the lintel.
        g.strokeStyle = 'rgba(230,215,180,0.55)';
        g.lineWidth = 1.4;
        for (let k = 0; k < 6; k++) {
          g.beginPath(); g.arc(13 + k * 8, 10.5, 2.6, 0, Math.PI * 2); g.stroke();
        }
        for (let ry = 0; ry < (i === 2 ? 2 : 4); ry++) {
          for (let rx2 = 0; rx2 < 3; rx2++) {
            dot(g, 20 + rx2 * 12, 26 + ry * 10, 2.2, shade(PAL.gold, i === 2 ? -0.05 : 0.12));
          }
        }
      }
      // Center seam and the shadowed threshold.
      g.strokeStyle = 'rgba(20,14,8,0.55)';
      g.lineWidth = 2;
      g.beginPath(); g.moveTo(32, i === 0 ? 10 : 18); g.lineTo(32, 62); g.stroke();
      vgrad(g, 10, 56, 44, 8, 'rgba(0,0,0,0)', 'rgba(15,10,6,0.35)');
      void r;
    });

    // ------------------------------------------------- the composition pass

    // Ukuta: the coral-rag garden wall, chest high, lime-washed on the street
    // side and left honest on the other. What turns a patch of sand into
    // somebody's yard. Drawn edge to edge so a run of them reads as one wall.
    make('ukuta', 3, (g, r) => {
      softShadow(g, 32, 90, 34, 7, 0.24);
      const wash = shade(CORAL_WASHES[r.int(6)] ?? '#e9e0cb', (r.next() - 0.5) * 0.05);
      // The body: a real slab of wall, top-lit, damp rising at the foot.
      rect(g, 0, 40, S, 50, shade(wash, -0.05));
      vgrad(g, 0, 40, S, 16, shade(wash, 0.1), 'rgba(0,0,0,0)');
      vgrad(g, 0, 70, S, 20, 'rgba(0,0,0,0)', 'rgba(105,88,62,0.4)');
      // Coursed rag: the reef, quarried, stacked, and mostly forgiven.
      for (let row = 0; row < 4; row++) {
        const ry = 46 + row * 11;
        for (let k = 0; k < 4; k++) {
          const bx = -8 + k * 18 + (row % 2 ? 9 : 0);
          oval(g, bx + 9, ry + 4, 8.5, 4.4, shade(wash, (r.next() - 0.5) * 0.11));
        }
        g.strokeStyle = 'rgba(120,100,70,0.28)';
        g.lineWidth = 1.3;
        g.beginPath(); g.moveTo(0, ry - 1); g.lineTo(S, ry - 1); g.stroke();
      }
      // A patch where the wash lost altogether.
      if (r.chance(0.55)) {
        rr(g, 4 + r.int(26), 52 + r.int(16), 26, 16, 5, '#c7bb9e');
        for (let k = 0; k < 5; k++) oval(g, 8 + r.int(44), 56 + r.int(14), 5.5, 3.4, shade('#c7bb9e', -0.09));
      }
      // The coping course, the brightest line on the whole street.
      rect(g, 0, 32, S, 10, shade(wash, 0.16));
      vgrad(g, 0, 32, S, 4, 'rgba(255,253,244,0.6)', 'rgba(0,0,0,0)');
      rect(g, 0, 41, S, 2, 'rgba(90,74,50,0.28)');
      // Bougainvillea over the top, because a wall is a trellis with patience.
      if (r.chance(0.5)) {
        const bloom = r.chance(0.5) ? '#b8437a' : '#c1512f';
        for (let k = 0; k < 8; k++) oval(g, 2 + r.int(60), 22 + r.int(12), 5, 3.4, '#4d7440', r.next());
        for (let k = 0; k < 16; k++) {
          dot(g, 2 + r.int(60), 18 + r.int(16), 2.4 + r.next(), shade(bloom, (r.next() - 0.5) * 0.28));
        }
      }
    }, 64, 96);

    // Madafu: green drinking coconuts heaped where somebody will sell them,
    // one opened, the panga left standing in the pile.
    make('madafu', 2, (g, r) => {
      softShadow(g, 32, 56, 26, 7, 0.2);
      const nuts: [number, number, number][] = [
        [14, 46, 12], [33, 49, 13], [50, 46, 11.5], [23, 32, 12], [43, 31, 11.5], [32, 18, 11],
      ];
      for (const [nx, ny, rad] of nuts) {
        const green = shade(r.chance(0.4) ? '#7f9a3e' : '#8fae4f', (r.next() - 0.5) * 0.14);
        oval(g, nx, ny, rad, rad * 0.92, green);
        oval(g, nx - rad * 0.3, ny - rad * 0.35, rad * 0.42, rad * 0.34, shade(green, 0.22));
        g.strokeStyle = shade(green, -0.22);
        g.lineWidth = 1.2;
        g.beginPath();
        g.moveTo(nx, ny - rad * 0.9);
        g.quadraticCurveTo(nx + rad * 0.5, ny, nx, ny + rad * 0.9);
        g.stroke();
      }
      // The one that has been opened, pale and full of afternoon.
      oval(g, 50, 44, 5.5, 4, '#f2ead8');
      oval(g, 50, 44, 3.4, 2.4, '#e6dcc2');
      // The panga, standing in the heap exactly the way it was left.
      g.strokeStyle = '#4a3320';
      g.lineWidth = 4;
      g.beginPath(); g.moveTo(54, 44); g.lineTo(58, 56); g.stroke();
      g.fillStyle = '#b8bcc0';
      g.beginPath();
      g.moveTo(55, 44); g.lineTo(47, 14); g.lineTo(53, 12); g.lineTo(59, 42);
      g.closePath(); g.fill();
      vgrad(g, 47, 13, 7, 30, 'rgba(255,255,255,0.5)', 'rgba(0,0,0,0)');
      void r;
    });

    // Dagaa on the rack: whitebait spread on a mesh table to dry hard in the
    // sun, silver on bone. An octopus keeps them company on the line above.
    make('dagaa', 2, (g, r) => {
      softShadow(g, 32, 54, 26, 6, 0.16);
      // The frame: four sticks, a mesh top, and no ambition beyond that.
      g.strokeStyle = '#7a5636';
      g.lineWidth = 3;
      for (const [lx, ly] of [[10, 36], [54, 36], [18, 40], [46, 40]] as const) {
        g.beginPath(); g.moveTo(lx, ly); g.lineTo(lx + (lx < 32 ? -1 : 1), 53); g.stroke();
      }
      rr(g, 6, 28, 52, 12, 3, '#a58a5c');
      rr(g, 8, 29, 48, 9, 2, '#d9cfb4');
      g.strokeStyle = 'rgba(120,95,60,0.35)';
      g.lineWidth = 1;
      for (let k = 0; k < 7; k++) {
        g.beginPath(); g.moveTo(9 + k * 7, 29); g.lineTo(9 + k * 7, 38); g.stroke();
      }
      // The catch: a silver drift of it, all facing more or less one way.
      oval(g, 32, 33, 23, 5, '#c2ccd0');
      for (let i = 0; i < 44; i++) {
        const fx = 10 + r.int(46);
        const fy = 29 + r.int(9);
        oval(g, fx, fy, 3.6, 1.3, r.chance(0.5) ? '#dae3e6' : '#aeb9be', (r.next() - 0.5) * 0.7);
        dot(g, fx + 2.6, fy, 0.7, '#4a5054');
      }
      // The octopus, hung to dry, arms giving up one at a time.
      g.strokeStyle = 'rgba(220,215,195,0.8)';
      g.lineWidth = 1.4;
      g.beginPath(); g.moveTo(4, 20); g.lineTo(60, 17); g.stroke();
      oval(g, 40, 24, 6, 5, '#a86a58');
      for (let k = 0; k < 5; k++) {
        g.strokeStyle = shade('#a86a58', k % 2 ? -0.08 : 0.08);
        g.lineWidth = 2;
        g.beginPath();
        g.moveTo(37 + k * 1.6, 28);
        g.quadraticCurveTo(35 + k * 2.4, 34, 38 + k * 2.2, 39 - (k % 2) * 3);
        g.stroke();
      }
    });

    // Nyavu: a net spread over the sand to dry and be mended, floats along
    // one edge, the mending needle stuck in where the work stopped.
    make('nyavu', 3, (g, r) => {
      oval(g, 32, 42, 27, 15, 'rgba(150,130,95,0.16)');
      const twine = r.chance(0.5) ? 'rgba(90,110,95,0.75)' : 'rgba(120,110,80,0.75)';
      g.save();
      g.beginPath();
      g.ellipse(32, 42, 26, 14, (r.next() - 0.5) * 0.5, 0, Math.PI * 2);
      g.clip();
      g.strokeStyle = twine;
      g.lineWidth = 1.3;
      for (let i = -6; i < 10; i++) {
        g.beginPath(); g.moveTo(i * 8, 24); g.quadraticCurveTo(32, 42, i * 8 + 20, 60); g.stroke();
        g.beginPath(); g.moveTo(i * 8 + 20, 24); g.quadraticCurveTo(32, 42, i * 8, 60); g.stroke();
      }
      g.restore();
      // Cork floats along the top edge, in the order the sea left them.
      for (let k = 0; k < 5; k++) {
        oval(g, 12 + k * 10 + r.int(3), 30 + (k % 2) * 3, 3.2, 2.2, k % 2 ? '#c98a2e' : '#a04a28');
      }
      // Stone sinkers on the far edge, and the needle, mid-repair.
      for (let k = 0; k < 3; k++) dot(g, 18 + k * 13, 53 + (k % 2) * 2, 2.4, '#8b8f94');
      g.strokeStyle = '#e0c268';
      g.lineWidth = 2;
      g.beginPath(); g.moveTo(44, 46); g.lineTo(52, 38); g.stroke();
      dot(g, 52, 38, 2, '#c9a35f');
    });

    // ------------------------------------------------- love-pass flats

    // Kahawa round, parked: brass pot, thimble cups, a few dates. The cup
    // is small so the sitting is long.
    make('kahawatray', 2, (g, r) => {
      softShadow(g, 32, 50, 22, 6, 0.16);
      // The tray: dark wood, so the brass has something to shine against.
      oval(g, 32, 45, 23, 8.5, '#4a3320');
      oval(g, 32, 44, 20.5, 7, '#8a5c36');
      oval(g, 32, 43.6, 17.5, 5.6, '#6b4a30');
      // The dallah, center stage: belly, shoulder, finial, crescent spout.
      const brass = '#cf9d3a';
      oval(g, 32, 33, 8, 10, brass);
      oval(g, 29.5, 30, 2.6, 5.5, shade(brass, 0.3), 0.3);
      oval(g, 32, 24.5, 4.8, 4.2, shade(brass, 0.1));
      rr(g, 28.5, 20.5, 7, 3, 1.5, shade(brass, -0.1));
      dot(g, 32, 18.5, 2.6, shade(brass, 0.18));
      g.strokeStyle = shade(brass, -0.22);
      g.lineWidth = 3.2;
      g.beginPath(); g.moveTo(39, 29); g.quadraticCurveTo(47, 24, 46, 16); g.stroke();
      g.beginPath(); g.moveTo(25, 29); g.quadraticCurveTo(19, 26, 21, 20); g.stroke();
      // Cups in mid-round, scattered as conversation left them.
      const cups: [number, number][] = [[19, 43], [25, 47.5], [45, 44.5]];
      for (let k = 0; k < 3; k++) {
        const [cx2, cy2] = cups[k] ?? [20, 44];
        dot(g, cx2, cy2, 3.4, '#f6efdd');
        dot(g, cx2, cy2 - 0.5, 1.9, r.chance(0.6) ? '#4a3320' : '#e6dcc2');
      }
      if (r.chance(0.7)) for (let k = 0; k < 3; k++) oval(g, 39 + k * 4.2, 49, 2, 1.2, '#4a2c18', 0.4 * k);
    });

    // Coral-rag blocks queued for repairs: the reef, quarried and stacked.
    make('coralblocks', 2, (g, r) => {
      softShadow(g, 32, 52, 26, 7, 0.16);
      const bone = '#d8cdb0';
      const block = (x: number, y: number, w: number, h: number) => {
        const c = shade(bone, (r.next() - 0.5) * 0.12);
        rr(g, x, y, w, h, 3, c);
        vgrad(g, x, y, w, 4, 'rgba(255,250,235,0.4)', 'rgba(0,0,0,0)');
        for (let k = 0; k < 5; k++) dot(g, x + 4 + r.int(w - 8), y + 4 + r.int(h - 8), 1 + r.next(), shade(c, -0.12));
      };
      block(8, 36, 24, 16);
      block(33, 38, 22, 14);
      block(14, 22, 22, 15);
      block(37, 26, 16, 13);
      if (r.chance(0.6)) block(22, 10, 18, 13);
    });

    // A pail of lime wash and its brush: the wall's next white coat.
    make('limepail', 2, (g, r) => {
      softShadow(g, 30, 54, 20, 6, 0.14);
      for (let k = 0; k < 4; k++) oval(g, 14 + r.int(36), 50 + r.int(8), 3 + r.int(3), 1.6, 'rgba(240,235,220,0.8)');
      g.beginPath();
      g.moveTo(16, 26); g.lineTo(20, 52); g.lineTo(40, 52); g.lineTo(44, 26);
      g.closePath();
      g.fillStyle = '#8b8f94';
      g.fill();
      oval(g, 30, 26, 14, 4.5, '#6e7276');
      oval(g, 30, 26.5, 11.5, 3.4, '#f0ebdc');
      g.strokeStyle = '#5c6064';
      g.lineWidth = 2;
      g.beginPath(); g.moveTo(18, 34); g.quadraticCurveTo(30, 39, 42, 34); g.stroke();
      // The brush leans on the rim, bristles limed stiff.
      g.strokeStyle = '#7a5636';
      g.lineWidth = 3.4;
      g.beginPath(); g.moveTo(41, 26); g.lineTo(52, 8); g.stroke();
      rr(g, 36, 24, 9, 9, 2, '#e9e4d4');
    });

    // The fish bicycle: crate lashed over the back wheel, bell optimistic.
    make('baiskeli', 1, (g) => {
      softShadow(g, 32, 56, 27, 6, 0.16);
      g.strokeStyle = '#2e2a26';
      g.lineWidth = 2.6;
      for (const wx of [16, 48]) {
        g.beginPath(); g.arc(wx, 45, 10, 0, Math.PI * 2); g.stroke();
        g.beginPath(); g.arc(wx, 45, 3, 0, Math.PI * 2); g.stroke();
      }
      // Frame; the geometry of a thousand repairs.
      g.strokeStyle = '#3f6b8a';
      g.lineWidth = 2.8;
      g.beginPath();
      g.moveTo(16, 45); g.lineTo(28, 29); g.lineTo(44, 29); g.lineTo(48, 45);
      g.moveTo(28, 29); g.lineTo(34, 45); g.lineTo(16, 45);
      g.stroke();
      // Seat, handlebars, bell.
      g.strokeStyle = '#2e2a26';
      g.lineWidth = 2.4;
      g.beginPath(); g.moveTo(28, 29); g.lineTo(27, 22); g.stroke();
      g.beginPath(); g.moveTo(44, 29); g.lineTo(46, 20); g.stroke();
      rr(g, 22, 19, 10, 3.4, 1.6, '#2e2a26');
      g.beginPath(); g.moveTo(42, 20); g.quadraticCurveTo(47, 15, 52, 20); g.stroke();
      dot(g, 43, 22, 1.7, shade(PAL.gold, 0.1));
      // The crate over the back wheel; one fish tail declines to fit.
      rr(g, 6, 22, 19, 14, 2, '#a58a5c');
      g.strokeStyle = 'rgba(90,70,40,0.5)';
      g.lineWidth = 1.4;
      g.beginPath(); g.moveTo(6, 27); g.lineTo(25, 27); g.stroke();
      g.beginPath(); g.moveTo(6, 31.5); g.lineTo(25, 31.5); g.stroke();
      oval(g, 21, 20, 4.5, 2.2, '#9fb2b8', -0.4);
      g.fillStyle = '#8aa0a8';
      g.beginPath(); g.moveTo(24, 18.5); g.lineTo(30, 15); g.lineTo(29, 21.5); g.closePath(); g.fill();
    });

    // Village cats: ginger supervisor, black-and-white auditor, grey asleep.
    make('paka', 3, (g, r, i) => {
      softShadow(g, 32, 54, 17, 5, 0.14);
      const coat = i === 0 ? '#c97f42' : i === 1 ? '#38342f' : '#9a938a';
      const belly = i === 1 ? '#e8e2d6' : shade(coat, 0.28);
      const ear = (x: number, y: number, flip: number) => {
        g.fillStyle = coat;
        g.beginPath();
        g.moveTo(x, y); g.lineTo(x + 3.6 * flip, y - 6.5); g.lineTo(x + 6.4 * flip, y + 0.5);
        g.closePath(); g.fill();
      };
      if (i === 2) {
        // Curled asleep: a cinnamon roll with ears.
        oval(g, 32, 45, 15, 10, coat);
        oval(g, 36, 47, 8, 5.5, belly);
        g.strokeStyle = shade(coat, -0.14);
        g.lineWidth = 4.2;
        g.beginPath(); g.moveTo(19, 46); g.quadraticCurveTo(30, 57, 45, 49); g.stroke();
        dot(g, 21, 40, 6.2, coat);
        ear(15, 37, 1); ear(21, 34.5, 1);
        g.strokeStyle = shade(coat, -0.3);
        g.lineWidth = 1.2;
        g.beginPath(); g.moveTo(17, 41); g.lineTo(21, 41.6); g.stroke();
      } else {
        // Sitting tall, supervising the lane.
        oval(g, 32, 45, 10, 10, coat);
        oval(g, 32, 49, 6, 5.4, belly);
        g.strokeStyle = shade(coat, -0.12);
        g.lineWidth = 3.8;
        g.beginPath(); g.moveTo(41, 50); g.quadraticCurveTo(52, 48, 50, 36); g.stroke();
        dot(g, 32, 30, 7.2, coat);
        ear(24.5, 27, 1); ear(39.5, 27, -1);
        if (i === 1) oval(g, 34, 32, 4.4, 3.4, belly);
        // Eyes: sea-glass green, unimpressed at any hour.
        dot(g, 29, 29.5, 1.7, '#a4c47a'); dot(g, 35, 29.5, 1.7, '#a4c47a');
        dot(g, 29, 29.5, 0.7, '#1c1410'); dot(g, 35, 29.5, 0.7, '#1c1410');
        if (i === 0) {
          g.strokeStyle = shade(coat, -0.18);
          g.lineWidth = 1.4;
          for (const sy2 of [40, 44]) {
            g.beginPath(); g.moveTo(25, sy2); g.quadraticCurveTo(32, sy2 + 2, 39, sy2); g.stroke();
          }
        }
        // Front paws, together, correct.
        oval(g, 29, 53, 2.6, 1.8, shade(coat, 0.1));
        oval(g, 35, 53, 2.6, 1.8, shade(coat, 0.1));
      }
      void r;
    });

    // A white chicken. The kanga inside the shop explains her confidence.
    make('kuku', 2, (g, r) => {
      softShadow(g, 32, 55, 14, 4, 0.14);
      g.strokeStyle = 'rgba(150,130,95,0.5)';
      g.lineWidth = 1.4;
      for (let k = 0; k < 3; k++) {
        g.beginPath(); g.moveTo(16 + k * 6, 53 + (k % 2)); g.lineTo(22 + k * 6, 56); g.stroke();
      }
      oval(g, 30, 41, 12, 9, '#f4efe2');
      oval(g, 20, 34, 5, 7.5, '#e9e2d0', 0.5);
      oval(g, 30, 42, 7, 5, '#e9e2d0', -0.3);
      oval(g, 41, 32, 4.5, 6.5, '#f4efe2');
      dot(g, 42, 25, 4.2, '#f4efe2');
      dot(g, 42, 20.5, 2, '#c1512f');
      dot(g, 44.5, 21.5, 1.5, '#c1512f');
      g.fillStyle = '#d8912e';
      g.beginPath(); g.moveTo(46, 25); g.lineTo(51, 26.5); g.lineTo(46, 28); g.closePath(); g.fill();
      dot(g, 43.5, 24.5, 1.1, '#2c2018');
      oval(g, 44.5, 29.5, 1.6, 2.2, '#c9705c');
      g.strokeStyle = '#d8912e';
      g.lineWidth = 2;
      g.beginPath(); g.moveTo(27, 49); g.lineTo(27 - (r.chance(0.5) ? 1 : 0), 56); g.stroke();
      g.beginPath(); g.moveTo(33, 49); g.lineTo(33, 56); g.stroke();
    });

    // Two flip-flops, one goal. Regulation size is whatever the sand says.
    make('flipflopgoal', 2, (g, r) => {
      oval(g, 32, 50, 22, 3, 'rgba(150,130,95,0.22)');
      const flop = (x: number, c: string, rot: number) => {
        oval(g, x, 46, 5, 9, c, rot);
        oval(g, x, 46, 3.6, 7.6, shade(c, 0.18), rot);
        g.strokeStyle = shade(c, -0.3);
        g.lineWidth = 1.6;
        g.beginPath();
        g.moveTo(x, 41.5); g.lineTo(x - 3, 47);
        g.moveTo(x, 41.5); g.lineTo(x + 3, 47);
        g.stroke();
      };
      flop(12, '#3f7fb0', -0.15);
      flop(52, r.chance(0.5) ? '#c1512f' : '#4d7440', 0.12);
      if (r.chance(0.5)) {
        // The rag ball rests where full time left it.
        dot(g, 34, 45, 4.5, '#b8a888');
        g.strokeStyle = 'rgba(90,75,55,0.6)';
        g.lineWidth = 1;
        g.beginPath(); g.arc(34, 45, 3, 0.5, 2.4); g.stroke();
      }
    });

    // What the tide forgot: a starfish, a shell, one crab with big plans.
    make('starfish', 3, (g, r, i) => {
      if (i === 0) {
        const c = r.chance(0.5) ? '#d9694a' : '#c98a2e';
        for (let k = 0; k < 5; k++) {
          const a = -Math.PI / 2 + (k / 5) * Math.PI * 2;
          oval(g, 32 + Math.cos(a) * 7, 45 + Math.sin(a) * 7, 7, 2.8, c, a);
        }
        dot(g, 32, 45, 4.6, c);
        for (let k = 0; k < 6; k++) dot(g, 28 + r.int(9), 41 + r.int(9), 0.8, shade(c, 0.25));
      } else if (i === 1) {
        // A fan shell, ribbed, holding a spoonful of sea.
        g.fillStyle = '#e9dfc8';
        g.beginPath();
        g.moveTo(32, 50);
        g.quadraticCurveTo(20, 46, 24, 38);
        g.quadraticCurveTo(32, 31, 40, 38);
        g.quadraticCurveTo(44, 46, 32, 50);
        g.closePath(); g.fill();
        g.strokeStyle = 'rgba(150,120,90,0.4)';
        g.lineWidth = 1.2;
        for (const dx of [-7, -3.5, 0, 3.5, 7]) {
          g.beginPath(); g.moveTo(32, 49); g.lineTo(32 + dx, 36); g.stroke();
        }
        oval(g, 32, 51.5, 6, 1.6, 'rgba(180,210,215,0.35)');
      } else {
        // The crab, commuting sideways with somewhere to be.
        oval(g, 32, 45, 6, 4.4, '#b0533a');
        g.strokeStyle = '#8a3a28';
        g.lineWidth = 1.4;
        for (const [lx, ly] of [[-7, -2], [-8, 1], [-7, 4], [7, -2], [8, 1], [7, 4]] as const) {
          g.beginPath(); g.moveTo(32, 45); g.lineTo(32 + lx, 45 + ly); g.stroke();
        }
        dot(g, 26, 41, 1.8, '#b0533a');
        dot(g, 38, 41, 1.8, '#b0533a');
        dot(g, 29.5, 42.5, 0.8, '#1c1410');
        dot(g, 34.5, 42.5, 0.8, '#1c1410');
        // Its footprints, briefly famous.
        for (let k = 0; k < 4; k++) dot(g, 42 + k * 3.4, 47 + (k % 2), 0.7, 'rgba(120,100,70,0.4)');
      }
    });

    // A woven doormat, shoes queued beside it: the household census.
    make('doormat', 2, (g, r) => {
      rr(g, 14, 32, 36, 20, 3, '#b89a68');
      rr(g, 16, 34, 32, 16, 2, '#c9ad78');
      g.strokeStyle = 'rgba(120,95,55,0.45)';
      g.lineWidth = 1.2;
      for (let k = 1; k < 4; k++) {
        g.beginPath(); g.moveTo(17, 34 + k * 4); g.lineTo(47, 34 + k * 4); g.stroke();
      }
      g.beginPath(); g.moveTo(32, 34); g.lineTo(32, 50); g.stroke();
      // The census itself.
      const pairs = 1 + r.int(2);
      for (let p = 0; p < pairs; p++) {
        const px2 = 20 + p * 14 + r.int(3);
        const c = p === 0 ? '#7a5636' : '#3f7fb0';
        oval(g, px2, 26, 2.6, 5, c, 0.1);
        oval(g, px2 + 6, 26, 2.6, 5, c, -0.1);
      }
    });

    // The shop radio, antenna aimed at Stone Town, taarab pouring out.
    make('radio', 1, (g) => {
      softShadow(g, 32, 52, 20, 5, 0.14);
      rr(g, 12, 30, 40, 22, 4, '#4e6b66');
      vgrad(g, 12, 30, 40, 6, 'rgba(255,252,240,0.25)', 'rgba(0,0,0,0)');
      rr(g, 15, 33, 20, 16, 2, '#33443f');
      g.strokeStyle = 'rgba(220,215,195,0.5)';
      g.lineWidth = 1.2;
      for (let k = 0; k < 4; k++) {
        g.beginPath(); g.moveTo(17, 36 + k * 3.4); g.lineTo(33, 36 + k * 3.4); g.stroke();
      }
      dot(g, 42, 38, 3.6, '#e9e0c6');
      dot(g, 42, 38, 1.2, '#4a3320');
      rr(g, 38, 44, 9, 3, 1.5, '#e9e0c6');
      g.strokeStyle = '#8b8f94';
      g.lineWidth = 1.8;
      g.beginPath(); g.moveTo(49, 30); g.lineTo(58, 10); g.stroke();
      dot(g, 58, 10, 1.6, '#b8bcc0');
    });

    // The cutting table's sewing kit: where a gora becomes two kangas.
    make('sewing', 1, (g) => {
      softShadow(g, 30, 52, 20, 5, 0.14);
      oval(g, 29, 43, 17, 10, '#a58a5c');
      oval(g, 29, 40, 15, 7, shade('#a58a5c', -0.12));
      g.strokeStyle = 'rgba(110,85,50,0.5)';
      g.lineWidth = 1.2;
      for (let k = 0; k < 3; k++) {
        g.beginPath(); g.moveTo(14, 42 + k * 3); g.quadraticCurveTo(29, 45 + k * 3, 44, 42 + k * 3); g.stroke();
      }
      // Rolled cloth, loud even folded.
      oval(g, 23, 38, 5, 3.4, '#c1512f', 0.2);
      oval(g, 30, 37, 5, 3.4, '#3f7fb0', -0.1);
      oval(g, 37, 38, 5, 3.4, '#4d7440', 0.15);
      // Scissors, open mid-thought.
      g.strokeStyle = '#6e7276';
      g.lineWidth = 2;
      g.beginPath(); g.moveTo(46, 30); g.lineTo(56, 40); g.moveTo(46, 40); g.lineTo(56, 30); g.stroke();
      dot(g, 45.5, 30.5, 2, '#5c6064');
      dot(g, 45.5, 39.5, 2, '#5c6064');
      // The tape measure, coiled like something tame.
      g.strokeStyle = '#e0c268';
      g.lineWidth = 2.4;
      g.beginPath(); g.arc(14, 30, 4.6, 0.4, 5.6); g.stroke();
      g.beginPath(); g.moveTo(18, 32); g.quadraticCurveTo(24, 34, 28, 31); g.stroke();
    });

    // ------------------------------------------------------------ talls

    // A rack of kangas: printed pairs, each hem carrying its saying.
    make('kangarack', 3, (g, r) => {
      softShadow(g, 32, 90, 24, 6, 0.2);
      const wood = '#7a5636';
      rr(g, 6, 20, 5, 70, 2, wood);
      rr(g, 53, 20, 5, 70, 2, wood);
      rr(g, 4, 16, 56, 6, 3, shade(wood, 0.1));
      // Three cloths, loud on purpose.
      for (let k = 0; k < 3; k++) {
        const c = KANGA_INKS[(r.int(6) + k * 2) % 6] ?? '#c1512f';
        const kx = 9 + k * 16;
        rr(g, kx, 22, 14, 54, 2, c);
        vgrad(g, kx, 22, 14, 10, 'rgba(255,255,255,0.22)', 'rgba(0,0,0,0)');
        // Border and the white jina band near the hem.
        rr(g, kx + 1.5, 64, 11, 7, 1.5, '#f2ead8');
        g.strokeStyle = 'rgba(40,28,18,0.6)';
        g.lineWidth = 1;
        for (let d2 = 0; d2 < 4; d2++) {
          g.beginPath();
          g.moveTo(kx + 3 + d2 * 2.4, 67.5);
          g.lineTo(kx + 4.4 + d2 * 2.4, 67.5);
          g.stroke();
        }
        // A paisley-ish medallion.
        dot(g, kx + 7, 42, 3.4, shade(c, 0.3));
        dot(g, kx + 7, 42, 1.6, shade(c, -0.2));
      }
    }, 64, 96);

    // Hurricane lamp on a pole: the night market does not open, it kindles.
    make('marketlamp', 2, (g) => {
      softShadow(g, 32, 90, 12, 4, 0.18);
      rr(g, 29, 24, 6, 66, 2, '#4a3a28');
      rr(g, 26, 20, 12, 6, 3, '#3a2d1e');
      // The lamp: glass belly in a wire cage, warm as a held match.
      oval(g, 32, 38, 9, 12, '#c9b48a');
      oval(g, 32, 38, 6.5, 9.5, '#f6dfa2');
      glowSpot(g, 32, 38, 16, '#ffefc0', 0.85);
      g.strokeStyle = 'rgba(50,38,24,0.7)';
      g.lineWidth = 1.6;
      g.beginPath(); g.moveTo(26, 32); g.lineTo(38, 32); g.stroke();
      g.beginPath(); g.moveTo(26, 44); g.lineTo(38, 44); g.stroke();
      rr(g, 28, 24, 8, 4, 2, '#3a2d1e');
      rr(g, 30, 48, 4, 4, 1.5, '#3a2d1e');
    }, 64, 96);

    // Ngalawa: one mango trunk, two outrigger arms, about as sinkable
    // as a water strider.
    make('ngalawa', 2, (g, r) => {
      softShadow(g, 64, 86, 44, 8, 0.2);
      const hull = shade('#6b4a30', (r.next() - 0.5) * 0.08);
      // Outrigger floats, fore and aft of the hull line.
      for (const oy of [58, 84]) {
        rr(g, 22, oy, 84, 7, 3.5, shade('#8a6a44', -0.1));
        vgrad(g, 22, oy, 84, 3, 'rgba(255,240,210,0.25)', 'rgba(0,0,0,0)');
      }
      // Booms lashing the floats to the hull.
      g.strokeStyle = '#57402c';
      g.lineWidth = 3;
      for (const bx of [36, 92]) {
        g.beginPath(); g.moveTo(bx, 60); g.quadraticCurveTo(bx + 2, 70, bx, 86); g.stroke();
      }
      // The dugout hull, slim, sheer rising to both ends.
      g.beginPath();
      g.moveTo(12, 74);
      g.quadraticCurveTo(64, 60, 116, 74);
      g.quadraticCurveTo(64, 84, 12, 74);
      g.closePath();
      const grad = g.createLinearGradient(0, 60, 0, 84);
      grad.addColorStop(0, shade(hull, 0.15));
      grad.addColorStop(1, shade(hull, -0.15));
      g.fillStyle = grad;
      g.fill();
      g.strokeStyle = shade(hull, -0.3);
      g.lineWidth = 2.4;
      g.beginPath(); g.moveTo(12, 74); g.quadraticCurveTo(64, 60, 116, 74); g.stroke();
      // The sheer stripe: every boat on this coast is painted, and no two
      // owners agree about which colour means good luck.
      const trim = KANGA_INKS[r.int(6)] ?? '#3f7fb0';
      g.strokeStyle = trim;
      g.lineWidth = 3.2;
      g.beginPath(); g.moveTo(15, 73.5); g.quadraticCurveTo(64, 62, 113, 73.5); g.stroke();
      g.strokeStyle = '#f2ead8';
      g.lineWidth = 1.2;
      g.beginPath(); g.moveTo(16, 76.5); g.quadraticCurveTo(64, 65.5, 112, 76.5); g.stroke();
      // The eye at the bow, so she can see where she is going.
      dot(g, 108, 71, 3, '#f2ead8');
      dot(g, 108.5, 71, 1.4, '#2c2018');
      // Mast raked aft, lateen yard stowed with the sail wrapped.
      g.strokeStyle = '#57402c';
      g.lineWidth = 3.6;
      g.beginPath(); g.moveTo(58, 68); g.lineTo(70, 12); g.stroke();
      g.strokeStyle = '#8a6a44';
      g.lineWidth = 3;
      g.beginPath(); g.moveTo(30, 34); g.lineTo(112, 20); g.stroke();
      // The wrapped sail along the yard.
      g.strokeStyle = '#e6dcc2';
      g.lineWidth = 5;
      g.beginPath(); g.moveTo(38, 33); g.lineTo(104, 22); g.stroke();
      g.strokeStyle = 'rgba(120,95,60,0.5)';
      g.lineWidth = 1.4;
      for (const tx of [50, 66, 82, 96]) {
        g.beginPath(); g.moveTo(tx, 36); g.lineTo(tx + 2, 20); g.stroke();
      }
    }, 128, 96);

    // A jahazi at anchor: the big cargo dhow, yard crossed like a drawn bow.
    make('dhow', 1, (g) => {
      // She sits in the sea, so the shadow reads as her reflection.
      oval(g, 96, 118, 62, 8, 'rgba(20,30,40,0.3)');
      const hull = '#6b4a30';
      // Hull with high stern and proud bow.
      g.beginPath();
      g.moveTo(20, 96);
      g.quadraticCurveTo(30, 78, 44, 74);
      g.lineTo(150, 74);
      g.quadraticCurveTo(172, 74, 178, 58);
      g.lineTo(178, 96);
      g.quadraticCurveTo(150, 112, 96, 112);
      g.quadraticCurveTo(44, 110, 20, 96);
      g.closePath();
      const grad = g.createLinearGradient(0, 60, 0, 112);
      grad.addColorStop(0, shade(hull, 0.18));
      grad.addColorStop(1, shade(hull, -0.2));
      g.fillStyle = grad;
      g.fill();
      // Strakes and the rubbing band.
      g.strokeStyle = shade(hull, -0.32);
      g.lineWidth = 2.4;
      g.beginPath(); g.moveTo(24, 92); g.quadraticCurveTo(96, 106, 176, 90); g.stroke();
      g.strokeStyle = shade(hull, 0.22);
      g.lineWidth = 2;
      g.beginPath(); g.moveTo(30, 82); g.quadraticCurveTo(96, 94, 174, 76); g.stroke();
      // Painted sheer, the way every jahazi in the channel wears it.
      g.strokeStyle = '#3f7fb0';
      g.lineWidth = 5;
      g.beginPath(); g.moveTo(28, 78); g.quadraticCurveTo(96, 90, 176, 72); g.stroke();
      g.strokeStyle = '#c1512f';
      g.lineWidth = 2;
      g.beginPath(); g.moveTo(28, 82.5); g.quadraticCurveTo(96, 94.5, 176, 76.5); g.stroke();
      // The heart-shaped transom hint at the stern.
      g.fillStyle = shade(hull, 0.3);
      g.beginPath();
      g.moveTo(170, 66); g.quadraticCurveTo(176, 58, 178, 66);
      g.quadraticCurveTo(178, 74, 173, 78); g.quadraticCurveTo(168, 72, 170, 66);
      g.closePath(); g.fill();
      // Waterline.
      oval(g, 98, 108, 76, 6, 'rgba(30,60,70,0.45)');
      // Mast raked forward, the long lateen yard slung on the diagonal.
      g.strokeStyle = '#57402c';
      g.lineWidth = 4.4;
      g.beginPath(); g.moveTo(84, 78); g.lineTo(102, 6); g.stroke();
      g.strokeStyle = '#8a6a44';
      g.lineWidth = 3.4;
      g.beginPath(); g.moveTo(34, 46); g.lineTo(166, 10); g.stroke();
      // Sail furled along the yard in fat wraps.
      g.strokeStyle = '#e6dcc2';
      g.lineWidth = 7;
      g.beginPath(); g.moveTo(44, 44); g.lineTo(158, 13); g.stroke();
      g.strokeStyle = 'rgba(120,95,60,0.55)';
      g.lineWidth = 1.6;
      for (const tx of [56, 76, 96, 116, 136]) {
        g.beginPath(); g.moveTo(tx, 48); g.lineTo(tx + 3, 30); g.stroke();
      }
      // Halyard and anchor line.
      g.strokeStyle = 'rgba(230,220,195,0.6)';
      g.lineWidth = 1.4;
      g.beginPath(); g.moveTo(100, 10); g.lineTo(88, 76); g.stroke();
      g.beginPath(); g.moveTo(26, 94); g.quadraticCurveTo(14, 104, 10, 118); g.stroke();
      // A small pennant at the masthead.
      g.fillStyle = PAL.terracotta;
      g.beginPath(); g.moveTo(102, 6); g.lineTo(116, 9); g.lineTo(102, 13); g.closePath(); g.fill();
    }, 192, 128);

    // The henna stall: a low stool, a pattern card, cones ready to draw.
    make('hennastool', 2, (g, r) => {
      softShadow(g, 26, 52, 16, 5, 0.16);
      // The stool, sat low and honest.
      oval(g, 26, 36, 12, 6, '#7a5636');
      oval(g, 26, 34.5, 10.5, 4.6, shade('#7a5636', 0.14));
      g.strokeStyle = shade('#7a5636', -0.2);
      g.lineWidth = 3;
      for (const [lx, ly] of [[-8, 0], [8, 0], [-3, 2], [5, 2]] as const) {
        g.beginPath(); g.moveTo(26 + lx, 38 + ly); g.lineTo(26 + lx * 1.15, 52); g.stroke();
      }
      // The pattern card, propped: vines a wedding would envy.
      rr(g, 42, 22, 16, 24, 2, '#f2ead8');
      g.strokeStyle = '#8a4a2e';
      g.lineWidth = 1.2;
      g.beginPath();
      g.moveTo(45, 42);
      g.quadraticCurveTo(52, 36, 47, 30);
      g.quadraticCurveTo(43, 26, 50, 24);
      g.stroke();
      for (let k = 0; k < 4; k++) dot(g, 47 + ((k * 7) % 9), 27 + k * 4.4, 1, '#8a4a2e');
      // Henna cones on a small tray, aimed and dangerous.
      oval(g, 22, 55, 11, 4, '#a5825a');
      for (let k = 0; k < 3; k++) {
        g.fillStyle = k === 1 ? '#4a3320' : '#3f2d1c';
        g.beginPath();
        g.moveTo(15 + k * 6.5, 57);
        g.lineTo(18 + k * 6.5, 49 - r.int(2));
        g.lineTo(21 + k * 6.5, 57);
        g.closePath();
        g.fill();
      }
    });

    // ------------------------------------------------- love-pass talls

    // Bao mid-game on a barrel. The pits are counted; do not touch the seeds.
    make('baoboard', 2, (g, r) => {
      softShadow(g, 32, 90, 22, 6, 0.2);
      // The barrel, retired from cargo into furniture.
      const stave = '#6b4a30';
      rr(g, 13, 56, 38, 32, 7, stave);
      vgrad(g, 13, 56, 38, 8, 'rgba(255,240,210,0.2)', 'rgba(0,0,0,0)');
      g.strokeStyle = shade(stave, -0.25);
      g.lineWidth = 1.4;
      for (const lx of [22, 32, 42]) {
        g.beginPath(); g.moveTo(lx, 58); g.lineTo(lx, 86); g.stroke();
      }
      g.strokeStyle = '#4a4038';
      g.lineWidth = 2.6;
      for (const hy of [63, 80]) {
        g.beginPath(); g.moveTo(13, hy); g.quadraticCurveTo(32, hy + 3, 51, hy); g.stroke();
      }
      // The board: a thin slab, overhanging just enough to worry about.
      const wood = '#8a6a44';
      rr(g, 4, 52, 56, 6, 2.5, shade(wood, -0.22));
      rr(g, 4, 36, 56, 18, 3.5, wood);
      vgrad(g, 4, 36, 56, 5, 'rgba(255,245,220,0.3)', 'rgba(0,0,0,0)');
      // Four ranks of eight pits, seeds mid-argument.
      for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 8; col++) {
          const px2 = 9.5 + col * 6.5;
          const py2 = 39.5 + row * 3.9;
          dot(g, px2, py2, 1.8, shade(wood, -0.35));
          if (r.chance(0.55)) dot(g, px2 - 0.4, py2 - 0.4, 0.9, '#d8cdb0');
        }
      }
      // Captured seeds on the barrel top: somebody is winning quietly.
      for (let k = 0; k < 5; k++) dot(g, 42 + r.int(8), 59 + r.int(3), 1.1, '#d8cdb0');
    }, 64, 96);

    // Madema: woven fish traps stacked like baskets that learned a trick.
    make('madema', 2, (g, r) => {
      softShadow(g, 32, 90, 25, 6, 0.2);
      const trap = (x: number, y: number, w: number, h: number) => {
        const c = shade('#b89a68', (r.next() - 0.5) * 0.12);
        rr(g, x, y, w, h, h / 2.2, c);
        vgrad(g, x, y, w, 5, 'rgba(255,245,220,0.28)', 'rgba(0,0,0,0)');
        g.save();
        g.beginPath();
        g.roundRect(x, y, w, h, h / 2.2);
        g.clip();
        g.strokeStyle = 'rgba(110,85,50,0.55)';
        g.lineWidth = 1.3;
        for (let k = -2; k < 8; k++) {
          g.beginPath(); g.moveTo(x + k * 7, y + h); g.lineTo(x + k * 7 + h, y); g.stroke();
          g.beginPath(); g.moveTo(x + k * 7, y); g.lineTo(x + k * 7 + h, y + h); g.stroke();
        }
        g.restore();
        // The mouth: in is easy, out is a riddle.
        oval(g, x + w - 6, y + h / 2, 4.6, h / 2.8, '#4a3a28');
        oval(g, x + w - 6.5, y + h / 2, 2.6, h / 4.4, '#2c2018');
      };
      trap(8, 68, 48, 20);
      trap(12, 50, 44, 19);
      trap(17, 34, 37, 17);
      // A float and line, off duty.
      g.strokeStyle = 'rgba(220,215,195,0.7)';
      g.lineWidth = 1.4;
      g.beginPath(); g.moveTo(10, 70); g.quadraticCurveTo(4, 80, 9, 88); g.stroke();
      dot(g, 9, 89, 2.6, '#d9694a');
    }, 64, 96);

    // Scaffolding: mangrove poles lashed with rope, not a nail anywhere.
    make('scaffold', 1, (g) => {
      softShadow(g, 32, 90, 22, 6, 0.18);
      const pole = (x1: number, y1: number, x2: number, y2: number, w: number, c: string) => {
        g.strokeStyle = c;
        g.lineWidth = w;
        g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke();
      };
      pole(14, 90, 15, 6, 4.4, '#8a6a44');
      pole(50, 90, 48, 8, 4.4, '#7a5a38');
      pole(6, 62, 58, 60, 3.6, '#8a6a44');
      pole(8, 32, 56, 30, 3.6, '#7a5a38');
      pole(14, 62, 49, 31, 3, '#6b5136');
      // A plank parked at working height, plus the mason's tin.
      rr(g, 4, 24, 54, 5.5, 2, '#a58a5c');
      g.strokeStyle = 'rgba(90,70,40,0.4)';
      g.lineWidth = 1;
      g.beginPath(); g.moveTo(6, 27); g.lineTo(56, 27); g.stroke();
      rr(g, 40, 17, 8, 7, 1.5, '#8b8f94');
      // Lashings at every joint: the knots are the oldest tech on the wall.
      g.strokeStyle = '#d9c9a0';
      g.lineWidth = 1.6;
      for (const [jx, jy] of [[14.5, 61], [49, 60.5], [15, 31.5], [48.5, 30.5]] as const) {
        for (let k = -1; k <= 1; k++) {
          g.beginPath(); g.moveTo(jx - 4, jy + k * 2.6 - 2); g.lineTo(jx + 4, jy + k * 2.6 + 2); g.stroke();
        }
      }
    }, 64, 96);

    // A line of kangas drying between houses, hems still talking.
    make('kangaline', 2, (g, r) => {
      softShadow(g, 18, 90, 10, 4, 0.16);
      softShadow(g, 110, 90, 10, 4, 0.16);
      for (const px2 of [16, 108]) {
        rr(g, px2, 20, 4.5, 70, 2, '#7a5636');
        vgrad(g, px2, 20, 4.5, 20, 'rgba(255,240,210,0.25)', 'rgba(0,0,0,0)');
      }
      g.strokeStyle = 'rgba(230,220,195,0.85)';
      g.lineWidth = 1.6;
      g.beginPath();
      g.moveTo(18, 26);
      g.quadraticCurveTo(64, 36, 110, 26);
      g.stroke();
      // Three cloths folded over the line, drying in pairs as they were born.
      const dips = [2.4, 4.6, 2.8];
      for (let k = 0; k < 3; k++) {
        const c = KANGA_INKS[(r.int(6) + k * 2) % 6] ?? '#c1512f';
        const kx = 23 + k * 28;
        const ky = 25 + (dips[k] ?? 3);
        rr(g, kx, ky, 26, 46, 2, c);
        rr(g, kx, ky - 2, 26, 7, 2, shade(c, -0.14));
        vgrad(g, kx, ky + 5, 26, 10, 'rgba(255,255,255,0.22)', 'rgba(0,0,0,0)');
        // Frame border, then the jina band: the sentence along the hem.
        g.strokeStyle = '#f2ead8';
        g.lineWidth = 1.6;
        g.strokeRect(kx + 2.5, ky + 3, 21, 40);
        rr(g, kx + 3, ky + 33, 20, 7.5, 1.5, '#f2ead8');
        g.strokeStyle = 'rgba(40,28,18,0.6)';
        g.lineWidth = 1;
        for (let d2 = 0; d2 < 6; d2++) {
          g.beginPath();
          g.moveTo(kx + 5 + d2 * 3.2, ky + 37);
          g.lineTo(kx + 6.8 + d2 * 3.2, ky + 37);
          g.stroke();
        }
        dot(g, kx + 13, ky + 17, 4.6, shade(c, 0.3));
        dot(g, kx + 13, ky + 17, 2.2, shade(c, -0.2));
        // Clothespins, on duty.
        rr(g, kx + 3, ky - 4, 2.2, 6, 1, '#a58a5c');
        rr(g, kx + 21, ky - 4, 2.2, 6, 1, '#a58a5c');
      }
    }, 128, 96);

    // A spare lateen sail furled on its spar, resting across two trestles.
    make('sailspar', 1, (g) => {
      softShadow(g, 26, 90, 16, 5, 0.18);
      softShadow(g, 102, 88, 16, 5, 0.18);
      // Trestles, crossed like patient legs.
      g.strokeStyle = '#6b4a30';
      g.lineWidth = 3.6;
      for (const tx of [26, 102]) {
        g.beginPath(); g.moveTo(tx - 11, 88); g.lineTo(tx + 9, 60); g.stroke();
        g.beginPath(); g.moveTo(tx + 11, 88); g.lineTo(tx - 9, 60); g.stroke();
      }
      // The spar, one long true line.
      g.strokeStyle = '#8a6a44';
      g.lineWidth = 4;
      g.beginPath(); g.moveTo(2, 62); g.lineTo(126, 56); g.stroke();
      // The sail in fat wraps: folded wind.
      g.strokeStyle = '#e6dcc2';
      g.lineWidth = 11;
      g.beginPath(); g.moveTo(12, 61); g.lineTo(116, 56); g.stroke();
      g.strokeStyle = 'rgba(120,95,60,0.35)';
      g.lineWidth = 3;
      g.beginPath(); g.moveTo(12, 64.5); g.lineTo(116, 59.5); g.stroke();
      // Ties every armspan, and one rope coiled where work paused.
      g.strokeStyle = 'rgba(120,95,60,0.55)';
      g.lineWidth = 1.6;
      for (const tx of [24, 44, 64, 84, 104]) {
        g.beginPath(); g.moveTo(tx, 66); g.lineTo(tx + 2, 51); g.stroke();
      }
      g.strokeStyle = '#c9b48a';
      g.lineWidth = 2.2;
      g.beginPath(); g.arc(48, 84, 5, 0, Math.PI * 2); g.stroke();
      g.beginPath(); g.arc(48, 84, 2.4, 0, Math.PI * 2); g.stroke();
    }, 128, 96);

    // Makuti: plaited coconut thatch on two mangrove poles, thrown out over
    // the baraza so the shade arrives before you do.
    make('makuti', 2, (g, r) => {
      softShadow(g, 24, 90, 12, 4, 0.2);
      softShadow(g, 104, 90, 12, 4, 0.2);
      // The shade it throws, which is the entire point of the thing.
      oval(g, 64, 76, 52, 16, 'rgba(45,34,20,0.24)');
      // Poles, planted at a working angle rather than a surveyed one.
      g.strokeStyle = '#7a5636';
      g.lineWidth = 4.6;
      g.lineCap = 'round';
      g.beginPath(); g.moveTo(22, 90); g.lineTo(25, 36); g.stroke();
      g.beginPath(); g.moveTo(106, 88); g.lineTo(102, 36); g.stroke();
      // The ridge pole, and a cross tie lashed under it.
      g.strokeStyle = '#8a6a44';
      g.lineWidth = 3.6;
      g.beginPath(); g.moveTo(14, 36); g.lineTo(114, 33); g.stroke();
      g.strokeStyle = 'rgba(210,190,150,0.6)';
      g.lineWidth = 1.6;
      for (const jx of [24, 103]) {
        for (let k = -1; k <= 1; k++) {
          g.beginPath(); g.moveTo(jx - 5, 36 + k * 3); g.lineTo(jx + 5, 38 + k * 3); g.stroke();
        }
      }
      // The thatch: rows of plaited fronds, each one a little tired.
      for (let row = 0; row < 5; row++) {
        const ty = 10 + row * 6;
        const c = shade(row % 2 ? '#b08b4e' : '#9d7740', (r.next() - 0.5) * 0.1);
        g.fillStyle = c;
        g.beginPath();
        g.moveTo(6, ty + 12);
        g.quadraticCurveTo(64, ty - 4, 122, ty + 11);
        g.quadraticCurveTo(64, ty + 8, 6, ty + 12);
        g.closePath();
        g.fill();
        g.strokeStyle = 'rgba(84,60,30,0.42)';
        g.lineWidth = 1.2;
        for (let k = 0; k < 16; k++) {
          const fx = 8 + k * 7.4;
          g.beginPath();
          g.moveTo(fx, ty + 10 - Math.abs(k - 7.5) * 0.5);
          g.lineTo(fx + 3, ty + 3 - Math.abs(k - 7.5) * 0.5);
          g.stroke();
        }
      }
      // The eave line, and its shadow on whatever is sitting underneath.
      g.strokeStyle = 'rgba(70,50,26,0.5)';
      g.lineWidth = 2;
      g.beginPath(); g.moveTo(6, 42); g.quadraticCurveTo(64, 28, 122, 41); g.stroke();
      vgrad(g, 10, 42, 108, 16, 'rgba(38,28,16,0.32)', 'rgba(0,0,0,0)');
      // A hurricane lamp hooked on the ridge, waiting for its hour.
      if (r.chance(0.6)) {
        g.strokeStyle = '#4a3a28';
        g.lineWidth = 1.8;
        g.beginPath(); g.moveTo(84, 37); g.lineTo(84, 46); g.stroke();
        oval(g, 84, 52, 5.5, 7, '#c9b48a');
        oval(g, 84, 52, 3.6, 5, '#f6dfa2');
      }
      // A rolled mat leaned against one pole, and a bundle of spare fronds.
      rr(g, 28, 56, 8, 34, 4, '#c9a86a');
      g.strokeStyle = 'rgba(120,95,60,0.5)';
      g.lineWidth = 1.2;
      g.beginPath(); g.moveTo(32, 58); g.lineTo(32, 88); g.stroke();
      g.strokeStyle = '#8a7a3e';
      g.lineWidth = 2.6;
      for (let k = 0; k < 4; k++) {
        g.beginPath(); g.moveTo(96 + k * 3, 88); g.lineTo(104 + k * 4, 62); g.stroke();
      }
    }, 128, 96);

    // Mkokoteni: the two-wheeled handcart, tipped onto its shafts, still
    // holding whatever it was hauling when the tea happened.
    make('mkokoteni', 2, (g, r) => {
      softShadow(g, 34, 90, 26, 6, 0.2);
      // The shafts, tipped up because nobody unloads a cart they can lean.
      g.strokeStyle = '#7a5636';
      g.lineWidth = 4;
      g.lineCap = 'round';
      g.beginPath(); g.moveTo(18, 66); g.lineTo(50, 20); g.stroke();
      g.beginPath(); g.moveTo(26, 70); g.lineTo(57, 26); g.stroke();
      g.strokeStyle = '#8a6a44';
      g.lineWidth = 2.4;
      g.beginPath(); g.moveTo(49, 22); g.lineTo(56, 28); g.stroke();
      // The bed: rough planks, one replaced more recently than the others.
      rr(g, 6, 56, 42, 24, 3, '#8a6a44');
      vgrad(g, 6, 56, 42, 7, 'rgba(255,245,220,0.28)', 'rgba(0,0,0,0)');
      g.strokeStyle = 'rgba(90,70,40,0.5)';
      g.lineWidth = 1.3;
      for (const ly of [63, 70, 76]) {
        g.beginPath(); g.moveTo(7, ly); g.lineTo(47, ly); g.stroke();
      }
      rr(g, 6, 63, 42, 6, 1.5, shade('#a58a5c', 0.08));
      // The wheel, iron-tyred, sunk a finger into the sand.
      g.strokeStyle = '#2e2a26';
      g.lineWidth = 3;
      g.beginPath(); g.arc(30, 78, 12, 0, Math.PI * 2); g.stroke();
      g.lineWidth = 1.8;
      for (let k = 0; k < 6; k++) {
        const a = (k / 6) * Math.PI * 2;
        g.beginPath();
        g.moveTo(30, 78);
        g.lineTo(30 + Math.cos(a) * 11, 78 + Math.sin(a) * 11);
        g.stroke();
      }
      dot(g, 30, 78, 3.4, '#4a4038');
      // The load: sacks and one crate of somebody's whole morning.
      rr(g, 10, 40, 20, 18, 5, '#a58a5c');
      rr(g, 9, 36, 22, 8, 4, shade('#a58a5c', 0.14));
      oval(g, 20, 38, 7, 3, r.chance(0.5) ? '#c98a2e' : '#a04a28');
      rr(g, 30, 44, 16, 14, 2, '#8a6a44');
      g.strokeStyle = 'rgba(90,70,40,0.5)';
      g.lineWidth = 1.2;
      g.beginPath(); g.moveTo(30, 50); g.lineTo(46, 50); g.stroke();
      if (r.chance(0.6)) {
        for (let k = 0; k < 3; k++) oval(g, 33 + k * 5, 42, 3.4, 2.4, '#8fae4f');
      }
    }, 64, 96);

    // ------------------------------------------------------------ nyumba

    // 352x256, casa-compatible geometry: coral-rag house under lime wash,
    // flat roof and parapet, and a carved door worth a whole examine.
    make('nyumba', 4, (g, r) => {
      const W = 352;
      const wash = shade(CORAL_WASHES[r.int(6)] ?? '#f0e9d9', (r.next() - 0.5) * 0.04);
      const wallTop = 96;
      const wallBot = 252;

      // The wall.
      vgrad(g, 16, wallTop, W - 32, wallBot - wallTop, shade(wash, 0.05), shade(wash, -0.07));
      // Damp rising from the base, the sea remembering itself.
      vgrad(g, 16, wallBot - 22, W - 32, 22, 'rgba(0,0,0,0)', 'rgba(110,95,70,0.28)');
      // A patch where the wash lost and the coral rag shows: reef, stacked.
      if (r.chance(0.85)) {
        const px2 = r.chance(0.5) ? 34 : W - 112;
        const py2 = wallBot - 66 - r.int(60);
        rr(g, px2, py2, 70, 44, 10, '#cabfa4');
        for (let k = 0; k < 9; k++) {
          oval(g, px2 + 10 + r.int(52), py2 + 8 + r.int(30), 6 + r.int(4), 4.4, shade('#cabfa4', (r.next() - 0.45) * 0.2));
        }
      }
      // Soft tone patches so big walls never go flat.
      for (let i = 0; i < 5; i++) {
        glowSpot(g, 30 + r.int(W - 60), wallTop + 20 + r.int(100), 26, shade(wash, (r.next() - 0.5) * 0.09), 0.5);
      }
      // Side shade.
      g.save();
      g.globalAlpha = 0.15;
      g.fillStyle = '#1c1712';
      g.fillRect(W - 26, wallTop, 10, wallBot - wallTop);
      g.restore();

      // The carved door, same footprint as casa so village grids match.
      const arched = r.chance(0.6);
      const doorWood = r.chance(0.5) ? '#4a3320' : '#3f2d1c';
      rr(g, 146, wallBot - 102, 74, 102, 6, shade(wash, -0.3));
      if (arched) {
        g.fillStyle = shade(doorWood, -0.22);
        g.beginPath();
        g.moveTo(150, wallBot); g.lineTo(150, wallBot - 78);
        g.quadraticCurveTo(183, wallBot - 112, 216, wallBot - 78); g.lineTo(216, wallBot);
        g.closePath(); g.fill();
        g.fillStyle = doorWood;
        g.beginPath();
        g.moveTo(156, wallBot); g.lineTo(156, wallBot - 74);
        g.quadraticCurveTo(183, wallBot - 102, 210, wallBot - 74); g.lineTo(210, wallBot);
        g.closePath(); g.fill();
      } else {
        rr(g, 150, wallBot - 96, 66, 96, 4, shade(doorWood, -0.22));
        rr(g, 156, wallBot - 88, 54, 88, 3, doorWood);
        // Chain motif carved along the lintel, for protection.
        g.strokeStyle = 'rgba(230,215,180,0.5)';
        g.lineWidth = 1.6;
        for (let k = 0; k < 7; k++) {
          g.beginPath(); g.arc(154 + k * 10, wallBot - 92, 3, 0, Math.PI * 2); g.stroke();
        }
      }
      // Brass studs in ranks; the door is the house's face.
      for (let ry = 0; ry < 5; ry++) {
        for (let rx2 = 0; rx2 < 3; rx2++) {
          dot(g, 166 + rx2 * 17, wallBot - 72 + ry * 14, 3, shade(PAL.gold, 0.12));
          dot(g, 165 + rx2 * 17, wallBot - 73 + ry * 14, 1.2, '#fdf3d0');
        }
      }
      // Center seam and carved jamb bands.
      g.strokeStyle = 'rgba(18,12,8,0.55)';
      g.lineWidth = 2.4;
      g.beginPath(); g.moveTo(183, wallBot - (arched ? 96 : 84)); g.lineTo(183, wallBot - 4); g.stroke();
      g.strokeStyle = 'rgba(240,228,200,0.28)';
      g.lineWidth = 2;
      for (const jx of [152, 214]) {
        g.beginPath(); g.moveTo(jx, wallBot - 76); g.lineTo(jx, wallBot - 6); g.stroke();
      }

      // Baraza ledges grown into the wall, flanking the door.
      if (r.chance(0.7)) {
        for (const bx of [58, 232]) {
          rr(g, bx, wallBot - 26, 62, 26, 4, shade(wash, -0.1));
          rr(g, bx - 3, wallBot - 30, 68, 9, 4, shade(wash, 0.09));
          g.strokeStyle = 'rgba(120,100,70,0.3)';
          g.lineWidth = 1.4;
          g.beginPath(); g.moveTo(bx + 30, wallBot - 20); g.lineTo(bx + 30, wallBot - 4); g.stroke();
        }
      }

      // Windows, casa geometry, shutters the color of old lagoons.
      const shut = r.chance(0.5) ? '#4e6b66' : '#43596b';
      for (const wx of [52, 252]) {
        rr(g, wx, wallTop + 34, 48, 44, 6, shade(wash, -0.28));
        rr(g, wx + 4, wallTop + 38, 40, 36, 5, '#2c3140');
        vgrad(g, wx + 4, wallTop + 38, 40, 13, 'rgba(210,225,235,0.35)', 'rgba(0,0,0,0)');
        g.strokeStyle = '#57402c';
        g.lineWidth = 3;
        g.beginPath(); g.moveTo(wx + 24, wallTop + 38); g.lineTo(wx + 24, wallTop + 74); g.stroke();
        for (const shx of [wx - 14, wx + 48]) {
          rr(g, shx, wallTop + 36, 14, 44, 3, shade(shut, (r.next() - 0.5) * 0.1));
          g.strokeStyle = 'rgba(25,35,34,0.5)';
          g.lineWidth = 1.6;
          for (let k = 1; k < 4; k++) {
            g.beginPath();
            g.moveTo(shx + 2, wallTop + 36 + k * 11);
            g.lineTo(shx + 12, wallTop + 36 + k * 11);
            g.stroke();
          }
        }
        rr(g, wx - 3, wallTop + 78, 54, 8, 4, shade(wash, 0.12));
      }

      // Eave shadow under the parapet, then the parapet band itself.
      vgrad(g, 16, wallTop + 8, W - 32, 14, 'rgba(25,20,14,0.32)', 'rgba(0,0,0,0)');
      rr(g, 10, wallTop - 18, W - 20, 26, 6, shade(wash, -0.1));
      vgrad(g, 10, wallTop - 18, W - 20, 8, 'rgba(255,252,240,0.3)', 'rgba(0,0,0,0)');
      // Crenel notches along the parapet, old Omani habit.
      g.fillStyle = shade(wash, -0.22);
      for (let k = 0; k < 7; k++) {
        rr(g, 34 + k * 46, wallTop - 18, 12, 8, 2, shade(wash, -0.2));
      }
      // Sometimes a kanga drying over the parapet, one loud flag of laundry.
      if (r.chance(0.5)) {
        const kx = 60 + r.int(200);
        const c = KANGA_INKS[r.int(6)] ?? '#c1512f';
        rr(g, kx, wallTop - 14, 38, 26, 3, c);
        rr(g, kx + 3, wallTop + 4, 32, 5, 1.5, '#f2ead8');
        vgrad(g, kx, wallTop - 14, 38, 8, 'rgba(255,255,255,0.25)', 'rgba(0,0,0,0)');
      }
    }, 352, 256);
  },
};
