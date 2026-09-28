import { batchWrite } from "../utils.mjs";

/**
 * Query intended for the GM to handle all turn change operations in a single batched database write.
 * 1. Delete all regions that have the `deleteOnTurnChange` flag set.
 * 2. Reset all actors' attack penalties.
 * @param {Teriock.Queries.TurnChangeData} queryData
 * @returns {Promise<void>}
 */
export default async function turnChangeQuery(queryData) {
  await batchWrite([{
    action: "delete",
    documentName: "Region",
    ids: canvas.scene?.regions.filter(t => t.getFlag("teriock", "deleteOnTurnChange")).map(t => t.id) ?? [],
    parent: canvas.scene,
  }, ...queryData.actorUuids.map(uuid => ({ action: "update", docData: { "system.combat.attackPenalty": 0 }, uuid }))]);
}
