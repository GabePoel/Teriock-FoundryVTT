await tm.utils.progressBar(
  Object.values(TERIOCK.index.abilities),
  "Pulling Abilities",
  async (name) => {
    let item = game.teriock.packs.abilities.index.find((i) => i.name === name);
    if (!item) {
      item = await game.teriock.Item.create(
        { name, type: "wrapper" },
        { pack: "teriock.abilities" },
      );
    } else {
      item = await fromUuid(item.uuid);
    }
    let effect = item.abilities.find((a) => a.name === name);
    if (!effect) {
      const data = { name, type: "ability" };
      effect = await item.createChildDocuments("ActiveEffect", [data]);
    }
    await effect.system.wikiPull({ notify: false });
    if (item.img !== effect.img) {
      await item.update({ img: effect.img });
    }
  },
  { batch: 50 },
);
