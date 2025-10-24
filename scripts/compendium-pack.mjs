import { compilePack } from "@foundryvtt/foundryvtt-cli";
import { promises as fs } from "fs";
import { toCamelCase } from "../src/module/helpers/string.mjs";

//eslint-disable-next-line no-undef
const MODULE_ID = process.cwd();
const yaml = true;
const folders = true;

// noinspection JSVoidFunctionReturnValueUsed
const packs = await fs.readdir("./src/packs");
for (const pack of packs) {
  if (pack === ".gitattributes") {
    continue;
  }
  console.log(
    "Packing " + toCamelCase(pack) + " from " + "./src/packs/" + pack,
  );
  await compilePack(
    `${MODULE_ID}/src/packs/${pack}`,
    `${MODULE_ID}/packs/${toCamelCase(pack)}`,
    {
      yaml,
      recursive: folders,
    },
  );
}
