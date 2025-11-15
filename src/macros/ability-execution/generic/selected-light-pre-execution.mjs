const data = /** @type {Teriock.HookData.UseAbility} */ scope.data;
const uuids = await tm.dialogs.lightedToDialog();
await tm.html.addTrackersToExecution(data.execution, "lighted", uuids);
