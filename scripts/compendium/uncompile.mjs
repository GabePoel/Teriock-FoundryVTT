import { promises as fs } from "fs";
import yaml from "js-yaml";
import path from "path";

const SRC_DIR = "./src/packs";
const DST_DIR = "./macros";

/**
 * Build all macros' `.mjs` files in a directory recursively.
 * @param {string} dir
 */
async function buildAllMjsFiles(dir) {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) { await buildAllMjsFiles(fullPath); }
      else if (entry.isFile() && fullPath.endsWith(".yml")) { await buildMjsFile(fullPath); }
    }
  } catch (e) {
    console.error(`Error reading directory ${dir}:`, e);
  }
}

/**
 * Build a macro's `.mjs` file that be converted back into a `.yml` file and packed into a database.
 * @param {string} fp
 */
async function buildMjsFile(fp) {
  try {
    const fileContents = await fs.readFile(fp, "utf8");
    const parsedYaml = yaml.load(fileContents);
    if (parsedYaml && typeof parsedYaml.command === "string" && parsedYaml.type === "script") {
      const relPath = path.relative(SRC_DIR, fp);
      const dstPath = path.join(DST_DIR, relPath).replace(/\.yml$/, ".mjs");
      const dstDirPath = path.dirname(dstPath);
      await fs.mkdir(dstDirPath, { recursive: true });
      await fs.writeFile(dstPath, parsedYaml.command, "utf8");
      console.log(`Uncompiled: ${fp} -> ${dstPath}`);
    }
  } catch (error) {
    console.error(`Error building .mjs file ${fp}:`, error.message);
  }
}

console.log("Uncompiling compendium macros...");
await buildAllMjsFiles(SRC_DIR);
console.log("Uncompile complete!");
