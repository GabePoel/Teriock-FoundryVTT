import fs from "fs";
import path from "path";

const CODEPOINTS_URL =
  "https://raw.githubusercontent.com/google/material-design-icons/master/variablefont/MaterialSymbolsRounded%5BFILL%2CGRAD%2Copsz%2Cwght%5D.codepoints";
const CSS_URL =
  "https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200";
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

const CSS_DST = "./src/assets/icons/css/material-symbols.css";
const FONT_DST = "./src/assets/icons/fonts/material-symbols-rounded.woff2";

console.log(`Fetching Material Symbols source CSS...\n - ${CSS_URL}`);
const cssResponse = await fetch(CSS_URL, { headers: { "User-Agent": USER_AGENT } });
if (!cssResponse.ok) { throw new Error(`\nFailed to fetch CSS: ${cssResponse.status}`); }
console.log("Received CSS source.");

console.log("\nExtracting font URL from source CSS...");
const cssText = await cssResponse.text();
const fontUrlMatch = cssText.match(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+\.woff2)\)/);
if (!fontUrlMatch) { throw new Error(`Failed to extract URL from source CSS:\n${cssText}`); }
const fontUrl = fontUrlMatch[1];
console.log("Found font URL.");

console.log(`\nFetching codepoints and font...\n - ${CODEPOINTS_URL}\n - ${fontUrl}`);
const [codepointsResponse, fontResponse] = await Promise.all([fetch(CODEPOINTS_URL), fetch(fontUrl)]);
if (!codepointsResponse.ok) { throw new Error(`Failed to fetch codepoints: ${codepointsResponse.status}`); }
if (!fontResponse.ok) { throw new Error(`Failed to fetch font: ${fontResponse.status}`); }
console.log("Received codepoints and font.");

console.log("\nExtracting icons from codepoints...");
const [codepointsText, fontBuffer] = await Promise.all([codepointsResponse.text(), fontResponse.arrayBuffer()]);
const lines = codepointsText.trim().split(/\r?\n/);
console.log(`Extracted ${lines.length} icons.`);

console.log("\nGenerating CSS...");
let css = "/* Auto-generated using `npm run link:symbols` */\n\n";
for (const line of lines) {
  const [name, codepoint] = line.trim().split(/\s+/);
  if (name && codepoint) {
    css += `.mic.ms-${name.replaceAll("_", "-")}::before { content: "${name}"; }\n`;
  }
}
console.log("CSS generated.");

console.log("\nSaving CSS...");
fs.mkdirSync(path.dirname(CSS_DST), { recursive: true });
fs.writeFileSync(CSS_DST, css);
console.log(`CSS saved to ${CSS_DST}.`);

console.log("\nSaving font...");
fs.mkdirSync(path.dirname(FONT_DST), { recursive: true });
fs.writeFileSync(FONT_DST, Buffer.from(fontBuffer));
console.log(`Font saved to ${FONT_DST}.`);

console.log("\nMaterial Symbols linking complete!");
