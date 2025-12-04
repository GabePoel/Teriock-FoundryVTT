/**
 * Prepare derived detection.
 * @param {TeriockBaseActorModel} actorData
 * @private
 */
export function _prepDerivedDetection(actorData) {
  actorData.detection.hiding.evaluate();
  actorData.detection.perceiving.evaluate();
  if (actorData.parent.statuses.has("ethereal")) {
    actorData.senses.etherealLight = Math.max(
      actorData.light.dim || 0,
      actorData.light.dark || 0,
    );
  } else {
    actorData.senses.etherealLight = 0;
  }
}
