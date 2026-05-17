/**
 * @param {typeof WorldCollection} Base
 */
export default function BaseWorldCollectionMixin(Base) {
  return (
    /**
     * @template TeriockDocument
     * @extends {WorldCollection<TeriockDocument>}
     * @mixin
     */
    class BaseWorldCollection extends Base {
      /**
       * The documents that the user is an owner of.
       * @returns {TeriockDocument[]}
       */
      get owned() {
        return this.contents.filter(d => d.isOwner);
      }
    }
  );
}
