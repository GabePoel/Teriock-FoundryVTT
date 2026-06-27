/**
 * Query that causes a document or pseudo-document to be used.
 * @param {Teriock.Queries.UseData} queryData
 * @returns {Promise<void>}
 */
export default async function useQuery(queryData) {
  const doclike = await fromUuid(queryData.uuid);
  if (doclike) { await doclike.use(); }
}
