const data = /** @type {Teriock.HookData.UseAbility} */ scope.data;
const uuids = await tm.dialogs.frightenedOfDialog();
await tm.html.addTrackersToRollConfig(data.rollConfig, "frightened", uuids);
