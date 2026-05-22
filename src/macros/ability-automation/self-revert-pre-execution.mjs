const transformationLevels = TERIOCK.config.transformation.level;
const chosenTransformationLevel = await tm.dialogs.selectDialog(transformationLevels, {
  hint: _loc("TERIOCK.DIALOGS.Select.TransformationLevel.hint"),
  hintHtml: TERIOCK.content.conditions.transformed,
  hintTitle: _loc("TERIOCK.DIALOGS.Select.TransformationLevel.hintTitle"),
  initial: "minor",
  label: _loc("TERIOCK.DIALOGS.Select.TransformationLevel.label"),
  other: true,
  title: _loc("TERIOCK.DIALOGS.Select.TransformationLevel.title"),
});
let dc = "none";
if (chosenTransformationLevel === "minor") dc = 6;
if (chosenTransformationLevel === "full") dc = 12;
if (chosenTransformationLevel === "greater") dc = 18;
const activations = scope.execution.activations.filter(a => a.type === "feat" && a.options.attribute === "int");
if (typeof dc === "number") {
  for (const a of activations) a._source.options.threshold = `${dc - 2 * scope.execution.heightened}`;
}
for (let i = 0; i < scope.execution.rolls.length; i++) {
  const r = scope.execution.rolls[i];
  if (r.styles.dice.classes === "feat") {
    if (typeof dc === "number") {
      const newRoll = new teriock.dice.rolls.BaseRoll(`${dc}`, {}, {
        flavor: _loc("TERIOCK.DIALOGS.Select.TransformationLevel.flavor", {
          level: transformationLevels[chosenTransformationLevel],
        }),
        styles: { dice: { classes: "feat" }, total: { classes: "feat", icon: TERIOCK.display.icons.interaction.feat } },
      });
      await newRoll.evaluate();
      scope.execution.rolls[i] = newRoll;
    } else {
      scope.execution.rolls.pop();
    }
  }
}
