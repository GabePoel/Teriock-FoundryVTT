if (actor.isDamaged) {
  await actor.system.takeHeal({
    consumeStatDice: false,
    title: "Outsider Regenerating",
  });
}
