import type { ChapterArt, MakeTile } from './index';
import { dot, oval, rect, rr, shade, softShadow, vgrad } from '../pix';
import { PAL } from '../../engine/config';

/**
 * Chapter Three's tile kit: the working deck of a mid-size container ship.
 * Steel greens, container primaries gone chalky with salt, one buff funnel.
 * Painted in the smooth-art idiom: flat ground bases, soft volumes, no lines
 * where a value shift will do.
 */

const S = 64;

const DECK = '#63726a'; // deck green, many coats deep
const STEEL = '#e3ded0'; // superstructure white, sun-warmed
const BUFF = '#d2a548'; // funnel buff
const NAVY = '#2c3e57';

function paint(make: MakeTile) {
  // ------------------------------------------------------------ grounds

  make('deck', 5, (g, r) => {
    rect(g, 0, 0, S, S, DECK);
    // Nonskid grit, sparse.
    for (let i = 0; i < 6; i++) {
      dot(g, r.int(S), r.int(S), 1.2 + r.next(), shade(DECK, r.chance(0.5) ? -0.07 : 0.08));
    }
    // A plate seam with its dotted weld, sometimes.
    if (r.chance(0.5)) {
      const yy = 8 + r.int(S - 16);
      g.strokeStyle = 'rgba(30,40,36,0.22)';
      g.lineWidth = 1.6;
      g.beginPath();
      g.moveTo(0, yy);
      g.lineTo(S, yy);
      g.stroke();
      for (let x = 4; x < S; x += 9) dot(g, x, yy, 0.9, 'rgba(220,225,215,0.18)');
    }
    // A rust bloom the crew has not caught yet.
    if (r.chance(0.22)) oval(g, r.int(S), r.int(S), 3.5, 2.2, 'rgba(138,84,48,0.25)');
  });

  make('floorSteel', 4, (g, r) => {
    rect(g, 0, 0, S, S, '#7e8178');
    for (let i = 0; i < 4; i++) {
      oval(g, r.int(S), r.int(S), 4, 2, shade('#7e8178', r.chance(0.5) ? -0.06 : 0.07));
    }
    // The worn path from stove to table, polished a shade lighter.
    if (r.chance(0.4)) oval(g, S / 2 + r.int(16) - 8, S / 2, 14, 6, 'rgba(230,228,216,0.08)');
  });

  // ------------------------------------------------------------ interior

  make('wallSteel', 5, (g, r) => {
    const base = STEEL;
    vgrad(g, 0, 0, S, S, shade(base, -0.06), shade(base, 0.04));
    vgrad(g, 0, 0, S, 14, 'rgba(60,60,50,0.25)', 'rgba(0,0,0,0)');
    // Riveted seam.
    g.strokeStyle = 'rgba(90,95,90,0.35)';
    g.lineWidth = 1.6;
    g.beginPath();
    g.moveTo(0, 50);
    g.lineTo(S, 50);
    g.stroke();
    for (let x = 6; x < S; x += 12) dot(g, x, 50, 1.2, 'rgba(70,75,72,0.4)');
    const deco = r.int(4);
    if (deco === 0) {
      // A brass-rimmed porthole, sea beyond.
      dot(g, 32, 28, 13, '#a08a4a');
      dot(g, 32, 28, 10, '#274b66');
      oval(g, 32, 24, 8, 4, 'rgba(190,220,240,0.35)');
      dot(g, 41, 20, 1.6, '#c9b46a');
      dot(g, 23, 36, 1.6, '#c9b46a');
    } else if (deco === 1) {
      // A pipe run with a valve wheel.
      rr(g, 0, 18, S, 7, 3, '#b8b2a2');
      vgrad(g, 0, 18, S, 3, 'rgba(255,255,245,0.4)', 'rgba(0,0,0,0)');
      dot(g, 40, 21, 6, '#8a4030');
      dot(g, 40, 21, 2.2, '#5c2a1e');
    } else if (deco === 2) {
      // The crew noticeboard: menu, watch bill, one postcard.
      rr(g, 14, 18, 36, 26, 3, '#7a5636');
      rr(g, 17, 21, 12, 9, 1, '#f2ead8');
      rr(g, 32, 22, 14, 10, 1, '#e8dcc4');
      rr(g, 19, 33, 13, 8, 1, '#c98a7a');
    }
  });

  make('stove', 1, (g) => {
    // The galley range: gimballed, railed, permanently on duty.
    softShadow(g, 32, 58, 24, 6, 0.2);
    rr(g, 8, 26, 48, 32, 3, '#4c4f4c');
    vgrad(g, 8, 26, 48, 8, 'rgba(255,255,245,0.16)', 'rgba(0,0,0,0)');
    rr(g, 14, 40, 20, 14, 2, '#3a3d3a'); // oven door
    rr(g, 16, 45, 16, 2.4, 1, '#c9c4b4');
    dot(g, 44, 46, 3.4, '#c94a2e'); // the one knob that matters
    // Stovetop with fiddle rails and the eternal stockpot.
    rr(g, 6, 20, 52, 8, 3, '#6a6e6a');
    oval(g, 26, 20, 11, 4.4, '#8a8e8a');
    rr(g, 17, 8, 18, 13, 3, '#b8b2a2');
    oval(g, 26, 8, 9, 3.2, '#8a8478');
    oval(g, 26, 7, 6, 2, 'rgba(240,240,230,0.5)'); // steam sheen
    g.strokeStyle = '#3a3d3a';
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(6, 18);
    g.lineTo(58, 18);
    g.stroke();
  });

  make('trayrack', 1, (g) => {
    softShadow(g, 32, 54, 20, 5, 0.16);
    rr(g, 12, 14, 40, 40, 3, '#8a8478');
    for (const ry of [22, 32, 42]) {
      rect(g, 15, ry, 34, 3, '#5c5f58');
      // Tray edges peeking out.
      rr(g, 17, ry - 4, 12, 4, 1, '#c9a35f');
      rr(g, 32, ry - 4, 12, 4, 1, '#b8b2a2');
    }
    rr(g, 12, 10, 40, 6, 2, '#6a6e6a');
  });

  make('karaoke', 1, (g) => {
    // The most important machine aboard, after the engine. Debatably.
    softShadow(g, 32, 90, 20, 5, 0.2);
    rr(g, 14, 30, 36, 58, 4, '#3a3548');
    vgrad(g, 14, 30, 36, 10, 'rgba(255,255,255,0.14)', 'rgba(0,0,0,0)');
    // Screen, mid-ballad blue.
    rr(g, 18, 34, 28, 18, 2, '#141c30');
    rr(g, 20, 36, 24, 14, 1.6, '#2c5c8f');
    rect(g, 22, 46, 18, 2.2, 'rgba(240,245,255,0.7)'); // the lyric line
    // Speaker grille.
    for (let yy = 58; yy <= 78; yy += 5) {
      rect(g, 19, yy, 26, 2, 'rgba(20,16,26,0.6)');
    }
    dot(g, 24, 56, 1.8, '#c94a2e');
    dot(g, 40, 56, 1.8, '#4d7440');
    // The microphone, resting until called to duty.
    g.strokeStyle = '#2b2118';
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(48, 34);
    g.quadraticCurveTo(56, 40, 52, 50);
    g.stroke();
    dot(g, 48, 32, 4, '#8a8478');
    dot(g, 47, 31, 1.4, 'rgba(255,255,255,0.5)');
  });

  // ------------------------------------------------------------ deck kit

  make('railing', 2, (g, r) => {
    // White rails on stanchions; la mar beyond them, minding everything.
    const white = '#e9e7dd';
    for (const x of [10, 32, 54]) {
      rect(g, x - 1.5, 16, 3, 38, shade(white, -0.12));
      rect(g, x - 1.5, 16, 1.4, 38, white);
      rr(g, x - 4, 52, 8, 4, 1.5, shade(white, -0.2)); // base plate
    }
    for (const ry of [16, 28, 40]) {
      rect(g, 0, ry - 1.6, S, 3.2, shade(white, -0.08));
      rect(g, 0, ry - 1.6, S, 1.4, white);
    }
    if (r.chance(0.3)) oval(g, 6 + r.int(50), 15, 3, 1.6, 'rgba(138,84,48,0.4)'); // rust kiss
  });

  const container = (color: string) => (g: CanvasRenderingContext2D) => {
    softShadow(g, 32, 90, 30, 6, 0.24);
    // Two boxes high; a stack in one tile, a run in one row.
    for (const [top, hgt] of [
      [48, 40],
      [8, 40],
    ] as const) {
      const grad = g.createLinearGradient(0, top, 0, top + hgt);
      grad.addColorStop(0, shade(color, 0.1));
      grad.addColorStop(1, shade(color, -0.1));
      g.fillStyle = grad;
      g.fillRect(0, top, S, hgt);
      // Corrugation.
      for (let x = 4; x < S; x += 8) {
        rect(g, x, top + 2, 3, hgt - 4, shade(color, -0.08));
        rect(g, x + 3, top + 2, 1.4, hgt - 4, shade(color, 0.07));
      }
      // Top rail and corner castings.
      rect(g, 0, top, S, 3, shade(color, 0.16));
      rect(g, 0, top + hgt - 3, S, 3, shade(color, -0.22));
      for (const cx of [2, S - 6]) {
        rect(g, cx, top + 1, 4, 6, shade(color, -0.3));
        rect(g, cx, top + hgt - 7, 4, 6, shade(color, -0.3));
      }
    }
    // Salt streaks down the face.
    vgrad(g, 10, 8, 6, 40, 'rgba(240,238,228,0.16)', 'rgba(0,0,0,0)');
    vgrad(g, 44, 48, 8, 34, 'rgba(240,238,228,0.12)', 'rgba(0,0,0,0)');
    // A lashing rod crossing the lower box.
    g.strokeStyle = 'rgba(210,210,200,0.55)';
    g.lineWidth = 1.8;
    g.beginPath();
    g.moveTo(2, 86);
    g.lineTo(50, 52);
    g.stroke();
  };

  make('contA', 1, container('#9d4530'), S, 96);
  make('contB', 1, container('#31618f'), S, 96);
  make('contC', 1, container('#3f7050'), S, 96);

  make('winch', 1, (g) => {
    softShadow(g, 32, 54, 24, 6, 0.2);
    rr(g, 8, 42, 48, 12, 3, '#4c4f4c'); // bedplate
    // The drum, wound with wire.
    oval(g, 20, 32, 8, 12, '#5c5f58');
    oval(g, 44, 32, 8, 12, '#5c5f58');
    rect(g, 20, 20, 24, 24, '#6a6e6a');
    for (let yy = 23; yy <= 41; yy += 3.2) {
      rect(g, 20, yy, 24, 1.6, 'rgba(35,38,35,0.5)');
    }
    vgrad(g, 20, 20, 24, 8, 'rgba(255,255,245,0.2)', 'rgba(0,0,0,0)');
    dot(g, 20, 32, 3.4, '#8a4030'); // painted hub
    dot(g, 44, 32, 3.4, '#8a4030');
  });

  make('bollard', 1, (g) => {
    softShadow(g, 32, 52, 20, 5, 0.2);
    rr(g, 10, 42, 44, 10, 3, '#3c3f3c');
    for (const bx of [22, 42]) {
      rect(g, bx - 6, 22, 12, 24, '#2e3130');
      oval(g, bx, 22, 7, 4, '#4c4f4c');
      oval(g, bx, 21, 5, 2.6, 'rgba(220,225,215,0.25)');
      // Hawser-polished waist.
      rect(g, bx - 6, 32, 12, 5, 'rgba(200,195,175,0.28)');
    }
    // A lazy figure eight of rope.
    g.strokeStyle = '#c9b48a';
    g.lineWidth = 3;
    g.beginPath();
    g.moveTo(14, 40);
    g.quadraticCurveTo(22, 34, 32, 39);
    g.quadraticCurveTo(42, 44, 50, 39);
    g.stroke();
  });

  make('lifeboat', 1, (g) => {
    // Orange, enclosed, hoping to stay decorative. Hung in its davit.
    softShadow(g, 32, 90, 22, 5, 0.18);
    g.strokeStyle = '#b8b2a2';
    g.lineWidth = 4;
    g.beginPath();
    g.moveTo(12, 88);
    g.lineTo(12, 16);
    g.quadraticCurveTo(12, 6, 24, 6);
    g.lineTo(46, 6);
    g.stroke();
    g.strokeStyle = 'rgba(60,60,55,0.6)';
    g.lineWidth = 1.6;
    g.beginPath();
    g.moveTo(24, 8);
    g.lineTo(24, 22);
    g.moveTo(44, 8);
    g.lineTo(44, 22);
    g.stroke();
    // The boat itself.
    const orange = '#d96b2e';
    g.beginPath();
    g.moveTo(8, 34);
    g.quadraticCurveTo(32, 24, 56, 34);
    g.quadraticCurveTo(56, 52, 32, 56);
    g.quadraticCurveTo(8, 52, 8, 34);
    g.closePath();
    const grad = g.createLinearGradient(0, 24, 0, 56);
    grad.addColorStop(0, shade(orange, 0.14));
    grad.addColorStop(1, shade(orange, -0.14));
    g.fillStyle = grad;
    g.fill();
    // Canopy hatch and window strip.
    rr(g, 16, 30, 32, 6, 3, shade(orange, 0.22));
    rect(g, 18, 38, 28, 4, 'rgba(30,45,60,0.7)');
    oval(g, 32, 27, 6, 3, shade(orange, 0.3));
  }, S, 96);

  make('funnel', 1, (g) => {
    softShadow(g, 32, 90, 20, 5, 0.24);
    // The casing, buff with a navy band and a soot-dark lip.
    const grad = g.createLinearGradient(14, 0, 50, 0);
    grad.addColorStop(0, shade(BUFF, 0.12));
    grad.addColorStop(0.55, BUFF);
    grad.addColorStop(1, shade(BUFF, -0.16));
    g.fillStyle = grad;
    g.beginPath();
    g.moveTo(14, 88);
    g.lineTo(18, 10);
    g.lineTo(46, 10);
    g.lineTo(50, 88);
    g.closePath();
    g.fill();
    rect(g, 17, 22, 30, 12, NAVY);
    rect(g, 17, 22, 30, 3, shade(NAVY, 0.18));
    // One white star on the band; the line's whole mythology.
    dot(g, 32, 28, 3, '#f2ead8');
    oval(g, 32, 10, 14, 4, '#3a3530');
    oval(g, 32, 9, 10, 2.4, '#241f1a');
    // Ladder rungs up the side.
    g.strokeStyle = 'rgba(120,95,45,0.5)';
    g.lineWidth = 1.6;
    for (let yy = 40; yy <= 80; yy += 7) {
      g.beginPath();
      g.moveTo(44, yy);
      g.lineTo(50, yy);
      g.stroke();
    }
  }, S, 96);

  make('shipbell', 1, (g) => {
    softShadow(g, 32, 90, 16, 4, 0.2);
    // Two posts and a little roof, brass underneath.
    rect(g, 14, 30, 4, 58, '#b8b2a2');
    rect(g, 46, 30, 4, 58, '#b8b2a2');
    rr(g, 8, 20, 48, 10, 4, NAVY);
    vgrad(g, 8, 20, 48, 4, 'rgba(255,255,255,0.2)', 'rgba(0,0,0,0)');
    // The bell.
    const brass = '#c9a83f';
    g.beginPath();
    g.moveTo(24, 36);
    g.quadraticCurveTo(24, 50, 20, 56);
    g.lineTo(44, 56);
    g.quadraticCurveTo(40, 50, 40, 36);
    g.closePath();
    const grad = g.createLinearGradient(20, 0, 44, 0);
    grad.addColorStop(0, shade(brass, 0.2));
    grad.addColorStop(1, shade(brass, -0.18));
    g.fillStyle = grad;
    g.fill();
    oval(g, 32, 36, 8, 3, shade(brass, 0.1));
    oval(g, 32, 57, 12, 3.4, shade(brass, -0.1));
    dot(g, 32, 62, 2.6, shade(brass, -0.3));
    // The lanyard, whipped and waiting.
    g.strokeStyle = '#c9b48a';
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(32, 64);
    g.quadraticCurveTo(34, 74, 30, 82);
    g.stroke();
  }, S, 96);

  make('jackstaff', 1, (g) => {
    softShadow(g, 32, 90, 12, 4, 0.16);
    rect(g, 30, 12, 4, 76, '#e9e7dd');
    rect(g, 30, 12, 1.6, 76, '#ffffff');
    dot(g, 32, 10, 3, '#c9a83f');
    // The ensign: red, white, red, streaming.
    g.beginPath();
    g.moveTo(34, 14);
    g.quadraticCurveTo(52, 16, 58, 22);
    g.quadraticCurveTo(50, 26, 34, 26);
    g.closePath();
    g.fillStyle = '#c1512f';
    g.fill();
    g.beginPath();
    g.moveTo(34, 18);
    g.quadraticCurveTo(48, 19, 54, 21.5);
    g.quadraticCurveTo(48, 23, 34, 23);
    g.closePath();
    g.fillStyle = '#f2ead8';
    g.fill();
    // A cleat with its coiled halyard.
    rect(g, 26, 70, 12, 3, '#b8b2a2');
    oval(g, 32, 78, 6, 3, '#c9b48a');
  }, S, 96);

  make('hammock', 1, (g) => {
    softShadow(g, 32, 90, 22, 5, 0.14);
    // Slung between the stacks: lines run up out of frame.
    g.strokeStyle = '#c9b48a';
    g.lineWidth = 2.2;
    g.beginPath();
    g.moveTo(8, 10);
    g.lineTo(14, 52);
    g.moveTo(56, 10);
    g.lineTo(50, 52);
    g.stroke();
    // The cloth, sagging like a smile.
    g.beginPath();
    g.moveTo(12, 52);
    g.quadraticCurveTo(32, 70, 52, 52);
    g.quadraticCurveTo(32, 62, 12, 52);
    g.closePath();
    g.fillStyle = '#8a4a7d';
    g.fill();
    g.beginPath();
    g.moveTo(12, 52);
    g.quadraticCurveTo(32, 66, 52, 52);
    g.quadraticCurveTo(32, 74, 12, 52);
    g.closePath();
    g.fillStyle = shade('#8a4a7d', -0.14);
    g.fill();
    g.strokeStyle = '#8fcbe8';
    g.lineWidth = 1.8;
    g.beginPath();
    g.moveTo(16, 54);
    g.quadraticCurveTo(32, 66, 48, 54);
    g.stroke();
    // A paperback, spine up, mid-voyage.
    rr(g, 28, 55, 9, 6, 1, '#f2ead8');
    rect(g, 28, 57.4, 9, 1.2, '#c1512f');
  }, S, 96);

  make('shipcat', 1, (g) => {
    // Asleep on a coil of rope, in charge of everything.
    softShadow(g, 32, 52, 18, 5, 0.16);
    for (const [rx, ry, c] of [
      [20, 8, '#b09468'],
      [16, 6.4, '#c9ad7c'],
      [12, 4.8, '#b09468'],
    ] as const) {
      oval(g, 32, 44, rx, ry, c);
    }
    // The cat, one grey comma.
    const fur = '#8a8478';
    oval(g, 32, 36, 12, 8, fur);
    dot(g, 41, 32, 6, fur); // head tucked
    // Ears.
    g.fillStyle = fur;
    g.beginPath();
    g.moveTo(38, 27);
    g.lineTo(40, 23);
    g.lineTo(42, 27);
    g.closePath();
    g.fill();
    g.beginPath();
    g.moveTo(43, 27);
    g.lineTo(46, 24);
    g.lineTo(47, 28);
    g.closePath();
    g.fill();
    // The tail, wrapped round to the nose. Professional.
    g.strokeStyle = shade(fur, -0.12);
    g.lineWidth = 4;
    g.lineCap = 'round';
    g.beginPath();
    g.moveTo(22, 38);
    g.quadraticCurveTo(28, 44, 38, 40);
    g.stroke();
    // One closed eye, perfectly content.
    g.strokeStyle = '#2b2118';
    g.lineWidth = 1.4;
    g.beginPath();
    g.moveTo(42, 31);
    g.quadraticCurveTo(44, 32.4, 46, 31);
    g.stroke();
  });

  // ------------------------------------------------------------ the house

  make('shiphouse', 1, (g) => {
    // 352x256, casa-geometry so the village grid holds: wall 96..252,
    // door at 150..216. White superstructure, bridge glass up top.
    const W = 352;
    const wallTop = 96;
    const wallBot = 252;
    const white = STEEL;

    vgrad(g, 16, wallTop, W - 32, wallBot - wallTop, shade(white, 0.06), shade(white, -0.07));
    // Weeping rust at the deck joins, the honest kind.
    for (const fx of [40, 120, 232, 300]) {
      vgrad(g, fx, wallTop + 26, 6, 40, 'rgba(150,90,50,0.22)', 'rgba(0,0,0,0)');
    }
    // Deck seams: the house is three stories of steel.
    for (const sy of [wallTop + 52, wallTop + 104]) {
      rect(g, 16, sy, W - 32, 3, 'rgba(90,95,90,0.3)');
      vgrad(g, 16, sy + 3, W - 32, 8, 'rgba(255,255,250,0.18)', 'rgba(0,0,0,0)');
    }
    // Base shadow band and side shade.
    vgrad(g, 16, wallBot - 16, W - 32, 16, 'rgba(0,0,0,0)', 'rgba(40,44,40,0.3)');
    g.save();
    g.globalAlpha = 0.14;
    g.fillStyle = '#1c1712';
    g.fillRect(W - 26, wallTop, 10, wallBot - wallTop);
    g.restore();

    // The weathertight door, casa footprint exactly.
    rr(g, 150, wallBot - 96, 66, 96, 6, shade(white, -0.28));
    rr(g, 156, wallBot - 88, 54, 88, 5, '#4a5d63');
    vgrad(g, 156, wallBot - 88, 54, 22, 'rgba(220,240,245,0.16)', 'rgba(0,0,0,0)');
    // Dog handles, six of them; a door you undog, not open.
    g.strokeStyle = 'rgba(25,32,34,0.6)';
    g.lineWidth = 3;
    for (const hy of [wallBot - 70, wallBot - 44, wallBot - 18]) {
      for (const hx of [160, 198]) {
        g.beginPath();
        g.moveTo(hx, hy);
        g.lineTo(hx + 8, hy);
        g.stroke();
      }
    }
    rr(g, 176, wallBot - 56, 14, 14, 2, shade('#4a5d63', 0.2)); // the little porthole
    dot(g, 183, wallBot - 49, 4.6, '#274b66');
    rr(g, 146, wallBot - 102, 74, 10, 5, shade(white, -0.18));

    // Portholes flanking the door where the casa keeps its windows,
    // so the night window-lights land on glass.
    for (const wx of [52, 252]) {
      rr(g, wx, wallTop + 34, 48, 44, 8, shade(white, -0.24));
      rr(g, wx + 4, wallTop + 38, 40, 36, 6, '#2c3e57');
      vgrad(g, wx + 4, wallTop + 38, 40, 14, 'rgba(200,225,240,0.4)', 'rgba(0,0,0,0)');
      g.strokeStyle = shade(white, -0.35);
      g.lineWidth = 3;
      g.beginPath();
      g.moveTo(wx + 24, wallTop + 38);
      g.lineTo(wx + 24, wallTop + 74);
      g.stroke();
      rr(g, wx - 3, wallTop + 78, 54, 8, 4, shade(white, 0.1));
      // A life ring beside each window.
      const lx = wx < 100 ? wx + 74 : wx - 26;
      dot(g, lx, wallTop + 56, 12, '#d96b2e');
      dot(g, lx, wallTop + 56, 6.4, shade(white, 0.06));
      for (const a of [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2]) {
        dot(g, lx + Math.cos(a) * 9.4, wallTop + 56 + Math.sin(a) * 9.4, 2.2, '#f2ead8');
      }
    }

    // The bridge deck: a band of glass over everything, watching forward.
    rr(g, 10, wallTop - 18, W - 20, 26, 6, shade(white, -0.1));
    vgrad(g, 10, wallTop - 18, W - 20, 8, 'rgba(255,255,250,0.3)', 'rgba(0,0,0,0)');
    rr(g, 22, wallTop - 44, W - 44, 30, 5, shade(white, -0.04));
    rr(g, 28, wallTop - 38, W - 56, 20, 3, '#203446');
    for (let mx = 28 + 24; mx < W - 34; mx += 24) {
      rect(g, mx, wallTop - 38, 2.6, 20, shade(white, -0.16));
    }
    vgrad(g, 28, wallTop - 38, W - 56, 8, 'rgba(190,220,240,0.45)', 'rgba(0,0,0,0)');
    // Radar and whip aerials, drawn thin against the sky.
    g.strokeStyle = '#b8b2a2';
    g.lineWidth = 3;
    g.beginPath();
    g.moveTo(96, wallTop - 44);
    g.lineTo(96, wallTop - 62);
    g.stroke();
    oval(g, 96, wallTop - 64, 16, 4.4, '#e9e7dd');
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(240, wallTop - 44);
    g.lineTo(240, wallTop - 70);
    g.moveTo(276, wallTop - 44);
    g.lineTo(276, wallTop - 58);
    g.stroke();
    dot(g, 240, wallTop - 72, 2, '#c94a2e');
    // A string of signal flags, because the bosun likes them.
    g.strokeStyle = 'rgba(220,220,210,0.6)';
    g.lineWidth = 1.4;
    g.beginPath();
    g.moveTo(112, wallTop - 58);
    g.quadraticCurveTo(180, wallTop - 46, 240, wallTop - 66);
    g.stroke();
    const flagC = ['#c1512f', PAL.gold, '#3f7fb0', '#f2ead8'];
    for (let k = 0; k < 4; k++) {
      const fx = 128 + k * 26;
      rr(g, fx, wallTop - 55 + (k % 2) * 3, 10, 8, 1, flagC[k] ?? '#f2ead8');
    }
  }, 352, 256);
}

export const ART: ChapterArt = {
  paint,
  grounded: ['contA', 'contB', 'contC', 'lifeboat', 'funnel', 'shipbell', 'jackstaff', 'hammock', 'karaoke'],
  buildings: ['shiphouse'],
  windows: {
    shiphouse: [
      [15, -10],
      [67, -10],
    ],
  },
  glows: ['stove'],
};
