/**
 * @import { DatabaseCreateOperation } from "@common/abstract/_types.mjs";
 */

/**
 * A mixin that adds the ability to embed Pseudo-Documents.
 * @template {AnyConstructor} T
 * @param {T} Base
 * @returns {MixinResult<T, PseudoControllerData>}
 */
export default function PseudoControllerDataMixin(Base) {
  /** @mixin */
  class PseudoControllerData extends Base {
    /** @inheritDoc */
    _configure(options = {}) {
      super._configure(options);
      const isDocument = this instanceof foundry.abstract.Document;
      const model = isDocument ? CONFIG[this.documentName]?.dataModels?.[this._source.type] : this;
      const collections = {};
      for (const [documentName, path] of Object.entries(model?.metadata?.pseudos ?? {})) {
        const field = model.schema.getField(isDocument ? path.slice("system.".length) : path);
        const source = foundry.utils.getProperty(this._source, path);
        collections[documentName] = new field.implementation(field.name, this, [], { field, source });
      }
      Object.defineProperty(this, "pseudoCollections", {
        configurable: true,
        value: Object.seal(collections),
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
      return this.pseudoCollections[embeddedName] ?? super.getEmbeddedCollection?.(embeddedName);
    }
  }

  return PseudoControllerData;
}
