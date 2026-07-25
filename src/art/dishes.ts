import { Rng, dot, oval, rr, shade, surface } from './pix';

/**
 * Little painted plates for the journal's Dishes tab: every dish the journey
 * feeds you, drawn the way the rest of the world is drawn. One parameterized
 * painter, one spec per dish, so a new chapter's table costs six lines.
 */

type Vessel = 'bowl' | 'plate' | 'glass' | 'cup' | 'leaf' | 'paper' | 'board' | 'comal' | 'gourd';
type Shape =
  | 'mound' | 'rounds' | 'noodles' | 'triangles' | 'tube' | 'discs'
  | 'fish' | 'broth' | 'stack' | 'wedge' | 'octopus' | 'bun';

type DishSpec = {
  vessel: Vessel;
  /** Content colors, painted as the shape. */
  food: string[];
  shape?: Shape;
  /** Liquid fill (glass/cup/bowl) under or instead of solids. */
  liquid?: string;
  /** Foam cap on the liquid. */
  foam?: string;
  /** Garnish fleck colors. */
  fleck?: string[];
  steam?: boolean;
  /** A side element: lime wedge, brioche, broth cup... */
  side?: 'lime' | 'bun' | 'cup' | 'leafdot';
};

const D: Record<string, DishSpec> = {
  'dishes.mote': { vessel: 'bowl', food: ['#f0e3b8', '#e8d79f'], shape: 'rounds', steam: true },
  'dishes.chicha': { vessel: 'gourd', food: [], liquid: '#d9a441', foam: '#f2e6c8' },
  'dishes.papa': { vessel: 'plate', food: ['#7a4460', '#c9a35f', '#8a5330', '#d9c298'], shape: 'rounds' },
  'dishes.watia': { vessel: 'comal', food: ['#8a6238', '#a97c50', '#7a4460'], shape: 'rounds', steam: true },
  'dishes.llumchuy': { vessel: 'bowl', food: ['#c9a35f'], shape: 'broth', liquid: '#c98a2e', steam: true, fleck: ['#4d7440'] },
  'dishes.ceviche': { vessel: 'plate', food: ['#f4efe4', '#efe8da'], shape: 'mound', fleck: ['#8a4a7d', '#c1512f'], side: 'lime' },
  'dishes.lechedetigre': { vessel: 'glass', food: [], liquid: '#e8e2ce', fleck: ['#4d7440'] },
  'dishes.sudado': { vessel: 'bowl', food: ['#e8e0cc'], shape: 'fish', liquid: '#c1512f', steam: true, fleck: ['#4d7440'] },
  'dishes.emoliente': { vessel: 'glass', food: [], liquid: '#c98a2e', fleck: ['#4d5e30'], steam: true },
  'dishes.chicharron': { vessel: 'paper', food: ['#c98a2e', '#b5713f'], shape: 'rounds', side: 'lime' },
  'dishes.tortitas': { vessel: 'plate', food: ['#d9a441', '#c98a2e'], shape: 'discs' },
  'dishes.adobo': { vessel: 'bowl', food: ['#6e4526', '#59371e'], shape: 'mound', fleck: ['#3d5226', '#241a12'], steam: true },
  'dishes.sinigang': { vessel: 'bowl', food: ['#e8b4a0'], shape: 'broth', liquid: '#d9c8a0', steam: true, fleck: ['#4d7440'] },
  'dishes.pancit': { vessel: 'plate', food: ['#e0c98a'], shape: 'noodles', fleck: ['#c1512f', '#4d7440'] },
  'dishes.galleycoffee': { vessel: 'cup', food: [], liquid: '#2e1d12', steam: true },
  'dishes.dashi': { vessel: 'bowl', food: [], liquid: '#d9b25f', steam: true },
  'dishes.tai': { vessel: 'plate', food: ['#e08a8a'], shape: 'fish', fleck: ['#f4efe4'] },
  'dishes.lemon': { vessel: 'bowl', food: ['#e8d44d', '#f0e078'], shape: 'rounds', fleck: ['#4d7440'] },
  'dishes.onigiri': { vessel: 'plate', food: ['#f4efe4'], shape: 'triangles', fleck: ['#1c2418'] },
  'dishes.lemonyokan': { vessel: 'board', food: ['#efe08a'], shape: 'stack' },
  'dishes.hotteok': { vessel: 'paper', food: ['#d9a441'], shape: 'discs', fleck: ['#59371e'] },
  'dishes.eomuk': { vessel: 'paper', food: ['#e0cfa8'], shape: 'tube', side: 'cup', steam: true },
  'dishes.gukbap': { vessel: 'bowl', food: ['#efe8da'], shape: 'broth', liquid: '#e0d0b0', steam: true, fleck: ['#4d7440'] },
  'dishes.sikhye': { vessel: 'glass', food: [], liquid: '#e8d9a8', fleck: ['#f4efe4'] },
  'dishes.puttu': { vessel: 'plate', food: ['#f4efe4'], shape: 'tube', fleck: ['#8a6238'] },
  'dishes.parotta': { vessel: 'plate', food: ['#e0c98a', '#d4b878'], shape: 'discs' },
  'dishes.meencurry': { vessel: 'bowl', food: ['#e8e0cc'], shape: 'fish', liquid: '#b5432f', steam: true, fleck: ['#3d5226'] },
  'dishes.sadya': { vessel: 'leaf', food: ['#f4efe4', '#c98a2e', '#b5432f', '#d9a441', '#4d7440', '#e8d9a8'], shape: 'rounds' },
  'dishes.payasam': { vessel: 'bowl', food: [], liquid: '#e0b98a', fleck: ['#8a6238', '#e8d44d'], steam: true },
  'dishes.urojo': { vessel: 'bowl', food: ['#f4efe4'], shape: 'broth', liquid: '#d9b25f', fleck: ['#c1512f', '#4d7440', '#e8d44d'], steam: true },
  'dishes.mandazi': { vessel: 'paper', food: ['#d9a441', '#c9924a'], shape: 'triangles' },
  'dishes.chaitangawizi': { vessel: 'cup', food: [], liquid: '#c9a06a', steam: true, fleck: ['#c98a2e'] },
  'dishes.pweza': { vessel: 'bowl', food: ['#9c5a6e'], shape: 'octopus', liquid: '#e0cfa8', fleck: ['#4d7440'] },
  'dishes.pilau': { vessel: 'plate', food: ['#b5905a', '#a8824a'], shape: 'mound', fleck: ['#59371e', '#241a12'] },
  'dishes.granitabrioche': { vessel: 'glass', food: [], liquid: '#6e4526', foam: '#e8dcc4', side: 'bun' },
  'dishes.arancino': { vessel: 'paper', food: ['#d9862e'], shape: 'bun', fleck: ['#c98a2e'] },
  'dishes.norma': { vessel: 'plate', food: ['#e8d9a8'], shape: 'noodles', fleck: ['#b5432f', '#f4efe4', '#3d2a3a'] },
  'dishes.cannolo': { vessel: 'board', food: ['#c9924a'], shape: 'tube', fleck: ['#f4efe4', '#4d7440'] },
  'dishes.panecunzato': { vessel: 'board', food: ['#d9b878'], shape: 'bun', fleck: ['#b5432f', '#3d5226'] },
  'dishes.molenegro': { vessel: 'plate', food: ['#2e1d16'], shape: 'broth', liquid: '#241610', fleck: ['#f4efe4'], steam: true },
  'dishes.tejate': { vessel: 'gourd', food: [], liquid: '#8a6238', foam: '#e8dcc4' },
  'dishes.pandemuerto': { vessel: 'plate', food: ['#d9a441'], shape: 'bun', fleck: ['#f0e3b8'] },
  'dishes.tlayuda': { vessel: 'comal', food: ['#e0c98a'], shape: 'discs', fleck: ['#3d5226', '#b5432f', '#f4efe4'] },
  'dishes.chocolatedeagua': { vessel: 'cup', food: [], liquid: '#3d2418', foam: '#c9a06a', steam: true },
};

const W = 132;
const H = 96;

/** Paints the dish for a journal page id, or null when no spec exists. */
export function makeDishArt(id: string): HTMLCanvasElement | null {
  const spec = D[id];
  if (!spec) return null;
  const { cv, g } = surface(W, H);
  const r = new Rng(id.length * 7919 + 31);
  const cx = W / 2;
  const cy = H / 2 + 8;

  // Table shadow.
  oval(g, cx, cy + 16, 42, 8, 'rgba(43,33,24,0.16)');

  // ---- the vessel ----
  let foodY = cy;
  let foodRx = 30;
  switch (spec.vessel) {
    case 'bowl': {
      g.fillStyle = shade('#b5713f', 0.06);
      g.beginPath();
      g.ellipse(cx, cy + 2, 38, 20, 0, 0, Math.PI * 2);
      g.fill();
      oval(g, cx, cy - 4, 34, 12, shade('#8a5330', -0.1));
      foodY = cy - 4;
      foodRx = 30;
      break;
    }
    case 'plate': {
      oval(g, cx, cy + 4, 44, 16, '#e8dcc4');
      oval(g, cx, cy + 2, 36, 12, shade('#e8dcc4', -0.08));
      foodY = cy + 1;
      foodRx = 30;
      break;
    }
    case 'glass': {
      rr(g, cx - 13, cy - 26, 26, 44, 5, 'rgba(220,230,235,0.55)');
      if (spec.liquid) rr(g, cx - 10, cy - 16, 20, 31, 4, spec.liquid);
      if (spec.foam) oval(g, cx, cy - 16, 10, 4.5, spec.foam);
      rr(g, cx - 13, cy - 26, 26, 44, 5, 'rgba(255,255,255,0.0)');
      g.strokeStyle = 'rgba(90,100,105,0.5)';
      g.lineWidth = 1.6;
      g.strokeRect(cx - 13, cy - 26, 26, 44);
      foodY = cy - 20;
      break;
    }
    case 'cup': {
      g.fillStyle = '#7a92a3';
      g.beginPath();
      g.ellipse(cx, cy + 2, 20, 15, 0, 0, Math.PI);
      g.fill();
      g.fillRect(cx - 20, cy - 12, 40, 15);
      oval(g, cx, cy - 12, 20, 7, shade('#7a92a3', 0.15));
      if (spec.liquid) oval(g, cx, cy - 12, 16, 5, spec.liquid);
      if (spec.foam) oval(g, cx - 4, cy - 13, 8, 3, spec.foam);
      // Handle.
      g.strokeStyle = '#7a92a3';
      g.lineWidth = 4;
      g.beginPath();
      g.arc(cx + 24, cy - 3, 7, -Math.PI / 2, Math.PI / 2);
      g.stroke();
      foodY = cy - 14;
      break;
    }
    case 'gourd': {
      g.fillStyle = '#a8824a';
      g.beginPath();
      g.ellipse(cx, cy + 2, 26, 18, 0, 0, Math.PI * 2);
      g.fill();
      oval(g, cx, cy - 6, 22, 8, shade('#8a6238', -0.15));
      if (spec.liquid) oval(g, cx, cy - 6, 19, 6.5, spec.liquid);
      if (spec.foam) {
        for (let i = 0; i < 5; i++) dot(g, cx - 12 + i * 6, cy - 7 + (i % 2), 3.4, spec.foam);
      }
      foodY = cy - 8;
      break;
    }
    case 'leaf': {
      g.fillStyle = '#5c8752';
      g.beginPath();
      g.ellipse(cx, cy + 2, 48, 17, 0, 0, Math.PI * 2);
      g.fill();
      g.strokeStyle = shade('#5c8752', -0.2);
      g.lineWidth = 1.6;
      g.beginPath();
      g.moveTo(cx - 46, cy + 2);
      g.lineTo(cx + 46, cy + 2);
      g.stroke();
      foodY = cy - 1;
      foodRx = 38;
      break;
    }
    case 'paper': {
      g.fillStyle = '#e8ddc0';
      g.beginPath();
      g.moveTo(cx - 34, cy + 14);
      g.lineTo(cx - 24, cy - 12);
      g.lineTo(cx + 26, cy - 10);
      g.lineTo(cx + 34, cy + 14);
      g.closePath();
      g.fill();
      g.strokeStyle = 'rgba(120,100,70,0.4)';
      g.lineWidth = 1.4;
      g.stroke();
      foodY = cy - 4;
      break;
    }
    case 'board': {
      rr(g, cx - 40, cy - 8, 80, 22, 5, '#a8824a');
      rr(g, cx - 40, cy - 8, 80, 6, 3, shade('#a8824a', 0.12));
      foodY = cy - 6;
      break;
    }
    case 'comal': {
      oval(g, cx, cy + 4, 44, 15, '#4a4038');
      oval(g, cx, cy + 2, 38, 12, shade('#4a4038', 0.12));
      foodY = cy;
      foodRx = 32;
      break;
    }
  }

  // Bowl liquids sit inside the rim.
  if ((spec.vessel === 'bowl' || spec.vessel === 'plate') && spec.liquid) {
    oval(g, cx, foodY, foodRx, foodRx * 0.36, spec.liquid);
  }

  // ---- the food ----
  const foods = spec.food;
  const pick = (i: number) => foods[i % foods.length] ?? '#c9a35f';
  switch (spec.shape) {
    case 'mound':
      for (let i = 0; i < 9; i++) {
        oval(g, cx + (r.next() - 0.5) * foodRx * 1.3, foodY - 2 - r.next() * 6, 7 + r.int(4), 5, shade(pick(i), (r.next() - 0.5) * 0.1));
      }
      break;
    case 'rounds':
      for (let i = 0; i < (spec.vessel === 'leaf' ? 8 : 7); i++) {
        const fx = cx + (r.next() - 0.5) * foodRx * 1.5;
        dot(g, fx, foodY - 2 - r.next() * 4, 4.5 + r.next() * 2.5, pick(i));
        dot(g, fx - 1.4, foodY - 4.5 - r.next() * 3, 1.5, 'rgba(255,250,235,0.5)');
      }
      break;
    case 'noodles':
      g.lineWidth = 2.4;
      for (let i = 0; i < 8; i++) {
        g.strokeStyle = shade(pick(i), (r.next() - 0.5) * 0.12);
        g.beginPath();
        g.moveTo(cx - 22 + r.int(10), foodY + 2);
        g.bezierCurveTo(cx - 8, foodY - 12 - r.int(6), cx + 8, foodY - 2 - r.int(8), cx + 20 - r.int(8), foodY + 1);
        g.stroke();
      }
      break;
    case 'triangles':
      for (let i = 0; i < 2; i++) {
        const fx = cx - 12 + i * 24;
        g.fillStyle = pick(i);
        g.beginPath();
        g.moveTo(fx, foodY - 18);
        g.lineTo(fx + 13, foodY + 2);
        g.lineTo(fx - 13, foodY + 2);
        g.closePath();
        g.fill();
        if (spec.fleck) rr(g, fx - 5, foodY - 6, 10, 8, 1, spec.fleck[0] ?? '#1c2418');
      }
      break;
    case 'tube':
      for (let i = 0; i < 2; i++) {
        const fy = foodY - 2 - i * 9;
        rr(g, cx - 22, fy - 5, 44, 10, 5, shade(pick(i), i * 0.06));
        if (spec.fleck?.[0]) {
          dot(g, cx - 21, fy, 4, spec.fleck[0]);
          dot(g, cx + 21, fy, 4, spec.fleck[0]);
        }
      }
      break;
    case 'discs':
      for (let i = 0; i < 3; i++) {
        const fx = cx - 16 + i * 16;
        oval(g, fx, foodY - 1 - (i % 2) * 3, 11, 5.5, shade(pick(i), (r.next() - 0.5) * 0.08));
        oval(g, fx, foodY - 3 - (i % 2) * 3, 8, 3.5, shade(pick(i), 0.12));
      }
      break;
    case 'fish': {
      const c = pick(0);
      g.fillStyle = c;
      g.beginPath();
      g.ellipse(cx - 2, foodY - 3, 20, 8, -0.08, 0, Math.PI * 2);
      g.fill();
      g.beginPath();
      g.moveTo(cx + 16, foodY - 3);
      g.lineTo(cx + 26, foodY - 9);
      g.lineTo(cx + 26, foodY + 3);
      g.closePath();
      g.fill();
      dot(g, cx - 14, foodY - 5, 1.6, '#241a12');
      g.strokeStyle = shade(c, -0.18);
      g.lineWidth = 1.4;
      for (let i = 0; i < 3; i++) {
        g.beginPath();
        g.arc(cx - 6 + i * 7, foodY - 3, 4, Math.PI * 0.25, Math.PI * 0.75);
        g.stroke();
      }
      break;
    }
    case 'broth':
      for (let i = 0; i < 4; i++) {
        oval(g, cx + (r.next() - 0.5) * foodRx, foodY - 1 - r.next() * 3, 6 + r.int(3), 3.4, pick(i));
      }
      break;
    case 'stack':
      for (let i = 0; i < 3; i++) rr(g, cx - 24 + i * 18, foodY - 10, 14, 10, 2, shade(pick(i), i * 0.04));
      break;
    case 'wedge':
      g.fillStyle = pick(0);
      g.beginPath();
      g.moveTo(cx - 18, foodY + 2);
      g.lineTo(cx + 18, foodY + 2);
      g.lineTo(cx + 4, foodY - 16);
      g.closePath();
      g.fill();
      break;
    case 'octopus': {
      const c = pick(0);
      dot(g, cx, foodY - 8, 7, c);
      g.strokeStyle = c;
      g.lineWidth = 4;
      g.lineCap = 'round';
      for (let i = 0; i < 4; i++) {
        g.beginPath();
        g.moveTo(cx - 6 + i * 4, foodY - 4);
        g.quadraticCurveTo(cx - 14 + i * 9, foodY + 6, cx - 16 + i * 10 + (i % 2) * 4, foodY + 2);
        g.stroke();
      }
      break;
    }
    case 'bun': {
      const c = pick(0);
      oval(g, cx, foodY - 6, 15, 11, c);
      oval(g, cx - 4, foodY - 10, 7, 4, shade(c, 0.16));
      break;
    }
  }

  // Garnish flecks over everything.
  for (const [i, fc] of (spec.fleck ?? []).entries()) {
    for (let k = 0; k < 4; k++) {
      dot(g, cx + (r.next() - 0.5) * foodRx * 1.4, foodY - 2 - r.next() * 8 - i, 1.6 + r.next(), fc);
    }
  }

  // Side elements.
  if (spec.side === 'lime') {
    const lx = cx + 34;
    g.fillStyle = '#8fbf5a';
    g.beginPath();
    g.arc(lx, cy + 6, 7, Math.PI, 0);
    g.closePath();
    g.fill();
    g.fillStyle = '#d8ecb0';
    g.beginPath();
    g.arc(lx, cy + 6, 5, Math.PI, 0);
    g.closePath();
    g.fill();
  } else if (spec.side === 'bun') {
    oval(g, cx + 32, cy + 4, 11, 8, '#d9b878');
    dot(g, cx + 32, cy - 3, 4.5, shade('#d9b878', 0.1));
  } else if (spec.side === 'cup') {
    rr(g, cx + 28, cy - 6, 14, 14, 2, '#e8ddc0');
    oval(g, cx + 35, cy - 5, 5, 2, '#c9a06a');
  }

  // Steam: two slow curls.
  if (spec.steam) {
    g.strokeStyle = 'rgba(240,236,225,0.6)';
    g.lineWidth = 2.2;
    g.lineCap = 'round';
    for (const sx of [cx - 8, cx + 7]) {
      g.beginPath();
      g.moveTo(sx, foodY - 16);
      g.bezierCurveTo(sx - 5, foodY - 24, sx + 5, foodY - 30, sx, foodY - 38);
      g.stroke();
    }
  }

  return cv;
}
