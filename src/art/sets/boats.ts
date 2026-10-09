import type { ChapterArt } from './index';
import { dot, oval, rr, shade, vgrad } from '../pix';

/**
 * The vessels the words name. Every chapter but one arrived by water in its
 * text and on dry land in its frame: "a chugging boat leaves you on a
 * jetty", "when the boat rounds the lighthouse", "the ship noses past two
 * black stone towers". The jahazi at Fukoni was the one boat that was
 * actually there. These are the others, painted to sit beside her: the same
 * three-quarter view as the nave at the Sicilian mole (the far rail, the
 * deck seen from the town's height, the near side down to the water), a
 * dark water-shadow instead of a cast one, and one painted sheer line each,
 * because every working boat on every coast is somebody's colours.
 *
 * Kinds, anchored like any tall prop (bottom cell, centred on it), all with
 * their bow to the right (east):
 *   boatLaunch   Shionoura's harbour launch, white and blue, wheelhouse aft.
 *                 3 tiles wide, 2 tall.
 *   boatFishing  A Seto fishing boat dressed in tairyō-bata for the morning
 *                 it carries you off. 3 wide, 2.5 tall.
 *   boatKerala   A Kerala country boat with a woven canopy and a chugging
 *                 engine aft. 4 wide, 2 tall.
 *   boatFerry    A small coastal steamer: the ship into Sicily, and the one
 *                 that brings you back into La Caleta. 5 wide, 3 tall.
 * Footprint: one solid cell (the anchor); the art overhangs the water cells
 * either side, which no one can stand on anyway.
 */

/** Where the hull meets its own reflection: a dark pool and a lit foam lip. */
function waterline(g: CanvasRenderingContext2D, cx: number, wl: number, half: number) {
  oval(g, cx, wl + 4, half, 7, 'rgba(18,36,52,0.3)');
  oval(g, cx, wl + 1, half * 0.9, 3, 'rgba(20,40,56,0.35)');
}

type HullSpec = {
  /** Transom x (stern, left) and stem x (bow, right). */
  x0: number;
  x1: number;
  /** Far gunwale and near gunwale y at the transom; the waterline. */
  far: number;
  near: number;
  wl: number;
  /** How much the sheer climbs to the bow, and the stem's rake. */
  lift: number;
  rake: number;
  hull: string;
  deck: string;
};

/** A hull in three-quarter view; returns the bow point for trim to follow. */
function hull(g: CanvasRenderingContext2D, h: HullSpec): [number, number] {
  const midX = (h.x0 + h.x1) / 2;
  const bow: [number, number] = [h.x1, (h.far + h.near) / 2 - h.lift];
  // Deck: between the far rail and the near rail, closing at the stem.
  g.fillStyle = h.deck;
  g.beginPath();
  g.moveTo(h.x0, h.far);
  g.quadraticCurveTo(midX + 20, h.far + 2, bow[0], bow[1]);
  g.quadraticCurveTo(midX + 20, h.near + 2, h.x0, h.near);
  g.closePath();
  g.fill();
  // A little shade under the far rail, so the deck reads as sunk in the hull.
  g.save();
  g.clip();
  vgrad(g, h.x0, h.far, h.x1 - h.x0, 8, 'rgba(0,0,0,0.16)', 'rgba(0,0,0,0)');
  g.restore();
  // The far bulwark as a thin rail.
  g.strokeStyle = shade(h.hull, 0.2);
  g.lineWidth = 3;
  g.beginPath();
  g.moveTo(h.x0, h.far);
  g.quadraticCurveTo(midX + 20, h.far + 2, bow[0], bow[1]);
  g.stroke();
  // The near side, from the rail down to the water.
  g.beginPath();
  g.moveTo(h.x0, h.near);
  g.quadraticCurveTo(midX + 20, h.near + 2, bow[0], bow[1]);
  g.lineTo(h.x1 - h.rake, h.wl);
  g.quadraticCurveTo(midX, h.wl + 3, h.x0 + 6, h.wl);
  g.closePath();
  const grad = g.createLinearGradient(0, h.near, 0, h.wl);
  grad.addColorStop(0, shade(h.hull, 0.14));
  grad.addColorStop(1, shade(h.hull, -0.22));
  g.fillStyle = grad;
  g.fill();
  // The near gunwale's cap, catching the light.
  g.strokeStyle = shade(h.hull, 0.35);
  g.lineWidth = 2.4;
  g.beginPath();
  g.moveTo(h.x0, h.near);
  g.quadraticCurveTo(midX + 20, h.near + 2, bow[0], bow[1]);
  g.stroke();
  return bow;
}

/** A painted band along the near side, `below` px under the gunwale. */
function sheer(g: CanvasRenderingContext2D, h: HullSpec, below: number, width: number, c: string) {
  const midX = (h.x0 + h.x1) / 2;
  const by = (h.far + h.near) / 2 - h.lift;
  g.strokeStyle = c;
  g.lineWidth = width;
  g.lineCap = 'round';
  g.beginPath();
  g.moveTo(h.x0 + 2, h.near + below);
  g.quadraticCurveTo(midX + 20, h.near + below + 2, h.x1 - 6 - below * 0.3, by + below * 0.9);
  g.stroke();
  g.lineCap = 'butt';
}

/** Tyre fenders hung over the near side. */
function fenders(g: CanvasRenderingContext2D, xs: number[], y: number) {
  for (const x of xs) {
    g.strokeStyle = 'rgba(40,30,24,0.6)';
    g.lineWidth = 1.2;
    g.beginPath();
    g.moveTo(x, y - 6);
    g.lineTo(x, y);
    g.stroke();
    oval(g, x, y + 4, 4.5, 5.5, '#2b2a2c');
    oval(g, x, y + 4, 2, 2.6, '#55524f');
  }
}

/** A cabin box in three-quarter view: roof plane above, front face below. */
function cabin(
  g: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  roofH: number,
  faceH: number,
  wall: string,
  roof: string,
) {
  // Roof, slightly overhanging.
  rr(g, x - 2, y, w + 4, roofH, 3, roof);
  vgrad(g, x - 2, y, w + 4, roofH, 'rgba(255,255,255,0.18)', 'rgba(0,0,0,0)');
  // Front face.
  rr(g, x, y + roofH, w, faceH, 2, wall);
  vgrad(g, x, y + roofH, w, faceH, 'rgba(0,0,0,0)', 'rgba(0,0,0,0.12)');
  // Eave shadow.
  g.fillStyle = 'rgba(0,0,0,0.18)';
  g.fillRect(x, y + roofH, w, 2);
}

/** A row of windows on a face. */
function windows(g: CanvasRenderingContext2D, x: number, y: number, n: number, w: number, h: number, gap: number, glass: string) {
  for (let i = 0; i < n; i++) {
    const wx = x + i * (w + gap);
    rr(g, wx, y, w, h, 1.5, glass);
    g.fillStyle = 'rgba(255,255,255,0.35)';
    g.fillRect(wx + 1, y + 1, w * 0.35, h - 2);
  }
}

export const ART: ChapterArt = {
  grounded: ['boatLaunch', 'boatFishing', 'boatKerala', 'boatFerry'],

  paint(make) {
    // ---- Shionoura's harbour launch: the inland sea's water bus, white
    // and blue, a little wheelhouse aft and tyres along her side.
    make('boatLaunch', 1, (g) => {
      const h: HullSpec = {
        x0: 18, x1: 182, far: 62, near: 80, wl: 108, lift: 8, rake: 14,
        hull: '#eef0ec', deck: '#c9c2ad',
      };
      waterline(g, 100, h.wl, 86);
      hull(g, h);
      // Boot-top and sheer stripe in harbour blue.
      sheer(g, h, 12, 5, '#2f5f8f');
      sheer(g, h, 20, 2.2, '#c84a36');
      g.strokeStyle = 'rgba(30,50,70,0.55)';
      g.lineWidth = 3;
      g.beginPath();
      g.moveTo(h.x0 + 8, h.wl - 3);
      g.quadraticCurveTo(100, h.wl, h.x1 - h.rake - 2, h.wl - 4);
      g.stroke();
      fenders(g, [56, 92, 128], h.near + 4);
      // Wheelhouse aft of midships.
      cabin(g, 44, 34, 58, 9, 30, '#f4f2ea', '#3c6d98');
      windows(g, 50, 46, 3, 13, 10, 4, '#3b5a72');
      // Lifebuoy on the cabin side.
      dot(g, 110, 60, 7, '#e8e2d4');
      g.strokeStyle = '#d0503a';
      g.lineWidth = 3.5;
      g.beginPath();
      g.arc(110, 60, 5.5, 0, Math.PI * 2);
      g.setLineDash([4, 4]);
      g.stroke();
      g.setLineDash([]);
      // Mast with a pennant and a lamp.
      g.strokeStyle = '#4a4a50';
      g.lineWidth = 2.4;
      g.beginPath();
      g.moveTo(74, 34);
      g.lineTo(74, 10);
      g.stroke();
      dot(g, 74, 12, 2.4, '#f4d58a');
      g.fillStyle = '#c84a36';
      g.beginPath();
      g.moveTo(74, 16);
      g.lineTo(88, 19);
      g.lineTo(74, 22);
      g.closePath();
      g.fill();
      // A coil of line on the foredeck.
      oval(g, 150, 72, 7, 3.5, '#b7a27a');
      oval(g, 150, 72, 3.5, 1.6, '#8d7a56');
    }, 192, 128);

    // ---- A Seto fishing boat on the morning she takes you off, dressed
    // in tairyō-bata: the big-catch flags every boat in the town flies on
    // a festival or a good day, cracked out loud in the wind.
    make('boatFishing', 1, (g) => {
      const h: HullSpec = {
        x0: 16, x1: 182, far: 94, near: 112, wl: 140, lift: 12, rake: 16,
        hull: '#e9e4d8', deck: '#b9b19a',
      };
      waterline(g, 100, h.wl, 86);
      hull(g, h);
      sheer(g, h, 11, 4.5, '#1f4f7a');
      g.strokeStyle = 'rgba(30,40,50,0.55)';
      g.lineWidth = 3;
      g.beginPath();
      g.moveTo(h.x0 + 8, h.wl - 3);
      g.quadraticCurveTo(100, h.wl, h.x1 - h.rake - 2, h.wl - 4);
      g.stroke();
      // The boat's name panel near the bow, a white rectangle with ink strokes.
      rr(g, 140, 104, 22, 9, 1.5, '#f6f2e8');
      g.strokeStyle = '#2a2a30';
      g.lineWidth = 1.4;
      for (const x of [144, 150, 156]) {
        g.beginPath();
        g.moveTo(x, 106);
        g.lineTo(x + 1, 111);
        g.stroke();
      }
      // Wheelhouse aft, small and tall, the way the inshore boats build them.
      cabin(g, 34, 70, 40, 8, 30, '#f2efe6', '#6f7f8a');
      windows(g, 38, 80, 2, 14, 10, 4, '#34505f');
      // Net drum and floats on the after deck.
      oval(g, 92, 104, 12, 6, '#5d6f54');
      oval(g, 92, 102, 9, 3.5, '#7c8f6a');
      for (const [fx, fc] of [[112, '#e8a02e'], [120, '#e8a02e'], [116, '#f0e6d0']] as const) dot(g, fx, 104, 3.2, fc);
      // The mast forward, with a stay to the bow and one to the cabin.
      const mx = 128;
      g.strokeStyle = '#5a5248';
      g.lineWidth = 3;
      g.beginPath();
      g.moveTo(mx, 102);
      g.lineTo(mx, 8);
      g.stroke();
      g.strokeStyle = 'rgba(60,54,48,0.6)';
      g.lineWidth = 1.2;
      g.beginPath();
      g.moveTo(mx, 10);
      g.lineTo(178, 96);
      g.moveTo(mx, 10);
      g.lineTo(56, 70);
      g.stroke();
      // The tairyō-bata: long banners stacked down the mast, each a block of
      // colour with a white field and a painted mark, streaming aft.
      const flags: [string, string][] = [
        ['#c8322c', '#f3ece0'],
        ['#1f5f9e', '#f3ece0'],
        ['#e3a22b', '#c8322c'],
        ['#2f8a5a', '#f3ece0'],
      ];
      flags.forEach(([body, field], i) => {
        const fy = 12 + i * 20;
        const len = 46 - i * 4;
        g.fillStyle = body;
        g.beginPath();
        g.moveTo(mx, fy);
        g.quadraticCurveTo(mx - len * 0.5, fy - 4, mx - len, fy + 2);
        g.lineTo(mx - len + 2, fy + 16);
        g.quadraticCurveTo(mx - len * 0.5, fy + 12, mx, fy + 16);
        g.closePath();
        g.fill();
        // The white field band and its round mark.
        g.fillStyle = field;
        g.beginPath();
        g.moveTo(mx - 4, fy + 4);
        g.quadraticCurveTo(mx - len * 0.45, fy, mx - len * 0.7, fy + 5);
        g.lineTo(mx - len * 0.7, fy + 12);
        g.quadraticCurveTo(mx - len * 0.45, fy + 9, mx - 4, fy + 12);
        g.closePath();
        g.fill();
        dot(g, mx - len * 0.36, fy + 8, 3.2, body === '#e3a22b' ? '#1f5f9e' : body);
        g.strokeStyle = 'rgba(0,0,0,0.15)';
        g.lineWidth = 1;
        g.stroke();
      });
      // Masthead light.
      dot(g, mx, 7, 2.4, '#f4d58a');
    }, 192, 160);

    // ---- A Kerala country boat, the backwater bus from Kochi: a long
    // anjili-wood hull with both ends drawn up, a woven canopy amidships
    // for the passengers and the mail, and an engine chugging aft.
    make('boatKerala', 1, (g) => {
      const hullC = '#4a3426';
      const wl = 108;
      waterline(g, 128, wl, 116);
      // Hull: both ends rise, the stern a little less than the stem.
      const far = 70;
      const near = 86;
      g.fillStyle = '#7a5a3a';
      g.beginPath();
      g.moveTo(10, 60);
      g.quadraticCurveTo(128, far + 4, 246, 54);
      g.quadraticCurveTo(128, near + 4, 10, 60);
      g.closePath();
      g.fill();
      // Ribs across the open well.
      g.strokeStyle = 'rgba(40,26,16,0.45)';
      g.lineWidth = 2;
      for (let x = 30; x <= 226; x += 14) {
        g.beginPath();
        g.moveTo(x, far - 2 + Math.abs(x - 128) * -0.06);
        g.lineTo(x + 2, near - 2 + Math.abs(x - 128) * -0.08);
        g.stroke();
      }
      // Near side, down to the water.
      g.beginPath();
      g.moveTo(10, 60);
      g.quadraticCurveTo(128, near + 4, 246, 54);
      g.quadraticCurveTo(236, 90, 214, wl - 2);
      g.quadraticCurveTo(128, wl + 4, 40, wl - 2);
      g.quadraticCurveTo(18, 92, 10, 60);
      g.closePath();
      const hg = g.createLinearGradient(0, 70, 0, wl);
      hg.addColorStop(0, shade(hullC, 0.16));
      hg.addColorStop(1, shade(hullC, -0.22));
      g.fillStyle = hg;
      g.fill();
      // Planking seams following the sheer, and the gunwale cap.
      g.strokeStyle = 'rgba(24,14,8,0.4)';
      g.lineWidth = 1.4;
      for (const d of [8, 15]) {
        g.beginPath();
        g.moveTo(16, 64 + d);
        g.quadraticCurveTo(128, near + 4 + d, 240, 58 + d);
        g.stroke();
      }
      g.strokeStyle = shade(hullC, 0.4);
      g.lineWidth = 2.6;
      g.beginPath();
      g.moveTo(10, 60);
      g.quadraticCurveTo(128, near + 4, 246, 54);
      g.stroke();
      // A painted band, temple-green with a yellow line, under the gunwale.
      g.strokeStyle = '#2f7a5c';
      g.lineWidth = 4;
      g.beginPath();
      g.moveTo(20, 70);
      g.quadraticCurveTo(128, near + 13, 236, 64);
      g.stroke();
      g.strokeStyle = '#e2b640';
      g.lineWidth = 1.6;
      g.beginPath();
      g.moveTo(22, 74.5);
      g.quadraticCurveTo(128, near + 17.5, 234, 68.5);
      g.stroke();
      // The canopy: an arched mat of woven bamboo and palm on four posts.
      const c0 = 70;
      const c1 = 186;
      g.strokeStyle = '#5b4126';
      g.lineWidth = 2.4;
      for (const px of [c0 + 4, c1 - 4]) {
        g.beginPath();
        g.moveTo(px, 80);
        g.lineTo(px, 46);
        g.stroke();
      }
      g.beginPath();
      g.moveTo(c0 - 4, 50);
      g.quadraticCurveTo((c0 + c1) / 2, 6, c1 + 4, 48);
      g.lineTo(c1 + 2, 58);
      g.quadraticCurveTo((c0 + c1) / 2, 30, c0 - 2, 60);
      g.closePath();
      const cg = g.createLinearGradient(0, 10, 0, 60);
      cg.addColorStop(0, shade('#b08c52', 0.14));
      cg.addColorStop(1, shade('#b08c52', -0.16));
      g.fillStyle = cg;
      g.fill();
      // Weave: ribs across the arch and a lighter edge binding.
      g.strokeStyle = 'rgba(92,64,32,0.5)';
      g.lineWidth = 1.6;
      for (let i = 1; i < 9; i++) {
        const t = i / 9;
        const x = c0 + (c1 - c0) * t;
        const top = 50 - 40 * Math.sin(Math.PI * t) * 0.92;
        g.beginPath();
        g.moveTo(x, top + 2);
        g.lineTo(x + 1, top + 12);
        g.stroke();
      }
      g.strokeStyle = '#d8bf86';
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(c0 - 2, 59);
      g.quadraticCurveTo((c0 + c1) / 2, 30, c1 + 2, 57);
      g.stroke();
      // Under the canopy, a bench and a mail sack.
      rr(g, 92, 66, 70, 5, 2, '#6b4c30');
      oval(g, 150, 64, 9, 6, '#cdbd96');
      g.strokeStyle = '#8a6a44';
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(146, 59);
      g.lineTo(154, 59);
      g.stroke();
      // The engine box aft, with its stack and the puff that names her.
      rr(g, 32, 56, 22, 14, 2, '#3f4a44');
      vgrad(g, 32, 56, 22, 5, 'rgba(255,255,255,0.18)', 'rgba(0,0,0,0)');
      g.strokeStyle = '#2b2b2b';
      g.lineWidth = 3;
      g.beginPath();
      g.moveTo(44, 56);
      g.lineTo(44, 36);
      g.stroke();
      for (const [sx, sy, sr, a] of [[44, 30, 4.5, 0.4], [38, 22, 6, 0.28], [30, 14, 7.5, 0.16]] as const) {
        oval(g, sx, sy, sr, sr * 0.8, `rgba(236,232,224,${a})`);
      }
      // A bow lamp and the steering pole aft.
      dot(g, 236, 52, 2.6, '#f4d58a');
      g.strokeStyle = '#6b4c30';
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(20, 58);
      g.lineTo(8, 40);
      g.stroke();
    }, 256, 128);

    // ---- A small coastal steamer: dark hull, white house amidships, one
    // funnel with its company band, a lifeboat on each side and a derrick
    // forward. Seen alongside, from a quay's height.
    make('boatFerry', 1, (g) => {
      const h: HullSpec = {
        x0: 18, x1: 304, far: 118, near: 138, wl: 176, lift: 12, rake: 26,
        hull: '#24364a', deck: '#bdb39a',
      };
      waterline(g, 160, h.wl, 150);
      const bow = hull(g, h);
      // Red boot-top just above the water and a white sheer line.
      g.strokeStyle = '#a8382e';
      g.lineWidth = 5;
      g.beginPath();
      g.moveTo(h.x0 + 8, h.wl - 4);
      g.quadraticCurveTo(160, h.wl - 1, h.x1 - h.rake - 2, h.wl - 5);
      g.stroke();
      sheer(g, h, 6, 2.4, '#efe9dc');
      // Portholes along the near side.
      for (let x = 40; x < 270; x += 16) dot(g, x, h.near + 18 - (x / 304) * 4, 2.3, '#d8dccf');
      // Anchor at the hawse.
      g.strokeStyle = '#1a1a1e';
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(bow[0] - 26, bow[1] + 10);
      g.lineTo(bow[0] - 28, bow[1] + 22);
      g.stroke();
      // Forward hatch and a derrick.
      rr(g, 220, 112, 40, 18, 2, '#5d5446');
      vgrad(g, 220, 112, 40, 5, 'rgba(255,255,255,0.2)', 'rgba(0,0,0,0)');
      g.strokeStyle = '#4a4a50';
      g.lineWidth = 3;
      g.beginPath();
      g.moveTo(214, 122);
      g.lineTo(214, 60);
      g.moveTo(214, 64);
      g.lineTo(258, 108);
      g.stroke();
      // The house: two decks of white, windows, a bridge with its wings.
      cabin(g, 76, 84, 112, 10, 32, '#f1ece0', '#cfc6b0');
      windows(g, 84, 98, 8, 9, 8, 4.5, '#3e5466');
      cabin(g, 96, 58, 66, 9, 22, '#f4efe4', '#d6ceb8');
      windows(g, 102, 70, 5, 8, 7, 4.5, '#2f4558');
      // Bridge wings.
      rr(g, 90, 66, 8, 4, 1, '#e4ddcc');
      rr(g, 160, 66, 8, 4, 1, '#e4ddcc');
      // Lifeboats on davits, one each side of the house.
      for (const lx of [64, 190]) {
        oval(g, lx, 92, 13, 5, '#f0a63a');
        oval(g, lx, 90, 11, 2.4, '#f6c977');
        g.strokeStyle = '#7a7a80';
        g.lineWidth = 1.6;
        g.beginPath();
        g.moveTo(lx - 8, 96);
        g.lineTo(lx - 8, 82);
        g.moveTo(lx + 8, 96);
        g.lineTo(lx + 8, 82);
        g.stroke();
      }
      // The funnel: buff with a red band and a black top, raked aft.
      g.fillStyle = '#d9b77a';
      g.beginPath();
      g.moveTo(118, 58);
      g.lineTo(112, 22);
      g.lineTo(134, 22);
      g.lineTo(140, 58);
      g.closePath();
      g.fill();
      g.fillStyle = '#b8342a';
      g.beginPath();
      g.moveTo(114.5, 38);
      g.lineTo(113.5, 31);
      g.lineTo(134.8, 31);
      g.lineTo(136.2, 38);
      g.closePath();
      g.fill();
      g.fillStyle = '#1e1e22';
      g.beginPath();
      g.moveTo(112, 22);
      g.lineTo(111, 16);
      g.lineTo(133, 16);
      g.lineTo(134, 22);
      g.closePath();
      g.fill();
      vgrad(g, 112, 16, 6, 42, 'rgba(255,255,255,0.16)', 'rgba(255,255,255,0)');
      // A thread of smoke going aft.
      for (const [sx, sy, sr, a] of [[118, 10, 6, 0.3], [104, 4, 8, 0.2], [86, 2, 10, 0.12]] as const) {
        oval(g, sx, sy, sr, sr * 0.7, `rgba(90,86,84,${a})`);
      }
      // Masts fore and aft with a line of signal flags between them.
      g.strokeStyle = '#4a4a50';
      g.lineWidth = 2.6;
      g.beginPath();
      g.moveTo(246, 114);
      g.lineTo(246, 30);
      g.moveTo(40, 122);
      g.lineTo(40, 50);
      g.stroke();
      const flagC = ['#c8322c', '#f2ead8', '#2f5f8f', '#e3a22b', '#2f8a5a', '#c8322c', '#f2ead8', '#2f5f8f'];
      for (let i = 0; i < flagC.length; i++) {
        const t = (i + 0.5) / flagC.length;
        const fx = 246 + (300 - 246) * t;
        const fy = 32 + (112 - 32) * t;
        g.fillStyle = flagC[i]!;
        g.beginPath();
        g.moveTo(fx, fy);
        g.lineTo(fx + 5, fy + 2);
        g.lineTo(fx + 1, fy + 7);
        g.closePath();
        g.fill();
      }
      g.strokeStyle = 'rgba(60,60,64,0.6)';
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(246, 32);
      g.lineTo(300, 112);
      g.stroke();
      // Stern rail: one continuous rail with stanchions, not a ladder.
      g.strokeStyle = '#e9e4d6';
      g.lineWidth = 1.6;
      g.beginPath();
      g.moveTo(h.x0 + 2, h.far - 8);
      g.lineTo(70, h.far - 9);
      g.stroke();
      for (let x = h.x0 + 4; x <= 70; x += 9) {
        g.beginPath();
        g.moveTo(x, h.far - 8.5);
        g.lineTo(x, h.far);
        g.stroke();
      }
    }, 320, 192);
  },
};
