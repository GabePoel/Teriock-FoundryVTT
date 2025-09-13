import { extractPack } from "@foundryvtt/foundryvtt-cli";
import { promises as fs } from "fs";
import path from "path";
import { toKebabCase } from "../src/module/helpers/string.mjs";

const MODULE_ID = process.cwd();
const yaml = true;
const expandAdventures = true;
const folders = true;
const BUILDER_NAME = "teriockBuilder00";

// noinspection JSVoidFunctionReturnValueUsed
const packs = /** @type {string[]} */ await fs.readdir("./packs");
for (const pack of packs) {
  console.log("Unpacking " + pack);
  const directory = `./src/packs/${pack}`;
  try {
    // noinspection JSVoidFunctionReturnValueUsed
    for (const file of /** @type {string[]} */ await fs.readdir(directory)) {
      const filePath = path.join(directory, file);
      if (file.endsWith(yaml ? ".yml" : ".json")) {
        await fs.unlink(filePath);
      } else {
        await fs.rm(filePath, { recursive: true });
      }
    }
  } catch (error) {
    if (error.code === "ENOENT") {
      console.log("No files inside of " + pack);
    } else {
      console.log(error);
    }
  }
  await extractPack(`${MODULE_ID}/packs/${pack}`, `${MODULE_ID}/src/packs/${pack}`, {
    yaml,
    transformName,
    transformFolderName,
    transformEntry,
    expandAdventures,
    folders,
  });
}

/**
 * Transform document file name.
 * @param {object} doc - The document to reference.
 * @param {object} context - Additional context.
 * @returns {string}
 */
function transformName(doc, context) {
  const safeFileName = toKebabCase(doc.name);
  let name = `${doc.name ? `${safeFileName}` : doc._id}.${yaml ? "yml" : "json"}`;
  name = name.replace("---", "-");
  if (context.folder) {
    name = path.join(context.folder, name);
  }
  return name;
}

/**
 * Transform folder file name.
 * @param {object} doc - The document to reference/
 * @returns {string}
 */
function transformFolderName(doc) {
  return toKebabCase(doc.name);
}

/**
 * Clean a document.
 * @param {object} doc - The document to clean.
 */
function cleanEntry(doc) {
  delete doc.sort;
  if (doc.author) {
    doc.author = BUILDER_NAME;
  }
  if (doc._stats) {
    delete doc._stats.createdTime;
    delete doc._stats.modifiedTime;
    delete doc._stats.compendiumSource;
    delete doc._stats.duplicateSource;
    delete doc._stats.exportSource;
    if (doc._stats.coreVersion) {
      doc._stats.coreVersion = doc._stats.coreVersion.split(".")[0];
    }
    doc._stats.lastModifiedBy = BUILDER_NAME;
  }
  if (doc.system) {
    delete doc.system.font;
    delete doc.system.updateCounter;
    delete doc.system.proficient;
    delete doc.system.fluent;
    delete doc.system.disabled;
    delete doc.tint;
    delete doc.sort;
    if (doc.type === "power") {
      delete doc.system.size;
      delete doc.system.lifespan;
      delete doc.system.adult;
      delete doc.system.onUse;
      // Change this once we have powers with flaws
      delete doc.system.flaws;
    }
    if (doc.type !== "base") {
      delete doc.system.deleteOnExpire;
      delete doc.system.suppression;
    }
    if (doc.type === "ability") {
      delete doc.description;
      delete doc.system.description;
      delete doc.system.deleteOnExpire;
      delete doc.system.suppression;
      // Delete values that are only relevant in game
      delete doc.system.sustaining;
    }
    if (doc.type === "property") {
      delete doc.description;
    }
    if (doc.type === "fluency") {
      delete doc.description;
    }
    if (doc.type === "resource") {
      delete doc.description;
    }
    if (doc.type === "equipment") {
      // Delete values that are only relevant in game
      delete doc.system.glued;
      delete doc.system.shattered;
      delete doc.system.dampened;
      delete doc.system.identified;
      delete doc.system.reference;
      // Deleted until we have non-mundane equipment
      delete doc.system.flaws;
      delete doc.system.notes;
      delete doc.system.tier;
      delete doc.system.description;
      delete doc.system.onUse;
    }
    if (doc.type === "wrapper") {
      delete doc.system;
    }
  }
  if (doc.ownership) {
    doc.ownership = {
      default: doc.ownership.default,
    };
  }
}

/**
 * Clean a document recursively.
 * @param {object} doc - The document to transform.
 */
function transformEntry(doc) {
  cleanEntry(doc);
  if (doc.effects) {
    doc.effects.forEach((d) => cleanEntry(d));
  }
  if (doc.items) {
    doc.items.forEach((d) => cleanEntry(d));
  }
  if (doc.pages) {
    doc.pages.forEach((d) => cleanEntry(d));
  }
}