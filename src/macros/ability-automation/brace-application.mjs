const toRemove = [];
actor.consequences.map((c) => {
  if (c.name === "Brace Effect") {
    toRemove.push(c.id);
  }
});
if (toRemove.length > 0) {
  await actor?.deleteEmbeddedDocuments("ActiveEffect", toRemove);
}

const dieSize = actor?.flags?.teriockEffect?.braceDieSize || 6;

const ability = actor.abilities.find((a) => a.name === "Brace");

let formula = `1d${dieSize}`;
if (ability?.system.competence.proficient) {
  formula = `(1 + @p)d${dieSize}`;
} else if (ability?.system.competence.fluent) {
  formula = `(1 + @f)d${dieSize}`;
}

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
