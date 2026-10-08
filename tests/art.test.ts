import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { hasDishArt } from '../src/art/dishes';
import { MAP_PINS } from '../src/art/sets/index';
import { EXAMINES, JOURNAL, REGION_MAPS } from '../src/content/world';

describe('art coverage', () => {
  // Rosa's soup, the game's first bowl, and all seven Delhi dishes once
  // opened on an empty painting slot while 44 others had theirs.
  it('every dish page in the journal has its painting', () => {
    const missing = JOURNAL.filter((e) => e.tab === 'dishes' && !hasDishArt(e.id)).map((e) => e.id);
    assert.deepEqual(missing, []);
  });
});

describe('the Sicilian mole reads as a breakwater', () => {
  const m = REGION_MAPS['sicily']!;
  const kind = (x: number, y: number) => m.legend[m.ground[y]?.[x] ?? '']?.t;
  const cells: [number, number][] = [];
  for (let y = 0; y < m.ground.length; y++) {
    for (let x = 0; x < m.ground[y]!.length; x++) if (kind(x, y) === 'scogliera') cells.push([x, y]);
  }

  // A heap of armour stone leans against the mole: a cell left to the
  // variant hash would pile its stones against open water instead.
  it('pins every cell of armour stone to the variant that leans toward the mole', () => {
    assert.ok(cells.length >= 12, 'the mole has lost its scogliera');
    const pins = MAP_PINS['sicily']!;
    const unpinned = cells.filter(([x, y]) => !pins.get(y * 4096 + x)?.some((p) => p.kind === 'scogliera'));
    assert.deepEqual(unpinned, []);
  });

  // The south side is the berth: the ship comes alongside there.
  it('keeps the quay side clear and every armour cell answers when faced', () => {
    for (const [x, y] of cells) {
      assert.ok(m.legend[m.ground[y]![x]!]!.solid, `armour at ${x},${y} must be solid`);
      assert.notEqual(kind(x, y - 1), 'moloface', `armour heaped at the quay foot, ${x},${y}`);
    }
    assert.ok(EXAMINES['scogliera']?.length, 'facing the armour stone says nothing');
  });
});
