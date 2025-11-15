const data = /** @type {Teriock.HookData.UseAbility} */ scope.data;
const uuid = data.execution.actor.token.uuid;
await tm.html.addTrackerToExecution(data.execution, "lighted", uuid);
