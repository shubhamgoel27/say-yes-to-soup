import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { Textbox } from '../src/ui/textbox';
import type { NodeMap } from '../src/content/schema';
import type { GameState } from '../src/engine/state';

/**
 * A conversation opens with one villager's face, but other people speak in
 * it: Appu in Shaji's, Mi-ja in Dae-ho's. The box once kept the opener's
 * portrait for every named line, so Appu spoke with Shaji's moustache.
 */

type FakeEl = {
  hidden: boolean;
  textContent: string;
  innerHTML: string;
  offsetWidth: number;
  kids: unknown[];
  classList: { add(): void; remove(): void; toggle(): void };
  appendChild(c: unknown): void;
};

function el(): FakeEl {
  const e: FakeEl = {
    hidden: true,
    textContent: '',
    offsetWidth: 0,
    kids: [],
    classList: { add() {}, remove() {}, toggle() {} },
    appendChild(c) {
      e.kids.push(c);
    },
    get innerHTML() {
      return '';
    },
    set innerHTML(_v: string) {
      e.kids = [];
    },
  };
  return e;
}

const state = { apply() {}, check: () => true, playerName: '' } as unknown as GameState;
const SHAJI = { face: 'shaji' } as unknown as HTMLCanvasElement;
const APPU = { face: 'appu' } as unknown as HTMLCanvasElement;
const faces: Record<string, HTMLCanvasElement | null> = { Shaji: SHAJI, Appu: APPU, Sheru: null };

function boxShowing(who: string | undefined) {
  const els = { root: el(), portrait: el(), name: el(), text: el(), arrow: el(), choices: el() };
  const tb = new Textbox(els as never, state, undefined, (w) => (w in faces ? faces[w] : undefined));
  const nodes: NodeMap = { n: { lines: [{ who, text: 'hello' }] } } as NodeMap;
  tb.open(nodes, 'n', SHAJI);
  return els.portrait;
}

describe('speaker portraits', () => {
  it('a second speaker shows their own face, not the opener’s', () => {
    const p = boxShowing('Appu');
    assert.equal(p.hidden, false);
    assert.deepEqual(p.kids, [APPU]);
  });
  it('the opener still shows their own face', () => {
    assert.deepEqual(boxShowing('Shaji').kids, [SHAJI]);
  });
  it('a known speaker without a face shows none, and narration shows none', () => {
    assert.equal(boxShowing('Sheru').hidden, true);
    assert.equal(boxShowing(undefined).hidden, true);
  });
  it('a name the game does not know falls back to the opener', () => {
    assert.deepEqual(boxShowing('A voice from the boat').kids, [SHAJI]);
  });
});
