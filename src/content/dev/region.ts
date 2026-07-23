import type { MapData } from '../../engine/grid';
import { VILLAGE_MAP } from './testmap';
import { CASA_CARMEN_MAP, CHICHERIA_MAP } from './interiors';
import { EAST_ROAD_MAP } from './eastroad';
import { LA_BAJADA_MAP } from './labajada';

/** Every map in the Andes region, keyed by id for door transitions. */
export const REGION_MAPS: Record<string, MapData> = {
  [VILLAGE_MAP.id]: VILLAGE_MAP,
  [CHICHERIA_MAP.id]: CHICHERIA_MAP,
  [CASA_CARMEN_MAP.id]: CASA_CARMEN_MAP,
  [EAST_ROAD_MAP.id]: EAST_ROAD_MAP,
  [LA_BAJADA_MAP.id]: LA_BAJADA_MAP,
};
