import TeriockActor from "../../../../../documents/actor.mjs";

/**
 * Prepares the named size for the actor based on their numerical size value.
 * Maps numerical size values to named sizes (Tiny, Small, Medium, Large, Huge, Gargantuan, Colossal).
 *
 * @param {TeriockBaseActorData} actorData - The actor's base data system object.
 * @returns {void} Modifies the system object in place.
 * @private
 */
export function _prepareSize(actorData) {
  actorData.namedSize = TeriockActor.toNamedSize(actorData.size);
}
