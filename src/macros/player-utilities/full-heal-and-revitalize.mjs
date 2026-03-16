if (actor) {
  // Set HP and MP to max.
  await actor.system.partialReset({
    hp: true,
    hpDice: true,
    mp: true,
    mpDice: true,
    hacks: true,
    combat: true,
  });
  ui.notifications.success("TERIOCK.MACROS.FullHeal.success", {
    localize: true,
    format: { name: actor.name },
  });
} else {
  ui.notifications.warn("TERIOCK.DIALOGS.Common.ERRORS.noActor", {
    localize: true,
  });
}
