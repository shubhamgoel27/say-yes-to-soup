import type { Cond, JournalEntry } from '../content/schema';
import type { WorldTask } from '../content/world';
import { CHAPTERS, ERRAND_BY_ID, MAP_CHAPTER } from '../content/world';
import { ROUTE } from '../content/route';

/**
 * The Tasks tab as a page of Nani's book rather than a one-row list on an
 * empty sheet: what you are doing now, written large; what you have already
 * done in this place, crossed off with the dishes and people it gave you;
 * and the places behind you, folded. Pure, so the tests can read the same
 * page the player reads.
 */

/** The slice of GameState the page reads. */
export type TaskPageState = {
  has(flag: string): boolean;
  check(cond: Cond | undefined): boolean;
  hasPage(id: string): boolean;
  readonly errand: string | null;
  /** Every raised flag, in the order it was raised (a Set keeps it, and so
   * does the save). The crossed-off list reads in the order things happened. */
  flagSet(): ReadonlySet<string>;
};

export type PageMark = { id: string; title: string };

export type ChapterLeaf = {
  place: string;
  /** Finished threads, each reduced to its first sentence. */
  done: string[];
  dishes: PageMark[];
  people: PageMark[];
};

export type TaskPage = ChapterLeaf & {
  /** "chapter one" */
  chapterWord: string;
  /** The thread the chip shows, written large. */
  now: string | null;
  /** What rides in your bag for someone, when anything does. */
  carrying: string | null;
  /** Every other open thread, smaller. */
  also: string[];
  /** Earlier places, newest first, folded on the page. */
  past: ChapterLeaf[];
  /** Her pencil note for this place, from inside the front cover; null
   * where her pencil stopped. */
  nani: string | null;
};

const WORDS = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];

/** The first sentence of a task's direction: enough to recognise it by. */
export function firstSentence(text: string): string {
  const m = /^.+?[.!?](?=\s|$)/.exec(text.trim());
  return (m ? m[0] : text).trim();
}

/**
 * A thread is done when it was taken up (everything it waits on happened)
 * and then closed (one of the flags it ends on is raised). A thread that
 * only ever ends by being superseded, or that never closes on its own (a
 * spill to mop up), is not counted: crossing it off would be a lie.
 */
export function taskDone(t: WorldTask, s: Pick<TaskPageState, 'has'>): boolean {
  const ends = t.when.not ?? [];
  if (ends.length === 0) return false;
  if (!(t.when.has ?? []).every((f) => s.has(f))) return false;
  return ends.some((f) => s.has(f));
}

/** The chapter the traveler is living in: the latest one arrived at. The
 * Return walks old maps, so the map alone cannot say. */
export function currentChapter(s: Pick<TaskPageState, 'has'>, hereMap?: string): number {
  // Standing on a new chapter's ground counts before its arrival narration
  // has finished and raised the flag.
  let at = hereMap !== undefined ? MAP_CHAPTER[hereMap] ?? 0 : 0;
  CHAPTERS.forEach((c, i) => {
    if (c.arrival?.flag && s.has(c.arrival.flag)) at = Math.max(at, i);
  });
  return at;
}

function leaf(i: number, tasks: WorldTask[], open: Set<WorldTask>, s: TaskPageState): ChapterLeaf {
  const ch = CHAPTERS[i];
  const pages: JournalEntry[] = (ch?.journal ?? []).filter((e) => s.hasPage(e.id));
  const seen = new Set<string>();
  const done: string[] = [];
  // In the order they closed: a thread closed when the first of its ending
  // flags was raised. Authored order breaks ties.
  const order = new Map<string, number>();
  let n = 0;
  for (const f of s.flagSet()) order.set(f, n++);
  const closedAt = (t: WorldTask) =>
    Math.min(...(t.when.not ?? []).map((f) => order.get(f) ?? Number.POSITIVE_INFINITY));
  const mine = tasks
    .map((t, k) => ({ t, k, at: 0 }))
    .filter(({ t }) => t.chapter === i && !open.has(t) && taskDone(t, s))
    .map((x) => ({ ...x, at: closedAt(x.t) }))
    .sort((a, b) => a.at - b.at || a.k - b.k);
  for (const { t } of mine) {
    const line = firstSentence(t.text);
    if (seen.has(line)) continue;
    seen.add(line);
    done.push(line);
  }
  return {
    place: ROUTE[i]?.name ?? ch?.id ?? '',
    done,
    dishes: pages.filter((e) => e.tab === 'dishes').map((e) => ({ id: e.id, title: e.title })),
    people: pages.filter((e) => e.tab === 'people').map((e) => ({ id: e.id, title: e.title })),
  };
}

export function taskPage(tasks: WorldTask[], openNow: WorldTask[], s: TaskPageState, hereMap?: string): TaskPage {
  const here = currentChapter(s, hereMap);
  const open = new Set(openNow);
  const errand = s.errand ? ERRAND_BY_ID.get(s.errand)?.label ?? null : null;
  const past: ChapterLeaf[] = [];
  for (let i = here - 1; i >= 0; i--) past.push(leaf(i, tasks, open, s));
  return {
    ...leaf(here, tasks, open, s),
    chapterWord: `chapter ${WORDS[here] ?? String(here + 1)}`,
    now: openNow[0]?.text ?? null,
    carrying: errand,
    also: openNow.slice(1).map((t) => t.text),
    past,
    nani: ROUTE[here]?.nani ?? null,
  };
}

/**
 * Whether the HUD chip keeps its words through a flag change. Only while an
 * activity's how-to card or panel is actually on screen (the start flag has
 * just retired the task that asked for it, and the chip must not jump to the
 * next errand under the card). A start flag merely being up is not enough:
 * an armed card set aside, or one left behind in an earlier village, froze
 * the chip for whole chapters.
 */
export function chipHolds(at: { activityOnScreen: boolean; showing: boolean }): boolean {
  return at.activityOnScreen && at.showing;
}
