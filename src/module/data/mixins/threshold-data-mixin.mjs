import { ThresholdRoll } from "../../dice/rolls/_module.mjs";

/**
 * @template {Constructor<UsableData>} T
 * @param {T} Base
 */
export default function ThresholdDataMixin(Base) {
  return (
    /**
     * @extends {UsableData}
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
  );
}
