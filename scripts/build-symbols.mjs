import fs from "fs";
import { toKebabCase } from "../src/module/helpers/string.mjs";

const SRC =
  "https://raw.githubusercontent.com/google/material-design-icons/master/variablefont/MaterialSymbolsOutlined%5BFILL%2CGRAD%2Copsz%2Cwght%5D.codepoints";
const DST = "./src/assets/icon-fonts/css/material-symbols.css";

console.log("Downloading Material Symbols codepoints...");
const response = await fetch(SRC);
if (!response.ok) throw new Error(response.status);
const text = await response.text();
const lines = text.trim().split("\n");
console.log(`Successfully fetched ${lines.length} icons. Generating CSS...`);
let css = "/* Auto-generated using `build-symbols.mjs` */\n\n";
lines.forEach((line) => {
  const [name, codepoint] = line.split(" ");
  if (name && codepoint) {
    css += `.mic.ms-${toKebabCase(name)}::before { content: "\\${codepoint}"; }\n`;
  }
});
fs.writeFileSync(DST, css);
console.log("CSS generation complete.");
