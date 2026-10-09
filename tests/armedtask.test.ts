import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { GameState } from '../src/engine/state';
import { GAMES, NPCS, TASKS } from '../src/content/world';
import { ARMED_TASKS, GAME_HOSTS, openTasks, threadWho } from '../src/content/guide';

/**
 * A game armed and set aside ("Not yet", "Step away", a journey) waits with
 * whoever offered it. The chip and the thread must lead back there, first,
 * even when that person has nothing new to say: g1 038 had Carmen's loom
 * waiting while the chip sent the player to the chicheria.
 */
describe('an armed game is the first thread', () => {
  it('every game raised in conversation has its host', () => {
    // The kingyo scoop is raised by the stall itself (an examine), not a person.
    const hostless = GAMES.map((g) => g.flag).filter((f) => !GAME_HOSTS.has(f));
    assert.deepEqual(hostless, ['c4.kingyo.start']);
    assert.equal(GAME_HOSTS.get('weave.start'), 'carmen');
  });

  for (const t of ARMED_TASKS) {
    const flag = t.when.has![0]!;
    it(`${flag}: armed, the chip and the thread lead to ${t.who}`, () => {
      const s = new GameState();
      const host = NPCS.find((n) => n.id === t.who)!;
      for (const f of host.when?.has ?? []) s.set(f);
      s.set(flag);
      const open = openTasks(TASKS, s, host.map);
      assert.equal(open[0]?.text, t.text);
      assert.deepEqual(threadWho(open[0]!, s), [t.who]);
      // A replay's arm is not a task, and a played game is no longer one.
      s.set('replay.mode');
      assert.notEqual(openTasks(TASKS, s, host.map)[0]?.text, t.text);
      s.clearFlag('replay.mode');
      s.clearFlag(flag);
      assert.ok(!openTasks(TASKS, s, host.map).some((x) => x.armed));
    });
  }

  it('the loom waits ahead of the chicheria (g1 038)', () => {
    const s = new GameState();
    for (const f of ['intro.done', 'met.rosa', 'bundle.delivered', 'challar.done', 'keepsake.band', 'weave.start']) s.set(f);
    const first = openTasks(TASKS, s, 'village')[0];
    assert.equal(first?.who, 'carmen');
    assert.match(first!.text, /Carmen/);
  });
});
