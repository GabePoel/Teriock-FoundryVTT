/**
 * Prepare base defense.
 * @param {TeriockBaseActorData} actorData
 * @private
 */
export function _prepBaseDefense(actorData) {
  actorData.defense = {
    av: {
      natural: 0,
      value: 0,
      worn: 0,
    },
    ac: 10,
    bv: 0,
    cc: 10,
  };
}
