import { Rng, dot, oval, rr, surface } from './pix';

/**
 * Chasca's photographs: ten small gouache vignettes, one per frame she took
 * across the journey, painted the way the cover is painted and then given a
 * developed-print finish (warm cast, vignette, grain). Each is the traveler
 * standing where the land, the weather, or the story ran out. Cached; the
 * album turns its pages often and the paint must not run twice.
 */

const W = 240;
const H = 170;

const cache = new Map<string, HTMLCanvasElement>();

// ---------------------------------------------------------------- shared kit

/** The traveler, seen the way Chasca sees them: poncho, hat, patience. */
function figure(
  g: CanvasRenderingContext2D,
  x: number,
  y: number,
  s = 1,
  opts: { arms?: 'out' | 'down'; shadow?: boolean } = {},
) {
  if (opts.shadow !== false) oval(g, x, y + 1.2 * s, 6 * s, 2 * s, 'rgba(25,17,10,0.26)');
  g.strokeStyle = '#3c2f24';
  g.lineWidth = 2 * s;
  g.lineCap = 'round';
  g.beginPath();
  g.moveTo(x - 2 * s, y);
  g.lineTo(x - 1.1 * s, y - 6 * s);
  g.moveTo(x + 2 * s, y);
  g.lineTo(x + 1.1 * s, y - 6 * s);
  g.stroke();
  // The poncho, a small warm mountain of its own.
  g.fillStyle = '#7a4c38';
  g.beginPath();
  g.moveTo(x, y - 15.5 * s);
  g.quadraticCurveTo(x + 5.8 * s, y - 12 * s, x + 5.2 * s, y - 5.5 * s);
  g.lineTo(x - 5.2 * s, y - 5.5 * s);
  g.quadraticCurveTo(x - 5.8 * s, y - 12 * s, x, y - 15.5 * s);
  g.closePath();
  g.fill();
  if (opts.arms === 'out') {
    g.strokeStyle = '#7a4c38';
    g.lineWidth = 2.2 * s;
    g.beginPath();
    g.moveTo(x - 4.4 * s, y - 10 * s);
    g.lineTo(x - 8 * s, y - 12.5 * s);
    g.moveTo(x + 4.4 * s, y - 10 * s);
    g.lineTo(x + 8 * s, y - 12.5 * s);
    g.stroke();
  }
  // The woven band's stripe, faithful since chapter one.
  g.strokeStyle = '#d9a441';
  g.lineWidth = 1.3 * s;
  g.beginPath();
  g.moveTo(x - 3.6 * s, y - 8 * s);
  g.lineTo(x + 3.6 * s, y - 8 * s);
  g.stroke();
  dot(g, x, y - 17 * s, 2.5 * s, '#c98d5f');
  oval(g, x, y - 19.2 * s, 3.9 * s, 1.3 * s, '#4a3a2e');
  dot(g, x, y - 20.2 * s, 1.7 * s, '#5c4632');
}

/** Three quiet checkmark birds. */
function birds(g: CanvasRenderingContext2D, spots: [number, number, number][], ink = 'rgba(70,60,50,0.55)') {
  g.strokeStyle = ink;
  g.lineWidth = 1.3;
  for (const [bx, by, sw] of spots) {
    g.beginPath();
    g.moveTo(bx - sw, by);
    g.quadraticCurveTo(bx - sw * 0.3, by - sw * 0.8, bx, by);
    g.quadraticCurveTo(bx + sw * 0.3, by - sw * 0.8, bx + sw, by);
    g.stroke();
  }
}

/** Diagonal rain over everything painted so far. */
function rain(g: CanvasRenderingContext2D, r: Rng, color: string, n: number) {
  g.strokeStyle = color;
  g.lineWidth = 1;
  for (let i = 0; i < n; i++) {
    const x = r.next() * (W + 30) - 15;
    const y = r.next() * H;
    const len = 7 + r.next() * 9;
    g.beginPath();
    g.moveTo(x, y);
    g.lineTo(x - len * 0.28, y + len);
    g.stroke();
  }
}

/** The 1974-print finish: warm cast, soft vignette, film grain. */
function develop(g: CanvasRenderingContext2D, seed: number) {
  g.fillStyle = 'rgba(216,180,122,0.10)';
  g.fillRect(0, 0, W, H);
  const vig = g.createRadialGradient(W / 2, H / 2, H * 0.42, W / 2, H / 2, H * 0.95);
  vig.addColorStop(0, 'rgba(0,0,0,0)');
  vig.addColorStop(1, 'rgba(46,30,16,0.30)');
  g.fillStyle = vig;
  g.fillRect(0, 0, W, H);
  const r = new Rng(seed);
  g.fillStyle = 'rgba(58,42,26,0.05)';
  for (let i = 0; i < 240; i++) g.fillRect(r.next() * W, r.next() * H, 1.2, 1.2);
  g.fillStyle = 'rgba(255,244,220,0.05)';
  for (let i = 0; i < 150; i++) g.fillRect(r.next() * W, r.next() * H, 1.2, 1.2);
}

// ---------------------------------------------------------------- the frames

/** Nº 1, La Bajada: the descent, and the sea's first entrance. */
function bajada(g: CanvasRenderingContext2D) {
  const sky = g.createLinearGradient(0, 0, 0, 78);
  sky.addColorStop(0, '#a9cbd8');
  sky.addColorStop(1, '#ecd9a8');
  g.fillStyle = sky;
  g.fillRect(0, 0, W, 78);
  // The cordillera at your back, a last blue-violet veil on the right; the
  // slopes overlap its feet so it stands BEHIND the descent, not on it.
  g.fillStyle = 'rgba(141,147,184,0.8)';
  g.beginPath();
  g.moveTo(240, 92);
  g.lineTo(214, 32);
  g.lineTo(192, 58);
  g.lineTo(170, 44);
  g.lineTo(146, 92);
  g.closePath();
  g.fill();
  g.fillStyle = '#eef0f4';
  g.beginPath();
  g.moveTo(207, 41);
  g.lineTo(214, 32);
  g.lineTo(221, 41);
  g.lineTo(214, 44);
  g.closePath();
  g.fill();
  // The sea, far below, exactly where Faustino said it would start talking.
  const sea = g.createLinearGradient(0, 60, 0, 80);
  sea.addColorStop(0, '#8fb6c2');
  sea.addColorStop(1, '#5d92a3');
  g.fillStyle = sea;
  g.fillRect(0, 60, 150, 20);
  // Haze where the water meets the morning; the first entrance is shy.
  const haze = g.createLinearGradient(0, 58, 0, 70);
  haze.addColorStop(0, 'rgba(236,217,168,0.85)');
  haze.addColorStop(1, 'rgba(236,217,168,0)');
  g.fillStyle = haze;
  g.fillRect(0, 58, 150, 12);
  g.strokeStyle = 'rgba(240,248,244,0.45)';
  g.lineWidth = 1;
  for (const [lx, ly, lw] of [[24, 71, 18], [84, 75, 22]] as const) {
    g.beginPath();
    g.moveTo(lx, ly);
    g.lineTo(lx + lw, ly);
    g.stroke();
  }
  // Dry slopes stepping down toward the lip, terraced where hands reached.
  g.fillStyle = '#a89a58';
  g.beginPath();
  g.moveTo(0, H);
  g.lineTo(0, 96);
  g.quadraticCurveTo(70, 74, 150, 90);
  g.quadraticCurveTo(205, 100, 240, 86);
  g.lineTo(240, H);
  g.closePath();
  g.fill();
  g.strokeStyle = 'rgba(90,84,40,0.3)';
  g.lineWidth = 1.4;
  for (let i = 0; i < 3; i++) {
    g.beginPath();
    g.moveTo(150, 98 + i * 6);
    g.quadraticCurveTo(196, 92 + i * 6, 236, 96 + i * 6);
    g.stroke();
  }
  g.fillStyle = '#93884c';
  g.beginPath();
  g.moveTo(0, H);
  g.lineTo(0, 128);
  g.quadraticCurveTo(90, 110, 170, 130);
  g.quadraticCurveTo(215, 142, 240, 128);
  g.lineTo(240, H);
  g.closePath();
  g.fill();
  // The switchback road, one cream thread with two elbows.
  g.strokeStyle = '#e6d5a6';
  g.lineCap = 'round';
  g.lineWidth = 13;
  g.beginPath();
  g.moveTo(48, 176);
  g.bezierCurveTo(90, 152, 190, 152, 172, 128);
  g.stroke();
  g.lineWidth = 7;
  g.beginPath();
  g.moveTo(172, 128);
  g.bezierCurveTo(150, 112, 70, 116, 84, 98);
  g.stroke();
  g.lineWidth = 3.4;
  g.beginPath();
  g.moveTo(84, 98);
  g.bezierCurveTo(96, 88, 150, 90, 158, 80);
  g.stroke();
  // Cactus and an apacheta keeping the road company.
  g.strokeStyle = '#4d7440';
  g.lineWidth = 4;
  g.beginPath();
  g.moveTo(206, 122);
  g.lineTo(206, 104);
  g.moveTo(206, 112);
  g.lineTo(199, 106);
  g.moveTo(206, 115);
  g.lineTo(213, 108);
  g.stroke();
  for (const [ax, ay, ar] of [[36, 118, 4.4], [36, 111, 3.4], [36, 105.5, 2.3]] as const) {
    oval(g, ax, ay, ar, ar * 0.62, '#8d8272');
  }
  birds(g, [[172, 30, 5], [190, 38, 4]]);
  // Mid-astonishment: arms a little out, the whole ocean arriving.
  figure(g, 122, 146, 1.35, { arms: 'out' });
}

/** Nº 2, La Caleta: the pier, the garúa, the reed horses on end. */
function pier(g: CanvasRenderingContext2D) {
  const sky = g.createLinearGradient(0, 0, 0, 96);
  sky.addColorStop(0, '#c9ced2');
  sky.addColorStop(1, '#dcdfdd');
  g.fillStyle = sky;
  g.fillRect(0, 0, W, 96);
  const sea = g.createLinearGradient(0, 90, 0, H);
  sea.addColorStop(0, '#8aa8ad');
  sea.addColorStop(1, '#6b939c');
  g.fillStyle = sea;
  g.fillRect(0, 90, W, H - 90);
  g.strokeStyle = 'rgba(238,244,240,0.4)';
  g.lineWidth = 1;
  for (const [lx, ly, lw] of [[18, 104, 26], [96, 128, 30], [180, 112, 24], [60, 150, 34]] as const) {
    g.beginPath();
    g.moveTo(lx, ly);
    g.lineTo(lx + lw, ly);
    g.stroke();
  }
  // The foreshore they dry on: a tongue of damp sand.
  g.fillStyle = '#c6b085';
  g.beginPath();
  g.moveTo(0, 88);
  g.lineTo(98, 92);
  g.quadraticCurveTo(116, 112, 90, 134);
  g.quadraticCurveTo(50, 162, 0, 170);
  g.closePath();
  g.fill();
  g.strokeStyle = 'rgba(240,244,240,0.5)';
  g.lineWidth = 1.6;
  g.beginPath();
  g.moveTo(98, 94);
  g.quadraticCurveTo(114, 112, 88, 134);
  g.stroke();
  // The caballitos, standing on end against the mist like a fence of horses.
  for (const [cx] of [[28], [52], [78]] as const) {
    oval(g, cx, 97.5, 9, 2.2, 'rgba(96,78,44,0.28)');
  }
  for (const [cx, cw] of [[28, 13], [52, 15], [78, 12]] as const) {
    g.fillStyle = '#c2a566';
    g.beginPath();
    g.moveTo(cx, 96);
    g.quadraticCurveTo(cx - cw * 0.75, 82, cx - cw * 0.35, 44);
    g.quadraticCurveTo(cx, 36, cx + cw * 0.35, 44);
    g.quadraticCurveTo(cx + cw * 0.75, 82, cx, 96);
    g.closePath();
    g.fill();
    g.strokeStyle = 'rgba(122,96,48,0.5)';
    g.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
      g.beginPath();
      g.moveTo(cx - cw * 0.42 + i * 1.5, 88 - i * 15);
      g.quadraticCurveTo(cx, 84 - i * 16, cx + cw * 0.42 - i * 1.5, 88 - i * 15);
      g.stroke();
    }
  }
  // The pier, reaching for where the land runs out.
  const deck = g.createLinearGradient(0, 108, 0, 132);
  deck.addColorStop(0, '#8a6a48');
  deck.addColorStop(1, '#6e5238');
  g.fillStyle = deck;
  g.beginPath();
  g.moveTo(240, 108);
  g.lineTo(96, 116);
  g.lineTo(96, 126);
  g.lineTo(240, 142);
  g.closePath();
  g.fill();
  g.strokeStyle = 'rgba(52,38,24,0.55)';
  g.lineWidth = 2.4;
  for (const [px, py1, py2] of [[108, 126, 148], [150, 130, 156], [196, 136, 166]] as const) {
    g.beginPath();
    g.moveTo(px, py1);
    g.lineTo(px, py2);
    g.stroke();
  }
  // One pelican on a bollard, unhurried, supervising the fog.
  g.fillStyle = '#4e3a26';
  g.fillRect(219, 118, 5, 11);
  oval(g, 216.5, 112, 5, 3.6, '#d8d4c6');
  dot(g, 221.5, 107.5, 2.1, '#d8d4c6');
  g.strokeStyle = '#b08a4a';
  g.lineWidth = 1.6;
  g.beginPath();
  g.moveTo(223.5, 107.5);
  g.lineTo(230, 109.5);
  g.stroke();
  g.strokeStyle = 'rgba(90,78,60,0.5)';
  g.lineWidth = 1;
  g.beginPath();
  g.moveTo(214, 113.5);
  g.quadraticCurveTo(216, 115.5, 219, 114.5);
  g.stroke();
  birds(g, [[60, 24, 4], [76, 30, 3.4]], 'rgba(96,100,98,0.5)');
  figure(g, 128, 116, 1.3);
}

/** Nº 3, the crossing: the rail, and nothing on the horizon on purpose. */
function deck(g: CanvasRenderingContext2D) {
  const sky = g.createLinearGradient(0, 0, 0, 92);
  sky.addColorStop(0, '#9dc0d4');
  sky.addColorStop(1, '#d8e2e2');
  g.fillStyle = sky;
  g.fillRect(0, 0, W, 92);
  // One patient cloud; the album needed company for the middle.
  for (const [cx, cy, cr] of [[62, 34, 15], [80, 30, 18], [98, 35, 13]] as const) {
    dot(g, cx, cy, cr, 'rgba(244,246,242,0.85)');
  }
  const sea = g.createLinearGradient(0, 88, 0, 118);
  sea.addColorStop(0, '#54819c');
  sea.addColorStop(1, '#3f6a86');
  g.fillStyle = sea;
  g.fillRect(0, 88, W, 32);
  g.strokeStyle = 'rgba(232,240,240,0.35)';
  g.lineWidth = 1;
  for (const [lx, ly, lw] of [[24, 96, 22], [120, 102, 26], [188, 94, 20]] as const) {
    g.beginPath();
    g.moveTo(lx, ly);
    g.lineTo(lx + lw, ly);
    g.stroke();
  }
  // The deck, painted iron and thirty-one days of footsteps.
  const dk = g.createLinearGradient(0, 118, 0, H);
  dk.addColorStop(0, '#7d8a84');
  dk.addColorStop(1, '#5e6b66');
  g.fillStyle = dk;
  g.fillRect(0, 118, W, H - 118);
  g.strokeStyle = 'rgba(40,50,46,0.3)';
  g.lineWidth = 1;
  for (let i = 0; i < 5; i++) {
    g.beginPath();
    g.moveTo(0, 128 + i * 9);
    g.lineTo(W, 126 + i * 10);
    g.stroke();
  }
  // The rail: posts, two runs of cable, salt on all of it.
  g.strokeStyle = '#3e4a48';
  g.lineWidth = 3;
  for (const px of [16, 72, 128, 184, 236]) {
    g.beginPath();
    g.moveTo(px, 88);
    g.lineTo(px, 126);
    g.stroke();
  }
  g.lineWidth = 2;
  g.beginPath();
  g.moveTo(0, 92);
  g.lineTo(W, 92);
  g.moveTo(0, 106);
  g.lineTo(W, 106);
  g.stroke();
  // Cargo: the hammock district, lashed down on deck two mountains high.
  rr(g, 2, 104, 46, 30, 2, '#8a5a40');
  rr(g, 8, 86, 34, 20, 2, '#a06a48');
  g.strokeStyle = 'rgba(50,32,20,0.4)';
  g.lineWidth = 1.4;
  g.strokeRect(8, 86, 34, 20);
  g.strokeRect(2, 104, 46, 30);
  g.beginPath();
  g.moveTo(2, 119);
  g.lineTo(48, 119);
  g.stroke();
  // The lashings the Bosun answers for.
  g.strokeStyle = 'rgba(232,224,204,0.5)';
  g.lineWidth = 1.2;
  g.beginPath();
  g.moveTo(6, 134);
  g.lineTo(14, 86);
  g.moveTo(44, 134);
  g.lineTo(36, 86);
  g.stroke();
  birds(g, [[196, 28, 4]], 'rgba(90,100,104,0.5)');
  figure(g, 148, 132, 1.35);
}

/** Nº 4, Shionoura: half through the noren, in or out, the photo will not say. */
function noren(g: CanvasRenderingContext2D) {
  // The shopfront: dark wood, one warm room behind the curtain.
  const wall = g.createLinearGradient(0, 0, 0, H);
  wall.addColorStop(0, '#6e5a44');
  wall.addColorStop(1, '#59462f');
  g.fillStyle = wall;
  g.fillRect(0, 0, W, H);
  g.strokeStyle = 'rgba(38,28,18,0.5)';
  g.lineWidth = 2;
  for (const px of [24, 60, 178, 214]) {
    g.beginPath();
    g.moveTo(px, 0);
    g.lineTo(px, 128);
    g.stroke();
  }
  // The doorway, glowing from the kitchen side.
  const door = g.createLinearGradient(0, 30, 0, 128);
  door.addColorStop(0, '#f0d59a');
  door.addColorStop(1, '#d9a95c');
  g.fillStyle = door;
  g.fillRect(84, 30, 72, 98);
  // The street, wet stone in the evening.
  const st = g.createLinearGradient(0, 128, 0, H);
  st.addColorStop(0, '#9b948a');
  st.addColorStop(1, '#7c766c');
  g.fillStyle = st;
  g.fillRect(0, 128, W, H - 128);
  g.strokeStyle = 'rgba(60,56,50,0.35)';
  g.lineWidth = 1;
  for (const [sx, sy, sw] of [[18, 140, 30], [70, 152, 40], [150, 144, 34], [196, 158, 30]] as const) {
    g.beginPath();
    g.moveTo(sx, sy);
    g.lineTo(sx + sw, sy);
    g.stroke();
  }
  oval(g, 120, 150, 26, 4, 'rgba(240,213,154,0.25)');
  // A lantern by the post, already on duty.
  g.strokeStyle = '#3a2c1c';
  g.lineWidth = 2;
  g.beginPath();
  g.moveTo(196, 44);
  g.lineTo(196, 56);
  g.stroke();
  rr(g, 189, 56, 14, 18, 4, '#e8c97a');
  g.strokeStyle = 'rgba(120,70,30,0.6)';
  g.lineWidth = 1.2;
  g.strokeRect(189, 56, 14, 18);
  // The traveler, half in the doorway before the curtain is drawn over them.
  figure(g, 112, 126, 1.35);
  // The noren: two indigo panels, one white circle halved between them.
  const panel = (x: number, w: number) => {
    const cloth = g.createLinearGradient(0, 26, 0, 96);
    cloth.addColorStop(0, '#2f4a68');
    cloth.addColorStop(1, '#274060');
    g.fillStyle = cloth;
    g.beginPath();
    g.moveTo(x, 26);
    g.lineTo(x + w, 26);
    g.lineTo(x + w - 1.5, 94);
    g.quadraticCurveTo(x + w / 2, 98, x + 1.5, 94);
    g.closePath();
    g.fill();
  };
  panel(84, 35);
  panel(121, 35);
  g.strokeStyle = 'rgba(238,242,240,0.85)';
  g.lineWidth = 2.4;
  g.beginPath();
  g.arc(120, 62, 13, Math.PI * 0.55, Math.PI * 2.45);
  g.stroke();
  g.fillStyle = '#4a3626';
  g.fillRect(80, 22, 80, 5);
}

/** Nº 5, Busan: the dried-fish alley, silver on strings, steam for weather. */
function alley(g: CanvasRenderingContext2D) {
  // Deep alley: warm dusk sliver of sky, walls leaning in.
  const sky = g.createLinearGradient(0, 0, 0, 46);
  sky.addColorStop(0, '#e8c088');
  sky.addColorStop(1, '#d9a06a');
  g.fillStyle = sky;
  g.fillRect(0, 0, W, 46);
  g.fillStyle = '#5c4434';
  g.beginPath();
  g.moveTo(0, 0);
  g.lineTo(86, 30);
  g.lineTo(86, 118);
  g.lineTo(0, H);
  g.closePath();
  g.fill();
  g.fillStyle = '#524030';
  g.beginPath();
  g.moveTo(240, 0);
  g.lineTo(154, 30);
  g.lineTo(154, 118);
  g.lineTo(240, H);
  g.closePath();
  g.fill();
  // Stall awnings low on either side.
  g.fillStyle = '#b5583a';
  g.beginPath();
  g.moveTo(10, 74);
  g.lineTo(86, 78);
  g.lineTo(86, 88);
  g.lineTo(10, 90);
  g.closePath();
  g.fill();
  g.fillStyle = '#3f6a7d';
  g.beginPath();
  g.moveTo(230, 74);
  g.lineTo(154, 78);
  g.lineTo(154, 88);
  g.lineTo(230, 90);
  g.closePath();
  g.fill();
  // The lane itself, wet enough to remember the lanterns.
  const lane = g.createLinearGradient(0, 118, 0, H);
  lane.addColorStop(0, '#8a7c66');
  lane.addColorStop(1, '#6b5e4c');
  g.fillStyle = lane;
  g.beginPath();
  g.moveTo(86, 118);
  g.lineTo(154, 118);
  g.lineTo(240, H);
  g.lineTo(0, H);
  g.closePath();
  g.fill();
  g.fillStyle = '#7c6e58';
  g.fillRect(86, 30, 68, 88);
  const glow = g.createRadialGradient(120, 96, 4, 120, 96, 56);
  glow.addColorStop(0, 'rgba(240,200,130,0.5)');
  glow.addColorStop(1, 'rgba(240,200,130,0)');
  g.fillStyle = glow;
  g.fillRect(64, 40, 112, 112);
  // Strings of fish, row over row, a ceiling of patient silver.
  for (const [sy, sag] of [[40, 6], [56, 8], [72, 7]] as const) {
    g.strokeStyle = 'rgba(46,34,22,0.7)';
    g.lineWidth = 1.2;
    g.beginPath();
    g.moveTo(6, sy);
    g.quadraticCurveTo(120, sy + sag, 234, sy);
    g.stroke();
    for (let i = 0; i < 8; i++) {
      const t = (i + 0.5) / 8;
      const fx = 8 + t * 224;
      const fy = sy + sag * 4 * t * (1 - t) + 2;
      // Hung by the head, tails down: silver bodies with a darker back and
      // a small forked tail, so they read as fish and not as rice.
      oval(g, fx, fy + 5.5, 2.5, 6, '#ccd2c8', 0.05);
      oval(g, fx - 1, fy + 4.8, 1, 4, 'rgba(128,138,128,0.75)', 0.05);
      g.fillStyle = '#99a094';
      g.beginPath();
      g.moveTo(fx - 1.8, fy + 10.6);
      g.lineTo(fx + 1.8, fy + 10.6);
      g.lineTo(fx + 1.2, fy + 14.2);
      g.lineTo(fx, fy + 12.6);
      g.lineTo(fx - 1.2, fy + 14.2);
      g.closePath();
      g.fill();
      dot(g, fx + 0.8, fy + 1.6, 0.8, '#4c524a');
      // The string ties each head to the line.
      g.strokeStyle = 'rgba(46,34,22,0.6)';
      g.lineWidth = 0.8;
      g.beginPath();
      g.moveTo(fx, fy - 1);
      g.lineTo(fx, fy + 1);
      g.stroke();
    }
  }
  // Steam drifting through everything, as reported.
  for (const [wx, wy] of [[100, 96], [138, 88], [118, 70]] as const) {
    g.strokeStyle = 'rgba(242,236,224,0.4)';
    g.lineWidth = 3.4;
    g.beginPath();
    g.moveTo(wx, wy + 18);
    g.bezierCurveTo(wx + 6, wy + 8, wx - 6, wy + 2, wx + 2, wy - 10);
    g.stroke();
  }
  figure(g, 120, 148, 1.4);
}

/** Nº 6, Kerala: the jetty's end, the monsoon, one black umbrella. */
function jetty(g: CanvasRenderingContext2D) {
  const sky = g.createLinearGradient(0, 0, 0, 92);
  sky.addColorStop(0, '#5e6a78');
  sky.addColorStop(1, '#8a9498');
  g.fillStyle = sky;
  g.fillRect(0, 0, W, 92);
  // The channel, silver where the rain hammers it flat.
  const water = g.createLinearGradient(0, 88, 0, H);
  water.addColorStop(0, '#9faeab');
  water.addColorStop(1, '#77918e');
  g.fillStyle = water;
  g.fillRect(0, 88, W, H - 88);
  g.strokeStyle = 'rgba(230,238,234,0.4)';
  g.lineWidth = 1;
  for (const [lx, ly, lw] of [[16, 100, 30], [90, 120, 36], [170, 104, 28], [50, 146, 40]] as const) {
    g.beginPath();
    g.moveTo(lx, ly);
    g.lineTo(lx + lw, ly);
    g.stroke();
  }
  // Palms at the bank, bowing the way she said.
  for (const [px, lean] of [[20, 0.5], [216, -0.45]] as const) {
    g.strokeStyle = '#5a4630';
    g.lineWidth = 3;
    g.beginPath();
    g.moveTo(px, 96);
    g.quadraticCurveTo(px + lean * 18, 66, px + lean * 34, 46);
    g.stroke();
    g.strokeStyle = '#4d7440';
    g.lineWidth = 2.4;
    const tx = px + lean * 34;
    for (const a of [-1.1, -0.5, 0.2, 0.8, 1.4]) {
      g.beginPath();
      g.moveTo(tx, 46);
      g.quadraticCurveTo(
        tx + Math.cos(a + lean) * 13,
        44 + Math.sin(a) * 5 - 5,
        tx + Math.cos(a + lean) * 22,
        46 + Math.sin(a) * 9 + 3,
      );
      g.stroke();
    }
  }
  // The jetty, planks marching out into the argument.
  const jt = g.createLinearGradient(0, 108, 0, H);
  jt.addColorStop(0, '#8a6a48');
  jt.addColorStop(1, '#684e34');
  g.fillStyle = jt;
  g.beginPath();
  g.moveTo(74, 176);
  g.lineTo(104, 104);
  g.lineTo(136, 104);
  g.lineTo(170, 176);
  g.closePath();
  g.fill();
  g.strokeStyle = 'rgba(50,36,22,0.5)';
  g.lineWidth = 1.4;
  for (let i = 0; i < 5; i++) {
    const y = 116 + i * 13;
    const spread = (y - 104) * 0.46;
    g.beginPath();
    g.moveTo(120 - 16 - spread, y);
    g.lineTo(120 + 16 + spread, y);
    g.stroke();
  }
  // The traveler at the end of it, grinning under one enormous umbrella.
  figure(g, 120, 126, 1.35);
  g.strokeStyle = '#2c2620';
  g.lineWidth = 1.8;
  g.beginPath();
  g.moveTo(126, 108);
  g.lineTo(129, 86);
  g.stroke();
  g.fillStyle = '#221e1a';
  g.beginPath();
  g.moveTo(101, 88);
  g.quadraticCurveTo(129, 62, 157, 88);
  g.quadraticCurveTo(147, 84, 138, 88);
  g.quadraticCurveTo(129, 83, 120, 88);
  g.quadraticCurveTo(111, 84, 101, 88);
  g.closePath();
  g.fill();
  rain(g, new Rng(66), 'rgba(226,234,236,0.4)', 110);
}

/** Nº 7, Delhi: the rooftop, the storm, the last kites coming down. */
function kites(g: CanvasRenderingContext2D) {
  const sky = g.createLinearGradient(0, 0, 0, 120);
  sky.addColorStop(0, '#3d4560');
  sky.addColorStop(0.7, '#5a5872');
  sky.addColorStop(1, '#8a6a70');
  g.fillStyle = sky;
  g.fillRect(0, 0, W, 120);
  // Lightning over the fort, obliging.
  g.strokeStyle = 'rgba(244,238,214,0.85)';
  g.lineWidth = 1.6;
  g.beginPath();
  g.moveTo(196, 8);
  g.lineTo(188, 34);
  g.lineTo(196, 36);
  g.lineTo(184, 62);
  g.stroke();
  // Domes and minarets, keeping the horizon honest.
  g.fillStyle = '#2c2a3c';
  g.beginPath();
  g.arc(60, 112, 26, Math.PI, 0);
  g.closePath();
  g.fill();
  g.beginPath();
  g.moveTo(56, 86);
  g.lineTo(60, 74);
  g.lineTo(64, 86);
  g.closePath();
  g.fill();
  g.beginPath();
  g.arc(150, 116, 17, Math.PI, 0);
  g.closePath();
  g.fill();
  for (const mx of [104, 198, 224]) {
    g.fillRect(mx - 2.4, 78, 4.8, 40);
    dot(g, mx, 76, 3.4, '#2c2a3c');
  }
  g.fillStyle = '#262438';
  g.fillRect(0, 112, W, 12);
  // Kites, red and gold, taking the storm's advice at last.
  const kite = (kx: number, ky: number, ks: number, rot: number, c: string) => {
    g.save();
    g.translate(kx, ky);
    g.rotate(rot);
    g.fillStyle = c;
    g.beginPath();
    g.moveTo(0, -ks * 1.15);
    g.lineTo(ks * 0.85, 0);
    g.lineTo(0, ks * 1.3);
    g.lineTo(-ks * 0.85, 0);
    g.closePath();
    g.fill();
    g.strokeStyle = 'rgba(240,232,210,0.5)';
    g.lineWidth = 1;
    g.beginPath();
    g.moveTo(0, ks * 1.3);
    g.quadraticCurveTo(-ks, ks * 2.6, -ks * 0.4, ks * 4.2);
    g.stroke();
    g.restore();
  };
  kite(96, 34, 7, 0.3, '#c1512f');
  kite(170, 56, 5.4, -0.4, '#d9a441');
  kite(210, 26, 4.4, 0.55, '#8fcbe8');
  // Pigeons, one last silver loop between the raindrops.
  birds(g, [[130, 44, 4], [142, 52, 3.2], [120, 56, 3]], 'rgba(214,218,224,0.6)');
  // The parapet and the roof, rain-dark.
  const roof = g.createLinearGradient(0, 124, 0, H);
  roof.addColorStop(0, '#6e5544');
  roof.addColorStop(1, '#54402f');
  g.fillStyle = roof;
  g.fillRect(0, 124, W, H - 124);
  g.fillStyle = '#7d6350';
  g.fillRect(0, 124, W, 7);
  g.strokeStyle = 'rgba(40,28,18,0.4)';
  g.lineWidth = 1.2;
  for (const px of [30, 76, 122, 168, 214]) {
    g.beginPath();
    g.moveTo(px, 131);
    g.lineTo(px, 124);
    g.stroke();
  }
  figure(g, 120, 164, 1.4);
  rain(g, new Rng(11), 'rgba(210,220,230,0.32)', 120);
}

/** Nº 8, Zanzibar: the carved door, a hundred years of arrivals. */
function door(g: CanvasRenderingContext2D) {
  // Coral-plaster lane in the golden hour the lane itself chose.
  const wall = g.createLinearGradient(0, 0, 0, H);
  wall.addColorStop(0, '#e0b98a');
  wall.addColorStop(1, '#c99a68');
  g.fillStyle = wall;
  g.fillRect(0, 0, W, H);
  // Weathered patches where the plaster admits its age.
  for (const [px, py, pw, ph] of [[16, 30, 20, 10], [204, 60, 22, 12], [30, 100, 14, 8]] as const) {
    oval(g, px, py, pw, ph, 'rgba(150,102,58,0.12)');
  }
  // The street.
  const st = g.createLinearGradient(0, 138, 0, H);
  st.addColorStop(0, '#b09068');
  st.addColorStop(1, '#93764e');
  g.fillStyle = st;
  g.fillRect(0, 138, W, H - 138);
  // The frame: carved lintel and posts, deep as a ship's beam.
  g.fillStyle = '#5c3f28';
  g.fillRect(72, 20, 96, 122);
  g.fillStyle = '#6e4c30';
  g.fillRect(80, 30, 80, 112);
  // The arch, carved, with its running border.
  g.fillStyle = '#4a321e';
  g.beginPath();
  g.arc(120, 62, 40, Math.PI, 0);
  g.closePath();
  g.fill();
  g.strokeStyle = 'rgba(216,178,122,0.5)';
  g.lineWidth = 1.6;
  g.beginPath();
  g.arc(120, 62, 34, Math.PI, 0);
  g.stroke();
  for (let i = 0; i < 7; i++) {
    const a = Math.PI + ((i + 0.5) / 7) * Math.PI;
    dot(g, 120 + Math.cos(a) * 37, 62 + Math.sin(a) * 37, 1.4, 'rgba(216,178,122,0.55)');
  }
  // The doors themselves, studded in their brass constellation.
  const wood = g.createLinearGradient(0, 62, 0, 142);
  wood.addColorStop(0, '#4a331e');
  wood.addColorStop(1, '#38250f');
  g.fillStyle = wood;
  g.fillRect(86, 62, 68, 80);
  g.strokeStyle = 'rgba(20,12,6,0.6)';
  g.lineWidth = 1.6;
  g.beginPath();
  g.moveTo(120, 62);
  g.lineTo(120, 142);
  g.stroke();
  g.fillStyle = '#d8a84e';
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 3; col++) {
      dot(g, 94 + col * 11, 74 + row * 17, 2.2, '#d8a84e');
      dot(g, 124 + col * 11, 74 + row * 17, 2.2, '#d8a84e');
    }
  }
  // Late gold falling across the lane.
  const gold = g.createLinearGradient(0, 0, 60, 170);
  gold.addColorStop(0, 'rgba(255,214,140,0.28)');
  gold.addColorStop(1, 'rgba(255,214,140,0)');
  g.fillStyle = gold;
  g.fillRect(0, 0, W, H);
  // A kanga folded over a stool, mid-bargain, both parties delighted.
  oval(g, 37, 160, 15, 3.4, 'rgba(60,42,24,0.3)');
  g.fillStyle = '#6e4c30';
  g.fillRect(27, 152, 3, 8);
  g.fillRect(44, 152, 3, 8);
  rr(g, 24, 144, 26, 12, 2, '#c1512f');
  g.strokeStyle = '#e8d44d';
  g.lineWidth = 1.4;
  g.beginPath();
  g.moveTo(26, 148);
  g.lineTo(48, 148);
  g.stroke();
  figure(g, 180, 158, 1.45);
}

/** Nº 9, Sicily: the faraglioni, missed so beautifully towns grew to look. */
function stones(g: CanvasRenderingContext2D) {
  const sky = g.createLinearGradient(0, 0, 0, 96);
  sky.addColorStop(0, '#a9cbe0');
  sky.addColorStop(1, '#e8d9ae');
  g.fillStyle = sky;
  g.fillRect(0, 0, W, 96);
  dot(g, 204, 26, 10, 'rgba(250,238,206,0.9)');
  const sea = g.createLinearGradient(0, 90, 0, 140);
  sea.addColorStop(0, '#4f86a8');
  sea.addColorStop(1, '#3f7292');
  g.fillStyle = sea;
  g.fillRect(0, 90, W, 50);
  g.strokeStyle = 'rgba(240,248,244,0.5)';
  g.lineWidth = 1;
  for (const [lx, ly, lw] of [[20, 100, 24], [100, 112, 30], [150, 98, 20], [60, 126, 34]] as const) {
    g.beginPath();
    g.moveTo(lx, ly);
    g.lineTo(lx + lw, ly);
    g.stroke();
  }
  // The giant's throws, still standing where they landed.
  const stack = (sx: number, sw: number, top: number) => {
    g.fillStyle = '#7c6a58';
    g.beginPath();
    g.moveTo(sx - sw, 96);
    g.quadraticCurveTo(sx - sw * 0.8, (top + 96) / 2, sx - sw * 0.35, top + 6);
    g.quadraticCurveTo(sx, top - 6, sx + sw * 0.4, top + 10);
    g.quadraticCurveTo(sx + sw * 0.85, (top + 100) / 2, sx + sw * 0.9, 98);
    g.closePath();
    g.fill();
    g.fillStyle = 'rgba(50,40,30,0.28)';
    g.beginPath();
    g.moveTo(sx + sw * 0.1, top + 2);
    g.quadraticCurveTo(sx + sw * 0.5, (top + 98) / 2, sx + sw * 0.9, 98);
    g.lineTo(sx + sw * 0.35, 98);
    g.quadraticCurveTo(sx + sw * 0.1, (top + 98) / 2, sx + sw * 0.05, top + 4);
    g.closePath();
    g.fill();
    // Foam at the waterline: the sea keeps checking its work.
    g.strokeStyle = 'rgba(240,248,244,0.65)';
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(sx - sw - 4, 97);
    g.quadraticCurveTo(sx, 101, sx + sw + 2, 97);
    g.stroke();
  };
  stack(150, 20, 34);
  stack(196, 13, 56);
  stack(120, 8, 74);
  // The volcanic shore in the foreground, warm and knuckled.
  g.fillStyle = '#8a7458';
  g.beginPath();
  g.moveTo(0, H);
  g.lineTo(0, 128);
  g.quadraticCurveTo(60, 116, 120, 132);
  g.quadraticCurveTo(190, 148, 240, 138);
  g.lineTo(240, H);
  g.closePath();
  g.fill();
  for (const [rx, ry, rr2] of [[36, 138, 9], [88, 146, 7], [170, 152, 10]] as const) {
    oval(g, rx, ry, rr2, rr2 * 0.55, '#77624a');
  }
  birds(g, [[62, 30, 5], [80, 38, 4]]);
  figure(g, 70, 132, 1.35);
}

/** Nº 10, Oaxaca: orange to the horizon, the last frame of the roll. */
function field(g: CanvasRenderingContext2D) {
  const sky = g.createLinearGradient(0, 0, 0, 78);
  sky.addColorStop(0, '#c9d4e0');
  sky.addColorStop(1, '#ecd0a0');
  g.fillStyle = sky;
  g.fillRect(0, 0, W, 78);
  // Far hills, the color of evening deciding; soft-shouldered, half in haze.
  g.fillStyle = 'rgba(155,139,160,0.65)';
  g.beginPath();
  g.moveTo(0, 78);
  g.quadraticCurveTo(50, 52, 104, 76);
  g.quadraticCurveTo(160, 54, 240, 76);
  g.lineTo(240, 78);
  g.closePath();
  g.fill();
  // The camposanto wall, whitewashed, with its one arch and its candles.
  g.fillStyle = '#ece2cc';
  g.fillRect(0, 70, W, 22);
  g.fillStyle = '#d9c8a8';
  g.fillRect(0, 88, W, 4);
  // The gate: an arched doorway let into the whitewash, tile cap above it.
  g.fillStyle = '#b5713f';
  g.fillRect(174, 70, 24, 4.5);
  g.fillStyle = '#5a4028';
  g.beginPath();
  g.moveTo(178, 92);
  g.lineTo(178, 82);
  g.arc(186, 82, 8, Math.PI, 0);
  g.lineTo(194, 92);
  g.closePath();
  g.fill();
  for (const cx of [26, 74, 130]) {
    g.fillStyle = '#f2e6d0';
    g.fillRect(cx, 78, 2.6, 6);
    dot(g, cx + 1.3, 76.5, 1.6, '#f2c04e');
  }
  // The cempasúchil, armful over armful, all the way forward.
  const fld = g.createLinearGradient(0, 92, 0, H);
  fld.addColorStop(0, '#c97a2e');
  fld.addColorStop(1, '#b5591f');
  g.fillStyle = fld;
  g.fillRect(0, 92, W, H - 92);
  const r = new Rng(9);
  for (let i = 0; i < 260; i++) {
    const t = r.next();
    const y = 94 + t * t * 76;
    const x = r.next() * W;
    const size = 1.2 + t * 2.6;
    dot(g, x, y, size, r.chance(0.55) ? '#e8862f' : r.chance(0.5) ? '#f2a03c' : '#d9691f');
    if (r.chance(0.18)) dot(g, x, y - size * 0.4, size * 0.4, '#f4c14e');
  }
  // A marigold path mown through, the kind that leads somebody home.
  g.fillStyle = 'rgba(180,90,30,0.55)';
  g.beginPath();
  g.moveTo(104, 176);
  g.quadraticCurveTo(112, 130, 128, 96);
  g.lineTo(140, 96);
  g.quadraticCurveTo(130, 132, 128, 176);
  g.closePath();
  g.fill();
  // Waist-deep, arriving; the marigolds close over the road behind.
  figure(g, 130, 128, 1.4, { shadow: false });
  const r2 = new Rng(31);
  for (let i = 0; i < 44; i++) {
    const x = 130 + (r2.next() - 0.5) * 34;
    const y = 122 + r2.next() * 10;
    dot(g, x, y, 1.6 + r2.next() * 2, r2.chance(0.5) ? '#e8862f' : '#f2a03c');
  }
  birds(g, [[196, 30, 4.4], [212, 38, 3.6]]);
}

/**
 * The eleventh frame, which is not Chasca's. Ch'aska Pampa after dark, seen
 * from the well: four kitchens, one red flag, the pass a blue notch above.
 * Nobody photographed this one, so it is painted the way you remember a place
 * you are standing in. The closing book ends here; the album does not.
 */
function home(g: CanvasRenderingContext2D) {
  const sky = g.createLinearGradient(0, 0, 0, 100);
  sky.addColorStop(0, '#1d2c52');
  sky.addColorStop(0.58, '#3e4470');
  sky.addColorStop(1, '#8a6a72');
  g.fillStyle = sky;
  g.fillRect(0, 0, W, 100);
  // The high sky the whole journey happened under, and its grazing stars.
  const rs = new Rng(1974);
  for (let i = 0; i < 110; i++) {
    const x = rs.next() * W;
    const y = rs.next() * 80;
    dot(g, x, y, rs.chance(0.1) ? 1.6 : 0.85, rs.chance(0.28) ? '#fff0c8' : 'rgba(240,234,216,0.75)');
  }
  // The cordillera, soft-shouldered, with the notch you came home through.
  g.fillStyle = 'rgba(88,86,128,0.92)';
  g.beginPath();
  g.moveTo(0, 100);
  g.lineTo(0, 66);
  g.quadraticCurveTo(26, 40, 52, 62);
  g.quadraticCurveTo(72, 76, 92, 52);
  g.quadraticCurveTo(112, 32, 134, 60);
  g.quadraticCurveTo(152, 78, 172, 54);
  g.quadraticCurveTo(200, 30, 240, 62);
  g.lineTo(240, 100);
  g.closePath();
  g.fill();
  g.fillStyle = 'rgba(58,54,88,0.92)';
  g.beginPath();
  g.moveTo(0, 100);
  g.lineTo(0, 88);
  g.quadraticCurveTo(58, 74, 118, 90);
  g.quadraticCurveTo(184, 104, 240, 84);
  g.lineTo(240, 100);
  g.closePath();
  g.fill();
  // The puna floor the village stands on: cold, wide, and quietly grazed.
  const ground = g.createLinearGradient(0, 96, 0, H);
  ground.addColorStop(0, '#5d5560');
  ground.addColorStop(0.55, '#494150');
  ground.addColorStop(1, '#332c34');
  g.fillStyle = ground;
  g.fillRect(0, 96, W, H - 96);
  // A little grazed texture so the floor is a place and not a fill.
  const rg = new Rng(77);
  for (let i = 0; i < 80; i++) {
    const t = rg.next();
    dot(g, rg.next() * W, 100 + t * t * 58, 0.9 + t * 1.4, 'rgba(126,116,110,0.35)');
  }

  /** One low adobe house with a thatch cap, and its smoke going straight up. */
  const house = (hx: number, hy: number, s: number, lit: boolean) => {
    rr(g, hx - 17 * s, hy - 18 * s, 34 * s, 19 * s, 1.8 * s, '#8a6f55');
    g.fillStyle = 'rgba(40,30,22,0.34)';
    g.fillRect(hx - 17 * s, hy - 3 * s, 34 * s, 4 * s);
    // Thatch, overhanging, the way every roof in this village overhangs.
    g.fillStyle = '#6b533c';
    g.beginPath();
    g.moveTo(hx - 22 * s, hy - 16 * s);
    g.quadraticCurveTo(hx, hy - 34 * s, hx + 22 * s, hy - 16 * s);
    g.closePath();
    g.fill();
    g.fillStyle = 'rgba(28,20,14,0.22)';
    g.beginPath();
    g.moveTo(hx - 22 * s, hy - 16 * s);
    g.quadraticCurveTo(hx, hy - 22 * s, hx + 22 * s, hy - 16 * s);
    g.lineTo(hx + 22 * s, hy - 14 * s);
    g.lineTo(hx - 22 * s, hy - 14 * s);
    g.closePath();
    g.fill();
    if (lit) {
      // A doorway with a kitchen behind it: the whole thesis, in one rectangle.
      g.fillStyle = '#f7bd68';
      g.fillRect(hx - 4 * s, hy - 12 * s, 8 * s, 13 * s);
      g.fillStyle = 'rgba(247,189,104,0.22)';
      g.beginPath();
      g.moveTo(hx - 4 * s, hy + 1 * s);
      g.lineTo(hx + 4 * s, hy + 1 * s);
      g.lineTo(hx + 16 * s, hy + 17 * s);
      g.lineTo(hx - 16 * s, hy + 17 * s);
      g.closePath();
      g.fill();
    } else {
      g.fillStyle = '#eda94e';
      g.fillRect(hx - 3.2 * s, hy - 11 * s, 6 * s, 5 * s);
      dot(g, hx, hy - 8.5 * s, 5 * s, 'rgba(237,169,78,0.16)');
    }
    // Smoke, straight as loom threads, because there is no wind tonight.
    g.lineCap = 'round';
    for (const [w, a] of [[7 * s, 0.085], [2.6 * s, 0.2]] as const) {
      g.strokeStyle = `rgba(226,218,206,${a})`;
      g.lineWidth = w;
      g.beginPath();
      g.moveTo(hx + 10 * s, hy - 24 * s);
      g.quadraticCurveTo(hx + 7 * s, hy - 48 * s, hx + 11 * s, hy - 72 * s);
      g.stroke();
    }
  };
  house(36, 120, 0.95, false);
  house(98, 134, 1.3, true);
  house(162, 122, 1.05, false);
  house(216, 136, 0.9, false);

  // Rosa's flag, up, because the flag is always up by the time you get there.
  g.strokeStyle = '#4a3a2c';
  g.lineWidth = 1.8;
  g.beginPath();
  g.moveTo(134, 122);
  g.lineTo(134, 88);
  g.stroke();
  g.fillStyle = '#c94f2c';
  g.beginPath();
  g.moveTo(134, 88);
  g.lineTo(155, 96);
  g.lineTo(134, 104);
  g.closePath();
  g.fill();

  // The well rim across the bottom edge, close enough that you are sitting on
  // it. Older than the church; the water is older than everything.
  g.fillStyle = '#7a7168';
  g.beginPath();
  g.moveTo(-6, H);
  g.lineTo(-6, 160);
  g.quadraticCurveTo(120, 138, 246, 160);
  g.lineTo(246, H);
  g.closePath();
  g.fill();
  g.fillStyle = 'rgba(46,40,34,0.4)';
  g.beginPath();
  g.moveTo(-6, 170);
  g.quadraticCurveTo(120, 149, 246, 170);
  g.lineTo(246, 176);
  g.lineTo(-6, 176);
  g.closePath();
  g.fill();
  // The lit edge of the rim, because a kitchen door is open behind you.
  g.strokeStyle = 'rgba(246,214,164,0.35)';
  g.lineWidth = 2;
  g.beginPath();
  g.moveTo(-6, 160);
  g.quadraticCurveTo(120, 138, 246, 160);
  g.stroke();
  g.strokeStyle = 'rgba(238,228,206,0.16)';
  g.lineWidth = 1.1;
  for (const bx of [16, 52, 92, 148, 190, 224]) {
    g.beginPath();
    g.moveTo(bx, 152 + Math.abs(bx - 120) * 0.055);
    g.lineTo(bx, H);
    g.stroke();
  }
  // The journal, closed, set on the stone where she once set hers.
  g.save();
  g.translate(44, 148);
  g.rotate(-0.13);
  oval(g, 2, 16, 26, 4, 'rgba(24,18,14,0.35)');
  rr(g, -23, -15, 46, 29, 2.4, '#b07a3c');
  rr(g, -23, -15, 7, 29, 2.4, '#7d4f24');
  rr(g, 16, -12, 6, 23, 1.2, '#efe3ca');
  g.strokeStyle = 'rgba(250,236,206,0.55)';
  g.lineWidth = 1.2;
  g.beginPath();
  g.moveTo(-4, -15);
  g.lineTo(-4, 14);
  g.stroke();
  g.restore();
  birds(g, [[196, 40, 3.6], [212, 48, 3]], 'rgba(226,218,204,0.45)');
}

// ---------------------------------------------------------------- the roll

const PAINTERS: Record<string, (g: CanvasRenderingContext2D) => void> = {
  bajada,
  pier,
  deck,
  noren,
  alley,
  jetty,
  kites,
  door,
  stones,
  field,
  home,
};

/** Paints (once) and returns the developed print for an album frame key. */
export function makePhotoArt(key: string): HTMLCanvasElement | null {
  const hit = cache.get(key);
  if (hit) return hit;
  const paint = PAINTERS[key];
  if (!paint) return null;
  const { cv, g } = surface(W, H);
  paint(g);
  develop(g, key.length * 2749 + 17);
  cache.set(key, cv);
  return cv;
}
