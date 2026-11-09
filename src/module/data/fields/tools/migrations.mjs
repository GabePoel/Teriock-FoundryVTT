import { systemPath, toKebabCase } from "../../../utils/_module.mjs";

/**
 * Power kinds that became their own item types.
 * @type {Record<string, ItemType>}
 */
const POWER_KIND_TYPES = {
  backstory: "backstory",
  blessing: "blessing",
  curse: "curse",
  deathScar: "scar",
  familiar: "familiar",
  pact: "pact",
};

/**
 * Identifiers of powers that are now their own Item types.
 * @type {Record<string, string>}
 */
const POWER_IDENTIFIER_TYPES = { "created-elder-sorceries": "sorcery", "learned-elder-sorceries": "sorcery" };

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
 * Migrate equipment notes to description and description to appearance.
 * @param {object} source
 */
export function migrateEquipmentText(source) {
  const system = source.system;
  if (source.type !== "equipment" || !system || !("notes" in system) || "appearance" in system) { return; }
  system.appearance = system.description ?? "";
  system.description = system.notes;
  delete system.notes;
  if (system.identification?.identified === false) {
    const { flaws, kind, notes, price } = system.identification;
    Object.assign(system, { description: notes, flaws, kind, price: price ?? system.price });
  }
}

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
 * Migrate powers whose kinds or identifiers are now their own Item types.
 * @param {object} source
 */
export function migratePowerKinds(source) {
  if (source.type !== "power") { return; }
  if (["innate", "learned", "traits"].includes(source.system?.kind)) { source.system.kind = "normal"; }
  const type = POWER_KIND_TYPES[source.system?.kind] ?? POWER_IDENTIFIER_TYPES[source.system?.identifier];
  if (!type) { return; }
  source.type = type;
  source.system.kind = CONFIG.Item.dataModels[type].metadata.initialKind;
}

/**
 * Migrate a renamed field.
 * @param {object} source
 * @param {string} oldPath
 * @param {string} newPath
 */
export function migrateRename(source, oldPath, newPath) {
  if (foundry.utils.hasProperty(source, oldPath) && !foundry.utils.hasProperty(source, newPath)) {
    foundry.utils.setProperty(source, newPath, foundry.utils.getProperty(source, oldPath));
  }
  foundry.utils.deleteProperty(source, oldPath);
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
    if (typeof value !== "string") { continue; }
    if (value.startsWith(systemPath("icons/"))) {
      value = value.replace(systemPath("icons/"), "");
      const parts = value.split("/");
      if (parts.length && RENAMED_THUMBNAIL_FOLDERS[parts[0]]) { parts[0] = RENAMED_THUMBNAIL_FOLDERS[parts[0]]; }
      value = systemPath(`assets/thumbnails/${parts.join("/")}`);
    }
    if (value === systemPath("assets/thumbnails/document/character.svg")) {
      value = systemPath("assets/thumbnails/document/pc.svg");
    }
    foundry.utils.setProperty(source, field, value);
  }
}
