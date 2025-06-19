/** @import TeriockBaseActorData from "../../base-data.mjs"; */

/**
 * @param {TeriockBaseActorData} system
 * @returns {void}
 * @private
 */
export function _prepareSize(system) {
  const size = system.size;
  const namedSizes = {
    0: "Tiny",
    1: "Small",
    3: "Medium",
    5: "Large",
    10: "Huge",
    15: "Gargantuan",
    20: "Colossal",
  };
  const sizeKeys = Object.keys(namedSizes).map(Number);
  const filteredSizeKeys = sizeKeys.filter((key) => key <= size);
  const sizeKey = Math.max(...filteredSizeKeys, 0);
  const namedSize = namedSizes[sizeKey] || "Medium";
  system.namedSize = namedSize;
}

/**
 * @param {TeriockBaseActorData} system
 * @returns {void}
 * @private
 */
export function _prepareVision(system) {
  const actor = system.parent;
  if (actor.isOwner) {
    const tokens = actor?.getDependentTokens() || [];
    for (const token of tokens) {
      token?.updateVisionMode(actor?.statuses?.has("ethereal") ? "ethereal" : "basic");
    }
  }
}
