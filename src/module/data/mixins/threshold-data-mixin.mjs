import { ThresholdRoll } from "../../dice/rolls/_module.mjs";

/**
 * @template {MixinBase} T
 * @param {T} Base
 */
export default function ThresholdDataMixin(Base) {
  /** @mixin */
  class ThresholdData extends Base {
    /** @inheritDoc */
    static parseEvent(event) {
      return ThresholdRoll.parseEvent(event);
    }
  }

  return ThresholdData;
}
