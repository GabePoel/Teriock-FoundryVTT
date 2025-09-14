if (actor.isDamaged && !actor.statuses.has("burned")) {
  await actor.system.takeNormalHeal({
    consumeStatDice: false,
    title: "Regenerating",
  });
}
