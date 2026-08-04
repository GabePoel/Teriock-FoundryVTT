/**
 * @import { PlaceableObject } from "@client/canvas/placeables/_module.mjs";
 */

/**
 * @template {Constructor<PlaceableObject>} T
 * @param {T} Base
 */
export default function EtherealLightPlaceableMixin(Base) {
  /**
   * @extends {PlaceableObject}
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
