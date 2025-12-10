const item = await tm.fetch.getDocument("Basic Abilities", "essentials");
const names =
  await teriock.helpers.wiki.fetchCategoryAbilities("Basic abilities");
const progress = ui.notifications.info(`Pulling Basic Abilities`, {
  progress: true,
});
await tm.utils.ensureChildren(item, "ability", names);
const toDelete = item.abilities
  .filter((a) => !names.includes(a.name))
  .map((a) => a.id);
await item.deleteChildDocuments("ActiveEffect", toDelete);
await tm.utils.inferChildCompendiumSources(item);
await item.system.refreshFromCompendiumSource();
progress.update({ pct: 1 });
