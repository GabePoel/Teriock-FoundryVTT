const corePack = game.packs.get("world.teriock-core");
await corePack.getIndex();

const archetypes = CONFIG.TERIOCK.rankOptions;

for (const [a, ao] of Object.entries(archetypes)) {
  if (!["everyman", "journeyman", "tradesman"].includes(a)) {
    const classes = ao.classes;

    for (const [c, co] of Object.entries(classes)) {
      for (let r = 1; r < 6; r++) {
        const folder = corePack.folders.getName(co.name);
        const name = `Rank ${r} ${co.name}`;

        const matches = corePack.index.filter(e => e.name === name);
        for (const entry of matches) {
          const doc = await corePack.getDocument(entry._id);
          await doc.delete();
        }

        const itemData = {
          name,
          type: "rank",
          folder: folder.id,
          system: {
            archetype: a,
            className: c,
            classRank: r
          }
        };

        const TeriockItem = CONFIG.Item.documentClass;
        await TeriockItem.create(itemData, {
          pack: "world.teriock-core"
        });

        const entry = corePack.index.find(e => e.name === name);
        const rawDoc = await corePack.getDocument(entry._id);

        console.log(rawDoc);
        await rawDoc.wikiPull();
      }
    }
  }
}
