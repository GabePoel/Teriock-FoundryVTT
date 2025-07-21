const equipmentPack = /** @type {CompendiumCollection} */ game.packs.get("teriock.equipment");
const equipmentFolders = /** @type {CompendiumCollection<Folder>} */ equipmentPack.folders;
const assignedProperties = ["Magelore", "Master Crafted", "Runic", "Silver"];

const toCamelCase = (str) => {
  return str
    .toLowerCase()
    .replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, (match, index) =>
      index === 0 ? match.toLowerCase() : match.trim().toUpperCase(),
    )
    .replace(/\s+/g, "");
};

function generateCombinations(arr) {
  const results = [];

  for (let len = 1; len <= arr.length; len++) {
    const combine = (prefix, rest, depth) => {
      if (depth === 0) {
        results.push(prefix);
        return;
      }
      for (let i = 0; i < rest.length; i++) {
        combine([...prefix, rest[i]], rest.slice(i + 1), depth - 1);
      }
    };
    combine([], arr, len);
  }

  return results;
}

const propertyMap = {
  "Basic Equipment": [],
};

/** @type {object} */
const progress = ui.notifications.info(`Pulling equipment from wiki.`, { progress: true });
let pct = 0;

const combinations = generateCombinations(assignedProperties);

combinations.sort((a, b) => {
  if (a.length !== b.length) return a.length - b.length;
  return a.join(" ").localeCompare(b.join(" "));
});

for (const combo of combinations) {
  const name = combo.join(" ") + " Equipment";
  const camelProps = combo.map(toCamelCase);
  propertyMap[name] = camelProps;
}

for (const [folderName, properties] of Object.entries(propertyMap)) {
  ui.notifications.warn(folderName);
  let folder = /** @type {Folder} */ equipmentFolders.getName(folderName);
  if (!folder) {
    folder = await Folder.create(
      {
        name: folderName,
        type: "Item",
      },
      {
        pack: "teriock.equipment",
      },
    );
  }

  for (const [e, eo] of Object.entries(CONFIG.TERIOCK.equipment)) {
    let generatedName =
      properties.map((p) => assignedProperties.find((ap) => toCamelCase(ap) === p)).join(" ") + " " + eo;
    generatedName = generatedName.trim();

    const matches = equipmentPack.index.filter((e) => e.name === generatedName);
    for (const match of matches) {
      const entry = await foundry.utils.fromUuid(match.uuid);
      await entry.delete();
    }

    const itemData = {
      name: generatedName,
      type: "equipment",
      folder: folder.id,
      system: {
        equipmentType: eo,
      },
    };

    pct += 1 / (Object.keys(CONFIG.TERIOCK.equipment).length * Object.keys(propertyMap).length);
    progress.update({ pct: pct, message: `Pulling ${generatedName} from wiki.` });

    const TeriockItem = CONFIG.Item.documentClass;
    /** @type {TeriockEquipment} */
    const equipment = await TeriockItem.create(itemData, {
      pack: "teriock.equipment",
    });
    await equipment.system.wikiPull({
      notify: false,
    });

    console.log(properties);

    if (properties.length >= 1) {
      for (const property of properties) {
        if (!equipment.effectKeys?.property?.has(property)) {
          await equipment.system.addProperty(property);
        }
      }
      if (equipment.system.equipmentClasses.has("bodyParts")) {
        try {
          await equipment.delete();
        } catch {}
      }
    }
  }
}