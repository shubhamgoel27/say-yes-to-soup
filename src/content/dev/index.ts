import type { ChapterDef } from '../schema';
import { DIG_SPOTS, EVENT_NODES, EXAMINES, NODES, NPCS } from './npcs';
import { ERRANDS, JOURNAL, TASKS } from './journal';
import { RECALL } from './recall';
import { VILLAGE_MAP } from './testmap';
import { CASA_CARMEN_MAP, CHICHERIA_MAP } from './interiors';
import { EAST_ROAD_MAP } from './eastroad';
import { LA_BAJADA_MAP } from './labajada';

/** Chapter One: Ch'aska Pampa, the star plain. */
export const CHAPTER: ChapterDef = {
  id: 'chaska-pampa',
  maps: [VILLAGE_MAP, CHICHERIA_MAP, CASA_CARMEN_MAP, EAST_ROAD_MAP, LA_BAJADA_MAP],
  npcs: NPCS,
  nodes: NODES,
  examines: EXAMINES,
  events: EVENT_NODES,
  journal: JOURNAL,
  tasks: TASKS,
  errands: ERRANDS,
  recall: RECALL,
  meta: {
    village: { scene: 'outdoor', mood: 'warm' },
    chicheria: { scene: 'interior', mood: 'interior' },
    'casa-carmen': { scene: 'interior', mood: 'interior' },
    'east-road': { scene: 'road', mood: 'cool' },
    'la-bajada': { scene: 'road', mood: 'dusty' },
  },
  // The gate celebration and dig spots keep their bespoke wiring in main.
};

export { DIG_SPOTS };
