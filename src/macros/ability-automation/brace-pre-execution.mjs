const execution = scope.execution;
const dieSize = actor?.flags?.teriockEffect?.braceDieSize || 6;
let formula = `1d${dieSize}`;
if (execution.competence.proficient) {
  formula = `(1 + @p)d${dieSize}`;
}
if (execution.competence.fluent) {
  formula = `(1 + @f)d${dieSize}`;
}
const act = execution.activations.find((a) => a.type === "addDocuments");
const consequenceData = act._source.primary.root.data;
consequenceData.flags = { teriockEffect: { formula } };
act._source.primary.root.data = consequenceData;
act._source.secondary.root.data = consequenceData;
