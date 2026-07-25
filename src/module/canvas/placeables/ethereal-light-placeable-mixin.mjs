/**
 * @template {Constructor<PlaceableObject>} T
 * @param {T} Base
 */
export default function EtherealLightPlaceableMixin(Base) {
  return (
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
  );
}
