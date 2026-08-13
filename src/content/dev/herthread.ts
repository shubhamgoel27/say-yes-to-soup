import type { NodeMap, NpcExtension } from '../schema';

/**
 * The player's own thread, braided under Her.
 *
 * Four short scenes, spread from the second chapter to the ninth, in which
 * Chasca asks a small question with her hands full and the player answers it
 * a little differently each time. The arc is a chord, not a melody: first the
 * leave is defended, then the arithmetic stops working, then the defense is
 * simply not offered, and finally the journal is admitted to be a place to be.
 *
 * The pages live in each chapter's own journal file so the Her tab reads in
 * play order. The nodes live here, with Chapter One, because the thread is the
 * player's and the player is the one thing every chapter shares. Each scene
 * hangs off that chapter's Chasca photograph, so it is earned, arrives while
 * there is still road left, and never front-runs her own introduction.
 */
export const HER_NODES: NodeMap = {
  // La Caleta: the dates still sound like an argument you have won.
  'her.you.caleta': {
    lines: [
      { text: 'She is winding film back into its canister with her thumb, not looking at it.' },
      { who: 'Chasca', text: 'How long did they give you?' },
      { text: 'You answer with the dates, the banked days, the handover folder. All of it, unasked for.' },
      { text: 'She says huh, and writes a frame number on the lid.' },
    ],
    effects: ['journal:her.you.leave'],
  },

  // Busan: the sum has stopped coming out the same way twice.
  'her.you.busan': {
    lines: [
      { text: 'She is labelling a canister against her knee, tongue between her teeth.' },
      { who: 'Chasca', text: 'An ocean and a market since you gave me those dates. Do they still work?' },
      { text: 'You do the arithmetic while she writes. Twice, and it comes out different both times.' },
    ],
    effects: ['journal:her.you.arithmetic'],
  },

  // Delhi: the correction does not arrive, and nothing falls over.
  'her.you.delhi': {
    lines: [
      { text: 'She is drying the lens on the inside hem of her shirt, the last dry cloth on this roof.' },
      { who: 'Chasca', text: 'The kite man asked me what you do. I said you walk. Was that wrong?' },
      { text: 'You wait for yourself to correct her. You are still waiting when she changes the subject.' },
    ],
    effects: ['journal:her.you.answer'],
  },

  // Sicily: the question you have been outrunning, asked by somebody idly.
  'her.you.sicily': {
    lines: [
      { text: 'She is sharpening a pencil with a fish knife, catching the shavings in her lap.' },
      { who: 'Chasca', text: 'When her journal is full, what then? I ask everybody this. Nobody answers and I keep asking.' },
      { text: 'You say something about the last pages. She nods, satisfied, and goes back to the pencil.' },
    ],
    effects: ['journal:her.you.somewhere'],
  },
};

/**
 * Prepended to each chapter's own Chasca, gated on her photograph there, so
 * the scene lands on the visit after the shutter and only ever once.
 */
export const HER_EXTENSIONS: NpcExtension[] = [
  {
    npcId: 'chascaC',
    entry: [{ when: { has: ['photo.c2.pier'], not: ['page.her.you.leave'] }, node: 'her.you.caleta' }],
  },
  {
    npcId: 'chascaC5',
    entry: [
      { when: { has: ['photo.c5.alley'], not: ['page.her.you.arithmetic'] }, node: 'her.you.busan' },
    ],
  },
  {
    npcId: 'chascaC11',
    entry: [
      { when: { has: ['photo.c11.kites'], not: ['page.her.you.answer'] }, node: 'her.you.delhi' },
    ],
  },
  {
    npcId: 'chascaC8',
    entry: [
      { when: { has: ['photo.c8.stones'], not: ['page.her.you.somewhere'] }, node: 'her.you.sicily' },
    ],
  },
];
