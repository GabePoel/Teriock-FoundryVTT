/**
 * Query that creates documents. Since query data has to be JSON serializable, this will only spit out the UUIDs of
 * created documents instead of the documents themselves.
 * @param {Teriock.QueryData.CreateDocuments} queryData
 * @param {{_timeout?: number}} timeout
 * @returns {Promise<UUID<Document>>}
 */
export default async function createDocumentsQuery(queryData, { _timeout }) {
  const Cls = foundry.utils.getDocumentClass(queryData.documentName);
  const docs = await Cls.createDocuments(queryData.data, queryData.operation);
  return docs.map((d) => d?.uuid || d);
}
