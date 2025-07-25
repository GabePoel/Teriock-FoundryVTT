import inCombatExpirationDialog from "../dialogs/in-combat-expiration-dialog.mjs";

/**
 * Query that asks the {@link TeriockUser} if their effect should expire.
 *
 * @param {Teriock.QueryInCombatExpirationData} queryData
 * @param {{timeout?: number}} timeout
 * @returns {Promise<void>}
 */
export default async function inCombatExpirationQuery(queryData, { timeout }) {
  const effectUuid = queryData.effectUuid;
  /** @type {TeriockConsequence} */
  const effect = await foundry.utils.fromUuid(effectUuid);
  await effect.system.inCombatExpiration();
}
