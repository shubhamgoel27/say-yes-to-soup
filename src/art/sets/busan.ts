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
// Red is reserved: Sun-hee's stall is the one red awning in the chapter,
// because the letter tells you to start where the red awning is. When the
// ordinary awnings could also be red, that instruction named six things.
const AWNINGS = ['#e0c15c', '#3f7fb0', '#4d7440', '#d9853f'];

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

  // A market stall under a striped awning, catch on ice. One variant per
  // cloth colour, and each hangs its cloth at its own height: four stalls in
  // a lane should never read as one stall printed four times.
  make('awning', 4, (g, r, i) => {
    softShadow(g, 32, 90, 26, 6, 0.2);
    const cloth = AWNINGS[i % AWNINGS.length] as string;
    const hang = [0, 5, -3, 8][i % 4] as number; // how low this one slings its cloth
    const sag = [6, 3, 9, 5][i % 4] as number;
    // Posts.
    for (const px of [8, 56]) rr(g, px - 1.5, 30 + hang, 3, 58 - hang, 1.5, '#5c4630');
    // Counter of crates and ice.
    rr(g, 5, 60, 54, 24, 3, '#9b7a50');
    vgrad(g, 5, 60, 54, 7, 'rgba(255,240,210,0.2)', 'rgba(0,0,0,0)');
    rr(g, 8, 54, 48, 10, 4, '#e8f0f2');
    // The morning catch, nose to tail, and never the same count.
    for (let k = 0; k < 3 + (i % 3); k++) {
      oval(g, 14 + k * 12, 58, 5.5, 2.4, k % 2 ? '#b9c4c9' : '#9fb3bd', 0.12);
      dot(g, 18 + k * 12, 57.4, 0.8, '#2b2118');
    }
    // The awning: a sagging stripe of cloth.
    const top = 30 + hang;
    g.fillStyle = cloth;
    g.beginPath();
    g.moveTo(2, top);
    g.quadraticCurveTo(32, top - sag, 62, top);
    g.lineTo(62, top + 12);
    g.quadraticCurveTo(32, top + 12 + sag, 2, top + 12);
    g.closePath();
    g.fill();
    g.fillStyle = 'rgba(242,230,208,0.85)';
    for (const bx of [12, 30, 48]) {
      g.beginPath();
      g.moveTo(bx, top - 3 + (32 - Math.abs(bx - 32)) * -0.05);
      g.lineTo(bx + 8, top - 3);
      g.lineTo(bx + 8, top + 15);
      g.lineTo(bx, top + 15);
      g.closePath();
      g.fill();
    }
    // Scalloped hem.
    for (let bx = 6; bx < 62; bx += 8) {
      dot(g, bx, top + 13 + r.int(2), 3.4, bx % 16 < 8 ? cloth : 'rgba(242,230,208,0.85)');
    }
    vgrad(g, 2, top - 6, 60, 8, 'rgba(255,250,240,0.25)', 'rgba(0,0,0,0)');
  }, 64, 96);

  /**
   * Sun-hee's stall: the red awning the letter tells you to look for, and the
   * one thing in the lane built at a size nothing else is. Three tiles of
   * cloth, a bulb burning under it before dawn, and the whole morning's
   * argument laid out on ice.
   */
  make('hongawning', 2, (g, r) => {
    const W2 = 96;
    // Drawn in a 96x128 frame and stretched to fill 128x160, so it stands two
    // clear tiles wide: nothing else in the lane is built at this size.
    g.scale(128 / 96, 160 / 128);
    softShadow(g, 48, 122, 40, 8, 0.22);
    const cloth = shade('#b8332b', (r.next() - 0.5) * 0.05);
    // Four posts, the back pair shorter so the roof reads as pitched forward.
    for (const px of [10, 86]) rr(g, px - 2, 40, 4, 82, 2, '#4e3a26');
    for (const px of [24, 72]) rr(g, px - 1.6, 34, 3.2, 40, 1.6, '#5c4630');
    // The counter: two trestles of crates, a plank, a bed of crushed ice.
    rr(g, 6, 86, 84, 30, 3, '#8a6c46');
    vgrad(g, 6, 86, 84, 8, 'rgba(255,240,210,0.22)', 'rgba(0,0,0,0)');
    rr(g, 10, 76, 76, 14, 5, '#e6eef2');
    for (let k = 0; k < 9; k++) {
      dot(g, 14 + k * 9, 80 + (k % 2), 3.4, 'rgba(255,255,255,0.5)');
    }
    // The catch: mackerel nose to tail, one drawer of knives.
    for (let k = 0; k < 8; k++) {
      const fx = 14 + k * 9.4;
      oval(g, fx, 82 - (k % 2) * 1.2, 4.4, 2.2, k % 2 ? '#7f96a4' : '#96aab4', 0.1);
      oval(g, fx - 1, 81 - (k % 2) * 1.2, 2, 0.9, 'rgba(230,244,250,0.5)');
      dot(g, fx + 3, 81.6 - (k % 2) * 1.2, 0.7, '#221a12');
    }
    // Red basins under the counter, half unpacked.
    for (const [bx, by] of [[16, 112], [34, 116], [76, 113]] as const) {
      oval(g, bx, by, 10, 5, shade('#c0392b', -0.14));
      oval(g, bx, by - 2, 10, 4.6, '#c0392b');
      oval(g, bx, by - 1.6, 7.4, 3, shade('#c0392b', -0.3));
    }
    // The awning: a long red cloth, hung deeper on the left where it sags.
    g.fillStyle = cloth;
    g.beginPath();
    g.moveTo(2, 40);
    g.quadraticCurveTo(48, 28, 94, 36);
    g.lineTo(94, 52);
    g.quadraticCurveTo(48, 46, 2, 58);
    g.closePath();
    g.fill();
    // Two cream bands, off centre.
    g.fillStyle = 'rgba(246,236,216,0.9)';
    for (const bx of [22, 62]) {
      g.beginPath();
      g.moveTo(bx, 33 + (bx - 22) * -0.05);
      g.lineTo(bx + 11, 32);
      g.lineTo(bx + 11, 51);
      g.lineTo(bx, 54 + (bx - 22) * -0.05);
      g.closePath();
      g.fill();
    }
    // Scalloped hem, deeper at the sagging end.
    for (let bx = 5; bx < W2 - 2; bx += 9) {
      dot(g, bx, 57 - bx * 0.2 + r.int(2), 4, bx % 18 < 9 ? cloth : 'rgba(246,236,216,0.9)');
    }
    vgrad(g, 2, 26, W2 - 4, 10, 'rgba(255,250,240,0.28)', 'rgba(0,0,0,0)');
    // The hand-lettered board wired to the front post.
    rr(g, 60, 58, 30, 18, 2, '#f0e6ce');
    g.strokeStyle = 'rgba(60,44,30,0.75)';
    g.lineWidth = 1.6;
    for (let ly = 63; ly < 74; ly += 4) {
      g.beginPath();
      g.moveTo(64, ly);
      g.lineTo(64 + 8 + r.int(12), ly);
      g.stroke();
    }
    dot(g, 86, 62, 2.4, '#b8332b');
    // The bulb on its flex, burning since four in the morning.
    g.strokeStyle = 'rgba(40,32,24,0.7)';
    g.lineWidth = 1.4;
    g.beginPath();
    g.moveTo(38, 40);
    g.quadraticCurveTo(40, 50, 42, 58);
    g.stroke();
    glowSpot(g, 42, 60, 22, '#ffca7a', 0.55);
    dot(g, 42, 60, 4, '#ffd98a');
    // The scale, hung off the near post, and a knife on the plank.
    rr(g, 84, 60, 3, 12, 1.5, '#6e6a62');
    oval(g, 85.5, 74, 6, 3.2, '#c9c4bb');
    rr(g, 24, 74, 22, 3, 1.5, '#cfd6da');
    rr(g, 20, 73.6, 7, 4, 1.5, '#6b4f33');
  }, 128, 160);

  // The lane's own vehicle: a two-wheel barrow, tipped on its legs, waiting
  // out an argument with a load half taken off.
  make('barrow', 2, (g, r) => {
    softShadow(g, 32, 74, 24, 6, 0.2);
    // The wheel, seen side on, and the leg it leans on.
    dot(g, 20, 62, 11, '#3a3128');
    dot(g, 20, 62, 4, '#8c8479');
    rr(g, 46, 54, 3, 20, 1.5, '#5c4630');
    // The tray: planks, worn silver at the lip.
    rr(g, 8, 40, 50, 22, 3, '#9b7a50');
    vgrad(g, 8, 40, 50, 7, 'rgba(255,240,210,0.22)', 'rgba(0,0,0,0)');
    g.strokeStyle = 'rgba(60,44,28,0.35)';
    g.lineWidth = 1.6;
    for (const ly of [47, 54]) {
      g.beginPath();
      g.moveTo(9, ly);
      g.lineTo(57, ly);
      g.stroke();
    }
    // Handles, running back past the wheel.
    for (const hy of [42, 56]) rr(g, 54, hy, 12, 3, 1.5, '#8a6a44');
    // The load: foam boxes and, on top, a basin nobody has emptied.
    rr(g, 12, 26, 26, 16, 2, '#eef1f2');
    rect(g, 12, 32, 26, 2, 'rgba(150,160,168,0.4)');
    if (r.chance(0.6)) {
      rr(g, 36, 30, 20, 12, 2, '#e6e9ea');
      rect(g, 36, 35, 20, 1.6, 'rgba(150,160,168,0.35)');
    }
    oval(g, 26, 24, 13, 6, shade('#c0392b', -0.14));
    oval(g, 26, 21, 13, 5.6, '#c0392b');
    oval(g, 26, 21.6, 9.6, 3.6, shade('#c0392b', -0.3));
    // Rope, coiled on the near corner.
    g.strokeStyle = '#c9b489';
    g.lineWidth = 2;
    for (const rr2 of [7, 4.4]) {
      g.beginPath();
      g.ellipse(50, 46, rr2, rr2 * 0.5, 0, 0, Math.PI * 2);
      g.stroke();
    }
  }, 64, 80);

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

  // A container crane at the water: an orange giraffe, grazing. Two tiles
  // wide and three tall, because a gantry drawn inside one cell reads as a
  // sawhorse. The portal is left open on purpose: the quay row behind it is
  // walkable, and you should be able to see whoever is standing under it.
  make('crane', 2, (g, r) => {
    const orange = shade('#d97b2e', (r.next() - 0.5) * 0.06);
    const dark = shade(orange, -0.18);
    softShadow(g, 64, 212, 50, 9, 0.18);
    // The sill beam and its bogies, riding the rail along the water.
    rr(g, 18, 194, 92, 12, 3, '#4f545c');
    for (const bx of [24, 48, 72, 94]) rr(g, bx, 201, 12, 8, 2, '#3a3f47');
    for (let i = 0; i < 5; i++) rr(g, 23 + i * 19, 196, 9, 5, 1, 'rgba(240,236,225,0.5)');
    // Four legs, kept thin so the portal stays a window, not a wall.
    g.lineCap = 'round';
    g.strokeStyle = orange;
    g.lineWidth = 6;
    g.beginPath();
    g.moveTo(31, 196);
    g.lineTo(37, 72);
    g.moveTo(99, 196);
    g.lineTo(93, 72);
    g.stroke();
    g.strokeStyle = dark;
    g.lineWidth = 4;
    g.beginPath();
    g.moveTo(47, 188);
    g.lineTo(51, 72);
    g.moveTo(87, 188);
    g.lineTo(83, 72);
    g.stroke();
    // Bracing low down only, under the walkway, where it hides nobody.
    g.strokeStyle = shade(orange, -0.06);
    g.lineWidth = 2.4;
    g.beginPath();
    g.moveTo(36, 164);
    g.lineTo(94, 190);
    g.moveTo(94, 164);
    g.lineTo(36, 190);
    g.stroke();
    // The portal head, and the upper tower narrowing to the boom.
    rr(g, 26, 60, 78, 12, 3, orange);
    g.strokeStyle = orange;
    g.lineWidth = 5;
    g.beginPath();
    g.moveTo(46, 62);
    g.lineTo(52, 32);
    g.moveTo(84, 62);
    g.lineTo(78, 32);
    g.stroke();
    // The boom: a long lattice nosing out over the berth.
    rr(g, 2, 30, 124, 9, 3, orange);
    g.strokeStyle = shade(orange, -0.16);
    g.lineWidth = 2;
    g.beginPath();
    for (let x = 4; x < 122; x += 12) {
      g.moveTo(x, 39);
      g.lineTo(x + 9, 30);
    }
    g.stroke();
    // The A-frame, the machinery house, the stays, and the shipping light.
    g.strokeStyle = orange;
    g.lineWidth = 4.5;
    g.beginPath();
    g.moveTo(55, 32);
    g.lineTo(63, 8);
    g.moveTo(75, 32);
    g.lineTo(67, 8);
    g.stroke();
    rr(g, 86, 12, 30, 19, 3, shade(orange, -0.08));
    rr(g, 92, 17, 12, 9, 2, '#e8f0f2');
    g.strokeStyle = 'rgba(58,46,34,0.5)';
    g.lineWidth = 1.8;
    g.beginPath();
    g.moveTo(63, 10);
    g.lineTo(8, 29);
    g.moveTo(67, 10);
    g.lineTo(122, 29);
    g.stroke();
    dot(g, 65, 5, 3.4, '#e05a3a');
    // The cab, and the trolley out over the water with its spreader empty.
    rr(g, 38, 40, 14, 12, 2, '#dfe8ea');
    const tx = 10 + r.int(10);
    rr(g, tx - 8, 22, 17, 9, 2, dark);
    g.strokeStyle = 'rgba(50,40,32,0.65)';
    g.lineWidth = 1.6;
    g.beginPath();
    g.moveTo(tx - 5, 31);
    g.lineTo(tx - 5, 50);
    g.moveTo(tx + 5, 31);
    g.lineTo(tx + 5, 50);
    g.stroke();
    rr(g, tx - 12, 50, 24, 7, 2, dark);
    // One sunlit edge along the boom, so it does not read as a flat bar.
    g.strokeStyle = 'rgba(255,245,230,0.35)';
    g.lineWidth = 1.6;
    g.beginPath();
    g.moveTo(3, 31.5);
    g.lineTo(125, 31.5);
    g.stroke();
  }, 128, 224);

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

  // ------------------------------------------------------ the lane's clutter

  // Red basins stacked head-high: the market's scaffolding, off duty.
  make('basinstack', 2, (g, r) => {
    softShadow(g, 32, 88, 22, 6, 0.2);
    const blueAt = 1 + r.int(4);
    let y = 82;
    for (let i = 0; i < 6; i++) {
      const hull = i === blueAt ? '#2e6da4' : '#c0392b';
      const wob = (r.next() - 0.5) * 4;
      const rx = 21 - i * 0.6;
      oval(g, 32 + wob, y, rx, 7.5, shade(hull, -0.18));
      oval(g, 32 + wob, y - 3, rx, 7, hull);
      oval(g, 32 + wob, y - 4, rx - 3.5, 4.5, shade(hull, -0.3));
      // Rim light on the sun side.
      g.strokeStyle = 'rgba(255,235,215,0.3)';
      g.lineWidth = 1.6;
      g.beginPath();
      g.ellipse(32 + wob, y - 4.5, rx - 1, 5.5, 0, Math.PI * 1.15, Math.PI * 1.8);
      g.stroke();
      y -= 9;
    }
  }, 64, 96);

  // Dried squid pinned on a cord like laundry: flat, splayed, surprised.
  make('squidline', 2, (g, r) => {
    softShadow(g, 32, 90, 20, 5, 0.1);
    // Cord ends and the sag.
    for (const px of [5, 59]) rr(g, px - 1.3, 10, 2.6, 80, 1.3, '#6e5138');
    g.strokeStyle = 'rgba(70,55,38,0.8)';
    g.lineWidth = 1.6;
    g.beginPath();
    g.moveTo(5, 16);
    g.quadraticCurveTo(32, 24, 59, 16);
    g.stroke();
    // Three squid, mantle up, legs down.
    for (let i = 0; i < 3; i++) {
      const fx = 15 + i * 17 + (r.next() - 0.5) * 3;
      const fy = 21 + Math.sin((fx - 5) / 54 * Math.PI) * 3;
      const tone = shade('#d9bc8c', (r.next() - 0.5) * 0.1);
      dot(g, fx, fy, 1.5, '#c0392b'); // the pin
      // Mantle: a flat kite.
      g.fillStyle = tone;
      g.beginPath();
      g.moveTo(fx, fy + 1);
      g.lineTo(fx - 6.5, fy + 10);
      g.lineTo(fx - 5, fy + 26);
      g.lineTo(fx + 5, fy + 26);
      g.lineTo(fx + 6.5, fy + 10);
      g.closePath();
      g.fill();
      oval(g, fx - 2, fy + 12, 1.8, 6, 'rgba(255,246,226,0.4)');
      dot(g, fx - 2.2, fy + 21, 0.9, '#3c3226');
      dot(g, fx + 2.2, fy + 21, 0.9, '#3c3226');
      // Legs, splayed a little.
      g.strokeStyle = shade(tone, -0.16);
      g.lineWidth = 1.6;
      for (let k = -2; k <= 2; k++) {
        g.beginPath();
        g.moveTo(fx + k * 1.8, fy + 26);
        g.quadraticCurveTo(fx + k * 3.2, fy + 33, fx + k * 3.8, fy + 39 + Math.abs(k));
        g.stroke();
      }
    }
  }, 64, 96);

  // Onggi jars in the yard corner, one grandmother per jar, no exceptions.
  make('onggi', 3, (g, r) => {
    softShadow(g, 32, 88, 24, 7, 0.2);
    const jar = (cx: number, base: number, rx: number, h: number) => {
      const clay = shade('#7a4e30', (r.next() - 0.5) * 0.08);
      // Belly.
      g.fillStyle = clay;
      g.beginPath();
      g.moveTo(cx - rx * 0.55, base - h);
      g.bezierCurveTo(cx - rx * 1.15, base - h * 0.75, cx - rx * 1.1, base - h * 0.2, cx - rx * 0.6, base);
      g.lineTo(cx + rx * 0.6, base);
      g.bezierCurveTo(cx + rx * 1.1, base - h * 0.2, cx + rx * 1.15, base - h * 0.75, cx + rx * 0.55, base - h);
      g.closePath();
      g.fill();
      // Glaze light and a shoulder shadow.
      oval(g, cx - rx * 0.45, base - h * 0.62, rx * 0.22, h * 0.32, 'rgba(255,235,205,0.28)');
      oval(g, cx + rx * 0.5, base - h * 0.4, rx * 0.24, h * 0.3, 'rgba(30,20,14,0.18)');
      // Mouth and lid.
      oval(g, cx, base - h, rx * 0.6, 3.4, shade(clay, -0.28));
      oval(g, cx, base - h - 2, rx * 0.62, 3.2, shade(clay, -0.1));
      dot(g, cx, base - h - 4, 2.4, shade(clay, -0.22));
    };
    jar(20, 84, 15, 34);
    jar(46, 84, 12, 26);
    jar(34, 88, 8, 16);
  }, 64, 96);

  // Gochugaru chilies drying on a woven mat: winter, sunbathing.
  make('chilimat', 3, (g, r) => {
    const straw = '#c9b478';
    rr(g, 7, 16, 50, 42, 3, shade(straw, -0.14));
    rr(g, 9, 18, 46, 38, 2, straw);
    // Weave.
    g.strokeStyle = 'rgba(120,95,50,0.3)';
    g.lineWidth = 1.2;
    for (let k = 1; k < 5; k++) {
      g.beginPath();
      g.moveTo(9, 18 + k * 7.6);
      g.lineTo(55, 18 + k * 7.6);
      g.stroke();
    }
    for (let k = 1; k < 6; k++) {
      g.beginPath();
      g.moveTo(9 + k * 7.6, 18);
      g.lineTo(9 + k * 7.6, 56);
      g.stroke();
    }
    // The chilies, tumbled, not tidy.
    for (let i = 0; i < 15; i++) {
      const cx = 13 + r.int(39);
      const cy = 22 + r.int(31);
      const red = r.chance(0.75) ? '#b03024' : '#7e1f1a';
      oval(g, cx, cy, 5, 1.8, red, (r.next() - 0.5) * 2.6);
      dot(g, cx + 4, cy - 1, 0.8, '#4d6a2e');
    }
  });

  // Styrofoam fish boxes: a wobbly white tower with opinions written on it.
  make('foambox', 3, (g, r) => {
    softShadow(g, 32, 58, 22, 6, 0.18);
    const box = (x: number, y: number, w: number, h: number) => {
      rr(g, x, y, w, h, 2.5, '#e8edf0');
      vgrad(g, x, y, w, 5, 'rgba(255,255,255,0.5)', 'rgba(0,0,0,0)');
      rect(g, x + w - 5, y + 2, 5, h - 3, 'rgba(90,105,120,0.16)');
      // Lid seam.
      g.strokeStyle = 'rgba(110,125,140,0.4)';
      g.lineWidth = 1.4;
      g.beginPath();
      g.moveTo(x + 1, y + 6);
      g.lineTo(x + w - 1, y + 6);
      g.stroke();
      // The marker scrawl: fish, weight, auntie.
      g.strokeStyle = '#2c3e57';
      g.lineWidth = 1.8;
      g.beginPath();
      const mx = x + 6 + r.int(4);
      const my = y + h * 0.55;
      g.moveTo(mx, my);
      g.lineTo(mx + 8, my - 2);
      g.moveTo(mx + 2, my + 4);
      g.lineTo(mx + 11, my + 3);
      g.stroke();
    };
    box(10, 38, 44, 20);
    box(14 + r.int(4) - 2, 18, 38, 20);
    // The top lid rides a little crooked, with its blue rim showing.
    rr(g, 12 + r.int(3), 14, 40, 8, 2.5, '#3e7ab0');
    vgrad(g, 12, 14, 40, 3, 'rgba(255,255,255,0.35)', 'rgba(0,0,0,0)');
    // Ice glints at the seams.
    dot(g, 20, 23, 1.4, 'rgba(230,244,252,0.9)');
    dot(g, 44, 40, 1.2, 'rgba(230,244,252,0.8)');
  });

  // A market parasol and the plastic stool it shades: first come, first throne.
  make('parasol', 2, (g, r) => {
    softShadow(g, 30, 90, 24, 6, 0.2);
    const tilt = (r.next() - 0.5) * 3;
    // Pole and the stool.
    g.strokeStyle = '#8c8479';
    g.lineWidth = 3.4;
    g.beginPath();
    g.moveTo(30 + tilt, 34);
    g.lineTo(30, 88);
    g.stroke();
    rr(g, 42, 74, 14, 6, 2.5, '#2e6da4');
    for (const lx of [44, 53]) rr(g, lx, 79, 3, 9, 1.5, shade('#2e6da4', -0.18));
    // Canopy: a shallow faded dome with scallops.
    const cloth = r.chance(0.5) ? '#c9b89a' : '#a8b8c4';
    g.fillStyle = cloth;
    g.beginPath();
    g.moveTo(2, 34);
    g.quadraticCurveTo(30 + tilt, 4, 60, 34);
    g.closePath();
    g.fill();
    // Alternating panels, faded but still trying.
    const stripe = shade(cloth, -0.14);
    g.fillStyle = stripe;
    for (const [pa, pb] of [[12, 22], [38, 50]] as const) {
      g.beginPath();
      g.moveTo(pa, 33.4);
      g.quadraticCurveTo(30 + tilt, 10, 30 + tilt, 8);
      g.quadraticCurveTo(30 + tilt, 10, pb, 33.4);
      g.closePath();
      g.fill();
    }
    g.strokeStyle = shade(cloth, -0.24);
    g.lineWidth = 1.4;
    for (const px of [12, 22, 38, 50]) {
      g.beginPath();
      g.moveTo(px, 33);
      g.quadraticCurveTo(30 + tilt, 10, 30 + tilt, 8);
      g.stroke();
    }
    vgrad(g, 2, 10, 58, 12, 'rgba(255,250,235,0.35)', 'rgba(0,0,0,0)');
    for (let sx = 6; sx <= 58; sx += 8) {
      dot(g, sx, 34, 3.2, (sx / 8) % 2 ? stripe : cloth);
    }
    dot(g, 30 + tilt, 6, 2.4, shade(cloth, -0.25));
  }, 64, 96);

  // The delivery scooter, loaded well past argument.
  make('scooter', 1, (g) => {
    softShadow(g, 32, 90, 26, 6, 0.2);
    // Wheels.
    for (const wx of [14, 50]) {
      dot(g, wx, 84, 7.5, '#2a2622');
      dot(g, wx, 84, 3, '#8c8479');
    }
    // Step-through body, nose left.
    g.fillStyle = '#b03a3a';
    g.beginPath();
    g.moveTo(8, 62);
    g.quadraticCurveTo(6, 76, 14, 78);
    g.lineTo(46, 78);
    g.quadraticCurveTo(56, 76, 54, 66);
    g.lineTo(42, 66);
    g.quadraticCurveTo(30, 72, 20, 64);
    g.closePath();
    g.fill();
    oval(g, 12, 66, 4, 8, '#b03a3a');
    // Handlebar and mirror.
    g.strokeStyle = '#3c3226';
    g.lineWidth = 3;
    g.beginPath();
    g.moveTo(11, 64);
    g.lineTo(8, 52);
    g.stroke();
    dot(g, 7, 49, 2.6, '#8fc3d4');
    // Seat.
    rr(g, 34, 60, 16, 6, 3, '#2a2622');
    // The improbable cargo: strapped styrofoam to the sky.
    let y = 56;
    for (let i = 0; i < 4; i++) {
      const w = 26 - i * 2;
      rr(g, 46 - w, y - 12, w, 12, 2, i % 2 ? '#e0e6ea' : '#eef2f4');
      rect(g, 44, y - 11, 2, 10, 'rgba(90,105,120,0.2)');
      y -= 13;
    }
    rr(g, 20, y - 8, 22, 9, 2, '#c9a35f'); // one crate of something else on top
    // Bungee cords, doing their best.
    g.strokeStyle = 'rgba(45,60,80,0.75)';
    g.lineWidth = 1.6;
    g.beginPath();
    g.moveTo(22, 66);
    g.lineTo(40, y - 8);
    g.moveTo(50, 66);
    g.lineTo(28, y - 8);
    g.stroke();
  }, 64, 96);

  // Lotus lanterns strung pole to pole; hope keeps well.
  make('lotusline', 2, (g, r) => {
    softShadow(g, 32, 90, 18, 5, 0.1);
    for (const px of [6, 58]) {
      rr(g, px - 1.1, 18, 2.2, 72, 1.1, '#6e5f4c');
      dot(g, px, 18, 1.6, '#5a4a3a');
    }
    g.strokeStyle = 'rgba(70,55,38,0.75)';
    g.lineWidth = 1.3;
    g.beginPath();
    g.moveTo(6, 21);
    g.quadraticCurveTo(32, 30, 58, 21);
    g.stroke();
    const colors = ['#e88aa0', '#f2e6c8', '#e8c95f', '#8fc3d4'];
    for (let i = 0; i < 4; i++) {
      const lx = 13 + i * 12.5 + (r.next() - 0.5) * 2;
      const ly = 25 + Math.sin(((lx - 6) / 52) * Math.PI) * 4.5;
      const c = colors[(i + r.int(2)) % colors.length] ?? '#e88aa0';
      g.strokeStyle = 'rgba(70,55,38,0.6)';
      g.beginPath();
      g.moveTo(lx, ly);
      g.lineTo(lx, ly + 4);
      g.stroke();
      glowSpot(g, lx, ly + 11, 10, '#ffd9a0', 0.35);
      // Lantern body with petal skirts.
      oval(g, lx, ly + 11, 6, 7, c);
      oval(g, lx - 2, ly + 8, 2.2, 3, 'rgba(255,250,240,0.45)');
      g.fillStyle = shade(c, -0.16);
      for (const k of [-1, 0, 1]) {
        g.beginPath();
        g.moveTo(lx + k * 4 - 2, ly + 16);
        g.quadraticCurveTo(lx + k * 4, ly + 21, lx + k * 4 + 2, ly + 16);
        g.closePath();
        g.fill();
      }
      // Paper tail.
      rect(g, lx - 0.8, ly + 18, 1.6, 6 + r.int(3), 'rgba(242,230,200,0.8)');
    }
  }, 64, 96);

  // The magpie on its wire: black, white, and certain. Good news, eventually.
  make('magpie', 1, (g) => {
    softShadow(g, 40, 90, 14, 4, 0.14);
    // Pole, crossarm, wires off both sides.
    rr(g, 38, 20, 4.5, 70, 2, '#5a4a3a');
    rr(g, 24, 24, 33, 3.4, 1.5, '#5a4a3a');
    g.strokeStyle = 'rgba(40,38,44,0.55)';
    g.lineWidth = 1.3;
    g.beginPath();
    g.moveTo(0, 20);
    g.quadraticCurveTo(26, 28, 26, 26);
    g.moveTo(56, 26);
    g.quadraticCurveTo(60, 27, 64, 24);
    g.stroke();
    // The magpie, perched at the crossarm's end.
    const bx = 27;
    const by = 20;
    g.strokeStyle = '#2a2622';
    g.lineWidth = 1.4;
    g.beginPath();
    g.moveTo(bx - 1, by + 3);
    g.lineTo(bx - 1, by + 6);
    g.moveTo(bx + 2, by + 3);
    g.lineTo(bx + 2, by + 6);
    g.stroke();
    // Long tail, angled up.
    g.fillStyle = '#232830';
    g.beginPath();
    g.moveTo(bx + 3, by);
    g.lineTo(bx + 16, by - 8);
    g.lineTo(bx + 15, by - 5);
    g.lineTo(bx + 4, by + 3);
    g.closePath();
    g.fill();
    oval(g, bx, by - 1, 6.5, 4.5, '#232830'); // back
    oval(g, bx - 1, by + 1, 4.5, 3.2, '#eef0f2'); // belly
    oval(g, bx + 1.5, by - 2, 2.2, 1.4, '#eef0f2', -0.4); // wing patch
    dot(g, bx - 6, by - 3, 3.2, '#232830'); // head
    g.fillStyle = '#3c3226';
    g.beginPath();
    g.moveTo(bx - 9, by - 3);
    g.lineTo(bx - 13, by - 2);
    g.lineTo(bx - 9, by - 1.6);
    g.closePath();
    g.fill();
    dot(g, bx - 6.5, by - 4, 0.7, '#f2e6d0');
  }, 64, 96);

  // The wall of hand-written price signs, an archaeology of mackerel.
  make('pricewall', 1, (g, r) => {
    softShadow(g, 32, 90, 24, 6, 0.18);
    // Board wall on two feet.
    rr(g, 8, 24, 48, 62, 3, '#6e5f4c');
    vgrad(g, 8, 24, 48, 8, 'rgba(255,240,215,0.18)', 'rgba(0,0,0,0)');
    g.strokeStyle = 'rgba(50,42,32,0.35)';
    g.lineWidth = 1.4;
    for (const by of [40, 56, 72]) {
      g.beginPath();
      g.moveTo(9, by);
      g.lineTo(55, by);
      g.stroke();
    }
    // Signs, taped over signs, over signs.
    const papers: [number, number, number, number, string][] = [
      [12, 28, 18, 13, '#e8dcc0'],
      [33, 30, 19, 12, '#f2ecd9'],
      [15, 44, 22, 14, '#e8d9a8'],
      [38, 46, 15, 12, '#f2ecd9'],
      [11, 61, 16, 12, '#f2ecd9'],
      [30, 60, 21, 14, '#dfe4e6'],
      [20, 74, 18, 10, '#e8dcc0'],
    ];
    for (const [px, py, pw, ph, pc] of papers) {
      const rot = (r.next() - 0.5) * 0.12;
      g.save();
      g.translate(px + pw / 2, py + ph / 2);
      g.rotate(rot);
      rr(g, -pw / 2, -ph / 2, pw, ph, 1, pc);
      // Brush strokes: a name and a number, in confident abstraction.
      g.strokeStyle = r.chance(0.4) ? '#b03024' : '#2c2c34';
      g.lineWidth = 1.8;
      g.beginPath();
      g.moveTo(-pw * 0.32, -ph * 0.15);
      g.lineTo(pw * 0.1, -ph * 0.18);
      g.moveTo(-pw * 0.3, ph * 0.15);
      g.lineTo(pw * 0.3, ph * 0.12);
      g.stroke();
      if (r.chance(0.5)) {
        g.beginPath();
        g.arc(pw * 0.26, -ph * 0.12, 2.6, 0, Math.PI * 2);
        g.stroke();
      }
      // Tape.
      rect(g, -pw / 2 - 2, -ph / 2 - 1, 6, 3, 'rgba(240,238,225,0.7)');
      rect(g, pw / 2 - 4, ph / 2 - 2, 6, 3, 'rgba(240,238,225,0.7)');
      g.restore();
    }
  }, 64, 96);

  // The lane-washing hose, coiled by its drain between shifts.
  make('hosecoil', 2, (g, r) => {
    // The drain it reports to.
    rr(g, 40, 44, 14, 9, 2, '#4a4e54');
    g.strokeStyle = 'rgba(25,28,32,0.7)';
    g.lineWidth = 1.6;
    for (let k = 0; k < 3; k++) {
      g.beginPath();
      g.moveTo(42, 46.5 + k * 2.4);
      g.lineTo(52, 46.5 + k * 2.4);
      g.stroke();
    }
    oval(g, 36, 54, 10, 3, 'rgba(180,205,215,0.2)');
    // The coil.
    const green = shade('#4d7440', (r.next() - 0.5) * 0.06);
    g.lineWidth = 4;
    g.lineCap = 'round';
    for (let i = 3; i >= 0; i--) {
      g.strokeStyle = i % 2 ? green : shade(green, -0.14);
      g.beginPath();
      g.ellipse(24, 40, 6 + i * 3.4, 4 + i * 2.4, 0, 0, Math.PI * 2);
      g.stroke();
    }
    // The nozzle end, escaping.
    g.strokeStyle = green;
    g.beginPath();
    g.moveTo(36, 44);
    g.quadraticCurveTo(46, 40, 50, 36);
    g.stroke();
    rr(g, 49, 32, 5, 6, 1.5, '#c9c4bb');
    dot(g, 30, 32, 1.2, 'rgba(210,230,240,0.6)');
  });

  // Rubber boots drying upside down on the fence: the day shift, off duty.
  make('bootfence', 2, (g, r) => {
    softShadow(g, 32, 90, 24, 5, 0.16);
    // Rails and posts.
    for (const by of [52, 68]) rr(g, 4, by, 56, 3.4, 1.5, '#6e5b44');
    for (const px of [10, 30, 50]) rr(g, px - 2, 34, 4, 54, 2, '#5c4a36');
    // Boots, heels to heaven.
    const boots: [number, number, string][] = [
      [10, 0.9, '#2e3438'],
      [30, 1, r.chance(0.5) ? '#dfe4e6' : '#2e3438'],
      [50, 0.85, '#7a3830'],
    ];
    for (const [bx, s, c] of boots) {
      // Shaft over the post, sole up.
      rr(g, bx - 5 * s, 22, 10 * s, 20 * s, 3, c);
      // The foot, kicked sideways at the top.
      rr(g, bx - 5 * s, 16, 15 * s, 9 * s, 4, c);
      oval(g, bx + 6 * s, 17, 5 * s, 2.4, shade(c, -0.25));
      oval(g, bx - 2 * s, 24, 2 * s, 6 * s, 'rgba(255,250,240,0.18)');
    }
  }, 64, 96);

  // The tteok shop's steamers, stacked and breathing sweet rice.
  make('steamerstack', 1, (g) => {
    softShadow(g, 32, 90, 22, 6, 0.18);
    // The little stand.
    rr(g, 14, 76, 36, 10, 2, '#5c4630');
    for (const lx of [17, 43]) rr(g, lx, 84, 4, 6, 1.5, '#4a3826');
    // Four steamers, each a wooden ring.
    let y = 72;
    for (let i = 0; i < 4; i++) {
      const off = (i % 2) * 2 - 1;
      rr(g, 15 + off, y - 12, 34, 13, 4, '#a87e4e');
      oval(g, 32 + off, y - 12, 17, 4, '#8a6a44');
      g.strokeStyle = 'rgba(80,58,34,0.5)';
      g.lineWidth = 1.4;
      g.beginPath();
      g.moveTo(16 + off, y - 5);
      g.lineTo(48 + off, y - 5);
      g.stroke();
      oval(g, 24 + off, y - 9, 4, 1.6, 'rgba(255,240,210,0.28)');
      y -= 13;
    }
    // Cloth puffing out under the lid, and steam.
    oval(g, 32, y - 1, 15, 4, '#eee6d4');
    oval(g, 32, y - 4, 16, 4, '#a87e4e');
    oval(g, 28, y - 12, 5, 4, 'rgba(240,244,246,0.3)');
    oval(g, 36, y - 20, 6, 5, 'rgba(240,244,246,0.2)');
  }, 64, 96);

  // The hill-stairs handrail, with the stool that admits defeat halfway up.
  make('handrail', 1, (g) => {
    softShadow(g, 32, 90, 22, 5, 0.14);
    // Suggested steps, climbing right to left.
    g.strokeStyle = 'rgba(120,118,124,0.5)';
    g.lineWidth = 2.4;
    for (let k = 0; k < 4; k++) {
      g.beginPath();
      g.moveTo(10 + k * 12, 84 - k * 7);
      g.lineTo(30 + k * 12, 84 - k * 7);
      g.stroke();
    }
    // The rail: green pipe, two posts, one long diagonal.
    const green = '#3f7440';
    g.strokeStyle = green;
    g.lineWidth = 4;
    g.lineCap = 'round';
    g.beginPath();
    g.moveTo(8, 62);
    g.lineTo(58, 34);
    g.stroke();
    g.lineWidth = 3.4;
    g.beginPath();
    g.moveTo(12, 60);
    g.lineTo(12, 84);
    g.moveTo(52, 38);
    g.lineTo(52, 62);
    g.stroke();
    oval(g, 30, 48, 8, 2, 'rgba(255,250,235,0.25)', -0.5);
    // The stool, parked exactly halfway.
    rr(g, 26, 66, 13, 5.5, 2.5, '#d9694a');
    for (const lx of [28, 35]) rr(g, lx, 71, 2.6, 8, 1.3, shade('#d9694a', -0.2));
  }, 64, 96);

  // The market cat, asleep on a styrofoam lid it has requisitioned.
  make('marketcat', 1, (g) => {
    softShadow(g, 32, 54, 20, 6, 0.16);
    // The lid.
    rr(g, 10, 40, 44, 13, 3, '#e8edf0');
    rect(g, 48, 42, 6, 10, 'rgba(90,105,120,0.16)');
    // The cat: a ginger comma, unmistakably in charge of nothing.
    const fur = '#c9803e';
    oval(g, 30, 33, 15, 10, fur);
    oval(g, 26, 29, 7, 4.5, 'rgba(255,235,200,0.4)');
    // Tabby stripes, bold.
    g.strokeStyle = 'rgba(140,70,26,0.8)';
    g.lineWidth = 2.2;
    for (const k of [-7, -2, 3, 8]) {
      g.beginPath();
      g.moveTo(30 + k, 24.5 + Math.abs(k) * 0.2);
      g.quadraticCurveTo(31 + k, 31, 30 + k * 0.7, 40);
      g.stroke();
    }
    // Head resting on paws, ears up anyway.
    dot(g, 42, 33, 6.5, fur);
    g.fillStyle = fur;
    for (const ex of [38.5, 45.5]) {
      g.beginPath();
      g.moveTo(ex - 2.4, 28.5);
      g.lineTo(ex, 23.5);
      g.lineTo(ex + 2.4, 28.5);
      g.closePath();
      g.fill();
    }
    dot(g, 39, 25.5, 1, '#e8a06a');
    oval(g, 43, 35.5, 3.4, 2.6, '#e8c9a0'); // muzzle
    g.strokeStyle = 'rgba(90,50,20,0.85)';
    g.lineWidth = 1.2;
    g.beginPath();
    g.moveTo(39.5, 32.5);
    g.lineTo(42, 33);
    g.moveTo(44.5, 33);
    g.lineTo(47, 32.5);
    g.stroke(); // both eyes, firmly shut
    // Tail wrapped around the front.
    g.strokeStyle = '#b06e30';
    g.lineWidth = 4.5;
    g.lineCap = 'round';
    g.beginPath();
    g.moveTo(17, 34);
    g.quadraticCurveTo(26, 43, 40, 40);
    g.stroke();
    dot(g, 40, 40, 2.6, '#8c4e1c'); // the dark tip
  });

  // A mooring bollard, currently administered by a gull.
  make('gullpost', 1, (g) => {
    softShadow(g, 32, 58, 17, 5, 0.2);
    // The bollard: black iron, mushroom-capped, harbor classic.
    rr(g, 26, 34, 12, 24, 3, '#2e3238');
    rect(g, 34, 36, 4, 20, 'rgba(0,0,0,0.25)');
    rr(g, 22, 30, 20, 7, 3.5, '#3a3e46');
    oval(g, 32, 30, 10, 3.4, '#4a4e56');
    oval(g, 28, 29.5, 3.4, 1.3, 'rgba(220,230,240,0.35)');
    // Rope hitched below the cap, running off to the water.
    g.strokeStyle = '#a89468';
    g.lineWidth = 3.2;
    g.beginPath();
    g.moveTo(24, 40);
    g.quadraticCurveTo(32, 43, 40, 40);
    g.stroke();
    g.beginPath();
    g.moveTo(40, 41);
    g.quadraticCurveTo(52, 46, 63, 44);
    g.stroke();
    // The gull, in charge, facing the weather.
    oval(g, 33, 21, 7.5, 5.5, '#eef0f2');
    oval(g, 35, 19.5, 5.5, 3.2, '#b9c4c9');
    g.fillStyle = '#4a4e56';
    g.beginPath();
    g.moveTo(39, 22);
    g.lineTo(44, 19);
    g.lineTo(40, 24);
    g.closePath();
    g.fill(); // folded wingtip
    dot(g, 25.5, 17, 4, '#eef0f2');
    g.fillStyle = '#d9a441';
    g.beginPath();
    g.moveTo(22, 16.5);
    g.lineTo(17.5, 17.8);
    g.lineTo(22, 18.6);
    g.closePath();
    g.fill();
    dot(g, 24.6, 15.8, 0.9, '#2b2118');
    g.strokeStyle = '#d9a441';
    g.lineWidth = 1.8;
    g.beginPath();
    g.moveTo(31, 26.5);
    g.lineTo(31, 30);
    g.moveTo(35, 26.5);
    g.lineTo(35, 30);
    g.stroke();
  });

  // ------------------------------------------------------------ tea house props

  // Shoes at the step, toes out the door, ready before their owners.
  make('shoerow', 1, (g) => {
    const shoe = (x: number, y: number, c: string, s: number, rot: number) => {
      oval(g, x, y, 6.5 * s, 3.2 * s, c, rot);
      oval(g, x + 2 * s, y - 1.2, 3.4 * s, 2 * s, shade(c, 0.18), rot);
    };
    // A grown pair, a work pair, and one small pair outgrowing itself.
    shoe(18, 26, '#dfe4e6', 1, 0.12);
    shoe(18, 34, '#dfe4e6', 1, 0.05);
    shoe(34, 27, '#2e3438', 1.05, -0.06);
    shoe(34, 35, '#2e3438', 1.05, 0.02);
    shoe(48, 28, '#b03a3a', 0.7, 0.3);
    shoe(47, 34, '#b03a3a', 0.7, -0.2);
  });

  // A baduk board mid-game, abandoned with honor.
  make('goboard', 1, (g) => {
    softShadow(g, 32, 52, 18, 5, 0.14);
    rr(g, 14, 22, 36, 30, 2, '#c9a25e');
    vgrad(g, 14, 22, 36, 6, 'rgba(255,240,210,0.3)', 'rgba(0,0,0,0)');
    g.strokeStyle = 'rgba(90,64,30,0.55)';
    g.lineWidth = 1;
    for (let k = 0; k < 6; k++) {
      g.beginPath();
      g.moveTo(17, 25 + k * 4.8);
      g.lineTo(47, 25 + k * 4.8);
      g.moveTo(17 + k * 6, 25);
      g.lineTo(17 + k * 6, 49);
      g.stroke();
    }
    // The position: black struggling politely.
    const stones: [number, number, boolean][] = [
      [23, 30, true], [29, 30, false], [29, 35, true], [35, 35, false],
      [35, 30, false], [23, 40, true], [41, 40, false], [29, 44, true],
    ];
    for (const [sx, sy, black] of stones) {
      dot(g, sx, sy, 2.1, black ? '#26282e' : '#eef0f2');
      if (!black) dot(g, sx - 0.6, sy - 0.6, 0.7, '#ffffff');
    }
    // The stone bowls, lids ajar.
    dot(g, 8, 44, 5, '#5a4632');
    oval(g, 8, 42.5, 4, 1.8, '#3c3226');
    dot(g, 56, 32, 5, '#5a4632');
    oval(g, 56, 30.5, 4, 1.8, '#3c3226');
  });

  // Yeontan briquettes: the quiet engine under the warm floor.
  make('yeontan', 1, (g) => {
    softShadow(g, 32, 54, 18, 5, 0.16);
    const briq = (cx: number, base: number) => {
      rect(g, cx - 9, base - 16, 18, 16, '#6a6d72');
      rect(g, cx + 5, base - 16, 4, 16, 'rgba(30,32,38,0.25)');
      oval(g, cx, base - 16, 9, 3.6, '#7c7f85');
      // The ring of air holes.
      for (let k = 0; k < 6; k++) {
        const a = (k / 6) * Math.PI * 2;
        dot(g, cx + Math.cos(a) * 5, base - 16 + Math.sin(a) * 2, 1, '#2e3034');
      }
      dot(g, cx, base - 16, 1, '#2e3034');
    };
    briq(22, 52);
    briq(42, 52);
    briq(32, 36);
    // The tongs, waiting.
    g.strokeStyle = '#8c8479';
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(52, 24);
    g.lineTo(56, 48);
    g.moveTo(53, 24);
    g.lineTo(50, 34);
    g.stroke();
  });

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
    'hongawning',
    'barrow',
    'fishrack',
    'eomukcart',
    'hotteokcart',
    'hillhouses',
    'crane',
    'postwindow',
    'hanjilamp',
    'ferrysign',
    'basinstack',
    'squidline',
    'onggi',
    'parasol',
    'scooter',
    'lotusline',
    'magpie',
    'pricewall',
    'bootfence',
    'steamerstack',
    'handrail',
  ],
  buildings: ['teahouse'],
  windows: {
    teahouse: [
      [15, -10],
      [67, -10],
    ],
  },
  glows: ['eomukcart', 'hotteokcart', 'hanjilamp', 'lotusline', 'hongawning'],
  pathy: ['lanepave'],
  noInk: ['chilimat', 'hosecoil', 'shoerow'],
};
