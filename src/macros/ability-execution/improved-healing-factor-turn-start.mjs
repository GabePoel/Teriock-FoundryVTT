if (actor.isDamaged && !actor.statuses.has("dead") && !actor.statuses.has("burned")) {
  await actor.system.takeNormalHeal({
    consumeStatDice: false,
    title: "Improved Healing Factor",
  });
}
