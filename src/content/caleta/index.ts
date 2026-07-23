import type { ChapterDef } from '../schema';
import type { AudioBus } from '../../engine/audio';
import { CALETA_EVENTS, CALETA_EXAMINES, CALETA_NODES, CALETA_NPCS } from './npcs';
import { CALETA_JOURNAL, CALETA_TASKS } from './journal';
import { LA_CALETA_MAP, PICANTERIA_MAP } from './map';
import { RECALL } from './recall';
import { NetPanel, WavePanel } from '../../ui/coast';

/** Chapter Two: La Caleta, where the desert walks down to the sea. */
export const CHAPTER: ChapterDef = {
  id: 'la-caleta',
  maps: [LA_CALETA_MAP, PICANTERIA_MAP],
  npcs: CALETA_NPCS,
  nodes: CALETA_NODES,
  examines: CALETA_EXAMINES,
  events: CALETA_EVENTS,
  journal: CALETA_JOURNAL,
  tasks: CALETA_TASKS,
  errands: [{ id: 'petro-lisa', label: "Doña Petro's lisa, held at Marisol's stall" }],
  games: [
    {
      flag: 'wave.start',
      doneNode: 'mar.rode',
      make: (root, audio) => new WavePanel(root, audio as AudioBus),
    },
    {
      flag: 'net.start',
      doneNode: 'mar.mended',
      make: (root, audio) => new NetPanel(root, audio as AudioBus),
    },
  ],
  recall: RECALL,
  meta: {
    'la-caleta': { scene: 'outdoor', mood: 'garua' },
    picanteria: { scene: 'interior', mood: 'interior' },
  },
  arrival: { map: 'la-caleta', node: 'mar.arrive', flag: 'c2.arrived' },
  completion: {
    flag: 'c2.complete',
    plate: 'CHAPTER TWO · COMPLETE',
    toasts: ['✦ the village vouches for you', 'the Crossing is being provisioned'],
  },
};
