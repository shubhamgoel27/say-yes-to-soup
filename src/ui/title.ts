import type { Dir } from '../engine/input';
import { makeCoverArt } from '../art/cover';
import { CHAR_H, CHAR_W, DIR_ROW, PLAYER_LOOK, makeSheet } from '../art/character';
import { ART } from '../engine/config';
import type { PlayerLook, SaveData } from '../engine/state';
import {
  SLOT_COUNT,
  activeSlot,
  eraseSlot,
  firstBlankSlot,
  packSlot,
  peekSlot,
  setActiveSlot,
  slotOccupied,
  unpackJournal,
  writeSlotRaw,
} from '../engine/state';
import { ROUTE } from '../content/route';
import { CHAPTERS, JOURNAL, JOURNAL_BY_ID, REGION_MAPS } from '../content/world';
import { onTouchTap, touchActive } from './pointer';
import { isCoarseTouch } from './responsive';

/**
 * The front door of the game: a quiet title card, then Nani's letter as the
 * framing device. Both are DOM overlays above the running world, which idles
 * softly behind them like an attract screen.
 */

export type TitleChoice = 'new' | 'continue' | 'journals' | 'settings' | 'credits';

/** A touch-first device: the hints speak of taps, not of Space and arrows.
 * The same capability test as keysOrTaps and the pad, so every surface
 * agrees; desktop pointers are fine, never coarse, so nothing changes there. */
const COARSE = isCoarseTouch();

/**
 * One quiet line under Continue: where the journey paused and how far the
 * journal has come. Read straight from the save on disk (the title renders
 * before the engine restores state), and any trouble reading it means no
 * line, never a crash.
 */
function welcomeBackLine(): string | null {
  try {
    const data = peekSlot(activeSlot());
    if (!data) return null;
    const mapId = typeof data.place?.map === 'string' ? data.place.map : '';
    const mapName = REGION_MAPS[mapId]?.name;
    const chapter = CHAPTERS.find((c) => c.maps.some((m) => m.id === mapId));
    const stop = chapter ? ROUTE.find((r) => r.id === chapter.id) : undefined;
    const where = [...new Set([mapName, stop?.name].filter(Boolean))].join(', ');
    if (!where) return null;
    // Only pages this build knows: a save carrying ids from an older or
    // newer journal (renamed pages, dev grants) must not inflate the count.
    const held = new Set(
      Array.isArray(data.journal)
        ? data.journal.filter((p): p is string => typeof p === 'string' && JOURNAL_BY_ID.has(p))
        : [],
    );
    const threads = JOURNAL.filter(
      (e) => e.rhyme && held.has(e.id) && held.has(e.rhyme.with),
    ).length;
    const tally = [
      `${held.size} page${held.size === 1 ? '' : 's'}`,
      threads ? `${threads} thread${threads === 1 ? '' : 's'}` : '',
    ]
      .filter(Boolean)
      .join(', ');
    return `${where} &middot; ${tally}`;
  } catch {
    return null;
  }
}

/**
 * Whether the old code lives in this save. Read the same way welcomeBackLine
 * reads (title renders before the engine restores state); any trouble reading
 * simply means no shimmer.
 */
function savedKonami(): boolean {
  return savedFlag('konami');
}

/** Whether the journal on the table carries a flag; trouble reads as no. */
function savedFlag(flag: string): boolean {
  try {
    const data = peekSlot(activeSlot());
    return (data?.flags ?? []).includes(flag);
  } catch {
    return false;
  }
}

/**
 * A journal's flyleaf, summed up for the shelf: who signed it, where the
 * journey paused, how many pages are filled. Null means a blank journal.
 */
function flyleafLine(data: SaveData | null): string | null {
  if (!data) return null;
  const name = data.name && data.name.trim() ? data.name : 'unsigned';
  const mapId = typeof data.place?.map === 'string' ? data.place.map : '';
  const where = REGION_MAPS[mapId]?.name ?? REGION_MAPS['village']?.name ?? 'the star plain';
  const n = Array.isArray(data.journal) ? data.journal.length : 0;
  return `${name} &middot; ${where} &middot; ${n} page${n === 1 ? '' : 's'}`;
}

/**
 * When a journal was last written in, as the shelf says it: today,
 * yesterday, or a short date (with the year once it is not this one).
 * Saves from before the date was kept simply have no line.
 */
function walkedLine(ms: unknown): string | null {
  if (typeof ms !== 'number' || !Number.isFinite(ms)) return null;
  const d = new Date(ms);
  const now = new Date();
  const day = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const ago = Math.round((day(now) - day(d)) / 86400000);
  if (ago <= 0) return 'last walked today';
  if (ago === 1) return 'last walked yesterday';
  const opts: Intl.DateTimeFormatOptions =
    d.getFullYear() === now.getFullYear()
      ? { day: 'numeric', month: 'short' }
      : { day: 'numeric', month: 'short', year: 'numeric' };
  return `last walked ${d.toLocaleDateString(undefined, opts)}`;
}

/**
 * A real question before anything is erased: a small card with the journal
 * named, plain words about what will be lost, and two buttons. The safe
 * one is chosen first, and the card ignores presses for a beat after it
 * opens, so a double press or a double tap can never answer it.
 */
type ConfirmCard = {
  kicker: string;
  body: string;
  keep: string;
  act: string;
  /** 0 = keep (the default), 1 = act. */
  sel: 0 | 1;
  openedAt: number;
  onAct: () => void;
};
/** How long a fresh confirm card ignores presses (ms). */
const CONFIRM_SETTLE_MS = 450;

/** Hand a packed journal to the browser as a small download; returns the
 * file's name so the shelf can say where it went. */
function downloadPack(name: string | null, text: string): string {
  const slug =
    (name ?? '')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\p{L}\p{N}-]/gu, '') || 'unsigned';
  const url = URL.createObjectURL(new Blob([text], { type: 'application/octet-stream' }));
  const a = document.createElement('a');
  a.href = url;
  // Not her name: Carmen says "Zoila" out loud in chapter one, and a file
  // in the downloads folder must not say it first.
  const file = `nanis-journal-${slug}.soup`;
  a.download = file;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Revoked on a delay so slower browsers finish reading the blob first.
  setTimeout(() => URL.revokeObjectURL(url), 4000);
  return file;
}

/** What each shelf row can do. Blank journals only open or receive; a
 * finished journal also offers a second reading. */
type ShelfVerb = 'open' | 'read again' | 'pack' | 'unpack' | 'erase';
const VERBS_FULL: ShelfVerb[] = ['open', 'pack', 'unpack', 'erase'];
const VERBS_ENDED: ShelfVerb[] = ['open', 'read again', 'pack', 'unpack', 'erase'];
const VERBS_BLANK: ShelfVerb[] = ['open', 'unpack'];

/** Whether this journal's journey reached its last page. Read straight off
 * the shelf, the way the flyleaf lines are; trouble reading means no verb. */
function journeyEnded(row: number): boolean {
  try {
    return (peekSlot(row)?.flags ?? []).includes('story.end');
  } catch {
    return false;
  }
}

export class TitleScreen {
  private cursor = 0;
  /** The cover row a side trip left from, restored when the cover returns. */
  private returnTo: string | null = null;
  private options: { id: TitleChoice; label: string }[] = [];
  private hasSave = false;
  /** With the old code in the save, the woven band shimmers once on load. */
  private konami = false;
  /** Spent after the first shimmer so returning from the shelf, settings,
   * or credits does not replay it. */
  private shimmered = false;
  /** The erase question, when one is being asked; see ConfirmCard. */
  private confirm: ConfirmCard | null = null;
  /** Begin again has a blank journal to start in (nothing is erased). */
  private blankFree = false;
  /** The welcome-back line under Continue; null when there is nothing to say. */
  private welcomeBack: string | null = null;
  /** The journal on the table has been written to its last page. */
  private finished = false;

  // ---- the shelf: three journals, one open on the table ----
  private shelf = false;
  private shelfRow = 0;
  private shelfVerb = 0;
  /** One quiet line under the rows: gentle rejections and confirmations. */
  private shelfNote: string | null = null;

  constructor(
    private titleEl: HTMLElement,
    private letterEl: HTMLElement,
    /** Called when the journal on the table changed under the engine's feet:
     * a different slot chosen, or the active slot erased or unpacked over. */
    private onShelfChange?: () => void,
    /** Called when a finished journal's second reading is confirmed. The
     * engine owns everything after: the fresh journey, the inherited words,
     * the flyleaf. The shelf only carries the request. */
    private onSecondReading?: (row: number) => void,
    /** Called when Begin again is confirmed over the last full journal. */
    private onEraseAndBegin?: () => void,
  ) {
    this.titleEl.addEventListener('click', this.onShelfClick);
    this.titleEl.addEventListener('mouseover', this.onShelfHover);
    // A finger cannot hover first: the tapped element is taken on
    // pointerdown, before the steer's re-render can move the verbs line
    // under the point, and acted on at pointerup so the unpack verb's file
    // picker still carries the browser's user activation.
    onTouchTap(this.titleEl, () => this.shelfOpen || this.confirmOpen, (t) => this.shelfTap(t));
  }

  get titleOpen(): boolean {
    return !this.titleEl.hidden;
  }
  get letterOpen(): boolean {
    return !this.letterEl.hidden;
  }

  showTitle(hasSave: boolean) {
    this.hasSave = hasSave;
    this.confirm = null;
    this.blankFree = hasSave && firstBlankSlot() !== null;
    this.shelf = false;
    this.welcomeBack = hasSave ? welcomeBackLine() : null;
    this.finished = hasSave && savedFlag('story.end');
    this.konami = !this.shimmered && hasSave && savedKonami();
    if (this.konami) this.shimmered = true;
    this.options = hasSave
      ? [
          { id: 'continue', label: 'Continue the journey' },
          { id: 'new', label: 'Begin again' },
          { id: 'journals', label: 'Journals' },
          { id: 'settings', label: 'Settings' },
          { id: 'credits', label: 'Credits' },
        ]
      : [
          { id: 'new', label: 'Begin the journey' },
          { id: 'journals', label: 'Journals' },
          { id: 'settings', label: 'Settings' },
          { id: 'credits', label: 'Credits' },
        ];
    this.cursor = Math.max(0, this.options.findIndex((o) => o.id === this.returnTo));
    this.returnTo = null;
    this.titleEl.hidden = false;
    this.render();
  }

  hideTitle() {
    this.shelf = false;
    this.confirm = null;
    this.titleEl.hidden = true;
  }

  /** With no argument, Nani's framing letter. With one, mail from a friend.
   * `playerName` (already limited to letters, spaces, hyphens and apostrophes) personalises the
   * framing letter's salutation; blank keeps Nani's original line. */
  showLetter(mail?: { from: string; body: string[]; typed?: boolean }, playerName?: string | null) {
    this.letterEl.hidden = false;
    const dear = playerName
      ? `For ${playerName}, whenever you are grown,`
      : 'For my grandchild, whenever you are grown,';
    const paragraphs = mail
      ? mail.body.map((p) => `<p>${p}</p>`).join('')
      : `
          <p>${dear}</p>
          <p>I meant to finish this journal. I started it in 1974, and the
          world kept being bigger than the pages. So now the empty half is yours.</p>
          <p>Start where I started: <b>Ch&rsquo;aska Pampa</b>, the star plain.
          Say yes to soup. Ask about the bread. If someone corrects you, you
          are learning; thank them twice.</p>
          <p>Walk slowly. That is the whole trick.</p>`;
    const sign = mail ? mail.from : 'Nani';
    this.letterEl.innerHTML = `
      <div class="letter-fold">
        <div class="letter-paper${mail?.typed ? ' typed' : ''}">
          <div class="letter-body">
            ${paragraphs}
            <p class="letter-sign">${sign}</p>
          </div>
          <div class="letter-hint">${COARSE ? 'tap to put the letter down' : 'press Space'}</div>
        </div>
      </div>`;
  }

  hideLetter() {
    this.letterEl.hidden = true;
  }

  onDir(dir: Dir) {
    if (!this.titleOpen || this.shelf || this.options.length < 2) return;
    const n = this.options.length;
    if (dir === 'up') this.cursor = (this.cursor + n - 1) % n;
    else if (dir === 'down') this.cursor = (this.cursor + 1) % n;
    else return;
    this.renderMenu();
  }

  /**
   * Returns the chosen option when the title menu is confirmed. "Begin
   * again" starts in a blank journal on the shelf whenever there is one, so
   * nothing is lost. Only when all three are written in does it ask, on a
   * confirm card, before the journal on the table is erased; that path
   * returns 'none' here and the card's own button calls onEraseAndBegin.
   */
  choose(): TitleChoice | 'none' {
    if (this.confirm) return 'none';
    const id = this.options[this.cursor]?.id ?? 'new';
    if (id === 'new' && this.hasSave && firstBlankSlot() === null) {
      const line = flyleafLine(peekSlot(activeSlot())) ?? 'this journal';
      this.openConfirm({
        kicker: 'every journal on the shelf is written in',
        body: `To begin again here, the journal on the table is erased:<span class="cf-line">${line}</span>Its pages cannot be brought back. To keep it, erase a different journal from the Journals shelf instead.`,
        keep: 'Keep it',
        act: 'Erase it and begin',
        onAct: () => this.onEraseAndBegin?.(),
      });
      return 'none';
    }
    // A side trip off the cover (Journals, Settings, Credits) comes back to
    // the row it left from; anything else starts the cover at the top.
    this.returnTo = id === 'journals' || id === 'settings' || id === 'credits' ? id : null;
    return id;
  }

  // ------------------------------------------------------- the confirm card

  get confirmOpen(): boolean {
    return this.titleOpen && this.confirm !== null;
  }

  private openConfirm(c: Omit<ConfirmCard, 'sel' | 'openedAt'>) {
    this.confirm = { ...c, sel: 0, openedAt: performance.now() };
    this.renderConfirm();
  }

  /** Any arrow moves between the two buttons. */
  confirmDir(_dir: Dir) {
    if (!this.confirm) return;
    this.confirm.sel = this.confirm.sel === 0 ? 1 : 0;
    this.renderConfirm();
  }

  /** Esc: the safe answer. */
  confirmBack() {
    this.confirm = null;
    this.renderConfirm();
  }

  /** Space or a click on the card's chosen button. 'none' while the card
   * is still settling (the second half of a double press lands here). */
  confirmActivate(): 'confirm' | 'cancel' | 'none' {
    const c = this.confirm;
    if (!c) return 'none';
    if (performance.now() - c.openedAt < CONFIRM_SETTLE_MS) return 'none';
    this.confirm = null;
    this.renderConfirm();
    if (c.sel === 0) return 'cancel';
    c.onAct();
    return 'confirm';
  }

  /** The card sits over whatever is behind it (cover or shelf) as its own
   * element, so the cover's art is never rebuilt under it. */
  private renderConfirm() {
    this.titleEl.querySelector('.cf-veil')?.remove();
    const c = this.confirm;
    if (!c || this.titleEl.hidden) return;
    const veil = document.createElement('div');
    veil.className = 'cf-veil';
    veil.innerHTML = `
      <div class="cf-card" role="alertdialog" aria-label="${c.kicker}">
        <div class="cf-kicker">${c.kicker}</div>
        <div class="cf-body">${c.body}</div>
        <div class="cf-btns">
          <button type="button" class="cf-btn${c.sel === 0 ? ' sel' : ''}" data-cf="0">${c.keep}</button>
          <button type="button" class="cf-btn cf-act${c.sel === 1 ? ' sel' : ''}" data-cf="1">${c.act}</button>
        </div>
        <div class="cf-hint">${COARSE ? 'tap one' : '&#8592;&#8594; choose &nbsp;&middot;&nbsp; Space answers &nbsp;&middot;&nbsp; Esc keeps it'}</div>
      </div>`;
    this.titleEl.appendChild(veil);
  }

  // ------------------------------------------------------------- the shelf

  get shelfOpen(): boolean {
    return this.titleOpen && this.shelf;
  }

  openShelf() {
    this.shelf = true;
    this.shelfRow = activeSlot();
    this.shelfVerb = 0;
    this.confirm = null;
    this.shelfNote = null;
    this.renderShelf();
  }

  /** Back to the cover, with Continue and Begin reflecting the shelf. */
  closeShelf() {
    this.showTitle(slotOccupied(activeSlot()));
  }

  private shelfVerbs(row: number): ShelfVerb[] {
    if (!slotOccupied(row)) return VERBS_BLANK;
    return journeyEnded(row) ? VERBS_ENDED : VERBS_FULL;
  }

  shelfDir(dir: Dir) {
    if (dir === 'up' || dir === 'down') {
      const d = dir === 'down' ? 1 : SLOT_COUNT - 1;
      this.shelfRow = (this.shelfRow + d) % SLOT_COUNT;
      this.shelfVerb = 0;
      this.shelfNote = null;
    } else {
      const verbs = this.shelfVerbs(this.shelfRow);
      const d = dir === 'right' ? 1 : verbs.length - 1;
      this.shelfVerb = (this.shelfVerb + d) % verbs.length;
    }
    this.renderShelf();
  }

  /**
   * Confirm the shelf's current verb. Returns which sound the moment earns:
   * 'confirm' for a deed done, 'warn' for an armed warning, 'none' for quiet.
   */
  shelfActivate(): 'confirm' | 'warn' | 'none' {
    const row = this.shelfRow;
    const verb = this.shelfVerbs(row)[this.shelfVerb] ?? 'open';
    if (verb === 'open') {
      setActiveSlot(row);
      this.onShelfChange?.();
      // A journal just put on the table: the cover offers it at the top.
      this.returnTo = null;
      this.showTitle(slotOccupied(row));
      return 'confirm';
    }
    if (verb === 'pack') {
      const packed = packSlot(row);
      if (!packed) {
        this.shelfNote = 'there is nothing here to pack.';
        this.renderShelf();
        return 'none';
      }
      const file = downloadPack(packed.name, packed.text);
      // Say where it went: a file the browser saved, not a copy it keeps.
      this.shelfNote = `packed into <b>${file}</b>, in your downloads.`;
      this.renderShelf();
      return 'confirm';
    }
    if (verb === 'unpack') {
      this.pickPack(row);
      return 'confirm';
    }
    if (verb === 'read again') {
      // A second reading: the same fresh journey Begin again starts, except
      // the words come along. It changes a journal, so it asks first.
      this.shelfNote = null;
      this.openConfirm({
        kicker: 'a second reading',
        body: `This journal starts again from its first page:<span class="cf-line">${flyleafLine(peekSlot(row)) ?? ''}</span>The words you learned come with you. Every other page goes blank.`,
        keep: 'Not now',
        act: 'Begin the second reading',
        onAct: () => this.onSecondReading?.(row),
      });
      return 'warn';
    }
    // erase: a real question, never a second press.
    this.shelfNote = null; // a stale note under a question reads wrong
    this.openConfirm({
      kicker: 'erase this journal?',
      body: `<span class="cf-line">${flyleafLine(peekSlot(row)) ?? ''}</span>Every page in it will be erased. It cannot be brought back.`,
      keep: 'Keep it',
      act: 'Erase it',
      onAct: () => {
        eraseSlot(row);
        if (row === activeSlot()) this.onShelfChange?.();
        this.shelfVerb = 0;
        this.shelfNote = 'erased; the pages are blank again.';
        this.renderShelf();
      },
    });
    return 'warn';
  }

  /** Open the browser's file picker for a packed journal. The input lives
   * in the document while the picker is up; some browsers ignore detached
   * ones. It is invisible and removed as soon as the picker settles. */
  private pickPack(row: number) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.soup,application/json,text/plain';
    input.style.display = 'none';
    document.body.appendChild(input);
    input.addEventListener('change', () => {
      const file = input.files?.[0];
      input.remove();
      if (!file) return;
      void file.text().then((text) => this.receivePack(row, text));
    });
    input.addEventListener('cancel', () => input.remove());
    input.click();
  }

  /** A picked file arrives here: seal and parse checked, then the confirm. */
  private receivePack(row: number, text: string) {
    if (!this.shelfOpen) return; // the shelf closed while the picker was up
    const raw = unpackJournal(text);
    if (!raw) {
      this.shelfNote = 'this journal&rsquo;s ink has run; it cannot be read.';
      this.renderShelf();
      return;
    }
    if (slotOccupied(row)) {
      this.shelfRow = row;
      this.shelfNote = null;
      this.renderShelf();
      this.openConfirm({
        kicker: 'a journal already rests here',
        body: `<span class="cf-line">${flyleafLine(peekSlot(row)) ?? ''}</span>Shelving the unpacked journal here erases this one. It cannot be brought back.`,
        keep: 'Keep this one',
        act: 'Shelve the new one over it',
        onAct: () => this.commitImport(row, raw),
      });
      return;
    }
    this.commitImport(row, raw);
  }

  private commitImport(row: number, raw: string) {
    if (!writeSlotRaw(row, raw)) {
      this.shelfNote = 'the shelf would not take it; nothing was changed.';
    } else {
      if (row === activeSlot()) this.onShelfChange?.();
      // A blank row just grew more verbs; the cursor starts them over.
      this.shelfVerb = 0;
      this.shelfNote = 'unpacked; the journal is back on the shelf.';
    }
    this.renderShelf();
  }

  // ---- shelf pointer support, in the title's own hover-then-click idiom ----

  private onShelfClick = (e: MouseEvent) => {
    if (touchActive() || !(this.shelfOpen || this.confirmOpen)) return;
    this.shelfTap(e.target as HTMLElement);
  };

  /** One tap or click on the shelf (or the confirm card), mouse and touch alike. */
  private shelfTap(t: HTMLElement) {
    if (this.confirm) {
      // The card owns every tap while it asks; a tap beside it is no answer.
      const btn = t.closest<HTMLElement>('.cf-btn');
      if (!btn) return;
      this.confirm.sel = btn.dataset.cf === '1' ? 1 : 0;
      this.confirmActivate();
      return;
    }
    const verbEl = t.closest<HTMLElement>('.sh-verb');
    if (verbEl) {
      this.steerShelf(verbEl);
      this.shelfActivate();
      return;
    }
    const rowEl = t.closest<HTMLElement>('.sh-row');
    if (rowEl) {
      // Clicking the journal itself is the primary deed: open it.
      this.shelfRow = Number.parseInt(rowEl.dataset.row ?? '0', 10);
      this.shelfVerb = 0;
      this.shelfActivate();
    }
  }

  private onShelfHover = (e: MouseEvent) => {
    if (touchActive() || !this.shelfOpen || this.confirm) return;
    const el = (e.target as HTMLElement).closest<HTMLElement>('.sh-verb, .sh-row');
    if (el) this.steerShelf(el);
  };

  /** Move the cursor to a hovered row or verb without acting on it. */
  private steerShelf(el: HTMLElement) {
    const rowEl = el.closest<HTMLElement>('.sh-row');
    const row = Number.parseInt(rowEl?.dataset.row ?? `${this.shelfRow}`, 10);
    const verb = el.classList.contains('sh-verb')
      ? Number.parseInt(el.dataset.verb ?? '0', 10)
      : this.shelfVerb;
    if (row === this.shelfRow && verb === this.shelfVerb) return;
    if (row !== this.shelfRow) {
      this.shelfVerb = el.classList.contains('sh-verb') ? verb : 0;
      this.shelfNote = null;
    } else if (verb !== this.shelfVerb) {
      this.shelfVerb = verb;
    }
    this.shelfRow = row;
    this.renderShelf();
  }

  private renderShelf() {
    const open = activeSlot();
    const rows = Array.from({ length: SLOT_COUNT }, (_, i) => {
      const data = peekSlot(i);
      const line = flyleafLine(data);
      const when = walkedLine(data?.walked);
      const sel = i === this.shelfRow;
      const verbs = sel
        ? this.shelfVerbs(i)
            .map((v, j) => {
              const on = j === this.shelfVerb;
              return `<span class="sh-verb${on ? ' on' : ''}" data-verb="${j}">${v}</span>`;
            })
            .join('<span class="sh-dot">&middot;</span>')
        : '';
      return `
        <div class="sh-row${sel ? ' sel' : ''}${line ? '' : ' blank'}" data-row="${i}">
          <span class="sh-band"></span>
          <div class="sh-body">
            <div class="sh-fly">${sel ? '<span class="t-arr">&#9656;</span>&nbsp;' : ''}${line ?? 'a blank journal'}${i === open ? '<span class="sh-mark">open on the table</span>' : ''}</div>
            ${when ? `<div class="sh-when">${when}</div>` : ''}
            ${sel ? `<div class="sh-verbs">${verbs}</div>` : ''}
          </div>
        </div>`;
    }).join('');
    this.titleEl.innerHTML = `
      <div class="t-card">
        <div class="sh-card">
          <div class="sh-kicker">the shelf by the stove</div>
          <div class="sh-heading">Nani&rsquo;s journals</div>
          <div class="sh-rows">${rows}</div>
          <div class="sh-note${this.shelfNote ? '' : ' empty'}">${this.shelfNote ?? ''}</div>
          <div class="sh-hint">${
            COARSE
              ? 'tap a journal to open it &nbsp;&middot;&nbsp; tap a word beneath it to act'
              : '&#8593;&#8595; choose a journal &nbsp;&middot;&nbsp; &#8592;&#8594; choose what to do &nbsp;&middot;&nbsp; Space does it &nbsp;&middot;&nbsp; Esc back'
          }</div>
        </div>
      </div>`;
    this.renderConfirm();
  }

  /** One menu row's markup; shared by the full render and the cursor update. */
  private optHtml(i: number): string {
    const o = this.options[i];
    if (!o) return '';
    // Begin again says, before it is chosen, that nothing will be lost.
    const sub =
      o.id === 'continue' && this.welcomeBack
        ? `<div class="t-opt-sub">${this.welcomeBack}</div>`
        : o.id === 'new' && this.blankFree && i === this.cursor
          ? '<div class="t-opt-sub">in a blank journal; this one stays on the shelf</div>'
          : '';
    return `${i === this.cursor ? '<span class="t-arr">&#9656;</span>&nbsp;' : ''}${o.label}${sub}`;
  }

  private optClass(i: number): string {
    return `t-opt${i === this.cursor ? ' sel' : ''}`;
  }

  /**
   * A cursor move touches only the menu rows. Rebuilding the whole cover on
   * every arrow press repainted the gouache and restarted the steam, the
   * breathing canvas and the manicule's pulse, a flicker per keypress.
   * Only rows whose state changed are rewritten.
   */
  private renderMenu() {
    const rows = this.titleEl.querySelectorAll<HTMLElement>('.t-menu .t-opt');
    if (rows.length !== this.options.length) {
      this.render();
      return;
    }
    rows.forEach((el, i) => {
      const cls = this.optClass(i);
      const html = this.optHtml(i);
      if (el.className !== cls || el.dataset.html !== html) {
        el.className = cls;
        el.innerHTML = html;
        el.dataset.html = html;
      }
    });
  }

  private render() {
    const menu = this.options
      .map((_, i) => `<div class="${this.optClass(i)}">${this.optHtml(i)}</div>`)
      .join('');
    // The shimmer plays once on load; cursor moves rebuild this DOM and must
    // not replay it, so the flag is spent on the first render.
    const shimmer = this.konami;
    this.konami = false;
    this.titleEl.innerHTML = `
      <div class="t-card">
        <div class="t-cover">
          <div class="t-band${shimmer ? ' shimmer' : ''}"></div>
          <div class="t-kicker">${this.finished ? 'a journal, full' : 'a journal, half full'}</div>
          <div class="t-name">SAY YES<br>TO SOUP</div>
          <div class="t-art">
            <span class="t-steam s1"></span><span class="t-steam s2"></span><span class="t-steam s3"></span>
          </div>
          <div class="t-sub">an unhurried journey through the world&rsquo;s kitchens, courtyards, and words</div>
          <div class="t-menu">${menu}</div>
        </div>
        <div class="t-controls">${
          COARSE
            ? `
          <span><b>thumb, lower left</b>&nbsp; walk</span>
          <span><b>tap people</b>&nbsp; talk</span>
          <span><b>&#9998;</b>&nbsp; the journal</span>`
            : `
          <span><b>&#8592;&#8593;&#8595;&#8594;</b> / WASD / click&nbsp; walk</span>
          <span><b>Space</b> / Z / click&nbsp; talk &amp; touch things</span>
          <span><b>J</b>&nbsp; the journal</span>`
        }
        </div>
      </div>`;
    const art = this.titleEl.querySelector('.t-art');
    if (art) art.insertBefore(makeCoverArt(), art.firstChild);
    this.renderConfirm();
  }
}

// ---------------------------------------------------------------- the flyleaf
//
// Between "Begin the journey" and Nani's letter: a quiet card in the journal
// idiom. Step one writes a name on the flyleaf (or leaves it blank); step two
// dresses the small traveler she sketched in the margin. Deliberately slight,
// three rows, not a character editor.

/** What the flyleaf hands back: a name (or blank) and the traveler's look. */
export type FlyleafResult = { name: string | null; look: PlayerLook };

/** Option palettes, defaults first so an untouched card is the current look. */
const CC_SKINS = [PLAYER_LOOK.skin, '#f2cfa5', '#b3814f', '#7c4f30'];
const CC_CLOTHS = [PLAYER_LOOK.cloth, '#3f7fb0', '#6b8e4e', '#5c4a6e'];
const CC_HAIRS = [PLAYER_LOOK.hair, '#191310', '#7a4a2a'];
const CC_ROWS: { label: string; options: string[] }[] = [
  { label: 'skin', options: CC_SKINS },
  { label: 'poncho', options: CC_CLOTHS },
  { label: 'hair', options: CC_HAIRS },
];

/** The longest name the flyleaf takes ("Bartholomew-Ashwini" fits). */
const NAME_MAX = 24;
/** Keep whatever the keyboard offers down to letters, single spaces, and the
 * hyphens and apostrophes real names carry (Bartholomew-Ashwini, O'Neill,
 * N’Dour). Nothing that could be markup survives. */
export function ccClean(raw: string): string {
  return raw
    .replace(/[\u2018\u2019\u02bc]/g, '\u2019')
    .replace(/'/g, '\u2019')
    .replace(/[^\p{L}\p{M} \-\u2019]/gu, '')
    .replace(/ {2,}/g, ' ')
    .replace(/-{2,}/g, '-')
    .slice(0, NAME_MAX);
}

export class NamingCard {
  private step: 1 | 2 = 1;
  private row = 0;
  private idx = [0, 0, 0];
  private name = '';
  private onDone: ((res: FlyleafResult) => void) | null = null;
  private onCancel: (() => void) | null = null;
  private sheet: HTMLCanvasElement | null = null;
  private raf = 0;
  private animT = 0;

  constructor(private root: HTMLElement) {
    this.root.addEventListener('click', this.onClick);
  }

  get isOpen(): boolean {
    return !this.root.hidden;
  }

  /** `onCancel` runs when Esc backs out of the first step: nothing chosen,
   * nothing written, the cover comes back with the old journey intact. */
  open(onDone: (res: FlyleafResult) => void, onCancel?: () => void) {
    this.onDone = onDone;
    this.onCancel = onCancel ?? null;
    this.step = 1;
    this.row = 0;
    this.idx = [0, 0, 0];
    this.name = '';
    this.root.hidden = false;
    // Capture phase, so the game's own window listener never sees these keys:
    // the world's input rests while a pen is in the player's hand.
    window.addEventListener('keydown', this.onKey, true);
    this.render();
  }

  private shut() {
    window.removeEventListener('keydown', this.onKey, true);
    cancelAnimationFrame(this.raf);
    this.root.hidden = true;
    this.root.innerHTML = '';
    this.sheet = null;
  }

  private finish() {
    this.shut();
    const done = this.onDone;
    this.onDone = null;
    this.onCancel = null;
    done?.({
      name: this.name.trim() || null,
      look: {
        skin: CC_SKINS[this.idx[0] ?? 0] ?? PLAYER_LOOK.skin,
        cloth: CC_CLOTHS[this.idx[1] ?? 0] ?? PLAYER_LOOK.cloth,
        hair: CC_HAIRS[this.idx[2] ?? 0] ?? PLAYER_LOOK.hair,
      },
    });
  }

  /** Enter confirms the step. A blank name is a fine answer ("traveler"). */
  private advance() {
    if (this.step === 1) {
      this.step = 2;
      this.render();
    } else {
      this.finish();
    }
  }

  /** Esc steps back: from the look to the name, from the name to the cover. */
  private back() {
    if (this.step === 2) {
      this.step = 1;
      this.render();
      return;
    }
    this.shut();
    const cancel = this.onCancel;
    this.onDone = null;
    this.onCancel = null;
    cancel?.();
  }

  private onKey = (e: KeyboardEvent) => {
    if (!this.isOpen) return;
    e.stopPropagation();
    if (e.code === 'Escape') {
      e.preventDefault();
      this.back();
      return;
    }
    if (e.code === 'Enter') {
      e.preventDefault();
      this.advance();
      return;
    }
    if (this.step !== 2) return; // step 1: every other key belongs to the pen
    const k = e.code;
    if (k === 'Space') {
      e.preventDefault();
      this.advance();
    } else if (k === 'ArrowUp' || k === 'KeyW') {
      e.preventDefault();
      this.row = (this.row + CC_ROWS.length - 1) % CC_ROWS.length;
      this.renderRows();
    } else if (k === 'ArrowDown' || k === 'KeyS') {
      e.preventDefault();
      this.row = (this.row + 1) % CC_ROWS.length;
      this.renderRows();
    } else if (k === 'ArrowLeft' || k === 'KeyA') {
      e.preventDefault();
      this.cycle(this.row, -1);
    } else if (k === 'ArrowRight' || k === 'KeyD') {
      e.preventDefault();
      this.cycle(this.row, 1);
    }
  };

  private onClick = (e: MouseEvent) => {
    if (!this.isOpen) return;
    const t = e.target as HTMLElement;
    const arr = t.closest<HTMLElement>('.cc-arr');
    if (arr) {
      const row = Number.parseInt(arr.dataset.row ?? '0', 10);
      this.row = row;
      this.cycle(row, arr.dataset.d === '-1' ? -1 : 1);
      return;
    }
    const rowEl = t.closest<HTMLElement>('.cc-row');
    if (rowEl) {
      this.row = Number.parseInt(rowEl.dataset.row ?? '0', 10);
      this.renderRows();
      return;
    }
    if (t.closest('.cc-btn')) this.advance();
  };

  private cycle(row: number, d: number) {
    const opts = CC_ROWS[row]?.options;
    if (!opts) return;
    this.idx[row] = ((this.idx[row] ?? 0) + d + opts.length) % opts.length;
    this.sheet = null; // repainted lazily by the walk loop
    this.renderRows();
  }

  private currentLook(): PlayerLook {
    return {
      skin: CC_SKINS[this.idx[0] ?? 0] ?? PLAYER_LOOK.skin,
      cloth: CC_CLOTHS[this.idx[1] ?? 0] ?? PLAYER_LOOK.cloth,
      hair: CC_HAIRS[this.idx[2] ?? 0] ?? PLAYER_LOOK.hair,
    };
  }

  private render() {
    if (this.step === 1) {
      this.root.innerHTML = `
        <div class="cc-paper">
          <div class="cc-kicker">the name on the flyleaf</div>
          <p class="cc-copy">Nani left the flyleaf blank for you. What do the villages call you?</p>
          <input class="cc-input" type="text" maxlength="${NAME_MAX}" spellcheck="false"
            autocomplete="off" placeholder="traveler" aria-label="your name" />
          <div class="cc-actions"><button class="cc-btn" type="button">write it down</button></div>
          <div class="cc-hint">${
            COARSE
              ? 'leave it blank and you are &ldquo;traveler&rdquo;'
              : 'leave it blank and you are &ldquo;traveler&rdquo; &middot; Enter writes it in &middot; Esc back'
          }</div>
        </div>`;
      const input = this.root.querySelector<HTMLInputElement>('.cc-input');
      if (input) {
        input.value = this.name;
        input.addEventListener('input', () => {
          const clean = ccClean(input.value);
          if (clean !== input.value) input.value = clean;
          this.name = clean;
        });
        input.focus();
      }
      return;
    }
    const rows = CC_ROWS.map(
      (r, i) => `
        <div class="cc-row" data-row="${i}">
          <span class="cc-arr" data-row="${i}" data-d="-1">&lsaquo;</span>
          <span class="cc-mid"><span class="cc-lab">${r.label}</span><span class="cc-dots" data-row="${i}"></span></span>
          <span class="cc-arr" data-row="${i}" data-d="1">&rsaquo;</span>
        </div>`,
    ).join('');
    this.root.innerHTML = `
      <div class="cc-paper">
        <div class="cc-kicker">the traveler in the margin</div>
        <p class="cc-copy">Nani sketched a small traveler beside the first entry. Make it yours.</p>
        <div class="cc-fig"><canvas width="${CHAR_W * ART * 2}" height="${CHAR_H * ART * 2}"></canvas></div>
        <div class="cc-rows">${rows}</div>
        <div class="cc-actions"><button class="cc-btn" type="button">set out</button></div>
        <div class="cc-hint">${
          COARSE ? 'tap &lsaquo; &rsaquo; to choose' : 'arrows choose &middot; Enter sets out &middot; Esc back'
        }</div>
      </div>`;
    this.renderRows();
    this.startWalk();
  }

  /** Only the dots and the selected-row highlight; the paper stays put. */
  private renderRows() {
    for (const rowEl of this.root.querySelectorAll<HTMLElement>('.cc-row')) {
      const i = Number.parseInt(rowEl.dataset.row ?? '0', 10);
      rowEl.classList.toggle('sel', i === this.row);
      const dots = rowEl.querySelector('.cc-dots');
      if (!dots) continue;
      dots.innerHTML = (CC_ROWS[i]?.options ?? [])
        .map(
          (c, j) =>
            `<span class="cc-dot${j === (this.idx[i] ?? 0) ? ' on' : ''}" style="background:${c}"></span>`,
        )
        .join('');
    }
  }

  /** The live preview walks in place, turning now and then. Feels alive. */
  private startWalk() {
    cancelAnimationFrame(this.raf);
    const cv = this.root.querySelector<HTMLCanvasElement>('.cc-fig canvas');
    const g = cv?.getContext('2d');
    if (!cv || !g) return;
    const cw = CHAR_W * ART;
    const ch = CHAR_H * ART;
    const dirs = ['down', 'left', 'up', 'right'] as const;
    let last = performance.now();
    this.animT = 0;
    const tick = (now: number) => {
      if (!this.isOpen || this.step !== 2) return;
      this.animT += (now - last) / 1000;
      last = now;
      if (!this.sheet) this.sheet = makeSheet({ ...PLAYER_LOOK, ...this.currentLook() });
      const frame = Math.floor(this.animT / 0.13) % 6;
      const dir = dirs[Math.floor(this.animT / 2.1) % dirs.length] ?? 'down';
      g.clearRect(0, 0, cv.width, cv.height);
      g.drawImage(this.sheet, frame * cw, DIR_ROW[dir] * ch, cw, ch, 0, 0, cv.width, cv.height);
      this.raf = requestAnimationFrame(tick);
    };
    this.raf = requestAnimationFrame(tick);
  }
}
