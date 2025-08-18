const toRemove = [];
const abilities = actor.effectTypes?.ability || [];
const consequences = actor.effectTypes?.consequence || [];
consequences.map((c) => {
  if (c.name === "Brace Effect") {
    toRemove.push(c.id);
  }
});
if (toRemove.length > 0) {
  await actor.deleteEmbeddedDocuments("ActiveEffect", toRemove);
}

const dieSize = actor?.system?.abilityFlags.braceDieSize || 6;

const ability = abilities.find((a) => a.name === "Brace");

let formula = `1d${dieSize}`;
if (ability?.isProficient) {
  formula = `(1 + @p)d${dieSize}`;
} else if (ability?.isFluent) {
  formula = `(1 + @f)d${dieSize}`;
}

const roll = new game.teriock.Roll(formula, actor.getRollData());
await roll.evaluate();
await roll.toMessage({
  speaker: ChatMessage.getSpeaker({ actor: actor }),
  flavor: "Braced Temp HP",
  rollMode: game.settings.get("core", "rollMode"),
  create: true,
});

await actor.takeSetTempHp(roll.total);
