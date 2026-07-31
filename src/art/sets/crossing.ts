import type { ChapterArt, MakeTile } from './index';
import { floorPour, grit } from './floor';
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

  /**
   * The galley sole: steel deck plate under grey deck paint, gritted while the
   * paint was wet. Cool and green-grey on purpose. This room sits behind the
   * only exterior in the game with no warm colour in it at all, and the point
   * of chapter three is that the ship is not a place, it is a corridor between
   * places; warming this floor to match the other eleven kitchens would be
   * lying about the only room in the game that is allowed to be hard.
   */
  make('floorSteel', 5, (g, r, i) => {
    const base = floorPour(g, r, i, '#969b93', 0.06);
    // Nonskid: grit broadcast into wet paint, so it is genuinely random and
    // genuinely everywhere, and it is the whole reason a deck is not slippery.
    grit(g, r, base, 30, 0.13, 1.0);
    // Plate seams on the thirty-twos, welded and ground, running the room.
    g.strokeStyle = 'rgba(48,58,54,0.26)';
    g.lineWidth = 1.6;
    g.beginPath();
    if (r.chance(0.5)) { g.moveTo(0, 32); g.lineTo(S, 32); } else { g.moveTo(32, 0); g.lineTo(32, S); }
    g.stroke();
    // The worn track from stove to table, walked back to bare metal.
    if (r.chance(0.45)) oval(g, S / 2 + r.int(16) - 8, S / 2, 15, 7, 'rgba(226,230,224,0.1)');
    // Rust the crew has not caught yet, and the paint chip it started under.
    if (r.chance(0.3)) oval(g, r.next() * S, r.next() * S, 4, 2.6, 'rgba(140,86,50,0.2)');
  });

  // ------------------------------------------------------------ interior

  /**
   * The galley bulkhead: painted steel, and the paint is the material. White
   * enamel above a deck-green scuff band, split by the rubbing strake every
   * working alleyway in every ship afloat has at hip height, because that is
   * the height a crate corner arrives at. Rivets, weld runs, chips down to red
   * lead where something has been dragged past.
   *
   * Ten variants, decorated on four, like every other chapter's wall. The old
   * five-variant version put the crew noticeboard on two cells in five, so the
   * mess of a ship read as a corridor of identical noticeboards.
   */
  make('wallSteel', 10, (g, r, i) => {
    vgrad(g, 0, 0, S, S, shade(STEEL, -0.04), shade(STEEL, 0.04));
    // Rolled enamel over plate: the roller left tracks and nobody sanded them.
    for (let k = 0; k < 4; k++) {
      vgrad(g, r.next() * S, 0, 5 + r.next() * 9, 34, 'rgba(255,255,248,0.16)', 'rgba(0,0,0,0)');
    }
    // The scuff band, and the strake above it.
    rect(g, 0, 44, S, 20, shade(DECK, 0.08));
    vgrad(g, 0, 44, S, 5, 'rgba(255,255,240,0.12)', 'rgba(0,0,0,0)');
    rect(g, 0, 41, S, 4, shade(STEEL, -0.22));
    vgrad(g, 0, 41, S, 1.6, 'rgba(255,255,250,0.3)', 'rgba(0,0,0,0)');
    // Riveted seam along the top, and a weld run under it.
    g.strokeStyle = 'rgba(90,95,90,0.32)';
    g.lineWidth = 1.6;
    g.beginPath(); g.moveTo(0, 16); g.lineTo(S, 16); g.stroke();
    for (let x = 4; x < S; x += 8) dot(g, x, 16, 1.1, 'rgba(70,75,72,0.36)');
    // Chipped to red lead where something has been dragged past. Not charming.
    if (r.chance(0.5)) {
      const cx = r.next() * S;
      const cy = 44 + r.next() * 18;
      oval(g, cx, cy, 2.6 + r.next() * 2.6, 1.6, 'rgba(122,70,44,0.42)');
      oval(g, cx, cy, 1.4, 0.9, 'rgba(58,46,40,0.5)');
    }
    const deco = i < 4 ? i : -1;
    if (deco === 0) {
      // A brass-rimmed porthole with the deadlight swung back, sea beyond.
      dot(g, 32, 24, 13, '#a08a4a');
      dot(g, 32, 24, 10, '#274b66');
      oval(g, 32, 20, 8, 4, 'rgba(190,220,240,0.35)');
      dot(g, 41, 16, 1.6, '#c9b46a');
      dot(g, 23, 32, 1.6, '#c9b46a');
    } else if (deco === 1) {
      // A pipe run with a valve wheel, lagged where it carries steam.
      rr(g, 0, 20, S, 7, 3, '#b8b2a2');
      vgrad(g, 0, 20, S, 3, 'rgba(255,255,245,0.4)', 'rgba(0,0,0,0)');
      rect(g, 12, 20, 9, 7, '#d8d2c2');
      dot(g, 40, 23, 6, '#8a4030');
      dot(g, 40, 23, 2.2, '#5c2a1e');
    } else if (deco === 2) {
      // The crew noticeboard: watch bill, port rotation, one postcard.
      rr(g, 14, 14, 36, 24, 3, '#7a5636');
      rr(g, 17, 17, 12, 9, 1, '#f2ead8');
      rr(g, 32, 18, 14, 10, 1, '#e8dcc4');
      rr(g, 19, 29, 13, 7, 1, '#c98a7a');
    } else if (deco === 3) {
      // Extinguisher on its bracket and the muster placard over it. Every
      // room on a ship tells you, in the same two colours, how to leave it.
      rr(g, 22, 6, 20, 12, 1.5, '#2f6b4a');
      rect(g, 25, 10, 5, 5, '#e8e4d6');
      rect(g, 33, 9, 7, 2, '#e8e4d6');
      rect(g, 33, 13, 7, 2, '#e8e4d6');
      rr(g, 27, 22, 11, 22, 4, '#9e2f22');
      vgrad(g, 27, 22, 11, 7, 'rgba(255,220,200,0.28)', 'rgba(0,0,0,0)');
      rr(g, 29, 18, 7, 5, 2, '#4a4d4a');
      rect(g, 24, 27, 17, 2.4, '#5a5d58');
      rect(g, 24, 39, 17, 2.4, '#5a5d58');
    }
  });

  /**
   * Dunnage board: a duckboard grating of scrap timber, laid where the cook
   * stands so eight hours on a steel deck do not end his back. The galley's
   * one `mat` cell used to draw the shared woven mat, which is a floor
   * covering for a room with a floor, and this room has a sole.
   */
  make('dunnage', 2, (g, r) => {
    const timber = '#9a8b6e';
    rect(g, 0, 0, S, S, shade(timber, -0.22));
    // Slats on the sixteens, gaps between, so a run of cells is one grating.
    for (let y = 1; y < S; y += 16) {
      rect(g, 0, y, S, 12, shade(timber, (r.next() - 0.5) * 0.14));
      vgrad(g, 0, y, S, 3, 'rgba(255,244,214,0.14)', 'rgba(0,0,0,0)');
      vgrad(g, 0, y + 9, S, 3, 'rgba(0,0,0,0)', 'rgba(24,16,10,0.3)');
    }
    // Bearers under the slats, and the water that lives down there.
    for (const bx of [10, 42]) rect(g, bx, 0, 6, S, 'rgba(40,30,20,0.16)');
    if (r.chance(0.6)) oval(g, r.next() * S, r.next() * S, 10, 5, 'rgba(50,58,54,0.14)');
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

  make('menuboard', 1, (g) => {
    // A wall tile wearing the galley chalkboard: today's menu, in Ben's hand.
    vgrad(g, 0, 0, S, S, shade(STEEL, -0.06), shade(STEEL, 0.04));
    vgrad(g, 0, 0, S, 14, 'rgba(60,60,50,0.25)', 'rgba(0,0,0,0)');
    rr(g, 10, 14, 44, 38, 3, '#7a5636');
    rr(g, 13, 17, 38, 32, 2, '#28322c');
    // Chalk lines: a heading, three dishes, one triumphant underline.
    rect(g, 20, 21, 24, 2.4, 'rgba(240,238,225,0.85)');
    rect(g, 17, 27, 20, 1.8, 'rgba(240,238,225,0.6)');
    rect(g, 17, 32, 26, 1.8, 'rgba(240,238,225,0.6)');
    rect(g, 17, 37, 16, 1.8, 'rgba(240,238,225,0.6)');
    rect(g, 17, 43, 22, 1.8, 'rgba(250,220,120,0.75)');
    rect(g, 17, 45.6, 22, 1, 'rgba(250,220,120,0.5)');
    // The chalk ledge, one stub and its dust.
    rr(g, 13, 50, 38, 3.4, 1.5, '#8a6a48');
    rr(g, 22, 47.6, 6, 2.4, 1, '#eae6d8');
    oval(g, 34, 51, 5, 1, 'rgba(240,238,225,0.35)');
  });

  make('dartboard', 1, (g) => {
    // A wall tile with the dartboard. Two darts present. The third is a saga.
    vgrad(g, 0, 0, S, S, shade(STEEL, -0.06), shade(STEEL, 0.04));
    vgrad(g, 0, 0, S, 14, 'rgba(60,60,50,0.25)', 'rgba(0,0,0,0)');
    dot(g, 32, 32, 17, '#3a2e22');
    for (let k = 0; k < 10; k++) {
      const a0 = (k / 10) * Math.PI * 2;
      g.fillStyle = k % 2 ? '#1c1a16' : '#e2d8bc';
      g.beginPath();
      g.moveTo(32, 32);
      g.arc(32, 32, 15, a0, a0 + Math.PI / 5);
      g.closePath();
      g.fill();
    }
    dot(g, 32, 32, 6.5, '#3f7050');
    dot(g, 32, 32, 2.4, '#c1512f');
    // Two darts in, flights out; the empty ring where the third should hang.
    for (const [dx, dy, fc] of [
      [26, 27, '#c94a2e'],
      [37, 38, '#3f7fb0'],
    ] as const) {
      g.strokeStyle = '#c9c4b4';
      g.lineWidth = 1.6;
      g.beginPath();
      g.moveTo(dx, dy);
      g.lineTo(dx + 7, dy - 7);
      g.stroke();
      oval(g, dx + 8, dy - 8, 3, 2, fc, -Math.PI / 4);
    }
    // The chalk score column, one side clearly winning.
    rect(g, 6, 20, 8, 1.6, 'rgba(240,238,225,0.5)');
    rect(g, 6, 24, 6, 1.6, 'rgba(240,238,225,0.5)');
    rect(g, 6, 28, 9, 1.6, 'rgba(240,238,225,0.5)');
    rect(g, 54, 24, 5, 1.6, 'rgba(240,238,225,0.4)');
  });

  make('chessset', 1, (g) => {
    // One seat of the mess table, annexed by a game nobody will hurry.
    const wood = '#8a6238';
    softShadow(g, S / 2, 56, 28, 6, 0.2);
    rr(g, 10, 44, 7, 12, 2, shade(wood, -0.16));
    rr(g, S - 17, 44, 7, 12, 2, shade(wood, -0.16));
    rr(g, 4, 14, S - 8, 34, 6, wood);
    vgrad(g, 4, 14, S - 8, 8, 'rgba(255,235,200,0.28)', 'rgba(0,0,0,0)');
    // The board, taped down at the corners against weather.
    rr(g, 14, 18, 28, 24, 2, '#e2d8bc');
    for (let bx = 0; bx < 6; bx++) {
      for (let by = 0; by < 5; by++) {
        if ((bx + by) % 2) rect(g, 16 + bx * 4, 20 + by * 4, 4, 4, '#5c4630');
      }
    }
    for (const [cx, cy] of [
      [15, 19],
      [41, 19],
      [15, 41],
      [41, 41],
    ] as const) {
      oval(g, cx, cy, 2.6, 1.6, 'rgba(200,200,190,0.6)');
    }
    // Mid-game: pieces as little heads, white cornered but plotting.
    for (const [px, py] of [
      [18, 22],
      [26, 26],
      [30, 22],
      [34, 30],
    ] as const) {
      dot(g, px, py, 2, '#efe8d4');
      dot(g, px - 0.6, py - 0.6, 0.8, '#ffffff');
    }
    for (const [px, py] of [
      [22, 34],
      [30, 38],
      [38, 26],
    ] as const) {
      dot(g, px, py, 2, '#33291e');
      dot(g, px - 0.6, py - 0.6, 0.8, 'rgba(255,255,255,0.35)');
    }
    // Casualties beside the board, and somebody's cold coffee ring.
    dot(g, 48, 24, 2, '#efe8d4');
    dot(g, 51, 28, 2, '#33291e');
    g.strokeStyle = 'rgba(90,60,35,0.4)';
    g.lineWidth = 1.4;
    g.beginPath();
    g.arc(49, 37, 4.6, 0, Math.PI * 2);
    g.stroke();
  });

  make('galleyplant', 1, (g) => {
    // The crew's one shared plant, in a rice tin, watered by rota.
    softShadow(g, 32, 90, 16, 4, 0.18);
    rr(g, 22, 66, 20, 22, 3, '#b8b2a2');
    vgrad(g, 22, 66, 20, 6, 'rgba(255,255,245,0.3)', 'rgba(0,0,0,0)');
    rect(g, 22, 74, 20, 5, '#c1512f'); // the tin's old label band
    oval(g, 32, 66, 9, 3, '#4a3a28');
    // A pothos going where it pleases: stems and heart leaves.
    g.strokeStyle = '#4d7440';
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(32, 64);
    g.quadraticCurveTo(20, 48, 24, 34);
    g.moveTo(32, 64);
    g.quadraticCurveTo(44, 50, 42, 32);
    g.moveTo(32, 64);
    g.quadraticCurveTo(30, 50, 34, 44);
    g.stroke();
    for (const [lx, ly, rot] of [
      [24, 34, -0.5],
      [20, 44, 0.4],
      [28, 52, -0.3],
      [42, 32, 0.5],
      [46, 42, -0.4],
      [38, 50, 0.3],
      [34, 42, 0.1],
      [30, 58, -0.2],
    ] as const) {
      oval(g, lx, ly, 5, 3.6, '#5c8a4a', rot);
      oval(g, lx - 1, ly - 1, 2.4, 1.6, 'rgba(220,240,190,0.35)', rot);
    }
    // The rota card, taped to the tin: four names, one crossed out.
    rr(g, 36, 78, 12, 9, 1, '#f2ead8');
    rect(g, 38, 80, 8, 1, 'rgba(60,60,55,0.6)');
    rect(g, 38, 82.4, 8, 1, 'rgba(60,60,55,0.6)');
    rect(g, 38, 84.8, 6, 1, 'rgba(60,60,55,0.6)');
    rect(g, 37, 82.8, 10, 0.8, 'rgba(193,81,47,0.7)');
  }, S, 96);

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

  // --------------------------------------------------- deck life, small

  make('ropecoil', 2, (g, r) => {
    // A mooring line flemished into a flat spiral. Museum-grade rope tidiness.
    const rope = '#c9b48a';
    g.lineCap = 'round';
    for (let rad = 20; rad > 3; rad -= 4.4) {
      g.strokeStyle = rad % 8.8 < 4.4 ? shade(rope, -0.1) : rope;
      g.lineWidth = 4;
      g.beginPath();
      g.arc(32, 34, rad, 0.25, Math.PI * 2 + 0.05);
      g.stroke();
    }
    // Lay of the rope: little diagonal ticks across the coils.
    g.strokeStyle = 'rgba(90,70,40,0.4)';
    g.lineWidth = 1.2;
    for (let k = 0; k < 14; k++) {
      const a = r.next() * Math.PI * 2;
      const rad = 6 + r.int(15);
      const x = 32 + Math.cos(a) * rad;
      const y = 34 + Math.sin(a) * rad;
      g.beginPath();
      g.moveTo(x - 2, y - 2);
      g.lineTo(x + 2, y + 2);
      g.stroke();
    }
    // The bitter end, whipped in red, tucked with intent.
    g.strokeStyle = rope;
    g.lineWidth = 4;
    g.beginPath();
    g.moveTo(50, 40);
    g.quadraticCurveTo(56, 46, 52, 52);
    g.stroke();
    rect(g, 50, 49, 5, 3.6, '#c1512f');
  });

  make('rustpatch', 3, (g, r) => {
    // A bloom the bosun is losing to, politely. Paint bubbles at the border.
    const cx = 30 + r.int(6);
    const cy = 30 + r.int(6);
    oval(g, cx, cy, 13 + r.int(5), 9 + r.int(4), 'rgba(122,72,40,0.4)', r.next());
    oval(g, cx + 3, cy - 2, 8, 6, 'rgba(150,88,44,0.45)', r.next());
    oval(g, cx - 3, cy + 3, 5, 3.6, 'rgba(92,52,30,0.5)', r.next());
    for (let k = 0; k < 8; k++) {
      const a = r.next() * Math.PI * 2;
      const d = 12 + r.int(7);
      dot(g, cx + Math.cos(a) * d, cy + Math.sin(a) * d * 0.7, 1.4 + r.next(), 'rgba(138,84,48,0.4)');
    }
    // A halo of lifted paint, one shade proud of the deck.
    g.strokeStyle = 'rgba(220,225,215,0.22)';
    g.lineWidth = 2;
    g.beginPath();
    g.ellipse(cx, cy, 16, 11, r.next(), 0.4, 2.6);
    g.stroke();
    // Wire-brush scratches: somebody has been fighting back.
    g.strokeStyle = 'rgba(180,178,162,0.35)';
    g.lineWidth = 1.2;
    for (let k = 0; k < 4; k++) {
      const sx = cx - 8 + r.int(16);
      g.beginPath();
      g.moveTo(sx, cy - 6 + r.int(4));
      g.lineTo(sx + 6, cy + 2 + r.int(4));
      g.stroke();
    }
  });

  make('flyingfish', 1, (g) => {
    // Overnight arrival, found at dawn. The cook calls this room service.
    oval(g, 32, 40, 14, 5, 'rgba(160,200,220,0.18)'); // drying salt sheen
    const silver = '#b8c4c9';
    oval(g, 30, 36, 12, 3.6, silver, -0.12);
    oval(g, 27, 35, 8, 2.6, 'rgba(240,248,250,0.6)', -0.12); // belly shine
    // The tail, forked; the great wing fin, folded over the back.
    g.fillStyle = shade(silver, -0.18);
    g.beginPath();
    g.moveTo(42, 36);
    g.lineTo(48, 31);
    g.lineTo(46, 36);
    g.lineTo(48, 40);
    g.closePath();
    g.fill();
    g.beginPath();
    g.moveTo(28, 34);
    g.quadraticCurveTo(36, 22, 44, 30);
    g.quadraticCurveTo(36, 30, 30, 36);
    g.closePath();
    g.fillStyle = 'rgba(120,150,165,0.75)';
    g.fill();
    g.strokeStyle = 'rgba(70,95,110,0.5)';
    g.lineWidth = 0.8;
    for (const wx of [33, 36, 39]) {
      g.beginPath();
      g.moveTo(29, 34);
      g.lineTo(wx + 4, 26);
      g.stroke();
    }
    dot(g, 21, 35, 1.4, '#22303a'); // the astonished eye
  });

  make('oildrum', 1, (g) => {
    // Two 200-liter drums, lashed, stenciled, repurposed forever.
    softShadow(g, 32, 56, 26, 6, 0.22);
    for (const [dx, c] of [
      [17, NAVY],
      [43, '#8a4030'],
    ] as const) {
      const grad = g.createLinearGradient(dx - 13, 0, dx + 13, 0);
      grad.addColorStop(0, shade(c, -0.14));
      grad.addColorStop(0.4, shade(c, 0.12));
      grad.addColorStop(1, shade(c, -0.2));
      g.fillStyle = grad;
      g.fillRect(dx - 13, 18, 26, 38);
      // Rolling hoops.
      for (const hy of [28, 42]) {
        rect(g, dx - 13, hy, 26, 3, shade(c, -0.24));
        rect(g, dx - 13, hy, 26, 1.2, shade(c, 0.16));
      }
      oval(g, dx, 18, 13, 4.4, shade(c, 0.18));
      oval(g, dx, 17.4, 9, 2.6, shade(c, -0.06));
      dot(g, dx + 5, 17, 2, shade(c, -0.3)); // the bung
      // Stencil band: blocky paint marks, port-of-origin issue.
      for (let k = 0; k < 4; k++) {
        rect(g, dx - 9 + k * 5, 34, 3.4, 4.4, 'rgba(240,238,225,0.75)');
      }
    }
    // One lashing across both, because the bosun trusts nothing round.
    g.strokeStyle = 'rgba(210,210,200,0.6)';
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(3, 50);
    g.lineTo(61, 46);
    g.stroke();
  });

  make('hosereel', 1, (g) => {
    // The fire hose on its reel, drilled monthly, needed never. So far.
    softShadow(g, 32, 56, 24, 6, 0.2);
    rr(g, 10, 20, 44, 34, 4, '#c1512f');
    vgrad(g, 10, 20, 44, 8, 'rgba(255,255,245,0.2)', 'rgba(0,0,0,0)');
    // The wound hose, pale canvas, coiled in rows.
    for (const hy of [28, 34, 40, 46]) {
      rr(g, 14, hy, 36, 5, 2.4, hy % 12 === 4 ? '#ddd6c2' : '#cfc7b0');
      rect(g, 14, hy + 3.6, 36, 1, 'rgba(90,85,70,0.3)');
    }
    // Axle bosses and the brass nozzle, hooked and ready.
    dot(g, 12, 37, 4, '#8a3a24');
    dot(g, 52, 37, 4, '#8a3a24');
    g.strokeStyle = '#cfc7b0';
    g.lineWidth = 3.4;
    g.beginPath();
    g.moveTo(50, 48);
    g.quadraticCurveTo(58, 50, 56, 40);
    g.stroke();
    rr(g, 53, 30, 6, 11, 2, '#c9a83f');
    // Stencil dashes: FIRE, in the universal font of red boxes.
    for (let k = 0; k < 3; k++) rect(g, 20 + k * 8, 23, 5, 2.6, 'rgba(240,238,225,0.8)');
  });

  make('paintcans', 1, (g) => {
    // Deck green by the gallon: the other side of Joseph's argument.
    softShadow(g, 30, 54, 22, 5, 0.18);
    // The drop rag, folded with suspicious neatness.
    rr(g, 12, 42, 40, 12, 2, '#c2b797');
    rect(g, 12, 46, 40, 1.2, 'rgba(120,105,75,0.35)');
    oval(g, 24, 46, 4, 2, 'rgba(99,114,106,0.6)');
    oval(g, 40, 49, 3, 1.6, 'rgba(138,84,48,0.5)');
    // Two shut cans, one open with the brush across it.
    const tin = '#8f9490';
    for (const [cx2, cy2] of [
      [20, 30],
      [34, 26],
    ] as const) {
      rect(g, cx2 - 8, cy2, 16, 14, tin);
      rect(g, cx2 - 8, cy2, 3, 14, shade(tin, -0.16));
      rect(g, cx2 + 4, cy2, 4, 14, shade(tin, -0.22));
      oval(g, cx2, cy2, 8, 3, shade(tin, 0.24));
      oval(g, cx2, cy2 + 0.4, 6, 2, shade(DECK, -0.1)); // lid drips tell the color
      rect(g, cx2 - 8, cy2 + 5, 16, 2, shade(tin, -0.18));
    }
    rect(g, 40, 34, 16, 14, tin);
    rect(g, 40, 34, 3, 14, shade(tin, -0.16));
    rect(g, 52, 34, 4, 14, shade(tin, -0.22));
    oval(g, 48, 34, 8, 3, shade(tin, -0.28));
    oval(g, 48, 34, 6, 2.2, DECK); // open: the paint itself
    oval(g, 46, 33.6, 2.6, 1, shade(DECK, 0.2));
    // The brush, resting across the rim, mid-career.
    g.strokeStyle = '#8a6238';
    g.lineWidth = 2.6;
    g.beginPath();
    g.moveTo(41, 28);
    g.lineTo(52, 37);
    g.stroke();
    rr(g, 51, 36, 6, 5, 1, shade(DECK, -0.1));
    // One honest drip down the can.
    rect(g, 43, 37, 1.6, 6, shade(DECK, -0.06));
    dot(g, 43.8, 44, 1.4, shade(DECK, -0.06));
  });

  make('tarpthing', 1, (g) => {
    // The tarp-covered something. Lashed by a professional. Discussed by all.
    softShadow(g, 32, 56, 26, 6, 0.22);
    const tarp = '#5c7a5c';
    g.beginPath();
    g.moveTo(8, 54);
    g.quadraticCurveTo(6, 34, 18, 26);
    g.quadraticCurveTo(26, 12, 40, 18);
    g.quadraticCurveTo(54, 18, 56, 34);
    g.quadraticCurveTo(60, 48, 54, 54);
    g.closePath();
    const grad = g.createLinearGradient(0, 12, 0, 54);
    grad.addColorStop(0, shade(tarp, 0.16));
    grad.addColorStop(1, shade(tarp, -0.14));
    g.fillStyle = grad;
    g.fill();
    // Folds, and two bulges that suggest and confirm nothing.
    g.strokeStyle = shade(tarp, -0.2);
    g.lineWidth = 1.6;
    g.beginPath();
    g.moveTo(20, 28);
    g.quadraticCurveTo(28, 40, 24, 54);
    g.moveTo(40, 20);
    g.quadraticCurveTo(44, 34, 40, 52);
    g.stroke();
    oval(g, 30, 24, 8, 4, shade(tarp, 0.2), -0.3);
    oval(g, 48, 34, 5, 3, shade(tarp, 0.18), 0.4);
    // Cross lashings to deck rings, tensioned like an opinion.
    g.strokeStyle = '#c9b48a';
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(12, 30);
    g.lineTo(52, 50);
    g.moveTo(50, 24);
    g.lineTo(14, 52);
    g.stroke();
    for (const [ax, ay] of [
      [10, 56],
      [54, 56],
    ] as const) {
      dot(g, ax, ay, 2.6, '#4c4f4c');
      dot(g, ax, ay, 1.2, '#2e3130');
    }
  });

  // --------------------------------------------------- deck life, tall

  make('portcrate', 1, (g) => {
    // Break-bulk crates stenciled with ports: where she has been, where next.
    softShadow(g, 32, 90, 26, 6, 0.22);
    const wood = '#a08a5c';
    for (const [top, hgt, c] of [
      [50, 38, wood],
      [16, 32, shade(wood, 0.08)],
    ] as const) {
      const grad = g.createLinearGradient(0, top, 0, top + hgt);
      grad.addColorStop(0, shade(c, 0.1));
      grad.addColorStop(1, shade(c, -0.12));
      g.fillStyle = grad;
      g.fillRect(6, top, 52, hgt);
      // Plank lines and the diagonal brace.
      g.strokeStyle = 'rgba(80,60,35,0.4)';
      g.lineWidth = 1.4;
      for (let py = top + 8; py < top + hgt; py += 8) {
        g.beginPath();
        g.moveTo(6, py);
        g.lineTo(58, py);
        g.stroke();
      }
      g.beginPath();
      g.moveTo(8, top + hgt - 2);
      g.lineTo(56, top + 2);
      g.stroke();
      rect(g, 6, top, 3, hgt, shade(c, -0.18));
      rect(g, 55, top, 3, hgt, shade(c, -0.18));
    }
    // Stencils: three port names, two crossed out, one waiting.
    for (let k = 0; k < 5; k++) rect(g, 15 + k * 6, 58, 4, 5, 'rgba(45,40,32,0.7)');
    rect(g, 13, 60, 34, 1.6, 'rgba(193,81,47,0.8)'); // struck through: been there
    for (let k = 0; k < 4; k++) rect(g, 17 + k * 6, 70, 4, 5, 'rgba(45,40,32,0.7)');
    rect(g, 15, 72, 28, 1.6, 'rgba(193,81,47,0.8)'); // and there
    for (let k = 0; k < 6; k++) rect(g, 13 + k * 6, 24, 4, 5, 'rgba(240,238,225,0.85)'); // still to come
    // FRAGILE-ish glyphs and this-way-up arrows, ignored respectfully.
    g.strokeStyle = 'rgba(45,40,32,0.7)';
    g.lineWidth = 1.6;
    g.beginPath();
    g.moveTo(46, 40);
    g.lineTo(46, 34);
    g.moveTo(43, 37);
    g.lineTo(46, 34);
    g.lineTo(49, 37);
    g.stroke();
  }, S, 96);

  make('lifering', 1, (g) => {
    // The ship's name in a circle you can throw. Checked weekly, thrown never.
    softShadow(g, 32, 90, 14, 4, 0.16);
    rect(g, 29, 34, 6, 54, '#e9e7dd');
    rect(g, 29, 34, 2.4, 54, '#ffffff');
    rr(g, 22, 84, 20, 5, 2, shade('#e9e7dd', -0.2));
    // The ring on its bracket, quartered orange and white.
    dot(g, 32, 30, 16, '#d96b2e');
    for (const a of [Math.PI / 4, (3 * Math.PI) / 4, (5 * Math.PI) / 4, (7 * Math.PI) / 4]) {
      g.fillStyle = '#f2ead8';
      g.beginPath();
      g.arc(32, 30, 16, a - 0.35, a + 0.35);
      g.arc(32, 30, 8, a + 0.35, a - 0.35, true);
      g.closePath();
      g.fill();
    }
    g.save(); // punch the middle out so the world shows through
    g.globalCompositeOperation = 'destination-out';
    dot(g, 32, 30, 8, '#000');
    g.restore();
    rect(g, 30, 33, 4, 5.4, shade('#e9e7dd', -0.24)); // the post, seen through the hole
    oval(g, 27, 25, 4, 2, 'rgba(255,255,250,0.4)', -0.6);
    // The grab line, looped around the ring in four bights.
    g.strokeStyle = '#c9b48a';
    g.lineWidth = 1.6;
    g.beginPath();
    g.moveTo(18, 24);
    g.quadraticCurveTo(12, 30, 18, 37);
    g.moveTo(46, 24);
    g.quadraticCurveTo(52, 30, 46, 37);
    g.moveTo(25, 15);
    g.quadraticCurveTo(32, 11, 39, 15);
    g.moveTo(25, 45);
    g.quadraticCurveTo(32, 49, 39, 45);
    g.stroke();
    // Name band marks: M V  Y A C A N A, in stencil dashes.
    for (let k = 0; k < 4; k++) rect(g, 25 + k * 4, 40, 2.6, 3, 'rgba(45,40,32,0.75)');
  }, S, 96);

  make('deckshrine', 1, (g) => {
    // A welded-bracket shrine: many faiths, one sea, one plastic flower.
    softShadow(g, 32, 90, 16, 4, 0.18);
    rect(g, 29, 52, 6, 36, '#b8b2a2');
    // The little house: steel box, painted roof, open to the weather's mercy.
    rr(g, 12, 20, 40, 34, 3, '#8a3a24');
    rr(g, 15, 26, 34, 28, 2, '#3a2e22');
    g.fillStyle = '#c1512f';
    g.beginPath();
    g.moveTo(8, 22);
    g.lineTo(32, 8);
    g.lineTo(56, 22);
    g.closePath();
    g.fill();
    g.beginPath();
    g.moveTo(12, 20);
    g.lineTo(32, 10);
    g.lineTo(52, 20);
    g.lineTo(48, 16);
    g.lineTo(32, 8);
    g.lineTo(16, 16);
    g.closePath();
    g.fillStyle = shade('#c1512f', 0.18);
    g.fill();
    // Inside: a small light, a card, coins from five currencies.
    dot(g, 32, 40, 6, 'rgba(255,205,120,0.5)');
    dot(g, 32, 41, 2.4, '#ffd88a');
    rr(g, 20, 34, 8, 11, 1, '#f2ead8');
    rect(g, 21, 36, 6, 1, 'rgba(60,60,55,0.5)');
    rect(g, 21, 38.4, 6, 1, 'rgba(60,60,55,0.5)');
    for (const [mx, my] of [
      [40, 48],
      [43, 50],
      [38, 51],
    ] as const) {
      dot(g, mx, my, 2, '#c9a83f');
      dot(g, mx - 0.6, my - 0.6, 0.8, 'rgba(255,255,240,0.6)');
    }
    // The plastic flower, zip-tied to the post, eternally in season.
    g.strokeStyle = '#4d7440';
    g.lineWidth = 1.8;
    g.beginPath();
    g.moveTo(38, 76);
    g.quadraticCurveTo(40, 66, 38, 60);
    g.stroke();
    for (const a of [0, 1.25, 2.5, 3.75, 5]) {
      oval(g, 38 + Math.cos(a) * 4, 59 + Math.sin(a) * 4, 3.2, 2.2, '#d9694a', a);
    }
    dot(g, 38, 59, 2.4, '#ffd88a');
    rect(g, 33, 74, 8, 2.4, '#ddd6c2'); // the zip tie, doing its forever job
  }, S, 96);

  make('laundry', 1, (g) => {
    // The crew's coveralls drying between rails: the flag of the off-watch.
    softShadow(g, 32, 90, 24, 5, 0.14);
    rect(g, 6, 14, 3.4, 74, '#e9e7dd');
    rect(g, 54, 14, 3.4, 74, '#e9e7dd');
    g.strokeStyle = 'rgba(220,218,205,0.8)';
    g.lineWidth = 1.6;
    g.beginPath();
    g.moveTo(8, 20);
    g.quadraticCurveTo(32, 26, 56, 20);
    g.stroke();
    // Three coveralls: engine-room orange, deck navy, and one size bosun.
    const overall = (ox: number, oy: number, w: number, len: number, c: string) => {
      rr(g, ox - w / 2, oy, w, len * 0.44, 3, c); // torso
      rect(g, ox - w / 2, oy + len * 0.42, w * 0.42, len * 0.58, shade(c, -0.06));
      rect(g, ox + w * 0.08, oy + len * 0.42, w * 0.42, len * 0.58, shade(c, -0.1));
      rect(g, ox - w / 2, oy + 3, w, 3, shade(c, 0.14)); // shoulder fold
      dot(g, ox - w / 2 + 1, oy, 1.4, '#8a6238'); // pegs
      dot(g, ox + w / 2 - 1, oy, 1.4, '#8a6238');
    };
    overall(16, 23, 13, 34, '#d96b2e');
    overall(31, 25, 13, 34, NAVY);
    overall(47, 22, 17, 42, '#3f7fb0');
    // One stripe of reflective tape each, catching the light.
    for (const [tx, ty, tw] of [
      [10, 40, 12],
      [25, 42, 12],
      [39, 44, 16],
    ] as const) {
      rect(g, tx, ty, tw, 2, 'rgba(240,240,225,0.7)');
    }
    // And somebody's lucky towel, which has seen things.
    rr(g, 24, 20, 9, 16, 1, '#8fcbe8');
    rect(g, 24, 30, 9, 2, 'rgba(255,255,255,0.5)');
  }, S, 96);

  make('sternrod', 1, (g) => {
    // The fishing rod lashed to the stern rail, trolling since Callao.
    softShadow(g, 32, 90, 16, 4, 0.14);
    // A stub of rail to belong to.
    rect(g, 10, 44, 4, 44, '#e9e7dd');
    rect(g, 4, 46, 40, 3, shade('#e9e7dd', -0.1));
    rect(g, 4, 60, 40, 3, shade('#e9e7dd', -0.1));
    // The rod, aged bamboo, arced with hope rather than fish.
    g.strokeStyle = '#a08a5c';
    g.lineWidth = 3;
    g.lineCap = 'round';
    g.beginPath();
    g.moveTo(14, 84);
    g.quadraticCurveTo(30, 44, 52, 14);
    g.stroke();
    g.strokeStyle = shade('#a08a5c', 0.2);
    g.lineWidth = 1;
    g.beginPath();
    g.moveTo(14, 83);
    g.quadraticCurveTo(30, 44, 51, 14);
    g.stroke();
    // Lashings to the rail, tidy x's.
    g.strokeStyle = '#c9b48a';
    g.lineWidth = 2;
    for (const ly of [50, 62] as const) {
      g.beginPath();
      g.moveTo(12, ly - 4);
      g.lineTo(22, ly + 4);
      g.moveTo(22, ly - 4);
      g.lineTo(12, ly + 4);
      g.stroke();
    }
    // Reel, line, and the little bell that will wake the whole deck someday.
    dot(g, 24, 66, 5, '#4c4f4c');
    dot(g, 24, 66, 2, '#8a8478');
    g.strokeStyle = 'rgba(230,235,235,0.65)';
    g.lineWidth = 1;
    g.beginPath();
    g.moveTo(52, 14);
    g.quadraticCurveTo(58, 30, 60, 50);
    g.stroke();
    dot(g, 52, 18, 2.6, '#c9a83f');
    // The hopeful bucket at its foot.
    rr(g, 34, 74, 18, 14, 2, '#3f7fb0');
    oval(g, 43, 74, 9, 3, shade('#3f7fb0', 0.16));
    oval(g, 43, 74.4, 7, 2.2, '#2a4a63');
  }, S, 96);

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
  grounded: [
    'contA', 'contB', 'contC', 'lifeboat', 'funnel', 'shipbell', 'jackstaff', 'hammock', 'karaoke',
    'portcrate', 'lifering', 'deckshrine', 'laundry', 'sternrod', 'galleyplant',
  ],
  buildings: ['shiphouse'],
  windows: {
    shiphouse: [
      [15, -10],
      [67, -10],
    ],
  },
  glows: ['stove', 'deckshrine'],
  noInk: ['ropecoil', 'rustpatch', 'flyingfish', 'dunnage'],
  /** In the galley a mat is a dunnage board, not a woven one. */
  skins: {
    galley: { mat: 'dunnage' },
  },
};
