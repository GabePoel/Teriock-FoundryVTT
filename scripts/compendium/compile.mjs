import { promises as fs } from "fs";
import yaml from "js-yaml";
import path from "path";

import { toId } from "../../src/module/helpers/string.mjs";
import { BASIC_STATS, SYSTEM_VERSION } from "./constants.mjs";

const SRC_DIR = "./macros/";
const DST_DIR = "./src/packs/";

/**
 * Build all macros' `.yml` files in a directory recursively.
 * @param {string} dir
 */
async function buildAllYmlFiles(dir) {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) await buildAllYmlFiles(fullPath);
      else if (entry.isFile() && fullPath.endsWith(".mjs")) await buildYmlFile(fullPath);
    }
  } catch (e) {
    console.error("Error reading directory:", e);
  }
}

/**
 * Build a macro's `.yml` file that can be packed into a database from a `.mjs` file.
 * @param {string} fp
 */
async function buildYmlFile(fp) {
  try {
    const command = (await fs.readFile(fp, "utf8")).trimEnd();

    const relPath = path.relative(SRC_DIR, fp);
    const dstPath = path.join(DST_DIR, relPath).replace(/\.mjs$/, ".yml");
    const dstDirPath = path.dirname(dstPath);
    await fs.mkdir(dstDirPath, { recursive: true });

    let yamlObj = {};
    let fileExists = false;

    try {
      const existingYaml = await fs.readFile(dstPath, "utf8");
      yamlObj = yaml.load(existingYaml) || {};
      fileExists = true;
    } catch (e) {
      console.error("Error loading yaml file:", e);
    }

    const generatedId = toId(dstPath, { hash: true });

    Object.assign(yamlObj, {
      _id: yamlObj._id ?? generatedId,
      _key: yamlObj._key ?? `!macros!${generatedId}`,
      _stats: { ...BASIC_STATS, systemVersion: SYSTEM_VERSION },
      command,
      scope: "global",
      type: "script",
    });

    await fs.writeFile(dstPath, yaml.dump(yamlObj, { lineWidth: -1, quotingType: "'" }), "utf8");
    console.log(`${fileExists ? "Updated" : "Created"}: ${fp} -> ${dstPath}`);
  } catch (e) {
    console.error(`Error building .yml file ${fp}:`, e.message);
  }
}

console.log("Compiling compendium macros...");
await buildAllYmlFiles(SRC_DIR);
console.log("Compile complete!");
