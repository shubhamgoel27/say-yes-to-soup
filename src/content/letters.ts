import type { LetterDef } from './schema';

/**
 * Mail from home: letters written by villagers from earlier chapters, waiting
 * at post offices and harbor counters down the road. Several defs may share an
 * id; the first whose `when` passes is the one that was "actually written,"
 * so letters react to what the player really did.
 */
export const LETTERS: LetterDef[] = [
  // Pilar, bridge magnate of Ch'aska Pampa. Her prose style is invoices.
  {
    id: 'home.pilar',
    from: 'Pilar, Bridge Authority (co-owner: you)',
    when: { has: ['pilar.promoted'] },
    body: [
      'Dear business partner. The bridge is fine. Do not worry about the bridge.',
      'Revenue is up. I raised the toll to TWO facts because a tourist argued with the sign. Your half of the profits is being kept safe in a tin I will not describe in writing.',
      'The dog walked across seventeen times today. As security he is free. As a customer he owes us.',
      'Do not forget the sea thing. A weird one. This is also an invoice.',
    ],
  },
  {
    id: 'home.pilar',
    from: 'Pilar, Bridge Authority',
    body: [
      'Dear traveler. You crossed my bridge and paid one (1) fact. This letter is to inform you the fact has depreciated. You may owe another on your return.',
      'The village is fine. Aurelio says hello in the slow way where it takes an hour.',
      'Do not forget the sea thing. A weird one. The weirder the better. I have a shelf.',
    ],
  },
  // Aurelio, who says hello the slow way.
  {
    id: 'home.aurelio',
    from: 'Aurelio',
    when: { has: ['page.people.nani'] },
    body: [
      'The weather has been asking about you. Cold at night, honest by noon. The harvest will be what it will be.',
      'Your grandmother used to send letters with no news in them at all. I understood them fine. This is one of those.',
      'The soup is on when you pass this way again. It is always on. That is the trick of it.',
    ],
  },
  {
    id: 'home.aurelio',
    from: 'Aurelio',
    body: [
      'The weather has been asking about you. Cold at night, honest by noon.',
      'Walk far, greet first, eat what is offered. The rest arranges itself.',
      'The soup is on when you pass this way again. It is always on.',
    ],
  },
];

/** The first def for `id` whose condition holds; content authoring guarantees
 * an unconditional fallback per id. */
export function pickLetter(
  letters: LetterDef[],
  id: string,
  check: (when?: { has?: string[]; not?: string[] }) => boolean,
): LetterDef | undefined {
  return letters.find((l) => l.id === id && check(l.when));
}
