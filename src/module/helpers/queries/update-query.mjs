/**
 * Query that updates a document.
 * @param {Teriock.QueryData.Update} queryData
 * @param {{_timeout?: number}} timeout
 * @returns {Promise<void>}
 */
export default async function updateQuery(queryData, { _timeout }) {
  const doc = await foundry.utils.fromUuid(queryData.uuid);
  if (doc) {
    await doc.update(queryData.data);
  }
}
