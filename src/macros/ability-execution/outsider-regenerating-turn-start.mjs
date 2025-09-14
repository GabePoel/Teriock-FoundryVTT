if (actor.isDamaged) {
  await actor.system.takeNormalHeal({
    consumeStatDice: false,
    title: "Outsider Regenerating",
  });
}
