import fs from "fs";
import { JSDOM } from "jsdom";
import path from "path";

import { fileURLToPath } from "url";

import { conditions } from "../src/module/helpers/constants/generated/conditions.mjs";
import { magicalProperties } from "../src/module/helpers/constants/generated/magical-properties.mjs";
import { materialProperties } from "../src/module/helpers/constants/generated/material-properties.mjs";
import { properties } from "../src/module/helpers/constants/generated/properties.mjs";
import { fetchWikiPageHTML } from "../src/module/helpers/wiki.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const contentDir = path.resolve(__dirname, "../src/module/content");

const writeModuleFile = (fileName, exportName, entries) => {
  const fileHeader = `// This file was auto-generated on ${new Date().toISOString().split("T")[0]} by scripts/fetch-content.mjs.\n// Do not edit manually.\n\n`;
  const lines = [`${fileHeader}export const ${exportName} = {\n`];

  for (const [key, value] of Object.entries(entries)) {
    lines.push(
      `  ${key}: {\n` +
        `    name: ${JSON.stringify(value.name)},\n` +
        `    id: ${JSON.stringify(key)},\n` +
        `    img: ${JSON.stringify(`systems/teriock/assets/${exportName}/${key}.svg`)},\n` +
        (value._id ? `    _id: ${JSON.stringify(value._id)},\n` : "") +
        (value.statuses
          ? `    statuses: ${JSON.stringify(value.statuses)},\n`
          : "") +
        (value.changes
          ? `    changes: ${JSON.stringify(value.changes)},\n`
          : "") +
        (value.type ? `    type: ${JSON.stringify(value.type)},\n` : "") +
        `    system: {\n      description: ${JSON.stringify(value.content)}\n    },\n` +
        `    content: ${JSON.stringify(value.content)}\n  },`,
    );
  }

  // Remove trailing comma on the last entry
  lines[lines.length - 1] = lines[lines.length - 1].replace(/,$/, "");
  lines.push("};\n");

  fs.writeFileSync(path.join(contentDir, fileName), lines.join("\n"), "utf8");
  console.log(`Wrote ${Object.keys(entries).length} entries to ${fileName}`);
};

const fetchContent = async (map, namespace, staticId, statuses, type) => {
  const results = {};

  console.log(`Fetching content for namespace "${namespace}"...`);
  console.log(`Static ID: ${staticId}, statuses: ${statuses}`);

  for (const [key, name] of Object.entries(map)) {
    const pageTitle = `${namespace}:${name}`;
    console.log(`Fetching HTML for "${pageTitle}"...`);
    const html = await fetchWikiPageHTML(pageTitle);
    if (html) {
      const dom = new JSDOM(html);
      const document = dom.window.document;
      document
        .querySelectorAll(".ability-sub-container")
        .forEach((el) => el.remove());

      results[key] = {
        name,
        content: "",
      };

      if (staticId) {
        results[key]._id = (key + "000000000000000").slice(0, 16);
      }

      if (type) {
        results[key].type = type;
      }

      if (statuses) {
        results[key].statuses = [];
        results[key].changes = [];
        const box = document.querySelector(".condition-box");
        if (box && box.hasAttribute("data-children")) {
          results[key].statuses = box
            .getAttribute("data-children")
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
        }
        const changesMetadata = document.querySelectorAll(
          '.metadata[data-type="change"]',
        );
        console.log(changesMetadata);
        changesMetadata.forEach((change) => {
          const changeKey = change.getAttribute("data-key");
          let changeValueRaw = change.getAttribute("data-value");
          let changeValue =
            !isNaN(changeValueRaw) && changeValueRaw.trim() !== ""
              ? Number(changeValueRaw)
              : changeValueRaw;
          console.log(changeKey);
          results[key].changes.push({
            key: changeKey,
            mode: parseInt(change.getAttribute("data-mode"), 10),
            value: changeValue,
            priority: parseInt(change.getAttribute("data-priority"), 10),
          });
        });
        console.log(results[key].changes);
        console.log(results[key].statuses);
      }

      document.querySelectorAll(".metadata").forEach((el) => el.remove());
      results[key].content = document.body.innerHTML.trim();
    } else {
      console.warn(`No HTML returned for "${pageTitle}"`);
    }
  }

  // console.log(results);
  return results;
};

const run = async () => {
  try {
    /**
     * @typedef {object} ContentDataset
     * @property {Record<string,string>} data
     * @property {string} namespace
     * @property {string} exportName
     * @property {boolean} staticId
     * @property {boolean} statuses
     * @property {string|null} type
     */
    const datasets = /** @type {ContentDataset[]} */ [
      {
        data: conditions,
        namespace: "Condition",
        exportName: "conditions",
        file: "conditions.mjs",
        staticId: true,
        statuses: true,
        type: "condition",
      },
      {
        data: magicalProperties,
        namespace: "Property",
        exportName: "magicalProperties",
        file: "magical-properties.mjs",
        staticId: false,
        statuses: false,
        type: null,
      },
      {
        data: materialProperties,
        namespace: "Property",
        exportName: "materialProperties",
        file: "material-properties.mjs",
        staticId: false,
        statuses: false,
        type: null,
      },
      {
        data: properties,
        namespace: "Property",
        exportName: "properties",
        file: "properties.mjs",
        staticId: false,
        statuses: false,
        type: null,
      },
    ];

    for (const {
      data,
      namespace,
      exportName,
      file,
      staticId,
      statuses,
      type,
    } of datasets) {
      const content = await fetchContent(
        data,
        namespace,
        staticId,
        statuses,
        type,
      );
      writeModuleFile(file, exportName, content);
    }
  } catch (err) {
    console.error("Error fetching content:", err);
  }
};

await run();
