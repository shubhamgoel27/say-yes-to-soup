import type { ChapterDef } from '../schema';
import type { AudioBus } from '../../engine/audio';
import { DIG_SPOTS, EVENT_NODES, EXAMINES, NODES, NPCS } from './npcs';
import { ERRANDS, JOURNAL, TASKS } from './journal';
import { RECALL } from './recall';
import { VILLAGE_MAP } from './testmap';
import { CASA_CARMEN_MAP, CHICHERIA_MAP } from './interiors';
import { EAST_ROAD_MAP } from './eastroad';
import { LA_BAJADA_MAP } from './labajada';
import { WatiaPanel } from '../../ui/games/andes';
import { WeavePanel } from '../../ui/weave';

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
  games: [
    {
      flag: 'weave.start',
      doneNode: 'carmen.woven',
      title: 'The loom',
      howTo: [
        'Watch the colors Carmen calls, one row at a time.',
        'Then call them back with the arrows, in order.',
        'A slipped thread is nothing. She just calls the row again.',
      ],
      make: (root, audio) => new WeavePanel(root, audio as AudioBus),
    },
    {
      flag: 'watia.start',
      doneNode: 'watia.finish',
      title: 'The watia',
      howTo: [
        'Big clods hold the base, smaller ones climb the dome.',
        'Arrows pick a spot; Space sets the clod where a gap waits.',
        'Close the earthen oven and the papas cook themselves.',
      ],
      make: (root, audio) => new WatiaPanel(root, audio as AudioBus),
    },
  ],
  recall: RECALL,
  meta: {
    village: { scene: 'outdoor', mood: 'warm' },
    chicheria: { scene: 'interior', mood: 'interior' },
    'casa-carmen': { scene: 'interior', mood: 'interior' },
    'east-road': { scene: 'road', mood: 'cool' },
    'la-bajada': { scene: 'road', mood: 'dusty' },
  },
  // Sitting: the chichería stools count, so Teófilo's room can be sat in.
  sitKinds: ['stool'],
  sitLines: {
    village: [
      "The well rope creaks its one note. Rosa's flag decides, slowly, which way the wind is.",
      'The dog completes a circuit of the plaza and logs you as present and accounted for.',
      'Smoke from four kitchens, straight as loom threads. You can tell whose fire is whose now.',
      'On the bridge, Pilar renegotiates something with a chicken. The chicken appears to be winning.',
      "The terraces climb the hill row by row, a green ledger of somebody's whole life of afternoons.",
      'Two people have already nodded at you like sitting here is a job done well.',
    ],
    chicheria: [
      'Teófilo holds court from the far table. The story has three endings so far and refuses to choose.',
      "The chomba mutters to itself in the corner, fermenting somebody's next Tuesday.",
      'A cuy crosses the floor with the confidence of a landlord.',
      'Someone pours; the first splash finds the packed earth. Nobody looks down. Everybody noticed.',
      'The room laughs a beat before the joke lands. They have heard it for forty years. That is why.',
    ],
    'east-road': [
      "Faustino's fire burns exactly as much as it should. The wind keeps trying to make it a debate.",
      'A llama hums somewhere up the pass, holding the herd together with one long note.',
      'The ichu bends and recovers, bends and recovers. The wind is reading the pampa aloud.',
      'From here the road runs both ways: back to soup, and down to the whole rest of the world.',
      'The apacheta stands at the edge of sight, patiently getting taller.',
    ],
  },
  // The gate celebration and dig spots keep their bespoke wiring in main.
};

export { DIG_SPOTS };
