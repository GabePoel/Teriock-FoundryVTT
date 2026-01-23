await tm.utils.progressBar(
  await tm.dialogs.selectCompendiumsDialog(),
  "Refreshing Compendiums",
  /** @param {TeriockCompendiumCollection<TeriockDocument>} p */ async (p) => {
    if (!p.locked) {
      await p.getIndex();
      const indexes = tm.sort.docSort(
        p.index.contents.filter((d) => !d?.system?._sup),
      );
      await tm.utils.progressBar(
        indexes,
        `Refreshing ${p.title}`,
        async (i) => {
          const doc = await tm.resolve.resolveDocument(i);
          if (typeof doc?.system?.refreshFromCompendiumSource === "function") {
            const options = {};
            if (p.collection === "teriock.magicItems") {
              options.deleteChildren = false;
              options.recursive = false;
            }
            await doc.system.refreshFromCompendiumSource(options);
            if (p.collection === "teriock.magicItems") {
              for (const child of await doc.getChildArray()) {
                await child.system.refreshFromCompendiumSource();
              }
            }
          }
        },
        { batch: 20 },
      );
    }
  },
);
