if (actor.isDrained) {
  await actor.system.takeNormalRevitalize({
    consumeStatDice: false,
    title: "Mana Regenerating",
  });
}
