import { dot, oval, rr, surface } from './pix';

/**
 * The cover painting: the whole journey in one small gouache. Cordillera to
 * sea, one cream road stitching them together, and the bowl waiting in the
 * foreground, because the game keeps its promises. Painted once, cached.
 */

let cached: HTMLCanvasElement | null = null;

export function makeCoverArt(): HTMLCanvasElement {
  if (cached) return cached;
  const W = 372;
  const H = 190;
  const { cv, g } = surface(W, H);

  // Sky: dawn gold breathing up into a high pale blue.
  const sky = g.createLinearGradient(0, 0, 0, H * 0.62);
  sky.addColorStop(0, '#a9cbd8');
  sky.addColorStop(0.55, '#e8d9ae');
  sky.addColorStop(1, '#f0dfae');
  g.fillStyle = sky;
  g.fillRect(0, 0, W, H * 0.62);

  // The sun, patient, upper right.
  const sun = g.createRadialGradient(292, 38, 4, 292, 38, 46);
  sun.addColorStop(0, 'rgba(255,240,200,0.95)');
  sun.addColorStop(0.35, 'rgba(255,226,160,0.5)');
  sun.addColorStop(1, 'rgba(255,226,160,0)');
  g.fillStyle = sun;
  g.fillRect(240, -10, 110, 100);
  dot(g, 292, 38, 13, '#f7ead0');

  // Birds: three quiet checkmarks.
  g.strokeStyle = 'rgba(70,60,50,0.6)';
  g.lineWidth = 1.4;
  for (const [bx, by, sw] of [[150, 34, 5], [168, 42, 4], [138, 48, 3.4]] as const) {
    g.beginPath();
    g.moveTo(bx - sw, by);
    g.quadraticCurveTo(bx - sw * 0.3, by - sw * 0.8, bx, by);
    g.quadraticCurveTo(bx + sw * 0.3, by - sw * 0.8, bx + sw, by);
    g.stroke();
  }

  // Far cordillera: two veils of blue-violet.
  g.fillStyle = '#8d93b8';
  g.beginPath();
  g.moveTo(0, 92);
  g.lineTo(34, 58);
  g.lineTo(66, 84);
  g.lineTo(104, 46);
  g.lineTo(148, 88);
  g.lineTo(190, 66);
  g.lineTo(238, 92);
  g.lineTo(0, 92);
  g.closePath();
  g.fill();
  // Snow on the tallest.
  g.fillStyle = '#eef0f4';
  g.beginPath();
  g.moveTo(96, 55);
  g.lineTo(104, 46);
  g.lineTo(112, 55);
  g.lineTo(106, 58);
  g.lineTo(101, 56);
  g.closePath();
  g.fill();
  g.fillStyle = '#a4a9c6';
  g.beginPath();
  g.moveTo(140, 92);
  g.lineTo(196, 60);
  g.lineTo(252, 92);
  g.closePath();
  g.fill();

  // The sea: a teal band with a toy ship steaming for the edge of the page.
  const sea = g.createLinearGradient(0, 88, 0, 112);
  sea.addColorStop(0, '#79a8b5');
  sea.addColorStop(1, '#5d92a3');
  g.fillStyle = sea;
  g.fillRect(0, 88, W, 26);
  g.strokeStyle = 'rgba(240,248,244,0.5)';
  g.lineWidth = 1;
  for (const [lx, ly, lw] of [[36, 98, 16], [120, 104, 20], [210, 96, 14], [300, 105, 18]] as const) {
    g.beginPath();
    g.moveTo(lx, ly);
    g.lineTo(lx + lw, ly);
    g.stroke();
  }
  // Ship: hull, house, one thread of smoke.
  rr(g, 296, 92, 30, 7, 2, '#4a3a4e');
  rr(g, 304, 86, 12, 6, 1.5, '#e8dcc4');
  g.strokeStyle = 'rgba(240,236,225,0.7)';
  g.lineWidth = 1.6;
  g.beginPath();
  g.moveTo(310, 84);
  g.bezierCurveTo(312, 78, 306, 74, 310, 68);
  g.stroke();

  // Rolling hills, terraced on the left the way home is.
  g.fillStyle = '#a8a05c';
  g.beginPath();
  g.moveTo(0, 190);
  g.lineTo(0, 118);
  g.quadraticCurveTo(70, 96, 140, 122);
  g.quadraticCurveTo(210, 146, 372, 120);
  g.lineTo(372, 190);
  g.closePath();
  g.fill();
  g.strokeStyle = 'rgba(90,84,40,0.35)';
  g.lineWidth = 1.6;
  for (let i = 0; i < 4; i++) {
    g.beginPath();
    g.moveTo(8, 122 + i * 7);
    g.quadraticCurveTo(50, 112 + i * 7, 92, 124 + i * 7);
    g.stroke();
  }
  // Foreground meadow.
  g.fillStyle = '#7f9152';
  g.beginPath();
  g.moveTo(0, 190);
  g.lineTo(0, 152);
  g.quadraticCurveTo(110, 136, 214, 154);
  g.quadraticCurveTo(300, 168, 372, 150);
  g.lineTo(372, 190);
  g.closePath();
  g.fill();

  // The road: one cream thread from the bottom of the page to the pass.
  g.strokeStyle = '#e3d3a8';
  g.lineCap = 'round';
  g.lineWidth = 10;
  g.beginPath();
  g.moveTo(150, 196);
  g.bezierCurveTo(120, 168, 230, 158, 196, 138);
  g.stroke();
  g.lineWidth = 5;
  g.beginPath();
  g.moveTo(196, 138);
  g.bezierCurveTo(170, 124, 210, 116, 196, 104);
  g.stroke();
  g.lineWidth = 2.4;
  g.beginPath();
  g.moveTo(196, 104);
  g.bezierCurveTo(188, 96, 200, 92, 196, 62);
  g.stroke();

  // Tiny landmarks along the way: a red roof, a torii, a palm, a cactus.
  rr(g, 84, 138, 12, 8, 1.5, '#c9b490'); // little house
  g.fillStyle = '#b5573a';
  g.beginPath();
  g.moveTo(82, 139);
  g.lineTo(90, 132);
  g.lineTo(98, 139);
  g.closePath();
  g.fill();
  // Torii on the right hill.
  g.strokeStyle = '#c1512f';
  g.lineWidth = 2.4;
  g.beginPath();
  g.moveTo(298, 132);
  g.lineTo(298, 142);
  g.moveTo(308, 132);
  g.lineTo(308, 142);
  g.moveTo(294, 132);
  g.lineTo(312, 132);
  g.moveTo(296, 136);
  g.lineTo(310, 136);
  g.stroke();
  // Palm by the sea.
  g.strokeStyle = '#7a5636';
  g.lineWidth = 2;
  g.beginPath();
  g.moveTo(252, 122);
  g.quadraticCurveTo(254, 112, 252, 106);
  g.stroke();
  g.strokeStyle = '#5c8752';
  g.lineWidth = 2;
  for (const a of [-0.9, -0.3, 0.3, 0.9]) {
    g.beginPath();
    g.moveTo(252, 106);
    g.quadraticCurveTo(252 + Math.cos(a) * 9, 104 + Math.sin(a) * 4 - 4, 252 + Math.cos(a) * 14, 106 + Math.sin(a) * 6);
    g.stroke();
  }
  // Cactus near the road.
  g.strokeStyle = '#4d7440';
  g.lineWidth = 3.4;
  g.beginPath();
  g.moveTo(232, 172);
  g.lineTo(232, 158);
  g.moveTo(232, 164);
  g.lineTo(227, 160);
  g.moveTo(232, 166);
  g.lineTo(237, 161);
  g.stroke();

  // The bowl, foreground center: the destination of every road above it.
  const bx = 186;
  const by = 168;
  oval(g, bx, by + 9, 30, 6, 'rgba(31,22,12,0.28)');
  const bowl = g.createLinearGradient(0, by - 10, 0, by + 12);
  bowl.addColorStop(0, '#b5713f');
  bowl.addColorStop(1, '#7d4c2c');
  g.fillStyle = bowl;
  g.beginPath();
  g.moveTo(bx - 27, by - 8);
  g.quadraticCurveTo(bx - 25, by + 12, bx, by + 13);
  g.quadraticCurveTo(bx + 25, by + 12, bx + 27, by - 8);
  g.closePath();
  g.fill();
  oval(g, bx, by - 8, 27, 6.5, '#8a5330');
  oval(g, bx, by - 8, 23, 5, '#d9a441');
  oval(g, bx - 7, by - 9.5, 6, 2, '#e8c063');
  // A stripe of the woven band around the bowl.
  g.fillStyle = '#c1512f';
  g.fillRect(bx - 26, by + 1, 52, 3);
  g.fillStyle = '#3f7fb0';
  g.fillRect(bx - 24, by + 4, 48, 2);

  // A soft vignette so the painting sits INTO the cover.
  const vig = g.createRadialGradient(W / 2, H / 2, H * 0.45, W / 2, H / 2, H * 0.95);
  vig.addColorStop(0, 'rgba(0,0,0,0)');
  vig.addColorStop(1, 'rgba(40,26,16,0.22)');
  g.fillStyle = vig;
  g.fillRect(0, 0, W, H);

  cached = cv;
  return cv;
}
