/**
 * Query that fires a trigger event.
 * @param {Teriock.Queries.FireTriggerData} queryData
 * @returns {Promise<void>}
 */
export default async function fireTriggerQuery(queryData) {
  const doc = await fromUuid(queryData.uuid);
  await doc?.fireTrigger(queryData.trigger, queryData.scope);
}
