const { Actor } = foundry.documents;

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
    canvas.scene.templates.contents
      .filter(
        /** @param {MeasuredTemplateDocument} */ (t) =>
          t.getFlag("teriock", "deleteOnTurnChange"),
      )
      .map(/** @param {MeasuredTemplateDocument} */ (t) => t.id),
  );
  const actorIds = queryData.actorUuids.filter((uuid) =>
    uuid.startsWith("Actor"),
  );
  const idActors = actorIds.map((id) => fromUuidSync(id));
  await Actor.implementation.updateDocuments(
    idActors.map((a) => {
      return {
        _id: a.id,
        "system.combat.attackPenalty": 0,
      };
    }),
  );
  const actorUuids = queryData.actorUuids.filter(
    (uuid) => !uuid.startsWith("Actor"),
  );
  const actors = actorUuids.map((uuid) => fromUuidSync(uuid));
  await Promise.all(
    actors.map(async (a) => a.update({ "system.combat.attackPenalty": 0 })),
  );
}
