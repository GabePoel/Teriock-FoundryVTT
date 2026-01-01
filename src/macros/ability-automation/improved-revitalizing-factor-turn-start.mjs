if (actor.isDrained && !actor.statuses.has("dead")) {
  await actor.system.takeRevitalize({
    consumeStatDice: false,
    title: "Improved Revitalizing Factor",
  });
}
