if (actor) {
  if (actor.system.offense.piercing.value === "ub") {
    await actor.update({
      "system.offense.piercing.raw": 0,
    });
  } else {
    await actor.update({
      "system.offense.piercing.raw": 2,
    });
  }
  if (actor.system.offense.piercing.value === "ub") {
    ui.notifications.success("TERIOCK.MACROS.ToggleUb.enabled", {
      localize: true,
      format: { name: actor.name },
    });
  } else {
    ui.notifications.info("TERIOCK.MACROS.ToggleUb.disabled", {
      localize: true,
      format: { name: actor.name },
    });
  }
} else {
  ui.notifications.warn("TERIOCK.DIALOGS.Common.ERRORS.noActor", {
    localize: true,
  });
}
