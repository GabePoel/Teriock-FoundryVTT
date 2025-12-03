const speciesCompendium = game.teriock.packs.species;
const creatureCompendium = game.teriock.packs.creatures;
await speciesCompendium.getIndex();
const allSpecies = speciesCompendium.index.contents.filter(
  (i) => i.type === "species",
);
const speciesFolders = speciesCompendium.folders;
const allCreatures = creatureCompendium.index.contents.filter(
  (a) => a.type === "creature",
);
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
  const speciesFolder = await fromUuid(folderEntry.uuid);
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

const progress = ui.notifications.info(`Synchronizing all creatures.`, {
  pct: 0.01,
  progress: true,
});

// Helper function to process a single species
async function processCreature(
  speciesEntry,
  allCreatures,
  speciesFolders,
  creaturesFolders,
) {
  const species = /** @type {TeriockSpecies} */ await fromUuid(
    speciesEntry.uuid,
  );
  const creatureEntry = allCreatures.find((c) => c.name === speciesEntry.name);
  /** @type {TeriockActor} */
  let creature;
  const speciesFolder = speciesFolders.get(speciesEntry.folder);
  const creatureFolder = creaturesFolders.getName(speciesFolder.name);
  if (!creatureEntry) {
    creature = await Actor.create(species.system.toCreature(), {
      pack: "teriock.creatures",
    });
  } else {
    creature = await fromUuid(creatureEntry.uuid);
  }
  await creature.system.refreshFromCompendiumSource();
  for (const s of creature.species) {
    for (const r of s.ranks.filter((r) => r.system.classRank >= 3)) {
      await r.deleteChildDocuments(
        "ActiveEffect",
        r.abilities
          .filter((a) => !a.getFlag("teriock", "defaultAbility"))
          .map((a) => a.id),
      );
    }
  }
  let maxDamage = 0;
  let maxDamageArmament;
  let maxBv = 0;
  let maxBvArmament;
  for (const a of creature.activeArmaments) {
    const damage = game.teriock.Roll.meanValue(a.system.damage.base.value, {});
    const bv = a.system.bv.value;
    if (damage >= maxDamage) {
      maxDamageArmament = a;
      maxDamage = damage;
    }
    if (bv >= maxBv) {
      maxBvArmament = a;
      maxBv = bv;
    }
  }
  await creature.update({
    folder: creatureFolder.id,
    "system.hp.value": creature.system.hp.max,
    "system.mp.value": creature.system.mp.max,
    "system.wither.value": 20,
    "system.wielding.attacker": maxDamageArmament?.id,
    "system.wielding.blocker": maxBvArmament?.id,
  });
}

const batchSize = 10;
let processedCount = 0;

for (let i = 0; i < allSpecies.length; i += batchSize) {
  const batch = allSpecies.slice(i, i + batchSize);

  await Promise.all(
    batch.map((speciesEntry) =>
      processCreature(
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
