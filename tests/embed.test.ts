import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { embedded, savesAreFragile } from '../src/ui/embed';

/**
 * Inside itch's iframe, Safari and Brave forget the game's storage when the
 * browser closes, and every write still succeeds: the only defence is to say
 * so and point at Pack.
 */
function browser(ua: string, opts: { framed: boolean; brave?: boolean; touch?: number }) {
  const self = {};
  (globalThis as Record<string, unknown>).window = { self, top: opts.framed ? {} : self };
  Object.defineProperty(globalThis, 'navigator', {
    value: { userAgent: ua, maxTouchPoints: opts.touch ?? 0, ...(opts.brave ? { brave: {} } : {}) },
    configurable: true,
  });
}

const SAFARI = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15';
const IPHONE_CHROME = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/126.0 Mobile/15E148 Safari/604.1';
const CHROME = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

describe('saves that may not outlast the browser', () => {
  it('Safari and every iPhone browser, embedded, are warned', () => {
    browser(SAFARI, { framed: true });
    assert.equal(savesAreFragile(), true);
    browser(IPHONE_CHROME, { framed: true });
    assert.equal(savesAreFragile(), true);
  });

  it('Brave embedded is warned; Chrome embedded is not', () => {
    browser(CHROME, { framed: true, brave: true });
    assert.equal(savesAreFragile(), true);
    browser(CHROME, { framed: true });
    assert.equal(savesAreFragile(), false);
  });

  it("nobody is warned on the game's own page", () => {
    browser(SAFARI, { framed: false });
    assert.equal(embedded(), false);
    assert.equal(savesAreFragile(), false);
  });
});
