const data = /** @type {Teriock.HookData.UseAbility} */ scope.data;
const transformationLevels = {
  minor: "Minor Transformation",
  full: "Full Transformation",
  greater: "Greater Transformation",
};
const chosenTransformationLevel = await tm.dialogs.selectDialog(
  transformationLevels,
  {
    hint: "If known, select the level of transformation you are attempting to revert from.",
    hintHtml: TERIOCK.content.conditions.transformed,
    hintTitle: "Transformed",
    initial: "minor",
    label: "Level",
    other: true,
    title: "Select Transformation Level",
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
const buttons = data.rollConfig.chatData.system.buttons.filter(
  (b) => b.dataset?.action === "feat-save" && b.dataset?.attribute === "int",
);
for (const b of buttons) {
  b.dataset.dc = dc;
}
for (let i = 0; i < data.rollConfig.chatData.rolls.length; i++) {
  const r = data.rollConfig.chatData.rolls[i];
  if (r.context?.diceClass === "feat") {
    if (typeof dc === "number") {
      const newRoll = new game.teriock.Roll(
        `${dc}`,
        {},
        {
          context: {
            diceClass: "feat",
            totalClass: "feat",
          },
          flavor: transformationLevels[chosenTransformationLevel] + " DC",
        },
      );
      await newRoll.evaluate();
      data.rollConfig.chatData.rolls[i] = newRoll;
    } else {
      data.rollConfig.chatData.rolls.pop();
    }
  }
}
