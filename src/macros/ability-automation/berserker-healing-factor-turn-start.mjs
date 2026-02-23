if (
  actor.statuses.has("hacked") &&
  !actor.statuses.has("dead") &&
  !actor.statuses.has("burned")
) {
  await actor.system.takeHeal({
    noStatDice: true,
    title: game.i18n.localize("TERIOCK.TERMS.Abilities.berserkerHealingFactor"),
  });
}
