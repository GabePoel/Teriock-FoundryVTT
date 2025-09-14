if (actor.isDrained && !actor.statuses.has("dead")) {
  await actor.system.takeNormalRevitalize({
    consumeStatDice: false,
    title: "Improved Revitalizing Factor",
  });
}
