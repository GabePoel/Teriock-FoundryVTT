const equipmentPack = game.teriock.packs.equipment();
const equipmentFolders = equipmentPack.folders;
const assignedProperties = ["Magelore", "Master Crafted", "Runic", "Silver"];

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
const progress = ui.notifications.info(`Pulling equipment from wiki.`, {
  progress: true,
});
let pct = 0;

const combinations = generateCombinations(assignedProperties);

combinations.sort((a, b) => {
  if (a.length !== b.length) return a.length - b.length;
  return a.join(" ").localeCompare(b.join(" "));
});

for (const combo of combinations) {
  const name = combo.join(" ") + " Equipment";
  propertyMap[name] = combo;
}

for (const [folderName, properties] of Object.entries(propertyMap)) {
  ui.notifications.warn(folderName);
  let folder = equipmentFolders.getName(folderName);
  if (!folder) {
    folder = await CONFIG.Folder.documentClass.create(
      {
        name: folderName,
        type: "Item",
      },
      {
        pack: "teriock.equipment",
      },
    );
  }

  for (const [_e, eo] of Object.entries(CONFIG.TERIOCK.equipmentType)) {
    let generatedName = properties.join(" ") + " " + eo;
    generatedName = generatedName.trim();

    const matches = equipmentPack.index.filter((e) => e.name === generatedName);
    for (const match of matches) {
      const entry = await game.teriock.api.utils.fromUuid(match.uuid);
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

    pct +=
      1 /
      (Object.keys(CONFIG.TERIOCK.equipmentType).length *
        Object.keys(propertyMap).length);
    progress.update({
      pct: pct,
      message: `Pulling ${generatedName} from wiki.`,
    });

    const TeriockItem = CONFIG.Item.documentClass;
    /** @type {TeriockEquipment} */
    const equipment = await TeriockItem.create(itemData, {
      pack: "teriock.equipment",
    });
    await equipment.system.wikiPull({
      notify: false,
    });

    if (properties.length >= 1) {
      for (const property of properties) {
        if (
          !equipment.effectKeys?.property?.has(
            game.teriock.api.utils.toCamelCase(property),
          )
        ) {
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
