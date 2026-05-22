if (actor) {
  // Set HP and MP to max.
  await actor.system.partialReset({ combat: true, hacks: true, hp: true, hpDice: true, mp: true, mpDice: true });
  ui.notifications.success("TERIOCK.MACROS.FullHeal.success", { format: { name: actor.name }, localize: true });
} else {
  ui.notifications.warn("TERIOCK.DIALOGS.Common.ERRORS.noActor", { localize: true });
}
