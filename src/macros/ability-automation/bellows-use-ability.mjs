const dealsDamage = scope.execution.message?.system.activations.some(
  (a) => a.type === "roll" && a.roll === "damage",
);
if (scope.execution.source.system.spell && dealsDamage) {
  scope.execution?.effect?.delete();
}
