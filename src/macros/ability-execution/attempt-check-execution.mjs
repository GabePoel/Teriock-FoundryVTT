const data = /** @type {Teriock.HookData.UseAbility} */ scope.data;
const options = foundry.utils.deepClone(data.execution.options);
const tradecraft = await tm.dialogs.selectTradecraftDialog();
await actor.system.rollTradecraft(tradecraft, options);
