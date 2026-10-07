import type { Dir } from '../engine/input';
import type { AudioBus } from '../engine/audio';
import type { GameState } from '../engine/state';
import { makePhotoArt } from '../art/albumart';
import { ROUTE } from '../content/route';
import { CHAPTERS } from '../content/world';
import { lendCreditsBook, lendFlags } from './pause';
import { keysOrTaps } from './responsive';

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
 * the one stop nobody photographed, and the trick itself. Any key walks it
 * forward, and the book keeps turning into the credits, which are pages in
 * the same book rather than a card in a menu: the cover, Nani's route with
 * every stop inked over, the people met along it by name, the thanks, and
 * the small print, type last. The last page closes the book on the world.
 * The pause menu's "The end of it" opens the credits pages again.
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

/**
 * The last line the player wrote at the well, whichever one it was, and
 * whether Nani had already underlined the space for it.
 */
const LAST_LINES: [string, string, boolean][] = [
  ['c10.lastline.word', 'The word for elsewhere is also the word for home.', true],
  ['c10.lastline.trick', 'Walk slowly. Say yes to soup. Thank them twice.', false],
  ['c10.lastline.begun', 'Finished. Which is to say: begun.', false],
];

/**
 * Nani's underline: "an old underline in her 1974 ink, already the right
 * length for the sentence." Faded brown, pressed harder in the middle, a
 * blot where the nib came down, sitting under the blue of the new line and
 * exactly as long as it, because it is sized to it.
 */
const NANI_UNDERLINE =
  '<svg class="end-nani" aria-hidden="true" viewBox="0 0 200 12" preserveAspectRatio="none" ' +
  'style="position:absolute;left:-1.5%;bottom:-0.3em;width:103%;height:0.42em;overflow:visible;pointer-events:none">' +
  '<path d="M3 7.4 C 40 5.8, 80 7.8, 120 6.2 S 180 5.2, 197 5.5 C 198.6 5.6, 198.6 6.7, 197 6.9 ' +
  'C 170 7.6, 130 8.4, 100 8.6 S 30 9.6, 4 9.4 C 1.6 9.3, 1.5 7.5, 3 7.4 Z" fill="#7b4a26" opacity="0.7"/>' +
  '<ellipse cx="4" cy="8.3" rx="2.6" ry="1.9" fill="#6a3d1e" opacity="0.45"/>' +
  '<path d="M8 8.7 C 60 8.2, 120 7.9, 190 6.6" stroke="#5e3519" stroke-width="0.6" fill="none" opacity="0.3"/>' +
  '</svg>';

type Mode = 'album' | 'end';

/** The closing book's leaves, then the credits leaves, in turning order. */
type Leaf = 'last' | 'home' | 'trick' | 'cover' | 'route' | 'people1' | 'people2' | 'thanks' | 'print';
const CLOSING: Leaf[] = ['last', 'home', 'trick'];
const CREDITS: Leaf[] = ['cover', 'route', 'people1', 'people2', 'thanks', 'print'];

/** The route stops whose people fill the first credits page; the rest fill the second. */
const PEOPLE_SPLIT = 5;

/** Who stood where, by route stop: every named person of each walked chapter, once. */
function peopleByStop(walked: (i: number) => boolean): { stop: string; names: string[] }[] {
  const seen = new Set<string>();
  return ROUTE.map((stop, i) => {
    const ch = CHAPTERS.find((c) => c.id === (stop.id === 'home' ? 'return' : stop.id));
    if (!ch || !walked(i)) return { stop: stop.name, names: [] };
    const names: string[] = [];
    for (const n of ch.npcs) {
      // The llamas are all called Llama and would like that kept quiet;
      // Paca and the dog are colleagues and are credited as such.
      if (n.name === 'Llama') continue;
      let name = n.name;
      if (/^(The|A) /.test(name)) name = name.toLowerCase();
      if (name === 'a traveler') name = 'a traveler, going the other way';
      if (seen.has(name)) continue;
      seen.add(name);
      names.push(name);
    }
    return { stop: stop.name, names };
  });
}

/** Credits-only styles, carried by the book that uses them. */
const CREDIT_CSS = `
  .cr-cover { margin: auto 0; text-align: center; }
  .cr-title { font-family: var(--display); font-size: clamp(30px, 5vw, 44px); color: #2f2418; margin: 0; letter-spacing: 0.01em; }
  .cr-sub { font-family: var(--hand); font-size: 22px; color: #8a6a3c; margin: 2px 0 0; }
  .cr-people { margin: auto 0; display: grid; gap: 9px; }
  /* A full roll leaves no auto margin, so the note would sit flush under the last name. */
  .cr-people + .end-note { padding-top: 14px; }
  .cr-stop { font-family: var(--display); font-size: 13px; letter-spacing: 0.12em; text-transform: uppercase; color: #8a6a3c; }
  .cr-stop .end-num { width: 22px; letter-spacing: 0; text-transform: none; }
  .cr-names { font-size: var(--fs-125, 13.5px); line-height: 1.45; color: #2f2418; margin: 1px 0 0 22px; text-wrap: pretty; }
  .cr-thanks { margin: auto 0; display: grid; gap: 12px; }
  .cr-thanks p { margin: 0; font-size: var(--fs-135, 15px); line-height: 1.55; color: #3a2c1e; }
  .cr-name { font-family: var(--hand); font-size: 24px; color: #2c2740; }
  .cr-print { margin: auto 0; display: grid; gap: 9px; }
  .cr-print p { margin: 0; font-size: var(--fs-115, 12.5px); line-height: 1.5; color: #57452f; }
  .cr-type { font-family: var(--display); font-size: 15px !important; color: #2f2418 !important; }
  /* A phone on its side is about 390px tall, and the longest leaf (the second
     roll of names) is taller than that. Centred in a grid, its foot, the dots
     and the hint fell off the bottom with no way to reach them. Short screens
     tighten the roll and let the cloth scroll, top first. */
  @media (max-height: 520px) {
    #album { display: flex; flex-direction: column; align-items: center; overflow-y: auto; padding: 8px 0; }
    #album[hidden] { display: none; }
    #album > .al-book { margin: auto 0; }
    .end-book .al-title { margin-bottom: 4px; }
    .end-leaf { padding: 16px 24px 14px; }
    .cr-people { gap: 4px; }
    .cr-names { line-height: 1.3; }
  }
`;

export class AlbumUI {
  private spread = 0;
  private mode: Mode = 'album';
  private leaves: Leaf[] = [];
  private done: (() => void) | null = null;

  constructor(
    private root: HTMLElement,
    private state: GameState,
    private audio: AudioBus,
  ) {
    // The engine builds the pause menu without a GameState, and the credits
    // need to know whether the journal was finished. The album has one; it
    // lends it, once, at boot, together with a way back into these pages.
    lendFlags(state);
    lendCreditsBook(() => this.openCredits());
    const style = document.createElement('style');
    style.textContent = CREDIT_CSS;
    document.head.appendChild(style);
  }

  get isOpen(): boolean {
    return !this.root.hidden;
  }

  private get spreadCount(): number {
    // The album keeps one spread past the prints: her blank last page.
    return this.mode === 'end' ? this.leaves.length : Math.ceil(PHOTOS.length / 2) + 1;
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
    this.leaves = this.mode === 'end' ? [...CLOSING, ...CREDITS] : [];
    this.spread = 0;
    this.done = done ?? null;
    this.root.hidden = false;
    this.render();
  }

  /** The credits pages alone, from the pause menu once the journal is full. */
  openCredits(done?: () => void) {
    this.mode = 'end';
    this.leaves = [...CREDITS];
    this.spread = 0;
    this.done = done ?? null;
    this.root.hidden = false;
    this.audio.pageFlip();
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
    // The closing book's last page says "any key", and an arrow is a key.
    if (this.mode === 'end' && this.onLastPage) {
      this.onAction();
      return;
    }
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
    // The credits were the book's own last pages; closing it is the end.
    if (end) this.leaves = [];
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

  private lastLine(): [string, boolean] {
    for (const [flag, text, under] of LAST_LINES) if (this.state.has(flag)) return [text, under];
    return ['Finished. Which is to say: begun.', false];
  }

  /** The written line; under the one she foresaw, her underline was already waiting. */
  private lastLineHtml(): string {
    const [text, underlined] = this.lastLine();
    if (!underlined) return text;
    return `<span style="position:relative;display:inline-block">${text}${NANI_UNDERLINE}</span>`;
  }

  private routeHtml(): string {
    const roman = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x', 'xi'];
    return ROUTE.map((s, i) => {
      const walked = this.state.check(s.complete);
      const cls = `end-stop${walked ? ' end-inked' : ''}${i === ROUTE.length - 1 ? ' end-last' : ''}`;
      return `<li class="${cls}"><span class="end-num">${roman[i] ?? ''}</span>${s.name}</li>`;
    }).join('');
  }

  private peopleHtml(half: 0 | 1): string {
    const roman = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii', 'ix', 'x', 'xi'];
    const groups = peopleByStop((i) => {
      const c = ROUTE[i]?.complete;
      return !c || this.state.check(c);
    });
    const from = half === 0 ? 0 : PEOPLE_SPLIT;
    const to = half === 0 ? PEOPLE_SPLIT : groups.length;
    return groups
      .slice(from, to)
      .map((g, k) =>
        g.names.length === 0
          ? ''
          : `<div><div class="cr-stop"><span class="end-num">${roman[from + k] ?? ''}</span>${g.stop}</div>
             <div class="cr-names">${g.names.join(' &middot; ')}</div></div>`,
      )
      .join('');
  }

  private endPageHtml(leaf: Leaf): string {
    switch (leaf) {
      case 'last':
        return `
          <div class="end-kicker">the last page</div>
          <div class="end-ruled"><p class="end-written">${this.lastLineHtml()}</p></div>
          <p class="end-note">Written at the well, in your own hand. The page was never blank. It was waiting.</p>`;
      case 'home':
        return `
          <div class="end-kicker">the stop she never got to write a note for</div>
          <figure class="end-plate">
            <div class="end-art" data-art="home"></div>
            <figcaption class="end-cap">Ch&rsquo;aska Pampa after dark. Four kitchens, one well, the flag up.</figcaption>
          </figure>
          <p class="end-note">Nobody photographed this one. You were standing in it.</p>`;
      case 'trick':
        return `
          <div class="end-kicker">and the whole trick, in her handwriting</div>
          <p class="end-creed">Walk slowly.<br>Say yes to soup.<br>Ask about the bread.<br>If someone corrects you, thank them twice.</p>
          <p class="end-note">You did all four, in eleven villages, for one grandmother. The journal is full.</p>
          <p class="end-thanks">Thank you for walking slowly.</p>`;
      case 'cover':
        return `
          <div class="cr-cover">
            <p class="cr-title">Say Yes to Soup</p>
            <p class="cr-sub">a journal, full</p>
          </div>
          <p class="end-note">Eleven villages, one grandmother, one book she left half written and you did not. Nobody hurried you and you did not hurry. That was the whole assignment.</p>`;
      case 'route':
        return `
          <div class="end-kicker">the route, inside the front cover</div>
          <ol class="end-route">${this.routeHtml()}</ol>
          <p class="end-note">Her pencil stops after Sicily. You inked the rest of her line in with your feet.</p>`;
      case 'people1':
        return `
          <div class="end-kicker">the people who walked with you</div>
          <div class="cr-people">${this.peopleHtml(0)}</div>`;
      case 'people2':
        return `
          <div class="end-kicker">and the rest of the road</div>
          <div class="cr-people">${this.peopleHtml(1)}</div>
          <p class="end-note">Every one of them is made up, and every one of them is somebody&rsquo;s neighbor.</p>`;
      case 'thanks':
        return `
          <div class="end-kicker">thank you</div>
          <div class="cr-thanks">
            <p><span class="cr-name">Angli</span>, for the idea underneath everything here: that language and food are how strangers become people to each other.</p>
            <p><span class="cr-name">Nishant</span>, who helped shape the game, its villages, and the traveler&rsquo;s long arc home.</p>
            <p>Made with love, and with soup.</p>
          </div>
          <p class="end-note">The pot is still on. It is always on. Come back whenever.</p>`;
      case 'print':
        return `
          <div class="end-kicker">and the small print, last</div>
          <div class="cr-print">
            <p>Every village in this game is fictional; the texture is researched, and corrections from people who know these places are welcome.</p>
            <p>Paper &amp; cloth textures from ambientCG (CC0). Ornaments from FreeSVG (CC0).
            Nani&rsquo;s star charts are Urania&rsquo;s Mirror, Sidney Hall, 1825 (public domain);
            the kitchen fish print is Utagawa Hiroshige, from Uozukushi (The Met, CC0);
            the pasted mango is a USDA pomological watercolour, D. G. Passmore, 1907 (public domain).</p>
            <p>Everything else, the art, the music, the weather and the gulls, is cooked fresh by the game at runtime.</p>
            <p class="cr-type">Type set in Fraunces, Literata &amp; Caveat (OFL, Google Fonts).</p>
          </div>`;
    }
  }

  // ---------------------------------------------------------------- render

  private render(turn?: 'l' | 'r') {
    const dots = Array.from(
      { length: this.spreadCount },
      (_, i) => `<span class="al-dot${i === this.spread ? ' on' : ''}"></span>`,
    ).join('');
    const turnCls = turn === 'r' ? ' al-turn-r' : turn === 'l' ? ' al-turn-l' : ' al-settle';
    // A turned page starts at its top on a short screen, where the cloth scrolls.
    this.root.scrollTop = 0;

    if (this.mode === 'end') {
      const leaf = this.leaves[this.spread] ?? 'cover';
      // On glass the page is the control: the edges turn, the middle goes on.
      const hint = this.onLastPage
        ? keysOrTaps('any key closes the book', 'tap to close the book')
        : leaf === 'trick'
          ? keysOrTaps('any key for the credits', 'tap the middle for the credits')
          : keysOrTaps(
              '&#8592;&#8594; turn the page &nbsp;&middot;&nbsp; any key goes on',
              'tap an edge to turn the page &nbsp;&middot;&nbsp; tap the middle to go on',
            );
      const inCredits = CREDITS.includes(leaf);
      this.root.innerHTML = `
        <div class="al-book end-book">
          <div class="al-title">${inCredits ? 'say yes to soup' : 'the journal, full'}</div>
          <div class="al-spread${turnCls}">
            <div class="end-leaf">${this.endPageHtml(leaf)}</div>
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
        <div class="al-hint">${keysOrTaps(
          '&#8592;&#8594; turn the pages &nbsp;&middot;&nbsp; Space closes the album',
          'tap an edge to turn the pages &nbsp;&middot;&nbsp; tap the middle to go on to the end',
        )}</div>
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
