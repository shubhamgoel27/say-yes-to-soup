import type { Dir } from '../engine/input';
import type { AudioBus } from '../engine/audio';
import type { GameState } from '../engine/state';
import { makePhotoArt } from '../art/albumart';

/**
 * Chasca's album: the whole journey as physical photographs, two to a spread,
 * cream card pages over a dark cloth. Every frame the player actually stood
 * for is a painted print with her caption under it; every photo that never
 * happened is an empty set of mounting corners, kept anyway, because Chasca
 * counts the roads that got away. Arrow keys (or the outer thirds of the
 * screen) turn spreads; Space or Esc hands the album back.
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

const TILTS = [-2.2, 1.7, -1.1, 2.4];

export class AlbumUI {
  private spread = 0;
  private done: (() => void) | null = null;

  constructor(
    private root: HTMLElement,
    private state: GameState,
    private audio: AudioBus,
  ) {}

  get isOpen(): boolean {
    return !this.root.hidden;
  }

  private get spreadCount(): number {
    return Math.ceil(PHOTOS.length / 2);
  }

  open(done?: () => void) {
    this.spread = 0;
    this.done = done ?? null;
    this.root.hidden = false;
    this.render();
  }

  close() {
    if (this.root.hidden) return;
    this.root.hidden = true;
    const done = this.done;
    this.done = null;
    done?.();
  }

  onDir(dir: Dir) {
    if (dir === 'left') this.turn(-1);
    else if (dir === 'right') this.turn(1);
  }

  /** Pointer middle-third: keep going; past the last page, hand it back. */
  onAction() {
    if (this.spread < this.spreadCount - 1) this.turn(1);
    else this.close();
  }

  private turn(delta: number) {
    const next = this.spread + delta;
    if (next < 0 || next >= this.spreadCount) return;
    this.spread = next;
    this.audio.pageFlip();
    this.render(delta > 0 ? 'r' : 'l');
  }

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

  private render(turn?: 'l' | 'r') {
    const left = this.spread * 2;
    const dots = Array.from(
      { length: this.spreadCount },
      (_, i) => `<span class="al-dot${i === this.spread ? ' on' : ''}"></span>`,
    ).join('');
    const turnCls = turn === 'r' ? ' al-turn-r' : turn === 'l' ? ' al-turn-l' : ' al-settle';
    this.root.innerHTML = `
      <div class="al-book">
        <div class="al-title">every traveler, every road</div>
        <div class="al-spread${turnCls}">
          <div class="al-page al-left">${this.photoHtml(left)}</div>
          <div class="al-spine"></div>
          <div class="al-page al-right">${this.photoHtml(left + 1)}</div>
        </div>
        <div class="al-dots">${dots}</div>
        <div class="al-hint">&#8592;&#8594; turn the pages &nbsp;&middot;&nbsp; Space closes the album</div>
      </div>`;
    // Mount the prints after the HTML lands, same as the journal's dish art.
    for (const slot of this.root.querySelectorAll<HTMLElement>('.al-print')) {
      const art = makePhotoArt(slot.dataset.art ?? '');
      if (art) slot.appendChild(art);
    }
  }
}
