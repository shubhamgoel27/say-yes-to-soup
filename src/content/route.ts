import type { Cond } from './schema';

/**
 * Nani's route, as she drew it inside the journal's front cover in 1974:
 * a line of place names, each with how you get there and one note in her
 * hand. The player's progress inks over her pencil. Stops past Sicily have
 * no note, because she stopped writing; the journal shows that honestly.
 */
export type RouteStop = {
  id: string;
  name: string;
  /** The hop that reaches this stop from the one before. */
  hop: string;
  /** Her 1974 pencil note beside the name. Absent = she never wrote one. */
  nani?: string;
  /** You have set foot there. Empty cond = the journey's start. */
  arrived?: Cond;
  /** The chapter's story is done there. */
  complete?: Cond;
};

export const ROUTE: RouteStop[] = [
  {
    id: 'chaska-pampa',
    name: "Ch'aska Pampa",
    hop: 'begin where the stars graze',
    nani: 'Say yes to soup. The whole trick is here if I look slowly enough.',
    complete: { has: ['story.complete'] },
  },
  {
    id: 'la-caleta',
    name: 'La Caleta',
    hop: 'down La Bajada, on foot',
    nani: 'The desert walks into the sea and nobody apologizes. Fish at noon ONLY.',
    arrived: { has: ['c2.arrived'] },
    complete: { has: ['c2.complete'] },
  },
  {
    id: 'crossing',
    name: 'the Pacific',
    hop: 'working passage, cargo ship',
    nani: 'Thirty-one days of water. The crew is a village that floats. Learn the galley first.',
    arrived: { has: ['c3.arrived'] },
    complete: { has: ['c3.complete'] },
  },
  {
    id: 'shionoura',
    name: 'Shionoura',
    hop: 'the Inland Sea, at last',
    nani: 'Wash BEFORE the bath. Bring gifts everywhere. The lemons grow on islands.',
    arrived: { has: ['c4.arrived'] },
    complete: { has: ['c4.complete'] },
  },
  {
    id: 'busan',
    name: 'Busan',
    hop: 'overnight ferry from Shimonoseki',
    nani: 'The women run the fish. Someone gave me one too many again. It follows me.',
    arrived: { has: ['c5.arrived'] },
    complete: { has: ['c5.complete'] },
  },
  {
    id: 'kerala',
    name: 'the backwaters',
    hop: 'south and west by sea, to Kochi',
    nani: 'Arrive before the rain if you can. Stay for the rain regardless.',
    arrived: { has: ['c6.arrived'] },
    complete: { has: ['c6.complete'] },
  },
  {
    id: 'zanzibar',
    name: 'Zanzibar',
    hop: 'the old monsoon road, west',
    nani: 'Pole pole. A whole coast that knows my trick. I may never leave.',
    arrived: { has: ['c7.arrived'] },
    complete: { has: ['c7.complete'] },
  },
  {
    id: 'sicily',
    name: 'Sicily',
    hop: 'north through the canal',
    nani: 'Granita is breakfast. The mountain is a woman. The table here holds everyo',
    arrived: { has: ['c8.arrived'] },
    complete: { has: ['c8.complete'] },
  },
  {
    id: 'oaxaca',
    name: 'the valley',
    hop: 'across one more ocean',
    arrived: { has: ['c9.arrived'] },
    complete: { has: ['c9.complete'] },
  },
  {
    id: 'home',
    name: 'home',
    hop: 'the same road, upward',
    arrived: { has: ['c10.arrived'] },
    complete: { has: ['story.end'] },
  },
];
