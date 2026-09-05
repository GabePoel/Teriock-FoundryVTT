import fs from "fs";

import { default as icons } from "../../src/module/constants/display/icons/_module.mjs";
import { default as manifest } from "../../system.json" with { type: "json" };
import { sortObject } from "../script-utils.mjs";

const DST = "system.json";

/**
 * Assign icons here so that we can ensure compendium pack icons are always synchronized with the icons currently in use
 * for document types.
 * @type {Record<string, string>}
 */
const PACK_ICONS = {
  abilities: icons.manifest.document.ability,
  bodyParts: icons.manifest.document.body,
  classes: icons.manifest.document.rank,
  creatures: icons.manifest.document.creature,
  equipment: icons.manifest.document.equipment,
  essentials: icons.manifest.packs.essentials,
  execution: icons.manifest.document.macro,
  magicItems: icons.manifest.packs.magicItems,
  maintenance: icons.manifest.packs.maintenance,
  maps: icons.manifest.tradecraft.cartographer,
  player: icons.manifest.packs.playerUtilities,
  powers: icons.manifest.document.power,
  properties: icons.manifest.document.property,
  rules: icons.manifest.ability.scroll,
  species: icons.manifest.document.species,
  stacks: icons.manifest.tradecraft.gambler,
  tables: icons.manifest.document.table,
  templateEffects: icons.manifest.packs.templateEffects,
};

manifest.packs.sort((a, b) => a.name.localeCompare(b.name));
for (const p of manifest.packs) {
  if (PACK_ICONS[p.name]) {
    p.flags = { teriock: { icon: PACK_ICONS[p.name] } };
  } else { delete p.flags; }
}

await fs.promises.writeFile(DST, JSON.stringify(sortObject(manifest), null, 2));
