/**
 * Query that gets the {@link TeriockUser} to advance game time.
 *
 * @param {Teriock.QueryData.ResetAttackPenalties} queryData
 * @param {{timeout?: number}} timeout
 * @returns {Promise<void>}
 */
export default async function resetAttackPenaltiesQuery(
  queryData,
  { _timeout },
) {
  for (const actorUuid of queryData.actorUuids) {
    const actor = await foundry.utils.fromUuid(actorUuid);
    if (actor.system.combat.attackPenalty !== 0) {
      await actor.update({ "system.combat.attackPenalty": 0 });
    }
  }
}
