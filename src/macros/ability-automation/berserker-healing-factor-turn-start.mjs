if (
  actor.statuses.has("hacked") &&
  !actor.statuses.has("dead") &&
  !actor.statuses.has("burned")
) {
  await actor.system.takeNormalHeal({
    noStatDice: true,
    title: "Berserker Healing Factor",
  });
}
