import type { MapData } from '../../engine/grid';

/**
 * Interior rooms, hand-authored in ASCII the way real regions will be. Small
 * on purpose: an Andean one-room house is a hearth, a bed, a loom, and the
 * things a life actually needs.
 */

const INTERIOR_LEGEND: MapData['legend'] = {
  '.': { t: 'floorEarth' },
  '#': { t: 'wallInt', solid: true, tall: true },
  S: { t: 'shelf', solid: true, tall: true },
  C: { t: 'chomba', solid: true, tall: true },
  q: { t: 'qoncha', solid: true },
  T: { t: 'table', solid: true },
  s: { t: 'stool', solid: true },
  B: { t: 'bed', solid: true },
  L: { t: 'loom', solid: true, tall: true },
  p: { t: 'pot', solid: true },
  r: { t: 'rug' },
  y: { t: 'cuy' },
  m: { t: 'mat' },
  j: { t: 'sacos', solid: true },
  c: { t: 'charango', solid: true },
  u: { t: 'pushka', solid: true },
  d: { t: 'dyepots', solid: true },
  ' ': { t: 'void' },
};

/** Rosa's chichería: the warm room under the red flag. */
export const CHICHERIA_MAP: MapData = {
  id: 'chicheria',
  name: 'La Chichería',
  spawn: [6, 7],
  spawnFacing: 'up',
  legend: INTERIOR_LEGEND,
  ground: [
    '.............',
    '.............',
    '.............',
    '.............',
    '.............',
    '.............',
    '.............',
    '.............',
    '.............',
  ],
  // The hearth corner holds everything: chomba, fire, pot, sacks. Then a gap,
  // then Teófilo's table pushed off centre with its stools at odd ends, then
  // the drying rugs banked into the far corner. Nothing lines up with anything.
  objects: [
    '##S###S##S###',
    '#Cqp     y c#',
    '#j          #',
    '#   sTTs rr #',
    '#    TT   r #',
    '#  s      u #',
    '#y r   p    #',
    '#   m       #',
    '######m######',
  ],
  triggers: [{ at: [6, 8], type: 'door', to: 'village', spawn: [12, 26], facing: 'down' }],
};

/** Doña Carmen's house: a loom, a bed, and fifty years of pattern. */
export const CASA_CARMEN_MAP: MapData = {
  id: 'casa-carmen',
  name: 'Casa de Doña Carmen',
  spawn: [5, 7],
  spawnFacing: 'up',
  legend: INTERIOR_LEGEND,
  ground: [
    '...........',
    '...........',
    '...........',
    '...........',
    '...........',
    '...........',
    '...........',
    '...........',
    '...........',
  ],
  // The loom and its dye pots take one corner, the bed the other, and the
  // finished work lies between them in two overlapping stacks rather than a
  // tidy square. The middle of the floor is where the wool goes, so it is bare.
  objects: [
    '##S####S###',
    '#L d    B #',
    '#  u      #',
    '#   rr    #',
    '#    rr   #',
    '# y     p #',
    '#   T     #',
    '#  s      #',
    '#####m#####',
  ],
  triggers: [{ at: [5, 8], type: 'door', to: 'village', spawn: [29, 11], facing: 'down' }],
};
