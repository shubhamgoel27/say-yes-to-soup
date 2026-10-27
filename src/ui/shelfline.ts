import type { SaveData } from '../engine/state';
import { ROUTE } from '../content/route';
import { CHAPTERS, REGION_MAPS } from '../content/world';

/**
 * A journal on the shelf, told apart from its neighbours. Two journals with
 * the same name once read identically ("open on the table" was the only
 * difference), so each row says who, which chapter and where, how full, and
 * when to the minute it was last written in. Each piece is a whole phrase:
 * the row may wrap between pieces, never inside one.
 */
export type ShelfLines = {
  /** Who signed the flyleaf. */
  who: string;
  /** "chapter seven · Kucha Aab-o-Daana, the walled city" */
  where: string;
  /** ["254 pages", "last walked today, 14:32"] */
  tally: string[];
};

const CHAPTER_WORDS = [
  'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve',
];

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

export function shelfLines(data: SaveData | null, now = new Date()): ShelfLines | null {
  if (!data) return null;
  // The shelf is drawn as HTML; a name is text, whatever file it came from.
  const who = data.name && data.name.trim() ? escapeHtml(data.name) : 'unsigned';
  const mapId = typeof data.place?.map === 'string' && REGION_MAPS[data.place.map] ? data.place.map : 'village';
  const ci = CHAPTERS.findIndex((c) => c.maps.some((m) => m.id === mapId));
  const chapter = ci >= 0 ? `chapter ${CHAPTER_WORDS[ci] ?? String(ci + 1)}` : '';
  const stop = ci >= 0 ? ROUTE.find((r) => r.id === CHAPTERS[ci]!.id)?.name : undefined;
  const place = [...new Set([REGION_MAPS[mapId]?.name, stop].filter(Boolean))].join(', ');
  const n = Array.isArray(data.journal) ? data.journal.length : 0;
  const when = walkedLine(data.walked, now);
  return {
    who,
    where: [chapter, place].filter(Boolean).join(' &middot; '),
    tally: [`${n} page${n === 1 ? '' : 's'}`, ...(when ? [when] : [])],
  };
}

/**
 * When a journal was last written in: today or yesterday with the hour, else
 * a short date (with the year once it is not this one). The hour is what
 * tells two journals walked on the same day apart. Saves from before the
 * date was kept simply have no line.
 */
export function walkedLine(ms: unknown, now = new Date()): string | null {
  if (typeof ms !== 'number' || !Number.isFinite(ms)) return null;
  const d = new Date(ms);
  const day = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const ago = Math.round((day(now) - day(d)) / 86400000);
  const hm = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  if (ago <= 0) return `last walked today, ${hm}`;
  if (ago === 1) return `last walked yesterday, ${hm}`;
  const opts: Intl.DateTimeFormatOptions =
    d.getFullYear() === now.getFullYear()
      ? { day: 'numeric', month: 'short' }
      : { day: 'numeric', month: 'short', year: 'numeric' };
  return `last walked ${d.toLocaleDateString(undefined, opts)}`;
}

/** The same journal as one line, for the cards that ask before changing it. */
export function shelfOneLine(data: SaveData | null): string | null {
  const l = shelfLines(data);
  if (!l) return null;
  return [l.who, l.where, ...l.tally].join(' &middot; ');
}

/**
 * The shelf's verb cursor moves along one row's verbs and stops at the ends.
 * It used to wrap, so on a blank journal (open, unpack) one more press right
 * from unpack landed on open, and the next Space opened a blank journal the
 * player never meant to touch.
 */
export function stepShelfVerb(at: number, dir: 'left' | 'right', count: number): number {
  if (count <= 0) return 0;
  const next = at + (dir === 'right' ? 1 : -1);
  return Math.max(0, Math.min(count - 1, next));
}

/**
 * What "open" does to a shelf row. A written journal goes on the table and
 * the journey resumes. A blank one only becomes the journal on the table
 * once the traveler sets out from its flyleaf: until then the written
 * journey stays where it was, Continue and all.
 */
export function shelfOpenPlan(occupied: boolean): 'resume' | 'flyleaf' {
  return occupied ? 'resume' : 'flyleaf';
}

/** One stop on Nani's 1974 route, as the cover's route strip draws it. */
export type RouteStamp = {
  /** The stop's name on the route ("La Caleta", "the walled city"). */
  name: string;
  /** This journal has reached it: the stop is inked. */
  stamped: boolean;
  /** The furthest stop reached: where the journal now is. */
  here: boolean;
};

/**
 * Nani's route, stamped as far as this journal has come. A stop is reached
 * when its chapter's arrival flag is in the journal (the first village needs
 * none: every written journal began there), so the strip follows the story
 * rather than the map underfoot, which in the Return is La Caleta again. No
 * journal at all is eleven empty stops.
 */
export function routeStamps(data: SaveData | null): RouteStamp[] {
  const flags = new Set(Array.isArray(data?.flags) ? data.flags : []);
  const reached = ROUTE.map((_stop, i) => {
    if (!data) return false;
    if (i === 0) return true;
    const flag = CHAPTERS[i]?.arrival?.flag;
    return !!flag && flags.has(flag);
  });
  // Where the journal is now: the furthest reached stop.
  const last = reached.lastIndexOf(true);
  return ROUTE.map((stop, i) => ({ name: stop.name, stamped: reached[i] === true, here: i === last }));
}
