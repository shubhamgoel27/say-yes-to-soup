import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

/**
 * roundRect, filled in where the browser lacks it (Safari 15, Firefox <112):
 * the art drew with it at module top level and the game never left the
 * loader there. The fill must trace the same outline the native call does.
 */
class FakePath {
  ops: string[] = [];
  moveTo(x: number, y: number) { this.ops.push(`M${x},${y}`); }
  lineTo(x: number, y: number) { this.ops.push(`L${x},${y}`); }
  arcTo(x1: number, y1: number, x2: number, y2: number, r: number) { this.ops.push(`A${x1},${y1},${x2},${y2},${r}`); }
  closePath() { this.ops.push('Z'); }
}
(globalThis as Record<string, unknown>).CanvasRenderingContext2D = FakePath;
await import('../src/engine/polyfills');

type Rounded = FakePath & { roundRect(x: number, y: number, w: number, h: number, r?: number | number[]): void };

describe('roundRect where the browser has none', () => {
  it('is installed on a context that lacks it', () => {
    assert.equal(typeof (FakePath.prototype as unknown as Rounded).roundRect, 'function');
  });

  it('traces four corners of the given radius and closes', () => {
    const p = new FakePath() as Rounded;
    p.roundRect(0, 0, 20, 10, 3);
    assert.deepEqual(p.ops, ['M3,0', 'L17,0', 'A20,0,20,3,3', 'L20,7', 'A20,10,17,10,3', 'L3,10', 'A0,10,0,7,3', 'L0,3', 'A0,0,3,0,3', 'Z']);
  });

  it('shrinks radii that would cross, and reads lists as the spec does', () => {
    const p = new FakePath() as Rounded;
    p.roundRect(0, 0, 10, 10, 20);
    assert.equal(p.ops[0], 'M5,0');
    const q = new FakePath() as Rounded;
    q.roundRect(0, 0, 20, 20, [2, 4]);
    assert.deepEqual(q.ops.filter((o) => o.startsWith('A')).map((o) => o.split(',').pop()), ['4', '2', '4', '2']);
  });
});
