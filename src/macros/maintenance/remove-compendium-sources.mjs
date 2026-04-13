await tm.utils.progressBar(
  await tm.dialogs.selectCompendiumsDialog(),
  _loc("TERIOCK.DIALOGS.RemoveCompendiumSource.messageUnnamed"),
  /** @param {CompendiumCollection<TeriockDocument>} p */ async (p) => {
    if (!p.locked) {
      await p.getIndex();
      const indexes = tm.sort.docSort(
        p.index.contents.filter((d) => !d?.system?._sup),
      );
      await tm.utils.progressBar(
        indexes,
        _loc("TERIOCK.DIALOGS.RemoveCompendiumSource.messageNamed", {
          name: _loc(p.title),
        }),
        async (i) => {
          const doc = await tm.resolve.resolveDocument(i);
          await doc.update({ "_stats.compendiumSource": null });
        },
        { batch: 20 },
      );
    }
  },
);
