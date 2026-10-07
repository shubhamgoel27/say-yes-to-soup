/**
 * Audit: how every story run answers a masher, a random hand, an idle
 * hand, and an attentive one. Run with `npx tsx tests/mashaudit.ts [flag]`.
 */
import { ghost, play, seedRandom } from './panelrig';
import { BOTS, STORY_BOTS } from './bots';

type Any = any; // eslint-disable-line @typescript-eslint/no-explicit-any
const { GAMES } = await import('../src/content/world');
const { RUN } = await import('../src/ui/games/run');

const DIRS = ['up', 'down', 'left', 'right'] as const;
const mash = (n: number) => {
  let f = 0;
  return (p: Any) => {
    if (f++ % n === 0) p.onAction();
  };
};
const mashArrows = (n: number) => {
  let f = 0;
  return (p: Any) => {
    if (f++ % n === 0) {
      if (Math.random() < 0.5) p.onAction();
      else p.onDir(DIRS[Math.floor(Math.random() * 4)]);
    }
  };
};
const STORY = STORY_BOTS;
const only = process.argv[2];
const verbose = process.argv.includes('-v');
for (const g of GAMES) {
  if (only && !g.flag.includes(only)) continue;
  const res: string[] = [];
  const bots: [string, () => Any][] = [
    ['mash10/s', () => mash(6)],
    ['mash6/s', () => mash(10)],
    ['rand8/s', () => mashArrows(8)],
    [
      'attn+mash',
      () => {
        const a = (STORY[g.flag] ?? BOTS[g.flag] ?? (() => () => {}))();
        const m = mash(6);
        return (p: Any, t: number) => {
          a(p, t);
          m(p);
        };
      },
    ],
    ['attn', STORY[g.flag] ?? BOTS[g.flag] ?? (() => () => {})],
  ];
  for (const [name, mk] of bots) {
    const undo = seedRandom(42);
    try {
      RUN.hard = false;
      const flags = new Set<string>();
      const p = g.make(ghost(), ghost(), () => flags) as Any;
      const inner = mk();
      let said = '';
      const r = play(p, (pp: Any, t: number) => {
        said = String(pp.hint ?? '');
        inner(pp, t);
      }, 300);
      const tag = said.replace(/<[^>]+>/g, '').slice(0, verbose ? 90 : 0);
      res.push(`${name}=${r.done ? r.seconds.toFixed(0) + 's' : 'NO'}${tag ? ' [' + tag + ']' : ''}`);
    } catch (e) {
      res.push(`${name}=ERR(${(e as Error).message.slice(0, 40)})`);
    } finally {
      undo();
    }
  }
  console.log(`${g.flag.padEnd(18)} ${res.join(verbose ? '\n    ' : '  ')}`);
}
