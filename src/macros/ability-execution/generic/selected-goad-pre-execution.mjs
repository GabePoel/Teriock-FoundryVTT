const data = /** @type {Teriock.HookData.UseAbility} */ scope.data;
const uuids = await tm.dialogs.goadedToDialog();
await tm.html.addTrackersToRollConfig(data.rollConfig, "goaded", uuids);
