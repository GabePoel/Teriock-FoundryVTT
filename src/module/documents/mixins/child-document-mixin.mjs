import { mergeMetadata, mixClasses } from "../../utils/_module.mjs";
import { ChangeableDocumentMixin, HierarchyDocumentMixin } from "./_module.mjs";

/**
 * Mixin for common functions used across document classes embedded in actorsUuids.
 * @template {MixinBase} T
 * @param {T} Base
 */
export default function ChildDocumentMixin(Base) {
  /**
   * @mixes HierarchyDocument
   * @mixes ChangeableDocument
   * @mixin
   * @implements {Teriock.Functionality.Usable}
   */
  class ChildDocument extends mixClasses(Base, HierarchyDocumentMixin, ChangeableDocumentMixin) {
    /** @inheritDoc */
    static documentMetadata = mergeMetadata(super.documentMetadata, { child: true });

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
      this.actor?.system.postUpdate(userId);
    }

    /** @inheritDoc */
    _onDelete(options, userId) {
      super._onDelete(options, userId);
      this.actor?.system.postUpdate(userId);
    }

    /** @inheritDoc */
    _onUpdate(changed, options, userId) {
      super._onUpdate(changed, options, userId);
      const { childTypes } = this.system;
      if (!this.checkEditor(userId) || !childTypes) { return; }
      const invalid = this.subs.filter(s => !childTypes.includes(s.type));
      if (invalid.length) { this.deleteChildDocuments(this.documentName, invalid.map(s => s._id)); }
    }

    /** @inheritDoc */
    async toTooltip(data = {}, options = {}) {
      data.tips ??= this.system.getVisibleTips("tooltips");
      return super.toTooltip(data, options);
    }

    /** @inheritDoc */
    async use(options = {}) {
      await this.system.use(options);
    }
  }

  return ChildDocument;
}
