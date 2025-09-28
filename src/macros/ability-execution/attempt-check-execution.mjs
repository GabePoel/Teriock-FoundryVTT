const data = /** @type {Teriock.HookData.UseAbility} */ scope.data;
const options = foundry.utils.deepClone(data.rollConfig.useData.rollOptions);
const actor = data.rollConfig.abilityData.actor;
const tradecraft = await tm.dialogs.selectTradecraftDialog();
await actor.system.rollTradecraft(tradecraft, options);
