import type { ChapterArt } from './index';
import { dot, oval, rect, rr, shade, softShadow, vgrad, glowSpot } from '../pix';

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

    make('tatami', 3, (g, r) => {
      const base = '#c9bd8a';
      rect(g, 0, 0, S, S, base);
      // The weave: fine horizontal rush lines, a shade apart.
      for (let y = 3; y < S; y += 5) {
        g.strokeStyle = `rgba(120,105,60,${0.10 + r.next() * 0.06})`;
        g.lineWidth = 1.4;
        g.beginPath();
        g.moveTo(0, y + r.int(2));
        g.lineTo(S, y + r.int(2));
        g.stroke();
      }
      if (r.chance(0.4)) vgrad(g, 0, r.int(S), S, 8, 'rgba(255,250,225,0.10)', 'rgba(0,0,0,0)');
    });

    make('floorWood', 3, (g, r) => {
      const base = shade('#96744c', (r.next() - 0.5) * 0.04);
      rect(g, 0, 0, S, S, base);
      // Long boards, polished by socks for sixty years.
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
      if (r.chance(0.3)) dot(g, r.int(S), r.int(S), 1.6, 'rgba(40,28,16,0.4)');
    });

    make('tataki', 2, (g, r) => {
      // The genkan's packed earthen-stone floor, a step below the world.
      const base = '#9a938a';
      rect(g, 0, 0, S, S, shade(base, -0.04));
      for (let i = 0; i < 5; i++) {
        dot(g, r.int(S), r.int(S), 1.4 + r.next(), shade(base, r.chance(0.5) ? -0.14 : 0.08));
      }
      vgrad(g, 0, 0, S, 10, 'rgba(30,26,22,0.14)', 'rgba(0,0,0,0)');
    });

    // ---------------------------------------------------------- interior

    make('wallShoji', 4, (g, r) => {
      vgrad(g, 0, 0, S, S, shade(WOOD, -0.12), shade(WOOD, 0.02));
      vgrad(g, 0, 0, S, 14, 'rgba(15,10,6,0.4)', 'rgba(0,0,0,0)');
      const deco = r.int(4);
      if (deco === 0) {
        // A shoji panel, paper glowing faintly with day.
        rr(g, 10, 14, 44, 40, 3, shade(WOOD, -0.25));
        rr(g, 13, 17, 38, 34, 2, '#efe6d2');
        g.strokeStyle = 'rgba(90,70,45,0.6)';
        g.lineWidth = 1.6;
        for (const lx of [26, 39]) {
          g.beginPath(); g.moveTo(lx, 17); g.lineTo(lx, 51); g.stroke();
        }
        for (const ly of [28, 40]) {
          g.beginPath(); g.moveTo(13, ly); g.lineTo(51, ly); g.stroke();
        }
      } else if (deco === 1) {
        // A hanging scroll: one brushstroke, probably a fish.
        rr(g, 24, 12, 16, 42, 2, PAPERWARM);
        g.strokeStyle = '#3a4048';
        g.lineWidth = 2.6;
        g.beginPath();
        g.moveTo(28, 24);
        g.quadraticCurveTo(38, 30, 30, 42);
        g.stroke();
        rect(g, 24, 12, 16, 3, '#4a5d63');
        rect(g, 24, 51, 16, 3, '#4a5d63');
      } else if (deco === 2) {
        // A round window onto nothing in particular.
        dot(g, 32, 32, 15, shade(WOOD, -0.3));
        dot(g, 32, 32, 12, '#dce8e4');
        glowSpot(g, 32, 32, 12, '#f6f0d8', 0.5);
      }
      // Beam along the top.
      rect(g, 0, 8, S, 4, shade(WOOD, -0.2));
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
    'noren', 'torii', 'ishidoro', 'bamboo', 'bambooWish', 'tairyobata',
    'chochin', 'postbox', 'yatai', 'keitruck', 'ebisudo',
  ],
  buildings: ['machiya'],
  windows: {
    machiya: [
      [15, -10],
      [67, -10],
    ],
  },
  glows: ['ishidoro', 'chochin', 'irori'],
};

// No side effects here; the integrator registers this set in art/sets/index.ts.
