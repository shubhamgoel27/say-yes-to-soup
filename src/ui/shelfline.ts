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

export function shelfLines(data: SaveData | null, now = new Date()): ShelfLines | null {
  if (!data) return null;
  const who = data.name && data.name.trim() ? data.name : 'unsigned';
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
