await tm.utils.progressBar(
  Object.values(TERIOCK.index.equipment),
  "Pulling Equipment",
  async (name) => {
    let item = game.teriock.packs.equipment.index.find((i) => i.name === name);
    if (!item) {
      item = await game.teriock.Item.create(
        { name, type: "equipment" },
        { pack: "teriock.equipment" },
      );
    } else {
      item = await fromUuid(item.uuid);
    }
    await item.system.wikiPull({ notify: false });
  },
  { batch: 50 },
);
