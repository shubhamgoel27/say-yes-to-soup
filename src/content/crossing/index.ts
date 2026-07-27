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
      title: 'Ben’s adobo',
      howTo: [
        'Ben calls for a thing. Arrows find it on his shelf, Space feeds it to the pot.',
        'Reach for the wrong jar and nothing breaks. He laughs, hands you the right one, and the pot moves on.',
        'Lid last. Then watch the sauce go down and lift the pot off when the smell turns sweet and dark.',
        'Burn it and Ben just scrubs the pot out. He has burnt more dinners than you will ever cook.',
      ],
      make: (root, audio) => new GalleyPanel(root, audio as AudioBus),
    },
    {
      flag: 'c3.stars.start',
      doneNode: 'c3.starsdone',
      title: 'The dark bow',
      howTo: [
        'Hana names something in the sky. Arrows walk your eyes across it; Space says "there."',
        'Land on it and the lines ink themselves in, and she tells you whose sky it is.',
        'Nothing can be lost up here. Look in the wrong place and she only says warmer.',
      ],
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
  // Bollards are essential deck seating; the galley stools face the pots.
  sitKinds: ['stool', 'bollard'],
  sitLines: {
    ship: [
      'The wake unrolls astern, a white road that closes itself as fast as the ship can lay it.',
      'A flying fish bursts out, sprints on air for one silver breath, and hands itself back to the sea.',
      'The horizon rides at the same distance it kept yesterday. It is not that kind of line.',
      'Under everything, the engine keeps its patient heartbeat. You feel it in the steel before you hear it.',
      'An albatross holds station off the stern, adjusting nothing, spending nothing.',
      'Fourteen knots of west, and la mar files past like she has somewhere to be. She does not. She is the somewhere.',
    ],
    galley: [
      'The stockpot mutters on its hook. It has been becoming something since Callao and will not be hurried.',
      'Steam writes brief rivers down the white steel wall, and the wall forgets them.',
      'From this stool the whole ship is a smell: garlic, rice, hot metal, coffee strong enough to stand a watch.',
      'The tray rack waits by the hatch. In a few hours the village eats again, in shifts, the way it sleeps.',
      'Ben wipes a counter that is already clean. A tidy galley, he says, is a tidy crossing.',
    ],
  },
  arrival: { map: 'ship', node: 'c3.arrive', flag: 'c3.arrived' },
  completion: {
    flag: 'c3.complete',
    plate: 'CHAPTER THREE · COMPLETE',
    toasts: ['✦ the whole crew vouches for you', 'Shionoura rises with the sun'],
  },
};
