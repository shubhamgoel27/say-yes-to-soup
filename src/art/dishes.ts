import { Rng, dot, oval, rr, shade, surface } from './pix';

/**
 * Little painted plates for the journal's Dishes tab: every dish the journey
 * feeds you, drawn the way the rest of the world is drawn. One parameterized
 * painter, one spec per dish, so a new chapter's table costs six lines.
 */

type Vessel =
  | 'bowl' | 'plate' | 'glass' | 'cup' | 'leaf' | 'paper' | 'board' | 'comal' | 'gourd'
  | 'clay' | 'thali' | 'kulhad' | 'dona' | 'basket';
type Shape =
  | 'mound' | 'rounds' | 'noodles' | 'triangles' | 'tube' | 'discs'
  | 'fish' | 'broth' | 'stack' | 'wedge' | 'octopus' | 'bun'
  | 'folded' | 'spirals' | 'puri' | 'foam' | 'mango';

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
  side?: 'lime' | 'bun' | 'cup' | 'leafdot' | 'spoon' | 'katori';
  /** What the side holds (the katori's sabzi or raita). */
  sideFill?: string;
};

const D: Record<string, DishSpec> = {
  // The first bowl: a rough clay bowl, potato in broth, huacatay on top, and
  // the wooden spoon Rosa hands over before you have sat down.
  'dishes.rosasoup': { vessel: 'clay', food: ['#e6c873', '#efd994', '#d9b25f'], shape: 'rounds', liquid: '#cf9f5a', steam: true, fleck: ['#4d7440', '#6d8f3a'], side: 'spoon' },
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
  // Delhi: steel thalis, clay kulhads, leaf donas, the halwai's paper.
  'dishes.parantha': { vessel: 'thali', food: ['#e0b263', '#d49f4f'], shape: 'folded', fleck: ['#8a5330'], side: 'katori', sideFill: '#efe6d2' },
  'dishes.jalebi': { vessel: 'paper', food: ['#e8902a', '#f0a83a'], shape: 'spirals' },
  'dishes.kulhadchai': { vessel: 'kulhad', food: [], liquid: '#c9a06a', foam: '#dcc49a', steam: true },
  'dishes.daulat': { vessel: 'dona', food: ['#fbf6ea', '#f2ead8'], shape: 'foam', fleck: ['#e8a33a', '#8fae5a', '#d8d8d8'] },
  'dishes.bedmi': { vessel: 'thali', food: ['#d9a441', '#c98a2e'], shape: 'puri', side: 'katori', sideFill: '#b5652f' },
  'dishes.roohafza': { vessel: 'glass', food: [], liquid: '#e2668f', foam: '#f3c1d0' },
  'dishes.aam': { vessel: 'basket', food: ['#f0b43a', '#e8a02e', '#f2c64a'], shape: 'mango' },
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

/** Whether a journal dish page has its painting (the test walks every page). */
export function hasDishArt(id: string): boolean {
  return id in D;
}

/**
 * Paints the dish for a journal page id, or null when no spec exists.
 * `res` paints at that many pixels per unit: the journal now shows the dish
 * large across the page's empty half, and a 132px painting stretched there
 * went soft.
 */
export function makeDishArt(id: string, res = 1): HTMLCanvasElement | null {
  const spec = D[id];
  if (!spec) return null;
  const { cv, g } = surface(Math.round(W * res), Math.round(H * res));
  g.scale(res, res);
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
    case 'clay': {
      // Rough earthenware: a deeper, darker bowl than the glazed ones, with a
      // thumbed rim and a band of slip, the kind that lives by the fire.
      const c = '#9a5a34';
      g.fillStyle = c;
      g.beginPath();
      g.ellipse(cx, cy - 2, 36, 26, 0, 0, Math.PI);
      g.fill();
      g.strokeStyle = shade(c, 0.18);
      g.lineWidth = 2.2;
      g.beginPath();
      g.ellipse(cx, cy + 6, 31, 13, 0, Math.PI * 0.12, Math.PI * 0.88);
      g.stroke();
      for (let i = 0; i < 6; i++) dot(g, cx - 24 + i * 9.6, cy + 12 + Math.sin(i) * 1.5, 1.2, shade(c, -0.25));
      oval(g, cx, cy - 4, 37, 12, shade(c, 0.1));
      oval(g, cx, cy - 4, 33, 10, shade(c, -0.28));
      foodY = cy - 4;
      foodRx = 29;
      break;
    }
    case 'thali': {
      // Steel, not ceramic: a cool rim highlight and a hard reflection.
      oval(g, cx, cy + 5, 50, 17, '#a7adb0');
      oval(g, cx, cy + 3, 45, 14.5, '#c9ced0');
      oval(g, cx, cy + 4, 39, 11.5, '#b4babd');
      g.strokeStyle = 'rgba(255,255,255,0.7)';
      g.lineWidth = 1.4;
      g.beginPath();
      g.ellipse(cx, cy + 3, 46, 15, 0, Math.PI * 1.08, Math.PI * 1.42);
      g.stroke();
      foodY = cy + 2;
      foodRx = 26;
      break;
    }
    case 'kulhad': {
      // Unglazed terracotta, wide mouth, narrow foot, thrown fast on a wheel.
      const c = '#b8653a';
      g.fillStyle = c;
      g.beginPath();
      g.moveTo(cx - 19, cy - 18);
      g.lineTo(cx + 19, cy - 18);
      g.lineTo(cx + 12, cy + 14);
      g.quadraticCurveTo(cx, cy + 18, cx - 12, cy + 14);
      g.closePath();
      g.fill();
      g.strokeStyle = shade(c, -0.14);
      g.lineWidth = 1;
      for (let i = 0; i < 4; i++) {
        const y = cy - 10 + i * 6.5;
        g.beginPath();
        g.moveTo(cx - 17 + i * 1.6, y);
        g.lineTo(cx + 17 - i * 1.6, y);
        g.stroke();
      }
      g.fillStyle = 'rgba(255,230,200,0.18)';
      g.fillRect(cx - 14, cy - 16, 5, 28);
      oval(g, cx, cy - 18, 19, 6, shade(c, 0.14));
      if (spec.liquid) oval(g, cx, cy - 17.5, 16, 4.6, spec.liquid);
      if (spec.foam) oval(g, cx - 3, cy - 18, 8, 2.4, spec.foam);
      foodY = cy - 20;
      break;
    }
    case 'dona': {
      // A pressed-leaf cup, stitched with its own midribs.
      const c = '#7f8a45';
      g.fillStyle = c;
      g.beginPath();
      g.ellipse(cx, cy - 2, 34, 22, 0, 0, Math.PI);
      g.fill();
      g.strokeStyle = shade(c, -0.22);
      g.lineWidth = 1.2;
      for (let i = -2; i <= 2; i++) {
        g.beginPath();
        g.moveTo(cx + i * 12, cy - 2);
        g.quadraticCurveTo(cx + i * 10, cy + 10, cx + i * 6, cy + 18);
        g.stroke();
      }
      oval(g, cx, cy - 3, 35, 11, shade(c, 0.16));
      oval(g, cx, cy - 3, 31, 9, shade(c, -0.2));
      foodY = cy - 3;
      foodRx = 26;
      break;
    }
    case 'basket': {
      // A low woven tokri, the crate's softer cousin on a lane corner.
      const c = '#b08a52';
      g.fillStyle = c;
      g.beginPath();
      g.ellipse(cx, cy, 44, 22, 0, 0, Math.PI);
      g.fill();
      g.strokeStyle = shade(c, -0.2);
      g.lineWidth = 1.2;
      for (const k of [0.5, 0.7, 0.88]) {
        g.beginPath();
        g.ellipse(cx, cy, 44 * k, 22 * k, 0, Math.PI * 0.08, Math.PI * 0.92);
        g.stroke();
      }
      for (let i = -4; i <= 4; i++) {
        g.beginPath();
        g.moveTo(cx + i * 9.5, cy + 1);
        g.lineTo(cx + i * 7.5, cy + 19 - Math.abs(i) * 1.6);
        g.stroke();
      }
      oval(g, cx, cy, 45, 13, shade(c, 0.12));
      oval(g, cx, cy, 40, 10, shade(c, -0.3));
      foodY = cy;
      foodRx = 34;
      break;
    }
  }

  // Bowl liquids sit inside the rim.
  if ((spec.vessel === 'bowl' || spec.vessel === 'plate' || spec.vessel === 'clay') && spec.liquid) {
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
    case 'folded': {
      // Paranthas folded into quarters and stacked, tawa-blistered.
      for (let i = 0; i < 2; i++) {
        const fx = cx - 18 + i * 14;
        const fy = foodY - 2 - i * 4;
        const c = shade(pick(i), i * 0.05);
        g.fillStyle = c;
        g.beginPath();
        g.moveTo(fx - 16, fy + 6);
        g.lineTo(fx + 16, fy + 6);
        g.quadraticCurveTo(fx + 15, fy - 14, fx - 16, fy - 13);
        g.closePath();
        g.fill();
        g.strokeStyle = shade(c, -0.22);
        g.lineWidth = 1.1;
        g.beginPath();
        g.moveTo(fx - 16, fy + 6);
        g.quadraticCurveTo(fx + 15, fy - 14, fx - 16, fy - 13);
        g.stroke();
        for (let k = 0; k < 6; k++) dot(g, fx - 10 + r.next() * 18, fy - 6 + r.next() * 10, 1 + r.next() * 1.3, shade(c, -0.32));
        oval(g, fx - 4, fy - 4, 6, 2, 'rgba(255,245,210,0.35)');
      }
      break;
    }
    case 'spirals': {
      // Jalebi: piped coils, glossy with syrup, piled loose on the paper.
      const centers: [number, number][] = [[-15, 2], [12, 3], [-1, -7]];
      g.lineCap = 'round';
      for (const [i, [ox, oy]] of centers.entries()) {
        const c = pick(i);
        const sx = cx + ox;
        const sy = foodY + oy;
        g.strokeStyle = shade(c, -0.12);
        g.lineWidth = 3.8;
        g.beginPath();
        for (let t = 0; t < Math.PI * 5; t += 0.2) {
          const rad = 1.2 + t * 0.78;
          const x = sx + Math.cos(t) * rad;
          const y = sy + Math.sin(t) * rad * 0.62;
          if (t === 0) g.moveTo(x, y);
          else g.lineTo(x, y);
        }
        g.stroke();
        g.strokeStyle = c;
        g.lineWidth = 2;
        g.stroke();
        dot(g, sx - 3, sy - 2.5, 1.2, 'rgba(255,248,220,0.8)');
      }
      break;
    }
    case 'puri': {
      // Bedmi puris, puffed hollow and blistered, two on the steel.
      for (let i = 0; i < 2; i++) {
        const fx = cx - 15 + i * 18;
        const fy = foodY - 1 - i * 3;
        const c = pick(i);
        oval(g, fx, fy + 1, 15, 8, shade(c, -0.15));
        oval(g, fx, fy - 1, 14, 7.5, c);
        oval(g, fx - 3, fy - 3.5, 7, 3, shade(c, 0.22));
        for (let k = 0; k < 4; k++) dot(g, fx - 8 + r.next() * 16, fy - 3 + r.next() * 6, 1, shade(c, -0.3));
      }
      break;
    }
    case 'foam': {
      // Daulat ki chaat: whipped milk foam, airy peaks, barely there.
      // A heaped cloud: wide at the leaf's rim, peaking in the middle.
      for (let i = 0; i < 18; i++) {
        const u = (r.next() - 0.5) * 2;
        const fx = cx + u * foodRx * 0.85;
        const fy = foodY - 2 - (1 - Math.abs(u)) * 10 - r.next() * 3;
        dot(g, fx, fy, 4 + r.next() * 3, shade(pick(i), -0.06));
        dot(g, fx - 1.2, fy - 1.5, 2.2 + r.next() * 1.5, pick(i));
      }
      break;
    }
    case 'mango': {
      // Langra and chausa, piled in the tokri, each with its stem dimple.
      const spots: [number, number, number][] = [[-20, 0, 0.3], [2, 2, -0.2], [22, -1, 0.5], [-9, -9, -0.4], [12, -10, 0.1]];
      for (const [i, [ox, oy, rot]] of spots.entries()) {
        const c = pick(i);
        const fx = cx + ox;
        const fy = foodY + oy - 4;
        g.save();
        g.translate(fx, fy);
        g.rotate(rot);
        g.fillStyle = shade(c, -0.12);
        g.beginPath();
        g.ellipse(0, 1, 12, 8.5, 0, 0, Math.PI * 2);
        g.fill();
        g.fillStyle = c;
        g.beginPath();
        g.ellipse(-0.5, 0, 11.5, 8, 0, 0, Math.PI * 2);
        g.fill();
        // A green shoulder blush toward the stem.
        g.fillStyle = 'rgba(120,150,60,0.45)';
        g.beginPath();
        g.ellipse(7, -2, 5, 4.5, 0, 0, Math.PI * 2);
        g.fill();
        g.fillStyle = 'rgba(255,245,200,0.45)';
        g.beginPath();
        g.ellipse(-4, -3.5, 4.5, 2, -0.2, 0, Math.PI * 2);
        g.fill();
        dot(g, 10.5, -3, 1.3, '#5a4022');
        g.restore();
      }
      // One leaf left on, the way they come off the cart.
      g.fillStyle = '#4d7440';
      g.beginPath();
      g.ellipse(cx + 30, foodY - 14, 10, 3.5, -0.6, 0, Math.PI * 2);
      g.fill();
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
  } else if (spec.side === 'spoon') {
    // A carved wooden spoon resting on the rim.
    g.save();
    g.translate(cx + 30, cy - 12);
    g.rotate(-0.55);
    rr(g, -2, -2, 26, 4, 2, '#b98a54');
    oval(g, -4, 0, 6.5, 4.5, '#a8784a');
    oval(g, -4.5, -0.6, 4.5, 3, shade('#a8784a', -0.2));
    g.restore();
  } else if (spec.side === 'katori') {
    // A small steel katori on the thali, holding the sabzi or the curd.
    const kx = cx + 30;
    const ky = cy - 3;
    oval(g, kx, ky + 4, 13, 7, '#9ea4a7');
    oval(g, kx, ky, 13, 5.5, '#d3d8da');
    oval(g, kx, ky + 0.5, 10.5, 4, spec.sideFill ?? '#c98a2e');
    for (let k = 0; k < 3; k++) dot(g, kx - 5 + k * 5, ky + 0.5, 1.4, shade(spec.sideFill ?? '#c98a2e', -0.25));
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
