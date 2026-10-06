import type { Look } from './character';

/**
 * What each villager actually wears, keyed by NPC id. The chapters' npcs.ts
 * files carry a colour sketch (skin, hair, a cloth, a trim); this is the
 * wardrobe on top of it, kept here so the art can change without touching
 * anyone's dialogue. Everyday working dress only: a fishmonger's rubber
 * apron, a ferry captain's cap, a grandmother's black wool. Nothing here is
 * festival costume, and nothing is worn for the camera.
 *
 * An entry is merged over the chapter's own look, so it only names what
 * changes. NPCs with no entry keep the look their chapter gave them.
 */

const CHASCA: Partial<Look> = { prop: 'camera' };
const RIOS: Partial<Look> = {
  garb: 'jacket',
  hatStyle: 'peaked',
  hat: '#f2efe6', // "a salt-white cap"
  cloth: '#2c3e57',
  stripe: '#c9a35f',
  pants: '#2c3e57',
  hairdo: 'bun',
};
const MANG_BEN: Partial<Look> = {
  garb: 'shirt',
  sleeves: 'short',
  apron: '#9fb3bf',
  pants: '#4a4038',
  build: 'stout',
  prop: 'towel', // "a towel over one shoulder like a sash of office"
};
const DIVAKARAN: Partial<Look> = {
  garb: 'mundu',
  cloth: '#ece4d2',
  skirt: '#f2ead8',
  stripe: '#c8a55b',
  glasses: true,
};
const REFUGIO: Partial<Look> = {
  garb: 'huipil',
  cloth: '#ece2cc',
  stripe: '#a02335',
  apron: '#3f7fb0',
  hairdo: 'braids',
};

export const LOOKS: Record<string, Partial<Look>> = {
  // ---- Ch'aska Pampa: already home in its own dress; only bodies differ.
  aurelio: { build: 'stooped', prop: 'cane' },
  rosa: { apron: '#e8dcc4', prop: 'ladle' },
  carmen: { build: 'stooped' },
  teofilo: { build: 'stout' },
  faustino: { build: 'tall' },
  faustinoC: { build: 'tall' },
  justina: { build: 'short' },
  chasca: CHASCA,
  chascaC: CHASCA,
  chascaC3: CHASCA,
  chascaC4: CHASCA,
  chascaC5: CHASCA,
  chascaC6: CHASCA,
  chascaC7: CHASCA,
  chascaC8: CHASCA,
  chascaC9: CHASCA,
  chascaC11: CHASCA,

  // ---- La Caleta: the Peruvian coast, cotton and salt.
  marisol: { garb: 'dress', apron: '#ece8de', hairdo: 'bun' },
  simon: { garb: 'sweater', pants: '#3d3a36', hatStyle: 'beanie', hat: '#3d4a52', build: 'stooped' },
  nilda: { garb: 'dress', hairdo: 'bun' },
  rafa: { garb: 'shirt', sleeves: 'short', pants: '#3e5a77', build: 'tall' },
  felix: { garb: 'shirt', pants: '#5c5148', hatStyle: 'straw', hat: '#d8c08a', stripe: '#5c6e77' },
  petro: { garb: 'dress', apron: '#ece8de', build: 'stout', prop: 'ladle', hairdo: 'bun' },
  wili: { garb: 'shirt', cloth: '#ece8de', apron: '#4d7440', pants: '#3d3a36', hatStyle: 'coppola', hat: '#e8e4da' },
  rios: RIOS,
  riosC3: RIOS,
  riosC7: RIOS,

  // ---- The Crossing: a working ship.
  mangben: MANG_BEN,
  mangbenC8: MANG_BEN,
  joseph: { garb: 'coveralls', cloth: '#d9694a', stripe: '#f2e6d0' },
  hanaC3: { garb: 'coveralls', cloth: '#2c3e57', stripe: '#e8dcc4', hairdo: 'bun' },
  olena: { garb: 'coveralls', cloth: '#4a6a7a', stripe: '#e8dcc4', hairdo: 'bun' },
  bosun: { garb: 'sweater', cloth: '#2c4a6a', pants: '#3d3a36', hatStyle: 'beanie', hat: '#8a3a2e', beard: 'full', build: 'stout' },

  // ---- Shionoura: a Seto Inland Sea harbour town.
  hana: { garb: 'shirt', cloth: '#ece8de', pants: '#2c3e57' },
  fumi: { garb: 'dress', cloth: '#3a4e7a', skirt: '#3a4e7a', apron: '#f2efe6', hairdo: 'bun', build: 'short' },
  daisuke: { garb: 'shirt', sleeves: 'short', apron: '#2e4a44', pants: '#3d3a36', hatStyle: 'headband', hat: '#f2efe6' },
  sachiko: { garb: 'dress', apron: '#f2efe6', hatStyle: 'kerchief', hat: '#f2efe6', stripe: '#c9a35f' },
  genji: { garb: 'wrap', cloth: '#4a5560', stripe: '#38404a', pants: '#4a5560', build: 'stooped', prop: 'broom' },
  taro: { garb: 'shirt', sleeves: 'short', pants: '#2c3e57' },
  isao: { garb: 'jacket', hatStyle: 'peaked', hat: '#2c3e57', stripe: '#c9a35f', pants: '#2c3e57' },
  olenaC4: { garb: 'shirt', cloth: '#7a8a6a', pants: '#3d4a5c', hairdo: 'bun' },

  // ---- Busan: Jagalchi lanes, rubber aprons and visors.
  sunhee: { garb: 'shirt', pants: '#5a4a7a', apron: '#2e4a44', hatStyle: 'visor', hat: '#d9694a' },
  cho: { garb: 'wrap', cloth: '#d8d2c0', stripe: '#7a8a96', pants: '#c8c0ae', glasses: true, build: 'stooped' },
  mija: { garb: 'shirt', pants: '#54455c', apron: '#e8dcc4', hatStyle: 'kerchief', hat: '#d9694a', stripe: '#f2e6d0' },
  daeho: { garb: 'shirt', pants: '#3d3a36', apron: '#e8dcc4', hatStyle: 'coppola', hat: '#5c4630' },
  byeongok: { garb: 'shirt', pants: '#3c4a5c', apron: '#e8e4da', hatStyle: 'kerchief', hat: '#f2efe6', build: 'stout', prop: 'ladle' },
  bak: { garb: 'shirt', sleeves: 'short', pants: '#3d3a36', hatStyle: 'beanie', hat: '#2c3e57' },
  gong: { garb: 'jacket', hatStyle: 'none', glasses: true, pants: '#2c3e57' },
  hanaC5: { garb: 'shirt', cloth: '#ece8de', pants: '#2c3e57' },

  // ---- Kerala: mundu, saree, chatta and kavani.
  mariamma: { garb: 'mundu', cloth: '#f2ead8', skirt: '#f2ead8', shawl: '#ece2cc', stripe: '#c8a55b', hairdo: 'bun', build: 'short' },
  josephC6: { garb: 'shirt', pants: '#3d3a36' },
  shaji: { garb: 'mundu', skirt: '#f2ead8', stripe: '#c8a55b', beard: 'moustache', build: 'stout' },
  kuttan: { garb: 'mundu', cloth: '#e8e0cc', sleeves: 'short', skirt: '#4a6a4a', stripe: '#c8a55b', hatStyle: 'headband', hat: '#e8e0cc', beard: 'moustache', build: 'tall' },
  omana: { garb: 'saree', skirt: '#b8862e', stripe: '#7d3f34', hairdo: 'bun' },
  librarian: DIVAKARAN,
  librarianC11: DIVAKARAN,
  varkey: { garb: 'mundu', skirt: '#f2ead8', stripe: '#c8a55b', beard: 'moustache', build: 'stout' },
  moosa: { garb: 'mundu', cloth: '#f2ead8', skirt: '#f2ead8', stripe: '#c8a55b', hatStyle: 'kufi', hat: '#f6f0e2', beard: 'full' },
  appu: { garb: 'shirt', sleeves: 'short', pants: '#2c3e57' },

  // ---- Delhi: kurta, salwar kameez, dupatta, dastar.
  bantu: { garb: 'shirt', pants: '#5c5148', prop: 'towel' },
  kamla: { garb: 'salwar', pants: '#e8d9a8', hatStyle: 'dupatta', hat: '#e8b84a', stripe: '#8a3428', build: 'stout', hairdo: 'bun' },
  joginder: { garb: 'kurta', cloth: '#ece4d2', stripe: '#c8a55b', pants: '#ece4d2', hatStyle: 'turban', hat: '#e8952c', beard: 'full', build: 'stout' },
  yusuf: { garb: 'kurta', cloth: '#ece4d2', pants: '#ece4d2', stripe: '#8c8479', hatStyle: 'kufi', hat: '#f6f0e2', beard: 'full', build: 'tall' },
  mehr: { garb: 'salwar', pants: '#2c443c', hatStyle: 'dupatta', hat: '#c8a55b', stripe: '#2c443c', glasses: true, hairdo: 'bun' },
  sethji: { garb: 'kurta', cloth: '#f2ead8', pants: '#f2ead8', glasses: true, build: 'stout' },
  sushila: { garb: 'saree', cloth: '#ece4d2', skirt: '#f2ece0', stripe: '#c8b89a', glasses: true, hairdo: 'bun' },
  akhtar: { garb: 'kurta', cloth: '#8a5a3a', pants: '#e8d9a8', stripe: '#e8d9a8', beard: 'moustache', prop: 'towel' },

  // ---- Zanzibar: kanzu and kofia, kanga and headscarf.
  rashid: { garb: 'kanzu', stripe: '#b88a4a', hatStyle: 'kofia', hat: '#f6f0e2', beard: 'full', prop: 'cane' },
  amina: { garb: 'kanga', cloth: '#c1512f', stripe: '#f2c14e', hatStyle: 'headscarf', hat: '#3f7fb0' },
  juma: { garb: 'mundu', sleeves: 'short', skirt: '#8a5330', stripe: '#c9a35f', hatStyle: 'straw', hat: '#d8c08a' },
  zuberi: { garb: 'shirt', sleeves: 'short', pants: '#3d3a36', apron: '#f2efe6', hatStyle: 'kofia', hat: '#f6f0e2', stripe: '#8a4a2e' },
  salma: { garb: 'kanga', cloth: '#3c6e64', stripe: '#f2c14e', hatStyle: 'kanga', hat: '#8a4a7d' },
  issa: { garb: 'mundu', sleeves: 'short', skirt: '#7a3a2e', stripe: '#d0b276', beard: 'moustache' },
  bakari: { garb: 'kanzu', cloth: '#f2ead8', stripe: '#2c3e57', hatStyle: 'kofia', hat: '#f6f0e2', glasses: true, build: 'stout' },
  ali: { garb: 'shirt', pants: '#5c5148', stripe: '#5c6e77', hatStyle: 'kofia', hat: '#f6f0e2', glasses: true },

  // ---- Sicily: black wool, flat caps, aprons at the fish stalls.
  concetta: { garb: 'dress', cloth: '#24252c', skirt: '#24252c', shawl: '#34353e', stripe: '#4a4b55', hairdo: 'bun', build: 'stooped' },
  turi: { garb: 'shirt', sleeves: 'short', apron: '#e8e4da', pants: '#3d3a36', hatStyle: 'coppola', hat: '#5c5148', beard: 'moustache', build: 'stout' },
  alfio: { garb: 'shirt', apron: '#2b2b33', pants: '#2b2b33', beard: 'moustache' },
  c8elders: { garb: 'jacket', pants: '#3d3a36', hatStyle: 'coppola', hat: '#4a4038', beard: 'moustache', build: 'stooped' },
  mimmo: { garb: 'jacket', pants: '#3d3a36', hatStyle: 'coppola', hat: '#5c5148', glasses: true },
  donsaro: { garb: 'cassock', cloth: '#26262e', build: 'stout' },
  nino: { garb: 'shirt', sleeves: 'short', pants: '#3e5a77' },
  rosaria: { garb: 'dress', hatStyle: 'straw', hat: '#d0b276', stripe: '#7d3f34', hairdo: 'bun' },
  patane: { garb: 'jacket', cloth: '#e2dccc', pants: '#8ba3b5', stripe: '#8a7a5a', hatStyle: 'straw', hat: '#e8dcc4', glasses: true, beard: 'moustache' },

  // ---- Oaxaca: huipil and enredo, rebozo, sombrero.
  refugio: REFUGIO,
  refugioVigil: { ...REFUGIO, shawl: '#4a3a4e' },
  elias: { garb: 'shirt', cloth: '#ece2cc', pants: '#ece2cc', beard: 'moustache' },
  chela: { garb: 'huipil', stripe: '#c98a2e', apron: '#c1512f', shawl: '#5c4a6e', hairdo: 'braids', build: 'stooped' },
  eugenia: { garb: 'dress', apron: '#7aa0c8', hairdo: 'braids' },
  tacho: { garb: 'shirt', apron: '#f2efe6', pants: '#3d3a36', beard: 'moustache', build: 'stout' },
  silvino: { garb: 'shirt', pants: '#3d3a36', hatStyle: 'straw', hat: '#d8c08a', stripe: '#c94f7c' },
  meliton: { garb: 'shirt', pants: '#4a4038', hatStyle: 'sombrero', hat: '#d0b276', stripe: '#5c4630', build: 'stooped', prop: 'broom' },
  epifania: { garb: 'dress', skirt: '#2f3a52', hatStyle: 'rebozo', hat: '#2f3a52', build: 'stooped' },
  bernardo: { garb: 'shirt', pants: '#3d3a36', hatStyle: 'sombrero', hat: '#d0b276', stripe: '#3a4668', beard: 'moustache' },
  luz: { garb: 'huipil', stripe: '#f2c14e', apron: '#3f7fb0', hatStyle: 'rebozo', hat: '#3a4668', hairdo: 'braids' },
  serafin: { garb: 'shirt', pants: '#3d3a36', hatStyle: 'straw', hat: '#d8c08a', beard: 'moustache', build: 'stooped' },
  nico: { garb: 'shirt', sleeves: 'short', pants: '#3d3a36' },
  chuy: { garb: 'shirt', sleeves: 'short', pants: '#3d3a36' },

  // ---- The Return.
  traveler: { garb: 'shirt', pants: '#5c5148' },
};

/** A villager's look with its wardrobe applied. */
export function lookFor(id: string, base: Look): Look {
  const o = LOOKS[id];
  return o ? { ...base, ...o } : base;
}
