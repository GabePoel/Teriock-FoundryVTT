const speciesPack = game.teriock.packs.species;
const creaturePack = game.teriock.packs.creatures;

await speciesPack.getIndex();
await creaturePack.getIndex();

const allSpecies = tm.sort.docSort(
  speciesPack.index.contents.filter((i) => i.type === "species"),
);
const allCreatures = creaturePack.index.contents.filter(
  (a) => a.type === "creature",
);

const speciesFolders = speciesPack.folders;
const creaturesFolders = creaturePack.folders;

for (const f of speciesFolders.contents) {
  if (!creaturesFolders.getName(f.name)) {
    await Folder.create(
      { name: f.name, type: "Actor" },
      { pack: "teriock.creatures" },
    );
  }
}

for (const f of speciesFolders.contents) {
  if (f.folder) {
    const parentId = creaturesFolders.getName(f.folder.name)?.id;
    const child = creaturesFolders.getName(f.name);
    if (parentId && child) await child.update({ folder: parentId });
  }
}

await tm.utils.progressBar(
  allSpecies,
  "Synchronizing all creatures.",
  async (speciesEntry) => {
    const species = await fromUuid(speciesEntry.uuid);
    const creatureEntry = allCreatures.find(
      (c) => c.name === speciesEntry.name,
    );

    const targetFolder = creaturesFolders.getName(
      speciesFolders.get(speciesEntry.folder)?.name,
    );

    let creature;
    if (!creatureEntry) {
      creature = await teriock.Actor.create(species.system.toCreature(), {
        keepEmbeddedIds: true,
        keepId: true,
        pack: "teriock.creatures",
      });
    } else {
      creature = await fromUuid(creatureEntry.uuid);
    }

    await creature.deleteChildDocuments(
      "Item",
      creature.items.map((c) => c.id),
    );
    await creature.createChildDocuments(
      "Item",
      [game.items.fromCompendium(species, { keepId: true, clearSort: true })],
      { keepId: true, keepEmbeddedIds: true, keepSubIds: true },
    );

    let maxDamage = 0,
      maxDamageId = null;
    let maxBv = 0,
      maxBvId = null;

    for (const a of creature.activeArmaments) {
      const dmg = a.system.damage.base.currentValue;
      const bv = a.system.bv.currentValue;
      if (dmg >= maxDamage) {
        maxDamage = dmg;
        maxDamageId = a.id;
      }
      if (bv >= maxBv) {
        maxBv = bv;
        maxBvId = a.id;
      }
    }

    await creature.update({
      folder: targetFolder?.id,
      "system.hp.value": creature.system.hp.max,
      "system.mp.value": creature.system.mp.max,
      "system.wither.value": 20,
      "system.wielding.attacker": maxDamageId,
      "system.wielding.blocker": maxBvId,
    });
  },
  { batch: 10 },
);
