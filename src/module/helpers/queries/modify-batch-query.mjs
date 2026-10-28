/**
 * Query that performs a batch of database operations.
 * @param {Teriock.Queries.ModifyBatchData} queryData
 * @returns {Promise<void>}
 * @category Delegation
 */
export default async function modifyBatchQuery(queryData) {
  await foundry.documents.modifyBatch(queryData.operations);
}
