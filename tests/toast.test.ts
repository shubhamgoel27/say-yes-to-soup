import assert from 'node:assert/strict';
import { beforeEach, describe, it, mock } from 'node:test';

/**
 * The toast queue's hush. While a story surface quiets the HUD the toasts
 * are invisible, so a timer-driven toast that kept running behind the fade
 * was simply lost. These tests stand in a tiny DOM and a mocked clock.
 */

type FakeEl = {
  className: string;
  textContent: string;
  classList: { add(c: string): void; remove(c: string): void; contains(c: string): boolean };
  remove(): void;
  parent: FakeRoot | null;
};
type FakeRoot = FakeEl & {
  children: FakeEl[];
  appendChild(el: FakeEl): void;
  replaceChildren(): void;
  querySelector(sel: string): FakeEl | null;
};

function makeEl(): FakeEl {
  const classes = new Set<string>();
  const el: FakeEl = {
    className: '',
    textContent: '',
    parent: null,
    classList: {
      add: (c) => void classes.add(c),
      remove: (c) => void classes.delete(c),
      contains: (c) => classes.has(c),
    },
    remove() {
      if (!this.parent) return;
      this.parent.children = this.parent.children.filter((x) => x !== this);
      this.parent = null;
    },
  };
  return el;
}

function makeRoot(): FakeRoot {
  const root = makeEl() as FakeRoot;
  root.children = [];
  root.appendChild = (el) => {
    el.parent = root;
    root.children.push(el);
  };
  root.replaceChildren = () => {
    for (const c of root.children) c.parent = null;
    root.children = [];
  };
  root.querySelector = (sel) =>
    root.children.find((c) => c.classList.contains(sel.replace(/^\./, ''))) ?? null;
  return root;
}

(globalThis as { document?: unknown }).document = { createElement: () => makeEl() };
(globalThis as { requestAnimationFrame?: unknown }).requestAnimationFrame = (fn: () => void) => fn();

const { Toasts } = await import('../src/ui/toast');

const shown = (root: FakeRoot) => root.children.map((c) => c.textContent);

describe('toasts: the hush holds the queue', () => {
  beforeEach(() => {
    mock.timers.reset();
    mock.timers.enable({ apis: ['setTimeout'] });
  });

  it('plays a series one at a time when nothing is quiet', () => {
    const root = makeRoot();
    const t = new Toasts(root as unknown as HTMLElement);
    t.show('a');
    t.show('b');
    assert.deepEqual(shown(root), ['a']);
    mock.timers.tick(2400);
    mock.timers.tick(450);
    assert.deepEqual(shown(root), ['b']);
  });

  it('nothing starts while held, and the whole line plays after', () => {
    const root = makeRoot();
    const t = new Toasts(root as unknown as HTMLElement);
    t.setHeld(true);
    t.show('✎ a page fills: bread');
    t.show('press J to open the journal');
    mock.timers.tick(20000);
    assert.deepEqual(shown(root), [], 'a held toast must not run out its clock unseen');
    assert.equal(t.pending, 2);
    t.setHeld(false);
    assert.deepEqual(shown(root), ['✎ a page fills: bread']);
    mock.timers.tick(2400);
    mock.timers.tick(450);
    assert.deepEqual(shown(root), ['press J to open the journal']);
  });

  it('a toast caught mid-show goes back to the front and plays whole later', () => {
    const root = makeRoot();
    const t = new Toasts(root as unknown as HTMLElement);
    t.show('first');
    t.show('second');
    mock.timers.tick(1000);
    t.setHeld(true);
    assert.deepEqual(shown(root), [], 'the caught toast leaves the screen');
    mock.timers.tick(10000);
    t.setHeld(false);
    assert.deepEqual(shown(root), ['first'], 'and comes back first, in full');
    mock.timers.tick(2000);
    assert.deepEqual(shown(root), ['first'], 'with its whole time on screen');
  });

  it('showNow speaks through the hush without disturbing the held line', () => {
    const root = makeRoot();
    const t = new Toasts(root as unknown as HTMLElement);
    t.setHeld(true);
    t.show('later');
    t.showNow('sound off');
    assert.deepEqual(shown(root), ['sound off']);
    assert.ok(root.classList.contains('through'));
    mock.timers.tick(2400);
    mock.timers.tick(450);
    assert.deepEqual(shown(root), []);
    assert.ok(!root.classList.contains('through'));
    assert.equal(t.pending, 1);
  });

  it('dismissAll drops the queue and a fade in flight cannot revive it', () => {
    const root = makeRoot();
    const t = new Toasts(root as unknown as HTMLElement);
    t.show('old journey');
    t.show('old news');
    mock.timers.tick(2500); // mid-fade
    t.dismissAll();
    t.setHeld(true);
    t.show('new');
    t.setHeld(false);
    mock.timers.tick(500);
    assert.deepEqual(shown(root), ['new']);
  });

  it('drop takes the closed journal\'s page lines out of a held queue, and only those', () => {
    // The last page is written behind the hush; a page toast still waiting
    // there used to play over the first free frame after the book closed.
    const root = makeRoot();
    const t = new Toasts(root as unknown as HTMLElement);
    t.setHeld(true);
    t.show('✎ a page fills: Haku!');
    t.show('✉ delivered');
    t.show('✦ a margin note of Nani’s has become legible');
    t.drop((x) => /^[✎✦]/.test(x));
    assert.equal(t.pending, 1);
    t.setHeld(false);
    assert.deepEqual(shown(root), ['✉ delivered']);
  });
});
