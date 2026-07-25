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
  sitKinds: ['stool'],
  sitLines: {
    busan: [
      'The lane moves like tide: in past your knees, out again, nobody drowned, everybody fed.',
      'Two gulls negotiate over one fish head. A third arrives wearing the face of a lawyer.',
      'Across the water the cranes keep grazing. Orange necks dip, lift, dip, patient as herons.',
      'Steam climbs from the grates, the kettles, the broth pots. One town, exhaling.',
      'An awning snaps once in the harbor wind. Sun-hee does not look up. It would not dare.',
    ],
    teahouse: [
      'The kettle mutters its one opinion. Given time, everything boils down to the same thing.',
      'Cho’s last question is still hanging in the air. He is in no hurry to reel it in.',
      'Light comes through the paper windows already strained, the drinkable kind of morning.',
      'The floor is warm under you. Somewhere below, a small fire holds up the whole room.',
      'Steam rises off your cup and unties itself. You watch it the way Cho watches you.',
    ],
  },
  arrival: { map: 'busan', node: 'c5.arrive', flag: 'c5.arrived' },
  completion: {
    flag: 'c5.complete',
    plate: 'CHAPTER FIVE · COMPLETE',
    toasts: ['✦ the lane vouches for you', 'the Malabar Star loads at dusk'],
  },
};
