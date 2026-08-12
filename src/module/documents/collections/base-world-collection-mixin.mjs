/**
 * @import { WorldCollection } from "@client/documents/abstract/_module.mjs";
 */

/**
 * @template {Constructor<WorldCollection>} T
 * @param {T} Base
 * @returns {MixinResult<T, BaseWorldCollection>}
 */
export default function BaseWorldCollectionMixin(Base) {
  /**
   * @template TeriockDocument
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

  return BaseWorldCollection;
}
