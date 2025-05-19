const corePack = game.packs.get("world.teriock-core");
await corePack.getIndex();

const folder = corePack.folders.getName("Equipment");

for (const [e, eo] of Object.entries(CONFIG.TERIOCK.equipment)) {
    const name = eo;
    const matches = corePack.indexfilter(e => e.system.equipmentType === name);
    for (const entry of matches) {
        const doc = await corePack.getDocument(entry._id);
        await doc.delete();
    }

    const itemData = {
        name,
        type: "equipment",
        folder: folder.id,
        system: {
            equipmentType: name,
        }
    };

    const TeriockItem = CONFIG.Item.documentClass;
    await TeriockItem.create(itemData, {
        pack: "world.teriock-core"
    });

    const entry = corePack.index.find(e => e.system.equipmentType === name);
    const rawDoc = await corePack.getDocument(entry._id);
    
    console.log(rawDoc);
    await rawDoc.wikiPull();
}