/**
 * Query that asks the {@link TeriockUser} if their effect should expire.
 * @param {Teriock.QueryData.InCombatExpiration} queryData
 * @param {{_timeout?: number}} timeout
 * @returns {Promise<void>}
 */
export default async function inCombatExpirationQuery(queryData, { _timeout }) {
  const effectUuid = queryData.effectUuid;
  const effect = await fromUuid(effectUuid);
  await effect.system.inCombatExpiration();
}
