import { extractPack } from "@foundryvtt/foundryvtt-cli";
import { promises as fs } from "fs";
import path from "path";
import { toKebabCase } from "../src/module/helpers/string.mjs";

const MODULE_ID = process.cwd();
const yaml = false;
const expandAdventures = true;
const folders = true;
const BUILDER_NAME = "teriockBuilder00";

const packs = await fs.readdir("./packs");
for (const pack of packs) {
  console.log("Unpacking " + pack);
  const directory = `./src/packs/${pack}`;
  try {
    for (const file of await fs.readdir(directory)) {
      const filePath = path.join(directory, file);
      if (file.endsWith(yaml ? ".yml" : ".json")) await fs.unlink(filePath);
      else fs.rm(filePath, { recursive: true });
    }
  } catch (error) {
    if (error.code === "ENOENT") console.log("No files inside of " + pack);
    else console.log(error);
  }
  await extractPack(
    `${MODULE_ID}/packs/${pack}`,
    `${MODULE_ID}/src/packs/${pack}`,
    {
      yaml,
      transformName,
      transformFolderName,
      transformEntry,
      expandAdventures,
      folders,
    },
  );
}

/**
 * Prefaces the document with its type
 * @param {object} doc - The document data
 */
function transformName(doc, context) {
  // const safeFileName = doc.name.replace(/[^a-zA-Z0-9А-я]/g, "_");
  const safeFileName = toKebabCase(doc.name);
  let type = doc._key?.split("!")[1];
  if (!type) {
    if ("playing" in doc) type = "playlist";
    else if (doc.sorting) type = `folder_${doc.type}`;
    else if (doc.walls) type = "scene";
    else if (doc.results) type = "rollTable";
    else if (doc.pages) type = "journal";
    else type = doc.type;
  }
  // const prefix = ["actors", "items"].includes(type) ? doc.type : type;

  let name = `${doc.name ? `${safeFileName}` : doc._id}.${yaml ? "yml" : "json"}`;
  name = name.replace("---", "-");
  if (context.folder) name = path.join(context.folder, name);
  return name;
}

function transformFolderName(doc, context) {
  const safeFileName = toKebabCase(doc.name);
  return safeFileName;
}

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
    if (doc.type === "wrapper") {
      delete doc.system;
    }
    if (doc.type === "ability") {
      delete doc.description;
      delete doc.system.description;
      delete doc.system.deleteOnExpire;
      delete doc.system.suppression;
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
  }
  if (doc.ownership) {
    doc.ownership = {
      default: doc.ownership.default,
    };
  }
}

function transformEntry(doc, context) {
  cleanEntry(doc);
  if (doc.effects) doc.effects.forEach((d) => cleanEntry(d));
  if (doc.items) doc.items.forEach((d) => cleanEntry(d));
  if (doc.pages) doc.pages.forEach((d) => cleanEntry(d));
}