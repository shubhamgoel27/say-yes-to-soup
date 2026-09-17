/**
 * Nani's margin voice, one line per chapter, spoken by the red thread.
 *
 * The first time the thread is asked in a chapter (the N key, or a villager
 * pointing the way), her line follows the unspool as a quiet handwritten
 * toast, once, ever. The arc is deliberate: early she is practical about the
 * wool, the middle grows companionable, and only the late chapters admit what
 * the thread has been the whole time. Keep every line under 110 characters so
 * the toast holds it, and never use an em dash; she didn't.
 */
export const WHISPERS: Record<string, string> = {
  'chaska-pampa':
    "Cochineal red. Carmen's dye takes three days and keeps for fifty years. Trust nothing that fades faster.",
  'la-caleta':
    'The thread will learn salt before you do. Shake it out gently; a little harbor stays in the wool. Good.',
  crossing:
    'Even mid-ocean it knows where the galley is. We are alike that way, the thread and I.',
  shionoura:
    'They hang wishes on bamboo here, straight at heaven. A thread with somewhere to point is a wish that works.',
  busan:
    "Follow it through the stalls. If you come back with one fish too many, that was not the thread's doing.",
  kerala:
    'Wet wool smells like a dog with good intentions. Walk anyway. The rain here is part of the directions.',
  delhi:
    'Let it spool slowly through the lanes. Wherever it stops, somebody will feed you. Do not argue twice.',
  zanzibar:
    'Pole pole. The thread has never once hurried, and it has never once been late. I took notes.',
  sicily:
    'My pencil stopped on this island, mid-word. The thread kept going. Wool does not run out of page.',
  oaxaca:
    'They keep kindness in a ledger here, and the page holds for fifty years. This thread is my line in it.',
  return:
    'Home again. The thread has nothing left to point at, except everything. Ask it anyway; I always did.',
};
