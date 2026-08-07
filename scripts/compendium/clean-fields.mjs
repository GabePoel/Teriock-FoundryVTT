import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const DEFAULTS_PATH = path.join(path.dirname(fileURLToPath(import.meta.url)), "defaults.json");

/**
 * Produced automatically by Export Default Values macro. That must be run before data can be exported.
 * @type {{ documents: Record<string, object>, pseudos: Record<string, Record<string, object>> }}
 */
let DEFAULTS = { documents: {}, pseudos: {} };

/**
 * Load the generated default `_source` data.
 * @returns {Promise<void>}
 */
export async function loadDefaults() {
  const rerun = "Run the Export Default Values macro before running.";
  try {
    DEFAULTS = JSON.parse(await fs.readFile(DEFAULTS_PATH, "utf8"));
  } catch (err) {
    throw new Error(`Messed up ${DEFAULTS_PATH}. ${rerun}`, { cause: err });
  }
}

/** Keys to not delete during cleaning. */
const PROTECTED = new Set(["_id", "_key", "_stats", "name", "type"]);

/**
 * Clean a Document.
 * @param {AnyCommonDocument} doc
 */
export function cleanDocument(doc) {
  delete doc.author;
  delete doc.ownership;
  if (doc.type) { delete doc.sort; }
  if (["damage", "drain", "tradecraft"].includes(doc.type)) { delete doc.flags; }
  if (doc._stats) {
    delete doc._stats.createdTime;
    delete doc._stats.duplicateSource;
    delete doc._stats.exportSource;
    delete doc._stats.modifiedTime;
    delete doc._stats.ownership;
  }
  if (doc.flags) {
    for (const k of Object.keys(doc.flags)) {
      if (k !== "teriock") { delete doc.flags[k]; }
    }
  }
  if (doc.system) {
    if (doc.name !== "Basic Abilities") { delete doc.system.settings; }
    delete doc.system._ref;
    delete doc.system.disabled;
    delete doc.system.forceSuppressed;
    cleanCommon(doc);
    cleanActiveEffect(doc);
    stripPseudoDefaults(doc);
    if (doc.type === "ability") { cleanAbility(doc); }
    if (["body", "equipment"].includes(doc.type)) { cleanArmament(doc); }
    if (["character", "creature"].includes(doc.type)) { cleanActor(doc); }
  }
  if (doc.text?.content && doc.type === "class") { doc.text.content = doc.text.content.replaceAll("\n", ""); }
  stripDefaults(doc, documentDefaults(doc));
  pruneEmpty(doc);
}

const COLLECTION_RECORD = {
  actors: "Actor",
  effects: "ActiveEffect",
  items: "Item",
  pages: "JournalEntryPage",
  results: "TableResult",
  tables: "RollTable",
};

/**
 * Default document `_source` data.
 * @param {AnyCommonDocument} doc
 * @returns {object|undefined}
 */
function documentDefaults(doc) {
  const collection = doc._key?.split("!").at(-2)?.split(".").at(-1) ?? "";
  const byType = DEFAULTS.documents[COLLECTION_RECORD[collection]];
  return byType && (byType[doc.type] ?? byType.base);
}

/**
 * Strip default data from PseudoDocuments.
 * @param {AnyCommonDocument} doc
 */
function stripPseudoDefaults(doc) {
  for (const [collection, types] of Object.entries(DEFAULTS.pseudos)) {
    const stored = doc.system[collection];
    if (!stored || typeof stored !== "object") { continue; }
    for (const mechanic of Object.values(stored)) { stripDefaults(mechanic, types[mechanic?.type]); }
  }
}

/**
 * @param {AnyCommonDocument} doc
 */
function cleanCommon(doc) {
  if (doc.system.consumable === false) {
    delete doc.system.quantity;
    delete doc.system.consumptionAmount;
  }
  if (Array.isArray(doc.system.effectTypes) && Array.isArray(doc.system.powerSources)) {
    doc.system.effectTypes = doc.system.effectTypes.filter(t => !doc.system.powerSources.includes(t));
  }
}

/**
 * @param {TeriockActiveEffect} doc
 */
function cleanActiveEffect(doc) {
  if (["ability", "attunement", "fluency", "property", "resource"].includes(doc.type)) {
    delete doc.duration;
    delete doc.start;
  }
  if (["ability", "property"].includes(doc.type) || doc.transfer === true) { delete doc.transfer; }
  if (doc.system.transformation?.enabled === false) { delete doc.system.transformation; }
}

/**
 * Strip stuff that we don't want in the compendiums.
 * @param {TeriockActor} doc
 */
function cleanActor(doc) {
  if (doc.prototypeToken) {
    delete doc.prototypeToken.alpha;
    delete doc.prototypeToken.depth;
    delete doc.prototypeToken.disposition;
    delete doc.prototypeToken.light;
    delete doc.prototypeToken.lockRotation;
    delete doc.prototypeToken.occludable;
    delete doc.prototypeToken.prependAdjective;
    delete doc.prototypeToken.randomImg;
    delete doc.prototypeToken.rotation;
    delete doc.prototypeToken.sight;
    if (doc.prototypeToken.ring) {
      delete doc.prototypeToken.ring.colors;
      delete doc.prototypeToken.ring.effects;
      if (doc.prototypeToken.ring.subject) { delete doc.prototypeToken.ring.subject.scale; }
    }
    if (doc.prototypeToken.texture) {
      delete doc.prototypeToken.texture.alphaThreshold;
      delete doc.prototypeToken.texture.anchorX;
      delete doc.prototypeToken.texture.anchorY;
      delete doc.prototypeToken.texture.fit;
      delete doc.prototypeToken.texture.scaleX;
      delete doc.prototypeToken.texture.scaleY;
      delete doc.prototypeToken.texture.tint;
    }
  }
  if (doc.system.combat) {
    delete doc.system.combat.attackPenalty;
    delete doc.system.combat.hasReaction;
  }
  for (const stat of ["hp", "mp", "presence"]) {
    if (!doc.system[stat]) { continue; }
    delete doc.system[stat].max;
    delete doc.system[stat].min;
    delete doc.system[stat].morganti;
    delete doc.system[stat].temp;
  }
  delete doc.system.detection;
  delete doc.system.initiative;
  delete doc.system.lp;
  delete doc.system.weight;
  delete doc.system.attributes;
  delete doc.system.deathBag;
  delete doc.system.interestRate;
  delete doc.system.money;
  delete doc.system.offense;
  delete doc.system.senses;
  delete doc.system.speedAdjustments;
  delete doc.system.tradecrafts;
  if (doc.system.scaling) { delete doc.system.scaling.lvl; }
}

/**
 * @param {TeriockArmament} doc
 */
function cleanArmament(doc) {
  if (doc.system.range?.long?.unit && doc.system.range?.short?.unit) { delete doc.system.range.short.unit; }
}

/**
 * @param {TeriockAbility} doc
 */
function cleanAbility(doc) {
  // Clean Usage
  if (doc.system.interaction !== "feat") { delete doc.system.featSaveAttribute; }
  if (doc.system.interaction !== "attack") { delete doc.system.piercing; }
  if (!doc.system.expansion?.type) { delete doc.system.expansion; }
  if (doc.system.executionTime) {
    if (typeof doc.system.executionTime === "string") {
      doc.system.executionTime = { base: doc.system.executionTime };
    }
    if (doc.system.maneuver !== "slow") { delete doc.system.executionTime.slow; }
    if (doc.system.maneuver === "passive") { doc.system.executionTime.base = "passive"; }
  }

  // Clean Upgrades
  if (doc.system.upgrades) {
    if (!doc.system.upgrades.competence?.attribute) { delete doc.system.upgrades.competence; }
    if (!doc.system.upgrades.score?.attribute) { delete doc.system.upgrades.score; }
  }
}

/**
 * Check whether two values are equal.
 * @param {*} a
 * @param {*} b
 * @returns {boolean}
 */
function checkEquality(a, b) {
  if (a === b) { return true; }
  if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) { return false; }
  const sorted = (arr) => arr.map(v => JSON.stringify(v)).sort();
  const [sa, sb] = [sorted(a), sorted(b)];
  return sa.every((v, i) => v === sb[i]);
}

/**
 * Recursively delete every value that already equals its default value.
 * @param {object} obj
 * @param {object} [defaults]
 */
function stripDefaults(obj, defaults) {
  if (!obj || !defaults || typeof obj !== "object" || typeof defaults !== "object") { return; }
  for (const [key, value] of Object.entries(obj)) {
    if (PROTECTED.has(key) || !(key in defaults)) { continue; }
    const def = defaults[key];
    const bothPlain = value && typeof value === "object" && !Array.isArray(value)
      && def && typeof def === "object" && !Array.isArray(def);
    if (bothPlain) {
      stripDefaults(value, def);
      if (Object.keys(value).length === 0) { delete obj[key]; }
    } else if (checkEquality(value, def)) {
      delete obj[key];
    }
  }
}

/**
 * Recursively delete empty objects.
 * @param {object|Array} node
 */
function pruneEmpty(node) {
  if (Array.isArray(node)) {
    for (const v of node) { if (v && typeof v === "object") { pruneEmpty(v); } }
    return;
  }
  for (const [k, v] of Object.entries(node)) {
    if (!v || typeof v !== "object") { continue; }
    pruneEmpty(v);
    if (!Array.isArray(v) && Object.keys(v).length === 0) { delete node[k]; }
  }
}
