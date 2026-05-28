import { extractPack } from "@foundryvtt/foundryvtt-cli";
import { promises as fs } from "fs";
import path from "path";

import { toKebabCase, toKebabCaseFull } from "../../src/module/helpers/string.mjs";
import { cleanDocument } from "./clean-fields.mjs";
import { BASIC_STATS, EXPAND_ADVENTURES, FOLDERS, YAML } from "./constants.mjs";

/**
 * @typedef {object} CompendiumNode
 * @property {string} name
 * @property {string|null} sup
 */

/** @type {Record<string, Record<string, CompendiumNode>>} */
const PACK_REGISTRY = {};

const state = { buildRegistry: true, pack: null };

/**
 * Register a document to the pack registry.
 * @param {string} pack
 * @param {object} doc
 */
function registerDocument(pack, doc) {
  /** @type {CompendiumNode} */
  const node = { name: toKebabCase(doc.name), sup: null };
  if (doc.system?._sup) { node.sup = doc.system._sup; }
  if (!PACK_REGISTRY[pack]) { PACK_REGISTRY[pack] = {}; }
  PACK_REGISTRY[pack][doc._id] = node;
}

/**
 * Derive the name for a document by searching through the pack registry.
 * @param {string} pack
 * @param {string} id
 * @returns {string}
 */
function deriveName(pack, id) {
  const node = PACK_REGISTRY[pack][id];
  if (node.sup) { return `${deriveName(pack, node.sup)}-${node.name}`; }
  return node.name;
}

// Execution Loop
// ==============

/**
 * Unpack a pack.
 * @param {string} pack
 * @param {boolean} buildRegistry
 */
async function unpackPack(pack, buildRegistry) {
  const directory = `./src/packs/${toKebabCaseFull(pack)}`;
  if (buildRegistry) { console.log(`Building registry for ${pack}`); }
  else { console.log(`Unpacking ${pack} to ${directory}`); }
  try {
    for (const file of await fs.readdir(directory)) {
      const filePath = path.join(directory, file);
      if (file.endsWith(YAML ? ".yml" : ".json")) { await fs.unlink(filePath); }
      else { await fs.rm(filePath, { recursive: true }); }
    }
  } catch (error) {
    if (error.code !== "ENOENT") { console.log(error); }
  }
  const extractOptions = {
    expandAdventures: EXPAND_ADVENTURES,
    folders: FOLDERS,
    transformEntry,
    transformFolderName,
    transformName,
    yaml: YAML,
  };
  state.pack = pack;
  state.buildRegistry = buildRegistry;
  await extractPack(`./packs/${pack}`, `./src/packs/${toKebabCaseFull(pack)}`, extractOptions);
}

const packs = await fs.readdir("./packs");
for (const pack of packs) { await unpackPack(pack, true); }
for (const pack of packs) { await unpackPack(pack, false); }

// Transformers
// ============

/**
 * @param {object} doc
 * @param {object} context
 * @returns {string}
 */
function transformName(doc, context) {
  let name = toKebabCase(doc.name);
  if (!state.buildRegistry) { name = deriveName(state.pack, doc._id); }
  name = `${name}.${YAML ? "yml" : "json"}`;
  if (context.folder) { name = path.join(context.folder, name); }
  return name;
}

/**
 * @param {object} doc
 * @returns {string}
 */
function transformFolderName(doc) {
  return toKebabCase(doc.name);
}

/**
 * Clean a document.
 * @param {object} doc
 */
function cleanEntry(doc) {
  cleanDocument(doc);
  doc._stats = { ...doc._stats ?? {}, ...BASIC_STATS };
  sortKeys(doc);
  if (doc.system?.automations) { sortAutomations(doc.system.automations); }
}

/**
 * @param {object} doc
 * @returns {boolean|void}
 */
function transformEntry(doc) {
  if (state.buildRegistry) {
    registerDocument(state.pack, doc);
    return false;
  }
  cleanEntry(doc);
  if (doc.system) { conformDataValues(doc.system); }
  ["cards", "categories", "effects", "items", "notes", "pages", "results"].forEach(key =>
    doc[key]?.forEach(d => transformEntry(d))
  );
  if (!doc._key.includes("scene")) { conformDataValues(doc); }
}

/**
 * Sort keys in an object in place.
 * @param {object} obj
 */
function sortKeys(obj) {
  if (typeof obj !== "object" || !obj) { return; }
  const keys = Object.keys(obj).sort();
  const cache = { ...obj };
  for (const key in obj) { delete obj[key]; }
  for (const key of keys) {
    obj[key] = cache[key];
    if (typeof obj[key] === "object" && !Array.isArray(obj[key])) { sortKeys(obj[key]); }
    if (typeof obj[key] === "object" && Array.isArray(obj[key])) {
      for (const i of obj[key]) { sortKeys(i); }
    }
  }
}

/**
 * @param {object} obj
 * @returns {object}
 */
function conformDataValues(obj) {
  if (Array.isArray(obj)) {
    for (let i = obj.length - 1; i >= 0; i--) {
      if (obj[i] === "") { obj.splice(i, 1); }
      else if (typeof obj[i] === "object" && obj[i] !== null) { conformDataValues(obj[i]); }
    }
  } else {
    for (const key in obj) {
      if (obj[key] === "") { delete obj[key]; }
      if (obj[key] === "{}") { delete obj[key]; }
      else if (obj[key] === null) { delete obj[key]; }
      else if (Array.isArray(obj[key])) {
        if (obj[key].length === 0) { delete obj[key]; }
        else if (typeof obj[key][0] === "string" && obj[key].length > 1) {
          {
            obj[key].sort((a, b) => toPackName(a).localeCompare(toPackName(b)));
          }
        } else if (typeof obj[key][0] === "number" && obj[key].length > 1) {
          obj[key].sort((a, b) => a - b);
        }
      } else if (typeof obj[key] === "object" && obj[key] !== null) {
        if (Object.keys(obj[key]).length === 0) { delete obj[key]; }
        else { conformDataValues(obj[key]); }
      }
    }
  }
  return obj;
}

/**
 * @typedef MinimalAutomationData
 * @property {string} type
 * @property {string} _id
 * @property {(0|1|2)[]} competencies
 * @property {(0|1)[]} heighten
 * @property {(0|1)[]} [crit]
 */

/**
 * @typedef MinimalAutomationData
 * @property {string} type
 * @property {string} _id
 * @property {(0|1|2)[]} competencies
 * @property {(0|1)[]} heighten
 * @property {(0|1)[]} [crit]
 */

/**
 * Sorts automations consistently.
 * @param {Record<string, MinimalAutomationData>} automations
 * @returns {Record<string, MinimalAutomationData>}
 */
function sortAutomations(automations) {
  const COMPETENCY_MAP = {
    0: [0, 0, 0],
    1: [1, 0, 0],
    2: [1, 1, 0],
    3: [0, 1, 0],
    4: [1, 0, 1],
    5: [1, 1, 1],
    6: [0, 1, 1],
    7: [0, 0, 1],
  };

  const PAIR_MAP = { 0: [0, 0], 1: [1, 0], 2: [1, 1], 3: [0, 1] };

  const STRING_MAP = Object.entries(COMPETENCY_MAP).reduce((acc, [key, arr]) => {
    acc[arr.join("")] = key;
    return acc;
  }, {});

  const PAIR_STRING_MAP = Object.entries(PAIR_MAP).reduce((acc, [key, arr]) => {
    acc[arr.join("")] = key;
    return acc;
  }, {});

  const sortableArray = Object.entries(automations).map(([key, a]) => {
    a.competencies ??= [0, 1, 2];
    a.heighten ??= [0, 1];

    const comps = a.competencies || [];
    const compStr = `${+comps.includes(0)}${+comps.includes(1)}${+comps.includes(2)}`;
    const compSort = STRING_MAP[compStr] || "0";

    const h = a.heighten || [];
    const hStr = `${+h.includes(0)}${+h.includes(1)}`;
    const hSort = PAIR_STRING_MAP[hStr] || "0";

    const c = a.crit || [];
    const cStr = `${+c.includes(0)}${+c.includes(1)}`;
    const cSort = PAIR_STRING_MAP[cStr] || "0";

    return { data: a, key, sortKey: a.type + compSort + hSort + cSort };
  });

  sortableArray.sort((a, b) => {
    if (a.sortKey < b.sortKey) { return -1; }
    if (a.sortKey > b.sortKey) { return 1; }
    return 0;
  });

  for (const key of Object.keys(automations)) { delete automations[key]; }
  for (const item of sortableArray) {
    if (item.data.competencies.length === 3) { delete item.data.competencies; }
    if (item.data.heighten.length === 2) { delete item.data.heighten; }
    if (item.data.crit?.length === 2) { delete item.data.crit; }
    automations[item.key] = item.data;
  }
  return automations;
}

/**
 * Convert a UUID to a name.
 * @param {string} uuid
 * @returns {string}
 */
function toPackName(uuid) {
  let name = uuid;
  if (uuid.startsWith("Compendium.teriock.")) {
    const parts = uuid.split(".");
    if (parts.length === 5) {
      const packId = parts[2];
      const docId = parts[4];
      if (PACK_REGISTRY[packId] && PACK_REGISTRY[packId][docId]) { name = PACK_REGISTRY[packId][docId]?.name ?? name; }
    }
  }
  return name;
}
