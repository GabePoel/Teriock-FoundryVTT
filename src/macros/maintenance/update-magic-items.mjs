const magicItemsPack = game.teriock.packs.magicItems;

const progress = ui.notifications.info("Refreshing all magic items.", {
  pct: 0.01,
  progress: true,
});

async function processMagicItem(id) {
  let item =
    /** @type {TeriockEquipment} */ await magicItemsPack.getDocument(id);
  await item.system.refreshFromCompendiumSource();
}

const numMagicItems = magicItemsPack.index.contents.length;

const batchSize = 25;
let processedCount = 0;

try {
  for (let i = 0; i < numMagicItems; i += batchSize) {
    const batch = magicItemsPack.contents.slice(i, i + batchSize);
    await Promise.all(batch.map((item) => processMagicItem(item.id)));
    processedCount += batch.length;
    const pct = Math.min(processedCount / numMagicItems, 0.99);
    progress.update({
      pct: pct,
      message: `Refreshed ${processedCount} of ${numMagicItems} magic items...`,
    });
  }
  progress.update({
    pct: 1,
    message: "Done.",
  });
  ui.notifications.success(
    `Successfully refreshed ${numMagicItems} magic items.`,
  );
} catch (error) {
  progress.update({
    pct: 1,
    message: `Error: ${error.message}`,
  });
}
