if (actor.isDamaged && !actor.statuses.has("burned")) {
  await actor.system.takeHeal({
    consumeStatDice: false,
    title: "Regenerating",
  });
}
