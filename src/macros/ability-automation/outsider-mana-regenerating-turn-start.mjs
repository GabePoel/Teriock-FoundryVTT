if (actor.isDrained) {
  await actor.system.takeRevitalize({
    consumeStatDice: false,
    title: game.i18n.localize(
      "TERIOCK.TERMS.Abilities.outsiderManaRegenerating",
    ),
  });
}
