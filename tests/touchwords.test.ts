import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

/**
 * A thumb never reads a keyboard's words. Every hint a panel shows passes
 * through mountScene's setHint, which hands it to forTouch on glass; here
 * every game is played (story and hard, careful and mashing) and every hint
 * it ever showed is held to that standard. The how-to cards are content, so
 * they are checked the way a phone loads them: with a coarse pointer from
 * the first import.
 */

// A phone, from before the first module loads: the cards are spelled at import.
(globalThis as { matchMedia?: unknown }).matchMedia = (q: string) => ({
  matches: /coarse|hover: none/.test(q),
  addEventListener() {},
  removeEventListener() {},
});

const { ghost, play, seedRandom } = await import('./panelrig');
const { BOTS } = await import('./bots');
const { GAMES } = await import('../src/content/world');
const { RUN } = await import('../src/ui/games/run');
const { forTouch } = await import('../src/ui/games/scene');

type Any = any; // eslint-disable-line @typescript-eslint/no-explicit-any

/** Words that name a key. "the wind arrow" is a thing in the sky, not a key. */
const KEYISH = /\bSpace\b|\b[Aa]rrows\b|\barrow keys?\b|\bEsc\b|\bEnter\b|\b[Ll]eft and right\b|\b[Uu]p and down\b|\b(Up|Down)\b(?! the)|[←→↑↓]/;

const plain = (h: string) => h.replace(/<[^>]+>/g, ' ');

describe('panel hints on glass', () => {
  it('forTouch speaks the pad and the stick', () => {
    assert.equal(forTouch('Press Space.', 'the stick'), 'Tap ✦.');
    assert.equal(forTouch('Arrows choose, Space adds.', 'the stick'), 'The stick chooses, ✦ adds.');
    assert.equal(forTouch('Follow the wind arrow with the arrows.', 'the stick'), 'Follow the wind arrow with the stick.');
    assert.equal(forTouch('Left and right pick a card, Space plays it.', 'the pad'), 'The pad picks a card, ✦ plays it.');
  });

  for (const g of GAMES) {
    it(`${g.flag}: no hint a run shows names a key`, () => {
      const seen = new Set<string>();
      const hands: [boolean, () => (p: Any, t: number) => void][] = [
        [false, BOTS[g.flag] ?? (() => (p: Any) => p.onAction())],
        [true, BOTS[g.flag] ?? (() => (p: Any) => p.onAction())],
        [
          false,
          () => {
            let f = 0;
            const D = ['up', 'right', 'down', 'left'];
            return (p: Any) => {
              if (f++ % 7) return;
              if (f % 3) p.onAction();
              else p.onDir(D[f % 4]);
            };
          },
        ],
      ];
      for (const [hard, mk] of hands) {
        if (hard && !g.hardHow) continue;
        const undo = seedRandom(11);
        try {
          RUN.hard = hard;
          const p = g.make(ghost(), ghost(), () => new Set()) as Any;
          const bot = mk();
          play(p, (pp: Any, t: number) => {
            seen.add(String(pp.hint ?? ''));
            bot(pp, t);
            seen.add(String(pp.hint ?? ''));
          }, 200);
        } finally {
          RUN.hard = false;
          undo();
        }
      }
      for (const h of seen) {
        const out = plain(forTouch(h, 'the stick'));
        assert.doesNotMatch(out, KEYISH, `${g.flag} shows a thumb: "${out.slice(0, 160)}"`);
      }
    });
  }
});

describe('how-to cards on glass', () => {
  for (const g of GAMES) {
    it(`${g.flag}: the card speaks to a thumb`, () => {
      for (const line of [...(g.howTo ?? []), g.hardHow ?? '']) {
        assert.doesNotMatch(plain(line), KEYISH, `${g.flag} card: "${line}"`);
      }
    });
  }
});
