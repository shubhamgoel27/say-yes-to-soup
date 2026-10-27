import type { GameState } from '../engine/state';
import type { Dir } from '../engine/input';
import type { JournalEntry, JournalTab, TaskDef } from '../content/schema';
import type { WorldTask } from '../content/world';
import type { RouteStop } from '../content/route';
import { makeDishArt } from '../art/dishes';
import { makePhotoArt } from '../art/albumart';
import { PHOTOS } from './album';
import { openTasks } from '../content/guide';
import { taskPage, type ChapterLeaf } from './taskpage';
import { keysOrTaps, lastDevice } from './responsive';

export type { TaskDef };

/**
 * Nani's journal: the collection screen. Four tabs, her faded 1974 hand above
 * yours on every page you both reached, and honest blank space where she
 * stopped. Locked pages show as dim dashes: you know something is there to
 * notice, never what.
 */

/**
 * Ephemera: real public-domain plates pasted into a few pages the way a 1974
 * notebook collects things (see public/assets/games/LICENSES.md). The image
 * lazy-loads; the frame reserves its exact shape so nothing shifts while the
 * paper is still "drying".
 */
const EPHEMERA: Record<string, { src: string; alt: string; caption: string }> = {
  'dishes.sadya': {
    src: 'assets/games/pomological-mango-mulgoba.jpg',
    alt: 'watercolor of a mulgoba mango, whole and halved',
    caption: 'from a seed catalogue, she says. the mango the pickle used to be',
  },
  'dishes.aam': {
    src: 'assets/games/pomological-mango-mulgoba.jpg',
    alt: 'watercolor of a mulgoba mango, whole and halved',
    caption: 'a painted mango, taped in. sweet, and only one; Ghalib wanted many',
  },
};

const TABS: { id: JournalTab | 'tasks' | 'route' | 'photos'; label: string }[] = [
  { id: 'tasks', label: 'Tasks' },
  { id: 'route', label: 'Route' },
  { id: 'words', label: 'Words' },
  { id: 'dishes', label: 'Dishes' },
  { id: 'people', label: 'People' },
  { id: 'customs', label: 'Customs' },
  { id: 'her', label: 'Her' },
  { id: 'photos', label: 'Photos' },
];

/** The prints land in the journal at slight, believable angles. */
const PHOTO_TILTS = [-1.9, 1.5, -1.1, 2.1];

/** Touch-first devices read tap hints; desktop pointers are never coarse,
 * so the keyboard wording there stays exactly as it was. */
const COARSE =
  typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches;

/** The one-line hint at the book's foot, per tab flavor; a pad reads Y
 * where the keyboard reads J. */
function hintLine(kind: 'pages' | 'photos' | 'flat'): string {
  if (kind === 'pages') {
    return keysOrTaps(
      '&#8592;&#8594; sections &nbsp; &#8593;&#8595; pages &nbsp; J close',
      'tap a tab &nbsp; tap a page &nbsp; &#9998; closes',
      COARSE,
    );
  }
  if (kind === 'photos') {
    return keysOrTaps(
      '&#8592;&#8594; sections &nbsp; &#8593;&#8595; photos &nbsp; J close',
      'tap a tab &nbsp; tap a print &nbsp; &#9998; closes',
      COARSE,
    );
  }
  return keysOrTaps('&#8592;&#8594; sections &nbsp; J close', 'tap a tab for sections &nbsp; &#9998; closes', COARSE);
}

/** One key per rhyme regardless of which half the player is looking at. */
function threadKey(a: string, b: string): string {
  return [a, b].sort().join('~');
}

/**
 * Where a scrolled list must sit so a row spanning [top, bottom) (in the
 * list's own content coordinates) is wholly on the page, with `pad` of air
 * above and `padEnd` below (the list's foot fades out, so the last row needs
 * more). The scroll it already has when the row is on the page: the list
 * moves only as far as it must, never recentres.
 */
export function revealScroll(
  top: number,
  bottom: number,
  scroll: number,
  view: number,
  pad = 8,
  padEnd = pad,
): number {
  if (top - pad < scroll) return Math.max(0, top - pad);
  if (bottom + padEnd > scroll + view) return Math.min(Math.max(0, top - pad), bottom + padEnd - view);
  return scroll;
}

/** Whether a box scrolled to `top` still has somewhere to go along `dy`. */
export function canScrollFurther(top: number, view: number, height: number, dy: number): boolean {
  if (dy > 0) return top + view < height - 1;
  if (dy < 0) return top > 0;
  return false;
}

/**
 * Wheel travel turned into page steps. A mouse notch (or any line- or
 * page-mode event) is one step; a trackpad's pixels add up to one step per
 * `stride`, so a swipe no longer spins through the list and wraps. Sideways
 * and empty deltas are not a step (deltaY 0 used to read as "up"). After the
 * page text has been scrolling, the same glide does not go on to turn the
 * page: a pause of `rest` ms comes first.
 */
export class WheelSteps {
  private acc = 0;
  private lastAt = -Infinity;
  private heldAt = -Infinity;

  constructor(
    private stride = 80,
    private rest = 250,
  ) {}

  /** The wheel just scrolled something natively at `now`. */
  hold(now: number) {
    this.heldAt = now;
    this.acc = 0;
  }

  /** One wheel event: 1 for a page down, -1 for up, 0 for not yet. */
  feed(dx: number, dy: number, mode: number, now: number): -1 | 0 | 1 {
    if (Math.abs(dx) >= Math.abs(dy)) return 0;
    if (now - this.heldAt < this.rest) {
      this.heldAt = now;
      return 0;
    }
    if (mode !== 0) {
      this.acc = 0;
      return dy > 0 ? 1 : -1;
    }
    if (now - this.lastAt > 400 || Math.sign(dy) !== Math.sign(this.acc)) this.acc = 0;
    this.lastAt = now;
    this.acc += dy;
    if (Math.abs(this.acc) < this.stride) return 0;
    const step = this.acc > 0 ? 1 : -1;
    this.acc = 0;
    return step;
  }
}

export class JournalUI {
  private tab = 0;
  private opening = false;
  private cursor = 0;
  /** Pages whose row has already been shown; a page that filled since then
   * gets a one-time highlight sweep the next time its tab renders. Seeded
   * from the save at boot so loading a game never sweeps everything. */
  private seenPages = new Set<string>();
  /** Rhyme pairs whose stitched thread has already drawn itself in. */
  private seenThreads = new Set<string>();
  /** The tab the book last drew, so a redraw of the same tab keeps its place. */
  private drawnTab = -1;
  /** The latest pointer event to reach the book. While it is still being
   * dispatched, whatever the cursor does is the pointer's doing. */
  private pointerEv: Event | null = null;

  constructor(
    private root: HTMLElement,
    private entries: JournalEntry[],
    private tasks: WorldTask[],
    private route: RouteStop[],
    private state: GameState,
    /** The place a page was written in (a route stop's name), for the
     * chapter dividers in the long lists. */
    private placeOf: (id: string) => string | undefined = () => undefined,
  ) {
    this.resync();
    // Captured before main.ts's own handlers hear it: a row chosen by hover
    // or tap is the row under the pointer, and the list must not slide out
    // from under it (the next click would land on a neighbour).
    for (const type of ['mouseover', 'click', 'pointerdown', 'pointerup']) {
      this.root.addEventListener?.(type, (e) => (this.pointerEv = e), true);
    }
  }

  /** True while a hover, click or tap on the book is moving the cursor. */
  private get pointerSteering(): boolean {
    return !!this.pointerEv && this.pointerEv.eventPhase !== 0; // 0: Event.NONE, dispatch over
  }

  /** Everything already written counts as seen: at boot, and whenever a
   * different journal is put on the table (another slot, or Begin again),
   * so the new-page sweep follows the journal open now, not the first one. */
  resync() {
    this.seenPages.clear();
    this.seenThreads.clear();
    for (const e of this.entries) {
      if (!this.state.hasPage(e.id)) continue;
      this.seenPages.add(e.id);
      if (e.rhyme && this.state.hasPage(e.rhyme.with)) {
        this.seenThreads.add(threadKey(e.id, e.rhyme.with));
      }
    }
  }

  /** Every open thread's full definition, in priority order. The red thread
   * follows the first one that resolves to a `who`/`at`, so the defs are the
   * real currency here and the chip's text list is derived from them. The
   * guide owns the rule (live chapter, conditions met, and somebody named
   * still has news), so the chip and the thread can never disagree. */
  activeTaskDefs(): WorldTask[] {
    return openTasks(this.tasks, this.state, this.state.place?.map);
  }

  /** Every open thread, in priority order. */
  activeTasks(): string[] {
    return this.activeTaskDefs().map((t) => t.text);
  }

  /**
   * The rhyme partner of a page, if the player holds both halves. A rhyme is
   * authored on the later page but stitches from either side. The page's own
   * rhyme wins: Delhi's abhi reaches forward to ahorita, and found first in
   * journal order it once covered ahorita's own note about al toque.
   */
  private rhymeFor(id: string): { other: JournalEntry; note: string } | null {
    if (!this.state.hasPage(id)) return null;
    const own = this.entries.find((e) => e.id === id);
    if (own?.rhyme && this.state.hasPage(own.rhyme.with)) {
      const other = this.entries.find((o) => o.id === own.rhyme?.with);
      if (other) return { other, note: own.rhyme.note };
    }
    for (const e of this.entries) {
      if (e.rhyme?.with === id && this.state.hasPage(e.id)) {
        return { other: e, note: e.rhyme.note };
      }
    }
    return null;
  }

  /** How many threads are currently stitched (both halves found). */
  stitchedCount(): number {
    return this.entries.filter(
      (e) => e.rhyme && this.state.hasPage(e.id) && this.state.hasPage(e.rhyme.with),
    ).length;
  }

  get isOpen(): boolean {
    return !this.root.hidden;
  }

  open() {
    this.root.hidden = false;
    this.cursor = 0;
    // The book-open flourish belongs to opening; re-renders (tab switches,
    // cursor moves) must not replay it or the whole screen blinks.
    this.opening = true;
    this.render();
    this.opening = false;
  }

  close() {
    this.root.hidden = true;
  }

  onDir(dir: Dir) {
    if (dir === 'left') {
      this.tab = (this.tab + TABS.length - 1) % TABS.length;
      this.cursor = 0;
    } else if (dir === 'right') {
      this.tab = (this.tab + 1) % TABS.length;
      this.cursor = 0;
    } else {
      // The flat pages (tasks, route) have no cursor: the arrows read down
      // the page instead, so a keyboard can reach the folded places.
      const flat = this.root.querySelector<HTMLElement>('.j-tasks, .j-route');
      if (flat) {
        flat.scrollBy({ top: dir === 'down' ? 80 : -80, behavior: 'smooth' });
        return;
      }
      const count =
        TABS[this.tab]?.id === 'photos' ? this.earnedPhotos().length : this.unlockedInTab().length;
      if (count === 0) return;
      if (dir === 'up') this.cursor = (this.cursor + count - 1) % count;
      else this.cursor = (this.cursor + 1) % count;
    }
    this.render();
  }

  /** Wheel travel over the book, waiting to become a page step. */
  private wheel = new WheelSteps();

  /**
   * The wheel over the book. A page's own text scrolls natively for as long
   * as it has further to go that way: the end of a dish page (your entry,
   * her margin note) sat below the fold in a 1280x720 frame and the wheel
   * would not reach it. Elsewhere the wheel turns pages, one per notch or
   * per 80px of a trackpad's glide; sideways travel is left to the tab
   * strip. The route and task pages scroll natively throughout.
   */
  onWheel(e: WheelEvent) {
    if (!this.isOpen) return;
    const t = e.target as HTMLElement | null;
    if (!t || typeof t.closest !== 'function') return;
    if (t.closest('.j-route, .j-tasks')) return;
    if (Math.abs(e.deltaX) >= Math.abs(e.deltaY)) {
      if (!t.closest('.j-tabs')) e.preventDefault();
      return;
    }
    const page = t.closest<HTMLElement>('.j-detail');
    if (page && canScrollFurther(page.scrollTop, page.clientHeight, page.scrollHeight, e.deltaY)) {
      this.wheel.hold(e.timeStamp);
      return;
    }
    e.preventDefault();
    const step = this.wheel.feed(e.deltaX, e.deltaY, e.deltaMode, e.timeStamp);
    if (step !== 0) this.onDir(step > 0 ? 'down' : 'up');
  }

  private tabEntries(): JournalEntry[] {
    const t = TABS[this.tab]?.id;
    if (t === 'tasks' || t === 'route') return [];
    return this.entries.filter((e) => e.tab === t);
  }

  private unlockedInTab(): JournalEntry[] {
    return this.tabEntries().filter((e) => this.state.hasPage(e.id));
  }

  /** The prints Chasca has actually taken, in album order. */
  private earnedPhotos() {
    return PHOTOS.filter((p) => this.state.has(p.flag));
  }

  /**
   * The book's head, the same on every tab: the title, the count (threads
   * included, which once showed only on the page tabs), the close, and the
   * tab strip. On a phone the open book covers the ✎ that opened it, so the
   * book carries its own ✎ to close with (shown only under a finger), and a
   * strip too wide for the glass fades at the edge it continues past.
   */
  private headHtml(found: number, total: number, tabsHtml: string): string {
    const n = this.stitchedCount();
    const threads = n > 0 ? `${n} thread${n > 1 ? 's' : ''} &middot; ` : '';
    return `<div class="j-head">
          <div class="j-name">Nani&rsquo;s Journal</div>
          <div class="j-progress">${threads}${found} / ${total} pages</div>
          <button class="j-close" type="button" aria-label="close the journal">&#9998;</button>
        </div>
        <div class="j-tabrow"><div class="j-tabs">${tabsHtml}</div></div>`;
  }

  /**
   * Every render rebuilds the strip, so the strip would snap back to its
   * start and hide the tab just chosen. Keep its scroll, bring the open tab
   * into view, and keep the edge fades honest as it scrolls.
   */
  private fitTabs(prevScroll: number) {
    const strip = this.root.querySelector<HTMLElement>('.j-tabs');
    const row = this.root.querySelector<HTMLElement>('.j-tabrow');
    if (!strip || !row) return;
    strip.scrollLeft = prevScroll;
    const on = strip.querySelector<HTMLElement>('.j-tab.on');
    if (on) {
      const l = on.offsetLeft; // .j-tabs is positioned: offsets are strip-relative
      const r = l + on.offsetWidth;
      if (l < strip.scrollLeft) strip.scrollLeft = l - 12;
      else if (r > strip.scrollLeft + strip.clientWidth) strip.scrollLeft = r - strip.clientWidth + 12;
    }
    const sync = () => {
      const max = strip.scrollWidth - strip.clientWidth;
      row.classList.toggle('more-l', strip.scrollLeft > 4);
      row.classList.toggle('more-r', strip.scrollLeft < max - 4);
    };
    strip.addEventListener('scroll', sync, { passive: true });
    sync();
  }

  /**
   * Every render rebuilds the book through innerHTML, and a rebuilt list
   * starts at its top: with fifty pages on a tab the cursor walked off the
   * page under the arrows, and a hover after dragging the scrollbar snapped
   * the list back so the click picked the wrong row. The same tab keeps its
   * scroll; the arrows, the pad and the wheel then bring the chosen row onto
   * the page, while a hover or a tap (whose row is already under the
   * pointer) leaves the list exactly where it was.
   */
  private render() {
    const prev = this.root.querySelector<HTMLElement>('.j-tabs')?.scrollLeft ?? 0;
    const same = this.drawnTab === this.tab;
    const kept = same ? (this.root.querySelector<HTMLElement>('.j-list, .j-ph-grid')?.scrollTop ?? 0) : 0;
    this.renderTab();
    this.drawnTab = this.tab;
    this.fitTabs(prev);
    const list = this.root.querySelector<HTMLElement>('.j-list, .j-ph-grid');
    if (!list) return;
    if (kept > 0) list.scrollTop = kept;
    if (!this.pointerSteering) this.keepSelVisible(list);
  }

  /** Scroll a page list just enough to show its selected row, the place
   * heading it starts included; the last row brings the foot along. */
  private keepSelVisible(list: HTMLElement) {
    if (list.scrollHeight <= list.clientHeight) return;
    const sel = list.querySelector<HTMLElement>('.j-item.sel');
    if (!sel) return;
    const rows = list.querySelectorAll('.j-item');
    if (rows[0] === sel) {
      list.scrollTop = 0;
      return;
    }
    if (rows[rows.length - 1] === sel) {
      list.scrollTop = list.scrollHeight;
      return;
    }
    const head = sel.previousElementSibling;
    const topEl = head?.classList.contains('j-place') ? (head as HTMLElement) : sel;
    const box = list.getBoundingClientRect();
    const at = (y: number) => y - box.top - list.clientTop + list.scrollTop;
    list.scrollTop = revealScroll(
      at(topEl.getBoundingClientRect().top),
      at(sel.getBoundingClientRect().bottom),
      list.scrollTop,
      list.clientHeight,
      8,
      20,
    );
  }

  private renderTab() {
    if (TABS[this.tab]?.id === 'tasks') {
      this.renderTasks();
      return;
    }
    if (TABS[this.tab]?.id === 'route') {
      this.renderRoute();
      return;
    }
    if (TABS[this.tab]?.id === 'photos') {
      this.renderPhotos();
      return;
    }
    const all = this.tabEntries();
    const unlocked = this.unlockedInTab();
    const locked = all.length - unlocked.length;
    const sel = unlocked[Math.min(this.cursor, Math.max(unlocked.length - 1, 0))];
    const total = this.entries.length;
    const found = this.entries.filter((e) => this.state.hasPage(e.id)).length;

    const tabsHtml = TABS.map(
      (t, i) => `<span class="j-tab${i === this.tab ? ' on' : ''}">${t.label}</span>`,
    ).join('');

    // A book, not an app list: fifty-two dishes ran as one flat column. Each
    // place the pages were written in heads its own run, in her route's
    // words, once the list spans more than one.
    const places = new Set(unlocked.map((e) => this.placeOf(e.id)));
    let lastPlace: string | undefined;
    const listHtml =
      unlocked
        .map((e) => {
          const place = this.placeOf(e.id);
          const head =
            places.size > 1 && place && place !== lastPlace ? `<div class="j-place">${place}</div>` : '';
          lastPlace = place;
          return (
            head +
            `<div class="j-item${e === sel ? ' sel' : ''}${
              this.seenPages.has(e.id) ? '' : ' j-new'
            }">${e === sel ? '&#9656; ' : ''}${e.title}${
              this.rhymeFor(e.id) ? ' <span class="j-stitch">&#10087;</span>' : ''
            }</div>`
          );
        })
        .join('') +
      (locked > 0
        ? `<div class="j-locked">${'&middot; '.repeat(3)}${locked} page${locked > 1 ? 's' : ''} still blank</div>`
        : '');

    const rhyme = sel ? this.rhymeFor(sel.id) : null;
    // The thread pulls through only the first time this stitch is seen.
    const freshThread = sel && rhyme && !this.seenThreads.has(threadKey(sel.id, rhyme.other.id));
    const eph = sel ? EPHEMERA[sel.id] : undefined;
    const ephHtml = eph
      ? `<div class="j-eph"><img src="${eph.src}" alt="${eph.alt}" loading="lazy">` +
        `<div class="j-eph-cap">${eph.caption}</div></div>`
      : '';
    const detailHtml = sel
      ? `<div class="j-title">${sel.title}${sel.script ? ` <span class="j-native">${sel.script}</span>` : ''}</div>` +
        (sel.sub ? `<div class="j-sub">${sel.sub}</div>` : '') +
        (sel.tab === 'dishes' ? `<div class="j-dishart"></div>` : '') +
        ephHtml +
        // Her pages have no 1974 hand and are not missing one: she reached
        // every one of these places, she just did not write this part down.
        // Elsewhere a page without her hand is one she left for you: true in
        // the village she started from and on the road she never finished.
        (sel.tab === 'her'
          ? ''
          : sel.nani
            ? `<div class="j-nani"><span>Nani, 1974</span>${sel.nani}</div>`
            : `<div class="j-nani empty"><span>Nani, 1974</span>(she left this page for you)</div>`) +
        `<div class="j-you"><span>You</span>${sel.you}</div>` +
        (rhyme
          ? `<div class="j-thread"><div class="j-thread-rule${freshThread ? ' draw' : ''}"></div>` +
            `<span>Nani&rsquo;s margin</span>${rhyme.note}` +
            `<div class="j-thread-to">&#10087; stitched to ${rhyme.other.title}</div></div>`
          : '')
      : TABS[this.tab]?.id === 'her'
        ? `<div class="j-empty">You have her handwriting and not much else yet.<br>People along this road knew her. Some of them will say so.</div>`
        : `<div class="j-empty">Nothing noticed here yet.<br>The village is not hiding. Go and talk.</div>`;

    this.root.innerHTML = `
      <div class="j-book${this.opening ? ' opening' : ''}">
        ${this.headHtml(found, total, tabsHtml)}
        <div class="j-body">
          <div class="j-list">${listHtml}</div>
          <div class="j-detail">${detailHtml}</div>
        </div>
        <div class="j-hint">${hintLine('pages')}</div>
      </div>`;
    // The dish gets its little painting, mounted after the HTML lands.
    if (sel?.tab === 'dishes') {
      const slot = this.root.querySelector('.j-dishart');
      const art = slot ? makeDishArt(sel.id, 3) : null;
      if (slot && art) slot.appendChild(art);
    }
    // One-time flourishes stay one-time: whatever this render just showed is
    // now familiar, so cursor moves and reopens do not replay the sweep.
    for (const e of unlocked) this.seenPages.add(e.id);
    if (sel && rhyme) this.seenThreads.add(threadKey(sel.id, rhyme.other.id));
  }

  /**
   * The Photos tab: the prints Chasca has caught you in so far, pasted two to
   * a row where you can visit them between chapters. Frames she has not taken
   * yet wait as faint taped corners labeled only with the route's own place
   * names, so nothing is spoiled that the front cover does not already show.
   * The prints count toward no total; they are hers, not Nani's pages.
   */
  private renderPhotos() {
    const tabsHtml = TABS.map(
      (t, i) => `<span class="j-tab${i === this.tab ? ' on' : ''}">${t.label}</span>`,
    ).join('');
    const earned = this.earnedPhotos();
    const sel = earned[Math.min(this.cursor, Math.max(earned.length - 1, 0))];
    const cells = PHOTOS.map((p, i) => {
      const tilt = PHOTO_TILTS[i % PHOTO_TILTS.length] ?? 0;
      if (!this.state.has(p.flag)) {
        // Only the route stop's name, which the Route tab already gives away.
        const name = this.route[i]?.name ?? '';
        return `<div class="j-ph-slot" style="--j-ph-tilt:${tilt}deg">
            <span class="j-ph-corner c1"></span><span class="j-ph-corner c2"></span>
            <span class="j-ph-corner c3"></span><span class="j-ph-corner c4"></span>
            <div class="j-ph-name">${name}</div>
          </div>`;
      }
      return `<figure class="j-item j-ph-print${p === sel ? ' sel' : ''}" style="--j-ph-tilt:${tilt}deg">
          <div class="j-ph-art" data-art="${p.art}"></div>
          <figcaption class="j-ph-cap">${p.caption}</figcaption>
          <div class="j-ph-stamp">${p.stamp}</div>
        </figure>`;
    }).join('');
    const detailHtml = sel
      ? `<figure class="j-ph-big">
          <div class="j-ph-art" data-art="${sel.art}"></div>
          <figcaption class="j-ph-cap">${sel.caption}</figcaption>
          <div class="j-ph-stamp">${sel.stamp}</div>
        </figure>`
      : `<div class="j-empty">Chasca has not caught you yet.<br>Stand still near her sometime.</div>`;
    const total = this.entries.length;
    const found = this.entries.filter((e) => this.state.hasPage(e.id)).length;
    this.root.innerHTML = `
      <div class="j-book${this.opening ? ' opening' : ''}">
        ${this.headHtml(found, total, tabsHtml)}
        <div class="j-body">
          <div class="j-ph-grid">${cells}</div>
          <div class="j-detail">${detailHtml}</div>
        </div>
        <div class="j-hint">${hintLine('photos')}</div>
      </div>`;
    // Mount copies of the cached prints: the album owns the originals, and a
    // canvas can only live in one place, so each slot gets its own repaint.
    for (const slot of this.root.querySelectorAll<HTMLElement>('.j-ph-art')) {
      const src = makePhotoArt(slot.dataset.art ?? '');
      if (!src) continue;
      const copy = document.createElement('canvas');
      copy.width = src.width;
      copy.height = src.height;
      copy.getContext('2d')?.drawImage(src, 0, 0);
      slot.appendChild(copy);
    }
  }

  /**
   * The Route tab: her 1974 itinerary inside the front cover, inked over by
   * your progress. After Sicily her pencil goes silent; the blank space shows.
   */
  private renderRoute() {
    const tabsHtml = TABS.map(
      (t, i) => `<span class="j-tab${i === this.tab ? ' on' : ''}">${t.label}</span>`,
    ).join('');
    const arrived = (s: RouteStop) => !s.arrived || this.state.check(s.arrived);
    const completed = (s: RouteStop) => !!s.complete && this.state.check(s.complete);
    // "Here" is the farthest stop reached that is not yet finished.
    let hereIdx = 0;
    this.route.forEach((s, i) => {
      if (arrived(s)) hereIdx = i;
    });
    const rows = this.route
      .map((s, i) => {
        const been = arrived(s);
        const done = completed(s);
        const here = i === hereIdx && !this.state.check({ has: ['story.end'] });
        const glyph = done ? '&#10022;' : here ? '&#9656;' : been ? '&middot;' : '&#9702;';
        const cls = here ? ' here' : been ? ' been' : '';
        const note = s.nani
          ? `<div class="j-route-nani">${s.nani}</div>`
          : been
            ? `<div class="j-route-nani empty">(her pencil stops here)</div>`
            : '';
        return `<div class="j-route-stop${cls}">
            <div class="j-route-head"><span class="j-route-glyph">${glyph}</span>
            <span class="j-route-name">${s.name}</span>
            <span class="j-route-hop">${s.hop}</span></div>
            ${note}
          </div>`;
      })
      .join('<div class="j-route-stitch"></div>');
    const total = this.entries.length;
    const found = this.entries.filter((e) => this.state.hasPage(e.id)).length;
    this.root.innerHTML = `
      <div class="j-book${this.opening ? ' opening' : ''}">
        ${this.headHtml(found, total, tabsHtml)}
        <div class="j-body"><div class="j-route">
          <div class="j-sub" style="margin-bottom:8px">Inside the front cover, in pencil, 1974:</div>
          ${rows}
        </div></div>
        <div class="j-hint">${hintLine('flat')}</div>
      </div>`;
  }

  /**
   * The Tasks tab, as a page of her book: what you are doing now, written
   * large; what this place has already given you, crossed off, with its
   * dishes and people; the places behind you folded at the foot. It was one
   * row on an empty sheet.
   */
  private renderTasks() {
    const page = taskPage(this.tasks, this.activeTaskDefs(), this.state, this.state.place?.map);
    const tabsHtml = TABS.map(
      (t, i) => `<span class="j-tab${i === this.tab ? ' on' : ''}">${t.label}</span>`,
    ).join('');
    const total = this.entries.length;
    const found = this.entries.filter((e) => this.state.hasPage(e.id)).length;

    const marks = (leaf: ChapterLeaf) =>
      leaf.dishes.length || leaf.people.length
        ? `<div class="jt-marks">${leaf.dishes
            .map((d) => `<span class="jt-dish" data-dish="${d.id}" title="${d.title}"><i></i><b>${d.title}</b></span>`)
            .join('')}${leaf.people.map((p) => `<span class="jt-who">${p.title}</span>`).join('')}</div>`
        : '';
    const doneList = (leaf: ChapterLeaf) =>
      leaf.done.length ? `<ul class="jt-done">${leaf.done.map((d) => `<li>${d}</li>`).join('')}</ul>` : '';

    const nowHtml = page.now
      ? `<div class="jt-now">${page.now}</div>`
      : '<div class="jt-now quiet">Nothing pressing. Wander, talk, pet the dog.</div>';
    const bagHtml = page.carrying ? `<div class="jt-bag"><span>in your bag</span>${page.carrying}</div>` : '';
    const alsoHtml = page.also.length
      ? `<div class="jt-k">also on your mind</div><ul class="jt-also">${page.also.map((a) => `<li>${a}</li>`).join('')}</ul>`
      : '';
    const hereHtml =
      page.done.length || page.dishes.length || page.people.length
        ? doneList(page) + marks(page)
        : '<div class="jt-none">Nothing crossed off here yet. The day is young.</div>';
    // A folded leaf opens to a click or a tap, and to nothing on a keyboard
    // or a pad (the action key closes the book). For those hands the earlier
    // pages lie open, and the arrows read down to them.
    const unfold = lastDevice() === 'keys' || lastDevice() === 'pad' ? ' open' : '';
    const pastHtml = page.past.length
      ? `<div class="jt-past"><div class="jt-k">earlier pages</div>${page.past
          .map((leaf) => {
            const tally = [
              leaf.done.length ? `${leaf.done.length} crossed off` : '',
              leaf.dishes.length ? `${leaf.dishes.length} dish${leaf.dishes.length > 1 ? 'es' : ''}` : '',
              leaf.people.length ? `${leaf.people.length} ${leaf.people.length > 1 ? 'people' : 'person'}` : '',
            ]
              .filter(Boolean)
              .join(' &middot; ');
            return `<details class="jt-leaf"${unfold}><summary><span class="jt-leaf-name">${leaf.place}</span><span class="jt-leaf-tally">${tally}</span></summary>${doneList(leaf)}${marks(leaf)}</details>`;
          })
          .join('')}</div>`
      : '';

    this.root.innerHTML = `
      <div class="j-book${this.opening ? ' opening' : ''}">
        ${this.headHtml(found, total, tabsHtml)}
        <div class="j-body">
          <div class="j-tasks jt">
            <div class="jt-nowcol">
              <div class="jt-place">${page.place}<span>${page.chapterWord}</span></div>
              <div class="jt-k">now</div>
              ${nowHtml}
              ${bagHtml}
              ${alsoHtml}
            </div>
            <div class="jt-herecol">
              <div class="jt-k">crossed off here</div>
              ${hereHtml}
            </div>
            ${pastHtml}
            ${page.nani ? `<div class="jt-nani"><span>Nani, 1974, inside the front cover</span>${page.nani}</div>` : ''}
          </div>
        </div>
        <div class="j-hint">${hintLine('flat')}</div>
      </div>`;
    // Each dish gets its little painting as a mark, the same one its page has.
    for (const slot of this.root.querySelectorAll<HTMLElement>('.jt-dish i')) {
      const art = makeDishArt(slot.parentElement?.dataset.dish ?? '', 1);
      if (art) slot.appendChild(art);
    }
  }
}
