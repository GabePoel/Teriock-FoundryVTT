if (actor) {
  if (actor.system.offense.piercing === "av0") {
    await actor.update({
      "system.offense.piercing": "none",
    });
  } else {
    await actor.update({
      "system.offense.piercing": "av0",
    });
  }
  if (actor.system.offense.piercing === "av0") {
    ui.notifications.success(`AV0 piercing enabled for ${actor.name}.`);
  } else {
    ui.notifications.info(`AV0 piercing disabled for ${actor.name}.`);
  }
} else {
  ui.notifications.warn("No actor selected.");
}
