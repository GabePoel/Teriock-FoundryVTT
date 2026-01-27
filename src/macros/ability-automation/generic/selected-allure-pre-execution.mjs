const data = /** @type {Teriock.HookData.UseAbility} */ scope.data;
const uuids = await tm.dialogs.conditionDialog("allured");
await tm.html.addTrackersToExecution(data.execution, "allured", uuids);
