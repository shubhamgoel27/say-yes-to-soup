import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { ArmedCards, afterTalk, type Spot } from '../src/engine/armed';
import { GAMES, NODES } from '../src/content/world';

/**
 * Sicily's scopa, stepped away from, swallowed Patane's "Up the gangway":
 * the sailing narration played, the scopa card took the end of the talk,
 * and after "Not yet" the player was still standing in Sicily, told they
 * had left. A journey taken in conversation now always runs, and an armed
 * card that was stepped away from waits where it was left.
 */

const SCOPA = 'c8.scopa.start';
const OTHER = 'c8.cannoli.start';
const order = [OTHER, SCOPA];
const circolo: Spot = { map: 'sicily', at: [10, 10], npc: 'alfio' };
const mole: Spot = { map: 'sicily', at: [30, 28], npc: null };

describe('an armed card never swallows a journey', () => {
  it('a journey wins over a card owed at the end of a talk', () => {
    assert.equal(afterTalk(true, SCOPA), 'travel');
    assert.equal(afterTalk(false, SCOPA), 'card');
    assert.equal(afterTalk(false, null), 'none');
  });

  it('stepping away from the scopa sets the card aside: the next talk owes nothing', () => {
    const flags = new Set([SCOPA]);
    const has = (f: string) => flags.has(f);
    const cards = new ArmedCards(order);
    assert.equal(cards.pending(has, () => false), SCOPA, 'armed, before stepping away');
    cards.setAside(SCOPA, circolo); // "Step away"
    assert.equal(cards.pending(has, () => false), null, 'Patane speaks; no card follows');
    assert.equal(afterTalk(true, cards.pending(has, () => false)), 'travel');
  });

  it('a card armed when the ship leaves stays behind at the quay it was armed on', () => {
    const flags = new Set([SCOPA, OTHER]);
    const has = (f: string) => flags.has(f);
    const cards = new ArmedCards(order);
    cards.setAside(OTHER, circolo);
    const left = cards.leaveBehind(has, () => false, mole);
    assert.deepEqual(left, [SCOPA], 'only the card not already set aside is left now');
    assert.equal(cards.pending(has, () => false), null, 'nothing follows into Oaxaca');
    assert.equal(cards.nearHere('oaxaca', 30, 28, has), null);
    assert.equal(cards.nearHere('sicily', 31, 28, has), SCOPA, 'back on the mole, it is still there');
  });

  it('its own villager forgives a set-aside card; a finished game is never offered', () => {
    const flags = new Set([OTHER]);
    const has = (f: string) => flags.has(f);
    const cards = new ArmedCards(order);
    cards.setAside(OTHER, circolo);
    cards.forgiveBy('alfio');
    assert.equal(cards.pending(has, () => false), OTHER);
    flags.delete(OTHER);
    cards.setAside(OTHER, circolo);
    assert.equal(cards.nearHere('sicily', 10, 10, has), null);
  });

  it('no line in the game both arms a card and takes a journey', () => {
    // Travel wins, so a node doing both would leave its own card behind.
    const starts = new Set(GAMES.map((g) => g.flag));
    const bad: string[] = [];
    const walk = (id: string, v: unknown) => {
      if (Array.isArray(v)) {
        const effects = v.filter((e): e is string => typeof e === 'string');
        if (effects.some((e) => e.startsWith('travel:')) && effects.some((e) => starts.has(e.replace(/^set:/, '')))) bad.push(id);
        for (const x of v) walk(id, x);
      } else if (v && typeof v === 'object') {
        for (const x of Object.values(v)) walk(id, x);
      }
    };
    for (const [id, node] of Object.entries(NODES)) walk(id, node);
    assert.deepEqual(bad, []);
  });
});
