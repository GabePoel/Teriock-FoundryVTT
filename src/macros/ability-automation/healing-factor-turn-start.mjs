if (
  actor.isDamaged &&
  !actor.statuses.has("down") &&
  !actor.statuses.has("burned")
) {
  await actor.system.takeHeal({
    consumeStatDice: false,
    title: "Healing Factor",
  });
}
