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
const CORAL_WASHES = ['#f0e9d9', '#e9e0cb', '#e3d6bd', '#e6e3d4'];
const KANGA_INKS = ['#c1512f', '#3f7fb0', '#8a4a7d', '#c98a2e', '#4d7440', '#a03a4a'];

export const ART: ChapterArt = {
  buildings: ['nyumba'],
  windows: { nyumba: [[15, -10], [67, -10]] },
  grounded: ['kangarack', 'marketlamp', 'ngalawa', 'dhow'],
  glows: ['marketlamp'],
  aliases: { postcounter: 'signpost' },

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
      // Stakes.
      g.strokeStyle = '#6b5136';
      g.lineWidth = 3;
      g.beginPath(); g.moveTo(6, 22); g.lineTo(6, 46); g.stroke();
      g.beginPath(); g.moveTo(58, 22); g.lineTo(58, 46); g.stroke();
      // The line, sagging slightly.
      g.strokeStyle = 'rgba(220,215,195,0.8)';
      g.lineWidth = 1.6;
      g.beginPath();
      g.moveTo(6, 26);
      g.quadraticCurveTo(32, 32, 58, 26);
      g.stroke();
      // Seaweed bunches tied along it.
      for (let i = 0; i < 6; i++) {
        const bx = 10 + i * 9 + r.int(3);
        const by = 28 + Math.sin(i) * 2;
        oval(g, bx, by + 4, 3.4, 5, i % 2 ? '#7d3b3f' : '#69333d');
        oval(g, bx + 2, by + 2, 2.2, 3.4, '#8a4a4a');
      }
      // A wet glint beneath.
      oval(g, 32, 44, 22, 3, 'rgba(200,225,230,0.18)');
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

    // ------------------------------------------------------------ nyumba

    // 352x256, casa-compatible geometry: coral-rag house under lime wash,
    // flat roof and parapet, and a carved door worth a whole examine.
    make('nyumba', 4, (g, r) => {
      const W = 352;
      const wash = shade(CORAL_WASHES[r.int(4)] ?? '#f0e9d9', (r.next() - 0.5) * 0.04);
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
