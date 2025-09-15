/**
 * Prepares a single tradecraft's bonus value.
 * Calculates the total bonus based on proficiency and extra modifiers.
 * @param {TeriockBaseActorModel} actorData - The actor's base data system object.
 * @param {string} key - The tradecraft key to prepare.
 * @returns {void} Modifies the system object in place.
 * @private
 */
function _prepareTradecraft(actorData, key) {
  const tc = actorData.tradecrafts[key];
  tc.bonus = (tc.proficient ? actorData.scaling.p : 0) + tc.extra;
}

/**
 * Prepares all tradecraft bonuses for the actor.
 * Iterates through all tradecrafts and calculates their bonus values.
 * @param {TeriockBaseActorModel} actorData - The actor's base data system object.
 * @returns {void} Modifies the system object in place.
 * @private
 */
export function _prepareTradecrafts(actorData) {
  for (const key of Object.keys(actorData.tradecrafts)) {
    _prepareTradecraft(actorData, key);
  }
}
