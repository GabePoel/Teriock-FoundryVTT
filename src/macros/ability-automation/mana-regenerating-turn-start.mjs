if (actor.isDrained) {
  await actor.system.takeRevitalize({
    consumeStatDice: false,
    title: "Mana Regenerating",
  });
}
