const corePack = game.packs.get("world.teriock-core");
await corePack.getIndex();

// Find or create the "Classes" folder
let classesFolder = corePack.folders.getName("Classes");
if (!classesFolder) {
  try {
    classesFolder = await Folder.create({
      name: "Classes",
      type: "Item"
    }, { pack: "world.teriock-core" });
  } catch (e) {
    console.error("Failed to create 'Classes' folder:", e);
  }
}

const archetypes = CONFIG.TERIOCK.rankOptions;

for (const [a, ao] of Object.entries(archetypes)) {
  // Find or create archetype folder
  let archetypeFolder = game.folders.find(f => f.name === ao.name && f.type === "Item");
  if (!archetypeFolder) {
    try {
      archetypeFolder = await Folder.create({
        name: ao.name,
        type: "Item",
        folder: classesFolder?.id
      }, { pack: "world.teriock-core" });
    } catch (e) {
      console.error(`Failed to create archetype folder '${ao.name}':`, e);
    }
  }

  if (!["everyman", "journeyman", "tradesman"].includes(a)) {
    const classes = ao.classes;

    for (const [c, co] of Object.entries(classes)) {

      // Find or create class folder
      let classFolder = game.folders.find(f => f.name === co.name && f.type === "Item");
      if (!classFolder) {
        try {
          classFolder = await Folder.create({
            name: co.name,
            type: "Item",
            folder: archetypeFolder?.id
          }, { pack: "world.teriock-core" });
        } catch (e) {
          console.error(`Failed to create class folder '${co.name}':`, e);
        }
      }

      for (let r = 1; r < 6; r++) {
        const name = `Rank ${r} ${co.name}`;

        // Refresh index before searching
        await corePack.getIndex();
        const matches = corePack.index.filter(e => e.name === name);
        for (const entry of matches) {
          try {
            const doc = await corePack.getDocument(entry._id);
            await doc.delete();
          } catch (e) {
            console.warn(`Failed to delete existing item '${name}':`, e);
          }
        }

        // Create new item
        const itemData = {
          name,
          type: "rank",
          folder: classFolder?.id,
          system: {
            archetype: a,
            className: c,
            classRank: r
          }
        };

        try {
          const TeriockItem = CONFIG.Item.documentClass;
          await TeriockItem.create(itemData, {
            pack: "world.teriock-core"
          });

          await corePack.getIndex(); // Refresh index again
          const entry = corePack.index.find(e => e.name === name);
          if (entry) {
            const rawDoc = await corePack.getDocument(entry._id);
            console.log(rawDoc);
            await rawDoc.wikiPull?.();
          }
        } catch (e) {
          console.error(`Error creating or processing '${name}':`, e);
        }
      }
    }
  }
}