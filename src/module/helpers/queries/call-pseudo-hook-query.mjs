/**
 * Query that calls a pseudo-hook.
 * @param {Teriock.QueryData.CallPseudoHook} queryData
 * @param {{timeout?: number}} timeout
 * @returns {Promise<void>}
 */
export default async function callPseudoHookQuery(queryData, { timeout }) {
  const doc = /** @type {TeriockActor|TeriockItem|TeriockEffect} */ await foundry.utils.fromUuid(queryData.uuid);
  if (doc) {
    await doc.hookCall(queryData.pseudoHook, queryData.data);
  }
}
