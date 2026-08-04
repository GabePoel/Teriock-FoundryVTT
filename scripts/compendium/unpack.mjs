import { extractPack } from "@foundryvtt/foundryvtt-cli";
import { promises as fs } from "fs";
import path from "path";

import { toKebabCase, toKebabCaseFull } from "../../src/module/helpers/string.mjs";
import { cleanDocument, loadDefaults } from "./clean-fields.mjs";
import {
  DOCUMENT_COLLECTION_KEYS,
  EXPAND_ADVENTURES,
  FOLDERS,
  PSEUDO_COLLECTION_KEYS,
  YAML,
  YAML_OPTIONS,
} from "./constants.mjs";

/**
 * @typedef {object} CompendiumNode
 * @property {string} name
 * @property {string|null} sup
 */

/** @type {Record<string, Record<string, CompendiumNode>>} */
const PACK_REGISTRY = {};

const state = { buildRegistry: true, pack: null };
const allPaths = new Set();
let prefix;

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
  prefix = `./src/packs/${toKebabCaseFull(pack)}`;
  const directory = `./src/packs/${toKebabCaseFull(pack)}`;
  if (buildRegistry) { console.log(`Building registry for ${pack}`); }
  else { console.log(`Unpacking ${pack} to ${directory}`); }
  const extractOptions = {
    expandAdventures: EXPAND_ADVENTURES,
    folders: FOLDERS,
    omitVolatile: true,
    transformEntry,
    transformFolderName,
    transformName,
    yaml: YAML,
    yamlOptions: YAML_OPTIONS,
  };
  state.pack = pack;
  state.buildRegistry = buildRegistry;
  await extractPack(`./packs/${pack}`, prefix, extractOptions);
}

await loadDefaults();
const packs = await fs.readdir("./packs");
for (const pack of packs) { await unpackPack(pack, true); }
for (const pack of packs) { await unpackPack(pack, false); }
await removeOldFilesFromRoot("./src/packs");

// Old File Removal
// ================

/**
 * Remove every old file. This happens after unpacking so that `omitVolatile` has files to compare against.
 * @param {string} root
 * @returns {Promise<boolean>} Whether the directory is now empty.
 */
async function removeOldFilesFromRoot(root) {
  const keep = new Set([...allPaths].map((p) => path.normalize(p)));
  return await removeOldFilesFromDirectory(root, keep);
}

/**
 * Remove all the old files from a directory.
 * @param {string} dir
 * @param {Set<string>} keep
 * @returns {Promise<boolean>} Whether the directory is now empty.
 */
async function removeOldFilesFromDirectory(dir, keep) {
  const dirents = await fs.readdir(dir, { withFileTypes: true });
  let empty = true;
  for (const dirent of dirents) {
    const entryPath = path.join(dir, dirent.name);
    if (dirent.isDirectory()) {
      if (await removeOldFilesFromDirectory(entryPath, keep)) { await fs.rmdir(entryPath); }
      else { empty = false; }
    } else if (keep.has(path.normalize(entryPath))) {
      empty = false;
    } else {
      console.log(`Removing old file ${entryPath}`);
      await fs.unlink(entryPath);
    }
  }
  return empty;
}

// Document Transformation
// =======================

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
  allPaths.add(`${prefix}/${name}`);
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
  if (doc.system) {
    for (const key of PSEUDO_COLLECTION_KEYS) {
      if (doc.system[key]) {
        const sorted = sortMechanics(doc.system[key]);
        if (sorted) { doc.system[key] = sorted; }
      }
    }
  }
  if (doc._stats) {
    delete doc._stats.coreVersion;
    delete doc._stats.lastModifiedBy;
    delete doc._stats.systemId;
    delete doc._stats.systemVersion;
    if (!doc._stats.compendiumSource) { delete doc._stats.compendiumSource; }
    if (!doc._stats.duplicateSource) { delete doc._stats.duplicateSource; }
    if (!Object.keys(doc._stats).length) { delete doc._stats; }
  }
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
  DOCUMENT_COLLECTION_KEYS.forEach(key => doc[key]?.forEach(d => transformEntry(d)));
  ["effects", "items"].forEach(key => {
    doc[key]?.sort((a, b) => {
      const hasSupA = a.system?._sup != null;
      const hasSupB = b.system?._sup != null;
      if (hasSupA !== hasSupB) { return hasSupA - hasSupB; }
      return (a.name ?? "").localeCompare(b.name ?? "");
    });
  });
  if (doc.results) {
    doc.results.sort((a, b) => (a.range[0] - b.range[0]));
  }
  if (!doc._key.includes("scene")) { conformDataValues(doc); }
}

/**
 * Trim whitespace in HTML strings.
 * @param {string} value
 * @returns {string}
 */
function trimWhitespace(value) {
  if (!/<[a-z][^>]*>/i.test(value)) { return value; }
  return value.replace(/\s+/g, " ").replace(/>\s+</g, "><").trim();
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
      if (obj[key] === {}) { delete obj[key]; }
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
      } else if (typeof obj[key] === "string") {
        obj[key] = trimWhitespace(obj[key]);
      }
    }
  }
  return obj;
}

/**
 * @typedef MinimalMechanicData
 * @property {string} type
 * @property {string} _id
 * @property {(0|1|2)[]} competencies
 * @property {(0|1)[]} heighten
 * @property {(0|1)[]} [crit]
 */

/**
 * Sorts mechanics consistently.
 * @param {Record<string, MinimalMechanicData>} mechanics
 * @returns {Record<string, MinimalMechanicData>}
 */
function sortMechanics(mechanics) {
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

  const sortableArray = Object.values(mechanics).map((m) => {
    m.competencies ??= [0, 1, 2];
    m.competencies.sort();
    m.heighten ??= [0, 1];
    m.heighten.sort();
    m.crit ??= [0, 1];
    m.crit.sort();

    const comps = m.competencies || [];
    const compStr = `${Number(comps.includes(0))}${Number(comps.includes(1))}${Number(comps.includes(2))}`;
    const compSort = STRING_MAP[compStr] || "0";

    const h = m.heighten || [];
    const hStr = `${Number(h.includes(0))}${Number(h.includes(1))}`;
    const hSort = PAIR_STRING_MAP[hStr] || "0";

    const c = m.crit || [];
    const cStr = `${Number(c.includes(0))}${Number(c.includes(1))}`;
    const cSort = PAIR_STRING_MAP[cStr] || "0";

    return { data: m, sortKey: m.type + compSort + hSort + cSort };
  });

  sortableArray.sort((a, b) => {
    if (a.sortKey < b.sortKey) { return -1; }
    if (a.sortKey > b.sortKey) { return 1; }
    return 0;
  });

  return sortableArray.map(({ data }) => {
    if (data.competencies.length === 3) { delete data.competencies; }
    if (data.heighten.length === 2) { delete data.heighten; }
    if (data.crit?.length === 2) { delete data.crit; }
    return data;
  });
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
