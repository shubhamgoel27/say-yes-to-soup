import type { Dir } from '../engine/input';
import { makeCoverArt } from '../art/cover';
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

  /** With no argument, Nani's framing letter. With one, mail from a friend. */
  showLetter(mail?: { from: string; body: string[] }) {
    this.letterEl.hidden = false;
    const paragraphs = mail
      ? mail.body.map((p) => `<p>${p}</p>`).join('')
      : `
          <p>For my grandchild, whenever you are grown,</p>
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
