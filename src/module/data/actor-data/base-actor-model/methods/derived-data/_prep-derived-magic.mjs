/**
 * Prepare derived magic.
 * @param {TeriockBaseActorData} actorData
 * @private
 */
export function _prepDerivedMagic(actorData) {
  actorData.magic.maxRotators.evaluate();
}
