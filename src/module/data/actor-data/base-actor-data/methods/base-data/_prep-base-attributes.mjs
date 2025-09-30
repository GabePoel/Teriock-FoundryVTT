import { prepareModifiableBase } from "../../../../shared/fields/modifiable.mjs";

/**
 * Prepare base attributes.
 * @param {TeriockBaseActorModel} actorData
 * @private
 */
export function _prepBaseAttributes(actorData) {
  prepareModifiableBase(actorData.size.number);
  prepareModifiableBase(actorData.weight.self);
}
