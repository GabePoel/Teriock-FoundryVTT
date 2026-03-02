const formula = scope.effect.flags.teriockEffect.formula;
const roll = new game.teriock.Roll(formula, actor.getRollData());
await roll.evaluate();
await roll.toMessage(
  {
    speaker: ChatMessage.getSpeaker({ actor: actor }),
    flavor: "Braced Temp HP",
    rollMode: game.settings.get("core", "rollMode"),
    create: true,
  },
  {
    rollMode: game.settings.get("core", "rollMode"),
  },
);

await actor?.system.takeSetTempHp(roll.total);
