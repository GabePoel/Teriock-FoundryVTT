const options = foundry.utils.deepClone(scope.execution.options);
const tradecraft = await tm.dialogs.selectTradecraftDialog();
await actor.system.rollTradecraft(tradecraft, options);
