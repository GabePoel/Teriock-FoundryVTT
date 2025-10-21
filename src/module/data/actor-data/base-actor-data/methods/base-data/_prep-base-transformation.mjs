/**
 *
 * @param {TeriockBaseActorData} actorData
 * @private
 */
export function _prepBaseTransformation(actorData) {
  const effect = /** @type {TeriockConsequence} */ actorData.parent.effects.get(
    actorData.transformation.primary,
  );
  actorData.transformation.effect = effect || null;
  actorData.transformation.image = null;
  actorData.transformation.species = [];
  actorData.transformation.level = "minor";
  actorData.transformation.suppression = {
    bodyParts: false,
    equipment: false,
    fluencies: false,
    ranks: false,
  };
  if (effect) {
    actorData.transformation.image = effect.system.transformation.image;
    actorData.transformation.level = effect.system.transformation.level;
    actorData.transformation.species = actorData.parent.species.filter((s) =>
      effect.system.transformation.species.includes(s.id),
    );
    actorData.transformation.suppression = foundry.utils.deepClone(
      effect.system.transformation.suppression,
    );
  }
}
