import { ART, PAL } from '../engine/config';
import { dot, outlineSheet, oval, shade, softShadow, surface } from './pix';
import { CHAR_H, CHAR_W, DIR_ROW } from './character';

/**
 * Animal sheets, smooth-art era: same cell layout as people (3 frames x 4
 * directions), rounded soft bodies, no outlines.
 */

const AW = CHAR_W * ART;
const AH = CHAR_H * ART;

function sheet(draw: (g: CanvasRenderingContext2D, dir: 'down' | 'up' | 'left', frame: number) => void): HTMLCanvasElement {
  const { cv, g } = surface(AW * 3, AH * 4);
  for (const dir of ['down', 'up', 'left', 'right'] as const) {
    for (let frame = 0; frame < 3; frame++) {
      g.save();
      g.translate(frame * AW, DIR_ROW[dir] * AH);
      g.beginPath();
      g.rect(0, 0, AW, AH);
      g.clip();
      if (dir === 'right') {
        g.translate(AW, 0);
        g.scale(-1, 1);
        draw(g, 'left', frame);
      } else {
        draw(g, dir, frame);
      }
      g.restore();
    }
  }
  // Same cut-paper edge as the people; the dog is pasted in too.
  return outlineSheet(cv, AW, AH);
}

/** The village dog: tan, optimistic, employed. */
export function makeDogSheet(): HTMLCanvasElement {
  const fur = '#cf9d5e';
  const dark = shade(fur, -0.24);
  const cx = AW / 2;
  return sheet((g, dir, frame) => {
    const hop = frame === 0 ? 0 : -3;
    const swing = frame === 1 ? 1 : frame === 2 ? -1 : 0;
    const baseY = 118;
    if (dir === 'left') {
      // Legs.
      g.strokeStyle = dark;
      g.lineWidth = 7;
      g.lineCap = 'round';
      for (const [lx, ph] of [[cx - 14, 1], [cx + 10, -1]] as const) {
        g.beginPath();
        g.moveTo(lx, baseY - 14 + hop);
        g.lineTo(lx + swing * 4 * ph, baseY);
        g.stroke();
      }
      // Body.
      oval(g, cx, baseY - 22 + hop, 22, 13, fur);
      oval(g, cx - 5, baseY - 26 + hop, 12, 7, shade(fur, 0.12));
      // Head with snout.
      dot(g, cx - 22, baseY - 32 + hop, 11, fur);
      oval(g, cx - 30, baseY - 29 + hop, 6, 4.5, shade(fur, 0.06));
      dot(g, cx - 34, baseY - 30 + hop, 2.2, '#241a12'); // nose
      dot(g, cx - 24, baseY - 35 + hop, 2.2, '#241a12'); // eye
      // Ear.
      oval(g, cx - 18, baseY - 42 + hop, 3.6, 6, dark, -0.3);
      // Tail, up and curled.
      g.strokeStyle = dark;
      g.lineWidth = 5.5;
      g.beginPath();
      g.moveTo(cx + 19, baseY - 28 + hop);
      g.quadraticCurveTo(cx + 28, baseY - 40 + hop, cx + 22, baseY - 44 + hop);
      g.stroke();
    } else {
      const back = dir === 'up';
      // Legs.
      g.strokeStyle = dark;
      g.lineWidth = 7;
      g.lineCap = 'round';
      for (const lx of [cx - 9, cx + 9]) {
        g.beginPath();
        g.moveTo(lx, baseY - 12 + hop);
        g.lineTo(lx + (lx < cx ? swing : -swing) * 2, baseY);
        g.stroke();
      }
      // Body.
      oval(g, cx, baseY - 22 + hop, 14, 12, fur);
      // Head.
      dot(g, cx, baseY - 38 + hop, 12, fur);
      // Ears.
      oval(g, cx - 9, baseY - 48 + hop, 3.6, 6.5, dark);
      oval(g, cx + 9, baseY - 48 + hop, 3.6, 6.5, dark);
      if (!back) {
        dot(g, cx - 4.5, baseY - 39 + hop, 2.2, '#241a12');
        dot(g, cx + 4.5, baseY - 39 + hop, 2.2, '#241a12');
        oval(g, cx, baseY - 33 + hop, 3, 2.4, '#241a12');
        // Tongue, sometimes.
        if (frame === 1) oval(g, cx, baseY - 29 + hop, 2.4, 3.4, '#e8846a');
      } else {
        // Tail curled over the back.
        g.strokeStyle = dark;
        g.lineWidth = 5.5;
        g.beginPath();
        g.moveTo(cx, baseY - 26 + hop);
        g.quadraticCurveTo(cx + 8, baseY - 36 + hop, cx + 2, baseY - 38 + hop);
        g.stroke();
      }
    }
  });
}

/** A llama. Wool color varies; the expression does not. */
export function makeLlamaSheet(wool: string): HTMLCanvasElement {
  const woolDark = shade(wool, -0.16);
  const woolLight = shade(wool, 0.12);
  const face = shade(wool, -0.3);
  const cx = AW / 2;
  return sheet((g, dir, frame) => {
    const hop = frame === 0 ? 0 : -3;
    const swing = frame === 1 ? 1 : frame === 2 ? -1 : 0;
    const baseY = 120;
    if (dir === 'left') {
      // Legs.
      g.strokeStyle = woolDark;
      g.lineWidth = 7;
      g.lineCap = 'round';
      for (const [lx, ph] of [[cx - 14, 1], [cx - 2, -1], [cx + 12, 1]] as const) {
        g.beginPath();
        g.moveTo(lx, baseY - 20 + hop);
        g.lineTo(lx + swing * 3 * ph, baseY);
        g.stroke();
      }
      // Wooly body.
      oval(g, cx, baseY - 30 + hop, 24, 14, wool);
      oval(g, cx - 4, baseY - 35 + hop, 14, 8, woolLight);
      // Neck, forward and up.
      g.strokeStyle = wool;
      g.lineWidth = 13;
      g.beginPath();
      g.moveTo(cx - 16, baseY - 34 + hop);
      g.quadraticCurveTo(cx - 24, baseY - 60 + hop, cx - 24, baseY - 74 + hop);
      g.stroke();
      // Head.
      oval(g, cx - 25, baseY - 80 + hop, 9, 7.5, wool);
      oval(g, cx - 32, baseY - 79 + hop, 4.5, 3.6, face); // muzzle
      dot(g, cx - 25, baseY - 83 + hop, 2, '#241a12'); // eye
      // Banana ears.
      oval(g, cx - 27, baseY - 90 + hop, 2.6, 5.5, woolDark, -0.3);
      oval(g, cx - 20, baseY - 90 + hop, 2.6, 5.5, woolDark, 0.3);
      // Halter.
      g.strokeStyle = PAL.terracotta;
      g.lineWidth = 2;
      g.beginPath();
      g.arc(cx - 26, baseY - 79 + hop, 6.5, 0, Math.PI * 2);
      g.stroke();
    } else {
      const back = dir === 'up';
      // Legs.
      g.strokeStyle = woolDark;
      g.lineWidth = 7;
      g.lineCap = 'round';
      for (const lx of [cx - 10, cx + 10]) {
        g.beginPath();
        g.moveTo(lx, baseY - 18 + hop);
        g.lineTo(lx + (lx < cx ? swing : -swing) * 2, baseY);
        g.stroke();
      }
      // Body.
      oval(g, cx, baseY - 28 + hop, 16, 13, wool);
      // Neck.
      g.strokeStyle = wool;
      g.lineWidth = 12;
      g.beginPath();
      g.moveTo(cx, baseY - 32 + hop);
      g.lineTo(cx, baseY - 72 + hop);
      g.stroke();
      // Head.
      oval(g, cx, baseY - 78 + hop, 8.5, 8, wool);
      oval(g, cx - 3, baseY - 88 + hop, 2.6, 5.5, woolDark, -0.2);
      oval(g, cx + 3, baseY - 88 + hop, 2.6, 5.5, woolDark, 0.2);
      if (!back) {
        dot(g, cx - 3.4, baseY - 79 + hop, 2, '#241a12');
        dot(g, cx + 3.4, baseY - 79 + hop, 2, '#241a12');
        oval(g, cx, baseY - 74 + hop, 3, 2.2, face);
      }
    }
  });
}

/** A promising mound of terrace soil with something underneath. */
export function makeMoundSheet(): HTMLCanvasElement {
  return sheet((g) => {
    const cx = AW / 2;
    softShadow(g, cx, 120, 20, 6, 0.18);
    oval(g, cx, 112, 18, 9, '#5a4028');
    oval(g, cx, 108, 13, 6, '#6b4d30');
    oval(g, cx - 4, 105, 5, 3, '#8a6a42');
    dot(g, cx + 8, 108, 2, PAL.cream); // the glint that says "dig here"
  });
}

