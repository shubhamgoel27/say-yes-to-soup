import type { ChapterArt, MakeTile } from './index';
import { dot, oval, rr, rect, vgrad, glowSpot, softShadow, shade } from '../pix';
import { PAL } from '../../engine/config';

/**
 * Busan's tile kinds: a dawn market lane in the Jagalchi tradition. Wet
 * paving, striped awnings, red basins, dried fish on strings, carts that
 * steam, pastel houses stacked up the hill, and orange cranes at the water.
 * Painterly vector, same idiom as the coast.
 */

const S = 64;

/** Gamcheon-ish pastels for the hillside and the awnings. */
const PASTELS = ['#8fc3d4', '#e0a7a0', '#e8d9a8', '#a8c9a0', '#d9b06a', '#b3a8cf'];
const AWNINGS = ['#c1512f', '#3f7fb0', '#4d7440', '#d9853f'];

function paint(make: MakeTile) {
  // ------------------------------------------------------------ grounds

  // The market lane: paving washed dark before dawn, scales catching light.
  make('lanepave', 5, (g, r) => {
    const base = '#84868c';
    rect(g, 0, 0, S, S, base);
    // Slab joints, soft and wet.
    g.strokeStyle = 'rgba(45,48,58,0.4)';
    g.lineWidth = 2;
    const jy = 20 + r.int(24);
    const jx = 14 + r.int(36);
    g.beginPath();
    g.moveTo(0, jy);
    g.lineTo(S, jy);
    g.moveTo(jx, jy);
    g.lineTo(jx, S);
    g.stroke();
    // Hose-water sheen and the odd fish scale.
    for (let i = 0; i < 3; i++) {
      oval(g, r.int(S), r.int(S), 5 + r.int(4), 2, 'rgba(205,215,228,0.12)');
    }
    if (r.chance(0.3)) dot(g, r.int(S), r.int(S), 1.6, 'rgba(225,235,240,0.5)');
    if (r.chance(0.2)) oval(g, r.int(S), r.int(S), 3, 1.6, 'rgba(60,64,74,0.25)');
  });

  // The tea house floor: warm oiled hanji paper over a heated ondol.
  make('floorOndol', 4, (g, r) => {
    const base = '#c9a25e';
    rect(g, 0, 0, S, S, base);
    // Paper-sheet seams.
    g.strokeStyle = 'rgba(120,86,40,0.22)';
    g.lineWidth = 1.6;
    const sx = r.chance(0.5) ? 32 : 20 + r.int(24);
    g.beginPath();
    g.moveTo(sx, 0);
    g.lineTo(sx, S);
    g.stroke();
    for (let i = 0; i < 2; i++) {
      oval(g, r.int(S), r.int(S), 6, 3, shade(base, r.chance(0.5) ? 0.05 : -0.04));
    }
    if (r.chance(0.4)) dot(g, r.int(S), r.int(S), 1.4, 'rgba(255,240,210,0.35)');
  });

  // ------------------------------------------------------------ flats

  // The red fish basin the whole market runs on.
  make('basin', 2, (g, r) => {
    softShadow(g, 32, 50, 22, 7, 0.18);
    const hull = r.chance(0.7) ? '#c0392b' : '#2e6da4';
    oval(g, 32, 40, 24, 15, shade(hull, -0.12));
    oval(g, 32, 37, 24, 14, hull);
    oval(g, 32, 38, 19, 10, shade(hull, -0.28));
    // Seawater with fish nosing the rim.
    oval(g, 32, 39, 17, 8.5, '#3d6e7e');
    oval(g, 30, 38, 15, 6.5, 'rgba(180,215,225,0.25)');
    for (let i = 0; i < 3; i++) {
      const fx = 24 + i * 8 + r.int(3);
      oval(g, fx, 38 + (i % 2) * 3, 4.5, 1.8, '#b9c4c9', (r.next() - 0.5) * 0.8);
      dot(g, fx + 3.4, 38 + (i % 2) * 3, 0.7, '#2b2118');
    }
    // Rim highlight.
    g.strokeStyle = 'rgba(255,235,215,0.35)';
    g.lineWidth = 2;
    g.beginPath();
    g.ellipse(32, 36, 22, 12, 0, Math.PI * 1.1, Math.PI * 1.9);
    g.stroke();
  });

  // A kitchen grate breathing steam up into the lane.
  make('steamvent', 3, (g, r) => {
    softShadow(g, 32, 52, 18, 5, 0.14);
    rr(g, 16, 36, 32, 18, 4, '#5f646a');
    vgrad(g, 16, 36, 32, 5, 'rgba(230,238,244,0.25)', 'rgba(0,0,0,0)');
    g.strokeStyle = 'rgba(30,32,38,0.6)';
    g.lineWidth = 2;
    for (let i = 0; i < 4; i++) {
      g.beginPath();
      g.moveTo(20, 40 + i * 3.4);
      g.lineTo(44, 40 + i * 3.4);
      g.stroke();
    }
    // Rising steam, soft and shifting.
    for (let i = 0; i < 4; i++) {
      const sy = 30 - i * 7 - r.int(3);
      oval(g, 30 + (i % 2 ? 5 : -4) + r.int(4), sy, 6 + i * 1.5, 4 + i, `rgba(235,240,244,${0.22 - i * 0.04})`);
    }
  });

  // The tea kettle on its brazier, the only thing allowed to hurry.
  make('kettle', 1, (g) => {
    softShadow(g, 32, 52, 18, 5, 0.16);
    // Brazier.
    rr(g, 20, 44, 24, 10, 3, '#4a4038');
    glowSpot(g, 32, 49, 8, '#e8a050', 0.5);
    // Kettle body.
    oval(g, 32, 36, 14, 10, '#8a7a54');
    oval(g, 28, 33, 8, 5, 'rgba(240,230,200,0.28)');
    // Spout and lid.
    g.strokeStyle = '#6e6142';
    g.lineWidth = 4;
    g.lineCap = 'round';
    g.beginPath();
    g.moveTo(44, 34);
    g.quadraticCurveTo(50, 31, 51, 26);
    g.stroke();
    dot(g, 32, 26, 3.4, '#6e6142');
    g.lineWidth = 3;
    g.beginPath();
    g.arc(32, 22, 7, Math.PI * 1.15, Math.PI * 1.85);
    g.stroke();
    // A thread of steam.
    oval(g, 51, 18, 3, 5, 'rgba(240,244,246,0.3)');
    oval(g, 49, 10, 4, 5, 'rgba(240,244,246,0.2)');
  });

  // ------------------------------------------------------------ talls

  // A market stall under a striped awning, catch on ice.
  make('awning', 3, (g, r) => {
    softShadow(g, 32, 90, 26, 6, 0.2);
    const cloth = r.pick(AWNINGS);
    // Posts.
    for (const px of [8, 56]) rr(g, px - 1.5, 30, 3, 58, 1.5, '#5c4630');
    // Counter of crates and ice.
    rr(g, 5, 60, 54, 24, 3, '#9b7a50');
    vgrad(g, 5, 60, 54, 7, 'rgba(255,240,210,0.2)', 'rgba(0,0,0,0)');
    rr(g, 8, 54, 48, 10, 4, '#e8f0f2');
    // The morning catch, nose to tail.
    for (let i = 0; i < 4; i++) {
      oval(g, 14 + i * 12, 58, 5.5, 2.4, i % 2 ? '#b9c4c9' : '#9fb3bd', 0.12);
      dot(g, 18 + i * 12, 57.4, 0.8, '#2b2118');
    }
    // The awning: a sagging stripe of cloth.
    g.fillStyle = cloth;
    g.beginPath();
    g.moveTo(2, 30);
    g.quadraticCurveTo(32, 24, 62, 30);
    g.lineTo(62, 42);
    g.quadraticCurveTo(32, 48, 2, 42);
    g.closePath();
    g.fill();
    g.fillStyle = 'rgba(242,230,208,0.85)';
    for (const bx of [12, 30, 48]) {
      g.beginPath();
      g.moveTo(bx, 27 + (32 - Math.abs(bx - 32)) * -0.05);
      g.lineTo(bx + 8, 27);
      g.lineTo(bx + 8, 45);
      g.lineTo(bx, 45);
      g.closePath();
      g.fill();
    }
    // Scalloped hem.
    for (let bx = 6; bx < 62; bx += 8) {
      dot(g, bx, 43 + (r.int(2)), 3.4, bx % 16 < 8 ? cloth : 'rgba(242,230,208,0.85)');
    }
    vgrad(g, 2, 24, 60, 8, 'rgba(255,250,240,0.25)', 'rgba(0,0,0,0)');
  }, 64, 96);

  // Dried fish hanging in rows; the alley's wall and weather.
  make('fishrack', 3, (g, r) => {
    softShadow(g, 32, 90, 24, 6, 0.18);
    // Frame.
    for (const px of [8, 56]) rr(g, px - 1.5, 12, 3, 76, 1.5, '#6e5138');
    for (const by of [16, 44, 70]) rr(g, 6, by, 52, 2.6, 1.3, '#8a6a44');
    // Strings and fish, silver going gold.
    for (const [by, n] of [[16, 5], [44, 4], [70, 4]] as const) {
      for (let i = 0; i < n; i++) {
        const fx = 12 + i * (44 / (n - 1)) + (r.next() - 0.5) * 3;
        g.strokeStyle = 'rgba(60,45,28,0.5)';
        g.lineWidth = 1.2;
        g.beginPath();
        g.moveTo(fx, by + 2);
        g.lineTo(fx, by + 7);
        g.stroke();
        const tone = r.chance(0.5) ? '#c9b478' : '#b9c0c4';
        oval(g, fx, by + 15, 3.2, 8, shade(tone, (r.next() - 0.5) * 0.1));
        oval(g, fx - 1, by + 12, 1.6, 3.4, 'rgba(255,245,225,0.35)');
        // Tail.
        g.fillStyle = shade(tone, -0.18);
        g.beginPath();
        g.moveTo(fx - 2.4, by + 22);
        g.lineTo(fx + 2.4, by + 22);
        g.lineTo(fx, by + 27);
        g.closePath();
        g.fill();
      }
    }
  }, 64, 96);

  // The eomuk cart: skewers standing in broth, a kettle on the honor system.
  make('eomukcart', 1, (g) => {
    softShadow(g, 32, 90, 26, 6, 0.2);
    // Wheels and body.
    dot(g, 16, 82, 8, '#3d2f20');
    dot(g, 48, 82, 8, '#3d2f20');
    rr(g, 6, 54, 52, 26, 4, '#a34a2a');
    vgrad(g, 6, 54, 52, 8, 'rgba(255,240,220,0.2)', 'rgba(0,0,0,0)');
    // The broth vat, steel with steam.
    rr(g, 12, 42, 30, 14, 3, '#9aa1a6');
    rr(g, 14, 44, 26, 6, 2, '#6e5a3a');
    // Skewers of folded fish cake.
    g.strokeStyle = '#e2d4b4';
    g.lineWidth = 2;
    for (let i = 0; i < 5; i++) {
      const sx = 16 + i * 5.5;
      g.beginPath();
      g.moveTo(sx, 46);
      g.lineTo(sx + 2, 26 - (i % 2) * 4);
      g.stroke();
      oval(g, sx + 1.6, 28 - (i % 2) * 4, 2.6, 5, '#c9a35f', 0.2);
    }
    // The shared kettle and cups.
    rr(g, 46, 46, 9, 9, 2, '#8a7a54');
    rr(g, 46, 58, 4, 5, 1, PAL.cream);
    rr(g, 52, 58, 4, 5, 1, PAL.cream);
    // Steam and a hung lamp.
    oval(g, 26, 34, 7, 4, 'rgba(240,244,246,0.28)');
    oval(g, 30, 24, 8, 5, 'rgba(240,244,246,0.18)');
    glowSpot(g, 54, 36, 10, '#ffca7a', 0.5);
    dot(g, 54, 36, 3, '#ffb85c');
  }, 64, 96);

  // The hotteok griddle cart: gold discs, a seed jar, thirty years of flips.
  make('hotteokcart', 1, (g) => {
    softShadow(g, 32, 90, 26, 6, 0.2);
    // Small canopy.
    rr(g, 4, 18, 56, 10, 5, '#c1512f');
    g.fillStyle = PAL.cream;
    g.fillRect(16, 18, 11, 10);
    g.fillRect(38, 18, 11, 10);
    for (const px of [7, 56]) rr(g, px - 1.3, 24, 2.6, 40, 1.3, '#5c4630');
    // Cart body.
    dot(g, 17, 84, 8, '#3d2f20');
    dot(g, 47, 84, 8, '#3d2f20');
    rr(g, 6, 58, 52, 24, 4, '#4d6a44');
    vgrad(g, 6, 58, 52, 8, 'rgba(255,240,220,0.18)', 'rgba(0,0,0,0)');
    // The round iron griddle.
    oval(g, 30, 54, 21, 9, '#3a332c');
    oval(g, 30, 52.5, 19, 7.5, '#4a423a');
    for (const [hx, hy] of [[22, 51], [34, 49.5], [30, 55.5]] as const) {
      oval(g, hx, hy, 5.5, 3, '#d9a441');
      oval(g, hx - 1.5, hy - 1, 2.6, 1.2, 'rgba(255,240,200,0.5)');
    }
    // Seed jar and spatula.
    rr(g, 50, 46, 8, 12, 2, 'rgba(225,235,240,0.75)');
    rect(g, 51.4, 50, 5.2, 6.5, '#b08a4a');
    rr(g, 8, 44, 3, 12, 1.5, '#8a6a44');
    rr(g, 6, 40, 7, 5, 1.5, '#c9c4bb');
    // Sugar-steam.
    oval(g, 30, 40, 7, 4, 'rgba(245,240,230,0.25)');
    glowSpot(g, 30, 52, 14, '#ffb066', 0.3);
  }, 64, 96);

  // The hillside: small houses stacked in pastel steps. Pure backdrop.
  make('hillhouses', 5, (g, r) => {
    softShadow(g, 32, 92, 28, 6, 0.2);
    // Three storeys of separate houses, climbing.
    const c1 = r.pick(PASTELS);
    const c2 = r.pick(PASTELS);
    const c3 = r.pick(PASTELS);
    const box = (x: number, y: number, w: number, h: number, c: string) => {
      rr(g, x, y, w, h, 2, c);
      vgrad(g, x, y, w, 6, 'rgba(255,252,242,0.3)', 'rgba(0,0,0,0)');
      // Side shade and a flat roof lip.
      rect(g, x + w - 4, y + 2, 4, h - 2, 'rgba(40,36,50,0.14)');
      rr(g, x - 2, y - 3, w + 4, 5, 2, shade(c, -0.25));
      // A window or two, sometimes lit before dawn.
      const lit = r.chance(0.4);
      rr(g, x + 5, y + h * 0.35, 7, 8, 1.5, lit ? '#ffd98a' : '#3c4658');
      if (lit) glowSpot(g, x + 8, y + h * 0.35 + 4, 8, '#ffca7a', 0.4);
      if (w > 34) rr(g, x + w - 14, y + h * 0.35, 7, 8, 1.5, '#3c4658');
    };
    box(4 + r.int(4), 58, 44 + r.int(10), 32, c1);
    box(10 + r.int(8), 34, 38 + r.int(8), 28, c2);
    box(18 + r.int(8), 12, 32 + r.int(6), 26, c3);
    // A stair seam up the side.
    g.strokeStyle = 'rgba(90,85,95,0.4)';
    g.lineWidth = 2.4;
    g.beginPath();
    g.moveTo(8, 90);
    g.quadraticCurveTo(4, 56, 16, 14);
    g.stroke();
  }, 64, 96);

  // A container crane at the water: an orange giraffe, grazing.
  make('crane', 2, (g, r) => {
    const orange = shade('#d97b2e', (r.next() - 0.5) * 0.06);
    softShadow(g, 32, 92, 24, 5, 0.16);
    // Legs and cross-brace.
    g.strokeStyle = orange;
    g.lineWidth = 5;
    g.beginPath();
    g.moveTo(18, 90);
    g.lineTo(24, 34);
    g.moveTo(46, 90);
    g.lineTo(40, 34);
    g.stroke();
    g.lineWidth = 2.6;
    g.beginPath();
    g.moveTo(20, 70);
    g.lineTo(44, 62);
    g.moveTo(44, 70);
    g.lineTo(20, 62);
    g.stroke();
    // The boom, nosing down toward the ships.
    rr(g, 4, 28, 58, 6, 2, orange);
    rr(g, 20, 20, 26, 10, 2, shade(orange, -0.12));
    rr(g, 24, 22, 8, 6, 1.5, '#e8f0f2');
    // Cables and a hanging container.
    g.strokeStyle = 'rgba(50,40,32,0.6)';
    g.lineWidth = 1.6;
    g.beginPath();
    g.moveTo(10, 34);
    g.lineTo(10, 46);
    g.moveTo(16, 34);
    g.lineTo(16, 46);
    g.stroke();
    rr(g, 5, 46, 16, 9, 1.5, r.chance(0.5) ? '#5f8781' : '#8a5330');
    g.strokeStyle = 'rgba(255,245,230,0.35)';
    g.lineWidth = 1.4;
    g.beginPath();
    g.moveTo(4, 29.5);
    g.lineTo(62, 29.5);
    g.stroke();
  }, 64, 96);

  // The post window: a kiosk the size of a biscuit tin.
  make('postwindow', 1, (g) => {
    softShadow(g, 32, 90, 22, 6, 0.2);
    // Body and little roof.
    rr(g, 12, 32, 40, 56, 3, '#6e5138');
    vgrad(g, 12, 32, 40, 8, 'rgba(255,240,215,0.2)', 'rgba(0,0,0,0)');
    rr(g, 8, 24, 48, 11, 4, '#8a3b2e');
    vgrad(g, 8, 24, 48, 4, 'rgba(255,245,230,0.3)', 'rgba(0,0,0,0)');
    // The window with its counter lip.
    rr(g, 19, 42, 26, 20, 3, '#3c3226');
    rr(g, 21, 44, 22, 14, 2, '#e8dcc0');
    glowSpot(g, 32, 51, 12, '#f6ecc8', 0.5);
    rr(g, 17, 62, 30, 4, 2, '#8a6a44');
    // Postal mark and a waiting envelope.
    dot(g, 32, 74, 5.5, '#c0392b');
    rect(g, 29.4, 71.8, 5.2, 1.6, PAL.cream);
    rect(g, 31.2, 70, 1.6, 5.2, PAL.cream);
    rr(g, 38, 57, 8, 5, 1, PAL.cream);
  }, 64, 96);

  // A hanji paper lamp on a wooden post; morning, filtered.
  make('hanjilamp', 1, (g) => {
    softShadow(g, 32, 90, 16, 5, 0.16);
    rr(g, 29, 42, 6, 46, 3, '#5a4632');
    rr(g, 24, 84, 16, 5, 2, '#4a3826');
    // The paper box.
    rr(g, 16, 12, 32, 32, 5, '#f2e6c8');
    glowSpot(g, 32, 28, 18, '#ffd98a', 0.55);
    g.strokeStyle = 'rgba(90,70,50,0.55)';
    g.lineWidth = 2;
    g.strokeRect(18, 14, 28, 28);
    g.beginPath();
    g.moveTo(32, 14);
    g.lineTo(32, 42);
    g.moveTo(18, 28);
    g.lineTo(46, 28);
    g.stroke();
    rr(g, 14, 8, 36, 6, 3, '#5a4632');
  }, 64, 96);

  // ------------------------------------------------------------ the tea house
  // 352x256, casa-pattern geometry so footprints and door cells line up.
  make('teahouse', 2, (g, r) => {
    const W = 352;
    const wallTop = 96;
    const wallBot = 252;
    const plaster = shade('#e2d6bc', (r.next() - 0.5) * 0.04);

    // Wall.
    vgrad(g, 16, wallTop, W - 32, wallBot - wallTop, shade(plaster, 0.06), shade(plaster, -0.08));
    vgrad(g, 16, wallBot - 16, W - 32, 16, 'rgba(0,0,0,0)', 'rgba(50,44,34,0.3)');
    g.save();
    g.globalAlpha = 0.14;
    g.fillStyle = '#1c1712';
    g.fillRect(W - 26, wallTop, 10, wallBot - wallTop);
    g.restore();
    // Timber posts.
    for (const px of [20, 120, 232, 324]) {
      rr(g, px, wallTop + 4, 12, wallBot - wallTop - 4, 3, '#5a4632');
      vgrad(g, px, wallTop + 4, 12, 30, 'rgba(255,240,215,0.15)', 'rgba(0,0,0,0)');
    }
    rr(g, 16, wallTop + 2, W - 32, 10, 3, '#5a4632');
    // Stone footing.
    rr(g, 14, wallBot - 12, W - 28, 12, 4, '#8c8479');

    // Door: same cell as the casa, a lattice slid half open.
    rr(g, 150, wallBot - 96, 66, 96, 6, '#4a3826');
    rr(g, 156, wallBot - 88, 54, 88, 4, '#2e2418');
    rr(g, 156, wallBot - 88, 26, 88, 3, '#e8dcc0');
    glowSpot(g, 169, wallBot - 44, 26, '#f6ecc8', 0.35);
    g.strokeStyle = 'rgba(90,70,50,0.6)';
    g.lineWidth = 2;
    for (let k = 1; k < 4; k++) {
      g.beginPath();
      g.moveTo(156 + k * 6.5, wallBot - 88);
      g.lineTo(156 + k * 6.5, wallBot - 2);
      g.stroke();
    }
    for (let k = 1; k < 6; k++) {
      g.beginPath();
      g.moveTo(156, wallBot - 88 + k * 14);
      g.lineTo(182, wallBot - 88 + k * 14);
      g.stroke();
    }
    rr(g, 146, wallBot - 102, 74, 10, 5, '#5a4632');
    // A small name board over the door.
    rr(g, 162, wallBot - 122, 42, 16, 3, '#3c3226');
    g.strokeStyle = 'rgba(240,228,200,0.8)';
    g.lineWidth = 2.4;
    g.beginPath();
    g.moveTo(172, wallBot - 117);
    g.lineTo(172, wallBot - 109);
    g.moveTo(168, wallBot - 113);
    g.lineTo(176, wallBot - 113);
    g.moveTo(186, wallBot - 117);
    g.lineTo(194, wallBot - 117);
    g.moveTo(190, wallBot - 117);
    g.lineTo(190, wallBot - 109);
    g.stroke();

    // Paper windows where the casa keeps its windows.
    for (const wx of [52, 252]) {
      rr(g, wx - 4, wallTop + 30, 56, 52, 4, '#5a4632');
      rr(g, wx, wallTop + 34, 48, 44, 3, '#e8dcc0');
      glowSpot(g, wx + 24, wallTop + 56, 26, '#f6ecc8', 0.4);
      g.strokeStyle = 'rgba(90,70,50,0.6)';
      g.lineWidth = 2;
      for (let k = 1; k < 4; k++) {
        g.beginPath();
        g.moveTo(wx + k * 12, wallTop + 34);
        g.lineTo(wx + k * 12, wallTop + 78);
        g.stroke();
      }
      g.beginPath();
      g.moveTo(wx, wallTop + 56);
      g.lineTo(wx + 48, wallTop + 56);
      g.stroke();
    }

    // The tiled roof: deep eaves, corners lifting slightly.
    const tile = '#4a5058';
    g.fillStyle = tile;
    g.beginPath();
    g.moveTo(2, wallTop + 10);
    g.quadraticCurveTo(8, wallTop - 30, 60, wallTop - 44);
    g.lineTo(W - 60, wallTop - 44);
    g.quadraticCurveTo(W - 8, wallTop - 30, W - 2, wallTop + 10);
    g.quadraticCurveTo(W / 2, wallTop + 26, 2, wallTop + 10);
    g.closePath();
    g.fill();
    // Ridge and tile ribs.
    rr(g, 52, wallTop - 52, W - 104, 12, 5, shade(tile, -0.2));
    g.strokeStyle = 'rgba(25,28,34,0.4)';
    g.lineWidth = 2;
    for (let k = 0; k < 13; k++) {
      const rx = 22 + k * ((W - 44) / 12);
      g.beginPath();
      g.moveTo(rx, wallTop + 12 - Math.abs(rx - W / 2) * 0.02);
      g.quadraticCurveTo(rx + (rx < W / 2 ? 5 : -5), wallTop - 18, rx + (rx < W / 2 ? 10 : -10), wallTop - 42);
      g.stroke();
    }
    vgrad(g, 2, wallTop - 44, W - 4, 16, 'rgba(230,238,246,0.16)', 'rgba(0,0,0,0)');
    // Eave shadow onto the wall.
    vgrad(g, 16, wallTop + 12, W - 32, 18, 'rgba(25,20,14,0.35)', 'rgba(0,0,0,0)');
  }, 352, 256);
}

export const ART: ChapterArt = {
  paint,
  aliases: { ferrysign: 'signpost' },
  grounded: [
    'awning',
    'fishrack',
    'eomukcart',
    'hotteokcart',
    'hillhouses',
    'crane',
    'postwindow',
    'hanjilamp',
    'ferrysign',
  ],
  buildings: ['teahouse'],
  windows: {
    teahouse: [
      [15, -10],
      [67, -10],
    ],
  },
  glows: ['eomukcart', 'hotteokcart', 'hanjilamp'],
  pathy: ['lanepave'],
};
