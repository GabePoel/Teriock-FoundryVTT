await tm.utils.progressBar(
  await tm.dialogs.selectCompendiumsDialog(),
  "Refreshing Compendium Sources",
  /** @param {CompendiumCollection<TeriockDocument>} p */ async p => {
    if (!p.locked) {
      await p.getIndex();
      const indexes = tm.sort.docSort(p.index.contents.filter(d => !d?.system?._sup));
      await tm.utils.progressBar(
        indexes,
        `Refreshing ${_loc(p.title)} Sources`,
        async i => {
          const doc = await tm.resolve.resolveDocument(i);
          if (doc?.documentMetadata.common) {
            await tm.resolve.inferChildCompendiumSources(doc);
          }
        },
        { batch: 50 },
      );
    }
  },
);
