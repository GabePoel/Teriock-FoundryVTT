if (actor.isDrained && !actor.statuses.has("down")) {
  await actor.system.takeRevitalize({
    consumeStatDice: false,
    title: "Revitalizing Factor",
  });
}
