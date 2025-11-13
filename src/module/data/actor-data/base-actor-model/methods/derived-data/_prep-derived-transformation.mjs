/**
 * @param {TeriockBaseActorData} actorData
 * @private
 */
export function _prepDerivedTransformation(actorData) {
  if (actorData.transformation.effect) {
    actorData.transformation.image =
      actorData.transformation.effect.system.transformation.image;
  }
}
