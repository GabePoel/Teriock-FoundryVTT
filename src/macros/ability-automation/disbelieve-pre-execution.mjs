const data = /** @type {Teriock.HookData.UseAbility} */ scope.data;
const illusionLevels = TERIOCK.options.effect.illusionLevel;
const chosenIllusionLevel = await tm.dialogs.selectDialog(illusionLevels, {
  hint: game.i18n.localize("TERIOCK.DIALOGS.Select.IllusionLevel.hint"),
  hintHtml: TERIOCK.content.keywords.illusionary,
  hintTitle: game.i18n.localize(
    "TERIOCK.DIALOGS.Select.IllusionLevel.hintTitle",
  ),
  initial: "minor",
  label: game.i18n.localize("TERIOCK.DIALOGS.Select.IllusionLevel.label"),
  other: true,
  title: game.i18n.localize("TERIOCK.DIALOGS.Select.IllusionLevel.title"),
});
let dc = "none";
if (chosenIllusionLevel === "minor") {
  dc = 6;
}
if (chosenIllusionLevel === "full") {
  dc = 12;
}
if (chosenIllusionLevel === "greater") {
  dc = 18;
}
const buttons = data.execution.buttons.filter(
  (b) => b.dataset?.action === "feat" && b.dataset?.attribute === "int",
);
if (typeof dc === "number") {
  for (const b of buttons) {
    b.dataset.threshold = `${dc - 2 * data.execution.heightened}`;
  }
}
for (let i = 0; i < data.execution.rolls.length; i++) {
  const r = data.execution.rolls[i];
  if (r.styles.dice.classes === "feat") {
    if (typeof dc === "number") {
      const newRoll = new game.teriock.Roll(
        `${dc} - 2 * @h`,
        data.execution.rollData,
        {
          flavor: game.i18n.format(
            "TERIOCK.DIALOGS.Select.IllusionLevel.flavor",
            { level: illusionLevels[chosenIllusionLevel] },
          ),
          styles: {
            dice: {
              classes: "feat",
            },
            total: {
              classes: "feat",
              icon: TERIOCK.display.icons.interaction.feat,
            },
          },
        },
      );
      await newRoll.evaluate();
      data.execution.rolls[i] = newRoll;
    } else {
      data.execution.rolls.pop();
    }
  }
}
