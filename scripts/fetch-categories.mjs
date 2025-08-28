import { writeFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import {
  fetchCategoryMembers,
  fetchPageCategories,
} from "../src/module/helpers/wiki/_module.mjs";
import { toKebabCase } from "./update-options.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BATCH_SIZE = 100;
const CATEGORIES = [
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

const run = async () => {
  for (const category of CATEGORIES) {
    const OUTPUT_JSON = path.resolve(
      __dirname,
      `../src/icons/build/categories/${toKebabCase(category)}.json`,
    );
    let pages = await fetchCategoryMembers(category);
    pages = pages.filter((page) => !page.title.includes("Category:"));
    const namespace = pages[0].title.split(":")[0];
    const titles = pages.map((page) => page.title.split(":")[1]);
    const categories = {};

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
      }
    }

    // Write JSON
    await writeFile(OUTPUT_JSON, JSON.stringify(categories, null, 2), "utf-8");
    console.log(`JSON saved to ${OUTPUT_JSON}`);
  }
};

await run();
