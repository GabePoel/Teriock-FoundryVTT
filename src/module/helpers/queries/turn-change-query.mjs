import { batchWrite } from "../../utils/_module.mjs";

/**
 * Query intended for the GM to handle all turn change operations in a single batched database write.
 * 1. Delete all regions in the combat's scene that have the `deleteOnTurnChange` flag set.
 * 2. Reset the given combatants' attack penalties, actions, and reactions.
 * @param {Teriock.Queries.TurnChangeData} queryData
 * @returns {Promise<void>}
 */
export default async function turnChangeQuery(queryData) {
  const scene = queryData.sceneUuid ? await fromUuid(queryData.sceneUuid) : canvas.scene;
  const regionIds = scene?.regions.filter(r => r.getFlag("teriock", "deleteOnTurnChange")).map(r => r.id) ?? [];
  await batchWrite([
    ...(regionIds.length ? [{ action: "delete", documentName: "Region", ids: regionIds, parent: scene }] : []),
    ...queryData.attackPenaltyUuids.map(uuid => ({ action: "update", docData: { "system.attackPenalty": 0 }, uuid })),
    ...queryData.actionUuids.map(uuid => ({
      action: "update",
      docData: { "system.actions": TERIOCK.CONFIG.combat.maxActions },
      uuid,
    })),
    ...queryData.reactionUuids.map(uuid => ({
      action: "update",
      docData: { "system.reactions": TERIOCK.CONFIG.combat.maxReactions },
      uuid,
    })),
  ]);
}
