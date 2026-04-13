import { extractPack } from "@foundryvtt/foundryvtt-cli";
import { promises as fs } from "fs";
import path from "path";
import { toKebabCase, toKebabCaseFull } from "../src/module/helpers/string.mjs";
import { default as system } from "../system.json" with { type: "json" };
import { cleanDocument } from "./compendium/clean-fields.mjs";

const BUILDER_NAME = "teriockBuilder00";
const EXPAND_ADVENTURES = true;
const FOLDERS = true;
const YAML = true;

/**
 * @typedef {object} CompendiumNode
 * @property {string} name
 * @property {string|null} sup
 */

/** @type {Record<string, Record<string, CompendiumNode>>} */
const PACK_REGISTRY = {};

let CURRENT_PACK;
let BUILD_REGISTRY = true;

/**
 * Register a document to the pack registry.
 * @param {string} pack
 * @param {object} doc
 */
function registerDocument(pack, doc) {
  /** @type {CompendiumNode} */
  const node = { name: toKebabCase(doc.name), sup: null };
  if (doc.system?._sup) node.sup = doc.system._sup;
  if (!PACK_REGISTRY[pack]) PACK_REGISTRY[pack] = {};
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
  if (node.sup) return `${deriveName(pack, node.sup)}-${node.name}`;
  return node.name;
}

// Execution Loop
// ==============

const packs = await fs.readdir("./packs");
for (const pack of packs) {
  const directory = `./src/packs/${toKebabCaseFull(pack)}`;
  console.log(`Unpacking ${pack} to ${directory}`);
  try {
    for (const file of await fs.readdir(directory)) {
      const filePath = path.join(directory, file);
      if (file.endsWith(YAML ? ".yml" : ".json")) {
        await fs.unlink(filePath);
      } else {
        await fs.rm(filePath, { recursive: true });
      }
    }
  } catch (error) {
    if (error.code !== "ENOENT") console.log(error);
  }
  CURRENT_PACK = pack;
  BUILD_REGISTRY = true;
  const extractOptions = {
    yaml: YAML,
    transformName,
    transformFolderName,
    transformEntry,
    expandAdventures: EXPAND_ADVENTURES,
    folders: FOLDERS,
  };
  await extractPack(
    `./packs/${pack}`,
    `./src/packs/${toKebabCaseFull(pack)}`,
    extractOptions,
  );
  BUILD_REGISTRY = false;
  await extractPack(
    `./packs/${pack}`,
    `./src/packs/${toKebabCaseFull(pack)}`,
    extractOptions,
  );
}

// Transformers
// ============

/**
 * @param {object} doc
 * @param {object} context
 * @returns {string}
 */
function transformName(doc, context) {
  let name = toKebabCase(doc.name);
  if (!BUILD_REGISTRY) name = deriveName(CURRENT_PACK, doc._id);
  name = `${name}.${YAML ? "yml" : "json"}`;
  if (context.folder) name = path.join(context.folder, name);
  return name;
}

/**
 * @param {object} doc
 * @returns {string}
 */
function transformFolderName(doc) {
  return toKebabCase(doc.name);
}

function cleanEntry(doc) {
  cleanDocument(doc);
  delete doc.author;
  delete doc.ownership;
  if (doc._stats) {
    doc._stats.coreVersion = system.compatibility.verified.toString();
    doc._stats.lastModifiedBy = BUILDER_NAME;
  }
  sortKeys(doc);
}

/**
 * @param {object} doc
 * @returns {boolean|void}
 */
function transformEntry(doc) {
  if (BUILD_REGISTRY) {
    registerDocument(CURRENT_PACK, doc);
    return false;
  }
  cleanEntry(doc);
  if (doc.system) removeEmptyValues(doc.system);
  [
    "cards",
    "categories",
    "effects",
    "items",
    "notes",
    "pages",
    "results",
  ].forEach((key) => doc[key]?.forEach((d) => transformEntry(d)));
  removeEmptyValues(doc);
}

/**
 * Sort keys in an object in place.
 * @param {object} obj
 */
function sortKeys(obj) {
  if (typeof obj !== "object" || !obj) return;
  const keys = Object.keys(obj).sort();
  const cache = { ...obj };
  for (const key in obj) {
    delete obj[key];
  }
  for (const key of keys) {
    obj[key] = cache[key];
    if (typeof obj[key] === "object" && !Array.isArray(obj[key])) {
      sortKeys(obj[key]);
    }
    if (typeof obj[key] === "object" && Array.isArray(obj[key])) {
      for (const i of obj[key]) {
        sortKeys(i);
      }
    }
  }
}

/**
 * @param {object} obj
 * @returns {object}
 */
function removeEmptyValues(obj) {
  if (Array.isArray(obj)) {
    for (let i = obj.length - 1; i >= 0; i--) {
      if (obj[i] === "") {
        obj.splice(i, 1);
      } else if (typeof obj[i] === "object" && obj[i] !== null) {
        removeEmptyValues(obj[i]);
      }
    }
  } else {
    for (const key in obj) {
      if (obj[key] === "") delete obj[key];
      else if (obj[key] === null) delete obj[key];
      else if (Array.isArray(obj[key]) && obj[key].length === 0) {
        delete obj[key];
      } else if (typeof obj[key] === "object" && obj[key] !== null) {
        if (Object.keys(obj[key]).length === 0) delete obj[key];
        else removeEmptyValues(obj[key]);
      }
    }
  }
  return obj;
}
