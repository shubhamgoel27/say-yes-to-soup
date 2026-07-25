import type { ChapterDef, LetterDef } from '../schema';
import type { AudioBus } from '../../engine/audio';
import { SICILY_EVENTS, SICILY_EXAMINES, SICILY_NODES, SICILY_NPCS } from './npcs';
import { SICILY_JOURNAL, SICILY_TASKS } from './journal';
import { CIRCOLO_MAP, SICILY_MAP } from './map';
import { RECALL } from './recall';
import { PisciPanel, ScopaPanel } from '../../ui/games/sicily';

/**
 * Mail waiting at the POSTE window. Pilar's bridge empire has reached the
 * stage of civic appointments; Mariamma writes the way she cooks, generously.
 */
const SICILY_LETTERS: LetterDef[] = [
  {
    id: 'sicily.pilar',
    from: 'Pilar, Mayor of the Bridge (electorate: nine)',
    when: { has: ['pilar.gift.puffer'] },
    body: [
      'Dear business partner. Administrative news: the dog has been named DEPUTY. There was a ceremony. He ate the sash, which legally completes it.',
      'The Museum of the Sea thrives. Your permanently astonished puffer fish remains the main exhibit. Visitors ask if it is real. I invoice the question.',
      'As deputy, the dog now collects tolls when I am at school. Collection is down eighty percent but morale, as an electorate, is up.',
      'Send nothing this time. The museum is full. This is not sentiment, it is a storage report.',
    ],
  },
  {
    id: 'sicily.pilar',
    from: 'Pilar, Mayor of the Bridge (electorate: nine)',
    body: [
      'Dear business partner. Administrative news: the dog has been named DEPUTY. There was a ceremony. He ate the sash, which legally completes it.',
      'As deputy, he now collects tolls when I am at school. Collection is down eighty percent but morale, as an electorate, is up.',
      'The Museum of the Sea still awaits your promised weird thing, if the first one got lost at sea. Deputies cannot read invoices. You can.',
    ],
  },
  {
    id: 'sicily.mariamma',
    from: 'Mariamma, from the backwaters',
    body: [
      'Child. Joseph writes that his ship crossed yours in a canal so narrow the cooks argued recipes across the water. I choose to believe him.',
      'The rains came proper this year. The house held, the chaya is sweet, and I have taught the neighbor girl your way of eating with too much wonder.',
      'Wherever this finds you, someone there is also somebody’s mother. Let her feed you and think of me. That is how we manage the distance.',
    ],
  },
];

/** Chapter Eight: the black shore under 'a Muntagna. */
export const CHAPTER: ChapterDef = {
  id: 'sicily',
  maps: [SICILY_MAP, CIRCOLO_MAP],
  npcs: SICILY_NPCS,
  nodes: SICILY_NODES,
  examines: SICILY_EXAMINES,
  events: SICILY_EVENTS,
  journal: SICILY_JOURNAL,
  tasks: SICILY_TASKS,
  errands: [{ id: 'turi-pisci', label: 'Nonna Concetta’s swordfish, iced at Turi’s stall' }],
  letters: SICILY_LETTERS,
  games: [
    {
      flag: 'c8.scopa.start',
      doneNode: 'c8.scopa.done',
      make: (root, audio) => new ScopaPanel(root, audio as AudioBus),
    },
    {
      flag: 'c8.pisci.start',
      doneNode: 'c8.pisci.done',
      make: (root, audio) => new PisciPanel(root, audio as AudioBus),
    },
  ],
  recall: RECALL,
  meta: {
    sicily: { scene: 'outdoor', mood: 'ciclopi', moodDusk: 'passeggiata' },
    circolo: { scene: 'interior', mood: 'interior' },
  },
  moods: {
    // Hard blue summer: glare off the water, black shadows at noon.
    ciclopi: {
      top: 'rgba(110,185,245,0.13)',
      mid: 'rgba(255,252,238,0.05)',
      bottom: 'rgba(30,45,90,0.07)',
      vig: 0.2,
      ambient: 0xf4faff,
    },
    // The passeggiata hour: gold pouring down the lungomare. The integrator
    // may swap the exterior to this by clock, as la-caleta does with glare.
    passeggiata: {
      top: 'rgba(255,196,110,0.16)',
      mid: 'rgba(255,176,96,0.07)',
      bottom: 'rgba(120,70,140,0.10)',
      vig: 0.28,
      ambient: 0xffdcae,
    },
  },
  arrival: { map: 'sicily', node: 'c8.arrive', flag: 'c8.arrived' },
  completion: {
    flag: 'c8.complete',
    plate: 'CHAPTER EIGHT · COMPLETE',
    toasts: ['✦ the town signs you out, with regret', 'a ship for Veracruz exists, in principle'],
  },
};
