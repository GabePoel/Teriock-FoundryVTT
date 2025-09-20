/**
 * Prepare base defense.
 * @param {TeriockBaseActorModel} actorData
 * @private
 */
export function _prepBaseDefense(actorData) {
  actorData.defense = {
    av: {
      natural: 0,
      worn: 0,
    },
  };
}