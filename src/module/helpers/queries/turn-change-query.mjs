import { buildWriteOperation, consolidateWriteOperations } from "../utils.mjs";

/**
 * Query intended for the GM to handle all turn change operations in a single batched database write.
 * 1. Delete all regions that have the `deleteOnTurnChange` flag set.
 * 2. Reset all actors' attack penalties.
 * @param {Teriock.QueryData.TurnChange} queryData
 * @param {{_timeout?: number}} timeout
 * @returns {Promise<void>}
 */
export default async function turnChangeQuery(queryData, { _timeout }) {
  const indOps = await Promise.all(
    queryData.actorUuids.map(async uuid =>
      buildWriteOperation({
        action: "update",
        docData: { "system.combat.attackPenalty": 0 },
        uuid,
      }),
    ),
  );
  const conOps = consolidateWriteOperations(indOps.filter(Boolean));
  await foundry.documents.modifyBatch([
    {
      action: "delete",
      documentName: "Region",
      ids: canvas.scene?.regions.filter(t => t.getFlag("teriock", "deleteOnTurnChange")).map(t => t.id) ?? [],
      parent: canvas.scene,
    },
    ...conOps,
  ]);
}
