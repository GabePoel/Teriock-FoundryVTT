if (
  actor.isDamaged &&
  !actor.statuses.has("down") &&
  !actor.statuses.has("burned")
) {
  await actor.system.takeHeal({
    consumeStatDice: false,
    title: game.i18n.localize("TERIOCK.TERMS.Abilities.healingFactor"),
  });
}
