import { makeDogSheet, makeLlamaSheet } from './animals';
import { makePortrait, makeSheet, type Look } from './character';
import { release } from './pix';

/**
 * Villagers' art, baked when it is first needed instead of all at boot.
 *
 * Every villager's walk sheet is a 720x512 canvas (1.4 MB) and their face
 * another 100 KB. Baking all 122 at boot held 175 MB of canvas for the
 * dozen or so on screen, and before Safari 17 a page may hold 224-384 MB of
 * canvas in all. Now a sheet is baked the first time its villager is drawn
 * and a face the first time they speak, and only the most recently used
 * stay. The first frame on a map pays for the people on it; a map change
 * draws that frame under the door's dark.
 */

export type Species = 'dog' | 'llama' | 'llamaBrown';

/**
 * Baked canvases by key, the least recently used dropped past `cap`. Nothing
 * used in the last `graceMs` is ever dropped, so a crowd bigger than the cap
 * costs memory for as long as it is on screen, never a re-bake every frame.
 */
export class BakeCache {
  private entries = new Map<string, { cv: HTMLCanvasElement; at: number }>();

  constructor(
    readonly cap: number,
    /** Called with each canvas dropped; it is never handed out again. */
    private readonly dropped: (cv: HTMLCanvasElement) => void = () => {},
    private readonly graceMs = 2000,
  ) {}

  get(key: string, make: () => HTMLCanvasElement): HTMLCanvasElement {
    const now = performance.now();
    const hit = this.entries.get(key);
    if (hit) {
      hit.at = now;
      // Past the cap after a crowd's grace ran out, with no new look coming
      // to prompt a trim: trim on a hit too, at most once a second.
      if (this.entries.size > this.cap && now - this.trimmedAt > 1000) this.trim(now);
      return hit.cv;
    }
    const cv = make();
    this.entries.set(key, { cv, at: now });
    if (this.entries.size > this.cap) this.trim(now);
    return cv;
  }

  private trimmedAt = 0;

  private trim(now: number) {
    this.trimmedAt = now;
    const oldest = [...this.entries].sort((a, b) => a[1].at - b[1].at);
    for (const [key, e] of oldest) {
      if (this.entries.size <= this.cap || now - e.at < this.graceMs) break;
      this.entries.delete(key);
      this.dropped(e.cv);
    }
  }

  get size(): number {
    return this.entries.size;
  }
}

/**
 * Walk sheets. A map holds at most fourteen people, so sixteen covers the
 * one on screen and some of the last. Only wardrobes ever hold a sheet, and
 * they ask this cache for it on every draw, so a dropped one is handed back.
 */
export const SHEETS = new BakeCache(16, release);
/** Faces. Not handed back when dropped: the dialogue box may still show one. */
export const FACES = new BakeCache(24);

/** A sheet with nothing on it: drawing any frame from it draws nothing. */
let blank: HTMLCanvasElement | null = null;
function nothing(): HTMLCanvasElement {
  if (!blank) {
    blank = document.createElement('canvas');
    blank.width = blank.height = 1;
  }
  return blank;
}

function animalSheet(species: Species): HTMLCanvasElement {
  if (species === 'dog') return makeDogSheet();
  return makeLlamaSheet(species === 'llama' ? '#e8ddc8' : '#9c6b42');
}

/** One villager's sheet, face and night fade, each made on first need. */
export class Wardrobe {
  private costume: Partial<Look> | undefined;
  private key: string | null = null;
  /** The sheet at the fade's alpha, while a fade is under way. */
  private faded: HTMLCanvasElement | null = null;
  private fadedAt = -1;
  private fadedFrom: HTMLCanvasElement | null = null;

  constructor(
    private readonly own: () => Look,
    readonly species?: Species,
  ) {}

  /** The look being worn: their own, with any scene's costume over it. */
  private look(): Look {
    return { ...this.own(), ...(this.costume ?? {}) };
  }

  private lookKey(): string {
    this.key ??= this.species ? `animal:${this.species}` : JSON.stringify(this.look());
    return this.key;
  }

  /** The full-strength walk sheet. Baked during play now, not at boot: a
   * browser out of canvas memory refuses it mid-frame, and a throw here
   * stopped every frame the villager was on screen. They go undrawn instead,
   * and the bake is tried again on the next frame. */
  get sheet(): HTMLCanvasElement {
    const species = this.species;
    try {
      if (species) return SHEETS.get(this.lookKey(), () => animalSheet(species));
      return SHEETS.get(this.lookKey(), () => makeSheet(this.look()));
    } catch (err) {
      console.warn('[soup] a villager could not be painted:', err);
      return nothing();
    }
  }

  /** The dialogue portrait; animals have none. A face the browser cannot
   * paint is no face, not a conversation that never opens (the player was
   * already frozen for it, and nothing would have let them go). */
  get portrait(): HTMLCanvasElement | null {
    if (this.species) return null;
    try {
      return FACES.get(this.lookKey(), () => makePortrait(this.look()));
    } catch (err) {
      console.warn('[soup] a face could not be painted:', err);
      return null;
    }
  }

  /**
   * The sheet to draw at a fade's alpha: the full one at 1, else a faded copy
   * painted when it is drawn, so nobody off screen fades a sheet at all.
   */
  at(alpha: number): HTMLCanvasElement {
    const base = this.sheet;
    if (alpha >= 1) return base;
    if (!this.faded || this.faded.width !== base.width || this.faded.height !== base.height) {
      this.settle();
      this.faded = document.createElement('canvas');
      this.faded.width = base.width;
      this.faded.height = base.height;
    }
    if (alpha !== this.fadedAt || base !== this.fadedFrom) {
      // No canvas memory for the faded copy: draw them at full strength
      // rather than stop the frame (the old fade simply skipped).
      const g = this.faded.getContext('2d');
      if (!g) {
        this.settle();
        return base;
      }
      g.clearRect(0, 0, this.faded.width, this.faded.height);
      g.globalAlpha = alpha;
      g.drawImage(base, 0, 0);
      this.fadedAt = alpha;
      this.fadedFrom = base;
    }
    return this.faded;
  }

  /** The fade has come to rest, at full or at nothing: hand the faded copy back. */
  settle() {
    if (this.faded) release(this.faded);
    this.faded = null;
    this.fadedAt = -1;
    this.fadedFrom = null;
  }

  /** Into a scene's costume, or back into their own clothes with none. */
  dress(costume: Partial<Look> | undefined) {
    this.costume = costume;
    this.key = null;
  }
}
