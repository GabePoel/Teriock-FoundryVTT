if (actor) {
  await actor.update({ "system.offense.sb": !actor.system.offense.sb });
  if (actor.system.offense.sb)
    ui.notifications.success("TERIOCK.MACROS.ToggleSb.enabled", { format: { name: actor.name }, localize: true });
  else ui.notifications.info("TERIOCK.MACROS.ToggleSb.disabled", { format: { name: actor.name }, localize: true });
} else {
  ui.notifications.warn("TERIOCK.DIALOGS.Common.ERRORS.noActor", { localize: true });
}
