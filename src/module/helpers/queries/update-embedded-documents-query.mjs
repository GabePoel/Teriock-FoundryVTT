/**
 * Query that updates embedded documents.
 * @param {Teriock.QueryData.UpdateEmbeddedDocuments} queryData
 * @param {{_timeout?: number}} timeout
 * @returns {Promise<void>}
 */
export default async function updateEmbeddedDocumentsQuery(
  queryData,
  { _timeout },
) {
  const doc = await fromUuid(queryData.uuid);
  if (doc) {
    await doc.updateEmbeddedDocuments(
      queryData.embeddedName,
      queryData.updates,
    );
  }
}
