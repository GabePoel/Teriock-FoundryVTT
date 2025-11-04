import { prepareModifiableBase } from "../../../../shared/fields/modifiable.mjs";

/**
 * Prepare base attributes.
 * @param {TeriockBaseActorModel} actorData
 * @private
 */
export function _prepBaseAttributes(actorData) {
  for (const att of Object.keys(TERIOCK.index.attributes)) {
    prepareModifiableBase(actorData.attributes[att].score);
    prepareModifiableBase(actorData.attributes[att].passive);
  }
  prepareModifiableBase(actorData.size.number);
  prepareModifiableBase(actorData.weight.self);
}
