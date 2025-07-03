const corePack = game.packs.get("world.teriock-core");
await corePack.getIndex();

const folder = corePack.folders.getName("Equipment");

for (const [e, eo] of Object.entries(CONFIG.TERIOCK.equipment)) {
  const name = eo;

  const matches = [];
  for (const entry of corePack.index) {
    const doc = await corePack.getDocument(entry._id);
    if (doc.system.equipmentType === name) {
      matches.push(doc);
    }
  }

  for (const doc of matches) {
    await doc.delete();
  }

  const itemData = {
    name,
    type: "equipment",
    folder: folder.id,
    system: {
      equipmentType: name,
    },
  };

  const TeriockItem = CONFIG.Item.documentClass;
  await TeriockItem.create(itemData, {
    pack: "world.teriock-core",
  });

  // Refresh index
  await corePack.getIndex();
  const entry = corePack.index.find((e) => e.name === name);
  const rawDoc = await corePack.getDocument(entry._id);

  console.log(rawDoc);
  await rawDoc.system.wikiPull();
}
