import type { ChapterDef } from '../schema';
import type { AudioBus } from '../../engine/audio';
import { BUSAN_EVENTS, BUSAN_EXAMINES, BUSAN_LETTERS, BUSAN_NODES, BUSAN_NPCS } from './npcs';
import { BUSAN_JOURNAL, BUSAN_TASKS } from './journal';
import { BUSAN_MAP, TEAHOUSE_MAP } from './map';
import { RECALL } from './recall';
import { HotteokPanel } from '../../ui/games/busan';

/** Chapter Five: Busan, one warm lane between the hillside and the harbor. */
export const CHAPTER: ChapterDef = {
  id: 'busan',
  maps: [BUSAN_MAP, TEAHOUSE_MAP],
  npcs: BUSAN_NPCS,
  nodes: BUSAN_NODES,
  examines: BUSAN_EXAMINES,
  events: BUSAN_EVENTS,
  journal: BUSAN_JOURNAL,
  tasks: BUSAN_TASKS,
  letters: BUSAN_LETTERS,
  games: [
    {
      flag: 'c5.hotteok.start',
      doneNode: 'c5.hotteok.flipped',
      make: (root, audio) => new HotteokPanel(root, audio as AudioBus),
    },
  ],
  recall: RECALL,
  meta: {
    busan: { scene: 'outdoor', mood: 'jagalchi' },
    teahouse: { scene: 'interior', mood: 'interior' },
  },
  moods: {
    // A cool dawn-market lid with lamp-warmth leaking up from the stalls.
    jagalchi: {
      top: 'rgba(168,188,212,0.16)',
      mid: 'rgba(205,210,218,0.06)',
      bottom: 'rgba(255,178,122,0.07)',
      vig: 0.24,
      ambient: 0xe8edf4,
    },
  },
  arrival: { map: 'busan', node: 'c5.arrive', flag: 'c5.arrived' },
  completion: {
    flag: 'c5.complete',
    plate: 'CHAPTER FIVE · COMPLETE',
    toasts: ['✦ the lane vouches for you', 'the Malabar Star loads at dusk'],
  },
};
