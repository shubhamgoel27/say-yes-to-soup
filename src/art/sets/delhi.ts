import type { ChapterArt } from './index';
import { dot, oval, rr, rect, vgrad, glowSpot, softShadow, shade, blob } from '../pix';
import { PAL } from '../../engine/config';

/**
 * Old Delhi art: monsoon brass over worn stone, three scripts per signboard,
 * wires thick as anacondas, marigold and chilli and rain. Painted in the
 * smooth idiom: flat seamless grounds, soft gradients, no outlines, and the
 * whole mohalla slightly overloaded on purpose, because it is.
 */

const S = 64;

export const ART: ChapterArt = {
  aliases: {
    dakkhana: 'postbox', // the imperial red pillar box, third career in Delhi
    chulha: 'qoncha', // the langar hearth; clay is clay at any latitude
  },
  grounded: [
    'attarcase', 'chaikhana', 'sethgaddi', 'paranthagriddle', 'khomcha',
    'jalebikadhai', 'kulhadtower', 'wirebundle', 'nishansahib', 'monkeywire',
    'peepal', 'rickshaw', 'signstack', 'thela', 'birdward', 'cardstall',
    'sackpyramid', 'chilisacks', 'gullywall', 'handpump', 'garlandline',
    'stairup', 'kabootarkhana', 'kitestack', 'watertank', 'dhobiline',
    'antennajugaad', 'fortwall', 'jamadomes', 'degpot', 'coupletwall',
    'mohallawall', 'kitesnag', 'waterstation', 'hallfan', 'khandapanel',
    'ladlestand', 'lampniche',
  ],
  buildings: ['haveli', 'gurdwara'],
  windows: {
    haveli: [
      [15, -10],
      [67, -10],
    ],
    gurdwara: [
      [15, -10],
      [67, -10],
    ],
  },
  glows: ['paranthagriddle', 'jalebikadhai', 'chaikhana', 'chulha', 'diyaledge', 'lampniche'],
  noInk: [
    'pigeonpeck', 'marigoldheap', 'spicespill', 'puddle', 'kulhadshards', 'kitecut', 'pangat',
    'grainspill', 'chalkpitch', 'doormat', 'couplitter',
  ],

  paint(make) {
    // ---------------------------------------------------------- grounds

    // Gali stone: centuries of feet over Shahjahani flags, patched with
    // whatever the last repair had in the cart.
    make('galistone', 5, (g, r) => {
      const base = '#9a8d7c';
      rect(g, 0, 0, S, S, shade(base, 0.02));
      // Flagstone seams, worn soft.
      g.strokeStyle = 'rgba(70,60,50,0.22)';
      g.lineWidth = 1.6;
      const yy = 10 + r.int(20);
      g.beginPath();
      g.moveTo(0, yy);
      g.lineTo(S, yy + r.int(6) - 3);
      g.stroke();
      const xx = 8 + r.int(40);
      g.beginPath();
      g.moveTo(xx, yy);
      g.lineTo(xx + r.int(8) - 4, S);
      g.stroke();
      // Patches: one cement, one older than the argument about it.
      if (r.chance(0.4)) oval(g, r.int(S), r.int(S), 7, 4, shade(base, -0.07));
      if (r.chance(0.35)) oval(g, r.int(S), r.int(S), 5, 3, '#b0a696');
      // A ghee stain or a rain ghost, depending who you ask.
      if (r.chance(0.3)) dot(g, r.int(S), r.int(S), 3, 'rgba(120,90,50,0.14)');
    });

    // Chowk brick: the redone paving of the great street, herringbone pride
    // already learning humility from the monsoon.
    make('chowkbrick', 4, (g, r) => {
      const base = '#9d7a6c';
      rect(g, 0, 0, S, S, shade(base, 0.03));
      g.strokeStyle = 'rgba(80,50,44,0.25)';
      g.lineWidth = 1.3;
      for (let row = 0; row < 4; row++) {
        const y = row * 16 + 8;
        g.beginPath();
        g.moveTo(0, y);
        g.lineTo(S, y);
        g.stroke();
        for (let x = (row % 2) * 8; x < S; x += 16) {
          g.beginPath();
          g.moveTo(x, y - 8);
          g.lineTo(x, y);
          g.stroke();
        }
      }
      if (r.chance(0.4)) oval(g, r.int(S), r.int(S), 6, 3, shade(base, -0.08));
      if (r.chance(0.3)) dot(g, r.int(S), r.int(S), 2.4, shade(base, 0.12));
    });

    // The worn edge: where two pavings meet, feet and cart wheels grind a
    // strip of neither-one, half stone dust, half packed earth.
    make('wornedge', 5, (g, r) => {
      const base = '#a28468';
      rect(g, 0, 0, S, S, shade(base, (r.next() - 0.5) * 0.03));
      // Stone ghosts surfacing through the scuff.
      oval(g, r.int(S), r.int(S), 8, 4, 'rgba(154,141,124,0.4)');
      if (r.chance(0.6)) oval(g, r.int(S), r.int(S), 6, 3, 'rgba(154,141,124,0.3)');
      // Packed-earth streaks, wheel-width.
      oval(g, r.int(S), r.int(S), 9, 3, 'rgba(169,124,80,0.35)', 0.1);
      if (r.chance(0.5)) oval(g, r.int(S), r.int(S), 7, 2.4, 'rgba(125,88,54,0.25)', -0.1);
      // A stray brick fragment or a pale grit patch.
      if (r.chance(0.3)) rr(g, r.int(S - 10), r.int(S - 6), 8, 4, 1, 'rgba(157,122,108,0.4)');
      if (r.chance(0.35)) dot(g, r.int(S), r.int(S), 2, 'rgba(220,210,190,0.25)');
    });

    // Rooftop terrace: lime-washed brick, sun-cured, rain-rinsed.
    make('terrace', 4, (g, r) => {
      const base = '#b8a98e';
      rect(g, 0, 0, S, S, shade(base, 0.02));
      g.strokeStyle = 'rgba(90,75,55,0.18)';
      g.lineWidth = 1.2;
      for (const y of [16, 32, 48]) {
        g.beginPath();
        g.moveTo(0, y + r.int(3) - 1);
        g.lineTo(S, y + r.int(3) - 1);
        g.stroke();
      }
      // Whitewash memory and one crack the sparrows use as an address.
      if (r.chance(0.45)) oval(g, r.int(S), r.int(S), 8, 4, 'rgba(240,235,220,0.16)');
      if (r.chance(0.3)) {
        g.strokeStyle = 'rgba(70,58,44,0.3)';
        g.beginPath();
        g.moveTo(r.int(S), r.int(S));
        g.lineTo(r.int(S), r.int(S));
        g.stroke();
      }
    });

    // Yusuf's terrace: freshly lime-washed for the birds, a shade brighter,
    // the coop's whole neighborhood smelling faintly of chuna.
    make('terracelime', 4, (g, r) => {
      const base = '#c4b69c';
      rect(g, 0, 0, S, S, shade(base, 0.02));
      g.strokeStyle = 'rgba(95,80,60,0.15)';
      g.lineWidth = 1.2;
      for (const y of [16, 32, 48]) {
        g.beginPath();
        g.moveTo(0, y + r.int(3) - 1);
        g.lineTo(S, y + r.int(3) - 1);
        g.stroke();
      }
      // Broad whitewash swipes, brush-width honest.
      oval(g, r.int(S), r.int(S), 12, 5, 'rgba(245,240,228,0.2)');
      if (r.chance(0.5)) oval(g, r.int(S), r.int(S), 9, 4, 'rgba(245,240,228,0.14)');
      if (r.chance(0.25)) dot(g, r.int(S), r.int(S), 1.6, 'rgba(240,238,232,0.5)');
    });

    // The south terrace: brick dust and evening, a rose-tan coat worn to
    // the pavers where the charpai parliament convenes.
    make('terracerose', 4, (g, r) => {
      const base = '#b4a08a';
      rect(g, 0, 0, S, S, shade(base, 0.01));
      g.strokeStyle = 'rgba(95,72,55,0.2)';
      g.lineWidth = 1.2;
      for (const y of [16, 32, 48]) {
        g.beginPath();
        g.moveTo(0, y + r.int(3) - 1);
        g.lineTo(S, y + r.int(3) - 1);
        g.stroke();
      }
      // Paver ghosts showing through, warm side up.
      if (r.chance(0.55)) oval(g, r.int(S), r.int(S), 8, 4, 'rgba(160,110,90,0.14)');
      if (r.chance(0.35)) oval(g, r.int(S), r.int(S), 6, 3, 'rgba(240,230,214,0.12)');
      if (r.chance(0.3)) dot(g, r.int(S), r.int(S), 2.4, 'rgba(150,100,80,0.16)');
    });

    // ------------------------------------------------- boundary and stairs

    // The mohalla wall: haveli backs and party walls, plaster over brick
    // over older brick, a civic geology. Full-bleed so runs of it read as
    // one continuous facade, not stacked crates.
    make('mohallawall', 4, (g, r) => {
      const coat = shade('#c2ab8d', (r.next() - 0.5) * 0.03);
      rect(g, 0, 0, S, 96, coat);
      vgrad(g, 0, 0, S, 18, 'rgba(90,75,55,0.2)', 'rgba(0,0,0,0)');
      vgrad(g, 0, 72, S, 24, 'rgba(0,0,0,0)', 'rgba(80,70,55,0.26)');
      // A faint course line and one string of cable crossing.
      g.strokeStyle = 'rgba(90,75,55,0.14)';
      g.lineWidth = 1.4;
      g.beginPath();
      g.moveTo(0, 30 + r.int(6));
      g.lineTo(S, 30 + r.int(6));
      g.stroke();
      if (r.chance(0.5)) {
        g.strokeStyle = 'rgba(40,36,32,0.4)';
        g.lineWidth = 1.6;
        const cy = 20 + r.int(10);
        g.beginPath();
        g.moveTo(0, cy);
        g.quadraticCurveTo(S / 2, cy + 5, S, cy - 1);
        g.stroke();
      }
      // Exposed brick where the plaster gave up first.
      if (r.chance(0.45)) {
        const bx = 6 + r.int(34);
        const by = 40 + r.int(30);
        for (let k = 0; k < 5; k++) {
          rr(g, bx + (k % 2) * 7, by + Math.floor(k / 2) * 6, 10, 4.5, 1, shade('#9a5f4a', (r.next() - 0.5) * 0.1));
        }
      }
      // A painted ad ghost or a film poster corner, occasionally.
      if (r.chance(0.3)) {
        rr(g, 8 + r.int(28), 34 + r.int(10), 16, 13, 1, 'rgba(70,110,150,0.2)');
      } else if (r.chance(0.3)) {
        rr(g, 10 + r.int(26), 36 + r.int(8), 12, 16, 1, 'rgba(180,80,60,0.22)');
      }
      // Monsoon streaks, the wall's diary.
      vgrad(g, r.int(50), 8, 8, 30 + r.int(24), 'rgba(110,100,80,0.14)', 'rgba(0,0,0,0)');
    }, 64, 96);

    // The stair to the roof: whitewashed steps up a party wall, worn to a
    // shine in the middle by two centuries of ascents.
    make('stairup', 1, (g) => {
      softShadow(g, 32, 90, 22, 5, 0.2);
      // Side wall.
      rr(g, 8, 20, 48, 68, 2, '#c1a58c');
      vgrad(g, 8, 20, 48, 10, 'rgba(90,75,55,0.2)', 'rgba(0,0,0,0)');
      // The flight, climbing right to left into shadow.
      for (let i = 0; i < 7; i++) {
        const y = 78 - i * 8;
        const x = 14 + i * 4;
        rr(g, x, y, 40 - i * 4, 8, 1.5, shade('#d8c9ac', -i * 0.03));
        g.strokeStyle = 'rgba(90,75,55,0.3)';
        g.lineWidth = 1.2;
        g.beginPath();
        g.moveTo(x, y);
        g.lineTo(x + 40 - i * 4, y);
        g.stroke();
      }
      // The doorway of sky at the top.
      rr(g, 38, 18, 16, 14, 3, '#cfd8de');
      vgrad(g, 38, 18, 16, 14, 'rgba(255,250,235,0.5)', 'rgba(0,0,0,0)');
      // Worn shine up the middle.
      vgrad(g, 28, 30, 10, 50, 'rgba(255,250,235,0.14)', 'rgba(0,0,0,0)');
    }, 64, 96);

    // ------------------------------------------------- the food furniture

    // Kamla Chachi's griddle corner: the iron tawa over coals, the ghee tin,
    // the bench of waiting stomachs implied. In `glows`: the coals never argue.
    make('paranthagriddle', 1, (g) => {
      softShadow(g, 32, 90, 26, 6, 0.22);
      // The masonry counter.
      rr(g, 8, 56, 48, 32, 3, '#a5766a');
      vgrad(g, 8, 56, 48, 8, 'rgba(255,240,210,0.16)', 'rgba(0,0,0,0)');
      // The shallow iron kadhai, black with virtue.
      oval(g, 30, 52, 19, 8, '#33302c');
      oval(g, 30, 50, 16.5, 6.5, '#4a443c');
      // Ghee pooled and one parantha mid-blister.
      oval(g, 30, 50, 12, 4.6, '#c9a24e');
      oval(g, 29, 49.5, 8, 3.4, '#e0bd6a');
      dot(g, 26, 49, 1.4, '#8a5a28');
      dot(g, 33, 50, 1.2, '#8a5a28');
      // Coal glow beneath.
      glowSpot(g, 30, 60, 12, '#ff9a4a', 0.55);
      // The ghee tin, dented into loyalty, and the rolling board.
      rr(g, 46, 44, 12, 14, 2, '#7d8a8c');
      rr(g, 47, 41, 10, 4, 1, '#94a0a2');
      oval(g, 14, 60, 8, 3, '#c9b795');
      rr(g, 6, 57, 5, 2.6, 1.3, '#8a6a44');
      // Steam with ghee in its accent.
      glowSpot(g, 28, 36, 10, '#f6ecd8', 0.5);
    }, 64, 96);

    // Bade Mian's jalebi kadhai: copper, syrup, and the 1902 of it all.
    make('jalebikadhai', 1, (g) => {
      softShadow(g, 32, 90, 24, 6, 0.22);
      // The stand and firebox.
      rr(g, 14, 62, 36, 26, 3, '#8a5f4a');
      glowSpot(g, 32, 74, 11, '#ff9a4a', 0.5);
      // The wide copper kadhai.
      oval(g, 32, 56, 22, 9, '#a4643a');
      oval(g, 32, 53.5, 19, 7, '#c07c48');
      oval(g, 32, 52.5, 16, 5.6, '#d99a52');
      // Jalebis coiling in the ghee, geometry by hand.
      for (const [jx, jy] of [[24, 52], [33, 51], [40, 53]] as const) {
        g.strokeStyle = '#e8a83c';
        g.lineWidth = 2.6;
        g.beginPath();
        g.arc(jx, jy, 3.4, 0, Math.PI * 1.7);
        g.stroke();
        g.strokeStyle = '#f2c25a';
        g.lineWidth = 1.2;
        g.beginPath();
        g.arc(jx, jy, 1.8, 0.5, Math.PI * 1.5);
        g.stroke();
      }
      // The syrup tray, patient as a bank.
      oval(g, 12, 66, 8, 3.4, '#b58a3c');
      oval(g, 12, 65, 6.5, 2.6, '#d9ae55');
      // The board: BADE MIAN JALEBI WALE, SINCE 1902, in three scripts.
      rr(g, 10, 24, 44, 16, 2, '#25443c');
      g.fillStyle = '#e8d9a8';
      for (let k = 0; k < 4; k++) g.fillRect(14 + k * 10, 28, 7, 2.4);
      for (let k = 0; k < 5; k++) g.fillRect(13 + k * 8, 33, 5.5, 2);
      rr(g, 30, 40, 4, 22, 2, '#5c4630');
      glowSpot(g, 32, 46, 10, '#f6ecd8', 0.4);
    }, 64, 96);

    // Akhtar Bhai's chai corner: the kettle, the coals, the kulhad ranks,
    // and a bench-side view of the entire monsoon.
    make('chaikhana', 1, (g) => {
      softShadow(g, 32, 90, 26, 6, 0.2);
      // Counter, painted the green of every good tea stall.
      rr(g, 6, 54, 52, 26, 4, '#3d6b58');
      vgrad(g, 6, 54, 52, 8, 'rgba(255,255,255,0.18)', 'rgba(0,0,0,0)');
      rr(g, 9, 78, 4, 10, 1.5, '#5c4630');
      rr(g, 51, 78, 4, 10, 1.5, '#5c4630');
      // The brass kettle over coals, spout mid-sentence.
      oval(g, 20, 47, 9.5, 7, '#c8973b');
      rr(g, 16, 35, 8, 6.5, 2, '#c8973b');
      g.strokeStyle = '#a2762c';
      g.lineWidth = 2.6;
      g.beginPath();
      g.moveTo(28, 45);
      g.quadraticCurveTo(36, 39, 34, 49);
      g.stroke();
      glowSpot(g, 20, 56, 9, '#ff9a4a', 0.5);
      // Kulhads upside down in ranks, and one upright, on duty.
      for (let i = 0; i < 3; i++) {
        oval(g, 38 + i * 7, 48, 3.2, 2.2, '#b5713f');
        rr(g, 35.4 + i * 7, 42, 5.2, 6, 1.5, shade('#b5713f', 0.06));
      }
      oval(g, 52, 44, 2.8, 1.6, '#8a5330');
      // The awning: striped, patched, correct.
      rr(g, 2, 18, 60, 9, 4, '#a4442e');
      g.fillStyle = PAL.cream;
      g.fillRect(11, 18, 9, 9);
      g.fillRect(30, 18, 9, 9);
      g.fillRect(49, 18, 9, 9);
      rr(g, 4, 24, 2.6, 32, 1.3, '#5c4630');
      rr(g, 57, 24, 2.6, 32, 1.3, '#5c4630');
      // Steam, first edition of the day's news.
      glowSpot(g, 22, 30, 9, '#f6ecd8', 0.5);
    }, 64, 96);

    // The kulhad tower: unglazed clay cups stacked to a height only
    // confidence explains. Each one will hold chai once and the rain forever.
    make('kulhadtower', 2, (g, r) => {
      softShadow(g, 32, 90, 16, 4, 0.2);
      const clay = '#b5713f';
      let y = 84;
      for (let row = 0; row < 7; row++) {
        const w = 20 - row * 1.8;
        oval(g, 32 + (r.next() - 0.5) * 3, y, w / 2 + 4, 4, shade(clay, (r.next() - 0.5) * 0.12 - row * 0.01));
        y -= 7.5;
      }
      // The top cup upright, hopeful.
      rr(g, 28.6, 26, 7, 7, 2, shade(clay, 0.08));
      oval(g, 32, 26, 3.6, 2, '#8a5330');
      // Straw packing at the base.
      g.strokeStyle = 'rgba(200,165,91,0.5)';
      g.lineWidth = 1.2;
      for (let i = 0; i < 5; i++) {
        const fx = 20 + r.int(24);
        g.beginPath();
        g.moveTo(fx, 86);
        g.quadraticCurveTo(fx + 3, 88, fx + 6, 87);
        g.stroke();
      }
    }, 64, 96);

    // The khomcha: the halwai's wicker stand, bare until November. Its
    // emptiness is the point; daulat ki chaat keeps winter hours.
    make('khomcha', 1, (g) => {
      softShadow(g, 32, 90, 18, 4, 0.2);
      // Tripod legs.
      g.strokeStyle = '#8a6a44';
      g.lineWidth = 3;
      g.lineCap = 'round';
      for (const [x1, x2] of [[22, 16], [32, 32], [42, 48]] as const) {
        g.beginPath();
        g.moveTo(x1, 56);
        g.lineTo(x2, 88);
        g.stroke();
      }
      // The woven basket platter, wide as a promise.
      oval(g, 32, 52, 22, 8, '#c9a35c');
      oval(g, 32, 50, 19, 6, '#daba74');
      g.strokeStyle = 'rgba(120,86,40,0.45)';
      g.lineWidth = 1.2;
      for (let k = 0; k < 4; k++) {
        g.beginPath();
        g.ellipse(32, 51, 6 + k * 4, 2.2 + k * 1.4, 0, 0, Math.PI * 2);
        g.stroke();
      }
      // A muslin cloth folded on it, waiting for the cold moon.
      rr(g, 24, 44, 16, 6, 3, '#efe6d2');
      vgrad(g, 24, 44, 16, 3, 'rgba(255,255,255,0.5)', 'rgba(0,0,0,0)');
    }, 64, 96);

    // ------------------------------------------------- the spice end

    // A sack pyramid: jute mountains of the wholesale trade, stenciled and
    // stacked by porters who make it look like light work. It is not.
    make('sackpyramid', 3, (g, r) => {
      softShadow(g, 32, 90, 28, 6, 0.24);
      const jute = shade('#b09468', (r.next() - 0.5) * 0.08);
      const sack = (x: number, y: number, w: number, h: number, c: string) => {
        rr(g, x, y, w, h, h / 2.6, c);
        g.strokeStyle = 'rgba(90,70,44,0.35)';
        g.lineWidth = 1;
        for (let k = 1; k < 3; k++) {
          g.beginPath();
          g.moveTo(x + 3, y + (h / 3) * k);
          g.lineTo(x + w - 3, y + (h / 3) * k + 1);
          g.stroke();
        }
        // The tie-off knots, tucked at the top corners.
        dot(g, x + 4.5, y + 1.5, 1.3, shade(c, -0.14));
        dot(g, x + w - 4.5, y + 1.5, 1.3, shade(c, -0.14));
      };
      sack(4, 62, 26, 26, shade(jute, -0.05));
      sack(32, 64, 26, 24, jute);
      sack(10, 42, 25, 24, shade(jute, 0.05));
      sack(34, 44, 22, 22, shade(jute, -0.02));
      sack(21, 24, 24, 22, shade(jute, 0.09));
      // Stencils: a district name half readable, a lot number entirely proud.
      g.fillStyle = 'rgba(60,44,26,0.7)';
      for (let k = 0; k < 3; k++) g.fillRect(26 + k * 6, 32, 4, 2.4);
      for (let k = 0; k < 4; k++) g.fillRect(8 + k * 5, 70, 3.4, 2.2);
      // One split seam bleeding cardamom green.
      dot(g, 40, 68, 3, '#7a8a4a');
      dot(g, 44, 71, 2, '#8fa05a');
    }, 64, 96);

    // The chilli sacks: open-mouthed, red as a warning nobody heeds. The
    // corridor sneezes on schedule and calls it seasoning.
    make('chilisacks', 2, (g, r) => {
      softShadow(g, 32, 90, 24, 5, 0.22);
      const jute = shade('#a8895e', (r.next() - 0.5) * 0.06);
      for (const [sx, sy, w] of [[6, 56, 26], [34, 58, 24]] as const) {
        // Rolled-lip open sack.
        rr(g, sx, sy, w, 32, 8, jute);
        oval(g, sx + w / 2, sy + 2, w / 2 + 1, 5, shade(jute, 0.12));
        // The chilli heap, whole and ground.
        oval(g, sx + w / 2, sy, w / 2 - 2, 4.5, '#a02818');
        for (let i = 0; i < 8; i++) {
          oval(g, sx + 4 + r.int(w - 8), sy - 2 + r.int(4), 3, 1.2, shade('#b53220', (r.next() - 0.5) * 0.15), r.next() * 3);
        }
      }
      // The scoop, resting mid-transaction.
      rr(g, 28, 48, 9, 5, 2, '#8a8a88');
      rr(g, 35, 50, 8, 2, 1, '#6b6a66');
      // Red dust haze drifting off the top. Bless you.
      glowSpot(g, 20, 44, 10, '#c04a30', 0.22);
      glowSpot(g, 44, 46, 9, '#c04a30', 0.18);
    }, 64, 96);

    // Sethji's gaddi: the white-sheeted platform, the bolster, the brass
    // scale, and a ledger that reaches Bombay without standing up.
    make('sethgaddi', 1, (g) => {
      softShadow(g, 32, 90, 26, 6, 0.22);
      // The platform.
      rr(g, 6, 58, 52, 26, 4, '#8a6a48');
      rr(g, 8, 50, 48, 14, 5, '#efe8d8');
      vgrad(g, 8, 50, 48, 6, 'rgba(255,255,255,0.5)', 'rgba(0,0,0,0)');
      // The bolster, mounted like a small government.
      oval(g, 18, 46, 10, 5.5, '#d8cdb4');
      oval(g, 18, 45, 8, 4, '#e8e0cc');
      // The brass balance scale.
      g.strokeStyle = '#a2762c';
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(40, 30);
      g.lineTo(40, 44);
      g.moveTo(30, 32);
      g.lineTo(50, 32);
      g.stroke();
      g.strokeStyle = 'rgba(162,118,44,0.8)';
      g.lineWidth = 1.2;
      for (const px of [30, 50]) {
        g.beginPath();
        g.moveTo(px, 32);
        g.lineTo(px - 3, 40);
        g.moveTo(px, 32);
        g.lineTo(px + 3, 40);
        g.stroke();
        oval(g, px, 41, 5, 2, '#c8973b');
      }
      // Cardamom on one pan, weights on the other. The nose adjudicates.
      dot(g, 29, 40, 1.6, '#7a8a4a');
      dot(g, 31.5, 39.6, 1.4, '#8fa05a');
      rr(g, 48, 38, 4, 3, 1, '#6b6a66');
      // The ledger, red cloth-bound, ninth generation.
      rr(g, 42, 52, 12, 8, 1.5, '#8a3428');
      g.strokeStyle = '#c8a55b';
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(44, 54);
      g.lineTo(52, 54);
      g.stroke();
    }, 64, 96);

    // ------------------------------------------------- lanes and trades

    // Mehr Aapa's attar case: amber bottles in rows, each one a bottled
    // weather. The mitti attar hides in plain sight, second shelf.
    make('attarcase', 1, (g) => {
      softShadow(g, 32, 90, 22, 5, 0.2);
      // The dark wood cabinet.
      rr(g, 10, 24, 44, 64, 3, '#4a3524');
      vgrad(g, 10, 24, 44, 10, 'rgba(240,220,190,0.14)', 'rgba(0,0,0,0)');
      // Three glass shelves of small suns.
      for (let row = 0; row < 3; row++) {
        const y = 36 + row * 17;
        rr(g, 13, y + 9, 38, 2, 1, 'rgba(220,235,235,0.4)');
        for (let i = 0; i < 5; i++) {
          const bx = 17 + i * 8;
          const c = ['#c99a3c', '#b5713f', '#a86a2c', '#c9822c', '#8a5330'][(i + row) % 5] ?? '#c99a3c';
          rr(g, bx - 2.4, y, 4.8, 9, 2, c);
          dot(g, bx, y - 1, 1.6, shade(c, 0.25));
          // The glass catching lane light.
          rr(g, bx - 1.6, y + 1, 1.4, 5, 0.7, 'rgba(255,245,220,0.45)');
        }
      }
      // The tester vial and its glass wand, out on the sill.
      rr(g, 26, 84, 12, 4, 2, '#5c4630');
      rr(g, 30, 78, 3.4, 7, 1.5, '#c9822c');
      g.strokeStyle = 'rgba(230,220,200,0.7)';
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(36, 78);
      g.lineTo(40, 84);
      g.stroke();
    }, 64, 96);

    // The wedding-card stall: futures fanned out in red and gold, and a
    // sample album fat with other people's happiness.
    make('cardstall', 1, (g) => {
      softShadow(g, 32, 90, 22, 5, 0.2);
      // The stall box.
      rr(g, 8, 44, 48, 44, 3, '#7d3f34');
      vgrad(g, 8, 44, 48, 8, 'rgba(255,240,210,0.15)', 'rgba(0,0,0,0)');
      // Cards fanned in ranks.
      for (let row = 0; row < 2; row++) {
        for (let i = 0; i < 4; i++) {
          const cx = 14 + i * 11;
          const cy = 52 + row * 16;
          const c = i % 2 ? '#b5382e' : '#c9822c';
          for (let f = 0; f < 3; f++) {
            rr(g, cx + f * 2.4, cy - f * 1.4, 8, 12, 1, shade(c, f * 0.09));
          }
          dot(g, cx + 8, cy + 4, 1.6, '#e8d9a8');
        }
      }
      // The hanging sample strings above.
      g.strokeStyle = 'rgba(200,165,91,0.7)';
      g.lineWidth = 1.2;
      g.beginPath();
      g.moveTo(8, 30);
      g.quadraticCurveTo(32, 36, 56, 30);
      g.stroke();
      for (let i = 0; i < 4; i++) {
        rr(g, 13 + i * 12, 31 + Math.sin(i) * 2, 7, 10, 1, i % 2 ? '#c9822c' : '#a4442e');
      }
    }, 64, 96);

    // Book bundles: jute-tied stacks bound for a Kerala reading room, priced
    // by weight and argued by title.
    make('bookbundle', 2, (g, r) => {
      oval(g, 32, 54, 22, 6, 'rgba(30,24,16,0.2)');
      for (const [bx, by, n] of [[16, 50, 5], [36, 52, 4], [27, 38, 4]] as const) {
        for (let i = 0; i < n; i++) {
          const c = r.pick(['#8a5f4a', '#5f7d6a', '#a4442e', '#c9b795', '#54708a'] as const);
          rr(g, bx - 10, by - i * 3.4, 20 + r.int(3), 3.2, 1, shade(c, (r.next() - 0.5) * 0.1));
        }
        // The jute cross-tie.
        g.strokeStyle = 'rgba(160,130,80,0.8)';
        g.lineWidth = 1.6;
        g.beginPath();
        g.moveTo(bx - 1, by - n * 3.4 + 1);
        g.lineTo(bx + 1, by + 3);
        g.stroke();
      }
    });

    // The signstack: shopboards racked three scripts deep, hand-painted,
    // every letter slightly proud of itself.
    make('signstack', 2, (g, r) => {
      softShadow(g, 32, 90, 20, 5, 0.2);
      // The pole they all share.
      rr(g, 29, 30, 5, 58, 2, '#5c4630');
      const boards: [number, number, string][] = [
        [34, 0.1, '#25443c'],
        [50, -0.06, '#8a3428'],
        [66, 0.04, '#2c3e57'],
      ];
      for (const [by, tilt, c] of boards) {
        g.save();
        g.translate(32, by);
        g.rotate(tilt);
        rr(g, -24, -7, 48, 14, 2, shade(c, (r.next() - 0.5) * 0.06));
        // Script rows: Devanagari bar, Nastaliq flow, Latin dashes.
        g.fillStyle = '#e8d9a8';
        g.fillRect(-19, -3.4, 22, 1.6);
        for (let k = 0; k < 4; k++) g.fillRect(-19 + k * 6, -3.4, 1.4, 4);
        g.strokeStyle = '#e8d9a8';
        g.lineWidth = 1.2;
        g.beginPath();
        g.moveTo(6, 0);
        g.quadraticCurveTo(12, 3, 19, -0.5);
        g.stroke();
        for (let k = 0; k < 5; k++) g.fillRect(-18 + k * 7, 3.2, 4.5, 1.6);
        g.restore();
      }
    }, 64, 96);

    // The wire bundle: a pole carrying every current the mohalla has ever
    // subscribed to, sagging like a python that ate the twentieth century.
    make('wirebundle', 2, (g, r) => {
      softShadow(g, 32, 122, 14, 4, 0.2);
      // The pole, leaning by committee.
      const lean = (r.next() - 0.5) * 6;
      g.strokeStyle = '#4a4640';
      g.lineWidth = 6;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(32, 122);
      g.lineTo(32 + lean, 22);
      g.stroke();
      // The great knot at the crossarm.
      blob(g, 32 + lean, 34, 10, '#2e2a26', r, 0.35);
      blob(g, 26 + lean, 40, 6, '#3a3630', r, 0.3);
      blob(g, 39 + lean, 41, 5.5, '#26221e', r, 0.3);
      // Cables swooping off both edges of the frame.
      g.lineWidth = 1.8;
      for (let i = 0; i < 6; i++) {
        g.strokeStyle = i % 2 ? 'rgba(40,36,32,0.85)' : 'rgba(58,54,48,0.85)';
        g.beginPath();
        g.moveTo(32 + lean, 30 + i * 3);
        g.quadraticCurveTo(10, 44 + i * 4, -4, 40 + i * 3);
        g.stroke();
        g.beginPath();
        g.moveTo(32 + lean, 30 + i * 3);
        g.quadraticCurveTo(56, 46 + i * 4, 68, 42 + i * 3);
        g.stroke();
      }
      // One hopeful loop hanging free, and a shoe someone sacrificed.
      g.strokeStyle = 'rgba(40,36,32,0.85)';
      g.beginPath();
      g.arc(40 + lean, 52, 6, -0.4, Math.PI * 1.1);
      g.stroke();
      if (r.chance(0.5)) {
        oval(g, 46 + lean, 60, 3.4, 1.8, '#6b5a44', 0.5);
      }
    }, 64, 128);

    // The cycle rickshaw: tinsel, painted flowers, and a bell that has
    // outlasted three governments. Bantu's uncle owns four; all are "the good one".
    make('rickshaw', 2, (g, r) => {
      softShadow(g, 32, 90, 26, 6, 0.22);
      // Rear wheels and axle.
      for (const wx of [16, 48]) {
        dot(g, wx, 76, 11, '#33302c');
        dot(g, wx, 76, 8, '#4a4640');
        dot(g, wx, 76, 2.4, '#94a0a2');
        g.strokeStyle = 'rgba(180,190,195,0.5)';
        g.lineWidth = 1;
        for (let k = 0; k < 5; k++) {
          const a = (k / 5) * Math.PI * 2 + r.next();
          g.beginPath();
          g.moveTo(wx, 76);
          g.lineTo(wx + Math.cos(a) * 7.5, 76 + Math.sin(a) * 7.5);
          g.stroke();
        }
      }
      // The bench seat and its painted backrest.
      rr(g, 12, 52, 40, 18, 5, shade('#b5382e', (r.next() - 0.5) * 0.08));
      rr(g, 14, 40, 36, 16, 5, '#c94a34');
      vgrad(g, 14, 40, 36, 6, 'rgba(255,255,255,0.2)', 'rgba(0,0,0,0)');
      // Painted flowers on the back panel.
      for (const [fx, fy] of [[22, 48], [32, 46], [42, 48]] as const) {
        for (let p = 0; p < 5; p++) {
          const a = (p / 5) * Math.PI * 2;
          oval(g, fx + Math.cos(a) * 2.6, fy + Math.sin(a) * 2.6, 1.8, 1.1, '#e8d9a8', a);
        }
        dot(g, fx, fy, 1.3, '#c9822c');
      }
      // The folded canopy behind, striped.
      rr(g, 16, 30, 32, 9, 4, '#25443c');
      g.fillStyle = '#e8d9a8';
      g.fillRect(22, 30, 5, 9);
      g.fillRect(36, 30, 5, 9);
      // Tinsel garland on the handle side.
      g.strokeStyle = 'rgba(220,180,90,0.8)';
      g.lineWidth = 1.4;
      g.beginPath();
      g.moveTo(14, 40);
      g.quadraticCurveTo(32, 34, 50, 40);
      g.stroke();
    }, 64, 96);

    // The mango thela: a handcart of langra and chausa in straw, priced by
    // conviction, haggled by choreography.
    make('thela', 1, (g) => {
      softShadow(g, 64, 90, 44, 7, 0.22);
      // Cart bed and frame.
      rr(g, 16, 56, 96, 16, 3, '#8a6a44');
      vgrad(g, 16, 56, 96, 5, 'rgba(255,240,210,0.2)', 'rgba(0,0,0,0)');
      // Wheels: two big wooden ones.
      for (const wx of [34, 94]) {
        dot(g, wx, 80, 12, '#5c4630');
        dot(g, wx, 80, 9, '#7d5e3c');
        dot(g, wx, 80, 2.6, '#33302c');
      }
      // The handles.
      g.strokeStyle = '#7d5e3c';
      g.lineWidth = 3.4;
      g.beginPath();
      g.moveTo(16, 60);
      g.lineTo(2, 66);
      g.moveTo(112, 60);
      g.lineTo(126, 66);
      g.stroke();
      // Straw bed.
      oval(g, 64, 54, 46, 7, '#d9c088');
      // The mango pyramid, green-gold, one cut open to argue quality.
      for (let row = 0; row < 3; row++) {
        for (let i = 0; i < 9 - row * 2; i++) {
          const mx = 28 + row * 8 + i * 8;
          const my = 50 - row * 6;
          const c = ['#c9a23c', '#a8a04a', '#c98a2c'][(i + row) % 3] ?? '#c9a23c';
          oval(g, mx, my, 4.6, 3.6, shade(c, ((i * row) % 3) * 0.04 - 0.03), 0.4);
          dot(g, mx - 1.4, my - 1.2, 1, shade(c, 0.22));
        }
      }
      oval(g, 104, 50, 4.4, 3.2, '#e8b23c', 0.3);
      dot(g, 104, 50, 2, '#f2cf5e');
      // The price slate, negotiable by design.
      rr(g, 8, 42, 12, 10, 1, '#33302c');
      g.strokeStyle = '#e8e0cc';
      g.lineWidth = 1.2;
      g.beginPath();
      g.moveTo(10, 46);
      g.lineTo(17, 45);
      g.moveTo(10, 49);
      g.lineTo(15, 49);
      g.stroke();
    }, 128, 96);

    // The garland line: marigold and rose strung shoulder-high, sold by the
    // arm's length, smelling like every ceremony at once.
    make('garlandline', 1, (g) => {
      softShadow(g, 64, 90, 44, 6, 0.16);
      rr(g, 8, 34, 4.5, 56, 2, '#6f5238');
      rr(g, 115, 34, 4.5, 56, 2, '#6f5238');
      g.strokeStyle = '#4a4034';
      g.lineWidth = 1.6;
      g.beginPath();
      g.moveTo(10, 38);
      g.quadraticCurveTo(64, 46, 117, 38);
      g.stroke();
      // Garland strands, orange with rose punctuation.
      for (let i = 0; i < 6; i++) {
        const gx = 18 + i * 17;
        const sag = 40 + (1 - Math.abs(i - 2.5) / 2.5) * 4;
        const len = 30 + (i % 3) * 6;
        for (let b = 0; b < 8; b++) {
          const by = sag + b * (len / 8);
          const c = b % 4 === 3 ? '#c04858' : b % 2 ? '#e8952c' : '#d97a1e';
          dot(g, gx + Math.sin(b * 1.3 + i) * 1.6, by, 3.1, c);
        }
        dot(g, gx, sag + len + 3, 2.2, '#5f7d3a');
      }
      // Loose petals below, the day's soft accounting.
      for (const [px2, py] of [[30, 86], [58, 88], [86, 85], [104, 87]] as const) {
        oval(g, px2, py, 2.4, 1.2, '#e8952c', 0.5);
      }
    }, 128, 96);

    // The monkey wire: two poles, one cable, and the morning commute of
    // Kucha Aab-o-Daana's least official residents.
    make('monkeywire', 1, (g) => {
      softShadow(g, 64, 122, 40, 6, 0.16);
      g.strokeStyle = '#4a4640';
      g.lineWidth = 5;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(14, 122);
      g.lineTo(12, 30);
      g.moveTo(114, 122);
      g.lineTo(116, 34);
      g.stroke();
      // The wire, weighted mid-span by traffic.
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(12, 34);
      g.quadraticCurveTo(64, 50, 116, 38);
      g.stroke();
      // Three commuters: one walking, one hanging, one supervising.
      const monkey = (mx: number, my: number, pose: number) => {
        const fur = '#8a7258';
        if (pose === 0) {
          oval(g, mx, my - 4, 6, 4.5, fur);
          dot(g, mx + 6, my - 7, 3.2, fur);
          g.strokeStyle = fur;
          g.lineWidth = 2;
          g.beginPath();
          g.moveTo(mx - 5, my - 2);
          g.quadraticCurveTo(mx - 12, my - 10, mx - 9, my - 16);
          g.stroke();
          dot(g, mx + 7, my - 8, 1, '#33302c');
        } else if (pose === 1) {
          g.strokeStyle = fur;
          g.lineWidth = 2.2;
          g.beginPath();
          g.moveTo(mx, my);
          g.lineTo(mx, my + 7);
          g.stroke();
          oval(g, mx, my + 11, 4.5, 5.5, fur);
          dot(g, mx - 3, my + 15, 2.8, fur);
        } else {
          oval(g, mx, my - 3, 5, 4, fur);
          dot(g, mx - 4, my - 7, 3, fur);
          g.strokeStyle = fur;
          g.lineWidth = 1.8;
          g.beginPath();
          g.moveTo(mx + 4, my - 1);
          g.quadraticCurveTo(mx + 10, my - 6, mx + 9, my - 12);
          g.stroke();
        }
      };
      monkey(40, 44, 0);
      monkey(70, 47, 1);
      monkey(96, 41, 2);
    }, 128, 128);

    // The peepal at the chowk: older than the paving and most of the
    // opinions, with a small shrine and a thread-tied trunk.
    make('peepal', 2, (g, r) => {
      softShadow(g, 32, 122, 28, 6, 0.24);
      // The built-up chabutra: a two-step masonry platform ringing the
      // trunk, seat of the maidan's standing committee on everything.
      rr(g, 6, 108, 52, 16, 4, '#b0a08a');
      vgrad(g, 6, 108, 52, 5, 'rgba(255,245,225,0.25)', 'rgba(0,0,0,0)');
      rr(g, 14, 100, 36, 12, 3, '#c1ad92');
      vgrad(g, 14, 100, 36, 4, 'rgba(255,245,225,0.3)', 'rgba(0,0,0,0)');
      // Whitewash band and the red ochre skirt, renewed each Diwali.
      g.fillStyle = 'rgba(240,235,220,0.5)';
      g.fillRect(6, 108, 52, 3);
      g.fillStyle = 'rgba(164,68,46,0.45)';
      g.fillRect(6, 120, 52, 4);
      // Broad fluted trunk.
      g.strokeStyle = '#8a7a62';
      g.lineWidth = 12;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(32, 122);
      g.quadraticCurveTo(28, 88, 31, 56);
      g.stroke();
      g.strokeStyle = 'rgba(90,75,55,0.4)';
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(27, 116);
      g.quadraticCurveTo(25, 92, 28, 70);
      g.stroke();
      // The sacred thread wound round, red and gold.
      for (let k = 0; k < 3; k++) {
        g.strokeStyle = k % 2 ? '#c04a30' : '#c8a55b';
        g.lineWidth = 1.6;
        g.beginPath();
        g.moveTo(25, 96 + k * 4);
        g.quadraticCurveTo(32, 98 + k * 4, 39, 96 + k * 4);
        g.stroke();
      }
      // A generous heart-leafed crown, wide as the whole frame allows.
      blob(g, 16, 48, 15, '#5f7d3a', r, 0.25);
      blob(g, 48, 46, 16, '#4d6b30', r, 0.25);
      blob(g, 32, 32, 20, '#567536', r, 0.24);
      blob(g, 32, 16, 14, '#5f7d3a', r, 0.26);
      blob(g, 12, 32, 11, '#4d6b30', r, 0.25);
      blob(g, 52, 30, 11, '#5f7d3a', r, 0.25);
      // A few leaves showing their drip-tips.
      for (let i = 0; i < 5; i++) {
        const lx = 16 + r.int(32);
        const ly = 20 + r.int(28);
        oval(g, lx, ly, 2.6, 1.8, '#7a9a4a', 0.6);
        g.strokeStyle = '#7a9a4a';
        g.lineWidth = 0.8;
        g.beginPath();
        g.moveTo(lx + 2, ly + 1);
        g.lineTo(lx + 4, ly + 3.4);
        g.stroke();
      }
      // The shrine niche at the base: one diya, two marigolds.
      rr(g, 40, 106, 14, 14, 3, '#b5713f');
      rr(g, 43, 110, 8, 10, 4, '#7a4a2e');
      glowSpot(g, 47, 114, 6, '#ffca6a', 0.5);
      dot(g, 42, 119, 2, '#e8952c');
      dot(g, 52, 119, 2, '#e8952c');
    }, 64, 128);

    // The hand pump: cast iron, public, undefeated. Water for porters,
    // pigeons, and anyone whose kulhad survived the chai.
    make('handpump', 1, (g) => {
      softShadow(g, 32, 90, 16, 4, 0.2);
      // Concrete plinth, darkened where the water lives.
      rr(g, 14, 76, 36, 12, 3, '#a8a096');
      oval(g, 32, 84, 14, 4, 'rgba(60,70,75,0.4)');
      // The body.
      rr(g, 27, 40, 10, 40, 4, '#3a4a52');
      vgrad(g, 27, 40, 10, 12, 'rgba(255,255,255,0.2)', 'rgba(0,0,0,0)');
      // The spout and the long handle at rest.
      rr(g, 35, 52, 12, 6, 3, '#3a4a52');
      g.strokeStyle = '#2c3a40';
      g.lineWidth = 4;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(30, 42);
      g.lineTo(12, 32);
      g.stroke();
      dot(g, 12, 32, 3, '#2c3a40');
      // The drip that never fully retires.
      dot(g, 45, 62, 1.4, 'rgba(180,210,220,0.8)');
      dot(g, 44, 70, 1.1, 'rgba(180,210,220,0.6)');
      // A brass lota waiting its turn.
      oval(g, 52, 84, 5, 3.4, '#c8973b');
      oval(g, 52, 81, 3.4, 1.6, '#a2762c');
    }, 64, 96);

    // The gully wicket: three stumps chalked on a wall that has kept
    // wicket for forty years and never once walked.
    make('gullywall', 1, (g, r) => {
      softShadow(g, 32, 90, 26, 5, 0.18);
      rr(g, 4, 30, 56, 58, 2, '#c1a58c');
      vgrad(g, 4, 30, 56, 10, 'rgba(90,75,55,0.2)', 'rgba(0,0,0,0)');
      vgrad(g, 4, 74, 56, 14, 'rgba(0,0,0,0)', 'rgba(80,70,55,0.25)');
      // The stumps, redrawn each season, arguing with their ancestors.
      g.strokeStyle = 'rgba(250,248,240,0.3)';
      g.lineWidth = 2;
      for (const sx of [22, 28, 34]) {
        g.beginPath();
        g.moveTo(sx + 6, 56);
        g.lineTo(sx + 5, 78);
        g.stroke();
      }
      g.strokeStyle = 'rgba(250,248,240,0.85)';
      g.lineWidth = 2.6;
      for (const sx of [26, 32, 38]) {
        g.beginPath();
        g.moveTo(sx, 52 + r.int(2));
        g.lineTo(sx - 1, 80);
        g.stroke();
      }
      g.beginPath();
      g.moveTo(24, 51);
      g.lineTo(41, 50);
      g.stroke();
      // Tennis-ball scuffs and one LBW verdict in chalk, appealed forever.
      for (let i = 0; i < 6; i++) {
        dot(g, 10 + r.int(44), 38 + r.int(40), 1.8 + r.next(), 'rgba(150,140,80,0.4)');
      }
      g.strokeStyle = 'rgba(250,248,240,0.5)';
      g.lineWidth = 1.4;
      g.beginPath();
      g.moveTo(46, 40);
      g.lineTo(54, 40);
      g.moveTo(46, 44);
      g.lineTo(52, 44);
      g.stroke();
    }, 64, 96);

    // The bird ward table: Sushila's cotton, splints, and a patient in a
    // towel. Zero sentiment, total attention.
    make('birdward', 1, (g) => {
      softShadow(g, 32, 90, 22, 5, 0.2);
      // The folding table.
      rr(g, 8, 54, 48, 8, 2, '#7d5e3c');
      g.strokeStyle = '#5c4630';
      g.lineWidth = 3;
      g.beginPath();
      g.moveTo(14, 62);
      g.lineTo(20, 88);
      g.moveTo(50, 62);
      g.lineTo(44, 88);
      g.stroke();
      // The white cloth, boiled honest.
      rr(g, 10, 48, 44, 9, 2, '#efe8d8');
      // Cotton roll, splint sticks, the little scissors.
      oval(g, 18, 47, 5, 3.4, '#f6f2e6');
      rr(g, 27, 45, 10, 2, 1, '#c9b795');
      rr(g, 27, 48, 10, 2, 1, '#c9b795');
      g.strokeStyle = '#7d8a8c';
      g.lineWidth = 1.6;
      g.beginPath();
      g.moveTo(42, 45);
      g.lineTo(48, 50);
      g.moveTo(48, 45);
      g.lineTo(42, 50);
      g.stroke();
      // The patient: a pigeon wrapped like a small grey burrito, one eye
      // supervising the treatment.
      oval(g, 32, 38, 7, 5, '#8c8a94');
      dot(g, 38, 35, 3.4, '#6e6c78');
      dot(g, 39.4, 34.4, 1, '#2b2118');
      rr(g, 26, 36, 9, 6, 3, '#e8e0cc');
      // The donations tin, unlabeled, full anyway.
      rr(g, 6, 44, 8, 12, 2, '#5f7d6a');
    }, 64, 96);

    // The nishan sahib: the saffron standard over the gurdwara square,
    // visible from every roof, pointing the hungry home.
    make('nishansahib', 1, (g) => {
      softShadow(g, 32, 122, 12, 4, 0.2);
      // The tall mast, cloth-wrapped in saffron.
      rr(g, 29.5, 22, 5, 100, 2.5, '#d98a2c');
      g.strokeStyle = 'rgba(160,90,20,0.4)';
      g.lineWidth = 1.2;
      for (let y = 30; y < 118; y += 9) {
        g.beginPath();
        g.moveTo(29.5, y);
        g.lineTo(34.5, y - 3);
        g.stroke();
      }
      // The khanda finial.
      dot(g, 32, 18, 3.4, '#c8973b');
      g.strokeStyle = '#c8973b';
      g.lineWidth = 1.6;
      g.beginPath();
      g.moveTo(32, 12);
      g.lineTo(32, 24);
      g.stroke();
      // The pennant, mid-breeze.
      g.fillStyle = '#e8952c';
      g.beginPath();
      g.moveTo(34, 24);
      g.quadraticCurveTo(52, 26, 58, 34);
      g.quadraticCurveTo(48, 36, 34, 40);
      g.closePath();
      g.fill();
      g.strokeStyle = 'rgba(120,60,10,0.5)';
      g.lineWidth = 1.2;
      g.beginPath();
      g.moveTo(38, 28);
      g.lineTo(50, 32);
      g.stroke();
    }, 64, 128);

    // ------------------------------------------------- rooftop kit

    // The kabootar khana: Yusuf's whitewashed coop, wire fronts, named
    // tenants. The perch rail is the throne room.
    make('kabootarkhana', 1, (g) => {
      softShadow(g, 32, 90, 26, 6, 0.22);
      // The coop box on legs.
      rr(g, 10, 78, 5, 10, 2, '#6f5238');
      rr(g, 49, 78, 5, 10, 2, '#6f5238');
      rr(g, 6, 36, 52, 44, 3, '#e8e0d0');
      vgrad(g, 6, 36, 52, 8, 'rgba(255,255,255,0.4)', 'rgba(0,0,0,0)');
      // Sloped tin lid.
      g.beginPath();
      g.moveTo(2, 38);
      g.lineTo(62, 38);
      g.lineTo(56, 26);
      g.lineTo(8, 26);
      g.closePath();
      g.fillStyle = '#8a8478';
      g.fill();
      // Wire-front compartments.
      for (const [cx, cy] of [[16, 48], [32, 48], [48, 48], [16, 66], [32, 66], [48, 66]] as const) {
        rr(g, cx - 7, cy - 8, 14, 16, 2, '#4a4034');
        g.strokeStyle = 'rgba(220,225,230,0.4)';
        g.lineWidth = 0.8;
        for (let k = -6; k <= 6; k += 3) {
          g.beginPath();
          g.moveTo(cx + k, cy - 8);
          g.lineTo(cx + k, cy + 8);
          g.stroke();
        }
      }
      // Tenants at the doors and one on the ridge, clearly management.
      for (const [px2, py] of [[16, 46], [48, 64]] as const) {
        oval(g, px2, py, 3.4, 2.6, '#a8a6b0');
        dot(g, px2 + 3, py - 1.6, 1.8, '#8c8a94');
      }
      oval(g, 30, 23, 4, 3, '#e8e4dc');
      dot(g, 34, 21, 2, '#d0ccc4');
      // The perch rail out front.
      g.strokeStyle = '#6f5238';
      g.lineWidth = 2.4;
      g.beginPath();
      g.moveTo(4, 84);
      g.lineTo(60, 84);
      g.stroke();
    }, 64, 96);

    // Patangs leaning in a paper rainbow: fighters, all of them, tissue and
    // bamboo, waiting for the wind to open negotiations.
    make('kitestack', 2, (g, r) => {
      softShadow(g, 32, 90, 20, 5, 0.18);
      const kite = (kx: number, ky: number, s: number, c: string, tilt: number) => {
        g.save();
        g.translate(kx, ky);
        g.rotate(tilt);
        g.fillStyle = c;
        g.beginPath();
        g.moveTo(0, -14 * s);
        g.lineTo(10 * s, 0);
        g.lineTo(0, 12 * s);
        g.lineTo(-10 * s, 0);
        g.closePath();
        g.fill();
        // Spine and bow.
        g.strokeStyle = 'rgba(60,44,26,0.5)';
        g.lineWidth = 1;
        g.beginPath();
        g.moveTo(0, -14 * s);
        g.lineTo(0, 12 * s);
        g.moveTo(-10 * s, 0);
        g.quadraticCurveTo(0, -4 * s, 10 * s, 0);
        g.stroke();
        // The little tail fin.
        g.fillStyle = shade(c, -0.15);
        g.beginPath();
        g.moveTo(0, 12 * s);
        g.lineTo(3.4 * s, 17 * s);
        g.lineTo(-3.4 * s, 17 * s);
        g.closePath();
        g.fill();
        g.restore();
      };
      const colors = ['#c04858', '#3d6b58', '#c9822c', '#54708a', '#b5382e', '#8a4a7d'];
      for (let i = 0; i < 5; i++) {
        kite(14 + i * 9, 56 - (i % 2) * 8, 1.3 + (i % 3) * 0.16, shade(colors[(i + r.int(2)) % 6] ?? '#c04858', (r.next() - 0.5) * 0.08), -0.55 + i * 0.24);
      }
    }, 64, 96);

    // The charkhi: the spool of plain cotton dor. No glass on this roof;
    // the sky has enough blood in it, says the ustad.
    make('charkhi', 1, (g) => {
      oval(g, 32, 52, 16, 5, 'rgba(30,24,16,0.2)');
      // The drum wound fat with white dor.
      oval(g, 30, 40, 13, 8, '#e8e0cc', 0.3);
      oval(g, 30, 40, 10, 6, '#f2ecd8', 0.3);
      g.strokeStyle = 'rgba(150,140,120,0.5)';
      g.lineWidth = 0.8;
      for (let k = 0; k < 5; k++) {
        g.beginPath();
        g.ellipse(30, 40, 11 - k * 1.8, 6.6 - k * 1.1, 0.3, 0, Math.PI * 2);
        g.stroke();
      }
      // The two handles through the axis.
      g.strokeStyle = '#8a6a44';
      g.lineWidth = 3.4;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(16, 34);
      g.lineTo(10, 30);
      g.moveTo(44, 46);
      g.lineTo(50, 50);
      g.stroke();
      // The line running off toward the sky's business.
      g.strokeStyle = 'rgba(240,236,220,0.8)';
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(38, 34);
      g.quadraticCurveTo(50, 24, 60, 10);
      g.stroke();
    });

    // A water tank on stilts: the roof's black-hatted civil servant.
    make('watertank', 1, (g) => {
      softShadow(g, 32, 90, 22, 5, 0.22);
      // Stilts.
      g.strokeStyle = '#5c5650';
      g.lineWidth = 3.4;
      for (const [x1, x2] of [[18, 14], [32, 32], [46, 50]] as const) {
        g.beginPath();
        g.moveTo(x1, 62);
        g.lineTo(x2, 88);
        g.stroke();
      }
      // The black barrel.
      rr(g, 12, 30, 40, 34, 8, '#33302c');
      vgrad(g, 12, 30, 40, 12, 'rgba(255,255,255,0.12)', 'rgba(0,0,0,0)');
      oval(g, 32, 30, 20, 6, '#3f3c38');
      oval(g, 32, 28, 8, 3, '#4a4640');
      // Ribs and the supply pipe.
      g.strokeStyle = 'rgba(255,255,255,0.1)';
      g.lineWidth = 2;
      for (const y of [40, 50, 58]) {
        g.beginPath();
        g.moveTo(13, y);
        g.lineTo(51, y);
        g.stroke();
      }
      g.strokeStyle = '#6b655c';
      g.lineWidth = 2.4;
      g.beginPath();
      g.moveTo(48, 64);
      g.lineTo(48, 88);
      g.stroke();
      // One pigeon on the lid. There is always one pigeon on the lid.
      oval(g, 26, 24, 3.4, 2.6, '#a8a6b0');
      dot(g, 29, 22.4, 1.8, '#8c8a94');
    }, 64, 96);

    // The dhobi line: the mohalla's flags flying over the terrace, kurtas
    // and dupattas semaphoring the weather forecast.
    make('dhobiline', 2, (g, r) => {
      softShadow(g, 64, 90, 46, 6, 0.15);
      rr(g, 8, 36, 4.5, 54, 2, '#6f5238');
      rr(g, 115, 36, 4.5, 54, 2, '#6f5238');
      g.strokeStyle = '#4a4034';
      g.lineWidth = 1.8;
      g.beginPath();
      g.moveTo(10, 40);
      g.quadraticCurveTo(64, 50, 117, 40);
      g.stroke();
      const cloths: [string, number][] = [
        ['#efe8d8', 30], ['#c04858', 26], ['#54708a', 32], ['#c9822c', 24], ['#5f7d6a', 30],
      ];
      let cx = 14;
      for (const [c, h] of cloths) {
        const topY = 40 + (1 - Math.abs(cx - 64) / 64) * 8;
        const w = 17 + r.int(3);
        g.fillStyle = shade(c, (r.next() - 0.5) * 0.05);
        g.beginPath();
        g.moveTo(cx, topY);
        g.lineTo(cx + w, topY + 1);
        g.lineTo(cx + w - 2, topY + h);
        g.quadraticCurveTo(cx + w / 2, topY + h + 5, cx + 1, topY + h - 1);
        g.closePath();
        g.fill();
        vgrad(g, cx + w / 2 - 2, topY + 2, 4, h - 4, 'rgba(255,250,235,0.2)', 'rgba(0,0,0,0)');
        dot(g, cx + 2, topY, 1.4, '#8a6a44');
        dot(g, cx + w - 2, topY + 1, 1.4, '#8a6a44');
        cx += w + 4;
      }
      // One dupatta gone AWOL onto the parapet.
      oval(g, 104, 84, 9, 3, '#c04858', 0.3);
    }, 128, 96);

    // The jugaad antenna: television by ambition, guyed with kite string,
    // aimed at a transmitter it believes in.
    make('antennajugaad', 1, (g) => {
      softShadow(g, 32, 122, 14, 4, 0.18);
      // The bamboo mast, spliced once.
      g.strokeStyle = '#a8895e';
      g.lineWidth = 4;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(32, 122);
      g.lineTo(30, 40);
      g.stroke();
      rr(g, 27, 78, 8, 6, 2, '#8a6a44');
      // The antenna head: a spine and its ribs, one bent by a monkey.
      g.strokeStyle = '#7d8a8c';
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(30, 40);
      g.lineTo(29, 16);
      g.stroke();
      for (let k = 0; k < 4; k++) {
        const y = 20 + k * 6;
        g.beginPath();
        g.moveTo(29 - 10 + k, y);
        g.lineTo(29 + 10 - k, y - (k === 1 ? 3 : 0));
        g.stroke();
      }
      // The kite-string guys, tied to whatever agreed to hold.
      g.strokeStyle = 'rgba(240,236,220,0.7)';
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(30, 46);
      g.lineTo(6, 112);
      g.moveTo(30, 46);
      g.lineTo(56, 116);
      g.stroke();
      // The cable wandering off to a window below.
      g.strokeStyle = '#33302c';
      g.lineWidth = 1.6;
      g.beginPath();
      g.moveTo(31, 60);
      g.quadraticCurveTo(48, 90, 60, 120);
      g.stroke();
    }, 64, 128);

    // The Red Fort's wall, painted as distance: a long red rampart with
    // merlons, holding the horizon down. Seamless, so the whole northern
    // edge reads as one wall under one sky.
    make('fortwall', 3, (g, r) => {
      // Composed for the camera: only art rows 32..96 ever show (the map
      // clamps at the skyline row), so sky and wall both live down there.
      vgrad(g, 0, 0, 64, 76, '#d3cabb', '#b3ada0');
      if (r.chance(0.5)) {
        oval(g, 10 + r.int(44), 42 + r.int(12), 18, 5, 'rgba(240,238,232,0.25)');
      }
      if (r.chance(0.35)) {
        oval(g, 8 + r.int(44), 50 + r.int(10), 14, 4, 'rgba(150,148,140,0.2)');
      }
      // Kites far off in the sky band, other rooftops' ambitions.
      if (r.chance(0.4)) {
        const kx = 8 + r.int(48);
        const ky = 48 + r.int(14);
        g.fillStyle = r.chance(0.5) ? 'rgba(192,72,88,0.7)' : 'rgba(84,112,138,0.7)';
        g.beginPath();
        g.moveTo(kx, ky - 2.6);
        g.lineTo(kx + 2, ky);
        g.lineTo(kx, ky + 2.2);
        g.lineTo(kx - 2, ky);
        g.closePath();
        g.fill();
      }
      // A pigeon streak, mid-wheel.
      if (r.chance(0.45)) {
        g.strokeStyle = 'rgba(90,90,100,0.5)';
        g.lineWidth = 1;
        const bx = 10 + r.int(40);
        const by = 50 + r.int(12);
        for (let k = 0; k < 3; k++) {
          g.beginPath();
          g.moveTo(bx + k * 5, by + (k % 2));
          g.quadraticCurveTo(bx + 2 + k * 5, by - 2 + (k % 2), bx + 4 + k * 5, by + (k % 2));
          g.stroke();
        }
      }
      const red = '#a04a38';
      vgrad(g, 0, 72, 64, 24, shade(red, 0.06), shade(red, -0.1));
      // Merlons along the rampart.
      for (let x = 0; x < 64; x += 16) {
        rr(g, x + 2, 64, 12, 12, 2, shade(red, 0.02));
      }
      // Arched gallery line and heat haze at the base.
      g.strokeStyle = 'rgba(60,24,18,0.3)';
      g.lineWidth = 1.6;
      for (let x = 8; x < 64; x += 16) {
        g.beginPath();
        g.arc(x, 88, 5, Math.PI, 0);
        g.stroke();
      }
      vgrad(g, 0, 72, 64, 10, 'rgba(230,215,190,0.22)', 'rgba(0,0,0,0)');
      vgrad(g, 0, 88, 64, 8, 'rgba(0,0,0,0)', 'rgba(200,190,170,0.3)');
    }, 64, 96);

    // Jama Masjid's domes, painted as distance: white marble weather rising
    // behind the fort wall's long red line. The wall band matches `fortwall`
    // exactly, so the skyline reads as one horizon.
    make('jamadomes', 1, (g) => {
      // Composed for the camera: same 96 height as `fortwall` so the two
      // share one horizon, domes rising from directly behind the merlons.
      vgrad(g, 0, 0, 128, 76, '#d3cabb', '#b3ada0');
      oval(g, 100, 40, 20, 5, 'rgba(240,238,232,0.25)');
      oval(g, 26, 46, 15, 4, 'rgba(150,148,140,0.2)');
      // The mosque, far off, riding above the rampart line.
      const dome = (dx: number, s: number) => {
        g.fillStyle = '#e8e4dc';
        g.beginPath();
        g.moveTo(dx - 15 * s, 74);
        g.quadraticCurveTo(dx - 16 * s, 52, dx, 42 - 6 * s);
        g.quadraticCurveTo(dx + 16 * s, 52, dx + 15 * s, 74);
        g.closePath();
        g.fill();
        // Marble stripes and the golden finial.
        g.strokeStyle = 'rgba(40,40,44,0.4)';
        g.lineWidth = 1.4;
        g.beginPath();
        g.moveTo(dx - 9 * s, 56);
        g.quadraticCurveTo(dx, 46 - 5 * s, dx + 9 * s, 56);
        g.stroke();
        g.strokeStyle = '#c8973b';
        g.lineWidth = 1.6;
        g.beginPath();
        g.moveTo(dx, 42 - 6 * s);
        g.lineTo(dx, 36 - 6 * s);
        g.stroke();
        dot(g, dx, 35 - 6 * s, 1.8, '#c8973b');
      };
      dome(40, 0.8);
      dome(88, 0.8);
      dome(64, 1.05);
      // The minarets flanking, riding higher than everything.
      for (const mx of [16, 112]) {
        rr(g, mx - 3, 40, 6, 34, 2.5, '#d8d2c6');
        oval(g, mx, 39, 5, 3, '#e8e4dc');
        dot(g, mx, 35, 1.5, '#c8973b');
      }
      // The rampart in front, exactly the fortwall recipe.
      const red = '#a04a38';
      vgrad(g, 0, 72, 128, 24, shade(red, 0.06), shade(red, -0.1));
      for (let x = 0; x < 128; x += 16) {
        rr(g, x + 2, 64, 12, 12, 2, shade(red, 0.02));
      }
      g.strokeStyle = 'rgba(60,24,18,0.3)';
      g.lineWidth = 1.6;
      for (let x = 8; x < 128; x += 16) {
        g.beginPath();
        g.arc(x, 88, 5, Math.PI, 0);
        g.stroke();
      }
      vgrad(g, 0, 72, 128, 10, 'rgba(230,215,190,0.22)', 'rgba(0,0,0,0)');
      vgrad(g, 0, 88, 128, 8, 'rgba(0,0,0,0)', 'rgba(200,190,170,0.3)');
    }, 128, 96);

    // The parapet: brick lace at knee height, edge to edge so runs of it
    // read as one low wall. The correct place for elbows and evenings.
    make('parapet', 3, (g, r) => {
      vgrad(g, 0, 30, 64, 34, shade('#b08968', 0.04), shade('#b08968', -0.08));
      vgrad(g, 0, 30, 64, 6, 'rgba(255,245,225,0.25)', 'rgba(0,0,0,0)');
      // Jaali gaps in an even rhythm across the tile seam.
      g.fillStyle = 'rgba(60,45,35,0.38)';
      for (let x = 4; x < 64; x += 12) {
        rr(g, x, 38, 6, 10, 2, 'rgba(60,45,35,0.38)');
      }
      // Cap course, continuous.
      rr(g, 0, 26, 64, 7, 0, '#c1a58c');
      vgrad(g, 0, 26, 64, 3, 'rgba(255,250,235,0.3)', 'rgba(0,0,0,0)');
      // Lime wash surviving in patches; one brick gone missing sometimes.
      if (r.chance(0.5)) oval(g, 8 + r.int(46), 50, 7, 3, 'rgba(240,235,220,0.28)');
      if (r.chance(0.2)) rr(g, 6 + r.int(48), 30, 7, 4, 1, 'rgba(90,55,40,0.4)');
    });

    // The tulsi: holy basil in a stepped clay pot, watered before anyone's
    // tea, the roof's one non-negotiable resident.
    make('tulsipot', 2, (g, r) => {
      oval(g, 32, 52, 13, 4, 'rgba(30,24,16,0.2)');
      // The stepped vrindavan pot, whitewashed clay with a red band.
      rr(g, 22, 40, 20, 12, 2, '#c9b198');
      rr(g, 24, 34, 16, 8, 2, '#d8c3a8');
      g.fillStyle = '#a4442e';
      g.fillRect(24, 36, 16, 2.4);
      dot(g, 32, 37, 1, '#e8d9a8');
      // The plant itself, ragged and thriving.
      g.strokeStyle = '#4d6b30';
      g.lineWidth = 1.6;
      g.lineCap = 'round';
      for (let i = 0; i < 5; i++) {
        const a = -0.9 + i * 0.45 + (r.next() - 0.5) * 0.2;
        g.beginPath();
        g.moveTo(32, 34);
        g.quadraticCurveTo(32 + Math.sin(a) * 6, 26, 32 + Math.sin(a) * 10, 20 + r.int(4));
        g.stroke();
      }
      for (let i = 0; i < 9; i++) {
        oval(g, 24 + r.int(17), 18 + r.int(12), 2.4, 1.6, r.chance(0.5) ? '#5f7d3a' : '#567536', r.next());
      }
      // The seed spikes, purple-ish, and one diya at the base.
      dot(g, 28, 17, 1.2, '#8a5a7d');
      dot(g, 37, 19, 1.2, '#8a5a7d');
      oval(g, 43, 49, 3, 1.8, '#b5713f');
    });

    // The transistor: one band, one dial, all of Vividh Bharati. Cricket
    // scores travel roof to roof faster than the ball does.
    make('transistor', 1, (g) => {
      oval(g, 32, 48, 11, 3.4, 'rgba(30,24,16,0.2)');
      // Leatherette body with the woven speaker face.
      rr(g, 20, 32, 24, 15, 2.5, '#7d3f34');
      rr(g, 23, 35, 10, 9, 1.5, '#d9c088');
      g.strokeStyle = 'rgba(90,60,30,0.6)';
      g.lineWidth = 0.8;
      for (let k = 0; k < 4; k++) {
        g.beginPath();
        g.moveTo(24, 36.5 + k * 2);
        g.lineTo(32, 36.5 + k * 2);
        g.stroke();
      }
      // Dial and one confident knob.
      rr(g, 35, 35, 7, 5, 1, '#e8e0cc');
      g.strokeStyle = '#a4442e';
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(38, 35);
      g.lineTo(38, 40);
      g.stroke();
      dot(g, 38.5, 43, 1.6, '#33302c');
      // The aerial, extended with belief, string-spliced at the tip.
      g.strokeStyle = '#94a0a2';
      g.lineWidth = 1.2;
      g.beginPath();
      g.moveTo(42, 32);
      g.lineTo(52, 14);
      g.stroke();
      dot(g, 52, 14, 1, '#c9b795');
    });

    // The chai tray: kettle off the stove, kulhads in ranks, one plate of
    // rusk. The parliament's entire order of business.
    make('chaitray', 1, (g) => {
      oval(g, 32, 48, 15, 4, 'rgba(30,24,16,0.2)');
      // The tin tray.
      oval(g, 32, 44, 17, 6.5, '#8a8a88');
      oval(g, 32, 43, 15, 5.4, '#a8b0b2');
      // The kettle, still deciding if it is done.
      oval(g, 25, 38, 6, 4.6, '#c8973b');
      rr(g, 22, 31, 6, 4, 1.5, '#c8973b');
      g.strokeStyle = '#a2762c';
      g.lineWidth = 1.8;
      g.beginPath();
      g.moveTo(30, 37);
      g.quadraticCurveTo(35, 34, 33, 39);
      g.stroke();
      // Kulhads, three down one up.
      for (let i = 0; i < 3; i++) {
        rr(g, 36 + i * 5.4, 38, 4.4, 5, 1.4, shade('#b5713f', 0.04 * i));
      }
      oval(g, 44, 44, 2.4, 1.4, '#8a5330');
      // Rusk on a saucer, structural until dipped.
      oval(g, 36, 45, 4.4, 2, '#e8e0cc');
      rr(g, 34, 43.4, 4, 2, 0.8, '#c9a35c');
      rr(g, 37.4, 44, 4, 2, 0.8, '#d9b26a');
      glowSpot(g, 26, 30, 6, '#f6ecd8', 0.4);
    });

    // A charpai made up for the season: mattress, razai folded at the foot,
    // one pillow that has heard everything. Anchored against the parapet.
    make('charpaibed', 2, (g, r) => {
      oval(g, 32, 50, 22, 5.5, 'rgba(30,24,16,0.2)');
      // Frame and legs.
      rr(g, 8, 32, 48, 16, 4, '#8a6a44');
      for (const [lx, ly] of [[11, 46], [50, 46]] as const) {
        rr(g, lx, ly, 4, 8, 1.5, '#6f5238');
      }
      // The thin cotton mattress with its printed sheet.
      rr(g, 10, 30, 44, 14, 4, '#e8e0cc');
      vgrad(g, 10, 30, 44, 5, 'rgba(255,255,255,0.4)', 'rgba(0,0,0,0)');
      // Block-print sprigs marching in polite rows.
      g.fillStyle = 'rgba(164,68,46,0.6)';
      for (let px = 15; px < 50; px += 8) {
        for (const py of [34, 40]) {
          dot(g, px + ((py === 40 ? 4 : 0)), py, 1.3, 'rgba(164,68,46,0.6)');
        }
      }
      // The razai folded at the foot, loud on purpose.
      rr(g, 42, 27, 12, 12, 3, shade('#c04858', (r.next() - 0.5) * 0.08));
      g.strokeStyle = 'rgba(255,235,210,0.5)';
      g.lineWidth = 1;
      for (const y of [30, 33, 36]) {
        g.beginPath();
        g.moveTo(43, y);
        g.lineTo(53, y);
        g.stroke();
      }
      // The pillow, dented by an opinion.
      oval(g, 17, 30, 7, 4, '#efe8d8');
      oval(g, 17, 30.4, 3.4, 1.6, 'rgba(120,95,55,0.2)');
    });

    // Diyas on a ledge: clay lamps lit for the dusk flight, the roof's own
    // constellation, maintained nightly. In `glows`.
    make('diyaledge', 1, (g) => {
      oval(g, 32, 48, 14, 4, 'rgba(30,24,16,0.2)');
      // A low whitewashed ledge brick.
      rr(g, 16, 38, 32, 10, 2, '#d8cbb0');
      vgrad(g, 16, 38, 32, 4, 'rgba(255,250,235,0.4)', 'rgba(0,0,0,0)');
      // Three diyas, wicks leaning into the same wind.
      for (const dx of [22, 32, 42]) {
        oval(g, dx, 37, 4, 2.2, '#b5713f');
        oval(g, dx, 36.4, 2.6, 1.2, '#8a5330');
        dot(g, dx + 1, 34.4, 1.1, '#ffca6a');
        glowSpot(g, dx + 1, 34, 6, '#ffca6a', 0.5);
      }
      // A matchbox on duty and one spent match.
      rr(g, 46, 42, 6, 3.4, 0.8, '#54708a');
      g.strokeStyle = '#4a3524';
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(18, 44);
      g.lineTo(22, 43);
      g.stroke();
    });

    // A cut kite snagged on a bamboo pole: some other roof's victory, this
    // roof's flag. Nobody takes it down; that would be admitting things.
    make('kitesnag', 2, (g, r) => {
      softShadow(g, 32, 90, 12, 3.4, 0.18);
      // The bamboo pole, leaning with the story.
      g.strokeStyle = '#a8895e';
      g.lineWidth = 3.4;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(30, 88);
      g.lineTo(34, 14);
      g.stroke();
      g.strokeStyle = 'rgba(120,95,55,0.5)';
      g.lineWidth = 1;
      for (const y of [30, 52, 72]) {
        g.beginPath();
        g.moveTo(31, y);
        g.lineTo(35, y - 1);
        g.stroke();
      }
      // The kite, crumpled mid-surrender, tail wrapped twice.
      const c = r.pick(['#c04858', '#54708a', '#8a4a7d'] as const);
      g.save();
      g.translate(38, 22);
      g.rotate(0.7 + (r.next() - 0.5) * 0.3);
      g.fillStyle = c;
      g.beginPath();
      g.moveTo(0, -11);
      g.lineTo(8, 0);
      g.lineTo(1, 9);
      g.lineTo(-8, -1);
      g.closePath();
      g.fill();
      g.strokeStyle = 'rgba(40,30,20,0.4)';
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(-5, -3);
      g.lineTo(5, 3);
      g.stroke();
      g.restore();
      // The dor wound round the pole and trailing off, still argued over.
      g.strokeStyle = 'rgba(240,236,220,0.8)';
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(34, 18);
      g.quadraticCurveTo(30, 26, 35, 32);
      g.quadraticCurveTo(48, 44, 58, 40);
      g.stroke();
    }, 64, 96);

    // Spilled grain: bajra and wheat by the handful, the flock's payroll,
    // audited continuously by beak.
    make('grainspill', 3, (g, r) => {
      const c1 = '#d9c088';
      const c2 = '#c9a35c';
      oval(g, 32, 42, 10 + r.int(5), 4.4, 'rgba(200,170,110,0.3)');
      for (let i = 0; i < 22; i++) {
        const a = r.next() * Math.PI * 2;
        const d = r.next() * 12;
        oval(g, 32 + Math.cos(a) * d, 42 + Math.sin(a) * d * 0.45, 1.3, 0.8, r.chance(0.6) ? c1 : c2, a);
      }
      // The scoop line where the tin swung past.
      g.strokeStyle = 'rgba(160,130,80,0.3)';
      g.lineWidth = 1.2;
      g.beginPath();
      g.moveTo(22, 46);
      g.quadraticCurveTo(32, 48, 44, 45);
      g.stroke();
      // One feather left as a receipt.
      oval(g, 40 + r.int(6), 38, 3.4, 1.2, 'rgba(180,178,188,0.8)', 0.5);
    });

    // ------------------------------------------------- soft ground decor

    // Pigeons at ground level, employed full-time by spilled grain.
    make('pigeonpeck', 3, (g, r) => {
      const bird = (bx: number, by: number, pecking: boolean) => {
        const grey = r.chance(0.25) ? '#b8a6a0' : '#a8a6b0';
        oval(g, bx, by, 4.2, 3.2, grey);
        if (pecking) {
          dot(g, bx + 4, by + 1.6, 2.2, shade(grey, -0.06));
          g.strokeStyle = '#c9822c';
          g.lineWidth = 1;
          g.beginPath();
          g.moveTo(bx + 6, by + 2.6);
          g.lineTo(bx + 7.4, by + 3.6);
          g.stroke();
        } else {
          dot(g, bx + 3.6, by - 2.6, 2.2, shade(grey, -0.06));
          // The iridescent collar, briefly wealthy in the light.
          g.strokeStyle = 'rgba(90,140,110,0.6)';
          g.lineWidth = 1;
          g.beginPath();
          g.arc(bx + 3, by - 1.4, 2, -0.5, 1.2);
          g.stroke();
        }
        oval(g, bx - 1, by - 0.6, 2.6, 1.8, shade(grey, 0.12), -0.4);
      };
      const n = 2 + r.int(2);
      for (let i = 0; i < n; i++) {
        bird(16 + r.int(30), 34 + r.int(14), r.chance(0.6));
      }
      // Grain, the economy.
      for (let i = 0; i < 4; i++) dot(g, 18 + r.int(28), 42 + r.int(8), 0.8, '#d9c088');
    });

    // A marigold heap: the garland trade's loose change.
    make('marigoldheap', 2, (g, r) => {
      oval(g, 32, 46, 16, 5, 'rgba(30,24,16,0.15)');
      for (let i = 0; i < 12; i++) {
        const a = r.next() * Math.PI * 2;
        const d = r.next() * 11;
        const mx = 32 + Math.cos(a) * d;
        const my = 43 + Math.sin(a) * d * 0.45;
        dot(g, mx, my, 2.6 + r.next() * 1.2, r.chance(0.6) ? '#e8952c' : '#d97a1e');
        dot(g, mx - 0.8, my - 0.8, 1, '#f2b04a');
      }
      if (r.chance(0.5)) dot(g, 26 + r.int(12), 40 + r.int(5), 2.2, '#c04858');
      // One green stem, evidence of process.
      g.strokeStyle = '#5f7d3a';
      g.lineWidth = 1.2;
      g.beginPath();
      g.moveTo(20, 47);
      g.quadraticCurveTo(26, 44, 30, 46);
      g.stroke();
    });

    // Spilled spice: turmeric and chilli dust the porters track down the
    // lane, an involuntary map of the day's deliveries.
    make('spicespill', 3, (g, r) => {
      const c = r.chance(0.5) ? 'rgba(200,140,40,0.5)' : 'rgba(170,60,35,0.45)';
      for (let i = 0; i < 5; i++) {
        oval(g, 20 + r.int(24), 36 + r.int(16), 4 + r.next() * 4, 2 + r.next() * 1.6, c, r.next());
      }
      for (let i = 0; i < 8; i++) {
        dot(g, 18 + r.int(28), 34 + r.int(20), 0.9, c);
      }
      // One sandal print straight through it. Somebody sneezed here.
      oval(g, 34, 44, 4.4, 2, 'rgba(120,90,60,0.3)', 0.4);
    });

    // A monsoon puddle holding the wire bundles and one kite, upside down.
    make('puddle', 2, (g, r) => {
      const w = 18 + r.int(8);
      oval(g, 32, 42, w, w * 0.42, 'rgba(90,105,110,0.55)');
      oval(g, 32, 41, w - 3, (w - 3) * 0.4, 'rgba(150,165,170,0.5)');
      // Sky sheen and the reflected wires.
      oval(g, 28, 39, 8, 3, 'rgba(220,228,230,0.5)');
      g.strokeStyle = 'rgba(60,60,60,0.35)';
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(20, 42);
      g.quadraticCurveTo(32, 44, 45, 41);
      g.stroke();
      // A ring where the last drop landed, still deciding to fade.
      g.strokeStyle = 'rgba(220,230,232,0.35)';
      g.beginPath();
      g.ellipse(36, 42, 4, 1.8, 0, 0, Math.PI * 2);
      g.stroke();
    });

    // Spent kulhads, shattered musically: the correct end of a clay cup.
    make('kulhadshards', 2, (g, r) => {
      oval(g, 32, 46, 13, 4, 'rgba(30,24,16,0.15)');
      const clay = '#b5713f';
      // One survivor, tilted.
      rr(g, 22, 36, 7, 7, 2, shade(clay, 0.05));
      oval(g, 25.5, 36, 3.4, 1.8, '#8a5330');
      // The percussion section.
      for (let i = 0; i < 6; i++) {
        const sx = 30 + r.int(14);
        const sy = 42 + r.int(6);
        g.fillStyle = shade(clay, (r.next() - 0.5) * 0.2);
        g.beginPath();
        g.moveTo(sx, sy);
        g.lineTo(sx + 3 + r.int(3), sy + 1);
        g.lineTo(sx + 1, sy + 3);
        g.closePath();
        g.fill();
      }
      // The chai ghost.
      oval(g, 36, 47, 5, 2, 'rgba(120,80,45,0.25)');
    });

    // A cut kite come to rest: someone's woh kata, now the roof's souvenir.
    make('kitecut', 2, (g, r) => {
      const c = r.pick(['#c04858', '#54708a', '#c9822c'] as const);
      g.save();
      g.translate(32, 40);
      g.rotate((r.next() - 0.5) * 1.4);
      g.fillStyle = shade(c, -0.05);
      g.beginPath();
      g.moveTo(0, -12);
      g.lineTo(9, 0);
      g.lineTo(0, 10);
      g.lineTo(-9, 0);
      g.closePath();
      g.fill();
      // The crumple line and torn corner.
      g.strokeStyle = 'rgba(40,30,20,0.4)';
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(-4, -4);
      g.lineTo(5, 3);
      g.stroke();
      g.fillStyle = 'rgba(240,236,220,0.5)';
      g.beginPath();
      g.moveTo(9, 0);
      g.lineTo(5, 2);
      g.lineTo(7, -2);
      g.closePath();
      g.fill();
      g.restore();
      // Its severed line, trailing off the tile.
      g.strokeStyle = 'rgba(240,236,220,0.7)';
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(32, 30);
      g.quadraticCurveTo(44, 26, 56, 28);
      g.stroke();
    });

    // ------------------------------------------------- interiors

    // A deg: the langar's great pot, dal for five hundred, stirred with an
    // oar-sized khurchana by whoever's arms arrive next.
    make('degpot', 1, (g) => {
      softShadow(g, 32, 90, 22, 5, 0.24);
      // The pot, brass-bellied and blackened below.
      oval(g, 32, 78, 21, 8, '#4a4034');
      rr(g, 11, 46, 42, 34, 14, '#a2762c');
      vgrad(g, 11, 46, 42, 14, 'rgba(255,240,200,0.2)', 'rgba(0,0,0,0)');
      vgrad(g, 11, 66, 42, 14, 'rgba(0,0,0,0)', 'rgba(40,30,20,0.4)');
      oval(g, 32, 46, 21, 7, '#8a6224');
      oval(g, 32, 45, 18, 5.5, '#5f4a1e');
      // Dal at a governed simmer.
      oval(g, 32, 45, 15, 4.4, '#c9a24e');
      dot(g, 26, 44, 1.6, '#e0bd6a');
      dot(g, 37, 45.4, 1.4, '#e0bd6a');
      // The long stirring paddle, resting at parade.
      g.strokeStyle = '#8a6a44';
      g.lineWidth = 3.4;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(46, 42);
      g.lineTo(58, 12);
      g.stroke();
      oval(g, 46, 44, 4.4, 2.2, '#8a6a44', 0.6);
      // Steam, feeding the room before the food does.
      glowSpot(g, 30, 34, 11, '#f6ecd8', 0.5);
    }, 64, 96);

    // The atta board: dough in planetary quantities, and the rolling pins
    // of everyone who ever said "I can help".
    make('attaboard', 1, (g) => {
      oval(g, 32, 52, 20, 5, 'rgba(30,24,16,0.18)');
      // The low chowki.
      rr(g, 10, 38, 44, 14, 3, '#8a6a44');
      vgrad(g, 10, 38, 44, 5, 'rgba(255,240,210,0.2)', 'rgba(0,0,0,0)');
      // The dough, patient as geology.
      oval(g, 26, 36, 9, 6.5, '#e8d9b8');
      oval(g, 24, 34, 5, 3.4, '#f2e6cc');
      // Rolled rotis in a queue, and the pin that made them.
      for (let i = 0; i < 3; i++) {
        oval(g, 42 + i * 3, 40 - i * 2.4, 6.5, 4.4, shade('#e0cfa4', i * 0.03));
      }
      rr(g, 34, 44, 16, 3, 1.5, '#a8895e');
      dot(g, 33, 45.4, 1.6, '#8a6a44');
      dot(g, 51, 45.4, 1.6, '#8a6a44');
      // Flour dust, the room's weather.
      for (const [fx, fy] of [[16, 48], [38, 50], [48, 48]] as const) {
        oval(g, fx, fy, 3.4, 1.4, 'rgba(240,230,205,0.5)');
      }
    });

    // The roti stack: production and blessing in one column.
    make('rotistack', 1, (g) => {
      oval(g, 32, 50, 15, 4.4, 'rgba(30,24,16,0.18)');
      // The cloth-lined basket.
      oval(g, 32, 44, 15, 6, '#c9a35c');
      oval(g, 32, 42, 13, 4.6, '#efe6d2');
      // The stack, leaning with abundance.
      for (let i = 0; i < 6; i++) {
        oval(g, 32 + (i % 2) * 1.6 - 0.8, 40 - i * 2.6, 11 - i * 0.4, 3.4, shade('#e0c894', i * 0.02));
      }
      // Char freckles on the top roti.
      dot(g, 28, 26, 1, '#a8763c');
      dot(g, 35, 27, 0.8, '#a8763c');
      dot(g, 31, 25, 0.7, '#8a5f30');
    });

    // The pangat strip: a mat row where everyone is the same height.
    make('pangat', 2, (g, r) => {
      // A long woven runner, edge to edge of the tile.
      rr(g, 0, 24, 64, 18, 3, '#b09468');
      vgrad(g, 0, 24, 64, 5, 'rgba(255,250,235,0.18)', 'rgba(0,0,0,0)');
      g.strokeStyle = 'rgba(120,95,60,0.4)';
      g.lineWidth = 1;
      for (let x = 4; x < 64; x += 6) {
        g.beginPath();
        g.moveTo(x, 25);
        g.lineTo(x, 41);
        g.stroke();
      }
      g.strokeStyle = 'rgba(90,70,44,0.5)';
      for (const y of [28, 33, 38]) {
        g.beginPath();
        g.moveTo(0, y);
        g.lineTo(64, y);
        g.stroke();
      }
      // A steel thali and katori set at one seat, waiting for its person.
      if (r.chance(0.55)) {
        oval(g, 20 + r.int(24), 33, 6.5, 3.4, '#c9ced0');
        oval(g, 20 + r.int(24), 32, 2.6, 1.4, '#a8b0b2');
      }
    });

    // The rumal basket: cloth squares for uncovered heads. Take one, tie
    // it, belong.
    make('rumalbasket', 1, (g) => {
      oval(g, 32, 50, 14, 4, 'rgba(30,24,16,0.18)');
      // The basket.
      oval(g, 32, 42, 14, 7, '#c9a35c');
      oval(g, 32, 39, 12, 5, '#8a6a44');
      g.strokeStyle = 'rgba(120,86,40,0.5)';
      g.lineWidth = 1;
      for (let k = 0; k < 3; k++) {
        g.beginPath();
        g.ellipse(32, 42 + k * 1.6, 13 - k, 6 - k, 0, 0, Math.PI);
        g.stroke();
      }
      // The rumals: folded triangles in confident colors.
      const cs = ['#e8952c', '#c04858', '#54708a', '#5f7d6a', '#e8e0cc'];
      for (let i = 0; i < 5; i++) {
        const rx = 22 + i * 5;
        g.fillStyle = shade(cs[i] ?? '#e8952c', (i % 2) * 0.06);
        g.beginPath();
        g.moveTo(rx, 38);
        g.lineTo(rx + 6, 36);
        g.lineTo(rx + 3, 32 - (i % 2) * 2);
        g.closePath();
        g.fill();
      }
    });

    // The shoe rack: everyone's dusty miles, parked at the same door.
    make('shoerack', 1, (g) => {
      oval(g, 32, 50, 17, 4.4, 'rgba(30,24,16,0.18)');
      rr(g, 10, 30, 44, 3, 1.5, '#7d5e3c');
      rr(g, 10, 41, 44, 3, 1.5, '#7d5e3c');
      rr(g, 11, 28, 3, 22, 1.5, '#6f5238');
      rr(g, 50, 28, 3, 22, 1.5, '#6f5238');
      // Two shelves of everything: chappals, one office shoe, one tiny pair.
      const shoe = (sx: number, sy: number, w: number, c: string) => {
        oval(g, sx, sy, w, 2.2, c, 0.1);
        dot(g, sx - w + 1.4, sy - 0.8, 1.2, shade(c, 0.15));
      };
      shoe(18, 27, 4.4, '#8a5f4a');
      shoe(27, 27, 4.4, '#8a5f4a');
      shoe(37, 27, 4, '#33302c');
      shoe(45, 27, 4, '#33302c');
      shoe(18, 38, 4.2, '#b5713f');
      shoe(26, 38, 4.2, '#b5713f');
      shoe(36, 38, 2.6, '#c04858');
      shoe(41, 38, 2.6, '#c04858');
      // Floor pair that missed the rack: someone arrived hungry.
      shoe(24, 47, 4.4, '#5c4630');
      shoe(33, 47.6, 4.4, '#5c4630');
    });

    // The doormat: coir, honest, worn thin exactly where a thousand feet
    // agreed to be polite.
    make('doormat', 2, (g, r) => {
      rr(g, 10, 34, 44, 18, 2, '#a8895e');
      g.strokeStyle = 'rgba(120,95,55,0.5)';
      g.lineWidth = 1;
      for (let x = 13; x < 52; x += 4) {
        g.beginPath();
        g.moveTo(x, 35);
        g.lineTo(x, 51);
        g.stroke();
      }
      // The worn middle and a frayed corner.
      oval(g, 32, 43, 12, 5, 'rgba(240,230,205,0.22)');
      g.strokeStyle = 'rgba(160,130,80,0.8)';
      for (let i = 0; i < 3; i++) {
        g.beginPath();
        g.moveTo(53, 36 + i * 2 + r.int(2));
        g.lineTo(57, 35 + i * 3);
        g.stroke();
      }
    });

    // The water station: clay matkas on an iron stand, steel tumblers
    // chained by trust alone. Cold in July, which is the whole ministry.
    make('waterstation', 1, (g) => {
      softShadow(g, 32, 90, 22, 5, 0.2);
      // The stand.
      rr(g, 10, 60, 44, 5, 2, '#5c5650');
      g.strokeStyle = '#5c5650';
      g.lineWidth = 3;
      g.beginPath();
      g.moveTo(14, 64);
      g.lineTo(12, 88);
      g.moveTo(50, 64);
      g.lineTo(52, 88);
      g.stroke();
      // Two matkas, bellied, cloth-capped.
      for (const [mx, s] of [[22, 1], [42, 0.9]] as const) {
        oval(g, mx, 50, 11 * s, 9 * s, '#b5713f');
        oval(g, mx, 44 * (s === 1 ? 1 : 1.02), 6 * s, 3 * s, '#8a5330');
        oval(g, mx, 43, 5.4 * s, 2.4 * s, '#efe6d2');
        // The sweat that keeps it cold.
        oval(g, mx - 3, 52, 4 * s, 2.6 * s, 'rgba(90,60,40,0.25)');
      }
      // Tumblers below, upside down in a wet row.
      for (let i = 0; i < 4; i++) {
        rr(g, 16 + i * 9, 70, 6, 7, 1.5, '#c9ced0');
        oval(g, 19 + i * 9, 77, 3.4, 1.4, 'rgba(120,140,150,0.4)');
      }
      // The drip tray puddle, permanent staff.
      oval(g, 32, 84, 12, 3, 'rgba(90,105,110,0.35)');
    }, 64, 96);

    // The hall fan: a pole-mounted oscillating veteran, cage dented, motor
    // loyal. It has cooled more people than most rivers.
    make('hallfan', 1, (g) => {
      softShadow(g, 32, 90, 14, 4, 0.2);
      // The pole and its weighted base.
      oval(g, 32, 84, 12, 4.4, '#4a4640');
      g.strokeStyle = '#5c5650';
      g.lineWidth = 4;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(32, 84);
      g.lineTo(32, 46);
      g.stroke();
      // The cage, tilted as if mid-sweep.
      g.save();
      g.translate(32, 34);
      g.rotate(-0.12);
      dot(g, 0, 0, 15, '#6b655c');
      dot(g, 0, 0, 13, '#8a8478');
      // Blades, a blur of duty.
      g.fillStyle = 'rgba(60,56,50,0.55)';
      for (let k = 0; k < 3; k++) {
        g.save();
        g.rotate((k * Math.PI * 2) / 3);
        oval(g, 0, -7, 4.4, 6.5, 'rgba(60,56,50,0.55)');
        g.restore();
      }
      dot(g, 0, 0, 3.4, '#4a4640');
      // Cage wires.
      g.strokeStyle = 'rgba(220,220,215,0.35)';
      g.lineWidth = 0.8;
      for (let k = 0; k < 6; k++) {
        g.beginPath();
        g.ellipse(0, 0, 13, 13 - k * 2, k, 0, Math.PI * 2);
        g.stroke();
      }
      g.restore();
      // The ribbon someone tied to prove it works.
      g.strokeStyle = '#c04858';
      g.lineWidth = 1.2;
      g.beginPath();
      g.moveTo(44, 30);
      g.quadraticCurveTo(52, 32, 56, 28);
      g.stroke();
    }, 64, 96);

    // The khanda panel: the emblem on the hall's wall over a saffron drape,
    // the kitchen's compass. Below it, everything is level.
    make('khandapanel', 1, (g) => {
      // Wall plaque with saffron drape; drawn as a wall piece, full height.
      rr(g, 8, 20, 48, 68, 2, '#e8e0d0');
      vgrad(g, 8, 20, 48, 10, 'rgba(90,75,55,0.16)', 'rgba(0,0,0,0)');
      // The drape swagged across the top.
      g.fillStyle = '#d98a2c';
      g.beginPath();
      g.moveTo(8, 24);
      g.quadraticCurveTo(32, 40, 56, 24);
      g.lineTo(56, 20);
      g.lineTo(8, 20);
      g.closePath();
      g.fill();
      for (const fx of [12, 52]) {
        g.beginPath();
        g.moveTo(fx, 22);
        g.lineTo(fx - 2 + (fx > 32 ? 4 : 0), 44);
        g.lineTo(fx + 4 - (fx > 32 ? 4 : 0), 24);
        g.closePath();
        g.fill();
      }
      // The khanda, dark against the whitewash: circle, blade, two kirpans.
      const cy = 58;
      g.strokeStyle = '#33302c';
      g.lineWidth = 2.4;
      g.beginPath();
      g.arc(32, cy, 9, 0, Math.PI * 2);
      g.stroke();
      g.lineWidth = 3;
      g.beginPath();
      g.moveTo(32, cy - 14);
      g.lineTo(32, cy + 12);
      g.stroke();
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(20, cy + 12);
      g.quadraticCurveTo(24, cy - 4, 22, cy - 12);
      g.moveTo(44, cy + 12);
      g.quadraticCurveTo(40, cy - 4, 42, cy - 12);
      g.stroke();
      // A marigold string along the bottom edge.
      for (let fx = 14; fx <= 50; fx += 6) {
        dot(g, fx, 80, 2.2, fx % 12 === 2 ? '#d97a1e' : '#e8952c');
      }
    }, 64, 96);

    // The ladle station: karchhis and khurchanas racked by wingspan, and
    // the bucket of dal on its way to the pangat rows.
    make('ladlestand', 1, (g) => {
      softShadow(g, 32, 90, 20, 5, 0.2);
      // The rack.
      rr(g, 12, 30, 40, 5, 2, '#6f5238');
      g.strokeStyle = '#6f5238';
      g.lineWidth = 3;
      g.beginPath();
      g.moveTo(15, 34);
      g.lineTo(13, 66);
      g.moveTo(49, 34);
      g.lineTo(51, 66);
      g.stroke();
      // Ladles hung in decreasing seniority.
      for (let i = 0; i < 4; i++) {
        const lx = 20 + i * 8;
        g.strokeStyle = '#8a8a88';
        g.lineWidth = 2;
        g.beginPath();
        g.moveTo(lx, 34);
        g.lineTo(lx, 48 + i * 3);
        g.stroke();
        oval(g, lx, 51 + i * 3, 3.6 - i * 0.3, 2.6 - i * 0.2, '#a8b0b2');
      }
      // The serving bucket, brass, two-handed by law.
      oval(g, 32, 78, 12, 5, '#8a6224');
      rr(g, 20, 64, 24, 15, 4, '#a2762c');
      oval(g, 32, 64, 12, 4.4, '#8a6224');
      oval(g, 32, 63.4, 10, 3.4, '#c9a24e');
      g.strokeStyle = '#6b5a2c';
      g.lineWidth = 2;
      g.beginPath();
      g.arc(32, 64, 13, Math.PI * 1.15, Math.PI * 1.85);
      g.stroke();
      glowSpot(g, 32, 56, 8, '#f6ecd8', 0.35);
    }, 64, 96);

    // The thali stack: five hundred steel suns, washed by whoever's hands
    // came, drying into tomorrow's music.
    make('thalistack', 1, (g) => {
      oval(g, 32, 50, 16, 4.4, 'rgba(30,24,16,0.18)');
      // The drying rail crate they lean in.
      rr(g, 14, 40, 36, 10, 2, '#7d5e3c');
      // Thalis on edge, a glinting card deck.
      for (let i = 0; i < 8; i++) {
        const tx = 18 + i * 3.6;
        oval(g, tx, 38, 1.6, 9, '#c9ced0');
        oval(g, tx - 0.5, 38, 0.6, 7, '#e8eef0');
      }
      // Katoris nested beside, a brass measuring cup on top.
      for (let i = 0; i < 3; i++) {
        oval(g, 44 + i * 2.4, 36 - i * 2, 4.4, 2, '#a8b0b2');
      }
      oval(g, 47, 29, 3, 1.8, '#c8973b');
    });

    // The lamp niche: a taaq in the haveli wall, one oil lamp and its
    // half-century of soot, still the room's best reading light. In `glows`.
    make('lampniche', 1, (g) => {
      // Wall panel with an arched recess.
      rr(g, 8, 24, 48, 64, 2, '#e8e0d0');
      vgrad(g, 8, 24, 48, 10, 'rgba(90,75,55,0.16)', 'rgba(0,0,0,0)');
      g.fillStyle = '#3a2e22';
      g.beginPath();
      g.moveTo(20, 76);
      g.lineTo(20, 52);
      g.quadraticCurveTo(20, 40, 32, 38);
      g.quadraticCurveTo(44, 40, 44, 52);
      g.lineTo(44, 76);
      g.closePath();
      g.fill();
      // The cusped plaster edge.
      g.strokeStyle = '#c8b98c';
      g.lineWidth = 1.6;
      g.beginPath();
      g.moveTo(20, 52);
      g.quadraticCurveTo(20, 40, 32, 38);
      g.quadraticCurveTo(44, 40, 44, 52);
      g.stroke();
      // The lamp: brass base, small flame, large opinion.
      rr(g, 28, 64, 8, 8, 2, '#a2762c');
      oval(g, 32, 63, 5, 2, '#c8973b');
      dot(g, 32, 59, 1.6, '#ffca6a');
      glowSpot(g, 32, 58, 10, '#ffca6a', 0.55);
      // Soot above, the lamp's signature.
      vgrad(g, 26, 40, 12, 16, 'rgba(40,32,24,0.4)', 'rgba(0,0,0,0)');
      // A dried rose on the sill, from an anniversary of something.
      oval(g, 40, 74, 2.6, 1.6, '#8a4a4a');
      g.strokeStyle = '#5f7d3a';
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(40, 75);
      g.lineTo(36, 77);
      g.stroke();
    }, 64, 96);

    // Couplet drafts: paper on the floor by the takht, each crumple a
    // second line that refused to land. The wastebasket lost on points.
    make('couplitter', 2, (g, r) => {
      for (let i = 0; i < 3; i++) {
        const px = 20 + r.int(22);
        const py = 36 + r.int(12);
        // A crumple: overlapping creased facets.
        g.fillStyle = shade('#f2ecdc', (r.next() - 0.5) * 0.06);
        g.beginPath();
        g.moveTo(px - 4, py);
        g.lineTo(px - 1, py - 4);
        g.lineTo(px + 4, py - 2);
        g.lineTo(px + 3, py + 3);
        g.lineTo(px - 2, py + 4);
        g.closePath();
        g.fill();
        g.strokeStyle = 'rgba(120,105,80,0.4)';
        g.lineWidth = 0.8;
        g.beginPath();
        g.moveTo(px - 2, py - 2);
        g.lineTo(px + 2, py + 1);
        g.stroke();
      }
      // One flat sheet, two lines and the strike-through of honest work.
      rr(g, 26, 46, 14, 9, 1, '#f6f0e0');
      g.strokeStyle = '#2b2118';
      g.lineWidth = 0.9;
      g.beginPath();
      g.moveTo(37, 49);
      g.quadraticCurveTo(33, 47.4, 29, 49.4);
      g.moveTo(37, 52);
      g.quadraticCurveTo(33, 50.6, 29, 52.4);
      g.stroke();
      g.strokeStyle = 'rgba(160,50,40,0.7)';
      g.beginPath();
      g.moveTo(29, 51.8);
      g.lineTo(37, 51.4);
      g.stroke();
    });

    // The chalk crease: gully cricket's legal system, redrawn after every
    // rain and every argument, which are equally frequent.
    make('chalkpitch', 2, (g, r) => {
      g.strokeStyle = 'rgba(250,248,240,0.55)';
      g.lineWidth = 2;
      // The crease lines, hand-straight, which is to say not.
      g.beginPath();
      g.moveTo(14, 40 + r.int(3));
      g.lineTo(50, 39 + r.int(3));
      g.stroke();
      g.lineWidth = 1.4;
      g.beginPath();
      g.moveTo(20, 34);
      g.lineTo(20, 47);
      g.moveTo(44, 34);
      g.lineTo(44, 47);
      g.stroke();
      // Scuffed-out patch where the last verdict was contested.
      oval(g, 32, 42, 6, 2.6, 'rgba(150,120,90,0.3)');
      // The chalk stub itself, retired mid-word.
      rr(g, 48, 46, 4, 2, 1, '#f2ecdc');
      // A tennis ball print, seam and all.
      dot(g, 26, 36, 2.2, 'rgba(150,140,80,0.4)');
    });

    // The couplet wall: Ghalib in nastaliq on a whitewashed panel, ink
    // strokes hung like laundry that will never dry out of fashion.
    make('coupletwall', 2, (g, r, i) => {
      softShadow(g, 32, 90, 24, 5, 0.16);
      rr(g, 4, 24, 56, 64, 2, '#e8e0d0');
      vgrad(g, 4, 24, 56, 10, 'rgba(90,75,55,0.16)', 'rgba(0,0,0,0)');
      // The framed panel.
      rr(g, 10, 32, 44, 40, 2, '#4a3524');
      rr(g, 13, 35, 38, 34, 1, '#f2ecdc');
      // Nastaliq lines: flowing right-to-left strokes with diacritic dots.
      g.strokeStyle = '#2b2118';
      g.lineWidth = 1.8;
      g.lineCap = 'round';
      const rows = i === 0 ? [42, 52, 62] : [44, 56];
      for (const y of rows) {
        let x = 47;
        while (x > 17) {
          const seg = 5 + r.int(6);
          g.beginPath();
          g.moveTo(x, y);
          g.quadraticCurveTo(x - seg / 2, y - 3 - r.int(3), x - seg, y + (r.chance(0.4) ? 2 : 0));
          g.stroke();
          if (r.chance(0.6)) dot(g, x - seg / 2, y - 5, 0.9, '#2b2118');
          if (r.chance(0.3)) dot(g, x - seg / 2, y + 3.4, 0.9, '#2b2118');
          x -= seg + 2;
        }
      }
      // The lamp bracket beneath, soot above it: read nightly.
      rr(g, 28, 74, 8, 4, 2, '#a2762c');
      vgrad(g, 26, 66, 12, 8, 'rgba(50,40,30,0.25)', 'rgba(0,0,0,0)');
    }, 64, 96);

    // The divan: bolsters and a white sheet, where visitors outstay
    // beautifully.
    make('divan', 1, (g) => {
      oval(g, 32, 50, 20, 5, 'rgba(30,24,16,0.2)');
      rr(g, 8, 34, 48, 16, 5, '#8a6a48');
      rr(g, 9, 30, 46, 10, 5, '#efe8d8');
      vgrad(g, 9, 30, 46, 4, 'rgba(255,255,255,0.5)', 'rgba(0,0,0,0)');
      // Bolsters at both ends, brocade making its point.
      for (const bx of [14, 50]) {
        oval(g, bx, 30, 6.5, 4.4, '#a4442e');
        oval(g, bx, 30, 2.2, 3.4, '#c8a55b');
      }
    });

    // The takht: a low writing desk with paper, reed pen, and an inkwell
    // that has outlived its opinions.
    make('takht', 1, (g) => {
      oval(g, 32, 50, 18, 4.6, 'rgba(30,24,16,0.2)');
      rr(g, 12, 36, 40, 12, 3, '#5c4630');
      vgrad(g, 12, 36, 40, 4, 'rgba(240,220,190,0.2)', 'rgba(0,0,0,0)');
      rr(g, 14, 46, 4, 6, 1.5, '#4a3524');
      rr(g, 46, 46, 4, 6, 1.5, '#4a3524');
      // Paper with two lines begun and one crossed out: the true craft.
      rr(g, 20, 32, 16, 10, 1, '#f2ecdc');
      g.strokeStyle = '#2b2118';
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(33, 35);
      g.quadraticCurveTo(28, 33, 23, 36);
      g.moveTo(33, 39);
      g.quadraticCurveTo(29, 37, 24, 39);
      g.stroke();
      g.strokeStyle = 'rgba(160,50,40,0.7)';
      g.beginPath();
      g.moveTo(23, 38.6);
      g.lineTo(33, 38.2);
      g.stroke();
      // Inkwell and reed qalam.
      dot(g, 42, 34, 2.6, '#33302c');
      g.strokeStyle = '#a8895e';
      g.lineWidth = 1.4;
      g.beginPath();
      g.moveTo(40, 40);
      g.lineTo(48, 36);
      g.stroke();
    });

    // The book chest: divans of poets, a dictionary that lost an argument,
    // and dust holding it all in place.
    make('bookchest', 1, (g) => {
      oval(g, 32, 50, 18, 4.6, 'rgba(30,24,16,0.2)');
      rr(g, 12, 22, 40, 28, 3, '#4a3524');
      vgrad(g, 12, 22, 40, 8, 'rgba(240,220,190,0.12)', 'rgba(0,0,0,0)');
      // Two shelves of spines.
      for (const y of [26, 38] as const) {
        for (let i = 0; i < 7; i++) {
          const c = ['#8a5f4a', '#5f7d6a', '#a4442e', '#54708a', '#c9b795'][i % 5] ?? '#8a5f4a';
          rr(g, 15 + i * 5, y, 4, 9 + (i % 3), 1, shade(c, (i % 2) * -0.06));
        }
      }
      // One volume open on top, mid-sentence since 1947.
      g.fillStyle = '#f2ecdc';
      g.beginPath();
      g.moveTo(22, 21);
      g.quadraticCurveTo(30, 16, 32, 19);
      g.quadraticCurveTo(34, 16, 42, 21);
      g.lineTo(41, 24);
      g.quadraticCurveTo(33, 20, 32, 22);
      g.quadraticCurveTo(31, 20, 23, 24);
      g.closePath();
      g.fill();
    });

    // The paandaan: the brass betel box, hinged like a small bank vault,
    // which socially it is.
    make('paandaan', 1, (g) => {
      oval(g, 32, 48, 12, 3.6, 'rgba(30,24,16,0.2)');
      rr(g, 20, 34, 24, 12, 4, '#a2762c');
      oval(g, 32, 34, 12, 4.4, '#c8973b');
      vgrad(g, 20, 34, 24, 5, 'rgba(255,240,200,0.25)', 'rgba(0,0,0,0)');
      // The clasp and the engraved band.
      dot(g, 32, 40, 1.8, '#8a6224');
      g.strokeStyle = 'rgba(120,86,40,0.6)';
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(22, 42);
      g.lineTo(42, 42);
      g.stroke();
      // Two paan leaves on the lid, fresher than everything else in the room.
      oval(g, 27, 31, 3.4, 2.2, '#5f8a4a', 0.6);
      oval(g, 36, 31, 3.4, 2.2, '#4d7440', -0.5);
    });

    // The mango crate: langra in straw, perfuming the whole room. Ghalib's
    // requirements: sweet, and many.
    make('mangocrate', 1, (g) => {
      oval(g, 32, 50, 17, 4.6, 'rgba(30,24,16,0.2)');
      // Slatted crate.
      rr(g, 14, 30, 36, 20, 2, '#a8895e');
      g.strokeStyle = 'rgba(90,70,44,0.5)';
      g.lineWidth = 1.4;
      for (const y of [36, 43]) {
        g.beginPath();
        g.moveTo(15, y);
        g.lineTo(49, y);
        g.stroke();
      }
      // Straw overflowing.
      g.strokeStyle = 'rgba(217,192,136,0.9)';
      g.lineWidth = 1.2;
      for (let i = 0; i < 7; i++) {
        const fx = 17 + i * 5;
        g.beginPath();
        g.moveTo(fx, 30);
        g.quadraticCurveTo(fx + 2, 26, fx + 5, 28);
        g.stroke();
      }
      // The mangoes riding above the rim.
      for (let i = 0; i < 4; i++) {
        const c = ['#c9a23c', '#a8a04a', '#c98a2c', '#c9a23c'][i] ?? '#c9a23c';
        oval(g, 20 + i * 8, 27, 4.4, 3.4, c, 0.4);
        dot(g, 19 + i * 8, 26, 1, shade(c, 0.2));
      }
      // One out on approval, with the little knife of judgment.
      oval(g, 54, 46, 4.4, 3.4, '#e8b23c', 0.3);
      g.strokeStyle = '#7d8a8c';
      g.lineWidth = 1.2;
      g.beginPath();
      g.moveTo(50, 50);
      g.lineTo(57, 49);
      g.stroke();
    });

    // The charpai: rope-woven, sun-bleached, load-rated for two gossips or
    // one philosopher lying down.
    make('charpai', 2, (g, r) => {
      oval(g, 32, 50, 22, 5.5, 'rgba(30,24,16,0.2)');
      // Frame.
      rr(g, 8, 32, 48, 16, 4, '#8a6a44');
      for (const [lx, ly] of [[11, 46], [50, 46]] as const) {
        rr(g, lx, ly, 4, 8, 1.5, '#6f5238');
      }
      // The rope weave, sagging with testimony.
      g.strokeStyle = shade('#d9c088', (r.next() - 0.5) * 0.1);
      g.lineWidth = 1.6;
      for (let x = 12; x < 54; x += 5) {
        g.beginPath();
        g.moveTo(x, 34);
        g.quadraticCurveTo(x + 1, 42, x, 46);
        g.stroke();
      }
      for (let y = 35; y < 46; y += 4) {
        g.beginPath();
        g.moveTo(10, y);
        g.quadraticCurveTo(32, y + 2.6, 54, y);
        g.stroke();
      }
      // The famous middle sag.
      oval(g, 32, 41, 10, 4, 'rgba(120,95,55,0.25)');
    });

    // ---------------------------------------------------------- buildings

    // The haveli: three storeys of Shahjahanabad compressed into a facade,
    // jharokha balcony leaning over an aluminum shopfront, casa geometry
    // preserved so the village grid holds.
    make('haveli', 3, (g, r, i) => {
      const W2 = 352;
      const coats = ['#cbb392', '#b8a998', '#c9b0a0'];
      const paint = shade(coats[i % 3] ?? '#cbb392', (r.next() - 0.5) * 0.05);
      const wallTop = 96;
      const wallBot = 252;

      // Wall.
      vgrad(g, 16, wallTop, W2 - 32, wallBot - wallTop, shade(paint, 0.07), shade(paint, -0.08));
      // Monsoon streaks and exposed brick patches.
      for (let k = 0; k < 6; k++) {
        const fx = 24 + r.int(W2 - 60);
        vgrad(g, fx, wallTop, 10 + r.int(14), 40 + r.int(50), 'rgba(110,100,80,0.13)', 'rgba(0,0,0,0)');
      }
      const bx = 30 + r.int(W2 - 100);
      for (let k = 0; k < 6; k++) {
        rr(g, bx + (k % 3) * 13, wallBot - 60 + Math.floor(k / 3) * 9, 12, 7, 1, shade('#9a5f4a', (r.next() - 0.5) * 0.1));
      }
      vgrad(g, 16, wallBot - 24, W2 - 32, 24, 'rgba(0,0,0,0)', 'rgba(80,70,55,0.3)');
      // Side shade.
      g.save();
      g.globalAlpha = 0.15;
      g.fillStyle = '#1c1712';
      g.fillRect(W2 - 26, wallTop, 10, wallBot - wallTop);
      g.restore();

      // Door: casa footprint, but a proper Old Delhi double door with a
      // wicket gate and a horseshoe of studs.
      rr(g, 150, wallBot - 96, 66, 96, 6, shade(paint, -0.3));
      rr(g, 156, wallBot - 88, 54, 88, 5, '#4a3524');
      g.strokeStyle = 'rgba(35,22,12,0.6)';
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(183, wallBot - 88);
      g.lineTo(183, wallBot);
      g.stroke();
      // Stud rows and the small wicket cut into one leaf.
      g.fillStyle = '#8a6a44';
      for (let ry = wallBot - 78; ry < wallBot - 8; ry += 16) {
        for (const sx of [162, 172, 194, 204]) dot(g, sx, ry, 1.8, '#8a6a44');
      }
      rr(g, 190, wallBot - 60, 16, 60, 3, shade('#4a3524', 0.08));
      dot(g, 193, wallBot - 32, 2.2, '#c8a55b');
      // The arch over the door, cusped, plaster molded.
      g.fillStyle = shade(paint, -0.16);
      g.beginPath();
      g.moveTo(146, wallBot - 96);
      g.quadraticCurveTo(150, wallBot - 122, 183, wallBot - 126);
      g.quadraticCurveTo(216, wallBot - 122, 220, wallBot - 96);
      g.lineTo(212, wallBot - 96);
      g.quadraticCurveTo(210, wallBot - 112, 183, wallBot - 116);
      g.quadraticCurveTo(156, wallBot - 112, 154, wallBot - 96);
      g.closePath();
      g.fill();

      // Windows at casa offsets, with green shutters; one gets the jharokha.
      for (const [wi, wx] of [52, 252].entries()) {
        if (wi === i % 2) {
          // The jharokha: a carved wooden balcony leaning over the lane.
          rr(g, wx - 10, wallTop + 26, 68, 8, 3, '#5c4630');
          rr(g, wx - 6, wallTop + 2, 60, 28, 4, '#6f5238');
          vgrad(g, wx - 6, wallTop + 2, 60, 8, 'rgba(240,220,190,0.2)', 'rgba(0,0,0,0)');
          // Its little arched openings.
          for (let k = 0; k < 3; k++) {
            rr(g, wx + k * 19, wallTop + 6, 14, 18, 6, '#2c2018');
            g.strokeStyle = 'rgba(200,165,91,0.5)';
            g.lineWidth = 1;
            g.beginPath();
            g.arc(wx + 7 + k * 19, wallTop + 12, 6, Math.PI, 0);
            g.stroke();
          }
          // Carved brackets beneath.
          for (const bx2 of [wx - 4, wx + 24, wx + 50]) {
            g.beginPath();
            g.moveTo(bx2, wallTop + 34);
            g.quadraticCurveTo(bx2 + 4, wallTop + 44, bx2 + 8, wallTop + 34);
            g.fillStyle = '#5c4630';
            g.fill();
          }
          // Window below the balcony.
          rr(g, wx + 2, wallTop + 44, 44, 34, 5, shade(paint, -0.3));
          rr(g, wx + 6, wallTop + 48, 36, 28, 4, '#2c3438');
          vgrad(g, wx + 6, wallTop + 48, 36, 10, 'rgba(200,220,225,0.3)', 'rgba(0,0,0,0)');
        } else {
          rr(g, wx, wallTop + 34, 48, 44, 6, shade(paint, -0.3));
          rr(g, wx + 4, wallTop + 38, 40, 36, 5, '#2c3438');
          vgrad(g, wx + 4, wallTop + 38, 40, 14, 'rgba(200,220,225,0.35)', 'rgba(0,0,0,0)');
          g.strokeStyle = '#4a3524';
          g.lineWidth = 3;
          g.beginPath();
          g.moveTo(wx + 24, wallTop + 38);
          g.lineTo(wx + 24, wallTop + 74);
          g.stroke();
          for (const shx of [wx - 14, wx + 48]) {
            rr(g, shx, wallTop + 36, 14, 44, 3, shade('#3d6b58', (r.next() - 0.5) * 0.1));
            g.strokeStyle = 'rgba(28,42,36,0.5)';
            g.lineWidth = 1.6;
            for (let k = 1; k < 4; k++) {
              g.beginPath();
              g.moveTo(shx + 2, wallTop + 36 + k * 11);
              g.lineTo(shx + 12, wallTop + 36 + k * 11);
              g.stroke();
            }
          }
        }
      }

      // The parapet roofline with its own little jaali, and the wire riding
      // across the whole facade because of course it does.
      rr(g, 12, wallTop - 14, W2 - 24, 18, 3, shade(paint, -0.1));
      g.fillStyle = 'rgba(60,45,35,0.35)';
      for (let x = 26; x < W2 - 30; x += 22) {
        rr(g, x, wallTop - 10, 10, 9, 2, 'rgba(60,45,35,0.35)');
      }
      // Upper storey hinted above the parapet.
      vgrad(g, 20, 30, W2 - 40, wallTop - 44, shade(paint, -0.02), shade(paint, 0.06));
      for (const ux of [60, 160, 260]) {
        rr(g, ux, 44, 30, 32, 4, shade(paint, -0.24));
        rr(g, ux + 3, 47, 24, 26, 3, '#2c3438');
        vgrad(g, ux + 3, 47, 24, 9, 'rgba(200,220,225,0.3)', 'rgba(0,0,0,0)');
      }
      rr(g, 16, 24, W2 - 32, 10, 4, shade(paint, -0.12));
      // The cable, sagging past everyone's windows.
      g.strokeStyle = 'rgba(40,36,32,0.8)';
      g.lineWidth = 2;
      g.beginPath();
      g.moveTo(0, 66);
      g.quadraticCurveTo(W2 / 2, 84, W2, 62);
      g.stroke();
      g.beginPath();
      g.moveTo(0, 72);
      g.quadraticCurveTo(W2 / 2, 92, W2, 70);
      g.stroke();
      // Eave shadow.
      vgrad(g, 16, wallTop + 4, W2 - 32, 14, 'rgba(25,20,14,0.34)', 'rgba(0,0,0,0)');
      // A kite snagged on the parapet, or a crow auditing the wire.
      if (r.chance(0.5)) {
        const kx = 60 + r.int(W2 - 120);
        g.fillStyle = '#c04858';
        g.beginPath();
        g.moveTo(kx, 18);
        g.lineTo(kx + 8, 26);
        g.lineTo(kx, 32);
        g.lineTo(kx - 8, 26);
        g.closePath();
        g.fill();
      } else {
        const cx = 60 + r.int(W2 - 120);
        oval(g, cx, 62, 6, 4.4, '#241a12');
        dot(g, cx + 5, 59, 2.6, '#241a12');
      }
    }, 352, 256);

    // Sis Ganj's face on the square: white marble, the fluted golden dome,
    // the doorway that has never once asked a question.
    make('gurdwara', 1, (g) => {
      const W2 = 352;
      const wallTop = 96;
      const wallBot = 252;
      const marble = '#efe9dc';

      // Wall: white marble courses.
      vgrad(g, 16, wallTop, W2 - 32, wallBot - wallTop, shade(marble, 0.05), shade(marble, -0.07));
      g.strokeStyle = 'rgba(150,140,120,0.25)';
      g.lineWidth = 1.4;
      for (let y = wallTop + 22; y < wallBot; y += 24) {
        g.beginPath();
        g.moveTo(18, y);
        g.lineTo(W2 - 18, y);
        g.stroke();
      }
      g.save();
      g.globalAlpha = 0.12;
      g.fillStyle = '#1c1712';
      g.fillRect(W2 - 26, wallTop, 10, wallBot - wallTop);
      g.restore();

      // The doorway: casa footprint, scalloped Sikh arch, always open dark
      // with the shine of the hall beyond.
      rr(g, 146, wallBot - 102, 74, 102, 8, '#d9d0ba');
      rr(g, 156, wallBot - 88, 54, 88, 5, '#3a2e22');
      vgrad(g, 156, wallBot - 88, 54, 30, 'rgba(255,220,150,0.28)', 'rgba(0,0,0,0)');
      // Cusped arch.
      g.fillStyle = '#c8b98c';
      g.beginPath();
      g.moveTo(150, wallBot - 96);
      for (let k = 0; k <= 6; k++) {
        const ax = 150 + (66 * k) / 6;
        const ay = wallBot - 96 - Math.sin((k / 6) * Math.PI) * 26 - (k % 2) * 5;
        g.lineTo(ax, ay);
      }
      g.lineTo(216, wallBot - 96);
      g.closePath();
      g.fill();
      // Golden trim panels flanking the door.
      for (const px2 of [132, 222]) {
        rr(g, px2, wallBot - 84, 10, 84, 3, '#c8a55b');
        g.strokeStyle = 'rgba(140,100,40,0.5)';
        g.lineWidth = 1;
        for (let y = wallBot - 76; y < wallBot - 6; y += 12) {
          g.beginPath();
          g.moveTo(px2 + 1, y);
          g.lineTo(px2 + 9, y);
          g.stroke();
        }
      }

      // Windows at casa offsets: marble jaali screens.
      for (const wx of [52, 252]) {
        rr(g, wx, wallTop + 34, 48, 44, 8, shade(marble, -0.18));
        rr(g, wx + 4, wallTop + 38, 40, 36, 6, '#d9d0ba');
        g.fillStyle = 'rgba(90,80,60,0.35)';
        for (let jx = 0; jx < 5; jx++) {
          for (let jy = 0; jy < 4; jy++) {
            dot(g, wx + 9 + jx * 8, wallTop + 43 + jy * 8, 2.2, 'rgba(90,80,60,0.35)');
          }
        }
      }

      // The upper storey: a white balustrade, the chattris, and the dome.
      vgrad(g, 20, 34, W2 - 40, wallTop - 48, shade(marble, 0.02), shade(marble, 0.08));
      rr(g, 16, wallTop - 12, W2 - 32, 16, 3, shade(marble, -0.06));
      g.fillStyle = 'rgba(120,110,90,0.3)';
      for (let x = 28; x < W2 - 32; x += 16) {
        rr(g, x, wallTop - 9, 7, 10, 3, 'rgba(120,110,90,0.3)');
      }
      // Two side chattris.
      for (const cx of [70, 282]) {
        rr(g, cx - 12, 52, 24, 22, 3, shade(marble, -0.04));
        oval(g, cx, 50, 15, 7, '#d9b45a');
        oval(g, cx, 44, 10, 6, '#e0c068');
        dot(g, cx, 37, 2, '#c8a55b');
      }
      // The central fluted golden dome.
      oval(g, 176, 52, 44, 12, '#c9a24e');
      g.fillStyle = '#e0c068';
      g.beginPath();
      g.moveTo(134, 52);
      g.quadraticCurveTo(136, 16, 176, 8);
      g.quadraticCurveTo(216, 16, 218, 52);
      g.closePath();
      g.fill();
      // Flutes.
      g.strokeStyle = 'rgba(150,105,40,0.5)';
      g.lineWidth = 1.6;
      for (let k = -3; k <= 3; k++) {
        g.beginPath();
        g.moveTo(176 + k * 12, 51);
        g.quadraticCurveTo(176 + k * 7, 22, 176, 9);
        g.stroke();
      }
      // The kalash finial catching whatever light there is.
      rr(g, 173.4, -2, 5, 12, 2.5, '#c8a55b');
      dot(g, 176, -4, 2.6, '#e8d9a8');
      glowSpot(g, 176, 24, 30, '#ffe9b0', 0.25);
      // Eave shadow.
      vgrad(g, 16, wallTop + 4, W2 - 32, 14, 'rgba(25,20,14,0.3)', 'rgba(0,0,0,0)');
    }, 352, 256);
  },
};
