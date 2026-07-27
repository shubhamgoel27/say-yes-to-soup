import type { Dir } from '../engine/input';
import { makeCoverArt } from '../art/cover';
import { CHAR_H, CHAR_W, DIR_ROW, PLAYER_LOOK, makeSheet } from '../art/character';
import { ART } from '../engine/config';
import type { PlayerLook } from '../engine/state';
import { ROUTE } from '../content/route';
import { CHAPTERS, JOURNAL, REGION_MAPS } from '../content/world';

/**
 * The front door of the game: a quiet title card, then Nani's letter as the
 * framing device. Both are DOM overlays above the running world, which idles
 * softly behind them like an attract screen.
 */

export type TitleChoice = 'new' | 'continue' | 'settings' | 'credits';

/**
 * One quiet line under Continue: where the journey paused and how far the
 * journal has come. Read straight from the save on disk (the title renders
 * before the engine restores state), and any trouble reading it means no
 * line, never a crash.
 */
function welcomeBackLine(): string | null {
  try {
    const raw = localStorage.getItem('elsewhere.save');
    if (!raw) return null;
    const data = JSON.parse(raw) as {
      journal?: unknown;
      place?: { map?: unknown } | null;
    };
    const mapId = typeof data.place?.map === 'string' ? data.place.map : '';
    const mapName = REGION_MAPS[mapId]?.name;
    const chapter = CHAPTERS.find((c) => c.maps.some((m) => m.id === mapId));
    const stop = chapter ? ROUTE.find((r) => r.id === chapter.id) : undefined;
    const where = [...new Set([mapName, stop?.name].filter(Boolean))].join(', ');
    if (!where) return null;
    const held = new Set(
      Array.isArray(data.journal) ? data.journal.filter((p): p is string => typeof p === 'string') : [],
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

export class TitleScreen {
  private cursor = 0;
  private options: { id: TitleChoice; label: string }[] = [];
  private hasSave = false;
  /** "Begin again" over a real save arms first, erases second. */
  private armNew = false;
  /** The welcome-back line under Continue; null when there is nothing to say. */
  private welcomeBack: string | null = null;

  constructor(
    private titleEl: HTMLElement,
    private letterEl: HTMLElement,
  ) {}

  get titleOpen(): boolean {
    return !this.titleEl.hidden;
  }
  get letterOpen(): boolean {
    return !this.letterEl.hidden;
  }

  showTitle(hasSave: boolean) {
    this.hasSave = hasSave;
    this.armNew = false;
    this.welcomeBack = hasSave ? welcomeBackLine() : null;
    this.options = hasSave
      ? [
          { id: 'continue', label: 'Continue the journey' },
          { id: 'new', label: 'Begin again' },
          { id: 'settings', label: 'Settings' },
          { id: 'credits', label: 'Credits' },
        ]
      : [
          { id: 'new', label: 'Begin the journey' },
          { id: 'settings', label: 'Settings' },
          { id: 'credits', label: 'Credits' },
        ];
    this.cursor = 0;
    this.titleEl.hidden = false;
    this.render();
  }

  hideTitle() {
    this.titleEl.hidden = true;
  }

  /** With no argument, Nani's framing letter. With one, mail from a friend.
   * `playerName` (already limited to letters and spaces) personalises the
   * framing letter's salutation; blank keeps Nani's original line. */
  showLetter(mail?: { from: string; body: string[] }, playerName?: string | null) {
    this.letterEl.hidden = false;
    const dear = playerName
      ? `For ${playerName}, whenever you are grown,`
      : 'For my grandchild, whenever you are grown,';
    const paragraphs = mail
      ? mail.body.map((p) => `<p>${p}</p>`).join('')
      : `
          <p>${dear}</p>
          <p>I meant to finish this journal. The world kept being bigger than
          the pages. So now the empty half is yours.</p>
          <p>Start where I started: <b>Ch&rsquo;aska Pampa</b>, the star plain.
          Say yes to soup. Ask about the bread. If someone corrects you, you
          are learning; thank them twice.</p>
          <p>Walk slowly. That is the whole trick.</p>`;
    const sign = mail ? mail.from : 'Nani, 1974';
    this.letterEl.innerHTML = `
      <div class="letter-fold">
        <div class="letter-paper">
          <div class="letter-body">
            ${paragraphs}
            <p class="letter-sign">${sign}</p>
          </div>
          <div class="letter-hint">press Space</div>
        </div>
      </div>`;
  }

  hideLetter() {
    this.letterEl.hidden = true;
  }

  onDir(dir: Dir) {
    if (!this.titleOpen || this.options.length < 2) return;
    const n = this.options.length;
    if (dir === 'up') this.cursor = (this.cursor + n - 1) % n;
    else if (dir === 'down') this.cursor = (this.cursor + 1) % n;
    else return;
    this.armNew = false; // moving the cursor stands down the warning
    this.render();
  }

  /**
   * Returns the chosen option when the title menu is confirmed. Choosing
   * "Begin again" over an existing journal asks twice: the first press arms
   * a plainly-worded warning, only the second erases. 'none' = nothing yet.
   */
  choose(): TitleChoice | 'none' {
    const id = this.options[this.cursor]?.id ?? 'new';
    if (id === 'new' && this.hasSave && !this.armNew) {
      this.armNew = true;
      this.render();
      return 'none';
    }
    return id;
  }

  private render() {
    const menu = this.options
      .map((o, i) => {
        const label =
          o.id === 'new' && this.armNew ? 'Erase the journal and begin again? (press again)' : o.label;
        const sub =
          o.id === 'continue' && this.welcomeBack
            ? `<div class="t-opt-sub">${this.welcomeBack}</div>`
            : '';
        return `<div class="t-opt${i === this.cursor ? ' sel' : ''}${o.id === 'new' && this.armNew ? ' warn' : ''}">${i === this.cursor ? '&#9656;&nbsp;' : ''}${label}${sub}</div>`;
      })
      .join('');
    this.titleEl.innerHTML = `
      <div class="t-card">
        <div class="t-cover">
          <div class="t-band"></div>
          <div class="t-kicker">a journal, half full</div>
          <div class="t-name">SAY YES<br>TO SOUP</div>
          <div class="t-art">
            <span class="t-steam s1"></span><span class="t-steam s2"></span><span class="t-steam s3"></span>
          </div>
          <div class="t-sub">an unhurried journey through the world&rsquo;s kitchens, courtyards, and words</div>
          <div class="t-menu">${menu}</div>
        </div>
        <div class="t-controls">
          <span><b>&#8592;&#8593;&#8595;&#8594;</b> / WASD / click&nbsp; walk</span>
          <span><b>Space</b> / Z / click&nbsp; talk &amp; touch things</span>
          <span><b>J</b>&nbsp; the journal</span>
        </div>
      </div>`;
    const art = this.titleEl.querySelector('.t-art');
    if (art) art.insertBefore(makeCoverArt(), art.firstChild);
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

/** Keep whatever the keyboard offers down to letters and single spaces. */
function ccClean(raw: string): string {
  return raw
    .replace(/[^\p{L} ]/gu, '')
    .replace(/ {2,}/g, ' ')
    .slice(0, 14);
}

export class NamingCard {
  private step: 1 | 2 = 1;
  private row = 0;
  private idx = [0, 0, 0];
  private name = '';
  private onDone: ((res: FlyleafResult) => void) | null = null;
  private sheet: HTMLCanvasElement | null = null;
  private raf = 0;
  private animT = 0;

  constructor(private root: HTMLElement) {
    this.root.addEventListener('click', this.onClick);
  }

  get isOpen(): boolean {
    return !this.root.hidden;
  }

  open(onDone: (res: FlyleafResult) => void) {
    this.onDone = onDone;
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

  private finish() {
    window.removeEventListener('keydown', this.onKey, true);
    cancelAnimationFrame(this.raf);
    this.root.hidden = true;
    this.root.innerHTML = '';
    this.sheet = null;
    const done = this.onDone;
    this.onDone = null;
    done?.({
      name: this.name.trim() || null,
      look: {
        skin: CC_SKINS[this.idx[0] ?? 0] ?? PLAYER_LOOK.skin,
        cloth: CC_CLOTHS[this.idx[1] ?? 0] ?? PLAYER_LOOK.cloth,
        hair: CC_HAIRS[this.idx[2] ?? 0] ?? PLAYER_LOOK.hair,
      },
    });
  }

  /** Enter confirms the step; Esc skips it. Both end on the same road. */
  private advance(skip: boolean) {
    if (this.step === 1) {
      if (skip) this.name = '';
      this.step = 2;
      this.render();
    } else {
      this.finish();
    }
  }

  private onKey = (e: KeyboardEvent) => {
    if (!this.isOpen) return;
    e.stopPropagation();
    if (e.code === 'Escape') {
      e.preventDefault();
      this.advance(true);
      return;
    }
    if (e.code === 'Enter') {
      e.preventDefault();
      this.advance(false);
      return;
    }
    if (this.step !== 2) return; // step 1: every other key belongs to the pen
    const k = e.code;
    if (k === 'Space') {
      e.preventDefault();
      this.advance(false);
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
    if (t.closest('.cc-btn')) this.advance(false);
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
          <input class="cc-input" type="text" maxlength="14" spellcheck="false"
            autocomplete="off" placeholder="traveler" aria-label="your name" />
          <div class="cc-actions"><button class="cc-btn" type="button">write it down</button></div>
          <div class="cc-hint">Enter writes it in &middot; Esc leaves it blank</div>
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
        <div class="cc-hint">arrows choose &middot; Enter sets out</div>
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
