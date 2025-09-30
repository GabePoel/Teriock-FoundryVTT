const speciesCompendium = game.teriock.packs.species();
const creatureCompendium = game.teriock.packs.creatures();

const allSpecies = speciesCompendium.index.contents;
const speciesFolders = speciesCompendium.folders;
const allCreatures = creatureCompendium.index.contents;
const creaturesFolders = creatureCompendium.folders;

speciesFolders.forEach(async (folderEntry) => {
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
});

allSpecies.forEach(async (speciesEntry) => {
  const species = /** @type {TeriockSpecies} */ await foundry.utils.fromUuid(
    speciesEntry.uuid,
  );
  const creatureEntry = allCreatures.find((c) => c.name === speciesEntry.name);
  /** @type {TeriockActor} */
  let creature;
  const speciesFolder = speciesFolders.get(speciesEntry.folder);
  console.log(speciesFolder);
  const creatureFolder = creaturesFolders.getName(speciesFolder.name);
  console.log(creatureFolder);
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
  const existingSpecies = creature.species.find((s) => s.name === species.name);
  if (!existingSpecies) {
    await creature.createEmbeddedDocuments("Item", [species.toObject()]);
  } else {
    await existingSpecies.update(species.toObject());
  }
  await creature.update({
    folder: creatureFolder.id,
    img: species.img,
    prototypeToken: {
      name: species.name,
      ring: {
        enabled: true,
      },
      texture: {
        src: species.img.replace("icons/creatures", "icons/tokens"),
      },
      width:
        game.teriock.Actor.sizeDefinition(species.system.size.value).length / 5,
      height:
        game.teriock.Actor.sizeDefinition(species.system.size.value).length / 5,
    },
    system: {
      hp: {
        value: creature.system.hp.max,
      },
      mp: {
        value: creature.system.mp.max,
      },
      size: {
        number: {
          saved: species.system.size.value,
        },
      },
    },
  });
});
