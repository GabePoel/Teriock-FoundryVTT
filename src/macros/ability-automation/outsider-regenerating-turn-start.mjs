if (actor.isDamaged) {
  await actor.system.takeHeal({
    consumeStatDice: false,
    title: game.i18n.localize("TERIOCK.TERMS.Abilities.outsiderRegenerating"),
  });
}
