import { buildWriteOperation, consolidateWriteOperations } from "../utils.mjs";

/**
 * Query that writes many documents.
 * @param {Teriock.Queries.MassWriteData} queryData
 * @returns {Promise<void>}
 */
export default async function massWriteQuery(queryData) {
  const indOps = await Promise.all(queryData.operations.map(async op => buildWriteOperation(op)));
  const conOps = consolidateWriteOperations(indOps.filter(Boolean));
  await foundry.documents.modifyBatch(conOps);
}
