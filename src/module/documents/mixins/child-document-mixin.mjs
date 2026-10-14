import { mixClasses } from "../../helpers/construction.mjs";
import { HierarchyDocumentMixin, UsableDocumentMixin } from "./_module.mjs";

/**
 * Mixin for common functions used across document classes embedded in actorsUuids.
 * @template {MixinBase} T
 * @param {T} Base
 */
export default function ChildDocumentMixin(Base) {
  /**
   * @mixes HierarchyDocument
   * @mixes UsableDocument
   * @mixin
   */
  class ChildDocument extends mixClasses(Base, UsableDocumentMixin, HierarchyDocumentMixin) {
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

    /** @inheritDoc */
    prepareDerivedData() {
      super.prepareDerivedData();
      if (this.isTop) { this.prepareChangeData(); }
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
