if (actor) {
  if (actor.system.offense.piercing === "ub") {
    await actor.update({
      "system.offense.piercing": "none",
    });
  } else {
    await actor.update({
      "system.offense.piercing": "ub",
    });
  }
  if (actor.system.offense.piercing === "ub") {
    ui.notifications.success(`UB piercing enabled for ${actor.name}.`);
  } else {
    ui.notifications.info(`UB piercing disabled for ${actor.name}.`);
  }
} else {
  ui.notifications.warn("TERIOCK.DIALOGS.Common.ERRORS.noActor", {
    localize: true,
  });
}
