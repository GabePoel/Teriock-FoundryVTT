/**
 * Query that asks the {@link TeriockUser} if their effect should expire.
 * @param {Teriock.Queries.InCombatExpirationData} queryData
 * @returns {Promise<void>}
 */
export default async function inCombatExpirationQuery(queryData) {
  const effect = await fromUuid(queryData.uuid);
  await effect?.system.inCombatExpiration();
}
