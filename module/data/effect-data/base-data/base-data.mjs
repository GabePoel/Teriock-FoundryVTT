// Allows for typing within mixin.
/** @import { ActiveEffectData } from "@common/documents/_types.mjs"; */
const { fields } = foundry.data;
const { TypeDataModel } = foundry.abstract;
import { ChildDataMixin } from "../../mixins/child-mixin.mjs";
import { _shouldExpire, _expire } from "./methods/_expiration.mjs";

/**
 * @extends {ActiveEffectData}
 */
export default class TeriockBaseEffectData extends ChildDataMixin(TypeDataModel) {
  /** @override */
  static defineSchema() {
    const commonData = super.defineSchema();
    return {
      ...commonData,
      forceDisabled: new fields.BooleanField({
        initial: false,
        label: "Force Disabled",
      }),
      deleteOnExpire: new fields.BooleanField({
        initial: false,
        label: "Delete On Expire",
      }),
    };
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
      console.log(`${this.parent.name} should expire.`);
      await this.expire();
    } else {
      console.log(`${this.parent.name} should not expire.`);
    }
  }
}
