import type { ChapterArt } from './index';
import { dot, oval, rr, shade, softShadow, vgrad } from '../pix';

/**
 * Stand-ins for the props the staging places. The vessels (staging.ts,
 * `vessels`): the launch into Shionoura, the fishing boat that takes you off
 * it, the Kerala country boat, and the coastal steamer into Sicily and back
 * into La Caleta. The art pass paints the real ones under the same kind
 * names and sizes (bow east, anchored on their bottom cell, the hull
 * overhanging the water either side); this set registers FIRST, so any later
 * `make` of the same name replaces these outright. The vessels are
 * deliberately plain: a hull, a deck, a house, one colour line.
 *
 * And Fumi's dinner: `mealtable`, the minshuku's low table laid for the meal
 * her words describe ("a fish grilled whole, pickles the color of stained
 * glass"), a dressing on the hall table while the meal is on.
 */

type Spec = { w: number; h: number; hull: string; deck: string; trim: string; house: string; houseAt: number; mast?: boolean };

function vessel(g: CanvasRenderingContext2D, s: Spec) {
  const { w, h } = s;
  const wl = h - 22; // waterline
  const x0 = 14;
  const x1 = w - 10;
  // The water she sits in.
  oval(g, w / 2, wl + 6, w * 0.46, 9, 'rgba(18,40,58,0.3)');
  // Hull, the near side down to the water; the bow (east) sweeps up.
  g.fillStyle = s.hull;
  g.beginPath();
  g.moveTo(x0, wl - 30);
  g.lineTo(x1 - 22, wl - 30);
  g.quadraticCurveTo(x1, wl - 34, x1 + 4, wl - 40);
  g.quadraticCurveTo(x1 - 8, wl - 6, x1 - 34, wl + 2);
  g.lineTo(x0 + 10, wl + 2);
  g.quadraticCurveTo(x0, wl - 6, x0, wl - 30);
  g.closePath();
  g.fill();
  vgrad(g, x0, wl - 30, x1 - x0, 10, 'rgba(255,250,235,0.18)', 'rgba(0,0,0,0)');
  // The sheer line in somebody's colours.
  g.strokeStyle = s.trim;
  g.lineWidth = 3;
  g.beginPath();
  g.moveTo(x0 + 2, wl - 22);
  g.lineTo(x1 - 24, wl - 22);
  g.quadraticCurveTo(x1 - 4, wl - 26, x1, wl - 32);
  g.stroke();
  // Deck seen from above, between the far rail and the near.
  rr(g, x0 + 4, wl - 46, x1 - x0 - 30, 18, 6, s.deck);
  // The house aft (west), with a window line.
  const hx = x0 + 8 + s.houseAt;
  rr(g, hx, wl - 70, 40, 34, 4, s.house);
  vgrad(g, hx, wl - 70, 40, 8, 'rgba(255,255,255,0.3)', 'rgba(0,0,0,0)');
  for (let i = 0; i < 3; i++) rr(g, hx + 5 + i * 12, wl - 62, 8, 7, 1.5, '#3c4a56');
  if (s.mast) {
    rr(g, hx + 60, wl - 96, 3, 54, 1.5, '#5a4632');
  }
}

export const ART: ChapterArt = {
  grounded: ['boatLaunch', 'boatFishing', 'boatKerala', 'boatFerry'],
  paint(make) {
    make('boatLaunch', 1, (g) => vessel(g, { w: 192, h: 128, hull: '#eef0ec', deck: '#c9c2ad', trim: '#2f5d8a', house: '#f4f1e8', houseAt: 6 }), 192, 128);
    make(
      'boatFishing',
      1,
      (g) => {
        vessel(g, { w: 192, h: 160, hull: '#f1ede2', deck: '#bfae8a', trim: '#b8483a', house: '#e9e4d6', houseAt: 4, mast: true });
        // A tairyo-bata on the mast for the morning she carries you off.
        g.fillStyle = '#d9694a';
        g.fillRect(81, 42, 26, 16);
        g.fillStyle = '#e8d44d';
        g.fillRect(81, 50, 26, 4);
      },
      192,
      160,
    );
    make(
      'boatKerala',
      1,
      (g) => {
        vessel(g, { w: 256, h: 128, hull: '#4a3426', deck: '#8a6a44', trim: '#c9a35f', house: '#6e5138', houseAt: 150 });
        // The woven canopy, a long rounded hood amidships.
        g.fillStyle = '#b89a62';
        g.beginPath();
        g.ellipse(110, 64, 62, 22, 0, Math.PI, 0);
        g.fill();
      },
      256,
      128,
    );
    make('mealtable', 1, (g) => {
      const wood = '#5a3424';
      softShadow(g, 32, 54, 28, 6, 0.2);
      rr(g, 10, 44, 6, 10, 2, shade(wood, -0.2));
      rr(g, 48, 44, 6, 10, 2, shade(wood, -0.2));
      rr(g, 3, 16, 58, 32, 6, wood);
      vgrad(g, 3, 16, 58, 8, 'rgba(255,225,190,0.25)', 'rgba(0,0,0,0)');
      // The long plate and the fish grilled whole on it, head west.
      rr(g, 12, 21, 40, 11, 5, '#e9e4d8');
      g.fillStyle = '#a8703c';
      g.beginPath();
      g.ellipse(31, 26.5, 15, 4.2, 0, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = '#7a4a26';
      g.beginPath();
      g.moveTo(45, 26.5);
      g.lineTo(51, 22.5);
      g.lineTo(51, 30.5);
      g.closePath();
      g.fill();
      for (const x of [24, 30, 36]) {
        g.strokeStyle = 'rgba(60,32,16,0.55)';
        g.lineWidth = 1.2;
        g.beginPath();
        g.moveTo(x, 23.5);
        g.lineTo(x + 2, 29.5);
        g.stroke();
      }
      dot(g, 19, 25.5, 1.1, '#241a12');
      // A wedge of lemon, rice, miso, and the pickles in their stained glass.
      dot(g, 14.5, 29, 2.2, '#e8d44d');
      oval(g, 14, 40, 6, 4.5, '#2c2420');
      oval(g, 14, 39, 4.6, 3, '#f4f1e8');
      oval(g, 30, 40, 6, 4.5, '#6e2f22');
      oval(g, 30, 39, 4.6, 3, '#b8874c');
      oval(g, 46, 40, 5, 3.6, '#e9e4d8');
      dot(g, 44, 39.5, 1.6, '#d9694a');
      dot(g, 47, 39, 1.6, '#e8d44d');
      dot(g, 46.5, 41, 1.5, '#7db35a');
      // Chopsticks on their rest.
      g.strokeStyle = '#2b1c10';
      g.lineWidth = 1.2;
      g.beginPath();
      g.moveTo(53, 33);
      g.lineTo(58, 45);
      g.moveTo(55, 33);
      g.lineTo(60, 45);
      g.stroke();
    });
    // Zanzibar's dawn: a baraza block, a kanga folded on it (its hem saying
    // a cream line), and the ginger cat asleep on the cloth.
    // Drawn as a 64x96 tall prop: the bench where every baraza block is,
    // the cloth and the cat rising above its seat.
    make('pakakanga', 1, (g) => {
      g.translate(0, 32);
      softShadow(g, 32, 40, 26, 7, 0.16);
      const stone = '#e6dcc2';
      rr(g, 4, 16, 56, 22, 3, shade(stone, -0.16));
      rr(g, 2, 8, 60, 14, 4, stone);
      vgrad(g, 2, 8, 60, 5, 'rgba(255,252,240,0.5)', 'rgba(0,0,0,0)');
      // The kanga, folded square: red field, gold border, the hem's words.
      rr(g, 12, 3, 40, 18, 2.5, '#c0392b');
      g.strokeStyle = '#e8b84d';
      g.lineWidth = 2.2;
      g.strokeRect(14.5, 5.5, 35, 13);
      g.fillStyle = '#f2e6d0';
      g.fillRect(17, 15, 30, 1.6);
      dot(g, 32, 10, 2.6, '#1f3a5c');
      // The ginger cat, curled asleep on it.
      const coat = '#c97f42';
      oval(g, 32, 6, 13, 7.5, coat);
      oval(g, 35, 7.5, 7, 4, shade(coat, 0.28));
      g.strokeStyle = shade(coat, -0.14);
      g.lineWidth = 3.4;
      g.beginPath(); g.moveTo(21, 8); g.quadraticCurveTo(30, 15, 43, 9); g.stroke();
      dot(g, 22, 3, 5, coat);
      g.fillStyle = coat;
      g.beginPath(); g.moveTo(17.5, 1.5); g.lineTo(19.5, -2); g.lineTo(22, 1); g.closePath(); g.fill();
      g.beginPath(); g.moveTo(22.5, 0.5); g.lineTo(25, -2); g.lineTo(26.5, 1.5); g.closePath(); g.fill();
      g.strokeStyle = shade(coat, -0.3);
      g.lineWidth = 1.1;
      g.beginPath(); g.moveTo(19, 4); g.lineTo(22.5, 4.5); g.stroke();
    }, 64, 96);
    make('boatFerry', 1, (g) => vessel(g, { w: 320, h: 192, hull: '#2f3a46', deck: '#b7ad94', trim: '#c0392b', house: '#efe9dc', houseAt: 10, mast: true }), 320, 192);
  },
};
