import { ThresholdRoll } from "../../dice/rolls/_module.mjs";

/**
 * @template {AnyConstructor} T
 * @param {T} Base
 * @returns {MixinResult<T, ThresholdData>}
 */
export default function ThresholdDataMixin(Base) {
  /**
   * @mixin
   */
  class ThresholdData extends Base {
    /** @inheritDoc */
    static parseEvent(event, source) {
      const parsed = super.parseEvent(event, source);
      parsed.data.edge = ThresholdRoll.parseEvent(event).edge;
      return parsed;
    }
  }

  return ThresholdData;
}
