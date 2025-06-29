const { fields } = foundry.data;
const { TypeDataModel } = foundry.abstract;
import { ChildDataMixin } from "../../mixins/child-mixin.mjs";
import { _shouldExpire, _expire } from "./methods/_expiration.mjs";

export default class TeriockBaseEffectData extends ChildDataMixin(TypeDataModel) {
  /** @inheritdoc */
  static get metadata() {
    return {
      ...super.metadata,
      type: "base",
    };
  }

  /** @override */
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

  get suppressed() {
    if (this.parent.parent?.documentName === "Item") {
      return this.parent.parent?.system.disabled;
    }
    return false;
  }

  /**
   * @returns {boolean}
   */
  shouldExpire() {
    return _shouldExpire(this);
  }

  /**
   * @returns {Promise<void>}
   */
  async expire() {
    return await _expire(this);
  }

  /**
   * @returns {Promise<void>}
   */
  async checkExpiration() {
    if (this.shouldExpire()) {
      await this.expire();
    }
  }
}
