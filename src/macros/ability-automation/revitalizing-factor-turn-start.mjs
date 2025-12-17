if (actor.isDrained && !actor.statuses.has("down")) {
  await actor.system.takeNormalRevitalize({
    consumeStatDice: false,
    title: "Revitalizing Factor",
  });
}
