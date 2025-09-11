const data = /** @type {Teriock.HookData.TakeNumeric} */ scope.data;
if (data.amount >= actor.system.hp.value + actor.system.hp.temp) {
  const carry = data.amount - actor.system.hp.value - actor.system.hp.temp;
  if (actor.effectKeys.consequence.has("treeformBallEffect")) {
    const treeformConsequences = actor.consequences.filter((c) => c.name === "Treeform Ball Effect");
    for (const c of treeformConsequences) {
      await c.system.expire();
    }
    data.amount = 0;
    await actor.takeDamage(carry);
  }
}
