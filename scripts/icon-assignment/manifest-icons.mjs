import { writeFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { systemPath } from "../../src/module/helpers/path.mjs";
import { toKebabCase } from "../../src/module/helpers/string.mjs";
import { default as assignments } from "./assignments.json" with { type: "json" };

/**
 * @param {object} obj
 * @param {string} p
 * @returns {Promise<void>}
 */
export async function saveObject(obj, p) {
  await writeFile(p, JSON.stringify(obj, null, 2), "utf-8");
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper functions from the previous script to handle links
const isDirect = (v) => typeof v === "string" && !v.startsWith("@");
const isLink = (v) => typeof v === "string" && v.startsWith("@");

const parseLink = (raw, defaultCategory) => {
  const s = (raw || "").trim().replace(/^@/, "");
  if (!s) {
    return null;
  }
  const idx = s.indexOf(":");
  if (idx > -1) {
    const cat = s.slice(0, idx).trim().toLowerCase();
    const name = s.slice(idx + 1).trim();
    return {
      category: cat || defaultCategory,
      name,
    };
  }
  return {
    category: defaultCategory,
    name: s,
  };
};

const keyOf = (cat, name) => `${cat}||${name}`;

// Build global maps to resolve links
const directPath = new Map();
const linkMap = new Map();
const allItems = [];
const categories = assignments;

for (const [ cat, section ] of Object.entries(categories)) {
  for (const [ name, val ] of Object.entries(section)) {
    allItems.push({
      category: cat,
      name,
    });
    if (isDirect(val)) {
      directPath.set(keyOf(cat, name), val);
    } else if (isLink(val)) {
      const link = parseLink(val, cat);
      if (link) {
        linkMap.set(keyOf(cat, name), link);
      }
    }
  }
}

// Resolve the first ancestor that has a direct image (cross-category allowed)
const resolveRootKey = (startCat, startName) => {
  const seen = new Set();
  let curCat = startCat, curName = startName;
  while (curCat && curName && !directPath.has(keyOf(curCat, curName))) {
    const k = keyOf(curCat, curName);
    if (seen.has(k)) {
      console.error(`Circular link detected at "${startCat}:${startName}"`);
      return null;
    }
    seen.add(k);
    const link = linkMap.get(k);
    if (!link) {
      return null;
    }
    curCat = link.category || curCat;
    curName = link.name;
  }
  return curCat && curName ? keyOf(curCat, curName) : null;
};

const iconManifest = {};
const dirKeys = Object.keys(assignments);

for (const dirKey of dirKeys) {
  /** @type {Record<string,string>} */
  const dirObj = assignments[dirKey];
  iconManifest[dirKey] = {};
  for (const [ key, value ] of Object.entries(dirObj)) {
    let finalPath;

    if (isLink(value)) {
      // Handle linked icons by finding their root
      const rootKey = resolveRootKey(dirKey, key);
      const rootPath = rootKey ? directPath.get(rootKey) : null;
      if (rootPath) {
        if (rootPath.startsWith("images/Foundry/")) {
          // If the root is a Foundry icon, use that path
          finalPath = rootPath.replace("images/Foundry/", "icons/");
        } else {
          // If the root is not a Foundry icon, it will have a local icon created
          finalPath = systemPath(`icons/${dirKey}/${toKebabCase(key)}.webp`);
        }
      } else {
        console.warn(`Could not resolve link for "${dirKey}:${key}".`);
        continue;
      }
    } else {
      // Handle direct icon assignments
      if (value.startsWith("images/Foundry/")) {
        finalPath = value.replace("images/Foundry/", "icons/");
      } else {
        finalPath = systemPath(`icons/${dirKey}/${toKebabCase(key)}.webp`);
      }
    }

    iconManifest[dirKey][key] = finalPath;
  }
}

await saveObject(iconManifest, path.resolve(__dirname, "../../src/icons/icon-manifest.json"),);
