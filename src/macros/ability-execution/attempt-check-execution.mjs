const options = foundry.utils.deepClone(scope.useData.rollOptions);
const actor = scope.abilityData.actor;
const tradecraft = await game.teriock.api.dialogs.selectTradecraftDialog();
await actor.rollTradecraft(tradecraft, options);
