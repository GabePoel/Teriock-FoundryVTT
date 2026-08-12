import { mixClasses } from "../../helpers/construction.mjs";
import * as documentMixins from "./_module.mjs";

/**
 * @import { TeriockActiveEffect } from "../_module.mjs";
 */

/**
 * Mixin for common functions used across document classes embedded in actorsUuids.
 * @template {AnyConstructor} T
 * @param {T} Base
 * @returns {MixinResult<T, ChildDocument>}
 */
export default function ChildDocumentMixin(Base) {
  /**
   * @mixes HierarchyDocument
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
    static async validateRelationship(sup, sub, operation) {
      if (!this.validateChildType(sup, sub, operation)) { return false; }
      return super.validateRelationship(sup, sub, operation);
    }

    /**
     * Checks if the document is suppressed.
     * @returns {boolean}
     */
    get isSuppressed() {
      return this.system.isSuppressed || super.isSuppressed;
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
     * Disables the document.
     * @returns {Promise<void>}
     */
    async disable() {
      await this.update({ "system.disabled": true });
    }

    /**
     * Duplicates the document within its parent.
     * @param {object} [data]
     * @returns {Promise<ChildDocument>}
     */
    async duplicate(data = {}) {
      const copy = foundry.utils.mergeObject(this.toObject(true), {
        _stats: { duplicateSource: this.uuid },
        name: _loc("DOCUMENT.CopyOf", { name: this._source.name }),
        ...data,
      });
      let copyDocument;
      if (this.isEmbedded) { copyDocument = await this.parent.createEmbeddedDocuments(this.documentName, [copy]); }
      else if (this.inCompendium) {
        copyDocument = await this.constructor.create(copy, { pack: this.compendium.collection });
      } else { copyDocument = await this.constructor.create(copy); }
      return copyDocument[0];
    }

    /**
     * Enables the document.
     * @returns {Promise<void>}
     */
    async enable() {
      await this.update({ "system.disabled": false });
    }

    /** @inheritDoc */
    prepareDerivedData() {
      super.prepareDerivedData();
      if (this.isTop) { this.prepareChangeData(); }
    }

    /**
     * Toggles whether this document is disabled.
     * @returns {Promise<void>}
     */
    async toggleDisabled() {
      await this.update({ "system.disabled": !this.system.disabled });
    }

    /** @inheritDoc */
    async use(options = {}) {
      await this.system.use(options);
    }
  }

  return ChildDocument;
}
