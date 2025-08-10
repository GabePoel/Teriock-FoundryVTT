if (actor) {
  await actor.update({
    "system.sb": !actor.system.sb,
  });
  if (actor.system.sb) {
    ui.notifications.success(`Style bonus enabled for ${actor.name}.`);
  } else {
    ui.notifications.info(`Style bonus disabled for ${actor.name}.`);
  }
} else {
  ui.notifications.warn("No actor selected.");
}
