//noinspection JSUnusedGlobalSymbols

import { extractPack } from "@foundryvtt/foundryvtt-cli";
import { promises as fs } from "fs";
import path from "path";
import { toKebabCase, toKebabCaseFull } from "../src/module/helpers/string.mjs";

const yaml = true;
const expandAdventures = true;
const folders = true;
const BUILDER_NAME = "teriockBuilder00";
const DELETION_MAP = {
  root: ["duration", "showIcon", "tint", "sort"],
  stats: [
    "createdTime",
    "duplicateSource",
    "exportSource",
    "modifiedTime",
    "ownership",
  ],
  systemShared: [
    "applyHp",
    "applyMp",
    "deleteOnExpire",
    "disabled",
    "fluent",
    "font",
    "gmNotes",
    "hierarchy",
    "hpDice",
    "hpDiceBase",
    "mpDice",
    "mpDiceBase",
    "proficient",
    "suppression",
    "virtualProperties",
    "wikiNamespace",
  ],
  types: {
    creature: [
      "abilityFlags",
      "attributes",
      "attunements",
      "carryingCapacity",
      "deathBag",
      "interestRate",
      "money",
      "movementSpeed",
      "offense",
      "protections",
      "senses",
      "sheet",
      "speedAdjustments",
      "tradecrafts",
      "wither",
    ],
    power: ["size", "lifespan", "adult", "onUse", "flaws"],
    ability: ["description", "deleteOnExpire", "suppression", "sustaining"],
    equipment: [
      "damageTypes",
      "dampened",
      "glued",
      "identified",
      "ranged",
      "reference",
      "shattered",
      "shortRange",
      "twoHandedDamage",
    ],
    descriptionOnly: ["property", "fluency", "resource"],
  },
};

const tree = {};
let packTree = {};
let buildTree = true;

function clean(obj, keys) {
  if (!obj) return;
  keys.forEach((key) => delete obj[key]);
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
      if (file.endsWith(yaml ? ".yml" : ".json")) {
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
    yaml,
    transformName,
    transformFolderName,
    transformEntry,
    expandAdventures,
    folders,
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
    `${doc.name ? safeFileName : doc._id}.${yaml ? "yml" : "json"}`.replace(
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

  clean(doc, DELETION_MAP.root);
  if (!doc.folder) delete doc.folder;
  if (doc.author) doc.author = BUILDER_NAME;
  if (doc._stats) {
    clean(doc._stats, DELETION_MAP.stats);
    delete doc.ownership;
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

    // Bulk deletes
    clean(doc.system, DELETION_MAP.systemShared);

    // Type-specific deletes
    if (DELETION_MAP.types[doc.type]) {
      clean(doc.system, DELETION_MAP.types[doc.type]);
      if (doc.type === "ability") {
        delete doc.description;
        if (doc.system.effectTypes) delete doc.system.effects;
      }
    }
    if (DELETION_MAP.types.descriptionOnly.includes(doc.type)) {
      delete doc.description;
    }
  }
}

function transformEntry(doc) {
  if (buildTree && doc.system?._sup) return false;
  cleanEntry(doc);
  ["pages", "results", "effects", "items"].forEach((key) => {
    doc[key]?.forEach((d) => transformEntry(d));
  });
}
