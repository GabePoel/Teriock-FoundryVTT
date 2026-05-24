const illusionLevels = TERIOCK.config.illusion.level;
const chosenIllusionLevel = /** @type {Teriock.Keys.IllusionLevel | null} */ await tm.dialogs.selectDialog(
  illusionLevels,
  {
    hint: _loc("TERIOCK.DIALOGS.Select.IllusionLevel.hint"),
    hintHtml: await TextEditor.implementation.enrichHTML(
      (await teriock.fromIdentifier("keyword:illusionary")).text.content,
    ),
    hintTitle: _loc("TERIOCK.DIALOGS.Select.IllusionLevel.hintTitle"),
    initial: "minor",
    label: _loc("TERIOCK.DIALOGS.Select.IllusionLevel.label"),
    other: true,
    title: _loc("TERIOCK.DIALOGS.Select.IllusionLevel.title"),
  },
);
let dc = "none";
if (chosenIllusionLevel === "minor") dc = 6;
if (chosenIllusionLevel === "full") dc = 12;
if (chosenIllusionLevel === "greater") dc = 18;
const activations = scope.execution.activations.filter(a => a.type === "feat" && a.options.attribute === "int");
if (typeof dc === "number") {
  for (const a of activations) a._source.options.threshold = `${dc - 2 * scope.execution.heightened}`;
}
for (let i = 0; i < scope.execution.rolls.length; i++) {
  const r = scope.execution.rolls[i];
  if (r.styles.dice.classes === "feat") {
    if (typeof dc === "number") {
      const newRoll = new teriock.dice.rolls.BaseRoll(`${dc} - 2 * @h`, scope.execution.rollData, {
        flavor: _loc("TERIOCK.DIALOGS.Select.IllusionLevel.flavor", { level: illusionLevels[chosenIllusionLevel] }),
        styles: { dice: { classes: "feat" }, total: { classes: "feat", icon: TERIOCK.display.icons.interaction.feat } },
      });
      await newRoll.evaluate();
      scope.execution.rolls[i] = newRoll;
    } else {
      scope.execution.rolls.pop();
    }
  }
}
