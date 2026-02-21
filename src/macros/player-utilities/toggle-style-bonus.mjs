if (actor) {
  await actor.update({
    "system.offense.sb": !actor.system.offense.sb,
  });
  if (actor.system.offense.sb) {
    ui.notifications.success(`Style bonus enabled for ${actor.name}.`);
  } else {
    ui.notifications.info(`Style bonus disabled for ${actor.name}.`);
  }
} else {
  ui.notifications.warn("TERIOCK.DIALOGS.Common.ERRORS.noActor", {
    localize: true,
  });
}
