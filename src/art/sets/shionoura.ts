import type { ChapterArt } from './index';
import { floorBed, floorPour, grit } from './floor';
import { blob, dot, oval, rect, rr, shade, softShadow, vgrad, glowSpot } from '../pix';

/**
 * Shionoura's kit: weathered machiya wood, indigo noren, vermilion torii,
 * stone lanterns, Tanabata bamboo, big-catch flags, and the quiet interiors
 * of a minshuku (tatami, dark wood, the genkan's cool stone).
 * Painterly antialiased vector, same idiom as the coast.
 */

const S = 64;

// Local palette: Inland Sea summer.
const WOOD = '#6b5138'; // machiya cedar, sun-darkened
const WOODLIGHT = '#8a6a44';
const PLASTER = '#e8e0cc';
const KAWARA = '#5a6470'; // roof tile grey-blue
const VERMILION = '#b5473a';
const INDIGO = '#33477a';
const BAMBOO = '#6f9b62';
const STONE = '#8c8479';
const PAPERWARM = '#f2e6d0';

/** Tanzaku strip colors: the five Tanabata colors, roughly. */
const TANZAKU = ['#c1512f', '#3f7fb0', '#c9a35f', '#8a4a7d', '#4d7440'];

export const ART: ChapterArt = {
  paint(make) {
    // ---------------------------------------------------------- grounds

    /**
     * Tatami. A tatami floor is not a material, it is a set of objects: each
     * mat was made separately, laid separately, and has been standing in a
     * different amount of sun ever since. The green goes out of the rush from
     * the window end first, which is why the tone ring here is wide. Rooms of
     * flat identical tatami are the giveaway of every game that has ever drawn
     * one; a real eight-mat room is eight slightly different colours.
     */
    make('tatami', 5, (g, r, i) => {
      const base = floorBed(g, r, i, '#cdc292', 0.075);
      // The weave: fine horizontal rush lines, a shade apart.
      for (let y = 3; y < S; y += 5) {
        g.strokeStyle = `rgba(120,105,60,${0.10 + r.next() * 0.06})`;
        g.lineWidth = 1.4;
        g.beginPath();
        g.moveTo(0, y + r.int(2));
        g.lineTo(S, y + r.int(2));
        g.stroke();
      }
      // Rush that has taken the sun goes gold at the tips, unevenly.
      grit(g, r, base, 14, 0.09, 0.6);
      if (r.chance(0.4)) vgrad(g, 0, r.int(S), S, 8, 'rgba(255,250,225,0.10)', 'rgba(0,0,0,0)');
    });

    /** Sixty years of socks, and every board off a different tree. */
    make('floorWood', 5, (g, r, i) => {
      const base = floorPour(g, r, i, '#a6835a', 0.08);
      // Long boards. Sixteen apart, which divides the tile, so a run of cells
      // is one floor and the boards do not step at the seams.
      for (const by of [0, 16, 32, 48]) {
        rect(g, 0, by, S, 15, shade(base, (r.next() - 0.5) * 0.08));
        g.strokeStyle = 'rgba(40,28,16,0.35)';
        g.lineWidth = 1.6;
        g.beginPath();
        g.moveTo(0, by);
        g.lineTo(S, by);
        g.stroke();
        vgrad(g, 0, by, S, 4, 'rgba(255,240,210,0.10)', 'rgba(0,0,0,0)');
      }
      // Grain, and the odd nail head that has come proud again.
      grit(g, r, base, 16, 0.1, 0.7);
      if (r.chance(0.3)) dot(g, r.int(S), r.int(S), 1.6, 'rgba(40,28,16,0.4)');
    });

    /** The genkan's packed earthen-stone floor, a step below the world. */
    make('tataki', 4, (g, r, i) => {
      const base = floorPour(g, r, i, '#a69f92', 0.07);
      // Tataki is lime, earth and brine tamped down: it is aggregate all the
      // way through, so the grain is the point and it is coarser than a floor.
      grit(g, r, base, 26, 0.15, 1.2);
      vgrad(g, 0, 0, S, 10, 'rgba(30,26,22,0.14)', 'rgba(0,0,0,0)');
    });

    // ---------------------------------------------------------- interior

    /**
     * The minshuku's wall, and the whole reason chapter four's interior is not
     * the Andean room in a hat.
     *
     * A machiya wall is two materials with a stick between them: clay plaster
     * above, a cedar koshiita wainscot below, and the nageshi rail dividing
     * them at about shoulder height. Drawing it as one field of dark timber,
     * which is what this used to be, cost the brightest chapter in the game
     * fifty-three points of luminance at its own front door and made Fumi's
     * house the dimmest room a player had seen since the ship.
     *
     * Ten variants, decorated on four. The old four-variant version put a
     * round window or a scroll on every single cell, so the wall of a
     * fisherman's guest house read as a row of buttons.
     */
    make('wallShoji', 10, (g, r, i) => {
      // Clay plaster above: Inland Sea light comes off the water all day and
      // this is the surface in the house that carries it.
      vgrad(g, 0, 0, S, 38, shade(PLASTER, -0.03), shade(PLASTER, -0.12));
      // Straw in the clay, which is what stops jurakukabe reading as paint.
      for (let k = 0; k < 9; k++) {
        const sx = r.next() * S;
        const sy = 4 + r.next() * 30;
        g.strokeStyle = `rgba(150,126,86,${0.10 + r.next() * 0.12})`;
        g.lineWidth = 1;
        g.beginPath();
        g.moveTo(sx, sy);
        g.lineTo(sx + 3 + r.next() * 5, sy + (r.chance(0.5) ? 1 : -1) * r.next() * 2);
        g.stroke();
      }
      // The nageshi rail, and the cedar wainscot under it, dark and oiled.
      rect(g, 0, 36, S, 28, shade(WOOD, -0.08));
      for (let bx = 0; bx < S; bx += 16) {
        rect(g, bx, 36, 15, 28, shade(WOOD, (r.next() - 0.5) * 0.12));
      }
      rect(g, 0, 34, S, 5, WOODLIGHT);
      vgrad(g, 0, 34, S, 2.5, 'rgba(255,238,200,0.34)', 'rgba(0,0,0,0)');
      vgrad(g, 0, 39, S, 5, 'rgba(20,12,6,0.3)', 'rgba(0,0,0,0)');
      // Soot up under the beam: this house burns wood and always has.
      vgrad(g, 0, 0, S, 12, 'rgba(24,16,10,0.22)', 'rgba(0,0,0,0)');
      const deco = i < 4 ? i : -1;
      if (deco === 0) {
        // A shoji panel, paper holding the sea light. Kumiko on the sixteens
        // so a run of panels reads as one screen wall and not four posters.
        rect(g, 0, 12, S, 46, shade(WOOD, -0.28));
        rect(g, 3, 15, S - 6, 40, '#efe6d2');
        glowSpot(g, 32, 34, 26, '#fff4d2', 0.4);
        g.strokeStyle = 'rgba(90,70,45,0.55)';
        g.lineWidth = 1.6;
        for (const lx of [16, 32, 48]) { g.beginPath(); g.moveTo(lx, 15); g.lineTo(lx, 55); g.stroke(); }
        for (const ly of [28, 42]) { g.beginPath(); g.moveTo(3, ly); g.lineTo(S - 3, ly); g.stroke(); }
        // One pane patched with a squarer, newer paper. Every shoji has one.
        if (r.chance(0.6)) rect(g, 17, 29, 14, 12, '#f8f2e2');
      } else if (deco === 1) {
        // A hanging scroll: one brushstroke, probably a fish.
        rr(g, 24, 6, 16, 40, 2, PAPERWARM);
        g.strokeStyle = '#3a4048';
        g.lineWidth = 2.6;
        g.beginPath();
        g.moveTo(28, 18);
        g.quadraticCurveTo(38, 24, 30, 36);
        g.stroke();
        rect(g, 24, 6, 16, 3, '#4a5d63');
        rect(g, 24, 43, 16, 3, '#4a5d63');
      } else if (deco === 2) {
        // A round window onto nothing in particular. Once in ten now, which
        // is roughly how many round windows a house has.
        dot(g, 32, 20, 13, shade(WOOD, -0.3));
        dot(g, 32, 20, 10, '#dce8e4');
        glowSpot(g, 32, 20, 11, '#f6f0d8', 0.5);
      } else if (deco === 3) {
        // Pegs on the nageshi: a straw hat, a towel, a coil of line. The wall
        // of a working house, where things are hung at the height of a hand.
        for (let k = 0; k < 3; k++) dot(g, 14 + k * 18, 33, 2, shade(WOOD, -0.3));
        oval(g, 14, 26, 9, 5, '#c9ae72');
        dot(g, 14, 26, 3.4, shade('#c9ae72', -0.12));
        rr(g, 29, 30, 6, 16, 2, '#5f7d96');
        rect(g, 29, 30, 6, 2.4, '#e8e0cc');
        dot(g, 50, 27, 6, shade('#8a7a52', -0.05));
        dot(g, 50, 27, 3, shade('#8a7a52', 0.1));
      }
    });

    /**
     * A goza: rush matting with a cloth border, the mat you unroll on the
     * boards to sit or to put wet things on. The minshuku's one `mat` cell
     * used to draw the generic Andean-tan woven mat, on a floor that is
     * already rush, in the one room in the game that knows what rush is.
     */
    make('goza', 2, (g, r) => {
      const rush = '#d3c48e';
      rect(g, 0, 0, S, S, shade(rush, (r.next() - 0.5) * 0.05));
      // Finer weave than tatami and running the other way: a goza is a mat
      // laid on a floor, and it has to read as not-the-floor.
      g.strokeStyle = 'rgba(126,106,58,0.22)';
      g.lineWidth = 1.2;
      for (let x = 2; x < S; x += 4) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, S); g.stroke(); }
      // The heri, indigo cloth bound along the long edges. Fixed at the
      // sixteens so a run of cells is one mat with one border down it.
      rect(g, 0, 6, S, 4, INDIGO);
      rect(g, 0, S - 10, S, 4, INDIGO);
      vgrad(g, 0, 6, S, 1.6, 'rgba(255,255,255,0.2)', 'rgba(0,0,0,0)');
      if (r.chance(0.5)) oval(g, r.next() * S, r.next() * S, 12, 6, 'rgba(60,44,24,0.08)');
    });

    make('irori', 1, (g) => {
      // The sunken hearth: a square of embers the house breathes around.
      rr(g, 8, 10, 48, 46, 5, shade(WOOD, -0.18));
      rr(g, 13, 15, 38, 36, 3, '#2b2118');
      oval(g, 32, 33, 14, 10, '#8a8078'); // ash
      for (const [ex, ey] of [[28, 32], [35, 30], [32, 37]] as const) {
        dot(g, ex, ey, 2.6, '#e8862f');
        dot(g, ex, ey, 1.2, '#ffe9ad');
      }
      glowSpot(g, 32, 33, 18, '#ffb35c', 0.4);
      // The kettle hook's shadow falls across one corner.
      g.strokeStyle = 'rgba(20,14,8,0.5)';
      g.lineWidth = 2;
      g.beginPath(); g.moveTo(32, 10); g.lineTo(32, 20); g.stroke();
    });

    make('ofuro', 1, (g) => {
      // A hinoki tub, staves bound in dark hoops, water waiting patiently.
      softShadow(g, 32, 54, 24, 6, 0.18);
      oval(g, 32, 36, 22, 18, shade('#a87f48', -0.08));
      oval(g, 32, 32, 20, 15, '#a87f48');
      oval(g, 32, 30, 16, 11, '#7fb5c9');
      oval(g, 28, 27, 6, 3, 'rgba(240,250,252,0.5)');
      g.strokeStyle = 'rgba(50,36,20,0.5)';
      g.lineWidth = 2;
      for (const hy of [34, 42]) {
        g.beginPath();
        g.ellipse(32, hy, 21, 15, 0, Math.PI * 0.1, Math.PI * 0.9);
        g.stroke();
      }
      // The little stool and bucket, where the actual washing happens.
      rr(g, 4, 44, 12, 8, 2, WOODLIGHT);
      dot(g, 54, 50, 6, '#c9c4bb');
      dot(g, 54, 49, 4.4, '#8fb5c4');
    });

    // ---------------------------------------------------------- flats & talls

    make('noren', 3, (g, r) => {
      // The doorway curtain: open for business, and you walk through it.
      const cloth = [INDIGO, '#7d3f34', '#3c6e64'][r.int(3)] ?? INDIGO;
      rect(g, 6, 2, 52, 4, shade(WOOD, -0.1)); // the rod
      for (let i = 0; i < 3; i++) {
        const px = 8 + i * 17;
        const swing = (r.next() - 0.5) * 4;
        g.fillStyle = shade(cloth, (r.next() - 0.5) * 0.08);
        g.beginPath();
        g.moveTo(px, 6);
        g.lineTo(px + 15, 6);
        g.lineTo(px + 15 + swing, 56);
        g.quadraticCurveTo(px + 8, 60, px + swing, 56);
        g.closePath();
        g.fill();
        vgrad(g, px, 6, 15, 12, 'rgba(255,255,255,0.14)', 'rgba(0,0,0,0)');
      }
      // One white mark on the middle panel: a wave, more or less.
      g.strokeStyle = 'rgba(242,230,208,0.9)';
      g.lineWidth = 2.6;
      g.beginPath();
      g.moveTo(28, 30);
      g.quadraticCurveTo(33, 24, 38, 30);
      g.quadraticCurveTo(33, 36, 28, 30);
      g.stroke();
    }, 64, 96);

    make('torii', 1, (g) => {
      // Vermilion over the steps; you pass beneath, and that is the point.
      softShadow(g, 32, 90, 22, 5, 0.16);
      const post = (x: number) => {
        vgrad(g, x, 18, 7, 72, shade(VERMILION, 0.08), shade(VERMILION, -0.14));
        rect(g, x - 1, 84, 9, 6, STONE);
      };
      post(12);
      post(45);
      // Kasagi: the top beam lifts at the ends.
      g.fillStyle = shade(VERMILION, -0.06);
      g.beginPath();
      g.moveTo(2, 12);
      g.quadraticCurveTo(32, 4, 62, 12);
      g.lineTo(62, 18);
      g.quadraticCurveTo(32, 11, 2, 18);
      g.closePath();
      g.fill();
      rect(g, 2, 6, 60, 3, '#3a3f47'); // the tile cap
      rect(g, 8, 26, 48, 5, shade(VERMILION, -0.02)); // nuki
      rect(g, 29, 12, 6, 14, shade(VERMILION, -0.1)); // gakuzuka
    }, 64, 96);

    make('ishidoro', 2, (g, r) => {
      // A stone lantern; someone still lights it.
      softShadow(g, 32, 90, 18, 5, 0.2);
      const st = shade(STONE, (r.next() - 0.5) * 0.06);
      rr(g, 20, 78, 24, 10, 3, shade(st, -0.1)); // base
      rect(g, 28, 52, 8, 28, st); // shaft
      rr(g, 18, 44, 28, 10, 3, shade(st, 0.04)); // platform
      // The fire box, warm.
      rr(g, 22, 26, 20, 20, 3, shade(st, -0.04));
      rr(g, 26, 30, 12, 12, 2, '#f6d98a');
      glowSpot(g, 32, 36, 14, '#ffdf9a', 0.6);
      // The kasa roof and its knob.
      g.fillStyle = shade(st, 0.08);
      g.beginPath();
      g.moveTo(10, 26);
      g.quadraticCurveTo(32, 12, 54, 26);
      g.lineTo(46, 30);
      g.lineTo(18, 30);
      g.closePath();
      g.fill();
      dot(g, 32, 12, 4, shade(st, 0.1));
      if (r.chance(0.5)) dot(g, 24, 60, 3, '#6f9b62'); // moss
    }, 64, 96);

    const paintBamboo = (g: CanvasRenderingContext2D, r: { next(): number; int(n: number): number; chance(p: number): boolean }, wishes: boolean) => {
      softShadow(g, 32, 90, 16, 5, 0.14);
      for (let i = 0; i < 4; i++) {
        const x0 = 18 + i * 10 + r.int(5);
        const lean = (r.next() - 0.5) * 14;
        const col = shade(i % 2 ? BAMBOO : '#4d7440', (r.next() - 0.5) * 0.08);
        g.strokeStyle = col;
        g.lineWidth = 3.4;
        g.lineCap = 'round';
        g.beginPath();
        g.moveTo(x0, 90);
        g.quadraticCurveTo(x0 + lean * 0.4, 45, x0 + lean, 6);
        g.stroke();
        // Nodes.
        g.strokeStyle = shade(col, -0.2);
        g.lineWidth = 1.4;
        for (const ny of [70, 50, 30]) {
          g.beginPath();
          g.moveTo(x0 + lean * (1 - ny / 90) - 3, ny);
          g.lineTo(x0 + lean * (1 - ny / 90) + 3, ny);
          g.stroke();
        }
      }
      // Leaf strokes near the top.
      for (let i = 0; i < 8; i++) {
        const lx = 14 + r.int(36);
        const ly = 4 + r.int(26);
        oval(g, lx, ly, 6, 1.8, shade(BAMBOO, (r.next() - 0.5) * 0.12), (r.next() - 0.5) * 1.6);
      }
      if (wishes) {
        for (let i = 0; i < 5; i++) {
          const tx = 14 + r.int(34);
          const ty = 18 + r.int(44);
          g.strokeStyle = 'rgba(242,230,208,0.7)';
          g.lineWidth = 1;
          g.beginPath(); g.moveTo(tx + 3, ty - 5); g.lineTo(tx + 3, ty); g.stroke();
          g.save();
          g.translate(tx + 3, ty);
          g.rotate((r.next() - 0.5) * 0.5);
          rr(g, -3, 0, 7, 14, 1, TANZAKU[r.int(5)] ?? '#c1512f');
          g.restore();
        }
      }
    };

    make('bamboo', 2, (g, r) => paintBamboo(g, r, false), 64, 96);
    make('bambooWish', 3, (g, r) => paintBamboo(g, r, true), 64, 96);

    make('tairyobata', 3, (g, r) => {
      // Big-catch flags, up for the festival. Loud on purpose.
      softShadow(g, 32, 90, 14, 4, 0.16);
      g.strokeStyle = '#5c4630';
      g.lineWidth = 3;
      g.beginPath(); g.moveTo(10, 90); g.lineTo(10, 4); g.stroke();
      const schemes = [
        ['#c1512f', '#f2e6d0', '#3f7fb0'],
        ['#c9a35f', '#b5473a', '#f2e6d0'],
        ['#3f7fb0', '#f2e6d0', '#c1512f'],
      ];
      const [a, b, c] = schemes[r.int(3)] ?? ['#c1512f', '#f2e6d0', '#3f7fb0'];
      // The flag, bellying in the sea wind.
      g.fillStyle = a ?? '#c1512f';
      g.beginPath();
      g.moveTo(12, 8);
      g.lineTo(58, 12);
      g.quadraticCurveTo(62, 30, 58, 50);
      g.lineTo(12, 54);
      g.closePath();
      g.fill();
      // A rising sun and a wave band.
      dot(g, 42, 22, 8, b ?? '#f2e6d0');
      g.fillStyle = c ?? '#3f7fb0';
      g.beginPath();
      g.moveTo(12, 42);
      g.quadraticCurveTo(24, 36, 34, 42);
      g.quadraticCurveTo(46, 48, 58, 42);
      g.lineTo(58, 50);
      g.lineTo(12, 54);
      g.closePath();
      g.fill();
      // The fish, white and emphatic.
      oval(g, 28, 28, 9, 4.5, b ?? '#f2e6d0', -0.2);
      g.fillStyle = b ?? '#f2e6d0';
      g.beginPath();
      g.moveTo(36, 26); g.lineTo(42, 22); g.lineTo(42, 32); g.closePath();
      g.fill();
      dot(g, 22, 27, 1.2, '#2b2118');
    }, 64, 96);

    make('chochin', 2, (g, r) => {
      // A paper lantern on its pole, ribs showing through the glow.
      softShadow(g, 32, 90, 14, 4, 0.16);
      g.strokeStyle = '#4a3a2c';
      g.lineWidth = 3;
      g.beginPath(); g.moveTo(30, 90); g.lineTo(30, 14); g.stroke();
      g.beginPath(); g.moveTo(30, 16); g.lineTo(42, 20); g.stroke();
      const ly = 24;
      glowSpot(g, 42, ly + 16, 22, '#ffcf8a', 0.5);
      oval(g, 42, ly + 16, 11, 15, PAPERWARM);
      oval(g, 42, ly + 16, 11, 15, 'rgba(255,190,110,0.25)');
      rect(g, 34, ly, 16, 4, r.chance(0.5) ? VERMILION : '#3a4048');
      rect(g, 34, ly + 29, 16, 4, '#3a4048');
      g.strokeStyle = 'rgba(150,110,70,0.5)';
      g.lineWidth = 1.2;
      for (let i = 1; i < 5; i++) {
        g.beginPath();
        g.ellipse(42, ly + 16, 11, 15, 0, 0, Math.PI * 2);
        g.stroke();
        g.beginPath();
        g.moveTo(31, ly + 4 + i * 5);
        g.lineTo(53, ly + 4 + i * 5);
        g.stroke();
      }
    }, 64, 96);

    /**
     * A shop hisashi: the cloth awning a shotengai frontage puts out over the
     * pavement. Three variants at three heights and three ages, because the
     * families who hung them did not consult one another about it.
     */
    make('hisashi', 3, (g, r, i) => {
      const drop = [10, 0, 20][i % 3] as number; // how low this one is slung
      const cloth = [INDIGO, '#b5844a', '#6d7f5e'][i % 3] as string;
      const top = 22 + drop;
      softShadow(g, 32, 90, 22, 5, 0.14);
      // The frame: two steel arms off the shopfront, and their feet.
      g.strokeStyle = '#4a4238';
      g.lineWidth = 3;
      for (const px of [10, 54]) {
        g.beginPath();
        g.moveTo(px, top + 4);
        g.lineTo(px, 88);
        g.stroke();
        g.beginPath();
        g.moveTo(px, top + 10);
        g.lineTo(px + (px < 32 ? 8 : -8), top + 2);
        g.stroke();
      }
      // The cloth, stretched and sagging in the middle.
      g.fillStyle = shade(cloth, (r.next() - 0.5) * 0.06);
      g.beginPath();
      g.moveTo(4, top);
      g.quadraticCurveTo(32, top - 5, 60, top);
      g.lineTo(60, top + 15);
      g.quadraticCurveTo(32, top + 21, 4, top + 15);
      g.closePath();
      g.fill();
      vgrad(g, 4, top - 4, 56, 8, 'rgba(255,250,240,0.24)', 'rgba(0,0,0,0)');
      // The valance, hand-lettered by somebody's uncle.
      rect(g, 5, top + 14, 54, 9, shade(cloth, -0.16));
      g.fillStyle = 'rgba(244,238,222,0.85)';
      for (let k = 0; k < 3; k++) rect(g, 14 + k * 13, top + 16, 7, 5, 'rgba(244,238,222,0.8)');
      // Sun-bleach down the seaward half, and a patched corner.
      vgrad(g, 34, top, 26, 15, 'rgba(255,252,244,0.18)', 'rgba(255,252,244,0.02)');
      if (i % 3 === 2) rect(g, 44, top + 2, 12, 7, shade(cloth, 0.22));
      // What lives under it: a crate of produce, or nothing at all.
      if (i % 3 !== 1) {
        rr(g, 16, 66, 30, 18, 2, WOODLIGHT);
        rect(g, 16, 71, 30, 2, 'rgba(60,44,28,0.3)');
        for (let k = 0; k < 4; k++) dot(g, 21 + k * 7, 65, 3.4, k % 2 ? '#c05a3a' : '#7f9b4e');
      }
    }, 64, 96);

    make('postbox', 1, (g) => {
      // The round red pillar box, patient as a shrine.
      softShadow(g, 32, 90, 16, 5, 0.18);
      rect(g, 26, 74, 12, 14, '#7a5f45');
      vgrad(g, 20, 30, 24, 46, shade(VERMILION, 0.1), shade(VERMILION, -0.1));
      oval(g, 32, 30, 12, 6, shade(VERMILION, 0.16));
      oval(g, 32, 24, 13, 5, shade(VERMILION, -0.04)); // cap
      dot(g, 32, 20, 3, shade(VERMILION, -0.1));
      rect(g, 25, 38, 14, 3.4, '#2b2118'); // the slot
      rr(g, 24, 48, 16, 10, 2, PAPERWARM); // collection plate
      g.strokeStyle = 'rgba(60,40,25,0.5)';
      g.lineWidth = 1.2;
      g.beginPath(); g.moveTo(27, 53); g.lineTo(37, 53); g.stroke();
    }, 64, 96);

    make('yatai', 1, (g) => {
      // The kingyo-sukui stall: striped awning, one tub of orange commas.
      softShadow(g, 32, 90, 26, 6, 0.2);
      // Legs and counter.
      g.strokeStyle = '#5c4630';
      g.lineWidth = 3;
      for (const lx of [8, 56]) {
        g.beginPath(); g.moveTo(lx, 88); g.lineTo(lx, 40); g.stroke();
      }
      rr(g, 4, 56, 56, 12, 3, WOODLIGHT);
      vgrad(g, 4, 56, 56, 4, 'rgba(255,240,210,0.2)', 'rgba(0,0,0,0)');
      // The tub of goldfish.
      oval(g, 32, 52, 20, 8, '#4e8fa6');
      oval(g, 32, 51, 17, 6, '#7fb5c9');
      for (const [fx, fy] of [[24, 50], [34, 52], [40, 49]] as const) {
        oval(g, fx, fy, 3, 1.6, '#e8862f', 0.3);
      }
      // Awning, red and white, slightly festive even asleep.
      g.fillStyle = VERMILION;
      g.beginPath();
      g.moveTo(2, 26);
      g.quadraticCurveTo(32, 18, 62, 26);
      g.lineTo(62, 40);
      g.lineTo(2, 40);
      g.closePath();
      g.fill();
      for (const sx of [10, 26, 42]) rect(g, sx, 27, 8, 13, PAPERWARM);
      // A paper sign: a fish, drawn by somebody's nephew.
      rr(g, 44, 42, 14, 12, 2, PAPERWARM);
      oval(g, 51, 48, 4, 2.2, '#e8862f', 0.2);
    }, 64, 96);

    make('keitruck', 1, (g) => {
      // The white kei truck, backed onto the sand, engine ticking as it cools.
      softShadow(g, 64, 84, 46, 8, 0.2);
      // Wheels.
      dot(g, 34, 78, 9, '#2b2823');
      dot(g, 34, 78, 3.4, '#9aa0a6');
      dot(g, 94, 78, 9, '#2b2823');
      dot(g, 94, 78, 3.4, '#9aa0a6');
      // Bed with crates and a blue tarp.
      rr(g, 12, 56, 62, 22, 3, '#dfe3e6');
      rr(g, 16, 44, 24, 14, 2, '#9b7a50');
      rr(g, 42, 40, 26, 18, 3, '#3f7fb0');
      g.strokeStyle = 'rgba(255,255,255,0.4)';
      g.lineWidth = 1.6;
      g.beginPath(); g.moveTo(44, 46); g.lineTo(66, 50); g.stroke();
      // Cab.
      rr(g, 74, 40, 40, 38, 5, '#eef0ee');
      rr(g, 78, 44, 26, 16, 3, '#8fb5c4');
      vgrad(g, 78, 44, 26, 8, 'rgba(255,255,255,0.5)', 'rgba(0,0,0,0)');
      rr(g, 108, 60, 6, 8, 2, '#f6d98a'); // headlight
      rect(g, 12, 76, 102, 4, 'rgba(60,60,58,0.5)'); // rocker shadow
    }, 128, 96);

    make('ebisudo', 1, (g) => {
      // The little Ebisu hall: rope, paper zigzags, a god who likes fish.
      softShadow(g, 64, 90, 42, 8, 0.2);
      // Stone base and steps.
      rr(g, 30, 78, 68, 12, 3, shade(STONE, -0.06));
      rr(g, 52, 84, 24, 8, 2, shade(STONE, 0.04));
      // Hall.
      vgrad(g, 38, 42, 52, 38, shade(WOOD, 0.04), shade(WOOD, -0.12));
      rr(g, 54, 52, 20, 26, 2, shade(WOOD, -0.3)); // the doors
      g.strokeStyle = 'rgba(30,20,12,0.5)';
      g.lineWidth = 1.6;
      g.beginPath(); g.moveTo(64, 52); g.lineTo(64, 78); g.stroke();
      // Offering box.
      rr(g, 44, 70, 12, 9, 2, shade(WOODLIGHT, -0.08));
      // Roof, gabled, generous eaves.
      g.fillStyle = KAWARA;
      g.beginPath();
      g.moveTo(26, 44);
      g.lineTo(64, 22);
      g.lineTo(102, 44);
      g.lineTo(94, 48);
      g.lineTo(64, 32);
      g.lineTo(34, 48);
      g.closePath();
      g.fill();
      rect(g, 60, 18, 8, 6, shade(KAWARA, -0.1));
      // Shimenawa rope with shide zigzags.
      g.strokeStyle = '#c9b48a';
      g.lineWidth = 4;
      g.beginPath();
      g.moveTo(38, 48);
      g.quadraticCurveTo(64, 56, 90, 48);
      g.stroke();
      g.strokeStyle = PAPERWARM;
      g.lineWidth = 2;
      for (const zx of [48, 64, 80]) {
        g.beginPath();
        g.moveTo(zx, 52);
        g.lineTo(zx - 3, 57);
        g.lineTo(zx + 2, 60);
        g.stroke();
      }
      // The bell rope.
      g.strokeStyle = '#a0563c';
      g.lineWidth = 2.6;
      g.beginPath(); g.moveTo(64, 40); g.lineTo(64, 52); g.stroke();
      dot(g, 64, 40, 3.4, '#c9a35f');
    }, 128, 96);

    // ------------------------------------------------- the love pass: flats

    make('koke', 3, (g, r) => {
      // Moss on the stone steps: the edges upholstered, the middle argued
      // bare by feet. Soft decor; no ink, no shadow.
      for (let i = 0; i < 8; i++) {
        const a = r.next() * Math.PI * 2;
        const rad = 21 + r.int(10);
        const mx = 32 + Math.cos(a) * rad;
        const my = 32 + Math.sin(a) * rad;
        oval(g, mx, my, 5 + r.int(5), 3 + r.int(3), `rgba(104,132,72,${0.3 + r.next() * 0.25})`, (r.next() - 0.5) * 1.2);
      }
      for (let i = 0; i < 6; i++) {
        const a = r.next() * Math.PI * 2;
        const rad = 20 + r.int(11);
        dot(g, 32 + Math.cos(a) * rad, 32 + Math.sin(a) * rad, 1 + r.next(), 'rgba(74,100,52,0.4)');
      }
    });

    make('kaigara', 4, (g, r) => {
      // The tide's small change: shells, and sometimes sea glass.
      const n = 3 + r.int(3);
      for (let i = 0; i < n; i++) {
        const sx = 10 + r.int(44);
        const sy = 10 + r.int(44);
        const c = r.chance(0.3) ? '#e8c9c4' : '#efe8da';
        oval(g, sx, sy, 3 + r.next() * 2, 2.2 + r.next(), c, r.next() * 3);
        dot(g, sx, sy + 1, 0.9, 'rgba(120,100,88,0.4)');
      }
      if (r.chance(0.4)) dot(g, 12 + r.int(40), 12 + r.int(40), 2.2, 'rgba(110,180,190,0.8)');
    });

    make('getarow', 2, (g, r) => {
      // Footwear at the genkan edge, toes pointed out the door. No ink.
      const cols = ['#8a6a44', '#5c4630', '#9b3f35'];
      for (let i = 0; i < 3; i++) {
        const bx = 8 + i * 18 + r.int(3);
        const col = shade(cols[i] ?? '#8a6a44', (r.next() - 0.5) * 0.06);
        for (const dx of [0, 8]) {
          const by = 22 + r.int(3);
          rr(g, bx + dx, by, 6, 20, 3, col);
          vgrad(g, bx + dx, by, 6, 5, 'rgba(255,240,210,0.2)', 'rgba(0,0,0,0)');
          g.strokeStyle = 'rgba(40,28,16,0.55)';
          g.lineWidth = 1.3;
          g.beginPath();
          g.moveTo(bx + dx + 3, by + 4);
          g.lineTo(bx + dx + (dx ? 5 : 1), by + 11);
          g.stroke();
        }
      }
    });

    make('zabuton', 3, (g, r) => {
      // Floor cushions, thick and slightly sat-out-of-shape. No ink: they
      // belong to the mat the way a footprint belongs to sand.
      const cloths = ['#7d3f34', '#33477a', '#5c6e4a'];
      const c = shade(cloths[r.int(cloths.length)] ?? '#7d3f34', (r.next() - 0.5) * 0.08);
      const cx = 32 + (r.next() - 0.5) * 6;
      const cy = 36 + (r.next() - 0.5) * 5;
      const rot = (r.next() - 0.5) * 0.5;
      softShadow(g, cx, cy + 10, 20, 6, 0.14);
      g.save();
      g.translate(cx, cy);
      g.rotate(rot);
      // The pad: a squarish cushion with corners that have given up.
      rr(g, -21, -14, 42, 28, 9, c);
      vgrad(g, -21, -14, 42, 12, 'rgba(255,244,220,0.16)', 'rgba(0,0,0,0)');
      rr(g, -21, 6, 42, 8, 8, shade(c, -0.14));
      // The seam that runs round the edge, and the tuft at the middle.
      g.strokeStyle = shade(c, 0.2);
      g.lineWidth = 1.4;
      g.beginPath();
      g.roundRect(-17, -10, 34, 20, 7);
      g.stroke();
      dot(g, 0, -1, 2.4, shade(c, 0.3));
      // The dent where somebody sat, off-centre because people are.
      oval(g, 3 + (r.next() - 0.5) * 5, 0, 11, 6, 'rgba(30,22,14,0.10)');
      g.restore();
    });

    make('ukidama', 2, (g, r) => {
      // Glass floats in a net bag: bottled sea, retired with honors.
      softShadow(g, 32, 52, 20, 6, 0.18);
      for (const [bx, by, br] of [[24, 40, 11], [42, 42, 10], [33, 28, 9]] as const) {
        dot(g, bx, by, br, shade('#4f7f6a', (r.next() - 0.5) * 0.1));
        dot(g, bx - br * 0.35, by - br * 0.35, br * 0.3, 'rgba(220,245,235,0.55)');
      }
      g.strokeStyle = 'rgba(90,70,46,0.6)';
      g.lineWidth = 1.4;
      for (let i = -2; i <= 2; i++) {
        g.beginPath();
        g.moveTo(33 + i * 3, 16);
        g.quadraticCurveTo(33 + i * 12, 36, 33 + i * 9, 52);
        g.stroke();
      }
      for (const ny of [30, 40]) {
        g.beginPath();
        g.moveTo(14, ny);
        g.quadraticCurveTo(33, ny + 6, 52, ny);
        g.stroke();
      }
      dot(g, 33, 15, 3, '#8a6a44'); // the knot
    });

    make('mikanbako', 2, (g, r) => {
      // Setoda crates on summer duty: juice and jelly until the fruit wakes.
      softShadow(g, 32, 56, 22, 6, 0.18);
      const crate = (x: number, y: number, w: number, h: number) => {
        rr(g, x, y, w, h, 2, shade('#b08b58', (r.next() - 0.5) * 0.08));
        vgrad(g, x, y, w, 5, 'rgba(255,240,210,0.18)', 'rgba(0,0,0,0)');
        g.strokeStyle = 'rgba(60,40,22,0.5)';
        g.lineWidth = 1.6;
        for (const ly of [y + h * 0.38, y + h * 0.72]) {
          g.beginPath();
          g.moveTo(x + 2, ly);
          g.lineTo(x + w - 2, ly);
          g.stroke();
        }
      };
      crate(10, 32, 40, 24);
      crate(16, 12, 34, 22); // stacked slightly off, like real life
      // The stencil: one mikan, and rough brush marks beside it.
      dot(g, 30, 22, 5, '#e8862f');
      oval(g, 30, 17.5, 2.2, 1.2, '#4d7440', 0.3);
      g.strokeStyle = 'rgba(60,40,22,0.75)';
      g.lineWidth = 1.6;
      g.beginPath();
      g.moveTo(38, 19); g.lineTo(45, 19);
      g.moveTo(41.5, 16); g.lineTo(41.5, 25);
      g.moveTo(20, 42); g.lineTo(28, 42);
      g.moveTo(20, 47); g.lineTo(26, 47);
      g.stroke();
    });

    make('jitensha', 2, (g, r) => {
      // The granny bike: basket, bell, kickstand, no lock.
      softShadow(g, 32, 56, 24, 5, 0.16);
      const frame = r.chance(0.5) ? '#5d4a63' : '#3c6e64';
      g.strokeStyle = '#3a3f47';
      g.lineWidth = 2.2;
      for (const wx of [16, 48]) {
        g.beginPath();
        g.arc(wx, 44, 11, 0, Math.PI * 2);
        g.stroke();
        dot(g, wx, 44, 1.8, '#3a3f47');
      }
      g.strokeStyle = frame;
      g.lineWidth = 2.6;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(16, 44); g.lineTo(30, 30); g.lineTo(44, 30); g.lineTo(48, 44);
      g.moveTo(30, 30); g.lineTo(34, 44); g.lineTo(16, 44);
      g.stroke();
      g.beginPath(); g.moveTo(44, 30); g.lineTo(46, 22); g.stroke(); // stem
      g.beginPath(); g.moveTo(30, 30); g.lineTo(27, 24); g.stroke(); // seatpost
      g.strokeStyle = '#8a9096';
      g.lineWidth = 1.8;
      g.beginPath(); g.moveTo(34, 44); g.lineTo(37, 52); g.stroke(); // kickstand
      rr(g, 22, 21, 10, 4, 2, '#2b2118'); // saddle
      rr(g, 43, 17, 14, 11, 2, '#a8845c'); // the basket
      g.strokeStyle = 'rgba(40,28,16,0.5)';
      g.lineWidth = 1;
      for (const lx of [46, 49.5, 53]) {
        g.beginPath(); g.moveTo(lx, 18); g.lineTo(lx, 27); g.stroke();
      }
      g.beginPath(); g.moveTo(44, 21); g.lineTo(56, 21); g.moveTo(44, 24.5); g.lineTo(56, 24.5); g.stroke();
      dot(g, 42, 24, 1.7, '#c9c4bb'); // the bell
    });

    make('ittokan', 2, (g, r) => {
      // An 18-liter kerosene can, reassigned to hydrangeas.
      softShadow(g, 32, 58, 16, 5, 0.18);
      vgrad(g, 18, 30, 28, 28, shade('#7d8894', 0.06), shade('#7d8894', -0.08));
      rect(g, 18, 30, 28, 3.5, shade('#7d8894', 0.14));
      g.strokeStyle = 'rgba(70,80,90,0.4)';
      g.lineWidth = 1;
      g.beginPath(); g.moveTo(32, 34); g.lineTo(32, 57); g.stroke(); // the seam
      for (let i = 0; i < 4; i++) {
        dot(g, 19 + r.int(26), 35 + r.int(21), 1.3 + r.next(), 'rgba(150,84,44,0.5)');
      }
      for (const [hx, hy, hr, hc] of [[24, 22, 8, '#7f8fc4'], [38, 20, 9, '#9b86bd'], [31, 27, 7, '#6f9fc9']] as const) {
        for (let i = 0; i < 10; i++) {
          const a = r.next() * Math.PI * 2;
          const rad = Math.sqrt(r.next()) * hr;
          dot(g, hx + Math.cos(a) * rad, hy + Math.sin(a) * rad * 0.8, 2.2, shade(hc, (r.next() - 0.5) * 0.16));
        }
      }
      oval(g, 21, 30, 5, 2.5, '#4d7440', 0.4);
      oval(g, 43, 29, 5, 2.5, '#5a8a50', -0.3);
    });

    make('ajisai', 3, (g, r) => {
      // Hydrangeas: tsuyu is a tiresome guest, but it pays rent in flowers.
      softShadow(g, 32, 56, 20, 6, 0.16);
      blob(g, 32, 43, 15, '#48663f', r, 0.28);
      blob(g, 19, 47, 8, '#3f5c38', r, 0.3);
      blob(g, 46, 46, 8, '#42603c', r, 0.3);
      for (const [hx, hy, hr, hc] of [[20, 33, 9, '#7f8fc4'], [36, 27, 10, '#8f7fc0'], [46, 37, 8, '#6f9fc9'], [29, 41, 7, '#8aa3d4']] as const) {
        for (let i = 0; i < 14; i++) {
          const a = r.next() * Math.PI * 2;
          const rad = Math.sqrt(r.next()) * hr;
          dot(g, hx + Math.cos(a) * rad, hy + Math.sin(a) * rad * 0.85, 2.4, shade(hc, (r.next() - 0.5) * 0.18));
        }
        dot(g, hx - hr * 0.3, hy - hr * 0.3, 2, shade(hc, 0.22));
      }
    });

    // ------------------------------------------------- the love pass: cats

    make('nekoloaf', 2, (g, r) => {
      // The quay supervisor, in full loaf formation.
      softShadow(g, 32, 52, 18, 5, 0.16);
      const coat = '#ece5d8';
      oval(g, 30, 42, 17, 11, coat); // the loaf
      dot(g, 45, 36, 8, coat); // head
      oval(g, 23, 38, 7, 5, '#d98a4a', 0.4); // calico patches
      oval(g, 35, 46, 6, 4, '#3a3430', -0.3);
      oval(g, 48, 31, 3.5, 3, '#d98a4a', 0.2);
      g.fillStyle = coat;
      g.beginPath(); g.moveTo(39, 32); g.lineTo(41, 25); g.lineTo(44, 31); g.closePath(); g.fill();
      g.beginPath(); g.moveTo(46, 30); g.lineTo(49, 24); g.lineTo(51, 31); g.closePath(); g.fill();
      g.strokeStyle = '#3a3430';
      g.lineWidth = 1.2;
      g.lineCap = 'round';
      g.beginPath(); // eyes at half mast
      g.moveTo(41.5, 36); g.lineTo(44, 36.5);
      g.moveTo(47.5, 36.5); g.lineTo(50, 36);
      g.stroke();
      dot(g, 45.5, 39, 0.9, '#b06a52'); // nose
      g.strokeStyle = '#d98a4a';
      g.lineWidth = 3.4;
      g.beginPath(); g.moveTo(14, 43); g.quadraticCurveTo(22, 52, 34, 50); g.stroke(); // tail, stowed
      if (r.chance(0.5)) dot(g, 30, 38, 1.1, 'rgba(58,52,48,0.5)'); // one extra spot
    });

    make('nekoboss', 1, (g) => {
      // Kacho. The section chief of the fish stall.
      softShadow(g, 32, 58, 16, 5, 0.18);
      const coat = '#8a8078';
      oval(g, 32, 43, 13, 15, coat); // seated bulk
      oval(g, 32, 48, 6, 8, '#ece5d8'); // chest
      g.strokeStyle = shade(coat, -0.22); // tabby stripes
      g.lineWidth = 2;
      g.lineCap = 'round';
      for (const sy of [34, 39, 44]) {
        g.beginPath();
        g.moveTo(22, sy);
        g.quadraticCurveTo(32, sy + 3, 42, sy);
        g.stroke();
      }
      dot(g, 32, 22, 9.5, coat); // the head
      g.fillStyle = coat;
      g.beginPath(); g.moveTo(23, 18); g.lineTo(24, 9); g.lineTo(30, 14); g.closePath(); g.fill();
      g.beginPath(); g.moveTo(34, 14); g.lineTo(40, 9); g.lineTo(41, 18); g.closePath(); g.fill();
      g.save(); // the left ear's notch: an old negotiation
      g.globalCompositeOperation = 'destination-out';
      dot(g, 24.5, 10.5, 2.4, '#000');
      g.restore();
      dot(g, 28.5, 21, 1.7, '#d9a441'); // amber eyes
      dot(g, 35.5, 21, 1.7, '#d9a441');
      dot(g, 28.5, 21, 0.7, '#2b2118');
      dot(g, 35.5, 21, 0.7, '#2b2118');
      dot(g, 32, 25, 1, '#b06a52');
      g.strokeStyle = 'rgba(236,229,216,0.8)';
      g.lineWidth = 0.9;
      g.beginPath();
      g.moveTo(24, 24); g.lineTo(14, 22.5);
      g.moveTo(24, 26); g.lineTo(15, 27);
      g.moveTo(40, 24); g.lineTo(50, 22.5);
      g.moveTo(40, 26); g.lineTo(49, 27);
      g.stroke();
      g.strokeStyle = shade(coat, -0.12); // the tail, wrapped like an audit
      g.lineWidth = 4;
      g.beginPath(); g.moveTo(44, 52); g.quadraticCurveTo(52, 54, 50, 44); g.stroke();
    });

    make('nekonap', 2, (g, r) => {
      // The afternoon shift, under the bench, technically on duty.
      softShadow(g, 32, 50, 16, 5, 0.14);
      const coat = '#3a3430';
      oval(g, 32, 42, 16, 10, coat); // the curl
      dot(g, 42, 38, 6.5, coat); // head tucked toward the tail
      g.fillStyle = coat;
      g.beginPath(); g.moveTo(38, 33); g.lineTo(39, 28); g.lineTo(43, 32); g.closePath(); g.fill();
      g.beginPath(); g.moveTo(44, 32); g.lineTo(47, 28.5); g.lineTo(48, 33.5); g.closePath(); g.fill();
      oval(g, 27, 48, 5, 2.5, '#ece5d8', 0.2); // one white sock, deployed
      if (r.chance(0.6)) oval(g, 38, 49, 4, 2.2, '#ece5d8', -0.2); // sometimes two
      g.strokeStyle = shade(coat, 0.28);
      g.lineWidth = 3.6;
      g.lineCap = 'round';
      g.beginPath(); g.moveTo(18, 44); g.quadraticCurveTo(28, 50, 40, 44); g.stroke(); // tail over nose
      g.strokeStyle = '#8a8078';
      g.lineWidth = 1;
      g.beginPath(); g.moveTo(43, 38.5); g.lineTo(45.5, 38.8); g.stroke(); // the closed eye
    });

    // ------------------------------------------------- the love pass: talls

    make('jizo', 2, (g, r) => {
      // The steps' smallest guardian, dressed warmly by somebody, every year.
      softShadow(g, 32, 90, 16, 5, 0.2);
      const st = shade(STONE, (r.next() - 0.5) * 0.05);
      rr(g, 18, 80, 28, 8, 2, shade(st, -0.1)); // plinth
      g.fillStyle = st; // the body, a soft standing stone
      g.beginPath();
      g.moveTo(22, 82);
      g.quadraticCurveTo(20, 58, 32, 52);
      g.quadraticCurveTo(44, 58, 42, 82);
      g.closePath();
      g.fill();
      dot(g, 32, 46, 9, st); // head
      g.fillStyle = '#b5473a'; // the knitted cap
      g.beginPath();
      g.arc(32, 45, 9.6, Math.PI, Math.PI * 2);
      g.closePath();
      g.fill();
      dot(g, 32, 35.5, 2.2, '#b5473a');
      g.fillStyle = '#b5473a'; // and the bib
      g.beginPath();
      g.moveTo(24, 55); g.lineTo(40, 55); g.lineTo(32, 68);
      g.closePath();
      g.fill();
      g.strokeStyle = 'rgba(255,220,205,0.4)'; // knit rows
      g.lineWidth = 0.9;
      for (const ky of [58, 61, 64]) {
        const kw = (68 - ky) * 0.6;
        g.beginPath();
        g.moveTo(32 - kw, ky);
        g.lineTo(32 + kw, ky);
        g.stroke();
      }
      g.strokeStyle = 'rgba(58,52,48,0.65)'; // the serene face
      g.lineWidth = 1;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(28, 47); g.quadraticCurveTo(29.4, 48.2, 30.8, 47);
      g.moveTo(33.2, 47); g.quadraticCurveTo(34.6, 48.2, 36, 47);
      g.moveTo(30.5, 51); g.quadraticCurveTo(32, 52.2, 33.5, 51);
      g.stroke();
      dot(g, 25, 78, 2.6, '#e8862f'); // a mikan jelly cup, the going rate
      rr(g, 37, 75, 5, 4, 1, '#c9c4bb'); // and a teacup
      if (r.chance(0.6)) dot(g, 20, 84, 2.4, '#6f9b62'); // moss at his feet
    }, 64, 96);

    make('ema', 2, (g, r) => {
      // The wish rack: small wooden plaques, heavy cargo.
      softShadow(g, 32, 90, 20, 5, 0.18);
      for (const px of [11, 51]) {
        vgrad(g, px - 2, 34, 5, 54, shade(WOOD, 0.02), shade(WOOD, -0.16));
      }
      g.fillStyle = KAWARA; // a tiny tiled cap, taken seriously
      g.beginPath();
      g.moveTo(3, 34); g.lineTo(32, 24); g.lineTo(61, 34);
      g.lineTo(57, 38); g.lineTo(32, 30); g.lineTo(7, 38);
      g.closePath();
      g.fill();
      for (const ry of [46, 66]) {
        rect(g, 9, ry, 46, 3, shade(WOOD, -0.1));
        for (let i = 0; i < 4; i++) {
          const ex = 11 + i * 11 + r.int(2);
          g.strokeStyle = 'rgba(160,60,50,0.8)';
          g.lineWidth = 1;
          g.beginPath(); g.moveTo(ex + 4.5, ry + 3); g.lineTo(ex + 4.5, ry + 7); g.stroke();
          g.fillStyle = shade('#d9b57f', (r.next() - 0.5) * 0.14);
          g.beginPath(); // the plaque, gabled like a very small house
          g.moveTo(ex - 0.5, ry + 9); g.lineTo(ex + 4.5, ry + 5.5); g.lineTo(ex + 9.5, ry + 9);
          g.lineTo(ex + 9, ry + 17); g.lineTo(ex, ry + 17);
          g.closePath();
          g.fill();
          g.strokeStyle = 'rgba(60,44,30,0.6)';
          g.lineWidth = 0.8;
          g.beginPath();
          g.moveTo(ex + 2, ry + 11); g.lineTo(ex + 7, ry + 11);
          g.moveTo(ex + 2, ry + 13.5); g.lineTo(ex + 6, ry + 13.5);
          g.stroke();
        }
      }
    }, 64, 96);

    make('jihanki', 2, (g, r) => {
      // It hums. It glows. It has outlasted two shops and one mayor.
      softShadow(g, 32, 90, 18, 5, 0.2);
      vgrad(g, 16, 20, 32, 66, shade('#dfe3e6', 0.04), shade('#b9c2c9', -0.04));
      rect(g, 16, 20, 32, 3, '#eef0ee');
      rr(g, 19, 26, 26, 32, 2, '#f6f0d8'); // the lit face
      glowSpot(g, 32, 42, 20, '#fff2c4', 0.5);
      const canCols = ['#c1512f', '#3f7fb0', '#4d7440', '#c9a35f'];
      for (let row = 0; row < 2; row++) {
        for (let i = 0; i < 4; i++) {
          rr(g, 21.5 + i * 5.6, 29 + row * 13, 4.4, 9, 1, canCols[(i + row) % 4] ?? '#c1512f');
        }
      }
      rect(g, 21, 53, 10, 3.5, '#b5473a'); // ATSUI red
      rect(g, 34, 53, 10, 3.5, '#3f7fb0'); // TSUMETAI blue
      rect(g, 41, 62, 3.5, 6, '#3a3f47'); // coin slot
      rr(g, 20, 73, 20, 9, 2, '#3a3f47'); // the vend hatch
      rect(g, 16, 84, 32, 3, '#8a9096');
      if (r.chance(0.5)) dot(g, 45, 23.5, 1.6, '#d9694a'); // the little brand dot
    }, 64, 96);

    make('himono', 2, (g, r) => {
      // Today's small fish, drying into tomorrow's breakfast.
      softShadow(g, 32, 90, 20, 5, 0.16);
      g.strokeStyle = '#5c4630';
      g.lineWidth = 3;
      for (const px of [10, 54]) {
        g.beginPath(); g.moveTo(px, 88); g.lineTo(px, 36); g.stroke();
      }
      g.lineWidth = 2;
      g.beginPath(); g.moveTo(8, 42); g.lineTo(56, 42); g.stroke();
      g.strokeStyle = 'rgba(96,116,104,0.7)'; // the net shelf
      g.lineWidth = 1;
      for (let i = 0; i <= 6; i++) {
        g.beginPath(); g.moveTo(10 + i * 7.3, 46); g.lineTo(12 + i * 7.3, 62); g.stroke();
      }
      for (const ny of [48, 54, 60]) {
        g.beginPath(); g.moveTo(10, ny); g.lineTo(56, ny); g.stroke();
      }
      for (let i = 0; i < 4; i++) {
        const fx = 15 + i * 11 + r.int(3);
        const fy = 52 + (i % 2) * 4;
        oval(g, fx, fy, 5, 3.2, shade('#d9c9a8', (r.next() - 0.5) * 0.08), 0.15);
        g.strokeStyle = 'rgba(120,96,66,0.6)';
        g.lineWidth = 0.8;
        g.beginPath(); g.moveTo(fx - 4, fy); g.lineTo(fx + 4, fy); g.stroke();
        g.fillStyle = '#b9a988';
        g.beginPath();
        g.moveTo(fx + 4, fy - 1.4); g.lineTo(fx + 7.4, fy); g.lineTo(fx + 4, fy + 1.4);
        g.closePath();
        g.fill();
        dot(g, fx - 3, fy - 0.8, 0.6, '#5c4630');
      }
    }, 64, 96);

    make('monohoshi', 3, (g, r) => {
      // The laundry pole reads the sky before committing to anything.
      softShadow(g, 32, 90, 20, 5, 0.16);
      g.strokeStyle = '#7a6a52';
      g.lineWidth = 3;
      for (const px of [8, 56]) {
        g.beginPath(); g.moveTo(px, 88); g.lineTo(px, 26); g.stroke();
      }
      g.strokeStyle = '#9aa0a6';
      g.lineWidth = 2.4;
      g.beginPath(); g.moveTo(4, 32); g.lineTo(60, 32); g.stroke();
      const cols = ['#f2e6d0', '#3f7fb0', '#7d8894', '#c9a35f'];
      let cx = 9 + r.int(3);
      for (let i = 0; i < 3; i++) {
        const w = 10 + r.int(7);
        const h = 22 + r.int(14);
        const col = shade(cols[(i + r.int(2)) % 4] ?? '#f2e6d0', (r.next() - 0.5) * 0.06);
        const sway = (r.next() - 0.5) * 4;
        g.fillStyle = col;
        g.beginPath();
        g.moveTo(cx, 33); g.lineTo(cx + w, 33); g.lineTo(cx + w + sway, 33 + h);
        g.quadraticCurveTo(cx + w / 2, 37 + h, cx + sway, 33 + h);
        g.closePath();
        g.fill();
        vgrad(g, cx, 33, w, 8, 'rgba(255,255,255,0.18)', 'rgba(0,0,0,0)');
        dot(g, cx + 2, 33, 1.4, '#d9694a'); // pins, emphatic
        dot(g, cx + w - 2, 33, 1.4, '#d9694a');
        cx += w + 4 + r.int(4);
      }
    }, 64, 96);

    make('gyokyo', 2, (g, r) => {
      // The co-op board: everything official and everything true, same nails.
      softShadow(g, 32, 90, 20, 5, 0.18);
      for (const px of [14, 50]) {
        vgrad(g, px - 2, 42, 5, 46, shade(WOOD, 0.02), shade(WOOD, -0.16));
      }
      rr(g, 8, 26, 48, 42, 2, shade(WOOD, -0.12));
      rr(g, 11, 29, 42, 36, 1, '#dcd4c2');
      g.fillStyle = KAWARA;
      g.beginPath();
      g.moveTo(4, 26); g.lineTo(32, 18); g.lineTo(60, 26);
      g.lineTo(56, 30); g.lineTo(32, 23); g.lineTo(8, 30);
      g.closePath();
      g.fill();
      const paper = (x: number, y: number, w: number, h: number, rot: number, c: string) => {
        g.save();
        g.translate(x, y);
        g.rotate(rot);
        rr(g, -w / 2, -h / 2, w, h, 1, c);
        g.restore();
        dot(g, x, y - h / 2 + 1.4, 1.1, '#8a5a3c'); // its pin
      };
      paper(20, 39, 12, 15, -0.05 + (r.next() - 0.5) * 0.04, '#f6f2e4');
      paper(35, 41, 14, 16, 0.06, '#fdfdfa');
      paper(47, 45, 9, 12, -0.1, '#f2e6d0');
      paper(24, 56, 13, 12, 0.08, '#e8f0f4');
      g.strokeStyle = 'rgba(60,60,64,0.55)'; // lines of print
      g.lineWidth = 0.9;
      for (const [lx, ly] of [[15, 35], [15, 38], [30, 37], [30, 40], [30, 43], [43.5, 42], [19, 54]] as const) {
        g.beginPath(); g.moveTo(lx, ly); g.lineTo(lx + 8, ly); g.stroke();
      }
      dot(g, 39, 46, 2.4, 'rgba(180,60,50,0.8)'); // the hanko stamp
      oval(g, 24, 58, 4, 2, '#e8862f', 0.2); // the crayon goldfish
      dot(g, 21.2, 57.4, 0.6, '#3a3430');
    }, 64, 96);

    make('furin', 1, (g) => {
      // Sea wind, translated into small bright syllables.
      softShadow(g, 32, 90, 12, 4, 0.14);
      g.strokeStyle = '#5c4630';
      g.lineWidth = 2.6;
      g.lineCap = 'round';
      g.beginPath(); g.moveTo(24, 90); g.lineTo(24, 18); g.stroke();
      g.beginPath(); g.moveTo(24, 20); g.quadraticCurveTo(36, 16, 42, 22); g.stroke();
      g.strokeStyle = 'rgba(90,70,46,0.6)';
      g.lineWidth = 1;
      g.beginPath(); g.moveTo(42, 22); g.lineTo(42, 29); g.stroke();
      glowSpot(g, 42, 35, 12, '#cfe8ec', 0.4);
      g.fillStyle = 'rgba(190,225,232,0.65)'; // the glass bowl
      g.beginPath();
      g.arc(42, 35, 7.5, Math.PI * 0.98, Math.PI * 2.02);
      g.closePath();
      g.fill();
      oval(g, 42, 40.3, 7.3, 2, 'rgba(150,195,205,0.7)');
      dot(g, 39.5, 32, 2, 'rgba(255,255,255,0.7)');
      g.strokeStyle = 'rgba(90,70,46,0.7)';
      g.lineWidth = 1;
      g.beginPath(); g.moveTo(42, 36); g.lineTo(42.5, 46); g.stroke();
      dot(g, 42.3, 44, 1.6, '#8a6a44'); // the clapper
      g.save();
      g.translate(42.5, 46);
      g.rotate(0.18);
      rr(g, -3, 0, 6, 16, 1, '#f2e6d0'); // the paper strip
      g.restore();
      g.strokeStyle = 'rgba(60,90,140,0.5)';
      g.beginPath();
      g.moveTo(42, 50); g.lineTo(46, 50.6);
      g.moveTo(42.6, 54); g.lineTo(46.6, 54.6);
      g.stroke();
    }, 64, 96);

    // ------------------------------------------------- the love pass: indoors

    make('senpuki', 1, (g) => {
      // Showa-era, three speeds: low, lower, and consideration.
      softShadow(g, 32, 58, 14, 4, 0.16);
      g.strokeStyle = '#8a9096';
      g.lineWidth = 2.6;
      g.beginPath(); g.moveTo(32, 54); g.lineTo(32, 36); g.stroke();
      oval(g, 32, 55, 11, 3.5, '#b9c2c9');
      oval(g, 32, 54, 9, 2.6, '#cfd6da');
      dot(g, 32, 26, 13, '#cfd6da'); // the guard
      dot(g, 32, 26, 11.2, '#e8ecee');
      for (const a of [0.3, 2.4, 4.5]) { // blades, mid-turn forever
        g.save();
        g.translate(32, 26);
        g.rotate(a);
        oval(g, 6.5, 0, 6, 3.4, 'rgba(140,170,185,0.75)', 0.5);
        g.restore();
      }
      dot(g, 32, 26, 3, '#8a9096');
      g.strokeStyle = 'rgba(90,100,108,0.5)';
      g.lineWidth = 0.8;
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        g.beginPath();
        g.moveTo(32, 26);
        g.lineTo(32 + Math.cos(a) * 12.6, 26 + Math.sin(a) * 12.6);
        g.stroke();
      }
      g.beginPath(); g.arc(32, 26, 12.8, 0, Math.PI * 2); g.stroke();
      dot(g, 27, 51, 1.2, '#b5473a'); // the one red button that matters
    });

    make('mugicha', 1, (g) => {
      // Cold barley tea: the house's standing answer to July.
      softShadow(g, 32, 52, 16, 4, 0.14);
      oval(g, 32, 48, 20, 6, '#8a6a44'); // the tray
      oval(g, 32, 46.5, 18, 4.6, '#a8845c');
      vgrad(g, 24, 24, 14, 22, 'rgba(200,150,80,0.85)', 'rgba(148,94,40,0.92)'); // the jug
      rr(g, 23, 20, 16, 5, 2, '#d9c9a8'); // lid
      dot(g, 31, 19, 2, '#b9a988');
      dot(g, 27, 32, 1, 'rgba(255,255,255,0.55)'); // condensation, honest
      dot(g, 35, 38, 1, 'rgba(255,255,255,0.55)');
      dot(g, 30, 41, 0.8, 'rgba(255,255,255,0.45)');
      rr(g, 43, 36, 7, 10, 1, 'rgba(220,235,240,0.75)'); // one glass, poured
      rect(g, 44, 39.5, 5, 5.5, 'rgba(190,130,60,0.8)');
      rr(g, 14, 37, 7, 10, 1, 'rgba(220,235,240,0.75)'); // one glass, waiting
    });

    make('machiya', 4, (g, r) => {
      // 352x256: a wooden townhouse in the Inland Sea manner. Same wall and
      // door geometry as `casa`, so village grids and window lights match.
      const W = 352;
      const wallTop = 96;
      const wallBot = 252;
      const wood = shade(WOOD, (r.next() - 0.5) * 0.06);

      // Upper wall: plaster; lower: dark cedar boarding.
      vgrad(g, 16, wallTop, W - 32, 74, shade(PLASTER, 0.03), shade(PLASTER, -0.06));
      vgrad(g, 16, wallTop + 74, W - 32, wallBot - wallTop - 74, shade(wood, 0.06), shade(wood, -0.1));
      // Vertical board seams on the lower half.
      g.strokeStyle = 'rgba(30,20,12,0.35)';
      g.lineWidth = 2;
      for (let bx = 26; bx < W - 20; bx += 16) {
        g.beginPath();
        g.moveTo(bx, wallTop + 78);
        g.lineTo(bx, wallBot - 4);
        g.stroke();
      }
      // Weather: salt-pale streaks down the plaster.
      for (let i = 0; i < 5; i++) {
        const fx = 24 + r.int(W - 70);
        vgrad(g, fx, wallTop, 10 + r.int(14), 40 + r.int(30), 'rgba(240,236,222,0.25)', 'rgba(0,0,0,0)');
      }
      // Base stain and side shade.
      vgrad(g, 16, wallBot - 14, W - 32, 14, 'rgba(0,0,0,0)', 'rgba(40,32,24,0.35)');
      g.save();
      g.globalAlpha = 0.15;
      g.fillStyle = '#1c1712';
      g.fillRect(W - 26, wallTop, 10, wallBot - wallTop);
      g.restore();

      // The door: a wooden-framed sliding entrance, casa footprint.
      rr(g, 150, wallBot - 96, 66, 96, 4, shade(wood, -0.3));
      rr(g, 156, wallBot - 88, 54, 88, 3, shade(wood, -0.06));
      // Sliding-door lattice with paper behind.
      g.fillStyle = 'rgba(242,234,214,0.85)';
      g.fillRect(160, wallBot - 82, 46, 60);
      g.strokeStyle = 'rgba(50,36,22,0.7)';
      g.lineWidth = 2.4;
      for (const lx of [172, 183, 194]) {
        g.beginPath(); g.moveTo(lx, wallBot - 82); g.lineTo(lx, wallBot - 22); g.stroke();
      }
      for (let ly = wallBot - 68; ly < wallBot - 22; ly += 16) {
        g.beginPath(); g.moveTo(160, ly); g.lineTo(206, ly); g.stroke();
      }
      g.beginPath(); g.moveTo(183, wallBot - 82); g.lineTo(183, wallBot - 6); g.stroke();
      rr(g, 146, wallBot - 102, 74, 9, 4, shade(wood, -0.2));

      // Variant dressing at the door.
      const dress = r.int(4);
      if (dress <= 1) {
        // A noren over the doorway; shops that are, in spirit, open.
        const cloth = dress === 0 ? INDIGO : '#7d3f34';
        for (let i = 0; i < 3; i++) {
          const px = 154 + i * 20;
          g.fillStyle = shade(cloth, (r.next() - 0.5) * 0.06);
          g.beginPath();
          g.moveTo(px, wallBot - 94);
          g.lineTo(px + 18, wallBot - 94);
          g.lineTo(px + 17, wallBot - 58);
          g.quadraticCurveTo(px + 9, wallBot - 54, px + 1, wallBot - 58);
          g.closePath();
          g.fill();
        }
        dot(g, 183, wallBot - 76, 6, 'rgba(242,230,208,0.85)');
      } else if (dress === 3) {
        // Amado shutters drawn: the shuttered storefront, honest and asleep.
        rect(g, 158, wallBot - 84, 50, 78, shade(wood, -0.22));
        g.strokeStyle = 'rgba(20,14,8,0.5)';
        g.lineWidth = 2;
        for (let ly = wallBot - 70; ly < wallBot - 8; ly += 14) {
          g.beginPath(); g.moveTo(158, ly); g.lineTo(208, ly); g.stroke();
        }
      }

      // Windows: koshi lattice, same offsets as casa so lights line up.
      for (const wx of [52, 252]) {
        rr(g, wx - 4, wallTop + 30, 56, 52, 3, shade(wood, -0.28));
        g.fillStyle = 'rgba(242,234,214,0.9)';
        g.fillRect(wx, wallTop + 34, 48, 44);
        g.strokeStyle = 'rgba(50,36,22,0.75)';
        g.lineWidth = 2.2;
        for (let lx = wx + 6; lx < wx + 48; lx += 7) {
          g.beginPath();
          g.moveTo(lx, wallTop + 34);
          g.lineTo(lx, wallTop + 78);
          g.stroke();
        }
        g.beginPath();
        g.moveTo(wx, wallTop + 56);
        g.lineTo(wx + 48, wallTop + 56);
        g.stroke();
        // A small sill roof over each window.
        rr(g, wx - 8, wallTop + 22, 64, 8, 3, shade(KAWARA, -0.02));
      }

      // The kawara roof: a deep sloped band of tile courses with eaves.
      g.fillStyle = shade(KAWARA, 0.02);
      g.beginPath();
      g.moveTo(2, 92);
      g.lineTo(26, 40);
      g.lineTo(W - 26, 40);
      g.lineTo(W - 2, 92);
      g.closePath();
      g.fill();
      // Tile courses.
      g.strokeStyle = 'rgba(30,34,42,0.45)';
      g.lineWidth = 2;
      for (let i = 1; i < 5; i++) {
        const t = i / 5;
        const y = 40 + t * 52;
        g.beginPath();
        g.moveTo(26 - t * 24, y);
        g.lineTo(W - 26 + t * 24, y);
        g.stroke();
      }
      // Vertical tile ridges, fanning slightly.
      for (let i = 0; i <= 12; i++) {
        const tx = 26 + (i * (W - 52)) / 12;
        const bx = 2 + (i * (W - 4)) / 12;
        g.beginPath();
        g.moveTo(tx, 40);
        g.lineTo(bx, 92);
        g.stroke();
      }
      // Ridge cap and end caps.
      rr(g, 20, 34, W - 40, 10, 5, shade(KAWARA, -0.14));
      dot(g, 26, 39, 6, shade(KAWARA, -0.2));
      dot(g, W - 26, 39, 6, shade(KAWARA, -0.2));
      vgrad(g, 16, 92, W - 32, 16, 'rgba(20,16,12,0.4)', 'rgba(0,0,0,0)'); // eave shadow
      // Round eave-end tiles.
      for (let i = 0; i <= 12; i++) {
        dot(g, 4 + (i * (W - 8)) / 12, 93, 4, shade(KAWARA, -0.08));
      }
    }, 352, 256);
  },

  grounded: [
    'noren', 'torii', 'ishidoro', 'bamboo', 'bambooWish', 'tairyobata', 'hisashi',
    // (zabuton is floor decor, not a tall prop; it lives in noInk below)
    'chochin', 'postbox', 'yatai', 'keitruck', 'ebisudo',
    'jizo', 'ema', 'jihanki', 'himono', 'monohoshi', 'gyokyo', 'furin',
  ],
  buildings: ['machiya'],
  windows: {
    machiya: [
      [15, -10],
      [67, -10],
    ],
  },
  glows: ['ishidoro', 'chochin', 'irori', 'jihanki'],
  noInk: ['koke', 'kaigara', 'getarow', 'zabuton', 'goza'],
  /** In Fumi's house a mat is a goza, not the shared Andean weave. */
  skins: {
    minshuku: { mat: 'goza' },
  },
};

// No side effects here; the integrator registers this set in art/sets/index.ts.
