const basicAbilitiesItem = await tm.fetch.getItem("Basic Abilities", "essentials");

const basicAbilityNames = await teriock.helpers.wiki.fetchCategoryAbilities("Basic abilities");

const progress = ui.notifications.info(`Pulling basic abilities from wiki.`, {
  progress: true,
});
let pct = 0;

for (const basicAbilityName of basicAbilityNames) {
  let basicAbility = basicAbilitiesItem.abilities.find((a) => a.name === basicAbilityName);
  if (!basicAbility) {
    basicAbility = await tm.create.ability(basicAbilitiesItem, basicAbilityName);
  } else {
    await basicAbility.system.wikiPull({ notify: false });
  }
  pct += 1 / basicAbilityNames.length;
  progress.update({
    pct: pct,
    message: `Pulling ${basicAbilityName} from wiki.`,
  });

}
const toDelete = basicAbilitiesItem.abilities
  .filter((a) => !basicAbilityNames.includes(a.name))
  .map((a) => a.id);
await basicAbilitiesItem.deleteEmbeddedDocuments("ActiveEffect", toDelete);
progress.update({ pct: 1 });
