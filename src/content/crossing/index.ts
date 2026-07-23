import type { ChapterDef } from '../schema';
import type { AudioBus } from '../../engine/audio';
import { CROSSING_EVENTS, CROSSING_EXAMINES, CROSSING_LETTERS, CROSSING_NODES, CROSSING_NPCS } from './npcs';
import { CROSSING_JOURNAL, CROSSING_TASKS } from './journal';
import { GALLEY_MAP, SHIP_MAP } from './map';
import { RECALL } from './recall';
import { GalleyPanel, StarPanel } from '../../ui/games/crossing';

/** Chapter Three: the Crossing. Thirty-one days; the ship is a village. */
export const CHAPTER: ChapterDef = {
  id: 'crossing',
  maps: [SHIP_MAP, GALLEY_MAP],
  npcs: CROSSING_NPCS,
  nodes: CROSSING_NODES,
  examines: CROSSING_EXAMINES,
  events: CROSSING_EVENTS,
  journal: CROSSING_JOURNAL,
  tasks: CROSSING_TASKS,
  errands: [{ id: 'ben-baon', label: "Joseph's night lunch, warm under its cloth" }],
  letters: CROSSING_LETTERS,
  games: [
    {
      flag: 'c3.cook.start',
      doneNode: 'c3.cooked',
      make: (root, audio) => new GalleyPanel(root, audio as AudioBus),
    },
    {
      flag: 'c3.stars.start',
      doneNode: 'c3.starsdone',
      make: (root, audio) => new StarPanel(root, audio as AudioBus),
    },
  ],
  recall: RECALL,
  meta: {
    ship: { scene: 'outdoor', mood: 'openocean' },
    galley: { scene: 'interior', mood: 'interior' },
  },
  moods: {
    // Open-ocean blue: high clear light, sea glare from every side, a soft
    // press of vignette so the deck feels held between two blues.
    openocean: {
      top: 'rgba(140,190,235,0.10)',
      mid: 'rgba(190,220,245,0.04)',
      bottom: 'rgba(70,120,175,0.10)',
      vig: 0.28,
      ambient: 0xe9f2fb,
    },
  },
  arrival: { map: 'ship', node: 'c3.arrive', flag: 'c3.arrived' },
  completion: {
    flag: 'c3.complete',
    plate: 'CHAPTER THREE · COMPLETE',
    toasts: ['✦ the whole crew vouches for you', 'Shionoura rises with the sun'],
  },
};
