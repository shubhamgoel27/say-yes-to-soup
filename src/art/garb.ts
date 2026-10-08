import { dot, oval, rr, shade } from './pix';
import type { Look } from './character';

/**
 * Everyday dress beyond the Andes, drawn in the rig's own idiom: soft
 * gradient shapes, value contrast, no outlines. Everything here is working
 * clothes, what a fishmonger, a weaver or a ferry captain actually wears on
 * an ordinary day, never costume. Coordinates are the 80x128 sprite cell
 * (feet on y=124) unless a function takes its own centre and radius, in
 * which case it is shared with the 160px dialogue portrait.
 */

export type Dir = 'down' | 'up' | 'left';

/** Leg colour for a garb: trousers where there are trousers, else skin. */
export function legTone(look: Look): string | null {
  switch (look.garb) {
    case 'shirt':
    case 'kurta':
    case 'jacket':
    case 'sweater':
    case 'wrap':
      return look.pants ?? '#4a4038';
    case 'salwar':
      return look.pants ?? shade(look.cloth, 0.25);
    case 'coveralls':
      return shade(look.cloth, -0.08);
    default:
      return null;
  }
}

/** Garbs whose sleeves stop above the elbow unless told otherwise. */
const SHORT_SLEEVED = new Set(['saree', 'kanga', 'mundu']);

export function shortSleeves(look: Look): boolean {
  return look.sleeves === 'short' || (look.sleeves === undefined && SHORT_SLEEVED.has(look.garb ?? ''));
}

function trap(
  g: CanvasRenderingContext2D,
  cx: number,
  top: number,
  bottom: number,
  wTop: number,
  wBot: number,
  color: string,
  sway = 0,
) {
  const light = shade(color, 0.12);
  const dark = shade(color, -0.16);
  g.beginPath();
  g.moveTo(cx - wTop, top + 4);
  g.quadraticCurveTo(cx - wTop, top, cx - wTop + 5, top);
  g.lineTo(cx + wTop - 5, top);
  g.quadraticCurveTo(cx + wTop, top, cx + wTop, top + 4);
  g.quadraticCurveTo(cx + wBot + 1, (top + bottom) / 2, cx + wBot + sway, bottom);
  g.lineTo(cx - wBot + sway, bottom);
  g.quadraticCurveTo(cx - wBot - 1, (top + bottom) / 2, cx - wTop, top + 4);
  g.closePath();
  const grad = g.createLinearGradient(0, top, 0, bottom);
  grad.addColorStop(0, light);
  grad.addColorStop(1, dark);
  g.fillStyle = grad;
  g.fill();
}

function line(g: CanvasRenderingContext2D, pts: number[], color: string, w: number) {
  g.strokeStyle = color;
  g.lineWidth = w;
  g.lineCap = 'round';
  g.lineJoin = 'round';
  g.beginPath();
  g.moveTo(pts[0]!, pts[1]!);
  for (let i = 2; i < pts.length; i += 2) g.lineTo(pts[i]!, pts[i + 1]!);
  g.stroke();
}

/**
 * The body garment, drawn over the legs and under the arms. `bodyTop` is the
 * shoulder line, `bob` the walk's vertical bounce, `swing` the stride phase.
 */
export function drawGarb(
  g: CanvasRenderingContext2D,
  look: Look,
  dir: Dir,
  cx: number,
  bodyTop: number,
  bob: number,
  swing: number,
) {
  const c = look.cloth;
  const lower = look.skirt ?? '#f2ead8';
  const front = dir === 'down';
  const sway = swing * 1.5;
  switch (look.garb) {
    case 'shirt':
    case 'sweater': {
      trap(g, cx, bodyTop, 93 + bob, 14, 15.5, c);
      if (look.garb === 'sweater') {
        // Knit: a ribbed hem and cuff-deep ridges.
        g.save();
        g.globalAlpha = 0.18;
        for (let y = bodyTop + 9; y < 88 + bob; y += 5) line(g, [cx - 13, y, cx + 13, y], shade(c, -0.3), 1.6);
        g.restore();
        rr(g, cx - 15.5, 88 + bob, 31, 5, 2.5, shade(c, -0.12));
        if (dir !== 'up') rr(g, cx - 6, bodyTop - 1, 12, 4, 2, shade(c, -0.14));
      } else if (front) {
        // Open collar and a placket.
        g.fillStyle = shade(c, 0.22);
        g.beginPath();
        g.moveTo(cx - 7, bodyTop);
        g.lineTo(cx, bodyTop + 8);
        g.lineTo(cx + 7, bodyTop);
        g.closePath();
        g.fill();
        g.fillStyle = shade(look.skin, -0.1);
        g.beginPath();
        g.moveTo(cx - 3.5, bodyTop);
        g.lineTo(cx, bodyTop + 5);
        g.lineTo(cx + 3.5, bodyTop);
        g.closePath();
        g.fill();
        for (const y of [bodyTop + 13, bodyTop + 21, bodyTop + 29]) dot(g, cx, y, 1.3, shade(c, -0.25));
      }
      break;
    }
    case 'kurta': {
      trap(g, cx, bodyTop, 106 + bob, 14, 17.5, c, sway);
      if (front) {
        line(g, [cx, bodyTop + 1, cx, bodyTop + 16], shade(c, -0.18), 2.2);
        for (const y of [bodyTop + 5, bodyTop + 10, bodyTop + 15]) dot(g, cx, y, 1.2, look.stripe);
      }
      // Side slits.
      line(g, [cx - 16.5, 94 + bob, cx - 17 + sway, 105 + bob], shade(c, -0.22), 1.6);
      line(g, [cx + 16.5, 94 + bob, cx + 17 + sway, 105 + bob], shade(c, -0.22), 1.6);
      break;
    }
    case 'kanzu':
    case 'cassock': {
      trap(g, cx, bodyTop, 117 + bob, 14, 18, c, sway);
      if (look.garb === 'kanzu') {
        if (front) {
          // The embroidered neck and its tassel, the kanzu's one ornament.
          g.strokeStyle = look.stripe;
          g.lineWidth = 2;
          g.beginPath();
          g.arc(cx, bodyTop - 2, 7, Math.PI * 0.15, Math.PI * 0.85);
          g.stroke();
          line(g, [cx, bodyTop + 5, cx, bodyTop + 19], look.stripe, 1.6);
          dot(g, cx, bodyTop + 20, 1.8, look.stripe);
        }
      } else if (front) {
        rr(g, cx - 3, bodyTop - 1, 6, 4, 1.5, '#f2ece0');
        for (let y = bodyTop + 7; y < 112 + bob; y += 6) dot(g, cx, y, 1, shade(c, 0.3));
      }
      break;
    }
    case 'mundu': {
      // The wrap first, ankle-length, gold kasavu border near the hem.
      trap(g, cx, 84 + bob, 117 + bob, 15, 17, lower, sway * 0.6);
      rr(g, cx - 17 + sway * 0.6, 109 + bob, 34, 3, 1.5, look.stripe);
      if (front) line(g, [cx + 5, 86 + bob, cx + 7 + sway * 0.6, 116 + bob], shade(lower, -0.16), 1.6);
      // Then the shirt or blouse over it.
      trap(g, cx, bodyTop, look.skirt && look.shawl ? 82 + bob : 90 + bob, 14, 15, c);
      if (front && !look.shawl) {
        g.fillStyle = shade(c, 0.2);
        g.beginPath();
        g.moveTo(cx - 6, bodyTop);
        g.lineTo(cx, bodyTop + 7);
        g.lineTo(cx + 6, bodyTop);
        g.closePath();
        g.fill();
      }
      break;
    }
    case 'saree': {
      trap(g, cx, 80 + bob, 117 + bob, 14, 18, lower, sway);
      if (front) {
        // Pleats tucked at the navel, fanning to the hem.
        g.save();
        g.globalAlpha = 0.35;
        for (const dx of [-3, 0, 3]) line(g, [cx + dx, 86 + bob, cx + dx * 1.7 + sway, 116 + bob], shade(lower, -0.25), 1.4);
        g.restore();
      }
      rr(g, cx - 18 + sway, 112 + bob, 36, 3, 1.5, look.stripe);
      trap(g, cx, bodyTop, 82 + bob, 13.5, 14, c);
      // The pallu: from the left hip across the chest and over the shoulder.
      g.fillStyle = shade(lower, 0.04);
      g.beginPath();
      if (dir === 'up') {
        g.moveTo(cx + 4, bodyTop - 1);
        g.lineTo(cx + 16, bodyTop + 1);
        g.lineTo(cx + 15, 100 + bob);
        g.lineTo(cx + 2, 100 + bob);
      } else {
        g.moveTo(cx - 15, 86 + bob);
        g.lineTo(cx - 6, 86 + bob);
        g.lineTo(cx + 15, bodyTop + 2);
        g.lineTo(cx + 6, bodyTop - 1);
      }
      g.closePath();
      g.fill();
      if (dir !== 'up') line(g, [cx - 6, 86 + bob, cx + 15, bodyTop + 2], look.stripe, 2);
      break;
    }
    case 'salwar': {
      trap(g, cx, bodyTop, 104 + bob, 14, 18, c, sway);
      line(g, [cx - 17, 92 + bob, cx - 18 + sway, 103 + bob], shade(c, -0.22), 1.6);
      line(g, [cx + 17, 92 + bob, cx + 18 + sway, 103 + bob], shade(c, -0.22), 1.6);
      if (front) {
        g.save();
        g.globalAlpha = 0.5;
        for (const [x, y] of [[-6, 12], [6, 12], [0, 20]] as const) dot(g, cx + x, bodyTop + y + bob * 0, 1.6, look.stripe);
        g.restore();
      }
      if (look.hatStyle !== 'dupatta') {
        // The dupatta worn across the shoulders, ends falling behind.
        const d = look.shawl ?? look.stripe;
        if (dir === 'up') {
          rr(g, cx - 17, bodyTop - 1, 34, 7, 3.5, d);
          rr(g, cx - 17, bodyTop + 3, 6, 30, 3, shade(d, -0.06));
          rr(g, cx + 11, bodyTop + 3, 6, 30, 3, shade(d, -0.06));
        } else {
          g.strokeStyle = d;
          g.lineWidth = 6;
          g.lineCap = 'round';
          g.beginPath();
          g.moveTo(cx - 15, bodyTop + 1);
          g.quadraticCurveTo(cx, bodyTop + 16, cx + 15, bodyTop + 1);
          g.stroke();
        }
      }
      break;
    }
    case 'kanga': {
      // A kanga wrapped as a dress: its border band at the hem, a medallion.
      trap(g, cx, bodyTop, 117 + bob, 14, 17.5, c, sway);
      rr(g, cx - 17.5 + sway, 106 + bob, 35, 8, 3, look.stripe);
      g.save();
      g.globalAlpha = 0.55;
      for (let x = -13; x <= 13; x += 6.5) dot(g, cx + x + sway, 110 + bob, 1.5, c);
      g.restore();
      if (front) {
        g.strokeStyle = look.stripe;
        g.lineWidth = 2;
        g.beginPath();
        g.arc(cx, 90 + bob, 6, 0, Math.PI * 2);
        g.stroke();
        dot(g, cx, 90 + bob, 2, look.stripe);
      }
      break;
    }
    case 'dress': {
      trap(g, cx, 84 + bob, 112 + bob, 15, 19, look.skirt ?? c, sway);
      trap(g, cx, bodyTop, 88 + bob, 13.5, 13.5, c);
      rr(g, cx - 14, 84 + bob, 28, 3, 1.5, shade(c, -0.25));
      if (front) dot(g, cx, bodyTop + 3, 2.4, shade(c, 0.25));
      break;
    }
    case 'huipil': {
      // Enredo below, sashed with a faja; the huipil boxy over it, its
      // embroidered square yoke the thing you see across a plaza.
      trap(g, cx, 88 + bob, 117 + bob, 15, 17, lower, sway * 0.6);
      trap(g, cx, bodyTop, 95 + bob, 17, 18.5, c);
      rr(g, cx - 16, 90 + bob, 32, 4, 2, look.stripe);
      if (dir !== 'up') {
        g.strokeStyle = look.stripe;
        g.lineWidth = 3;
        g.strokeRect(cx - 8, bodyTop, 16, 13);
        const accent = look.apron ?? shade(look.stripe, 0.3);
        for (const [x, y] of [[-11, 18], [11, 18], [-11, 8], [11, 8], [0, 18]] as const) dot(g, cx + x, bodyTop + y, 1.8, accent);
      }
      break;
    }
    case 'coveralls': {
      trap(g, cx, bodyTop, 98 + bob, 14, 15.5, c);
      if (front) {
        line(g, [cx, bodyTop + 6, cx, 96 + bob], shade(c, -0.3), 1.4);
        rr(g, cx + 4, bodyTop + 9, 7, 6, 1.5, shade(c, -0.1));
        g.fillStyle = shade(c, 0.18);
        g.beginPath();
        g.moveTo(cx - 9, bodyTop);
        g.lineTo(cx - 1, bodyTop + 7);
        g.lineTo(cx - 1, bodyTop);
        g.moveTo(cx + 9, bodyTop);
        g.lineTo(cx + 1, bodyTop + 7);
        g.lineTo(cx + 1, bodyTop);
        g.fill();
      }
      rr(g, cx - 14.5, 84 + bob, 29, 3, 1.5, shade(c, -0.28));
      if (look.stripe && dir !== 'left') {
        g.save();
        g.globalAlpha = 0.7;
        rr(g, cx - 14.5, 74 + bob, 29, 2.2, 1, look.stripe); // reflective band
        g.restore();
      }
      break;
    }
    case 'jacket': {
      trap(g, cx, bodyTop, 96 + bob, 14.5, 16, c);
      if (front) {
        g.fillStyle = '#f2ece0';
        g.beginPath();
        g.moveTo(cx - 6, bodyTop);
        g.lineTo(cx, bodyTop + 13);
        g.lineTo(cx + 6, bodyTop);
        g.closePath();
        g.fill();
        g.fillStyle = shade(c, -0.22);
        g.beginPath();
        g.moveTo(cx - 7, bodyTop);
        g.lineTo(cx - 2, bodyTop + 14);
        g.lineTo(cx - 11, bodyTop + 6);
        g.closePath();
        g.moveTo(cx + 7, bodyTop);
        g.lineTo(cx + 2, bodyTop + 14);
        g.lineTo(cx + 11, bodyTop + 6);
        g.closePath();
        g.fill();
        for (const y of [bodyTop + 19, bodyTop + 27]) dot(g, cx, y, 1.6, look.stripe);
      }
      break;
    }
    case 'wrap': {
      // Crossed collar, left over right: a samue in Japan, everyday hanbok
      // jeogori in Korea; same geometry, the region's colours decide.
      trap(g, cx, bodyTop, 96 + bob, 14.5, 16, c);
      if (dir !== 'up') {
        line(g, [cx - 8, bodyTop - 1, cx + 9, 84 + bob], look.stripe, 4);
        line(g, [cx + 8, bodyTop - 1, cx + 2, bodyTop + 9], shade(look.stripe, -0.15), 3);
        if (look.hatStyle !== 'headband') line(g, [cx + 9, 84 + bob, cx + 12, 92 + bob], look.stripe, 2);
      }
      break;
    }
  }
}

/** Apron over whatever is underneath: a bib, a waist, and its ties. */
export function drawApron(g: CanvasRenderingContext2D, look: Look, dir: Dir, cx: number, bodyTop: number, bob: number) {
  const a = look.apron;
  if (!a || look.garb === 'huipil') return;
  if (dir === 'up') {
    line(g, [cx - 11, 82 + bob, cx + 11, 82 + bob], shade(a, -0.1), 2.4);
    dot(g, cx - 2, 82 + bob, 2.6, a);
    dot(g, cx + 2, 82 + bob, 2.6, a);
    line(g, [cx - 1, 83 + bob, cx - 3, 92 + bob], a, 2);
    line(g, [cx + 1, 83 + bob, cx + 3, 92 + bob], a, 2);
    return;
  }
  if (dir === 'left') {
    rr(g, cx - 16, bodyTop + 10, 6, 104 - bodyTop - 10 + bob, 2.5, a);
    return;
  }
  rr(g, cx - 9, bodyTop + 8, 18, 14, 3, a);
  rr(g, cx - 12, 80 + bob, 24, 26, 4, a);
  g.save();
  g.globalAlpha = 0.25;
  rr(g, cx - 12, 80 + bob, 24, 4, 2, '#ffffff');
  g.restore();
  line(g, [cx - 8, bodyTop + 8, cx - 6, bodyTop], shade(a, -0.15), 1.6);
  line(g, [cx + 8, bodyTop + 8, cx + 6, bodyTop], shade(a, -0.15), 1.6);
}

/** A shawl over the shoulders: rebozo, kavani, a nonna's black wool. */
export function drawShawl(g: CanvasRenderingContext2D, look: Look, dir: Dir, cx: number, bodyTop: number, bob: number) {
  const s = look.shawl;
  if (!s || look.garb === 'salwar') return;
  const dark = shade(s, -0.18);
  if (look.garb === 'mundu') {
    // Kerala's neriyathu: a single cloth over the left shoulder.
    g.fillStyle = s;
    g.beginPath();
    if (dir === 'up') {
      g.moveTo(cx - 16, bodyTop);
      g.lineTo(cx - 4, bodyTop);
      g.lineTo(cx - 6, 92 + bob);
      g.lineTo(cx - 16, 92 + bob);
    } else {
      g.moveTo(cx - 15, bodyTop);
      g.lineTo(cx - 5, bodyTop - 1);
      g.lineTo(cx + 15, 86 + bob);
      g.lineTo(cx + 6, 88 + bob);
    }
    g.closePath();
    g.fill();
    if (dir !== 'up') line(g, [cx - 5, bodyTop - 1, cx + 15, 86 + bob], look.stripe, 1.8);
    return;
  }
  if (dir === 'up') {
    g.fillStyle = s;
    g.beginPath();
    g.moveTo(cx - 18, bodyTop + 1);
    g.lineTo(cx + 18, bodyTop + 1);
    g.lineTo(cx + 2, 94 + bob);
    g.lineTo(cx - 2, 94 + bob);
    g.closePath();
    g.fill();
  } else {
    g.fillStyle = s;
    g.beginPath();
    g.moveTo(cx - 18, bodyTop + 2);
    g.quadraticCurveTo(cx - 17, bodyTop - 2, cx - 10, bodyTop - 1);
    g.lineTo(cx + 10, bodyTop - 1);
    g.quadraticCurveTo(cx + 17, bodyTop - 2, cx + 18, bodyTop + 2);
    g.lineTo(cx + 17, bodyTop + 26);
    g.lineTo(cx + 9, bodyTop + 26);
    g.lineTo(cx, bodyTop + 12);
    g.lineTo(cx - 9, bodyTop + 26);
    g.lineTo(cx - 17, bodyTop + 26);
    g.closePath();
    g.fill();
  }
  // A woven stripe and fringe, so a rebozo reads as cloth and not a cape.
  g.save();
  g.globalAlpha = 0.6;
  if (dir !== 'up') {
    line(g, [cx - 17, bodyTop + 22, cx - 9, bodyTop + 22], look.stripe, 1.4);
    line(g, [cx + 9, bodyTop + 22, cx + 17, bodyTop + 22], look.stripe, 1.4);
  }
  g.restore();
  g.strokeStyle = dark;
  g.lineWidth = 1.4;
  const fy = dir === 'up' ? 94 + bob : bodyTop + 26;
  const xs = dir === 'up' ? [-2, 0, 2] : [-16, -13, -10, 10, 13, 16];
  for (const x of xs) {
    g.beginPath();
    g.moveTo(cx + x, fy);
    g.lineTo(cx + x, fy + 3.5);
    g.stroke();
  }
}

/** Something carried in the right hand, or worn on the body. */
export function drawProp(
  g: CanvasRenderingContext2D,
  look: Look,
  dir: Dir,
  cx: number,
  bodyTop: number,
  _bob: number,
  hand: [number, number],
) {
  const [hx, hy] = hand;
  switch (look.prop) {
    case 'cane':
      line(g, [hx, hy - 2, hx + (dir === 'left' ? -3 : 2), 122], '#6b4a2e', 3);
      line(g, [hx - 3, hy - 2, hx + 2, hy - 3], '#6b4a2e', 3);
      break;
    case 'ladle':
      line(g, [hx, hy + 2, hx + 1, hy - 20], '#8a6a48', 2.6);
      oval(g, hx + 1, hy - 22, 4.5, 3.5, '#9aa0a3');
      break;
    case 'broom':
      line(g, [hx - 6, hy - 18, hx + 4, hy + 18], '#8a6a48', 2.4);
      g.fillStyle = '#c9a65e';
      g.beginPath();
      g.moveTo(hx + 1, hy + 14);
      g.lineTo(hx + 12, hy + 26);
      g.lineTo(hx + 2, hy + 30);
      g.closePath();
      g.fill();
      break;
    case 'towel':
      if (dir === 'up') rr(g, cx + 6, bodyTop - 2, 9, 22, 2.5, '#f2efe6');
      else {
        rr(g, cx - 16, bodyTop - 2, 9, 24, 2.5, '#f2efe6');
        line(g, [cx - 16, bodyTop + 16, cx - 7, bodyTop + 16], '#c1512f', 1.4);
      }
      break;
    case 'jar': {
      // A glass jar of sourdough starter under a cloth lid, held up a little.
      if (dir === 'up') break;
      const jx = hx;
      const jy = hy - 6;
      rr(g, jx - 7, jy - 10, 14, 18, 4, 'rgba(214,232,238,0.82)');
      rr(g, jx - 5.5, jy - 3, 11, 10, 3, '#efe4c8');
      dot(g, jx - 2, jy, 1.2, 'rgba(255,255,255,0.8)');
      dot(g, jx + 2, jy + 3, 1, 'rgba(255,255,255,0.7)');
      rr(g, jx - 8, jy - 13, 16, 5, 2, '#c9a35f');
      line(g, [jx - 8, jy - 9, jx + 8, jy - 9], '#7a5636', 1.2);
      rr(g, jx - 5, jy - 8, 2.4, 13, 1.2, 'rgba(255,255,255,0.45)'); // the glint
      break;
    }
    case 'trident': {
      // King Neptune's, at the line crossing: three boat hooks taped to a pole.
      const top = 9;
      line(g, [hx, hy + 22, hx, top], '#8a6a48', 2.8);
      for (const ty of [hy - 6, hy - 22]) rr(g, hx - 2.4, ty, 4.8, 3.4, 1, '#efe9dc');
      line(g, [hx - 7, top, hx + 7, top], '#9aa0a3', 2.2);
      for (const px of [hx - 7, hx, hx + 7]) line(g, [px, top, px, top - 8], '#9aa0a3', 2);
      break;
    }
    case 'umbrella': {
      // A folding umbrella small as a mango, open and held up to wave.
      const ux = hx + (dir === 'left' ? -4 : 2);
      const uy = hy - 30;
      line(g, [hx, hy + 2, ux, uy], '#3a2e24', 1.8);
      g.fillStyle = '#c1512f';
      g.beginPath();
      g.arc(ux, uy, 13, Math.PI, 0);
      g.closePath();
      g.fill();
      g.fillStyle = '#e8b04a';
      g.beginPath();
      g.moveTo(ux, uy - 13);
      g.lineTo(ux - 5, uy);
      g.lineTo(ux + 5, uy);
      g.closePath();
      g.fill();
      dot(g, ux, uy - 13.5, 1.6, '#3a2e24');
      break;
    }
    case 'camera':
      if (dir === 'up') break;
      line(g, [cx - 9, bodyTop, cx, bodyTop + 16, cx + 9, bodyTop], '#241a12', 1.4);
      rr(g, cx - 6, bodyTop + 13, 12, 8, 2, '#2b2b33');
      dot(g, cx, bodyTop + 17, 2.6, '#6a7a8a');
      break;
  }
}

/**
 * Head garments, at any scale: `hr` is the head radius, 21 on the sprite,
 * 44 on the portrait. Returns nothing; draws over face and hair.
 */
export function drawHeadwear(g: CanvasRenderingContext2D, look: Look, dir: Dir, cx: number, hy: number, hr: number) {
  const k = hr / 21;
  const h = look.hat;
  const hd = shade(h, -0.2);
  const hl = shade(h, 0.16);
  const side = dir === 'left' ? -1 : 0;
  switch (look.hatStyle) {
    case 'headscarf':
    case 'kanga': {
      // Wrapped close: frames the face, covers hair and neck, falls to the
      // shoulders. The kanga wrap adds the knot high at the back.
      g.save();
      g.beginPath();
      g.moveTo(cx - hr - 3 * k, hy + 2 * k);
      g.arc(cx, hy - 1 * k, hr + 3 * k, Math.PI, Math.PI * 2);
      g.lineTo(cx + hr + 3 * k, hy + 8 * k);
      g.quadraticCurveTo(cx + hr + 5 * k, hy + hr + 6 * k, cx + hr - 2 * k, hy + hr + 10 * k);
      g.lineTo(cx - hr + 2 * k, hy + hr + 10 * k);
      g.quadraticCurveTo(cx - hr - 5 * k, hy + hr + 6 * k, cx - hr - 3 * k, hy + 8 * k);
      g.closePath();
      if (dir !== 'up') {
        // The face window, offset forward in profile.
        const fx = cx + side * 6 * k;
        g.moveTo(fx + 15 * k, hy + 4 * k);
        g.ellipse(fx, hy + 4 * k, 15 * k, 16.5 * k, 0, 0, Math.PI * 2, true);
      }
      const grad = g.createLinearGradient(0, hy - hr, 0, hy + hr + 10 * k);
      grad.addColorStop(0, hl);
      grad.addColorStop(1, hd);
      g.fillStyle = grad;
      g.fill('evenodd');
      g.restore();
      if (dir !== 'up') {
        g.strokeStyle = look.hatStyle === 'kanga' ? look.stripe : hd;
        g.lineWidth = 2 * k;
        g.beginPath();
        g.ellipse(cx + side * 6 * k, hy + 4 * k, 15.5 * k, 17 * k, 0, Math.PI * 1.08, Math.PI * 1.92);
        g.stroke();
      }
      if (look.hatStyle === 'kanga') {
        const kx = dir === 'left' ? cx + 8 * k : cx;
        oval(g, kx, hy - hr - 2 * k, 9 * k, 6.5 * k, h);
        oval(g, kx + 4 * k, hy - hr - 6 * k, 5 * k, 4 * k, hl);
        g.save();
        g.globalAlpha = 0.7;
        for (const dx of [-12, -4, 4, 12]) dot(g, cx + dx * k, hy - hr + 4 * k, 1.6 * k, look.stripe);
        g.restore();
      }
      break;
    }
    case 'dupatta':
    case 'rebozo': {
      // Draped loose over the crown, the front of the hair still showing.
      const top = hy - hr + 3 * k;
      g.fillStyle = h;
      g.beginPath();
      g.moveTo(cx - hr - 4 * k, hy + hr + 14 * k);
      g.quadraticCurveTo(cx - hr - 6 * k, hy - 4 * k, cx - hr * 0.6, top - 1 * k);
      g.quadraticCurveTo(cx, top - 8 * k, cx + hr * 0.6, top - 1 * k);
      g.quadraticCurveTo(cx + hr + 6 * k, hy - 4 * k, cx + hr + 4 * k, hy + hr + 14 * k);
      g.lineTo(cx + hr - 3 * k, hy + hr + 14 * k);
      g.quadraticCurveTo(cx + hr - 1 * k, hy, cx + hr * 0.55, top + 5 * k);
      g.quadraticCurveTo(cx, top + 1 * k, cx - hr * 0.55, top + 5 * k);
      g.quadraticCurveTo(cx - hr + 1 * k, hy, cx - hr + 3 * k, hy + hr + 14 * k);
      g.closePath();
      if (dir === 'up') {
        g.moveTo(cx - hr - 4 * k, hy + hr + 14 * k);
        g.arc(cx, hy - 1 * k, hr + 3 * k, Math.PI * 0.9, Math.PI * 2.1);
      }
      g.fill('nonzero');
      g.strokeStyle = look.hatStyle === 'rebozo' ? shade(h, 0.3) : look.stripe;
      g.lineWidth = 1.8 * k;
      g.beginPath();
      g.moveTo(cx - hr * 0.55, top + 5 * k);
      g.quadraticCurveTo(cx, top + 1 * k, cx + hr * 0.55, top + 5 * k);
      g.stroke();
      break;
    }
    case 'kofia': {
      // The Swahili kofia: a flat-topped cylinder, white, finely embroidered.
      const top = hy - hr - 1 * k;
      rr(g, cx - hr + 2 * k + side * 2 * k, top, (hr - 2 * k) * 2, 13 * k, 3 * k, h);
      rr(g, cx - hr + 2 * k + side * 2 * k, top, (hr - 2 * k) * 2, 3 * k, 1.5 * k, hl);
      g.save();
      g.globalAlpha = 0.75;
      for (let x = -hr + 6 * k; x <= hr - 6 * k; x += 5 * k) {
        dot(g, cx + x + side * 2 * k, top + 6 * k, 1.1 * k, look.stripe);
        dot(g, cx + x + 2.5 * k + side * 2 * k, top + 9.5 * k, 1.1 * k, look.stripe);
      }
      g.restore();
      break;
    }
    case 'kufi': {
      // A close crocheted skullcap on the crown.
      g.fillStyle = h;
      g.beginPath();
      g.arc(cx + side * 2 * k, hy - 5 * k, hr - 1 * k, Math.PI * 1.08, Math.PI * 1.92);
      g.closePath();
      g.fill();
      g.save();
      g.globalAlpha = 0.35;
      for (const dx of [-9, -3, 3, 9]) dot(g, cx + dx * k + side * 2 * k, hy - hr + 6 * k, 1.2 * k, hd);
      g.restore();
      break;
    }
    case 'turban': {
      // A Sikh dastar: tall, smooth, folds sweeping up to a peak at the front.
      const top = hy - hr - 9 * k;
      g.fillStyle = h;
      g.beginPath();
      g.moveTo(cx - hr - 1 * k, hy - 2 * k);
      g.quadraticCurveTo(cx - hr - 2 * k, top + 2 * k, cx - 4 * k, top);
      g.lineTo(cx + side * 3 * k, top - 2 * k);
      g.lineTo(cx + 4 * k, top);
      g.quadraticCurveTo(cx + hr + 2 * k, top + 2 * k, cx + hr + 1 * k, hy - 2 * k);
      g.quadraticCurveTo(cx, hy - 10 * k, cx - hr - 1 * k, hy - 2 * k);
      g.closePath();
      g.fill();
      g.strokeStyle = hd;
      g.lineWidth = 1.6 * k;
      for (const t of [0.35, 0.6]) {
        g.beginPath();
        g.moveTo(cx - hr * (1 - t * 0.4), hy - 4 * k - t * 10 * k);
        g.quadraticCurveTo(cx, hy - 12 * k - t * 8 * k, cx + hr * (1 - t * 0.4), hy - 4 * k - t * 10 * k);
        g.stroke();
      }
      if (dir === 'down') {
        g.strokeStyle = hl;
        g.beginPath();
        g.moveTo(cx - 9 * k, hy - 7 * k);
        g.lineTo(cx, top - 1 * k);
        g.lineTo(cx + 9 * k, hy - 7 * k);
        g.stroke();
      }
      break;
    }
    case 'visor': {
      // A market ajumma's sun visor: a band, and a wide bill.
      line(g, [cx - hr + 1 * k, hy - 8 * k, cx + hr - 1 * k, hy - 8 * k], h, 4 * k);
      if (dir === 'down') {
        g.fillStyle = h;
        g.beginPath();
        g.ellipse(cx, hy - 7 * k, hr + 3 * k, 7 * k, 0, 0, Math.PI);
        g.fill();
        g.fillStyle = hl;
        g.beginPath();
        g.ellipse(cx, hy - 7 * k, hr + 3 * k, 2.5 * k, 0, 0, Math.PI);
        g.fill();
      } else if (dir === 'left') {
        g.fillStyle = h;
        g.beginPath();
        g.ellipse(cx - hr + 2 * k, hy - 7 * k, 12 * k, 3.5 * k, -0.15, 0, Math.PI * 2);
        g.fill();
      }
      break;
    }
    case 'peaked':
    case 'coppola': {
      const peaked = look.hatStyle === 'peaked';
      const crownY = hy - hr + (peaked ? 3 : 6) * k;
      // Crown.
      g.fillStyle = h;
      g.beginPath();
      if (peaked) g.ellipse(cx + side * 2 * k, crownY, hr + 4 * k, 9 * k, 0, 0, Math.PI * 2);
      else g.ellipse(cx + side * 3 * k, crownY, hr + 2 * k, 8 * k, side * 0.12, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = hl;
      g.beginPath();
      g.ellipse(cx + side * 2 * k, crownY - 3 * k, (hr + 1 * k) * 0.8, 4 * k, 0, 0, Math.PI * 2);
      g.fill();
      if (peaked) rr(g, cx - hr + 3 * k, crownY + 4 * k, (hr - 3 * k) * 2, 5 * k, 2 * k, hd);
      // Bill.
      if (dir === 'down') {
        g.fillStyle = peaked ? '#241a12' : hd;
        g.beginPath();
        g.ellipse(cx, crownY + 8 * k, hr * 0.7, 4 * k, 0, 0, Math.PI);
        g.fill();
        if (peaked) dot(g, cx, crownY + 2 * k, 2.4 * k, look.stripe);
      } else if (dir === 'left') {
        g.fillStyle = peaked ? '#241a12' : hd;
        g.beginPath();
        g.ellipse(cx - hr + 1 * k, crownY + 6 * k, 9 * k, 3 * k, -0.1, 0, Math.PI * 2);
        g.fill();
      }
      break;
    }
    case 'straw':
    case 'sombrero': {
      const big = look.hatStyle === 'sombrero';
      const brimR = hr + (big ? 15 : 11) * k;
      const by = hy - hr + 8 * k;
      oval(g, cx, by, brimR, (big ? 8 : 7) * k, h);
      oval(g, cx, by - 1.5 * k, brimR - 2 * k, (big ? 6 : 5) * k, hl);
      g.fillStyle = h;
      g.beginPath();
      g.ellipse(cx, by - 5 * k, hr * 0.62, (big ? 12 : 9) * k, 0, Math.PI, Math.PI * 2);
      g.lineTo(cx + hr * 0.62, by);
      g.lineTo(cx - hr * 0.62, by);
      g.closePath();
      g.fill();
      rr(g, cx - hr * 0.62, by - 4 * k, hr * 1.24, 3.4 * k, 1.5 * k, look.stripe);
      g.save();
      g.globalAlpha = 0.25;
      g.strokeStyle = hd;
      g.lineWidth = 1 * k;
      for (const r of [0.55, 0.8]) {
        g.beginPath();
        g.ellipse(cx, by, brimR * r + 3 * k, 5 * k * r + 2 * k, 0, 0, Math.PI * 2);
        g.stroke();
      }
      g.restore();
      break;
    }
    case 'headband': {
      // A twisted towel round the brow, tied at the side: hachimaki.
      line(g, [cx - hr + 0.5 * k, hy - 7 * k, cx + hr - 0.5 * k, hy - 7 * k], h, 5 * k);
      g.save();
      g.globalAlpha = 0.5;
      for (let x = -hr + 5 * k; x < hr - 3 * k; x += 6 * k) line(g, [cx + x, hy - 9 * k, cx + x + 3 * k, hy - 5 * k], hd, 1.2 * k);
      g.restore();
      if (dir !== 'down') {
        const kx = dir === 'left' ? cx + hr - 3 * k : cx;
        dot(g, kx, hy - 7 * k, 3.5 * k, h);
        line(g, [kx, hy - 7 * k, kx + 6 * k, hy - 1 * k], h, 2.5 * k);
      } else {
        dot(g, cx + hr - 3 * k, hy - 8 * k, 3 * k, h);
      }
      break;
    }
    case 'kerchief': {
      // A cotton square tied at the nape: hair covered, face and ears clear.
      g.fillStyle = h;
      g.beginPath();
      g.moveTo(cx - hr - 0.5 * k, hy - 1 * k);
      g.arc(cx, hy - 2 * k, hr + 1 * k, Math.PI, Math.PI * 2);
      g.quadraticCurveTo(cx + hr * 0.4, hy - hr * 0.55, cx - hr - 0.5 * k, hy - 1 * k);
      g.closePath();
      if (dir === 'up') {
        g.moveTo(cx - hr, hy);
        g.arc(cx, hy - 2 * k, hr + 1 * k, Math.PI, Math.PI * 2);
        g.lineTo(cx + hr, hy + 2 * k);
        g.lineTo(cx, hy + 12 * k);
        g.lineTo(cx - hr, hy + 2 * k);
      }
      g.fill();
      if (dir !== 'down') {
        const kx = dir === 'left' ? cx + hr - 4 * k : cx;
        dot(g, kx, hy + 4 * k, 3 * k, hd);
      }
      g.save();
      g.globalAlpha = 0.5;
      for (const dx of [-10, 0, 10]) dot(g, cx + dx * k, hy - hr + 6 * k, 1.4 * k, look.stripe);
      g.restore();
      break;
    }
    case 'beanie': {
      g.fillStyle = h;
      g.beginPath();
      g.arc(cx, hy - 4 * k, hr - 0.5 * k, Math.PI, Math.PI * 2);
      g.closePath();
      g.fill();
      rr(g, cx - hr + 0.5 * k, hy - 8 * k, (hr - 0.5 * k) * 2, 6 * k, 3 * k, hd);
      g.save();
      g.globalAlpha = 0.3;
      for (let x = -hr + 4 * k; x < hr - 2 * k; x += 4 * k) line(g, [cx + x, hy - 7 * k, cx + x, hy - 3 * k], shade(h, -0.4), 1 * k);
      g.restore();
      break;
    }
  }
}

/** True for headwear that hides the hair entirely (no hair cap, no braids). */
export function coversHair(look: Look): boolean {
  return ['headscarf', 'kanga', 'turban', 'kerchief', 'beanie'].includes(look.hatStyle);
}

/** A bun at the crown or nape, drawn before the head so it peeks out. */
export function drawBun(g: CanvasRenderingContext2D, look: Look, dir: Dir, cx: number, hy: number, hr: number) {
  if (look.hairdo !== 'bun' || coversHair(look)) return;
  const k = hr / 21;
  if (dir === 'left') dot(g, cx + hr * 0.75, hy - hr * 0.55, 7.5 * k, look.hair);
  else if (dir === 'up') dot(g, cx, hy - hr * 0.35, 8.5 * k, shade(look.hair, 0.08));
  else dot(g, cx, hy - hr - 1 * k, 7 * k, look.hair);
}

/** Beard, moustache, spectacles: the details a face is known by. */
export function drawFaceDetail(
  g: CanvasRenderingContext2D,
  look: Look,
  dir: Dir,
  cx: number,
  hy: number,
  hr: number,
  eyeY: number,
  eyeDx: number,
) {
  if (dir === 'up') return;
  const k = hr / 21;
  const fx = dir === 'left' ? cx - 6 * k : cx;
  if (look.beard === 'full') {
    g.fillStyle = look.hair;
    g.beginPath();
    g.moveTo(fx - hr * 0.86, hy + 1 * k);
    g.quadraticCurveTo(fx - hr * 0.8, hy + hr + 8 * k, fx, hy + hr + 9 * k);
    g.quadraticCurveTo(fx + hr * 0.8, hy + hr + 8 * k, fx + hr * 0.86, hy + 1 * k);
    g.quadraticCurveTo(fx + hr * 0.5, hy + 12 * k, fx, hy + 11 * k);
    g.quadraticCurveTo(fx - hr * 0.5, hy + 12 * k, fx - hr * 0.86, hy + 1 * k);
    g.fill();
    g.strokeStyle = shade(look.hair, 0.18);
    g.lineWidth = 1.4 * k;
    g.beginPath();
    g.arc(fx, hy + hr * 0.75, hr * 0.45, Math.PI * 0.25, Math.PI * 0.75);
    g.stroke();
  }
  if (look.beard === 'full' || look.beard === 'moustache') {
    oval(g, fx - 4.2 * k, hy + 8.5 * k, 4.6 * k, 2.2 * k, look.hair);
    oval(g, fx + 4.2 * k, hy + 8.5 * k, 4.6 * k, 2.2 * k, look.hair);
  }
  if (look.glasses) {
    g.strokeStyle = '#3a2e24';
    g.lineWidth = 1.6 * k;
    const r = 5.6 * k;
    const xs = dir === 'left' ? [cx - eyeDx - 1 * k] : [cx - eyeDx, cx + eyeDx];
    for (const ex of xs) {
      g.beginPath();
      g.arc(ex, eyeY, r, 0, Math.PI * 2);
      g.stroke();
    }
    if (dir !== 'left') {
      g.beginPath();
      g.moveTo(cx - eyeDx + r, eyeY);
      g.lineTo(cx + eyeDx - r, eyeY);
      g.stroke();
    }
  }
}

/**
 * The garment's neckline and drape on the dialogue portrait's shoulders. The
 * shoulders themselves are already painted in the cloth colour.
 */
export function drawPortraitGarb(g: CanvasRenderingContext2D, look: Look, P: number) {
  const cx = P / 2;
  const top = P * 0.7;
  const c = look.cloth;
  const s = look.stripe;
  const v = (w: number, d: number, col: string) => {
    g.fillStyle = col;
    g.beginPath();
    g.moveTo(cx - w, top);
    g.lineTo(cx, top + d);
    g.lineTo(cx + w, top);
    g.closePath();
    g.fill();
  };
  switch (look.garb) {
    case 'shirt':
      v(16, 20, shade(c, 0.22));
      v(8, 12, shade(look.skin, -0.1));
      break;
    case 'sweater':
      rr(g, cx - 18, top - 2, 36, 8, 4, shade(c, -0.14));
      break;
    case 'kurta':
      line(g, [cx, top, cx, P], shade(c, -0.2), 4);
      for (const y of [top + 10, top + 22, top + 34]) dot(g, cx, y, 2.4, s);
      break;
    case 'kanzu':
      g.strokeStyle = s;
      g.lineWidth = 3.4;
      g.beginPath();
      g.arc(cx, top - 4, 14, Math.PI * 0.15, Math.PI * 0.85);
      g.stroke();
      line(g, [cx, top + 10, cx, P], s, 3);
      break;
    case 'cassock':
      rr(g, cx - 6, top - 2, 12, 8, 3, '#f2ece0');
      break;
    case 'coveralls':
      v(18, 16, shade(c, 0.18));
      line(g, [cx, top + 12, cx, P], shade(c, -0.3), 2.6);
      break;
    case 'jacket':
      v(14, 32, '#f2ece0');
      g.fillStyle = shade(c, -0.22);
      g.beginPath();
      g.moveTo(cx - 16, top);
      g.lineTo(cx - 4, top + 34);
      g.lineTo(cx - 24, top + 14);
      g.closePath();
      g.moveTo(cx + 16, top);
      g.lineTo(cx + 4, top + 34);
      g.lineTo(cx + 24, top + 14);
      g.closePath();
      g.fill();
      break;
    case 'wrap':
      line(g, [cx - 18, top - 2, cx + 26, P], s, 8);
      line(g, [cx + 18, top - 2, cx + 6, top + 20], shade(s, -0.15), 6);
      break;
    case 'huipil':
      g.strokeStyle = s;
      g.lineWidth = 6;
      g.strokeRect(cx - 18, top - 4, 36, 30);
      for (const [x, y] of [[-30, 20], [30, 20], [0, 36]] as const) dot(g, cx + x, top + y, 3.6, look.apron ?? shade(s, 0.3));
      break;
    case 'saree':
      g.fillStyle = shade(look.skirt ?? c, 0.04);
      g.beginPath();
      g.moveTo(cx + 20, top - 4);
      g.lineTo(cx + 40, top + 2);
      g.lineTo(cx - 20, P);
      g.lineTo(cx - 44, P);
      g.closePath();
      g.fill();
      line(g, [cx + 20, top - 4, cx - 44, P], s, 4);
      break;
    case 'salwar':
      if (look.hatStyle !== 'dupatta') {
        g.strokeStyle = look.shawl ?? s;
        g.lineWidth = 12;
        g.beginPath();
        g.moveTo(cx - 40, top + 2);
        g.quadraticCurveTo(cx, top + 40, cx + 40, top + 2);
        g.stroke();
      }
      break;
    case 'kanga':
      g.strokeStyle = s;
      g.lineWidth = 3.4;
      g.beginPath();
      g.arc(cx, P - 6, 14, Math.PI, Math.PI * 2);
      g.stroke();
      break;
    case 'dress':
      dot(g, cx, top + 6, 4.4, shade(c, 0.25));
      break;
    case 'mundu':
      if (!look.shawl) v(14, 16, shade(c, 0.2));
      break;
  }
  if (look.apron && look.garb !== 'huipil') {
    rr(g, cx - 22, top + 16, 44, P - top, 6, look.apron);
    line(g, [cx - 18, top + 18, cx - 14, top], shade(look.apron, -0.15), 3);
    line(g, [cx + 18, top + 18, cx + 14, top], shade(look.apron, -0.15), 3);
  }
  if (look.shawl && look.garb !== 'salwar') {
    g.fillStyle = look.shawl;
    if (look.garb === 'mundu') {
      g.beginPath();
      g.moveTo(cx - 52, top + 8);
      g.lineTo(cx - 28, top - 2);
      g.lineTo(cx + 34, P);
      g.lineTo(cx + 6, P);
      g.closePath();
      g.fill();
      line(g, [cx - 28, top - 2, cx + 34, P], s, 3);
    } else {
      g.beginPath();
      g.moveTo(cx - 62, P);
      g.quadraticCurveTo(cx - 58, top + 2, cx - 30, top - 2);
      g.lineTo(cx, top + 34);
      g.lineTo(cx + 30, top - 2);
      g.quadraticCurveTo(cx + 58, top + 2, cx + 62, P);
      g.lineTo(cx + 24, P);
      g.lineTo(cx, top + 44);
      g.lineTo(cx - 24, P);
      g.closePath();
      g.fill();
    }
  }
  if (look.prop === 'towel') {
    rr(g, cx - 54, top - 4, 22, P - top + 4, 5, '#f2efe6');
    line(g, [cx - 54, top + 30, cx - 32, top + 30], '#c1512f', 3);
  }
  if (look.prop === 'jar') {
    rr(g, cx + 26, P - 46, 30, 40, 8, 'rgba(214,232,238,0.85)');
    rr(g, cx + 29, P - 30, 24, 22, 6, '#efe4c8');
    dot(g, cx + 36, P - 22, 2.4, 'rgba(255,255,255,0.8)');
    rr(g, cx + 23, P - 52, 36, 10, 4, '#c9a35f');
    rr(g, cx + 30, P - 40, 5, 28, 2.5, 'rgba(255,255,255,0.45)');
  }
  if (look.prop === 'camera') {
    rr(g, cx - 14, P - 26, 28, 18, 4, '#2b2b33');
    dot(g, cx, P - 17, 6, '#6a7a8a');
  }
}

export { line as strokeLine };
