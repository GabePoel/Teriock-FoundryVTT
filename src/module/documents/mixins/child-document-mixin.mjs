import { mixClasses } from "../../utils/_module.mjs";
import { HierarchyDocumentMixin } from "./_module.mjs";

/**
 * Mixin for common functions used across document classes embedded in actorsUuids.
 * @template {MixinBase} T
 * @param {T} Base
 */
export default function ChildDocumentMixin(Base) {
  /**
   * @mixes HierarchyDocument
   * @mixin
   * @implements {Teriock.Functionality.Usable}
   */
  class ChildDocument extends mixClasses(Base, HierarchyDocumentMixin) {
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
     * Changes to this document's data that were applied during preparation.
     * @type {object}
     */
    overrides = this.overrides ?? {};

    /**
     * Checks if the document is suppressed.
     * @returns {boolean}
     */
    get isSuppressed() {
      return this.system.isSuppressed || super.isSuppressed;
    }

    /**
     * Clear or replace properties not automatically reset by upstream initialization.
     * @protected
     */
    _clearData() {
      this.overrides = {};
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
    prepareBaseData() {
      this._clearData();
      super.prepareBaseData();
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
