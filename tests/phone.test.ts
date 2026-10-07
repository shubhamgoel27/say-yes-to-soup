import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';

import { JOURNAL } from '../src/content/world';
import { CHIP_FRESH_MS, ChipFold } from '../src/ui/responsive';

/**
 * The pocket edition's promises that a screenshot cannot keep by itself:
 * the chip folds only after it has been seen, no global whisper names a key
 * to a thumb, and the README counts the pages the journal actually has.
 */

function fakeChip() {
  const classes = new Set<string>();
  return {
    classes,
    el: {
      classList: {
        add: (c: string) => void classes.add(c),
        remove: (c: string) => void classes.delete(c),
        contains: (c: string) => classes.has(c),
      },
    } as unknown as HTMLElement,
  };
}

describe('the task chip reads in full, then folds', () => {
  it('a new thread is fresh, and stays fresh while the HUD is hushed', () => {
    const { el, classes } = fakeChip();
    const fold = new ChipFold(el);
    fold.note('Meet the village.');
    assert.ok(classes.has('fresh'));
    // A conversation is still open: no amount of time folds an unseen chip.
    fold.tick(true, 0);
    fold.tick(true, CHIP_FRESH_MS * 5);
    assert.ok(classes.has('fresh'));
  });

  it('the clock starts when the chip can be seen, and folds it after', () => {
    const { el, classes } = fakeChip();
    const fold = new ChipFold(el);
    fold.note('Meet the village.');
    fold.tick(false, 1000);
    fold.tick(false, 1000 + CHIP_FRESH_MS - 1);
    assert.ok(classes.has('fresh'));
    fold.tick(false, 1000 + CHIP_FRESH_MS);
    assert.ok(!classes.has('fresh'));
  });

  it('rewriting the same thread does not unfold it; a new one does', () => {
    const { el, classes } = fakeChip();
    const fold = new ChipFold(el);
    fold.note('A');
    fold.tick(false, 0);
    fold.tick(false, CHIP_FRESH_MS);
    fold.note('A');
    assert.ok(!classes.has('fresh'));
    fold.note('B');
    assert.ok(classes.has('fresh'));
  });
});

describe('global whispers speak to the hand that holds the game', () => {
  // A literal passed straight to a toast is shown to every device; any key
  // word in it must go through keysOrTaps instead.
  const KEY_WORDS = /\b(press|Space|Esc|Enter|WASD|arrow keys|any key)\b/;
  const LITERAL_TOAST = /toasts\.show(?:Now)?\(\s*(['"`])((?:\\.|(?!\1)[\s\S])*?)\1\s*[,)]/g;

  it('no toast literal in main.ts names a key', () => {
    const src = readFileSync('src/main.ts', 'utf8');
    const bad = [...src.matchAll(LITERAL_TOAST)].map((m) => m[2]).filter((t) => KEY_WORDS.test(t));
    assert.deepEqual(bad, []);
  });

  it('the album, the closing book and the pause pages never name a key on glass', () => {
    // Every desk-only phrase in these overlays is the first argument of a
    // keysOrTaps call (or the desk half of the controls card); whatever is
    // left over is shown to a thumb as well, so it must not name a key.
    const KEYISH = /\b(Space|Esc|Enter|WASD|arrow keys|any key)\b|&#8592;|&#8594;/;
    for (const file of ['src/ui/album.ts', 'src/ui/pause.ts']) {
      let src = readFileSync(file, 'utf8')
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/^\s*\/\/.*$/gm, '')
        .replace(/const desk[\s\S]*?\];/, '');
      src = src.replace(/keysOrTaps\(\s*(['"`])(?:\\.|(?!\1)[\s\S])*?\1/g, 'keysOrTaps(');
      const bad = src.split('\n').filter((l) => KEYISH.test(l));
      assert.deepEqual(bad, [], `${file} shows a thumb a key`);
    }
  });

  it('the cover never asks a finger to "press again"', () => {
    const src = readFileSync('src/ui/title.ts', 'utf8');
    const raw = src.split('\n').filter((l) => /press again/.test(l) && !/const AGAIN/.test(l));
    assert.deepEqual(raw, []);
  });
});

describe('the README counts the real journal', () => {
  it('names the number of pages the journal holds', () => {
    const readme = readFileSync('README.md', 'utf8');
    const m = readme.match(/all (\d+) journal pages/);
    assert.ok(m, 'README no longer states the page count');
    assert.equal(Number(m[1]), JOURNAL.length);
  });
});
