/**
 * Pay the costs necessary for using an ability.
 *
 * @param {AbilityRollConfig} rollConfig - Configurations for this ability usage.
 * @returns {Promise<void>}
 */
export async function _payCosts(rollConfig) {
  const mpSpent = rollConfig.useData.costs.mp;
  const hpSpent = rollConfig.useData.costs.hp;
  const gpSpent = rollConfig.useData.costs.gp;
  const actor = rollConfig.useData.actor;
  const updates = {};
  if (rollConfig.abilityData.interaction === "attack") {
    updates["system.attackPenalty"] = actor.system.attackPenalty - 3;
  }
  if (
    rollConfig.abilityData.maneuver === "reactive" &&
    rollConfig.abilityData.executionTime === "r1"
  ) {
    updates["system.hasReaction"] = false;
  }
  if (mpSpent > 0) {
    updates["system.mp.value"] = Math.max(
      actor.system.mp.value - mpSpent,
      actor.system.mp.min ?? 0,
    );
  }
  if (hpSpent > 0) {
    updates["system.hp.value"] = Math.max(
      actor.system.hp.value - hpSpent,
      actor.system.hp.min ?? 0,
    );
  }
  if (gpSpent > 0) {
    await actor.takePay(gpSpent);
  }
  console.log(updates);
  await actor.update(updates);
}
