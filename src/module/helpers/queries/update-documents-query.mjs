/**
 * Query that updates documents. Since query data has to be JSON serializable, this will only spit out the UUIDs of
 * updated documents instead of the documents themselves.
 * @param {Teriock.QueryData.UpdateDocuments} queryData
 * @param {{_timeout?: number}} timeout
 * @returns {Promise<UUID<Document>[]>}
 */
export default async function updateDocumentsQuery(queryData, { _timeout }) {
  const Cls = foundry.utils.getDocumentClass(queryData.documentName);
  const docs = await Cls.updateDocuments(
    queryData.updates,
    queryData.operation,
  );
  return docs.map((d) => d?.uuid || d);
}
