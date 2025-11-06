/**
 * Ensures stats are defined.
 * @param {TeriockBaseActorData} actorData
 * @private
 */
export function _prepDerivedStats(actorData) {
  actorData.curses.value = actorData.parent.powers.filter(
    (p) => p.system.type === "curse",
  ).length;
}
