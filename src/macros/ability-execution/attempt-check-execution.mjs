const options = foundry.utils.deepClone(scope.useData.rollOptions);
const actor = scope.abilityData.actor;
const tradecraft = await game.teriock.api.dialog.selectTradecraft();
await actor.rollTradecraft(tradecraft, options);
