import TeriockActor from "../../../../../documents/actor.mjs";

/**
 * Prepares the species attributes.
 *
 * @param {TeriockBaseActorModel} actorData - The actor's base data system object.
 * @returns {void} Modifies the system object in place.
 * @private
 */
export function _prepDerivedSpecies(actorData) {
  actorData.namedSize = TeriockActor.toNamedSize(actorData.size);
}
