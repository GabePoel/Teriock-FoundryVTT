//noinspection JSUnusedGlobalSymbols

import { extractPack } from "@foundryvtt/foundryvtt-cli";
import { promises as fs } from "fs";
import path from "path";
import { toKebabCase, toKebabCaseFull } from "../src/module/helpers/string.mjs";
import { cleanDocument } from "./compendium/clean-fields.mjs";

const BUILDER_NAME = "teriockBuilder00";
const EXPAND_ADVENTURES = true;
const FOLDERS = true;
const YAML = true;

const tree = {};
let packTree = {};
let buildTree = true;

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

  buildTree = true;
  packTree = {};
  tree[pack] = packTree;

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
  buildTree = false;
  await extractPack(
    `./packs/${pack}`,
    `./src/packs/${toKebabCaseFull(pack)}`,
    extractOptions,
  );
}

// Transformers
// ============

function transformName(doc, context) {
  let safeFileName = toKebabCase(doc.name);
  if (!buildTree && doc.system?._sup) {
    safeFileName = `${packTree[doc.system._sup]}-${toKebabCase(doc.name)}`;
  }
  let name =
    `${doc.name ? safeFileName : doc._id}.${YAML ? "yml" : "json"}`.replace(
      "---",
      "-",
    );
  return context.folder ? path.join(context.folder, name) : name;
}

function transformFolderName(doc) {
  return toKebabCase(doc.name);
}

/**
 * Clean a document using the DELETION_MAP.
 */
function cleanEntry(doc) {
  if (buildTree) packTree[doc._id] = toKebabCase(doc.name);
  cleanDocument(doc);
  if (doc.author) doc.author = BUILDER_NAME;
  if (doc._stats) {
    if (doc._stats.coreVersion) doc._stats.coreVersion = "13";
    doc._stats.lastModifiedBy = BUILDER_NAME;
  }
  if (doc.prototypeToken) delete doc.prototypeToken.disposition;
  if (doc.ownership) doc.ownership = { default: doc.ownership.default };
  if (doc.type === "wrapper") delete doc.system;
  if (doc.system) {
    // Enforce default actor combat states
    if (typeof doc.system.combat?.attackPenalty === "number")
      doc.system.combat.attackPenalty = 0;
    if (typeof doc.system.combat?.hasReaction === "boolean")
      doc.system.combat.hasReaction = true;
  }
  sortKeys(doc);
}
function transformEntry(doc) {
  if (buildTree && doc.system?._sup) return false;
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
  ].forEach((key) => {
    // Sorting embedded breaks wrappers
    //sortEmbedded(doc[key]);
    doc[key]?.forEach((d) => {
      transformEntry(d);
    });
  });
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
 * Sort an embedded collection.
 * @param {object[] || undefined} collection
 */
function sortEmbedded(collection) {
  if (!collection) return;
  collection.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 *
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
      if (obj[key] === "") {
        delete obj[key];
      } else if (obj[key] === null) {
        delete obj[key];
      } else if (Array.isArray(obj[key]) && obj[key].length === 0) {
        delete obj[key];
      } else if (typeof obj[key] === "object" && obj[key] !== null) {
        if (Object.keys(obj[key]).length === 0) {
          delete obj[key];
        } else {
          removeEmptyValues(obj[key]);
        }
      }
    }
  }
  return obj;
}
