/**
 * @import { PlaceableObject } from "@client/canvas/placeables/_module.mjs";
 */

/**
 * @template {MixinBase<typeof PlaceableObject>} T
 * @param {T} Base
 * @category Ethereal
 */
export default function EtherealLightPlaceableMixin(Base) {
  /** @mixin */
  class EtherealLightPlaceable extends Base {
    /**
     * Whether this is considered Ethereal.
     * @returns {boolean}
     */
    get isEthereal() {
      return true;
    }
  }

  return EtherealLightPlaceable;
}
