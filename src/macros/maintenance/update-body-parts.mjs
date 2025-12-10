await tm.utils.progressBar(
  Object.values(TERIOCK.index.bodyParts),
  "Pulling Body Parts",
  async (name) => {
    let item = game.teriock.packs.bodyParts.index.find((i) => i.name === name);
    if (!item) {
      item = await teriock.Item.create(
        { name, type: "body" },
        { pack: "teriock.bodyParts" },
      );
    } else {
      item = await fromUuid(item.uuid);
    }
    await item.system.wikiPull({ notify: false });
  },
  { batch: 50 },
);
