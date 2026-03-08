import { massUpdate } from "../utils.mjs";

/**
 * Query that gets the {@link TeriockUser} to reset attack penalties and templates.
 * @param {Teriock.QueryData.ResetAttackPenalties} queryData
 * @param {{_timeout?: number}} timeout
 * @returns {Promise<void>}
 */
export default async function resetAttackPenaltiesQuery(
  queryData,
  { _timeout },
) {
  await canvas.scene.deleteEmbeddedDocuments(
    "MeasuredTemplate",
    canvas.scene.templates
      .filter((t) => t.getFlag("teriock", "deleteOnTurnChange"))
      .map((t) => t.id),
  );
  const attackPenaltyUpdates = queryData.actorUuids.map((uuid) => {
    return { uuid, "system.combat.attackPenalty": 0 };
  });
  await massUpdate("Actor", attackPenaltyUpdates);
}
