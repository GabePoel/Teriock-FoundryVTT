/**
 * Query that deletes documents. Since query data has to be JSON serializable, this will only spit out null.
 * @param {Teriock.Queries.DeleteDocumentsData} queryData
 * @returns {Promise<null[]>}
 */
export default async function deleteDocumentsQuery(queryData) {
  const Cls = foundry.utils.getDocumentClass(queryData.documentName);
  const docs = await Cls.deleteDocuments(queryData.ids, queryData.operation);
  return docs.map(_d => null);
}
