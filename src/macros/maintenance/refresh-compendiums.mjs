const packIds = scope?.packIds ?? [];
let packs = [];
if (packIds.length) {
  packs = packIds.map(p => game.packs.get(p));
} else {
  packs = await tm.dialogs.selectCompendiumsDialog();
}
await tm.utils.progressBar(
  packs,
  _loc("TERIOCK.DIALOGS.RefreshCompendium.messageUnnamed"),
  /** @param {CompendiumCollection<TeriockDocument>} p */ async p => {
    if (!p.locked) {
      await p.getIndex();
      const indexes = tm.sort.docSort(p.index.contents.filter(d => !d?.system?._sup));
      await tm.utils.progressBar(
        indexes,
        _loc("TERIOCK.DIALOGS.RefreshCompendium.messageNamed", {
          name: _loc(p.title),
        }),
        async i => {
          const doc = await tm.resolve.resolveDocument(i);
          if (doc?.defaultIdentifier) {
            const identifier = doc.defaultIdentifier;
            await doc.update({ "system.identifier": identifier });
          }
          if (typeof doc?.system?.refreshFromSource === "function") {
            const options = {};
            if (p.collection === "teriock.magicItems") {
              options.deleteChildren = false;
              options.recursive = false;
            }
            const docSource = await fromUuid(doc?._stats.compendiumSource);
            await doc?.system.refreshFromSource(docSource, options);
            if (p.collection === "teriock.magicItems") {
              for (const child of (await doc?.getChildArray()) || []) {
                const source = await fromUuid(child._stats.compendiumSource);
                await child.system.refreshFromSource(source);
              }
            }
          }
        },
        { batch: 20 },
      );
    }
  },
);
