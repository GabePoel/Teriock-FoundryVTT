const data = /** @type {Teriock.HookData.UseAbility} */ scope.data;
const transformationLevels = TERIOCK.options.effect.transformationLevel;
const chosenTransformationLevel = await tm.dialogs.selectDialog(
  transformationLevels,
  {
    hint: game.i18n.localize("TERIOCK.DIALOGS.Select.TransformationLevel.hint"),
    hintHtml: TERIOCK.content.conditions.transformed,
    hintTitle: game.i18n.localize(
      "TERIOCK.DIALOGS.Select.TransformationLevel.hintTitle",
    ),
    initial: "minor",
    label: game.i18n.localize(
      "TERIOCK.DIALOGS.Select.TransformationLevel.label",
    ),
    other: true,
    title: game.i18n.localize(
      "TERIOCK.DIALOGS.Select.TransformationLevel.title",
    ),
  },
);
let dc = "none";
if (chosenTransformationLevel === "minor") {
  dc = 6;
}
if (chosenTransformationLevel === "full") {
  dc = 12;
}
if (chosenTransformationLevel === "greater") {
  dc = 18;
}
const buttons = data.execution.buttons.filter(
  (b) => b.dataset?.action === "feat" && b.dataset?.attribute === "int",
);
for (const b of buttons) {
  b.dataset.threshold = dc;
}
for (let i = 0; i < data.execution.rolls.length; i++) {
  const r = data.execution.rolls[i];
  if (r.styles.dice.classes === "feat") {
    if (typeof dc === "number") {
      const newRoll = new game.teriock.Roll(
        `${dc}`,
        {},
        {
          styles: {
            dice: {
              classes: "feat",
            },
            total: {
              classes: "feat",
              icon: TERIOCK.display.icons.interaction.feat,
            },
          },
          flavor: transformationLevels[chosenTransformationLevel] + " DC",
        },
      );
      await newRoll.evaluate();
      data.execution.rolls[i] = newRoll;
    } else {
      data.execution.rolls.pop();
    }
  }
}
