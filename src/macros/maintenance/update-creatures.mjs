const speciesCompendium = game.teriock.packs.species();
const creatureCompendium = game.teriock.packs.creatures();

const allSpecies = speciesCompendium.index.contents;
const speciesFolders = speciesCompendium.folders;
const allCreatures = creatureCompendium.index.contents;
const creaturesFolders = creatureCompendium.folders;

for (const folderEntry of speciesFolders.values()) {
  if (!creaturesFolders.getName(folderEntry.name)) {
    await Folder.create(
      {
        name: folderEntry.name,
        type: "Actor",
      },
      {
        pack: "teriock.creatures",
      },
    );
  }
}

for (const folderEntry of speciesFolders.values()) {
  const speciesFolder = /** @type {TeriockFolder} */ await fromUuid(
    folderEntry.uuid,
  );
  if (speciesFolder.folder) {
    const parentFolderName = speciesFolder.folder.name;
    const parentFolderId = creaturesFolders.getName(parentFolderName).id;
    const creatureFolder = await fromUuid(
      creaturesFolders.getName(speciesFolder.name).uuid,
    );
    await creatureFolder.update({
      folder: parentFolderId,
    });
  }
}

const progress = foundry.ui.notifications.info(`Synchronizing all creatures.`, {
  pct: 0.01,
  progress: true,
});

// Helper function to process a single species
async function processSpecies(
  speciesEntry,
  allCreatures,
  speciesFolders,
  creaturesFolders,
) {
  const species = /** @type {TeriockSpecies} */ await foundry.utils.fromUuid(
    speciesEntry.uuid,
  );
  const creatureEntry = allCreatures.find((c) => c.name === speciesEntry.name);
  /** @type {TeriockActor} */
  let creature;
  const speciesFolder = speciesFolders.get(speciesEntry.folder);
  const creatureFolder = creaturesFolders.getName(speciesFolder.name);
  if (!creatureEntry) {
    creature = await Actor.create(
      {
        name: species.name,
        img: species.img,
        type: "creature",
        folder: creatureFolder.id,
      },
      { pack: "teriock.creatures" },
    );
  } else {
    creature = await foundry.utils.fromUuid(creatureEntry.uuid);
  }
  const mechanics = creature.items.filter((i) => i.type === "mechanic");
  const mechanicIds = mechanics.map((m) => m.id);
  await creature.deleteEmbeddedDocuments("Item", mechanicIds);
  await creature.system.hardRefreshFromIndex();
  await creature.update({
    folder: creatureFolder.id,
    "system.hp.value": creature.system.hp.max,
    "system.mp.value": creature.system.mp.max,
    "system.wither.value": 20,
  });
}

const batchSize = 10;
let processedCount = 0;

for (let i = 0; i < allSpecies.length; i += batchSize) {
  const batch = allSpecies.slice(i, i + batchSize);

  await Promise.all(
    batch.map((speciesEntry) =>
      processSpecies(
        speciesEntry,
        allCreatures,
        speciesFolders,
        creaturesFolders,
      ),
    ),
  );

  processedCount += batch.length;
  const pct = processedCount / allSpecies.length;
  progress.update({
    pct: pct,
    message: `Synchronized ${processedCount} of ${allSpecies.length} creatures.`,
  });
}

progress.update({
  pct: 1,
  message: "Synchronization complete.",
});
