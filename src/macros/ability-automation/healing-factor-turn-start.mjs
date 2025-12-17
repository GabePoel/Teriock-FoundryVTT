if (
  actor.isDamaged &&
  !actor.statuses.has("down") &&
  !actor.statuses.has("burned")
) {
  await actor.system.takeNormalHeal({
    consumeStatDice: false,
    title: "Healing Factor",
  });
}
