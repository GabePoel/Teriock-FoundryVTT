import { compilePack } from "@foundryvtt/foundryvtt-cli";
import { promises as fs } from "fs";

import { toCamelCase } from "../../src/module/helpers/string.mjs";
import { BASIC_STATS, DOCUMENT_COLLECTION_KEYS, FOLDERS, PSEUDO_COLLECTION_KEYS, YAML } from "./constants.mjs";

const MODULE_ROOT_DIR = process.cwd();

const packs = await fs.readdir("./src/packs");
for (const pack of packs) {
  if (pack === ".gitattributes") { continue; }
  console.log(`Packing ${toCamelCase(pack)} from ` + `./src/packs/${pack}`);
  await compilePack(`${MODULE_ROOT_DIR}/src/packs/${pack}`, `${MODULE_ROOT_DIR}/packs/${toCamelCase(pack)}`, {
    recursive: FOLDERS,
    transformEntry,
    yaml: YAML,
  });
}

/**
 * @param {object} doc
 * @returns {boolean|void}
 */
function transformEntry(doc) {
  doc._stats = Object.assign(doc._stats ?? {}, BASIC_STATS);
  if (doc.system) {
    for (const key of PSEUDO_COLLECTION_KEYS) {
      if (Array.isArray(doc.system[key])) {
        doc.system[key] = Object.fromEntries(doc.system[key].map((m) => [m._id, m]));
      }
    }
  }
  DOCUMENT_COLLECTION_KEYS.forEach(key => doc[key]?.forEach(d => transformEntry(d)));
}
