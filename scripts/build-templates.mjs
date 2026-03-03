import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEV_ROOT = path.resolve(__dirname, "..", "src", "templates");
const FOUNDRY_ROOT = "systems/teriock/src/templates";

/**
 * @param {string} dir
 * @param {string[]} fileList
 * @returns {string[]}
 */
function getHandlebarsFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) {
    console.error(`Directory not found: ${dir}`);
  }
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      getHandlebarsFiles(fullPath, fileList);
    } else if (file.endsWith(".hbs")) {
      const relativePath = path.relative(DEV_ROOT, fullPath);
      const virtualPath = `${FOUNDRY_ROOT}/${relativePath}`;
      fileList.push(virtualPath);
    }
  }
  return fileList;
}

const templates = getHandlebarsFiles(DEV_ROOT);
const templateMap = Object.fromEntries(
  templates.map((t) => [
    t.replace(FOUNDRY_ROOT, "teriock").replace(".hbs", ""),
    t,
  ]),
);

const fp = path.resolve(__dirname, "../src/index/templates.json");
await fs.promises.writeFile(fp, JSON.stringify(templateMap, null, 2), "utf-8");
