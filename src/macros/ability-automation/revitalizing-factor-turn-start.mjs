if (actor.isDrained && !actor.statuses.has("down")) {
  await actor.system.takeRevitalize({
    consumeStatDice: false,
    title: game.i18n.localize("TERIOCK.TERMS.Abilities.revitalizingFactor"),
  });
}
