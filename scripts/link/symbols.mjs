import fs from "fs";
import path from "path";

import { toKebabCase } from "../../src/module/helpers/string.mjs";

const VARIANT = "MaterialSymbolsRounded%5BFILL%2CGRAD%2Copsz%2Cwght%5D";
const BASE = `https://raw.githubusercontent.com/google/material-design-icons/master/variablefont/${VARIANT}`;
const CODEPOINTS_SRC = `${BASE}.codepoints`;
const FONT_SRC = `${BASE}.ttf`;
const CSS_DST = "./src/assets/icon-classes/css/material-symbols.css";
const FONT_DST = "./src/assets/icon-classes/fonts/material-symbols-rounded.ttf";

console.log("Downloading Material Symbols codepoints and font...");
const [codepointsResponse, fontResponse] = await Promise.all([fetch(CODEPOINTS_SRC), fetch(FONT_SRC)]);
if (!codepointsResponse.ok) { throw new Error(`Codepoints download failed: ${codepointsResponse.status}`); }
if (!fontResponse.ok) { throw new Error(`Font download failed: ${fontResponse.status}`); }

const [text, fontBuffer] = await Promise.all([codepointsResponse.text(), fontResponse.arrayBuffer()]);
const lines = text.trim().split("\n");
console.log(`Successfully fetched ${lines.length} icons. Generating CSS...`);
let css = "/* Auto-generated using `npm run link:symbols` */\n\n";
lines.forEach(line => {
  const [name, codepoint] = line.split(" ");
  if (name && codepoint) { css += `.mic.ms-${toKebabCase(name)}::before { content: "\\${codepoint}"; }\n`; }
});
fs.writeFileSync(CSS_DST, css);
console.log("CSS generation complete.");

fs.mkdirSync(path.dirname(FONT_DST), { recursive: true });
fs.writeFileSync(FONT_DST, Buffer.from(fontBuffer));
console.log("Font download complete.");
