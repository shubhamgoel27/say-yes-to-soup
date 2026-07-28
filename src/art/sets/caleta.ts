import type { ChapterArt } from './index';
import { dot, oval, rr, rect, vgrad, softShadow, shade } from '../pix';

/**
 * La Caleta decor art: the working clutter of a caballito village on the
 * desert north coast. Salt-faded paint, garua-grey light, everything either
 * drying, waiting, or watching. Painted in the smooth idiom: soft gradients,
 * value contrast, no outlines of its own (the tileset inks what needs it).
 */

export const ART: ChapterArt = {
  grounded: [
    'saltrack', 'dryreeds', 'netpoles', 'crabtraps', 'buoywall', 'kidmural',
    'pelicanpost', 'gallinazos', 'mototaxi', 'picchairs', 'pizarra',
    'tendal', 'pintura',
  ],
  noInk: ['seaweed', 'jellyfish'],
  /** Inside the picantería is inside La Caleta, not inside the Andes. */
  skins: {
    picanteria: { wallInt: 'wallQuincha', floorEarth: 'floorCemento' },
  },

  paint(make) {
    // ------------------------------------------------------------- flats

    // Tide wrack: yuyo torn loose by the surf, drying into dark ribbons.
    make('seaweed', 3, (g, r) => {
      oval(g, 32, 40, 22, 7, 'rgba(120,135,125,0.14)'); // the damp it keeps
      for (let i = 0; i < 4; i++) {
        const x0 = 8 + r.int(18);
        const y0 = 30 + r.int(16);
        g.strokeStyle = shade(r.chance(0.6) ? '#45543c' : '#5c4a38', (r.next() - 0.5) * 0.1);
        g.lineWidth = 3 + r.next() * 1.6;
        g.lineCap = 'round';
        g.beginPath();
        g.moveTo(x0, y0);
        g.quadraticCurveTo(x0 + 14 + r.int(8), y0 - 6 + r.int(12), x0 + 30 + r.int(12), y0 + (r.next() - 0.5) * 8);
        g.stroke();
      }
      // Bladder beads along one strand.
      for (let i = 0; i < 3; i++) dot(g, 18 + i * 9 + r.int(3), 36 + r.int(6), 1.8, '#6b7a4a');
      if (r.chance(0.5)) dot(g, 12 + r.int(40), 46, 2.2, '#f0e7d2'); // one shell caught in it
    });

    // A stranded jellyfish, clear as a spilled dessert. Do not poke.
    make('jellyfish', 2, (g, r) => {
      oval(g, 32, 38, 19, 9, 'rgba(110,130,132,0.2)'); // wet ring
      oval(g, 32, 33, 14, 10, 'rgba(196,214,222,0.75)');
      oval(g, 32, 31, 10, 7, 'rgba(238,246,248,0.65)');
      // The bell rim, faintly lavender: the sea's one soft opinion.
      g.strokeStyle = 'rgba(150,140,175,0.5)';
      g.lineWidth = 2;
      g.beginPath();
      g.ellipse(32, 34, 13.4, 9, 0, Math.PI * 0.08, Math.PI * 0.92);
      g.stroke();
      // Four pale inner rings, the jellyfish's only anatomy anyone can name.
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2 + 0.6;
        oval(g, 32 + Math.cos(a) * 4.5, 31 + Math.sin(a) * 3, 2.6, 1.8, 'rgba(205,155,145,0.4)');
      }
      // Frilled skirt melting into the sand.
      g.strokeStyle = 'rgba(190,208,214,0.45)';
      g.lineWidth = 2;
      for (let i = 0; i < 5; i++) {
        const x = 21 + i * 5.5;
        g.beginPath();
        g.moveTo(x, 40);
        g.quadraticCurveTo(x + 2, 43 + r.int(2), x + 4, 41);
        g.stroke();
      }
      dot(g, 27, 28, 2.2, 'rgba(255,255,255,0.55)'); // sheen
    });

    // A wheelbarrow heaped with concha shells from the picanteria.
    make('shellbarrow', 1, (g, r) => {
      softShadow(g, 32, 54, 24, 6, 0.18);
      // Legs and wheel first, tray over them.
      g.strokeStyle = '#4a3a28';
      g.lineWidth = 3;
      g.beginPath();
      g.moveTo(44, 44); g.lineTo(50, 56); g.moveTo(34, 44); g.lineTo(36, 56);
      g.stroke();
      dot(g, 14, 50, 7, '#3d2f20');
      dot(g, 14, 50, 2.4, '#8a8378');
      // The tray, an honest old blue going to rust.
      rr(g, 8, 28, 46, 17, 4, '#4e7d8a');
      vgrad(g, 8, 28, 46, 6, 'rgba(255,255,255,0.18)', 'rgba(0,0,0,0)');
      for (let i = 0; i < 4; i++) dot(g, 12 + r.int(38), 34 + r.int(8), 1.6, 'rgba(160,86,60,0.7)');
      // Handles reaching back.
      g.strokeStyle = '#5c4630';
      g.lineWidth = 3.4;
      g.beginPath();
      g.moveTo(52, 32); g.lineTo(61, 26); g.moveTo(52, 40); g.lineTo(61, 36);
      g.stroke();
      // The heap of shells, a small pale mountain range.
      for (let i = 0; i < 11; i++) {
        const x = 14 + r.int(34);
        const y = 22 + r.int(9);
        const c = r.pick(['#f0e7d2', '#e8cfc0', '#d9c298', '#cbb695']);
        oval(g, x, y, 3.4 + r.next() * 1.4, 2.4 + r.next(), c);
        g.strokeStyle = 'rgba(140,110,80,0.35)';
        g.lineWidth = 0.8;
        g.beginPath();
        g.moveTo(x - 2, y);
        g.lineTo(x + 2, y - 1);
        g.stroke();
      }
    });

    // Don Wili's spare bottles: green, amber, and the unlabeled one.
    make('emolcrate', 1, (g, r) => {
      softShadow(g, 32, 54, 20, 5, 0.18);
      rr(g, 14, 32, 36, 22, 3, '#9b7a50');
      vgrad(g, 14, 32, 36, 6, 'rgba(255,240,210,0.2)', 'rgba(0,0,0,0)');
      g.strokeStyle = 'rgba(50,36,20,0.45)';
      g.lineWidth = 2;
      g.strokeRect(16, 34, 32, 18);
      g.beginPath(); g.moveTo(32, 34); g.lineTo(32, 52); g.stroke();
      // Bottle shoulders over the rim, straw between them.
      const juices = ['#5a7d4a', '#c98a2e', '#5a7d4a', '#8a6a44'];
      for (let i = 0; i < 4; i++) {
        const bx = 18 + i * 8;
        rr(g, bx, 22, 6, 12, 2.5, juices[i] ?? '#5a7d4a');
        rr(g, bx + 1.5, 18, 3, 5, 1.5, shade(juices[i] ?? '#5a7d4a', -0.15));
        dot(g, bx + 3, 17.5, 1.8, '#c9c4bb');
        g.strokeStyle = 'rgba(255,255,255,0.3)';
        g.lineWidth = 1.2;
        g.beginPath(); g.moveTo(bx + 1.5, 24); g.lineTo(bx + 1.5, 31); g.stroke();
      }
      for (let i = 0; i < 5; i++) {
        g.strokeStyle = 'rgba(200,165,91,0.6)';
        g.lineWidth = 1;
        const sx = 16 + r.int(30);
        g.beginPath(); g.moveTo(sx, 33); g.lineTo(sx + 3, 30); g.stroke();
      }
    });

    // The village cat, asleep wherever the fish smell is best.
    make('gato', 2, (g, r, i) => {
      softShadow(g, 32, 50, 15, 4.5, 0.16);
      const fur = i === 0 ? '#8a7a66' : '#2e2620';
      const dark = shade(fur, -0.18);
      if (i === 0) {
        // Curled: a cinnamon-roll of cat.
        oval(g, 32, 42, 14, 9, fur);
        oval(g, 35, 40, 9, 6, shade(fur, 0.07));
        // Tail wrapped around the front.
        g.strokeStyle = dark;
        g.lineWidth = 5;
        g.lineCap = 'round';
        g.beginPath();
        g.moveTo(20, 45);
        g.quadraticCurveTo(32, 52, 44, 46);
        g.stroke();
        // Head tucked, ears up anyway.
        dot(g, 22, 38, 6, fur);
        g.fillStyle = dark;
        g.beginPath(); g.moveTo(17, 34); g.lineTo(19, 28); g.lineTo(22, 33); g.closePath(); g.fill();
        g.beginPath(); g.moveTo(23, 32); g.lineTo(26, 27); g.lineTo(28, 33); g.closePath(); g.fill();
        // Stripes, lightly.
        g.strokeStyle = 'rgba(60,48,36,0.4)';
        g.lineWidth = 1.6;
        for (let k = 0; k < 3; k++) {
          g.beginPath();
          g.moveTo(30 + k * 5, 34);
          g.quadraticCurveTo(32 + k * 5, 40, 30 + k * 5, 46);
          g.stroke();
        }
      } else {
        // Loaf: all paws filed away, management position.
        oval(g, 33, 43, 13, 8, fur);
        oval(g, 36, 41, 8, 5, shade(fur, 0.08));
        dot(g, 21, 37, 6.5, fur);
        g.fillStyle = dark;
        g.beginPath(); g.moveTo(16, 33); g.lineTo(18, 26); g.lineTo(21, 32); g.closePath(); g.fill();
        g.beginPath(); g.moveTo(23, 31); g.lineTo(26, 26); g.lineTo(28, 32); g.closePath(); g.fill();
        g.strokeStyle = dark;
        g.lineWidth = 4;
        g.lineCap = 'round';
        g.beginPath();
        g.moveTo(45, 45);
        g.quadraticCurveTo(50, 48, 47, 51);
        g.stroke();
      }
      // A closed eye: one calm line.
      g.strokeStyle = 'rgba(20,14,10,0.6)';
      g.lineWidth = 1.4;
      g.beginPath();
      g.moveTo(18, 37);
      g.quadraticCurveTo(20, 38.4, 22, 37.4);
      g.stroke();
      void r;
    });

    // A bench built from what the sea returned. It faces the water.
    make('driftbench', 2, (g, r) => {
      softShadow(g, 32, 52, 24, 5, 0.18);
      // Driftwood stumps, sanded pale by salt.
      rr(g, 10, 38, 9, 15, 3, shade('#8f8578', (r.next() - 0.5) * 0.08));
      rr(g, 45, 38, 9, 15, 3, shade('#87796a', (r.next() - 0.5) * 0.08));
      // Two planks that used to be a boat, one still faintly blue.
      rr(g, 4, 29, 56, 6.5, 3, shade('#9aa8ae', (r.next() - 0.5) * 0.06));
      rr(g, 4, 37, 56, 6.5, 3, shade('#7f9fb5', -0.04));
      vgrad(g, 4, 29, 56, 3, 'rgba(255,255,255,0.22)', 'rgba(0,0,0,0)');
      // Paint losing to weather, plank by plank.
      for (let i = 0; i < 4; i++) {
        oval(g, 10 + r.int(44), 39 + r.int(3), 2.6, 1.4, 'rgba(220,215,200,0.55)');
      }
      dot(g, 20 + r.int(24), 32, 1.8, '#4a4038'); // a knothole
    });

    // Limones: small, mean, perfect. (Picanteria.)
    make('limebasket', 1, (g, r) => {
      softShadow(g, 32, 52, 17, 5, 0.16);
      rr(g, 16, 32, 32, 19, 6, '#a8854a');
      g.strokeStyle = 'rgba(110,80,42,0.5)';
      g.lineWidth = 1.8;
      for (const wy of [37, 42, 47]) {
        g.beginPath(); g.moveTo(17, wy); g.lineTo(47, wy); g.stroke();
      }
      for (let wx = 20; wx < 46; wx += 6) {
        g.beginPath(); g.moveTo(wx, 33); g.lineTo(wx, 50); g.stroke();
      }
      rr(g, 14, 30, 36, 5, 2.5, '#8a6238');
      // The heap, and one escapee.
      for (let i = 0; i < 8; i++) {
        const x = 20 + r.int(24);
        const y = 24 + r.int(7);
        dot(g, x, y, 3.4 + r.next(), shade(r.pick(['#7d9b3f', '#8fae4f', '#6b8a36']), (r.next() - 0.5) * 0.08));
        dot(g, x - 1, y - 1, 1, 'rgba(255,255,240,0.35)');
      }
      dot(g, 52, 50, 3.6, '#7d9b3f');
    });

    // The radio that came with the walls, playing cumbia to the stools.
    make('laradio', 1, (g) => {
      softShadow(g, 32, 56, 18, 5, 0.16);
      rr(g, 14, 42, 36, 13, 2, '#7a5636'); // its crate, also permanent
      g.strokeStyle = 'rgba(50,36,20,0.45)';
      g.lineWidth = 1.8;
      g.strokeRect(16, 44, 32, 9);
      // The radio: wood case, cream face, one gold dial.
      rr(g, 16, 24, 32, 19, 3.5, '#5c4630');
      vgrad(g, 16, 24, 32, 6, 'rgba(255,240,210,0.16)', 'rgba(0,0,0,0)');
      rr(g, 19, 27, 17, 13, 2, '#e8dcc4');
      g.strokeStyle = 'rgba(90,70,48,0.6)';
      g.lineWidth = 1.6;
      for (const gx of [22, 26, 30]) {
        g.beginPath(); g.moveTo(gx, 29); g.lineTo(gx, 38); g.stroke();
      }
      dot(g, 42, 31, 3.2, '#c9a35f');
      dot(g, 42, 38, 2, '#3d2f20');
      // Antenna, aimed at Trujillo on faith alone.
      g.strokeStyle = '#4a4038';
      g.lineWidth = 1.8;
      g.beginPath();
      g.moveTo(46, 24);
      g.lineTo(56, 8);
      g.stroke();
      dot(g, 56, 8, 1.6, '#8a8378');
    });

    // ------------------------------------------------------------- talls

    // Salted lisa on a cane rack, going stiff and golden in the fog.
    make('saltrack', 2, (g, r) => {
      softShadow(g, 32, 90, 24, 5, 0.2);
      // A-frames.
      g.strokeStyle = '#8a6a44';
      g.lineWidth = 3.4;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(10, 88); g.lineTo(16, 38); g.moveTo(22, 88); g.lineTo(16, 38);
      g.moveTo(42, 88); g.lineTo(48, 38); g.moveTo(54, 88); g.lineTo(48, 38);
      g.stroke();
      // Rails.
      g.lineWidth = 3;
      g.beginPath();
      g.moveTo(12, 42); g.lineTo(52, 40);
      g.moveTo(11, 60); g.lineTo(53, 58);
      g.stroke();
      // Butterflied fish over the rails, salt-pale kites.
      const fish = (x: number, y: number, s: number) => {
        const c = shade('#ecd9ac', (r.next() - 0.5) * 0.08);
        g.fillStyle = c;
        g.beginPath();
        g.moveTo(x, y - 7 * s);
        g.quadraticCurveTo(x + 6 * s, y - 2 * s, x + 3 * s, y + 7 * s);
        g.lineTo(x - 3 * s, y + 7 * s);
        g.quadraticCurveTo(x - 6 * s, y - 2 * s, x, y - 7 * s);
        g.closePath();
        g.fill();
        g.strokeStyle = 'rgba(150,115,70,0.5)';
        g.lineWidth = 1.2;
        g.beginPath();
        g.moveTo(x, y - 6 * s);
        g.lineTo(x, y + 6 * s);
        g.stroke();
        dot(g, x - 1.5 * s, y - 5 * s, 1, '#4a3a28');
        // Salt dusting.
        dot(g, x + 1.5 * s, y + 2 * s, 0.8, 'rgba(255,255,250,0.8)');
        dot(g, x - 2 * s, y + 4 * s, 0.7, 'rgba(255,255,250,0.7)');
      };
      fish(20, 48, 1);
      fish(32, 47, 1.1);
      fish(44, 48, 0.95);
      fish(26, 65, 0.85);
      fish(40, 64, 0.9);
    }, 64, 96);

    // Totora cut green, stood upright to dry: fifteen days from pond to horse.
    make('dryreeds', 2, (g, r) => {
      softShadow(g, 32, 90, 20, 5, 0.2);
      const bundle = (x0: number, tipX: number, w: number) => {
        const base = shade('#c9bd7e', (r.next() - 0.5) * 0.08);
        g.beginPath();
        g.moveTo(x0 - w, 88);
        g.quadraticCurveTo(x0 - w * 0.5 + (tipX - x0) * 0.5, 50, tipX - 2, 18);
        g.lineTo(tipX + 2, 18);
        g.quadraticCurveTo(x0 + w * 0.5 + (tipX - x0) * 0.5, 50, x0 + w, 88);
        g.closePath();
        const grad = g.createLinearGradient(0, 18, 0, 88);
        grad.addColorStop(0, shade('#8faf62', 0.05)); // still green at the cut tips
        grad.addColorStop(0.45, base);
        grad.addColorStop(1, shade('#d0b276', -0.06));
        g.fillStyle = grad;
        g.fill();
        // A few individual reeds escaping the bundle.
        g.strokeStyle = 'rgba(130,140,80,0.6)';
        g.lineWidth = 1.4;
        for (let i = 0; i < 3; i++) {
          g.beginPath();
          g.moveTo(tipX - 2 + i * 2, 22);
          g.quadraticCurveTo(tipX + (i - 1) * 4, 12, tipX + (i - 1) * 6, 6 + r.int(4));
          g.stroke();
        }
      };
      bundle(18, 30, 6);
      bundle(44, 33, 6);
      bundle(31, 31, 5);
      // Ties.
      g.strokeStyle = '#7a5636';
      g.lineWidth = 2.6;
      for (const ty of [38, 66]) {
        g.beginPath();
        g.moveTo(20, ty);
        g.lineTo(46, ty - 2);
        g.stroke();
      }
    }, 64, 96);

    // Gillnets hung to dry between poles, corks ticking in the wind.
    make('netpoles', 2, (g, r) => {
      softShadow(g, 32, 90, 26, 5, 0.18);
      rr(g, 5, 28, 5, 62, 2, '#7a5636');
      rr(g, 54, 28, 5, 62, 2, '#7a5636');
      // The line, sagging under its profession.
      g.strokeStyle = '#c8a55b';
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(8, 32);
      g.quadraticCurveTo(32, 40, 56, 32);
      g.stroke();
      // The mesh: teal diamonds draped to a ragged hem.
      const c = r.chance(0.5) ? 'rgba(60,110,110,0.7)' : 'rgba(85,100,70,0.7)';
      g.strokeStyle = c;
      g.lineWidth = 1.3;
      for (let i = 0; i <= 8; i++) {
        const x = 9 + i * 5.8;
        const topY = 33 + Math.sin((i / 8) * Math.PI) * 6;
        g.beginPath();
        g.moveTo(x, topY);
        g.quadraticCurveTo(x - 2, 55, x + 1, 74 + r.int(6));
        g.stroke();
      }
      for (let j = 0; j < 5; j++) {
        const y = 40 + j * 8;
        g.beginPath();
        g.moveTo(10, y + 2);
        g.quadraticCurveTo(32, y + 6, 55, y + 2);
        g.stroke();
      }
      // Corks riding the line.
      for (let i = 0; i < 5; i++) {
        const x = 12 + i * 9;
        dot(g, x, 33.5 + Math.sin((x - 8) / 48 * Math.PI) * 5.4, 2.6, '#c9a35f');
      }
      // One mended patch, brighter thread: last night's work.
      g.strokeStyle = 'rgba(232,220,196,0.85)';
      g.lineWidth = 1.4;
      for (let k = 0; k < 3; k++) {
        g.beginPath();
        g.moveTo(34 + k * 3, 58);
        g.lineTo(37 + k * 3, 64);
        g.stroke();
      }
    }, 64, 96);

    // Crab traps stacked in a tower that leans like it has somewhere to be.
    make('crabtraps', 2, (g, r) => {
      softShadow(g, 32, 90, 22, 5, 0.2);
      const trap = (x: number, y: number, w: number, h: number, wood: string) => {
        rr(g, x, y, w, h, 3, wood);
        rr(g, x + 3, y + 3, w - 6, h - 6, 2, shade(wood, -0.35));
        g.strokeStyle = 'rgba(80,120,115,0.65)';
        g.lineWidth = 1.2;
        for (let gx = x + 6; gx < x + w - 3; gx += 5) {
          g.beginPath(); g.moveTo(gx, y + 3); g.lineTo(gx, y + h - 3); g.stroke();
        }
        for (let gy = y + 7; gy < y + h - 3; gy += 5) {
          g.beginPath(); g.moveTo(x + 3, gy); g.lineTo(x + w - 3, gy); g.stroke();
        }
      };
      trap(11, 64, 42, 23, '#6e5138');
      trap(15, 43, 40, 20, shade('#7a5636', (r.next() - 0.5) * 0.06));
      trap(12, 25, 36, 17, '#6e5138');
      // The funnel mouth on the middle trap, a dark commitment.
      oval(g, 35, 53, 6, 4.5, '#221a12');
      oval(g, 35, 53, 3, 2.2, '#0f0b08');
      // Rope coiled on top, float tied on.
      g.strokeStyle = '#c8a55b';
      g.lineWidth = 2.4;
      for (let i = 0; i < 3; i++) {
        g.beginPath();
        g.ellipse(28, 22 - i * 1.5, 8, 3.4, 0, 0, Math.PI * 2);
        g.stroke();
      }
      dot(g, 41, 20, 4, '#c1512f');
      g.strokeStyle = 'rgba(140,60,40,0.8)';
      g.lineWidth = 1.4;
      g.beginPath(); g.moveTo(38, 21); g.lineTo(35, 23); g.stroke();
    }, 64, 96);

    // Retired buoys on a low wall, sorted by nobody.
    make('buoywall', 1, (g, r) => {
      softShadow(g, 32, 90, 27, 5, 0.18);
      rr(g, 4, 42, 56, 46, 3, '#cbb695');
      vgrad(g, 4, 42, 56, 8, 'rgba(255,250,235,0.25)', 'rgba(0,0,0,0)');
      vgrad(g, 4, 74, 56, 14, 'rgba(0,0,0,0)', 'rgba(80,70,54,0.28)');
      rr(g, 2, 37, 60, 8, 3, '#b5a080');
      // The buoys, each with a nail and a memory.
      const buoys: [number, number, string][] = [
        [13, 58, '#c1512f'],
        [28, 62, '#3f7fb0'],
        [43, 57, '#c9a35f'],
        [54, 63, '#e8e0d4'],
      ];
      for (const [bx, by, c] of buoys) {
        g.strokeStyle = 'rgba(90,70,48,0.7)';
        g.lineWidth = 1.6;
        g.beginPath(); g.moveTo(bx, by - 6); g.lineTo(bx, 46); g.stroke();
        dot(g, bx, 46, 1.6, '#4a4038');
        dot(g, bx, by, 6.2, shade(c, (r.next() - 0.5) * 0.06));
        rect(g, bx - 6, by - 1.4, 12.4, 2.8, shade(c, -0.25));
        dot(g, bx - 2, by - 2.5, 1.4, 'rgba(255,255,255,0.4)');
      }
      // One glass float in its rope net, the wall's antique.
      dot(g, 21, 76, 5.4, 'rgba(150,190,180,0.85)');
      dot(g, 19.5, 74.5, 1.6, 'rgba(240,255,250,0.6)');
      g.strokeStyle = 'rgba(200,165,91,0.75)';
      g.lineWidth = 1;
      g.beginPath(); g.moveTo(16, 74); g.lineTo(26, 78); g.stroke();
      g.beginPath(); g.moveTo(16, 78); g.lineTo(26, 74); g.stroke();
      g.beginPath(); g.ellipse(21, 76, 5.4, 5.4, 0, 0, Math.PI * 2); g.stroke();
    }, 64, 96);

    // The school kids painted la mar. She came out purple, with a whale.
    make('kidmural', 1, (g) => {
      softShadow(g, 32, 90, 27, 5, 0.18);
      rr(g, 4, 34, 56, 54, 2, '#e8e0cc');
      vgrad(g, 4, 34, 56, 10, 'rgba(120,110,90,0.16)', 'rgba(0,0,0,0)');
      rr(g, 2, 28, 60, 9, 3, '#b5a080');
      // The sea, in the only purple the school had.
      const wave = (y: number, c: string) => {
        g.fillStyle = c;
        g.beginPath();
        g.moveTo(8, y + 10);
        for (let x = 8; x <= 56; x += 12) {
          g.quadraticCurveTo(x + 6, y - 6, x + 12, y + 4);
        }
        g.lineTo(56, 84);
        g.lineTo(8, 84);
        g.closePath();
        g.fill();
      };
      wave(66, '#a58ab5');
      wave(72, '#8a6a9d');
      // The whale, gray and pleased.
      oval(g, 28, 58, 11, 5.5, '#8ba3b5');
      g.fillStyle = '#8ba3b5';
      g.beginPath();
      g.moveTo(38, 58); g.lineTo(45, 53); g.lineTo(45, 62); g.closePath();
      g.fill();
      g.strokeStyle = 'rgba(120,150,190,0.9)';
      g.lineWidth = 1.6;
      g.beginPath(); g.moveTo(24, 52); g.lineTo(22, 46); g.moveTo(24, 52); g.lineTo(26, 46); g.stroke();
      dot(g, 22, 57, 1, '#2c3e57');
      g.strokeStyle = 'rgba(44,62,87,0.7)';
      g.lineWidth = 1.2;
      g.beginPath(); g.moveTo(24, 60); g.quadraticCurveTo(27, 62, 30, 60); g.stroke();
      // A tiny caballito riding the top wave, prow curled just so.
      g.strokeStyle = '#d0b276';
      g.lineWidth = 3;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(44, 68);
      g.quadraticCurveTo(50, 66, 52, 61);
      g.stroke();
      // The sun, attending.
      dot(g, 51, 43, 5, '#e8c25a');
      g.strokeStyle = 'rgba(232,194,90,0.8)';
      g.lineWidth = 1.6;
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        g.beginPath();
        g.moveTo(51 + Math.cos(a) * 7, 43 + Math.sin(a) * 7);
        g.lineTo(51 + Math.cos(a) * 10, 43 + Math.sin(a) * 10);
        g.stroke();
      }
      // Two signature handprints, small and proud.
      for (const [hx, c] of [[12, '#c1512f'], [19, '#3f7fb0']] as [number, string][]) {
        oval(g, hx, 81, 2.6, 3.2, c);
        for (let f = 0; f < 4; f++) oval(g, hx - 2.4 + f * 1.6, 77.5, 0.9, 1.8, c);
      }
    }, 64, 96);

    // A mooring post from the sugar days, now a full-time pelican office.
    make('pelicanpost', 1, (g) => {
      softShadow(g, 32, 90, 15, 5, 0.2);
      rr(g, 26, 42, 12, 48, 3, '#6e5138');
      vgrad(g, 26, 42, 12, 10, 'rgba(255,240,210,0.14)', 'rgba(0,0,0,0)');
      // Rope wrap that outlived its ship.
      g.strokeStyle = '#c8a55b';
      g.lineWidth = 2.6;
      for (const wy of [70, 74]) {
        g.beginPath(); g.moveTo(26, wy); g.lineTo(38, wy - 1.5); g.stroke();
      }
      // The occupant's signature, in white, down one side.
      g.strokeStyle = 'rgba(240,240,230,0.6)';
      g.lineWidth = 2.2;
      g.beginPath();
      g.moveTo(35, 46);
      g.quadraticCurveTo(37, 58, 36, 66);
      g.stroke();
      // The occupant. Present, upright, unimpressed.
      g.strokeStyle = '#8a6238';
      g.lineWidth = 2.4;
      g.beginPath();
      g.moveTo(28, 40); g.lineTo(28, 44); g.moveTo(35, 40); g.lineTo(35, 44);
      g.stroke();
      oval(g, 32, 32, 12, 8.5, '#d9d4c8');
      oval(g, 35, 30, 8.5, 5.5, '#c5beb0');
      g.strokeStyle = '#e6e0d4';
      g.lineWidth = 6;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(24, 30);
      g.quadraticCurveTo(19, 21, 22, 13);
      g.stroke();
      dot(g, 23, 11, 5, '#e6e0d4');
      g.fillStyle = '#d09a58';
      g.beginPath();
      g.moveTo(26, 9);
      g.lineTo(43, 13);
      g.quadraticCurveTo(35, 19, 26, 14);
      g.closePath();
      g.fill();
      dot(g, 25.5, 9.5, 1.4, '#2b2118');
      // Folded tail over the post edge.
      g.strokeStyle = '#b5aea0';
      g.lineWidth = 3;
      g.beginPath();
      g.moveTo(42, 34);
      g.lineTo(46, 39);
      g.stroke();
    }, 64, 96);

    // Gallinazos on a driftwood snag: black as spilled ink, supervising.
    make('gallinazos', 2, (g, r, i) => {
      softShadow(g, 32, 90, 26, 5, 0.2);
      // The snag, bleached to bone.
      g.strokeStyle = '#b0a490';
      g.lineWidth = 8;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(8, 88);
      g.quadraticCurveTo(28, 66, 56, 40);
      g.stroke();
      g.strokeStyle = '#9c8f7c';
      g.lineWidth = 4.6;
      g.beginPath();
      g.moveTo(38, 54);
      g.lineTo(50, 26);
      g.stroke();
      g.strokeStyle = 'rgba(120,105,85,0.5)';
      g.lineWidth = 1.2;
      g.beginPath();
      g.moveTo(12, 86);
      g.quadraticCurveTo(30, 66, 52, 42);
      g.stroke();
      // The committee. Sizes vary; commitment does not.
      const vulture = (x: number, y: number, s: number, spread: boolean) => {
        if (spread) {
          // Wings out to dry, undertaker style.
          g.strokeStyle = '#1c1410';
          g.lineWidth = 5 * s;
          g.lineCap = 'round';
          g.beginPath();
          g.moveTo(x - 11 * s, y - 6 * s);
          g.quadraticCurveTo(x, y - 12 * s, x, y - 2 * s);
          g.quadraticCurveTo(x, y - 12 * s, x + 11 * s, y - 6 * s);
          g.stroke();
        }
        // Hunched body: shoulders higher than the head wants to admit.
        oval(g, x, y, 6.5 * s, 8 * s, '#241a12');
        oval(g, x - 1 * s, y - 5 * s, 5.5 * s, 4 * s, '#241a12'); // the hunch
        oval(g, x + 1.5 * s, y + 1 * s, 4.5 * s, 6 * s, '#332619');
        // Bare grey head on a low question mark of neck.
        g.strokeStyle = '#5c5650';
        g.lineWidth = 3 * s;
        g.lineCap = 'round';
        g.beginPath();
        g.moveTo(x - 2 * s, y - 7 * s);
        g.quadraticCurveTo(x - 5 * s, y - 10 * s, x - 4 * s, y - 11 * s);
        g.stroke();
        dot(g, x - 4 * s, y - 11.5 * s, 3.2 * s, '#6b655c');
        g.strokeStyle = '#d9d4c8';
        g.lineWidth = 1.8 * s;
        g.beginPath();
        g.moveTo(x - 2 * s, y - 11.8 * s);
        g.lineTo(x + 0.8 * s, y - 11 * s);
        g.stroke();
        dot(g, x - 4.6 * s, y - 12.2 * s, 0.7 * s, '#0f0b08'); // the appraising eye
        g.strokeStyle = '#8a8378';
        g.lineWidth = 1.6 * s;
        g.beginPath();
        g.moveTo(x - 2 * s, y + 7 * s); g.lineTo(x - 2 * s, y + 10 * s);
        g.moveTo(x + 2 * s, y + 7 * s); g.lineTo(x + 2 * s, y + 10 * s);
        g.stroke();
      };
      vulture(16, 72, 1, false);
      vulture(33, 58, 0.95, i === 1);
      vulture(49, 38, 0.9, false);
      void r;
    }, 64, 96);

    // Stacked picanteria chairs, sun-faded from red to a loyal pink.
    // Drawn front-on: nested backs make a striped tower, seats peek out.
    make('picchairs', 1, (g, r) => {
      softShadow(g, 32, 90, 20, 5, 0.18);
      const tints = ['#c96a58', '#d98a7a', '#e0a291', '#d98a7a', '#e8e0d4'];
      // Bottom chair carries the whole administration: full legs.
      g.strokeStyle = '#a85a4a';
      g.lineWidth = 3;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(18, 74); g.lineTo(14, 88);
      g.moveTo(46, 74); g.lineTo(50, 88);
      g.moveTo(22, 74); g.lineTo(20, 84);
      g.moveTo(42, 74); g.lineTo(44, 84);
      g.stroke();
      for (let k = 0; k < 5; k++) {
        const y = 76 - k * 12; // seat line of chair k
        const c = shade(tints[k] ?? '#d98a7a', (r.next() - 0.5) * 0.04);
        // Seat: a wide shallow slab, slightly narrower as the stack rises.
        const inset = k * 1.2;
        rr(g, 14 + inset, y - 5, 36 - inset * 2, 7, 3.5, c);
        vgrad(g, 14 + inset, y - 5, 36 - inset * 2, 3, 'rgba(255,255,255,0.35)', 'rgba(0,0,0,0)');
        // Back: a rounded hoop rising behind the next seat up.
        g.strokeStyle = shade(c, -0.1);
        g.lineWidth = 5;
        g.beginPath();
        g.moveTo(18 + inset, y - 4);
        g.quadraticCurveTo(19 + inset, y - 15, 24 + inset, y - 16);
        g.lineTo(40 - inset, y - 16);
        g.quadraticCurveTo(45 - inset, y - 15, 46 - inset, y - 4);
        g.stroke();
        // Armrest nubs.
        dot(g, 16 + inset, y - 2, 2, shade(c, -0.18));
        dot(g, 48 - inset, y - 2, 2, shade(c, -0.18));
      }
      // The seat slots, so it reads as furniture and not architecture.
      g.strokeStyle = 'rgba(120,50,40,0.35)';
      g.lineWidth = 1.4;
      for (let k = 0; k < 4; k++) {
        const y = 76 - k * 12;
        g.beginPath();
        g.moveTo(20, y + 2.5);
        g.lineTo(44, y + 2.5);
        g.stroke();
      }
    }, 64, 96);

    // HOY: LO QUE DIGA LA MAR. The picanteria's entire menu system.
    make('pizarra', 1, (g) => {
      softShadow(g, 32, 90, 18, 5, 0.18);
      // Easel legs.
      g.strokeStyle = '#7a5636';
      g.lineWidth = 4;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(16, 88); g.lineTo(26, 26);
      g.moveTo(48, 88); g.lineTo(38, 26);
      g.moveTo(19, 74); g.lineTo(45, 74);
      g.stroke();
      // Frame and slate.
      rr(g, 8, 18, 48, 54, 4, '#7a5636');
      rr(g, 12, 22, 40, 46, 2.5, '#33403a');
      vgrad(g, 12, 22, 40, 8, 'rgba(255,255,255,0.06)', 'rgba(0,0,0,0)');
      // HOY: in confident child-of-the-house chalk.
      g.strokeStyle = 'rgba(242,240,232,0.85)';
      g.lineWidth = 2;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(16, 27); g.lineTo(16, 35); g.moveTo(20, 27); g.lineTo(20, 35); g.moveTo(16, 31); g.lineTo(20, 31); // H
      g.stroke();
      g.beginPath(); g.ellipse(26.5, 31, 3, 4, 0, 0, Math.PI * 2); g.stroke(); // O
      g.beginPath();
      g.moveTo(32, 27); g.lineTo(34.5, 31); g.moveTo(37, 27); g.lineTo(34.5, 31); g.lineTo(34.5, 35); // Y
      g.stroke();
      dot(g, 41, 29, 1.1, 'rgba(242,240,232,0.85)');
      dot(g, 41, 33, 1.1, 'rgba(242,240,232,0.85)');
      // Today's verdict: two wobbly chalk words.
      g.strokeStyle = 'rgba(242,240,232,0.75)';
      g.lineWidth = 1.8;
      g.beginPath(); g.moveTo(16, 43); g.quadraticCurveTo(28, 41.4, 40, 43); g.stroke();
      g.beginPath(); g.moveTo(19, 49); g.quadraticCurveTo(30, 47.6, 45, 49); g.stroke();
      // The ghosts of dishes past, half-erased.
      g.strokeStyle = 'rgba(220,220,210,0.18)';
      g.lineWidth = 2.2;
      g.beginPath(); g.moveTo(17, 57); g.quadraticCurveTo(30, 55.5, 43, 57); g.stroke();
      g.beginPath(); g.moveTo(20, 63); g.quadraticCurveTo(31, 61.8, 39, 63); g.stroke();
      // Chalk ledge, one stub of chalk.
      rr(g, 10, 68, 44, 4.5, 2, '#8a6238');
      rr(g, 34, 65.5, 6, 2.6, 1.3, '#e8e6de');
    }, 64, 96);

    // A mototaxi parked at an angle only its owner could love.
    make('mototaxi', 1, (g) => {
      softShadow(g, 64, 86, 42, 8, 0.2);
      g.save();
      g.translate(64, 84);
      g.rotate(-0.05);
      g.translate(-64, -84);
      // Rear wheels under the cab.
      dot(g, 38, 76, 10, '#2e2620');
      dot(g, 38, 76, 3.4, '#8a8378');
      // The cab: red gone chalky, canopy striped against a sun that left.
      rr(g, 18, 36, 58, 42, 8, '#c1512f');
      vgrad(g, 18, 36, 58, 12, 'rgba(255,255,255,0.16)', 'rgba(0,0,0,0)');
      vgrad(g, 18, 64, 58, 14, 'rgba(0,0,0,0)', 'rgba(70,30,20,0.3)');
      // Back window and the bench inside.
      rr(g, 24, 42, 22, 18, 4, '#3a3f45');
      rr(g, 50, 46, 20, 26, 3, shade('#c1512f', -0.18));
      // Canopy.
      rr(g, 12, 28, 68, 10, 5, '#e8e0d4');
      rect(g, 24, 28, 12, 10, '#3f7fb0');
      rect(g, 48, 28, 12, 10, '#3f7fb0');
      vgrad(g, 12, 28, 68, 4, 'rgba(255,255,255,0.3)', 'rgba(0,0,0,0)');
      // The motorcycle front, doing all the work as usual: a low chassis
      // beam out to the front wheel, short fork, windshield, handlebar.
      g.strokeStyle = '#4a4038';
      g.lineWidth = 5;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(74, 70);
      g.lineTo(100, 70);
      g.stroke();
      dot(g, 104, 72, 9, '#2e2620');
      dot(g, 104, 72, 3, '#8a8378');
      // Fork and handlebar over the wheel.
      g.lineWidth = 3.6;
      g.beginPath();
      g.moveTo(104, 70); g.lineTo(100, 48);
      g.stroke();
      g.beginPath();
      g.moveTo(94, 47); g.lineTo(106, 45);
      g.stroke();
      dot(g, 93, 47.5, 2.2, '#2e2620');
      dot(g, 107, 44.5, 2.2, '#2e2620');
      // Windshield leaning back toward the cab.
      g.fillStyle = 'rgba(200,220,228,0.55)';
      g.beginPath();
      g.moveTo(96, 48);
      g.lineTo(104, 46);
      g.lineTo(101, 32);
      g.lineTo(94, 34);
      g.closePath();
      g.fill();
      g.strokeStyle = 'rgba(90,100,105,0.6)';
      g.lineWidth = 1.6;
      g.strokeRect(94.5, 33, 8, 14);
      dot(g, 103, 54, 3, '#e8dcc4'); // headlamp, hopeful
      // Mudflap: GRACIAS A DIOS, in spirit.
      rr(g, 26, 72, 12, 11, 2, '#3a3f45');
      g.strokeStyle = 'rgba(232,224,212,0.8)';
      g.lineWidth = 1.1;
      g.beginPath(); g.moveTo(28, 75.5); g.lineTo(36, 75.5); g.stroke();
      g.beginPath(); g.moveTo(29, 78.5); g.lineTo(35, 78.5); g.stroke();
      // Rust freckles where the salt keeps score.
      dot(g, 22, 68, 1.4, 'rgba(120,60,36,0.7)');
      dot(g, 71, 40, 1.2, 'rgba(120,60,36,0.6)');
      dot(g, 66, 74, 1.6, 'rgba(120,60,36,0.7)');
      g.restore();
    }, 128, 96);

    // ------------------------------------------------- the colour on the sand

    /**
     * The tendal: a blue tarpaulin lashed to four eucalyptus poles over the
     * table where the catch gets cleaned. It is the one big flat colour on the
     * beach, it is head height, and you walk under it, which is the point.
     */
    make('tendal', 1, (g) => {
      softShadow(g, 64, 118, 50, 10, 0.2);
      // Back poles first, so the sheet hangs in front of them.
      for (const px2 of [16, 112]) {
        rr(g, px2 - 2.5, 40, 5, 76, 2, '#8a6b46');
        rr(g, px2 - 2.5, 40, 2, 76, 1, 'rgba(255,240,210,0.28)');
      }
      // The cleaning table underneath, scaled and wet.
      rr(g, 34, 92, 60, 16, 3, '#a08a6c');
      vgrad(g, 34, 92, 60, 5, 'rgba(255,246,224,0.32)', 'rgba(0,0,0,0)');
      for (const bx of [40, 86]) rr(g, bx, 106, 5, 14, 2, '#7a6448');
      dot(g, 56, 98, 3.4, 'rgba(190,215,225,0.7)');
      dot(g, 72, 100, 2.6, 'rgba(190,215,225,0.6)');
      // The sheet: sagging between the poles, patched, sun-eaten at the hem.
      const cloth = '#2f6d8e';
      g.fillStyle = cloth;
      g.beginPath();
      g.moveTo(8, 44);
      g.quadraticCurveTo(64, 30, 120, 44);
      g.quadraticCurveTo(64, 66, 8, 44);
      g.closePath();
      g.fill();
      g.fillStyle = shade(cloth, 0.22);
      g.beginPath();
      g.moveTo(8, 44);
      g.quadraticCurveTo(64, 30, 120, 44);
      g.quadraticCurveTo(64, 48, 8, 44);
      g.closePath();
      g.fill();
      // A hem of shadow under the sag, and one patch of another blue entirely.
      g.fillStyle = 'rgba(20,40,56,0.3)';
      g.beginPath();
      g.moveTo(14, 48);
      g.quadraticCurveTo(64, 64, 114, 48);
      g.quadraticCurveTo(64, 58, 14, 48);
      g.closePath();
      g.fill();
      rr(g, 78, 42, 18, 11, 2, '#4f8fa8');
      rr(g, 30, 40, 12, 8, 2, shade(cloth, -0.18));
      // Front poles and the ties that hold the corners down.
      for (const px2 of [26, 102]) {
        rr(g, px2 - 3, 46, 6, 74, 2, '#96754c');
        rr(g, px2 - 3, 46, 2.4, 74, 1, 'rgba(255,240,210,0.3)');
        g.strokeStyle = 'rgba(230,220,196,0.7)';
        g.lineWidth = 1.6;
        g.beginPath();
        g.moveTo(px2, 50);
        g.lineTo(px2 + (px2 < 64 ? -14 : 14), 62);
        g.stroke();
      }
    }, 128, 128);

    /**
     * Bidones: fuel drums and fish boxes stacked against a wall, repainted
     * every few years in whatever the boats had left over. Low, loud, and the
     * reason the promenade has a warm note in it at noon.
     */
    make('bidones', 2, (g, r) => {
      softShadow(g, 32, 56, 28, 6, 0.22);
      const drum = (x: number, y: number, w: number, h: number, c: string) => {
        rr(g, x, y - h, w, h, 3, c);
        vgrad(g, x, y - h, w, h * 0.4, 'rgba(255,246,224,0.26)', 'rgba(0,0,0,0)');
        oval(g, x + w / 2, y - h, w / 2, 3, shade(c, 0.24));
        // Two hoops and the rust that always wins in the end.
        for (const hy of [y - h * 0.66, y - h * 0.3]) {
          rect(g, x, hy, w, 2.2, shade(c, -0.22));
        }
        dot(g, x + 2 + r.int(w - 4), y - 3 - r.int(h - 6), 2, 'rgba(140,72,42,0.55)');
      };
      // Two drums standing, a crate on top of them, one drum on its side.
      drum(6, 54, 16, 30, '#2f6d8e');
      drum(24, 56, 17, 34, '#d8a52f');
      rr(g, 5, 20, 20, 12, 2, '#b8482f');
      vgrad(g, 5, 20, 20, 4, 'rgba(255,246,224,0.3)', 'rgba(0,0,0,0)');
      for (let i = 0; i < 3; i++) rect(g, 7 + i * 6, 22, 2, 8, 'rgba(60,30,20,0.3)');
      g.save();
      g.translate(50, 46);
      g.rotate(1.57);
      rr(g, -13, -8, 26, 16, 3, '#3f7a5a');
      oval(g, -13, 0, 3, 8, shade('#3f7a5a', 0.22));
      rect(g, -6, -8, 2.2, 16, shade('#3f7a5a', -0.22));
      g.restore();
      dot(g, 46, 54, 2, 'rgba(140,72,42,0.5)');
    });

    /**
     * A caballito hull up on trestles being made beautiful again: half of it
     * still salt-grey, half of it the turquoise the owner's father used, and
     * the tins open on the sand beside it. The brightest thing on the beach.
     */
    make('pintura', 1, (g) => {
      softShadow(g, 62, 112, 46, 9, 0.22);
      // Trestles.
      for (const tx of [34, 88]) {
        rr(g, tx - 12, 82, 24, 5, 2, '#8a6b46');
        rr(g, tx - 10, 86, 4, 24, 2, '#7a5c3c');
        rr(g, tx + 6, 86, 4, 24, 2, '#7a5c3c');
      }
      // The hull, keel up, a long soft wedge.
      const grey = '#b6ada0';
      const paint = '#2fa3a8';
      g.fillStyle = grey;
      g.beginPath();
      g.moveTo(10, 74);
      g.quadraticCurveTo(62, 34, 116, 66);
      g.quadraticCurveTo(64, 92, 10, 74);
      g.closePath();
      g.fill();
      // The painted half, stopped exactly where the coffee arrived.
      g.save();
      g.beginPath();
      g.rect(10, 30, 56, 70);
      g.clip();
      g.fillStyle = paint;
      g.beginPath();
      g.moveTo(10, 74);
      g.quadraticCurveTo(62, 34, 116, 66);
      g.quadraticCurveTo(64, 92, 10, 74);
      g.closePath();
      g.fill();
      g.fillStyle = 'rgba(255,255,255,0.22)';
      g.beginPath();
      g.moveTo(12, 70);
      g.quadraticCurveTo(50, 44, 66, 44);
      g.quadraticCurveTo(50, 58, 14, 74);
      g.closePath();
      g.fill();
      g.restore();
      // The wet edge where the new paint stops, and the keel line.
      g.strokeStyle = 'rgba(20,80,86,0.7)';
      g.lineWidth = 2.4;
      g.beginPath();
      g.moveTo(64, 40);
      g.lineTo(68, 88);
      g.stroke();
      g.strokeStyle = 'rgba(60,50,40,0.35)';
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(14, 72);
      g.quadraticCurveTo(64, 44, 114, 65);
      g.stroke();
      // Tins, a brush across one of them, and the drips that got away.
      rr(g, 92, 96, 15, 16, 2, '#c8c2b4');
      rr(g, 93, 94, 13, 5, 2, shade(paint, -0.1));
      rr(g, 110, 100, 12, 12, 2, '#c8c2b4');
      rr(g, 111, 98, 10, 4, 2, '#b8482f');
      g.strokeStyle = '#8a6b46';
      g.lineWidth = 3;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(98, 92);
      g.lineTo(112, 84);
      g.stroke();
      dot(g, 100, 116, 3, shade(paint, -0.06));
      dot(g, 88, 118, 2, shade(paint, -0.1));
    }, 128, 128);

    // ------------------------------------------------- the picantería shell

    /**
     * The picantería's wall: quincha, cane and mud, painted the salt-faded
     * cream the whole caleta is painted, with the sea-blue zócalo every
     * coastal room in Peru wears to waist height because that is the part
     * that gets scrubbed. The chapter's own colours, straight off the street
     * outside the door: `#e8e0cc` off the tendal, `#7f9fb5` off the boats.
     */
    make('wallQuincha', 10, (g, r, i) => {
      const cream = '#e2d8c0';
      const dado = '#7f9fb5';
      vgrad(g, 0, 0, 64, 64, shade(cream, 0.03), shade(cream, -0.05));
      // The zócalo, and the brush line where it stopped.
      rect(g, 0, 40, 64, 24, shade(dado, -0.02));
      vgrad(g, 0, 40, 64, 5, 'rgba(255,255,255,0.16)', 'rgba(0,0,0,0)');
      rect(g, 0, 39, 64, 1.6, 'rgba(60,86,100,0.35)');
      // Damp and salt, which win eventually.
      for (let i = 0; i < 4; i++) {
        oval(g, r.int(64), 44 + r.int(20), 6 + r.int(7), 2.6, 'rgba(90,120,134,0.12)');
      }
      if (r.chance(0.5)) oval(g, r.int(64), 8 + r.int(24), 7, 3, 'rgba(180,166,140,0.2)');
      // Four tiles in ten carry something; the rest are just wall.
      const deco = i < 4 ? i : -1;
      if (deco === 0) {
        // A string of ají amarillo drying. Yellow, and nobody's else's.
        g.strokeStyle = '#8a7a5c';
        g.lineWidth = 1.6;
        g.beginPath(); g.moveTo(34, 6); g.lineTo(34, 14); g.stroke();
        for (let k = 0; k < 4; k++) {
          oval(g, 34 + (k % 2 ? 4 : -4), 17 + k * 5, 3, 4.4, k % 2 ? '#e8a52f' : '#d18a24');
        }
      } else if (deco === 1) {
        // A shuttered window with the garúa behind it, grey and generous.
        rr(g, 16, 10, 32, 26, 2, '#5c7d8a');
        rr(g, 19, 13, 26, 20, 1.5, '#c8d2d4');
        g.strokeStyle = 'rgba(70,96,108,0.55)';
        g.lineWidth = 1.6;
        for (const lx of [27, 36]) { g.beginPath(); g.moveTo(lx, 13); g.lineTo(lx, 33); g.stroke(); }
      } else if (deco === 2) {
        // The estampa: purple habit, plastic flower, a candle stub.
        rr(g, 24, 10, 17, 22, 1.5, '#f0e7d2');
        rr(g, 27, 14, 11, 15, 1, '#6b4a7d');
        dot(g, 32.5, 17, 2.6, '#e8cfa8');
        dot(g, 43, 26, 2.4, '#c1512f');
        rr(g, 22, 33, 21, 3, 1.5, '#8a6b46');
      } else if (deco === 3) {
        // A nail, an enamel ladle, and a calendar nobody turned over.
        g.strokeStyle = '#c9c4bb';
        g.lineWidth = 3;
        g.lineCap = 'round';
        g.beginPath(); g.moveTo(41, 12); g.lineTo(41, 26); g.stroke();
        oval(g, 41, 29, 6, 5, '#dfe2e0');
        oval(g, 41, 28, 4, 3.2, '#b8bfbe');
        rr(g, 14, 12, 14, 18, 1, '#e8e0cc');
        rect(g, 14, 12, 14, 4, '#c1512f');
      }
    });

    /**
     * And its floor: cement, laid once, mopped daily for forty years until
     * the ridges wore off and the red oxide came through where the chairs go.
     */
    make('floorCemento', 5, (g, r) => {
      const base = '#c8c1b1';
      rect(g, 0, 0, 64, 64, base);
      for (let i = 0; i < 4; i++) {
        oval(g, r.int(64), r.int(64), 6 + r.int(6), 3, shade(base, r.chance(0.5) ? -0.04 : 0.05));
      }
      // Oxide showing through where the traffic is.
      if (r.chance(0.5)) oval(g, 12 + r.int(40), 12 + r.int(40), 11, 6, 'rgba(168,104,72,0.16)');
      // A scored joint, sometimes, from when it was poured in bays.
      if (r.chance(0.45)) {
        g.strokeStyle = 'rgba(96,92,84,0.3)';
        g.lineWidth = 1.6;
        const jy = 10 + r.int(44);
        g.beginPath(); g.moveTo(0, jy); g.lineTo(64, jy); g.stroke();
      }
      // The mop's last pass, still drying.
      if (r.chance(0.4)) oval(g, r.int(64), r.int(64), 15, 5, 'rgba(226,230,228,0.09)');
    });
  },
};
