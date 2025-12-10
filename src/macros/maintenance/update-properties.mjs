await tm.utils.progressBar(
  Object.values(TERIOCK.index.properties),
  "Pulling Properties",
  async (name) => {
    let item = game.teriock.packs.properties.index.find((i) => i.name === name);
    if (!item) {
      item = await teriock.Item.create(
        { name, type: "wrapper" },
        { pack: "teriock.properties" },
      );
    } else {
      item = await fromUuid(item.uuid);
    }
    let effect = item.properties.find((a) => a.name === name);
    if (!effect) {
      const data = { name, type: "property" };
      effect = await item.createChildDocuments("ActiveEffect", [data]);
    }
    await effect.system.wikiPull({ notify: false });
    if (item.img !== effect.img) {
      await item.update({ img: effect.img });
    }
  },
  { batch: 50 },
);
