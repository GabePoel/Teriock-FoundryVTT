/**
 * Make sure trackers that depend on other trackers are applied.
 * @param {TeriockBaseActorModel} actorData
 * @private
 */
export function _prepDerivedTrackers(actorData) {
  for (const uuid of actorData.trackers.allured) {
    if (!actorData.trackers.bound.includes(uuid)) {
      actorData.trackers.bound.push(uuid);
    }
  }
}
