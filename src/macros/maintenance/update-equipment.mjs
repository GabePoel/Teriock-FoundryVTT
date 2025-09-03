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
      for (let i = 0; i < rest.length; i++)
        combine([...prefix, rest[i]], rest.slice(i + 1), depth - 1);
    };
    combine([], arr, len);
  }
  return results;
}

const propertyMap = { "Basic Equipment": [] };

const progress = ui.notifications.info(`Pulling equipment from wiki.`, {
  progress: true,
});
let pct = 0;

const combinations = generateCombinations(assignedProperties);
combinations.sort((a, b) =>
  a.length !== b.length
    ? a.length - b.length
    : a.join(" ").localeCompare(b.join(" ")),
);
for (const combo of combinations)
  propertyMap[combo.join(" ") + " Equipment"] = combo;

const limiter = (limit) => {
  let active = 0,
    queue = [];
  const next = () => {
    if (!queue.length || active >= limit) return;
    active++;
    const { fn, resolve, reject } = queue.shift();
    Promise.resolve(fn())
      .then(resolve, reject)
      .finally(() => {
        active--;
        next();
      });
  };
  return (fn) =>
    new Promise((resolve, reject) => {
      queue.push({ fn, resolve, reject });
      next();
    });
};

const TeriockItem = CONFIG.Item.documentClass;
const equipmentTypes = Object.values(CONFIG.TERIOCK.index.equipment);
const totalJobs = equipmentTypes.length * Object.keys(propertyMap).length;
let completed = 0;

const folders = Object.fromEntries(
  await Promise.all(
    Object.entries(propertyMap).map(async ([folderName, properties]) => {
      ui.notifications.warn(folderName);
      let folder = equipmentFolders.getName(folderName);
      if (!folder) {
        folder = await CONFIG.Folder.documentClass.create(
          {
            name: folderName,
            type: "Item",
          },
          { pack: "teriock.equipment" },
        );
      }
      return [folderName, { id: folder.id, properties }];
    }),
  ),
);

const limit = limiter(8);
await Promise.all(
  Object.entries(folders).flatMap(([_, { id, properties }]) =>
    equipmentTypes.map((eo) =>
      limit(async () => {
        const generatedName = `${properties.join(" ")} ${eo}`.trim();

        const matches = equipmentPack.index.filter(
          (e) => e.name === generatedName,
        );
        await Promise.all(
          matches.map(async (m) => {
            const entry = await foundry.utils.fromUuid(m.uuid);
            if (entry) await entry.delete();
          }),
        );

        const equipment = await TeriockItem.create(
          {
            name: generatedName,
            type: "equipment",
            folder: id,
            system: { equipmentType: eo },
          },
          { pack: "teriock.equipment" },
        );
        await equipment.system.wikiPull({ notify: false });

        if (properties.length >= 1) {
          for (const property of properties) {
            if (
              !equipment.effectKeys.property.has(
                game.teriock.api.string.toCamelCase(property),
              )
            ) {
              await game.teriock.api.fetch.importProperty(equipment, property);
            }
          }
          if (equipment.system.equipmentClasses.has("bodyParts")) {
            try {
              await equipment.delete();
            } catch {}
          }
        }

        completed++;
        pct = completed / totalJobs;
        progress.update({
          pct,
          message: `Pulling ${generatedName} from wiki.`,
        });
      }),
    ),
  ),
);

progress.update({ pct: 1 });
