import TeriockActor from "../../../../../documents/actor.mjs";

import { toCamelCase } from "../../../../../helpers/string.mjs";

/**
 * Prepares the species attributes.
 *
 * @param {TeriockBaseActorData} actorData - The actor's base data system object.
 * @returns {void} Modifies the system object in place.
 * @private
 */
export function _prepareSpecies(actorData) {
  actorData.namedSize = TeriockActor.toNamedSize(actorData.size);
  actorData.species = new Set();
  actorData.parent.itemTypes?.power
    .filter((p) => p.system.type === "species")
    .map((p) => {
      actorData.species.add(toCamelCase(p.name));
    });
}
