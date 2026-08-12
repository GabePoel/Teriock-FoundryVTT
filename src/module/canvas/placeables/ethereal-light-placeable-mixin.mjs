/**
 * @import { PlaceableObject } from "@client/canvas/placeables/_module.mjs";
 */

/**
 * @template {Constructor<PlaceableObject>} T
 * @param {T} Base
 * @returns {MixinResult<T, EtherealLightPlaceable>}
 */
export default function EtherealLightPlaceableMixin(Base) {
  /**
   * @mixin
   */
  class EtherealLightPlaceable extends Base {
    /**
     * Whether this is considered Ethereal.
     * @return {boolean}
     */
    get isEthereal() {
      return true;
    }
  }

  return EtherealLightPlaceable;
}
