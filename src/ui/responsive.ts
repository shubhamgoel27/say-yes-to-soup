/**
 * Small-screen helpers: knowing when we are on a touch-first device, and the
 * one-time portrait nudge. Detection is capability-based (coarse pointer, no
 * hover), never user-agent sniffing, so a desktop with a mouse can never
 * match and a phone in a desktop-mode browser still does.
 */

const COARSE_TOUCH_QUERY = '(pointer: coarse) and (hover: none)';

/** A touch-first device: the on-screen pad belongs on it from the start. */
export function isCoarseTouch(): boolean {
  return typeof matchMedia === 'function' && matchMedia(COARSE_TOUCH_QUERY).matches;
}

const NUDGE_KEY = 'elsewhere.rotateNudge';

/**
 * The game is landscape-native (a 320x180 view), but portrait must stay
 * playable: plenty of people play one-handed. So no wall, no forced
 * orientation, just a whisper once, dismissible, that landscape shows more of
 * the world. It retires itself forever after being seen, and leaves the
 * moment the phone actually turns.
 */
export function initRotateNudge(): void {
  if (!isCoarseTouch()) return;
  try {
    if (localStorage.getItem(NUDGE_KEY)) return;
  } catch {
    // Storage blocked: show it this session, skip remembering.
  }

  const portrait = () => window.innerHeight > window.innerWidth && window.innerWidth < 740;

  const style = document.createElement('style');
  style.textContent = `
    #rotatenudge {
      position: fixed;
      left: 50%;
      bottom: calc(216px + env(safe-area-inset-bottom, 0px));
      transform: translateX(-50%) translateY(6px);
      max-width: 78vw;
      padding: 8px 14px;
      background: rgba(244, 234, 214, 0.95);
      color: #43331f;
      border: 1px solid #2b2118;
      border-left: 3px solid #c1512f;
      border-radius: 2px;
      box-shadow: 2px 2px 0 rgba(43, 33, 24, 0.45);
      font-family: 'Caveat', 'Segoe Script', cursive;
      font-size: 18px;
      line-height: 1.25;
      text-align: center;
      opacity: 0;
      transition: opacity 0.5s ease, transform 0.5s ease;
      pointer-events: auto;
      z-index: 60;
    }
    #rotatenudge.in { opacity: 1; transform: translateX(-50%) translateY(0); }
  `;

  const el = document.createElement('div');
  el.id = 'rotatenudge';
  el.textContent = 'Turn your phone for the wider view, or keep going just like this.';

  let shown = false;
  const retire = () => {
    if (!shown) return;
    shown = false;
    el.classList.remove('in');
    window.removeEventListener('resize', onResize);
    setTimeout(() => {
      el.remove();
      style.remove();
    }, 600);
    try {
      localStorage.setItem(NUDGE_KEY, '1');
    } catch {
      // Fine: it will simply offer itself again another day.
    }
  };
  const onResize = () => {
    if (!portrait()) retire();
  };

  // Let the boot settle (title fade, first paint) before whispering.
  setTimeout(() => {
    if (!portrait()) return;
    document.body.appendChild(style);
    document.body.appendChild(el);
    shown = true;
    requestAnimationFrame(() => el.classList.add('in'));
    el.addEventListener('pointerdown', retire, { once: true });
    window.addEventListener('resize', onResize);
    setTimeout(retire, 9000);
  }, 3500);
}
