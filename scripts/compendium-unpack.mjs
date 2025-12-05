import { extractPack } from "@foundryvtt/foundryvtt-cli";
import { promises as fs } from "fs";
import path from "path";
import { dieOptions } from "../src/module/constants/options/die-options.mjs";
import { toKebabCase, toKebabCaseFull } from "../src/module/helpers/string.mjs";

//eslint-disable-next-line no-undef
const MODULE_ID = process.cwd();
const yaml = true;
const expandAdventures = true;
const folders = true;
const BUILDER_NAME = "teriockBuilder00";

const tree = {};
let packTree = {};
let buildTree = true;

// noinspection JSVoidFunctionReturnValueUsed
const packs = /** @type {string[]} */ await fs.readdir("./packs");
for (const pack of packs) {
  const directory = `./src/packs/${toKebabCaseFull(pack)}`;
  console.log("Unpacking " + pack + " to " + directory);
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
  buildTree = true;
  packTree = {};
  tree[pack] = packTree;
  await extractPack(
    `${MODULE_ID}/packs/${pack}`,
    `${MODULE_ID}/src/packs/${toKebabCaseFull(pack)}`,
    {
      yaml,
      transformName,
      transformFolderName,
      transformEntry,
      expandAdventures,
      folders,
    },
  );
  buildTree = false;
  await extractPack(
    `${MODULE_ID}/packs/${pack}`,
    `${MODULE_ID}/src/packs/${toKebabCaseFull(pack)}`,
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
 * Transform document file name.
 * @param {object} doc - The document to reference.
 * @param {object} context - Additional context.
 * @returns {string}
 */
function transformName(doc, context) {
  let safeFileName = toKebabCase(doc.name);
  if (!buildTree && doc.system?._sup) {
    safeFileName = packTree[doc.system._sup] + "-" + toKebabCase(doc.name);
  }
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
  if (buildTree) {
    packTree[doc._id] = toKebabCase(doc.name);
  }
  if (doc.type !== "text") {
    delete doc.sort;
  }
  if (doc.author) {
    doc.author = BUILDER_NAME;
  }
  if (doc.showIcon) {
    delete doc.showIcon;
  }
  if (!doc.folder) {
    delete doc.folder;
  }
  if (doc._stats) {
    delete doc.ownership;
    delete doc._stats.createdTime;
    delete doc._stats.modifiedTime;
    delete doc._stats.duplicateSource;
    delete doc._stats.exportSource;
    if (doc._stats.coreVersion) {
      doc._stats.coreVersion = doc._stats.coreVersion.split(".")[0];
      doc._stats.coreVersion = "13";
    }
    doc._stats.lastModifiedBy = BUILDER_NAME;
  }
  if (doc.prototypeToken) {
    delete doc.prototypeToken.disposition;
  }
  if (doc.system) {
    if (doc.system.hierarchy?.supId) {
      doc.system._sup = doc.system.hierarchy.supId;
    }
    if (typeof doc.system.combat?.attackPenalty === "number") {
      doc.system.combat.attackPenalty = 0;
    }
    if (typeof doc.system.combat?.hasReaction === "boolean") {
      doc.system.combat.hasReaction = true;
    }
    delete doc.system.hierarchy;
    delete doc.system.font;
    delete doc.system.proficient;
    delete doc.system.fluent;
    delete doc.system.disabled;
    delete doc.system.gmNotes;
    delete doc.tint;
    delete doc.sort;
    delete doc.system.virtualProperties;
    delete doc.system.hpDice;
    delete doc.system.mpDice;
    delete doc.system.hpDiceBase;
    delete doc.system.mpDiceBase;
    delete doc.system.applyHp;
    delete doc.system.applyMp;
    delete doc.system.wikiNamespace;
    if (doc.system.applies) {
      doc.system.impacts = doc.system.applies;
      delete doc.system.applies;
    }
    if (doc.system.impacts) {
      for (const impact of ["base", "proficient", "fluent", "heightened"]) {
        if (doc.system.impacts[impact]) {
          if (doc.system.impacts[impact].changes) {
            for (const change of doc.system.impacts[impact].changes) {
              let key = change.key;
              for (const protection of [
                "resistances",
                "immunities",
                "hexproofs",
                "hexseals",
              ]) {
                if (key.startsWith(`system.${protection}`)) {
                  change.key = key.replace(
                    `system.${protection}`,
                    `system.protections.${protection}`,
                  );
                }
              }
            }
          }
        }
      }
    }
    if (doc.system.imports) {
      delete doc.system.imports.bodyParts;
      delete doc.system.imports.equipment;
    }
    if (doc.type === "creature") {
      delete doc.system.attributes;
      delete doc.system.abilityFlags;
      delete doc.system.movementSpeed;
      delete doc.system.carryingCapacity;
      delete doc.system.attunements;
      delete doc.system.offense;
      delete doc.system.deathBag;
      delete doc.system.money;
      delete doc.system.interestRate;
      delete doc.system.protections;
      delete doc.system.senses;
      delete doc.system.sheet;
      delete doc.system.speedAdjustments;
      delete doc.system.wither;
      delete doc.system.tradecrafts;
    }
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
      if (doc.system.effectTypes) {
        delete doc.system.effects;
      }
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
      delete doc.system.shortRange;
      delete doc.system.damageTypes;
      delete doc.system.ranged;
      delete doc.system.twoHandedDamage;
    }
    if (doc.type === "wrapper") {
      delete doc.system;
    }
    if (doc.type === "rank") {
      for (const stat of Object.keys(dieOptions.stats)) {
        const statDice = doc.system[`${stat}Dice`];
        if (statDice) {
          for (const [id, die] of Object.entries(statDice)) {
            die._id = id;
            die.stat = stat;
          }
        }
      }
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
  if (buildTree && doc.system?._sup) {
    return false;
  }
  cleanEntry(doc);
  if (doc.pages) {
    doc.pages.forEach((d) => transformEntry(d));
  }
  if (doc.results) {
    doc.results.forEach((d) => transformEntry(d));
  }
  if (doc.effects) {
    doc.effects.forEach((d) => transformEntry(d));
  }
  if (doc.items) {
    doc.items.forEach((d) => transformEntry(d));
  }
  if (doc.pages) {
    doc.pages.forEach((d) => transformEntry(d));
  }
}
