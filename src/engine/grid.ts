import type { Dir } from './input';
import { DIR_VEC } from './input';

/**
 * Maps are authored as arrays of ASCII rows plus a legend. That keeps them
 * hand-editable and diffable, which matters far more here than tooling would:
 * the bulk of this project's work is authoring content, not writing engine code.
 */

export type TileDef = {
  /** Semantic tile id the renderer knows how to draw. */
  t: string;
  /** Blocks movement. */
  solid?: boolean;
  /** Drawn above actors standing behind it, so you can walk behind trees and walls. */
  tall?: boolean;
};

export type TriggerDef =
  | { at: [number, number]; type: 'door'; to: string; spawn: [number, number]; facing?: Dir }
  | { at: [number, number]; type: 'script'; id: string; once?: boolean };

export type MapData = {
  id: string;
  name: string;
  legend: Record<string, TileDef>;
  ground: string[];
  /** Optional overlay drawn on top of ground. Space means "nothing here". */
  objects?: string[];
  spawn: [number, number];
  spawnFacing?: Dir;
  triggers?: TriggerDef[];
  /** Cells that emit cookfire smoke, usually a roof tile per lived-in house. */
  smoke?: [number, number][];
};

const EMPTY: TileDef = { t: 'void', solid: true };

export class TileMap {
  readonly id: string;
  readonly name: string;
  readonly w: number;
  readonly h: number;
  private readonly data: MapData;
  private readonly triggerIndex = new Map<string, TriggerDef>();

  constructor(data: MapData) {
    this.data = data;
    this.id = data.id;
    this.name = data.name;
    this.h = data.ground.length;
    this.w = Math.max(...data.ground.map((r) => r.length));

    for (const trig of data.triggers ?? []) {
      this.triggerIndex.set(key(trig.at[0], trig.at[1]), trig);
    }
  }

  get spawn(): [number, number] {
    return this.data.spawn;
  }
  get smoke(): [number, number][] {
    return this.data.smoke ?? [];
  }
  get spawnFacing(): Dir {
    return this.data.spawnFacing ?? 'down';
  }

  inBounds(x: number, y: number): boolean {
    return x >= 0 && y >= 0 && x < this.w && y < this.h;
  }

  /** Ground tile at a cell. Out of bounds reads as solid void. */
  ground(x: number, y: number): TileDef {
    if (!this.inBounds(x, y)) return EMPTY;
    return this.lookup(this.data.ground[y]?.[x]);
  }

  /** Runtime object edits: story events reshape the world (gates open). */
  private objectOverrides = new Map<string, TileDef | null>();

  /**
   * Bumped whenever the object layer actually changes, so anything worked
   * out once per map from its props (shadows, overhangs, where a body is
   * hidden) knows to work it out again. Dressings re-apply on every state
   * change; only a real difference counts.
   */
  objectsRev = 0;

  /** Replace (or clear, with null) the object at a cell at runtime. */
  setObject(x: number, y: number, def: TileDef | null) {
    if ((this.object(x, y)?.t ?? null) !== (def?.t ?? null)) this.objectsRev++;
    this.objectOverrides.set(key(x, y), def);
  }

  /** Runtime triggers, with whatever the map itself had at that cell. */
  private addedTriggers = new Map<string, TriggerDef | undefined>();

  /** Drop all runtime overrides (a fresh journey starts undressed): object
   * edits, and the triggers story events added (an opened gate's door). */
  clearOverrides() {
    if (this.objectOverrides.size > 0) this.objectsRev++;
    this.objectOverrides.clear();
    for (const [k, original] of this.addedTriggers) {
      if (original) this.triggerIndex.set(k, original);
      else this.triggerIndex.delete(k);
    }
    this.addedTriggers.clear();
  }

  /** Add or replace a trigger at runtime. */
  addTrigger(trig: TriggerDef) {
    const k = key(trig.at[0], trig.at[1]);
    if (!this.addedTriggers.has(k)) this.addedTriggers.set(k, this.triggerIndex.get(k));
    this.triggerIndex.set(k, trig);
  }

  /** Overlay tile at a cell, or null if the object layer is blank there. */
  object(x: number, y: number): TileDef | null {
    if (!this.inBounds(x, y)) return null;
    // Called per cell, many times a frame: build the key only when some
    // override could be there.
    if (this.objectOverrides.size > 0) {
      const k = key(x, y);
      if (this.objectOverrides.has(k)) return this.objectOverrides.get(k) ?? null;
    }
    const ch = this.data.objects?.[y]?.[x];
    if (!ch || ch === ' ') return null;
    return this.lookup(ch);
  }

  solid(x: number, y: number): boolean {
    if (!this.inBounds(x, y)) return true;
    return this.ground(x, y).solid === true || this.object(x, y)?.solid === true;
  }

  triggerAt(x: number, y: number): TriggerDef | undefined {
    return this.triggerIndex.get(key(x, y));
  }

  private lookup(ch: string | undefined): TileDef {
    if (!ch) return EMPTY;
    return this.data.legend[ch] ?? EMPTY;
  }
}

export function stepFrom(x: number, y: number, dir: Dir): [number, number] {
  const [dx, dy] = DIR_VEC[dir];
  return [x + dx, y + dy];
}

function key(x: number, y: number): string {
  return `${x},${y}`;
}
