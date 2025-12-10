await game.teriock.packs.magicItems.getIndex();
await tm.utils.progressBar(
  game.teriock.packs.magicItems.index.contents,
  "Refreshing Magic Items",
  async (i) => {
    const item = await tm.utils.resolveDocument(i);
    await item.system.refreshFromCompendiumSource();
  },
);
