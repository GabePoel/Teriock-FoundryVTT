const data = /** @type {Teriock.HookData.UseAbility} */ scope.data;
const uuids = await tm.dialogs.conditionDialog("goaded");
await tm.html.addTrackersToExecution(data.execution, "goaded", uuids);
