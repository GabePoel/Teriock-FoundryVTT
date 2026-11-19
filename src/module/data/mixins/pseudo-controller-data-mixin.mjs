import { objectMap } from "../../utils/_module.mjs";

/**
 * @import { DatabaseCreateOperation } from "@common/abstract/_types.mjs";
 * @import { PseudoCollection } from "../pseudo-documents/collections/_module.mjs";
 */

/**
 * A mixin that adds the ability to embed Pseudo-Documents.
 * @template {MixinBase} T
 * @param {T} Base
 */
export default function PseudoControllerDataMixin(Base) {
  /** @mixin */
  class PseudoControllerData extends Base {
    /**
     * Collections of Pseudo-Documents embedded in this.
     * @returns {Record<string, PseudoCollection>}
     */
    get pseudoCollections() {
      return objectMap(this.metadata?.pseudos ?? {}, path => foundry.utils.getProperty(this, path));
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
      const path = this.metadata?.pseudos?.[embeddedName];
      return (path && foundry.utils.getProperty(this, path)) || super.getEmbeddedCollection?.(embeddedName);
    }
  }

  return PseudoControllerData;
}
