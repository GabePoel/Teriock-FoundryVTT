/**
 * Query that updates embedded documents.
 *
 * @param {Teriock.QueryData.UpdateEmbeddedDocuments} queryData
 * @param {{timeout?: number}} timeout
 * @returns {Promise<void>}
 */
export default async function updateEmbeddedDocumentsQuery(
  queryData,
  { timeout },
) {
  const doc = await foundry.utils.fromUuid(queryData.uuid);
  if (doc) {
    await doc.updateEmbeddedDocuments(
      queryData.embeddedName,
      queryData.updates,
    );
  }
}
