import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { LETTERS } from '../src/content/world';

/**
 * Pilar is told in Chapter 3 which sea thing arrived. Every later letter
 * that remembers the puffer fish must also remember the sea star and the
 * claw: two thirds of players once got a stranger's letter in Kerala,
 * Zanzibar and Sicily after being thanked by name on the ship.
 */
const GIFTS = ['pilar.gift.puffer', 'pilar.gift.star', 'pilar.gift.claw'];

describe("Pilar remembers what you sent her", () => {
  const byId = new Map<string, typeof LETTERS>();
  for (const l of LETTERS) byId.set(l.id, [...(byId.get(l.id) ?? []), l]);
  const remembering = [...byId].filter(([, vs]) =>
    vs.some((v) => GIFTS.some((g) => v.when?.has?.includes(g))),
  );

  it('some letters remember the gift at all', () => {
    assert.ok(remembering.length >= 5);
  });

  for (const [id, variants] of remembering) {
    it(`${id} has a variant for every gift`, () => {
      for (const g of GIFTS) {
        assert.ok(
          variants.some((v) => v.when?.has?.includes(g)),
          `${id} forgets ${g.split('.').pop()}`,
        );
      }
    });
  }
});
