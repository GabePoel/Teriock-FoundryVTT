const { fields } = foundry.data;
const { TypeDataModel } = foundry.abstract;
import { ChildDataMixin } from "../../mixins/child-mixin.mjs";
import { _expire, _shouldExpire } from "./methods/_expiration.mjs";

/**
 * Base effect data model for all effects.
 * Handles common effect functionality including expiration, suppression, and data management.
 * @extends {TypeDataModel}
 */
export default class TeriockBaseEffectData extends ChildDataMixin(TypeDataModel) {
  /**
   * Gets the metadata for the base effect data model.
   * @inheritdoc
   * @returns {object} The metadata object with base type information.
   */
  static get metadata() {
    return {
      ...super.metadata,
      type: "base",
    };
  }

  /**
   * Checks if the effect is suppressed.
   * Effects are suppressed if their parent item is disabled.
   * @returns {boolean} True if the effect is suppressed, false otherwise.
   */
  get suppressed() {
    if (this.parent.parent?.documentName === "Item") {
      return this.parent.parent?.system.disabled;
    }
    return false;
  }

  /**
   * Defines the schema for the base effect data model.
   * @override
   * @returns {object} The schema definition for the effect data.
   */
  static defineSchema() {
    const commonData = super.defineSchema();
    return {
      ...commonData,
      deleteOnExpire: new fields.BooleanField({
        initial: false,
        label: "Delete On Expire",
      }),
      updateCounter: new fields.BooleanField({
        initial: false,
        label: "Update Counter",
      }),
    };
  }

  /**
   * Checks if the effect should expire based on its current state.
   * @returns {boolean} True if the effect should expire, false otherwise.
   */
  shouldExpire() {
    return _shouldExpire(this);
  }

  /**
   * Expires the effect, removing it from the parent document.
   * @returns {Promise<void>} Promise that resolves when the effect is expired.
   */
  async expire() {
    return await _expire(this);
  }

  /**
   * Checks if the effect should expire and expires it if necessary.
   * @returns {Promise<void>} Promise that resolves when the expiration check is complete.
   */
  async checkExpiration() {
    if (this.shouldExpire()) {
      await this.expire();
    }
  }
}
