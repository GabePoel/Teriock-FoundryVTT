/**
 * Prepares the named size for the actor based on their numerical size value.
 * Maps numerical size values to named sizes (Tiny, Small, Medium, Large, Huge, Gargantuan, Colossal).
 * @param {TeriockBaseActorData} system - The actor's base data system object.
 * @returns {void} Modifies the system object in place.
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
  system.namedSize = namedSizes[sizeKey] || "Medium";
}
