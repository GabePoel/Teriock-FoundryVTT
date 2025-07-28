const essentialsPack = game.teriock.packs.essentials();

const basicAbilitiesItem = await game.teriock.api.utils.fromUuid(
  essentialsPack.index.find((e) => e.name === "Basic Abilities").uuid,
);

const basicAbilityNames =
  await game.teriock.api.wiki.fetchCategoryAbilities("Basic abilities");

/** @type {object} */
const progress = ui.notifications.info(`Pulling basic abilities from wiki.`, {
  progress: true,
});
let pct = 0;

for (const basicAbilityName of basicAbilityNames) {
  let basicAbility = basicAbilitiesItem.effectTypes.ability.find(
    (a) => a.name === basicAbilityName,
  );
  if (!basicAbility) {
    basicAbility = await game.teriock.api.create.ability(
      basicAbilitiesItem,
      basicAbilityName,
    );
  }
  pct += 1 / basicAbilityNames.length;
  progress.update({
    pct: pct,
    message: `Pulling ${basicAbilityName} from wiki.`,
  });
  
  await basicAbility.system.wikiPull({ notify: false });
}
const toDelete = basicAbilitiesItem.effectTypes.ability
  .filter((a) => !basicAbilityNames.includes(a.name))
  .map((a) => a.id);
await basicAbilitiesItem.deleteEmbeddedDocuments("ActiveEffect", toDelete);
