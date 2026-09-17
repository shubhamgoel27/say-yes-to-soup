import type { GameState } from '../engine/state';
import type { ChapterDef, JournalTab } from '../content/schema';
import { ROUTE } from '../content/route';
import { CHAPTERS } from '../content/world';
import { PHOTOS } from './album';

/**
 * The chapter-close spread: when a chapter's story finishes, the journal
 * closes it the way Zoila would have, one card on dark cloth. What the road
 * put in the pockets, then her pencil pointing at the next stop. A warm
 * exhale, not a victory screen; the pull onward is her handwriting.
 *
 * The engine owns timing (it waits for the petals) and input (frozen like
 * the letter); this class only builds the spread and holds it open.
 */

/** Chapter 1 predates the completion table; its flag is the story's own. */
const FIRST_CHAPTER_FLAG = 'story.complete';

/**
 * The chapter a completion flag closes, if its ceremony should show here.
 * Null when there is nothing to close: an unknown flag, a chapter without a
 * next stop on Nani's route, or a completion granted from afar (the cheat
 * desk pre-sets whole chapters; only the chapter the player is standing in
 * gets its moment). The Return never appears: it has no completion flag,
 * it ends, and the ending is authored elsewhere.
 */
export function closingChapter(flag: string, mapId: string): ChapterDef | null {
  const chapter =
    flag === FIRST_CHAPTER_FLAG
      ? CHAPTERS[0]
      : CHAPTERS.find((c) => c.completion?.flag === flag);
  if (!chapter) return null;
  if (!chapter.maps.some((m) => m.id === mapId)) return null;
  const at = ROUTE.findIndex((s) => s.id === chapter.id);
  if (at < 0 || !ROUTE[at + 1]) return null;
  return chapter;
}

const POCKETS: { tab: JournalTab; one: string; many: string }[] = [
  { tab: 'words', one: 'word', many: 'words' },
  { tab: 'dishes', one: 'dish', many: 'dishes' },
  { tab: 'people', one: 'person', many: 'people' },
  { tab: 'customs', one: 'custom', many: 'customs' },
];

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Touch-first devices read a tap hint; desktop pointers are never coarse,
 * so the keyboard wording there stays exactly as it was. */
const COARSE =
  typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches;

export class ChapterCloseUI {
  private onClose: (() => void) | null = null;

  constructor(
    private root: HTMLElement,
    private state: GameState,
  ) {}

  get isOpen(): boolean {
    return !this.root.hidden;
  }

  /** Unfold the spread for a chapter; hues are the chapter's petal colors. */
  open(chapter: ChapterDef, hues: string[], onClose: () => void) {
    this.onClose = onClose;
    const at = ROUTE.findIndex((s) => s.id === chapter.id);
    const stop = ROUTE[at];
    const next = ROUTE[at + 1];
    if (!stop || !next) return; // closingChapter vouched; belt and braces

    // The woven band, in this coast's colors.
    const stripes = hues.map((h, i) => `${h} ${i * 9}px ${(i + 1) * 9}px`).join(', ');
    const band = `repeating-linear-gradient(90deg, ${stripes})`;

    // The pockets: what this chapter actually pressed into the pages.
    const rows = POCKETS.map(({ tab, one, many }) => {
      const n = chapter.journal.filter(
        (e) => e.tab === tab && this.state.hasPage(e.id),
      ).length;
      return n > 0
        ? `<div class="cx-row"><span class="cx-n">${n}</span> ${n === 1 ? one : many}</div>`
        : '';
    }).join('');
    const herKept = chapter.journal.some(
      (e) => e.tab === 'her' && this.state.hasPage(e.id),
    );
    const her = herKept
      ? `<div class="cx-her">&#10087; a page of her, in what they remember</div>`
      : '';
    const shot = PHOTOS[at];
    const photo =
      shot && this.state.has(shot.flag)
        ? `<div class="cx-photo"><span class="cx-print"></span>${esc(shot.stamp)}</div>`
        : '';
    const pockets =
      rows || her || photo
        ? `<div class="cx-pockets">
            <div class="cx-sub">pressed into its pages:</div>
            ${rows}${her}${photo}
          </div>`
        : '';

    // Her pencil, pointing onward. Past Sicily it goes quiet; the journal
    // shows that honestly, the same words the route page uses.
    const note = next.nani
      ? `<div class="cx-nani">${esc(next.nani)}</div>`
      : `<div class="cx-nani empty">(her pencil stops here)</div>`;

    this.root.innerHTML = `
      <div class="cx-card">
        <div class="cx-kicker">the journal closes a chapter</div>
        <div class="cx-name">${esc(stop.name)}</div>
        <div class="cx-band" style="background:${band}"></div>
        ${pockets}
        <div class="cx-onward">
          <div class="cx-sub">Nani&rsquo;s route runs on:</div>
          <div class="cx-next">${esc(next.name)} <span class="cx-hop">&middot; ${esc(next.hop)}</span></div>
          ${note}
        </div>
        <div class="cx-go">Onward</div>
        <div class="cx-hint">${COARSE ? 'tap anywhere' : 'Space, Enter, or Esc'}</div>
      </div>`;
    this.root.hidden = false;
  }

  /** Put the spread down; the engine's callback lets the world move again. */
  close() {
    if (this.root.hidden) return;
    this.root.hidden = true;
    this.root.innerHTML = '';
    const done = this.onClose;
    this.onClose = null;
    done?.();
  }
}
