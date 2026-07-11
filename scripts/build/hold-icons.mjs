import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import { toCamelCase } from "../../src/module/helpers/string.mjs";
import { sortObject } from "../script-utils.mjs";

const FOUNDRY_ROOT = "systems/teriock/src/icons/hold";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SRC = path.resolve(__dirname, "../../src/icons/hold");
const DST = path.resolve(__dirname, "../../src/icons/hold/hold-icons.json");

const files = (await fs.promises.readdir(SRC)).filter(file => file.endsWith(".svg")).sort((a, b) => a.localeCompare(b));

const holdIcons = Object.fromEntries(files.map(file => {
  const name = file.slice(0, -4);
  return [toCamelCase(name), `${FOUNDRY_ROOT}/${file}`];
}));

await fs.promises.writeFile(DST, JSON.stringify(sortObject(holdIcons), null, 2), "utf-8");
