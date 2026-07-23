import { ART, PAL } from '../engine/config';
import { dot, oval, rr, shade, surface, vgrad } from './pix';

/**
 * Character rig, smooth-art era. Logical size stays 20x32 (2 tiles tall);
 * every cell is authored at 4x (80x128) with rounded vector shapes: big soft
 * heads, capsule limbs, gradient cloth, real curves. No outlines; separation
 * comes from value contrast and the contact shadow the renderer draws.
 */

export const CHAR_W = 20;
export const CHAR_H = 32;
/** Sheet columns: 0-5 = six-frame walk (0 doubles as idle), 6 = blink. */
export const CHAR_COLS = 7;

export const DIR_ROW = { down: 0, up: 1, left: 2, right: 3 } as const;

const AW = CHAR_W * ART; // 80
const AH = CHAR_H * ART; // 128

export type Look = {
  skin: string;
  hair: string;
  /** Poncho for the men, lliclla shawl over a pollera for the women. */
  cloth: string;
  stripe: string;
  hat: string;
  /** 'chullu' is the earflap cap, 'montera' the flat fringed hat, 'none' bare hair. */
  hatStyle: 'chullu' | 'montera' | 'none';
  skirt?: string;
  /** Children: same rig, squashed rounder and anchored at the feet. */
  kid?: boolean;
};

export const PLAYER_LOOK: Look = {
  skin: '#d8a06c',
  hair: '#3a2a1c',
  cloth: PAL.terracotta,
  stripe: PAL.cream,
  hat: PAL.gold,
  hatStyle: 'chullu',
};

export function makeSheet(look: Look): HTMLCanvasElement {
  const { cv, g } = surface(AW * CHAR_COLS, AH * 4);
  for (const dir of ['down', 'up', 'left', 'right'] as const) {
    for (let frame = 0; frame < CHAR_COLS; frame++) {
      g.save();
      g.translate(frame * AW, DIR_ROW[dir] * AH);
      g.beginPath();
      g.rect(0, 0, AW, AH);
      g.clip();
      if (dir === 'right') {
        g.translate(AW, 0);
        g.scale(-1, 1);
        drawPose(g, look, 'left', frame);
      } else {
        drawPose(g, look, dir, frame);
      }
      g.restore();
    }
  }
  return cv;
}

/**
 * One pose. Walk beats (0-5): contact, down, pass / contact, down, pass with
 * alternating legs; frame 6 is a blink. All coordinates in the 80x128 cell,
 * feet on the baseline at y=124.
 */
function drawPose(g: CanvasRenderingContext2D, look: Look, dir: 'down' | 'up' | 'left', frame: number) {
  if (look.kid) {
    // Children are the same person, rounder and closer to the ground.
    g.translate(AW / 2, 126);
    g.scale(0.8, 0.68);
    g.translate(-AW / 2, -126);
  }
  const blink = frame === 6;
  const f = blink ? 0 : frame;
  const BOB = [0, -3, 0, 0, -3, 0] as const;
  const bob = BOB[f] ?? 0;
  const SWING = [1, 0, -1, -1, 0, 1] as const;
  const swing = SWING[f] ?? 0;

  const cx = AW / 2;
  const clothDark = shade(look.cloth, -0.2);
  const clothLight = shade(look.cloth, 0.14);
  const skinShade = shade(look.skin, -0.14);
  const hairShine = shade(look.hair, 0.2);
  const leg = shade(look.skin, -0.3);
  const shoe = '#463227';

  // ---- legs: capsules that stride ----
  const legY = 100;
  const drawLeg = (lx: number, lift: number, fwd: number) => {
    g.strokeStyle = leg;
    g.lineWidth = 9;
    g.lineCap = 'round';
    g.beginPath();
    g.moveTo(lx, legY);
    g.lineTo(lx + fwd, 120 - lift);
    g.stroke();
    // Shoe.
    g.strokeStyle = shoe;
    g.lineWidth = 8;
    g.beginPath();
    g.moveTo(lx + fwd, 121 - lift);
    g.lineTo(lx + fwd + 1.5, 121 - lift);
    g.stroke();
  };
  if (dir === 'left') {
    drawLeg(cx + 2, swing < 0 ? 5 : 0, swing * 6);
    drawLeg(cx - 4, swing > 0 ? 5 : 0, -swing * 6);
  } else {
    drawLeg(cx - 8, swing < 0 ? 5 : 0, swing * 3);
    drawLeg(cx + 8, swing > 0 ? 5 : 0, -swing * 3);
  }

  // ---- body ----
  const bodyTop = 58 + bob;
  if (look.skirt) {
    const skirtLight = shade(look.skirt, 0.12);
    // Pollera: a full bell with a golón band.
    g.beginPath();
    g.moveTo(cx - 14, bodyTop + 12);
    g.quadraticCurveTo(cx - 26, 100 + bob, cx - 24, 106 + bob);
    g.lineTo(cx + 24, 106 + bob);
    g.quadraticCurveTo(cx + 26, 100 + bob, cx + 14, bodyTop + 12);
    g.closePath();
    const grad = g.createLinearGradient(0, bodyTop, 0, 108 + bob);
    grad.addColorStop(0, skirtLight);
    grad.addColorStop(1, shade(look.skirt, -0.12));
    g.fillStyle = grad;
    g.fill();
    rr(g, cx - 24, 98 + bob, 48, 5, 2.5, look.stripe); // golón
    if (swing !== 0) {
      oval(g, cx + swing * 20, 102 + bob, 5, 4, look.skirt); // swish
    }
    // Lliclla over the shoulders.
    rr(g, cx - 17, bodyTop, 34, 18, 8, look.cloth);
    vgrad(g, cx - 17, bodyTop, 34, 8, 'rgba(255,245,225,0.25)', 'rgba(0,0,0,0)');
    rr(g, cx - 17, bodyTop + 11, 34, 4, 2, look.stripe);
    if (dir === 'down') dot(g, cx, bodyTop + 7, 2.6, '#e8dcc4'); // tupu
  } else {
    // Poncho: soft trapezoid drape with woven bands and a fringe.
    g.beginPath();
    g.moveTo(cx - 13, bodyTop);
    g.lineTo(cx + 13, bodyTop);
    g.quadraticCurveTo(cx + 22, 84 + bob, cx + 21, 100 + bob);
    g.lineTo(cx - 21, 100 + bob);
    g.quadraticCurveTo(cx - 22, 84 + bob, cx - 13, bodyTop);
    g.closePath();
    const grad = g.createLinearGradient(0, bodyTop, 0, 102 + bob);
    grad.addColorStop(0, clothLight);
    grad.addColorStop(1, clothDark);
    g.fillStyle = grad;
    g.fill();
    rr(g, cx - 20, 88 + bob, 40, 4.5, 2, look.stripe);
    rr(g, cx - 17, 72 + bob, 34, 4, 2, look.stripe);
    // Fringe.
    g.strokeStyle = clothDark;
    g.lineWidth = 2.4;
    for (let x = -18; x <= 18; x += 5) {
      g.beginPath();
      g.moveTo(cx + x, 100 + bob);
      g.lineTo(cx + x + swing * 1.5, 105 + bob);
      g.stroke();
    }
    // Collar V.
    if (dir === 'down') {
      g.strokeStyle = clothDark;
      g.lineWidth = 3;
      g.beginPath();
      g.moveTo(cx - 6, bodyTop + 2);
      g.lineTo(cx, bodyTop + 9);
      g.lineTo(cx + 6, bodyTop + 2);
      g.stroke();
    }
  }
  if (dir === 'left') {
    g.save();
    g.globalAlpha = 0.16;
    g.fillStyle = '#241a12';
    g.fillRect(cx + 8, bodyTop + 4, 12, 40);
    g.restore();
  }

  // ---- arms: capsules that swing against the legs ----
  const armY = bodyTop + 6;
  const drawArm = (ax: number, rot: number, tone: string) => {
    g.save();
    g.translate(ax, armY);
    g.rotate(rot);
    g.strokeStyle = tone;
    g.lineWidth = 8;
    g.lineCap = 'round';
    g.beginPath();
    g.moveTo(0, 2);
    g.lineTo(0, 26);
    g.stroke();
    dot(g, 0, 28, 4.4, skinShade); // hand
    g.restore();
  };
  if (dir === 'left') {
    drawArm(cx - 2, swing * 0.5, clothDark);
  } else {
    drawArm(cx - 19, -swing * 0.4, dir === 'up' ? clothDark : shade(look.cloth, -0.08));
    drawArm(cx + 19, swing * 0.4, dir === 'up' ? clothDark : shade(look.cloth, -0.08));
  }

  // ---- head: the big soft heart of the rig ----
  const hy = 36 + bob; // head center
  const hr = 21;
  if (dir === 'up') {
    dot(g, cx, hy, hr, look.hair);
    g.beginPath();
    g.arc(cx, hy - 4, hr * 0.72, Math.PI * 1.15, Math.PI * 1.85);
    g.strokeStyle = hairShine;
    g.lineWidth = 4;
    g.stroke();
  } else {
    // Face.
    const grad = g.createRadialGradient(cx - 6, hy - 6, 4, cx, hy, hr + 2);
    grad.addColorStop(0, shade(look.skin, 0.08));
    grad.addColorStop(1, skinShade);
    g.fillStyle = grad;
    g.beginPath();
    g.arc(cx, hy, hr, 0, Math.PI * 2);
    g.fill();
    // Hair cap over the crown.
    g.fillStyle = look.hair;
    g.beginPath();
    g.arc(cx, hy - 1, hr, Math.PI * 1.02, Math.PI * 1.98);
    g.quadraticCurveTo(cx + hr * 0.6, hy - hr * 0.55, cx + hr * 0.98, hy - 3);
    g.closePath();
    g.fill();
    g.strokeStyle = hairShine;
    g.lineWidth = 3.4;
    g.beginPath();
    g.arc(cx - 2, hy - 3, hr * 0.7, Math.PI * 1.2, Math.PI * 1.6);
    g.stroke();

    const eyeY = hy + 3;
    if (dir === 'down') {
      if (blink) {
        g.strokeStyle = shade(look.skin, -0.35);
        g.lineWidth = 2.6;
        for (const ex of [cx - 8, cx + 8]) {
          g.beginPath();
          g.arc(ex, eyeY, 3.4, Math.PI * 0.15, Math.PI * 0.85);
          g.stroke();
        }
      } else {
        for (const ex of [cx - 8, cx + 8]) {
          oval(g, ex, eyeY, 3.2, 4.4, '#241a12');
          dot(g, ex - 1.1, eyeY - 1.6, 1.3, '#ffffff');
        }
        // Brows.
        g.strokeStyle = shade(look.hair, -0.05);
        g.lineWidth = 2.2;
        for (const ex of [cx - 8, cx + 8]) {
          g.beginPath();
          g.arc(ex, eyeY - 7, 4, Math.PI * 1.15, Math.PI * 1.85);
          g.stroke();
        }
      }
      // Blush.
      g.save();
      g.globalAlpha = 0.45;
      dot(g, cx - 13.5, hy + 8, 3.6, '#e88c6a');
      dot(g, cx + 13.5, hy + 8, 3.6, '#e88c6a');
      g.restore();
      // Smile.
      g.strokeStyle = '#8a4a34';
      g.lineWidth = 2.4;
      g.beginPath();
      g.arc(cx, hy + 9, 4.6, Math.PI * 0.15, Math.PI * 0.85);
      g.stroke();
    } else {
      // Profile: one eye, nose bump, hair mass behind.
      g.fillStyle = look.hair;
      g.beginPath();
      g.arc(cx + 6, hy, hr * 0.92, Math.PI * 1.5, Math.PI * 0.5);
      g.fill();
      if (blink) {
        g.strokeStyle = shade(look.skin, -0.35);
        g.lineWidth = 2.6;
        g.beginPath();
        g.arc(cx - 9, eyeY, 3.2, Math.PI * 0.15, Math.PI * 0.85);
        g.stroke();
      } else {
        oval(g, cx - 9, eyeY, 3, 4.2, '#241a12');
        dot(g, cx - 10, eyeY - 1.5, 1.2, '#ffffff');
      }
      g.save();
      g.globalAlpha = 0.45;
      dot(g, cx - 14, hy + 8, 3.4, '#e88c6a');
      g.restore();
      dot(g, cx - hr + 1.5, hy + 4, 2.6, look.skin); // nose
    }
  }
  // Braids for the women without a chullu.
  if (look.skirt && look.hatStyle !== 'chullu') {
    for (const bx of [cx - hr + 2, cx + hr - 2]) {
      g.strokeStyle = look.hair;
      g.lineWidth = 5;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(bx, hy + 8);
      g.quadraticCurveTo(bx + (bx < cx ? -2 : 2), hy + 24, bx + (bx < cx ? -1 : 1), hy + 34);
      g.stroke();
      dot(g, bx + (bx < cx ? -1 : 1), hy + 36, 2.4, look.stripe);
    }
  }

  // ---- hats ----
  const hatDark = shade(look.hat, -0.22);
  const hatLight = shade(look.hat, 0.16);
  if (look.hatStyle === 'chullu') {
    // Rounded knit cap.
    g.fillStyle = look.hat;
    g.beginPath();
    g.arc(cx, hy - 4, hr - 0.5, Math.PI * 1.0, Math.PI * 2.0);
    g.quadraticCurveTo(cx + hr, hy - 8, cx + hr - 2, hy - 4);
    g.closePath();
    g.fill();
    g.strokeStyle = hatLight;
    g.lineWidth = 3;
    g.beginPath();
    g.arc(cx - 3, hy - 8, hr * 0.62, Math.PI * 1.2, Math.PI * 1.65);
    g.stroke();
    // Band with pattern dots.
    g.strokeStyle = hatDark;
    g.lineWidth = 5;
    g.beginPath();
    g.arc(cx, hy - 4, hr - 2, Math.PI * 1.06, Math.PI * 1.94);
    g.stroke();
    for (const dx2 of [-10, 0, 10]) dot(g, cx + dx2, hy - hr + 6.5, 1.6, look.stripe);
    // Tassel.
    dot(g, cx, hy - hr - 4, 3.4, hatDark);
    g.strokeStyle = hatDark;
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(cx, hy - hr - 1);
    g.lineTo(cx, hy - hr + 2);
    g.stroke();
    // Earflaps with ties.
    for (const fx of [cx - hr + 3, cx + hr - 3]) {
      g.fillStyle = look.hat;
      g.beginPath();
      g.moveTo(fx - 4.5, hy + 2);
      g.quadraticCurveTo(fx, hy + 15, fx, hy + 16);
      g.quadraticCurveTo(fx + 1, hy + 15, fx + 4.5, hy + 2);
      g.closePath();
      g.fill();
      g.strokeStyle = look.stripe;
      g.lineWidth = 1.8;
      g.beginPath();
      g.moveTo(fx, hy + 16);
      g.lineTo(fx, hy + 21);
      g.stroke();
    }
  } else if (look.hatStyle === 'montera') {
    oval(g, cx, hy - hr + 6, hr + 6, 6.5, look.hat);
    oval(g, cx, hy - hr + 4, hr + 6, 5.5, hatLight);
    oval(g, cx, hy - hr + 1, hr * 0.62, 6, look.hat);
    // Sanq'apa beads along the brim.
    for (const dx2 of [-hr, -hr / 2, 0, hr / 2, hr]) {
      dot(g, cx + dx2 * 0.9, hy - hr + 10.5, 1.5, look.stripe);
    }
  }
}

/** A 40x40-logical (160px) painted bust for the dialogue box. */
export const PORTRAIT = 40;

export function makePortrait(look: Look): HTMLCanvasElement {
  const P = PORTRAIT * ART; // 160
  const { cv, g } = surface(P, P);
  const cx = P / 2;
  const skinShade = shade(look.skin, -0.14);
  const hairShine = shade(look.hair, 0.2);

  // Shoulders.
  const grad = g.createLinearGradient(0, P * 0.68, 0, P);
  grad.addColorStop(0, shade(look.cloth, 0.12));
  grad.addColorStop(1, shade(look.cloth, -0.16));
  g.fillStyle = grad;
  g.beginPath();
  g.moveTo(cx - 62, P);
  g.quadraticCurveTo(cx - 58, P * 0.72, cx - 30, P * 0.7);
  g.lineTo(cx + 30, P * 0.7);
  g.quadraticCurveTo(cx + 58, P * 0.72, cx + 62, P);
  g.closePath();
  g.fill();
  rr(g, cx - 54, P * 0.84, 108, 8, 4, look.stripe);

  // Head.
  const hy = P * 0.42;
  const hr = 44;
  const fgrad = g.createRadialGradient(cx - 12, hy - 12, 8, cx, hy, hr + 4);
  fgrad.addColorStop(0, shade(look.skin, 0.08));
  fgrad.addColorStop(1, skinShade);
  g.fillStyle = fgrad;
  g.beginPath();
  g.arc(cx, hy, hr, 0, Math.PI * 2);
  g.fill();
  // Hair.
  g.fillStyle = look.hair;
  g.beginPath();
  g.arc(cx, hy - 2, hr, Math.PI * 1.02, Math.PI * 1.98);
  g.quadraticCurveTo(cx + hr * 0.7, hy - hr * 0.5, cx + hr * 0.98, hy - 4);
  g.closePath();
  g.fill();
  g.strokeStyle = hairShine;
  g.lineWidth = 6;
  g.beginPath();
  g.arc(cx - 4, hy - 6, hr * 0.68, Math.PI * 1.2, Math.PI * 1.6);
  g.stroke();
  // Ears.
  dot(g, cx - hr + 2, hy + 8, 7, look.skin);
  dot(g, cx + hr - 2, hy + 8, 7, look.skin);

  // Eyes, brows, blush, smile.
  const eyeY = hy + 8;
  for (const ex of [cx - 17, cx + 17]) {
    oval(g, ex, eyeY, 6.4, 8.8, '#241a12');
    dot(g, ex - 2.2, eyeY - 3, 2.6, '#ffffff');
  }
  g.strokeStyle = shade(look.hair, -0.05);
  g.lineWidth = 4.4;
  for (const ex of [cx - 17, cx + 17]) {
    g.beginPath();
    g.arc(ex, eyeY - 14, 8, Math.PI * 1.15, Math.PI * 1.85);
    g.stroke();
  }
  g.save();
  g.globalAlpha = 0.45;
  dot(g, cx - 29, hy + 18, 7.5, '#e88c6a');
  dot(g, cx + 29, hy + 18, 7.5, '#e88c6a');
  g.restore();
  g.strokeStyle = '#8a4a34';
  g.lineWidth = 4.6;
  g.beginPath();
  g.arc(cx, hy + 20, 9, Math.PI * 0.15, Math.PI * 0.85);
  g.stroke();

  // Hat.
  const hatDark = shade(look.hat, -0.22);
  const hatLight = shade(look.hat, 0.16);
  if (look.hatStyle === 'chullu') {
    g.fillStyle = look.hat;
    g.beginPath();
    g.arc(cx, hy - 8, hr - 1, Math.PI, Math.PI * 2);
    g.closePath();
    g.fill();
    g.strokeStyle = hatDark;
    g.lineWidth = 10;
    g.beginPath();
    g.arc(cx, hy - 8, hr - 4, Math.PI * 1.05, Math.PI * 1.95);
    g.stroke();
    for (const dx2 of [-20, 0, 20]) dot(g, cx + dx2, hy - hr + 10, 3.4, look.stripe);
    dot(g, cx, hy - hr - 8, 7, hatDark);
    g.strokeStyle = hatLight;
    g.lineWidth = 5;
    g.beginPath();
    g.arc(cx - 6, hy - 16, hr * 0.6, Math.PI * 1.2, Math.PI * 1.62);
    g.stroke();
  } else if (look.hatStyle === 'montera') {
    oval(g, cx, hy - hr + 10, hr + 14, 13, look.hat);
    oval(g, cx, hy - hr + 6, hr + 14, 11, hatLight);
    oval(g, cx, hy - hr, hr * 0.6, 12, look.hat);
    for (const dx2 of [-1, -0.5, 0, 0.5, 1]) {
      dot(g, cx + dx2 * (hr + 6), hy - hr + 19, 3, look.stripe);
    }
  }
  if (look.skirt && look.hatStyle !== 'chullu') {
    for (const bx of [cx - hr + 4, cx + hr - 4]) {
      g.strokeStyle = look.hair;
      g.lineWidth = 10;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(bx, hy + 18);
      g.quadraticCurveTo(bx + (bx < cx ? -4 : 4), hy + 48, bx + (bx < cx ? -2 : 2), hy + 66);
      g.stroke();
    }
  }
  return cv;
}
