export type Dir = 'up' | 'down' | 'left' | 'right';

export const DIR_VEC: Record<Dir, readonly [number, number]> = {
  up: [0, -1],
  down: [0, 1],
  left: [-1, 0],
  right: [1, 0],
};

const DIR_KEYS: Record<string, Dir> = {
  ArrowUp: 'up',
  KeyW: 'up',
  ArrowDown: 'down',
  KeyS: 'down',
  ArrowLeft: 'left',
  KeyA: 'left',
  ArrowRight: 'right',
  KeyD: 'right',
};

/** One action button, one back button. Anything more is more than this game needs. */
const ACTION_KEYS = new Set(['Space', 'Enter', 'KeyZ', 'KeyE']);
const BACK_KEYS = new Set(['Escape', 'KeyX', 'Backspace']);
const JOURNAL_KEYS = new Set(['KeyJ', 'Tab']);

export class Input {
  /**
   * Directions in press order. The most recent held direction wins, which is
   * what makes rolling your fingers around a corner feel right instead of
   * sticking to whichever key you happened to press first.
   */
  private dirStack: Dir[] = [];
  private pressed = new Set<string>();
  /**
   * A direction press that arrived and released between two simulation frames.
   * Without this, a fast tap is invisible to the game and you don't even turn,
   * which feels broken. Held input always takes priority over it.
   */
  private tapDir: Dir | null = null;

  private actionEdge = false;
  private backEdge = false;
  private journalEdge = false;
  private debugEdge = false;
  private muteEdge = false;
  private pauseEdge = false;
  /** Gamepad state from the previous poll, for edge detection. */
  private padButtons: boolean[] = [];
  private padDir: Dir | null = null;
  /** Direction keydown edge for menu navigation, independent of held movement. */
  private menuDirEdge: Dir | null = null;

  attach(target: Window = window) {
    target.addEventListener('keydown', this.onDown);
    target.addEventListener('keyup', this.onUp);
    // Releasing focus mid-walk would otherwise leave a key stuck down forever.
    target.addEventListener('blur', this.releaseAll);
  }

  private onDown = (e: KeyboardEvent) => {
    if (e.repeat) return;
    const dir = DIR_KEYS[e.code];
    if (dir) {
      e.preventDefault();
      this.dirStack = this.dirStack.filter((d) => d !== dir);
      this.dirStack.push(dir);
      this.tapDir = dir;
      this.menuDirEdge = dir;
      return;
    }
    if (ACTION_KEYS.has(e.code)) {
      e.preventDefault();
      this.actionEdge = true;
    } else if (e.code === 'Escape') {
      e.preventDefault();
      this.pauseEdge = true;
      this.backEdge = true;
    } else if (BACK_KEYS.has(e.code)) {
      e.preventDefault();
      this.backEdge = true;
    } else if (JOURNAL_KEYS.has(e.code)) {
      e.preventDefault();
      this.journalEdge = true;
    } else if (e.code === 'KeyM') {
      e.preventDefault();
      this.muteEdge = true;
    } else if (e.code === 'F3') {
      e.preventDefault();
      this.debugEdge = true;
    }
    this.pressed.add(e.code);
  };

  private onUp = (e: KeyboardEvent) => {
    const dir = DIR_KEYS[e.code];
    if (dir && !this.stillHeld(dir, e.code)) {
      this.dirStack = this.dirStack.filter((d) => d !== dir);
    }
    this.pressed.delete(e.code);
  };

  private releaseAll = () => {
    this.dirStack = [];
    this.pressed.clear();
    this.tapDir = null;
  };

  /** WASD and arrows can map to the same direction; don't drop it while either is down. */
  private stillHeld(dir: Dir, releasing: string): boolean {
    for (const code of this.pressed) {
      if (code !== releasing && DIR_KEYS[code] === dir) return true;
    }
    return false;
  }

  /**
   * Gamepad: dpad or left stick walks, A talks, B backs, Y opens the journal,
   * Start pauses. Polled once per simulation frame; standard mapping only,
   * which covers every pad a cozy player is likely to own.
   */
  private padAwake = false;

  pollGamepad() {
    const pads = navigator.getGamepads?.() ?? [];
    const pad = pads.find((p) => p && p.connected && p.mapping === 'standard');
    // A resting controller with axis drift must not ghost-drive the menus:
    // ignore every pad until it shows a deliberate press or a hard stick push.
    if (pad && !this.padAwake) {
      const deliberate = pad.buttons.some((b) => b.pressed) || pad.axes.some((a) => Math.abs(a) > 0.7);
      if (!deliberate) return;
      this.padAwake = true;
    }
    if (!pad) {
      if (this.padDir) {
        this.dirStack = this.dirStack.filter((d) => d !== this.padDir);
        this.padDir = null;
      }
      return;
    }
    const b = (i: number) => pad.buttons[i]?.pressed ?? false;
    const edge = (i: number) => {
      const now = b(i);
      const was = this.padButtons[i] ?? false;
      this.padButtons[i] = now;
      return now && !was;
    };
    if (edge(0)) this.actionEdge = true; // A / Cross
    if (edge(1)) this.backEdge = true; // B / Circle
    if (edge(3)) this.journalEdge = true; // Y / Triangle
    if (edge(9)) this.pauseEdge = true; // Start / Options

    const ax = pad.axes[0] ?? 0;
    const ay = pad.axes[1] ?? 0;
    let dir: Dir | null = null;
    if (b(12)) dir = 'up';
    else if (b(13)) dir = 'down';
    else if (b(14)) dir = 'left';
    else if (b(15)) dir = 'right';
    else if (Math.abs(ax) > 0.45 || Math.abs(ay) > 0.45) {
      dir = Math.abs(ax) > Math.abs(ay) ? (ax > 0 ? 'right' : 'left') : ay > 0 ? 'down' : 'up';
    }
    if (dir !== this.padDir) {
      if (this.padDir) this.dirStack = this.dirStack.filter((d) => d !== this.padDir);
      if (dir) {
        this.dirStack = this.dirStack.filter((d) => d !== dir);
        this.dirStack.push(dir);
        this.tapDir = dir;
        this.menuDirEdge = dir;
      }
      this.padDir = dir;
    }
  }

  takePause(): boolean {
    const v = this.pauseEdge;
    this.pauseEdge = false;
    return v;
  }

  /**
   * The direction the player wants this frame. A held key wins; otherwise a
   * tap that came and went since the last frame is consumed once, which turns
   * you in place without stepping (the turn delay in Actor sees it for a single
   * frame, far short of the hold needed to commit to a step).
   */
  intent(): Dir | null {
    const held = this.dirStack.at(-1);
    if (held) {
      this.tapDir = null;
      return held;
    }
    const tap = this.tapDir;
    this.tapDir = null;
    return tap ?? null;
  }

  /** One direction press for menus, consumed on read. */
  takeMenuDir(): Dir | null {
    const v = this.menuDirEdge;
    this.menuDirEdge = null;
    return v;
  }

  /** Edge reads: true once per press, then consumed. */
  takeAction(): boolean {
    const v = this.actionEdge;
    this.actionEdge = false;
    return v;
  }
  takeBack(): boolean {
    const v = this.backEdge;
    this.backEdge = false;
    return v;
  }
  takeJournal(): boolean {
    const v = this.journalEdge;
    this.journalEdge = false;
    return v;
  }
  takeDebug(): boolean {
    const v = this.debugEdge;
    this.debugEdge = false;
    return v;
  }
  takeMute(): boolean {
    const v = this.muteEdge;
    this.muteEdge = false;
    return v;
  }
  /** True while any key is currently held; used to detect a first user gesture. */
  anyPressed(): boolean {
    return this.pressed.size > 0;
  }
}
