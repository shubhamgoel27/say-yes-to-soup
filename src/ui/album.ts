import type { Dir } from '../engine/input';
import type { AudioBus } from '../engine/audio';
import type { GameState } from '../engine/state';
import { makePhotoArt } from '../art/albumart';
import { ROUTE } from '../content/route';
import { lendFlags, openCredits } from './pause';

/**
 * Two books share this overlay, because they are the same gesture: cream card
 * on dark cloth, turned a page at a time.
 *
 * CHASCA'S ALBUM is the journey as physical photographs, two to a spread.
 * Every frame the player actually stood for is a painted print with her
 * caption under it; every photo that never happened is an empty set of
 * mounting corners, kept anyway, because Chasca counts the roads that got
 * away. It ends on a page she left blank on purpose. Handing it back sets one
 * tally flag from what it actually showed, so her closing words can never
 * contradict the pages the player just turned.
 *
 * THE CLOSING BOOK opens once, at the well, after the last line is written.
 * It is the journal's own last spreads: the sentence in the player's hand,
 * Nani's route with every stop inked over, the one stop nobody photographed,
 * and the trick itself. Any key walks it forward; the last page hands the
 * player to the credits, which is where a journey is supposed to end.
 */

export type PhotoDef = {
  /** The story flag proving this frame exists. */
  flag: string;
  /** Painter key in art/albumart.ts. */
  art: string;
  /** Chasca's hand, under the print. */
  caption: string;
  /** The little lab stamp beside it. */
  stamp: string;
};

/** In the order the road happened, which is the only order an album accepts. */
export const PHOTOS: PhotoDef[] = [
  {
    flag: 'photo.taken',
    art: 'bajada',
    caption: 'you said papas and meant it. the sea making its first entrance, and you making yours.',
    stamp: 'la bajada · nº 1',
  },
  {
    flag: 'photo.c2.pier',
    art: 'pier',
    caption: 'where the land runs out. the reed horses stood up straighter for you.',
    stamp: 'la caleta · nº 2',
  },
  {
    flag: 'photo.c3.deck',
    art: 'deck',
    caption: 'thirty-one days of water. every album needs one page with nothing on the horizon.',
    stamp: 'mid-ocean · nº 3',
  },
  {
    flag: 'photo.c4.noren',
    art: 'noren',
    caption: 'half in, half out of the noren. in or out, the photo still refuses to say.',
    stamp: 'shionoura · nº 4',
  },
  {
    flag: 'photo.c5.alley',
    art: 'alley',
    caption: 'the dried-fish alley, silver on strings. a street that smells like weather.',
    stamp: 'busan · nº 5',
  },
  {
    flag: 'photo.c6.jetty',
    art: 'jetty',
    caption: 'monsoon, at the jetty’s end. you grinned like a local while the sky argued.',
    stamp: 'kerala · nº 6',
  },
  {
    flag: 'photo.c11.kites',
    art: 'kites',
    caption: 'the roof in the rain, last kites coming down. the sky signed its own name.',
    stamp: 'delhi · nº 7',
  },
  {
    flag: 'photo.c7.door',
    art: 'door',
    caption: 'the carved door. a hundred years of arrivals, and you simply the newest.',
    stamp: 'zanzibar · nº 8',
  },
  {
    flag: 'photo.c8.stones',
    art: 'stones',
    caption: 'the giant missed so beautifully that towns grew up to look. you looked.',
    stamp: 'sicily · nº 9',
  },
  {
    flag: 'photo.c9.field',
    art: 'field',
    caption: 'orange to the horizon, you arriving. the last frame of the roll, spent well.',
    stamp: 'oaxaca · nº 10',
  },
];

/**
 * How full the album was when it was handed back. Chasca's closing words pick
 * one of these, so a book of six empty frames is never called a full journey.
 */
const TALLY = ['album.full', 'album.most', 'album.few'] as const;

const TILTS = [-2.2, 1.7, -1.1, 2.4];

/** The last line the player wrote at the well, whichever one it was. */
const LAST_LINES: [string, string][] = [
  ['c10.lastline.word', 'The word for elsewhere is also the word for home.'],
  ['c10.lastline.trick', 'Walk slowly. Say yes to soup. Thank them twice.'],
  ['c10.lastline.begun', 'Finished. Which is to say: begun.'],
];

type Mode = 'album' | 'end';

export class AlbumUI {
  private spread = 0;
  private mode: Mode = 'album';
  private done: (() => void) | null = null;

  constructor(
    private root: HTMLElement,
    private state: GameState,
    private audio: AudioBus,
  ) {
    // The engine builds the pause menu without a GameState, and the credits
    // need to know whether the journal was finished. The album has one; it
    // lends it, once, at boot.
    lendFlags(state);
  }

  get isOpen(): boolean {
    return !this.root.hidden;
  }

  private get spreadCount(): number {
    // The album keeps one spread past the prints: her blank last page.
    return this.mode === 'end' ? 4 : Math.ceil(PHOTOS.length / 2) + 1;
  }

  private get onLastPage(): boolean {
    return this.spread >= this.spreadCount - 1;
  }

  open(done?: () => void) {
    // The well raises `end.book` just before it raises `album.open`, which is
    // the only difference between the two books this overlay knows how to be.
    // Consumed on sight, like `album.open`, so a journey closed halfway through
    // the last pages cannot turn Chasca's album into the ending by accident.
    this.mode = this.state.has('end.book') ? 'end' : 'album';
    if (this.mode === 'end') this.state.clearFlag('end.book');
    this.spread = 0;
    this.done = done ?? null;
    this.root.hidden = false;
    this.render();
  }

  /**
   * The engine's one exit from this overlay. In the album it hands the book
   * back; in the closing book there is nothing to hand back, so every press
   * simply walks the last pages forward and the final one draws the curtain.
   */
  close() {
    if (this.root.hidden) return;
    if (this.mode === 'end' && !this.onLastPage) {
      this.step(true);
      return;
    }
    this.finish();
  }

  onDir(dir: Dir) {
    if (dir === 'left') this.turn(-1);
    else if (dir === 'right') this.turn(1);
  }

  /** Pointer middle-third: keep going; past the last page, close the book. */
  onAction() {
    if (!this.onLastPage) {
      this.step(false);
      return;
    }
    this.audio.pageFlip();
    this.finish();
  }

  // ---------------------------------------------------------------- turning

  private step(silent: boolean) {
    this.spread++;
    if (!silent) this.audio.pageFlip();
    this.render('r');
  }

  private turn(delta: number) {
    const next = this.spread + delta;
    if (next < 0 || next >= this.spreadCount) return;
    this.spread = next;
    this.audio.pageFlip();
    this.render(delta > 0 ? 'r' : 'l');
  }

  private finish() {
    this.root.hidden = true;
    const end = this.mode === 'end';
    if (!end) this.tally();
    const done = this.done;
    this.done = null;
    done?.();
    // A journey that has ended goes to the names, not back to the grass.
    if (end) openCredits();
  }

  /** Record what the album actually contained, for whoever speaks next. */
  private tally() {
    const earned = PHOTOS.filter((p) => this.state.has(p.flag)).length;
    const now = earned === PHOTOS.length ? 'album.full' : earned >= 6 ? 'album.most' : 'album.few';
    for (const f of TALLY) if (f !== now) this.state.clearFlag(f);
    this.state.set(now);
  }

  // ---------------------------------------------------------------- the album

  private photoHtml(index: number): string {
    const def = PHOTOS[index];
    if (!def) return '';
    const tilt = TILTS[index % TILTS.length] ?? 0;
    if (!this.state.has(def.flag)) {
      return `
        <figure class="al-photo al-missing" style="--tilt:${tilt}deg">
          <span class="al-corner c1"></span><span class="al-corner c2"></span>
          <span class="al-corner c3"></span><span class="al-corner c4"></span>
          <div class="al-empty"></div>
          <figcaption class="al-cap al-ghost">the one we did not take</figcaption>
          <div class="al-stamp al-ghost">${def.stamp}</div>
        </figure>`;
    }
    return `
      <figure class="al-photo" style="--tilt:${tilt}deg">
        <span class="al-tape al-tl"></span><span class="al-tape al-tr"></span>
        <div class="al-print" data-art="${def.art}"></div>
        <figcaption class="al-cap">${def.caption}</figcaption>
        <div class="al-stamp">${def.stamp}</div>
      </figure>`;
  }

  /** Her back cover: a note in her hand, and one frame she is holding open. */
  private closingSpreadHtml(): string {
    return `
      <div class="al-page al-left">
        <div class="end-backleaf">
          <p class="end-hand">the roll ran out in the marigolds, so this is where i stopped.</p>
          <p class="end-hand">the next page is not missing. it is reserved.</p>
          <p class="end-sign">ch.</p>
        </div>
      </div>
      <div class="al-spine"></div>
      <div class="al-page al-right">
        <figure class="al-photo al-missing" style="--tilt:1.4deg">
          <span class="al-corner c1"></span><span class="al-corner c2"></span>
          <span class="al-corner c3"></span><span class="al-corner c4"></span>
          <div class="al-empty"></div>
          <figcaption class="al-cap al-ghost">for wherever you go next</figcaption>
          <div class="al-stamp al-ghost">not yet · nº 11</div>
        </figure>
      </div>`;
  }

  // ---------------------------------------------------- the closing book

  private lastLine(): string {
    for (const [flag, text] of LAST_LINES) if (this.state.has(flag)) return text;
    return 'Finished. Which is to say: begun.';
  }

  private routeHtml(): string {
    const roman = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x', 'xi'];
    return ROUTE.map((s, i) => {
      const walked = this.state.check(s.complete);
      const cls = `end-stop${walked ? ' end-inked' : ''}${i === ROUTE.length - 1 ? ' end-last' : ''}`;
      return `<li class="${cls}"><span class="end-num">${roman[i] ?? ''}</span>${s.name}</li>`;
    }).join('');
  }

  private endPageHtml(page: number): string {
    if (page === 0) {
      return `
        <div class="end-kicker">the last page</div>
        <div class="end-ruled"><p class="end-written">${this.lastLine()}</p></div>
        <p class="end-note">Written at the well, in your own hand. The page was never blank. It was waiting.</p>`;
    }
    if (page === 1) {
      return `
        <div class="end-kicker">the route, inside the front cover</div>
        <ol class="end-route">${this.routeHtml()}</ol>
        <p class="end-note">Her pencil stops after Sicily. You inked the rest of her line in with your feet.</p>`;
    }
    if (page === 2) {
      return `
        <div class="end-kicker">the stop she never got to write a note for</div>
        <figure class="end-plate">
          <div class="end-art" data-art="home"></div>
          <figcaption class="end-cap">Ch&rsquo;aska Pampa after dark. Four kitchens, one well, the flag up.</figcaption>
        </figure>
        <p class="end-note">Nobody photographed this one. You were standing in it.</p>`;
    }
    return `
      <div class="end-kicker">and the whole trick, in her handwriting</div>
      <p class="end-creed">Walk slowly.<br>Say yes to soup.<br>Ask about the bread.<br>If someone corrects you, thank them twice.</p>
      <p class="end-note">You did all four, in eleven villages, for one grandmother. The journal is full.</p>
      <p class="end-thanks">Thank you for walking slowly.</p>`;
  }

  // ---------------------------------------------------------------- render

  private render(turn?: 'l' | 'r') {
    const dots = Array.from(
      { length: this.spreadCount },
      (_, i) => `<span class="al-dot${i === this.spread ? ' on' : ''}"></span>`,
    ).join('');
    const turnCls = turn === 'r' ? ' al-turn-r' : turn === 'l' ? ' al-turn-l' : ' al-settle';

    if (this.mode === 'end') {
      const hint = this.onLastPage
        ? 'any key for the people who walked with you'
        : '&#8592;&#8594; turn the page &nbsp;&middot;&nbsp; any key goes on';
      this.root.innerHTML = `
        <div class="al-book end-book">
          <div class="al-title">the journal, full</div>
          <div class="al-spread${turnCls}">
            <div class="end-leaf">${this.endPageHtml(this.spread)}</div>
          </div>
          <div class="al-dots">${dots}</div>
          <div class="al-hint">${hint}</div>
        </div>`;
      this.mountArt();
      return;
    }

    const left = this.spread * 2;
    const pages = this.onLastPage
      ? this.closingSpreadHtml()
      : `<div class="al-page al-left">${this.photoHtml(left)}</div>
         <div class="al-spine"></div>
         <div class="al-page al-right">${this.photoHtml(left + 1)}</div>`;
    this.root.innerHTML = `
      <div class="al-book">
        <div class="al-title">every traveler, every road</div>
        <div class="al-spread${turnCls}">${pages}</div>
        <div class="al-dots">${dots}</div>
        <div class="al-hint">&#8592;&#8594; turn the pages &nbsp;&middot;&nbsp; Space closes the album</div>
      </div>`;
    this.mountArt();
  }

  /** Mount the prints after the HTML lands, same as the journal's dish art. */
  private mountArt() {
    for (const slot of this.root.querySelectorAll<HTMLElement>('.al-print, .end-art')) {
      const art = makePhotoArt(slot.dataset.art ?? '');
      if (art) slot.appendChild(art);
    }
  }
}
