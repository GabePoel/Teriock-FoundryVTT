/**
 * Prepares a single tradecraft's bonus value.
 * Calculates the total bonus based on proficiency and extra modifiers.
 * @param {TeriockBaseActorData} system - The actor's base data system object.
 * @param {string} key - The tradecraft key to prepare.
 * @returns {void} Modifies the system object in place.
 * @private
 */
function _prepareTradecraft(system, key) {
  const tc = system.tradecrafts[key];
  tc.bonus = (tc.proficient ? system.p : 0) + tc.extra;
}

/**
 * Prepares all tradecraft bonuses for the actor.
 * Iterates through all tradecrafts and calculates their bonus values.
 * @param {TeriockBaseActorData} system - The actor's base data system object.
 * @returns {void} Modifies the system object in place.
 * @private
 */
export function _prepareTradecrafts(system) {
  for (const key of Object.keys(system.tradecrafts)) {
    _prepareTradecraft(system, key);
  }
}
