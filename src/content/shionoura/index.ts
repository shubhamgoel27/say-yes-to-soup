import type { ChapterDef } from '../schema';
import type { AudioBus } from '../../engine/audio';
import { SHIONOURA_EVENTS, SHIONOURA_EXAMINES, SHIONOURA_NODES, SHIONOURA_NPCS } from './npcs';
import { SHIONOURA_JOURNAL, SHIONOURA_TASKS } from './journal';
import { MINSHUKU_MAP, SHIONOURA_MAP } from './map';
import { RECALL } from './recall';
import { KingyoPanel } from '../../ui/games/shionoura';

/** Chapter Four: Shionoura, where the Inland Sea keeps festival time. */
export const CHAPTER: ChapterDef = {
  id: 'shionoura',
  maps: [SHIONOURA_MAP, MINSHUKU_MAP],
  npcs: SHIONOURA_NPCS,
  nodes: SHIONOURA_NODES,
  examines: SHIONOURA_EXAMINES,
  events: SHIONOURA_EVENTS,
  journal: SHIONOURA_JOURNAL,
  tasks: SHIONOURA_TASKS,
  errands: [{ id: 'fumi-tai', label: "Fumi's tai, held at Daisuke's stall on the quay" }],
  letters: [
    // Pilar: the Museum of the Sea opens. Prose style: invoices.
    {
      id: 'c4.pilar',
      from: 'Pilar, Museum of the Sea (director; co-owner: you)',
      when: { has: ['c2.gift.sent'] },
      body: [
        'Dear business partner. The MUSEUM OF THE SEA is open. It is the bridge shed, but with a sign, which is what a museum is.',
        'Your sea thing arrived by post and is EXHIBIT NUMBER ONE. It has a label and a rope in front of it. The rope is decorative. Do not touch it anyway.',
        'Admission is one fact about the sea. Aurelio paid with a fact about fog. The dog attends free but has learned nothing.',
        'Send more exhibits. Japan sounds like a sea country. This is a purchase order, except you are paying.',
      ],
    },
    {
      id: 'c4.pilar',
      from: 'Pilar, Museum of the Sea (director)',
      body: [
        'Dear traveler. I have opened the MUSEUM OF THE SEA. It is the bridge shed, but with a sign, which is what a museum is.',
        'Admission is one fact about the sea. Attendance is four people and one dog. Revenue is eleven facts. We are doing extremely well.',
        'The collection currently has one shelf and zero objects on it. This is called potential. Japan sounds like a sea country. You know what to do.',
      ],
    },
    // Marisol, fishmonger to fishmonger.
    {
      id: 'c4.marisol',
      from: 'Marisol, the stall on the malecón',
      when: { has: ['c2.casero'] },
      body: [
        'Casero! The stall misses you. The bonito came in the week you left, of course. La mar has a sense of humor, pe.',
        'If Japan has a fish person, give them my respects and study their scale. A fishmonger can be judged entirely by the state of her scale.',
        'Your yapa is waiting on account. It does not expire. That is the whole point of it, pe.',
      ],
    },
    {
      id: 'c4.marisol',
      from: 'Marisol, the stall on the malecón',
      body: [
        'You bought fish from me once and then crossed an ocean, which is the most dramatic exit any customer has made from this stall, pe.',
        'If Japan has a fish person, give them my respects. Fish people are the same people everywhere: up before the gulls, honest by necessity.',
        'Come back someday at noon. The ceviche will explain everything the letters cannot.',
      ],
    },
  ],
  games: [
    {
      flag: 'c4.kingyo.start',
      doneNode: 'c4.kingyo.won',
      make: (root, audio) => new KingyoPanel(root, audio as AudioBus),
    },
  ],
  recall: RECALL,
  meta: {
    shionoura: { scene: 'outdoor', mood: 'setouchi' },
    minshuku: { scene: 'interior', mood: 'interior' },
  },
  moods: {
    // A soft inland-sea summer: humid pearl light, green hills, no hard edges.
    setouchi: {
      top: 'rgba(190,222,232,0.13)',
      mid: 'rgba(255,250,228,0.05)',
      bottom: 'rgba(150,196,186,0.08)',
      vig: 0.22,
      ambient: 0xf2f4e8,
    },
    // Festival night, if the integrator swaps it in after dusk: lantern paper
    // orange low, deep indigo above, clouds stood down for the star river.
    tanabataNight: {
      top: 'rgba(28,36,84,0.30)',
      mid: 'rgba(46,44,92,0.16)',
      bottom: 'rgba(120,70,60,0.14)',
      vig: 0.4,
      glow: 'rgba(255,176,96,0.10)',
      ambient: 0x9296c2,
      noClouds: true,
    },
  },
  arrival: { map: 'shionoura', node: 'c4.arrive', flag: 'c4.arrived' },
  completion: {
    flag: 'c4.complete',
    plate: 'CHAPTER FOUR · COMPLETE',
    toasts: ['✦ your wish hangs on the town bamboo', 'the morning boat to Busan is provisioned'],
  },
};
