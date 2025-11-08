/**
 * Query that calls a pseudo-hook.
 * @param {Teriock.QueryData.CallPseudoHook} queryData
 * @param {{_timeout?: number}} timeout
 * @returns {Promise<void>}
 */
export default async function callPseudoHookQuery(queryData, { _timeout }) {
  const doc = await fromUuid(queryData.uuid);
  if (doc) {
    await doc.hookCall(queryData.pseudoHook, queryData.data);
  }
}
