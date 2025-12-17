await tm.utils.progressBar(
  game.packs.contents.filter((p) => p.collection !== "teriock.creatures"),
  "Refreshing Compendium Sources",
  /** @param {TeriockCompendiumCollection<TeriockDocument>} p */ async (p) => {
    if (!p.locked) {
      await p.getIndex();
      const indexes = tm.sort.docSort(
        p.index.contents.filter((d) => !d?.system?._sup),
      );
      await tm.utils.progressBar(
        indexes,
        `Refreshing ${p.title} Sources`,
        async (i) => {
          const doc = await tm.resolve.resolveDocument(i);
          if (["Actor", "ActiveEffect", "Item"].includes(doc.documentName)) {
            await tm.resolve.inferChildCompendiumSources(doc);
          }
        },
        { batch: 50 },
      );
    }
  },
);
