import type { Cond } from '../content/schema';

/**
 * All persistent game state: story flags, unlocked journal pages, the current
 * errand. Everything the world remembers about the player lives here, and it
 * autosaves on every change, so the game can be closed mid-sentence.
 */

const SAVE_KEY = 'elsewhere.save';
/** Saves written before the game was renamed still load. */
const OLD_SAVE_KEY = 'wayfare.save';
/** Which journal on the shelf is open on the table right now. */
const SHELF_KEY = 'elsewhere.shelf';
/** The shelf holds three journals. */
export const SLOT_COUNT = 3;

/**
 * Every stored key for one journal on the shelf. Slot 0 keeps the exact keys
 * the game has always used ('elsewhere.save', its '.bak' twin, and the
 * pre-rename key), so a journey that predates the shelf sits on it untouched.
 * The later slots suffix the same names ('elsewhere.save.2', '.2.bak', '.3',
 * '.3.bak'); they get no legacy key because nothing old ever wrote there.
 * All save, load, backup and erase logic below goes through this one function.
 */
function slotKeys(slot: number): { save: string; bak: string; legacy: string | null } {
  const base = slot > 0 ? `${SAVE_KEY}.${slot + 1}` : SAVE_KEY;
  return { save: base, bak: `${base}.bak`, legacy: slot === 0 ? OLD_SAVE_KEY : null };
}

/** The journal open on the table: 0 unless the player chose another. */
export function activeSlot(): number {
  try {
    const n = Number.parseInt(localStorage.getItem(SHELF_KEY) ?? '0', 10);
    return Number.isInteger(n) && n >= 0 && n < SLOT_COUNT ? n : 0;
  } catch {
    return 0;
  }
}

/** Put a different journal on the table. Remembered across sessions. */
export function setActiveSlot(slot: number) {
  try {
    localStorage.setItem(SHELF_KEY, String(slot));
  } catch {
    // Where nothing can be written, nothing needed switching either.
  }
}

export type SaveData = {
  flags?: string[];
  journal?: string[];
  errand?: string | null;
  place?: { map: string; x: number; y: number; dir: string } | null;
  // Added later; saves from before the flyleaf simply have neither.
  name?: string | null;
  look?: PlayerLook | null;
};

/** Parse a stored save, returning null for anything we cannot trust. */
function parseSave(raw: string | null): SaveData | null {
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as SaveData;
    // A save is only credible if it carries the WHOLE shape we wrote. The
    // shallow check here once accepted a save whose journal was an object:
    // load() then threw halfway, kept the flags, dropped everything else,
    // and the next save copied the wreck over a perfectly good backup. A
    // malformed field must reject the file so the backup chain engages.
    if (!data || typeof data !== 'object' || !Array.isArray(data.flags)) return null;
    if (!data.flags.every((f) => typeof f === 'string')) return null;
    if (data.journal !== undefined && data.journal !== null) {
      if (!Array.isArray(data.journal)) return null;
      if (!data.journal.every((j) => typeof j === 'string')) return null;
    }
    if (data.place !== undefined && data.place !== null) {
      const pl = data.place;
      if (
        typeof pl !== 'object' || typeof pl.map !== 'string' ||
        !Number.isFinite(pl.x) || !Number.isFinite(pl.y) || typeof pl.dir !== 'string'
      ) return null;
    }
    if (data.errand !== undefined && data.errand !== null && typeof data.errand !== 'string') return null;
    if (data.name !== undefined && data.name !== null && typeof data.name !== 'string') return null;
    return data;
  } catch {
    return null;
  }
}

/**
 * The raw stored save for a slot, trusted in the same order load() trusts:
 * primary first, then the last known-good backup, then the pre-rename key.
 * Only a string that passes parseSave is ever returned.
 */
function readSlotRaw(slot: number): string | null {
  try {
    const k = slotKeys(slot);
    const keys = k.legacy ? [k.save, k.bak, k.legacy] : [k.save, k.bak];
    for (const key of keys) {
      const raw = localStorage.getItem(key);
      if (raw && parseSave(raw)) return raw;
    }
    return null;
  } catch {
    return null;
  }
}

/** Read a slot's save straight off the shelf, for flyleaf summaries: the
 * title renders before the engine restores state. Trouble means null. */
export function peekSlot(slot: number): SaveData | null {
  return parseSave(readSlotRaw(slot));
}

/**
 * Whether anything at all sits in this slot. Deliberately the same judgement
 * hasSave() has always made for slot 0: even an unreadable pre-rename save
 * counts, so nothing that used to say Continue stops saying it.
 */
export function slotOccupied(slot: number): boolean {
  try {
    const k = slotKeys(slot);
    return (
      parseSave(localStorage.getItem(k.save)) !== null ||
      parseSave(localStorage.getItem(k.bak)) !== null ||
      (k.legacy !== null && localStorage.getItem(k.legacy) !== null)
    );
  } catch {
    return false;
  }
}

/** Erase one journal from the shelf: primary, backup, and (slot 0) the
 * pre-rename key, or the old journey resurrects as Continue on next boot. */
export function eraseSlot(slot: number) {
  try {
    const k = slotKeys(slot);
    localStorage.removeItem(k.save);
    localStorage.removeItem(k.bak);
    if (k.legacy) localStorage.removeItem(k.legacy);
  } catch {
    // Nothing to remove is fine.
  }
}

// ------------------------------------------------------------ pack & unpack
//
// A journal can be packed into a small file and carried to another browser.
// The file is JSON around a base64 copy of the exact stored save string, so
// a pack-then-unpack round trip is byte-for-byte. The checksum is not
// security, only a seal on the envelope: it tells a truncated download or a
// stray edit apart from a journal worth trusting to parseSave.

const PACK_KIND = 'zoila-journal';
const PACK_VERSION = 1;

/** djb2-xor over the base64 payload; small, stable, dependency-free. */
function checksum(s: string): string {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h * 33) ^ s.charCodeAt(i)) >>> 0;
  return h.toString(16);
}

/** Base64 that survives any name a player could write on a flyleaf. */
function toB64(s: string): string {
  const bytes = new TextEncoder().encode(s);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

function fromB64(b: string): string {
  const bin = atob(b);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

/** Fold one journal into file text, or null when the slot holds nothing
 * readable. `name` is whatever the flyleaf says, for the filename. */
export function packSlot(slot: number): { name: string | null; text: string } | null {
  const raw = readSlotRaw(slot);
  if (!raw) return null;
  const data = toB64(raw);
  const text = JSON.stringify(
    { kind: PACK_KIND, version: PACK_VERSION, checksum: checksum(data), data },
    null,
    2,
  );
  const parsed = parseSave(raw);
  return { name: parsed?.name ?? null, text };
}

/**
 * Open a packed journal: seal checked first, then the full parseSave the
 * loader itself trusts. Returns the exact save string that was packed, or
 * null for anything torn, tampered with, or simply not a journal.
 */
export function unpackJournal(text: string): string | null {
  try {
    const obj = JSON.parse(text) as {
      kind?: unknown;
      version?: unknown;
      checksum?: unknown;
      data?: unknown;
    };
    if (!obj || obj.kind !== PACK_KIND) return null;
    if (typeof obj.version !== 'number' || obj.version > PACK_VERSION) return null;
    if (typeof obj.data !== 'string' || obj.checksum !== checksum(obj.data)) return null;
    const raw = fromB64(obj.data);
    return parseSave(raw) ? raw : null;
  } catch {
    return null;
  }
}

/**
 * Put an unpacked journal into a slot. Only a string parseSave accepts is
 * written, and a readable journal already there becomes the slot's backup
 * first, exactly as save() would treat it: one mistake stays survivable.
 */
export function writeSlotRaw(slot: number, raw: string): boolean {
  if (!parseSave(raw)) return false;
  try {
    const k = slotKeys(slot);
    const prev = localStorage.getItem(k.save);
    if (prev && parseSave(prev)) localStorage.setItem(k.bak, prev);
    localStorage.setItem(k.save, raw);
    return true;
  } catch {
    return false;
  }
}

/** The three strokes of the traveler the player may choose at the flyleaf.
 * null everywhere means Nani's original sketch (the default look). */
export type PlayerLook = { skin: string; cloth: string; hair: string };

type Events = {
  journal: (id: string) => void;
  errand: (id: string | null) => void;
  letter: (id: string) => void;
  thread: () => void;
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
  private onThread: Events['thread'][] = [];
  private onTravel: Events['travel'][] = [];
  private onChanged: Events['changed'][] = [];

  on<K extends keyof Events>(ev: K, fn: Events[K]) {
    if (ev === 'journal') this.onJournal.push(fn as Events['journal']);
    else if (ev === 'errand') this.onErrand.push(fn as Events['errand']);
    else if (ev === 'letter') this.onLetter.push(fn as Events['letter']);
    else if (ev === 'thread') this.onThread.push(fn as Events['thread']);
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
          // Mail from a previous chapter: the UI unfolds the page, and the
          // read flag is set only when the player closes it. Marking it here
          // meant a reload between the handover and the unfolding lost the
          // letter forever; the clerk never offered it again and no re-read
          // path exists anywhere.
          for (const fn of this.onLetter) fn(arg);
          break;

        case 'thread':
          // A villager offers to show the way: Nani's red thread unspools
          // from their feet once the conversation closes. Mirrors 'letter':
          // the effect only raises the intent, main draws it afterward.
          for (const fn of this.onThread) fn();
          break;
        case 'letterread':
          this.flags.add(`letter.read.${arg}`);
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
      const payload = JSON.stringify({
        flags: [...this.flags],
        journal: [...this.journal],
        errand: this.errand,
        place: this.place,
        name: this.playerName,
        look: this.playerLook,
      });
      // Keep the last known-good copy before overwriting. A journey can be
      // thirty hours long; a single torn write must never be able to end it.
      const k = slotKeys(activeSlot());
      const prev = localStorage.getItem(k.save);
      if (prev && parseSave(prev)) localStorage.setItem(k.bak, prev);
      localStorage.setItem(k.save, payload);
      this.persistenceLost = false;
    } catch {
      // Private browsing or full storage: play on without persistence, but
      // SAY SO, once. A 30-hour journey silently unsaved from here on is
      // the cruelest failure this file could produce. onPersistenceLost is
      // wired by main to a toast; save() keeps retrying on later calls.
      if (!this.persistenceLost) {
        this.persistenceLost = true;
        this.onPersistenceLost?.();
      }
    }
  }

  /** True after a save failed; cleared by the next save that lands. */
  persistenceLost = false;
  /** Fired once when saving stops working, so the UI can warn the player. */
  onPersistenceLost: (() => void) | null = null;

  /**
   * Put down the loaded journey without touching the shelf: every in-memory
   * field returns to its blank-boot value, storage stays exactly as it is.
   * This is how switching journals starts clean; load() then reads the one
   * now on the table. Fires no events; callers rebuild UI themselves.
   */
  forget() {
    this.flags.clear();
    this.journal.clear();
    this.errand = null;
    this.place = null;
    this.playerName = null;
    this.playerLook = null;
    this.persistenceLost = false;
  }

  /** Wipe everything for a fresh journey in the active slot. Fires no
   * events; callers reset UI. Other journals on the shelf are untouched. */
  reset() {
    this.forget();
    // eraseSlot also clears the pre-rename save for slot 0, or the old
    // journey resurrects as Continue on the next boot.
    eraseSlot(activeSlot());
  }

  hasSave(): boolean {
    return slotOccupied(activeSlot());
  }

  load() {
    try {
      const k = slotKeys(activeSlot());
      if (new URLSearchParams(location.search).has('fresh')) {
        localStorage.removeItem(k.save);
        localStorage.removeItem(k.bak);
        if (k.legacy) localStorage.removeItem(k.legacy);
        return;
      }
      // Primary first, then the last known-good copy, then the old key.
      // Silently starting a fresh journey is the one unacceptable outcome.
      const data =
        parseSave(localStorage.getItem(k.save)) ??
        parseSave(localStorage.getItem(k.bak)) ??
        (k.legacy ? parseSave(localStorage.getItem(k.legacy)) : null);
      if (!data) return;
      for (const f of data.flags ?? []) this.flags.add(f);
      // Session-scoped state that must never survive a reload: replay.mode
      // marks "this panel run is a replay", and orphaned across a reload it
      // made the next first-time completion skip its own done narration.
      this.flags.delete('replay.mode');
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
