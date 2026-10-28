/**
 * Query that performs a batch of database operations. Since query data has to be JSON serializable, this will only spit
 * out the UUIDs of modified documents for each operation.
 * @param {Teriock.Queries.ModifyBatchData} queryData
 * @returns {Promise<UUID<Document>[][]>}
 * @category Delegation
 */
export default async function modifyBatchQuery(queryData) {
  const results = await foundry.documents.modifyBatch(queryData.operations);
  return results.map(docs => docs.map(d => d?.uuid ?? null));
}
