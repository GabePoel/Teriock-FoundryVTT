import { prepareModifiableBase } from "../../../../shared/fields/modifiable.mjs";

/**
 * Prepare base magic.
 * @param {TeriockBaseActorData} actorData
 * @private
 */
export function _prepBaseMagic(actorData) {
  prepareModifiableBase(actorData.magic.maxRotators);
}
