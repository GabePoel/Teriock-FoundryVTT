import { ThresholdRoll } from "../../dice/rolls/_module.mjs";

/**
 * @template {MixinBase} T
 * @param {T} Base
 */
export default function ThresholdDataMixin(Base) {
  /** @mixin */
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
