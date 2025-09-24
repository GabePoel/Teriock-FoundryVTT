/**
 * Bound actor HP and MP.
 * @param {TeriockBaseActorModel} actorData
 * @private
 */
export function _prepDerivedHpMp(actorData) {
  actorData.hp.max -= actorData.hp.morganti;
  actorData.mp.max -= actorData.mp.morganti;
  actorData.hp.value = Math.min(
    Math.max(actorData.hp.value, actorData.hp.min),
    actorData.hp.max,
  );
  actorData.mp.value = Math.min(
    Math.max(actorData.mp.value, actorData.mp.min),
    actorData.mp.max,
  );
  actorData.hp.temp = Math.max(0, actorData.hp.temp);
  actorData.mp.temp = Math.max(0, actorData.mp.temp);
}
