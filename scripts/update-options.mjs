import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outputDir = path.resolve(__dirname, "../module/helpers/constants/generated");
const manualDir = path.resolve(__dirname, "../module/helpers/constants/manual");

const camelCase = (str) => str.toLowerCase().replace(/[-\s]+(.)/g, (_, c) => c.toUpperCase());
const kebabCase = (str) =>
  str
    .replace(/\s+/g, "-")
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .toLowerCase();
const fileHeader = `// This file was auto-generated on ${new Date().toISOString().split("T")[0]} by scripts/update-options.mjs.\n// Do not edit manually.\n\n`;

const loadManualOverrides = async (name) => {
  const file = `${kebabCase(name)}.mjs`;
  const fullPath = path.join(manualDir, file);
  if (fs.existsSync(fullPath)) {
    try {
      const mod = await import(`../module/helpers/constants/manual/${file}?t=${Date.now()}`);
      const override = mod[camelCase(name)] || {};
      const remove = mod.remove || [];
      console.log(`Loaded manual overrides for ${name}`);
      return { override, remove };
    } catch (err) {
      console.warn(`Failed to load manual overrides for ${name}:`, err.message);
    }
  }
  return { override: {}, remove: [] };
};

const writeObjectToFile = async (titles, name) => {
  const generated = Object.fromEntries(titles.map((t) => [camelCase(t), t]));
  const { override, remove } = await loadManualOverrides(name);
  const merged = { ...generated, ...override };
  remove.map(camelCase).forEach((key) => delete merged[key]);
  const stringifyObject = (obj) =>
    "{\n" +
    Object.entries(obj)
      .map(([k, v]) => `    ${k}: ${JSON.stringify(v)}`)
      .join(",\n") +
    "\n}";

  const content = `${fileHeader}export const ${camelCase(name)} = ${stringifyObject(merged)};\n`;
  const filePath = path.join(outputDir, `${kebabCase(name)}.mjs`);
  fs.writeFileSync(filePath, content, "utf8");
  console.log(`Wrote ${Object.keys(merged).length} items to ${kebabCase(name)}.mjs`);
};

const cleanTitles = (members, prefixRegex = /^.*?:/) =>
  members
    .filter((m) => !m.title.startsWith("Category:"))
    .map((m) => (prefixRegex ? m.title.replace(prefixRegex, "") : m.title));

const processSimpleCategory = async (category, name, options = {}, prefixRegex) => {
  const { fetchCategoryMembers } = await import("../src/module/helpers/wiki.mjs");
  const members = await fetchCategoryMembers(category, options);
  const titles = cleanTitles(members, prefixRegex);
  await writeObjectToFile(titles, name);
};

(async () => {
  const { fetchCategoryMembers } = await import("../src/module/helpers/wiki.mjs");

  try {
    // Properties & Subcategories
    const subcategories = ["Magical properties", "Material properties", "Weapon fighting styles"];
    const allPropertyMembers = await fetchCategoryMembers("Properties", { cmtype: "page|subcat" });
    const directProperties = cleanTitles(allPropertyMembers, /^Property:/);

    const subcategoryTitles = new Set();

    for (const subcat of subcategories) {
      const subMembers = await fetchCategoryMembers(subcat, { cmtype: "page" });
      let titles = cleanTitles(subMembers, /^Property:/);
      if (subcat === "Weapon fighting styles") {
        titles = titles.map((t) => t.replace(/ fighting style$/i, ""));
      }
      titles.forEach((t) => subcategoryTitles.add(t));
      await writeObjectToFile(titles, subcat);
    }

    const remainingProperties = directProperties.filter((t) => !subcategoryTitles.has(t));
    await writeObjectToFile(remainingProperties, "properties");

    // Effects
    const effectMembers = await fetchCategoryMembers("Effects", { cmtype: "subcat" });
    const effectGroups = effectMembers
      .filter((m) => m.title.startsWith("Category:"))
      .map((m) => m.title.replace(/^Category:/, "").replace(/ effects$/i, ""));
    await writeObjectToFile(effectGroups, "effects");

    // Simple Categories
    await processSimpleCategory("Equipment", "equipment", { cmtype: "page" }, /^Equipment:/);
    await processSimpleCategory("Conditions", "conditions", { cmtype: "page" }, /^Condition:/);
    await processSimpleCategory("Abilities", "abilities", { cmtype: "page" }, /^Ability:/);

    // Equipment Classes
    const equipmentMembers = await fetchCategoryMembers("Equipment classes", { cmtype: "page|subcat" });
    const baseTitles = cleanTitles(equipmentMembers);
    const topSubcats = equipmentMembers
      .filter((m) => m.title.startsWith("Category:"))
      .map((m) => m.title.replace(/^Category:/, ""));

    let nestedSubcats = [];
    for (const subcat of topSubcats) {
      const nested = await fetchCategoryMembers(subcat, { cmtype: "subcat" });
      nestedSubcats.push(
        ...nested.filter((m) => m.title.startsWith("Category:")).map((m) => m.title.replace(/^Category:/, "")),
      );
    }

    const allEquipmentClasses = Array.from(new Set([...baseTitles, ...topSubcats, ...nestedSubcats]));
    await writeObjectToFile(allEquipmentClasses, "equipmentClasses");
  } catch (err) {
    console.error("Error:", err);
  }
})();
