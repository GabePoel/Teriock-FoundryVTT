const data = /** @type {Teriock.HookData.UseAbility} */ scope.data;
const uuids = await tm.dialogs.conditionDialog("frightened");
await tm.html.addTrackersToExecution(data.execution, "frightened", uuids);
