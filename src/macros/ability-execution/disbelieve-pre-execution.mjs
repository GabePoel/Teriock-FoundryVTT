const data = /** @type {Teriock.HookData.UseAbility} */ scope.data;
const illusionLevels = {
  minor: "Minor Illusion",
  full: "Full Illusion",
  greater: "Greater Illusion",
};
const chosenIllusionLevel = await game.teriock.api.dialogs.selectDialog(
  illusionLevels,
  {
    label: "Level",
    hint: "If known, select the level of illusion you are attempting to disbelieve.",
    title: "Select Illusion Level",
    other: true,
    initial: "minor",
  },
);
let dc = "none";
if (chosenIllusionLevel === "minor") dc = 6;
if (chosenIllusionLevel === "full") dc = 12;
if (chosenIllusionLevel === "greater") dc = 18;
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
        `${dc} - 2 * @h`,
        data.rollConfig.useData.rollData,
        {
          flavor: illusionLevels[chosenIllusionLevel] + " DC",
          context: {
            diceClass: "feat",
            totalClass: "feat",
          },
        },
      );
      await newRoll.evaluate();
      data.rollConfig.chatData.rolls[i] = newRoll;
    } else {
      data.rollConfig.chatData.rolls.pop();
    }
  }
}
