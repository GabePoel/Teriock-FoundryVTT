import { extractPack } from "@foundryvtt/foundryvtt-cli";
import { promises as fs } from "fs";
import path from "path";

const MODULE_ID = process.cwd();
const yaml = false;
const expandAdventures = true;
const folders = true;

const packs = await fs.readdir("./packs");
for (const pack of packs) {
  if (pack === ".gitattributes" || pack === ".DS_Store") continue;
  console.log("Unpacking " + pack);
  const directory = `./src/packs/${pack}`;
  try {
    for (const file of await fs.readdir(directory)) {
      const filePath = path.join(directory, file);
      if (file.endsWith(yaml ? ".yml" : ".json")) await fs.unlink(filePath);
      else fs.rm(filePath, { recursive: true });
    }
  } catch (error) {
    if (error.code === "ENOENT") console.log("No files inside of " + pack);
    else console.log(error);
  }
  await extractPack(
    `${MODULE_ID}/packs/${pack}`,
    `${MODULE_ID}/src/packs/${pack}`,
    {
      yaml,
      transformName,
      expandAdventures,
      folders,
    },
  );
}

/**
 * Prefaces the document with its type
 * @param {object} doc - The document data
 */
function transformName(doc, context) {
  const safeFileName = doc.name.replace(/[^a-zA-Z0-9А-я]/g, "_");
  let type = doc._key?.split("!")[1];
  if (!type) {
    if ("playing" in doc) type = "playlist";
    else if (doc.sorting) type = `folder_${doc.type}`;
    else if (doc.walls) type = "scene";
    else if (doc.results) type = "rollTable";
    else if (doc.pages) type = "journal";
    else type = doc.type;
  }
  const prefix = ["actors", "items"].includes(type) ? doc.type : type;

  let name = `${doc.name ? `${prefix}_${safeFileName}_${doc._id}` : doc._id}.${yaml ? "yml" : "json"}`;
  if (context.folder) name = path.join(context.folder, name);
  return name;
}
