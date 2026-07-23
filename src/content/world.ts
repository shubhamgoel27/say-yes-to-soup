import type { MapData } from '../engine/grid';
import type { ErrandDef, ExamineArm, JournalEntry, NodeMap, NpcDef, RecallManifest } from './schema';
import type { TaskDef } from '../ui/journal';

import {
  DIG_SPOTS as DEV_DIG_SPOTS,
  EVENT_NODES as DEV_EVENTS,
  EXAMINES as DEV_EXAMINES,
  NODES as DEV_NODES,
  NPCS as DEV_NPCS,
} from './dev/npcs';
import { ERRANDS as DEV_ERRANDS, JOURNAL as DEV_JOURNAL, TASKS as DEV_TASKS } from './dev/journal';
import { REGION_MAPS as DEV_MAPS } from './dev/region';
import { RECALL as DEV_RECALL } from './dev/recall';

import { CALETA_EVENTS, CALETA_EXAMINES, CALETA_NODES, CALETA_NPCS } from './caleta/npcs';
import { CALETA_JOURNAL, CALETA_TASKS } from './caleta/journal';
import { LA_CALETA_MAP, PICANTERIA_MAP } from './caleta/map';
import { RECALL as CALETA_RECALL } from './caleta/recall';

/**
 * The whole world, one chapter folder at a time. Chapters stay self-contained;
 * this is the only place that knows there is more than one of them.
 */

export const NODES: NodeMap = { ...DEV_NODES, ...CALETA_NODES };

export const NPCS: NpcDef[] = [...DEV_NPCS, ...CALETA_NPCS];

/** Map-tagged arms come first so a chapter's props speak its own words. */
export const EXAMINES: Record<string, ExamineArm[]> = (() => {
  const merged: Record<string, ExamineArm[]> = {};
  for (const [kind, arms] of Object.entries(CALETA_EXAMINES)) merged[kind] = [...arms];
  for (const [kind, arms] of Object.entries(DEV_EXAMINES)) {
    merged[kind] = [...(merged[kind] ?? []), ...arms];
  }
  return merged;
})();

export const EVENT_NODES = [...DEV_EVENTS, ...CALETA_EVENTS];
export const DIG_SPOTS = DEV_DIG_SPOTS;

export const JOURNAL: JournalEntry[] = [...DEV_JOURNAL, ...CALETA_JOURNAL];
export const JOURNAL_BY_ID = new Map(JOURNAL.map((e) => [e.id, e]));

/** Coastal threads first: they are the more specific once you are there. */
export const TASKS: TaskDef[] = [...CALETA_TASKS, ...DEV_TASKS];

export const ERRANDS: ErrandDef[] = [
  ...DEV_ERRANDS,
  { id: 'petro-lisa', label: "Doña Petro's lisa, held at Marisol's stall" },
];
export const ERRAND_BY_ID = new Map(ERRANDS.map((e) => [e.id, e]));

export const REGION_MAPS: Record<string, MapData> = {
  ...DEV_MAPS,
  [LA_CALETA_MAP.id]: LA_CALETA_MAP,
  [PICANTERIA_MAP.id]: PICANTERIA_MAP,
};

/** Chapter manifests in play order; tests hold the ledger honest. */
export const RECALLS: { chapter: string; recall: RecallManifest }[] = [
  { chapter: 'chaska-pampa', recall: DEV_RECALL },
  { chapter: 'la-caleta', recall: CALETA_RECALL },
];
