if (actor.isDrained) {
  await actor.system.takeRevitalize({
    consumeStatDice: false,
    title: "Outsider Mana Regenerating",
  });
}
