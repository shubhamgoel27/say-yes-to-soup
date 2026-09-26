/**
 * The shared contract between the panels and the game around them.
 *
 * RUN.hard: whether the current panel run is the hard telling. Set by the
 * replay flow before a panel opens; panels read it once at open and tighten
 * their numbers (faster, narrower, longer, fewer hints). First-time story
 * runs are never hard.
 *
 * coach(): a panel's own diagnosis when a run ends short of the bar. One
 * specific sentence: what went wrong and what to do instead, in the game's
 * warm voice ("You pulled while the pigeons crossed; wait for open sky").
 * The next how-to offer for that game shows the line, so a player who
 * failed is re-armed, not just re-invited. Filing a coach line is also the
 * verdict: a hard run that ends with one filed was not clean.
 *
 * tip(): the same kind of sentence for a run that was WON, wobbles and all.
 * It rides to the next how-to card like a coach line but is never a fault:
 * the hard telling's star goes to winning inside what its card forgives.
 *
 * freshRun(): a fresh run. Every (re)start of a panel, from the engine or
 * from the panel's own "Space, and again", begins with nothing filed, so
 * advice from a run the player already put behind them cannot cost the
 * next one its star.
 */
export const RUN = { hard: false };

const faults = new Map<string, string>();
const tips = new Map<string, string>();

/** Record why the last run of `startFlag`'s game fell short. Blank text is
 * never a verdict: it files nothing and retires any fault still standing. */
export function coach(startFlag: string, text: string): void {
  if (!text.trim()) freshRun(startFlag);
  else faults.set(startFlag, text);
}

/** Advice from a run that was won anyway: shown on the next card, never a fault. */
export function tip(startFlag: string, text: string): void {
  if (!text.trim()) tips.delete(startFlag);
  else tips.set(startFlag, text);
}

/**
 * A fresh run begins. Nothing filed by an earlier run is held against it;
 * the words themselves are kept as a tip, so a player who restarts and then
 * steps away still finds the advice waiting on the next card.
 */
export function freshRun(startFlag: string): void {
  const owed = faults.get(startFlag);
  faults.delete(startFlag);
  if (owed) tips.set(startFlag, owed);
}

/**
 * Whether the run fell short, without spending the advice. The completion
 * flow asks this one question: a hard run that filed nothing was a clean run.
 */
export function peekCoach(startFlag: string): boolean {
  return faults.has(startFlag);
}

/** The advice owed to the next attempt (a fault first, else a tip), consumed on read. */
export function takeCoach(startFlag: string): string | null {
  const t = faults.get(startFlag) ?? tips.get(startFlag) ?? null;
  faults.delete(startFlag);
  tips.delete(startFlag);
  return t;
}

/** How a finished panel run lands with the game around it. */
export type RunVerdict = 'story' | 'joy' | 'star' | 'short';

/**
 * The completion flow's one decision, kept pure so it can be tested. A first
 * story run narrates; a replay is for joy; a hard replay earns its star when
 * nothing was filed against it, and otherwise comes back to the card.
 */
export function verdictFor(startFlag: string, replay: boolean, wasHard: boolean): RunVerdict {
  if (!replay) return 'story';
  if (!wasHard) return 'joy';
  return peekCoach(startFlag) ? 'short' : 'star';
}

/** Whether every game that has a hard telling now wears its star. */
export function everyStar(games: readonly { flag: string; hardHow?: string }[], has: (f: string) => boolean): boolean {
  const hard = games.filter((g) => g.hardHow);
  return hard.length > 0 && hard.every((g) => has(`hard.${g.flag}`));
}

/**
 * Tick every panel, unless the pause strip is up. The strip is a real pause:
 * timers, fuel, spoilage, and clocks all wait while the player decides.
 */
export function tickPanels(panels: readonly { tick?(dt: number): void }[], dt: number, paused: boolean): void {
  if (paused) return;
  for (const p of panels) p.tick?.(dt);
}
