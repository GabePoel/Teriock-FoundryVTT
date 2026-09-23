import { toKebabCase } from "../../../helpers/string.mjs";

/**
 * Status ids renamed to match their identifiers.
 * @type {Record<string, string>}
 */
const RENAMED_STATUSES = {
  armHack1: "arm-hack-1",
  armHack2: "arm-hack-2",
  bodyHack: "body-hack",
  criticallyWounded: "critically-wounded",
  defyingDeath: "defying-death",
  earHack: "ear-hack",
  eyeHack: "eye-hack",
  fullCover: "full-cover",
  halfCover: "half-cover",
  legHack1: "leg-hack-1",
  legHack2: "leg-hack-2",
  meleeDodging: "melee-dodging",
  missileDodging: "missile-dodging",
  mouthHack: "mouth-hack",
  noseHack: "nose-hack",
  threeQuartersCover: "three-quarters-cover",
};

/**
 * Thumbnail paths renamed to match their types.
 * @type {Record<string, string>}
 */
const RENAMED_THUMBNAIL_FOLDERS = {
  abilities: "ability",
  archetypes: "archetype",
  attributes: "attribute",
  "body-parts": "body",
  classes: "class",
  conditions: "condition",
  consumables: "consumable",
  "core-rules": "core",
  creatures: "creature",
  "damage-types": "damage",
  "death-bag-stones": "stone",
  documents: "document",
  "drain-types": "drain",
  "effect-types": "effect",
  elements: "element",
  hacks: "hack",
  keywords: "keyword",
  powers: "power",
  properties: "property",
  ranks: "rank",
  tokens: "token",
  tradecrafts: "tradecraft",
};

/**
 * Migrate iterable values to kebab-case.
 * @param {object} source
 * @param {...string} fields
 */
export function migrateIterables(source, ...fields) {
  for (const field of fields) {
    const values = foundry.utils.getProperty(source, field);
    if (Array.isArray(values)) { foundry.utils.setProperty(source, field, values.map((v) => toKebabCase(v))); }
  }
}

/**
 * Migrate renamed status ids.
 * @param {object} source
 * @param {...string} fields
 */
export function migrateStatuses(source, ...fields) {
  for (const field of fields) {
    const value = foundry.utils.getProperty(source, field);
    if (Array.isArray(value)) { foundry.utils.setProperty(source, field, value.map((v) => RENAMED_STATUSES[v] ?? v)); }
    else if (typeof value === "string") { foundry.utils.setProperty(source, field, RENAMED_STATUSES[value] ?? value); }
  }
}

/**
 * Migrate relocated thumbnail images.
 * @param {object} source
 * @param {...string} fields
 */
export function migrateThumbnails(source, ...fields) {
  for (const field of fields) {
    let value = foundry.utils.getProperty(source, field);
    if (typeof value === "string" && value.startsWith("systems/teriock/src/icons/")) {
      value = value.replace("systems/teriock/src/icons/", "");
      const parts = value.split("/");
      if (parts.length && RENAMED_THUMBNAIL_FOLDERS[parts[0]]) { parts[0] = RENAMED_THUMBNAIL_FOLDERS[parts[0]]; }
      value = `systems/teriock/src/assets/thumbnails/${parts.join("/")}`;
      foundry.utils.setProperty(source, field, value);
    }
  }
}
