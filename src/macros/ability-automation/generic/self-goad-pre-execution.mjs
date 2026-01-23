const data = /** @type {Teriock.HookData.UseAbility} */ scope.data;
const uuid = data.execution.actor.defaultToken.document.uuid;
await tm.html.addTrackerToExecution(data.execution, "goaded", uuid);
