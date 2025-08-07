const classPack = game.teriock.packs.classes();
const classFolders = classPack.folders;

/** @type {object} */
const progress = ui.notifications.info(`Pulling classes from wiki.`, {
  progress: true,
});
let pct = 0;

for (const [a, ao] of Object.entries(CONFIG.TERIOCK.rankOptions)) {
  if (!["Mage", "Semi", "Warrior"].includes(ao.name)) {
    continue;
  }

  // Find or create archetype folder
  let archetypeFolder = classFolders.getName(ao.name);
  if (!archetypeFolder) {
    try {
      archetypeFolder = await Folder.create(
        {
          name: ao.name,
          type: "Item",
        },
        { pack: "teriock.classes" },
      );
    } catch (e) {
      console.error(`Failed to create archetype folder '${ao.name}':`, e);
    }
  }

  const classes = ao.classes;

  for (const [c, co] of Object.entries(classes)) {
    // Find or create class folder
    let classFolder = classFolders.getName(co.name);
    if (!classFolder) {
      try {
        classFolder = await Folder.create(
          {
            name: co.name,
            type: "Item",
            folder: archetypeFolder?.id,
          },
          { pack: "teriock.classes" },
        );
      } catch (e) {
        console.error(`Failed to create class folder '${co.name}':`, e);
      }
    }

    for (let r = 1; r < 6; r++) {
      const name = `Rank ${r} ${co.name}`;

      await classPack.getIndex();
      let rank = classPack.index.find((e) => e.name === name);
      rank = await foundry.utils.fromUuid(rank.uuid);

      // Create new item
      const itemData = {
        name,
        type: "rank",
        folder: classFolder?.id,
        system: {
          archetype: a,
          className: c,
          classRank: r,
        },
      };

      pct += 1 / (15 * 5);
      progress.update({ pct: pct, message: `Pulling ${name} from wiki.` });

      try {
        const TeriockItem = CONFIG.Item.documentClass;
        if (!rank) {
          rank = /** @type {TeriockRank} */ await TeriockItem.create(itemData, {
            pack: "teriock.classes",
          });
        }
        await rank.system.wikiPull({
          notify: false,
        });
      } catch (e) {
        console.error(`Error creating or processing '${name}':`, e);
      }
    }
  }
}
