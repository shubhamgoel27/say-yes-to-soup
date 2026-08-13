import type { GameState } from '../engine/state';
import type { Dir } from '../engine/input';
import type { JournalEntry, JournalTab, TaskDef } from '../content/schema';
import type { WorldTask } from '../content/world';
import type { RouteStop } from '../content/route';
import { makeDishArt } from '../art/dishes';
import { makePhotoArt } from '../art/albumart';
import { PHOTOS } from './album';

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
    src: '/assets/games/pomological-mango-mulgoba.jpg',
    alt: 'watercolor of a mulgoba mango, whole and halved',
    caption: 'from a seed catalogue, she says. the mango the pickle used to be',
  },
  'dishes.aam': {
    src: '/assets/games/pomological-mango-mulgoba.jpg',
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

export class JournalUI {
  private tab = 0;
  private opening = false;
  private cursor = 0;

  constructor(
    private root: HTMLElement,
    private entries: JournalEntry[],
    private tasks: WorldTask[],
    private route: RouteStop[],
    private state: GameState,
  ) {}

  /** Every open thread, in priority order. */
  activeTasks(): string[] {
    return this.tasks
      // A chapter stops advising you the moment you have moved on past it.
      .filter((t) => !t.supersededBy.some((f) => this.state.has(f)))
      .filter((t) => this.state.check(t.when))
      .map((t) => t.text);
  }

  /**
   * The rhyme partner of a page, if the player holds both halves. A rhyme is
   * authored on the later page but stitches from either side.
   */
  private rhymeFor(id: string): { other: JournalEntry; note: string } | null {
    if (!this.state.hasPage(id)) return null;
    for (const e of this.entries) {
      if (e.id === id && e.rhyme && this.state.hasPage(e.rhyme.with)) {
        const other = this.entries.find((o) => o.id === e.rhyme?.with);
        if (other) return { other, note: e.rhyme.note };
      }
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
      const count =
        TABS[this.tab]?.id === 'photos' ? this.earnedPhotos().length : this.unlockedInTab().length;
      if (count === 0) return;
      if (dir === 'up') this.cursor = (this.cursor + count - 1) % count;
      else this.cursor = (this.cursor + 1) % count;
    }
    this.render();
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

  private render() {
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

    const listHtml =
      unlocked
        .map(
          (e) =>
            `<div class="j-item${e === sel ? ' sel' : ''}">${e === sel ? '&#9656; ' : ''}${e.title}${
              this.rhymeFor(e.id) ? ' <span class="j-stitch">&#10087;</span>' : ''
            }</div>`,
        )
        .join('') +
      (locked > 0
        ? `<div class="j-locked">${'&middot; '.repeat(3)}${locked} page${locked > 1 ? 's' : ''} still blank</div>`
        : '');

    const rhyme = sel ? this.rhymeFor(sel.id) : null;
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
        (sel.nani
          ? `<div class="j-nani"><span>Nani, 1974</span>${sel.nani}</div>`
          : `<div class="j-nani empty"><span>Nani, 1974</span>(she never reached this page)</div>`) +
        `<div class="j-you"><span>You</span>${sel.you}</div>` +
        (rhyme
          ? `<div class="j-thread"><div class="j-thread-rule"></div>` +
            `<span>Nani&rsquo;s margin</span>${rhyme.note}` +
            `<div class="j-thread-to">&#10087; stitched to ${rhyme.other.title}</div></div>`
          : '')
      : TABS[this.tab]?.id === 'her'
        ? `<div class="j-empty">You have her handwriting and not much else yet.<br>People along this road knew her. Some of them will say so.</div>`
        : `<div class="j-empty">Nothing noticed here yet.<br>The village is not hiding. Go and talk.</div>`;

    this.root.innerHTML = `
      <div class="j-book${this.opening ? ' opening' : ''}">
        <div class="j-head">
          <div class="j-name">Nani&rsquo;s Journal</div>
          <div class="j-progress">${
            this.stitchedCount() > 0
              ? `${this.stitchedCount()} thread${this.stitchedCount() > 1 ? 's' : ''} &middot; `
              : ''
          }${found} / ${total} pages</div>
        </div>
        <div class="j-tabs">${tabsHtml}</div>
        <div class="j-body">
          <div class="j-list">${listHtml}</div>
          <div class="j-detail">${detailHtml}</div>
        </div>
        <div class="j-hint">&#8592;&#8594; sections &nbsp; &#8593;&#8595; pages &nbsp; J close</div>
      </div>`;
    // The dish gets its little painting, mounted after the HTML lands.
    if (sel?.tab === 'dishes') {
      const slot = this.root.querySelector('.j-dishart');
      const art = slot ? makeDishArt(sel.id) : null;
      if (slot && art) slot.appendChild(art);
    }
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
        <div class="j-head">
          <div class="j-name">Nani&rsquo;s Journal</div>
          <div class="j-progress">${found} / ${total} pages</div>
        </div>
        <div class="j-tabs">${tabsHtml}</div>
        <div class="j-body">
          <div class="j-ph-grid">${cells}</div>
          <div class="j-detail">${detailHtml}</div>
        </div>
        <div class="j-hint">&#8592;&#8594; sections &nbsp; &#8593;&#8595; photos &nbsp; J close</div>
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
    this.root.querySelector('.j-ph-print.sel')?.scrollIntoView({ block: 'nearest' });
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
        <div class="j-head">
          <div class="j-name">Nani&rsquo;s Journal</div>
          <div class="j-progress">${found} / ${total} pages</div>
        </div>
        <div class="j-tabs">${tabsHtml}</div>
        <div class="j-body"><div class="j-route">
          <div class="j-sub" style="margin-bottom:8px">Inside the front cover, in pencil, 1974:</div>
          ${rows}
        </div></div>
        <div class="j-hint">&#8592;&#8594; sections &nbsp; J close</div>
      </div>`;
  }

  /** The Tasks tab: every open thread, written like directions from a friend. */
  private renderTasks() {
    const tasks = this.activeTasks();
    const tabsHtml = TABS.map(
      (t, i) => `<span class="j-tab${i === this.tab ? ' on' : ''}">${t.label}</span>`,
    ).join('');
    const items = tasks.length
      ? tasks.map((t, i) => `<div class="j-task${i === 0 ? ' now' : ''}">${t}</div>`).join('')
      : '<div class="j-empty">Nothing pressing. Wander, talk, pet the dog.</div>';
    const total = this.entries.length;
    const found = this.entries.filter((e) => this.state.hasPage(e.id)).length;

    this.root.innerHTML = `
      <div class="j-book${this.opening ? ' opening' : ''}">
        <div class="j-head">
          <div class="j-name">Nani&rsquo;s Journal</div>
          <div class="j-progress">${found} / ${total} pages</div>
        </div>
        <div class="j-tabs">${tabsHtml}</div>
        <div class="j-body">
          <div class="j-tasks">
            <div class="j-sub" style="margin-bottom:10px">Loose threads, most pressing first:</div>
            ${items}
          </div>
        </div>
        <div class="j-hint">&#8592;&#8594; sections &nbsp; J close</div>
      </div>`;
  }
}
