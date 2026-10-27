/**
 * Where the game is being played, as far as saving is concerned.
 *
 * On itch.io the game runs in a cross-site iframe. Safari (every iOS browser
 * is Safari underneath) keeps a third-party frame's storage only until the
 * browser quits, and Brave's shields clear it soon after the tab closes. The
 * writes all succeed, so nothing in state.ts ever sees a failure: the shelf
 * is simply empty next time. The game cannot fix that; it can say so, and
 * point at Pack, which hands the player a copy of their journal.
 */

/** Running inside another site's page (itch.io's embed). */
export function embedded(): boolean {
  try {
    return window.top !== window.self;
  } catch {
    return true; // a cross-origin top refuses even the comparison
  }
}

/** A browser known to forget an embedded page's storage. */
function forgetsEmbeddedStorage(): boolean {
  if (typeof navigator === 'undefined') return false;
  if ((navigator as { brave?: unknown }).brave) return true;
  const ua = navigator.userAgent;
  const ios = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  const safari = /Safari\//.test(ua) && !/Chrome|Chromium|CriOS|Edg|OPR|Firefox|FxiOS/.test(ua);
  return ios || safari;
}

/** Saves here may not outlast the browser: say so, and suggest Pack. */
export function savesAreFragile(): boolean {
  return embedded() && forgetsEmbeddedStorage();
}

/** The line the cover and the shelf show when saves are fragile. */
export const FRAGILE_NOTE =
  'Played inside this page, this browser may forget the journal when it closes. Pack it on the shelf to keep a copy, or play at shubhamgoel27.github.io/say-yes-to-soup';

/**
 * Ask the browser to treat this site's storage as the player's, not as a
 * cache to evict (Safari otherwise drops it after seven days unvisited).
 * Granted or not, nothing else changes; asked once, after a real save.
 */
let persistAsked = false;
export function askToKeepStorage(): void {
  if (persistAsked) return;
  persistAsked = true;
  try {
    void navigator.storage?.persist?.().catch(() => {});
  } catch {
    // No storage manager here; the journal still saves as before.
  }
}
