if (actor.isDrained) {
  await actor.system.takeNormalRevitalize({
    consumeStatDice: false,
    title: "Outsider Mana Regenerating",
  });
}
