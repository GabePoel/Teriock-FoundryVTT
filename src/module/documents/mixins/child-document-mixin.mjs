import { mixClasses } from "../../helpers/construction.mjs";
import * as documentMixins from "./_module.mjs";

/**
 * Mixin for common functions used across document classes embedded in actorsUuids.
 * @param {typeof BaseDocument} Base
 */
export default function ChildDocumentMixin(Base) {
  return (
    /**
     * @mixes BaseDocument
     * @mixes CommonDocument
     * @mixes HierarchyDocument
     * @mixes PanelDocument
     * @mixes UsableDocument
     * @mixin
     */
    class ChildDocument
      extends mixClasses(Base, documentMixins.UsableDocumentMixin, documentMixins.HierarchyDocumentMixin)
    {
      /** @inheritDoc */
      static get documentMetadata() {
        return Object.assign(super.documentMetadata, { child: true });
      }

      /** @inheritDoc */
      static async validateRelationship(sup, sub) {
        if (!this.validateChildType(sup, sub)) { return false; }
        return super.validateRelationship(sup, sub);
      }

      /**
       * Treat this document as if it doesn't exist.
       * @returns {boolean}
       */
      get isEphemeral() {
        return this.system.makeEphemeral;
      }

      /**
       * Checks if the document is suppressed.
       * @returns {boolean}
       */
      get isSuppressed() {
        return super.isSuppressed || this.system.makeSuppressed || this.dependee?.active === false;
      }

      /** @inheritDoc */
      _onCreate(data, options, userId) {
        super._onCreate(data, options, userId);
        if (this.checkEditor(userId) && this.actor) { this.actor.system.postUpdate(); }
      }

      /** @inheritDoc */
      _onDelete(options, userId) {
        super._onDelete(options, userId);
        if (this.checkEditor(userId) && this.actor) { this.actor.system.postUpdate(); }
      }

      /**
       * Get all ActiveEffects that may apply to this document.
       * @yields {TeriockActiveEffect}
       * @returns {Generator<TeriockActiveEffect, void, void>}
       */
      *allApplicableEffects() {
        if (this.actor) {
          for (const effect of this.actor.allApplicableEffects()) { yield effect; }
        }
      }

      /**
       * Duplicates the document within its parent.
       * @param {object} [data]
       * @returns {Promise<ChildDocument>}
       */
      async duplicate(data = {}) {
        const copy = foundry.utils.mergeObject(this.toObject(true), {
          name: _loc("DOCUMENT.CopyOf", { name: this._source.name }),
          ...data,
        });
        copy._stats.duplicateSource = this.uuid;
        let copyDocument;
        if (this.isEmbedded) { copyDocument = await this.parent.createEmbeddedDocuments(this.documentName, [copy]); }
        else if (this.inCompendium) {
          copyDocument = await this.constructor.create(copy, { pack: this.compendium.collection });
        } else { copyDocument = await this.constructor.create(copy); }
        return copyDocument[0];
      }

      /** @inheritDoc */
      prepareDerivedData() {
        super.prepareDerivedData();
        if (this.isTop) { this.prepareChangeData(); }
      }

      /** @inheritDoc */
      async use(options = {}) {
        await this.system.use(options);
      }
    }
  );
}
