const execution = /** @type {AbilityExecution} */ scope.execution;
const dieSize = actor?.flags?.teriockEffect?.braceDieSize || 6;
let formula = `1d${dieSize}`;
if (execution.proficient) {
  formula = `(1 + @p)d${dieSize}`;
}
if (execution.fluent) {
  formula = `(1 + @f)d${dieSize}`;
}
const button = execution.buttons.find(
  (b) => b.dataset.action === "apply-effect",
);
const consequenceData = JSON.parse(button.dataset.normal);
consequenceData.flags = { teriockEffect: { formula } };
button.dataset.normal = JSON.stringify(consequenceData);
button.dataset.crit = JSON.stringify(consequenceData);
