const formula = scope.effect?.flags?.teriockEffect?.formula || "1d6";
const roll = new teriock.dice.rolls.BaseRoll(formula, actor.getRollData());
await roll.evaluate();
await roll.toMessage(
  {
    speaker: ChatMessage.getSpeaker({ actor: actor }),
    flavor: "Braced Temp HP",
    create: true,
  },
  {
    rollMode: game.settings.get("core", "rollMode"),
  },
);

await actor?.system.takeSetTempHp(roll.total);
