const data = /** @type {Teriock.HookData.TakeNumeric} */ scope.data;
if (data.amount >= actor.system.hp.value + actor.system.hp.temp) {
  const carry = data.amount - actor.system.hp.value - actor.system.hp.temp;
  const treeformConsequences = actor.consequences.filter(
    (c) =>
      c.name ===
      game.i18n.format("TERIOCK.SYSTEMS.Ability.EXECUTION.effectName", {
        name: TERIOCK.reference.abilities.treeformBall,
      }),
  );
  for (const c of treeformConsequences) {
    await c.system.expire();
  }
  data.cancel = true;
  await actor.system.takeDamage(carry);
}
