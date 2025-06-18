/** @import TeriockBaseActorData from "../../base-data.mjs"; */

/**
 * @param {TeriockBaseActorData} system 
 * @param {string} key
 * @returns {void}
 * @private
 */
function _prepareTradecraft(system, key) {
  const tc = system.tradecrafts[key];
  tc.bonus = (tc.proficient ? system.p : 0) + tc.extra;
}

/**
 * @param {TeriockBaseActorData} system 
 * @returns {void}
 * @private
 */
export function _prepareTradecrafts(system) {
  for (const key of Object.keys(system.tradecrafts)) {
    _prepareTradecraft(system, key);
  }
}
