import type { Dir } from './input';

/**
 * Dev-only bridge for driving and inspecting the game from browser automation.
 *
 * Browser extensions run in an isolated JS world: they share the DOM with the
 * page but cannot see its variables or deliver synthetic keyboard events to it.
 * The DOM is therefore the only channel, so input comes in through data
 * attributes on <body> and state goes back out the same way.
 *
 * Stripped entirely from production builds by the import.meta.env.DEV guard.
 */

const DIRS = new Set(['up', 'down', 'left', 'right']);

export type DevState = Record<string, unknown>;

export class DevBridge {
  readonly enabled = import.meta.env.DEV;
  private lastActionSeq = '';

  /** Direction held via `document.body.dataset.wfHold`, overriding the keyboard. */
  heldOverride(): Dir | null {
    if (!this.enabled) return null;
    const v = document.body.dataset.wfHold;
    return v && DIRS.has(v) ? (v as Dir) : null;
  }

  /**
   * Fires once each time `dataset.wfAction` changes, so automation can press
   * the action button by bumping a counter.
   */
  takeAction(): boolean {
    if (!this.enabled) return false;
    const seq = document.body.dataset.wfAction ?? '';
    if (seq === this.lastActionSeq) return false;
    this.lastActionSeq = seq;
    return seq !== '';
  }

  private lastJournalSeq = '';
  /** Toggles the journal by bumping `dataset.wfJournal`, mirroring the J key. */
  takeJournal(): boolean {
    if (!this.enabled) return false;
    const seq = document.body.dataset.wfJournal ?? '';
    if (seq === this.lastJournalSeq) return false;
    this.lastJournalSeq = seq;
    return seq !== '';
  }

  private lastMenuSeq = '';
  /** Menu direction via `dataset.wfMenu = "down:3"` (direction:counter). */
  takeMenuDir(): Dir | null {
    if (!this.enabled) return null;
    const raw = document.body.dataset.wfMenu ?? '';
    if (raw === this.lastMenuSeq) return null;
    this.lastMenuSeq = raw;
    const dir = raw.split(':')[0];
    return dir && DIRS.has(dir) ? (dir as Dir) : null;
  }

  private lastCmd = '';
  /**
   * Synchronous simulation channel: `dataset.wfCmd = "sim:120:7"` runs 120
   * fixed steps immediately (the trailing counter just makes the value unique).
   * MutationObservers fire even when the tab is hidden and rAF is paused, so
   * automated playthroughs don't depend on window visibility at all.
   */
  /** When true, villagers stop wandering; drivers can approach them calmly. */
  freezeWander = false;

  attachCommands(step: (frames: number) => void) {
    if (!this.enabled) return;
    const run = () => {
      const raw = document.body.dataset.wfCmd ?? '';
      if (!raw || raw === this.lastCmd) return;
      this.lastCmd = raw;
      const [kind, n] = raw.split(':');
      if (kind === 'sim') step(Math.max(0, Math.min(3600, Number.parseInt(n ?? '0', 10) || 0)));
      else if (kind === 'freeze') this.freezeWander = n?.startsWith('1') ?? false;
    };
    new MutationObserver(run).observe(document.body, {
      attributes: true,
      attributeFilter: ['data-wf-cmd'],
    });
  }

  /** Publishes a snapshot for automation to read back. */
  publish(state: DevState) {
    if (!this.enabled) return;
    document.body.dataset.wfState = JSON.stringify(state);
  }

  /**
   * `?at=21,16&dir=up&map=east-road` drops the player anywhere on load. Saves
   * walking across the world every time you want to look at one corner of it.
   */
  spawnOverride(): { at?: [number, number]; dir?: Dir; map?: string } | null {
    if (!this.enabled) return null;
    const params = new URLSearchParams(location.search);
    const at = params.get('at');
    const mapId = params.get('map');
    if (!at && !mapId) return null;
    let coords: [number, number] | undefined;
    if (at) {
      const [x, y] = at.split(',').map((n) => Number.parseInt(n, 10));
      if (Number.isInteger(x) && Number.isInteger(y)) coords = [x as number, y as number];
    }
    const dir = params.get('dir');
    return {
      at: coords,
      dir: dir && DIRS.has(dir) ? (dir as Dir) : undefined,
      map: mapId ?? undefined,
    };
  }
}
