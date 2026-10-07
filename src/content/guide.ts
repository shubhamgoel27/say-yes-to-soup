import type { Cond } from './schema';
import { CHAPTERS, DIG_SPOTS, LETTERS, NODES, NPCS, REGION_MAPS, type WorldTask } from './world';

/**
 * What Nani's red thread is allowed to point at, as pure functions of the
 * flags. The engine asks these at runtime and the tests ask the very same
 * questions while walking a whole journey, so the thread cannot be honest in
 * one and wrong in the other.
 *
 * The rule the thread lives by: it only ever points somewhere that answers.
 * A person counts as somewhere only while talking to them would move the
 * story (a page, an errand, a letter, a journey, a first meeting, or a flag
 * something other than their own memory is waiting on). A task whose
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

/**
 * Flags the engine reads by name, outside any content condition. They count
 * as progress wherever they are raised, because the world visibly turns on them.
 */
const CODE_READS = new Set([
  'album.open', 'allqu.friend', 'c10.album.seen', 'c11.rain', 'c6.rain', 'c7.complete', 'c7.dawn',
  'c9.complete', 'c9.of.kanga', 'c9.of.omiyage', 'c9.of.wish', 'c9.ofrenda.done', 'carry.chicha',
  'chicha.hinted', 'dig.done', 'dig.invite', 'end.book', 'intro.done', 'keepsake.band', 'paca.moved',
  'photo.flash', 'story.complete', 'story.end', 'wish.nani', 'wish.people',
]);
/** Families the engine reads by prefix: the album, carried things, errands, hard tellings. */
const CODE_PREFIXES = ['photo.', 'carry.', 'errand.', 'hard.'];
/** A first meeting's flag: met.rosa, c7.met.bakari. */
const MET = /(^|\.)met\./;

/**
 * Who reads each flag. An NPC's own entry gates read as `npc:<id>`; every
 * other condition anywhere in the content (tasks, other people, examines,
 * dressings, choices, arrivals, letters) reads as '*'. A flag that only its
 * own speaker reads is bookkeeping ("I already told you that"), not news:
 * pointing a player at someone only so they can raise it is the thread
 * sending them in a circle.
 */
const READERS: Map<string, Set<string>> = (() => {
  const entryOwner = new Map<object, string>();
  for (const c of CHAPTERS) {
    for (const n of c.npcs) for (const e of n.entry) if (e.when) entryOwner.set(e.when, n.id);
    for (const x of c.npcExtensions ?? []) for (const e of x.entry) if (e.when) entryOwner.set(e.when, x.npcId);
  }
  const readers = new Map<string, Set<string>>();
  const seen = new Set<object>();
  const visit = (v: unknown) => {
    if (!v || typeof v !== 'object' || seen.has(v)) return;
    seen.add(v);
    if (Array.isArray(v)) {
      for (const x of v) visit(x);
      return;
    }
    const o = v as Record<string, unknown>;
    if (Array.isArray(o.has) || Array.isArray(o.not)) {
      const who = entryOwner.has(o) ? `npc:${entryOwner.get(o)}` : '*';
      for (const f of [...((o.has as unknown[]) ?? []), ...((o.not as unknown[]) ?? [])]) {
        if (typeof f !== 'string') continue;
        let set = readers.get(f);
        if (!set) readers.set(f, (set = new Set()));
        set.add(who);
      }
    }
    for (const x of Object.values(o)) visit(x);
  };
  visit(CHAPTERS);
  visit(LETTERS);
  return readers;
})();

/**
 * Does raising or clearing this flag matter to anything beyond `npcId`'s own
 * memory of having said it? With no speaker, any reader at all counts.
 */
export function isProgressFlag(flag: string, npcId?: string): boolean {
  if (CODE_READS.has(flag) || CODE_PREFIXES.some((p) => flag.startsWith(p))) return true;
  // Meeting somebody is always news, even when only they remember it.
  if (MET.test(flag)) return true;
  const readers = READERS.get(flag);
  if (!readers) return false;
  if (npcId === undefined) return true;
  for (const r of readers) if (r !== `npc:${npcId}`) return true;
  return false;
}

/** A pretend conversation's scratch memory, laid over the real flags. */
class Overlay implements GuideState {
  readonly add = new Set<string>();
  readonly del = new Set<string>();
  constructor(private readonly base: GuideState) {}
  get errand(): string | null {
    return this.base.errand;
  }
  get size(): number {
    return this.add.size + this.del.size;
  }
  has(f: string): boolean {
    return this.add.has(f) || (!this.del.has(f) && this.base.has(f));
  }
  check(c: Cond | undefined): boolean {
    if (!c) return true;
    if (c.has && !c.has.every((f) => this.has(f))) return false;
    if (c.not && c.not.some((f) => this.has(f))) return false;
    return true;
  }
}

/**
 * Would applying these effects, right now, move anything forward? Bookkeeping
 * (a flag only this speaker reads) is written into the overlay instead, so the
 * rest of the conversation, and the next visit, can see it.
 */
function effectsProgress(effects: string[] | undefined, sim: Overlay, npcId: string | undefined): boolean {
  // Another go at a game already won is a pleasure, never a direction.
  if (effects?.includes('set:replay.mode')) return false;
  for (const eff of effects ?? []) {
    const sep = eff.indexOf(':');
    const kind = sep < 0 ? eff : eff.slice(0, sep);
    const arg = sep < 0 ? '' : eff.slice(sep + 1);
    if (kind === 'set' && !sim.has(arg)) {
      if (isProgressFlag(arg, npcId)) return true;
      sim.add.add(arg);
      sim.del.delete(arg);
    }
    if (kind === 'clear' && sim.has(arg)) {
      if (isProgressFlag(arg, npcId)) return true;
      sim.del.add(arg);
      sim.add.delete(arg);
    }
    if (kind === 'journal' && !sim.has(`page.${arg}`)) return true;
    if (kind === 'errand' && sim.errand !== arg) return true;
    if (kind === 'errand.done' && sim.errand !== null) return true;
    if ((kind === 'letter' || kind === 'letterread') && !sim.has(`letter.read.${arg}`)) return true;
    // A conversation that ends in a journey is the way onward, always.
    if (kind === 'travel') return true;
  }
  return false;
}

function walkProgress(nodeId: string, sim: Overlay, npcId: string | undefined, seen: Set<string>): boolean {
  if (seen.has(nodeId)) return false;
  seen.add(nodeId);
  const node = NODES[nodeId];
  if (!node) return false;
  if (effectsProgress(node.effects, sim, npcId)) return true;
  if (node.next && walkProgress(node.next, sim, npcId, seen)) return true;
  return (node.choices ?? []).some((c) => sim.check(c.when) && walkProgress(c.goto, sim, npcId, seen));
}

/**
 * Does anything reachable from this node, by any open branch, move the story?
 * With a speaker, their private memory of having spoken does not count.
 */
export function nodeMatters(nodeId: string, state: GuideState, npcId?: string): boolean {
  return walkProgress(nodeId, new Overlay(state), npcId, new Set());
}

/** How many visits in a row the guide imagines before calling someone done. */
const VISITS = 4;

/**
 * True when talking to this villager would move the story: on this visit, or
 * on the next one when this one only lets them remember they spoke (a
 * two-visit errand is still an errand). False for anyone absent by the flags,
 * for anyone down to their idle line, and for anyone whose only news is a
 * line about themselves (a praise, a second hello) that nothing in the world
 * is waiting on.
 */
export function hasNews(npcId: string, state: GuideState): boolean {
  const npc = NPC_BY_ID.get(npcId);
  if (!npc || !state.check(npc.when)) return false;
  const sim = new Overlay(state);
  for (let visit = 0; visit < VISITS; visit++) {
    const entry = npc.entry.find((e) => sim.check(e.when));
    if (!entry) return false;
    const before = sim.size;
    if (walkProgress(entry.node, sim, npcId, new Set())) return true;
    if (sim.size === before) return false;
  }
  return false;
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
