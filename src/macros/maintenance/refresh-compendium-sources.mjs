let packPct = 0;
const packProgress = ui.notifications.info("Refreshing Compendium Sources", {
  pct: packPct,
  progress: true,
});
const packs = game.packs.contents.filter(
  (p) => p.collection !== "teriock.creatures",
);
for (const p of packs) {
  packPct += 1 / packs.length;
  packProgress.update({
    message: `Refreshing ${p.title}`,
    pct: packPct,
  });
  await p.getIndex();
  const indexes = tm.utils.docSort(
    p.index.contents.filter((d) => !d?.system?._sup),
  );
  let indexPct = 0;
  const indexProgress = ui.notifications.info("Refreshing Documents", {
    pct: indexPct,
    progress: true,
  });
  for (const index of indexes) {
    indexPct += 1 / indexes.length;
    indexProgress.update({
      message: `Refreshing ${index.name}`,
      pct: indexPct,
    });
    const doc = await tm.utils.resolveDocument(index);
    if (["Actor", "ActiveEffect", "Item"].includes(doc.documentName)) {
      await tm.utils.inferChildCompendiumSources(doc);
    }
  }
  indexProgress.update({ pct: 1 });
}
packProgress.update({ pct: 1 });
