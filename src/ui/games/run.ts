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
 * failed is re-armed, not just re-invited.
 */
export const RUN = { hard: false };

const coachLines = new Map<string, string>();

/** Record why the last run of `startFlag`'s game fell short. */
export function coach(startFlag: string, text: string): void {
  coachLines.set(startFlag, text);
}

/** The advice owed to the next attempt, consumed on read. */
export function takeCoach(startFlag: string): string | null {
  const t = coachLines.get(startFlag) ?? null;
  coachLines.delete(startFlag);
  return t;
}
