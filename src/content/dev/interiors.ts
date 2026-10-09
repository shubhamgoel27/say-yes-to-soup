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
  // A stool somebody is sitting on: the sitter is the obstacle, not the stool.
  o: { t: 'stool' },
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
  b: { t: 'batea', solid: true },
  k: { t: 'cantaros', solid: true },
  g: { t: 'grano' },
  a: { t: 'ajirack', solid: true, tall: true },
  n: { t: 'nicho', solid: true, tall: true },
  Q: { t: 'qepi', solid: true },
  h: { t: 'gallina' },
  M: { t: 'mantas' },
  e: { t: 'tendedero', solid: true, tall: true },
  ' ': { t: 'void' },
};

/** Rosa's chichería: the warm room under the red flag. */
export const CHICHERIA_MAP: MapData = {
  id: 'chicheria',
  name: 'La Chichería',
  spawn: [6, 7],
  spawnFacing: 'up',
  legend: {
    ...INTERIOR_LEGEND,
    W: { t: 'wayunka', solid: true, tall: true },
    M: { t: 'mechero', solid: true },
    U: { t: 'urpus', solid: true, tall: true },
  },
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
  // The chicha end is one corner and it is the whole point of the room: the
  // chomba, the fire under it, the straining batea and the sacks, all banked
  // into the north-west where the light is. Teófilo's table sits west of the
  // door lane rather than across it. The far corner is the household's, not
  // the trade's: the ají rack, the jars, the niche with its candle, and a hen
  // who has opinions. The q'epi by the door is what you come in past.
  // Round the walls, out of the drinking floor: maize braids hung to dry
  // above the trade end, two tin mecheros so the room is lit to drink in
  // and not only to brew in, and the urpus working in the far corner.
  objects: [
    '##SS####S####',
    '#Cqp W M c W#',
    '#jb         #',
    '#  oTT    an#',
    '#u   T   k  #',
    '#M s      g #',
    '#yrr        #',
    '# r  Q  h  U#',
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
  // The loom, the dye pots, the spindle and the brazier make one working
  // column down the west wall, and that is the side of the room the eye goes
  // to first. The bed, the folded mantas and the lit niche hold the far
  // corner, which is the side of the room that sleeps. The rugs step between
  // them off true, and the table by the door is where the visitor sits.
  objects: [
    '##S#####n##',
    '#L d     B#',
    '#u  e   M #',
    '#q        #',
    '#  rr    p#',
    '# rr     j#',
    '#y    TT  #',
    '#   Q s   #',
    '#####m#####',
  ],
  triggers: [{ at: [5, 8], type: 'door', to: 'village', spawn: [29, 11], facing: 'down' }],
};
