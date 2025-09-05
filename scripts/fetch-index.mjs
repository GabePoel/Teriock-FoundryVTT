import { writeFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import {
  classes,
  damageTypes,
  drainTypes,
  tradecrafts,
  weaponFightingStyles,
} from "../src/module/constants/index/_module.mjs";
import { toCamelCase, toKebabCase } from "../src/module/helpers/string.mjs";
import {
  fetchCategoryMembers,
  fetchPageCategories,
  fetchWikiPageHTML,
} from "../src/module/helpers/wiki/_module.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BATCH_SIZE = 100;
const SIMPLE_CATEGORIES = [
  "Abilities",
  "Classes",
  "Conditions",
  "Core rules",
  "Creatures",
  "Damage types",
  "Drain types",
  "Equipment",
  "Keywords",
  "Properties",
  "Tradecrafts",
];

/**
 * @param {object} obj
 * @param {string} path
 * @returns {Promise<void>}
 */
export async function saveObject(obj, path) {
  await writeFile(path, JSON.stringify(obj, null, 2), "utf-8");
}

/**
 * @param {string} name
 * @returns {string}
 */
function quickPath(name) {
  return path.resolve(__dirname, "../src/index/names/" + name + ".json");
}

/**
 * @param {string} name
 * @returns {string}
 */
function relPath(name) {
  return path.resolve(__dirname, "../src/" + name + ".json");
}

/**
 * @typedef {object} CategoryObject
 * @property {boolean} [includeCategories]
 * @property {boolean} [includePages]
 * @property {boolean} [fullName]
 * @property {function} [processTitle]
 * @property {function} [filterTitle]
 */

/**
 * @param {string} category
 * @param {CategoryObject} [options]
 * @returns {Promise<string[]>}
 */
async function getCategoryMembers(category, options) {
  const {
    includeCategories = false,
    includePages = true,
    fullName = false,
    processTitle = (title) => title,
    filterTitle = (title) => title.length > 0,
  } = options;
  let members = await fetchCategoryMembers(category);
  if (!includeCategories) {
    members = members.filter((member) => !member.title.includes("Category:"));
  }
  if (!includePages) {
    members = members.filter((member) => member.title.includes("Category:"));
  }
  if (fullName) {
    members = members.map((member) => member.title);
  } else {
    members = members.map((member) => member.title.split(":")[1]);
  }
  members = members = members.filter((member) => filterTitle(member));
  return members.map((member) => processTitle(member));
}

/**
 * @param {string} category
 * @param {CategoryObject} [options]
 * @returns {Promise<Record<string, string>>}
 */
async function getCategoryMembersObject(category, options) {
  const members = await getCategoryMembers(category, options);
  const obj = {};
  members.forEach((member) => (obj[toCamelCase(member)] = member));
  return obj;
}

/**
 * @param {string} category
 * @param {string} name
 * @param {CategoryObject} [options]
 */
async function quickSaveCategoryMembers(category, name, options) {
  const obj = await getCategoryMembersObject(category, options);
  await saveObject(obj, quickPath(name));
}

const createSimpleCategoriesAndNames = async () => {
  for (const category of SIMPLE_CATEGORIES) {
    const CATEGORY_OUTPUT_JSON = path.resolve(
      __dirname,
      `../src/index/categories/${toKebabCase(category)}.json`,
    );
    const NAME_OUTPUT_JSON = path.resolve(
      __dirname,
      `../src/index/names/${toKebabCase(category)}.json`,
    );
    let pages = await fetchCategoryMembers(category);
    pages = pages.filter((page) => !page.title.includes("Category:"));
    const namespace = pages[0].title.split(":")[0];
    const titles = pages.map((page) => page.title.split(":")[1]);
    const categories = {};
    const names = {};

    // Process in batches of BATCH_SIZE
    for (let i = 0; i < titles.length; i += BATCH_SIZE) {
      const batch = titles.slice(i, i + BATCH_SIZE);

      console.log(
        `Batch ${Math.floor(i / BATCH_SIZE) + 1} of ${Math.ceil(
          titles.length / BATCH_SIZE,
        )}`,
      );

      const batchResults = await Promise.all(
        batch.map(async (title) => {
          const pageName = `${namespace}:${title}`;
          const categoryPages = await fetchPageCategories(pageName);
          const categoryTitles = categoryPages.map(
            (page) => page.title.split("Category:")[1],
          );
          return {
            title: title,
            categories: categoryTitles,
          };
        }),
      );

      // Merge batch results into the final object
      for (const result of batchResults) {
        categories[result.title] = result.categories;
        names[toCamelCase(result.title)] = result.title;
      }
    }

    // Write JSON
    await saveObject(categories, CATEGORY_OUTPUT_JSON);
    await saveObject(names, NAME_OUTPUT_JSON);
    console.log(
      `JSONs saved to ${CATEGORY_OUTPUT_JSON} and ${NAME_OUTPUT_JSON}`,
    );
  }
};

const createCustomNames = async () => {
  const equipmentClasses = await getCategoryMembersObject("Equipment classes", {
    includePages: false,
    includeCategories: true,
  });
  const weaponClasses = await getCategoryMembersObject("Weapon classes", {
    includePages: false,
    includeCategories: true,
  });
  Object.assign(equipmentClasses, weaponClasses);
  await saveObject(equipmentClasses, quickPath("equipment-classes"));
  await saveObject(weaponClasses, quickPath("weapon-classes"));
  await quickSaveCategoryMembers("Powered abilities", "power-sources", {
    includePages: false,
    includeCategories: true,
    filterTitle: (title) => title.includes("powered abilities"),
    processTitle: (title) =>
      title.replace("ly", "").replace(" powered abilities", ""),
  });
  await quickSaveCategoryMembers("Effects", "effect-types", {
    includePages: false,
    includeCategories: true,
    processTitle: (title) => title.replace(" effects", ""),
  });
  await quickSaveCategoryMembers("Creatures by trait", "traits", {
    includePages: false,
    includeCategories: true,
    processTitle: (title) => title.replace(" creatures", ""),
  });
  await quickSaveCategoryMembers("Elemental abilities", "elements", {
    includePages: false,
    includeCategories: true,
    filterTitle: (title) => title.includes("abilities"),
    processTitle: (title) => title.replace(" element abilities", ""),
  });
  await quickSaveCategoryMembers("Common animal creatures", "common-animals", {
    includePages: true,
    includeCategories: false,
  });
  await quickSaveCategoryMembers("Undead creatures", "undead", {
    includePages: true,
    includeCategories: false,
  });
  await quickSaveCategoryMembers("Player character creatures", "humanoids", {
    includePages: true,
    includeCategories: false,
  });
  await quickSaveCategoryMembers(
    "Weapon fighting styles",
    "weapon-fighting-styles",
    {
      includePages: true,
      includeCategories: false,
      processTitle: (title) => title.replace(" Fighting Style", ""),
    },
  );
  await quickSaveCategoryMembers("Material properties", "material-properties", {
    includePages: true,
    includeCategories: false,
  });
  await quickSaveCategoryMembers("Magical properties", "magical-properties", {
    includePages: true,
    includeCategories: false,
  });
};

/**
 * @param {Record<string, string>} choices
 * @param {string} namespace
 * @param {string} name
 * @param {string} [suffix]
 * @returns {Promise<void>}
 */
async function quickSaveContent(choices, namespace, name, suffix = "") {
  const pageNames = Object.values(choices);
  const obj = {};
  for (const pageName of pageNames) {
    obj[toCamelCase(pageName)] = await fetchWikiPageHTML(
      `${namespace}:${pageName}${suffix}`,
    );
  }
  await saveObject(obj, relPath(`index/content/${name}`));
}

const createCustomContent = async () => {
  await quickSaveContent(classes, "Class", "classes", "/Description");
  await quickSaveContent(tradecrafts, "Tradecraft", "tradecrafts");
  await quickSaveContent(damageTypes, "Damage", "damageTypes");
  await quickSaveContent(drainTypes, "Drain", "drainTypes");
  await quickSaveContent(
    weaponFightingStyles,
    "Property",
    "weaponFightingStyles",
    " Fighting Style",
  );
};

await createCustomContent();
await createCustomNames();
await createSimpleCategoriesAndNames();
