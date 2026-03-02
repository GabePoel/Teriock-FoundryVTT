/**
 * Query that updates a document.
 * @param {Teriock.QueryData.Update} queryData
 * @param {{_timeout?: number}} timeout
 * @returns {Promise<void>}
 */
export default async function updateQuery(queryData, { _timeout }) {
  const doc = await fromUuid(queryData.uuid);
  await doc?.update(queryData.data);
}
