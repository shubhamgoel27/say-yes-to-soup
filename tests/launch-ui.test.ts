import assert from 'node:assert/strict';
import { describe, it, mock } from 'node:test';
import { readFileSync } from 'node:fs';
import { JOURNAL } from '../src/content/world';
import { JournalUI, WheelSteps, canScrollFurther, revealScroll } from '../src/ui/journal';
import { PauseMenu } from '../src/ui/pause';
import { Textbox } from '../src/ui/textbox';
import { keysOrTaps, lastDevice, noteDevice, padWords } from '../src/ui/responsive';
import { handWords } from '../src/ui/games/scene';
import type { NodeMap } from '../src/content/schema';
import type { GameState } from '../src/engine/state';

/**
 * Launch polish for the overlays: the journal's long lists keep their place,
 * and the cursor stays on the page.
 */

describe('a journal list keeps the chosen row on the page', () => {
  // A 200px window onto a list; rows are 24px tall.
  const VIEW = 200;

  it('leaves the list alone while the row is already showing', () => {
    assert.equal(revealScroll(240, 264, 200, VIEW), 200);
    assert.equal(revealScroll(208, 232, 200, VIEW), 200);
  });

  it('moves only as far as it must, never recentring', () => {
    // Below the fold: the row's foot lands just above the window's foot.
    assert.equal(revealScroll(400, 424, 200, VIEW), 424 + 8 - VIEW);
    // Above it: the row's head lands just under the window's head.
    assert.equal(revealScroll(96, 120, 200, VIEW), 96 - 8);
  });

  it('clears the faded foot of the list', () => {
    assert.equal(revealScroll(400, 424, 200, VIEW, 8, 20), 424 + 20 - VIEW);
  });

  it('never scrolls above the top, and shows the head of a row taller than the window', () => {
    assert.equal(revealScroll(4, 28, 50, VIEW), 0);
    assert.equal(revealScroll(300, 600, 0, VIEW), 300 - 8);
  });

  it('tells a hover or a tap from the arrows by the event still being dispatched', () => {
    const heard: Record<string, ((e: Event) => void)[]> = {};
    const root = {
      hidden: true,
      addEventListener(type: string, fn: (e: Event) => void, capture?: boolean) {
        assert.equal(capture, true, 'heard before the page handlers move the cursor');
        (heard[type] ??= []).push(fn);
      },
    } as unknown as HTMLElement;
    const state = { hasPage: () => false } as unknown as GameState;
    const ui = new JournalUI(root, JOURNAL, [], [], state);
    const steering = () => (ui as unknown as { pointerSteering: boolean }).pointerSteering;
    assert.equal(steering(), false, 'nothing has pointed yet: the arrows reveal');
    for (const type of ['mouseover', 'click', 'pointerup']) {
      const ev = { eventPhase: 1 } as unknown as Event;
      for (const fn of heard[type] ?? []) fn(ev);
      (ev as { eventPhase: number }).eventPhase = 3; // bubbling up to main.ts
      assert.equal(steering(), true, `${type} in flight`);
      (ev as { eventPhase: number }).eventPhase = 0; // dispatch finished
      assert.equal(steering(), false, `${type} done: a later key press reveals again`);
    }
  });
});

describe('the wheel over the journal', () => {
  it('lets a page that still has text below scroll, and turns pages at its ends', () => {
    // 600px of page in a 300px window.
    assert.equal(canScrollFurther(0, 300, 600, 40), true);
    assert.equal(canScrollFurther(300, 300, 600, 40), false, 'at the foot: the wheel turns the page');
    assert.equal(canScrollFurther(0, 300, 600, -40), false, 'at the head going up: the wheel turns back');
    assert.equal(canScrollFurther(120, 300, 600, -40), true);
    assert.equal(canScrollFurther(0, 300, 300, 40), false, 'a short page never scrolls');
    assert.equal(canScrollFurther(120, 300, 600, 0), false);
  });

  it('turns one page per mouse notch, in either delta mode', () => {
    const w = new WheelSteps();
    assert.equal(w.feed(0, 100, 0, 1000), 1);
    assert.equal(w.feed(0, 100, 0, 1100), 1);
    assert.equal(w.feed(0, -100, 0, 1200), -1);
    assert.equal(w.feed(0, 3, 1, 1300), 1, 'Firefox counts lines');
    assert.equal(w.feed(0, -1, 2, 1400), -1);
  });

  it('turns a trackpad glide into a step per 80px, not one per event', () => {
    const w = new WheelSteps();
    const steps: number[] = [];
    for (let i = 0; i < 40; i++) steps.push(w.feed(0, 8, 0, 1000 + i * 16));
    assert.equal(steps.filter((s) => s !== 0).length, (40 * 8) / 80);
    assert.ok(steps.every((s) => s >= 0));
  });

  it('reads sideways and empty deltas as nothing (deltaY 0 once meant up)', () => {
    const w = new WheelSteps();
    assert.equal(w.feed(0, 0, 0, 1000), 0);
    assert.equal(w.feed(30, 10, 0, 1010), 0);
    assert.equal(w.feed(-30, -30, 0, 1020), 0);
  });

  it('starts afresh after a pause or a change of direction', () => {
    const w = new WheelSteps();
    assert.equal(w.feed(0, 60, 0, 1000), 0);
    assert.equal(w.feed(0, 60, 0, 2000), 0, 'the earlier 60px went stale');
    assert.equal(w.feed(0, -60, 0, 2010), 0, 'reversing drops the downward travel');
    assert.equal(w.feed(0, -60, 0, 2020), -1);
  });

  it('does not let the glide that scrolled a page go on to turn it', () => {
    const w = new WheelSteps();
    w.hold(1000); // the page text took the wheel up to here
    for (let t = 1016; t < 1600; t += 16) assert.equal(w.feed(0, 40, 0, t), 0, `momentum at ${t}`);
    assert.equal(w.feed(0, 100, 0, 2000), 1, 'a fresh turn after a rest');
  });
});

describe('cards on a phone lying down fit the room the toolbar leaves', () => {
  it('every height cap in vh is followed by its dvh twin (desktop-only tiers aside)', () => {
    // 100vh is the room with the toolbar hidden; a phone held sideways in
    // the browser shows less, and #frame already follows dvh. A card capped
    // in vh alone was centred in that smaller frame and lost its title and
    // its foot. Browsers without dvh drop the twin and keep the vh line.
    const lines = readFileSync('index.html', 'utf8').split('\n');
    const bare: string[] = [];
    lines.forEach((line, i) => {
      if (/^\s*\*/.test(line)) return; // comment prose
      const m = line.match(/([a-z-]+):[^;]*\b\d+(?:\.\d+)?vh\b/);
      if (!m || m[1] === 'font-size') return;
      let media = '';
      for (let j = i; j >= 0; j--) {
        if (lines[j]?.includes('@media')) {
          media = lines[j] ?? '';
          break;
        }
      }
      if (media.includes('pointer: fine')) return; // a desk, where dvh is vh
      const ahead = [line.slice((m.index ?? 0) + m[0].length), ...lines.slice(i + 1, i + 4)].join('\n');
      if (!new RegExp(`${m[1]}:[^;]*\\d+dvh`).test(ahead)) bare.push(`${i + 1}: ${line.trim()}`);
    });
    assert.deepEqual(bare, []);
  });
});

describe('the journal labels follow Large text', () => {
  const css = readFileSync('index.html', 'utf8');
  const rule = (sel: string) => {
    const at = css.indexOf(`${sel} {`);
    assert.ok(at >= 0, `${sel} is styled`);
    return css.slice(at, css.indexOf('}', at));
  };
  const px = (block: string) => Number(block.match(/--fs-label:\s*([\d.]+)px/)?.[1]);

  it('NANI, 1974 / YOU / NOW are sized from the tier, which Large text raises', () => {
    for (const sel of ['.j-nani span, .j-you span', '.j-thread span', '.jt-nani span', '.jt-k', '.jt-bag span']) {
      const block = rule(sel);
      assert.match(block, /font-size: var\(--fs-label\)/, sel);
      assert.doesNotMatch(block, /opacity/, `${sel} is solid ink, not see-through`);
    }
    assert.ok(px(rule('body.text-large')) > px(rule(':root')));
  });
});

/** Just enough of a page for the overlays to draw into. */
function fakeDocument() {
  (globalThis as { document?: unknown }).document = {
    body: { classList: { toggle() {}, contains: () => false } },
    documentElement: {},
  };
}

describe('the keyboard reaches the whole of How to play and the credits', () => {
  it('up and down read down a card that has no cursor', () => {
    fakeDocument();
    const scrolled: number[] = [];
    const card = {
      scrollTop: 0,
      scrollHeight: 900,
      clientHeight: 400,
      scrollBy: (o: { top: number }) => void scrolled.push(o.top),
      querySelector: () => null,
      querySelectorAll: () => [],
    };
    const root = { hidden: true, innerHTML: '', querySelector: (sel: string) => (sel === '.p-card' ? card : null) };
    const audio = { mix: { music: 1, sfx: 1, ambience: 1 }, muted: false };
    const menu = new PauseMenu(root as never, audio as never, { onTextSpeed() {}, onToTitle() {} });
    for (const screen of ['help', 'credits'] as const) {
      menu.open(screen, true);
      scrolled.length = 0;
      menu.onDir('down');
      menu.onDir('down');
      menu.onDir('up');
      menu.onDir('left');
      assert.deepEqual(scrolled, [80, 80, -80], screen);
    }
  });
});

describe('the screen reader hears each line, once, and only while it is up', () => {
  function el() {
    return {
      hidden: true,
      textContent: '',
      innerHTML: '',
      offsetWidth: 0,
      children: [],
      style: {},
      classList: { add() {}, remove() {}, toggle() {}, contains: () => false },
      appendChild() {},
    };
  }

  it('clears the line when the box closes, and says a repeated line again', () => {
    fakeDocument();
    mock.timers.enable({ apis: ['setTimeout'] });
    try {
      const live = el();
      const els = { root: el(), portrait: el(), name: el(), text: el(), arrow: el(), choices: el(), live };
      const state = { apply() {}, check: () => true, playerName: '' } as unknown as GameState;
      const tb = new Textbox(els as never, state);
      const nodes = { n: { lines: [{ who: 'Carmen', text: 'Sit.' }] } } as unknown as NodeMap;

      tb.open(nodes, 'n', null);
      assert.equal(live.textContent, '', 'emptied first, so the line is news');
      mock.timers.tick(100);
      assert.equal(live.textContent, 'Carmen: Sit.');

      tb.onAction(); // finish typing
      tb.onAction(); // last line: the box closes
      assert.equal(tb.isOpen, false);
      assert.equal(live.textContent, '', 'nothing lingers to be read on review');
      mock.timers.tick(500);
      assert.equal(live.textContent, '');

      // The same first line again: still a change, so still spoken.
      tb.open(nodes, 'n', null);
      assert.equal(live.textContent, '');
      mock.timers.tick(100);
      assert.equal(live.textContent, 'Carmen: Sit.');
    } finally {
      mock.timers.reset();
    }
  });

  it('a newer line replaces one still waiting', () => {
    fakeDocument();
    mock.timers.enable({ apis: ['setTimeout'] });
    try {
      const live = el();
      const els = { root: el(), portrait: el(), name: el(), text: el(), arrow: el(), choices: el(), live };
      const state = { apply() {}, check: () => true, playerName: '' } as unknown as GameState;
      const tb = new Textbox(els as never, state);
      const nodes = { n: { lines: [{ text: 'One.' }, { text: 'Two.' }] } } as unknown as NodeMap;
      tb.open(nodes, 'n', null);
      tb.onAction(); // finish
      tb.onAction(); // next line, before the first was handed over
      mock.timers.tick(100);
      assert.equal(live.textContent, 'Two.');
    } finally {
      mock.timers.reset();
    }
  });
});

describe('a gamepad in hand reads the pad\'s own buttons', () => {
  it('spells the keyboard copy in pad words', () => {
    assert.equal(padWords('Space to begin &middot; Esc, not yet'), 'A to begin &middot; B, not yet');
    assert.equal(padWords('press J to open the journal'), 'press Y to open the journal');
    assert.equal(padWords('press N when the way is lost'), 'press X when the way is lost');
    assert.equal(padWords('you sit. (any key to rise)'), 'you sit. (any button to rise)');
    assert.equal(
      padWords('walk with the arrow keys or WASD, or click where you want to go'),
      'walk with the stick or the d-pad, or click where you want to go',
    );
    assert.equal(padWords('&#8592;&#8594; adjust &nbsp; Esc back'), '&#8592;&#8594; adjust &nbsp; B back');
    assert.equal(padWords('&#8592;&#8594; sections &nbsp; J close'), '&#8592;&#8594; sections &nbsp; Y close');
    assert.equal(padWords('Press Space.'), 'Press A.');
    assert.equal(padWords('space'), 'A', 'the painted key cap');
  });

  it('leaves a lone capital in prose alone', () => {
    assert.equal(padWords('J. Smith signed it, and N was the ninth.'), 'J. Smith signed it, and N was the ninth.');
  });

  it('follows the last device used: pad words on a pad, keys and taps as before otherwise', () => {
    assert.equal(lastDevice(), 'keys', 'nothing pressed on a desk yet');
    noteDevice('pad');
    try {
      assert.equal(lastDevice(), 'pad');
      assert.equal(keysOrTaps('Esc back', 'tap beside the page'), 'B back');
      assert.equal(keysOrTaps('Esc back', 'tap beside the page', true), 'B back', 'a pad on a phone is still a pad');
      assert.equal(handWords('Arrows to drift it, Space to scoop.'), 'Arrows to drift it, A to scoop.');
    } finally {
      noteDevice('keys');
    }
    assert.equal(keysOrTaps('Esc back', 'tap beside the page'), 'Esc back');
    assert.equal(keysOrTaps('Esc back', 'tap beside the page', true), 'tap beside the page');
    noteDevice('touch');
    assert.equal(keysOrTaps('Esc back', 'tap beside the page', false), 'Esc back', 'the screen test still decides');
    noteDevice('keys');
  });

  it('How to play lists the pad\'s buttons to a pad player, and Settings drops the (M)', () => {
    fakeDocument();
    const root = { hidden: true, innerHTML: '', querySelector: () => null };
    const audio = { mix: { music: 1, sfx: 1, ambience: 1 }, muted: false };
    const menu = new PauseMenu(root as never, audio as never, { onTextSpeed() {}, onToTitle() {} });
    const text = () => root.innerHTML.replace(/<[^>]+>/g, '|').replace(/\s*\|\s*/g, '|');
    menu.open('help', true);
    assert.match(text(), /J \/ Tab \/ Y/);
    assert.match(text(), /Esc back/);
    noteDevice('pad');
    try {
      menu.open('help', true);
      assert.match(text(), /The journal\|+Y\|/);
      assert.match(text(), /Pause\|+Start\|/);
      assert.match(text(), /B back/);
      assert.doesNotMatch(text(), /\bEsc\b|\bSpace\b|\bJ \//);
      menu.open('settings', true);
      assert.match(text(), /Sound\|+on\|/, 'no M key on a pad');
    } finally {
      noteDevice('keys');
    }
    menu.open('settings', true);
    assert.match(text(), /on \(M\)/);
  });
});
