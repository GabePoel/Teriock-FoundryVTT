import { deriveModifiableDeterministic } from "../../../../shared/fields/modifiable.mjs";

/**
 * Prepare derived magic.
 * @param {TeriockBaseActorData} actorData
 * @private
 */
export function _prepDerivedMagic(actorData) {
  deriveModifiableDeterministic(actorData.magic.maxRotators, actorData.parent, {
    floor: true,
  });
}
