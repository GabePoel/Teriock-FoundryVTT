import { compilePack } from "@foundryvtt/foundryvtt-cli";
import { promises as fs } from "fs";

import { toCamelCase } from "../../src/module/helpers/string.mjs";
import { FOLDERS, YAML } from "./constants.mjs";

const MODULE_ROOT_DIR = process.cwd();

const packs = await fs.readdir("./src/packs");
for (const pack of packs) {
  if (pack === ".gitattributes") { continue; }
  console.log(`Packing ${toCamelCase(pack)} from ` + `./src/packs/${pack}`);
  await compilePack(`${MODULE_ROOT_DIR}/src/packs/${pack}`, `${MODULE_ROOT_DIR}/packs/${toCamelCase(pack)}`, {
    recursive: FOLDERS,
    yaml: YAML,
  });
}
