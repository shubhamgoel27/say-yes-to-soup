import type { Cond } from './schema';
import { DIG_SPOTS, NODES, NPCS, REGION_MAPS, type WorldTask } from './world';

/**
 * What Nani's red thread is allowed to point at, as pure functions of the
 * flags. The engine asks these at runtime and the tests ask the very same
 * questions while walking a whole journey, so the thread cannot be honest in
 * one and wrong in the other.
 *
 * The rule the thread lives by: it only ever points somewhere that answers.
 * A person counts as somewhere only while talking to them would change
 * something (a flag, a page, an errand, a letter, a journey). A task whose
 * people have all run out of things to say is finished in every way that
 * matters, so it stops being a task, and the next one takes the chip.
 */

/** The slice of GameState the guide reads. */
export type GuideState = {
  has(flag: string): boolean;
  check(cond: Cond | undefined): boolean;
  readonly errand: string | null;
};

const NPC_BY_ID = new Map(NPCS.map((n) => [n.id, n] as const));

/** Would applying these effects, right now, change anything at all? */
function effectsMatter(effects: string[] | undefined, state: GuideState): boolean {
  // Another go at a game already won is a pleasure, never a direction.
  if (effects?.includes('set:replay.mode')) return false;
  for (const eff of effects ?? []) {
    const sep = eff.indexOf(':');
    const kind = sep < 0 ? eff : eff.slice(0, sep);
    const arg = sep < 0 ? '' : eff.slice(sep + 1);
    if (kind === 'set' && !state.has(arg)) return true;
    if (kind === 'clear' && state.has(arg)) return true;
    if (kind === 'journal' && !state.has(`page.${arg}`)) return true;
    if (kind === 'errand' && state.errand !== arg) return true;
    if (kind === 'errand.done' && state.errand !== null) return true;
    if ((kind === 'letter' || kind === 'letterread') && !state.has(`letter.read.${arg}`)) return true;
    // A conversation that ends in a journey is the way onward, always.
    if (kind === 'travel') return true;
  }
  return false;
}

/** Does anything reachable from this node, by any open branch, matter? */
export function nodeMatters(nodeId: string, state: GuideState, seen = new Set<string>()): boolean {
  if (seen.has(nodeId)) return false;
  seen.add(nodeId);
  const node = NODES[nodeId];
  if (!node) return false;
  if (effectsMatter(node.effects, state)) return true;
  if (node.next && nodeMatters(node.next, state, seen)) return true;
  return (node.choices ?? []).some((c) => state.check(c.when) && nodeMatters(c.goto, state, seen));
}

/**
 * True when talking to this villager right now would move anything forward.
 * False for anyone absent by the flags, and for anyone down to their idle
 * line: pointing there only replays the line they already said.
 */
export function hasNews(npcId: string, state: GuideState): boolean {
  const npc = NPC_BY_ID.get(npcId);
  if (!npc || !state.check(npc.when)) return false;
  const entry = npc.entry.find((e) => state.check(e.when));
  return !!entry && nodeMatters(entry.node, state);
}

/**
 * Where a task's `at` points for these flags. Fixed, except on the terraces:
 * a task aimed at one of Justina's mounds follows the mounds still waiting,
 * so the loop never settles on earth already turned.
 */
export function atFor(task: { at?: [string, number, number] }, state: GuideState): [string, number, number] | undefined {
  const at = task.at;
  if (!at || at[0] !== 'village') return at;
  if (!DIG_SPOTS.some((s) => s.at[0] === at[1] && s.at[1] === at[2])) return at;
  const next = DIG_SPOTS.find((s) => !state.has(s.flag));
  return next ? ['village', next.at[0], next.at[1]] : at;
}

/** The people a task names, as a list, whether it names one or a crowd. */
export function whoOf(task: { who?: string | string[] }): string[] {
  if (task.who === undefined) return [];
  return typeof task.who === 'string' ? [task.who] : task.who;
}

/** The people a task still points at: only those with something new. */
export function liveWho(task: { who?: string | string[] }, state: GuideState): string[] {
  return whoOf(task).filter((id) => hasNews(id, state));
}

/**
 * The open threads, most pressing first: in the live chapter, conditions
 * met, and (for a task that names people) somebody named still has news.
 * The chip shows the first; the thread follows the first that resolves.
 */
export function openTasks(tasks: WorldTask[], state: GuideState): WorldTask[] {
  return tasks.filter(
    (t) =>
      !t.supersededBy.some((f) => state.has(f)) &&
      state.check(t.when) &&
      (t.who === undefined || liveWho(t, state).length > 0),
  );
}

// ------------------------------------------------------------------ doors

/** Doors out of a map, from the authored data plus the runtime east gate. */
export function doorsFrom(mapId: string, state: GuideState): { to: string; at: [number, number] }[] {
  const doors: { to: string; at: [number, number] }[] = [];
  for (const t of REGION_MAPS[mapId]?.triggers ?? []) {
    if (t.type === 'door') doors.push({ to: t.to, at: [t.at[0], t.at[1]] });
  }
  if (mapId === 'village' && state.has('story.complete')) {
    doors.push({ to: 'east-road', at: [41, 16] }, { to: 'east-road', at: [42, 16] });
  }
  return doors;
}

/** BFS over the door graph: the next map to step into on the way from
 * `from` to `target`, or null when no chain of doors connects them. */
export function nextMapToward(from: string, target: string, state: GuideState): string | null {
  if (target === from) return null;
  const prev = new Map<string, string>();
  const queue = [from];
  const seen = new Set([from]);
  for (let head = 0; head < queue.length; head++) {
    const cur = queue[head]!;
    for (const d of doorsFrom(cur, state)) {
      if (seen.has(d.to)) continue;
      seen.add(d.to);
      prev.set(d.to, cur);
      if (d.to === target) {
        let at = target;
        while (prev.get(at) !== from) at = prev.get(at) ?? from;
        return at;
      }
      queue.push(d.to);
    }
  }
  return null;
}

/** The home map of a villager on the roster. */
export function npcMap(id: string): string | undefined {
  return NPC_BY_ID.get(id)?.map;
}
