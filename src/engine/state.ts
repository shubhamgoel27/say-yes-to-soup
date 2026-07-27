import type { Cond } from '../content/schema';

/**
 * All persistent game state: story flags, unlocked journal pages, the current
 * errand. Everything the world remembers about the player lives here, and it
 * autosaves on every change, so the game can be closed mid-sentence.
 */

const SAVE_KEY = 'elsewhere.save';
/** Saves written before the game was renamed still load. */
const OLD_SAVE_KEY = 'wayfare.save';

/** The three strokes of the traveler the player may choose at the flyleaf.
 * null everywhere means Nani's original sketch (the default look). */
export type PlayerLook = { skin: string; cloth: string; hair: string };

type Events = {
  journal: (id: string) => void;
  errand: (id: string | null) => void;
  letter: (id: string) => void;
  travel: (dest: { map: string; x: number; y: number; dir: string }) => void;
  changed: () => void;
};

export class GameState {
  private flags = new Set<string>();
  private journal = new Set<string>();
  errand: string | null = null;
  /** Where the player last stood; updated by the game loop, persisted with
   * every save so Continue resumes the journey where it paused. */
  place: { map: string; x: number; y: number; dir: string } | null = null;
  /** The name written on the flyleaf, or null when it was left blank.
   * Dialogue falls back to "traveler" wherever a name would have gone. */
  playerName: string | null = null;
  /** The traveler's chosen look, or null for the default. */
  playerLook: PlayerLook | null = null;

  private onJournal: Events['journal'][] = [];
  private onErrand: Events['errand'][] = [];
  private onLetter: Events['letter'][] = [];
  private onTravel: Events['travel'][] = [];
  private onChanged: Events['changed'][] = [];

  on<K extends keyof Events>(ev: K, fn: Events[K]) {
    if (ev === 'journal') this.onJournal.push(fn as Events['journal']);
    else if (ev === 'errand') this.onErrand.push(fn as Events['errand']);
    else if (ev === 'letter') this.onLetter.push(fn as Events['letter']);
    else if (ev === 'travel') this.onTravel.push(fn as Events['travel']);
    else this.onChanged.push(fn as Events['changed']);
  }

  private emitChanged() {
    for (const fn of this.onChanged) fn();
  }

  has(flag: string): boolean {
    return this.flags.has(flag);
  }

  set(flag: string) {
    if (this.flags.has(flag)) return;
    this.flags.add(flag);
    this.save();
    this.emitChanged();
  }

  /** Remove a transient flag (used for one-shot signals like travel intents). */
  clearFlag(flag: string) {
    if (!this.flags.delete(flag)) return;
    this.save();
    this.emitChanged();
  }

  check(cond: Cond | undefined): boolean {
    if (!cond) return true;
    if (cond.has && !cond.has.every((f) => this.flags.has(f))) return false;
    if (cond.not && cond.not.some((f) => this.flags.has(f))) return false;
    return true;
  }

  hasPage(id: string): boolean {
    return this.journal.has(id);
  }

  pageCount(): number {
    return this.journal.size;
  }

  pages(): ReadonlySet<string> {
    return this.journal;
  }

  /**
   * The effects pipeline. This one string array in dialogue data is the whole
   * learning system; nothing else in the engine knows what a journal is for.
   *   set:met.rosa            raise a flag
   *   journal:words.sulpayki  fill a journal page (also raises page.<id>)
   *   errand:rosa-bundle      start an errand
   *   errand.done             complete the current errand
   */
  apply(effects: string[] | undefined) {
    if (!effects) return;
    for (const eff of effects) {
      const sep = eff.indexOf(':');
      const kind = sep < 0 ? eff : eff.slice(0, sep);
      const arg = sep < 0 ? '' : eff.slice(sep + 1);
      switch (kind) {
        case 'set':
          this.flags.add(arg);
          break;
        case 'clear':
          this.flags.delete(arg);
          break;
        case 'journal':
          if (!this.journal.has(arg)) {
            this.journal.add(arg);
            // Pages double as flags so dialogue can react to what you've learned.
            this.flags.add(`page.${arg}`);
            for (const fn of this.onJournal) fn(arg);
          }
          break;
        case 'errand':
          this.errand = arg;
          for (const fn of this.onErrand) fn(arg);
          break;
        case 'errand.done':
          this.errand = null;
          for (const fn of this.onErrand) fn(null);
          break;
        case 'letter':
          // Mail from a previous chapter: mark it read (so the counter clerk
          // stops offering it) and let the UI unfold the page.
          this.flags.add(`letter.read.${arg}`);
          for (const fn of this.onLetter) fn(arg);
          break;
        case 'travel': {
          // "travel:map,x,y,dir" or just "travel:map" (arrive at the map's
          // own spawn): a journey taken from inside a conversation. The warp
          // runs when the dialogue ends.
          const [mapId, xs, ys, dir] = arg.split(',');
          if (mapId) {
            const dest = {
              map: mapId,
              x: xs === undefined ? -1 : Number.parseInt(xs, 10) || 0,
              y: ys === undefined ? -1 : Number.parseInt(ys, 10) || 0,
              dir: dir ?? '',
            };
            for (const fn of this.onTravel) fn(dest);
          }
          break;
        }
        default:
          console.warn(`unknown effect: ${eff}`);
      }
    }
    this.save();
    this.emitChanged();
  }

  save() {
    try {
      localStorage.setItem(
        SAVE_KEY,
        JSON.stringify({
          flags: [...this.flags],
          journal: [...this.journal],
          errand: this.errand,
          place: this.place,
          name: this.playerName,
          look: this.playerLook,
        }),
      );
    } catch {
      // Private browsing or full storage: play on without persistence.
    }
  }

  /** Wipe everything for a fresh journey. Fires no events; callers reset UI. */
  reset() {
    this.flags.clear();
    this.journal.clear();
    this.errand = null;
    this.place = null;
    this.playerName = null;
    this.playerLook = null;
    try {
      localStorage.removeItem(SAVE_KEY);
    } catch {
      // Nothing to remove is fine.
    }
  }

  hasSave(): boolean {
    try {
      return localStorage.getItem(SAVE_KEY) !== null || localStorage.getItem(OLD_SAVE_KEY) !== null;
    } catch {
      return false;
    }
  }

  load() {
    try {
      if (new URLSearchParams(location.search).has('fresh')) {
        localStorage.removeItem(SAVE_KEY);
        localStorage.removeItem(OLD_SAVE_KEY);
        return;
      }
      const raw = localStorage.getItem(SAVE_KEY) ?? localStorage.getItem(OLD_SAVE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw) as {
        flags?: string[];
        journal?: string[];
        errand?: string | null;
        place?: { map: string; x: number; y: number; dir: string } | null;
        // Added later; saves from before the flyleaf simply have neither.
        name?: string | null;
        look?: PlayerLook | null;
      };
      for (const f of data.flags ?? []) this.flags.add(f);
      for (const j of data.journal ?? []) this.journal.add(j);
      this.errand = data.errand ?? null;
      this.place = data.place ?? null;
      this.playerName = typeof data.name === 'string' && data.name.trim() ? data.name : null;
      const look = data.look;
      this.playerLook =
        look &&
        typeof look.skin === 'string' &&
        typeof look.cloth === 'string' &&
        typeof look.hair === 'string'
          ? { skin: look.skin, cloth: look.cloth, hair: look.hair }
          : null;
    } catch {
      // A corrupt save should never brick the game; start fresh.
    }
  }
}
