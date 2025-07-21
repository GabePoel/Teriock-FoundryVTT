/**
 * Builds tags for the ability roll.
 *
 * @param {AbilityRollConfig} rollConfig - Configurations for this ability usage.
 * @private
 */
export function _buildTags(rollConfig) {
  const heightened = rollConfig.useData.modifiers.heightened;
  if (heightened > 0)
    rollConfig.chatData.system.tags.push(`Heightened ${heightened} Time${heightened === 1 ? "" : "s"}`);
  const mpSpent = rollConfig.useData.costs.mp;
  if (mpSpent > 0) rollConfig.chatData.system.tags.push(`${mpSpent} MP Spent`);
  const hpSpent = rollConfig.useData.costs.hp;
  if (hpSpent > 0) rollConfig.chatData.system.tags.push(`${hpSpent} HP Spent`);
  const gpSpent = rollConfig.useData.costs.gp;
  if (gpSpent > 0) rollConfig.chatData.system.tags.push(`${gpSpent} ₲ Spent`);
}
