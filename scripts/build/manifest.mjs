import fs from "fs";

import { icons } from "../../src/module/constants/display/icons.mjs";
import { default as manifest } from "../../system.json" with { type: "json" };
import { sortObject } from "../script-utils.mjs";

const DST = "system.json";

/**
 * Assign icons here so that we can ensure compendium pack icons are always synchronized with the icons currently in use
 * for document types.
 * @type {Record<string, string>}
 */
const PACK_ICONS = {
  abilities: icons.document.ability,
  bodyParts: icons.document.body,
  classes: icons.document.rank,
  creatures: icons.document.creature,
  equipment: icons.document.equipment,
  essentials: icons.packs.essentials,
  execution: icons.document.macro,
  magicItems: icons.packs.magicItems,
  maintenance: icons.packs.maintenance,
  maps: icons.tradecraft.cartographer,
  player: icons.packs.playerUtilities,
  powers: icons.document.power,
  properties: icons.document.property,
  rules: icons.ability.scroll,
  species: icons.document.species,
  stacks: icons.tradecraft.gambler,
  tables: icons.document.table,
  templateEffects: icons.packs.templateEffects,
};

manifest.packs.sort((a, b) => a.name.localeCompare(b.name));
for (const p of manifest.packs) {
  if (PACK_ICONS[p.name]) {
    p.flags = { teriock: { icon: PACK_ICONS[p.name] } };
  } else { delete p.flags; }
}

await fs.promises.writeFile(DST, JSON.stringify(sortObject(manifest), null, 2));
