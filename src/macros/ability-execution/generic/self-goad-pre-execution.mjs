const data = /** @type {Teriock.HookData.UseAbility} */ scope.data;
const uuid = data.rollConfig.useData.actor.token.uuid;
await tm.html.addTrackerToRollConfig(data.rollConfig, "goaded", uuid);
