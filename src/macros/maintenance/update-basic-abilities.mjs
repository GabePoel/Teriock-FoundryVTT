const basicAbilitiesItem = await tm.fetch.getDocument(
  "Basic Abilities",
  "essentials",
);

const basicAbilityNames =
  await teriock.helpers.wiki.fetchCategoryAbilities("Basic abilities");

const progress = ui.notifications.info(`Pulling basic abilities from wiki.`, {
  progress: true,
});

await tm.utils.ensureChildren(basicAbilitiesItem, "ability", basicAbilityNames);
const toDelete = basicAbilitiesItem.abilities
  .filter((a) => !basicAbilityNames.includes(a.name))
  .map((a) => a.id);
await basicAbilitiesItem.deleteEmbeddedDocuments("ActiveEffect", toDelete);
await tm.utils.inferChildCompendiumSources(basicAbilitiesItem);
await basicAbilitiesItem.system.refreshFromCompendiumSource();
progress.update({ pct: 1 });
