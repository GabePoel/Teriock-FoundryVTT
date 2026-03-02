/**
 * Query that calls a trigger.
 * @param {Teriock.QueryData.FireTrigger} queryData
 * @param {{_timeout?: number}} timeout
 * @returns {Promise<void>}
 */
export default async function fireTriggerQuery(queryData, { _timeout }) {
  const doc = await fromUuid(queryData.uuid);
  await doc?.hookCall(queryData.trigger, queryData.options);
}
