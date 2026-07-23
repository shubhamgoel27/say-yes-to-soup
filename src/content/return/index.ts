import type { ChapterDef } from '../schema';
import { RETURN_EVENTS, RETURN_EXAMINES, RETURN_EXTENSIONS, RETURN_NODES, RETURN_NPCS } from './npcs';
import { RETURN_JOURNAL, RETURN_TASKS } from './journal';
import { RECALL } from './recall';

/**
 * Chapter Ten: the Return. No new maps; the ship docks at La Caleta and the
 * player walks the whole first road backward, up through La Bajada and the
 * east pass, home to Ch'aska Pampa. Everything is reunion. The album is pure
 * dialogue (Chasca turns the pages), the last journal page is written at the
 * well, and one young traveler at the east gate carries the trick onward.
 */
export const CHAPTER: ChapterDef = {
  id: 'return',
  maps: [],
  npcs: RETURN_NPCS,
  npcExtensions: RETURN_EXTENSIONS,
  nodes: RETURN_NODES,
  examines: RETURN_EXAMINES,
  events: RETURN_EVENTS,
  journal: RETURN_JOURNAL,
  tasks: RETURN_TASKS,
  letters: [
    {
      // The honest deferral of the Australia chapter: a promise, not a hook.
      id: 'australia.hook',
      from: 'Ruth, from a veranda in Western Australia',
      when: { has: ['wish.road'] },
      body: [
        'You told me once you wished for the road to keep going. I have thought about that wish from the far side of my own country, which is a large thing to be far side of.',
        'People ask why I never posted you our stories. Here is the truth: the oldest ones are not mine to mail. They are told, on country, by the people they belong to. An envelope flattens them.',
        'So this is not an invitation in an envelope. It is the promise of one. Come south someday and hear them told right, by the right voices, with the sea doing the punctuation.',
        'The veranda faces the water. The kettle is on. It is always on. I hear that trick travels.',
      ],
    },
    {
      id: 'australia.hook',
      from: 'Ruth, from a veranda in Western Australia',
      body: [
        'We met where travelers meet: a galley line, a long wait, somewhere between two ports neither of us was from. You were the one with the journal.',
        'People ask why I never posted you our stories. Here is the truth: the oldest ones are not mine to mail. They are told, on country, by the people they belong to. An envelope flattens them.',
        'Come south someday and hear them told right. Until then I will not spoil them, and you will not hurry. That felt like a deal you would take.',
        'The veranda faces the water. The kettle is on. It is always on. I hear that trick travels.',
      ],
    },
  ],
  games: [],
  recall: RECALL,
  meta: {},
  arrival: {
    map: 'la-caleta',
    node: 'c10.arrive',
    flag: 'c10.arrived',
    when: { has: ['c9.complete'] },
  },
  completion: {
    flag: 'story.end',
    plate: 'ELSEWHERE',
    toasts: ['✦ the journal is full', 'thank you for walking slowly'],
  },
};
