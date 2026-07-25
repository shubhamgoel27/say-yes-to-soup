import type { ChapterDef } from '../schema';
import type { AudioBus } from '../../engine/audio';
import { CALETA_EVENTS, CALETA_EXAMINES, CALETA_NODES, CALETA_NPCS } from './npcs';
import { CALETA_JOURNAL, CALETA_TASKS } from './journal';
import { LA_CALETA_MAP, PICANTERIA_MAP } from './map';
import { RECALL } from './recall';
import { CevichePanel, NetPanel, WavePanel } from '../../ui/coast';

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
    {
      flag: 'c2.cook.start',
      doneNode: 'mar.cook.finish',
      make: (root, audio) => new CevichePanel(root, audio as AudioBus),
    },
  ],
  recall: RECALL,
  meta: {
    'la-caleta': { scene: 'outdoor', mood: 'garua' },
    picanteria: { scene: 'interior', mood: 'interior' },
  },
  // Sitting on a fish crate at the pier is correct; the picantería stools too.
  sitKinds: ['crate', 'stool'],
  sitLines: {
    'la-caleta': [
      'The sea sets the tempo and the malecón keeps it: stroll, pause, greet, stroll. Nobody finishes this walk early.',
      'The caballitos drip dry on their tails, a fence of horses clocking out.',
      'The pelican has not moved. As far as anyone can tell, the pelican is winning.',
      'The garúa hangs low. Somewhere under it, an outboard putters home by memory.',
      'Every seventh wave reaches a little further up the sand, checking on everyone.',
      'Around four, Marisol’s voice will cross the whole malecón: the remate, the day’s last arithmetic.',
    ],
    picanteria: [
      'Between rushes, the room exhales. The pots keep talking; Petro answers only the ones that matter.',
      'The long table holds six strangers and no silence. The ají crosses it twice without being asked.',
      'Steam writes over the doorway and unwrites itself. Today’s dish is whatever the pots say it is.',
      'Petro moves between the pots like a captain on a small, delicious ship.',
      'Someone finishes, sighs, and stays seated. Leaving quickly would be a kind of lie.',
    ],
  },
  arrival: { map: 'la-caleta', node: 'mar.arrive', flag: 'c2.arrived' },
  completion: {
    flag: 'c2.complete',
    plate: 'CHAPTER TWO · COMPLETE',
    toasts: ['✦ the village vouches for you', 'the Crossing is being provisioned'],
  },
};
