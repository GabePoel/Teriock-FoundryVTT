import { objectMap } from "../../helpers/utils.mjs";

/**
 * @import { DatabaseCreateOperation } from "@common/abstract/_types.mjs";
 */

/**
 * A mixin that adds the ability to embed Pseudo-Documents.
 * @template {AnyConstructor} T
 * @param {T} Base
 * @returns {MixinResult<T, PseudoCollectionsData>}
 */
export default function PseudoCollectionsDataMixin(Base) {
  /**
   * @mixin
   */
  class PseudoCollectionsData extends Base {
    _initialize(options) {
      super._initialize(options);
      Object.defineProperty(this, "pseudoCollections", {
        configurable: true,
        value: Object.seal(objectMap(this.metadata?.pseudos ?? {}, v => foundry.utils.getProperty(this, v))),
        writable: false,
      });
    }

    /**
     * Create Pseudo-Documents within this.
     * @param {string} embeddedName
     * @param {object[]} data
     * @param {DatabaseCreateOperation} operation
     * @returns {Promise<void>}
     */
    async createPseudoDocuments(embeddedName, data = [], operation = {}) {
      const Cls = this.getEmbeddedCollection(embeddedName)?.documentClass;
      if (!Cls) { throw new Error(`Invalid pseudo-document name`); }
      await Cls.createDocuments(data, { ...operation, parent: this });
    }

    /** @inheritDoc */
    getEmbeddedCollection(embeddedName) {
      const pseudoPath = (this.metadata?.pseudos ?? {})[embeddedName];
      return foundry.utils.getProperty(this, pseudoPath) ?? super.getEmbeddedCollection?.(embeddedName);
    }
  }

  return PseudoCollectionsData;
}
