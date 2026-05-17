const dealsDamage = scope.execution.activations.some(a => a.type === "roll" && a.impact === "damage");
if (scope.execution.source.system.spell && dealsDamage) {
  scope.effect?.delete();
}
