if (actor) {
  if (actor.system.offense.piercing.value === "av0") {
    await actor.update({
      "system.offense.piercing.raw": 0,
    });
  } else {
    await actor.update({
      "system.offense.piercing.raw": 1,
    });
  }
  if (actor.system.offense.piercing.value === "av0") {
    ui.notifications.success("TERIOCK.MACROS.ToggleUb.enabled", {
      localize: true,
      format: { name: actor.name },
    });
  } else {
    ui.notifications.info("TERIOCK.MACROS.ToggleAv0.disabled", {
      localize: true,
      format: { name: actor.name },
    });
  }
} else {
  ui.notifications.warn("TERIOCK.DIALOGS.Common.ERRORS.noActor", {
    localize: true,
  });
}
