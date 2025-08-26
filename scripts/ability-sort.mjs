import { writeFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import {
  fetchCategoryAbilities,
  fetchPageCategories,
} from "../src/module/helpers/wiki/_module.mjs";

// Resolve relative paths for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OUTPUT_JSON = path.resolve(
  __dirname,
  "../src/icons/ability-categories.json",
);
const OUTPUT_CSV = path.resolve(
  __dirname,
  "../src/icons/ability-categories.csv",
);

const BATCH_SIZE = 100;

// CSV helpers
const escapeCsvField = (value) => {
  const str = String(value ?? "");
  // Escape " by doubling it, and wrap in quotes always (handles commas/newlines/semicolons safely)
  return `"${str.replaceAll(`"`, `""`)}"`;
};

const objectToCsv = (abilityToCategories) => {
  const header = ["Ability", "Categories"];
  const lines = [header.map(escapeCsvField).join(",")];

  // Deterministic order
  const abilities = Object.keys(abilityToCategories).sort((a, b) =>
    a.localeCompare(b),
  );

  for (const ability of abilities) {
    // Normalize + sort categories for consistency
    const categories = (abilityToCategories[ability] ?? [])
      .map((c) => String(c).trim())
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));

    // Join categories with "; " to avoid clashing with CSV commas
    const catField = categories.join("; ");
    lines.push([escapeCsvField(ability), escapeCsvField(catField)].join(","));
  }

  return lines.join("\n") + "\n";
};

const run = async () => {
  const abilities = await fetchCategoryAbilities("Abilities");
  const abilityCategories = {};

  // Process in batches of BATCH_SIZE
  for (let i = 0; i < abilities.length; i += BATCH_SIZE) {
    const batch = abilities.slice(i, i + BATCH_SIZE);

    console.log(
      `Batch ${Math.floor(i / BATCH_SIZE) + 1} of ${Math.ceil(
        abilities.length / BATCH_SIZE,
      )}`,
    );

    const batchResults = await Promise.all(
      batch.map(async (a) => {
        const categoryPages = await fetchPageCategories("Ability:" + a);
        const categoryTitles = categoryPages.map(
          (page) => page.title.split("Category:")[1],
        );
        return [a, categoryTitles];
      }),
    );

    // Merge batch results into the final object
    for (const [ability, categories] of batchResults) {
      abilityCategories[ability] = categories;
    }
  }

  // Write JSON (pretty printed)
  await writeFile(
    OUTPUT_JSON,
    JSON.stringify(abilityCategories, null, 2),
    "utf-8",
  );
  console.log(`✅ JSON saved to ${OUTPUT_JSON}`);

  // Convert to CSV and write
  const csv = objectToCsv(abilityCategories);
  await writeFile(OUTPUT_CSV, csv, "utf-8");
  console.log(`✅ CSV saved to ${OUTPUT_CSV}`);
};

await run();
